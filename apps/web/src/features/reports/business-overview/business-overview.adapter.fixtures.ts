import { businessOverviewResultSchema, type BusinessOverviewQuery } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { businessOverviewAcceptedCents, businessOverviewResponse, businessOverviewToday, businessOverviewTimezone } from './business-overview.fixtures';
import type { BusinessOverviewAuthority } from './business-overview.adapter';

export const overviewBackendWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const overviewBackendScopeKey = 'overview-mock-current-authority';
export const overviewBackendAuthority: BusinessOverviewAuthority = {
  reportScope: 'workspace', lead: { scope: 'workspace', archives: 'included' }, job: { scope: 'workspace' },
  estimate: { scope: 'workspace', archives: 'included' }, calendar: { kind: 'workspace' },
};
/** Translate the existing fictional Overview aggregation into the compact native-composition contract. */
export function overviewBackendResponse(request: BusinessOverviewQuery, authority = overviewBackendAuthority, invalidMoney = false) {
  const result = businessOverviewResponse({ period: { preset: 'custom', ...request.period } });
  const count = (id: string) => {
    const metric = [...result.periodMetrics, ...result.currentMetrics].find(item => item.id === id);
    if (metric?.value.kind !== 'count') throw new Error('Unknown Overview fixture count.');
    return metric.value.value;
  };
  const attention = (id: string) => {
    if (result.attention.kind !== 'available') throw new Error('Overview fixture attention unavailable.');
    const item = result.attention.items.find(item => item.id === id);
    if (!item) throw new Error('Unknown Overview fixture queue.');
    return item.count;
  };
  const read = (name: string, second: string) => ({ asOf: `2026-11-06T10:00:${second}Z`, scopeLabel: `Current ${name} authority; native date and lifecycle definitions.` });
  const unavailable = (name: string) => ({ kind: 'unavailable', reason: 'permissions', explanation: `${name} metrics are unavailable under current record authority.` });
  const cents = businessOverviewAcceptedCents(request.period.from, request.period.to);
  return businessOverviewResultSchema.parse({
    workspaceId: request.workspaceId, view: 'business-overview', ...request.period,
    today: businessOverviewToday, timezone: businessOverviewTimezone, reportScope: authority.reportScope,
    leads: authority.lead ? { kind: 'available', scope: authority.lead.scope, archiveVisibility: authority.lead.archives,
      reads: { intake: read('Lead intake', '00'), pipeline: read('open Leads', '01'), attention: read('Lead inactivity', '02') },
      created: count('new-leads'), stages: { new: count('new-lead-stage'), contacted: count('contacted-lead-stage'), 'estimate-sent': count('estimate-sent-lead-stage') },
      inactive: attention('stale-leads') } : unavailable('Lead'),
    jobs: authority.job ? { kind: 'available', scope: authority.job.scope,
      reads: { created: read('Job creation', '03'), completion: read('effective Job completion', '04'), workload: read('active Jobs', '05') },
      created: count('jobs-created'), completed: count('jobs-completed'), active: count('active-jobs'), overdue: count('overdue-jobs'), waiting: attention('waiting-jobs') } : unavailable('Job'),
    estimates: authority.estimate ? { kind: 'available', scope: authority.estimate.scope, archiveVisibility: authority.estimate.archives,
      reads: { accepted: read('accepted commitments', '06'), awaiting: read('current quotes', '07') }, accepted: count('accepted-estimates'), awaiting: count('awaiting-estimates'),
      acceptedMoney: invalidMoney ? { kind: 'unavailable', explanation: 'Issued frozen values could not be verified.' }
        : { kind: 'available', preTaxCents: cents, customerTotalCents: cents } } : unavailable('Estimate'),
    calendar: authority.calendar ? { kind: 'available', scope: authority.calendar, read: read('canonical visits', '08'),
      from: businessOverviewToday, to: addCalendarDays(businessOverviewToday, 6), visits: count('upcoming-visits') } : unavailable('Calendar'),
  });
}
