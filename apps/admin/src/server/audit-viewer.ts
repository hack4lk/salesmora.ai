import 'server-only';
import {
  auditArchiveHealthSchema, auditArchiveScopeSchema, auditArchiveVerificationEvidenceSchema,
  auditArchiveTargetSchema, auditPageSchema, auditQuerySchema, auditRetainedCheckpointSchema,
  retainedAuditAnchor, staffRoleIdSchema, staffRolePermissions,
  type AuditPage,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import type { Knex } from '@salesmora/data';
import { appendAdminAuditEvent, verifyAdminAuditChain, type AdminAuditRecord } from '@salesmora/data/admin-audit';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';
import { auditCategorySQL as categorySQL, auditQuery } from './audit-query';
import { createAuditExportService } from './audit-export';

export const auditViewerDatabase = createDatabase(getAdminAuthConfiguration().databaseUrl);
export class AuditViewerError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}
export interface AuditViewerIdentity { userId: string; sessionId: string; accessEmail: string }
export interface AuditViewerContext { userAgent?: string | null }

export type AuditAuthorization = <T>(identity: AuditViewerIdentity, operation: 'read' | 'verify' | 'export', context: AuditViewerContext,
  callback: (trx: Knex.Transaction) => Promise<T>) => Promise<T>;

export function createAuditViewerService(db: Knex) {
  async function authorized<T>(identity: AuditViewerIdentity, operation: 'read' | 'verify' | 'export', context: AuditViewerContext,
    callback: (trx: Knex.Transaction) => Promise<T>, consistentSnapshot = false): Promise<T> {
    const result = await db.transaction(async trx => {
      if (consistentSnapshot) await trx.raw('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '30s'");
      await trx.raw("SELECT pg_advisory_xact_lock(hashtextextended('admin:staff-access', 0))");
      const user = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions').where({ id: identity.sessionId, userId: identity.userId }).forShare()
        .first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!user || user.disabledAt || user.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
        session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AuditViewerError('Sign in with your verified staff identity.', 401);
      }
      const assignment = await trx.withSchema('admin').table('staffRoleAssignments').where({ userId: identity.userId }).whereNull('revokedAt')
        .forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || role.data !== 'super_admin' || !staffRolePermissions[role.data].includes(operation === 'export' ? 'admin.audit.export' : operation === 'verify' ? 'admin.audit.verify' : 'admin.audit.read')) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId, staffRole: role.success ? role.data : 'bootstrap',
          action: 'audit.viewer.access_denied', targetType: 'admin_audit', targetId: operation,
          after: { operation, assignedRole: role.success ? role.data : null }, ...context,
        });
        return { denied: true as const };
      }
      const value = await callback(trx);
      if (session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AuditViewerError('The admin session expired during the audit request. Sign in again.', 401);
      }
      return { denied: false as const, value };
    });
    // Throw only after the denial event has committed.
    if (result.denied) throw new AuditViewerError('Only Super Admins can access global audit evidence.', 403);
    return result.value;
  }

  async function read(identity: AuditViewerIdentity, input: unknown, context: AuditViewerContext = {}): Promise<AuditPage> {
    return authorized(identity, 'read', context, async trx => {
      const parsed = auditQuerySchema.safeParse(input);
      if (!parsed.success) throw new AuditViewerError('Invalid audit filters.');
      const filters = parsed.data;
      const now = new Date();
      const asOf = filters.asOf ? new Date(filters.asOf) : now;
      if (asOf.getTime() > now.getTime()) throw new AuditViewerError('The audit snapshot cannot be in the future.');
      const head = await trx.withSchema('admin').table('auditEvents').orderBy('sequence', 'desc').first<{ sequence: string }>('sequence');
      const actualHead = String(head?.sequence ?? '0');
      if (filters.throughSequence && BigInt(filters.throughSequence) > BigInt(actualHead)) throw new AuditViewerError('Invalid audit snapshot sequence.');
      const throughSequence = filters.throughSequence ?? actualHead;
      const base = auditQuery(trx, filters, asOf, throughSequence);
      const count = await base.clone().count<{ count: string }[]>('* as count');
      const total = Number(count[0].count);
      const page = Math.min(filters.page, Math.max(0, Math.ceil(total / 5) - 1));
      const events = await base.clone().select<(AdminAuditRecord & { actorName: string | null; category: string })[]>('e.*', 'u.name as actorName')
        .select(trx.raw(`${categorySQL} as category`)).orderBy('e.occurredAt', 'desc').orderBy('e.sequence', 'desc').limit(5).offset(page * 5);
      const actors = await trx.withSchema('admin').table('auditEvents as e').leftJoin('staffUsers as u', 'u.id', 'e.staffUserId')
        .where('e.sequence', '<=', throughSequence).distinct<{ staffUserId: string | null; name: string | null }[]>('e.staffUserId', 'u.name').orderBy('e.staffUserId');
      return auditPageSchema.parse({
        events: events.map(event => ({
          id: event.id, sequence: String(event.sequence), occurredAt: new Date(event.occurredAt).toISOString(),
          actorId: event.staffUserId, actorName: event.actorName ?? event.staffUserId ?? 'System',
          actorRole: event.staffUserId === null ? event.staffRole === 'bootstrap' ? 'bootstrap' : 'system' : event.staffRole,
          action: event.action, category: event.category, targetType: event.targetType, targetId: event.targetId,
          workspaceId: event.workspaceId, reason: event.reason, requestId: event.requestId,
          ipAddress: event.ipAddress, userAgent: event.userAgent, before: event.before, after: event.after, hash: event.hash, prevHash: event.prevHash,
        })),
        total, page, pageSize: 5, asOf: asOf.toISOString(), throughSequence,
        actors: actors.map(actor => ({ id: actor.staffUserId ?? 'system', name: actor.name ?? actor.staffUserId ?? 'System' })),
      });
    });
  }

  async function verify(identity: AuditViewerIdentity, context: AuditViewerContext = {}) {
    return authorized(identity, 'verify', context, async trx => {
      const result = await verifyAdminAuditChain(trx, Date.now() + 30_000);
      const checkedAt = new Date().toISOString();
      return result.valid
        ? { state: 'intact' as const, checked: result.checked, checkedAt, headHash: result.headHash, throughSequence: result.throughSequence }
        : { state: 'broken' as const, checked: result.checked, checkedAt, sequence: result.brokenSequence, throughSequence: result.throughSequence };
    });
  }
  async function archiveHealth(identity: AuditViewerIdentity, context: AuditViewerContext = {}) {
    return authorized(identity, 'read', context, async trx => {
      const observedAt = new Date().toISOString();
      const copy = await trx.withSchema('admin').table('auditArchiveCopies')
        .orderBy('throughSequence', 'desc').first<{
          id: string; scope: unknown; state: 'pending' | 'copying' | 'copied' | 'failed';
          target: unknown; checkpointSHA256: string | null;
          attempts: number; updatedAt: Date; failureCode: string | null;
        }>('id', 'scope', 'state', 'target', 'checkpointSHA256', 'attempts', 'updatedAt', 'failureCode');
      if (!copy) return auditArchiveHealthSchema.parse({ state: 'unconfigured', observedAt });

      const attempt = await trx.withSchema('admin').table('auditArchiveCopyAttempts').where({ copyId: copy.id })
        .orderBy('attempt', 'desc').first<{
          state: 'copying' | 'copied' | 'failed' | 'interrupted'; startedAt: Date;
          finishedAt: Date | null; failureCode: string | null;
        }>('state', 'startedAt', 'finishedAt', 'failureCode');
      const check = await trx.withSchema('admin').table('auditArchiveChecks').where({ copyId: copy.id })
        .orderBy('checkedAt', 'desc').orderBy('id', 'desc').first<{
          state: 'accepted' | 'failed'; checkedAt: Date; failureCode: string | null;
          retained: unknown; evidence: unknown;
        }>('state', 'checkedAt', 'failureCode', 'retained', 'evidence');
      const accepted = await trx.withSchema('admin').table('auditArchiveChecks as checks')
        .join('auditArchiveCopies as copies', 'copies.id', 'checks.copyId')
        .where({ 'checks.state': 'accepted' }).orderBy('checks.checkedAt', 'desc').orderBy('checks.id', 'desc')
        .first<{
          retained: unknown; evidence: unknown; ledgerId: string; throughSequence: string;
          scope: unknown; target: unknown;
        }>('checks.retained', 'checks.evidence', 'copies.ledgerId', 'copies.throughSequence', 'copies.scope', 'copies.target');
      const latestCheck = check?.state === 'accepted'
        ? { state: check.state, checkedAt: new Date(check.checkedAt).toISOString() }
        : check ? {
          state: check.state, checkedAt: new Date(check.checkedAt).toISOString(),
          failureCode: check.failureCode,
        } : null;
      let latestAccepted = null;
      const currentScope = auditArchiveScopeSchema.parse(copy.scope);
      const currentTarget = auditArchiveTargetSchema.parse(copy.target);
      if (check?.state === 'accepted') {
        const checkRetained = auditRetainedCheckpointSchema.parse(check.retained);
        const checkEvidence = auditArchiveVerificationEvidenceSchema.parse(check.evidence);
        if (copy.state !== 'copied' || copy.checkpointSHA256 !== checkRetained.checkpointSHA256 ||
          checkRetained.scope.ledgerId !== currentScope.ledgerId ||
          checkRetained.scope.throughSequence !== currentScope.throughSequence ||
          JSON.stringify(checkRetained.scope) !== JSON.stringify(currentScope) ||
          checkEvidence.throughSequence !== currentScope.throughSequence ||
          checkEvidence.checkpointSHA256 !== checkRetained.checkpointSHA256 ||
          checkRetained.target.accountId !== currentTarget.accountId ||
          checkRetained.target.bucket !== currentTarget.bucket ||
          checkRetained.target.jurisdiction !== currentTarget.jurisdiction ||
          checkEvidence.target.accountId !== currentTarget.accountId ||
          checkEvidence.target.bucket !== currentTarget.bucket ||
          checkEvidence.target.jurisdiction !== currentTarget.jurisdiction) {
          throw new Error('Latest verifier observation does not match the current archive publication.');
        }
      }
      if (accepted) {
        const retained = auditRetainedCheckpointSchema.parse(accepted.retained);
        const evidence = auditArchiveVerificationEvidenceSchema.parse(accepted.evidence);
        const acceptedScope = auditArchiveScopeSchema.parse(accepted.scope);
        const acceptedTarget = auditArchiveTargetSchema.parse(accepted.target);
        if (retained.scope.ledgerId !== accepted.ledgerId ||
          retained.scope.throughSequence !== String(accepted.throughSequence) ||
          JSON.stringify(retained.scope) !== JSON.stringify(acceptedScope) ||
          retained.scope.ledgerId !== currentScope.ledgerId ||
          BigInt(retained.scope.throughSequence) > BigInt(currentScope.throughSequence) ||
          retained.target.accountId !== acceptedTarget.accountId ||
          retained.target.bucket !== acceptedTarget.bucket ||
          retained.target.jurisdiction !== acceptedTarget.jurisdiction ||
          retained.target.accountId !== currentTarget.accountId ||
          retained.target.bucket !== currentTarget.bucket ||
          retained.target.jurisdiction !== currentTarget.jurisdiction ||
          (retained.scope.throughSequence !== currentScope.throughSequence &&
            JSON.stringify(currentScope.previousCheckpoint) !== JSON.stringify(retainedAuditAnchor(retained)))) {
          throw new Error('Accepted archive evidence does not match its database publication.');
        }
        latestAccepted = { retained, evidence };
      }
      return auditArchiveHealthSchema.parse({
        state: 'reported', observedAt,
        latestCopy: {
          scope: currentScope, state: copy.state, attempts: copy.attempts,
          updatedAt: new Date(copy.updatedAt).toISOString(), failureCode: copy.failureCode,
          latestAttempt: attempt ? {
            state: attempt.state, startedAt: new Date(attempt.startedAt).toISOString(),
            finishedAt: attempt.finishedAt ? new Date(attempt.finishedAt).toISOString() : null,
            failureCode: attempt.failureCode,
          } : null,
          latestCheck,
        },
        latestAccepted,
      });
    }, true);
  }
  return { read, verify, archiveHealth, ...createAuditExportService(authorized) };
}
export const auditViewer = createAuditViewerService(auditViewerDatabase);
