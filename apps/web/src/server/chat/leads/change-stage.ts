import 'server-only';
import { leadStageDraftInputSchema } from '@salesmora/contracts';
import { proposeStageDraft } from '../stage-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftChangeLeadStage: ChatToolHandler = async (context, raw) => {
  const input = leadStageDraftInputSchema.parse(raw);
  const result = await proposeStageDraft(context.identity, context.turnId, input, context.signal, context.db);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-stage-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};
