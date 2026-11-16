import type { Knex } from 'knex';
import { z } from 'zod';
import { activityReportEventSchema, leadStages, type AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedLeadQuery } from '../leads/query';
import { scopedJobQuery } from '../jobs/query';
import { leadActivityActionSQL, jobActivityActionSQL } from '../activity-summary';

const count = z.coerce.number().int().nonnegative().refine(Number.isSafeInteger);
const activeStatuses = ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const;
const leadRow = z.object({
  id: z.uuid(), number: z.string(), name: z.string(), service: z.string(), createdAt: z.date(),
});
const jobRow = z.object({
  id: z.uuid(), number: z.string(), title: z.string(), customerName: z.string(), ownerName: z.string(),
  status: z.enum(activeStatuses), completionDeadline: z.string().nullable(), scheduledDate: z.string().nullable(),
  updatedAt: z.date(), overdue: z.boolean(),
});
export type HomeJob = z.infer<typeof jobRow>;
export async function homeClock(trx: Knex.Transaction, context: AuthorizationContext) {
  if (!authorize(context, { permission: 'home.access' }).allowed) throw new AuthorizationAccessError();
  return z.object({ timezone: z.string().min(1), today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(
    await trx('workspaces').where({ id: context.workspaceId }).select('timezone',
      trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first());
}
export async function readHomeLeadsInTransaction(trx: Knex.Transaction, context: AuthorizationContext, today: string, timezone: string) {
  const { query, scope } = scopedLeadQuery(trx, context);
  if (context.membership.role === 'field') query.where('l.ownerId', context.userId);
  query.whereNull('l.archivedAt');
  const groups = z.array(z.object({ stage: z.enum(leadStages), count })).parse(
    await query.clone().select('l.stage').count('* as count').groupBy('l.stage'));
  const pipeline = { new: 0, contacted: 0, 'estimate-sent': 0, won: 0, lost: 0 };
  for (const group of groups) pipeline[group.stage] = group.count;
  const newLeads = count.parse((await query.clone()
    .whereRaw(`l."createdAt" >= ((?::date - 29)::timestamp AT TIME ZONE ?) AND l."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`, [today, timezone, today, timezone])
    .count('* as count').first())?.count);
  const unassigned = query.clone().whereIn('l.stage', ['new', 'contacted', 'estimate-sent'])
    .whereNotExists(trx('workspaceMemberships as m').select(trx.raw('1')).whereRaw('m."workspaceId"=l."workspaceId" AND m."userId"=l."ownerId"'));
  const unassignedTotal = count.parse((await unassigned.clone().count('* as count').first())?.count);
  const attention = z.array(leadRow).parse(await unassigned.select('l.id', 'l.name', 'l.service', 'l.createdAt',
    trx.raw(`'LD-' || lpad(l."leadNumber"::text, greatest(4,length(l."leadNumber"::text)), '0') AS number`))
    .orderBy('l.createdAt').orderBy('l.id').limit(5));
  return { pipeline, newLeads, unassignedTotal, attention, scope: context.membership.role === 'field' ? 'assigned' as const : scope };
}
export async function readHomeJobsInTransaction(trx: Knex.Transaction, context: AuthorizationContext, today: string) {
  const { query, scope } = scopedJobQuery(trx, context, context.membership.role === 'field');
  query.whereIn('j.status', activeStatuses);
  const needsAttention = (q: Knex.QueryBuilder) => q.where(builder => builder
    .where('j.completionDeadline', '<', today).orWhereIn('j.status', ['waiting', 'needs-scheduling']));
  const totals = z.object({ active: count, attention: count }).parse(await query.clone().select(trx.raw(
    `count(*) AS active, count(*) FILTER (WHERE j."completionDeadline" < ?::date OR j.status IN ('waiting','needs-scheduling')) AS attention`, [today])).first());
  const select = (q: Knex.QueryBuilder) => q.leftJoin('workspaceMemberships as m', join => join.on('m.workspaceId', 'j.workspaceId').andOn('m.userId', 'j.primaryOwnerId'))
    .leftJoin('users as u', 'u.id', 'm.userId').select('j.id', 'j.title', 'j.customerName', 'j.status', 'j.updatedAt', trx.raw(
      `'J-' || lpad(j."jobNumber"::text, greatest(4,length(j."jobNumber"::text)), '0') AS number,
       CASE WHEN j."primaryOwnerId" IS NULL THEN 'Unassigned' WHEN u.id IS NULL OR u."deletionRequestedAt" IS NOT NULL THEN 'Former teammate' ELSE u.name END AS "ownerName",
       to_char(j."completionDeadline",'YYYY-MM-DD') AS "completionDeadline", to_char(j."scheduledDate",'YYYY-MM-DD') AS "scheduledDate",
       coalesce(j."completionDeadline" < ?::date, false) AS overdue`, [today]));
  const jobs = z.array(jobRow).parse(await select(query.clone()).orderByRaw(
    `CASE WHEN j."completionDeadline" < ?::date THEN 0 WHEN j."scheduledDate" = ?::date THEN 1 ELSE 2 END,
     j."completionDeadline" ASC NULLS LAST, j."jobNumber" ASC, j.id ASC`, [today, today]).limit(5));
  const attention = z.array(jobRow).parse(await select(needsAttention(query.clone())).orderByRaw(
    `CASE WHEN j."completionDeadline" < ?::date THEN 0 ELSE 1 END,
     CASE WHEN j."completionDeadline" < ?::date THEN j."completionDeadline" END ASC,
     j."updatedAt" ASC, j."jobNumber" ASC, j.id ASC`, [today, today]).limit(5));
  return { ...totals, jobs, attentionItems: attention, scope };
}
export function canReadHomeWorkload(context: AuthorizationContext) {
  const leads = resolveAuthorizedCollectionScope(context, 'leads.read');
  const jobs = resolveAuthorizedCollectionScope(context, 'jobs.read');
  // Reuse the explicit roster grant used by the canonical lead list, not implicit role privileges.
  const roster = authorize(context, { permission: 'leads.assign', resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed;
  return context.membership.role !== 'field' && roster && leads.allowed && leads.scope === 'workspace' && jobs.allowed && jobs.scope === 'workspace';
}
export async function readHomeWorkloadInTransaction(trx: Knex.Transaction, context: AuthorizationContext) {
  if (!canReadHomeWorkload(context)) throw new AuthorizationAccessError();
  const roster = trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
    .where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt');
  const total = count.parse((await roster.clone().count('* as count').first())?.count);
  const leads = scopedLeadQuery(trx, context).query.whereNull('l.archivedAt').whereIn('l.stage', ['new', 'contacted', 'estimate-sent']);
  const jobs = scopedJobQuery(trx, context).query.whereIn('j.status', activeStatuses);
  const leadSQL = leads.select('l.ownerId').toSQL(), jobSQL = jobs.select('j.id', 'j.workspaceId', 'j.primaryOwnerId').toSQL();
  const items = z.array(z.object({ id: z.string(), name: z.string(), activeJobs: count, openLeads: count })).parse(
    await roster.select('u.id', 'u.name', trx.raw(
      `(SELECT count(*) FROM (${leadSQL.sql}) l WHERE l."ownerId"=u.id) AS "openLeads",
       (SELECT count(*) FROM (${jobSQL.sql}) j WHERE j."primaryOwnerId"=u.id OR EXISTS
         (SELECT 1 FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id AND t."userId"=u.id)) AS "activeJobs"`,
      [...leadSQL.bindings, ...jobSQL.bindings]))
      .orderBy('activeJobs', 'desc').orderBy('openLeads', 'desc').orderBy('u.name').orderBy('u.id').limit(5));
  return { total, items };
}
/** Latest native events across currently readable parents, without Reports permissions or note payloads. */
export async function readHomeActivityInTransaction(trx: Knex.Transaction, context: AuthorizationContext) {
  const sources: { sql: string; bindings: readonly Knex.RawBinding[] }[] = [];
  const leadScope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (leadScope.allowed) {
    const parents = scopedLeadQuery(trx, context).query;
    if (context.membership.role === 'field') parents.where('l.ownerId', context.userId);
    if (!authorize(context, { permission: 'leads.archive', resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed) parents.whereNull('l.archivedAt');
    sources.push(parents.join('leadActivity as h', join => join.on('h.workspaceId', 'l.workspaceId').andOn('h.leadId', 'l.id'))
      .whereNot('h.type', 'note').where('h.createdAt', '<=', trx.raw('CURRENT_TIMESTAMP'))
      .select(trx.raw(`'lead'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt", h."actorId", h."actorType" AS source,
        l.id AS "recordId", left('LD-' || lpad(l."leadNumber"::text, greatest(4,length(l."leadNumber"::text)), '0') || ' / ' || l.name,160) AS "recordLabel",
        ${leadActivityActionSQL} AS action`)).orderBy('h.createdAt', 'desc').orderBy('h.id').limit(5).toSQL());
  }
  const jobScope = resolveAuthorizedCollectionScope(context, 'jobs.read');
  if (jobScope.allowed) {
    sources.push(scopedJobQuery(trx, context, context.membership.role === 'field').query
      .join('jobActivity as h', join => join.on('h.workspaceId', 'j.workspaceId').andOn('h.jobId', 'j.id'))
      .whereNot('h.type', 'note').where('h.createdAt', '<=', trx.raw('CURRENT_TIMESTAMP'))
      .select(trx.raw(`'job'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt", h."actorId", h.source,
        j.id AS "recordId", left('J-' || lpad(j."jobNumber"::text, greatest(4,length(j."jobNumber"::text)), '0') || ' / ' || j.title,160) AS "recordLabel",
        ${jobActivityActionSQL} AS action`)).orderBy('h.createdAt', 'desc').orderBy('h.id').limit(5).toSQL());
  }
  if (!sources.length) throw new AuthorizationAccessError();
  const result = await trx.raw<{ rows: { event: unknown; valid: boolean }[] }>(
    `WITH native AS (${sources.map(source => `(${source.sql})`).join(' UNION ALL ')}),
     recent AS (SELECT * FROM native ORDER BY "occurredAt" DESC, domain COLLATE "C", "eventId" LIMIT 5)
     SELECT ((n.domain='lead' AND n.source IN ('user','assistant-confirmed','system')) OR
       (n.domain='job' AND n.source IN ('ui','assistant-confirmed','system'))) AS valid,
       jsonb_build_object('domain',n.domain,'eventId',n."eventId",'action',n.action,'recordId',n."recordId",'recordLabel',n."recordLabel",
         'occurredAt',to_char(n."occurredAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
         'actor',CASE WHEN n.source='system' THEN jsonb_build_object('kind','system','key','system','label','System')
           ELSE jsonb_build_object('kind','member','key',CASE WHEN m."userId" IS NOT NULL AND u."deletionRequestedAt" IS NULL THEN 'member:' || u.id ELSE 'unavailable-actor' END,
             'label',CASE WHEN m."userId" IS NOT NULL AND u."deletionRequestedAt" IS NULL THEN left(btrim(u.name),100) ELSE 'Former or unavailable actor' END) END) AS event
       FROM recent n LEFT JOIN "workspaceMemberships" m ON m."workspaceId"=? AND m."userId"=n."actorId"
       LEFT JOIN users u ON u.id=m."userId"
       ORDER BY n."occurredAt" DESC,n.domain COLLATE "C",n."eventId"`,
    [...sources.flatMap(source => [...source.bindings]), context.workspaceId]);
  return result.rows.map(row => {
    if (!row.valid) throw new Error('Unsupported native Home activity source.');
    return activityReportEventSchema.parse(row.event);
  });
}
