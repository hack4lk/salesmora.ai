import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { activityReportEventSchema, activityReportQuerySchema, activityReportResultSchema, reportActivityDomains,
  type ActivityReportQuery, type ActivityReportResult, type AuthorizationContext } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedLeadQuery } from '../leads/query';
import { scopedJobQuery } from '../jobs/query';
import { customerCapabilities } from '../customers/store';
import { scoped as scopedWorkOrderQuery } from '../work-orders/store';
import { estimateReportContext } from './estimate-context';
import { estimateActivityReportActionSQL, validateEstimateReportActivity } from './activity-estimates';
import { resolveActivityReportExportScopes } from './activity-export-access';
import { leadActivityActionSQL, jobActivityActionSQL } from '../activity-summary';

const estimateValidationSchema = z.object({
  id: z.uuid(), createdAt: z.string(), source: z.string(), actorName: z.null(), type: z.string(), changes: z.unknown(),
});

/** Native histories only: authorize surviving parents before dates, validation, facets, totals or pagination. */
export async function prepareActivityReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: ActivityReportQuery, mode: 'read' | 'export' = 'read',
) {
  const query = activityReportQuerySchema.parse(rawQuery);
  const exportScopes = mode === 'export' ? resolveActivityReportExportScopes(context) : undefined;
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (query.workspaceId !== context.workspaceId || !report.allowed || report.resourceKind !== 'report') {
    throw new AuthorizationAccessError();
  }
  const clock = await trx('workspaces').where({ id: context.workspaceId }).select('timezone',
    trx.raw('CURRENT_TIMESTAMP AS "asOf"'),
    trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.timezone !== 'string' || !(clock.asOf instanceof Date) || typeof clock.today !== 'string') {
    throw new Error('The workspace Activity clock is unavailable.');
  }
  if (query.period.to > clock.today) throw new RangeError('Activity periods cannot extend beyond business-local today.');
  const datePredicate = `h."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
    h."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?) AND h."createdAt" <= CURRENT_TIMESTAMP`;
  const dateBindings = [query.period.from, clock.timezone, query.period.to, clock.timezone];
  const includedDomains: ActivityReportResult['includedDomains'] = [];
  const sources: { sql: string; bindings: readonly Knex.RawBinding[] }[] = [];
  const lead = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (lead.allowed && report.sourceScopes?.lead && (!exportScopes || exportScopes.lead)) {
    const { query: parents, scope } = scopedLeadQuery(trx, context);
    const assigned = scope === 'assigned' || report.sourceScopes.lead === 'assigned' || exportScopes?.lead === 'assigned';
    if (assigned) parents.where('l.ownerId', context.userId);
    const archived = authorize(context, { permission: 'leads.archive',
      resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null } }).allowed;
    if (!archived) parents.whereNull('l.archivedAt');
    includedDomains.push({ domain: 'lead', scope: assigned ? 'assigned' : 'workspace', archiveVisibility: archived ? 'included' : 'excluded' });
    sources.push(parents.join('leadActivity as h', q => q.on('h.leadId', 'l.id').andOn('h.workspaceId', 'l.workspaceId'))
      .whereNot('h.type', 'note')
      .whereRaw(datePredicate, dateBindings)
      .select(trx.raw(`'lead'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", h."actorName", h."actorType" AS source, h.type, l.id AS "recordId", NULL::jsonb AS validation,
        left('Lead L-' || l."leadNumber"::text || ' / ' || l.name, 160) AS "recordLabel",
        ${leadActivityActionSQL} AS action`))
      .toSQL());
  }
  const jobs = resolveAuthorizedCollectionScope(context, 'jobs.read');
  if (jobs.allowed && report.sourceScopes?.job && (!exportScopes || exportScopes.job)) {
    const { query: parents, scope } = scopedJobQuery(trx, context,
      report.sourceScopes.job === 'assigned' || exportScopes?.job === 'assigned');
    includedDomains.push({ domain: 'job', scope, archiveVisibility: 'not-applicable' });
    sources.push(parents.join('jobActivity as h', q => q.on('h.jobId', 'j.id').andOn('h.workspaceId', 'j.workspaceId'))
      .whereNot('h.type', 'note')
      .whereRaw(datePredicate, dateBindings)
      .select(trx.raw(`'job'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", h."actorName", h.source, h.type, j.id AS "recordId", NULL::jsonb AS validation,
        left('Job J-' || j."jobNumber"::text || ' / ' || j.title, 160) AS "recordLabel",
        ${jobActivityActionSQL} AS action`))
      .toSQL());
  }
  const customers = customerCapabilities(context);
  if (report.scope === 'workspace' && customers.read && (!exportScopes || exportScopes.customer)) {
    const parents = trx('customers as c').where('c.workspaceId', context.workspaceId);
    if (!customers.archive) parents.whereNull('c.archivedAt');
    includedDomains.push({ domain: 'customer', scope: 'workspace', archiveVisibility: customers.archive ? 'included' : 'excluded' });
    sources.push(parents.join('customerActivity as h', q => q.on('h.customerId', 'c.id').andOn('h.workspaceId', 'c.workspaceId'))
      .whereNot('h.type', 'note')
      .whereRaw(datePredicate, dateBindings)
      .select(trx.raw(`'customer'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", NULL::text AS "actorName", 'unrecorded'::text AS source, h.type, c.id AS "recordId", NULL::jsonb AS validation,
        left('Customer CU-' || CASE WHEN length(c."customerNumber"::text) < 4
          THEN lpad(c."customerNumber"::text, 4, '0') ELSE c."customerNumber"::text END || ' / ' || c.name, 160) AS "recordLabel",
        CASE h.type WHEN 'created' THEN 'created' WHEN 'updated' THEN 'updated'
          WHEN 'archived' THEN 'archived' WHEN 'restored' THEN 'updated'
          WHEN 'linked' THEN 'updated' WHEN 'unlinked' THEN 'updated' END AS action`)).toSQL());
  }
  const estimates = resolveAuthorizedCollectionScope(context, 'estimates.read');
  const assignedEstimates = report.scope === 'assigned' || estimates.allowed && estimates.scope === 'assigned_job';
  if (estimates.allowed && (!assignedEstimates || report.sourceScopes?.job) && (!exportScopes || exportScopes.estimate)) {
    const auth = await estimateReportContext(trx, context, exportScopes?.estimate === 'assigned');
    const parents = auth.scoped;
    if (!auth.includeArchived) parents.whereNull('e.archivedAt');
    includedDomains.push({ domain: 'estimate', scope: auth.assigned ? 'assigned' : 'workspace',
      archiveVisibility: auth.includeArchived ? 'included' : 'excluded' });
    sources.push(parents.join('estimate_activity as h', q => q.on('h.estimateId', 'e.id').andOn('h.workspaceId', 'e.workspaceId'))
      .whereRaw(datePredicate, dateBindings)
      .select(trx.raw(`'estimate'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", NULL::text AS "actorName", h.source, h.type, e.id AS "recordId",
        jsonb_build_object('id', h.id, 'createdAt', h."createdAt", 'source', h.source,
          'actorName', NULL, 'type', h.type, 'changes', h.changes) AS validation,
        left('Estimate EST-' || CASE WHEN length(e."estimateNumber"::text) < 4
          THEN lpad(e."estimateNumber"::text, 4, '0') ELSE e."estimateNumber"::text END ||
          ' / revision ' || e.revision::text || ' / ' || e.name, 160) AS "recordLabel"`),
      estimateActivityReportActionSQL(trx)).toSQL());
  }
  const workOrders = resolveAuthorizedCollectionScope(context, 'workorders.read');
  if (workOrders.allowed && (!exportScopes || exportScopes['work-order'])) {
    const assigned = report.scope === 'assigned' || workOrders.scope === 'assigned_job' || exportScopes?.['work-order'] === 'assigned';
    const parents = scopedWorkOrderQuery(trx, context, assigned);
    includedDomains.push({ domain: 'work-order', scope: assigned ? 'assigned' : 'workspace', archiveVisibility: 'included' });
    sources.push(parents.join('workOrderActivity as h', q => q.on('h.workOrderId', 'w.id').andOn('h.workspaceId', 'w.workspaceId'))
      .whereNot('h.type', 'note')
      .whereRaw(datePredicate, dateBindings)
      .select(trx.raw(`'work-order'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", NULL::text AS "actorName", h.source, h.type, w.id AS "recordId", NULL::jsonb AS validation,
        left('Work Order WO-' || CASE WHEN length(w."workOrderNumber"::text) < 4
          THEN lpad(w."workOrderNumber"::text, 4, '0') ELSE w."workOrderNumber"::text END || ' / ' || w.title, 160) AS "recordLabel",
        CASE WHEN jsonb_typeof(h.changes) = 'object' THEN CASE h.type
          WHEN 'created' THEN 'created' WHEN 'edit' THEN 'updated'
          WHEN 'tasks' THEN 'updated' WHEN 'materials' THEN 'updated'
          WHEN 'file_uploaded' THEN 'updated' WHEN 'file_removed' THEN 'updated'
          WHEN 'assign' THEN 'assignment-changed'
          WHEN 'schedule' THEN 'visit-changed' WHEN 'visit-linked' THEN 'visit-changed' WHEN 'visit-separated' THEN 'visit-changed'
          WHEN 'status' THEN CASE WHEN h.changes->>'to' IN ('issued','in-progress','canceled') THEN 'status-changed' END
          WHEN 'complete' THEN CASE WHEN h.changes->>'to' = 'completed' THEN 'completed' END
          WHEN 'reopen' THEN CASE WHEN h.changes->>'to' IN ('draft','in-progress') THEN 'status-changed' END
          WHEN 'archive' THEN CASE WHEN h.changes->'archived' = 'true'::jsonb THEN 'archived'
            WHEN h.changes->'archived' = 'false'::jsonb THEN 'updated' END
          WHEN 'task-toggle' THEN CASE WHEN jsonb_typeof(h.changes->'done') = 'boolean' THEN
            CASE WHEN NOT (jsonb_exists(h.changes, 'from') OR jsonb_exists(h.changes, 'to')) THEN 'updated'
              WHEN h.changes->>'from' = 'issued' AND h.changes->>'to' = 'in-progress'
                AND h.changes->'done' = 'true'::jsonb THEN 'status-changed' END END
        END END AS action`)).toSQL());
  }
  if (!includedDomains.length || query.filters.domains.some(domain => !includedDomains.some(item => item.domain === domain))) {
    throw new AuthorizationAccessError();
  }
  type Projection = {
    invalid: string; invalidActors: string; invalidSelection: boolean; total: string; page: number;
    options: unknown; rows: unknown; validation: unknown;
  };
  const commonSQL = `WITH native AS MATERIALIZED (${sources.map(source => source.sql).join(' UNION ALL ')}),
    dated AS MATERIALIZED (
      SELECT n.*, CASE WHEN n.source IN ('system','worker') THEN 'system'
        WHEN m."userId" IS NOT NULL AND u."deletionRequestedAt" IS NULL THEN 'member:' || u.id
        ELSE 'unavailable-actor' END AS "actorKey",
        CASE WHEN n.source IN ('system','worker') THEN 'System'
          WHEN m."userId" IS NOT NULL AND u."deletionRequestedAt" IS NULL THEN left(btrim(u.name), 100)
          ELSE 'Former or unavailable actor' END AS "actorLabel"
      FROM native n LEFT JOIN "workspaceMemberships" m ON m."workspaceId" = ? AND m."userId" = n."actorId"
      LEFT JOIN users u ON u.id = m."userId"
    ),
    options AS (
      SELECT jsonb_build_object('domains', ?::jsonb,
        'actions', COALESCE((SELECT jsonb_agg(action ORDER BY action) FROM (SELECT DISTINCT action FROM dated WHERE action IS NOT NULL) a), '[]'::jsonb),
        'actors', COALESCE((SELECT jsonb_agg(jsonb_build_object('value', "actorKey", 'label', "actorLabel") ORDER BY "actorKey")
          FROM (SELECT DISTINCT "actorKey", "actorLabel" FROM dated) a), '[]'::jsonb)) AS value
    ),
    selectedDomains AS MATERIALIZED (SELECT * FROM dated WHERE cardinality(?::text[]) = 0 OR domain = ANY(?::text[])),
    filtered AS MATERIALIZED (SELECT * FROM selectedDomains WHERE
      (cardinality(?::text[]) = 0 OR action = ANY(?::text[])) AND
      (cardinality(?::text[]) = 0 OR "actorKey" = ANY(?::text[])))`;
  const statement = `${commonSQL},
    paging AS (SELECT count(*) AS total, LEAST(?::int, GREATEST(1, ceil(count(*)::numeric / ?::int)::int)) AS page FROM filtered),
    pageRows AS (SELECT * FROM filtered ORDER BY "occurredAt" DESC, domain COLLATE "C", "eventId"
      LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)),
    projection AS (
    SELECT (SELECT count(*)::text FROM selectedDomains WHERE action IS NULL OR
      (domain = 'lead' AND source NOT IN ('user','assistant-confirmed','system')) OR
      (domain = 'job' AND source NOT IN ('ui','assistant-confirmed','system')) OR
      (domain = 'customer' AND source <> 'unrecorded') OR
      (domain = 'estimate' AND source NOT IN ('ui','assistant-confirmed','worker','system')) OR
      (domain = 'work-order' AND source NOT IN ('ui','assistant-confirmed','system')) OR
      btrim("recordLabel") = '' OR "recordLabel" ~ '[[:cntrl:]]') AS invalid,
      (SELECT count(*)::text FROM dated WHERE btrim("actorLabel") = '' OR "actorLabel" ~ '[[:cntrl:]]') AS "invalidActors",
      EXISTS (SELECT 1 FROM unnest(?::text[]) a WHERE NOT EXISTS (SELECT 1 FROM dated WHERE action = a)) OR
      EXISTS (SELECT 1 FROM unnest(?::text[]) a WHERE NOT EXISTS (SELECT 1 FROM dated WHERE "actorKey" = a)) AS "invalidSelection",
      paging.total::text, paging.page, options.value AS options,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('domain', domain, 'eventId', "eventId",
        'occurredAt', to_char("occurredAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
        'action', action, 'actor', jsonb_build_object('kind', CASE WHEN "actorKey" = 'system' THEN 'system' ELSE 'member' END,
          'key', "actorKey", 'label', "actorLabel"), 'recordId', "recordId", 'recordLabel', "recordLabel")
        ORDER BY "occurredAt" DESC, domain COLLATE "C", "eventId") FROM pageRows), '[]'::jsonb) AS rows
    FROM paging CROSS JOIN options)
    SELECT projection.*, checks.validation FROM projection
      LEFT JOIN (SELECT validation FROM selectedDomains WHERE domain = 'estimate') checks ON TRUE`;
  const commonBindings = [...sources.flatMap(source => [...source.bindings]), context.workspaceId,
    JSON.stringify(includedDomains.map(item => item.domain)),
    query.filters.domains, query.filters.domains, query.filters.actions, query.filters.actions,
    query.filters.actors, query.filters.actors];
  const bindings = [...commonBindings, query.page, query.pageSize, query.pageSize, query.pageSize, query.filters.actions, query.filters.actors];
  const cursor = `activity_${randomUUID().replaceAll('-', '')}`;
  let row: Projection | undefined;
  await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [cursor, ...bindings]);
  try {
    let batch = await trx.raw<{ rows: Projection[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
    while (batch.rows.length) {
      for (const projection of batch.rows) {
        row ??= projection;
        if (projection.invalid !== '0' || projection.invalidActors !== '0') {
          throw new Error('Authorized Activity contains an unsupported event type, source or actor. Open the record history and retry.');
        }
        if (projection.validation !== null) {
          validateEstimateReportActivity(estimateValidationSchema.parse(projection.validation));
        }
      }
      batch = await trx.raw<{ rows: Projection[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
    }
  } finally {
    await trx.raw('CLOSE ??', [cursor]);
  }
  if (!row) throw new Error('The database returned no Activity projection.');
  if (row.invalidSelection) throw new AuthorizationAccessError();
  const result = activityReportResultSchema.parse({
    workspaceId: context.workspaceId, view: 'activity', from: query.period.from, to: query.period.to,
    today: clock.today, asOf: clock.asOf.toISOString(), timezone: clock.timezone,
    scopeLabel: 'Native Lead/Job/Customer/Estimate/Work Order events on currently authorized surviving parents. Customer history requires workspace Reports and full Customer read; assigned Reports omit it. Notes and linked-Lead copies excluded. Estimate history includes surviving revisions and drafts, not just the latest effective decision. Work Order history uses current primary/crew or assigned parent Job access, excludes assigned Drafts and includes readable archives without requiring archive mutation authority. Events are not unique business actions or productivity.',
    includedDomains,
    omittedDomains: reportActivityDomains.filter(domain => !includedDomains.some(item => item.domain === domain))
      .map(domain => ({ domain, reason: 'permissions' })),
    filters: query.filters, options: row.options, total: Number(row.total), rows: row.rows, page: row.page, pageSize: query.pageSize,
  });
  async function* evidence(signal?: AbortSignal) {
    const cursor = `activity_evidence_${randomUUID().replaceAll('-', '')}`;
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${commonSQL}
      SELECT jsonb_build_object('domain', domain, 'eventId', "eventId",
        'occurredAt', to_char("occurredAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
        'action', action, 'actor', jsonb_build_object('kind', CASE WHEN "actorKey" = 'system' THEN 'system' ELSE 'member' END,
          'key', "actorKey", 'label', "actorLabel"), 'recordId', "recordId", 'recordLabel', "recordLabel") AS row
      FROM filtered ORDER BY "occurredAt" DESC, domain COLLATE "C", "eventId"`, [cursor, ...commonBindings]);
    try {
      while (true) {
        signal?.throwIfAborted();
        const batch = await trx.raw<{ rows: { row: unknown }[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
        if (!batch.rows.length) break;
        for (const item of batch.rows) {
          signal?.throwIfAborted();
          yield activityReportEventSchema.parse(item.row);
        }
      }
    } finally { await trx.raw('CLOSE ??', [cursor]); }
  }
  return { report: result, evidence };
}

/** Native histories only: authorize surviving parents before dates, validation, facets, totals or pagination. */
export async function readActivityReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: ActivityReportQuery,
): Promise<ActivityReportResult> {
  return (await prepareActivityReportInTransaction(trx, context, rawQuery)).report;
}
