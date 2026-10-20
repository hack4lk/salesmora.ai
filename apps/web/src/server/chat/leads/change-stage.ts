import 'server-only';
import { leadStageDraftInputSchema } from '@salesmora/contracts';
import { proposeStageDraft } from '../stage-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftChangeLeadStage: ChatToolHandler = async (context, raw) => {
  const input = leadStageDraftInputSchema.parse(raw);
  await context.authorize('leads_propose_action', 'change_stage');
  const result = await proposeStageDraft(context.identity, context.turnId, input, context.signal);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-stage-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};
