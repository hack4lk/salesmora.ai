import { captureDeliveryAuthority } from '../../../../server/lead-capture/delivery';
import { captureInstallationOrigin } from '../../../../server/lead-capture/submission-policy';
import { readCaptureSource } from '@salesmora/data';
import { captureRequest } from '../../../../server/lead-capture/http';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: { params: Promise<{ sourceId: string }> }) { const { sourceId } = await context.params; return captureRequest(request, (identity, input) => readCaptureSource(database(), identity, enabledPermissions, input, captureInstallationOrigin(process.env, identity.workspaceId), captureDeliveryAuthority()), false, sourceId); }
