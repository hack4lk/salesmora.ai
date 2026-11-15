import { createHash } from 'node:crypto';
import type { AuthorizationContext } from '@salesmora/contracts';

/** An authorization binding, not a record-version or mutation-precondition token. */
export function assistantAuthorityStamp(context: AuthorizationContext, area: string, algorithm: 'md5' | 'sha256' = 'sha256') {
  return createHash(algorithm).update(JSON.stringify([
    'historical-evidence-v1', area, context.workspaceId, context.userId, context.ownerUserId,
    context.membership.role, context.policy.revision,
    [...context.policy.grants].map(grant => JSON.stringify([grant.role, grant.permission, grant.scope])).sort(),
    [...context.enabledPermissions].sort(),
  ])).digest('hex');
}
