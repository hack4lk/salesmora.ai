'use client';

import { useId } from 'react';
import { FilterBar, type ActiveFilter } from '@salesmora/ui';
import { jobInput, jobLabel } from '../../jobs/job-ui';
import { calendarFiltersData as copy, calendarFilterStatuses } from './calendar-filters.data';

export type CalendarPersonFilter = 'all' | 'me' | 'unassigned' | `member:${string}`;
export type CalendarFiltersValue = {
  person: CalendarPersonFilter;
  recordType: 'all' | 'job' | 'work_order';
  status: 'all' | typeof calendarFilterStatuses[number]['value'];
  customerQuery: string;
};
export const emptyCalendarFilters: CalendarFiltersValue = { person: 'all', recordType: 'all', status: 'all', customerQuery: '' };
export type CalendarFiltersProps = {
  value: CalendarFiltersValue;
  /** Already-scoped teammate options; scope is derived from current server authority, not the role name. */
  members: readonly { id: string; name: string }[];
  viewerId: string;
  scope: 'workspace' | 'own';
  disabled?: boolean;
  /** Parent owns search debounce, URL state and permission-scoped queries. */
  onChange: (value: CalendarFiltersValue) => void;
};
export function CalendarFilters({ value, members, viewerId, scope, disabled = false, onChange }: CalendarFiltersProps) {
  const id = useId();
  const people = scope === 'own' ? [{ value: 'me' as const, label: copy.me }] : [
    { value: 'all' as const, label: copy.allPeople }, { value: 'me' as const, label: copy.me }, { value: 'unassigned' as const, label: copy.unassigned },
    ...[...new Map(members.filter(member => member.id !== viewerId).map(member => [member.id, member])).values()].map(member => ({ value: `member:${member.id}` as const, label: member.name })),
  ];
  function normalize(next: CalendarFiltersValue): CalendarFiltersValue {
    const recordType = (['all', 'job', 'work_order'] as const).find(type => type === next.recordType) ?? 'all';
    return { person: scope === 'own' ? 'me' : people.find(person => person.value === next.person)?.value ?? 'all', recordType,
      status: calendarFilterStatuses.find(status => status.value === next.status && (recordType === 'all' || status.type === recordType))?.value ?? 'all', customerQuery: next.customerQuery.slice(0, 200) };
  }
  const visible = normalize(value), statuses = calendarFilterStatuses.filter(status => visible.recordType === 'all' || status.type === visible.recordType);
  const change = (patch: Partial<CalendarFiltersValue>) => { if (!disabled) onChange(normalize({ ...visible, ...patch })); };
  const chips: ActiveFilter[] = [];
  if (scope !== 'own' && visible.person !== 'all') chips.push({ id: 'person', label: visible.person === 'me' ? copy.mine : copy.chip(copy.person, people.find(person => person.value === visible.person)!.label) });
  if (visible.recordType !== 'all') chips.push({ id: 'recordType', label: copy.chip(copy.type, copy.types[visible.recordType]) });
  if (visible.status !== 'all') chips.push({ id: 'status', label: copy.chip(copy.status, statuses.find(status => status.value === visible.status)!.label) });
  if (visible.customerQuery.trim()) chips.push({ id: 'customerQuery', label: copy.chip(copy.search, visible.customerQuery.trim()) });
  return <div className="grid min-w-0 gap-3 text-ink">
    <FilterBar title={copy.title} activeFilters={chips} disabled={disabled}
      onClearAll={() => change({ ...emptyCalendarFilters, person: scope === 'own' ? 'me' : 'all' })}
      onRemove={key => { if (key === 'person') change({ person: 'all' }); else if (key === 'recordType') change({ recordType: 'all' }); else if (key === 'status') change({ status: 'all' }); else if (key === 'customerQuery') change({ customerQuery: '' }); }}>
      <label className={`${jobLabel} flex-1 basis-48`}>{copy.person}<select className={jobInput} value={visible.person} disabled={disabled || scope === 'own'} onChange={event => change({ person: people.find(person => person.value === event.target.value)?.value ?? 'all' })}>
        {people.map(person => <option key={person.value} value={person.value}>{person.label}</option>)}
      </select></label>
      <label className={`${jobLabel} flex-1 basis-48`}>{copy.type}<select className={jobInput} value={visible.recordType} disabled={disabled} onChange={event => change({ recordType: (['all', 'job', 'work_order'] as const).find(type => type === event.target.value) ?? 'all' })}>
        {(['all', 'job', 'work_order'] as const).map(type => <option key={type} value={type}>{copy.types[type]}</option>)}
      </select></label>
      <label className={`${jobLabel} flex-1 basis-48`}>{copy.status}<select className={jobInput} value={visible.status} disabled={disabled} onChange={event => change({ status: statuses.find(status => status.value === event.target.value)?.value ?? 'all' })}>
        <option value="all">{copy.allStatuses}</option>{statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
      </select></label>
      <label className={`${jobLabel} flex-1 basis-56`}>{copy.search}<input type="search" className={jobInput} maxLength={200} disabled={disabled} placeholder={copy.placeholder} value={visible.customerQuery} onChange={event => change({ customerQuery: event.target.value })}/></label>
      <label className={`flex min-h-11 items-center gap-2 self-end text-sm font-semibold ${disabled || scope === 'own' ? 'cursor-not-allowed text-muted' : 'cursor-pointer'}`}>
        <input type="checkbox" role="switch" aria-describedby={scope === 'own' ? `${id}-scope` : undefined} checked={visible.person === 'me'} disabled={disabled || scope === 'own'}
          onChange={event => change({ person: event.target.checked ? 'me' : 'all' })} className="size-5 accent-primary focus-visible:focus-ring"/>{copy.mine}
      </label>
    </FilterBar>
    {scope === 'own' && <p id={`${id}-scope`} className="m-0 text-sm leading-6 text-muted">{copy.ownScope}</p>}
    <p className="m-0 text-xs leading-5 text-muted">{copy.shared}</p>
  </div>;
}
