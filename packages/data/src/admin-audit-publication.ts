import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import {
  auditArchiveCheckpointSchema, auditArchiveScopeSchema, auditArchiveTargetSchema,
  auditRetainedCheckpointSchema, retainedAuditAnchor, type AuditArchiveScope,
  type AuditRetainedCheckpoint,
} from '@salesmora/contracts';
import {
  AUDIT_PREPARATION_LIMITS, AUDIT_PREPARATION_LOCK, assertAuditWorkerRole, buildDatabaseAdminAuditArchive,
} from './admin-audit-preparation';
import {
  deliverAdminAuditArchive, verifyStoredAdminAuditArchive, AuditArchiveDeliveryError,
  type AuditArchiveReader, type AuditArchiveWriter, type AuditArchiveLockReader, type AuditArchiveTarget,
} from './admin-audit-delivery';
import type { AuditBaselineStore } from './admin-audit-baseline';

export const AUDIT_PUBLICATION_BUDGET_MS = 120_000;
interface Copy {
  id: string;
  ledgerId: string;
  throughSequence: string;
  scope: AuditArchiveScope;
  target: AuditArchiveTarget;
  state: 'pending' | 'copying' | 'copied' | 'failed';
  attempts: number;
  checkpoint: unknown;
  checkpointSHA256: string | null;
}
export class AuditPublicationError extends Error {
  constructor(public readonly code: string) { super(`Audit publication failed: ${code}.`); }
}
function errorCode(error: unknown) {
  return error instanceof AuditPublicationError || error instanceof AuditArchiveDeliveryError ? error.code : 'operation_failed';
}

async function locked<T>(db: Knex, verifier: boolean, work: (
  transaction: <R>(callback: (trx: Knex.Transaction) => Promise<R>) => Promise<R>,
  signal: AbortSignal,
  checkBudget: () => void,
) => Promise<T>) {
  const deadline = Date.now() + AUDIT_PUBLICATION_BUDGET_MS;
  const signal = AbortSignal.timeout(AUDIT_PUBLICATION_BUDGET_MS);
  const checkBudget = () => {
    signal.throwIfAborted();
    if (Date.now() >= deadline) throw new AuditPublicationError('deadline_exceeded');
  };
  const connection = await db.client.acquireConnection();
  let held = false;
  let reusable = true;
  const transaction = <R>(callback: (trx: Knex.Transaction) => Promise<R>) => db.transaction(async trx => {
    await trx.raw("SET LOCAL statement_timeout = '30s'");
    await trx.raw("SET LOCAL lock_timeout = '5s'");
    return callback(trx);
  }, { connection });
  try {
    await transaction(trx => assertAuditWorkerRole(trx, verifier));
    const { rows } = await db.raw<{ rows: { held: boolean }[] }>(
      'SELECT pg_try_advisory_lock(hashtextextended(?, 0)) AS held', [AUDIT_PREPARATION_LOCK],
    ).connection(connection);
    held = rows[0].held;
    if (!held) throw new AuditPublicationError('busy');
    checkBudget();
    return await work(transaction, signal, checkBudget);
  } finally {
    try {
      if (held) {
        const { rows } = await db.raw<{ rows: { released: boolean }[] }>(
          'SELECT pg_advisory_unlock(hashtextextended(?, 0)) AS released', [AUDIT_PREPARATION_LOCK],
        ).connection(connection);
        if (!rows[0].released) throw new AuditPublicationError('lock_lost');
      }
    } catch (error) {
      reusable = false;
      await db.client.destroyRawConnection(connection);
      throw error;
    } finally { if (reusable) await db.client.releaseConnection(connection); }
  }
}

export async function copyNextAdminAuditArchive(
  db: Knex, ledgerIdInput: string, writer: AuditArchiveWriter,
  reader: AuditArchiveReader, locks: AuditArchiveLockReader,
) {
  const ledgerId = ledgerIdInput.toLowerCase();
  auditArchiveScopeSchema.parse({ ledgerId, previousCheckpoint: null, throughSequence: '1' });
  const target = auditArchiveTargetSchema.parse(writer.target);
  return locked(db, false, async (transaction, signal, checkBudget) => {
    const candidate = await transaction(async trx => {
      const table = () => trx.withSchema('admin').table<Copy>('auditArchiveCopies');
      if (await table().whereNot({ ledgerId }).first('id')) throw new AuditPublicationError('ledger_changed');
      let copy = await table().where({ ledgerId }).orderBy('throughSequence', 'desc').first();
      let previous: AuditRetainedCheckpoint | null = null;
      if (copy) {
        if (JSON.stringify(auditArchiveTargetSchema.parse(copy.target)) !== JSON.stringify(target)) {
          throw new AuditPublicationError('target_changed');
        }
        const check = await trx.withSchema('admin').table('auditArchiveChecks').where({ copyId: copy.id })
          .orderBy('checkedAt', 'desc').orderBy('id', 'desc').first<{ state: string; retained: unknown }>();
        if (check?.state === 'failed') throw new AuditPublicationError('verification_failed');
        if (check?.state === 'accepted') {
          previous = auditRetainedCheckpointSchema.parse(check.retained);
          if (previous.checkpointSHA256 !== copy.checkpointSHA256 ||
            previous.scope.throughSequence !== String(copy.throughSequence)) throw new AuditPublicationError('publication_changed');
        } else if (copy.state === 'copied') {
          return { state: 'awaiting_verifier' as const, copyId: copy.id };
        } else return { state: 'candidate' as const, copy };
      }
      const head = await trx.withSchema('admin').table('auditEvents')
        .orderBy('sequence', 'desc').first<{ sequence: string }>('sequence');
      if (previous && (!head || BigInt(head.sequence) < BigInt(previous.scope.throughSequence))) {
        throw new AuditPublicationError('database_tail_missing');
      }
      if (!head || (previous && String(head.sequence) === previous.scope.throughSequence)) {
        return { state: 'no_events' as const };
      }
      const scope = auditArchiveScopeSchema.parse({
        ledgerId, throughSequence: String(head.sequence),
        previousCheckpoint: previous ? retainedAuditAnchor(previous) : null,
      });
      [copy] = await table().insert({
        id: randomUUID(), ledgerId, throughSequence: scope.throughSequence, scope, target, state: 'pending', attempts: 0,
      }).returning('*');
      return { state: 'candidate' as const, copy };
    });
    checkBudget();
    if (candidate.state !== 'candidate') return candidate;
    const copy = candidate.copy;
    const scope = auditArchiveScopeSchema.parse(copy.scope);
    if (scope.ledgerId !== ledgerId || scope.throughSequence !== String(copy.throughSequence)) {
      throw new AuditPublicationError('scope_changed');
    }
    const attemptId = randomUUID();
    const attempt = copy.attempts + 1;
    await transaction(async trx => {
      await trx.withSchema('admin').table('auditArchiveCopyAttempts').where({ copyId: copy.id, state: 'copying' })
        .update({ state: 'interrupted', failureCode: 'worker_interrupted', finishedAt: trx.fn.now() });
      await trx.withSchema('admin').table('auditArchiveCopyAttempts').insert({
        id: attemptId, copyId: copy.id, attempt, state: 'copying',
      });
      await trx.withSchema('admin').table('auditArchiveCopies').where({ id: copy.id })
        .update({ state: 'copying', attempts: attempt, copyEvidence: null, failureCode: null, updatedAt: trx.fn.now() });
    });
    try {
      const archive = await transaction(trx => buildDatabaseAdminAuditArchive(trx, scope, checkBudget));
      const checkpoint = auditArchiveCheckpointSchema.parse(JSON.parse(archive.checkpoint.toString()));
      if (copy.checkpointSHA256 && copy.checkpointSHA256 !== archive.checkpointSHA256) {
        throw new AuditPublicationError('prepared_evidence_changed');
      }
      // Commit the expected digest before external IO so ambiguous uploads cannot replace the baseline.
      await transaction(async trx => {
        checkBudget();
        await trx.withSchema('admin').table('auditArchiveCopies').where({ id: copy.id })
          .update({ checkpoint, checkpointSHA256: archive.checkpointSHA256 });
      });
      const evidence = await deliverAdminAuditArchive(archive, scope, AUDIT_PREPARATION_LIMITS, writer, reader, locks, signal);
      await transaction(async trx => {
        checkBudget();
        await trx.withSchema('admin').table('auditArchiveCopyAttempts').where({ id: attemptId })
          .update({ state: 'copied', finishedAt: trx.fn.now() });
        await trx.withSchema('admin').table('auditArchiveCopies').where({ id: copy.id })
          .update({ state: 'copied', copyEvidence: evidence, failureCode: null, updatedAt: trx.fn.now() });
      });
      return { state: 'copied' as const, copyId: copy.id, checkpointSHA256: archive.checkpointSHA256, independentlyAccepted: false };
    } catch (error) {
      const code = signal.aborted ? 'deadline_exceeded' : errorCode(error);
      await transaction(async trx => {
        await trx.withSchema('admin').table('auditArchiveCopyAttempts').where({ id: attemptId })
          .update({ state: 'failed', failureCode: code, finishedAt: trx.fn.now() });
        await trx.withSchema('admin').table('auditArchiveCopies').where({ id: copy.id })
          .update({ state: 'failed', copyEvidence: null, failureCode: code, updatedAt: trx.fn.now() });
      });
      throw new AuditPublicationError(code);
    }
  });
}

export async function verifyNextAdminAuditArchive(
  db: Knex, ledgerIdInput: string, reader: AuditArchiveReader,
  locks: AuditArchiveLockReader, baseline: AuditBaselineStore,
) {
  const ledgerId = ledgerIdInput.toLowerCase();
  auditArchiveScopeSchema.parse({ ledgerId, previousCheckpoint: null, throughSequence: '1' });
  const target = auditArchiveTargetSchema.parse(reader.target);
  return locked(db, true, async (transaction, signal, checkBudget) => {
    const retained = await baseline.latest();
    checkBudget();
    if (retained && (retained.scope.ledgerId !== ledgerId || JSON.stringify(retained.target) !== JSON.stringify(target))) {
      throw new AuditPublicationError('baseline_binding_changed');
    }
    // Reconcile the retained head before processing a new segment, including after a DB commit failure.
    const copy = await transaction(async trx => {
      const table = trx.withSchema('admin').table<Copy>('auditArchiveCopies').where({ ledgerId });
      if (!retained && await trx.withSchema('admin').table('auditArchiveChecks').where({ state: 'accepted' }).first()) {
        throw new AuditPublicationError('verifier_baseline_missing');
      }
      if (retained) {
        const oldCopy = await table.clone().where({ throughSequence: retained.scope.throughSequence }).first();
        if (!oldCopy || oldCopy.checkpointSHA256 !== retained.checkpointSHA256 ||
          JSON.stringify(auditArchiveScopeSchema.parse(oldCopy.scope)) !== JSON.stringify(retained.scope)) {
          throw new AuditPublicationError('retained_database_evidence_missing');
        }
        const accepted = await trx.withSchema('admin').table('auditArchiveChecks')
          .where({ copyId: oldCopy.id, state: 'accepted' }).first();
        if (!accepted) return oldCopy;
      }
      const next = await table.clone()
        .where('throughSequence', '>', retained?.scope.throughSequence ?? '0')
        .orderBy('throughSequence', 'asc').first();
      if (next) return next;
      return retained ? table.clone().where({ throughSequence: retained.scope.throughSequence }).first() : undefined;
    });
    checkBudget();
    if (!copy) return { state: 'no_copy' as const };
    if (copy.state !== 'copied') return { state: 'awaiting_copy' as const, copyId: copy.id };
    try {
      if (retained) {
        const head = await transaction(trx => trx.withSchema('admin').table('auditEvents')
          .where({ sequence: retained.scope.throughSequence }).first<{ hash: string }>('hash'));
        if (head?.hash !== retained.checkpoint.headHash) throw new AuditPublicationError('database_tail_or_head_changed');
      }
      if (!copy.checkpointSHA256) throw new AuditPublicationError('copy_not_ready');
      const scope = auditArchiveScopeSchema.parse(copy.scope);
      const recovering = retained?.scope.throughSequence === scope.throughSequence;
      const expectedPrevious = recovering ? retained.scope.previousCheckpoint : retained ? retainedAuditAnchor(retained) : null;
      if (scope.ledgerId !== ledgerId || scope.throughSequence !== String(copy.throughSequence) ||
        JSON.stringify(scope.previousCheckpoint) !== JSON.stringify(expectedPrevious) ||
        JSON.stringify(auditArchiveTargetSchema.parse(copy.target)) !== JSON.stringify(target)) {
        throw new AuditPublicationError('verifier_scope_changed');
      }
      const archive = await transaction(trx => buildDatabaseAdminAuditArchive(trx, scope, checkBudget));
      if (archive.checkpointSHA256 !== copy.checkpointSHA256 ||
        (recovering && archive.checkpointSHA256 !== retained.checkpointSHA256)) {
        throw new AuditPublicationError('database_checkpoint_mismatch');
      }
      const evidence = await verifyStoredAdminAuditArchive(reader, locks, scope, archive.checkpointSHA256, AUDIT_PREPARATION_LIMITS, signal);
      const accepted = auditRetainedCheckpointSchema.parse({
        version: 1, scope, target, checkpointSHA256: archive.checkpointSHA256,
        checkpoint: auditArchiveCheckpointSchema.parse(JSON.parse(archive.checkpoint.toString())),
      });
      checkBudget();
      // Filesystem acceptance precedes DB acknowledgement; retry reconciles that ordering.
      await baseline.accept(accepted);
      await transaction(async trx => {
        checkBudget();
        await trx.withSchema('admin').table('auditArchiveChecks').insert({
          id: randomUUID(), copyId: copy.id, state: 'accepted', retained: accepted, evidence,
        });
      });
      return { state: 'accepted' as const, copyId: copy.id, checkpointSHA256: accepted.checkpointSHA256 };
    } catch (error) {
      const code = signal.aborted ? 'deadline_exceeded' : errorCode(error);
      await transaction(async trx => {
        await trx.withSchema('admin').table('auditArchiveChecks').insert({
          id: randomUUID(), copyId: copy.id, state: 'failed', failureCode: code,
        });
      });
      throw new AuditPublicationError(code);
    }
  });
}
