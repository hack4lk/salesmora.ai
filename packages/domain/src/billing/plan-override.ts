import { workspacePlanIdSchema, type WorkspacePlanId } from '@salesmora/contracts';

type Timestamp = Date | string | null | undefined;

export const planOverridePlans = ['standard', 'premium'] as const;
export type PlanOverridePlan = (typeof planOverridePlans)[number];
export const planOverrideMaxMonths = 12;
export const planOverrideReasonMaxLength = 500;

export interface SubscriptionPlanState { plan?: string | null; status?: string | null; paidThrough?: Timestamp; recoveryUntil?: Timestamp }
export interface WorkspacePlanOverrideState { planOverride?: string | null; planOverrideEndsAt?: Timestamp }
export interface EffectiveWorkspacePlan {
  /** The plan whose limits apply. */
  plan: WorkspacePlanId;
  /** What Stripe bills for; an override never changes it. */
  billedPlan: WorkspacePlanId;
  /** Only set while the override is active, even when the billed plan is higher. */
  override: { plan: PlanOverridePlan; endsAt: Date } | null;
}

const rank: Record<WorkspacePlanId, number> = { free: 0, standard: 1, premium: 2 };
const after = (value: Timestamp, now: Date) => Boolean(value) && new Date(value as Date | string).getTime() > now.getTime();

/**
 * The single source of truth for which plan's limits apply. Paid and grace-period subscriptions
 * keep their plan; a staff override applies until it ends but never lowers a paid plan.
 */
export function effectiveWorkspacePlan(subscription: SubscriptionPlanState | null | undefined,
  workspace: WorkspacePlanOverrideState | null | undefined, now: Date): EffectiveWorkspacePlan {
  const paid = subscription?.status === 'active' && after(subscription.paidThrough, now);
  const grace = subscription?.status === 'past_due' && after(subscription.recoveryUntil, now);
  const billedPlan = paid || grace ? workspacePlanIdSchema.parse(subscription?.plan) : 'free';
  const overridePlan = workspace?.planOverride, overrideEnd = workspace?.planOverrideEndsAt;
  const override = overridePlan && (planOverridePlans as readonly string[]).includes(overridePlan) && after(overrideEnd, now)
    ? { plan: overridePlan as PlanOverridePlan, endsAt: new Date(overrideEnd as Date | string) }
    : null;
  const plan = override && rank[override.plan] > rank[billedPlan] ? override.plan : billedPlan;
  return { plan, billedPlan, override };
}

/** The latest allowed end date: the same day and time 12 calendar months from now. */
export function planOverrideLatestEnd(now: Date): Date {
  const latest = new Date(now.getTime());
  latest.setUTCMonth(latest.getUTCMonth() + planOverrideMaxMonths);
  return latest;
}

export interface PlanOverrideInput { plan: PlanOverridePlan; endsAt: Date; reason: string }

/** Validates staff input. The reason is an internal note and is never shown to customers. */
export function normalizePlanOverride(input: { plan: unknown; endsAt: unknown; reason: unknown }, now: Date): PlanOverrideInput {
  if (typeof input.plan !== 'string' || !(planOverridePlans as readonly string[]).includes(input.plan)) {
    throw new RangeError('The override plan must be Standard or Premium.');
  }
  const endsAt = input.endsAt instanceof Date || typeof input.endsAt === 'string' ? new Date(input.endsAt) : new Date(NaN);
  if (!Number.isFinite(endsAt.getTime())) throw new RangeError('A valid end date is required.');
  if (endsAt.getTime() <= now.getTime()) throw new RangeError('The end date must be in the future.');
  if (endsAt.getTime() > planOverrideLatestEnd(now).getTime()) throw new RangeError(`The end date must be within ${planOverrideMaxMonths} months.`);
  return { plan: input.plan as PlanOverridePlan, endsAt, reason: normalizePlanOverrideReason(input.reason) };
}

export function normalizePlanOverrideReason(reason: unknown): string {
  const value = typeof reason === 'string' ? reason.trim() : '';
  if (!value) throw new RangeError('A reason is required.');
  if (value.length > planOverrideReasonMaxLength) throw new RangeError(`The reason must be ${planOverrideReasonMaxLength} characters or fewer.`);
  return value;
}
