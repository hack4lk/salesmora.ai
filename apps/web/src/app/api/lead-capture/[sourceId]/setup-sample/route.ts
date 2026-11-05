import { readCaptureSetupSample } from '@salesmora/data';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export async function GET(request: Request, context: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await context.params;
  return captureRequest(request, (identity, input) => readCaptureSetupSample(database(), identity, enabledPermissions, input), false, sourceId);
}
