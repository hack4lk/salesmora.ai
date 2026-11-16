'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { homeTeamWorkloadWidgetData as copy } from './home-team-workload-widget.data';

export interface HomeTeamWorkloadItem {
  id: string;
  name: string;
  activeJobs: number;
  openLeads: number;
  /** Supply only authorized destinations that actually support this teammate filter. */
  jobsHref?: string;
  leadsHref?: string;
}
export type HomeTeamWorkloadState =
  | { status: 'restricted' }
  | { status: 'ready'; items: readonly HomeTeamWorkloadItem[]; total: number }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void; retrying?: boolean };
export interface HomeTeamWorkloadWidgetProps {
  state: HomeTeamWorkloadState;
}

/** Caller must authorize workspace-wide collections and teammate identities, then supply sorted distinct members. */
export function HomeTeamWorkloadWidget({ state }: HomeTeamWorkloadWidgetProps) {
  const id = useId();
  if (state.status === 'restricted') return null;
  const items = state.status === 'ready' ? state.items.slice(0, 5) : [];
  return (
    <section aria-labelledby={`${id}-title`} aria-busy={state.status === 'loading' || (state.status === 'error' && state.retrying)} className="min-w-0 rounded-2xl border border-line bg-paper">
      <header className="flex items-center gap-1 px-6 pb-4 pt-6">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold leading-normal text-ink">{copy.title}</h2>
        <HelpTooltip label={copy.about} paragraphs={[copy.description]} />
      </header>
      {state.status === 'loading' && <p role="status" className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.loading}</p>}
      {state.status === 'error' && <div className="grid gap-4 px-6 pb-6">
        <FormFeedback kind="error" title={copy.errorTitle} message={copy.error} />
        <button type="button" disabled={state.retrying} onClick={state.onRetry} className="min-h-11 w-fit rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">{copy.retry}</button>
      </div>}
      {state.status === 'ready' && (items.length === 0 ? <p className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.empty}</p> : <>
        <ul className="m-0 list-none px-6 pb-2">
          {items.map(item => <li key={item.id} className="flex min-w-0 items-center justify-between gap-3 border-t border-line py-2">
            <h3 className="m-0 min-w-0 flex-1 text-sm font-semibold leading-5 text-ink wrap-anywhere">{item.name}</h3>
            <div className="flex shrink-0 flex-col items-end text-right text-sm leading-5 text-muted sm:flex-row sm:items-center sm:gap-4">
              {item.jobsHref ? <a href={item.jobsHref} aria-label={copy.jobsAction(item.name, item.activeJobs)} className="inline-flex min-h-11 items-center rounded-xl font-semibold text-primary hover:text-primary-dark focus-visible:focus-ring">{copy.jobs(item.activeJobs)}</a> : <span>{copy.jobs(item.activeJobs)}</span>}
              {item.leadsHref ? <a href={item.leadsHref} aria-label={copy.leadsAction(item.name, item.openLeads)} className="inline-flex min-h-11 items-center rounded-xl font-semibold text-primary hover:text-primary-dark focus-visible:focus-ring">{copy.leads(item.openLeads)}</a> : <span>{copy.leads(item.openLeads)}</span>}
            </div>
          </li>)}
        </ul>
        {state.total > items.length && <p className="m-0 px-6 pb-6 text-xs leading-5 text-muted">{copy.remainder(items.length, state.total)}</p>}
      </>)}
    </section>
  );
}
