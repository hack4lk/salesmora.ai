'use client';

import { useId, useState } from 'react';
import Popover from '@mui/material/Popover';
import { CalendarEventCard, type CalendarVisitPreview } from '../calendar-event-card/calendar-event-card';
import { calendarDayColumnData as copy } from './calendar-day-column.data';

export type CalendarDayColumnProps = {
  /** Validated workspace-local dates and already-authorized visits for this day. */
  date: string;
  today: string;
  visits: readonly CalendarVisitPreview[];
  canSchedule?: boolean;
  onOpenVisit: (visitId: string) => void;
  onSchedule?: (date: string) => void;
};
const button = 'min-h-11 w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';
export function CalendarDayColumn({ date, today, visits, canSchedule = false, onOpenVisit, onSchedule }: CalendarDayColumnProps) {
  const id = useId(), [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isToday = date === today, dateLabel = copy.fullDate(date);
  // Only explicit visit IDs are deduplicated; matching dates/names never link records.
  const unique = [...new Map(visits.map(visit => [visit.id, visit])).values()];
  const sorted = unique.sort((a, b) => {
    if (a.arrivalWindow !== b.arrivalWindow) return (a.arrivalWindow ?? '99:99').localeCompare(b.arrivalWindow ?? '99:99');
    return (a.records[0]?.number ?? '').localeCompare(b.records[0]?.number ?? '', 'en', { numeric: true }) || a.id.localeCompare(b.id);
  });
  const visible = sorted.slice(0, 3), overflow = sorted.length - visible.length;
  return <section aria-labelledby={`${id}-heading`} className={`grid min-w-0 content-start gap-4 rounded-2xl border p-3 ${isToday ? 'border-primary bg-primary/5' : 'border-line bg-canvas'}`}>
    <header className="flex flex-wrap items-start justify-between gap-3">
      <h2 id={`${id}-heading`} aria-label={dateLabel} className="m-0 grid gap-1">
        <span className="text-xs font-semibold text-muted">{copy.weekday(date)}</span>
        <time dateTime={date} aria-current={isToday ? 'date' : undefined} className="text-lg font-semibold text-ink">{copy.shortDate(date)}</time>
      </h2>
      <div className="grid justify-items-end gap-2">
        <span className="rounded-full border border-line bg-paper px-2 py-1 text-xs font-semibold text-muted">{copy.count(sorted.length)}</span>
        {isToday && <span className="text-xs font-semibold text-primary-dark">{copy.today}</span>}
      </div>
    </header>
    {visible.length ? <div className="grid min-w-0 gap-3">{visible.map(visit => <CalendarEventCard key={visit.id} visit={visit} onOpen={onOpenVisit}/>)}</div>
      : <p className="m-0 rounded-xl border border-dashed border-line bg-paper px-4 py-8 text-center text-sm leading-6 text-muted">{copy.empty}</p>}
    {overflow > 0 && <button type="button" className={button} aria-haspopup="dialog" aria-expanded={!!anchor}
      aria-controls={anchor ? `${id}-all-visits` : undefined} onClick={event => setAnchor(event.currentTarget)}>{copy.more(overflow)}</button>}
    {canSchedule && onSchedule && <button type="button" className={button} aria-label={copy.scheduleOn(dateLabel)} onClick={() => onSchedule(date)}>{copy.schedule}</button>}
    <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{ paper: { id: `${id}-all-visits`, role: 'dialog', 'aria-modal': true, 'aria-labelledby': `${id}-all-heading`, className: 'w-96 rounded-2xl border border-line bg-paper p-4 text-ink shadow-lg' } }}>
      <div className="grid min-w-0 gap-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><h3 id={`${id}-all-heading`} className="m-0 text-lg font-semibold wrap-anywhere">{copy.allVisits(dateLabel)}</h3><p className="mb-0 mt-2 text-sm text-muted">{copy.count(sorted.length)}</p></div>
          <button type="button" className={`${button} w-auto`} onClick={() => setAnchor(null)}>{copy.close}</button>
        </header>
        {sorted.map(visit => <CalendarEventCard key={visit.id} visit={visit} onOpen={visitId => { setAnchor(null); onOpenVisit(visitId); }}/>) }
      </div>
    </Popover>
  </section>;
}
