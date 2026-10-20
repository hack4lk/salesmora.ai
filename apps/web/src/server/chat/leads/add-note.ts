import 'server-only';
import { leadNoteDraftInputSchema } from '@salesmora/contracts';
import { proposeNoteDraft } from '../note-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftAddLeadNote: ChatToolHandler = async (context, raw) => {
  const input = leadNoteDraftInputSchema.parse(raw);
  await context.authorize('leads_propose_action', 'add_note');
  const result = await proposeNoteDraft(context.identity, context.turnId, input, context.signal);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-note-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};
