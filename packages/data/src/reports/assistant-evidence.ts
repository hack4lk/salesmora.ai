import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { reportAssistantBindingContentSchema, reportAssistantEvidenceSchema, reportAssistantReadSnapshotSchema,
  reportAssistantReadLimits, type AuthorizationContext, type PermissionId, type ReportAssistantBinding } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { readReportForAssistant, ReportAssistantLimitError } from './assistant';

// Covers native report populations, link/assignment scopes, immutable evidence and live labels.
const reportTables = [
  'leads', 'leadActivity', 'jobs', 'jobActivity', 'jobTeamMembers', 'customers', 'customerActivity',
  'workOrders', 'workOrderActivity', 'workOrderCrew', 'workOrderMaterials',
  'calendarVisits', 'calendarVisitRecords', 'estimates', 'estimate_snapshots', 'estimate_decisions', 'estimate_activity',
] as const;

/** Conservative all-area stamp. Never sent to a provider or browser. */
export async function reportAssistantDataStamp(trx: Knex.Transaction, context: AuthorizationContext) {
  if (!authorize(context, { permission: 'assistant.use' }).allowed ||
    !resolveAuthorizedCollectionScope(context, 'reports.read').allowed) throw new AuthorizationAccessError();
  await trx.raw(`SELECT set_config('statement_timeout', ?, true)`, [`${reportAssistantReadLimits.durationMs}ms`]);
  const statements = reportTables.map(table =>
    `SELECT '${table}:' || t.xmin::text || ':' || t.ctid::text AS value FROM ?? t WHERE t."workspaceId" = ?`);
  const bindings = reportTables.flatMap(table => [table, context.workspaceId]);
  // ctid also detects updates within the same transaction, where xmin alone does not change.
  const { rows } = await trx.raw<{ rows: { stamp: string }[] }>(`
    SELECT md5(coalesce(string_agg(value, '|' ORDER BY value), '')) AS stamp FROM (
      ${statements.join(' UNION ALL ')}
      UNION ALL SELECT 'member:' || m.xmin::text || ':' || m.ctid::text || ':' || u.xmin::text || ':' || u.ctid::text
        FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId" WHERE m."workspaceId" = ?
      UNION ALL SELECT 'label:' || u.xmin::text || ':' || u.ctid::text FROM users u WHERE u.id = ?
        OR EXISTS (SELECT 1 FROM leads l WHERE l."workspaceId" = ? AND l."ownerId" = u.id)
        OR EXISTS (SELECT 1 FROM jobs j WHERE j."workspaceId" = ? AND j."primaryOwnerId" = u.id)
      UNION ALL SELECT 'workspace:' || w.xmin::text || ':' || w.ctid::text || ':' ||
        (CURRENT_TIMESTAMP AT TIME ZONE w.timezone)::date::text FROM workspaces w WHERE w.id = ?
    ) report_evidence`, [...bindings, context.workspaceId, context.userId, context.workspaceId, context.workspaceId, context.workspaceId]);
  if (!rows[0]?.stamp) throw new Error('Report evidence fingerprint is unavailable.');
  return createHash('sha256').update(JSON.stringify([
    context.workspaceId, context.userId, context.ownerUserId, context.membership.role,
    context.policy.revision,
    [...context.policy.grants].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    [...context.enabledPermissions].sort(), rows[0].stamp,
  ])).digest('hex');
}

function boundStamp(dataStamp: string, binding: Omit<ReportAssistantBinding, 'stamp'>) {
  return createHash('sha256').update(JSON.stringify([dataStamp, canonicalValue(binding)])).digest('hex');
}
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => [key, canonicalValue(item)]));
  return value;
}
function contentHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(canonicalValue(value))).digest('hex');
}
export function reportAssistantSnapshotMatches(raw: unknown) {
  const parsed = reportAssistantReadSnapshotSchema.safeParse(raw);
  return parsed.success && parsed.data.binding.contentHash === contentHash(parsed.data.native);
}

/** Revalidates inherited prose and direct results with the same fresh server authority. */
export async function reportAssistantEvidenceAllowed(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown,
) {
  const parsed = reportAssistantEvidenceSchema.safeParse(raw ?? []);
  if (!parsed.success) return false;
  if (!parsed.data.length) return true;
  try {
    const dataStamp = await reportAssistantDataStamp(trx, context);
    return parsed.data.every(({ stamp, ...binding }) =>
      binding.workspaceId === context.workspaceId && binding.viewerId === context.userId &&
      binding.policyRevision === context.policy.revision && stamp === boundStamp(dataStamp, binding));
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

export class ReportAssistantStaleError extends AuthorizationAccessError {}

/** Fingerprint before and after the canonical read; never bless a result captured during a data change. */
export async function readReportSnapshotForAssistant(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], args: unknown,
  pageContext: unknown, signal: AbortSignal,
) {
  signal.throwIfAborted();
  const started = Date.now();
  const checkActive = () => {
    signal.throwIfAborted();
    if (Date.now() - started >= reportAssistantReadLimits.durationMs) throw new ReportAssistantLimitError();
  };
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    checkActive();
    const before = await reportAssistantDataStamp(trx, context);
    checkActive();
    const native = await readReportForAssistant(trx, identity, enabled, args, pageContext, signal);
    checkActive();
    if (before !== await reportAssistantDataStamp(trx, context)) throw new ReportAssistantStaleError();
    const binding = {
      id: randomUUID(), workspaceId: context.workspaceId, viewerId: context.userId,
      policyRevision: context.policy.revision, selection: { area: native.area, query: native.read.query },
      retrievedAt: new Date().toISOString(), contentHash: contentHash(native),
    };
    const parsed = reportAssistantBindingContentSchema.parse(binding);
    checkActive();
    return reportAssistantReadSnapshotSchema.parse({
      binding: { ...parsed, stamp: boundStamp(before, parsed) }, native,
    });
  });
}
