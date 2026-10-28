import 'server-only';
import { NextResponse } from 'next/server';
import { CalendarFocusUnavailableError, PlanCapacityError, AuthorizationAccessError } from '@salesmora/data';
import { ChatConflictError, ChatLimitError } from './store';

export const chatReply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export function validChatOrigin(request: Request) {
  return !!process.env.BETTER_AUTH_URL && request.headers.get('origin') === new URL(process.env.BETTER_AUTH_URL).origin;
}
/** Bound bytes while reading, rather than buffering an unbounded request.text(). */
export async function chatBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  let bytes = 0;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let text = '';
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 16000) { await reader.cancel(); throw new ChatLimitError(); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.releaseLock(); }
}
export function chatError(error: unknown) {
  if (error instanceof PlanCapacityError) return chatReply({error:'plan_limit',resource:error.resource,limit:error.limit,resetAt:error.resetAt},409);
  if (error instanceof CalendarFocusUnavailableError) return chatReply({error:'calendar_context_changed'},409);
  if (error instanceof AuthorizationAccessError) return chatReply({ error: 'access_denied' }, 403);
  if (error instanceof ChatConflictError) return chatReply({ error: 'conflict' }, 409);
  if (error instanceof ChatLimitError) return chatReply({ error: 'limit_exceeded' }, 429);
  if (error instanceof SyntaxError || error instanceof TypeError) return chatReply({ error: 'invalid_request' }, 400);
  return chatReply({ error: 'unavailable' }, 500);
}
