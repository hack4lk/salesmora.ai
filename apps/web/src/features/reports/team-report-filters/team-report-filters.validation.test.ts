import { describe, expect, it } from 'vitest';
import { validTeamReportFilters, type TeamReportFilterScope } from './team-report-filters';

const workspace: TeamReportFilterScope = { kind: 'workspace' };
const assigned: TeamReportFilterScope = { kind: 'assigned', currentMemberId: 'a' };
const options = [{ value: 'a', label: 'Alex' }, { value: 'b', label: 'Blair' }];
describe('authorized Team member filters', () => {
  it('accepts empty selections and empty authorized rosters without widening access', () => {
    expect(validTeamReportFilters({ members: [] }, options, workspace)).toBe(true);
    expect(validTeamReportFilters({ members: [] }, [], workspace)).toBe(true);
    expect(validTeamReportFilters({ members: [] }, [], assigned)).toBe(true);
  });
  it('accepts multiple current members with no arbitrary selection cap', () => {
    const choices = Array.from({ length: 60 }, (_, i) => ({ value: `member-${i}`, label: `Member ${i}` }));
    expect(validTeamReportFilters({ members: choices.map(choice => choice.value) }, choices, workspace)).toBe(true);
  });
  it('rejects duplicate or unavailable selections and requires correction after removal', () => {
    for (const members of [['a', 'a'], ['hidden'], ['b']]) {
      expect(validTeamReportFilters({ members }, options.slice(0, 1), workspace)).toBe(false);
    }
  });
  it('rejects duplicate, blank, unlabeled and unassigned options', () => {
    for (const choices of [[options[0]!, options[0]!], [{ value: ' ', label: 'Blank' }],
      [{ value: 'a', label: ' ' }], [{ value: 'unassigned', label: 'No primary owner' }]]) {
      expect(validTeamReportFilters({ members: [] }, choices, workspace)).toBe(false);
    }
  });
  it('permits only self options and selections under assigned scope', () => {
    expect(validTeamReportFilters({ members: ['a'] }, options.slice(0, 1), assigned)).toBe(true);
    expect(validTeamReportFilters({ members: [] }, options, assigned)).toBe(false);
    expect(validTeamReportFilters({ members: ['b'] }, options.slice(0, 1), assigned)).toBe(false);
    expect(validTeamReportFilters({ members: [] }, [], { kind: 'assigned', currentMemberId: ' ' })).toBe(false);
    expect(validTeamReportFilters({ members: [] }, [], { kind: 'assigned', currentMemberId: 'unassigned' })).toBe(false);
  });
});
