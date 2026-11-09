import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import {
  leadReportQuerySchema,
  leadReportResultSchema,
  leadSources,
  leadStages,
  type AuthorizationContext,
  type LeadReportQuery,
  type LeadReportResult,
  leadReportExportInputSchema,
  type LeadReportExportInput,
} from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedLeadQuery } from '../leads/query';
import { resolveLeadReportExportScope } from './lead-export-access';

const openStages = ['new', 'contacted', 'estimate-sent'] as const;
const ageBands = ['0-7', '8-14', '15-30', '31+'] as const;
const outcomeCoverage = 'Only surviving recorded stage transitions are counted. Historical stage changes were not backfilled.';

type Filters = LeadReportQuery['filters'];
type Scope = 'workspace' | 'assigned';
type RawLead = {
  id: string;
  name: string;
  stage: string;
  source: string;
  ownerId: string | null;
  ownerName: string | null;
  memberId: string | null;
  createdAt: Date | string;
  lastActivityAt: Date | string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeCount(value: unknown): number {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Lead report count is outside the safe integer range.');
  return count;
}

function asDate(value: Date | string): Date {
  const result = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(result.getTime())) throw new Error('Lead report encountered an invalid timestamp.');
  return result;
}

function localDate(value: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: 'year' | 'month' | 'day') => parts.find(item => item.type === type)?.value;
  const year = part('year'), month = part('month'), day = part('day');
  if (!year || !month || !day) throw new Error('Could not resolve the workspace-local report date.');
  return `${year}-${month}-${day}`;
}

function dayDistance(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.floor((end - start) / 86_400_000);
}

function ageBand(age: number): typeof ageBands[number] {
  if (!Number.isSafeInteger(age) || age < 0) throw new Error('Lead report encountered a future-created lead.');
  return age <= 7 ? '0-7' : age <= 14 ? '8-14' : age <= 30 ? '15-30' : '31+';
}

export async function leadReportContext(trx: Knex.Transaction, context: AuthorizationContext, forceAssigned = false) {
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const domain = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!report.allowed || report.resourceKind !== 'report' ||
    !domain.allowed || domain.resourceKind !== 'lead' ||
    !report.sourceScopes?.lead) throw new AuthorizationAccessError();

  const { query: scoped, scope: domainScope } = scopedLeadQuery(trx, context);
  const scope: Scope = forceAssigned || report.sourceScopes.lead === 'assigned' || domainScope === 'assigned'
    ? 'assigned'
    : 'workspace';
  if (scope === 'assigned') scoped.andWhere('l.ownerId', context.userId);

  const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
  if (typeof workspace?.timezone !== 'string' || !workspace.timezone.trim()) {
    throw new Error('Workspace timezone is unavailable for the Leads report.');
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: workspace.timezone }).format();
  } catch (error) {
    if (error instanceof RangeError) throw new Error('Workspace timezone is invalid for the Leads report.', { cause: error });
    throw error;
  }
  const clock = await trx.raw('SELECT CURRENT_TIMESTAMP AS "asOf"');
  const asOf = asDate(clock.rows[0]?.asOf);
  const today = localDate(asOf, workspace.timezone);
  const archiveVisibility: 'included' | 'excluded' = authorize(context, {
    permission: 'leads.archive',
    resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null },
  }).allowed ? 'included' : 'excluded';
  const scopeLabel = [
    scope === 'assigned' ? 'Assigned Leads only.' : 'All Leads authorized by current domain access.',
    archiveVisibility === 'included' ? 'Archived Leads included where the selected report definition permits.' : 'Archived Leads excluded by your access.',
  ].join(' ');
  return { scoped, scope, timezone: workspace.timezone, asOf, today, archiveVisibility, scopeLabel };
}

function validatePeriod(query: { period: { from: string; to: string } }, today: string) {
  const { from, to } = query.period;
  const days = dayDistance(from, to) + 1;
  if (from > to || to > today || days < 1 || days > 366) {
    throw new RangeError('Choose an ordered Leads report period of at most 366 dates ending no later than today.');
  }
}

async function validatedOwners(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  filters: Filters,
  scope: Scope,
): Promise<string[]> {
  const selected = filters.owners.filter((owner): owner is string => owner !== 'me' && owner !== 'unassigned');
  if (scope === 'assigned' && selected.some(owner => owner !== context.userId)) throw new AuthorizationAccessError();
  if (selected.length) {
    const members = await trx('workspaceMemberships as m')
      .join('users as u', 'u.id', 'm.userId')
      .where('m.workspaceId', context.workspaceId)
      .whereIn('m.userId', selected)
      .whereNull('u.deletionRequestedAt')
      .select('m.userId');
    if (members.length !== selected.length) throw new AuthorizationAccessError();
  }
  return [...new Set(filters.owners.map(owner => owner === 'me' ? context.userId : owner).filter(owner => owner !== 'unassigned'))];
}

function applyFilters(
  trx: Knex.Transaction,
  query: Knex.QueryBuilder,
  filters: Filters,
  owners: readonly string[],
  scope: Scope,
  userId: string,
) {
  if (filters.stages.length) query.whereIn('l.stage', filters.stages);
  if (filters.sources.length) query.whereIn('l.source', filters.sources);
  if (owners.length || filters.owners.includes('unassigned')) {
    query.andWhere(function () {
      if (owners.length) this.whereIn('l.ownerId', owners);
      if (filters.owners.includes('unassigned')) {
        const unassigned = function (this: Knex.QueryBuilder) {
          this.whereNull('l.ownerId').orWhereNotExists(function () {
            this.select(trx.raw('1')).from('workspaceMemberships as ownerMembership')
              .whereRaw(`"ownerMembership"."workspaceId" = l."workspaceId"`)
              .whereRaw(`"ownerMembership"."userId" = l."ownerId"`);
          });
        };
        if (owners.length) this.orWhere(unassigned);
        else this.where(unassigned);
      }
    });
  }
  if (scope === 'assigned') query.andWhere('l.ownerId', userId);
  return query;
}

function applyPeriod(
  trx: Knex.Transaction,
  query: Knex.QueryBuilder,
  from: string,
  to: string,
  timezone: string,
) {
  return query.whereRaw(
    `l."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
     l."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`,
    [from, timezone, to, timezone],
  );
}

function attachLeadLabels(query: Knex.QueryBuilder) {
  return query
    .leftJoin('users as reportOwner', 'reportOwner.id', 'l.ownerId')
    .leftJoin('workspaceMemberships as reportMembership', function () {
      this.on('reportMembership.userId', 'l.ownerId')
        .andOn('reportMembership.workspaceId', 'l.workspaceId');
    })
    .select(
      'l.id',
      'l.name',
      'l.stage',
      'l.source',
      'l.ownerId',
      'l.createdAt',
      'l.lastActivityAt',
      'reportOwner.name as ownerName',
      'reportMembership.userId as memberId',
    );
}

function ownerLabel(row: RawLead): string {
  if (!row.ownerId) return 'No current primary owner';
  if (!row.memberId) return row.ownerName ? `${row.ownerName} (former)` : 'Former owner';
  return row.ownerName ?? 'Current owner';
}

function leadEvidence(row: RawLead, timezone: string, asOf: Date, extra: Record<string, string> = {}) {
  const createdAt = asDate(row.createdAt);
  const lastActivityAt = asDate(row.lastActivityAt);
  const ageDays = dayDistance(localDate(createdAt, timezone), localDate(asOf, timezone));
  ageBand(ageDays);
  return {
    id: row.id,
    label: row.name,
    recordId: row.id,
    cells: {
      created: localDate(createdAt, timezone),
      assignment: ownerLabel(row),
      source: row.source,
      stage: row.stage,
      activity: lastActivityAt.toISOString(),
      age: String(ageDays),
      ...extra,
    },
  };
}

type EvidenceRow = LeadReportResult['rows'][number];
type EvidenceProjection = { query: Knex.QueryBuilder; map: (row: unknown) => EvidenceRow };
type CaptureEvidence = (projection: EvidenceProjection) => void;

function effectivePage(total: number, requestedPage: number, pageSize: number): number {
  return Math.min(requestedPage, Math.max(1, Math.ceil(total / pageSize)));
}

async function selectLeadRows(
  query: Knex.QueryBuilder,
  trx: Knex.Transaction,
  timezone: string,
  asOf: Date,
  page: number,
  pageSize: number,
  capture?: CaptureEvidence,
) {
  const total = await countQuery(query.clone());
  const selectedPage = effectivePage(total, page, pageSize);
  const selection = attachLeadLabels(query)
    .orderBy('l.createdAt', 'desc')
    .orderBy('l.id', 'desc');
  capture?.({ query: selection.clone(), map: row => leadEvidence(row as RawLead, timezone, asOf) });
  const rows = await selection
    .offset((selectedPage - 1) * pageSize)
    .limit(pageSize) as RawLead[];
  return {
    page: selectedPage,
    rows: rows.map(row => leadEvidence(row, timezone, asOf)),
  };
}

async function countQuery(query: Knex.QueryBuilder): Promise<number> {
  const row = await query.count<{ count: string }[]>({ count: 'l.id' }).first();
  return safeCount(row?.count ?? 0);
}

function applyHistoricalArchive(
  query: Knex.QueryBuilder,
  archiveVisibility: 'included' | 'excluded',
) {
  if (archiveVisibility === 'excluded') query.whereNull('l.archivedAt');
  return query;
}

function applyCurrentOpen(query: Knex.QueryBuilder) {
  return query.whereNull('l.archivedAt').whereIn('l.stage', openStages);
}

async function readIntake(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  query: Extract<LeadReportQuery, { view: 'intake' }>,
  auth: Awaited<ReturnType<typeof leadReportContext>>,
  filters: Filters,
  owners: readonly string[],
  capture?: CaptureEvidence,
): Promise<LeadReportResult> {
  await validatePeriod(query, auth.today);
  if (query.trendBucket && (query.trendBucket < query.period.from || query.trendBucket > query.period.to)) {
    throw new RangeError('The selected intake trend date must be within the report period.');
  }
  const cohort = applyPeriod(trx,
    applyHistoricalArchive(applyFilters(trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId),
      auth.archiveVisibility),
    query.period.from,
    query.period.to,
    auth.timezone,
  );
  const total = await countQuery(cohort.clone());
  const sourceRows = await cohort.clone()
    .select('l.source')
    .count<{ source: string; count: string }[]>({ count: 'l.id' })
    .groupBy('l.source');
  const sources = leadSources.map(source => ({
    source,
    count: safeCount(sourceRows.find(row => row.source === source)?.count ?? 0),
  }));
  const trendRows = await cohort.clone()
    .select(trx.raw(`(l."createdAt" AT TIME ZONE ?)::date::text AS "date"`, [auth.timezone]))
    .count<{ date: string; count: string }[]>({ count: 'l.id' })
    .groupBy('date')
    .orderBy('date', 'asc');
  const trendByDate = new Map(trendRows.map(row => [row.date, safeCount(row.count)]));
  const trend: { date: string; count: number }[] = [];
  for (let offset = 0, days = dayDistance(query.period.from, query.period.to); offset <= days; offset++) {
    const date = new Date(Date.parse(`${query.period.from}T00:00:00Z`) + offset * 86_400_000)
      .toISOString().slice(0, 10);
    trend.push({ date, count: trendByDate.get(date) ?? 0 });
  }
  const evidenceQuery = cohort.clone();
  let evidenceTotal = total;
  if (query.trendBucket) {
    evidenceQuery.whereRaw(
      `(l."createdAt" AT TIME ZONE ?)::date = ?::date`,
      [auth.timezone, query.trendBucket],
    );
    evidenceTotal = await countQuery(evidenceQuery.clone());
  }
  const currentOwners = await validatedOwners(trx, context, query.currentFilters, auth.scope);
  const current = applyCurrentOpen(applyFilters(
    trx, auth.scoped.clone(), query.currentFilters, currentOwners, auth.scope, context.userId,
  ));
  const currentOpenLeads = await countQuery(current);
  const evidencePage = await selectLeadRows(evidenceQuery, trx, auth.timezone, auth.asOf, query.page, query.pageSize, capture);
  return leadReportResultSchema.parse({
    view: 'intake',
    ...resultContext(auth),
    from: query.period.from,
    to: query.period.to,
    total,
    sources,
    trend,
    currentOpenLeads,
    page: evidencePage.page,
    pageSize: query.pageSize,
    evidenceTotal,
    rows: evidencePage.rows,
  });
}

function resultContext(auth: Awaited<ReturnType<typeof leadReportContext>>) {
  return {
    asOf: auth.asOf.toISOString(),
    today: auth.today,
    timezone: auth.timezone,
    scopeLabel: auth.scopeLabel,
    archiveVisibility: auth.archiveVisibility,
  };
}

async function readPipeline(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  query: Extract<LeadReportQuery, { view: 'pipeline' | 'age' }>,
  auth: Awaited<ReturnType<typeof leadReportContext>>,
  filters: Filters,
  owners: readonly string[],
  capture?: CaptureEvidence,
): Promise<LeadReportResult> {
  const base = applyCurrentOpen(applyFilters(
    trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId,
  ));
  const futureCreated = await base.clone().where('l.createdAt', '>', auth.asOf).first('l.id');
  if (futureCreated) throw new Error('Lead report encountered a future-created lead.');
  const total = await countQuery(base.clone());
  const stageRows = await base.clone()
    .select('l.stage')
    .count<{ stage: string; count: string }[]>({ count: 'l.id' })
    .groupBy('l.stage');
  const stages = Object.fromEntries(openStages.map(stage => [
    stage,
    safeCount(stageRows.find(row => row.stage === stage)?.count ?? 0),
  ]));
  const ageRows = await base.clone()
    .select(trx.raw(
      `CASE
        WHEN ((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= 7 THEN '0-7'
        WHEN ((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= 14 THEN '8-14'
        WHEN ((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= 30 THEN '15-30'
        ELSE '31+'
      END AS "ageBand"`,
      [auth.asOf, auth.timezone, auth.timezone, auth.asOf, auth.timezone, auth.timezone,
        auth.asOf, auth.timezone, auth.timezone],
    ))
    .count<{ ageBand: string; count: string }[]>({ count: 'l.id' })
    .groupBy('ageBand');
  const ages = Object.fromEntries(ageBands.map(band => [
    band,
    safeCount(ageRows.find(row => row.ageBand === band)?.count ?? 0),
  ]));
  const evidenceQuery = base.clone();
  let evidenceTotal = total;
  if (query.selection.kind === 'stage') {
    evidenceQuery.where('l.stage', query.selection.stage);
    evidenceTotal = safeCount(stages[query.selection.stage as keyof typeof stages] ?? 0);
  } else if (query.selection.kind === 'age') {
    const band = query.selection.band;
    const lower = band === '0-7' ? 0 : band === '8-14' ? 8 : band === '15-30' ? 15 : 31;
    const upper = band === '0-7' ? 7 : band === '8-14' ? 14 : band === '15-30' ? 30 : null;
    evidenceQuery.whereRaw(
      `((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) >= ?`,
      [auth.asOf, auth.timezone, auth.timezone, lower],
    );
    if (upper !== null) evidenceQuery.andWhereRaw(
      `((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= ?`,
      [auth.asOf, auth.timezone, auth.timezone, upper],
    );
    evidenceTotal = safeCount(ages[band]);
  }
  const evidencePage = await selectLeadRows(evidenceQuery, trx, auth.timezone, auth.asOf, query.page, query.pageSize, capture);
  return leadReportResultSchema.parse({
    view: query.view,
    ...resultContext(auth),
    total,
    stages,
    ages,
    selection: query.selection,
    page: evidencePage.page,
    pageSize: query.pageSize,
    evidenceTotal,
    rows: evidencePage.rows,
  });
}

type StageEventRow = {
  id: string;
  leadId: string;
  createdAt: Date | string;
  changes: unknown;
};

async function validateOutcomeEvents(trx: Knex.Transaction, query: Knex.QueryBuilder) {
  const cursor = `lead_outcomes_${randomUUID().replaceAll('-', '')}`, sql = query.toSQL();
  await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [cursor, ...sql.bindings]);
  try {
    let rows = (await trx.raw<{ rows: StageEventRow[] }>('FETCH FORWARD 100 FROM ??', [cursor])).rows;
    while (rows.length) {
      for (const event of rows) {
        const changes = isRecord(event.changes) ? event.changes : null;
        if (!changes || !leadStages.includes(changes.from as typeof leadStages[number]) ||
          !leadStages.includes(changes.to as typeof leadStages[number]) || changes.from === changes.to) {
          throw new Error('Lead report encountered an invalid recorded stage transition.');
        }
      }
      rows = (await trx.raw<{ rows: StageEventRow[] }>('FETCH FORWARD 100 FROM ??', [cursor])).rows;
    }
  } finally { await trx.raw('CLOSE ??', [cursor]); }
}

async function readOutcomes(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  query: Extract<LeadReportQuery, { view: 'won' | 'lost' }>,
  auth: Awaited<ReturnType<typeof leadReportContext>>,
  filters: Filters,
  owners: readonly string[],
  capture?: CaptureEvidence,
): Promise<LeadReportResult> {
  await validatePeriod(query, auth.today);
  const matchingLeads = applyHistoricalArchive(applyFilters(
    trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId,
  ), auth.archiveVisibility);
  const periodJoin = `a."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
    a."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`;
  const eventQuery = () => matchingLeads.clone()
    .join('leadActivity as a', function () {
      this.on('a.leadId', 'l.id').andOn('a.workspaceId', 'l.workspaceId');
    })
    .where('a.type', 'stage')
    .whereRaw(periodJoin, [query.period.from, auth.timezone, query.period.to, auth.timezone]);
  await validateOutcomeEvents(trx, eventQuery().select('a.id', 'a.leadId', 'a.createdAt', 'a.changes'));
  const latest = eventQuery()
    .whereRaw(`a.changes->>'to' IN ('won', 'lost')`)
    .select(trx.raw(`DISTINCT ON (a."leadId", a.changes->>'to')
      a.id, a."leadId", a."createdAt", a.changes->>'to' AS outcome`))
    .orderBy('a.leadId').orderByRaw(`a.changes->>'to'`).orderBy('a.createdAt', 'desc').orderBy('a.id', 'desc');
  const countRows = await trx.from(latest.clone().as('events')).select('outcome')
    .count<{ outcome: 'won' | 'lost'; count: string }[]>({ count: '*' }).groupBy('outcome');
  const counts = { won: safeCount(countRows.find(row => row.outcome === 'won')?.count ?? 0),
    lost: safeCount(countRows.find(row => row.outcome === 'lost')?.count ?? 0) };
  const evidenceTotal = safeCount(counts[query.view]);
  const page = effectivePage(evidenceTotal, query.page, query.pageSize);
  const selection = attachLeadLabels(auth.scoped.clone().join(latest.as('events'), 'events.leadId', 'l.id'))
    .where('events.outcome', query.view).select('events.createdAt as transitionAt', 'events.outcome')
    .orderBy('events.createdAt', 'desc').orderBy('events.id', 'desc');
  const map = (saved: unknown) => {
    const row = saved as RawLead & { transitionAt: Date | string; outcome: 'won' | 'lost' };
    const transitionAt = asDate(row.transitionAt);
    return {
      id: row.id,
      label: row.name,
      recordId: row.id,
      cells: {
        transition: `${row.outcome} / ${transitionAt.toISOString()}`,
        assignment: ownerLabel(row),
        source: row.source,
      },
    };
  };
  capture?.({ query: selection.clone(), map });
  const evidenceRows = (await selection.offset((page - 1) * query.pageSize).limit(query.pageSize)).map(map);
  return leadReportResultSchema.parse({
    view: query.view,
    ...resultContext(auth),
    from: query.period.from,
    to: query.period.to,
    counts,
    coverage: { kind: 'partial', explanation: outcomeCoverage },
    page,
    pageSize: query.pageSize,
    evidenceTotal,
    rows: evidenceRows,
  });
}

async function readAttention(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  query: Extract<LeadReportQuery, { view: 'attention' }>,
  auth: Awaited<ReturnType<typeof leadReportContext>>,
  filters: Filters,
  owners: readonly string[],
  capture?: CaptureEvidence,
): Promise<LeadReportResult> {
  const base = applyCurrentOpen(applyFilters(
    trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId,
  ));
  const inactive = base.clone().whereRaw(`l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'`);
  const unowned = base.clone().where(function () {
    this.whereNull('l.ownerId').orWhereNotExists(function () {
      this.select(trx.raw('1')).from('workspaceMemberships as ownerMembership')
        .whereRaw(`"ownerMembership"."workspaceId" = l."workspaceId"`)
        .whereRaw(`"ownerMembership"."userId" = l."ownerId"`);
    });
  });
  const combined = base.clone().where(function () {
    this.whereRaw(`l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'`)
      .orWhereNull('l.ownerId')
      .orWhereNotExists(function () {
        this.select(trx.raw('1')).from('workspaceMemberships as ownerMembership')
          .whereRaw(`"ownerMembership"."workspaceId" = l."workspaceId"`)
          .whereRaw(`"ownerMembership"."userId" = l."ownerId"`);
      });
  });
  const counts = {
    inactive: await countQuery(inactive.clone()),
    unowned: await countQuery(unowned.clone()),
    combined: await countQuery(combined.clone()),
  };
  const selected = query.selection === 'inactive' ? inactive
    : query.selection === 'unowned' ? unowned
      : combined;
  const evidenceTotal = counts[query.selection];
  const page = effectivePage(evidenceTotal, query.page, query.pageSize);
  const selection = attachLeadLabels(selected)
    .select(trx.raw(
      `CASE WHEN l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'
        THEN 'inactive' ELSE '' END AS "inactiveReason",
       CASE WHEN l."ownerId" IS NULL OR "reportMembership"."userId" IS NULL
        THEN 'unowned' ELSE '' END AS "unownedReason"`,
    ))
    .orderBy('l.lastActivityAt', 'asc')
    .orderBy('l.id', 'asc');
  const map = (saved: unknown) => {
    const row = saved as RawLead & { inactiveReason: string; unownedReason: string };
    return {
    id: row.id,
    label: row.name,
    recordId: row.id,
    cells: {
      stage: row.stage,
      owner: ownerLabel(row),
      activity: asDate(row.lastActivityAt).toISOString(),
      reason: [row.inactiveReason, row.unownedReason].filter(Boolean).join(' / '),
    },
    };
  };
  capture?.({ query: selection.clone(), map });
  const rows = (await selection.offset((page - 1) * query.pageSize).limit(query.pageSize)).map(map);
  const cutoff = new Date(auth.asOf.getTime() - 7 * 86_400_000);
  return leadReportResultSchema.parse({
    view: 'attention',
    ...resultContext(auth),
    inactivityCutoff: cutoff.toISOString(),
    counts,
    selection: query.selection,
    page,
    pageSize: query.pageSize,
    evidenceTotal,
    rows,
  });
}

/** Caller must provide the current server-loaded authorization context and hold its workspace transaction. */
export async function readLeadReportInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  raw: LeadReportQuery,
): Promise<LeadReportResult> {
  const query = leadReportQuerySchema.parse(raw);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await leadReportContext(trx, context);
  return readLeadProjection(trx, context, query, auth);
}

async function readLeadProjection(
  trx: Knex.Transaction, context: AuthorizationContext, query: LeadReportQuery,
  auth: Awaited<ReturnType<typeof leadReportContext>>, capture?: CaptureEvidence,
) {
  const filters = query.filters;
  const owners = await validatedOwners(trx, context, filters, auth.scope);
  switch (query.view) {
    case 'intake':
      return readIntake(trx, context, query, auth, filters, owners, capture);
    case 'won':
    case 'lost':
      return readOutcomes(trx, context, query, auth, filters, owners, capture);
    case 'pipeline':
    case 'age':
      return readPipeline(trx, context, query, auth, filters, owners, capture);
    case 'attention':
      return readAttention(trx, context, query, auth, filters, owners, capture);
  }
}

/** Reuse the native metrics and unpaged evidence query under the narrower CSV authority. */
export async function prepareLeadReportExportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: LeadReportExportInput,
) {
  const input = leadReportExportInputSchema.parse(raw), scope = resolveLeadReportExportScope(context);
  if (!scope || input.query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await leadReportContext(trx, context);
  if (scope === 'assigned' && auth.scope !== 'assigned') {
    auth.scoped.andWhere('l.ownerId', context.userId);
    auth.scope = 'assigned';
    auth.scopeLabel = `Assigned Leads only. ${auth.archiveVisibility === 'included'
      ? 'Archived Leads included where the selected report definition permits.' : 'Archived Leads excluded by your access.'}`;
  }
  let evidence: EvidenceProjection | undefined;
  const query = leadReportQuerySchema.parse({ ...input.query, page: 1, pageSize: 25 });
  const report = await readLeadProjection(trx, context, query, auth, projection => { evidence = projection; });
  if (!evidence) throw new Error('The native Leads evidence projection is unavailable.');
  return { input, scope, report, evidence };
}
