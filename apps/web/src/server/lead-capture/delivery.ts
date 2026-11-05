import { gmailDeliveryAuthority } from '@salesmora/data/lead-capture/gmail-delivery';
import type { CaptureDeliveryAuthority } from '@salesmora/data';
import { captureWebsiteSchemaReady } from '@salesmora/data/lead-capture/delivery-policy';
import { captureWebsiteDeliveryPolicy } from './submission-policy';
export { captureWebsiteDeliveryPolicy } from './submission-policy';

export function captureWebsiteReady(workspaceId: string, env: Record<string, string | undefined> = process.env) {
  const policy = captureWebsiteDeliveryPolicy(env);
  return !!policy?.workspaces.includes(workspaceId);
}

/** Re-evaluated per operation, with schema prerequisites checked in the caller's transaction. */
export function captureDeliveryAuthority(env: Record<string, string | undefined> = process.env): CaptureDeliveryAuthority {
  return {
    websiteReady: async (trx, workspaceId) => captureWebsiteReady(workspaceId, env) && await captureWebsiteSchemaReady(trx),
    ...gmailDeliveryAuthority(env),
  };
}
