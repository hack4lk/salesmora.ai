import { describe, expect, it } from 'vitest';
import { registrationPlanIntentSchema, workspacePlanIdSchema } from '@salesmora/contracts';
import { getWorkspacePlan, remainingPlanAllowance, workspacePlanCatalog, workspaceUsagePeriod } from './plans';

describe('workspace billing boundaries', () => {
  it('rejects forged plans and entitlement claims in onboarding intent', () => {
    for (const plan of ['enterprise', '__proto__', 'constructor', null]) expect(workspacePlanIdSchema.safeParse(plan).success).toBe(false);
    expect(registrationPlanIntentSchema.safeParse({ plan: 'premium', paid: true }).success).toBe(false);
    expect(() => getWorkspacePlan('constructor' as 'free')).toThrow('Unknown workspace plan');
  });
  it('keeps the approved workspace-wide capacities and sandbox prices', () => {
    expect(Object.values(workspacePlanCatalog).map(p => [p.monthlyPriceCents, p.limits.teammates, p.limits.newLeadsPerMonth, p.limits.publishedCampaigns, p.limits.aiTokensPerMonth, p.limits.storageBytes])).toEqual([
      [0,1,100,1,1_000_000,1_000_000_000], [2900,5,1000,5,5_000_000,10_000_000_000], [4900,20,5000,null,20_000_000,25_000_000_000],
    ]);
    expect(Object.isFrozen(workspacePlanCatalog.standard.limits)).toBe(true);
  });
  it('retains consumed tokens on upgrade and clamps over-limit downgrades to zero', () => {
    expect(remainingPlanAllowance(getWorkspacePlan('premium').limits.aiTokensPerMonth, 4_000_000)).toBe(16_000_000);
    expect(remainingPlanAllowance(getWorkspacePlan('free').limits.aiTokensPerMonth, 4_000_000)).toBe(0);
    for (const value of [-1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) expect(() => remainingPlanAllowance(100, value)).toThrow();
  });
  it('uses UTC calendar months across local offsets, leap days and year boundaries', () => {
    expect(workspaceUsagePeriod(new Date('2026-12-31T23:30:00-05:00'))).toEqual({start:new Date('2027-01-01T00:00:00Z'),end:new Date('2027-02-01T00:00:00Z')});
    expect(workspaceUsagePeriod(new Date('2028-02-29T20:00:00Z')).end).toEqual(new Date('2028-03-01T00:00:00Z'));
    expect(() => workspaceUsagePeriod(new Date(NaN))).toThrow();
  });
});
