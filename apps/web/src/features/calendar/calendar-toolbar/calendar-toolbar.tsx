'use client';

import { useId } from 'react';
import { AddOutlined, ArrowForwardOutlined } from '@salesmora/ui';
import { addCalendarDays, calendarWeekStart } from '../calendar-date';
import { calendarToolbarData as copy } from './calendar-toolbar.data';

export type CalendarToolbarProps = {
  /** Any validated workspace-local date within the selected week. */
  date: string;
  /** Supplied by the server in the workspace timezone; never inferred from the browser clock. */
  today: string;
  timezone: string;
  scopeLabel?: string;
  canSchedule: boolean;
  loading?: boolean;
  /** Temporarily disable scheduling without implying a permission denial. */
  scheduleDisabled?: boolean;
  /** The owning route will write this Monday date to URL state. */
  onNavigate: (weekStart: string) => void;
  onSchedule: () => void;
};
const secondary = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function CalendarToolbar({ date, today, timezone, scopeLabel, canSchedule, loading = false, scheduleDisabled = false, onNavigate, onSchedule }: CalendarToolbarProps) {
  const id = useId(), start = calendarWeekStart(date), end = addCalendarDays(start, 6);
  return <section aria-label={copy.label} aria-busy={loading} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-5">
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
      <div className="grid min-w-0 gap-2">
        <p className="m-0 text-xs font-semibold text-muted">{copy.week}{scopeLabel && ` · ${scopeLabel}`}</p>
        <h2 aria-live="polite" aria-atomic="true" className="m-0 text-lg font-semibold wrap-anywhere">{copy.range(start, end)}</h2>
        <p className="m-0 text-xs text-muted wrap-anywhere">{copy.timezone(timezone)}</p>
      </div>
      <nav aria-label={copy.navigation} className="flex flex-wrap items-center gap-2">
        <button type="button" className={secondary} aria-label={copy.previous} disabled={loading}
          onClick={() => onNavigate(addCalendarDays(start, -7))}><ArrowForwardOutlined aria-hidden="true" className="rotate-180"/></button>
        <button type="button" className={secondary} disabled={loading} onClick={() => onNavigate(calendarWeekStart(today))}>{copy.today}</button>
        <button type="button" className={secondary} aria-label={copy.next} disabled={loading}
          onClick={() => onNavigate(addCalendarDays(start, 7))}><ArrowForwardOutlined aria-hidden="true"/></button>
      </nav>
      <button type="button" disabled={!canSchedule || loading || scheduleDisabled} aria-describedby={!canSchedule ? `${id}-permission` : undefined}
        onClick={onSchedule} className="inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted">
        <AddOutlined aria-hidden="true"/>{copy.schedule}
      </button>
    </div>
    {!canSchedule && <p id={`${id}-permission`} className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
    {loading && <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>}
  </section>;
}
