import { describe, expect, it } from 'vitest';
import { createWorkOrderSchema, workOrderMutationSchema, workOrderQueryFromURL, workOrderQuerySchema } from './work-order';

const ids = { workspaceId: crypto.randomUUID(), workOrderId: crypto.randomUUID(), submissionId: crypto.randomUUID(), expectedVersion: 1 };

describe('work order contracts', () => {
  it('defaults the list query and ignores unknown URL parameters', () => {
    const q = workOrderQueryFromURL(ids.workspaceId, new URLSearchParams('status=issued&bogus=1&mine=true&pageSize=50'));
    expect(q).toMatchObject({ status: 'issued', mine: true, pageSize: 50, sort: 'scheduledDate', direction: 'asc', archived: false, page: 1 });
    expect(() => workOrderQueryFromURL(ids.workspaceId, new URLSearchParams('pageSize=7'))).toThrow();
  });
  it('rejects unknown query keys and inverted ranges', () => {
    expect(() => workOrderQuerySchema.parse({ workspaceId: ids.workspaceId, extra: 1 })).toThrow();
    expect(() => workOrderQuerySchema.parse({ workspaceId: ids.workspaceId, scheduledFrom: '2026-10-20', scheduledTo: '2026-10-19' })).toThrow();
  });
  it('creates from a blank, duplicate or estimate source', () => {
    const base = { workspaceId: ids.workspaceId, submissionId: ids.submissionId, jobId: crypto.randomUUID(), title: ' Install ' };
    expect(createWorkOrderSchema.parse(base)).toMatchObject({ title: 'Install', source: { kind: 'blank' }, assigneeId: null });
    expect(createWorkOrderSchema.parse({ ...base, source: { kind: 'estimate', estimateId: crypto.randomUUID() } }).source.kind).toBe('estimate');
    expect(() => createWorkOrderSchema.parse({ ...base, source: { kind: 'duplicate' } })).toThrow();
  });
  it('requires a cancel reason and never lets status complete or revert to draft', () => {
    expect(() => workOrderMutationSchema.parse({ ...ids, action: 'status', to: 'canceled' })).toThrow();
    expect(workOrderMutationSchema.parse({ ...ids, action: 'status', to: 'canceled', reason: 'Customer moved' })).toMatchObject({ confirmed: false });
    for (const to of ['completed', 'draft']) expect(() => workOrderMutationSchema.parse({ ...ids, action: 'status', to })).toThrow();
  });
  it('validates edit, schedule, assign and complete payloads', () => {
    expect(() => workOrderMutationSchema.parse({ ...ids, action: 'edit' })).toThrow();
    expect(() => workOrderMutationSchema.parse({ ...ids, action: 'edit', instructions: 'x'.repeat(2001) })).toThrow();
    expect(() => workOrderMutationSchema.parse({ ...ids, action: 'schedule', scheduledDate: null, arrivalWindow: '08:00-10:00' })).toThrow();
    expect(() => workOrderMutationSchema.parse({ ...ids, action: 'assign', assigneeId: null, crewIds: ['a', 'a'] })).toThrow();
    expect(() => workOrderMutationSchema.parse({ ...ids, action: 'complete', summary: 'Done', signatureImage: 'data:image/png;base64,AAAA' })).toThrow();
    expect(workOrderMutationSchema.parse({ ...ids, action: 'complete', summary: 'Done' })).toMatchObject({ followUp: 'none' });
  });
});
