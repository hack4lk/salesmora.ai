import { chatActionRequestSchema } from '@salesmora/contracts';
import { LeadExportEmptyError, LeadExportLimitError } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../server/chat/http';
import { ChatActionConflict } from '../../../../server/chat/action-errors';
import { downloadExportDraft } from '../../../../server/chat/export-actions';
export const runtime = 'nodejs';
export const maxDuration = 40;
export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession(); if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = chatActionRequestSchema.safeParse(await chatBody(request));
    if (!parsed.success || parsed.data.decision !== 'confirm') return chatReply({ error: 'invalid_request' }, 422);
    const { workspaceId, draftId, inputHash } = parsed.data;
    const result = await downloadExportDraft({ userId: session.user.id, workspaceId }, draftId, inputHash, request.signal);
    return new Response(result.stream, { headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="salesmora-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'X-Export-Count': String(result.count), 'X-Accel-Buffering': 'no' } });
  } catch (error) {
    if (error instanceof ChatActionConflict || error instanceof LeadExportEmptyError || error instanceof LeadExportLimitError) return chatReply({ error: 'draft_changed_or_expired' }, 409);
    return chatError(error);
  }
}
