module.exports = [
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__exportAll",
    ()=>__exportAll
]);
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols)=>{
    let target = {};
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
    if (!no_symbols) __defProp(target, Symbol.toStringTag, {
        value: "Module"
    });
    return target;
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/map_keys.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "keyFromJson",
    ()=>keyFromJson,
    "keyToJson",
    ()=>keyToJson,
    "mapKeys",
    ()=>mapKeys
]);
//#region src/load/map_keys.ts
const UPPER_TO_WORD_BOUNDARY = /([A-Z]+)([A-Z][a-z0-9]+)/g;
const LOWER_TO_UPPER_BOUNDARY = /([a-z0-9])([A-Z])/g;
const SEPARATORS = /[-_\s]+/g;
function snakeCase(key) {
    return key.replace(UPPER_TO_WORD_BOUNDARY, "$1_$2").replace(LOWER_TO_UPPER_BOUNDARY, "$1_$2").replace(SEPARATORS, "_").toLowerCase();
}
function camelCase(key) {
    const trimmed = key.trim();
    if (!/[-_\s]/.test(trimmed)) return trimmed;
    return trimmed.replace(SEPARATORS, "_").toLowerCase().replace(/_+([a-z0-9])/g, (_, char)=>char.toUpperCase());
}
function keyToJson(key, map) {
    return map?.[key] || snakeCase(key);
}
function keyFromJson(key, map) {
    return map?.[key] || camelCase(key);
}
function mapKeys(fields, mapper, map) {
    const mapped = {};
    for(const key in fields)if (Object.hasOwn(fields, key)) mapped[mapper(key, map)] = fields[key];
    return mapped;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/validation.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LC_ESCAPED_KEY",
    ()=>LC_ESCAPED_KEY,
    "escapeIfNeeded",
    ()=>escapeIfNeeded,
    "escapeObject",
    ()=>escapeObject,
    "isEscapedObject",
    ()=>isEscapedObject,
    "needsEscaping",
    ()=>needsEscaping,
    "unescapeValue",
    ()=>unescapeValue
]);
//#region src/load/validation.ts
/**
* Sentinel key used to mark escaped user objects during serialization.
*
* When a plain object contains 'lc' key (which could be confused with LC objects),
* we wrap it as `{"__lc_escaped__": {...original...}}`.
*/ const LC_ESCAPED_KEY = "__lc_escaped__";
/**
* Check if an object needs escaping to prevent confusion with LC objects.
*
* An object needs escaping if:
* 1. It has an `'lc'` key (could be confused with LC serialization format)
* 2. It has only the escape key (would be mistaken for an escaped object)
*/ function needsEscaping(obj) {
    return "lc" in obj || Object.keys(obj).length === 1 && "__lc_escaped__" in obj;
}
/**
* Wrap an object in the escape marker.
*
* @example
* ```typescript
* {"key": "value"}  // becomes {"__lc_escaped__": {"key": "value"}}
* ```
*/ function escapeObject(obj) {
    return {
        [LC_ESCAPED_KEY]: obj
    };
}
/**
* Check if an object is an escaped user object.
*
* @example
* ```typescript
* {"__lc_escaped__": {...}}  // is an escaped object
* ```
*/ function isEscapedObject(obj) {
    return Object.keys(obj).length === 1 && "__lc_escaped__" in obj;
}
/**
* Check if an object looks like a Serializable instance (duck typing).
*/ function isSerializableLike(obj) {
    return obj !== null && typeof obj === "object" && "lc_serializable" in obj && typeof obj.toJSON === "function";
}
/**
* Create a "not_implemented" serialization result for objects that cannot be serialized.
*/ function createNotImplemented(obj) {
    let id;
    if (obj !== null && typeof obj === "object") {
        if ("lc_id" in obj && Array.isArray(obj.lc_id)) id = obj.lc_id;
        else id = [
            obj.constructor?.name ?? "Object"
        ];
    } else id = [
        typeof obj
    ];
    return {
        lc: 1,
        type: "not_implemented",
        id
    };
}
/**
* Escape a value if it needs escaping (contains `lc` key).
*
* This is a simpler version of `serializeValue` that doesn't handle Serializable
* objects - it's meant to be called on kwargs values that have already been
* processed by `toJSON()`.
*
* @param value - The value to potentially escape.
* @param pathSet - WeakSet to track ancestor objects in the current path to detect circular references.
*                  Objects are removed after processing to allow shared references (same object in
*                  multiple places) while still detecting true circular references (ancestor in descendant).
* @returns The value with any `lc`-containing objects wrapped in escape markers.
*/ function escapeIfNeeded(value, pathSet = /* @__PURE__ */ new WeakSet()) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        if (pathSet.has(value)) return createNotImplemented(value);
        if (isSerializableLike(value)) return value;
        pathSet.add(value);
        const record = value;
        if (needsEscaping(record)) {
            pathSet.delete(value);
            return escapeObject(record);
        }
        const result = {};
        for (const [key, val] of Object.entries(record))result[key] = escapeIfNeeded(val, pathSet);
        pathSet.delete(value);
        return result;
    }
    if (Array.isArray(value)) return value.map((item)=>escapeIfNeeded(item, pathSet));
    return value;
}
/**
* Unescape a value, processing escape markers in object values and arrays.
*
* When an escaped object is encountered (`{"__lc_escaped__": ...}`), it's
* unwrapped and the contents are returned AS-IS (no further processing).
* The contents represent user data that should not be modified.
*
* For regular objects and arrays, we recurse to find any nested escape markers.
*
* @param obj - The value to unescape.
* @returns The unescaped value.
*/ function unescapeValue(obj) {
    if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
        const record = obj;
        if (isEscapedObject(record)) return record[LC_ESCAPED_KEY];
        const result = {};
        for (const [key, value] of Object.entries(record))result[key] = unescapeValue(value);
        return result;
    }
    if (Array.isArray(obj)) return obj.map((item)=>unescapeValue(item));
    return obj;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Serializable",
    ()=>Serializable,
    "get_lc_unique_name",
    ()=>get_lc_unique_name,
    "serializable_exports",
    ()=>serializable_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/map_keys.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$validation$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/validation.js [app-rsc] (ecmascript)");
;
;
;
//#region src/load/serializable.ts
var serializable_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    Serializable: ()=>Serializable,
    get_lc_unique_name: ()=>get_lc_unique_name
});
function shallowCopy(obj) {
    return Array.isArray(obj) ? [
        ...obj
    ] : {
        ...obj
    };
}
function replaceSecrets(root, secretsMap) {
    const result = shallowCopy(root);
    for (const [path, secretId] of Object.entries(secretsMap)){
        const [last, ...partsReverse] = path.split(".").reverse();
        let current = result;
        for (const part of partsReverse.reverse()){
            if (current[part] === void 0) break;
            current[part] = shallowCopy(current[part]);
            current = current[part];
        }
        if (current[last] !== void 0) current[last] = {
            lc: 1,
            type: "secret",
            id: [
                secretId
            ]
        };
    }
    return result;
}
/**
* Get a unique name for the module, rather than parent class implementations.
* Should not be subclassed, subclass lc_name above instead.
*/ function get_lc_unique_name(serializableClass) {
    const parentClass = Object.getPrototypeOf(serializableClass);
    if (typeof serializableClass.lc_name === "function" && (typeof parentClass.lc_name !== "function" || serializableClass.lc_name() !== parentClass.lc_name())) return serializableClass.lc_name();
    else return serializableClass.name;
}
var Serializable = class Serializable {
    lc_serializable = false;
    lc_kwargs;
    /**
	* The name of the serializable. Override to provide an alias or
	* to preserve the serialized module name in minified environments.
	*
	* Implemented as a static method to support loading logic.
	*/ static lc_name() {
        return this.name;
    }
    /**
	* The final serialized identifier for the module.
	*/ get lc_id() {
        return [
            ...this.lc_namespace,
            get_lc_unique_name(this.constructor)
        ];
    }
    /**
	* A map of secrets, which will be omitted from serialization.
	* Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
	* Values are the secret ids, which will be used when deserializing.
	*/ get lc_secrets() {}
    /**
	* A map of additional attributes to merge with constructor args.
	* Keys are the attribute names, e.g. "foo".
	* Values are the attribute values, which will be serialized.
	* These attributes need to be accepted by the constructor as arguments.
	*/ get lc_attributes() {}
    /**
	* A map of aliases for constructor args.
	* Keys are the attribute names, e.g. "foo".
	* Values are the alias that will replace the key in serialization.
	* This is used to eg. make argument names match Python.
	*/ get lc_aliases() {}
    /**
	* A manual list of keys that should be serialized.
	* If not overridden, all fields passed into the constructor will be serialized.
	*/ get lc_serializable_keys() {}
    constructor(kwargs, ..._args){
        if (this.lc_serializable_keys !== void 0) this.lc_kwargs = Object.fromEntries(Object.entries(kwargs || {}).filter(([key])=>this.lc_serializable_keys?.includes(key)));
        else this.lc_kwargs = kwargs ?? {};
    }
    toJSON() {
        if (!this.lc_serializable) return this.toJSONNotImplemented();
        if (this.lc_kwargs instanceof Serializable || typeof this.lc_kwargs !== "object" || Array.isArray(this.lc_kwargs)) return this.toJSONNotImplemented();
        const aliases = {};
        const secrets = {};
        const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key)=>{
            acc[key] = key in this ? this[key] : this.lc_kwargs[key];
            return acc;
        }, {});
        for(let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)){
            Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
            Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
            Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
        }
        Object.keys(secrets).forEach((keyPath)=>{
            let read = this;
            let write = kwargs;
            const [last, ...partsReverse] = keyPath.split(".").reverse();
            for (const key of partsReverse.reverse()){
                if (!(key in read) || read[key] === void 0) return;
                if (!(key in write) || write[key] === void 0) {
                    if (typeof read[key] === "object" && read[key] != null) write[key] = {};
                    else if (Array.isArray(read[key])) write[key] = [];
                }
                read = read[key];
                write = write[key];
            }
            if (last in read && read[last] !== void 0) write[last] = write[last] || read[last];
        });
        const escapedKwargs = {};
        const pathSet = /* @__PURE__ */ new WeakSet();
        pathSet.add(this);
        for (const [key, value] of Object.entries(kwargs))escapedKwargs[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$validation$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["escapeIfNeeded"])(value, pathSet);
        const kwargsWithSecrets = Object.keys(secrets).length ? replaceSecrets(escapedKwargs, secrets) : escapedKwargs;
        const processedKwargs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapKeys"])(kwargsWithSecrets, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["keyToJson"], aliases);
        return {
            lc: 1,
            type: "constructor",
            id: this.lc_id,
            kwargs: processedKwargs
        };
    }
    toJSONNotImplemented() {
        return {
            lc: 1,
            type: "not_implemented",
            id: this.lc_id
        };
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/import_constants.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "optionalImportEntrypoints",
    ()=>optionalImportEntrypoints
]);
//#region src/load/import_constants.ts
/** Auto-generated by import-constants plugin. Do not edit manually */ const optionalImportEntrypoints = [];
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/import_map.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "import_map_exports",
    ()=>import_map_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$agents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/agents.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/hash.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$caches$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/caches/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/console.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/tracer_langchain.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$promises$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/promises.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/log_stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/async_caller.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/standard_schema.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/graph.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$chat_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/chat_history.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$document_loaders$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/document_loaders/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$document_loaders$2f$langsmith$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/document_loaders/langsmith.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/embeddings.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/indexing/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompt_values.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/tiktoken.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_patch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_patch.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$structured_output$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/structured_output.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$compat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/compat.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/chat_models.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$openai_completions_stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/openai_completions_stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/event.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/llms.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$profile$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/profile.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$memory$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/memory.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_functions$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_functions/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_tools/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$document_compressors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/retrievers/document_compressors/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/retrievers/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$stores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/stores.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/testing/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$run_collector$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/run_collector.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$types$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/types/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$chunk_array$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/chunk_array.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/context.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$event_source_parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/event_source_parse.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$format$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/format.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$function_calling$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/function_calling.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$gateway$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/gateway.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$math$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/math.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ssrf$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ssrf.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$vectorstores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/vectorstores.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/index.js [app-rsc] (ecmascript) <locals>");
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
//#region src/load/import_map.ts
var import_map_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    agents: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$agents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["agents_exports"],
    caches: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$caches$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["caches_exports"],
    callbacks__base: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["base_exports"],
    callbacks__manager: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["manager_exports"],
    callbacks__promises: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$promises$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["promises_exports"],
    chat_history: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$chat_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chat_history_exports"],
    document_loaders__base: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$document_loaders$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["base_exports"],
    document_loaders__langsmith: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$document_loaders$2f$langsmith$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["langsmith_exports"],
    documents: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["documents_exports"],
    embeddings: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["embeddings_exports"],
    errors: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["errors_exports"],
    example_selectors: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["example_selectors_exports"],
    index: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["src_exports"],
    indexing: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["indexing_exports"],
    language_models__base: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["base_exports"],
    language_models__chat_models: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chat_models_exports"],
    language_models__compat: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$compat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["compat_exports"],
    language_models__event: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["event_exports"],
    language_models__llms: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["llms_exports"],
    language_models__openai_completions_stream: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$openai_completions_stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openai_completions_stream_exports"],
    language_models__profile: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$profile$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["profile_exports"],
    language_models__stream: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stream_exports"],
    language_models__structured_output: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$structured_output$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["structured_output_exports"],
    load__serializable: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializable_exports"],
    memory: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$memory$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["memory_exports"],
    messages: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["messages_exports"],
    messages__tool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tool_exports"],
    output_parsers: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["output_parsers_exports"],
    output_parsers__openai_functions: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_functions$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openai_functions_exports"],
    output_parsers__openai_tools: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openai_tools_exports"],
    outputs: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["outputs_exports"],
    prompt_values: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prompt_values_exports"],
    prompts: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["prompts_exports"],
    retrievers: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["retrievers_exports"],
    retrievers__document_compressors: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$document_compressors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["document_compressors_exports"],
    runnables: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["runnables_exports"],
    runnables__graph: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$graph$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["graph_exports"],
    singletons: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["singletons_exports"],
    stores: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$stores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stores_exports"],
    structured_query: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["structured_query_exports"],
    testing: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["testing_exports"],
    tools: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tools_exports"],
    tracers__base: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["base_exports"],
    tracers__console: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["console_exports"],
    tracers__log_stream: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$log_stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["log_stream_exports"],
    tracers__run_collector: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$run_collector$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["run_collector_exports"],
    tracers__tracer_langchain: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tracer_langchain_exports"],
    types__stream: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$types$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stream_exports"],
    utils__async_caller: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["async_caller_exports"],
    utils__chunk_array: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$chunk_array$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["chunk_array_exports"],
    utils__context: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["context_exports"],
    utils__env: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["env_exports"],
    utils__event_source_parse: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$event_source_parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["event_source_parse_exports"],
    utils__format: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$format$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["format_exports"],
    utils__function_calling: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$function_calling$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["function_calling_exports"],
    utils__gateway: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$gateway$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["gateway_exports"],
    utils__hash: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hash_exports"],
    utils__json_patch: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_patch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["json_patch_exports"],
    utils__json_schema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["json_schema_exports"],
    utils__math: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$math$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["math_exports"],
    utils__ssrf: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ssrf$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ssrf_exports"],
    utils__standard_schema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["standard_schema_exports"],
    utils__stream: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stream_exports"],
    utils__testing: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["testing_exports"],
    utils__tiktoken: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tiktoken_exports"],
    utils__types: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["types_exports"],
    utils__uuid: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["uuid_exports"],
    vectorstores: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$vectorstores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["vectorstores_exports"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "load",
    ()=>load
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/map_keys.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$validation$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/validation.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$import_constants$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/import_constants.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$import_map$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/import_map.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
;
;
//#region src/load/index.ts
/**
* Load LangChain objects from JSON strings or objects.
*
* **WARNING: `load()` deserializes data by instantiating classes and invoking
* constructors. Never call `load()` on untrusted or user-supplied input.**
* Doing so can lead to insecure deserialization — including arbitrary class
* instantiation, secret exfiltration, and server-side request forgery (SSRF).
* Only deserialize data that originates from a trusted source you control.
*
* ## How it works
*
* Each `Serializable` LangChain object has a unique identifier (its "class path"),
* which is a list of strings representing the module path and class name. For example:
*
* - `AIMessage` -> `["langchain_core", "messages", "ai", "AIMessage"]`
* - `ChatPromptTemplate` -> `["langchain_core", "prompts", "chat", "ChatPromptTemplate"]`
*
* When deserializing, the class path is validated against supported namespaces.
*
* ## Threat model
*
* A serialized LangChain payload crosses a trust boundary because the manifest
* may contain serialized objects and configuration that affect runtime behavior.
* For example, a payload can configure a chat model with a custom `base_url`,
* custom headers, a different model name, or other constructor arguments. These
* are supported features, but they also mean the payload contents should be
* treated as executable configuration rather than plain text.
*
* Concretely, deserialization instantiates classes, so any constructor on an
* allowed class will run during `load()`. A crafted payload that is allowed to
* reach an unintended class — or an intended class with attacker-controlled
* kwargs — could cause network calls, file operations, or environment-variable
* access while the object is being built.
*
* ## Security model
*
* The `secretsFromEnv` parameter controls whether secrets can be loaded from environment
* variables:
*
* - `false` (default): Secrets must be provided in `secretsMap`. If a secret is not
*   found, `null` is returned instead of loading from environment variables.
* - `true`: If a secret is not found in `secretsMap`, it will be loaded from
*   environment variables. Use this only in trusted environments.
*
* ### Hardening recommendations
*
* - **Never enable `secretsFromEnv`** unless the serialized data is fully trusted.
*   A crafted payload can reference arbitrary environment variable names, leaking
*   secrets to an attacker-controlled class constructor.
* - **Keep `secretsMap` minimal.** Only include the specific secrets the serialized
*   object actually needs.
* - **Keep `importMap` / `optionalImportsMap` as small and static as possible.**
*   Each entry widens the set of classes an attacker can instantiate. Never
*   populate these maps from user input.
*
* ### Injection protection (escape-based)
*
* During serialization, plain objects that contain an `'lc'` key are escaped by wrapping
* them: `{"__lc_escaped__": {...}}`. During deserialization, escaped objects are unwrapped
* and returned as plain objects, NOT instantiated as LC objects.
*
* This is an allowlist approach: only objects explicitly produced by
* `Serializable.toJSON()` (which are NOT escaped) are treated as LC objects;
* everything else is user data.
*
* @module
*/ /**
* Default maximum recursion depth for deserialization.
* This provides protection against DoS attacks via deeply nested structures.
*/ const DEFAULT_MAX_DEPTH = 50;
function combineAliasesAndInvert(constructor) {
    const aliases = {};
    for(let current = constructor; current && current.prototype; current = Object.getPrototypeOf(current))Object.assign(aliases, Reflect.get(current.prototype, "lc_aliases"));
    return Object.entries(aliases).reduce((acc, [key, value])=>{
        acc[value] = key;
        return acc;
    }, {});
}
/**
* Recursively revive a value, handling escape markers and LC objects.
*
* This function handles:
* 1. Escaped dicts - unwrapped and returned as plain objects
* 2. LC secret objects - resolved from secretsMap or env
* 3. LC constructor objects - instantiated
* 4. Regular objects/arrays - recursed into
*/ async function reviver(value) {
    const { optionalImportsMap, optionalImportEntrypoints: optionalImportEntrypoints$1, importMap, secretsMap, secretsFromEnv, path, depth, maxDepth } = this;
    const pathStr = path.join(".");
    if (depth > maxDepth) throw new Error(`Maximum recursion depth (${maxDepth}) exceeded during deserialization. This may indicate a malicious payload or you may need to increase maxDepth.`);
    if (typeof value !== "object" || value == null) return value;
    if (Array.isArray(value)) return Promise.all(value.map((v, i)=>reviver.call({
            ...this,
            path: [
                ...path,
                `${i}`
            ],
            depth: depth + 1
        }, v)));
    const record = value;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$validation$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isEscapedObject"])(record)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$validation$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unescapeValue"])(record);
    if ("lc" in record && "type" in record && "id" in record && record.lc === 1 && record.type === "secret") {
        const [key] = record.id;
        if (key in secretsMap) return secretsMap[key];
        else if (secretsFromEnv) {
            const secretValueInEnv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(key);
            if (secretValueInEnv) return secretValueInEnv;
        }
        throw new Error(`Missing secret "${key}" at ${pathStr}`);
    }
    if ("lc" in record && "type" in record && "id" in record && record.lc === 1 && record.type === "not_implemented") {
        const str = JSON.stringify(record);
        throw new Error(`Trying to load an object that doesn't implement serialization: ${pathStr} -> ${str}`);
    }
    if ("lc" in record && "type" in record && "id" in record && "kwargs" in record && record.lc === 1 && record.type === "constructor") {
        const serialized = record;
        const str = JSON.stringify(serialized);
        const [name, ...namespaceReverse] = serialized.id.slice().reverse();
        const namespace = namespaceReverse.reverse();
        const importMaps = {
            langchain_core: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$import_map$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["import_map_exports"],
            langchain: importMap
        };
        let module = null;
        const optionalImportNamespaceAliases = [
            namespace.join("/")
        ];
        if (namespace[0] === "langchain_community") optionalImportNamespaceAliases.push([
            "langchain",
            ...namespace.slice(1)
        ].join("/"));
        const matchingNamespaceAlias = optionalImportNamespaceAliases.find((alias)=>alias in optionalImportsMap);
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$import_constants$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["optionalImportEntrypoints"].concat(optionalImportEntrypoints$1).includes(namespace.join("/")) || matchingNamespaceAlias) {
            if (matchingNamespaceAlias !== void 0) module = await optionalImportsMap[matchingNamespaceAlias];
            else throw new Error(`Missing key "${namespace.join("/")}" for ${pathStr} in load(optionalImportsMap={})`);
        } else {
            let finalImportMap;
            if (namespace[0] === "langchain" || namespace[0] === "langchain_core") {
                finalImportMap = importMaps[namespace[0]];
                namespace.shift();
            } else throw new Error(`Invalid namespace: ${pathStr} -> ${str}`);
            if (namespace.length === 0) throw new Error(`Invalid namespace: ${pathStr} -> ${str}`);
            let importMapKey;
            do {
                importMapKey = namespace.join("__");
                if (importMapKey in finalImportMap) break;
                else namespace.pop();
            }while (namespace.length > 0)
            if (importMapKey in finalImportMap) module = finalImportMap[importMapKey];
        }
        if (typeof module !== "object" || module === null) throw new Error(`Invalid namespace: ${pathStr} -> ${str}`);
        const builder = module[name] ?? Object.values(module).find((v)=>typeof v === "function" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["get_lc_unique_name"])(v) === name);
        if (typeof builder !== "function") throw new Error(`Invalid identifer: ${pathStr} -> ${str}`);
        const kwargs = await reviver.call({
            ...this,
            path: [
                ...path,
                "kwargs"
            ],
            depth: depth + 1
        }, serialized.kwargs);
        const instance = new builder((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapKeys"])(kwargs, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["keyFromJson"], combineAliasesAndInvert(builder)));
        Object.defineProperty(instance.constructor, "name", {
            value: name
        });
        return instance;
    }
    const result = {};
    for (const [key, val] of Object.entries(record))result[key] = await reviver.call({
        ...this,
        path: [
            ...path,
            key
        ],
        depth: depth + 1
    }, val);
    return result;
}
/**
* Load a LangChain object from a JSON string.
*
* **WARNING — insecure deserialization risk.** This function instantiates
* classes and invokes constructors based on the contents of `text`. If `text`
* originates from an untrusted source, an attacker can craft a payload that
* instantiates arbitrary allowed classes with attacker-controlled arguments,
* potentially causing secret exfiltration, SSRF, or other side effects.
*
* A serialized payload should be treated as executable configuration — it can
* configure models with custom endpoints, headers, or other constructor kwargs
* that execute during instantiation.
*
* Only call `load()` on data you have produced yourself or received from a
* fully trusted origin (e.g., your own database). **Never deserialize
* user-supplied or network-received JSON without independent validation.**
*
* @param text - The JSON string to parse and load.
* @param options - Options for loading. See {@link LoadOptions} for security guidance.
* @returns The loaded LangChain object.
*
* @example
* ```typescript
* import { load } from "@langchain/core/load";
* import { AIMessage } from "@langchain/core/messages";
*
* // Basic usage - secrets must be provided explicitly
* const msg = await load<AIMessage>(jsonString);
*
* // With secrets from a map (preferred over secretsFromEnv)
* const msg = await load<AIMessage>(jsonString, {
*   secretsMap: { OPENAI_API_KEY: "sk-..." }
* });
*
* // Allow loading secrets from environment — ONLY for fully trusted data
* const msg = await load<AIMessage>(jsonString, {
*   secretsFromEnv: true
* });
* ```
*/ async function load(text, options) {
    const json = JSON.parse(text);
    const context = {
        optionalImportsMap: options?.optionalImportsMap ?? {},
        optionalImportEntrypoints: options?.optionalImportEntrypoints ?? [],
        secretsMap: options?.secretsMap ?? {},
        secretsFromEnv: options?.secretsFromEnv ?? false,
        importMap: options?.importMap ?? {},
        path: [
            "$"
        ],
        depth: 0,
        maxDepth: options?.maxDepth ?? DEFAULT_MAX_DEPTH
    };
    return reviver.call(context, json);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "src_exports",
    ()=>src_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/index.ts
var src_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/agents.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agents_exports",
    ()=>agents_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/agents.ts
var agents_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContextOverflowError",
    ()=>ContextOverflowError,
    "LangChainError",
    ()=>LangChainError,
    "ModelAbortError",
    ()=>ModelAbortError,
    "addLangChainErrorFields",
    ()=>addLangChainErrorFields,
    "errors_exports",
    ()=>errors_exports,
    "getRetryable",
    ()=>getRetryable,
    "ns",
    ()=>ns,
    "stampRetryable",
    ()=>stampRetryable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$namespace$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/namespace.js [app-rsc] (ecmascript)");
;
;
//#region src/errors/index.ts
var errors_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    ContextOverflowError: ()=>ContextOverflowError,
    LangChainError: ()=>LangChainError,
    ModelAbortError: ()=>ModelAbortError,
    addLangChainErrorFields: ()=>addLangChainErrorFields,
    getRetryable: ()=>getRetryable,
    ns: ()=>ns,
    stampRetryable: ()=>stampRetryable
});
/** @deprecated Subclass LangChainError instead */ function addLangChainErrorFields(error, lc_error_code) {
    error.lc_error_code = lc_error_code;
    error.message = `${error.message}\n\nTroubleshooting URL: https://docs.langchain.com/oss/javascript/langchain/errors/${lc_error_code}/\n`;
    return error;
}
/** The error namespace for all LangChain errors */ const ns = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$namespace$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ns"].sub("error");
/** Registered globally so duplicate copies of core in one dependency tree agree. */ const retryableSymbol = Symbol.for("langchain.errors.retryable");
/**
* Mark an error as safe or unsafe to retry.
*
* Sets a non-enumerable symbol on the error itself, leaving its class and
* shape untouched, so it is safe to apply to a provider SDK's own error.
*
* @param error - The error to mark. Non-objects are returned untouched.
* @param retryable - `true` if retrying may succeed.
* @returns The same error instance, for chaining.
*/ function stampRetryable(error, retryable) {
    if (typeof error !== "object" || error === null) return error;
    try {
        Object.defineProperty(error, retryableSymbol, {
            value: retryable,
            configurable: true
        });
    } catch  {}
    return error;
}
/**
* Read an error's retryability mark.
*
* @returns `true`/`false` when marked, `undefined` when unclassified —
*   supply your own default, e.g. `getRetryable(error) ?? true`.
*/ function getRetryable(error) {
    if (typeof error !== "object" || error === null) return;
    return Object.getOwnPropertyDescriptor(error, retryableSymbol)?.value;
}
/**
* Base error class for all LangChain errors.
*
* All LangChain error classes should extend this class (directly or
* indirectly). Use `LangChainError.isInstance(obj)` to check if an
* object is any LangChain error.
*
* @example
* ```typescript
* try {
*   await model.invoke("hello");
* } catch (error) {
*   if (LangChainError.isInstance(error)) {
*     console.log("Got a LangChain error:", error.message);
*   }
* }
* ```
*/ var LangChainError = class extends ns.brand(Error) {
    name = "LangChainError";
    constructor(message){
        super(message);
        if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    }
};
/**
* Error class representing an aborted model operation in LangChain.
*
* This error is thrown when a model operation (such as invocation, streaming, or batching)
* is cancelled before it completes, commonly due to a user-initiated abort signal
* (e.g., via an AbortController) or an upstream cancellation event.
*
* The ModelAbortError provides access to any partial output the model may have produced
* before the operation was interrupted, which can be useful for resuming work, debugging,
* or presenting incomplete results to users.
*
* @remarks
* - The `partialOutput` field includes message content that was generated prior to the abort,
*   such as a partial AIMessageChunk.
* - This error extends the {@link LangChainError} base class with the marker `"model-abort"`.
*
* @example
* ```typescript
* try {
*   await model.invoke(input, { signal: abortController.signal });
* } catch (err) {
*   if (ModelAbortError.isInstance(err)) {
*     // Handle user cancellation, check err.partialOutput if needed
*   } else {
*     throw err;
*   }
* }
* ```
*/ var ModelAbortError = class extends ns.brand(LangChainError, "model-abort") {
    name = "ModelAbortError";
    /**
	* The partial message output that was produced before the operation was aborted.
	* This is typically an AIMessageChunk, or could be undefined if no output was available.
	*/ partialOutput;
    /**
	* Constructs a new ModelAbortError instance.
	*
	* @param message - A human-readable message describing the abort event.
	* @param partialOutput - Any partial model output generated before the abort (optional).
	*/ constructor(message, partialOutput){
        super(message);
        this.partialOutput = partialOutput;
        stampRetryable(this, false);
    }
};
/**
* Error class representing a context window overflow in a language model operation.
*
* This error is thrown when the combined input to a language model (such as prompt tokens,
* historical messages, and/or instructions) exceeds the maximum context window or token limit
* that the model can process in a single request. Most models have defined upper limits for the number of
* tokens or characters allowed in a context, and exceeding this limit will prevent
* the operation from proceeding.
*
* The {@link ContextOverflowError} extends the {@link LangChainError} base class with
* the marker `"context-overflow"`.
*
* @remarks
* - Use this error to programmatically identify cases where a user request, prompt, or input
*   sequence is too long to be handled by the target model.
* - Model providers and framework integrations should throw this error if they detect
*   a request cannot be processed due to its size.
*
* @example
* ```typescript
* try {
*   await model.invoke(veryLongInput);
* } catch (err) {
*   if (ContextOverflowError.isInstance(err)) {
*     // Handle overflow, e.g., prompt user to shorten input or truncate text
*     console.warn("Model context overflow:", err.message);
*   } else {
*     throw err;
*   }
* }
* ```
*/ var ContextOverflowError = class ContextOverflowError extends ns.brand(LangChainError, "context-overflow") {
    name = "ContextOverflowError";
    /**
	* The underlying error that caused this {@link ContextOverflowError}, if any.
	*
	* This property is optionally set when wrapping a lower-level error using {@link ContextOverflowError.fromError}.
	* It allows error handlers to access or inspect the original error that led to the context overflow.
	*/ cause;
    constructor(message){
        super(message ?? "Input exceeded the model's context window.");
        stampRetryable(this, false);
    }
    /**
	* Creates a new {@link ContextOverflowError} instance from an existing error.
	*
	* This static utility copies the message from the provided error and
	* attaches the original error as the {@link ContextOverflowError.cause} property,
	* enabling error handlers to inspect or propagate the original failure.
	*
	* @param obj - The original error object causing the context overflow.
	* @returns A new {@link ContextOverflowError} instance with the original error set as its cause.
	*
	* @example
	* ```typescript
	* try {
	*   await model.invoke(input);
	* } catch (err) {
	*   throw ContextOverflowError.fromError(err);
	* }
	* ```
	*/ static fromError(obj) {
        const error = new ContextOverflowError(obj.message);
        error.cause = obj;
        return error;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/utils.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToolInputParsingException",
    ()=>ToolInputParsingException,
    "_configHasToolCallId",
    ()=>_configHasToolCallId,
    "_isToolCall",
    ()=>_isToolCall
]);
//#region src/tools/utils.ts
function _isToolCall(toolCall) {
    return !!(toolCall && typeof toolCall === "object" && "type" in toolCall && toolCall.type === "tool_call");
}
function _configHasToolCallId(config) {
    return !!(config && typeof config === "object" && "toolCall" in config && config.toolCall != null && typeof config.toolCall === "object" && "id" in config.toolCall && typeof config.toolCall.id === "string");
}
/**
* Custom error class used to handle exceptions related to tool input parsing.
* It extends the built-in `Error` class and adds an optional `output`
* property that can hold the output that caused the exception.
*/ var ToolInputParsingException = class extends Error {
    output;
    constructor(message, output){
        super(message);
        this.output = output;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/types.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isLangChainTool",
    ()=>isLangChainTool,
    "isRunnableToolLike",
    ()=>isRunnableToolLike,
    "isStructuredTool",
    ()=>isStructuredTool,
    "isStructuredToolParams",
    ()=>isStructuredToolParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
;
;
//#region src/tools/types.ts
/**
* Confirm whether the inputted tool is an instance of `StructuredToolInterface`.
*
* @param {StructuredToolInterface | JSONSchema | undefined} tool The tool to check if it is an instance of `StructuredToolInterface`.
* @returns {tool is StructuredToolInterface} Whether the inputted tool is an instance of `StructuredToolInterface`.
*/ function isStructuredTool(tool) {
    return tool !== void 0 && Array.isArray(tool.lc_namespace);
}
/**
* Confirm whether the inputted tool is an instance of `RunnableToolLike`.
*
* @param {unknown | undefined} tool The tool to check if it is an instance of `RunnableToolLike`.
* @returns {tool is RunnableToolLike} Whether the inputted tool is an instance of `RunnableToolLike`.
*/ function isRunnableToolLike(tool) {
    return tool !== void 0 && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"].isRunnable(tool) && "lc_name" in tool.constructor && typeof tool.constructor.lc_name === "function" && tool.constructor.lc_name() === "RunnableToolLike";
}
/**
* Confirm whether or not the tool contains the necessary properties to be considered a `StructuredToolParams`.
*
* @param {unknown | undefined} tool The object to check if it is a `StructuredToolParams`.
* @returns {tool is StructuredToolParams} Whether the inputted object is a `StructuredToolParams`.
*/ function isStructuredToolParams(tool) {
    return !!tool && typeof tool === "object" && "name" in tool && "schema" in tool && ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(tool.schema) || tool.schema != null && typeof tool.schema === "object" && "type" in tool.schema && typeof tool.schema.type === "string" && [
        "null",
        "boolean",
        "object",
        "array",
        "number",
        "string"
    ].includes(tool.schema.type));
}
/**
* Whether or not the tool is one of StructuredTool, RunnableTool or StructuredToolParams.
* It returns `is StructuredToolParams` since that is the most minimal interface of the three,
* while still containing the necessary properties to be passed to a LLM for tool calling.
*
* @param {unknown | undefined} tool The tool to check if it is a LangChain tool.
* @returns {tool is StructuredToolParams} Whether the inputted tool is a LangChain tool.
*/ function isLangChainTool(tool) {
    return isStructuredToolParams(tool) || isRunnableToolLike(tool) || isStructuredTool(tool);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseToolkit",
    ()=>BaseToolkit,
    "DynamicStructuredTool",
    ()=>DynamicStructuredTool,
    "DynamicTool",
    ()=>DynamicTool,
    "StructuredTool",
    ()=>StructuredTool,
    "Tool",
    ()=>Tool,
    "tool",
    ()=>tool,
    "tools_exports",
    ()=>tools_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/signal.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/iter.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/types.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v3/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
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
//#region src/tools/index.ts
var tools_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseToolkit: ()=>BaseToolkit,
    DynamicStructuredTool: ()=>DynamicStructuredTool,
    DynamicTool: ()=>DynamicTool,
    StructuredTool: ()=>StructuredTool,
    Tool: ()=>Tool,
    ToolInputParsingException: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolInputParsingException"],
    isLangChainTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isLangChainTool"],
    isRunnableToolLike: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRunnableToolLike"],
    isStructuredTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isStructuredTool"],
    isStructuredToolParams: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isStructuredToolParams"],
    tool: ()=>tool
});
/**
* Base class for Tools that accept input of any shape defined by a Zod schema.
*/ var StructuredTool = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLangChain"] {
    /**
	* Optional provider-specific extra fields for the tool.
	*
	* This is used to pass provider-specific configuration that doesn't fit into
	* standard tool fields.
	*/ extras;
    /**
	* Whether to return the tool's output directly.
	*
	* Setting this to true means that after the tool is called,
	* an agent should stop looping.
	*/ returnDirect = false;
    verboseParsingErrors = false;
    get lc_namespace() {
        return [
            "langchain",
            "tools"
        ];
    }
    /**
	* The tool response format.
	*
	* If "content" then the output of the tool is interpreted as the contents of a
	* ToolMessage. If "content_and_artifact" then the output is expected to be a
	* two-tuple corresponding to the (content, artifact) of a ToolMessage.
	*
	* @default "content"
	*/ responseFormat = "content";
    /**
	* Default config object for the tool runnable.
	*/ defaultConfig;
    constructor(fields){
        super(fields ?? {});
        this.verboseParsingErrors = fields?.verboseParsingErrors ?? this.verboseParsingErrors;
        this.responseFormat = fields?.responseFormat ?? this.responseFormat;
        this.defaultConfig = fields?.defaultConfig ?? this.defaultConfig;
        this.metadata = fields?.metadata ?? this.metadata;
        this.extras = fields?.extras ?? this.extras;
    }
    /**
	* Invokes the tool with the provided input and configuration.
	* @param input The input for the tool.
	* @param config Optional configuration for the tool.
	* @returns A Promise that resolves with the tool's output.
	*/ async invoke(input, config) {
        let toolInput;
        let enrichedConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureConfig"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeConfigs"])(this.defaultConfig, config));
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_isToolCall"])(input)) {
            toolInput = input.args;
            enrichedConfig = {
                ...enrichedConfig,
                toolCall: input
            };
        } else toolInput = input;
        return this.call(toolInput, enrichedConfig);
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*
	* Calls the tool with the provided argument, configuration, and tags. It
	* parses the input according to the schema, handles any errors, and
	* manages callbacks.
	* @param arg The input argument for the tool.
	* @param configArg Optional configuration or callbacks for the tool.
	* @param tags Optional tags for the tool.
	* @returns A Promise that resolves with a string.
	*/ async call(arg, configArg, tags) {
        const inputForValidation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_isToolCall"])(arg) ? arg.args : arg;
        let parsed;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(this.schema)) try {
            parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopParseAsync"])(this.schema, inputForValidation);
        } catch (e) {
            let message = `Received tool input did not match expected schema`;
            if (this.verboseParsingErrors) message = `${message}\nDetails: ${e.message}`;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodError"])(e)) message = `${message}\n\n${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].prettifyError(e)}`;
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolInputParsingException"](message, JSON.stringify(arg));
        }
        else {
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validate"])(inputForValidation, this.schema);
            if (!result.valid) {
                let message = `Received tool input did not match expected schema`;
                if (this.verboseParsingErrors) message = `${message}\nDetails: ${result.errors.map((e)=>`${e.keywordLocation}: ${e.error}`).join("\n")}`;
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolInputParsingException"](message, JSON.stringify(arg));
            }
            parsed = inputForValidation;
        }
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCallbackConfigArg"])(configArg);
        const callbackManager_ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(config.callbacks, this.callbacks, config.tags || tags, this.tags, config.metadata, this.metadata, {
            verbose: this.verbose
        });
        let toolCallId;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_isToolCall"])(arg)) toolCallId = arg.id;
        if (!toolCallId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_configHasToolCallId"])(config)) toolCallId = config.toolCall.id;
        let callbackInput;
        if (typeof inputForValidation === "object" && inputForValidation !== null && !Array.isArray(inputForValidation)) callbackInput = inputForValidation;
        if (!callbackInput) callbackInput = typeof arg === "string" ? arg : JSON.stringify(arg);
        const runManager = await callbackManager_?.handleToolStart(this.toJSON(), callbackInput, config.runId, void 0, void 0, void 0, config.runName, toolCallId);
        delete config.runId;
        let result;
        try {
            const raw = await this._call(parsed, runManager, config);
            result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAsyncGenerator"])(raw) ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeAsyncGenerator"])(raw, async (chunk)=>{
                try {
                    await runManager?.handleToolEvent(chunk);
                } catch (streamError) {
                    await runManager?.handleToolError(streamError);
                }
            }) : raw;
        } catch (e) {
            await runManager?.handleToolError(e);
            throw e;
        }
        let content;
        let artifact;
        if (this.responseFormat === "content_and_artifact") {
            if (Array.isArray(result) && result.length === 2) [content, artifact] = result;
            else throw new Error(`Tool response format is "content_and_artifact" but the output was not a two-tuple.\nResult: ${JSON.stringify(result)}`);
        } else content = result;
        const formattedOutput = _formatToolOutput({
            content,
            artifact,
            toolCallId,
            name: this.name,
            metadata: this.metadata
        });
        await runManager?.handleToolEnd(formattedOutput);
        return formattedOutput;
    }
};
/**
* Base class for Tools that accept input as a string.
*/ var Tool = class extends StructuredTool {
    schema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        input: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }).transform((obj)=>obj.input);
    constructor(fields){
        super(fields);
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*
	* Calls the tool with the provided argument and callbacks. It handles
	* string inputs specifically.
	* @param arg The input argument for the tool, which can be a string, undefined, or an input of the tool's schema.
	* @param callbacks Optional callbacks for the tool.
	* @returns A Promise that resolves with a string.
	*/ call(arg, callbacks) {
        const structuredArg = typeof arg === "string" || arg == null ? {
            input: arg
        } : arg;
        return super.call(structuredArg, callbacks);
    }
};
/**
* A tool that can be created dynamically from a function, name, and description.
*/ var DynamicTool = class extends Tool {
    static lc_name() {
        return "DynamicTool";
    }
    name;
    description;
    func;
    constructor(fields){
        super(fields);
        this.name = fields.name;
        this.description = fields.description;
        this.func = fields.func;
        this.returnDirect = fields.returnDirect ?? this.returnDirect;
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*/ async call(arg, configArg) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCallbackConfigArg"])(configArg);
        if (config.runName === void 0) config.runName = this.name;
        return super.call(arg, config);
    }
    /** @ignore */ _call(input, runManager, parentConfig) {
        return this.func(input, runManager, parentConfig);
    }
};
/**
* A tool that can be created dynamically from a function, name, and
* description, designed to work with structured data. It extends the
* StructuredTool class and overrides the _call method to execute the
* provided function when the tool is called.
*
* Schema can be passed as Zod or JSON schema. The tool will not validate
* input if JSON schema is passed.
*
* @template SchemaT The input schema type for the tool (Zod schema or JSON schema). Defaults to `ToolInputSchemaBase`.
* @template SchemaOutputT The output type derived from the schema after parsing/validation. Defaults to `ToolInputSchemaOutputType<SchemaT>`.
* @template SchemaInputT The input type derived from the schema before parsing. Defaults to `ToolInputSchemaInputType<SchemaT>`.
* @template ToolOutputT The return type of the tool's function. Defaults to `ToolOutputType`.
* @template NameT The literal type of the tool name (for discriminated union support). Defaults to `string`.
*/ var DynamicStructuredTool = class extends StructuredTool {
    static lc_name() {
        return "DynamicStructuredTool";
    }
    description;
    func;
    schema;
    constructor(fields){
        super(fields);
        this.name = fields.name;
        this.description = fields.description;
        this.func = fields.func;
        this.returnDirect = fields.returnDirect ?? this.returnDirect;
        this.schema = fields.schema;
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*/ async call(arg, configArg, tags) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCallbackConfigArg"])(configArg);
        if (config.runName === void 0) config.runName = this.name;
        return super.call(arg, config, tags);
    }
    _call(arg, runManager, parentConfig) {
        return this.func(arg, runManager, parentConfig);
    }
};
/**
* Abstract base class for toolkits in LangChain. Toolkits are collections
* of tools that agents can use. Subclasses must implement the `tools`
* property to provide the specific tools for the toolkit.
*/ var BaseToolkit = class {
    getTools() {
        return this.tools;
    }
};
function tool(func, fields) {
    const isSimpleStringSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSimpleStringZodSchema"])(fields.schema);
    const isStringJSONSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validatesOnlyStrings"])(fields.schema);
    if (!fields.schema || isSimpleStringSchema || isStringJSONSchema) return new DynamicTool({
        ...fields,
        description: fields.description ?? fields.schema?.description ?? `${fields.name} tool`,
        func: async (input, runManager, config)=>{
            return new Promise((resolve, reject)=>{
                const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(childConfig), async ()=>{
                    try {
                        resolve(func(input, childConfig));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }
    });
    const schema = fields.schema;
    const description = fields.description ?? fields.schema.description ?? `${fields.name} tool`;
    return new DynamicStructuredTool({
        ...fields,
        description,
        schema,
        func: async (input, runManager, config)=>{
            return new Promise((resolve, reject)=>{
                let listener;
                const cleanup = ()=>{
                    if (config?.signal && listener) config.signal.removeEventListener("abort", listener);
                };
                if (config?.signal) {
                    listener = ()=>{
                        cleanup();
                        reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAbortSignalError"])(config.signal));
                    };
                    config.signal.addEventListener("abort", listener, {
                        once: true
                    });
                }
                const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(childConfig), async ()=>{
                    try {
                        const result = await func(input, childConfig);
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$iter$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAsyncGenerator"])(result)) {
                            resolve(result);
                            return;
                        }
                        /**
						* If the signal is aborted, we don't want to resolve the promise
						* as the promise is already rejected.
						*/ if (config?.signal?.aborted) {
                            cleanup();
                            return;
                        }
                        cleanup();
                        resolve(result);
                    } catch (e) {
                        cleanup();
                        reject(e);
                    }
                });
            });
        }
    });
}
function _isMessageContentBlockShaped(item) {
    return typeof item === "object" && item !== null && "type" in item;
}
function _formatToolOutput(params) {
    const { content, artifact, toolCallId, metadata } = params;
    if (toolCallId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isDirectToolOutput"])(content)) {
        if (typeof content === "string" || Array.isArray(content) && content.every(_isMessageContentBlockShaped)) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolMessage"]({
            status: "success",
            content,
            artifact,
            tool_call_id: toolCallId,
            name: params.name,
            metadata
        });
        else return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolMessage"]({
            status: "success",
            content: _stringify(content),
            artifact,
            tool_call_id: toolCallId,
            name: params.name,
            metadata
        });
    } else return content;
}
function _stringify(content) {
    try {
        return JSON.stringify(content) ?? "";
    } catch (_noOp) {
        return `${content}`;
    }
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/caches/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCache",
    ()=>BaseCache,
    "InMemoryCache",
    ()=>InMemoryCache,
    "caches_exports",
    ()=>caches_exports,
    "defaultHashKeyEncoder",
    ()=>defaultHashKeyEncoder,
    "deserializeStoredGeneration",
    ()=>deserializeStoredGeneration,
    "serializeGeneration",
    ()=>serializeGeneration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/js-sha256/hash.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/hash.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/caches/index.ts
var caches_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseCache: ()=>BaseCache,
    InMemoryCache: ()=>InMemoryCache,
    defaultHashKeyEncoder: ()=>defaultHashKeyEncoder,
    deserializeStoredGeneration: ()=>deserializeStoredGeneration,
    serializeGeneration: ()=>serializeGeneration
});
const defaultHashKeyEncoder = (...strings)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sha256"])(strings.join("_"));
function deserializeStoredGeneration(storedGeneration) {
    if (storedGeneration.message !== void 0) return {
        text: storedGeneration.text,
        message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapStoredMessageToChatMessage"])(storedGeneration.message)
    };
    else return {
        text: storedGeneration.text
    };
}
function serializeGeneration(generation) {
    const serializedValue = {
        text: generation.text
    };
    if (generation.message !== void 0) serializedValue.message = generation.message.toDict();
    return serializedValue;
}
/**
* Base class for all caches. All caches should extend this class.
*/ var BaseCache = class {
    keyEncoder = defaultHashKeyEncoder;
    /**
	* Sets a custom key encoder function for the cache.
	* This function should take a prompt and an LLM key and return a string
	* that will be used as the cache key.
	* @param keyEncoderFn The custom key encoder function.
	*/ makeDefaultKeyEncoder(keyEncoderFn) {
        this.keyEncoder = keyEncoderFn;
    }
};
const GLOBAL_MAP = /* @__PURE__ */ new Map();
/**
* A cache for storing LLM generations that stores data in memory.
*/ var InMemoryCache = class InMemoryCache extends BaseCache {
    cache;
    constructor(map){
        super();
        this.cache = map ?? /* @__PURE__ */ new Map();
    }
    /**
	* Retrieves data from the cache using a prompt and an LLM key. If the
	* data is not found, it returns null.
	* @param prompt The prompt used to find the data.
	* @param llmKey The LLM key used to find the data.
	* @returns The data corresponding to the prompt and LLM key, or null if not found.
	*/ lookup(prompt, llmKey) {
        return Promise.resolve(this.cache.get(this.keyEncoder(prompt, llmKey)) ?? null);
    }
    /**
	* Updates the cache with new data using a prompt and an LLM key.
	* @param prompt The prompt used to store the data.
	* @param llmKey The LLM key used to store the data.
	* @param value The data to be stored.
	*/ async update(prompt, llmKey, value) {
        this.cache.set(this.keyEncoder(prompt, llmKey), value);
    }
    /**
	* Returns a global instance of InMemoryCache using a predefined global
	* map as the initial cache.
	* @returns A global instance of InMemoryCache.
	*/ static global() {
        return new InMemoryCache(GLOBAL_MAP);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCallbackHandler",
    ()=>BaseCallbackHandler,
    "base_exports",
    ()=>base_exports,
    "callbackHandlerPrefersChatModelStreamEvents",
    ()=>callbackHandlerPrefersChatModelStreamEvents,
    "callbackHandlerPrefersStreaming",
    ()=>callbackHandlerPrefersStreaming,
    "isBaseCallbackHandler",
    ()=>isBaseCallbackHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/callbacks/base.ts
var base_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseCallbackHandler: ()=>BaseCallbackHandler,
    callbackHandlerPrefersChatModelStreamEvents: ()=>callbackHandlerPrefersChatModelStreamEvents,
    callbackHandlerPrefersStreaming: ()=>callbackHandlerPrefersStreaming,
    isBaseCallbackHandler: ()=>isBaseCallbackHandler
});
/**
* Abstract class that provides a set of optional methods that can be
* overridden in derived classes to handle various events during the
* execution of a LangChain application.
*/ var BaseCallbackHandlerMethodsClass = class {
};
function callbackHandlerPrefersStreaming(x) {
    return "lc_prefer_streaming" in x && x.lc_prefer_streaming;
}
function callbackHandlerPrefersChatModelStreamEvents(x) {
    return "lc_prefer_chat_model_stream_events" in x && x.lc_prefer_chat_model_stream_events;
}
/**
* Abstract base class for creating callback handlers in the LangChain
* framework. It provides a set of optional methods that can be overridden
* in derived classes to handle various events during the execution of a
* LangChain application.
*/ var BaseCallbackHandler = class extends BaseCallbackHandlerMethodsClass {
    lc_serializable = false;
    get lc_namespace() {
        return [
            "langchain_core",
            "callbacks",
            this.name
        ];
    }
    get lc_secrets() {}
    get lc_attributes() {}
    get lc_aliases() {}
    get lc_serializable_keys() {}
    /**
	* The name of the serializable. Override to provide an alias or
	* to preserve the serialized module name in minified environments.
	*
	* Implemented as a static method to support loading logic.
	*/ static lc_name() {
        return this.name;
    }
    /**
	* The final serialized identifier for the module.
	*/ get lc_id() {
        return [
            ...this.lc_namespace,
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["get_lc_unique_name"])(this.constructor)
        ];
    }
    lc_kwargs;
    ignoreLLM = false;
    ignoreChain = false;
    ignoreAgent = false;
    ignoreRetriever = false;
    ignoreCustomEvent = false;
    raiseError = false;
    awaitHandlers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_CALLBACKS_BACKGROUND") === "false";
    constructor(input){
        super();
        this.lc_kwargs = input || {};
        if (input) {
            this.ignoreLLM = input.ignoreLLM ?? this.ignoreLLM;
            this.ignoreChain = input.ignoreChain ?? this.ignoreChain;
            this.ignoreAgent = input.ignoreAgent ?? this.ignoreAgent;
            this.ignoreRetriever = input.ignoreRetriever ?? this.ignoreRetriever;
            this.ignoreCustomEvent = input.ignoreCustomEvent ?? this.ignoreCustomEvent;
            this.raiseError = input.raiseError ?? this.raiseError;
            this.awaitHandlers = this.raiseError || (input._awaitHandler ?? this.awaitHandlers);
        }
    }
    copy() {
        return new this.constructor(this);
    }
    toJSON() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"].prototype.toJSON.call(this);
    }
    toJSONNotImplemented() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"].prototype.toJSONNotImplemented.call(this);
    }
    static fromMethods(methods) {
        class Handler extends BaseCallbackHandler {
            name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v7"])();
            constructor(){
                super();
                Object.assign(this, methods);
            }
        }
        return new Handler();
    }
};
const isBaseCallbackHandler = (x)=>{
    const callbackHandler = x;
    return callbackHandler !== void 0 && typeof callbackHandler.copy === "function" && typeof callbackHandler.name === "string" && typeof callbackHandler.awaitHandlers === "boolean";
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/promises.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "promises_exports",
    ()=>promises_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/callbacks.js [app-rsc] (ecmascript)");
;
;
//#region src/callbacks/promises.ts
var promises_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    awaitAllCallbacks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["awaitAllCallbacks"],
    consumeCallback: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCallbackManager",
    ()=>BaseCallbackManager,
    "BaseRunManager",
    ()=>BaseRunManager,
    "CallbackManager",
    ()=>CallbackManager,
    "CallbackManagerForChainRun",
    ()=>CallbackManagerForChainRun,
    "CallbackManagerForLLMRun",
    ()=>CallbackManagerForLLMRun,
    "CallbackManagerForRetrieverRun",
    ()=>CallbackManagerForRetrieverRun,
    "CallbackManagerForToolRun",
    ()=>CallbackManagerForToolRun,
    "ensureHandler",
    ()=>ensureHandler,
    "manager_exports",
    ()=>manager_exports,
    "parseCallbackConfigArg",
    ()=>parseCallbackConfigArg
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/console.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/tracer_langchain.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/callbacks.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$promises$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/promises.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/callbacks.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/context.js [app-rsc] (ecmascript)");
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
//#region src/callbacks/manager.ts
var manager_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseCallbackManager: ()=>BaseCallbackManager,
    BaseRunManager: ()=>BaseRunManager,
    CallbackManager: ()=>CallbackManager,
    CallbackManagerForChainRun: ()=>CallbackManagerForChainRun,
    CallbackManagerForLLMRun: ()=>CallbackManagerForLLMRun,
    CallbackManagerForRetrieverRun: ()=>CallbackManagerForRetrieverRun,
    CallbackManagerForToolRun: ()=>CallbackManagerForToolRun,
    ensureHandler: ()=>ensureHandler,
    parseCallbackConfigArg: ()=>parseCallbackConfigArg
});
function getTracerRunStoreKey(tracer) {
    return tracer._getRunStoreKey?.() ?? tracer;
}
function mergeTracerConfig(target, source) {
    if (target === source) return target;
    return target.copyWithTracingConfig({
        metadata: source.tracingMetadata,
        tags: source.tracingTags
    });
}
function coalesceTracers(handlers, inheritableHandlers) {
    const inheritableSet = new Set(inheritableHandlers);
    const groups = /* @__PURE__ */ new Map();
    const coalescedHandlers = [];
    const fold = (handler)=>{
        const key = getTracerRunStoreKey(handler);
        const isInheritable = inheritableSet.has(handler);
        const group = groups.get(key);
        if (group === void 0) {
            groups.set(key, {
                index: coalescedHandlers.length,
                tracer: handler,
                hasInheritable: isInheritable
            });
            coalescedHandlers.push(handler);
            return;
        }
        if (isInheritable && !group.hasInheritable) {
            group.tracer = handler;
            group.hasInheritable = true;
        } else if (isInheritable || !group.hasInheritable) group.tracer = mergeTracerConfig(group.tracer, handler);
        coalescedHandlers[group.index] = group.tracer;
    };
    for (const handler of handlers)if (handler instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"]) fold(handler);
    else coalescedHandlers.push(handler);
    for (const handler of inheritableHandlers)if (handler instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"] && !groups.has(getTracerRunStoreKey(handler))) fold(handler);
    const seenTracerStores = /* @__PURE__ */ new Set();
    return {
        handlers: coalescedHandlers,
        inheritableHandlers: inheritableHandlers.flatMap((handler)=>{
            if (!(handler instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"])) return [
                handler
            ];
            const key = getTracerRunStoreKey(handler);
            if (seenTracerStores.has(key)) return [];
            seenTracerStores.add(key);
            return [
                groups.get(key)?.tracer ?? handler
            ];
        })
    };
}
function parseCallbackConfigArg(arg) {
    if (!arg) return {};
    else if (Array.isArray(arg) || "name" in arg) return {
        callbacks: arg
    };
    else return arg;
}
/**
* Manage callbacks from different components of LangChain.
*/ var BaseCallbackManager = class {
    setHandler(handler) {
        return this.setHandlers([
            handler
        ]);
    }
};
/**
* Base class for run manager in LangChain.
*/ var BaseRunManager = class {
    runId;
    handlers;
    inheritableHandlers;
    tags;
    inheritableTags;
    metadata;
    inheritableMetadata;
    _parentRunId;
    constructor(runId, handlers, inheritableHandlers, tags, inheritableTags, metadata, inheritableMetadata, _parentRunId){
        this.runId = runId;
        this.handlers = handlers;
        this.inheritableHandlers = inheritableHandlers;
        this.tags = tags;
        this.inheritableTags = inheritableTags;
        this.metadata = metadata;
        this.inheritableMetadata = inheritableMetadata;
        this._parentRunId = _parentRunId;
    }
    get parentRunId() {
        return this._parentRunId;
    }
    async handleText(text) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleText?.(text, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleText: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleCustomEvent(eventName, data, _runId, _tags, _metadata) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleCustomEvent?.(eventName, data, this.runId, this.tags, this.metadata);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
/**
* Manages callbacks for retriever runs.
*/ var CallbackManagerForRetrieverRun = class extends BaseRunManager {
    getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) manager.addTags([
            tag
        ], false);
        return manager;
    }
    async handleRetrieverEnd(documents) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreRetriever) try {
                    await handler.handleRetrieverEnd?.(documents, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleRetriever`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleRetrieverError(err) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreRetriever) try {
                    await handler.handleRetrieverError?.(err, this.runId, this._parentRunId, this.tags);
                } catch (error) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleRetrieverError: ${error}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
var CallbackManagerForLLMRun = class extends BaseRunManager {
    async handleLLMNewToken(token, idx, _runId, _parentRunId, _tags, fields) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreLLM) try {
                    await handler.handleLLMNewToken?.(token, idx ?? {
                        prompt: 0,
                        completion: 0
                    }, this.runId, this._parentRunId, this.tags, fields);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleChatModelStreamEvent(event) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreLLM) try {
                    await handler.handleChatModelStreamEvent?.(event, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleChatModelStreamEvent: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleLLMError(err, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreLLM) try {
                    await handler.handleLLMError?.(err, this.runId, this._parentRunId, this.tags, extraParams);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleLLMError: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleLLMEnd(output, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreLLM) try {
                    await handler.handleLLMEnd?.(output, this.runId, this._parentRunId, this.tags, extraParams);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
var CallbackManagerForChainRun = class extends BaseRunManager {
    getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) manager.addTags([
            tag
        ], false);
        return manager;
    }
    async handleChainError(err, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreChain) try {
                    await handler.handleChainError?.(err, this.runId, this._parentRunId, this.tags, kwargs);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleChainError: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleChainEnd(output, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreChain) try {
                    await handler.handleChainEnd?.(output, this.runId, this._parentRunId, this.tags, kwargs);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleAgentAction(action) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleAgentAction?.(action, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleAgentEnd(action) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleAgentEnd?.(action, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
var CallbackManagerForToolRun = class extends BaseRunManager {
    getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) manager.addTags([
            tag
        ], false);
        return manager;
    }
    async handleToolError(err) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleToolError?.(err, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleToolError: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleToolEvent(chunk) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleToolEvent?.(chunk, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleToolEnd(output) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleToolEnd?.(output, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
/**
* @example
* ```typescript
* const prompt = PromptTemplate.fromTemplate("What is the answer to {question}?");
*
* // Example of using LLMChain with OpenAI and a simple prompt
* const chain = new LLMChain({
*   llm: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.9 }),
*   prompt,
* });
*
* // Running the chain with a single question
* const result = await chain.call({
*   question: "What is the airspeed velocity of an unladen swallow?",
* });
* console.log("The answer is:", result);
* ```
*/ var CallbackManager = class CallbackManager extends BaseCallbackManager {
    handlers = [];
    inheritableHandlers = [];
    tags = [];
    inheritableTags = [];
    metadata = {};
    inheritableMetadata = {};
    name = "callback_manager";
    _parentRunId;
    constructor(parentRunId, options){
        super();
        this.handlers = options?.handlers ?? this.handlers;
        this.inheritableHandlers = options?.inheritableHandlers ?? this.inheritableHandlers;
        this.tags = options?.tags ?? this.tags;
        this.inheritableTags = options?.inheritableTags ?? this.inheritableTags;
        this.metadata = options?.metadata ?? this.metadata;
        this.inheritableMetadata = options?.inheritableMetadata ?? this.inheritableMetadata;
        this._parentRunId = parentRunId;
    }
    /**
	* Gets the parent run ID, if any.
	*
	* @returns The parent run ID.
	*/ getParentRunId() {
        return this._parentRunId;
    }
    async handleLLMStart(llm, prompts, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(prompts.map(async (prompt, idx)=>{
            const runId_ = idx === 0 && runId ? runId : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v7"])();
            await Promise.all(this.handlers.map((handler)=>{
                if (handler.ignoreLLM) return;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForLLMStart(llm, [
                    prompt
                ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                    try {
                        await handler.handleLLMStart?.(llm, [
                            prompt
                        ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                    } catch (err) {
                        (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                        if (handler.raiseError) throw err;
                    }
                }, handler.awaitHandlers);
            }));
            return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
    }
    async handleChatModelStart(llm, messages, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(messages.map(async (messageGroup, idx)=>{
            const runId_ = idx === 0 && runId ? runId : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v7"])();
            await Promise.all(this.handlers.map((handler)=>{
                if (handler.ignoreLLM) return;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForChatModelStart(llm, [
                    messageGroup
                ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                    try {
                        if (handler.handleChatModelStart) await handler.handleChatModelStart?.(llm, [
                            messageGroup
                        ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                        else if (handler.handleLLMStart) {
                            const messageString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBufferString"])(messageGroup);
                            await handler.handleLLMStart?.(llm, [
                                messageString
                            ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                        }
                    } catch (err) {
                        (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                        if (handler.raiseError) throw err;
                    }
                }, handler.awaitHandlers);
            }));
            return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
    }
    async handleChainStart(chain, inputs, runId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v7"])(), runType = void 0, _tags = void 0, _metadata = void 0, runName = void 0, _parentRunId = void 0, extra = void 0) {
        await Promise.all(this.handlers.map((handler)=>{
            if (handler.ignoreChain) return;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForChainStart(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName, extra);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleChainStart?.(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName, extra);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleChainStart: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForChainRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleToolStart(tool, input, runId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v7"])(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0, toolCallId = void 0) {
        await Promise.all(this.handlers.map((handler)=>{
            if (handler.ignoreAgent) return;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForToolStart(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName, toolCallId);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleToolStart?.(tool, typeof input === "string" ? input : JSON.stringify(input), runId, this._parentRunId, this.tags, this.metadata, runName, toolCallId);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleToolStart: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForToolRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleRetrieverStart(retriever, query, runId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v7"])(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler)=>{
            if (handler.ignoreRetriever) return;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForRetrieverStart(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleRetrieverStart?.(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleRetrieverStart: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForRetrieverRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleCustomEvent(eventName, data, runId, _tags, _metadata) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreCustomEvent) try {
                    await handler.handleCustomEvent?.(eventName, data, runId, this.tags, this.metadata);
                } catch (err) {
                    (handler.raiseError ? console.error : console.warn)(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    addHandler(handler, inherit = true) {
        this.handlers.push(handler);
        if (inherit) this.inheritableHandlers.push(handler);
    }
    removeHandler(handler) {
        this.handlers = this.handlers.filter((_handler)=>_handler !== handler);
        this.inheritableHandlers = this.inheritableHandlers.filter((_handler)=>_handler !== handler);
    }
    setHandlers(handlers, inherit = true) {
        this.handlers = [];
        this.inheritableHandlers = [];
        for (const handler of handlers)this.addHandler(handler, inherit);
    }
    addTags(tags, inherit = true) {
        this.removeTags(tags);
        this.tags.push(...tags);
        if (inherit) this.inheritableTags.push(...tags);
    }
    removeTags(tags) {
        this.tags = this.tags.filter((tag)=>!tags.includes(tag));
        this.inheritableTags = this.inheritableTags.filter((tag)=>!tags.includes(tag));
    }
    addMetadata(metadata, inherit = true) {
        this.metadata = {
            ...this.metadata,
            ...metadata
        };
        if (inherit) this.inheritableMetadata = {
            ...this.inheritableMetadata,
            ...metadata
        };
    }
    removeMetadata(metadata) {
        for (const key of Object.keys(metadata)){
            delete this.metadata[key];
            delete this.inheritableMetadata[key];
        }
    }
    copy(additionalHandlers = [], inherit = true) {
        const manager = new CallbackManager(this._parentRunId);
        for (const handler of this.handlers){
            const inheritable = this.inheritableHandlers.includes(handler);
            manager.addHandler(handler, inheritable);
        }
        for (const tag of this.tags){
            const inheritable = this.inheritableTags.includes(tag);
            manager.addTags([
                tag
            ], inheritable);
        }
        for (const key of Object.keys(this.metadata)){
            const inheritable = Object.keys(this.inheritableMetadata).includes(key);
            manager.addMetadata({
                [key]: this.metadata[key]
            }, inheritable);
        }
        for (const handler of additionalHandlers){
            if (manager.handlers.filter((h)=>h.name === "console_callback_handler").some((h)=>h.name === handler.name)) continue;
            manager.addHandler(handler, inherit);
        }
        return manager;
    }
    static fromHandlers(handlers) {
        class Handler extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCallbackHandler"] {
            name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v7"])();
            constructor(){
                super();
                Object.assign(this, handlers);
            }
        }
        const manager = new this();
        manager.addHandler(new Handler());
        return manager;
    }
    static configure(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        return this._configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options);
    }
    static _configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        let callbackManager;
        if (inheritableHandlers || localHandlers) {
            if (Array.isArray(inheritableHandlers) || !inheritableHandlers) {
                callbackManager = new CallbackManager();
                callbackManager.setHandlers(inheritableHandlers?.map(ensureHandler) ?? [], true);
            } else callbackManager = inheritableHandlers;
            callbackManager = callbackManager.copy(Array.isArray(localHandlers) ? localHandlers.map(ensureHandler) : localHandlers?.handlers, false);
        }
        const verboseEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_VERBOSE") === "true" || options?.verbose;
        const traceableRunTree = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"].getTraceableRunTree();
        const tracingV2Enabled = traceableRunTree?.tracingEnabled ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isTracingEnabled"])();
        if (traceableRunTree?.tracingEnabled === false && callbackManager) {
            const inheritedTracers = callbackManager.handlers.filter((handler)=>handler.name === "langchain_tracer");
            for (const tracer of inheritedTracers)callbackManager.removeHandler(tracer);
        }
        const tracingEnabled = tracingV2Enabled || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_TRACING") ?? false);
        if (verboseEnabled || tracingEnabled) {
            if (!callbackManager) callbackManager = new CallbackManager();
            if (verboseEnabled && !callbackManager.handlers.some((handler)=>handler.name === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConsoleCallbackHandler"].prototype.name)) {
                const consoleHandler = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConsoleCallbackHandler"]();
                callbackManager.addHandler(consoleHandler, true);
            }
            if (tracingEnabled && !callbackManager.handlers.some((handler)=>handler.name === "langchain_tracer")) {
                if (tracingV2Enabled) {
                    const tracerV2 = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"]();
                    callbackManager.addHandler(tracerV2, true);
                }
            }
            if (tracingV2Enabled) {
                if (traceableRunTree && callbackManager._parentRunId === void 0) {
                    callbackManager._parentRunId = traceableRunTree.id;
                    callbackManager.handlers.find((handler)=>handler.name === "langchain_tracer")?.updateFromRunTree(traceableRunTree);
                }
            }
        }
        for (const { contextVar, inheritable = true, handlerClass, envVar } of (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_getConfigureHooks"])()){
            const createIfNotInContext = envVar && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(envVar) === "true" && handlerClass;
            let handler;
            const contextVarValue = contextVar !== void 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getContextVariable"])(contextVar) : void 0;
            if (contextVarValue && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseCallbackHandler"])(contextVarValue)) handler = contextVarValue;
            else if (createIfNotInContext) handler = new handlerClass({});
            if (handler !== void 0) {
                if (!callbackManager) callbackManager = new CallbackManager();
                if (!callbackManager.handlers.some((h)=>h.name === handler.name)) callbackManager.addHandler(handler, inheritable);
            }
        }
        if (inheritableTags || localTags) {
            if (callbackManager) {
                callbackManager.addTags(inheritableTags ?? []);
                callbackManager.addTags(localTags ?? [], false);
            }
        }
        if (inheritableMetadata || localMetadata) {
            if (callbackManager) {
                callbackManager.addMetadata(inheritableMetadata ?? {});
                callbackManager.addMetadata(localMetadata ?? {}, false);
            }
        }
        const tracerInheritableMetadata = options?.tracerInheritableMetadata;
        const tracerInheritableTags = options?.tracerInheritableTags;
        if (callbackManager && (tracerInheritableMetadata || tracerInheritableTags)) {
            const replacements = /* @__PURE__ */ new Map();
            const applyTracingConfig = (handler)=>{
                if (!(handler instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"])) return handler;
                const existing = replacements.get(handler);
                if (existing !== void 0) return existing;
                const replacement = handler.copyWithTracingConfig({
                    metadata: tracerInheritableMetadata,
                    tags: tracerInheritableTags
                });
                replacements.set(handler, replacement);
                return replacement;
            };
            callbackManager.handlers = callbackManager.handlers.map(applyTracingConfig);
            callbackManager.inheritableHandlers = callbackManager.inheritableHandlers.map(applyTracingConfig);
        }
        if (callbackManager) {
            const coalesced = coalesceTracers(callbackManager.handlers, callbackManager.inheritableHandlers);
            callbackManager.handlers = coalesced.handlers;
            callbackManager.inheritableHandlers = coalesced.inheritableHandlers;
        }
        return callbackManager;
    }
};
function ensureHandler(handler) {
    if ("name" in handler) return handler;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCallbackHandler"].fromMethods(handler);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseTracer",
    ()=>BaseTracer,
    "base_exports",
    ()=>base_exports,
    "isBaseTracer",
    ()=>isBaseTracer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/run_trees.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/run_trees.mjs [app-rsc] (ecmascript)");
;
;
;
;
//#region src/tracers/base.ts
var base_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseTracer: ()=>BaseTracer,
    isBaseTracer: ()=>isBaseTracer
});
const convertRunTreeToRun = (runTree)=>{
    if (!runTree) return;
    runTree.events = runTree.events ?? [];
    runTree.child_runs = runTree.child_runs ?? [];
    return runTree;
};
function convertRunToRunTree(run, parentRun) {
    if (!run) return;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"]({
        ...run,
        start_time: run._serialized_start_time ?? run.start_time,
        parent_run: convertRunToRunTree(parentRun),
        child_runs: run.child_runs.map((r)=>convertRunToRunTree(r)).filter((r)=>r !== void 0),
        extra: {
            ...run.extra,
            runtime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRuntimeEnvironment"])()
        },
        tracingEnabled: false
    });
}
function _coerceToDict(value, defaultKey) {
    return value && !Array.isArray(value) && typeof value === "object" ? value : {
        [defaultKey]: value
    };
}
function isBaseTracer(x) {
    return typeof x._addRunToRunMap === "function";
}
var BaseTracer = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCallbackHandler"] {
    /** @deprecated Use `runTreeMap` instead. */ runMap = /* @__PURE__ */ new Map();
    runTreeMap = /* @__PURE__ */ new Map();
    usesRunTreeMap = false;
    constructor(_fields){
        super(...arguments);
    }
    copy() {
        return this;
    }
    getRunById(runId) {
        if (runId === void 0) return;
        return this.usesRunTreeMap ? convertRunTreeToRun(this.runTreeMap.get(runId)) : this.runMap.get(runId);
    }
    stringifyError(error) {
        if (error instanceof Error) return error.message + (error?.stack ? `\n\n${error.stack}` : "");
        if (typeof error === "string") return error;
        return `${error}`;
    }
    _addChildRun(parentRun, childRun) {
        parentRun.child_runs.push(childRun);
    }
    _addRunToRunMap(run) {
        const { dottedOrder: currentDottedOrder, microsecondPrecisionDatestring } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertToDottedOrderFormat"])(new Date(run.start_time).getTime(), run.id, run.execution_order);
        const storedRun = {
            ...run
        };
        const parentRun = this.getRunById(storedRun.parent_run_id);
        if (storedRun.parent_run_id !== void 0) {
            if (parentRun) {
                this._addChildRun(parentRun, storedRun);
                parentRun.child_execution_order = Math.max(parentRun.child_execution_order, storedRun.child_execution_order);
                storedRun.trace_id = parentRun.trace_id;
                if (parentRun.dotted_order !== void 0) {
                    storedRun.dotted_order = [
                        parentRun.dotted_order,
                        currentDottedOrder
                    ].join(".");
                    storedRun._serialized_start_time = microsecondPrecisionDatestring;
                }
            } else storedRun.parent_run_id = void 0;
        } else {
            storedRun.trace_id = storedRun.id;
            storedRun.dotted_order = currentDottedOrder;
            storedRun._serialized_start_time = microsecondPrecisionDatestring;
        }
        if (this.usesRunTreeMap) {
            const runTree = convertRunToRunTree(storedRun, parentRun);
            if (runTree !== void 0) this.runTreeMap.set(storedRun.id, runTree);
        } else this.runMap.set(storedRun.id, storedRun);
        return storedRun;
    }
    async _endTrace(run) {
        const parentRun = run.parent_run_id !== void 0 && this.getRunById(run.parent_run_id);
        if (parentRun) parentRun.child_execution_order = Math.max(parentRun.child_execution_order, run.child_execution_order);
        else await this.persistRun(run);
        await this.onRunUpdate?.(run);
        if (this.usesRunTreeMap) this.runTreeMap.delete(run.id);
        else this.runMap.delete(run.id);
    }
    _getExecutionOrder(parentRunId) {
        const parentRun = parentRunId !== void 0 && this.getRunById(parentRunId);
        if (!parentRun) return 1;
        return parentRun.child_execution_order + 1;
    }
    /**
	* Create and add a run to the run map for LLM start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? {
            ...extraParams,
            metadata
        } : extraParams;
        const run = {
            id: runId,
            name: name ?? llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: {
                prompts
            },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
    }
    /**
	* Create and add a run to the run map for chat model start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? {
            ...extraParams,
            metadata
        } : extraParams;
        const run = {
            id: runId,
            name: name ?? llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: {
                messages
            },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
    }
    async handleLLMEnd(output, runId, _parentRunId, _tags, extraParams) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") throw new Error("No LLM run to end.");
        run.end_time = Date.now();
        run.outputs = output;
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        run.extra = {
            ...run.extra,
            ...extraParams
        };
        await this.onLLMEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleLLMError(error, runId, _parentRunId, _tags, extraParams) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") throw new Error("No LLM run to end.");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        run.extra = {
            ...run.extra,
            ...extraParams
        };
        await this.onLLMError?.(run);
        await this._endTrace(run);
        return run;
    }
    /**
	* Create and add a run to the run map for chain start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name, extra) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? chain.id[chain.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: chain,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs,
            execution_order,
            child_execution_order: execution_order,
            run_type: runType ?? "chain",
            child_runs: [],
            extra: metadata ? {
                ...extra,
                metadata
            } : {
                ...extra
            },
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        const run = this.getRunById(runId) ?? this._createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name);
        await this.onRunCreate?.(run);
        await this.onChainStart?.(run);
        return run;
    }
    async handleChainEnd(outputs, runId, _parentRunId, _tags, kwargs) {
        const run = this.getRunById(runId);
        if (!run) throw new Error("No chain run to end.");
        run.end_time = Date.now();
        run.outputs = _coerceToDict(outputs, "output");
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        if (kwargs?.inputs !== void 0) run.inputs = _coerceToDict(kwargs.inputs, "input");
        await this.onChainEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleChainError(error, runId, _parentRunId, _tags, kwargs) {
        const run = this.getRunById(runId);
        if (!run) throw new Error("No chain run to end.");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        if (kwargs?.inputs !== void 0) run.inputs = _coerceToDict(kwargs.inputs, "input");
        await this.onChainError?.(run);
        await this._endTrace(run);
        return run;
    }
    /**
	* Create and add a run to the run map for tool start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name, toolCallId) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? tool.id[tool.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: tool,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: typeof input === "string" ? {
                input
            } : input,
            execution_order,
            child_execution_order: execution_order,
            run_type: "tool",
            child_runs: [],
            extra: {
                ...metadata ? {
                    metadata
                } : {},
                ...toolCallId !== void 0 ? {
                    tool_call_id: toolCallId
                } : {}
            },
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleToolStart(tool, input, runId, parentRunId, tags, metadata, name, toolCallId) {
        const run = this.getRunById(runId) ?? this._createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name, toolCallId);
        await this.onRunCreate?.(run);
        await this.onToolStart?.(run);
        return run;
    }
    async handleToolEnd(output, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "tool") throw new Error("No tool run to end");
        run.end_time = Date.now();
        run.outputs = {
            output
        };
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        await this.onToolEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleToolError(error, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "tool") throw new Error("No tool run to end");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        await this.onToolError?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleAgentAction(action, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") return;
        const agentRun = run;
        agentRun.actions = agentRun.actions || [];
        agentRun.actions.push(action);
        agentRun.events.push({
            name: "agent_action",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                action
            }
        });
        await this.onAgentAction?.(run);
    }
    async handleAgentEnd(action, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") return;
        run.events.push({
            name: "agent_end",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                action
            }
        });
        await this.onAgentEnd?.(run);
    }
    /**
	* Create and add a run to the run map for retriever start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? retriever.id[retriever.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: retriever,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: {
                query
            },
            execution_order,
            child_execution_order: execution_order,
            run_type: "retriever",
            child_runs: [],
            extra: metadata ? {
                metadata
            } : {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onRetrieverStart?.(run);
        return run;
    }
    async handleRetrieverEnd(documents, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "retriever") throw new Error("No retriever run to end");
        run.end_time = Date.now();
        run.outputs = {
            documents
        };
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        await this.onRetrieverEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleRetrieverError(error, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "retriever") throw new Error("No retriever run to end");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        await this.onRetrieverError?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleText(text, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") return;
        run.events.push({
            name: "text",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                text
            }
        });
        await this.onText?.(run);
    }
    async handleLLMNewToken(token, idx, runId, _parentRunId, _tags, fields) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") throw new Error(`Invalid "runId" provided to "handleLLMNewToken" callback.`);
        run.events.push({
            name: "new_token",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                token,
                idx,
                chunk: fields?.chunk
            }
        });
        await this.onLLMNewToken?.(run, token, {
            chunk: fields?.chunk
        });
        return run;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/console.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConsoleCallbackHandler",
    ()=>ConsoleCallbackHandler,
    "console_exports",
    ()=>console_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
;
;
//#region src/tracers/console.ts
var console_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    ConsoleCallbackHandler: ()=>ConsoleCallbackHandler
});
const styles = {
    bold: {
        open: "\x1B[1m",
        close: "\x1B[22m"
    },
    color: {
        grey: {
            open: "\x1B[90m",
            close: "\x1B[39m"
        },
        green: {
            open: "\x1B[32m",
            close: "\x1B[39m"
        },
        cyan: {
            open: "\x1B[36m",
            close: "\x1B[39m"
        },
        red: {
            open: "\x1B[31m",
            close: "\x1B[39m"
        },
        blue: {
            open: "\x1B[34m",
            close: "\x1B[39m"
        }
    }
};
function wrap(style, text) {
    return `${style.open}${text}${style.close}`;
}
function tryJsonStringify(obj, fallback) {
    try {
        return JSON.stringify(obj, null, 2);
    } catch  {
        return fallback;
    }
}
function formatKVMapItem(value) {
    if (typeof value === "string") return value.trim();
    if (value === null || value === void 0) return value;
    return tryJsonStringify(value, value.toString());
}
function elapsed(run) {
    if (!run.end_time) return "";
    const elapsed = run.end_time - run.start_time;
    if (elapsed < 1e3) return `${elapsed}ms`;
    return `${(elapsed / 1e3).toFixed(2)}s`;
}
const { color } = styles;
/**
* A tracer that logs all events to the console. It extends from the
* `BaseTracer` class and overrides its methods to provide custom logging
* functionality.
* @example
* ```typescript
*
* const llm = new ChatAnthropic({
*   temperature: 0,
*   tags: ["example", "callbacks", "constructor"],
*   callbacks: [new ConsoleCallbackHandler()],
* });
*
* ```
*/ var ConsoleCallbackHandler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    name = "console_callback_handler";
    /**
	* Method used to persist the run. In this case, it simply returns a
	* resolved promise as there's no persistence logic.
	* @param _run The run to persist.
	* @returns A resolved promise.
	*/ persistRun(_run) {
        return Promise.resolve();
    }
    /**
	* Method used to get all the parent runs of a given run.
	* @param run The run whose parents are to be retrieved.
	* @returns An array of parent runs.
	*/ getParents(run) {
        const parents = [];
        let currentRun = run;
        while(currentRun.parent_run_id){
            const parent = this.runMap.get(currentRun.parent_run_id);
            if (parent) {
                parents.push(parent);
                currentRun = parent;
            } else break;
        }
        return parents;
    }
    /**
	* Method used to get a string representation of the run's lineage, which
	* is used in logging.
	* @param run The run whose lineage is to be retrieved.
	* @returns A string representation of the run's lineage.
	*/ getBreadcrumbs(run) {
        const string = [
            ...this.getParents(run).reverse(),
            run
        ].map((parent, i, arr)=>{
            const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
            return i === arr.length - 1 ? wrap(styles.bold, name) : name;
        }).join(" > ");
        return wrap(color.grey, string);
    }
    /**
	* Method used to log the start of a chain run.
	* @param run The chain run that has started.
	* @returns void
	*/ onChainStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[chain/start]")} [${crumbs}] Entering Chain run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
    }
    /**
	* Method used to log the end of a chain run.
	* @param run The chain run that has ended.
	* @returns void
	*/ onChainEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[chain/end]")} [${crumbs}] [${elapsed(run)}] Exiting Chain run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
    }
    /**
	* Method used to log any errors of a chain run.
	* @param run The chain run that has errored.
	* @returns void
	*/ onChainError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[chain/error]")} [${crumbs}] [${elapsed(run)}] Chain run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the start of an LLM run.
	* @param run The LLM run that has started.
	* @returns void
	*/ onLLMStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        const inputs = "prompts" in run.inputs ? {
            prompts: run.inputs.prompts.map((p)=>p.trim())
        } : run.inputs;
        console.log(`${wrap(color.green, "[llm/start]")} [${crumbs}] Entering LLM run with input: ${tryJsonStringify(inputs, "[inputs]")}`);
    }
    /**
	* Method used to log the end of an LLM run.
	* @param run The LLM run that has ended.
	* @returns void
	*/ onLLMEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[llm/end]")} [${crumbs}] [${elapsed(run)}] Exiting LLM run with output: ${tryJsonStringify(run.outputs, "[response]")}`);
    }
    /**
	* Method used to log any errors of an LLM run.
	* @param run The LLM run that has errored.
	* @returns void
	*/ onLLMError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[llm/error]")} [${crumbs}] [${elapsed(run)}] LLM run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the start of a tool run.
	* @param run The tool run that has started.
	* @returns void
	*/ onToolStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[tool/start]")} [${crumbs}] Entering Tool run with input: "${formatKVMapItem(run.inputs.input)}"`);
    }
    /**
	* Method used to log the end of a tool run.
	* @param run The tool run that has ended.
	* @returns void
	*/ onToolEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[tool/end]")} [${crumbs}] [${elapsed(run)}] Exiting Tool run with output: "${formatKVMapItem(run.outputs?.output)}"`);
    }
    /**
	* Method used to log any errors of a tool run.
	* @param run The tool run that has errored.
	* @returns void
	*/ onToolError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[tool/error]")} [${crumbs}] [${elapsed(run)}] Tool run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the start of a retriever run.
	* @param run The retriever run that has started.
	* @returns void
	*/ onRetrieverStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[retriever/start]")} [${crumbs}] Entering Retriever run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
    }
    /**
	* Method used to log the end of a retriever run.
	* @param run The retriever run that has ended.
	* @returns void
	*/ onRetrieverEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[retriever/end]")} [${crumbs}] [${elapsed(run)}] Exiting Retriever run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
    }
    /**
	* Method used to log any errors of a retriever run.
	* @param run The retriever run that has errored.
	* @returns void
	*/ onRetrieverError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[retriever/error]")} [${crumbs}] [${elapsed(run)}] Retriever run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the action selected by the agent.
	* @param run The run in which the agent action occurred.
	* @returns void
	*/ onAgentAction(run) {
        const agentRun = run;
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.blue, "[agent/action]")} [${crumbs}] Agent selected action: ${tryJsonStringify(agentRun.actions[agentRun.actions.length - 1], "[action]")}`);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/tracer_langchain.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LangChainTracer",
    ()=>LangChainTracer,
    "OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS",
    ()=>OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS,
    "tracer_langchain_exports",
    ()=>tracer_langchain_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/metadata.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/tracer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/run_trees.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/run_trees.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$utils$2f$project$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/utils/project.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$singletons$2f$traceable$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/singletons/traceable.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$singletons$2f$traceable$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/singletons/traceable.mjs [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
//#region src/tracers/tracer_langchain.ts
var tracer_langchain_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    LangChainTracer: ()=>LangChainTracer,
    OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS: ()=>OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS
});
/**
* Keys that should be inherited from `tracerInheritableMetadata` even when
* the run already has a value for them. This lets nested contexts
* (e.g. a subagent invoked from inside a parent agent) override a
* LangSmith-only tracing metadata value that was set by an ancestor.
*
* Keep this list very small: every key here loses the default
* "first wins" protection and is always clobbered by the nearest
* enclosing tracer config. Only keys that are strictly for LangSmith
* tracing bookkeeping should be added.
*/ const OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS = /* @__PURE__ */ new Set([
    "ls_agent_type"
]);
/**
* Extract usage_metadata from chat generations.
*
* Iterates through generations to find and aggregates all usage_metadata
* found in chat messages. This is typically present in chat model outputs.
*/ function _getUsageMetadataFromGenerations(generations) {
    let output = void 0;
    for (const generationBatch of generations)for (const generation of generationBatch)if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"].isInstance(generation.message) && generation.message.usage_metadata !== void 0) output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$metadata$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeUsageMetadata"])(output, generation.message.usage_metadata);
    return output;
}
var LangChainTracer = class LangChainTracer extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    fields;
    name = "langchain_tracer";
    projectName;
    exampleId;
    client;
    replicas;
    usesRunTreeMap = true;
    tracingMetadata;
    tracingTags = [];
    constructor(fields = {}){
        super(fields);
        this.fields = fields;
        const { exampleId, projectName, client, replicas, metadata, tags } = fields;
        this.projectName = projectName ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$utils$2f$project$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultProjectName"])();
        this.replicas = replicas;
        this.exampleId = exampleId;
        this.client = client ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultLangChainClientSingleton"])();
        this.tracingMetadata = metadata ? {
            ...metadata
        } : void 0;
        this.tracingTags = tags ?? [];
        const traceableTree = LangChainTracer.getTraceableRunTree();
        if (traceableTree) this.updateFromRunTree(traceableTree);
    }
    async persistRun(_run) {}
    async onRunCreate(run) {
        _patchMissingTracingDefaults(this, run);
        if (!run.extra?.lc_defers_inputs) await this.getRunTreeWithTracingConfig(run.id)?.postRun();
    }
    async onRunUpdate(run) {
        _patchMissingTracingDefaults(this, run);
        const runTree = this.getRunTreeWithTracingConfig(run.id);
        if (run.extra?.lc_defers_inputs) await runTree?.postRun();
        else await runTree?.patchRun();
    }
    onLLMEnd(run) {
        const outputs = run.outputs;
        if (outputs?.generations) {
            const usageMetadata = _getUsageMetadataFromGenerations(outputs.generations);
            if (usageMetadata !== void 0) {
                run.extra = run.extra ?? {};
                const metadata = run.extra.metadata ?? {};
                metadata.usage_metadata = usageMetadata;
                run.extra.metadata = metadata;
            }
        }
    }
    copyWithTracingConfig({ metadata, tags }) {
        let mergedMetadata;
        if (metadata === void 0) mergedMetadata = this.tracingMetadata ? {
            ...this.tracingMetadata
        } : void 0;
        else if (this.tracingMetadata === void 0) mergedMetadata = {
            ...metadata
        };
        else {
            mergedMetadata = {
                ...this.tracingMetadata
            };
            for (const [key, value] of Object.entries(metadata))if (!Object.prototype.hasOwnProperty.call(mergedMetadata, key) || OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS.has(key)) mergedMetadata[key] = value;
        }
        const mergedTags = tags ? Array.from(/* @__PURE__ */ new Set([
            ...this.tracingTags,
            ...tags
        ])) : [
            ...this.tracingTags
        ];
        const copied = new LangChainTracer({
            ...this.fields,
            metadata: mergedMetadata,
            tags: mergedTags
        });
        copied.runMap = this.runMap;
        copied.runTreeMap = this.runTreeMap;
        return copied;
    }
    /** @internal */ _getRunStoreKey() {
        return this.runTreeMap;
    }
    getRun(id) {
        return this.runTreeMap.get(id);
    }
    updateFromRunTree(runTree) {
        this.runTreeMap.set(runTree.id, runTree);
        let rootRun = runTree;
        const visited = /* @__PURE__ */ new Set();
        while(rootRun.parent_run){
            if (visited.has(rootRun.id)) break;
            visited.add(rootRun.id);
            if (!rootRun.parent_run) break;
            rootRun = rootRun.parent_run;
        }
        visited.clear();
        const queue = [
            rootRun
        ];
        while(queue.length > 0){
            const current = queue.shift();
            if (!current || visited.has(current.id)) continue;
            visited.add(current.id);
            this.runTreeMap.set(current.id, current);
            if (current.child_runs) queue.push(...current.child_runs);
        }
        this.client = runTree.client ?? this.client;
        this.replicas = runTree.replicas ?? this.replicas;
        this.projectName = runTree.project_name ?? this.projectName;
        this.exampleId = runTree.reference_example_id ?? this.exampleId;
        this.fields = {
            ...this.fields,
            client: this.client,
            replicas: this.replicas,
            projectName: this.projectName,
            exampleId: this.exampleId
        };
    }
    getRunTreeWithTracingConfig(id) {
        const runTree = this.runTreeMap.get(id);
        if (!runTree) return void 0;
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"]({
            ...runTree,
            client: this.client,
            project_name: this.projectName,
            replicas: this.replicas,
            reference_example_id: this.exampleId,
            tracingEnabled: true
        });
    }
    static getTraceableRunTree() {
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$singletons$2f$traceable$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentRunTree"])(true);
        } catch  {
            return;
        }
    }
    static [Symbol.hasInstance](instance) {
        if (typeof instance !== "object" || instance === null) return false;
        const candidate = instance;
        return "name" in candidate && candidate.name === "langchain_tracer" && "copyWithTracingConfig" in candidate && typeof candidate.copyWithTracingConfig === "function" && "getRunTreeWithTracingConfig" in candidate && typeof candidate.getRunTreeWithTracingConfig === "function";
    }
};
function _patchMissingTracingDefaults(tracer, run) {
    if (tracer.tracingMetadata) {
        run.extra ??= {};
        const metadata = run.extra.metadata ?? {};
        let didPatchMetadata = false;
        for (const [key, value] of Object.entries(tracer.tracingMetadata))if (!Object.prototype.hasOwnProperty.call(metadata, key) || OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS.has(key)) {
            if (metadata[key] !== value) {
                metadata[key] = value;
                didPatchMetadata = true;
            }
        }
        if (didPatchMetadata) run.extra.metadata = metadata;
    }
    if (tracer.tracingTags.length > 0) run.tags = Array.from(/* @__PURE__ */ new Set([
        ...run.tags ?? [],
        ...tracer.tracingTags
    ]));
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/log_stream.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogStreamCallbackHandler",
    ()=>LogStreamCallbackHandler,
    "RunLog",
    ()=>RunLog,
    "RunLogPatch",
    ()=>RunLogPatch,
    "isLogStreamHandler",
    ()=>isLogStreamHandler,
    "log_stream_exports",
    ()=>log_stream_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
//#region src/tracers/log_stream.ts
var log_stream_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    LogStreamCallbackHandler: ()=>LogStreamCallbackHandler,
    RunLog: ()=>RunLog,
    RunLogPatch: ()=>RunLogPatch,
    isLogStreamHandler: ()=>isLogStreamHandler
});
/**
* List of jsonpatch JSONPatchOperations, which describe how to create the run state
* from an empty dict. This is the minimal representation of the log, designed to
* be serialized as JSON and sent over the wire to reconstruct the log on the other
* side. Reconstruction of the state can be done with any jsonpatch-compliant library,
* see https://jsonpatch.com for more information.
*/ var RunLogPatch = class {
    ops;
    constructor(fields){
        this.ops = fields.ops ?? [];
    }
    concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyPatch"])({}, ops);
        return new RunLog({
            ops,
            state: states[states.length - 1].newDocument
        });
    }
};
var RunLog = class RunLog extends RunLogPatch {
    state;
    constructor(fields){
        super(fields);
        this.state = fields.state;
    }
    concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyPatch"])(this.state, other.ops);
        return new RunLog({
            ops,
            state: states[states.length - 1].newDocument
        });
    }
    static fromRunLogPatch(patch) {
        const states = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyPatch"])({}, patch.ops);
        return new RunLog({
            ops: patch.ops,
            state: states[states.length - 1].newDocument
        });
    }
};
const isLogStreamHandler = (handler)=>handler.name === "log_stream_tracer";
/**
* Extract standardized inputs from a run.
*
* Standardizes the inputs based on the type of the runnable used.
*
* @param run - Run object
* @param schemaFormat - The schema format to use.
*
* @returns Valid inputs are only dict. By conventions, inputs always represented
* invocation using named arguments.
* A null means that the input is not yet known!
*/ async function _getStandardizedInputs(run, schemaFormat) {
    if (schemaFormat === "original") throw new Error("Do not assign inputs with original schema drop the key for now. When inputs are added to streamLog they should be added with standardized schema for streaming events.");
    const { inputs } = run;
    if ([
        "retriever",
        "llm",
        "prompt"
    ].includes(run.run_type)) return inputs;
    if (Object.keys(inputs).length === 1 && inputs?.input === "") return;
    return inputs.input;
}
async function _getStandardizedOutputs(run, schemaFormat) {
    const { outputs } = run;
    if (schemaFormat === "original") return outputs;
    if ([
        "retriever",
        "llm",
        "prompt"
    ].includes(run.run_type)) return outputs;
    if (outputs !== void 0 && Object.keys(outputs).length === 1 && outputs?.output !== void 0) return outputs.output;
    return outputs;
}
function isChatGenerationChunk(x) {
    return x !== void 0 && x.message !== void 0;
}
/**
* Class that extends the `BaseTracer` class from the
* `langchain.callbacks.tracers.base` module. It represents a callback
* handler that logs the execution of runs and emits `RunLog` instances to a
* `RunLogStream`.
*/ var LogStreamCallbackHandler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    autoClose = true;
    includeNames;
    includeTypes;
    includeTags;
    excludeNames;
    excludeTypes;
    excludeTags;
    _schemaFormat = "original";
    rootId;
    keyMapByRunId = {};
    counterMapByRunName = {};
    transformStream;
    writer;
    receiveStream;
    name = "log_stream_tracer";
    lc_prefer_streaming = true;
    constructor(fields){
        super({
            _awaitHandler: true,
            ...fields
        });
        this.autoClose = fields?.autoClose ?? true;
        this.includeNames = fields?.includeNames;
        this.includeTypes = fields?.includeTypes;
        this.includeTags = fields?.includeTags;
        this.excludeNames = fields?.excludeNames;
        this.excludeTypes = fields?.excludeTypes;
        this.excludeTags = fields?.excludeTags;
        this._schemaFormat = fields?._schemaFormat ?? this._schemaFormat;
        this.transformStream = new TransformStream();
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromReadableStream(this.transformStream.readable);
    }
    [Symbol.asyncIterator]() {
        return this.receiveStream;
    }
    async persistRun(_run) {}
    _includeRun(run) {
        if (run.id === this.rootId) return false;
        const runTags = run.tags ?? [];
        let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
        if (this.includeNames !== void 0) include = include || this.includeNames.includes(run.name);
        if (this.includeTypes !== void 0) include = include || this.includeTypes.includes(run.run_type);
        if (this.includeTags !== void 0) include = include || runTags.find((tag)=>this.includeTags?.includes(tag)) !== void 0;
        if (this.excludeNames !== void 0) include = include && !this.excludeNames.includes(run.name);
        if (this.excludeTypes !== void 0) include = include && !this.excludeTypes.includes(run.run_type);
        if (this.excludeTags !== void 0) include = include && runTags.every((tag)=>!this.excludeTags?.includes(tag));
        return include;
    }
    async *tapOutputIterable(runId, output) {
        for await (const chunk of output){
            if (runId !== this.rootId) {
                const key = this.keyMapByRunId[runId];
                if (key) await this.writer.write(new RunLogPatch({
                    ops: [
                        {
                            op: "add",
                            path: `/logs/${key}/streamed_output/-`,
                            value: chunk
                        }
                    ]
                }));
            }
            yield chunk;
        }
    }
    async onRunCreate(run) {
        if (this.rootId === void 0) {
            this.rootId = run.id;
            await this.writer.write(new RunLogPatch({
                ops: [
                    {
                        op: "replace",
                        path: "",
                        value: {
                            id: run.id,
                            name: run.name,
                            type: run.run_type,
                            streamed_output: [],
                            final_output: void 0,
                            logs: {}
                        }
                    }
                ]
            }));
        }
        if (!this._includeRun(run)) return;
        if (this.counterMapByRunName[run.name] === void 0) this.counterMapByRunName[run.name] = 0;
        this.counterMapByRunName[run.name] += 1;
        const count = this.counterMapByRunName[run.name];
        this.keyMapByRunId[run.id] = count === 1 ? run.name : `${run.name}:${count}`;
        const logEntry = {
            id: run.id,
            name: run.name,
            type: run.run_type,
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            start_time: new Date(run.start_time).toISOString(),
            streamed_output: [],
            streamed_output_str: [],
            final_output: void 0,
            end_time: void 0
        };
        if (this._schemaFormat === "streaming_events") logEntry.inputs = await _getStandardizedInputs(run, this._schemaFormat);
        await this.writer.write(new RunLogPatch({
            ops: [
                {
                    op: "add",
                    path: `/logs/${this.keyMapByRunId[run.id]}`,
                    value: logEntry
                }
            ]
        }));
    }
    async onRunUpdate(run) {
        try {
            const runName = this.keyMapByRunId[run.id];
            if (runName === void 0) return;
            const ops = [];
            if (this._schemaFormat === "streaming_events") ops.push({
                op: "replace",
                path: `/logs/${runName}/inputs`,
                value: await _getStandardizedInputs(run, this._schemaFormat)
            });
            ops.push({
                op: "add",
                path: `/logs/${runName}/final_output`,
                value: await _getStandardizedOutputs(run, this._schemaFormat)
            });
            if (run.end_time !== void 0) ops.push({
                op: "add",
                path: `/logs/${runName}/end_time`,
                value: new Date(run.end_time).toISOString()
            });
            const patch = new RunLogPatch({
                ops
            });
            await this.writer.write(patch);
        } finally{
            if (run.id === this.rootId) {
                const patch = new RunLogPatch({
                    ops: [
                        {
                            op: "replace",
                            path: "/final_output",
                            value: await _getStandardizedOutputs(run, this._schemaFormat)
                        }
                    ]
                });
                await this.writer.write(patch);
                if (this.autoClose) await this.writer.close();
            }
        }
    }
    async onLLMNewToken(run, token, kwargs) {
        const runName = this.keyMapByRunId[run.id];
        if (runName === void 0) return;
        const isChatModel = run.inputs.messages !== void 0;
        let streamedOutputValue;
        if (isChatModel) {
            if (isChatGenerationChunk(kwargs?.chunk)) streamedOutputValue = kwargs?.chunk;
            else streamedOutputValue = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
                id: `run-${run.id}`,
                content: token
            });
        } else streamedOutputValue = token;
        const patch = new RunLogPatch({
            ops: [
                {
                    op: "add",
                    path: `/logs/${runName}/streamed_output_str/-`,
                    value: token
                },
                {
                    op: "add",
                    path: `/logs/${runName}/streamed_output/-`,
                    value: streamedOutputValue
                }
            ]
        });
        await this.writer.write(patch);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/event_stream.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventStreamCallbackHandler",
    ()=>EventStreamCallbackHandler,
    "isStreamEventsHandler",
    ()=>isStreamEventsHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/tracers/event_stream.ts
function assignName({ name, serialized }) {
    if (name !== void 0) return name;
    if (serialized?.name !== void 0) return serialized.name;
    else if (serialized?.id !== void 0 && Array.isArray(serialized?.id)) return serialized.id[serialized.id.length - 1];
    return "Unnamed";
}
const isStreamEventsHandler = (handler)=>handler.name === "event_stream_tracer";
/**
* Class that extends the `BaseTracer` class from the
* `langchain.callbacks.tracers.base` module. It represents a callback
* handler that logs the execution of runs and emits `RunLog` instances to a
* `RunLogStream`.
*/ var EventStreamCallbackHandler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    autoClose = true;
    includeNames;
    includeTypes;
    includeTags;
    excludeNames;
    excludeTypes;
    excludeTags;
    runInfoMap = /* @__PURE__ */ new Map();
    tappedPromises = /* @__PURE__ */ new Map();
    transformStream;
    writer;
    receiveStream;
    readableStreamClosed = false;
    name = "event_stream_tracer";
    lc_prefer_streaming = true;
    constructor(fields){
        super({
            _awaitHandler: true,
            ...fields
        });
        this.autoClose = fields?.autoClose ?? true;
        this.includeNames = fields?.includeNames;
        this.includeTypes = fields?.includeTypes;
        this.includeTags = fields?.includeTags;
        this.excludeNames = fields?.excludeNames;
        this.excludeTypes = fields?.excludeTypes;
        this.excludeTags = fields?.excludeTags;
        this.transformStream = new TransformStream({
            flush: ()=>{
                this.readableStreamClosed = true;
            }
        });
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromReadableStream(this.transformStream.readable);
    }
    [Symbol.asyncIterator]() {
        return this.receiveStream;
    }
    async persistRun(_run) {}
    _includeRun(run) {
        const runTags = run.tags ?? [];
        let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
        if (this.includeNames !== void 0) include = include || this.includeNames.includes(run.name);
        if (this.includeTypes !== void 0) include = include || this.includeTypes.includes(run.runType);
        if (this.includeTags !== void 0) include = include || runTags.find((tag)=>this.includeTags?.includes(tag)) !== void 0;
        if (this.excludeNames !== void 0) include = include && !this.excludeNames.includes(run.name);
        if (this.excludeTypes !== void 0) include = include && !this.excludeTypes.includes(run.runType);
        if (this.excludeTags !== void 0) include = include && runTags.every((tag)=>!this.excludeTags?.includes(tag));
        return include;
    }
    async *tapOutputIterable(runId, outputStream) {
        const firstChunk = await outputStream.next();
        if (firstChunk.done) return;
        const runInfo = this.runInfoMap.get(runId);
        if (runInfo === void 0) {
            yield firstChunk.value;
            return;
        }
        function _formatOutputChunk(eventType, data) {
            if (eventType === "llm" && typeof data === "string") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: data
            });
            return data;
        }
        let tappedPromise = this.tappedPromises.get(runId);
        if (tappedPromise === void 0) {
            let tappedPromiseResolver;
            tappedPromise = new Promise((resolve)=>{
                tappedPromiseResolver = resolve;
            });
            this.tappedPromises.set(runId, tappedPromise);
            try {
                const event = {
                    event: `on_${runInfo.runType}_stream`,
                    run_id: runId,
                    name: runInfo.name,
                    tags: runInfo.tags,
                    metadata: runInfo.metadata,
                    data: {}
                };
                await this.send({
                    ...event,
                    data: {
                        chunk: _formatOutputChunk(runInfo.runType, firstChunk.value)
                    }
                }, runInfo);
                yield firstChunk.value;
                for await (const chunk of outputStream){
                    if (runInfo.runType !== "tool" && runInfo.runType !== "retriever") await this.send({
                        ...event,
                        data: {
                            chunk: _formatOutputChunk(runInfo.runType, chunk)
                        }
                    }, runInfo);
                    yield chunk;
                }
            } finally{
                tappedPromiseResolver?.();
            }
        } else {
            yield firstChunk.value;
            for await (const chunk of outputStream)yield chunk;
        }
    }
    async send(payload, run) {
        if (this.readableStreamClosed) return;
        if (this._includeRun(run)) await this.writer.write(payload);
    }
    async sendEndEvent(payload, run) {
        const tappedPromise = this.tappedPromises.get(payload.run_id);
        if (tappedPromise !== void 0) tappedPromise.then(()=>{
            this.send(payload, run);
        });
        else await this.send(payload, run);
    }
    async onLLMStart(run) {
        const runName = assignName(run);
        const runType = run.inputs.messages !== void 0 ? "chat_model" : "llm";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType,
            inputs: run.inputs
        };
        this.runInfoMap.set(run.id, runInfo);
        const eventName = `on_${runType}_start`;
        await this.send({
            event: eventName,
            data: {
                input: run.inputs
            },
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onLLMNewToken(run, token, kwargs) {
        const runInfo = this.runInfoMap.get(run.id);
        let chunk;
        let eventName;
        if (runInfo === void 0) throw new Error(`onLLMNewToken: Run ID ${run.id} not found in run map.`);
        if (this.runInfoMap.size === 1) return;
        if (runInfo.runType === "chat_model") {
            eventName = "on_chat_model_stream";
            if (kwargs?.chunk === void 0) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
                content: token,
                id: `run-${run.id}`
            });
            else chunk = kwargs.chunk.message;
        } else if (runInfo.runType === "llm") {
            eventName = "on_llm_stream";
            if (kwargs?.chunk === void 0) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: token
            });
            else chunk = kwargs.chunk;
        } else throw new Error(`Unexpected run type ${runInfo.runType}`);
        await this.send({
            event: eventName,
            data: {
                chunk
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async onLLMEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        let eventName;
        if (runInfo === void 0) throw new Error(`onLLMEnd: Run ID ${run.id} not found in run map.`);
        const generations = run.outputs?.generations;
        let output;
        if (runInfo.runType === "chat_model") {
            for (const generation of generations ?? []){
                if (output !== void 0) break;
                output = generation[0]?.message;
            }
            eventName = "on_chat_model_end";
        } else if (runInfo.runType === "llm") {
            output = {
                generations: generations?.map((generation)=>{
                    return generation.map((chunk)=>{
                        return {
                            text: chunk.text,
                            generationInfo: chunk.generationInfo
                        };
                    });
                }),
                llmOutput: run.outputs?.llmOutput ?? {}
            };
            eventName = "on_llm_end";
        } else throw new Error(`onLLMEnd: Unexpected run type: ${runInfo.runType}`);
        await this.sendEndEvent({
            event: eventName,
            data: {
                output,
                input: runInfo.inputs
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async onChainStart(run) {
        const runName = assignName(run);
        const runType = run.run_type ?? "chain";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType: run.run_type
        };
        let eventData = {};
        if (run.inputs.input === "" && Object.keys(run.inputs).length === 1) {
            eventData = {};
            runInfo.inputs = {};
        } else if (run.inputs.input !== void 0) {
            eventData.input = run.inputs.input;
            runInfo.inputs = run.inputs.input;
        } else {
            eventData.input = run.inputs;
            runInfo.inputs = run.inputs;
        }
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: `on_${runType}_start`,
            data: eventData,
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onChainEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) throw new Error(`onChainEnd: Run ID ${run.id} not found in run map.`);
        const eventName = `on_${run.run_type}_end`;
        const inputs = run.inputs ?? runInfo.inputs ?? {};
        const data = {
            output: run.outputs?.output ?? run.outputs,
            input: inputs
        };
        if (inputs.input && Object.keys(inputs).length === 1) {
            data.input = inputs.input;
            runInfo.inputs = inputs.input;
        }
        await this.sendEndEvent({
            event: eventName,
            data,
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata ?? {}
        }, runInfo);
    }
    async onToolStart(run) {
        const runName = assignName(run);
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType: "tool",
            inputs: run.inputs ?? {}
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: "on_tool_start",
            data: {
                input: run.inputs ?? {}
            },
            name: runName,
            run_id: run.id,
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onToolEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) throw new Error(`onToolEnd: Run ID ${run.id} not found in run map.`);
        if (runInfo.inputs === void 0) throw new Error(`onToolEnd: Run ID ${run.id} is a tool call, and is expected to have traced inputs.`);
        const output = run.outputs?.output === void 0 ? run.outputs : run.outputs.output;
        await this.sendEndEvent({
            event: "on_tool_end",
            data: {
                output,
                input: runInfo.inputs
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async onToolError(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) throw new Error(`onToolEnd: Run ID ${run.id} not found in run map.`);
        if (runInfo.inputs === void 0) throw new Error(`onToolEnd: Run ID ${run.id} is a tool call, and is expected to have traced inputs.`);
        await this.sendEndEvent({
            event: "on_tool_error",
            data: {
                input: runInfo.inputs,
                error: run.error
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async onRetrieverStart(run) {
        const runName = assignName(run);
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType: "retriever",
            inputs: {
                query: run.inputs.query
            }
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: "on_retriever_start",
            data: {
                input: {
                    query: run.inputs.query
                }
            },
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onRetrieverEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) throw new Error(`onRetrieverEnd: Run ID ${run.id} not found in run map.`);
        await this.sendEndEvent({
            event: "on_retriever_end",
            data: {
                output: run.outputs?.documents ?? run.outputs,
                input: runInfo.inputs
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async handleCustomEvent(eventName, data, runId) {
        const runInfo = this.runInfoMap.get(runId);
        if (runInfo === void 0) throw new Error(`handleCustomEvent: Run ID ${runId} not found in run map.`);
        await this.send({
            event: "on_custom_event",
            run_id: runId,
            name: eventName,
            tags: runInfo.tags,
            metadata: runInfo.metadata,
            data
        }, runInfo);
    }
    async finish() {
        const pendingPromises = [
            ...this.tappedPromises.values()
        ];
        Promise.all(pendingPromises).finally(()=>{
            this.writer.close();
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/root_listener.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RootListenersTracer",
    ()=>RootListenersTracer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
;
//#region src/tracers/root_listener.ts
var RootListenersTracer = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    name = "RootListenersTracer";
    /** The Run's ID. Type UUID */ rootId;
    config;
    argOnStart;
    argOnEnd;
    argOnError;
    constructor({ config, onStart, onEnd, onError }){
        super({
            _awaitHandler: true
        });
        this.config = config;
        this.argOnStart = onStart;
        this.argOnEnd = onEnd;
        this.argOnError = onError;
    }
    /**
	* This is a legacy method only called once for an entire run tree
	* therefore not useful here
	* @param {Run} _ Not used
	*/ persistRun(_) {
        return Promise.resolve();
    }
    async onRunCreate(run) {
        if (this.rootId) return;
        this.rootId = run.id;
        if (this.argOnStart) await this.argOnStart(run, this.config);
    }
    async onRunUpdate(run) {
        if (run.id !== this.rootId) return;
        if (!run.error) {
            if (this.argOnEnd) await this.argOnEnd(run, this.config);
        } else if (this.argOnError) await this.argOnError(run, this.config);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/run_collector.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RunCollectorCallbackHandler",
    ()=>RunCollectorCallbackHandler,
    "run_collector_exports",
    ()=>run_collector_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
;
;
//#region src/tracers/run_collector.ts
var run_collector_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    RunCollectorCallbackHandler: ()=>RunCollectorCallbackHandler
});
/**
* A callback handler that collects traced runs and makes it easy to fetch the traced run object from calls through any langchain object.
* For instance, it makes it easy to fetch the run ID and then do things with that, such as log feedback.
*/ var RunCollectorCallbackHandler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    /** The name of the callback handler. */ name = "run_collector";
    /** The ID of the example. */ exampleId;
    /** An array of traced runs. */ tracedRuns;
    /**
	* Creates a new instance of the RunCollectorCallbackHandler class.
	* @param exampleId The ID of the example.
	*/ constructor({ exampleId } = {}){
        super({
            _awaitHandler: true
        });
        this.exampleId = exampleId;
        this.tracedRuns = [];
    }
    /**
	* Persists the given run object.
	* @param run The run object to persist.
	*/ async persistRun(run) {
        const run_ = {
            ...run
        };
        run_.reference_example_id = this.exampleId;
        this.tracedRuns.push(run_);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/tracer.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultLangChainClientSingleton",
    ()=>getDefaultLangChainClientSingleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$client$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/client.mjs [app-rsc] (ecmascript)");
;
;
//#region src/singletons/tracer.ts
let client;
const getDefaultLangChainClientSingleton = ()=>{
    if (client === void 0) {
        const clientParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_CALLBACKS_BACKGROUND") === "false" ? {
            blockOnRootRunFinalization: true
        } : {};
        client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$client$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Client"](clientParams);
    }
    return client;
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRACING_ALS_KEY",
    ()=>TRACING_ALS_KEY,
    "_CONTEXT_VARIABLES_KEY",
    ()=>_CONTEXT_VARIABLES_KEY,
    "getGlobalAsyncLocalStorageInstance",
    ()=>getGlobalAsyncLocalStorageInstance,
    "setGlobalAsyncLocalStorageInstance",
    ()=>setGlobalAsyncLocalStorageInstance
]);
//#region src/singletons/async_local_storage/globals.ts
const TRACING_ALS_KEY = Symbol.for("ls:tracing_async_local_storage");
const _CONTEXT_VARIABLES_KEY = Symbol.for("lc:context_variables");
const setGlobalAsyncLocalStorageInstance = (instance)=>{
    globalThis[TRACING_ALS_KEY] = instance;
};
const getGlobalAsyncLocalStorageInstance = ()=>{
    return globalThis[TRACING_ALS_KEY];
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/callbacks.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "awaitAllCallbacks",
    ()=>awaitAllCallbacks,
    "consumeCallback",
    ()=>consumeCallback,
    "getQueue",
    ()=>getQueue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/tracer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/index.js [app-rsc] (ecmascript)");
;
;
;
//#region src/singletons/callbacks.ts
let queue;
/**
* Creates a queue using the p-queue library. The queue is configured to
* auto-start and has a concurrency of 1, meaning it will process tasks
* one at a time.
*/ function createQueue() {
    return new ("default" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].default : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])({
        autoStart: true,
        concurrency: 1
    });
}
function getQueue() {
    if (typeof queue === "undefined") queue = createQueue();
    return queue;
}
/**
* Consume a promise, either adding it to the queue or waiting for it to resolve
* @param promiseFn Promise to consume
* @param wait Whether to wait for the promise to resolve or resolve immediately
*/ async function consumeCallback(promiseFn, wait) {
    if (wait === true) {
        const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
        if (asyncLocalStorageInstance !== void 0) await asyncLocalStorageInstance.run(void 0, async ()=>promiseFn());
        else await promiseFn();
    } else {
        queue = getQueue();
        queue.add(async ()=>{
            const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
            if (asyncLocalStorageInstance !== void 0) await asyncLocalStorageInstance.run(void 0, async ()=>promiseFn());
            else await promiseFn();
        });
    }
}
/**
* Waits for all promises in the queue to resolve. If the queue is
* undefined, it immediately resolves a promise.
*/ async function awaitAllCallbacks() {
    const defaultClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultLangChainClientSingleton"])();
    await Promise.allSettled([
        typeof queue !== "undefined" ? queue.onIdle() : Promise.resolve(),
        defaultClient.awaitPendingTraceBatches()
    ]);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/context.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_getConfigureHooks",
    ()=>_getConfigureHooks,
    "getContextVariable",
    ()=>getContextVariable,
    "registerConfigureHook",
    ()=>registerConfigureHook,
    "setContextVariable",
    ()=>setContextVariable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/run_trees.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/run_trees.mjs [app-rsc] (ecmascript)");
;
;
//#region src/singletons/async_local_storage/context.ts
/**
* Set a context variable. Context variables are scoped to any
* child runnables called by the current runnable, or globally if set outside
* of any runnable.
*
* @remarks
* This function is only supported in environments that support AsyncLocalStorage,
* including Node.js, Deno, and Cloudflare Workers.
*
* @example
* ```ts
* import { RunnableLambda } from "@langchain/core/runnables";
* import {
*   getContextVariable,
*   setContextVariable
* } from "@langchain/core/context";
*
* const nested = RunnableLambda.from(() => {
*   // "bar" because it was set by a parent
*   console.log(getContextVariable("foo"));
*
*   // Override to "baz", but only for child runnables
*   setContextVariable("foo", "baz");
*
*   // Now "baz", but only for child runnables
*   return getContextVariable("foo");
* });
*
* const runnable = RunnableLambda.from(async () => {
*   // Set a context variable named "foo"
*   setContextVariable("foo", "bar");
*
*   const res = await nested.invoke({});
*
*   // Still "bar" since child changes do not affect parents
*   console.log(getContextVariable("foo"));
*
*   return res;
* });
*
* // undefined, because context variable has not been set yet
* console.log(getContextVariable("foo"));
*
* // Final return value is "baz"
* const result = await runnable.invoke({});
* ```
*
* @param name The name of the context variable.
* @param value The value to set.
*/ function setContextVariable(name, value) {
    const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
    if (asyncLocalStorageInstance === void 0) throw new Error(`Internal error: Global shared async local storage instance has not been initialized.`);
    const runTree = asyncLocalStorageInstance.getStore();
    const contextVars = {
        ...runTree?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]]
    };
    contextVars[name] = value;
    let newValue = {};
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRunTree"])(runTree)) newValue = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"](runTree);
    newValue[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]] = contextVars;
    asyncLocalStorageInstance.enterWith(newValue);
}
/**
* Get the value of a previously set context variable. Context variables
* are scoped to any child runnables called by the current runnable,
* or globally if set outside of any runnable.
*
* @remarks
* This function is only supported in environments that support AsyncLocalStorage,
* including Node.js, Deno, and Cloudflare Workers.
*
* @example
* ```ts
* import { RunnableLambda } from "@langchain/core/runnables";
* import {
*   getContextVariable,
*   setContextVariable
* } from "@langchain/core/context";
*
* const nested = RunnableLambda.from(() => {
*   // "bar" because it was set by a parent
*   console.log(getContextVariable("foo"));
*
*   // Override to "baz", but only for child runnables
*   setContextVariable("foo", "baz");
*
*   // Now "baz", but only for child runnables
*   return getContextVariable("foo");
* });
*
* const runnable = RunnableLambda.from(async () => {
*   // Set a context variable named "foo"
*   setContextVariable("foo", "bar");
*
*   const res = await nested.invoke({});
*
*   // Still "bar" since child changes do not affect parents
*   console.log(getContextVariable("foo"));
*
*   return res;
* });
*
* // undefined, because context variable has not been set yet
* console.log(getContextVariable("foo"));
*
* // Final return value is "baz"
* const result = await runnable.invoke({});
* ```
*
* @param name The name of the context variable.
*/ function getContextVariable(name) {
    const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
    if (asyncLocalStorageInstance === void 0) return;
    return asyncLocalStorageInstance.getStore()?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]]?.[name];
}
const LC_CONFIGURE_HOOKS_KEY = Symbol("lc:configure_hooks");
const _getConfigureHooks = ()=>getContextVariable(LC_CONFIGURE_HOOKS_KEY) || [];
/**
* Register a callback configure hook to automatically add callback handlers to all runs.
*
* There are two ways to use this:
*
* 1. Using a context variable:
*    - Set `contextVar` to specify the variable name
*    - Use `setContextVariable()` to store your handler instance
*
* 2. Using an environment variable:
*    - Set both `envVar` and `handlerClass`
*    - The handler will be instantiated when the env var is set to "true".
*
* @example
* ```typescript
* // Method 1: Using context variable
* import {
*   registerConfigureHook,
*   setContextVariable
* } from "@langchain/core/context";
*
* const tracer = new MyCallbackHandler();
* registerConfigureHook({
*   contextVar: "my_tracer",
* });
* setContextVariable("my_tracer", tracer);
*
* // ...run code here
*
* // Method 2: Using environment variable
* registerConfigureHook({
*   handlerClass: MyCallbackHandler,
*   envVar: "MY_TRACER_ENABLED",
* });
* process.env.MY_TRACER_ENABLED = "true";
*
* // ...run code here
* ```
*
* @param config Configuration object for the hook
* @param config.contextVar Name of the context variable containing the handler instance
* @param config.inheritable Whether child runs should inherit this handler
* @param config.handlerClass Optional callback handler class (required if using envVar)
* @param config.envVar Optional environment variable name to control handler activation
*/ const registerConfigureHook = (config)=>{
    if (config.envVar && !config.handlerClass) throw new Error("If envVar is set, handlerClass must also be set to a non-None value.");
    setContextVariable(LC_CONFIGURE_HOOKS_KEY, [
        ..._getConfigureHooks(),
        config
    ]);
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncLocalStorageProviderSingleton",
    ()=>AsyncLocalStorageProviderSingleton,
    "MockAsyncLocalStorage",
    ()=>MockAsyncLocalStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/run_trees.mjs [app-rsc] (ecmascript)");
;
;
;
//#region src/singletons/async_local_storage/index.ts
var MockAsyncLocalStorage = class {
    getStore() {}
    run(_store, callback) {
        return callback();
    }
    enterWith(_store) {}
};
const mockAsyncLocalStorage = new MockAsyncLocalStorage();
const LC_CHILD_KEY = Symbol.for("lc:child_config");
var AsyncLocalStorageProvider = class {
    getInstance() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])() ?? mockAsyncLocalStorage;
    }
    getRunnableConfig() {
        return this.getInstance().getStore()?.extra?.[LC_CHILD_KEY];
    }
    runWithConfig(config, callback, avoidCreatingRootRunTree) {
        const callbackManager = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"]._configureSync(config?.callbacks, void 0, config?.tags, void 0, config?.metadata);
        const storage = this.getInstance();
        const previousValue = storage.getStore();
        const parentRunId = callbackManager?.getParentRunId();
        const langChainTracer = callbackManager?.handlers?.find((handler)=>handler?.name === "langchain_tracer");
        let runTree;
        if (langChainTracer && parentRunId) runTree = langChainTracer.getRunTreeWithTracingConfig(parentRunId);
        else if (!avoidCreatingRootRunTree) runTree = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$run_trees$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"]({
            name: "<runnable_lambda>",
            tracingEnabled: false
        });
        if (runTree) runTree.extra = {
            ...runTree.extra,
            [LC_CHILD_KEY]: config
        };
        if (previousValue !== void 0 && previousValue[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]] !== void 0) {
            if (runTree === void 0) runTree = {};
            runTree[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]] = previousValue[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]];
        }
        return storage.run(runTree, callback);
    }
    initializeGlobalInstance(instance) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])() === void 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setGlobalAsyncLocalStorageInstance"])(instance);
    }
};
const AsyncLocalStorageProviderSingleton = new AsyncLocalStorageProvider();
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "singletons_exports",
    ()=>singletons_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-rsc] (ecmascript)");
;
;
;
//#region src/singletons/index.ts
var singletons_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    AsyncLocalStorageProviderSingleton: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"],
    MockAsyncLocalStorage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MockAsyncLocalStorage"],
    _CONTEXT_VARIABLES_KEY: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatGenerationChunk",
    ()=>ChatGenerationChunk,
    "GenerationChunk",
    ()=>GenerationChunk,
    "RUN_KEY",
    ()=>RUN_KEY,
    "outputs_exports",
    ()=>outputs_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/outputs.ts
var outputs_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    ChatGenerationChunk: ()=>ChatGenerationChunk,
    GenerationChunk: ()=>GenerationChunk,
    RUN_KEY: ()=>RUN_KEY
});
const RUN_KEY = "__run";
/**
* Chunk of a single generation. Used for streaming.
*/ var GenerationChunk = class GenerationChunk {
    text;
    generationInfo;
    constructor(fields){
        this.text = fields.text;
        this.generationInfo = fields.generationInfo;
    }
    concat(chunk) {
        return new GenerationChunk({
            text: this.text + chunk.text,
            generationInfo: {
                ...this.generationInfo,
                ...chunk.generationInfo
            }
        });
    }
};
var ChatGenerationChunk = class ChatGenerationChunk extends GenerationChunk {
    message;
    constructor(fields){
        super(fields);
        this.message = fields.message;
    }
    concat(chunk) {
        return new ChatGenerationChunk({
            text: this.text + chunk.text,
            generationInfo: {
                ...this.generationInfo,
                ...chunk.generationInfo
            },
            message: this.message.concat(chunk.message)
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/chat_history.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseChatMessageHistory",
    ()=>BaseChatMessageHistory,
    "BaseListChatMessageHistory",
    ()=>BaseListChatMessageHistory,
    "InMemoryChatMessageHistory",
    ()=>InMemoryChatMessageHistory,
    "chat_history_exports",
    ()=>chat_history_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
;
//#region src/chat_history.ts
var chat_history_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseChatMessageHistory: ()=>BaseChatMessageHistory,
    BaseListChatMessageHistory: ()=>BaseListChatMessageHistory,
    InMemoryChatMessageHistory: ()=>InMemoryChatMessageHistory
});
/**
* Base class for all chat message histories. All chat message histories
* should extend this class.
*/ var BaseChatMessageHistory = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
    /**
	* Add a list of messages.
	*
	* Implementations should override this method to handle bulk addition of messages
	* in an efficient manner to avoid unnecessary round-trips to the underlying store.
	*
	* @param messages - A list of BaseMessage objects to store.
	*/ async addMessages(messages) {
        for (const message of messages)await this.addMessage(message);
    }
};
/**
* Base class for all list chat message histories. All list chat message
* histories should extend this class.
*/ var BaseListChatMessageHistory = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
    /**
	* This is a convenience method for adding a human message string to the store.
	* Please note that this is a convenience method. Code should favor the
	* bulk addMessages interface instead to save on round-trips to the underlying
	* persistence layer.
	* This method may be deprecated in a future release.
	*/ addUserMessage(message) {
        return this.addMessage(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"](message));
    }
    /**
	* This is a convenience method for adding an AI message string to the store.
	* Please note that this is a convenience method. Code should favor the bulk
	* addMessages interface instead to save on round-trips to the underlying
	* persistence layer.
	* This method may be deprecated in a future release.
	*/ addAIMessage(message) {
        return this.addMessage(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"](message));
    }
    /**
	* Add a list of messages.
	*
	* Implementations should override this method to handle bulk addition of messages
	* in an efficient manner to avoid unnecessary round-trips to the underlying store.
	*
	* @param messages - A list of BaseMessage objects to store.
	*/ async addMessages(messages) {
        for (const message of messages)await this.addMessage(message);
    }
    /**
	* Remove all messages from the store.
	*/ clear() {
        throw new Error("Not implemented.");
    }
};
/**
* Class for storing chat message history in-memory. It extends the
* BaseListChatMessageHistory class and provides methods to get, add, and
* clear messages.
*/ var InMemoryChatMessageHistory = class extends BaseListChatMessageHistory {
    lc_namespace = [
        "langchain",
        "stores",
        "message",
        "in_memory"
    ];
    messages = [];
    constructor(messages){
        super(...arguments);
        this.messages = messages ?? [];
    }
    /**
	* Method to get all the messages stored in the ChatMessageHistory
	* instance.
	* @returns Array of stored BaseMessage instances.
	*/ async getMessages() {
        return this.messages;
    }
    /**
	* Method to add a new message to the ChatMessageHistory instance.
	* @param message The BaseMessage instance to add.
	* @returns A promise that resolves when the message has been added.
	*/ async addMessage(message) {
        this.messages.push(message);
    }
    /**
	* Method to clear all the messages from the ChatMessageHistory instance.
	* @returns A promise that resolves when all messages have been cleared.
	*/ async clear() {
        this.messages = [];
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/document.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Document",
    ()=>Document
]);
//#region src/documents/document.ts
/**
* Interface for interacting with a document.
*/ var Document = class {
    pageContent;
    metadata;
    /**
	* An optional identifier for the document.
	*
	* Ideally this should be unique across the document collection and formatted
	* as a UUID, but this will not be enforced.
	*/ id;
    constructor(fields){
        this.pageContent = fields.pageContent !== void 0 ? fields.pageContent.toString() : "";
        this.metadata = fields.metadata ?? {};
        this.id = fields.id;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/transformers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseDocumentTransformer",
    ()=>BaseDocumentTransformer,
    "MappingDocumentTransformer",
    ()=>MappingDocumentTransformer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
;
//#region src/documents/transformers.ts
/**
* Abstract base class for document transformation systems.
*
* A document transformation system takes an array of Documents and returns an
* array of transformed Documents. These arrays do not necessarily have to have
* the same length.
*
* One example of this is a text splitter that splits a large document into
* many smaller documents.
*/ var BaseDocumentTransformer = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    lc_namespace = [
        "langchain_core",
        "documents",
        "transformers"
    ];
    /**
	* Method to invoke the document transformation. This method calls the
	* transformDocuments method with the provided input.
	* @param input The input documents to be transformed.
	* @param _options Optional configuration object to customize the behavior of callbacks.
	* @returns A Promise that resolves to the transformed documents.
	*/ invoke(input, _options) {
        return this.transformDocuments(input);
    }
};
/**
* Class for document transformers that return exactly one transformed document
* for each input document.
*/ var MappingDocumentTransformer = class extends BaseDocumentTransformer {
    async transformDocuments(documents) {
        const newDocuments = [];
        for (const document of documents){
            const transformedDocument = await this._transformDocument(document);
            newDocuments.push(transformedDocument);
        }
        return newDocuments;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "documents_exports",
    ()=>documents_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/document.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$transformers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/transformers.js [app-rsc] (ecmascript)");
;
;
;
//#region src/documents/index.ts
var documents_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseDocumentTransformer: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$transformers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseDocumentTransformer"],
    Document: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"],
    MappingDocumentTransformer: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$transformers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MappingDocumentTransformer"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/document_loaders/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseDocumentLoader",
    ()=>BaseDocumentLoader,
    "base_exports",
    ()=>base_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/document_loaders/base.ts
var base_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseDocumentLoader: ()=>BaseDocumentLoader
});
/**
* Abstract class that provides a default implementation for the
* loadAndSplit() method from the DocumentLoader interface. The load()
* method is left abstract and needs to be implemented by subclasses.
*/ var BaseDocumentLoader = class {
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/document_loaders/langsmith.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LangSmithLoader",
    ()=>LangSmithLoader,
    "langsmith_exports",
    ()=>langsmith_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$document_loaders$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/document_loaders/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$client$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.10.11_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy+sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2/node_modules/langsmith/lib/client.mjs [app-rsc] (ecmascript)");
;
;
;
//#region src/document_loaders/langsmith.ts
var langsmith_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    LangSmithLoader: ()=>LangSmithLoader
});
/**
* Document loader integration with LangSmith.
*
* ## [Constructor args](https://api.js.langchain.com/interfaces/_langchain_core.document_loaders_langsmith.LangSmithLoaderFields.html)
*
* <details open>
* <summary><strong>Load</strong></summary>
*
* ```typescript
* import { LangSmithLoader } from '@langchain/core/document_loaders/langsmith';
* import { Client } from 'langsmith';
*
* const langSmithClient = new Client({
*   apiKey: process.env.LANGSMITH_API_KEY,
* })
*
* const loader = new LangSmithLoader({
*   datasetId: "9a3b36f7-b308-40a5-9b46-6613853b6330",
*   limit: 1,
* });
*
* const docs = await loader.load();
* ```
*
* ```txt
* [
*   {
*     pageContent: '{\n  "input_key_str": "string",\n  "input_key_bool": true\n}',
*     metadata: {
*       id: '8523d9e9-c123-4b23-9b46-21021nds289e',
*       created_at: '2024-08-19T17:09:14.806441+00:00',
*       modified_at: '2024-08-19T17:09:14.806441+00:00',
*       name: '#8517 @ brace-test-dataset',
*       dataset_id: '9a3b36f7-b308-40a5-9b46-6613853b6330',
*       source_run_id: null,
*       metadata: [Object],
*       inputs: [Object],
*       outputs: [Object]
*     }
*   }
* ]
* ```
* </details>
*/ var LangSmithLoader = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$document_loaders$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseDocumentLoader"] {
    datasetId;
    datasetName;
    exampleIds;
    asOf;
    splits;
    inlineS3Urls;
    offset;
    limit;
    metadata;
    filter;
    contentKey;
    formatContent;
    client;
    constructor(fields){
        super();
        if (fields.client && fields.clientConfig) throw new Error("client and clientConfig cannot both be provided.");
        this.client = fields.client ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$10$2e$11_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy$2b$sign_d7e60d7fd9a1e9d1ad01a27fa0342fe2$2f$node_modules$2f$langsmith$2f$lib$2f$client$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Client"](fields?.clientConfig);
        this.contentKey = fields.contentKey ? fields.contentKey.split(".") : [];
        this.formatContent = fields.formatContent ?? _stringify;
        this.datasetId = fields.datasetId;
        this.datasetName = fields.datasetName;
        this.exampleIds = fields.exampleIds;
        this.asOf = fields.asOf;
        this.splits = fields.splits;
        this.inlineS3Urls = fields.inlineS3Urls;
        this.offset = fields.offset;
        this.limit = fields.limit;
        this.metadata = fields.metadata;
        this.filter = fields.filter;
    }
    async load() {
        const documents = [];
        for await (const example of this.client.listExamples({
            datasetId: this.datasetId,
            datasetName: this.datasetName,
            exampleIds: this.exampleIds,
            asOf: this.asOf,
            splits: this.splits,
            inlineS3Urls: this.inlineS3Urls,
            offset: this.offset,
            limit: this.limit,
            metadata: this.metadata,
            filter: this.filter
        })){
            let content = example.inputs;
            for (const key of this.contentKey)content = content[key];
            const contentStr = this.formatContent(content);
            const metadata = example;
            [
                "created_at",
                "modified_at"
            ].forEach((k)=>{
                if (k in metadata) {
                    if (typeof metadata[k] === "object") metadata[k] = metadata[k].toString();
                }
            });
            documents.push({
                pageContent: contentStr,
                metadata
            });
        }
        return documents;
    }
};
function _stringify(x) {
    if (typeof x === "string") return x;
    else try {
        return JSON.stringify(x, null, 2);
    } catch  {
        return String(x);
    }
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/embeddings.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Embeddings",
    ()=>Embeddings,
    "embeddings_exports",
    ()=>embeddings_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/async_caller.js [app-rsc] (ecmascript)");
;
;
//#region src/embeddings.ts
var embeddings_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    Embeddings: ()=>Embeddings
});
/**
* An abstract class that provides methods for embedding documents and
* queries using LangChain.
*/ var Embeddings = class {
    /**
	* The async caller should be used by subclasses to make any async calls,
	* which will thus benefit from the concurrency and retry logic.
	*/ caller;
    constructor(params){
        this.caller = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncCaller"](params ?? {});
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseExampleSelector",
    ()=>BaseExampleSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
;
//#region src/example_selectors/base.ts
/**
* Base class for example selectors.
*/ var BaseExampleSelector = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
    lc_namespace = [
        "langchain_core",
        "example_selectors",
        "base"
    ];
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/conditional.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BasePromptSelector",
    ()=>BasePromptSelector,
    "ConditionalPromptSelector",
    ()=>ConditionalPromptSelector,
    "isChatModel",
    ()=>isChatModel,
    "isLLM",
    ()=>isLLM
]);
//#region src/example_selectors/conditional.ts
/**
* Abstract class that defines the interface for selecting a prompt for a
* given language model.
*/ var BasePromptSelector = class {
    /**
	* Asynchronous version of `getPrompt` that also accepts an options object
	* for partial variables.
	* @param llm The language model for which to get a prompt.
	* @param options Optional object for partial variables.
	* @returns A Promise that resolves to a prompt template.
	*/ async getPromptAsync(llm, options) {
        return this.getPrompt(llm).partial(options?.partialVariables ?? {});
    }
};
/**
* Concrete implementation of `BasePromptSelector` that selects a prompt
* based on a set of conditions. It has a default prompt that it returns
* if none of the conditions are met.
*/ var ConditionalPromptSelector = class extends BasePromptSelector {
    defaultPrompt;
    conditionals;
    constructor(default_prompt, conditionals = []){
        super();
        this.defaultPrompt = default_prompt;
        this.conditionals = conditionals;
    }
    /**
	* Method that selects a prompt based on a set of conditions. If none of
	* the conditions are met, it returns the default prompt.
	* @param llm The language model for which to get a prompt.
	* @returns A prompt template.
	*/ getPrompt(llm) {
        for (const [condition, prompt] of this.conditionals)if (condition(llm)) return prompt;
        return this.defaultPrompt;
    }
};
/**
* Type guard function that checks if a given language model is of type
* `BaseLLM`.
*/ function isLLM(llm) {
    return llm._modelType() === "base_llm";
}
/**
* Type guard function that checks if a given language model is of type
* `BaseChatModel`.
*/ function isChatModel(llm) {
    return llm._modelType() === "base_chat_model";
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/length_based.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LengthBasedExampleSelector",
    ()=>LengthBasedExampleSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/base.js [app-rsc] (ecmascript)");
;
//#region src/example_selectors/length_based.ts
/**
* Calculates the length of a text based on the number of words and lines.
*/ function getLengthBased(text) {
    return text.split(/\n| /).length;
}
/**
* A specialized example selector that selects examples based on their
* length, ensuring that the total length of the selected examples does
* not exceed a specified maximum length.
* @example
* ```typescript
* const exampleSelector = new LengthBasedExampleSelector(
*   [
*     { input: "happy", output: "sad" },
*     { input: "tall", output: "short" },
*     { input: "energetic", output: "lethargic" },
*     { input: "sunny", output: "gloomy" },
*     { input: "windy", output: "calm" },
*   ],
*   {
*     examplePrompt: new PromptTemplate({
*       inputVariables: ["input", "output"],
*       template: "Input: {input}\nOutput: {output}",
*     }),
*     maxLength: 25,
*   },
* );
* const dynamicPrompt = new FewShotPromptTemplate({
*   exampleSelector,
*   examplePrompt: new PromptTemplate({
*     inputVariables: ["input", "output"],
*     template: "Input: {input}\nOutput: {output}",
*   }),
*   prefix: "Give the antonym of every input",
*   suffix: "Input: {adjective}\nOutput:",
*   inputVariables: ["adjective"],
* });
* console.log(dynamicPrompt.format({ adjective: "big" }));
* console.log(
*   dynamicPrompt.format({
*     adjective:
*       "big and huge and massive and large and gigantic and tall and much much much much much bigger than everything else",
*   }),
* );
* ```
*/ var LengthBasedExampleSelector = class LengthBasedExampleSelector extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseExampleSelector"] {
    examples = [];
    examplePrompt;
    getTextLength = getLengthBased;
    maxLength = 2048;
    exampleTextLengths = [];
    constructor(data){
        super(data);
        this.examplePrompt = data.examplePrompt;
        this.maxLength = data.maxLength ?? 2048;
        this.getTextLength = data.getTextLength ?? getLengthBased;
    }
    /**
	* Adds an example to the list of examples and calculates its length.
	* @param example The example to be added.
	* @returns Promise that resolves when the example has been added and its length calculated.
	*/ async addExample(example) {
        this.examples.push(example);
        const stringExample = await this.examplePrompt.format(example);
        this.exampleTextLengths.push(this.getTextLength(stringExample));
    }
    /**
	* Calculates the lengths of the examples.
	* @param v Array of lengths of the examples.
	* @param values Instance of LengthBasedExampleSelector.
	* @returns Promise that resolves with an array of lengths of the examples.
	*/ async calculateExampleTextLengths(v, values) {
        if (v.length > 0) return v;
        const { examples, examplePrompt } = values;
        return (await Promise.all(examples.map((eg)=>examplePrompt.format(eg)))).map((eg)=>this.getTextLength(eg));
    }
    /**
	* Selects examples until the total length of the selected examples
	* reaches the maxLength.
	* @param inputVariables The input variables for the examples.
	* @returns Promise that resolves with an array of selected examples.
	*/ async selectExamples(inputVariables) {
        const inputs = Object.values(inputVariables).join(" ");
        let remainingLength = this.maxLength - this.getTextLength(inputs);
        let i = 0;
        const examples = [];
        while(remainingLength > 0 && i < this.examples.length){
            const newLength = remainingLength - this.exampleTextLengths[i];
            if (newLength < 0) break;
            else {
                examples.push(this.examples[i]);
                remainingLength = newLength;
            }
            i += 1;
        }
        return examples;
    }
    /**
	* Creates a new instance of LengthBasedExampleSelector and adds a list of
	* examples to it.
	* @param examples Array of examples to be added.
	* @param args Input parameters for the LengthBasedExampleSelector.
	* @returns Promise that resolves with a new instance of LengthBasedExampleSelector with the examples added.
	*/ static async fromExamples(examples, args) {
        const selector = new LengthBasedExampleSelector(args);
        await Promise.all(examples.map((eg)=>selector.addExample(eg)));
        return selector;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/semantic_similarity.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SemanticSimilarityExampleSelector",
    ()=>SemanticSimilarityExampleSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/document.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/base.js [app-rsc] (ecmascript)");
;
;
//#region src/example_selectors/semantic_similarity.ts
function sortedValues(values) {
    return Object.keys(values).sort().map((key)=>values[key]);
}
/**
* Class that selects examples based on semantic similarity. It extends
* the BaseExampleSelector class.
* @example
* ```typescript
* const exampleSelector = await SemanticSimilarityExampleSelector.fromExamples(
*   [
*     { input: "happy", output: "sad" },
*     { input: "tall", output: "short" },
*     { input: "energetic", output: "lethargic" },
*     { input: "sunny", output: "gloomy" },
*     { input: "windy", output: "calm" },
*   ],
*   new OpenAIEmbeddings(),
*   HNSWLib,
*   { k: 1 },
* );
* const dynamicPrompt = new FewShotPromptTemplate({
*   exampleSelector,
*   examplePrompt: PromptTemplate.fromTemplate(
*     "Input: {input}\nOutput: {output}",
*   ),
*   prefix: "Give the antonym of every input",
*   suffix: "Input: {adjective}\nOutput:",
*   inputVariables: ["adjective"],
* });
* console.log(await dynamicPrompt.format({ adjective: "rainy" }));
* ```
*/ var SemanticSimilarityExampleSelector = class SemanticSimilarityExampleSelector extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseExampleSelector"] {
    vectorStoreRetriever;
    exampleKeys;
    inputKeys;
    constructor(data){
        super(data);
        this.exampleKeys = data.exampleKeys;
        this.inputKeys = data.inputKeys;
        if (data.vectorStore !== void 0) this.vectorStoreRetriever = data.vectorStore.asRetriever({
            k: data.k ?? 4,
            filter: data.filter
        });
        else if (data.vectorStoreRetriever) this.vectorStoreRetriever = data.vectorStoreRetriever;
        else throw new Error(`You must specify one of "vectorStore" and "vectorStoreRetriever".`);
    }
    /**
	* Method that adds a new example to the vectorStore. The example is
	* converted to a string and added to the vectorStore as a document.
	* @param example The example to be added to the vectorStore.
	* @returns Promise that resolves when the example has been added to the vectorStore.
	*/ async addExample(example) {
        const stringExample = sortedValues((this.inputKeys ?? Object.keys(example)).reduce((acc, key)=>({
                ...acc,
                [key]: example[key]
            }), {})).join(" ");
        await this.vectorStoreRetriever.addDocuments([
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"]({
                pageContent: stringExample,
                metadata: example
            })
        ]);
    }
    /**
	* Method that selects which examples to use based on semantic similarity.
	* It performs a similarity search in the vectorStore using the input
	* variables and returns the examples with the highest similarity.
	* @param inputVariables The input variables used for the similarity search.
	* @returns Promise that resolves with an array of the selected examples.
	*/ async selectExamples(inputVariables) {
        const query = sortedValues((this.inputKeys ?? Object.keys(inputVariables)).reduce((acc, key)=>({
                ...acc,
                [key]: inputVariables[key]
            }), {})).join(" ");
        const examples = (await this.vectorStoreRetriever.invoke(query)).map((doc)=>doc.metadata);
        if (this.exampleKeys) return examples.map((example)=>this.exampleKeys.reduce((acc, key)=>({
                    ...acc,
                    [key]: example[key]
                }), {}));
        return examples;
    }
    /**
	* Static method that creates a new instance of
	* SemanticSimilarityExampleSelector. It takes a list of examples, an
	* instance of Embeddings, a VectorStore class, and an options object as
	* parameters. It converts the examples to strings, creates a VectorStore
	* from the strings and the embeddings, and returns a new
	* SemanticSimilarityExampleSelector with the created VectorStore and the
	* options provided.
	* @param examples The list of examples to be used.
	* @param embeddings The instance of Embeddings to be used.
	* @param vectorStoreCls The VectorStore class to be used.
	* @param options The options object for the SemanticSimilarityExampleSelector.
	* @returns Promise that resolves with a new instance of SemanticSimilarityExampleSelector.
	*/ static async fromExamples(examples, embeddings, vectorStoreCls, options = {}) {
        const inputKeys = options.inputKeys ?? null;
        const stringExamples = examples.map((example)=>sortedValues(inputKeys ? inputKeys.reduce((acc, key)=>({
                    ...acc,
                    [key]: example[key]
                }), {}) : example).join(" "));
        const vectorStore = await vectorStoreCls.fromTexts(stringExamples, examples, embeddings, options);
        return new SemanticSimilarityExampleSelector({
            vectorStore,
            k: options.k ?? 4,
            exampleKeys: options.exampleKeys,
            inputKeys: options.inputKeys
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "example_selectors_exports",
    ()=>example_selectors_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$conditional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/conditional.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$length_based$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/length_based.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$semantic_similarity$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/example_selectors/semantic_similarity.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/example_selectors/index.ts
var example_selectors_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseExampleSelector: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseExampleSelector"],
    BasePromptSelector: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$conditional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BasePromptSelector"],
    ConditionalPromptSelector: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$conditional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConditionalPromptSelector"],
    LengthBasedExampleSelector: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$length_based$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LengthBasedExampleSelector"],
    SemanticSimilarityExampleSelector: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$semantic_similarity$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SemanticSimilarityExampleSelector"],
    isChatModel: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$conditional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isChatModel"],
    isLLM: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$example_selectors$2f$conditional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isLLM"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/indexing/record_manager.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecordManager",
    ()=>RecordManager,
    "UUIDV5_NAMESPACE",
    ()=>UUIDV5_NAMESPACE
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
;
//#region src/indexing/record_manager.ts
const UUIDV5_NAMESPACE = "10f90ea3-90a4-4962-bf75-83a0f3c1c62a";
var RecordManager = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
    lc_namespace = [
        "langchain",
        "recordmanagers"
    ];
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/indexing/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_HashedDocument",
    ()=>_HashedDocument,
    "_batch",
    ()=>_batch,
    "_deduplicateInOrder",
    ()=>_deduplicateInOrder,
    "_getSourceIdAssigner",
    ()=>_getSourceIdAssigner,
    "_isBaseDocumentLoader",
    ()=>_isBaseDocumentLoader,
    "index",
    ()=>index
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/js-sha256/hash.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/hash.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/document.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$record_manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/indexing/record_manager.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/indexing/base.ts
/**
* HashedDocument is a Document with hashes calculated.
* Hashes are calculated based on page content and metadata.
* It is used for indexing.
*/ var _HashedDocument = class {
    uid;
    hash_;
    contentHash;
    metadataHash;
    pageContent;
    metadata;
    keyEncoder = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sha256"];
    constructor(fields){
        this.uid = fields.uid;
        this.pageContent = fields.pageContent;
        this.metadata = fields.metadata;
    }
    makeDefaultKeyEncoder(keyEncoderFn) {
        this.keyEncoder = keyEncoderFn;
    }
    calculateHashes() {
        const forbiddenKeys = [
            "hash_",
            "content_hash",
            "metadata_hash"
        ];
        for (const key of forbiddenKeys)if (key in this.metadata) throw new Error(`Metadata cannot contain key ${key} as it is reserved for internal use. Restricted keys: [${forbiddenKeys.join(", ")}]`);
        const contentHash = this._hashStringToUUID(this.pageContent);
        try {
            const metadataHash = this._hashNestedDictToUUID(this.metadata);
            this.contentHash = contentHash;
            this.metadataHash = metadataHash;
        } catch (e) {
            throw new Error(`Failed to hash metadata: ${e}. Please use a dict that can be serialized using json.`);
        }
        this.hash_ = this._hashStringToUUID(this.contentHash + this.metadataHash);
        if (!this.uid) this.uid = this.hash_;
    }
    toDocument() {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"]({
            pageContent: this.pageContent,
            metadata: this.metadata
        });
    }
    static fromDocument(document, uid) {
        const doc = new this({
            pageContent: document.pageContent,
            metadata: document.metadata,
            uid: uid || document.uid
        });
        doc.calculateHashes();
        return doc;
    }
    _hashStringToUUID(inputString) {
        const hash_value = this.keyEncoder(inputString);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v5"])(hash_value, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$record_manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UUIDV5_NAMESPACE"]);
    }
    _hashNestedDictToUUID(data) {
        const serialized_data = JSON.stringify(data, Object.keys(data).sort());
        const hash_value = this.keyEncoder(serialized_data);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v5"])(hash_value, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$record_manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UUIDV5_NAMESPACE"]);
    }
};
function _batch(size, iterable) {
    const batches = [];
    let currentBatch = [];
    iterable.forEach((item)=>{
        currentBatch.push(item);
        if (currentBatch.length >= size) {
            batches.push(currentBatch);
            currentBatch = [];
        }
    });
    if (currentBatch.length > 0) batches.push(currentBatch);
    return batches;
}
function _deduplicateInOrder(hashedDocuments) {
    const seen = /* @__PURE__ */ new Set();
    const deduplicated = [];
    for (const hashedDoc of hashedDocuments){
        if (!hashedDoc.hash_) throw new Error("Hashed document does not have a hash");
        if (!seen.has(hashedDoc.hash_)) {
            seen.add(hashedDoc.hash_);
            deduplicated.push(hashedDoc);
        }
    }
    return deduplicated;
}
function _getSourceIdAssigner(sourceIdKey) {
    if (sourceIdKey === null) return (_doc)=>null;
    else if (typeof sourceIdKey === "string") return (doc)=>doc.metadata[sourceIdKey];
    else if (typeof sourceIdKey === "function") return sourceIdKey;
    else throw new Error(`sourceIdKey should be null, a string or a function, got ${typeof sourceIdKey}`);
}
const _isBaseDocumentLoader = (arg)=>{
    if ("load" in arg && typeof arg.load === "function" && "loadAndSplit" in arg && typeof arg.loadAndSplit === "function") return true;
    return false;
};
/**
* Index data from the doc source into the vector store.
*
* Indexing functionality uses a manager to keep track of which documents
* are in the vector store.
*
* This allows us to keep track of which documents were updated, and which
* documents were deleted, which documents should be skipped.
*
* For the time being, documents are indexed using their hashes, and users
*  are not able to specify the uid of the document.
*
* @param {IndexArgs} args
* @param {BaseDocumentLoader | DocumentInterface[]} args.docsSource The source of documents to index. Can be a DocumentLoader or a list of Documents.
* @param {RecordManagerInterface} args.recordManager The record manager to use for keeping track of indexed documents.
* @param {VectorStore} args.vectorStore The vector store to use for storing the documents.
* @param {IndexOptions | undefined} args.options Options for indexing.
* @returns {Promise<IndexingResult>}
*/ async function index(args) {
    const { docsSource, recordManager, vectorStore, options } = args;
    const { batchSize = 100, cleanup, sourceIdKey, cleanupBatchSize = 1e3, forceUpdate = false } = options ?? {};
    if (cleanup === "incremental" && !sourceIdKey) throw new Error("sourceIdKey is required when cleanup mode is incremental. Please provide through 'options.sourceIdKey'.");
    const docs = _isBaseDocumentLoader(docsSource) ? await docsSource.load() : docsSource;
    const sourceIdAssigner = _getSourceIdAssigner(sourceIdKey ?? null);
    const indexStartDt = await recordManager.getTime();
    let numAdded = 0;
    let numDeleted = 0;
    let numUpdated = 0;
    let numSkipped = 0;
    const batches = _batch(batchSize ?? 100, docs);
    for (const batch of batches){
        const hashedDocs = _deduplicateInOrder(batch.map((doc)=>_HashedDocument.fromDocument(doc)));
        const sourceIds = hashedDocs.map((doc)=>sourceIdAssigner(doc));
        if (cleanup === "incremental") hashedDocs.forEach((_hashedDoc, index)=>{
            if (sourceIds[index] === null) throw new Error("sourceIdKey must be provided when cleanup is incremental");
        });
        const batchExists = await recordManager.exists(hashedDocs.map((doc)=>doc.uid));
        const uids = [];
        const docsToIndex = [];
        const docsToUpdate = [];
        const seenDocs = /* @__PURE__ */ new Set();
        hashedDocs.forEach((hashedDoc, i)=>{
            if (batchExists[i]) {
                if (forceUpdate) seenDocs.add(hashedDoc.uid);
                else {
                    docsToUpdate.push(hashedDoc.uid);
                    return;
                }
            }
            uids.push(hashedDoc.uid);
            docsToIndex.push(hashedDoc.toDocument());
        });
        if (docsToUpdate.length > 0) {
            await recordManager.update(docsToUpdate, {
                timeAtLeast: indexStartDt
            });
            numSkipped += docsToUpdate.length;
        }
        if (docsToIndex.length > 0) {
            await vectorStore.addDocuments(docsToIndex, {
                ids: uids
            });
            numAdded += docsToIndex.length - seenDocs.size;
            numUpdated += seenDocs.size;
        }
        await recordManager.update(hashedDocs.map((doc)=>doc.uid), {
            timeAtLeast: indexStartDt,
            groupIds: sourceIds
        });
        if (cleanup === "incremental") {
            sourceIds.forEach((sourceId)=>{
                if (!sourceId) throw new Error("Source id cannot be null");
            });
            const uidsToDelete = await recordManager.listKeys({
                before: indexStartDt,
                groupIds: sourceIds
            });
            if (uidsToDelete.length > 0) {
                await vectorStore.delete({
                    ids: uidsToDelete
                });
                await recordManager.deleteKeys(uidsToDelete);
                numDeleted += uidsToDelete.length;
            }
        }
    }
    if (cleanup === "full") {
        let uidsToDelete = await recordManager.listKeys({
            before: indexStartDt,
            limit: cleanupBatchSize
        });
        while(uidsToDelete.length > 0){
            await vectorStore.delete({
                ids: uidsToDelete
            });
            await recordManager.deleteKeys(uidsToDelete);
            numDeleted += uidsToDelete.length;
            uidsToDelete = await recordManager.listKeys({
                before: indexStartDt,
                limit: cleanupBatchSize
            });
        }
    }
    return {
        numAdded,
        numDeleted,
        numUpdated,
        numSkipped
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/indexing/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "indexing_exports",
    ()=>indexing_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$record_manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/indexing/record_manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/indexing/base.js [app-rsc] (ecmascript)");
;
;
;
//#region src/indexing/index.ts
var indexing_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    RecordManager: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$record_manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RecordManager"],
    UUIDV5_NAMESPACE: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$record_manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UUIDV5_NAMESPACE"],
    _HashedDocument: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_HashedDocument"],
    _batch: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_batch"],
    _deduplicateInOrder: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deduplicateInOrder"],
    _getSourceIdAssigner: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_getSourceIdAssigner"],
    _isBaseDocumentLoader: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_isBaseDocumentLoader"],
    index: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$indexing$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["index"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompt_values.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BasePromptValue",
    ()=>BasePromptValue,
    "ChatPromptValue",
    ()=>ChatPromptValue,
    "ImagePromptValue",
    ()=>ImagePromptValue,
    "StringPromptValue",
    ()=>StringPromptValue,
    "prompt_values_exports",
    ()=>prompt_values_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/prompt_values.ts
var prompt_values_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BasePromptValue: ()=>BasePromptValue,
    ChatPromptValue: ()=>ChatPromptValue,
    ImagePromptValue: ()=>ImagePromptValue,
    StringPromptValue: ()=>StringPromptValue
});
/**
* Base PromptValue class. All prompt values should extend this class.
*/ var BasePromptValue = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
};
/**
* Represents a prompt value as a string. It extends the BasePromptValue
* class and overrides the toString and toChatMessages methods.
*/ var StringPromptValue = class extends BasePromptValue {
    static lc_name() {
        return "StringPromptValue";
    }
    lc_namespace = [
        "langchain_core",
        "prompt_values"
    ];
    lc_serializable = true;
    value;
    constructor(value){
        super({
            value
        });
        this.value = value;
    }
    toString() {
        return this.value;
    }
    toChatMessages() {
        return [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"](this.value)
        ];
    }
};
/**
* Class that represents a chat prompt value. It extends the
* BasePromptValue and includes an array of BaseMessage instances.
*/ var ChatPromptValue = class extends BasePromptValue {
    lc_namespace = [
        "langchain_core",
        "prompt_values"
    ];
    lc_serializable = true;
    static lc_name() {
        return "ChatPromptValue";
    }
    messages;
    constructor(fields){
        if (Array.isArray(fields)) fields = {
            messages: fields
        };
        super(fields);
        this.messages = fields.messages;
    }
    toString() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBufferString"])(this.messages);
    }
    toChatMessages() {
        return this.messages;
    }
};
/**
* Class that represents an image prompt value. It extends the
* BasePromptValue and includes an ImageURL instance.
*/ var ImagePromptValue = class extends BasePromptValue {
    lc_namespace = [
        "langchain_core",
        "prompt_values"
    ];
    lc_serializable = true;
    static lc_name() {
        return "ImagePromptValue";
    }
    imageUrl;
    /** @ignore */ value;
    constructor(fields){
        if (!("imageUrl" in fields)) fields = {
            imageUrl: fields
        };
        super(fields);
        this.imageUrl = fields.imageUrl;
    }
    toString() {
        return this.imageUrl.url;
    }
    toChatMessages() {
        return [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"]({
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            detail: this.imageUrl.detail,
                            url: this.imageUrl.url
                        }
                    }
                ]
            })
        ];
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseLLMOutputParser",
    ()=>BaseLLMOutputParser,
    "BaseOutputParser",
    ()=>BaseOutputParser,
    "OutputParserException",
    ()=>OutputParserException
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/index.js [app-rsc] (ecmascript) <locals>");
;
;
;
//#region src/output_parsers/base.ts
/**
* Abstract base class for parsing the output of a Large Language Model
* (LLM) call. It provides methods for parsing the result of an LLM call
* and invoking the parser with a given input.
*/ var BaseLLMOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    /**
	* Parses the result of an LLM call with a given prompt. By default, it
	* simply calls `parseResult`.
	* @param generations The generations from an LLM call.
	* @param _prompt The prompt used in the LLM call.
	* @param callbacks Optional callbacks.
	* @returns A promise of the parsed output.
	*/ parseResultWithPrompt(generations, _prompt, callbacks) {
        return this.parseResult(generations, callbacks);
    }
    _baseMessageToString(message) {
        return typeof message.content === "string" ? message.content : this._baseMessageContentToString(message.content);
    }
    _baseMessageContentToString(content) {
        return JSON.stringify(content);
    }
    /**
	* Calls the parser with a given input and optional configuration options.
	* If the input is a string, it creates a generation with the input as
	* text and calls `parseResult`. If the input is a `BaseMessage`, it
	* creates a generation with the input as a message and the content of the
	* input as text, and then calls `parseResult`.
	* @param input The input to the parser, which can be a string or a `BaseMessage`.
	* @param options Optional configuration options.
	* @returns A promise of the parsed output.
	*/ async invoke(input, options) {
        if (typeof input === "string") return this._callWithConfig(async (input, options)=>this.parseResult([
                {
                    text: input
                }
            ], options?.callbacks), input, {
            ...options,
            runType: "parser"
        });
        else return this._callWithConfig(async (input, options)=>this.parseResult([
                {
                    message: input,
                    text: this._baseMessageToString(input)
                }
            ], options?.callbacks), input, {
            ...options,
            runType: "parser"
        });
    }
};
/**
* Class to parse the output of an LLM call.
*/ var BaseOutputParser = class extends BaseLLMOutputParser {
    parseResult(generations, callbacks) {
        return this.parse(generations[0].text, callbacks);
    }
    async parseWithPrompt(text, _prompt, callbacks) {
        return this.parse(text, callbacks);
    }
    /**
	* Return the string type key uniquely identifying this class of parser
	*/ _type() {
        throw new Error("_type not implemented");
    }
};
/**
* Exception that output parsers should raise to signify a parsing error.
*
* This exists to differentiate parsing errors from other code or execution errors
* that also may arise inside the output parser. OutputParserExceptions will be
* available to catch and handle in ways to fix the parsing error, while other
* errors will be raised.
*
* @param message - The error that's being re-raised or an error message.
* @param llmOutput - String model output which is error-ing.
* @param observation - String explanation of error which can be passed to a
*     model to try and remediate the issue.
* @param sendToLLM - Whether to send the observation and llm_output back to an Agent
*     after an OutputParserException has been raised. This gives the underlying
*     model driving the agent the context that the previous output was improperly
*     structured, in the hopes that it will update the output to the correct
*     format.
*/ var OutputParserException = class extends Error {
    llmOutput;
    observation;
    sendToLLM;
    constructor(message, llmOutput, observation, sendToLLM = false){
        super(message);
        this.llmOutput = llmOutput;
        this.observation = observation;
        this.sendToLLM = sendToLLM;
        if (sendToLLM) {
            if (observation === void 0 || llmOutput === void 0) throw new Error("Arguments 'observation' & 'llmOutput' are required if 'sendToLlm' is true");
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addLangChainErrorFields"])(this, "OUTPUT_PARSING_FAILURE");
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCumulativeTransformOutputParser",
    ()=>BaseCumulativeTransformOutputParser,
    "BaseTransformOutputParser",
    ()=>BaseTransformOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/output_parsers/transform.ts
/**
* Class to parse the output of an LLM call that also allows streaming inputs.
*/ var BaseTransformOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    async *_transform(inputGenerator) {
        for await (const chunk of inputGenerator)if (typeof chunk === "string") yield this.parseResult([
            {
                text: chunk
            }
        ]);
        else yield this.parseResult([
            {
                message: chunk,
                text: this._baseMessageToString(chunk)
            }
        ]);
    }
    /**
	* Transforms an asynchronous generator of input into an asynchronous
	* generator of parsed output.
	* @param inputGenerator An asynchronous generator of input.
	* @param options A configuration object.
	* @returns An asynchronous generator of parsed output.
	*/ async *transform(inputGenerator, options) {
        yield* this._transformStreamWithConfig(inputGenerator, this._transform.bind(this), {
            ...options,
            runType: "parser"
        });
    }
};
/**
* A base class for output parsers that can handle streaming input. It
* extends the `BaseTransformOutputParser` class and provides a method for
* converting parsed outputs into a diff format.
*/ var BaseCumulativeTransformOutputParser = class extends BaseTransformOutputParser {
    diff = false;
    constructor(fields){
        super(fields);
        this.diff = fields?.diff ?? this.diff;
    }
    async *_transform(inputGenerator) {
        let prevParsed;
        let accGen;
        for await (const chunk of inputGenerator){
            if (typeof chunk !== "string" && typeof chunk.content !== "string") throw new Error("Cannot handle non-string output.");
            let chunkGen;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseMessageChunk"])(chunk)) {
                if (typeof chunk.content !== "string") throw new Error("Cannot handle non-string message output.");
                chunkGen = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatGenerationChunk"]({
                    message: chunk,
                    text: chunk.content
                });
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseMessage"])(chunk)) {
                if (typeof chunk.content !== "string") throw new Error("Cannot handle non-string message output.");
                chunkGen = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatGenerationChunk"]({
                    message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertToChunk"])(chunk),
                    text: chunk.content
                });
            } else chunkGen = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: chunk
            });
            if (accGen === void 0) accGen = chunkGen;
            else accGen = accGen.concat(chunkGen);
            const parsed = await this.parsePartialResult([
                accGen
            ]);
            if (parsed !== void 0 && parsed !== null && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deepCompareStrict"])(parsed, prevParsed)) {
                if (this.diff) yield this._diff(prevParsed, parsed);
                else yield parsed;
                prevParsed = parsed;
            }
        }
    }
    getFormatInstructions() {
        return "";
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/bytes.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BytesOutputParser",
    ()=>BytesOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
;
//#region src/output_parsers/bytes.ts
/**
* OutputParser that parses LLMResult into the top likely string and
* encodes it into bytes.
*/ var BytesOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"] {
    static lc_name() {
        return "BytesOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "bytes"
    ];
    lc_serializable = true;
    textEncoder = new TextEncoder();
    parse(text) {
        return Promise.resolve(this.textEncoder.encode(text));
    }
    getFormatInstructions() {
        return "";
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/list.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommaSeparatedListOutputParser",
    ()=>CommaSeparatedListOutputParser,
    "CustomListOutputParser",
    ()=>CustomListOutputParser,
    "ListOutputParser",
    ()=>ListOutputParser,
    "MarkdownListOutputParser",
    ()=>MarkdownListOutputParser,
    "NumberedListOutputParser",
    ()=>NumberedListOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
;
;
//#region src/output_parsers/list.ts
/**
* Class to parse the output of an LLM call to a list.
* @augments BaseOutputParser
*/ var ListOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"] {
    re;
    async *_transform(inputGenerator) {
        let buffer = "";
        for await (const input of inputGenerator){
            if (typeof input === "string") buffer += input;
            else buffer += input.content;
            if (!this.re) {
                const parts = await this.parse(buffer);
                if (parts.length > 1) {
                    for (const part of parts.slice(0, -1))yield [
                        part
                    ];
                    buffer = parts[parts.length - 1];
                }
            } else {
                const matches = [
                    ...buffer.matchAll(this.re)
                ];
                if (matches.length > 1) {
                    let doneIdx = 0;
                    for (const match of matches.slice(0, -1)){
                        yield [
                            match[1]
                        ];
                        doneIdx += (match.index ?? 0) + match[0].length;
                    }
                    buffer = buffer.slice(doneIdx);
                }
            }
        }
        for (const part of (await this.parse(buffer)))yield [
            part
        ];
    }
};
/**
* Class to parse the output of an LLM call as a comma-separated list.
* @augments ListOutputParser
*/ var CommaSeparatedListOutputParser = class extends ListOutputParser {
    static lc_name() {
        return "CommaSeparatedListOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    lc_serializable = true;
    /**
	* Parses the given text into an array of strings, using a comma as the
	* separator. If the parsing fails, throws an OutputParserException.
	* @param text The text to parse.
	* @returns An array of strings obtained by splitting the input text at each comma.
	*/ async parse(text) {
        try {
            return text.trim().split(",").map((s)=>s.trim());
        } catch  {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Could not parse output: ${text}`, text);
        }
    }
    /**
	* Provides instructions on the expected format of the response for the
	* CommaSeparatedListOutputParser.
	* @returns A string containing instructions on the expected format of the response.
	*/ getFormatInstructions() {
        return `Your response should be a list of comma separated values, eg: \`foo, bar, baz\``;
    }
};
/**
* Class to parse the output of an LLM call to a list with a specific length and separator.
* @augments ListOutputParser
*/ var CustomListOutputParser = class extends ListOutputParser {
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    length;
    separator;
    constructor({ length, separator }){
        super(...arguments);
        this.length = length;
        this.separator = separator || ",";
    }
    /**
	* Parses the given text into an array of strings, using the specified
	* separator. If the parsing fails or the number of items in the list
	* doesn't match the expected length, throws an OutputParserException.
	* @param text The text to parse.
	* @returns An array of strings obtained by splitting the input text at each occurrence of the specified separator.
	*/ async parse(text) {
        try {
            const items = text.trim().split(this.separator).map((s)=>s.trim());
            if (this.length !== void 0 && items.length !== this.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Incorrect number of items. Expected ${this.length}, got ${items.length}.`);
            return items;
        } catch (e) {
            if (Object.getPrototypeOf(e) === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"].prototype) throw e;
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Could not parse output: ${text}`);
        }
    }
    /**
	* Provides instructions on the expected format of the response for the
	* CustomListOutputParser, including the number of items and the
	* separator.
	* @returns A string containing instructions on the expected format of the response.
	*/ getFormatInstructions() {
        return `Your response should be a list of ${this.length === void 0 ? "" : `${this.length} `}items separated by "${this.separator}" (eg: \`foo${this.separator} bar${this.separator} baz\`)`;
    }
};
var NumberedListOutputParser = class extends ListOutputParser {
    static lc_name() {
        return "NumberedListOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    lc_serializable = true;
    getFormatInstructions() {
        return `Your response should be a numbered list with each item on a new line. For example: \n\n1. foo\n\n2. bar\n\n3. baz`;
    }
    re = /\d+\.\s([^\n]+)/g;
    async parse(text) {
        return [
            ...text.matchAll(this.re) ?? []
        ].map((m)=>m[1]);
    }
};
var MarkdownListOutputParser = class extends ListOutputParser {
    static lc_name() {
        return "NumberedListOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    lc_serializable = true;
    getFormatInstructions() {
        return `Your response should be a numbered list with each item on a new line. For example: \n\n1. foo\n\n2. bar\n\n3. baz`;
    }
    re = /^\s*[-*]\s([^\n]+)$/gm;
    async parse(text) {
        return [
            ...text.matchAll(this.re) ?? []
        ].map((m)=>m[1]);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/string.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StringOutputParser",
    ()=>StringOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
;
//#region src/output_parsers/string.ts
/**
* OutputParser that parses LLMResult into the top likely string.
* @example
* ```typescript
* const promptTemplate = PromptTemplate.fromTemplate(
*   "Tell me a joke about {topic}",
* );
*
* const chain = RunnableSequence.from([
*   promptTemplate,
*   new ChatOpenAI({ model: "gpt-4o-mini" }),
*   new StringOutputParser(),
* ]);
*
* const result = await chain.invoke({ topic: "bears" });
* console.log("What do you call a bear with no teeth? A gummy bear!");
* ```
*/ var StringOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"] {
    static lc_name() {
        return "StrOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "string"
    ];
    lc_serializable = true;
    /**
	* Parses a string output from an LLM call. This method is meant to be
	* implemented by subclasses to define how a string output from an LLM
	* should be parsed.
	* @param text The string output from an LLM call.
	* @param callbacks Optional callbacks.
	* @returns A promise of the parsed output.
	*/ parse(text) {
        return Promise.resolve(text);
    }
    getFormatInstructions() {
        return "";
    }
    _textContentToString(content) {
        return content.text;
    }
    _imageUrlContentToString(_content) {
        throw new Error(`Cannot coerce a multimodal "image_url" message part into a string.`);
    }
    _messageContentToString(content) {
        switch(content.type){
            case "text":
            case "text_delta":
                if ("text" in content) return this._textContentToString(content);
                break;
            case "image_url":
                if ("image_url" in content) return this._imageUrlContentToString(content);
                break;
            case "reasoning":
            case "thinking":
            case "redacted_thinking":
                return "";
            default:
                throw new Error(`Cannot coerce "${content.type}" message part into a string.`);
        }
        throw new Error(`Invalid content type: ${content.type}`);
    }
    _baseMessageContentToString(content) {
        return content.reduce((acc, item)=>acc + this._messageContentToString(item), "");
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonOutputParser",
    ()=>JsonOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_patch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_patch.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
//#region src/output_parsers/json.ts
/**
* Class for parsing the output of an LLM into a JSON object.
*/ var JsonOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"] {
    static lc_name() {
        return "JsonOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers"
    ];
    lc_serializable = true;
    /** @internal */ _concatOutputChunks(first, second) {
        if (this.diff) return super._concatOutputChunks(first, second);
        return second;
    }
    _diff(prev, next) {
        if (!next) return;
        if (!prev) return [
            {
                op: "replace",
                path: "",
                value: next
            }
        ];
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["compare"])(prev, next);
    }
    async parsePartialResult(generations) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseJsonMarkdown"])(generations[0].text);
    }
    async parse(text) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseJsonMarkdown"])(text, JSON.parse);
    }
    getFormatInstructions() {
        return "";
    }
    /**
	* Extracts text content from a message for JSON parsing.
	* Uses the message's `.text` accessor which properly handles both
	* string content and ContentBlock[] arrays (extracting text from text blocks).
	* @param message The message to extract text from
	* @returns The text content of the message
	*/ _baseMessageToString(message) {
        return message.text;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/standard_schema.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StandardSchemaOutputParser",
    ()=>StandardSchemaOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript) <locals>");
;
;
;
//#region src/output_parsers/standard_schema.ts
var StandardSchemaOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    static lc_name() {
        return "StandardSchemaOutputParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "standard_schema"
    ];
    schema;
    constructor(schema){
        super();
        this.schema = schema;
    }
    static fromSerializableSchema(schema) {
        return new this(schema);
    }
    async parse(text) {
        try {
            const json = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseJsonMarkdown"])(text, JSON.parse);
            const result = await this.schema["~standard"].validate(json);
            if (result.issues) throw new Error(`Validation failed: ${JSON.stringify(result.issues)}`);
            return result.value;
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${text}". Error: ${e}`, text);
        }
    }
    _baseMessageToString(message) {
        return message.text;
    }
    getFormatInstructions() {
        return "";
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/structured.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsymmetricStructuredOutputParser",
    ()=>AsymmetricStructuredOutputParser,
    "JsonMarkdownStructuredOutputParser",
    ()=>JsonMarkdownStructuredOutputParser,
    "StructuredOutputParser",
    ()=>StructuredOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v3/external.js [app-rsc] (ecmascript) <export * as z>");
;
;
;
;
//#region src/output_parsers/structured.ts
var StructuredOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    schema;
    static lc_name() {
        return "StructuredOutputParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "structured"
    ];
    toJSON() {
        return this.toJSONNotImplemented();
    }
    constructor(schema){
        super(schema);
        this.schema = schema;
    }
    /**
	* Creates a new StructuredOutputParser from a Zod schema.
	* @param schema The Zod schema which the output should match
	* @returns A new instance of StructuredOutputParser.
	*/ static fromZodSchema(schema) {
        return new this(schema);
    }
    /**
	* Creates a new StructuredOutputParser from a set of names and
	* descriptions.
	* @param schemas An object where each key is a name and each value is a description
	* @returns A new instance of StructuredOutputParser.
	*/ static fromNamesAndDescriptions(schemas) {
        const zodSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object(Object.fromEntries(Object.entries(schemas).map(([name, description])=>[
                name,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe(description)
            ])));
        return new this(zodSchema);
    }
    /**
	* Returns a markdown code snippet with a JSON object formatted according
	* to the schema.
	* @param options Optional. The options for formatting the instructions
	* @returns A markdown code snippet with a JSON object formatted according to the schema.
	*/ getFormatInstructions() {
        return `You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}
would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
\`\`\`json
${JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(this.schema))}
\`\`\`
`;
    }
    /**
	* Parses the given text according to the schema.
	* @param text The text to parse
	* @returns The parsed output.
	*/ async parse(text) {
        try {
            const trimmedText = text.trim();
            const escapedJson = (trimmedText.match(/^```(?:json)?\s*([\s\S]*?)```/)?.[1] || trimmedText.match(/```json\s*([\s\S]*?)```/)?.[1] || trimmedText).replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (_match, capturedGroup)=>{
                return `"${capturedGroup.replace(/\n/g, "\\n")}"`;
            }).replace(/\n/g, "");
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopParseAsync"])(this.schema, JSON.parse(escapedJson));
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${text}". Error: ${e}`, text);
        }
    }
    _baseMessageToString(message) {
        return message.text;
    }
};
/**
* A specific type of `StructuredOutputParser` that parses JSON data
* formatted as a markdown code snippet.
*/ var JsonMarkdownStructuredOutputParser = class extends StructuredOutputParser {
    static lc_name() {
        return "JsonMarkdownStructuredOutputParser";
    }
    getFormatInstructions(options) {
        const interpolationDepth = options?.interpolationDepth ?? 1;
        if (interpolationDepth < 1) throw new Error("f string interpolation depth must be at least 1");
        return `Return a markdown code snippet with a JSON object formatted to look like:\n\`\`\`json\n${this._schemaToInstruction((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(this.schema)).replaceAll("{", "{".repeat(interpolationDepth)).replaceAll("}", "}".repeat(interpolationDepth))}\n\`\`\``;
    }
    _schemaToInstruction(schemaInput, indent = 2) {
        const schema = schemaInput;
        if ("type" in schema) {
            let nullable = false;
            let type;
            if (Array.isArray(schema.type)) {
                const nullIdx = schema.type.findIndex((type)=>type === "null");
                if (nullIdx !== -1) {
                    nullable = true;
                    schema.type.splice(nullIdx, 1);
                }
                type = schema.type.join(" | ");
            } else type = schema.type;
            if (schema.type === "object" && schema.properties) {
                const description = schema.description ? ` // ${schema.description}` : "";
                return `{\n${Object.entries(schema.properties).map(([key, value])=>{
                    const isOptional = schema.required?.includes(key) ? "" : " (optional)";
                    return `${" ".repeat(indent)}"${key}": ${this._schemaToInstruction(value, indent + 2)}${isOptional}`;
                }).join("\n")}\n${" ".repeat(indent - 2)}}${description}`;
            }
            if (schema.type === "array" && schema.items) {
                const description = schema.description ? ` // ${schema.description}` : "";
                return `array[\n${" ".repeat(indent)}${this._schemaToInstruction(schema.items, indent + 2)}\n${" ".repeat(indent - 2)}] ${description}`;
            }
            const isNullable = nullable ? " (nullable)" : "";
            const description = schema.description ? ` // ${schema.description}` : "";
            return `${type}${description}${isNullable}`;
        }
        if ("anyOf" in schema) return schema.anyOf.map((s)=>this._schemaToInstruction(s, indent)).join(`\n${" ".repeat(indent - 2)}`);
        throw new Error("unsupported schema type");
    }
    static fromZodSchema(schema) {
        return new this(schema);
    }
    static fromNamesAndDescriptions(schemas) {
        const zodSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object(Object.fromEntries(Object.entries(schemas).map(([name, description])=>[
                name,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe(description)
            ])));
        return new this(zodSchema);
    }
};
/**
* A type of `StructuredOutputParser` that handles asymmetric input and
* output schemas.
*/ var AsymmetricStructuredOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    structuredInputParser;
    constructor({ inputSchema }){
        super(...arguments);
        this.structuredInputParser = new JsonMarkdownStructuredOutputParser(inputSchema);
    }
    async parse(text) {
        let parsedInput;
        try {
            parsedInput = await this.structuredInputParser.parse(text);
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${text}". Error: ${e}`, text);
        }
        return this.outputProcessor(parsedInput);
    }
    getFormatInstructions() {
        return this.structuredInputParser.getFormatInstructions();
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/xml.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XMLOutputParser",
    ()=>XMLOutputParser,
    "XML_FORMAT_INSTRUCTIONS",
    ()=>XML_FORMAT_INSTRUCTIONS,
    "parseXMLMarkdown",
    ()=>parseXMLMarkdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_patch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_patch.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$sax$2d$js$2f$sax$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/sax-js/sax.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/output_parsers/xml.ts
const XML_FORMAT_INSTRUCTIONS = `The output should be formatted as a XML file.
1. Output should conform to the tags below.
2. If tags are not given, make them on your own.
3. Remember to always open and close all the tags.

As an example, for the tags ["foo", "bar", "baz"]:
1. String "<foo>\n   <bar>\n      <baz></baz>\n   </bar>\n</foo>" is a well-formatted instance of the schema.
2. String "<foo>\n   <bar>\n   </foo>" is a badly-formatted instance.
3. String "<foo>\n   <tag>\n   </tag>\n</foo>" is a badly-formatted instance.

Here are the output tags:
\`\`\`
{tags}
\`\`\``;
var XMLOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"] {
    tags;
    constructor(fields){
        super(fields);
        this.tags = fields?.tags;
    }
    static lc_name() {
        return "XMLOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers"
    ];
    lc_serializable = true;
    _diff(prev, next) {
        if (!next) return;
        if (!prev) return [
            {
                op: "replace",
                path: "",
                value: next
            }
        ];
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["compare"])(prev, next);
    }
    async parsePartialResult(generations) {
        return parseXMLMarkdown(generations[0].text);
    }
    async parse(text) {
        return parseXMLMarkdown(text);
    }
    getFormatInstructions() {
        return !!(this.tags && this.tags.length > 0) ? XML_FORMAT_INSTRUCTIONS.replace("{tags}", this.tags?.join(", ") ?? "") : XML_FORMAT_INSTRUCTIONS;
    }
};
const strip = (text)=>text.split("\n").map((line)=>line.replace(/^\s+/, "")).join("\n").trim();
const parseParsedResult = (input)=>{
    if (Object.keys(input).length === 0) return {};
    const result = {};
    if (input.children.length > 0) {
        result[input.name] = input.children.map(parseParsedResult);
        return result;
    } else {
        result[input.name] = input.text ?? void 0;
        return result;
    }
};
function parseXMLMarkdown(s) {
    const cleanedString = strip(s);
    const parser = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$sax$2d$js$2f$sax$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sax"].parser(true);
    let parsedResult = {};
    const elementStack = [];
    parser.onopentag = (node)=>{
        const element = {
            name: node.name,
            attributes: node.attributes,
            children: [],
            text: "",
            isSelfClosing: node.isSelfClosing
        };
        if (elementStack.length > 0) elementStack[elementStack.length - 1].children.push(element);
        else parsedResult = element;
        if (!node.isSelfClosing) elementStack.push(element);
    };
    parser.onclosetag = ()=>{
        if (elementStack.length > 0) {
            const lastElement = elementStack.pop();
            if (elementStack.length === 0 && lastElement) parsedResult = lastElement;
        }
    };
    parser.ontext = (text)=>{
        if (elementStack.length > 0) {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.text += text;
        }
    };
    parser.onattribute = (attr)=>{
        if (elementStack.length > 0) {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.attributes[attr.name] = attr.value;
        }
    };
    const match = /```(xml)?(.*)```/s.exec(cleanedString);
    const xmlString = match ? match[2] : cleanedString;
    parser.write(xmlString).close();
    if (parsedResult && parsedResult.name === "?xml") parsedResult = parsedResult.children[0];
    return parseParsedResult(parsedResult);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "output_parsers_exports",
    ()=>output_parsers_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$bytes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/bytes.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/list.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$standard_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/standard_schema.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/structured.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/xml.js [app-rsc] (ecmascript)");
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
//#region src/output_parsers/index.ts
var output_parsers_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    AsymmetricStructuredOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsymmetricStructuredOutputParser"],
    BaseCumulativeTransformOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"],
    BaseLLMOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLLMOutputParser"],
    BaseOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"],
    BaseTransformOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"],
    BytesOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$bytes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BytesOutputParser"],
    CommaSeparatedListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CommaSeparatedListOutputParser"],
    CustomListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CustomListOutputParser"],
    JsonMarkdownStructuredOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonMarkdownStructuredOutputParser"],
    JsonOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["JsonOutputParser"],
    ListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ListOutputParser"],
    MarkdownListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MarkdownListOutputParser"],
    NumberedListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NumberedListOutputParser"],
    OutputParserException: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"],
    StandardSchemaOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$standard_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StandardSchemaOutputParser"],
    StringOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StringOutputParser"],
    StructuredOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StructuredOutputParser"],
    XMLOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["XMLOutputParser"],
    XML_FORMAT_INSTRUCTIONS: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["XML_FORMAT_INSTRUCTIONS"],
    parseJsonMarkdown: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseJsonMarkdown"],
    parsePartialJson: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePartialJson"],
    parseXMLMarkdown: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseXMLMarkdown"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_tools/json_output_tools_parsers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonOutputKeyToolsParser",
    ()=>JsonOutputKeyToolsParser,
    "JsonOutputToolsParser",
    ()=>JsonOutputToolsParser,
    "convertLangChainToolCallToOpenAI",
    ()=>convertLangChainToolCallToOpenAI,
    "makeInvalidToolCall",
    ()=>makeInvalidToolCall,
    "parseToolCall",
    ()=>parseToolCall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
;
;
//#region src/output_parsers/openai_tools/json_output_tools_parsers.ts
function parseToolCall(rawToolCall, options) {
    if (rawToolCall.function === void 0) return;
    let functionArgs;
    if (options?.partial) try {
        functionArgs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePartialJson"])(rawToolCall.function.arguments ?? "{}");
    } catch  {
        return;
    }
    else try {
        functionArgs = JSON.parse(rawToolCall.function.arguments);
    } catch (e) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"]([
            `Function "${rawToolCall.function.name}" arguments:`,
            ``,
            rawToolCall.function.arguments,
            ``,
            `are not valid JSON.`,
            `Error: ${e.message}`
        ].join("\n"));
    }
    const parsedToolCall = {
        name: rawToolCall.function.name,
        args: functionArgs,
        type: "tool_call"
    };
    if (options?.returnId) parsedToolCall.id = rawToolCall.id;
    return parsedToolCall;
}
function convertLangChainToolCallToOpenAI(toolCall) {
    if (toolCall.id === void 0) throw new Error(`All OpenAI tool calls must have an "id" field.`);
    return {
        id: toolCall.id,
        type: "function",
        function: {
            name: toolCall.name,
            arguments: JSON.stringify(toolCall.args)
        }
    };
}
function makeInvalidToolCall(rawToolCall, errorMsg) {
    return {
        name: rawToolCall.function?.name,
        args: rawToolCall.function?.arguments,
        id: rawToolCall.id,
        error: errorMsg,
        type: "invalid_tool_call"
    };
}
/**
* Class for parsing the output of a tool-calling LLM into a JSON object.
*/ var JsonOutputToolsParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"] {
    static lc_name() {
        return "JsonOutputToolsParser";
    }
    returnId = false;
    lc_namespace = [
        "langchain",
        "output_parsers",
        "openai_tools"
    ];
    lc_serializable = true;
    constructor(fields){
        super(fields);
        this.returnId = fields?.returnId ?? this.returnId;
    }
    _diff() {
        throw new Error("Not supported.");
    }
    async parse() {
        throw new Error("Not implemented.");
    }
    async parseResult(generations) {
        return await this.parsePartialResult(generations, false);
    }
    /**
	* Parses the output and returns a JSON object. If `argsOnly` is true,
	* only the arguments of the function call are returned.
	* @param generations The output of the LLM to parse.
	* @returns A JSON object representation of the function call or its arguments.
	*/ async parsePartialResult(generations, partial = true) {
        const message = generations[0].message;
        let toolCalls;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAIMessage"])(message) && message.tool_calls?.length) toolCalls = message.tool_calls.map((toolCall)=>{
            const { id, ...rest } = toolCall;
            if (!this.returnId) return rest;
            return {
                id,
                ...rest
            };
        });
        else if (message.additional_kwargs.tool_calls !== void 0) toolCalls = JSON.parse(JSON.stringify(message.additional_kwargs.tool_calls)).map((rawToolCall)=>{
            return parseToolCall(rawToolCall, {
                returnId: this.returnId,
                partial
            });
        });
        if (!toolCalls) return [];
        const parsedToolCalls = [];
        for (const toolCall of toolCalls)if (toolCall !== void 0) {
            const backwardsCompatibleToolCall = {
                type: toolCall.name,
                args: toolCall.args,
                id: toolCall.id
            };
            parsedToolCalls.push(backwardsCompatibleToolCall);
        }
        return parsedToolCalls;
    }
};
/**
* Class for parsing the output of a tool-calling LLM into a JSON object if you are
* expecting only a single tool to be called.
*/ var JsonOutputKeyToolsParser = class extends JsonOutputToolsParser {
    static lc_name() {
        return "JsonOutputKeyToolsParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "openai_tools"
    ];
    lc_serializable = true;
    returnId = false;
    /** The type of tool calls to return. */ keyName;
    /** Whether to return only the first tool call. */ returnSingle = false;
    zodSchema;
    serializableSchema;
    constructor(params){
        super(params);
        this.keyName = params.keyName;
        this.returnSingle = params.returnSingle ?? this.returnSingle;
        if ("zodSchema" in params) this.zodSchema = params.zodSchema;
        if ("serializableSchema" in params) this.serializableSchema = params.serializableSchema;
    }
    async _validateResult(result) {
        if (this.serializableSchema !== void 0) {
            const validated = await this.serializableSchema["~standard"].validate(result);
            if (validated.issues) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(validated.issues)}`, JSON.stringify(result, null, 2));
            return validated.value;
        }
        if (this.zodSchema === void 0) return result;
        const zodParsedResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopSafeParseAsync"])(this.zodSchema, result);
        if (zodParsedResult.success) return zodParsedResult.data;
        else throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(zodParsedResult.error?.issues)}`, JSON.stringify(result, null, 2));
    }
    async parsePartialResult(generations) {
        const matchingResults = (await super.parsePartialResult(generations)).filter((result)=>result.type === this.keyName);
        let returnedValues = matchingResults;
        if (!matchingResults.length) return;
        if (!this.returnId) returnedValues = matchingResults.map((result)=>result.args);
        if (this.returnSingle) return returnedValues[0];
        return returnedValues;
    }
    async parseResult(generations) {
        const matchingResults = (await super.parsePartialResult(generations, false)).filter((result)=>result.type === this.keyName);
        let returnedValues = matchingResults;
        if (!matchingResults.length) return;
        if (!this.returnId) returnedValues = matchingResults.map((result)=>result.args);
        if (this.returnSingle) return this._validateResult(returnedValues[0]);
        return await Promise.all(returnedValues.map((value)=>this._validateResult(value)));
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_functions/json_output_functions_parsers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonKeyOutputFunctionsParser",
    ()=>JsonKeyOutputFunctionsParser,
    "JsonOutputFunctionsParser",
    ()=>JsonOutputFunctionsParser,
    "OutputFunctionsParser",
    ()=>OutputFunctionsParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_patch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_patch.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
;
;
//#region src/output_parsers/openai_functions/json_output_functions_parsers.ts
/**
* Class for parsing the output of an LLM. Can be configured to return
* only the arguments of the function call in the output.
*/ var OutputFunctionsParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLLMOutputParser"] {
    static lc_name() {
        return "OutputFunctionsParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "openai_functions"
    ];
    lc_serializable = true;
    argsOnly = true;
    constructor(config){
        super();
        this.argsOnly = config?.argsOnly ?? this.argsOnly;
    }
    /**
	* Parses the output and returns a string representation of the function
	* call or its arguments.
	* @param generations The output of the LLM to parse.
	* @returns A string representation of the function call or its arguments.
	*/ async parseResult(generations) {
        if ("message" in generations[0]) {
            const functionCall = generations[0].message.additional_kwargs.function_call;
            if (!functionCall) throw new Error(`No function_call in message ${JSON.stringify(generations)}`);
            if (!functionCall.arguments) throw new Error(`No arguments in function_call ${JSON.stringify(generations)}`);
            if (this.argsOnly) return functionCall.arguments;
            return JSON.stringify(functionCall);
        } else throw new Error(`No message in generations ${JSON.stringify(generations)}`);
    }
};
/**
* Class for parsing the output of an LLM into a JSON object. Uses an
* instance of `OutputFunctionsParser` to parse the output.
*/ var JsonOutputFunctionsParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"] {
    static lc_name() {
        return "JsonOutputFunctionsParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "openai_functions"
    ];
    lc_serializable = true;
    outputParser;
    argsOnly = true;
    constructor(config){
        super(config);
        this.argsOnly = config?.argsOnly ?? this.argsOnly;
        this.outputParser = new OutputFunctionsParser(config);
    }
    _diff(prev, next) {
        if (!next) return;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["compare"])(prev ?? {}, next);
    }
    async parsePartialResult(generations) {
        const generation = generations[0];
        if (!generation.message) return;
        const { message } = generation;
        const functionCall = message.additional_kwargs.function_call;
        if (!functionCall) return;
        if (this.argsOnly) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePartialJson"])(functionCall.arguments);
        return {
            ...functionCall,
            arguments: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePartialJson"])(functionCall.arguments)
        };
    }
    /**
	* Parses the output and returns a JSON object. If `argsOnly` is true,
	* only the arguments of the function call are returned.
	* @param generations The output of the LLM to parse.
	* @returns A JSON object representation of the function call or its arguments.
	*/ async parseResult(generations) {
        const result = await this.outputParser.parseResult(generations);
        if (!result) throw new Error(`No result from "OutputFunctionsParser" ${JSON.stringify(generations)}`);
        return this.parse(result);
    }
    async parse(text) {
        const parsedResult = JSON.parse(text);
        if (this.argsOnly) return parsedResult;
        parsedResult.arguments = JSON.parse(parsedResult.arguments);
        return parsedResult;
    }
    getFormatInstructions() {
        return "";
    }
};
/**
* Class for parsing the output of an LLM into a JSON object and returning
* a specific attribute. Uses an instance of `JsonOutputFunctionsParser`
* to parse the output.
*/ var JsonKeyOutputFunctionsParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLLMOutputParser"] {
    static lc_name() {
        return "JsonKeyOutputFunctionsParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "openai_functions"
    ];
    lc_serializable = true;
    outputParser = new JsonOutputFunctionsParser();
    attrName;
    get lc_aliases() {
        return {
            attrName: "key_name"
        };
    }
    constructor(fields){
        super(fields);
        this.attrName = fields.attrName;
    }
    /**
	* Parses the output and returns a specific attribute of the parsed JSON
	* object.
	* @param generations The output of the LLM to parse.
	* @returns The value of a specific attribute of the parsed JSON object.
	*/ async parseResult(generations) {
        return (await this.outputParser.parseResult(generations))[this.attrName];
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_functions/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openai_functions_exports",
    ()=>openai_functions_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_functions$2f$json_output_functions_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_functions/json_output_functions_parsers.js [app-rsc] (ecmascript)");
;
;
//#region src/output_parsers/openai_functions/index.ts
var openai_functions_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    JsonKeyOutputFunctionsParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_functions$2f$json_output_functions_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonKeyOutputFunctionsParser"],
    JsonOutputFunctionsParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_functions$2f$json_output_functions_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonOutputFunctionsParser"],
    OutputFunctionsParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_functions$2f$json_output_functions_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputFunctionsParser"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_tools/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openai_tools_exports",
    ()=>openai_tools_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/openai_tools/json_output_tools_parsers.js [app-rsc] (ecmascript)");
;
;
//#region src/output_parsers/openai_tools/index.ts
var openai_tools_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    JsonOutputKeyToolsParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonOutputKeyToolsParser"],
    JsonOutputToolsParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonOutputToolsParser"],
    convertLangChainToolCallToOpenAI: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertLangChainToolCallToOpenAI"],
    makeInvalidToolCall: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["makeInvalidToolCall"],
    parseToolCall: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseToolCall"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/memory.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseMemory",
    ()=>BaseMemory,
    "getInputValue",
    ()=>getInputValue,
    "getOutputValue",
    ()=>getOutputValue,
    "getPromptInputKey",
    ()=>getPromptInputKey,
    "memory_exports",
    ()=>memory_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/memory.ts
var memory_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseMemory: ()=>BaseMemory,
    getInputValue: ()=>getInputValue,
    getOutputValue: ()=>getOutputValue,
    getPromptInputKey: ()=>getPromptInputKey
});
/**
* Abstract base class for memory in LangChain's Chains. Memory refers to
* the state in Chains. It can be used to store information about past
* executions of a Chain and inject that information into the inputs of
* future executions of the Chain.
*/ var BaseMemory = class {
};
const getValue = (values, key)=>{
    if (key !== void 0) return values[key];
    const keys = Object.keys(values);
    if (keys.length === 1) return values[keys[0]];
};
/**
* This function is used by memory classes to select the input value
* to use for the memory. If there is only one input value, it is used.
* If there are multiple input values, the inputKey must be specified.
*/ const getInputValue = (inputValues, inputKey)=>{
    const value = getValue(inputValues, inputKey);
    if (!value) {
        const keys = Object.keys(inputValues);
        throw new Error(`input values have ${keys.length} keys, you must specify an input key or pass only 1 key as input`);
    }
    return value;
};
/**
* This function is used by memory classes to select the output value
* to use for the memory. If there is only one output value, it is used.
* If there are multiple output values, the outputKey must be specified.
* If no outputKey is specified, an error is thrown.
*/ const getOutputValue = (outputValues, outputKey)=>{
    const value = getValue(outputValues, outputKey);
    if (!value && value !== "") {
        const keys = Object.keys(outputValues);
        throw new Error(`output values have ${keys.length} keys, you must specify an output key or pass only 1 key as output`);
    }
    return value;
};
/**
* Function used by memory classes to get the key of the prompt input,
* excluding any keys that are memory variables or the "stop" key. If
* there is not exactly one prompt input key, an error is thrown.
*/ function getPromptInputKey(inputs, memoryVariables) {
    const promptInputKeys = Object.keys(inputs).filter((key)=>!memoryVariables.includes(key) && key !== "stop");
    if (promptInputKeys.length !== 1) throw new Error(`One input key expected, but got ${promptInputKeys.length}`);
    return promptInputKeys[0];
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BasePromptTemplate",
    ()=>BasePromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
;
//#region src/prompts/base.ts
/**
* Base class for prompt templates. Exposes a format method that returns a
* string prompt given a set of input values.
*/ var BasePromptTemplate = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    lc_serializable = true;
    lc_namespace = [
        "langchain_core",
        "prompts",
        this._getPromptType()
    ];
    get lc_attributes() {
        return {
            partialVariables: void 0
        };
    }
    inputVariables;
    outputParser;
    partialVariables;
    /**
	* Metadata to be used for tracing.
	*/ metadata;
    /** Tags to be used for tracing. */ tags;
    constructor(input){
        super(input);
        const { inputVariables } = input;
        if (inputVariables.includes("stop")) throw new Error("Cannot have an input variable named 'stop', as it is used internally, please rename.");
        Object.assign(this, input);
    }
    /**
	* Merges partial variables and user variables.
	* @param userVariables The user variables to merge with the partial variables.
	* @returns A Promise that resolves to an object containing the merged variables.
	*/ async mergePartialAndUserVariables(userVariables) {
        const partialVariables = this.partialVariables ?? {};
        const partialValues = {};
        for (const [key, value] of Object.entries(partialVariables))if (typeof value === "string") partialValues[key] = value;
        else partialValues[key] = await value();
        return {
            ...partialValues,
            ...userVariables
        };
    }
    /**
	* Invokes the prompt template with the given input and options.
	* @param input The input to invoke the prompt template with.
	* @param options Optional configuration for the callback.
	* @returns A Promise that resolves to the output of the prompt template.
	*/ async invoke(input, options) {
        const metadata = {
            ...this.metadata,
            ...options?.metadata
        };
        const tags = [
            ...this.tags ?? [],
            ...options?.tags ?? []
        ];
        return this._callWithConfig((input)=>this.formatPromptValue(input), input, {
            ...options,
            tags,
            metadata,
            runType: "prompt"
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/string.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseStringPromptTemplate",
    ()=>BaseStringPromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompt_values.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/base.js [app-rsc] (ecmascript)");
;
;
//#region src/prompts/string.ts
/**
* Base class for string prompt templates. It extends the
* BasePromptTemplate class and overrides the formatPromptValue method to
* return a StringPromptValue.
*/ var BaseStringPromptTemplate = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BasePromptTemplate"] {
    /**
	* Formats the prompt given the input values and returns a formatted
	* prompt value.
	* @param values The input values to format the prompt.
	* @returns A Promise that resolves to a formatted prompt value.
	*/ async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StringPromptValue"](formattedPrompt);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/template.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_FORMATTER_MAPPING",
    ()=>DEFAULT_FORMATTER_MAPPING,
    "DEFAULT_PARSER_MAPPING",
    ()=>DEFAULT_PARSER_MAPPING,
    "checkValidTemplate",
    ()=>checkValidTemplate,
    "interpolateFString",
    ()=>interpolateFString,
    "interpolateMustache",
    ()=>interpolateMustache,
    "parseFString",
    ()=>parseFString,
    "parseMustache",
    ()=>parseMustache,
    "parseTemplate",
    ()=>parseTemplate,
    "renderTemplate",
    ()=>renderTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mustache$40$4$2e$2$2e$0$2f$node_modules$2f$mustache$2f$mustache$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mustache@4.2.0/node_modules/mustache/mustache.mjs [app-rsc] (ecmascript)");
;
;
//#region src/prompts/template.ts
const MUSTACHE_RENDER_OPTIONS = {
    escape: (text)=>text
};
const parseFString = (template)=>{
    const chars = template.split("");
    const nodes = [];
    const nextBracket = (bracket, start)=>{
        for(let i = start; i < chars.length; i += 1)if (bracket.includes(chars[i])) return i;
        return -1;
    };
    let i = 0;
    while(i < chars.length)if (chars[i] === "{" && i + 1 < chars.length && chars[i + 1] === "{") {
        nodes.push({
            type: "literal",
            text: "{"
        });
        i += 2;
    } else if (chars[i] === "}" && i + 1 < chars.length && chars[i + 1] === "}") {
        nodes.push({
            type: "literal",
            text: "}"
        });
        i += 2;
    } else if (chars[i] === "{") {
        const j = nextBracket("}", i);
        if (j < 0) throw new Error("Unclosed '{' in template.");
        nodes.push({
            type: "variable",
            name: chars.slice(i + 1, j).join("")
        });
        i = j + 1;
    } else if (chars[i] === "}") throw new Error("Single '}' in template.");
    else {
        const next = nextBracket("{}", i);
        const text = (next < 0 ? chars.slice(i) : chars.slice(i, next)).join("");
        nodes.push({
            type: "literal",
            text
        });
        i = next < 0 ? chars.length : next;
    }
    return nodes;
};
/**
* Convert the result of mustache.parse into an array of ParsedTemplateNode,
* to make it compatible with other LangChain string parsing template formats.
*
* @param {mustache.TemplateSpans} template The result of parsing a mustache template with the mustache.js library.
* @param {string[]} context Array of section variable names for nested context
* @returns {ParsedTemplateNode[]}
*/ const mustacheTemplateToNodes = (template, context = [])=>{
    const nodes = [];
    for (const temp of template)if (temp[0] === "name") {
        const name = temp[1].includes(".") ? temp[1].split(".")[0] : temp[1];
        nodes.push({
            type: "variable",
            name
        });
    } else if ([
        "#",
        "&",
        "^",
        ">"
    ].includes(temp[0])) {
        nodes.push({
            type: "variable",
            name: temp[1]
        });
        if (temp[0] === "#" && temp.length > 4 && Array.isArray(temp[4])) {
            const newContext = [
                ...context,
                temp[1]
            ];
            const nestedNodes = mustacheTemplateToNodes(temp[4], newContext);
            nodes.push(...nestedNodes);
        }
    } else nodes.push({
        type: "literal",
        text: temp[1]
    });
    return nodes;
};
const parseMustache = (template)=>{
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mustache$40$4$2e$2$2e$0$2f$node_modules$2f$mustache$2f$mustache$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].parse(template);
    return mustacheTemplateToNodes(parsed);
};
const interpolateFString = (template, values)=>{
    return parseFString(template).reduce((res, node)=>{
        if (node.type === "variable") {
            if (node.name in values) return res + (typeof values[node.name] === "string" ? values[node.name] : JSON.stringify(values[node.name]));
            throw new Error(`(f-string) Missing value for input ${node.name}`);
        }
        return res + node.text;
    }, "");
};
const interpolateMustache = (template, values)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mustache$40$4$2e$2$2e$0$2f$node_modules$2f$mustache$2f$mustache$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].render(template, values, void 0, MUSTACHE_RENDER_OPTIONS);
};
const DEFAULT_FORMATTER_MAPPING = {
    "f-string": interpolateFString,
    mustache: interpolateMustache
};
const DEFAULT_PARSER_MAPPING = {
    "f-string": parseFString,
    mustache: parseMustache
};
const renderTemplate = (template, templateFormat, inputValues)=>{
    try {
        return DEFAULT_FORMATTER_MAPPING[templateFormat](template, inputValues);
    } catch (e) {
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addLangChainErrorFields"])(e, "INVALID_PROMPT_INPUT");
    }
};
const parseTemplate = (template, templateFormat)=>DEFAULT_PARSER_MAPPING[templateFormat](template);
const checkValidTemplate = (template, templateFormat, inputVariables)=>{
    if (!(templateFormat in DEFAULT_FORMATTER_MAPPING)) {
        const validFormats = Object.keys(DEFAULT_FORMATTER_MAPPING);
        throw new Error(`Invalid template format. Got \`${templateFormat}\`;
                         should be one of ${validFormats}`);
    }
    try {
        const dummyInputs = Object.fromEntries(inputVariables.map((v)=>[
                v,
                "foo"
            ]));
        if (Array.isArray(template)) template.forEach((message)=>{
            if (message.type === "text" && "text" in message && typeof message.text === "string") renderTemplate(message.text, templateFormat, dummyInputs);
            else if (message.type === "image_url") {
                if (typeof message.image_url === "string") renderTemplate(message.image_url, templateFormat, dummyInputs);
                else if (typeof message.image_url === "object" && message.image_url !== null && "url" in message.image_url && typeof message.image_url.url === "string") {
                    const imageUrl = message.image_url.url;
                    renderTemplate(imageUrl, templateFormat, dummyInputs);
                }
            } else throw new Error(`Invalid message template received. ${JSON.stringify(message, null, 2)}`);
        });
        else renderTemplate(template, templateFormat, dummyInputs);
    } catch (e) {
        throw new Error(`Invalid prompt schema: ${e.message}`);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/prompt.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PromptTemplate",
    ()=>PromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/template.js [app-rsc] (ecmascript)");
;
;
//#region src/prompts/prompt.ts
/**
* Schema to represent a basic prompt for an LLM.
* @augments BasePromptTemplate
* @augments PromptTemplateInput
*
* @example
* ```ts
* import { PromptTemplate } from "langchain/prompts";
*
* const prompt = new PromptTemplate({
*   inputVariables: ["foo"],
*   template: "Say {foo}",
* });
* ```
*/ var PromptTemplate = class PromptTemplate extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseStringPromptTemplate"] {
    static lc_name() {
        return "PromptTemplate";
    }
    template;
    templateFormat = "f-string";
    validateTemplate = true;
    /**
	* Additional fields which should be included inside
	* the message content array if using a complex message
	* content.
	*/ additionalContentFields;
    constructor(input){
        super(input);
        if (input.templateFormat === "mustache" && input.validateTemplate === void 0) this.validateTemplate = false;
        Object.assign(this, input);
        if (this.validateTemplate) {
            if (this.templateFormat === "mustache") throw new Error("Mustache templates cannot be validated.");
            let totalInputVariables = this.inputVariables;
            if (this.partialVariables) totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkValidTemplate"])(this.template, this.templateFormat, totalInputVariables);
        }
    }
    _getPromptType() {
        return "prompt";
    }
    /**
	* Formats the prompt template with the provided values.
	* @param values The values to be used to format the prompt template.
	* @returns A promise that resolves to a string which is the formatted prompt.
	*/ async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTemplate"])(this.template, this.templateFormat, allValues);
    }
    /**
	* Take examples in list format with prefix and suffix to create a prompt.
	*
	* Intended to be used as a way to dynamically create a prompt from examples.
	*
	* @param examples - List of examples to use in the prompt.
	* @param suffix - String to go after the list of examples. Should generally set up the user's input.
	* @param inputVariables - A list of variable names the final prompt template will expect
	* @param exampleSeparator - The separator to use in between examples
	* @param prefix - String that should go before any examples. Generally includes examples.
	*
	* @returns The final prompt template generated.
	*/ static fromExamples(examples, suffix, inputVariables, exampleSeparator = "\n\n", prefix = "") {
        const template = [
            prefix,
            ...examples,
            suffix
        ].join(exampleSeparator);
        return new PromptTemplate({
            inputVariables,
            template
        });
    }
    static fromTemplate(template, options) {
        const { templateFormat = "f-string", ...rest } = options ?? {};
        const names = /* @__PURE__ */ new Set();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseTemplate"])(template, templateFormat).forEach((node)=>{
            if (node.type === "variable") names.add(node.name);
        });
        return new PromptTemplate({
            inputVariables: [
                ...names
            ],
            templateFormat,
            template,
            ...rest
        });
    }
    /**
	* Partially applies values to the prompt template.
	* @param values The values to be partially applied to the prompt template.
	* @returns A new instance of PromptTemplate with the partially applied values.
	*/ async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv)=>!(iv in values));
        const newPartialVariables = {
            ...this.partialVariables ?? {},
            ...values
        };
        const promptDict = {
            ...this,
            inputVariables: newInputVariables,
            partialVariables: newPartialVariables
        };
        return new PromptTemplate(promptDict);
    }
    serialize() {
        if (this.outputParser !== void 0) throw new Error("Cannot serialize a prompt template with an output parser");
        return {
            _type: this._getPromptType(),
            input_variables: this.inputVariables,
            template: this.template,
            template_format: this.templateFormat
        };
    }
    static async deserialize(data) {
        if (!data.template) throw new Error("Prompt template must have a template");
        return new PromptTemplate({
            inputVariables: data.input_variables,
            template: data.template,
            templateFormat: data.template_format
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/image.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImagePromptTemplate",
    ()=>ImagePromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompt_values.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/template.js [app-rsc] (ecmascript)");
;
;
;
//#region src/prompts/image.ts
/**
* An image prompt template for a multimodal model.
*/ var ImagePromptTemplate = class ImagePromptTemplate extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BasePromptTemplate"] {
    static lc_name() {
        return "ImagePromptTemplate";
    }
    lc_namespace = [
        "langchain_core",
        "prompts",
        "image"
    ];
    template;
    templateFormat = "f-string";
    validateTemplate = true;
    /**
	* Additional fields which should be included inside
	* the message content array if using a complex message
	* content.
	*/ additionalContentFields;
    constructor(input){
        super(input);
        this.template = input.template;
        this.templateFormat = input.templateFormat ?? this.templateFormat;
        this.validateTemplate = input.validateTemplate ?? this.validateTemplate;
        this.additionalContentFields = input.additionalContentFields;
        if (this.validateTemplate) {
            let totalInputVariables = this.inputVariables;
            if (this.partialVariables) totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkValidTemplate"])([
                {
                    type: "image_url",
                    image_url: this.template
                }
            ], this.templateFormat, totalInputVariables);
        }
    }
    _getPromptType() {
        return "prompt";
    }
    /**
	* Partially applies values to the prompt template.
	* @param values The values to be partially applied to the prompt template.
	* @returns A new instance of ImagePromptTemplate with the partially applied values.
	*/ async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv)=>!(iv in values));
        const newPartialVariables = {
            ...this.partialVariables ?? {},
            ...values
        };
        const promptDict = {
            ...this,
            inputVariables: newInputVariables,
            partialVariables: newPartialVariables
        };
        return new ImagePromptTemplate(promptDict);
    }
    /**
	* Formats the prompt template with the provided values.
	* @param values The values to be used to format the prompt template.
	* @returns A promise that resolves to a string which is the formatted prompt.
	*/ async format(values) {
        const formatted = {};
        for (const [key, value] of Object.entries(this.template))if (typeof value === "string") formatted[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTemplate"])(value, this.templateFormat, values);
        else formatted[key] = value;
        const url = values.url || formatted.url;
        const detail = values.detail || formatted.detail;
        if (!url) throw new Error("Must provide either an image URL.");
        if (typeof url !== "string") throw new Error("url must be a string.");
        const output = {
            url
        };
        if (detail) output.detail = detail;
        return output;
    }
    /**
	* Formats the prompt given the input values and returns a formatted
	* prompt value.
	* @param values The input values to format the prompt.
	* @returns A Promise that resolves to a formatted prompt value.
	*/ async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImagePromptValue"](formattedPrompt);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/dict.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DictPromptTemplate",
    ()=>DictPromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/template.js [app-rsc] (ecmascript)");
;
;
//#region src/prompts/dict.ts
var DictPromptTemplate = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    lc_namespace = [
        "langchain_core",
        "prompts",
        "dict"
    ];
    lc_serializable = true;
    template;
    templateFormat;
    inputVariables;
    static lc_name() {
        return "DictPromptTemplate";
    }
    constructor(fields){
        const templateFormat = fields.templateFormat ?? "f-string";
        const inputVariables = _getInputVariables(fields.template, templateFormat);
        super({
            inputVariables,
            ...fields
        });
        this.template = fields.template;
        this.templateFormat = templateFormat;
        this.inputVariables = inputVariables;
    }
    async format(values) {
        return _insertInputVariables(this.template, values, this.templateFormat);
    }
    async invoke(values) {
        return await this._callWithConfig(this.format.bind(this), values, {
            runType: "prompt"
        });
    }
};
function _getInputVariables(template, templateFormat) {
    const inputVariables = [];
    for (const v of Object.values(template))if (typeof v === "string") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseTemplate"])(v, templateFormat).forEach((t)=>{
        if (t.type === "variable") inputVariables.push(t.name);
    });
    else if (Array.isArray(v)) {
        for (const x of v)if (typeof x === "string") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseTemplate"])(x, templateFormat).forEach((t)=>{
            if (t.type === "variable") inputVariables.push(t.name);
        });
        else if (typeof x === "object") inputVariables.push(..._getInputVariables(x, templateFormat));
    } else if (typeof v === "object" && v !== null) inputVariables.push(..._getInputVariables(v, templateFormat));
    return Array.from(new Set(inputVariables));
}
function _insertInputVariables(template, inputs, templateFormat) {
    const formatted = {};
    for (const [k, v] of Object.entries(template))if (typeof v === "string") formatted[k] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTemplate"])(v, templateFormat, inputs);
    else if (Array.isArray(v)) {
        const formattedV = [];
        for (const x of v)if (typeof x === "string") formattedV.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTemplate"])(x, templateFormat, inputs));
        else if (typeof x === "object") formattedV.push(_insertInputVariables(x, inputs, templateFormat));
        formatted[k] = formattedV;
    } else if (typeof v === "object" && v !== null) formatted[k] = _insertInputVariables(v, inputs, templateFormat);
    else formatted[k] = v;
    return formatted;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/chat.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AIMessagePromptTemplate",
    ()=>AIMessagePromptTemplate,
    "BaseChatPromptTemplate",
    ()=>BaseChatPromptTemplate,
    "BaseMessagePromptTemplate",
    ()=>BaseMessagePromptTemplate,
    "BaseMessageStringPromptTemplate",
    ()=>BaseMessageStringPromptTemplate,
    "ChatMessagePromptTemplate",
    ()=>ChatMessagePromptTemplate,
    "ChatPromptTemplate",
    ()=>ChatPromptTemplate,
    "HumanMessagePromptTemplate",
    ()=>HumanMessagePromptTemplate,
    "MessagesPlaceholder",
    ()=>MessagesPlaceholder,
    "SystemMessagePromptTemplate",
    ()=>SystemMessagePromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/chat.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/system.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompt_values.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/template.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/prompt.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$dict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/dict.js [app-rsc] (ecmascript)");
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
//#region src/prompts/chat.ts
/**
* Abstract class that serves as a base for creating message prompt
* templates. It defines how to format messages for different roles in a
* conversation.
*/ var BaseMessagePromptTemplate = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    lc_namespace = [
        "langchain_core",
        "prompts",
        "chat"
    ];
    lc_serializable = true;
    /**
	* Calls the formatMessages method with the provided input and options.
	* @param input Input for the formatMessages method
	* @param options Optional BaseCallbackConfig
	* @returns Formatted output messages
	*/ async invoke(input, options) {
        return this._callWithConfig((input)=>this.formatMessages(input), input, {
            ...options,
            runType: "prompt"
        });
    }
};
/**
* Class that represents a placeholder for messages in a chat prompt. It
* extends the BaseMessagePromptTemplate.
*/ var MessagesPlaceholder = class extends BaseMessagePromptTemplate {
    static lc_name() {
        return "MessagesPlaceholder";
    }
    variableName;
    optional;
    constructor(fields){
        if (typeof fields === "string") fields = {
            variableName: fields
        };
        super(fields);
        this.variableName = fields.variableName;
        this.optional = fields.optional ?? false;
    }
    get inputVariables() {
        return [
            this.variableName
        ];
    }
    async formatMessages(values) {
        const input = values[this.variableName];
        if (this.optional && !input) return [];
        else if (!input) {
            const error = /* @__PURE__ */ new Error(`Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages as an input value. Received: undefined`);
            error.name = "InputFormatError";
            throw error;
        }
        let formattedMessages;
        try {
            if (Array.isArray(input)) formattedMessages = input.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]);
            else formattedMessages = [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"])(input)
            ];
        } catch (e) {
            const readableInput = typeof input === "string" ? input : JSON.stringify(input, null, 2);
            const error = new Error([
                `Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages or coerceable values as input.`,
                `Received value: ${readableInput}`,
                `Additional message: ${e.message}`
            ].join("\n\n"));
            error.name = "InputFormatError";
            error.lc_error_code = e.lc_error_code;
            throw error;
        }
        return formattedMessages;
    }
};
/**
* Abstract class that serves as a base for creating message string prompt
* templates. It extends the BaseMessagePromptTemplate.
*/ var BaseMessageStringPromptTemplate = class extends BaseMessagePromptTemplate {
    prompt;
    constructor(fields){
        if (!("prompt" in fields)) fields = {
            prompt: fields
        };
        super(fields);
        this.prompt = fields.prompt;
    }
    get inputVariables() {
        return this.prompt.inputVariables;
    }
    async formatMessages(values) {
        return [
            await this.format(values)
        ];
    }
};
/**
* Abstract class that serves as a base for creating chat prompt
* templates. It extends the BasePromptTemplate.
*/ var BaseChatPromptTemplate = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BasePromptTemplate"] {
    constructor(input){
        super(input);
    }
    async format(values) {
        return (await this.formatPromptValue(values)).toString();
    }
    async formatPromptValue(values) {
        const resultMessages = await this.formatMessages(values);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatPromptValue"](resultMessages);
    }
};
/**
* Class that represents a chat message prompt template. It extends the
* BaseMessageStringPromptTemplate.
*/ var ChatMessagePromptTemplate = class extends BaseMessageStringPromptTemplate {
    static lc_name() {
        return "ChatMessagePromptTemplate";
    }
    role;
    constructor(fields, role){
        if (!("prompt" in fields)) fields = {
            prompt: fields,
            role
        };
        super(fields);
        this.role = fields.role;
    }
    async format(values) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatMessage"](await this.prompt.format(values), this.role);
    }
    static fromTemplate(template, role, options) {
        return new this(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(template, {
            templateFormat: options?.templateFormat
        }), role);
    }
};
function isTextTemplateParam(param) {
    if (param === null || typeof param !== "object" || Array.isArray(param)) return false;
    return Object.keys(param).length === 1 && "text" in param && typeof param.text === "string";
}
function isImageTemplateParam(param) {
    if (param === null || typeof param !== "object" || Array.isArray(param)) return false;
    return "image_url" in param && (typeof param.image_url === "string" || typeof param.image_url === "object" && param.image_url !== null && "url" in param.image_url && typeof param.image_url.url === "string");
}
var _StringImageMessagePromptTemplate = class extends BaseMessagePromptTemplate {
    lc_namespace = [
        "langchain_core",
        "prompts",
        "chat"
    ];
    lc_serializable = true;
    inputVariables = [];
    additionalOptions = {};
    prompt;
    messageClass;
    static _messageClass() {
        throw new Error("Can not invoke _messageClass from inside _StringImageMessagePromptTemplate");
    }
    chatMessageClass;
    constructor(fields, additionalOptions){
        if (!("prompt" in fields)) fields = {
            prompt: fields
        };
        super(fields);
        this.prompt = fields.prompt;
        if (Array.isArray(this.prompt)) {
            let inputVariables = [];
            this.prompt.forEach((prompt)=>{
                if ("inputVariables" in prompt) inputVariables = inputVariables.concat(prompt.inputVariables);
            });
            this.inputVariables = inputVariables;
        } else this.inputVariables = this.prompt.inputVariables;
        this.additionalOptions = additionalOptions ?? this.additionalOptions;
    }
    createMessage(content) {
        const constructor = this.constructor;
        if (constructor._messageClass()) return new (constructor._messageClass())({
            content
        });
        else if (constructor.chatMessageClass) {
            const MsgClass = constructor.chatMessageClass();
            return new MsgClass({
                content,
                role: this.getRoleFromMessageClass(MsgClass.lc_name())
            });
        } else throw new Error("No message class defined");
    }
    getRoleFromMessageClass(name) {
        switch(name){
            case "HumanMessage":
                return "human";
            case "AIMessage":
                return "ai";
            case "SystemMessage":
                return "system";
            case "ChatMessage":
                return "chat";
            default:
                throw new Error("Invalid message class name");
        }
    }
    static fromTemplate(template, additionalOptions) {
        if (typeof template === "string") return new this(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(template, additionalOptions));
        const prompt = [];
        for (const item of template)if (typeof item === "string") prompt.push(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(item, additionalOptions));
        else if (item === null) {} else if (isTextTemplateParam(item)) {
            let text = "";
            if (typeof item.text === "string") text = item.text ?? "";
            const options = {
                ...additionalOptions,
                additionalContentFields: item
            };
            prompt.push(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(text, options));
        } else if (isImageTemplateParam(item)) {
            let imgTemplate = item.image_url ?? "";
            let imgTemplateObject;
            let inputVariables = [];
            if (typeof imgTemplate === "string") {
                let parsedTemplate;
                if (additionalOptions?.templateFormat === "mustache") parsedTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseMustache"])(imgTemplate);
                else parsedTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseFString"])(imgTemplate);
                const variables = parsedTemplate.flatMap((item)=>item.type === "variable" ? [
                        item.name
                    ] : []);
                if ((variables?.length ?? 0) > 0) {
                    if (variables.length > 1) throw new Error(`Only one format variable allowed per image template.\nGot: ${variables}\nFrom: ${imgTemplate}`);
                    inputVariables = [
                        variables[0]
                    ];
                } else inputVariables = [];
                imgTemplate = {
                    url: imgTemplate
                };
                imgTemplateObject = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImagePromptTemplate"]({
                    template: imgTemplate,
                    inputVariables,
                    templateFormat: additionalOptions?.templateFormat,
                    additionalContentFields: item
                });
            } else if (typeof imgTemplate === "object") {
                if ("url" in imgTemplate) {
                    let parsedTemplate;
                    if (additionalOptions?.templateFormat === "mustache") parsedTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseMustache"])(imgTemplate.url);
                    else parsedTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseFString"])(imgTemplate.url);
                    inputVariables = parsedTemplate.flatMap((item)=>item.type === "variable" ? [
                            item.name
                        ] : []);
                } else inputVariables = [];
                imgTemplateObject = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImagePromptTemplate"]({
                    template: imgTemplate,
                    inputVariables,
                    templateFormat: additionalOptions?.templateFormat,
                    additionalContentFields: item
                });
            } else throw new Error("Invalid image template");
            prompt.push(imgTemplateObject);
        } else if (typeof item === "object") prompt.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$dict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DictPromptTemplate"]({
            template: item,
            templateFormat: additionalOptions?.templateFormat
        }));
        return new this({
            prompt,
            additionalOptions
        });
    }
    async format(input) {
        if (this.prompt instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseStringPromptTemplate"]) {
            const text = await this.prompt.format(input);
            return this.createMessage(text);
        } else {
            const content = [];
            for (const prompt of this.prompt){
                let inputs = {};
                if (!("inputVariables" in prompt)) throw new Error(`Prompt ${prompt} does not have inputVariables defined.`);
                for (const item of prompt.inputVariables){
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                    inputs = {
                        ...inputs,
                        [item]: input[item]
                    };
                }
                if (prompt instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseStringPromptTemplate"]) {
                    const formatted = await prompt.format(inputs);
                    let additionalContentFields;
                    if ("additionalContentFields" in prompt) additionalContentFields = prompt.additionalContentFields;
                    if (formatted !== "") content.push({
                        ...additionalContentFields,
                        type: "text",
                        text: formatted
                    });
                } else if (prompt instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImagePromptTemplate"]) {
                    const formatted = await prompt.format(inputs);
                    let additionalContentFields;
                    if ("additionalContentFields" in prompt) additionalContentFields = prompt.additionalContentFields;
                    content.push({
                        ...additionalContentFields,
                        type: "image_url",
                        image_url: formatted
                    });
                } else if (prompt instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$dict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DictPromptTemplate"]) {
                    const formatted = await prompt.format(inputs);
                    let additionalContentFields;
                    if ("additionalContentFields" in prompt) additionalContentFields = prompt.additionalContentFields;
                    content.push({
                        ...additionalContentFields,
                        ...formatted
                    });
                }
            }
            return this.createMessage(content);
        }
    }
    async formatMessages(values) {
        return [
            await this.format(values)
        ];
    }
};
/**
* Class that represents a human message prompt template. It extends the
* BaseMessageStringPromptTemplate.
* @example
* ```typescript
* const message = HumanMessagePromptTemplate.fromTemplate("{text}");
* const formatted = await message.format({ text: "Hello world!" });
*
* const chatPrompt = ChatPromptTemplate.fromMessages([message]);
* const formattedChatPrompt = await chatPrompt.invoke({
*   text: "Hello world!",
* });
* ```
*/ var HumanMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
    static _messageClass() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"];
    }
    static lc_name() {
        return "HumanMessagePromptTemplate";
    }
};
/**
* Class that represents an AI message prompt template. It extends the
* BaseMessageStringPromptTemplate.
*/ var AIMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
    static _messageClass() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"];
    }
    static lc_name() {
        return "AIMessagePromptTemplate";
    }
};
/**
* Class that represents a system message prompt template. It extends the
* BaseMessageStringPromptTemplate.
* @example
* ```typescript
* const message = SystemMessagePromptTemplate.fromTemplate("{text}");
* const formatted = await message.format({ text: "Hello world!" });
*
* const chatPrompt = ChatPromptTemplate.fromMessages([message]);
* const formattedChatPrompt = await chatPrompt.invoke({
*   text: "Hello world!",
* });
* ```
*/ var SystemMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
    static _messageClass() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SystemMessage"];
    }
    static lc_name() {
        return "SystemMessagePromptTemplate";
    }
};
function _isBaseMessagePromptTemplate(baseMessagePromptTemplateLike) {
    return typeof baseMessagePromptTemplateLike.formatMessages === "function";
}
function _coerceMessagePromptTemplateLike(messagePromptTemplateLike, extra) {
    if (_isBaseMessagePromptTemplate(messagePromptTemplateLike) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseMessage"])(messagePromptTemplateLike)) return messagePromptTemplateLike;
    if (Array.isArray(messagePromptTemplateLike) && messagePromptTemplateLike[0] === "placeholder") {
        const messageContent = messagePromptTemplateLike[1];
        if (extra?.templateFormat === "mustache" && typeof messageContent === "string" && messageContent.slice(0, 2) === "{{" && messageContent.slice(-2) === "}}") return new MessagesPlaceholder({
            variableName: messageContent.slice(2, -2),
            optional: true
        });
        else if (typeof messageContent === "string" && messageContent[0] === "{" && messageContent[messageContent.length - 1] === "}") return new MessagesPlaceholder({
            variableName: messageContent.slice(1, -1),
            optional: true
        });
        throw new Error(`Invalid placeholder template for format ${extra?.templateFormat ?? `"f-string"`}: "${messagePromptTemplateLike[1]}". Expected a variable name surrounded by ${extra?.templateFormat === "mustache" ? "double" : "single"} curly braces.`);
    }
    const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"])(messagePromptTemplateLike);
    let templateData;
    if (typeof message.content === "string") templateData = message.content;
    else templateData = message.content.map((item)=>{
        if ("text" in item) return {
            ...item,
            text: item.text
        };
        else if ("image_url" in item) return {
            ...item,
            image_url: item.image_url
        };
        else return item;
    });
    if (message._getType() === "human") return HumanMessagePromptTemplate.fromTemplate(templateData, extra);
    else if (message._getType() === "ai") return AIMessagePromptTemplate.fromTemplate(templateData, extra);
    else if (message._getType() === "system") return SystemMessagePromptTemplate.fromTemplate(templateData, extra);
    else if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatMessage"].isInstance(message)) return ChatMessagePromptTemplate.fromTemplate(message.content, message.role, extra);
    else throw new Error(`Could not coerce message prompt template from input. Received message type: "${message._getType()}".`);
}
function isMessagesPlaceholder(x) {
    return x.constructor.lc_name() === "MessagesPlaceholder";
}
/**
* Class that represents a chat prompt. It extends the
* BaseChatPromptTemplate and uses an array of BaseMessagePromptTemplate
* instances to format a series of messages for a conversation.
* @example
* ```typescript
* const message = SystemMessagePromptTemplate.fromTemplate("{text}");
* const chatPrompt = ChatPromptTemplate.fromMessages([
*   ["ai", "You are a helpful assistant."],
*   message,
* ]);
* const formattedChatPrompt = await chatPrompt.invoke({
*   text: "Hello world!",
* });
* ```
*/ var ChatPromptTemplate = class ChatPromptTemplate extends BaseChatPromptTemplate {
    static lc_name() {
        return "ChatPromptTemplate";
    }
    get lc_aliases() {
        return {
            promptMessages: "messages"
        };
    }
    promptMessages;
    validateTemplate = true;
    templateFormat = "f-string";
    constructor(input){
        super(input);
        if (input.templateFormat === "mustache" && input.validateTemplate === void 0) this.validateTemplate = false;
        Object.assign(this, input);
        if (this.validateTemplate) {
            const inputVariablesMessages = /* @__PURE__ */ new Set();
            for (const promptMessage of this.promptMessages){
                if (promptMessage instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessage"]) continue;
                for (const inputVariable of promptMessage.inputVariables)inputVariablesMessages.add(inputVariable);
            }
            const totalInputVariables = this.inputVariables;
            const inputVariablesInstance = new Set(this.partialVariables ? totalInputVariables.concat(Object.keys(this.partialVariables)) : totalInputVariables);
            const difference = new Set([
                ...inputVariablesInstance
            ].filter((x)=>!inputVariablesMessages.has(x)));
            if (difference.size > 0) throw new Error(`Input variables \`${[
                ...difference
            ]}\` are not used in any of the prompt messages.`);
            const otherDifference = new Set([
                ...inputVariablesMessages
            ].filter((x)=>!inputVariablesInstance.has(x)));
            if (otherDifference.size > 0) throw new Error(`Input variables \`${[
                ...otherDifference
            ]}\` are used in prompt messages but not in the prompt template.`);
        }
    }
    _getPromptType() {
        return "chat";
    }
    async _parseImagePrompts(message, inputValues) {
        if (typeof message.content === "string") return message;
        message.content = await Promise.all(message.content.map(async (item)=>{
            if (item.type !== "image_url") return item;
            let imageUrl = "";
            if (typeof item.image_url === "string") imageUrl = item.image_url;
            else if (typeof item.image_url === "object" && item.image_url !== null && "url" in item.image_url && typeof item.image_url.url === "string") imageUrl = item.image_url.url;
            const formattedUrl = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(imageUrl, {
                templateFormat: this.templateFormat
            }).format(inputValues);
            if (typeof item.image_url === "object" && item.image_url !== null && "url" in item.image_url) item.image_url.url = formattedUrl;
            else item.image_url = formattedUrl;
            return item;
        }));
        return message;
    }
    async formatMessages(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        let resultMessages = [];
        for (const promptMessage of this.promptMessages)if (promptMessage instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessage"]) resultMessages.push(await this._parseImagePrompts(promptMessage, allValues));
        else {
            let inputValues;
            if (this.templateFormat === "mustache") inputValues = {
                ...allValues
            };
            else inputValues = promptMessage.inputVariables.reduce((acc, inputVariable)=>{
                if (!(inputVariable in allValues) && !(isMessagesPlaceholder(promptMessage) && promptMessage.optional)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addLangChainErrorFields"])(/* @__PURE__ */ new Error(`Missing value for input variable \`${inputVariable.toString()}\``), "INVALID_PROMPT_INPUT");
                acc[inputVariable] = allValues[inputVariable];
                return acc;
            }, {});
            const message = await promptMessage.formatMessages(inputValues);
            resultMessages = resultMessages.concat(message);
        }
        return resultMessages;
    }
    async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv)=>!(iv in values));
        const newPartialVariables = {
            ...this.partialVariables ?? {},
            ...values
        };
        const promptDict = {
            ...this,
            inputVariables: newInputVariables,
            partialVariables: newPartialVariables
        };
        return new ChatPromptTemplate(promptDict);
    }
    static fromTemplate(template, options) {
        const humanTemplate = new HumanMessagePromptTemplate({
            prompt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(template, options)
        });
        return this.fromMessages([
            humanTemplate
        ]);
    }
    /**
	* Create a chat model-specific prompt from individual chat messages
	* or message-like tuples.
	* @param promptMessages Messages to be passed to the chat model
	* @returns A new ChatPromptTemplate
	*/ static fromMessages(promptMessages, extra) {
        const flattenedMessages = promptMessages.reduce((acc, promptMessage)=>acc.concat(promptMessage instanceof ChatPromptTemplate ? promptMessage.promptMessages : [
                _coerceMessagePromptTemplateLike(promptMessage, extra)
            ]), []);
        const flattenedPartialVariables = promptMessages.reduce((acc, promptMessage)=>promptMessage instanceof ChatPromptTemplate ? Object.assign(acc, promptMessage.partialVariables) : acc, Object.create(null));
        const inputVariables = /* @__PURE__ */ new Set();
        for (const promptMessage of flattenedMessages){
            if (promptMessage instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessage"]) continue;
            for (const inputVariable of promptMessage.inputVariables){
                if (inputVariable in flattenedPartialVariables) continue;
                inputVariables.add(inputVariable);
            }
        }
        return new this({
            ...extra,
            inputVariables: [
                ...inputVariables
            ],
            promptMessages: flattenedMessages,
            partialVariables: flattenedPartialVariables,
            templateFormat: extra?.templateFormat
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/few_shot.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FewShotChatMessagePromptTemplate",
    ()=>FewShotChatMessagePromptTemplate,
    "FewShotPromptTemplate",
    ()=>FewShotPromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/template.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/prompt.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/chat.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/prompts/few_shot.ts
/**
* Prompt template that contains few-shot examples.
* @augments BasePromptTemplate
* @augments FewShotPromptTemplateInput
* @example
* ```typescript
* const examplePrompt = PromptTemplate.fromTemplate(
*   "Input: {input}\nOutput: {output}",
* );
*
* const exampleSelector = await SemanticSimilarityExampleSelector.fromExamples(
*   [
*     { input: "happy", output: "sad" },
*     { input: "tall", output: "short" },
*     { input: "energetic", output: "lethargic" },
*     { input: "sunny", output: "gloomy" },
*     { input: "windy", output: "calm" },
*   ],
*   new OpenAIEmbeddings(),
*   HNSWLib,
*   { k: 1 },
* );
*
* const dynamicPrompt = new FewShotPromptTemplate({
*   exampleSelector,
*   examplePrompt,
*   prefix: "Give the antonym of every input",
*   suffix: "Input: {adjective}\nOutput:",
*   inputVariables: ["adjective"],
* });
*
* // Format the dynamic prompt with the input 'rainy'
* console.log(await dynamicPrompt.format({ adjective: "rainy" }));
*
* ```
*/ var FewShotPromptTemplate = class FewShotPromptTemplate extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseStringPromptTemplate"] {
    lc_serializable = false;
    examples;
    exampleSelector;
    examplePrompt;
    suffix = "";
    exampleSeparator = "\n\n";
    prefix = "";
    templateFormat = "f-string";
    validateTemplate = true;
    constructor(input){
        super(input);
        Object.assign(this, input);
        if (this.examples !== void 0 && this.exampleSelector !== void 0) throw new Error("Only one of 'examples' and 'example_selector' should be provided");
        if (this.examples === void 0 && this.exampleSelector === void 0) throw new Error("One of 'examples' and 'example_selector' should be provided");
        if (this.validateTemplate) {
            let totalInputVariables = this.inputVariables;
            if (this.partialVariables) totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkValidTemplate"])(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
        }
    }
    _getPromptType() {
        return "few_shot";
    }
    static lc_name() {
        return "FewShotPromptTemplate";
    }
    async getExamples(inputVariables) {
        if (this.examples !== void 0) return this.examples;
        if (this.exampleSelector !== void 0) return this.exampleSelector.selectExamples(inputVariables);
        throw new Error("One of 'examples' and 'example_selector' should be provided");
    }
    async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv)=>!(iv in values));
        const newPartialVariables = {
            ...this.partialVariables ?? {},
            ...values
        };
        const promptDict = {
            ...this,
            inputVariables: newInputVariables,
            partialVariables: newPartialVariables
        };
        return new FewShotPromptTemplate(promptDict);
    }
    /**
	* Formats the prompt with the given values.
	* @param values The values to format the prompt with.
	* @returns A promise that resolves to a string representing the formatted prompt.
	*/ async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        const examples = await this.getExamples(allValues);
        const exampleStrings = await Promise.all(examples.map((example)=>this.examplePrompt.format(example)));
        const template = [
            this.prefix,
            ...exampleStrings,
            this.suffix
        ].join(this.exampleSeparator);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTemplate"])(template, this.templateFormat, allValues);
    }
    serialize() {
        if (this.exampleSelector || !this.examples) throw new Error("Serializing an example selector is not currently supported");
        if (this.outputParser !== void 0) throw new Error("Serializing an output parser is not currently supported");
        return {
            _type: this._getPromptType(),
            input_variables: this.inputVariables,
            example_prompt: this.examplePrompt.serialize(),
            example_separator: this.exampleSeparator,
            suffix: this.suffix,
            prefix: this.prefix,
            template_format: this.templateFormat,
            examples: this.examples
        };
    }
    static async deserialize(data) {
        const { example_prompt } = data;
        if (!example_prompt) throw new Error("Missing example prompt");
        const examplePrompt = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"].deserialize(example_prompt);
        let examples;
        if (Array.isArray(data.examples)) examples = data.examples;
        else throw new Error("Invalid examples format. Only list or string are supported.");
        return new FewShotPromptTemplate({
            inputVariables: data.input_variables,
            examplePrompt,
            examples,
            exampleSeparator: data.example_separator,
            prefix: data.prefix,
            suffix: data.suffix,
            templateFormat: data.template_format
        });
    }
};
/**
* Chat prompt template that contains few-shot examples.
* @augments BasePromptTemplateInput
* @augments FewShotChatMessagePromptTemplateInput
*/ var FewShotChatMessagePromptTemplate = class FewShotChatMessagePromptTemplate extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseChatPromptTemplate"] {
    lc_serializable = true;
    examples;
    exampleSelector;
    examplePrompt;
    suffix = "";
    exampleSeparator = "\n\n";
    prefix = "";
    templateFormat = "f-string";
    validateTemplate = true;
    _getPromptType() {
        return "few_shot_chat";
    }
    static lc_name() {
        return "FewShotChatMessagePromptTemplate";
    }
    constructor(fields){
        super(fields);
        this.examples = fields.examples;
        this.examplePrompt = fields.examplePrompt;
        this.exampleSeparator = fields.exampleSeparator ?? "\n\n";
        this.exampleSelector = fields.exampleSelector;
        this.prefix = fields.prefix ?? "";
        this.suffix = fields.suffix ?? "";
        this.templateFormat = fields.templateFormat ?? "f-string";
        this.validateTemplate = fields.validateTemplate ?? true;
        if (this.examples !== void 0 && this.exampleSelector !== void 0) throw new Error("Only one of 'examples' and 'example_selector' should be provided");
        if (this.examples === void 0 && this.exampleSelector === void 0) throw new Error("One of 'examples' and 'example_selector' should be provided");
        if (this.validateTemplate) {
            let totalInputVariables = this.inputVariables;
            if (this.partialVariables) totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkValidTemplate"])(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
        }
    }
    async getExamples(inputVariables) {
        if (this.examples !== void 0) return this.examples;
        if (this.exampleSelector !== void 0) return this.exampleSelector.selectExamples(inputVariables);
        throw new Error("One of 'examples' and 'example_selector' should be provided");
    }
    /**
	* Formats the list of values and returns a list of formatted messages.
	* @param values The values to format the prompt with.
	* @returns A promise that resolves to a string representing the formatted prompt.
	*/ async formatMessages(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        let examples = await this.getExamples(allValues);
        examples = examples.map((example)=>{
            const result = {};
            this.examplePrompt.inputVariables.forEach((inputVariable)=>{
                result[inputVariable] = example[inputVariable];
            });
            return result;
        });
        const messages = [];
        for (const example of examples){
            const exampleMessages = await this.examplePrompt.formatMessages(example);
            messages.push(...exampleMessages);
        }
        return messages;
    }
    /**
	* Formats the prompt with the given values.
	* @param values The values to format the prompt with.
	* @returns A promise that resolves to a string representing the formatted prompt.
	*/ async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        const examples = await this.getExamples(allValues);
        const exampleStrings = (await Promise.all(examples.map((example)=>this.examplePrompt.formatMessages(example)))).flat().map((message)=>message.content);
        const template = [
            this.prefix,
            ...exampleStrings,
            this.suffix
        ].join(this.exampleSeparator);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTemplate"])(template, this.templateFormat, allValues);
    }
    /**
	* Partially formats the prompt with the given values.
	* @param values The values to partially format the prompt with.
	* @returns A promise that resolves to an instance of `FewShotChatMessagePromptTemplate` with the given values partially formatted.
	*/ async partial(values) {
        const newInputVariables = this.inputVariables.filter((variable)=>!(variable in values));
        const newPartialVariables = {
            ...this.partialVariables ?? {},
            ...values
        };
        const promptDict = {
            ...this,
            inputVariables: newInputVariables,
            partialVariables: newPartialVariables
        };
        return new FewShotChatMessagePromptTemplate(promptDict);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/pipeline.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PipelinePromptTemplate",
    ()=>PipelinePromptTemplate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/chat.js [app-rsc] (ecmascript)");
;
;
//#region src/prompts/pipeline.ts
/**
* Class that handles a sequence of prompts, each of which may require
* different input variables. Includes methods for formatting these
* prompts, extracting required input values, and handling partial
* prompts.
* @example
* ```typescript
* const composedPrompt = new PipelinePromptTemplate({
*   pipelinePrompts: [
*     {
*       name: "introduction",
*       prompt: PromptTemplate.fromTemplate(`You are impersonating {person}.`),
*     },
*     {
*       name: "example",
*       prompt: PromptTemplate.fromTemplate(
*         `Here's an example of an interaction:
* Q: {example_q}
* A: {example_a}`,
*       ),
*     },
*     {
*       name: "start",
*       prompt: PromptTemplate.fromTemplate(
*         `Now, do this for real!
* Q: {input}
* A:`,
*       ),
*     },
*   ],
*   finalPrompt: PromptTemplate.fromTemplate(
*     `{introduction}
* {example}
* {start}`,
*   ),
* });
*
* const formattedPrompt = await composedPrompt.format({
*   person: "Elon Musk",
*   example_q: `What's your favorite car?`,
*   example_a: "Tesla",
*   input: `What's your favorite social media site?`,
* });
* ```
*/ var PipelinePromptTemplate = class PipelinePromptTemplate extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BasePromptTemplate"] {
    static lc_name() {
        return "PipelinePromptTemplate";
    }
    pipelinePrompts;
    finalPrompt;
    constructor(input){
        super({
            ...input,
            inputVariables: []
        });
        this.pipelinePrompts = input.pipelinePrompts;
        this.finalPrompt = input.finalPrompt;
        this.inputVariables = this.computeInputValues();
    }
    /**
	* Computes the input values required by the pipeline prompts.
	* @returns Array of input values required by the pipeline prompts.
	*/ computeInputValues() {
        const intermediateValues = this.pipelinePrompts.map((pipelinePrompt)=>pipelinePrompt.name);
        const inputValues = this.pipelinePrompts.map((pipelinePrompt)=>pipelinePrompt.prompt.inputVariables.filter((inputValue)=>!intermediateValues.includes(inputValue))).flat();
        return [
            ...new Set(inputValues)
        ];
    }
    static extractRequiredInputValues(allValues, requiredValueNames) {
        return requiredValueNames.reduce((requiredValues, valueName)=>{
            requiredValues[valueName] = allValues[valueName];
            return requiredValues;
        }, {});
    }
    /**
	* Formats the pipeline prompts based on the provided input values.
	* @param values Input values to format the pipeline prompts.
	* @returns Promise that resolves with the formatted input values.
	*/ async formatPipelinePrompts(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        for (const { name: pipelinePromptName, prompt: pipelinePrompt } of this.pipelinePrompts){
            const pipelinePromptInputValues = PipelinePromptTemplate.extractRequiredInputValues(allValues, pipelinePrompt.inputVariables);
            if (pipelinePrompt instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatPromptTemplate"]) allValues[pipelinePromptName] = await pipelinePrompt.formatMessages(pipelinePromptInputValues);
            else allValues[pipelinePromptName] = await pipelinePrompt.format(pipelinePromptInputValues);
        }
        return PipelinePromptTemplate.extractRequiredInputValues(allValues, this.finalPrompt.inputVariables);
    }
    /**
	* Formats the final prompt value based on the provided input values.
	* @param values Input values to format the final prompt value.
	* @returns Promise that resolves with the formatted final prompt value.
	*/ async formatPromptValue(values) {
        return this.finalPrompt.formatPromptValue(await this.formatPipelinePrompts(values));
    }
    async format(values) {
        return this.finalPrompt.format(await this.formatPipelinePrompts(values));
    }
    /**
	* Handles partial prompts, which are prompts that have been partially
	* filled with input values.
	* @param values Partial input values.
	* @returns Promise that resolves with a new PipelinePromptTemplate instance with updated input variables.
	*/ async partial(values) {
        const promptDict = {
            ...this
        };
        promptDict.inputVariables = this.inputVariables.filter((iv)=>!(iv in values));
        promptDict.partialVariables = {
            ...this.partialVariables ?? {},
            ...values
        };
        return new PipelinePromptTemplate(promptDict);
    }
    serialize() {
        throw new Error("Not implemented.");
    }
    _getPromptType() {
        return "pipeline";
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/structured.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StructuredPrompt",
    ()=>StructuredPrompt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/chat.js [app-rsc] (ecmascript)");
;
;
//#region src/prompts/structured.ts
function isWithStructuredOutput(x) {
    return typeof x === "object" && x != null && "withStructuredOutput" in x && typeof x.withStructuredOutput === "function";
}
function isRunnableBinding(x) {
    return typeof x === "object" && x != null && "lc_id" in x && Array.isArray(x.lc_id) && x.lc_id.join("/") === "langchain_core/runnables/RunnableBinding";
}
var StructuredPrompt = class StructuredPrompt extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatPromptTemplate"] {
    schema;
    method;
    lc_namespace = [
        "langchain_core",
        "prompts",
        "structured"
    ];
    get lc_aliases() {
        return {
            ...super.lc_aliases,
            schema: "schema_"
        };
    }
    constructor(input){
        super(input);
        this.schema = input.schema;
        this.method = input.method;
    }
    pipe(coerceable) {
        if (isWithStructuredOutput(coerceable)) return super.pipe(coerceable.withStructuredOutput(this.schema));
        if (isRunnableBinding(coerceable) && isWithStructuredOutput(coerceable.bound)) return super.pipe(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunnableBinding"]({
            bound: coerceable.bound.withStructuredOutput(this.schema, ...this.method ? [
                {
                    method: this.method
                }
            ] : []),
            kwargs: coerceable.kwargs ?? {},
            config: coerceable.config,
            configFactories: coerceable.configFactories
        }));
        throw new Error(`Structured prompts need to be piped to a language model that supports the "withStructuredOutput()" method.`);
    }
    static fromMessagesAndSchema(promptMessages, schema, method) {
        return StructuredPrompt.fromMessages(promptMessages, {
            schema,
            method
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prompts_exports",
    ()=>prompts_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/template.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/prompt.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$dict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/dict.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/chat.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$few_shot$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/few_shot.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$pipeline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/pipeline.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/prompts/structured.js [app-rsc] (ecmascript)");
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
//#region src/prompts/index.ts
var prompts_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    AIMessagePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessagePromptTemplate"],
    BaseChatPromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseChatPromptTemplate"],
    BaseMessagePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessagePromptTemplate"],
    BaseMessageStringPromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessageStringPromptTemplate"],
    BasePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BasePromptTemplate"],
    BaseStringPromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseStringPromptTemplate"],
    ChatMessagePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatMessagePromptTemplate"],
    ChatPromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatPromptTemplate"],
    DEFAULT_FORMATTER_MAPPING: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_FORMATTER_MAPPING"],
    DEFAULT_PARSER_MAPPING: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_PARSER_MAPPING"],
    DictPromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$dict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DictPromptTemplate"],
    FewShotChatMessagePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$few_shot$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FewShotChatMessagePromptTemplate"],
    FewShotPromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$few_shot$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FewShotPromptTemplate"],
    HumanMessagePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessagePromptTemplate"],
    ImagePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImagePromptTemplate"],
    MessagesPlaceholder: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MessagesPlaceholder"],
    PipelinePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$pipeline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PipelinePromptTemplate"],
    PromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PromptTemplate"],
    StructuredPrompt: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StructuredPrompt"],
    SystemMessagePromptTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$chat$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SystemMessagePromptTemplate"],
    checkValidTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkValidTemplate"],
    interpolateFString: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interpolateFString"],
    interpolateMustache: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interpolateMustache"],
    parseFString: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseFString"],
    parseMustache: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseMustache"],
    parseTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseTemplate"],
    renderTemplate: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$template$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderTemplate"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/retrievers/document_compressors/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseDocumentCompressor",
    ()=>BaseDocumentCompressor,
    "document_compressors_exports",
    ()=>document_compressors_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/retrievers/document_compressors/index.ts
var document_compressors_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseDocumentCompressor: ()=>BaseDocumentCompressor
});
/**
* Base Document Compression class. All compressors should extend this class.
*/ var BaseDocumentCompressor = class {
    static isBaseDocumentCompressor(x) {
        return x?.compressDocuments !== void 0;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/retrievers/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseRetriever",
    ()=>BaseRetriever,
    "retrievers_exports",
    ()=>retrievers_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/retrievers/index.ts
var retrievers_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseRetriever: ()=>BaseRetriever
});
/**
* Abstract base class for a document retrieval system, designed to
* process string queries and return the most relevant documents from a source.
*
* `BaseRetriever` provides common properties and methods for derived retrievers,
* such as callbacks, tagging, and verbose logging. Custom retrieval systems
* should extend this class and implement `_getRelevantDocuments` to define
* the specific retrieval logic.
*
* @template Metadata - The type of metadata associated with each document,
*                      defaulting to `Record<string, any>`.
*/ var BaseRetriever = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    /**
	* Optional callbacks to handle various events in the retrieval process.
	*/ callbacks;
    /**
	* Tags to label or categorize the retrieval operation.
	*/ tags;
    /**
	* Metadata to provide additional context or information about the retrieval
	* operation.
	*/ metadata;
    /**
	* If set to `true`, enables verbose logging for the retrieval process.
	*/ verbose;
    /**
	* Constructs a new `BaseRetriever` instance with optional configuration fields.
	*
	* @param fields - Optional input configuration that can include `callbacks`,
	*                 `tags`, `metadata`, and `verbose` settings for custom retriever behavior.
	*/ constructor(fields){
        super(fields);
        this.callbacks = fields?.callbacks;
        this.tags = fields?.tags ?? [];
        this.metadata = fields?.metadata ?? {};
        this.verbose = fields?.verbose ?? false;
    }
    /**
	* TODO: This should be an abstract method, but we'd like to avoid breaking
	* changes to people currently using subclassed custom retrievers.
	* Change it on next major release.
	*/ /**
	* Placeholder method for retrieving relevant documents based on a query.
	*
	* This method is intended to be implemented by subclasses and will be
	* converted to an abstract method in the next major release. Currently, it
	* throws an error if not implemented, ensuring that custom retrievers define
	* the specific retrieval logic.
	*
	* @param _query - The query string used to search for relevant documents.
	* @param _callbacks - (optional) Callback manager for managing callbacks
	*                     during retrieval.
	* @returns A promise resolving to an array of `DocumentInterface` instances relevant to the query.
	* @throws {Error} Throws an error indicating the method is not implemented.
	*/ _getRelevantDocuments(_query, _callbacks) {
        throw new Error("Not implemented!");
    }
    /**
	* Executes a retrieval operation.
	*
	* @param input - The query string used to search for relevant documents.
	* @param options - (optional) Configuration options for the retrieval run,
	*                  which may include callbacks, tags, and metadata.
	* @returns A promise that resolves to an array of `DocumentInterface` instances
	*          representing the most relevant documents to the query.
	*/ async invoke(input, options) {
        const parsedConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureConfig"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCallbackConfigArg"])(options));
        const runManager = await (await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(parsedConfig.callbacks, this.callbacks, parsedConfig.tags, this.tags, parsedConfig.metadata, this.metadata, {
            verbose: this.verbose
        }))?.handleRetrieverStart(this.toJSON(), input, parsedConfig.runId, void 0, void 0, void 0, parsedConfig.runName);
        try {
            const results = await this._getRelevantDocuments(input, runManager);
            await runManager?.handleRetrieverEnd(results);
            return results;
        } catch (error) {
            await runManager?.handleRetrieverError(error);
            throw error;
        }
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/stores.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseStore",
    ()=>BaseStore,
    "InMemoryStore",
    ()=>InMemoryStore,
    "stores_exports",
    ()=>stores_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
;
;
//#region src/stores.ts
var stores_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseStore: ()=>BaseStore,
    InMemoryStore: ()=>InMemoryStore
});
/**
* Abstract interface for a key-value store.
*/ var BaseStore = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
};
/**
* In-memory implementation of the BaseStore using a dictionary. Used for
* storing key-value pairs in memory.
* @example
* ```typescript
* const store = new InMemoryStore<BaseMessage>();
* await store.mset(
*   Array.from({ length: 5 }).map((_, index) => [
*     `message:id:${index}`,
*     index % 2 === 0
*       ? new AIMessage("ai stuff...")
*       : new HumanMessage("human stuff..."),
*   ]),
* );
*
* const retrievedMessages = await store.mget(["message:id:0", "message:id:1"]);
* await store.mdelete(await store.yieldKeys("message:id:").toArray());
* ```
*/ var InMemoryStore = class extends BaseStore {
    lc_namespace = [
        "langchain",
        "storage"
    ];
    store = {};
    /**
	* Retrieves the values associated with the given keys from the store.
	* @param keys Keys to retrieve values for.
	* @returns Array of values associated with the given keys.
	*/ async mget(keys) {
        return keys.map((key)=>this.store[key]);
    }
    /**
	* Sets the values for the given keys in the store.
	* @param keyValuePairs Array of key-value pairs to set in the store.
	* @returns Promise that resolves when all key-value pairs have been set.
	*/ async mset(keyValuePairs) {
        for (const [key, value] of keyValuePairs)this.store[key] = value;
    }
    /**
	* Deletes the given keys and their associated values from the store.
	* @param keys Keys to delete from the store.
	* @returns Promise that resolves when all keys have been deleted.
	*/ async mdelete(keys) {
        for (const key of keys)delete this.store[key];
    }
    /**
	* Asynchronous generator that yields keys from the store. If a prefix is
	* provided, it only yields keys that start with the prefix.
	* @param prefix Optional prefix to filter keys.
	* @returns AsyncGenerator that yields keys from the store.
	*/ async *yieldKeys(prefix) {
        const keys = Object.keys(this.store);
        for (const key of keys)if (prefix === void 0 || key.startsWith(prefix)) yield key;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/ir.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Comparators",
    ()=>Comparators,
    "Comparison",
    ()=>Comparison,
    "Expression",
    ()=>Expression,
    "FilterDirective",
    ()=>FilterDirective,
    "Operation",
    ()=>Operation,
    "Operators",
    ()=>Operators,
    "StructuredQuery",
    ()=>StructuredQuery,
    "Visitor",
    ()=>Visitor
]);
//#region src/structured_query/ir.ts
const Operators = {
    and: "and",
    or: "or",
    not: "not"
};
const Comparators = {
    eq: "eq",
    ne: "ne",
    lt: "lt",
    gt: "gt",
    lte: "lte",
    gte: "gte"
};
/**
* Abstract class for visiting expressions. Subclasses must implement
* visitOperation, visitComparison, and visitStructuredQuery methods.
*/ var Visitor = class {
};
/**
* Abstract class representing an expression. Subclasses must implement
* the exprName property and the accept method.
*/ var Expression = class {
    accept(visitor) {
        if (this.exprName === "Operation") return visitor.visitOperation(this);
        else if (this.exprName === "Comparison") return visitor.visitComparison(this);
        else if (this.exprName === "StructuredQuery") return visitor.visitStructuredQuery(this);
        else throw new Error("Unknown Expression type");
    }
};
/**
* Abstract class representing a filter directive. It extends the
* Expression class.
*/ var FilterDirective = class extends Expression {
};
/**
* Class representing a comparison filter directive. It extends the
* FilterDirective class.
*/ var Comparison = class extends FilterDirective {
    comparator;
    attribute;
    value;
    exprName = "Comparison";
    constructor(comparator, attribute, value){
        super();
        this.comparator = comparator;
        this.attribute = attribute;
        this.value = value;
    }
};
/**
* Class representing an operation filter directive. It extends the
* FilterDirective class.
*/ var Operation = class extends FilterDirective {
    operator;
    args;
    exprName = "Operation";
    constructor(operator, args){
        super();
        this.operator = operator;
        this.args = args;
    }
};
/**
* Class representing a structured query expression. It extends the
* Expression class.
*/ var StructuredQuery = class extends Expression {
    query;
    filter;
    exprName = "StructuredQuery";
    constructor(query, filter){
        super();
        this.query = query;
        this.filter = filter;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/utils.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "castValue",
    ()=>castValue,
    "isBoolean",
    ()=>isBoolean,
    "isFilterEmpty",
    ()=>isFilterEmpty,
    "isFloat",
    ()=>isFloat,
    "isInt",
    ()=>isInt,
    "isObject",
    ()=>isObject,
    "isString",
    ()=>isString
]);
//#region src/structured_query/utils.ts
/**
* Checks if the provided argument is an object and not an array.
*/ function isObject(obj) {
    return obj && typeof obj === "object" && !Array.isArray(obj);
}
/**
* Checks if a provided filter is empty. The filter can be a function, an
* object, a string, or undefined.
*/ function isFilterEmpty(filter) {
    if (!filter) return true;
    if (typeof filter === "string" && filter.length > 0) return false;
    if (typeof filter === "function") return false;
    return isObject(filter) && Object.keys(filter).length === 0;
}
/**
* Checks if the provided value is an integer.
*/ function isInt(value) {
    if (typeof value === "number") return value % 1 === 0;
    else if (typeof value === "string") {
        const numberValue = parseInt(value, 10);
        return !Number.isNaN(numberValue) && numberValue % 1 === 0 && numberValue.toString() === value;
    }
    return false;
}
/**
* Checks if the provided value is a floating-point number.
*/ function isFloat(value) {
    if (typeof value === "number") return value % 1 !== 0;
    else if (typeof value === "string") {
        const numberValue = parseFloat(value);
        return !Number.isNaN(numberValue) && numberValue % 1 !== 0 && numberValue.toString() === value;
    }
    return false;
}
/**
* Checks if the provided value is a string that cannot be parsed into a
* number.
*/ function isString(value) {
    return typeof value === "string" && (Number.isNaN(parseFloat(value)) || parseFloat(value).toString() !== value);
}
/**
* Checks if the provided value is a boolean.
*/ function isBoolean(value) {
    return typeof value === "boolean";
}
/**
* Casts a value that might be string or number to actual string or number.
* Since LLM might return back an integer/float as a string, we need to cast
* it back to a number, as many vector databases can't handle number as string
* values as a comparator.
*/ function castValue(input) {
    let value;
    if (isString(input)) value = input;
    else if (isInt(input)) value = parseInt(input, 10);
    else if (isFloat(input)) value = parseFloat(input);
    else if (isBoolean(input)) value = Boolean(input);
    else throw new Error("Unsupported value type");
    return value;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseTranslator",
    ()=>BaseTranslator,
    "BasicTranslator",
    ()=>BasicTranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/ir.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/utils.js [app-rsc] (ecmascript)");
;
;
//#region src/structured_query/base.ts
/**
* Abstract class that provides a blueprint for creating specific
* translator classes. Defines two abstract methods: formatFunction and
* mergeFilters.
*/ var BaseTranslator = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Visitor"] {
};
/**
* Class that extends the BaseTranslator class and provides concrete
* implementations for the abstract methods. Also declares three types:
* VisitOperationOutput, VisitComparisonOutput, and
* VisitStructuredQueryOutput, which are used as the return types for the
* visitOperation, visitComparison, and visitStructuredQuery methods
* respectively.
*/ var BasicTranslator = class extends BaseTranslator {
    allowedOperators;
    allowedComparators;
    constructor(opts){
        super();
        this.allowedOperators = opts?.allowedOperators ?? [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"].and,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"].or
        ];
        this.allowedComparators = opts?.allowedComparators ?? [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].eq,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].ne,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gt,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gte,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lt,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lte
        ];
    }
    formatFunction(func) {
        if (func in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"]) {
            if (this.allowedComparators.length > 0 && this.allowedComparators.indexOf(func) === -1) throw new Error(`Comparator ${func} not allowed. Allowed comparators: ${this.allowedComparators.join(", ")}`);
        } else if (func in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"]) {
            if (this.allowedOperators.length > 0 && this.allowedOperators.indexOf(func) === -1) throw new Error(`Operator ${func} not allowed. Allowed operators: ${this.allowedOperators.join(", ")}`);
        } else throw new Error("Unknown comparator or operator");
        return `$${func}`;
    }
    /**
	* Visits an operation and returns a result.
	* @param operation The operation to visit.
	* @returns The result of visiting the operation.
	*/ visitOperation(operation) {
        const args = operation.args?.map((arg)=>arg.accept(this));
        return {
            [this.formatFunction(operation.operator)]: args
        };
    }
    /**
	* Visits a comparison and returns a result.
	* @param comparison The comparison to visit.
	* @returns The result of visiting the comparison.
	*/ visitComparison(comparison) {
        return {
            [comparison.attribute]: {
                [this.formatFunction(comparison.comparator)]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["castValue"])(comparison.value)
            }
        };
    }
    /**
	* Visits a structured query and returns a result.
	* @param query The structured query to visit.
	* @returns The result of visiting the structured query.
	*/ visitStructuredQuery(query) {
        let nextArg = {};
        if (query.filter) nextArg = {
            filter: query.filter.accept(this)
        };
        return nextArg;
    }
    mergeFilters(defaultFilter, generatedFilter, mergeType = "and", forceDefaultFilter = false) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(defaultFilter) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(generatedFilter)) return;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(defaultFilter) || mergeType === "replace") {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(generatedFilter)) return;
            return generatedFilter;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(generatedFilter)) {
            if (forceDefaultFilter) return defaultFilter;
            if (mergeType === "and") return;
            return defaultFilter;
        }
        if (mergeType === "and") return {
            $and: [
                defaultFilter,
                generatedFilter
            ]
        };
        else if (mergeType === "or") return {
            $or: [
                defaultFilter,
                generatedFilter
            ]
        };
        else throw new Error("Unknown merge type");
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/functional.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FunctionalTranslator",
    ()=>FunctionalTranslator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/ir.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/base.js [app-rsc] (ecmascript)");
;
;
;
//#region src/structured_query/functional.ts
/**
* A class that extends `BaseTranslator` to translate structured queries
* into functional filters.
* @example
* ```typescript
* const functionalTranslator = new FunctionalTranslator();
* const relevantDocuments = await functionalTranslator.getRelevantDocuments(
*   "Which movies are rated higher than 8.5?",
* );
* ```
*/ var FunctionalTranslator = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTranslator"] {
    allowedOperators = [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"].and,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"].or
    ];
    allowedComparators = [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].eq,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].ne,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gt,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gte,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lt,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lte
    ];
    formatFunction() {
        throw new Error("Not implemented");
    }
    /**
	* Returns the allowed comparators for a given data type.
	* @param input The input value to get the allowed comparators for.
	* @returns An array of allowed comparators for the input data type.
	*/ getAllowedComparatorsForType(inputType) {
        switch(inputType){
            case "string":
                return [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].eq,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].ne,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gt,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gte,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lt,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lte
                ];
            case "number":
                return [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].eq,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].ne,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gt,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gte,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lt,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lte
                ];
            case "boolean":
                return [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].eq,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].ne
                ];
            default:
                throw new Error(`Unsupported data type: ${inputType}`);
        }
    }
    /**
	* Returns a function that performs a comparison based on the provided
	* comparator.
	* @param comparator The comparator to base the comparison function on.
	* @returns A function that takes two arguments and returns a boolean based on the comparison.
	*/ getComparatorFunction(comparator) {
        switch(comparator){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].eq:
                return (a, b)=>a === b;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].ne:
                return (a, b)=>a !== b;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gt:
                return (a, b)=>a > b;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].gte:
                return (a, b)=>a >= b;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lt:
                return (a, b)=>a < b;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].lte:
                return (a, b)=>a <= b;
            default:
                throw new Error("Unknown comparator");
        }
    }
    /**
	* Returns a function that performs an operation based on the provided
	* operator.
	* @param operator The operator to base the operation function on.
	* @returns A function that takes two boolean arguments and returns a boolean based on the operation.
	*/ getOperatorFunction(operator) {
        switch(operator){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"].and:
                return (a, b)=>a && b;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"].or:
                return (a, b)=>a || b;
            default:
                throw new Error("Unknown operator");
        }
    }
    /**
	* Visits the operation part of a structured query and translates it into
	* a functional filter.
	* @param operation The operation part of a structured query.
	* @returns A function that takes a `Document` as an argument and returns a boolean based on the operation.
	*/ visitOperation(operation) {
        const { operator, args } = operation;
        if (this.allowedOperators.includes(operator)) {
            const operatorFunction = this.getOperatorFunction(operator);
            return (document)=>{
                if (!args) return true;
                return args.reduce((acc, arg)=>{
                    const result = arg.accept(this);
                    if (typeof result === "function") return operatorFunction(acc, result(document));
                    else throw new Error("Filter is not a function");
                }, true);
            };
        } else throw new Error("Operator not allowed");
    }
    /**
	* Visits the comparison part of a structured query and translates it into
	* a functional filter.
	* @param comparison The comparison part of a structured query.
	* @returns A function that takes a `Document` as an argument and returns a boolean based on the comparison.
	*/ visitComparison(comparison) {
        const { comparator, attribute, value } = comparison;
        const undefinedTrue = [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"].ne
        ];
        if (this.allowedComparators.includes(comparator)) {
            if (!this.getAllowedComparatorsForType(typeof value).includes(comparator)) throw new Error(`'${comparator}' comparator not allowed to be used with ${typeof value}`);
            const comparatorFunction = this.getComparatorFunction(comparator);
            return (document)=>{
                const documentValue = document.metadata[attribute];
                if (documentValue === void 0) {
                    if (undefinedTrue.includes(comparator)) return true;
                    return false;
                }
                return comparatorFunction(documentValue, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["castValue"])(value));
            };
        } else throw new Error("Comparator not allowed");
    }
    /**
	* Visits a structured query and translates it into a functional filter.
	* @param query The structured query to translate.
	* @returns An object containing a `filter` property, which is a function that takes a `Document` as an argument and returns a boolean based on the structured query.
	*/ visitStructuredQuery(query) {
        if (!query.filter) return {};
        const filterFunction = query.filter?.accept(this);
        if (typeof filterFunction !== "function") throw new Error("Structured query filter is not a function");
        return {
            filter: filterFunction
        };
    }
    /**
	* Merges two filters into one, based on the specified merge type.
	* @param defaultFilter The default filter function.
	* @param generatedFilter The generated filter function.
	* @param mergeType The type of merge to perform. Can be 'and', 'or', or 'replace'. Default is 'and'.
	* @returns A function that takes a `Document` as an argument and returns a boolean based on the merged filters, or `undefined` if both filters are empty.
	*/ mergeFilters(defaultFilter, generatedFilter, mergeType = "and") {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(defaultFilter) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(generatedFilter)) return;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(defaultFilter) || mergeType === "replace") {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(generatedFilter)) return;
            return generatedFilter;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"])(generatedFilter)) {
            if (mergeType === "and") return;
            return defaultFilter;
        }
        if (mergeType === "and") return (document)=>defaultFilter(document) && generatedFilter(document);
        else if (mergeType === "or") return (document)=>defaultFilter(document) || generatedFilter(document);
        else throw new Error("Unknown merge type");
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "structured_query_exports",
    ()=>structured_query_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/ir.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$functional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/structured_query/functional.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/structured_query/index.ts
var structured_query_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    BaseTranslator: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTranslator"],
    BasicTranslator: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BasicTranslator"],
    Comparators: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparators"],
    Comparison: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Comparison"],
    Expression: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Expression"],
    FilterDirective: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FilterDirective"],
    FunctionalTranslator: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$functional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FunctionalTranslator"],
    Operation: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operation"],
    Operators: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Operators"],
    StructuredQuery: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StructuredQuery"],
    Visitor: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$ir$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Visitor"],
    castValue: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["castValue"],
    isBoolean: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBoolean"],
    isFilterEmpty: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFilterEmpty"],
    isFloat: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isFloat"],
    isInt: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInt"],
    isObject: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isObject"],
    isString: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$structured_query$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isString"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/testing/matchers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "langchainMatchers",
    ()=>langchainMatchers,
    "toBeAIMessage",
    ()=>toBeAIMessage,
    "toBeHumanMessage",
    ()=>toBeHumanMessage,
    "toBeSystemMessage",
    ()=>toBeSystemMessage,
    "toBeToolMessage",
    ()=>toBeToolMessage,
    "toContainToolCall",
    ()=>toContainToolCall,
    "toHaveBeenInterrupted",
    ()=>toHaveBeenInterrupted,
    "toHaveStructuredResponse",
    ()=>toHaveStructuredResponse,
    "toHaveToolCallCount",
    ()=>toHaveToolCallCount,
    "toHaveToolCalls",
    ()=>toHaveToolCalls,
    "toHaveToolMessages",
    ()=>toHaveToolMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/tool.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/system.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/stream.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
//#region src/testing/matchers.ts
function getMessageTypeName(msg) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessage"].isInstance(msg)) return typeof msg;
    return msg.constructor.name || msg.type;
}
function makeMessageTypeMatcher(typeName, isInstance) {
    return function(received, expected) {
        const { isNot, utils } = this;
        if (!isInstance(received)) return {
            pass: false,
            message: ()=>`${utils.matcherHint(`toBe${typeName}`, void 0, void 0)}\n\nExpected: ${isNot ? "not " : ""}${typeName}\nReceived: ${getMessageTypeName(received)}`,
            actual: getMessageTypeName(received),
            expected: typeName
        };
        if (expected === void 0) return {
            pass: true,
            message: ()=>`${utils.matcherHint(`toBe${typeName}`, void 0, void 0)}\n\nExpected: not ${typeName}\nReceived: ${typeName}`
        };
        const msg = received;
        if (typeof expected === "string") return {
            pass: msg.content === expected,
            message: ()=>`${utils.matcherHint(`toBe${typeName}`, void 0, void 0)}\n\nExpected: ${typeName} with content ${utils.printExpected(expected)}\nReceived: ${typeName} with content ${utils.printReceived(msg.content)}`,
            actual: msg.content,
            expected
        };
        return {
            pass: Object.entries(expected).every(([key, value])=>this.equals(msg[key], value)),
            message: ()=>{
                const receivedFields = {};
                for (const key of Object.keys(expected))receivedFields[key] = msg[key];
                return `${utils.matcherHint(`toBe${typeName}`, void 0, void 0)}\n\nExpected: ${typeName} matching ${utils.printExpected(expected)}\nReceived: ${typeName} with ${utils.printReceived(receivedFields)}`;
            },
            actual: (()=>{
                const receivedFields = {};
                for (const key of Object.keys(expected))receivedFields[key] = msg[key];
                return receivedFields;
            })(),
            expected
        };
    };
}
const toBeHumanMessage = makeMessageTypeMatcher("HumanMessage", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"].isInstance);
const toBeAIMessage = makeMessageTypeMatcher("AIMessage", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"].isInstance);
const toBeSystemMessage = makeMessageTypeMatcher("SystemMessage", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$system$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SystemMessage"].isInstance);
const toBeToolMessage = makeMessageTypeMatcher("ToolMessage", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolMessage"].isInstance);
function toHaveToolCalls(received, expected) {
    const { isNot, utils } = this;
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"].isInstance(received)) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveToolCalls")}\n\nExpected: AIMessage\nReceived: ${getMessageTypeName(received)}`
    };
    const actual = received.tool_calls ?? [];
    if (actual.length !== expected.length) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveToolCalls")}\n\nExpected ${isNot ? "not " : ""}${expected.length} tool call(s), received ${actual.length}`,
        actual: actual.length,
        expected: expected.length
    };
    const unmatched = expected.filter((exp)=>!actual.some((tc)=>Object.entries(exp).every(([key, value])=>this.equals(tc[key], value))));
    if (unmatched.length > 0) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveToolCalls")}\n\nCould not find matching tool call(s) for:\n${utils.printExpected(unmatched)}\nReceived tool calls: ${utils.printReceived(actual.map((tc)=>({
                    name: tc.name,
                    id: tc.id,
                    args: tc.args
                })))}`,
        actual: actual.map((tc)=>({
                name: tc.name,
                id: tc.id,
                args: tc.args
            })),
        expected
    };
    return {
        pass: true,
        message: ()=>`${utils.matcherHint("toHaveToolCalls")}\n\nExpected AIMessage not to have matching tool calls`
    };
}
function toHaveToolCallCount(received, expected) {
    const { isNot, utils } = this;
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"].isInstance(received)) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveToolCallCount")}\n\nExpected: AIMessage\nReceived: ${getMessageTypeName(received)}`
    };
    const actual = received.tool_calls?.length ?? 0;
    return {
        pass: actual === expected,
        message: ()=>`${utils.matcherHint("toHaveToolCallCount")}\n\nExpected ${isNot ? "not " : ""}${expected} tool call(s)\nReceived: ${actual}`,
        actual,
        expected
    };
}
function toContainToolCall(received, expected) {
    const { isNot, utils } = this;
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"].isInstance(received)) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toContainToolCall")}\n\nExpected: AIMessage\nReceived: ${getMessageTypeName(received)}`
    };
    const actual = received.tool_calls ?? [];
    return {
        pass: actual.some((tc)=>Object.entries(expected).every(([key, value])=>this.equals(tc[key], value))),
        message: ()=>`${utils.matcherHint("toContainToolCall")}\n\nExpected AIMessage ${isNot ? "not " : ""}to contain a tool call matching ${utils.printExpected(expected)}\nReceived tool calls: ${utils.printReceived(actual.map((tc)=>({
                    name: tc.name,
                    id: tc.id
                })))}`,
        actual: actual.map((tc)=>({
                name: tc.name,
                id: tc.id
            })),
        expected
    };
}
function toHaveToolMessages(received, expected) {
    const { isNot, utils } = this;
    if (!Array.isArray(received)) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveToolMessages")}\n\nExpected an array of messages\nReceived: ${typeof received}`
    };
    const toolMessages = received.filter(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolMessage"].isInstance);
    if (toolMessages.length !== expected.length) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveToolMessages")}\n\nExpected ${isNot ? "not " : ""}${expected.length} tool message(s), found ${toolMessages.length}`,
        actual: toolMessages.length,
        expected: expected.length
    };
    for(let i = 0; i < expected.length; i++)if (!Object.entries(expected[i]).every(([key, value])=>this.equals(toolMessages[i][key], value))) return {
        pass: false,
        message: ()=>{
            const receivedFields = {};
            for (const key of Object.keys(expected[i]))receivedFields[key] = toolMessages[i][key];
            return `${utils.matcherHint("toHaveToolMessages")}\n\nTool message at index ${i} did not match:\nExpected: ${utils.printExpected(expected[i])}\nReceived: ${utils.printReceived(receivedFields)}`;
        },
        actual: toolMessages[i],
        expected: expected[i]
    };
    return {
        pass: true,
        message: ()=>`${utils.matcherHint("toHaveToolMessages")}\n\nExpected messages not to contain matching tool messages`
    };
}
function toHaveBeenInterrupted(received, expectedValue) {
    const { isNot, utils } = this;
    const interrupts = received?.__interrupt__;
    if (!(Array.isArray(interrupts) && interrupts.length > 0)) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveBeenInterrupted")}\n\nExpected result ${isNot ? "not " : ""}to have been interrupted\nReceived __interrupt__: ${utils.printReceived(interrupts)}`
    };
    if (expectedValue === void 0) return {
        pass: true,
        message: ()=>`${utils.matcherHint("toHaveBeenInterrupted")}\n\nExpected result not to have been interrupted\nReceived ${interrupts.length} interrupt(s)`
    };
    const actualValue = interrupts[0]?.value;
    return {
        pass: this.equals(actualValue, expectedValue),
        message: ()=>`${utils.matcherHint("toHaveBeenInterrupted")}\n\nExpected interrupt value: ${utils.printExpected(expectedValue)}\nReceived interrupt value: ${utils.printReceived(actualValue)}`,
        actual: actualValue,
        expected: expectedValue
    };
}
function toHaveStructuredResponse(received, expected) {
    const { isNot, utils } = this;
    const structuredResponse = received?.structuredResponse;
    if (!(structuredResponse !== void 0)) return {
        pass: false,
        message: ()=>`${utils.matcherHint("toHaveStructuredResponse")}\n\nExpected result ${isNot ? "not " : ""}to have a structured response\nReceived structuredResponse: undefined`
    };
    if (expected === void 0) return {
        pass: true,
        message: ()=>`${utils.matcherHint("toHaveStructuredResponse")}\n\nExpected result not to have a structured response`
    };
    return {
        pass: Object.entries(expected).every(([key, value])=>this.equals(structuredResponse[key], value)),
        message: ()=>`${utils.matcherHint("toHaveStructuredResponse")}\n\nExpected structured response: ${utils.printExpected(expected)}\nReceived structured response: ${utils.printReceived(structuredResponse)}`,
        actual: structuredResponse,
        expected
    };
}
/**
* All matcher functions bundled for convenient use with `expect.extend()`.
*/ const langchainMatchers = {
    toBeHumanMessage,
    toBeAIMessage,
    toBeSystemMessage,
    toBeToolMessage,
    toHaveToolCalls,
    toHaveToolCallCount,
    toContainToolCall,
    toHaveToolMessages,
    toHaveBeenInterrupted,
    toHaveStructuredResponse,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["streamMatchers"]
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/testing/fake_model_builder.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeBuiltModel",
    ()=>FakeBuiltModel,
    "fakeModel",
    ()=>fakeModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/chat_models.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/testing/fake_model_builder.ts
function deriveContent(messages) {
    return messages.map((m)=>m.text).filter(Boolean).join("-");
}
let idCounter = 0;
function nextToolCallId() {
    idCounter += 1;
    return `fake_tc_${idCounter}`;
}
/**
* A fake chat model for testing, created via {@link fakeModel}.
*
* Queue responses with `.respond()` and `.respondWithTools()`, then
* pass the instance directly wherever a chat model is expected.
* Responses are consumed in first-in-first-out order — one per `invoke()` call.
* When all queued responses are consumed, further invocations throw.
*/ var FakeBuiltModel = class FakeBuiltModel extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseChatModel"] {
    queue = [];
    _alwaysThrowError;
    _structuredResponseValue;
    _tools = [];
    _state = {
        callIndex: 0,
        calls: []
    };
    /**
	* All invocations recorded by this model, in order.
	* Each entry contains the `messages` array and `options` that were
	* passed to `invoke()`.
	*/ get calls() {
        return this._state.calls;
    }
    /**
	* The number of times this model has been invoked.
	*/ get callCount() {
        return this._state.calls.length;
    }
    constructor(){
        super({});
    }
    _llmType() {
        return "fake-model-builder";
    }
    _combineLLMOutput() {
        return [];
    }
    /**
	* Enqueue a response that the model will return on its next invocation.
	* @param entry A {@link BaseMessage} to return, an `Error` to throw, or
	*   a factory `(messages) => BaseMessage | Error` for dynamic responses.
	* @returns `this`, for chaining.
	*/ respond(entry) {
        if (typeof entry === "function") this.queue.push({
            kind: "factory",
            factory: entry
        });
        else if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessage"].isInstance(entry)) this.queue.push({
            kind: "message",
            message: entry
        });
        else this.queue.push({
            kind: "error",
            error: entry
        });
        return this;
    }
    /**
	* Enqueue an {@link AIMessage} that carries the given tool calls.
	* Content is derived from the input messages at invocation time.
	* @param toolCalls Array of tool calls. Each entry needs `name` and
	*   `args`; `id` is optional and auto-generated when omitted.
	* @returns `this`, for chaining.
	*/ respondWithTools(toolCalls) {
        this.queue.push({
            kind: "toolCalls",
            toolCalls: toolCalls.map((tc)=>({
                    name: tc.name,
                    args: tc.args,
                    id: tc.id ?? nextToolCallId(),
                    type: "tool_call"
                }))
        });
        return this;
    }
    /**
	* Make every invocation throw the given error, regardless of the queue.
	* @param error The error to throw.
	* @returns `this`, for chaining.
	*/ alwaysThrow(error) {
        this._alwaysThrowError = error;
        return this;
    }
    /**
	* Set the value that {@link withStructuredOutput} will resolve to.
	* @param value The structured object to return.
	* @returns `this`, for chaining.
	*/ structuredResponse(value) {
        this._structuredResponseValue = value;
        return this;
    }
    /**
	* Bind tools to the model. Returns a new model that shares the same
	* response queue and call history.
	* @param tools The tools to bind, as {@link StructuredTool} instances or
	*   plain {@link ToolSpec} objects.
	* @returns A new RunnableBinding with the tools bound.
	*/ bindTools(tools) {
        const merged = [
            ...this._tools,
            ...tools
        ];
        const next = new FakeBuiltModel();
        next.queue = this.queue;
        next._alwaysThrowError = this._alwaysThrowError;
        next._structuredResponseValue = this._structuredResponseValue;
        next._tools = merged;
        next._state = this._state;
        return next.withConfig({});
    }
    /**
	* Returns a {@link Runnable} that produces the {@link structuredResponse}
	* value. The schema argument is accepted for compatibility but ignored.
	* @param _params Schema or params (ignored).
	* @param _config Options (ignored).
	* @returns A Runnable that resolves to the structured response value.
	*/ withStructuredOutput(_params, _config) {
        const { _structuredResponseValue } = this;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunnableLambda"].from(async ()=>{
            return _structuredResponseValue;
        });
    }
    async _generate(messages, options, _runManager) {
        this._state.calls.push({
            messages: [
                ...messages
            ],
            options
        });
        const currentCallIndex = this._state.callIndex;
        this._state.callIndex += 1;
        if (this._alwaysThrowError) throw this._alwaysThrowError;
        const entry = this.queue[currentCallIndex];
        if (!entry) throw new Error(`FakeModel: no response queued for invocation ${currentCallIndex} (${this.queue.length} total queued).`);
        if (entry.kind === "error") throw entry.error;
        if (entry.kind === "factory") {
            const result = entry.factory(messages);
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseMessage"].isInstance(result)) throw result;
            return {
                generations: [
                    {
                        text: "",
                        message: result
                    }
                ]
            };
        }
        if (entry.kind === "message") return {
            generations: [
                {
                    text: "",
                    message: entry.message
                }
            ]
        };
        const content = deriveContent(messages);
        return {
            generations: [
                {
                    text: content,
                    message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"]({
                        content,
                        id: currentCallIndex.toString(),
                        tool_calls: entry.toolCalls.length > 0 ? entry.toolCalls.map((tc)=>({
                                ...tc,
                                type: "tool_call"
                            })) : void 0
                    })
                }
            ],
            llmOutput: {}
        };
    }
};
/**
* Creates a new {@link FakeBuiltModel} for testing.
*
* Returns a chainable builder — queue responses, then pass the model
* anywhere a chat model is expected. Responses are consumed in FIFO
* order, one per `invoke()` call.
*
* ## API summary
*
* | Method | Description |
* | --- | --- |
* | `fakeModel()` | Creates a new fake chat model. Returns a chainable builder. |
* | `.respond(message)` | Queue an `AIMessage` (or any `BaseMessage`) to return on the next invocation. |
* | `.respond(error)` | Queue an `Error` to throw on the next invocation. |
* | `.respond(factory)` | Queue a function `(messages) => BaseMessage \| Error` for dynamic responses. |
* | `.respondWithTools(toolCalls)` | Shorthand for `.respond()` with tool calls. Each entry needs `name` and `args`; `id` is optional. |
* | `.alwaysThrow(error)` | Make every invocation throw this error, regardless of the queue. |
* | `.structuredResponse(value)` | Set the value returned by `.withStructuredOutput()`. |
* | `.bindTools(tools)` | Bind tools to the model. Returns a `RunnableBinding` that shares the response queue and call recording. |
* | `.withStructuredOutput(schema)` | Returns a runnable that produces the `.structuredResponse()` value. |
* | `.calls` | Array of `{ messages, options }` for every invocation (read-only). |
* | `.callCount` | Number of times the model has been invoked. |
*
* @example
* ```typescript
* const model = fakeModel()
*   .respondWithTools([{ name: "search", args: { query: "weather" } }])
*   .respond(new AIMessage("Sunny and warm."));
*
* const r1 = await model.invoke([new HumanMessage("What's the weather?")]);
* // r1.tool_calls[0].name === "search"
*
* const r2 = await model.invoke([new HumanMessage("Thanks")]);
* // r2.content === "Sunny and warm."
* ```
*/ function fakeModel() {
    return new FakeBuiltModel();
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/testing/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "testing_exports",
    ()=>testing_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/testing/matchers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$fake_model_builder$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/testing/fake_model_builder.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/openai_stream_fixtures.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/testing/index.ts
var testing_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    FakeBuiltModel: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$fake_model_builder$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeBuiltModel"],
    asAsyncIterable: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asAsyncIterable"],
    fakeModel: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$fake_model_builder$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fakeModel"],
    langchainMatchers: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["langchainMatchers"],
    openAIReasoningTextChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAIReasoningTextChunks"],
    openAITextOnlyChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAITextOnlyChunks"],
    openAITextOnlyChunksWithUsage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAITextOnlyChunksWithUsage"],
    openAIToolCallChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAIToolCallChunks"],
    sseResponseFromOpenAIChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sseResponseFromOpenAIChunks"],
    streamMatchers: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["streamMatchers"],
    toBeAIMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toBeAIMessage"],
    toBeHumanMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toBeHumanMessage"],
    toBeSystemMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toBeSystemMessage"],
    toBeToolMessage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toBeToolMessage"],
    toContainToolCall: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toContainToolCall"],
    toHaveBeenInterrupted: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toHaveBeenInterrupted"],
    toHaveStructuredResponse: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toHaveStructuredResponse"],
    toHaveToolCallCount: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toHaveToolCallCount"],
    toHaveToolCalls: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toHaveToolCalls"],
    toHaveToolMessages: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$testing$2f$matchers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toHaveToolMessages"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/types/stream.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stream_exports",
    ()=>stream_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/types/stream.ts
var stream_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/vectorstores.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SaveableVectorStore",
    ()=>SaveableVectorStore,
    "VectorStore",
    ()=>VectorStore,
    "VectorStoreRetriever",
    ()=>VectorStoreRetriever,
    "vectorstores_exports",
    ()=>vectorstores_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/retrievers/index.js [app-rsc] (ecmascript)");
;
;
;
//#region src/vectorstores.ts
var vectorstores_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    SaveableVectorStore: ()=>SaveableVectorStore,
    VectorStore: ()=>VectorStore,
    VectorStoreRetriever: ()=>VectorStoreRetriever
});
/**
* Class for retrieving documents from a `VectorStore` based on vector similarity
* or maximal marginal relevance (MMR).
*
* `VectorStoreRetriever` extends `BaseRetriever`, implementing methods for
* adding documents to the underlying vector store and performing document
* retrieval with optional configurations.
*
* @class VectorStoreRetriever
* @extends BaseRetriever
* @implements VectorStoreRetrieverInterface
* @template V - Type of vector store implementing `VectorStoreInterface`.
*/ var VectorStoreRetriever = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseRetriever"] {
    static lc_name() {
        return "VectorStoreRetriever";
    }
    get lc_namespace() {
        return [
            "langchain_core",
            "vectorstores"
        ];
    }
    /**
	* The instance of `VectorStore` used for storing and retrieving document embeddings.
	* This vector store must implement the `VectorStoreInterface` to be compatible
	* with the retriever’s operations.
	*/ vectorStore;
    /**
	* Specifies the number of documents to retrieve for each search query.
	* Defaults to 4 if not specified, providing a basic result count for similarity or MMR searches.
	*/ k = 4;
    /**
	* Determines the type of search operation to perform on the vector store.
	*
	* - `"similarity"` (default): Conducts a similarity search based purely on vector similarity
	*   to the query.
	* - `"mmr"`: Executes a maximal marginal relevance (MMR) search, balancing relevance and
	*   diversity in the retrieved results.
	*/ searchType = "similarity";
    /**
	* Additional options specific to maximal marginal relevance (MMR) search, applicable
	* only if `searchType` is set to `"mmr"`.
	*
	* Includes:
	* - `fetchK`: The initial number of documents fetched before applying the MMR algorithm,
	*   allowing for a larger selection from which to choose the most diverse results.
	* - `lambda`: A parameter between 0 and 1 to adjust the relevance-diversity balance,
	*   where 0 prioritizes diversity and 1 prioritizes relevance.
	*/ searchKwargs;
    /**
	* Optional filter applied to search results, defined by the `FilterType` of the vector store.
	* Allows for refined, targeted results by restricting the returned documents based
	* on specified filter criteria.
	*/ filter;
    /**
	* Returns the type of vector store, as defined by the `vectorStore` instance.
	*
	* @returns {string} The vector store type.
	*/ _vectorstoreType() {
        return this.vectorStore._vectorstoreType();
    }
    /**
	* Initializes a new instance of `VectorStoreRetriever` with the specified configuration.
	*
	* This constructor configures the retriever to interact with a given `VectorStore`
	* and supports different retrieval strategies, including similarity search and maximal
	* marginal relevance (MMR) search. Various options allow customization of the number
	* of documents retrieved per query, filtering based on conditions, and fine-tuning
	* MMR-specific parameters.
	*
	* @param fields - Configuration options for setting up the retriever:
	*
	*   - `vectorStore` (required): The `VectorStore` instance implementing `VectorStoreInterface`
	*     that will be used to store and retrieve document embeddings. This is the core component
	*     of the retriever, enabling vector-based similarity and MMR searches.
	*
	*   - `k` (optional): Specifies the number of documents to retrieve per search query. If not
	*     provided, defaults to 4. This count determines the number of most relevant documents returned
	*     for each search operation, balancing performance with comprehensiveness.
	*
	*   - `searchType` (optional): Defines the search approach used by the retriever, allowing for
	*     flexibility between two methods:
	*       - `"similarity"` (default): A similarity-based search, retrieving documents with high vector
	*         similarity to the query. This type prioritizes relevance and is often used when diversity
	*         among results is less critical.
	*       - `"mmr"`: Maximal Marginal Relevance search, which combines relevance with diversity. MMR
	*         is useful for scenarios where varied content is essential, as it selects results that
	*         both match the query and introduce content diversity.
	*
	*   - `filter` (optional): A filter of type `FilterType`, defined by the vector store, that allows
	*     for refined and targeted search results. This filter applies specified conditions to limit
	*     which documents are eligible for retrieval, offering control over the scope of results.
	*
	*   - `searchKwargs` (optional, applicable only if `searchType` is `"mmr"`): Additional settings
	*     for configuring MMR-specific behavior. These parameters allow further tuning of the MMR
	*     search process:
	*       - `fetchK`: The initial number of documents fetched from the vector store before the MMR
	*         algorithm is applied. Fetching a larger set enables the algorithm to select a more
	*         diverse subset of documents.
	*       - `lambda`: A parameter controlling the relevance-diversity balance, where 0 emphasizes
	*         diversity and 1 prioritizes relevance. Intermediate values provide a blend of the two,
	*         allowing customization based on the importance of content variety relative to query relevance.
	*/ constructor(fields){
        super(fields);
        this.vectorStore = fields.vectorStore;
        this.k = fields.k ?? this.k;
        this.searchType = fields.searchType ?? this.searchType;
        this.filter = fields.filter;
        if (fields.searchType === "mmr") this.searchKwargs = fields.searchKwargs;
    }
    /**
	* Retrieves relevant documents based on the specified query, using either
	* similarity or maximal marginal relevance (MMR) search.
	*
	* If `searchType` is set to `"mmr"`, performs an MMR search to balance
	* similarity and diversity among results. If `searchType` is `"similarity"`,
	* retrieves results purely based on similarity to the query.
	*
	* @param query - The query string used to find relevant documents.
	* @param runManager - Optional callback manager for tracking retrieval progress.
	* @returns A promise that resolves to an array of `DocumentInterface` instances
	*          representing the most relevant documents to the query.
	* @throws {Error} Throws an error if MMR search is requested but not supported
	*                 by the vector store.
	* @protected
	*/ async _getRelevantDocuments(query, runManager) {
        if (this.searchType === "mmr") {
            if (typeof this.vectorStore.maxMarginalRelevanceSearch !== "function") throw new Error(`The vector store backing this retriever, ${this._vectorstoreType()} does not support max marginal relevance search.`);
            return this.vectorStore.maxMarginalRelevanceSearch(query, {
                k: this.k,
                filter: this.filter,
                ...this.searchKwargs
            }, runManager?.getChild("vectorstore"));
        }
        return this.vectorStore.similaritySearch(query, this.k, this.filter, runManager?.getChild("vectorstore"));
    }
    /**
	* Adds an array of documents to the vector store, embedding them as part of
	* the storage process.
	*
	* This method delegates document embedding and storage to the `addDocuments`
	* method of the underlying vector store.
	*
	* @param documents - An array of documents to embed and add to the vector store.
	* @param options - Optional settings to customize document addition.
	* @returns A promise that resolves to an array of document IDs or `void`,
	*          depending on the vector store's implementation.
	*/ async addDocuments(documents, options) {
        return this.vectorStore.addDocuments(documents, options);
    }
};
/**
* Abstract class representing a vector storage system for performing
* similarity searches on embedded documents.
*
* `VectorStore` provides methods for adding precomputed vectors or documents,
* removing documents based on criteria, and performing similarity searches
* with optional scoring. Subclasses are responsible for implementing specific
* storage mechanisms and the exact behavior of certain abstract methods.
*
* @abstract
* @extends Serializable
* @implements VectorStoreInterface
*/ var VectorStore = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
    /**
	* Namespace within LangChain to uniquely identify this vector store's
	* location, based on the vector store type.
	*
	* @internal
	*/ lc_namespace = [
        "langchain",
        "vectorstores",
        this._vectorstoreType()
    ];
    /**
	* Embeddings interface for generating vector embeddings from text queries,
	* enabling vector-based similarity searches.
	*/ embeddings;
    /**
	* Initializes a new vector store with embeddings and database configuration.
	*
	* @param embeddings - Instance of `EmbeddingsInterface` used to embed queries.
	* @param dbConfig - Configuration settings for the database or storage system.
	*/ constructor(embeddings, dbConfig){
        super(dbConfig);
        this.embeddings = embeddings;
    }
    /**
	* Deletes documents from the vector store based on the specified parameters.
	*
	* @param _params - Flexible key-value pairs defining conditions for document deletion.
	* @returns A promise that resolves once the deletion is complete.
	*/ async delete(_params) {
        throw new Error("Not implemented.");
    }
    /**
	* Searches for documents similar to a text query by embedding the query and
	* performing a similarity search on the resulting vector.
	*
	* @param query - Text query for finding similar documents.
	* @param k - Number of similar results to return. Defaults to 4.
	* @param filter - Optional filter based on `FilterType`.
	* @param _callbacks - Optional callbacks for monitoring search progress
	* @returns A promise resolving to an array of `DocumentInterface` instances representing similar documents.
	*/ async similaritySearch(query, k = 4, filter = void 0, _callbacks = void 0) {
        return (await this.similaritySearchVectorWithScore(await this.embeddings.embedQuery(query), k, filter)).map((result)=>result[0]);
    }
    /**
	* Searches for documents similar to a text query by embedding the query,
	* and returns results with similarity scores.
	*
	* @param query - Text query for finding similar documents.
	* @param k - Number of similar results to return. Defaults to 4.
	* @param filter - Optional filter based on `FilterType`.
	* @param _callbacks - Optional callbacks for monitoring search progress
	* @returns A promise resolving to an array of tuples, each containing a
	*          document and its similarity score.
	*/ async similaritySearchWithScore(query, k = 4, filter = void 0, _callbacks = void 0) {
        return this.similaritySearchVectorWithScore(await this.embeddings.embedQuery(query), k, filter);
    }
    /**
	* Creates a `VectorStore` instance from an array of text strings and optional
	* metadata, using the specified embeddings and database configuration.
	*
	* Subclasses must implement this method to define how text and metadata
	* are embedded and stored in the vector store. Throws an error if not overridden.
	*
	* @param _texts - Array of strings representing the text documents to be stored.
	* @param _metadatas - Metadata for the texts, either as an array (one for each text)
	*                     or a single object (applied to all texts).
	* @param _embeddings - Instance of `EmbeddingsInterface` to embed the texts.
	* @param _dbConfig - Database configuration settings.
	* @returns A promise that resolves to a new `VectorStore` instance.
	* @throws {Error} Throws an error if this method is not overridden by a subclass.
	*/ static fromTexts(_texts, _metadatas, _embeddings, _dbConfig) {
        throw new Error("the Langchain vectorstore implementation you are using forgot to override this, please report a bug");
    }
    /**
	* Creates a `VectorStore` instance from an array of documents, using the specified
	* embeddings and database configuration.
	*
	* Subclasses must implement this method to define how documents are embedded
	* and stored. Throws an error if not overridden.
	*
	* @param _docs - Array of `DocumentInterface` instances representing the documents to be stored.
	* @param _embeddings - Instance of `EmbeddingsInterface` to embed the documents.
	* @param _dbConfig - Database configuration settings.
	* @returns A promise that resolves to a new `VectorStore` instance.
	* @throws {Error} Throws an error if this method is not overridden by a subclass.
	*/ static fromDocuments(_docs, _embeddings, _dbConfig) {
        throw new Error("the Langchain vectorstore implementation you are using forgot to override this, please report a bug");
    }
    /**
	* Creates a `VectorStoreRetriever` instance with flexible configuration options.
	*
	* @param kOrFields
	*    - If a number is provided, it sets the `k` parameter (number of items to retrieve).
	*    - If an object is provided, it should contain various configuration options.
	* @param filter
	*    - Optional filter criteria to limit the items retrieved based on the specified filter type.
	* @param callbacks
	*    - Optional callbacks that may be triggered at specific stages of the retrieval process.
	* @param tags
	*    - Tags to categorize or label the `VectorStoreRetriever`. Defaults to an empty array if not provided.
	* @param metadata
	*    - Additional metadata as key-value pairs to add contextual information for the retrieval process.
	* @param verbose
	*    - If `true`, enables detailed logging for the retrieval process. Defaults to `false`.
	*
	* @returns
	*    - A configured `VectorStoreRetriever` instance based on the provided parameters.
	*
	* @example
	* Basic usage with a `k` value:
	* ```typescript
	* const retriever = myVectorStore.asRetriever(5);
	* ```
	*
	* Usage with a configuration object:
	* ```typescript
	* const retriever = myVectorStore.asRetriever({
	*   k: 10,
	*   filter: myFilter,
	*   tags: ['example', 'test'],
	*   verbose: true,
	*   searchType: 'mmr',
	*   searchKwargs: { alpha: 0.5 },
	* });
	* ```
	*/ asRetriever(kOrFields, filter, callbacks, tags, metadata, verbose) {
        if (typeof kOrFields === "number") return new VectorStoreRetriever({
            vectorStore: this,
            k: kOrFields,
            filter,
            tags: [
                ...tags ?? [],
                this._vectorstoreType()
            ],
            metadata,
            verbose,
            callbacks
        });
        else {
            const params = {
                vectorStore: this,
                k: kOrFields?.k,
                filter: kOrFields?.filter,
                tags: [
                    ...kOrFields?.tags ?? [],
                    this._vectorstoreType()
                ],
                metadata: kOrFields?.metadata,
                verbose: kOrFields?.verbose,
                callbacks: kOrFields?.callbacks,
                searchType: kOrFields?.searchType
            };
            if (kOrFields?.searchType === "mmr") return new VectorStoreRetriever({
                ...params,
                searchKwargs: kOrFields.searchKwargs
            });
            return new VectorStoreRetriever({
                ...params
            });
        }
    }
};
/**
* Abstract class extending `VectorStore` that defines a contract for saving
* and loading vector store instances.
*
* The `SaveableVectorStore` class allows vector store implementations to
* persist their data and retrieve it when needed.The format for saving and
* loading data is left to the implementing subclass.
*
* Subclasses must implement the `save` method to handle their custom
* serialization logic, while the `load` method enables reconstruction of a
* vector store from saved data, requiring compatible embeddings through the
* `EmbeddingsInterface`.
*
* @abstract
* @extends VectorStore
*/ var SaveableVectorStore = class extends VectorStore {
    /**
	* Loads a vector store instance from the specified directory, using the
	* provided embeddings to ensure compatibility.
	*
	* This static method reconstructs a `SaveableVectorStore` from previously
	* saved data. Implementations should interpret the saved data format to
	* recreate the vector store instance.
	*
	* @param _directory - The directory path from which the vector store
	* data will be loaded.
	* @param _embeddings - An instance of `EmbeddingsInterface` to align
	* the embeddings with the loaded vector data.
	* @returns A promise that resolves to a `SaveableVectorStore` instance
	* constructed from the saved data.
	*/ static load(_directory, _embeddings) {
        throw new Error("Not implemented");
    }
};
;
}),
];

//# sourceMappingURL=09_2_%40langchain_core_dist_04j4cbt._.js.map