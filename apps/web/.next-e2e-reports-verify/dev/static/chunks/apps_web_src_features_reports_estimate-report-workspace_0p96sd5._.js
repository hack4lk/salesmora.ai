(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.validation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateMatchesReportFilters",
    ()=>estimateMatchesReportFilters,
    "validEstimateReportProjection",
    ()=>validEstimateReportProjection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$filters$2f$estimate$2d$report$2d$filters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-filters/estimate-report-filters.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-decisions-report/estimate-decisions-report.validation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$current$2d$report$2f$estimate$2d$current$2d$report$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-current-report/estimate-current-report.validation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$first$2d$quoted$2d$report$2f$estimate$2d$first$2d$quoted$2d$report$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-first-quoted-report/estimate-first-quoted-report.validation.ts [app-client] (ecmascript)");
;
;
;
;
;
function estimateMatchesReportFilters(attribution, filters) {
    return (filters.owners.length === 0 || filters.owners.includes(attribution.ownerKey)) && (filters.parents.length === 0 || filters.parents.includes(attribution.parentType));
}
function validEstimateReportProjection(projection, filters, options, scopeKey, canReadMoney, canReadHandoff) {
    if (!scopeKey.trim() || projection.scopeKey !== scopeKey || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$filters$2f$estimate$2d$report$2d$filters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateReportFilters"])(filters, options) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$filters$2f$estimate$2d$report$2d$filters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateReportFilters"])(projection.filters, options) || ![
        'owners',
        'parents'
    ].every((facet)=>filters[facet].length === projection.filters[facet].length && projection.filters[facet].every((value)=>filters[facet].includes(value)))) return false;
    if (projection.state.kind !== 'ready') return true;
    let familyIds;
    if (projection.view === 'decisions' && projection.state.kind === 'ready') {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateDecisionsResult"])(projection.state.result, canReadMoney)) return false;
        familyIds = projection.state.result.rows.map((row)=>row.familyId);
    } else if (projection.view === 'first-quoted' && projection.state.kind === 'ready') {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$first$2d$quoted$2d$report$2f$estimate$2d$first$2d$quoted$2d$report$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateFirstQuotedResult"])(projection.state.result)) return false;
        familyIds = projection.state.result.rows.map((row)=>row.familyId);
    } else if (projection.view === 'current' && projection.state.kind === 'ready') {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$current$2d$report$2f$estimate$2d$current$2d$report$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateCurrentResult"])(projection.state.result, canReadMoney, canReadHandoff)) return false;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$current$2d$report$2f$estimate$2d$current$2d$report$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateCurrentTotal"])(projection.state.result, canReadHandoff) === undefined) return true;
        familyIds = projection.state.result.rows.map((row)=>row.familyId);
        if (projection.state.result.selected === 'handoff' && projection.attribution.some((row)=>row.parentType !== 'lead')) return false;
    } else return false;
    return projection.attribution.length === familyIds.length && new Set(projection.attribution.map((row)=>row.familyId)).size === familyIds.length && projection.attribution.every((row)=>familyIds.includes(row.familyId) && row.ownerKey.trim() && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateParentTypes"].some((parent)=>parent === row.parentType) && (options.owners === undefined || options.owners.some((option)=>option.value === row.ownerKey)) && (options.parents === undefined || options.parents.some((option)=>option.value === row.parentType)) && estimateMatchesReportFilters(row, filters));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateReportWorkspace",
    ()=>EstimateReportWorkspace,
    "estimateReportViews",
    ()=>estimateReportViews
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/field-classes.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/help-tooltip/help-tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-decisions-report/estimate-decisions-report.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$current$2d$report$2f$estimate$2d$current$2d$report$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-current-report/estimate-current-report.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$first$2d$quoted$2d$report$2f$estimate$2d$first$2d$quoted$2d$report$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-first-quoted-report/estimate-first-quoted-report.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$filters$2f$estimate$2d$report$2d$filters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-filters/estimate-report-filters.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.validation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
const estimateReportViews = [
    'decisions',
    'first-quoted',
    'current'
];
const labels = {
    decisions: 'Period decisions and accepted value',
    'first-quoted': 'Period first-quoted families',
    current: 'Current quotes, expiry and Job handoff'
};
function EstimateReportWorkspace({ projection, availableViews, filters, filterOptions, scopeKey, filterState = 'ready', canRead, canReadCurrent, canReadMoney, canReadHandoff, canExport, canEdit, pending = false, onViewChange, onFiltersChange, onRetryFilters, onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }) {
    _s();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])();
    if (!canRead) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
        kind: "error",
        message: "Your current access does not allow the Estimates report workspace."
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
        lineNumber: 58,
        columnNumber: 24
    }, this);
    const context = projection.view === 'current' ? 'current' : 'period';
    const validViews = new Set(availableViews).size === availableViews.length && availableViews.every((view)=>estimateReportViews.some((known)=>known === view));
    const allowed = availableViews.includes(projection.view) && (context === 'period' || canReadCurrent);
    const validFilters = filterState === 'ready' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$filters$2f$estimate$2d$report$2d$filters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateReportFilters"])(filters[context], filterOptions);
    const validProjection = validFilters && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateReportProjection"])(projection, filters[context], filterOptions, scopeKey, canReadMoney, canReadHandoff);
    const actions = {
        canRead: true,
        canReadMoney,
        canExport,
        canEdit,
        pending,
        onEvidence,
        onRecord,
        onExport,
        onPageChange,
        onPageSizeChange,
        onRetry,
        onEdit
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "grid w-full min-w-0 gap-6 text-ink",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex min-w-0 flex-wrap items-start justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                id: `${id}-title`,
                                className: "m-0 text-2xl font-semibold",
                                children: "Estimates report"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                                lineNumber: 69,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HelpTooltip"], {
                                label: "About Estimates report workspace",
                                paragraphs: [
                                    "Period decisions use each family's latest issued revision and effective decision date; corrections/new issuance can restate earlier periods. Current quotes and handoff use business-local today, independently of the reporting period.",
                                    'Period/current filter drafts remain separate. Owner and parent filters use current surviving attribution of the selected issued revision, not a newer draft. Assigned authorization follows Job relationships, never owner selection.',
                                    'Only the selected view renders evidence. Hosts replace matching counts, frozen money and evidence together and reset pagination on view/filter/evidence changes. Money and complete Lead/Job handoff visibility are independent explicit grants.',
                                    'First-quoted families use their earliest persisted initial Send/Publish date, not resends or later revisions. They share period filters with decisions, but not the decision-date predicate or acceptance denominator. Dates and visible record navigation are host-owned. CSV and configuration remain deferred; production Reports access is disabled.'
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                                lineNumber: 70,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                        lineNumber: 68,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid w-full min-w-0 gap-2 sm:w-80",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: `${id}-view`,
                                className: "text-sm font-semibold",
                                children: "Report view"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                                lineNumber: 78,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: `${id}-view`,
                                value: projection.view,
                                disabled: pending || !validViews,
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClasses"]} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`,
                                onChange: (event)=>{
                                    const view = availableViews.find((view)=>view === event.target.value);
                                    if (!pending && validViews && view && (view !== 'current' || canReadCurrent)) onViewChange(view);
                                },
                                children: [
                                    !availableViews.includes(projection.view) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: projection.view,
                                        disabled: true,
                                        children: "Unavailable saved view"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                                        lineNumber: 85,
                                        columnNumber: 57
                                    }, this),
                                    [
                                        ...new Set(availableViews)
                                    ].map((view)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: view,
                                            disabled: view === 'current' && !canReadCurrent,
                                            children: labels[view]
                                        }, view, false, {
                                            fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                                            lineNumber: 86,
                                            columnNumber: 53
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                                lineNumber: 79,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                        lineNumber: 77,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                lineNumber: 67,
                columnNumber: 5
            }, this),
            !validViews ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: "Authorized Estimates report views are inconsistent. Retry the report."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                lineNumber: 90,
                columnNumber: 20
            }, this) : !allowed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: "The selected Estimates report view is no longer available under current access. Choose an authorized view."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                lineNumber: 91,
                columnNumber: 20
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$filters$2f$estimate$2d$report$2d$filters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EstimateReportFilters"], {
                        value: filters[context],
                        options: filterOptions,
                        context: context,
                        canRead: true,
                        state: filterState,
                        pending: pending,
                        onChange: (value)=>{
                            if (!pending) onFiltersChange(context, value);
                        },
                        onRetry: onRetryFilters
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    validFilters && (!validProjection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: "Estimates report results do not match the current filters, scope or authorized evidence. Retry the report."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                        lineNumber: 94,
                        columnNumber: 46
                    }, this) : projection.view === 'decisions' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$decisions$2d$report$2f$estimate$2d$decisions$2d$report$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EstimateDecisionsReport"], {
                        ...actions,
                        state: projection.state
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                        lineNumber: 95,
                        columnNumber: 47
                    }, this) : projection.view === 'first-quoted' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$first$2d$quoted$2d$report$2f$estimate$2d$first$2d$quoted$2d$report$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EstimateFirstQuotedReport"], {
                        ...actions,
                        state: projection.state
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                        lineNumber: 96,
                        columnNumber: 52
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$current$2d$report$2f$estimate$2d$current$2d$report$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EstimateCurrentReport"], {
                        ...actions,
                        canReadHandoff: canReadHandoff,
                        state: projection.state
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
                        lineNumber: 97,
                        columnNumber: 15
                    }, this))
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx",
        lineNumber: 66,
        columnNumber: 10
    }, this);
}
_s(EstimateReportWorkspace, "WhsuKpSQZEWeFcB7gWlfDRQktoQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = EstimateReportWorkspace;
var _c;
__turbopack_context__.k.register(_c, "EstimateReportWorkspace");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-read.adapter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptEstimateReadResponse",
    ()=>adaptEstimateReadResponse,
    "estimateReportEvidenceSelection",
    ()=>estimateReportEvidenceSelection,
    "estimateReportRequest",
    ()=>estimateReportRequest,
    "estimateReportScopeKey",
    ()=>estimateReportScopeKey,
    "initialEstimateEvidence",
    ()=>initialEstimateEvidence,
    "visibleEstimateRecord",
    ()=>visibleEstimateRecord
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-read.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.validation.ts [app-client] (ecmascript)");
;
;
;
const initialEstimateEvidence = {
    decisions: 'accepted',
    current: 'awaiting'
};
function estimateReportRequest(input) {
    const common = {
        workspaceId: input.workspaceId,
        filters: input.filters[input.view === 'current' ? 'current' : 'period'],
        page: input.page,
        pageSize: input.pageSize
    };
    if (input.view === 'current') return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportQuerySchema"].parse({
        ...common,
        view: 'estimate-current',
        selected: input.evidence.current
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportQuerySchema"].parse(input.view === 'decisions' ? {
        ...common,
        view: 'estimate-decisions',
        period: {
            from: input.range.from,
            to: input.range.to
        },
        selected: input.evidence.decisions
    } : {
        ...common,
        view: 'estimate-first-quoted',
        period: {
            from: input.range.from,
            to: input.range.to
        }
    });
}
function estimateReportScopeKey(result) {
    return JSON.stringify([
        result.workspaceId,
        result.viewerId,
        result.policyRevision,
        result.authority,
        result.exportAccess
    ]);
}
const decisionId = (selected)=>`estimate-decisions:${selected}`;
const currentId = (selected)=>`estimate-current:${selected}`;
const firstId = 'estimate-first-quoted';
function adaptEstimateReadResponse(raw, input) {
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportQuerySchema"].parse(input.request), parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportReadResultSchema"].safeParse(raw);
    if (!parsed.success) throw new Error('Estimates report data does not match the current request, authority or evidence. Reload the report.');
    const response = parsed.data, report = response.report;
    if (JSON.stringify(response.query) !== JSON.stringify(request) || estimateReportScopeKey(response) !== input.scopeKey || response.today !== input.today || report.timezone !== input.timezone) {
        throw new Error('Estimates report results no longer match this request or current authority. Reload the report.');
    }
    const snapshotLabel = `Current authorized Estimates / ${new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: report.timezone
    }).format(new Date(report.asOf))} (${report.timezone})`;
    const attribution = report.rows.map((row)=>({
            familyId: row.familyId,
            ownerKey: row.ownerKey,
            parentType: row.parentType
        }));
    const common = {
        filters: request.filters,
        scopeKey: input.scopeKey,
        attribution
    };
    let projection;
    if (report.view === 'estimate-current') {
        projection = {
            ...common,
            view: 'current',
            state: {
                kind: 'ready',
                result: {
                    ...report,
                    snapshotLabel,
                    evidenceIds: {
                        awaiting: currentId('awaiting'),
                        expired: currentId('expired')
                    },
                    handoff: report.handoff.kind === 'available' ? {
                        ...report.handoff,
                        evidenceId: currentId('handoff')
                    } : report.handoff
                }
            }
        };
    } else {
        const periodLabel = `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(report.from)} - ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(report.to)}, both dates included`;
        projection = report.view === 'estimate-decisions' ? {
            ...common,
            view: 'decisions',
            state: {
                kind: 'ready',
                result: {
                    ...report,
                    snapshotLabel,
                    periodLabel,
                    evidenceIds: {
                        accepted: decisionId('accepted'),
                        declined: decisionId('declined'),
                        decided: decisionId('decided')
                    }
                }
            }
        } : {
            ...common,
            view: 'first-quoted',
            state: {
                kind: 'ready',
                result: {
                    ...report,
                    snapshotLabel,
                    periodLabel,
                    evidenceId: firstId
                }
            }
        };
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validEstimateReportProjection"])(projection, request.filters, response.options, input.scopeKey, response.authority.money, response.authority.handoff)) {
        throw new Error('Estimates report filters, scope or evidence cannot be displayed consistently. Retry the report.');
    }
    return {
        projection,
        filterOptions: response.options
    };
}
function estimateReportEvidenceSelection(result, id) {
    const report = result.report;
    if (report.view === 'estimate-decisions') {
        const evidence = [
            'accepted',
            'declined',
            'decided'
        ].find((selected)=>decisionId(selected) === id);
        if (evidence) return {
            view: 'decisions',
            evidence
        };
    } else if (report.view === 'estimate-current') {
        const evidence = [
            'awaiting',
            'expired',
            ...report.handoff.kind === 'available' ? [
                'handoff'
            ] : []
        ].find((selected)=>currentId(selected) === id);
        if (evidence) return {
            view: 'current',
            evidence
        };
    } else if (id === firstId) return {
        view: 'first-quoted'
    };
    throw new Error('This Estimates evidence selection is unavailable.');
}
function visibleEstimateRecord(result, id) {
    return result.report.rows.find((row)=>row.recordId === id)?.recordId;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.client.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateCSVChangedError",
    ()=>EstimateCSVChangedError,
    "EstimateCSVDeniedError",
    ()=>EstimateCSVDeniedError,
    "estimateExportFilename",
    ()=>estimateExportFilename,
    "estimateExportInput",
    ()=>estimateExportInput,
    "estimateExportLabels",
    ()=>estimateExportLabels,
    "loadEstimateCSVPreview",
    ()=>loadEstimateCSVPreview,
    "receiveEstimateCSV",
    ()=>receiveEstimateCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-export.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/receive-report-csv.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/save-report-csv.ts [app-client] (ecmascript)");
;
;
const estimateExportLabels = {
    summary: 'Summary table',
    evidence: 'Selected evidence'
};
function estimateExportInput(query, dataset) {
    const { page, pageSize, ...unpaged } = query;
    void page;
    void pageSize;
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportExportInputSchema"].parse({
        dataset,
        query: unpaged
    });
}
function estimateExportFilename(input, today) {
    return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
class EstimateCSVChangedError extends Error {
    constructor(){
        super('Estimate export data or access changed. Refresh the preview and review again.');
    }
}
class EstimateCSVDeniedError extends Error {
    constructor(){
        super('This Estimate selection is unavailable under current export access. Change the selection or reload access.');
    }
}
async function responseError(response) {
    if ([
        401,
        403,
        404,
        423
    ].includes(response.status)) throw new EstimateCSVDeniedError();
    throw new Error(response.status === 422 ? 'Check the Estimate selection and technical CSV limits.' : 'Estimate CSV could not be completed. Try again.');
}
async function loadEstimateCSVPreview(input, authority, signal) {
    const access = authority.exportAccess;
    if (!access || input.query.view === 'estimate-current' && input.query.selected === 'handoff' && !access.handoff || access.scope === 'assigned_job' && input.query.filters.parents.includes('lead')) throw new EstimateCSVDeniedError();
    const response = await fetch('/api/reports/estimates/export/preview', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input),
        signal
    });
    if (!response.ok) return responseError(response);
    const preview = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportExportPreviewSchema"].parse(await response.json());
    if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId || preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision || preview.scope !== access.scope || preview.handoff !== access.handoff || preview.archiveVisibility !== (input.query.view === 'estimate-current' ? 'excluded' : authority.authority.archives) || preview.today !== authority.today || preview.timezone !== authority.report.timezone) throw new EstimateCSVChangedError();
    return preview;
}
async function receiveEstimateCSV(preview, signal) {
    const response = await fetch('/api/reports/estimates/export', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preview.input),
        signal
    });
    if (!response.ok) return responseError(response);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["receiveReportCSV"])(response, preview.columns, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$export$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportExportGenerationSchema"], (metadata)=>{
        if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision || metadata.scope !== preview.scope || metadata.handoff !== preview.handoff || metadata.archiveVisibility !== preview.archiveVisibility || metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone || metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) || Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new EstimateCSVChangedError();
    }, signal, 'Estimate');
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateExport",
    ()=>EstimateExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/field-classes.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-csv-review-dialog/report-csv-review-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.client.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveEstimateCSV$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/save-report-csv.ts [app-client] (ecmascript) <export saveReportCSV as saveEstimateCSV>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function EstimateExport({ request, authority, onClose, onReload }) {
    _s();
    const [dataset, setDataset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('summary');
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const [resolved, setResolved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: '',
        state: {
            kind: 'loading'
        },
        denied: false
    });
    const review = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const operation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(undefined), active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EstimateExport.useEffect": ()=>{
            active.current = true;
            return ({
                "EstimateExport.useEffect": ()=>{
                    active.current = false;
                    operation.current?.abort();
                }
            })["EstimateExport.useEffect"];
        }
    }["EstimateExport.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EstimateExport.useEffect": ()=>{
            const abort = new AbortController();
            operation.current = abort;
            review.current = undefined;
            void ({
                "EstimateExport.useEffect": async ()=>{
                    try {
                        const preview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadEstimateCSVPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateExportInput"])(request, dataset), authority, AbortSignal.any([
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
                                    reportLabel: 'Estimates',
                                    viewLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateExportLabels"][dataset],
                                    periodLabel: 'period' in request ? `${request.period.from} - ${request.period.to}` : 'As of now',
                                    dateBasisLabel: preview.dateBasis,
                                    timezone: preview.timezone,
                                    filtersLabel: `Owners: ${request.filters.owners.length || 'all authorized'}; parents: ${request.filters.parents.join(', ') || 'all authorized'}`,
                                    scopeLabel: `${preview.scope}; archived records ${preview.archiveVisibility}`,
                                    filename: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateExportFilename"])(preview.input, preview.today),
                                    expectedRows: preview.count
                                }
                            }
                        });
                    } catch (failure) {
                        if (abort.signal.aborted) return;
                        setResolved({
                            key,
                            denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EstimateCSVDeniedError"],
                            state: {
                                kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EstimateCSVChangedError"] ? 'changed' : 'error'
                            }
                        });
                        setError(failure instanceof Error ? failure.message : 'Estimate CSV preview could not be loaded.');
                    }
                }
            })["EstimateExport.useEffect"]();
            return ({
                "EstimateExport.useEffect": ()=>abort.abort()
            })["EstimateExport.useEffect"];
        }
    }["EstimateExport.useEffect"], [
        request,
        authority,
        dataset,
        key
    ]);
    const download = async (id)=>{
        const selected = review.current;
        if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Estimate CSV review.');
        const abort = new AbortController();
        operation.current = abort;
        const signal = AbortSignal.any([
            abort.signal,
            AbortSignal.timeout(selected.preview.limits.durationMs)
        ]);
        setPending(true);
        setError(undefined);
        try {
            const blob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["receiveEstimateCSV"])(selected.preview, signal);
            if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveEstimateCSV$3e$__["saveEstimateCSV"])(blob, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateExportFilename"])(selected.preview.input, selected.preview.today));
            onClose();
        } catch (failure) {
            if (active.current) {
                if (failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EstimateCSVChangedError"] || failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EstimateCSVDeniedError"]) {
                    review.current = undefined;
                    setResolved({
                        key,
                        denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EstimateCSVDeniedError"],
                        state: {
                            kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EstimateCSVChangedError"] ? 'changed' : 'error'
                        }
                    });
                }
                setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.' : failure instanceof Error ? failure.message : 'Estimate CSV could not be completed.');
            }
            throw failure;
        } finally{
            if (active.current) setPending(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReportCsvReviewDialog"], {
        open: true,
        canExport: !!authority.exportAccess && !current.denied,
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "grid min-w-0 gap-2 text-sm font-semibold",
                children: [
                    "CSV dataset",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClasses"]} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`,
                        value: dataset,
                        disabled: pending,
                        onChange: (event)=>{
                            const next = event.target.value;
                            if (next !== 'summary' && next !== 'evidence') throw new Error('Invalid Estimate CSV dataset.');
                            if (next === dataset) return;
                            review.current = undefined;
                            setError(undefined);
                            setDataset(next);
                        },
                        children: [
                            'summary',
                            'evidence'
                        ].map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateExportLabels"][value]
                            }, value, false, {
                                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                                lineNumber: 88,
                                columnNumber: 58
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                        lineNumber: 81,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                lineNumber: 80,
                columnNumber: 5
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                lineNumber: 91,
                columnNumber: 15
            }, this),
            (current.denied || current.state.kind === 'changed') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Reload report access",
                disabled: pending,
                onClick: ()=>{
                    onClose();
                    onReload();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                lineNumber: 92,
                columnNumber: 62
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: "Export access may cover fewer Estimates than this report. Unverified frozen values and unavailable handoff evidence are not treated as zero."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                lineNumber: 94,
                columnNumber: 5
            }, this),
            current.metadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: [
                    "Snapshot: ",
                    current.metadata.asOf,
                    ". ",
                    current.metadata.coverage
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                lineNumber: 96,
                columnNumber: 26
            }, this),
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Cancel download",
                onClick: ()=>operation.current?.abort()
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
                lineNumber: 97,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx",
        lineNumber: 75,
        columnNumber: 10
    }, this);
}
_s(EstimateExport, "zA8OV8gmQa29s81fr+xL1QDWDVk=");
_c = EstimateExport;
var _c;
__turbopack_context__.k.register(_c, "EstimateExport");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateReportPage",
    ()=>EstimateReportPage,
    "EstimateReportRoute",
    ()=>EstimateReportRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/estimate-read.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-button/seafoam-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$workspace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-workspace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-read.adapter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/use-report-read.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-export.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-templates/report-templates.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-templates/template-session.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
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
function EstimateReportPage({ initial, onRecord, onReload }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TemplateSession"], {
        initial: initial,
        parse: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportReadResultSchema"].parse,
        children: (result, template, run, revision)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EstimateReportPageHost, {
                initial: result,
                template: template,
                onTemplateRun: run,
                onRecord: onRecord,
                onReload: onReload
            }, revision, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                lineNumber: 22,
                columnNumber: 43
            }, this)
    }, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportScopeKey"])(initial)}:${initial.report.asOf}`, false, {
        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
        lineNumber: 21,
        columnNumber: 10
    }, this);
}
_c = EstimateReportPage;
function EstimateReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }) {
    _s();
    const today = initial.today, timezone = initial.report.timezone, scopeKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportScopeKey"])(initial);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial.query.view === 'estimate-decisions' ? 'decisions' : initial.query.view === 'estimate-first-quoted' ? 'first-quoted' : 'current');
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(template?.configuration.period ?? ('period' in initial.query ? {
        preset: 'custom',
        ...initial.query.period
    } : {
        preset: 'custom',
        from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addCalendarDays"])(today, -29),
        to: today
    }));
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        period: initial.query.view === 'estimate-current' ? {
            owners: [],
            parents: []
        } : initial.query.filters,
        current: initial.query.view === 'estimate-current' ? initial.query.filters : {
            owners: [],
            parents: []
        }
    });
    const [evidence, setEvidence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        decisions: initial.query.view === 'estimate-decisions' ? initial.query.selected : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialEstimateEvidence"].decisions,
        current: initial.query.view === 'estimate-current' ? initial.query.selected : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialEstimateEvidence"].current
    });
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial.query.page), [pageSize, setPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial.query.pageSize);
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EstimateReportPageHost.useMemo[range]": ()=>{
            const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, today, 'history').range;
            if (!resolved) throw new Error('Choose a valid Estimates report period.');
            return {
                from: resolved.from,
                to: resolved.to
            };
        }
    }["EstimateReportPageHost.useMemo[range]"], [
        period,
        today
    ]);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EstimateReportPageHost.useMemo[request]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportRequest"])({
                workspaceId: initial.workspaceId,
                view,
                filters,
                range,
                evidence,
                page,
                pageSize
            })
    }["EstimateReportPageHost.useMemo[request]"], [
        initial.workspaceId,
        view,
        filters,
        range,
        evidence,
        page,
        pageSize
    ]);
    const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
    const validate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EstimateReportPageHost.useCallback[validate]": (raw)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adaptEstimateReadResponse"])(raw, {
                request,
                scopeKey,
                today,
                timezone
            });
        }
    }["EstimateReportPageHost.useCallback[validate]"], [
        request,
        scopeKey,
        today,
        timezone
    ]);
    const loaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReportRead"])({
        key,
        initial,
        validate,
        url: `/api/reports/estimates?${new URLSearchParams({
            query: JSON.stringify(request)
        })}`,
        failureMessage: 'Estimates report could not be loaded. Try again.'
    });
    let projection = {
        view,
        filters: filters[view === 'current' ? 'current' : 'period'],
        scopeKey,
        attribution: [],
        state: {
            kind: loaded.pending ? 'loading' : 'error'
        }
    };
    let adapted;
    let raw;
    let error = loaded.key === key ? loaded.error : undefined;
    if (!loaded.pending && loaded.raw) {
        try {
            adapted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adaptEstimateReadResponse"])(loaded.raw, {
                request,
                scopeKey,
                today,
                timezone
            });
            raw = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$estimate$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportReadResultSchema"].parse(loaded.raw);
            projection = adapted.projection;
        } catch (failure) {
            error = failure instanceof Error ? failure.message : 'Estimates report data is invalid. Reload the report.';
        }
    }
    const denied = loaded.key === key && loaded.denied;
    const reset = ()=>{
        setPage(1);
        setEvidence(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialEstimateEvidence"]);
    };
    const unavailable = ()=>{
        throw new Error('Estimates report export and configuration are not integrated yet.');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "grid min-w-0 gap-6 p-4 sm:p-8",
        children: [
            !denied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReportTemplates"], {
                area: "estimates",
                workspaceId: initial.workspaceId,
                query: request,
                period: 'period' in request ? period : null,
                ready: !loaded.pending && !error && !!raw,
                active: template,
                onRun: onTemplateRun
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                lineNumber: 73,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid justify-items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                        lineNumber: 76,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SeafoamButton"], {
                        label: "Reload report access",
                        onClick: onReload
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                        lineNumber: 76,
                        columnNumber: 52
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                lineNumber: 75,
                columnNumber: 15
            }, this),
            !denied && view !== 'current' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReportDateControls"], {
                value: period,
                context: "history",
                today: today,
                timezone: timezone,
                pending: loaded.pending,
                onApply: (value)=>{
                    setPeriod(value);
                    reset();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                lineNumber: 78,
                columnNumber: 39
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$workspace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EstimateReportWorkspace"], {
                projection: projection,
                availableViews: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$report$2d$workspace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportViews"],
                filters: filters,
                scopeKey: scopeKey,
                filterOptions: error ? {} : adapted?.filterOptions ?? {},
                filterState: loaded.pending ? 'loading' : error ? 'error' : 'ready',
                canRead: !denied,
                canReadCurrent: !denied,
                canReadMoney: !!raw?.authority.money,
                canReadHandoff: !!raw?.authority.handoff,
                canExport: !loaded.pending && !error && !!raw?.exportAccess,
                canEdit: false,
                pending: loaded.pending,
                onViewChange: (next)=>{
                    setView(next);
                    reset();
                },
                onFiltersChange: (context, value)=>{
                    setFilters((previous)=>({
                            ...previous,
                            [context]: value
                        }));
                    reset();
                },
                onRetryFilters: ()=>setRetry((value)=>value + 1),
                onRetry: ()=>setRetry((value)=>value + 1),
                onEvidence: (id)=>{
                    if (loaded.pending || !raw) return;
                    const selected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["estimateReportEvidenceSelection"])(raw, id);
                    if (selected.view !== 'first-quoted') setEvidence((previous)=>selected.view === 'decisions' ? {
                            ...previous,
                            decisions: selected.evidence
                        } : {
                            ...previous,
                            current: selected.evidence
                        });
                    setPage(1);
                },
                onRecord: (id)=>{
                    if (!loaded.pending && raw) {
                        const visible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$read$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["visibleEstimateRecord"])(raw, id);
                        if (visible) onRecord(visible);
                    }
                },
                onExport: ()=>setExportOpen(true),
                onEdit: unavailable,
                onPageChange: setPage,
                onPageSizeChange: (size)=>{
                    setPageSize(size);
                    setPage(1);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                lineNumber: 80,
                columnNumber: 5
            }, this),
            exportOpen && raw && !loaded.pending && !error && raw.exportAccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$estimate$2d$report$2d$workspace$2f$estimate$2d$export$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EstimateExport"], {
                request: request,
                authority: raw,
                onClose: ()=>setExportOpen(false),
                onReload: onReload
            }, `${scopeKey}:${JSON.stringify(request)}`, false, {
                fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
                lineNumber: 102,
                columnNumber: 76
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
        lineNumber: 72,
        columnNumber: 10
    }, this);
}
_s(EstimateReportPageHost, "z2h0+SQgoHLHZRc7i1oAPwRMfLI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReportRead"]
    ];
});
_c1 = EstimateReportPageHost;
function EstimateReportRoute({ initial }) {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EstimateReportPage, {
        initial: initial,
        onReload: ()=>router.refresh(),
        onRecord: (id)=>router.push(`/estimates/${encodeURIComponent(id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/estimate-report-workspace/estimate-report-page.tsx",
        lineNumber: 109,
        columnNumber: 10
    }, this);
}
_s1(EstimateReportRoute, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c2 = EstimateReportRoute;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "EstimateReportPage");
__turbopack_context__.k.register(_c1, "EstimateReportPageHost");
__turbopack_context__.k.register(_c2, "EstimateReportRoute");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_features_reports_estimate-report-workspace_0p96sd5._.js.map