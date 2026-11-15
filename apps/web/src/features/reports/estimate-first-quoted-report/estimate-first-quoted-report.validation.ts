import { jobDateSchema } from '@salesmora/contracts';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';

export const firstQuotedCurrentStatuses = ['sent', 'published', 'accepted', 'declined', 'expired', 'void'] as const;
export type EstimateFirstQuotedRow = {
  /** Opaque workspace-qualified family identity, not the display number. */
  familyId: string;
  estimateNumber: string;
  label: string;
  recordId?: string;
  firstIssuedDate: string;
  firstIssuedRevision: number;
  firstIssuedVia: 'send' | 'publish';
  currentIssuedRevision: number;
  currentIssuedDate: string;
  currentStatus: typeof firstQuotedCurrentStatuses[number];
  archived: boolean;
};
export type EstimateFirstQuotedResult = {
  from: string;
  to: string;
  today: string;
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  total: number;
  coverage: { kind: 'complete' } | { kind: 'partial'; explanation: string };
  evidenceId?: string;
  rows: readonly EstimateFirstQuotedRow[];
  page: number;
  pageSize: number;
};
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
const date = (value: string) => !value.startsWith('0000') && jobDateSchema.safeParse(value).success;

export function validEstimateFirstQuotedResult(result: EstimateFirstQuotedResult): boolean {
  return date(result.today) &&
    !!resolveReportPeriod({ preset: 'custom', from: result.from, to: result.to }, result.today, 'history').range &&
    [result.periodLabel, result.snapshotLabel, result.scopeLabel].every(label => label.trim()) &&
    Number.isSafeInteger(result.total) && result.total >= 0 &&
    (result.coverage.kind === 'complete' || result.coverage.explanation.trim() !== '') &&
    positive(result.page) && positive(result.pageSize) &&
    result.page <= Math.max(1, Math.ceil(result.total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, result.total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.familyId)).size === result.rows.length &&
    result.rows.every(row => row.familyId.trim() && row.estimateNumber.trim() && row.label.trim() &&
      (row.recordId === undefined || row.recordId.trim()) &&
      positive(row.firstIssuedRevision) && positive(row.currentIssuedRevision) && row.firstIssuedRevision <= row.currentIssuedRevision &&
      (row.firstIssuedVia === 'send' || row.firstIssuedVia === 'publish') &&
      firstQuotedCurrentStatuses.some(status => status === row.currentStatus) &&
      date(row.firstIssuedDate) && row.firstIssuedDate >= result.from && row.firstIssuedDate <= result.to &&
      date(row.currentIssuedDate) && row.currentIssuedDate >= row.firstIssuedDate && row.currentIssuedDate <= result.today &&
      (row.firstIssuedRevision !== row.currentIssuedRevision || row.firstIssuedDate === row.currentIssuedDate));
}
