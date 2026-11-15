import { sandboxBillingEnabled } from './billing/stripe';
import { effectiveWorkspacePlan, getWorkspacePlan } from '@salesmora/domain';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { Client, QueryResult } from 'pg';
import { withDatabaseOperation } from './database-metrics';
import { AIBudgetExceededError, validAITokenUsage, type AIUsageRecorder, type AIUsageResult } from '@salesmora/contracts';
export interface AIUsageIdentity { workspaceId?: string; userId?: string; turnId?: string }
type BufferedResult = AIUsageResult & { finishedAt: Date };
type Settlement = { id: string; result: BufferedResult };
function settlementQuery(db: Knex, settlements: readonly Settlement[], locked = false) {
  return db.raw(`
    UPDATE "aiUsageCalls" u SET outcome = s.outcome, "finishedAt" = s."finishedAt",
      "inputTokens" = s."inputTokens", "outputTokens" = s."outputTokens",
      "totalTokens" = s."totalTokens", "cachedInputTokens" = s."cachedInputTokens",
      "reasoningTokens" = s."reasoningTokens"
    FROM jsonb_to_recordset(?::jsonb) AS s(
      id uuid, outcome text, "finishedAt" timestamptz, "inputTokens" bigint, "outputTokens" bigint,
      "totalTokens" bigint, "cachedInputTokens" bigint, "reasoningTokens" bigint)
    WHERE u.id = s.id AND u.outcome = 'started' ${locked ? 'AND EXISTS (SELECT 1 FROM budget_lock)' : ''}
    RETURNING u."startedAt", u."reservationTokens", u."totalTokens"
  `, [JSON.stringify(settlements.map(({ id, result }) => ({ id, outcome: result.outcome, finishedAt: result.finishedAt, ...result.tokens })))]);
}
export function defaultMonthlyAITokens(value = process.env.CHAT_MONTHLY_WORKSPACE_TOKENS): number {
  if (value === undefined) return 5_000_000;
  if (!/^(0|[1-9]\d*)$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 1_000_000_000_000) throw Error('Invalid monthly AI allowance configuration');
  return Number(value);
}
async function lockBudget(trx: Knex.Transaction, workspaceId: string) {
  await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`ai-budget:${workspaceId}`]);
}
export async function workspaceAIAllowance(db: Knex, workspaceId: string, at?: Date) {
  const { monthlyTokens, usedTokens } = await readWorkspaceAIAllowance(db, workspaceId, at);
  return { monthlyTokens, usedTokens };
}
type AllowanceRow = {
  at: Date; override: string | null; defaultTokens: string | null; used: string;
  billing: (NonNullable<Parameters<typeof effectiveWorkspacePlan>[0]> & { transitionUntil?: string | null }) | null;
  workspace: NonNullable<Parameters<typeof effectiveWorkspacePlan>[1]>;
};
function allowanceQuery(db: Knex, workspaceId: string, at?: Date, settlements: readonly Settlement[] = []) {
  return db.raw<{ rows: AllowanceRow[] }>(`
    WITH settled AS (?),
    clock AS MATERIALIZED (SELECT coalesce(?::timestamptz, clock_timestamp()) AS at)
    SELECT clock.at, b."monthlyTokens"::text AS override,
      CASE WHEN b."monthlyTokens" IS NULL THEN public.get_default_monthly_ai_tokens()::text END AS "defaultTokens",
      ((SELECT coalesce(sum(coalesce(u."totalTokens", u."reservationTokens")), 0)
       FROM "aiUsageCalls" u WHERE u."workspaceId" = ?
       AND u."startedAt" >= (date_trunc('month', clock.at AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')) +
       (SELECT coalesce(sum(coalesce("totalTokens", "reservationTokens") - "reservationTokens"), 0)
        FROM settled WHERE "startedAt" >=
          (date_trunc('month', clock.at AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')))::text AS used,
      CASE WHEN s."workspaceId" IS NOT NULL THEN jsonb_build_object(
        'plan', s.plan, 'status', s.status, 'paidThrough', s."paidThrough",
        'recoveryUntil', s."recoveryUntil", 'transitionUntil', s."transitionUntil") END AS billing,
      jsonb_build_object('planOverride', w."planOverride", 'planOverrideEndsAt', w."planOverrideEndsAt") AS workspace
    FROM clock
    LEFT JOIN "workspaceAITokenBudgets" b ON b."workspaceId" = ?
    LEFT JOIN "workspaceSubscriptions" s ON s."workspaceId" = ?
    LEFT JOIN workspaces w ON w.id = ?
  `, [
    settlements.length ? settlementQuery(db, settlements) : db.raw(
      'SELECT NULL::timestamptz AS "startedAt", 0::bigint AS "reservationTokens", NULL::bigint AS "totalTokens" WHERE false'),
    at ?? null, workspaceId, workspaceId, workspaceId, workspaceId,
  ]);
}
function allowanceFromRow(row: AllowanceRow | undefined) {
  if (!row) throw Error('AI allowance query returned no result');
  let monthlyTokens = row.override === null
    ? defaultMonthlyAITokens(row.defaultTokens ?? undefined) : Number(row.override);
  if (sandboxBillingEnabled() && row.override === null && row.billing &&
    (!row.billing.transitionUntil || new Date(row.billing.transitionUntil).getTime() <= row.at.getTime())) {
    monthlyTokens = getWorkspacePlan(effectiveWorkspacePlan(row.billing, row.workspace, row.at).plan).limits.aiTokensPerMonth;
  }
  return { monthlyTokens, usedTokens: BigInt(row.used), startedAt: row.at };
}
async function readWorkspaceAIAllowance(db: Knex, workspaceId: string, at?: Date, settlements: readonly Settlement[] = []) {
  return allowanceFromRow((await allowanceQuery(db, workspaceId, at, settlements)).rows[0]);
}
/** Simple-protocol batches keep statement snapshots separate without extra driver roundtrips. */
async function reserveOnConnection(db: Knex, identity: AIUsageIdentity & { workspaceId: string },
  row: Record<string, unknown>, reservationTokens: number, settlements: readonly Settlement[]) {
  const connection: Client & { __knex__disposed?: unknown } = await db.client.acquireConnection();
  try {
    const lock = db.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`ai-budget:${identity.workspaceId}`]);
    // Knex serializes values once; dispatch directly to avoid reinterpreting literal
    // question marks/backslashes as placeholders. No parameters selects simple protocol.
    const results = await new Promise<QueryResult<AllowanceRow>[]>((resolve, reject) => {
      connection.query<AllowanceRow>({
        text: `BEGIN ISOLATION LEVEL READ COMMITTED; ${lock.toQuery()}; ${allowanceQuery(db, identity.workspaceId, undefined, settlements).toQuery()}`,
      }, (error, result) => {
        if (error) reject(error);
        else if (!Array.isArray(result)) reject(Error('Invalid AI admission batch result'));
        else resolve(result);
      });
    });
    const allowance = allowanceFromRow(results.at(-1)?.rows[0]);
    if (allowance.usedTokens + BigInt(reservationTokens) > BigInt(allowance.monthlyTokens)) throw new AIBudgetExceededError();
    const insert = db('aiUsageCalls').insert({ ...row, startedAt: allowance.startedAt });
    await new Promise<void>((resolve, reject) => {
      connection.query({ text: `${insert.toQuery()}; COMMIT` }, error => error ? reject(error) : resolve());
    });
  } catch (error) {
    try { await db.raw('ROLLBACK').connection(connection); }
    catch (rollbackError) {
      connection.__knex__disposed = rollbackError;
      throw new AggregateError([error, rollbackError], 'AI usage admission rollback failed');
    }
    throw error;
  } finally {
    await db.client.releaseConnection(connection);
  }
}
/** Trusted operator service, not exposed to prompts or a browser mutation endpoint. */
export async function configureWorkspaceAIBudgetInTransaction(
  trx: Knex.Transaction,
  workspaceId: string,
  monthlyTokens: number,
) {
  defaultMonthlyAITokens(String(monthlyTokens));
  await lockBudget(trx, workspaceId);
  await trx('workspaceAITokenBudgets').insert({ workspaceId, monthlyTokens }).onConflict('workspaceId')
    .merge({ monthlyTokens, updatedAt: trx.fn.now() });
}
export async function configureWorkspaceAIBudget(db: Knex, workspaceId: string, monthlyTokens: number) {
  defaultMonthlyAITokens(String(monthlyTokens));
  await db.transaction(trx => configureWorkspaceAIBudgetInTransaction(trx, workspaceId, monthlyTokens));
}
/** Server-owned identity only. Reservations and finalization serialize across all teammates. */
export function createAIUsageRecorder(db: Knex, identity: AIUsageIdentity = {}): AIUsageRecorder {
  return createRecorder(db, identity);
}
function createRecorder(db: Knex, identity: AIUsageIdentity,
  pending?: Map<string, BufferedResult>, admitted?: Set<string>): AIUsageRecorder {
  return { requiresReservation: !!identity.workspaceId, async start(model, phase, reservationTokens = 0) {
    if (!Number.isSafeInteger(reservationTokens) || reservationTokens < 0 || (identity.workspaceId && !reservationTokens)) throw Error('Invalid AI token reservation');
    const id = randomUUID();
    const settlements = [...pending ?? []].map(([id, result]) => ({ id, result }));
    const row = { id, workspaceId: identity.workspaceId ?? null, userId: identity.userId ?? null, turnId: identity.turnId ?? null, model, phase, reservationTokens };
    await withDatabaseOperation('usage-reserve', () => {
      if (pending && identity.workspaceId && !db.isTransaction) {
        return reserveOnConnection(db, { ...identity, workspaceId: identity.workspaceId }, row, reservationTokens, settlements);
      }
      return db.transaction(async trx => {
        let startedAt: Date | undefined;
        if (identity.workspaceId) {
          await lockBudget(trx, identity.workspaceId);
          // Read after acquiring the lock: a statement started before a wait could see stale usage.
          const allowance = await readWorkspaceAIAllowance(trx, identity.workspaceId, undefined, settlements);
          startedAt = allowance.startedAt;
          if (allowance.usedTokens + BigInt(reservationTokens) > BigInt(allowance.monthlyTokens)) throw new AIBudgetExceededError();
        }
        if (!identity.workspaceId && settlements.length) await settlementQuery(trx, settlements);
        await trx('aiUsageCalls').insert({ ...row, ...(startedAt ? { startedAt } : {}) });
      });
    });
    for (const { id } of settlements) { pending?.delete(id); admitted?.delete(id); }
    admitted?.add(id);
    return async (result: AIUsageResult) => {
      if (result.tokens && !validAITokenUsage(result.tokens)) throw Error('Invalid AI usage');
      if (pending) {
        if (admitted?.has(id) && !pending.has(id)) pending.set(id, { ...structuredClone(result), finishedAt: new Date() });
        return;
      }
      await withDatabaseOperation('usage-finalize', async () => {
        const update = db('aiUsageCalls').where({ id, outcome: 'started' });
        if (identity.workspaceId) {
          update.withMaterialized('budget_lock', db.select(db.raw(
            'pg_advisory_xact_lock(hashtextextended(?, 0))', [`ai-budget:${identity.workspaceId}`],
          ))).whereExists(db.select('*').from('budget_lock'));
        }
        // A single atomic statement retains the lock and the idempotent started-state guard.
        await update.update({ outcome: result.outcome, finishedAt: db.fn.now(), ...result.tokens });
      });
    };
  } };
}

export interface AIUsageSession {
  recorder: AIUsageRecorder;
  /** Await after all provider work, before claiming the turn completed. Failures remain retryable. */
  flush(outcome?: 'failed' | 'cancelled'): Promise<void>;
}
/** Request-local buffering; no provider work starts without a durable, exact reservation. */
export function createAIUsageSession(db: Knex, identity: AIUsageIdentity = {}): AIUsageSession {
  const pending = new Map<string, BufferedResult>();
  const admitted = new Set<string>();
  const delegate = createRecorder(db, identity, pending, admitted);
  let accepting = true;
  let tail: Promise<unknown> = Promise.resolve();
  let flushing: Promise<void> | undefined;
  return {
    recorder: {
      requiresReservation: delegate.requiresReservation,
      start(...args) {
        if (!accepting) return Promise.reject(Error('AI usage session is closed'));
        // Serialize request-local admissions, but never hold a transaction during provider work.
        const next = tail.then(() => delegate.start(...args));
        tail = next.catch(() => undefined);
        return next.then(finish => async result => {
          if (!accepting) throw Error('AI usage session is closed');
          await finish(result);
        });
      },
    },
    flush(outcome = 'failed') {
      accepting = false;
      return flushing ??= tail.then(async () => {
        for (const id of admitted) if (!pending.has(id)) pending.set(id, { outcome, finishedAt: new Date() });
        if (!pending.size) return;
        const settlements = [...pending].map(([id, result]) => ({ id, result }));
        await withDatabaseOperation('usage-finalize', async () => {
          const query = db.withMaterialized('budget_lock', db.select(db.raw(
            identity.workspaceId ? 'pg_advisory_xact_lock(hashtextextended(?, 0))' : '1',
            identity.workspaceId ? [`ai-budget:${identity.workspaceId}`] : [],
          ))).with('settled', settlementQuery(db, settlements, true));
          await query.select('*').from('settled');
        });
        pending.clear();
        admitted.clear();
      }).catch(error => { flushing = undefined; throw error; });
    },
  };
}
