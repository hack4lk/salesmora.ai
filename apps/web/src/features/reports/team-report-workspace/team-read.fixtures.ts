import { teamReportQuerySchema, teamReportReadResultSchema, teamLeadsResultSchema, teamJobsResultSchema,
  type TeamReportQuery, type TeamReportReadResult } from '@salesmora/contracts';
import { teamJobRows } from '../team-jobs-report/team-jobs-report.fixtures';
import { teamLeadSelectionTotal } from '../team-leads-report/team-leads-report.validation';
import { teamJobSelectionTotal } from '../team-jobs-report/team-jobs-report.validation';
import { teamMemberOptions, teamWorkspaceLeadRows, teamWorkspaceResponse } from './team-report-workspace.fixtures';

export const teamReadWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const initialTeamQuery = teamReportQuerySchema.parse({ workspaceId: teamReadWorkspaceId, view: 'team-leads',
  selected: { kind: 'queue', queue: 'open' } });
export const teamWorkspaceAuthority: TeamReportReadResult['authority'] = { leads: { kind: 'workspace' }, jobs: { kind: 'workspace' } };
export const teamAssignedAuthority: TeamReportReadResult['authority'] = {
  leads: { kind: 'assigned', currentMemberId: 'member-c' }, jobs: { kind: 'assigned', currentMemberId: 'member-c' },
};
const leadDates: Record<string, { created: string; activity: string }> = {
  a1: { created: '2026-10-20T08:00:00.000000Z', activity: '2026-11-05T09:00:00.000000Z' },
  a2: { created: '2026-10-15T08:00:00.000000Z', activity: '2026-10-29T08:59:59.999999Z' },
  b1: { created: '2026-10-25T09:00:00.000000Z', activity: '2026-10-29T09:00:00.000000Z' },
  u1: { created: '2026-10-10T08:00:00.000000Z', activity: '2026-10-28T09:00:00.000000Z' },
};
function identity(id: string, view: 'leads' | 'jobs', population: typeof teamWorkspaceLeadRows | typeof teamJobRows): string {
  const index = population.findIndex(row => row.id === id);
  if (index < 0) throw new Error('Unknown fictional Team record identity.');
  return `00000000-0000-4000-8000-${String(index + (view === 'leads' ? 201 : 101)).padStart(12, '0')}`;
}
/** Native envelope over the established fictional Team population, never a live authorization engine. */
export function teamReadResponse(rawQuery: TeamReportQuery, authority = teamWorkspaceAuthority, large = false): TeamReportReadResult {
  const query = teamReportQuerySchema.parse(rawQuery), view = query.view === 'team-leads' ? 'leads' : 'jobs';
  const scope = authority[view];
  if (scope === null) throw new Error('The fictional Team domain is unavailable.');
  const options = teamMemberOptions.filter(member => scope.kind === 'workspace' || member.value === scope.currentMemberId);
  if (query.filters.members.some(id => !options.some(option => option.value === id))) {
    throw new Error('The selected member is unavailable under current Team access.');
  }
  const population = large ? {
    leads: teamWorkspaceLeadRows.flatMap(row => Array.from({ length: 26 }, (_, copy) => ({ ...row, id: `${row.id}-${copy}`, recordId: `${row.id}-${copy}` }))),
    jobs: teamJobRows.flatMap(row => Array.from({ length: 26 }, (_, copy) => ({ ...row, id: `${row.id}-${copy}`, recordId: `${row.id}-${copy}` }))),
  } : { leads: teamWorkspaceLeadRows, jobs: teamJobRows };
  const selected = query.selected;
  const evidence = selected.kind === 'queue' ? selected.queue
    : selected.kind === 'owner' ? selected.stage !== undefined ? `stage:${selected.id}:${selected.stage}`
      : selected.inactiveOnly ? `inactive:${selected.id}` : `owner:${selected.id}`
      : `${selected.kind === 'unassigned' ? 'unassigned' : `${selected.id}:${selected.responsibility}`}:${selected.filter}`;
  const projection = teamWorkspaceResponse(view, query.filters, scope, evidence, query.page, query.pageSize, population);
  const common = { asOf: '2026-11-05T09:00:00.000Z', timezone: 'Europe/Warsaw', today: '2026-11-05',
    scope, scopeLabel: 'Current authorized fictional Team workload.', filters: query.filters, selected: query.selected,
    pageSize: query.pageSize };
  let report;
  if (projection.view === 'leads' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    report = teamLeadsResultSchema.parse({ ...common, view: 'team-leads', inactivityCutoff: '2026-10-29T09:00:00.000000Z',
      counts: result.counts, owners: result.owners.map(({ id, label, count, inactive, stages }) => ({ id, label, count, inactive, stages })),
      page: result.page, evidenceTotal: teamLeadSelectionTotal(result),
      rows: result.rows.map(row => {
        const dates = leadDates[large ? row.id.slice(0, row.id.lastIndexOf('-')) : row.id];
        if (!dates) throw new Error('Unknown fictional Team Lead timestamps.');
        return { id: identity(row.id, view, population.leads), recordId: identity(row.id, view, population.leads),
          label: row.label, stage: row.stage, archived: row.archived, currentOwnerId: row.currentOwnerId, inactive: row.inactive,
          ownerState: row.currentOwnerId === null ? 'former' : 'member',
          cells: { ...dates, owner: row.currentOwnerId === null ? 'No current owner / reassignment needed'
            : options.find(option => option.value === row.currentOwnerId)?.label } };
      }) });
  } else if (projection.view === 'jobs' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    const workload = ({ count, overdue, waiting, statuses }: NonNullable<typeof result.unassigned>) => ({ count, overdue, waiting, statuses });
    report = teamJobsResultSchema.parse({ ...common, view: 'team-jobs', counts: result.counts,
      members: result.members.map(member => ({ id: member.id, label: member.label,
        primary: workload(member.primary), supporting: workload(member.supporting) })),
      unassigned: result.unassigned === null ? null : workload(result.unassigned), page: result.page,
      evidenceTotal: teamJobSelectionTotal(result), rows: result.rows.map(row => ({
        id: identity(row.id, view, population.jobs), recordId: identity(row.id, view, population.jobs), label: row.label,
        status: row.status, completionDeadline: row.completionDeadline, scheduledDate: row.scheduledDate,
        waitingReason: row.waitingReason, primary: row.primary, supportingMemberIds: row.supportingMemberIds, cells: { service: row.cells.service },
      })) });
  } else throw new Error('Expected a ready fictional Team projection.');
  return teamReportReadResultSchema.parse({ workspaceId: query.workspaceId, viewerId: 'member-c', policyRevision: 1,
    authority, exportScopes: { leads: null, jobs: null }, query, report, options });
}
