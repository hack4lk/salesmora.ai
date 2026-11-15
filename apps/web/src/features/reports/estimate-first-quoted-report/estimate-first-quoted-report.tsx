'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { estimateFirstQuotedReportData as copy } from './estimate-first-quoted-report.data';
import { validEstimateFirstQuotedResult, type EstimateFirstQuotedResult } from './estimate-first-quoted-report.validation';

export type EstimateFirstQuotedReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: EstimateFirstQuotedResult };
export type EstimateFirstQuotedReportProps = {
  state: EstimateFirstQuotedReportState;
  canRead: boolean;
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
const labels = { sent: 'Sent', published: 'Published', accepted: 'Accepted', declined: 'Declined', expired: 'Expired', void: 'Void' };

/** Host selects the earliest persisted issuance across authorized family history before period filtering and pagination. */
export function EstimateFirstQuotedReport({ state, canRead, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: EstimateFirstQuotedReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validEstimateFirstQuotedResult(result)) return <FormFeedback kind="error" message={copy.invalid} />;
  const basis = `Family first Send/Publish date / ${result.periodLabel}`;
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.definition, copy.history, copy.context, result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
      {result.coverage.kind === 'partial' && <p role="status" className="m-0 text-sm font-semibold text-muted wrap-anywhere">
        {copy.coverage}: {result.coverage.explanation}
      </p>}
    </header>
    <ReportSummary canRead hideHeader snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={[{ id: 'first-quoted', label: copy.metric, value: result.coverage.kind === 'complete' ? { kind: 'count', value: result.total }
        : { kind: 'incomplete', displayValue: String(result.total), coverageLabel: 'Known recorded families only; not a complete first-quoted total.' },
      description: `${copy.definition} ${copy.history}`, dateBasisLabel: basis, evidenceId: result.evidenceId }]} />
    <ReportEvidenceTable viewLabel={copy.metric} contextInTooltip contextLabel={`${basis} / ${result.scopeLabel} / ${copy.history} / ${copy.context}`}
      columns={[{ id: 'first', label: 'Family first issuance date' }, { id: 'origin', label: 'Original issuance' },
        { id: 'current', label: 'Current issued revision' }, { id: 'issued', label: 'Current revision first issued' }, { id: 'state', label: 'Current state / context only' }]}
      rows={result.rows.map(row => ({ id: row.familyId, recordId: row.recordId, label: row.label,
        cells: { first: row.firstIssuedDate, origin: `Revision ${row.firstIssuedRevision} / ${row.firstIssuedVia === 'send' ? 'Send' : 'Publish'}`,
          current: `${row.estimateNumber} / revision ${row.currentIssuedRevision}`, issued: row.currentIssuedDate,
          state: `${labels[row.currentStatus]}${row.archived ? ' / archived' : ''}` } }))}
      total={result.total} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
