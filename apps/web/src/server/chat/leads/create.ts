import 'server-only';
import { leadDraftInputSchema, leadSchema } from '@salesmora/contracts';
import { LeadOwnerError } from '../../leads/store';
import { proposeLeadDraft } from '../actions';
import type { ChatToolHandler } from '../tools/types';
export const draftCreateLead: ChatToolHandler = async (context, args) => {
  const lead = leadDraftInputSchema.parse(args);
  await context.authorize('leads_propose_action', 'create');
  const missing = (['name', 'service'] as const).filter(key => !lead[key]);
  if (missing.length) return { evidence: { type: 'lead-draft-missing-fields', missing, created: false } };
  const parsed = leadSchema.safeParse(lead);
  if (!parsed.success) return { evidence: { type: 'lead-draft-invalid-fields', fields: parsed.error.issues.map(issue => issue.path[0]), created: false } };
  try {
    const action = await proposeLeadDraft(context.identity, context.turnId, parsed.data, context.signal);
    return { action, evidence: { type: 'lead-draft-prepared', lead: action.lead, ownerName: action.ownerName, created: false, requiresExplicitConfirmation: true } };
  } catch (error) {
    if (error instanceof LeadOwnerError) return { evidence: { type: 'lead-draft-owner-unavailable', created: false, nextStep: 'Ask for a current workspace owner ID or leave the lead unassigned.' } };
    throw error;
  }
};
