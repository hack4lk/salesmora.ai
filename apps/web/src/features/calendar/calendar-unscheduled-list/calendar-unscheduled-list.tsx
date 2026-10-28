'use client';

import { useId } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import type { CalendarVisitPreview } from '../calendar-event-card/calendar-event-card';
import { calendarEventCardData as eventCopy } from '../calendar-event-card/calendar-event-card.data';
import { calendarUnscheduledListData as copy } from './calendar-unscheduled-list.data';

export type CalendarUnscheduledEntry = CalendarVisitPreview & { scheduledDate: string | null };
export type CalendarUnscheduledListProps = {
  /** Authorized, distinct visit projections. A paged response must be deadline-sorted before truncation. */
  entries: readonly CalendarUnscheduledEntry[];
  /** Total distinct authorized visits after current filters; omit when entries contains the complete queue. */
  total?: number;
  scopeLabel?: string;
  filtered?: boolean;
  state?: 'ready' | 'loading' | 'error';
  onOpenVisit: (id: string) => void;
  onSchedule?: (id: string) => void;
  onViewAll?: () => void;
  onRetry?: () => void;
};
const button = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
export function CalendarUnscheduledList({ entries, total, scopeLabel, filtered = false, state = 'ready', onOpenVisit, onSchedule, onViewAll, onRetry }: CalendarUnscheduledListProps) {
  const id = useId();
  // Dates/customer/people never establish shared identity. Closed records are history, not queue items.
  const queue = [...new Map(entries.map(entry => [entry.id, entry])).values()]
    .filter(entry => entry.scheduledDate === null)
    .map(entry => ({ ...entry, records: entry.records.filter(record => !['completed', 'canceled'].includes(record.status)) }))
    .filter(entry => entry.records.length > 0)
    .sort((a, b) => (a.completionDeadline?.date ?? '9999-12-31').localeCompare(b.completionDeadline?.date ?? '9999-12-31')
      || (a.records[0]?.number ?? '').localeCompare(b.records[0]?.number ?? '', 'en', { numeric: true }) || a.id.localeCompare(b.id));
  const shown = queue.slice(0, 10), count = total ?? queue.length;
  return <section aria-labelledby={`${id}-title`} aria-busy={state === 'loading'} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0">
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{copy.title}</h2>
      <p className="mb-0 mt-2 text-sm leading-6 text-muted">{scopeLabel ?? copy.description}</p>
    </div>{state === 'ready' && <span role="status" className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-muted">{copy.count(count)}</span>}</header>
    {state === 'loading' ? <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>
      : state === 'error' ? <div className="grid gap-3"><FormFeedback kind="error" title={copy.errorTitle} message={copy.error}/>{onRetry && <button type="button" onClick={onRetry} className={`${button} justify-self-start`}>{copy.retry}</button>}</div>
      : !shown.length ? <p className="m-0 rounded-xl border border-dashed border-line bg-canvas px-4 py-6 text-sm leading-6 text-muted">{filtered ? copy.filteredEmpty : copy.empty}</p>
      : <>
        {shown.some(entry => !entry.canReschedule || !onSchedule) && <p id={`${id}-permission`} className="m-0 text-xs leading-5 text-muted">{copy.permission}</p>}
        <ul className="m-0 grid min-w-0 list-none gap-3 p-0">{shown.map(entry => {
          const people = [...new Map(entry.crew.map(person => [person.id, person])).values()];
          const kind = entry.records.length > 1 ? 'shared' : entry.records[0].type;
          const allowed = entry.canReschedule && !!onSchedule;
          return <li key={entry.id} className="min-w-0"><article aria-label={entry.title} className="grid min-w-0 gap-3 rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold text-primary-dark">{eventCopy.types[kind]}</span>{entry.waiting && <StatusBadge label={eventCopy.waiting} tone="warning" dot/>}</div>
            <button type="button" aria-label={eventCopy.openVisit(entry.title)} onClick={() => onOpenVisit(entry.id)} className="min-h-11 min-w-0 cursor-pointer rounded-lg text-left text-base font-semibold wrap-anywhere hover:text-primary-dark focus-visible:focus-ring">{entry.title}</button>
            <p className="m-0 text-sm text-muted wrap-anywhere">{entry.customerName}</p>
            <div className="grid min-w-0 gap-2">{entry.records.map(record => <div key={`${record.type}:${record.id}`} className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted wrap-anywhere">{record.type === 'job' ? eventCopy.job : eventCopy.workOrder} · {record.number}</span>
              {record.type === 'job' ? <JobStatusBadge status={record.status}/> : <WorkOrderStatusBadge status={record.status}/>}
            </div>)}</div>
            <p className="m-0 text-sm leading-6 wrap-anywhere"><span className="text-muted">{eventCopy.crew}: </span>{people.length ? people.map(person => person.name).join(', ') : eventCopy.unassigned}</p>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <p className={`m-0 grid gap-1 text-xs ${entry.completionDeadline?.overdue ? 'font-semibold text-error' : 'text-muted'}`}>
                <span>{entry.completionDeadline ? eventCopy.deadline : copy.noDeadline}</span>
                {entry.completionDeadline && <span><time dateTime={entry.completionDeadline.date}>{eventCopy.date(entry.completionDeadline.date)}</time>{entry.completionDeadline.overdue && ` · ${eventCopy.overdue}`}</span>}
              </p>
              <div className="grid gap-1"><button type="button" aria-label={copy.scheduleVisit(entry.title)} aria-describedby={!allowed ? `${id}-permission` : undefined} disabled={!allowed} onClick={() => { if (allowed) onSchedule?.(entry.id); }} className={button}>{copy.schedule}</button>{!allowed && <span className="text-center text-xs text-muted">{copy.readOnly}</span>}</div>
            </div>
          </article></li>;
        })}</ul>
        {count > shown.length && <footer className="grid gap-3 border-t border-line pt-4"><p className="m-0 text-sm text-muted">{copy.showing(shown.length, count)}</p>{onViewAll && <button type="button" className={button} onClick={onViewAll}>{copy.viewAll}</button>}</footer>}
      </>}
  </section>;
}
