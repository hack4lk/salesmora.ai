module.exports = [
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.validation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validCalendarReportProjection",
    ()=>validCalendarReportProjection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$filters$2f$calendar$2d$report$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-filters/calendar-report-filters.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$scheduled$2d$report$2f$calendar$2d$scheduled$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-scheduled-report/calendar-scheduled-report.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$review$2d$report$2f$calendar$2d$review$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-review-report/calendar-review-report.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$unscheduled$2d$report$2f$calendar$2d$unscheduled$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-unscheduled-report/calendar-unscheduled-report.validation.ts [app-ssr] (ecmascript)");
;
;
;
;
function validCalendarReportProjection(projection, filters, options, scope, scopeKey, range) {
    if (!scopeKey.trim() || projection.scopeKey !== scopeKey || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$filters$2f$calendar$2d$report$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarReportFilters"])(filters, options, scope) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$filters$2f$calendar$2d$report$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarReportFilters"])(projection.filters, options, scope) || ![
        'participants',
        'recordTypes'
    ].every((facet)=>filters[facet].length === projection.filters[facet].length && projection.filters[facet].every((value)=>filters[facet].includes(value)))) return false;
    if (projection.state.kind !== 'ready') return true;
    let visits;
    if (projection.view === 'scheduled' && projection.state.kind === 'ready') {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$scheduled$2d$report$2f$calendar$2d$scheduled$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarScheduledResult"])(projection.state.result)) return false;
        visits = projection.state.result.evidence.kind === 'visits' ? projection.state.result.evidence.rows : [];
    } else if (projection.view === 'review' && projection.state.kind === 'ready') {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$review$2d$report$2f$calendar$2d$review$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarReviewResult"])(projection.state.result)) return false;
        visits = projection.state.result.visits;
    } else if (projection.view === 'unscheduled' && projection.state.kind === 'ready') {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$unscheduled$2d$report$2f$calendar$2d$unscheduled$2d$report$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarUnscheduledResult"])(projection.state.result)) return false;
        visits = projection.state.result.visits;
    } else return false;
    const result = projection.state.result;
    if (result.scope.kind !== scope.kind || scope.kind === 'own' && (result.scope.kind !== 'own' || result.scope.viewerId !== scope.viewerId) || result.members.some((member)=>options.participants !== undefined && !options.participants.some((option)=>option.value === member.id) || filters.participants.length > 0 && !filters.participants.includes(member.id))) return false;
    if (projection.view !== 'unscheduled' && projection.state.kind === 'ready' && (projection.state.result.from !== range.from || projection.state.result.to !== range.to)) return false;
    return projection.attribution.length === visits.length && new Set(projection.attribution.map((row)=>row.visitId)).size === visits.length && projection.attribution.every((row)=>{
        const visit = visits.find((visit)=>visit.id === row.visitId);
        if (!visit || row.records.length !== visit.records.length || new Set(row.records.map((record)=>JSON.stringify([
                record.type,
                record.id
            ]))).size !== row.records.length) return false;
        const union = new Set(row.records.flatMap((record)=>record.participantIds));
        return union.size === visit.participantIds.length && visit.participantIds.every((id)=>union.has(id)) && row.records.every((record)=>visit.records.some((observed)=>observed.type === record.type && observed.id === record.id) && (options.recordTypes === undefined || options.recordTypes.some((option)=>option.value === record.type)) && (filters.recordTypes.length === 0 || filters.recordTypes.includes(record.type)) && new Set(record.participantIds).size === record.participantIds.length && (filters.participants.length === 0 || record.participantIds.length > 0) && record.participantIds.every((id)=>result.members.some((member)=>member.id === id) && (filters.participants.length === 0 || filters.participants.includes(id)) && (scope.kind !== 'own' || id === scope.viewerId)) && (scope.kind !== 'own' || record.participantIds.length === 1));
    });
}
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarReportWorkspace",
    ()=>CalendarReportWorkspace,
    "calendarReportViews",
    ()=>calendarReportViews
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/field-classes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/help-tooltip/help-tooltip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$scheduled$2d$report$2f$calendar$2d$scheduled$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-scheduled-report/calendar-scheduled-report.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$review$2d$report$2f$calendar$2d$review$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-review-report/calendar-review-report.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$unscheduled$2d$report$2f$calendar$2d$unscheduled$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-unscheduled-report/calendar-unscheduled-report.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$filters$2f$calendar$2d$report$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-filters/calendar-report-filters.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.validation.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
const calendarReportViews = [
    'scheduled',
    'review',
    'unscheduled'
];
const labels = {
    scheduled: 'Scheduled visits and workload',
    review: 'Schedule review',
    unscheduled: 'Unscheduled queues'
};
function CalendarReportWorkspace({ projection, availableViews, filters, filterOptions, scope, scopeKey, range, filterState = 'ready', canRead, canExport, canEdit, canOpenCalendar, pending = false, onViewChange, onFiltersChange, onRetryFilters, onEvidence, onCalendar, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    if (!canRead) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
        kind: "error",
        message: "Your current access does not allow the Calendar report workspace."
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
        lineNumber: 53,
        columnNumber: 24
    }, this);
    const context = projection.view === 'unscheduled' ? 'unscheduled' : 'dated';
    const validViews = new Set(availableViews).size === availableViews.length && availableViews.every((view)=>calendarReportViews.some((known)=>known === view));
    const allowed = availableViews.includes(projection.view);
    const validFilters = filterState === 'ready' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$filters$2f$calendar$2d$report$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarReportFilters"])(filters[context], filterOptions, scope);
    const validProjection = validFilters && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarReportProjection"])(projection, filters[context], filterOptions, scope, scopeKey, range);
    const actions = {
        canRead: true,
        canExport,
        canEdit,
        canOpenCalendar,
        pending,
        onEvidence,
        onCalendar,
        onRecord,
        onExport,
        onPageChange,
        onPageSizeChange,
        onRetry,
        onEdit
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "grid w-full min-w-0 gap-6 text-ink",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex min-w-0 flex-wrap items-start justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                id: `${id}-title`,
                                className: "m-0 text-2xl font-semibold",
                                children: "Calendar report"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                                lineNumber: 65,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HelpTooltip"], {
                                label: "About Calendar report workspace",
                                paragraphs: [
                                    'All views describe the current authorized schedule, not scheduling history or attendance. Scheduled visits and schedule review share exact visit dates and a dated filter draft. Unscheduled queues have an independent current draft and no date predicate.',
                                    'Match authorized active records by type first, then current participants from those records. Keep matching canonical visits distinct; withhold unrelated records and crew. Selected people bound person, busy person-day and overlap projections. Work Order access never grants parent-Job access; own scope shows Me only.',
                                    'Only one selected view and supporting-evidence table render. Hosts filter the full source before aggregation/pagination and replace counts and evidence together. View, filters, dates and evidence changes reset the page; page-size changes reset the page too.',
                                    'Calendar links and permitted record links are independent of report access. Drill-through does not promise scheduling permission. Dates, queries, CSV review and navigation remain host-owned; production routes and APIs are not enabled.'
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                                lineNumber: 66,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                        lineNumber: 64,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid w-full min-w-0 gap-2 sm:w-80",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: `${id}-view`,
                                className: "text-sm font-semibold",
                                children: "Report view"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                                lineNumber: 74,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: `${id}-view`,
                                value: projection.view,
                                disabled: pending || !validViews,
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClasses"]} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`,
                                onChange: (event)=>{
                                    const view = availableViews.find((view)=>view === event.target.value);
                                    if (!pending && validViews && view) onViewChange(view);
                                },
                                children: [
                                    !availableViews.includes(projection.view) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: projection.view,
                                        disabled: true,
                                        children: "Unavailable saved view"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                                        lineNumber: 81,
                                        columnNumber: 57
                                    }, this),
                                    [
                                        ...new Set(availableViews)
                                    ].map((view)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: view,
                                            children: labels[view]
                                        }, view, false, {
                                            fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                                            lineNumber: 82,
                                            columnNumber: 53
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                                lineNumber: 75,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                        lineNumber: 73,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                lineNumber: 63,
                columnNumber: 5
            }, this),
            !validViews ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: "Authorized Calendar report views are inconsistent. Retry the report."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                lineNumber: 86,
                columnNumber: 20
            }, this) : !allowed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: "The selected Calendar report view is no longer available under current access. Choose an authorized view."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                lineNumber: 87,
                columnNumber: 20
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$filters$2f$calendar$2d$report$2d$filters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarReportFilters"], {
                        value: filters[context],
                        options: filterOptions,
                        context: context,
                        scope: scope,
                        canRead: true,
                        state: filterState,
                        pending: pending,
                        onChange: (value)=>{
                            if (!pending) onFiltersChange(context, value);
                        },
                        onRetry: onRetryFilters
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    validFilters && (!validProjection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: "Calendar report results do not match the current filters, dates, scope or authorized evidence. Retry the report."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                        lineNumber: 90,
                        columnNumber: 46
                    }, this) : projection.view === 'scheduled' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$scheduled$2d$report$2f$calendar$2d$scheduled$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarScheduledReport"], {
                        ...actions,
                        state: projection.state
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                        lineNumber: 91,
                        columnNumber: 47
                    }, this) : projection.view === 'review' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$review$2d$report$2f$calendar$2d$review$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarReviewReport"], {
                        ...actions,
                        state: projection.state
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                        lineNumber: 92,
                        columnNumber: 46
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$unscheduled$2d$report$2f$calendar$2d$unscheduled$2d$report$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarUnscheduledReport"], {
                        ...actions,
                        state: projection.state
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
                        lineNumber: 93,
                        columnNumber: 17
                    }, this))
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx",
        lineNumber: 62,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptCalendarReportResponse",
    ()=>adaptCalendarReportResponse,
    "calendarReportRequest",
    ()=>calendarReportRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-scheduled.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-review.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-unscheduled.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-filters.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.validation.ts [app-ssr] (ecmascript)");
;
;
;
const contextFor = (view)=>view === 'unscheduled' ? 'unscheduled' : 'dated';
function calendarReportRequest(input) {
    const filters = input.filters[contextFor(input.view)];
    const common = {
        workspaceId: input.workspaceId,
        filters,
        page: input.page,
        pageSize: input.pageSize
    };
    switch(input.view){
        case 'scheduled':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduledQuerySchema"].parse({
                ...common,
                view: 'calendar-scheduled',
                period: {
                    from: input.range.from,
                    to: input.range.to
                },
                selected: input.evidence.scheduled
            });
        case 'review':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReviewQuerySchema"].parse({
                ...common,
                view: 'calendar-review',
                period: {
                    from: input.range.from,
                    to: input.range.to
                },
                selected: input.evidence.review
            });
        case 'unscheduled':
            return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarUnscheduledQuerySchema"].parse({
                ...common,
                view: 'calendar-unscheduled',
                selected: input.evidence.unscheduled
            });
    }
}
function attribution(visits) {
    return visits.map((visit)=>({
            visitId: visit.id,
            records: visit.records.map((record)=>{
                if (!record.participantIds) throw new Error('Calendar report record attribution is missing. Retry the report.');
                return {
                    id: record.id,
                    type: record.type,
                    participantIds: record.participantIds
                };
            })
        }));
}
function adaptCalendarReportResponse(raw, rawOptions, input) {
    const options = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$filters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportFilterOptionsResultSchema"].parse(rawOptions);
    const request = input.request.view === 'calendar-scheduled' ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduledQuerySchema"].parse(input.request) : input.request.view === 'calendar-review' ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReviewQuerySchema"].parse(input.request) : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarUnscheduledQuerySchema"].parse(input.request);
    const context = request.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated';
    if (options.workspaceId !== request.workspaceId || options.context !== context || !input.scopeKey.trim()) {
        throw new Error('Calendar report options do not match the current workspace or view. Retry the report.');
    }
    const result = request.view === 'calendar-scheduled' ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$scheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduledResultSchema"].parse(raw) : request.view === 'calendar-review' ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$review$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReviewResultSchema"].parse(raw) : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$unscheduled$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarUnscheduledResultSchema"].parse(raw);
    if (result.workspaceId !== request.workspaceId || result.view !== request.view || result.evidence.kind !== request.selected || result.pageSize !== request.pageSize || result.page !== Math.min(request.page, Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)))) {
        throw new Error('Calendar report response does not match the selected request. Retry the report.');
    }
    const snapshotLabel = `Current authorized schedule / ${new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: result.timezone
    }).format(new Date(result.asOf))} (${result.timezone})`;
    const common = {
        scopeKey: input.scopeKey,
        filters: result.filters
    };
    let projection;
    if (result.view === 'calendar-scheduled') {
        projection = {
            ...common,
            view: 'scheduled',
            attribution: attribution(result.evidence.kind === 'visits' ? result.evidence.rows : []),
            state: {
                kind: 'ready',
                result: {
                    ...result,
                    snapshotLabel,
                    periodLabel: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(result.from)} - ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(result.to)}`,
                    evidenceIds: {
                        visits: 'scheduled-visits',
                        busyPersonDays: 'busy-person-days'
                    }
                }
            }
        };
    } else if (result.view === 'calendar-review') {
        projection = {
            ...common,
            view: 'review',
            attribution: attribution(result.visits),
            state: {
                kind: 'ready',
                result: {
                    ...result,
                    snapshotLabel,
                    periodLabel: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(result.from)} - ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatReportDate"])(result.to)}`,
                    evidenceIds: {
                        overlaps: 'overlapping-pairs',
                        past: 'past-visits'
                    }
                }
            }
        };
    } else {
        projection = {
            ...common,
            view: 'unscheduled',
            attribution: attribution(result.visits),
            state: {
                kind: 'ready',
                result: {
                    ...result,
                    snapshotLabel,
                    evidenceIds: {
                        visits: 'unscheduled-visits',
                        jobs: 'unscheduled-jobs',
                        workOrders: 'unscheduled-work-orders'
                    }
                }
            }
        };
    }
    const range = 'period' in request ? request.period : {
        from: result.today,
        to: result.today
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCalendarReportProjection"])(projection, request.filters, options, options.scope, input.scopeKey, range)) {
        throw new Error('Calendar report results do not match the current filters, dates, scope or record attribution. Retry the report.');
    }
    return {
        projection,
        filterOptions: options
    };
}
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-read.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptCalendarReadResponse",
    ()=>adaptCalendarReadResponse,
    "calendarReportScopeKey",
    ()=>calendarReportScopeKey,
    "visibleCalendarRecord",
    ()=>visibleCalendarRecord
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.adapter.ts [app-ssr] (ecmascript)");
;
;
function calendarReportScopeKey(result) {
    return JSON.stringify([
        result.workspaceId,
        result.viewerId,
        result.policyRevision,
        result.scope,
        result.canExport,
        result.exportScopes
    ]);
}
function adaptCalendarReadResponse(raw, input) {
    const request = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportQuerySchema"].parse(input.request), response = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportReadResultSchema"].parse(raw);
    if (JSON.stringify(response.query) !== JSON.stringify(request) || calendarReportScopeKey(response) !== input.scopeKey || response.report.today !== input.today || response.report.timezone !== input.timezone) {
        throw new Error('Calendar report results no longer match this request or current authority. Reload the report.');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptCalendarReportResponse"])(response.report, response.options, {
        request,
        scopeKey: input.scopeKey
    });
}
function visibleCalendarRecord(result, id) {
    const report = result.report;
    const visits = report.view === 'calendar-scheduled' ? report.evidence.kind === 'visits' ? report.evidence.rows : [] : report.visits;
    return visits.flatMap((visit)=>visit.records).find((record)=>record.recordId === id);
}
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.client.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarCSVChangedError",
    ()=>CalendarCSVChangedError,
    "CalendarCSVDeniedError",
    ()=>CalendarCSVDeniedError,
    "calendarExportDatasetsForView",
    ()=>calendarExportDatasetsForView,
    "calendarExportFilename",
    ()=>calendarExportFilename,
    "calendarExportInput",
    ()=>calendarExportInput,
    "calendarExportLabels",
    ()=>calendarExportLabels,
    "loadCalendarCSVPreview",
    ()=>loadCalendarCSVPreview,
    "receiveCalendarCSV",
    ()=>receiveCalendarCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-export.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/receive-report-csv.ts [app-ssr] (ecmascript)");
;
;
const calendarExportLabels = {
    summary: 'Summary table',
    days: 'Daily visits table',
    'person-days': 'Participant workload table',
    visits: 'Full visit evidence',
    'busy-person-days': 'Busy person-day evidence',
    overlaps: 'Overlap person-pair evidence',
    past: 'Past scheduled visit evidence',
    jobs: 'Unscheduled Job evidence',
    workOrders: 'Unscheduled Work Order evidence'
};
function calendarExportDatasetsForView(view) {
    return view === 'calendar-scheduled' ? [
        'summary',
        'days',
        'person-days',
        'visits',
        'busy-person-days'
    ] : view === 'calendar-review' ? [
        'summary',
        'overlaps',
        'past'
    ] : [
        'summary',
        'visits',
        'jobs',
        'workOrders'
    ];
}
function calendarExportInput(query, dataset) {
    const { page, pageSize, ...unpaged } = query;
    void page;
    void pageSize;
    const selected = query.view === 'calendar-scheduled' ? dataset === 'person-days' || dataset === 'busy-person-days' ? 'busy-person-days' : 'visits' : query.view === 'calendar-review' ? dataset === 'past' ? 'past' : 'overlaps' : dataset === 'jobs' || dataset === 'workOrders' ? dataset : 'visits';
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarExportInputSchema"].parse({
        dataset,
        query: {
            ...unpaged,
            selected
        }
    });
}
function calendarExportFilename(input, today) {
    return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
class CalendarCSVChangedError extends Error {
    constructor(){
        super('Calendar export data or access changed. Refresh the preview and review again.');
    }
}
class CalendarCSVDeniedError extends Error {
    constructor(){
        super('This Calendar export is unavailable under current access.');
    }
}
async function responseError(response) {
    if ([
        401,
        403,
        404,
        423
    ].includes(response.status)) throw new CalendarCSVDeniedError();
    throw new Error(response.status === 422 ? 'Check the Calendar selection and technical CSV limits.' : 'Calendar CSV could not be completed. Try again.');
}
async function loadCalendarCSVPreview(input, authority, signal) {
    const response = await fetch('/api/reports/calendar/export/preview', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input),
        signal
    });
    if (!response.ok) return responseError(response);
    const preview = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarExportPreviewSchema"].parse(await response.json());
    if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId || preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision || JSON.stringify(preview.scope) !== JSON.stringify(authority.scope) || JSON.stringify(preview.outputScopes) !== JSON.stringify(authority.exportScopes) || preview.today !== authority.report.today || preview.timezone !== authority.report.timezone || !authority.canExport) {
        throw new CalendarCSVChangedError();
    }
    return preview;
}
async function receiveCalendarCSV(preview, signal) {
    const response = await fetch('/api/reports/calendar/export', {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preview.input),
        signal
    });
    if (!response.ok) return responseError(response);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$receive$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["receiveReportCSV"])(response, preview.columns, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$export$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarExportGenerationSchema"], (metadata)=>{
        if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision || JSON.stringify(metadata.scope) !== JSON.stringify(preview.scope) || JSON.stringify(metadata.outputScopes) !== JSON.stringify(preview.outputScopes) || metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone || metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) || Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new CalendarCSVChangedError();
    }, signal, 'Calendar');
}
;
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarExport",
    ()=>CalendarExport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$field$2d$classes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/field-classes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-csv-review-dialog/report-csv-review-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.client.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveCalendarCSV$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/save-report-csv.ts [app-ssr] (ecmascript) <export saveReportCSV as saveCalendarCSV>");
'use client';
;
;
;
;
;
function CalendarExport({ request, authority, onClose, onReload }) {
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
                const preview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadCalendarCSVPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarExportInput"])(request, dataset), authority, AbortSignal.any([
                    abort.signal,
                    AbortSignal.timeout(30000)
                ]));
                if (abort.signal.aborted) return;
                const id = crypto.randomUUID();
                review.current = {
                    id,
                    preview
                };
                const scopes = preview.outputScopes;
                const scopeLabel = `${preview.scope.kind}; Jobs ${scopes.jobs.kind === 'available' ? scopes.jobs.scope : 'unavailable'}; ` + `Work Orders ${scopes.workOrders.kind === 'available' ? scopes.workOrders.scope : 'unavailable'}`;
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
                            reportLabel: 'Calendar',
                            viewLabel: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarExportLabels"][dataset],
                            periodLabel: 'period' in preview.input.query ? `${preview.input.query.period.from} - ${preview.input.query.period.to}` : 'As of now',
                            dateBasisLabel: preview.dateBasis === 'current-unscheduled' ? 'Current unscheduled work' : 'Current scheduled visit date',
                            timezone: preview.timezone,
                            filtersLabel: `Participants: ${request.filters.participants.length || 'all authorized'}; ` + `record types: ${request.filters.recordTypes.join(', ') || 'all export-authorized'}`,
                            scopeLabel,
                            filename: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarExportFilename"])(preview.input, preview.today),
                            expectedRows: preview.count
                        }
                    }
                });
            } catch (failure) {
                if (abort.signal.aborted) return;
                setResolved({
                    key,
                    denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CalendarCSVDeniedError"],
                    state: {
                        kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CalendarCSVChangedError"] ? 'changed' : 'error'
                    }
                });
                setError(failure instanceof Error ? failure.message : 'Calendar CSV preview could not be loaded.');
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
        if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Calendar CSV review.');
        const abort = new AbortController();
        operation.current = abort;
        const signal = AbortSignal.any([
            abort.signal,
            AbortSignal.timeout(selected.preview.limits.durationMs)
        ]);
        setPending(true);
        setError(undefined);
        try {
            const blob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["receiveCalendarCSV"])(selected.preview, signal);
            if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$save$2d$report$2d$csv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__saveReportCSV__as__saveCalendarCSV$3e$__["saveCalendarCSV"])(blob, (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarExportFilename"])(selected.preview.input, selected.preview.today));
            onClose();
        } catch (failure) {
            if (active.current) {
                if (failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CalendarCSVChangedError"] || failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CalendarCSVDeniedError"]) {
                    review.current = undefined;
                    setResolved({
                        key,
                        denied: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CalendarCSVDeniedError"],
                        state: {
                            kind: failure instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CalendarCSVChangedError"] ? 'changed' : 'error'
                        }
                    });
                }
                setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.' : failure instanceof Error ? failure.message : 'Calendar CSV could not be completed.');
            }
            throw failure;
        } finally{
            if (active.current) setPending(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$csv$2d$review$2d$dialog$2f$report$2d$csv$2d$review$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportCsvReviewDialog"], {
        open: true,
        canExport: authority.canExport && !current.denied,
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
                            const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarExportDatasetsForView"])(request.view).find((value)=>value === event.target.value);
                            if (!next) throw new Error('Invalid Calendar CSV dataset.');
                            if (next === dataset) return;
                            review.current = undefined;
                            setError(undefined);
                            setDataset(next);
                        },
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarExportDatasetsForView"])(request.view).map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarExportLabels"][value]
                            }, value, false, {
                                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                                lineNumber: 92,
                                columnNumber: 67
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                        lineNumber: 85,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                lineNumber: 84,
                columnNumber: 5
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                lineNumber: 95,
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
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                lineNumber: 96,
                columnNumber: 62
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: "Shared visits count once. Participant workload and overlap person-pairs are non-additive. Past schedules do not prove missed attendance. Unavailable parent-domain totals are blank, not zero."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                lineNumber: 98,
                columnNumber: 5
            }, this),
            current.metadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: [
                    "Snapshot: ",
                    current.metadata.asOf,
                    ". ",
                    current.metadata.coverage
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                lineNumber: 100,
                columnNumber: 26
            }, this),
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamOutlineButton"], {
                label: "Cancel download",
                onClick: ()=>operation.current?.abort()
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
                lineNumber: 101,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx",
        lineNumber: 79,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarReportPage",
    ()=>CalendarReportPage,
    "CalendarReportRoute",
    ()=>CalendarReportRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/reports/calendar-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/calendar/dates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-button/seafoam-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-workspace.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-read.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/report-date-controls/report-date-controls.validation.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/reports/period.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/use-report-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-export.tsx [app-ssr] (ecmascript)");
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
;
;
const defaults = {
    scheduled: 'visits',
    review: 'overlaps',
    unscheduled: 'visits'
};
function CalendarReportPage({ initial, onRecord, onReload }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$template$2d$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TemplateSession"], {
        initial: initial,
        parse: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportReadResultSchema"].parse,
        children: (result, template, run, revision)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarReportPageHost, {
                initial: result,
                template: template,
                onTemplateRun: run,
                onRecord: onRecord,
                onReload: onReload
            }, revision, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                lineNumber: 25,
                columnNumber: 43
            }, this)
    }, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportScopeKey"])(initial)}:${initial.report.asOf}`, false, {
        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
function CalendarReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }) {
    const today = initial.report.today, timezone = initial.report.timezone, scopeKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportScopeKey"])(initial);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.view === 'calendar-scheduled' ? 'scheduled' : initial.query.view === 'calendar-review' ? 'review' : 'unscheduled');
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(template?.configuration.period ?? ('period' in initial.query ? {
        preset: 'custom',
        ...initial.query.period
    } : {
        preset: 'custom',
        from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarWeekStart"])(today),
        to: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addCalendarDays"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$calendar$2f$dates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarWeekStart"])(today), 6)
    }));
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        dated: initial.query.view === 'calendar-unscheduled' ? {
            participants: [],
            recordTypes: []
        } : initial.query.filters,
        unscheduled: initial.query.view === 'calendar-unscheduled' ? initial.query.filters : {
            participants: [],
            recordTypes: []
        }
    });
    const [evidence, setEvidence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        scheduled: initial.query.view === 'calendar-scheduled' ? initial.query.selected : defaults.scheduled,
        review: initial.query.view === 'calendar-review' ? initial.query.selected : defaults.review,
        unscheduled: initial.query.view === 'calendar-unscheduled' ? initial.query.selected : defaults.unscheduled
    });
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.page), [pageSize, setPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.query.pageSize);
    const [retry, setRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [exportOpen, setExportOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$reports$2f$period$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveReportPeriod"])(period, today, 'calendar').range;
        if (!resolved) throw new Error('Choose a valid Calendar report period.');
        return {
            from: resolved.from,
            to: resolved.to
        };
    }, [
        period,
        today
    ]);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportRequest"])({
            workspaceId: initial.workspaceId,
            view,
            filters,
            range,
            evidence,
            page,
            pageSize
        }), [
        initial.workspaceId,
        view,
        filters,
        range,
        evidence,
        page,
        pageSize
    ]);
    const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
    const validate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((raw)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptCalendarReadResponse"])(raw, {
            request,
            scopeKey,
            today,
            timezone
        });
    }, [
        request,
        scopeKey,
        today,
        timezone
    ]);
    const loaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$use$2d$report$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReportRead"])({
        key,
        initial,
        validate,
        url: `/api/reports/calendar?${new URLSearchParams({
            query: JSON.stringify(request)
        })}`,
        failureMessage: 'Calendar report could not be loaded. Try again.'
    });
    let projection = {
        view,
        state: {
            kind: loaded.pending ? 'loading' : 'error'
        },
        filters: filters[view === 'unscheduled' ? 'unscheduled' : 'dated'],
        scopeKey,
        attribution: []
    };
    let adapted;
    let raw;
    let error = loaded.key === key ? loaded.error : undefined;
    if (!loaded.pending && loaded.raw) {
        try {
            adapted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptCalendarReadResponse"])(loaded.raw, {
                request,
                scopeKey,
                today,
                timezone
            });
            raw = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$reports$2f$calendar$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportReadResultSchema"].parse(loaded.raw);
            projection = adapted.projection;
        } catch (failure) {
            error = failure instanceof Error ? failure.message : 'Calendar report data is invalid. Reload the report.';
        }
    }
    const denied = loaded.key === key && loaded.denied;
    const reset = ()=>{
        setPage(1);
        setEvidence(defaults);
    };
    const unavailable = ()=>{
        throw new Error('Calendar report export, configuration and Calendar deep links are not integrated yet.');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "grid min-w-0 gap-6 p-4 sm:p-8",
        children: [
            !denied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$templates$2f$report$2d$templates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportTemplates"], {
                area: "calendar",
                workspaceId: initial.workspaceId,
                query: request,
                period: 'period' in request ? period : null,
                ready: !loaded.pending && !error && !!raw,
                active: template,
                onRun: onTemplateRun
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                lineNumber: 76,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid justify-items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                        lineNumber: 79,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SeafoamButton"], {
                        label: "Reload report access",
                        onClick: onReload
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                        lineNumber: 79,
                        columnNumber: 52
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                lineNumber: 78,
                columnNumber: 15
            }, this),
            !denied && view !== 'unscheduled' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$report$2d$date$2d$controls$2f$report$2d$date$2d$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReportDateControls"], {
                value: period,
                context: "calendar",
                today: today,
                timezone: timezone,
                pending: loaded.pending,
                onApply: (value)=>{
                    setPeriod(value);
                    reset();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                lineNumber: 81,
                columnNumber: 43
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarReportWorkspace"], {
                projection: projection,
                availableViews: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$report$2d$workspace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarReportViews"],
                filters: filters,
                filterOptions: error ? {} : adapted?.filterOptions ?? {},
                filterState: loaded.pending ? 'loading' : error ? 'error' : 'ready',
                scope: initial.scope,
                scopeKey: scopeKey,
                range: range,
                canRead: !denied,
                canExport: !loaded.pending && !error && !!raw?.canExport,
                canEdit: false,
                canOpenCalendar: false,
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
                    if (loaded.pending || !adapted) return;
                    if (view === 'scheduled' && [
                        'scheduled-visits',
                        'busy-person-days'
                    ].includes(id)) {
                        setEvidence((previous)=>({
                                ...previous,
                                scheduled: id === 'busy-person-days' ? 'busy-person-days' : 'visits'
                            }));
                    } else if (view === 'review' && [
                        'overlapping-pairs',
                        'past-visits'
                    ].includes(id)) {
                        setEvidence((previous)=>({
                                ...previous,
                                review: id === 'past-visits' ? 'past' : 'overlaps'
                            }));
                    } else if (view === 'unscheduled' && [
                        'unscheduled-visits',
                        'unscheduled-jobs',
                        'unscheduled-work-orders'
                    ].includes(id)) {
                        setEvidence((previous)=>({
                                ...previous,
                                unscheduled: id === 'unscheduled-jobs' ? 'jobs' : id === 'unscheduled-work-orders' ? 'workOrders' : 'visits'
                            }));
                    } else throw new Error('This Calendar evidence selection is unavailable.');
                    setPage(1);
                },
                onRecord: (id)=>{
                    if (!loaded.pending && raw) {
                        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$read$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["visibleCalendarRecord"])(raw, id);
                        if (record) onRecord({
                            id: record.id,
                            type: record.type
                        });
                    }
                },
                onCalendar: unavailable,
                onExport: ()=>setExportOpen(true),
                onEdit: unavailable,
                onPageChange: setPage,
                onPageSizeChange: (size)=>{
                    setPageSize(size);
                    setPage(1);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                lineNumber: 83,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: "Calendar-opening actions are not integrated yet. Visible record links retain their current authorized record type."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                lineNumber: 104,
                columnNumber: 5
            }, this),
            exportOpen && raw && !loaded.pending && !error && raw.canExport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$reports$2f$calendar$2d$report$2d$workspace$2f$calendar$2d$export$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarExport"], {
                request: request,
                authority: raw,
                onClose: ()=>setExportOpen(false),
                onReload: onReload
            }, `${scopeKey}:${JSON.stringify(request)}`, false, {
                fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
                lineNumber: 105,
                columnNumber: 73
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
        lineNumber: 75,
        columnNumber: 10
    }, this);
}
function CalendarReportRoute({ initial }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarReportPage, {
        initial: initial,
        onReload: ()=>router.refresh(),
        onRecord: (record)=>router.push(`/${record.type === 'job' ? 'jobs' : 'work-orders'}/${encodeURIComponent(record.id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/reports/calendar-report-workspace/calendar-report-page.tsx",
        lineNumber: 112,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_reports_calendar-report-workspace_046.bbn._.js.map