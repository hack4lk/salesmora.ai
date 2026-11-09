module.exports = [
"[externals]/knex [external] (knex, cjs, [project]/node_modules/.pnpm/knex@3.3.0_pg@8.23.1/node_modules/knex)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("knex-8e9064e21da26482", () => require("knex-8e9064e21da26482"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import, [project]/node_modules/.pnpm/pg@8.23.1/node_modules/pg)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg-ad45e98bb7b7a165");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/id.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "uuid5",
    ()=>uuid5,
    "uuid6",
    ()=>uuid6
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [instrumentation] (ecmascript)");
;
//#region src/id.ts
let lastMsecs = 0;
let lastNsecs = 0;
function uuid6(clockseq) {
    let msecs = Date.now();
    if (msecs <= lastMsecs) {
        lastNsecs += 1;
        if (lastNsecs >= 1e4) {
            lastNsecs = 0;
            msecs = lastMsecs + 1;
        }
    } else lastNsecs = 0;
    lastMsecs = msecs;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["v6"])({
        clockseq,
        msecs,
        nsecs: lastNsecs
    });
}
function uuid5(name, namespace) {
    const namespaceBytes = namespace.replace(/-/g, "").match(/.{2}/g).map((byte)=>parseInt(byte, 16));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["v5"])(name, new Uint8Array(namespaceBytes));
}
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeltaSnapshot",
    ()=>DeltaSnapshot,
    "ERROR",
    ()=>ERROR,
    "INTERRUPT",
    ()=>INTERRUPT,
    "RESUME",
    ()=>RESUME,
    "SCHEDULED",
    ()=>SCHEDULED,
    "TASKS",
    ()=>TASKS,
    "isDeltaSnapshot",
    ()=>isDeltaSnapshot
]);
//#region src/serde/types.ts
const TASKS = "__pregel_tasks";
const ERROR = "__error__";
const SCHEDULED = "__scheduled__";
const INTERRUPT = "__interrupt__";
const RESUME = "__resume__";
/**
* Snapshot blob for a `DeltaChannel` with finite snapshot frequency.
*
* Stored directly in a checkpoint's `channel_values` in place of the full
* accumulated value. The ancestor walk in
* {@link BaseCheckpointSaver.getDeltaChannelHistory} terminates when it
* encounters a populated `channel_values` entry for a channel; a
* `DeltaSnapshot` value is the materialized state at that ancestor, so the
* channel reconstructs directly from `.value` without replaying earlier
* writes.
*
* @remarks Beta. The on-disk representation may change in future releases.
*/ var DeltaSnapshot = class {
    /** Marker used for structural detection across module/realm boundaries. */ lg_name = "DeltaSnapshot";
    value;
    constructor(value){
        this.value = value;
    }
};
/**
* Structural type guard for {@link DeltaSnapshot}. Uses the `lg_name` marker
* so it survives serialization round-trips and cross-package duplication.
*/ function isDeltaSnapshot(value) {
    return value != null && typeof value === "object" && value.lg_name === "DeltaSnapshot";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/utils/fast-safe-stringify/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stringify",
    ()=>stringify
]);
//#region src/serde/utils/fast-safe-stringify/index.ts
var LIMIT_REPLACE_NODE = "[...]";
var CIRCULAR_REPLACE_NODE = "[Circular]";
var arr = [];
var replacerStack = [];
function defaultOptions() {
    return {
        depthLimit: Number.MAX_SAFE_INTEGER,
        edgesLimit: Number.MAX_SAFE_INTEGER
    };
}
function stringify(obj, replacer, spacer, options) {
    if (typeof options === "undefined") options = defaultOptions();
    decirc(obj, "", 0, [], void 0, 0, options);
    var res;
    try {
        if (replacerStack.length === 0) res = JSON.stringify(obj, replacer, spacer);
        else res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
    } catch (_) {
        return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
    } finally{
        while(arr.length !== 0){
            var part = arr.pop();
            if (part.length === 4) Object.defineProperty(part[0], part[1], part[3]);
            else part[0][part[1]] = part[2];
        }
    }
    return res;
}
function setReplace(replace, val, k, parent) {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
    if (propertyDescriptor.get !== void 0) if (propertyDescriptor.configurable) {
        Object.defineProperty(parent, k, {
            value: replace
        });
        arr.push([
            parent,
            k,
            val,
            propertyDescriptor
        ]);
    } else replacerStack.push([
        val,
        k,
        replace
    ]);
    else {
        parent[k] = replace;
        arr.push([
            parent,
            k,
            val
        ]);
    }
}
function decirc(val, k, edgeIndex, stack, parent, depth, options) {
    depth += 1;
    var i;
    if (typeof val === "object" && val !== null) {
        for(i = 0; i < stack.length; i++)if (stack[i] === val) {
            setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
            return;
        }
        if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
        }
        if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
        }
        stack.push(val);
        if (Array.isArray(val)) for(i = 0; i < val.length; i++)decirc(val[i], i, i, stack, val, depth, options);
        else {
            var keys = Object.keys(val);
            for(i = 0; i < keys.length; i++){
                var key = keys[i];
                decirc(val[key], key, i, stack, val, depth, options);
            }
        }
        stack.pop();
    }
}
function replaceGetterValues(replacer) {
    replacer = typeof replacer !== "undefined" ? replacer : function(k, v) {
        return v;
    };
    return function(key, val) {
        if (replacerStack.length > 0) for(var i = 0; i < replacerStack.length; i++){
            var part = replacerStack[i];
            if (part[1] === key && part[0] === val) {
                val = part[2];
                replacerStack.splice(i, 1);
                break;
            }
        }
        return replacer.call(this, key, val);
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/jsonplus.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonPlusSerializer",
    ()=>JsonPlusSerializer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$utils$2f$fast$2d$safe$2d$stringify$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/utils/fast-safe-stringify/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/index.js [instrumentation] (ecmascript)");
;
;
;
//#region src/serde/jsonplus.ts
function isLangChainSerializedObject(value) {
    return value !== null && value.lc === 1 && value.type === "constructor" && Array.isArray(value.id);
}
function isUndefinedRecord(value) {
    return value.lc === 2 && value.type === "undefined";
}
function isDeltaSnapshotRecord(value) {
    return value.lc === 2 && value.type === "delta_snapshot" && Object.prototype.hasOwnProperty.call(value, "value");
}
function isConstructorRecord(value) {
    return value.lc === 2 && value.type === "constructor";
}
function hasConstructorId(record, name) {
    return Array.isArray(record.id) && record.id.length === 1 && record.id[0] === name;
}
function hasNoMethod(record) {
    return record.method === void 0 || record.method === null;
}
function hasSingleArrayArg(record) {
    return Array.isArray(record.args) && record.args.length === 1 && Array.isArray(record.args[0]);
}
function isByteArray(value) {
    return value.every((item)=>typeof item === "number" && Number.isInteger(item) && item >= 0 && item <= 255);
}
/**
* Reconstruct only the closed set of lc:2 values written by `_default`.
*
* A constructor record is serialized data, not an instruction to resolve a
* property or invoke a method. Invalid and unsupported records are kept inert
* by the caller so old or attacker-controlled checkpoint data cannot execute.
*/ function reviveConstructorRecord(record) {
    if (hasConstructorId(record, "Set") && hasNoMethod(record)) {
        if (!hasSingleArrayArg(record)) return void 0;
        return new Set(record.args[0]);
    }
    if (hasConstructorId(record, "Map") && hasNoMethod(record)) {
        if (!hasSingleArrayArg(record) || !record.args[0].every((entry)=>Array.isArray(entry) && entry.length === 2)) return;
        return new Map(record.args[0]);
    }
    if (hasConstructorId(record, "RegExp") && hasNoMethod(record)) {
        if (!Array.isArray(record.args) || record.args.length !== 2 || typeof record.args[0] !== "string" || typeof record.args[1] !== "string") return;
        try {
            return new RegExp(record.args[0], record.args[1]);
        } catch  {
            return;
        }
    }
    if (hasConstructorId(record, "Error") && hasNoMethod(record)) {
        if (!Array.isArray(record.args) || record.args.length !== 1 || typeof record.args[0] !== "string") return;
        return new Error(record.args[0]);
    }
    if (hasConstructorId(record, "Uint8Array") && (hasNoMethod(record) || record.method === "from")) {
        if (!hasSingleArrayArg(record) || !isByteArray(record.args[0])) return;
        return new Uint8Array(record.args[0]);
    }
}
/**
* The replacer in stringify does not allow delegation to built-in LangChain
* serialization methods, and instead immediately calls `.toJSON()` and
* continues to stringify subfields.
*
* We therefore must start from the most nested elements in the input and
* deserialize upwards rather than top-down.
*/ async function _reviver(value) {
    if (value && typeof value === "object") if (Array.isArray(value)) return await Promise.all(value.map((item)=>_reviver(item)));
    else {
        const revivedObj = {};
        for (const [k, v] of Object.entries(value))revivedObj[k] = await _reviver(v);
        if (isUndefinedRecord(revivedObj)) return;
        else if (isDeltaSnapshotRecord(revivedObj)) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["DeltaSnapshot"](revivedObj.value);
        else if (isConstructorRecord(revivedObj)) return reviveConstructorRecord(revivedObj) ?? revivedObj;
        else if (isLangChainSerializedObject(revivedObj)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["load"])(JSON.stringify(revivedObj));
        return revivedObj;
    }
    return value;
}
function _encodeConstructorArgs(constructor, method, args, kwargs) {
    return {
        lc: 2,
        type: "constructor",
        id: [
            constructor.name
        ],
        method: method ?? null,
        args: args ?? [],
        kwargs: kwargs ?? {}
    };
}
function _default(obj) {
    if (obj === void 0) return {
        lc: 2,
        type: "undefined"
    };
    else if (obj instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["DeltaSnapshot"]) return {
        lc: 2,
        type: "delta_snapshot",
        value: obj.value
    };
    else if (obj instanceof Set || obj instanceof Map) return _encodeConstructorArgs(obj.constructor, void 0, [
        Array.from(obj)
    ]);
    else if (obj instanceof RegExp) return _encodeConstructorArgs(RegExp, void 0, [
        obj.source,
        obj.flags
    ]);
    else if (obj instanceof Error) return _encodeConstructorArgs(Error, void 0, [
        obj.message
    ]);
    else if (obj?.lg_name === "Send") return {
        node: obj.node,
        args: obj.args,
        ...obj.timeout !== void 0 ? {
            timeout: obj.timeout
        } : {}
    };
    else if (obj instanceof Uint8Array) return _encodeConstructorArgs(Uint8Array, "from", [
        Array.from(obj)
    ]);
    else return obj;
}
var JsonPlusSerializer = class {
    _dumps(obj) {
        return new TextEncoder().encode((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$utils$2f$fast$2d$safe$2d$stringify$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["stringify"])(obj, (_, value)=>{
            return _default(value);
        }));
    }
    async dumpsTyped(obj) {
        if (obj instanceof Uint8Array) return [
            "bytes",
            obj
        ];
        else return [
            "json",
            this._dumps(obj)
        ];
    }
    async _loads(data) {
        return _reviver(JSON.parse(data));
    }
    async loadsTyped(type, data) {
        if (type === "bytes") return typeof data === "string" ? new TextEncoder().encode(data) : data;
        else if (type === "json") return this._loads(typeof data === "string" ? data : new TextDecoder().decode(data));
        else throw new Error(`Unknown serialization type: ${type}`);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCheckpointSaver",
    ()=>BaseCheckpointSaver,
    "EXCLUDED_METADATA_KEYS",
    ()=>EXCLUDED_METADATA_KEYS,
    "WRITES_IDX_MAP",
    ()=>WRITES_IDX_MAP,
    "compareChannelVersions",
    ()=>compareChannelVersions,
    "copyCheckpoint",
    ()=>copyCheckpoint,
    "deepCopy",
    ()=>deepCopy,
    "emptyCheckpoint",
    ()=>emptyCheckpoint,
    "getCheckpointId",
    ()=>getCheckpointId,
    "maxChannelVersion",
    ()=>maxChannelVersion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$id$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/id.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/jsonplus.js [instrumentation] (ecmascript)");
;
;
;
//#region src/base.ts
function deepCopy(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    const newObj = Array.isArray(obj) ? [] : {};
    for(const key in obj)if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = deepCopy(obj[key]);
    return newObj;
}
/** @hidden */ function emptyCheckpoint() {
    return {
        v: 4,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$id$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["uuid6"])(0),
        ts: /* @__PURE__ */ new Date().toISOString(),
        channel_values: {},
        channel_versions: {},
        versions_seen: {}
    };
}
/** @hidden */ function copyCheckpoint(checkpoint) {
    return {
        v: checkpoint.v,
        id: checkpoint.id,
        ts: checkpoint.ts,
        channel_values: {
            ...checkpoint.channel_values ?? {}
        },
        channel_versions: {
            ...checkpoint.channel_versions ?? {}
        },
        versions_seen: deepCopy(checkpoint.versions_seen ?? {})
    };
}
var BaseCheckpointSaver = class {
    serde = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["JsonPlusSerializer"]();
    constructor(serde){
        this.serde = serde || this.serde;
    }
    /**
	* Prevent `JSON.stringify` from traversing backend clients (e.g. pg Pool
	* timers) when a checkpointer is present in runnable `configurable`.
	*/ toJSON() {
        return `[${this.constructor.name}]`;
    }
    async get(config) {
        const value = await this.getTuple(config);
        return value ? value.checkpoint : void 0;
    }
    /**
	* Walk the parent chain returning per-channel writes + seed, used to
	* reconstruct `DeltaChannel` state from `checkpoint_writes`.
	*
	* For each requested channel, walks ancestors of the checkpoint identified
	* by `config` (following `parentConfig`) and accumulates the pending writes
	* for that channel. The walk terminates per-channel at the nearest ancestor
	* whose `channel_values[ch]` is populated; that value is returned as `seed`.
	* If the walk reaches the root without finding a stored value, `seed` is
	* omitted from that channel's entry — the consumer treats the absence as
	* "start empty".
	*
	* Walks the parent chain (not `list({ before })`): for forked threads, only
	* on-path ancestors contribute.
	*
	* The default implementation walks `getTuple` + `parentConfig` once for all
	* channels — each ancestor visited once, not once per channel. Savers with
	* direct storage access (e.g. `MemorySaver`) override for performance; the
	* return contract is fixed here.
	*
	* @remarks Beta. The signature, return shape, and interaction with
	* `DeltaSnapshot` blobs may change. Override at your own risk; the default
	* implementation will continue to work against the public
	* `BaseCheckpointSaver` contract.
	*
	* @param options.config Configuration identifying the target checkpoint.
	* @param options.channels Channel names to walk for. Empty → empty mapping.
	* @returns Per-channel {@link DeltaChannelHistory} for every requested name.
	*/ async getDeltaChannelHistory(options) {
        const { config, channels } = options;
        if (channels.length === 0) return {};
        const collectedByCh = {};
        const seedByCh = {};
        const remaining = new Set(channels);
        for (const ch of channels)collectedByCh[ch] = [];
        let cursorConfig = (await this.getTuple(config))?.parentConfig;
        while(cursorConfig != null && remaining.size > 0){
            const tup = await this.getTuple(cursorConfig);
            if (tup === void 0) break;
            if (tup.pendingWrites && tup.pendingWrites.length > 0) {
                const perChannel = {};
                for (const write of tup.pendingWrites){
                    const ch = write[1];
                    if (remaining.has(ch)) (perChannel[ch] ??= []).push(write);
                }
                for (const ch of Object.keys(perChannel)){
                    const block = perChannel[ch];
                    block.sort((a, b)=>a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
                    for(let i = block.length - 1; i >= 0; i -= 1)collectedByCh[ch].push(block[i]);
                }
            }
            for (const ch of Array.from(remaining))if (Object.prototype.hasOwnProperty.call(tup.checkpoint.channel_values, ch)) {
                seedByCh[ch] = tup.checkpoint.channel_values[ch];
                remaining.delete(ch);
            }
            cursorConfig = tup.parentConfig;
        }
        const result = {};
        for (const ch of channels){
            const entry = {
                writes: collectedByCh[ch].slice().reverse()
            };
            if (Object.prototype.hasOwnProperty.call(seedByCh, ch)) entry.seed = seedByCh[ch];
            result[ch] = entry;
        }
        return result;
    }
    /**
	* Generate the next version ID for a channel.
	*
	* Default is to use integer versions, incrementing by 1. If you override, you can use str/int/float versions,
	* as long as they are monotonically increasing.
	*/ getNextVersion(current) {
        if (typeof current === "string") throw new Error("Please override this method to use string versions.");
        return current !== void 0 && typeof current === "number" ? current + 1 : 1;
    }
};
function compareChannelVersions(a, b) {
    if (typeof a === "number" && typeof b === "number") return Math.sign(a - b);
    return String(a).localeCompare(String(b));
}
function maxChannelVersion(...versions) {
    return versions.reduce((max, version, idx)=>{
        if (idx === 0) return version;
        return compareChannelVersions(max, version) >= 0 ? max : version;
    });
}
/**
* Mapping from error type to error index.
* Regular writes just map to their index in the list of writes being saved.
* Special writes (e.g. errors) map to negative indices, to avoid those writes from
* conflicting with regular writes.
* Each Checkpointer implementation should use this mapping in put_writes.
*/ const WRITES_IDX_MAP = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ERROR"]]: -1,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SCHEDULED"]]: -2,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["INTERRUPT"]]: -3,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["RESUME"]]: -4
};
/**
* Metadata keys that are LangGraph's internal framework bookkeeping and
* should not be surfaced as user-meaningful metadata.
*
* Consumed by stream handlers (e.g. the `tasks` debug stream) to drop
* framework keys — which are redundant with a task's own fields and
* namespace — while keeping keys like `lc_agent_name`, `ls_integration`,
* and user-supplied metadata.
*/ const EXCLUDED_METADATA_KEYS = new Set([
    "thread_id",
    "checkpoint_id",
    "checkpoint_ns",
    "checkpoint_map",
    "langgraph_step",
    "langgraph_node",
    "langgraph_triggers",
    "langgraph_path",
    "langgraph_checkpoint_ns"
]);
function getCheckpointId(config) {
    return config.configurable?.checkpoint_id || config.configurable?.thread_ts || "";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/memory.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MemorySaver",
    ()=>MemorySaver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [instrumentation] (ecmascript)");
;
;
//#region src/memory.ts
/**
* Keys that, when written into a plain JavaScript object via bracket
* notation, traverse the prototype chain and mutate `Object.prototype`
* (or the constructor) instead of creating a new own property. Any of
* the three reaches `Object.prototype` and pollutes every object in
* the running process. CWE-1321 (Prototype Pollution).
*/ const POLLUTION_KEYS = new Set([
    "__proto__",
    "constructor",
    "prototype"
]);
/**
* Asserts that a value sourced from {@link RunnableConfig.configurable} (or
* any other caller-influenced position) is safe to use as a property key
* on the in-memory checkpoint store.
*
* `MemorySaver` keeps state in two nested plain objects (`storage` and
* `writes`) and writes to them with bracket notation:
*
*     this.storage[threadId][checkpointNamespace][checkpoint.id] = ...
*
* Without this guard a `threadId` of `"__proto__"` (or `"constructor"`)
* resolves through the prototype chain, and the subsequent assignment
* mutates `Object.prototype`. From that point every plain object in the
* process inherits the injected property: `for...in` loops over unrelated
* objects iterate it, framework code that does `if (obj[x])` short-circuits
* unexpectedly, and downstream serializers may emit it. In a Node.js
* server this is a stepping stone to remote code execution.
*
* `MemorySaver` is the default saver used by every quickstart, every
* tutorial, and most test fixtures, so this guard runs in the hot path
* for the most common LangGraph configuration.
*
* @param field Name of the configurable field, used in the error message.
* @param value Value to validate. Must be a non-empty string that is not
*              one of the three prototype-pollution keys.
* @param options.allowEmpty When true the empty string is accepted, used
*                            for the documented empty `checkpoint_ns`
*                            default; otherwise an empty string is
*                            rejected the same way as a non-string.
*/ function assertSafeStorageKey(field, value, options = {}) {
    const { allowEmpty = false } = options;
    if (typeof value !== "string") {
        const observed = value === null ? "null" : value === void 0 ? "undefined" : Array.isArray(value) ? "array" : typeof value;
        throw new Error(`Invalid configurable value for key "${field}": expected a string identifier (got ${observed}). This guard protects MemorySaver from prototype pollution.`);
    }
    if (!allowEmpty && value === "") throw new Error(`Invalid configurable value for key "${field}": empty string is not permitted as an in-memory storage key.`);
    if (POLLUTION_KEYS.has(value)) throw new Error(`Invalid configurable value for key "${field}": value "${value}" is reserved (would mutate Object.prototype). This guard protects MemorySaver from prototype pollution.`);
}
function _generateKey(threadId, checkpointNamespace, checkpointId) {
    return JSON.stringify([
        threadId,
        checkpointNamespace,
        checkpointId
    ]);
}
function _parseKey(key) {
    const [threadId, checkpointNamespace, checkpointId] = JSON.parse(key);
    return {
        threadId,
        checkpointNamespace,
        checkpointId
    };
}
var MemorySaver = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseCheckpointSaver"] {
    storage = Object.create(null);
    writes = Object.create(null);
    constructor(serde){
        super(serde);
    }
    /** @internal */ async _migratePendingSends(mutableCheckpoint, threadId, checkpointNs, parentCheckpointId) {
        const deseriablizableCheckpoint = mutableCheckpoint;
        const parentKey = _generateKey(threadId, checkpointNs, parentCheckpointId);
        const pendingSends = await Promise.all(Object.values(this.writes[parentKey] ?? {}).filter(([_taskId, channel])=>channel === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["TASKS"]).map(async ([_taskId, _channel, writes])=>await this.serde.loadsTyped("json", writes)));
        deseriablizableCheckpoint.channel_values ??= {};
        deseriablizableCheckpoint.channel_values[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["TASKS"]] = pendingSends;
        deseriablizableCheckpoint.channel_versions ??= {};
        deseriablizableCheckpoint.channel_versions[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["TASKS"]] = Object.keys(deseriablizableCheckpoint.channel_versions).length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["maxChannelVersion"])(...Object.values(deseriablizableCheckpoint.channel_versions)) : this.getNextVersion(void 0);
    }
    async getTuple(config) {
        const thread_id = config.configurable?.thread_id;
        const checkpoint_ns = config.configurable?.checkpoint_ns ?? "";
        let checkpoint_id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCheckpointId"])(config);
        if (thread_id !== void 0) assertSafeStorageKey("thread_id", thread_id);
        assertSafeStorageKey("checkpoint_ns", checkpoint_ns, {
            allowEmpty: true
        });
        if (checkpoint_id) assertSafeStorageKey("checkpoint_id", checkpoint_id);
        if (checkpoint_id) {
            const saved = this.storage[thread_id]?.[checkpoint_ns]?.[checkpoint_id];
            if (saved !== void 0) {
                const [checkpoint, metadata, parentCheckpointId] = saved;
                const key = _generateKey(thread_id, checkpoint_ns, checkpoint_id);
                const deserializedCheckpoint = await this.serde.loadsTyped("json", checkpoint);
                if (deserializedCheckpoint.v < 4 && parentCheckpointId !== void 0) await this._migratePendingSends(deserializedCheckpoint, thread_id, checkpoint_ns, parentCheckpointId);
                const pendingWrites = await Promise.all(Object.values(this.writes[key] || {}).map(async ([taskId, channel, value])=>{
                    return [
                        taskId,
                        channel,
                        await this.serde.loadsTyped("json", value)
                    ];
                }));
                const checkpointTuple = {
                    config,
                    checkpoint: deserializedCheckpoint,
                    metadata: await this.serde.loadsTyped("json", metadata),
                    pendingWrites
                };
                if (parentCheckpointId !== void 0) checkpointTuple.parentConfig = {
                    configurable: {
                        thread_id,
                        checkpoint_ns,
                        checkpoint_id: parentCheckpointId
                    }
                };
                return checkpointTuple;
            }
        } else {
            const checkpoints = this.storage[thread_id]?.[checkpoint_ns];
            if (checkpoints !== void 0) {
                checkpoint_id = Object.keys(checkpoints).sort((a, b)=>b.localeCompare(a))[0];
                const [checkpoint, metadata, parentCheckpointId] = checkpoints[checkpoint_id];
                const key = _generateKey(thread_id, checkpoint_ns, checkpoint_id);
                const deserializedCheckpoint = await this.serde.loadsTyped("json", checkpoint);
                if (deserializedCheckpoint.v < 4 && parentCheckpointId !== void 0) await this._migratePendingSends(deserializedCheckpoint, thread_id, checkpoint_ns, parentCheckpointId);
                const pendingWrites = await Promise.all(Object.values(this.writes[key] || {}).map(async ([taskId, channel, value])=>{
                    return [
                        taskId,
                        channel,
                        await this.serde.loadsTyped("json", value)
                    ];
                }));
                const checkpointTuple = {
                    config: {
                        configurable: {
                            thread_id,
                            checkpoint_id,
                            checkpoint_ns
                        }
                    },
                    checkpoint: deserializedCheckpoint,
                    metadata: await this.serde.loadsTyped("json", metadata),
                    pendingWrites
                };
                if (parentCheckpointId !== void 0) checkpointTuple.parentConfig = {
                    configurable: {
                        thread_id,
                        checkpoint_ns,
                        checkpoint_id: parentCheckpointId
                    }
                };
                return checkpointTuple;
            }
        }
    }
    async *list(config, options) {
        let { before, limit, filter } = options ?? {};
        if (config.configurable?.thread_id !== void 0) assertSafeStorageKey("thread_id", config.configurable.thread_id);
        if (config.configurable?.checkpoint_ns !== void 0) assertSafeStorageKey("checkpoint_ns", config.configurable.checkpoint_ns, {
            allowEmpty: true
        });
        if (config.configurable?.checkpoint_id) assertSafeStorageKey("checkpoint_id", config.configurable.checkpoint_id);
        if (before?.configurable?.checkpoint_id) assertSafeStorageKey("checkpoint_id", before.configurable.checkpoint_id);
        const threadIds = config.configurable?.thread_id ? [
            config.configurable?.thread_id
        ] : Object.keys(this.storage);
        const configCheckpointNamespace = config.configurable?.checkpoint_ns;
        const configCheckpointId = config.configurable?.checkpoint_id;
        for (const threadId of threadIds)for (const checkpointNamespace of Object.keys(this.storage[threadId] ?? {})){
            if (configCheckpointNamespace !== void 0 && checkpointNamespace !== configCheckpointNamespace) continue;
            const checkpoints = this.storage[threadId]?.[checkpointNamespace] ?? {};
            const sortedCheckpoints = Object.entries(checkpoints).sort((a, b)=>b[0].localeCompare(a[0]));
            for (const [checkpointId, [checkpoint, metadataStr, parentCheckpointId]] of sortedCheckpoints){
                if (configCheckpointId && checkpointId !== configCheckpointId) continue;
                if (before && before.configurable?.checkpoint_id && checkpointId >= before.configurable.checkpoint_id) continue;
                const metadata = await this.serde.loadsTyped("json", metadataStr);
                if (filter && !Object.entries(filter).every(([key, value])=>metadata[key] === value)) continue;
                if (limit !== void 0) {
                    if (limit <= 0) break;
                    limit -= 1;
                }
                const key = _generateKey(threadId, checkpointNamespace, checkpointId);
                const writes = Object.values(this.writes[key] || {});
                const pendingWrites = await Promise.all(writes.map(async ([taskId, channel, value])=>{
                    return [
                        taskId,
                        channel,
                        await this.serde.loadsTyped("json", value)
                    ];
                }));
                const deserializedCheckpoint = await this.serde.loadsTyped("json", checkpoint);
                if (deserializedCheckpoint.v < 4 && parentCheckpointId !== void 0) await this._migratePendingSends(deserializedCheckpoint, threadId, checkpointNamespace, parentCheckpointId);
                const checkpointTuple = {
                    config: {
                        configurable: {
                            thread_id: threadId,
                            checkpoint_ns: checkpointNamespace,
                            checkpoint_id: checkpointId
                        }
                    },
                    checkpoint: deserializedCheckpoint,
                    metadata,
                    pendingWrites
                };
                if (parentCheckpointId !== void 0) checkpointTuple.parentConfig = {
                    configurable: {
                        thread_id: threadId,
                        checkpoint_ns: checkpointNamespace,
                        checkpoint_id: parentCheckpointId
                    }
                };
                yield checkpointTuple;
            }
        }
    }
    async put(config, checkpoint, metadata) {
        const preparedCheckpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["copyCheckpoint"])(checkpoint);
        const threadId = config.configurable?.thread_id;
        const checkpointNamespace = config.configurable?.checkpoint_ns ?? "";
        if (threadId === void 0) throw new Error("Failed to put checkpoint. The passed RunnableConfig is missing a required \"thread_id\" field in its \"configurable\" property. When using a checkpointer, you must pass a \"thread_id\" so the checkpointer knows which conversation thread to persist state for. Example: graph.stream(input, { configurable: { thread_id: \"my-thread-id\" } })");
        assertSafeStorageKey("thread_id", threadId);
        assertSafeStorageKey("checkpoint_ns", checkpointNamespace, {
            allowEmpty: true
        });
        assertSafeStorageKey("checkpoint_id", checkpoint.id);
        if (!this.storage[threadId]) this.storage[threadId] = Object.create(null);
        if (!this.storage[threadId][checkpointNamespace]) this.storage[threadId][checkpointNamespace] = Object.create(null);
        const [[, serializedCheckpoint], [, serializedMetadata]] = await Promise.all([
            this.serde.dumpsTyped(preparedCheckpoint),
            this.serde.dumpsTyped(metadata)
        ]);
        this.storage[threadId][checkpointNamespace][checkpoint.id] = [
            serializedCheckpoint,
            serializedMetadata,
            config.configurable?.checkpoint_id
        ];
        return {
            configurable: {
                thread_id: threadId,
                checkpoint_ns: checkpointNamespace,
                checkpoint_id: checkpoint.id
            }
        };
    }
    async putWrites(config, writes, taskId) {
        const threadId = config.configurable?.thread_id;
        const checkpointNamespace = config.configurable?.checkpoint_ns;
        const checkpointId = config.configurable?.checkpoint_id;
        if (threadId === void 0) throw new Error("Failed to put writes. The passed RunnableConfig is missing a required \"thread_id\" field in its \"configurable\" property. When using a checkpointer, you must pass a \"thread_id\" so the checkpointer knows which conversation thread to persist state for. Example: graph.stream(input, { configurable: { thread_id: \"my-thread-id\" } })");
        if (checkpointId === void 0) throw new Error(`Failed to put writes. The passed RunnableConfig is missing a required "checkpoint_id" field in its "configurable" property.`);
        assertSafeStorageKey("thread_id", threadId);
        assertSafeStorageKey("checkpoint_ns", checkpointNamespace, {
            allowEmpty: true
        });
        assertSafeStorageKey("checkpoint_id", checkpointId);
        assertSafeStorageKey("task_id", taskId);
        const outerKey = _generateKey(threadId, checkpointNamespace, checkpointId);
        const outerWrites_ = this.writes[outerKey];
        if (this.writes[outerKey] === void 0) this.writes[outerKey] = Object.create(null);
        await Promise.all(writes.map(async ([channel, value], idx)=>{
            const [, serializedValue] = await this.serde.dumpsTyped(value);
            const innerKey = [
                taskId,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["WRITES_IDX_MAP"][channel] || idx
            ];
            const innerKeyStr = `${innerKey[0]},${innerKey[1]}`;
            if (innerKey[1] >= 0 && outerWrites_ && innerKeyStr in outerWrites_) return;
            this.writes[outerKey][innerKeyStr] = [
                taskId,
                channel,
                serializedValue
            ];
        }));
    }
    async deleteThread(threadId) {
        assertSafeStorageKey("thread_id", threadId);
        delete this.storage[threadId];
        for (const key of Object.keys(this.writes))if (_parseKey(key).threadId === threadId) delete this.writes[key];
    }
    /**
	* Override: walk the parent chain ONCE for all requested channels using
	* direct storage access.
	*
	* Each channel terminates independently at the nearest ancestor whose
	* stored `channel_values[ch]` is populated. Other channels keep walking
	* until they find their own terminator or hit the root.
	*
	* The seed value (whether a `DeltaSnapshot` or a plain pre-delta migration
	* blob) is the value AT that ancestor, prior to its own pending writes that
	* produce the child. Those on-path writes — including the ones stored on the
	* terminating ancestor — are always collected and replayed on top of the
	* seed, so a thread migrated from a pre-delta channel does not drop the
	* writes saved under the migration boundary checkpoint.
	*
	* @remarks Beta. See {@link BaseCheckpointSaver.getDeltaChannelHistory}.
	*/ async getDeltaChannelHistory(options) {
        const { config, channels } = options;
        if (channels.length === 0) return {};
        const threadId = config.configurable?.thread_id;
        const checkpointNs = config.configurable?.checkpoint_ns ?? "";
        const checkpointId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCheckpointId"])(config);
        if (threadId !== void 0) assertSafeStorageKey("thread_id", threadId);
        assertSafeStorageKey("checkpoint_ns", checkpointNs, {
            allowEmpty: true
        });
        const nsStorage = this.storage[threadId]?.[checkpointNs] ?? {};
        const chain = [];
        let current = (checkpointId ? nsStorage[checkpointId] : void 0)?.[2];
        while(current !== void 0){
            const entry = nsStorage[current];
            if (entry === void 0) break;
            chain.push(current);
            current = entry[2];
        }
        const collectedByCh = {};
        const seedByCh = {};
        const remaining = new Set(channels);
        for (const ch of channels)collectedByCh[ch] = [];
        for (const cpId of chain){
            if (remaining.size === 0) break;
            const entry = nsStorage[cpId];
            const ckpt = entry !== void 0 ? await this.serde.loadsTyped("json", entry[0]) : void 0;
            const blobValueByCh = {};
            const terminatedHere = /* @__PURE__ */ new Set();
            if (ckpt !== void 0) {
                for (const ch of remaining)if (Object.prototype.hasOwnProperty.call(ckpt.channel_values, ch) && ckpt.channel_values[ch] !== void 0) {
                    blobValueByCh[ch] = ckpt.channel_values[ch];
                    terminatedHere.add(ch);
                }
            }
            const stepWritesKey = _generateKey(threadId, checkpointNs, cpId);
            const stepWrites = Object.entries(this.writes[stepWritesKey] ?? {});
            stepWrites.sort(([a], [b])=>{
                const [aTask, aIdx] = a.split(",");
                const [bTask, bIdx] = b.split(",");
                if (aTask !== bTask) return aTask < bTask ? 1 : -1;
                return Number(bIdx) - Number(aIdx);
            });
            for (const [, [tid, ch, serialized]] of stepWrites){
                if (!remaining.has(ch)) continue;
                collectedByCh[ch].push([
                    tid,
                    ch,
                    await this.serde.loadsTyped("json", serialized)
                ]);
            }
            for (const ch of terminatedHere){
                seedByCh[ch] = blobValueByCh[ch];
                remaining.delete(ch);
            }
        }
        const result = {};
        for (const ch of channels){
            const entryH = {
                writes: collectedByCh[ch].slice().reverse()
            };
            if (Object.prototype.hasOwnProperty.call(seedByCh, ch)) entryH.seed = seedByCh[ch];
            result[ch] = entryH;
        }
        return result;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseStore",
    ()=>BaseStore,
    "InvalidNamespaceError",
    ()=>InvalidNamespaceError,
    "getTextAtPath",
    ()=>getTextAtPath,
    "tokenizePath",
    ()=>tokenizePath,
    "validateNamespace",
    ()=>validateNamespace
]);
//#region src/store/base.ts
/**
* Error thrown when an invalid namespace is provided.
*/ var InvalidNamespaceError = class extends Error {
    constructor(message){
        super(message);
        this.name = "InvalidNamespaceError";
    }
};
/**
* Validates the provided namespace.
* @param namespace The namespace to validate.
* @param options.allowEmpty When true, an empty namespace is permitted
*   (`search([])` means "search everything"). Put still rejects empty.
* @param options.allowReservedRoot When true, the `langgraph` root label is
*   permitted. Put still rejects it; search may read a namespace written via
*   `batch()` which bypasses put validation.
* @throws {InvalidNamespaceError} If the namespace is invalid.
*/ function validateNamespace(namespace, options = {}) {
    if (namespace.length === 0) {
        if (options.allowEmpty) return;
        throw new InvalidNamespaceError("Namespace cannot be empty.");
    }
    for (const label of namespace){
        if (typeof label !== "string") throw new InvalidNamespaceError(`Invalid namespace label '${label}' found in ${namespace}. Namespace labels must be strings, but got ${typeof label}.`);
        if (label.includes(".")) throw new InvalidNamespaceError(`Invalid namespace label '${label}' found in ${namespace}. Namespace labels cannot contain periods ('.').`);
        if (label === "") throw new InvalidNamespaceError(`Namespace labels cannot be empty strings. Got ${label} in ${namespace}`);
    }
    if (namespace[0] === "langgraph" && !options.allowReservedRoot) throw new InvalidNamespaceError(`Root label for namespace cannot be "langgraph". Got: ${namespace}`);
}
/**
* Utility function to get text at a specific JSON path
*/ function getTextAtPath(obj, path) {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts){
        if (part.includes("[")) {
            const [arrayName, indexStr] = part.split("[");
            const index = indexStr.replace("]", "");
            if (!current[arrayName]) return [];
            if (index === "*") {
                const results = [];
                for (const item of current[arrayName])if (typeof item === "string") results.push(item);
                return results;
            }
            const idx = parseInt(index, 10);
            if (Number.isNaN(idx)) return [];
            current = current[arrayName][idx];
        } else current = current[part];
        if (current === void 0) return [];
    }
    return typeof current === "string" ? [
        current
    ] : [];
}
/**
* Tokenizes a JSON path into parts
*/ function tokenizePath(path) {
    return path.split(".");
}
/**
* Abstract base class for persistent key-value stores.
*
* Stores enable persistence and memory that can be shared across threads,
* scoped to user IDs, assistant IDs, or other arbitrary namespaces.
*
* Features:
* - Hierarchical namespaces for organization
* - Key-value storage with metadata
* - Vector similarity search (if configured)
* - Filtering and pagination
*/ var BaseStore = class {
    /**
	* Retrieve a single item by its namespace and key.
	*
	* @param namespace Hierarchical path for the item
	* @param key Unique identifier within the namespace
	* @returns Promise resolving to the item or null if not found
	*/ async get(namespace, key) {
        return (await this.batch([
            {
                namespace,
                key
            }
        ]))[0];
    }
    /**
	* Search for items within a namespace prefix.
	* Supports both metadata filtering and vector similarity search.
	*
	* @param namespacePrefix Hierarchical path prefix to search within
	* @param options Search options for filtering and pagination
	* @returns Promise resolving to list of matching items with relevance scores
	*
	* @example
	* // Search with filters
	* await store.search(["documents"], {
	*   filter: { type: "report", status: "active" },
	*   limit: 5,
	*   offset: 10
	* });
	*
	* // Vector similarity search
	* await store.search(["users", "content"], {
	*   query: "technical documentation about APIs",
	*   limit: 20
	* });
	*/ async search(namespacePrefix, options = {}) {
        validateNamespace(namespacePrefix, {
            allowEmpty: true,
            allowReservedRoot: true
        });
        const { filter, limit = 10, offset = 0, query } = options;
        return (await this.batch([
            {
                namespacePrefix,
                filter,
                limit,
                offset,
                query
            }
        ]))[0];
    }
    /**
	* Store or update an item.
	*
	* @param namespace Hierarchical path for the item
	* @param key Unique identifier within the namespace
	* @param value Object containing the item's data
	* @param index Optional indexing configuration
	*
	* @example
	* // Simple storage
	* await store.put(["docs"], "report", { title: "Annual Report" });
	*
	* // With specific field indexing
	* await store.put(
	*   ["docs"],
	*   "report",
	*   {
	*     title: "Q4 Report",
	*     chapters: [{ content: "..." }, { content: "..." }]
	*   },
	*   ["title", "chapters[*].content"]
	* );
	*/ async put(namespace, key, value, index) {
        validateNamespace(namespace);
        await this.batch([
            {
                namespace,
                key,
                value,
                index
            }
        ]);
    }
    /**
	* Delete an item from the store.
	*
	* @param namespace Hierarchical path for the item
	* @param key Unique identifier within the namespace
	*/ async delete(namespace, key) {
        await this.batch([
            {
                namespace,
                key,
                value: null
            }
        ]);
    }
    /**
	* List and filter namespaces in the store.
	* Used to explore data organization and navigate the namespace hierarchy.
	*
	* @param options Options for listing namespaces
	* @returns Promise resolving to list of namespace paths
	*
	* @example
	* // List all namespaces under "documents"
	* await store.listNamespaces({
	*   prefix: ["documents"],
	*   maxDepth: 2
	* });
	*
	* // List namespaces ending with "v1"
	* await store.listNamespaces({
	*   suffix: ["v1"],
	*   limit: 50
	* });
	*/ async listNamespaces(options = {}) {
        const { prefix, suffix, maxDepth, limit = 100, offset = 0 } = options;
        const matchConditions = [];
        if (prefix) matchConditions.push({
            matchType: "prefix",
            path: prefix
        });
        if (suffix) matchConditions.push({
            matchType: "suffix",
            path: suffix
        });
        return (await this.batch([
            {
                matchConditions: matchConditions.length ? matchConditions : void 0,
                maxDepth,
                limit,
                offset
            }
        ]))[0];
    }
    /**
	* Start the store. Override if initialization is needed.
	*/ start() {}
    /**
	* Stop the store. Override if cleanup is needed.
	*/ stop() {}
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/batch.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncBatchedStore",
    ()=>AsyncBatchedStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [instrumentation] (ecmascript)");
;
//#region src/store/batch.ts
/**
* Extracts and returns the underlying store from an `AsyncBatchedStore`,
* or returns the input if it is not an `AsyncBatchedStore`.
*/ const extractStore = (input)=>{
    if ("lg_name" in input && input.lg_name === "AsyncBatchedStore") return input.store;
    return input;
};
var AsyncBatchedStore = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseStore"] {
    lg_name = "AsyncBatchedStore";
    store;
    queue = /* @__PURE__ */ new Map();
    nextKey = 0;
    running = false;
    processingTask = null;
    constructor(store){
        super();
        this.store = extractStore(store);
    }
    get isRunning() {
        return this.running;
    }
    /**
	* @ignore
	* Batch is not implemented here as we're only extending `BaseStore`
	* to allow it to be passed where `BaseStore` is expected, and implement
	* the convenience methods (get, search, put, delete).
	*/ async batch(_operations) {
        throw new Error("The `batch` method is not implemented on `AsyncBatchedStore`.\n Instead, it calls the `batch` method on the wrapped store.\n If you are seeing this error, something is wrong.");
    }
    async get(namespace, key) {
        return this.enqueueOperation({
            namespace,
            key
        });
    }
    async search(namespacePrefix, options) {
        const { filter, limit = 10, offset = 0, query } = options || {};
        return this.enqueueOperation({
            namespacePrefix,
            filter,
            limit,
            offset,
            query
        });
    }
    async put(namespace, key, value) {
        return this.enqueueOperation({
            namespace,
            key,
            value
        });
    }
    async delete(namespace, key) {
        return this.enqueueOperation({
            namespace,
            key,
            value: null
        });
    }
    start() {
        if (!this.running) {
            this.running = true;
            this.processingTask = this.processBatchQueue();
        }
    }
    async stop() {
        this.running = false;
        if (this.processingTask) await this.processingTask;
    }
    enqueueOperation(operation) {
        return new Promise((resolve, reject)=>{
            const key = this.nextKey;
            this.nextKey += 1;
            this.queue.set(key, {
                operation,
                resolve,
                reject
            });
        });
    }
    async processBatchQueue() {
        while(this.running){
            await new Promise((resolve)=>{
                setTimeout(resolve, 0);
            });
            if (this.queue.size === 0) continue;
            const batch = new Map(this.queue);
            this.queue.clear();
            try {
                const operations = Array.from(batch.values()).map(({ operation })=>operation);
                const results = await this.store.batch(operations);
                batch.forEach(({ resolve }, key)=>{
                    resolve(results[Array.from(batch.keys()).indexOf(key)]);
                });
            } catch (e) {
                batch.forEach(({ reject })=>{
                    reject(e);
                });
            }
        }
    }
    toJSON() {
        return {
            queue: this.queue,
            nextKey: this.nextKey,
            running: this.running,
            store: "[LangGraphStore]"
        };
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/utils.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compareValues",
    ()=>compareValues,
    "getTextAtPath",
    ()=>getTextAtPath,
    "tokenizePath",
    ()=>tokenizePath
]);
//#region src/store/utils.ts
/**
* Tokenize a JSON path into parts.
* @example
* tokenizePath("metadata.title") // -> ["metadata", "title"]
* tokenizePath("chapters[*].content") // -> ["chapters[*]", "content"]
*/ function tokenizePath(path) {
    if (!path) return [];
    const tokens = [];
    let current = [];
    let i = 0;
    while(i < path.length){
        const char = path[i];
        if (char === "[") {
            if (current.length) {
                tokens.push(current.join(""));
                current = [];
            }
            let bracketCount = 1;
            const indexChars = [
                "["
            ];
            i += 1;
            while(i < path.length && bracketCount > 0){
                if (path[i] === "[") bracketCount += 1;
                else if (path[i] === "]") bracketCount -= 1;
                indexChars.push(path[i]);
                i += 1;
            }
            tokens.push(indexChars.join(""));
            continue;
        } else if (char === "{") {
            if (current.length) {
                tokens.push(current.join(""));
                current = [];
            }
            let braceCount = 1;
            const fieldChars = [
                "{"
            ];
            i += 1;
            while(i < path.length && braceCount > 0){
                if (path[i] === "{") braceCount += 1;
                else if (path[i] === "}") braceCount -= 1;
                fieldChars.push(path[i]);
                i += 1;
            }
            tokens.push(fieldChars.join(""));
            continue;
        } else if (char === ".") {
            if (current.length) {
                tokens.push(current.join(""));
                current = [];
            }
        } else current.push(char);
        i += 1;
    }
    if (current.length) tokens.push(current.join(""));
    return tokens;
}
/**
* Type guard to check if an object is a FilterOperators
*/ function isFilterOperators(obj) {
    return typeof obj === "object" && obj !== null && Object.keys(obj).every((key)=>key === "$eq" || key === "$ne" || key === "$gt" || key === "$gte" || key === "$lt" || key === "$lte" || key === "$in" || key === "$nin");
}
/**
* Compare values for filtering, supporting operator-based comparisons.
*/ function compareValues(itemValue, filterValue) {
    if (isFilterOperators(filterValue)) return Object.keys(filterValue).filter((k)=>k.startsWith("$")).every((op)=>{
        const value = filterValue[op];
        switch(op){
            case "$eq":
                return itemValue === value;
            case "$ne":
                return itemValue !== value;
            case "$gt":
                return Number(itemValue) > Number(value);
            case "$gte":
                return Number(itemValue) >= Number(value);
            case "$lt":
                return Number(itemValue) < Number(value);
            case "$lte":
                return Number(itemValue) <= Number(value);
            case "$in":
                return Array.isArray(value) ? value.includes(itemValue) : false;
            case "$nin":
                return Array.isArray(value) ? !value.includes(itemValue) : true;
            default:
                return false;
        }
    });
    return itemValue === filterValue;
}
/**
* Extract text from a value at a specific JSON path.
*
* Supports:
* - Simple paths: "field1.field2"
* - Array indexing: "[0]", "[*]", "[-1]"
* - Wildcards: "*"
* - Multi-field selection: "{field1,field2}"
* - Nested paths in multi-field: "{field1,nested.field2}"
*/ function getTextAtPath(obj, path) {
    if (!path || path === "$") return [
        JSON.stringify(obj, null, 2)
    ];
    const tokens = Array.isArray(path) ? path : tokenizePath(path);
    function extractFromObj(obj, tokens, pos) {
        if (pos >= tokens.length) {
            if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") return [
                String(obj)
            ];
            if (obj === null || obj === void 0) return [];
            if (Array.isArray(obj) || typeof obj === "object") return [
                JSON.stringify(obj, null, 2)
            ];
            return [];
        }
        const token = tokens[pos];
        const results = [];
        if (pos === 0 && token === "$") results.push(JSON.stringify(obj, null, 2));
        if (token.startsWith("[") && token.endsWith("]")) {
            if (!Array.isArray(obj)) return [];
            const index = token.slice(1, -1);
            if (index === "*") for (const item of obj)results.push(...extractFromObj(item, tokens, pos + 1));
            else try {
                let idx = parseInt(index, 10);
                if (idx < 0) idx = obj.length + idx;
                if (idx >= 0 && idx < obj.length) results.push(...extractFromObj(obj[idx], tokens, pos + 1));
            } catch  {
                return [];
            }
        } else if (token.startsWith("{") && token.endsWith("}")) {
            if (typeof obj !== "object" || obj === null) return [];
            const fields = token.slice(1, -1).split(",").map((f)=>f.trim());
            for (const field of fields){
                const nestedTokens = tokenizePath(field);
                if (nestedTokens.length) {
                    let currentObj = obj;
                    for (const nestedToken of nestedTokens)if (currentObj && typeof currentObj === "object" && nestedToken in currentObj) currentObj = currentObj[nestedToken];
                    else {
                        currentObj = void 0;
                        break;
                    }
                    if (currentObj !== void 0) {
                        if (typeof currentObj === "string" || typeof currentObj === "number" || typeof currentObj === "boolean") results.push(String(currentObj));
                        else if (Array.isArray(currentObj) || typeof currentObj === "object") results.push(JSON.stringify(currentObj, null, 2));
                    }
                }
            }
        } else if (token === "*") {
            if (Array.isArray(obj)) for (const item of obj)results.push(...extractFromObj(item, tokens, pos + 1));
            else if (typeof obj === "object" && obj !== null) for (const value of Object.values(obj))results.push(...extractFromObj(value, tokens, pos + 1));
        } else if (typeof obj === "object" && obj !== null && token in obj) results.push(...extractFromObj(obj[token], tokens, pos + 1));
        return results;
    }
    return extractFromObj(obj, tokens, 0);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/memory.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InMemoryStore",
    ()=>InMemoryStore,
    "MemoryStore",
    ()=>MemoryStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/utils.js [instrumentation] (ecmascript)");
;
;
//#region src/store/memory.ts
function validateMemoryNamespace(namespace) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateNamespace"])(namespace, {
        allowReservedRoot: true
    });
    if (namespace.some((label)=>label.includes(":"))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["InvalidNamespaceError"]("Namespace labels cannot contain colons (':'), the InMemoryStore path separator.");
}
/**
* In-memory key-value store with optional vector search.
*
* A lightweight store implementation using JavaScript Maps. Supports basic
* key-value operations and vector search when configured with embeddings.
*
* @example
* ```typescript
* // Basic key-value storage
* const store = new InMemoryStore();
* await store.put(["users", "123"], "prefs", { theme: "dark" });
* const item = await store.get(["users", "123"], "prefs");
*
* // Vector search with embeddings
* import { OpenAIEmbeddings } from "@langchain/openai";
* const store = new InMemoryStore({
*   index: {
*     dims: 1536,
*     embeddings: new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
*   }
* });
*
* // Store documents
* await store.put(["docs"], "doc1", { text: "Python tutorial" });
* await store.put(["docs"], "doc2", { text: "TypeScript guide" });
*
* // Search by similarity
* const results = await store.search(["docs"], { query: "python programming" });
* ```
*
* **Warning**: This store keeps all data in memory. Data is lost when the process exits.
* For persistence, use a database-backed store.
*/ var InMemoryStore = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseStore"] {
    data = /* @__PURE__ */ new Map();
    vectors = /* @__PURE__ */ new Map();
    _indexConfig;
    constructor(options){
        super();
        if (options?.index) this._indexConfig = {
            ...options.index,
            __tokenizedFields: (options.index.fields ?? [
                "$"
            ]).map((p)=>[
                    p,
                    p === "$" ? [
                        p
                    ] : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["tokenizePath"])(p)
                ])
        };
    }
    async batch(operations) {
        const results = [];
        const putOps = /* @__PURE__ */ new Map();
        const searchOps = /* @__PURE__ */ new Map();
        for(let i = 0; i < operations.length; i += 1){
            const op = operations[i];
            if ("namespace" in op) validateMemoryNamespace(op.namespace);
            if ("key" in op && "namespace" in op && !("value" in op)) results.push(this.getOperation(op));
            else if ("namespacePrefix" in op) {
                const candidates = this.filterItems(op);
                searchOps.set(i, [
                    op,
                    candidates
                ]);
                results.push(null);
            } else if ("value" in op) {
                const key = `${op.namespace.join(":")}:${op.key}`;
                putOps.set(key, op);
                results.push(null);
            } else if ("matchConditions" in op) results.push(this.listNamespacesOperation(op));
        }
        if (searchOps.size > 0) if (this._indexConfig?.embeddings) {
            const queries = /* @__PURE__ */ new Set();
            for (const [op] of searchOps.values())if (op.query) queries.add(op.query);
            const queryEmbeddings = queries.size > 0 ? await Promise.all(Array.from(queries).map((q)=>this._indexConfig.embeddings.embedQuery(q))) : [];
            const queryVectors = Object.fromEntries(Array.from(queries).map((q, i)=>[
                    q,
                    queryEmbeddings[i]
                ]));
            for (const [i, [op, candidates]] of searchOps.entries())if (op.query && queryVectors[op.query]) {
                const queryVector = queryVectors[op.query];
                results[i] = this.scoreResults(candidates, queryVector, op.offset ?? 0, op.limit ?? 10);
            } else results[i] = this.paginateResults(candidates.map((item)=>({
                    ...item,
                    score: void 0
                })), op.offset ?? 0, op.limit ?? 10);
        } else for (const [i, [op, candidates]] of searchOps.entries())results[i] = this.paginateResults(candidates.map((item)=>({
                ...item,
                score: void 0
            })), op.offset ?? 0, op.limit ?? 10);
        if (putOps.size > 0 && this._indexConfig?.embeddings) {
            const toEmbed = this.extractTexts(Array.from(putOps.values()));
            if (Object.keys(toEmbed).length > 0) {
                const embeddings = await this._indexConfig.embeddings.embedDocuments(Object.keys(toEmbed));
                this.insertVectors(toEmbed, embeddings);
            }
        }
        for (const op of putOps.values())this.putOperation(op);
        return results;
    }
    getOperation(op) {
        const namespaceKey = op.namespace.join(":");
        return this.data.get(namespaceKey)?.get(op.key) ?? null;
    }
    putOperation(op) {
        const namespaceKey = op.namespace.join(":");
        if (!this.data.has(namespaceKey)) this.data.set(namespaceKey, /* @__PURE__ */ new Map());
        const namespaceMap = this.data.get(namespaceKey);
        if (op.value === null) namespaceMap.delete(op.key);
        else {
            const now = /* @__PURE__ */ new Date();
            if (namespaceMap.has(op.key)) {
                const item = namespaceMap.get(op.key);
                item.value = op.value;
                item.updatedAt = now;
            } else namespaceMap.set(op.key, {
                value: op.value,
                key: op.key,
                namespace: op.namespace,
                createdAt: now,
                updatedAt: now
            });
        }
    }
    listNamespacesOperation(op) {
        let namespaces = Array.from(this.data.keys()).map((ns)=>ns.split(":"));
        if (op.matchConditions && op.matchConditions.length > 0) namespaces = namespaces.filter((ns)=>op.matchConditions.every((condition)=>this.doesMatch(condition, ns)));
        if (op.maxDepth !== void 0) namespaces = Array.from(new Set(namespaces.map((ns)=>ns.slice(0, op.maxDepth).join(":")))).map((ns)=>ns.split(":"));
        namespaces.sort((a, b)=>a.join(":").localeCompare(b.join(":")));
        return namespaces.slice(op.offset ?? 0, (op.offset ?? 0) + (op.limit ?? namespaces.length));
    }
    doesMatch(matchCondition, key) {
        const { matchType, path } = matchCondition;
        if (matchType === "prefix") {
            if (path.length > key.length) return false;
            return path.every((pElem, index)=>{
                const kElem = key[index];
                return pElem === "*" || kElem === pElem;
            });
        } else if (matchType === "suffix") {
            if (path.length > key.length) return false;
            return path.every((pElem, index)=>{
                const kElem = key[key.length - path.length + index];
                return pElem === "*" || kElem === pElem;
            });
        }
        throw new Error(`Unsupported match type: ${matchType}`);
    }
    filterItems(op) {
        if (op.namespacePrefix.length > 0) validateMemoryNamespace(op.namespacePrefix);
        const prefix = op.namespacePrefix.join(":");
        const candidates = [];
        for (const [namespace, items] of this.data.entries())if (prefix === "" || namespace === prefix || namespace.startsWith(`${prefix}:`)) candidates.push(...items.values());
        let filteredCandidates = candidates;
        if (op.filter) filteredCandidates = candidates.filter((item)=>Object.entries(op.filter).every(([key, value])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["compareValues"])(item.value[key], value)));
        return filteredCandidates;
    }
    scoreResults(candidates, queryVector, offset = 0, limit = 10) {
        const flatItems = [];
        const flatVectors = [];
        const scoreless = [];
        for (const item of candidates){
            const vectors = this.getVectors(item);
            if (vectors.length) for (const vector of vectors){
                flatItems.push(item);
                flatVectors.push(vector);
            }
            else scoreless.push(item);
        }
        const sortedResults = this.cosineSimilarity(queryVector, flatVectors).map((score, i)=>[
                score,
                flatItems[i]
            ]).sort((a, b)=>b[0] - a[0]);
        const seen = /* @__PURE__ */ new Set();
        const kept = [];
        for (const [score, item] of sortedResults){
            const key = `${item.namespace.join(":")}:${item.key}`;
            if (seen.has(key)) continue;
            const ix = seen.size;
            if (ix >= offset + limit) break;
            if (ix < offset) {
                seen.add(key);
                continue;
            }
            seen.add(key);
            kept.push([
                score,
                item
            ]);
        }
        if (scoreless.length && kept.length < limit) for (const item of scoreless.slice(0, limit - kept.length)){
            const key = `${item.namespace.join(":")}:${item.key}`;
            if (!seen.has(key)) {
                seen.add(key);
                kept.push([
                    void 0,
                    item
                ]);
            }
        }
        return kept.map(([score, item])=>({
                ...item,
                score
            }));
    }
    paginateResults(results, offset, limit) {
        return results.slice(offset, offset + limit);
    }
    extractTexts(ops) {
        if (!ops.length || !this._indexConfig) return {};
        const toEmbed = {};
        for (const op of ops)if (op.value !== null && op.index !== false) {
            const paths = op.index === null || op.index === void 0 ? this._indexConfig.__tokenizedFields ?? [] : op.index.map((ix)=>[
                    ix,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["tokenizePath"])(ix)
                ]);
            for (const [path, field] of paths){
                const texts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTextAtPath"])(op.value, field);
                if (texts.length) if (texts.length > 1) texts.forEach((text, i)=>{
                    if (!toEmbed[text]) toEmbed[text] = [];
                    toEmbed[text].push([
                        op.namespace,
                        op.key,
                        `${path}.${i}`
                    ]);
                });
                else {
                    if (!toEmbed[texts[0]]) toEmbed[texts[0]] = [];
                    toEmbed[texts[0]].push([
                        op.namespace,
                        op.key,
                        path
                    ]);
                }
            }
        }
        return toEmbed;
    }
    insertVectors(texts, embeddings) {
        for (const [text, metadata] of Object.entries(texts)){
            const embedding = embeddings.shift();
            if (!embedding) throw new Error(`No embedding found for text: ${text}`);
            for (const [namespace, key, field] of metadata){
                const namespaceKey = namespace.join(":");
                if (!this.vectors.has(namespaceKey)) this.vectors.set(namespaceKey, /* @__PURE__ */ new Map());
                const namespaceMap = this.vectors.get(namespaceKey);
                if (!namespaceMap.has(key)) namespaceMap.set(key, /* @__PURE__ */ new Map());
                namespaceMap.get(key).set(field, embedding);
            }
        }
    }
    getVectors(item) {
        const namespaceKey = item.namespace.join(":");
        const itemKey = item.key;
        if (!this.vectors.has(namespaceKey)) return [];
        const namespaceMap = this.vectors.get(namespaceKey);
        if (!namespaceMap.has(itemKey)) return [];
        const itemMap = namespaceMap.get(itemKey);
        const vectors = Array.from(itemMap.values());
        if (!vectors.length) return [];
        return vectors;
    }
    cosineSimilarity(X, Y) {
        if (!Y.length) return [];
        const dotProducts = Y.map((vector)=>vector.reduce((acc, val, i)=>acc + val * X[i], 0));
        const magnitude1 = Math.sqrt(X.reduce((acc, val)=>acc + val * val, 0));
        const magnitudes2 = Y.map((vector)=>Math.sqrt(vector.reduce((acc, val)=>acc + val * val, 0)));
        return dotProducts.map((dot, i)=>{
            const magnitude2 = magnitudes2[i];
            return magnitude1 && magnitude2 ? dot / (magnitude1 * magnitude2) : 0;
        });
    }
    get indexConfig() {
        return this._indexConfig;
    }
};
/** @deprecated Alias for InMemoryStore */ var MemoryStore = class extends InMemoryStore {
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCache",
    ()=>BaseCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/jsonplus.js [instrumentation] (ecmascript)");
;
//#region src/cache/base.ts
var BaseCache = class {
    serde = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["JsonPlusSerializer"]();
    /**
	* Initialize the cache with a serializer.
	*
	* @param serde - The serializer to use.
	*/ constructor(serde){
        this.serde = serde || this.serde;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/memory.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InMemoryCache",
    ()=>InMemoryCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [instrumentation] (ecmascript)");
;
//#region src/cache/memory.ts
var InMemoryCache = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseCache"] {
    cache = {};
    async get(keys) {
        if (!keys.length) return [];
        const now = Date.now();
        return (await Promise.all(keys.map(async (fullKey)=>{
            const [namespace, key] = fullKey;
            const strNamespace = namespace.join(",");
            if (strNamespace in this.cache && key in this.cache[strNamespace]) {
                const cached = this.cache[strNamespace][key];
                if (cached.exp == null || now < cached.exp) return [
                    {
                        key: fullKey,
                        value: await this.serde.loadsTyped(cached.enc, cached.val)
                    }
                ];
                else delete this.cache[strNamespace][key];
            }
            return [];
        }))).flat();
    }
    async set(pairs) {
        const now = Date.now();
        for (const { key: fullKey, value, ttl } of pairs){
            const [namespace, key] = fullKey;
            const strNamespace = namespace.join(",");
            const [enc, val] = await this.serde.dumpsTyped(value);
            const exp = ttl != null ? ttl * 1e3 + now : null;
            this.cache[strNamespace] ??= {};
            this.cache[strNamespace][key] = {
                enc,
                val,
                exp
            };
        }
    }
    async clear(namespaces) {
        if (!namespaces.length) {
            this.cache = {};
            return;
        }
        for (const namespace of namespaces){
            const strNamespace = namespace.join(",");
            if (strNamespace in this.cache) delete this.cache[strNamespace];
        }
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$memory$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/memory.js [instrumentation] (ecmascript)");
;
;
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$id$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/id.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$memory$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/memory.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$batch$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/batch.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$memory$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/memory.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$memory$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/memory.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/index.js [instrumentation] (ecmascript)");
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
"[project]/node_modules/.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var has = Object.prototype.hasOwnProperty, prefix = '~';
/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */ function Events() {}
//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
    Events.prototype = Object.create(null);
    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
}
/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */ function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}
/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */ function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [
        emitter._events[evt],
        listener
    ];
    return emitter;
}
/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */ function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
}
/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */ function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
}
/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */ EventEmitter.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0) return names;
    for(name in events = this._events){
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
};
/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */ EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers = this._events[evt];
    if (!handlers) return [];
    if (handlers.fn) return [
        handlers.fn
    ];
    for(var i = 0, l = handlers.length, ee = new Array(l); i < l; i++){
        ee[i] = handlers[i].fn;
    }
    return ee;
};
/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */ EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
};
/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */ EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return false;
    var listeners = this._events[evt], len = arguments.length, args, i;
    if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
        switch(len){
            case 1:
                return listeners.fn.call(listeners.context), true;
            case 2:
                return listeners.fn.call(listeners.context, a1), true;
            case 3:
                return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
                return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for(i = 1, args = new Array(len - 1); i < len; i++){
            args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
    } else {
        var length = listeners.length, j;
        for(i = 0; i < length; i++){
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
            switch(len){
                case 1:
                    listeners[i].fn.call(listeners[i].context);
                    break;
                case 2:
                    listeners[i].fn.call(listeners[i].context, a1);
                    break;
                case 3:
                    listeners[i].fn.call(listeners[i].context, a1, a2);
                    break;
                case 4:
                    listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                    break;
                default:
                    if (!args) for(j = 1, args = new Array(len - 1); j < len; j++){
                        args[j - 1] = arguments[j];
                    }
                    listeners[i].fn.apply(listeners[i].context, args);
            }
        }
    }
    return true;
};
/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */ EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
};
/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */ EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
};
/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */ EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return this;
    if (!fn) {
        clearEvent(this, evt);
        return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
        }
    } else {
        for(var i = 0, events = [], length = listeners.length; i < length; i++){
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
                events.push(listeners[i]);
            }
        }
        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
    }
    return this;
};
/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */ EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
    } else {
        this._events = new Events();
        this._eventsCount = 0;
    }
    return this;
};
//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;
//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;
//
// Expose the module.
//
if ("TURBOPACK compile-time truthy", 1) {
    module.exports = EventEmitter;
}
}),
"[project]/node_modules/.pnpm/p-finally@1.0.0/node_modules/p-finally/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = (promise, onFinally)=>{
    onFinally = onFinally || (()=>{});
    return promise.then((val)=>new Promise((resolve)=>{
            resolve(onFinally());
        }).then(()=>val), (err)=>new Promise((resolve)=>{
            resolve(onFinally());
        }).then(()=>{
            throw err;
        }));
};
}),
"[project]/node_modules/.pnpm/p-timeout@3.2.0/node_modules/p-timeout/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const pFinally = __turbopack_context__.r("[project]/node_modules/.pnpm/p-finally@1.0.0/node_modules/p-finally/index.js [instrumentation] (ecmascript)");
class TimeoutError extends Error {
    constructor(message){
        super(message);
        this.name = 'TimeoutError';
    }
}
const pTimeout = (promise, milliseconds, fallback)=>new Promise((resolve, reject)=>{
        if (typeof milliseconds !== 'number' || milliseconds < 0) {
            throw new TypeError('Expected `milliseconds` to be a positive number');
        }
        if (milliseconds === Infinity) {
            resolve(promise);
            return;
        }
        const timer = setTimeout(()=>{
            if (typeof fallback === 'function') {
                try {
                    resolve(fallback());
                } catch (error) {
                    reject(error);
                }
                return;
            }
            const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
            const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);
            if (typeof promise.cancel === 'function') {
                promise.cancel();
            }
            reject(timeoutError);
        }, milliseconds);
        // TODO: Use native `finally` keyword when targeting Node.js 10
        pFinally(// eslint-disable-next-line promise/prefer-await-to-then
        promise.then(resolve, reject), ()=>{
            clearTimeout(timer);
        });
    });
module.exports = pTimeout;
// TODO: Remove this for the next major release
module.exports.default = pTimeout;
module.exports.TimeoutError = TimeoutError;
}),
"[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/lower-bound.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Port of lower_bound from https://en.cppreference.com/w/cpp/algorithm/lower_bound
// Used to compute insertion index to keep queue sorted after insertion
function lowerBound(array, value, comparator) {
    let first = 0;
    let count = array.length;
    while(count > 0){
        const step = count / 2 | 0;
        let it = first + step;
        if (comparator(array[it], value) <= 0) {
            first = ++it;
            count -= step + 1;
        } else {
            count = step;
        }
    }
    return first;
}
exports.default = lowerBound;
}),
"[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/priority-queue.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const lower_bound_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/lower-bound.js [instrumentation] (ecmascript)");
class PriorityQueue {
    constructor(){
        this._queue = [];
    }
    enqueue(run, options) {
        options = Object.assign({
            priority: 0
        }, options);
        const element = {
            priority: options.priority,
            run
        };
        if (this.size && this._queue[this.size - 1].priority >= options.priority) {
            this._queue.push(element);
            return;
        }
        const index = lower_bound_1.default(this._queue, element, (a, b)=>b.priority - a.priority);
        this._queue.splice(index, 0, element);
    }
    dequeue() {
        const item = this._queue.shift();
        return item === null || item === void 0 ? void 0 : item.run;
    }
    filter(options) {
        return this._queue.filter((element)=>element.priority === options.priority).map((element)=>element.run);
    }
    get size() {
        return this._queue.length;
    }
}
exports.default = PriorityQueue;
}),
"[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const EventEmitter = __turbopack_context__.r("[project]/node_modules/.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3/index.js [instrumentation] (ecmascript)");
const p_timeout_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/p-timeout@3.2.0/node_modules/p-timeout/index.js [instrumentation] (ecmascript)");
const priority_queue_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/priority-queue.js [instrumentation] (ecmascript)");
// eslint-disable-next-line @typescript-eslint/no-empty-function
const empty = ()=>{};
const timeoutError = new p_timeout_1.TimeoutError();
/**
Promise queue with concurrency control.
*/ class PQueue extends EventEmitter {
    constructor(options){
        var _a, _b, _c, _d;
        super();
        this._intervalCount = 0;
        this._intervalEnd = 0;
        this._pendingCount = 0;
        this._resolveEmpty = empty;
        this._resolveIdle = empty;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        options = Object.assign({
            carryoverConcurrencyCount: false,
            intervalCap: Infinity,
            interval: 0,
            concurrency: Infinity,
            autoStart: true,
            queueClass: priority_queue_1.default
        }, options);
        if (!(typeof options.intervalCap === 'number' && options.intervalCap >= 1)) {
            throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${(_b = (_a = options.intervalCap) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''}\` (${typeof options.intervalCap})`);
        }
        if (options.interval === undefined || !(Number.isFinite(options.interval) && options.interval >= 0)) {
            throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${(_d = (_c = options.interval) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ''}\` (${typeof options.interval})`);
        }
        this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
        this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
        this._intervalCap = options.intervalCap;
        this._interval = options.interval;
        this._queue = new options.queueClass();
        this._queueClass = options.queueClass;
        this.concurrency = options.concurrency;
        this._timeout = options.timeout;
        this._throwOnTimeout = options.throwOnTimeout === true;
        this._isPaused = options.autoStart === false;
    }
    get _doesIntervalAllowAnother() {
        return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
    }
    get _doesConcurrentAllowAnother() {
        return this._pendingCount < this._concurrency;
    }
    _next() {
        this._pendingCount--;
        this._tryToStartAnother();
        this.emit('next');
    }
    _resolvePromises() {
        this._resolveEmpty();
        this._resolveEmpty = empty;
        if (this._pendingCount === 0) {
            this._resolveIdle();
            this._resolveIdle = empty;
            this.emit('idle');
        }
    }
    _onResumeInterval() {
        this._onInterval();
        this._initializeIntervalIfNeeded();
        this._timeoutId = undefined;
    }
    _isIntervalPaused() {
        const now = Date.now();
        if (this._intervalId === undefined) {
            const delay = this._intervalEnd - now;
            if (delay < 0) {
                // Act as the interval was done
                // We don't need to resume it here because it will be resumed on line 160
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
            } else {
                // Act as the interval is pending
                if (this._timeoutId === undefined) {
                    this._timeoutId = setTimeout(()=>{
                        this._onResumeInterval();
                    }, delay);
                }
                return true;
            }
        }
        return false;
    }
    _tryToStartAnother() {
        if (this._queue.size === 0) {
            // We can clear the interval ("pause")
            // Because we can redo it later ("resume")
            if (this._intervalId) {
                clearInterval(this._intervalId);
            }
            this._intervalId = undefined;
            this._resolvePromises();
            return false;
        }
        if (!this._isPaused) {
            const canInitializeInterval = !this._isIntervalPaused();
            if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                const job = this._queue.dequeue();
                if (!job) {
                    return false;
                }
                this.emit('active');
                job();
                if (canInitializeInterval) {
                    this._initializeIntervalIfNeeded();
                }
                return true;
            }
        }
        return false;
    }
    _initializeIntervalIfNeeded() {
        if (this._isIntervalIgnored || this._intervalId !== undefined) {
            return;
        }
        this._intervalId = setInterval(()=>{
            this._onInterval();
        }, this._interval);
        this._intervalEnd = Date.now() + this._interval;
    }
    _onInterval() {
        if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
        this._processQueue();
    }
    /**
    Executes all queued functions until it reaches the limit.
    */ _processQueue() {
        // eslint-disable-next-line no-empty
        while(this._tryToStartAnother()){}
    }
    get concurrency() {
        return this._concurrency;
    }
    set concurrency(newConcurrency) {
        if (!(typeof newConcurrency === 'number' && newConcurrency >= 1)) {
            throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
        }
        this._concurrency = newConcurrency;
        this._processQueue();
    }
    /**
    Adds a sync or async task to the queue. Always returns a promise.
    */ async add(fn, options = {}) {
        return new Promise((resolve, reject)=>{
            const run = async ()=>{
                this._pendingCount++;
                this._intervalCount++;
                try {
                    const operation = this._timeout === undefined && options.timeout === undefined ? fn() : p_timeout_1.default(Promise.resolve(fn()), options.timeout === undefined ? this._timeout : options.timeout, ()=>{
                        if (options.throwOnTimeout === undefined ? this._throwOnTimeout : options.throwOnTimeout) {
                            reject(timeoutError);
                        }
                        return undefined;
                    });
                    resolve(await operation);
                } catch (error) {
                    reject(error);
                }
                this._next();
            };
            this._queue.enqueue(run, options);
            this._tryToStartAnother();
            this.emit('add');
        });
    }
    /**
    Same as `.add()`, but accepts an array of sync or async functions.

    @returns A promise that resolves when all functions are resolved.
    */ async addAll(functions, options) {
        return Promise.all(functions.map(async (function_)=>this.add(function_, options)));
    }
    /**
    Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
    */ start() {
        if (!this._isPaused) {
            return this;
        }
        this._isPaused = false;
        this._processQueue();
        return this;
    }
    /**
    Put queue execution on hold.
    */ pause() {
        this._isPaused = true;
    }
    /**
    Clear the queue.
    */ clear() {
        this._queue = new this._queueClass();
    }
    /**
    Can be called multiple times. Useful if you for example add additional items at a later time.

    @returns A promise that settles when the queue becomes empty.
    */ async onEmpty() {
        // Instantly resolve if the queue is empty
        if (this._queue.size === 0) {
            return;
        }
        return new Promise((resolve)=>{
            const existingResolve = this._resolveEmpty;
            this._resolveEmpty = ()=>{
                existingResolve();
                resolve();
            };
        });
    }
    /**
    The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.

    @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
    */ async onIdle() {
        // Instantly resolve if none pending and if nothing else is queued
        if (this._pendingCount === 0 && this._queue.size === 0) {
            return;
        }
        return new Promise((resolve)=>{
            const existingResolve = this._resolveIdle;
            this._resolveIdle = ()=>{
                existingResolve();
                resolve();
            };
        });
    }
    /**
    Size of the queue.
    */ get size() {
        return this._queue.size;
    }
    /**
    Size of the queue, filtered by the given options.

    For example, this can be used to find the number of items remaining in the queue with a specific priority level.
    */ sizeBy(options) {
        // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
        return this._queue.filter(options).length;
    }
    /**
    Number of pending promises.
    */ get pending() {
        return this._pendingCount;
    }
    /**
    Whether the queue is currently paused.
    */ get isPaused() {
        return this._isPaused;
    }
    get timeout() {
        return this._timeout;
    }
    /**
    Set the timeout for future operations.
    */ set timeout(milliseconds) {
        this._timeout = milliseconds;
    }
}
exports.default = PQueue;
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "encodePointer",
    ()=>encodePointer,
    "escapePointer",
    ()=>escapePointer
]);
function encodePointer(p) {
    return encodeURI(escapePointer(p));
}
function escapePointer(p) {
    return p.replace(/~/g, '~0').replace(/\//g, '~1');
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dereference",
    ()=>dereference,
    "ignoredKeyword",
    ()=>ignoredKeyword,
    "initialBaseURI",
    ()=>initialBaseURI,
    "schemaArrayKeyword",
    ()=>schemaArrayKeyword,
    "schemaKeyword",
    ()=>schemaKeyword,
    "schemaMapKeyword",
    ()=>schemaMapKeyword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js [instrumentation] (ecmascript)");
;
const schemaKeyword = {
    additionalItems: true,
    unevaluatedItems: true,
    items: true,
    contains: true,
    additionalProperties: true,
    unevaluatedProperties: true,
    propertyNames: true,
    not: true,
    if: true,
    then: true,
    else: true
};
const schemaArrayKeyword = {
    prefixItems: true,
    items: true,
    allOf: true,
    anyOf: true,
    oneOf: true
};
const schemaMapKeyword = {
    $defs: true,
    definitions: true,
    properties: true,
    patternProperties: true,
    dependentSchemas: true
};
const ignoredKeyword = {
    id: true,
    $id: true,
    $ref: true,
    $schema: true,
    $anchor: true,
    $vocabulary: true,
    $comment: true,
    default: true,
    enum: true,
    const: true,
    required: true,
    type: true,
    maximum: true,
    minimum: true,
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    multipleOf: true,
    maxLength: true,
    minLength: true,
    pattern: true,
    format: true,
    maxItems: true,
    minItems: true,
    uniqueItems: true,
    maxProperties: true,
    minProperties: true
};
let initialBaseURI = typeof self !== 'undefined' && self.location && self.location.origin !== 'null' ? new URL(self.location.origin + self.location.pathname + location.search) : new URL('https://github.com/cfworker');
function dereference(schema, lookup = Object.create(null), baseURI = initialBaseURI, basePointer = '') {
    if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
        const id = schema.$id || schema.id;
        if (id) {
            const url = new URL(id, baseURI.href);
            if (url.hash.length > 1) {
                lookup[url.href] = schema;
            } else {
                url.hash = '';
                if (basePointer === '') {
                    baseURI = url;
                } else {
                    dereference(schema, lookup, baseURI);
                }
            }
        }
    } else if (schema !== true && schema !== false) {
        return lookup;
    }
    const schemaURI = baseURI.href + (basePointer ? '#' + basePointer : '');
    if (lookup[schemaURI] !== undefined) {
        throw new Error(`Duplicate schema URI "${schemaURI}".`);
    }
    lookup[schemaURI] = schema;
    if (schema === true || schema === false) {
        return lookup;
    }
    if (schema.__absolute_uri__ === undefined) {
        Object.defineProperty(schema, '__absolute_uri__', {
            enumerable: false,
            value: schemaURI
        });
    }
    if (schema.$ref && schema.__absolute_ref__ === undefined) {
        const url = new URL(schema.$ref, baseURI.href);
        url.hash = url.hash;
        Object.defineProperty(schema, '__absolute_ref__', {
            enumerable: false,
            value: url.href
        });
    }
    if (schema.$recursiveRef && schema.__absolute_recursive_ref__ === undefined) {
        const url = new URL(schema.$recursiveRef, baseURI.href);
        url.hash = url.hash;
        Object.defineProperty(schema, '__absolute_recursive_ref__', {
            enumerable: false,
            value: url.href
        });
    }
    if (schema.$anchor) {
        const url = new URL('#' + schema.$anchor, baseURI.href);
        lookup[url.href] = schema;
    }
    for(let key in schema){
        if (ignoredKeyword[key]) {
            continue;
        }
        const keyBase = `${basePointer}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
        const subSchema = schema[key];
        if (Array.isArray(subSchema)) {
            if (schemaArrayKeyword[key]) {
                const length = subSchema.length;
                for(let i = 0; i < length; i++){
                    dereference(subSchema[i], lookup, baseURI, `${keyBase}/${i}`);
                }
            }
        } else if (schemaMapKeyword[key]) {
            for(let subKey in subSchema){
                dereference(subSchema[subKey], lookup, baseURI, `${keyBase}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(subKey)}`);
            }
        } else {
            dereference(subSchema, lookup, baseURI, keyBase);
        }
    }
    return lookup;
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "format",
    ()=>format
]);
const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
const DAYS = [
    0,
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
];
const TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
const HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
const URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
const URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
const URL_ = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
const UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
const JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
const RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
const EMAIL = (input)=>{
    if (input[0] === '"') return false;
    const [name, host, ...rest] = input.split('@');
    if (!name || !host || rest.length !== 0 || name.length > 64 || host.length > 253) return false;
    if (name[0] === '.' || name.endsWith('.') || name.includes('..')) return false;
    if (!/^[a-z0-9.-]+$/i.test(host) || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(name)) return false;
    return host.split('.').every((part)=>/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(part));
};
const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const IPV6 = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i;
const DURATION = (input)=>input.length > 1 && input.length < 80 && (/^P\d+([.,]\d+)?W$/.test(input) || /^P[\dYMDTHS]*(\d[.,]\d+)?[YMDHS]$/.test(input) && /^P([.,\d]+Y)?([.,\d]+M)?([.,\d]+D)?(T([.,\d]+H)?([.,\d]+M)?([.,\d]+S)?)?$/.test(input));
function bind(r) {
    return r.test.bind(r);
}
const format = {
    date,
    time: time.bind(undefined, false),
    'date-time': date_time,
    duration: DURATION,
    uri,
    'uri-reference': bind(URIREF),
    'uri-template': bind(URITEMPLATE),
    url: bind(URL_),
    email: EMAIL,
    hostname: bind(HOSTNAME),
    ipv4: bind(IPV4),
    ipv6: bind(IPV6),
    regex: regex,
    uuid: bind(UUID),
    'json-pointer': bind(JSON_POINTER),
    'json-pointer-uri-fragment': bind(JSON_POINTER_URI_FRAGMENT),
    'relative-json-pointer': bind(RELATIVE_JSON_POINTER)
};
function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function date(str) {
    const matches = str.match(DATE);
    if (!matches) return false;
    const year = +matches[1];
    const month = +matches[2];
    const day = +matches[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
}
function time(full, str) {
    const matches = str.match(TIME);
    if (!matches) return false;
    const hour = +matches[1];
    const minute = +matches[2];
    const second = +matches[3];
    const timeZone = !!matches[5];
    return (hour <= 23 && minute <= 59 && second <= 59 || hour == 23 && minute == 59 && second == 60) && (!full || timeZone);
}
const DATE_TIME_SEPARATOR = /t|\s/i;
function date_time(str) {
    const dateTime = str.split(DATE_TIME_SEPARATOR);
    return dateTime.length == 2 && date(dateTime[0]) && time(true, dateTime[1]);
}
const NOT_URI_FRAGMENT = /\/|:/;
const URI_PATTERN = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
function uri(str) {
    return NOT_URI_FRAGMENT.test(str) && URI_PATTERN.test(str);
}
const Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
    if (Z_ANCHOR.test(str)) return false;
    try {
        new RegExp(str, 'u');
        return true;
    } catch (e) {
        return false;
    }
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/types.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OutputFormat",
    ()=>OutputFormat
]);
var OutputFormat;
(function(OutputFormat) {
    OutputFormat[OutputFormat["Flag"] = 1] = "Flag";
    OutputFormat[OutputFormat["Basic"] = 2] = "Basic";
    OutputFormat[OutputFormat["Detailed"] = 4] = "Detailed";
})(OutputFormat || (OutputFormat = {}));
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deepCompareStrict",
    ()=>deepCompareStrict
]);
function deepCompareStrict(a, b) {
    const typeofa = typeof a;
    if (typeofa !== typeof b) {
        return false;
    }
    if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
            return false;
        }
        const length = a.length;
        if (length !== b.length) {
            return false;
        }
        for(let i = 0; i < length; i++){
            if (!deepCompareStrict(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    if (typeofa === 'object') {
        if (!a || !b) {
            return a === b;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        const length = aKeys.length;
        if (length !== bKeys.length) {
            return false;
        }
        for (const k of aKeys){
            if (!deepCompareStrict(a[k], b[k])) {
                return false;
            }
        }
        return true;
    }
    return a === b;
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ucs2length",
    ()=>ucs2length
]);
function ucs2length(s) {
    let result = 0;
    let length = s.length;
    let index = 0;
    let charCode;
    while(index < length){
        result++;
        charCode = s.charCodeAt(index++);
        if (charCode >= 0xd800 && charCode <= 0xdbff && index < length) {
            charCode = s.charCodeAt(index);
            if ((charCode & 0xfc00) == 0xdc00) {
                index++;
            }
        }
    }
    return result;
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validate",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$ucs2$2d$length$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js [instrumentation] (ecmascript)");
;
;
;
;
;
function validate(instance, schema, draft = '2019-09', lookup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["dereference"])(schema), shortCircuit = true, recursiveAnchor = null, instanceLocation = '#', schemaLocation = '#', evaluated = Object.create(null)) {
    if (schema === true) {
        return {
            valid: true,
            errors: []
        };
    }
    if (schema === false) {
        return {
            valid: false,
            errors: [
                {
                    instanceLocation,
                    keyword: 'false',
                    keywordLocation: instanceLocation,
                    error: 'False boolean schema.'
                }
            ]
        };
    }
    const rawInstanceType = typeof instance;
    let instanceType;
    switch(rawInstanceType){
        case 'boolean':
        case 'number':
        case 'string':
            instanceType = rawInstanceType;
            break;
        case 'object':
            if (instance === null) {
                instanceType = 'null';
            } else if (Array.isArray(instance)) {
                instanceType = 'array';
            } else {
                instanceType = 'object';
            }
            break;
        default:
            throw new Error(`Instances of "${rawInstanceType}" type are not supported.`);
    }
    const { $ref, $recursiveRef, $recursiveAnchor, type: $type, const: $const, enum: $enum, required: $required, not: $not, anyOf: $anyOf, allOf: $allOf, oneOf: $oneOf, if: $if, then: $then, else: $else, format: $format, properties: $properties, patternProperties: $patternProperties, additionalProperties: $additionalProperties, unevaluatedProperties: $unevaluatedProperties, minProperties: $minProperties, maxProperties: $maxProperties, propertyNames: $propertyNames, dependentRequired: $dependentRequired, dependentSchemas: $dependentSchemas, dependencies: $dependencies, prefixItems: $prefixItems, items: $items, additionalItems: $additionalItems, unevaluatedItems: $unevaluatedItems, contains: $contains, minContains: $minContains, maxContains: $maxContains, minItems: $minItems, maxItems: $maxItems, uniqueItems: $uniqueItems, minimum: $minimum, maximum: $maximum, exclusiveMinimum: $exclusiveMinimum, exclusiveMaximum: $exclusiveMaximum, multipleOf: $multipleOf, minLength: $minLength, maxLength: $maxLength, pattern: $pattern, __absolute_ref__, __absolute_recursive_ref__ } = schema;
    const errors = [];
    if ($recursiveAnchor === true && recursiveAnchor === null) {
        recursiveAnchor = schema;
    }
    if ($recursiveRef === '#') {
        const refSchema = recursiveAnchor === null ? lookup[__absolute_recursive_ref__] : recursiveAnchor;
        const keywordLocation = `${schemaLocation}/$recursiveRef`;
        const result = validate(instance, recursiveAnchor === null ? schema : recursiveAnchor, draft, lookup, shortCircuit, refSchema, instanceLocation, keywordLocation, evaluated);
        if (!result.valid) {
            errors.push({
                instanceLocation,
                keyword: '$recursiveRef',
                keywordLocation,
                error: 'A subschema had errors.'
            }, ...result.errors);
        }
    }
    if ($ref !== undefined) {
        const uri = __absolute_ref__ || $ref;
        const refSchema = lookup[uri];
        if (refSchema === undefined) {
            let message = `Unresolved $ref "${$ref}".`;
            if (__absolute_ref__ && __absolute_ref__ !== $ref) {
                message += `  Absolute URI "${__absolute_ref__}".`;
            }
            message += `\nKnown schemas:\n- ${Object.keys(lookup).join('\n- ')}`;
            throw new Error(message);
        }
        const keywordLocation = `${schemaLocation}/$ref`;
        const result = validate(instance, refSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated);
        if (!result.valid) {
            errors.push({
                instanceLocation,
                keyword: '$ref',
                keywordLocation,
                error: 'A subschema had errors.'
            }, ...result.errors);
        }
        if (draft === '4' || draft === '7') {
            return {
                valid: errors.length === 0,
                errors
            };
        }
    }
    if (Array.isArray($type)) {
        let length = $type.length;
        let valid = false;
        for(let i = 0; i < length; i++){
            if (instanceType === $type[i] || $type[i] === 'integer' && instanceType === 'number' && instance % 1 === 0 && instance === instance) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            errors.push({
                instanceLocation,
                keyword: 'type',
                keywordLocation: `${schemaLocation}/type`,
                error: `Instance type "${instanceType}" is invalid. Expected "${$type.join('", "')}".`
            });
        }
    } else if ($type === 'integer') {
        if (instanceType !== 'number' || instance % 1 || instance !== instance) {
            errors.push({
                instanceLocation,
                keyword: 'type',
                keywordLocation: `${schemaLocation}/type`,
                error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
            });
        }
    } else if ($type !== undefined && instanceType !== $type) {
        errors.push({
            instanceLocation,
            keyword: 'type',
            keywordLocation: `${schemaLocation}/type`,
            error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
        });
    }
    if ($const !== undefined) {
        if (instanceType === 'object' || instanceType === 'array') {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["deepCompareStrict"])(instance, $const)) {
                errors.push({
                    instanceLocation,
                    keyword: 'const',
                    keywordLocation: `${schemaLocation}/const`,
                    error: `Instance does not match ${JSON.stringify($const)}.`
                });
            }
        } else if (instance !== $const) {
            errors.push({
                instanceLocation,
                keyword: 'const',
                keywordLocation: `${schemaLocation}/const`,
                error: `Instance does not match ${JSON.stringify($const)}.`
            });
        }
    }
    if ($enum !== undefined) {
        if (instanceType === 'object' || instanceType === 'array') {
            if (!$enum.some((value)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["deepCompareStrict"])(instance, value))) {
                errors.push({
                    instanceLocation,
                    keyword: 'enum',
                    keywordLocation: `${schemaLocation}/enum`,
                    error: `Instance does not match any of ${JSON.stringify($enum)}.`
                });
            }
        } else if (!$enum.some((value)=>instance === value)) {
            errors.push({
                instanceLocation,
                keyword: 'enum',
                keywordLocation: `${schemaLocation}/enum`,
                error: `Instance does not match any of ${JSON.stringify($enum)}.`
            });
        }
    }
    if ($not !== undefined) {
        const keywordLocation = `${schemaLocation}/not`;
        const result = validate(instance, $not, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation);
        if (result.valid) {
            errors.push({
                instanceLocation,
                keyword: 'not',
                keywordLocation,
                error: 'Instance matched "not" schema.'
            });
        }
    }
    let subEvaluateds = [];
    if ($anyOf !== undefined) {
        const keywordLocation = `${schemaLocation}/anyOf`;
        const errorsLength = errors.length;
        let anyValid = false;
        for(let i = 0; i < $anyOf.length; i++){
            const subSchema = $anyOf[i];
            const subEvaluated = Object.create(evaluated);
            const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
            errors.push(...result.errors);
            anyValid = anyValid || result.valid;
            if (result.valid) {
                subEvaluateds.push(subEvaluated);
            }
        }
        if (anyValid) {
            errors.length = errorsLength;
        } else {
            errors.splice(errorsLength, 0, {
                instanceLocation,
                keyword: 'anyOf',
                keywordLocation,
                error: 'Instance does not match any subschemas.'
            });
        }
    }
    if ($allOf !== undefined) {
        const keywordLocation = `${schemaLocation}/allOf`;
        const errorsLength = errors.length;
        let allValid = true;
        for(let i = 0; i < $allOf.length; i++){
            const subSchema = $allOf[i];
            const subEvaluated = Object.create(evaluated);
            const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
            errors.push(...result.errors);
            allValid = allValid && result.valid;
            if (result.valid) {
                subEvaluateds.push(subEvaluated);
            }
        }
        if (allValid) {
            errors.length = errorsLength;
        } else {
            errors.splice(errorsLength, 0, {
                instanceLocation,
                keyword: 'allOf',
                keywordLocation,
                error: `Instance does not match every subschema.`
            });
        }
    }
    if ($oneOf !== undefined) {
        const keywordLocation = `${schemaLocation}/oneOf`;
        const errorsLength = errors.length;
        const matches = $oneOf.filter((subSchema, i)=>{
            const subEvaluated = Object.create(evaluated);
            const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
            errors.push(...result.errors);
            if (result.valid) {
                subEvaluateds.push(subEvaluated);
            }
            return result.valid;
        }).length;
        if (matches === 1) {
            errors.length = errorsLength;
        } else {
            errors.splice(errorsLength, 0, {
                instanceLocation,
                keyword: 'oneOf',
                keywordLocation,
                error: `Instance does not match exactly one subschema (${matches} matches).`
            });
        }
    }
    if (instanceType === 'object' || instanceType === 'array') {
        Object.assign(evaluated, ...subEvaluateds);
    }
    if ($if !== undefined) {
        const keywordLocation = `${schemaLocation}/if`;
        const conditionResult = validate(instance, $if, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated).valid;
        if (conditionResult) {
            if ($then !== undefined) {
                const thenResult = validate(instance, $then, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/then`, evaluated);
                if (!thenResult.valid) {
                    errors.push({
                        instanceLocation,
                        keyword: 'if',
                        keywordLocation,
                        error: `Instance does not match "then" schema.`
                    }, ...thenResult.errors);
                }
            }
        } else if ($else !== undefined) {
            const elseResult = validate(instance, $else, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/else`, evaluated);
            if (!elseResult.valid) {
                errors.push({
                    instanceLocation,
                    keyword: 'if',
                    keywordLocation,
                    error: `Instance does not match "else" schema.`
                }, ...elseResult.errors);
            }
        }
    }
    if (instanceType === 'object') {
        if ($required !== undefined) {
            for (const key of $required){
                if (!(key in instance)) {
                    errors.push({
                        instanceLocation,
                        keyword: 'required',
                        keywordLocation: `${schemaLocation}/required`,
                        error: `Instance does not have required property "${key}".`
                    });
                }
            }
        }
        const keys = Object.keys(instance);
        if ($minProperties !== undefined && keys.length < $minProperties) {
            errors.push({
                instanceLocation,
                keyword: 'minProperties',
                keywordLocation: `${schemaLocation}/minProperties`,
                error: `Instance does not have at least ${$minProperties} properties.`
            });
        }
        if ($maxProperties !== undefined && keys.length > $maxProperties) {
            errors.push({
                instanceLocation,
                keyword: 'maxProperties',
                keywordLocation: `${schemaLocation}/maxProperties`,
                error: `Instance does not have at least ${$maxProperties} properties.`
            });
        }
        if ($propertyNames !== undefined) {
            const keywordLocation = `${schemaLocation}/propertyNames`;
            for(const key in instance){
                const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
                const result = validate(key, $propertyNames, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
                if (!result.valid) {
                    errors.push({
                        instanceLocation,
                        keyword: 'propertyNames',
                        keywordLocation,
                        error: `Property name "${key}" does not match schema.`
                    }, ...result.errors);
                }
            }
        }
        if ($dependentRequired !== undefined) {
            const keywordLocation = `${schemaLocation}/dependantRequired`;
            for(const key in $dependentRequired){
                if (key in instance) {
                    const required = $dependentRequired[key];
                    for (const dependantKey of required){
                        if (!(dependantKey in instance)) {
                            errors.push({
                                instanceLocation,
                                keyword: 'dependentRequired',
                                keywordLocation,
                                error: `Instance has "${key}" but does not have "${dependantKey}".`
                            });
                        }
                    }
                }
            }
        }
        if ($dependentSchemas !== undefined) {
            for(const key in $dependentSchemas){
                const keywordLocation = `${schemaLocation}/dependentSchemas`;
                if (key in instance) {
                    const result = validate(instance, $dependentSchemas[key], draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`, evaluated);
                    if (!result.valid) {
                        errors.push({
                            instanceLocation,
                            keyword: 'dependentSchemas',
                            keywordLocation,
                            error: `Instance has "${key}" but does not match dependant schema.`
                        }, ...result.errors);
                    }
                }
            }
        }
        if ($dependencies !== undefined) {
            const keywordLocation = `${schemaLocation}/dependencies`;
            for(const key in $dependencies){
                if (key in instance) {
                    const propsOrSchema = $dependencies[key];
                    if (Array.isArray(propsOrSchema)) {
                        for (const dependantKey of propsOrSchema){
                            if (!(dependantKey in instance)) {
                                errors.push({
                                    instanceLocation,
                                    keyword: 'dependencies',
                                    keywordLocation,
                                    error: `Instance has "${key}" but does not have "${dependantKey}".`
                                });
                            }
                        }
                    } else {
                        const result = validate(instance, propsOrSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`);
                        if (!result.valid) {
                            errors.push({
                                instanceLocation,
                                keyword: 'dependencies',
                                keywordLocation,
                                error: `Instance has "${key}" but does not match dependant schema.`
                            }, ...result.errors);
                        }
                    }
                }
            }
        }
        const thisEvaluated = Object.create(null);
        let stop = false;
        if ($properties !== undefined) {
            const keywordLocation = `${schemaLocation}/properties`;
            for(const key in $properties){
                if (!(key in instance)) {
                    continue;
                }
                const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
                const result = validate(instance[key], $properties[key], draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`);
                if (result.valid) {
                    evaluated[key] = thisEvaluated[key] = true;
                } else {
                    stop = shortCircuit;
                    errors.push({
                        instanceLocation,
                        keyword: 'properties',
                        keywordLocation,
                        error: `Property "${key}" does not match schema.`
                    }, ...result.errors);
                    if (stop) break;
                }
            }
        }
        if (!stop && $patternProperties !== undefined) {
            const keywordLocation = `${schemaLocation}/patternProperties`;
            for(const pattern in $patternProperties){
                const regex = new RegExp(pattern, 'u');
                const subSchema = $patternProperties[pattern];
                for(const key in instance){
                    if (!regex.test(key)) {
                        continue;
                    }
                    const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
                    const result = validate(instance[key], subSchema, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(pattern)}`);
                    if (result.valid) {
                        evaluated[key] = thisEvaluated[key] = true;
                    } else {
                        stop = shortCircuit;
                        errors.push({
                            instanceLocation,
                            keyword: 'patternProperties',
                            keywordLocation,
                            error: `Property "${key}" matches pattern "${pattern}" but does not match associated schema.`
                        }, ...result.errors);
                    }
                }
            }
        }
        if (!stop && $additionalProperties !== undefined) {
            const keywordLocation = `${schemaLocation}/additionalProperties`;
            for(const key in instance){
                if (thisEvaluated[key]) {
                    continue;
                }
                const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
                const result = validate(instance[key], $additionalProperties, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
                if (result.valid) {
                    evaluated[key] = true;
                } else {
                    stop = shortCircuit;
                    errors.push({
                        instanceLocation,
                        keyword: 'additionalProperties',
                        keywordLocation,
                        error: `Property "${key}" does not match additional properties schema.`
                    }, ...result.errors);
                }
            }
        } else if (!stop && $unevaluatedProperties !== undefined) {
            const keywordLocation = `${schemaLocation}/unevaluatedProperties`;
            for(const key in instance){
                if (!evaluated[key]) {
                    const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
                    const result = validate(instance[key], $unevaluatedProperties, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
                    if (result.valid) {
                        evaluated[key] = true;
                    } else {
                        errors.push({
                            instanceLocation,
                            keyword: 'unevaluatedProperties',
                            keywordLocation,
                            error: `Property "${key}" does not match unevaluated properties schema.`
                        }, ...result.errors);
                    }
                }
            }
        }
    } else if (instanceType === 'array') {
        if ($maxItems !== undefined && instance.length > $maxItems) {
            errors.push({
                instanceLocation,
                keyword: 'maxItems',
                keywordLocation: `${schemaLocation}/maxItems`,
                error: `Array has too many items (${instance.length} > ${$maxItems}).`
            });
        }
        if ($minItems !== undefined && instance.length < $minItems) {
            errors.push({
                instanceLocation,
                keyword: 'minItems',
                keywordLocation: `${schemaLocation}/minItems`,
                error: `Array has too few items (${instance.length} < ${$minItems}).`
            });
        }
        const length = instance.length;
        let i = 0;
        let stop = false;
        if ($prefixItems !== undefined) {
            const keywordLocation = `${schemaLocation}/prefixItems`;
            const length2 = Math.min($prefixItems.length, length);
            for(; i < length2; i++){
                const result = validate(instance[i], $prefixItems[i], draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
                evaluated[i] = true;
                if (!result.valid) {
                    stop = shortCircuit;
                    errors.push({
                        instanceLocation,
                        keyword: 'prefixItems',
                        keywordLocation,
                        error: `Items did not match schema.`
                    }, ...result.errors);
                    if (stop) break;
                }
            }
        }
        if ($items !== undefined) {
            const keywordLocation = `${schemaLocation}/items`;
            if (Array.isArray($items)) {
                const length2 = Math.min($items.length, length);
                for(; i < length2; i++){
                    const result = validate(instance[i], $items[i], draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
                    evaluated[i] = true;
                    if (!result.valid) {
                        stop = shortCircuit;
                        errors.push({
                            instanceLocation,
                            keyword: 'items',
                            keywordLocation,
                            error: `Items did not match schema.`
                        }, ...result.errors);
                        if (stop) break;
                    }
                }
            } else {
                for(; i < length; i++){
                    const result = validate(instance[i], $items, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
                    evaluated[i] = true;
                    if (!result.valid) {
                        stop = shortCircuit;
                        errors.push({
                            instanceLocation,
                            keyword: 'items',
                            keywordLocation,
                            error: `Items did not match schema.`
                        }, ...result.errors);
                        if (stop) break;
                    }
                }
            }
            if (!stop && $additionalItems !== undefined) {
                const keywordLocation = `${schemaLocation}/additionalItems`;
                for(; i < length; i++){
                    const result = validate(instance[i], $additionalItems, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
                    evaluated[i] = true;
                    if (!result.valid) {
                        stop = shortCircuit;
                        errors.push({
                            instanceLocation,
                            keyword: 'additionalItems',
                            keywordLocation,
                            error: `Items did not match additional items schema.`
                        }, ...result.errors);
                    }
                }
            }
        }
        if ($contains !== undefined) {
            if (length === 0 && $minContains === undefined) {
                errors.push({
                    instanceLocation,
                    keyword: 'contains',
                    keywordLocation: `${schemaLocation}/contains`,
                    error: `Array is empty. It must contain at least one item matching the schema.`
                });
            } else if ($minContains !== undefined && length < $minContains) {
                errors.push({
                    instanceLocation,
                    keyword: 'minContains',
                    keywordLocation: `${schemaLocation}/minContains`,
                    error: `Array has less items (${length}) than minContains (${$minContains}).`
                });
            } else {
                const keywordLocation = `${schemaLocation}/contains`;
                const errorsLength = errors.length;
                let contained = 0;
                for(let j = 0; j < length; j++){
                    const result = validate(instance[j], $contains, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${j}`, keywordLocation);
                    if (result.valid) {
                        evaluated[j] = true;
                        contained++;
                    } else {
                        errors.push(...result.errors);
                    }
                }
                if (contained >= ($minContains || 0)) {
                    errors.length = errorsLength;
                }
                if ($minContains === undefined && $maxContains === undefined && contained === 0) {
                    errors.splice(errorsLength, 0, {
                        instanceLocation,
                        keyword: 'contains',
                        keywordLocation,
                        error: `Array does not contain item matching schema.`
                    });
                } else if ($minContains !== undefined && contained < $minContains) {
                    errors.push({
                        instanceLocation,
                        keyword: 'minContains',
                        keywordLocation: `${schemaLocation}/minContains`,
                        error: `Array must contain at least ${$minContains} items matching schema. Only ${contained} items were found.`
                    });
                } else if ($maxContains !== undefined && contained > $maxContains) {
                    errors.push({
                        instanceLocation,
                        keyword: 'maxContains',
                        keywordLocation: `${schemaLocation}/maxContains`,
                        error: `Array may contain at most ${$maxContains} items matching schema. ${contained} items were found.`
                    });
                }
            }
        }
        if (!stop && $unevaluatedItems !== undefined) {
            const keywordLocation = `${schemaLocation}/unevaluatedItems`;
            for(i; i < length; i++){
                if (evaluated[i]) {
                    continue;
                }
                const result = validate(instance[i], $unevaluatedItems, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
                evaluated[i] = true;
                if (!result.valid) {
                    errors.push({
                        instanceLocation,
                        keyword: 'unevaluatedItems',
                        keywordLocation,
                        error: `Items did not match unevaluated items schema.`
                    }, ...result.errors);
                }
            }
        }
        if ($uniqueItems) {
            for(let j = 0; j < length; j++){
                const a = instance[j];
                const ao = typeof a === 'object' && a !== null;
                for(let k = 0; k < length; k++){
                    if (j === k) {
                        continue;
                    }
                    const b = instance[k];
                    const bo = typeof b === 'object' && b !== null;
                    if (a === b || ao && bo && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["deepCompareStrict"])(a, b)) {
                        errors.push({
                            instanceLocation,
                            keyword: 'uniqueItems',
                            keywordLocation: `${schemaLocation}/uniqueItems`,
                            error: `Duplicate items at indexes ${j} and ${k}.`
                        });
                        j = Number.MAX_SAFE_INTEGER;
                        k = Number.MAX_SAFE_INTEGER;
                    }
                }
            }
        }
    } else if (instanceType === 'number') {
        if (draft === '4') {
            if ($minimum !== undefined && ($exclusiveMinimum === true && instance <= $minimum || instance < $minimum)) {
                errors.push({
                    instanceLocation,
                    keyword: 'minimum',
                    keywordLocation: `${schemaLocation}/minimum`,
                    error: `${instance} is less than ${$exclusiveMinimum ? 'or equal to ' : ''} ${$minimum}.`
                });
            }
            if ($maximum !== undefined && ($exclusiveMaximum === true && instance >= $maximum || instance > $maximum)) {
                errors.push({
                    instanceLocation,
                    keyword: 'maximum',
                    keywordLocation: `${schemaLocation}/maximum`,
                    error: `${instance} is greater than ${$exclusiveMaximum ? 'or equal to ' : ''} ${$maximum}.`
                });
            }
        } else {
            if ($minimum !== undefined && instance < $minimum) {
                errors.push({
                    instanceLocation,
                    keyword: 'minimum',
                    keywordLocation: `${schemaLocation}/minimum`,
                    error: `${instance} is less than ${$minimum}.`
                });
            }
            if ($maximum !== undefined && instance > $maximum) {
                errors.push({
                    instanceLocation,
                    keyword: 'maximum',
                    keywordLocation: `${schemaLocation}/maximum`,
                    error: `${instance} is greater than ${$maximum}.`
                });
            }
            if ($exclusiveMinimum !== undefined && instance <= $exclusiveMinimum) {
                errors.push({
                    instanceLocation,
                    keyword: 'exclusiveMinimum',
                    keywordLocation: `${schemaLocation}/exclusiveMinimum`,
                    error: `${instance} is less than ${$exclusiveMinimum}.`
                });
            }
            if ($exclusiveMaximum !== undefined && instance >= $exclusiveMaximum) {
                errors.push({
                    instanceLocation,
                    keyword: 'exclusiveMaximum',
                    keywordLocation: `${schemaLocation}/exclusiveMaximum`,
                    error: `${instance} is greater than or equal to ${$exclusiveMaximum}.`
                });
            }
        }
        if ($multipleOf !== undefined) {
            const remainder = instance % $multipleOf;
            if (Math.abs(0 - remainder) >= 1.1920929e-7 && Math.abs($multipleOf - remainder) >= 1.1920929e-7) {
                errors.push({
                    instanceLocation,
                    keyword: 'multipleOf',
                    keywordLocation: `${schemaLocation}/multipleOf`,
                    error: `${instance} is not a multiple of ${$multipleOf}.`
                });
            }
        }
    } else if (instanceType === 'string') {
        const length = $minLength === undefined && $maxLength === undefined ? 0 : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$ucs2$2d$length$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ucs2length"])(instance);
        if ($minLength !== undefined && length < $minLength) {
            errors.push({
                instanceLocation,
                keyword: 'minLength',
                keywordLocation: `${schemaLocation}/minLength`,
                error: `String is too short (${length} < ${$minLength}).`
            });
        }
        if ($maxLength !== undefined && length > $maxLength) {
            errors.push({
                instanceLocation,
                keyword: 'maxLength',
                keywordLocation: `${schemaLocation}/maxLength`,
                error: `String is too long (${length} > ${$maxLength}).`
            });
        }
        if ($pattern !== undefined && !new RegExp($pattern, 'u').test(instance)) {
            errors.push({
                instanceLocation,
                keyword: 'pattern',
                keywordLocation: `${schemaLocation}/pattern`,
                error: `String does not match pattern.`
            });
        }
        if ($format !== undefined && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["format"][$format] && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["format"][$format](instance)) {
            errors.push({
                instanceLocation,
                keyword: 'format',
                keywordLocation: `${schemaLocation}/format`,
                error: `String does not match format "${$format}".`
            });
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Validator",
    ()=>Validator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [instrumentation] (ecmascript)");
;
;
class Validator {
    schema;
    draft;
    shortCircuit;
    lookup;
    constructor(schema, draft = '2019-09', shortCircuit = true){
        this.schema = schema;
        this.draft = draft;
        this.shortCircuit = shortCircuit;
        this.lookup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["dereference"])(schema);
    }
    validate(instance) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["validate"])(instance, this.schema, this.draft, this.lookup, this.shortCircuit);
    }
    addSchema(schema, id) {
        if (id) {
            schema = {
                ...schema,
                $id: id
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["dereference"])(schema, this.lookup);
    }
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/types.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validator$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for(var i = 0, len = code.length; i < len; ++i){
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
}
// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;
function getLens(b64) {
    var len = b64.length;
    if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
    }
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf('=');
    if (validLen === -1) validLen = len;
    var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
    return [
        validLen,
        placeHoldersLen
    ];
}
// base64 is 4/3 + up to two characters of the original data
function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function _byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i;
    for(i = 0; i < len; i += 4){
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 0xFF;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    return arr;
}
function tripletToBase64(num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}
function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for(var i = start; i < end; i += 3){
        tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
        output.push(tripletToBase64(tmp));
    }
    return output.join('');
}
function fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    ;
    var parts = [];
    var maxChunkLength = 16383 // must be multiple of 3
    ;
    // go through the array every three bytes, we'll deal with trailing stuff later
    for(var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength){
        parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    }
    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
    } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
    }
    return parts.join('');
}
}),
"[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tiktoken",
    ()=>Tiktoken,
    "getEncodingNameForModel",
    ()=>getEncodingNameForModel,
    "never",
    ()=>never
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$base64$2d$js$40$1$2e$5$2e$1$2f$node_modules$2f$base64$2d$js$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js [instrumentation] (ecmascript)");
;
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value)=>key in obj ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
    }) : obj[key] = value;
var __publicField = (obj, key, value)=>{
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
};
// src/utils.ts
function never(_) {}
function bytePairMerge(piece, ranks) {
    let parts = Array.from({
        length: piece.length
    }, (_, i)=>({
            start: i,
            end: i + 1
        }));
    while(parts.length > 1){
        let minRank = null;
        for(let i = 0; i < parts.length - 1; i++){
            const slice = piece.slice(parts[i].start, parts[i + 1].end);
            const rank = ranks.get(slice.join(","));
            if (rank == null) continue;
            if (minRank == null || rank < minRank[0]) {
                minRank = [
                    rank,
                    i
                ];
            }
        }
        if (minRank != null) {
            const i = minRank[1];
            parts[i] = {
                start: parts[i].start,
                end: parts[i + 1].end
            };
            parts.splice(i + 1, 1);
        } else {
            break;
        }
    }
    return parts;
}
function bytePairEncode(piece, ranks) {
    if (piece.length === 1) return [
        ranks.get(piece.join(","))
    ];
    return bytePairMerge(piece, ranks).map((p)=>ranks.get(piece.slice(p.start, p.end).join(","))).filter((x)=>x != null);
}
function escapeRegex(str) {
    return str.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}
var _Tiktoken = class {
    /** @internal */ specialTokens;
    /** @internal */ inverseSpecialTokens;
    /** @internal */ patStr;
    /** @internal */ textEncoder = new TextEncoder();
    /** @internal */ textDecoder = new TextDecoder("utf-8");
    /** @internal */ rankMap = /* @__PURE__ */ new Map();
    /** @internal */ textMap = /* @__PURE__ */ new Map();
    constructor(ranks, extendedSpecialTokens){
        this.patStr = ranks.pat_str;
        const uncompressed = ranks.bpe_ranks.split("\n").filter(Boolean).reduce((memo, x)=>{
            const [_, offsetStr, ...tokens] = x.split(" ");
            const offset = Number.parseInt(offsetStr, 10);
            tokens.forEach((token, i)=>memo[token] = offset + i);
            return memo;
        }, {});
        for (const [token, rank] of Object.entries(uncompressed)){
            const bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$base64$2d$js$40$1$2e$5$2e$1$2f$node_modules$2f$base64$2d$js$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"].toByteArray(token);
            this.rankMap.set(bytes.join(","), rank);
            this.textMap.set(rank, bytes);
        }
        this.specialTokens = {
            ...ranks.special_tokens,
            ...extendedSpecialTokens
        };
        this.inverseSpecialTokens = Object.entries(this.specialTokens).reduce((memo, [text, rank])=>{
            memo[rank] = this.textEncoder.encode(text);
            return memo;
        }, {});
    }
    encode(text, allowedSpecial = [], disallowedSpecial = "all") {
        const regexes = new RegExp(this.patStr, "ug");
        const specialRegex = _Tiktoken.specialTokenRegex(Object.keys(this.specialTokens));
        const ret = [];
        const allowedSpecialSet = new Set(allowedSpecial === "all" ? Object.keys(this.specialTokens) : allowedSpecial);
        const disallowedSpecialSet = new Set(disallowedSpecial === "all" ? Object.keys(this.specialTokens).filter((x)=>!allowedSpecialSet.has(x)) : disallowedSpecial);
        if (disallowedSpecialSet.size > 0) {
            const disallowedSpecialRegex = _Tiktoken.specialTokenRegex([
                ...disallowedSpecialSet
            ]);
            const specialMatch = text.match(disallowedSpecialRegex);
            if (specialMatch != null) {
                throw new Error(`The text contains a special token that is not allowed: ${specialMatch[0]}`);
            }
        }
        let start = 0;
        while(true){
            let nextSpecial = null;
            let startFind = start;
            while(true){
                specialRegex.lastIndex = startFind;
                nextSpecial = specialRegex.exec(text);
                if (nextSpecial == null || allowedSpecialSet.has(nextSpecial[0])) break;
                startFind = nextSpecial.index + 1;
            }
            const end = nextSpecial?.index ?? text.length;
            for (const match of text.substring(start, end).matchAll(regexes)){
                const piece = this.textEncoder.encode(match[0]);
                const token2 = this.rankMap.get(piece.join(","));
                if (token2 != null) {
                    ret.push(token2);
                    continue;
                }
                ret.push(...bytePairEncode(piece, this.rankMap));
            }
            if (nextSpecial == null) break;
            let token = this.specialTokens[nextSpecial[0]];
            ret.push(token);
            start = nextSpecial.index + nextSpecial[0].length;
        }
        return ret;
    }
    decode(tokens) {
        const res = [];
        let length = 0;
        for(let i2 = 0; i2 < tokens.length; ++i2){
            const token = tokens[i2];
            const bytes = this.textMap.get(token) ?? this.inverseSpecialTokens[token];
            if (bytes != null) {
                res.push(bytes);
                length += bytes.length;
            }
        }
        const mergedArray = new Uint8Array(length);
        let i = 0;
        for (const bytes of res){
            mergedArray.set(bytes, i);
            i += bytes.length;
        }
        return this.textDecoder.decode(mergedArray);
    }
};
var Tiktoken = _Tiktoken;
__publicField(Tiktoken, "specialTokenRegex", (tokens)=>{
    return new RegExp(tokens.map((i)=>escapeRegex(i)).join("|"), "g");
});
function getEncodingNameForModel(model) {
    switch(model){
        case "gpt2":
            {
                return "gpt2";
            }
        case "code-cushman-001":
        case "code-cushman-002":
        case "code-davinci-001":
        case "code-davinci-002":
        case "cushman-codex":
        case "davinci-codex":
        case "davinci-002":
        case "text-davinci-002":
        case "text-davinci-003":
            {
                return "p50k_base";
            }
        case "code-davinci-edit-001":
        case "text-davinci-edit-001":
            {
                return "p50k_edit";
            }
        case "ada":
        case "babbage":
        case "babbage-002":
        case "code-search-ada-code-001":
        case "code-search-babbage-code-001":
        case "curie":
        case "davinci":
        case "text-ada-001":
        case "text-babbage-001":
        case "text-curie-001":
        case "text-davinci-001":
        case "text-search-ada-doc-001":
        case "text-search-babbage-doc-001":
        case "text-search-curie-doc-001":
        case "text-search-davinci-doc-001":
        case "text-similarity-ada-001":
        case "text-similarity-babbage-001":
        case "text-similarity-curie-001":
        case "text-similarity-davinci-001":
            {
                return "r50k_base";
            }
        case "gpt-3.5-turbo-instruct-0914":
        case "gpt-3.5-turbo-instruct":
        case "gpt-3.5-turbo-16k-0613":
        case "gpt-3.5-turbo-16k":
        case "gpt-3.5-turbo-0613":
        case "gpt-3.5-turbo-0301":
        case "gpt-3.5-turbo":
        case "gpt-4-32k-0613":
        case "gpt-4-32k-0314":
        case "gpt-4-32k":
        case "gpt-4-0613":
        case "gpt-4-0314":
        case "gpt-4":
        case "gpt-3.5-turbo-1106":
        case "gpt-35-turbo":
        case "gpt-4-1106-preview":
        case "gpt-4-vision-preview":
        case "gpt-3.5-turbo-0125":
        case "gpt-4-turbo":
        case "gpt-4-turbo-2024-04-09":
        case "gpt-4-turbo-preview":
        case "gpt-4-0125-preview":
        case "text-embedding-ada-002":
        case "text-embedding-3-small":
        case "text-embedding-3-large":
            {
                return "cl100k_base";
            }
        case "gpt-4o":
        case "gpt-4o-2024-05-13":
        case "gpt-4o-2024-08-06":
        case "gpt-4o-2024-11-20":
        case "gpt-4o-mini-2024-07-18":
        case "gpt-4o-mini":
        case "gpt-4o-search-preview":
        case "gpt-4o-search-preview-2025-03-11":
        case "gpt-4o-mini-search-preview":
        case "gpt-4o-mini-search-preview-2025-03-11":
        case "gpt-4o-audio-preview":
        case "gpt-4o-audio-preview-2024-12-17":
        case "gpt-4o-audio-preview-2024-10-01":
        case "gpt-4o-mini-audio-preview":
        case "gpt-4o-mini-audio-preview-2024-12-17":
        case "o1":
        case "o1-2024-12-17":
        case "o1-mini":
        case "o1-mini-2024-09-12":
        case "o1-preview":
        case "o1-preview-2024-09-12":
        case "o1-pro":
        case "o1-pro-2025-03-19":
        case "o3":
        case "o3-2025-04-16":
        case "o3-mini":
        case "o3-mini-2025-01-31":
        case "o4-mini":
        case "o4-mini-2025-04-16":
        case "chatgpt-4o-latest":
        case "gpt-4o-realtime":
        case "gpt-4o-realtime-preview-2024-10-01":
        case "gpt-4o-realtime-preview-2024-12-17":
        case "gpt-4o-mini-realtime-preview":
        case "gpt-4o-mini-realtime-preview-2024-12-17":
        case "gpt-4.1":
        case "gpt-4.1-2025-04-14":
        case "gpt-4.1-mini":
        case "gpt-4.1-mini-2025-04-14":
        case "gpt-4.1-nano":
        case "gpt-4.1-nano-2025-04-14":
        case "gpt-4.5-preview":
        case "gpt-4.5-preview-2025-02-27":
        case "gpt-5":
        case "gpt-5-2025-08-07":
        case "gpt-5-nano":
        case "gpt-5-nano-2025-08-07":
        case "gpt-5-mini":
        case "gpt-5-mini-2025-08-07":
        case "gpt-5-chat-latest":
            {
                return "o200k_base";
            }
        default:
            throw new Error("Unknown model");
    }
}
;
}),
"[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/lite.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js [instrumentation] (ecmascript)");
;
}),
"[project]/node_modules/.pnpm/mustache@4.2.0/node_modules/mustache/mustache.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */ var objectToString = Object.prototype.toString;
var isArray = Array.isArray || function isArrayPolyfill(object) {
    return objectToString.call(object) === '[object Array]';
};
function isFunction(object) {
    return typeof object === 'function';
}
/**
 * More correct typeof string handling array
 * which normally returns typeof 'object'
 */ function typeStr(obj) {
    return isArray(obj) ? 'array' : typeof obj;
}
function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
}
/**
 * Null safe way of checking whether or not an object,
 * including its prototype, has a given property
 */ function hasProperty(obj, propName) {
    return obj != null && typeof obj === 'object' && propName in obj;
}
/**
 * Safe way of detecting whether or not the given thing is a primitive and
 * whether it has the given property
 */ function primitiveHasOwnProperty(primitive, propName) {
    return primitive != null && typeof primitive !== 'object' && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
}
// Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
// See https://github.com/janl/mustache.js/issues/189
var regExpTest = RegExp.prototype.test;
function testRegExp(re, string) {
    return regExpTest.call(re, string);
}
var nonSpaceRe = /\S/;
function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
}
var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};
function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
        return entityMap[s];
    });
}
var whiteRe = /\s*/;
var spaceRe = /\s+/;
var equalsRe = /\s*=/;
var curlyRe = /\s*\}/;
var tagRe = /#|\^|\/|>|\{|&|=|!/;
/**
 * Breaks up the given `template` string into a tree of tokens. If the `tags`
 * argument is given here it must be an array with two string values: the
 * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
 * course, the default is to use mustaches (i.e. mustache.tags).
 *
 * A token is an array with at least 4 elements. The first element is the
 * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
 * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
 * all text that appears outside a symbol this element is "text".
 *
 * The second element of a token is its "value". For mustache tags this is
 * whatever else was inside the tag besides the opening symbol. For text tokens
 * this is the text itself.
 *
 * The third and fourth elements of the token are the start and end indices,
 * respectively, of the token in the original template.
 *
 * Tokens that are the root node of a subtree contain two more elements: 1) an
 * array of tokens in the subtree and 2) the index in the original template at
 * which the closing tag for that section begins.
 *
 * Tokens for partials also contain two more elements: 1) a string value of
 * indendation prior to that tag and 2) the index of that tag on that line -
 * eg a value of 2 indicates the partial is the third tag on this line.
 */ function parseTemplate(template, tags) {
    if (!template) return [];
    var lineHasNonSpace = false;
    var sections = []; // Stack to hold section tokens
    var tokens = []; // Buffer to hold the tokens
    var spaces = []; // Indices of whitespace tokens on the current line
    var hasTag = false; // Is there a {{tag}} on the current line?
    var nonSpace = false; // Is there a non-space char on the current line?
    var indentation = ''; // Tracks indentation for tags that use it
    var tagIndex = 0; // Stores a count of number of tags encountered on a line
    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
        if (hasTag && !nonSpace) {
            while(spaces.length)delete tokens[spaces.pop()];
        } else {
            spaces = [];
        }
        hasTag = false;
        nonSpace = false;
    }
    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tagsToCompile) {
        if (typeof tagsToCompile === 'string') tagsToCompile = tagsToCompile.split(spaceRe, 2);
        if (!isArray(tagsToCompile) || tagsToCompile.length !== 2) throw new Error('Invalid tags: ' + tagsToCompile);
        openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
        closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
        closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }
    compileTags(tags || mustache.tags);
    var scanner = new Scanner(template);
    var start, type, value, chr, token, openSection;
    while(!scanner.eos()){
        start = scanner.pos;
        // Match any text between tags.
        value = scanner.scanUntil(openingTagRe);
        if (value) {
            for(var i = 0, valueLength = value.length; i < valueLength; ++i){
                chr = value.charAt(i);
                if (isWhitespace(chr)) {
                    spaces.push(tokens.length);
                    indentation += chr;
                } else {
                    nonSpace = true;
                    lineHasNonSpace = true;
                    indentation += ' ';
                }
                tokens.push([
                    'text',
                    chr,
                    start,
                    start + 1
                ]);
                start += 1;
                // Check for whitespace on the current line.
                if (chr === '\n') {
                    stripSpace();
                    indentation = '';
                    tagIndex = 0;
                    lineHasNonSpace = false;
                }
            }
        }
        // Match the opening tag.
        if (!scanner.scan(openingTagRe)) break;
        hasTag = true;
        // Get the tag type.
        type = scanner.scan(tagRe) || 'name';
        scanner.scan(whiteRe);
        // Get the tag value.
        if (type === '=') {
            value = scanner.scanUntil(equalsRe);
            scanner.scan(equalsRe);
            scanner.scanUntil(closingTagRe);
        } else if (type === '{') {
            value = scanner.scanUntil(closingCurlyRe);
            scanner.scan(curlyRe);
            scanner.scanUntil(closingTagRe);
            type = '&';
        } else {
            value = scanner.scanUntil(closingTagRe);
        }
        // Match the closing tag.
        if (!scanner.scan(closingTagRe)) throw new Error('Unclosed tag at ' + scanner.pos);
        if (type == '>') {
            token = [
                type,
                value,
                start,
                scanner.pos,
                indentation,
                tagIndex,
                lineHasNonSpace
            ];
        } else {
            token = [
                type,
                value,
                start,
                scanner.pos
            ];
        }
        tagIndex++;
        tokens.push(token);
        if (type === '#' || type === '^') {
            sections.push(token);
        } else if (type === '/') {
            // Check section nesting.
            openSection = sections.pop();
            if (!openSection) throw new Error('Unopened section "' + value + '" at ' + start);
            if (openSection[1] !== value) throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
        } else if (type === 'name' || type === '{' || type === '&') {
            nonSpace = true;
        } else if (type === '=') {
            // Set the tags for the next time around.
            compileTags(value);
        }
    }
    stripSpace();
    // Make sure there are no open sections when we're done.
    openSection = sections.pop();
    if (openSection) throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    return nestTokens(squashTokens(tokens));
}
/**
 * Combines the values of consecutive text tokens in the given `tokens` array
 * to a single token.
 */ function squashTokens(tokens) {
    var squashedTokens = [];
    var token, lastToken;
    for(var i = 0, numTokens = tokens.length; i < numTokens; ++i){
        token = tokens[i];
        if (token) {
            if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                lastToken[1] += token[1];
                lastToken[3] = token[3];
            } else {
                squashedTokens.push(token);
                lastToken = token;
            }
        }
    }
    return squashedTokens;
}
/**
 * Forms the given array of `tokens` into a nested tree structure where
 * tokens that represent a section have two additional items: 1) an array of
 * all tokens that appear in that section and 2) the index in the original
 * template that represents the end of that section.
 */ function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];
    var token, section;
    for(var i = 0, numTokens = tokens.length; i < numTokens; ++i){
        token = tokens[i];
        switch(token[0]){
            case '#':
            case '^':
                collector.push(token);
                sections.push(token);
                collector = token[4] = [];
                break;
            case '/':
                section = sections.pop();
                section[5] = token[2];
                collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                break;
            default:
                collector.push(token);
        }
    }
    return nestedTokens;
}
/**
 * A simple string scanner that is used by the template parser to find
 * tokens in template strings.
 */ function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
}
/**
 * Returns `true` if the tail is empty (end of string).
 */ Scanner.prototype.eos = function eos() {
    return this.tail === '';
};
/**
 * Tries to match the given regular expression at the current position.
 * Returns the matched text if it can match, the empty string otherwise.
 */ Scanner.prototype.scan = function scan(re) {
    var match = this.tail.match(re);
    if (!match || match.index !== 0) return '';
    var string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;
    return string;
};
/**
 * Skips all text until the given regular expression can be matched. Returns
 * the skipped string, which is the entire tail if no match can be made.
 */ Scanner.prototype.scanUntil = function scanUntil(re) {
    var index = this.tail.search(re), match;
    switch(index){
        case -1:
            match = this.tail;
            this.tail = '';
            break;
        case 0:
            match = '';
            break;
        default:
            match = this.tail.substring(0, index);
            this.tail = this.tail.substring(index);
    }
    this.pos += match.length;
    return match;
};
/**
 * Represents a rendering context by wrapping a view object and
 * maintaining a reference to the parent context.
 */ function Context(view, parentContext) {
    this.view = view;
    this.cache = {
        '.': this.view
    };
    this.parent = parentContext;
}
/**
 * Creates a new context using the given view with this context
 * as the parent.
 */ Context.prototype.push = function push(view) {
    return new Context(view, this);
};
/**
 * Returns the value of the given name in this context, traversing
 * up the context hierarchy if the value is absent in this context's view.
 */ Context.prototype.lookup = function lookup(name) {
    var cache1 = this.cache;
    var value;
    if (cache1.hasOwnProperty(name)) {
        value = cache1[name];
    } else {
        var context = this, intermediateValue, names, index, lookupHit = false;
        while(context){
            if (name.indexOf('.') > 0) {
                intermediateValue = context.view;
                names = name.split('.');
                index = 0;
                /**
         * Using the dot notion path in `name`, we descend through the
         * nested objects.
         *
         * To be certain that the lookup has been successful, we have to
         * check if the last object in the path actually has the property
         * we are looking for. We store the result in `lookupHit`.
         *
         * This is specially necessary for when the value has been set to
         * `undefined` and we want to avoid looking up parent contexts.
         *
         * In the case where dot notation is used, we consider the lookup
         * to be successful even if the last "object" in the path is
         * not actually an object but a primitive (e.g., a string, or an
         * integer), because it is sometimes useful to access a property
         * of an autoboxed primitive, such as the length of a string.
         **/ while(intermediateValue != null && index < names.length){
                    if (index === names.length - 1) lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
                    intermediateValue = intermediateValue[names[index++]];
                }
            } else {
                intermediateValue = context.view[name];
                /**
         * Only checking against `hasProperty`, which always returns `false` if
         * `context.view` is not an object. Deliberately omitting the check
         * against `primitiveHasOwnProperty` if dot notation is not used.
         *
         * Consider this example:
         * ```
         * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
         * ```
         *
         * If we were to check also against `primitiveHasOwnProperty`, as we do
         * in the dot notation case, then render call would return:
         *
         * "The length of a football field is 9."
         *
         * rather than the expected:
         *
         * "The length of a football field is 100 yards."
         **/ lookupHit = hasProperty(context.view, name);
            }
            if (lookupHit) {
                value = intermediateValue;
                break;
            }
            context = context.parent;
        }
        cache1[name] = value;
    }
    if (isFunction(value)) value = value.call(this.view);
    return value;
};
/**
 * A Writer knows how to take a stream of tokens and render them to a
 * string, given a context. It also maintains a cache of templates to
 * avoid the need to parse the same template twice.
 */ function Writer() {
    this.templateCache = {
        _cache: {},
        set: function set(key, value) {
            this._cache[key] = value;
        },
        get: function get(key) {
            return this._cache[key];
        },
        clear: function clear() {
            this._cache = {};
        }
    };
}
/**
 * Clears all cached templates in this writer.
 */ Writer.prototype.clearCache = function clearCache() {
    if (typeof this.templateCache !== 'undefined') {
        this.templateCache.clear();
    }
};
/**
 * Parses and caches the given `template` according to the given `tags` or
 * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
 * that is generated from the parse.
 */ Writer.prototype.parse = function parse(template, tags) {
    var cache1 = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var isCacheEnabled = typeof cache1 !== 'undefined';
    var tokens = isCacheEnabled ? cache1.get(cacheKey) : undefined;
    if (tokens == undefined) {
        tokens = parseTemplate(template, tags);
        isCacheEnabled && cache1.set(cacheKey, tokens);
    }
    return tokens;
};
/**
 * High-level method that is used to render the given `template` with
 * the given `view`.
 *
 * The optional `partials` argument may be an object that contains the
 * names and templates of partials that are used in the template. It may
 * also be a function that is used to load partial templates on the fly
 * that takes a single argument: the name of the partial.
 *
 * If the optional `config` argument is given here, then it should be an
 * object with a `tags` attribute or an `escape` attribute or both.
 * If an array is passed, then it will be interpreted the same way as
 * a `tags` attribute on a `config` object.
 *
 * The `tags` attribute of a `config` object must be an array with two
 * string values: the opening and closing tags used in the template (e.g.
 * [ "<%", "%>" ]). The default is to mustache.tags.
 *
 * The `escape` attribute of a `config` object must be a function which
 * accepts a string as input and outputs a safely escaped string.
 * If an `escape` function is not provided, then an HTML-safe string
 * escaping function is used as the default.
 */ Writer.prototype.render = function render(template, view, partials, config) {
    var tags = this.getConfigTags(config);
    var tokens = this.parse(template, tags);
    var context = view instanceof Context ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, config);
};
/**
 * Low-level method that renders the given array of `tokens` using
 * the given `context` and `partials`.
 *
 * Note: The `originalTemplate` is only ever used to extract the portion
 * of the original template that was contained in a higher-order section.
 * If the template doesn't use higher-order sections, this argument may
 * be omitted.
 */ Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate, config) {
    var buffer = '';
    var token, symbol, value;
    for(var i = 0, numTokens = tokens.length; i < numTokens; ++i){
        value = undefined;
        token = tokens[i];
        symbol = token[0];
        if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config);
        else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config);
        else if (symbol === '>') value = this.renderPartial(token, context, partials, config);
        else if (symbol === '&') value = this.unescapedValue(token, context);
        else if (symbol === 'name') value = this.escapedValue(token, context, config);
        else if (symbol === 'text') value = this.rawValue(token);
        if (value !== undefined) buffer += value;
    }
    return buffer;
};
Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate, config) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);
    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender(template) {
        return self.render(template, context, partials, config);
    }
    if (!value) return;
    if (isArray(value)) {
        for(var j = 0, valueLength = value.length; j < valueLength; ++j){
            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
        }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
    } else if (isFunction(value)) {
        if (typeof originalTemplate !== 'string') throw new Error('Cannot use higher-order sections without the original template');
        // Extract the portion of the original template that the section contains.
        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
        if (value != null) buffer += value;
    } else {
        buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
    }
    return buffer;
};
Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate, config) {
    var value = context.lookup(token[1]);
    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || isArray(value) && value.length === 0) return this.renderTokens(token[4], context, partials, originalTemplate, config);
};
Writer.prototype.indentPartial = function indentPartial(partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for(var i = 0; i < partialByNl.length; i++){
        if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
            partialByNl[i] = filteredIndentation + partialByNl[i];
        }
    }
    return partialByNl.join('\n');
};
Writer.prototype.renderPartial = function renderPartial(token, context, partials, config) {
    if (!partials) return;
    var tags = this.getConfigTags(config);
    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
        var lineHasNonSpace = token[6];
        var tagIndex = token[5];
        var indentation = token[4];
        var indentedValue = value;
        if (tagIndex == 0 && indentation) {
            indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
        }
        var tokens = this.parse(indentedValue, tags);
        return this.renderTokens(tokens, context, partials, indentedValue, config);
    }
};
Writer.prototype.unescapedValue = function unescapedValue(token, context) {
    var value = context.lookup(token[1]);
    if (value != null) return value;
};
Writer.prototype.escapedValue = function escapedValue(token, context, config) {
    var escape = this.getConfigEscape(config) || mustache.escape;
    var value = context.lookup(token[1]);
    if (value != null) return typeof value === 'number' && escape === mustache.escape ? String(value) : escape(value);
};
Writer.prototype.rawValue = function rawValue(token) {
    return token[1];
};
Writer.prototype.getConfigTags = function getConfigTags(config) {
    if (isArray(config)) {
        return config;
    } else if (config && typeof config === 'object') {
        return config.tags;
    } else {
        return undefined;
    }
};
Writer.prototype.getConfigEscape = function getConfigEscape(config) {
    if (config && typeof config === 'object' && !isArray(config)) {
        return config.escape;
    } else {
        return undefined;
    }
};
var mustache = {
    name: 'mustache.js',
    version: '4.2.0',
    tags: [
        '{{',
        '}}'
    ],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    /**
   * Allows a user to override the default caching strategy, by providing an
   * object with set, get and clear methods. This can also be used to disable
   * the cache by setting it to the literal `undefined`.
   */ set templateCache (cache){
        defaultWriter.templateCache = cache;
    },
    /**
   * Gets the default or overridden caching object from the default writer.
   */ get templateCache () {
        return defaultWriter.templateCache;
    }
};
// All high-level mustache.* functions use this writer.
var defaultWriter = new Writer();
/**
 * Clears all cached templates in the default writer.
 */ mustache.clearCache = function clearCache() {
    return defaultWriter.clearCache();
};
/**
 * Parses and caches the given template in the default writer and returns the
 * array of tokens it contains. Doing this ahead of time avoids the need to
 * parse templates on the fly as they are rendered.
 */ mustache.parse = function parse(template, tags) {
    return defaultWriter.parse(template, tags);
};
/**
 * Renders the `template` with the given `view`, `partials`, and `config`
 * using the default writer.
 */ mustache.render = function render(template, view, partials, config) {
    if (typeof template !== 'string') {
        throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
    }
    return defaultWriter.render(template, view, partials, config);
};
// Export the escaping function so that the user may override it.
// See https://github.com/janl/mustache.js/issues/244
mustache.escape = escapeHtml;
// Export these mainly for testing, but also for advanced usage.
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;
const __TURBOPACK__default__export__ = mustache;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/sql.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSQLStatements",
    ()=>getSQLStatements,
    "getTablesWithSchema",
    ()=>getTablesWithSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [instrumentation] (ecmascript)");
;
//#region src/sql.ts
const getTablesWithSchema = (schema)=>{
    return [
        "checkpoints",
        "checkpoint_blobs",
        "checkpoint_migrations",
        "checkpoint_writes"
    ].reduce((acc, table)=>{
        acc[table] = `"${schema}".${table}`;
        return acc;
    }, {});
};
const getSQLStatements = (schema)=>{
    const SCHEMA_TABLES = getTablesWithSchema(schema);
    return {
        SELECT_SQL: `select
    thread_id,
    checkpoint,
    checkpoint_ns,
    checkpoint_id,
    parent_checkpoint_id,
    metadata,
    (
      select array_agg(array[bl.channel::bytea, bl.type::bytea, bl.blob])
      from jsonb_each_text(checkpoint -> 'channel_versions')
      inner join ${SCHEMA_TABLES.checkpoint_blobs} bl
        on bl.thread_id = cp.thread_id
        and bl.checkpoint_ns = cp.checkpoint_ns
        and bl.channel = jsonb_each_text.key
        and bl.version = jsonb_each_text.value
    ) as channel_values,
    (
      select
      array_agg(array[cw.task_id::text::bytea, cw.channel::bytea, cw.type::bytea, cw.blob] order by cw.task_id, cw.idx)
      from ${SCHEMA_TABLES.checkpoint_writes} cw
      where cw.thread_id = cp.thread_id
        and cw.checkpoint_ns = cp.checkpoint_ns
        and cw.checkpoint_id = cp.checkpoint_id
    ) as pending_writes
  from ${SCHEMA_TABLES.checkpoints} cp `,
        SELECT_PENDING_SENDS_SQL: `select
      checkpoint_id,
      array_agg(array[cw.type::bytea, cw.blob] order by cw.task_id, cw.idx) as pending_sends
    from ${SCHEMA_TABLES.checkpoint_writes} cw
    where cw.thread_id = $1
      and cw.checkpoint_id = any($2)
      and cw.channel = '${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["TASKS"]}'
    group by cw.checkpoint_id
  `,
        UPSERT_CHECKPOINT_BLOBS_SQL: `INSERT INTO ${SCHEMA_TABLES.checkpoint_blobs} (thread_id, checkpoint_ns, channel, version, type, blob)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (thread_id, checkpoint_ns, channel, version) DO NOTHING
  `,
        UPSERT_CHECKPOINTS_SQL: `INSERT INTO ${SCHEMA_TABLES.checkpoints} (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, checkpoint, metadata)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (thread_id, checkpoint_ns, checkpoint_id)
  DO UPDATE SET
    checkpoint = EXCLUDED.checkpoint,
    metadata = EXCLUDED.metadata;
  `,
        UPSERT_CHECKPOINT_WRITES_SQL: `INSERT INTO ${SCHEMA_TABLES.checkpoint_writes} (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, type, blob)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT (thread_id, checkpoint_ns, checkpoint_id, task_id, idx) DO UPDATE SET
    channel = EXCLUDED.channel,
    type = EXCLUDED.type,
    blob = EXCLUDED.blob;
  `,
        INSERT_CHECKPOINT_WRITES_SQL: `INSERT INTO ${SCHEMA_TABLES.checkpoint_writes} (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, type, blob)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT (thread_id, checkpoint_ns, checkpoint_id, task_id, idx) DO NOTHING
  `,
        DELETE_CHECKPOINTS_SQL: `DELETE FROM ${SCHEMA_TABLES.checkpoints} WHERE thread_id = $1`,
        DELETE_CHECKPOINT_BLOBS_SQL: `DELETE FROM ${SCHEMA_TABLES.checkpoint_blobs} WHERE thread_id = $1`,
        DELETE_CHECKPOINT_WRITES_SQL: `DELETE FROM ${SCHEMA_TABLES.checkpoint_writes} WHERE thread_id = $1`
    };
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/migrations.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMigrations",
    ()=>getMigrations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/sql.js [instrumentation] (ecmascript)");
;
//#region src/migrations.ts
/**
* To add a new migration, add a new string to the list returned by the getMigrations function.
* The position of the migration in the list is the version number.
*/ const getMigrations = (schema)=>{
    const SCHEMA_TABLES = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTablesWithSchema"])(schema);
    return [
        `CREATE TABLE IF NOT EXISTS ${SCHEMA_TABLES.checkpoint_migrations} (
    v INTEGER PRIMARY KEY
  );`,
        `CREATE TABLE IF NOT EXISTS ${SCHEMA_TABLES.checkpoints} (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    type TEXT,
    checkpoint JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
  );`,
        `CREATE TABLE IF NOT EXISTS ${SCHEMA_TABLES.checkpoint_blobs} (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    channel TEXT NOT NULL,
    version TEXT NOT NULL,
    type TEXT NOT NULL,
    blob BYTEA,
    PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
  );`,
        `CREATE TABLE IF NOT EXISTS ${SCHEMA_TABLES.checkpoint_writes} (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INTEGER NOT NULL,
    channel TEXT NOT NULL,
    type TEXT,
    blob BYTEA NOT NULL,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
  );`,
        `ALTER TABLE ${SCHEMA_TABLES.checkpoint_blobs} ALTER COLUMN blob DROP not null;`
    ];
};
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PostgresSaver",
    ()=>PostgresSaver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/sql.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$migrations$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/migrations.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/.pnpm/pg@8.23.1/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
//#region src/index.ts
const _defaultOptions = {
    schema: "public"
};
const _ensureCompleteOptions = (options)=>{
    return {
        ...options,
        schema: options?.schema ?? _defaultOptions.schema
    };
};
const { Pool } = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$23$2e$1$2f$node_modules$2f$pg$29$__["default"];
/**
* LangGraph checkpointer that uses a Postgres instance as the backing store.
* Uses the [node-postgres](https://node-postgres.com/) package internally
* to connect to a Postgres instance.
*
* @example
* ```
* import { ChatOpenAI } from "@langchain/openai";
* import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
* import { createReactAgent } from "@langchain/langgraph/prebuilt";
*
* const checkpointer = PostgresSaver.fromConnString(
*   "postgresql://user:password@localhost:5432/db",
*   // optional configuration object
*   {
*     schema: "custom_schema" // defaults to "public"
*   }
* );
*
* // NOTE: you need to call .setup() the first time you're using your checkpointer
* await checkpointer.setup();
*
* const graph = createReactAgent({
*   tools: [getWeather],
*   llm: new ChatOpenAI({
*     model: "gpt-4o-mini",
*   }),
*   checkpointSaver: checkpointer,
* });
* const config = { configurable: { thread_id: "1" } };
*
* await graph.invoke({
*   messages: [{
*     role: "user",
*     content: "what's the weather in sf"
*   }],
* }, config);
* ```
*/ var PostgresSaver = class PostgresSaver extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseCheckpointSaver"] {
    pool;
    options;
    SQL_STATEMENTS;
    isSetup;
    constructor(pool, serde, options){
        super(serde);
        this.pool = pool;
        this.isSetup = false;
        this.options = _ensureCompleteOptions(options);
        this.SQL_STATEMENTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSQLStatements"])(this.options.schema);
    }
    /**
	* Creates a new instance of PostgresSaver from a connection string.
	*
	* @param {string} connString - The connection string to connect to the Postgres database.
	* @param {PostgresSaverOptions} [options] - Optional configuration object.
	* @returns {PostgresSaver} A new instance of PostgresSaver.
	*
	* @example
	* const connString = "postgresql://user:password@localhost:5432/db";
	* const checkpointer = PostgresSaver.fromConnString(connString, {
	*  schema: "custom_schema" // defaults to "public"
	* });
	* await checkpointer.setup();
	*/ static fromConnString(connString, options) {
        return new PostgresSaver(new Pool({
            connectionString: connString
        }), void 0, options);
    }
    /**
	* Set up the checkpoint database asynchronously.
	*
	* This method creates the necessary tables in the Postgres database if they don't
	* already exist and runs database migrations. It MUST be called directly by the user
	* the first time checkpointer is used.
	*/ async setup() {
        const client = await this.pool.connect();
        const SCHEMA_TABLES = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTablesWithSchema"])(this.options.schema);
        try {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${this.options.schema}"`);
            let version = -1;
            const MIGRATIONS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$migrations$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMigrations"])(this.options.schema);
            try {
                const result = await client.query(`SELECT v FROM ${SCHEMA_TABLES.checkpoint_migrations} ORDER BY v DESC LIMIT 1`);
                if (result.rows.length > 0) version = result.rows[0].v;
            } catch (error) {
                if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" && error.code === "42P01") version = -1;
                else throw error;
            }
            for(let v = version + 1; v < MIGRATIONS.length; v += 1){
                await client.query(MIGRATIONS[v]);
                await client.query(`INSERT INTO ${SCHEMA_TABLES.checkpoint_migrations} (v) VALUES ($1)`, [
                    v
                ]);
            }
        } finally{
            client.release();
        }
    }
    async _loadCheckpoint(checkpoint, channelValues) {
        return {
            ...checkpoint,
            channel_versions: checkpoint.channel_versions ?? {},
            versions_seen: checkpoint.versions_seen ?? {},
            channel_values: await this._loadBlobs(channelValues)
        };
    }
    async _loadBlobs(blobValues) {
        if (!blobValues || blobValues.length === 0) return {};
        const textDecoder = new TextDecoder();
        const entries = await Promise.all(blobValues.filter(([, t])=>textDecoder.decode(t) !== "empty").map(async ([k, t, v])=>[
                textDecoder.decode(k),
                await this.serde.loadsTyped(textDecoder.decode(t), v)
            ]));
        return Object.fromEntries(entries);
    }
    async _loadMetadata(metadata) {
        const [type, dumpedValue] = await this.serde.dumpsTyped(metadata);
        return this.serde.loadsTyped(type, dumpedValue);
    }
    async _loadWrites(writes) {
        const decoder = new TextDecoder();
        return writes ? await Promise.all(writes.map(async ([tid, channel, t, v])=>[
                decoder.decode(tid),
                decoder.decode(channel),
                await this.serde.loadsTyped(decoder.decode(t), v)
            ])) : [];
    }
    async _dumpBlobs(threadId, checkpointNs, values, versions) {
        if (Object.keys(versions).length === 0) return [];
        return Promise.all(Object.entries(versions).map(async ([k, ver])=>{
            const [type, value] = k in values ? await this.serde.dumpsTyped(values[k]) : [
                "empty",
                null
            ];
            return [
                threadId,
                checkpointNs,
                k,
                ver.toString(),
                type,
                value ? new Uint8Array(value) : void 0
            ];
        }));
    }
    _dumpCheckpoint(checkpoint) {
        const serialized = {
            ...checkpoint
        };
        if ("channel_values" in serialized) delete serialized.channel_values;
        return serialized;
    }
    async _dumpMetadata(metadata) {
        const [, serializedMetadata] = await this.serde.dumpsTyped(metadata);
        return JSON.parse(new TextDecoder().decode(serializedMetadata).replace(/\0/g, ""));
    }
    async _dumpWrites(threadId, checkpointNs, checkpointId, taskId, writes) {
        return Promise.all(writes.map(async ([channel, value], idx)=>{
            const [type, serializedValue] = await this.serde.dumpsTyped(value);
            return [
                threadId,
                checkpointNs,
                checkpointId,
                taskId,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["WRITES_IDX_MAP"][channel] ?? idx,
                channel,
                type,
                new Uint8Array(serializedValue)
            ];
        }));
    }
    /**
	* Return WHERE clause predicates for a given list() config, filter, cursor.
	*
	* This method returns a tuple of a string and a tuple of values. The string
	* is the parameterized WHERE clause predicate (including the WHERE keyword):
	* "WHERE column1 = $1 AND column2 IS $2". The list of values contains the
	* values for each of the corresponding parameters.
	*/ _searchWhere(config, filter, before) {
        const wheres = [];
        const paramValues = [];
        if (config?.configurable?.thread_id) {
            wheres.push(`thread_id = $${paramValues.length + 1}`);
            paramValues.push(config.configurable.thread_id);
        }
        if (config?.configurable?.checkpoint_ns !== void 0 && config?.configurable?.checkpoint_ns !== null) {
            wheres.push(`checkpoint_ns = $${paramValues.length + 1}`);
            paramValues.push(config.configurable.checkpoint_ns);
        }
        if (config?.configurable?.checkpoint_id) {
            wheres.push(`checkpoint_id = $${paramValues.length + 1}`);
            paramValues.push(config.configurable.checkpoint_id);
        }
        if (filter && Object.keys(filter).length > 0) {
            wheres.push(`metadata @> $${paramValues.length + 1}`);
            paramValues.push(JSON.stringify(filter));
        }
        if (before?.configurable?.checkpoint_id !== void 0) {
            wheres.push(`checkpoint_id < $${paramValues.length + 1}`);
            paramValues.push(before.configurable.checkpoint_id);
        }
        return [
            wheres.length > 0 ? `WHERE ${wheres.join(" AND ")}` : "",
            paramValues
        ];
    }
    /**
	* Get a checkpoint tuple from the database.
	* This method retrieves a checkpoint tuple from the Postgres database
	* based on the provided config. If the config's configurable field contains
	* a "checkpoint_id" key, the checkpoint with the matching thread_id and
	* namespace is retrieved. Otherwise, the latest checkpoint for the given
	* thread_id is retrieved.
	* @param config The config to use for retrieving the checkpoint.
	* @returns The retrieved checkpoint tuple, or undefined.
	*/ async getTuple(config) {
        const { thread_id, checkpoint_ns = "", checkpoint_id } = config.configurable ?? {};
        let args;
        let where;
        if (checkpoint_id) {
            where = "WHERE thread_id = $1 AND checkpoint_ns = $2 AND checkpoint_id = $3";
            args = [
                thread_id,
                checkpoint_ns,
                checkpoint_id
            ];
        } else {
            where = "WHERE thread_id = $1 AND checkpoint_ns = $2 ORDER BY checkpoint_id DESC LIMIT 1";
            args = [
                thread_id,
                checkpoint_ns
            ];
        }
        const [row] = (await this.pool.query(this.SQL_STATEMENTS.SELECT_SQL + where, args)).rows;
        if (row === void 0) return void 0;
        if (row.checkpoint.v < 4 && row.parent_checkpoint_id != null) {
            const [sendsRow] = (await this.pool.query(this.SQL_STATEMENTS.SELECT_PENDING_SENDS_SQL, [
                thread_id,
                [
                    row.parent_checkpoint_id
                ]
            ])).rows;
            if (sendsRow != null) await this._migratePendingSends(sendsRow.pending_sends, row);
        }
        const checkpoint = await this._loadCheckpoint(row.checkpoint, row.channel_values);
        return {
            config: {
                configurable: {
                    thread_id,
                    checkpoint_ns,
                    checkpoint_id: row.checkpoint_id
                }
            },
            checkpoint,
            metadata: await this._loadMetadata(row.metadata),
            parentConfig: row.parent_checkpoint_id ? {
                configurable: {
                    thread_id,
                    checkpoint_ns,
                    checkpoint_id: row.parent_checkpoint_id
                }
            } : void 0,
            pendingWrites: await this._loadWrites(row.pending_writes)
        };
    }
    /**
	* List checkpoints from the database.
	*
	* This method retrieves a list of checkpoint tuples from the Postgres database based
	* on the provided config. The checkpoints are ordered by checkpoint ID in descending order (newest first).
	*/ async *list(config, options) {
        const { filter, before, limit } = options ?? {};
        const [where, args] = this._searchWhere(config, filter, before);
        let query = `${this.SQL_STATEMENTS.SELECT_SQL}${where} ORDER BY checkpoint_id DESC`;
        if (limit !== void 0) query += ` LIMIT ${Number.parseInt(limit.toString(), 10)}`;
        const result = await this.pool.query(query, args);
        const toMigrate = result.rows.filter((row)=>row.checkpoint.v < 4 && row.parent_checkpoint_id != null);
        if (toMigrate.length > 0) {
            const sendsResult = await this.pool.query(this.SQL_STATEMENTS.SELECT_PENDING_SENDS_SQL, [
                toMigrate[0].thread_id,
                toMigrate.map((row)=>row.parent_checkpoint_id)
            ]);
            const parentMap = toMigrate.reduce((acc, row)=>{
                if (!row.parent_checkpoint_id) return acc;
                acc[row.parent_checkpoint_id] ??= [];
                acc[row.parent_checkpoint_id].push(row);
                return acc;
            }, {});
            for (const sendsRow of sendsResult.rows)for (const row of parentMap[sendsRow.checkpoint_id])await this._migratePendingSends(sendsRow.pending_sends, row);
        }
        for (const value of result.rows)yield {
            config: {
                configurable: {
                    thread_id: value.thread_id,
                    checkpoint_ns: value.checkpoint_ns,
                    checkpoint_id: value.checkpoint_id
                }
            },
            checkpoint: await this._loadCheckpoint(value.checkpoint, value.channel_values),
            metadata: await this._loadMetadata(value.metadata),
            parentConfig: value.parent_checkpoint_id ? {
                configurable: {
                    thread_id: value.thread_id,
                    checkpoint_ns: value.checkpoint_ns,
                    checkpoint_id: value.parent_checkpoint_id
                }
            } : void 0,
            pendingWrites: await this._loadWrites(value.pending_writes)
        };
    }
    /** @internal */ async _migratePendingSends(pendingSends, mutableRow) {
        const textEncoder = new TextEncoder();
        const textDecoder = new TextDecoder();
        const row = mutableRow;
        const [enc, blob] = await this.serde.dumpsTyped(await Promise.all(pendingSends.map(([enc, blob])=>this.serde.loadsTyped(textDecoder.decode(enc), blob))));
        row.channel_values ??= [];
        row.channel_values.push([
            textEncoder.encode(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["TASKS"]),
            textEncoder.encode(enc),
            blob
        ]);
        row.checkpoint.channel_versions[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["TASKS"]] = Object.keys(mutableRow.checkpoint.channel_versions).length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["maxChannelVersion"])(...Object.values(mutableRow.checkpoint.channel_versions)) : this.getNextVersion(void 0);
    }
    /**
	* Save a checkpoint to the database.
	*
	* This method saves a checkpoint to the Postgres database. The checkpoint is associated
	* with the provided config and its parent config (if any).
	* @param config
	* @param checkpoint
	* @param metadata
	* @returns
	*/ async put(config, checkpoint, metadata, newVersions) {
        if (config.configurable === void 0) throw new Error(`Missing "configurable" field in "config" param`);
        const { thread_id, checkpoint_ns = "", checkpoint_id } = config.configurable;
        const nextConfig = {
            configurable: {
                thread_id,
                checkpoint_ns,
                checkpoint_id: checkpoint.id
            }
        };
        const serializedCheckpoint = this._dumpCheckpoint(checkpoint);
        const [serializedBlobs, serializedMetadata] = await Promise.all([
            this._dumpBlobs(thread_id, checkpoint_ns, checkpoint.channel_values, newVersions),
            this._dumpMetadata(metadata)
        ]);
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            for (const serializedBlob of serializedBlobs)await client.query(this.SQL_STATEMENTS.UPSERT_CHECKPOINT_BLOBS_SQL, serializedBlob);
            await client.query(this.SQL_STATEMENTS.UPSERT_CHECKPOINTS_SQL, [
                thread_id,
                checkpoint_ns,
                checkpoint.id,
                checkpoint_id,
                serializedCheckpoint,
                serializedMetadata
            ]);
            await client.query("COMMIT");
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally{
            client.release();
        }
        return nextConfig;
    }
    /**
	* Store intermediate writes linked to a checkpoint.
	*
	* This method saves intermediate writes associated with a checkpoint to the Postgres database.
	* @param config Configuration of the related checkpoint.
	* @param writes List of writes to store.
	* @param taskId Identifier for the task creating the writes.
	*/ async putWrites(config, writes, taskId) {
        const query = writes.every((w)=>w[0] in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["WRITES_IDX_MAP"]) ? this.SQL_STATEMENTS.UPSERT_CHECKPOINT_WRITES_SQL : this.SQL_STATEMENTS.INSERT_CHECKPOINT_WRITES_SQL;
        const dumpedWrites = await this._dumpWrites(config.configurable?.thread_id, config.configurable?.checkpoint_ns, config.configurable?.checkpoint_id, taskId, writes);
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            for await (const dumpedWrite of dumpedWrites)await client.query(query, dumpedWrite);
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally{
            client.release();
        }
    }
    async end() {
        return this.pool.end();
    }
    async deleteThread(threadId) {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(this.SQL_STATEMENTS.DELETE_CHECKPOINT_BLOBS_SQL, [
                threadId
            ]);
            await client.query(this.SQL_STATEMENTS.DELETE_CHECKPOINTS_SQL, [
                threadId
            ]);
            await client.query(this.SQL_STATEMENTS.DELETE_CHECKPOINT_WRITES_SQL, [
                threadId
            ]);
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally{
            client.release();
        }
    }
};
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/.pnpm/@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/client-s3)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@aws-sdk/client-s3-5b830212ca53fcf4", () => require("@aws-sdk/client-s3-5b830212ca53fcf4"));

module.exports = mod;
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProviderError",
    ()=>ProviderError
]);
class ProviderError extends Error {
    name = "ProviderError";
    tryNextLink;
    constructor(message, options = true){
        let logger;
        let tryNextLink = true;
        if (typeof options === "boolean") {
            logger = undefined;
            tryNextLink = options;
        } else if (options != null && typeof options === "object") {
            logger = options.logger;
            tryNextLink = options.tryNextLink ?? true;
        }
        super(message);
        this.tryNextLink = tryNextLink;
        Object.setPrototypeOf(this, ProviderError.prototype);
        logger?.debug?.(`@smithy/property-provider ${tryNextLink ? "->" : "(!)"} ${message}`);
    }
    static from(error, options = true) {
        return Object.assign(new this(error.message, options), error);
    }
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chain",
    ()=>chain
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [instrumentation] (ecmascript)");
;
const chain = (...providers)=>async ()=>{
        if (providers.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProviderError"]("No providers in chain");
        }
        let lastProviderError;
        for (const provider of providers){
            try {
                const credentials = await provider();
                return credentials;
            } catch (err) {
                lastProviderError = err;
                if (err?.tryNextLink) {
                    continue;
                }
                throw err;
            }
        }
        throw lastProviderError;
    };
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "memoize",
    ()=>memoize
]);
const memoize = (provider, isExpired, requiresRefresh)=>{
    let resolved;
    let pending;
    let hasResult;
    let isConstant = false;
    const coalesceProvider = async ()=>{
        if (!pending) {
            pending = provider();
        }
        try {
            resolved = await pending;
            hasResult = true;
            isConstant = false;
        } finally{
            pending = undefined;
        }
        return resolved;
    };
    if (isExpired === undefined) {
        return async (options)=>{
            if (!hasResult || options?.forceRefresh) {
                resolved = await coalesceProvider();
            }
            return resolved;
        };
    }
    return async (options)=>{
        if (!hasResult || options?.forceRefresh) {
            resolved = await coalesceProvider();
        }
        if (isConstant) {
            return resolved;
        }
        if (requiresRefresh && !requiresRefresh(resolved)) {
            isConstant = true;
            return resolved;
        }
        if (isExpired(resolved)) {
            await coalesceProvider();
            return resolved;
        }
        return resolved;
    };
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CredentialsProviderError",
    ()=>CredentialsProviderError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [instrumentation] (ecmascript)");
;
class CredentialsProviderError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProviderError"] {
    name = "CredentialsProviderError";
    constructor(message, options = true){
        super(message, options);
        Object.setPrototypeOf(this, CredentialsProviderError.prototype);
    }
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSelectorName",
    ()=>getSelectorName
]);
function getSelectorName(functionString) {
    try {
        const constants = new Set(Array.from(functionString.match(/([A-Z_]){3,}/g) ?? []));
        constants.delete("CONFIG");
        constants.delete("CONFIG_PREFIX_SEPARATOR");
        constants.delete("ENV");
        return [
            ...constants
        ].join(", ");
    } catch (ignored) {
        return functionString;
    }
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromEnv",
    ()=>fromEnv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [instrumentation] (ecmascript)");
;
;
const fromEnv = (envVarSelector, options)=>async ()=>{
        try {
            const config = envVarSelector(process.env, options);
            if (config === undefined) {
                throw new Error();
            }
            return config;
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](e.message || `Not found in ENV: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSelectorName"])(envVarSelector.toString())}`, {
                logger: options?.logger
            });
        }
    };
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PROFILE",
    ()=>DEFAULT_PROFILE,
    "ENV_PROFILE",
    ()=>ENV_PROFILE,
    "getProfileName",
    ()=>getProfileName
]);
const ENV_PROFILE = "AWS_PROFILE";
const DEFAULT_PROFILE = "default";
const getProfileName = (init)=>init.profile || process.env[ENV_PROFILE] || DEFAULT_PROFILE;
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_PREFIX_SEPARATOR",
    ()=>CONFIG_PREFIX_SEPARATOR
]);
const CONFIG_PREFIX_SEPARATOR = ".";
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConfigData",
    ()=>getConfigData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/profile.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [instrumentation] (ecmascript)");
;
;
const getConfigData = (data)=>Object.entries(data).filter(([key])=>{
        const indexOfSeparator = key.indexOf(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
        if (indexOfSeparator === -1) {
            return false;
        }
        return Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IniSectionType"]).includes(key.substring(0, indexOfSeparator));
    }).reduce((acc, [key, value])=>{
        const indexOfSeparator = key.indexOf(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
        const updatedKey = key.substring(0, indexOfSeparator) === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IniSectionType"].PROFILE ? key.substring(indexOfSeparator + 1) : key;
        acc[updatedKey] = value;
        return acc;
    }, {
        ...data.default && {
            default: data.default
        }
    });
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getHomeDir",
    ()=>getHomeDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
const homeDirCache = {};
const getHomeDirCacheKey = ()=>{
    if (process && process.geteuid) {
        return `${process.geteuid()}`;
    }
    return "DEFAULT";
};
const getHomeDir = ()=>{
    const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["sep"]}` } = process.env;
    if (HOME) {
        return HOME;
    }
    if (USERPROFILE) {
        return USERPROFILE;
    }
    if (HOMEPATH) {
        return `${HOMEDRIVE}${HOMEPATH}`;
    }
    const homeDirCacheKey = getHomeDirCacheKey();
    if (!homeDirCache[homeDirCacheKey]) {
        homeDirCache[homeDirCacheKey] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])();
    }
    return homeDirCache[homeDirCacheKey];
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigFilepath.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENV_CONFIG_PATH",
    ()=>ENV_CONFIG_PATH,
    "getConfigFilepath",
    ()=>getConfigFilepath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)");
;
;
const ENV_CONFIG_PATH = "AWS_CONFIG_FILE";
const getConfigFilepath = ()=>process.env[ENV_CONFIG_PATH] || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHomeDir"])(), ".aws", "config");
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getCredentialsFilepath.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENV_CREDENTIALS_PATH",
    ()=>ENV_CREDENTIALS_PATH,
    "getCredentialsFilepath",
    ()=>getCredentialsFilepath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)");
;
;
const ENV_CREDENTIALS_PATH = "AWS_SHARED_CREDENTIALS_FILE";
const getCredentialsFilepath = ()=>process.env[ENV_CREDENTIALS_PATH] || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHomeDir"])(), ".aws", "credentials");
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseIni",
    ()=>parseIni
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/profile.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [instrumentation] (ecmascript)");
;
;
const prefixKeyRegex = /^([\w-]+)\s(["'])?([\w-@+.%:/]+)\2$/;
const profileNameBlockList = [
    "__proto__",
    "profile __proto__"
];
const parseIni = (iniData)=>{
    const map = {};
    let currentSection;
    let currentSubSection;
    for (const iniLine of iniData.split(/\r?\n/)){
        const trimmedLine = iniLine.split(/(^|\s)[;#]/)[0].trim();
        const isSection = trimmedLine[0] === "[" && trimmedLine[trimmedLine.length - 1] === "]";
        if (isSection) {
            currentSection = undefined;
            currentSubSection = undefined;
            const sectionName = trimmedLine.substring(1, trimmedLine.length - 1);
            const matches = prefixKeyRegex.exec(sectionName);
            if (matches) {
                const [, prefix, , name] = matches;
                if (Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IniSectionType"]).includes(prefix)) {
                    currentSection = [
                        prefix,
                        name
                    ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
                }
            } else {
                currentSection = sectionName;
            }
            if (profileNameBlockList.includes(sectionName)) {
                throw new Error(`Found invalid profile name "${sectionName}"`);
            }
        } else if (currentSection) {
            const indexOfEqualsSign = trimmedLine.indexOf("=");
            if (![
                0,
                -1
            ].includes(indexOfEqualsSign)) {
                const [name, value] = [
                    trimmedLine.substring(0, indexOfEqualsSign).trim(),
                    trimmedLine.substring(indexOfEqualsSign + 1).trim()
                ];
                if (value === "") {
                    currentSubSection = name;
                } else {
                    if (currentSubSection && iniLine.trimStart() === iniLine) {
                        currentSubSection = undefined;
                    }
                    map[currentSection] = map[currentSection] || {};
                    const key = currentSubSection ? [
                        currentSubSection,
                        name
                    ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]) : name;
                    map[currentSection][key] = value;
                }
            }
        }
    }
    return map;
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fileIntercept",
    ()=>fileIntercept,
    "filePromises",
    ()=>filePromises,
    "readFile",
    ()=>readFile
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
;
const filePromises = {};
const fileIntercept = {};
const readFile = (path, options)=>{
    if (fileIntercept[path] !== undefined) {
        return fileIntercept[path];
    }
    if (!filePromises[path] || options?.ignoreCache) {
        filePromises[path] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(path, "utf8");
    }
    return filePromises[path];
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadSharedConfigFiles",
    ()=>loadSharedConfigFiles
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigData$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigFilepath.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getCredentialsFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getCredentialsFilepath.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
const swallowError = ()=>({});
;
const loadSharedConfigFiles = async (init = {})=>{
    const { filepath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getCredentialsFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCredentialsFilepath"])(), configFilepath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getConfigFilepath"])() } = init;
    const homeDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHomeDir"])();
    const relativeHomeDirPrefix = "~/";
    let resolvedFilepath = filepath;
    if (filepath.startsWith(relativeHomeDirPrefix)) {
        resolvedFilepath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(homeDir, filepath.slice(2));
    }
    let resolvedConfigFilepath = configFilepath;
    if (configFilepath.startsWith(relativeHomeDirPrefix)) {
        resolvedConfigFilepath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(homeDir, configFilepath.slice(2));
    }
    const parsedFiles = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFile"])(resolvedConfigFilepath, {
            ignoreCache: init.ignoreCache
        }).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIni"]).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigData$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getConfigData"]).catch(swallowError),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFile"])(resolvedFilepath, {
            ignoreCache: init.ignoreCache
        }).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIni"]).catch(swallowError)
    ]);
    return {
        configFile: parsedFiles[0],
        credentialsFile: parsedFiles[1]
    };
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromSharedConfigFiles",
    ()=>fromSharedConfigFiles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [instrumentation] (ecmascript)");
;
;
;
;
const fromSharedConfigFiles = (configSelector, { preferredFile = "config", ...init } = {})=>async ()=>{
        const profile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProfileName"])(init);
        const { configFile, credentialsFile } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadSharedConfigFiles"])(init);
        const profileFromCredentials = credentialsFile[profile] || {};
        const profileFromConfig = configFile[profile] || {};
        const mergedProfile = preferredFile === "config" ? {
            ...profileFromCredentials,
            ...profileFromConfig
        } : {
            ...profileFromConfig,
            ...profileFromCredentials
        };
        try {
            const cfgFile = preferredFile === "config" ? configFile : credentialsFile;
            const configValue = configSelector(mergedProfile, cfgFile);
            if (configValue === undefined) {
                throw new Error();
            }
            return configValue;
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](e.message || `Not found in config files w/ profile [${profile}]: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSelectorName"])(configSelector.toString())}`, {
                logger: init.logger
            });
        }
    };
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromValue",
    ()=>fromValue
]);
const fromValue = (staticValue)=>()=>Promise.resolve(staticValue);
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromStatic",
    ()=>fromStatic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$fromValue$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js [instrumentation] (ecmascript)");
;
const isFunction = (func)=>typeof func === "function";
const fromStatic = (defaultValue)=>isFunction(defaultValue) ? async ()=>await defaultValue() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$fromValue$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromValue"])(defaultValue);
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadConfig",
    ()=>loadConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$chain$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$memoize$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromEnv$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromStatic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js [instrumentation] (ecmascript)");
;
;
;
;
;
const loadConfig = ({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {})=>{
    const { signingName, logger } = configuration;
    const envOptions = {
        signingName,
        logger
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$memoize$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["memoize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$chain$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["chain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromEnv$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromEnv"])(environmentVariableSelector, envOptions), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromSharedConfigFiles"])(configFileSelector, configuration), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromStatic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromStatic"])(defaultValue)));
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointUrlConfig.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_ENDPOINT_URL",
    ()=>CONFIG_ENDPOINT_URL,
    "ENV_ENDPOINT_URL",
    ()=>ENV_ENDPOINT_URL,
    "getEndpointUrlConfig",
    ()=>getEndpointUrlConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [instrumentation] (ecmascript)");
;
const ENV_ENDPOINT_URL = "AWS_ENDPOINT_URL";
const CONFIG_ENDPOINT_URL = "endpoint_url";
const getEndpointUrlConfig = (serviceId)=>({
        environmentVariableSelector: (env)=>{
            const serviceSuffixParts = serviceId.split(" ").map((w)=>w.toUpperCase());
            const serviceEndpointUrl = env[[
                ENV_ENDPOINT_URL,
                ...serviceSuffixParts
            ].join("_")];
            if (serviceEndpointUrl) {
                return serviceEndpointUrl;
            }
            const endpointUrl = env[ENV_ENDPOINT_URL];
            if (endpointUrl) {
                return endpointUrl;
            }
            return undefined;
        },
        configFileSelector: (profile, config)=>{
            if (profile.services) {
                const servicesSectionKey = [
                    "services",
                    profile.services
                ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
                if (!config || !config[servicesSectionKey]) {
                    throw new Error(`The services section "${profile.services}" specified in the profile is not present in the shared configuration file.`);
                }
                const servicesSection = config[servicesSectionKey];
                const servicePrefixParts = serviceId.split(" ").map((w)=>w.toLowerCase());
                const endpointUrl = servicesSection[[
                    servicePrefixParts.join("_"),
                    CONFIG_ENDPOINT_URL
                ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"])];
                if (endpointUrl) {
                    return endpointUrl;
                }
            }
            const endpointUrl = profile[CONFIG_ENDPOINT_URL];
            if (endpointUrl) {
                return endpointUrl;
            }
            return undefined;
        },
        default: undefined
    });
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/booleanSelector.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "booleanSelector",
    ()=>booleanSelector
]);
const booleanSelector = (obj, key, type)=>{
    if (!(key in obj)) {
        return undefined;
    }
    if (obj[key] === "true") {
        return true;
    }
    if (obj[key] === "false") {
        return false;
    }
    throw new Error(`Cannot load ${type} "${key}". Expected "true" or "false", got ${obj[key]}.`);
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/types.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SelectorType",
    ()=>SelectorType
]);
var SelectorType;
(function(SelectorType) {
    SelectorType["ENV"] = "env";
    SelectorType["CONFIG"] = "shared config entry";
})(SelectorType || (SelectorType = {}));
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getIgnoreConfiguredEndpointUrls.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS",
    ()=>CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS,
    "ENV_IGNORE_CONFIGURED_ENDPOINT_URLS",
    ()=>ENV_IGNORE_CONFIGURED_ENDPOINT_URLS,
    "ignoreConfiguredEndpointUrlsConfigSelectors",
    ()=>ignoreConfiguredEndpointUrlsConfigSelectors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$booleanSelector$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/booleanSelector.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/types.js [instrumentation] (ecmascript)");
;
const ENV_IGNORE_CONFIGURED_ENDPOINT_URLS = "AWS_IGNORE_CONFIGURED_ENDPOINT_URLS";
const CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS = "ignore_configured_endpoint_urls";
const ignoreConfiguredEndpointUrlsConfigSelectors = {
    environmentVariableSelector: (env)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$booleanSelector$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["booleanSelector"])(env, ENV_IGNORE_CONFIGURED_ENDPOINT_URLS, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SelectorType"].ENV),
    configFileSelector: (profile)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$booleanSelector$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["booleanSelector"])(profile, CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$types$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SelectorType"].CONFIG),
    default: false
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEndpointFromConfig",
    ()=>getEndpointFromConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointUrlConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointUrlConfig.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getIgnoreConfiguredEndpointUrls$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getIgnoreConfiguredEndpointUrls.js [instrumentation] (ecmascript)");
;
;
;
const getEndpointFromConfig = async (serviceId)=>{
    const ignore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getIgnoreConfiguredEndpointUrls$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ignoreConfiguredEndpointUrlsConfigSelectors"])();
    if (ignore) {
        return undefined;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadConfig"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointUrlConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEndpointUrlConfig"])(serviceId ?? ""))();
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DOT_PATTERN",
    ()=>DOT_PATTERN,
    "S3_HOSTNAME_PATTERN",
    ()=>S3_HOSTNAME_PATTERN,
    "isArnBucketName",
    ()=>isArnBucketName,
    "isDnsCompatibleBucketName",
    ()=>isDnsCompatibleBucketName,
    "resolveParamsForS3",
    ()=>resolveParamsForS3
]);
const resolveParamsForS3 = async (endpointParams)=>{
    const bucket = endpointParams?.Bucket || "";
    if (typeof endpointParams.Bucket === "string") {
        endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
    }
    if (isArnBucketName(bucket)) {
        if (endpointParams.ForcePathStyle === true) {
            throw new Error("Path-style addressing cannot be used with ARN buckets");
        }
    } else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) {
        endpointParams.ForcePathStyle = true;
    }
    if (endpointParams.DisableMultiRegionAccessPoints) {
        endpointParams.disableMultiRegionAccessPoints = true;
        endpointParams.DisableMRAP = true;
    }
    return endpointParams;
};
const DOMAIN_PATTERN = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
const IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
const DOTS_PATTERN = /\.\./;
const DOT_PATTERN = /\./;
const S3_HOSTNAME_PATTERN = /^(.+\.)?s3(-fips)?(\.dualstack)?[.-]([a-z0-9-]+)\./;
const isDnsCompatibleBucketName = (bucketName)=>DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
const isArnBucketName = (bucketName)=>{
    const [arn, partition, service, , , bucket] = bucketName.split(":");
    const isArn = arn === "arn" && bucketName.split(":").length >= 6;
    const isValidArn = Boolean(isArn && partition && service && bucket);
    if (isArn && !isValidArn) {
        throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
    }
    return isValidArn;
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createConfigValueProvider",
    ()=>createConfigValueProvider
]);
const createConfigValueProvider = (configKey, canonicalEndpointParamKey, config, isClientContextParam = false)=>{
    const configProvider = async ()=>{
        let configValue;
        if (isClientContextParam) {
            const clientContextParams = config.clientContextParams;
            const nestedValue = clientContextParams?.[configKey];
            configValue = nestedValue ?? config[configKey] ?? config[canonicalEndpointParamKey];
        } else {
            configValue = config[configKey] ?? config[canonicalEndpointParamKey];
        }
        if (typeof configValue === "function") {
            return configValue();
        }
        return configValue;
    };
    if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") {
        return async ()=>{
            const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
            const configValue = credentials?.credentialScope ?? credentials?.CredentialScope;
            return configValue;
        };
    }
    if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") {
        return async ()=>{
            const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
            const configValue = credentials?.accountId ?? credentials?.AccountId;
            return configValue;
        };
    }
    if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") {
        return async ()=>{
            if (config.isCustomEndpoint === false) {
                return undefined;
            }
            const endpoint = await configProvider();
            if (endpoint && typeof endpoint === "object") {
                if ("url" in endpoint) {
                    return endpoint.url.href;
                }
                if ("hostname" in endpoint) {
                    const { protocol, hostname, port, path } = endpoint;
                    return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
                }
            }
            return endpoint;
        };
    }
    return configProvider;
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasOwn",
    ()=>hasOwn
]);
function hasOwn(o, k) {
    return Object.prototype.hasOwnProperty.call(o, k);
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseQueryString",
    ()=>parseQueryString
]);
function parseQueryString(querystring) {
    const query = {};
    querystring = querystring.replace(/^\?/, "");
    if (querystring) {
        for (const pair of querystring.split("&")){
            let [key, value = null] = pair.split("=");
            key = decodeURIComponent(key);
            if (value) {
                value = decodeURIComponent(value);
            }
            if (!(key in query)) {
                query[key] = value;
            } else if (Array.isArray(query[key])) {
                query[key].push(value);
            } else {
                query[key] = [
                    query[key],
                    value
                ];
            }
        }
    }
    return query;
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUrl",
    ()=>parseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseQueryString$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js [instrumentation] (ecmascript)");
;
const parseUrl = (url)=>{
    if (typeof url === "string") {
        return parseUrl(new URL(url));
    }
    const { hostname, pathname, port, protocol, search } = url;
    let query;
    if (search) {
        query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseQueryString$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseQueryString"])(search);
    }
    return {
        hostname,
        port: port ? parseInt(port) : undefined,
        protocol,
        path: pathname,
        query
    };
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toEndpointV1",
    ()=>toEndpointV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$hasOwn$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js [instrumentation] (ecmascript)");
;
;
const toEndpointV1 = (endpoint)=>{
    if (typeof endpoint === "object") {
        if ("url" in endpoint) {
            const v1Endpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseUrl"])(endpoint.url);
            if (endpoint.headers) {
                v1Endpoint.headers = {};
                for(const name in endpoint.headers){
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$hasOwn$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasOwn"])(endpoint.headers, name)) {
                        continue;
                    }
                    v1Endpoint.headers[name.toLowerCase()] = endpoint.headers[name].join(", ");
                }
            }
            return v1Endpoint;
        }
        return endpoint;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseUrl"])(endpoint);
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindGetEndpointFromInstructions",
    ()=>bindGetEndpointFromInstructions,
    "resolveParams",
    ()=>resolveParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$service$2d$customizations$2f$s3$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$createConfigValueProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [instrumentation] (ecmascript)");
;
;
;
function bindGetEndpointFromInstructions(getEndpointFromConfig) {
    return async (commandInput, instructionsSupplier, clientConfig, context)=>{
        if (!clientConfig.isCustomEndpoint && !clientConfig.ignoreConfiguredEndpointUrls) {
            let endpointFromConfig;
            if (clientConfig.serviceConfiguredEndpoint) {
                endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
            } else {
                endpointFromConfig = await getEndpointFromConfig(clientConfig.serviceId);
            }
            if (endpointFromConfig) {
                clientConfig.endpoint = ()=>Promise.resolve((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["toEndpointV1"])(endpointFromConfig));
                clientConfig.isCustomEndpoint = true;
                context?.logger?.debug?.(`@smithy/core/endpoints - resolved endpoint from config: ${endpointFromConfig}`);
            }
        }
        const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
        if (typeof clientConfig.endpointProvider !== "function") {
            throw new Error("config.endpointProvider is not set.");
        }
        const endpoint = clientConfig.endpointProvider(endpointParams, context);
        if (clientConfig.isCustomEndpoint && clientConfig.endpoint) {
            const customEndpoint = await clientConfig.endpoint();
            if (customEndpoint?.headers) {
                endpoint.headers ??= {};
                for (const [name, value] of Object.entries(customEndpoint.headers)){
                    endpoint.headers[name] = Array.isArray(value) ? value : [
                        value
                    ];
                }
            }
        }
        return endpoint;
    };
}
const resolveParams = async (commandInput, instructionsSupplier, clientConfig)=>{
    const endpointParams = {};
    const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
    for (const [name, instruction] of Object.entries(instructions)){
        switch(instruction.type){
            case "staticContextParams":
                endpointParams[name] = instruction.value;
                break;
            case "contextParams":
                endpointParams[name] = commandInput[instruction.name];
                break;
            case "clientContextParams":
            case "builtInParams":
                endpointParams[name] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$createConfigValueProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["createConfigValueProvider"])(instruction.name, name, clientConfig, instruction.type !== "builtInParams")();
                break;
            case "operationContextParams":
                endpointParams[name] = instruction.get(commandInput);
                break;
            default:
                throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
        }
    }
    if (Object.keys(instructions).length === 0) {
        Object.assign(endpointParams, clientConfig);
    }
    if (String(clientConfig.serviceId).toLowerCase() === "s3") {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$service$2d$customizations$2f$s3$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveParamsForS3"])(endpointParams);
    }
    return endpointParams;
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSmithyContext",
    ()=>getSmithyContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$middleware$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/middleware.js [instrumentation] (ecmascript)");
;
const getSmithyContext = (context)=>context[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$middleware$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SMITHY_CONTEXT_KEY"]] || (context[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$middleware$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SMITHY_CONTEXT_KEY"]] = {});
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindEndpointMiddleware",
    ()=>bindEndpointMiddleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$getSmithyContext$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js [instrumentation] (ecmascript)");
;
;
function setFeature(context, feature, value) {
    if (!context.__smithy_context) {
        context.__smithy_context = {
            features: {}
        };
    } else if (!context.__smithy_context.features) {
        context.__smithy_context.features = {};
    }
    context.__smithy_context.features[feature] = value;
}
function bindEndpointMiddleware(getEndpointFromConfig) {
    const getEndpointFromInstructions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bindGetEndpointFromInstructions"])(getEndpointFromConfig);
    return ({ config, instructions })=>{
        return (next, context)=>async (args)=>{
                if (config.isCustomEndpoint) {
                    setFeature(context, "ENDPOINT_OVERRIDE", "N");
                }
                const endpoint = await getEndpointFromInstructions(args.input, {
                    getEndpointParameterInstructions () {
                        return instructions;
                    }
                }, {
                    ...config
                }, context);
                context.endpointV2 = endpoint;
                context.authSchemes = endpoint.properties?.authSchemes;
                const authScheme = context.authSchemes?.[0];
                if (authScheme) {
                    context["signing_region"] = authScheme.signingRegion;
                    context["signing_service"] = authScheme.signingName;
                    const smithyContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$getSmithyContext$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSmithyContext"])(context);
                    const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
                    if (httpAuthOption) {
                        httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
                            signing_region: authScheme.signingRegion,
                            signingRegion: authScheme.signingRegion,
                            signing_service: authScheme.signingName,
                            signingName: authScheme.signingName,
                            signingRegionSet: authScheme.signingRegionSet
                        }, authScheme.properties);
                    }
                }
                return next({
                    ...args
                });
            };
    };
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/getEndpointPlugin.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindGetEndpointPlugin",
    ()=>bindGetEndpointPlugin,
    "endpointMiddlewareOptions",
    ()=>endpointMiddlewareOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js [instrumentation] (ecmascript)");
;
const serializerMiddlewareOption = {
    name: "serializerMiddleware",
    step: "serialize",
    tags: [
        "SERIALIZER"
    ],
    override: true
};
const endpointMiddlewareOptions = {
    step: "serialize",
    tags: [
        "ENDPOINT_PARAMETERS",
        "ENDPOINT_V2",
        "ENDPOINT"
    ],
    name: "endpointV2Middleware",
    override: true,
    relation: "before",
    toMiddleware: serializerMiddlewareOption.name
};
function bindGetEndpointPlugin(getEndpointFromConfig) {
    const endpointMiddleware = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bindEndpointMiddleware"])(getEndpointFromConfig);
    return (config, instructions)=>({
            applyToStack: (clientStack)=>{
                clientStack.addRelativeTo(endpointMiddleware({
                    config,
                    instructions
                }), endpointMiddlewareOptions);
            }
        });
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeProvider",
    ()=>normalizeProvider
]);
const normalizeProvider = (input)=>{
    if (typeof input === "function") {
        return input;
    }
    const promisified = Promise.resolve(input);
    return ()=>promisified;
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindResolveEndpointConfig",
    ()=>bindResolveEndpointConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [instrumentation] (ecmascript)");
;
;
function bindResolveEndpointConfig(getEndpointFromConfig) {
    return (input)=>{
        const tls = input.tls ?? true;
        const { endpoint, useDualstackEndpoint, useFipsEndpoint } = input;
        const customEndpointProvider = endpoint != null ? async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["toEndpointV1"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProvider"])(endpoint)()) : undefined;
        const isCustomEndpoint = !!endpoint;
        const resolvedConfig = Object.assign(input, {
            endpoint: customEndpointProvider,
            tls,
            isCustomEndpoint,
            useDualstackEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProvider"])(useDualstackEndpoint ?? false),
            useFipsEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProvider"])(useFipsEndpoint ?? false),
            ignoreConfiguredEndpointUrls: !!input.ignoreConfiguredEndpointUrls
        });
        let configuredEndpointPromise = undefined;
        resolvedConfig.serviceConfiguredEndpoint = async ()=>{
            if (input.serviceId && !configuredEndpointPromise) {
                configuredEndpointPromise = getEndpointFromConfig(input.serviceId);
            }
            return configuredEndpointPromise;
        };
        return resolvedConfig;
    };
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "endpointMiddleware",
    ()=>endpointMiddleware,
    "getEndpointFromInstructions",
    ()=>getEndpointFromInstructions,
    "getEndpointPlugin",
    ()=>getEndpointPlugin,
    "resolveEndpointConfig",
    ()=>resolveEndpointConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$getEndpointPlugin$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/getEndpointPlugin.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$resolveEndpointConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js [instrumentation] (ecmascript)");
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
const getEndpointFromInstructions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bindGetEndpointFromInstructions"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
const resolveEndpointConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$resolveEndpointConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bindResolveEndpointConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
const endpointMiddleware = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bindEndpointMiddleware"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
const getEndpointPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$getEndpointPlugin$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bindGetEndpointPlugin"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
;
;
;
;
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extendedEncodeURIComponent",
    ()=>extendedEncodeURIComponent
]);
function extendedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
}
}),
"[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/profile.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IniSectionType",
    ()=>IniSectionType
]);
var IniSectionType;
(function(IniSectionType) {
    IniSectionType["PROFILE"] = "profile";
    IniSectionType["SSO_SESSION"] = "sso-session";
    IniSectionType["SERVICES"] = "services";
})(IniSectionType || (IniSectionType = {}));
}),
"[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/middleware.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SMITHY_CONTEXT_KEY",
    ()=>SMITHY_CONTEXT_KEY
]);
const SMITHY_CONTEXT_KEY = "__smithy_context";
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.shared.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runtimeConfigShared",
    ()=>runtimeConfigShared
]);
const runtimeConfigShared = {
    statSync: ()=>{},
    isFileReadStream (f) {
        return false;
    }
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runtimeConfig",
    ()=>runtimeConfig
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$shared$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.shared.js [instrumentation] (ecmascript)");
;
;
const runtimeConfig = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$shared$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["runtimeConfigShared"],
    runtime: "node",
    statSync: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["statSync"],
    isFileReadStream (f) {
        return f instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["ReadStream"];
    }
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLength.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "byteLength",
    ()=>byteLength
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.js [instrumentation] (ecmascript)");
;
;
const byteLength = (input)=>{
    if (input == null) {
        return 0;
    }
    if (typeof input === "string") {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].byteLength(input);
    }
    if (typeof input.byteLength === "number") {
        return input.byteLength;
    } else if (typeof input.length === "number") {
        return input.length;
    } else if (typeof input.size === "number") {
        return input.size;
    } else if (typeof input.start === "number" && typeof input.end === "number") {
        return input.end + 1 - input.start;
    } else if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["runtimeConfig"].isFileReadStream(input)) {
        try {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["runtimeConfig"].statSync(input.path).size;
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLengthSource.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BYTE_LENGTH_SOURCE",
    ()=>BYTE_LENGTH_SOURCE,
    "byteLengthSource",
    ()=>byteLengthSource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.js [instrumentation] (ecmascript)");
;
var BYTE_LENGTH_SOURCE;
(function(BYTE_LENGTH_SOURCE) {
    BYTE_LENGTH_SOURCE["EMPTY_INPUT"] = "a null or undefined Body";
    BYTE_LENGTH_SOURCE["CONTENT_LENGTH"] = "the ContentLength property of the params set by the caller";
    BYTE_LENGTH_SOURCE["STRING_LENGTH"] = "the encoded byte length of the Body string";
    BYTE_LENGTH_SOURCE["TYPED_ARRAY"] = "the byteLength of a typed byte array such as Uint8Array";
    BYTE_LENGTH_SOURCE["LENGTH"] = "the value of Body.length";
    BYTE_LENGTH_SOURCE["SIZE"] = "the value of Body.size";
    BYTE_LENGTH_SOURCE["START_END_DIFF"] = "the numeric difference between Body.start and Body.end";
    BYTE_LENGTH_SOURCE["STAT"] = "the size of the file given by Body.path on disk as reported by statSync";
})(BYTE_LENGTH_SOURCE || (BYTE_LENGTH_SOURCE = {}));
const byteLengthSource = (input, override)=>{
    if (override != null) {
        return BYTE_LENGTH_SOURCE.CONTENT_LENGTH;
    }
    if (input == null) {
        return BYTE_LENGTH_SOURCE.EMPTY_INPUT;
    }
    if (typeof input === "string") {
        return BYTE_LENGTH_SOURCE.STRING_LENGTH;
    }
    if (typeof input.byteLength === "number") {
        return BYTE_LENGTH_SOURCE.TYPED_ARRAY;
    } else if (typeof input.length === "number") {
        return BYTE_LENGTH_SOURCE.LENGTH;
    } else if (typeof input.size === "number") {
        return BYTE_LENGTH_SOURCE.SIZE;
    } else if (typeof input.start === "number" && typeof input.end === "number") {
        return BYTE_LENGTH_SOURCE.START_END_DIFF;
    } else if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["runtimeConfig"].isFileReadStream(input)) {
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["runtimeConfig"].statSync(input.path).size;
            return BYTE_LENGTH_SOURCE.STAT;
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkStream.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getChunkStream",
    ()=>getChunkStream
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
;
async function* getChunkStream(data, partSize, getNextData) {
    let partNumber = 1;
    const currentBuffer = {
        chunks: [],
        length: 0
    };
    for await (const datum of getNextData(data)){
        currentBuffer.chunks.push(datum);
        currentBuffer.length += datum.byteLength;
        while(currentBuffer.length > partSize){
            const dataChunk = currentBuffer.chunks.length > 1 ? __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].concat(currentBuffer.chunks) : currentBuffer.chunks[0];
            yield {
                partNumber,
                data: dataChunk.subarray(0, partSize)
            };
            currentBuffer.chunks = [
                dataChunk.subarray(partSize)
            ];
            currentBuffer.length = currentBuffer.chunks[0].byteLength;
            partNumber += 1;
        }
    }
    yield {
        partNumber,
        data: currentBuffer.chunks.length !== 1 ? __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].concat(currentBuffer.chunks) : currentBuffer.chunks[0],
        lastPart: true
    };
}
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkUint8Array.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getChunkUint8Array",
    ()=>getChunkUint8Array
]);
async function* getChunkUint8Array(data, partSize) {
    let partNumber = 1;
    let startByte = 0;
    let endByte = partSize;
    while(endByte < data.byteLength){
        yield {
            partNumber,
            data: data.subarray(startByte, endByte)
        };
        partNumber += 1;
        startByte = endByte;
        endByte = startByte + partSize;
    }
    yield {
        partNumber,
        data: data.subarray(startByte),
        lastPart: true
    };
}
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadable.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDataReadable",
    ()=>getDataReadable
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
;
async function* getDataReadable(data) {
    for await (const chunk of data){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].isBuffer(chunk) || chunk instanceof Uint8Array) {
            yield chunk;
        } else {
            yield __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(chunk);
        }
    }
}
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadableStream.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDataReadableStream",
    ()=>getDataReadableStream
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
;
async function* getDataReadableStream(data) {
    const reader = data.getReader();
    try {
        while(true){
            const { done, value } = await reader.read();
            if (done) {
                return;
            }
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].isBuffer(value) || value instanceof Uint8Array) {
                yield value;
            } else {
                yield __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(value);
            }
        }
    } catch (e) {
        throw e;
    } finally{
        reader.releaseLock();
    }
}
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunker.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getChunk",
    ()=>getChunk
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkStream.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkUint8Array$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkUint8Array.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadable$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadable.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadableStream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadableStream.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
const getChunk = (data, partSize)=>{
    if (data instanceof Uint8Array) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkUint8Array$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChunkUint8Array"])(data, partSize);
    }
    if (data instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["Readable"]) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChunkStream"])(data, partSize, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadable$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDataReadable"]);
    }
    if (data instanceof String || typeof data === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkUint8Array$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChunkUint8Array"])(__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(data), partSize);
    }
    if (typeof data.stream === "function") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChunkStream"])(data.stream(), partSize, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadableStream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDataReadableStream"]);
    }
    if (data instanceof ReadableStream) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChunkStream"])(data, partSize, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadableStream$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDataReadableStream"]);
    }
    throw new Error("Body Data is unsupported format, expected data to be one of: string | Uint8Array | Buffer | Readable | ReadableStream | Blob;.");
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/Upload.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Upload",
    ()=>Upload
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/.pnpm/@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/client-s3)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$extended$2d$encode$2d$uri$2d$component$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/events [external] (events, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLength.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLengthSource$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLengthSource.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunker$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunker.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
class Upload extends __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"] {
    static MIN_PART_SIZE = 1024 * 1024 * 5;
    MAX_PARTS = 10_000;
    queueSize = 4;
    partSize;
    leavePartsOnError = false;
    tags = [];
    client;
    params;
    totalBytes;
    totalBytesSource;
    bytesUploadedSoFar;
    abortController;
    concurrentUploaders = [];
    createMultiPartPromise;
    abortMultipartUploadCommand = null;
    uploadedParts = [];
    uploadEnqueuedPartsCount = 0;
    expectedPartsCount;
    uploadId;
    uploadEvent;
    isMultiPart = true;
    singleUploadResult;
    sent = false;
    constructor(options){
        super();
        this.queueSize = options.queueSize || this.queueSize;
        this.leavePartsOnError = options.leavePartsOnError || this.leavePartsOnError;
        this.tags = options.tags || this.tags;
        this.client = options.client;
        this.params = options.params;
        if (!this.params) {
            throw new Error(`InputError: Upload requires params to be passed to upload.`);
        }
        this.totalBytes = this.params.ContentLength ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["byteLength"])(this.params.Body);
        this.totalBytesSource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLengthSource$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["byteLengthSource"])(this.params.Body, this.params.ContentLength);
        this.bytesUploadedSoFar = 0;
        this.abortController = options.abortController ?? new AbortController();
        this.partSize = options.partSize || Math.max(Upload.MIN_PART_SIZE, Math.ceil((this.totalBytes || 0) / this.MAX_PARTS));
        if (this.totalBytes !== undefined) {
            this.expectedPartsCount = Math.ceil(this.totalBytes / this.partSize);
        }
        this.__validateInput();
    }
    async abort() {
        this.abortController.abort();
    }
    async done() {
        if (this.sent) {
            throw new Error("@aws-sdk/lib-storage: this instance of Upload has already executed .done(). Create a new instance.");
        }
        this.sent = true;
        return await Promise.race([
            this.__doMultipartUpload(),
            this.__abortTimeout(this.abortController.signal)
        ]);
    }
    on(event, listener) {
        this.uploadEvent = event;
        return super.on(event, listener);
    }
    async __uploadUsingPut(dataPart) {
        this.isMultiPart = false;
        const params = {
            ...this.params,
            Body: dataPart.data
        };
        const clientConfig = this.client.config;
        const requestHandler = clientConfig.requestHandler;
        const eventEmitter = requestHandler instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"] ? requestHandler : null;
        const uploadEventListener = (event)=>{
            this.bytesUploadedSoFar = event.loaded;
            this.totalBytes = event.total;
            this.__notifyProgress({
                loaded: this.bytesUploadedSoFar,
                total: this.totalBytes,
                part: dataPart.partNumber,
                Key: this.params.Key,
                Bucket: this.params.Bucket
            });
        };
        if (eventEmitter !== null) {
            eventEmitter.on("xhr.upload.progress", uploadEventListener);
        }
        const resolved = await Promise.all([
            this.client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["PutObjectCommand"](params)),
            clientConfig?.endpoint?.()
        ]);
        const putResult = resolved[0];
        let endpoint = resolved[1];
        if (!endpoint) {
            endpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["toEndpointV1"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEndpointFromInstructions"])(params, __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["PutObjectCommand"], {
                ...clientConfig
            }));
        }
        if (!endpoint) {
            throw new Error('Could not resolve endpoint from S3 "client.config.endpoint()" nor EndpointsV2.');
        }
        if (eventEmitter !== null) {
            eventEmitter.off("xhr.upload.progress", uploadEventListener);
        }
        const locationKey = this.params.Key.split("/").map((segment)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$extended$2d$encode$2d$uri$2d$component$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["extendedEncodeURIComponent"])(segment)).join("/");
        const locationBucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$extended$2d$encode$2d$uri$2d$component$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["extendedEncodeURIComponent"])(this.params.Bucket);
        const Location = (()=>{
            const endpointHostnameIncludesBucket = endpoint.hostname.startsWith(`${locationBucket}.`);
            const forcePathStyle = this.client.config.forcePathStyle;
            const optionalPort = endpoint.port ? `:${endpoint.port}` : ``;
            if (forcePathStyle) {
                return `${endpoint.protocol}//${endpoint.hostname}${optionalPort}/${locationBucket}/${locationKey}`;
            }
            if (endpointHostnameIncludesBucket) {
                return `${endpoint.protocol}//${endpoint.hostname}${optionalPort}/${locationKey}`;
            }
            return `${endpoint.protocol}//${locationBucket}.${endpoint.hostname}${optionalPort}/${locationKey}`;
        })();
        this.singleUploadResult = {
            ...putResult,
            Bucket: this.params.Bucket,
            Key: this.params.Key,
            Location
        };
        const totalSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["byteLength"])(dataPart.data);
        this.__notifyProgress({
            loaded: totalSize,
            total: totalSize,
            part: 1,
            Key: this.params.Key,
            Bucket: this.params.Bucket
        });
    }
    async __createMultipartUpload() {
        const requestChecksumCalculation = await this.client.config.requestChecksumCalculation();
        if (!this.createMultiPartPromise) {
            const createCommandParams = {
                ...this.params,
                Body: undefined
            };
            if (requestChecksumCalculation === "WHEN_SUPPORTED") {
                createCommandParams.ChecksumAlgorithm = this.params.ChecksumAlgorithm || __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["ChecksumAlgorithm"].CRC32;
            }
            this.createMultiPartPromise = this.client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["CreateMultipartUploadCommand"](createCommandParams)).then((createMpuResponse)=>{
                this.abortMultipartUploadCommand = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["AbortMultipartUploadCommand"]({
                    Bucket: this.params.Bucket,
                    Key: this.params.Key,
                    UploadId: createMpuResponse.UploadId
                });
                return createMpuResponse;
            });
        }
        return this.createMultiPartPromise;
    }
    async __doConcurrentUpload(dataFeeder) {
        for await (const dataPart of dataFeeder){
            if (this.uploadEnqueuedPartsCount > this.MAX_PARTS) {
                throw new Error(`Exceeded ${this.MAX_PARTS} parts in multipart upload to Bucket: ${this.params.Bucket} Key: ${this.params.Key}.`);
            }
            if (this.abortController.signal.aborted) {
                return;
            }
            if (dataPart.partNumber === 1 && dataPart.lastPart) {
                return await this.__uploadUsingPut(dataPart);
            }
            if (!this.uploadId) {
                const { UploadId } = await this.__createMultipartUpload();
                this.uploadId = UploadId;
                if (this.abortController.signal.aborted) {
                    return;
                }
            }
            const partSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["byteLength"])(dataPart.data) || 0;
            const requestHandler = this.client.config.requestHandler;
            const eventEmitter = requestHandler instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"] ? requestHandler : null;
            let lastSeenBytes = 0;
            const uploadEventListener = (event, request)=>{
                const requestPartSize = Number(request.query["partNumber"]) || -1;
                if (requestPartSize !== dataPart.partNumber) {
                    return;
                }
                if (event.total && partSize) {
                    this.bytesUploadedSoFar += event.loaded - lastSeenBytes;
                    lastSeenBytes = event.loaded;
                }
                this.__notifyProgress({
                    loaded: this.bytesUploadedSoFar,
                    total: this.totalBytes,
                    part: dataPart.partNumber,
                    Key: this.params.Key,
                    Bucket: this.params.Bucket
                });
            };
            if (eventEmitter !== null) {
                eventEmitter.on("xhr.upload.progress", uploadEventListener);
            }
            this.uploadEnqueuedPartsCount += 1;
            this.__validateUploadPart(dataPart);
            const partResult = await this.client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["UploadPartCommand"]({
                ...this.params,
                ContentLength: undefined,
                UploadId: this.uploadId,
                Body: dataPart.data,
                PartNumber: dataPart.partNumber
            }));
            if (eventEmitter !== null) {
                eventEmitter.off("xhr.upload.progress", uploadEventListener);
            }
            if (this.abortController.signal.aborted) {
                return;
            }
            if (!partResult.ETag) {
                throw new Error(`Part ${dataPart.partNumber} is missing ETag in UploadPart response. Missing Bucket CORS configuration for ETag header?`);
            }
            this.uploadedParts.push({
                PartNumber: dataPart.partNumber,
                ETag: partResult.ETag,
                ...partResult.ChecksumCRC32 && {
                    ChecksumCRC32: partResult.ChecksumCRC32
                },
                ...partResult.ChecksumCRC32C && {
                    ChecksumCRC32C: partResult.ChecksumCRC32C
                },
                ...partResult.ChecksumSHA1 && {
                    ChecksumSHA1: partResult.ChecksumSHA1
                },
                ...partResult.ChecksumSHA256 && {
                    ChecksumSHA256: partResult.ChecksumSHA256
                }
            });
            if (eventEmitter === null) {
                this.bytesUploadedSoFar += partSize;
            }
            this.__notifyProgress({
                loaded: this.bytesUploadedSoFar,
                total: this.totalBytes,
                part: dataPart.partNumber,
                Key: this.params.Key,
                Bucket: this.params.Bucket
            });
        }
    }
    async __doMultipartUpload() {
        const dataFeeder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunker$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChunk"])(this.params.Body, this.partSize);
        const concurrentUploaderFailures = [];
        for(let index = 0; index < this.queueSize; index++){
            const currentUpload = this.__doConcurrentUpload(dataFeeder).catch((err)=>{
                concurrentUploaderFailures.push(err);
            });
            this.concurrentUploaders.push(currentUpload);
        }
        await Promise.all(this.concurrentUploaders);
        if (concurrentUploaderFailures.length >= 1) {
            await this.markUploadAsAborted();
            throw concurrentUploaderFailures[0];
        }
        if (this.abortController.signal.aborted) {
            await this.markUploadAsAborted();
            throw Object.assign(new Error("Upload aborted."), {
                name: "AbortError"
            });
        }
        let result;
        if (this.isMultiPart) {
            const { expectedPartsCount, uploadedParts, totalBytes, totalBytesSource } = this;
            if (totalBytes !== undefined && expectedPartsCount !== undefined && uploadedParts.length !== expectedPartsCount) {
                await this.markUploadAsAborted();
                throw new Error(`Expected ${expectedPartsCount} part(s) but uploaded ${uploadedParts.length} part(s).
The expected part count is based on the byte-count of the input.params.Body,
which was read from ${totalBytesSource} and is ${totalBytes}.
If this is not correct, provide an override value by setting a number
to input.params.ContentLength in bytes.
`);
            }
            this.uploadedParts.sort((a, b)=>a.PartNumber - b.PartNumber);
            const uploadCompleteParams = {
                ...this.params,
                Body: undefined,
                UploadId: this.uploadId,
                MultipartUpload: {
                    Parts: this.uploadedParts
                }
            };
            result = await this.client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["CompleteMultipartUploadCommand"](uploadCompleteParams));
            if (typeof result?.Location === "string" && result.Location.includes("%2F")) {
                result.Location = result.Location.replace(/%2F/g, "/");
            }
        } else {
            result = this.singleUploadResult;
        }
        this.abortMultipartUploadCommand = null;
        if (this.tags.length) {
            await this.client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["PutObjectTaggingCommand"]({
                ...this.params,
                Tagging: {
                    TagSet: this.tags
                }
            }));
        }
        return result;
    }
    async markUploadAsAborted() {
        if (this.uploadId && !this.leavePartsOnError && null !== this.abortMultipartUploadCommand) {
            await this.client.send(this.abortMultipartUploadCommand);
            this.abortMultipartUploadCommand = null;
        }
    }
    __notifyProgress(progress) {
        if (this.uploadEvent) {
            this.emit(this.uploadEvent, progress);
        }
    }
    async __abortTimeout(abortSignal) {
        return new Promise((resolve, reject)=>{
            abortSignal.onabort = ()=>{
                const abortError = new Error("Upload aborted.");
                abortError.name = "AbortError";
                reject(abortError);
            };
        });
    }
    __validateUploadPart(dataPart) {
        const actualPartSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["byteLength"])(dataPart.data);
        if (actualPartSize === undefined) {
            throw new Error(`A dataPart was generated without a measurable data chunk size for part number ${dataPart.partNumber}`);
        }
        if (dataPart.partNumber === 1 && dataPart.lastPart) {
            return;
        }
        if (!dataPart.lastPart && actualPartSize !== this.partSize) {
            throw new Error(`The byte size for part number ${dataPart.partNumber}, size ${actualPartSize} does not match expected size ${this.partSize}`);
        }
    }
    __validateInput() {
        if (!this.client) {
            throw new Error(`InputError: Upload requires a AWS client to do uploads with.`);
        }
        if (this.partSize < Upload.MIN_PART_SIZE) {
            throw new Error(`EntityTooSmall: Your proposed upload part size [${this.partSize}] is smaller than the minimum allowed size [${Upload.MIN_PART_SIZE}] (5MB)`);
        }
        if (this.queueSize < 1) {
            throw new Error(`Queue size: Must have at least one uploading queue.`);
        }
    }
}
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$Upload$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/Upload.js [instrumentation] (ecmascript)");
;
}),
"[externals]/sharp [external] (sharp, esm_import, [project]/node_modules/.pnpm/sharp@0.35.5_@types+node@22.20.5/node_modules/sharp)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("sharp-5b8fb420cf576716");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0orkb87._.js.map