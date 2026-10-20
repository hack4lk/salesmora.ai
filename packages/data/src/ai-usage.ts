import { sandboxBillingEnabled } from './billing/stripe';
import { getWorkspacePlan } from '@salesmora/domain';
import { workspacePlanIdSchema } from '@salesmora/contracts';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { AIBudgetExceededError, validAITokenUsage, type AIUsageRecorder, type AIUsageResult } from '@salesmora/contracts';
export interface AIUsageIdentity { workspaceId?: string; userId?: string; turnId?: string }
export function defaultMonthlyAITokens(value = process.env.CHAT_MONTHLY_WORKSPACE_TOKENS): number {
  if (value === undefined) return 5_000_000;
  if (!/^(0|[1-9]\d*)$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 1_000_000_000_000) throw Error('Invalid monthly AI allowance configuration');
  return Number(value);
}
async function lockBudget(trx: Knex.Transaction, workspaceId: string) {
  await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`ai-budget:${workspaceId}`]);
}
export async function workspaceAIAllowance(db: Knex, workspaceId: string, at?: Date) {
  const override = await db('workspaceAITokenBudgets').where({ workspaceId }).first();
  const result = await db('aiUsageCalls').where({ workspaceId })
    .whereRaw(`"startedAt" >= (date_trunc('month', coalesce(?::timestamptz, statement_timestamp()) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`, [at ?? null])
    .select(db.raw('coalesce(sum(coalesce("totalTokens", "reservationTokens")), 0)::text AS used')).first();
  const billing = await db('workspaceSubscriptions').where({workspaceId}).first();
  let monthlyTokens = override ? Number(override.monthlyTokens) : defaultMonthlyAITokens();
  if (sandboxBillingEnabled() && !override && billing && (!billing.transitionUntil || new Date(billing.transitionUntil).getTime() <= (at ?? new Date()).getTime())) {
    const now = (at ?? new Date()).getTime();
    const paid = billing.status === 'active' && billing.paidThrough && new Date(billing.paidThrough).getTime() > now;
    const grace = billing.status === 'past_due' && billing.recoveryUntil && new Date(billing.recoveryUntil).getTime() > now;
    monthlyTokens = getWorkspacePlan(paid || grace ? workspacePlanIdSchema.parse(billing.plan) : 'free').limits.aiTokensPerMonth;
  }
  return { monthlyTokens, usedTokens: BigInt(result.used) };
}
/** Trusted operator service, not exposed to prompts or a browser mutation endpoint. */
export async function configureWorkspaceAIBudget(db: Knex, workspaceId: string, monthlyTokens: number) {
  defaultMonthlyAITokens(String(monthlyTokens));
  await db.transaction(async trx => {
    await lockBudget(trx, workspaceId);
    await trx('workspaceAITokenBudgets').insert({ workspaceId, monthlyTokens }).onConflict('workspaceId').merge({ monthlyTokens, updatedAt: trx.fn.now() });
  });
}
/** Server-owned identity only. Reservations and finalization serialize across all teammates. */
export function createAIUsageRecorder(db: Knex, identity: AIUsageIdentity = {}): AIUsageRecorder {
  return { requiresReservation: !!identity.workspaceId, async start(model, phase, reservationTokens = 0) {
    if (!Number.isSafeInteger(reservationTokens) || reservationTokens < 0 || (identity.workspaceId && !reservationTokens)) throw Error('Invalid AI token reservation');
    const id = randomUUID();
    await db.transaction(async trx => {
      let startedAt: Date | undefined;
      if (identity.workspaceId) {
        await lockBudget(trx, identity.workspaceId);
        const clock = await trx.select(trx.raw('clock_timestamp() AS now')).first();
        startedAt = clock.now;
        const allowance = await workspaceAIAllowance(trx, identity.workspaceId, startedAt);
        if (allowance.usedTokens + BigInt(reservationTokens) > BigInt(allowance.monthlyTokens)) throw new AIBudgetExceededError();
      }
      await trx('aiUsageCalls').insert({ id, workspaceId: identity.workspaceId ?? null, userId: identity.userId ?? null, turnId: identity.turnId ?? null, model, phase, reservationTokens, ...(startedAt ? { startedAt } : {}) });
    });
    return async (result: AIUsageResult) => {
      if (result.tokens && !validAITokenUsage(result.tokens)) throw Error('Invalid AI usage');
      await db.transaction(async trx => {
        if (identity.workspaceId) await lockBudget(trx, identity.workspaceId);
        // Never release an unknown call or double-count repeated finalization.
        await trx('aiUsageCalls').where({ id, outcome: 'started' }).update({ outcome: result.outcome, finishedAt: trx.fn.now(), ...result.tokens });
      });
    };
  } };
}
