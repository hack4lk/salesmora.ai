'use client';

import { FilterBar, type ActiveFilter } from '@salesmora/ui';
import { jobInput, jobLabel } from '../../jobs/job-ui';
import type { GanttCustomer, GanttTeamMember } from '../gantt-chart.types';
import { ganttFiltersData as copy } from './gantt-filters.data';

export type GanttFiltersValue = {
  status: string;
  team: string;
  customer: string;
};

export const emptyGanttFilters: GanttFiltersValue = { status: 'all', team: 'all', customer: 'all' };

export type GanttFiltersProps = {
  teamMembers: readonly GanttTeamMember[];
  customers: readonly GanttCustomer[];
  filters: GanttFiltersValue;
  onFiltersChange: (filters: GanttFiltersValue) => void;
};

/**
 * Filter bar for the Gantt chart (Status, Team, Customer) using single-select dropdowns.
 */
export function GanttFilters({ teamMembers, customers, filters, onFiltersChange }: GanttFiltersProps) {
  const chips: ActiveFilter[] = [];
  if (filters.status !== 'all') {
    const label = copy.jobStatuses.find((s) => s.value === filters.status)?.label ?? filters.status;
    chips.push({ id: 'status', label: copy.chip(copy.status, label) });
  }
  if (filters.team !== 'all') {
    const label = teamMembers.find((m) => m.id === filters.team)?.name ?? filters.team;
    chips.push({ id: 'team', label: copy.chip(copy.team, label) });
  }
  if (filters.customer !== 'all') {
    const label = customers.find((c) => c.id === filters.customer)?.name ?? filters.customer;
    chips.push({ id: 'customer', label: copy.chip(copy.customer, label) });
  }

  return (
    <FilterBar
      title={copy.title}
      activeFilters={chips}
      onClearAll={() => onFiltersChange(emptyGanttFilters)}
      onRemove={(key) => onFiltersChange({ ...filters, [key]: 'all' })}
    >
      <label className={`${jobLabel} flex-1 basis-48`}>
        {copy.status}
        <select
          className={jobInput}
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
        >
          <option value="all">{copy.allStatuses}</option>
          {copy.jobStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className={`${jobLabel} flex-1 basis-48`}>
        {copy.team}
        <select
          className={jobInput}
          value={filters.team}
          onChange={(e) => onFiltersChange({ ...filters, team: e.target.value })}
        >
          <option value="all">{copy.allTeam}</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>

      <label className={`${jobLabel} flex-1 basis-56`}>
        {copy.customer}
        <select
          className={jobInput}
          value={filters.customer}
          onChange={(e) => onFiltersChange({ ...filters, customer: e.target.value })}
        >
          <option value="all">{copy.allCustomers}</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>
    </FilterBar>
  );
}
