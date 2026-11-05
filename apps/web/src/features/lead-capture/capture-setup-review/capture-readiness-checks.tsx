'use client';
import { useId } from 'react';
import { StatusBadge } from '@salesmora/ui';
import { captureSetupReviewData as copy } from './capture-setup-review.data';
export type CaptureReadinessCheck = { id: string; label: string; status: 'ready' | 'blocked' | 'checking'; detail?: string };
/** Canonical readiness presentation shared by launch review and assistant read snapshots. */
export function CaptureReadinessChecks({ checks, ready }: { checks: readonly CaptureReadinessCheck[]; ready: boolean }) {
  const id = useId();
  return <section aria-labelledby={id} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
    <h3 id={id} className="m-0 text-base font-semibold">{copy.readiness}</h3>
    <ul role="list" className="m-0 grid min-w-0 list-none gap-3 p-0">{checks.map(check => <li key={check.id} className="grid min-w-0 gap-2 rounded-xl border border-line bg-canvas p-3"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-semibold">{check.label}</span><StatusBadge label={copy.statuses[check.status]} tone={check.status === 'ready' ? 'success' : check.status === 'blocked' ? 'warning' : 'neutral'} /></div>{check.detail && <p className="m-0 text-sm leading-6 text-muted wrap-anywhere">{check.detail}</p>}</li>)}</ul>
    {!ready && <p className="m-0 text-sm leading-6 text-muted">{copy.incomplete}</p>}
  </section>;
}
