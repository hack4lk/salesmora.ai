import { describe, expect, it } from 'vitest';
import { validTeamLeadsResult, teamLeadOwnerKey } from './team-leads-report.validation';
import { teamLeadsResult as result, teamLeadRows as rows, myLeadsResult } from './team-leads-report.fixtures';

describe('Team Leads workload', () => {
  it('reconciles open, inactive and unassigned totals with every owner/stage', () => {
    expect(validTeamLeadsResult(result)).toBe(true);
    expect(validTeamLeadsResult(myLeadsResult)).toBe(true);
  });
  it('accepts matching queue, owner, owner-stage and owner-inactive evidence', () => {
    expect(validTeamLeadsResult({ ...result, selected: { kind: 'queue', queue: 'inactive' }, rows: rows.filter(row => row.inactive) })).toBe(true);
    expect(validTeamLeadsResult({ ...result, selected: { kind: 'queue', queue: 'unassigned' }, rows: [rows[3]!] })).toBe(true);
    expect(validTeamLeadsResult({ ...result, selected: { kind: 'owner', id: 'member:a', stage: 'contacted' }, rows: [rows[1]!] })).toBe(true);
    expect(validTeamLeadsResult({ ...result, selected: { kind: 'owner', id: 'member:a', inactiveOnly: true }, rows: [rows[1]!] })).toBe(true);
  });
  it('rejects closed and archived evidence', () => {
    for (const stage of ['won', 'lost'] as const) expect(validTeamLeadsResult({ ...result, rows: [{ ...rows[0]!, stage }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamLeadsResult({ ...result, rows: [{ ...rows[0]!, archived: true }, ...rows.slice(1)] })).toBe(false);
  });
  it('rejects unsafe, fractional and impossible counts', () => {
    for (const inactive of [-1, 0.5, NaN, Number.MAX_SAFE_INTEGER + 1, 5]) {
      expect(validTeamLeadsResult({ ...result, counts: { ...result.counts, inactive } })).toBe(false);
    }
    expect(validTeamLeadsResult({ ...result, owners: result.owners.map(owner => ({ ...owner, count: owner.count + 1 })) })).toBe(false);
  });
  it('rejects wrong projections, duplicate Leads and missing activity columns', () => {
    expect(validTeamLeadsResult({ ...result, selected: { kind: 'queue', queue: 'unassigned' }, rows: [rows[0]!] })).toBe(false);
    expect(validTeamLeadsResult({ ...result, rows: [rows[0]!, rows[0]!, ...rows.slice(2)] })).toBe(false);
    expect(validTeamLeadsResult({ ...result, rows: [{ ...rows[0]!, cells: {} }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamLeadsResult({ ...result, selected: { kind: 'owner', id: 'member:a', stage: 'new', inactiveOnly: true }, rows: [rows[0]!] })).toBe(false);
  });
  it('rejects unknown owners and inconsistent stage distributions even when totals agree', () => {
    expect(validTeamLeadsResult({ ...result, rows: [{ ...rows[0]!, currentOwnerId: 'hidden' }, ...rows.slice(1)] })).toBe(false);
    expect(validTeamLeadsResult({ ...result, rows: [{ ...rows[0]!, stage: 'estimate-sent' }, ...rows.slice(1)] })).toBe(false);
  });
  it('never accepts teammate/residual/unassigned results in assigned scope', () => {
    expect(validTeamLeadsResult({ ...result, scope: { kind: 'assigned', currentMemberId: 'a' } })).toBe(false);
    expect(validTeamLeadsResult({ ...myLeadsResult, rows: [rows[0]!, rows[2]!] })).toBe(false);
    expect(validTeamLeadsResult({ ...myLeadsResult, selected: { kind: 'queue', queue: 'unassigned' }, rows: [] })).toBe(false);
  });
  it('accepts empty and partial pages, rejecting inconsistent observed counts', () => {
    expect(validTeamLeadsResult({ ...result, pageSize: 2, rows: rows.slice(0, 2) })).toBe(true);
    expect(validTeamLeadsResult({ ...result, pageSize: 2, page: 2, rows: rows.slice(2) })).toBe(true);
    expect(validTeamLeadsResult({ ...result, pageSize: 2, page: 3, rows: [] })).toBe(false);
    expect(validTeamLeadsResult({ ...result, counts: { open: 0, inactive: 0, unassigned: 0 }, owners: [], rows: [] })).toBe(true);
  });
  it('distinguishes a member key from the missing-owner queue and requires an exact cutoff label', () => {
    expect(teamLeadOwnerKey({ ...rows[0]!, currentOwnerId: 'unassigned' })).toBe('member:unassigned');
    expect(teamLeadOwnerKey(rows[3]!)).toBe('unassigned');
    expect(validTeamLeadsResult({ ...result, inactivityCutoffLabel: '' })).toBe(false);
  });
});
