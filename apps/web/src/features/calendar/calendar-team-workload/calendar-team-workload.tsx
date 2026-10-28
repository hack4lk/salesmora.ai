'use client';

import { useId } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import { addCalendarDays, calendarWeekStart } from '../calendar-date';
import { calendarDayColumnData } from '../calendar-day-column/calendar-day-column.data';
import { calendarToolbarData } from '../calendar-toolbar/calendar-toolbar.data';
import type { CalendarPersonFilter } from '../calendar-filters/calendar-filters';
import { calendarTeamWorkloadData as copy } from './calendar-team-workload.data';

/** crew is the authorized union of active-record primary owners, Job teams and Work Order crews. */
export type CalendarWorkloadVisit = { id: string; scheduledDate: string; crew: readonly { id: string; name: string }[] };
export type CalendarTeamWorkloadProps = {
  weekDate: string;
  /** Complete authorized active-visit projection for this week after current filters. */
  visits: readonly CalendarWorkloadVisit[];
  members: readonly { id: string; name: string }[];
  viewerId: string;
  scope: 'workspace' | 'own';
  selectedPerson?: CalendarPersonFilter;
  disabled?: boolean;
  state?: 'ready' | 'loading' | 'error';
  onSelect: (person: CalendarPersonFilter) => void;
  onRetry?: () => void;
};
const button = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
export function CalendarTeamWorkload({ weekDate, visits, members, viewerId, scope, selectedPerson = 'all', disabled = false, state = 'ready', onSelect, onRetry }: CalendarTeamWorkloadProps) {
  const id = useId(), start = calendarWeekStart(weekDate), dates = Array.from({ length: 7 }, (_, index) => addCalendarDays(start, index));
  const week = [...new Map(visits.map(visit => [visit.id, visit])).values()].filter(visit => dates.includes(visit.scheduledDate) && (scope !== 'own' || visit.crew.some(person => person.id === viewerId)));
  // Only explicit visit/person IDs establish identity. Matching names never merge people.
  const people = [...new Map([...week.flatMap(visit => visit.crew), ...members].map(person => [person.id, person])).values()]
    .filter(person => scope !== 'own' || person.id === viewerId).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  if (scope === 'own' && !people.length) people.push({ id: viewerId, name: copy.me });
  const rows: { key: string; name: string; filter: CalendarPersonFilter; days: number[] }[] = people.map(person => ({ key: `member:${person.id}`, name: person.name,
    filter: person.id === viewerId ? 'me' as const : `member:${person.id}` as const,
    days: dates.map(date => week.filter(visit => visit.scheduledDate === date && visit.crew.some(member => member.id === person.id)).length),
  }));
  if (scope === 'workspace') rows.push({ key: 'unassigned', name: copy.unassigned, filter: 'unassigned', days: dates.map(date => week.filter(visit => visit.scheduledDate === date && visit.crew.length === 0).length) });
  const selected = scope === 'own' ? 'me' : selectedPerson;
  return <section aria-labelledby={`${id}-title`} aria-busy={state === 'loading'} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{scope === 'own' ? copy.ownTitle : copy.title}</h2>
      <p className="mb-0 mt-2 text-sm text-muted">{calendarToolbarData.range(start, dates[6])}</p></div>
      {state === 'ready' && <span role="status" className="text-sm text-muted">{copy.weekCount(week.length)}</span>}
    </header>
    {state === 'loading' ? <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>
      : state === 'error' ? <div className="grid gap-3"><FormFeedback kind="error" title={copy.errorTitle} message={copy.error}/>{onRetry && <button type="button" className={button} onClick={onRetry}>{copy.retry}</button>}</div>
      : <>
        {!week.length && <p className="m-0 text-sm text-muted">{copy.empty}</p>}
        {!people.length && <p className="m-0 text-sm text-muted">{copy.noTeam}</p>}
        {scope === 'workspace' && selected !== 'all' && <button type="button" className={`${button} justify-self-start`} disabled={disabled} onClick={() => { if (!disabled) onSelect('all'); }}>{copy.everyone}</button>}
        <ul className="m-0 grid min-w-0 list-none gap-3 p-0">{rows.map(row => {
          const busyDays = row.filter === 'unassigned' ? [] : dates.filter((_, index) => row.days[index] >= 4);
          const active = selected === row.filter;
          return <li key={row.key} className={`grid min-w-0 gap-3 rounded-xl border p-3 ${active ? 'border-primary bg-primary/5' : 'border-line bg-paper'}`}>
            <button type="button" aria-label={copy.filter(row.name)} aria-pressed={active} disabled={disabled || scope === 'own'}
              onClick={() => { if (!disabled && scope !== 'own') onSelect(active ? 'all' : row.filter); }}
              className="flex min-h-11 min-w-0 cursor-pointer flex-wrap items-center justify-between gap-3 rounded-lg text-left text-sm font-semibold text-ink hover:bg-canvas focus-visible:focus-ring disabled:cursor-default">
              <span className="min-w-0 wrap-anywhere">{row.name}</span><span className="text-muted">{copy.count(row.days.reduce((sum, count) => sum + count, 0))}</span>
            </button>
            <dl aria-label={copy.daily} className="m-0 grid min-w-0 grid-cols-7 gap-1">{dates.map((date, index) => <div key={date} className={`grid min-w-0 gap-1 rounded-lg py-2 text-center text-xs ${row.days[index] >= 4 && row.filter !== 'unassigned' ? 'bg-amber-50 text-amber-900' : 'bg-canvas text-muted'}`}>
              <dt><abbr title={calendarDayColumnData.fullDate(date)} className="no-underline">{copy.day(date)}</abbr></dt><dd className="m-0 font-semibold wrap-anywhere">{row.days[index]}</dd>
            </div>)}</dl>
            {busyDays.length > 0 && <div className="grid gap-2"><StatusBadge label={copy.busy} tone="warning" dot/><p className="m-0 text-xs leading-5 text-amber-900">{busyDays.map(date => copy.busyDay(calendarDayColumnData.shortDate(date), row.days[dates.indexOf(date)])).join(' · ')}</p></div>}
          </li>;
        })}</ul>
        <p className="m-0 text-xs leading-5 text-muted">{scope === 'own' ? copy.ownScope : copy.shared}</p>
        <p className="m-0 text-xs leading-5 text-muted">{copy.helper}</p>
      </>}
  </section>;
}
