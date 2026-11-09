import { describe, expect, it } from 'vitest';
import { teamReportQuerySchema, type TeamReportReadResult } from '@salesmora/contracts';
import { adaptTeamReadResponse, initialTeamEvidence, teamReportEvidenceSelection, teamReportRequest,
  teamReportScopeKey, visibleTeamRecord } from './team-read.adapter';
import { initialTeamQuery, teamAssignedAuthority, teamReadResponse, teamWorkspaceAuthority } from './team-read.fixtures';
import { validTeamReportProjection } from './team-report-workspace.validation';

function adapt(raw: TeamReportReadResult) {
  return adaptTeamReadResponse(raw, { request: raw.query, scopeKey: teamReportScopeKey(raw),
    today: raw.report.today, timezone: raw.report.timezone });
}
const jobQuery = teamReportRequest({ workspaceId: initialTeamQuery.workspaceId, view: 'jobs',
  evidence: initialTeamEvidence, filters: { members: [] }, page: 1, pageSize: 25 });

describe('Team native-to-canonical adaptation', () => {
  it('builds strict current requests with one shared member draft and exact selections', () => {
    for (const view of ['leads', 'jobs'] as const) {
      const query = teamReportRequest({ workspaceId: initialTeamQuery.workspaceId, view, evidence: initialTeamEvidence,
        filters: { members: ['member-b', 'member-c'] }, page: 3, pageSize: 50 });
      expect(query.filters.members).toEqual(['member-b', 'member-c']);
      expect(query.selected).toEqual(initialTeamEvidence[view]);
      expect(query).not.toHaveProperty('period');
      expect(query.page).toBe(3);
    }
    expect(() => teamReportRequest({ workspaceId: initialTeamQuery.workspaceId, view: 'jobs', evidence: initialTeamEvidence,
      filters: { members: [] }, page: 1, pageSize: 40 })).toThrow();
  });
  it('preserves exact inactivity, former-owner redaction, full zero-workload roster and native totals', () => {
    const raw = teamReadResponse(initialTeamQuery), { projection, filterOptions, availableViews } = adapt(raw);
    expect(availableViews).toEqual(['leads', 'jobs']);
    expect(filterOptions.map(option => option.value)).toEqual(['member-a', 'member-b', 'member-c']);
    expect(projection.view).toBe('leads');
    if (projection.view !== 'leads' || projection.state.kind !== 'ready') throw new Error('Expected ready Leads.');
    expect(projection.state.result.counts).toEqual({ open: 4, inactive: 2, unassigned: 1 });
    expect(projection.state.result.inactivityCutoffLabel).toContain('2026-10-29T09:00:00.000000Z');
    expect(projection.state.result.rows.find(row => row.label === 'Estimate at cutoff')?.inactive).toBe(false);
    expect(projection.state.result.rows.find(row => row.label === 'Referral awaiting contact')?.inactive).toBe(true);
    expect(projection.state.result.owners.find(owner => owner.id === 'member:member-c')?.count).toBe(0);
    expect(JSON.stringify(raw)).not.toContain('Unreliable former identity');
    expect(validTeamReportProjection(projection, raw.query.filters, raw.options, raw.report.scope)).toBe(true);
  });
  it('retains shared Job counterparts and non-additive supporting counts with selected-member OR matching', () => {
    const raw = teamReadResponse({ ...jobQuery, filters: { members: ['member-b', 'member-c'] } });
    const { projection } = adapt(raw);
    if (projection.view !== 'jobs' || projection.state.kind !== 'ready') throw new Error('Expected ready Jobs.');
    const result = projection.state.result;
    expect(result.counts.active).toBe(4);
    expect(result.members.find(member => member.id === 'member-a')?.primary.count).toBe(1);
    expect(result.members.reduce((sum, member) => sum + member.supporting.count, 0)).toBe(4);
    expect(result.rows.filter(row => row.label === 'D0 / overdue repair')).toHaveLength(1);
    expect(result.unassigned?.count).toBe(1);
    expect(validTeamReportProjection(projection, raw.query.filters, raw.options, raw.report.scope)).toBe(true);
  });
  it('maps every exposed queue/owner/stage/primary/supporting/status action to exact native evidence', () => {
    for (const query of [initialTeamQuery, jobQuery]) {
      const raw = teamReadResponse(query), { projection } = adapt(raw);
      const ids: string[] = [];
      if (projection.view === 'leads' && projection.state.kind === 'ready') {
        const result = projection.state.result;
        ids.push(...Object.values(result.evidenceIds).filter((id): id is string => id !== undefined));
        for (const owner of result.owners) {
          ids.push(owner.evidenceId!, owner.inactiveEvidenceId!, ...Object.values(owner.stageEvidenceIds ?? {}));
        }
      } else if (projection.view === 'jobs' && projection.state.kind === 'ready') {
        const result = projection.state.result;
        ids.push(...Object.values(result.evidenceIds).filter((id): id is string => id !== undefined));
        for (const workload of [...result.members.flatMap(member => [member.primary, member.supporting]), result.unassigned!]) {
          ids.push(workload.evidenceId!, workload.overdueEvidenceId!, workload.waitingEvidenceId!, ...Object.values(workload.statusEvidenceIds ?? {}));
        }
      } else throw new Error('Expected a ready projection.');
      for (const id of new Set(ids)) {
        const selected = teamReportEvidenceSelection(raw, id);
        const request = teamReportRequest({ workspaceId: query.workspaceId, view: selected.view, filters: query.filters,
          evidence: { ...initialTeamEvidence, [selected.view]: selected.evidence }, page: 1, pageSize: 25 });
        const next = teamReadResponse(request);
        expect(next.report.selected).toEqual(selected.evidence);
        expect(adapt(next).projection.state.kind).toBe('ready');
      }
      expect(() => teamReportEvidenceSelection(raw, 'unknown')).toThrow('unavailable');
    }
  });
  it('uses independent available views and self-only assigned scope without hidden primary or residual identities', () => {
    const raw = teamReadResponse(jobQuery, teamAssignedAuthority), { projection, filterOptions } = adapt(raw);
    expect(filterOptions.map(option => option.value)).toEqual(['member-c']);
    if (projection.view !== 'jobs' || projection.state.kind !== 'ready') throw new Error('Expected assigned Jobs.');
    expect(projection.state.result.counts).toEqual({ active: 2, overdue: 1, waiting: 0 });
    expect(projection.state.result.unassigned).toBeNull();
    expect(projection.state.result.rows.every(row => row.primary.kind === 'withheld')).toBe(true);
    expect(JSON.stringify(projection)).not.toMatch(/member-a|member-b|Unreliable/);
    expect(() => teamReportEvidenceSelection(raw, JSON.stringify(['team-jobs', { kind: 'queue', queue: 'unassigned' }]))).toThrow();
    const leads = adapt(teamReadResponse(initialTeamQuery, teamAssignedAuthority)).projection;
    if (leads.view !== 'leads' || leads.state.kind !== 'ready') throw new Error('Expected empty assigned Leads.');
    expect(leads.state.result.counts.open).toBe(0);
    expect(leads.state.result.owners).toHaveLength(1);
    expect(adapt(teamReadResponse(jobQuery, { leads: null, jobs: teamWorkspaceAuthority.jobs })).availableViews).toEqual(['jobs']);
    expect(adapt(teamReadResponse(initialTeamQuery, { leads: teamWorkspaceAuthority.leads, jobs: null })).availableViews).toEqual(['leads']);
  });
  it('preserves shared drafts and rejects unavailable destination members instead of clearing/widening', () => {
    const authority = { leads: teamWorkspaceAuthority.leads, jobs: teamAssignedAuthority.jobs };
    const selected = { members: ['member-b'] };
    expect(adapt(teamReadResponse({ ...initialTeamQuery, filters: selected }, authority)).projection.filters).toEqual(selected);
    const next = teamReportRequest({ workspaceId: initialTeamQuery.workspaceId, view: 'jobs', evidence: initialTeamEvidence,
      filters: selected, page: 1, pageSize: 25 });
    expect(next.filters).toEqual(selected);
    expect(() => teamReadResponse(next, authority)).toThrow('selected member is unavailable');
    expect(adapt(teamReadResponse({ ...next, filters: { members: ['member-c'] } }, authority)).filterOptions).toHaveLength(1);
  });
  it('rejects request/policy/viewer/domain/clock changes and private or malformed evidence explicitly', () => {
    const raw = teamReadResponse(jobQuery);
    const input = { request: raw.query, scopeKey: teamReportScopeKey(raw), today: raw.report.today, timezone: raw.report.timezone };
    for (const change of [{ viewerId: 'other' }, { policyRevision: 2 },
      { authority: { leads: null, jobs: teamWorkspaceAuthority.jobs } },
      { query: { ...raw.query, page: 2 } }, { report: { ...raw.report, notes: 'private' } },
      { options: [] }]) {
      expect(() => adaptTeamReadResponse({ ...raw, ...change }, input)).toThrow(/Team report/);
    }
    expect(() => adaptTeamReadResponse(raw, { ...input, today: '2026-11-06' })).toThrow();
    expect(() => adaptTeamReadResponse(raw, { ...input, timezone: 'UTC' })).toThrow();
    const invalid = { ...raw, options: [{ value: 'x', label: 'private payload label' }] };
    expect(() => adaptTeamReadResponse(invalid, input)).toThrow('Team report data does not match');
    expect(() => adaptTeamReadResponse(invalid, input)).not.toThrow('private payload label');
  });
  it('resolves only current evidence-page records to typed native UUIDs', () => {
    for (const [query, type] of [[initialTeamQuery, 'lead'], [jobQuery, 'job']] as const) {
      const raw = teamReadResponse(query), row = raw.report.rows[0];
      expect(visibleTeamRecord(raw, row.recordId)).toEqual({ type, id: row.id });
      expect(visibleTeamRecord(raw, 'unknown')).toBeUndefined();
    }
    const filtered = teamReadResponse(teamReportQuerySchema.parse({ ...jobQuery, selected: { kind: 'queue', queue: 'waiting' } }));
    expect(visibleTeamRecord(filtered, '00000000-0000-4000-8000-000000000101')).toBeUndefined();
  });
  it('traverses complete distinct 25/50/100 evidence pages with unchanging totals and past-end clamping', () => {
    for (const base of [initialTeamQuery, jobQuery]) for (const pageSize of [25, 50, 100] as const) {
      const ids = new Set<string>(), total = base.view === 'team-leads' ? 104 : 130;
      for (let page = 1; page <= Math.ceil(total / pageSize); page++) {
        const raw = teamReadResponse({ ...base, page, pageSize }, teamWorkspaceAuthority, true);
        expect(raw.report.evidenceTotal).toBe(total);
        const { projection } = adapt(raw);
        expect(validTeamReportProjection(projection, raw.query.filters, raw.options, raw.report.scope)).toBe(true);
        raw.report.rows.forEach(row => {
          expect(ids.has(row.id)).toBe(false); ids.add(row.id);
          expect(visibleTeamRecord(raw, row.recordId)?.id).toBe(row.id);
        });
      }
      expect(ids.size).toBe(total);
      const past = teamReadResponse({ ...base, page: 999, pageSize }, teamWorkspaceAuthority, true);
      expect(past.report.page).toBe(Math.ceil(total / pageSize));
      expect(adapt(past).projection.state.kind).toBe('ready');
    }
    expect(teamReportQuerySchema.safeParse({ ...jobQuery, filters: { members: ['member-c', 'member-c'] } }).success).toBe(false);
  });
});
