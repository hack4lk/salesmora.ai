import { describe, expect, it } from 'vitest';
import { markNotificationReadResultSchema, notificationRecordSchema, notificationResultSchema, type NotificationRecord } from './notifications';

const common = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', createdAt: '2026-10-15T14:30:00Z', read: false };
const job = { ...common, kind: 'job' as const, jobId: common.id, jobNumber: 'J-1042', jobTitle: 'Repair', actorName: 'Alex' };
const records: NotificationRecord[] = [
  { ...common, kind: 'capture', sourceId: common.id, sourceName: 'Website', reason: 'connection' },
  { ...common, kind: 'lead', leadId: common.id, leadNumber: 'LD-1042', leadName: 'Jordan', service: 'Repair', assignerName: 'Alex' },
  { ...common, kind: 'estimate', event: 'viewed', estimateId: common.id, estimateNumber: 'EST-1042', estimateName: 'Repair', status: 'sent' },
  { ...common, kind: 'work_order', event: 'issued', workOrderId: common.id, workOrderNumber: 'WO-1042', workOrderTitle: 'Repair', actorName: 'Alex' },
  { ...common, kind: 'material', event: 'approved', materialId: common.id, materialName: 'Pipe', reason: '', actorName: 'Alex' },
  { ...common, kind: 'visit', event: 'cleared', actorName: 'Alex', timezone: 'UTC',
    before: { scheduledDate: '2026-10-15', arrivalWindow: '08:00-10:00' }, after: { scheduledDate: null, arrivalWindow: null },
    records: [{ type: 'job', id: common.id, number: 'J-1042', title: 'Repair' }] },
  { ...common, kind: 'deadline', jobId: common.id, jobNumber: 'J-1042', jobTitle: 'Repair',
    completionDeadline: '2026-10-15', reminderDate: '2026-10-14', timezone: 'UTC', event: 'approaching' },
  { ...job, event: 'created' },
  { ...job, event: 'status', before: 'scheduled', after: 'in-progress' },
  { ...job, event: 'deadline', before: null, after: '2026-10-15', timezone: 'UTC' },
  { ...job, event: 'assignment', access: 'current', change: 'team' },
  { ...common, kind: 'job', event: 'assignment', access: 'ended', change: 'removed', jobNumber: 'J-1042' },
];

describe('notification response contracts', () => {
  it.each(records)('accepts the $kind event projection', record => {
    expect(notificationRecordSchema.parse(record)).toEqual(record);
  });
  it('keeps assignment-ended notices narrow', () => {
    expect(notificationRecordSchema.safeParse({ ...records.at(-1), jobId: common.id, jobTitle: 'No longer authorized' }).success).toBe(false);
  });
  it.each([
    { items: [], unreadCount: -1, page: 1, hasMore: false },
    { items: [], unreadCount: 0, page: 51, hasMore: false },
    { items: [{ ...records[0], read: 'false' }], unreadCount: 0, page: 1, hasMore: false },
    { items: [{ ...records[0], createdAt: 'invalid' }], unreadCount: 0, page: 1, hasMore: false },
    { items: [{ ...records[5], records: [] }], unreadCount: 0, page: 1, hasMore: false },
    { items: [{ ...records[5], after: { scheduledDate: null, arrivalWindow: '08:00-10:00' } }], unreadCount: 0, page: 1, hasMore: false },
  ])('rejects malformed notification results', result => {
    expect(notificationResultSchema.safeParse(result).success).toBe(false);
  });
  it('requires an affirmative mark-read acknowledgement', () => {
    expect(markNotificationReadResultSchema.parse({ ok: true })).toEqual({ ok: true });
    expect(markNotificationReadResultSchema.safeParse({ ok: false }).success).toBe(false);
    expect(markNotificationReadResultSchema.safeParse({}).success).toBe(false);
  });
});
