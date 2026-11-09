(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/src/features/jobs/job-status-badge/job-status-badge.data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jobStatusBadgeData",
    ()=>jobStatusBadgeData,
    "jobStatusBadgeStoryData",
    ()=>jobStatusBadgeStoryData
]);
const jobStatusBadgeData = {
    "needs-scheduling": {
        label: "Needs Scheduling",
        tone: "neutral"
    },
    scheduled: {
        label: "Scheduled",
        tone: "info"
    },
    "in-progress": {
        label: "In Progress",
        tone: "info"
    },
    waiting: {
        label: "Waiting",
        tone: "warning"
    },
    completed: {
        label: "Completed",
        tone: "success"
    },
    canceled: {
        label: "Canceled",
        tone: "error"
    }
};
const jobStatusBadgeStoryData = {
    title: "Job statuses",
    description: "Scheduled work and job progress use the same statuses across Jobs and Calendar.",
    job: "J-1038 · Kitchen sink repair",
    customer: "Jordan Lee",
    next: "Waiting on materials",
    label: "Current status"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-status-badge/job-status-badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobStatusBadge",
    ()=>JobStatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/data-display/status-badge/status-badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-status-badge/job-status-badge.data.ts [app-client] (ecmascript)");
;
;
;
function JobStatusBadge({ status }) {
    const { label, tone } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobStatusBadgeData"][status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$data$2d$display$2f$status$2d$badge$2f$status$2d$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatusBadge"], {
        label: label,
        tone: tone,
        dot: true
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/jobs/job-status-badge/job-status-badge.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
_c = JobStatusBadge;
var _c;
__turbopack_context__.k.register(_c, "JobStatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-ui.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fileSize",
    ()=>fileSize,
    "jobButton",
    ()=>jobButton,
    "jobDate",
    ()=>jobDate,
    "jobInitials",
    ()=>jobInitials,
    "jobInput",
    ()=>jobInput,
    "jobLabel",
    ()=>jobLabel,
    "jobPanel",
    ()=>jobPanel,
    "jobPrimary",
    ()=>jobPrimary,
    "jobTimestamp",
    ()=>jobTimestamp
]);
const jobButton = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
const jobPrimary = 'min-h-11 max-w-full cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
const jobPanel = 'min-w-0 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-6';
const jobInput = 'min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas';
const jobLabel = 'grid min-w-0 gap-2 text-sm font-semibold text-ink';
function jobDate(value) {
    if (!value) return '—';
    const day = value.slice(0, 10);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(new Date(day + 'T12:00:00Z'));
}
function jobInitials(name) {
    return name.split(/\s+/u).slice(0, 2).map((p)=>p[0]).join('').toUpperCase();
}
function fileSize(bytes) {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 1
    }).format(bytes / 1000000) + ' MB';
}
function jobTimestamp(value, timezone) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        ...timezone ? {
            timeZone: timezone
        } : {},
        timeZoneName: 'short'
    }).format(new Date(value));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-dialog/job-dialog.data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "copy",
    ()=>copy
]);
const copy = {
    close: 'Close',
    reload: 'Reload latest values',
    conflict: 'This job changed. Reload the latest values before saving; your draft has been preserved.',
    cancel: 'Cancel',
    saving: 'Saving…',
    error: 'The change could not be saved. Your entries are preserved. Please try again.'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobDialog",
    ()=>JobDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$Dialog$2f$Dialog$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/Dialog/Dialog.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-ui.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-dialog/job-dialog.data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function JobDialog({ open, title, description, children, confirmLabel, confirmDisabled, pending, error, conflict = false, onReload, closeOnSubmit = true, onClose, onSubmit }) {
    _s();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])(), [working, setWorking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [failure, setFailure] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(''), inFlight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false), busy = !!pending || working;
    const close = ()=>{
        if (!busy && !inFlight.current) onClose();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$Dialog$2f$Dialog$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        open: open,
        fullWidth: true,
        maxWidth: "sm",
        scroll: "paper",
        onClose: close,
        slotProps: {
            backdrop: {
                className: 'bg-ink/50'
            },
            paper: {
                tabIndex: busy ? 0 : -1,
                'aria-labelledby': id,
                'aria-describedby': `${id}-description`,
                className: 'm-3 min-w-0 rounded-2xl bg-paper text-ink focus-visible:focus-ring sm:m-8'
            }
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            className: "min-w-0 p-5 sm:p-8",
            onSubmit: async (e)=>{
                e.preventDefault();
                if (busy || conflict || confirmDisabled || inFlight.current) return;
                inFlight.current = true;
                setWorking(true);
                setFailure('');
                try {
                    await onSubmit();
                    if (closeOnSubmit) onClose();
                } catch  {
                    setFailure(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].error);
                } finally{
                    inFlight.current = false;
                    setWorking(false);
                }
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "mb-6 flex items-start justify-between gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    id: id,
                                    className: "m-0 text-2xl font-semibold wrap-anywhere",
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                                    lineNumber: 7,
                                    columnNumber: 715
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    id: `${id}-description`,
                                    className: "mb-0 mt-3 text-sm leading-6 text-muted",
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                                    lineNumber: 7,
                                    columnNumber: 792
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                            lineNumber: 7,
                            columnNumber: 690
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            disabled: busy,
                            onClick: close,
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobButton"]} shrink-0`,
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].close
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                            lineNumber: 7,
                            columnNumber: 894
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                    lineNumber: 7,
                    columnNumber: 626
                }, this),
                (error || failure || conflict) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: error || failure || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].conflict
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                        lineNumber: 7,
                        columnNumber: 1065
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                    lineNumber: 7,
                    columnNumber: 1043
                }, this),
                conflict && onReload && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobButton"]} mb-4`,
                    disabled: busy,
                    onClick: onReload,
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].reload
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                    lineNumber: 7,
                    columnNumber: 1161
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                    disabled: busy,
                    className: "m-0 grid min-w-0 gap-4 border-0 p-0",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                    lineNumber: 7,
                    columnNumber: 1273
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    className: "mt-6 flex flex-wrap justify-end gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            disabled: busy,
                            onClick: close,
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobButton"],
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].cancel
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                            lineNumber: 7,
                            columnNumber: 1426
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: busy || conflict || confirmDisabled,
                            "aria-busy": busy,
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobPrimary"],
                            children: busy ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].saving : confirmLabel
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                            lineNumber: 7,
                            columnNumber: 1524
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
                    lineNumber: 7,
                    columnNumber: 1368
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
            lineNumber: 7,
            columnNumber: 304
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
_s(JobDialog, "+iKsoyxyPk7xidlFGBHvaJiCnMA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = JobDialog;
var _c;
__turbopack_context__.k.register(_c, "JobDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "copy",
    ()=>copy
]);
const copy = {
    deadlineChoice: 'Deadline choice',
    defaultChoice: 'Workspace default',
    customChoice: 'Date chosen for this Job',
    unsetChoice: 'Explicitly left without a deadline',
    deadlineTimezone: 'Workspace timezone',
    title: 'Create a job',
    invalidPhone: 'Enter a valid phone number, or leave it blank.',
    description: 'Start with the customer and work title. Add only the optional details you need, then review before creating.',
    customer: 'Customer',
    choose: 'Choose a customer',
    newCustomer: 'Create a new customer',
    name: 'Customer name',
    email: 'Email · optional',
    phone: 'Phone · optional',
    job: 'Job title',
    owner: 'Primary owner',
    chooseOwner: 'Choose an owner',
    unassigned: 'Leave unassigned',
    optional: 'Optional work details',
    service: 'Service type',
    location: 'Work location',
    descriptionLabel: 'Description',
    scheduled: 'Scheduled work date',
    window: 'Arrival window',
    none: 'Not set',
    deadline: 'Completion deadline',
    helper: 'Work date and completion deadline are separate. Scheduled dates start the job in Scheduled.',
    review: 'Review job',
    confirm: 'Confirm and create',
    reviewTitle: 'Review new job',
    reviewDescription: 'Confirm the customer, work, owner and dates before creating the job.',
    edit: 'Edit details',
    newHelp: 'Name is required. Email and phone are optional; duplicate checks will run during live integration.',
    invalid: 'Check the customer, title, owner and dates.',
    team: 'Additional team members',
    status: 'Initial status'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jobDeadlineChoiceData",
    ()=>jobDeadlineChoiceData
]);
const jobDeadlineChoiceData = {
    title: 'Completion deadline',
    description: 'Use the workspace rule, choose a date for this Job, or deliberately leave its deadline unset. The scheduled visit date is separate.',
    workspace: 'Use workspace default',
    custom: 'Choose a date',
    unset: 'Leave this Job without a deadline',
    workspaceUnset: 'The workspace default leaves new Jobs without a deadline.',
    relative: (days, count)=>`${days} ${count === 'business' ? 'business' : 'calendar'} ${days === 1 ? 'day' : 'days'} after Job creation`,
    counting: 'Business days are Monday–Friday; holidays are not excluded. Counting starts after the creation day.',
    customHelp: 'This date overrides the workspace default for this Job only.',
    unsetHelp: 'Create this Job with no deadline, even if the workspace default sets one.',
    date: 'Deadline date',
    result: 'Deadline to review',
    noDeadline: 'No completion deadline',
    needsDate: 'Choose a valid deadline date.',
    timezone: 'Workspace timezone',
    created: 'Creation date used for this preview',
    preview: 'The server will verify the rule and creation date when you confirm. If the result has changed, review the updated deadline before creating the Job.',
    limited: 'The workspace default applies. You need permission to override a Job’s deadline before choosing a different date or leaving it unset.',
    readOnly: 'This deadline choice is read-only.',
    stale: 'The workspace default changed. Use the current default and review the resulting deadline again.',
    useCurrent: 'Use current default',
    denied: 'You no longer have permission to override the workspace default. Choose the workspace default to continue.',
    loading: 'Loading the workspace deadline rule…',
    error: 'The workspace deadline rule could not be loaded. Reload before reviewing this Job.',
    reload: 'Reload deadline rule',
    stories: {
        notice: 'Interactive design preview. No Job is created and no deadline defaults are activated.',
        timezone: 'America/New_York',
        created: '2026-10-23',
        projected: '2026-11-12',
        customDate: '2026-11-20',
        longTimezone: 'America/Argentina/Buenos_Aires',
        revision: 'deadline-v1'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobDeadlineChoice",
    ()=>JobDeadlineChoice,
    "jobDeadlineChoiceValid",
    ()=>jobDeadlineChoiceValid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-ui.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function jobDeadlineChoiceValid({ value, context, canOverride, state = 'ready' }) {
    if (state !== 'ready' || !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(context.createdDate).success || (context.rule.mode === 'unset' ? context.projectedDate !== null : !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(context.projectedDate).success)) return false;
    if (value.mode === 'workspace') return value.revision === context.revision;
    return canOverride && (value.mode === 'unset' || __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(value.date).success);
}
function JobDeadlineChoice({ value, context, canOverride, state = 'ready', pending = false, readOnly = false, onChange, onReload }) {
    _s();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])(), disabled = pending || readOnly;
    const contextValid = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(context.createdDate).success && (context.rule.mode === 'unset' ? context.projectedDate === null : __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(context.projectedDate).success);
    const stale = value.mode === 'workspace' && value.revision !== context.revision;
    const invalidDate = value.mode === 'date' && !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(value.date).success;
    const denied = value.mode !== 'workspace' && !canOverride;
    const valid = jobDeadlineChoiceValid({
        value,
        context,
        canOverride,
        state
    });
    const result = value.mode === 'workspace' ? context.projectedDate : value.mode === 'date' ? value.date : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": `${id}-title`,
        className: "grid min-w-0 gap-4 rounded-xl border border-line bg-paper p-4 sm:p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: `${id}-title`,
                        className: "m-0 text-base font-semibold",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 29,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-0 mt-2 text-sm leading-6 text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].description
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 29,
                        columnNumber: 93
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                lineNumber: 29,
                columnNumber: 5
            }, this),
            state !== 'ready' || !contextValid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: state === 'loading' ? 'status' : 'alert',
                        className: "m-0 text-sm leading-6 text-muted",
                        children: state === 'loading' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].loading : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 30,
                        columnNumber: 45
                    }, this),
                    state !== 'loading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobButton"]} justify-self-start`,
                        disabled: disabled,
                        onClick: onReload,
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].reload
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 30,
                        columnNumber: 218
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    readOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "status",
                        className: "m-0 text-sm leading-6 text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].readOnly
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 31,
                        columnNumber: 20
                    }, this),
                    !canOverride && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-sm leading-6 text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].limited
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 32,
                        columnNumber: 24
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        disabled: disabled,
                        className: "m-0 grid min-w-0 gap-3 border-0 p-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                className: "sr-only",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].title
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                lineNumber: 33,
                                columnNumber: 85
                            }, this),
                            [
                                'workspace',
                                'date',
                                'unset'
                            ].map((mode)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: `flex min-h-11 min-w-0 items-start gap-3 rounded-xl border p-4 ${value.mode === mode ? 'border-primary bg-primary/5' : 'border-line'} ${mode !== 'workspace' && !canOverride ? 'text-muted' : 'cursor-pointer'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "radio",
                                            name: `${id}-mode`,
                                            value: mode,
                                            checked: value.mode === mode,
                                            disabled: mode !== 'workspace' && !canOverride,
                                            "aria-labelledby": `${id}-${mode}`,
                                            "aria-describedby": `${id}-${mode}-help`,
                                            className: "mt-1 size-4 shrink-0 accent-primary focus-visible:focus-ring",
                                            onChange: ()=>onChange(mode === 'workspace' ? {
                                                    mode,
                                                    revision: context.revision
                                                } : mode === 'date' ? {
                                                    mode,
                                                    date: ''
                                                } : {
                                                    mode
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                            lineNumber: 35,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "grid min-w-0 gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    id: `${id}-${mode}`,
                                                    className: "text-sm font-semibold",
                                                    children: mode === 'workspace' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].workspace : mode === 'date' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].custom : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].unset
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                                    lineNumber: 36,
                                                    columnNumber: 48
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    id: `${id}-${mode}-help`,
                                                    className: "text-sm leading-6 text-muted",
                                                    children: mode === 'workspace' ? context.rule.mode === 'unset' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].workspaceUnset : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].relative(context.rule.days, context.rule.count) : mode === 'date' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].customHelp : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].unsetHelp
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                                    lineNumber: 36,
                                                    columnNumber: 200
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                            lineNumber: 36,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, mode, true, {
                                    fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                    lineNumber: 34,
                                    columnNumber: 64
                                }, this)),
                            value.mode === 'date' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].date,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        required: true,
                                        disabled: !canOverride,
                                        "aria-invalid": invalidDate,
                                        "aria-describedby": invalidDate ? `${id}-date-error` : undefined,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                        value: value.date,
                                        onChange: (event)=>onChange({
                                                mode: 'date',
                                                date: event.target.value
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                        lineNumber: 38,
                                        columnNumber: 74
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                lineNumber: 38,
                                columnNumber: 35
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 33,
                        columnNumber: 7
                    }, this),
                    invalidDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        id: `${id}-date-error`,
                        role: "alert",
                        className: "m-0 text-sm text-error",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].needsDate
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 40,
                        columnNumber: 23
                    }, this),
                    stale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                                kind: "error",
                                message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].stale
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                lineNumber: 41,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobButton"]} justify-self-start`,
                                disabled: disabled,
                                onClick: ()=>onChange({
                                        mode: 'workspace',
                                        revision: context.revision
                                    }),
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].useCurrent
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                lineNumber: 41,
                                columnNumber: 68
                            }, this)
                        ]
                    }, void 0, true),
                    denied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                        kind: "error",
                        message: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].denied
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 42,
                        columnNumber: 18
                    }, this),
                    valid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        "aria-label": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].result,
                        className: "m-0 grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "font-semibold text-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].result
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                        lineNumber: 43,
                                        columnNumber: 138
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 mt-1 font-semibold",
                                        children: result ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                            dateTime: result,
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDate"])(result)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                            lineNumber: 43,
                                            columnNumber: 246
                                        }, this) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].noDeadline
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                        lineNumber: 43,
                                        columnNumber: 197
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                lineNumber: 43,
                                columnNumber: 133
                            }, this),
                            value.mode === 'workspace' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "font-semibold text-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].created
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                        lineNumber: 44,
                                        columnNumber: 45
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 mt-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                            dateTime: context.createdDate,
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDate"])(context.createdDate)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                            lineNumber: 44,
                                            columnNumber: 130
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                        lineNumber: 44,
                                        columnNumber: 105
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                lineNumber: 44,
                                columnNumber: 40
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "font-semibold text-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].timezone
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                        lineNumber: 45,
                                        columnNumber: 34
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "m-0 mt-1 wrap-anywhere",
                                        children: context.timezone
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                        lineNumber: 45,
                                        columnNumber: 95
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                                lineNumber: 45,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 43,
                        columnNumber: 17
                    }, this),
                    value.mode === 'workspace' && context.rule.mode === 'relative' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-xs leading-5 text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].counting
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 46,
                        columnNumber: 74
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "m-0 text-xs leading-5 text-muted",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceData"].preview
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
                        lineNumber: 47,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, this);
}
_s(JobDeadlineChoice, "m+8mipZO+xSN990774VBYQBjZtc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = JobDeadlineChoice;
var _c;
__turbopack_context__.k.register(_c, "JobDeadlineChoice");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobCreateDialog",
    ()=>JobCreateDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/job.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ui/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/forms/form-feedback/form-feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-dialog/job-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-ui.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-status-badge/job-status-badge.data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/customers/duplicate-match-banner/duplicate-match-banner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/jobs/job-deadline-choice/job-deadline-choice.tsx [app-client] (ecmascript)");
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
;
;
function JobCreateDialog({ open, members, customers, initialCustomer = '', allowNewCustomer = true, canSchedule = true, initialReview = false, initialValues, matches = [], pending, error, onClose, onConfirm, reviewContext, lockCustomer = false, confirmDisabled = false, conflict = false, onReload, closeOnConfirm = true, validateValues, deadlineContext }) {
    _s();
    const [customer, setCustomer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.newCustomer ? 'new' : initialValues?.customerId ?? initialCustomer), [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.newCustomer?.name ?? ''), [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.newCustomer?.email ?? ''), [phone, setPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.newCustomer?.phone ?? ''), [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.title ?? ''), [owner, setOwner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.primaryOwnerId === null ? 'unassigned' : initialValues?.primaryOwnerId ?? ''), [team, setTeam] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.teamUserIds ?? []), [service, setService] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.service ?? ''), [location, setLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.location ?? ''), [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.description ?? ''), [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.scheduledDate ?? ''), [window, setWindow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.arrivalWindow ?? ''), [deadline, setDeadline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.completionDeadline ?? ''), [review, setReview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialReview), [duplicateAccepted, setDuplicateAccepted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deadlineIntent, setDeadlineIntent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues?.deadlineIntent ?? (initialValues?.completionDeadline ? {
        mode: 'date',
        date: initialValues.completionDeadline
    } : {
        mode: 'workspace',
        revision: deadlineContext?.context.revision ?? ''
    }));
    const deadlineStamp = JSON.stringify([
        deadlineContext?.context,
        deadlineContext?.state,
        deadlineContext?.canOverride,
        deadlineIntent,
        canSchedule,
        customer,
        name,
        email,
        phone,
        title,
        owner,
        team,
        service,
        location,
        description,
        date,
        window,
        deadline
    ]);
    const [reviewedDeadlineStamp, setReviewedDeadlineStamp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(deadlineStamp);
    const deadlineValid = !deadlineContext || (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDeadlineChoiceValid"])({
        value: deadlineIntent,
        context: deadlineContext.context,
        canOverride: deadlineContext.canOverride,
        state: deadlineContext.state
    });
    const reviewing = review && (!deadlineContext || deadlineValid && reviewedDeadlineStamp === deadlineStamp);
    const resolvedDeadline = deadlineContext ? deadlineIntent.mode === 'workspace' ? deadlineContext.context.projectedDate : deadlineIntent.mode === 'date' ? deadlineIntent.date || null : null : deadline || null;
    const phoneValid = !phone || /^[+()\d\s.-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 7 && phone.replace(/\D/g, '').length <= 15;
    const customerName = customer === 'new' ? name : customers.find((c)=>c.id === customer)?.name ?? '', valid = !!customerName.trim() && !!title.trim() && !!owner && (!date || __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(date).success) && (deadlineContext || !deadline || __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobDateSchema"].safeParse(deadline).success) && (!window || !!date) && (!email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && phoneValid;
    const values = {
        customerId: customer === 'new' ? '' : customer,
        customerName,
        allowDuplicate: customer === 'new' && duplicateAccepted,
        title: title.trim(),
        primaryOwnerId: owner === 'unassigned' ? null : owner,
        teamUserIds: team,
        service,
        location,
        description,
        scheduledDate: date || null,
        arrivalWindow: window || null,
        completionDeadline: resolvedDeadline,
        ...deadlineContext ? {
            deadlineIntent,
            deadlinePreview: {
                revision: deadlineContext.context.revision,
                createdDate: deadlineContext.context.createdDate,
                resolvedDate: resolvedDeadline,
                timezone: deadlineContext.context.timezone
            }
        } : {},
        ...customer === 'new' ? {
            newCustomer: {
                name,
                email,
                phone
            }
        } : {}
    };
    const validationError = validateValues?.(values);
    const submit = ()=>{
        if (!deadlineValid) return;
        if (!reviewing) {
            setReviewedDeadlineStamp(deadlineStamp);
            setReview(true);
            return;
        }
        return onConfirm(values);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$dialog$2f$job$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JobDialog"], {
        open: open,
        title: reviewing ? reviewContext?.title ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].reviewTitle : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].title,
        description: reviewing ? reviewContext?.description ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].reviewDescription : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].description,
        confirmLabel: reviewing ? reviewContext?.confirmLabel ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].confirm : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].review,
        closeOnSubmit: reviewing && closeOnConfirm,
        confirmDisabled: confirmDisabled || !!validationError || !valid || !deadlineValid || customer === 'new' && matches.length > 0 && !duplicateAccepted,
        pending: pending,
        error: error,
        conflict: conflict,
        onReload: onReload,
        onClose: onClose,
        onSubmit: submit,
        children: [
            reviewContext?.content,
            validationError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$forms$2f$form$2d$feedback$2f$form$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormFeedback"], {
                kind: "error",
                message: validationError
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                lineNumber: 25,
                columnNumber: 22
            }, this),
            customer === 'new' && matches.length > 0 && !duplicateAccepted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$customers$2f$duplicate$2d$match$2d$banner$2f$duplicate$2d$match$2d$banner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DuplicateMatchBanner"], {
                matches: matches,
                onUseExisting: (id)=>{
                    setCustomer(id);
                    setReview(false);
                },
                onCreateAnyway: ()=>setDuplicateAccepted(true)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                lineNumber: 26,
                columnNumber: 61
            }, this),
            reviewing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "m-0 grid gap-4 text-sm",
                        children: [
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].customer,
                                value: customerName
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].job,
                                value: title
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].owner,
                                value: members.find((m)=>m.id === owner)?.name ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].unassigned
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].team,
                                value: members.filter((m)=>team.includes(m.id)).map((m)=>m.name).join(', ') || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].service,
                                value: service || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].location,
                                value: location || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].descriptionLabel,
                                value: description || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].scheduled,
                                value: date ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDate"])(date) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].window,
                                value: window || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                            },
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].deadline,
                                value: resolvedDeadline ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobDate"])(resolvedDeadline) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                            },
                            ...deadlineContext ? [
                                {
                                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].deadlineChoice,
                                    value: deadlineIntent.mode === 'workspace' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].defaultChoice : deadlineIntent.mode === 'date' ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].customChoice : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].unsetChoice
                                },
                                {
                                    label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].deadlineTimezone,
                                    value: deadlineContext.context.timezone
                                }
                            ] : [],
                            {
                                label: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].status,
                                value: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$status$2d$badge$2f$job$2d$status$2d$badge$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobStatusBadgeData"][date ? 'scheduled' : 'needs-scheduling'].label
                            }
                        ].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "font-semibold text-muted",
                                        children: r.label
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 27,
                                        columnNumber: 1003
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "ml-0 mt-1 whitespace-pre-wrap wrap-anywhere",
                                        children: r.value
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 27,
                                        columnNumber: 1058
                                    }, this)
                                ]
                            }, r.label, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 27,
                                columnNumber: 984
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 27,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobButton"],
                        type: "button",
                        onClick: ()=>setReview(false),
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].edit
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 27,
                        columnNumber: 1145
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].customer,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                required: true,
                                disabled: lockCustomer,
                                value: customer,
                                onChange: (e)=>{
                                    if (!lockCustomer) setCustomer(e.target.value);
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].choose
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 28,
                                        columnNumber: 191
                                    }, this),
                                    customers.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c.id,
                                            children: c.name
                                        }, c.id, false, {
                                            fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                            lineNumber: 28,
                                            columnNumber: 248
                                        }, this)),
                                    allowNewCustomer && !lockCustomer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "new",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].newCustomer
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 28,
                                        columnNumber: 333
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 28,
                                columnNumber: 50
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 28,
                        columnNumber: 7
                    }, this),
                    customer === 'new' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-4 rounded-xl border border-line bg-canvas p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].name,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        required: true,
                                        maxLength: 200,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                        value: name,
                                        onChange: (e)=>{
                                            setName(e.target.value);
                                            setDuplicateAccepted(false);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 29,
                                        columnNumber: 134
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 29,
                                columnNumber: 95
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].email,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "email",
                                        maxLength: 254,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                        value: email,
                                        onChange: (e)=>{
                                            setEmail(e.target.value);
                                            setDuplicateAccepted(false);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 29,
                                        columnNumber: 318
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 29,
                                columnNumber: 278
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].phone,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "tel",
                                        "aria-invalid": !phoneValid,
                                        maxLength: 40,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                        value: phone,
                                        onChange: (e)=>{
                                            setPhone(e.target.value);
                                            setDuplicateAccepted(false);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 29,
                                        columnNumber: 508
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 29,
                                columnNumber: 468
                            }, this),
                            !phoneValid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "alert",
                                className: "m-0 text-sm text-error",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].invalidPhone
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 29,
                                columnNumber: 696
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "m-0 text-xs leading-5 text-muted",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].newHelp
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 29,
                                columnNumber: 771
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 29,
                        columnNumber: 23
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].job,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                required: true,
                                maxLength: 200,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                value: title,
                                onChange: (e)=>setTitle(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 30,
                                columnNumber: 42
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 30,
                        columnNumber: 4
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].owner,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                required: true,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                value: owner,
                                onChange: (e)=>{
                                    setOwner(e.target.value);
                                    setTeam(team.filter((id)=>id !== e.target.value));
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].chooseOwner
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 30,
                                        columnNumber: 337
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "unassigned",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].unassigned
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 30,
                                        columnNumber: 381
                                    }, this),
                                    members.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: m.id,
                                            children: m.name
                                        }, m.id, false, {
                                            fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                            lineNumber: 30,
                                            columnNumber: 450
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 30,
                                columnNumber: 197
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 30,
                        columnNumber: 157
                    }, this),
                    deadlineContext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$deadline$2d$choice$2f$job$2d$deadline$2d$choice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JobDeadlineChoice"], {
                        value: deadlineIntent,
                        context: deadlineContext.context,
                        canOverride: deadlineContext.canOverride,
                        state: deadlineContext.state,
                        pending: pending,
                        onReload: deadlineContext.onReload,
                        onChange: (value)=>{
                            setDeadlineIntent(value);
                            setReview(false);
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 31,
                        columnNumber: 22
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                        className: "rounded-xl border border-line p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                className: "min-h-11 cursor-pointer py-3 text-sm font-semibold focus-visible:focus-ring",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].optional
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 32,
                                columnNumber: 59
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 grid gap-4",
                                children: [
                                    [
                                        [
                                            'service',
                                            service,
                                            setService
                                        ],
                                        [
                                            'location',
                                            location,
                                            setLocation
                                        ]
                                    ].map(([key, value, set])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                            children: [
                                                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"][key],
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                                    maxLength: key === 'service' ? 200 : 500,
                                                    value: String(value),
                                                    onChange: (e)=>set(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                    lineNumber: 33,
                                                    columnNumber: 210
                                                }, this)
                                            ]
                                        }, String(key), true, {
                                            fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                            lineNumber: 33,
                                            columnNumber: 129
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].descriptionLabel,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                rows: 3,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                                maxLength: 4000,
                                                value: description,
                                                onChange: (e)=>setDescription(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                lineNumber: 33,
                                                columnNumber: 414
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 33,
                                        columnNumber: 363
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                                        className: "m-0 grid gap-2 rounded-xl border border-line p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                                className: "px-2 text-sm font-semibold",
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].team
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                lineNumber: 33,
                                                columnNumber: 616
                                            }, this),
                                            members.filter((m)=>m.id !== owner).map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex min-h-11 items-center gap-3 text-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: team.includes(m.id),
                                                            onChange: (e)=>setTeam(e.target.checked ? [
                                                                    ...team,
                                                                    m.id
                                                                ] : team.filter((id)=>id !== m.id)),
                                                            className: "size-5 accent-primary"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                            lineNumber: 33,
                                                            columnNumber: 794
                                                        }, this),
                                                        m.name
                                                    ]
                                                }, m.id, true, {
                                                    fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                    lineNumber: 33,
                                                    columnNumber: 723
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 33,
                                        columnNumber: 545
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].scheduled,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                disabled: !canSchedule,
                                                type: "date",
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                                value: date,
                                                onChange: (e)=>{
                                                    setDate(e.target.value);
                                                    if (!e.target.value) setWindow('');
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                lineNumber: 33,
                                                columnNumber: 1037
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 33,
                                        columnNumber: 993
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].window,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                                disabled: !date || !canSchedule,
                                                value: window,
                                                onChange: (e)=>setWindow(e.target.value),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].none
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                        lineNumber: 33,
                                                        columnNumber: 1353
                                                    }, this),
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$job$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["arrivalWindows"].map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: w
                                                        }, w, false, {
                                                            fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                            lineNumber: 33,
                                                            columnNumber: 1413
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                lineNumber: 33,
                                                columnNumber: 1238
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 33,
                                        columnNumber: 1197
                                    }, this),
                                    !deadlineContext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobLabel"],
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].deadline,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                disabled: !canSchedule,
                                                type: "date",
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$ui$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jobInput"],
                                                value: deadline,
                                                onChange: (e)=>setDeadline(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                                lineNumber: 33,
                                                columnNumber: 1522
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 33,
                                        columnNumber: 1479
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "m-0 text-xs text-muted",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$jobs$2f$job$2d$create$2d$dialog$2f$job$2d$create$2d$dialog$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copy"].helper
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                        lineNumber: 33,
                                        columnNumber: 1655
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                                lineNumber: 33,
                                columnNumber: 4
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
                        lineNumber: 32,
                        columnNumber: 4
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/jobs/job-create-dialog/job-create-dialog.tsx",
        lineNumber: 19,
        columnNumber: 9
    }, this);
}
_s(JobCreateDialog, "F3z4TvEkoc/tLMn7w8QtD0VH+hI=");
_c = JobCreateDialog;
var _c;
__turbopack_context__.k.register(_c, "JobCreateDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/jobs/job-status-dialog/job-status-dialog.data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "copy",
    ()=>copy
]);
const copy = {
    title: 'Review status change',
    description: 'Changes are recorded in job history. Completed and canceled jobs retain their history.',
    to: 'New status',
    reason: 'Waiting reason',
    cancelReason: 'Cancellation reason',
    note: 'Note · optional',
    select: 'Choose a reason',
    confirm: 'Confirm change',
    closed: 'Reopening preserves the previous close event. Review the completion deadline before reopening.',
    deadline: 'Completion deadline after reopening',
    reviewDeadline: 'I reviewed the deadline and want to reopen this job.',
    schedule: 'This job needs a scheduled work date before it can become Scheduled.',
    closedSchedule: 'Reopen this job as In Progress first, then set a scheduled work date.',
    closedClear: 'This job still has a work date. Reopen it as Scheduled or In Progress, then clear its schedule.',
    needsDate: 'Clear the scheduled date before returning to Needs Scheduling.',
    setDate: 'Set a work date',
    readOnly: 'Your current permissions do not allow this status change.',
    waitingReasons: {
        customer: 'Waiting on customer',
        materials: 'Waiting on materials',
        approval: 'Waiting on approval',
        other: 'Other'
    },
    cancelReasons: {
        'customer-canceled': 'Customer canceled',
        'unable-to-proceed': 'Unable to proceed',
        duplicate: 'Duplicate / created in error',
        other: 'Other'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_features_jobs_0siboyc._.js.map