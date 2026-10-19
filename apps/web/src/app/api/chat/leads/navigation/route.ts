import { leadHistoryResultSchema, leadDetailsResultSchema, leadSearchNavigationSchema, leadSearchSnapshotSchema, leadExportQuery, leadQueryToURL } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError, chatSearchSnapshotAllowed, leadChatTurnEvidenceAllowed } from '@salesmora/data';
import { getSession } from '../../../../../server/auth/session';
import { authorizedWorkspace } from '../../../../../server/authorization/permissions';
import { chatAccessHash, validateTurnEvidence } from '../../../../../server/chat/store';
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
    await validateTurnEvidence(identity, resultId);
    return await authorizedWorkspace(identity.userId, workspaceId, false, async (trx, current) => {
      const turn = await trx('chatTurns').where({ ...identity, id: resultId, state: 'completed' }).first();
      if (!authorize(current, { permission: 'assistant.use' }).allowed) throw new AuthorizationAccessError();
      if (!turn || turn.accessHash !== chatAccessHash(current) || !await leadChatTurnEvidenceAllowed(trx, current, turn)) throw new AuthorizationAccessError();
      if (turn.leadHistoryResult) {
        const result = leadHistoryResultSchema.parse(turn.leadHistoryResult);
        if (leadId !== result.lead.id) throw new AuthorizationAccessError();
        return chatReply({ href: `/leads/${encodeURIComponent(leadId)}?workspace=${encodeURIComponent(workspaceId)}` });
      }
      if (turn.leadDetailsResult) {
        const result = leadDetailsResultSchema.parse(turn.leadDetailsResult);
        if (leadId !== result.lead.id) throw new AuthorizationAccessError();
        return chatReply({ href: `/leads/${encodeURIComponent(leadId)}?workspace=${encodeURIComponent(workspaceId)}` });
      }
      const snapshot = leadSearchSnapshotSchema.parse(turn.leadSearchSnapshot);
      if (leadId && !snapshot.result.rows.some(row => row.id === leadId)) throw new AuthorizationAccessError();
      // Validation and navigation lookup share fresh authorization; target page rechecks access too.
      if (!await chatSearchSnapshotAllowed(trx, current, snapshot)) throw new AuthorizationAccessError();
      return chatReply({ href: leadId ? `/leads/${encodeURIComponent(leadId)}?workspace=${encodeURIComponent(workspaceId)}` : `/leads?${leadQueryToURL({ ...leadExportQuery({ workspaceId, filters: snapshot.filters }), view: 'list' })}` });
    });
  } catch (error) { return chatError(error); }
}
