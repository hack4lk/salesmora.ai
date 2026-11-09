module.exports = [
"[project]/apps/web/src/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Runs once per server start. Flags owner-level database credentials (admin console step 0a).
__turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if (("TURBOPACK compile-time value", "nodejs") !== "nodejs" || !process.env.DATABASE_URL) return;
    const { assertRuntimeDatabaseRole, createDatabase } = await __turbopack_context__.A("[project]/packages/data/src/index.ts [instrumentation] (ecmascript, async loader)");
    const db = createDatabase(process.env.DATABASE_URL);
    try {
        await assertRuntimeDatabaseRole(db, "Web");
    } finally{
        await db.destroy();
    }
}
}),
];

//# sourceMappingURL=apps_web_src_instrumentation_ts_00oedpd._.js.map