import { describe, expect, it } from 'vitest';
import { validEstimateReportFilters, type EstimateReportFiltersValue } from './estimate-report-filters';

const empty: EstimateReportFiltersValue = { owners: [], parents: [] };
const options = { owners: [{ value: 'member:a', label: 'Alex' }, { value: 'unassigned', label: 'No current owner' }],
  parents: [{ value: 'lead', label: 'Lead' }, { value: 'job', label: 'Job' }] };
describe('authorized Estimates report filter selections', () => {
  it('accepts empty selections and omitted/empty authorized facets without widening access', () => {
    for (const choices of [options, {}, { owners: [], parents: [] }]) expect(validEstimateReportFilters(empty, choices)).toBe(true);
  });
  it('accepts multiple authorized owners and canonical parent types', () => {
    expect(validEstimateReportFilters({ owners: ['member:a', 'unassigned'], parents: ['lead', 'job'] }, options)).toBe(true);
  });
  it('rejects duplicate selections and unavailable members/parents', () => {
    for (const value of [{ ...empty, owners: ['member:a', 'member:a'] }, { ...empty, parents: ['lead', 'lead'] },
      { ...empty, owners: ['hidden'] }, { ...empty, parents: ['customer'] }]) {
      expect(validEstimateReportFilters(value, options)).toBe(false);
    }
  });
  it('rejects duplicate, blank, unlabeled options and noncanonical parents', () => {
    for (const choices of [{ owners: [options.owners[0]!, options.owners[0]!] },
      { owners: [{ value: ' ', label: 'Blank' }] }, { owners: [{ value: 'member:a', label: ' ' }] },
      { parents: [{ value: 'customer', label: 'Customer' }] }, { parents: [options.parents[0]!, options.parents[0]!] }]) {
      expect(validEstimateReportFilters(empty, choices)).toBe(false);
    }
  });
  it('requires explicit correction after options are removed or a facet becomes inapplicable', () => {
    expect(validEstimateReportFilters({ ...empty, owners: ['member:a'] }, { owners: options.owners.slice(1) })).toBe(false);
    expect(validEstimateReportFilters({ ...empty, parents: ['lead'] }, { owners: options.owners })).toBe(false);
  });
  it('accepts authorized owner keys without inferring self-only access or imposing an arbitrary cap', () => {
    const owners = Array.from({ length: 60 }, (_, i) => ({ value: `owner:${i}`, label: `Owner ${i}` }));
    expect(validEstimateReportFilters({ ...empty, owners: owners.map(owner => owner.value) }, { owners })).toBe(true);
  });
});
