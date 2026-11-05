import 'server-only';
import {
  adminAIUsagePeriodSchema,
  adminAIUsageResponseSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type AdminAIUsagePeriod,
  type AdminAIUsageResponse,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import type { Knex } from '@salesmora/data/database';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

export const adminAIUsageDatabase = createDatabase(getAdminAuthConfiguration().databaseUrl);

export class AdminAIUsageError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface AdminAIUsageIdentity { userId: string; sessionId: string; accessEmail: string }

const PAGE_LIMIT = 31;
const GROUPS = {
  day: `to_char(u."startedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
  model: 'u.model',
  feature: 'u.phase',
  workspace: 'u."workspaceId"',
} as const;
type Group = keyof typeof GROUPS;

function periodStart(period: AdminAIUsagePeriod, now: Date) {
  if (period === 'month') return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const days = period === '7d' ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function serializeAggregate(row: Record<string, unknown>) {
  const calls = Number(row.calls);
  const completedCalls = Number(row.completedCalls);
  const failedCalls = Number(row.failedCalls);
  const unknownUsageCalls = Number(row.unknownUsageCalls);
  if (![calls, completedCalls, failedCalls, unknownUsageCalls].every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error('AI usage aggregate contains invalid counts.');
  }
  const estimatedCost = row.estimatedCostUsd;
  if (estimatedCost !== null && (typeof estimatedCost !== 'string' || !/^\d+\.\d{6}$/.test(estimatedCost))) {
    throw new Error('AI usage aggregate contains invalid estimated cost.');
  }
  return {
    calls, completedCalls, failedCalls, unknownUsageCalls,
    inputTokens: String(row.inputTokens),
    outputTokens: String(row.outputTokens),
    totalTokens: String(row.totalTokens),
    estimatedCostUsd: estimatedCost as string | null,
  };
}

function aggregateQuery(trx: Knex.Transaction, group: Group | null, since: Date, until: Date) {
  const groupExpression = group ? GROUPS[group] : null;
  const groupSelection = groupExpression ? `, ${groupExpression} AS "groupKey"` : '';
  const workspaceJoin = group === 'workspace'
    ? 'LEFT JOIN public.workspaces w ON w.id = u."workspaceId"'
    : '';
  const workspaceSelection = group === 'workspace'
    ? ', u."workspaceId"::text AS "workspaceId", COALESCE(w."businessName", \'Workspace unavailable\') AS "workspaceName"'
    : '';
  const sql = `
    SELECT
      count(*)::int AS calls,
      count(*) FILTER (WHERE u.outcome = 'completed')::int AS "completedCalls",
      count(*) FILTER (WHERE u.outcome = 'failed')::int AS "failedCalls",
      count(*) FILTER (WHERE u."totalTokens" IS NULL)::int AS "unknownUsageCalls",
      coalesce(sum(u."inputTokens"), 0)::text AS "inputTokens",
      coalesce(sum(u."outputTokens"), 0)::text AS "outputTokens",
      coalesce(sum(u."totalTokens"), 0)::text AS "totalTokens",
      CASE WHEN count(*) FILTER (WHERE u."totalTokens" IS NULL OR p.model IS NULL) = 0
        THEN to_char(coalesce(sum(
          ((u."inputTokens" - u."cachedInputTokens") * p."inputUsdPerMillion"
            + u."cachedInputTokens" * p."cachedInputUsdPerMillion"
            + u."outputTokens" * p."outputUsdPerMillion") / 1000000
        ), 0)::numeric, 'FM9999999999999990.000000')
        ELSE NULL
      END AS "estimatedCostUsd"
      ${groupSelection}${workspaceSelection}
    FROM public."aiUsageCalls" u
    LEFT JOIN LATERAL (
      SELECT "inputUsdPerMillion", "cachedInputUsdPerMillion", "outputUsdPerMillion", model
      FROM admin."aiModelPricing" price
      WHERE price.model = u.model AND price."effectiveFrom" <= u."startedAt"
      ORDER BY price."effectiveFrom" DESC
      LIMIT 1
    ) p ON true
    ${workspaceJoin}
    WHERE u."startedAt" >= ? AND u."startedAt" < ? ${group === 'workspace' ? 'AND u."workspaceId" IS NOT NULL' : ''}
    ${groupExpression ? `GROUP BY ${groupExpression}${group === 'workspace' ? ', u."workspaceId", w."businessName"' : ''}` : ''}
    ORDER BY ${group === 'workspace' ? 'coalesce(sum(u."totalTokens"), 0) DESC, u."workspaceId"' : groupExpression ? '"groupKey"' : 'calls DESC'}
    ${group === 'workspace' ? 'LIMIT 20' : group === 'day' ? `LIMIT ${PAGE_LIMIT}` : 'LIMIT 100'}
  `;
  return trx.raw(sql, [since, until]);
}

export function createAdminAIUsageService(db: Knex) {
  async function read(identity: AdminAIUsageIdentity, input: unknown, userAgent?: string | null): Promise<AdminAIUsageResponse> {
    const period = adminAIUsagePeriodSchema.safeParse(input);
    if (!period.success) throw new AdminAIUsageError('Invalid AI usage period.');
    const now = new Date();
    const since = periodStart(period.data, now);
    return db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '15s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions').where({ id: identity.sessionId, userId: identity.userId }).forShare()
        .first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
        session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AdminAIUsageError('Sign in with your verified staff identity.', 401);
      }
      const assignment = await trx.withSchema('admin').table('staffRoleAssignments').where({ userId: identity.userId })
        .whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || !staffRolePermissions[role.data].includes('admin.ai-usage.read')) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role.success ? role.data : 'bootstrap',
          action: 'ai_usage.access_denied',
          targetType: 'ai_usage',
          targetId: period.data,
          after: { permission: 'admin.ai-usage.read', assignedRole: role.success ? role.data : null },
          userAgent,
        });
        return { denied: true as const };
      }

      const summaryResult = await aggregateQuery(trx, null, since, now);
      const dayResult = await aggregateQuery(trx, 'day', since, now);
      const modelResult = await aggregateQuery(trx, 'model', since, now);
      const featureResult = await aggregateQuery(trx, 'feature', since, now);
      const workspaceResult = await aggregateQuery(trx, 'workspace', since, now);
      const pricingResult = await trx.withSchema('admin').table('aiModelPricing')
        .count<{ count: string }[]>('* as count').first();
      const result = adminAIUsageResponseSchema.parse({
        period: period.data,
        since: since.toISOString(),
        asOf: now.toISOString(),
        pricingConfigured: Number(pricingResult?.count ?? 0) > 0,
        pricingVersionCount: Number(pricingResult?.count ?? 0),
        summary: serializeAggregate(summaryResult.rows[0] ?? {}),
        byDay: dayResult.rows.map((row: Record<string, unknown>) => ({
          date: row.groupKey, ...serializeAggregate(row),
        })),
        byModel: modelResult.rows.map((row: Record<string, unknown>) => ({
          model: row.groupKey, ...serializeAggregate(row),
        })),
        byFeature: featureResult.rows.map((row: Record<string, unknown>) => ({
          feature: row.groupKey, ...serializeAggregate(row),
        })),
        topWorkspaces: workspaceResult.rows.map((row: Record<string, unknown>) => ({
          id: row.workspaceId, name: row.workspaceName, ...serializeAggregate(row),
        })),
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role.data,
        action: 'ai_usage.report.read',
        targetType: 'ai_usage',
        targetId: period.data,
        after: {
          period: period.data,
          since: result.since,
          calls: result.summary.calls,
          workspaceCount: result.topWorkspaces.length,
          pricingConfigured: result.pricingConfigured,
        },
        userAgent,
      });
      if (session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AdminAIUsageError('Your admin session expired during the request. Sign in again.', 401);
      }
      return result;
    }).then(result => {
      if ('denied' in result) throw new AdminAIUsageError('Your current role cannot read AI usage.', 403);
      return result;
    });
  }

  return { read };
}

export const adminAIUsage = createAdminAIUsageService(adminAIUsageDatabase);
