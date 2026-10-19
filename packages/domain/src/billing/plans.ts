import type { WorkspacePlanDefinition, WorkspacePlanId } from '@salesmora/contracts';

/** Approved capacity, with draft sandbox prices. Live commercialization requires separate approval. */
export const workspacePlanCatalogVersion = '2026-10-13-v1';
const GB = 1_000_000_000;
function plan(id: WorkspacePlanId, monthlyPriceCents: number, limits: WorkspacePlanDefinition['limits']): WorkspacePlanDefinition {
  return Object.freeze({ id, monthlyPriceCents, currency: 'usd', limits: Object.freeze(limits) });
}
export const workspacePlanCatalog: Readonly<Record<WorkspacePlanId, WorkspacePlanDefinition>> = Object.freeze({
  free: plan('free', 0, { teammates: 1, newLeadsPerMonth: 100, publishedCampaigns: 1, aiTokensPerMonth: 1_000_000, storageBytes: GB }),
  standard: plan('standard', 2900, { teammates: 5, newLeadsPerMonth: 1000, publishedCampaigns: 5, aiTokensPerMonth: 5_000_000, storageBytes: 10 * GB }),
  premium: plan('premium', 4900, { teammates: 20, newLeadsPerMonth: 5000, publishedCampaigns: null, aiTokensPerMonth: 20_000_000, storageBytes: 25 * GB }),
});

/** Roles, provider state and record scope are enforced separately. This lookup grants no access. */
export function getWorkspacePlan(id: WorkspacePlanId): WorkspacePlanDefinition {
  if (!Object.hasOwn(workspacePlanCatalog, id)) throw new Error('Unknown workspace plan.');
  return workspacePlanCatalog[id];
}

/** Calendar-month UTC period shared by lead and AI meters, independent of Stripe renewal. */
export function workspaceUsagePeriod(at: Date) {
  if (!Number.isFinite(at.getTime())) throw new Error('Invalid usage date.');
  const year = at.getUTCFullYear(), month = at.getUTCMonth();
  const start = new Date(0), end = new Date(0);
  start.setUTCFullYear(year, month, 1); start.setUTCHours(0, 0, 0, 0);
  end.setUTCFullYear(year, month + 1, 1); end.setUTCHours(0, 0, 0, 0);
  return { start, end };
}

/** Upgrades and downgrades keep current-month consumption; unused allowance never stacks. */
export function remainingPlanAllowance(allowance: number, consumedOrReserved: number): number {
  if (!Number.isSafeInteger(allowance) || allowance < 0 || !Number.isSafeInteger(consumedOrReserved) || consumedOrReserved < 0) throw new Error('Invalid usage amount.');
  return Math.max(0, allowance - consumedOrReserved);
}
