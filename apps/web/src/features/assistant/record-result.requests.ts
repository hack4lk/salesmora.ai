import { customerDraftSchema, workOrderChatDraftSchema, type CustomerChatDraft, type WorkOrderChatDraft } from '@salesmora/contracts';

export function customerDecisionResponse(draft: CustomerChatDraft, decision: 'confirm' | 'cancel', raw: unknown) {
  if (!raw || typeof raw !== 'object' || !('draft' in raw)) throw Error('Customer receipt unavailable.');
  const next = customerDraftSchema.parse(raw.draft);
  if (next.id !== draft.id || next.inputHash !== draft.inputHash || next.action !== draft.action ||
    draft.action !== 'create' && draft.customer.id !== undefined && next.customer.id !== draft.customer.id ||
    next.state !== (decision === 'confirm' ? 'confirmed' : 'canceled')) throw Error('Customer receipt changed.');
  return next;
}

export function workOrderDecisionResponse(draft: WorkOrderChatDraft, decision: 'confirm' | 'cancel', raw: unknown) {
  if (!raw || typeof raw !== 'object' || !('draft' in raw)) throw Error('Work Order receipt unavailable.');
  const next = workOrderChatDraftSchema.parse(raw.draft);
  if (next.id !== draft.id || next.inputHash !== draft.inputHash || next.action !== draft.action ||
    draft.action !== 'create' && draft.workOrder.id !== undefined && next.workOrder.id !== draft.workOrder.id ||
    next.state !== (decision === 'confirm' ? 'confirmed' : 'canceled')) throw Error('Work Order receipt changed.');
  return next;
}

export function customerNavigationResponse(workspaceId: string, recordId: string, kind: 'customer' | 'lead', raw: unknown) {
  const href = `/${kind === 'lead' ? 'leads' : 'customers'}/${recordId}?workspace=${workspaceId}`;
  if (!raw || typeof raw !== 'object' || !('href' in raw) || raw.href !== href) throw Error('Customer destination changed.');
  return href;
}
