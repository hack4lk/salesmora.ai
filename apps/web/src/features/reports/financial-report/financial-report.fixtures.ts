import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { workOrderMaterialStatuses, type WorkOrderStatus } from '@salesmora/contracts';
import {
  financialMaterialLineCostCents,
  type FinancialCostGroup,
  type FinancialCostSnapshot,
  type FinancialEstimateEvidenceRow,
  type FinancialEstimateMetric,
  type FinancialEvidencePage,
  type FinancialMaterialEvidenceRow,
  type FinancialReportAccess,
  type FinancialReportResult,
} from './financial-report.validation';
import { financialReportData as copy } from './financial-report.data';

export const financialReportToday = '2026-11-06';
export const financialReportTimezone = 'Europe/Warsaw';
export const defaultFinancialPeriod: ReportPeriodSelection = { preset: 'last30days' };
export const fullFinancialAccess: FinancialReportAccess = {
  canReadEstimates: true,
  canReadEstimateValues: true,
  canReadWorkOrders: true,
  canReadWorkOrderCosts: true,
};

type EstimateFixture = FinancialEstimateEvidenceRow;
type AcceptedEstimateFixture = Extract<EstimateFixture, { kind: 'accepted' }>;
type AwaitingEstimateFixture = Extract<EstimateFixture, { kind: 'awaiting' }>;
const acceptedEstimates: readonly AcceptedEstimateFixture[] = [
  { kind: 'accepted', familyId: 'estimate-family-101', estimateNumber: 'E-0101', revision: 2,
    label: 'Estimate E-0101 / Hall renovation', recordId: 'estimate-101', archived: false,
    issuedDate: '2026-10-04', decisionDate: '2026-10-08',
    money: { kind: 'available', preTaxCents: 150000, taxCents: 30000, customerTotalCents: 180000 } },
  { kind: 'accepted', familyId: 'estimate-family-102', estimateNumber: 'E-0102', revision: 1,
    label: 'Estimate E-0102 / Panel upgrade', recordId: 'estimate-102', archived: false,
    issuedDate: '2026-10-10', decisionDate: '2026-10-18',
    money: { kind: 'available', preTaxCents: 225000, taxCents: 45000, customerTotalCents: 270000 } },
  { kind: 'accepted', familyId: 'estimate-family-103', estimateNumber: 'E-0103', revision: 3,
    label: 'Estimate E-0103 / Kitchen refresh', recordId: 'estimate-103', archived: true,
    issuedDate: '2026-10-20', decisionDate: '2026-11-01',
    money: { kind: 'available', preTaxCents: 80000, taxCents: 16000, customerTotalCents: 96000 } },
  { kind: 'accepted', familyId: 'estimate-family-099', estimateNumber: 'E-0099', revision: 1,
    label: 'Estimate E-0099 / Garage lighting', recordId: 'estimate-099', archived: false,
    issuedDate: '2026-09-10', decisionDate: '2026-09-20',
    money: { kind: 'available', preTaxCents: 50000, taxCents: 10000, customerTotalCents: 60000 } },
];
const awaitingEstimates: readonly AwaitingEstimateFixture[] = [
  { kind: 'awaiting', familyId: 'estimate-family-201', estimateNumber: 'E-0201', revision: 2,
    label: 'Estimate E-0201 / Entry repair', recordId: 'estimate-201', archived: false,
    issuedDate: '2026-10-22', validUntil: '2026-11-22',
    money: { kind: 'available', preTaxCents: 120000, taxCents: 24000, customerTotalCents: 144000 } },
  { kind: 'awaiting', familyId: 'estimate-family-202', estimateNumber: 'E-0202', revision: 1,
    label: 'Estimate E-0202 / Bathroom update', recordId: 'estimate-202', archived: false,
    issuedDate: '2026-11-01', validUntil: null,
    money: { kind: 'available', preTaxCents: 95000, taxCents: 19000, customerTotalCents: 114000 } },
  { kind: 'awaiting', familyId: 'estimate-family-203', estimateNumber: 'E-0203', revision: 1,
    label: 'Estimate E-0203 / Fence repair', recordId: 'estimate-203', archived: false,
    issuedDate: '2026-10-01', validUntil: '2026-11-01',
    money: { kind: 'available', preTaxCents: 40000, taxCents: 8000, customerTotalCents: 48000 } },
];

type MaterialFixture = Omit<FinancialMaterialEvidenceRow, 'lineCostCents' | 'workOrderStatus'> & {
  workOrderStatus: WorkOrderStatus;
  workOrderArchived: boolean;
};
const materialRows: readonly MaterialFixture[] = [
  { kind: 'material', id: 'material-001', workOrderId: 'work-order-001', workOrderLabel: 'WO-0001 / Panel upgrade',
    jobLabel: 'Job J-1042', workOrderStatus: 'issued', itemLabel: 'Copper cable', quantity: '1.500', unit: 'ft',
    status: 'needed', unitCostCents: 2500, changedAfterIssue: false, workOrderArchived: false },
  { kind: 'material', id: 'material-002', workOrderId: 'work-order-001', workOrderLabel: 'WO-0001 / Panel upgrade',
    jobLabel: 'Job J-1042', workOrderStatus: 'issued', itemLabel: 'Connector set', quantity: '2.000', unit: 'each',
    status: 'ordered', unitCostCents: null, changedAfterIssue: false, workOrderArchived: false },
  { kind: 'material', id: 'material-003', workOrderId: 'work-order-001', workOrderLabel: 'WO-0001 / Panel upgrade',
    jobLabel: 'Job J-1042', workOrderStatus: 'issued', itemLabel: 'Mounting brackets', quantity: '3.333', unit: 'each',
    status: 'used', unitCostCents: 1200, changedAfterIssue: true, workOrderArchived: false },
  { kind: 'material', id: 'material-004', workOrderId: 'work-order-002', workOrderLabel: 'WO-0002 / Drain repair',
    jobLabel: null, workOrderStatus: 'in-progress', itemLabel: 'Seal kit', quantity: '0.500', unit: 'box',
    status: 'ordered', unitCostCents: 0, changedAfterIssue: false, workOrderArchived: false },
  { kind: 'material', id: 'material-005', workOrderId: 'work-order-002', workOrderLabel: 'WO-0002 / Drain repair',
    jobLabel: null, workOrderStatus: 'in-progress', itemLabel: 'Pipe liner', quantity: '0.005', unit: 'ft',
    status: 'needed', unitCostCents: 450, changedAfterIssue: true, workOrderArchived: false },
  { kind: 'material', id: 'material-006', workOrderId: 'work-order-002', workOrderLabel: 'WO-0002 / Drain repair',
    jobLabel: null, workOrderStatus: 'in-progress', itemLabel: 'Valve', quantity: '1.001', unit: 'each',
    status: 'on-hand', unitCostCents: 10000, changedAfterIssue: false, workOrderArchived: false },
  { kind: 'material', id: 'material-draft', workOrderId: 'work-order-draft', workOrderLabel: 'WO-0003 / Draft',
    jobLabel: null, workOrderStatus: 'draft', itemLabel: 'Draft part', quantity: '1.000', unit: 'each',
    status: 'needed', unitCostCents: 500, changedAfterIssue: false, workOrderArchived: false },
  { kind: 'material', id: 'material-completed', workOrderId: 'work-order-completed', workOrderLabel: 'WO-0004 / Completed',
    jobLabel: null, workOrderStatus: 'completed', itemLabel: 'Completed part', quantity: '1.000', unit: 'each',
    status: 'used', unitCostCents: 300, changedAfterIssue: false, workOrderArchived: false },
  { kind: 'material', id: 'material-canceled', workOrderId: 'work-order-canceled', workOrderLabel: 'WO-0005 / Canceled',
    jobLabel: null, workOrderStatus: 'canceled', itemLabel: 'Canceled part', quantity: '1.000', unit: 'each',
    status: 'ordered', unitCostCents: 100, changedAfterIssue: false, workOrderArchived: false },
  { kind: 'material', id: 'material-archived', workOrderId: 'work-order-archived', workOrderLabel: 'WO-0006 / Archived',
    jobLabel: null, workOrderStatus: 'issued', itemLabel: 'Archived part', quantity: '1.000', unit: 'each',
    status: 'used', unitCostCents: 100, changedAfterIssue: false, workOrderArchived: true },
];

const moneyTotal = (rows: readonly EstimateFixture[]): FinancialEstimateMetric['money'] => ({
  kind: 'available',
  preTaxCents: rows.reduce((total, row) => total + (row.money.kind === 'available' ? row.money.preTaxCents : 0), 0),
  customerTotalCents: rows.reduce((total, row) => total + (row.money.kind === 'available' ? row.money.customerTotalCents : 0), 0),
});
const metric = (rows: readonly EstimateFixture[], canReadValues: boolean): FinancialEstimateMetric => ({
  count: rows.length,
  money: canReadValues ? moneyTotal(rows) : { kind: 'unavailable', explanation: copy.estimateMoneyUnavailable },
});
const toDisplayEstimate = (row: EstimateFixture, canReadValues: boolean): FinancialEstimateEvidenceRow => ({
  ...row,
  money: canReadValues ? row.money : { kind: 'unavailable', explanation: copy.estimateMoneyUnavailable },
});
const safeLineCost = (row: Omit<FinancialMaterialEvidenceRow, 'lineCostCents'>): FinancialMaterialEvidenceRow => ({
  ...row,
  lineCostCents: financialMaterialLineCostCents(row.quantity, row.unitCostCents) ?? null,
});
const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

function costSnapshot(rows: readonly FinancialMaterialEvidenceRow[]): FinancialCostSnapshot {
  const groups: FinancialCostGroup[] = workOrderMaterialStatuses.map(status => {
    const matching = rows.filter(row => row.status === status);
    const known = matching.filter(row => row.unitCostCents !== null);
    return {
      status,
      lineCount: matching.length,
      knownCostLines: known.length,
      missingCostLines: matching.length - known.length,
      knownCostCents: known.length ? sum(known.map(row => row.lineCostCents!)) : null,
    };
  });
  const known = rows.filter(row => row.unitCostCents !== null);
  return {
    kind: 'available',
    lineCount: rows.length,
    knownCostLines: known.length,
    missingCostLines: rows.length - known.length,
    knownCostCents: known.length ? sum(known.map(row => row.lineCostCents!)) : null,
    groups,
  };
}

function pageFor(
  kind: 'accepted' | 'awaiting',
  allRows: readonly FinancialEstimateEvidenceRow[],
  page: number,
  pageSize: number,
): FinancialEvidencePage;
function pageFor(
  kind: 'materials',
  allRows: readonly FinancialMaterialEvidenceRow[],
  page: number,
  pageSize: number,
): FinancialEvidencePage;
function pageFor(
  kind: FinancialEvidencePage['kind'],
  allRows: readonly (FinancialEstimateEvidenceRow | FinancialMaterialEvidenceRow)[],
  page: number,
  pageSize: number,
): FinancialEvidencePage {
  const start = (page - 1) * pageSize;
  return { kind, total: allRows.length, page, pageSize, rows: allRows.slice(start, page * pageSize) };
}

export function financialReportResponse({
  period = defaultFinancialPeriod,
  selected = 'accepted',
  page = 1,
  pageSize = 25,
  access = fullFinancialAccess,
}: {
  period?: ReportPeriodSelection;
  selected?: FinancialEvidencePage['kind'];
  page?: number;
  pageSize?: number;
  access?: FinancialReportAccess;
} = {}): FinancialReportResult {
  const range = resolveReportPeriod(period, financialReportToday, 'history');
  if (!range.range) throw new Error('The fictional financial report fixture requires a valid historical period.');
  const accepted = acceptedEstimates.filter(row =>
    row.decisionDate >= range.range.from && row.decisionDate <= range.range.to);
  const awaiting = awaitingEstimates.filter(row =>
    !row.archived && (row.validUntil === null || row.validUntil >= financialReportToday));
  const canReadValues = access.canReadEstimates && access.canReadEstimateValues;
  const canReadCosts = access.canReadWorkOrders && access.canReadWorkOrderCosts;
  const currentMaterials = canReadCosts
    ? materialRows.flatMap(row => {
      const { workOrderArchived, ...material } = row;
      if (workOrderArchived || material.workOrderStatus !== 'issued' &&
        material.workOrderStatus !== 'in-progress') return [];
      const workOrderStatus = material.workOrderStatus === 'issued' ? 'issued' : 'in-progress';
      return [safeLineCost({ ...material, workOrderStatus })];
    })
    : [];
  const costs: FinancialCostSnapshot = canReadCosts
    ? costSnapshot(currentMaterials)
    : { kind: 'unavailable', explanation: copy.costUnavailable };
  const estimates = access.canReadEstimates
    ? { kind: 'available' as const, accepted: metric(accepted, canReadValues), awaiting: metric(awaiting, canReadValues) }
    : { kind: 'unavailable' as const, explanation: copy.unavailable };
  let evidence: FinancialEvidencePage;
  if (selected === 'accepted') {
    const rows = access.canReadEstimates ? accepted.map(row => toDisplayEstimate(row, canReadValues)) : [];
    evidence = pageFor('accepted', rows, page, pageSize);
  } else if (selected === 'awaiting') {
    const rows = access.canReadEstimates ? awaiting.map(row => toDisplayEstimate(row, canReadValues)) : [];
    evidence = pageFor('awaiting', rows, page, pageSize);
  } else {
    evidence = pageFor('materials', currentMaterials, page, pageSize);
  }
  const from = range.range.from, to = range.range.to;
  return {
    from, to, today: financialReportToday, timezone: financialReportTimezone,
    periodLabel: copy.periodLabel(from, to),
    snapshotLabel: 'November 6, 2026 at 10:00 / Europe/Warsaw',
    scopeLabel: 'Owner/Admin report scope, intersected with current estimate and Work Order permissions.',
    estimates, costs, evidence,
  };
}
