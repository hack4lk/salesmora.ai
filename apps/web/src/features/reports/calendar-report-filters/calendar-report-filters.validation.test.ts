import { describe, expect, it } from 'vitest';
import { validCalendarReportFilters, type CalendarReportFiltersOptions, type CalendarReportFiltersValue } from './calendar-report-filters';

const empty: CalendarReportFiltersValue = { participants: [], recordTypes: [] };
const options: CalendarReportFiltersOptions = {
  participants: [{ value: 'alex', label: 'Alex' }, { value: 'blair', label: 'Blair' }],
  recordTypes: [{ value: 'job', label: 'Job' }, { value: 'work_order', label: 'Work Order' }],
};
const workspace = { kind: 'workspace' } as const;
describe('Calendar report filters', () => {
  it('accepts empty authorized selections and multiple values in both facets', () => {
    expect(validCalendarReportFilters(empty, options, workspace)).toBe(true);
    expect(validCalendarReportFilters({ participants: ['alex', 'blair'], recordTypes: ['job', 'work_order'] }, options, workspace)).toBe(true);
    expect(validCalendarReportFilters(empty, { participants: [], recordTypes: [] }, workspace)).toBe(true);
  });
  it('rejects duplicate or unavailable saved values without silently dropping them', () => {
    for (const value of [
      { ...empty, participants: ['alex', 'alex'] }, { ...empty, participants: ['hidden'] },
      { ...empty, participants: ['unassigned'] }, { ...empty, recordTypes: ['job', 'job'] },
      { ...empty, recordTypes: ['customer'] },
    ]) expect(validCalendarReportFilters(value, options, workspace)).toBe(false);
  });
  it('requires an empty selection for omitted facets', () => {
    expect(validCalendarReportFilters(empty, {}, workspace)).toBe(true);
    expect(validCalendarReportFilters({ ...empty, participants: ['alex'] }, { recordTypes: options.recordTypes }, workspace)).toBe(false);
    expect(validCalendarReportFilters({ ...empty, recordTypes: ['job'] }, { participants: options.participants }, workspace)).toBe(false);
  });
  it('rejects duplicate, blank, sentinel and invalid record-type options', () => {
    for (const invalid of [
      { participants: [options.participants![0]!, options.participants![0]!] },
      { participants: [{ value: '', label: 'Person' }] },
      { participants: [{ value: 'alex', label: ' ' }] },
      { participants: [{ value: 'unassigned', label: 'Unassigned' }] },
      { recordTypes: [{ value: 'lead', label: 'Lead' }] },
      { recordTypes: [{ value: 'job', label: 'Job' }, { value: 'job', label: 'Job again' }] },
    ]) expect(validCalendarReportFilters(empty, invalid, workspace)).toBe(false);
  });
  it('restricts own scope to viewer options and selections, including omitted/empty lists', () => {
    const own = { kind: 'own', viewerId: 'alex' } as const;
    const ownOptions = { ...options, participants: [options.participants![0]!] };
    expect(validCalendarReportFilters(empty, ownOptions, own)).toBe(true);
    expect(validCalendarReportFilters({ participants: ['alex'], recordTypes: ['work_order'] }, ownOptions, own)).toBe(true);
    expect(validCalendarReportFilters(empty, { recordTypes: options.recordTypes }, own)).toBe(true);
    expect(validCalendarReportFilters(empty, options, own)).toBe(false);
    expect(validCalendarReportFilters({ ...empty, participants: ['blair'] }, ownOptions, own)).toBe(false);
    expect(validCalendarReportFilters(empty, {}, { kind: 'own', viewerId: '' })).toBe(false);
    expect(validCalendarReportFilters(empty, {}, { kind: 'own', viewerId: 'unassigned' })).toBe(false);
  });
  it('allows only authorized Work Order types without introducing parent-Job access', () => {
    const orders = { participants: options.participants, recordTypes: [{ value: 'work_order', label: 'Work Order' }] };
    expect(validCalendarReportFilters({ ...empty, recordTypes: ['work_order'] }, orders, workspace)).toBe(true);
    expect(validCalendarReportFilters({ ...empty, recordTypes: ['job'] }, orders, workspace)).toBe(false);
  });
});
