import 'server-only';
import { leadUpdateDraftInputSchema, leadUpdateWithStageDraftInputSchema } from '@salesmora/contracts';
import { proposeUpdateDraft } from '../update-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftUpdateLead: ChatToolHandler = async (context, raw) => {
  const input = leadUpdateDraftInputSchema.parse(raw);
  const result = await proposeUpdateDraft(context.identity, context.turnId, input, context.signal, context.db);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-update-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};

export const draftUpdateLeadWithStage: ChatToolHandler = async (context, raw) => {
  const input = leadUpdateWithStageDraftInputSchema.parse(raw);
  const result = await proposeUpdateDraft(context.identity, context.turnId, input, context.signal, context.db);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-update-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};
