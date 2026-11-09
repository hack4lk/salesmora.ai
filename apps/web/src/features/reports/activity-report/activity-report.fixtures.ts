import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';
import {
  activityDomains,
  activityEventDateInTimezone,
  compareActivityEvents,
  type ActivityAction,
  type ActivityDomain,
  type ActivityEvent,
  type ActivityFilterOptions,
  type ActivityFiltersValue,
  type ActivityReportResult,
} from './activity-report.validation';

export const activityReportToday = '2026-11-06';
export const activityReportTimezone = 'Europe/Warsaw';
export const emptyActivityFilters: ActivityFiltersValue = { domains: [], actions: [], actors: [] };
export const defaultActivityPeriod: ReportPeriodSelection = { preset: 'last30days' };
const event = (domain: ActivityDomain, eventId: string, occurredAt: string, action: ActivityAction,
  actor: ActivityEvent['actor'], recordId: string, recordLabel: string): ActivityEvent =>
  ({ domain, eventId, occurredAt, action, actor, recordId, recordLabel });

export const authorizedActivityEvents: readonly ActivityEvent[] = [
  event('lead', 'shared-1', '2026-11-06T09:00:00.000Z', 'created',
    { kind: 'member', key: 'member-ava', label: 'Ava Morgan' }, 'lead-101', 'Lead L-101 / Morgan Ellis'),
  event('customer', 'shared-1', '2026-11-06T09:00:00.000Z', 'updated',
    { kind: 'system', key: 'system', label: 'System' }, 'customer-204', 'Customer C-204 / Morgan Ellis'),
  event('job', 'job-status-7', '2026-11-05T16:30:00.000Z', 'status-changed',
    { kind: 'member', key: 'member-sam', label: 'Sam Rivera' }, 'job-1042', 'Job J-1042 / Panel upgrade'),
  event('estimate', 'estimate-decision-2', '2026-11-04T12:15:00.000Z', 'decision-recorded',
    { kind: 'member', key: 'member-ava', label: 'Ava Morgan' }, 'estimate-family-22', 'Estimate E-0022 / Kitchen remodel'),
  event('work-order', 'wo-visit-4', '2026-11-03T08:45:00.000Z', 'visit-changed',
    { kind: 'member', key: 'member-jamie', label: 'Jamie Taylor' }, 'work-order-304', 'Work Order W-304 / Drain repair'),
  event('lead', 'lead-stage-5', '2026-10-10T11:00:00.000Z', 'stage-changed',
    { kind: 'member', key: 'member-sam', label: 'Sam Rivera' }, 'lead-102', 'Lead L-102 / Priya Shah'),
];

const domainLabels: Record<ActivityDomain, string> = {
  lead: 'Lead', customer: 'Customer', job: 'Job', estimate: 'Estimate', 'work-order': 'Work Order',
};
const actionLabels: Record<ActivityAction, string> = {
  created: 'Created', updated: 'Updated', archived: 'Archived', 'stage-changed': 'Stage changed',
  'assignment-changed': 'Assignment changed', 'status-changed': 'Status changed',
  'deadline-changed': 'Deadline changed', 'visit-changed': 'Visit changed',
  sent: 'Sent', 'decision-recorded': 'Decision recorded', completed: 'Completed',
};
const options = <T extends string>(values: readonly T[], label: (value: T) => string): readonly ReportScopeOption[] =>
  [...new Set(values)].map(value => ({ value, label: label(value) }));
export const activityFilterOptions: ActivityFilterOptions = {
  domains: activityDomains.map(value => ({ value, label: domainLabels[value] })),
  actions: options(authorizedActivityEvents.map(row => row.action), value => actionLabels[value]),
  actors: options(authorizedActivityEvents.map(row => row.actor.key), value =>
    authorizedActivityEvents.find(row => row.actor.key === value)!.actor.label),
};

function matches<T extends string>(selected: readonly T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

/** Fictional host response: authorized events are filtered, ordered, then paginated as a single projection. */
export function activityReportResponse({
  period = defaultActivityPeriod,
  filters = emptyActivityFilters,
  page = 1,
  pageSize = 25,
  rows = authorizedActivityEvents,
}: {
  period?: ReportPeriodSelection;
  filters?: ActivityFiltersValue;
  page?: number;
  pageSize?: number;
  rows?: readonly ActivityEvent[];
} = {}): ActivityReportResult {
  const from = period.preset === 'custom' ? period.from : '2026-10-08';
  const to = period.preset === 'custom' ? period.to : activityReportToday;
  const filtered = rows.filter(row => {
    const localDate = activityEventDateInTimezone(row.occurredAt, activityReportTimezone);
    return localDate >= from && localDate <= to &&
      matches(filters.domains, row.domain) && matches(filters.actions, row.action) &&
      matches(filters.actors, row.actor.key);
  }).sort(compareActivityEvents);
  const start = (page - 1) * pageSize;
  return {
    from, to, today: activityReportToday, timezone: activityReportTimezone,
    periodLabel: `${from} to ${to}, both dates included`,
    snapshotLabel: 'November 6, 2026 at 10:00 / Europe/Warsaw',
    scopeLabel: 'Authorized activity for currently readable parent records.',
    filters: { domains: [...filters.domains], actions: [...filters.actions], actors: [...filters.actors] },
    total: filtered.length, rows: filtered.slice(start, page * pageSize), page, pageSize,
  };
}
