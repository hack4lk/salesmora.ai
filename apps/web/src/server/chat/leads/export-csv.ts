import 'server-only';
import { leadExportDraftInputSchema } from '@salesmora/contracts';
import { proposeExportDraft } from '../export-actions';
import type { ChatToolHandler } from '../tools/types';
export const draftExportLeads: ChatToolHandler = async (context, raw) => {
  const input = leadExportDraftInputSchema.parse(raw);
  await context.authorize('leads_propose_action', 'export_csv');
  const result = await proposeExportDraft(context.identity, context.turnId, input, context.signal);
  return 'action' in result ? { action: result.action, evidence: { type: 'lead-export-proposed', action: result.action, saved: false, requiresExplicitConfirmation: true } } : { evidence: result };
};
