import { describe, expect, it } from 'vitest';
import { teamReportQuerySchema, teamReportReadResultSchema } from './team-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const rowId = '00000000-0000-4000-8000-000000000002';
const scope = { kind: 'workspace' } as const;
const common = { asOf: '2026-11-05T17:00:00.000Z', today: '2026-11-05', timezone: 'America/New_York',
  scopeLabel: 'Current authorized Team.', scope, filters: { members: [] }, page: 1, pageSize: 25, evidenceTotal: 1 };
const emptyLead = { count: 0, inactive: 0, stages: { new: 0, contacted: 0, 'estimate-sent': 0 } };
const emptyJob = { count: 0, overdue: 0, waiting: 0, statuses: { 'needs-scheduling': 0, scheduled: 0, 'in-progress': 0, waiting: 0 } };
const busyJob = { count: 1, overdue: 1, waiting: 1, statuses: { ...emptyJob.statuses, waiting: 1 } };
const leadQuery = teamReportQuerySchema.parse({ workspaceId, view: 'team-leads', selected: { kind: 'queue', queue: 'open' } });
const jobQuery = teamReportQuerySchema.parse({ workspaceId, view: 'team-jobs', selected: { kind: 'queue', queue: 'active' } });
const envelope = { workspaceId, viewerId: 'b', policyRevision: 1, authority: { leads: scope, jobs: scope },
  exportScopes: { leads: null, jobs: null },
  options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] };
const leads = { ...envelope, query: leadQuery, report: { ...common, view: 'team-leads',
  inactivityCutoff: '2026-10-29T17:00:00.000000Z', counts: { open: 1, inactive: 1, unassigned: 0 },
  owners: [{ id: 'member:a', label: 'A', count: 1, inactive: 1, stages: { ...emptyLead.stages, new: 1 } },
    { id: 'member:b', label: 'B', ...emptyLead }, { id: 'unassigned', label: 'Reassignment needed', ...emptyLead }],
  selected: leadQuery.selected, rows: [{ id: rowId, recordId: rowId, label: 'Lead A', stage: 'new', archived: false,
    currentOwnerId: 'a', ownerState: 'member', inactive: true,
    cells: { created: '2026-10-01T17:00:00.000000Z', activity: '2026-10-29T16:59:59.999999Z', owner: 'A' } }] } };
const jobs = { ...envelope, query: jobQuery, report: { ...common, view: 'team-jobs',
  counts: { active: 1, overdue: 1, waiting: 1 },
  members: [{ id: 'a', label: 'A', primary: busyJob, supporting: emptyJob },
    { id: 'b', label: 'B', primary: emptyJob, supporting: busyJob }],
  unassigned: emptyJob, selected: jobQuery.selected,
  rows: [{ id: rowId, recordId: rowId, label: 'Shared Job', status: 'waiting', completionDeadline: '2026-11-04',
    scheduledDate: null, waitingReason: 'materials', cells: { service: 'Repair' },
    primary: { kind: 'member', id: 'a' }, supportingMemberIds: ['b'] }] } };

describe('Team read authority envelope', () => {
  it('preserves current workload, exact inactivity and non-additive supporting responsibility', () => {
    expect(teamReportReadResultSchema.parse(leads).report).toEqual(leads.report);
    expect(teamReportReadResultSchema.parse(jobs).report).toEqual(jobs.report);
    expect(teamReportReadResultSchema.safeParse({ ...jobs, query: { ...jobQuery, page: 99 } }).success).toBe(true);
    expect(teamReportReadResultSchema.safeParse({ ...jobs, authority: { leads: null, jobs: scope } }).success).toBe(true);
    expect(teamReportReadResultSchema.safeParse({ ...leads, authority: { leads: scope, jobs: null } }).success).toBe(true);
  });
  it('supports independent domain scopes and self-only assigned rosters, including empty self workloads', () => {
    const assigned = { kind: 'assigned', currentMemberId: 'b' };
    const mine = { ...jobs, authority: { leads: scope, jobs: assigned }, options: [envelope.options[1]],
      report: { ...jobs.report, scope: assigned, members: [jobs.report.members[1]], unassigned: null,
        rows: [{ ...jobs.report.rows[0], primary: { kind: 'withheld' } }] } };
    expect(teamReportReadResultSchema.safeParse(mine).success).toBe(true);
    expect(teamReportReadResultSchema.safeParse({ ...mine, viewerId: 'a' }).success).toBe(false);
    expect(teamReportReadResultSchema.safeParse({ ...mine, options: envelope.options }).success).toBe(false);
    const empty = { ...leads, authority: { leads: assigned, jobs: null }, options: [envelope.options[1]],
      report: { ...leads.report, scope: assigned, counts: { open: 0, inactive: 0, unassigned: 0 },
        owners: [{ id: 'member:b', label: 'B', ...emptyLead }], rows: [], evidenceTotal: 0 } };
    expect(teamReportReadResultSchema.safeParse(empty).success).toBe(true);
  });
  it('permits independent narrower export scopes but never widens read access', () => {
    const assigned = { kind: 'assigned', currentMemberId: 'b' };
    expect(teamReportReadResultSchema.safeParse({ ...leads, exportScopes: { leads: assigned, jobs: null } }).success).toBe(true);
    expect(teamReportReadResultSchema.safeParse({ ...leads, exportScopes: { leads: { kind: 'assigned', currentMemberId: 'a' }, jobs: null } }).success).toBe(false);
    expect(teamReportReadResultSchema.safeParse({ ...leads, authority: { leads: scope, jobs: null },
      exportScopes: { leads: null, jobs: scope } }).success).toBe(false);
    const mine = { ...jobs, authority: { leads: scope, jobs: assigned }, options: [envelope.options[1]],
      report: { ...jobs.report, scope: assigned, members: [jobs.report.members[1]], unassigned: null,
        rows: [{ ...jobs.report.rows[0], primary: { kind: 'withheld' } }] } };
    expect(teamReportReadResultSchema.safeParse({ ...mine, exportScopes: { leads: null, jobs: assigned } }).success).toBe(true);
    expect(teamReportReadResultSchema.safeParse({ ...mine, exportScopes: { leads: null, jobs: scope } }).success).toBe(false);
  });
  it('retains all native queue, member, responsibility and status evidence selection families', () => {
    for (const selected of [
      { kind: 'queue', queue: 'inactive' },
      { kind: 'owner', id: 'member:a' },
      { kind: 'owner', id: 'member:a', stage: 'new' },
      { kind: 'owner', id: 'member:a', inactiveOnly: true },
    ]) {
      expect(teamReportReadResultSchema.safeParse({ ...leads, query: { ...leadQuery, selected },
        report: { ...leads.report, selected } }).success).toBe(true);
    }
    for (const selected of [{ kind: 'queue', queue: 'unassigned' }, { kind: 'owner', id: 'unassigned' }]) {
      expect(teamReportReadResultSchema.safeParse({ ...leads, query: { ...leadQuery, selected },
        report: { ...leads.report, selected, evidenceTotal: 0, rows: [] } }).success).toBe(true);
    }
    for (const queue of ['overdue', 'waiting']) {
      const selected = { kind: 'queue', queue };
      expect(teamReportReadResultSchema.safeParse({ ...jobs, query: { ...jobQuery, selected },
        report: { ...jobs.report, selected } }).success).toBe(true);
    }
    for (const [id, responsibility] of [['a', 'primary'], ['b', 'supporting']]) {
      for (const filter of ['all', 'overdue', 'waiting', 'needs-scheduling', 'scheduled', 'in-progress']) {
        const selected = { kind: 'member', id, responsibility, filter };
        const matches = ['all', 'overdue', 'waiting'].includes(filter);
        expect(teamReportReadResultSchema.safeParse({ ...jobs, query: { ...jobQuery, selected },
          report: { ...jobs.report, selected, evidenceTotal: matches ? 1 : 0, rows: matches ? jobs.report.rows : [] } }).success).toBe(true);
      }
    }
    for (const selected of [{ kind: 'queue', queue: 'unassigned' },
      ...['all', 'overdue', 'waiting', 'needs-scheduling', 'scheduled', 'in-progress'].map(filter => ({ kind: 'unassigned', filter }))]) {
      expect(teamReportReadResultSchema.safeParse({ ...jobs, query: { ...jobQuery, selected },
        report: { ...jobs.report, selected, evidenceTotal: 0, rows: [] } }).success).toBe(true);
    }
  });
  it('rejects forged actors, periods, unsupported facets, duplicate members and incompatible evidence', () => {
    for (const query of [leadQuery, jobQuery]) {
      for (const extra of [{ viewerId: 'forged' }, { role: 'owner' }, { period: { from: '2026-11-01', to: '2026-11-05' } },
        { filters: { members: ['b', 'b'] } }, { filters: { members: ['unassigned'] } }, { filters: { statuses: [] } }]) {
        expect(teamReportQuerySchema.safeParse({ ...query, ...extra }).success).toBe(false);
      }
    }
    expect(teamReportQuerySchema.safeParse({ ...leadQuery, selected: { kind: 'owner', id: 'member:a', stage: 'new', inactiveOnly: true } }).success).toBe(false);
    expect(teamReportQuerySchema.safeParse({ ...jobQuery, selected: { kind: 'member', id: 'b', responsibility: 'supporting', filter: 'completed' } }).success).toBe(false);
  });
  it('rejects stale roster, selected view/selection, scope, filters, clock and private payloads', () => {
    for (const original of [leads, jobs]) {
      for (const change of [{ workspaceId: rowId }, { policyRevision: Number.MAX_SAFE_INTEGER + 1 },
        { options: [envelope.options[0]] }, { options: [...envelope.options, envelope.options[0]] },
        { options: [{ value: 'a', label: 'Forged' }, envelope.options[1]] },
        { query: { ...original.query, pageSize: 50 } },
        { query: { ...original.query, filters: { members: ['missing'] } } },
        { authority: { leads: null, jobs: null } },
        { authority: { leads: scope, jobs: { kind: 'assigned', currentMemberId: 'other' } } },
        { report: { ...original.report, timezone: 'Invalid/Zone' } },
        { report: { ...original.report, today: '2026-11-06' } },
        { report: { ...original.report, rows: [{ ...original.report.rows[0], notes: 'private' }] } }]) {
        expect(teamReportReadResultSchema.safeParse({ ...original, ...change }).success).toBe(false);
      }
    }
    expect(teamReportReadResultSchema.safeParse({ ...leads, query: { ...leadQuery, selected: { kind: 'queue', queue: 'inactive' } } }).success).toBe(false);
    expect(teamReportReadResultSchema.safeParse({ ...jobs, query: { ...jobQuery, selected: { kind: 'queue', queue: 'waiting' } } }).success).toBe(false);
  });
});
