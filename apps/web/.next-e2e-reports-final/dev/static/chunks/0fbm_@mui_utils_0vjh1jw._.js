(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/composeClasses/composeClasses.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* eslint no-restricted-syntax: 0, prefer-template: 0, guard-for-in: 0
   ---
   These rules are preventing the performance optimizations below.
 */ /**
 * Compose classes from multiple sources.
 *
 * @example
 * ```tsx
 * const slots = {
 *  root: ['root', 'primary'],
 *  label: ['label'],
 * };
 *
 * const getUtilityClass = (slot) => `MuiButton-${slot}`;
 *
 * const classes = {
 *   root: 'my-root-class',
 * };
 *
 * const output = composeClasses(slots, getUtilityClass, classes);
 * // {
 * //   root: 'MuiButton-root MuiButton-primary my-root-class',
 * //   label: 'MuiButton-label',
 * // }
 * ```
 *
 * @param slots a list of classes for each possible slot
 * @param getUtilityClass a function to resolve the class based on the slot name
 * @param classes the input classes from props
 * @returns the resolved classes for all slots
 */ __turbopack_context__.s([
    "default",
    ()=>composeClasses
]);
function composeClasses(slots, getUtilityClass, classes = undefined) {
    const output = {};
    for(const slotName in slots){
        const slot = slots[slotName];
        let buffer = '';
        let start = true;
        for(let i = 0; i < slot.length; i += 1){
            const value = slot[i];
            if (value) {
                buffer += (start === true ? '' : ' ') + getUtilityClass(value);
                start = false;
                if (classes && classes[value]) {
                    buffer += ' ' + classes[value];
                }
            }
        }
        output[slotName] = buffer;
    }
    return output;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useId/useId.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
let globalId = 0;
// TODO React 17: Remove `useGlobalId` once React 17 support is removed
function useGlobalId(idOverride) {
    const [defaultId, setDefaultId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.useState(idOverride);
    const id = idOverride || defaultId;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.useEffect({
        "useGlobalId.useEffect": ()=>{
            if (defaultId == null) {
                // Fallback to this default id when possible.
                // Use the incrementing value for client-side rendering only.
                // We can't use it server-side.
                // If you want to use random values please consider the Birthday Problem: https://en.wikipedia.org/wiki/Birthday_problem
                globalId += 1;
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setDefaultId(`mui-${globalId}`);
            }
        }
    }["useGlobalId.useEffect"], [
        defaultId
    ]);
    return id;
}
// See https://github.com/mui/material-ui/issues/41190#issuecomment-2040873379 for why
const safeReact = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__
};
const maybeReactUseId = safeReact.useId;
function useId(idOverride) {
    // React.useId() is only available from React 17.0.0.
    if (maybeReactUseId !== undefined) {
        const reactId = maybeReactUseId();
        return idOverride ?? reactId;
    }
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `React.useId` is invariant at runtime.
    return useGlobalId(idOverride);
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/refType/refType.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-client] (ecmascript)");
;
const refType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].oneOfType([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].func,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].object
]);
const __TURBOPACK__default__export__ = refType;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isObjectEmpty/isObjectEmpty.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>isObjectEmpty
]);
function isObjectEmpty(object) {
    if (object == null) {
        return true;
    }
    // eslint-disable-next-line
    for(const _ in object){
        return false;
    }
    return true;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>deepmerge,
    "isPlainObject",
    ()=>isPlainObject
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$is$40$19$2e$3$2e$0$2f$node_modules$2f$react$2d$is$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-is@19.3.0/node_modules/react-is/index.js [app-client] (ecmascript)");
;
;
function isPlainObject(item) {
    if (typeof item !== 'object' || item === null) {
        return false;
    }
    const prototype = Object.getPrototypeOf(item);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in item) && !(Symbol.iterator in item);
}
function deepClone(source) {
    if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElement"](source) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$is$40$19$2e$3$2e$0$2f$node_modules$2f$react$2d$is$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElementType"])(source) || !isPlainObject(source)) {
        return source;
    }
    const output = {};
    Object.keys(source).forEach((key)=>{
        output[key] = deepClone(source[key]);
    });
    return output;
}
function deepmerge(target, source, options = {
    clone: true
}) {
    const output = options.clone ? {
        ...target
    } : target;
    if (isPlainObject(target) && isPlainObject(source)) {
        Object.keys(source).forEach((key)=>{
            if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElement"](source[key]) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$is$40$19$2e$3$2e$0$2f$node_modules$2f$react$2d$is$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElementType"])(source[key])) {
                output[key] = source[key];
            } else if (isPlainObject(source[key]) && // Avoid prototype pollution
            Object.prototype.hasOwnProperty.call(target, key) && isPlainObject(target[key])) {
                // Since `output` is a clone of `target` and we have narrowed `target` in this block we can cast to the same type.
                output[key] = deepmerge(target[key], source[key], options);
            } else if (options.clone) {
                output[key] = isPlainObject(source[key]) ? deepClone(source[key]) : source[key];
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/capitalize/capitalize.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>capitalize
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
;
function capitalize(string) {
    if (typeof string !== 'string') {
        throw new Error(("TURBOPACK compile-time truthy", 1) ? 'MUI: `capitalize(string)` expects a string argument.' : "TURBOPACK unreachable");
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/getDisplayName/getDisplayName.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>getDisplayName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$is$40$19$2e$3$2e$0$2f$node_modules$2f$react$2d$is$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-is@19.3.0/node_modules/react-is/index.js [app-client] (ecmascript)");
;
function getFunctionComponentName(Component, fallback = '') {
    return Component.displayName || Component.name || fallback;
}
function getWrappedName(outerType, innerType, wrapperName) {
    const functionName = getFunctionComponentName(innerType);
    return outerType.displayName || (functionName !== '' ? `${wrapperName}(${functionName})` : wrapperName);
}
function getDisplayName(Component) {
    if (Component == null) {
        return undefined;
    }
    if (typeof Component === 'string') {
        return Component;
    }
    if (typeof Component === 'function') {
        return getFunctionComponentName(Component, 'Component');
    }
    // TypeScript can't have components as objects but they exist in the form of `memo` or `Suspense`
    if (typeof Component === 'object') {
        switch(Component.$$typeof){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$is$40$19$2e$3$2e$0$2f$node_modules$2f$react$2d$is$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForwardRef"]:
                return getWrappedName(Component, Component.render, 'ForwardRef');
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$is$40$19$2e$3$2e$0$2f$node_modules$2f$react$2d$is$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Memo"]:
                return getWrappedName(Component, Component.type, 'memo');
            default:
                return undefined;
        }
    }
    return undefined;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/fastDeepAssign/fastDeepAssign.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Based on https://github.com/TehShrike/deepmerge
// Based on https://github.com/fastify/deepmerge
// MIT License
// Copyright (c) 2012 - 2022 James Halliday, Josh Duff, and other contributors of deepmerge
/* eslint-disable no-else-return */ /**
 * Assigns props from one object to another. Focused on performance, only normal objects with no
 * prototype are supported.
 */ __turbopack_context__.s([
    "default",
    ()=>fastDeepAssign
]);
function fastDeepAssign(target, source) {
    const sourceIsArray = Array.isArray(source);
    const targetIsArray = Array.isArray(target);
    if (isPrimitive(source)) {
        return source;
    } else if (isPrimitiveOrBuiltIn(target)) {
        return clone(source);
    } else if (sourceIsArray && targetIsArray) {
        return mergeArray(target, source);
    } else if (sourceIsArray !== targetIsArray) {
        return clone(source);
    } else {
        return mergeObject(target, source);
    }
}
function cloneArray(value) {
    let i = 0;
    const il = value.length;
    const result = new Array(il);
    for(i = 0; i < il; i += 1){
        result[i] = clone(value[i]);
    }
    return result;
}
function cloneObject(target) {
    const result = {};
    for(const key in target){
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }
        result[key] = clone(target[key]);
    }
    return result;
}
function mergeArray(target, source) {
    const tl = target.length;
    for(let i = 0; i < source.length; i += 1){
        target[tl + i] = clone(source[i]);
    }
    return target;
}
function isMergeableObject(value) {
    return typeof value === 'object' && value !== null && !(value instanceof RegExp) && !(value instanceof Date);
}
function isPrimitive(value) {
    return typeof value !== 'object' || value === null;
}
function isPrimitiveOrBuiltIn(value) {
    return typeof value !== 'object' || value === null || value instanceof RegExp || value instanceof Date;
}
function clone(entry) {
    // eslint-disable-next-line no-nested-ternary
    return isMergeableObject(entry) ? Array.isArray(entry) ? cloneArray(entry) : cloneObject(entry) : entry;
}
function mergeObject(target, source) {
    for(const key in source){
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }
        if (key in target) {
            target[key] = fastDeepAssign(target[key], source[key]);
        } else {
            target[key] = clone(source[key]);
        }
    }
    return target;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/clamp/clamp.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
function clamp(val, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
    return Math.max(min, Math.min(val, max));
}
const __TURBOPACK__default__export__ = clamp;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/ClassNameGenerator/ClassNameGenerator.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const defaultGenerator = (componentName)=>componentName;
const createClassNameGenerator = ()=>{
    let generate = defaultGenerator;
    return {
        configure (generator) {
            generate = generator;
        },
        generate (componentName) {
            return generate(componentName);
        },
        reset () {
            generate = defaultGenerator;
        }
    };
};
const ClassNameGenerator = createClassNameGenerator();
const __TURBOPACK__default__export__ = ClassNameGenerator;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/generateUtilityClass/generateUtilityClass.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>generateUtilityClass,
    "globalStateClasses",
    ()=>globalStateClasses,
    "isGlobalState",
    ()=>isGlobalState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$ClassNameGenerator$2f$ClassNameGenerator$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/ClassNameGenerator/ClassNameGenerator.mjs [app-client] (ecmascript)");
;
const globalStateClasses = {
    active: 'active',
    checked: 'checked',
    completed: 'completed',
    disabled: 'disabled',
    error: 'error',
    expanded: 'expanded',
    focused: 'focused',
    focusVisible: 'focusVisible',
    open: 'open',
    readOnly: 'readOnly',
    required: 'required',
    selected: 'selected'
};
function generateUtilityClass(componentName, slot, globalStatePrefix = 'Mui') {
    const globalStateClass = globalStateClasses[slot];
    return globalStateClass ? `${globalStatePrefix}-${globalStateClass}` : `${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$ClassNameGenerator$2f$ClassNameGenerator$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].generate(componentName)}-${slot}`;
}
function isGlobalState(slot) {
    return globalStateClasses[slot] !== undefined;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/resolveProps/resolveProps.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>resolveProps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
;
function resolveProps(defaultProps, props, mergeClassNameAndStyle = false) {
    const output = {
        ...props
    };
    for(const key in defaultProps){
        if (Object.prototype.hasOwnProperty.call(defaultProps, key)) {
            const propName = key;
            if (propName === 'components' || propName === 'slots') {
                output[propName] = {
                    ...defaultProps[propName],
                    ...output[propName]
                };
            } else if (propName === 'componentsProps' || propName === 'slotProps') {
                const defaultSlotProps = defaultProps[propName];
                const slotProps = props[propName];
                if (!slotProps) {
                    output[propName] = defaultSlotProps || {};
                } else if (!defaultSlotProps) {
                    output[propName] = slotProps;
                } else {
                    output[propName] = {
                        ...slotProps
                    };
                    for(const slotKey in defaultSlotProps){
                        if (Object.prototype.hasOwnProperty.call(defaultSlotProps, slotKey)) {
                            const slotPropName = slotKey;
                            const defaultSlotPropValue = defaultSlotProps[slotPropName];
                            const slotPropValue = slotProps[slotPropName];
                            if (typeof defaultSlotPropValue === 'function' || typeof slotPropValue === 'function') {
                                // Function slot props are resolved later (with `ownerState`), so defer
                                // the merge until then to avoid dropping either side.
                                output[propName][slotPropName] = (...args)=>resolveProps((typeof defaultSlotPropValue === 'function' ? defaultSlotPropValue(...args) : defaultSlotPropValue) ?? {}, (typeof slotPropValue === 'function' ? slotPropValue(...args) : slotPropValue) ?? {}, mergeClassNameAndStyle);
                            } else {
                                output[propName][slotPropName] = resolveProps(defaultSlotPropValue ?? {}, slotPropValue ?? {}, mergeClassNameAndStyle);
                            }
                        }
                    }
                }
            } else if (propName === 'className' && mergeClassNameAndStyle && props.className !== undefined) {
                output.className = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(defaultProps?.className, props?.className);
            } else if (propName === 'style' && mergeClassNameAndStyle && props.style) {
                output.style = {
                    ...defaultProps?.style,
                    ...props?.style
                };
            } else if (output[propName] === undefined) {
                output[propName] = defaultProps[propName];
            }
        }
    }
    return output;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/chainPropTypes/chainPropTypes.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>chainPropTypes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function chainPropTypes(propType1, propType2) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return function validate(...args) {
        return propType1(...args) || propType2(...args);
    };
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/elementTypeAcceptingRef/elementTypeAcceptingRef.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$chainPropTypes$2f$chainPropTypes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/chainPropTypes/chainPropTypes.mjs [app-client] (ecmascript)");
;
;
;
function isClassComponent(elementType) {
    // elementType.prototype?.isReactComponent
    const { prototype = {} } = elementType;
    return Boolean(prototype.isReactComponent);
}
function elementTypeAcceptingRef(props, propName, componentName, location, propFullName) {
    const propValue = props[propName];
    const safePropName = propFullName || propName;
    if (propValue == null || // When server-side rendering React doesn't warn either.
    // This is not an accurate check for SSR.
    // This is only in place for emotion compat.
    // TODO: Revisit once https://github.com/react/react/issues/20047 is resolved.
    typeof window === 'undefined') {
        return null;
    }
    let warningHint;
    /**
   * Blacklisting instead of whitelisting
   *
   * Blacklisting will miss some components, such as React.Fragment. Those will at least
   * trigger a warning in React.
   * We can't whitelist because there is no safe way to detect React.forwardRef
   * or class components. "Safe" means there's no public API.
   *
   */ if (typeof propValue === 'function' && !isClassComponent(propValue)) {
        warningHint = 'Did you accidentally provide a plain function component instead?';
    }
    if (propValue === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"]) {
        warningHint = 'Did you accidentally provide a React.Fragment instead?';
    }
    if (warningHint !== undefined) {
        // #host-reference
        return new Error(`Invalid ${location} \`${safePropName}\` supplied to \`${componentName}\`. ` + `Expected an element type that can hold a ref. ${warningHint} ` + 'For more information see https://mui.com/r/caveat-with-refs-guide');
    }
    return null;
}
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$chainPropTypes$2f$chainPropTypes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].elementType, elementTypeAcceptingRef);
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isHostComponent/isHostComponent.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
/**
 * Determines if a given element is a DOM element name (i.e. not a React component).
 */ function isHostComponent(element) {
    return typeof element === 'string';
}
const __TURBOPACK__default__export__ = isHostComponent;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/debounce/debounce.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Corresponds to 10 frames at 60 Hz.
// A few bytes payload overhead when lodash/debounce is ~3 kB and debounce ~300 B.
__turbopack_context__.s([
    "default",
    ()=>debounce
]);
function debounce(func, wait = 166) {
    let timeout;
    function debounced(...args) {
        const later = ()=>{
            // @ts-ignore
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    }
    debounced.clear = ()=>{
        clearTimeout(timeout);
    };
    return debounced;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useForkRef/useForkRef.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useForkRef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
function useForkRef(...refs) {
    const cleanupRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](undefined);
    const refEffect = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useForkRef.useCallback[refEffect]": (instance)=>{
            const cleanups = refs.map({
                "useForkRef.useCallback[refEffect].cleanups": (ref)=>{
                    if (ref == null) {
                        return null;
                    }
                    if (typeof ref === 'function') {
                        const refCallback = ref;
                        const refCleanup = refCallback(instance);
                        return typeof refCleanup === 'function' ? refCleanup : ({
                            "useForkRef.useCallback[refEffect].cleanups": ()=>{
                                refCallback(null);
                            }
                        })["useForkRef.useCallback[refEffect].cleanups"];
                    }
                    ref.current = instance;
                    return ({
                        "useForkRef.useCallback[refEffect].cleanups": ()=>{
                            ref.current = null;
                        }
                    })["useForkRef.useCallback[refEffect].cleanups"];
                }
            }["useForkRef.useCallback[refEffect].cleanups"]);
            return ({
                "useForkRef.useCallback[refEffect]": ()=>{
                    cleanups.forEach({
                        "useForkRef.useCallback[refEffect]": (refCleanup)=>refCleanup?.()
                    }["useForkRef.useCallback[refEffect]"]);
                }
            })["useForkRef.useCallback[refEffect]"];
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
        }
    }["useForkRef.useCallback[refEffect]"], refs);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useForkRef.useMemo": ()=>{
            if (refs.every({
                "useForkRef.useMemo": (ref)=>ref == null
            }["useForkRef.useMemo"])) {
                return null;
            }
            return ({
                "useForkRef.useMemo": (value)=>{
                    if (cleanupRef.current) {
                        cleanupRef.current();
                        cleanupRef.current = undefined;
                    }
                    if (value != null) {
                        cleanupRef.current = refEffect(value);
                    }
                }
            })["useForkRef.useMemo"];
        // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler -- intentionally ignoring that the dependency array must be an array literal
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
        }
    }["useForkRef.useMemo"], refs);
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEnhancedEffect/useEnhancedEffect.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
/**
 * A version of `React.useLayoutEffect` that does not show a warning when server-side rendering.
 * This is useful for effects that are only needed for client-side rendering but not for SSR.
 *
 * Before you use this hook, make sure to read https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
 * and confirm it doesn't apply to your use-case.
 */ const useEnhancedEffect = typeof window !== 'undefined' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"];
const __TURBOPACK__default__export__ = useEnhancedEffect;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEventCallback/useEventCallback.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEnhancedEffect/useEnhancedEffect.mjs [app-client] (ecmascript)");
'use client';
;
;
/**
 * Inspired by https://github.com/react/react/issues/14099#issuecomment-440013892
 * See RFC in https://github.com/reactjs/rfcs/pull/220
 */ function useEventCallback(fn) {
    const ref = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](fn);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useEventCallback.useEnhancedEffect": ()=>{
            ref.current = fn;
        }
    }["useEventCallback.useEnhancedEffect"]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"]({
        "useEventCallback.useRef": (...args)=>// @ts-expect-error hide `this`
            (0, ref.current)(...args)
    }["useEventCallback.useRef"]).current;
}
const __TURBOPACK__default__export__ = useEventCallback;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/ownerDocument/ownerDocument.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ownerDocument
]);
function ownerDocument(node) {
    return node && node.ownerDocument || document;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/ownerWindow/ownerWindow.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ownerWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$ownerDocument$2f$ownerDocument$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/ownerDocument/ownerDocument.mjs [app-client] (ecmascript)");
;
function ownerWindow(node) {
    const doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$ownerDocument$2f$ownerDocument$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(node);
    return doc.defaultView || window;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/getActiveElement/getActiveElement.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Gets the actual active element, traversing through shadow roots if necessary.
 *
 * When an element inside a shadow root has focus, `document.activeElement` returns
 * the shadow host element. This function recursively traverses shadow roots to find
 * the actual focused element.
 *
 * @param root - The document or shadow root to start the search from.
 * @returns The actual focused element, or null if no element has focus.
 *
 * @example
 * // In a shadow DOM context
 * const activeElement = getActiveElement(document);
 * // Returns the actual focused element inside the shadow root
 *
 * @example
 * // Starting from a specific document
 * const activeElement = getActiveElement(ownerDocument(element));
 */ __turbopack_context__.s([
    "default",
    ()=>activeElement
]);
function activeElement(doc) {
    let element = doc.activeElement;
    while(element?.shadowRoot?.activeElement != null){
        element = element.shadowRoot.activeElement;
    }
    return element;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/generateUtilityClasses/generateUtilityClasses.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>generateUtilityClasses
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$generateUtilityClass$2f$generateUtilityClass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/generateUtilityClass/generateUtilityClass.mjs [app-client] (ecmascript)");
;
function generateUtilityClasses(componentName, slots, globalStatePrefix = 'Mui') {
    const result = {};
    slots.forEach((slot)=>{
        result[slot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$generateUtilityClass$2f$generateUtilityClass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(componentName, slot, globalStatePrefix);
    });
    return result;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/appendOwnerState/appendOwnerState.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isHostComponent$2f$isHostComponent$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isHostComponent/isHostComponent.mjs [app-client] (ecmascript)");
;
/**
 * Type of the ownerState based on the type of an element it applies to.
 * This resolves to the provided OwnerState for React components and `undefined` for host components.
 * Falls back to `OwnerState | undefined` when the exact type can't be determined in development time.
 */ /**
 * Appends the ownerState object to the props, merging with the existing one if necessary.
 *
 * @param elementType Type of the element that owns the `existingProps`. If the element is a DOM node or undefined, `ownerState` is not applied.
 * @param otherProps Props of the element.
 * @param ownerState
 */ function appendOwnerState(elementType, otherProps, ownerState) {
    if (elementType === undefined || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isHostComponent$2f$isHostComponent$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(elementType)) {
        return otherProps;
    }
    return {
        ...otherProps,
        ownerState: {
            ...otherProps.ownerState,
            ...ownerState
        }
    };
}
const __TURBOPACK__default__export__ = appendOwnerState;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/resolveComponentProps/resolveComponentProps.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
/**
 * If `componentProps` is a function, calls it with the provided `ownerState`.
 * Otherwise, just returns `componentProps`.
 */ function resolveComponentProps(componentProps, ownerState, /**
 * @deprecated Not used internally and will be removed in the next major version.
 */ slotState) {
    if (typeof componentProps === 'function') {
        return componentProps(ownerState, slotState);
    }
    return componentProps;
}
const __TURBOPACK__default__export__ = resolveComponentProps;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isEventHandler/isEventHandler.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Brought from [Base UI](https://github.com/mui/base-ui/blob/master/packages/react/src/merge-props/mergeProps.ts#L119)
// Use it directly from Base UI once it's a package dependency.
__turbopack_context__.s([
    "default",
    ()=>isEventHandler
]);
function isEventHandler(key, value) {
    // This approach is more efficient than using a regex.
    const thirdCharCode = key.charCodeAt(2);
    return key[0] === 'o' && key[1] === 'n' && thirdCharCode >= 65 /* A */  && thirdCharCode <= 90 /* Z */  && typeof value === 'function';
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/extractEventHandlers/extractEventHandlers.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isEventHandler$2f$isEventHandler$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isEventHandler/isEventHandler.mjs [app-client] (ecmascript)");
;
/**
 * Extracts event handlers from a given object.
 * A prop is considered an event handler if it is a function and its name starts with `on`.
 *
 * @param object An object to extract event handlers from.
 */ function extractEventHandlers(object) {
    if (object === undefined) {
        return {};
    }
    const result = {};
    const keys = Object.keys(object);
    for(let i = 0; i < keys.length; i += 1){
        const key = keys[i];
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isEventHandler$2f$isEventHandler$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, object[key])) {
            result[key] = object[key];
        }
    }
    return result;
}
const __TURBOPACK__default__export__ = extractEventHandlers;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/omitEventHandlers/omitEventHandlers.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isEventHandler$2f$isEventHandler$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isEventHandler/isEventHandler.mjs [app-client] (ecmascript)");
;
/**
 * Removes event handlers from the given object.
 * A field is considered an event handler if it is a function with a name beginning with `on`.
 *
 * @param object Object to remove event handlers from.
 * @returns Object with event handlers removed.
 */ function omitEventHandlers(object) {
    if (object === undefined) {
        return {};
    }
    const result = {};
    const keys = Object.keys(object);
    for(let i = 0; i < keys.length; i += 1){
        const key = keys[i];
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isEventHandler$2f$isEventHandler$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, object[key])) {
            result[key] = object[key];
        }
    }
    return result;
}
const __TURBOPACK__default__export__ = omitEventHandlers;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/mergeSlotProps/mergeSlotProps.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$extractEventHandlers$2f$extractEventHandlers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/extractEventHandlers/extractEventHandlers.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$omitEventHandlers$2f$omitEventHandlers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/omitEventHandlers/omitEventHandlers.mjs [app-client] (ecmascript)");
;
;
;
/**
 * Merges the slot component internal props (usually coming from a hook)
 * with the externally provided ones.
 *
 * The merge order is (the latter overrides the former):
 * 1. The internal props (specified as a getter function to work with get*Props hook result)
 * 2. Additional props (specified internally on a Base UI component)
 * 3. External props specified on the owner component. These should only be used on a root slot.
 * 4. External props specified in the `slotProps.*` prop.
 * 5. The `className` prop - combined from all the above.
 * @param parameters
 * @returns
 */ function mergeSlotProps(parameters) {
    const { getSlotProps, additionalProps, externalSlotProps, externalForwardedProps, className } = parameters;
    if (!getSlotProps) {
        // The simpler case - getSlotProps is not defined, so no internal event handlers are defined,
        // so we can simply merge all the props without having to worry about extracting event handlers.
        const joinedClasses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(additionalProps?.className, className, externalForwardedProps?.className, externalSlotProps?.className);
        const props = {
            ...additionalProps,
            ...externalForwardedProps,
            ...externalSlotProps
        };
        if (joinedClasses.length > 0) {
            props.className = joinedClasses;
        }
        if (additionalProps?.style || externalForwardedProps?.style || externalSlotProps?.style) {
            const mergedStyle = {
                ...additionalProps?.style,
                ...externalForwardedProps?.style,
                ...externalSlotProps?.style
            };
            if (Object.keys(mergedStyle).length > 0) {
                props.style = mergedStyle;
            }
        }
        return {
            props,
            internalRef: undefined
        };
    }
    // In this case, getSlotProps is responsible for calling the external event handlers.
    // We don't need to include them in the merged props because of this.
    const eventHandlers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$extractEventHandlers$2f$extractEventHandlers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        ...externalForwardedProps,
        ...externalSlotProps
    });
    const componentsPropsWithoutEventHandlers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$omitEventHandlers$2f$omitEventHandlers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(externalSlotProps);
    const otherPropsWithoutEventHandlers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$omitEventHandlers$2f$omitEventHandlers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(externalForwardedProps);
    const internalSlotProps = getSlotProps(eventHandlers);
    // The order of classes is important here.
    // Emotion (that we use in libraries consuming Base UI) depends on this order
    // to properly override style. It requires the most important classes to be last
    // (see https://github.com/mui/material-ui/pull/33205) for the related discussion.
    const joinedClasses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(internalSlotProps?.className, additionalProps?.className, className, externalForwardedProps?.className, externalSlotProps?.className);
    const props = {
        ...internalSlotProps,
        ...additionalProps,
        ...otherPropsWithoutEventHandlers,
        ...componentsPropsWithoutEventHandlers
    };
    if (joinedClasses.length > 0) {
        props.className = joinedClasses;
    }
    if (internalSlotProps?.style || additionalProps?.style || externalForwardedProps?.style || externalSlotProps?.style) {
        const mergedStyle = {
            ...internalSlotProps?.style,
            ...additionalProps?.style,
            ...externalForwardedProps?.style,
            ...externalSlotProps?.style
        };
        if (Object.keys(mergedStyle).length > 0) {
            props.style = mergedStyle;
        }
    }
    return {
        props,
        internalRef: internalSlotProps.ref
    };
}
const __TURBOPACK__default__export__ = mergeSlotProps;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isMuiElement/isMuiElement.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>isMuiElement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function isMuiElement(element, muiNames) {
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElement"](element) && muiNames.indexOf(// For server components `muiName` is available in element.type._payload.value.muiName
    // relevant info - https://github.com/react/react/blob/2807d781a08db8e9873687fccc25c0f12b4fb3d4/packages/react/src/ReactLazy.js#L45
    // eslint-disable-next-line no-underscore-dangle
    element.type.muiName ?? element.type?._payload?.value?.muiName) !== -1;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/getReactElementRef/getReactElementRef.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>getReactElementRef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function getReactElementRef(element) {
    // 'ref' is passed as prop in React 19, whereas 'ref' is directly attached to children in older versions
    if (parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"], 10) >= 19) {
        return element?.props?.ref || null;
    }
    // @ts-expect-error element.ref is not included in the ReactElement type
    // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/70189
    return element?.ref || null;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useLazyRef/useLazyRef.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useLazyRef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
const UNINITIALIZED = {};
function useLazyRef(init, initArg) {
    const ref = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](UNINITIALIZED);
    if (ref.current === UNINITIALIZED) {
        ref.current = init(initArg);
    }
    return ref;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useOnMount/useOnMount.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useOnMount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
const EMPTY = [];
function useOnMount(fn) {
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler -- no need to put `fn` in the dependency array
    /* eslint-disable react-hooks/exhaustive-deps */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"](fn, EMPTY);
/* eslint-enable react-hooks/exhaustive-deps */ }
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useTimeout/useTimeout.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Timeout",
    ()=>Timeout,
    "default",
    ()=>useTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useLazyRef$2f$useLazyRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useLazyRef/useLazyRef.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useOnMount$2f$useOnMount$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useOnMount/useOnMount.mjs [app-client] (ecmascript)");
'use client';
;
;
class Timeout {
    static create() {
        return new Timeout();
    }
    currentId = null;
    /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */ start(delay, fn) {
        this.clear();
        this.currentId = setTimeout(()=>{
            this.currentId = null;
            fn();
        }, delay);
    }
    clear = ()=>{
        if (this.currentId !== null) {
            clearTimeout(this.currentId);
            this.currentId = null;
        }
    };
    disposeEffect = ()=>{
        return this.clear;
    };
}
function useTimeout() {
    const timeout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useLazyRef$2f$useLazyRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(Timeout.create).current;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useOnMount$2f$useOnMount$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(timeout.disposeEffect);
    return timeout;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/HTMLElementType/HTMLElementType.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HTMLElementType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function HTMLElementType(props, propName, componentName, location, propFullName) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const propValue = props[propName];
    const safePropName = propFullName || propName;
    if (propValue == null) {
        return null;
    }
    if (propValue && propValue.nodeType !== 1) {
        return new Error(`Invalid ${location} \`${safePropName}\` supplied to \`${componentName}\`. ` + `Expected an HTMLElement.`);
    }
    return null;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useSlotProps/useSlotProps.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useForkRef$2f$useForkRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useForkRef/useForkRef.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$appendOwnerState$2f$appendOwnerState$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/appendOwnerState/appendOwnerState.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$mergeSlotProps$2f$mergeSlotProps$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/mergeSlotProps/mergeSlotProps.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$resolveComponentProps$2f$resolveComponentProps$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/resolveComponentProps/resolveComponentProps.mjs [app-client] (ecmascript)");
'use client';
;
;
;
;
/**
 * @ignore - do not document.
 * Builds the props to be passed into the slot of an unstyled component.
 * It merges the internal props of the component with the ones supplied by the user, allowing to customize the behavior.
 * If the slot component is not a host component, it also merges in the `ownerState`.
 *
 * @param parameters.getSlotProps - A function that returns the props to be passed to the slot component.
 */ function useSlotProps(parameters) {
    const { elementType, externalSlotProps, ownerState, skipResolvingSlotProps = false, ...other } = parameters;
    const resolvedComponentsProps = skipResolvingSlotProps ? {} : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$resolveComponentProps$2f$resolveComponentProps$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(externalSlotProps, ownerState);
    const { props: mergedProps, internalRef } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$mergeSlotProps$2f$mergeSlotProps$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        ...other,
        externalSlotProps: resolvedComponentsProps
    });
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useForkRef$2f$useForkRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(internalRef, resolvedComponentsProps?.ref, parameters.additionalProps?.ref);
    const props = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$appendOwnerState$2f$appendOwnerState$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(elementType, {
        ...mergedProps,
        ref
    }, ownerState);
    return props;
}
const __TURBOPACK__default__export__ = useSlotProps;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/fastObjectShallowCompare/fastObjectShallowCompare.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>fastObjectShallowCompare
]);
// From mui-x: https://github.com/mui/mui-x/blob/bb92fb0adac6764461adea9a9d7d43f1095f49e5/packages/x-internals/src/fastObjectShallowCompare/fastObjectShallowCompare.ts
/* eslint-disable guard-for-in */ const is = Object.is;
function fastObjectShallowCompare(a, b) {
    if (a === b) {
        return true;
    }
    if (!(a instanceof Object) || !(b instanceof Object)) {
        return false;
    }
    let aLength = 0;
    let bLength = 0;
    for(const key in a){
        aLength += 1;
        if (!is(a[key], b[key])) {
            return false;
        }
        if (!(key in b)) {
            return false;
        }
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
    for(const _ in b){
        bLength += 1;
    }
    return aLength === bLength;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/setRef/setRef.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * TODO v5: consider making it private
 *
 * passes {value} to {ref}
 *
 * WARNING: Be sure to only call this inside a callback that is passed as a ref.
 * Otherwise, make sure to cleanup the previous {ref} if it changes. See
 * https://github.com/mui/material-ui/issues/13539
 *
 * Useful if you want to expose the ref of an inner component to the public API
 * while still using it inside the component.
 * @param ref A ref callback or ref object. If anything falsy, this is a no-op.
 */ __turbopack_context__.s([
    "default",
    ()=>setRef
]);
function setRef(ref, value) {
    if (typeof ref === 'function') {
        ref(value);
    } else if (ref) {
        ref.current = value;
    }
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useRovingTabIndex/RovingTabIndexContext.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RovingTabIndexContext",
    ()=>RovingTabIndexContext,
    "useRovingTabIndexContext",
    ()=>useRovingTabIndexContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
const RovingTabIndexContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"](undefined);
if ("TURBOPACK compile-time truthy", 1) {
    RovingTabIndexContext.displayName = 'RovingTabIndexContext';
}
function useRovingTabIndexContext() {
    const context = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"](RovingTabIndexContext);
    if (context === undefined) {
        throw new Error('MUI: RovingTabIndexContext is missing. Roving tab index items must be placed within a roving tab index provider.');
    }
    return context;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useRovingTabIndex/useRovingTabIndex.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isItemFocusable",
    ()=>isItemFocusable,
    "useRovingTabIndexItem",
    ()=>useRovingTabIndexItem,
    "useRovingTabIndexRoot",
    ()=>useRovingTabIndexRoot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastObjectShallowCompare$2f$fastObjectShallowCompare$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/fastObjectShallowCompare/fastObjectShallowCompare.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$getActiveElement$2f$getActiveElement$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/getActiveElement/getActiveElement.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$ownerDocument$2f$ownerDocument$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/ownerDocument/ownerDocument.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$setRef$2f$setRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/setRef/setRef.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEnhancedEffect/useEnhancedEffect.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEventCallback$2f$useEventCallback$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEventCallback/useEventCallback.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useForkRef$2f$useForkRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useForkRef/useForkRef.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useRovingTabIndex$2f$RovingTabIndexContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useRovingTabIndex/RovingTabIndexContext.mjs [app-client] (ecmascript)");
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
const SUPPORTED_KEYS = [
    'ArrowRight',
    'ArrowLeft',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End'
];
function useRovingTabIndexRoot(params) {
    const { activeItemId: activeItemIdProp, getDefaultActiveItemId, orientation, isRtl = false, isItemFocusable: itemFilter = isItemFocusable, wrap = true } = params;
    const [activeItemIdState, setActiveItemIdState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](activeItemIdProp);
    const [previousActiveItemIdProp, setPreviousActiveItemIdProp] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](activeItemIdProp);
    let activeItemIdCandidate = activeItemIdState;
    if (activeItemIdProp !== previousActiveItemIdProp) {
        setPreviousActiveItemIdProp(activeItemIdProp);
        if (activeItemIdProp !== undefined && activeItemIdProp !== activeItemIdState) {
            activeItemIdCandidate = activeItemIdProp;
            setActiveItemIdState(activeItemIdProp);
        }
    }
    const containerRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    // based on https://github.com/mui/base-ui/blob/7392a928fca91fcc68b9fad3439ac61e10f3f7ba/packages/react/src/composite/list/CompositeList.tsx#L25-L35
    const itemMapRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](new Map());
    const [mapTick, setMapTick] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    const orderedItems = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useRovingTabIndexRoot.useMemo[orderedItems]": ()=>{
            void mapTick;
            return getOrderedItems(itemMapRef.current);
        }
    }["useRovingTabIndexRoot.useMemo[orderedItems]"], [
        mapTick
    ]);
    const resolvedActiveItemId = resolveActiveItemId(activeItemIdCandidate, orderedItems, itemFilter, getDefaultActiveItemId);
    const activeItemIdRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](resolvedActiveItemId);
    activeItemIdRef.current = resolvedActiveItemId;
    const getActiveItem = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useRovingTabIndexRoot.useCallback[getActiveItem]": ()=>{
            const snapshot = getOrderedItems(itemMapRef.current);
            const resolvedItemId = resolveActiveItemId(activeItemIdRef.current, snapshot, itemFilter, getDefaultActiveItemId);
            return getItemById(snapshot, resolvedItemId);
        }
    }["useRovingTabIndexRoot.useCallback[getActiveItem]"], [
        getDefaultActiveItemId,
        itemFilter
    ]);
    const getItemMap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useRovingTabIndexRoot.useCallback[getItemMap]": ()=>{
            return itemMapRef.current;
        }
    }["useRovingTabIndexRoot.useCallback[getItemMap]"], []);
    const registerItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEventCallback$2f$useEventCallback$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useRovingTabIndexRoot.useEventCallback[registerItem]": (item)=>{
            const previousItem = itemMapRef.current.get(item.id);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastObjectShallowCompare$2f$fastObjectShallowCompare$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(previousItem ?? null, item)) {
                return;
            }
            itemMapRef.current.set(item.id, item);
            setMapTick({
                "useRovingTabIndexRoot.useEventCallback[registerItem]": (value)=>value + 1
            }["useRovingTabIndexRoot.useEventCallback[registerItem]"]);
        }
    }["useRovingTabIndexRoot.useEventCallback[registerItem]"]);
    const unregisterItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEventCallback$2f$useEventCallback$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useRovingTabIndexRoot.useEventCallback[unregisterItem]": (itemId)=>{
            if (itemMapRef.current.delete(itemId)) {
                setMapTick({
                    "useRovingTabIndexRoot.useEventCallback[unregisterItem]": (value)=>value + 1
                }["useRovingTabIndexRoot.useEventCallback[unregisterItem]"]);
            }
        }
    }["useRovingTabIndexRoot.useEventCallback[unregisterItem]"]);
    const setActiveItemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEventCallback$2f$useEventCallback$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useRovingTabIndexRoot.useEventCallback[setActiveItemId]": (itemId)=>{
            setActiveItemIdState(itemId);
        }
    }["useRovingTabIndexRoot.useEventCallback[setActiveItemId]"]);
    const isItemActive = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useRovingTabIndexRoot.useCallback[isItemActive]": (itemId)=>{
            return activeItemIdRef.current === itemId;
        }
    }["useRovingTabIndexRoot.useCallback[isItemActive]"], []);
    // Moves focus relative to a starting index. This is the directional helper used by
    // keyboard navigation and `focusNext()`.
    const focusItem = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useRovingTabIndexRoot.useCallback[focusItem]": (currentIndex, direction, wrap, isItemFocusableOverride)=>{
            const snapshot = getNavigableItemsSnapshot(itemMapRef.current);
            const nextItem = getNextActiveItem(snapshot, currentIndex, direction, wrap, isItemFocusableOverride ?? itemFilter);
            if (!nextItem) {
                return null;
            }
            nextItem.element?.focus();
            setActiveItemIdState(nextItem.id);
            return nextItem;
        }
    }["useRovingTabIndexRoot.useCallback[focusItem]"], [
        itemFilter
    ]);
    const getContainerProps = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useRovingTabIndexRoot.useCallback[getContainerProps]": (ref, onFocusProp, onKeyDownProp)=>{
            const onFocus = {
                "useRovingTabIndexRoot.useCallback[getContainerProps].onFocus": (event)=>{
                    onFocusProp?.(event);
                    const snapshot = getNavigableItemsSnapshot(itemMapRef.current);
                    const focusedIndex = findItemIndexByElement(snapshot, event.target);
                    if (focusedIndex !== -1) {
                        setActiveItemIdState(snapshot[focusedIndex].id);
                    }
                }
            }["useRovingTabIndexRoot.useCallback[getContainerProps].onFocus"];
            const onKeyDown = {
                "useRovingTabIndexRoot.useCallback[getContainerProps].onKeyDown": (event)=>{
                    onKeyDownProp?.(event);
                    if (event.defaultPrevented || event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) {
                        return;
                    }
                    if (!SUPPORTED_KEYS.includes(event.key)) {
                        return;
                    }
                    let previousItemKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
                    let nextItemKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
                    if (orientation === 'horizontal' && isRtl) {
                        previousItemKey = 'ArrowRight';
                        nextItemKey = 'ArrowLeft';
                    }
                    const snapshot = getNavigableItemsSnapshot(itemMapRef.current);
                    const currentFocus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$getActiveElement$2f$getActiveElement$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$ownerDocument$2f$ownerDocument$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(containerRef.current));
                    const isFocusOnContainer = currentFocus === containerRef.current;
                    let currentIndex = getCurrentActiveItemIndex(snapshot, currentFocus, activeItemIdRef.current);
                    let direction = 'next';
                    switch(event.key){
                        case previousItemKey:
                            direction = 'previous';
                            event.preventDefault();
                            if (isFocusOnContainer) {
                                // Set to length, so that the previous focused element will be the last one.
                                currentIndex = snapshot.length;
                            }
                            break;
                        case nextItemKey:
                            event.preventDefault();
                            if (isFocusOnContainer) {
                                currentIndex = -1;
                            }
                            break;
                        case 'Home':
                            event.preventDefault();
                            currentIndex = -1;
                            break;
                        case 'End':
                            event.preventDefault();
                            direction = 'previous';
                            currentIndex = snapshot.length;
                            break;
                        default:
                            return;
                    }
                    focusItem(currentIndex, direction, wrap);
                }
            }["useRovingTabIndexRoot.useCallback[getContainerProps].onKeyDown"];
            return {
                onFocus,
                onKeyDown,
                ref: handleRefs(ref, {
                    "useRovingTabIndexRoot.useCallback[getContainerProps]": (elementNode)=>{
                        containerRef.current = elementNode;
                    }
                }["useRovingTabIndexRoot.useCallback[getContainerProps]"])
            };
        }
    }["useRovingTabIndexRoot.useCallback[getContainerProps]"], [
        focusItem,
        isRtl,
        orientation,
        wrap
    ]);
    const focusNext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useRovingTabIndexRoot.useCallback[focusNext]": (isItemFocusableOverride)=>{
            const snapshot = getNavigableItemsSnapshot(itemMapRef.current);
            const currentFocus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$getActiveElement$2f$getActiveElement$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$ownerDocument$2f$ownerDocument$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(containerRef.current));
            const isFocusOnContainer = currentFocus === containerRef.current;
            const currentIndex = isFocusOnContainer ? -1 : getCurrentActiveItemIndex(snapshot, currentFocus, activeItemIdRef.current);
            return focusItem(currentIndex, 'next', true, isItemFocusableOverride)?.id ?? null;
        }
    }["useRovingTabIndexRoot.useCallback[focusNext]"], [
        focusItem
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useRovingTabIndexRoot.useMemo": ()=>({
                activeItemId: resolvedActiveItemId,
                focusNext,
                getActiveItem,
                getContainerProps,
                getItemMap,
                isItemActive,
                registerItem,
                setActiveItemId,
                unregisterItem
            })
    }["useRovingTabIndexRoot.useMemo"], [
        resolvedActiveItemId,
        focusNext,
        getActiveItem,
        getContainerProps,
        getItemMap,
        isItemActive,
        registerItem,
        setActiveItemId,
        unregisterItem
    ]);
}
function useRovingTabIndexItem(params) {
    const rootContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useRovingTabIndex$2f$RovingTabIndexContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRovingTabIndexContext"])();
    const { activeItemId, registerItem, unregisterItem } = rootContext;
    const elementRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const item = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useRovingTabIndexItem.useMemo[item]": ()=>({
                disabled: params.disabled ?? false,
                element: null,
                focusableWhenDisabled: params.focusableWhenDisabled ?? false,
                id: params.id,
                selected: params.selected ?? false,
                textValue: params.textValue
            })
    }["useRovingTabIndexItem.useMemo[item]"], [
        params.disabled,
        params.focusableWhenDisabled,
        params.id,
        params.selected,
        params.textValue
    ]);
    const latestItemRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](item);
    // Keep the ref callback stable across item prop changes. The callback reads the latest
    // item metadata from this ref so React does not have to detach and re-attach the ref
    // every time `disabled`, `selected`, or similar item state changes.
    latestItemRef.current = item;
    const handleElementRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useRovingTabIndexItem.useCallback[handleElementRef]": (element)=>{
            elementRef.current = element;
            if (element == null) {
                // Ref detachment runs during React's commit phase. Calling `unregisterItem()`
                // synchronously here can trigger a nested state update while React is still
                // finishing that commit. Unregister in a microtask so it runs after the
                // commit completes.
                queueMicrotask({
                    "useRovingTabIndexItem.useCallback[handleElementRef]": ()=>{
                        // null check prevents stale unregisters for a remove-then-re-add edge case
                        if (elementRef.current == null) {
                            unregisterItem(params.id);
                        }
                    }
                }["useRovingTabIndexItem.useCallback[handleElementRef]"]);
                return;
            }
            registerItem({
                ...latestItemRef.current,
                element
            });
        }
    }["useRovingTabIndexItem.useCallback[handleElementRef]"], [
        params.id,
        registerItem,
        unregisterItem
    ]);
    // `UseRovingTabIndexItemReturnValue.ref` must always be a callback ref. `useForkRef()`
    // is typed to return `null` when every input ref is nullish, but this call always includes
    // `handleElementRef`, so the merged ref cannot be `null` here.
    const mergedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useForkRef$2f$useForkRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(params.ref, handleElementRef);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useRovingTabIndexItem.useEnhancedEffect": ()=>{
            if (!elementRef.current) {
                return;
            }
            registerItem({
                ...item,
                element: elementRef.current
            });
        }
    }["useRovingTabIndexItem.useEnhancedEffect"], [
        item,
        registerItem
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useRovingTabIndexItem.useEnhancedEffect": ()=>{
            const itemId = params.id;
            // Keep unmount cleanup separate from the effect above. The effect above re-runs when
            // item metadata changes, but we only want to unregister on unmount or when the item id changes.
            return ({
                "useRovingTabIndexItem.useEnhancedEffect": ()=>{
                    unregisterItem(itemId);
                }
            })["useRovingTabIndexItem.useEnhancedEffect"];
        }
    }["useRovingTabIndexItem.useEnhancedEffect"], [
        params.id,
        unregisterItem
    ]);
    return {
        ref: mergedRef,
        tabIndex: activeItemId === params.id ? 0 : -1
    };
}
/**
 * Resolves which item id should own the roving tab stop for the current render.
 *
 * This is the top-level decision point for "who gets `tabIndex=0` right now?".
 * For example:
 * - `Tabs` sometimes passes `selectedValue` as `activeItemId` so the selected tab becomes
 *   the tab stop when focus enters the list from outside.
 * - `MenuList` leaves `activeItemId` undefined and relies on the default-item logic below
 *   so that menu-specific rules decide which menu item should initially own the tab stop.
 *
 * @param activeItemId The item id supplied through the root hook's `activeItemId` option.
 *   `undefined` means "the caller did not ask for a specific item, use the default-item
 *   logic instead". `null` means "there is intentionally no preferred item, so also fall
 *   back to the default-item logic".
 * @param items The ordered registered items currently in the roving set.
 * @param isFocusable A predicate that decides whether an item may receive roving focus.
 * @param getDefaultActiveItemId Optional caller-provided function that picks the preferred
 *   default item when `activeItemId` is not driving the tab stop directly.
 * @returns The id of the item that should own `tabIndex=0`, or `null` if no item is focusable.
 */ function resolveActiveItemId(activeItemId, items, isFocusable, getDefaultActiveItemId) {
    if (activeItemId != null) {
        return resolveRequestedItemId(activeItemId, items, isFocusable);
    }
    return resolveDefaultItemId(items, isFocusable, getDefaultActiveItemId);
}
/**
 * Resolves the item id supplied through the root hook's `activeItemId` option.
 *
 * This path is used when a component such as `Tabs` or `MenuList` wants roving focus to
 * follow a specific logical item. For example, `Tabs` can pass the selected tab's value as
 * `activeItemId` so that the selected tab owns `tabIndex=0` when focus enters the list.
 *
 * @param requestedItemId The item id passed to the root hook's `activeItemId` option.
 * @param items The ordered registered items currently in the roving set.
 * @param isFocusable A predicate that decides whether an item may receive roving focus.
 * @returns The same id when it still points to a focusable item. If that id no longer exists,
 *   returns the first focusable item. If the id still exists but the item is not focusable,
 *   returns the next focusable item after it without wrapping.
 */ function resolveRequestedItemId(requestedItemId, items, isFocusable) {
    const requestedItemIndex = findItemIndexById(items, requestedItemId);
    if (requestedItemIndex === -1) {
        return getFirstFocusableItemId(items, isFocusable);
    }
    if (isFocusable(items[requestedItemIndex])) {
        return items[requestedItemIndex].id;
    }
    return getNextActiveItem(items, requestedItemIndex, 'next', false, isFocusable)?.id ?? null;
}
/**
 * Resolves the default active item when the caller is not driving roving focus with
 * `activeItemId`.
 *
 * This path is used on the initial render and whenever the caller leaves the choice of tab
 * stop to the hook. `getDefaultActiveItemId` lets a component prefer a specific logical item
 * before falling back to the first focusable item.
 *
 * For example:
 * - `MenuList` uses this path all the time. When `variant="selectedMenu"`, it prefers the
 *   selected menu item; otherwise it prefers the first focusable menu item.
 * - `Tabs` uses this path while focus is already inside the tab list, because at that point
 *   the current roving position should be driven by actual focus movement rather than by the
 *   selected tab value.
 *
 * @param items The ordered registered items currently in the roving set.
 * @param isFocusable A predicate that decides whether an item may receive roving focus.
 * @param getDefaultActiveItemId Optional caller-provided function that chooses which item
 *   should own the tab stop before the generic "first focusable item" fallback runs.
 * @returns The default item id when it points to a focusable item, otherwise the first
 *   focusable item in the snapshot, or `null` when none are focusable.
 */ function resolveDefaultItemId(items, isFocusable, getDefaultActiveItemId) {
    const defaultItemId = getDefaultActiveItemId?.(items);
    if (defaultItemId != null) {
        const defaultItem = getItemById(items, defaultItemId);
        if (defaultItem && isFocusable(defaultItem)) {
            return defaultItem.id;
        }
    }
    return getFirstFocusableItemId(items, isFocusable);
}
/**
 * Finds the best starting index for keyboard navigation.
 *
 * This is used immediately before keyboard navigation and `focusNext()` navigation. It prefers
 * the item that currently holds DOM focus, but if focus is on the container or outside the item
 * set it falls back to the last known active item id.
 *
 * @param items The navigable item snapshot used for the current keyboard interaction.
 * @param currentFocus The element that currently has DOM focus, if any.
 * @param fallbackActiveItemId The last known active item id when focus is not on an item.
 * @returns The focused item's index when focus is currently on an item. Otherwise, the index
 *   of the fallback active item id, or `-1` when no matching item exists.
 */ function getCurrentActiveItemIndex(items, currentFocus, fallbackActiveItemId) {
    if (currentFocus) {
        const focusedIndex = findItemIndexByElement(items, currentFocus);
        if (focusedIndex !== -1) {
            return focusedIndex;
        }
    }
    return findItemIndexById(items, fallbackActiveItemId);
}
/**
 * Walks the item snapshot to find the next focusable item in the requested direction.
 *
 * This is the shared navigation primitive used by keyboard handling and imperative helpers
 * such as `focusNext()`. It starts from the supplied index, advances through the snapshot in
 * the requested direction, and skips over items that fail the `isFocusable` predicate.
 *
 * @param items The ordered navigable item snapshot.
 * @param currentIndex The index to start from. Use `-1` to start before the first item or
 *   `items.length` to start after the last item.
 * @param direction The direction to move through the snapshot.
 * @param wrap Whether navigation should wrap around at the ends of the list.
 * @param isFocusable A predicate that decides whether an item may receive roving focus.
 * @returns The next focusable item record, or `null` when no focusable item can be reached.
 */ function getNextActiveItem(items, currentIndex, direction, wrap, isFocusable) {
    const lastIndex = items.length - 1;
    if (lastIndex === -1) {
        return null;
    }
    let wrappedOnce = false;
    let nextIndex = getNextIndex(currentIndex, lastIndex, direction, wrap);
    const startIndex = nextIndex;
    while(nextIndex !== -1){
        if (nextIndex === startIndex) {
            if (wrappedOnce) {
                return null;
            }
            wrappedOnce = true;
        }
        const nextItem = items[nextIndex];
        if (!nextItem || !isFocusable(nextItem)) {
            nextIndex = getNextIndex(nextIndex, lastIndex, direction, wrap);
        } else {
            return nextItem;
        }
    }
    return null;
}
function getFirstFocusableItemId(items, isFocusable) {
    return items.find((item)=>isFocusable(item))?.id ?? null;
}
function getItemById(items, itemId) {
    return itemId == null ? null : items.find((item)=>item.id === itemId) ?? null;
}
function findItemIndexById(items, itemId) {
    return itemId == null ? -1 : items.findIndex((item)=>item.id === itemId);
}
function findItemIndexByElement(items, element) {
    if (!element) {
        return -1;
    }
    return items.findIndex((item)=>item.element === element || item.element?.contains(element));
}
function getOrderedItems(itemMap) {
    const items = Array.from(itemMap.values());
    if (items.every((item)=>item.element == null)) {
        return items;
    }
    const connectedItems = items.filter(isConnectedItem).sort((itemA, itemB)=>sortByDocumentPosition(itemA.element, itemB.element));
    const disconnectedItems = items.filter((item)=>!isConnectedItem(item));
    return [
        ...connectedItems,
        ...disconnectedItems
    ];
}
function getNavigableItemsSnapshot(itemMap) {
    return getOrderedItems(itemMap).filter(isConnectedItem);
}
function getNextIndex(currentIndex, lastIndex, direction, wrap = true) {
    if (direction === 'next') {
        if (currentIndex === lastIndex) {
            return wrap ? 0 : -1;
        }
        return currentIndex + 1;
    }
    if (currentIndex === 0) {
        return wrap ? lastIndex : -1;
    }
    return currentIndex - 1;
}
function isItemFocusable(item) {
    if (!item.element) {
        return false;
    }
    if (item.focusableWhenDisabled) {
        return true;
    }
    return !item.disabled && !item.element.hasAttribute('disabled') && item.element.getAttribute('aria-disabled') !== 'true' && item.element.hasAttribute('tabindex');
}
function isConnectedItem(item) {
    return item.element != null && item.element.isConnected;
}
/* eslint-disable no-bitwise */ function sortByDocumentPosition(a, b) {
    if (a === b) {
        return 0;
    }
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        return -1;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
        return 1;
    }
    return 0;
}
/* eslint-enable no-bitwise */ function handleRefs(...refs) {
    return (node)=>{
        refs.forEach((ref)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$setRef$2f$setRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(ref ?? null, node);
        });
    };
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/contains/contains.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Copied from @base-ui/utils
 *
 * Shadow DOM-aware containment check.
 *
 * Native `parent.contains(child)` returns `false` when the child is inside a
 * shadow root that is a descendant of the parent. This function handles that
 * case by traversing up through shadow root hosts.
 *
 * @param parent - The potential ancestor element.
 * @param child - The potential descendant element.
 * @returns Whether `parent` contains `child`, even across shadow root boundaries.
 */ __turbopack_context__.s([
    "default",
    ()=>contains
]);
function contains(parent, child) {
    if (!parent || !child) {
        return false;
    }
    // First, attempt with the faster native method.
    if (parent.contains(child)) {
        return true;
    }
    // Then fall back to traversing out of shadow roots when needed.
    const rootNode = child.getRootNode?.();
    if (rootNode && rootNode instanceof ShadowRoot) {
        let next = child;
        while(next){
            if (parent === next) {
                return true;
            }
            next = next.parentNode ?? next.host ?? null;
        }
    }
    return false;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/getScrollbarSize/getScrollbarSize.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// A change of the browser zoom change the scrollbar size.
// Credit https://github.com/twbs/bootstrap/blob/488fd8afc535ca3a6ad4dc581f5e89217b6a36ac/js/src/util/scrollbar.js#L14-L18
__turbopack_context__.s([
    "default",
    ()=>getScrollbarSize
]);
function getScrollbarSize(win = window) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
    const documentWidth = win.document.documentElement.clientWidth;
    return win.innerWidth - documentWidth;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/integerPropType/integerPropType.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getTypeByValue",
    ()=>getTypeByValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function getTypeByValue(value) {
    const valueType = typeof value;
    switch(valueType){
        case 'number':
            if (Number.isNaN(value)) {
                return 'NaN';
            }
            if (!Number.isFinite(value)) {
                return 'Infinity';
            }
            if (value !== Math.floor(value)) {
                return 'float';
            }
            return 'number';
        case 'object':
            if (value === null) {
                return 'null';
            }
            return value.constructor.name;
        default:
            return valueType;
    }
}
function requiredInteger(props, propName, componentName, location) {
    const propValue = props[propName];
    if (propValue == null || !Number.isInteger(propValue)) {
        const propType = getTypeByValue(propValue);
        return new RangeError(`Invalid ${location} \`${propName}\` of type \`${propType}\` supplied to \`${componentName}\`, expected \`integer\`.`);
    }
    return null;
}
function validator(props, propName, componentName, location) {
    const propValue = props[propName];
    if (propValue === undefined) {
        return null;
    }
    return requiredInteger(props, propName, componentName, location);
}
function validatorNoop() {
    return null;
}
validator.isRequired = requiredInteger;
validatorNoop.isRequired = validatorNoop;
const integerPropType = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : validator;
const __TURBOPACK__default__export__ = integerPropType;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/elementAcceptingRef/elementAcceptingRef.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$chainPropTypes$2f$chainPropTypes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/chainPropTypes/chainPropTypes.mjs [app-client] (ecmascript)");
;
;
function isClassComponent(elementType) {
    // elementType.prototype?.isReactComponent
    const { prototype = {} } = elementType;
    return Boolean(prototype.isReactComponent);
}
function acceptingRef(props, propName, componentName, location, propFullName) {
    const element = props[propName];
    const safePropName = propFullName || propName;
    if (element == null || // When server-side rendering React doesn't warn either.
    // This is not an accurate check for SSR.
    // This is only in place for Emotion compat.
    // TODO: Revisit once https://github.com/react/react/issues/20047 is resolved.
    typeof window === 'undefined') {
        return null;
    }
    let warningHint;
    const elementType = element.type;
    /**
   * Blacklisting instead of whitelisting
   *
   * Blacklisting will miss some components, such as React.Fragment. Those will at least
   * trigger a warning in React.
   * We can't whitelist because there is no safe way to detect React.forwardRef
   * or class components. "Safe" means there's no public API.
   *
   */ if (typeof elementType === 'function' && !isClassComponent(elementType)) {
        warningHint = 'Did you accidentally use a plain function component for an element instead?';
    }
    if (warningHint !== undefined) {
        return new Error(`Invalid ${location} \`${safePropName}\` supplied to \`${componentName}\`. ` + `Expected an element that can hold a ref. ${warningHint} ` + 'For more information see https://mui.com/r/caveat-with-refs-guide');
    }
    return null;
}
const elementAcceptingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$chainPropTypes$2f$chainPropTypes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].element, acceptingRef);
elementAcceptingRef.isRequired = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$chainPropTypes$2f$chainPropTypes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].element.isRequired, acceptingRef);
const __TURBOPACK__default__export__ = elementAcceptingRef;
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useValueAsRef/useValueAsRef.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useValueAsRef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEnhancedEffect/useEnhancedEffect.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useLazyRef$2f$useLazyRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useLazyRef/useLazyRef.mjs [app-client] (ecmascript)");
'use client';
;
;
function useValueAsRef(value) {
    const latest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useLazyRef$2f$useLazyRef$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "useValueAsRef.useLazyRef": ()=>createValueRef(value)
    }["useValueAsRef.useLazyRef"]).current;
    latest.next = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- effect never changes; it reads latest.next.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(latest.effect);
    return latest;
}
function createValueRef(value) {
    const latest = {
        current: value,
        next: value,
        effect: ()=>{
            latest.current = latest.next;
        }
    };
    return latest;
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/exactProp/exactProp.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>exactProp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// This module is based on https://github.com/airbnb/prop-types-exact repository.
// However, in order to reduce the number of dependencies and to remove some extra safe checks
// the module was forked.
const specialProperty = 'exact-prop: \u200b';
function exactProp(propTypes) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return {
        ...propTypes,
        [specialProperty]: (props)=>{
            const unsupportedProps = Object.keys(props).filter((prop)=>!propTypes.hasOwnProperty(prop));
            if (unsupportedProps.length > 0) {
                return new Error(`The following props are not supported: ${unsupportedProps.map((prop)=>`\`${prop}\``).join(', ')}. Please remove them.`);
            }
            return null;
        }
    };
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/createChainedFunction/createChainedFunction.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Safe chained function.
 *
 * Will only create a new function if needed,
 * otherwise will pass back existing functions or null.
 */ __turbopack_context__.s([
    "default",
    ()=>createChainedFunction
]);
function createChainedFunction(...funcs) {
    return funcs.reduce((acc, func)=>{
        if (func == null) {
            return acc;
        }
        return function chainedFunction(...args) {
            acc.apply(this, args);
            func.apply(this, args);
        };
    }, ()=>{});
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useControlled/useControlled.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useControlled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler -- process.env never changes, dependency arrays are intentionally ignored
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
function useControlled(props) {
    const { controlled, default: defaultProp, name, state = 'value' } = props;
    // isControlled is ignored in the hook dependency lists as it should never change.
    const { current: isControlled } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](controlled !== undefined);
    const [valueState, setValue] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](defaultProp);
    const value = isControlled ? controlled : valueState;
    if ("TURBOPACK compile-time truthy", 1) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
            "useControlled.useEffect": ()=>{
                if (isControlled !== (controlled !== undefined)) {
                    console.error([
                        `MUI: A component is changing the ${isControlled ? '' : 'un'}controlled ${state} state of ${name} to be ${isControlled ? 'un' : ''}controlled.`,
                        'Elements should not switch from uncontrolled to controlled (or vice versa).',
                        `Decide between using a controlled or uncontrolled ${name} ` + 'element for the lifetime of the component.',
                        "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.",
                        'More info: https://fb.me/react-controlled-components'
                    ].join('\n'));
                }
            }
        }["useControlled.useEffect"], [
            state,
            name,
            controlled
        ]);
        const { current: defaultValue } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](defaultProp);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
            "useControlled.useEffect": ()=>{
                if (!isControlled && JSON.stringify(defaultProp) !== JSON.stringify(defaultValue)) {
                    console.error([
                        `MUI: A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. ` + `To suppress this warning opt to use a controlled ${name}.`
                    ].join('\n'));
                }
            }
        }["useControlled.useEffect"], [
            JSON.stringify(defaultProp)
        ]);
    }
    const setValueIfUncontrolled = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useControlled.useCallback[setValueIfUncontrolled]": (newValue)=>{
            if (!isControlled) {
                setValue(newValue);
            }
        }
    }["useControlled.useCallback[setValueIfUncontrolled]"], []);
    // TODO: provide overloads for the useControlled function to account for the case where either
    // controlled or default is not undefined.
    // In that case the return type should be [T, React.Dispatch<React.SetStateAction<T>>]
    // otherwise it should be [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]
    return [
        value,
        setValueIfUncontrolled
    ];
}
}),
"[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isFocusVisible/isFocusVisible.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Returns a boolean indicating if the event's target has :focus-visible
 */ __turbopack_context__.s([
    "default",
    ()=>isFocusVisible
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function isFocusVisible(element) {
    try {
        return element.matches(':focus-visible');
    } catch (error) {
        // Do not warn on jsdom tests, otherwise all tests that rely on focus have to be skipped
        // Tests that rely on `:focus-visible` will still have to be skipped in jsdom
        if (("TURBOPACK compile-time value", "development") !== 'production' && !window.navigator.userAgent.includes('jsdom')) {
            console.warn([
                'MUI: The `:focus-visible` pseudo class is not supported in this browser.',
                'Some components rely on this feature to work properly.'
            ].join('\n'));
        }
    }
    return false;
}
}),
]);

//# sourceMappingURL=0fbm_%40mui_utils_0vjh1jw._.js.map