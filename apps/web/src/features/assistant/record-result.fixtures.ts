import type { CustomerChatDraft, CustomerChatResult, WorkOrderChatDraft, WorkOrderChatResult } from '@salesmora/contracts';

export const recordWorkspace = '00000000-0000-4000-8000-000000000001';
export const recordId = '00000000-0000-4000-8000-000000000002';
export const recordTurnId = '00000000-0000-4000-8000-000000000003';
export function customerRecordDraft(action: CustomerChatDraft['action'] = 'update'): CustomerChatDraft {
  return {
    id: '00000000-0000-4000-8000-000000000004', inputHash: 'a'.repeat(64), action,
    expiresAt: new Date(Date.now() + 600000).toISOString(), state: 'pending',
    customer: { id: recordId, name: 'Fictional Customer', number: 'C-1042' },
    changes: [{ label: 'Phone', before: '555-0100', after: '555-0101' }],
    ...(action === 'delete' ? { unlinkLeadCount: 1 } : {}),
    ...(action === 'export' ? { count: 1, columns: ['Name', 'Phone'] } : {}),
  };
}
export function customerRecordResult(draft: CustomerChatDraft | undefined = customerRecordDraft()): CustomerChatResult {
  return { turnId: recordTurnId, kind: 'proposal', title: 'Customer review', total: 0, records: [], fields: [], entries: [], draft };
}
export function workOrderRecordDraft(action: WorkOrderChatDraft['action'] = 'edit'): WorkOrderChatDraft {
  return {
    id: '00000000-0000-4000-8000-000000000005', inputHash: 'b'.repeat(64), action,
    expiresAt: new Date(Date.now() + 600000).toISOString(), state: 'pending',
    workOrder: { id: recordId, number: 'WO-1042', title: 'Fictional repair' },
    changes: [{ label: 'Title', before: 'Fictional repair', after: 'Fictional plumbing repair' }],
    ...(['export', 'material-export'].includes(action) ? { count: 1, columns: ['Name'] } : {}),
  };
}
export function workOrderRecordResult(draft = workOrderRecordDraft()): WorkOrderChatResult {
  return { turnId: recordTurnId, kind: 'proposal', title: 'Work Order review', records: [], draft };
}
