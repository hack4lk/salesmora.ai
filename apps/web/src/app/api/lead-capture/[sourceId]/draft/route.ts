import { beginCaptureRevision, saveCaptureDraft } from '@salesmora/data';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export async function PUT(request: Request, context: { params: Promise<{ sourceId: string }> }) { const { sourceId } = await context.params; return captureRequest(request, (identity, input) => saveCaptureDraft(database(), identity, enabledPermissions, input), true, sourceId); }
export async function POST(request: Request, context: { params: Promise<{ sourceId: string }> }) { const { sourceId } = await context.params; return captureRequest(request, (identity, input) => beginCaptureRevision(database(), identity, enabledPermissions, input), true, sourceId); }
