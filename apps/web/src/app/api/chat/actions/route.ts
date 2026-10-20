import { LeadArchiveConflictError, LeadNoteConflictError, LeadAssignmentConflictError, LeadEditConflictError, LeadSourceLockedError } from '@salesmora/data';
import { chatActionRequestSchema } from '@salesmora/contracts';
import { getSession } from '../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../server/chat/http';
import { resolveLeadDraft, ChatActionConflict } from '../../../../server/chat/actions';
import { LeadOwnerError, LeadAccessError } from '../../../../server/leads/store';
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = chatActionRequestSchema.safeParse(await chatBody(request));
    if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    const { workspaceId, draftId, inputHash, decision } = parsed.data;
    return chatReply({ action: await resolveLeadDraft({ userId: session.user.id, workspaceId }, draftId, inputHash, decision) });
  } catch (error) {
    if (error instanceof ChatActionConflict || error instanceof LeadArchiveConflictError || error instanceof LeadNoteConflictError || error instanceof LeadAssignmentConflictError || error instanceof LeadOwnerError || error instanceof LeadEditConflictError || error instanceof LeadSourceLockedError) return chatReply({ error: 'draft_changed_or_expired' }, 409);
    if (error instanceof LeadAccessError) return chatReply({ error: 'access_denied' }, 403);
    return chatError(error);
  }
}
