'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip, MetricCard, SeafoamButton } from '@salesmora/ui';
import { ReportMetricEvidenceMenu } from '../report-summary/report-summary';
import { reportCurrentContextData as copy } from './report-current-context.data';

export type ReportCurrentContextState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; snapshot: {
    label: string;
    count: number;
    description: string;
    snapshotLabel: string;
    scopeLabel: string;
    evidenceId?: string;
  } };
export type ReportCurrentContextProps = {
  state: ReportCurrentContextState;
  canRead: boolean;
  pending?: boolean;
  onRetry: () => void;
  onEvidence: (evidenceId: string) => void;
};

/** Host supplies a separately scoped, authorized current snapshot; never derive it from period rows. */
export function ReportCurrentContext({ state, canRead, pending = false, onRetry, onEvidence }: ReportCurrentContextProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  return <section aria-labelledby={`${id}-title`} aria-busy={state.kind === 'loading' || pending}
    className="grid w-full min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6">
    <header className="grid gap-2">
      <p className="m-0 text-xs text-muted wrap-anywhere">
        {state.kind === 'ready' && <>{state.snapshot.snapshotLabel}{' / '}</>}
        <span className="font-semibold">{copy.mode}</span>
      </p>
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 min-w-0 text-xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={state.kind === 'ready' ? [copy.description, state.snapshot.scopeLabel] : [copy.description]} />
      </div>
    </header>
    {state.kind === 'loading' && <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>}
    {state.kind === 'error' && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={copy.failed} />
      <SeafoamButton label={copy.retry} disabled={pending} onClick={() => { if (!pending) onRetry(); }} />
    </div>}
    {state.kind === 'ready' && <>
      <MetricCard label={state.snapshot.label} value={state.snapshot.count} labelPosition="beside"
        labelAdornment={<HelpTooltip label={`About metric: ${state.snapshot.label}`} paragraphs={[state.snapshot.description]} />}
        headerAction={state.snapshot.evidenceId !== undefined && <ReportMetricEvidenceMenu key={`${state.snapshot.evidenceId}:${pending}`}
          label={state.snapshot.label} evidenceId={state.snapshot.evidenceId} pending={pending} onEvidence={onEvidence} />} />
      {pending && <p role="status" className="m-0 text-sm text-muted">{copy.pending}</p>}
    </>}
  </section>;
}
