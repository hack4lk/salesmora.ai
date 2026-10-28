import 'server-only';
import { authorize, canViewGantt, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { loadWorkspaceAuthorization, withWorkspaceAuthorization } from '@salesmora/data';
import { permissionCatalog, type AuthorizationContext, type PermissionDefinition, type PermissionId } from '@salesmora/contracts';
import { database } from '../workspaces/store';
import { configuredEstimateSharingAvailable } from '../estimates/sharing-availability';
// Server-owned implemented surface. Future modules stay disabled even if saved templates grant them.
export const enabledPermissions: readonly PermissionId[] = ['calendar.read', 'materials.read', 'materials.propose', 'materials.manage', 'workorders.read', 'workorders.view_prices', 'workorders.view_costs', 'workorders.create', 'workorders.update', 'workorders.schedule.update', 'workorders.issue', 'workorders.progress', 'workorders.complete', 'workorders.reopen', 'workorders.cancel', 'workorders.archive', 'workorders.delete', 'workorders.export', 'jobs.read', 'jobs.create', 'jobs.update', 'jobs.assign', 'jobs.status.update', 'jobs.progress.create', 'jobs.complete', 'jobs.cancel', 'jobs.reopen', 'jobs.schedule.update', 'customers.read', 'customers.related.read', 'customers.create', 'customers.update', 'customers.archive', 'customers.delete', 'customers.export', 'workspace.delete', 'home.access', 'assistant.use', 'leads.read', 'leads.update', 'leads.stage.update', 'leads.archive', 'leads.delete', 'leads.export', 'leads.create', 'leads.assign', 'estimates.read', 'estimates.create', 'estimates.update', 'estimates.delete', 'estimates.void', 'estimates.decide', 'estimates.archive', 'estimates.export', ...(configuredEstimateSharingAvailable() ? ['estimates.send'] as const : []), 'team.invite', 'permissions.read', 'permissions.manage', 'settings.business.read', 'settings.business.update', ...(process.env.BILLING_SANDBOX_ENABLED === 'true' ? ['billing.read', 'billing.manage'] as const : [])];
export function workspaceAuthorization(userId: string, workspaceId: string) {
  return loadWorkspaceAuthorization(database(), { userId, workspaceId }, enabledPermissions);
}
export function authorizedWorkspace<T>(userId: string, workspaceId: string, write: boolean,
  use: Parameters<typeof withWorkspaceAuthorization<T>>[4]) {
  return withWorkspaceAuthorization(database(), { userId, workspaceId }, enabledPermissions, write, use);
}
export function workspaceCapabilities(context: AuthorizationContext) {
  return {
    jobNotifications: ['owner', 'admin'].includes(context.membership.role) && authorize(context, { permission: 'settings.business.read' }).allowed,
    billing: authorize(context, {permission:'billing.read'}).allowed || authorize(context, {permission:'billing.manage'}).allowed,
    home: authorize(context, { permission: 'home.access' }).allowed,
    assistant: authorize(context, { permission: 'assistant.use' }).allowed,
    readCalendar: resolveAuthorizedCollectionScope(context, 'calendar.read').allowed,
    readGantt: canViewGantt(context),
    readJobs: resolveAuthorizedCollectionScope(context, 'jobs.read').allowed,
    readCustomers: resolveAuthorizedCollectionScope(context, 'customers.read').allowed,
    readLeads: resolveAuthorizedCollectionScope(context, 'leads.read').allowed,
    readEstimates: resolveAuthorizedCollectionScope(context, 'estimates.read').allowed,
    readWorkOrders: resolveAuthorizedCollectionScope(context, 'workorders.read').allowed,
    // The catalog page is for people who manage it or propose items; everyone else reaches it through the work-order picker.
    materials: authorize(context, { permission: 'materials.manage' }).allowed || authorize(context, { permission: 'materials.propose' }).allowed,
    createLead: authorize(context, { permission: 'leads.create' }).allowed,
    inviteField: authorize(context, { permission: 'team.invite', targetRole: 'field' }).allowed,
    permissions: authorize(context, { permission: 'permissions.read' }).allowed,
    settings: authorize(context, { permission: 'settings.business.read' }).allowed || authorize(context, { permission: 'permissions.read' }).allowed,
    estimateBusinessSettings: authorize(context, { permission: 'settings.business.read' }).allowed,
  };
}
const upcomingNavigation = [
  { page: 'intake', permissions: ['intake.read'] },
  { page: 'reports', permissions: ['reports.read'] },
  { page: 'campaigns', permissions: ['campaigns.read'] },
] as const;

/** Navigation presentation only, using the current validated repository context.
 * Upcoming entries reflect saved grants but remain disabled by WorkspaceShell.availablePages.
 * Never use this projection to authorize routes, data, actions, or assistant tools.
 */
export function workspaceNavigationPages(context: AuthorizationContext) {
  const capabilities = workspaceCapabilities(context);
  const upcoming = upcomingNavigation.filter(item => item.permissions.some(permission => {
    const definition: PermissionDefinition = permissionCatalog[permission];
    return definition.reviewed && definition.eligibleRoles.includes(context.membership.role) &&
      context.policy.grants.some(grant => grant.role === context.membership.role && grant.permission === permission);
  })).map(item => item.page);
  return [...(capabilities.home ? ['home' as const] : []), ...(capabilities.readLeads ? ['leads' as const] : []), ...(capabilities.readCalendar ? ['calendar' as const] : []), ...(capabilities.readJobs ? ['jobs' as const] : []), ...(capabilities.readWorkOrders ? ['work-orders' as const] : []), ...(capabilities.materials ? ['materials' as const] : []), ...(capabilities.readCustomers ? ['customers' as const] : []), ...(capabilities.readEstimates ? ['estimates' as const] : []), ...(capabilities.estimateBusinessSettings ? ['estimate-settings' as const] : []), ...upcoming, ...((capabilities.settings || capabilities.billing) ? ['settings' as const] : [])];
}
