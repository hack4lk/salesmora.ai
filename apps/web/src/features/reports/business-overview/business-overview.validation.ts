import { jobDateSchema } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import {
  resolveReportPeriod,
  validReportTimezone,
  type ReportPeriodSelection,
} from '../report-date-controls/report-date-controls.validation';
import type { ReportSummaryMetric } from '../report-summary/report-summary';

export const overviewPeriodMetricIds = [
  'new-leads',
  'jobs-created',
  'jobs-completed',
  'accepted-estimates',
  'accepted-value',
] as const;
export const overviewCurrentMetricIds = [
  'new-lead-stage',
  'contacted-lead-stage',
  'estimate-sent-lead-stage',
  'awaiting-estimates',
  'active-jobs',
  'overdue-jobs',
  'upcoming-visits',
] as const;
export const overviewEvidenceIds = [
  ...overviewPeriodMetricIds,
  ...overviewCurrentMetricIds,
  'stale-leads',
  'waiting-jobs',
] as const;
export const overviewAttentionIds = [
  'stale-leads',
  'overdue-jobs',
  'waiting-jobs',
  'upcoming-visits',
] as const;

export type OverviewPeriodMetricId = typeof overviewPeriodMetricIds[number];
export type OverviewCurrentMetricId = typeof overviewCurrentMetricIds[number];
export type OverviewEvidenceId = typeof overviewEvidenceIds[number];
export type OverviewAttentionId = typeof overviewAttentionIds[number];
export type OverviewMetric<Id extends string> = Omit<ReportSummaryMetric, 'id' | 'evidenceId'> & {
  id: Id;
  evidenceId?: OverviewEvidenceId;
};
export type OverviewAttentionItem = {
  id: OverviewAttentionId;
  label: string;
  description: string;
  count: number;
  evidenceId: OverviewEvidenceId;
};
export type OverviewAttention =
  | { kind: 'available'; items: readonly OverviewAttentionItem[] }
  | { kind: 'unavailable'; reason: string };
export type BusinessOverviewResult = {
  today: string;
  timezone: string;
  from: string;
  to: string;
  snapshotLabel: string;
  scopeLabel: string;
  currentSnapshotLabel: string;
  currentScopeLabel: string;
  upcomingVisitsRangeLabel: string;
  periodMetrics: readonly OverviewMetric<OverviewPeriodMetricId>[];
  currentMetrics: readonly OverviewMetric<OverviewCurrentMetricId>[];
  attention: OverviewAttention;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactKeys = (value: object, required: readonly string[], optional: readonly string[] = []) =>
  required.every(key => Object.hasOwn(value, key)) &&
  Object.keys(value).every(key => required.includes(key) || optional.includes(key));
const safeText = (value: unknown, limit: number): value is string =>
  typeof value === 'string' && value.trim() !== '' && value.length <= limit &&
  !/[\u0000-\u001f\u007f]/.test(value);
const isDate = (value: unknown): value is string =>
  typeof value === 'string' && !value.startsWith('0000') && jobDateSchema.safeParse(value).success;
const isNonnegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

function validMetric(value: unknown, allowedIds: readonly string[]): value is OverviewMetric<string> {
  if (!isRecord(value) || !hasExactKeys(value,
    ['id', 'label', 'value', 'description', 'dateBasisLabel'], ['evidenceId']) ||
    typeof value.id !== 'string' || !allowedIds.includes(value.id) ||
    !safeText(value.label, 120) || !safeText(value.description, 400) ||
    !safeText(value.dateBasisLabel, 240)) return false;
  if (value.evidenceId !== undefined &&
    (typeof value.evidenceId !== 'string' || !overviewEvidenceIds.includes(value.evidenceId as OverviewEvidenceId))) {
    return false;
  }
  if (!isRecord(value.value) || typeof value.value.kind !== 'string') return false;
  switch (value.value.kind) {
    case 'count':
      return hasExactKeys(value.value, ['kind', 'value']) && isNonnegativeInteger(value.value.value);
    case 'formatted':
      return hasExactKeys(value.value, ['kind', 'displayValue']) && safeText(value.value.displayValue, 80);
    case 'incomplete':
      return hasExactKeys(value.value, ['kind', 'displayValue', 'coverageLabel']) &&
        safeText(value.value.displayValue, 80) && safeText(value.value.coverageLabel, 200);
    case 'unavailable':
      return hasExactKeys(value.value, ['kind', 'reason']) && safeText(value.value.reason, 240) &&
        value.evidenceId === undefined;
    default:
      return false;
  }
}

function validMetricSet(value: unknown, expectedIds: readonly string[]): value is readonly OverviewMetric<string>[] {
  if (!Array.isArray(value) || value.length !== expectedIds.length ||
    !value.every(metric => validMetric(metric, expectedIds))) return false;
  const ids = value.map(metric => (metric as OverviewMetric<string>).id);
  return new Set(ids).size === expectedIds.length && expectedIds.every(id => ids.includes(id));
}

function validAttention(value: unknown): value is OverviewAttention {
  if (!isRecord(value) || typeof value.kind !== 'string') return false;
  if (value.kind === 'unavailable') {
    return hasExactKeys(value, ['kind', 'reason']) && safeText(value.reason, 240);
  }
  if (value.kind !== 'available' || !hasExactKeys(value, ['kind', 'items']) ||
    !Array.isArray(value.items) || value.items.length > overviewAttentionIds.length ||
    !value.items.every(item => isRecord(item) &&
      hasExactKeys(item, ['id', 'label', 'description', 'count', 'evidenceId']) &&
      typeof item.id === 'string' && overviewAttentionIds.includes(item.id as OverviewAttentionId) &&
      safeText(item.label, 120) && safeText(item.description, 240) &&
      isNonnegativeInteger(item.count) && typeof item.evidenceId === 'string' &&
      overviewEvidenceIds.includes(item.evidenceId as OverviewEvidenceId))) return false;
  return new Set(value.items.map(item => (item as OverviewAttentionItem).id)).size === value.items.length;
}

export function validBusinessOverviewResult(
  result: BusinessOverviewResult,
  period: ReportPeriodSelection,
  expectedToday: string,
  expectedTimezone: string,
): boolean {
  if (!isRecord(result) || !hasExactKeys(result, [
    'today', 'timezone', 'from', 'to', 'snapshotLabel', 'scopeLabel',
    'currentSnapshotLabel', 'currentScopeLabel', 'upcomingVisitsRangeLabel',
    'periodMetrics', 'currentMetrics', 'attention',
  ]) || !isDate(result.today) || result.today !== expectedToday ||
    result.timezone !== expectedTimezone || !validReportTimezone(expectedTimezone) ||
    !isDate(result.from) || !isDate(result.to) ||
    ![result.snapshotLabel, result.currentSnapshotLabel, result.upcomingVisitsRangeLabel].every(label => safeText(label, 240)) ||
    ![result.scopeLabel, result.currentScopeLabel].every(label => safeText(label, 40000)) ||
    !validMetricSet(result.periodMetrics, overviewPeriodMetricIds) ||
    !validMetricSet(result.currentMetrics, overviewCurrentMetricIds) ||
    !validAttention(result.attention)) return false;
  const range = resolveReportPeriod(period, result.today, 'history');
  if (!range.range || result.from !== range.range.from || result.to !== range.range.to) return false;
  const periodBasis = `Selected period / ${result.from} to ${result.to}, both dates included`;
  const currentBasis = `Current snapshot / ${result.currentSnapshotLabel}`;
  const upcomingVisitsBasis =
    `Next seven days / ${result.upcomingVisitsRangeLabel}`;
  const expectedVisitsRange =
    `${result.today} to ${addCalendarDays(result.today, 6)}, including today`;
  return result.upcomingVisitsRangeLabel === expectedVisitsRange &&
    result.periodMetrics.every(metric => metric.dateBasisLabel === periodBasis) &&
    result.currentMetrics.every(metric => metric.id === 'upcoming-visits'
      ? metric.dateBasisLabel === upcomingVisitsBasis
      : metric.dateBasisLabel === currentBasis);
}
