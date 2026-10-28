import { describe, it, expect } from 'vitest';
import { saveJobNotificationSettingsSchema as schema } from './job-notification-settings';
const base = { workspaceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', submissionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', revision: '0' };
const reminders = { sendTime: '09:00', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] };
describe('workspace Job settings commands', () => {
  it('rejects forged authority, in-app controls and unused deadline fields', () => {
    for (const value of [{ ...base, section: 'deadline', values: { mode: 'unset', days: 5 } }, { ...base, section: 'deadline', values: { mode: 'unset' }, canManage: true }, { ...base, section: 'events', values: { created: true, app: false } }]) expect(schema.safeParse(value).success).toBe(false);
  });
  it('requires whole days, valid time, distinct bounded timings and distinct recipients', () => {
    for (const values of [{ ...reminders, sendTime: '25:00' }, { ...reminders, offsets: [] }, { ...reminders, offsets: Array.from({ length: 6 }, (_, i) => ({ id: String(i), relative: 'before', days: i + 1 })) }, { ...reminders, offsets: [{ id: 'x', relative: 'before', days: 0 }] }, { ...reminders, offsets: [{ id: 'x', relative: 'on', days: 1 }] }, { ...reminders, offsets: [{ id: 'x', relative: 'after', days: 366 }] }, { ...reminders, offsets: [{ id: 'x', relative: 'before', days: 1.5 }] }, { ...reminders, offsets: [reminders.offsets[0], { ...reminders.offsets[0], id: 'other' }] }, { ...reminders, extraRecipientIds: ['a', 'a'] }]) expect(schema.safeParse({ ...base, section: 'reminders', values }).success).toBe(false);
  });
  it('accepts the approved boundary rules and no fixed date as reusable default', () => {
    expect(schema.safeParse({ ...base, section: 'reminders', values: { ...reminders, offsets: [{ id: 'a', relative: 'before', days: 365 }, ...reminders.offsets, { id: 'b', relative: 'after', days: 365 }] } }).success).toBe(true);
    expect(schema.safeParse({ ...base, section: 'deadline', values: { mode: 'relative', days: 365, count: 'business' } }).success).toBe(true);
    expect(schema.safeParse({ ...base, section: 'deadline', values: { mode: 'fixed', date: '2026-11-01' } }).success).toBe(false);
  });
});
