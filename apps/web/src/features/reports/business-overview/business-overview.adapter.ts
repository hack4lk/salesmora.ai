import { businessOverviewQuerySchema, businessOverviewResultSchema, type BusinessOverviewReadAuthority, type BusinessOverviewBackendResult,
  type BusinessOverviewQuery } from '@salesmora/contracts';
import { formatMoney } from '@salesmora/ui';
import { addCalendarDays } from '@salesmora/domain';
import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import type { BusinessOverviewState } from './business-overview';
import { businessOverviewData as copy } from './business-overview.data';
import { validBusinessOverviewResult, type BusinessOverviewResult, type OverviewMetric,
  type OverviewAttentionItem } from './business-overview.validation';

export function businessOverviewRequest(input: { workspaceId: string; range: { from: string; to: string } }): BusinessOverviewQuery {
  return businessOverviewQuerySchema.parse({ workspaceId: input.workspaceId, view: 'business-overview',
    period: { from: input.range.from, to: input.range.to } });
}
export type BusinessOverviewAuthority = BusinessOverviewReadAuthority;
type Host = { request: BusinessOverviewQuery; period: ReportPeriodSelection; canRead: boolean; scopeKey: string;
  today: string; timezone: string; authority: BusinessOverviewAuthority };
const labels = {
  'new-leads': 'New Leads', 'jobs-created': 'Jobs created', 'jobs-completed': 'Jobs completed',
  'accepted-estimates': 'Accepted estimates', 'accepted-value': 'Accepted pre-tax value',
  'new-lead-stage': 'New Leads', 'contacted-lead-stage': 'Contacted Leads', 'estimate-sent-lead-stage': 'Estimate sent Leads',
  'awaiting-estimates': 'Estimates awaiting decision', 'active-jobs': 'Active Jobs', 'overdue-jobs': 'Overdue Jobs', 'upcoming-visits': 'Upcoming visits',
} as const;
function metric<Id extends keyof typeof labels>(id: Id, value: OverviewMetric<Id>['value'], basis: string): OverviewMetric<Id> {
  return { id, label: labels[id], value, description: copy.metricDescriptions[id], dateBasisLabel: basis,
    ...(value.kind === 'unavailable' ? {} : { evidenceId: id }) };
}

/** Project only Overview metrics, retaining independent native coverage and snapshot provenance. */
export function adaptBusinessOverviewResponse(raw: unknown, input: Host): { scopeKey: string; state: BusinessOverviewState } {
  const request = businessOverviewQuerySchema.parse(input.request), response = businessOverviewResultSchema.parse(raw);
  const { leads, jobs, estimates, calendar } = response, authority = input.authority;
  if (!input.canRead || !input.scopeKey.trim() || response.workspaceId !== request.workspaceId ||
    response.from !== request.period.from || response.to !== request.period.to || response.today !== input.today ||
    response.timezone !== input.timezone || response.reportScope !== authority.reportScope ||
    leads.kind === 'available' && (!authority.lead || leads.scope !== authority.lead.scope || leads.archiveVisibility !== authority.lead.archives) ||
    jobs.kind === 'available' && (!authority.job || jobs.scope !== authority.job.scope) ||
    estimates.kind === 'available' && (!authority.estimate || estimates.scope !== authority.estimate.scope || estimates.archiveVisibility !== authority.estimate.archives) ||
    calendar.kind === 'available' && (!authority.calendar || calendar.scope.kind !== authority.calendar.kind ||
      calendar.scope.kind === 'own' && (authority.calendar.kind !== 'own' || calendar.scope.viewerId !== authority.calendar.viewerId))) {
    throw new Error('Overview results do not match the current request or authority. Retry the report.');
  }
  const coverage = (name: string, section: BusinessOverviewBackendResult['leads'] | BusinessOverviewBackendResult['jobs'] |
    BusinessOverviewBackendResult['estimates'] | BusinessOverviewBackendResult['calendar']) =>
    section.kind === 'unavailable' ? `${name}: ${section.explanation}` :
      `${name}: scope ${typeof section.scope === 'string' ? section.scope : section.scope.kind}` +
      `${'archiveVisibility' in section ? `, archives ${section.archiveVisibility}` : ''}. ${'reads' in section ? Object.entries(section.reads).map(([key, read]) =>
        `${key} ${read.asOf} (${read.scopeLabel})`).join('; ') : `${section.read.asOf} (${section.read.scopeLabel})`}`;
  const scope = [`Reports: ${response.reportScope}.`, coverage('Leads', leads), coverage('Jobs', jobs), coverage('Estimates', estimates), coverage('Calendar', calendar)]
    .join(' ');
  const snapshot = 'Separate native reads; no single cross-section snapshot.';
  const periodBasis = `Selected period / ${response.from} to ${response.to}, both dates included`;
  const currentBasis = `Current snapshot / ${snapshot}`;
  const visitsRange = `${response.today} to ${addCalendarDays(response.today, 6)}, including today`;
  const count = (section: { kind: 'available' } | { kind: 'unavailable'; explanation: string }, value: number): OverviewMetric<string>['value'] =>
    section.kind === 'available' ? { kind: 'count', value } : { kind: 'unavailable', reason: section.explanation };
  const attention: OverviewAttentionItem[] = [];
  const addAttention = (id: OverviewAttentionItem['id'], label: string, description: string, value: number) => {
    if (value > 0) attention.push({ id, label, description, count: value, evidenceId: id });
  };
  if (leads.kind === 'available') addAttention('stale-leads', 'Inactive open Leads', 'No recorded activity within the existing inactivity rule.', leads.inactive);
  if (jobs.kind === 'available') {
    addAttention('overdue-jobs', 'Overdue Jobs', 'Active Jobs with deadlines before business-local today.', jobs.overdue);
    addAttention('waiting-jobs', 'Waiting Jobs', 'Current Jobs in the Waiting status.', jobs.waiting);
  }
  if (calendar.kind === 'available') addAttention('upcoming-visits', 'Upcoming visits', 'Canonical visits in the next seven days, including today.', calendar.visits);
  const result: BusinessOverviewResult = {
    today: response.today, timezone: response.timezone, from: response.from, to: response.to,
    snapshotLabel: snapshot, currentSnapshotLabel: snapshot, scopeLabel: scope, currentScopeLabel: scope,
    upcomingVisitsRangeLabel: visitsRange,
    periodMetrics: [
      metric('new-leads', count(leads, leads.kind === 'available' ? leads.created : 0), periodBasis),
      metric('jobs-created', count(jobs, jobs.kind === 'available' ? jobs.created : 0), periodBasis),
      metric('jobs-completed', count(jobs, jobs.kind === 'available' ? jobs.completed : 0), periodBasis),
      metric('accepted-estimates', count(estimates, estimates.kind === 'available' ? estimates.accepted : 0), periodBasis),
      metric('accepted-value', estimates.kind === 'unavailable' ? { kind: 'unavailable', reason: estimates.explanation }
        : estimates.acceptedMoney.kind === 'available' ? { kind: 'formatted', displayValue: formatMoney(estimates.acceptedMoney.preTaxCents) }
          : { kind: 'unavailable', reason: estimates.acceptedMoney.explanation }, periodBasis),
    ],
    currentMetrics: [
      metric('new-lead-stage', count(leads, leads.kind === 'available' ? leads.stages.new : 0), currentBasis),
      metric('contacted-lead-stage', count(leads, leads.kind === 'available' ? leads.stages.contacted : 0), currentBasis),
      metric('estimate-sent-lead-stage', count(leads, leads.kind === 'available' ? leads.stages['estimate-sent'] : 0), currentBasis),
      metric('awaiting-estimates', count(estimates, estimates.kind === 'available' ? estimates.awaiting : 0), currentBasis),
      metric('active-jobs', count(jobs, jobs.kind === 'available' ? jobs.active : 0), currentBasis),
      metric('overdue-jobs', count(jobs, jobs.kind === 'available' ? jobs.overdue : 0), currentBasis),
      metric('upcoming-visits', count(calendar, calendar.kind === 'available' ? calendar.visits : 0), `Next seven days / ${visitsRange}`),
    ],
    attention: leads.kind === 'unavailable' && jobs.kind === 'unavailable' && calendar.kind === 'unavailable'
      ? { kind: 'unavailable', reason: copy.unavailableAttention } : { kind: 'available', items: attention },
  };
  if (!validBusinessOverviewResult(result, input.period, input.today, input.timezone)) throw new Error('Overview metrics and native coverage cannot be displayed consistently. Retry the report.');
  return { scopeKey: input.scopeKey, state: { kind: 'ready', result } };
}
