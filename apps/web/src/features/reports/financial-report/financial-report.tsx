'use client';

import { useId } from 'react';
import { DataTable, FormFeedback, HelpTooltip, Pagination, formatMoney } from '@salesmora/ui';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { ReportResultState } from '../report-result-state/report-result-state';
import { ReportSummary, type ReportSummaryMetric, type ReportSummaryValue } from '../report-summary/report-summary';
import type { EstimateDecisionsMoney } from '../estimate-decisions-report/estimate-decisions-report.validation';
import { financialReportData as copy } from './financial-report.data';
import {
  validFinancialReportResult,
  type FinancialEvidenceRow,
  type FinancialReportAccess,
  type FinancialReportResult,
} from './financial-report.validation';

export type FinancialReportState =
  | { kind: 'loading' }
  | { kind: 'error'; message?: string }
  | { kind: 'ready'; result: FinancialReportResult };
export type FinancialReportProps = {
  state: FinancialReportState;
  period: ReportPeriodSelection;
  today: string;
  timezone: string;
  access: FinancialReportAccess;
  canRead: boolean;
  pending?: boolean;
  onPeriodApply: (period: ReportPeriodSelection) => void;
  onEvidence: (evidenceId: 'accepted' | 'awaiting' | 'materials') => void;
  onRecord: (recordId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
};

type FinancialTableRow = {
  id: string;
  label: string;
  recordId?: string;
  details: string;
  date: string;
  state: string;
  job: string;
  quantity: string;
  unitCost: string | null;
  lineCost: string | null;
  preTax: string | null;
  tax: string | null;
  customerTotal: string | null;
  changedAfterIssue: string;
};

function estimateValue(value: { kind: 'available'; preTaxCents: number; customerTotalCents: number } |
  { kind: 'unavailable'; explanation: string }): ReportSummaryValue {
  return value.kind === 'available'
    ? { kind: 'formatted', displayValue: formatMoney(value.preTaxCents) }
    : { kind: 'unavailable', reason: value.explanation };
}

function estimateMetrics(
  kind: 'accepted' | 'awaiting',
  label: string,
  count: number,
  money: EstimateDecisionsMoney,
  canReadValues: boolean,
): ReportSummaryMetric[] {
  const value = canReadValues
    ? estimateValue(money)
    : { kind: 'unavailable' as const, reason: copy.estimateMoneyUnavailable };
  const basis = kind === 'accepted' ? copy.periodBasis : copy.currentBasis;
  return [
    { id: `${kind}-count`, label, value: { kind: 'count', value: count },
      description: copy.commitmentHelp, dateBasisLabel: basis, evidenceId: kind },
    { id: `${kind}-value`, label: kind === 'accepted' ? copy.accepted : copy.awaiting, value,
      description: copy.commitmentHelp, dateBasisLabel: basis, evidenceId: kind },
    ...(canReadValues && money.kind === 'available' ? [{
      id: `${kind}-customer-total`,
      label: kind === 'accepted' ? copy.acceptedCustomerTotal : copy.awaitingCustomerTotal,
      value: { kind: 'formatted' as const, displayValue: formatMoney(money.customerTotalCents) },
      description: 'Customer tax-inclusive total is displayed separately from pre-tax commitment value.',
      dateBasisLabel: basis,
      evidenceId: kind,
    }] : []),
  ];
}

function displayRows(rows: readonly FinancialEvidenceRow[], canReadEstimateValues: boolean): FinancialTableRow[] {
  return rows.map(row => {
    if (row.kind === 'material') return {
      id: `material:${row.id}`,
      label: row.workOrderLabel,
      recordId: row.workOrderId,
      details: row.itemLabel,
      date: '',
      state: `${row.workOrderStatus === 'issued' ? copy.workOrderStatus.issued : copy.workOrderStatus['in-progress']} / ${copy.materialStatus[row.status]}`,
      job: row.jobLabel ?? 'Job reference unavailable',
      quantity: `${row.quantity} ${row.unit}`,
      unitCost: row.unitCostCents === null ? null : formatMoney(row.unitCostCents),
      lineCost: row.lineCostCents === null ? null : formatMoney(row.lineCostCents),
      preTax: null,
      tax: null,
      customerTotal: null,
      changedAfterIssue: row.changedAfterIssue ? 'Yes' : 'No',
    };
    const estimateLabel = `${row.estimateNumber} / revision ${row.revision}`;
    return {
      id: `${row.kind}:${row.familyId}`,
      label: row.label,
      ...(row.recordId !== undefined ? { recordId: row.recordId } : {}),
      details: estimateLabel,
      date: row.kind === 'accepted' ? row.decisionDate : row.issuedDate,
      state: row.kind === 'accepted' ? 'Accepted' : row.validUntil === null ? 'Awaiting decision / no expiry' : 'Awaiting decision',
      job: '',
      quantity: '',
      unitCost: null,
      lineCost: null,
      preTax: canReadEstimateValues && row.money.kind === 'available' ? formatMoney(row.money.preTaxCents)
        : row.money.kind === 'unavailable' && canReadEstimateValues
        ? `Unavailable: ${row.money.explanation}` : null,
      tax: canReadEstimateValues && row.money.kind === 'available' ? formatMoney(row.money.taxCents)
        : row.money.kind === 'unavailable' && canReadEstimateValues
        ? `Unavailable: ${row.money.explanation}` : null,
      customerTotal: canReadEstimateValues && row.money.kind === 'available' ? formatMoney(row.money.customerTotalCents)
        : row.money.kind === 'unavailable' && canReadEstimateValues
        ? `Unavailable: ${row.money.explanation}` : null,
      changedAfterIssue: '',
    };
  });
}

export function FinancialReport({
  state,
  period,
  today,
  timezone,
  access,
  canRead,
  pending = false,
  onPeriodApply,
  onEvidence,
  onRecord,
  onPageChange,
  onPageSizeChange,
  onRetry,
}: FinancialReportProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (state.kind !== 'ready') return <ReportResultState state={state} canRead canEdit={false}
    pending={pending} onRetry={onRetry} onEdit={() => undefined} />;
  const result = state.result;
  const valid = validFinancialReportResult(result, period, access, today, timezone);
  if (!valid) return <FormFeedback kind="error" message={copy.invalid} />;
  const estimateSnapshot = result.estimates.kind === 'available' ? result.estimates : undefined;
  const estimatesAvailable = access.canReadEstimates && estimateSnapshot !== undefined;
  const estimateValuesAvailable = access.canReadEstimates && access.canReadEstimateValues;
  const costSnapshot = result.costs.kind === 'available' ? result.costs : undefined;
  const costsAvailable = access.canReadWorkOrders && access.canReadWorkOrderCosts && costSnapshot !== undefined;
  const acceptedMetrics = estimateSnapshot
    ? estimateMetrics('accepted', copy.acceptedCount, estimateSnapshot.accepted.count,
      estimateSnapshot.accepted.money, estimateValuesAvailable)
    : [{ id: 'accepted-unavailable', label: copy.periodEstimates,
      value: { kind: 'unavailable' as const, reason: copy.estimatePermission },
      description: copy.commitmentHelp, dateBasisLabel: copy.periodBasis }];
  const awaitingMetrics = estimateSnapshot
    ? estimateMetrics('awaiting', copy.awaitingCount, estimateSnapshot.awaiting.count,
      estimateSnapshot.awaiting.money, estimateValuesAvailable)
    : [{ id: 'awaiting-unavailable', label: copy.currentEstimates,
      value: { kind: 'unavailable' as const, reason: copy.estimatePermission },
      description: copy.commitmentHelp, dateBasisLabel: copy.currentBasis }];
  const costMetrics: ReportSummaryMetric[] = costSnapshot ? [
    { id: 'known-costs', label: copy.knownCosts,
      value: costSnapshot.lineCount === 0 || costSnapshot.knownCostCents === null
        ? { kind: 'unavailable', reason: copy.noKnownCosts }
        : costSnapshot.missingCostLines > 0
          ? { kind: 'incomplete', displayValue: formatMoney(costSnapshot.knownCostCents),
            coverageLabel: copy.missingCostCoverage(costSnapshot.knownCostLines, costSnapshot.lineCount) }
          : { kind: 'formatted', displayValue: formatMoney(costSnapshot.knownCostCents) },
      description: copy.recordedCostHelp, dateBasisLabel: copy.costsBasis, evidenceId: 'materials' },
    { id: 'known-lines', label: copy.knownLines, value: { kind: 'count', value: costSnapshot.knownCostLines },
      description: copy.recordedCostHelp, dateBasisLabel: copy.costsBasis, evidenceId: 'materials' },
    { id: 'missing-lines', label: copy.missingLines, value: { kind: 'count', value: costSnapshot.missingCostLines },
      description: copy.recordedCostHelp, dateBasisLabel: copy.costsBasis, evidenceId: 'materials' },
  ] : [{ id: 'costs-unavailable', label: copy.materialCosts,
    value: { kind: 'unavailable', reason: copy.costPermission },
    description: copy.recordedCostHelp, dateBasisLabel: copy.costsBasis }];
  const evidenceAvailable = result.evidence.kind === 'materials' ? costsAvailable : estimatesAvailable;
  const selectEvidence = (evidenceId: string) => {
    if (evidenceId === 'accepted' || evidenceId === 'awaiting' || evidenceId === 'materials') onEvidence(evidenceId);
  };
  const tableRows = displayRows(result.evidence.rows, estimateValuesAvailable);
  const evidenceColumns = result.evidence.kind === 'materials' ? [
    { id: 'record', label: 'Work Order / item', render: (row: FinancialTableRow) =>
      <button type="button" disabled={pending} aria-label={`View record: ${row.label}`}
        onClick={() => { if (!pending && row.recordId) onRecord(row.recordId); }}
        className="min-h-11 max-w-full cursor-pointer rounded-lg text-left font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:opacity-50">
        {row.label}
      </button> },
    { id: 'item', label: 'Material', render: (row: FinancialTableRow) => row.details },
    { id: 'job', label: 'Job', render: (row: FinancialTableRow) => row.job },
    { id: 'work-order-status', label: 'Work Order status', render: (row: FinancialTableRow) => row.state.split(' / ')[0] },
    { id: 'status', label: 'Material status', render: (row: FinancialTableRow) => row.state.split(' / ')[1] },
    { id: 'quantity', label: 'Listed quantity', render: (row: FinancialTableRow) => row.quantity },
    { id: 'unit-cost', label: 'Recorded unit cost', render: (row: FinancialTableRow) => row.unitCost ?? 'Missing' },
    { id: 'line-cost', label: 'Rounded line cost', render: (row: FinancialTableRow) => row.lineCost ?? 'Missing' },
    { id: 'changed', label: 'Changed after issue', render: (row: FinancialTableRow) => row.changedAfterIssue },
  ] : [
    { id: 'record', label: 'Estimate / record', render: (row: FinancialTableRow) =>
      row.recordId ? <button type="button" disabled={pending} aria-label={`View record: ${row.label}`}
        onClick={() => { if (!pending) onRecord(row.recordId!); }}
        className="min-h-11 max-w-full cursor-pointer rounded-lg text-left font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:opacity-50">
        {row.label}
      </button> : <span>{row.label}</span> },
    { id: 'revision', label: 'Estimate revision', render: (row: FinancialTableRow) => row.details },
    { id: 'state', label: 'Current outcome', render: (row: FinancialTableRow) => row.state },
    { id: 'date', label: result.evidence.kind === 'accepted' ? 'Customer decision date' : 'First issued date',
      render: (row: FinancialTableRow) => row.date },
    ...(estimateValuesAvailable ? [
      { id: 'pre-tax', label: 'Frozen pre-tax value', render: (row: FinancialTableRow) => row.preTax ?? 'Unavailable' },
      { id: 'tax', label: 'Tax', render: (row: FinancialTableRow) => row.tax ?? 'Unavailable' },
      { id: 'customer-total', label: 'Customer tax-inclusive total', render: (row: FinancialTableRow) => row.customerTotal ?? 'Unavailable' },
    ] : []),
  ];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-3">
      <div className="flex min-w-0 items-center gap-1">
        <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h1>
        <HelpTooltip label="About sales value and recorded costs" paragraphs={[
          copy.commitmentHelp, copy.recordedCostHelp, copy.changedAfterIssue, copy.activeCostScope,
          copy.periodHelp, copy.scopeHelp, result.scopeLabel,
        ]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
    </header>
    <ReportDateControls value={period} context="history" today={today} timezone={timezone}
      pending={pending} onApply={onPeriodApply} />
    <section aria-labelledby={`${id}-accepted-title`} className="grid min-w-0 gap-4">
      <h2 id={`${id}-accepted-title`} className="m-0 text-xl font-semibold">{copy.periodEstimates}</h2>
      <p className="m-0 text-sm text-muted">{copy.periodBasis} / {result.periodLabel}</p>
      <ReportSummary canRead hideHeader threeColumns metrics={acceptedMetrics}
        snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={selectEvidence} />
    </section>
    <section aria-labelledby={`${id}-awaiting-title`} className="grid min-w-0 gap-4">
      <h2 id={`${id}-awaiting-title`} className="m-0 text-xl font-semibold">{copy.currentEstimates}</h2>
      <p className="m-0 text-sm text-muted">{copy.currentBasis} / {result.snapshotLabel}</p>
      <ReportSummary canRead hideHeader threeColumns metrics={awaitingMetrics}
        snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={selectEvidence} />
    </section>
    <section aria-labelledby={`${id}-costs-title`} className="grid min-w-0 gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-costs-title`} className="m-0 text-xl font-semibold">{copy.materialCosts}</h2>
        <HelpTooltip label="About recorded material costs" paragraphs={[copy.recordedCostHelp, copy.changedAfterIssue, copy.activeCostScope]} />
      </div>
      <p className="m-0 text-sm text-muted">{copy.activeCostScope} / {copy.costsBasis} / {result.snapshotLabel}</p>
      <ReportSummary canRead hideHeader threeColumns metrics={costMetrics}
        snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={selectEvidence} />
      {costSnapshot && <DataTable caption="Material costs by status" rows={costSnapshot.groups}
        getRowId={row => row.status} getRowLabel={row => copy.materialStatus[row.status]}
        columns={[
          { id: 'status', label: 'Material status', render: row => copy.materialStatus[row.status] },
          { id: 'lines', label: 'Lines', render: row => row.lineCount },
          { id: 'known', label: 'Known cost lines', render: row => row.knownCostLines },
          { id: 'missing', label: 'Missing cost lines', render: row => row.missingCostLines },
          { id: 'cost', label: 'Known rounded cost', render: row => row.knownCostCents === null ? 'Unavailable' : formatMoney(row.knownCostCents) },
        ]} />}
      {costSnapshot?.missingCostLines ? <p className="m-0 text-sm text-muted">
        {copy.missingCostCoverage(costSnapshot.knownCostLines, costSnapshot.lineCount)}
      </p> : null}
      <p className="m-0 text-sm text-muted">{copy.changedAfterIssue}</p>
    </section>
    <section aria-label={copy.evidence(result.evidence)} className="grid min-w-0 gap-3">
      <h2 className="m-0 text-xl font-semibold">{copy.evidence(result.evidence)}</h2>
      {!evidenceAvailable ? <FormFeedback kind="error" message={
        result.evidence.kind === 'materials' ? copy.costPermission : copy.estimatePermission
      } /> : result.evidence.total === 0 ? <ReportResultState state={{ kind: 'empty' }} canRead canEdit={false}
        pending={pending} onRetry={onRetry} onEdit={() => undefined} />
        : <>
          <DataTable caption={copy.evidence(result.evidence)} rows={tableRows}
            getRowId={row => row.id} getRowLabel={row => `${row.label} ${row.details}`}
            columns={evidenceColumns} />
          <Pagination total={result.evidence.total} page={result.evidence.page}
            pageSize={result.evidence.pageSize} disabled={pending}
            onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </>}
    </section>
  </section>;
}
