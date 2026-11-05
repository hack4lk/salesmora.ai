import 'server-only';
import { createHash } from 'node:crypto';
import { captureWebsiteDeliveryPolicy, captureInstallationOrigin } from '../lead-capture/submission-policy';
/** Configuration effects only: no provider, readiness or ingress credentials enter history. */
export function captureChatDeliveryStamp(workspaceId: string) {
  const policy = captureWebsiteDeliveryPolicy();
  return createHash('sha256').update(JSON.stringify({ ready: !!policy?.workspaces.includes(workspaceId), origin: captureInstallationOrigin(process.env, workspaceId) ?? null })).digest('hex');
}
