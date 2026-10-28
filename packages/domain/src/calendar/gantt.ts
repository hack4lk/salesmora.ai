import type { AuthorizationContext } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '../authorization/authorize';

const ganttRoles = ['owner', 'admin'] as const;
const ganttReads = ['calendar.read', 'jobs.read', 'workorders.read'] as const;

/**
 * The Gantt overview is an owner/admin planning view. It also needs workspace-wide
 * read scope for the calendar, jobs and work orders, so narrowing any of those
 * grants in the workspace policy hides the view instead of showing partial data.
 */
export function canViewGantt(context: AuthorizationContext) {
  if (!ganttRoles.some(role => role === context.membership.role)) return false;
  return ganttReads.every(permission => {
    const scope = resolveAuthorizedCollectionScope(context, permission);
    return scope.allowed && scope.scope === 'workspace';
  });
}
