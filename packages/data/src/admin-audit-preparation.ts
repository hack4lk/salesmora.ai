import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { auditArchiveCheckpointSchema, auditArchiveScopeSchema, type AuditArchiveScope } from '@salesmora/contracts';
import { buildAdminAuditArchive, verifyAdminAuditArchive, type AdminAuditArchive } from './admin-audit-archive';
import type { AdminAuditRecord } from './admin-audit';
import { AUDIT_WORKER_ROLE, AUDIT_VERIFIER_ROLE } from './runtime-roles';

export const AUDIT_PREPARATION_LIMITS = { maxEvents: 50_000, maxBytes: 32 * 1024 * 1024 } as const;
export const AUDIT_PREPARATION_DEADLINE_MS = 60_000;
export const AUDIT_PREPARATION_LOCK = 'admin:audit-preparation';

interface ArchiveJob {
  id: string;
  ledgerId: string;
  state: 'pending' | 'preparing' | 'prepared' | 'failed' | 'no_events';
  scope: AuditArchiveScope | null;
  attempts: number;
  checkpoint: unknown;
  checkpointSHA256: string | null;
}

export type AuditPreparationResult =
  | { state: 'no_events'; jobId: string }
  | { state: 'prepared'; jobId: string; attempt: number; archive: AdminAuditArchive };

export class AuditPreparationError extends Error {
  constructor(public readonly code: 'busy' | 'preparation_failed' | 'deadline_exceeded' | 'evidence_changed') {
    super(`Audit preparation failed: ${code}.`);
  }
}

export async function assertAuditWorkerRole(db: Knex | Knex.Transaction, verifier = false) {
  const readTables = verifier ? ['auditEvents', 'auditArchiveCopies', 'auditArchiveChecks'] :
    ['auditEvents', 'auditArchiveJobs', 'auditArchiveAttempts', 'auditArchiveCopies', 'auditArchiveCopyAttempts', 'auditArchiveChecks'];
  const updateTables = verifier ? [] : ['auditArchiveJobs', 'auditArchiveAttempts', 'auditArchiveCopies', 'auditArchiveCopyAttempts'];
  const insertTables = verifier ? ['auditArchiveChecks'] : updateTables;
  const { rows: [facts] } = await db.raw<{ rows: { valid: boolean }[] }>(`
    SELECT current_user = ? AND NOT r.rolsuper AND NOT r.rolcreatedb AND NOT r.rolcreaterole
      AND NOT r.rolreplication AND NOT r.rolbypassrls
      AND NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE member = r.oid)
      AND NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspowner = r.oid)
      AND NOT EXISTS (SELECT 1 FROM pg_database WHERE datdba = r.oid)
      AND NOT has_schema_privilege(current_user, 'public', 'CREATE')
      AND NOT has_schema_privilege(current_user, 'admin', 'CREATE')
      AND NOT has_database_privilege(current_user, current_database(), 'CREATE')
      AND NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('public', 'admin') AND c.relkind = 'S'
          AND has_sequence_privilege(current_user, c.oid, 'USAGE,SELECT,UPDATE')
      )
      AND NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('public', 'admin') AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
        AND (
          (n.nspname = 'public' AND (
            has_any_column_privilege(current_user, c.oid, 'SELECT,INSERT,UPDATE,REFERENCES')
            OR has_table_privilege(current_user, c.oid, 'DELETE,TRUNCATE,TRIGGER')))
          OR (n.nspname = 'admin' AND NOT (c.relname = ANY(?::text[]))
            AND (has_any_column_privilege(current_user, c.oid, 'SELECT,INSERT,UPDATE,REFERENCES')
              OR has_table_privilege(current_user, c.oid, 'DELETE,TRUNCATE,TRIGGER')))
          OR (n.nspname = 'admin' AND NOT (c.relname = ANY(?::text[]))
            AND has_any_column_privilege(current_user, c.oid, 'INSERT'))
          OR (n.nspname = 'admin' AND NOT (c.relname = ANY(?::text[]))
            AND has_any_column_privilege(current_user, c.oid, 'UPDATE'))
          OR (n.nspname = 'admin' AND (
            has_any_column_privilege(current_user, c.oid, 'REFERENCES')
            OR has_table_privilege(current_user, c.oid, 'DELETE,TRUNCATE,TRIGGER')))
        )
      ) AS valid
    FROM pg_roles r WHERE rolname = current_user`,
  [verifier ? AUDIT_VERIFIER_ROLE : AUDIT_WORKER_ROLE, readTables, insertTables, updateTables]);
  if (!facts?.valid) throw new Error('Audit worker requires its dedicated least-privilege database role.');
}

export async function buildDatabaseAdminAuditArchive(
  trx: Knex.Transaction, scope: AuditArchiveScope, checkDeadline: () => void,
) {
  async function* records() {
    let cursor = scope.previousCheckpoint?.throughSequence ?? '0';
    for (;;) {
      checkDeadline();
      const batch = await trx.withSchema('admin').table('auditEvents')
        .where('sequence', '>', cursor).where('sequence', '<=', scope.throughSequence)
        .orderBy('sequence', 'asc').limit(500).select<AdminAuditRecord[]>('*');
      checkDeadline();
      if (!batch.length) return;
      for (const record of batch) {
        checkDeadline();
        yield record;
        cursor = String(record.sequence);
      }
    }
  }
  const result = await buildAdminAuditArchive(records(), scope, AUDIT_PREPARATION_LIMITS);
  checkDeadline();
  verifyAdminAuditArchive(result.ndjson, result.checkpoint, scope, AUDIT_PREPARATION_LIMITS);
  checkDeadline();
  return result;
}

export async function prepareAdminAuditArchive(db: Knex, ledgerIdInput: string): Promise<AuditPreparationResult> {
  const ledgerId = ledgerIdInput.toLowerCase();
  // Validate before allocating a connection or recording a job.
  auditArchiveScopeSchema.parse({ ledgerId, previousCheckpoint: null, throughSequence: '1' });
  const connection = await db.client.acquireConnection();
  let locked = false;
  let reusable = true;
  const transaction = <T>(work: (trx: Knex.Transaction) => Promise<T>) =>
    db.transaction(async trx => {
      await trx.raw("SET LOCAL statement_timeout = '30s'");
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      return work(trx);
    }, { connection });
  try {
    await transaction(assertAuditWorkerRole);
    const lock = await db.raw<{ rows: { locked: boolean }[] }>(
      'SELECT pg_try_advisory_lock(hashtextextended(?, 0)) AS locked', [AUDIT_PREPARATION_LOCK],
    ).connection(connection);
    locked = lock.rows[0].locked;
    if (!locked) throw new AuditPreparationError('busy');

    const job = await transaction(async trx => {
      let existing = await trx.withSchema('admin').table<ArchiveJob>('auditArchiveJobs').where({ ledgerId }).first();
      // This step has no publisher; a second ledger must not fork the same database chain.
      if (await trx.withSchema('admin').table('auditArchiveJobs').whereNot({ ledgerId }).first('id')) {
        throw new Error('This database already has a different archive ledger ID.');
      }
      if (!existing || existing.state === 'no_events') {
        const head = await trx.withSchema('admin').table('auditEvents')
          .orderBy('sequence', 'desc').first<{ sequence: string }>('sequence');
        const scope = head ? auditArchiveScopeSchema.parse({
          ledgerId, previousCheckpoint: null, throughSequence: String(head.sequence),
        }) : null;
        const values = {
          state: scope ? 'pending' as const : 'no_events' as const,
          scope, updatedAt: trx.fn.now(),
        };
        if (existing) {
          await trx.withSchema('admin').table('auditArchiveJobs').where({ id: existing.id }).update(values);
          existing = { ...existing, ...values };
        } else {
          const [created] = await trx.withSchema('admin').table<ArchiveJob>('auditArchiveJobs')
            .insert({ id: randomUUID(), ledgerId, attempts: 0, ...values }).returning('*');
          existing = created;
        }
      }
      return existing;
    });
    if (job.state === 'no_events') return { state: 'no_events', jobId: job.id };
    const scope = auditArchiveScopeSchema.parse(job.scope);
    if (scope.ledgerId !== ledgerId || scope.previousCheckpoint !== null) {
      throw new Error('Preparation-only worker cannot advance or replace a published checkpoint.');
    }
    const previousSuccess = await transaction(trx => trx.withSchema('admin').table('auditArchiveAttempts')
      .where({ jobId: job.id, state: 'prepared' }).orderBy('attempt', 'desc')
      .first<{ checkpoint: unknown; checkpointSHA256: string }>('checkpoint', 'checkpointSHA256'));
    const expected = previousSuccess ? {
      checkpoint: auditArchiveCheckpointSchema.parse(previousSuccess.checkpoint),
      digest: previousSuccess.checkpointSHA256,
    } : null;
    const attempt = job.attempts + 1;
    const attemptId = randomUUID();
    await transaction(async trx => {
      await trx.withSchema('admin').table('auditArchiveAttempts')
        .where({ jobId: job.id, state: 'preparing' })
        .update({ state: 'interrupted', failureCode: 'worker_interrupted', finishedAt: trx.fn.now() });
      await trx.withSchema('admin').table('auditArchiveAttempts').insert({
        id: attemptId, jobId: job.id, attempt, state: 'preparing',
      });
      await trx.withSchema('admin').table('auditArchiveJobs').where({ id: job.id }).update({
        state: 'preparing', attempts: attempt, checkpoint: null, checkpointSHA256: null, updatedAt: trx.fn.now(),
      });
    });

    const deadline = Date.now() + AUDIT_PREPARATION_DEADLINE_MS;
    const checkDeadline = () => {
      if (Date.now() >= deadline) throw new AuditPreparationError('deadline_exceeded');
    };
    try {
      const archive = await transaction(async trx => {
        const result = await buildDatabaseAdminAuditArchive(trx, scope, checkDeadline);
        const verified = auditArchiveCheckpointSchema.parse(JSON.parse(result.checkpoint.toString()));
        if (expected && (expected.digest !== result.checkpointSHA256 ||
          expected.checkpoint.sha256 !== verified.sha256)) {
          throw new AuditPreparationError('evidence_changed');
        }
        return result;
      });
      const checkpoint = auditArchiveCheckpointSchema.parse(JSON.parse(archive.checkpoint.toString('utf8')));
      await transaction(async trx => {
        checkDeadline();
        await trx.withSchema('admin').table('auditArchiveAttempts').where({ id: attemptId })
          .update({ state: 'prepared', checkpoint, checkpointSHA256: archive.checkpointSHA256, finishedAt: trx.fn.now() });
        await trx.withSchema('admin').table('auditArchiveJobs').where({ id: job.id }).update({
          state: 'prepared', checkpoint, checkpointSHA256: archive.checkpointSHA256, updatedAt: trx.fn.now(),
        });
      });
      return { state: 'prepared', jobId: job.id, attempt, archive };
    } catch (error) {
      const failure = error instanceof AuditPreparationError ? error : new AuditPreparationError('preparation_failed');
      await transaction(async trx => {
        await trx.withSchema('admin').table('auditArchiveAttempts').where({ id: attemptId })
          .update({ state: 'failed', failureCode: failure.code, finishedAt: trx.fn.now() });
        await trx.withSchema('admin').table('auditArchiveJobs').where({ id: job.id }).update({
          state: 'failed', checkpoint: null, checkpointSHA256: null, updatedAt: trx.fn.now(),
        });
      });
      throw failure;
    }
  } finally {
    try {
      if (locked) {
        const result = await db.raw<{ rows: { unlocked: boolean }[] }>(
          'SELECT pg_advisory_unlock(hashtextextended(?, 0)) AS unlocked', [AUDIT_PREPARATION_LOCK],
        ).connection(connection);
        if (!result.rows[0].unlocked) throw new Error('Audit worker lost its preparation lock.');
      }
    } catch (error) {
      reusable = false;
      await db.client.destroyRawConnection(connection);
      throw error;
    } finally {
      if (reusable) await db.client.releaseConnection(connection);
    }
  }
}
