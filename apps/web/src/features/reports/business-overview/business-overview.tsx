'use client';

import { useId } from 'react';
import { DataTable, FormFeedback } from '@salesmora/ui';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { ReportResultState } from '../report-result-state/report-result-state';
import { ReportSummary } from '../report-summary/report-summary';
import { businessOverviewData as copy } from './business-overview.data';
import {
  overviewEvidenceIds,
  validBusinessOverviewResult,
  type BusinessOverviewResult,
  type OverviewEvidenceId,
  type OverviewAttentionId,
} from './business-overview.validation';

const overviewEvidenceIdSet = new Set<string>(overviewEvidenceIds);
const isOverviewEvidenceId = (value: string): value is OverviewEvidenceId =>
  overviewEvidenceIdSet.has(value);

export type BusinessOverviewState =
  | { kind: 'loading' }
  | { kind: 'error'; message?: string }
  | { kind: 'ready'; result: BusinessOverviewResult };
export type BusinessOverviewProps = {
  state: BusinessOverviewState;
  period: ReportPeriodSelection;
  today: string;
  timezone: string;
  canRead: boolean;
  canNavigateDetails?: boolean;
  onAttention?: (id: OverviewAttentionId) => void;
  pending?: boolean;
  onPeriodApply: (period: ReportPeriodSelection) => void;
  onEvidence: (evidenceId: OverviewEvidenceId) => void;
  onRetry: () => void;
};

/** Composes reviewed report metrics; the host owns projections, authorization and navigation. */
export function BusinessOverview({
  state,
  period,
  today,
  timezone,
  canRead,
  canNavigateDetails = true,
  onAttention,
  pending = false,
  onPeriodApply,
  onEvidence,
  onRetry,
}: BusinessOverviewProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') {
    const resultState = !canRead
      ? { kind: 'empty' as const }
      : state.kind === 'error'
        ? { kind: 'error' as const, message: state.message }
        : { kind: 'loading' as const };
    return <ReportResultState
      state={resultState}
      canRead={canRead}
      canEdit={false}
      pending={pending}
      onRetry={onRetry}
      onEdit={() => undefined}
    />;
  }
  const result = state.result;
  if (!validBusinessOverviewResult(result, period, today, timezone)) {
    return <FormFeedback kind="error" message={copy.invalid} />;
  }
  const attentionItems = result.attention.kind === 'available' ? result.attention.items : [];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <h1 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h1>
    </header>
    <ReportDateControls value={period} context="history" today={today} timezone={timezone}
      pending={pending} onApply={onPeriodApply} />
    <section aria-labelledby={`${id}-period-title`} className="grid min-w-0 gap-3">
      <div>
        <h2 id={`${id}-period-title`} className="m-0 text-xl font-semibold">{copy.periodResults}</h2>
        <p className="m-0 mt-1 text-sm text-muted">{copy.periodDescription}</p>
      </div>
      <ReportSummary canRead hideHeader snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
        pending={pending} onEvidence={evidenceId => {
          if (canNavigateDetails && isOverviewEvidenceId(evidenceId)) onEvidence(evidenceId);
        }} metrics={result.periodMetrics.map(metric => canNavigateDetails ? metric : { ...metric, evidenceId: undefined })} />
    </section>
    <section aria-labelledby={`${id}-current-title`} className="grid min-w-0 gap-3">
      <div>
        <h2 id={`${id}-current-title`} className="m-0 text-xl font-semibold">{copy.currentState}</h2>
      </div>
      <ReportSummary canRead hideHeader threeColumns snapshotLabel={result.currentSnapshotLabel}
        scopeLabel={result.currentScopeLabel} pending={pending} onEvidence={evidenceId => {
          if (canNavigateDetails && isOverviewEvidenceId(evidenceId)) onEvidence(evidenceId);
        }} metrics={result.currentMetrics.map(metric => canNavigateDetails ? metric : { ...metric, evidenceId: undefined })} />
    </section>
    <section aria-labelledby={`${id}-attention-title`} className="grid min-w-0 gap-3">
      <div>
        <h2 id={`${id}-attention-title`} className="m-0 text-xl font-semibold">{copy.attention}</h2>
        <p className="m-0 mt-1 text-sm text-muted">{copy.attentionDescription}</p>
      </div>
      {result.attention.kind === 'unavailable'
        ? <FormFeedback kind="error" message={result.attention.reason} />
        : <DataTable caption={copy.table} rows={attentionItems}
          getRowId={row => row.id} getRowLabel={row => row.label}
          emptyMessage={copy.noAttention}
          columns={[
            { id: 'queue', label: 'Queue', render: row => row.label },
            { id: 'details', label: 'Definition', render: row => row.description },
            { id: 'count', label: 'Records', render: row => row.count },
            { id: 'evidence', label: 'Details', render: row =>
              <button type="button" disabled={pending || (!onAttention && !canNavigateDetails)}
                aria-label={`${copy.view}: ${row.label}`}
                onClick={() => {
                  if (pending) return;
                  if (onAttention) onAttention(row.id);
                  else if (canNavigateDetails) onEvidence(row.evidenceId);
                }}
                className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:opacity-50">
                {copy.view}
              </button> },
          ]} />}
    </section>
  </section>;
}
