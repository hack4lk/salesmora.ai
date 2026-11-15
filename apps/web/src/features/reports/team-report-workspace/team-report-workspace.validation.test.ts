import { describe, expect, it } from 'vitest';
import type { TeamReportProjection } from './team-report-workspace';
import { teamMemberOptions, teamWorkspaceResponse } from './team-report-workspace.fixtures';
import { validTeamReportProjection } from './team-report-workspace.validation';

const workspace = { kind: 'workspace' } as const;
const empty = { members: [] };
describe('Team workspace authorized projections', () => {
  it('accepts matching ready/loading/error projections and both current views', () => {
    for (const view of ['leads', 'jobs'] as const) {
      expect(validTeamReportProjection(teamWorkspaceResponse(view, empty), empty, teamMemberOptions, workspace)).toBe(true);
      for (const kind of ['loading', 'error'] as const) {
        expect(validTeamReportProjection({ view, filters: empty, state: { kind } }, empty, teamMemberOptions, workspace)).toBe(true);
      }
    }
  });
  it('accepts OR member matching, counterpart responsibility cards and distinct shared Jobs', () => {
    const filters = { members: ['member-b', 'member-c'] };
    const projection = teamWorkspaceResponse('jobs', filters);
    expect(validTeamReportProjection(projection, filters, teamMemberOptions, workspace)).toBe(true);
    if (projection.view !== 'jobs' || projection.state.kind !== 'ready') throw new Error('Expected Jobs fixture');
    expect(projection.state.result.rows.map(row => row.id)).toEqual(['d0', 'd2', 'd3', 'd5']);
    expect(projection.state.result.counts.active).toBe(4);
    expect(projection.state.result.members.find(member => member.id === 'member-a')?.primary.count).toBe(1);
    expect(projection.state.result.unassigned?.count).toBe(1);
  });
  it('checks matching Leads and filtered evidence at every page', () => {
    const filters = { members: ['member-a'] };
    for (const page of [1, 2]) {
      expect(validTeamReportProjection(teamWorkspaceResponse('leads', filters, workspace, 'open', page, 1), filters, teamMemberOptions, workspace)).toBe(true);
    }
    expect(validTeamReportProjection(teamWorkspaceResponse('leads', filters, workspace, 'inactive'), filters, teamMemberOptions, workspace)).toBe(true);
  });
  it('rejects stale filter snapshots, invalid drafts and unavailable rosters', () => {
    const projection = teamWorkspaceResponse('jobs', empty);
    expect(validTeamReportProjection(projection, { members: ['member-a'] }, teamMemberOptions, workspace)).toBe(false);
    expect(validTeamReportProjection(projection, { members: ['hidden'] }, teamMemberOptions, workspace)).toBe(false);
    expect(validTeamReportProjection(projection, empty, teamMemberOptions.slice(0, 1), workspace)).toBe(false);
  });
  it('rejects falsely relabeled unfiltered rows and aggregate membership', () => {
    const filters = { members: ['member-c'] };
    for (const view of ['leads', 'jobs'] as const) {
      const projection: TeamReportProjection = { ...teamWorkspaceResponse(view, empty), filters };
      expect(validTeamReportProjection(projection, filters, teamMemberOptions, workspace)).toBe(false);
    }
    const projection = teamWorkspaceResponse('leads', { members: ['member-a'] });
    if (projection.view !== 'leads' || projection.state.kind !== 'ready') throw new Error('Expected Leads fixture');
    // A zero-row queue cannot hide positive aggregates for an unselected member.
    const stale: TeamReportProjection = { view: 'leads', filters: { members: ['member-c'] }, state: { kind: 'ready',
      result: { ...projection.state.result, selected: { kind: 'queue', queue: 'unassigned' }, rows: [] } } };
    expect(validTeamReportProjection(stale, stale.filters, teamMemberOptions, workspace)).toBe(false);
  });
  it('accepts only matching self-only scope and prevents scope/identity drift', () => {
    const scope = { kind: 'assigned', currentMemberId: 'member-a' } as const;
    const options = teamMemberOptions.slice(0, 1);
    for (const view of ['leads', 'jobs'] as const) {
      const projection = teamWorkspaceResponse(view, empty, scope);
      expect(validTeamReportProjection(projection, empty, options, scope)).toBe(true);
      expect(validTeamReportProjection(projection, empty, teamMemberOptions, workspace)).toBe(false);
      expect(validTeamReportProjection(teamWorkspaceResponse(view, empty), empty, options, scope)).toBe(false);
      expect(validTeamReportProjection(projection, empty, [teamMemberOptions[2]!], { kind: 'assigned', currentMemberId: 'member-c' })).toBe(false);
    }
  });
  it('validates empty matches and filter order independently of selection order', () => {
    const filters = { members: ['member-c'] };
    expect(validTeamReportProjection(teamWorkspaceResponse('leads', filters), filters, teamMemberOptions, workspace)).toBe(true);
    const multi = { members: ['member-a', 'member-b'] };
    expect(validTeamReportProjection(teamWorkspaceResponse('jobs', multi), { members: [...multi.members].reverse() }, teamMemberOptions, workspace)).toBe(true);
  });
});
