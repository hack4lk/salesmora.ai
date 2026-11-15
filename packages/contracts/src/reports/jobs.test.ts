import { describe, expect, it } from 'vitest';
import { jobWorkloadQuerySchema, jobWorkloadResultSchema } from './jobs';

const query = {
  workspaceId: '00000000-0000-4000-8000-000000000001',
  view: 'workload',
  filters: { statuses: [], owners: [], services: [] },
  selection: { kind: 'metric', metric: 'dueSoon' },
  page: 1,
  pageSize: 25,
} as const;

const result = {
  view: 'workload',
  asOf: '2026-11-05T17:00:00.000Z',
  today: '2026-11-05',
  timezone: 'America/New_York',
  scopeLabel: 'All Jobs authorized by current workspace access.',
  filters: query.filters,
  counts: { active: 2, overdue: 1, dueSoon: 1, noDeadline: 0, waiting: 1, unassigned: 0 },
  groups: {
    status: [
      { id: 'needs-scheduling', label: 'Needs Scheduling', count: 1, evidenceId: 'status:needs-scheduling' },
      { id: 'scheduled', label: 'Scheduled', count: 0, evidenceId: 'status:scheduled' },
      { id: 'in-progress', label: 'In Progress', count: 0, evidenceId: 'status:in-progress' },
      { id: 'waiting', label: 'Waiting', count: 1, evidenceId: 'status:waiting' },
    ],
    owner: [
      { id: 'member:owner-a', label: 'Owner A', count: 1, evidenceId: 'owner:member:owner-a' },
      { id: 'member:owner-b', label: 'Owner B', count: 1, evidenceId: 'owner:member:owner-b' },
      { id: 'unassigned', label: 'No current primary owner', count: 0, evidenceId: 'owner:unassigned' },
    ],
    service: [
      { id: 'service:repair', label: 'Repair', count: 1, evidenceId: 'service:service:repair' },
      { id: 'service:installation', label: 'Installation', count: 1, evidenceId: 'service:service:installation' },
      { id: 'none', label: 'No recorded service', count: 0, evidenceId: 'service:none' },
    ],
    waitingReason: [
      { id: 'customer', label: 'Waiting on customer', count: 0, evidenceId: 'waitingReason:customer' },
      { id: 'materials', label: 'Waiting on materials', count: 1, evidenceId: 'waitingReason:materials' },
      { id: 'approval', label: 'Waiting on approval', count: 0, evidenceId: 'waitingReason:approval' },
      { id: 'other', label: 'Other', count: 0, evidenceId: 'waitingReason:other' },
    ],
  },
  evidenceIds: {
    active: 'active',
    overdue: 'overdue',
    dueSoon: 'dueSoon',
    noDeadline: 'noDeadline',
    waiting: 'waiting',
    unassigned: 'unassigned',
  },
  selection: query.selection,
  page: 1,
  pageSize: 25,
  evidenceTotal: 1,
  rows: [{
    id: '00000000-0000-4000-8000-000000000002',
    label: 'J-0002 / Scheduled repair',
    recordId: '00000000-0000-4000-8000-000000000002',
    cells: { owner: 'Owner B', service: 'Installation' },
    status: 'waiting',
    completionDeadline: '2026-11-12',
    scheduledDate: '2026-11-03',
    primaryOwnerId: 'owner-b',
    serviceId: 'service:installation',
    waitingReason: 'materials',
  }],
} as const;

describe('jobWorkloadQuerySchema', () => {
  it('accepts a strict workload projection and rejects closed statuses', () => {
    expect(jobWorkloadQuerySchema.parse(query)).toMatchObject({
      filters: { statuses: [], owners: [], services: [] },
      page: 1,
      pageSize: 25,
    });
    expect(jobWorkloadQuerySchema.safeParse({
      ...query,
      filters: { ...query.filters, statuses: ['completed'] },
    }).success).toBe(false);
    expect(jobWorkloadQuerySchema.safeParse({ ...query, unexpected: true }).success).toBe(false);
  });

  it('requires unique bounded filters and closed owner/service group tokens', () => {
    expect(jobWorkloadQuerySchema.safeParse({
      ...query,
      filters: { ...query.filters, owners: ['unassigned', 'unassigned'] },
    }).success).toBe(false);
    expect(jobWorkloadQuerySchema.safeParse({
      ...query,
      filters: { ...query.filters, services: ['repair'] },
    }).success).toBe(false);
    expect(jobWorkloadQuerySchema.safeParse({
      ...query,
      selection: { kind: 'group', group: 'status', id: 'completed' },
    }).success).toBe(false);
  });
});

describe('jobWorkloadResultSchema', () => {
  it('accepts reconciled current counts, groups, and selected evidence', () => {
    expect(jobWorkloadResultSchema.safeParse(result).success).toBe(true);
  });

  it('rejects inconsistent groups, metrics, duplicate rows, and unsafe dates', () => {
    expect(jobWorkloadResultSchema.safeParse({
      ...result,
      groups: { ...result.groups, service: [] },
    }).success).toBe(false);
    expect(jobWorkloadResultSchema.safeParse({
      ...result,
      counts: { ...result.counts, overdue: 2 },
    }).success).toBe(false);
    expect(jobWorkloadResultSchema.safeParse({
      ...result,
      rows: [...result.rows, ...result.rows],
      evidenceTotal: 2,
    }).success).toBe(false);
    expect(jobWorkloadResultSchema.safeParse({ ...result, today: '0000-01-01' }).success).toBe(false);
  });

  it('rejects selected groups with no matching current group total', () => {
    expect(jobWorkloadResultSchema.safeParse({
      ...result,
      selection: { kind: 'group', group: 'owner', id: 'member:missing' },
    }).success).toBe(false);
  });
});
