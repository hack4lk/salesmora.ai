import type { AuthorizationContext, CalendarExportInput, CalendarExportOutputScopes } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';

export type CalendarExportAccess = {
  scope: { kind: 'workspace' } | { kind: 'own'; viewerId: string };
  outputScopes: CalendarExportOutputScopes;
};

/** Intersects each parent domain independently; own Calendar scope is an additional restriction. */
export function resolveCalendarExportAccess(context: AuthorizationContext): CalendarExportAccess | null {
  if (!authorize(context, { permission: 'reports.export' }).allowed) return null;
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const calendar = resolveAuthorizedCollectionScope(context, 'calendar.read');
  if (!report.allowed || report.resourceKind !== 'report' || !calendar.allowed ||
    calendar.resourceKind !== 'calendar' || !['workspace', 'own_assigned'].includes(calendar.scope)) return null;
  const jobsRead = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const jobsExport = resolveAuthorizedCollectionScope(context, 'jobs.export');
  const ordersRead = resolveAuthorizedCollectionScope(context, 'workorders.read');
  const ordersExport = resolveAuthorizedCollectionScope(context, 'workorders.export');
  const jobsAllowed = jobsRead.allowed && jobsExport.allowed && jobsRead.resourceKind === 'job' &&
    jobsExport.resourceKind === 'job' && ['workspace', 'assigned'].includes(jobsRead.scope) &&
    ['workspace', 'assigned'].includes(jobsExport.scope);
  const ordersAllowed = ordersRead.allowed && ordersExport.allowed && ordersRead.resourceKind === 'work_order' &&
    ordersExport.resourceKind === 'work_order' && ['workspace', 'assigned_job'].includes(ordersRead.scope) &&
    ['workspace', 'assigned_job'].includes(ordersExport.scope);
  if (!jobsAllowed && !ordersAllowed) return null;
  return {
    scope: report.scope === 'assigned' || calendar.scope === 'own_assigned'
      ? { kind: 'own', viewerId: context.userId } : { kind: 'workspace' },
    outputScopes: {
      jobs: jobsAllowed ? { kind: 'available', scope: jobsRead.scope === 'assigned' || jobsExport.scope === 'assigned'
        ? 'assigned' : 'workspace' } : { kind: 'unavailable', reason: 'permissions' },
      workOrders: ordersAllowed ? { kind: 'available',
        scope: ordersRead.scope === 'assigned_job' || ordersExport.scope === 'assigned_job' ? 'assigned_job' : 'workspace' }
        : { kind: 'unavailable', reason: 'permissions' },
    },
  };
}
export function canExportCalendarDataset(access: CalendarExportAccess, input: CalendarExportInput): boolean {
  if (input.query.filters.recordTypes.some(type =>
    (type === 'job' ? access.outputScopes.jobs : access.outputScopes.workOrders).kind !== 'available')) return false;
  const scope = access.scope;
  if (scope.kind === 'own' &&
    input.query.filters.participants.some(id => id !== scope.viewerId)) return false;
  return (input.dataset !== 'jobs' || access.outputScopes.jobs.kind === 'available') &&
    (input.dataset !== 'workOrders' || access.outputScopes.workOrders.kind === 'available');
}

/** The native export query must apply these constraints in addition to its existing read constraints. */
export function requireCalendarExportAccess(context: AuthorizationContext, input: CalendarExportInput): CalendarExportAccess {
  const access = resolveCalendarExportAccess(context);
  if (input.query.workspaceId !== context.workspaceId || !access || !canExportCalendarDataset(access, input)) {
    throw new AuthorizationAccessError();
  }
  return access;
}
