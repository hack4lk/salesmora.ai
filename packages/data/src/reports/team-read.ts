import type { Knex } from 'knex';
import { teamReportQuerySchema, teamReportReadResultSchema,
  type AuthorizationContext, type TeamReportQuery, type TeamReportReadResult } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { readTeamLeadsReportInTransaction } from './team-leads';
import { readTeamJobsReportInTransaction } from './team-jobs';
import { resolveTeamReportExportScopes } from './team-export-access';

function teamAuthority(context: AuthorizationContext): TeamReportReadResult['authority'] {
  const reports = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (!reports.allowed || reports.resourceKind !== 'report') throw new AuthorizationAccessError();
  const scope = (assigned: boolean): TeamReportReadResult['report']['scope'] =>
    assigned ? { kind: 'assigned', currentMemberId: context.userId } : { kind: 'workspace' };
  return {
    leads: reports.sourceScopes?.lead ? scope(reports.sourceScopes.lead === 'assigned') : null,
    jobs: reports.sourceScopes?.job ? scope(reports.sourceScopes.job === 'assigned') : null,
  };
}
export async function readTeamReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: TeamReportQuery,
): Promise<TeamReportReadResult> {
  const query = teamReportQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const authority = teamAuthority(context), scope = query.view === 'team-leads' ? authority.leads : authority.jobs;
  if (!scope) throw new AuthorizationAccessError();
  const report = query.view === 'team-leads' ? await readTeamLeadsReportInTransaction(trx, context, query)
    : await readTeamJobsReportInTransaction(trx, context, query);
  // Native groups retain the full authorized roster, including zero-workload members.
  const options = report.view === 'team-leads'
    ? report.owners.filter(owner => owner.id !== 'unassigned')
      .map(owner => ({ value: owner.id.slice('member:'.length), label: owner.label }))
    : report.members.map(member => ({ value: member.id, label: member.label }));
  return teamReportReadResultSchema.parse({ workspaceId: context.workspaceId, viewerId: context.userId,
    policyRevision: context.policy.revision, authority, exportScopes: resolveTeamReportExportScopes(context), query, report, options });
}
export async function initialTeamReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<TeamReportReadResult> {
  const authority = teamAuthority(context);
  if (!authority.leads && !authority.jobs) throw new AuthorizationAccessError();
  return readTeamReportWithAuthorityInTransaction(trx, context, authority.leads
    ? { workspaceId: context.workspaceId, view: 'team-leads', selected: { kind: 'queue', queue: 'open' },
      filters: { members: [] }, page: 1, pageSize: 25 }
    : { workspaceId: context.workspaceId, view: 'team-jobs', selected: { kind: 'queue', queue: 'active' },
      filters: { members: [] }, page: 1, pageSize: 25 });
}
