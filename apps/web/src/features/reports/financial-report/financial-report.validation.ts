import { jobDateSchema, workOrderMaterialStatuses } from '@salesmora/contracts';
import { recordedMaterialLineCostCents } from '@salesmora/domain';
import type { EstimateDecisionMoney, EstimateDecisionsMoney } from '../estimate-decisions-report/estimate-decisions-report.validation';
import { validEstimateFrozenMoney, validEstimateMoneyTotal } from '../estimate-decisions-report/estimate-decisions-report.validation';
import { resolveReportPeriod, validReportTimezone, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';

export type FinancialEstimateMetric = {
  count: number;
  money: EstimateDecisionsMoney;
};
export type FinancialEstimateEvidenceRow = {
  familyId: string;
  estimateNumber: string;
  revision: number;
  label: string;
  recordId?: string;
  archived: boolean;
  money: EstimateDecisionMoney;
} & (
  | { kind: 'accepted'; decisionDate: string; issuedDate?: string }
  | { kind: 'awaiting'; validUntil: string | null; issuedDate: string }
);
export type FinancialMaterialEvidenceRow = {
  kind: 'material';
  id: string;
  workOrderId: string;
  workOrderLabel: string;
  jobLabel: string | null;
  workOrderStatus: 'issued' | 'in-progress';
  itemLabel: string;
  quantity: string;
  unit: string;
  status: typeof workOrderMaterialStatuses[number];
  unitCostCents: number | null;
  lineCostCents: number | null;
  changedAfterIssue: boolean;
};
export type FinancialEvidenceRow = FinancialEstimateEvidenceRow | FinancialMaterialEvidenceRow;
export type FinancialEvidencePage = {
  kind: 'accepted' | 'awaiting' | 'materials';
  total: number;
  page: number;
  pageSize: number;
  rows: readonly FinancialEvidenceRow[];
};
export type FinancialCostGroup = {
  status: typeof workOrderMaterialStatuses[number];
  lineCount: number;
  knownCostLines: number;
  missingCostLines: number;
  knownCostCents: number | null;
};
export type FinancialCostSnapshot =
  | {
      kind: 'available';
      lineCount: number;
      knownCostLines: number;
      missingCostLines: number;
      knownCostCents: number | null;
      groups: readonly FinancialCostGroup[];
    }
  | { kind: 'unavailable'; explanation: string };
export type FinancialEstimateSnapshot =
  | {
      kind: 'available';
      accepted: FinancialEstimateMetric;
      awaiting: FinancialEstimateMetric;
    }
  | { kind: 'unavailable'; explanation: string };
export type FinancialReportResult = {
  from: string;
  to: string;
  today: string;
  timezone: string;
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  estimates: FinancialEstimateSnapshot;
  costs: FinancialCostSnapshot;
  evidence: FinancialEvidencePage;
};
export type FinancialReportAccess = {
  canReadEstimates: boolean;
  canReadEstimateValues: boolean;
  canReadWorkOrders: boolean;
  canReadWorkOrderCosts: boolean;
};

const date = (value: string) => !value.startsWith('0000') && jobDateSchema.safeParse(value).success;
const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
const safeText = (value: string, limit: number) =>
  value.trim() !== '' && value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactKeys = (value: object, keys: readonly string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const hasKeys = (value: object, required: readonly string[], optional: readonly string[] = []) =>
  required.every(key => Object.hasOwn(value, key)) &&
  Object.keys(value).every(key => required.includes(key) || optional.includes(key));

export const financialMaterialLineCostCents = recordedMaterialLineCostCents;

function validEstimateMoneyRow(value: unknown): value is EstimateDecisionMoney {
  if (!isRecord(value) || typeof value.kind !== 'string') return false;
  if (value.kind === 'unavailable') return hasExactKeys(value, ['kind', 'explanation']) &&
    typeof value.explanation === 'string' && safeText(value.explanation, 200);
  return value.kind === 'available' && hasExactKeys(value, ['kind', 'preTaxCents', 'taxCents', 'customerTotalCents']) &&
    validEstimateFrozenMoney(value as EstimateDecisionMoney);
}

function validEstimateMetric(value: unknown): value is FinancialEstimateMetric {
  if (!isRecord(value) || !hasExactKeys(value, ['count', 'money']) ||
    typeof value.count !== 'number' || !count(value.count) ||
    !validEstimateMoneySummary(value.money)) return false;
  return validEstimateMoneyTotal(value.money as EstimateDecisionsMoney, [], value.count);
}

function validEstimateMoneySummary(value: unknown): value is EstimateDecisionsMoney {
  if (!isRecord(value) || typeof value.kind !== 'string') return false;
  if (value.kind === 'unavailable') return hasExactKeys(value, ['kind', 'explanation']) &&
    typeof value.explanation === 'string' && safeText(value.explanation, 200);
  return value.kind === 'available' && hasExactKeys(value, ['kind', 'preTaxCents', 'customerTotalCents']) &&
    typeof value.preTaxCents === 'number' && count(value.preTaxCents) &&
    typeof value.customerTotalCents === 'number' && count(value.customerTotalCents);
}

function validEstimateEvidenceRow(
  value: unknown,
  kind: 'accepted' | 'awaiting',
  result: FinancialReportResult,
  canReadEstimateValues: boolean,
): value is FinancialEstimateEvidenceRow {
  if (!isRecord(value) || value.kind !== kind ||
    !hasKeys(value, ['kind', 'familyId', 'estimateNumber', 'revision', 'label', 'archived', 'money',
      ...(kind === 'accepted' ? ['decisionDate'] : ['issuedDate', 'validUntil'])],
    kind === 'accepted' ? ['recordId', 'issuedDate'] : ['recordId']) ||
    typeof value.familyId !== 'string' || !safeText(value.familyId, 128) ||
    typeof value.estimateNumber !== 'string' || !safeText(value.estimateNumber, 80) ||
    typeof value.revision !== 'number' || !positive(value.revision) ||
    typeof value.label !== 'string' || !safeText(value.label, 160) ||
    value.recordId !== undefined && (typeof value.recordId !== 'string' || !safeText(value.recordId, 128)) ||
    typeof value.archived !== 'boolean' ||
    value.issuedDate !== undefined && (typeof value.issuedDate !== 'string' ||
      !date(value.issuedDate) || value.issuedDate > result.today) ||
    !validEstimateMoneyRow(value.money) ||
    !canReadEstimateValues && value.money.kind !== 'unavailable') return false;
  if (kind === 'accepted') {
    return typeof value.decisionDate === 'string' && date(value.decisionDate) &&
      value.decisionDate >= result.from && value.decisionDate <= result.to &&
      (value.issuedDate === undefined || value.decisionDate >= value.issuedDate) && value.decisionDate <= result.today;
  }
  return typeof value.issuedDate === 'string' && value.archived === false && (value.validUntil === null ||
    typeof value.validUntil === 'string' && date(value.validUntil) && value.validUntil >= result.today);
}

function validEstimateEvidencePage(
  rows: readonly FinancialEvidenceRow[],
  kind: 'accepted' | 'awaiting',
  result: FinancialReportResult,
  metric: FinancialEstimateMetric,
  canReadEstimateValues: boolean,
): boolean {
  if (!rows.every(row => validEstimateEvidenceRow(row, kind, result, canReadEstimateValues))) return false;
  const estimateRows = rows as readonly FinancialEstimateEvidenceRow[];
  return new Set(estimateRows.map(row => row.familyId)).size === rows.length &&
    estimateRows.every(row => row.kind === kind) &&
    validEstimateMoneyTotal(metric.money, estimateRows.map(row => row.money), metric.count);
}

function validMaterialEvidenceRow(value: unknown): value is FinancialMaterialEvidenceRow {
  if (!isRecord(value) || !hasExactKeys(value, [
    'kind', 'id', 'workOrderId', 'workOrderLabel', 'jobLabel', 'workOrderStatus', 'itemLabel',
    'quantity', 'unit', 'status', 'unitCostCents', 'lineCostCents', 'changedAfterIssue',
  ]) || value.kind !== 'material' ||
    typeof value.id !== 'string' || !safeText(value.id, 128) ||
    typeof value.workOrderId !== 'string' || !safeText(value.workOrderId, 128) ||
    typeof value.workOrderLabel !== 'string' || !safeText(value.workOrderLabel, 200) ||
    value.jobLabel !== null && (typeof value.jobLabel !== 'string' || !safeText(value.jobLabel, 200)) ||
    value.workOrderStatus !== 'issued' && value.workOrderStatus !== 'in-progress' ||
    typeof value.itemLabel !== 'string' || !safeText(value.itemLabel, 200) ||
    typeof value.quantity !== 'string' || typeof value.unit !== 'string' || !safeText(value.unit, 40) ||
    typeof value.status !== 'string' || !workOrderMaterialStatuses.some(status => status === value.status) ||
    typeof value.changedAfterIssue !== 'boolean') return false;
  const unitCostCents = value.unitCostCents;
  if (unitCostCents !== null && typeof unitCostCents !== 'number') return false;
  const lineCostCents = value.lineCostCents;
  if (lineCostCents !== null && typeof lineCostCents !== 'number') return false;
  const expectedCost = financialMaterialLineCostCents(value.quantity, unitCostCents);
  return expectedCost !== undefined && lineCostCents === expectedCost;
}

function validCostGroup(group: unknown): group is FinancialCostGroup {
  if (!isRecord(group) || !hasExactKeys(group, [
    'status', 'lineCount', 'knownCostLines', 'missingCostLines', 'knownCostCents',
  ]) || typeof group.status !== 'string' ||
    !workOrderMaterialStatuses.some(status => status === group.status) ||
    typeof group.lineCount !== 'number' || !count(group.lineCount) ||
    typeof group.knownCostLines !== 'number' || !count(group.knownCostLines) ||
    typeof group.missingCostLines !== 'number' || !count(group.missingCostLines) ||
    group.lineCount !== group.knownCostLines + group.missingCostLines) return false;
  return group.knownCostLines === 0
    ? group.knownCostCents === null
    : typeof group.knownCostCents === 'number' && count(group.knownCostCents);
}

function safeSum(values: readonly number[]): number | undefined {
  const sum = values.reduce((total, value) => total + value, 0);
  return Number.isSafeInteger(sum) ? sum : undefined;
}

function validCostSnapshot(value: unknown, canReadCosts: boolean): value is FinancialCostSnapshot {
  if (!isRecord(value) || typeof value.kind !== 'string') return false;
  if (value.kind === 'unavailable') return hasExactKeys(value, ['kind', 'explanation']) &&
    typeof value.explanation === 'string' && safeText(value.explanation, 200);
  if (!canReadCosts) return false;
  if (value.kind !== 'available' || !hasExactKeys(value, [
    'kind', 'lineCount', 'knownCostLines', 'missingCostLines', 'knownCostCents', 'groups',
  ]) || typeof value.lineCount !== 'number' || !count(value.lineCount) ||
    typeof value.knownCostLines !== 'number' || !count(value.knownCostLines) ||
    typeof value.missingCostLines !== 'number' || !count(value.missingCostLines) ||
    value.lineCount !== value.knownCostLines + value.missingCostLines ||
    !Array.isArray(value.groups) || value.groups.length !== workOrderMaterialStatuses.length ||
    !value.groups.every(validCostGroup)) return false;
  const groups = value.groups as FinancialCostGroup[];
  if (new Set(groups.map(group => group.status)).size !== workOrderMaterialStatuses.length) return false;
  const lineCount = safeSum(groups.map(group => group.lineCount));
  const knownCostLines = safeSum(groups.map(group => group.knownCostLines));
  const missingCostLines = safeSum(groups.map(group => group.missingCostLines));
  const knownCosts = safeSum(groups.flatMap(group => group.knownCostCents === null ? [] : [group.knownCostCents]));
  if (lineCount !== value.lineCount || knownCostLines !== value.knownCostLines ||
    missingCostLines !== value.missingCostLines) return false;
  return value.knownCostLines === 0
    ? value.knownCostCents === null && groups.every(group => group.knownCostCents === null)
    : typeof value.knownCostCents === 'number' && count(value.knownCostCents) &&
      value.knownCostCents === knownCosts;
}

function validSelectedMaterialRows(
  rows: readonly FinancialEvidenceRow[],
  costs: FinancialCostSnapshot,
): boolean {
  if (!rows.every(validMaterialEvidenceRow) || costs.kind !== 'available') return false;
  const materialRows = rows as readonly FinancialMaterialEvidenceRow[];
  const groups = new Map(costs.groups.map(group => [group.status, group]));
  return new Set(materialRows.map(row => row.id)).size === rows.length &&
    workOrderMaterialStatuses.every(status => {
      const observed = materialRows.filter(row => row.status === status);
      const group = groups.get(status)!;
      const observedKnown = observed.filter(row => row.lineCostCents !== null);
      const observedCost = safeSum(observedKnown.map(row => row.lineCostCents!));
      if (observed.length > group.lineCount || observedKnown.length > group.knownCostLines ||
        observedKnown.length + observed.filter(row => row.lineCostCents === null).length > group.lineCount ||
        observedCost === undefined ||
        group.knownCostCents !== null && observedCost > group.knownCostCents) return false;
      return materialRows.length !== costs.lineCount ||
        observed.length === group.lineCount &&
        observedKnown.length === group.knownCostLines &&
        (group.knownCostCents === null ? observedCost === 0 : observedCost === group.knownCostCents);
    });
}

export function validFinancialReportResult(
  result: FinancialReportResult,
  period: ReportPeriodSelection,
  access: FinancialReportAccess,
  expectedToday: string,
  expectedTimezone: string,
): boolean {
  if (!isRecord(result) || !hasExactKeys(result, [
    'from', 'to', 'today', 'timezone', 'periodLabel', 'snapshotLabel', 'scopeLabel',
    'estimates', 'costs', 'evidence',
  ]) || !date(result.today) || result.today !== expectedToday || result.timezone !== expectedTimezone ||
    !validReportTimezone(expectedTimezone) ||
    ![result.periodLabel, result.snapshotLabel].every(value =>
      typeof value === 'string' && safeText(value, 200)) ||
    typeof result.scopeLabel !== 'string' || !safeText(result.scopeLabel, 4000)) return false;
  const range = resolveReportPeriod(period, result.today, 'history');
  if (!range.range || result.from !== range.range.from || result.to !== range.range.to) return false;
  const canReadEstimateValues = access.canReadEstimates && access.canReadEstimateValues;
  const canReadCosts = access.canReadWorkOrders && access.canReadWorkOrderCosts;
  if (!isRecord(result.estimates) || !isRecord(result.evidence) ||
    !hasExactKeys(result.evidence, ['kind', 'total', 'page', 'pageSize', 'rows']) ||
    !Array.isArray(result.evidence.rows) ||
    !['accepted', 'awaiting', 'materials'].some(kind => kind === result.evidence.kind) ||
    !count(result.evidence.total) || !positive(result.evidence.page) ||
    !positive(result.evidence.pageSize) ||
    result.evidence.page > Math.max(1, Math.ceil(result.evidence.total / result.evidence.pageSize)) ||
    result.evidence.rows.length !== Math.min(result.evidence.pageSize,
      Math.max(0, result.evidence.total - (result.evidence.page - 1) * result.evidence.pageSize)) ||
    !validCostSnapshot(result.costs, canReadCosts)) return false;
  if (result.estimates.kind === 'unavailable') {
    if (!hasExactKeys(result.estimates, ['kind', 'explanation']) ||
      typeof result.estimates.explanation !== 'string' || !safeText(result.estimates.explanation, 200) ||
      result.evidence.kind !== 'materials' && result.evidence.total !== 0) return false;
  } else {
    if (!access.canReadEstimates || result.estimates.kind !== 'available' ||
      !hasExactKeys(result.estimates, ['kind', 'accepted', 'awaiting']) ||
      !validEstimateMetric(result.estimates.accepted) || !validEstimateMetric(result.estimates.awaiting) ||
      !canReadEstimateValues && (result.estimates.accepted.money.kind !== 'unavailable' ||
        result.estimates.awaiting.money.kind !== 'unavailable')) return false;
    if (result.evidence.kind === 'accepted' || result.evidence.kind === 'awaiting') {
      const metric = result.estimates[result.evidence.kind];
      if (result.evidence.total !== metric.count) return false;
    } else if (result.evidence.total !== 0 && !canReadCosts) return false;
  }
  if (result.evidence.kind === 'materials') {
    const costTotal = canReadCosts && result.costs.kind === 'available' ? result.costs.lineCount : 0;
    if (result.evidence.total !== costTotal ||
      costTotal > 0 && !validSelectedMaterialRows(result.evidence.rows, result.costs) ||
      costTotal === 0 && result.evidence.rows.length !== 0) return false;
  }
  if (result.evidence.kind === 'accepted' || result.evidence.kind === 'awaiting') {
    if (!access.canReadEstimates || result.estimates.kind === 'unavailable') return result.evidence.total === 0 && result.evidence.rows.length === 0;
    if (result.estimates.kind !== 'available') return false;
    return validEstimateEvidencePage(result.evidence.rows, result.evidence.kind, result,
      result.estimates[result.evidence.kind], canReadEstimateValues);
  }
  if (result.evidence.kind === 'materials' && !canReadCosts) {
    return result.evidence.total === 0 && result.evidence.rows.length === 0;
  }
  return true;
}
