import { describe, expect, it } from 'vitest';
import { jobStatuses } from '@salesmora/contracts';
import { validJobReportFilters, type JobReportFiltersOptions, type JobReportFiltersValue } from './job-report-filters';

const empty: JobReportFiltersValue = { statuses: [], owners: [], services: [] };
const options: JobReportFiltersOptions = {
  statuses: jobStatuses.map(value => ({ value, label: value })),
  owners: [{ value: 'member:a', label: 'Teammate A' }, { value: 'unassigned', label: 'No current primary owner' }],
  services: [{ value: 'repair', label: 'Repair' }, { value: 'none', label: 'No recorded service' }],
};
describe('authorized Jobs report filters', () => {
  it('accepts all authorized values through empty selections, including omitted facets', () => {
    expect(validJobReportFilters(empty, options, 'period')).toBe(true);
    expect(validJobReportFilters(empty, {}, 'current')).toBe(true);
  });
  it('accepts multi-select facets without widening authorization', () => {
    expect(validJobReportFilters({ statuses: ['waiting', 'completed'], owners: ['member:a', 'unassigned'], services: ['repair', 'none'] }, options, 'period')).toBe(true);
  });
  it('allows all contract statuses for period results but only active statuses for current results', () => {
    expect(validJobReportFilters(empty, options, 'current')).toBe(false);
    const current = { ...options, statuses: options.statuses!.slice(0, 4) };
    expect(validJobReportFilters({ ...empty, statuses: ['waiting'] }, current, 'current')).toBe(true);
    expect(validJobReportFilters({ ...empty, statuses: ['completed'] }, current, 'current')).toBe(false);
    expect(validJobReportFilters({ ...empty, statuses: ['canceled'] }, current, 'current')).toBe(false);
  });
  it('rejects noncanonical statuses, duplicate/blank options and empty labels', () => {
    for (const choice of [{ value: 'in_progress', label: 'In Progress' }, { value: '', label: 'Empty' }, { value: 'waiting', label: ' ' }]) {
      expect(validJobReportFilters(empty, { statuses: [choice] }, 'period')).toBe(false);
    }
    expect(validJobReportFilters(empty, { owners: [options.owners![0]!, options.owners![0]!] }, 'period')).toBe(false);
  });
  it('rejects duplicates and unavailable/hidden values in every facet', () => {
    for (const facet of ['statuses', 'owners', 'services'] as const) {
      const choice = options[facet]![0]!.value;
      expect(validJobReportFilters({ ...empty, [facet]: [choice, choice] }, options, 'period')).toBe(false);
      expect(validJobReportFilters({ ...empty, [facet]: ['hidden'] }, options, 'period')).toBe(false);
    }
  });
  it('requires explicit correction when a facet becomes inapplicable or an owner is removed', () => {
    expect(validJobReportFilters({ ...empty, services: ['repair'] }, { owners: options.owners }, 'current')).toBe(false);
    expect(validJobReportFilters({ ...empty, owners: ['member:a'] }, { owners: options.owners!.slice(1) }, 'current')).toBe(false);
  });
  it('keeps owner/service keys opaque and allows every authorized choice without an arbitrary cap', () => {
    const choices = Array.from({ length: 60 }, (_, i) => ({ value: `service:${i}`, label: `Service ${i}` }));
    expect(validJobReportFilters({ ...empty, services: choices.map(choice => choice.value) }, { services: choices }, 'period')).toBe(true);
    expect(validJobReportFilters({ ...empty, owners: ['member:unassigned'] },
      { owners: [{ value: 'member:unassigned', label: 'Authorized member' }] }, 'current')).toBe(true);
  });
});
