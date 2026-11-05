'use client';

import { useId, type ReactNode } from 'react';
import { FormFeedback, MetricCard, StatusBadge, type StatusBadgeTone } from '@salesmora/ui';
import { captureSourceListData } from '../capture-source-list/capture-source-list.data';
import { captureDashboardSummaryData as copy } from './capture-dashboard-summary.data';
import { validCaptureDashboardSource, validCaptureIntakeHref, validCaptureSourceTotals, type CaptureDashboardSource, type CaptureSourceTotals } from './capture-dashboard-summary.validation';
export type CaptureDashboardSummaryProps = {
  source: CaptureDashboardSource; totals?: CaptureSourceTotals; state?: 'ready' | 'loading' | 'error';
  canRead: boolean; canReadIntake: boolean;
  /** Host-authorized link scoped to this source. No route or query contract is inferred here. */
  intakeHref?: string; onRetry?: () => void; actions?: ReactNode;
};
const tones: Record<CaptureDashboardSource['status'], StatusBadgeTone> = { draft: 'neutral', active: 'success', paused: 'warning', scheduled: 'info', archived: 'neutral' };
const action = 'inline-flex min-h-11 max-w-full items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary no-underline wrap-anywhere hover:bg-canvas focus-visible:focus-ring';
export function CaptureDashboardSummary({ source, totals, state = 'ready', canRead, canReadIntake, intakeHref, onRetry, actions }: CaptureDashboardSummaryProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (!validCaptureDashboardSource(source)) return <FormFeedback kind="error" message={copy.invalid} />;
  const valid = validCaptureSourceTotals(totals), failed = state === 'error' || state === 'ready' && !valid;
  const cardState = state === 'loading' ? 'loading' : failed ? 'error' : 'ready';
  return <section aria-labelledby={id} className="grid min-w-0 gap-5 text-ink">
    <header className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-between">
      <div className="grid w-full min-w-0 flex-1 gap-2 sm:w-auto"><h2 id={id} className="m-0 text-xl font-semibold wrap-anywhere">{source.name}</h2><p className="m-0 text-sm text-muted">{copy.types[source.type]}</p><div className="flex flex-wrap items-center gap-3"><StatusBadge label={captureSourceListData.statuses[source.status]} tone={source.intakeBlocked ? 'neutral' : tones[source.status]} />{source.intakeBlocked && <StatusBadge label={copy.blocked} tone="warning" />}</div></div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{canReadIntake && (validCaptureIntakeHref(intakeHref) ? <a href={intakeHref} className={action}>{copy.review}</a> : <p className="m-0 text-sm text-muted">{copy.reviewUnavailable}</p>)}{actions}</div>
    </header>
    {(source.attention || source.intakeBlocked) && <div className="grid min-w-0 gap-2 rounded-xl border border-line bg-paper p-4"><p className="m-0 text-sm font-semibold">{copy.attention}</p>{source.attention && <p className="m-0 text-sm leading-6 text-muted wrap-anywhere">{source.attention}</p>}</div>}
    {failed && <div className="grid gap-3"><FormFeedback kind="error" message={copy.error} />{onRetry && <button type="button" className={`${action} cursor-pointer justify-self-start`} onClick={onRetry}>{copy.retry}</button>}</div>}
    <div role="group" aria-label={copy.title} className="grid min-w-0 gap-4 md:grid-cols-3">{(['captured', 'awaitingReview', 'approved'] as const).map(key => <MetricCard key={key} label={copy.metrics[key].label} description={copy.metrics[key].description} value={valid ? totals[key] : undefined} state={cardState} />)}</div>
  </section>;
}
