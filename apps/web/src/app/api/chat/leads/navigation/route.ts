import { leadSearchNavigationSchema } from '@salesmora/contracts';
import { getSession } from '../../../../../server/auth/session';
import { navigateLeadResult } from '../../../../../server/chat/store';
import { chatBody, chatReply, chatError, validChatOrigin } from '../../../../../server/chat/http';
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession();
  if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = leadSearchNavigationSchema.safeParse(await chatBody(request));
    if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    const { workspaceId, resultId, leadId } = parsed.data;
    const identity = { userId: session.user.id, workspaceId };
    return chatReply(await navigateLeadResult(identity, resultId, leadId));
  } catch (error) { return chatError(error); }
}
