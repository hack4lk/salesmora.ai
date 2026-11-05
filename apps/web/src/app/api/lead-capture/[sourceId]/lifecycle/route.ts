import { captureDeliveryAuthority } from '../../../../../server/lead-capture/delivery';
import { changeCaptureLifecycle } from '@salesmora/data';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export async function POST(request: Request, context: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await context.params;
  return captureRequest(request, (identity, input) => changeCaptureLifecycle(database(), identity, enabledPermissions, input, captureDeliveryAuthority()), true, sourceId);
}
