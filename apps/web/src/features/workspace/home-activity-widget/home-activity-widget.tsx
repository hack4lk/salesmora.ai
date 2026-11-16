'use client';

import { useId } from 'react';
import type { ActivityReportEvent } from '@salesmora/contracts';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { activityReportData as activityCopy } from '../../reports/activity-report/activity-report.data';
import { homeActivityWidgetData as copy } from './home-activity-widget.data';

type SharedAction = 'created' | 'updated' | 'archived' | 'assignment-changed';
export type HomeActivityItem = Pick<ActivityReportEvent, 'eventId' | 'occurredAt' | 'actor' | 'recordId' | 'recordLabel'> & {
  href: string;
} & (
  | { domain: 'lead'; action: SharedAction | 'stage-changed' }
  | { domain: 'job'; action: SharedAction | 'status-changed' | 'deadline-changed' | 'visit-changed' | 'completed' }
);
export type HomeActivityState =
  | { status: 'restricted' }
  | { status: 'ready'; items: readonly HomeActivityItem[] }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void; retrying?: boolean };
export interface HomeActivityWidgetProps {
  state: HomeActivityState;
  timezone: string;
}

/** Caller supplies distinct authorized safe events, newest first with stable domain/event ID ties. */
export function HomeActivityWidget({ state, timezone }: HomeActivityWidgetProps) {
  const id = useId();
  if (state.status === 'restricted') return null;
  const items = state.status === 'ready' ? state.items.slice(0, 5) : [];
  const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: timezone });
  const timeFormatter = new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone: timezone });
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
      {state.status === 'ready' && (items.length === 0 ? <p className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.empty}</p> :
        <ul className="m-0 list-none px-6 pb-2">
          {items.map(item => <li key={`${item.domain}:${item.eventId}`} className="flex min-w-0 items-center justify-between gap-3 border-t border-line py-2">
            <div className="min-w-0 flex-1">
              <a href={item.href} aria-label={copy.recordAction(activityCopy.domains[item.domain], item.recordLabel)} className="flex min-h-11 min-w-0 flex-col justify-center rounded-xl text-primary hover:text-primary-dark focus-visible:focus-ring">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="m-0 text-sm font-semibold leading-5 text-ink wrap-anywhere">{activityCopy.domains[item.domain]} · {activityCopy.actions[item.action]}</h3>
                  <p className="m-0 text-xs leading-5 text-muted wrap-anywhere">{item.actor.label}</p>
                </div>
                <p className="m-0 text-sm font-semibold leading-5 wrap-anywhere">{item.recordLabel}</p>
              </a>
            </div>
            <time dateTime={item.occurredAt} className="shrink-0 text-right text-xs leading-5 text-muted">
              <span className="block whitespace-nowrap">{dateFormatter.format(new Date(item.occurredAt))}</span>
              <span className="block whitespace-nowrap">{timeFormatter.format(new Date(item.occurredAt))}</span>
            </time>
          </li>)}
        </ul>)}
    </section>
  );
}
