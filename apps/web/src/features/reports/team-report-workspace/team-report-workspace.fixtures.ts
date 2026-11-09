import { teamLeadRows, teamLeadsResult } from '../team-leads-report/team-leads-report.fixtures';
import { teamOpenLeadStages, teamLeadOwnerKey, type TeamLeadSelection, type TeamLeadRow } from '../team-leads-report/team-leads-report.validation';
import { teamJobRows, teamJobsResult, teamJobWorkload } from '../team-jobs-report/team-jobs-report.fixtures';
import { teamJobMatchesSelection, type TeamJobSelection, type TeamJobRow } from '../team-jobs-report/team-jobs-report.validation';
import type { TeamReportFiltersValue, TeamReportFilterScope } from '../team-report-filters/team-report-filters';
import type { TeamReportProjection, TeamReportView } from './team-report-workspace';
import { teamJobMatchesMembers, teamLeadMatchesMembers } from './team-report-workspace.validation';

export const teamMemberOptions = [
  { value: 'member-a', label: 'Alex' }, { value: 'member-b', label: 'Blair' }, { value: 'member-c', label: 'Casey' },
];
export const teamWorkspaceLeadRows = teamLeadRows.map(row => ({ ...row, currentOwnerId: row.currentOwnerId === null ? null : `member-${row.currentOwnerId}` }));

/** Fictional host responses; authorization, distinct matching and aggregation precede evidence pagination. */
export function teamWorkspaceResponse(view: TeamReportView, filters: TeamReportFiltersValue, scope: TeamReportFilterScope = { kind: 'workspace' },
  evidence?: string, page = 1, pageSize = 25,
  population: { leads: readonly TeamLeadRow[]; jobs: readonly TeamJobRow[] } = { leads: teamWorkspaceLeadRows, jobs: teamJobRows }): TeamReportProjection {
  const members = teamMemberOptions.filter(member => scope.kind === 'workspace' || member.value === scope.currentMemberId);
  const scopeLabel = `${scope.kind === 'assigned' ? 'My authorized workload only' : 'Authorized Team workload'} / ${
    filters.members.length ? `Records matching ${members.filter(member => filters.members.includes(member.value)).map(member => scope.kind === 'assigned' ? 'Me' : member.label).join(' or ')}`
      : 'All authorized records'}. Current membership; mock same-snapshot results.`;
  if (view === 'leads') {
    const matched = population.leads.filter(row => (scope.kind === 'workspace' || row.currentOwnerId === scope.currentMemberId) &&
      teamLeadMatchesMembers(row.currentOwnerId, filters));
    const owners = [...members.map(member => ({ id: `member:${member.value}`, label: member.label })),
      ...(scope.kind === 'workspace' ? [{ id: 'unassigned', label: 'No current primary owner' }] : [])].map(owner => {
      const rows = matched.filter(row => teamLeadOwnerKey(row) === owner.id);
      return { ...owner, count: rows.length, inactive: rows.filter(row => row.inactive).length,
        stages: { new: rows.filter(row => row.stage === 'new').length, contacted: rows.filter(row => row.stage === 'contacted').length,
          'estimate-sent': rows.filter(row => row.stage === 'estimate-sent').length },
        evidenceId: `owner:${owner.id}`, inactiveEvidenceId: `inactive:${owner.id}`,
        stageEvidenceIds: Object.fromEntries(teamOpenLeadStages.map(stage => [stage, `stage:${owner.id}:${stage}`])),
      };
    });
    let selected: TeamLeadSelection = { kind: 'queue', queue: 'open' };
    if (evidence !== undefined) {
      const selections: { evidenceId: string; selected: TeamLeadSelection }[] = [
        ...(['open', 'inactive', ...(scope.kind === 'workspace' ? ['unassigned'] as const : [])] as const).map(queue => ({ evidenceId: queue, selected: { kind: 'queue' as const, queue } })),
        ...owners.flatMap(owner => [
          { evidenceId: owner.evidenceId, selected: { kind: 'owner' as const, id: owner.id } },
          { evidenceId: owner.inactiveEvidenceId, selected: { kind: 'owner' as const, id: owner.id, inactiveOnly: true } },
          ...teamOpenLeadStages.map(stage => ({ evidenceId: owner.stageEvidenceIds[stage], selected: { kind: 'owner' as const, id: owner.id, stage } })),
        ]),
      ];
      const match = selections.find(selection => selection.evidenceId === evidence);
      if (!match) throw new Error(`Unknown mock Team Leads evidence: ${evidence}`);
      selected = match.selected;
    }
    const selection = selected;
    const rows = matched.filter(row => selection.kind === 'queue' ? selection.queue === 'open' ||
      (selection.queue === 'inactive' ? row.inactive : row.currentOwnerId === null)
      : teamLeadOwnerKey(row) === selection.id && (selection.stage === undefined || row.stage === selection.stage) && (!selection.inactiveOnly || row.inactive));
    const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
    return { view, filters, state: { kind: 'ready', result: { ...teamLeadsResult, scope, scopeLabel, owners,
      counts: { open: matched.length, inactive: matched.filter(row => row.inactive).length, unassigned: matched.filter(row => row.currentOwnerId === null).length },
      evidenceIds: scope.kind === 'assigned' ? { open: 'open', inactive: 'inactive' } : teamLeadsResult.evidenceIds,
      selected, rows: rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), page: currentPage, pageSize,
    } } };
  }
  const authorized: readonly TeamJobRow[] = scope.kind === 'workspace' ? population.jobs : population.jobs
    .filter(row => row.primary.kind === 'member' && row.primary.id === scope.currentMemberId || row.supportingMemberIds.includes(scope.currentMemberId))
    .map(row => ({ ...row, primary: row.primary.kind === 'member' && row.primary.id === scope.currentMemberId
      ? row.primary : { kind: 'withheld' }, supportingMemberIds: row.supportingMemberIds.filter(id => id === scope.currentMemberId) }));
  const matched = authorized.filter(row => teamJobMatchesMembers(row.primary, row.supportingMemberIds, filters));
  const workloads = members.map(member => ({
    id: member.value, label: member.label,
    primary: teamJobWorkload(matched.filter(row => row.primary.kind === 'member' && row.primary.id === member.value), `${member.value}:primary`),
    supporting: teamJobWorkload(matched.filter(row => row.supportingMemberIds.includes(member.value)), `${member.value}:supporting`),
  }));
  const unassigned = scope.kind === 'assigned' ? null : teamJobWorkload(matched.filter(row => row.primary.kind === 'unassigned'), 'unassigned');
  let selected: TeamJobSelection = { kind: 'queue', queue: 'active' };
  if (evidence !== undefined) {
    const selections: { evidenceId: string | undefined; selected: TeamJobSelection }[] =
      (['active', 'overdue', 'waiting', ...(scope.kind === 'workspace' ? ['unassigned'] as const : [])] as const)
        .map(queue => ({ evidenceId: queue, selected: { kind: 'queue', queue } }));
    for (const member of workloads) for (const responsibility of ['primary', 'supporting'] as const) {
      const workload = member[responsibility];
      for (const filter of ['all', 'overdue', 'needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const) {
        selections.push({ evidenceId: filter === 'all' ? workload.evidenceId : filter === 'overdue' ? workload.overdueEvidenceId : workload.statusEvidenceIds?.[filter],
          selected: { kind: 'member', id: member.id, responsibility, filter } });
      }
    }
    if (unassigned) for (const filter of ['all', 'overdue', 'needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const) {
      selections.push({ evidenceId: filter === 'all' ? unassigned.evidenceId : filter === 'overdue' ? unassigned.overdueEvidenceId : unassigned.statusEvidenceIds?.[filter],
        selected: { kind: 'unassigned', filter } });
    }
    const match = selections.find(selection => selection.evidenceId === evidence);
    if (!match) throw new Error(`Unknown mock Team Jobs evidence: ${evidence}`);
    selected = match.selected;
  }
  const rows = matched.filter(row => teamJobMatchesSelection(row, selected, teamJobsResult.today));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const total = teamJobWorkload(matched, 'total');
  return { view, filters, state: { kind: 'ready', result: { ...teamJobsResult, scope, scopeLabel, members: workloads, unassigned,
    counts: { active: total.count, overdue: total.overdue, waiting: total.waiting },
    evidenceIds: scope.kind === 'assigned' ? { active: 'active', overdue: 'overdue', waiting: 'waiting' } : teamJobsResult.evidenceIds,
    selected, rows: rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), page: currentPage, pageSize,
  } } };
}
