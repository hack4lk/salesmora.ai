module.exports = [
"[project]/packages/data/src/lead-capture/delivery-policy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "capturePublicationWorkspaces",
    ()=>capturePublicationWorkspaces,
    "captureReadinessKey",
    ()=>captureReadinessKey,
    "captureWebsiteSchemaReady",
    ()=>captureWebsiteSchemaReady
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/lead-capture/common.ts [middleware] (ecmascript)");
;
async function captureWebsiteSchemaReady(trx) {
    return await trx.schema.hasTable('captureReceiptProcessing') && await trx.schema.hasTable('capturePublications');
}
function capturePublicationWorkspaces(value) {
    if (!value) return [];
    if (value.length > 3700) return null;
    const ids = value.split(',').map((id)=>id.trim());
    if (ids.length > 100 || ids.some((id)=>!__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$lead$2d$capture$2f$common$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["captureIdSchema"].safeParse(id).success)) return null;
    return Object.freeze([
        ...new Set(ids)
    ]);
}
function captureReadinessKey(value) {
    if (!value || value.length !== 44) return null;
    const key = Buffer.from(value, 'base64');
    return key.length === 32 && key.toString('base64') === value ? key : null;
}
}),
];

//# sourceMappingURL=packages_data_src_lead-capture_delivery-policy_ts_06ar1jg._.js.map