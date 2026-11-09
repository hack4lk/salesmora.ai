import type { Knex } from 'knex';
import {
  reportAssistantToolInputSchema, reportAssistantContextSchema, reportSelectionSchema,
  reportNativeReadSchema, reportAssistantReadLimits, jobDateSchema,
  type AuthorizationContext, type PermissionId, type ReportSelection,
} from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope, resolveReportPeriod } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { readReportSelectionInTransaction } from './read-selection';

export class ReportAssistantLimitError extends Error {
  constructor() { super('The report exceeds the assistant read limit. Narrow the question or use the report page.'); }
}
export class ReportAssistantClarificationError extends Error {}

function permit(context: AuthorizationContext) {
  if (!authorize(context, { permission: 'assistant.use' }).allowed ||
    !resolveAuthorizedCollectionScope(context, 'reports.read').allowed) throw new AuthorizationAccessError();
}

function defaultSelection(
  input: Extract<ReturnType<typeof reportAssistantToolInputSchema.parse>['request'], { mode: 'default' }>,
  context: AuthorizationContext, today: string,
): ReportSelection {
  const { area } = input;
  const resolved = resolveReportPeriod(input.period ?? { preset: area === 'calendar' ? 'next7days' : 'last30days' },
    today, area === 'calendar' ? 'calendar' : 'history');
  if (!resolved.range) throw new ReportAssistantClarificationError('Choose a supported report period of at most 366 calendar dates.');
  const period = { from: resolved.range.from, to: resolved.range.to };
  const common = { workspaceId: context.workspaceId, page: 1, pageSize: reportAssistantReadLimits.pageSize };
  const leadFilters = { stages: [], owners: [], sources: [] };
  switch (area) {
    case 'overview': return reportSelectionSchema.parse({ area, query: { workspaceId: context.workspaceId, view: 'business-overview', period } });
    case 'leads': return reportSelectionSchema.parse({ area, query: { ...common, view: 'intake', period, filters: leadFilters, currentFilters: leadFilters } });
    case 'sources': return reportSelectionSchema.parse({ area, query: { ...common, view: 'lead-source', period, selected: 'cohort' } });
    case 'calendar': return reportSelectionSchema.parse({ area, query: { ...common, view: 'calendar-scheduled', period, selected: 'visits' } });
    case 'jobs': return reportSelectionSchema.parse({ area, query: { ...common, view: 'lifecycle', period, selectedView: 'created' } });
    case 'team': {
      const scope = resolveAuthorizedCollectionScope(context, 'reports.read');
      const leads = scope.allowed && scope.sourceScopes?.lead;
      return reportSelectionSchema.parse({ area, query: { ...common, view: leads ? 'team-leads' : 'team-jobs',
        selected: { kind: 'queue', queue: leads ? 'open' : 'active' } } });
    }
    case 'estimates': return reportSelectionSchema.parse({ area, query: { ...common, view: 'estimate-decisions', period, selected: 'accepted' } });
    case 'activity': return reportSelectionSchema.parse({ area, query: { ...common, view: 'activity', period } });
    case 'financial': return reportSelectionSchema.parse({ area, query: { ...common, view: 'financial', period, selected: 'accepted' } });
  }
}

/** Reuses manual native readers; bounded evidence never becomes the source of population totals. */
export async function readReportForAssistant(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], args: unknown,
  pageContext: unknown, signal: AbortSignal,
) {
  const input = reportAssistantToolInputSchema.parse(args);
  signal.throwIfAborted();
  const started = Date.now();
  const checkActive = () => {
    signal.throwIfAborted();
    if (Date.now() - started >= reportAssistantReadLimits.durationMs) throw new ReportAssistantLimitError();
  };
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    permit(context); checkActive();
    // SQL statements have a timeout; the delivery deadline is checked around the composed native read.
    await trx.raw(`SELECT set_config('statement_timeout', ?, true)`, [`${reportAssistantReadLimits.durationMs}ms`]);
    const clock = await trx('workspaces').where({ id: context.workspaceId })
      .select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    const today = jobDateSchema.parse(clock?.today);
    checkActive();
    let selection: ReportSelection;
    if (input.request.mode === 'current_report') {
      if (!pageContext) throw new ReportAssistantClarificationError('No applied report is selected. Choose a report or ask an explicit report question.');
      selection = reportAssistantContextSchema.parse(pageContext).selection;
      if (selection.query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
    } else if (input.request.mode === 'query') {
      selection = reportSelectionSchema.parse({
        ...input.request.selection, query: { ...input.request.selection.query, workspaceId: context.workspaceId,
          ...(input.request.selection.area === 'overview' ? {} : { page: 1, pageSize: reportAssistantReadLimits.pageSize }) },
      });
    } else {
      selection = defaultSelection(input.request, context, today);
    }
    if ('period' in selection.query && selection.area !== 'calendar' && selection.query.period.to > today) {
      throw new ReportAssistantClarificationError('Historical report periods cannot end after the workspace-local date.');
    }
    // A report page can have a larger evidence window. Chat keeps its selection but starts a bounded first page.
    selection = reportSelectionSchema.parse({ ...selection, query: { ...selection.query,
      ...(selection.area === 'overview' ? {} : { page: 1, pageSize: reportAssistantReadLimits.pageSize }) } });
    const native = reportNativeReadSchema.parse(await readReportSelectionInTransaction(trx, context, selection));
    checkActive();
    if (native.read.workspaceId !== identity.workspaceId || native.read.viewerId !== identity.userId ||
      native.read.policyRevision !== context.policy.revision ||
      JSON.stringify(native.read.query) !== JSON.stringify(selection.query)) throw new Error('Report assistant read does not match the authorized request.');
    if (Buffer.byteLength(JSON.stringify(native), 'utf8') > reportAssistantReadLimits.bytes) throw new ReportAssistantLimitError();
    checkActive();
    return native;
  });
}
