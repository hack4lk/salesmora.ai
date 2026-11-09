import type { Knex } from 'knex';
import { businessOverviewExportColumns, businessOverviewExportInputSchema, businessOverviewExportPreviewSchema,
  businessOverviewExportGenerationSchema, type AuthorizationContext, type BusinessOverviewExportInput,
  type BusinessOverviewExportPreview, type PermissionId } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { businessOverviewContext } from './business-overview';
import { resolveLeadReportExportScope } from './lead-export-access';
import { resolveJobReportExportScope } from './job-export-access';
import { resolveEstimateReportExportAccess } from './estimate-export-access';
import { resolveCalendarExportAccess } from './calendar-export-access';
import { prepareLeadReportExportInTransaction } from './leads';
import { readJobLifecycleReportInTransaction } from './job-lifecycle';
import { readJobCompletionReportInTransaction } from './job-completion';
import { readJobWorkloadReportInTransaction } from './jobs';
import { readEstimateDecisionsReportInTransaction } from './estimate-decisions';
import { readEstimateCurrentReportInTransaction } from './estimate-current';
import { readCalendarScheduledReportInTransaction } from './calendar-scheduled';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { createReportCSVStream } from './report-export-stream';

export async function prepareBusinessOverviewExportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: BusinessOverviewExportInput,
) {
  const input = businessOverviewExportInputSchema.parse(raw), { query } = input;
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const { report, clock } = await businessOverviewContext(trx, context);
  if (query.period.to > clock.today) throw new RangeError('Overview periods cannot extend beyond the workspace date.');
  const leadScope = resolveLeadReportExportScope(context), jobScope = resolveJobReportExportScope(context);
  const estimateAccess = resolveEstimateReportExportAccess(context), calendarAccess = resolveCalendarExportAccess(context);
  if (!leadScope && !jobScope && !estimateAccess && !calendarAccess) throw new AuthorizationAccessError();
  const timestamp = await trx.raw<{ rows: { asOf: Date }[] }>('SELECT CURRENT_TIMESTAMP AS "asOf"');
  const asOf = new Date(timestamp.rows[0]!.asOf).toISOString();
  const scopes: BusinessOverviewExportPreview['scopes'] = { lead: null, job: jobScope, estimate: null, calendar: null };
  const rows: (string | number | null)[][] = [];
  const add = (section: string, metric: string, value: number | null, status: string, basis: string,
    from: string | null, to: string | null, scope: string | null, coverage: string) =>
    rows.push([section, metric, value, status, basis, from, to, asOf, clock.timezone, scope, coverage]);
  const omitted = (section: string) => add(section, 'section', null, 'unavailable', 'not applicable', null, null, null,
    'Section unavailable under current read and export authority.');
  const common = { workspaceId: query.workspaceId, page: 1, pageSize: 25 as const };
  if (leadScope) {
    const filters = { stages: [], owners: [], sources: [] };
    const intake = (await prepareLeadReportExportInTransaction(trx, context, { dataset: 'intake-days',
      query: { workspaceId: query.workspaceId, view: 'intake', period: query.period, filters, currentFilters: filters } })).report;
    const pipeline = (await prepareLeadReportExportInTransaction(trx, context, { dataset: 'pipeline-stages',
      query: { workspaceId: query.workspaceId, view: 'pipeline', filters, selection: { kind: 'pipeline' } } })).report;
    const attention = (await prepareLeadReportExportInTransaction(trx, context, { dataset: 'attention-categories',
      query: { workspaceId: query.workspaceId, view: 'attention', filters, selection: 'inactive' } })).report;
    if (intake.view !== 'intake' || pipeline.view !== 'pipeline' || attention.view !== 'attention') {
      throw new Error('Unexpected Overview Lead export projection.');
    }
    scopes.lead = { scope: leadScope, archives: intake.archiveVisibility };
    const coverage = `Authorized Leads; archived ${intake.archiveVisibility}.`;
    add('leads', 'created', intake.total, 'available', 'creation date', query.period.from, query.period.to, leadScope, coverage);
    for (const [stage, value] of Object.entries(pipeline.stages)) add('leads', `open ${stage}`, value, 'available',
      'current snapshot', null, null, leadScope, coverage);
    add('leads', 'inactive', attention.counts.inactive, 'available', 'current snapshot', null, null, leadScope, coverage);
  } else omitted('leads');
  if (jobScope) {
    const filters = { statuses: [], owners: [], services: [] }, assigned = jobScope === 'assigned';
    const created = await readJobLifecycleReportInTransaction(trx, context, { ...common, view: 'lifecycle',
      period: query.period, filters, selectedView: 'created' }, assigned);
    const completion = await readJobCompletionReportInTransaction(trx, context, { ...common, view: 'completion',
      period: query.period, filters }, assigned);
    const workload = await readJobWorkloadReportInTransaction(trx, context, { ...common, view: 'workload',
      filters, selection: { kind: 'metric', metric: 'active' } }, assigned);
    const coverage = 'Current authorized Job scope, including archived Jobs; workload metrics may overlap.';
    add('jobs', 'created', created.counts.created, 'available', 'creation date', query.period.from, query.period.to, jobScope, coverage);
    add('jobs', 'completed', completion.total, 'available', 'completion date', query.period.from, query.period.to, jobScope, coverage);
    for (const metric of ['active', 'overdue', 'waiting'] as const) add('jobs', metric, workload.counts[metric],
      'available', 'current snapshot', null, null, jobScope, coverage);
  } else omitted('jobs');
  if (estimateAccess) {
    const filters = { owners: [], parents: [] }, assigned = estimateAccess.scope === 'assigned_job';
    const accepted = await readEstimateDecisionsReportInTransaction(trx, context, { ...common, view: 'estimate-decisions',
      period: query.period, filters, selected: 'accepted' }, assigned);
    const awaiting = await readEstimateCurrentReportInTransaction(trx, context, { ...common, view: 'estimate-current',
      filters, selected: 'awaiting' }, assigned, false);
    scopes.estimate = { scope: estimateAccess.scope, archives: accepted.archiveVisibility };
    const coverage = `Authorized issued Estimates; decision archives ${accepted.archiveVisibility}.`;
    add('estimates', 'accepted', accepted.counts.accepted, 'available', 'decision date', query.period.from, query.period.to, estimateAccess.scope, coverage);
    const preTax = accepted.money.kind === 'available' ? accepted.money.preTaxCents : null;
    add('estimates', 'accepted pre-tax cents', preTax, preTax === null ? 'unavailable' : 'available', 'decision date',
      query.period.from, query.period.to, estimateAccess.scope, coverage);
    add('estimates', 'awaiting', awaiting.counts.awaiting, 'available', 'current snapshot', null, null, estimateAccess.scope, coverage);
  } else omitted('estimates');
  if (calendarAccess) {
    const scheduled = await readCalendarScheduledReportInTransaction(trx, context, { ...common, view: 'calendar-scheduled',
      period: { from: clock.today, to: addCalendarDays(clock.today, 6) }, selected: 'visits',
      filters: { participants: [], recordTypes: [] } }, calendarAccess.outputScopes);
    if (scheduled.scope.kind !== calendarAccess.scope.kind) throw new Error('Overview Calendar export scope does not match.');
    const jobs = calendarAccess.outputScopes.jobs, orders = calendarAccess.outputScopes.workOrders;
    scopes.calendar = { scope: calendarAccess.scope.kind, jobs: jobs.kind === 'available' ? jobs.scope : null,
      workOrders: orders.kind === 'available' ? orders.scope : null };
    add('calendar', 'upcoming visits', scheduled.counts.visits, 'available', 'current scheduled date',
      scheduled.from, scheduled.to, scheduled.scope.kind,
      `Current visits; Jobs: ${jobs.kind === 'available' ? jobs.scope : 'unavailable'}; Work Orders: ${orders.kind === 'available' ? orders.scope : 'unavailable'}.`);
  } else omitted('calendar');
  const coverage = 'Summary only; sections and Calendar parent domains without export authority are explicitly unavailable. Current snapshots are not historical.';
  async function* generate(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    for (const row of rows) { signal?.throwIfAborted(); yield row; }
  }
  return { input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    asOf, today: clock.today, timezone: clock.timezone, scopes, count: rows.length, columns: businessOverviewExportColumns,
    coverage, scope: report.scope, rows: generate };
}
type Projection = Awaited<ReturnType<typeof prepareBusinessOverviewExportInTransaction>>;
function preview(projection: Projection, limits: BusinessOverviewExportPreview['limits']) {
  const { rows, scope, ...metadata } = projection;
  void rows; void scope;
  return businessOverviewExportPreviewSchema.parse({ ...metadata, limits });
}
function validate(identity: WorkspaceIdentity, raw: BusinessOverviewExportInput) {
  const input = businessOverviewExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
export async function previewBusinessOverviewExport(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[],
  raw: BusinessOverviewExportInput) {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareBusinessOverviewExportInTransaction(trx, context, input), limits));
}
export async function createBusinessOverviewCSVExport(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[],
  raw: BusinessOverviewExportInput, signal?: AbortSignal) {
  const input = validate(identity, raw);
  return createReportCSVStream(db, identity, enabled, {
    report: 'overview', label: 'Overview', dataset: 'summary', selection: JSON.stringify({ period: input.query.period }),
    prepare: async (trx, context, limits) => {
      const projection = await prepareBusinessOverviewExportInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: Object.values(value.scopes).some(scope =>
      typeof scope === 'string' ? scope === 'workspace' : scope && 'scope' in scope && scope.scope === 'workspace')
      ? 'workspace' : 'assigned', outputScopes: JSON.stringify(value.scopes) }),
    generation: (value, id) => businessOverviewExportGenerationSchema.parse({ id, workspaceId: value.workspaceId,
      policyRevision: value.policyRevision, asOf: value.asOf, today: value.today, timezone: value.timezone,
      scopes: value.scopes, count: value.count, limits: value.limits }),
  }, signal);
}
