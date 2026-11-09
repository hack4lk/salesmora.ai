import type { JobWorkloadResult, JobWorkloadRow } from './job-workload-report.validation';

/** Fictional current snapshot matching the discovery deadline fixture; not application data. */
export const workloadRows: readonly JobWorkloadRow[] = [
  { id: 'd0', recordId: 'd0', label: 'D0 / overdue repair', status: 'in-progress', completionDeadline: '2026-11-04',
    scheduledDate: '2026-11-03', primaryOwnerId: 'member-a', serviceId: 'repair', waitingReason: null, cells: { owner: 'Teammate A', service: 'Repair' } },
  { id: 'd1', recordId: 'd1', label: 'D1 / due today', status: 'scheduled', completionDeadline: '2026-11-05',
    scheduledDate: '2026-11-05', primaryOwnerId: 'member-a', serviceId: 'repair', waitingReason: null, cells: { owner: 'Teammate A', service: 'Repair' } },
  { id: 'd2', recordId: 'd2', label: 'D2 / Waiting at due-soon boundary', status: 'waiting', completionDeadline: '2026-11-12',
    scheduledDate: '2026-11-03', primaryOwnerId: 'member-b', serviceId: 'installation', waitingReason: 'materials', cells: { owner: 'Teammate B', service: 'Installation' } },
  { id: 'd3', recordId: 'd3', label: 'D3 / no deadline or primary owner', status: 'needs-scheduling', completionDeadline: null,
    scheduledDate: null, primaryOwnerId: null, serviceId: 'none', waitingReason: null, cells: { owner: 'No current primary owner', service: 'No recorded service' } },
  { id: 'd5', recordId: 'd5', label: 'D5 / beyond due-soon window', status: 'in-progress', completionDeadline: '2026-11-13',
    scheduledDate: '2026-11-04', primaryOwnerId: 'member-b', serviceId: 'installation', waitingReason: null, cells: { owner: 'Teammate B', service: 'Installation' } },
];
export const workloadResult: JobWorkloadResult = {
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All currently authorized Jobs. Independent of selected reporting-period filters.',
  today: '2026-11-05', counts: { active: 5, overdue: 1, dueSoon: 2, noDeadline: 1, waiting: 1, unassigned: 1 },
  groups: {
    status: [
      { id: 'needs-scheduling', label: 'Needs Scheduling', count: 1, evidenceId: 'status:needs-scheduling' },
      { id: 'scheduled', label: 'Scheduled', count: 1, evidenceId: 'status:scheduled' },
      { id: 'in-progress', label: 'In Progress', count: 2, evidenceId: 'status:in-progress' },
      { id: 'waiting', label: 'Waiting', count: 1, evidenceId: 'status:waiting' },
    ],
    owner: [{ id: 'member:member-a', label: 'Teammate A', count: 2, evidenceId: 'owner:member-a' },
      { id: 'member:member-b', label: 'Teammate B', count: 2, evidenceId: 'owner:member-b' },
      { id: 'unassigned', label: 'No current primary owner', count: 1, evidenceId: 'owner:unassigned' }],
    service: [{ id: 'repair', label: 'Repair', count: 2, evidenceId: 'service:repair' },
      { id: 'installation', label: 'Installation', count: 2, evidenceId: 'service:installation' },
      { id: 'none', label: 'No recorded service', count: 1, evidenceId: 'service:none' }],
    waitingReason: [{ id: 'customer', label: 'Waiting on customer', count: 0, evidenceId: 'waitingReason:customer' },
      { id: 'materials', label: 'Waiting on materials', count: 1, evidenceId: 'waitingReason:materials' },
      { id: 'approval', label: 'Waiting on approval', count: 0, evidenceId: 'waitingReason:approval' },
      { id: 'other', label: 'Other', count: 0, evidenceId: 'waitingReason:other' }],
  },
  evidenceIds: { active: 'active', overdue: 'overdue', dueSoon: 'dueSoon', noDeadline: 'noDeadline', waiting: 'waiting', unassigned: 'unassigned' },
  selected: { kind: 'metric', metric: 'active' }, rows: workloadRows, page: 1, pageSize: 25,
};
