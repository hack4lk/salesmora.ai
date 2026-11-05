import { captureSetupReferenceSchema, captureAssistantProposalDecisionSchema } from '@salesmora/contracts';
import { readCaptureSourceProposal, decideCaptureSourceProposal, CaptureDraftConflictError, CaptureDraftValidationError, CaptureDraftEntitlementError, CapturePublicationError } from '@salesmora/data';
import { getSession } from '../../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../../server/chat/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
import { captureDeliveryAuthority } from '../../../../../server/lead-capture/delivery';
import { captureChatDeliveryStamp } from '../../../../../server/chat/capture-policy';
function failure(error: unknown) {
  if (error instanceof CaptureDraftEntitlementError) return chatReply({ error: 'plan_required' }, 403);
  if (error instanceof CaptureDraftConflictError || error instanceof CapturePublicationError && error.kind === 'conflict')
    return chatReply({ error: 'source_changed' }, 409);
  if (error instanceof CaptureDraftValidationError || error instanceof CapturePublicationError || error instanceof Error && error.name === 'ZodError')
    return chatReply({ error: 'source_not_ready' }, 422);
  return chatError(error);
}
export async function GET(request: Request) {
  const session = await getSession();
  if (!session)
    return chatReply({ error: 'authentication_required' }, 401);
  const input = captureSetupReferenceSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!input.success)
    return chatReply({ error: 'invalid_request' }, 422);
  try {
    return chatReply({ view: await readCaptureSourceProposal(database(), { userId: session.user.id, workspaceId: input.data.workspaceId }, enabledPermissions, input.data, captureChatDeliveryStamp(input.data.workspaceId)) });
  }
  catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  if (!validChatOrigin(request))
    return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession();
  if (!session)
    return chatReply({ error: 'authentication_required' }, 401);
  try {
    const input = captureAssistantProposalDecisionSchema.safeParse(await chatBody(request));
    if (!input.success)
      return chatReply({ error: 'invalid_request' }, 422);
    return chatReply({ view: await decideCaptureSourceProposal(database(), { userId: session.user.id, workspaceId: input.data.workspaceId }, enabledPermissions, input.data, captureDeliveryAuthority(), captureChatDeliveryStamp(input.data.workspaceId)) });
  }
  catch (error) {
    return failure(error);
  }
}
