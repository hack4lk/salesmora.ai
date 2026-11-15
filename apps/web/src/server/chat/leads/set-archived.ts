import 'server-only';
import { leadArchiveDraftInputSchema } from '@salesmora/contracts';
import { proposeArchiveDraft } from '../archive-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftSetLeadArchived: ChatToolHandler = async (context, raw) => {
  const input = leadArchiveDraftInputSchema.parse(raw);
  const result = await proposeArchiveDraft(context.identity, context.turnId, input, context.signal, context.db);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-archive-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};
