import type { Knex } from 'knex';
import { businessOverviewQuerySchema, businessOverviewResultSchema, type BusinessOverviewBackendResult,
  type BusinessOverviewQuery, type AuthorizationContext } from '@salesmora/contracts';
import { addCalendarDays, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { readLeadOverviewInTransaction } from './leads';
import { jobLifecycleCounts } from './job-lifecycle';
import { jobReportContext } from './job-context';
import { jobWorkloadCounts } from './jobs';
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
    const summary = await readLeadOverviewInTransaction(trx, context, query.period);
    leads = { kind: 'available', scope: report.sourceScopes.lead, archiveVisibility: summary.archiveVisibility,
      reads: { intake: stamp(summary), pipeline: stamp(summary), attention: stamp(summary) },
      created: summary.created, stages: summary.stages, inactive: summary.inactive };
  }
  let jobs: BusinessOverviewBackendResult['jobs'] = unavailable('Job');
  if (report.sourceScopes?.job) {
    const auth = await jobReportContext(trx, context);
    const lifecycle = await jobLifecycleCounts(trx, query.period, auth);
    const workload = await jobWorkloadCounts(trx, auth.query, auth.today);
    const read = { asOf: auth.asOf.toISOString(), scopeLabel: auth.scopeLabel };
    jobs = { kind: 'available', scope: report.sourceScopes.job,
      reads: { created: read, completion: read, workload: read },
      created: lifecycle.created, completed: lifecycle.completed, active: workload.active,
      overdue: workload.overdue, waiting: workload.waiting };
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
