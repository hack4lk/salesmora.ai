module.exports = [
"[project]/apps/web/src/features/reports/activity-report/activity-report.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activityReportData",
    ()=>activityReportData
]);
const activityReportData = {
    title: 'CRM activity history',
    count: 'Authorized activity events',
    domainLabel: 'Record type',
    actionLabel: 'Action type',
    actorLabel: 'Actor',
    filtersHelp: 'Choose multiple values within a facet (OR); facets combine with AND. Empty selections mean every event in your current authorized scope.',
    ordering: 'Events are ordered newest first. Equal timestamps use a stable domain and event ID order.',
    detail: 'Summaries are safe descriptions of the event. Open the linked record for details; raw change payloads and private note content are not shown here.',
    denied: 'Your current access does not allow CRM activity reports.',
    invalid: 'CRM activity could not be displayed because the filters, authorized facets, event summaries or ordered evidence are inconsistent. Retry the report.',
    domains: {
        lead: 'Lead',
        customer: 'Customer',
        job: 'Job',
        estimate: 'Estimate',
        'work-order': 'Work Order'
    },
    actions: {
        created: 'Created',
        updated: 'Updated',
        archived: 'Archived',
        'stage-changed': 'Stage changed',
        'assignment-changed': 'Assignment changed',
        'status-changed': 'Status changed',
        'deadline-changed': 'Deadline changed',
        'visit-changed': 'Visit changed',
        sent: 'Sent',
        'decision-recorded': 'Decision recorded',
        completed: 'Completed'
    },
    noOptions: 'No currently authorized activity filters are available.'
};
}),
"[project]/apps/web/src/features/reports/activity-report/activity-report.validation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activityActions",
    ()=>activityActions,
    "activityDomains",
    ()=>activityDomains,
    "activityEventDateInTimezone",
    ()=>activityEventDateInTimezone,
    "activityEventKey",
    ()=>activityEventKey,
    "compareActivityEvents",
    ()=>compareActivityEvents,
    "validActivityFilterOptions",
    ()=>validActivityFilterOptions,
    "validActivityFilters",
    ()=>validActivityFilters,
    "validActivityReportResult",
    ()=>validActivityReportResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
;
const activityDomains = [
    'lead',
    'customer',
    'job',
    'estimate',
    'work-order'
];
const activityActions = [
    'created',
    'updated',
    'archived',
    'stage-changed',
    'assignment-changed',
    'status-changed',
    'deadline-changed',
    'visit-changed',
    'sent',
    'decision-recorded',
    'completed'
];
const domainActions = {
    lead: [
        'created',
        'updated',
        'archived',
        'stage-changed',
        'assignment-changed'
    ],
    customer: [
        'created',
        'updated',
        'archived'
    ],
    job: [
        'created',
        'updated',
        'archived',
        'assignment-changed',
        'status-changed',
        'deadline-changed',
        'visit-changed',
        'completed'
    ],
    estimate: [
        'created',
        'updated',
        'archived',
        'sent',
        'decision-recorded'
    ],
    'work-order': [
        'created',
        'updated',
        'archived',
        'assignment-changed',
        'status-changed',
        'visit-changed',
        'completed'
    ]
};
const dateOnly = (value)=>/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const nonnegative = (value)=>Number.isSafeInteger(value) && value >= 0;
const positive = (value)=>Number.isSafeInteger(value) && value > 0;
const safeText = (value, limit)=>value.trim() !== '' && value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const hasExactKeys = (value, keys)=>Object.keys(value).length === keys.length && keys.every((key)=>Object.hasOwn(value, key));
const isRecord = (value)=>typeof value === 'object' && value !== null && !Array.isArray(value);
const isActivityDomain = (value)=>activityDomains.some((domain)=>domain === value);
const isActivityAction = (value)=>activityActions.some((action)=>action === value);
const sameSelection = (left, right)=>left.length === right.length && [
        ...left
    ].sort().every((value, index)=>value === [
            ...right
        ].sort()[index]);
const optionList = (options, validValue)=>Array.isArray(options) && options.every((option)=>isRecord(option) && hasExactKeys(option, [
            'value',
            'label'
        ]) && typeof option.value === 'string' && typeof option.label === 'string' && safeText(option.value, 128) && safeText(option.label, 100) && validValue(option.value)) && new Set(options.map((option)=>option.value)).size === options.length;
function validActivityFilterOptions(options) {
    return isRecord(options) && hasExactKeys(options, [
        'domains',
        'actions',
        'actors'
    ]) && optionList(options.domains, (value)=>activityDomains.some((domain)=>domain === value)) && optionList(options.actions, (value)=>activityActions.some((action)=>action === value)) && optionList(options.actors, (value)=>value === 'system' || value.trim() !== '');
}
function validActivityFilters(value, options) {
    return isRecord(value) && hasExactKeys(value, [
        'domains',
        'actions',
        'actors'
    ]) && Array.isArray(value.domains) && Array.isArray(value.actions) && Array.isArray(value.actors) && validActivityFilterOptions(options) && value.domains.length <= activityDomains.length && new Set(value.domains).size === value.domains.length && value.domains.every((domain)=>options.domains.some((option)=>option.value === domain)) && value.actions.length <= activityActions.length && new Set(value.actions).size === value.actions.length && value.actions.every((action)=>options.actions.some((option)=>option.value === action)) && value.actors.length <= 50 && new Set(value.actors).size === value.actors.length && value.actors.every((actor)=>options.actors.some((option)=>option.value === actor));
}
function activityEventKey(event) {
    return `${event.domain}:${event.eventId}`;
}
function activityEventDateInTimezone(timestamp, timezone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date(timestamp));
    const part = (type)=>parts.find((value)=>value.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
}
function compareActivityEvents(left, right) {
    const seconds = (timestamp)=>Math.floor(Date.parse(timestamp) / 1000);
    const fraction = (timestamp)=>(/\.(\d+)/.exec(timestamp)?.[1] ?? '').padEnd(9, '0');
    const timeDifference = seconds(right.occurredAt) - seconds(left.occurredAt);
    if (timeDifference) return timeDifference;
    const leftFraction = fraction(left.occurredAt), rightFraction = fraction(right.occurredAt);
    if (leftFraction !== rightFraction) return leftFraction > rightFraction ? -1 : 1;
    const leftKey = activityEventKey(left), rightKey = activityEventKey(right);
    return leftKey === rightKey ? 0 : leftKey < rightKey ? -1 : 1;
}
function validActor(actor, options) {
    if (!isRecord(actor) || !hasExactKeys(actor, [
        'kind',
        'key',
        'label'
    ]) || typeof actor.kind !== 'string' || typeof actor.key !== 'string' || typeof actor.label !== 'string') return false;
    if (actor.kind === 'system') return actor.key === 'system' && actor.label === 'System' && options.actors.some((option)=>option.value === 'system' && option.label === 'System');
    return actor.kind === 'member' && actor.key.trim() !== '' && actor.key !== 'system' && safeText(actor.key, 128) && safeText(actor.label, 100) && options.actors.some((option)=>option.value === actor.key && option.label === actor.label);
}
function validEvent(event, options, result) {
    if (!isRecord(event) || !hasExactKeys(event, [
        'domain',
        'eventId',
        'occurredAt',
        'action',
        'actor',
        'recordId',
        'recordLabel'
    ]) || typeof event.eventId !== 'string' || typeof event.occurredAt !== 'string' || typeof event.recordId !== 'string' || typeof event.recordLabel !== 'string' || typeof event.action !== 'string' || !isRecord(event.actor) || !isActivityDomain(event.domain) || !isActivityAction(event.action) || !domainActions[event.domain].some((action)=>action === event.action) || !safeText(event.eventId, 128) || !safeText(event.recordId, 128) || !safeText(event.recordLabel, 160) || !Number.isFinite(Date.parse(event.occurredAt)) || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(event.occurredAt)) return false;
    const eventDate = activityEventDateInTimezone(event.occurredAt, result.timezone);
    if (!dateOnly(eventDate) || eventDate < result.from || eventDate > result.to || !validActor(event.actor, options)) return false;
    return (!result.filters.domains.length || result.filters.domains.includes(event.domain)) && (!result.filters.actions.length || result.filters.actions.includes(event.action)) && (!result.filters.actors.length || result.filters.actors.includes(event.actor.key));
}
function validActivityReportResult(result, period, filters, options, expectedToday, expectedTimezone) {
    if (!isRecord(result) || !Array.isArray(result.rows) || !hasExactKeys(result, [
        'from',
        'to',
        'today',
        'timezone',
        'periodLabel',
        'snapshotLabel',
        'scopeLabel',
        'filters',
        'total',
        'rows',
        'page',
        'pageSize'
    ]) || !isRecord(result.filters) || !hasExactKeys(result.filters, [
        'domains',
        'actions',
        'actors'
    ]) || typeof result.today !== 'string' || typeof result.timezone !== 'string' || typeof result.periodLabel !== 'string' || typeof result.snapshotLabel !== 'string' || typeof result.scopeLabel !== 'string') return false;
    const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, result.today, 'history');
    if (!range.range || result.today !== expectedToday || result.timezone !== expectedTimezone || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validReportTimezone"])(expectedTimezone) || ![
        result.periodLabel,
        result.snapshotLabel
    ].every((value)=>safeText(value, 200)) || !safeText(result.scopeLabel, 4000) || result.from !== range.range.from || result.to !== range.range.to || !validActivityFilters(filters, options) || !sameSelection(result.filters.domains, filters.domains) || !sameSelection(result.filters.actions, filters.actions) || !sameSelection(result.filters.actors, filters.actors) || !nonnegative(result.total) || !positive(result.page) || !positive(result.pageSize) || result.page > Math.max(1, Math.ceil(result.total / result.pageSize)) || result.rows.length !== Math.min(result.pageSize, Math.max(0, result.total - (result.page - 1) * result.pageSize)) || result.rows.some((event, index)=>!validEvent(event, options, result) || index > 0 && compareActivityEvents(result.rows[index - 1], event) > 0) || new Set(result.rows.map(activityEventKey)).size !== result.rows.length) return false;
    return true;
}
}),
"[project]/apps/web/src/features/reports/activity-report/activity-report.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityReport",
    ()=>ActivityReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/data-table/data-table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/help-tooltip/help-tooltip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$pagination$2f$pagination$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/pagination/pagination.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$facet$2d$filters$2f$report$2d$facet$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-facet-filters/report-facet-filters.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-result-state/report-result-state.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-summary/report-summary.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report.validation.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
const limit = {
    domains: 5,
    actions: 11,
    actors: 50
};
function validOptions(options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validActivityFilters"])({
        domains: [],
        actions: [],
        actors: []
    }, options);
}
function ActivityReport({ state, period, filters, filterOptions, today, timezone, canRead, filterState = 'ready', pending = false, onPeriodApply, onFiltersChange, onRetryFilters, onRetry, onRecord, onPageChange, onPageSizeChange }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    if (!canRead) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
        kind: "error",
        message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].denied
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
        lineNumber: 73,
        columnNumber: 24
    }, this);
    const optionsValid = validOptions(filterOptions);
    const filtersValid = optionsValid && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validActivityFilters"])(filters, filterOptions);
    const safeFilterOptions = optionsValid ? filterOptions : {
        domains: [],
        actions: [],
        actors: []
    };
    const safeFilters = filtersValid ? filters : {
        domains: [],
        actions: [],
        actors: []
    };
    const resultValid = state.kind !== 'ready' || filtersValid && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validActivityReportResult"])(state.result, period, filters, filterOptions, today, timezone);
    const facets = [
        {
            id: 'domains',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domainLabel,
            selected: safeFilters.domains,
            options: safeFilterOptions.domains,
            limit: limit.domains
        },
        {
            id: 'actions',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].actionLabel,
            selected: safeFilters.actions,
            options: safeFilterOptions.actions,
            limit: limit.actions
        },
        {
            id: 'actors',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].actorLabel,
            selected: safeFilters.actors,
            options: safeFilterOptions.actors,
            limit: limit.actors
        }
    ];
    const events = state.kind === 'ready' && resultValid ? state.result : undefined;
    const columns = [
        {
            id: 'time',
            label: 'Event time',
            render: (event)=>new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: timezone
                }).format(new Date(event.occurredAt))
        },
        {
            id: 'type',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domainLabel,
            render: (event)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domains[event.domain]
        },
        {
            id: 'action',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].actionLabel,
            render: (event)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].actions[event.action]
        },
        {
            id: 'actor',
            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].actorLabel,
            render: (event)=>event.actor.label
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "grid w-full min-w-0 gap-6 text-ink",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex min-w-0 items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        id: `${id}-title`,
                        className: "m-0 text-2xl font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                        lineNumber: 100,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HelpTooltip"], {
                        label: "About CRM activity history",
                        paragraphs: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].filtersHelp,
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].ordering,
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].detail
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                        lineNumber: 101,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                lineNumber: 99,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportDateControls"], {
                value: period,
                context: "history",
                today: today,
                timezone: timezone,
                pending: pending,
                onApply: onPeriodApply
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                lineNumber: 103,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$facet$2d$filters$2f$report$2d$facet$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportFacetFilters"], {
                reportLabel: "CRM activity",
                context: "period",
                canRead: true,
                state: filterState,
                pending: pending,
                facets: facets,
                validOptions: optionsValid,
                validSelection: filtersValid,
                attributionHelp: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].detail,
                onRetry: onRetryFilters,
                onSelect: (facet, selected)=>{
                    if (pending) return;
                    if (facet === 'domains') onFiltersChange({
                        ...safeFilters,
                        domains: selected.filter((value)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityDomains"].some((domain)=>domain === value))
                    });
                    else if (facet === 'actions') onFiltersChange({
                        ...safeFilters,
                        actions: selected.filter((value)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityActions"].some((action)=>action === value))
                    });
                    else if (facet === 'actors') onFiltersChange({
                        ...safeFilters,
                        actors: selected
                    });
                },
                onClear: ()=>{
                    if (!pending) onFiltersChange({
                        domains: [],
                        actions: [],
                        actors: []
                    });
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                lineNumber: 104,
                columnNumber: 5
            }, this),
            state.kind === 'loading' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportResultState"], {
                state: {
                    kind: 'loading'
                },
                canRead: true,
                canEdit: false,
                pending: pending,
                onRetry: onRetry,
                onEdit: ()=>undefined
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                lineNumber: 118,
                columnNumber: 33
            }, this) : state.kind === 'error' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportResultState"], {
                state: {
                    kind: 'error',
                    message: state.message
                },
                canRead: true,
                canEdit: false,
                pending: pending,
                onRetry: onRetry,
                onEdit: ()=>undefined
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                lineNumber: 120,
                columnNumber: 34
            }, this) : !resultValid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].invalid
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                lineNumber: 122,
                columnNumber: 26
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm font-semibold wrap-anywhere",
                        children: events.periodLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                        lineNumber: 124,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-xs text-muted wrap-anywhere",
                        children: [
                            events.snapshotLabel,
                            " / ",
                            events.scopeLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                        lineNumber: 125,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportSummary"], {
                        canRead: true,
                        hideHeader: true,
                        snapshotLabel: events.snapshotLabel,
                        scopeLabel: events.scopeLabel,
                        pending: pending,
                        onEvidence: ()=>undefined,
                        metrics: [
                            {
                                id: 'events',
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].count,
                                value: {
                                    kind: 'count',
                                    value: events.total
                                },
                                dateBasisLabel: `Event timestamp / ${events.periodLabel}`,
                                description: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].ordering} ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].detail}`
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                        lineNumber: 126,
                        columnNumber: 13
                    }, this),
                    events.total === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportResultState"], {
                        state: {
                            kind: 'empty'
                        },
                        canRead: true,
                        canEdit: false,
                        pending: pending,
                        onRetry: onRetry,
                        onEdit: ()=>undefined
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                        lineNumber: 131,
                        columnNumber: 36
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm text-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].ordering
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                                lineNumber: 134,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DataTable"], {
                                caption: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].title,
                                rows: events.rows,
                                getRowId: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityEventKey"],
                                getRowLabel: (event)=>`${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domains[event.domain]} ${event.recordLabel}`,
                                columns: [
                                    {
                                        id: 'record',
                                        label: 'Record / event',
                                        render: (event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                disabled: pending,
                                                "aria-label": `View record: ${event.recordLabel}`,
                                                onClick: ()=>{
                                                    if (!pending) onRecord({
                                                        domain: event.domain,
                                                        recordId: event.recordId
                                                    });
                                                },
                                                className: "min-h-11 max-w-full cursor-pointer rounded-lg text-left font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50",
                                                children: event.recordLabel
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                                                lineNumber: 139,
                                                columnNumber: 23
                                            }, this)
                                    },
                                    ...columns,
                                    {
                                        id: 'summary',
                                        label: 'Safe summary',
                                        render: (event)=>`${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domains[event.domain]} · ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].actions[event.action].toLowerCase()}`
                                    }
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                                lineNumber: 135,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$pagination$2f$pagination$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Pagination"], {
                                total: events.total,
                                page: events.page,
                                pageSize: events.pageSize,
                                disabled: pending,
                                onPageChange: onPageChange,
                                onPageSizeChange: onPageSizeChange
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
                                lineNumber: 148,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report.tsx",
        lineNumber: 98,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/activity-report/activity-report.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activityReportRequest",
    ()=>activityReportRequest,
    "activityReportScopeKey",
    ()=>activityReportScopeKey,
    "adaptActivityReadResponse",
    ()=>adaptActivityReadResponse,
    "adaptActivityReportResponse",
    ()=>adaptActivityReportResponse,
    "visibleActivityRecord",
    ()=>visibleActivityRecord
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report.validation.ts [app-ssr] (ecmascript)");
;
;
;
;
function activityReportRequest(input) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportQuerySchema"].parse({
        workspaceId: input.workspaceId,
        view: 'activity',
        period: {
            from: input.range.from,
            to: input.range.to
        },
        filters: input.filters,
        page: input.page,
        pageSize: input.pageSize
    });
}
const sameSelection = (left, right)=>left.length === right.length && left.every((value)=>right.includes(value));
function activityReportScopeKey(result) {
    return JSON.stringify([
        result.workspaceId,
        result.viewerId,
        result.policyRevision,
        result.authority,
        result.report.includedDomains,
        result.report.omittedDomains,
        result.exportScopes
    ]);
}
function adaptActivityReadResponse(raw, input) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportReadResultSchema"].safeParse(raw);
    if (!parsed.success) throw new Error('Activity report data does not match the current request, authority or evidence. Reload the report.');
    if (activityReportScopeKey(parsed.data) !== input.scopeKey) {
        throw new Error('Activity report authority has changed. Reload the report.');
    }
    return adaptActivityReportResponse(parsed.data.report, {
        ...input,
        canRead: true
    });
}
function visibleActivityRecord(result, record) {
    return result.report.rows.some((row)=>row.domain === record.domain && row.recordId === record.recordId);
}
function adaptActivityReportResponse(raw, input) {
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportQuerySchema"].parse(input.request);
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportResultSchema"].parse(raw);
    if (!input.canRead || !input.scopeKey.trim() || response.workspaceId !== request.workspaceId || response.from !== request.period.from || response.to !== request.period.to || response.today !== input.today || response.timezone !== input.timezone || response.pageSize !== request.pageSize || response.page !== Math.min(request.page, Math.max(1, Math.ceil(response.total / response.pageSize))) || !sameSelection(response.filters.domains, request.filters.domains) || !sameSelection(response.filters.actions, request.filters.actions) || !sameSelection(response.filters.actors, request.filters.actors) || response.includedDomains.length !== input.includedDomains.length || !response.includedDomains.every((item)=>input.includedDomains.some((expected)=>expected.domain === item.domain && expected.scope === item.scope && expected.archiveVisibility === item.archiveVisibility))) {
        throw new Error('Activity results do not match the current request or authority. Retry the report.');
    }
    const filterOptions = {
        domains: response.options.domains.map((value)=>({
                value,
                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domains[value]
            })),
        actions: response.options.actions.map((value)=>({
                value,
                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].actions[value]
            })),
        actors: response.options.actors
    };
    const archives = response.includedDomains.map((item)=>`${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domains[item.domain]}: ${item.scope}, archives ${item.archiveVisibility}`).join('; ');
    const omitted = response.omittedDomains.map((item)=>`${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportData"].domains[item.domain]} (${item.reason})`).join(', ');
    const result = {
        from: response.from,
        to: response.to,
        today: response.today,
        timezone: response.timezone,
        periodLabel: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(response.from)} - ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(response.to)}`,
        snapshotLabel: `Authorized native history / ${new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: response.timezone
        }).format(new Date(response.asOf))} (${response.timezone})`,
        scopeLabel: `${response.scopeLabel} Coverage: ${archives}.${omitted ? ` Omitted: ${omitted}.` : ''}`,
        filters: response.filters,
        total: response.total,
        rows: response.rows,
        page: response.page,
        pageSize: response.pageSize
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validActivityReportResult"])(result, input.period, request.filters, filterOptions, input.today, input.timezone)) {
        throw new Error('Activity facets and ordered evidence cannot be displayed consistently. Retry the report.');
    }
    return {
        scopeKey: input.scopeKey,
        state: {
            kind: 'ready',
            result
        },
        filterOptions
    };
}
}),
"[project]/apps/web/src/features/reports/activity-report/activity-export.client.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityCSVChangedError",
    ()=>ActivityCSVChangedError,
    "ActivityCSVDeniedError",
    ()=>ActivityCSVDeniedError,
    "activityExportFilename",
    ()=>activityExportFilename,
    "activityExportInput",
    ()=>activityExportInput,
    "activityExportLabels",
    ()=>activityExportLabels,
    "loadActivityCSVPreview",
    ()=>loadActivityCSVPreview,
    "receiveActivityCSV",
    ()=>receiveActivityCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity-export.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/receive-report-csv.ts [app-ssr] (ecmascript)");
;
;
const activityExportLabels = {
    summary: 'Summary table',
    evidence: 'Selected events'
};
function activityExportInput(query, dataset) {
    const { page, pageSize, ...unpaged } = query;
    void page;
    void pageSize;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportExportInputSchema"].parse({
        dataset,
        query: unpaged
    });
}
function activityExportFilename(input, today) {
    return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
class ActivityCSVChangedError extends Error {
    constructor(){
        super('Activity export data or access changed. Refresh the preview and review again.');
    }
}
class ActivityCSVDeniedError extends Error {
    constructor(){
        super('This Activity selection is unavailable under current export access. Change the selection or reload access.');
    }
}
async function responseError(response) {
    if ([
        401,
        403,
        404,
        423
    ].includes(response.status)) throw new ActivityCSVDeniedError();
    throw new Error(response.status === 422 ? 'Check the Activity selection and technical CSV limits.' : 'Activity CSV could not be completed. Try again.');
}
async function loadActivityCSVPreview(input, authority, signal) {
    if (!authority.exportScopes.length || input.query.filters.domains.some((domain)=>!authority.exportScopes.some((scope)=>scope.domain === domain))) {
        throw new ActivityCSVDeniedError();
    }
    const response = await fetch('/api/reports/activity/export/preview', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input),
        signal
    });
    if (!response.ok) return responseError(response);
    const preview = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportExportPreviewSchema"].parse(await response.json());
    const scopes = preview.includedDomains.map(({ domain, scope })=>({
            domain,
            scope
        }));
    if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId || preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision || JSON.stringify(scopes) !== JSON.stringify(authority.exportScopes) || preview.includedDomains.some((item)=>authority.report.includedDomains.find((read)=>read.domain === item.domain)?.archiveVisibility !== item.archiveVisibility) || preview.today !== authority.report.today || preview.timezone !== authority.report.timezone) throw new ActivityCSVChangedError();
    return preview;
}
async function receiveActivityCSV(preview, signal) {
    const response = await fetch('/api/reports/activity/export', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preview.input),
        signal
    });
    if (!response.ok) return responseError(response);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["receiveReportCSV"])(response, preview.columns, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportExportGenerationSchema"], (metadata)=>{
        if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision || JSON.stringify(metadata.includedDomains) !== JSON.stringify(preview.includedDomains) || JSON.stringify(metadata.omittedDomains) !== JSON.stringify(preview.omittedDomains) || metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) || Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new ActivityCSVChangedError();
    }, signal, 'Activity');
}
;
}),
"[project]/apps/web/src/features/reports/activity-report/activity-export.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityExport",
    ()=>ActivityExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/field-classes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-csv-review-dialog/report-csv-review-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-export.client.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveActivityCSV$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/save-report-csv.ts [app-ssr] (ecmascript) <export saveReportCSV as saveActivityCSV>");
'use client';
;
;
;
;
;
function ActivityExport({ request, authority, onClose, onReload }) {
    const [dataset, setDataset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('summary');
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const [resolved, setResolved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: '',
        state: {
            kind: 'loading'
        },
        denied: false
    });
    const review = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const operation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined), active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const key = JSON.stringify([
        request,
        dataset,
        retry
    ]);
    const current = resolved.key === key ? resolved : {
        state: {
            kind: 'loading'
        },
        denied: false,
        metadata: undefined
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        active.current = true;
        return ()=>{
            active.current = false;
            operation.current?.abort();
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const abort = new AbortController();
        operation.current = abort;
        review.current = undefined;
        void (async ()=>{
            try {
                const preview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadActivityCSVPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["activityExportInput"])(request, dataset), authority, AbortSignal.any([
                    abort.signal,
                    AbortSignal.timeout(30000)
                ]));
                if (abort.signal.aborted) return;
                const id = crypto.randomUUID();
                review.current = {
                    id,
                    preview
                };
                setResolved({
                    key,
                    denied: false,
                    metadata: preview,
                    state: preview.count > preview.limits.rows ? {
                        kind: 'limit'
                    } : {
                        kind: 'ready',
                        preview: {
                            id,
                            reportLabel: 'Activity',
                            viewLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["activityExportLabels"][dataset],
                            periodLabel: `${request.period.from} - ${request.period.to}`,
                            dateBasisLabel: 'Recorded event time',
                            timezone: preview.timezone,
                            filtersLabel: `Domains: ${request.filters.domains.join(', ') || 'all authorized'}; actions: ${request.filters.actions.length || 'all'}; actors: ${request.filters.actors.length || 'all'}`,
                            scopeLabel: preview.includedDomains.map((item)=>`${item.domain}: ${item.scope}, archives ${item.archiveVisibility}`).join('; '),
                            filename: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["activityExportFilename"])(preview.input, preview.today),
                            expectedRows: preview.count
                        }
                    }
                });
            } catch (failure) {
                if (abort.signal.aborted) return;
                setResolved({
                    key,
                    denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ActivityCSVDeniedError"],
                    state: {
                        kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ActivityCSVChangedError"] ? 'changed' : 'error'
                    }
                });
                setError(failure instanceof Error ? failure.message : 'Activity CSV preview could not be loaded.');
            }
        })();
        return ()=>abort.abort();
    }, [
        request,
        authority,
        dataset,
        key
    ]);
    const download = async (id)=>{
        const selected = review.current;
        if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Activity CSV review.');
        const abort = new AbortController();
        operation.current = abort;
        const signal = AbortSignal.any([
            abort.signal,
            AbortSignal.timeout(selected.preview.limits.durationMs)
        ]);
        setPending(true);
        setError(undefined);
        try {
            const blob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["receiveActivityCSV"])(selected.preview, signal);
            if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveActivityCSV$3e$__["saveActivityCSV"])(blob, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["activityExportFilename"])(selected.preview.input, selected.preview.today));
            onClose();
        } catch (failure) {
            if (active.current) {
                if (failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ActivityCSVChangedError"] || failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ActivityCSVDeniedError"]) {
                    review.current = undefined;
                    setResolved({
                        key,
                        denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ActivityCSVDeniedError"],
                        state: {
                            kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ActivityCSVChangedError"] ? 'changed' : 'error'
                        }
                    });
                }
                setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.' : failure instanceof Error ? failure.message : 'Activity CSV could not be completed.');
            }
            throw failure;
        } finally{
            if (active.current) setPending(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportCsvReviewDialog"], {
        open: true,
        canExport: authority.exportScopes.length > 0 && !current.denied,
        state: current.state,
        pending: pending,
        allowEmpty: true,
        rowLimit: current.metadata?.limits.rows,
        technicalLimits: current.metadata?.limits,
        onClose: onClose,
        onDownload: download,
        onRefresh: ()=>{
            review.current = undefined;
            setError(undefined);
            setRetry((value)=>value + 1);
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "grid min-w-0 gap-2 text-sm font-semibold",
                children: [
                    "CSV dataset",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClasses"]} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`,
                        value: dataset,
                        disabled: pending,
                        onChange: (event)=>{
                            const next = event.target.value;
                            if (next !== 'summary' && next !== 'evidence') throw new Error('Invalid Activity CSV dataset.');
                            if (next === dataset) return;
                            review.current = undefined;
                            setError(undefined);
                            setDataset(next);
                        },
                        children: [
                            'summary',
                            'evidence'
                        ].map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["activityExportLabels"][value]
                            }, value, false, {
                                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
                                lineNumber: 87,
                                columnNumber: 58
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
                        lineNumber: 80,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
                lineNumber: 79,
                columnNumber: 5
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
                lineNumber: 90,
                columnNumber: 15
            }, this),
            (current.denied || current.state.kind === 'changed') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Reload report access",
                disabled: pending,
                onClick: ()=>{
                    onClose();
                    onReload();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
                lineNumber: 91,
                columnNumber: 62
            }, this),
            current.metadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: [
                    "Snapshot: ",
                    current.metadata.asOf,
                    ". ",
                    current.metadata.coverage,
                    ' ',
                    "Omitted domains: ",
                    current.metadata.omittedDomains.map((item)=>item.domain).join(', ') || 'none',
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
                lineNumber: 93,
                columnNumber: 26
            }, this),
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Cancel download",
                onClick: ()=>operation.current?.abort()
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
                lineNumber: 95,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-export.tsx",
        lineNumber: 74,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityReportPage",
    ()=>ActivityReportPage,
    "ActivityReportRoute",
    ()=>ActivityReportRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/activity-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-button/seafoam-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-report.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/use-report-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/activity-report/activity-export.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-templates/report-templates.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-templates/template-session.tsx [app-ssr] (ecmascript)");
'use client';
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
function ActivityReportPage({ initial, ...actions }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TemplateSession"], {
        initial: initial,
        parse: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportReadResultSchema"].parse,
        children: (result, template, run, revision)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityReportPageHost, {
                initial: result,
                template: template,
                onTemplateRun: run,
                ...actions
            }, revision, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                lineNumber: 21,
                columnNumber: 43
            }, this)
    }, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportScopeKey"])(initial)}:${initial.report.asOf}`, false, {
        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
        lineNumber: 20,
        columnNumber: 10
    }, this);
}
function ActivityReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }) {
    const today = initial.report.today, timezone = initial.report.timezone, scopeKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportScopeKey"])(initial);
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(template?.configuration.period ?? {
        preset: 'custom',
        ...initial.query.period
    });
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.filters);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.page), [pageSize, setPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.pageSize);
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, today, 'history').range;
        if (!resolved) throw new Error('Choose a valid Activity report period.');
        return resolved;
    }, [
        period,
        today
    ]);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportRequest"])({
            workspaceId: initial.workspaceId,
            range,
            filters,
            page,
            pageSize
        }), [
        initial.workspaceId,
        range,
        filters,
        page,
        pageSize
    ]);
    const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
    const adaptationInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            request,
            period,
            scopeKey,
            today,
            timezone,
            includedDomains: initial.report.includedDomains
        }), [
        request,
        period,
        scopeKey,
        today,
        timezone,
        initial.report.includedDomains
    ]);
    const validate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((raw)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptActivityReadResponse"])(raw, adaptationInput);
    }, [
        adaptationInput
    ]);
    const loaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReportRead"])({
        key,
        initial,
        validate,
        url: `/api/reports/activity?${new URLSearchParams({
            query: JSON.stringify(request)
        })}`,
        failureMessage: 'Activity report could not be loaded. Try again.'
    });
    let adapted;
    let raw;
    let error = loaded.key === key ? loaded.error : undefined;
    if (!loaded.pending && loaded.raw) {
        try {
            adapted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptActivityReadResponse"])(loaded.raw, adaptationInput);
            raw = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$activity$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activityReportReadResultSchema"].parse(loaded.raw);
        } catch (failure) {
            error = failure instanceof Error ? failure.message : 'Activity report data is invalid. Reload the report.';
        }
    }
    const denied = loaded.key === key && loaded.denied;
    const state = adapted?.state ?? (loaded.pending ? {
        kind: 'loading'
    } : {
        kind: 'error',
        message: error
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "grid min-w-0 gap-6 p-4 sm:p-8",
        children: [
            !denied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportTemplates"], {
                area: "activity",
                workspaceId: initial.workspaceId,
                query: request,
                period: period,
                ready: !loaded.pending && !error && !!raw,
                active: template,
                onRun: onTemplateRun
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                lineNumber: 59,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid justify-items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                        lineNumber: 62,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamButton"], {
                        label: "Reload report access",
                        onClick: onReload
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                        lineNumber: 62,
                        columnNumber: 52
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                lineNumber: 61,
                columnNumber: 15
            }, this),
            raw && !loaded.pending && !error && raw.exportScopes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                    label: "Preview CSV",
                    onClick: ()=>setExportOpen(true)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                    lineNumber: 65,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                lineNumber: 64,
                columnNumber: 73
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ActivityReport"], {
                state: state,
                period: period,
                filters: filters,
                filterOptions: adapted?.filterOptions ?? {
                    domains: [],
                    actions: [],
                    actors: []
                },
                today: today,
                timezone: timezone,
                canRead: !denied,
                pending: loaded.pending,
                filterState: loaded.pending ? 'loading' : error ? 'error' : 'ready',
                onPeriodApply: (value)=>{
                    setPeriod(value);
                    setFilters({
                        domains: [],
                        actions: [],
                        actors: []
                    });
                    setPage(1);
                },
                onFiltersChange: (value)=>{
                    setFilters(value);
                    setPage(1);
                },
                onRetryFilters: ()=>setRetry((value)=>value + 1),
                onRetry: ()=>setRetry((value)=>value + 1),
                onRecord: (record)=>{
                    if (!loaded.pending && raw && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$report$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["visibleActivityRecord"])(raw, record)) onRecord(record);
                },
                onPageChange: setPage,
                onPageSizeChange: (size)=>{
                    setPageSize(size);
                    setPage(1);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                lineNumber: 67,
                columnNumber: 5
            }, this),
            exportOpen && raw && !loaded.pending && !error && raw.exportScopes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$activity$2d$report$2f$activity$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ActivityExport"], {
                request: request,
                authority: raw,
                onClose: ()=>setExportOpen(false),
                onReload: onReload
            }, `${scopeKey}:${JSON.stringify(request)}`, false, {
                fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
                lineNumber: 76,
                columnNumber: 87
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
        lineNumber: 58,
        columnNumber: 10
    }, this);
}
function ActivityReportRoute({ initial }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const routes = {
        lead: 'leads',
        customer: 'customers',
        job: 'jobs',
        estimate: 'estimates',
        'work-order': 'work-orders'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityReportPage, {
        initial: initial,
        onReload: ()=>router.refresh(),
        onRecord: (record)=>router.push(`/${routes[record.domain]}/${encodeURIComponent(record.recordId)}?workspace=${encodeURIComponent(initial.workspaceId)}`)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/activity-report/activity-report-page.tsx",
        lineNumber: 84,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_reports_activity-report_0f_k9xw._.js.map