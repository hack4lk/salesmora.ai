'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip, formatMoney } from '@salesmora/ui';
import { ReportSummary, type ReportSummaryMetric } from '../report-summary/report-summary';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { completionElapsedDays } from '../job-completion-report/job-completion-report.validation';
import { estimateCurrentReportData as copy } from './estimate-current-report.data';
import { estimateCurrentTotal, validEstimateCurrentResult, type EstimateCurrentResult } from './estimate-current-report.validation';

export type EstimateCurrentReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: EstimateCurrentResult };
export type EstimateCurrentReportProps = {
  state: EstimateCurrentReportState;
  canRead: boolean;
  canReadMoney: boolean;
  /** Explicit host proof of complete authorized Lead/Job linkage visibility. */
  canReadHandoff: boolean;
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

export function EstimateCurrentReport({ state, canRead, canReadMoney, canReadHandoff, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: EstimateCurrentReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validEstimateCurrentResult(result, canReadMoney, canReadHandoff)) return <FormFeedback kind="error" message={copy.invalid} />;
  const money = canReadMoney ? result.awaitingMoney : { kind: 'unavailable' as const, explanation: copy.moneyDenied };
  const handoff = canReadHandoff ? result.handoff : { kind: 'unavailable' as const, explanation: copy.handoffDenied };
  const basis = `${copy.current} / ${result.snapshotLabel} / business-local today ${result.today}`;
  const metrics: ReportSummaryMetric[] = [
    { id: 'awaiting', label: copy.awaiting, value: { kind: 'count', value: result.counts.awaiting },
      description: `${copy.issued} ${copy.expiry}`, dateBasisLabel: basis, evidenceId: result.evidenceIds.awaiting },
    { id: 'value', label: copy.value, value: money.kind === 'available' ? { kind: 'formatted', displayValue: formatMoney(money.preTaxCents) }
      : { kind: 'unavailable', reason: money.explanation }, description: copy.money, dateBasisLabel: basis,
      evidenceId: canReadMoney ? result.evidenceIds.awaiting : undefined },
    { id: 'expired', label: copy.expired, value: { kind: 'count', value: result.counts.expired },
      description: `${copy.issued} ${copy.expiry}`, dateBasisLabel: basis, evidenceId: result.evidenceIds.expired },
    { id: 'handoff', label: copy.handoff, value: handoff.kind === 'available' ? { kind: 'count', value: handoff.count }
      : { kind: 'unavailable', reason: handoff.explanation }, description: `${copy.handoffDefinition} ${copy.handoffDenied}`,
      dateBasisLabel: basis, evidenceId: handoff.kind === 'available' ? handoff.evidenceId : undefined },
  ];
  const total = estimateCurrentTotal(result, canReadHandoff);
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.issued, copy.expiry, copy.money, copy.handoffDefinition, copy.handoffDenied, result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{copy.current}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / Business-local today: {result.today} / {result.scopeLabel}</p>
    </header>
    <ReportSummary canRead hideHeader fourColumns metrics={metrics} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
      pending={pending} onEvidence={onEvidence} />
    {money.kind === 'available' && <p className="m-0 text-sm text-muted wrap-anywhere">
      Awaiting customer tax-inclusive total: <strong className="text-ink tabular-nums">{formatMoney(money.customerTotalCents)}</strong>
      {' / '}Separate from pre-tax value; not revenue or payments.
    </p>}
    {total !== undefined && <ReportEvidenceTable viewLabel={copy[result.selected]} contextInTooltip
      contextLabel={`${basis} / ${result.scopeLabel} / ${copy.issued} / ${copy.expiry} / ${copy.handoffDefinition}`}
      columns={[{ id: 'revision', label: 'Effective issued revision' }, { id: 'status', label: 'Current state' },
        { id: 'issued', label: 'First issued for revision' }, { id: 'age', label: 'Issued age / calendar days' },
        { id: 'expiry', label: 'Expiry date' }, ...(result.selected === 'handoff' ? [{ id: 'decision', label: 'Accepted decision date' }] : []),
        ...(canReadMoney ? [{ id: 'preTax', label: 'Frozen pre-tax value' }, { id: 'total', label: 'Customer tax-inclusive total' }] : [])]}
      rows={result.rows.map(row => ({ id: row.familyId, recordId: row.recordId, label: row.label,
        cells: { revision: `${row.estimateNumber} / revision ${row.revision}`, status: row.status === 'accepted' ? 'Accepted / no linked Job'
          : result.selected === 'expired' ? 'Expired' : row.status === 'sent' ? 'Sent / awaiting decision' : 'Published / awaiting decision',
        issued: row.issuedDate, age: `${completionElapsedDays(row.issuedDate, result.today)} days`, expiry: row.validUntil ?? 'No expiry date',
        ...(row.status === 'accepted' ? { decision: row.decisionDate } : {}),
        ...(canReadMoney ? { preTax: row.money.kind === 'available' ? formatMoney(row.money.preTaxCents) : `Unavailable: ${row.money.explanation}`,
          total: row.money.kind === 'available' ? formatMoney(row.money.customerTotalCents) : `Unavailable: ${row.money.explanation}` } : {}),
        } }))}
      total={total} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit}
      pending={pending}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />}
  </section>;
}
