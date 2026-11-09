module.exports = [
"[project]/apps/web/src/features/reports/business-overview/business-overview.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "businessOverviewData",
    ()=>businessOverviewData
]);
const businessOverviewData = {
    title: 'Business overview',
    periodResults: 'Selected-period results',
    periodDescription: 'Results use the selected date range. Changing the period does not change current snapshot metrics.',
    currentState: 'Current operations',
    currentDescription: 'Current counts are not restricted by the selected historical period.',
    attention: 'Needs attention',
    attentionDescription: 'Separate authorized queues from current report definitions; counts are not additive.',
    noAttention: 'No matching attention items in the available current queues.',
    unavailableAttention: 'This attention section is unavailable under current report and underlying record permissions.',
    denied: 'Your current access does not allow this overview.',
    invalid: 'Overview data is inconsistent with its authorized snapshot, period, permissions or evidence. Retry the report.',
    emptyPeriod: 'No matching records in the selected period.',
    periodBasis: 'Selected period',
    currentBasis: 'Current snapshot',
    table: 'Current attention queues',
    view: 'View details',
    metricDescriptions: {
        'new-leads': 'Distinct surviving Leads created in the selected period.',
        'jobs-created': 'Distinct Jobs created in the selected period.',
        'jobs-completed': 'Distinct Jobs with an effective recorded completion in the selected period.',
        'accepted-estimates': 'Estimate families with an effective accepted customer decision in the selected period.',
        'accepted-value': 'Frozen accepted pre-tax value; a sales commitment, not revenue or payments.',
        'new-lead-stage': 'Currently open Leads in the New stage.',
        'contacted-lead-stage': 'Currently open Leads in the Contacted stage.',
        'estimate-sent-lead-stage': 'Currently open Leads in the Estimate sent stage.',
        'awaiting-estimates': 'Current issued estimate families awaiting a customer decision.',
        'active-jobs': 'Currently active Jobs in the authorized scope.',
        'overdue-jobs': 'Active Jobs with a completion deadline strictly before business-local today.',
        'upcoming-visits': 'Canonical scheduled visits in the next seven calendar days, including today.'
    }
};
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview.validation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "overviewAttentionIds",
    ()=>overviewAttentionIds,
    "overviewCurrentMetricIds",
    ()=>overviewCurrentMetricIds,
    "overviewEvidenceIds",
    ()=>overviewEvidenceIds,
    "overviewPeriodMetricIds",
    ()=>overviewPeriodMetricIds,
    "validBusinessOverviewResult",
    ()=>validBusinessOverviewResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
;
;
;
const overviewPeriodMetricIds = [
    'new-leads',
    'jobs-created',
    'jobs-completed',
    'accepted-estimates',
    'accepted-value'
];
const overviewCurrentMetricIds = [
    'new-lead-stage',
    'contacted-lead-stage',
    'estimate-sent-lead-stage',
    'awaiting-estimates',
    'active-jobs',
    'overdue-jobs',
    'upcoming-visits'
];
const overviewEvidenceIds = [
    ...overviewPeriodMetricIds,
    ...overviewCurrentMetricIds,
    'stale-leads',
    'waiting-jobs'
];
const overviewAttentionIds = [
    'stale-leads',
    'overdue-jobs',
    'waiting-jobs',
    'upcoming-visits'
];
const isRecord = (value)=>typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactKeys = (value, required, optional = [])=>required.every((key)=>Object.hasOwn(value, key)) && Object.keys(value).every((key)=>required.includes(key) || optional.includes(key));
const safeText = (value, limit)=>typeof value === 'string' && value.trim() !== '' && value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const isDate = (value)=>typeof value === 'string' && !value.startsWith('0000') && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(value).success;
const isNonnegativeInteger = (value)=>typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
function validMetric(value, allowedIds) {
    if (!isRecord(value) || !hasExactKeys(value, [
        'id',
        'label',
        'value',
        'description',
        'dateBasisLabel'
    ], [
        'evidenceId'
    ]) || typeof value.id !== 'string' || !allowedIds.includes(value.id) || !safeText(value.label, 120) || !safeText(value.description, 400) || !safeText(value.dateBasisLabel, 240)) return false;
    if (value.evidenceId !== undefined && (typeof value.evidenceId !== 'string' || !overviewEvidenceIds.includes(value.evidenceId))) {
        return false;
    }
    if (!isRecord(value.value) || typeof value.value.kind !== 'string') return false;
    switch(value.value.kind){
        case 'count':
            return hasExactKeys(value.value, [
                'kind',
                'value'
            ]) && isNonnegativeInteger(value.value.value);
        case 'formatted':
            return hasExactKeys(value.value, [
                'kind',
                'displayValue'
            ]) && safeText(value.value.displayValue, 80);
        case 'incomplete':
            return hasExactKeys(value.value, [
                'kind',
                'displayValue',
                'coverageLabel'
            ]) && safeText(value.value.displayValue, 80) && safeText(value.value.coverageLabel, 200);
        case 'unavailable':
            return hasExactKeys(value.value, [
                'kind',
                'reason'
            ]) && safeText(value.value.reason, 240) && value.evidenceId === undefined;
        default:
            return false;
    }
}
function validMetricSet(value, expectedIds) {
    if (!Array.isArray(value) || value.length !== expectedIds.length || !value.every((metric)=>validMetric(metric, expectedIds))) return false;
    const ids = value.map((metric)=>metric.id);
    return new Set(ids).size === expectedIds.length && expectedIds.every((id)=>ids.includes(id));
}
function validAttention(value) {
    if (!isRecord(value) || typeof value.kind !== 'string') return false;
    if (value.kind === 'unavailable') {
        return hasExactKeys(value, [
            'kind',
            'reason'
        ]) && safeText(value.reason, 240);
    }
    if (value.kind !== 'available' || !hasExactKeys(value, [
        'kind',
        'items'
    ]) || !Array.isArray(value.items) || value.items.length > overviewAttentionIds.length || !value.items.every((item)=>isRecord(item) && hasExactKeys(item, [
            'id',
            'label',
            'description',
            'count',
            'evidenceId'
        ]) && typeof item.id === 'string' && overviewAttentionIds.includes(item.id) && safeText(item.label, 120) && safeText(item.description, 240) && isNonnegativeInteger(item.count) && typeof item.evidenceId === 'string' && overviewEvidenceIds.includes(item.evidenceId))) return false;
    return new Set(value.items.map((item)=>item.id)).size === value.items.length;
}
function validBusinessOverviewResult(result, period, expectedToday, expectedTimezone) {
    if (!isRecord(result) || !hasExactKeys(result, [
        'today',
        'timezone',
        'from',
        'to',
        'snapshotLabel',
        'scopeLabel',
        'currentSnapshotLabel',
        'currentScopeLabel',
        'upcomingVisitsRangeLabel',
        'periodMetrics',
        'currentMetrics',
        'attention'
    ]) || !isDate(result.today) || result.today !== expectedToday || result.timezone !== expectedTimezone || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validReportTimezone"])(expectedTimezone) || !isDate(result.from) || !isDate(result.to) || ![
        result.snapshotLabel,
        result.currentSnapshotLabel,
        result.upcomingVisitsRangeLabel
    ].every((label)=>safeText(label, 240)) || ![
        result.scopeLabel,
        result.currentScopeLabel
    ].every((label)=>safeText(label, 40000)) || !validMetricSet(result.periodMetrics, overviewPeriodMetricIds) || !validMetricSet(result.currentMetrics, overviewCurrentMetricIds) || !validAttention(result.attention)) return false;
    const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, result.today, 'history');
    if (!range.range || result.from !== range.range.from || result.to !== range.range.to) return false;
    const periodBasis = `Selected period / ${result.from} to ${result.to}, both dates included`;
    const currentBasis = `Current snapshot / ${result.currentSnapshotLabel}`;
    const upcomingVisitsBasis = `Next seven days / ${result.upcomingVisitsRangeLabel}`;
    const expectedVisitsRange = `${result.today} to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addCalendarDays"])(result.today, 6)}, including today`;
    return result.upcomingVisitsRangeLabel === expectedVisitsRange && result.periodMetrics.every((metric)=>metric.dateBasisLabel === periodBasis) && result.currentMetrics.every((metric)=>metric.id === 'upcoming-visits' ? metric.dateBasisLabel === upcomingVisitsBasis : metric.dateBasisLabel === currentBasis);
}
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessOverview",
    ()=>BusinessOverview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/data-table/data-table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-result-state/report-result-state.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-summary/report-summary.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview.validation.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
const overviewEvidenceIdSet = new Set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["overviewEvidenceIds"]);
const isOverviewEvidenceId = (value)=>overviewEvidenceIdSet.has(value);
function BusinessOverview({ state, period, today, timezone, canRead, canNavigateDetails = true, pending = false, onPeriodApply, onEvidence, onRetry }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    if (!canRead || state.kind !== 'ready') {
        const resultState = !canRead ? {
            kind: 'empty'
        } : state.kind === 'error' ? {
            kind: 'error',
            message: state.message
        } : {
            kind: 'loading'
        };
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$result$2d$state$2f$report$2d$result$2d$state$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportResultState"], {
            state: resultState,
            canRead: canRead,
            canEdit: false,
            pending: pending,
            onRetry: onRetry,
            onEdit: ()=>undefined
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
            lineNumber: 58,
            columnNumber: 12
        }, this);
    }
    const result = state.result;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validBusinessOverviewResult"])(result, period, today, timezone)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
            kind: "error",
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].invalid
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
            lineNumber: 69,
            columnNumber: 12
        }, this);
    }
    const attentionItems = result.attention.kind === 'available' ? result.attention.items : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "grid w-full min-w-0 gap-6 text-ink",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "grid min-w-0 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        id: `${id}-title`,
                        className: "m-0 text-2xl font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 74,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-xs text-muted wrap-anywhere",
                        children: [
                            result.snapshotLabel,
                            " / ",
                            result.scopeLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 75,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                lineNumber: 73,
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
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                lineNumber: 79,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-period-title`,
                className: "grid min-w-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: `${id}-period-title`,
                                className: "m-0 text-xl font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].periodResults
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                                lineNumber: 83,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 mt-1 text-sm text-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].periodDescription
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                                lineNumber: 84,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 82,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportSummary"], {
                        canRead: true,
                        hideHeader: true,
                        snapshotLabel: result.snapshotLabel,
                        scopeLabel: result.scopeLabel,
                        pending: pending,
                        onEvidence: (evidenceId)=>{
                            if (canNavigateDetails && isOverviewEvidenceId(evidenceId)) onEvidence(evidenceId);
                        },
                        metrics: result.periodMetrics.map((metric)=>canNavigateDetails ? metric : {
                                ...metric,
                                evidenceId: undefined
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 86,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                lineNumber: 81,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-current-title`,
                className: "grid min-w-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: `${id}-current-title`,
                                className: "m-0 text-xl font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].currentState
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                                lineNumber: 93,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 mt-1 text-sm text-muted",
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].currentDescription,
                                    " ",
                                    result.currentSnapshotLabel,
                                    " / ",
                                    result.currentScopeLabel
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                                lineNumber: 94,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 92,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$summary$2f$report$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportSummary"], {
                        canRead: true,
                        hideHeader: true,
                        threeColumns: true,
                        snapshotLabel: result.currentSnapshotLabel,
                        scopeLabel: result.currentScopeLabel,
                        pending: pending,
                        onEvidence: (evidenceId)=>{
                            if (canNavigateDetails && isOverviewEvidenceId(evidenceId)) onEvidence(evidenceId);
                        },
                        metrics: result.currentMetrics.map((metric)=>canNavigateDetails ? metric : {
                                ...metric,
                                evidenceId: undefined
                            })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 98,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                lineNumber: 91,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-attention-title`,
                className: "grid min-w-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: `${id}-attention-title`,
                                className: "m-0 text-xl font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].attention
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                                lineNumber: 105,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 mt-1 text-sm text-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].attentionDescription
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                                lineNumber: 106,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 104,
                        columnNumber: 7
                    }, this),
                    result.attention.kind === 'unavailable' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: result.attention.reason
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DataTable"], {
                        caption: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].table,
                        rows: attentionItems,
                        getRowId: (row)=>row.id,
                        getRowLabel: (row)=>row.label,
                        emptyMessage: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].noAttention,
                        columns: [
                            {
                                id: 'queue',
                                label: 'Queue',
                                render: (row)=>row.label
                            },
                            {
                                id: 'details',
                                label: 'Definition',
                                render: (row)=>row.description
                            },
                            {
                                id: 'count',
                                label: 'Records',
                                render: (row)=>row.count
                            },
                            {
                                id: 'evidence',
                                label: 'Details',
                                render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: pending || !canNavigateDetails,
                                        "aria-label": `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].view}: ${row.label}`,
                                        onClick: ()=>{
                                            if (!pending && canNavigateDetails) onEvidence(row.evidenceId);
                                        },
                                        className: "min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:opacity-50",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].view
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                                        lineNumber: 118,
                                        columnNumber: 15
                                    }, this)
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
                lineNumber: 103,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview.tsx",
        lineNumber: 72,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessOverviewPage",
    ()=>BusinessOverviewPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function BusinessOverviewPage(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-canvas p-4 text-ink sm:p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BusinessOverview"], {
                ...props
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-page.tsx",
                lineNumber: 13,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-page.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-page.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptBusinessOverviewResponse",
    ()=>adaptBusinessOverviewResponse,
    "businessOverviewRequest",
    ()=>businessOverviewRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/money-text/money-text.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview.validation.ts [app-ssr] (ecmascript)");
;
;
;
;
;
function businessOverviewRequest(input) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewQuerySchema"].parse({
        workspaceId: input.workspaceId,
        view: 'business-overview',
        period: {
            from: input.range.from,
            to: input.range.to
        }
    });
}
const labels = {
    'new-leads': 'New Leads',
    'jobs-created': 'Jobs created',
    'jobs-completed': 'Jobs completed',
    'accepted-estimates': 'Accepted estimates',
    'accepted-value': 'Accepted pre-tax value',
    'new-lead-stage': 'New Leads',
    'contacted-lead-stage': 'Contacted Leads',
    'estimate-sent-lead-stage': 'Estimate sent Leads',
    'awaiting-estimates': 'Estimates awaiting decision',
    'active-jobs': 'Active Jobs',
    'overdue-jobs': 'Overdue Jobs',
    'upcoming-visits': 'Upcoming visits'
};
function metric(id, value, basis) {
    return {
        id,
        label: labels[id],
        value,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].metricDescriptions[id],
        dateBasisLabel: basis,
        ...value.kind === 'unavailable' ? {} : {
            evidenceId: id
        }
    };
}
function adaptBusinessOverviewResponse(raw, input) {
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewQuerySchema"].parse(input.request), response = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewResultSchema"].parse(raw);
    const { leads, jobs, estimates, calendar } = response, authority = input.authority;
    if (!input.canRead || !input.scopeKey.trim() || response.workspaceId !== request.workspaceId || response.from !== request.period.from || response.to !== request.period.to || response.today !== input.today || response.timezone !== input.timezone || response.reportScope !== authority.reportScope || leads.kind === 'available' && (!authority.lead || leads.scope !== authority.lead.scope || leads.archiveVisibility !== authority.lead.archives) || jobs.kind === 'available' && (!authority.job || jobs.scope !== authority.job.scope) || estimates.kind === 'available' && (!authority.estimate || estimates.scope !== authority.estimate.scope || estimates.archiveVisibility !== authority.estimate.archives) || calendar.kind === 'available' && (!authority.calendar || calendar.scope.kind !== authority.calendar.kind || calendar.scope.kind === 'own' && (authority.calendar.kind !== 'own' || calendar.scope.viewerId !== authority.calendar.viewerId))) {
        throw new Error('Overview results do not match the current request or authority. Retry the report.');
    }
    const coverage = (name, section)=>section.kind === 'unavailable' ? `${name}: ${section.explanation}` : `${name}: scope ${typeof section.scope === 'string' ? section.scope : section.scope.kind}` + `${'archiveVisibility' in section ? `, archives ${section.archiveVisibility}` : ''}. ${'reads' in section ? Object.entries(section.reads).map(([key, read])=>`${key} ${read.asOf} (${read.scopeLabel})`).join('; ') : `${section.read.asOf} (${section.read.scopeLabel})`}`;
    const scope = [
        `Reports: ${response.reportScope}.`,
        coverage('Leads', leads),
        coverage('Jobs', jobs),
        coverage('Estimates', estimates),
        coverage('Calendar', calendar)
    ].join(' ');
    const snapshot = 'Separate native reads; no single cross-section snapshot.';
    const periodBasis = `Selected period / ${response.from} to ${response.to}, both dates included`;
    const currentBasis = `Current snapshot / ${snapshot}`;
    const visitsRange = `${response.today} to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addCalendarDays"])(response.today, 6)}, including today`;
    const count = (section, value)=>section.kind === 'available' ? {
            kind: 'count',
            value
        } : {
            kind: 'unavailable',
            reason: section.explanation
        };
    const attention = [];
    const addAttention = (id, label, description, value)=>{
        if (value > 0) attention.push({
            id,
            label,
            description,
            count: value,
            evidenceId: id
        });
    };
    if (leads.kind === 'available') addAttention('stale-leads', 'Inactive open Leads', 'No recorded activity within the existing inactivity rule.', leads.inactive);
    if (jobs.kind === 'available') {
        addAttention('overdue-jobs', 'Overdue Jobs', 'Active Jobs with deadlines before business-local today.', jobs.overdue);
        addAttention('waiting-jobs', 'Waiting Jobs', 'Current Jobs in the Waiting status.', jobs.waiting);
    }
    if (calendar.kind === 'available') addAttention('upcoming-visits', 'Upcoming visits', 'Canonical visits in the next seven days, including today.', calendar.visits);
    const result = {
        today: response.today,
        timezone: response.timezone,
        from: response.from,
        to: response.to,
        snapshotLabel: snapshot,
        currentSnapshotLabel: snapshot,
        scopeLabel: scope,
        currentScopeLabel: scope,
        upcomingVisitsRangeLabel: visitsRange,
        periodMetrics: [
            metric('new-leads', count(leads, leads.kind === 'available' ? leads.created : 0), periodBasis),
            metric('jobs-created', count(jobs, jobs.kind === 'available' ? jobs.created : 0), periodBasis),
            metric('jobs-completed', count(jobs, jobs.kind === 'available' ? jobs.completed : 0), periodBasis),
            metric('accepted-estimates', count(estimates, estimates.kind === 'available' ? estimates.accepted : 0), periodBasis),
            metric('accepted-value', estimates.kind === 'unavailable' ? {
                kind: 'unavailable',
                reason: estimates.explanation
            } : estimates.acceptedMoney.kind === 'available' ? {
                kind: 'formatted',
                displayValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(estimates.acceptedMoney.preTaxCents)
            } : {
                kind: 'unavailable',
                reason: estimates.acceptedMoney.explanation
            }, periodBasis)
        ],
        currentMetrics: [
            metric('new-lead-stage', count(leads, leads.kind === 'available' ? leads.stages.new : 0), currentBasis),
            metric('contacted-lead-stage', count(leads, leads.kind === 'available' ? leads.stages.contacted : 0), currentBasis),
            metric('estimate-sent-lead-stage', count(leads, leads.kind === 'available' ? leads.stages['estimate-sent'] : 0), currentBasis),
            metric('awaiting-estimates', count(estimates, estimates.kind === 'available' ? estimates.awaiting : 0), currentBasis),
            metric('active-jobs', count(jobs, jobs.kind === 'available' ? jobs.active : 0), currentBasis),
            metric('overdue-jobs', count(jobs, jobs.kind === 'available' ? jobs.overdue : 0), currentBasis),
            metric('upcoming-visits', count(calendar, calendar.kind === 'available' ? calendar.visits : 0), `Next seven days / ${visitsRange}`)
        ],
        attention: leads.kind === 'unavailable' && jobs.kind === 'unavailable' && calendar.kind === 'unavailable' ? {
            kind: 'unavailable',
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewData"].unavailableAttention
        } : {
            kind: 'available',
            items: attention
        }
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validBusinessOverviewResult"])(result, input.period, input.today, input.timezone)) throw new Error('Overview metrics and native coverage cannot be displayed consistently. Retry the report.');
    return {
        scopeKey: input.scopeKey,
        state: {
            kind: 'ready',
            result
        }
    };
}
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-read.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptBusinessOverviewReadResponse",
    ()=>adaptBusinessOverviewReadResponse,
    "businessOverviewScopeKey",
    ()=>businessOverviewScopeKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview.adapter.ts [app-ssr] (ecmascript)");
;
;
function businessOverviewScopeKey(result) {
    return JSON.stringify([
        result.workspaceId,
        result.viewerId,
        result.policyRevision,
        result.authority
    ]);
}
function adaptBusinessOverviewReadResponse(raw, input) {
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewQuerySchema"].parse(input.request), response = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewReadResultSchema"].parse(raw);
    if (JSON.stringify(response.query) !== JSON.stringify(request) || businessOverviewScopeKey(response) !== input.scopeKey || response.report.today !== input.today || response.report.timezone !== input.timezone) {
        throw new Error('Overview results no longer match this request or current authority. Reload the report.');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptBusinessOverviewResponse"])(response.report, {
        ...input,
        request,
        canRead: true,
        authority: response.authority
    });
}
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-export.client.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OverviewCSVChangedError",
    ()=>OverviewCSVChangedError,
    "OverviewCSVDeniedError",
    ()=>OverviewCSVDeniedError,
    "loadOverviewCSVPreview",
    ()=>loadOverviewCSVPreview,
    "overviewExportFilename",
    ()=>overviewExportFilename,
    "receiveOverviewCSV",
    ()=>receiveOverviewCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview-export.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/receive-report-csv.ts [app-ssr] (ecmascript)");
;
;
class OverviewCSVChangedError extends Error {
    constructor(){
        super('Overview export data or access changed. Refresh the preview and review again.');
    }
}
class OverviewCSVDeniedError extends Error {
    constructor(){
        super('No Overview sections are available under current export access.');
    }
}
async function responseError(response) {
    if ([
        401,
        403,
        404,
        423
    ].includes(response.status)) throw new OverviewCSVDeniedError();
    throw new Error(response.status === 422 ? 'Check the Overview period and technical CSV limits.' : 'Overview CSV could not be completed. Try again.');
}
const overviewExportFilename = (today)=>`salesmora-business-overview-summary-${today}.csv`;
async function loadOverviewCSVPreview(query, authority, signal) {
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewExportInputSchema"].parse({
        query,
        dataset: 'summary'
    });
    const response = await fetch('/api/reports/overview/export/preview', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input),
        signal
    });
    if (!response.ok) return responseError(response);
    const preview = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewExportPreviewSchema"].parse(await response.json());
    const { lead, job, estimate, calendar } = preview.scopes, read = authority.authority;
    if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId || preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision || preview.today !== authority.report.today || preview.timezone !== authority.report.timezone || lead && (!read.lead || read.lead.scope === 'assigned' && lead.scope !== 'assigned' || read.lead.archives === 'excluded' && lead.archives !== 'excluded') || job && (!read.job || read.job.scope === 'assigned' && job !== 'assigned') || estimate && (!read.estimate || read.estimate.scope === 'assigned_job' && estimate.scope !== 'assigned_job' || read.estimate.archives === 'excluded' && estimate.archives !== 'excluded') || calendar && (!read.calendar || read.calendar.kind === 'own' && calendar.scope !== 'own')) throw new OverviewCSVChangedError();
    return preview;
}
async function receiveOverviewCSV(preview, signal) {
    const response = await fetch('/api/reports/overview/export', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preview.input),
        signal
    });
    if (!response.ok) return responseError(response);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["receiveReportCSV"])(response, preview.columns, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewExportGenerationSchema"], (metadata)=>{
        if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision || JSON.stringify(metadata.scopes) !== JSON.stringify(preview.scopes) || metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) || Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new OverviewCSVChangedError();
    }, signal, 'Overview');
}
;
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessOverviewExport",
    ()=>BusinessOverviewExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-csv-review-dialog/report-csv-review-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview-export.client.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveOverviewCSV$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/save-report-csv.ts [app-ssr] (ecmascript) <export saveReportCSV as saveOverviewCSV>");
'use client';
;
;
;
;
;
function BusinessOverviewExport({ query, authority, onClose, onReload }) {
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const [resolved, setResolved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: '',
        state: {
            kind: 'loading'
        },
        denied: false
    });
    const key = JSON.stringify([
        query,
        retry
    ]);
    const result = resolved.key === key ? resolved : {
        state: {
            kind: 'loading'
        },
        denied: false,
        preview: undefined
    };
    const review = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const operation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined), active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
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
                const preview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadOverviewCSVPreview"])(query, authority, AbortSignal.any([
                    abort.signal,
                    AbortSignal.timeout(30000)
                ]));
                if (abort.signal.aborted) return;
                const id = crypto.randomUUID();
                review.current = {
                    id,
                    preview
                };
                const describe = (name, scope)=>`${name}: ${scope === null ? 'unavailable' : typeof scope === 'string' ? scope : `${scope.scope}${scope.archives ? ` (archives ${scope.archives})` : ''}`}`;
                setResolved({
                    key,
                    denied: false,
                    preview,
                    state: preview.count > preview.limits.rows ? {
                        kind: 'limit'
                    } : {
                        kind: 'ready',
                        preview: {
                            id,
                            reportLabel: 'Overview',
                            viewLabel: 'Authorized summary',
                            periodLabel: `${query.period.from} - ${query.period.to}`,
                            dateBasisLabel: 'Period and current snapshots',
                            timezone: preview.timezone,
                            filtersLabel: 'No filters',
                            scopeLabel: [
                                describe('Leads', preview.scopes.lead),
                                describe('Jobs', preview.scopes.job),
                                describe('Estimates', preview.scopes.estimate),
                                describe('Calendar', preview.scopes.calendar)
                            ].join('; '),
                            filename: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["overviewExportFilename"])(preview.today),
                            expectedRows: preview.count
                        }
                    }
                });
            } catch (failure) {
                if (abort.signal.aborted) return;
                setError(failure instanceof Error ? failure.message : 'Overview CSV preview could not be loaded.');
                setResolved({
                    key,
                    denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OverviewCSVDeniedError"],
                    state: {
                        kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OverviewCSVChangedError"] ? 'changed' : 'error'
                    }
                });
            }
        })();
        return ()=>abort.abort();
    }, [
        query,
        authority,
        key
    ]);
    const download = async (id)=>{
        const selected = review.current;
        if (pending || result.denied || !selected || selected.id !== id) throw new Error('Refresh the Overview CSV review.');
        const abort = new AbortController();
        operation.current = abort;
        const signal = AbortSignal.any([
            abort.signal,
            AbortSignal.timeout(selected.preview.limits.durationMs)
        ]);
        setPending(true);
        setError(undefined);
        try {
            const blob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["receiveOverviewCSV"])(selected.preview, signal);
            if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveOverviewCSV$3e$__["saveOverviewCSV"])(blob, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["overviewExportFilename"])(selected.preview.today));
            onClose();
        } catch (failure) {
            if (active.current) {
                if (failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OverviewCSVChangedError"] || failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OverviewCSVDeniedError"]) {
                    review.current = undefined;
                    setResolved({
                        key,
                        denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OverviewCSVDeniedError"],
                        state: {
                            kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OverviewCSVChangedError"] ? 'changed' : 'error'
                        }
                    });
                }
                setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.' : failure instanceof Error ? failure.message : 'Overview CSV could not be completed.');
            }
            throw failure;
        } finally{
            if (active.current) setPending(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportCsvReviewDialog"], {
        open: true,
        canExport: !result.denied,
        state: result.state,
        pending: pending,
        rowLimit: result.preview?.limits.rows,
        technicalLimits: result.preview?.limits,
        onClose: onClose,
        onDownload: download,
        onRefresh: ()=>{
            review.current = undefined;
            setError(undefined);
            setRetry((value)=>value + 1);
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: "Only export-authorized summary metrics are included. Unavailable sections are marked, not zero; export scopes may be narrower than the report. Current snapshots are not historical."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx",
                lineNumber: 77,
                columnNumber: 5
            }, this),
            result.preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: [
                    result.preview.coverage,
                    " Calendar Job scope:",
                    ' ',
                    result.preview.scopes.calendar?.jobs ?? 'unavailable',
                    "; Work Order scope:",
                    ' ',
                    result.preview.scopes.calendar?.workOrders ?? 'unavailable',
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx",
                lineNumber: 79,
                columnNumber: 24
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx",
                lineNumber: 82,
                columnNumber: 15
            }, this),
            (result.denied || result.state.kind === 'changed') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Reload report access",
                disabled: pending,
                onClick: ()=>{
                    onClose();
                    onReload();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx",
                lineNumber: 83,
                columnNumber: 60
            }, this),
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Cancel download",
                onClick: ()=>operation.current?.abort()
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx",
                lineNumber: 85,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx",
        lineNumber: 74,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessOverviewReadPage",
    ()=>BusinessOverviewReadPage,
    "BusinessOverviewRoute",
    ()=>BusinessOverviewRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/business-overview-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-button/seafoam-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$page$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview-page.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview-read.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/use-report-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/business-overview/business-overview-export.tsx [app-ssr] (ecmascript)");
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
;
function BusinessOverviewReadPage({ initial, onReload }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TemplateSession"], {
        initial: initial,
        parse: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$business$2d$overview$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewReadResultSchema"].parse,
        children: (result, template, run, revision)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BusinessOverviewPageHost, {
                initial: result,
                template: template,
                onTemplateRun: run,
                onReload: onReload
            }, revision, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                lineNumber: 21,
                columnNumber: 43
            }, this)
    }, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewScopeKey"])(initial)}:${JSON.stringify(initial.report)}`, false, {
        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
        lineNumber: 19,
        columnNumber: 10
    }, this);
}
function BusinessOverviewPageHost({ initial, onReload, template, onTemplateRun }) {
    const today = initial.report.today, timezone = initial.report.timezone, scopeKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewScopeKey"])(initial);
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(template?.configuration.period ?? {
        preset: 'custom',
        ...initial.query.period
    });
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, today, 'history').range;
        if (!range) throw new Error('Choose a valid historical Overview period.');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["businessOverviewRequest"])({
            workspaceId: initial.workspaceId,
            range
        });
    }, [
        initial.workspaceId,
        period,
        today
    ]);
    const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
    const validate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((raw)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptBusinessOverviewReadResponse"])(raw, {
            request,
            period,
            scopeKey,
            today,
            timezone
        });
    }, [
        request,
        period,
        scopeKey,
        today,
        timezone
    ]);
    const loaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReportRead"])({
        key,
        initial,
        validate,
        url: `/api/reports/overview?${new URLSearchParams({
            query: JSON.stringify(request)
        })}`,
        failureMessage: 'Business Overview could not be loaded. Try again.'
    });
    let state = {
        kind: loaded.pending ? 'loading' : 'error'
    };
    let error = loaded.key === key ? loaded.error : undefined;
    if (!loaded.pending && loaded.raw) {
        try {
            state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptBusinessOverviewReadResponse"])(loaded.raw, {
                request,
                period,
                scopeKey,
                today,
                timezone
            }).state;
        } catch (failure) {
            error = failure instanceof Error ? failure.message : 'Overview data is invalid. Reload the report.';
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid min-w-0 gap-3",
        children: [
            !(loaded.key === key && loaded.denied) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 pt-4 sm:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportTemplates"], {
                    area: "overview",
                    workspaceId: initial.workspaceId,
                    query: request,
                    period: period,
                    ready: !loaded.pending && !error && state.kind === 'ready',
                    active: template,
                    onRun: onTemplateRun
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                    lineNumber: 50,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                lineNumber: 49,
                columnNumber: 48
            }, this),
            !loaded.pending && !error && !!loaded.raw && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 pt-4 sm:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamButton"], {
                    label: "Preview CSV",
                    onClick: ()=>setExportOpen(true)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                    lineNumber: 54,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                lineNumber: 53,
                columnNumber: 51
            }, this),
            exportOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BusinessOverviewExport"], {
                query: request,
                authority: initial,
                onClose: ()=>setExportOpen(false),
                onReload: onReload
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                lineNumber: 56,
                columnNumber: 20
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid justify-items-start gap-3 px-4 pt-4 sm:px-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                        lineNumber: 58,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamButton"], {
                        label: "Reload report access",
                        onClick: onReload
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                        lineNumber: 59,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                lineNumber: 57,
                columnNumber: 15
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 px-4 pt-4 text-sm text-muted sm:px-8",
                children: "Detail navigation is not integrated yet. Metrics retain their native scope and date bases."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                lineNumber: 61,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$business$2d$overview$2f$business$2d$overview$2d$page$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BusinessOverviewPage"], {
                state: state,
                period: period,
                today: today,
                timezone: timezone,
                canRead: !(loaded.key === key && loaded.denied),
                canNavigateDetails: false,
                pending: loaded.pending,
                onPeriodApply: setPeriod,
                onRetry: ()=>setRetry((value)=>value + 1),
                onEvidence: ()=>{
                    throw new Error('Overview detail navigation is not integrated yet.');
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
                lineNumber: 62,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
        lineNumber: 48,
        columnNumber: 10
    }, this);
}
function BusinessOverviewRoute({ initial }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BusinessOverviewReadPage, {
        initial: initial,
        onReload: ()=>router.refresh()
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/business-overview/business-overview-read-page.tsx",
        lineNumber: 69,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_reports_business-overview_13femxk._.js.map