'use client';

import { calendarWeekStart } from '../../calendar/calendar-date';
import type { CalendarScheduledReportProps } from './calendar-scheduled-report';
import type { CalendarScheduledVisit } from './calendar-scheduled-report.validation';

const action = 'min-h-11 max-w-full cursor-pointer rounded-lg text-left text-sm font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function CalendarVisitEvidenceActions({ visit, pending = false, canOpenCalendar, onCalendar, onRecord }:
  Pick<CalendarScheduledReportProps, 'pending' | 'canOpenCalendar' | 'onCalendar' | 'onRecord'> & { visit: CalendarScheduledVisit }) {
  return <div className="grid min-w-0 gap-1">
    <span className="font-semibold wrap-anywhere">{visit.label}</span>
    {canOpenCalendar && <button type="button" className={action} disabled={pending} aria-label={`View Calendar: ${visit.label}`}
      onClick={() => { if (!pending) onCalendar({ date: visit.date, weekDate: calendarWeekStart(visit.date), visitId: visit.id }); }}>View Calendar</button>}
    {visit.records.map(record => record.recordId === undefined ? null : <button key={`${record.type}:${record.id}`} type="button" className={action}
      disabled={pending} aria-label={`View record: ${record.label}`}
      onClick={() => { if (!pending && record.recordId !== undefined) onRecord(record.recordId); }}>{record.label}</button>)}
  </div>;
}
