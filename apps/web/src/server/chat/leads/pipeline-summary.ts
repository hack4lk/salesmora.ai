import 'server-only';
import { chatPageContextSchema, pipelineInputSchema } from '@salesmora/contracts';
import { leadChatPipelineCounts } from '@salesmora/data';
import type { ChatToolHandler } from '../tools/types';

export const getLeadPipelineSummary: ChatToolHandler = async (context, args) => {
  pipelineInputSchema.parse(args);
  const intent = chatPageContextSchema.parse(context.turn.pageContext);
  const data = await leadChatPipelineCounts(context.db, context.authority, context.surface === 'leads.list' ? intent.uiState : undefined);
  return { evidence: { type: 'authorized-current-pipeline', data } };
};
