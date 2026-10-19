import { LeadDeleteConfirmationError, LeadDeleteConflictError, LeadDeleteWonError } from '@salesmora/data';
import { chatDeleteActionRequestSchema } from '@salesmora/contracts';
import { getSession } from '../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../server/chat/http';
import { resolveDeleteDraft } from '../../../../server/chat/delete-actions';
import { ChatActionConflict } from '../../../../server/chat/action-errors';
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = chatDeleteActionRequestSchema.safeParse(await chatBody(request));
    if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    const { workspaceId, draftId, inputHash, decision, typedConfirmation } = parsed.data;
    return chatReply({ action: await resolveDeleteDraft({ userId: session.user.id, workspaceId }, draftId, inputHash, decision, typedConfirmation) });
  } catch (error) {
    if (error instanceof LeadDeleteConfirmationError) return chatReply({ error: 'invalid_confirmation' }, 422);
    if (error instanceof ChatActionConflict || error instanceof LeadDeleteConflictError || error instanceof LeadDeleteWonError) return chatReply({ error: 'draft_changed_or_expired' }, 409);
    return chatError(error);
  }
}
