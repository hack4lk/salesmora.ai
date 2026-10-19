import { createHash } from 'node:crypto';
import type { AuthorizationContext } from '@salesmora/contracts';
export function chatAccessHash(context: AuthorizationContext) {
  return createHash('sha256').update(JSON.stringify({ role: context.membership.role, owner: context.ownerUserId,
    revision: context.policy.revision, grants: [...context.policy.grants].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    enabled: [...context.enabledPermissions].sort() })).digest('hex');
}
