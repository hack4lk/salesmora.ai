import { validTeamReportFilters, type TeamReportFiltersValue, type TeamReportFilterScope } from '../team-report-filters/team-report-filters';
import type { ReportScopeOption } from '../report-scope-controls/report-scope-controls';
import { validTeamLeadsResult } from '../team-leads-report/team-leads-report.validation';
import { validTeamJobsResult } from '../team-jobs-report/team-jobs-report.validation';
import type { TeamReportProjection } from './team-report-workspace';

export function teamLeadMatchesMembers(ownerId: string | null, filters: TeamReportFiltersValue): boolean {
  return filters.members.length === 0 || ownerId !== null && filters.members.includes(ownerId);
}

export function teamJobMatchesMembers(primary: { kind: 'member'; id: string } | { kind: 'unassigned' } | { kind: 'withheld' },
  supportingMemberIds: readonly string[], filters: TeamReportFiltersValue): boolean {
  return filters.members.length === 0 || primary.kind === 'member' && filters.members.includes(primary.id) ||
    supportingMemberIds.some(id => filters.members.includes(id));
}

/** Check the declared filter snapshot plus every observable scope/roster/record invariant; hosts prove unseen aggregate membership. */
export function validTeamReportProjection(projection: TeamReportProjection, filters: TeamReportFiltersValue,
  options: readonly ReportScopeOption[], scope: TeamReportFilterScope): boolean {
  if (!validTeamReportFilters(filters, options, scope) || !validTeamReportFilters(projection.filters, options, scope) ||
    projection.filters.members.length !== filters.members.length ||
    !projection.filters.members.every(member => filters.members.includes(member))) return false;
  if (projection.state.kind !== 'ready') return true;
  const result = projection.state.result;
  if (result.scope.kind !== scope.kind || (scope.kind === 'assigned' &&
    (result.scope.kind !== 'assigned' || result.scope.currentMemberId !== scope.currentMemberId))) return false;
  if (projection.view === 'leads' && projection.state.kind === 'ready') {
    const leads = projection.state.result;
    return validTeamLeadsResult(leads) &&
      leads.owners.every(owner => owner.id === 'unassigned'
        ? filters.members.length === 0 || owner.count === 0
        : options.some(option => owner.id === `member:${option.value}`) &&
          (filters.members.length === 0 || filters.members.some(member => owner.id === `member:${member}`) || owner.count === 0)) &&
      leads.rows.every(row => teamLeadMatchesMembers(row.currentOwnerId, filters));
  }
  if (projection.view === 'jobs' && projection.state.kind === 'ready') {
    const jobs = projection.state.result;
    return validTeamJobsResult(jobs) && jobs.members.every(member => options.some(option => option.value === member.id)) &&
      jobs.rows.every(row => teamJobMatchesMembers(row.primary, row.supportingMemberIds, filters)) &&
      (filters.members.length === 0 || jobs.members.filter(member => filters.members.includes(member.id))
        .reduce((sum, member) => sum + member.primary.count + member.supporting.count, 0) >= jobs.counts.active);
  }
  return false;
}
