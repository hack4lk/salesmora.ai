'use client';

import { useId } from 'react';
import type { WorkspaceRole } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { aiUsagePageData as copy } from './ai-usage-page.data';

export interface AIUsageSnapshot {
  /** Decimal strings preserve the database ledger's integer precision. */
  usedOrReservedTokens: string;
  monthlyTokens: string;
  resetAt: string;
}
export interface AIUsagePageProps {
  workspaceName: string;
  viewerRole: WorkspaceRole;
  settingsHref: string;
  state: 'ready' | 'loading' | 'error';
  usage?: AIUsageSnapshot;
  onRefresh?: () => void;
}
const buttonClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const numbers = new Intl.NumberFormat('en-US');
function parseUsage(usage?: AIUsageSnapshot) {
  if (!usage || !/^\d+$/.test(usage.usedOrReservedTokens) || !/^\d+$/.test(usage.monthlyTokens)) return null;
  const reset = new Date(usage.resetAt);
  if (!Number.isFinite(reset.getTime())) return null;
  const used = BigInt(usage.usedOrReservedTokens), allowance = BigInt(usage.monthlyTokens);
  const remaining = used < allowance ? allowance - used : 0n;
  const percent = allowance === 0n ? 0 : Number((used * 100n / allowance) > 100n ? 100n : used * 100n / allowance);
  return { used, allowance, remaining, percent, reset };
}

/** Presentation only. The live server must enforce Owner access before fetching any usage. */
export function AIUsagePage({ workspaceName, viewerRole, settingsHref, state, usage, onRefresh }: AIUsagePageProps) {
  const id = useId();
  if (viewerRole !== 'owner') return <FormFeedback kind="error" title={copy.deniedTitle} message={copy.denied}/>;
  const summary = state === 'ready' ? parseUsage(usage) : null;
  const stats = summary ? [[copy.used, summary.used], [copy.remaining, summary.remaining], [copy.allowance, summary.allowance]] as const : [];
  return <div className="grid min-w-0 gap-6">
    <header>
      <a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a>
      <p className="mb-0 mt-4 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4"><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><span className="rounded-full border border-line bg-paper px-3 py-2 text-xs font-semibold text-primary">{copy.ownerOnly}</span></div>
      <p className="mb-0 mt-2 text-sm font-semibold text-muted wrap-anywhere">{workspaceName}</p>
      <p className="mb-0 mt-4 text-base leading-relaxed text-muted">{copy.description}</p>
    </header>
    <section aria-labelledby={`${id}-summary`} aria-busy={state === 'loading'} className="min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><h2 id={`${id}-summary`} className="m-0 text-xl font-semibold text-ink">{copy.summary}</h2>{onRefresh && <button type="button" onClick={onRefresh} disabled={state === 'loading'} className={buttonClass}>{state === 'loading' ? copy.refreshing : copy.refresh}</button>}</div>
      {state === 'loading' ? <p role="status" className="mb-0 mt-6 text-base text-muted">{copy.loading}</p> : !summary ? <div className="mt-6"><FormFeedback kind="error" title={copy.errorTitle} message={copy.error}/></div> : <>
        <dl className="mb-6 mt-6 grid gap-6 sm:grid-cols-3">{stats.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="mb-0 ml-0 mt-2 text-heading font-semibold text-ink wrap-anywhere tabular-nums">{numbers.format(value)}</dd></div>)}</dl>
        <div className="rounded-xl border border-line bg-canvas p-4 sm:p-6">
          <p className="mb-3 mt-0 text-sm font-semibold text-primary">{copy.percent(summary.percent)}</p>
          <progress aria-label={copy.meter} value={summary.percent} max={100} className="block h-3 w-full overflow-hidden rounded-full border-0 bg-line accent-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"/>
          <dl className="mb-0 mt-4"><dt className="text-sm text-muted">{copy.resets}</dt><dd className="mb-0 ml-0 mt-1 font-semibold text-ink"><time dateTime={summary.reset.toISOString()}>{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(summary.reset)}</time></dd></dl>
          <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.timezone}</p>
        </div>
        {(summary.allowance === 0n || summary.remaining === 0n || summary.percent >= 80) && <aside aria-labelledby={`${id}-notice`} className="mt-6 rounded-xl border border-primary bg-canvas p-4"><h3 id={`${id}-notice`} className="m-0 text-base font-semibold text-ink">{summary.allowance === 0n ? copy.noAllowanceTitle : summary.remaining === 0n ? copy.exhaustedTitle : copy.nearTitle}</h3><p className="mb-0 mt-2 text-sm leading-6 text-muted">{summary.allowance === 0n ? copy.noAllowance : summary.remaining === 0n ? copy.exhausted : copy.near}</p></aside>}
      </>}
    </section>
    <section aria-labelledby={`${id}-includes`} className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <h2 id={`${id}-includes`} className="m-0 text-xl font-semibold text-ink">{copy.includesTitle}</h2>
      <p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.includes}</p><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.reservations}</p><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.availability}</p>
    </section>
    <p className="m-0 text-sm leading-6 text-muted">{copy.note}</p>
  </div>;
}
