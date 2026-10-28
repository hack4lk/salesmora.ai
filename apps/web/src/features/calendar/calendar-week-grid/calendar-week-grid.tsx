'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { FormFeedback } from '@salesmora/ui';
import type { CalendarVisitPreview } from '../calendar-event-card/calendar-event-card';
import { CalendarDayColumn } from '../calendar-day-column/calendar-day-column';
import { calendarDayColumnData } from '../calendar-day-column/calendar-day-column.data';
import { calendarToolbarData } from '../calendar-toolbar/calendar-toolbar.data';
import { addCalendarDays, calendarWeekStart } from '../calendar-date';
import { calendarWeekGridData as copy } from './calendar-week-grid.data';

export type CalendarWeekEntry = CalendarVisitPreview & { scheduledDate: string };
export type CalendarWeekGridProps = {
  /** Workspace-local dates and a complete, already authorized result for this week. */
  weekDate: string;
  today: string;
  entries: readonly CalendarWeekEntry[];
  scopeLabel?: string;
  state?: 'ready' | 'loading' | 'error';
  canSchedule?: boolean;
  onOpenVisit: (visitId: string) => void;
  onSchedule?: (date: string) => void;
  onRetry?: () => void;
};
const grid = 'grid min-w-0 grid-cols-1 items-start gap-3 md:min-w-7xl md:grid-cols-7';
export function CalendarWeekGrid({ weekDate, today, entries, scopeLabel, state = 'ready', canSchedule = false, onOpenVisit, onSchedule, onRetry }: CalendarWeekGridProps) {
  const id = useId(), days = useRef<(HTMLDivElement | null)[]>([]), start = calendarWeekStart(weekDate), end = addCalendarDays(start, 6);
  const dates = Array.from({ length: 7 }, (_, index) => addCalendarDays(start, index));
  // Explicit IDs only: a shared visit stays one entry, regardless of linked record count.
  const week = [...new Map(entries.map(entry => [entry.id, entry])).values()].filter(entry => entry.scheduledDate >= start && entry.scheduledDate <= end);
  function navigateDay(event: KeyboardEvent<HTMLDivElement>, index: number) {
    // Leave key handling inside buttons and the overflow popover to those controls.
    if (event.target !== event.currentTarget) return;
    const target = event.key === 'ArrowLeft' ? Math.max(0, index - 1) : event.key === 'ArrowRight' ? Math.min(6, index + 1) : event.key === 'Home' ? 0 : event.key === 'End' ? 6 : undefined;
    if (target !== undefined) { event.preventDefault(); days.current[target]?.focus(); }
    if (event.key === 'ArrowDown') {
      const first = days.current[index]?.querySelector<HTMLButtonElement>('button:not(:disabled)');
      if (first) { event.preventDefault(); first.focus(); }
    }
  }
  return <section aria-label={copy.label} aria-busy={state === 'loading'} className="grid min-w-0 gap-4 text-ink">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <p className="m-0 text-sm font-semibold">{calendarToolbarData.range(start, end)}{scopeLabel && ` · ${scopeLabel}`}</p>
      {state === 'ready' && <p role="status" className="m-0 text-sm text-muted">{copy.count(week.length)}</p>}
    </div>
    {state === 'error' ? <div className="grid gap-4 rounded-2xl border border-line bg-paper p-5"><FormFeedback kind="error" title={copy.errorTitle} message={copy.error}/>
      {onRetry && <button type="button" onClick={onRetry} className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring">{copy.retry}</button>}
    </div> : <>
      {state === 'loading' ? <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p> : <p id={`${id}-help`} className="m-0 text-xs leading-5 text-muted">{copy.keyboard}<span className="hidden md:inline"> {copy.scroll}</span></p>}
      <div role="region" aria-label={calendarToolbarData.range(start, end)} aria-describedby={state === 'ready' ? `${id}-help` : undefined}
        tabIndex={0} className="min-w-0 max-w-full overflow-x-auto rounded-2xl p-1 focus-visible:focus-ring">
        <div className={grid}>
          {dates.map((date, index) => state === 'loading' ? <div key={date} aria-hidden="true" className="grid min-w-0 gap-4 rounded-2xl border border-line bg-canvas p-3">
            <span className="text-sm font-semibold">{calendarDayColumnData.shortDate(date)}</span>
            <span className="block h-40 rounded-xl bg-line motion-safe:animate-pulse"/>
          </div> : <div key={date} ref={node => { days.current[index] = node; }} tabIndex={0} role="group" aria-label={calendarDayColumnData.fullDate(date)}
            onKeyDown={event => navigateDay(event, index)} className="min-w-0 rounded-2xl focus-visible:focus-ring">
            <CalendarDayColumn date={date} today={today} visits={week.filter(entry => entry.scheduledDate === date)} canSchedule={canSchedule} onOpenVisit={onOpenVisit} onSchedule={onSchedule}/>
          </div>)}
        </div>
      </div>
    </>}
  </section>;
}
