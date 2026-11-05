import { describe, expect, it } from 'vitest';
import { effectiveWorkspacePlan, normalizePlanOverride, normalizePlanOverrideReason, planOverrideLatestEnd } from './plan-override';

const now = new Date('2026-10-29T12:00:00Z');
const future = new Date('2026-12-01T00:00:00Z');
const past = new Date('2026-10-01T00:00:00Z');

describe('effectiveWorkspacePlan', () => {
  it('uses the billed plan when there is no override', () => {
    expect(effectiveWorkspacePlan({ plan: 'standard', status: 'active', paidThrough: future }, {}, now))
      .toEqual({ plan: 'standard', billedPlan: 'standard', override: null });
    expect(effectiveWorkspacePlan(undefined, null, now)).toEqual({ plan: 'free', billedPlan: 'free', override: null });
  });
  it('falls back to free when payment lapses, and keeps the plan during the grace period', () => {
    expect(effectiveWorkspacePlan({ plan: 'premium', status: 'active', paidThrough: past }, null, now).plan).toBe('free');
    expect(effectiveWorkspacePlan({ plan: 'premium', status: 'past_due', recoveryUntil: future }, null, now).plan).toBe('premium');
    expect(effectiveWorkspacePlan({ plan: 'premium', status: 'past_due', recoveryUntil: past }, null, now).plan).toBe('free');
    expect(effectiveWorkspacePlan({ plan: 'premium', status: 'canceled', paidThrough: future }, null, now).plan).toBe('free');
  });
  it('applies an active override above the billed plan', () => {
    expect(effectiveWorkspacePlan({ plan: 'free', status: 'free' }, { planOverride: 'premium', planOverrideEndsAt: future.toISOString() }, now))
      .toEqual({ plan: 'premium', billedPlan: 'free', override: { plan: 'premium', endsAt: future } });
  });
  it('ignores an expired override', () => {
    expect(effectiveWorkspacePlan(null, { planOverride: 'premium', planOverrideEndsAt: past }, now))
      .toEqual({ plan: 'free', billedPlan: 'free', override: null });
    expect(effectiveWorkspacePlan(null, { planOverride: 'premium', planOverrideEndsAt: now }, now).plan).toBe('free');
  });
  it('never lowers a paid plan, but still reports the active override', () => {
    expect(effectiveWorkspacePlan({ plan: 'premium', status: 'active', paidThrough: future }, { planOverride: 'standard', planOverrideEndsAt: future }, now))
      .toEqual({ plan: 'premium', billedPlan: 'premium', override: { plan: 'standard', endsAt: future } });
  });
  it('ignores unknown override plans and rejects forged billed plans', () => {
    expect(effectiveWorkspacePlan(null, { planOverride: 'enterprise', planOverrideEndsAt: future }, now).override).toBeNull();
    expect(effectiveWorkspacePlan(null, { planOverride: 'free', planOverrideEndsAt: future }, now).override).toBeNull();
    expect(() => effectiveWorkspacePlan({ plan: 'enterprise', status: 'active', paidThrough: future }, null, now)).toThrow();
  });
});

describe('normalizePlanOverride', () => {
  it('accepts Standard or Premium up to 12 months away and trims the reason', () => {
    expect(normalizePlanOverride({ plan: 'premium', endsAt: future.toISOString(), reason: '  Pilot  ' }, now))
      .toEqual({ plan: 'premium', endsAt: future, reason: 'Pilot' });
    expect(normalizePlanOverride({ plan: 'standard', endsAt: planOverrideLatestEnd(now), reason: 'x' }, now).endsAt)
      .toEqual(new Date('2027-10-29T12:00:00Z'));
  });
  it('rejects other plans, past or distant end dates and missing reasons', () => {
    expect(() => normalizePlanOverride({ plan: 'free', endsAt: future, reason: 'x' }, now)).toThrow('Standard or Premium');
    expect(() => normalizePlanOverride({ plan: '__proto__', endsAt: future, reason: 'x' }, now)).toThrow('Standard or Premium');
    expect(() => normalizePlanOverride({ plan: 'premium', endsAt: 'soon', reason: 'x' }, now)).toThrow('valid end date');
    expect(() => normalizePlanOverride({ plan: 'premium', endsAt: 12, reason: 'x' }, now)).toThrow('valid end date');
    expect(() => normalizePlanOverride({ plan: 'premium', endsAt: now, reason: 'x' }, now)).toThrow('in the future');
    expect(() => normalizePlanOverride({ plan: 'premium', endsAt: new Date(planOverrideLatestEnd(now).getTime() + 1), reason: 'x' }, now)).toThrow('within 12 months');
    expect(() => normalizePlanOverrideReason('   ')).toThrow('required');
    expect(() => normalizePlanOverrideReason('x'.repeat(501))).toThrow('500 characters');
  });
});
