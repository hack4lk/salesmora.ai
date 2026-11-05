import { captureSetupReferenceSchema, captureAssistantProposalDecisionSchema, captureSetupManualSchema } from '@salesmora/contracts';
import { readCaptureSetupProposal, decideCaptureSetupProposal, prepareCaptureSetupSampleApproval, CaptureDraftConflictError, CaptureDraftValidationError } from '@salesmora/data';
import { getSession } from '../../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../../server/chat/http';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
function failure(error: unknown) {
  if (error instanceof CaptureDraftConflictError) return chatReply({ error: 'setup_changed' }, 409);
  if (error instanceof CaptureDraftValidationError || error instanceof Error && error.name === 'ZodError') return chatReply({ error: 'invalid_setup' }, 422);
  return chatError(error);
}
export async function GET(request: Request) {
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  const parsed = captureSetupReferenceSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
  try { return chatReply({ view: await readCaptureSetupProposal(database(), { userId: session.user.id, workspaceId: parsed.data.workspaceId }, enabledPermissions, parsed.data) }); } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = captureAssistantProposalDecisionSchema.safeParse(await chatBody(request));
    if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    return chatReply({ view: await decideCaptureSetupProposal(database(), { userId: session.user.id, workspaceId: parsed.data.workspaceId }, enabledPermissions, parsed.data) });
  } catch (error) { return failure(error); }
}
/** Prepares the exact manual sample corrections for a separate confirmation. */
export async function PUT(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = captureSetupManualSchema.safeParse(await chatBody(request));
    if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    return chatReply({ view: await prepareCaptureSetupSampleApproval(database(), { userId: session.user.id, workspaceId: parsed.data.workspaceId }, enabledPermissions, parsed.data) });
  } catch (error) { return failure(error); }
}
