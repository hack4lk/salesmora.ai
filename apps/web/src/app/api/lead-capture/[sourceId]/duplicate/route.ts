import { duplicateCaptureSource } from '@salesmora/data';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export async function POST(request: Request, context: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await context.params;
  return captureRequest(request, (identity, input) => duplicateCaptureSource(database(), identity, enabledPermissions, input), true, sourceId);
}
