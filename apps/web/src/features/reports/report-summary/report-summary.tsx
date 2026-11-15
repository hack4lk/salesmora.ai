'use client';

import { useId, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FormFeedback, HelpTooltip, MetricCard, MoreHorizOutlined } from '@salesmora/ui';
import { reportSummaryData as copy } from './report-summary.data';

export type ReportSummaryValue =
  | { kind: 'count'; value: number }
  | { kind: 'formatted'; displayValue: string }
  | { kind: 'incomplete'; displayValue: string; coverageLabel: string }
  | { kind: 'unavailable'; reason: string };
export type ReportSummaryMetric = {
  id: string;
  label: string;
  value: ReportSummaryValue;
  /** Fixed metric definition and its applicable period/current scope, supplied by the host. */
  dateBasisLabel: string;
  description: string;
  /** Omit when no currently authorized supporting projection is available. */
  evidenceId?: string;
};
export type ReportSummaryProps = {
  metrics: readonly ReportSummaryMetric[];
  canRead: boolean;
  snapshotLabel: string;
  scopeLabel: string;
  pending?: boolean;
  /** Use when a composing report already displays the same snapshot and scope. */
  hideHeader?: boolean;
  /** Stack metrics when composed in a dashboard sidebar. */
  compact?: boolean;
  /** Place three callouts in one row from tablet widths, stacking on mobile. */
  threeColumns?: boolean;
  /** Place four callouts in one row on large screens, using two columns on tablets. */
  fourColumns?: boolean;
  onEvidence: (evidenceId: string) => void;
};

/** Ready results only. The host owns formatting, reconciliation, snapshot consistency and evidence authorization. */
export function ReportSummary({ metrics, canRead, snapshotLabel, scopeLabel, pending = false, hideHeader = false, compact = false, threeColumns = false, fourColumns = false, onEvidence }: ReportSummaryProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid w-full min-w-0 gap-4 text-ink">
    <header className={hideHeader ? 'sr-only' : 'grid gap-2'}>
      <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2>
      <p className="m-0 text-sm text-muted wrap-anywhere">{snapshotLabel}</p>
      <p className="m-0 text-sm text-muted wrap-anywhere">{scopeLabel}</p>
    </header>
    {pending && <p role="status" className="m-0 text-sm text-muted">{copy.pending}</p>}
    {metrics.length === 0 ? <p className="m-0 text-sm text-muted">{copy.empty}</p> :
      <div className={compact || metrics.length === 1 ? 'grid min-w-0 gap-4' : fourColumns || metrics.length === 4 ? 'grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4' : threeColumns ? 'grid min-w-0 gap-4 md:grid-cols-3' : 'grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3'}>
        {metrics.map(metric => <div key={metric.id} className="flex min-w-0 flex-col gap-3">
          <MetricCard label={metric.label} labelPosition="beside"
            value={metric.value.kind === 'count' ? metric.value.value : undefined}
            displayValue={metric.value.kind === 'formatted' || metric.value.kind === 'incomplete' ? metric.value.displayValue : undefined}
            state={metric.value.kind === 'unavailable' ? 'error' : 'ready'}
            labelAdornment={<HelpTooltip label={`About metric: ${metric.label}`} paragraphs={[`${metric.description} ${metric.dateBasisLabel}`]} />}
            headerAction={metric.evidenceId !== undefined && <ReportMetricEvidenceMenu key={`${metric.evidenceId}:${pending}`}
              label={metric.label} evidenceId={metric.evidenceId} pending={pending} onEvidence={onEvidence} />}
            className="flex-1" />
          {metric.value.kind === 'incomplete' && <p className="m-0 text-sm font-semibold text-muted wrap-anywhere">{metric.value.coverageLabel}</p>}
          {metric.value.kind === 'unavailable' && <p className="m-0 text-sm text-muted wrap-anywhere">{metric.value.reason}</p>}
        </div>)}
      </div>}
  </section>;
}

export function ReportMetricEvidenceMenu({ label, evidenceId, pending, onEvidence }: {
  label: string; evidenceId: string; pending: boolean; onEvidence: (evidenceId: string) => void;
}) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = anchor !== null && !pending;
  return <>
    <button type="button" disabled={pending} aria-label={`Actions: ${label}`} aria-haspopup="menu"
      aria-controls={open ? id : undefined} aria-expanded={open}
      onClick={event => { if (!pending) setAnchor(event.currentTarget); }}
      className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:opacity-50">
      <MoreHorizOutlined aria-hidden="true" />
    </button>
    <Menu id={id} anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
      <MenuItem disabled={pending} onClick={() => {
        setAnchor(null);
        if (!pending) onEvidence(evidenceId);
      }}>{copy.evidence}</MenuItem>
    </Menu>
  </>;
}
