import { describe, expect, it } from 'vitest';
import { captureLaunchReadiness, captureLaunchTiming, resolveCaptureLaunchTime as resolve, type CaptureSetupReviewDraft } from './capture-setup-review.validation';
const draft: CaptureSetupReviewDraft = { id: 'source', version: 1, name: 'Website', source: 'website', timezone: 'America/New_York', sections: (['source', 'fields', 'workflow'] as const).map(id => ({ id, rows: [{ label: 'Setting', value: 'Reviewed' }] })), checks: (['source', 'fields', 'workflow', 'access', 'capacity'] as const).map(id => ({ id, status: 'ready' })) };
describe('capture launch review', () => {
  it('requires the complete review and current positive identity/version', () => {
    expect(captureLaunchReadiness(draft)).toBe(true);
    for (const next of [{ ...draft, version: 0 }, { ...draft, id: '' }, { ...draft, sections: [] }, { ...draft, checks: [] }, { ...draft, checks: [...draft.checks, draft.checks[0]] }]) expect(captureLaunchReadiness(next)).toBe(false);
  });
  it('requires Gmail account/sample checks and blocks unresolved capacity/access', () => {
    expect(captureLaunchReadiness({ ...draft, source: 'gmail' })).toBe(false);
    expect(captureLaunchReadiness({ ...draft, source: 'gmail', checks: [...draft.checks, { id: 'account', status: 'ready' }, { id: 'sample', status: 'ready' }] })).toBe(true);
    for (const status of ['blocked', 'checking'] as const) expect(captureLaunchReadiness({ ...draft, checks: draft.checks.map(check => check.id === 'capacity' ? { ...check, status } : check) })).toBe(false);
  });
  it('resolves the business timezone independently of the browser timezone', () => {
    expect(resolve('2026-10-30T09:00', 'America/New_York')).toEqual({ at: '2026-10-30T13:00:00.000Z' });
    expect(resolve('2026-12-30T09:00', 'America/New_York')).toEqual({ at: '2026-12-30T14:00:00.000Z' });
    expect(resolve('2026-10-30T09:00', 'Asia/Kathmandu')).toEqual({ at: '2026-10-30T03:15:00.000Z' });
  });
  it('rejects nonexistent and repeated times at daylight-saving transitions', () => {
    expect(resolve('2027-03-14T02:30', 'America/New_York').error).toBeTruthy();
    expect(resolve('2026-11-01T01:30', 'America/New_York').error).toBeTruthy();
    expect(resolve('2026-11-01T02:30', 'America/New_York')).toEqual({ at: '2026-11-01T07:30:00.000Z' });
  });
  it('rejects malformed dates, impossible dates and unsupported timezones', () => {
    for (const text of ['', '2026-02-30T09:00', '2026-10-30T25:00', '2026-10-30T09:00Z']) expect(resolve(text, draft.timezone).error).toBeTruthy();
    expect(resolve('2026-10-30T09:00', 'invalid').error).toBeTruthy();
  });
  it('revalidates future scheduling and binds an unambiguous instant and timezone', () => {
    const value = { mode: 'scheduled' as const, localDateTime: '2026-10-30T09:00' };
    expect(captureLaunchTiming(value, draft.timezone, Date.parse('2026-10-28T20:00Z')).timing).toEqual({ kind: 'scheduled', at: '2026-10-30T13:00:00.000Z', timezone: draft.timezone, localDateTime: value.localDateTime });
    expect(captureLaunchTiming(value, draft.timezone, Date.parse('2026-10-30T13:00Z')).error).toBeTruthy();
    expect(captureLaunchTiming({ mode: 'now', localDateTime: '' }, draft.timezone, Date.now()).timing).toEqual({ kind: 'now' });
  });
});
