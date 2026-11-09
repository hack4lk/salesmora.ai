'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip, formatMoney } from '@salesmora/ui';
import { ReportSummary, type ReportSummaryMetric } from '../report-summary/report-summary';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { estimateDecisionsReportData as copy } from './estimate-decisions-report.data';
import { estimateDecisionsTotal, formatEstimateAcceptance, validEstimateDecisionsResult, type EstimateDecisionsResult } from './estimate-decisions-report.validation';

export type EstimateDecisionsReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: EstimateDecisionsResult };
export type EstimateDecisionsReportProps = {
  state: EstimateDecisionsReportState;
  canRead: boolean;
  /** Explicit intersection of financial-report and underlying estimate-price grants. */
  canReadMoney: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};

/** Hosts select effective issued-family decisions and validate frozen snapshots before producing this authorized projection. */
export function EstimateDecisionsReport({ state, canRead, canReadMoney, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: EstimateDecisionsReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validEstimateDecisionsResult(result, canReadMoney)) return <FormFeedback kind="error" message={copy.invalid} />;
  const decided = result.counts.accepted + result.counts.declined;
  const money = canReadMoney ? result.money : { kind: 'unavailable' as const, explanation: copy.moneyDenied };
  const dateBasisLabel = `Customer decision date / ${result.periodLabel} / currently effective as of ${result.snapshotLabel}`;
  const metrics: ReportSummaryMetric[] = [
    ...(['accepted', 'declined'] as const).map(outcome => ({ id: outcome, label: copy[outcome],
      value: { kind: 'count' as const, value: result.counts[outcome] }, description: `${copy.definition} ${copy.archives}`,
      dateBasisLabel, evidenceId: result.evidenceIds[outcome] })),
    { id: 'rate', label: copy.rate, value: decided === 0 ? { kind: 'unavailable', reason: copy.empty }
      : { kind: 'formatted', displayValue: formatEstimateAcceptance(result.counts.accepted, result.counts.declined) },
      description: `Accepted / (accepted + declined). ${copy.restatement} Percentages are rounded to one decimal place.`,
      dateBasisLabel, evidenceId: result.evidenceIds.decided },
    { id: 'value', label: copy.value, value: money.kind === 'available'
      ? { kind: 'formatted', displayValue: formatMoney(money.preTaxCents) } : { kind: 'unavailable', reason: money.explanation },
      description: copy.money, dateBasisLabel, evidenceId: canReadMoney ? result.evidenceIds.accepted : undefined },
  ];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.definition, copy.restatement, copy.money, copy.archives, result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
      <p className="m-0 text-sm text-muted wrap-anywhere">Currently effective decisions; earlier periods can restate after revisions or corrections.</p>
    </header>
    <ReportSummary canRead hideHeader fourColumns metrics={metrics} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
      pending={pending} onEvidence={onEvidence} />
    {money.kind === 'available' && <p className="m-0 text-sm text-muted wrap-anywhere">
      Accepted customer tax-inclusive total: <strong className="text-ink tabular-nums">{formatMoney(money.customerTotalCents)}</strong>
      {' / '}Separate from pre-tax value; not revenue or payments.
    </p>}
    <ReportEvidenceTable viewLabel={result.selected === 'decided' ? 'Currently effective decided quotes' : copy[result.selected]} contextInTooltip
      contextLabel={`${dateBasisLabel} / ${result.scopeLabel} / ${copy.definition} / ${copy.restatement} / ${copy.money}`}
      columns={[{ id: 'revision', label: 'Effective issued revision' }, { id: 'decision', label: 'Effective decision' },
        { id: 'date', label: 'Customer decision date' }, { id: 'recorded', label: 'Decision version recorded' },
        ...(canReadMoney ? [{ id: 'preTax', label: 'Accepted frozen pre-tax value' }, { id: 'customerTotal', label: 'Accepted customer tax-inclusive total' }] : [])]}
      rows={result.rows.map(row => ({ id: row.familyId, label: row.label, recordId: row.recordId,
        cells: { revision: `${row.estimateNumber} / revision ${row.revision}${row.archived ? ' / archived' : ''}`,
          decision: `${row.outcome === 'accepted' ? 'Accepted' : 'Declined'} / version ${row.decisionVersion}`,
          date: row.decisionDate, recorded: row.recordedDate,
          ...(canReadMoney ? { preTax: row.outcome === 'declined' ? 'Not an accepted quote'
            : row.money.kind === 'available' ? formatMoney(row.money.preTaxCents) : `Unavailable: ${row.money.explanation}`,
          customerTotal: row.outcome === 'declined' ? 'Not an accepted quote'
            : row.money.kind === 'available' ? formatMoney(row.money.customerTotalCents) : `Unavailable: ${row.money.explanation}` } : {}),
        } }))}
      total={estimateDecisionsTotal(result)} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit}
      pending={pending} onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
      onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
