module.exports = [
"[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressSteps",
    ()=>ProgressSteps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function ProgressSteps({ steps, currentStep, completedSteps = [], onStepClick, clickable = false, ariaLabel = 'Progress steps' }) {
    const currentIndex = steps.findIndex((s)=>s.id === currentStep);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        "aria-label": ariaLabel,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
            className: "m-0 grid list-none p-0 gap-2 sm:gap-3",
            style: {
                gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`
            },
            children: steps.map((step, index)=>{
                const isCurrent = currentStep === step.id;
                const isCompleted = completedSteps.includes(step.id);
                const isPast = index < currentIndex;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    "aria-current": isCurrent ? 'step' : undefined,
                    className: "min-w-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            "aria-label": `${index + 1}. ${step.label}`,
                            disabled: !clickable || !isCurrent && !isCompleted && !isPast,
                            onClick: ()=>onStepClick?.(step.id),
                            className: `flex h-full min-h-16 w-full min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-b-[3px] px-1 py-3 text-center text-base leading-tight font-bold focus-visible:focus-ring enabled:cursor-pointer disabled:cursor-default sm:flex-row sm:gap-3 sm:px-3 sm:text-lg transition-colors ${isCurrent ? 'border-primary border-b-primary-dark bg-seafoam text-ink' : isPast ? 'border-primary/35 border-b-primary bg-primary/10 text-primary-dark enabled:hover:bg-primary/15' : 'border-line bg-paper text-ink'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    "aria-hidden": "true",
                                    className: `grid size-8 shrink-0 place-items-center rounded-full border text-sm sm:size-9 sm:text-base ${isCurrent ? 'border-current' : isPast ? 'border-primary text-primary-dark' : 'border-line text-muted'}`,
                                    children: index + 1
                                }, void 0, false, {
                                    fileName: "[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx",
                                    lineNumber: 59,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "wrap-anywhere",
                                    children: step.label
                                }, void 0, false, {
                                    fileName: "[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx",
                                    lineNumber: 71,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx",
                            lineNumber: 46,
                            columnNumber: 15
                        }, this),
                        step.id !== currentStep && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "sr-only",
                            children: isPast ? 'completed' : 'upcoming'
                        }, void 0, false, {
                            fileName: "[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx",
                            lineNumber: 73,
                            columnNumber: 43
                        }, this)
                    ]
                }, step.id, true, {
                    fileName: "[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx",
                    lineNumber: 45,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}),
"[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$layout$2f$account$2d$layout$2f$account$2d$layout$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/layout/account-layout/account-layout.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$text$2d$field$2f$text$2d$field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/text-field/text-field.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$password$2d$field$2f$password$2d$field$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/password-field/password-field.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$styles$2f$brand$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/styles/brand-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$styles$2f$theme$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/styles/theme.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$submit$2d$button$2f$submit$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/submit-button/submit-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$button$2f$seafoam$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-button/seafoam-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$seafoam$2d$outline$2d$button$2f$seafoam$2d$outline$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/seafoam-outline-button/seafoam-outline-button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$terms$2d$acceptance$2f$terms$2d$acceptance$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/terms-acceptance/terms-acceptance.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$layout$2f$workspace$2d$navigation$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/layout/workspace-navigation/workspace-navigation.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$icons$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/icons/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$assistant$2d$panel$2f$assistant$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/assistant-panel/assistant-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$draft$2d$card$2f$lead$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-draft-card/lead-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$data$2d$table$2f$data$2d$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/data-table/data-table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$progress$2d$steps$2f$progress$2d$steps$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/progress-steps/progress-steps.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$layout$2f$side$2d$drawer$2f$side$2d$drawer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/layout/side-drawer/side-drawer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$confirm$2d$dialog$2f$confirm$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/confirm-dialog/confirm-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/status-badge/status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$filter$2d$chip$2f$filter$2d$chip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/filter-chip/filter-chip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$filter$2d$bar$2f$filter$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/filter-bar/filter-bar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$pagination$2f$pagination$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/pagination/pagination.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$toast$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/toast/toast.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$feedback$2f$help$2d$tooltip$2f$help$2d$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/feedback/help-tooltip/help-tooltip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$context$2d$chip$2f$context$2d$chip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/context-chip/context-chip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$stage$2d$draft$2d$card$2f$lead$2d$stage$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-stage-draft-card/lead-stage-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$update$2d$draft$2d$card$2f$lead$2d$update$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-update-draft-card/lead-update-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$assignment$2d$draft$2d$card$2f$lead$2d$assignment$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-assignment-draft-card/lead-assignment-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$note$2d$draft$2d$card$2f$lead$2d$note$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-note-draft-card/lead-note-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$archive$2d$draft$2d$card$2f$lead$2d$archive$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-archive-draft-card/lead-archive-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$export$2d$draft$2d$card$2f$lead$2d$export$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-export-draft-card/lead-export-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$delete$2d$draft$2d$card$2f$lead$2d$delete$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-delete-draft-card/lead-delete-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$search$2d$results$2d$card$2f$lead$2d$search$2d$results$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-search-results-card/lead-search-results-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$details$2d$card$2f$lead$2d$details$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-details-card/lead-details-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$lead$2d$activity$2d$card$2f$lead$2d$activity$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/lead-activity-card/lead-activity-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$metric$2d$card$2f$metric$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/metric-card/metric-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/money-text/money-text.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$customer$2d$draft$2d$card$2f$customer$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/customer-draft-card/customer-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$record$2d$results$2d$card$2f$record$2d$results$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/record-results-card/record-results-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$candidate$2d$picker$2f$candidate$2d$picker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/candidate-picker/candidate-picker.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$customer$2d$export$2d$draft$2d$card$2f$customer$2d$export$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/customer-export-draft-card/customer-export-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$work$2d$order$2d$draft$2d$card$2f$work$2d$order$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/work-order-draft-card/work-order-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$estimate$2d$draft$2d$card$2f$estimate$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/estimate-draft-card/estimate-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$estimate$2d$draft$2d$card$2f$estimate$2d$draft$2d$card$2e$preview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/estimate-draft-card/estimate-draft-card.preview.ts [app-ssr] (ecmascript)");
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
;
;
;
;
}),
"[project]/packages/contracts/src/lead-capture/timing.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Shared wall-clock resolver: reject invalid zones, calendar dates, DST gaps and folds. */ __turbopack_context__.s([
    "resolveCaptureLocalTime",
    ()=>resolveCaptureLocalTime
]);
function resolveCaptureLocalTime(local, timezone) {
    let formatter;
    try {
        formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        });
    } catch  {
        return {
            error: 'zone'
        };
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return {
        error: 'date'
    };
    const [year, month, day, hour, minute] = local.split(/[-T:]/).map(Number), wall = Date.UTC(year, month - 1, day, hour, minute);
    if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 16) !== local) return {
        error: 'date'
    };
    const parts = (at)=>{
        const values = Object.fromEntries(formatter.formatToParts(at).map((part)=>[
                part.type,
                part.value
            ]));
        return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute));
    };
    const offsets = new Set();
    for(let hours = -36; hours <= 36; hours += 6){
        const at = wall + hours * 3600000;
        offsets.add(parts(at) - at);
    }
    const candidates = [
        ...offsets
    ].map((offset)=>wall - offset).filter((at)=>parts(at) === wall);
    return candidates.length === 1 ? {
        at: new Date(candidates[0]).toISOString()
    } : {
        error: candidates.length ? 'ambiguous' : 'gap'
    };
}
}),
"[project]/packages/contracts/src/lead-capture/setup-defaults.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialCaptureSetupConfiguration",
    ()=>initialCaptureSetupConfiguration
]);
function initialCaptureSetupConfiguration(type, business) {
    const workflow = {
        assignment: {
            kind: 'default'
        },
        stage: 'new',
        tags: [],
        notifyAssigned: true
    };
    if (type === 'gmail') return {
        schemaVersion: 1,
        type,
        rules: {
            phrases: [],
            location: 'both',
            mode: 'all'
        },
        workflow
    };
    const labels = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        service: 'Service requested',
        details: 'Project details',
        address: 'Service address'
    };
    return {
        schemaVersion: 1,
        type,
        brief: '',
        contactRequired: true,
        fields: Object.keys(labels).map((key)=>({
                id: key,
                key,
                label: labels[key],
                type: key === 'email' ? 'email' : key === 'phone' ? 'phone' : key === 'details' ? 'long_text' : key === 'address' ? 'address' : 'short_text',
                required: key === 'name' || key === 'service',
                options: []
            })),
        content: {
            businessName: business.businessName,
            businessEmail: business.businessEmail,
            businessPhone: business.businessPhone,
            title: 'Tell us about your project',
            intro: 'Share a few details and our team will be in touch.',
            submitLabel: 'Send request',
            thankYou: 'Thanks for your request. Our team will be in touch.',
            unavailableMessage: 'We are not accepting online requests right now. Please contact our team directly.',
            showBusinessEmail: false,
            showBusinessPhone: !!business.businessPhone,
            privacy: null,
            consent: null
        },
        workflow
    };
}
}),
"[project]/packages/domain/src/estimates/lead-stage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEstimateLeadStageTarget",
    ()=>getEstimateLeadStageTarget
]);
function getEstimateLeadStageTarget({ event, parentType, status, archived = false, canRead = false, lead }) {
    if (!canRead || parentType !== "lead" || archived || !lead?.canMove || lead.archived || lead.stage === "won" || lead.stage === "lost") return null;
    if (event?.kind === "send" && status === "sent" && (lead.stage === "new" || lead.stage === "contacted")) return "estimate-sent";
    if (event?.kind === "decision" && event.outcome === "declined" && event.previousOutcome !== "declined" && status === "declined") return "lost";
    return null;
}
}),
];

//# sourceMappingURL=packages_0a0l81k._.js.map