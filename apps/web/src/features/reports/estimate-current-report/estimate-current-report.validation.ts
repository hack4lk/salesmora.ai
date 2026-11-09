import { jobDateSchema } from '@salesmora/contracts';
import { completionElapsedDays } from '../job-completion-report/job-completion-report.validation';
import { validEstimateFrozenMoney, validEstimateMoneyTotal, type EstimateDecisionMoney, type EstimateDecisionsMoney } from '../estimate-decisions-report/estimate-decisions-report.validation';

export type EstimateCurrentQueue = 'awaiting' | 'expired' | 'handoff';
export type EstimateCurrentRow = {
  familyId: string;
  estimateNumber: string;
  revision: number;
  label: string;
  recordId?: string;
  issuedDate: string;
  validUntil: string | null;
  archived: boolean;
  money: EstimateDecisionMoney;
} & (
  | { status: 'sent' | 'published' }
  | { status: 'accepted'; decisionDate: string; parentType: 'lead'; leadArchived: boolean;
    /** Host proves absence under complete linkage access, never from a scoped empty list. */
    linkage: 'confirmed-absent' }
);
export type EstimateCurrentResult = {
  today: string;
  snapshotLabel: string;
  scopeLabel: string;
  counts: Readonly<Record<'awaiting' | 'expired', number>>;
  awaitingMoney: EstimateDecisionsMoney;
  handoff: { kind: 'available'; count: number; evidenceId?: string } | { kind: 'unavailable'; explanation: string };
  evidenceIds: Readonly<Partial<Record<'awaiting' | 'expired', string>>>;
  selected: EstimateCurrentQueue;
  rows: readonly EstimateCurrentRow[];
  page: number;
  pageSize: number;
};
const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
const date = (value: string) => !value.startsWith('0000') && jobDateSchema.safeParse(value).success;

export function estimateCurrentMatchesQueue(row: EstimateCurrentRow, queue: EstimateCurrentQueue, today: string): boolean {
  if (row.archived) return false;
  if (queue === 'handoff') return row.status === 'accepted' && row.parentType === 'lead' && !row.leadArchived && row.linkage === 'confirmed-absent';
  return (row.status === 'sent' || row.status === 'published') &&
    (queue === 'expired' ? row.validUntil !== null && row.validUntil < today : row.validUntil === null || row.validUntil >= today);
}

export function estimateCurrentTotal(result: EstimateCurrentResult, canReadHandoff: boolean): number | undefined {
  return result.selected === 'handoff' ? canReadHandoff && result.handoff.kind === 'available' ? result.handoff.count : undefined
    : result.counts[result.selected];
}

export function validEstimateCurrentResult(result: EstimateCurrentResult, canReadMoney: boolean, canReadHandoff: boolean): boolean {
  if (!date(result.today) || ![result.snapshotLabel, result.scopeLabel].every(label => label.trim()) ||
    ![result.counts.awaiting, result.counts.expired, result.counts.awaiting + result.counts.expired].every(count) ||
    (canReadHandoff && (result.handoff.kind === 'available' ? !count(result.handoff.count) : !result.handoff.explanation.trim()))) return false;
  const total = estimateCurrentTotal(result, canReadHandoff);
  // A revoked/unavailable selected handoff must never render or inspect its stale rows.
  if (total === undefined) return !canReadMoney || validEstimateMoneyTotal(result.awaitingMoney, [], result.counts.awaiting);
  if (!count(result.page) || result.page < 1 || !count(result.pageSize) || result.pageSize < 1 ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    result.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) ||
    new Set(result.rows.map(row => row.familyId)).size !== result.rows.length ||
    !result.rows.every(row => row.familyId.trim() && row.estimateNumber.trim() && row.label.trim() &&
      (row.recordId === undefined || row.recordId.trim()) && Number.isSafeInteger(row.revision) && row.revision > 0 &&
      completionElapsedDays(row.issuedDate, result.today) !== undefined && (row.validUntil === null || date(row.validUntil)) &&
      (row.status !== 'accepted' || date(row.decisionDate) && row.decisionDate >= row.issuedDate && row.decisionDate <= result.today) &&
      estimateCurrentMatchesQueue(row, result.selected, result.today))) return false;
  if (!canReadMoney) return true;
  return result.rows.every(row => validEstimateFrozenMoney(row.money)) &&
    validEstimateMoneyTotal(result.awaitingMoney, result.selected === 'awaiting' ? result.rows.map(row => row.money) : [], result.counts.awaiting);
}
