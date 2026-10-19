import { isLeadOperation, leadCapabilities, type AuthorizationContext, type LeadOperationId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope, type AuthorizationDecision } from '@salesmora/domain';
const denied = (): AuthorizationDecision => ({ allowed: false, reason: 'chat-access-denied' });
/** Capability availability only. Each handler rechecks its actual record and field permissions. */
export function authorizeLeadOperation(context: AuthorizationContext, surface: unknown, operation: unknown): AuthorizationDecision {
  if (!isLeadOperation(operation) || !leadCapabilities[operation].surfaces.some(value => value === surface) || !authorize(context, { permission: 'assistant.use' }).allowed) return denied();
  let result: AuthorizationDecision = denied();
  for (const requirement of leadCapabilities[operation].requirements) {
    if (requirement.mode === 'collection') result = resolveAuthorizedCollectionScope(context, requirement.permission);
    else if (requirement.mode === 'workspace') result = authorize(context, { permission: requirement.permission });
    else result = authorize(context, { permission: requirement.permission, ...('fields' in requirement ? { fields: [...requirement.fields] } : {}), resource: { kind: 'lead', id: 'capability', workspaceId: context.workspaceId, ownerId: requirement.mode === 'own-record' ? context.userId : null } });
    if (!result.allowed || ('scopes' in requirement && (!('scope' in result) || !(requirement.scopes as readonly string[]).includes(String(result.scope))))) return denied();
  }
  return result;
}
export function availableLeadOperations(context: AuthorizationContext, surface: unknown): LeadOperationId[] {
  return (Object.keys(leadCapabilities) as LeadOperationId[]).filter(id => authorizeLeadOperation(context, surface, id).allowed);
}
