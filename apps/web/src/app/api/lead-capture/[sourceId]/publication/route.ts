import { captureDeliveryAuthority } from '../../../../../server/lead-capture/delivery';
import { publishCaptureDraft, readCapturePublicationReview, cancelCapturePublication, changeCapturePublication } from '@salesmora/data';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: { params: Promise<{ sourceId: string }> }) { const { sourceId } = await context.params; return captureRequest(request, (identity, input) => readCapturePublicationReview(database(), identity, enabledPermissions, input, captureDeliveryAuthority()), false, sourceId); }
export async function POST(request: Request, context: { params: Promise<{ sourceId: string }> }) { const { sourceId } = await context.params; return captureRequest(request, (identity, input) => publishCaptureDraft(database(), identity, enabledPermissions, input, captureDeliveryAuthority()), true, sourceId); }
export async function PUT(request: Request, context: { params: Promise<{ sourceId: string }> }) { const { sourceId } = await context.params; return captureRequest(request, (identity, input) => cancelCapturePublication(database(), identity, enabledPermissions, input), true, sourceId); }

export async function PATCH(request: Request, context: { params: Promise<{ sourceId: string }> }) { const { sourceId } = await context.params; return captureRequest(request, (identity, input) => changeCapturePublication(database(), identity, enabledPermissions, input, captureDeliveryAuthority()), true, sourceId); }
