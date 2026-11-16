'use client';

import { useId } from 'react';
import type { CalendarVisit } from '@salesmora/contracts';
import { ArrowForwardOutlined, FormFeedback, HelpTooltip } from '@salesmora/ui';
import { calendarEventCardData as visitCopy } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { homeScheduleWidgetData as copy } from './home-schedule-widget.data';

export type HomeScheduleVisit = Pick<CalendarVisit, 'id' | 'title' | 'customerName' | 'arrivalWindow' | 'location' | 'crew' | 'records'> & {
  /** Server-resolved authorized calendar visit destination. */
  href: string;
};
export type HomeScheduleState =
  | { status: 'ready'; visits: readonly HomeScheduleVisit[]; total: number }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void; retrying?: boolean };
export interface HomeScheduleWidgetProps {
  /** Validated workspace-local date and timezone, shared with the Home header. */
  today: string;
  timezone: string;
  state: HomeScheduleState;
  calendarHref: string;
}

/** The caller supplies distinct authorized visits for today in arrival-window order. */
export function HomeScheduleWidget({ today, timezone, state, calendarHref }: HomeScheduleWidgetProps) {
  const id = useId();
  const visits = state.status === 'ready' ? state.visits.slice(0, 5) : [];
  return (
    <section aria-labelledby={`${id}-title`} aria-busy={state.status === 'loading' || (state.status === 'error' && state.retrying)} className="min-w-0 rounded-2xl border border-line bg-paper">
      <header className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold leading-normal text-ink">{copy.title}</h2>
            <HelpTooltip label={copy.about} paragraphs={[copy.description]} />
          </div>
          <p className="mb-0 mt-1 text-sm leading-6 text-muted wrap-anywhere"><time dateTime={today}>{visitCopy.date(today)}</time> · {timezone}</p>
        </div>
        <a href={calendarHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-primary hover:text-primary-dark focus-visible:focus-ring">{copy.calendar}<ArrowForwardOutlined aria-hidden="true" className="size-4" /></a>
      </header>
      {state.status === 'loading' && <p role="status" className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.loading}</p>}
      {state.status === 'error' && <div className="grid gap-4 px-6 pb-6">
        <FormFeedback kind="error" title={copy.errorTitle} message={copy.error} />
        <button type="button" disabled={state.retrying} onClick={state.onRetry} className="min-h-11 w-fit rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">{copy.retry}</button>
      </div>}
      {state.status === 'ready' && (visits.length === 0 ? <p className="m-0 px-6 pb-6 text-sm leading-6 text-muted">{copy.empty}</p> : <>
        <ul className="m-0 list-none px-6 pb-2">
          {visits.map(visit => <li key={visit.id} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-line py-3">
            <div className="min-w-0 basis-44 grow">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0">
                <p className="m-0 text-sm font-semibold leading-5 text-primary-dark">{visit.arrivalWindow ? visitCopy.window(visit.arrivalWindow) : visitCopy.noWindow}</p>
                <h3 className="m-0 text-sm font-semibold leading-5 text-ink wrap-anywhere">{visit.title}</h3>
              </div>
              <p className="mb-0 mt-1 text-sm leading-5 text-muted wrap-anywhere">{visit.customerName} · {visit.location ?? copy.noLocation}</p>
              <p className="mb-0 mt-1 text-xs leading-5 text-muted wrap-anywhere">
                <span>{copy.crew}: {visit.crew.length ? visit.crew.map(person => person.name).join(', ') : visitCopy.unassigned}</span>
                {' · '}
                <span>{visit.records.map(record => `${record.type === 'job' ? visitCopy.job : visitCopy.workOrder} ${record.number}`).join(' · ')}</span>
              </p>
            </div>
            <a href={visit.href} aria-label={copy.openLabel(visit.title)} className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring">{copy.open}</a>
          </li>)}
        </ul>
        {state.total > visits.length && <p className="m-0 px-6 pb-6 text-xs leading-5 text-muted">{copy.remainder(visits.length, state.total)}</p>}
      </>)}
    </section>
  );
}
