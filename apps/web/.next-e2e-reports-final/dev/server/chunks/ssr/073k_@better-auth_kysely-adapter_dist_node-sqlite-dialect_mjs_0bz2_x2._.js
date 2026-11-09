module.exports = [
"[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/node-sqlite-dialect.mjs [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NodeSqliteDialect",
    ()=>NodeSqliteDialect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$kysely$2d$adapter$40$1$2e$7$2e$7_$40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$bet_e634cb8c9ba639d5a1eb368bdd259776$2f$node_modules$2f40$better$2d$auth$2f$kysely$2d$adapter$2f$dist$2f$sqlite$2d$introspector$2d$DSCAP82F$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/sqlite-introspector-DSCAP82F.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$query$2d$compiler$2f$compiled$2d$query$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/query-compiler/compiled-query.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$query$2d$compiler$2f$default$2d$query$2d$compiler$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/query-compiler/default-query-compiler.js [app-rsc] (ecmascript)");
;
;
//#region src/node-sqlite-dialect.ts
var NodeSqliteAdapter = class {
    get supportsCreateIfNotExists() {
        return true;
    }
    get supportsTransactionalDdl() {
        return false;
    }
    get supportsReturning() {
        return true;
    }
    async acquireMigrationLock() {}
    async releaseMigrationLock() {}
    get supportsOutput() {
        return true;
    }
};
var NodeSqliteDriver = class {
    #config;
    #connectionMutex = new ConnectionMutex();
    #db;
    #connection;
    constructor(config){
        this.#config = {
            ...config
        };
    }
    async init() {
        this.#db = this.#config.database;
        this.#connection = new NodeSqliteConnection(this.#db);
        if (this.#config.onCreateConnection) await this.#config.onCreateConnection(this.#connection);
    }
    async acquireConnection() {
        await this.#connectionMutex.lock();
        return this.#connection;
    }
    async beginTransaction(connection) {
        await connection.executeQuery(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$query$2d$compiler$2f$compiled$2d$query$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CompiledQuery"].raw("begin"));
    }
    async commitTransaction(connection) {
        await connection.executeQuery(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$query$2d$compiler$2f$compiled$2d$query$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CompiledQuery"].raw("commit"));
    }
    async rollbackTransaction(connection) {
        await connection.executeQuery(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$query$2d$compiler$2f$compiled$2d$query$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CompiledQuery"].raw("rollback"));
    }
    async releaseConnection() {
        this.#connectionMutex.unlock();
    }
    async destroy() {
        this.#db?.close();
    }
};
var NodeSqliteConnection = class {
    #db;
    constructor(db){
        this.#db = db;
    }
    executeQuery(compiledQuery) {
        const { sql, parameters } = compiledQuery;
        const stmt = this.#db.prepare(sql);
        const params = parameters;
        if (stmt.columns().length > 0) return Promise.resolve({
            rows: stmt.all(...params)
        });
        const { changes, lastInsertRowid } = stmt.run(...params);
        return Promise.resolve({
            rows: [],
            numAffectedRows: BigInt(changes),
            insertId: typeof lastInsertRowid === "bigint" ? lastInsertRowid : BigInt(lastInsertRowid)
        });
    }
    async *streamQuery() {
        throw new Error("Streaming query is not supported by SQLite driver.");
    }
};
var ConnectionMutex = class {
    #promise;
    #resolve;
    async lock() {
        while(this.#promise !== void 0)await this.#promise;
        this.#promise = new Promise((resolve)=>{
            this.#resolve = resolve;
        });
    }
    unlock() {
        const resolve = this.#resolve;
        this.#promise = void 0;
        this.#resolve = void 0;
        resolve?.();
    }
};
var NodeSqliteQueryCompiler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$query$2d$compiler$2f$default$2d$query$2d$compiler$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DefaultQueryCompiler"] {
    getCurrentParameterPlaceholder() {
        return "?";
    }
    getLeftIdentifierWrapper() {
        return "\"";
    }
    getRightIdentifierWrapper() {
        return "\"";
    }
    getAutoIncrement() {
        return "autoincrement";
    }
};
var NodeSqliteDialect = class {
    #config;
    constructor(config){
        this.#config = {
            ...config
        };
    }
    createDriver() {
        return new NodeSqliteDriver(this.#config);
    }
    createQueryCompiler() {
        return new NodeSqliteQueryCompiler();
    }
    createAdapter() {
        return new NodeSqliteAdapter();
    }
    createIntrospector(db) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$kysely$2d$adapter$40$1$2e$7$2e$7_$40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$bet_e634cb8c9ba639d5a1eb368bdd259776$2f$node_modules$2f40$better$2d$auth$2f$kysely$2d$adapter$2f$dist$2f$sqlite$2d$introspector$2d$DSCAP82F$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["t"])(db);
    }
};
;
}),
];

//# sourceMappingURL=073k_%40better-auth_kysely-adapter_dist_node-sqlite-dialect_mjs_0bz2_x2._.js.map