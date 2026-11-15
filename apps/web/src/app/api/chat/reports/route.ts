import { reportAssistantResultRequestSchema } from '@salesmora/contracts';
import { getSession } from '../../../../server/auth/session';
import { chatBody, chatError, chatReply, validChatOrigin } from '../../../../server/chat/http';
import { readReportChatSnapshot } from '../../../../server/chat/store';
import { reportResultResponse } from '../../../../server/chat/report-result';
import { reportHref } from '../../../../features/reports/report-navigation';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return chatReply({ error: 'authentication_required' }, 401);
  const parsed = reportAssistantResultRequestSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
  try {
    const snapshot = await readReportChatSnapshot({ userId: session.user.id, workspaceId: parsed.data.workspaceId },
      parsed.data.turnId, parsed.data.resultId);
    return chatReply(reportResultResponse(snapshot));
  } catch (error) { return chatError(error); }
}

export async function POST(request: Request) {
  if (!validChatOrigin(request)) return chatReply({ error: 'invalid_origin' }, 403);
  const session = await getSession();
  if (!session) return chatReply({ error: 'authentication_required' }, 401);
  try {
    const parsed = reportAssistantResultRequestSchema.safeParse(await chatBody(request));
    if (!parsed.success) return chatReply({ error: 'invalid_request' }, 422);
    const snapshot = await readReportChatSnapshot({ userId: session.user.id, workspaceId: parsed.data.workspaceId },
      parsed.data.turnId, parsed.data.resultId);
    return chatReply({ href: reportHref(snapshot.binding.selection) });
  } catch (error) { return chatError(error); }
}
