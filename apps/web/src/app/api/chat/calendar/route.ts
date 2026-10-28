import { calendarChatOpenSchema } from '@salesmora/contracts';
import { getSession } from '../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../server/chat/http';
import { readCalendarChatResult } from '../../../../server/chat/store';
export async function GET(request: Request) {
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' },401);
  const parsed = calendarChatOpenSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success || (parsed.data.visitId || parsed.data.suggestionId)) return chatReply({ error: 'invalid_request' },422);
  try { return chatReply(await readCalendarChatResult({ userId: session.user.id, workspaceId: parsed.data.workspaceId }, parsed.data.turnId, parsed.data.resultId)); } catch (error) { return chatError(error); }
}
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' },403);
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' },401);
  try {
    const parsed = calendarChatOpenSchema.safeParse(await chatBody(request)); if (!parsed.success) return chatReply({ error: 'invalid_request' },422);
    return chatReply(await readCalendarChatResult({ userId: session.user.id, workspaceId: parsed.data.workspaceId },parsed.data.turnId,parsed.data.resultId,true,parsed.data.visitId,parsed.data.suggestionId));
  } catch (error) { return chatError(error); }
}
