import 'server-only';
import { leadDeleteDraftInputSchema } from '@salesmora/contracts';
import { proposeDeleteDraft } from '../delete-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftDeleteLead: ChatToolHandler = async (context, raw) => {
  const input = leadDeleteDraftInputSchema.parse(raw);
  await context.authorize('leads_propose_action', 'delete');
  const result = await proposeDeleteDraft(context.identity, context.turnId, input, context.signal);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-delete-proposed', action: result.action, saved: false, requiresExplicitTypedConfirmation: true } } : { evidence: result };
};
