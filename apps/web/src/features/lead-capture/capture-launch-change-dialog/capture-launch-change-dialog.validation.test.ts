import { describe, expect, it } from 'vitest';
import { captureScheduledSourceIssue as issue, captureLaunchChangeTiming as timing, type CaptureScheduledSource } from './capture-launch-change-dialog.validation';
const source: CaptureScheduledSource = { id: 'source', version: 2, name: 'Website', type: 'website', status: 'scheduled', scheduledAt: '2026-10-30T13:00:00Z', timezone: 'America/New_York', canChange: true, readiness: 'ready' };
const now = Date.parse('2026-10-29T12:00:00Z');
describe('scheduled launch changes', () => {
  it('requires a current scheduled source, explicit capability and valid version', () => {
    expect(issue(source, now)).toBeNull();
    expect(issue({ ...source, status: 'active' }, now)).toBe('unavailable'); expect(issue({ ...source, canChange: false }, now)).toBe('forbidden'); expect(issue({ ...source, version: 0 }, now)).toBe('invalid');
  });
  it('blocks elapsed schedules and unresolved launch readiness', () => {
    expect(issue(source, Date.parse(source.scheduledAt))).toBe('elapsed'); expect(issue({ ...source, readiness: 'checking' }, now)).toBe('checking'); expect(issue({ ...source, readiness: 'blocked' }, now)).toBe('blocked');
    expect(issue({ ...source, scheduledAt: '2026-10-30T09:00' }, now)).toBe('invalid');
  });
  it('compares exact instants to reject unchanged schedules', () => {
    expect(timing(source, { mode: 'scheduled', localDateTime: '2026-10-30T09:00' }, now).unchanged).toBe(true);
    expect(timing(source, { mode: 'scheduled', localDateTime: '2026-10-31T09:00' }, now)).toMatchObject({ unchanged: false, timing: { at: '2026-10-31T13:00:00.000Z', timezone: source.timezone } });
    expect(timing(source, { mode: 'now', localDateTime: '' }, now)).toEqual({ timing: { kind: 'now' }, unchanged: false });
  });
  it('reuses gap/fold and future-time validation in the business timezone', () => {
    for (const localDateTime of ['2027-03-14T02:30', '2026-11-01T01:30', '2026-10-28T09:00']) expect(timing(source, { mode: 'scheduled', localDateTime }, now).error).toBeTruthy();
  });
});
