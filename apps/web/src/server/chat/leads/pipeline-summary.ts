import 'server-only';
import { authorizeLeadOperation } from '@salesmora/agent';
import { chatPageContextSchema, pipelineInputSchema } from '@salesmora/contracts';
import { AuthorizationAccessError, leadChatPipelineCounts, leadChatTurnEvidenceAllowed } from '@salesmora/data';
import { authorizedWorkspace } from '../../authorization/permissions';
import type { ChatToolHandler } from '../tools/types';

export const getLeadPipelineSummary: ChatToolHandler = async (context, args) => {
  pipelineInputSchema.parse(args);
  await context.authorize('leads_query', 'pipeline_summary');
  const { userId, workspaceId } = context.identity;
  const data = await authorizedWorkspace(userId, workspaceId, false, async (trx, current) => {
    const access = authorizeLeadOperation(current, context.surface, 'pipeline_summary');
    const turn = await trx('chatTurns').where({ ...context.identity, id: context.turnId }).first();
    if (!access.allowed || !turn || !await leadChatTurnEvidenceAllowed(trx, current, turn)) throw new AuthorizationAccessError();
    const intent = chatPageContextSchema.parse(turn.pageContext);
    return leadChatPipelineCounts(trx, current, context.surface === 'leads.list' ? intent.uiState : undefined);
  });
  return { evidence: { type: 'authorized-current-pipeline', data } };
};
