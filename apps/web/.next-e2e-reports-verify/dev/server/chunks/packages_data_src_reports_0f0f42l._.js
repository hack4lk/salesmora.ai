module.exports = [
"[project]/packages/data/src/reports/lead-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveLeadReportExportScope",
    ()=>resolveLeadReportExportScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/export-access.ts [instrumentation] (ecmascript)");
;
;
function resolveLeadReportExportScope(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.export'
    }).allowed) return null;
    const reports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const leads = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveExportScope"])(context);
    if (!reports.allowed || reports.resourceKind !== 'report' || !reports.sourceScopes?.lead || !leads) return null;
    return leads === 'assigned' || reports.scope === 'assigned' || reports.sourceScopes.lead === 'assigned' ? 'assigned' : 'workspace';
}
}),
"[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leadReportContext",
    ()=>leadReportContext,
    "prepareLeadReportExportInTransaction",
    ()=>prepareLeadReportExportInTransaction,
    "readLeadReportInTransaction",
    ()=>readLeadReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/query.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
const openStages = [
    'new',
    'contacted',
    'estimate-sent'
];
const ageBands = [
    '0-7',
    '8-14',
    '15-30',
    '31+'
];
const outcomeCoverage = 'Only surviving recorded stage transitions are counted. Historical stage changes were not backfilled.';
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function safeCount(value) {
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Lead report count is outside the safe integer range.');
    return count;
}
function asDate(value) {
    const result = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(result.getTime())) throw new Error('Lead report encountered an invalid timestamp.');
    return result;
}
function localDate(value, timezone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(value);
    const part = (type)=>parts.find((item)=>item.type === type)?.value;
    const year = part('year'), month = part('month'), day = part('day');
    if (!year || !month || !day) throw new Error('Could not resolve the workspace-local report date.');
    return `${year}-${month}-${day}`;
}
function dayDistance(from, to) {
    const start = Date.parse(`${from}T00:00:00Z`);
    const end = Date.parse(`${to}T00:00:00Z`);
    return Math.floor((end - start) / 86_400_000);
}
function ageBand(age) {
    if (!Number.isSafeInteger(age) || age < 0) throw new Error('Lead report encountered a future-created lead.');
    return age <= 7 ? '0-7' : age <= 14 ? '8-14' : age <= 30 ? '15-30' : '31+';
}
async function leadReportContext(trx, context, forceAssigned = false) {
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const domain = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (!report.allowed || report.resourceKind !== 'report' || !domain.allowed || domain.resourceKind !== 'lead' || !report.sourceScopes?.lead) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { query: scoped, scope: domainScope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
    const scope = forceAssigned || report.sourceScopes.lead === 'assigned' || domainScope === 'assigned' ? 'assigned' : 'workspace';
    if (scope === 'assigned') scoped.andWhere('l.ownerId', context.userId);
    const workspace = await trx('workspaces').where({
        id: context.workspaceId
    }).first('timezone');
    if (typeof workspace?.timezone !== 'string' || !workspace.timezone.trim()) {
        throw new Error('Workspace timezone is unavailable for the Leads report.');
    }
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: workspace.timezone
        }).format();
    } catch (error) {
        if (error instanceof RangeError) throw new Error('Workspace timezone is invalid for the Leads report.', {
            cause: error
        });
        throw error;
    }
    const clock = await trx.raw('SELECT CURRENT_TIMESTAMP AS "asOf"');
    const asOf = asDate(clock.rows[0]?.asOf);
    const today = localDate(asOf, workspace.timezone);
    const archiveVisibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.archive',
        resource: {
            kind: 'lead',
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            ownerId: null
        }
    }).allowed ? 'included' : 'excluded';
    const scopeLabel = [
        scope === 'assigned' ? 'Assigned Leads only.' : 'All Leads authorized by current domain access.',
        archiveVisibility === 'included' ? 'Archived Leads included where the selected report definition permits.' : 'Archived Leads excluded by your access.'
    ].join(' ');
    return {
        scoped,
        scope,
        timezone: workspace.timezone,
        asOf,
        today,
        archiveVisibility,
        scopeLabel
    };
}
function validatePeriod(query, today) {
    const { from, to } = query.period;
    const days = dayDistance(from, to) + 1;
    if (from > to || to > today || days < 1 || days > 366) {
        throw new RangeError('Choose an ordered Leads report period of at most 366 dates ending no later than today.');
    }
}
async function validatedOwners(trx, context, filters, scope) {
    const selected = filters.owners.filter((owner)=>owner !== 'me' && owner !== 'unassigned');
    if (scope === 'assigned' && selected.some((owner)=>owner !== context.userId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    if (selected.length) {
        const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereIn('m.userId', selected).whereNull('u.deletionRequestedAt').select('m.userId');
        if (members.length !== selected.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return [
        ...new Set(filters.owners.map((owner)=>owner === 'me' ? context.userId : owner).filter((owner)=>owner !== 'unassigned'))
    ];
}
function applyFilters(trx, query, filters, owners, scope, userId) {
    if (filters.stages.length) query.whereIn('l.stage', filters.stages);
    if (filters.sources.length) query.whereIn('l.source', filters.sources);
    if (owners.length || filters.owners.includes('unassigned')) {
        query.andWhere(function() {
            if (owners.length) this.whereIn('l.ownerId', owners);
            if (filters.owners.includes('unassigned')) {
                const unassigned = function() {
                    this.whereNull('l.ownerId').orWhereNotExists(function() {
                        this.select(trx.raw('1')).from('workspaceMemberships as ownerMembership').whereRaw(`"ownerMembership"."workspaceId" = l."workspaceId"`).whereRaw(`"ownerMembership"."userId" = l."ownerId"`);
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
function applyPeriod(trx, query, from, to, timezone) {
    return query.whereRaw(`l."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
     l."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`, [
        from,
        timezone,
        to,
        timezone
    ]);
}
function attachLeadLabels(query) {
    return query.leftJoin('users as reportOwner', 'reportOwner.id', 'l.ownerId').leftJoin('workspaceMemberships as reportMembership', function() {
        this.on('reportMembership.userId', 'l.ownerId').andOn('reportMembership.workspaceId', 'l.workspaceId');
    }).select('l.id', 'l.name', 'l.stage', 'l.source', 'l.ownerId', 'l.createdAt', 'l.lastActivityAt', 'reportOwner.name as ownerName', 'reportMembership.userId as memberId');
}
function ownerLabel(row) {
    if (!row.ownerId) return 'No current primary owner';
    if (!row.memberId) return row.ownerName ? `${row.ownerName} (former)` : 'Former owner';
    return row.ownerName ?? 'Current owner';
}
function leadEvidence(row, timezone, asOf, extra = {}) {
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
            ...extra
        }
    };
}
function effectivePage(total, requestedPage, pageSize) {
    return Math.min(requestedPage, Math.max(1, Math.ceil(total / pageSize)));
}
async function selectLeadRows(query, trx, timezone, asOf, page, pageSize, capture) {
    const total = await countQuery(query.clone());
    const selectedPage = effectivePage(total, page, pageSize);
    const selection = attachLeadLabels(query).orderBy('l.createdAt', 'desc').orderBy('l.id', 'desc');
    capture?.({
        query: selection.clone(),
        map: (row)=>leadEvidence(row, timezone, asOf)
    });
    const rows = await selection.offset((selectedPage - 1) * pageSize).limit(pageSize);
    return {
        page: selectedPage,
        rows: rows.map((row)=>leadEvidence(row, timezone, asOf))
    };
}
async function countQuery(query) {
    const row = await query.count({
        count: 'l.id'
    }).first();
    return safeCount(row?.count ?? 0);
}
function applyHistoricalArchive(query, archiveVisibility) {
    if (archiveVisibility === 'excluded') query.whereNull('l.archivedAt');
    return query;
}
function applyCurrentOpen(query) {
    return query.whereNull('l.archivedAt').whereIn('l.stage', openStages);
}
async function readIntake(trx, context, query, auth, filters, owners, capture) {
    await validatePeriod(query, auth.today);
    if (query.trendBucket && (query.trendBucket < query.period.from || query.trendBucket > query.period.to)) {
        throw new RangeError('The selected intake trend date must be within the report period.');
    }
    const cohort = applyPeriod(trx, applyHistoricalArchive(applyFilters(trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId), auth.archiveVisibility), query.period.from, query.period.to, auth.timezone);
    const total = await countQuery(cohort.clone());
    const sourceRows = await cohort.clone().select('l.source').count({
        count: 'l.id'
    }).groupBy('l.source');
    const sources = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"].map((source)=>({
            source,
            count: safeCount(sourceRows.find((row)=>row.source === source)?.count ?? 0)
        }));
    const trendRows = await cohort.clone().select(trx.raw(`(l."createdAt" AT TIME ZONE ?)::date::text AS "date"`, [
        auth.timezone
    ])).count({
        count: 'l.id'
    }).groupBy('date').orderBy('date', 'asc');
    const trendByDate = new Map(trendRows.map((row)=>[
            row.date,
            safeCount(row.count)
        ]));
    const trend = [];
    for(let offset = 0, days = dayDistance(query.period.from, query.period.to); offset <= days; offset++){
        const date = new Date(Date.parse(`${query.period.from}T00:00:00Z`) + offset * 86_400_000).toISOString().slice(0, 10);
        trend.push({
            date,
            count: trendByDate.get(date) ?? 0
        });
    }
    const evidenceQuery = cohort.clone();
    let evidenceTotal = total;
    if (query.trendBucket) {
        evidenceQuery.whereRaw(`(l."createdAt" AT TIME ZONE ?)::date = ?::date`, [
            auth.timezone,
            query.trendBucket
        ]);
        evidenceTotal = await countQuery(evidenceQuery.clone());
    }
    const currentOwners = await validatedOwners(trx, context, query.currentFilters, auth.scope);
    const current = applyCurrentOpen(applyFilters(trx, auth.scoped.clone(), query.currentFilters, currentOwners, auth.scope, context.userId));
    const currentOpenLeads = await countQuery(current);
    const evidencePage = await selectLeadRows(evidenceQuery, trx, auth.timezone, auth.asOf, query.page, query.pageSize, capture);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportResultSchema"].parse({
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
        rows: evidencePage.rows
    });
}
function resultContext(auth) {
    return {
        asOf: auth.asOf.toISOString(),
        today: auth.today,
        timezone: auth.timezone,
        scopeLabel: auth.scopeLabel,
        archiveVisibility: auth.archiveVisibility
    };
}
async function readPipeline(trx, context, query, auth, filters, owners, capture) {
    const base = applyCurrentOpen(applyFilters(trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId));
    const futureCreated = await base.clone().where('l.createdAt', '>', auth.asOf).first('l.id');
    if (futureCreated) throw new Error('Lead report encountered a future-created lead.');
    const total = await countQuery(base.clone());
    const stageRows = await base.clone().select('l.stage').count({
        count: 'l.id'
    }).groupBy('l.stage');
    const stages = Object.fromEntries(openStages.map((stage)=>[
            stage,
            safeCount(stageRows.find((row)=>row.stage === stage)?.count ?? 0)
        ]));
    const ageRows = await base.clone().select(trx.raw(`CASE
        WHEN ((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= 7 THEN '0-7'
        WHEN ((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= 14 THEN '8-14'
        WHEN ((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= 30 THEN '15-30'
        ELSE '31+'
      END AS "ageBand"`, [
        auth.asOf,
        auth.timezone,
        auth.timezone,
        auth.asOf,
        auth.timezone,
        auth.timezone,
        auth.asOf,
        auth.timezone,
        auth.timezone
    ])).count({
        count: 'l.id'
    }).groupBy('ageBand');
    const ages = Object.fromEntries(ageBands.map((band)=>[
            band,
            safeCount(ageRows.find((row)=>row.ageBand === band)?.count ?? 0)
        ]));
    const evidenceQuery = base.clone();
    let evidenceTotal = total;
    if (query.selection.kind === 'stage') {
        evidenceQuery.where('l.stage', query.selection.stage);
        evidenceTotal = safeCount(stages[query.selection.stage] ?? 0);
    } else if (query.selection.kind === 'age') {
        const band = query.selection.band;
        const lower = band === '0-7' ? 0 : band === '8-14' ? 8 : band === '15-30' ? 15 : 31;
        const upper = band === '0-7' ? 7 : band === '8-14' ? 14 : band === '15-30' ? 30 : null;
        evidenceQuery.whereRaw(`((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) >= ?`, [
            auth.asOf,
            auth.timezone,
            auth.timezone,
            lower
        ]);
        if (upper !== null) evidenceQuery.andWhereRaw(`((?::timestamptz AT TIME ZONE ?)::date - (l."createdAt" AT TIME ZONE ?)::date) <= ?`, [
            auth.asOf,
            auth.timezone,
            auth.timezone,
            upper
        ]);
        evidenceTotal = safeCount(ages[band]);
    }
    const evidencePage = await selectLeadRows(evidenceQuery, trx, auth.timezone, auth.asOf, query.page, query.pageSize, capture);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportResultSchema"].parse({
        view: query.view,
        ...resultContext(auth),
        total,
        stages,
        ages,
        selection: query.selection,
        page: evidencePage.page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows: evidencePage.rows
    });
}
async function validateOutcomeEvents(trx, query) {
    const cursor = `lead_outcomes_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`, sql = query.toSQL();
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [
        cursor,
        ...sql.bindings
    ]);
    try {
        let rows = (await trx.raw('FETCH FORWARD 100 FROM ??', [
            cursor
        ])).rows;
        while(rows.length){
            for (const event of rows){
                const changes = isRecord(event.changes) ? event.changes : null;
                if (!changes || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadStages"].includes(changes.from) || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadStages"].includes(changes.to) || changes.from === changes.to) {
                    throw new Error('Lead report encountered an invalid recorded stage transition.');
                }
            }
            rows = (await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ])).rows;
        }
    } finally{
        await trx.raw('CLOSE ??', [
            cursor
        ]);
    }
}
async function readOutcomes(trx, context, query, auth, filters, owners, capture) {
    await validatePeriod(query, auth.today);
    const matchingLeads = applyHistoricalArchive(applyFilters(trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId), auth.archiveVisibility);
    const periodJoin = `a."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
    a."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`;
    const eventQuery = ()=>matchingLeads.clone().join('leadActivity as a', function() {
            this.on('a.leadId', 'l.id').andOn('a.workspaceId', 'l.workspaceId');
        }).where('a.type', 'stage').whereRaw(periodJoin, [
            query.period.from,
            auth.timezone,
            query.period.to,
            auth.timezone
        ]);
    await validateOutcomeEvents(trx, eventQuery().select('a.id', 'a.leadId', 'a.createdAt', 'a.changes'));
    const latest = eventQuery().whereRaw(`a.changes->>'to' IN ('won', 'lost')`).select(trx.raw(`DISTINCT ON (a."leadId", a.changes->>'to')
      a.id, a."leadId", a."createdAt", a.changes->>'to' AS outcome`)).orderBy('a.leadId').orderByRaw(`a.changes->>'to'`).orderBy('a.createdAt', 'desc').orderBy('a.id', 'desc');
    const countRows = await trx.from(latest.clone().as('events')).select('outcome').count({
        count: '*'
    }).groupBy('outcome');
    const counts = {
        won: safeCount(countRows.find((row)=>row.outcome === 'won')?.count ?? 0),
        lost: safeCount(countRows.find((row)=>row.outcome === 'lost')?.count ?? 0)
    };
    const evidenceTotal = safeCount(counts[query.view]);
    const page = effectivePage(evidenceTotal, query.page, query.pageSize);
    const selection = attachLeadLabels(auth.scoped.clone().join(latest.as('events'), 'events.leadId', 'l.id')).where('events.outcome', query.view).select('events.createdAt as transitionAt', 'events.outcome').orderBy('events.createdAt', 'desc').orderBy('events.id', 'desc');
    const map = (saved)=>{
        const row = saved;
        const transitionAt = asDate(row.transitionAt);
        return {
            id: row.id,
            label: row.name,
            recordId: row.id,
            cells: {
                transition: `${row.outcome} / ${transitionAt.toISOString()}`,
                assignment: ownerLabel(row),
                source: row.source
            }
        };
    };
    capture?.({
        query: selection.clone(),
        map
    });
    const evidenceRows = (await selection.offset((page - 1) * query.pageSize).limit(query.pageSize)).map(map);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportResultSchema"].parse({
        view: query.view,
        ...resultContext(auth),
        from: query.period.from,
        to: query.period.to,
        counts,
        coverage: {
            kind: 'partial',
            explanation: outcomeCoverage
        },
        page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows: evidenceRows
    });
}
async function readAttention(trx, context, query, auth, filters, owners, capture) {
    const base = applyCurrentOpen(applyFilters(trx, auth.scoped.clone(), filters, owners, auth.scope, context.userId));
    const inactive = base.clone().whereRaw(`l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'`);
    const unowned = base.clone().where(function() {
        this.whereNull('l.ownerId').orWhereNotExists(function() {
            this.select(trx.raw('1')).from('workspaceMemberships as ownerMembership').whereRaw(`"ownerMembership"."workspaceId" = l."workspaceId"`).whereRaw(`"ownerMembership"."userId" = l."ownerId"`);
        });
    });
    const combined = base.clone().where(function() {
        this.whereRaw(`l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'`).orWhereNull('l.ownerId').orWhereNotExists(function() {
            this.select(trx.raw('1')).from('workspaceMemberships as ownerMembership').whereRaw(`"ownerMembership"."workspaceId" = l."workspaceId"`).whereRaw(`"ownerMembership"."userId" = l."ownerId"`);
        });
    });
    const counts = {
        inactive: await countQuery(inactive.clone()),
        unowned: await countQuery(unowned.clone()),
        combined: await countQuery(combined.clone())
    };
    const selected = query.selection === 'inactive' ? inactive : query.selection === 'unowned' ? unowned : combined;
    const evidenceTotal = counts[query.selection];
    const page = effectivePage(evidenceTotal, query.page, query.pageSize);
    const selection = attachLeadLabels(selected).select(trx.raw(`CASE WHEN l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'
        THEN 'inactive' ELSE '' END AS "inactiveReason",
       CASE WHEN l."ownerId" IS NULL OR "reportMembership"."userId" IS NULL
        THEN 'unowned' ELSE '' END AS "unownedReason"`)).orderBy('l.lastActivityAt', 'asc').orderBy('l.id', 'asc');
    const map = (saved)=>{
        const row = saved;
        return {
            id: row.id,
            label: row.name,
            recordId: row.id,
            cells: {
                stage: row.stage,
                owner: ownerLabel(row),
                activity: asDate(row.lastActivityAt).toISOString(),
                reason: [
                    row.inactiveReason,
                    row.unownedReason
                ].filter(Boolean).join(' / ')
            }
        };
    };
    capture?.({
        query: selection.clone(),
        map
    });
    const rows = (await selection.offset((page - 1) * query.pageSize).limit(query.pageSize)).map(map);
    const cutoff = new Date(auth.asOf.getTime() - 7 * 86_400_000);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportResultSchema"].parse({
        view: 'attention',
        ...resultContext(auth),
        inactivityCutoff: cutoff.toISOString(),
        counts,
        selection: query.selection,
        page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows
    });
}
async function readLeadReportInTransaction(trx, context, raw) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportQuerySchema"].parse(raw);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await leadReportContext(trx, context);
    return readLeadProjection(trx, context, query, auth);
}
async function readLeadProjection(trx, context, query, auth, capture) {
    const filters = query.filters;
    const owners = await validatedOwners(trx, context, filters, auth.scope);
    switch(query.view){
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
async function prepareLeadReportExportInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportExportInputSchema"].parse(raw), scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveLeadReportExportScope"])(context);
    if (!scope || input.query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await leadReportContext(trx, context);
    if (scope === 'assigned' && auth.scope !== 'assigned') {
        auth.scoped.andWhere('l.ownerId', context.userId);
        auth.scope = 'assigned';
        auth.scopeLabel = `Assigned Leads only. ${auth.archiveVisibility === 'included' ? 'Archived Leads included where the selected report definition permits.' : 'Archived Leads excluded by your access.'}`;
    }
    let evidence;
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportQuerySchema"].parse({
        ...input.query,
        page: 1,
        pageSize: 25
    });
    const report = await readLeadProjection(trx, context, query, auth, (projection)=>{
        evidence = projection;
    });
    if (!evidence) throw new Error('The native Leads evidence projection is unavailable.');
    return {
        input,
        scope,
        report,
        evidence
    };
}
}),
"[project]/packages/data/src/reports/job-context.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jobReportContext",
    ()=>jobReportContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/query.ts [instrumentation] (ecmascript)");
;
;
;
async function jobReportContext(trx, context, forceAssigned = false) {
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (!report.allowed || report.resourceKind !== 'report' || !report.sourceScopes?.job) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const { query, scope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedJobQuery"])(trx, context, forceAssigned || report.sourceScopes.job === 'assigned');
    const workspace = await trx('workspaces').where({
        id: context.workspaceId
    }).first('timezone');
    if (typeof workspace?.timezone !== 'string' || !workspace.timezone.trim()) {
        throw new Error('Workspace timezone is unavailable for the Jobs report.');
    }
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: workspace.timezone
        }).format();
    } catch (error) {
        if (error instanceof RangeError) {
            throw new Error('Workspace timezone is invalid for the Jobs report.', {
                cause: error
            });
        }
        throw error;
    }
    const clock = await trx.raw(`SELECT CURRENT_TIMESTAMP AS "asOf",
      to_char(CURRENT_TIMESTAMP AT TIME ZONE ?, 'YYYY-MM-DD') AS "today"`, [
        workspace.timezone
    ]);
    const asOf = clock.rows[0]?.asOf instanceof Date ? clock.rows[0].asOf : new Date(clock.rows[0]?.asOf);
    const today = clock.rows[0]?.today;
    if (!Number.isFinite(asOf.getTime()) || typeof today !== 'string') {
        throw new Error('The database clock could not be resolved for the Jobs report.');
    }
    const scopeLabel = scope === 'assigned' ? 'Jobs where you are the current primary owner or a current supporting team member.' : 'All Jobs authorized by current workspace access.';
    return {
        query,
        scope,
        timezone: workspace.timezone,
        asOf,
        today,
        scopeLabel
    };
}
}),
"[project]/packages/data/src/reports/job-filters.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyJobReportFilters",
    ()=>applyJobReportFilters,
    "validateJobReportFilters",
    ()=>validateJobReportFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
;
function applyJobReportFilters(query, filters) {
    if (filters.statuses.length) query.whereIn('j.status', filters.statuses);
    if (filters.owners.length) {
        query.andWhere((builder)=>{
            const ownerIds = filters.owners.filter((owner)=>owner !== 'unassigned').map((owner)=>owner.slice('member:'.length));
            if (ownerIds.length) builder.whereIn('j.primaryOwnerId', ownerIds);
            if (filters.owners.includes('unassigned')) {
                if (ownerIds.length) builder.orWhereNull('j.primaryOwnerId');
                else builder.whereNull('j.primaryOwnerId');
            }
        });
    }
    if (filters.services.length) {
        query.andWhere((builder)=>{
            const serviceValues = filters.services.filter((service)=>service !== 'none').map((service)=>service.slice('service:'.length));
            if (serviceValues.length) {
                builder.where((nested)=>{
                    nested.whereRaw('btrim(j."service") = ?', [
                        serviceValues[0]
                    ]);
                    for (const service of serviceValues.slice(1)){
                        nested.orWhereRaw('btrim(j."service") = ?', [
                            service
                        ]);
                    }
                });
            }
            if (filters.services.includes('none')) {
                const blank = (nested)=>nested.whereNull('j.service').orWhereRaw('btrim(j."service") = ?', [
                        ''
                    ]);
                if (serviceValues.length) builder.orWhere(blank);
                else builder.where(blank);
            }
        });
    }
    return query;
}
async function validateJobReportFilters(base, filters, trx) {
    if (!filters.owners.length && !filters.services.length) return;
    const ownerRows = await base.clone().whereNotNull('j.primaryOwnerId').distinct('j.primaryOwnerId').pluck('j.primaryOwnerId');
    const hasUnassigned = await base.clone().whereNull('j.primaryOwnerId').first('j.id');
    const serviceRows = await base.clone().select(trx.raw(`CASE WHEN btrim(j."service") = '' THEN 'none' ELSE 'service:' || btrim(j."service") END AS "id"`)).distinct();
    const availableOwners = new Set([
        ...ownerRows.map((owner)=>`member:${owner}`),
        ...hasUnassigned ? [
            'unassigned'
        ] : []
    ]);
    const availableServices = new Set(serviceRows.map((row)=>row.id));
    if (filters.owners.some((owner)=>!availableOwners.has(owner)) || filters.services.some((service)=>!availableServices.has(service))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
}
}),
"[project]/packages/data/src/reports/jobs.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readJobWorkloadReportInTransaction",
    ()=>readJobWorkloadReportInTransaction,
    "selectJobWorkloadProjection",
    ()=>selectJobWorkloadProjection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/jobs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-filters.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const activeStatuses = [
    'needs-scheduling',
    'scheduled',
    'in-progress',
    'waiting'
];
const waitingLabels = {
    customer: 'Waiting on customer',
    materials: 'Waiting on materials',
    approval: 'Waiting on approval',
    other: 'Other'
};
const statusLabels = {
    'needs-scheduling': 'Needs Scheduling',
    scheduled: 'Scheduled',
    'in-progress': 'In Progress',
    waiting: 'Waiting'
};
const metrics = [
    'active',
    'overdue',
    'dueSoon',
    'noDeadline',
    'waiting',
    'unassigned'
];
function safeCount(value) {
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError('Job workload count is outside the safe integer range.');
    }
    return count;
}
function serviceId(service) {
    return service ? `service:${service}` : 'none';
}
function groupRows(rows) {
    return rows.map((row)=>({
            id: row.id,
            label: row.label,
            count: safeCount(row.count)
        }));
}
function selectJobWorkloadProjection(query, selection, today) {
    if (selection.kind === 'metric') {
        switch(selection.metric){
            case 'active':
                return query;
            case 'overdue':
                return query.whereRaw('j."completionDeadline" < ?::date', [
                    today
                ]);
            case 'dueSoon':
                return query.whereRaw('j."completionDeadline" BETWEEN ?::date AND ?::date', [
                    today,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(today, 7)
                ]);
            case 'noDeadline':
                return query.whereNull('j.completionDeadline');
            case 'waiting':
                return query.where('j.status', 'waiting');
            case 'unassigned':
                return query.whereNull('j.primaryOwnerId');
        }
    }
    switch(selection.group){
        case 'status':
            if (!activeStatuses.includes(selection.id)) {
                throw new RangeError('The selected Job status group is invalid.');
            }
            return query.where('j.status', selection.id);
        case 'owner':
            if (selection.id === 'unassigned') return query.whereNull('j.primaryOwnerId');
            if (!selection.id.startsWith('member:') || selection.id.length === 7) {
                throw new RangeError('The selected Job owner group is invalid.');
            }
            return query.where('j.primaryOwnerId', selection.id.slice('member:'.length));
        case 'service':
            if (selection.id === 'none') return query.whereRaw('btrim(j."service") = ?', [
                ''
            ]);
            if (!selection.id.startsWith('service:') || selection.id.length === 8) {
                throw new RangeError('The selected Job service group is invalid.');
            }
            return query.whereRaw('btrim(j."service") = ?', [
                selection.id.slice('service:'.length)
            ]);
        case 'waitingReason':
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobWaitingReasons"].includes(selection.id)) {
                throw new RangeError('The selected Job waiting-reason group is invalid.');
            }
            return query.where('j.waitingReason', selection.id);
    }
}
async function countQuery(query) {
    const row = await query.count({
        count: 'j.id'
    }).first();
    return safeCount(row?.count ?? 0);
}
async function readWorkload(trx, context, query, auth) {
    const active = auth.query.clone().whereIn('j.status', activeStatuses);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateJobReportFilters"])(active, query.filters, trx);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyJobReportFilters"])(active.clone(), query.filters);
    const windowEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(auth.today, 7);
    const metricRow = await filtered.clone().select(trx.raw(`COUNT(*) AS "active",
     COUNT(*) FILTER (WHERE j."completionDeadline" < ?::date) AS "overdue",
     COUNT(*) FILTER (WHERE j."completionDeadline" BETWEEN ?::date AND ?::date) AS "dueSoon",
     COUNT(*) FILTER (WHERE j."completionDeadline" IS NULL) AS "noDeadline",
     COUNT(*) FILTER (WHERE j."status" = 'waiting') AS "waiting",
     COUNT(*) FILTER (WHERE j."primaryOwnerId" IS NULL) AS "unassigned"`, [
        auth.today,
        auth.today,
        windowEnd
    ])).first();
    const counts = Object.fromEntries(metrics.map((metric)=>[
            metric,
            safeCount(metricRow?.[metric])
        ]));
    const statusRows = await filtered.clone().select('j.status').count({
        count: 'j.id'
    }).groupBy('j.status');
    const ownerRows = await filtered.clone().leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId').select(trx.raw(`CASE WHEN j."primaryOwnerId" IS NULL THEN 'unassigned'
       ELSE 'member:' || j."primaryOwnerId" END AS "id",
       COALESCE("reportOwner"."name", 'Current teammate') AS "label"`)).count({
        count: 'j.id'
    }).groupBy('j.primaryOwnerId', 'reportOwner.name');
    const serviceRows = await filtered.clone().select(trx.raw(`CASE WHEN btrim(j."service") = '' THEN 'none'
       ELSE 'service:' || btrim(j."service") END AS "id",
       CASE WHEN btrim(j."service") = '' THEN 'No recorded service'
       ELSE btrim(j."service") END AS "label"`)).count({
        count: 'j.id'
    }).groupByRaw('btrim(j."service")');
    const waitingRows = await filtered.clone().where('j.status', 'waiting').select('j.waitingReason as id').count({
        count: 'j.id'
    }).groupBy('j.waitingReason');
    const groups = {
        status: activeStatuses.map((status)=>({
                id: status,
                label: statusLabels[status],
                count: safeCount(statusRows.find((row)=>row.status === status)?.count ?? 0),
                evidenceId: `status:${status}`
            })),
        owner: [
            ...groupRows(ownerRows).map((row)=>({
                    ...row,
                    label: row.id === 'unassigned' ? 'No current primary owner' : row.label,
                    evidenceId: `owner:${row.id}`
                })),
            ...!ownerRows.some((row)=>row.id === 'unassigned') ? [
                {
                    id: 'unassigned',
                    label: 'No current primary owner',
                    count: 0,
                    evidenceId: 'owner:unassigned'
                }
            ] : []
        ],
        service: groupRows(serviceRows).map((row)=>({
                ...row,
                evidenceId: `service:${row.id}`
            })),
        waitingReason: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobWaitingReasons"].map((reason)=>({
                id: reason,
                label: waitingLabels[reason],
                count: safeCount(waitingRows.find((row)=>row.id === reason)?.count ?? 0),
                evidenceId: `waitingReason:${reason}`
            }))
    };
    if (!groups.service.some((group)=>group.id === 'none')) {
        groups.service.push({
            id: 'none',
            label: 'No recorded service',
            count: 0,
            evidenceId: 'service:none'
        });
    }
    const selection = query.selection;
    if (selection.kind === 'group') {
        const selectedGroups = groups[selection.group];
        if (!selectedGroups.some((group)=>group.id === selection.id)) {
            throw new RangeError('The selected Job workload group is no longer available.');
        }
    }
    const evidenceQuery = selectJobWorkloadProjection(filtered.clone(), selection, auth.today);
    const evidenceTotal = await countQuery(evidenceQuery.clone());
    const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
    const rawRows = await evidenceQuery.leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId').select('j.id', 'j.jobNumber', 'j.title', 'j.customerName', 'j.status', 'j.primaryOwnerId', 'reportOwner.name as ownerName', trx.raw('btrim(j."service") AS "service"'), trx.raw(`to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`), trx.raw(`to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`), 'j.waitingReason').orderByRaw('j."completionDeadline" ASC NULLS LAST').orderByRaw('j."scheduledDate" ASC NULLS LAST').orderBy('j.jobNumber', 'asc').orderBy('j.id', 'asc').offset((page - 1) * query.pageSize).limit(query.pageSize);
    const rows = rawRows.map((row)=>{
        const id = serviceId(row.service);
        return {
            id: row.id,
            recordId: row.id,
            label: `J-${String(row.jobNumber).padStart(4, '0')} / ${row.title || row.customerName}`,
            cells: {
                owner: row.primaryOwnerId === null ? 'No current primary owner' : row.ownerName || 'Current teammate',
                service: row.service || 'No recorded service'
            },
            status: row.status,
            completionDeadline: row.completionDeadline,
            scheduledDate: row.scheduledDate,
            primaryOwnerId: row.primaryOwnerId,
            serviceId: id,
            waitingReason: row.waitingReason
        };
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobWorkloadResultSchema"].parse({
        view: 'workload',
        asOf: auth.asOf.toISOString(),
        today: auth.today,
        timezone: auth.timezone,
        scopeLabel: auth.scopeLabel,
        filters: query.filters,
        counts,
        groups,
        evidenceIds: Object.fromEntries(metrics.map((metric)=>[
                metric,
                metric
            ])),
        selection,
        page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows
    });
}
async function readJobWorkloadReportInTransaction(trx, context, rawQuery, forceAssigned = false) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobWorkloadQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportContext"])(trx, context, forceAssigned);
    return readWorkload(trx, context, query, auth);
}
}),
"[project]/packages/data/src/reports/job-events.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyJobReportPeriod",
    ()=>applyJobReportPeriod,
    "invalidJobStatusEvents",
    ()=>invalidJobStatusEvents,
    "jobStatusEvents",
    ()=>jobStatusEvents,
    "selectedJobLifecycleEvents",
    ()=>selectedJobLifecycleEvents,
    "validateJobReportPeriod",
    ()=>validateJobReportPeriod
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [instrumentation] (ecmascript) <locals>");
;
const activeStatuses = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatuses"].filter((status)=>status !== 'completed' && status !== 'canceled');
const allStatusValues = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatuses"].map((status)=>`'${status}'`).join(',');
const activeStatusValues = activeStatuses.map((status)=>`'${status}'`).join(',');
const validTransition = `jsonb_typeof(a."changes") = 'object'
  AND jsonb_typeof(a."changes"->'from') = 'string'
  AND jsonb_typeof(a."changes"->'to') = 'string'
  AND a."changes"->>'from' IN (${allStatusValues})
  AND a."changes"->>'to' IN (${allStatusValues})
  AND a."changes"->>'from' <> a."changes"->>'to'
  AND (a."changes"->>'from' IN (${activeStatusValues})
    OR (a."changes"->>'from' IN ('completed','canceled')
      AND a."changes"->>'to' IN (${activeStatusValues})))`;
function applyJobReportPeriod(query, column, period, timezone) {
    return query.whereRaw(`${column} >= (?::date::timestamp AT TIME ZONE ?) AND
     ${column} < ((?::date + 1)::timestamp AT TIME ZONE ?)`, [
        period.from,
        timezone,
        period.to,
        timezone
    ]);
}
function validateJobReportPeriod(period, today) {
    const days = (Date.parse(`${period.to}T00:00:00Z`) - Date.parse(`${period.from}T00:00:00Z`)) / 86_400_000 + 1;
    if (period.from > period.to || period.to > today || !Number.isInteger(days) || days < 1 || days > 366) {
        throw new RangeError('Choose an ordered Jobs report period of at most 366 dates ending no later than today.');
    }
}
function jobStatusEvents(trx, context, period) {
    const authorized = context.query.clone().clearSelect().clearOrder().select(trx.raw('1')).whereRaw('j.id = a."jobId" AND j."workspaceId" = a."workspaceId"');
    const query = trx('jobActivity as a').where('a.type', 'status').whereRaw('EXISTS (?)', [
        authorized
    ]);
    return applyJobReportPeriod(query, 'a."createdAt"', period, context.timezone);
}
function invalidJobStatusEvents(query) {
    return query.clone().whereRaw(`((${validTransition}) IS NOT TRUE OR (
      a."changes"->>'to' = 'completed' AND EXISTS (
        SELECT 1 FROM jobs AS evidenceJob
        WHERE evidenceJob.id = a."jobId"
          AND evidenceJob."workspaceId" = a."workspaceId"
          AND a."createdAt" < evidenceJob."createdAt"
      )
    ))`);
}
function selectedJobLifecycleEvents(trx, context, period, view) {
    const category = view === 'reopened' ? `a."changes"->>'from' IN ('completed','canceled')
      AND a."changes"->>'to' IN (${activeStatusValues})` : `a."changes"->>'to' = ?`;
    return jobStatusEvents(trx, context, period).whereRaw(`(${validTransition}) IS TRUE`).whereRaw(category, view === 'reopened' ? [] : [
        view
    ]).distinctOn('a.jobId').select('a.jobId', 'a.id as eventId', 'a.createdAt as eventAt', trx.raw(`to_char(a."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "reportDate"`, [
        context.timezone
    ])).orderBy('a.jobId').orderBy('a.createdAt', 'desc').orderBy('a.id', 'desc');
}
}),
"[project]/packages/data/src/reports/job-lifecycle.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readJobLifecycleReportInTransaction",
    ()=>readJobLifecycleReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/job-lifecycle.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-filters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-events.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const views = [
    'created',
    'completed',
    'canceled',
    'reopened'
];
function safeCount(value) {
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError('Job lifecycle count is outside the safe integer range.');
    }
    return count;
}
async function readLifecycle(trx, query, auth) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateJobReportPeriod"])(query.period, auth.today);
    const eventBase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobStatusEvents"])(trx, auth, query.period);
    const invalidEvent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidJobStatusEvents"])(eventBase).first('a.id');
    if (invalidEvent) {
        throw new Error('Jobs report encountered invalid lifecycle transition evidence.');
    }
    const eventCounts = await eventBase.clone().select(trx.raw(`COUNT(DISTINCT a."jobId") FILTER (WHERE a."changes"->>'to' = 'completed') AS "completed",
       COUNT(DISTINCT a."jobId") FILTER (WHERE a."changes"->>'to' = 'canceled') AS "canceled",
       COUNT(DISTINCT a."jobId") FILTER (
         WHERE a."changes"->>'from' IN ('completed','canceled')
           AND a."changes"->>'to' NOT IN ('completed','canceled')
       ) AS "reopened"`)).first();
    const createdQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyJobReportPeriod"])(auth.query.clone(), 'j."createdAt"', query.period, auth.timezone);
    const createdRow = await createdQuery.clone().count({
        count: 'j.id'
    }).first();
    const counts = {
        created: safeCount(createdRow?.count ?? 0),
        completed: safeCount(eventCounts?.completed ?? 0),
        canceled: safeCount(eventCounts?.canceled ?? 0),
        reopened: safeCount(eventCounts?.reopened ?? 0)
    };
    const evidenceTotal = counts[query.selectedView];
    const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
    const evidenceQuery = auth.query.clone();
    if (query.selectedView === 'created') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyJobReportPeriod"])(evidenceQuery, 'j."createdAt"', query.period, auth.timezone);
        evidenceQuery.select('j.id', 'j.jobNumber', 'j.title', 'j.customerName', 'j.status', 'j.primaryOwnerId as ownerId', 'j.service', trx.raw('to_char(j."createdAt" AT TIME ZONE ?, \'YYYY-MM-DD\') AS "reportDate"', [
            auth.timezone
        ]));
    } else {
        const selected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectedJobLifecycleEvents"])(trx, auth, query.period, query.selectedView).toSQL();
        evidenceQuery.joinRaw(`INNER JOIN (${selected.sql}) AS "selectedEvent"
       ON "selectedEvent"."jobId" = "j"."id"`, [
            ...selected.bindings
        ]).select('j.id', 'j.jobNumber', 'j.title', 'j.customerName', 'j.status', 'j.primaryOwnerId as ownerId', 'j.service', 'selectedEvent.reportDate');
    }
    const rawRows = await evidenceQuery.leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId').select('reportOwner.name as ownerName').orderBy('reportDate', 'desc').orderBy('j.jobNumber', 'asc').orderBy('j.id', 'asc').offset((page - 1) * query.pageSize).limit(query.pageSize);
    const rows = rawRows.map((row)=>({
            id: row.id,
            recordId: row.id,
            label: `J-${String(row.jobNumber).padStart(4, '0')} / ${row.title || row.customerName}`,
            cells: {
                date: row.reportDate,
                status: row.status,
                owner: row.ownerId === null ? 'No current primary owner' : row.ownerName || 'Current teammate',
                service: row.service.trim() || 'No recorded service'
            }
        }));
    const metricCoverage = {
        kind: 'complete'
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobLifecycleResultSchema"].parse({
        view: 'lifecycle',
        asOf: auth.asOf.toISOString(),
        from: query.period.from,
        to: query.period.to,
        timezone: auth.timezone,
        scopeLabel: auth.scopeLabel,
        filters: query.filters,
        counts,
        coverage: {
            created: metricCoverage,
            completed: metricCoverage,
            canceled: metricCoverage,
            reopened: metricCoverage
        },
        evidenceIds: Object.fromEntries(views.map((view)=>[
                view,
                view
            ])),
        selectedView: query.selectedView,
        page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows
    });
}
async function readJobLifecycleReportInTransaction(trx, context, rawQuery, forceAssigned = false) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobLifecycleQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportContext"])(trx, context, forceAssigned);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateJobReportFilters"])(auth.query, query.filters, trx);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyJobReportFilters"])(auth.query, query.filters);
    return readLifecycle(trx, query, auth);
}
}),
"[project]/packages/data/src/reports/job-completion.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readJobCompletionReportInTransaction",
    ()=>readJobCompletionReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/job-completion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-filters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-events.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function safeCount(value) {
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0) {
        throw new RangeError('Job completion count or elapsed-day sum is outside the safe integer range.');
    }
    return count;
}
async function readJobCompletionReportInTransaction(trx, context, rawQuery, forceAssigned = false) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobCompletionQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportContext"])(trx, context, forceAssigned);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateJobReportPeriod"])(query.period, auth.today);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateJobReportFilters"])(auth.query, query.filters, trx);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyJobReportFilters"])(auth.query, query.filters);
    const events = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectedJobLifecycleEvents"])(trx, auth, query.period, 'completed').toSQL();
    const invalid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidJobStatusEvents"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobStatusEvents"])(trx, auth, query.period)).select('a.id').toSQL();
    const projection = await trx.raw(`WITH selected AS MATERIALIZED (${events.sql}),
     completed AS MATERIALIZED (
       SELECT j.id, j."jobNumber", j.title, j."customerName", j.status, j."primaryOwnerId",
         s."reportDate"::date AS "completionDate",
         (j."createdAt" AT TIME ZONE ?)::date AS "createdDate",
         s."reportDate"::date - (j."createdAt" AT TIME ZONE ?)::date AS "elapsedDays"
       FROM selected s JOIN jobs j ON j.id = s."jobId" AND j."workspaceId" = ?::uuid
     ),
     evidence AS MATERIALIZED (
       SELECT * FROM completed WHERE (?::date IS NULL OR "completionDate" = ?::date)
     ),
     totals AS (
       SELECT COUNT(*) AS total, COALESCE(SUM("elapsedDays"), 0) AS elapsed FROM completed
     ),
     dayCounts AS (
       SELECT "completionDate", COUNT(*) AS count FROM completed GROUP BY "completionDate"
     ),
     paging AS (
       SELECT COUNT(*) AS total,
         LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT e.*, u.name AS "ownerName" FROM evidence e
       LEFT JOIN users u ON u.id = e."primaryOwnerId"
       ORDER BY e."completionDate" DESC, e."jobNumber", e.id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT EXISTS (${invalid.sql}) AS invalid,
       totals.total::text AS total, totals.elapsed::text AS "totalElapsedDays",
       paging.total::text AS "evidenceTotal", paging.page,
       (SELECT jsonb_agg(jsonb_build_object(
         'date', to_char(d.date, 'YYYY-MM-DD'),
         'count', COALESCE(c.count, 0),
         'evidenceId', 'completion:day:' || to_char(d.date, 'YYYY-MM-DD')
       ) ORDER BY d.date)
       FROM (SELECT ?::date + i AS date FROM generate_series(0, ?::date - ?::date) AS i) d
       LEFT JOIN dayCounts c ON c."completionDate" = d.date) AS days,
       COALESCE((SELECT jsonb_agg(jsonb_build_object(
         'id', r.id, 'recordId', r.id,
         'label', 'J-' || CASE WHEN length(r."jobNumber"::text) < 4
           THEN lpad(r."jobNumber"::text, 4, '0') ELSE r."jobNumber"::text END
           || ' / ' || CASE WHEN r.title = '' THEN r."customerName" ELSE r.title END,
         'createdDate', to_char(r."createdDate", 'YYYY-MM-DD'),
         'completionDate', to_char(r."completionDate", 'YYYY-MM-DD'),
         'cells', jsonb_build_object('status', r.status, 'owner',
           CASE WHEN r."primaryOwnerId" IS NULL THEN 'No current primary owner'
           ELSE COALESCE(NULLIF(r."ownerName", ''), 'Current teammate') END)
       ) ORDER BY r."completionDate" DESC, r."jobNumber", r.id) FROM pageRows r), '[]'::jsonb) AS rows
     FROM totals CROSS JOIN paging`, [
        ...events.bindings,
        auth.timezone,
        auth.timezone,
        query.workspaceId,
        query.selectedDate ?? null,
        query.selectedDate ?? null,
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize,
        ...invalid.bindings,
        query.period.from,
        query.period.to,
        query.period.from
    ]);
    const result = projection.rows[0];
    if (!result) throw new Error('The database returned no Job completion projection.');
    if (result.invalid) throw new Error('Jobs report encountered invalid lifecycle transition evidence.');
    const total = safeCount(result.total);
    const totalElapsedDays = safeCount(result.totalElapsedDays);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobCompletionResultSchema"].parse({
        view: 'completion',
        asOf: auth.asOf.toISOString(),
        from: query.period.from,
        to: query.period.to,
        timezone: auth.timezone,
        scopeLabel: auth.scopeLabel,
        filters: query.filters,
        total,
        coverage: {
            kind: 'complete'
        },
        days: result.days,
        duration: {
            sampleSize: total,
            totalElapsedDays,
            averageElapsedDays: total === 0 ? null : totalElapsedDays / total
        },
        evidenceId: 'completion:all',
        ...query.selectedDate === undefined ? {} : {
            selectedDate: query.selectedDate
        },
        page: result.page,
        pageSize: query.pageSize,
        evidenceTotal: safeCount(result.evidenceTotal),
        rows: result.rows
    });
}
}),
"[project]/packages/data/src/reports/job-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveJobReportExportScope",
    ()=>resolveJobReportExportScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
;
function resolveJobReportExportScope(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.export'
    }).allowed) return null;
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const read = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const exportAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.export');
    if (!report.allowed || report.resourceKind !== 'report' || !report.sourceScopes?.job || !read.allowed || read.resourceKind !== 'job' || ![
        'workspace',
        'assigned'
    ].includes(read.scope) || !exportAccess.allowed || exportAccess.resourceKind !== 'job' || ![
        'workspace',
        'assigned'
    ].includes(exportAccess.scope)) return null;
    return report.scope === 'assigned' || report.sourceScopes.job === 'assigned' || read.scope === 'assigned' || exportAccess.scope === 'assigned' ? 'assigned' : 'workspace';
}
}),
"[project]/packages/data/src/reports/job-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialJobReportWithAuthorityInTransaction",
    ()=>initialJobReportWithAuthorityInTransaction,
    "readJobReportWithAuthorityInTransaction",
    ()=>readJobReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/job-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/jobs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-lifecycle.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-completion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
const activeStatuses = [
    'needs-scheduling',
    'scheduled',
    'in-progress',
    'waiting'
];
const statusLabels = {
    'needs-scheduling': 'Needs Scheduling',
    scheduled: 'Scheduled',
    'in-progress': 'In Progress',
    waiting: 'Waiting',
    completed: 'Completed',
    canceled: 'Canceled'
};
async function readOptions(trx, auth, current) {
    const base = auth.query.clone();
    if (current) base.whereIn('j.status', activeStatuses);
    const owners = await base.clone().leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId').distinct(trx.raw(`CASE WHEN j."primaryOwnerId" IS NULL THEN 'unassigned' ELSE 'member:' || j."primaryOwnerId" END AS "value",
       CASE WHEN j."primaryOwnerId" IS NULL THEN 'No current primary owner'
         ELSE COALESCE(NULLIF("reportOwner"."name", ''), 'Current teammate') END AS "label"`)).orderBy('value');
    const services = await base.clone().distinct(trx.raw(`CASE WHEN btrim(j."service") = '' THEN 'none' ELSE 'service:' || btrim(j."service") END AS "value",
     CASE WHEN btrim(j."service") = '' THEN 'No recorded service' ELSE btrim(j."service") END AS "label"`)).orderBy('value');
    return {
        context: current ? 'current' : 'period',
        statuses: (current ? activeStatuses : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatuses"]).map((value)=>({
                value,
                label: statusLabels[value]
            })),
        owners,
        services
    };
}
async function readJobReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportContext"])(trx, context);
    const report = query.view === 'workload' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobWorkloadReportInTransaction"])(trx, context, query) : query.view === 'lifecycle' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobLifecycleReportInTransaction"])(trx, context, query) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobCompletionReportInTransaction"])(trx, context, query);
    const options = await readOptions(trx, auth, query.view === 'workload');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope: auth.scope,
        exportScope: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveJobReportExportScope"])(context),
        today: auth.today,
        query,
        report,
        options
    });
}
async function initialJobReportWithAuthorityInTransaction(trx, context) {
    const { today } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportContext"])(trx, context);
    return readJobReportWithAuthorityInTransaction(trx, context, {
        workspaceId: context.workspaceId,
        view: 'lifecycle',
        period: {
            from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(today, -29),
            to: today
        },
        filters: {
            statuses: [],
            owners: [],
            services: []
        },
        selectedView: 'created',
        page: 1,
        pageSize: 25
    });
}
}),
"[project]/packages/data/src/reports/team-filters.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateTeamReportMembers",
    ()=>validateTeamReportMembers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
;
async function validateTeamReportMembers(trx, context, assigned, filters) {
    if (filters.members.length === 0) return;
    if (assigned && filters.members.some((id)=>id !== context.userId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const members = await trx('workspaceMemberships').where({
        workspaceId: context.workspaceId
    }).whereIn('userId', filters.members).select('userId');
    if (members.length !== filters.members.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
}),
"[project]/packages/data/src/reports/team-jobs.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readTeamJobsReportInTransaction",
    ()=>readTeamJobsReportInTransaction,
    "teamJobEvidenceJSON",
    ()=>teamJobEvidenceJSON,
    "teamJobsWorkloadSource",
    ()=>teamJobsWorkloadSource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-jobs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-filters.ts [instrumentation] (ecmascript)");
;
;
;
;
const teamJobEvidenceJSON = `jsonb_build_object(
  'id', j.id, 'recordId', j.id,
  'label', 'J-' || CASE WHEN length(j."jobNumber"::text) < 4 THEN lpad(j."jobNumber"::text, 4, '0')
    ELSE j."jobNumber"::text END || ' / ' || COALESCE(NULLIF(j.title, ''), j."customerName"),
  'status', j.status, 'completionDeadline', to_char(j."completionDeadline", 'YYYY-MM-DD'),
  'scheduledDate', to_char(j."scheduledDate", 'YYYY-MM-DD'), 'waitingReason', j."waitingReason",
  'cells', jsonb_build_object('service', COALESCE(NULLIF(btrim(j.service), ''), 'No recorded service')),
  'primary', CASE WHEN ?::boolean AND j."primaryOwnerId" IS DISTINCT FROM ?
    THEN jsonb_build_object('kind', 'withheld')
    WHEN j."primaryOwnerId" IS NULL THEN jsonb_build_object('kind', 'unassigned')
    ELSE jsonb_build_object('kind', 'member', 'id', j."primaryOwnerId") END,
  'supportingMemberIds', COALESCE((SELECT jsonb_agg(s."userId" ORDER BY s."userId") FROM support s
    WHERE s."jobId" = j.id), '[]'::jsonb))`;
async function teamJobsWorkloadSource(trx, context, query, forceAssigned = false) {
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportContext"])(trx, context, forceAssigned);
    const assigned = auth.scope === 'assigned';
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateTeamReportMembers"])(trx, context, assigned, query.filters);
    const selected = query.selected;
    if (assigned && (selected.kind === 'unassigned' || selected.kind === 'queue' && selected.queue === 'unassigned' || selected.kind === 'member' && selected.id !== context.userId)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const scoped = auth.query.clone().whereIn('j.status', [
        'needs-scheduling',
        'scheduled',
        'in-progress',
        'waiting'
    ]);
    if (query.filters.members.length > 0) scoped.where((builder)=>{
        builder.whereIn('j.primaryOwnerId', query.filters.members).orWhereExists(trx('jobTeamMembers as t').select(trx.raw('1')).whereRaw('?? = ??', [
            't.jobId',
            'j.id'
        ]).whereRaw('?? = ??', [
            't.workspaceId',
            'j.workspaceId'
        ]).whereIn('t.userId', query.filters.members));
    });
    const base = scoped.select('j.*').toSQL();
    const predicate = selected.kind === 'queue' ? selected.queue === 'active' ? 'TRUE' : selected.queue === 'overdue' ? 'j.overdue' : selected.queue === 'waiting' ? `j.status = 'waiting'` : 'j."primaryOwnerId" IS NULL' : `${selected.kind === 'unassigned' ? 'j."primaryOwnerId" IS NULL' : selected.responsibility === 'primary' ? 'j."primaryOwnerId" = ?' : 'EXISTS (SELECT 1 FROM support s WHERE s."jobId" = j.id AND s."userId" = ?)'}
      AND ${selected.filter === 'all' ? 'TRUE' : selected.filter === 'overdue' ? 'j.overdue' : 'j.status = ?'}`;
    const selectionBindings = [
        ...selected.kind === 'member' ? [
            selected.id
        ] : [],
        ...selected.kind !== 'queue' && selected.filter !== 'all' && selected.filter !== 'overdue' ? [
            selected.filter
        ] : []
    ];
    return {
        auth,
        assigned,
        predicate,
        selectionBindings,
        sql: `WITH active AS MATERIALIZED (${base.sql}),
     reportJobs AS MATERIALIZED (
       SELECT j.*, COALESCE(j."completionDeadline" < ?::date, FALSE) AS overdue FROM active j
     ),
     roster AS MATERIALIZED (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m
       JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND (?::boolean = FALSE OR m."userId" = ?)
     ),
     support AS MATERIALIZED (
       SELECT DISTINCT t."jobId", t."userId" FROM "jobTeamMembers" t
       JOIN reportJobs j ON j.id = t."jobId" AND j."workspaceId" = t."workspaceId"
       JOIN roster r ON r.id = t."userId"
     )`,
        bindings: [
            ...base.bindings,
            auth.today,
            context.workspaceId,
            assigned,
            context.userId
        ]
    };
}
async function readTeamJobsReportInTransaction(trx, context, rawQuery, forceAssigned = false) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamJobsQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { auth, assigned, sql, bindings, predicate, selectionBindings } = await teamJobsWorkloadSource(trx, context, query, forceAssigned);
    const selected = query.selected;
    const result = await trx.raw(`${sql},
     participation AS MATERIALIZED (
       SELECT j.id AS "jobId", j."primaryOwnerId" AS member, 'primary' AS responsibility FROM reportJobs j
       WHERE j."primaryOwnerId" IS NOT NULL
       UNION ALL
       SELECT s."jobId", s."userId", 'supporting' FROM support s
     ),
     workloads AS (
       SELECT p.member, p.responsibility, jsonb_build_object(
         'count', COUNT(*), 'overdue', COUNT(*) FILTER (WHERE j.overdue),
         'waiting', COUNT(*) FILTER (WHERE j.status = 'waiting'),
         'statuses', jsonb_build_object(
           'needs-scheduling', COUNT(*) FILTER (WHERE j.status = 'needs-scheduling'),
           'scheduled', COUNT(*) FILTER (WHERE j.status = 'scheduled'),
           'in-progress', COUNT(*) FILTER (WHERE j.status = 'in-progress'),
           'waiting', COUNT(*) FILTER (WHERE j.status = 'waiting')
         )) AS value
       FROM participation p JOIN reportJobs j ON j.id = p."jobId" GROUP BY p.member, p.responsibility
     ),
     empty AS (
       SELECT '{"count":0,"overdue":0,"waiting":0,"statuses":{"needs-scheduling":0,"scheduled":0,"in-progress":0,"waiting":0}}'::jsonb AS value
     ),
     evidence AS MATERIALIZED (SELECT j.* FROM reportJobs j WHERE ${predicate}),
     paging AS (
       SELECT COUNT(*) AS total, LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT * FROM evidence ORDER BY "completionDeadline" ASC NULLS LAST, "jobNumber", id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT EXISTS (
       SELECT 1 FROM support s JOIN reportJobs j ON j.id = s."jobId" WHERE s."userId" = j."primaryOwnerId"
     ) AS invalid,
     (SELECT jsonb_build_object('active', COUNT(*), 'overdue', COUNT(*) FILTER (WHERE overdue),
       'waiting', COUNT(*) FILTER (WHERE status = 'waiting')) FROM reportJobs) AS counts,
     COALESCE((SELECT jsonb_agg(jsonb_build_object(
       'id', r.id, 'label', r.label,
       'primary', COALESCE(p.value, e.value), 'supporting', COALESCE(s.value, e.value)
     ) ORDER BY lower(r.label), r.id)
       FROM roster r CROSS JOIN empty e
       LEFT JOIN workloads p ON p.member = r.id AND p.responsibility = 'primary'
       LEFT JOIN workloads s ON s.member = r.id AND s.responsibility = 'supporting'), '[]'::jsonb) AS members,
     CASE WHEN ?::boolean THEN NULL ELSE
       (SELECT jsonb_build_object('count', COUNT(*), 'overdue', COUNT(*) FILTER (WHERE overdue),
         'waiting', COUNT(*) FILTER (WHERE status = 'waiting'), 'statuses', jsonb_build_object(
           'needs-scheduling', COUNT(*) FILTER (WHERE status = 'needs-scheduling'),
           'scheduled', COUNT(*) FILTER (WHERE status = 'scheduled'),
           'in-progress', COUNT(*) FILTER (WHERE status = 'in-progress'),
           'waiting', COUNT(*) FILTER (WHERE status = 'waiting')))
        FROM reportJobs WHERE "primaryOwnerId" IS NULL) END AS unassigned,
     COALESCE((SELECT jsonb_agg(${teamJobEvidenceJSON}
       ORDER BY j."completionDeadline" ASC NULLS LAST, j."jobNumber", j.id) FROM pageRows j), '[]'::jsonb) AS rows,
     paging.total::text AS "evidenceTotal", paging.page FROM paging`, [
        ...bindings,
        ...selectionBindings,
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize,
        assigned,
        assigned,
        context.userId
    ]);
    const projection = result.rows[0];
    if (!projection) throw new Error('The database returned no Team Jobs workload projection.');
    if (projection.invalid) throw new Error('Team Jobs report encountered overlapping primary and supporting assignments.');
    if (selected.kind === 'member') {
        const members = projection.members;
        if (!Array.isArray(members) || !members.some((member)=>member !== null && typeof member === 'object' && 'id' in member && member.id === selected.id)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
    }
    const evidenceTotal = Number(projection.evidenceTotal);
    if (!Number.isSafeInteger(evidenceTotal) || evidenceTotal < 0) throw new RangeError('Team Jobs evidence count is outside the safe integer range.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamJobsResultSchema"].parse({
        filters: query.filters,
        view: 'team-jobs',
        asOf: auth.asOf.toISOString(),
        today: auth.today,
        timezone: auth.timezone,
        scopeLabel: assigned ? 'My current Job responsibility and supporting participation only.' : auth.scopeLabel,
        scope: assigned ? {
            kind: 'assigned',
            currentMemberId: context.userId
        } : {
            kind: 'workspace'
        },
        counts: projection.counts,
        members: projection.members,
        unassigned: projection.unassigned,
        selected,
        page: projection.page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows: projection.rows
    });
}
}),
"[project]/packages/data/src/reports/team-leads.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readTeamLeadsReportInTransaction",
    ()=>readTeamLeadsReportInTransaction,
    "teamLeadEvidenceJSON",
    ()=>teamLeadEvidenceJSON,
    "teamLeadsWorkloadSource",
    ()=>teamLeadsWorkloadSource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-filters.ts [instrumentation] (ecmascript)");
;
;
;
;
const teamLeadEvidenceJSON = `jsonb_build_object(
  'id', l.id, 'recordId', l.id, 'label', l.name, 'stage', l.stage, 'archived', FALSE,
  'currentOwnerId', l."currentOwnerId", 'ownerState', l."ownerState", 'inactive', l.inactive,
  'cells', jsonb_build_object(
    'created', to_char(l."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'activity', to_char(l."lastActivityAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'owner', CASE WHEN l."ownerState" = 'former' THEN 'Former owner / reassignment needed'
      WHEN l."ownerState" = 'unassigned' THEN 'No current owner'
      ELSE (SELECT r.label FROM roster r WHERE r.id = l."currentOwnerId") END
  ))`;
async function teamLeadsWorkloadSource(trx, context, query, forceAssigned = false) {
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportContext"])(trx, context, forceAssigned);
    const assigned = auth.scope === 'assigned';
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateTeamReportMembers"])(trx, context, assigned, query.filters);
    const selected = query.selected;
    if (assigned && (selected.kind === 'queue' ? selected.queue === 'unassigned' : selected.id !== `member:${context.userId}`)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const scoped = auth.scoped.clone().whereNull('l.archivedAt').whereIn('l.stage', [
        'new',
        'contacted',
        'estimate-sent'
    ]);
    if (query.filters.members.length > 0) scoped.whereIn('l.ownerId', query.filters.members);
    const base = scoped.select('l.*').toSQL();
    const predicate = selected.kind === 'queue' ? selected.queue === 'open' ? 'TRUE' : selected.queue === 'inactive' ? 'l.inactive' : 'l."currentOwnerId" IS NULL' : `l."ownerKey" = ? ${selected.stage === undefined ? '' : 'AND l.stage = ?'} ${selected.inactiveOnly ? 'AND l.inactive' : ''}`;
    const selectionBindings = selected.kind === 'queue' ? [] : [
        selected.id,
        ...selected.stage ? [
            selected.stage
        ] : []
    ];
    return {
        auth,
        assigned,
        predicate,
        selectionBindings,
        sql: `WITH open AS MATERIALIZED (${base.sql}),
     roster AS MATERIALIZED (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND (?::boolean = FALSE OR m."userId" = ?)
     ),
     reportLeads AS MATERIALIZED (
       SELECT l.*, r.id AS "currentOwnerId",
         CASE WHEN r.id IS NULL THEN 'unassigned' ELSE 'member:' || r.id END AS "ownerKey",
         CASE WHEN r.id IS NOT NULL THEN 'member' WHEN l."ownerId" IS NOT NULL THEN 'former' ELSE 'unassigned' END AS "ownerState",
         l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days' AS inactive
       FROM open l LEFT JOIN roster r ON r.id = l."ownerId"
     )`,
        bindings: [
            ...base.bindings,
            context.workspaceId,
            assigned,
            context.userId
        ]
    };
}
async function readTeamLeadsReportInTransaction(trx, context, rawQuery, forceAssigned = false) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamLeadsQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { auth, assigned, sql, bindings, predicate, selectionBindings } = await teamLeadsWorkloadSource(trx, context, query, forceAssigned);
    const selected = query.selected;
    const result = await trx.raw(`${sql},
     groups AS (
       SELECT "ownerKey" AS id, jsonb_build_object(
         'count', COUNT(*), 'inactive', COUNT(*) FILTER (WHERE inactive), 'stages', jsonb_build_object(
           'new', COUNT(*) FILTER (WHERE stage = 'new'),
           'contacted', COUNT(*) FILTER (WHERE stage = 'contacted'),
           'estimate-sent', COUNT(*) FILTER (WHERE stage = 'estimate-sent')
         )) AS value FROM reportLeads GROUP BY "ownerKey"
     ),
     options AS (
       SELECT 'member:' || id AS id, label FROM roster
       UNION ALL SELECT 'unassigned', 'No current owner / reassignment needed' WHERE ?::boolean = FALSE
     ),
     evidence AS MATERIALIZED (SELECT l.* FROM reportLeads l WHERE ${predicate}),
     paging AS (
       SELECT COUNT(*) AS total,
         LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT * FROM evidence ORDER BY "lastActivityAt", id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT (SELECT jsonb_build_object('open', COUNT(*), 'inactive', COUNT(*) FILTER (WHERE inactive),
       'unassigned', COUNT(*) FILTER (WHERE "currentOwnerId" IS NULL)) FROM reportLeads) AS counts,
       COALESCE((SELECT jsonb_agg(
         jsonb_build_object('id', o.id, 'label', o.label) || COALESCE(g.value,
           '{"count":0,"inactive":0,"stages":{"new":0,"contacted":0,"estimate-sent":0}}'::jsonb)
         ORDER BY (o.id = 'unassigned'), lower(o.label), o.id)
         FROM options o LEFT JOIN groups g ON g.id = o.id), '[]'::jsonb) AS owners,
       COALESCE((SELECT jsonb_agg(${teamLeadEvidenceJSON}
         ORDER BY l."lastActivityAt", l.id) FROM pageRows l), '[]'::jsonb) AS rows,
       paging.page, paging.total::text AS "evidenceTotal",
       to_char((CURRENT_TIMESTAMP - INTERVAL '7 days') AT TIME ZONE 'UTC',
         'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "inactivityCutoff"
     FROM paging`, [
        ...bindings,
        assigned,
        ...selectionBindings,
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize
    ]);
    const projection = result.rows[0];
    if (!projection) throw new Error('The database returned no Team Lead workload projection.');
    if (selected.kind === 'owner') {
        const owners = projection.owners;
        if (!Array.isArray(owners) || !owners.some((owner)=>owner !== null && typeof owner === 'object' && 'id' in owner && owner.id === selected.id)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
    }
    const evidenceTotal = Number(projection.evidenceTotal);
    if (!Number.isSafeInteger(evidenceTotal) || evidenceTotal < 0) throw new RangeError('Team Lead evidence count is outside the safe integer range.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamLeadsResultSchema"].parse({
        view: 'team-leads',
        asOf: auth.asOf.toISOString(),
        today: auth.today,
        timezone: auth.timezone,
        scope: assigned ? {
            kind: 'assigned',
            currentMemberId: context.userId
        } : {
            kind: 'workspace'
        },
        scopeLabel: assigned ? 'My current non-archived open Leads only.' : 'Currently authorized non-archived open Leads; missing memberships need reassignment.',
        inactivityCutoff: projection.inactivityCutoff,
        filters: query.filters,
        counts: projection.counts,
        owners: projection.owners,
        selected,
        page: projection.page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows: projection.rows
    });
}
}),
"[project]/packages/data/src/reports/team-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireTeamReportExportScope",
    ()=>requireTeamReportExportScope,
    "resolveTeamReportExportScopes",
    ()=>resolveTeamReportExportScopes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
function resolveTeamReportExportScopes(context) {
    const convert = (scope)=>scope === null ? null : scope === 'workspace' ? {
            kind: 'workspace'
        } : {
            kind: 'assigned',
            currentMemberId: context.userId
        };
    return {
        leads: convert((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveLeadReportExportScope"])(context)),
        jobs: convert((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveJobReportExportScope"])(context))
    };
}
function requireTeamReportExportScope(context, input) {
    const scopes = resolveTeamReportExportScopes(context);
    const scope = input.query.view === 'team-leads' ? scopes.leads : scopes.jobs;
    if (!scope || input.query.workspaceId !== context.workspaceId || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportExportSelectionAllowed"])(input, scope)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return scope;
}
}),
"[project]/packages/data/src/reports/team-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialTeamReportWithAuthorityInTransaction",
    ()=>initialTeamReportWithAuthorityInTransaction,
    "readTeamReportWithAuthorityInTransaction",
    ()=>readTeamReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-jobs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function teamAuthority(context) {
    const reports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (!reports.allowed || reports.resourceKind !== 'report') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const scope = (assigned)=>assigned ? {
            kind: 'assigned',
            currentMemberId: context.userId
        } : {
            kind: 'workspace'
        };
    return {
        leads: reports.sourceScopes?.lead ? scope(reports.sourceScopes.lead === 'assigned') : null,
        jobs: reports.sourceScopes?.job ? scope(reports.sourceScopes.job === 'assigned') : null
    };
}
async function readTeamReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const authority = teamAuthority(context), scope = query.view === 'team-leads' ? authority.leads : authority.jobs;
    if (!scope) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const report = query.view === 'team-leads' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readTeamLeadsReportInTransaction"])(trx, context, query) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readTeamJobsReportInTransaction"])(trx, context, query);
    // Native groups retain the full authorized roster, including zero-workload members.
    const options = report.view === 'team-leads' ? report.owners.filter((owner)=>owner.id !== 'unassigned').map((owner)=>({
            value: owner.id.slice('member:'.length),
            label: owner.label
        })) : report.members.map((member)=>({
            value: member.id,
            label: member.label
        }));
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        authority,
        exportScopes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveTeamReportExportScopes"])(context),
        query,
        report,
        options
    });
}
async function initialTeamReportWithAuthorityInTransaction(trx, context) {
    const authority = teamAuthority(context);
    if (!authority.leads && !authority.jobs) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return readTeamReportWithAuthorityInTransaction(trx, context, authority.leads ? {
        workspaceId: context.workspaceId,
        view: 'team-leads',
        selected: {
            kind: 'queue',
            queue: 'open'
        },
        filters: {
            members: []
        },
        page: 1,
        pageSize: 25
    } : {
        workspaceId: context.workspaceId,
        view: 'team-jobs',
        selected: {
            kind: 'queue',
            queue: 'active'
        },
        filters: {
            members: []
        },
        page: 1,
        pageSize: 25
    });
}
}),
"[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addEstimateReportMoney",
    ()=>addEstimateReportMoney,
    "estimateReportContext",
    ()=>estimateReportContext,
    "estimateReportFrozenMoney",
    ()=>estimateReportFrozenMoney,
    "estimateReportHandoffAllowed",
    ()=>estimateReportHandoffAllowed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/sharing-paper.ts [instrumentation] (ecmascript)");
;
;
;
;
async function estimateReportContext(trx, context, forceAssigned = false) {
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const domain = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read');
    if (!report.allowed || report.resourceKind !== 'report' || !domain.allowed || domain.resourceKind !== 'estimate' || ![
        'workspace',
        'assigned_job'
    ].includes(domain.scope)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const assigned = forceAssigned || report.scope === 'assigned' || domain.scope === 'assigned_job';
    if (assigned && !report.sourceScopes?.job) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const scope = assigned ? 'assigned_job' : 'workspace';
    const includeArchived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'estimates.archive',
        resource: {
            kind: 'estimate',
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            job: null
        }
    }).allowed;
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select('timezone', trx.raw('CURRENT_TIMESTAMP AS "asOf"'), trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.timezone !== 'string' || !(clock.asOf instanceof Date) || typeof clock.today !== 'string') {
        throw new Error('The workspace clock is unavailable for the Estimate report.');
    }
    const scoped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedEstimateQuery"])(trx, context, scope);
    const query = scoped.clone().whereNotExists(trx('estimates as newer').select(trx.raw('1')).whereRaw(`newer."workspaceId" = e."workspaceId" AND newer."estimateNumber" = e."estimateNumber"
       AND newer.revision > e.revision AND (newer."sentAt" IS NOT NULL OR newer."publishedAt" IS NOT NULL)`)).where((builder)=>builder.whereNotNull('e.sentAt').orWhereNotNull('e.publishedAt'));
    return {
        query,
        scoped,
        scope,
        assigned,
        includeArchived,
        clock,
        report
    };
}
function estimateReportHandoffAllowed(context, auth) {
    const leads = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    const jobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    return !auth.assigned && auth.report.scope === 'workspace' && auth.report.sourceScopes?.lead === 'workspace' && auth.report.sourceScopes?.job === 'workspace' && leads.allowed && leads.scope === 'workspace' && jobs.allowed && jobs.scope === 'workspace';
}
function estimateReportFrozenMoney(content, contentHash, number, revision, decision) {
    const snapshot = contentHash === null ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$sharing$2d$paper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["verifiedEstimateFrozenSnapshot"])(content, contentHash);
    const valid = snapshot && snapshot.content.number === number && snapshot.content.revision === revision && (!decision || String(snapshot.amounts.totalCents) === decision.total && (decision.acceptedTotal === undefined || decision.acceptedTotal === decision.total));
    return valid ? {
        kind: 'available',
        preTaxCents: snapshot.amounts.subtotalCents - snapshot.amounts.discountCents,
        taxCents: snapshot.amounts.taxCents,
        customerTotalCents: snapshot.amounts.totalCents
    } : {
        kind: 'unavailable',
        explanation: 'The issued snapshot or saved decision amount could not be verified.'
    };
}
function addEstimateReportMoney(total, value) {
    if (total.kind === 'unavailable') return total;
    if (value.kind === 'unavailable') return value;
    const preTaxCents = total.preTaxCents + value.preTaxCents;
    const customerTotalCents = total.customerTotalCents + value.customerTotalCents;
    return Number.isSafeInteger(preTaxCents) && Number.isSafeInteger(customerTotalCents) ? {
        kind: 'available',
        preTaxCents,
        customerTotalCents
    } : {
        kind: 'unavailable',
        explanation: 'Frozen quote value exceeds the safe integer range.'
    };
}
}),
"[project]/packages/data/src/reports/estimate-filters.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyEstimateReportFilters",
    ()=>applyEstimateReportFilters,
    "estimateReportOwnerSQL",
    ()=>estimateReportOwnerSQL,
    "validateEstimateReportFilters",
    ()=>validateEstimateReportFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
;
const estimateReportOwnerSQL = `CASE WHEN EXISTS (
  SELECT 1 FROM "workspaceMemberships" m WHERE m."workspaceId" = e."workspaceId" AND m."userId" = e."ownerId"
) THEN 'member:' || e."ownerId" ELSE 'unassigned' END`;
function applyEstimateReportFilters(query, filters) {
    if (filters.owners.length > 0) query.whereRaw(`${estimateReportOwnerSQL} IN (${filters.owners.map(()=>'?').join(', ')})`, filters.owners);
    if (filters.parents.length > 0) query.whereIn('e.parentType', filters.parents);
    return query;
}
async function validateEstimateReportFilters(population, filters, trx) {
    if (filters.owners.length === 0 && filters.parents.length === 0) return;
    const options = await population.clone().clearSelect().clearOrder().distinct(trx.raw(`${estimateReportOwnerSQL} AS "ownerKey"`), 'e.parentType');
    if (filters.owners.some((owner)=>!options.some((option)=>option.ownerKey === owner)) || filters.parents.some((parent)=>!options.some((option)=>option.parentType === parent))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
}
}),
"[project]/packages/data/src/reports/estimate-decisions.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDecisionsEvidence",
    ()=>estimateDecisionsEvidence,
    "estimateDecisionsSource",
    ()=>estimateDecisionsSource,
    "readEstimateDecisionsReportInTransaction",
    ()=>readEstimateDecisionsReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-decisions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-filters.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
const sourceRow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    estimateNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    revision: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'accepted',
        'declined'
    ]),
    archived: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    decisionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    decisionVersion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    outcome: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'accepted',
        'declined'
    ]),
    decisionDate: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"],
    recordedDate: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"],
    snapshotId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    decisionSnapshotId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown(),
    contentHash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    snapshotTotalCents: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    acceptedTotalCents: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    ownerKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    parentType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'lead',
        'job'
    ])
});
async function estimateDecisionsSource(trx, context, query, forceAssigned = false) {
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context, forceAssigned);
    const { query: scoped, includeArchived, clock } = auth;
    const options = scoped.clone();
    if (!includeArchived) options.whereNull('e.archivedAt');
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateEstimateReportFilters"])(options, query.filters, trx);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyEstimateReportFilters"])(scoped, query.filters);
    if (query.period.to > clock.today) throw new RangeError('Estimate decision periods cannot extend beyond the workspace date.');
    const source = scoped.whereIn('e.status', [
        'accepted',
        'declined'
    ]).joinRaw(`LEFT JOIN LATERAL (
      SELECT * FROM estimate_decisions d WHERE d."workspaceId" = e."workspaceId" AND d."estimateId" = e.id
      ORDER BY d."estimateVersion" DESC, d.id DESC LIMIT 1
    ) d ON TRUE`).leftJoin('estimate_snapshots as s', function joinSnapshot() {
        this.on('s.workspaceId', 'e.workspaceId').andOn('s.estimateId', 'e.id');
    }).where((builder)=>builder.whereBetween('d.decisionDate', [
            query.period.from,
            query.period.to
        ]).orWhereNull('d.id')).select('e.id', 'e.estimateNumber', 'e.revision', 'e.version', 'e.name', 'e.status', 'e.parentType', trx.raw(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportOwnerSQL"]} AS "ownerKey"`), 's.content', 's.contentHash', 'd.outcome', trx.raw(`e."archivedAt" IS NOT NULL AS archived, d.id AS "decisionId",
        d."estimateVersion" AS "decisionVersion", s.id AS "snapshotId", d."snapshotId" AS "decisionSnapshotId",
        d."snapshotTotalCents"::text AS "snapshotTotalCents", e."acceptedTotalCents"::text AS "acceptedTotalCents",
        to_char(d."decisionDate", 'YYYY-MM-DD') AS "decisionDate",
        to_char(d."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "recordedDate"`, [
        clock.timezone
    ])).orderBy('d.decisionDate', 'desc').orderBy('e.id');
    if (!includeArchived) source.whereNull('e.archivedAt');
    return {
        auth,
        source
    };
}
async function* estimateDecisionsEvidence(trx, context, source, signal) {
    const cursor = `estimate_decisions_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
    const sql = source.toSQL();
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [
        cursor,
        ...sql.bindings
    ]);
    try {
        while(true){
            signal?.throwIfAborted();
            const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ]);
            if (!batch.rows.length) break;
            for (const rawRow of batch.rows){
                signal?.throwIfAborted();
                const row = sourceRow.parse(rawRow);
                if (row.outcome !== row.status || row.decisionVersion > row.version || row.snapshotId !== row.decisionSnapshotId) {
                    throw new Error('The effective Estimate decision does not match its issued revision.');
                }
                const number = `EST-${String(row.estimateNumber).padStart(4, '0')}`;
                const money = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportFrozenMoney"])(row.content, row.contentHash, number, row.revision, {
                    total: row.snapshotTotalCents,
                    ...row.outcome === 'accepted' ? {
                        acceptedTotal: row.acceptedTotalCents
                    } : {}
                });
                yield {
                    ownerKey: row.ownerKey,
                    parentType: row.parentType,
                    familyId: `${context.workspaceId}:${number}`,
                    recordId: row.id,
                    estimateNumber: number,
                    revision: row.revision,
                    decisionVersion: row.decisionVersion,
                    label: row.name,
                    outcome: row.outcome,
                    decisionDate: row.decisionDate,
                    recordedDate: row.recordedDate,
                    archived: row.archived,
                    money
                };
            }
        }
    } finally{
        await trx.raw('CLOSE ??', [
            cursor
        ]);
    }
}
async function readEstimateDecisionsReportInTransaction(trx, context, rawQuery, forceAssigned = false) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateDecisionsQuerySchema"].parse(rawQuery);
    const { auth, source } = await estimateDecisionsSource(trx, context, query, forceAssigned);
    const { scope, assigned, includeArchived, clock } = auth;
    const counts = {
        accepted: 0,
        declined: 0
    };
    let money = {
        kind: 'available',
        preTaxCents: 0,
        customerTotalCents: 0
    };
    let evidenceTotal = 0;
    const requested = [];
    let lastPage = [];
    const offset = (query.page - 1) * query.pageSize;
    for await (const evidence of estimateDecisionsEvidence(trx, context, source)){
        counts[evidence.outcome]++;
        if (!Number.isSafeInteger(counts[evidence.outcome])) throw new RangeError('Estimate decision count exceeds the safe integer range.');
        if (evidence.outcome === 'accepted') money = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addEstimateReportMoney"])(money, evidence.money);
        if (query.selected !== 'decided' && query.selected !== evidence.outcome) continue;
        if (evidenceTotal % query.pageSize === 0) lastPage = [];
        lastPage.push(evidence);
        if (evidenceTotal >= offset && evidenceTotal < offset + query.pageSize) requested.push(evidence);
        evidenceTotal++;
    }
    const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateDecisionsResultSchema"].parse({
        view: 'estimate-decisions',
        workspaceId: context.workspaceId,
        asOf: clock.asOf.toISOString(),
        from: query.period.from,
        to: query.period.to,
        timezone: clock.timezone,
        scope,
        archiveVisibility: includeArchived ? 'included' : 'excluded',
        scopeLabel: `${assigned ? 'Estimates on currently assigned Jobs only.' : 'Currently authorized workspace Estimates.'} ${includeArchived ? 'Archived effective decisions included.' : 'Archived decisions excluded by current access.'}`,
        counts,
        money,
        selected: query.selected,
        page,
        pageSize: query.pageSize,
        evidenceTotal,
        filters: query.filters,
        rows: page === query.page ? requested : lastPage
    });
}
}),
"[project]/packages/data/src/reports/estimate-current.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateCurrentEvidence",
    ()=>estimateCurrentEvidence,
    "estimateCurrentSource",
    ()=>estimateCurrentSource,
    "readEstimateCurrentReportInTransaction",
    ()=>readEstimateCurrentReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-current.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-filters.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
const sourceRow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    estimateNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    revision: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'sent',
        'published',
        'expired',
        'accepted'
    ]),
    issuedDate: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"],
    validUntil: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable(),
    sent: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown(),
    contentHash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    snapshotId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid().nullable(),
    decisionSnapshotId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid().nullable(),
    decisionVersion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable(),
    outcome: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    decisionDate: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].nullable(),
    snapshotTotalCents: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    acceptedTotalCents: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    ownerKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    parentType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'lead',
        'job'
    ])
});
async function estimateCurrentSource(trx, context, query, forceAssigned = false, allowHandoff = true) {
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context, forceAssigned);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateEstimateReportFilters"])(auth.query.clone().whereNull('e.archivedAt'), query.filters, trx);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyEstimateReportFilters"])(auth.query, query.filters);
    const canHandoff = allowHandoff && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportHandoffAllowed"])(context, auth);
    const source = auth.query.whereNull('e.archivedAt').where((builder)=>{
        builder.whereIn('e.status', [
            'sent',
            'published',
            'expired'
        ]);
        if (canHandoff) builder.orWhere((handoff)=>handoff.where('e.status', 'accepted').where('e.parentType', 'lead').whereNotNull('l.id').whereNull('l.archivedAt').whereNotExists(trx('jobs as converted').select(trx.raw('1')).whereRaw(`converted."workspaceId" = e."workspaceId" AND
         (converted."acceptedEstimateId" = e.id OR converted."sourceLeadId" = e."leadId")`)));
    }).leftJoin('estimate_snapshots as s', function joinSnapshot() {
        this.on('s.workspaceId', 'e.workspaceId').andOn('s.estimateId', 'e.id');
    });
    if (canHandoff) source.joinRaw(`LEFT JOIN LATERAL (
    SELECT * FROM estimate_decisions d WHERE d."workspaceId" = e."workspaceId" AND d."estimateId" = e.id
    ORDER BY d."estimateVersion" DESC, d.id DESC LIMIT 1
  ) d ON e.status = 'accepted'`);
    source.select('e.id', 'e.estimateNumber', 'e.revision', 'e.version', 'e.name', 'e.status', 's.content', 's.contentHash', 'e.parentType', trx.raw(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportOwnerSQL"]} AS "ownerKey"`), trx.raw(`s.id AS "snapshotId", e."acceptedTotalCents"::text AS "acceptedTotalCents",
      e."sentAt" IS NOT NULL AS sent,
      to_char(LEAST(s."createdAt", e."sentAt", e."publishedAt") AT TIME ZONE ?, 'YYYY-MM-DD') AS "issuedDate",
      to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntil"`, [
        auth.clock.timezone
    ]), trx.raw(canHandoff ? `d."snapshotId" AS "decisionSnapshotId", d."estimateVersion" AS "decisionVersion",
         d.outcome, d."snapshotTotalCents"::text AS "snapshotTotalCents",
         to_char(d."decisionDate", 'YYYY-MM-DD') AS "decisionDate"` : `NULL AS "decisionSnapshotId", NULL AS "decisionVersion", NULL AS outcome,
         NULL AS "snapshotTotalCents", NULL AS "decisionDate"`)).orderByRaw('LEAST(s."createdAt", e."sentAt", e."publishedAt") ASC, e.id ASC');
    return {
        auth,
        source,
        canHandoff
    };
}
async function* estimateCurrentEvidence(trx, context, source, today, canHandoff, signal) {
    const cursor = `estimate_current_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
    const sql = source.toSQL();
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [
        cursor,
        ...sql.bindings
    ]);
    try {
        while(true){
            signal?.throwIfAborted();
            const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ]);
            if (!batch.rows.length) break;
            for (const rawRow of batch.rows){
                signal?.throwIfAborted();
                const row = sourceRow.parse(rawRow);
                if (row.issuedDate > today) throw new Error('Current Estimate has a future issuance date.');
                const queue = row.status === 'accepted' ? 'handoff' : row.validUntil !== null && row.validUntil < today ? 'expired' : 'awaiting';
                if (queue === 'handoff') {
                    if (!canHandoff || row.outcome !== 'accepted' || row.decisionVersion === null || row.decisionVersion > row.version || row.snapshotId === null || row.decisionSnapshotId !== row.snapshotId || row.decisionDate === null || row.decisionDate < row.issuedDate || row.decisionDate > today || row.snapshotTotalCents === null) throw new Error('Accepted handoff Estimate has inconsistent decision evidence.');
                }
                const number = `EST-${String(row.estimateNumber).padStart(4, '0')}`;
                const money = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportFrozenMoney"])(row.content, row.contentHash, number, row.revision, row.status === 'accepted' && row.snapshotTotalCents !== null ? {
                    total: row.snapshotTotalCents,
                    acceptedTotal: row.acceptedTotalCents
                } : undefined);
                const common = {
                    ownerKey: row.ownerKey,
                    parentType: row.parentType,
                    familyId: `${context.workspaceId}:${number}`,
                    recordId: row.id,
                    estimateNumber: number,
                    revision: row.revision,
                    label: row.name,
                    issuedDate: row.issuedDate,
                    validUntil: row.validUntil,
                    archived: false,
                    money
                };
                let evidence;
                if (row.status === 'accepted') {
                    if (row.decisionDate === null) throw new Error('Accepted handoff decision date is unavailable.');
                    evidence = {
                        ...common,
                        status: 'accepted',
                        decisionDate: row.decisionDate,
                        parentType: 'lead',
                        leadArchived: false,
                        linkage: 'confirmed-absent'
                    };
                } else evidence = {
                    ...common,
                    status: row.status === 'expired' ? row.sent ? 'sent' : 'published' : row.status
                };
                yield {
                    queue,
                    evidence
                };
            }
        }
    } finally{
        await trx.raw('CLOSE ??', [
            cursor
        ]);
    }
}
async function readEstimateCurrentReportInTransaction(trx, context, rawQuery, forceAssigned = false, allowHandoff = true) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateCurrentQuerySchema"].parse(rawQuery);
    const { auth, source, canHandoff } = await estimateCurrentSource(trx, context, query, forceAssigned, allowHandoff);
    const counts = {
        awaiting: 0,
        expired: 0
    };
    let handoffCount = 0;
    let awaitingMoney = {
        kind: 'available',
        preTaxCents: 0,
        customerTotalCents: 0
    };
    let evidenceTotal = 0;
    const requested = [];
    let lastPage = [];
    const offset = (query.page - 1) * query.pageSize;
    for await (const { queue, evidence } of estimateCurrentEvidence(trx, context, source, auth.clock.today, canHandoff)){
        if (queue === 'handoff') handoffCount++;
        else counts[queue]++;
        if (![
            counts.awaiting,
            counts.expired,
            handoffCount
        ].every(Number.isSafeInteger)) {
            throw new RangeError('Current Estimate queue count exceeds the safe integer range.');
        }
        if (queue === 'awaiting') awaitingMoney = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addEstimateReportMoney"])(awaitingMoney, evidence.money);
        if (queue !== query.selected) continue;
        if (evidenceTotal % query.pageSize === 0) lastPage = [];
        lastPage.push(evidence);
        if (evidenceTotal >= offset && evidenceTotal < offset + query.pageSize) requested.push(evidence);
        evidenceTotal++;
    }
    const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateCurrentResultSchema"].parse({
        workspaceId: context.workspaceId,
        view: 'estimate-current',
        asOf: auth.clock.asOf.toISOString(),
        today: auth.clock.today,
        timezone: auth.clock.timezone,
        scope: auth.scope,
        scopeLabel: `${auth.assigned ? 'Current Estimates on assigned Jobs only.' : 'Currently authorized workspace Estimates.'} Archived Estimates excluded.`,
        counts,
        awaitingMoney,
        filters: query.filters,
        handoff: canHandoff ? {
            kind: 'available',
            count: handoffCount
        } : {
            kind: 'unavailable',
            explanation: 'Complete current Lead and Job linkage visibility is required; missing access does not prove no handoff.'
        },
        selected: query.selected,
        page,
        pageSize: query.pageSize,
        evidenceTotal,
        rows: page === query.page ? requested : lastPage
    });
}
}),
"[project]/packages/data/src/reports/estimate-first-quoted.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateFirstQuotedEvidence",
    ()=>estimateFirstQuotedEvidence,
    "estimateFirstQuotedSource",
    ()=>estimateFirstQuotedSource,
    "readEstimateFirstQuotedReportInTransaction",
    ()=>readEstimateFirstQuotedReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-first-quoted.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-filters.ts [instrumentation] (ecmascript)");
;
;
;
;
;
async function estimateFirstQuotedSource(trx, context, query, forceAssigned = false) {
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context, forceAssigned);
    if (query.period.to > auth.clock.today) throw new RangeError('First-quoted periods cannot extend beyond the workspace date.');
    const scoped = auth.scoped.select('e.*').toSQL();
    const candidates = auth.scoped.clone().clearSelect().where((builder)=>builder.whereNotNull('e.sentAt').orWhereNotNull('e.publishedAt').orWhereNot('e.status', 'draft').orWhereExists(trx('estimate_activity as a').select(trx.raw('1')).whereRaw(`a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id AND a.type IN ('sent','published')`))).distinctOn('e.estimateNumber').select('e.*').orderBy('e.estimateNumber').orderBy('e.revision', 'desc').orderBy('e.id', 'desc');
    const options = trx.from(candidates.as('e'));
    if (!auth.includeArchived) options.whereNull('e.archivedAt');
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateEstimateReportFilters"])(options, query.filters, trx);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyEstimateReportFilters"])(trx('current as e').select('e.*', trx.raw(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportOwnerSQL"]} AS "ownerKey"`)), query.filters).toSQL();
    const sql = `WITH authorized AS MATERIALIZED (${scoped.sql}),
     issued AS MATERIALIZED (
       SELECT e.* FROM authorized e
       WHERE e."sentAt" IS NOT NULL OR e."publishedAt" IS NOT NULL
         OR e.status <> 'draft'
         OR EXISTS (SELECT 1 FROM estimate_activity a WHERE a."workspaceId" = e."workspaceId"
           AND a."estimateId" = e.id AND a.type IN ('sent', 'published'))
     ),
     current AS MATERIALIZED (
       SELECT DISTINCT ON ("estimateNumber") * FROM issued ORDER BY "estimateNumber", revision DESC, id DESC
     ),
     filtered AS MATERIALIZED (${filtered.sql}),
     families AS MATERIALIZED (
       SELECT c.*, f.at AS "firstAt", f.revision AS "firstRevision", f.type AS "firstType",
         own.at AS "currentAt",
         EXISTS (
           SELECT 1 FROM issued e WHERE e."estimateNumber" = c."estimateNumber" AND NOT EXISTS (
             SELECT 1 FROM estimate_activity a WHERE a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id
               AND a.type IN ('sent', 'published'))
         ) AS missing,
         EXISTS (
           SELECT 1 FROM issued e JOIN estimate_activity a
             ON a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id
           WHERE e."estimateNumber" = c."estimateNumber" AND a.type IN ('sent', 'published')
             AND ((a.changes->'status'->>'before' = 'draft'
               AND a.changes->'status'->>'after' = a.type) IS NOT TRUE OR a."createdAt" > CURRENT_TIMESTAMP
               OR a."createdAt" < e."createdAt")
         ) AS malformed
       FROM filtered c
       LEFT JOIN LATERAL (
         SELECT a."createdAt" AS at, e.revision, a.type FROM issued e
         JOIN estimate_activity a ON a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id
         WHERE e."estimateNumber" = c."estimateNumber" AND a.type IN ('sent', 'published')
         ORDER BY a."createdAt", e.revision, a.id LIMIT 1
       ) f ON TRUE
       LEFT JOIN LATERAL (
         SELECT a."createdAt" AS at FROM estimate_activity a
         WHERE a."workspaceId" = c."workspaceId" AND a."estimateId" = c.id AND a.type IN ('sent', 'published')
         ORDER BY a."createdAt", a.id LIMIT 1
       ) own ON TRUE
       WHERE (?::boolean OR c."archivedAt" IS NULL)
     ),
     evidence AS MATERIALIZED (
       SELECT *, to_char("firstAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "firstDate",
         to_char("currentAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "currentDate"
       FROM families WHERE NOT missing AND "firstAt" IS NOT NULL AND "currentAt" IS NOT NULL
         AND ("firstAt" AT TIME ZONE ?)::date BETWEEN ?::date AND ?::date
     )`;
    const bindings = [
        ...scoped.bindings,
        ...filtered.bindings,
        auth.includeArchived,
        auth.clock.timezone,
        auth.clock.timezone,
        auth.clock.timezone,
        query.period.from,
        query.period.to
    ];
    return {
        auth,
        sql,
        bindings
    };
}
const evidenceJSON = `jsonb_build_object(
  'ownerKey', "ownerKey", 'parentType', "parentType",
  'familyId', ? || ':EST-' || CASE WHEN length("estimateNumber"::text) < 4 THEN lpad("estimateNumber"::text, 4, '0') ELSE "estimateNumber"::text END,
  'estimateNumber', 'EST-' || CASE WHEN length("estimateNumber"::text) < 4 THEN lpad("estimateNumber"::text, 4, '0') ELSE "estimateNumber"::text END,
  'recordId', id, 'label', name, 'firstIssuedDate', "firstDate", 'firstIssuedRevision', "firstRevision",
  'firstIssuedVia', CASE WHEN "firstType" = 'sent' THEN 'send' ELSE 'publish' END,
  'currentIssuedRevision', revision, 'currentIssuedDate', "currentDate",
  'currentStatus', CASE WHEN status IN ('sent','published') AND "validUntil" < ?::date THEN 'expired' ELSE status END,
  'archived', "archivedAt" IS NOT NULL
)`;
async function* estimateFirstQuotedEvidence(trx, source, workspaceId, signal) {
    const cursor = `estimate_first_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${source.sql}
    SELECT ${evidenceJSON} AS row FROM evidence ORDER BY "firstAt" DESC, id`, [
        cursor,
        ...source.bindings,
        workspaceId,
        source.auth.clock.today
    ]);
    try {
        while(true){
            signal?.throwIfAborted();
            const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ]);
            if (!batch.rows.length) break;
            for (const row of batch.rows){
                signal?.throwIfAborted();
                yield __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateFirstQuotedResultSchema"].shape.rows.element.parse(row.row);
            }
        }
    } finally{
        await trx.raw('CLOSE ??', [
            cursor
        ]);
    }
}
async function readEstimateFirstQuotedReportInTransaction(trx, context, rawQuery, forceAssigned = false) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateFirstQuotedQuerySchema"].parse(rawQuery);
    const source = await estimateFirstQuotedSource(trx, context, query, forceAssigned);
    const { auth } = source;
    const projection = await trx.raw(`${source.sql},
     paging AS (
       SELECT COUNT(*) AS total, LEAST(?::int, GREATEST(1, CEIL(COUNT(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (
       SELECT * FROM evidence ORDER BY "firstAt" DESC, id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     )
     SELECT paging.total::text, paging.page,
       EXISTS (SELECT 1 FROM families WHERE missing) AS missing,
       EXISTS (SELECT 1 FROM families WHERE malformed OR status NOT IN ('sent','published','accepted','declined','expired','void')
         OR "firstRevision" > revision OR "currentAt" < "firstAt") AS invalid,
       COALESCE((SELECT jsonb_agg(${evidenceJSON} ORDER BY "firstAt" DESC, id) FROM pageRows), '[]'::jsonb) AS rows FROM paging`, [
        ...source.bindings,
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize,
        context.workspaceId,
        auth.clock.today
    ]);
    const result = projection.rows[0];
    if (!result) throw new Error('The database returned no first-quoted Estimate projection.');
    if (result.invalid) throw new Error('First-quoted Estimate history has inconsistent initial issuance evidence.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateFirstQuotedResultSchema"].parse({
        workspaceId: context.workspaceId,
        view: 'estimate-first-quoted',
        asOf: auth.clock.asOf.toISOString(),
        from: query.period.from,
        to: query.period.to,
        today: auth.clock.today,
        timezone: auth.clock.timezone,
        scope: auth.scope,
        archiveVisibility: auth.includeArchived ? 'included' : 'excluded',
        scopeLabel: `${auth.assigned ? 'Estimates on currently assigned Jobs only.' : 'Currently authorized workspace Estimate families.'} First initial Send/Publish history; no monetary or decision attribution.`,
        total: Number(result.total),
        page: result.page,
        pageSize: query.pageSize,
        rows: result.rows,
        filters: query.filters,
        coverage: result.missing ? {
            kind: 'partial',
            explanation: 'Some authorized issued families lack initial Send/Publish history and are excluded; no issuance dates are inferred.'
        } : {
            kind: 'complete'
        }
    });
}
}),
"[project]/packages/data/src/reports/estimate-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveEstimateReportExportAccess",
    ()=>resolveEstimateReportExportAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
;
function resolveEstimateReportExportAccess(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.export'
    }).allowed) return null;
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const read = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read');
    const exportAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.export');
    if (!report.allowed || report.resourceKind !== 'report' || !read.allowed || read.resourceKind !== 'estimate' || ![
        'workspace',
        'assigned_job'
    ].includes(read.scope) || !exportAccess.allowed || exportAccess.resourceKind !== 'estimate' || ![
        'workspace',
        'assigned_job'
    ].includes(exportAccess.scope)) return null;
    const assigned = report.scope === 'assigned' || read.scope === 'assigned_job' || exportAccess.scope === 'assigned_job';
    if (assigned && !report.sourceScopes?.job) return null;
    const leadsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    const leadsExport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.export');
    const jobsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const jobsExport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.export');
    const handoff = !assigned && report.sourceScopes?.lead === 'workspace' && report.sourceScopes.job === 'workspace' && leadsRead.allowed && leadsRead.resourceKind === 'lead' && leadsRead.scope === 'workspace' && leadsExport.allowed && leadsExport.resourceKind === 'lead' && leadsExport.scope === 'workspace' && jobsRead.allowed && jobsRead.resourceKind === 'job' && jobsRead.scope === 'workspace' && jobsExport.allowed && jobsExport.resourceKind === 'job' && jobsExport.scope === 'workspace';
    return {
        scope: assigned ? 'assigned_job' : 'workspace',
        handoff
    };
}
}),
"[project]/packages/data/src/reports/estimate-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialEstimateReportWithAuthorityInTransaction",
    ()=>initialEstimateReportWithAuthorityInTransaction,
    "readEstimateReportWithAuthorityInTransaction",
    ()=>readEstimateReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-filters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-decisions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-first-quoted.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-current.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
async function readEstimateReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context);
    const population = auth.query.clone();
    if (query.view === 'estimate-current' || !auth.includeArchived) population.whereNull('e.archivedAt');
    const facets = await population.clearSelect().clearOrder().distinct(trx.raw(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportOwnerSQL"]} AS "ownerKey"`), 'e.parentType');
    const ownerKeys = [
        ...new Set(facets.map((row)=>row.ownerKey))
    ];
    const memberIds = ownerKeys.filter((key)=>key !== 'unassigned').map((key)=>key.slice('member:'.length));
    const members = memberIds.length ? await trx('users').select('id', 'name').whereIn('id', memberIds) : [];
    const owners = ownerKeys.map((value)=>{
        const label = value === 'unassigned' ? 'No current owner / reassignment needed' : members.find((member)=>member.id === value.slice('member:'.length))?.name;
        if (!label) throw new Error('An authorized Estimate report owner label is unavailable.');
        return {
            value,
            label
        };
    }).sort((a, b)=>a.label.localeCompare(b.label, 'en') || a.value.localeCompare(b.value, 'en'));
    const parents = [
        'lead',
        'job'
    ].filter((value)=>facets.some((row)=>row.parentType === value)).map((value)=>({
            value,
            label: value === 'lead' ? 'Lead' : 'Job'
        }));
    const report = query.view === 'estimate-decisions' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateDecisionsReportInTransaction"])(trx, context, query) : query.view === 'estimate-first-quoted' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateFirstQuotedReportInTransaction"])(trx, context, query) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateCurrentReportInTransaction"])(trx, context, query);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        today: auth.clock.today,
        query,
        report,
        authority: {
            scope: auth.scope,
            archives: auth.includeArchived ? 'included' : 'excluded',
            money: true,
            handoff: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportHandoffAllowed"])(context, auth)
        },
        exportAccess: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEstimateReportExportAccess"])(context),
        options: {
            context: query.view === 'estimate-current' ? 'current' : 'period',
            owners,
            parents
        }
    });
}
async function initialEstimateReportWithAuthorityInTransaction(trx, context) {
    const { clock } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context);
    return readEstimateReportWithAuthorityInTransaction(trx, context, {
        workspaceId: context.workspaceId,
        view: 'estimate-decisions',
        selected: 'accepted',
        period: {
            from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(clock.today, -29),
            to: clock.today
        },
        filters: {
            owners: [],
            parents: []
        },
        page: 1,
        pageSize: 25
    });
}
}),
"[project]/packages/data/src/reports/calendar-context.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarReportContext",
    ()=>calendarReportContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
;
;
async function calendarReportContext(trx, context, workspaceId, exportScopes) {
    if (workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const calendar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read');
    const jobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const orders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    if (!report.allowed || !calendar.allowed || ![
        'workspace',
        'own_assigned'
    ].includes(calendar.scope) || !jobs.allowed && !orders.allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const own = report.scope === 'assigned' || calendar.scope === 'own_assigned';
    const wide = !own && (jobs.allowed && jobs.scope === 'workspace' && (!exportScopes || exportScopes.jobs.kind === 'available' && exportScopes.jobs.scope === 'workspace') || orders.allowed && orders.scope === 'workspace' && (!exportScopes || exportScopes.workOrders.kind === 'available' && exportScopes.workOrders.scope === 'workspace'));
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select('timezone', trx.raw('CURRENT_TIMESTAMP AS "asOf"'), trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.timezone !== 'string' || !(clock.asOf instanceof Date) || typeof clock.today !== 'string') {
        throw new Error('The workspace clock is unavailable for Calendar reporting.');
    }
    return {
        own,
        wide,
        timezone: clock.timezone,
        today: clock.today,
        asOf: clock.asOf.toISOString()
    };
}
}),
"[project]/packages/data/src/reports/calendar-filters.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarReportRecordLabelSQL",
    ()=>calendarReportRecordLabelSQL,
    "calendarReportRosterFilterSQL",
    ()=>calendarReportRosterFilterSQL,
    "filteredCalendarReportRecords",
    ()=>filteredCalendarReportRecords,
    "readCalendarReportFilterOptionsInTransaction",
    ()=>readCalendarReportFilterOptionsInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-filters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/calendar/read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-context.ts [instrumentation] (ecmascript)");
;
;
;
;
function calendarReportRecordLabelSQL(alias) {
    return `CASE WHEN ${alias}.type = 'job' THEN 'J-' ELSE 'WO-' END ||
    CASE WHEN length(${alias}.number::text) < 4 THEN lpad(${alias}.number::text,4,'0') ELSE ${alias}.number::text END ||
    ' / ' || ${alias}.title`;
}
function population(trx, context, own, kind, exportScopes) {
    return trx.from((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$calendar$2f$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedCalendarRecordsQuery"])(trx, context, undefined, own, exportScopes).as('v')).modify((query)=>{
        if (kind === 'dated') query.whereNotNull('v.scheduledDate');
        else query.whereNull('v.scheduledDate');
    });
}
async function readCalendarReportFilterOptionsInTransaction(trx, context, rawQuery, exportScopes) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportFilterOptionsQuerySchema"].parse(rawQuery);
    const { own, wide } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportContext"])(trx, context, query.workspaceId, exportScopes);
    const source = population(trx, context, own, query.context, exportScopes).select('v.type', 'v.people').toSQL();
    const projection = await trx.raw(`WITH visible AS MATERIALIZED (${source.sql}),
     people AS (SELECT DISTINCT unnest(people) AS id FROM visible),
     roster AS (
       SELECT m."userId" AS value, CASE WHEN ?::boolean THEN 'Me' ELSE u.name END AS label
       FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR m."userId" = ? OR
           EXISTS (SELECT 1 FROM people p WHERE p.id = m."userId") END
     )
     SELECT COALESCE((SELECT jsonb_agg(jsonb_build_object('value', value, 'label', label) ORDER BY lower(label), value)
       FROM roster), '[]'::jsonb) AS participants,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('value', type, 'label',
         CASE WHEN type = 'job' THEN 'Job' ELSE 'Work Order' END) ORDER BY type)
         FROM (SELECT DISTINCT type FROM visible) types), '[]'::jsonb) AS "recordTypes"`, [
        ...source.bindings,
        own,
        context.workspaceId,
        own,
        context.userId,
        wide,
        context.userId
    ]);
    const result = projection.rows[0];
    if (!result) throw new Error('The database returned no Calendar report filter options.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportFilterOptionsResultSchema"].parse({
        workspaceId: context.workspaceId,
        context: query.context,
        scope: own ? {
            kind: 'own',
            viewerId: context.userId
        } : {
            kind: 'workspace'
        },
        ...result
    });
}
async function filteredCalendarReportRecords(trx, context, own, filters, kind, period, exportScopes) {
    if (filters.participants.length || filters.recordTypes.length) {
        const options = await readCalendarReportFilterOptionsInTransaction(trx, context, {
            workspaceId: context.workspaceId,
            context: kind
        }, exportScopes);
        if (filters.participants.some((id)=>!options.participants.some((option)=>option.value === id)) || filters.recordTypes.some((type)=>!options.recordTypes.some((option)=>option.value === type))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const records = population(trx, context, own, kind, exportScopes).select('v.*');
    if (period) records.whereBetween('v.scheduledDate', [
        period.from,
        period.to
    ]);
    if (filters.recordTypes.length) records.whereIn('v.type', filters.recordTypes);
    const people = trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').whereRaw('m."userId" = ANY(v.people)').modify((query)=>{
        if (own) query.where('m.userId', context.userId);
        if (filters.participants.length) query.whereIn('m.userId', filters.participants);
    });
    if (filters.participants.length) records.whereExists(people.clone().select(trx.raw('1')));
    const normalized = people.select('m.userId').orderBy('m.userId').toSQL();
    return trx.from(records.as('v')).select('v.visitId', 'v.scheduledDate', 'v.arrivalWindow', 'v.id', 'v.type', 'v.number', 'v.title', 'v.status', trx.raw(`ARRAY(${normalized.sql}) AS people`, normalized.bindings)).toSQL();
}
function calendarReportRosterFilterSQL(filters, column) {
    return filters.participants.length === 0 ? {
        sql: '',
        bindings: []
    } : {
        sql: ` AND ${column} IN (${filters.participants.map(()=>'?').join(', ')})`,
        bindings: filters.participants
    };
}
}),
"[project]/packages/data/src/reports/calendar-scheduled.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readCalendarScheduledReportInTransaction",
    ()=>readCalendarScheduledReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-scheduled.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-filters.ts [instrumentation] (ecmascript)");
;
;
;
async function readCalendarScheduledReportInTransaction(trx, context, rawQuery, exportScopes) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarScheduledQuerySchema"].parse(rawQuery);
    const { own, wide, ...clock } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportContext"])(trx, context, query.workspaceId, exportScopes);
    const source = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filteredCalendarReportRecords"])(trx, context, own, query.filters, 'dated', query.period, exportScopes);
    const roster = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRosterFilterSQL"])(query.filters, 'm."userId"');
    const visitEvidence = query.selected === 'visits';
    const projection = await trx.raw(`WITH visible AS MATERIALIZED (${source.sql}),
     scheduled AS MATERIALIZED (
       SELECT * FROM visible WHERE "scheduledDate"::date BETWEEN ?::date AND ?::date
     ),
     participants AS MATERIALIZED (
       SELECT DISTINCT s."visitId", s."scheduledDate"::date AS date, m."userId" AS id
       FROM scheduled s CROSS JOIN LATERAL unnest(s.people) p(id)
       JOIN "workspaceMemberships" m ON m."workspaceId" = ?::uuid AND m."userId" = p.id
       JOIN users u ON u.id = m."userId" AND u."deletionRequestedAt" IS NULL
       WHERE (?::boolean = FALSE OR m."userId" = ?)
     ),
     visitPeople AS MATERIALIZED (
       SELECT "visitId", jsonb_agg(id ORDER BY id) AS people FROM participants GROUP BY "visitId"
     ),
     visits AS MATERIALIZED (
       SELECT s."visitId" AS id, s."scheduledDate"::date AS date,
         min(s.title) AS label, jsonb_agg(jsonb_build_object(
           'id', s.id, 'recordId', s.id, 'type', s.type, 'participantIds', to_jsonb(s.people),
           'label', ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRecordLabelSQL"])('s')}
         ) ORDER BY s.type, s.id) AS records,
         COALESCE(p.people, '[]'::jsonb) AS people
       FROM scheduled s LEFT JOIN visitPeople p ON p."visitId" = s."visitId"
       GROUP BY s."visitId", s."scheduledDate", p.people
     ),
     dates AS (SELECT generate_series(?::date, ?::date, INTERVAL '1 day')::date AS date),
     roster AS (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR
           m."userId" = ? OR EXISTS (SELECT 1 FROM participants p WHERE p.id = m."userId") END${roster.sql}
     ),
     personDays AS MATERIALIZED (
       SELECT r.id, r.label, d.date, count(p."visitId")::int AS count
       FROM roster r CROSS JOIN dates d LEFT JOIN participants p ON p.id = r.id AND p.date = d.date
       GROUP BY r.id, r.label, d.date
     ),
     busy AS MATERIALIZED (SELECT * FROM personDays WHERE count >= ?::int),
     evidence AS MATERIALIZED (${visitEvidence ? 'SELECT id, date FROM visits' : 'SELECT id, date FROM busy'}),
     paging AS (
       SELECT count(*) AS total, LEAST(?::int, GREATEST(1, CEIL(count(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS (SELECT * FROM evidence ORDER BY date, id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging))
     SELECT (SELECT jsonb_build_object('visits', count(*), 'busyPersonDays', (SELECT count(*) FROM busy)) FROM visits) AS counts,
       (SELECT jsonb_agg(jsonb_build_object('date', to_char(d.date,'YYYY-MM-DD'),
         'count', (SELECT count(*) FROM visits v WHERE v.date = d.date),
         'unassignedCount', (SELECT count(*) FROM visits v WHERE v.date = d.date AND jsonb_array_length(v.people) = 0)
       ) ORDER BY d.date) FROM dates d) AS days,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', r.id, 'label', r.label,
         'counts', (SELECT jsonb_agg(p.count ORDER BY p.date) FROM personDays p WHERE p.id = r.id))
         ORDER BY lower(r.label), r.id) FROM roster r), '[]'::jsonb) AS members,
       ${visitEvidence ? `COALESCE((SELECT jsonb_agg(jsonb_build_object('id', v.id, 'label', v.label,
         'date', to_char(v.date,'YYYY-MM-DD'), 'participantIds', v.people, 'records', v.records)
         ORDER BY v.date, v.id) FROM pageRows p JOIN visits v ON v.id = p.id), '[]'::jsonb)` : `COALESCE((SELECT jsonb_agg(jsonb_build_object('personId', id, 'date', to_char(date,'YYYY-MM-DD'))
         ORDER BY date, id) FROM pageRows), '[]'::jsonb)`} AS rows,
       paging.total::text, paging.page FROM paging`, [
        ...source.bindings,
        query.period.from,
        query.period.to,
        context.workspaceId,
        own,
        context.userId,
        query.period.from,
        query.period.to,
        context.workspaceId,
        own,
        context.userId,
        wide,
        context.userId,
        ...roster.bindings,
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarScheduledBusyThreshold"],
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize
    ]);
    const result = projection.rows[0];
    if (!result) throw new Error('The database returned no scheduled Calendar projection.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarScheduledResultSchema"].parse({
        workspaceId: context.workspaceId,
        view: 'calendar-scheduled',
        from: query.period.from,
        to: query.period.to,
        today: clock.today,
        asOf: clock.asOf,
        timezone: clock.timezone,
        scope: own ? {
            kind: 'own',
            viewerId: context.userId
        } : {
            kind: 'workspace'
        },
        scopeLabel: own ? 'My current scheduled visits and authorized active records only.' : 'Current canonical visits with currently authorized active records; participant counts are non-additive.',
        counts: result.counts,
        days: result.days,
        members: result.members,
        filters: query.filters,
        evidence: {
            kind: query.selected,
            rows: result.rows
        },
        evidenceTotal: Number(result.total),
        page: result.page,
        pageSize: query.pageSize
    });
}
}),
"[project]/packages/data/src/reports/calendar-review.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readCalendarReviewReportInTransaction",
    ()=>readCalendarReviewReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-review.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-filters.ts [instrumentation] (ecmascript)");
;
;
;
async function readCalendarReviewReportInTransaction(trx, context, rawQuery, exportScopes) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReviewQuerySchema"].parse(rawQuery);
    const { own, wide, ...clock } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportContext"])(trx, context, query.workspaceId, exportScopes);
    const source = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filteredCalendarReportRecords"])(trx, context, own, query.filters, 'dated', query.period, exportScopes);
    const roster = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRosterFilterSQL"])(query.filters, 'm."userId"');
    const overlaps = query.selected === 'overlaps';
    const projection = await trx.raw(`WITH visible AS (${source.sql}),
     scheduled AS MATERIALIZED (
       SELECT "visitId", "scheduledDate"::date AS date, "arrivalWindow" AS span, id, type, number, title, people
       FROM visible WHERE "scheduledDate"::date BETWEEN ?::date AND ?::date
     ),
     visitDates AS MATERIALIZED (SELECT DISTINCT "visitId", date, span FROM scheduled),
     participants AS MATERIALIZED (
       SELECT DISTINCT s."visitId", s.date, m."userId" AS id
       FROM scheduled s CROSS JOIN LATERAL unnest(s.people) p(id)
       JOIN "workspaceMemberships" m ON m."workspaceId" = ?::uuid AND m."userId" = p.id
       JOIN users u ON u.id = m."userId" AND u."deletionRequestedAt" IS NULL
       WHERE (?::boolean = FALSE OR m."userId" = ?)
     ),
     pairs AS MATERIALIZED (
       SELECT l.date, l.id AS "personId", l."visitId" AS "leftVisitId", r."visitId" AS "rightVisitId"
       FROM participants l JOIN participants r ON r.id = l.id AND r.date = l.date AND l."visitId" < r."visitId"
       JOIN visitDates lv ON lv."visitId" = l."visitId" JOIN visitDates rv ON rv."visitId" = r."visitId"
       WHERE lv.span IS NOT NULL AND rv.span IS NOT NULL
         AND left(lv.span, 5) < right(rv.span, 5) AND left(rv.span, 5) < right(lv.span, 5)
     ),
     past AS MATERIALIZED (SELECT * FROM visitDates WHERE date < ?::date),
     evidence AS MATERIALIZED (${overlaps ? 'SELECT * FROM pairs' : 'SELECT "visitId", date FROM past'}),
     paging AS (
       SELECT count(*) AS total, LEAST(?::int, GREATEST(1, CEIL(count(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS MATERIALIZED (
       SELECT * FROM evidence ORDER BY date, ${overlaps ? '"personId", "leftVisitId", "rightVisitId"' : '"visitId"'}
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)
     ),
     pageVisits AS (${overlaps ? 'SELECT "leftVisitId" AS id FROM pageRows UNION SELECT "rightVisitId" AS id FROM pageRows' : 'SELECT "visitId" AS id FROM pageRows'}),
     visits AS (
       SELECT s."visitId" AS id, s.date, s.span, min(s.title) AS label,
         jsonb_agg(jsonb_build_object('id', s.id, 'recordId', s.id, 'type', s.type, 'participantIds', to_jsonb(s.people),
           'label', ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRecordLabelSQL"])('s')}
         ) ORDER BY s.type, s.id) AS records,
         COALESCE((SELECT jsonb_agg(p.id ORDER BY p.id) FROM participants p WHERE p."visitId" = s."visitId"), '[]'::jsonb) AS people
       FROM scheduled s JOIN pageVisits pv ON pv.id = s."visitId" GROUP BY s."visitId", s.date, s.span
     ),
     roster AS (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR
           m."userId" = ? OR EXISTS (SELECT 1 FROM participants p WHERE p.id = m."userId") END${roster.sql}
     )
     SELECT (SELECT jsonb_build_object('scheduledVisits', count(*), 'missingWindows', count(*) FILTER (WHERE span IS NULL),
       'overlapPairs', (SELECT count(*) FROM pairs), 'pastVisits', (SELECT count(*) FROM past)) FROM visitDates) AS counts,
       (SELECT count(*)::text FROM visitDates WHERE span IS NOT NULL AND
         (span !~ '^([01][0-9]|2[0-3]):[0-5][0-9]-([01][0-9]|2[0-3]):[0-5][0-9]$' OR left(span, 5) >= right(span, 5))) AS "invalidWindows",
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label) ORDER BY lower(label), id)
         FROM roster), '[]'::jsonb) AS members,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label, 'date', to_char(date,'YYYY-MM-DD'),
         'arrivalWindow', span, 'participantIds', people, 'records', records) ORDER BY date, id)
         FROM visits), '[]'::jsonb) AS visits,
       ${overlaps ? `jsonb_build_object('kind', 'overlaps', 'rows',
         COALESCE((SELECT jsonb_agg(jsonb_build_object('personId', "personId",
           'leftVisitId', "leftVisitId", 'rightVisitId', "rightVisitId") ORDER BY date, "personId", "leftVisitId", "rightVisitId")
           FROM pageRows), '[]'::jsonb))` : `jsonb_build_object('kind', 'past', 'visitIds',
         COALESCE((SELECT jsonb_agg("visitId" ORDER BY date, "visitId") FROM pageRows), '[]'::jsonb))`} AS evidence,
       paging.total::text, paging.page FROM paging`, [
        ...source.bindings,
        query.period.from,
        query.period.to,
        context.workspaceId,
        own,
        context.userId,
        clock.today,
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize,
        context.workspaceId,
        own,
        context.userId,
        wide,
        context.userId,
        ...roster.bindings
    ]);
    const result = projection.rows[0];
    if (!result) throw new Error('The database returned no Calendar schedule-review projection.');
    if (result.invalidWindows !== '0') throw new Error('An authorized scheduled visit has an invalid persisted arrival window.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReviewResultSchema"].parse({
        workspaceId: context.workspaceId,
        view: 'calendar-review',
        from: query.period.from,
        to: query.period.to,
        ...clock,
        scope: own ? {
            kind: 'own',
            viewerId: context.userId
        } : {
            kind: 'workspace'
        },
        scopeLabel: own ? 'My current scheduled visits and known window pairs only; past dates prompt review, not missed attendance.' : 'Current authorized scheduled visits and known window pairs per person; participant pair counts are non-additive.',
        counts: result.counts,
        members: result.members,
        visits: result.visits,
        evidence: result.evidence,
        filters: query.filters,
        evidenceTotal: Number(result.total),
        page: result.page,
        pageSize: query.pageSize
    });
}
}),
"[project]/packages/data/src/reports/calendar-unscheduled.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readCalendarUnscheduledReportInTransaction",
    ()=>readCalendarUnscheduledReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-unscheduled.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-filters.ts [instrumentation] (ecmascript)");
;
;
;
async function readCalendarUnscheduledReportInTransaction(trx, context, rawQuery, exportScopes) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarUnscheduledQuerySchema"].parse(rawQuery);
    const { own, wide, ...clock } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportContext"])(trx, context, query.workspaceId, exportScopes);
    const source = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filteredCalendarReportRecords"])(trx, context, own, query.filters, 'unscheduled', undefined, exportScopes);
    const roster = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRosterFilterSQL"])(query.filters, 'm."userId"');
    const visitEvidence = query.selected === 'visits';
    const projection = await trx.raw(`WITH visible AS (${source.sql}),
     unscheduled AS MATERIALIZED (
       SELECT "visitId", id, type, number, title, status, people FROM visible WHERE "scheduledDate" IS NULL
     ),
     participants AS MATERIALIZED (
       SELECT DISTINCT s."visitId", m."userId" AS id
       FROM unscheduled s CROSS JOIN LATERAL unnest(s.people) p(id)
       JOIN "workspaceMemberships" m ON m."workspaceId" = ?::uuid AND m."userId" = p.id
       JOIN users u ON u.id = m."userId" AND u."deletionRequestedAt" IS NULL
       WHERE (?::boolean = FALSE OR m."userId" = ?)
     ),
     visitIds AS MATERIALIZED (SELECT DISTINCT "visitId" FROM unscheduled),
     evidence AS MATERIALIZED (${visitEvidence ? 'SELECT "visitId", "visitId" AS id FROM visitIds' : 'SELECT "visitId", id FROM unscheduled WHERE type = ?'}),
     paging AS (
       SELECT count(*) AS total, LEAST(?::int, GREATEST(1, CEIL(count(*)::numeric / ?::int)::int)) AS page FROM evidence
     ),
     pageRows AS MATERIALIZED (SELECT * FROM evidence ORDER BY "visitId", id
       LIMIT ?::int OFFSET (SELECT (page::bigint - 1) * ?::int FROM paging)),
     pageVisits AS (SELECT DISTINCT "visitId" FROM pageRows),
     visits AS (
       SELECT s."visitId" AS id, min(s.title) AS label, jsonb_agg(
         jsonb_build_object('id', s.id, 'recordId', s.id, 'type', s.type, 'status', s.status, 'participantIds', to_jsonb(s.people),
           'label', ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRecordLabelSQL"])('s')})
         || CASE WHEN s.type = 'work_order' THEN jsonb_build_object('archived', false) ELSE '{}'::jsonb END
         ORDER BY s.type, s.id) AS records,
         COALESCE((SELECT jsonb_agg(p.id ORDER BY p.id) FROM participants p WHERE p."visitId" = s."visitId"), '[]'::jsonb) AS people
       FROM unscheduled s JOIN pageVisits pv ON pv."visitId" = s."visitId" GROUP BY s."visitId"
     ),
     roster AS (
       SELECT m."userId" AS id, u.name AS label FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR
           m."userId" = ? OR EXISTS (SELECT 1 FROM participants p WHERE p.id = m."userId") END${roster.sql}
     )
     SELECT jsonb_build_object('visits', (SELECT count(*) FROM visitIds),
       'jobs', (SELECT count(*) FROM unscheduled WHERE type = 'job'),
       'workOrders', (SELECT count(*) FROM unscheduled WHERE type = 'work_order')) AS counts,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label) ORDER BY lower(label), id)
         FROM roster), '[]'::jsonb) AS members,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'label', label, 'scheduledDate', NULL,
         'participantIds', people, 'records', records) ORDER BY id) FROM visits), '[]'::jsonb) AS visits,
       ${visitEvidence ? `jsonb_build_object('kind', 'visits', 'visitIds',
         COALESCE((SELECT jsonb_agg("visitId" ORDER BY "visitId") FROM pageRows), '[]'::jsonb))` : `jsonb_build_object('kind', ?::text, 'records',
         COALESCE((SELECT jsonb_agg(jsonb_build_object('visitId', "visitId", 'recordId', id)
           ORDER BY "visitId", id) FROM pageRows), '[]'::jsonb))`} AS evidence,
       paging.total::text, paging.page FROM paging`, [
        ...source.bindings,
        context.workspaceId,
        own,
        context.userId,
        ...visitEvidence ? [] : [
            query.selected === 'jobs' ? 'job' : 'work_order'
        ],
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize,
        context.workspaceId,
        own,
        context.userId,
        wide,
        context.userId,
        ...roster.bindings,
        ...visitEvidence ? [] : [
            query.selected
        ]
    ]);
    const result = projection.rows[0];
    if (!result) throw new Error('The database returned no unscheduled Calendar projection.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarUnscheduledResultSchema"].parse({
        workspaceId: context.workspaceId,
        view: 'calendar-unscheduled',
        ...clock,
        scope: own ? {
            kind: 'own',
            viewerId: context.userId
        } : {
            kind: 'workspace'
        },
        scopeLabel: own ? 'My current unscheduled visits and authorized active records only.' : 'Current unscheduled canonical visits and authorized active records; record and participant counts are non-additive.',
        counts: result.counts,
        members: result.members,
        visits: result.visits,
        evidence: result.evidence,
        filters: query.filters,
        evidenceTotal: Number(result.total),
        page: result.page,
        pageSize: query.pageSize
    });
}
}),
"[project]/packages/data/src/reports/calendar-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canExportCalendarDataset",
    ()=>canExportCalendarDataset,
    "requireCalendarExportAccess",
    ()=>requireCalendarExportAccess,
    "resolveCalendarExportAccess",
    ()=>resolveCalendarExportAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
;
;
function resolveCalendarExportAccess(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.export'
    }).allowed) return null;
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const calendar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read');
    if (!report.allowed || report.resourceKind !== 'report' || !calendar.allowed || calendar.resourceKind !== 'calendar' || ![
        'workspace',
        'own_assigned'
    ].includes(calendar.scope)) return null;
    const jobsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const jobsExport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.export');
    const ordersRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    const ordersExport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.export');
    const jobsAllowed = jobsRead.allowed && jobsExport.allowed && jobsRead.resourceKind === 'job' && jobsExport.resourceKind === 'job' && [
        'workspace',
        'assigned'
    ].includes(jobsRead.scope) && [
        'workspace',
        'assigned'
    ].includes(jobsExport.scope);
    const ordersAllowed = ordersRead.allowed && ordersExport.allowed && ordersRead.resourceKind === 'work_order' && ordersExport.resourceKind === 'work_order' && [
        'workspace',
        'assigned_job'
    ].includes(ordersRead.scope) && [
        'workspace',
        'assigned_job'
    ].includes(ordersExport.scope);
    if (!jobsAllowed && !ordersAllowed) return null;
    return {
        scope: report.scope === 'assigned' || calendar.scope === 'own_assigned' ? {
            kind: 'own',
            viewerId: context.userId
        } : {
            kind: 'workspace'
        },
        outputScopes: {
            jobs: jobsAllowed ? {
                kind: 'available',
                scope: jobsRead.scope === 'assigned' || jobsExport.scope === 'assigned' ? 'assigned' : 'workspace'
            } : {
                kind: 'unavailable',
                reason: 'permissions'
            },
            workOrders: ordersAllowed ? {
                kind: 'available',
                scope: ordersRead.scope === 'assigned_job' || ordersExport.scope === 'assigned_job' ? 'assigned_job' : 'workspace'
            } : {
                kind: 'unavailable',
                reason: 'permissions'
            }
        }
    };
}
function canExportCalendarDataset(access, input) {
    if (input.query.filters.recordTypes.some((type)=>(type === 'job' ? access.outputScopes.jobs : access.outputScopes.workOrders).kind !== 'available')) return false;
    const scope = access.scope;
    if (scope.kind === 'own' && input.query.filters.participants.some((id)=>id !== scope.viewerId)) return false;
    return (input.dataset !== 'jobs' || access.outputScopes.jobs.kind === 'available') && (input.dataset !== 'workOrders' || access.outputScopes.workOrders.kind === 'available');
}
function requireCalendarExportAccess(context, input) {
    const access = resolveCalendarExportAccess(context);
    if (input.query.workspaceId !== context.workspaceId || !access || !canExportCalendarDataset(access, input)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    return access;
}
}),
"[project]/packages/data/src/reports/calendar-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialCalendarReportWithAuthorityInTransaction",
    ()=>initialCalendarReportWithAuthorityInTransaction,
    "readCalendarReportWithAuthorityInTransaction",
    ()=>readCalendarReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-filters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-scheduled.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-review.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-unscheduled.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
async function readCalendarReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportQuerySchema"].parse(rawQuery);
    const report = query.view === 'calendar-scheduled' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarScheduledReportInTransaction"])(trx, context, query) : query.view === 'calendar-review' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarReviewReportInTransaction"])(trx, context, query) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarUnscheduledReportInTransaction"])(trx, context, query);
    const options = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarReportFilterOptionsInTransaction"])(trx, context, {
        workspaceId: query.workspaceId,
        context: query.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated'
    });
    const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCalendarExportAccess"])(context);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        canExport: access !== null,
        exportScopes: access?.outputScopes ?? null,
        policyRevision: context.policy.revision,
        scope: report.scope,
        query,
        report,
        options
    });
}
async function initialCalendarReportWithAuthorityInTransaction(trx, context) {
    const { today } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportContext"])(trx, context, context.workspaceId);
    const from = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarWeekStart"])(today);
    return readCalendarReportWithAuthorityInTransaction(trx, context, {
        workspaceId: context.workspaceId,
        view: 'calendar-scheduled',
        period: {
            from,
            to: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(from, 6)
        },
        selected: 'visits',
        filters: {
            participants: [],
            recordTypes: []
        },
        page: 1,
        pageSize: 25
    });
}
}),
"[project]/packages/data/src/reports/job-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareJobReportCSVProjectionInTransaction",
    ()=>prepareJobReportCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/job-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-filters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-events.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-lifecycle.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-completion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/jobs.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const activeStatuses = [
    'needs-scheduling',
    'scheduled',
    'in-progress',
    'waiting'
];
const text = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1);
const evidence = {
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    label: text,
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobStatuses"]),
    owner: text
};
const lifecycleRow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ...evidence,
    service: text,
    reportDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].iso.date()
}).strict();
const completionRow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ...evidence,
    createdDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].iso.date(),
    completionDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].iso.date(),
    elapsedDays: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative().refine(Number.isSafeInteger)
}).strict();
const workloadRow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ...evidence,
    service: text,
    completionDeadline: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].iso.date().nullable(),
    scheduledDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].iso.date().nullable(),
    waitingReason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobWaitingReasons"]).nullable()
}).strict();
async function prepareJobReportCSVProjectionInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportExportInputSchema"].parse(raw);
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveJobReportExportScope"])(context);
    if (!scope || input.query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { query, dataset } = input;
    const forceAssigned = scope === 'assigned';
    const paging = {
        page: 1,
        pageSize: 100
    };
    const report = query.view === 'lifecycle' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobLifecycleReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, forceAssigned) : query.view === 'completion' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobCompletionReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, forceAssigned) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobWorkloadReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, forceAssigned);
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportContext"])(trx, context, forceAssigned);
    if (auth.scope !== scope || auth.asOf.toISOString() !== report.asOf) {
        throw new Error('Jobs export and native read context disagree.');
    }
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportExportColumns"])(input);
    const dateBasis = query.view === 'lifecycle' ? 'lifecycle-local-dates' : query.view === 'completion' ? 'completion-date' : 'current-snapshot';
    const selection = query.view === 'lifecycle' ? query.selectedView : query.view === 'completion' ? query.selectedDate ?? 'all dates' : query.selection.kind === 'metric' ? query.selection.metric : `${query.selection.group}:${query.selection.id}`;
    const coverage = 'Current authorized Jobs including archived; filters and assignment are current. ' + 'Lifecycle categories overlap; latest matching event per Job; elapsed days use local dates. ' + `Evidence selection: ${selection}.`;
    const common = [
        query.view,
        dataset,
        dateBasis,
        'period' in query ? query.period.from : null,
        'period' in query ? query.period.to : null,
        report.asOf,
        report.timezone,
        scope,
        'included',
        coverage
    ];
    const groupKey = dataset === 'waiting-reasons' ? 'waitingReason' : dataset;
    const groups = report.view === 'workload' && (groupKey === 'status' || groupKey === 'owner' || groupKey === 'service' || groupKey === 'waitingReason') ? report.groups[groupKey] : null;
    const count = dataset === 'summary' ? 1 : dataset === 'days' && report.view === 'completion' ? report.days.length : groups ? groups.length : report.evidenceTotal;
    async function* rows(signal) {
        signal?.throwIfAborted();
        if (dataset === 'summary') {
            yield [
                ...common,
                ...report.view === 'lifecycle' ? [
                    report.counts.created,
                    report.counts.completed,
                    report.counts.canceled,
                    report.counts.reopened
                ] : report.view === 'completion' ? [
                    report.total,
                    report.duration.sampleSize,
                    report.duration.totalElapsedDays,
                    report.duration.averageElapsedDays
                ] : [
                    report.counts.active,
                    report.counts.overdue,
                    report.counts.dueSoon,
                    report.counts.noDeadline,
                    report.counts.waiting,
                    report.counts.unassigned
                ]
            ];
            return;
        }
        if (dataset === 'days' && report.view === 'completion') {
            for (const day of report.days){
                signal?.throwIfAborted();
                yield [
                    ...common,
                    day.date,
                    day.count
                ];
            }
            return;
        }
        if (groups) {
            for (const group of groups){
                signal?.throwIfAborted();
                yield [
                    ...common,
                    group.id,
                    group.label,
                    group.count
                ];
            }
            return;
        }
        if (dataset !== 'evidence') throw new Error('Invalid Jobs CSV dataset.');
        const base = auth.query.clone();
        if (query.view === 'workload') base.whereIn('j.status', activeStatuses);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateJobReportFilters"])(base, query.filters, trx);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyJobReportFilters"])(base, query.filters);
        const scopedAuth = {
            ...auth,
            query: base
        };
        const evidenceQuery = base.clone();
        if (query.view === 'lifecycle' && query.selectedView === 'created') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyJobReportPeriod"])(evidenceQuery, 'j."createdAt"', query.period, auth.timezone);
            evidenceQuery.select(trx.raw(`to_char(j."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "reportDate"`, [
                auth.timezone
            ]));
        } else if (query.view === 'lifecycle' && query.selectedView !== 'created' || query.view === 'completion') {
            const selectedView = query.view === 'completion' ? 'completed' : query.selectedView;
            if (selectedView === 'created') throw new Error('Invalid Jobs lifecycle evidence selection.');
            const selected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$events$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectedJobLifecycleEvents"])(trx, scopedAuth, query.period, selectedView).toSQL();
            evidenceQuery.joinRaw(`INNER JOIN (${selected.sql}) AS "selectedEvent" ON "selectedEvent"."jobId" = j.id`, [
                ...selected.bindings
            ]);
            if (query.view === 'lifecycle') evidenceQuery.select('selectedEvent.reportDate');
            else {
                if (query.selectedDate) evidenceQuery.where('selectedEvent.reportDate', query.selectedDate);
                evidenceQuery.select(trx.raw(`to_char(j."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "createdDate"`, [
                    auth.timezone
                ]), 'selectedEvent.reportDate as completionDate', trx.raw(`"selectedEvent"."reportDate"::date - (j."createdAt" AT TIME ZONE ?)::date AS "elapsedDays"`, [
                    auth.timezone
                ]));
            }
        } else if (query.view === 'workload') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectJobWorkloadProjection"])(evidenceQuery, query.selection, auth.today);
            evidenceQuery.select(trx.raw(`to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`), trx.raw(`to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate"`), 'j.waitingReason');
        }
        evidenceQuery.leftJoin('users as reportOwner', 'reportOwner.id', 'j.primaryOwnerId').select('j.id', 'j.status', trx.raw(`'J-' || CASE WHEN length(j."jobNumber"::text) < 4 THEN lpad(j."jobNumber"::text, 4, '0')
          ELSE j."jobNumber"::text END || ' / ' || CASE WHEN j.title = '' THEN j."customerName" ELSE j.title END AS label`), trx.raw(`CASE WHEN j."primaryOwnerId" IS NULL THEN 'No current primary owner'
        ELSE COALESCE(NULLIF("reportOwner".name, ''), 'Current teammate') END AS owner`));
        if (query.view !== 'completion') evidenceQuery.select(trx.raw(`COALESCE(NULLIF(btrim(j.service), ''), 'No recorded service') AS service`));
        if (query.view === 'workload') evidenceQuery.orderByRaw('j."completionDeadline" ASC NULLS LAST').orderByRaw('j."scheduledDate" ASC NULLS LAST');
        else evidenceQuery.orderBy(query.view === 'completion' ? 'completionDate' : 'reportDate', 'desc');
        evidenceQuery.orderBy('j.jobNumber').orderBy('j.id');
        const statement = evidenceQuery.toSQL();
        const cursor = `jobs_csv_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
        await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement.sql}`, [
            cursor,
            ...statement.bindings
        ]);
        let emitted = 0;
        try {
            while(true){
                signal?.throwIfAborted();
                const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                    cursor
                ]);
                if (!batch.rows.length) break;
                for (const saved of batch.rows){
                    signal?.throwIfAborted();
                    let cells;
                    if (query.view === 'lifecycle') {
                        const row = lifecycleRow.parse(saved);
                        cells = [
                            row.id,
                            row.label,
                            query.selectedView,
                            row.reportDate,
                            row.status,
                            row.owner,
                            row.service
                        ];
                    } else if (query.view === 'completion') {
                        const row = completionRow.parse(saved);
                        cells = [
                            row.id,
                            row.label,
                            row.createdDate,
                            row.completionDate,
                            row.elapsedDays,
                            row.status,
                            row.owner
                        ];
                    } else {
                        const row = workloadRow.parse(saved);
                        cells = [
                            row.id,
                            row.label,
                            row.status,
                            row.owner,
                            row.service,
                            row.completionDeadline,
                            row.scheduledDate,
                            row.waitingReason
                        ];
                    }
                    emitted++;
                    if (emitted > count || common.length + cells.length !== columns.length) {
                        throw new Error('Jobs export evidence count or columns do not match the native projection.');
                    }
                    yield [
                        ...common,
                        ...cells
                    ];
                }
            }
            if (emitted !== count) throw new Error('Jobs export evidence population does not match its count.');
        } finally{
            await trx.raw('CLOSE ??', [
                cursor
            ]);
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope,
        archiveVisibility: 'included',
        asOf: report.asOf,
        today: auth.today,
        timezone: report.timezone,
        dateBasis,
        coverage,
        count,
        columns,
        rows
    };
}
}),
"[project]/packages/data/src/reports/lead-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareLeadReportCSVProjectionInTransaction",
    ()=>prepareLeadReportCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
;
;
;
;
const text = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(4000).refine((value)=>!/[\u0000-\u001f\u007f]/.test(value));
const evidenceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    recordId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    label: text,
    cells: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), text)
}).strict().refine((row)=>row.id === row.recordId);
async function prepareLeadReportCSVProjectionInTransaction(trx, context, raw) {
    const { input, scope, report, evidence } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadReportExportInTransaction"])(trx, context, raw);
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportExportColumns"])(input);
    const dateBasis = report.view === 'intake' ? 'creation-date' : report.view === 'won' || report.view === 'lost' ? 'recorded-transition-date' : 'current-snapshot';
    const coverage = report.view === 'won' || report.view === 'lost' ? report.coverage.explanation : report.view === 'attention' ? 'Inactive and unowned overlap; combined counts distinct Leads, not the category sum.' : 'Native authorized Leads population; each table breakdown reconciles independently.';
    const common = [
        report.view,
        input.dataset,
        dateBasis,
        'from' in report ? report.from : '',
        'to' in report ? report.to : '',
        report.asOf,
        report.timezone,
        scope,
        report.archiveVisibility,
        coverage
    ];
    let table = [];
    if (input.dataset !== 'evidence') {
        if (report.view === 'intake' && input.dataset === 'intake-days') table = report.trend.map((row)=>[
                row.date,
                row.count
            ]);
        else if (report.view === 'intake' && input.dataset === 'intake-sources') table = report.sources.map((row)=>[
                row.source,
                row.count
            ]);
        else if ((report.view === 'pipeline' || report.view === 'age') && input.dataset === 'pipeline-stages') {
            table = Object.entries(report.stages).map(([stage, count])=>[
                    stage,
                    count
                ]);
        } else if ((report.view === 'pipeline' || report.view === 'age') && input.dataset === 'age-bands') {
            table = Object.entries(report.ages).map(([band, count])=>[
                    band,
                    count
                ]);
        } else if ((report.view === 'won' || report.view === 'lost') && input.dataset === 'outcomes') {
            table = [
                'won',
                'lost'
            ].map((outcome)=>[
                    outcome,
                    report.counts[outcome]
                ]);
        } else if (report.view === 'attention' && input.dataset === 'attention-categories') {
            table = [
                'inactive',
                'unowned',
                'combined'
            ].map((category)=>[
                    category,
                    report.counts[category],
                    'true'
                ]);
        } else throw new Error('The native Leads table does not match the requested CSV dataset.');
    }
    const count = input.dataset === 'evidence' ? report.evidenceTotal : table.length;
    async function* rows(signal) {
        signal?.throwIfAborted();
        if (input.dataset !== 'evidence') {
            for (const row of table){
                signal?.throwIfAborted();
                yield [
                    ...common,
                    ...row
                ];
            }
            return;
        }
        const cursor = `lead_report_csv_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`, sql = evidence.query.toSQL();
        await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [
            cursor,
            ...sql.bindings
        ]);
        let emitted = 0;
        const fields = columns.slice(common.length + 2);
        try {
            let batch = (await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ])).rows;
            while(batch.length){
                for (const saved of batch){
                    signal?.throwIfAborted();
                    const row = evidenceSchema.parse(evidence.map(saved));
                    if (Object.keys(row.cells).length !== fields.length || !fields.every((field)=>Object.hasOwn(row.cells, field))) {
                        throw new Error('Native Leads CSV evidence columns do not match the selected view.');
                    }
                    emitted++;
                    if (emitted > count) throw new Error('The Leads CSV population changed during generation.');
                    yield [
                        ...common,
                        row.recordId,
                        row.label,
                        ...fields.map((field)=>row.cells[field])
                    ];
                }
                signal?.throwIfAborted();
                batch = (await trx.raw('FETCH FORWARD 100 FROM ??', [
                    cursor
                ])).rows;
            }
            if (emitted !== count) throw new Error('The Leads CSV population changed during generation.');
        } finally{
            await trx.raw('CLOSE ??', [
                cursor
            ]);
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope,
        archiveVisibility: report.archiveVisibility,
        asOf: report.asOf,
        today: report.today,
        timezone: report.timezone,
        dateBasis,
        coverage,
        count,
        columns,
        rows
    };
}
}),
"[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReportExportLimitError",
    ()=>ReportExportLimitError,
    "createLeadReportCSVExport",
    ()=>createLeadReportCSVExport,
    "previewLeadReportExport",
    ()=>previewLeadReportExport,
    "reportExportLimits",
    ()=>reportExportLimits,
    "withReportExportSnapshot",
    ()=>withReportExportSnapshot,
    "writeReportExportAudit",
    ()=>writeReportExportAudit
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/csv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export-projection.ts [instrumentation] (ecmascript)");
;
;
;
;
;
class ReportExportLimitError extends Error {
    constructor(){
        super('This report exceeds the technical CSV limit. Narrow the filters and try again.');
    }
}
function reportExportLimits() {
    const read = (name, fallback, maximum)=>{
        const raw = process.env[name] ?? String(fallback), value = Number(raw);
        if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 1 || value > maximum) {
            throw new Error('Invalid report export limit configuration.');
        }
        return value;
    };
    return {
        rows: read('REPORT_EXPORT_ROW_LIMIT', 50000, 1000000),
        bytes: read('REPORT_EXPORT_BYTE_LIMIT', 32 * 1024 * 1024, 256 * 1024 * 1024),
        durationMs: read('REPORT_EXPORT_DURATION_MS', 30000, 120000)
    };
}
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
const snapshotSlots = new WeakMap();
function preview(projection, limits) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportExportPreviewSchema"].parse({
        input: projection.input,
        workspaceId: projection.workspaceId,
        viewerId: projection.viewerId,
        policyRevision: projection.policyRevision,
        scope: projection.scope,
        archiveVisibility: projection.archiveVisibility,
        asOf: projection.asOf,
        today: projection.today,
        timezone: projection.timezone,
        dateBasis: projection.dateBasis,
        coverage: projection.coverage,
        count: projection.count,
        columns: projection.columns,
        limits
    });
}
async function withReportExportSnapshot(db, identity, enabled, signal, run) {
    // Reserve two connections per snapshot and leave one for durable audits. Do not
    // let concurrent exports fill the pool with locks waiting for snapshot connections.
    const capacity = Math.floor((db.client.pool.max - 1) / 2);
    if (capacity < 1) throw new Error('Report exports require a database pool with at least three connections.');
    let slots = snapshotSlots.get(db);
    if (!slots) {
        slots = {
            active: 0,
            waiting: new Set()
        };
        snapshotSlots.set(db, slots);
    }
    const state = slots;
    try {
        while(state.active >= capacity){
            signal.throwIfAborted();
            await new Promise((resolve, reject)=>{
                const cleanup = ()=>{
                    state.waiting.delete(wake);
                    signal.removeEventListener('abort', abort);
                };
                const wake = ()=>{
                    cleanup();
                    resolve();
                };
                const abort = ()=>{
                    cleanup();
                    reject(signal.reason);
                };
                state.waiting.add(wake);
                signal.addEventListener('abort', abort, {
                    once: true
                });
            });
        }
        signal.throwIfAborted();
    } catch (error) {
        if (state.active < capacity) state.waiting.values().next().value?.();
        throw error;
    }
    state.active++;
    try {
        return await db.transaction(async (lock)=>{
            signal.throwIfAborted();
            await lock.raw("SET LOCAL lock_timeout = '5s'");
            await lock.raw("SET LOCAL statement_timeout = '10s'");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(lock, identity, enabled, false, async ()=>{
                signal.throwIfAborted();
                return db.transaction(async (generation)=>{
                    await generation.raw('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
                    await generation.raw("SET LOCAL lock_timeout = '5s'");
                    await generation.raw("SET LOCAL statement_timeout = '10s'");
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(generation, identity, enabled, false, async (trx, context)=>{
                        signal.throwIfAborted();
                        const result = await run(trx, context);
                        signal.throwIfAborted();
                        return result;
                    });
                });
            });
        });
    } finally{
        state.active--;
        state.waiting.values().next().value?.();
    }
}
async function previewLeadReportExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = reportExportLimits();
    return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadReportCSVProjectionInTransaction"])(trx, context, input), limits));
}
function auditSelection(input) {
    const { filters, ...query } = input.query;
    const fingerprint = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest('hex');
    const selection = {
        ...query,
        filters: {
            ...filters,
            owners: filters.owners.map(fingerprint)
        }
    };
    if ('currentFilters' in selection) {
        selection.currentFilters = {
            ...selection.currentFilters,
            owners: selection.currentFilters.owners.map(fingerprint)
        };
    }
    return selection;
}
async function writeReportExportAudit(db, write) {
    return db.transaction(async (trx)=>{
        await trx.raw("SET LOCAL lock_timeout = '5s'");
        await trx.raw("SET LOCAL statement_timeout = '10s'");
        return write(trx);
    });
}
async function createLeadReportCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw), limits = reportExportLimits(), id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const cancelled = new AbortController();
    const signal = AbortSignal.any([
        cancelled.signal,
        AbortSignal.timeout(limits.durationMs),
        ...requestSignal ? [
            requestSignal
        ] : []
    ]);
    signal.throwIfAborted();
    const initial = await withReportExportSnapshot(db, identity, enabled, signal, async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadReportCSVProjectionInTransaction"])(trx, context, input), limits));
    signal.throwIfAborted();
    await writeReportExportAudit(db, (trx)=>trx('reportExportAudit').insert({
            id,
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            report: 'leads',
            dataset: input.dataset,
            scope: initial.scope,
            selection: JSON.stringify(auditSelection(input)),
            policyRevision: initial.policyRevision,
            count: initial.count,
            limits: JSON.stringify(limits),
            snapshotAt: initial.asOf,
            outcome: initial.count > limits.rows ? 'rejected' : 'started',
            finishedAt: initial.count > limits.rows ? new Date() : null
        }));
    if (initial.count > limits.rows) throw new ReportExportLimitError();
    let streamController;
    let demand = false, resolveDemand, rejectDemand;
    const stream = new ReadableStream({
        start (controller) {
            streamController = controller;
        },
        pull () {
            demand = true;
            resolveDemand?.();
        },
        cancel () {
            cancelled.abort();
        }
    }, {
        highWaterMark: 0
    });
    let resolveReady, rejectReady;
    const ready = new Promise((resolve, reject)=>{
        resolveReady = resolve;
        rejectReady = reject;
    });
    let rowsSent = 0, bytesSent = 0, checked = initial;
    const onAbort = ()=>{
        const error = new Error('Report CSV export could not be completed.');
        rejectDemand?.(error);
        streamController.error(error);
    };
    signal.addEventListener('abort', onAbort, {
        once: true
    });
    const write = async (text)=>{
        signal.throwIfAborted();
        const bytes = new TextEncoder().encode(text);
        if (bytesSent + bytes.byteLength > limits.bytes) throw new ReportExportLimitError();
        if (!demand) await new Promise((resolve, reject)=>{
            resolveDemand = resolve;
            rejectDemand = reject;
        });
        resolveDemand = undefined;
        rejectDemand = undefined;
        signal.throwIfAborted();
        demand = false;
        streamController.enqueue(bytes);
        bytesSent += bytes.byteLength;
    };
    const completion = (async ()=>{
        try {
            await withReportExportSnapshot(db, identity, enabled, signal, async (trx, context)=>{
                signal.throwIfAborted();
                const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadReportCSVProjectionInTransaction"])(trx, context, input);
                checked = preview(projection, limits);
                if (checked.count > limits.rows) throw new ReportExportLimitError();
                resolveReady(checked);
                await write('\uFEFF' + (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["csvLine"])(projection.columns));
                for await (const row of projection.rows(signal)){
                    await write((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["csvLine"])(row));
                    rowsSent++;
                }
            });
            signal.throwIfAborted();
            const updated = await writeReportExportAudit(db, async (trx)=>{
                const count = await trx('reportExportAudit').where({
                    id,
                    outcome: 'started'
                }).update({
                    scope: checked.scope,
                    policyRevision: checked.policyRevision,
                    count: checked.count,
                    snapshotAt: checked.asOf,
                    rowsSent,
                    bytesSent,
                    outcome: 'completed',
                    finishedAt: new Date()
                });
                signal.throwIfAborted();
                return count;
            });
            if (updated !== 1) throw new Error('Report CSV audit could not be finalized.');
            signal.throwIfAborted();
            streamController.close();
            return {
                outcome: 'completed',
                rowsSent,
                bytesSent
            };
        } catch (error) {
            const outcome = error instanceof ReportExportLimitError ? 'rejected' : 'failed';
            try {
                const updated = await writeReportExportAudit(db, (trx)=>trx('reportExportAudit').where({
                        id,
                        outcome: 'started'
                    }).update({
                        scope: checked.scope,
                        policyRevision: checked.policyRevision,
                        count: checked.count,
                        snapshotAt: checked.asOf,
                        rowsSent,
                        bytesSent,
                        outcome,
                        finishedAt: new Date()
                    }));
                if (updated !== 1) console.error('Report CSV failure audit could not be finalized.');
            } catch  {
                console.error('Report CSV failure audit could not be stored; started evidence is retained.');
            }
            rejectReady(error);
            streamController.error(new Error('Report CSV export could not be completed.'));
            return {
                outcome,
                rowsSent,
                bytesSent
            };
        } finally{
            signal.removeEventListener('abort', onAbort);
        }
    })();
    const metadata = await ready;
    return {
        ...metadata,
        id,
        stream,
        completion
    };
}
}),
"[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createReportCSVStream",
    ()=>createReportCSVStream
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/csv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
;
;
;
async function createReportCSVStream(db, identity, enabled, options, requestSignal) {
    const limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])(), id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), cancelled = new AbortController();
    const signal = AbortSignal.any([
        cancelled.signal,
        AbortSignal.timeout(limits.durationMs),
        ...requestSignal ? [
            requestSignal
        ] : []
    ]);
    signal.throwIfAborted();
    const initial = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, signal, async (trx, context)=>(await options.prepare(trx, context, limits)).preview);
    signal.throwIfAborted();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeReportExportAudit"])(db, (trx)=>trx('reportExportAudit').insert({
            id,
            workspaceId: identity.workspaceId,
            actorId: identity.userId,
            report: options.report,
            dataset: options.dataset,
            ...options.auditScopes(initial),
            selection: options.selection,
            policyRevision: initial.policyRevision,
            count: initial.count,
            limits: JSON.stringify(limits),
            snapshotAt: initial.asOf,
            outcome: initial.count > limits.rows ? 'rejected' : 'started',
            finishedAt: initial.count > limits.rows ? new Date() : null
        }));
    if (initial.count > limits.rows) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ReportExportLimitError"]();
    let streamController;
    let demand = false, resolveDemand, rejectDemand;
    const stream = new ReadableStream({
        start (controller) {
            streamController = controller;
        },
        pull () {
            demand = true;
            resolveDemand?.();
        },
        cancel () {
            cancelled.abort();
        }
    }, {
        highWaterMark: 0
    });
    let resolveReady, rejectReady;
    const ready = new Promise((resolve, reject)=>{
        resolveReady = resolve;
        rejectReady = reject;
    });
    let rowsSent = 0, bytesSent = 0, checked = initial;
    const failureMessage = `${options.label} CSV export could not be completed.`;
    const onAbort = ()=>{
        const error = new Error(failureMessage);
        rejectDemand?.(error);
        streamController.error(error);
    };
    signal.addEventListener('abort', onAbort, {
        once: true
    });
    const encoder = new TextEncoder();
    const write = async (text)=>{
        signal.throwIfAborted();
        const bytes = encoder.encode(text);
        if (bytesSent + bytes.byteLength > limits.bytes) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ReportExportLimitError"]();
        if (!demand) await new Promise((resolve, reject)=>{
            resolveDemand = resolve;
            rejectDemand = reject;
        });
        resolveDemand = undefined;
        rejectDemand = undefined;
        signal.throwIfAborted();
        demand = false;
        streamController.enqueue(bytes);
        bytesSent += bytes.byteLength;
    };
    const completion = (async ()=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, signal, async (trx, context)=>{
                signal.throwIfAborted();
                const projection = await options.prepare(trx, context, limits);
                checked = projection.preview;
                if (checked.count > limits.rows) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ReportExportLimitError"]();
                resolveReady({
                    preview: checked,
                    generation: options.generation(checked, id)
                });
                await write('\uFEFF' + (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["csvLine"])(checked.columns));
                for await (const row of projection.rows(signal)){
                    if (rowsSent >= checked.count || row.length !== checked.columns.length) {
                        throw new Error(`${options.label} CSV rows do not match the reviewed projection.`);
                    }
                    await write((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$csv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["csvLine"])(row));
                    rowsSent++;
                }
                if (rowsSent !== checked.count) throw new Error(`${options.label} CSV row count is incomplete.`);
            });
            signal.throwIfAborted();
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeReportExportAudit"])(db, async (trx)=>{
                const count = await trx('reportExportAudit').where({
                    id,
                    outcome: 'started'
                }).update({
                    ...options.auditScopes(checked),
                    policyRevision: checked.policyRevision,
                    count: checked.count,
                    snapshotAt: checked.asOf,
                    rowsSent,
                    bytesSent,
                    outcome: 'completed',
                    finishedAt: new Date()
                });
                signal.throwIfAborted();
                return count;
            });
            if (updated !== 1) throw new Error(`${options.label} CSV audit could not be finalized.`);
            signal.throwIfAborted();
            streamController.close();
            return {
                outcome: 'completed',
                rowsSent,
                bytesSent
            };
        } catch (error) {
            const outcome = error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ReportExportLimitError"] ? 'rejected' : 'failed';
            try {
                const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeReportExportAudit"])(db, (trx)=>trx('reportExportAudit').where({
                        id,
                        outcome: 'started'
                    }).update({
                        ...options.auditScopes(checked),
                        policyRevision: checked.policyRevision,
                        count: checked.count,
                        snapshotAt: checked.asOf,
                        rowsSent,
                        bytesSent,
                        outcome,
                        finishedAt: new Date()
                    }));
                if (updated !== 1) console.error(`${options.label} CSV failure audit could not be finalized.`);
            } catch  {
                console.error(`${options.label} CSV failure audit could not be stored; started evidence is retained.`);
            }
            rejectReady(error);
            streamController.error(new Error(failureMessage));
            return {
                outcome,
                rowsSent,
                bytesSent
            };
        } finally{
            signal.removeEventListener('abort', onAbort);
        }
    })();
    const metadata = await ready;
    return {
        ...metadata.preview,
        generation: metadata.generation,
        id,
        stream,
        completion
    };
}
}),
"[project]/packages/data/src/reports/job-export.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createJobReportCSVExport",
    ()=>createJobReportCSVExport,
    "previewJobReportExport",
    ()=>previewJobReportExport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/job-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
function preview(projection, limits) {
    const { rows, ...metadata } = projection;
    void rows;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
function auditSelection(input) {
    const { workspaceId, filters, ...query } = input.query;
    void workspaceId;
    const fingerprint = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest('hex');
    const selection = query.view === 'workload' && query.selection.kind === 'group' && (query.selection.group === 'owner' || query.selection.group === 'service') ? {
        ...query,
        selection: {
            ...query.selection,
            id: fingerprint(query.selection.id)
        }
    } : query;
    return JSON.stringify({
        dataset: input.dataset,
        query: {
            ...selection,
            filters: {
                statuses: filters.statuses,
                owners: filters.owners.map(fingerprint),
                services: filters.services.map(fingerprint)
            }
        }
    });
}
async function previewJobReportExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareJobReportCSVProjectionInTransaction"])(trx, context, input), limits));
}
async function createJobReportCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'jobs',
        label: 'Jobs',
        dataset: input.dataset,
        selection: auditSelection(input),
        prepare: async (trx, context, limits)=>{
            const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareJobReportCSVProjectionInTransaction"])(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: value.scope,
                outputScopes: JSON.stringify({
                    jobs: value.scope,
                    archiveVisibility: value.archiveVisibility
                })
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                scope: value.scope,
                archiveVisibility: value.archiveVisibility,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                dateBasis: value.dateBasis,
                count: value.count,
                limits: value.limits
            })
    }, requestSignal);
}
;
}),
"[project]/packages/data/src/reports/team-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareTeamReportCSVProjectionInTransaction",
    ()=>prepareTeamReportCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-jobs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-jobs.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function workloadCells(value) {
    return [
        value.count,
        value.overdue,
        value.waiting,
        value.statuses['needs-scheduling'],
        value.statuses.scheduled,
        value.statuses['in-progress'],
        value.statuses.waiting
    ];
}
async function prepareTeamReportCSVProjectionInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportExportInputSchema"].parse(raw);
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requireTeamReportExportScope"])(context, input), { query, dataset } = input;
    const assigned = scope.kind === 'assigned', paging = {
        page: 1,
        pageSize: 100
    };
    const report = query.view === 'team-leads' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readTeamLeadsReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, assigned) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readTeamJobsReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, assigned);
    if (JSON.stringify(scope) !== JSON.stringify(report.scope)) throw new Error('Team export and native read scopes disagree.');
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportExportColumns"])(input), dateBasis = 'current-snapshot';
    const archiveVisibility = query.view === 'team-leads' ? 'excluded' : 'included';
    const inactivityCutoff = report.view === 'team-leads' ? report.inactivityCutoff : null;
    const coverage = 'Current authorized workload; selected evidence: ' + JSON.stringify(query.selected) + '. Job participation is non-additive, not hours or capacity; withheld attribution remains hidden.';
    const common = [
        query.view,
        dataset,
        dateBasis,
        report.asOf,
        report.timezone,
        scope.kind,
        archiveVisibility,
        inactivityCutoff,
        coverage
    ];
    const count = dataset === 'summary' || dataset === 'unassigned' ? 1 : dataset === 'owners' && report.view === 'team-leads' ? report.owners.length : dataset === 'members' && report.view === 'team-jobs' ? report.members.length * 2 : report.evidenceTotal;
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Team export count is invalid.');
    async function* rows(signal) {
        signal?.throwIfAborted();
        if (dataset === 'summary') {
            yield [
                ...common,
                ...report.view === 'team-leads' ? [
                    report.counts.open,
                    report.counts.inactive,
                    assigned ? null : report.counts.unassigned
                ] : [
                    report.counts.active,
                    report.counts.overdue,
                    report.counts.waiting
                ]
            ];
            return;
        }
        if (dataset === 'owners' && report.view === 'team-leads') {
            for (const owner of report.owners){
                signal?.throwIfAborted();
                yield [
                    ...common,
                    owner.id,
                    owner.label,
                    owner.count,
                    owner.inactive,
                    owner.stages.new,
                    owner.stages.contacted,
                    owner.stages['estimate-sent']
                ];
            }
            return;
        }
        if (dataset === 'members' && report.view === 'team-jobs') {
            for (const member of report.members)for (const responsibility of [
                'primary',
                'supporting'
            ]){
                signal?.throwIfAborted();
                yield [
                    ...common,
                    member.id,
                    member.label,
                    responsibility,
                    ...workloadCells(member[responsibility])
                ];
            }
            return;
        }
        if (dataset === 'unassigned' && report.view === 'team-jobs' && report.unassigned) {
            yield [
                ...common,
                ...workloadCells(report.unassigned)
            ];
            return;
        }
        if (dataset !== 'evidence') throw new Error('Invalid Team CSV dataset.');
        const source = query.view === 'team-leads' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamLeadsWorkloadSource"])(trx, context, {
            ...query,
            ...paging
        }, assigned) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamJobsWorkloadSource"])(trx, context, {
            ...query,
            ...paging
        }, assigned);
        const statement = query.view === 'team-leads' ? `${source.sql} SELECT ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamLeadEvidenceJSON"]} AS row FROM reportLeads l
          WHERE ${source.predicate} ORDER BY l."lastActivityAt", l.id` : `${source.sql} SELECT ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamJobEvidenceJSON"]} AS row FROM reportJobs j
          WHERE ${source.predicate} ORDER BY j."completionDeadline" ASC NULLS LAST, j."jobNumber", j.id`;
        const bindings = [
            ...source.bindings,
            ...query.view === 'team-jobs' ? [
                assigned,
                context.userId
            ] : [],
            ...source.selectionBindings
        ];
        const cursor = `team_csv_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
        await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [
            cursor,
            ...bindings
        ]);
        let emitted = 0;
        try {
            while(true){
                signal?.throwIfAborted();
                const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                    cursor
                ]);
                if (!batch.rows.length) break;
                for (const saved of batch.rows){
                    signal?.throwIfAborted();
                    let cells;
                    if (query.view === 'team-leads') {
                        const row = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamLeadsResultSchema"].shape.rows.element.parse(saved.row);
                        if (row.id !== row.recordId || assigned && row.currentOwnerId !== context.userId) {
                            throw new Error('Team Lead export evidence violates assigned scope.');
                        }
                        cells = [
                            row.id,
                            row.label,
                            row.stage,
                            row.ownerState,
                            row.currentOwnerId,
                            row.cells.owner,
                            String(row.inactive),
                            row.cells.created,
                            row.cells.activity
                        ];
                    } else {
                        const row = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamJobsResultSchema"].shape.rows.element.parse(saved.row);
                        if (row.id !== row.recordId || assigned && (row.primary.kind === 'unassigned' || row.primary.kind === 'member' && row.primary.id !== context.userId || row.supportingMemberIds.some((id)=>id !== context.userId) || row.primary.kind === 'withheld' && !row.supportingMemberIds.includes(context.userId))) {
                            throw new Error('Team Jobs export evidence violates assigned scope.');
                        }
                        cells = [
                            row.id,
                            row.label,
                            row.status,
                            row.cells.service,
                            row.completionDeadline,
                            row.scheduledDate,
                            row.waitingReason,
                            row.primary.kind,
                            row.primary.kind === 'member' ? row.primary.id : null,
                            JSON.stringify(row.supportingMemberIds)
                        ];
                    }
                    emitted++;
                    if (emitted > count || common.length + cells.length !== columns.length) {
                        throw new Error('Team export evidence count or columns do not match the native projection.');
                    }
                    yield [
                        ...common,
                        ...cells
                    ];
                }
            }
            if (emitted !== count) throw new Error('Team export evidence population does not match its count.');
        } finally{
            await trx.raw('CLOSE ??', [
                cursor
            ]);
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope,
        archiveVisibility,
        asOf: report.asOf,
        today: report.today,
        timezone: report.timezone,
        dateBasis,
        coverage,
        inactivityCutoff,
        count,
        columns,
        rows
    };
}
}),
"[project]/packages/data/src/reports/team-export.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTeamReportCSVExport",
    ()=>createTeamReportCSVExport,
    "previewTeamReportExport",
    ()=>previewTeamReportExport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
function preview(projection, limits) {
    const { rows, ...metadata } = projection;
    void rows;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
function auditSelection(input) {
    const { workspaceId, filters, selected, ...query } = input.query;
    void workspaceId;
    const fingerprint = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest('hex');
    const selection = selected.kind === 'member' || selected.kind === 'owner' && selected.id !== 'unassigned' ? {
        ...selected,
        id: fingerprint(selected.id)
    } : selected;
    return JSON.stringify({
        dataset: input.dataset,
        query: {
            ...query,
            selected: selection,
            filters: {
                members: filters.members.map(fingerprint)
            }
        }
    });
}
async function previewTeamReportExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareTeamReportCSVProjectionInTransaction"])(trx, context, input), limits));
}
async function createTeamReportCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'team',
        label: 'Team',
        dataset: input.dataset,
        selection: auditSelection(input),
        prepare: async (trx, context, limits)=>{
            const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareTeamReportCSVProjectionInTransaction"])(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: value.scope.kind,
                outputScopes: JSON.stringify({
                    view: value.input.query.view,
                    scope: value.scope.kind,
                    archiveVisibility: value.archiveVisibility
                })
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                scope: value.scope,
                archiveVisibility: value.archiveVisibility,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                dateBasis: value.dateBasis,
                count: value.count,
                limits: value.limits
            })
    }, requestSignal);
}
;
}),
"[project]/packages/data/src/reports/estimate-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareEstimateReportCSVProjectionInTransaction",
    ()=>prepareEstimateReportCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-decisions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-current.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-first-quoted.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function moneyCells(money) {
    return money.kind === 'available' ? [
        money.preTaxCents,
        money.taxCents,
        money.customerTotalCents,
        'verified'
    ] : [
        null,
        null,
        null,
        'unavailable'
    ];
}
async function prepareEstimateReportCSVProjectionInTransaction(trx, context, raw, options = {}) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportExportInputSchema"].parse(raw), { query, dataset } = input;
    const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEstimateReportExportAccess"])(context);
    if (!access || query.workspaceId !== context.workspaceId || query.view === 'estimate-current' && query.selected === 'handoff' && !access.handoff) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const handoff = access.handoff && options.allowHandoff !== false;
    if (query.view === 'estimate-current' && query.selected === 'handoff' && !handoff) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const assigned = access.scope === 'assigned_job', paging = {
        page: 1,
        pageSize: 100
    };
    const report = query.view === 'estimate-decisions' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateDecisionsReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, assigned) : query.view === 'estimate-first-quoted' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateFirstQuotedReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, assigned) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateCurrentReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, assigned, handoff);
    if (report.scope !== access.scope) throw new Error('Estimate export and native read scopes disagree.');
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.today !== 'string') throw new Error('The Estimate export clock is unavailable.');
    const dateBasis = query.view === 'estimate-decisions' ? 'decision-date' : query.view === 'estimate-first-quoted' ? 'first-issued-date' : 'current-snapshot';
    const archiveVisibility = report.view === 'estimate-current' ? 'excluded' : report.archiveVisibility;
    const coverage = report.view === 'estimate-first-quoted' && report.coverage.kind === 'partial' ? report.coverage.explanation : report.view === 'estimate-first-quoted' ? 'First-issued Estimate families; issuance evidence is complete.' : report.view === 'estimate-current' ? `Current issued Estimates. Handoff ${handoff ? 'available' : 'withheld'}.` : 'Effective issued Estimate decisions; frozen amounts are explicitly verified.';
    const common = [
        query.view,
        dataset,
        dateBasis,
        'period' in query ? query.period.from : null,
        'period' in query ? query.period.to : null,
        report.asOf,
        report.timezone,
        access.scope,
        archiveVisibility,
        coverage
    ];
    const count = dataset === 'summary' ? 1 : report.view === 'estimate-first-quoted' ? report.total : report.evidenceTotal;
    async function* rows(signal) {
        signal?.throwIfAborted();
        if (dataset === 'summary') {
            if (report.view === 'estimate-decisions') yield [
                ...common,
                report.counts.accepted,
                report.counts.declined,
                report.money.kind === 'available' ? report.money.preTaxCents : null,
                report.money.kind === 'available' ? report.money.customerTotalCents : null,
                report.money.kind === 'available' ? 'verified' : 'unavailable'
            ];
            else if (report.view === 'estimate-first-quoted') yield [
                ...common,
                report.total,
                report.coverage.kind
            ];
            else yield [
                ...common,
                report.counts.awaiting,
                report.counts.expired,
                report.handoff.kind === 'available' ? report.handoff.count : null,
                report.handoff.kind,
                report.awaitingMoney.kind === 'available' ? report.awaitingMoney.preTaxCents : null,
                report.awaitingMoney.kind === 'available' ? report.awaitingMoney.customerTotalCents : null,
                report.awaitingMoney.kind === 'available' ? 'verified' : 'unavailable'
            ];
            return;
        }
        if (query.view === 'estimate-decisions') {
            const { source } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateDecisionsSource"])(trx, context, {
                ...query,
                ...paging
            }, assigned);
            for await (const row of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateDecisionsEvidence"])(trx, context, source, signal)){
                if (query.selected !== 'decided' && query.selected !== row.outcome) continue;
                yield [
                    ...common,
                    row.recordId,
                    row.estimateNumber,
                    row.revision,
                    row.decisionVersion,
                    row.label,
                    row.ownerKey,
                    row.parentType,
                    row.outcome,
                    row.decisionDate,
                    row.recordedDate,
                    String(row.archived),
                    ...moneyCells(row.money)
                ];
            }
        } else if (query.view === 'estimate-first-quoted') {
            const source = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateFirstQuotedSource"])(trx, context, {
                ...query,
                ...paging
            }, assigned);
            for await (const row of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$first$2d$quoted$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateFirstQuotedEvidence"])(trx, source, context.workspaceId, signal)){
                if (row.familyId !== `${context.workspaceId}:${row.estimateNumber}` || row.firstIssuedDate < query.period.from || row.firstIssuedDate > query.period.to || row.firstIssuedRevision > row.currentIssuedRevision || row.currentIssuedDate < row.firstIssuedDate || row.currentIssuedDate > clock.today || archiveVisibility === 'excluded' && row.archived) {
                    throw new Error('First-quoted Estimate CSV evidence is inconsistent.');
                }
                yield [
                    ...common,
                    row.recordId,
                    row.estimateNumber,
                    row.label,
                    row.ownerKey,
                    row.parentType,
                    row.firstIssuedDate,
                    row.firstIssuedRevision,
                    row.firstIssuedVia,
                    row.currentIssuedRevision,
                    row.currentIssuedDate,
                    row.currentStatus,
                    String(row.archived)
                ];
            }
        } else {
            const { auth, source, canHandoff } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateCurrentSource"])(trx, context, {
                ...query,
                ...paging
            }, assigned, handoff);
            for await (const { queue, evidence: row } of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateCurrentEvidence"])(trx, context, source, auth.clock.today, canHandoff, signal)){
                if (queue !== query.selected) continue;
                yield [
                    ...common,
                    row.recordId,
                    row.estimateNumber,
                    row.revision,
                    row.label,
                    row.ownerKey,
                    row.parentType,
                    row.status,
                    row.issuedDate,
                    row.validUntil,
                    row.status === 'accepted' ? row.decisionDate : null,
                    ...moneyCells(row.money)
                ];
            }
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope: access.scope,
        handoff,
        archiveVisibility,
        asOf: report.asOf,
        today: clock.today,
        timezone: report.timezone,
        dateBasis,
        count,
        coverage,
        columns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportExportColumns"])(input),
        rows
    };
}
}),
"[project]/packages/data/src/reports/estimate-export.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createEstimateReportCSVExport",
    ()=>createEstimateReportCSVExport,
    "previewEstimateReportExport",
    ()=>previewEstimateReportExport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
function preview(projection, limits) {
    const { rows, ...metadata } = projection;
    void rows;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
function auditSelection(input) {
    const { workspaceId, filters, ...query } = input.query;
    void workspaceId;
    const fingerprint = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest('hex');
    return JSON.stringify({
        dataset: input.dataset,
        query: {
            ...query,
            filters: {
                ...filters,
                owners: filters.owners.map(fingerprint)
            }
        }
    });
}
async function previewEstimateReportExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareEstimateReportCSVProjectionInTransaction"])(trx, context, input), limits));
}
async function createEstimateReportCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'estimates',
        label: 'Estimates',
        dataset: input.dataset,
        selection: auditSelection(input),
        prepare: async (trx, context, limits)=>{
            const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareEstimateReportCSVProjectionInTransaction"])(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: value.scope === 'assigned_job' ? 'assigned' : 'workspace',
                outputScopes: JSON.stringify({
                    view: value.input.query.view,
                    scope: value.scope,
                    handoff: value.handoff,
                    archiveVisibility: value.archiveVisibility
                })
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                scope: value.scope,
                handoff: value.handoff,
                archiveVisibility: value.archiveVisibility,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                dateBasis: value.dateBasis,
                count: value.count,
                limits: value.limits
            })
    }, requestSignal);
}
}),
"[project]/packages/data/src/reports/activity-estimates.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateActivityReportActionSQL",
    ()=>estimateActivityReportActionSQL,
    "validateEstimateReportActivity",
    ()=>validateEstimateReportActivity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$history$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/estimates/history.ts [instrumentation] (ecmascript)");
;
const actions = {
    created: 'created',
    'draft.saved': 'updated',
    sent: 'sent',
    published: 'updated',
    'revision-created': 'created',
    superseded: 'updated',
    expired: 'updated',
    archived: 'archived',
    restored: 'updated',
    resent: 'sent',
    'email-sent': 'sent',
    'delivery-failed': 'updated',
    viewed: 'updated',
    'decision-recorded': 'decision-recorded',
    'decision-corrected': 'decision-recorded',
    converted: 'updated',
    voided: 'updated'
};
function estimateActivityReportActionSQL(trx) {
    const entries = Object.entries(actions);
    return trx.raw(`CASE h.type ${entries.map(()=>'WHEN ? THEN ?').join(' ')} END AS action`, entries.flat());
}
function validateEstimateReportActivity(row) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$estimates$2f$history$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["projectEstimateActivity"])(row);
}
}),
"[project]/packages/data/src/reports/activity-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveActivityReportExportScopes",
    ()=>resolveActivityReportExportScopes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/customers/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function resolveActivityReportExportScopes(context) {
    const none = {
        lead: null,
        customer: null,
        job: null,
        estimate: null,
        'work-order': null
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.export'
    }).allowed) return none;
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (!report.allowed || report.resourceKind !== 'report') return none;
    const orders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    const orderExport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.export');
    const estimate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEstimateReportExportAccess"])(context);
    const customers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["customerCapabilities"])(context);
    const orderScope = orders.allowed && orders.resourceKind === 'work_order' && orderExport.allowed && orderExport.resourceKind === 'work_order' && [
        'workspace',
        'assigned_job'
    ].includes(orders.scope) && [
        'workspace',
        'assigned_job'
    ].includes(orderExport.scope) ? report.scope === 'assigned' || orders.scope === 'assigned_job' || orderExport.scope === 'assigned_job' ? 'assigned' : 'workspace' : null;
    return {
        lead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveLeadReportExportScope"])(context),
        customer: report.scope === 'workspace' && customers.read && customers.export ? 'workspace' : null,
        job: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveJobReportExportScope"])(context),
        estimate: estimate ? estimate.scope === 'workspace' ? 'workspace' : 'assigned' : null,
        'work-order': orderScope
    };
}
}),
"[project]/packages/data/src/reports/activity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareActivityReportInTransaction",
    ()=>prepareActivityReportInTransaction,
    "readActivityReportInTransaction",
    ()=>readActivityReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/query.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/query.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/customers/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-estimates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
const estimateValidationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    createdAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    source: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    actorName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].null(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    changes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()
});
async function prepareActivityReportInTransaction(trx, context, rawQuery, mode = 'read') {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportQuerySchema"].parse(rawQuery);
    const exportScopes = mode === 'export' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveActivityReportExportScopes"])(context) : undefined;
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (query.workspaceId !== context.workspaceId || !report.allowed || report.resourceKind !== 'report') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select('timezone', trx.raw('CURRENT_TIMESTAMP AS "asOf"'), trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.timezone !== 'string' || !(clock.asOf instanceof Date) || typeof clock.today !== 'string') {
        throw new Error('The workspace Activity clock is unavailable.');
    }
    if (query.period.to > clock.today) throw new RangeError('Activity periods cannot extend beyond business-local today.');
    const datePredicate = `h."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
    h."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?) AND h."createdAt" <= CURRENT_TIMESTAMP`;
    const dateBindings = [
        query.period.from,
        clock.timezone,
        query.period.to,
        clock.timezone
    ];
    const includedDomains = [];
    const sources = [];
    const lead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'leads.read');
    if (lead.allowed && report.sourceScopes?.lead && (!exportScopes || exportScopes.lead)) {
        const { query: parents, scope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedLeadQuery"])(trx, context);
        const assigned = scope === 'assigned' || report.sourceScopes.lead === 'assigned' || exportScopes?.lead === 'assigned';
        if (assigned) parents.where('l.ownerId', context.userId);
        const archived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission: 'leads.archive',
            resource: {
                kind: 'lead',
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                ownerId: null
            }
        }).allowed;
        if (!archived) parents.whereNull('l.archivedAt');
        includedDomains.push({
            domain: 'lead',
            scope: assigned ? 'assigned' : 'workspace',
            archiveVisibility: archived ? 'included' : 'excluded'
        });
        sources.push(parents.join('leadActivity as h', (q)=>q.on('h.leadId', 'l.id').andOn('h.workspaceId', 'l.workspaceId')).whereNot('h.type', 'note').whereRaw(datePredicate, dateBindings).select(trx.raw(`'lead'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", h."actorName", h."actorType" AS source, h.type, l.id AS "recordId", NULL::jsonb AS validation,
        left('Lead L-' || l."leadNumber"::text || ' / ' || l.name, 160) AS "recordLabel",
        CASE WHEN jsonb_typeof(h.changes) = 'object' THEN CASE h.type
          WHEN 'created' THEN 'created' WHEN 'edited' THEN 'updated' WHEN 'restored' THEN 'updated'
          WHEN 'archived' THEN 'archived' WHEN 'stage' THEN 'stage-changed'
          WHEN 'assigned' THEN 'assignment-changed' END END AS action`)).toSQL());
    }
    const jobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    if (jobs.allowed && report.sourceScopes?.job && (!exportScopes || exportScopes.job)) {
        const { query: parents, scope } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedJobQuery"])(trx, context, report.sourceScopes.job === 'assigned' || exportScopes?.job === 'assigned');
        includedDomains.push({
            domain: 'job',
            scope,
            archiveVisibility: 'not-applicable'
        });
        sources.push(parents.join('jobActivity as h', (q)=>q.on('h.jobId', 'j.id').andOn('h.workspaceId', 'j.workspaceId')).whereNot('h.type', 'note').whereRaw(datePredicate, dateBindings).select(trx.raw(`'job'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", h."actorName", h.source, h.type, j.id AS "recordId", NULL::jsonb AS validation,
        left('Job J-' || j."jobNumber"::text || ' / ' || j.title, 160) AS "recordLabel",
        CASE WHEN jsonb_typeof(h.changes) = 'object' THEN CASE h.type
          WHEN 'created' THEN 'created' WHEN 'edit' THEN 'updated' WHEN 'assign' THEN 'assignment-changed'
          WHEN 'deadline' THEN 'deadline-changed' WHEN 'schedule' THEN 'visit-changed'
          WHEN 'status' THEN CASE WHEN h.changes->>'to' = 'completed' THEN 'completed'
            WHEN h.changes->>'to' IN ('needs-scheduling','scheduled','in-progress','waiting','canceled') THEN 'status-changed' END END END AS action`)).toSQL());
    }
    const customers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$customers$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["customerCapabilities"])(context);
    if (report.scope === 'workspace' && customers.read && (!exportScopes || exportScopes.customer)) {
        const parents = trx('customers as c').where('c.workspaceId', context.workspaceId);
        if (!customers.archive) parents.whereNull('c.archivedAt');
        includedDomains.push({
            domain: 'customer',
            scope: 'workspace',
            archiveVisibility: customers.archive ? 'included' : 'excluded'
        });
        sources.push(parents.join('customerActivity as h', (q)=>q.on('h.customerId', 'c.id').andOn('h.workspaceId', 'c.workspaceId')).whereNot('h.type', 'note').whereRaw(datePredicate, dateBindings).select(trx.raw(`'customer'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", NULL::text AS "actorName", 'unrecorded'::text AS source, h.type, c.id AS "recordId", NULL::jsonb AS validation,
        left('Customer CU-' || CASE WHEN length(c."customerNumber"::text) < 4
          THEN lpad(c."customerNumber"::text, 4, '0') ELSE c."customerNumber"::text END || ' / ' || c.name, 160) AS "recordLabel",
        CASE h.type WHEN 'created' THEN 'created' WHEN 'updated' THEN 'updated'
          WHEN 'archived' THEN 'archived' WHEN 'restored' THEN 'updated'
          WHEN 'linked' THEN 'updated' WHEN 'unlinked' THEN 'updated' END AS action`)).toSQL());
    }
    const estimates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read');
    const assignedEstimates = report.scope === 'assigned' || estimates.allowed && estimates.scope === 'assigned_job';
    if (estimates.allowed && (!assignedEstimates || report.sourceScopes?.job) && (!exportScopes || exportScopes.estimate)) {
        const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context, exportScopes?.estimate === 'assigned');
        const parents = auth.scoped;
        if (!auth.includeArchived) parents.whereNull('e.archivedAt');
        includedDomains.push({
            domain: 'estimate',
            scope: auth.assigned ? 'assigned' : 'workspace',
            archiveVisibility: auth.includeArchived ? 'included' : 'excluded'
        });
        sources.push(parents.join('estimate_activity as h', (q)=>q.on('h.estimateId', 'e.id').andOn('h.workspaceId', 'e.workspaceId')).whereRaw(datePredicate, dateBindings).select(trx.raw(`'estimate'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
        h."actorId", NULL::text AS "actorName", h.source, h.type, e.id AS "recordId",
        jsonb_build_object('id', h.id, 'createdAt', h."createdAt", 'source', h.source,
          'actorName', NULL, 'type', h.type, 'changes', h.changes) AS validation,
        left('Estimate EST-' || CASE WHEN length(e."estimateNumber"::text) < 4
          THEN lpad(e."estimateNumber"::text, 4, '0') ELSE e."estimateNumber"::text END ||
          ' / revision ' || e.revision::text || ' / ' || e.name, 160) AS "recordLabel"`), (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateActivityReportActionSQL"])(trx)).toSQL());
    }
    const workOrders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    if (workOrders.allowed && (!exportScopes || exportScopes['work-order'])) {
        const assigned = report.scope === 'assigned' || workOrders.scope === 'assigned_job' || exportScopes?.['work-order'] === 'assigned';
        const parents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scoped"])(trx, context, assigned);
        includedDomains.push({
            domain: 'work-order',
            scope: assigned ? 'assigned' : 'workspace',
            archiveVisibility: 'included'
        });
        sources.push(parents.join('workOrderActivity as h', (q)=>q.on('h.workOrderId', 'w.id').andOn('h.workspaceId', 'w.workspaceId')).whereNot('h.type', 'note').whereRaw(datePredicate, dateBindings).select(trx.raw(`'work-order'::text AS domain, h.id AS "eventId", h."createdAt" AS "occurredAt",
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
    if (!includedDomains.length || query.filters.domains.some((domain)=>!includedDomains.some((item)=>item.domain === domain))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const commonSQL = `WITH native AS MATERIALIZED (${sources.map((source)=>source.sql).join(' UNION ALL ')}),
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
    const commonBindings = [
        ...sources.flatMap((source)=>[
                ...source.bindings
            ]),
        context.workspaceId,
        JSON.stringify(includedDomains.map((item)=>item.domain)),
        query.filters.domains,
        query.filters.domains,
        query.filters.actions,
        query.filters.actions,
        query.filters.actors,
        query.filters.actors
    ];
    const bindings = [
        ...commonBindings,
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize,
        query.filters.actions,
        query.filters.actors
    ];
    const cursor = `activity_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
    let row;
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [
        cursor,
        ...bindings
    ]);
    try {
        let batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
            cursor
        ]);
        while(batch.rows.length){
            for (const projection of batch.rows){
                row ??= projection;
                if (projection.invalid !== '0' || projection.invalidActors !== '0') {
                    throw new Error('Authorized Activity contains an unsupported event type, source or actor. Open the record history and retry.');
                }
                if (projection.validation !== null) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateEstimateReportActivity"])(estimateValidationSchema.parse(projection.validation));
                }
            }
            batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ]);
        }
    } finally{
        await trx.raw('CLOSE ??', [
            cursor
        ]);
    }
    if (!row) throw new Error('The database returned no Activity projection.');
    if (row.invalidSelection) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportResultSchema"].parse({
        workspaceId: context.workspaceId,
        view: 'activity',
        from: query.period.from,
        to: query.period.to,
        today: clock.today,
        asOf: clock.asOf.toISOString(),
        timezone: clock.timezone,
        scopeLabel: 'Native Lead/Job/Customer/Estimate/Work Order events on currently authorized surviving parents. Customer history requires workspace Reports and full Customer read; assigned Reports omit it. Notes and linked-Lead copies excluded. Estimate history includes surviving revisions and drafts, not just the latest effective decision. Work Order history uses current primary/crew or assigned parent Job access, excludes assigned Drafts and includes readable archives without requiring archive mutation authority. Events are not unique business actions or productivity.',
        includedDomains,
        omittedDomains: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportActivityDomains"].filter((domain)=>!includedDomains.some((item)=>item.domain === domain)).map((domain)=>({
                domain,
                reason: 'permissions'
            })),
        filters: query.filters,
        options: row.options,
        total: Number(row.total),
        rows: row.rows,
        page: row.page,
        pageSize: query.pageSize
    });
    async function* evidence(signal) {
        const cursor = `activity_evidence_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
        await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${commonSQL}
      SELECT jsonb_build_object('domain', domain, 'eventId', "eventId",
        'occurredAt', to_char("occurredAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
        'action', action, 'actor', jsonb_build_object('kind', CASE WHEN "actorKey" = 'system' THEN 'system' ELSE 'member' END,
          'key', "actorKey", 'label', "actorLabel"), 'recordId', "recordId", 'recordLabel', "recordLabel") AS row
      FROM filtered ORDER BY "occurredAt" DESC, domain COLLATE "C", "eventId"`, [
            cursor,
            ...commonBindings
        ]);
        try {
            while(true){
                signal?.throwIfAborted();
                const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                    cursor
                ]);
                if (!batch.rows.length) break;
                for (const item of batch.rows){
                    signal?.throwIfAborted();
                    yield __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportEventSchema"].parse(item.row);
                }
            }
        } finally{
            await trx.raw('CLOSE ??', [
                cursor
            ]);
        }
    }
    return {
        report: result,
        evidence
    };
}
async function readActivityReportInTransaction(trx, context, rawQuery) {
    return (await prepareActivityReportInTransaction(trx, context, rawQuery)).report;
}
}),
"[project]/packages/data/src/reports/activity-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareActivityReportCSVProjectionInTransaction",
    ()=>prepareActivityReportCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity.ts [instrumentation] (ecmascript)");
;
;
async function prepareActivityReportCSVProjectionInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportExportInputSchema"].parse(raw);
    const { report, evidence } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareActivityReportInTransaction"])(trx, context, {
        ...input.query,
        page: 1,
        pageSize: 100
    }, 'export');
    const coverage = 'Native authorized parent histories only; omitted domains require their own export authority. Notes and linked-Lead copies are excluded.';
    const included = JSON.stringify(report.includedDomains), omitted = JSON.stringify(report.omittedDomains);
    const common = [
        report.from,
        report.to,
        report.asOf,
        report.timezone,
        included,
        omitted
    ];
    async function* rows(signal) {
        signal?.throwIfAborted();
        if (input.dataset === 'summary') {
            yield [
                ...common,
                report.total
            ];
            return;
        }
        for await (const event of evidence(signal)){
            yield [
                ...common,
                event.domain,
                event.eventId,
                event.occurredAt,
                event.action,
                event.actor.key,
                event.actor.label,
                event.recordId,
                event.recordLabel
            ];
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        asOf: report.asOf,
        today: report.today,
        timezone: report.timezone,
        includedDomains: report.includedDomains,
        omittedDomains: report.omittedDomains,
        count: input.dataset === 'summary' ? 1 : report.total,
        columns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportExportColumns"])(input),
        coverage,
        rows
    };
}
}),
"[project]/packages/data/src/reports/activity-export.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createActivityReportCSVExport",
    ()=>createActivityReportCSVExport,
    "previewActivityReportExport",
    ()=>previewActivityReportExport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
function preview(projection, limits) {
    const { rows, ...metadata } = projection;
    void rows;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
function auditSelection(input) {
    const { workspaceId, filters, ...query } = input.query;
    void workspaceId;
    const fingerprint = (value)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest('hex');
    return JSON.stringify({
        dataset: input.dataset,
        query: {
            ...query,
            filters: {
                ...filters,
                actors: filters.actors.map(fingerprint)
            }
        }
    });
}
async function previewActivityReportExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareActivityReportCSVProjectionInTransaction"])(trx, context, input), limits));
}
async function createActivityReportCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'activity',
        label: 'Activity',
        dataset: input.dataset,
        selection: auditSelection(input),
        prepare: async (trx, context, limits)=>{
            const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareActivityReportCSVProjectionInTransaction"])(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: value.includedDomains.some((domain)=>domain.scope === 'workspace') ? 'workspace' : 'assigned',
                outputScopes: JSON.stringify({
                    view: 'activity',
                    includedDomains: value.includedDomains,
                    omittedDomains: value.omittedDomains
                })
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                includedDomains: value.includedDomains,
                omittedDomains: value.omittedDomains,
                count: value.count,
                limits: value.limits
            })
    }, requestSignal);
}
}),
"[project]/packages/data/src/reports/financial-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveFinancialReportExportAccess",
    ()=>resolveFinancialReportExportAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-export-access.ts [instrumentation] (ecmascript)");
;
;
function resolveFinancialReportExportAccess(context) {
    const unavailable = {
        estimates: null,
        materials: null
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.financial.read'
    }).allowed) return unavailable;
    const scopes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveActivityReportExportScopes"])(context);
    const can = (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission,
            resource: {
                kind: 'work_order',
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                job: null
            }
        }).allowed;
    return {
        estimates: scopes.estimate,
        materials: scopes['work-order'] && can('workorders.view_prices') && can('workorders.view_costs') ? {
            scope: scopes['work-order'],
            jobScope: scopes.job
        } : null
    };
}
}),
"[project]/packages/data/src/reports/financial-materials.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "financialMaterialEvidence",
    ()=>financialMaterialEvidence,
    "prepareFinancialMaterialsReportInTransaction",
    ()=>prepareFinancialMaterialsReportInTransaction,
    "readFinancialMaterialsReportInTransaction",
    ()=>readFinancialMaterialsReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-materials.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/work-order.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$material$2d$cost$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/work-orders/material-cost.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/work-orders/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/query.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
const material = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    workOrderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    workOrderLabel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    jobLabel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    workOrderStatus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'issued',
        'in-progress'
    ]),
    itemLabel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    quantity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    unit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMaterialStatuses"]),
    unitCostCents: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nullable(),
    changedAfterIssue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean()
});
const materialEvidenceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialMaterialsResultSchema"].shape.rows.element;
const emptyCoverage = ()=>({
        lineCount: 0,
        knownCostLines: 0,
        missingCostLines: 0,
        knownCostCents: null
    });
function addLine(total, cost) {
    total.lineCount++;
    if (cost === null) total.missingCostLines++;
    else {
        total.knownCostLines++;
        total.knownCostCents = (total.knownCostCents ?? 0) + cost;
    }
    if (![
        total.lineCount,
        total.knownCostLines,
        total.missingCostLines,
        total.knownCostCents
    ].every((value)=>value === null || Number.isSafeInteger(value))) {
        throw new RangeError('Recorded material costs exceed the safe integer range.');
    }
}
async function* financialMaterialEvidence(trx, source, signal) {
    const cursor = `financial_materials_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`, sql = source.toSQL();
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [
        cursor,
        ...sql.bindings
    ]);
    try {
        while(true){
            signal?.throwIfAborted();
            const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ]);
            if (!batch.rows.length) break;
            for (const saved of batch.rows){
                signal?.throwIfAborted();
                const row = material.parse(saved), cost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$work$2d$orders$2f$material$2d$cost$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordedMaterialLineCostCents"])(row.quantity, row.unitCostCents);
                if (cost === undefined) throw new Error('An authorized material has an invalid quantity or recorded unit cost.');
                yield materialEvidenceSchema.parse({
                    ...row,
                    lineCostCents: cost
                });
            }
        }
    } finally{
        await trx.raw('CLOSE ??', [
            cursor
        ]);
    }
}
async function prepareFinancialMaterialsReportInTransaction(trx, context, rawQuery, options = {}) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialMaterialsQuerySchema"].parse(rawQuery);
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (query.workspaceId !== context.workspaceId || !report.allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.financial.read'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select('timezone', trx.raw('CURRENT_TIMESTAMP AS "asOf"'), trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.timezone !== 'string' || typeof clock.today !== 'string' || !(clock.asOf instanceof Date)) {
        throw new Error('The workspace Financial clock is unavailable.');
    }
    const orders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    const assigned = !!options.forceAssigned || report.scope === 'assigned' || orders.allowed && orders.scope === 'assigned_job';
    const scope = assigned ? 'assigned' : 'workspace';
    const base = {
        workspaceId: context.workspaceId,
        view: 'financial-materials',
        today: clock.today,
        asOf: clock.asOf.toISOString(),
        timezone: clock.timezone,
        scope,
        archiveVisibility: 'excluded',
        scopeLabel: 'Current non-archived issued/in-progress Work Order material snapshots. Rounded half up per line; missing costs excluded, not zero. Not actual spend or consumption; post-issue edits may restate.',
        filters: query.filters,
        selected: query.selected,
        pageSize: query.pageSize
    };
    const can = (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
            permission,
            resource: {
                kind: 'work_order',
                id: context.workspaceId,
                workspaceId: context.workspaceId,
                job: null
            }
        }).allowed;
    if (!orders.allowed || !can('workorders.view_prices') || !can('workorders.view_costs')) {
        const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialMaterialsResultSchema"].parse({
            ...base,
            costs: {
                kind: 'unavailable',
                reason: 'permissions',
                explanation: 'Current Work Order read, price and cost authority is required. Material evidence and costs are withheld.'
            },
            evidenceTotal: 0,
            rows: [],
            page: 1
        });
        return {
            report: result,
            source: null
        };
    }
    const source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$work$2d$orders$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scoped"])(trx, context, assigned).whereNull('w.archivedAt').whereIn('w.status', [
        'issued',
        'in-progress'
    ]).join('workOrderMaterials as m', (join)=>join.on('m.workspaceId', 'w.workspaceId').andOn('m.workOrderId', 'w.id'));
    if (query.filters.statuses.length) source.whereIn('m.status', query.filters.statuses);
    const jobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const visibleJobs = options.allowJobLabels !== false && jobs.allowed && report.sourceScopes?.job ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedJobQuery"])(trx, context, report.sourceScopes.job === 'assigned' || !!options.forceAssignedJobLabels).query.select('j.id').toSQL() : null;
    source.select('m.id', 'm.workOrderId', 'm.unit', 'm.status', 'w.status as workOrderStatus', 'm.costCents as unitCostCents', trx.raw(`m.quantity::text AS quantity, m.name AS "itemLabel", w."changedAfterIssueAt" IS NOT NULL AS "changedAfterIssue",
      left('Work Order WO-' || CASE WHEN length(w."workOrderNumber"::text) < 4 THEN lpad(w."workOrderNumber"::text, 4, '0')
        ELSE w."workOrderNumber"::text END || ' / ' || w.title, 200) AS "workOrderLabel"`), visibleJobs ? trx.raw(`CASE WHEN w."jobId" IN (${visibleJobs.sql}) THEN left('Job J-' || j."jobNumber"::text || ' / ' || j.title, 200)
      ELSE NULL END AS "jobLabel"`, [
        ...visibleJobs.bindings
    ]) : trx.raw('NULL::text AS "jobLabel"')).orderBy('w.id').orderBy('m.id');
    const total = emptyCoverage(), groups = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["workOrderMaterialStatuses"].map((status)=>({
            status,
            ...emptyCoverage()
        }));
    const requested = [];
    let last = [], evidenceTotal = 0;
    const offset = (query.page - 1) * query.pageSize;
    for await (const evidence of financialMaterialEvidence(trx, source)){
        const cost = evidence.lineCostCents;
        addLine(total, cost);
        const group = groups.find((item)=>item.status === evidence.status);
        if (!group) throw new Error('An authorized material has an unsupported workflow status.');
        addLine(group, cost);
        if (query.selected !== 'all' && (query.selected === 'known' ? cost === null : cost !== null)) continue;
        if (evidenceTotal % query.pageSize === 0) last = [];
        last.push(evidence);
        if (evidenceTotal >= offset && evidenceTotal < offset + query.pageSize) requested.push(evidence);
        evidenceTotal++;
    }
    const page = Math.min(query.page, Math.max(1, Math.ceil(evidenceTotal / query.pageSize)));
    return {
        report: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialMaterialsResultSchema"].parse({
            ...base,
            costs: {
                kind: 'available',
                coverage: total,
                groups
            },
            evidenceTotal,
            page,
            rows: page === query.page ? requested : last
        }),
        source
    };
}
async function readFinancialMaterialsReportInTransaction(trx, context, rawQuery) {
    return (await prepareFinancialMaterialsReportInTransaction(trx, context, rawQuery)).report;
}
}),
"[project]/packages/data/src/reports/financial-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareFinancialReportCSVProjectionInTransaction",
    ()=>prepareFinancialReportCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-materials.ts [instrumentation] (ecmascript)");
;
;
;
;
;
async function prepareFinancialReportCSVProjectionInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportExportInputSchema"].parse(raw), { query, dataset } = input;
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFinancialReportExportAccess"])(context);
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.today !== 'string') throw new Error('The Financial export clock is unavailable.');
    if (query.period.to > clock.today) throw new RangeError('Financial periods cannot extend beyond the workspace date.');
    if (query.selected !== 'materials') {
        if (!access.estimates) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const estimate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareEstimateReportCSVProjectionInTransaction"])(trx, context, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialEstimateExportInput"])(input), {
            allowHandoff: false
        });
        async function* rows(signal) {
            for await (const row of estimate.rows(signal)){
                const selected = dataset === 'evidence' ? row : query.selected === 'accepted' ? row.filter((_, index)=>index !== 11) : row.filter((_, index)=>![
                        11,
                        12,
                        13
                    ].includes(index));
                yield [
                    query.selected,
                    ...selected
                ];
            }
        }
        return {
            input,
            workspaceId: context.workspaceId,
            viewerId: context.userId,
            policyRevision: context.policy.revision,
            asOf: estimate.asOf,
            today: estimate.today,
            timezone: estimate.timezone,
            section: query.selected,
            scope: estimate.scope === 'workspace' ? 'workspace' : 'assigned',
            jobScope: null,
            archiveVisibility: estimate.archiveVisibility,
            count: estimate.count,
            columns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportExportColumns"])(input),
            coverage: `${estimate.coverage} ${query.selected === 'awaiting' ? 'Current snapshot; the selected historical period does not apply.' : 'Accepted decisions in the selected historical period.'}`,
            rows
        };
    }
    if (!access.materials) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const prepared = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareFinancialMaterialsReportInTransaction"])(trx, context, {
        workspaceId: context.workspaceId,
        view: 'financial-materials',
        filters: {
            statuses: []
        },
        selected: 'all',
        page: 1,
        pageSize: 100
    }, {
        forceAssigned: access.materials.scope === 'assigned',
        allowJobLabels: access.materials.jobScope !== null,
        forceAssignedJobLabels: access.materials.jobScope === 'assigned'
    });
    const { report, source } = prepared;
    if (report.costs.kind !== 'available' || !source) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const materialSource = source;
    const cost = report.costs.coverage;
    const coverage = 'Current non-archived issued/in-progress Work Order materials; missing costs are not zero. Not actual spend.';
    const common = [
        query.selected,
        report.asOf,
        report.timezone,
        report.scope,
        coverage
    ];
    async function* rows1(signal) {
        signal?.throwIfAborted();
        if (dataset === 'summary') {
            yield [
                ...common,
                cost.lineCount,
                cost.knownCostLines,
                cost.missingCostLines,
                cost.knownCostCents
            ];
            return;
        }
        for await (const row of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialMaterialEvidence"])(trx, materialSource, signal)){
            yield [
                ...common,
                row.id,
                row.workOrderId,
                row.workOrderLabel,
                row.jobLabel,
                row.workOrderStatus,
                row.itemLabel,
                row.quantity,
                row.unit,
                row.status,
                row.unitCostCents,
                row.lineCostCents,
                String(row.changedAfterIssue)
            ];
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        asOf: report.asOf,
        today: report.today,
        timezone: report.timezone,
        section: query.selected,
        scope: report.scope,
        jobScope: access.materials.jobScope,
        archiveVisibility: report.archiveVisibility,
        count: dataset === 'summary' ? 1 : report.evidenceTotal,
        columns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportExportColumns"])(input),
        coverage,
        rows: rows1
    };
}
}),
"[project]/packages/data/src/reports/financial-export.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createFinancialReportCSVExport",
    ()=>createFinancialReportCSVExport,
    "previewFinancialReportExport",
    ()=>previewFinancialReportExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
function preview(projection, limits) {
    const { rows, ...metadata } = projection;
    void rows;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
async function previewFinancialReportExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareFinancialReportCSVProjectionInTransaction"])(trx, context, input), limits));
}
async function createFinancialReportCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'financial',
        label: 'Financial',
        dataset: input.dataset,
        selection: JSON.stringify({
            dataset: input.dataset,
            selected: input.query.selected,
            period: input.query.period
        }),
        prepare: async (trx, context, limits)=>{
            const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareFinancialReportCSVProjectionInTransaction"])(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: value.scope,
                outputScopes: JSON.stringify({
                    section: value.section,
                    scope: value.scope,
                    jobScope: value.jobScope,
                    archiveVisibility: value.archiveVisibility
                })
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                section: value.section,
                scope: value.scope,
                jobScope: value.jobScope,
                archiveVisibility: value.archiveVisibility,
                count: value.count,
                limits: value.limits
            })
    }, requestSignal);
}
}),
"[project]/packages/data/src/reports/calendar-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareCalendarCSVProjectionInTransaction",
    ()=>prepareCalendarCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-scheduled.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-review.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-filters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-scheduled.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-review.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-unscheduled.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
const text = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(4000).refine((value)=>!/[\u0000-\u001f\u007f]/.test(value));
const date = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].iso.date();
const linkedRecord = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    recordId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'job',
        'work_order'
    ]),
    label: text,
    participantIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(text)
}).strict();
const visit = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    label: text,
    date: date.nullable(),
    span: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportArrivalWindowSchema"].nullable(),
    people: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(text),
    records: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(linkedRecord).min(1)
}).strict();
const record = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    visitId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    label: text,
    status: text,
    people: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(text)
}).strict();
const overlap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    personId: text,
    label: text,
    date,
    left: visit,
    right: visit
}).strict();
async function prepareCalendarCSVProjectionInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarExportInputSchema"].parse(raw);
    const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requireCalendarExportAccess"])(context, input);
    const { query, dataset } = input;
    const paging = {
        page: 1,
        pageSize: 100
    };
    const report = query.view === 'calendar-scheduled' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarScheduledReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, access.outputScopes) : query.view === 'calendar-review' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarReviewReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, access.outputScopes) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarUnscheduledReportInTransaction"])(trx, context, {
        ...query,
        ...paging
    }, access.outputScopes);
    if (JSON.stringify(report.scope) !== JSON.stringify(access.scope)) {
        throw new Error('Calendar export and native read scope disagree.');
    }
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarExportColumns"])(input);
    const dateBasis = query.view === 'calendar-unscheduled' ? 'current-unscheduled' : 'current-scheduled-date';
    const coverage = 'Current authorized active records; visits distinct; participant totals and person-pairs non-additive; ' + 'past schedules do not prove missed attendance. ' + `Jobs: ${access.outputScopes.jobs.kind}; Work Orders: ${access.outputScopes.workOrders.kind}.`;
    const common = [
        query.view,
        dataset,
        dateBasis,
        'period' in query ? query.period.from : null,
        'period' in query ? query.period.to : null,
        report.asOf,
        report.timezone,
        access.scope.kind,
        access.outputScopes.jobs.kind === 'available' ? access.outputScopes.jobs.scope : null,
        access.outputScopes.workOrders.kind === 'available' ? access.outputScopes.workOrders.scope : null,
        coverage
    ];
    const count = dataset === 'summary' ? 1 : dataset === 'days' && report.view === 'calendar-scheduled' ? report.days.length : dataset === 'person-days' && report.view === 'calendar-scheduled' ? report.members.length * report.days.length : report.evidenceTotal;
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Calendar export count is invalid.');
    async function* rows(signal) {
        signal?.throwIfAborted();
        if (dataset === 'summary') {
            yield [
                ...common,
                ...report.view === 'calendar-scheduled' ? [
                    report.counts.visits,
                    report.counts.busyPersonDays,
                    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarScheduledBusyThreshold"]
                ] : report.view === 'calendar-review' ? [
                    report.counts.scheduledVisits,
                    report.counts.missingWindows,
                    report.counts.overlapPairs,
                    report.counts.pastVisits
                ] : [
                    report.counts.visits,
                    access.outputScopes.jobs.kind === 'available' ? report.counts.jobs : null,
                    access.outputScopes.workOrders.kind === 'available' ? report.counts.workOrders : null
                ]
            ];
            return;
        }
        if (report.view === 'calendar-scheduled' && (dataset === 'days' || dataset === 'person-days' || dataset === 'busy-person-days')) {
            let emitted = 0;
            const members = [
                ...report.members
            ].sort((left, right)=>left.id.localeCompare(right.id));
            for (const [index, day] of report.days.entries()){
                signal?.throwIfAborted();
                if (dataset === 'days') {
                    emitted++;
                    yield [
                        ...common,
                        day.date,
                        day.count,
                        day.unassignedCount
                    ];
                } else for (const member of members){
                    signal?.throwIfAborted();
                    const visits = member.counts[index];
                    if (!Number.isSafeInteger(visits) || visits === undefined) throw new Error('Calendar person-day count is invalid.');
                    if (dataset === 'busy-person-days' && visits < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarScheduledBusyThreshold"]) continue;
                    emitted++;
                    yield [
                        ...common,
                        text.parse(member.id),
                        text.parse(member.label),
                        day.date,
                        visits,
                        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarScheduledBusyThreshold"]
                    ];
                }
            }
            if (emitted !== count) throw new Error('Calendar export person-day population does not match its count.');
            return;
        }
        const source = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filteredCalendarReportRecords"])(trx, context, access.scope.kind === 'own', query.filters, query.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated', 'period' in query ? query.period : undefined, access.outputScopes);
        const ctes = `WITH visible AS MATERIALIZED (${source.sql}),
      visitPeople AS MATERIALIZED (
        SELECT "visitId", array_agg(DISTINCT p ORDER BY p) AS people
        FROM visible CROSS JOIN LATERAL unnest(people) p GROUP BY "visitId"
      ),
      visits AS MATERIALIZED (
        SELECT v."visitId" AS id, min(v.title) AS label, v."scheduledDate" AS date, v."arrivalWindow" AS span,
          COALESCE(p.people, ARRAY[]::text[]) AS people,
          jsonb_agg(jsonb_build_object('recordId', v.id, 'type', v.type,
            'label', ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRecordLabelSQL"])('v')},
            'participantIds', to_jsonb(v.people)) ORDER BY v.type, v.id) AS records
        FROM visible v LEFT JOIN visitPeople p ON p."visitId" = v."visitId"
        GROUP BY v."visitId", v."scheduledDate", v."arrivalWindow", p.people
      )`;
        const statement = dataset === 'overlaps' ? `${ctes} SELECT jsonb_build_object('personId', p, 'label', u.name, 'date', l.date,
          'left', to_jsonb(l), 'right', to_jsonb(r)) AS row
        FROM visits l JOIN visits r ON l.date = r.date AND l.id < r.id
        CROSS JOIN LATERAL unnest(l.people) p JOIN users u ON u.id = p
        WHERE p = ANY(r.people) AND l.span IS NOT NULL AND r.span IS NOT NULL
          AND left(l.span,5) < right(r.span,5) AND left(r.span,5) < right(l.span,5)
        ORDER BY l.date, p, l.id, r.id` : dataset === 'jobs' || dataset === 'workOrders' ? `WITH visible AS MATERIALIZED (${source.sql})
          SELECT jsonb_build_object('visitId', "visitId", 'id', id, 'status', status, 'people', to_jsonb(people),
            'label', ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportRecordLabelSQL"])('v')}) AS row
          FROM visible v WHERE type = ? ORDER BY "visitId", id` : `${ctes} SELECT to_jsonb(v) AS row FROM visits v ${dataset === 'past' ? 'WHERE date::date < ?::date' : ''}
          ORDER BY date NULLS FIRST, id`;
        const bindings = [
            ...source.bindings,
            ...dataset === 'past' ? [
                report.today
            ] : dataset === 'jobs' || dataset === 'workOrders' ? [
                dataset === 'jobs' ? 'job' : 'work_order'
            ] : []
        ];
        const cursor = `calendar_csv_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
        await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [
            cursor,
            ...bindings
        ]);
        let emitted = 0;
        try {
            while(true){
                signal?.throwIfAborted();
                const batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                    cursor
                ]);
                if (!batch.rows.length) break;
                for (const saved of batch.rows){
                    signal?.throwIfAborted();
                    let cells;
                    if (dataset === 'overlaps') {
                        const row = overlap.parse(saved.row);
                        cells = [
                            row.personId,
                            row.label,
                            row.date,
                            row.left.id,
                            row.left.label,
                            row.left.span,
                            row.right.id,
                            row.right.label,
                            row.right.span
                        ];
                    } else if (dataset === 'jobs' || dataset === 'workOrders') {
                        const row = record.parse(saved.row);
                        cells = [
                            row.visitId,
                            row.id,
                            row.label,
                            row.status,
                            JSON.stringify(row.people)
                        ];
                    } else {
                        const row = visit.parse(saved.row);
                        cells = [
                            row.id,
                            row.label,
                            row.date,
                            ...dataset === 'past' ? [
                                row.span
                            ] : [],
                            JSON.stringify(row.people),
                            JSON.stringify(row.records)
                        ];
                    }
                    emitted++;
                    if (emitted > count || common.length + cells.length !== columns.length) {
                        throw new Error('Calendar export evidence count or columns do not match the native projection.');
                    }
                    yield [
                        ...common,
                        ...cells
                    ];
                }
            }
            if (emitted !== count) throw new Error('Calendar export evidence population does not match its count.');
        } finally{
            await trx.raw('CLOSE ??', [
                cursor
            ]);
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope: access.scope,
        outputScopes: access.outputScopes,
        asOf: report.asOf,
        today: report.today,
        timezone: report.timezone,
        dateBasis,
        coverage,
        count,
        columns,
        rows
    };
}
}),
"[project]/packages/data/src/reports/calendar-export.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCalendarCSVExport",
    ()=>createCalendarCSVExport,
    "previewCalendarExport",
    ()=>previewCalendarExport
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
function preview(projection, limits) {
    const { rows, ...metadata } = projection;
    void rows;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
async function previewCalendarExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareCalendarCSVProjectionInTransaction"])(trx, context, input), limits));
}
async function createCalendarCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    const { workspaceId, filters, ...query } = input.query;
    void workspaceId;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'calendar',
        label: 'Calendar',
        dataset: input.dataset,
        selection: JSON.stringify({
            dataset: input.dataset,
            query: {
                ...query,
                filters: {
                    recordTypes: filters.recordTypes,
                    participants: filters.participants.map((id)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(id).digest('hex'))
                }
            }
        }),
        prepare: async (trx, context, limits)=>{
            const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareCalendarCSVProjectionInTransaction"])(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: value.scope.kind,
                outputScopes: JSON.stringify(value.outputScopes)
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                scope: value.scope,
                outputScopes: value.outputScopes,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                dateBasis: value.dateBasis,
                count: value.count,
                limits: value.limits
            })
    }, requestSignal);
}
;
}),
"[project]/packages/data/src/reports/source-estimates.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sourceAcceptedEstimatesQuery",
    ()=>sourceAcceptedEstimatesQuery,
    "sourceEstimateEvidence",
    ()=>sourceEstimateEvidence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
;
;
;
function sourceAcceptedEstimatesQuery(trx, scoped, timezone) {
    return scoped.clone().where('e.status', 'accepted').joinRaw(`LEFT JOIN LATERAL (
      SELECT * FROM estimate_decisions d WHERE d."workspaceId" = e."workspaceId" AND d."estimateId" = e.id
      ORDER BY d."estimateVersion" DESC, d.id DESC LIMIT 1
    ) d ON TRUE`).leftJoin('estimate_snapshots as s', (q)=>q.on('s.workspaceId', 'e.workspaceId').andOn('s.estimateId', 'e.id')).joinRaw(`JOIN LATERAL (
      SELECT count(*)::int AS "pathCount", min(link.id::text) AS "leadId",
        bool_or(link.id IN (SELECT id FROM cohort)) AS reachable FROM (
      SELECT DISTINCT candidate.id FROM (
        SELECT family."leadId" AS id FROM estimates family
          WHERE family."workspaceId" = e."workspaceId" AND family."estimateNumber" = e."estimateNumber" AND family."parentType" = 'lead'
        UNION ALL
        SELECT parent."sourceLeadId" FROM estimates family JOIN jobs parent
          ON parent."workspaceId" = family."workspaceId" AND parent.id = family."jobId"
          WHERE family."workspaceId" = e."workspaceId" AND family."estimateNumber" = e."estimateNumber" AND family."parentType" = 'job'
        UNION ALL
        SELECT converted."sourceLeadId" FROM jobs converted
          JOIN estimates family ON family."workspaceId" = converted."workspaceId" AND family.id = converted."acceptedEstimateId"
          WHERE family."workspaceId" = e."workspaceId" AND family."estimateNumber" = e."estimateNumber"
      ) candidate JOIN leads surviving ON surviving."workspaceId" = e."workspaceId" AND surviving.id = candidate.id
      ) link
    ) paths ON paths.reachable
    LEFT JOIN cohort attributed ON paths."pathCount" = 1 AND attributed.id::text = paths."leadId"`).select('e.id', 'e.estimateNumber', 'e.revision', 'e.version', 'e.name', 'd.outcome', 's.content', 's.contentHash', trx.raw(`d.id AS "decisionId", d."estimateVersion" AS "decisionVersion",
        s.id AS "snapshotId", d."snapshotId" AS "decisionSnapshotId",
        d."snapshotTotalCents"::text AS "snapshotTotalCents", e."acceptedTotalCents"::text AS "acceptedTotalCents",
        to_char(d."decisionDate",'YYYY-MM-DD') AS "acceptedDate",
        to_char(LEAST(s."createdAt", e."sentAt", e."publishedAt") AT TIME ZONE ?, 'YYYY-MM-DD') AS "issuedDate",
        paths."pathCount", paths."leadId", attributed.source, attributed.name AS "leadName"`, [
        timezone
    ]));
}
const rowSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    estimateNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    revision: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1),
    decisionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    decisionVersion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    outcome: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('accepted'),
    snapshotId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    decisionSnapshotId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown(),
    contentHash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    snapshotTotalCents: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    acceptedTotalCents: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    acceptedDate: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"],
    issuedDate: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"],
    pathCount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    leadId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    source: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"]).nullable(),
    leadName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable()
});
function sourceEstimateEvidence(raw, workspaceId, today) {
    const row = rowSchema.parse(raw);
    if (row.decisionVersion > row.version || row.snapshotId !== row.decisionSnapshotId || row.acceptedDate > today || row.acceptedDate < row.issuedDate || row.pathCount === 1 && (row.source === null || !row.leadName?.trim())) {
        throw new Error('Source-cohort accepted Estimate decision or linkage is inconsistent.');
    }
    const number = `EST-${String(row.estimateNumber).padStart(4, '0')}`;
    const money = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportFrozenMoney"])(row.content, row.contentHash, number, row.revision, {
        total: row.snapshotTotalCents,
        acceptedTotal: row.acceptedTotalCents
    });
    if (money.kind === 'unavailable') return {
        money
    };
    const source = row.pathCount === 1 ? row.source : null;
    const evidence = {
        familyId: `${workspaceId}:${number}`,
        recordId: row.id,
        estimateNumber: number,
        revision: row.revision,
        decisionVersion: row.decisionVersion,
        label: row.name,
        acceptedDate: row.acceptedDate,
        preTaxCents: money.preTaxCents,
        source,
        ...source === null ? {} : {
            linkedLead: {
                recordId: row.leadId,
                label: row.leadName
            }
        }
    };
    return {
        money,
        evidence
    };
}
}),
"[project]/packages/data/src/reports/lead-source.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readLeadSourceReportInTransaction",
    ()=>readLeadSourceReportInTransaction,
    "sourceJobNumberLabelExpression",
    ()=>sourceJobNumberLabelExpression,
    "sourceLeadCohortQuery",
    ()=>sourceLeadCohortQuery,
    "sourceLeadNumberLabelExpression",
    ()=>sourceLeadNumberLabelExpression
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/query.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$source$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/source-estimates.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
function sourceLeadCohortQuery(trx, auth, period) {
    return auth.scoped.clone().modify((records)=>{
        if (auth.archiveVisibility === 'excluded') records.whereNull('l.archivedAt');
    }).whereRaw(`l."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND
      l."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`, [
        period.from,
        auth.timezone,
        period.to,
        auth.timezone
    ]).select('l.id', 'l.name', 'l.leadNumber', 'l.source', 'l.createdAt', 'l.archivedAt');
}
function sourceLeadNumberLabelExpression() {
    return `'L-' || CASE WHEN length(l."leadNumber"::text) < 4
    THEN lpad(l."leadNumber"::text, 4, '0') ELSE l."leadNumber"::text END`;
}
function sourceJobNumberLabelExpression() {
    return `'J-' || CASE WHEN length(j."jobNumber"::text) < 4
    THEN lpad(j."jobNumber"::text, 4, '0') ELSE j."jobNumber"::text END`;
}
async function readLeadSourceReportInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportContext"])(trx, context);
    if (query.period.to > auth.today) throw new RangeError('Choose a source-cohort period ending no later than business-local today.');
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const jobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    const conversionAvailable = report.allowed && report.scope === 'workspace' && auth.scope === 'workspace' && auth.archiveVisibility === 'included' && report.sourceScopes?.job === 'workspace' && jobs.allowed && jobs.scope === 'workspace';
    if (query.selected === 'converted' && !conversionAvailable) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const estimateAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read');
    const estimateAuth = conversionAvailable && estimateAccess.allowed && estimateAccess.scope === 'workspace' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context) : undefined;
    const moneyAvailable = estimateAuth !== undefined && !estimateAuth.assigned && estimateAuth.includeArchived;
    if (query.selected === 'accepted-estimates' && !moneyAvailable) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const cohort = sourceLeadCohortQuery(trx, auth, query.period).toSQL();
    // Never query hidden supporting links when the complete cross-domain projection is unavailable.
    const supporting = conversionAvailable ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedJobQuery"])(trx, context).query.whereIn('j.sourceLeadId', trx.select('id').from('cohort')).select('j.id', 'j.sourceLeadId', 'j.jobNumber').toSQL() : undefined;
    const accepted = moneyAvailable ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$source$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceAcceptedEstimatesQuery"])(trx, estimateAuth.query, auth.timezone).toSQL() : undefined;
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
         'archived', l."archivedAt" IS NOT NULL) ${query.selected === 'converted' ? `|| jsonb_build_object('linkedJobs', (SELECT string_agg(${sourceJobNumberLabelExpression()},
         ', ' ORDER BY j."jobNumber", j.id) FROM conversionJobs j WHERE j."sourceLeadId" = l.id))` : ''}
         ORDER BY l."createdAt", l.id) FROM pageRows l), '[]'::jsonb) AS rows,
       paging.total::text, paging.page FROM paging)
     ${accepted ? `, accepted AS MATERIALIZED (${accepted.sql})` : ''}
     SELECT projection.*, ${accepted ? 'to_jsonb(a)' : 'NULL::jsonb'} AS estimate
     FROM projection ${accepted ? 'LEFT JOIN accepted a ON TRUE ORDER BY a."acceptedDate" DESC, a.id' : ''}`;
    const bindings = [
        ...cohort.bindings,
        ...supporting?.bindings ?? [],
        [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"]
        ],
        query.page,
        query.pageSize,
        query.pageSize,
        query.pageSize,
        [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"]
        ],
        auth.timezone,
        ...accepted?.bindings ?? []
    ];
    let projection;
    const cursor = `source_value_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
    let value = moneyAvailable ? {
        kind: 'available',
        preTaxCents: 0,
        estimateCount: 0,
        unattributedPreTaxCents: 0,
        unattributedCount: 0
    } : {
        kind: 'unavailable',
        reason: 'permissions',
        explanation: 'Source estimate value requires complete workspace Lead, Job and Estimate access, including Lead and Estimate archives. No hidden estimate links were inspected.'
    };
    const sourceValues = new Map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"].map((source)=>[
            source,
            {
                count: 0,
                cents: 0
            }
        ]));
    const requested = [];
    let final = [], estimateCount = 0;
    const offset = (query.page - 1) * query.pageSize;
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [
        cursor,
        ...bindings
    ]);
    try {
        let batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
            cursor
        ]);
        while(batch.rows.length){
            for (const row of batch.rows){
                projection ??= row;
                if (row.estimate === null) continue;
                const item = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$source$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceEstimateEvidence"])(row.estimate, context.workspaceId, auth.today);
                estimateCount++;
                if (!Number.isSafeInteger(estimateCount)) throw new RangeError('Source accepted-family count exceeds the safe integer range.');
                if (item.money.kind === 'unavailable') {
                    value = {
                        kind: 'unavailable',
                        reason: 'invalid-money',
                        explanation: item.money.explanation
                    };
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
                        const group = sourceValues.get(evidence.source);
                        group.count++;
                        group.cents += evidence.preTaxCents;
                    }
                    if (![
                        value.preTaxCents,
                        value.unattributedPreTaxCents
                    ].every(Number.isSafeInteger)) {
                        value = {
                            kind: 'unavailable',
                            reason: 'invalid-money',
                            explanation: 'Source accepted value exceeds the safe integer range.'
                        };
                    }
                }
                if ((estimateCount - 1) % query.pageSize === 0) final = [];
                final.push(evidence);
                if (estimateCount > offset && estimateCount <= offset + query.pageSize) requested.push(evidence);
            }
            batch = await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ]);
        }
    } finally{
        await trx.raw('CLOSE ??', [
            cursor
        ]);
    }
    if (!projection) throw new Error('The database returned no lead-source cohort projection.');
    if (query.selected === 'accepted-estimates' && value.kind === 'unavailable') {
        throw new Error(`Accepted source-estimate evidence is unavailable: ${value.explanation}`);
    }
    const selectedMoney = query.selected === 'accepted-estimates';
    const page = selectedMoney ? Math.min(query.page, Math.max(1, Math.ceil(estimateCount / query.pageSize))) : projection.page;
    const groups = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceResultSchema"].shape.groups.parse(projection.groups);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceResultSchema"].parse({
        workspaceId: context.workspaceId,
        view: 'lead-source',
        from: query.period.from,
        to: query.period.to,
        today: auth.today,
        timezone: auth.timezone,
        asOf: auth.asOf.toISOString(),
        scope: auth.scope,
        archiveVisibility: auth.archiveVisibility,
        scopeLabel: `${auth.scopeLabel} Grouped by current editable source, not immutable acquisition provenance. Conversion is current as of this snapshot.`,
        cohort: Number(projection.cohort),
        conversion: conversionAvailable ? {
            kind: 'available',
            converted: Number(projection.converted)
        } : {
            kind: 'unavailable',
            explanation: 'Conversion requires complete workspace Reports, Lead and Job access, including archived Leads. No hidden supporting links were inspected.'
        },
        acceptedValue: value,
        groups: groups.map((group)=>({
                ...group,
                acceptedEstimateCount: value.kind === 'available' ? sourceValues.get(group.source).count : null,
                acceptedValueCents: value.kind === 'available' ? sourceValues.get(group.source).cents : null
            })),
        evidence: {
            kind: query.selected,
            rows: selectedMoney ? page === query.page ? requested : final : projection.rows
        },
        evidenceTotal: selectedMoney ? estimateCount : Number(projection.total),
        page,
        pageSize: query.pageSize
    });
}
}),
"[project]/packages/data/src/reports/lead-source-export-access.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canExportLeadSourceDataset",
    ()=>canExportLeadSourceDataset,
    "resolveLeadSourceExportAccess",
    ()=>resolveLeadSourceExportAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/leads/export-access.ts [instrumentation] (ecmascript)");
;
;
function workspaceCollection(context, permission) {
    const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, permission);
    return access.allowed && access.resourceKind === (permission.startsWith('jobs.') ? 'job' : 'estimate') && access.scope === 'workspace';
}
function resolveLeadSourceExportAccess(context) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.export'
    }).allowed) return null;
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    const leadScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$leads$2f$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveExportScope"])(context);
    if (!report.allowed || report.resourceKind !== 'report' || !report.sourceScopes?.lead || !leadScope) return null;
    const effectiveLeadScope = report.scope === 'assigned' || report.sourceScopes.lead === 'assigned' || leadScope === 'assigned' ? 'assigned' : 'workspace';
    const leadArchiveVisibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'leads.archive',
        resource: {
            kind: 'lead',
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            ownerId: null
        }
    }).allowed ? 'included' : 'excluded';
    const conversionAllowed = effectiveLeadScope === 'workspace' && report.scope === 'workspace' && report.sourceScopes.lead === 'workspace' && report.sourceScopes.job === 'workspace' && leadArchiveVisibility === 'included' && workspaceCollection(context, 'jobs.read') && workspaceCollection(context, 'jobs.export');
    const acceptedValueAllowed = conversionAllowed && leadArchiveVisibility === 'included' && workspaceCollection(context, 'estimates.read') && workspaceCollection(context, 'estimates.export') && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'estimates.archive',
        resource: {
            kind: 'estimate',
            id: context.workspaceId,
            workspaceId: context.workspaceId,
            job: null
        }
    }).allowed;
    return {
        leadScope: effectiveLeadScope,
        leadArchiveVisibility,
        conversion: conversionAllowed ? {
            kind: 'available',
            scope: 'workspace'
        } : {
            kind: 'unavailable',
            reason: 'permissions'
        },
        acceptedValue: acceptedValueAllowed ? {
            kind: 'available',
            scope: 'workspace'
        } : {
            kind: 'unavailable',
            reason: 'permissions'
        }
    };
}
function canExportLeadSourceDataset(access, dataset) {
    return dataset === 'source-groups' || dataset === 'cohort' || dataset === 'converted' && access.conversion.kind === 'available' || dataset === 'accepted-estimates' && access.acceptedValue.kind === 'available';
}
}),
"[project]/packages/data/src/reports/lead-source-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialLeadSourceReportWithAuthorityInTransaction",
    ()=>initialLeadSourceReportWithAuthorityInTransaction,
    "readLeadSourceReportWithAuthorityInTransaction",
    ()=>readLeadSourceReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
;
;
;
;
;
async function readLeadSourceReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceQuerySchema"].parse(rawQuery);
    const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadSourceReportInTransaction"])(trx, context, query);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope: report.scope,
        archiveVisibility: report.archiveVisibility,
        query,
        report,
        canReadConversion: report.conversion.kind === 'available',
        canReadAcceptedValue: report.acceptedValue.kind === 'available' || report.acceptedValue.reason === 'invalid-money',
        canExport: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveLeadSourceExportAccess"])(context) !== null
    });
}
async function initialLeadSourceReportWithAuthorityInTransaction(trx, context) {
    const { today } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportContext"])(trx, context);
    return readLeadSourceReportWithAuthorityInTransaction(trx, context, {
        workspaceId: context.workspaceId,
        view: 'lead-source',
        period: {
            from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(today, -29),
            to: today
        },
        selected: 'cohort',
        page: 1,
        pageSize: 25
    });
}
}),
"[project]/packages/data/src/reports/activity-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialActivityReportWithAuthorityInTransaction",
    ()=>initialActivityReportWithAuthorityInTransaction,
    "readActivityReportWithAuthorityInTransaction",
    ()=>readActivityReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
async function readActivityReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportQuerySchema"].parse(rawQuery);
    const authority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (query.workspaceId !== context.workspaceId || !authority.allowed || authority.resourceKind !== 'report') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readActivityReportInTransaction"])(trx, context, query);
    const scopes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveActivityReportExportScopes"])(context);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        authority: {
            scope: authority.scope
        },
        exportScopes: report.includedDomains.flatMap((item)=>{
            const scope = scopes[item.domain];
            return scope ? [
                {
                    domain: item.domain,
                    scope
                }
            ] : [];
        }),
        query,
        report
    });
}
async function initialActivityReportWithAuthorityInTransaction(trx, context) {
    const authority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (!authority.allowed || authority.resourceKind !== 'report') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.today !== 'string') throw new Error('The workspace Activity clock is unavailable.');
    return readActivityReportWithAuthorityInTransaction(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportQuerySchema"].parse({
        workspaceId: context.workspaceId,
        view: 'activity',
        period: {
            from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(clock.today, -29),
            to: clock.today
        },
        filters: {
            domains: [],
            actions: [],
            actors: []
        },
        page: 1,
        pageSize: 25
    }));
}
}),
"[project]/packages/data/src/reports/financial-estimates.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readFinancialEstimatesReportInTransaction",
    ()=>readFinancialEstimatesReportInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-estimates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-decisions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-current.ts [instrumentation] (ecmascript)");
;
;
;
;
;
async function readFinancialEstimatesReportInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialEstimatesQuerySchema"].parse(rawQuery);
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (query.workspaceId !== context.workspaceId || !report.allowed || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.financial.read'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.today !== 'string') throw new Error('The workspace Financial date is unavailable.');
    if (query.period.to > clock.today) throw new RangeError('Financial commitment periods cannot extend beyond business-local today.');
    const base = {
        workspaceId: query.workspaceId,
        view: 'financial-estimates',
        from: query.period.from,
        to: query.period.to,
        selected: query.selected
    };
    const estimates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read');
    const assigned = report.scope === 'assigned' || estimates.allowed && estimates.scope === 'assigned_job';
    if (!estimates.allowed || assigned && !report.sourceScopes?.job) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialEstimatesResultSchema"].parse({
            ...base,
            estimates: {
                kind: 'unavailable',
                reason: 'permissions',
                explanation: 'Current Estimate read and applicable assigned Job authority are required; commitments and evidence are withheld.'
            }
        });
    }
    const common = {
        workspaceId: query.workspaceId,
        filters: query.filters,
        page: query.page,
        pageSize: query.pageSize
    };
    const section = query.selected === 'accepted' ? {
        kind: 'accepted',
        report: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateDecisionsReportInTransaction"])(trx, context, {
            ...common,
            view: 'estimate-decisions',
            period: query.period,
            selected: 'accepted'
        })
    } : {
        kind: 'awaiting',
        report: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateCurrentReportInTransaction"])(trx, context, {
            ...common,
            view: 'estimate-current',
            selected: 'awaiting'
        })
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialEstimatesResultSchema"].parse({
        ...base,
        estimates: section
    });
}
}),
"[project]/packages/data/src/reports/financial-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialFinancialReportWithAuthorityInTransaction",
    ()=>initialFinancialReportWithAuthorityInTransaction,
    "readFinancialReportWithAuthorityInTransaction",
    ()=>readFinancialReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-estimates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-materials.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-export-access.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function financialAuthority(context) {
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (!report.allowed || report.resourceKind !== 'report' || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'reports.financial.read'
    }).allowed) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return report;
}
async function readFinancialReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportQuerySchema"].parse(rawQuery), authority = financialAuthority(context);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const requests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportNativeQueries"])(query);
    const accepted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFinancialEstimatesReportInTransaction"])(trx, context, requests.accepted);
    const awaiting = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFinancialEstimatesReportInTransaction"])(trx, context, requests.awaiting);
    const materials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$materials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFinancialMaterialsReportInTransaction"])(trx, context, requests.materials);
    const orders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    const jobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read');
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        today: materials.today,
        timezone: materials.timezone,
        query,
        reports: {
            accepted,
            awaiting,
            materials
        },
        exportAccess: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFinancialReportExportAccess"])(context),
        authority: {
            scope: authority.scope,
            financial: true,
            estimates: accepted.estimates.kind === 'accepted' ? {
                scope: accepted.estimates.report.scope,
                archives: accepted.estimates.report.archiveVisibility,
                money: true
            } : null,
            materials: {
                scope: materials.scope,
                read: orders.allowed,
                costs: materials.costs.kind === 'available',
                jobLabels: jobs.allowed && !!authority.sourceScopes?.job
            }
        }
    });
}
async function initialFinancialReportWithAuthorityInTransaction(trx, context) {
    financialAuthority(context);
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.today !== 'string') throw new Error('The workspace Financial clock is unavailable.');
    return readFinancialReportWithAuthorityInTransaction(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportQuerySchema"].parse({
        workspaceId: context.workspaceId,
        view: 'financial',
        period: {
            from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(clock.today, -29),
            to: clock.today
        },
        selected: 'accepted',
        page: 1,
        pageSize: 25
    }));
}
}),
"[project]/packages/data/src/reports/business-overview.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "businessOverviewContext",
    ()=>businessOverviewContext,
    "readBusinessOverviewInTransaction",
    ()=>readBusinessOverviewInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-lifecycle.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-completion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/jobs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-decisions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-current.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-scheduled.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const unavailable = (domain)=>({
        kind: 'unavailable',
        reason: 'permissions',
        explanation: `${domain} metrics and evidence are unavailable under current Reports and underlying record authority.`
    });
const stamp = (result)=>({
        asOf: result.asOf,
        scopeLabel: result.scopeLabel
    });
async function businessOverviewContext(trx, context) {
    const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read');
    if (!report.allowed || ![
        'workspace',
        'assigned'
    ].includes(report.scope)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const clock = await trx('workspaces').where({
        id: context.workspaceId
    }).select('timezone', trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof clock?.today !== 'string' || typeof clock.timezone !== 'string') throw new Error('The workspace Overview clock is unavailable.');
    return {
        report,
        clock
    };
}
async function readBusinessOverviewInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewQuerySchema"].parse(rawQuery);
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { report, clock } = await businessOverviewContext(trx, context);
    if (query.period.to > clock.today) throw new RangeError('Overview periods cannot extend beyond business-local today.');
    const common = {
        workspaceId: query.workspaceId,
        page: 1,
        pageSize: 25
    };
    let leads = unavailable('Lead');
    if (report.sourceScopes?.lead) {
        const filters = {
            stages: [],
            owners: [],
            sources: []
        };
        const intake = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadReportInTransaction"])(trx, context, {
            ...common,
            view: 'intake',
            period: query.period,
            filters,
            currentFilters: filters
        });
        const pipeline = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadReportInTransaction"])(trx, context, {
            ...common,
            view: 'pipeline',
            filters,
            selection: {
                kind: 'pipeline'
            }
        });
        const attention = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadReportInTransaction"])(trx, context, {
            ...common,
            view: 'attention',
            filters,
            selection: 'inactive'
        });
        if (intake.view !== 'intake' || pipeline.view !== 'pipeline' || attention.view !== 'attention') throw new Error('Unexpected native Lead Overview projection.');
        leads = {
            kind: 'available',
            scope: report.sourceScopes.lead,
            archiveVisibility: intake.archiveVisibility,
            reads: {
                intake: stamp(intake),
                pipeline: stamp(pipeline),
                attention: stamp(attention)
            },
            created: intake.total,
            stages: pipeline.stages,
            inactive: attention.counts.inactive
        };
    }
    let jobs = unavailable('Job');
    if (report.sourceScopes?.job) {
        const filters = {
            statuses: [],
            owners: [],
            services: []
        };
        const created = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobLifecycleReportInTransaction"])(trx, context, {
            ...common,
            view: 'lifecycle',
            period: query.period,
            filters,
            selectedView: 'created'
        });
        const completion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobCompletionReportInTransaction"])(trx, context, {
            ...common,
            view: 'completion',
            period: query.period,
            filters
        });
        const workload = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobWorkloadReportInTransaction"])(trx, context, {
            ...common,
            view: 'workload',
            filters,
            selection: {
                kind: 'metric',
                metric: 'active'
            }
        });
        jobs = {
            kind: 'available',
            scope: report.sourceScopes.job,
            reads: {
                created: stamp(created),
                completion: stamp(completion),
                workload: stamp(workload)
            },
            created: created.counts.created,
            completed: completion.total,
            active: workload.counts.active,
            overdue: workload.counts.overdue,
            waiting: workload.counts.waiting
        };
    }
    let estimates = unavailable('Estimate');
    const estimateAuthority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'estimates.read');
    const assignedEstimates = report.scope === 'assigned' || estimateAuthority.allowed && estimateAuthority.scope === 'assigned_job';
    if (estimateAuthority.allowed && (!assignedEstimates || report.sourceScopes?.job)) {
        const filters = {
            owners: [],
            parents: []
        };
        const accepted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateDecisionsReportInTransaction"])(trx, context, {
            ...common,
            view: 'estimate-decisions',
            period: query.period,
            filters,
            selected: 'accepted'
        });
        const awaiting = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateCurrentReportInTransaction"])(trx, context, {
            ...common,
            view: 'estimate-current',
            filters,
            selected: 'awaiting'
        });
        estimates = {
            kind: 'available',
            scope: accepted.scope,
            archiveVisibility: accepted.archiveVisibility,
            reads: {
                accepted: stamp(accepted),
                awaiting: stamp(awaiting)
            },
            accepted: accepted.counts.accepted,
            acceptedMoney: accepted.money,
            awaiting: awaiting.counts.awaiting
        };
    }
    let calendar = unavailable('Calendar');
    const calendarAuthority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'calendar.read');
    const jobAuthority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'jobs.read'), orderAuthority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'workorders.read');
    if (calendarAuthority.allowed && (jobAuthority.allowed || orderAuthority.allowed)) {
        const scheduled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarScheduledReportInTransaction"])(trx, context, {
            ...common,
            view: 'calendar-scheduled',
            period: {
                from: clock.today,
                to: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(clock.today, 6)
            },
            selected: 'visits',
            filters: {
                participants: [],
                recordTypes: []
            }
        });
        calendar = {
            kind: 'available',
            scope: scheduled.scope,
            read: stamp(scheduled),
            from: scheduled.from,
            to: scheduled.to,
            visits: scheduled.counts.visits
        };
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewResultSchema"].parse({
        workspaceId: query.workspaceId,
        view: query.view,
        ...query.period,
        today: clock.today,
        timezone: clock.timezone,
        reportScope: report.scope,
        leads,
        jobs,
        estimates,
        calendar
    });
}
}),
"[project]/packages/data/src/reports/business-overview-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialBusinessOverviewWithAuthorityInTransaction",
    ()=>initialBusinessOverviewWithAuthorityInTransaction,
    "readBusinessOverviewWithAuthorityInTransaction",
    ()=>readBusinessOverviewWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/business-overview.ts [instrumentation] (ecmascript)");
;
;
;
async function readBusinessOverviewWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewQuerySchema"].parse(rawQuery);
    const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readBusinessOverviewInTransaction"])(trx, context, query);
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        query,
        report,
        authority: {
            reportScope: report.reportScope,
            lead: report.leads.kind === 'available' ? {
                scope: report.leads.scope,
                archives: report.leads.archiveVisibility
            } : null,
            job: report.jobs.kind === 'available' ? {
                scope: report.jobs.scope
            } : null,
            estimate: report.estimates.kind === 'available' ? {
                scope: report.estimates.scope,
                archives: report.estimates.archiveVisibility
            } : null,
            calendar: report.calendar.kind === 'available' ? report.calendar.scope : null
        }
    });
}
async function initialBusinessOverviewWithAuthorityInTransaction(trx, context) {
    const { clock } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewContext"])(trx, context);
    return readBusinessOverviewWithAuthorityInTransaction(trx, context, {
        workspaceId: context.workspaceId,
        view: 'business-overview',
        period: {
            from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(clock.today, -29),
            to: clock.today
        }
    });
}
}),
"[project]/packages/data/src/reports/lead-read.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readLeadReportWithAuthorityInTransaction",
    ()=>readLeadReportWithAuthorityInTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export-access.ts [instrumentation] (ecmascript)");
;
;
;
const stageLabels = {
    new: 'New',
    contacted: 'Contacted',
    'estimate-sent': 'Estimate sent',
    won: 'Won',
    lost: 'Lost'
};
const sourceLabels = {
    website: 'Website',
    referral: 'Referral',
    phone: 'Phone',
    gmail: 'Gmail',
    other: 'Other'
};
async function readLeadReportWithAuthorityInTransaction(trx, context, rawQuery) {
    const query = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportQuerySchema"].parse(rawQuery);
    const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadReportInTransaction"])(trx, context, query);
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportContext"])(trx, context);
    const owners = [
        {
            value: 'me',
            label: 'Me'
        },
        {
            value: 'unassigned',
            label: 'No current primary owner'
        }
    ];
    if (auth.scope === 'workspace') {
        const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').orderBy('u.name').orderBy('u.id').select('u.id', 'u.name as label');
        owners.push(...members.map((member)=>({
                value: member.id,
                label: member.label
            })));
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportReadResultSchema"].parse({
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        scope: auth.scope,
        exportScope: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveLeadReportExportScope"])(context),
        archiveVisibility: auth.archiveVisibility,
        query,
        report,
        options: {
            stages: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadStages"].map((value)=>({
                    value,
                    label: stageLabels[value]
                })),
            sources: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"].map((value)=>({
                    value,
                    label: sourceLabels[value]
                })),
            owners
        }
    });
}
}),
"[project]/packages/data/src/reports/lead-source-export-projection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareLeadSourceCSVProjectionInTransaction",
    ()=>prepareLeadSourceCSVProjectionInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/jobs/query.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-context.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$source$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/source-estimates.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const currency = 'USD';
const coverage = 'Current editable Lead source and business state as of the report snapshot.';
const cohortRowSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].uuid(),
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1),
    createdDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].iso.date(),
    source: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"]),
    archived: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    linkedJobNumbers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
}).strict();
function cohortRowsQuery(trx, context, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportContext"])(trx, context).then((auth)=>{
        const cohort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceLeadCohortQuery"])(trx, auth, input.query.period).toSQL();
        const conversion = input.dataset === 'converted';
        const jobs = conversion ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$jobs$2f$query$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scopedJobQuery"])(trx, context).query.whereIn('j.sourceLeadId', trx.select('id').from('cohort')).select('j.sourceLeadId').select(trx.raw(`string_agg(${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceJobNumberLabelExpression"])()},
        ', ' ORDER BY j."jobNumber", j.id) AS "linkedJobNumbers"`)).groupBy('j.sourceLeadId').toSQL() : undefined;
        return {
            sql: `WITH cohort AS MATERIALIZED (${cohort.sql})
        ${jobs ? `, linkedJobs AS MATERIALIZED (${jobs.sql})` : ''}
        SELECT l.id::text, ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceLeadNumberLabelExpression"])()} || ' / ' || l.name AS label,
          to_char(l."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "createdDate",
          l.source, l."archivedAt" IS NOT NULL AS archived
          ${jobs ? ', j."linkedJobNumbers"' : ''}
        FROM cohort l ${jobs ? 'JOIN linkedJobs j ON j."sourceLeadId" = l.id' : ''}
        ORDER BY l."createdAt", l.id`,
            bindings: [
                ...cohort.bindings,
                ...jobs?.bindings ?? [],
                auth.timezone
            ]
        };
    });
}
function acceptedRowsQuery(trx, context, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportContext"])(trx, context).then(async (auth)=>{
        const estimates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$context$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportContext"])(trx, context);
        if (estimates.assigned || !estimates.includeArchived) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const cohort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceLeadCohortQuery"])(trx, auth, input.query.period).toSQL();
        const accepted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$source$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceAcceptedEstimatesQuery"])(trx, estimates.query, auth.timezone).toSQL();
        return {
            sql: `WITH cohort AS MATERIALIZED (${cohort.sql}), accepted AS MATERIALIZED (${accepted.sql})
        SELECT * FROM accepted ORDER BY "acceptedDate" DESC, id`,
            bindings: [
                ...cohort.bindings,
                ...accepted.bindings
            ],
            today: auth.today
        };
    });
}
function safeCount(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError('Sources CSV row count exceeds the safe integer range.');
    }
    return value;
}
function sourceGroupRows(input, report, access) {
    const conversionAvailable = access.conversion.kind === 'available' && report.conversion.kind === 'available';
    const acceptedAvailable = access.acceptedValue.kind === 'available' && report.acceptedValue.kind === 'available';
    const conversionCoverage = conversionAvailable ? 'complete' : 'unavailable_permissions';
    const acceptedCoverage = acceptedAvailable ? 'complete' : report.acceptedValue.kind === 'unavailable' && report.acceptedValue.reason === 'invalid-money' ? 'invalid_money' : 'unavailable_permissions';
    const common = [
        'lead-source',
        input.dataset,
        'lead-creation-cohort',
        input.query.period.from,
        input.query.period.to,
        report.asOf,
        report.timezone,
        report.scope,
        report.archiveVisibility,
        coverage
    ];
    const rows = report.groups.map((group)=>[
            ...common,
            'source',
            group.source,
            group.cohort,
            conversionAvailable ? group.converted : null,
            conversionCoverage,
            acceptedAvailable ? group.acceptedEstimateCount : null,
            acceptedAvailable ? group.acceptedValueCents : null,
            acceptedAvailable ? currency : null,
            acceptedCoverage
        ]);
    if (acceptedAvailable && report.acceptedValue.kind === 'available') rows.push([
        ...common,
        'unattributed',
        null,
        null,
        null,
        conversionCoverage,
        report.acceptedValue.unattributedCount,
        report.acceptedValue.unattributedPreTaxCents,
        currency,
        acceptedCoverage
    ]);
    return rows;
}
async function prepareLeadSourceCSVProjectionInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceExportInputSchema"].parse(raw);
    if (input.query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const resolvedAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveLeadSourceExportAccess"])(context);
    if (!resolvedAccess || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["canExportLeadSourceDataset"])(resolvedAccess, input.dataset)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
    const access = resolvedAccess;
    const selected = input.dataset === 'converted' ? 'converted' : input.dataset === 'accepted-estimates' ? 'accepted-estimates' : 'cohort';
    const keepJobsRead = input.dataset === 'converted' || input.dataset === 'accepted-estimates' || input.dataset === 'source-groups' && access.conversion.kind === 'available';
    const keepEstimatesRead = input.dataset === 'accepted-estimates' || input.dataset === 'source-groups' && access.acceptedValue.kind === 'available';
    const reportContext = {
        ...context,
        enabledPermissions: context.enabledPermissions.filter((permission)=>(keepJobsRead || permission !== 'jobs.read') && (keepEstimatesRead || permission !== 'estimates.read'))
    };
    const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadSourceReportInTransaction"])(trx, reportContext, {
        ...input.query,
        selected,
        page: 1,
        pageSize: 100
    });
    const projectConversion = input.dataset === 'converted' || input.dataset === 'accepted-estimates' || input.dataset === 'source-groups' && access.conversion.kind === 'available';
    if (projectConversion && access.conversion.kind === 'available' && report.conversion.kind !== 'available') {
        throw new Error('The Sources export conversion authority and native projection disagree.');
    }
    const projectAcceptedValue = input.dataset === 'accepted-estimates' || input.dataset === 'source-groups' && access.acceptedValue.kind === 'available';
    if (projectAcceptedValue && access.acceptedValue.kind === 'available' && report.acceptedValue.kind === 'unavailable' && report.acceptedValue.reason === 'permissions') {
        throw new Error('The Sources export accepted-value authority and native projection disagree.');
    }
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceExportColumns"])(input);
    const count = input.dataset === 'source-groups' ? safeCount(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSources"].length + Number(access.acceptedValue.kind === 'available' && report.acceptedValue.kind === 'available')) : input.dataset === 'cohort' ? report.cohort : input.dataset === 'converted' ? report.conversion.kind === 'available' ? report.conversion.converted : 0 : report.acceptedValue.kind === 'available' ? report.acceptedValue.estimateCount : 0;
    const acceptedValue = report.acceptedValue.kind === 'unavailable' && report.acceptedValue.reason === 'invalid-money' ? {
        kind: 'unavailable',
        reason: 'invalid-money'
    } : access.acceptedValue;
    const conversion = access.conversion;
    const common = [
        'lead-source',
        input.dataset,
        'lead-creation-cohort',
        input.query.period.from,
        input.query.period.to,
        report.asOf,
        report.timezone,
        access.leadScope,
        access.leadArchiveVisibility,
        coverage
    ];
    async function* rows(signal) {
        signal?.throwIfAborted();
        if (input.dataset === 'source-groups') {
            for (const row of sourceGroupRows(input, report, access)){
                signal?.throwIfAborted();
                yield row;
            }
            return;
        }
        const cursor = `source_export_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll('-', '')}`;
        let projection;
        let today = report.today;
        if (input.dataset === 'accepted-estimates') {
            const accepted = await acceptedRowsQuery(trx, context, input);
            projection = accepted;
            today = accepted.today;
        } else {
            projection = await cohortRowsQuery(trx, context, input);
        }
        await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${projection.sql}`, [
            cursor,
            ...projection.bindings
        ]);
        let emitted = 0;
        try {
            let batch = (await trx.raw('FETCH FORWARD 100 FROM ??', [
                cursor
            ])).rows;
            while(batch.length){
                for (const rawRow of batch){
                    signal?.throwIfAborted();
                    if (input.dataset === 'accepted-estimates') {
                        const item = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$source$2d$estimates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sourceEstimateEvidence"])(rawRow, context.workspaceId, today);
                        if (item.money.kind === 'unavailable' || !item.evidence) {
                            throw new Error('Accepted source-Estimate evidence failed frozen-money verification.');
                        }
                        const evidence = item.evidence;
                        emitted++;
                        if (emitted > count) throw new Error('The Sources CSV population changed during generation.');
                        yield [
                            ...common,
                            evidence.estimateNumber,
                            evidence.revision,
                            evidence.decisionVersion,
                            evidence.label,
                            evidence.acceptedDate,
                            evidence.preTaxCents,
                            currency,
                            evidence.source,
                            evidence.linkedLead?.recordId ?? null,
                            evidence.linkedLead?.label ?? null,
                            evidence.source === null ? 'unattributed' : 'attributed'
                        ];
                    } else {
                        const row = cohortRowSchema.parse(rawRow);
                        emitted++;
                        if (emitted > count) throw new Error('The Sources CSV population changed during generation.');
                        yield [
                            ...common,
                            row.id,
                            row.label,
                            row.createdDate,
                            row.source,
                            String(row.archived),
                            ...input.dataset === 'converted' ? [
                                row.linkedJobNumbers ?? ''
                            ] : []
                        ];
                    }
                }
                signal?.throwIfAborted();
                batch = (await trx.raw('FETCH FORWARD 100 FROM ??', [
                    cursor
                ])).rows;
            }
            if (emitted !== count) throw new Error('The Sources CSV population changed during generation.');
        } finally{
            await trx.raw('CLOSE ??', [
                cursor
            ]);
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        leadScope: access.leadScope,
        leadArchiveVisibility: access.leadArchiveVisibility,
        conversion,
        acceptedValue,
        asOf: report.asOf,
        today: report.today,
        timezone: report.timezone,
        dateBasis: 'lead-creation-cohort',
        coverage,
        count,
        columns,
        rows
    };
}
}),
"[project]/packages/data/src/reports/lead-source-export.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLeadSourceCSVExport",
    ()=>createLeadSourceCSVExport,
    "previewLeadSourceExport",
    ()=>previewLeadSourceExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-export-projection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
function preview(projection, limits) {
    const { rows, ...metadata } = projection;
    void rows;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
function auditOutputScopes(projection) {
    return {
        lead: projection.leadScope,
        leadArchiveVisibility: projection.leadArchiveVisibility,
        conversion: projection.conversion,
        acceptedValue: projection.acceptedValue
    };
}
async function previewLeadSourceExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadSourceCSVProjectionInTransaction"])(trx, context, input), limits));
}
async function createLeadSourceCSVExport(db, identity, enabled, raw, requestSignal) {
    const input = validate(identity, raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'sources',
        label: 'Sources',
        dataset: input.dataset,
        selection: JSON.stringify({
            dataset: input.dataset,
            query: {
                view: input.query.view,
                period: input.query.period,
                selected: input.query.selected
            }
        }),
        prepare: async (trx, context, limits)=>{
            const projection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$export$2d$projection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadSourceCSVProjectionInTransaction"])(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: value.leadScope,
                outputScopes: JSON.stringify(auditOutputScopes(value))
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                leadScope: value.leadScope,
                leadArchiveVisibility: value.leadArchiveVisibility,
                conversion: value.conversion,
                acceptedValue: value.acceptedValue,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                dateBasis: value.dateBasis,
                count: value.count,
                limits: value.limits
            })
    }, requestSignal);
}
;
}),
"[project]/packages/data/src/reports/business-overview-export.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBusinessOverviewCSVExport",
    ()=>createBusinessOverviewCSVExport,
    "prepareBusinessOverviewExportInTransaction",
    ()=>prepareBusinessOverviewExportInTransaction,
    "previewBusinessOverviewExport",
    ()=>previewBusinessOverviewExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/business-overview.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-export-access.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-lifecycle.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-completion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/jobs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-decisions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-current.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-scheduled.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-export.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/report-export-stream.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
async function prepareBusinessOverviewExportInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewExportInputSchema"].parse(raw), { query } = input;
    if (query.workspaceId !== context.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const { report, clock } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewContext"])(trx, context);
    if (query.period.to > clock.today) throw new RangeError('Overview periods cannot extend beyond the workspace date.');
    const leadScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveLeadReportExportScope"])(context), jobScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveJobReportExportScope"])(context);
    const estimateAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEstimateReportExportAccess"])(context), calendarAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$export$2d$access$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCalendarExportAccess"])(context);
    if (!leadScope && !jobScope && !estimateAccess && !calendarAccess) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    const timestamp = await trx.raw('SELECT CURRENT_TIMESTAMP AS "asOf"');
    const asOf = new Date(timestamp.rows[0].asOf).toISOString();
    const scopes = {
        lead: null,
        job: jobScope,
        estimate: null,
        calendar: null
    };
    const rows = [];
    const add = (section, metric, value, status, basis, from, to, scope, coverage)=>rows.push([
            section,
            metric,
            value,
            status,
            basis,
            from,
            to,
            asOf,
            clock.timezone,
            scope,
            coverage
        ]);
    const omitted = (section)=>add(section, 'section', null, 'unavailable', 'not applicable', null, null, null, 'Section unavailable under current read and export authority.');
    const common = {
        workspaceId: query.workspaceId,
        page: 1,
        pageSize: 25
    };
    if (leadScope) {
        const filters = {
            stages: [],
            owners: [],
            sources: []
        };
        const intake = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadReportExportInTransaction"])(trx, context, {
            dataset: 'intake-days',
            query: {
                workspaceId: query.workspaceId,
                view: 'intake',
                period: query.period,
                filters,
                currentFilters: filters
            }
        })).report;
        const pipeline = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadReportExportInTransaction"])(trx, context, {
            dataset: 'pipeline-stages',
            query: {
                workspaceId: query.workspaceId,
                view: 'pipeline',
                filters,
                selection: {
                    kind: 'pipeline'
                }
            }
        })).report;
        const attention = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareLeadReportExportInTransaction"])(trx, context, {
            dataset: 'attention-categories',
            query: {
                workspaceId: query.workspaceId,
                view: 'attention',
                filters,
                selection: 'inactive'
            }
        })).report;
        if (intake.view !== 'intake' || pipeline.view !== 'pipeline' || attention.view !== 'attention') {
            throw new Error('Unexpected Overview Lead export projection.');
        }
        scopes.lead = {
            scope: leadScope,
            archives: intake.archiveVisibility
        };
        const coverage = `Authorized Leads; archived ${intake.archiveVisibility}.`;
        add('leads', 'created', intake.total, 'available', 'creation date', query.period.from, query.period.to, leadScope, coverage);
        for (const [stage, value] of Object.entries(pipeline.stages))add('leads', `open ${stage}`, value, 'available', 'current snapshot', null, null, leadScope, coverage);
        add('leads', 'inactive', attention.counts.inactive, 'available', 'current snapshot', null, null, leadScope, coverage);
    } else omitted('leads');
    if (jobScope) {
        const filters = {
            statuses: [],
            owners: [],
            services: []
        }, assigned = jobScope === 'assigned';
        const created = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$lifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobLifecycleReportInTransaction"])(trx, context, {
            ...common,
            view: 'lifecycle',
            period: query.period,
            filters,
            selectedView: 'created'
        }, assigned);
        const completion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$completion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobCompletionReportInTransaction"])(trx, context, {
            ...common,
            view: 'completion',
            period: query.period,
            filters
        }, assigned);
        const workload = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$jobs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobWorkloadReportInTransaction"])(trx, context, {
            ...common,
            view: 'workload',
            filters,
            selection: {
                kind: 'metric',
                metric: 'active'
            }
        }, assigned);
        const coverage = 'Current authorized Job scope, including archived Jobs; workload metrics may overlap.';
        add('jobs', 'created', created.counts.created, 'available', 'creation date', query.period.from, query.period.to, jobScope, coverage);
        add('jobs', 'completed', completion.total, 'available', 'completion date', query.period.from, query.period.to, jobScope, coverage);
        for (const metric of [
            'active',
            'overdue',
            'waiting'
        ])add('jobs', metric, workload.counts[metric], 'available', 'current snapshot', null, null, jobScope, coverage);
    } else omitted('jobs');
    if (estimateAccess) {
        const filters = {
            owners: [],
            parents: []
        }, assigned = estimateAccess.scope === 'assigned_job';
        const accepted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$decisions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateDecisionsReportInTransaction"])(trx, context, {
            ...common,
            view: 'estimate-decisions',
            period: query.period,
            filters,
            selected: 'accepted'
        }, assigned);
        const awaiting = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$current$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateCurrentReportInTransaction"])(trx, context, {
            ...common,
            view: 'estimate-current',
            filters,
            selected: 'awaiting'
        }, assigned, false);
        scopes.estimate = {
            scope: estimateAccess.scope,
            archives: accepted.archiveVisibility
        };
        const coverage = `Authorized issued Estimates; decision archives ${accepted.archiveVisibility}.`;
        add('estimates', 'accepted', accepted.counts.accepted, 'available', 'decision date', query.period.from, query.period.to, estimateAccess.scope, coverage);
        const preTax = accepted.money.kind === 'available' ? accepted.money.preTaxCents : null;
        add('estimates', 'accepted pre-tax cents', preTax, preTax === null ? 'unavailable' : 'available', 'decision date', query.period.from, query.period.to, estimateAccess.scope, coverage);
        add('estimates', 'awaiting', awaiting.counts.awaiting, 'available', 'current snapshot', null, null, estimateAccess.scope, coverage);
    } else omitted('estimates');
    if (calendarAccess) {
        const scheduled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarScheduledReportInTransaction"])(trx, context, {
            ...common,
            view: 'calendar-scheduled',
            period: {
                from: clock.today,
                to: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addCalendarDays"])(clock.today, 6)
            },
            selected: 'visits',
            filters: {
                participants: [],
                recordTypes: []
            }
        }, calendarAccess.outputScopes);
        if (scheduled.scope.kind !== calendarAccess.scope.kind) throw new Error('Overview Calendar export scope does not match.');
        const jobs = calendarAccess.outputScopes.jobs, orders = calendarAccess.outputScopes.workOrders;
        scopes.calendar = {
            scope: calendarAccess.scope.kind,
            jobs: jobs.kind === 'available' ? jobs.scope : null,
            workOrders: orders.kind === 'available' ? orders.scope : null
        };
        add('calendar', 'upcoming visits', scheduled.counts.visits, 'available', 'current scheduled date', scheduled.from, scheduled.to, scheduled.scope.kind, `Current visits; Jobs: ${jobs.kind === 'available' ? jobs.scope : 'unavailable'}; Work Orders: ${orders.kind === 'available' ? orders.scope : 'unavailable'}.`);
    } else omitted('calendar');
    const coverage = 'Summary only; sections and Calendar parent domains without export authority are explicitly unavailable. Current snapshots are not historical.';
    async function* generate(signal) {
        for (const row of rows){
            signal?.throwIfAborted();
            yield row;
        }
    }
    return {
        input,
        workspaceId: context.workspaceId,
        viewerId: context.userId,
        policyRevision: context.policy.revision,
        asOf,
        today: clock.today,
        timezone: clock.timezone,
        scopes,
        count: rows.length,
        columns: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewExportColumns"],
        coverage,
        scope: report.scope,
        rows: generate
    };
}
function preview(projection, limits) {
    const { rows, scope, ...metadata } = projection;
    void rows;
    void scope;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewExportPreviewSchema"].parse({
        ...metadata,
        limits
    });
}
function validate(identity, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewExportInputSchema"].parse(raw);
    if (identity.workspaceId !== input.query.workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return input;
}
async function previewBusinessOverviewExport(db, identity, enabled, raw) {
    const input = validate(identity, raw), limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportExportLimits"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withReportExportSnapshot"])(db, identity, enabled, AbortSignal.timeout(limits.durationMs), async (trx, context)=>preview(await prepareBusinessOverviewExportInTransaction(trx, context, input), limits));
}
async function createBusinessOverviewCSVExport(db, identity, enabled, raw, signal) {
    const input = validate(identity, raw);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$report$2d$export$2d$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createReportCSVStream"])(db, identity, enabled, {
        report: 'overview',
        label: 'Overview',
        dataset: 'summary',
        selection: JSON.stringify({
            period: input.query.period
        }),
        prepare: async (trx, context, limits)=>{
            const projection = await prepareBusinessOverviewExportInTransaction(trx, context, input);
            return {
                preview: preview(projection, limits),
                rows: projection.rows
            };
        },
        auditScopes: (value)=>({
                scope: Object.values(value.scopes).some((scope)=>typeof scope === 'string' ? scope === 'workspace' : scope && 'scope' in scope && scope.scope === 'workspace') ? 'workspace' : 'assigned',
                outputScopes: JSON.stringify(value.scopes)
            }),
        generation: (value, id)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewExportGenerationSchema"].parse({
                id,
                workspaceId: value.workspaceId,
                policyRevision: value.policyRevision,
                asOf: value.asOf,
                today: value.today,
                timezone: value.timezone,
                scopes: value.scopes,
                count: value.count,
                limits: value.limits
            })
    }, signal);
}
}),
"[project]/packages/data/src/reports/template.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReportTemplateConflictError",
    ()=>ReportTemplateConflictError,
    "createReportTemplateInTransaction",
    ()=>createReportTemplateInTransaction,
    "deleteReportTemplateInTransaction",
    ()=>deleteReportTemplateInTransaction,
    "listReportTemplatesInTransaction",
    ()=>listReportTemplatesInTransaction,
    "runReportTemplateConfigurationInTransaction",
    ()=>runReportTemplateConfigurationInTransaction,
    "runReportTemplateInTransaction",
    ()=>runReportTemplateInTransaction,
    "updateReportTemplateInTransaction",
    ()=>updateReportTemplateInTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$template$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/template.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/leads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/lead-source.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/job-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/team-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/financial-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/lead-source-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/business-overview-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/calendar-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/job-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/team-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/estimate-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/activity-read.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/reports/financial-read.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
class ReportTemplateConflictError extends Error {
    constructor(){
        super('The template changed or its name is already in use. Reload and try again.');
    }
}
function requireRead(context, workspaceId) {
    if (workspaceId !== context.workspaceId || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAuthorizedCollectionScope"])(context, 'reports.read').allowed) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    }
}
function parseRow(row) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$template$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportTemplateSchema"].parse({
        ...row,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt
    });
}
function owned(trx, context) {
    return trx('reportTemplates').where({
        workspaceId: context.workspaceId,
        ownerId: context.userId
    });
}
async function selected(trx, context, id) {
    const row = await owned(trx, context).where({
        id
    }).first('id', 'workspaceId', 'area', 'name', 'configuration', 'version', 'createdAt', 'updatedAt');
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
    return parseRow(row);
}
async function listReportTemplatesInTransaction(trx, context, area) {
    requireRead(context, context.workspaceId);
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$template$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportTemplateAreaSchema"].parse(area);
    const rows = await owned(trx, context).where({
        area: parsed
    }).orderBy('name').select('id', 'workspaceId', 'area', 'name', 'configuration', 'version', 'createdAt', 'updatedAt');
    return rows.map(parseRow);
}
async function resolveQuery(trx, context, raw) {
    const configuration = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$template$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportTemplateConfigurationSchema"].parse(raw);
    const workspace = await trx('workspaces').where({
        id: context.workspaceId
    }).select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    if (typeof workspace?.today !== 'string') throw new Error('The report template clock is unavailable.');
    const resolved = configuration.period && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(configuration.period, workspace.today, configuration.area === 'calendar' ? 'calendar' : 'history');
    if (resolved && !resolved.range) throw new RangeError('The template period is invalid.');
    const query = {
        ...configuration.query,
        workspaceId: context.workspaceId,
        ...configuration.area === 'overview' ? {} : {
            page: 1,
            pageSize: 25
        },
        ...resolved?.range ? {
            period: {
                from: resolved.range.from,
                to: resolved.range.to
            }
        } : {}
    };
    return {
        configuration,
        query
    };
}
async function runReportTemplateConfigurationInTransaction(trx, context, raw) {
    requireRead(context, context.workspaceId);
    const { configuration, query } = await resolveQuery(trx, context, raw);
    switch(configuration.area){
        case 'overview':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readBusinessOverviewWithAuthorityInTransaction"])(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["businessOverviewQuerySchema"].parse(query));
        case 'leads':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadReportWithAuthorityInTransaction"])(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$leads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadReportQuerySchema"].parse(query));
        case 'sources':
            {
                const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$lead$2d$source$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leadSourceQuerySchema"].parse(query);
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$lead$2d$source$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readLeadSourceReportWithAuthorityInTransaction"])(trx, context, parsed);
                if (parsed.selected === 'converted' && !result.canReadConversion || parsed.selected === 'accepted-estimates' && !result.canReadAcceptedValue) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                return result;
            }
        case 'calendar':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCalendarReportWithAuthorityInTransaction"])(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calendarReportQuerySchema"].parse(query));
        case 'jobs':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readJobReportWithAuthorityInTransaction"])(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$job$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jobReportQuerySchema"].parse(query));
        case 'team':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readTeamReportWithAuthorityInTransaction"])(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$team$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["teamReportQuerySchema"].parse(query));
        case 'estimates':
            {
                const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateReportQuerySchema"].parse(query);
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readEstimateReportWithAuthorityInTransaction"])(trx, context, parsed);
                if (parsed.view === 'estimate-current' && parsed.selected === 'handoff' && !result.authority.handoff) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                }
                return result;
            }
        case 'activity':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readActivityReportWithAuthorityInTransaction"])(trx, context, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["activityReportQuerySchema"].parse(query));
        case 'financial':
            {
                const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReportQuerySchema"].parse(query);
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$reports$2f$financial$2d$read$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFinancialReportWithAuthorityInTransaction"])(trx, context, parsed);
                if (parsed.selected === 'materials' ? result.reports.materials.costs.kind === 'unavailable' : result.reports[parsed.selected].estimates.kind === 'unavailable') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
                return result;
            }
    }
}
async function createReportTemplateInTransaction(trx, context, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$template$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportTemplateCreateSchema"].parse(raw);
    requireRead(context, input.workspaceId);
    await runReportTemplateConfigurationInTransaction(trx, context, input.configuration);
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    try {
        await trx('reportTemplates').insert({
            id,
            workspaceId: context.workspaceId,
            ownerId: context.userId,
            area: input.configuration.area,
            name: input.name,
            configuration: JSON.stringify(input.configuration)
        });
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') throw new ReportTemplateConflictError();
        throw error;
    }
    return selected(trx, context, id);
}
async function updateReportTemplateInTransaction(trx, context, id, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$template$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportTemplateUpdateSchema"].parse(raw);
    requireRead(context, input.workspaceId);
    const existing = await selected(trx, context, id);
    if (existing.version !== input.version) throw new ReportTemplateConflictError();
    if (input.configuration) {
        if (input.configuration.area !== existing.area) throw new RangeError('A template cannot change report area.');
        await runReportTemplateConfigurationInTransaction(trx, context, input.configuration);
    }
    try {
        const changed = await owned(trx, context).where({
            id,
            version: input.version
        }).update({
            ...input.name === undefined ? {} : {
                name: input.name
            },
            ...input.configuration === undefined ? {} : {
                configuration: JSON.stringify(input.configuration)
            },
            version: input.version + 1,
            updatedAt: trx.fn.now()
        });
        if (changed !== 1) throw new ReportTemplateConflictError();
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') throw new ReportTemplateConflictError();
        throw error;
    }
    return selected(trx, context, id);
}
async function deleteReportTemplateInTransaction(trx, context, id, raw) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$template$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportTemplateDeleteSchema"].parse(raw);
    requireRead(context, input.workspaceId);
    const existing = await selected(trx, context, id);
    if (existing.version !== input.version) throw new ReportTemplateConflictError();
    if (await owned(trx, context).where({
        id,
        version: input.version
    }).delete() !== 1) throw new ReportTemplateConflictError();
}
async function runReportTemplateInTransaction(trx, context, id) {
    requireRead(context, context.workspaceId);
    const template = await selected(trx, context, id);
    const result = await runReportTemplateConfigurationInTransaction(trx, context, template.configuration);
    return {
        template,
        result
    };
}
}),
];

//# sourceMappingURL=packages_data_src_reports_0f0f42l._.js.map