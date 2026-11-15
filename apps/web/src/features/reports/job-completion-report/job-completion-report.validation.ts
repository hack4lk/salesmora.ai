import { addCalendarDays } from '@salesmora/domain';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';
import { validReportBreakdown } from '../report-breakdown/report-breakdown.validation';
import type { ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';

export type JobCompletionRow = ReportEvidenceRow & {
  /** Business-local dates from the server-selected event; no browser timestamp conversion. */
  createdDate: string | null;
  completionDate: string;
};
export type JobCompletionResult = {
  from: string;
  to: string;
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  total: number;
  coverage: { kind: 'complete' } | { kind: 'partial'; explanation: string };
  days: readonly { date: string; count: number; evidenceId?: string }[];
  duration: { sampleSize: number; totalElapsedDays: number; explanation?: string };
  evidenceId?: string;
  selectedDate?: string;
  rows: readonly JobCompletionRow[];
  page: number;
  pageSize: number;
};

export function completionElapsedDays(createdDate: string, completionDate: string): number | undefined {
  // Validate each date without imposing the report's 366-day limit on Job age.
  for (const date of [createdDate, completionDate]) {
    if (!resolveReportPeriod({ preset: 'custom', from: date, to: date }, date, 'history').range) return undefined;
  }
  if (completionDate < createdDate) return undefined;
  return (Date.parse(`${completionDate}T12:00:00Z`) - Date.parse(`${createdDate}T12:00:00Z`)) / 86400000;
}

export function validJobCompletionResult(result: JobCompletionResult): boolean {
  const period = resolveReportPeriod({ preset: 'custom', from: result.from, to: result.to }, result.to, 'history').range;
  if (!period || result.days.length !== period.count ||
    !result.days.every((day, i) => day.date === addCalendarDays(result.from, i)) ||
    !validReportBreakdown(result.total, result.days.map(day => ({ id: day.date, count: day.count })))) return false;
  const { sampleSize, totalElapsedDays, explanation } = result.duration;
  if (!Number.isSafeInteger(sampleSize) || sampleSize < 0 || sampleSize > result.total ||
    !Number.isSafeInteger(totalElapsedDays) || totalElapsedDays < 0 || (sampleSize === 0 && totalElapsedDays !== 0) ||
    (sampleSize < result.total && !explanation?.trim()) ||
    (result.coverage.kind === 'partial' && !result.coverage.explanation.trim())) return false;
  const selected = result.selectedDate === undefined ? undefined : result.days.find(day => day.date === result.selectedDate);
  if (result.selectedDate !== undefined && !selected) return false;
  const total = selected?.count ?? result.total;
  if (!Number.isSafeInteger(result.page) || result.page < 1 || !Number.isSafeInteger(result.pageSize) || result.pageSize < 1 ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    result.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) ||
    new Set(result.rows.map(row => row.id)).size !== result.rows.length) return false;
  const validRows = result.rows.every(row => row.id.trim() &&
    (row.createdDate === null ? sampleSize < result.total : completionElapsedDays(row.createdDate, row.completionDate) !== undefined) &&
    !!resolveReportPeriod({ preset: 'custom', from: row.completionDate, to: row.completionDate }, row.completionDate, 'history').range &&
    row.completionDate >= result.from && row.completionDate <= result.to &&
    (result.selectedDate === undefined || row.completionDate === result.selectedDate) &&
    ['status', 'owner'].every(column => Object.hasOwn(row.cells, column)));
  if (!validRows) return false;
  const rowSamples = result.rows.filter(row => row.createdDate !== null);
  if (result.rows.length - rowSamples.length > result.total - sampleSize || rowSamples.length > sampleSize) return false;
  if (result.selectedDate === undefined && result.rows.length === result.total) {
    return rowSamples.length === sampleSize &&
      rowSamples.reduce((sum, row) => sum + completionElapsedDays(row.createdDate!, row.completionDate)!, 0) === totalElapsedDays &&
      result.days.every(day => result.rows.filter(row => row.completionDate === day.date).length === day.count);
  }
  return true;
}
