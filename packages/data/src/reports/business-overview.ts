import type { Knex } from 'knex';
import { businessOverviewQuerySchema, businessOverviewResultSchema, type BusinessOverviewBackendResult,
  type BusinessOverviewQuery, type AuthorizationContext } from '@salesmora/contracts';
import { addCalendarDays, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { readLeadReportInTransaction } from './leads';
import { readJobLifecycleReportInTransaction } from './job-lifecycle';
import { readJobCompletionReportInTransaction } from './job-completion';
import { readJobWorkloadReportInTransaction } from './jobs';
import { readEstimateDecisionsReportInTransaction } from './estimate-decisions';
import { readEstimateCurrentReportInTransaction } from './estimate-current';
import { readCalendarScheduledReportInTransaction } from './calendar-scheduled';

const unavailable = (domain: string) => ({ kind: 'unavailable' as const, reason: 'permissions' as const,
  explanation: `${domain} metrics and evidence are unavailable under current Reports and underlying record authority.` });
const stamp = (result: { asOf: string; scopeLabel: string }) => ({ asOf: result.asOf, scopeLabel: result.scopeLabel });

export async function businessOverviewContext(trx: Knex.Transaction, context: AuthorizationContext) {
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (!report.allowed || !['workspace', 'assigned'].includes(report.scope)) throw new AuthorizationAccessError();
  const clock = await trx('workspaces').where({ id: context.workspaceId }).select('timezone',
    trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.today !== 'string' || typeof clock.timezone !== 'string') throw new Error('The workspace Overview clock is unavailable.');
  return { report, clock };
}

/** Reuse native report definitions; separate reads do not promise an atomic cross-section snapshot. */
export async function readBusinessOverviewInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: BusinessOverviewQuery,
): Promise<BusinessOverviewBackendResult> {
  const query = businessOverviewQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const { report, clock } = await businessOverviewContext(trx, context);
  if (query.period.to > clock.today) throw new RangeError('Overview periods cannot extend beyond business-local today.');
  const common = { workspaceId: query.workspaceId, page: 1, pageSize: 25 as const };
  let leads: BusinessOverviewBackendResult['leads'] = unavailable('Lead');
  if (report.sourceScopes?.lead) {
    const filters = { stages: [], owners: [], sources: [] };
    const intake = await readLeadReportInTransaction(trx, context, { ...common, view: 'intake', period: query.period, filters, currentFilters: filters });
    const pipeline = await readLeadReportInTransaction(trx, context, { ...common, view: 'pipeline', filters, selection: { kind: 'pipeline' } });
    const attention = await readLeadReportInTransaction(trx, context, { ...common, view: 'attention', filters, selection: 'inactive' });
    if (intake.view !== 'intake' || pipeline.view !== 'pipeline' || attention.view !== 'attention') throw new Error('Unexpected native Lead Overview projection.');
    leads = { kind: 'available', scope: report.sourceScopes.lead, archiveVisibility: intake.archiveVisibility,
      reads: { intake: stamp(intake), pipeline: stamp(pipeline), attention: stamp(attention) },
      created: intake.total, stages: pipeline.stages, inactive: attention.counts.inactive };
  }
  let jobs: BusinessOverviewBackendResult['jobs'] = unavailable('Job');
  if (report.sourceScopes?.job) {
    const filters = { statuses: [], owners: [], services: [] };
    const created = await readJobLifecycleReportInTransaction(trx, context, { ...common, view: 'lifecycle', period: query.period, filters, selectedView: 'created' });
    const completion = await readJobCompletionReportInTransaction(trx, context, { ...common, view: 'completion', period: query.period, filters });
    const workload = await readJobWorkloadReportInTransaction(trx, context, { ...common, view: 'workload', filters, selection: { kind: 'metric', metric: 'active' } });
    jobs = { kind: 'available', scope: report.sourceScopes.job,
      reads: { created: stamp(created), completion: stamp(completion), workload: stamp(workload) },
      created: created.counts.created, completed: completion.total, active: workload.counts.active,
      overdue: workload.counts.overdue, waiting: workload.counts.waiting };
  }
  let estimates: BusinessOverviewBackendResult['estimates'] = unavailable('Estimate');
  const estimateAuthority = resolveAuthorizedCollectionScope(context, 'estimates.read');
  const assignedEstimates = report.scope === 'assigned' || estimateAuthority.allowed && estimateAuthority.scope === 'assigned_job';
  if (estimateAuthority.allowed && (!assignedEstimates || report.sourceScopes?.job)) {
    const filters = { owners: [], parents: [] };
    const accepted = await readEstimateDecisionsReportInTransaction(trx, context, { ...common, view: 'estimate-decisions', period: query.period, filters, selected: 'accepted' });
    const awaiting = await readEstimateCurrentReportInTransaction(trx, context, { ...common, view: 'estimate-current', filters, selected: 'awaiting' });
    estimates = { kind: 'available', scope: accepted.scope, archiveVisibility: accepted.archiveVisibility,
      reads: { accepted: stamp(accepted), awaiting: stamp(awaiting) },
      accepted: accepted.counts.accepted, acceptedMoney: accepted.money, awaiting: awaiting.counts.awaiting };
  }
  let calendar: BusinessOverviewBackendResult['calendar'] = unavailable('Calendar');
  const calendarAuthority = resolveAuthorizedCollectionScope(context, 'calendar.read');
  const jobAuthority = resolveAuthorizedCollectionScope(context, 'jobs.read'), orderAuthority = resolveAuthorizedCollectionScope(context, 'workorders.read');
  if (calendarAuthority.allowed && (jobAuthority.allowed || orderAuthority.allowed)) {
    const scheduled = await readCalendarScheduledReportInTransaction(trx, context, { ...common, view: 'calendar-scheduled',
      period: { from: clock.today, to: addCalendarDays(clock.today, 6) }, selected: 'visits', filters: { participants: [], recordTypes: [] } });
    calendar = { kind: 'available', scope: scheduled.scope, read: stamp(scheduled), from: scheduled.from, to: scheduled.to, visits: scheduled.counts.visits };
  }
  return businessOverviewResultSchema.parse({ workspaceId: query.workspaceId, view: query.view, ...query.period,
    today: clock.today, timezone: clock.timezone, reportScope: report.scope, leads, jobs, estimates, calendar });
}
