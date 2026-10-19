import { chatCancelSchema as schema } from '@salesmora/contracts';
import { getSession } from '../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../server/chat/http';
import { cancelTurn } from '../../../../server/chat/store';
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession();
  if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = schema.safeParse(await chatBody(request));
    if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    await cancelTurn({ userId: session.user.id, workspaceId: parsed.data.workspaceId }, parsed.data.turnId);
    return chatReply({ cancelled: true });
  } catch (error) { return chatError(error); }
}
