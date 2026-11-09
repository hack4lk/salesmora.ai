import type { TeamLeadRow, TeamLeadsResult } from './team-leads-report.validation';

export const teamLeadRows: readonly TeamLeadRow[] = [
  { id: 'a1', recordId: 'a1', label: 'Website inquiry', stage: 'new', archived: false, currentOwnerId: 'a', inactive: false,
    cells: { created: 'Oct 20, 2026', activity: 'Nov 5, 2026 at 10:00' } },
  { id: 'a2', recordId: 'a2', label: 'Referral awaiting contact', stage: 'contacted', archived: false, currentOwnerId: 'a', inactive: true,
    cells: { created: 'Oct 15, 2026', activity: 'Oct 29, 2026 at 09:59' } },
  { id: 'b1', recordId: 'b1', label: 'Estimate at cutoff', stage: 'estimate-sent', archived: false, currentOwnerId: 'b', inactive: false,
    cells: { created: 'Oct 25, 2026', activity: 'Oct 29, 2026 at 10:00' } },
  { id: 'u1', recordId: 'u1', label: 'Inquiry needing reassignment', stage: 'new', archived: false, currentOwnerId: null, inactive: true,
    cells: { created: 'Oct 10, 2026', activity: 'Oct 28, 2026 at 10:00', owner: 'Unreliable former identity' } },
];
export const teamLeadsResult: TeamLeadsResult = {
  scope: { kind: 'workspace' }, snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All currently authorized open Leads and surviving current members.',
  inactivityCutoffLabel: 'Oct 29, 2026 at 10:00 / database timezone semantics',
  counts: { open: 4, inactive: 2, unassigned: 1 },
  // Deliberately unsorted: the canonical UI sorts alphabetically, not by count.
  owners: [
    { id: 'member:b', label: 'Blair', count: 1, inactive: 0, stages: { new: 0, contacted: 0, 'estimate-sent': 1 },
      evidenceId: 'owner:b', inactiveEvidenceId: 'inactive:b', stageEvidenceIds: { new: 'b:new', contacted: 'b:contacted', 'estimate-sent': 'b:estimate-sent' } },
    { id: 'unassigned', label: 'Unreliable former identity', count: 1, inactive: 1, stages: { new: 1, contacted: 0, 'estimate-sent': 0 },
      evidenceId: 'owner:unassigned', inactiveEvidenceId: 'inactive:unassigned', stageEvidenceIds: { new: 'unassigned:new' } },
    { id: 'member:a', label: 'Alex', count: 2, inactive: 1, stages: { new: 1, contacted: 1, 'estimate-sent': 0 },
      evidenceId: 'owner:a', inactiveEvidenceId: 'inactive:a', stageEvidenceIds: { new: 'a:new', contacted: 'a:contacted', 'estimate-sent': 'a:estimate-sent' } },
  ],
  evidenceIds: { open: 'open', inactive: 'inactive', unassigned: 'unassigned' },
  selected: { kind: 'queue', queue: 'open' }, rows: teamLeadRows, page: 1, pageSize: 25,
};
export const myLeadsResult: TeamLeadsResult = {
  ...teamLeadsResult, scope: { kind: 'assigned', currentMemberId: 'a' },
  scopeLabel: 'My currently authorized assigned Leads only. No workspace residual totals.',
  owners: teamLeadsResult.owners.filter(owner => owner.id === 'member:a'),
  counts: { open: 2, inactive: 1, unassigned: 0 }, rows: teamLeadRows.filter(row => row.currentOwnerId === 'a'),
};
