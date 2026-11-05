import type { Knex } from 'knex';
import { captureGmailAccountListQuerySchema, captureGmailAccountListSchema, type AuthorizationContext, type CaptureGmailCapabilities, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { workspaceEntitlements } from '../billing/entitlements';
import { CaptureDraftValidationError } from './store';

/** Workspace-scoped grants; no role-name shortcuts. Source mutations also check their real resource. */
export function captureGmailCapabilities(context: AuthorizationContext, eligible: boolean): CaptureGmailCapabilities {
  const resource = { kind: 'capture_source' as const, workspaceId: context.workspaceId, id: context.workspaceId };
  const canRead = resolveAuthorizedCollectionScope(context, 'leadCapture.read').allowed;
  const edit = canRead && authorize(context, { permission: 'leadCapture.update', resource }).allowed;
  return {
    canRead, canConnect: edit && eligible, canReconnect: edit && eligible, canSelect: edit && eligible,
    canDisconnect: edit && authorize(context, { permission: 'leadCapture.pause', resource }).allowed,
  };
}

/** Intentionally selects four public columns, never a credential join or SELECT *. */
export async function listCaptureGmailAccounts(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = captureGmailAccountListQuerySchema.safeParse(raw);
  if (!input.success) throw new CaptureDraftValidationError();
  if (input.data.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const capabilities = captureGmailCapabilities(context, (await workspaceEntitlements(trx, identity.workspaceId)).plan.id !== 'free');
    if (!capabilities.canRead) throw new AuthorizationAccessError();
    const accounts = await trx('captureGmailAccounts').where({ workspaceId: identity.workspaceId })
      .select('id', 'email', 'status', 'version').orderBy('email').orderBy('id').limit(100);
    return captureGmailAccountListSchema.parse({ accounts, capabilities });
  });
}
