module.exports = [
"[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CaptureSourceProjection",
    ()=>CaptureSourceProjection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$cancel$2d$launch$2d$dialog$2f$capture$2d$cancel$2d$launch$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-cancel-launch-dialog/capture-cancel-launch-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$setup$2d$review$2f$capture$2d$setup$2d$review$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-setup-review/capture-setup-review.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$pause$2d$resume$2d$dialog$2f$capture$2d$pause$2d$resume$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-pause-resume-dialog/capture-pause-resume-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$archive$2d$restore$2d$dialog$2f$capture$2d$archive$2d$restore$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-archive-restore-dialog/capture-archive-restore-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$duplicate$2d$dialog$2f$capture$2d$duplicate$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-duplicate-dialog/capture-duplicate-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$launch$2d$change$2d$dialog$2f$capture$2d$launch$2d$change$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-launch-change-dialog/capture-launch-change-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$review$2d$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/connected/capture-review-adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$adapters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/connected/capture-adapters.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$connected$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/connected/capture-connected.data.ts [app-ssr] (ecmascript)");
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
function wall(at, timezone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(new Date(at)).map((part)=>[
            part.type,
            part.value
        ]));
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
function CaptureSourceProjection({ view, pending, onConfirm, onClose }) {
    const source = view.source.detail.source, op = view.ticket.operation, business = view.source.business, approved = view.source.detail.approved;
    const common = {
        open: true,
        canRead: true,
        pending,
        onClose,
        onConfirm: async ()=>onConfirm()
    };
    const timing = view.timing?.kind === 'scheduled' ? {
        mode: 'scheduled',
        localDateTime: wall(view.timing.at, view.timing.timezone)
    } : {
        mode: 'now',
        localDateTime: ''
    };
    if (op === 'publish') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$setup$2d$review$2f$capture$2d$setup$2d$review$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureSetupReview"], {
        draft: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$review$2d$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureReviewFrom"])(view.source),
        value: timing,
        canRead: true,
        canEdit: false,
        canLaunch: view.ready,
        pending: pending,
        timingReadOnly: true,
        onChange: ()=>{},
        onEdit: ()=>{},
        onLaunch: onConfirm
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
        lineNumber: 24,
        columnNumber: 12
    }, this);
    if (op === 'pause' || op === 'resume') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$pause$2d$resume$2d$dialog$2f$capture$2d$pause$2d$resume$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CapturePauseResumeDialog"], {
        ...common,
        action: op,
        source: {
            ...source,
            canPause: !!view.source.lifecycleReview?.canPause,
            canResume: !!view.source.lifecycleReview?.canResume,
            resumeReadiness: view.ready ? 'ready' : 'blocked',
            resumeReason: view.checks.filter((check)=>!check.ready).map((check)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$connected$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureConnectedData"].readiness[check.code]).join(' '),
            approved: approved ? [
                {
                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$connected$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureConnectedData"].approvedVersion,
                    value: String(approved.version)
                },
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$adapters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureConfigurationRows"])(approved.configuration, business)
            ] : []
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
        lineNumber: 26,
        columnNumber: 12
    }, this);
    if (op === 'archive' || op === 'restore') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$archive$2d$restore$2d$dialog$2f$capture$2d$archive$2d$restore$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureArchiveRestoreDialog"], {
        ...common,
        action: op,
        source: {
            ...source,
            canArchive: !!view.source.lifecycleReview?.canArchive,
            canRestore: !!view.source.lifecycleReview?.canRestore,
            restoreReadiness: view.ready ? 'ready' : 'blocked',
            restoreReason: view.checks.filter((check)=>!check.ready).map((check)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$connected$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureConnectedData"].readiness[check.code]).join(' ')
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
        lineNumber: 28,
        columnNumber: 12
    }, this);
    if (op === 'duplicate') {
        const selected = view.configurationKind === 'approved' ? approved : view.source.detail.draft;
        if (!selected || !view.copyName) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            role: "alert",
            children: "Select a saved configuration and a name before requesting a duplicate review."
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
            lineNumber: 32,
            columnNumber: 14
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$duplicate$2d$dialog$2f$capture$2d$duplicate$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureDuplicateDialog"], {
            ...common,
            nameReadOnly: true,
            name: view.copyName,
            onNameChange: ()=>{},
            source: {
                ...source,
                canDuplicate: true,
                readiness: view.ready ? 'ready' : 'blocked',
                configuration: {
                    kind: view.configurationKind,
                    version: selected.version,
                    summary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$adapters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureConfigurationRows"])(selected.configuration, business)
                }
            }
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
            lineNumber: 33,
            columnNumber: 12
        }, this);
    }
    const schedule = view.source.publicationReview?.pending;
    if (!schedule) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        role: "alert",
        children: "The pending launch is unavailable. Request a fresh review."
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
        lineNumber: 37,
        columnNumber: 12
    }, this);
    if (op === 'change_schedule') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$launch$2d$change$2d$dialog$2f$capture$2d$launch$2d$change$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureLaunchChangeDialog"], {
        ...common,
        timingReadOnly: true,
        value: timing,
        onChange: ()=>{},
        source: {
            ...source,
            pendingRevision: source.status === 'active',
            scheduledAt: schedule.at,
            timezone: schedule.timezone,
            canChange: true,
            readiness: view.ready ? 'ready' : 'blocked',
            reason: view.checks.filter((check)=>!check.ready).map((check)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$connected$2f$capture$2d$connected$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureConnectedData"].readiness[check.code]).join(' ')
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
        lineNumber: 39,
        columnNumber: 12
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$cancel$2d$launch$2d$dialog$2f$capture$2d$cancel$2d$launch$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureCancelLaunchDialog"], {
        open: true,
        source: source,
        pendingLaunch: schedule,
        canCancel: view.ready,
        pending: pending,
        onClose: onClose,
        onConfirm: onConfirm
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx",
        lineNumber: 40,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CaptureSetupProjection",
    ()=>CaptureSetupProjection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$form$2d$field$2d$editor$2f$capture$2d$form$2d$field$2d$editor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-form-field-editor/capture-form-field-editor.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$lead$2d$workflow$2f$capture$2d$lead$2d$workflow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-lead-workflow/capture-lead-workflow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$gmail$2d$field$2d$mapping$2f$gmail$2d$field$2d$mapping$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/gmail-field-mapping/gmail-field-mapping.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function CaptureSetupProjection({ view }) {
    const labels = {
        businessName: 'Business name',
        title: 'Form title',
        intro: 'Introduction',
        submitLabel: 'Submit button',
        thankYou: 'Thank-you message',
        unavailableMessage: 'Unavailable message',
        businessEmail: 'Business email',
        businessPhone: 'Business phone',
        showBusinessEmail: 'Show business email',
        showBusinessPhone: 'Show business phone',
        privacy: 'Privacy link',
        consent: 'Consent'
    };
    const { configuration: config, sample, findings, name, before } = view.review, workflow = config.workflow;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid min-w-0 gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm font-semibold wrap-anywhere",
                children: [
                    name,
                    " · ",
                    config.type === 'website' ? 'Website form' : 'Gmail capture'
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                lineNumber: 10,
                columnNumber: 46
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: [
                    'suggest_website_fields',
                    'suggest_workflow',
                    'extract_sample',
                    'refine_mapping'
                ].includes(view.ticket.operation) ? 'Confirmation applies suggestions to this unsaved setup. Save separately to keep the changes.' : view.ticket.operation === 'approve_sample' ? 'Confirmation retains this pasted sample and approved mapping for setup. Gmail connection and publication still require separate checks.' : 'Confirmation saves a source draft. Publication requires a separate review.'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                lineNumber: 11,
                columnNumber: 5
            }, this),
            before && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "min-h-11 cursor-pointer text-sm",
                        children: "Previously saved configuration"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                        lineNumber: 12,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm wrap-anywhere",
                        children: [
                            "Fields: ",
                            before.fields?.map((field)=>field.label).join(', ') || 'None',
                            ". Stage: ",
                            before.workflow?.stage ?? 'Not set',
                            ". Tags: ",
                            before.workflow?.tags.join(', ') || 'None',
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                        lineNumber: 12,
                        columnNumber: 118
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                lineNumber: 12,
                columnNumber: 16
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$form$2d$field$2d$editor$2f$capture$2d$form$2d$field$2d$editor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureFormFieldEditor"], {
                heading: config.type === 'gmail' ? 'Fields extracted from email' : undefined,
                description: config.type === 'gmail' ? 'Review field labels, types, choices and required settings.' : undefined,
                value: {
                    fields: config.fields ?? [],
                    contactRequired: config.contactRequired ?? true
                },
                canRead: true,
                canEdit: false,
                readOnlyMessage: "These are the exact reviewed fields.",
                onChange: ()=>{}
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                lineNumber: 13,
                columnNumber: 5
            }, this),
            workflow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$lead$2d$workflow$2f$capture$2d$lead$2d$workflow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureLeadWorkflow"], {
                value: {
                    assignment: workflow.assignment.kind,
                    teammateId: workflow.assignment.kind === 'teammate' ? workflow.assignment.teammateId : '',
                    stage: workflow.stage,
                    tagsText: workflow.tags.join(', '),
                    notifyAssigned: workflow.notifyAssigned
                },
                teammates: workflow.assignment.kind === 'teammate' ? [
                    {
                        id: workflow.assignment.teammateId,
                        name: workflow.assignment.teammateId
                    }
                ] : [],
                source: config.type,
                canRead: true,
                canEdit: false,
                readOnlyMessage: "Notifications apply only when a future active source admits a request.",
                onChange: ()=>{}
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                lineNumber: 14,
                columnNumber: 18
            }, this),
            config.type === 'website' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm whitespace-pre-wrap wrap-anywhere",
                        children: [
                            "Brief: ",
                            config.brief || 'Not set'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                        lineNumber: 15,
                        columnNumber: 37
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "m-0 grid gap-2",
                        children: Object.entries(config.content ?? {}).map(([key, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-xs text-muted",
                                        children: labels[key] ?? key
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                                        lineNumber: 15,
                                        columnNumber: 258
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 text-sm whitespace-pre-wrap wrap-anywhere",
                                        children: value && typeof value === 'object' ? 'href' in value ? `${value.label}: ${value.href}` : `${value.label} (${value.required ? 'Required' : 'Optional'})` : value === null ? 'Not set' : typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                                        lineNumber: 15,
                                        columnNumber: 318
                                    }, this)
                                ]
                            }, key, true, {
                                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                                lineNumber: 15,
                                columnNumber: 223
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                        lineNumber: 15,
                        columnNumber: 132
                    }, this)
                ]
            }, void 0, true),
            config.type === 'gmail' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm wrap-anywhere",
                        children: [
                            "Match ",
                            config.rules?.mode ?? 'all',
                            " phrases in ",
                            config.rules?.location ?? 'both',
                            ": ",
                            config.rules?.phrases.join(', ') || 'Not set'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                        lineNumber: 16,
                        columnNumber: 35
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted",
                        children: "A pasted sample does not connect a mailbox or send emails."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                        lineNumber: 16,
                        columnNumber: 206
                    }, this),
                    sample && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$gmail$2d$field$2d$mapping$2f$gmail$2d$field$2d$mapping$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GmailFieldMapping"], {
                        readOnlyMessage: "These are the exact findings prepared for confirmation. Apply them to the setup to make corrections.",
                        value: {
                            sampleId: sample.id,
                            sampleVersion: sample.version,
                            findings
                        },
                        sample: sample,
                        targets: (config.fields ?? []).map((field)=>({
                                ...field
                            })),
                        rules: {
                            location: config.rules?.location ?? 'both',
                            mode: config.rules?.mode ?? 'all',
                            phrases: (config.rules?.phrases ?? []).map((text, index)=>({
                                    id: `phrase-${index}`,
                                    text
                                }))
                        },
                        messages: [],
                        canRead: true,
                        canEdit: false,
                        onChange: ()=>{},
                        onBack: ()=>{},
                        onSend: async ()=>{},
                        onApprove: async ()=>{}
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
                        lineNumber: 16,
                        columnNumber: 313
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/capture-result/capture-result.validation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureAssistantReferenceKey",
    ()=>captureAssistantReferenceKey,
    "captureAssistantViewMatches",
    ()=>captureAssistantViewMatches
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/common.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-setup.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-sources.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$form$2d$field$2d$editor$2f$capture$2d$form$2d$field$2d$editor$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-form-field-editor/capture-form-field-editor.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$lead$2d$workflow$2f$capture$2d$lead$2d$workflow$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-lead-workflow/capture-lead-workflow.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$dashboard$2d$summary$2f$capture$2d$dashboard$2d$summary$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-dashboard-summary/capture-dashboard-summary.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$publication$2d$instructions$2f$capture$2d$publication$2d$instructions$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-publication-instructions/capture-publication-instructions.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$intake$2d$source$2d$evidence$2f$intake$2d$source$2d$evidence$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/intake-source-evidence/intake-source-evidence.validation.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
function captureAssistantReferenceKey(reference) {
    if (reference.kind === 'result') {
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureIdSchema"].parse(reference.workspaceId);
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureIdSchema"].parse(reference.resultId);
        if (!/^[a-f0-9]{64}$/.test(reference.snapshotHash)) throw Error('Invalid result binding.');
        return JSON.stringify([
            'result',
            reference.workspaceId,
            reference.resultId,
            reference.snapshotHash
        ]);
    }
    return JSON.stringify([
        'proposal',
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantProposalBindingSchema"].parse(reference.binding)
    ]);
}
function ticketBinding(ticket) {
    return {
        workspaceId: ticket.workspaceId,
        proposalId: ticket.proposalId,
        inputHash: ticket.inputHash,
        operation: ticket.operation,
        target: ticket.target,
        ...ticket.transition ? {
            transition: ticket.transition
        } : {}
    };
}
function captureAssistantViewMatches(reference, view) {
    try {
        if (captureAssistantReferenceKey(reference) !== captureAssistantReferenceKey(view.reference) || view.kind !== reference.kind || !Number.isFinite(Date.parse(view.retrievedAt))) return false;
        if (view.kind === 'result') {
            const content = view.content;
            switch(content.kind){
                case 'capture_read':
                    return reference.kind === 'result' && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureChatResultSchema"].safeParse(content.result).success && content.result.workspaceId === reference.workspaceId && content.result.id === reference.resultId;
                case 'sources':
                    new Intl.DateTimeFormat('en', {
                        timeZone: content.timezone
                    });
                    return content.rows.length <= 20 && Number.isSafeInteger(content.total) && content.total >= content.rows.length && new Set(content.rows.map((row)=>row.id)).size === content.rows.length && content.rows.every((row)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureIdSchema"].safeParse(row.id).success && !!row.name.trim() && [
                            'website',
                            'gmail'
                        ].includes(row.source) && [
                            'draft',
                            'active',
                            'paused',
                            'scheduled',
                            'archived'
                        ].includes(row.status) && Number.isSafeInteger(row.captured) && Number.isSafeInteger(row.awaitingReview) && row.captured >= row.awaitingReview && row.awaitingReview >= 0 && (!row.lastActivityAt || Number.isFinite(Date.parse(row.lastActivityAt))));
                case 'summary':
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$dashboard$2d$summary$2f$capture$2d$dashboard$2d$summary$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCaptureDashboardSource"])(content.source) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$dashboard$2d$summary$2f$capture$2d$dashboard$2d$summary$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCaptureSourceTotals"])(content.totals);
                case 'installation':
                    return content.publication === null || (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$publication$2d$instructions$2f$capture$2d$publication$2d$instructions$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validCapturePublication"])(content.publication);
                case 'intake_evidence':
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$intake$2d$source$2d$evidence$2f$intake$2d$source$2d$evidence$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validIntakeEvidenceSnapshot"])(content.snapshot);
            }
        }
        const ticket = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantProposalTicketSchema"].parse(view.ticket);
        if (reference.kind !== 'proposal' || captureAssistantReferenceKey({
            kind: 'proposal',
            binding: ticketBinding(ticket)
        }) !== captureAssistantReferenceKey(reference)) return false;
        const target = ticket.target, content = view.content;
        switch(content.kind){
            case 'source_action':
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureSourceProposalViewSchema"].safeParse(content.view).success && JSON.stringify(content.view.ticket) === JSON.stringify(ticket);
            case 'setup':
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureSetupViewSchema"].safeParse(content.view).success && JSON.stringify(content.view.ticket) === JSON.stringify(ticket);
            case 'fields':
                return ticket.operation === 'suggest_website_fields' && target.kind === 'source' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$form$2d$field$2d$editor$2f$capture$2d$form$2d$field$2d$editor$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateCaptureFormFields"])(content.value).length === 0;
            case 'workflow':
                return ticket.operation === 'suggest_workflow' && target.kind === 'source' && Object.keys((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$lead$2d$workflow$2f$capture$2d$lead$2d$workflow$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateCaptureLeadWorkflow"])(content.value, content.teammates)).length === 0;
            case 'publication':
                return ticket.operation === 'publish' && target.kind === 'source' && content.draft.id === target.sourceId && content.draft.version === target.draftVersion;
            case 'lifecycle':
                return ticket.operation === content.action && target.kind === 'source' && content.source.id === target.sourceId && content.source.version === target.sourceVersion;
            case 'intake':
                {
                    if (target.kind !== 'intake' || content.review.intakeId !== target.intakeId || content.review.intakeVersion !== target.intakeVersion || content.review.revision !== target.reviewId || content.review.definitionVersion !== target.definitionVersion || content.review.workflowVersion !== target.workflowVersion) return false;
                    const decision = content.review.decision, kind = typeof decision === 'string' ? decision : decision.kind;
                    const operations = {
                        create: 'create_lead',
                        separate: 'create_separate_lead',
                        link: 'link_lead',
                        dismiss: 'dismiss_intake'
                    };
                    return operations[kind] === ticket.operation && (kind !== 'link' || typeof decision !== 'string' && decision.kind === 'link' && target.lead?.leadId === decision.leadId && target.lead.leadVersion === decision.leadVersion);
                }
        }
    } catch  {
        return false;
    }
}
}),
"[project]/apps/web/src/features/assistant/capture-result/capture-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureAssistantResultData",
    ()=>captureAssistantResultData
]);
const captureAssistantResultData = {
    title: 'Lead Capture assistant result',
    loading: 'Checking this Lead Capture result…',
    unavailable: 'This result is unavailable. Reload it to check your current access.',
    stale: 'This review has changed or expired. Reload the latest review before continuing.',
    failed: 'The request could not be verified. Reload the review before trying again.',
    pending: 'Confirming your decision…',
    retry: 'Reload result',
    review: 'Review proposed change',
    close: 'Close review',
    cancel: 'Cancel proposal',
    confirm: 'Apply reviewed suggestions',
    draftNotice: 'These suggestions have not been applied. Review them before confirming.',
    fixedReview: 'This is a fixed proposal. Ask the assistant for a new proposal to change it.',
    publicationNotice: 'Launch timing is fixed to this proposal. Ask for a new proposal to change it.',
    cancelled: 'Proposal cancelled. No business change was made.',
    superseded: 'A newer proposal replaced this review.',
    expired: 'This proposal has expired. Ask for a new review.',
    completed: 'This proposal was confirmed. Reload to check its saved outcome.',
    open: 'Open record',
    captured: 'Retrieved',
    window: (shown, total)=>`Showing ${shown} of ${total} matching sources.`,
    stories: {
        notice: 'Fictional API responses. No AI request, source change, publication, intake decision or email is sent.',
        name: 'Fictional plumbing requests',
        saved: 'Suggested fields applied to the unsaved draft. Save the draft to persist them.',
        paused: 'Intake paused. Existing receipts are preserved.',
        launched: 'The reviewed website configuration was launched.',
        intakeSaved: 'The intake decision was saved.'
    }
};
}),
"[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CaptureReadProjection",
    ()=>CaptureReadProjection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$source$2d$list$2f$capture$2d$source$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-source-list/capture-source-list.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$dashboard$2d$summary$2f$capture$2d$dashboard$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-dashboard-summary/capture-dashboard-summary.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$source$2d$details$2f$capture$2d$source$2d$details$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-source-details/capture-source-details.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$publication$2d$instructions$2f$capture$2d$publication$2d$instructions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-publication-instructions/capture-publication-instructions.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$setup$2d$review$2f$capture$2d$readiness$2d$checks$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-setup-review/capture-readiness-checks.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-result.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const checkLabels = {
    configuration: 'Source configuration',
    fields: 'Capture fields',
    workflow: 'Lead workflow',
    access: 'Plan access',
    capacity: 'Published-source capacity',
    delivery: 'Delivery configuration',
    account: 'Gmail account',
    sample: 'Reviewed sample',
    permission: 'Launch permission',
    pending: 'Pending publication',
    workspace: 'Workspace state'
};
function CaptureReadProjection({ result, onOpen, onCopy }) {
    if (result.operation === 'sources') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-muted",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].window(result.rows.length, result.total)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
                lineNumber: 12,
                columnNumber: 48
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$source$2d$list$2f$capture$2d$source$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureSourceList"], {
                rows: result.rows.map((source)=>({
                        id: source.id,
                        name: source.name,
                        source: source.type,
                        status: source.status,
                        captured: source.metrics.captured,
                        awaitingReview: source.metrics.awaitingReview,
                        lastActivityAt: source.lastActivityAt,
                        allowedActions: []
                    })),
                timezone: result.timezone,
                view: result.filters.archived ? 'archived' : 'current',
                canRead: true,
                onAction: ()=>{},
                onOpen: (row)=>onOpen({
                        kind: 'source',
                        id: row.id
                    })
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
                lineNumber: 12,
                columnNumber: 137
            }, this)
        ]
    }, void 0, true);
    const source = result.operation === 'source_details' ? result.detail.source : result.source;
    const open = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        className: "min-h-11 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring",
        onClick: ()=>onOpen({
                kind: 'source',
                id: source.id
            }),
        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].open
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
        lineNumber: 14,
        columnNumber: 16
    }, this);
    const configuration = result.operation === 'source_details' ? result.detail.approved?.configuration ?? result.detail.draft?.configuration : undefined;
    const version = result.operation === 'source_details' ? result.detail.approved?.version ?? result.detail.draft?.version : undefined;
    const rows = configuration ? [
        {
            label: 'Fields',
            value: configuration.fields?.map((field)=>field.label).join(', ') || 'Not configured'
        },
        {
            label: 'Assignment',
            value: configuration.workflow?.assignment.kind === 'teammate' ? `Teammate ID: ${configuration.workflow.assignment.teammateId}` : configuration.workflow ? 'Business default' : 'Not configured'
        },
        {
            label: 'Starting stage',
            value: configuration.workflow?.stage ?? 'Not configured'
        },
        {
            label: 'Tags',
            value: configuration.workflow?.tags.join(', ') || 'None'
        },
        {
            label: 'Assignment notifications',
            value: configuration.workflow ? configuration.workflow.notifyAssigned ? 'Enabled, subject to teammate preferences' : 'Off' : 'Not configured'
        }
    ] : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$dashboard$2d$summary$2f$capture$2d$dashboard$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureDashboardSummary"], {
                source: {
                    ...source,
                    intakeBlocked: source.block !== 'none'
                },
                totals: source.metrics,
                canRead: true,
                canReadIntake: false,
                actions: open
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
                lineNumber: 24,
                columnNumber: 12
            }, this),
            result.operation === 'source_details' && configuration && version && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$source$2d$details$2f$capture$2d$source$2d$details$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureSourceDetails"], {
                        source: source,
                        configuration: {
                            kind: result.detail.approved ? 'approved' : 'draft',
                            version,
                            rows
                        },
                        availability: source.type === 'website' ? {
                            type: 'website',
                            status: result.installation ? result.installation.status === 'active' ? 'published' : 'unavailable' : 'unpublished'
                        } : {
                            type: 'gmail',
                            status: 'not-connected'
                        },
                        canRead: true,
                        canEdit: false,
                        canManageConnection: false,
                        canReadPublication: false
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
                        lineNumber: 25,
                        columnNumber: 77
                    }, this),
                    result.detail.approved && result.detail.draft && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: [
                            "A separate unpublished draft exists (version ",
                            result.detail.draft.version,
                            "). Open the source to review its changes."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
                        lineNumber: 25,
                        columnNumber: 558
                    }, this)
                ]
            }, void 0, true),
            result.operation === 'installation' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$publication$2d$instructions$2f$capture$2d$publication$2d$instructions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CapturePublicationInstructions"], {
                publication: result.installation,
                canRead: true,
                onCopy: onCopy
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
                lineNumber: 26,
                columnNumber: 45
            }, this),
            result.operation === 'publication_review' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$setup$2d$review$2f$capture$2d$readiness$2d$checks$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureReadinessChecks"], {
                checks: result.review.checks.map((check)=>({
                        id: check.code,
                        label: checkLabels[check.code],
                        status: check.ready ? 'ready' : 'blocked'
                    })),
                ready: result.review.ready
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx",
                lineNumber: 27,
                columnNumber: 51
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CaptureAssistantResult",
    ()=>CaptureAssistantResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$source$2d$projection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-source-projection.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$setup$2d$projection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-setup-projection.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$source$2d$list$2f$capture$2d$source$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-source-list/capture-source-list.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$dashboard$2d$summary$2f$capture$2d$dashboard$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-dashboard-summary/capture-dashboard-summary.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$publication$2d$instructions$2f$capture$2d$publication$2d$instructions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-publication-instructions/capture-publication-instructions.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$intake$2d$source$2d$evidence$2f$intake$2d$source$2d$evidence$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/intake-source-evidence/intake-source-evidence.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$form$2d$field$2d$editor$2f$capture$2d$form$2d$field$2d$editor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-form-field-editor/capture-form-field-editor.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$lead$2d$workflow$2f$capture$2d$lead$2d$workflow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-lead-workflow/capture-lead-workflow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$setup$2d$review$2f$capture$2d$setup$2d$review$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-setup-review/capture-setup-review.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$pause$2d$resume$2d$dialog$2f$capture$2d$pause$2d$resume$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/capture-pause-resume-dialog/capture-pause-resume-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$intake$2d$decision$2d$review$2f$intake$2d$decision$2d$review$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/lead-capture/intake-decision-review/intake-decision-review.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-result.validation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-result.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$read$2d$projection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-read-projection.tsx [app-ssr] (ecmascript)");
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
;
;
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
function CaptureAssistantResult(props) {
    let key;
    try {
        key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantReferenceKey"])(props.reference);
    } catch  {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            role: "alert",
            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
            lineNumber: 27,
            columnNumber: 79
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Result, {
        ...props
    }, key + ':' + !!props.disabled, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, this);
}
function ReadContent({ content, onOpen, onCopy }) {
    switch(content.kind){
        case 'capture_read':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$read$2d$projection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureReadProjection"], {
                result: content.result,
                onOpen: onOpen,
                onCopy: onCopy
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                lineNumber: 32,
                columnNumber: 33
            }, this);
        case 'sources':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].window(content.rows.length, content.total)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                        lineNumber: 33,
                        columnNumber: 30
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$source$2d$list$2f$capture$2d$source$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureSourceList"], {
                        rows: content.rows.map((row)=>({
                                ...row,
                                allowedActions: []
                            })),
                        canRead: true,
                        view: content.archived ? 'archived' : 'current',
                        timezone: content.timezone,
                        onOpen: (row)=>onOpen({
                                kind: 'source',
                                id: row.id
                            }),
                        onAction: ()=>{}
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                        lineNumber: 33,
                        columnNumber: 121
                    }, this)
                ]
            }, void 0, true);
        case 'summary':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$dashboard$2d$summary$2f$capture$2d$dashboard$2d$summary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureDashboardSummary"], {
                source: content.source,
                totals: content.totals,
                canRead: true,
                canReadIntake: false,
                actions: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: button,
                    onClick: ()=>onOpen({
                            kind: 'source',
                            id: content.source.id
                        }),
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].open
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 34,
                    columnNumber: 140
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                lineNumber: 34,
                columnNumber: 28
            }, this);
        case 'installation':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$publication$2d$instructions$2f$capture$2d$publication$2d$instructions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CapturePublicationInstructions"], {
                publication: content.publication,
                canRead: true,
                onCopy: onCopy
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                lineNumber: 35,
                columnNumber: 33
            }, this);
        case 'intake_evidence':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$intake$2d$source$2d$evidence$2f$intake$2d$source$2d$evidence$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IntakeSourceEvidence"], {
                snapshot: content.snapshot,
                timezone: content.timezone,
                canRead: true
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                lineNumber: 36,
                columnNumber: 36
            }, this);
    }
}
function Result({ reference, client, disabled = false, onRefresh, onOpen, onCopy }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [reviewOpen, setReviewOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [clock, setClock] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Date.now);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0), active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    async function load() {
        if (!mounted.current || disabled || lock.current) return;
        const request = ++sequence.current;
        active.current?.abort();
        const abort = new AbortController();
        active.current = abort;
        setError('');
        try {
            const next = await client.read(reference, abort.signal);
            if (!mounted.current || abort.signal.aborted || sequence.current !== request) return;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantViewMatches"])(reference, next)) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].stale);
            const now = Date.now();
            if (next.kind !== 'proposal' || next.ticket.state !== 'pending' || Date.parse(next.ticket.expiresAt) <= now) setReviewOpen(false);
            setClock(now);
            setView(next);
        } catch  {
            if (mounted.current && !abort.signal.aborted && sequence.current === request) {
                setView(null);
                setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable);
                setReviewOpen(false);
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const start = setTimeout(()=>{
            void load();
        }, 0), focus = ()=>{
            void load();
        };
        window.addEventListener('focus', focus);
        return ()=>{
            mounted.current = false;
            active.current?.abort();
            clearTimeout(start);
            window.removeEventListener('focus', focus);
        };
    // The outer key binds reference/workspace/disabled lifetimes; the host supplies a stable client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        client
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (view?.kind !== 'proposal' || view.ticket.state !== 'pending') return;
        const remaining = Date.parse(view.ticket.expiresAt) - Date.now();
        if (remaining <= 0) return;
        const timer = setTimeout(()=>setClock(Date.now()), remaining + 1);
        return ()=>clearTimeout(timer);
    }, [
        view
    ]);
    async function decide(decision) {
        if (!mounted.current || disabled || lock.current || view?.kind !== 'proposal' || view.ticket.state !== 'pending' || Date.parse(view.ticket.expiresAt) <= Date.now()) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].stale);
        const body = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantProposalDecisionSchema"].parse({
            workspaceId: view.ticket.workspaceId,
            proposalId: view.ticket.proposalId,
            inputHash: view.ticket.inputHash,
            decision
        });
        const request = ++sequence.current, abort = new AbortController();
        active.current?.abort();
        active.current = abort;
        lock.current = true;
        setPending(true);
        setError('');
        try {
            const next = await client.decide(reference, body, abort.signal);
            if (!mounted.current || abort.signal.aborted || request !== sequence.current) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].stale);
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$validation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantViewMatches"])(reference, next) || next.kind !== 'proposal' || next.ticket.state !== (decision === 'confirm' ? 'confirmed' : 'cancelled')) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].stale);
            setReviewOpen(false);
            setView(next);
            try {
                await onRefresh();
            } catch  {}
        } catch  {
            if (mounted.current && request === sequence.current) {
                setView(null);
                setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].failed);
                setReviewOpen(false);
            }
            throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].failed);
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    const expired = view?.kind === 'proposal' && view.ticket.state === 'pending' && Date.parse(view.ticket.expiresAt) <= clock;
    const confirm = ()=>decide('confirm');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].title,
        "aria-busy": pending || !view && !error && !disabled,
        className: "grid min-w-0 gap-4 rounded-2xl border border-assistant-border bg-paper p-4 text-ink sm:p-5",
        children: disabled || !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: error || disabled ? 'alert' : 'status',
                    className: "m-0 text-sm leading-6",
                    children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].loading
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 93,
                    columnNumber: 28
                }, this),
                error && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: `${button} justify-self-start`,
                    disabled: pending,
                    onClick: ()=>{
                        void load();
                    },
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].retry
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 93,
                    columnNumber: 191
                }, this)
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "m-0 text-xs text-muted",
                    children: [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].captured,
                        ": ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                            dateTime: view.retrievedAt,
                            children: [
                                new Date(view.retrievedAt).toLocaleString('en-US', {
                                    timeZone: 'UTC'
                                }),
                                " UTC"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                            lineNumber: 95,
                            columnNumber: 64
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, this),
                view.kind === 'result' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ReadContent, {
                    content: view.content,
                    onOpen: onOpen,
                    onCopy: onCopy
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 96,
                    columnNumber: 35
                }, this) : view.ticket.state !== 'pending' || expired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "status",
                    className: "m-0 text-sm leading-6",
                    children: expired ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].expired : view.ticket.state === 'confirmed' ? view.outcome || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].completed : view.ticket.state === 'cancelled' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].cancelled : view.ticket.state === 'superseded' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].superseded : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].expired
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 97,
                    columnNumber: 58
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "m-0 text-lg font-semibold wrap-anywhere",
                            children: view.title
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                            lineNumber: 99,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "m-0 text-sm leading-6 text-muted",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].draftNotice
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                            lineNumber: 99,
                            columnNumber: 88
                        }, this),
                        !reviewOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: `${button} justify-self-start`,
                            disabled: pending,
                            onClick: ()=>setReviewOpen(true),
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].review
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                            lineNumber: 100,
                            columnNumber: 30
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                view.content.kind === 'source_action' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$source$2d$projection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureSourceProjection"], {
                                    view: view.content.view,
                                    pending: pending,
                                    onConfirm: confirm,
                                    onClose: ()=>setReviewOpen(false)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                    lineNumber: 101,
                                    columnNumber: 59
                                }, this),
                                view.content.kind === 'setup' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$setup$2d$projection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureSetupProjection"], {
                                            view: view.content.view
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 102,
                                            columnNumber: 53
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: `${button} justify-self-start`,
                                            disabled: pending,
                                            onClick: ()=>{
                                                void confirm().catch(()=>{});
                                            },
                                            children: pending ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].pending : view.title
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 102,
                                            columnNumber: 104
                                        }, this)
                                    ]
                                }, void 0, true),
                                view.content.kind === 'fields' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$form$2d$field$2d$editor$2f$capture$2d$form$2d$field$2d$editor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureFormFieldEditor"], {
                                            value: view.content.value,
                                            canRead: true,
                                            canEdit: false,
                                            readOnlyMessage: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].fixedReview,
                                            onChange: ()=>{}
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 103,
                                            columnNumber: 54
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: `${button} justify-self-start`,
                                            disabled: pending,
                                            onClick: ()=>{
                                                void confirm().catch(()=>{});
                                            },
                                            children: pending ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].pending : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].confirm
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 103,
                                            columnNumber: 186
                                        }, this)
                                    ]
                                }, void 0, true),
                                view.content.kind === 'workflow' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$lead$2d$workflow$2f$capture$2d$lead$2d$workflow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureLeadWorkflow"], {
                                            value: view.content.value,
                                            source: view.content.source,
                                            teammates: view.content.teammates,
                                            canRead: true,
                                            canEdit: false,
                                            readOnlyMessage: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].fixedReview,
                                            onChange: ()=>{}
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 104,
                                            columnNumber: 56
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: `${button} justify-self-start`,
                                            disabled: pending,
                                            onClick: ()=>{
                                                void confirm().catch(()=>{});
                                            },
                                            children: pending ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].pending : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].confirm
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 104,
                                            columnNumber: 249
                                        }, this)
                                    ]
                                }, void 0, true),
                                view.content.kind === 'publication' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "m-0 text-sm text-muted",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].publicationNotice
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 105,
                                            columnNumber: 59
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$setup$2d$review$2f$capture$2d$setup$2d$review$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureSetupReview"], {
                                            draft: view.content.draft,
                                            value: view.content.timing,
                                            canRead: true,
                                            canEdit: false,
                                            canLaunch: true,
                                            pending: pending,
                                            timingReadOnly: true,
                                            onChange: ()=>{},
                                            onEdit: ()=>{},
                                            onLaunch: confirm
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                            lineNumber: 105,
                                            columnNumber: 125
                                        }, this)
                                    ]
                                }, void 0, true),
                                view.content.kind === 'lifecycle' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$capture$2d$pause$2d$resume$2d$dialog$2f$capture$2d$pause$2d$resume$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CapturePauseResumeDialog"], {
                                    open: true,
                                    action: view.content.action,
                                    source: view.content.source,
                                    canRead: true,
                                    pending: pending,
                                    onClose: ()=>setReviewOpen(false),
                                    onConfirm: confirm
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                    lineNumber: 106,
                                    columnNumber: 55
                                }, this),
                                view.content.kind === 'intake' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$lead$2d$capture$2f$intake$2d$decision$2d$review$2f$intake$2d$decision$2d$review$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IntakeDecisionReview"], {
                                    review: view.content.review,
                                    canRead: true,
                                    pending: pending,
                                    onBack: ()=>setReviewOpen(false),
                                    onConfirm: async ()=>{
                                        await confirm();
                                        return {
                                            ok: true
                                        };
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                    lineNumber: 107,
                                    columnNumber: 52
                                }, this)
                            ]
                        }, void 0, true),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex min-w-0 flex-wrap gap-3",
                            children: [
                                reviewOpen && view.content.kind !== 'lifecycle' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: button,
                                    disabled: pending,
                                    onClick: ()=>setReviewOpen(false),
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].close
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                    lineNumber: 109,
                                    columnNumber: 113
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: button,
                                    disabled: pending,
                                    onClick: ()=>{
                                        void decide('cancel').catch(()=>{});
                                    },
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].cancel
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                                    lineNumber: 109,
                                    columnNumber: 232
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                            lineNumber: 109,
                            columnNumber: 15
                        }, this),
                        pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            role: "status",
                            className: "m-0 text-sm",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].pending
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                            lineNumber: 110,
                            columnNumber: 27
                        }, this)
                    ]
                }, void 0, true),
                view?.kind === 'proposal' && view.ticket.state === 'confirmed' && view.content.kind === 'source_action' && view.content.view.receipt && view.content.view.receipt.kind !== 'intake' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    className: button,
                    href: `/lead-capture/${view.content.view.receipt.sourceId}?workspace=${view.ticket.workspaceId}`,
                    children: "Open capture source"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 112,
                    columnNumber: 193
                }, this),
                view?.kind === 'proposal' && view.ticket.state === 'confirmed' && view.content.kind === 'setup' && view.content.view.receipt?.kind === 'saved' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    className: button,
                    href: `/lead-capture/${view.content.view.receipt.sourceId}?workspace=${view.ticket.workspaceId}`,
                    children: "Open saved source"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
                    lineNumber: 113,
                    columnNumber: 156
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx",
        lineNumber: 92,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/capture-result/connected-capture-source.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedCaptureSource",
    ()=>ConnectedCaptureSource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-sources.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const titles = {
    publish: 'Publish saved capture source',
    change_schedule: 'Change scheduled launch',
    cancel_schedule: 'Cancel scheduled launch',
    pause: 'Pause capture intake',
    resume: 'Resume capture intake',
    archive: 'Archive capture source',
    restore: 'Restore source with intake paused',
    duplicate: 'Duplicate source into a new draft'
};
function ConnectedCaptureSource({ ticket, disabled, onSaved }) {
    const reference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            kind: 'proposal',
            binding: {
                workspaceId: ticket.workspaceId,
                proposalId: ticket.proposalId,
                inputHash: ticket.inputHash,
                operation: ticket.operation,
                target: ticket.target,
                ...ticket.transition ? {
                    transition: ticket.transition
                } : {}
            }
        }), [
        ticket
    ]);
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const binding = {
            workspaceId: ticket.workspaceId,
            proposalId: ticket.proposalId,
            inputHash: ticket.inputHash
        };
        function project(view) {
            const op = view.ticket.operation;
            return {
                kind: 'proposal',
                reference,
                ticket: view.ticket,
                retrievedAt: view.ticket.createdAt,
                title: titles[op],
                content: {
                    kind: 'source_action',
                    view
                },
                outcome: op === 'duplicate' ? 'New source draft created. Publication requires a separate review.' : op === 'restore' ? 'Source restored with intake paused.' : op === 'cancel_schedule' ? 'Pending launch cancelled. Existing receipts are retained.' : op === 'change_schedule' && view.receipt?.kind === 'publication' && view.receipt.status !== 'active' ? 'Launch schedule changed. Delivery has not started.' : op === 'publish' && view.receipt?.kind === 'publication' && view.receipt.status !== 'active' ? 'Launch scheduled. Delivery has not started.' : op === 'pause' ? 'Capture intake paused.' : op === 'archive' ? 'Capture source archived.' : op === 'resume' ? 'Approved capture intake resumed.' : 'Saved capture configuration published. Real request delivery remains subject to its current checks.'
            };
        }
        async function request(method, signal, body) {
            const response = await fetch(`/api/chat/lead-capture/sources${method === 'GET' ? `?${new URLSearchParams(binding)}` : ''}`, {
                method,
                cache: 'no-store',
                signal,
                ...body ? {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                } : {}
            });
            if (!response.ok) throw Error('This source review changed or is unavailable. Request a fresh review.');
            const view = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$sources$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureSourceProposalViewSchema"].parse((await response.json()).view);
            if (view.ticket.proposalId !== ticket.proposalId || view.ticket.inputHash !== ticket.inputHash) throw Error('Invalid source review.');
            return view;
        }
        return {
            async read (_reference, signal) {
                return project(await request('GET', signal));
            },
            async decide (_reference, decision, signal) {
                const view = await request('POST', signal, decision);
                if (view.ticket.state === 'confirmed') onSaved?.();
                return project(view);
            }
        };
    }, [
        ticket,
        reference,
        onSaved
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureAssistantResult"], {
        reference: reference,
        client: client,
        disabled: disabled,
        onRefresh: async ()=>{},
        onOpen: ()=>{}
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/connected-capture-source.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/capture-result/connected-capture-setup.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedCaptureSetup",
    ()=>ConnectedCaptureSetup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-setup.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function ConnectedCaptureSetup({ ticket, disabled, apply, onSaved }) {
    const reference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const { workspaceId, proposalId, inputHash, operation, target } = ticket;
        return {
            kind: 'proposal',
            binding: {
                workspaceId,
                proposalId,
                inputHash,
                operation,
                target
            }
        };
    }, [
        ticket
    ]);
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const binding = {
            workspaceId: ticket.workspaceId,
            proposalId: ticket.proposalId,
            inputHash: ticket.inputHash
        };
        const application = [
            'suggest_website_fields',
            'suggest_workflow',
            'extract_sample',
            'refine_mapping',
            'approve_sample'
        ].includes(ticket.operation);
        function project(view, applied = false) {
            return {
                kind: 'proposal',
                reference,
                ticket: view.ticket,
                retrievedAt: view.ticket.createdAt,
                title: ({
                    create_source: 'Create source draft',
                    begin_revision: 'Begin source revision',
                    save_draft: 'Save source draft',
                    suggest_website_fields: 'Apply suggested fields',
                    suggest_workflow: 'Apply suggested workflow',
                    extract_sample: 'Review extracted sample',
                    refine_mapping: 'Review refined mapping',
                    approve_sample: 'Approve pasted sample'
                })[view.ticket.operation],
                content: {
                    kind: 'setup',
                    view
                },
                outcome: view.receipt?.kind === 'saved' ? 'Draft saved. Publication requires a separate review.' : applied ? 'Suggestions applied to the unsaved setup. Save separately to keep them.' : 'Review confirmed. Reopen the matching setup to apply the suggestions; they have not been saved.'
            };
        }
        async function request(method, signal, body) {
            const response = await fetch(`/api/chat/lead-capture/setup${method === 'GET' ? `?${new URLSearchParams(binding)}` : ''}`, {
                method,
                cache: 'no-store',
                signal,
                ...body ? {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                } : {}
            });
            if (!response.ok) throw Error('This setup review is unavailable or changed. Ask for a fresh review.');
            const view = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureSetupViewSchema"].parse((await response.json()).view);
            if (view.ticket.proposalId !== ticket.proposalId || view.ticket.inputHash !== ticket.inputHash) throw Error('Invalid setup binding.');
            return view;
        }
        return {
            async read (_reference, signal) {
                return project(await request('GET', signal));
            },
            async decide (_reference, decision, signal) {
                if (decision.decision === 'confirm' && application) {
                    const current = await request('GET', signal);
                    if (!apply?.(current, true)) throw Error('The unsaved setup changed. Request a fresh suggestion.');
                }
                const view = await request('POST', signal, decision);
                const applied = view.ticket.state === 'confirmed' && view.receipt?.kind === 'suggestions' && !!apply?.(view);
                if (view.ticket.state === 'confirmed' && view.receipt?.kind === 'saved') onSaved?.(view.receipt.sourceId);
                return project(view, applied);
            }
        };
    }, [
        ticket,
        reference,
        apply,
        onSaved
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureAssistantResult"], {
        reference: reference,
        client: client,
        disabled: disabled,
        onRefresh: async ()=>{},
        onOpen: ()=>{}
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/connected-capture-setup.tsx",
        lineNumber: 35,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/capture-result/connected-capture-read.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedCaptureRead",
    ()=>ConnectedCaptureRead
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-read.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/capture-result.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function ConnectedCaptureRead(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Read, {
        ...props
    }, JSON.stringify(props.ticket), false, {
        fileName: "[project]/apps/web/src/features/assistant/capture-result/connected-capture-read.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
function Read({ ticket, disabled, onNavigate }) {
    const [unavailable, setUnavailable] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), flight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), latestDisabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(disabled), active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        latestDisabled.current = disabled;
    }, [
        disabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        return ()=>{
            mounted.current = false;
            active.current?.abort();
        };
    }, []);
    const reference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            kind: 'result',
            workspaceId: ticket.workspaceId,
            resultId: ticket.resultId,
            snapshotHash: ticket.snapshotHash
        }), [
        ticket
    ]);
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            async read (_reference, signal) {
                const query = new URLSearchParams({
                    workspaceId: ticket.workspaceId,
                    turnId: ticket.turnId,
                    resultId: ticket.resultId,
                    snapshotHash: ticket.snapshotHash
                });
                const response = await fetch(`/api/chat/lead-capture?${query}`, {
                    cache: 'no-store',
                    signal
                });
                if (!response.ok) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable);
                const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$read$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureChatResultSchema"].parse((await response.json()).result);
                if (result.id !== ticket.resultId || result.workspaceId !== ticket.workspaceId || result.operation !== ticket.operation) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable);
                return {
                    kind: 'result',
                    reference,
                    retrievedAt: result.retrievedAt,
                    content: {
                        kind: 'capture_read',
                        result
                    }
                };
            },
            async decide () {
                throw Error('Read results cannot confirm business changes.');
            }
        }), [
        ticket,
        reference
    ]);
    async function open(sourceId) {
        if (disabled || unavailable || flight.current) return;
        flight.current = true;
        const abort = new AbortController();
        active.current = abort;
        try {
            const binding = {
                workspaceId: ticket.workspaceId,
                turnId: ticket.turnId,
                resultId: ticket.resultId,
                snapshotHash: ticket.snapshotHash
            };
            const response = await fetch('/api/chat/lead-capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...binding,
                    sourceId
                }),
                signal: abort.signal
            });
            if (!response.ok) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable);
            const { href } = await response.json();
            if (typeof href !== 'string') throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable);
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin || url.pathname !== `/lead-capture/${sourceId}` || url.search !== `?workspace=${ticket.workspaceId}` || url.hash || url.username || url.password) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].unavailable);
            if (mounted.current && !abort.signal.aborted && !latestDisabled.current) onNavigate(url.pathname + url.search);
        } catch  {
            if (mounted.current && !abort.signal.aborted) setUnavailable(true);
        } finally{
            flight.current = false;
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CaptureAssistantResult"], {
                reference: reference,
                client: client,
                disabled: disabled || unavailable,
                onRefresh: async ()=>{},
                onOpen: (record)=>{
                    if (record.kind === 'source') void open(record.id);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/connected-capture-read.tsx",
                lineNumber: 41,
                columnNumber: 12
            }, this),
            unavailable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "min-h-11 rounded-xl border border-line p-3 text-sm text-primary",
                onClick: ()=>setUnavailable(false),
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$capture$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureAssistantResultData"].retry
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/capture-result/connected-capture-read.tsx",
                lineNumber: 41,
                columnNumber: 229
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarClearProposalFixture",
    ()=>calendarClearProposalFixture,
    "calendarScheduleContextFixture",
    ()=>calendarScheduleContextFixture,
    "calendarScheduleDraftCardData",
    ()=>calendarScheduleDraftCardData,
    "calendarScheduleProposalFixture",
    ()=>calendarScheduleProposalFixture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/calendar-event-card/calendar-event-card.data.ts [app-ssr] (ecmascript)");
;
const calendarScheduleDraftCardData = {
    clear: {
        title: 'Review clearing this visit',
        heading: 'Remove date and arrival window',
        confirm: 'Confirm clear schedule',
        description: 'Review every affected active record before clearing this visit. This proposal has not been saved.',
        sharedHelp: 'Every active record listed below will lose its schedule together. To clear only a Work Order, cancel this proposal and separate its visit first.',
        impact: 'Scheduled Jobs return to Needs Scheduling. Other active statuses are preserved. Assignments and completion deadlines stay unchanged.',
        confirmed: 'Schedule cleared for all affected active records.'
    },
    title: 'Review visit schedule',
    schedule: 'Schedule visit',
    reschedule: 'Reschedule visit',
    description: 'Review the entire visit before confirming. This proposal has not been saved.',
    current: 'Current schedule',
    proposed: 'Proposed schedule',
    previous: 'Previous schedule',
    saved: 'Saved schedule',
    unscheduled: 'Not scheduled',
    timezone: 'Workspace timezone',
    affected: 'Affected active records',
    people: 'Assigned people',
    shared: 'One shared visit · counted once',
    sharedHelp: 'Every active record listed below will move together in one change. To move only a Work Order, cancel this proposal and separate its visit first.',
    history: 'Completed and canceled records keep their historical schedule.',
    unchanged: 'Assignments and completion deadlines stay unchanged. Jobs in Needs Scheduling become Scheduled when the date is saved; other active statuses are preserved.',
    warningTitle: 'Review scheduling warnings',
    warningHelp: 'These warnings do not block confirmation. Arrival windows do not represent the full work duration or confirmed availability.',
    expires: 'Proposal expires',
    noChange: 'The proposed date and arrival window are already set. Nothing needs to change.',
    confirm: 'Confirm schedule',
    cancel: 'Cancel proposal',
    saving: 'Submitting your decision…',
    awaiting: 'Checking the latest proposal status…',
    failure: 'Your decision could not be submitted. Try again or ask for a fresh proposal.',
    states: {
        pending: 'Nothing changes until you confirm.',
        confirmed: 'Schedule saved for all affected active records.',
        cancelled: 'Proposal canceled. Nothing changed.',
        expired: 'This proposal expired. Ask for a fresh schedule proposal.',
        superseded: 'A newer proposal replaced this one. Review the latest proposal.',
        conflict: 'The visit or its affected records changed. Ask for a fresh proposal before confirming.',
        unavailable: 'This schedule proposal is unavailable with your current access. Ask the assistant to check again.',
        loading: 'Checking the current visit and scheduling permissions…',
        error: 'The schedule proposal could not be reviewed. Ask for a fresh proposal.'
    },
    stories: {
        heading: 'Visit scheduling in the assistant',
        notice: 'Design preview. All records are fictional; confirmation changes this preview only.',
        today: '2026-10-27',
        from: '2026-10-28',
        to: '2026-10-29',
        timezone: 'America/New_York',
        overlap: 'Sam Rivera has another visit with an intersecting arrival window.',
        busy: 'Alex Chen would have 4 visits on this date.',
        unknown: 'One other visit has no arrival window. Timing cannot be fully checked.',
        past: 'The proposed date is in the past. You can still save it.',
        after: 'The proposed date is after the Job completion deadline. You can still save it.',
        error: 'The schedule could not be saved. Your proposal is preserved.',
        revoke: 'Simulate scheduling access removed',
        longWarning: 'The assigned team has several visits at different sites on this date. Review the complete permitted schedule and travel arrangements before confirming this change.'
    }
};
function calendarScheduleProposalFixture(now = Date.now()) {
    return {
        id: '00000000-0000-4000-8000-000000000001',
        inputHash: 'a'.repeat(64),
        visitId: '00000000-0000-4000-8000-000000000002',
        revision: 'b'.repeat(64),
        createdAt: new Date(now - 60000).toISOString(),
        expiresAt: new Date(now + 840000).toISOString(),
        state: 'pending',
        timezone: calendarScheduleDraftCardData.stories.timezone,
        from: {
            scheduledDate: calendarScheduleDraftCardData.stories.from,
            arrivalWindow: '09:00-11:00'
        },
        to: {
            scheduledDate: calendarScheduleDraftCardData.stories.to,
            arrivalWindow: '12:00-14:00'
        },
        records: [
            {
                type: 'job',
                id: '00000000-0000-4000-8000-000000000003',
                number: 'J-1042',
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].stories.title,
                status: 'scheduled',
                expectedVersion: 2
            },
            {
                type: 'work_order',
                id: '00000000-0000-4000-8000-000000000004',
                number: 'WO-1007',
                title: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].stories.workOrderTitle,
                status: 'issued',
                expectedVersion: 3
            }
        ],
        crew: [
            {
                id: 'sam',
                name: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].stories.sam
            },
            {
                id: 'alex',
                name: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].stories.alex
            },
            {
                id: 'sam',
                name: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].stories.sam
            }
        ],
        warnings: []
    };
}
function calendarScheduleContextFixture(draft) {
    return {
        proposalId: draft.id,
        inputHash: draft.inputHash,
        visitId: draft.visitId,
        revision: draft.revision,
        records: draft.records.map((r)=>({
                type: r.type,
                id: r.id,
                expectedVersion: r.expectedVersion
            })),
        read: true,
        canSchedule: true
    };
}
function calendarClearProposalFixture(now = Date.now()) {
    return {
        ...calendarScheduleProposalFixture(now),
        intent: 'clear',
        to: {
            scheduledDate: null,
            arrivalWindow: null
        }
    };
}
}),
"[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.preview.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reviewCalendarScheduleDraft",
    ()=>reviewCalendarScheduleDraft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$proposal$2d$review$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/proposal-review.ts [app-ssr] (ecmascript)");
;
;
function reviewCalendarScheduleDraft(draft, context, now) {
    if (!context?.read || !context.canSchedule || draft.state === 'forbidden') return {
        kind: 'unavailable'
    };
    if (draft.state === 'conflict' || draft.state === 'superseded') return {
        kind: draft.state
    };
    const records = draft.records.map((r)=>({
            type: r.type,
            id: r.id,
            number: r.number,
            title: r.title,
            status: r.status
        }));
    const window = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$proposal$2d$review$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reviewAssistantProposalWindow"])(draft.createdAt, draft.expiresAt, now);
    const valid = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarChatVisitSchema"].shape.id.safeParse(draft.id).success && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarChatVisitSchema"].shape.id.safeParse(draft.visitId).success && /^[a-f0-9]{64}$/.test(draft.inputHash) && /^[a-f0-9]{64}$/.test(draft.revision) && window.valid && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarScheduleSchema"].safeParse(draft.from).success && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calendarScheduleSchema"].safeParse(draft.to).success && (draft.intent === 'clear' ? !!draft.from.scheduledDate && draft.to.scheduledDate === null && draft.to.arrivalWindow === null && draft.warnings.length === 0 : (draft.intent === undefined || draft.intent === 'schedule') && !!draft.to.scheduledDate) && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarChatVisitSchema"].shape.records.safeParse(records).success && draft.records.every((r)=>Number.isSafeInteger(r.expectedVersion) && r.expectedVersion > 0 && ![
            'completed',
            'canceled'
        ].includes(r.status)) && new Set(draft.records.map((r)=>`${r.type}:${r.id}`)).size === draft.records.length && draft.crew.every((p)=>!!p.id && !!p.name.trim() && p.name.length <= 200) && draft.warnings.every((w)=>!!w.trim() && w.length <= 1000);
    let timezone = true;
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: draft.timezone
        });
    } catch  {
        timezone = false;
    }
    if (!valid || !timezone) return {
        kind: 'error'
    };
    const keys = (items)=>items.map((r)=>`${r.type}:${r.id}:${r.expectedVersion}`).sort();
    const expected = keys(draft.records), actual = keys(context.records);
    if (context.proposalId !== draft.id || context.inputHash !== draft.inputHash || context.visitId !== draft.visitId || context.revision !== draft.revision || expected.length !== actual.length || expected.some((key, i)=>key !== actual[i])) return {
        kind: 'conflict'
    };
    return {
        kind: 'ready',
        expires: window.expires,
        expired: window.expired,
        unchanged: draft.from.scheduledDate === draft.to.scheduledDate && draft.from.arrivalWindow === draft.to.arrivalWindow
    };
}
}),
"[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarScheduleDraftCard",
    ()=>CalendarScheduleDraftCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/status-badge/status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-status-badge/job-status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$work$2d$orders$2f$work$2d$order$2d$status$2d$badge$2f$work$2d$order$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/work-orders/work-order-status-badge/work-order-status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/calendar-event-card/calendar-event-card.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$preview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.preview.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function CalendarScheduleDraftCard(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ScheduleReview, {
        ...props
    }, `${props.draft.id}:${props.draft.inputHash}:${props.draft.revision}:${props.draft.expiresAt}:${props.draft.state}`, false, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
const action = 'min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-foreground focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:opacity-50';
function ScheduleReview({ draft, context, state = 'ready', disabled = false, onDecide }) {
    const [clock, setClock] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Date.now()), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [awaiting, setAwaiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), review = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$preview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reviewCalendarScheduleDraft"])(draft, context, clock);
    const expires = review.kind === 'ready' ? review.expires : undefined;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (expires === undefined || draft.state !== 'pending') return;
        const timer = setTimeout(()=>setClock(Date.now()), Math.max(0, expires - Date.now()));
        return ()=>clearTimeout(timer);
    }, [
        expires,
        draft.state
    ]);
    const hidden = state !== 'ready' ? state : review.kind !== 'ready' ? review.kind : undefined;
    const status = draft.state === 'pending' && review.kind === 'ready' && review.expired ? 'expired' : draft.state;
    async function decide(decision) {
        const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$preview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reviewCalendarScheduleDraft"])(draft, context, Date.now());
        if (lock.current || disabled || state !== 'ready' || !onDecide || draft.state !== 'pending' || current.kind !== 'ready' || current.expired || decision === 'confirm' && current.unchanged) return;
        lock.current = true;
        setPending(true);
        setError(undefined);
        try {
            const result = await onDecide({
                proposalId: draft.id,
                inputHash: draft.inputHash,
                visitId: draft.visitId,
                revision: draft.revision,
                decision
            });
            if (result.ok) setAwaiting(true);
            else {
                setError(result.message);
                lock.current = false;
            }
        } catch  {
            setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].failure);
            lock.current = false;
        } finally{
            setPending(false);
        }
    }
    const clearing = draft.intent === 'clear';
    const title = clearing ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].clear.title : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].title;
    const people = [
        ...new Map(draft.crew.map((p)=>[
                p.id,
                p
            ])).values()
    ];
    const schedule = (value)=>value.scheduledDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                    dateTime: value.scheduledDate,
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].date(value.scheduledDate)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                    lineNumber: 39,
                    columnNumber: 104
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "mt-1 block text-sm font-normal",
                    children: value.arrivalWindow ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].window(value.arrivalWindow) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].noWindow
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                    lineNumber: 39,
                    columnNumber: 188
                }, this)
            ]
        }, void 0, true) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].unscheduled;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": title,
        "aria-busy": pending || awaiting || state === 'loading',
        className: "mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "m-0 text-base font-semibold",
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                lineNumber: 41,
                columnNumber: 5
            }, this),
            hidden ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "mb-0 mt-3 text-sm leading-6 text-assistant-muted",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].states[hidden]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                lineNumber: 42,
                columnNumber: 15
            }, this) : review.kind === 'ready' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-sm font-semibold",
                        children: clearing ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].clear.heading : draft.from.scheduledDate ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].reschedule : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].schedule
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 43,
                        columnNumber: 7
                    }, this),
                    status === 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-2 text-sm leading-6 text-assistant-muted",
                        children: clearing ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].clear.description : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].description
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 44,
                        columnNumber: 32
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "mb-0 mt-4 grid min-w-0 gap-3 sm:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 rounded-xl border border-assistant-border p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-xs font-semibold text-assistant-muted",
                                        children: status === 'confirmed' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].previous : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].current
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 46,
                                        columnNumber: 80
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 mt-2 text-base font-semibold wrap-anywhere",
                                        children: schedule(draft.from)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 46,
                                        columnNumber: 199
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 46,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-xs font-semibold text-assistant-muted",
                                        children: status === 'confirmed' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].saved : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].proposed
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 47,
                                        columnNumber: 101
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 mt-2 text-base font-semibold text-assistant-accent wrap-anywhere",
                                        children: schedule(draft.to)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 47,
                                        columnNumber: 218
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 47,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sm:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-xs text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].timezone
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 48,
                                        columnNumber: 40
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 mt-1 text-sm wrap-anywhere",
                                        children: draft.timezone
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 48,
                                        columnNumber: 105
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 48,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sm:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-xs text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].people
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 49,
                                        columnNumber: 40
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 mt-1 text-sm leading-6 wrap-anywhere",
                                        children: people.length ? people.map((p)=>p.name).join(', ') : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].unassigned
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 49,
                                        columnNumber: 103
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 49,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 45,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "mb-0 mt-4 text-sm font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].affected
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 51,
                        columnNumber: 7
                    }, this),
                    draft.records.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 grid gap-2 rounded-xl border border-assistant-border bg-assistant-message p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].shared
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 52,
                                columnNumber: 136
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-xs leading-5 text-assistant-muted",
                                children: clearing ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].clear.sharedHelp : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].sharedHelp
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 52,
                                columnNumber: 194
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 52,
                        columnNumber: 36
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].affected,
                        className: "mb-0 mt-3 grid list-none gap-3 p-0",
                        children: draft.records.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "grid min-w-0 gap-2 rounded-xl border border-assistant-border p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-semibold",
                                                children: r.number
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                                lineNumber: 54,
                                                columnNumber: 76
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex rounded-full bg-paper",
                                                children: r.type === 'job' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatusBadge"], {
                                                    status: r.status
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                                    lineNumber: 54,
                                                    columnNumber: 205
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$work$2d$orders$2f$work$2d$order$2d$status$2d$badge$2f$work$2d$order$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WorkOrderStatusBadge"], {
                                                    status: r.status
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                                    lineNumber: 54,
                                                    columnNumber: 243
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                                lineNumber: 54,
                                                columnNumber: 133
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 54,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-sm leading-6 wrap-anywhere",
                                        children: r.title
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 55,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, `${r.type}:${r.id}`, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 53,
                                columnNumber: 109
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 53,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-xs leading-5 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].history
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 57,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-2 text-xs leading-5 text-assistant-muted",
                        children: clearing ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].clear.impact : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].unchanged
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 57,
                        columnNumber: 89
                    }, this),
                    draft.warnings.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].warningTitle,
                        className: "mt-4 grid gap-3 rounded-xl border border-assistant-border bg-assistant-message p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex justify-self-start rounded-full bg-paper",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].warningTitle,
                                    tone: "warning"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                    lineNumber: 59,
                                    columnNumber: 80
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 59,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "m-0 grid gap-2 pl-4 text-sm leading-6 wrap-anywhere",
                                children: draft.warnings.map((w, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: w
                                    }, `${i}:${w}`, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                        lineNumber: 60,
                                        columnNumber: 106
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 60,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-xs leading-5 text-assistant-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].warningHelp
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 60,
                                columnNumber: 143
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 58,
                        columnNumber: 37
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-4 text-xs leading-5 text-assistant-muted",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].expires,
                            ": ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                dateTime: draft.expiresAt,
                                children: new Intl.DateTimeFormat('en-US', {
                                    timeZone: draft.timezone,
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                }).format(new Date(draft.expiresAt))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 62,
                                columnNumber: 87
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 62,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "mb-0 mt-3 text-sm font-semibold leading-6",
                        children: pending ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].saving : awaiting ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].awaiting : clearing && status === 'confirmed' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].clear.confirmed : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].states[status === 'forbidden' ? 'unavailable' : status]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 63,
                        columnNumber: 7
                    }, this),
                    review.unchanged && status === 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-sm leading-6 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].noChange
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 64,
                        columnNumber: 52
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "alert",
                        className: "mb-0 mt-3 text-sm leading-6 wrap-anywhere",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 65,
                        columnNumber: 17
                    }, this),
                    status === 'pending' && onDecide && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex flex-wrap gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: `${action} bg-assistant-accent text-assistant-surface`,
                                disabled: disabled || pending || awaiting || review.unchanged,
                                onClick: ()=>{
                                    void decide('confirm');
                                },
                                children: clearing ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].clear.confirm : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].confirm
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 67,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: action,
                                disabled: disabled || pending || awaiting,
                                onClick: ()=>{
                                    void decide('cancel');
                                },
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].cancel
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                                lineNumber: 68,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
                        lineNumber: 66,
                        columnNumber: 44
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx",
        lineNumber: 40,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/connected-calendar-schedule.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedCalendarSchedule",
    ()=>ConnectedCalendarSchedule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar-proposal.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/calendar-schedule-draft-card.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$events$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/calendar-events.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const bindingFor = (ticket)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarProposalBindingSchema"].parse({
        proposalId: ticket.proposalId,
        inputHash: ticket.inputHash,
        visitId: ticket.visitId,
        revision: ticket.revision
    });
function ConnectedCalendarSchedule(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConnectedReview, {
        ...props
    }, `${props.workspaceId}:${JSON.stringify(props.ticket)}:${props.disabled}`, false, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/connected-calendar-schedule.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
function ConnectedReview({ ticket, workspaceId, disabled, onRefresh }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(), [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('loading');
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0), lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), controllers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const invalidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        sequence.current++;
    }, []);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (decision)=>{
        const binding = bindingFor(ticket), controller = new AbortController();
        controllers.current.add(controller);
        try {
            const params = new URLSearchParams({
                workspaceId,
                ...binding
            });
            const response = await fetch(decision ? '/api/chat/calendar/proposals' : `/api/chat/calendar/proposals?${params}`, {
                signal: controller.signal,
                cache: 'no-store',
                ...decision ? {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        workspaceId,
                        ...binding,
                        decision
                    })
                } : {}
            });
            if (!response.ok) throw Error();
            const next = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$proposal$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarProposalViewSchema"].parse((await response.json()).view);
            if (JSON.stringify(bindingFor({
                ...next.context,
                state: next.draft.state
            })) !== JSON.stringify(binding)) throw Error();
            return next;
        } finally{
            controllers.current.delete(controller);
        }
    }, [
        workspaceId,
        ticket
    ]);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (disabled || lock.current) return;
        const token = ++sequence.current;
        try {
            const next = await request();
            if (mounted.current && token === sequence.current) setView(next);
        } catch  {
            if (mounted.current && token === sequence.current) {
                setView(undefined);
                setState('unavailable');
            }
        }
    }, [
        disabled,
        request
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const active = controllers.current;
        const timer = setTimeout(()=>{
            void load();
        }, 0), recheck = ()=>{
            if (document.visibilityState !== 'hidden') void load();
        }, idle = setInterval(recheck, 15000);
        window.addEventListener('focus', recheck);
        return ()=>{
            mounted.current = false;
            invalidate();
            for (const controller of active)controller.abort();
            clearTimeout(timer);
            clearInterval(idle);
            window.removeEventListener('focus', recheck);
        };
    }, [
        load,
        invalidate
    ]);
    async function decide(input) {
        const { decision, ...binding } = input;
        if (disabled || lock.current || !view || JSON.stringify(binding) !== JSON.stringify(bindingFor(ticket))) return {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].states.unavailable
        };
        lock.current = true;
        const token = ++sequence.current;
        try {
            const next = await request(decision);
            if (!mounted.current || token !== sequence.current) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].states.unavailable
            };
            setView(next);
            if (next.draft.state === 'confirmed') window.dispatchEvent(new Event(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$events$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleChangedEvent"]));
            try {
                await onRefresh();
            } catch  {}
            return {
                ok: true
            };
        } catch  {
            if (mounted.current && token === sequence.current) {
                setView(undefined);
                setState('unavailable');
            }
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].states.unavailable
            };
        } finally{
            lock.current = false;
        }
    }
    if (disabled || !view) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].title,
        "aria-busy": !disabled && state === 'loading',
        className: "mt-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "m-0 text-base font-semibold",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/connected-calendar-schedule.tsx",
                lineNumber: 53,
                columnNumber: 221
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "mb-0 mt-3 text-sm leading-6 text-assistant-muted",
                children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].states.unavailable : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarScheduleDraftCardData"].states[state]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/connected-calendar-schedule.tsx",
                lineNumber: 53,
                columnNumber: 282
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/connected-calendar-schedule.tsx",
        lineNumber: 53,
        columnNumber: 33
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$calendar$2d$schedule$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarScheduleDraftCard"], {
        draft: view.draft,
        context: view.context,
        onDecide: decide
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/connected-calendar-schedule.tsx",
        lineNumber: 54,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarAvailabilityCardData",
    ()=>calendarAvailabilityCardData
]);
const calendarAvailabilityCardData = {
    title: 'Dates to review',
    scope: {
        workspace: 'Permitted workspace schedule',
        own: 'Only my schedule'
    },
    basis: 'Schedule-based suggestions, not confirmed availability',
    limitations: 'Based only on Calendar visits you may access. Working hours, time off, holidays, travel time and external calendars are not checked. Arrival windows do not represent the full duration of a job.',
    snapshot: 'This is a snapshot. Review the latest schedule before planning a visit. Nothing has been booked or changed.',
    timezone: 'Workspace timezone',
    checked: 'Checked at',
    period: 'Dates checked',
    window: 'Requested arrival window',
    countOnly: 'No arrival window requested · comparing daily visit counts only',
    people: 'People checked',
    person: 'Assigned person',
    visits: (count)=>`${count} ${count === 1 ? 'scheduled visit' : 'scheduled visits'} on this date`,
    noKnownOverlap: 'No overlap among visible visits with known arrival windows.',
    notChecked: 'Arrival-window overlap has not been checked for this date.',
    unknown: (count)=>`${count} ${count === 1 ? 'visit has' : 'visits have'} no arrival window. Timing cannot be fully checked.`,
    busy: 'Busy day',
    busyDetail: 'Already four or more visible visits. Review the workload before adding another.',
    shown: (shown, total)=>`Showing ${shown} of ${total} ${total === 1 ? 'candidate date' : 'candidate dates'}.`,
    empty: 'No candidate dates matched this check. This does not mean the person is fully booked. Try a different date range or arrival window.',
    openDate: 'Review date in Calendar',
    openCalendar: 'Open in Calendar',
    openDateLabel: (date, person)=>`Review ${date} for ${person} in Calendar`,
    states: {
        loading: 'Checking dates in the permitted schedule…',
        error: 'Date suggestions could not be loaded. Ask the assistant to check again.',
        unavailable: 'These suggestions are no longer available with your current access. Ask the assistant to check again.'
    },
    date: (value)=>new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(`${value}T12:00:00Z`)),
    timestamp: (value, timezone)=>new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone
        }).format(new Date(value)),
    stories: {
        heading: 'Calendar date suggestions in the assistant',
        notice: 'Design preview. Data is fictional; buttons report intent without navigating or saving.',
        person: 'Sam Rivera',
        longPerson: 'Alexandra Montgomery-Sánchez — Residential installation and maintenance team',
        checkedAt: '2026-10-21T14:30:00Z',
        timezone: 'America/New_York',
        from: '2026-10-22',
        to: '2026-10-28',
        dates: [
            '2026-10-22',
            '2026-10-23',
            '2026-10-26'
        ],
        openedDate: 'Calendar date review requested. No visit was booked.',
        openedCalendar: 'Calendar requested. This preview does not navigate.'
    }
};
}),
"[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarAvailabilityCard",
    ()=>CalendarAvailabilityCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/status-badge/status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/calendar-event-card/calendar-event-card.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function valid(result) {
    if (!result?.id || !result.viewerId || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(result.from).success || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(result.to).success || result.from > result.to || !Number.isFinite(Date.parse(result.checkedAt))) return false;
    if (!Number.isSafeInteger(result.total) || result.total < result.suggestions.length || result.suggestions.length > 3 || result.total > 0 && !result.suggestions.length) return false;
    if (!result.people.length || result.people.length > 10 || new Set(result.people.map((p)=>p.id)).size !== result.people.length || result.people.some((p)=>!p.id || !p.name.trim() || result.scope === 'own' && p.id !== result.viewerId)) return false;
    if (new Set(result.suggestions.map((s)=>s.id)).size !== result.suggestions.length || new Set(result.suggestions.map((s)=>`${s.person.id}:${s.date}`)).size !== result.suggestions.length) return false;
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: result.timezone
        });
    } catch  {
        return false;
    }
    return result.suggestions.every((s)=>!!s.id && !!s.person.id && !!s.person.name.trim() && result.people.some((p)=>p.id === s.person.id && p.name === s.person.name) && __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(s.date).success && s.date >= result.from && s.date <= result.to && Number.isSafeInteger(s.visitCount) && s.visitCount >= 0 && Number.isSafeInteger(s.unknownWindowCount) && s.unknownWindowCount >= 0 && s.unknownWindowCount <= s.visitCount && (result.scope !== 'own' || s.person.id === result.viewerId) && (s.timing !== 'no-known-overlap' || result.arrivalWindow !== null && (s.visitCount === 0 || s.unknownWindowCount < s.visitCount)));
}
const action = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-3 py-2 text-left text-sm font-semibold text-assistant-foreground hover:bg-assistant-header focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:text-assistant-muted';
function CalendarAvailabilityCard({ result, state = 'ready', disabled = false, onOpenDate, onOpenCalendar }) {
    const unavailable = state !== 'ready' ? state : !valid(result) ? 'error' : undefined;
    const ready = unavailable ? undefined : result;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].title,
        "aria-busy": state === 'loading',
        className: "mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "m-0 text-base font-semibold",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                lineNumber: 37,
                columnNumber: 5
            }, this),
            unavailable ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "mb-0 mt-3 text-sm leading-6 text-assistant-muted",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].states[unavailable]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                lineNumber: 38,
                columnNumber: 20
            }, this) : ready && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-sm font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].scope[ready.scope]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 39,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "mt-3 grid gap-2 rounded-xl border border-assistant-border bg-assistant-message p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].basis
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 40,
                                columnNumber: 109
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-xs leading-5 text-assistant-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].limitations
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 40,
                                columnNumber: 166
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 40,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "mb-0 mt-4 grid min-w-0 gap-3 text-xs leading-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].people
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 42,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 wrap-anywhere",
                                        children: ready.people.map((p)=>p.name).join(', ')
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 42,
                                        columnNumber: 69
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 42,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].period
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 43,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 wrap-anywhere",
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].date(ready.from),
                                            " – ",
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].date(ready.to)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 43,
                                        columnNumber: 69
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 43,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].timezone
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 44,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 wrap-anywhere",
                                        children: ready.timezone
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 44,
                                        columnNumber: 71
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 44,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].window
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 45,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0",
                                        children: ready.arrivalWindow ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].window(ready.arrivalWindow) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].countOnly
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 45,
                                        columnNumber: 69
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 45,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].checked
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 46,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].timestamp(ready.checkedAt, ready.timezone)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 46,
                                        columnNumber: 70
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 46,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 41,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "mb-0 mt-4 text-sm leading-6",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].shown(ready.suggestions.length, ready.total)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 48,
                        columnNumber: 7
                    }, this),
                    !ready.suggestions.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-sm leading-6 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].empty
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 49,
                        columnNumber: 36
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "mb-0 mt-3 grid list-none gap-3 p-0",
                        children: ready.suggestions.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-message p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "m-0 text-sm font-semibold",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                            dateTime: s.date,
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].date(s.date)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                            lineNumber: 50,
                                            columnNumber: 51
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 50,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-sm leading-6 wrap-anywhere",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "sr-only",
                                                children: [
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].person,
                                                    ": "
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                                lineNumber: 51,
                                                columnNumber: 60
                                            }, this),
                                            s.person.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 51,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-xs leading-5 text-assistant-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].visits(s.visitCount)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 52,
                                        columnNumber: 9
                                    }, this),
                                    ready.arrivalWindow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-xs leading-5",
                                        children: s.timing === 'no-known-overlap' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].noKnownOverlap : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].notChecked
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 53,
                                        columnNumber: 33
                                    }, this),
                                    s.unknownWindowCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 rounded-lg border border-assistant-border p-3 text-xs font-semibold leading-5",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].unknown(s.unknownWindowCount)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 54,
                                        columnNumber: 38
                                    }, this),
                                    s.visitCount >= 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex max-w-full justify-self-start rounded-full bg-paper",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].busy,
                                                    tone: "warning"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                                    lineNumber: 55,
                                                    columnNumber: 141
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                                lineNumber: 55,
                                                columnNumber: 59
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "m-0 text-xs leading-5",
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].busyDetail
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                                lineNumber: 55,
                                                columnNumber: 195
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 55,
                                        columnNumber: 31
                                    }, this),
                                    onOpenDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `${action} justify-self-start`,
                                        disabled: disabled,
                                        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].openDateLabel(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].date(s.date), s.person.name),
                                        onClick: ()=>{
                                            if (!disabled) onOpenDate(ready.id, s.id);
                                        },
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].openDate
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                        lineNumber: 56,
                                        columnNumber: 24
                                    }, this)
                                ]
                            }, s.id, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                                lineNumber: 49,
                                columnNumber: 198
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 49,
                        columnNumber: 119
                    }, this),
                    onOpenCalendar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: `${action} mt-4`,
                        disabled: disabled,
                        onClick: ()=>{
                            if (!disabled) onOpenCalendar(ready.id);
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].openCalendar
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 58,
                        columnNumber: 26
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-xs leading-5 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarAvailabilityCardData"].snapshot
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
                        lineNumber: 59,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx",
        lineNumber: 36,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calendarResultsCardData",
    ()=>calendarResultsCardData
]);
const calendarResultsCardData = {
    titles: {
        schedule: 'Calendar visits',
        unscheduled: 'Unscheduled visits'
    },
    scope: {
        workspace: 'Workspace schedule',
        own: 'Only my schedule'
    },
    types: {
        job: 'Job',
        work_order: 'Work Order'
    },
    shared: 'Shared visit · counted once',
    team: 'Assigned team',
    unassigned: 'Unassigned',
    noWindow: 'Arrival window not set',
    noDate: 'Not scheduled',
    filters: 'Calendar filters',
    timezone: 'Workspace timezone',
    captured: 'Checked at',
    open: 'View visit',
    openCalendar: 'Open in Calendar',
    empty: {
        schedule: 'No visits match this range and these filters.',
        unscheduled: 'No active unscheduled visits match these filters.'
    },
    count: (shown, total)=>`Showing ${shown} of ${total} ${total === 1 ? 'visit' : 'visits'}.`,
    historical: 'This is a snapshot. Open Calendar to check the latest schedule. This result does not change any dates or assignments.',
    viewLabel: (title)=>`View visit: ${title}`,
    states: {
        loading: 'Checking the current schedule…',
        error: 'Calendar results could not be loaded. Ask the assistant to check again.',
        unavailable: 'These Calendar results are no longer available with your current access. Ask the assistant to check again.'
    },
    date: (date)=>new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(`${date}T12:00:00Z`)),
    timestamp: (value, timezone)=>new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone
        }).format(new Date(value)),
    stories: {
        heading: 'Calendar results in the shared assistant',
        notice: 'Design preview. People and records are fictional; buttons only report callback intent.',
        openedVisit: 'Visit details requested. Nothing was changed.',
        openedCalendar: 'Calendar requested. This preview does not navigate.',
        from: '2026-10-19',
        to: '2026-10-25',
        checkedAt: '2026-10-21T14:30:00Z',
        timezone: 'America/New_York',
        filters: [
            'All people',
            'Jobs and Work Orders'
        ],
        ownFilter: 'My assigned visits',
        longFilter: 'Customer: Northside Community Workshop and Neighborhood Resource Center',
        jobNumber: 'J-1043',
        workOrderNumber: 'WO-1008'
    }
};
}),
"[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarResultsCard",
    ()=>CalendarResultsCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/status-badge/status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/calendar/calendar-event-card/calendar-event-card.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-status-badge/job-status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$work$2d$orders$2f$work$2d$order$2d$status$2d$badge$2f$work$2d$order$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/work-orders/work-order-status-badge/work-order-status-badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function validResult(result) {
    if (!result || !result.id || !Number.isSafeInteger(result.total) || result.total < result.visits.length || result.visits.length > 25 || result.total > 0 && !result.visits.length || new Set(result.visits.map((v)=>v.id)).size !== result.visits.length || !Number.isFinite(Date.parse(result.checkedAt))) return false;
    const recordKeys = result.visits.flatMap((v)=>v.records.map((r)=>`${r.type}:${r.id}`));
    if (new Set(recordKeys).size !== recordKeys.length) return false;
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: result.timezone
        }).format();
    } catch  {
        return false;
    }
    if (result.mode === 'schedule' && (!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(result.from).success || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(result.to).success || result.from > result.to)) return false;
    return result.visits.every((visit)=>!!visit.id && !!visit.title.trim() && visit.records.length > 0 && new Set(visit.records.map((r)=>`${r.type}:${r.id}`)).size === visit.records.length && (result.mode === 'unscheduled' ? visit.scheduledDate === null && visit.arrivalWindow === null : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(visit.scheduledDate).success && visit.scheduledDate >= result.from && visit.scheduledDate <= result.to));
}
const action = 'min-h-11 cursor-pointer rounded-lg border border-assistant-border px-3 py-2 text-left text-sm font-semibold text-assistant-foreground hover:bg-assistant-header focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:text-assistant-muted';
function CalendarResultsCard({ result, state = 'ready', disabled = false, onOpenVisit, onOpenCalendar }) {
    const unavailable = state !== 'ready' ? state : !validResult(result) ? 'error' : undefined;
    const ready = unavailable ? undefined : result;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": ready ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].titles[ready.mode] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].titles.schedule,
        "aria-busy": state === 'loading',
        className: "mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "m-0 text-base font-semibold",
                children: ready ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].titles[ready.mode] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].titles.schedule
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                lineNumber: 48,
                columnNumber: 5
            }, this),
            unavailable ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "mb-0 mt-3 text-sm leading-6 text-assistant-muted",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].states[unavailable]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                lineNumber: 49,
                columnNumber: 20
            }, this) : ready && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-sm font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].scope[ready.scope]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 50,
                        columnNumber: 7
                    }, this),
                    ready.mode === 'schedule' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-2 text-sm leading-6",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].date(ready.from),
                            " – ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].date(ready.to)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 51,
                        columnNumber: 37
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-2 text-xs leading-5 text-assistant-muted wrap-anywhere",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].timezone,
                            ": ",
                            ready.timezone,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                lineNumber: 52,
                                columnNumber: 118
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].captured,
                            ": ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].timestamp(ready.checkedAt, ready.timezone)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 52,
                        columnNumber: 7
                    }, this),
                    !!ready.filterLabels.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].filters,
                        className: "mb-0 mt-3 flex list-none flex-wrap gap-2 p-0",
                        children: ready.filterLabels.map((label, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "max-w-full rounded-lg border border-assistant-border px-2 py-1 text-xs leading-5 wrap-anywhere",
                                children: label
                            }, index, false, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                lineNumber: 53,
                                columnNumber: 168
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 53,
                        columnNumber: 39
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "mb-0 mt-3 text-sm leading-6",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].count(ready.visits.length, ready.total)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 54,
                        columnNumber: 7
                    }, this),
                    !ready.visits.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-sm leading-6 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].empty[ready.mode]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 55,
                        columnNumber: 31
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "mb-0 mt-4 grid list-none gap-3 p-0",
                        children: ready.visits.map((visit)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-message p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "m-0 text-sm font-semibold wrap-anywhere",
                                        children: visit.title
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                        lineNumber: 57,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-sm leading-6",
                                        children: [
                                            visit.scheduledDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                                dateTime: visit.scheduledDate,
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].date(visit.scheduledDate)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                lineNumber: 58,
                                                columnNumber: 71
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].noDate
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                lineNumber: 58,
                                                columnNumber: 150
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                lineNumber: 58,
                                                columnNumber: 177
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: visit.arrivalWindow ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$calendar$2f$calendar$2d$event$2d$card$2f$calendar$2d$event$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarEventCardData"].window(visit.arrivalWindow) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].noWindow
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                lineNumber: 58,
                                                columnNumber: 182
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                        lineNumber: 58,
                                        columnNumber: 11
                                    }, this),
                                    visit.records.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex max-w-full justify-self-start rounded-full bg-paper",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                            label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].shared,
                                            tone: "info"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                            lineNumber: 59,
                                            columnNumber: 122
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                        lineNumber: 59,
                                        columnNumber: 40
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "m-0 grid list-none gap-2 p-0",
                                        children: visit.records.map((record)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "flex min-w-0 flex-wrap items-center justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-semibold wrap-anywhere",
                                                        children: [
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].types[record.type],
                                                            " · ",
                                                            record.number,
                                                            " · ",
                                                            record.title
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                        lineNumber: 60,
                                                        columnNumber: 195
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex max-w-full rounded-full bg-paper",
                                                        children: record.type === 'job' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatusBadge"], {
                                                            status: record.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                            lineNumber: 60,
                                                            columnNumber: 404
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$work$2d$orders$2f$work$2d$order$2d$status$2d$badge$2f$work$2d$order$2d$status$2d$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WorkOrderStatusBadge"], {
                                                            status: record.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                            lineNumber: 60,
                                                            columnNumber: 447
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                        lineNumber: 60,
                                                        columnNumber: 316
                                                    }, this)
                                                ]
                                            }, `${record.type}:${record.id}`, true, {
                                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                                lineNumber: 60,
                                                columnNumber: 85
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                        lineNumber: 60,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-xs leading-5 text-assistant-muted wrap-anywhere",
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].team,
                                            ": ",
                                            [
                                                ...new Map(visit.crew.map((p)=>[
                                                        p.id,
                                                        p.name
                                                    ])).values()
                                            ].join(', ') || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].unassigned
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                        lineNumber: 61,
                                        columnNumber: 11
                                    }, this),
                                    onOpenVisit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `${action} justify-self-start`,
                                        disabled: disabled,
                                        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].viewLabel(visit.title),
                                        onClick: ()=>{
                                            if (!disabled) onOpenVisit(ready.id, visit.id);
                                        },
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].open
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                        lineNumber: 62,
                                        columnNumber: 27
                                    }, this)
                                ]
                            }, visit.id, true, {
                                fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                                lineNumber: 56,
                                columnNumber: 36
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 55,
                        columnNumber: 126
                    }, this),
                    onOpenCalendar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: `${action} mt-4`,
                        disabled: disabled,
                        onClick: ()=>{
                            if (!disabled) onOpenCalendar(ready.id);
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].openCalendar
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 65,
                        columnNumber: 26
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-3 text-xs leading-5 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarResultsCardData"].historical
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
                        lineNumber: 66,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx",
        lineNumber: 47,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/calendar-results-card/connected-calendar-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedCalendarResult",
    ()=>ConnectedCalendarResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/calendar-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-availability-card/calendar-availability-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-results-card/calendar-results-card.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function ConnectedCalendarResult({ result, workspaceId, turnId, disabled, onNavigate }) {
    const [current, setCurrent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(), [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('loading'), [opening, setOpening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0), flight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), controllers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const latestDisabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(disabled);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        latestDisabled.current = disabled;
    }, [
        disabled
    ]);
    const invalidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        sequence.current++;
    }, []);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (flight.current) return;
        const token = ++sequence.current, controller = new AbortController();
        controllers.current.add(controller);
        try {
            const params = new URLSearchParams({
                workspaceId,
                turnId,
                resultId: result.id
            });
            const response = await fetch(`/api/chat/calendar?${params}`, {
                cache: 'no-store',
                signal: controller.signal
            });
            if (!response.ok) throw Error();
            const next = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$calendar$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calendarChatResultSchema"].parse((await response.json()).result);
            if (next.id !== result.id || next.mode !== result.mode) throw Error();
            if (mounted.current && token === sequence.current) {
                setCurrent(next);
                setState('ready');
            }
        } catch  {
            if (mounted.current && token === sequence.current) {
                setCurrent(undefined);
                setState('unavailable');
            }
        } finally{
            controllers.current.delete(controller);
        }
    }, [
        workspaceId,
        turnId,
        result.id,
        result.mode
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        void Promise.resolve().then(refresh);
        const active = controllers.current;
        const recheck = ()=>{
            if (document.visibilityState !== 'hidden') void refresh();
        };
        window.addEventListener('focus', recheck);
        const timer = setInterval(recheck, 15000);
        return ()=>{
            mounted.current = false;
            invalidate();
            for (const c of active)c.abort();
            clearInterval(timer);
            window.removeEventListener('focus', recheck);
        };
    }, [
        refresh,
        invalidate
    ]);
    async function open(resultId, visitId, suggestionId) {
        if (disabled || flight.current || state !== 'ready' || resultId !== result.id) return;
        flight.current = true;
        setOpening(true);
        const token = ++sequence.current, controller = new AbortController();
        controllers.current.add(controller);
        try {
            const response = await fetch('/api/chat/calendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal,
                body: JSON.stringify({
                    workspaceId,
                    turnId,
                    resultId,
                    ...visitId ? {
                        visitId
                    } : {},
                    ...suggestionId ? {
                        suggestionId
                    } : {}
                })
            });
            if (!response.ok) throw Error();
            const value = await response.json();
            if (typeof value.href !== 'string') throw Error();
            const url = new URL(value.href, window.location.origin);
            if (url.origin !== window.location.origin || url.pathname !== '/calendar' || url.searchParams.get('workspace') !== workspaceId || (url.searchParams.get('visit') ?? undefined) !== visitId) throw Error();
            if (current?.mode === 'availability') {
                const suggestion = suggestionId ? current.suggestions.find((s)=>s.id === suggestionId) : undefined;
                if (suggestionId && !suggestion) throw Error();
                const person = current.scope === 'own' ? 'me' : suggestion ? `member:${suggestion.person.id}` : current.people.length === 1 ? `member:${current.people[0].id}` : 'all';
                if (url.searchParams.get('date') !== (suggestion?.date ?? current.from) || url.searchParams.get('person') !== person || url.searchParams.get('recordType') !== 'all' || url.searchParams.get('status') !== 'all' || url.searchParams.get('customerQuery') !== '') throw Error();
            }
            if (mounted.current && token === sequence.current && !latestDisabled.current) onNavigate(url.pathname + url.search);
        } catch  {
            if (mounted.current && token === sequence.current) {
                setCurrent(undefined);
                setState('unavailable');
            }
        } finally{
            controllers.current.delete(controller);
            flight.current = false;
            if (mounted.current) setOpening(false);
        }
    }
    if (result.mode === 'availability') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$availability$2d$card$2f$calendar$2d$availability$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarAvailabilityCard"], {
        result: current?.mode === 'availability' ? current : undefined,
        state: state,
        disabled: disabled || opening,
        onOpenDate: (id, suggestionId)=>{
            void open(id, undefined, suggestionId);
        },
        onOpenCalendar: (id)=>{
            void open(id);
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/connected-calendar-result.tsx",
        lineNumber: 50,
        columnNumber: 46
    }, this);
    const display = current && current.mode !== 'availability' ? current.mode === 'schedule' ? {
        ...current,
        mode: 'schedule',
        from: current.from,
        to: current.to
    } : {
        ...current,
        mode: 'unscheduled'
    } : undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$calendar$2d$results$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CalendarResultsCard"], {
        result: display,
        state: state,
        disabled: disabled || opening,
        onOpenVisit: (id, visitId)=>{
            void open(id, visitId);
        },
        onOpenCalendar: (id)=>{
            void open(id);
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/calendar-results-card/connected-calendar-result.tsx",
        lineNumber: 52,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/customer-result/customer-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "customerResultData",
    ()=>customerResultData
]);
const customerResultData = {
    failed: "This customer result or proposal changed or is no longer available. Prepare a fresh request.",
    empty: "No matching accessible records.",
    beforeConfirm: "Review the exact action before confirming.",
    exportScope: "Reviewed customer export",
    expired: "Proposal expired. Prepare another export.",
    count: (shown, total)=>`Showing ${shown} of ${total} accessible entries.`,
    details: "Customer details",
    downloadName: "customers.csv"
};
}),
"[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedCustomerResult",
    ()=>ConnectedCustomerResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$customer$2d$draft$2d$card$2f$customer$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/customer-draft-card/customer-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$customer$2d$export$2d$draft$2d$card$2f$customer$2d$export$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/customer-export-draft-card/customer-export-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$record$2d$results$2d$card$2f$record$2d$results$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/record-results-card/record-results-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/customer-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/customer-result/customer-result.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ConnectedCustomerResult({ result, workspaceId, disabled, onRefresh, onNavigate }) {
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Date.now());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (result.draft?.action !== "export" || result.draft.state !== "pending") return;
        const timer = setInterval(()=>setNow(Date.now()), 1000);
        return ()=>clearInterval(timer);
    }, [
        result.draft?.id,
        result.draft?.action,
        result.draft?.state
    ]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""), lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    async function decide(draft, decision, consent) {
        if (disabled || lock.current) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].failed);
        lock.current = true;
        setError("");
        try {
            const response = await fetch("/api/chat/customers/actions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    workspaceId,
                    draftId: draft.id,
                    inputHash: draft.inputHash,
                    decision,
                    ...consent ? {
                        typedConfirmation: consent.typedCustomerNumber,
                        unlinkOpenLeads: consent.unlinkOpenLeads
                    } : {}
                })
            });
            if (!response.ok) {
                await onRefresh();
                throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].failed);
            }
            if (draft.action === "export" && decision === "confirm") {
                const blob = await response.blob(), url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].downloadName;
                document.body.append(link);
                link.click();
                link.remove();
                setTimeout(()=>URL.revokeObjectURL(url), 1000);
            } else __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$customer$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerDraftSchema"].parse((await response.json()).draft);
            await onRefresh(draft.action === "delete" && decision === "confirm");
        } catch  {
            setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].failed);
            throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].failed);
        } finally{
            lock.current = false;
        }
    }
    async function navigate(id) {
        if (disabled || lock.current) return;
        lock.current = true;
        setError("");
        try {
            const kind = [
                "linked_leads",
                "lead_candidates"
            ].includes(result.kind) ? "lead" : "customer";
            const response = await fetch("/api/chat/customers/navigate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    workspaceId,
                    turnId: result.turnId,
                    recordId: id,
                    kind
                })
            });
            if (!response.ok) throw Error();
            const body = await response.json();
            if (typeof body.href !== "string" || !/^\/(customers|leads)\/[0-9a-f-]{36}\?workspace=[0-9a-f-]{36}$/.test(body.href)) throw Error();
            onNavigate(body.href);
        } catch  {
            setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].failed);
            await onRefresh();
        } finally{
            lock.current = false;
        }
    }
    const draft = result.draft;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid min-w-0 gap-4",
        children: [
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                lineNumber: 123,
                columnNumber: 17
            }, this),
            draft ? draft.action === "export" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$customer$2d$export$2d$draft$2d$card$2f$customer$2d$export$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CustomerExportDraftCard"], {
                count: draft.count ?? 0,
                scope: draft.impact ?? `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].exportScope} · ${draft.customer.number}`,
                columns: draft.columns ?? [],
                state: draft.state === "confirmed" ? "confirmed" : draft.state !== "pending" || Date.parse(draft.expiresAt) <= now ? "expired" : "pending",
                onDownload: disabled ? undefined : ()=>decide(draft, "confirm")
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                lineNumber: 126,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$customer$2d$draft$2d$card$2f$customer$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CustomerDraftCard"], {
                draft: {
                    ...draft,
                    action: draft.action
                },
                disabled: disabled,
                onDecide: (_proposal, decision, consent)=>decide(draft, decision, consent)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                lineNumber: 143,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    result.records.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$record$2d$results$2d$card$2f$record$2d$results$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RecordResultsCard"], {
                        kind: [
                            "linked_leads",
                            "lead_candidates"
                        ].includes(result.kind) ? "leads" : "customers",
                        records: result.records,
                        total: result.total,
                        onOpen: (id)=>void navigate(id)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                        lineNumber: 154,
                        columnNumber: 13
                    }, this),
                    (result.fields.length > 0 || result.entries.length > 0 || result.records.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-label": result.title,
                        className: "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "m-0 text-lg font-semibold wrap-anywhere",
                                children: result.title
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                lineNumber: 172,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                className: "m-0 grid min-w-0 gap-3",
                                children: result.fields.map((field, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-sm font-semibold",
                                                children: field.label
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                                lineNumber: 178,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "m-0 whitespace-pre-wrap text-sm wrap-anywhere",
                                                children: field.value
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                                lineNumber: 179,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                        lineNumber: 177,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                lineNumber: 175,
                                columnNumber: 15
                            }, this),
                            result.entries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-sm",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerResultData"].count(result.entries.length, result.total)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                        lineNumber: 187,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "m-0 grid list-none gap-3 p-0",
                                        children: result.entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "rounded-lg border border-assistant-border p-3 text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "m-0 whitespace-pre-wrap wrap-anywhere",
                                                        children: entry.text
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                                        lineNumber: 196,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mb-0 text-assistant-muted wrap-anywhere",
                                                        children: [
                                                            entry.actor,
                                                            " ·",
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                                                dateTime: entry.createdAt,
                                                                children: new Date(entry.createdAt).toLocaleString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                                                lineNumber: 201,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, entry.id, true, {
                                                fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                                lineNumber: 192,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                                        lineNumber: 190,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
                        lineNumber: 168,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/work-order-result/work-order-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "workOrderResultData",
    ()=>workOrderResultData
]);
const workOrderResultData = {
    failed: "This work order proposal changed or is no longer available. Prepare a fresh request.",
    downloadName: "work-orders.csv",
    materialsDownloadName: "materials.csv"
};
}),
"[project]/apps/web/src/features/assistant/work-order-result/work-order-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedWorkOrderResult",
    ()=>ConnectedWorkOrderResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$work$2d$order$2d$draft$2d$card$2f$work$2d$order$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/work-order-draft-card/work-order-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/work-order-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/work-order-result/work-order-result.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ConnectedWorkOrderResult({ result, workspaceId, disabled, onRefresh, onNavigate }) {
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""), lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    async function decide(draft, decision) {
        if (disabled || lock.current) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderResultData"].failed);
        lock.current = true;
        setError("");
        try {
            const response = await fetch("/api/chat/work-orders/actions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    workspaceId,
                    draftId: draft.id,
                    inputHash: draft.inputHash,
                    decision
                })
            });
            if (!response.ok) {
                await onRefresh();
                throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderResultData"].failed);
            }
            if ((draft.action === "export" || draft.action === "material-export") && decision === "confirm") {
                const url = URL.createObjectURL(await response.blob());
                const link = document.createElement("a");
                link.href = url;
                link.download = draft.action === "material-export" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderResultData"].materialsDownloadName : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderResultData"].downloadName;
                document.body.append(link);
                link.click();
                link.remove();
                setTimeout(()=>URL.revokeObjectURL(url), 1000);
            } else __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$work$2d$order$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderChatDraftSchema"].parse((await response.json()).draft);
            await onRefresh();
        } catch  {
            setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderResultData"].failed);
            throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["workOrderResultData"].failed);
        } finally{
            lock.current = false;
        }
    }
    const draft = result.draft;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid min-w-0 gap-4",
        children: [
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/work-order-result/work-order-result.tsx",
                lineNumber: 56,
                columnNumber: 17
            }, this),
            draft ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$work$2d$order$2d$draft$2d$card$2f$work$2d$order$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WorkOrderDraftCard"], {
                draft: draft,
                disabled: disabled,
                onDecide: (_proposal, decision)=>decide(draft, decision),
                onOpen: (id)=>onNavigate(`/work-orders/${id}?workspace=${workspaceId}`)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/work-order-result/work-order-result.tsx",
                lineNumber: 58,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-label": result.title,
                className: "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "m-0 text-lg font-semibold wrap-anywhere",
                    children: result.title
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/work-order-result/work-order-result.tsx",
                    lineNumber: 66,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/work-order-result/work-order-result.tsx",
                lineNumber: 65,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/work-order-result/work-order-result.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateResultData",
    ()=>estimateResultData
]);
const estimateResultData = {
    failed: "These Estimate results may have changed or are no longer available. Results have been refreshed; ask again for a current summary.",
    refreshFailed: "Estimate results could not be refreshed. Reopen the assistant before trying again."
};
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateReadResultData",
    ()=>estimateReadResultData
]);
const estimateReadResultData = {
    titles: {
        get: "Estimate details",
        explain_totals: "Estimate total explanation",
        compare_revisions: "Estimate revision comparison",
        summarize_scope: "Estimate scope summary",
        unavailable: "Estimate unavailable"
    },
    readOnly: "Read-only saved evidence. No estimate, delivery, Job or payment is changed by this card.",
    unavailable: "No accessible current estimate matched that exact reference. Ask again with an authorized Estimate number.",
    amountUnavailable: "Amount unavailable",
    taxableDiscount: "Taxable discount share",
    nonTaxableDiscount: "Non-taxable discount share",
    timeUnavailable: "Time unavailable",
    retrieved: "Retrieved",
    scope: "Scope",
    scopes: {
        workspace: "Workspace",
        assigned: "Assigned jobs only"
    },
    source: "Amount and scope source",
    sources: {
        current_draft: "Current Draft calculation",
        frozen_snapshot: "Verified frozen snapshot"
    },
    storedScope: "Saved estimate scope",
    parent: "Related record",
    parentUnavailable: "Related Lead/Job context is unavailable with your current access.",
    parentName: "Related record name",
    service: "Service",
    customer: "Customer",
    status: "Status",
    notProvided: "Not provided",
    noDate: "No valid-until date",
    open: "Open estimate",
    openRevision: (number, revision)=>`Open ${number} · Revision ${revision}`,
    revision: (revision)=>`Revision ${revision}`,
    lineCount: (shown, total)=>`Showing ${shown} of ${total} line items.`,
    changeCount: (shown, total)=>`Showing ${shown} of ${total} changed line positions.`,
    lineWindow: "Some line items are omitted to keep this response bounded. Totals still cover every saved line. Open the estimate for the full list.",
    changedWindow: "Some changed lines are omitted. The total difference still compares both complete estimates.",
    issues: {
        items: "Line items are incomplete or invalid; dependent amounts remain unavailable.",
        discount: "The saved discount needs correction in the estimate.",
        taxRate: "The saved tax rate needs correction in the estimate.",
        deposit: "The saved deposit needs correction in the estimate."
    },
    invalidLine: "This line contains invalid inputs. Review it in the estimate.",
    noLines: "No saved line items.",
    unit: "Unit",
    delivery: "Delivery state",
    email: "Email",
    attempts: "Email attempts",
    emailUpdated: "Last email update",
    customerLink: "Customer link",
    linkExpiry: "Link expiry",
    firstViewed: "First customer view",
    emailStates: {
        "not-sent": "Not sent",
        queued: "Queued",
        sent: "Sent",
        failed: "Failed",
        bounced: "Bounced"
    },
    linkStates: {
        "not-created": "Not created",
        active: "Active",
        expired: "Expired",
        revoked: "Revoked",
        replaced: "Replaced",
        unavailable: "Unavailable"
    },
    recentHistory: "Recent lifecycle history",
    historyWindow: "Only share, decision and delivery milestones from the most recent activity window are shown. Private notes and reasons are omitted.",
    noEvents: "No matching milestones in this recent activity window.",
    historyMore: "Older activity exists. Open the estimate to read its authorized history.",
    oneRevision: "At least two accessible revisions are required to compare.",
    compared: "The two latest accessible revisions, older to newer. Lines are compared by position.",
    before: "Before",
    after: "After",
    absentLine: "No line at this position",
    totalDifference: "Total difference",
    noChanges: "No changes in the compared scope, pricing or line-item fields.",
    truncated: "Text shortened for this response. Open the estimate for the full value.",
    snapshot: "Point-in-time evidence. Ask again for a fresh read; changed or restricted evidence is removed on reauthorization."
};
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstimateReadResult",
    ()=>EstimateReadResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/money-text/money-text.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$status$2d$badge$2f$estimate$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-status-badge/estimate-status-badge.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-totals/estimate-totals.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-items-editor/estimate-items-editor.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-history-timeline/estimate-history-timeline.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$timestamp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-timestamp.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$summary$2d$card$2f$estimate$2d$summary$2d$card$2e$preview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-summary-card/estimate-summary-card.preview.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.data.ts [app-ssr] (ecmascript)");
"use client";
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
const panel = "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-message p-4";
function Amount({ cents }) {
    return cents === null ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].amountUnavailable : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$money$2d$text$2f$money$2d$text$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MoneyText"], {
        cents: cents
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
        lineNumber: 19,
        columnNumber: 49
    }, this);
}
function Status({ estimate }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "m-0 text-sm font-semibold text-assistant-muted",
        children: [
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].status,
            ": ",
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$status$2d$badge$2f$estimate$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateStatusBadgeData"].statuses[estimate.status].label,
            estimate.archived ? ` · ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$status$2d$badge$2f$estimate$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateStatusBadgeData"].archived}` : ""
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
function Fields({ entries }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
        className: "m-0 grid min-w-0 gap-3 text-sm",
        children: entries.map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                        className: "font-semibold text-assistant-muted",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 30,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                        className: "m-0 mt-1 whitespace-pre-wrap wrap-anywhere",
                        children: value
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 31,
                        columnNumber: 7
                    }, this)
                ]
            }, label, true, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 29,
                columnNumber: 38
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, this);
}
function Excerpt({ value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "whitespace-pre-wrap wrap-anywhere",
                children: value.text || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].notProvided
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 37,
                columnNumber: 5
            }, this),
            value.truncated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-0 mt-2 text-xs text-assistant-muted",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].truncated
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 38,
                columnNumber: 25
            }, this)
        ]
    }, void 0, true);
}
function adjustment(value) {
    return value.type === "none" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].types.none : `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].types[value.type]}: ${value.value || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].notProvided}${value.type === "percent" ? "%" : " USD"}`;
}
function Line({ item }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid min-w-0 gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 whitespace-pre-wrap text-sm font-semibold wrap-anywhere",
                children: item.description || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].notProvided
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 47,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                entries: [
                    [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].quantity,
                        item.quantity || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].notProvided
                    ],
                    [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].unit,
                        item.unit || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].notProvided
                    ],
                    [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].unitPrice,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Amount, {
                            cents: item.unitPriceCents
                        }, "price", false, {
                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                            lineNumber: 51,
                            columnNumber: 28
                        }, this)
                    ],
                    [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].amount,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Amount, {
                            cents: item.amountCents
                        }, "amount", false, {
                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                            lineNumber: 52,
                            columnNumber: 25
                        }, this)
                    ]
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 48,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm text-assistant-muted",
                children: [
                    item.taxable ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].taxable : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].notTaxable,
                    item.included ? ` · ${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].included}` : ""
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 54,
                columnNumber: 5
            }, this),
            item.invalidFields.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm font-semibold text-assistant-foreground",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].invalidLine
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 58,
                columnNumber: 39
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
        lineNumber: 46,
        columnNumber: 10
    }, this);
}
function Pricing({ value }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-totals`,
                className: panel,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        id: `${id}-totals`,
                        className: "m-0 text-base font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 65,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                        entries: [
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].source,
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].sources[value.source]
                            ],
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].discountType,
                                adjustment(value.adjustments.discount)
                            ],
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].taxRate,
                                value.adjustments.taxRate ? `${value.adjustments.taxRate}%` : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].notProvided
                            ],
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].depositSetting,
                                adjustment(value.adjustments.deposit)
                            ],
                            ...[
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].subtotal,
                                    value.totals.subtotalCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].discount,
                                    value.totals.discountCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].taxableDiscount,
                                    value.totals.taxableDiscountCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].nonTaxableDiscount,
                                    value.totals.nonTaxableDiscountCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].taxableBase,
                                    value.totals.taxableAfterDiscountCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].tax,
                                    value.totals.taxCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].total,
                                    value.totals.totalCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].deposit,
                                    value.totals.depositCents
                                ],
                                [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].balance,
                                    value.totals.balanceCents
                                ]
                            ].map(([label, cents])=>[
                                    label,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Amount, {
                                        cents: cents
                                    }, label, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                        lineNumber: 81,
                                        columnNumber: 53
                                    }, this)
                                ])
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 66,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-xs leading-5 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].allocation
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 83,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-xs leading-5 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].depositHint
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 84,
                        columnNumber: 7
                    }, this),
                    value.issues.map((issue)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "m-0 text-sm font-semibold text-assistant-foreground",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].issues[issue]
                        }, issue, false, {
                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                            lineNumber: 85,
                            columnNumber: 34
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 64,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "aria-labelledby": `${id}-lines`,
                className: panel,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        id: `${id}-lines`,
                        className: "m-0 text-base font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 88,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].lineCount(value.lineItems.length, value.lineItemCount)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 89,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "m-0 grid min-w-0 list-none gap-4 p-0",
                        children: value.lineItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "grid min-w-0 gap-3 border-t border-assistant-border pt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                        className: "m-0 text-sm font-semibold",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].line(item.position)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                        lineNumber: 92,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                                        item: item
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                        lineNumber: 93,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, item.position, true, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 91,
                                columnNumber: 38
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 90,
                        columnNumber: 7
                    }, this),
                    value.lineItemCount === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].noLines
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 96,
                        columnNumber: 37
                    }, this),
                    value.lineItems.length < value.lineItemCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].lineWindow
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 97,
                        columnNumber: 56
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 87,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true);
}
function EstimateReadResult({ card, disabled, onOpenEstimate }) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const formatter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$timestamp$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createEstimateTimestampFormatter"])(card.timezone);
    const time = (value)=>value && formatter ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
            dateTime: value,
            children: formatter.format(new Date(value))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
            lineNumber: 112,
            columnNumber: 7
        }, this) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].timeUnavailable;
    const open = (estimate, label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "button",
            disabled: disabled,
            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"]} justify-self-start`,
            onClick: ()=>{
                if (!disabled) onOpenEstimate(estimate.id);
            },
            children: label
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
            lineNumber: 114,
            columnNumber: 5
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "mt-4 grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground print:hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                id: `${id}-title`,
                className: "m-0 text-base font-semibold",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].titles[card.kind]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 117,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-sm leading-6 text-assistant-muted",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].readOnly
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 118,
                columnNumber: 5
            }, this),
            card.estimate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid min-w-0 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-base font-semibold wrap-anywhere",
                        children: [
                            card.estimate.number,
                            " · ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].revision(card.estimate.revision),
                            " · ",
                            card.estimate.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 120,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Status, {
                        estimate: card.estimate
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 121,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 119,
                columnNumber: 23
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                entries: [
                    [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].scope,
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].scopes[card.scope]
                    ],
                    [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].retrieved,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                time(card.retrievedAt),
                                " · ",
                                card.timezone
                            ]
                        }, "retrieved", true, {
                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                            lineNumber: 123,
                            columnNumber: 70
                        }, this)
                    ]
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 123,
                columnNumber: 5
            }, this),
            card.kind === "unavailable" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "m-0 text-sm leading-6",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].unavailable
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 124,
                columnNumber: 37
            }, this),
            card.kind === "get" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                        entries: [
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].parent,
                                card.parentNumber
                            ],
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateHistoryTimelineData"].fields.validUntil,
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$summary$2d$card$2f$estimate$2d$summary$2d$card$2e$preview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatEstimateSummaryDate"])(card.validUntil) ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].noDate
                            ]
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 126,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Pricing, {
                        value: card.pricing
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 127,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": `${id}-delivery`,
                        className: panel,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                id: `${id}-delivery`,
                                className: "m-0 text-base font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].delivery
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 129,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                                entries: [
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].email,
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].emailStates[card.delivery.email.state]
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].attempts,
                                        card.delivery.email.attemptCount
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].emailUpdated,
                                        time(card.delivery.email.updatedAt)
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].customerLink,
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].linkStates[card.delivery.link.state]
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].linkExpiry,
                                        time(card.delivery.link.expiresAt)
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].firstViewed,
                                        time(card.delivery.link.firstViewedAt)
                                    ]
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 130,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 128,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": `${id}-history`,
                        className: panel,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                id: `${id}-history`,
                                className: "m-0 text-base font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].recentHistory
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 138,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm leading-6 text-assistant-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].historyWindow
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 139,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                className: "m-0 grid min-w-0 list-none gap-3 p-0",
                                children: card.history.events.map((event, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "grid min-w-0 gap-1 text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateHistoryTimelineData"].events[event.kind]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 142,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: time(event.at)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 143,
                                                columnNumber: 13
                                            }, this),
                                            event.decisionDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateHistoryTimelineData"].decisionDate,
                                                    ": ",
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$summary$2d$card$2f$estimate$2d$summary$2d$card$2e$preview$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatEstimateSummaryDate"])(event.decisionDate)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 144,
                                                columnNumber: 36
                                            }, this),
                                            event.channel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateHistoryTimelineData"].channel,
                                                    ": ",
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateHistoryTimelineData"].channels[event.channel]
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 145,
                                                columnNumber: 31
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                        lineNumber: 141,
                                        columnNumber: 54
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 140,
                                columnNumber: 9
                            }, this),
                            !card.history.events.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].noEvents
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 148,
                                columnNumber: 41
                            }, this),
                            card.history.hasMore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm text-assistant-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].historyMore
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 149,
                                columnNumber: 34
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 137,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true),
            card.kind === "explain_totals" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Pricing, {
                value: card.pricing
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 152,
                columnNumber: 40
            }, this),
            card.kind === "summarize_scope" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                        entries: [
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].source,
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].sources[card.source]
                            ],
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].storedScope,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Excerpt, {
                                    value: card.estimateScope
                                }, "scope", false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 154,
                                    columnNumber: 77
                                }, this)
                            ]
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 154,
                        columnNumber: 7
                    }, this),
                    card.parent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-labelledby": `${id}-parent`,
                        className: panel,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                id: `${id}-parent`,
                                className: "m-0 text-base font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].parent
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 156,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                                entries: [
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].parent,
                                        `${card.parent.type === "lead" ? "Lead" : "Job"} · ${card.parent.number}`
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].parentName,
                                        card.parent.name
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].status,
                                        card.parent.status
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].service,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Excerpt, {
                                            value: card.parent.service
                                        }, "service", false, {
                                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                            lineNumber: 160,
                                            columnNumber: 23
                                        }, this)
                                    ],
                                    [
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].customer,
                                        card.parent.customer || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].notProvided
                                    ]
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                lineNumber: 157,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 155,
                        columnNumber: 22
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].parentUnavailable
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 163,
                        columnNumber: 20
                    }, this)
                ]
            }, void 0, true),
            card.kind === "compare_revisions" && (card.comparison ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm leading-6 text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].compared
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 166,
                        columnNumber: 7
                    }, this),
                    [
                        [
                            "from",
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].before
                        ],
                        [
                            "to",
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].after
                        ]
                    ].map(([key, label])=>{
                        const revision = card.comparison[key];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            "aria-label": `${label} revision`,
                            className: panel,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "m-0 text-base font-semibold",
                                    children: [
                                        label,
                                        ": ",
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].revision(revision.estimate.revision)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 170,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "m-0 text-sm wrap-anywhere",
                                    children: revision.estimate.name
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 171,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Status, {
                                    estimate: revision.estimate
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 172,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                                    entries: [
                                        [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].source,
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].sources[revision.source]
                                        ],
                                        [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$totals$2f$estimate$2d$totals$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateTotalsData"].total,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Amount, {
                                                cents: revision.totalCents
                                            }, "total", false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 173,
                                                columnNumber: 88
                                            }, this)
                                        ]
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 173,
                                    columnNumber: 11
                                }, this),
                                open(revision.estimate, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].openRevision(revision.estimate.number, revision.estimate.revision))
                            ]
                        }, key, true, {
                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                            lineNumber: 169,
                            columnNumber: 16
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                        entries: [
                            [
                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].totalDifference,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Amount, {
                                    cents: card.comparison.totalDifferenceCents
                                }, "difference", false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 177,
                                    columnNumber: 45
                                }, this)
                            ]
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 177,
                        columnNumber: 7
                    }, this),
                    card.comparison.fields.map((field)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateHistoryTimelineData"].fields[field.field],
                            className: panel,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "m-0 text-base font-semibold",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$history$2d$timeline$2f$estimate$2d$history$2d$timeline$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateHistoryTimelineData"].fields[field.field]
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 179,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Fields, {
                                    entries: [
                                        [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].before,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Excerpt, {
                                                value: field.before
                                            }, "before", false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 180,
                                                columnNumber: 38
                                            }, this)
                                        ],
                                        [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].after,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Excerpt, {
                                                value: field.after
                                            }, "after", false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 180,
                                                columnNumber: 96
                                            }, this)
                                        ]
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 180,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, field.field, true, {
                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                            lineNumber: 178,
                            columnNumber: 44
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].changeCount(card.comparison.lineItemChanges.length, card.comparison.lineItemChangeCount)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 182,
                        columnNumber: 7
                    }, this),
                    card.comparison.lineItemChanges.map((change)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].line(change.position),
                            className: panel,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "m-0 text-base font-semibold",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$items$2d$editor$2f$estimate$2d$items$2d$editor$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateItemsEditorData"].line(change.position)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                    lineNumber: 184,
                                    columnNumber: 9
                                }, this),
                                [
                                    [
                                        "before",
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].before
                                    ],
                                    [
                                        "after",
                                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].after
                                    ]
                                ].map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid min-w-0 gap-2 border-t border-assistant-border pt-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                className: "m-0 text-sm font-semibold",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 187,
                                                columnNumber: 13
                                            }, this),
                                            change[key] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                                                item: change[key]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 188,
                                                columnNumber: 28
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "m-0 text-sm text-assistant-muted",
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].absentLine
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                                lineNumber: 188,
                                                columnNumber: 58
                                            }, this)
                                        ]
                                    }, key, true, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                                        lineNumber: 186,
                                        columnNumber: 11
                                    }, this))
                            ]
                        }, change.position, true, {
                            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                            lineNumber: 183,
                            columnNumber: 54
                        }, this)),
                    card.comparison.lineItemChanges.length < card.comparison.lineItemChangeCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm text-assistant-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].changedWindow
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 191,
                        columnNumber: 88
                    }, this),
                    !card.comparison.fields.length && !card.comparison.lineItemChangeCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].noChanges
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                        lineNumber: 192,
                        columnNumber: 82
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "m-0 text-sm",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].oneRevision
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 193,
                columnNumber: 11
            }, this)),
            card.estimate && !(card.kind === "compare_revisions" && card.comparison) && open(card.estimate, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].open),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "m-0 text-xs leading-5 text-assistant-muted",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateReadResultData"].snapshot
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
                lineNumber: 195,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx",
        lineNumber: 116,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateResult",
    ()=>ConnectedEstimateResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$summary$2d$card$2f$estimate$2d$summary$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-summary-card/estimate-summary-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-result.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-read-result.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ConnectedEstimateResult({ result, workspaceId, disabled, onRefresh, onNavigate }) {
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    async function navigate(resultId, estimateId, destination = "list") {
        if (disabled || lock.current) return;
        lock.current = true;
        setBusy(true);
        setError("");
        try {
            const response = await fetch("/api/chat/estimates/navigate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    workspaceId,
                    turnId: result.turnId,
                    resultId,
                    estimateId,
                    ...destination === "export" ? {
                        destination
                    } : {}
                })
            });
            if (!response.ok) throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateResultData"].failed);
            const destinationResult = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateChatDestinationSchema"].parse(await response.json());
            onNavigate(destinationResult.href);
        } catch  {
            setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateResultData"].failed);
            try {
                await onRefresh();
            } catch  {
                setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateResultData"].refreshFailed);
            }
        } finally{
            lock.current = false;
            setBusy(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid min-w-0 gap-4",
        children: [
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-result.tsx",
                lineNumber: 61,
                columnNumber: 15
            }, this),
            result.detail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$read$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateReadResult"], {
                card: result.detail,
                disabled: disabled || busy,
                onOpenEstimate: (id)=>{
                    if (result.detail) void navigate(result.detail.id, id);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-result.tsx",
                lineNumber: 62,
                columnNumber: 23
            }, this),
            result.summaries.map((summary)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$summary$2d$card$2f$estimate$2d$summary$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateSummaryCard"], {
                    result: summary,
                    disabled: disabled || busy,
                    onOpenEstimate: (id)=>void navigate(summary.id, id),
                    onOpenList: summary.canOpenList ? (id)=>void navigate(id) : undefined,
                    onReviewExport: summary.canReviewExport ? (id)=>void navigate(id, undefined, "export") : undefined
                }, summary.id, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-result.tsx",
                    lineNumber: 67,
                    columnNumber: 38
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-result.tsx",
        lineNumber: 60,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftBinding",
    ()=>estimateDraftBinding,
    "estimateDraftConnectedData",
    ()=>estimateDraftConnectedData,
    "estimateDraftRequest",
    ()=>estimateDraftRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-chat.ts [app-ssr] (ecmascript)");
;
const estimateDraftConnectedData = {
    error: "This proposal could not be checked. Nothing is marked as saved. Refresh the conversation and try again.",
    refreshFailed: "The proposal action completed, but assistant history could not refresh. Reload to check the latest history.",
    editorTitle: "Review unsaved Estimate proposal",
    editorNotice: "These are unsaved proposal contents. Editing here changes no Estimate. Review a refreshed proposal before confirming in the assistant.",
    refresh: "Review refreshed proposal",
    refreshed: "Proposal refreshed. Review the card below and confirm explicitly to save.",
    name: "Estimate name",
    saved: "Open saved Draft"
};
function estimateDraftBinding(view) {
    const draft = view.draft;
    return {
        proposalId: draft.id,
        inputHash: draft.inputHash,
        authorizationVersion: draft.authorizationVersion,
        actionType: draft.actionType,
        parentType: draft.parent.type,
        parentId: draft.parent.id,
        parentVersion: draft.parent.version,
        estimateId: draft.actionType === "estimate.update" ? draft.estimate.id : null,
        expectedVersion: draft.actionType === "estimate.update" ? draft.estimate.expectedVersion : null
    };
}
async function estimateDraftRequest(method, body, signal) {
    const response = await fetch("/api/chat/estimates/draft", {
        method,
        signal,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const raw = await response.json();
    if (!response.ok) {
        throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : estimateDraftConnectedData.error);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftChatResponseSchema"].parse(raw);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateDraft",
    ()=>ConnectedEstimateDraft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$estimate$2d$draft$2d$card$2f$estimate$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/estimate-draft-card/estimate-draft-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ConnectedEstimateDraft({ view, workspaceId, disabled = false, onRefresh, onNavigate }) {
    const [outcome, setOutcome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const current = outcome?.draft.id === view.draft.id && outcome.draft.inputHash === view.draft.inputHash ? outcome : view;
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [opening, setOpening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const openLock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(view);
    const host = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        workspaceId,
        disabled
    });
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        session.current = view;
        host.current = {
            workspaceId,
            disabled
        };
    }, [
        view,
        workspaceId,
        disabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        return ()=>{
            mounted.current = false;
        };
    }, []);
    function isCurrent(expected) {
        return mounted.current && !host.current.disabled && host.current.workspaceId === workspaceId && session.current.draft.id === expected.draft.id && session.current.draft.inputHash === expected.draft.inputHash && session.current.draft.authorizationVersion === expected.draft.authorizationVersion;
    }
    async function refreshHistory(completed = false) {
        try {
            await onRefresh();
        } catch  {
            if (mounted.current) setError(completed ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].refreshFailed : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].error);
        }
    }
    async function openSaved() {
        if (disabled || openLock.current) return;
        const expected = session.current;
        openLock.current = true;
        setOpening(true);
        setError("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftRequest"])("POST", {
                workspaceId,
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftBinding"])(current),
                decision: "open"
            });
            if (!result.href) throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].error);
            if (isCurrent(expected)) onNavigate(result.href);
        } catch (caught) {
            if (isCurrent(expected)) setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].error);
            await refreshHistory(true);
        } finally{
            openLock.current = false;
            if (mounted.current) setOpening(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid min-w-0 gap-3 print:hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$estimate$2d$draft$2d$card$2f$estimate$2d$draft$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateDraftCard"], {
                ...current,
                disabled: disabled,
                onDecide: async (request)=>{
                    const expected = session.current;
                    try {
                        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftRequest"])("POST", {
                            workspaceId,
                            ...request
                        });
                        if (isCurrent(expected)) setOutcome(result.view);
                        await refreshHistory();
                        return {
                            ok: true
                        };
                    } catch (error) {
                        await refreshHistory();
                        return {
                            ok: false,
                            message: error instanceof Error ? error.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].error
                        };
                    }
                },
                onReviewInEditor: async (request)=>{
                    const expected = session.current;
                    try {
                        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftRequest"])("POST", {
                            workspaceId,
                            ...request,
                            decision: "editor"
                        });
                        if (!result.href) throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].error);
                        if (!isCurrent(expected)) return {
                            ok: false,
                            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].error
                        };
                        onNavigate(result.href);
                        return {
                            ok: true
                        };
                    } catch (error) {
                        await refreshHistory();
                        return {
                            ok: false,
                            message: error instanceof Error ? error.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].error
                        };
                    }
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-result.tsx",
                lineNumber: 49,
                columnNumber: 5
            }, this),
            current.draft.state === "confirmed" && current.receipt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                disabled: disabled || opening,
                onClick: ()=>{
                    void openSaved();
                },
                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftConnectedData"].saved
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-result.tsx",
                lineNumber: 75,
                columnNumber: 64
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "m-0 text-sm",
                children: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-result.tsx",
                lineNumber: 77,
                columnNumber: 15
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-result.tsx",
        lineNumber: 48,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateSharingBinding",
    ()=>estimateSharingBinding,
    "estimateSharingData",
    ()=>estimateSharingData,
    "estimateSharingRequest",
    ()=>estimateSharingRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-share-chat.ts [app-ssr] (ecmascript)");
;
const estimateSharingData = {
    title: {
        "estimate.send": "Send estimate",
        "estimate.publish": "Publish estimate",
        "estimate.resend": "Resend estimate"
    },
    review: {
        "estimate.send": "Review revision send",
        "estimate.publish": "Review publication",
        "estimate.resend": "Review resend"
    },
    loading: "Loading the current sharing review...",
    unavailable: "This sharing proposal is unavailable. Access, the saved estimate or its review may have changed. Request a fresh proposal.",
    error: "The sharing operation could not be confirmed. Review its current status before retrying.",
    historyError: "The operation completed, but chat history could not be refreshed. Reload to check the current status.",
    expired: "Proposal expired. Request a fresh sharing review.",
    cancelled: "Proposal cancelled. Nothing was shared or queued by this proposal.",
    superseded: "Replaced by a newer proposal. Review the latest proposal.",
    queued: "Email queued. This is not a delivery confirmation. Open the saved estimate for delivery status.",
    published: "Estimate published without email. Open the saved estimate to manage its customer link.",
    boundary: "Reviewing does not share anything. Only the final confirmation publishes or queues email. It does not accept the estimate, collect payment or change the lead stage.",
    refreshed: "Delivery recipient updated in a new proposal. Review it and confirm again to queue email. The frozen customer paper is unchanged.",
    cancel: "Cancel proposal",
    open: "Open saved estimate",
    retry: "Reload sharing review"
};
function estimateSharingBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version,
        snapshotHash: ticket.snapshotHash
    };
}
async function estimateSharingRequest(workspaceId, ticket, method, extra = {}, signal) {
    const binding = estimateSharingBinding(ticket);
    const query = new URLSearchParams({
        workspace: workspaceId
    });
    if (method === "GET") for (const [key, value] of Object.entries(binding))query.set(key, String(value));
    const response = await fetch(`/api/chat/estimates/sharing?${query}`, {
        method,
        signal,
        cache: "no-store",
        ...method === "GET" ? {} : {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                workspaceId,
                request: binding,
                ...extra
            })
        }
    });
    const raw = await response.json();
    if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : estimateSharingData.error);
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$share$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateShareChatResponseSchema"].parse(raw);
    const next = result.view.ticket;
    const expected = method === "PATCH" ? next.id !== ticket.id && next.actionType === ticket.actionType && next.authorizationVersion === ticket.authorizationVersion && next.estimate.id === ticket.estimate.id && next.estimate.version === ticket.estimate.version && next.snapshotHash === ticket.snapshotHash && result.view.review.recipientEmail === extra.recipientEmail && next.state === "pending" : JSON.stringify(estimateSharingBinding(next)) === JSON.stringify(binding);
    if (!expected || method === "POST" && extra.decision === "confirm" && next.state !== "confirmed" || method === "POST" && extra.decision === "cancel" && next.state !== "cancelled" || extra.decision === "open" && (!result.href || result.href !== `/estimates/${ticket.estimate.id}?workspace=${workspaceId}`)) {
        throw new Error(estimateSharingData.error);
    }
    return result;
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateSharing",
    ()=>ConnectedEstimateSharing
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$send$2d$card$2f$estimate$2d$send$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-send-card/estimate-send-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$send$2d$dialog$2f$estimate$2d$send$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-send-dialog/estimate-send-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$publish$2d$dialog$2f$estimate$2d$publish$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-publish-dialog/estimate-publish-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$preview$2d$paper$2f$estimate$2d$preview$2d$paper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-preview-paper/estimate-preview-paper.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$connected$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-lead-stage-suggestion/estimate-lead-stage-connected.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$suggestion$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-lead-stage-suggestion/estimate-lead-stage-suggestion.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-client.ts [app-ssr] (ecmascript)");
"use client";
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
const capabilities = {
    read: true,
    create: false,
    update: false,
    send: true,
    decide: false,
    void: false,
    archive: false,
    delete: false,
    export: false
};
function ConnectedEstimateSharing({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [dialog, setDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [leadStageOpen, setLeadStageOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [leadSuggestionDismissed, setLeadSuggestionDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recipient, setRecipient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [expiredId, setExpiredId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const live = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        ticket,
        workspaceId,
        disabled
    });
    const active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(ticket);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        live.current = {
            ticket,
            workspaceId,
            disabled
        };
    }, [
        ticket,
        workspaceId,
        disabled
    ]);
    function isCurrent(expected, request) {
        return mounted.current && !live.current.disabled && live.current.workspaceId === expected.workspaceId && live.current.ticket.id === expected.ticket.id && live.current.ticket.inputHash === expected.ticket.inputHash && live.current.ticket.authorizationVersion === expected.ticket.authorizationVersion && sequence.current === request;
    }
    async function load(signal) {
        if (lock.current || live.current.disabled) return;
        const expected = live.current, request = ++sequence.current;
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingRequest"])(workspaceId, active.current, "GET", {}, signal);
            if (!isCurrent(expected, request)) return;
            active.current = result.view.ticket;
            setView(result.view);
            setError("");
        } catch (caught) {
            if (signal?.aborted || !isCurrent(expected, request)) return;
            setView(null);
            setDialog(false);
            setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].unavailable);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const abort = new AbortController();
        void load(abort.signal);
        const check = ()=>{
            void load(abort.signal);
        };
        const timer = setInterval(check, 15000);
        window.addEventListener("focus", check);
        return ()=>{
            mounted.current = false;
            abort.abort();
            clearInterval(timer);
            window.removeEventListener("focus", check);
        };
    // The host keys this review by proposal identity; the ref also tracks recipient refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        ticket.id,
        ticket.inputHash,
        ticket.authorizationVersion,
        workspaceId,
        disabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!view || view.ticket.state !== "pending") return;
        const timer = setTimeout(()=>{
            setExpiredId(view.ticket.id);
            setDialog(false);
        }, Math.max(0, Date.parse(view.ticket.expiresAt) - Date.now()));
        return ()=>clearTimeout(timer);
    }, [
        view
    ]);
    async function operate(decision, paymentLinkReviewed = false) {
        if (disabled || lock.current || !view || decision !== "open" && Date.parse(view.ticket.expiresAt) <= Date.now()) return {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].expired
        };
        const expected = live.current, request = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        setNotice("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingRequest"])(workspaceId, view.ticket, "POST", {
                decision,
                paymentLinkReviewed
            });
            if (!isCurrent(expected, request)) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].unavailable
            };
            active.current = result.view.ticket;
            setView(result.view);
            setDialog(false);
            if (decision === "open" && result.href) onNavigate(result.href);
            try {
                await onRefresh();
            } catch  {
                if (isCurrent(expected, request)) setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].historyError);
            }
            return {
                ok: true
            };
        } catch (caught) {
            if (isCurrent(expected, request)) {
                setView(null);
                setDialog(false);
                setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].error);
            }
            return {
                ok: false,
                message: caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].error
            };
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    async function refreshRecipient(email) {
        if (disabled || lock.current || !view) return;
        const expected = live.current, request = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingRequest"])(workspaceId, view.ticket, "PATCH", {
                recipientEmail: email
            });
            if (!isCurrent(expected, request)) return;
            active.current = result.view.ticket;
            setView(result.view);
            setRecipient(result.view.review.recipientEmail);
            setNotice(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].refreshed);
        } catch (caught) {
            if (isCurrent(expected, request)) {
                setView(null);
                setDialog(false);
                setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].error);
            }
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    const current = view?.ticket ?? ticket;
    const expired = current.id === expiredId;
    const terminal = current.state !== "pending";
    const busy = pending || disabled;
    const ready = !!view && !disabled && !expired;
    const review = view?.review;
    const record = review ? {
        ...current.estimate,
        recipientName: review.recipientName,
        recipientEmail: review.recipientEmail
    } : null;
    const preview = ready && review ? {
        state: "ready",
        estimateId: current.estimate.id,
        version: current.estimate.version,
        snapshotHash: current.snapshotHash,
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$preview$2d$paper$2f$estimate$2d$preview$2d$paper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimatePreviewPaper"], {
            showPrintControl: false,
            source: {
                state: "snapshot",
                estimateId: current.estimate.id,
                version: current.estimate.version,
                snapshotHash: current.snapshotHash,
                content: {
                    ...review.snapshot.content,
                    business: {
                        ...review.snapshot.content.business,
                        logoPath: current.actionType === "estimate.resend" && review.snapshot.content.business.logoPath ? `/api/estimates/${current.estimate.id}/logo` : review.snapshot.content.business.logoPath
                    }
                },
                amounts: review.snapshot.amounts
            }
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
            lineNumber: 112,
            columnNumber: 14
        }, this)
    } : null;
    const container = ()=>root.current?.closest("dialog") ?? document.body;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: root,
        className: "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground print:hidden",
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].title[ticket.actionType],
        children: [
            !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "m-0 text-sm",
                        children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].loading
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                        lineNumber: 123,
                        columnNumber: 7
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                        disabled: busy,
                        onClick: ()=>{
                            void load();
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].retry
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                        lineNumber: 124,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    ready && !terminal && record && review && current.actionType === "estimate.send" && !current.requiresDialog ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$send$2d$card$2f$estimate$2d$send$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateSendCard"], {
                        proposal: {
                            ...current,
                            actionType: "estimate.send",
                            estimate: record,
                            subject: review.subject
                        },
                        context: {
                            proposalId: current.id,
                            inputHash: current.inputHash,
                            authorizationVersion: current.authorizationVersion,
                            estimate: record,
                            subject: review.subject,
                            snapshotHash: current.snapshotHash,
                            unsavedChanges: false,
                            today: review.today,
                            readiness: {
                                state: "ready"
                            },
                            preview
                        },
                        capabilities: capabilities,
                        parentAccess: true,
                        disabled: busy,
                        onDecide: (request)=>operate(request.decision)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                        lineNumber: 126,
                        columnNumber: 118
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "m-0 text-lg font-semibold",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].title[current.actionType]
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this),
                            !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm wrap-anywhere",
                                children: [
                                    current.estimate.number,
                                    " · Revision ",
                                    current.estimate.revision,
                                    " · ",
                                    current.estimate.name
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                lineNumber: 135,
                                columnNumber: 25
                            }, this),
                            disabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "status",
                                className: "m-0 text-sm",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].unavailable
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                lineNumber: 136,
                                columnNumber: 23
                            }, this) : current.state === "confirmed" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "status",
                                className: "m-0 text-sm",
                                children: current.actionType === "estimate.publish" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].published : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].queued
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                lineNumber: 137,
                                columnNumber: 47
                            }, this) : current.state === "cancelled" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "status",
                                className: "m-0 text-sm",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].cancelled
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                lineNumber: 138,
                                columnNumber: 47
                            }, this) : current.state === "superseded" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "status",
                                className: "m-0 text-sm",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].superseded
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                lineNumber: 139,
                                columnNumber: 48
                            }, this) : expired || current.state === "expired" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "status",
                                className: "m-0 text-sm",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].expired
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                lineNumber: 140,
                                columnNumber: 56
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-sm",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].boundary
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                        lineNumber: 142,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                                        disabled: busy,
                                        onClick: ()=>{
                                            if (!busy) {
                                                setRecipient(view.review.recipientEmail);
                                                setDialog(true);
                                            }
                                        },
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].review[current.actionType]
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                        lineNumber: 143,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                                        disabled: busy,
                                        onClick: ()=>{
                                            void operate("cancel");
                                        },
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].cancel
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                        lineNumber: 133,
                        columnNumber: 62
                    }, this),
                    !disabled && current.state === "confirmed" && view.receipt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                        disabled: busy,
                        onClick: ()=>{
                            void operate("open");
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateSharingData"].open
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                        lineNumber: 147,
                        columnNumber: 70
                    }, this),
                    current.state === "confirmed" && current.actionType === "estimate.send" && review?.parent.type === "lead" && view.receipt && !leadSuggestionDismissed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$connected$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateLeadStageConnected"], {
                        container: container,
                        printHidden: true,
                        binding: {
                            workspaceId,
                            estimateId: current.estimate.id,
                            sourceSubmissionId: current.id,
                            expectedEstimateVersion: view.receipt.version
                        },
                        estimate: {
                            ...current.estimate,
                            version: view.receipt.version,
                            status: view.receipt.status
                        },
                        canRead: !disabled,
                        pending: busy,
                        open: leadStageOpen,
                        onOpenChange: setLeadStageOpen,
                        onDismiss: ()=>{
                            setLeadSuggestionDismissed(true);
                            setLeadStageOpen(false);
                        },
                        onMoved: ()=>{
                            setLeadSuggestionDismissed(true);
                            setLeadStageOpen(false);
                            setNotice(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$suggestion$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateLeadStageSuggestionData"].live.moved);
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true),
            notice && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "m-0 text-sm",
                children: notice
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                lineNumber: 157,
                columnNumber: 29
            }, this),
            error && view && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "m-0 text-sm",
                children: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                lineNumber: 158,
                columnNumber: 36
            }, this),
            ready && !terminal && record && review && dialog && current.actionType === "estimate.publish" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$publish$2d$dialog$2f$estimate$2d$publish$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimatePublishDialog"], {
                open: true,
                printHidden: true,
                container: container,
                estimate: record,
                capabilities: capabilities,
                pending: busy,
                onClose: ()=>setDialog(false),
                view: {
                    state: "review",
                    today: review.today,
                    readiness: {
                        state: "ready"
                    },
                    preview,
                    revision: review.revision,
                    paymentLink: review.snapshot.content.paymentLink ?? "",
                    onConfirm: async (request)=>{
                        await operate("confirm", request.revisionReview?.paymentLinkReviewed ?? false);
                    }
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                lineNumber: 159,
                columnNumber: 103
            }, this),
            ready && !terminal && record && review && dialog && current.actionType !== "estimate.publish" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$send$2d$dialog$2f$estimate$2d$send$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateSendDialog"], {
                open: true,
                printHidden: true,
                container: container,
                estimate: record,
                capabilities: capabilities,
                today: review.today,
                subject: review.subject,
                readiness: {
                    state: "ready"
                },
                preview: preview,
                revision: review.revision,
                paymentLink: review.snapshot.content.paymentLink ?? "",
                pending: busy,
                onClose: ()=>setDialog(false),
                onConfirm: async (request)=>{
                    await operate("confirm", request.revisionReview?.paymentLinkReviewed ?? false);
                },
                ...current.actionType === "estimate.resend" ? {
                    mode: "resend",
                    delivery: review.delivery,
                    recipientEmail: recipient,
                    onRecipientEmailChange: setRecipient,
                    reviewedRecipientEmail: review.recipientEmail,
                    onReviewRecipient: refreshRecipient
                } : {
                    mode: "send"
                }
            }, current.id, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
                lineNumber: 166,
                columnNumber: 103
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx",
        lineNumber: 121,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDecisionBinding",
    ()=>estimateDecisionBinding,
    "estimateDecisionRequest",
    ()=>estimateDecisionRequest,
    "estimateDecisionResultData",
    ()=>estimateDecisionResultData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-decision-chat.ts [app-ssr] (ecmascript)");
;
const estimateDecisionResultData = {
    title: "Customer decision review",
    loading: "Loading the current decision review...",
    unavailable: "This decision proposal is unavailable. Access, the estimate or the saved decision may have changed. Request a fresh review.",
    error: "The decision operation could not be confirmed. Review its current status before retrying.",
    historyError: "The operation completed, but chat history could not be refreshed. Reload to check the current status.",
    expired: "Proposal expired. Request a fresh decision review.",
    cancelled: "Proposal cancelled. No customer decision was recorded or corrected by this proposal.",
    superseded: "Replaced by a newer proposal. Review the latest proposal.",
    accepted: "Customer decision recorded: Accepted.",
    declined: "Customer decision recorded: Declined.",
    corrected: "Customer decision correction recorded. The previous entry remains in history.",
    boundary: "The customer was not notified. No signature, payment, Job creation or Lead-stage change occurred.",
    retry: "Reload decision review",
    open: "Open saved estimate"
};
function estimateDecisionBinding(ticket) {
    return {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version,
        snapshotHash: ticket.snapshotHash
    };
}
async function estimateDecisionRequest(workspaceId, ticket, method, decision, signal) {
    const binding = estimateDecisionBinding(ticket);
    const query = new URLSearchParams({
        workspace: workspaceId
    });
    if (method === "GET") for (const [key, value] of Object.entries(binding))query.set(key, String(value));
    const response = await fetch(`/api/chat/estimates/decisions?${query}`, {
        method,
        signal,
        cache: "no-store",
        ...method === "GET" ? {} : {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                workspaceId,
                request: binding,
                decision
            })
        }
    });
    const raw = await response.json();
    if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : estimateDecisionResultData.error);
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionChatResponseSchema"].parse(raw), next = result.view.ticket;
    const expected = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$decision$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionChatTicketSchema"].parse({
        ...ticket,
        state: next.state
    });
    if (JSON.stringify(expected) !== JSON.stringify(next) || method === "POST" && decision === "confirm" && next.state !== "confirmed" || method === "POST" && decision === "cancel" && next.state !== "cancelled" || decision === "open" && (next.state !== "confirmed" || result.href !== `/estimates/${ticket.estimate.id}?workspace=${workspaceId}`) || decision !== "open" && result.href !== undefined) {
        throw new Error(estimateDecisionResultData.error);
    }
    return result;
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateDecision",
    ()=>ConnectedEstimateDecision
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$decision$2d$card$2f$estimate$2d$decision$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-decision-card/estimate-decision-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$connected$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-lead-stage-suggestion/estimate-lead-stage-connected.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$suggestion$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-lead-stage-suggestion/estimate-lead-stage-suggestion.data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ConnectedEstimateDecision(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DecisionResult, {
        ...props
    }, `${props.workspaceId}:${props.ticket.id}:${props.ticket.inputHash}:${props.ticket.authorizationVersion}:${!!props.disabled}`, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
function DecisionResult({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [expired, setExpired] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [leadStageOpen, setLeadStageOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [leadDismissed, setLeadDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const live = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        ticket,
        workspaceId,
        disabled
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        live.current = {
            ticket,
            workspaceId,
            disabled
        };
    }, [
        ticket,
        workspaceId,
        disabled
    ]);
    function isCurrent(expected, request) {
        return mounted.current && !live.current.disabled && live.current.workspaceId === expected.workspaceId && live.current.ticket.id === expected.ticket.id && live.current.ticket.inputHash === expected.ticket.inputHash && live.current.ticket.authorizationVersion === expected.ticket.authorizationVersion && sequence.current === request;
    }
    async function load(signal) {
        if (lock.current || live.current.disabled || signal?.aborted) return;
        const expected = live.current, request = ++sequence.current;
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionRequest"])(workspaceId, ticket, "GET", undefined, signal);
            if (!isCurrent(expected, request)) return;
            setView(result.view);
            setError("");
        } catch (caught) {
            if (signal?.aborted || !isCurrent(expected, request)) return;
            setView(null);
            setLeadStageOpen(false);
            setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].unavailable);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const abort = new AbortController();
        const check = ()=>{
            void load(abort.signal);
        };
        const initial = setTimeout(check, 0);
        const timer = setInterval(check, 15000);
        window.addEventListener("focus", check);
        return ()=>{
            mounted.current = false;
            abort.abort();
            clearTimeout(initial);
            clearInterval(timer);
            window.removeEventListener("focus", check);
        };
    // The outer key owns proposal/workspace changes; disabled hosts must revalidate before reuse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        disabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!view || view.ticket.state !== "pending") return;
        const timer = setTimeout(()=>setExpired(true), Math.max(0, Date.parse(view.ticket.expiresAt) - Date.now()));
        return ()=>clearTimeout(timer);
    }, [
        view
    ]);
    async function operate(decision) {
        if (disabled || lock.current || !view) return {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].unavailable
        };
        if (view.ticket.state === "pending" && Date.parse(view.ticket.expiresAt) <= Date.now()) {
            setExpired(true);
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].expired
            };
        }
        const expected = live.current, request = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        setNotice("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionRequest"])(workspaceId, view.ticket, "POST", decision);
            if (!isCurrent(expected, request)) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].unavailable
            };
            setView(result.view);
            if (decision === "open" && result.href) onNavigate(result.href);
            try {
                await onRefresh();
            } catch  {
                if (isCurrent(expected, request)) setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].historyError);
            }
            return {
                ok: true
            };
        } catch (caught) {
            if (isCurrent(expected, request)) {
                setView(null);
                setLeadStageOpen(false);
                setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].error);
            }
            return {
                ok: false,
                message: caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].error
            };
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    const current = view?.ticket ?? ticket;
    const busy = pending || disabled;
    const container = ()=>root.current?.closest("dialog") ?? document.body;
    const receipt = view?.receipt;
    const suggestLost = !!view && view.review.parent.type === "lead" && receipt?.status === "declined" && (current.mode === "record" || view.review.estimate.decision?.outcome !== "declined");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: root,
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].title,
        className: "grid min-w-0 gap-3 text-assistant-foreground print:hidden",
        children: [
            disabled || !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-assistant-border bg-assistant-surface p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "m-0 text-sm",
                        children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].loading
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                        lineNumber: 94,
                        columnNumber: 7
                    }, this),
                    error && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                        disabled: busy,
                        onClick: ()=>{
                            void load();
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].retry
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                        lineNumber: 95,
                        columnNumber: 30
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                lineNumber: 93,
                columnNumber: 26
            }, this) : current.state === "pending" && !expired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$decision$2d$card$2f$estimate$2d$decision$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateDecisionCard"], {
                proposal: {
                    ...current,
                    estimate: view.review.estimate,
                    value: view.value
                },
                context: {
                    proposalId: current.id,
                    inputHash: current.inputHash,
                    authorizationVersion: current.authorizationVersion,
                    mode: current.mode,
                    estimate: view.review.estimate,
                    snapshotHash: current.snapshotHash,
                    value: view.value,
                    today: view.review.today,
                    timezone: view.review.timezone
                },
                capabilities: {
                    read: true,
                    create: false,
                    update: false,
                    send: false,
                    decide: view.review.canDecide,
                    void: false,
                    archive: false,
                    delete: false,
                    export: false
                },
                parentAccess: true,
                canCorrectDecision: view.review.canCorrectDecision,
                disabled: busy,
                onDecide: (request)=>operate(request.decision)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                lineNumber: 96,
                columnNumber: 56
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "m-0 text-lg font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                        lineNumber: 107,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm wrap-anywhere",
                        children: [
                            current.estimate.number,
                            " · Revision ",
                            current.estimate.revision,
                            " · ",
                            current.estimate.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                        lineNumber: 108,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "m-0 text-sm",
                        children: current.state === "confirmed" ? current.mode === "correct" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].corrected : receipt?.status === "accepted" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].accepted : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].declined : current.state === "cancelled" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].cancelled : current.state === "superseded" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].superseded : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].expired
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                        lineNumber: 109,
                        columnNumber: 7
                    }, this),
                    current.state === "confirmed" && receipt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-sm",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].boundary
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                                lineNumber: 113,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                                disabled: busy,
                                onClick: ()=>{
                                    void operate("open");
                                },
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDecisionResultData"].open
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                                lineNumber: 114,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                lineNumber: 106,
                columnNumber: 60
            }, this),
            !disabled && current.state === "confirmed" && receipt && suggestLost && !leadDismissed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$connected$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateLeadStageConnected"], {
                container: container,
                printHidden: true,
                binding: {
                    workspaceId,
                    estimateId: current.estimate.id,
                    sourceSubmissionId: current.id,
                    expectedEstimateVersion: receipt.version
                },
                estimate: {
                    ...current.estimate,
                    version: receipt.version,
                    status: receipt.status
                },
                canRead: true,
                pending: busy,
                open: leadStageOpen,
                onOpenChange: setLeadStageOpen,
                onDismiss: ()=>{
                    setLeadDismissed(true);
                    setLeadStageOpen(false);
                },
                onMoved: ()=>{
                    setLeadDismissed(true);
                    setLeadStageOpen(false);
                    setNotice(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$lead$2d$stage$2d$suggestion$2f$estimate$2d$lead$2d$stage$2d$suggestion$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateLeadStageSuggestionData"].live.moved);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                lineNumber: 117,
                columnNumber: 96
            }, this),
            notice && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "m-0 text-sm",
                children: notice
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                lineNumber: 124,
                columnNumber: 29
            }, this),
            error && view && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "m-0 text-sm",
                children: error
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
                lineNumber: 125,
                columnNumber: 36
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx",
        lineNumber: 92,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftActionResultData",
    ()=>estimateDraftActionResultData
]);
const estimateDraftActionResultData = {
    title: "Estimate Draft operation",
    loading: "Loading the current Draft review...",
    unavailable: "This Draft proposal is unavailable. Access, the source or the saved Draft may have changed. Request a fresh review.",
    error: "The Draft operation could not be confirmed. Review its current status before retrying.",
    historyError: "The operation completed, but chat history could not be refreshed. Reload to check the current status.",
    retry: "Reload Draft review",
    stories: {
        disable: "Disable this host",
        release: "Release previous response",
        replace: "Replace sample proposal",
        workspace: "Switch sample workspace",
        withheld: "Private review is withheld."
    }
};
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftActionBinding",
    ()=>estimateDraftActionBinding,
    "estimateDraftActionRequest",
    ()=>estimateDraftActionRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-action-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.data.ts [app-ssr] (ecmascript)");
;
;
function estimateDraftActionBinding(ticket) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionChatBindingSchema"].parse({
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        estimateId: ticket.source.id,
        expectedVersion: ticket.source.version
    });
}
async function estimateDraftActionRequest(workspaceId, ticket, method, decision, signal) {
    const binding = estimateDraftActionBinding(ticket);
    const query = new URLSearchParams({
        workspace: workspaceId
    });
    if (method === "GET") for (const [key, value] of Object.entries(binding))query.set(key, String(value));
    const response = await fetch(`/api/chat/estimates/draft-actions?${query}`, {
        method,
        signal,
        cache: "no-store",
        ...method === "GET" ? {} : {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionChatDecisionSchema"].parse({
                workspaceId,
                request: binding,
                decision
            }))
        }
    });
    const raw = await response.json();
    if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].error);
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionChatResponseSchema"].parse(raw), next = result.view.ticket;
    const expected = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionChatTicketSchema"].parse({
        ...ticket,
        state: next.state
    });
    if (JSON.stringify(expected) !== JSON.stringify(next) || method === "POST" && decision === "confirm" && next.state !== "confirmed" || method === "POST" && decision === "cancel" && next.state !== "cancelled" || decision === "open" && (next.state !== "confirmed" || !result.view.receipt || result.href !== `/estimates/${result.view.receipt.id}?workspace=${workspaceId}`) || decision !== "open" && result.href !== undefined) {
        throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].error);
    }
    return result;
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateDraftAction",
    ()=>ConnectedEstimateDraftAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-action-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$draft$2d$action$2d$card$2f$estimate$2d$draft$2d$action$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-draft-action-card/estimate-draft-action-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ConnectedEstimateDraftAction(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DraftActionResult, {
        ...props
    }, JSON.stringify({
        ticket: props.ticket,
        workspaceId: props.workspaceId,
        disabled: !!props.disabled
    }), false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
function DraftActionResult({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    function isCurrent(request) {
        return mounted.current && !disabled && sequence.current === request;
    }
    async function load(signal) {
        if (lock.current || disabled || signal?.aborted) return;
        const request = ++sequence.current;
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionRequest"])(workspaceId, ticket, "GET", undefined, signal);
            if (!isCurrent(request)) return;
            setView(result.view);
            setError("");
        } catch (caught) {
            if (signal?.aborted || !isCurrent(request)) return;
            setView(null);
            setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].unavailable);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const abort = new AbortController();
        const check = ()=>{
            void load(abort.signal);
        };
        const initial = setTimeout(check, 0), timer = setInterval(check, 15000);
        window.addEventListener("focus", check);
        return ()=>{
            mounted.current = false;
            abort.abort();
            clearTimeout(initial);
            clearInterval(timer);
            window.removeEventListener("focus", check);
        };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function operate(command) {
        if (disabled || lock.current || !view || command.workspaceId !== workspaceId || JSON.stringify(command.request) !== JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionBinding"])(view.ticket))) {
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].unavailable
            };
        }
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$action$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionChatDecisionSchema"].parse(command);
        const request = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionRequest"])(workspaceId, view.ticket, "POST", parsed.decision);
            if (!isCurrent(request)) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].unavailable
            };
            setView(result.view);
            if (parsed.decision === "open" && result.href) onNavigate(result.href);
            try {
                await onRefresh();
            } catch  {
                if (isCurrent(request)) setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].historyError);
            }
            return {
                ok: true
            };
        } catch (caught) {
            if (isCurrent(request)) {
                setView(null);
                setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].error);
            }
            return {
                ok: false,
                message: caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].error
            };
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].title,
        "aria-busy": pending,
        className: "grid min-w-0 gap-3 text-assistant-foreground print:hidden",
        children: disabled || !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-assistant-border bg-assistant-surface p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "status",
                    className: "m-0 text-sm",
                    children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].loading
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx",
                    lineNumber: 76,
                    columnNumber: 7
                }, this),
                error && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                    disabled: pending,
                    onClick: ()=>{
                        void load();
                    },
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftActionResultData"].retry
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx",
                    lineNumber: 77,
                    columnNumber: 30
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx",
            lineNumber: 75,
            columnNumber: 26
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$draft$2d$action$2d$card$2f$estimate$2d$draft$2d$action$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateDraftActionCard"], {
                    view: view,
                    context: {
                        workspaceId,
                        view
                    },
                    grants: {
                        read: true,
                        parentAccess: true,
                        create: true,
                        update: true
                    },
                    onOperate: operate
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx",
                    lineNumber: 79,
                    columnNumber: 7
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "alert",
                    className: "m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx",
                    lineNumber: 82,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx",
        lineNumber: 74,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateVoidResultData",
    ()=>estimateVoidResultData
]);
const estimateVoidResultData = {
    title: "Estimate withdrawal proposal",
    loading: "Loading the authorized withdrawal review...",
    unavailable: "This withdrawal review is no longer available. Request a fresh review.",
    error: "The withdrawal review could not be checked. Reload it before continuing.",
    historyError: "The operation's checked outcome is shown, but conversation history could not be refreshed. Reload the conversation before continuing.",
    retry: "Reload withdrawal review",
    stories: {
        release: "Release previous response",
        workspace: "Switch sample workspace",
        disable: "Disable host"
    }
};
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-void-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateVoidBinding",
    ()=>estimateVoidBinding,
    "estimateVoidRequest",
    ()=>estimateVoidRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-void-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.data.ts [app-ssr] (ecmascript)");
;
;
function estimateVoidBinding(ticket) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidChatBindingSchema"].parse({
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        snapshotHash: ticket.snapshotHash,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version
    });
}
async function estimateVoidRequest(workspaceId, ticket, method, decision, signal) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidChatDecisionSchema"].shape.workspaceId.parse(workspaceId);
    const binding = estimateVoidBinding(ticket), query = new URLSearchParams({
        workspace: workspaceId
    });
    if (method === "GET") for (const [key, value] of Object.entries(binding))query.set(key, String(value));
    const response = await fetch(`/api/chat/estimates/voids?${query}`, {
        method,
        signal,
        cache: "no-store",
        ...method === "GET" ? {} : {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidChatDecisionSchema"].parse({
                workspaceId,
                request: binding,
                decision
            }))
        }
    });
    const raw = await response.json();
    if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].error);
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidChatResponseSchema"].parse(raw), next = result.view.ticket;
    const expected = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidChatTicketSchema"].parse({
        ...ticket,
        state: next.state
    });
    if (JSON.stringify(expected) !== JSON.stringify(next) || method === "POST" && decision === "confirm" && next.state !== "confirmed" || method === "POST" && decision === "cancel" && next.state !== "cancelled" || decision === "open" && (next.state !== "confirmed" || !result.view.receipt || result.href !== `/estimates/${result.view.receipt.estimateId}?workspace=${workspaceId}`) || decision !== "open" && result.href !== undefined) {
        throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].error);
    }
    return result;
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateVoid",
    ()=>ConnectedEstimateVoid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-void-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$void$2d$card$2f$estimate$2d$void$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-void-card/estimate-void-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-void-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ConnectedEstimateVoid(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(VoidResult, {
        ...props
    }, JSON.stringify({
        ticket: props.ticket,
        workspaceId: props.workspaceId,
        disabled: !!props.disabled
    }), false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
function VoidResult({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    function isCurrent(request) {
        return mounted.current && !disabled && sequence.current === request;
    }
    async function load(signal) {
        if (lock.current || disabled || signal?.aborted) return;
        const request = ++sequence.current;
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidRequest"])(workspaceId, ticket, "GET", undefined, signal);
            if (!isCurrent(request)) return;
            setView(result.view);
            setError("");
        } catch (caught) {
            if (signal?.aborted || !isCurrent(request)) return;
            setView(null);
            setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].unavailable);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const abort = new AbortController(), check = ()=>{
            void load(abort.signal);
        };
        const initial = setTimeout(check, 0), timer = setInterval(check, 15000);
        window.addEventListener("focus", check);
        return ()=>{
            mounted.current = false;
            abort.abort();
            clearTimeout(initial);
            clearInterval(timer);
            window.removeEventListener("focus", check);
        };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function operate(command) {
        if (disabled || lock.current || !view || command.workspaceId !== workspaceId || JSON.stringify(command.request) !== JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidBinding"])(view.ticket))) {
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].unavailable
            };
        }
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$void$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidChatDecisionSchema"].parse(command), request = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidRequest"])(workspaceId, view.ticket, "POST", parsed.decision);
            if (!isCurrent(request)) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].unavailable
            };
            setView(result.view);
            if (parsed.decision === "open" && result.href) onNavigate(result.href);
            try {
                await onRefresh();
            } catch  {
                if (isCurrent(request)) setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].historyError);
            }
            return {
                ok: true
            };
        } catch (caught) {
            if (isCurrent(request)) {
                setView(null);
                setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].error);
            }
            return {
                ok: false,
                message: caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].error
            };
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].title,
        "aria-busy": pending,
        className: "grid min-w-0 gap-3 text-assistant-foreground print:hidden",
        children: disabled || !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-assistant-border bg-assistant-surface p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "status",
                    className: "m-0 text-sm",
                    children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].loading
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx",
                    lineNumber: 73,
                    columnNumber: 7
                }, this),
                error && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                    disabled: pending,
                    onClick: ()=>{
                        void load();
                    },
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateVoidResultData"].retry
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx",
                    lineNumber: 74,
                    columnNumber: 30
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx",
            lineNumber: 72,
            columnNumber: 26
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$void$2d$card$2f$estimate$2d$void$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateVoidCard"], {
                    view: view,
                    context: {
                        workspaceId,
                        view
                    },
                    grants: {
                        read: true,
                        parentAccess: true,
                        void: true
                    },
                    onOperate: operate
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx",
                    lineNumber: 76,
                    columnNumber: 7
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "alert",
                    className: "m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx",
                    lineNumber: 78,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx",
        lineNumber: 71,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateArchiveResultData",
    ()=>estimateArchiveResultData
]);
const estimateArchiveResultData = {
    title: "Estimate Archive/Restore proposal",
    loading: "Loading the authorized Archive/Restore review...",
    unavailable: "This Archive/Restore review is no longer available. Request a fresh review.",
    error: "The Archive/Restore review could not be checked. Reload it before continuing.",
    historyError: "The operation's checked outcome is shown, but conversation history could not be refreshed. Reload the conversation before continuing.",
    retry: "Reload Archive/Restore review"
};
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateArchiveBinding",
    ()=>estimateArchiveBinding,
    "estimateArchiveRequest",
    ()=>estimateArchiveRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-archive-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.data.ts [app-ssr] (ecmascript)");
;
;
function estimateArchiveBinding(ticket) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveChatBindingSchema"].parse({
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version
    });
}
async function estimateArchiveRequest(workspaceId, ticket, method, decision, signal) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveChatDecisionSchema"].shape.workspaceId.parse(workspaceId);
    const binding = estimateArchiveBinding(ticket), query = new URLSearchParams({
        workspace: workspaceId
    });
    if (method === "GET") for (const [key, value] of Object.entries(binding))query.set(key, String(value));
    const response = await fetch(`/api/chat/estimates/archives?${query}`, {
        method,
        signal,
        cache: "no-store",
        ...method === "GET" ? {} : {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveChatDecisionSchema"].parse({
                workspaceId,
                request: binding,
                decision
            }))
        }
    });
    const raw = await response.json();
    if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].error);
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveChatResponseSchema"].parse(raw), next = result.view.ticket;
    const expected = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveChatTicketSchema"].parse({
        ...ticket,
        state: next.state
    });
    if (JSON.stringify(expected) !== JSON.stringify(next) || method === "POST" && decision === "confirm" && next.state !== "confirmed" || method === "POST" && decision === "cancel" && next.state !== "cancelled" || decision === "open" && (next.state !== "confirmed" || !result.view.receipt || result.href !== `/estimates/${result.view.receipt.estimateId}?workspace=${workspaceId}`) || decision !== "open" && result.href !== undefined) {
        throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].error);
    }
    return result;
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateArchive",
    ()=>ConnectedEstimateArchive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-archive-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$archive$2d$card$2f$estimate$2d$archive$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-archive-card/estimate-archive-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ConnectedEstimateArchive(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ArchiveResult, {
        ...props
    }, JSON.stringify({
        ticket: props.ticket,
        workspaceId: props.workspaceId,
        disabled: !!props.disabled
    }), false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
function ArchiveResult({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""), [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false), sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    function isCurrent(request) {
        return mounted.current && !disabled && sequence.current === request;
    }
    async function load(signal) {
        if (lock.current || disabled || signal?.aborted) return;
        const request = ++sequence.current;
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveRequest"])(workspaceId, ticket, "GET", undefined, signal);
            if (!isCurrent(request)) return;
            setView(result.view);
            setError("");
        } catch (caught) {
            if (signal?.aborted || !isCurrent(request)) return;
            setView(null);
            setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].unavailable);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const abort = new AbortController(), check = ()=>{
            void load(abort.signal);
        };
        const initial = setTimeout(check, 0), timer = setInterval(check, 15000);
        window.addEventListener("focus", check);
        return ()=>{
            mounted.current = false;
            abort.abort();
            clearTimeout(initial);
            clearInterval(timer);
            window.removeEventListener("focus", check);
        };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function operate(command) {
        if (disabled || lock.current || !view || command.workspaceId !== workspaceId || JSON.stringify(command.request) !== JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveBinding"])(view.ticket))) {
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].unavailable
            };
        }
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$archive$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveChatDecisionSchema"].parse(command), request = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveRequest"])(workspaceId, view.ticket, "POST", parsed.decision);
            if (!isCurrent(request)) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].unavailable
            };
            setView(result.view);
            if (parsed.decision === "open" && result.href) onNavigate(result.href);
            try {
                await onRefresh();
            } catch  {
                if (isCurrent(request)) setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].historyError);
            }
            return {
                ok: true
            };
        } catch (caught) {
            if (isCurrent(request)) {
                setView(null);
                setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].error);
            }
            return {
                ok: false,
                message: caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].error
            };
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].title,
        "aria-busy": pending,
        className: "grid min-w-0 gap-3 text-assistant-foreground print:hidden",
        children: disabled || !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-assistant-border bg-assistant-surface p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "status",
                    className: "m-0 text-sm",
                    children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].loading
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx",
                    lineNumber: 73,
                    columnNumber: 7
                }, this),
                error && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                    disabled: pending,
                    onClick: ()=>{
                        void load();
                    },
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateArchiveResultData"].retry
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx",
                    lineNumber: 74,
                    columnNumber: 30
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx",
            lineNumber: 72,
            columnNumber: 26
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$archive$2d$card$2f$estimate$2d$archive$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateArchiveCard"], {
                    view: view,
                    context: {
                        workspaceId,
                        view
                    },
                    grants: {
                        read: true,
                        parentAccess: true,
                        archive: true
                    },
                    onOperate: operate
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx",
                    lineNumber: 76,
                    columnNumber: 7
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "alert",
                    className: "m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx",
                    lineNumber: 78,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx",
        lineNumber: 71,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftDeleteResultData",
    ()=>estimateDraftDeleteResultData
]);
const estimateDraftDeleteResultData = {
    title: "Permanent Draft-deletion proposal",
    loading: "Loading the authorized Draft-deletion review...",
    unavailable: "This Draft-deletion review is no longer available. Request a fresh review.",
    error: "The Draft-deletion review could not be checked. Reload it before continuing.",
    historyError: "The operation's checked outcome is shown, but conversation history could not be refreshed. Reload the conversation before continuing.",
    retry: "Reload Draft-deletion review"
};
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateDraftDeleteBinding",
    ()=>estimateDraftDeleteBinding,
    "estimateDraftDeleteRequest",
    ()=>estimateDraftDeleteRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-delete-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.data.ts [app-ssr] (ecmascript)");
;
;
function estimateDraftDeleteBinding(ticket) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatBindingSchema"].parse({
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version
    });
}
async function estimateDraftDeleteRequest(workspaceId, ticket, method, decision, typedConfirmation, signal) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatDecisionSchema"].shape.workspaceId.parse(workspaceId);
    const binding = estimateDraftDeleteBinding(ticket);
    const query = new URLSearchParams({
        workspace: workspaceId
    });
    if (method === "GET") {
        for (const [key, value] of Object.entries(binding))query.set(key, String(value));
    }
    const request = method === "POST" ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatDecisionSchema"].parse({
        workspaceId,
        request: binding,
        decision,
        ...decision === "confirm" ? {
            typedConfirmation
        } : {}
    }) : undefined;
    const response = await fetch(`/api/chat/estimates/draft-deletions?${query}`, {
        method,
        signal,
        cache: "no-store",
        ...request ? {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        } : {}
    });
    const raw = await response.json();
    if (!response.ok) {
        throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].error);
    }
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatResponseSchema"].parse(raw);
    const next = result.view.ticket;
    const expected = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatTicketSchema"].parse({
        ...ticket,
        state: next.state
    });
    if (JSON.stringify(expected) !== JSON.stringify(next) || method === "POST" && decision === "confirm" && next.state !== "confirmed" || method === "POST" && decision === "cancel" && next.state !== "cancelled") {
        throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].error);
    }
    return result;
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateDraftDelete",
    ()=>ConnectedEstimateDraftDelete
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-draft-delete-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$draft$2d$delete$2d$card$2f$estimate$2d$draft$2d$delete$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-draft-delete-card/estimate-draft-delete-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-ui.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ConnectedEstimateDraftDelete(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DraftDeleteResult, {
        ...props
    }, JSON.stringify({
        ticket: props.ticket,
        workspaceId: props.workspaceId,
        disabled: !!props.disabled
    }), false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
function DraftDeleteResult({ ticket, workspaceId, disabled = false, onRefresh }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    function isCurrent(request) {
        return mounted.current && !disabled && sequence.current === request;
    }
    async function load(signal) {
        if (lock.current || disabled || signal?.aborted) return;
        const request = ++sequence.current;
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteRequest"])(workspaceId, ticket, "GET", undefined, undefined, signal);
            if (!isCurrent(request)) return;
            setView(result.view);
            setError("");
        } catch (caught) {
            if (signal?.aborted || !isCurrent(request)) return;
            setView(null);
            setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].unavailable);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const abort = new AbortController();
        const check = ()=>{
            void load(abort.signal);
        };
        const initial = setTimeout(check, 0);
        const timer = setInterval(check, 15000);
        window.addEventListener("focus", check);
        return ()=>{
            mounted.current = false;
            abort.abort();
            clearTimeout(initial);
            clearInterval(timer);
            window.removeEventListener("focus", check);
        };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function operate(command) {
        if (disabled || lock.current || !view || command.workspaceId !== workspaceId || JSON.stringify(command.request) !== JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteBinding"])(view.ticket))) {
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].unavailable
            };
        }
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$draft$2d$delete$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteChatDecisionSchema"].parse(command);
        const request = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteRequest"])(workspaceId, view.ticket, "POST", parsed.decision, parsed.typedConfirmation);
            if (!isCurrent(request)) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].unavailable
            };
            setView(result.view);
            try {
                await onRefresh();
            } catch  {
                if (isCurrent(request)) setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].historyError);
            }
            return {
                ok: true
            };
        } catch (caught) {
            if (isCurrent(request)) {
                setView(null);
                setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].error);
            }
            return {
                ok: false,
                message: caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].error
            };
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    const container = ()=>root.current?.closest("dialog") ?? document.body;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: root,
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].title,
        "aria-busy": pending,
        className: "grid min-w-0 gap-3 text-assistant-foreground print:hidden",
        children: disabled || !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-assistant-border bg-assistant-surface p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "status",
                    className: "m-0 text-sm",
                    children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].loading
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx",
                    lineNumber: 120,
                    columnNumber: 7
                }, this),
                error && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateButton"],
                    disabled: pending,
                    onClick: ()=>{
                        void load();
                    },
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateDraftDeleteResultData"].retry
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx",
                    lineNumber: 121,
                    columnNumber: 30
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx",
            lineNumber: 119,
            columnNumber: 26
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$draft$2d$delete$2d$card$2f$estimate$2d$draft$2d$delete$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateDraftDeleteCard"], {
                    view: view,
                    context: {
                        workspaceId,
                        view
                    },
                    grants: {
                        read: true,
                        parentAccess: true,
                        delete: true
                    },
                    container: container,
                    onOperate: operate
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx",
                    lineNumber: 123,
                    columnNumber: 7
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "alert",
                    className: "m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx",
                    lineNumber: 125,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx",
        lineNumber: 118,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateConvertResultData",
    ()=>estimateConvertResultData
]);
const estimateConvertResultData = {
    title: "Estimate conversion review",
    loading: "Loading the authorized conversion review...",
    unavailable: "This conversion review is no longer available. Request a fresh review.",
    error: "The conversion review could not be completed. Nothing was converted.",
    retry: "Reload conversion review"
};
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateConversionChatBinding",
    ()=>estimateConversionChatBinding,
    "estimateConversionChatRequest",
    ()=>estimateConversionChatRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-conversion-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.data.ts [app-ssr] (ecmascript)");
;
;
function estimateConversionChatBinding(ticket) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatBindingSchema"].parse({
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version,
        snapshotHash: ticket.estimate.snapshotHash,
        sourceLeadId: ticket.estimate.parentId
    });
}
async function estimateConversionChatRequest(workspaceId, ticket, method, decision, signal) {
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatDecisionSchema"].shape.workspaceId.parse(workspaceId);
    const binding = estimateConversionChatBinding(ticket);
    const query = new URLSearchParams({
        workspace: workspaceId
    });
    if (method === "GET") {
        for (const [key, value] of Object.entries(binding))query.set(key, String(value));
    }
    const request = method === "POST" ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatDecisionSchema"].parse({
        workspaceId,
        request: binding,
        decision
    }) : undefined;
    const response = await fetch(`/api/chat/estimates/conversions?${query}`, {
        method,
        signal,
        cache: "no-store",
        ...request ? {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        } : {}
    });
    const raw = await response.json();
    if (!response.ok) {
        throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].error);
    }
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatResponseSchema"].parse(raw);
    const next = result.view.ticket;
    const expected = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatTicketSchema"].parse({
        ...ticket,
        state: method === "POST" && decision === "cancel" ? "cancelled" : ticket.state
    });
    if (JSON.stringify(expected) !== JSON.stringify(next) || method === "POST" && decision === "cancel" && next.state !== "cancelled" || method === "POST" && decision === "review" && next.state !== "pending") {
        throw new Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].error);
    }
    return result;
}
}),
"[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedEstimateConversion",
    ()=>ConnectedEstimateConversion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$convert$2d$card$2f$estimate$2d$convert$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-convert-card/estimate-convert-card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$convert$2d$dialog$2f$estimate$2d$convert$2d$connected$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/estimates/estimate-convert-dialog/estimate-convert-connected.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/estimate-conversion-chat.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const cardCapabilities = {
    read: true,
    create: false,
    update: false,
    send: false,
    decide: false,
    void: false,
    archive: false,
    delete: false,
    export: false
};
function ConnectedEstimateConversion(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConversionResult, {
        ...props
    }, JSON.stringify({
        ticket: props.ticket,
        workspaceId: props.workspaceId,
        disabled: !!props.disabled
    }), false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
        lineNumber: 42,
        columnNumber: 10
    }, this);
}
function ConversionResult({ ticket, workspaceId, disabled = false, onRefresh, onOpenReview, onNavigate }) {
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [dialogOpen, setDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const sequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    function isCurrent(request) {
        return mounted.current && !disabled && sequence.current === request;
    }
    async function load(signal) {
        if (lock.current || disabled || signal?.aborted) return;
        const request = ++sequence.current;
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatRequest"])(workspaceId, ticket, "GET", undefined, signal);
            if (!isCurrent(request)) return;
            setView(result.view);
            setError("");
        } catch (caught) {
            if (signal?.aborted || !isCurrent(request)) return;
            setView(null);
            setError(caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].unavailable);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const abort = new AbortController();
        const check = ()=>{
            void load(abort.signal);
        };
        const initial = setTimeout(check, 0);
        const timer = setInterval(check, 15000);
        window.addEventListener("focus", check);
        return ()=>{
            mounted.current = false;
            abort.abort();
            clearTimeout(initial);
            clearInterval(timer);
            window.removeEventListener("focus", check);
        };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function operate(command) {
        const { decision, ...binding } = command;
        if (disabled || lock.current || !view || JSON.stringify(binding) !== JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatBinding"])(view.ticket)) || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$estimate$2d$conversion$2d$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatDecisionSchema"].shape.decision.safeParse(decision).success) {
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].unavailable
            };
        }
        const requestId = ++sequence.current;
        lock.current = true;
        setPending(true);
        setError("");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConversionChatRequest"])(workspaceId, view.ticket, "POST", decision);
            if (!isCurrent(requestId)) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].unavailable
            };
            setView(result.view);
            if (decision === "review") {
                onOpenReview();
                setDialogOpen(true);
            } else {
                try {
                    await onRefresh();
                } catch  {
                    if (isCurrent(requestId)) setError(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].error);
                }
            }
            return {
                ok: true
            };
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].error;
            if (isCurrent(requestId)) {
                setError(message);
                setView(null);
            }
            return {
                ok: false,
                message
            };
        } finally{
            lock.current = false;
            if (mounted.current) setPending(false);
        }
    }
    const context = view ? {
        proposalId: view.ticket.id,
        inputHash: view.ticket.inputHash,
        authorizationVersion: view.ticket.authorizationVersion,
        estimate: view.review.estimate,
        customer: view.review.customer,
        parentJob: view.review.parentJob ?? undefined
    } : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].title,
        "aria-busy": pending,
        className: "grid min-w-0 gap-3 text-assistant-foreground print:hidden",
        children: disabled || !view ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-assistant-border bg-assistant-surface p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "status",
                    className: "m-0 text-sm",
                    children: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].unavailable : error || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].loading
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
                    lineNumber: 163,
                    columnNumber: 7
                }, this),
                error && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: "min-h-11 rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold",
                    disabled: pending,
                    onClick: ()=>{
                        void load();
                    },
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["estimateConvertResultData"].retry
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
                    lineNumber: 164,
                    columnNumber: 30
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
            lineNumber: 162,
            columnNumber: 26
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$convert$2d$card$2f$estimate$2d$convert$2d$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateConvertCard"], {
                    proposal: view.ticket,
                    context: context,
                    capabilities: cardCapabilities,
                    parentAccess: true,
                    canCreateJob: view.review.canCreateJob,
                    disabled: disabled || pending,
                    onDecide: operate
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
                    lineNumber: 167,
                    columnNumber: 7
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "alert",
                    className: "m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
                    lineNumber: 176,
                    columnNumber: 17
                }, this),
                dialogOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$estimates$2f$estimate$2d$convert$2d$dialog$2f$estimate$2d$convert$2d$connected$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EstimateConvertConnected"], {
                    workspaceId: workspaceId,
                    estimateId: view.ticket.estimate.id,
                    expectedVersion: view.ticket.estimate.version,
                    expectedSnapshotHash: view.ticket.estimate.snapshotHash,
                    open: true,
                    onClose: ()=>setDialogOpen(false),
                    onConverted: (receipt)=>{
                        setDialogOpen(false);
                        onNavigate(receipt.job.href);
                    },
                    onAccessLost: ()=>{
                        setDialogOpen(false);
                        void load();
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
                    lineNumber: 177,
                    columnNumber: 22
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx",
        lineNumber: 161,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/features/assistant/workspace-assistant/workspace-assistant.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceAssistantProvider",
    ()=>WorkspaceAssistantProvider,
    "useWorkspaceAssistant",
    ()=>useWorkspaceAssistant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/assistant-setup.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const Context = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function WorkspaceAssistantProvider({ enabled, initialPageContext, children }) {
    const [pageContext, updatePageContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialPageContext), [clearedKey, setClearedKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const setPageContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((next)=>{
        updatePageContext((old)=>JSON.stringify(old) === JSON.stringify(next) ? old : next);
    }, []);
    const clearPageContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setClearedKey(pageContext?.key);
    }, [
        pageContext?.key
    ]);
    const activeContext = pageContext?.key === clearedKey ? undefined : pageContext;
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false), [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(enabled ? 'busy' : 'unavailable');
    const captureHost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const registerCaptureSetup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((host)=>{
        captureHost.current = host;
    }, []);
    const activeContextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(activeContext);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        activeContextRef.current = activeContext;
    }, [
        activeContext
    ]);
    const readCaptureSetup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const snapshot = captureHost.current?.read();
        return snapshot && activeContextRef.current?.captureContext?.surface === 'lead_capture.setup' && activeContextRef.current.captureContext.sourceId === snapshot.sourceId ? snapshot : undefined;
    }, []);
    const applyCaptureSetup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((view, checkOnly = false)=>{
        const snapshot = readCaptureSetup();
        if (!snapshot || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureSetupCanonical"])(snapshot) !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$assistant$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["captureSetupCanonical"])(view.review.base)) return false;
        if (!checkOnly) captureHost.current?.apply(view);
        return true;
    }, [
        readCaptureSetup
    ]);
    const returnFocusRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const prepare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((prompt, trigger)=>{
        if (!enabled || status !== 'ready') return;
        setClearedKey(undefined);
        returnFocusRef.current = trigger;
        setDraft((current)=>current.trim() ? current : prompt);
        setOpen(true);
    }, [
        enabled,
        status
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            registerCaptureSetup,
            readCaptureSetup,
            applyCaptureSetup,
            open,
            setOpen,
            draft,
            setDraft,
            status: enabled ? status : 'unavailable',
            setStatus,
            returnFocusRef,
            prepare,
            pageContext: activeContext,
            setPageContext,
            clearPageContext
        }), [
        registerCaptureSetup,
        readCaptureSetup,
        applyCaptureSetup,
        open,
        draft,
        enabled,
        status,
        prepare,
        activeContext,
        setPageContext,
        clearPageContext
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Context.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/workspace-assistant/workspace-assistant.tsx",
        lineNumber: 50,
        columnNumber: 10
    }, this);
}
function useWorkspaceAssistant() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(Context);
}
}),
"[project]/apps/web/src/features/assistant/chat-stream.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readChatStream",
    ()=>readChatStream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-ssr] (ecmascript) <locals>");
;
async function* readChatStream(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8', {
        fatal: true
    });
    let buffer = '';
    let runId;
    let turnId;
    let messageId;
    let sequence = 0;
    let terminal = false;
    let pendingCR = false;
    function normalize(text, final) {
        // A CRLF pair can straddle network chunks. Normalize only once the LF arrives.
        if (pendingCR) {
            text = '\r' + text;
            pendingCR = false;
        }
        if (!final && text.endsWith('\r')) {
            text = text.slice(0, -1);
            pendingCR = true;
        }
        return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    function parse(frame) {
        if (frame.length > 64000) throw new Error('Invalid chat frame');
        const data = frame.split('\n').filter((line)=>line.startsWith('data:')).map((line)=>line.slice(5).replace(/^ /, '')).join('\n');
        if (!data) return;
        const event = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatStreamEventSchema"].parse(JSON.parse(data));
        if (runId && (event.runId !== runId || event.turnId !== turnId)) throw new Error('Unexpected chat run');
        if (event.sequence <= sequence) return; // Replay of already delivered events.
        if (terminal || event.sequence !== sequence + 1) throw new Error('Unexpected chat sequence');
        if (!runId) {
            if (event.type !== 'turn.accepted') throw new Error('Chat was not accepted');
            runId = event.runId;
            turnId = event.turnId;
            messageId = event.messageId;
        } else if (event.type === 'turn.accepted') throw new Error('Duplicate chat acceptance');
        if ('messageId' in event && event.messageId !== messageId) throw new Error('Unexpected chat message');
        if (event.type === 'estimates.result' && event.result.turnId !== turnId) throw new Error('Unexpected Estimate result turn');
        sequence = event.sequence;
        terminal = event.type === 'turn.completed' || event.type === 'turn.failed' || event.type === 'turn.cancelled';
        return event;
    }
    try {
        while(true){
            const chunk = await reader.read();
            buffer += normalize(chunk.done ? decoder.decode() : decoder.decode(chunk.value, {
                stream: true
            }), chunk.done);
            let boundary;
            while((boundary = buffer.indexOf('\n\n')) >= 0){
                const frame = buffer.slice(0, boundary);
                buffer = buffer.slice(boundary + 2);
                const event = parse(frame);
                if (event) yield event;
            }
            if (buffer.length > 64000) throw new Error('Invalid chat frame');
            if (chunk.done) break;
        }
        if (buffer.split('\n').some((line)=>line.trim() && !line.startsWith(':'))) throw new Error('Truncated chat frame');
        if (!terminal) throw new Error('Interrupted chat stream');
    } finally{
        await reader.cancel().catch(()=>{});
        reader.releaseLock();
    }
}
}),
"[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectedAssistantData",
    ()=>connectedAssistantData
]);
const connectedAssistantData = {
    historyChanged: 'These history results are unavailable or out of date. Ask the assistant to retrieve them again.',
    detailsChanged: 'These lead details have changed or are no longer available. Ask the assistant to retrieve them again.',
    searchChanged: 'These search results have changed or are no longer available. Ask the assistant to search again.',
    leadDeleted: 'The lead was permanently deleted.',
    calendarContextChanged: 'This visit changed or is no longer available. Clear the context or select the visit again before continuing.',
    previousContext: 'previous message context',
    leadLimit: 'Your workspace has reached its monthly new-lead limit. Ask the Owner to change plans or wait for the next monthly reset. Your proposal has not been saved as a lead.',
    budgetExceeded: 'Your workspace does not have enough monthly AI allowance for this response. The allowance resets on the first of next month (UTC). You can continue working manually.',
    draftChanged: 'This draft changed or expired. Ask for a new draft.',
    decisionInterrupted: 'The decision could not be verified. Retry to check the saved result.',
    loading: 'Loading conversation…',
    unavailable: 'Chat is temporarily unavailable. Try again shortly.',
    interrupted: 'The response was interrupted. Your saved conversation is retained. Retry only when you are ready.',
    denied: 'Your access changed. Reload this page before continuing.',
    limited: 'Please wait before sending another message.',
    newConversation: 'Start a new conversation'
};
}),
"[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectedAssistant",
    ()=>ConnectedAssistant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$connected$2d$capture$2d$source$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/connected-capture-source.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$connected$2d$capture$2d$setup$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/connected-capture-setup.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$connected$2d$capture$2d$read$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/capture-result/connected-capture-read.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$connected$2d$calendar$2d$schedule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-schedule-draft-card/connected-calendar-schedule.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$connected$2d$calendar$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/calendar-results-card/connected-calendar-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/customer-result/customer-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/work-order-result/work-order-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-sharing-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-archive-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-draft-delete-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/estimate-result/estimate-convert-result.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$assistant$2d$panel$2f$assistant$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/assistant/assistant-panel/assistant-panel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/chat-actions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$workspace$2d$assistant$2f$workspace$2d$assistant$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/workspace-assistant/workspace-assistant.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$chat$2d$stream$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/chat-stream.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.data.ts [app-ssr] (ecmascript)");
"use client";
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
const storageKey = (workspaceId)=>`salesmora-chat:${workspaceId}`;
const rememberedThread = (workspaceId)=>{
    try {
        return sessionStorage.getItem(storageKey(workspaceId)) ?? undefined;
    } catch  {
        return undefined;
    }
};
const rememberThread = (workspaceId, id)=>{
    try {
        if (id) sessionStorage.setItem(storageKey(workspaceId), id);
        else sessionStorage.removeItem(storageKey(workspaceId));
    } catch  {}
};
function ConnectedAssistant({ workspaceId, surfaceKey }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const workspaceAssistant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$workspace$2d$assistant$2f$workspace$2d$assistant$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWorkspaceAssistant"])();
    const captureSaved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        router.refresh();
    }, [
        router
    ]);
    const setAssistantStatus = workspaceAssistant?.setStatus;
    const [pendingContextLabel, setPendingContextLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [runStatus, setRunStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [canRetry, setCanRetry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [blocked, setBlocked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const thread = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const turn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const abort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const stopRequested = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const lastRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const recoveryRequired = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setAssistantStatus?.(blocked || recoveryRequired.current ? "unavailable" : loading || runStatus === "thinking" || runStatus === "streaming" ? "busy" : "ready");
    }, [
        setAssistantStatus,
        blocked,
        loading,
        runStatus
    ]);
    const restore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        const response = await fetch(`/api/chat/threads?workspace=${encodeURIComponent(workspaceId)}&thread=${encodeURIComponent(id)}`, {
            cache: "no-store"
        });
        if (!response.ok) throw Error("History unavailable");
        const history = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatHistoryResponseSchema"].parse(await response.json());
        if (!mounted.current) return history;
        thread.current = history.threadId;
        rememberThread(workspaceId, history.threadId);
        setMessages(history.messages.map((message)=>{
            const state = history.turns.find((turn)=>turn.id === message.turnId);
            return {
                id: message.id,
                role: message.role,
                text: message.text,
                calendarProposal: message.role === "assistant" ? state?.calendarProposal : undefined,
                captureSource: message.role === "assistant" ? state?.captureSource : undefined,
                captureSetup: message.role === "assistant" ? state?.captureSetup : undefined,
                captureResult: message.role === "assistant" ? state?.captureResult : undefined,
                calendarResult: message.role === "assistant" ? state?.calendarResult : undefined,
                calendarTurnId: message.role === "assistant" ? message.turnId : undefined,
                customerResult: message.role === "assistant" ? state?.customerResult : undefined,
                workOrderResult: message.role === "assistant" ? state?.workOrderResult : undefined,
                estimateResult: message.role === "assistant" ? state?.estimateResult : undefined,
                estimateDraft: message.role === "assistant" ? state?.estimateDraft : undefined,
                estimateSharing: message.role === "assistant" ? state?.estimateSharing : undefined,
                estimateDecision: message.role === "assistant" ? state?.estimateDecision : undefined,
                estimateDraftAction: message.role === "assistant" ? state?.estimateDraftAction : undefined,
                estimateVoid: message.role === "assistant" ? state?.estimateVoid : undefined,
                estimateArchive: message.role === "assistant" ? state?.estimateArchive : undefined,
                estimateDraftDelete: message.role === "assistant" ? state?.estimateDraftDelete : undefined,
                estimateConversion: message.role === "assistant" ? state?.estimateConversion : undefined,
                action: message.role === "assistant" ? state?.action : undefined,
                detailsResult: message.role === "assistant" ? state?.detailsResult : undefined,
                historyResult: message.role === "assistant" ? state?.historyResult : undefined,
                searchResult: message.role === "assistant" ? state?.searchResult : undefined,
                sources: message.role === "assistant" ? state?.sources : undefined,
                interrupted: message.role === "assistant" && !!state && [
                    "failed",
                    "cancelled",
                    "interrupted"
                ].includes(state.state)
            };
        }));
        const latest = history.turns.at(-1);
        if (latest && [
            "failed",
            "cancelled",
            "interrupted"
        ].includes(latest.state) && !lastRequest.current) {
            const message = history.messages.filter((message)=>message.role === "user").at(-1)?.text;
            if (message) {
                lastRequest.current = {
                    workspaceId,
                    threadId: history.threadId,
                    surfaceKey: latest.surfaceKey ?? surfaceKey,
                    ...latest.pageContext,
                    clientTurnId: latest.clientTurnId,
                    message
                };
                setCanRetry(true);
            }
        }
        if (latest && [
            "accepted",
            "running"
        ].includes(latest.state)) {
            turn.current = latest.id;
            setRunStatus("thinking");
        } else {
            turn.current = undefined;
            setRunStatus(latest?.state === "completed" ? "completed" : latest?.state === "cancelled" ? "cancelled" : latest ? "failed" : undefined);
        }
        return history;
    }, [
        workspaceId,
        surfaceKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        const id = rememberedThread(workspaceId);
        thread.current = id;
        void Promise.resolve().then(()=>id ? restore(id) : undefined).catch(()=>{
            if (mounted.current) {
                setBlocked(true);
                setRunStatus("failed");
            }
        }).finally(()=>{
            if (mounted.current) setLoading(false);
        });
        return ()=>{
            mounted.current = false;
            abort.current?.abort();
        };
    }, [
        workspaceId,
        restore
    ]);
    // Reopen/focus and bounded idle refresh reauthorize cached customer cards without model calls.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!workspaceAssistant?.open || loading) return;
        const refresh = ()=>{
            if (pending.current || !thread.current || document.visibilityState === "hidden") return;
            void restore(thread.current).catch(()=>{
                setMessages([]);
                setBlocked(true);
            });
        };
        refresh();
        window.addEventListener("focus", refresh);
        const timer = setInterval(refresh, 15000);
        return ()=>{
            window.removeEventListener("focus", refresh);
            clearInterval(timer);
        };
    }, [
        workspaceAssistant?.open,
        loading,
        restore
    ]);
    // A disconnected accepted run can still be settling on the server. Read only; never regenerate.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (pending.current || !thread.current || ![
            "thinking",
            "streaming"
        ].includes(runStatus ?? "")) return;
        const timer = setInterval(()=>{
            if (thread.current) void restore(thread.current).catch(()=>{
                setBlocked(true);
                setRunStatus("failed");
            });
        }, 1500);
        return ()=>clearInterval(timer);
    }, [
        runStatus,
        restore
    ]);
    async function send(message, reconciliation) {
        if (pending.current || blocked) return {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].unavailable
        };
        if (recoveryRequired.current && !reconciliation) return {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
        };
        pending.current = true;
        stopRequested.current = false;
        const request = reconciliation ?? {
            workspaceId,
            threadId: thread.current,
            surfaceKey,
            clientTurnId: crypto.randomUUID(),
            ...workspaceAssistant?.pageContext?.recordRefs ? {
                recordRefs: workspaceAssistant.pageContext.recordRefs
            } : {},
            ...workspaceAssistant?.pageContext?.uiState ? {
                uiState: workspaceAssistant.pageContext.uiState
            } : {},
            ...workspaceAssistant?.pageContext?.customerFilters ? {
                customerFilters: workspaceAssistant.pageContext.customerFilters
            } : {},
            ...workspaceAssistant?.readCaptureSetup() ? {
                captureSetup: workspaceAssistant.readCaptureSetup()
            } : {},
            ...workspaceAssistant?.pageContext?.captureContext ? {
                captureContext: workspaceAssistant.pageContext.captureContext
            } : {},
            ...workspaceAssistant?.pageContext?.calendarVisit ? {
                calendarVisit: workspaceAssistant.pageContext.calendarVisit
            } : {},
            ...workspaceAssistant?.pageContext?.calendarFilters ? {
                calendarFilters: workspaceAssistant.pageContext.calendarFilters
            } : {},
            ...workspaceAssistant?.pageContext?.estimateFilters ? {
                estimateFilters: workspaceAssistant.pageContext.estimateFilters
            } : {},
            message
        };
        if (new TextEncoder().encode(JSON.stringify(request)).byteLength > 16000) {
            pending.current = false;
            return {
                ok: false,
                message: 'This request and setup are too large. Shorten the message or pasted sample, or save other draft changes first.'
            };
        }
        const selected = workspaceAssistant?.pageContext;
        const sameContext = JSON.stringify({
            captureSetup: request.captureSetup,
            captureContext: request.captureContext,
            recordRefs: request.recordRefs,
            uiState: request.uiState,
            customerFilters: request.customerFilters,
            estimateFilters: request.estimateFilters,
            calendarFilters: request.calendarFilters,
            calendarVisit: request.calendarVisit
        }) === JSON.stringify({
            captureSetup: workspaceAssistant?.readCaptureSetup(),
            captureContext: selected?.captureContext,
            recordRefs: selected?.recordRefs,
            uiState: selected?.uiState,
            customerFilters: selected?.customerFilters,
            estimateFilters: selected?.estimateFilters,
            calendarFilters: selected?.calendarFilters,
            calendarVisit: selected?.calendarVisit
        });
        setPendingContextLabel(sameContext ? selected?.label : request.recordRefs?.length || request.uiState || request.customerFilters || request.estimateFilters || request.calendarFilters || request.calendarVisit ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].previousContext : undefined);
        lastRequest.current = request;
        setCanRetry(true);
        abort.current = new AbortController();
        const localUser = `user-${request.clientTurnId}`;
        const localAssistant = `assistant-${request.clientTurnId}`;
        setMessages((current)=>[
                ...current.filter((item)=>item.id !== localUser && item.id !== localAssistant),
                {
                    id: localUser,
                    role: "user",
                    text: message
                },
                {
                    id: localAssistant,
                    role: "assistant",
                    text: ""
                }
            ]);
        setRunStatus("thinking");
        let terminal = false;
        let result = {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
        };
        try {
            const response = await fetch("/api/chat/turns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request),
                signal: abort.current.signal
            });
            if (!response.ok) {
                terminal = true; // Known rejection: no accepted run to reconcile.
                if (response.status === 409 && (await response.json().catch(()=>null))?.error === 'calendar_context_changed') throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].calendarContextChanged);
                if ([
                    401,
                    403
                ].includes(response.status)) {
                    setBlocked(true);
                    throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].denied);
                }
                if (response.status === 429) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].limited);
                throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].unavailable);
            }
            if (response.headers.get("content-type")?.includes("application/json")) {
                const replay = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["chatReplayResponseSchema"].parse(await response.json());
                thread.current = replay.threadId;
                rememberThread(workspaceId, replay.threadId);
                await restore(replay.threadId);
                recoveryRequired.current = false;
                terminal = true;
                result = replay.state === "completed" || [
                    "accepted",
                    "running"
                ].includes(replay.state) ? {
                    ok: true
                } : {
                    ok: false,
                    message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
                };
                return result;
            }
            if (!response.headers.get("content-type")?.includes("text/event-stream") || !response.body) throw Error(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted);
            for await (const event of (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$chat$2d$stream$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readChatStream"])(response.body)){
                if (!mounted.current) break;
                switch(event.type){
                    case "turn.accepted":
                        thread.current = event.threadId;
                        turn.current = event.turnId;
                        rememberThread(workspaceId, event.threadId);
                        if (stopRequested.current) void stop();
                        break;
                    case "status":
                        setRunStatus("thinking");
                        break;
                    case "message.delta":
                        setRunStatus("streaming");
                        setMessages((current)=>current.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    text: item.text + event.text
                                } : item));
                        break;
                    case "sources":
                        setMessages((current)=>current.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    sources: event.sources
                                } : item));
                        break;
                    case "customers.result":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    customerResult: event.result
                                } : item));
                        break;
                    case "capture.source":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    captureSource: event.result
                                } : item));
                        break;
                    case "capture.setup":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    captureSetup: event.result
                                } : item));
                        break;
                    case "capture.result":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    captureResult: event.result
                                } : item));
                        break;
                    case "calendar.proposal":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    calendarProposal: event.result
                                } : item));
                        break;
                    case "calendar.result":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    calendarResult: event.result,
                                    calendarTurnId: event.turnId
                                } : item));
                        break;
                    case "work_orders.result":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    workOrderResult: event.result
                                } : item));
                        break;
                    case "estimates.result":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateResult: event.result
                                } : item));
                        break;
                    case "estimates.draft":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateDraft: event.result
                                } : item));
                        break;
                    case "estimates.draft_action":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateDraftAction: event.result
                                } : item));
                        break;
                    case "estimates.void":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateVoid: event.result
                                } : item));
                        break;
                    case "estimates.archive":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateArchive: event.result
                                } : item));
                        break;
                    case "estimates.draft_delete":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateDraftDelete: event.result
                                } : item));
                        break;
                    case "estimates.convert":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateConversion: event.result
                                } : item));
                        break;
                    case "estimates.decision":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateDecision: event.result
                                } : item));
                        break;
                    case "estimates.sharing":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    estimateSharing: event.result
                                } : item));
                        break;
                    case "lead.history":
                        setMessages((items)=>items.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    historyResult: event.result
                                } : item));
                        break;
                    case "lead.details":
                        setMessages((current)=>current.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    detailsResult: event.result
                                } : item));
                        break;
                    case "leads.results":
                        setMessages((current)=>current.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    searchResult: event.result
                                } : item));
                        break;
                    case "action.proposed":
                        setMessages((current)=>current.map((item)=>item.id === localAssistant ? {
                                    ...item,
                                    action: event.action
                                } : item));
                        break;
                    case "turn.completed":
                        terminal = true;
                        setRunStatus("completed");
                        result = {
                            ok: true
                        };
                        break;
                    case "turn.cancelled":
                        terminal = true;
                        setRunStatus("cancelled");
                        result = {
                            ok: true
                        };
                        break;
                    case "turn.failed":
                        terminal = true;
                        setRunStatus("failed");
                        if (event.code === "access_denied") setBlocked(true);
                        result = {
                            ok: false,
                            message: event.code === "budget_exceeded" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].budgetExceeded : event.code === "access_denied" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].denied : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
                        };
                        break;
                }
            }
        } catch (error) {
            if (mounted.current) {
                setRunStatus("failed");
                result = {
                    ok: false,
                    message: error instanceof Error && [
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].denied,
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].limited,
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].unavailable,
                        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].calendarContextChanged
                    ].some((message)=>message === error.message) ? error.message : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
                };
            }
        } finally{
            pending.current = false;
            abort.current = undefined;
            if (mounted.current) {
                if (!terminal) recoveryRequired.current = true;
                setMessages((current)=>current.map((item)=>item.id === localAssistant ? {
                            ...item,
                            interrupted: !terminal || !result.ok
                        } : item));
            }
            turn.current = undefined;
            if (terminal && thread.current && mounted.current && !blocked) await restore(thread.current).catch(()=>{});
        }
        return result;
    }
    async function stop() {
        stopRequested.current = true;
        if (!turn.current) return; // Cancel immediately once acceptance supplies the durable run ID.
        try {
            const response = await fetch("/api/chat/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    workspaceId,
                    turnId: turn.current
                })
            });
            if (!response.ok) abort.current?.abort();
        } catch  {
            abort.current?.abort();
        }
    }
    async function retry() {
        if (!lastRequest.current) return {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
        };
        if (thread.current) {
            try {
                const history = await restore(thread.current);
                if (history.turns.some((turn)=>[
                        "accepted",
                        "running"
                    ].includes(turn.state))) return {
                    ok: false,
                    message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
                };
                if (history.turns.at(-1)?.state === "completed") {
                    recoveryRequired.current = false;
                    return {
                        ok: true
                    };
                }
            } catch  {
                return {
                    ok: false,
                    message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].denied
                };
            }
        } else if (recoveryRequired.current) return send(lastRequest.current.message, lastRequest.current);
        recoveryRequired.current = false;
        return send(lastRequest.current.message, {
            ...lastRequest.current,
            threadId: thread.current,
            clientTurnId: crypto.randomUUID()
        });
    }
    function newConversation() {
        if (pending.current) return;
        thread.current = undefined;
        turn.current = undefined;
        lastRequest.current = undefined;
        recoveryRequired.current = false;
        rememberThread(workspaceId);
        setCanRetry(false);
        setMessages([]);
        setRunStatus(undefined);
        setBlocked(false);
    }
    async function openLeadResult(resultId, leadId, changedMessage) {
        if (pending.current || blocked) return {
            ok: false,
            message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].unavailable
        };
        try {
            const response = await fetch("/api/chat/leads/navigation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    workspaceId,
                    resultId,
                    ...leadId ? {
                        leadId
                    } : {}
                })
            });
            if (!response.ok) {
                // Clear cached content immediately if a snapshot is no longer authorized/current.
                setMessages([]);
                if (thread.current) await restore(thread.current).catch(()=>{});
                return {
                    ok: false,
                    message: changedMessage
                };
            }
            const body = await response.json();
            // Only the app route generates destinations. Never follow arbitrary model/client URLs.
            if (typeof body.href !== "string" || !/^\/leads(?:\/[0-9a-f-]{36})?\?/.test(body.href)) throw Error("Invalid destination");
            workspaceAssistant?.setOpen(false);
            workspaceAssistant?.clearPageContext();
            router.push(body.href);
            return {
                ok: true
            };
        } catch  {
            return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].unavailable
            };
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$assistant$2f$assistant$2d$panel$2f$assistant$2d$panel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AssistantPanel"], {
        open: workspaceAssistant?.open,
        onOpenChange: workspaceAssistant?.setOpen,
        draft: workspaceAssistant?.draft,
        onDraftChange: workspaceAssistant?.setDraft,
        returnFocusRef: workspaceAssistant?.returnFocusRef,
        contextLabel: runStatus === "thinking" || runStatus === "streaming" ? pendingContextLabel : workspaceAssistant?.pageContext?.label,
        onClearContext: workspaceAssistant?.clearPageContext,
        messages: messages,
        renderMessageSupplement: (message)=>{
            const calendar = messages.find((item)=>item.id === message.id);
            const customer = messages.find((item)=>item.id === message.id)?.customerResult;
            const workOrder = messages.find((item)=>item.id === message.id)?.workOrderResult;
            const captureSource = messages.find((item)=>item.id === message.id)?.captureSource;
            const captureSetup = messages.find((item)=>item.id === message.id)?.captureSetup;
            const capture = messages.find((item)=>item.id === message.id)?.captureResult;
            const estimate = messages.find((item)=>item.id === message.id)?.estimateResult;
            const estimateDraft = messages.find((item)=>item.id === message.id)?.estimateDraft;
            const estimateSharing = messages.find((item)=>item.id === message.id)?.estimateSharing;
            const estimateDecision = messages.find((item)=>item.id === message.id)?.estimateDecision;
            const estimateDraftAction = messages.find((item)=>item.id === message.id)?.estimateDraftAction;
            const estimateVoid = messages.find((item)=>item.id === message.id)?.estimateVoid;
            const estimateArchive = messages.find((item)=>item.id === message.id)?.estimateArchive;
            const estimateDraftDelete = messages.find((item)=>item.id === message.id)?.estimateDraftDelete;
            const estimateConversion = messages.find((item)=>item.id === message.id)?.estimateConversion;
            if (!captureSource && !captureSetup && !capture && !calendar?.calendarProposal && !calendar?.calendarResult && !customer && !workOrder && !estimate && !estimateDraft && !estimateSharing && !estimateDecision && !estimateDraftAction && !estimateVoid && !estimateArchive && !estimateDraftDelete && !estimateConversion) return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid min-w-0 gap-4",
                children: [
                    captureSource && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$connected$2d$capture$2d$source$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedCaptureSource"], {
                        ticket: captureSource,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onSaved: captureSaved
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 736,
                        columnNumber: 29
                    }, this),
                    captureSetup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$connected$2d$capture$2d$setup$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedCaptureSetup"], {
                        ticket: captureSetup,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        apply: workspaceAssistant?.applyCaptureSetup,
                        onSaved: captureSaved
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 737,
                        columnNumber: 28
                    }, this),
                    capture && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$capture$2d$result$2f$connected$2d$capture$2d$read$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedCaptureRead"], {
                        ticket: capture,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 738,
                        columnNumber: 23
                    }, this),
                    calendar?.calendarProposal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$schedule$2d$draft$2d$card$2f$connected$2d$calendar$2d$schedule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedCalendarSchedule"], {
                        ticket: calendar.calendarProposal,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 739,
                        columnNumber: 42
                    }, this),
                    calendar?.calendarResult && calendar.calendarTurnId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$calendar$2d$results$2d$card$2f$connected$2d$calendar$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedCalendarResult"], {
                        result: calendar.calendarResult,
                        workspaceId: workspaceId,
                        turnId: calendar.calendarTurnId,
                        disabled: blocked || runStatus === 'thinking' || runStatus === 'streaming',
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, `${workspaceId}:${calendar.calendarTurnId}:${calendar.calendarResult.id}`, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 740,
                        columnNumber: 67
                    }, this),
                    workOrder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$work$2d$order$2d$result$2f$work$2d$order$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedWorkOrderResult"], {
                        result: workOrder,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 743,
                        columnNumber: 13
                    }, this),
                    customer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$customer$2d$result$2f$customer$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedCustomerResult"], {
                        result: customer,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async (deleted)=>{
                            if (deleted) {
                                setMessages([]);
                                lastRequest.current = undefined;
                                setCanRetry(false);
                                workspaceAssistant?.clearPageContext();
                            }
                            try {
                                if (thread.current) await restore(thread.current);
                            } catch (error) {
                                if (!deleted) throw error;
                            }
                            if (deleted && window.location.pathname.startsWith("/customers/")) {
                                workspaceAssistant?.setOpen(false);
                                workspaceAssistant?.clearPageContext();
                                router.replace(`/customers?workspace=${workspaceId}`);
                                return;
                            }
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 761,
                        columnNumber: 11
                    }, this),
                    estimate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateResult"], {
                        result: estimate,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimate.turnId, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 797,
                        columnNumber: 22
                    }, this),
                    estimateDraft && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateDraft"], {
                        view: estimateDraft,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimateDraft.draft.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 811,
                        columnNumber: 27
                    }, this),
                    estimateSharing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$sharing$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateSharing"], {
                        ticket: estimateSharing,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimateSharing.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 819,
                        columnNumber: 29
                    }, this),
                    estimateVoid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$void$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateVoid"], {
                        ticket: estimateVoid,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimateVoid.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 827,
                        columnNumber: 26
                    }, this),
                    estimateDraftAction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$action$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateDraftAction"], {
                        ticket: estimateDraftAction,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimateDraftAction.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 835,
                        columnNumber: 33
                    }, this),
                    estimateDecision && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$decision$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateDecision"], {
                        ticket: estimateDecision,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimateDecision.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 843,
                        columnNumber: 30
                    }, this),
                    estimateArchive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$archive$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateArchive"], {
                        ticket: estimateArchive,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        },
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimateArchive.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 851,
                        columnNumber: 29
                    }, this),
                    estimateDraftDelete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$draft$2d$delete$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateDraftDelete"], {
                        ticket: estimateDraftDelete,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                            router.refresh();
                        }
                    }, estimateDraftDelete.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 859,
                        columnNumber: 33
                    }, this),
                    estimateConversion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$estimate$2d$result$2f$estimate$2d$convert$2d$result$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConnectedEstimateConversion"], {
                        ticket: estimateConversion,
                        workspaceId: workspaceId,
                        disabled: blocked || runStatus === "thinking" || runStatus === "streaming",
                        onRefresh: async ()=>{
                            if (thread.current) await restore(thread.current);
                        },
                        onOpenReview: ()=>workspaceAssistant?.setOpen(false),
                        onNavigate: (href)=>{
                            workspaceAssistant?.setOpen(false);
                            workspaceAssistant?.clearPageContext();
                            router.push(href);
                        }
                    }, estimateConversion.id, false, {
                        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                        lineNumber: 864,
                        columnNumber: 32
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
                lineNumber: 735,
                columnNumber: 16
            }, this);
        },
        runStatus: runStatus,
        disabled: loading,
        sendDisabled: blocked,
        badge: loading ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].loading : undefined,
        onOpenSearchResult: (resultId, leadId)=>openLeadResult(resultId, leadId, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].searchChanged),
        onOpenHistoryResult: (resultId, leadId)=>openLeadResult(resultId, leadId, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].historyChanged),
        onOpenDetailsResult: (resultId, leadId)=>openLeadResult(resultId, leadId, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].detailsChanged),
        onAction: async (draft, decision, typedConfirmation)=>{
            if (pending.current || blocked) return {
                ok: false,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].unavailable
            };
            try {
                const isDelete = "actionType" in draft && draft.actionType === "lead.delete";
                const isExport = "actionType" in draft && draft.actionType === "lead.export" && decision === "confirm";
                const response = await fetch(isDelete ? "/api/chat/deletions" : isExport ? "/api/chat/exports" : "/api/chat/actions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        workspaceId,
                        draftId: draft.id,
                        inputHash: draft.inputHash,
                        decision,
                        ...isDelete ? {
                            typedConfirmation: typedConfirmation ?? ""
                        } : {}
                    })
                });
                if (!response.ok) {
                    const failure = await response.json().catch(()=>null);
                    if (thread.current) await restore(thread.current);
                    return {
                        ok: false,
                        message: failure?.error === "plan_limit" ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].leadLimit : response.status === 403 ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].denied : response.status === 409 ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].draftChanged : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].interrupted
                    };
                }
                if (isExport) {
                    // Await the complete body: never download a partial CSV after a stream failure.
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `salesmora-leads-${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setTimeout(()=>URL.revokeObjectURL(url), 60000);
                    setMessages((current)=>current.map((item)=>item.action?.id === draft.id ? {
                                ...item,
                                action: {
                                    ...draft,
                                    state: "confirmed"
                                }
                            } : item));
                    return {
                        ok: true
                    };
                }
                const { action } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$chat$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["chatActionResponseSchema"].parse(await response.json());
                if ("actionType" in action && action.actionType === "lead.delete" && action.state === "confirmed") {
                    // Remove cached lead-derived cards/text immediately, even if the protected history refresh fails.
                    setMessages([
                        {
                            id: action.id,
                            role: "assistant",
                            text: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].leadDeleted,
                            action
                        }
                    ]);
                    lastRequest.current = undefined;
                    setCanRetry(false);
                    workspaceAssistant?.clearPageContext();
                    try {
                        if (thread.current) await restore(thread.current);
                    } catch  {
                    /* Keep only the non-content receipt. */ }
                } else setMessages((current)=>current.map((item)=>item.action?.id === action.id ? {
                            ...item,
                            action
                        } : item));
                if (decision === "confirm" && action.state === "confirmed") {
                    if ("actionType" in action && action.actionType === "lead.delete" && window.location.pathname.toLowerCase() === `/leads/${action.lead.id.toLowerCase()}`) {
                        workspaceAssistant?.clearPageContext();
                        router.replace(`/leads?workspace=${encodeURIComponent(workspaceId)}`);
                    } else router.refresh();
                }
                return {
                    ok: true
                };
            } catch  {
                return {
                    ok: false,
                    message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$assistant$2f$connected$2d$assistant$2f$connected$2d$assistant$2e$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedAssistantData"].decisionInterrupted
                };
            }
        },
        onSend: send,
        onStop: ()=>void stop(),
        onRetry: canRetry && !blocked ? retry : undefined,
        onNewConversation: newConversation
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/assistant/connected-assistant/connected-assistant.tsx",
        lineNumber: 701,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_assistant_03a~76k._.js.map