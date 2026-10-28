'use client';

import { useState } from 'react';
import { CalendarPage } from './calendar-page';
import { calendarPageData as copy, calendarPageVisits, calendarPagedQueueVisits, calendarPageMembers } from './calendar-page.data';
import { emptyCalendarFilters, type CalendarFiltersValue } from '../calendar-filters/calendar-filters';
import { calendarWeekStart, addCalendarDays } from '../calendar-date';
import type { CalendarScheduleDraft, CalendarScheduleTarget } from '../calendar-schedule-dialog/calendar-schedule-dialog';
import type { CalendarWeekEntry } from '../calendar-week-grid/calendar-week-grid';

export type CalendarPagePreviewProps = { scope?: 'workspace' | 'own'; readOnly?: boolean; state?: 'ready' | 'loading' | 'error'; empty?: boolean; initialOverlay?: 'peek' | 'schedule'; filteredEmpty?: boolean; pagedQueue?: boolean };
/** Storybook-only controller. Fictional filtering/saves never fetch, navigate, persist or call AI. */
export function CalendarPagePreview({ scope = 'workspace', readOnly = false, state: initialState = 'ready', empty = false, initialOverlay, filteredEmpty = false, pagedQueue = false }: CalendarPagePreviewProps) {
  const [rows, setRows] = useState<readonly CalendarScheduleTarget[]>(empty ? [] : pagedQueue ? [...calendarPageVisits.filter(v => v.scheduledDate !== null), ...calendarPagedQueueVisits] : calendarPageVisits);
  const [date, setDate] = useState<string>(copy.stories.today), [state, setState] = useState(initialState);
  const [filters, setFilters] = useState<CalendarFiltersValue>({ ...emptyCalendarFilters, person: scope === 'own' ? 'me' : 'all', customerQuery: filteredEmpty ? copy.stories.missingCustomer : '' });
  const [peekId, setPeekId] = useState<string | null>(initialOverlay === 'peek' ? rows[0]?.id ?? null : null);
  const [schedule, setSchedule] = useState<{ visitId?: string; date?: string } | null>(initialOverlay === 'schedule' ? { visitId: rows.find(row => row.scheduledDate === null)?.id } : null);
  const [queuePage, setQueuePage] = useState(1);
  const [notice, setNotice] = useState('');
  const scoped = rows.filter(visit => scope !== 'own' || visit.crew.some(person => person.id === copy.stories.viewerId)).map(visit => ({ ...visit,
    crew: scope === 'own' ? visit.crew.filter(person => person.id === copy.stories.viewerId) : visit.crew,
    // Fictional own-scope shared visits lack primary responsibility for every record.
    canReschedule: !readOnly && visit.canReschedule && (scope !== 'own' || visit.records.length === 1),
  }));
  const members = scope === 'own' ? calendarPageMembers.filter(person => person.id === copy.stories.viewerId) : calendarPageMembers;
  const filtered = scoped.filter(visit => {
    const person = filters.person;
    const assigned = person === 'all' || (person === 'unassigned' ? !visit.crew.length : visit.crew.some(member => member.id === (person === 'me' ? copy.stories.viewerId : person.slice('member:'.length))));
    return assigned && visit.customerName.toLowerCase().includes(filters.customerQuery.trim().toLowerCase())
      && visit.records.some(record => (filters.recordType === 'all' || filters.recordType === record.type) && (filters.status === 'all' || filters.status === `${record.type}:${record.status}`));
  });
  const start = calendarWeekStart(date), end = addCalendarDays(start, 6);
  const scheduled = filtered.filter((visit): visit is CalendarScheduleTarget & CalendarWeekEntry => !!visit.scheduledDate && visit.scheduledDate >= start && visit.scheduledDate <= end);
  const targets = scoped.filter(visit => visit.canReschedule).sort((a, b) => Number(a.scheduledDate !== null) - Number(b.scheduledDate !== null));
  function openSchedule(request: { visitId?: string; date?: string }) {
    if (state !== 'ready' || readOnly || (request.visitId && !targets.some(target => target.id === request.visitId))) return;
    setPeekId(null); setNotice(''); setSchedule(request);
  }
  async function confirm(draft: CalendarScheduleDraft) {
    const target = targets.find(visit => visit.id === draft.visitId && visit.revision === draft.revision);
    if (!target) throw new Error(copy.stories.conflict);
    setRows(previous => previous.map(visit => visit.id !== draft.visitId ? visit : { ...visit, scheduledDate: draft.scheduledDate, arrivalWindow: draft.arrivalWindow,
      revision: `${visit.revision}-next`, records: visit.records.map(record => record.type !== 'job' ? record : { ...record,
        status: draft.scheduledDate && record.status === 'needs-scheduling' ? 'scheduled' : !draft.scheduledDate && record.status === 'scheduled' ? 'needs-scheduling' : record.status }) }));
    setNotice(copy.stories.saved);
  }
  const queue = filtered.filter(visit => visit.scheduledDate === null);
  return <main className="min-h-screen bg-canvas p-4 sm:p-6"><CalendarPage weekDate={date} today={copy.stories.today} timezone={copy.stories.timezone} filters={filters} members={members} viewerId={copy.stories.viewerId} scope={scope}
    canSchedule={!readOnly} entries={scheduled} unscheduled={pagedQueue ? queue.slice((queuePage - 1) * 10, queuePage * 10) : queue} unscheduledTotal={pagedQueue ? queue.length : undefined} queuePagination={pagedQueue ? { page: queuePage, total: queue.length, onPage: setQueuePage } : undefined} workload={scheduled} state={state} notice={notice}
    onNavigate={next => { setDate(next); setNotice(''); setPeekId(null); setSchedule(null); }}
    onFilters={next => { setQueuePage(1); setFilters(scope === 'own' ? { ...next, person: 'me' } : next); setPeekId(null); setSchedule(null); setNotice(''); }}
    onOpenVisit={setPeekId} onSchedule={openSchedule} onViewAll={pagedQueue ? undefined : () => setNotice(copy.stories.allQueue)} onRetry={() => setState('ready')}
    peek={{ open: !!peekId, visit: scoped.find(visit => visit.id === peekId) ?? null, onClose: () => setPeekId(null), onOpenRecord: () => setNotice(copy.stories.openRecord) }}
    schedule={schedule ? { open: true, targets, initialVisitId: schedule.visitId, initialDate: schedule.date, today: copy.stories.today, onClose: () => setSchedule(null), onConfirm: confirm } : undefined}/></main>;
}
