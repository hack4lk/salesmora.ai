import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import {
  leadSourceQuerySchema, leadSourceResultSchema, leadSources,
  type AuthorizationContext, type LeadSourceQuery, type LeadSourceResult,
} from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedJobQuery } from '../jobs/query';
import { leadReportContext } from './leads';
import { estimateReportContext } from './estimate-context';
import { sourceAcceptedEstimatesQuery, sourceEstimateEvidence, type SourceEstimateRows } from './source-estimates';

type SourceReportContext = Awaited<ReturnType<typeof leadReportContext>>;

export function sourceLeadCohortQuery(
  trx: Knex.Transaction, auth: SourceReportContext, period: LeadSourceQuery['period'],
) {
  return auth.scoped.clone()
    .modify(records => { if (auth.archiveVisibility === 'excluded') records.whereNull('l.archivedAt'); })
    .whereRaw(`l."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
      l."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`,
    [period.from, auth.timezone, period.to, auth.timezone])
    .select('l.id', 'l.name', 'l.leadNumber', 'l.source', 'l.createdAt', 'l.archivedAt');
}

export function sourceLeadNumberLabelExpression() {
  return `'L-' || CASE WHEN length(l."leadNumber"::text) < 4
    THEN lpad(l."leadNumber"::text, 4, '0') ELSE l."leadNumber"::text END`;
}

export function sourceJobNumberLabelExpression() {
  return `'J-' || CASE WHEN length(j."jobNumber"::text) < 4
    THEN lpad(j."jobNumber"::text, 4, '0') ELSE j."jobNumber"::text END`;
}

/** One statement snapshot reconciles creation cohorts, conversion and frozen accepted-family attribution. */
export async function readLeadSourceReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: LeadSourceQuery,
): Promise<LeadSourceResult> {
  const query = leadSourceQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await leadReportContext(trx, context);
  if (query.period.to > auth.today) throw new RangeError('Choose a source-cohort period ending no later than business-local today.');
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const jobs = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const conversionAvailable = report.allowed && report.scope === 'workspace' &&
    auth.scope === 'workspace' && auth.archiveVisibility === 'included' &&
    report.sourceScopes?.job === 'workspace' && jobs.allowed && jobs.scope === 'workspace';
  if (query.selected === 'converted' && !conversionAvailable) throw new AuthorizationAccessError();
  const estimateAccess = resolveAuthorizedCollectionScope(context, 'estimates.read');
  const estimateAuth = conversionAvailable && estimateAccess.allowed && estimateAccess.scope === 'workspace'
    ? await estimateReportContext(trx, context) : undefined;
  const moneyAvailable = estimateAuth !== undefined && !estimateAuth.assigned && estimateAuth.includeArchived;
  if (query.selected === 'accepted-estimates' && !moneyAvailable) throw new AuthorizationAccessError();
  const cohort = sourceLeadCohortQuery(trx, auth, query.period).toSQL();
  // Never query hidden supporting links when the complete cross-domain projection is unavailable.
  const supporting = conversionAvailable ? scopedJobQuery(trx, context).query
    .whereIn('j.sourceLeadId', trx.select('id').from('cohort'))
    .select('j.id', 'j.sourceLeadId', 'j.jobNumber').toSQL() : undefined;
  const accepted = moneyAvailable ? sourceAcceptedEstimatesQuery(trx, estimateAuth.query, auth.timezone).toSQL() : undefined;
  const statement = `WITH cohort AS MATERIALIZED (${cohort.sql}),
     ${supporting ? `conversionJobs AS MATERIALIZED (${supporting.sql}),` : ''}
     cohortLeads AS MATERIALIZED (
       SELECT l.*, ${supporting ? `EXISTS (SELECT 1 FROM conversionJobs j WHERE j."sourceLeadId" = l.id)` : 'NULL::boolean'} AS converted
       FROM cohort l
     ),
     sources AS (SELECT unnest(?::text[]) AS source),
     groups AS (
       SELECT s.source, count(l.id) AS cohort,
         ${supporting ? 'count(l.id) FILTER (WHERE l.converted)' : 'NULL::bigint'} AS converted
       FROM sources s LEFT JOIN cohortLeads l ON l.source = s.source GROUP BY s.source
     ),
     evidence AS MATERIALIZED (SELECT * FROM cohortLeads ${query.selected === 'converted' ? 'WHERE converted' : ''}),
     paging AS (
       SELECT count(*) AS total, LEAST(?::int, GREATEST(1, CEIL(count(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (SELECT * FROM evidence ORDER BY "createdAt", id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)),
     projection AS (
     SELECT (SELECT count(*)::text FROM cohortLeads) AS cohort,
       ${supporting ? '(SELECT count(*)::text FROM cohortLeads WHERE converted)' : 'NULL::text'} AS converted,
       (SELECT jsonb_agg(jsonb_build_object('source', source, 'cohort', cohort, 'converted', converted,
         'acceptedEstimateCount', NULL, 'acceptedValueCents', NULL) ORDER BY array_position(?::text[], source)) FROM groups) AS groups,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', l.id, 'recordId', l.id,
         'label', ${sourceLeadNumberLabelExpression()} || ' / ' || l.name,
         'createdDate', to_char(l."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD'), 'source', l.source,
         'archived', l."archivedAt" IS NOT NULL) ${query.selected === 'converted'
    ? `|| jsonb_build_object('linkedJobs', (SELECT string_agg(${sourceJobNumberLabelExpression()},
         ', ' ORDER BY j."jobNumber", j.id) FROM conversionJobs j WHERE j."sourceLeadId" = l.id))` : ''}
         ORDER BY l."createdAt", l.id) FROM pageRows l), '[]'::jsonb) AS rows,
       paging.total::text, paging.page FROM paging)
     ${accepted ? `, accepted AS MATERIALIZED (${accepted.sql})` : ''}
     SELECT projection.*, ${accepted ? 'to_jsonb(a)' : 'NULL::jsonb'} AS estimate
     FROM projection ${accepted ? 'LEFT JOIN accepted a ON TRUE ORDER BY a."acceptedDate" DESC, a.id' : ''}`;
  const bindings = [...cohort.bindings, ...(supporting?.bindings ?? []), [...leadSources],
    query.page, query.pageSize, query.pageSize, query.pageSize, [...leadSources], auth.timezone, ...(accepted?.bindings ?? [])];
  type Projection = { cohort: string; converted: string | null; groups: unknown; rows: unknown; total: string; page: number; estimate: unknown };
  let projection: Projection | undefined;
  const cursor = `source_value_${randomUUID().replaceAll('-', '')}`;
  let value: LeadSourceResult['acceptedValue'] = moneyAvailable
    ? { kind: 'available', preTaxCents: 0, estimateCount: 0, unattributedPreTaxCents: 0, unattributedCount: 0 }
    : { kind: 'unavailable', reason: 'permissions', explanation: 'Source estimate value requires complete workspace Lead, Job and Estimate access, including Lead and Estimate archives. No hidden estimate links were inspected.' };
  const sourceValues = new Map(leadSources.map(source => [source, { count: 0, cents: 0 }]));
  const requested: SourceEstimateRows = [];
  let final: SourceEstimateRows = [], estimateCount = 0;
  const offset = (query.page - 1) * query.pageSize;
  await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [cursor, ...bindings]);
  try {
    let batch = await trx.raw<{ rows: Projection[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
    while (batch.rows.length) {
      for (const row of batch.rows) {
        projection ??= row;
        if (row.estimate === null) continue;
        const item = sourceEstimateEvidence(row.estimate, context.workspaceId, auth.today);
        estimateCount++;
        if (!Number.isSafeInteger(estimateCount)) throw new RangeError('Source accepted-family count exceeds the safe integer range.');
        if (item.money.kind === 'unavailable') {
          value = { kind: 'unavailable', reason: 'invalid-money', explanation: item.money.explanation };
          continue;
        }
        const evidence = item.evidence;
        if (!evidence) throw new Error('The accepted source Estimate has no verified evidence.');
        if (value.kind === 'available') {
          value.estimateCount++;
          value.preTaxCents += evidence.preTaxCents;
          if (evidence.source === null) {
            value.unattributedCount++;
            value.unattributedPreTaxCents += evidence.preTaxCents;
          } else {
            const group = sourceValues.get(evidence.source)!;
            group.count++;
            group.cents += evidence.preTaxCents;
          }
          if (![value.preTaxCents, value.unattributedPreTaxCents].every(Number.isSafeInteger)) {
            value = { kind: 'unavailable', reason: 'invalid-money', explanation: 'Source accepted value exceeds the safe integer range.' };
          }
        }
        if ((estimateCount - 1) % query.pageSize === 0) final = [];
        final.push(evidence);
        if (estimateCount > offset && estimateCount <= offset + query.pageSize) requested.push(evidence);
      }
      batch = await trx.raw<{ rows: Projection[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
    }
  } finally {
    await trx.raw('CLOSE ??', [cursor]);
  }
  if (!projection) throw new Error('The database returned no lead-source cohort projection.');
  if (query.selected === 'accepted-estimates' && value.kind === 'unavailable') {
    throw new Error(`Accepted source-estimate evidence is unavailable: ${value.explanation}`);
  }
  const selectedMoney = query.selected === 'accepted-estimates';
  const page = selectedMoney ? Math.min(query.page, Math.max(1, Math.ceil(estimateCount / query.pageSize))) : projection.page;
  const groups = leadSourceResultSchema.shape.groups.parse(projection.groups);
  return leadSourceResultSchema.parse({
    workspaceId: context.workspaceId, view: 'lead-source', from: query.period.from, to: query.period.to,
    today: auth.today, timezone: auth.timezone, asOf: auth.asOf.toISOString(),
    scope: auth.scope, archiveVisibility: auth.archiveVisibility,
    scopeLabel: `${auth.scopeLabel} Grouped by current editable source, not immutable acquisition provenance. Conversion is current as of this snapshot.`,
    cohort: Number(projection.cohort),
    conversion: conversionAvailable ? { kind: 'available', converted: Number(projection.converted) }
      : { kind: 'unavailable', explanation: 'Conversion requires complete workspace Reports, Lead and Job access, including archived Leads. No hidden supporting links were inspected.' },
    acceptedValue: value,
    groups: groups.map(group => ({ ...group,
      acceptedEstimateCount: value.kind === 'available' ? sourceValues.get(group.source)!.count : null,
      acceptedValueCents: value.kind === 'available' ? sourceValues.get(group.source)!.cents : null,
    })),
    evidence: { kind: query.selected, rows: selectedMoney ? page === query.page ? requested : final : projection.rows },
    evidenceTotal: selectedMoney ? estimateCount : Number(projection.total), page, pageSize: query.pageSize,
  });
}
