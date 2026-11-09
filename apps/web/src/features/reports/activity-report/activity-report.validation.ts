import { validReportTimezone, resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';

export const activityDomains = ['lead', 'customer', 'job', 'estimate', 'work-order'] as const;
export type ActivityDomain = typeof activityDomains[number];
export const activityActions = [
  'created', 'updated', 'archived', 'stage-changed', 'assignment-changed',
  'status-changed', 'deadline-changed', 'visit-changed', 'sent',
  'decision-recorded', 'completed',
] as const;
export type ActivityAction = typeof activityActions[number];

export type ActivityFiltersValue = {
  domains: readonly ActivityDomain[];
  actions: readonly ActivityAction[];
  actors: readonly string[];
};
export type ActivityFilterOptions = {
  domains: readonly ReportScopeOption[];
  actions: readonly ReportScopeOption[];
  actors: readonly ReportScopeOption[];
};
export type ActivityActor =
  | { kind: 'member'; key: string; label: string }
  | { kind: 'system'; key: 'system'; label: 'System' };
export type ActivityEvent = {
  domain: ActivityDomain;
  eventId: string;
  occurredAt: string;
  action: ActivityAction;
  actor: ActivityActor;
  recordId: string;
  recordLabel: string;
};
export type ActivityReportResult = {
  from: string;
  to: string;
  today: string;
  timezone: string;
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  filters: ActivityFiltersValue;
  total: number;
  rows: readonly ActivityEvent[];
  page: number;
  pageSize: number;
};

const domainActions: Readonly<Record<ActivityDomain, readonly ActivityAction[]>> = {
  lead: ['created', 'updated', 'archived', 'stage-changed', 'assignment-changed'],
  customer: ['created', 'updated', 'archived'],
  job: ['created', 'updated', 'archived', 'assignment-changed', 'status-changed', 'deadline-changed', 'visit-changed', 'completed'],
  estimate: ['created', 'updated', 'archived', 'sent', 'decision-recorded'],
  'work-order': ['created', 'updated', 'archived', 'assignment-changed', 'status-changed', 'visit-changed', 'completed'],
};
const dateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
  new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const nonnegative = (value: number) => Number.isSafeInteger(value) && value >= 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
const safeText = (value: string, limit: number) =>
  value.trim() !== '' && value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const hasExactKeys = (value: object, keys: readonly string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isActivityDomain = (value: string): value is ActivityDomain =>
  activityDomains.some(domain => domain === value);
const isActivityAction = (value: string): value is ActivityAction =>
  activityActions.some(action => action === value);
const sameSelection = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
const optionList = (options: readonly ReportScopeOption[], validValue: (value: string) => boolean) =>
  Array.isArray(options) &&
  options.every(option => isRecord(option) && hasExactKeys(option, ['value', 'label']) &&
    typeof option.value === 'string' &&
    typeof option.label === 'string' && safeText(option.value, 128) &&
    safeText(option.label, 100) && validValue(option.value)) &&
  new Set(options.map(option => option.value)).size === options.length;

export function validActivityFilterOptions(options: ActivityFilterOptions): boolean {
  return isRecord(options) && hasExactKeys(options, ['domains', 'actions', 'actors']) &&
    optionList(options.domains, value => activityDomains.some(domain => domain === value)) &&
    optionList(options.actions, value => activityActions.some(action => action === value)) &&
    optionList(options.actors, value => value === 'system' || value.trim() !== '');
}

export function validActivityFilters(value: ActivityFiltersValue, options: ActivityFilterOptions): boolean {
  return isRecord(value) && hasExactKeys(value, ['domains', 'actions', 'actors']) &&
    Array.isArray(value.domains) && Array.isArray(value.actions) && Array.isArray(value.actors) &&
    validActivityFilterOptions(options) &&
    value.domains.length <= activityDomains.length &&
    new Set(value.domains).size === value.domains.length &&
    value.domains.every(domain => options.domains.some(option => option.value === domain)) &&
    value.actions.length <= activityActions.length &&
    new Set(value.actions).size === value.actions.length &&
    value.actions.every(action => options.actions.some(option => option.value === action)) &&
    value.actors.length <= 50 &&
    new Set(value.actors).size === value.actors.length &&
    value.actors.every(actor => options.actors.some(option => option.value === actor));
}

export function activityEventKey(event: Pick<ActivityEvent, 'domain' | 'eventId'>): string {
  return `${event.domain}:${event.eventId}`;
}

export function activityEventDateInTimezone(timestamp: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(timestamp));
  const part = (type: string) => parts.find(value => value.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function compareActivityEvents(left: ActivityEvent, right: ActivityEvent): number {
  const seconds = (timestamp: string) => Math.floor(Date.parse(timestamp) / 1000);
  const fraction = (timestamp: string) => (/\.(\d+)/.exec(timestamp)?.[1] ?? '').padEnd(9, '0');
  const timeDifference = seconds(right.occurredAt) - seconds(left.occurredAt);
  if (timeDifference) return timeDifference;
  const leftFraction = fraction(left.occurredAt), rightFraction = fraction(right.occurredAt);
  if (leftFraction !== rightFraction) return leftFraction > rightFraction ? -1 : 1;
  const leftKey = activityEventKey(left), rightKey = activityEventKey(right);
  return leftKey === rightKey ? 0 : leftKey < rightKey ? -1 : 1;
}

function validActor(actor: ActivityActor, options: ActivityFilterOptions): boolean {
  if (!isRecord(actor) || !hasExactKeys(actor, ['kind', 'key', 'label']) ||
    typeof actor.kind !== 'string' || typeof actor.key !== 'string' || typeof actor.label !== 'string') return false;
  if (actor.kind === 'system')
    return actor.key === 'system' && actor.label === 'System' &&
      options.actors.some(option => option.value === 'system' && option.label === 'System');
  return actor.kind === 'member' && actor.key.trim() !== '' && actor.key !== 'system' &&
    safeText(actor.key, 128) && safeText(actor.label, 100) &&
    options.actors.some(option => option.value === actor.key && option.label === actor.label);
}

function validEvent(event: ActivityEvent, options: ActivityFilterOptions, result: ActivityReportResult): boolean {
  if (!isRecord(event) || !hasExactKeys(event, ['domain', 'eventId', 'occurredAt', 'action', 'actor', 'recordId', 'recordLabel']) ||
    typeof event.eventId !== 'string' || typeof event.occurredAt !== 'string' ||
    typeof event.recordId !== 'string' || typeof event.recordLabel !== 'string' ||
    typeof event.action !== 'string' || !isRecord(event.actor) ||
    !isActivityDomain(event.domain) ||
    !isActivityAction(event.action) ||
    !domainActions[event.domain].some(action => action === event.action) ||
    !safeText(event.eventId, 128) || !safeText(event.recordId, 128) ||
    !safeText(event.recordLabel, 160) ||
    !Number.isFinite(Date.parse(event.occurredAt)) ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(event.occurredAt)) return false;
  const eventDate = activityEventDateInTimezone(event.occurredAt, result.timezone);
  if (!dateOnly(eventDate) || eventDate < result.from || eventDate > result.to ||
    !validActor(event.actor, options)) return false;
  return (!result.filters.domains.length || result.filters.domains.includes(event.domain)) &&
    (!result.filters.actions.length || result.filters.actions.includes(event.action)) &&
    (!result.filters.actors.length || result.filters.actors.includes(event.actor.key));
}

export function validActivityReportResult(
  result: ActivityReportResult,
  period: ReportPeriodSelection,
  filters: ActivityFiltersValue,
  options: ActivityFilterOptions,
  expectedToday: string,
  expectedTimezone: string,
): boolean {
  if (!isRecord(result) || !Array.isArray(result.rows) ||
    !hasExactKeys(result, [
      'from', 'to', 'today', 'timezone', 'periodLabel', 'snapshotLabel', 'scopeLabel',
      'filters', 'total', 'rows', 'page', 'pageSize',
    ]) ||
    !isRecord(result.filters) || !hasExactKeys(result.filters, ['domains', 'actions', 'actors']) ||
    typeof result.today !== 'string' ||
    typeof result.timezone !== 'string' || typeof result.periodLabel !== 'string' ||
    typeof result.snapshotLabel !== 'string' || typeof result.scopeLabel !== 'string') return false;
  const range = resolveReportPeriod(period, result.today, 'history');
  if (!range.range || result.today !== expectedToday || result.timezone !== expectedTimezone ||
    !validReportTimezone(expectedTimezone) ||
    ![result.periodLabel, result.snapshotLabel].every(value => safeText(value, 200)) ||
    !safeText(result.scopeLabel, 4000) ||
    result.from !== range.range.from || result.to !== range.range.to ||
    !validActivityFilters(filters, options) ||
    !sameSelection(result.filters.domains, filters.domains) ||
    !sameSelection(result.filters.actions, filters.actions) ||
    !sameSelection(result.filters.actors, filters.actors) ||
    !nonnegative(result.total) || !positive(result.page) || !positive(result.pageSize) ||
    result.page > Math.max(1, Math.ceil(result.total / result.pageSize)) ||
    result.rows.length !== Math.min(result.pageSize, Math.max(0, result.total - (result.page - 1) * result.pageSize)) ||
    result.rows.some((event, index) => !validEvent(event, options, result) ||
      index > 0 && compareActivityEvents(result.rows[index - 1]!, event) > 0) ||
    new Set(result.rows.map(activityEventKey)).size !== result.rows.length) return false;
  return true;
}
