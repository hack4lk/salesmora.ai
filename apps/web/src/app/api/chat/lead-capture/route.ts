import { captureChatReferenceSchema, captureChatOpenSchema } from '@salesmora/contracts';
import { getSession } from '../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../server/chat/http';
import { readCaptureChatResult } from '../../../../server/chat/store';
export async function GET(request: Request) {
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  const parsed = captureChatReferenceSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
  try { return chatReply(await readCaptureChatResult({ userId: session.user.id, workspaceId: parsed.data.workspaceId }, parsed.data)); } catch (error) { return chatError(error); }
}
/** Navigation only. Never interprets a confirmation or calls a capture mutation. */
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = captureChatOpenSchema.safeParse(await chatBody(request)); if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    return chatReply(await readCaptureChatResult({ userId: session.user.id, workspaceId: parsed.data.workspaceId }, parsed.data, true));
  } catch (error) { return chatError(error); }
}
