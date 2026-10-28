'use client';

import { Pagination } from '@salesmora/ui';
import { useId, useRef } from 'react';
import { CalendarToolbar } from '../calendar-toolbar/calendar-toolbar';
import { CalendarFilters, type CalendarFiltersValue, type CalendarPersonFilter } from '../calendar-filters/calendar-filters';
import { CalendarWeekGrid, type CalendarWeekEntry } from '../calendar-week-grid/calendar-week-grid';
import { CalendarUnscheduledList, type CalendarUnscheduledEntry } from '../calendar-unscheduled-list/calendar-unscheduled-list';
import { CalendarTeamWorkload, type CalendarWorkloadVisit } from '../calendar-team-workload/calendar-team-workload';
import { CalendarVisitPeekDrawer, type CalendarVisitPeekDrawerProps } from '../calendar-visit-peek-drawer/calendar-visit-peek-drawer';
import { CalendarScheduleDialog, type CalendarScheduleDialogProps } from '../calendar-schedule-dialog/calendar-schedule-dialog';
import { calendarPageData as copy } from './calendar-page.data';

export type CalendarPageProps = {
  weekDate: string; today: string; timezone: string;
  filters: CalendarFiltersValue; members: readonly { id: string; name: string }[]; viewerId: string; scope: 'workspace' | 'own';
  canSchedule: boolean; entries: readonly CalendarWeekEntry[]; unscheduled: readonly CalendarUnscheduledEntry[];
  unscheduledTotal?: number; workload: readonly CalendarWorkloadVisit[];
  state?: 'ready' | 'loading' | 'error'; notice?: string;
  peek?: Omit<CalendarVisitPeekDrawerProps, 'onSchedule'>;
  schedule?: CalendarScheduleDialogProps;
  onNavigate: (date: string) => void; onFilters: (filters: CalendarFiltersValue) => void;
  onOpenVisit: (id: string) => void; onSchedule: (request: { visitId?: string; date?: string }) => void;
  queuePagination?: { page: number; total: number; onPage: (page: number) => void };
  onViewAll?: () => void; onRetry?: () => void;
};
/** Controlled composition. The route supplies authorized projections, URL state and live commands. */
export function CalendarPage({ weekDate, today, timezone, filters, members, viewerId, scope, canSchedule, entries, unscheduled, unscheduledTotal, workload, state = 'ready', notice, peek, schedule, onNavigate, onFilters, onOpenVisit, onSchedule, onViewAll, onRetry, queuePagination }: CalendarPageProps) {
  const id = useId(), root = useRef<HTMLElement>(null), available = canSchedule && state === 'ready';
  function close(callback: () => void) {
    callback();
    // A successful schedule can remove its launch button from the queue/grid.
    requestAnimationFrame(() => { if (document.activeElement === document.body) root.current?.focus(); });
  }
  const filtered = filters.person !== (scope === 'own' ? 'me' : 'all') || filters.recordType !== 'all' || filters.status !== 'all' || !!filters.customerQuery.trim();
  return <section ref={root} tabIndex={-1} aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 text-ink focus-visible:focus-ring">
    <header><h1 id={`${id}-title`} className="m-0 text-heading font-semibold">{copy.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p></header>
    {notice && <p role="status" className="m-0 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold text-primary-dark">{notice}</p>}
    <CalendarToolbar date={weekDate} today={today} timezone={timezone} scopeLabel={scope === 'own' ? copy.mine : undefined} canSchedule={canSchedule} scheduleDisabled={state !== 'ready'} loading={state === 'loading'} onNavigate={onNavigate} onSchedule={() => onSchedule({})}/>
    <CalendarFilters value={filters} members={members} viewerId={viewerId} scope={scope} disabled={state === 'loading'} onChange={onFilters}/>
    <CalendarWeekGrid weekDate={weekDate} today={today} entries={entries} scopeLabel={scope === 'own' ? copy.mine : undefined} state={state} canSchedule={available} onOpenVisit={onOpenVisit} onSchedule={date => onSchedule({ date })} onRetry={onRetry}/>
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      <div className="grid min-w-0 gap-4"><CalendarUnscheduledList entries={unscheduled} total={unscheduledTotal} scopeLabel={scope === 'own' ? copy.myQueue : undefined} filtered={filtered} state={state} onOpenVisit={onOpenVisit} onSchedule={available ? visitId => onSchedule({ visitId }) : undefined} onViewAll={onViewAll} onRetry={onRetry}/>{state === 'ready' && queuePagination && queuePagination.total > 10 && <Pagination label={copy.queuePagination} page={queuePagination.page} total={queuePagination.total} pageSize={10} pageSizeOptions={[10]} onPageChange={queuePagination.onPage} onPageSizeChange={() => {}}/>}</div>
      <CalendarTeamWorkload weekDate={weekDate} visits={workload} members={members} viewerId={viewerId} scope={scope} selectedPerson={filters.person} state={state} disabled={state === 'loading'} onSelect={(person: CalendarPersonFilter) => onFilters({ ...filters, person })} onRetry={onRetry}/>
    </div>
    {peek && <CalendarVisitPeekDrawer {...peek} onClose={() => close(peek.onClose)} onSchedule={available ? visitId => onSchedule({ visitId }) : undefined}/>}
    {schedule && <CalendarScheduleDialog {...schedule} targets={available ? schedule.targets : schedule.targets.map(target => ({ ...target, canReschedule: false }))}
      onConfirm={async draft => { if (!available) throw new Error(copy.unavailable); await schedule.onConfirm(draft); }} onClose={() => close(schedule.onClose)}/>}
  </section>;
}
