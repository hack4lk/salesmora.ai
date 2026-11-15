import 'server-only';
import { leadAssignmentDraftInputSchema } from '@salesmora/contracts';
import { proposeAssignmentDraft } from '../assignment-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftAssignLead: ChatToolHandler = async (context, raw) => {
  const input = leadAssignmentDraftInputSchema.parse(raw);
  const result = await proposeAssignmentDraft(context.identity, context.turnId, input, context.signal, context.db);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-assignment-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};
