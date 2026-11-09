import { jobDateSchema } from '@salesmora/contracts';
import { formatLeadConversionRate } from '../lead-conversion-report/lead-conversion-report.validation';

export type EstimateDecisionOutcome = 'accepted' | 'declined';
export type EstimateDecisionMoney =
  | { kind: 'available'; preTaxCents: number; taxCents: number; customerTotalCents: number }
  | { kind: 'unavailable'; explanation: string };
export type EstimateDecisionsMoney =
  | { kind: 'available'; preTaxCents: number; customerTotalCents: number }
  | { kind: 'unavailable'; explanation: string };
export type EstimateDecisionRow = {
  /** Opaque workspace-qualified family reference; never join by the display number alone. */
  familyId: string;
  estimateNumber: string;
  revision: number;
  decisionVersion: number;
  recordId?: string;
  label: string;
  outcome: EstimateDecisionOutcome;
  decisionDate: string;
  recordedDate: string;
  archived: boolean;
  money: EstimateDecisionMoney;
};
export type EstimateDecisionsResult = {
  from: string;
  to: string;
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  counts: Readonly<Record<EstimateDecisionOutcome, number>>;
  money: EstimateDecisionsMoney;
  evidenceIds: Readonly<Partial<Record<EstimateDecisionOutcome | 'decided', string>>>;
  selected: EstimateDecisionOutcome | 'decided';
  rows: readonly EstimateDecisionRow[];
  page: number;
  pageSize: number;
};
const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
const positive = (value: number) => count(value) && value > 0;
const date = (value: string) => !value.startsWith('0000') && jobDateSchema.safeParse(value).success;

export function validEstimateFrozenMoney(money: EstimateDecisionMoney): boolean {
  return money.kind === 'unavailable' ? money.explanation.trim() !== ''
    : [money.preTaxCents, money.taxCents, money.customerTotalCents].every(count) &&
      Number.isSafeInteger(money.preTaxCents + money.taxCents) &&
      money.preTaxCents + money.taxCents === money.customerTotalCents;
}

export function validEstimateMoneyTotal(money: EstimateDecisionsMoney, observed: readonly EstimateDecisionMoney[], total: number): boolean {
  if (!observed.every(validEstimateFrozenMoney)) return false;
  if (money.kind === 'unavailable') return money.explanation.trim() !== '';
  if (![money.preTaxCents, money.customerTotalCents].every(count) ||
    money.customerTotalCents < money.preTaxCents || observed.some(value => value.kind === 'unavailable')) return false;
  const known = observed.reduce((sum, value) => value.kind === 'available'
    ? { preTax: sum.preTax + value.preTaxCents, total: sum.total + value.customerTotalCents } : sum, { preTax: 0, total: 0 });
  return [known.preTax, known.total].every(count) && known.preTax <= money.preTaxCents && known.total <= money.customerTotalCents &&
    (observed.length !== total || known.preTax === money.preTaxCents && known.total === money.customerTotalCents);
}

export function estimateDecisionsTotal(result: EstimateDecisionsResult): number {
  return result.selected === 'decided' ? result.counts.accepted + result.counts.declined : result.counts[result.selected];
}

export function formatEstimateAcceptance(accepted: number, declined: number): string {
  return formatLeadConversionRate(accepted + declined, accepted);
}

export function validEstimateDecisionsResult(result: EstimateDecisionsResult, canReadMoney: boolean): boolean {
  const decided = result.counts.accepted + result.counts.declined;
  const total = estimateDecisionsTotal(result);
  if (!date(result.from) || !date(result.to) || result.from > result.to ||
    ![result.periodLabel, result.snapshotLabel, result.scopeLabel].every(label => label.trim()) ||
    ![result.counts.accepted, result.counts.declined, decided, total].every(count) ||
    !positive(result.page) || !positive(result.pageSize) || result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    result.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) ||
    new Set(result.rows.map(row => row.familyId)).size !== result.rows.length ||
    !result.rows.every(row => row.familyId.trim() && row.estimateNumber.trim() && row.label.trim() &&
      (row.recordId === undefined || row.recordId.trim()) && positive(row.revision) && positive(row.decisionVersion) &&
      (row.outcome === 'accepted' || row.outcome === 'declined') &&
      (result.selected === 'decided' || row.outcome === result.selected) &&
      date(row.decisionDate) && row.decisionDate >= result.from && row.decisionDate <= result.to && date(row.recordedDate))) return false;
  const accepted = result.rows.filter(row => row.outcome === 'accepted');
  const unseen = decided - result.rows.length;
  if (!(['accepted', 'declined'] as const).every(outcome => {
    const observed = result.rows.filter(row => row.outcome === outcome).length;
    return observed <= result.counts[outcome] && result.counts[outcome] - observed <= unseen;
  })) return false;
  if (!canReadMoney) return true;
  return validEstimateMoneyTotal(result.money, accepted.map(row => row.money), result.counts.accepted);
}
