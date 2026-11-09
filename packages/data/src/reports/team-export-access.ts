import type { AuthorizationContext, TeamReportExportInput, TeamReportExportScope } from '@salesmora/contracts';
import { teamReportExportSelectionAllowed } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { resolveLeadReportExportScope } from './lead-export-access';
import { resolveJobReportExportScope } from './job-export-access';

/** Domain scopes are independent; assigned Team output exposes only the current member. */
export function resolveTeamReportExportScopes(context: AuthorizationContext): {
  leads: TeamReportExportScope | null; jobs: TeamReportExportScope | null;
} {
  const convert = (scope: 'workspace' | 'assigned' | null): TeamReportExportScope | null =>
    scope === null ? null : scope === 'workspace' ? { kind: 'workspace' }
      : { kind: 'assigned', currentMemberId: context.userId };
  return { leads: convert(resolveLeadReportExportScope(context)), jobs: convert(resolveJobReportExportScope(context)) };
}
export function requireTeamReportExportScope(context: AuthorizationContext, input: TeamReportExportInput): TeamReportExportScope {
  const scopes = resolveTeamReportExportScopes(context);
  const scope = input.query.view === 'team-leads' ? scopes.leads : scopes.jobs;
  if (!scope || input.query.workspaceId !== context.workspaceId || !teamReportExportSelectionAllowed(input, scope)) {
    throw new AuthorizationAccessError();
  }
  return scope;
}
