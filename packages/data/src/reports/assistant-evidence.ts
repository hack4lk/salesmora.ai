import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { reportAssistantBindingContentSchema, reportAssistantEvidenceSchema, reportAssistantReadSnapshotSchema,
  reportAssistantReadLimits, type AuthorizationContext, type PermissionId, type ReportAssistantBinding, type ReportSelection } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { assistantAuthorityStamp } from '../authorization/evidence-stamp';
import { readReportForAssistantInTransaction, ReportAssistantLimitError } from './assistant';

/** Authorization-only binding. It must never be used as a mutation/version precondition. */
export async function reportAssistantDataStamp(_trx: Knex.Transaction, context: AuthorizationContext) {
  if (!authorize(context, { permission: 'assistant.use' }).allowed ||
    !resolveAuthorizedCollectionScope(context, 'reports.read').allowed) throw new AuthorizationAccessError();
  return assistantAuthorityStamp(context, 'reports');
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

/** Aggregates have no complete captured population. Assigned historical reports must be reread. */
export function reportAssistantHistoricalSelectionAllowed(context: AuthorizationContext, selection: ReportSelection) {
  const reports = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (!reports.allowed || reports.scope !== 'workspace' || selection.query.workspaceId !== context.workspaceId ||
    !authorize(context, { permission: 'assistant.use' }).allowed) return false;
  const workspace = (permission: PermissionId) => {
    const scope = resolveAuthorizedCollectionScope(context, permission);
    return scope.allowed && scope.scope === 'workspace';
  };
  const lead = reports.sourceScopes?.lead === 'workspace' && workspace('leads.read');
  const job = reports.sourceScopes?.job === 'workspace' && workspace('jobs.read');
  const estimates = workspace('estimates.read');
  const calendar = workspace('calendar.read') &&
    (workspace('jobs.read') || workspace('workorders.read'));
  switch (selection.area) {
    case 'leads': return lead;
    case 'jobs': return job;
    case 'sources': return lead && (selection.query.selected === 'cohort' ||
      selection.query.selected === 'converted' && job ||
      selection.query.selected === 'accepted-estimates' && estimates);
    case 'team': return selection.query.view === 'team-leads' ? lead : job;
    case 'calendar': return calendar && (!resolveAuthorizedCollectionScope(context, 'jobs.read').allowed || job) &&
      (!resolveAuthorizedCollectionScope(context, 'workorders.read').allowed || workspace('workorders.read'));
    case 'estimates': return estimates && (selection.query.view !== 'estimate-current' ||
      selection.query.selected !== 'handoff' || lead && job);
    case 'financial': return authorize(context, { permission: 'reports.financial.read' }).allowed &&
      (selection.query.selected === 'materials' ? workspace('workorders.read') &&
        authorize(context, { permission: 'workorders.view_prices', resource: {
          kind: 'work_order', id: context.workspaceId, workspaceId: context.workspaceId, job: null,
        } }).allowed && authorize(context, { permission: 'workorders.view_costs', resource: {
          kind: 'work_order', id: context.workspaceId, workspaceId: context.workspaceId, job: null,
        } }).allowed : estimates);
    // These compose multiple populations: every enabled source must remain workspace-wide.
    case 'overview':
    case 'activity': return (!reports.sourceScopes?.lead || lead) && (!reports.sourceScopes?.job || job) &&
      (!resolveAuthorizedCollectionScope(context, 'estimates.read').allowed || estimates) &&
      (!resolveAuthorizedCollectionScope(context, 'workorders.read').allowed || workspace('workorders.read')) &&
      (!resolveAuthorizedCollectionScope(context, 'calendar.read').allowed || calendar);
  }
}

/** Current capability/scope plus immutable content/query binding, never current CRM equality. */
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
      binding.policyRevision === context.policy.revision &&
      reportAssistantHistoricalSelectionAllowed(context, binding.selection) &&
      stamp === boundStamp(dataStamp, binding));
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

export class ReportAssistantStaleError extends AuthorizationAccessError {}

/** One admitted authority and one canonical native read. Saved facts retain their retrieval timestamp. */
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
    const stamp = await reportAssistantDataStamp(trx, context);
    const native = await readReportForAssistantInTransaction(trx, context, args, pageContext, signal);
    checkActive();
    const binding = reportAssistantBindingContentSchema.parse({
      id: randomUUID(), workspaceId: context.workspaceId, viewerId: context.userId,
      policyRevision: context.policy.revision, selection: { area: native.area, query: native.read.query },
      retrievedAt: new Date().toISOString(), contentHash: contentHash(native),
    });
    return reportAssistantReadSnapshotSchema.parse({
      binding: { ...binding, stamp: boundStamp(stamp, binding) }, native,
    });
  });
}
