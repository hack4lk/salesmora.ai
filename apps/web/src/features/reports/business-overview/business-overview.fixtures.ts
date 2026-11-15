import { addCalendarDays } from '@salesmora/domain';
import { formatMoney } from '@salesmora/ui';
import {
  resolveReportPeriod,
  type ReportPeriodSelection,
} from '../report-date-controls/report-date-controls.validation';
import {
  overviewCurrentMetricIds,
  overviewPeriodMetricIds,
  type BusinessOverviewResult,
  type OverviewAttentionId,
  type OverviewMetric,
} from './business-overview.validation';
import { businessOverviewData as copy } from './business-overview.data';

export const businessOverviewToday = '2026-11-06';
export const businessOverviewTimezone = 'Europe/Warsaw';
export const defaultBusinessOverviewPeriod: ReportPeriodSelection = { preset: 'last30days' };
const leads = [
  { createdAt: '2026-10-12' },
  { createdAt: '2026-10-25' },
  { createdAt: '2026-11-03' },
  { createdAt: '2026-09-20' },
];
const jobs = [
  { createdAt: '2026-10-18', completedAt: '2026-10-22' },
  { createdAt: '2026-10-29', completedAt: '2026-11-02' },
  { createdAt: '2026-11-04', completedAt: null },
];
const acceptedEstimates = [
  { decisionDate: '2026-10-15', preTaxCents: 240_000 },
  { decisionDate: '2026-10-23', preTaxCents: 80_000 },
  { decisionDate: '2026-09-15', preTaxCents: 125_000 },
];
export function businessOverviewAcceptedCents(from: string, to: string): number {
  return acceptedEstimates.filter(row => row.decisionDate >= from && row.decisionDate <= to)
    .reduce((total, row) => total + row.preTaxCents, 0);
}

function metric<Id extends string>(
  id: Id,
  label: string,
  value: OverviewMetric<Id>['value'],
  dateBasisLabel: string,
  evidenceId?: OverviewMetric<Id>['evidenceId'],
): OverviewMetric<Id> {
  return {
    id,
    label,
    value,
    description: copy.metricDescriptions[id as keyof typeof copy.metricDescriptions],
    dateBasisLabel,
    ...(evidenceId ? { evidenceId } : {}),
  };
}

export function businessOverviewResponse({
  period = defaultBusinessOverviewPeriod,
  canReadEstimateValues = true,
  attentionUnavailable = false,
}: {
  period?: ReportPeriodSelection;
  canReadEstimateValues?: boolean;
  attentionUnavailable?: boolean;
} = {}): BusinessOverviewResult {
  const range = resolveReportPeriod(period, businessOverviewToday, 'history');
  if (!range.range) throw new Error('The fictional business overview requires a valid historical period.');
  const inRange = (value: string | null) => value !== null &&
    value >= range.range.from && value <= range.range.to;
  const acceptedInPeriod = acceptedEstimates.filter(row => inRange(row.decisionDate));
  const currentSnapshotLabel = 'November 6, 2026 at 10:00 / Europe/Warsaw';
  const currentBasis = `Current snapshot / ${currentSnapshotLabel}`;
  const periodBasis = `Selected period / ${range.range.from} to ${range.range.to}, both dates included`;
  const periodMetrics: OverviewMetric<typeof overviewPeriodMetricIds[number]>[] = [
    metric('new-leads', 'New Leads', { kind: 'count', value: leads.filter(row => inRange(row.createdAt)).length },
      periodBasis, 'new-leads'),
    metric('jobs-created', 'Jobs created', { kind: 'count', value: jobs.filter(row => inRange(row.createdAt)).length },
      periodBasis, 'jobs-created'),
    metric('jobs-completed', 'Jobs completed', { kind: 'count', value: jobs.filter(row => inRange(row.completedAt)).length },
      periodBasis, 'jobs-completed'),
    metric('accepted-estimates', 'Accepted estimates', { kind: 'count', value: acceptedInPeriod.length },
      periodBasis, 'accepted-estimates'),
    metric('accepted-value', 'Accepted pre-tax value',
      canReadEstimateValues
        ? { kind: 'formatted', displayValue: formatMoney(businessOverviewAcceptedCents(range.range.from, range.range.to)) }
        : { kind: 'unavailable', reason: 'Estimate amounts are unavailable under current price permissions.' },
      periodBasis, canReadEstimateValues ? 'accepted-value' : undefined),
  ];
  const currentMetrics: OverviewMetric<typeof overviewCurrentMetricIds[number]>[] = [
    metric('new-lead-stage', 'New Leads', { kind: 'count', value: 4 }, currentBasis, 'new-lead-stage'),
    metric('contacted-lead-stage', 'Contacted Leads', { kind: 'count', value: 3 }, currentBasis, 'contacted-lead-stage'),
    metric('estimate-sent-lead-stage', 'Estimate sent Leads', { kind: 'count', value: 2 }, currentBasis, 'estimate-sent-lead-stage'),
    metric('awaiting-estimates', 'Estimates awaiting decision', { kind: 'count', value: 2 }, currentBasis, 'awaiting-estimates'),
    metric('active-jobs', 'Active Jobs', { kind: 'count', value: 5 }, currentBasis, 'active-jobs'),
    metric('overdue-jobs', 'Overdue Jobs', { kind: 'count', value: 1 }, currentBasis, 'overdue-jobs'),
    metric('upcoming-visits', 'Upcoming visits', { kind: 'count', value: 3 },
      `Next seven days / ${businessOverviewToday} to ${addCalendarDays(businessOverviewToday, 6)}, including today`,
      'upcoming-visits'),
  ];
  const attentionIds: readonly OverviewAttentionId[] = [
    'stale-leads',
    'overdue-jobs',
    'waiting-jobs',
    'upcoming-visits',
  ];
  const attentionItems = [
    { id: 'stale-leads', label: 'Inactive open Leads', description: 'No recorded activity within the existing inactivity rule.', count: 2, evidenceId: 'stale-leads' },
    { id: 'overdue-jobs', label: 'Overdue Jobs', description: 'Active Jobs with deadlines before business-local today.', count: 1, evidenceId: 'overdue-jobs' },
    { id: 'waiting-jobs', label: 'Waiting Jobs', description: 'Current Jobs in the Waiting status.', count: 1, evidenceId: 'waiting-jobs' },
    { id: 'upcoming-visits', label: 'Upcoming visits', description: 'Canonical visits scheduled in the next seven days, including today.', count: 3, evidenceId: 'upcoming-visits' },
  ] as const;
  return {
    today: businessOverviewToday,
    timezone: businessOverviewTimezone,
    from: range.range.from,
    to: range.range.to,
    snapshotLabel: currentSnapshotLabel,
    scopeLabel: 'Authorized surviving records under current report and domain grants.',
    currentSnapshotLabel,
    currentScopeLabel: 'Current lead, estimate, Job and Calendar projections within their independent grants.',
    upcomingVisitsRangeLabel: `${businessOverviewToday} to ${addCalendarDays(businessOverviewToday, 6)}, including today`,
    periodMetrics,
    currentMetrics,
    attention: attentionUnavailable
      ? { kind: 'unavailable', reason: copy.unavailableAttention }
      : { kind: 'available', items: attentionIds.map(id => attentionItems.find(item => item.id === id)!) },
  };
}
