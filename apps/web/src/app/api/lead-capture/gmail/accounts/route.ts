import { AuthorizationAccessError, CaptureDraftValidationError, withWorkspaceAuthorization } from '@salesmora/data';
import { captureGmailAccountListQuerySchema, captureGmailAccountListSchema } from '@salesmora/contracts';
import { captureGmailCapabilities, listCaptureGmailAccounts } from '@salesmora/data/lead-capture/gmail-accounts';
import { captureGmailConfiguration } from '@salesmora/data/lead-capture/gmail-provider';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export function GET(request: Request) {
  return captureRequest(request, async (identity, raw) => {
    const parsed = captureGmailAccountListQuerySchema.safeParse(raw); if (!parsed.success) throw new CaptureDraftValidationError();
    const input = parsed.data, config = captureGmailConfiguration(process.env);
    if (!config || !config.workspaces.includes(identity.workspaceId)) return withWorkspaceAuthorization(database(), identity, enabledPermissions, false, async (_trx, context) => {
      if (!captureGmailCapabilities(context, false).canRead || input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
      return captureGmailAccountListSchema.parse({ available: false, accounts: [], capabilities: { canRead: true, canConnect: false, canReconnect: false, canSelect: false, canDisconnect: false } });
    });
    return captureGmailAccountListSchema.parse({ ...await listCaptureGmailAccounts(database(), identity, enabledPermissions, input), available: true });
  });
}
