module.exports = [
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createBreakpoints/createBreakpoints.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sorted ASC by size. That's important.
// It can't be configured as it's used statically for propTypes.
__turbopack_context__.s([
    "breakpointKeys",
    ()=>breakpointKeys,
    "default",
    ()=>createBreakpoints
]);
const breakpointKeys = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl'
];
// Keep in sync with docs/src/pages/customization/breakpoints/breakpoints.md
// #host-reference
const sortBreakpointsValues = (values)=>{
    const breakpointsAsArray = Object.keys(values).map((key)=>({
            key,
            val: values[key]
        })) || [];
    // Sort in ascending order
    breakpointsAsArray.sort((breakpoint1, breakpoint2)=>breakpoint1.val - breakpoint2.val);
    return breakpointsAsArray.reduce((acc, obj)=>{
        return {
            ...acc,
            [obj.key]: obj.val
        };
    }, {});
};
function createBreakpoints(breakpoints) {
    const { values = {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536
    }, unit = 'px', step = 5, ...other } = breakpoints;
    const sortedValues = sortBreakpointsValues(values);
    const keys = Object.keys(sortedValues);
    function up(key) {
        const value = typeof values[key] === 'number' ? values[key] : key;
        return `@media (min-width:${value}${unit})`;
    }
    function down(key) {
        const value = typeof values[key] === 'number' ? values[key] : key;
        return `@media (max-width:${value - step / 100}${unit})`;
    }
    function between(start, end) {
        const endIndex = keys.indexOf(end);
        return `@media (min-width:${typeof values[start] === 'number' ? values[start] : start}${unit}) and ` + `(max-width:${(endIndex !== -1 && typeof values[keys[endIndex]] === 'number' ? values[keys[endIndex]] : end) - step / 100}${unit})`;
    }
    function only(key) {
        if (keys.indexOf(key) + 1 < keys.length) {
            return between(key, keys[keys.indexOf(key) + 1]);
        }
        return up(key);
    }
    function not(key) {
        // handle first and last key separately, for better readability
        const keyIndex = keys.indexOf(key);
        if (keyIndex === 0) {
            return up(keys[1]);
        }
        if (keyIndex === keys.length - 1) {
            return down(keys[keyIndex]);
        }
        return between(key, keys[keys.indexOf(key) + 1]).replace('@media', '@media not all and');
    }
    const mediaKeys = [];
    for(let i = 0; i < keys.length; i += 1){
        mediaKeys.push(up(keys[i]));
    }
    return {
        keys: keys,
        values: sortedValues,
        up,
        down,
        between,
        only,
        not,
        unit,
        internal_mediaKeys: mediaKeys,
        ...other
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssContainerQueries/cssContainerQueries.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>cssContainerQueries,
    "getContainerQuery",
    ()=>getContainerQuery,
    "isCqShorthand",
    ()=>isCqShorthand,
    "sortContainerQueries",
    ()=>sortContainerQueries
]);
const MIN_WIDTH_PATTERN = /min-width:\s*([0-9.]+)/;
function sortContainerQueries(theme, css) {
    if (!theme.containerQueries || !hasContainerQuery(css)) {
        return css;
    }
    const keys = [];
    for(const key in css){
        if (key.startsWith('@container')) {
            keys.push(key);
        }
    }
    keys.sort((a, b)=>{
        return +(a.match(MIN_WIDTH_PATTERN)?.[1] || 0) - +(b.match(MIN_WIDTH_PATTERN)?.[1] || 0);
    });
    const result = css;
    for(let i = 0; i < keys.length; i += 1){
        const key = keys[i];
        const value = result[key];
        delete result[key];
        result[key] = value;
    }
    return result;
}
function hasContainerQuery(css) {
    for(const key in css){
        if (key.startsWith('@container')) {
            return true;
        }
    }
    return false;
}
function isCqShorthand(breakpointKeys, value) {
    return value === '@' || value.startsWith('@') && (breakpointKeys.some((key)=>value.startsWith(`@${key}`)) || !!value.match(/^@\d/));
}
function getContainerQuery(theme, shorthand) {
    const matches = shorthand.match(/^@([^/]+)?\/?(.+)?$/);
    if (!matches) {
        if ("TURBOPACK compile-time truthy", 1) {
            // TODO: avoid throwing during React render only in development.
            // eslint-disable-next-line mui/no-guarded-throw
            throw /* minify-error */ new Error(`MUI: The provided shorthand ${`(${shorthand})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.\n` + 'For example, `@sm` or `@600` or `@40rem/sidebar`.');
        }
        return null;
    }
    const [, containerQuery, containerName] = matches;
    const value = Number.isNaN(+containerQuery) ? containerQuery || 0 : +containerQuery;
    return theme.containerQueries(containerName).up(value);
}
function cssContainerQueries(themeInput) {
    const toContainerQuery = (mediaQuery, name)=>mediaQuery.replace('@media', name ? `@container ${name}` : '@container');
    function attachCq(node, name) {
        node.up = (...args)=>toContainerQuery(themeInput.breakpoints.up(...args), name);
        node.down = (...args)=>toContainerQuery(themeInput.breakpoints.down(...args), name);
        node.between = (...args)=>toContainerQuery(themeInput.breakpoints.between(...args), name);
        node.only = (...args)=>toContainerQuery(themeInput.breakpoints.only(...args), name);
        node.not = (...args)=>{
            const result = toContainerQuery(themeInput.breakpoints.not(...args), name);
            if (result.includes('not all and')) {
                // `@container` does not work with `not all and`, so need to invert the logic
                return result.replace('not all and ', '').replace('min-width:', 'width<').replace('max-width:', 'width>').replace('and', 'or');
            }
            return result;
        };
    }
    const node = {};
    const containerQueries = (name)=>{
        attachCq(node, name);
        return node;
    };
    attachCq(containerQueries);
    return {
        ...themeInput,
        containerQueries
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/shape.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const shape = {
    borderRadius: 4
};
const __TURBOPACK__default__export__ = shape;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/responsivePropType/responsivePropType.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
;
const responsivePropType = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].oneOfType([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].number,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].array
]) : "TURBOPACK unreachable";
const __TURBOPACK__default__export__ = responsivePropType;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/merge/merge.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
;
const options = {
    clone: false
};
function merge(acc, item) {
    if (!item) {
        return acc;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(acc, item, options);
}
const __TURBOPACK__default__export__ = merge;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/breakpoints/breakpoints.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_BREAKPOINTS",
    ()=>DEFAULT_BREAKPOINTS,
    "computeBreakpointsBase",
    ()=>computeBreakpointsBase,
    "createEmptyBreakpointObject",
    ()=>createEmptyBreakpointObject,
    "default",
    ()=>__TURBOPACK__default__export__,
    "handleBreakpoints",
    ()=>handleBreakpoints,
    "hasBreakpoint",
    ()=>hasBreakpoint,
    "iterateBreakpoints",
    ()=>iterateBreakpoints,
    "mergeBreakpointsInOrder",
    ()=>mergeBreakpointsInOrder,
    "removeUnusedBreakpoints",
    ()=>removeUnusedBreakpoints,
    "resolveBreakpointValues",
    ()=>resolveBreakpointValues,
    "values",
    ()=>values
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isObjectEmpty$2f$isObjectEmpty$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isObjectEmpty/isObjectEmpty.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/fastDeepAssign/fastDeepAssign.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$merge$2f$merge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/merge/merge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssContainerQueries/cssContainerQueries.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createBreakpoints$2f$createBreakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createBreakpoints/createBreakpoints.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
const EMPTY_THEME = {};
const values = {
    xs: 0,
    // phone
    sm: 600,
    // tablet
    md: 900,
    // small laptop
    lg: 1200,
    // desktop
    xl: 1536 // large screen
};
const DEFAULT_BREAKPOINTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createBreakpoints$2f$createBreakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    values: values
});
const defaultContainerQueries = {
    containerQueries: (containerName)=>({
            up: (key)=>{
                let result = typeof key === 'number' ? key : values[key] || key;
                if (typeof result === 'number') {
                    result = `${result}px`;
                }
                return containerName ? `@container ${containerName} (min-width:${result})` : `@container (min-width:${result})`;
            }
        })
};
function handleBreakpoints(props, propValue, styleFromPropValue) {
    const result = {};
    return iterateBreakpoints(result, props.theme, propValue, (mediaKey, value, initialKey)=>{
        const finalValue = styleFromPropValue(value, initialKey);
        if (mediaKey) {
            result[mediaKey] = finalValue;
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(result, finalValue);
        }
    });
}
function iterateBreakpoints(target, theme, propValue, callback) {
    theme ??= EMPTY_THEME;
    if (Array.isArray(propValue)) {
        const breakpoints = theme.breakpoints ?? DEFAULT_BREAKPOINTS;
        for(let i = 0; i < propValue.length; i += 1){
            buildBreakpoint(target, breakpoints.up(breakpoints.keys[i]), propValue[i], undefined, callback);
        }
        return target;
    }
    if (typeof propValue === 'object') {
        const breakpoints = theme.breakpoints ?? DEFAULT_BREAKPOINTS;
        const breakpointValues = breakpoints.values ?? values;
        for(const key in propValue){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isCqShorthand"])(breakpoints.keys, key)) {
                const containerKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getContainerQuery"])(theme.containerQueries ? theme : defaultContainerQueries, key);
                if (containerKey) {
                    buildBreakpoint(target, containerKey, propValue[key], key, callback);
                }
            } else if (key in breakpointValues) {
                const mediaKey = breakpoints.up(key);
                buildBreakpoint(target, mediaKey, propValue[key], key, callback);
            } else {
                const cssKey = key;
                target[cssKey] = propValue[cssKey];
            }
        }
        return target;
    }
    callback(undefined, propValue);
    return target;
}
function buildBreakpoint(target, mediaKey, value, initialKey, callback) {
    target[mediaKey] ??= {};
    callback(mediaKey, value, initialKey);
}
function setupBreakpoints(styleFunction) {
    const newStyleFunction = (props)=>{
        const theme = props.theme || {};
        const base = styleFunction(props);
        const themeBreakpoints = theme.breakpoints || DEFAULT_BREAKPOINTS;
        const extended = themeBreakpoints.keys.reduce((acc, key)=>{
            if (props[key]) {
                acc = acc || {};
                acc[themeBreakpoints.up(key)] = styleFunction({
                    theme,
                    ...props[key]
                });
            }
            return acc;
        }, null);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$merge$2f$merge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(base, extended);
    };
    newStyleFunction.propTypes = ("TURBOPACK compile-time truthy", 1) ? {
        ...styleFunction.propTypes,
        xs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object,
        sm: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object,
        md: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object,
        lg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object,
        xl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object
    } : "TURBOPACK unreachable";
    newStyleFunction.filterProps = [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        ...styleFunction.filterProps
    ];
    return newStyleFunction;
}
function createEmptyBreakpointObject(breakpoints = DEFAULT_BREAKPOINTS) {
    const { internal_mediaKeys: mediaKeys } = breakpoints;
    const result = {};
    for(let i = 0; i < mediaKeys.length; i += 1){
        result[mediaKeys[i]] = {};
    }
    return result;
}
function removeUnusedBreakpoints(breakpoints, style) {
    const breakpointKeys = breakpoints.internal_mediaKeys;
    for(let i = 0; i < breakpointKeys.length; i += 1){
        const key = breakpointKeys[i];
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isObjectEmpty$2f$isObjectEmpty$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(style[key])) {
            delete style[key];
        }
    }
    return style;
}
function mergeBreakpointsInOrder(breakpoints, ...styles) {
    const emptyBreakpoints = createEmptyBreakpointObject(breakpoints);
    const mergedOutput = [
        emptyBreakpoints,
        ...styles
    ].reduce((prev, next)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(prev, next), {});
    return removeUnusedBreakpoints(breakpoints, mergedOutput);
}
function computeBreakpointsBase(breakpointValues, themeBreakpoints) {
    if (typeof breakpointValues !== 'object') {
        return {};
    }
    const base = {};
    const breakpointsKeys = Object.keys(themeBreakpoints);
    if (Array.isArray(breakpointValues)) {
        breakpointsKeys.forEach((breakpoint, i)=>{
            if (i < breakpointValues.length) {
                base[breakpoint] = true;
            }
        });
    } else {
        breakpointsKeys.forEach((breakpoint)=>{
            if (breakpointValues[breakpoint] != null) {
                base[breakpoint] = true;
            }
        });
    }
    return base;
}
function resolveBreakpointValues(options) {
    const { values: breakpointValues, breakpoints: themeBreakpoints, base: customBase } = options;
    const base = customBase || computeBreakpointsBase(breakpointValues, themeBreakpoints);
    const keys = Object.keys(base);
    if (keys.length === 0) {
        return breakpointValues;
    }
    let previous;
    return keys.reduce((acc, breakpoint, i)=>{
        if (Array.isArray(breakpointValues)) {
            acc[breakpoint] = breakpointValues[i] != null ? breakpointValues[i] : breakpointValues[previous];
            previous = i;
        } else if (typeof breakpointValues === 'object' && breakpointValues) {
            const bv = breakpointValues;
            acc[breakpoint] = bv[breakpoint] != null ? bv[breakpoint] : bv[previous];
            previous = breakpoint;
        } else {
            acc[breakpoint] = breakpointValues;
        }
        return acc;
    }, {});
}
function hasBreakpoint(breakpoints, value) {
    if (Array.isArray(value)) {
        return true;
    }
    if (typeof value === 'object' && value !== null) {
        for(let i = 0; i < breakpoints.keys.length; i += 1){
            if (breakpoints.keys[i] in value) {
                return true;
            }
        }
        const valueKeys = Object.keys(value);
        for(let i = 0; i < valueKeys.length; i += 1){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isCqShorthand"])(breakpoints.keys, valueKeys[i])) {
                return true;
            }
        }
    }
    return false;
}
const __TURBOPACK__default__export__ = setupBreakpoints;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/style/style.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>style,
    "getPath",
    ()=>getPath,
    "getStyleValue",
    ()=>getStyleValue,
    "getStyleValue2",
    ()=>getStyleValue2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$capitalize$2f$capitalize$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/capitalize/capitalize.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/responsivePropType/responsivePropType.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/breakpoints/breakpoints.mjs [app-ssr] (ecmascript)");
;
;
;
function getStyleValue(themeMapping, transform, valueFinal, userValue = valueFinal) {
    let value;
    if (typeof themeMapping === 'function') {
        value = themeMapping(valueFinal);
    } else if (Array.isArray(themeMapping)) {
        value = themeMapping[valueFinal] || userValue;
    } else if (typeof valueFinal === 'string') {
        value = getPath(themeMapping, valueFinal) || userValue;
    } else {
        value = userValue;
    }
    if (transform) {
        value = transform(value, userValue, themeMapping);
    }
    return value;
}
function getStyleValue2(themeMapping, transform, userValue, alternateProp) {
    let value;
    if (typeof themeMapping === 'function') {
        value = themeMapping(userValue);
    } else if (Array.isArray(themeMapping)) {
        value = themeMapping[userValue] || userValue;
    } else if (typeof userValue === 'string') {
        value = getPath(themeMapping, userValue, true, alternateProp) || userValue;
    } else {
        value = userValue;
    }
    if (transform) {
        value = transform(value, userValue, themeMapping);
    }
    return value;
}
function getPath(obj, pathInput, checkVars = true, alternateProp = undefined) {
    if (!obj || !pathInput) {
        return null;
    }
    const path = pathInput.split('.');
    // Check if CSS variables are used
    if (obj.vars && checkVars) {
        const val = getPathImpl(obj.vars, path, alternateProp);
        if (val != null) {
            return val;
        }
    }
    return getPathImpl(obj, path, alternateProp);
}
function getPathImpl(object, path, alternateProp = undefined) {
    let lastResult = undefined;
    let result = object;
    let index = 0;
    while(index < path.length){
        if (result === null || result === undefined) {
            return result;
        }
        lastResult = result;
        result = result[path[index]];
        index += 1;
    }
    if (alternateProp && result === undefined) {
        const lastKey = path[path.length - 1];
        const alternateKey = `${alternateProp}${lastKey === 'default' ? '' : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$capitalize$2f$capitalize$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(lastKey)}`;
        return lastResult?.[alternateKey];
    }
    return result;
}
function style(options) {
    const { prop, cssProperty = options.prop, themeKey, transform } = options;
    // eslint-disable-next-line react/function-component-definition
    const fn = (props)=>{
        if (props[prop] == null) {
            return null;
        }
        const propValue = props[prop];
        const theme = props.theme;
        const themeMapping = getPath(theme, themeKey) || {};
        const styleFromPropValue = (valueFinal)=>{
            const value = getStyleValue2(themeMapping, transform, valueFinal, prop);
            return cssProperty === false ? value : {
                [cssProperty]: value
            };
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleBreakpoints"])(props, propValue, styleFromPropValue);
    };
    fn.propTypes = ("TURBOPACK compile-time truthy", 1) ? {
        [prop]: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
    } : "TURBOPACK unreachable";
    fn.filterProps = [
        prop
    ];
    return fn;
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/spacing/spacing.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUnarySpacing",
    ()=>createUnarySpacing,
    "createUnaryUnit",
    ()=>createUnaryUnit,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getValue",
    ()=>getValue,
    "margin",
    ()=>margin,
    "marginKeys",
    ()=>marginKeys,
    "padding",
    ()=>padding,
    "paddingKeys",
    ()=>paddingKeys
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/responsivePropType/responsivePropType.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/breakpoints/breakpoints.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/style/style.mjs [app-ssr] (ecmascript)");
;
;
;
/* eslint-disable guard-for-in */ const EMPTY_THEME = {
    internal_cache: {}
};
const properties = {
    m: 'margin',
    p: 'padding'
};
const directions = {
    t: 'Top',
    r: 'Right',
    b: 'Bottom',
    l: 'Left',
    x: [
        'Left',
        'Right'
    ],
    y: [
        'Top',
        'Bottom'
    ]
};
const aliases = {
    marginX: 'mx',
    marginY: 'my',
    paddingX: 'px',
    paddingY: 'py'
};
const CSS_PROPERTIES = {};
for(const key in properties){
    CSS_PROPERTIES[key] = [
        properties[key]
    ];
}
for(const keyProperty in properties){
    for(const keyDirection in directions){
        const property = properties[keyProperty];
        const direction = directions[keyDirection];
        const value = Array.isArray(direction) ? direction.map((dir)=>property + dir) : [
            property + direction
        ];
        CSS_PROPERTIES[keyProperty + keyDirection] = value;
    }
}
for(const key in aliases){
    CSS_PROPERTIES[key] = CSS_PROPERTIES[aliases[key]];
}
const marginKeys = new Set([
    'm',
    'mt',
    'mr',
    'mb',
    'ml',
    'mx',
    'my',
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'marginX',
    'marginY',
    'marginInline',
    'marginInlineStart',
    'marginInlineEnd',
    'marginBlock',
    'marginBlockStart',
    'marginBlockEnd'
]);
const paddingKeys = new Set([
    'p',
    'pt',
    'pr',
    'pb',
    'pl',
    'px',
    'py',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'paddingX',
    'paddingY',
    'paddingInline',
    'paddingInlineStart',
    'paddingInlineEnd',
    'paddingBlock',
    'paddingBlockStart',
    'paddingBlockEnd'
]);
const spacingKeys = new Set([
    ...marginKeys,
    ...paddingKeys
]);
function createUnaryUnit(theme, themeKey, defaultValue, propName) {
    const themeSpacing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPath"])(theme, themeKey, true) ?? defaultValue;
    if (typeof themeSpacing === 'number' || typeof themeSpacing === 'string') {
        return (val)=>{
            if (typeof val === 'string') {
                return val;
            }
            if ("TURBOPACK compile-time truthy", 1) {
                if (typeof val !== 'number') {
                    console.error(`MUI: Expected ${propName} argument to be a number or a string, got ${val}.`);
                }
            }
            if (typeof themeSpacing === 'string') {
                if (themeSpacing.startsWith('var(') && val === 0) {
                    return 0;
                }
                if (themeSpacing.startsWith('var(') && val === 1) {
                    return themeSpacing;
                }
                return `calc(${val} * ${themeSpacing})`;
            }
            return themeSpacing * val;
        };
    }
    if (Array.isArray(themeSpacing)) {
        return (val)=>{
            if (typeof val === 'string') {
                return val;
            }
            const abs = Math.abs(val);
            if ("TURBOPACK compile-time truthy", 1) {
                if (!Number.isInteger(abs)) {
                    console.error([
                        `MUI: The \`theme.${themeKey}\` array type cannot be combined with non integer values.` + `You should either use an integer value that can be used as index, or define the \`theme.${themeKey}\` as a number.`
                    ].join('\n'));
                } else if (abs > themeSpacing.length - 1) {
                    console.error([
                        `MUI: The value provided (${abs}) overflows.`,
                        `The supported values are: ${JSON.stringify(themeSpacing)}.`,
                        `${abs} > ${themeSpacing.length - 1}, you need to add the missing values.`
                    ].join('\n'));
                }
            }
            const transformed = themeSpacing[abs];
            if (val >= 0) {
                return transformed;
            }
            if (typeof transformed === 'number') {
                return -transformed;
            }
            if (typeof transformed === 'string' && transformed.startsWith('var(')) {
                return `calc(-1 * ${transformed})`;
            }
            return `-${transformed}`;
        };
    }
    if (typeof themeSpacing === 'function') {
        return themeSpacing;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        console.error([
            `MUI: The \`theme.${themeKey}\` value (${themeSpacing}) is invalid.`,
            'It should be a number, an array or a function.'
        ].join('\n'));
    }
    return ()=>undefined;
}
function createUnarySpacing(theme) {
    return createUnaryUnit(theme, 'spacing', 8, 'spacing');
}
function getValue(transformer, propValue) {
    if (typeof propValue === 'string' || propValue == null) {
        return propValue;
    }
    return transformer(propValue);
}
// Avoid allocations
const container = [
    ''
];
function style(props, keys) {
    const theme = props.theme ?? EMPTY_THEME;
    const transformer = theme?.internal_cache?.unarySpacing ?? createUnarySpacing(theme);
    const result = {};
    for(const prop in props){
        if (!keys.has(prop)) {
            continue;
        }
        const cssProperties = CSS_PROPERTIES[prop] ?? (container[0] = prop, container);
        const propValue = props[prop];
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["iterateBreakpoints"])(result, props.theme, propValue, (mediaKey, value)=>{
            const target = mediaKey ? result[mediaKey] : result;
            for(let i = 0; i < cssProperties.length; i += 1){
                target[cssProperties[i]] = getValue(transformer, value);
            }
        });
    }
    return result;
}
function marginFn(props) {
    return style(props, marginKeys);
}
marginFn.propTypes = ("TURBOPACK compile-time truthy", 1) ? Array.from(marginKeys).reduce((obj, key)=>{
    obj[key] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
    return obj;
}, {}) : "TURBOPACK unreachable";
marginFn.filterProps = marginKeys;
const margin = marginFn;
function paddingFn(props) {
    return style(props, paddingKeys);
}
paddingFn.propTypes = ("TURBOPACK compile-time truthy", 1) ? Array.from(paddingKeys).reduce((obj, key)=>{
    obj[key] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
    return obj;
}, {}) : "TURBOPACK unreachable";
paddingFn.filterProps = paddingKeys;
const padding = paddingFn;
function spacingFn(props) {
    return style(props, spacingKeys);
}
spacingFn.propTypes = ("TURBOPACK compile-time truthy", 1) ? Array.from(spacingKeys).reduce((obj, key)=>{
    obj[key] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
    return obj;
}, {}) : "TURBOPACK unreachable";
spacingFn.filterProps = spacingKeys;
const spacing = spacingFn;
const __TURBOPACK__default__export__ = spacing;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createSpacing.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createSpacing
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/spacing/spacing.mjs [app-ssr] (ecmascript)");
;
function createSpacing(spacingInput = 8, // Material Design layouts are visually balanced. Most measurements align to an 8dp grid, which aligns both spacing and the overall layout.
// Smaller components, such as icons, can align to a 4dp grid.
// https://m2.material.io/design/layout/understanding-layout.html
transform = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createUnarySpacing"])({
    spacing: spacingInput
})) {
    // Already transformed.
    if (spacingInput.mui) {
        return spacingInput;
    }
    const spacing = (...argsInput)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            if (!(argsInput.length <= 4)) {
                console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${argsInput.length}`);
            }
        }
        const args = argsInput.length === 0 ? [
            1
        ] : argsInput;
        return args.map((argument)=>{
            const output = transform(argument);
            return typeof output === 'number' ? `${output}px` : output;
        }).join(' ');
    };
    spacing.mui = true;
    return spacing;
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/compose/compose.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/fastDeepAssign/fastDeepAssign.mjs [app-ssr] (ecmascript)");
;
function compose(...styles) {
    const handlers = styles.reduce((acc, style)=>{
        style.filterProps.forEach((prop)=>{
            acc[prop] = style;
        });
        return acc;
    }, {});
    const fn = (props)=>{
        const result = {};
        for(const prop in props){
            if (handlers[prop]) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(result, handlers[prop](props));
            }
        }
        return result;
    };
    fn.propTypes = ("TURBOPACK compile-time truthy", 1) ? styles.reduce((acc, style)=>Object.assign(acc, style.propTypes), {}) : "TURBOPACK unreachable";
    fn.filterProps = styles.reduce((acc, style)=>acc.concat(style.filterProps), []);
    return fn;
}
const __TURBOPACK__default__export__ = compose;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/borders/borders.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "border",
    ()=>border,
    "borderBottom",
    ()=>borderBottom,
    "borderBottomColor",
    ()=>borderBottomColor,
    "borderColor",
    ()=>borderColor,
    "borderLeft",
    ()=>borderLeft,
    "borderLeftColor",
    ()=>borderLeftColor,
    "borderRadius",
    ()=>borderRadius,
    "borderRight",
    ()=>borderRight,
    "borderRightColor",
    ()=>borderRightColor,
    "borderTop",
    ()=>borderTop,
    "borderTopColor",
    ()=>borderTopColor,
    "borderTransform",
    ()=>borderTransform,
    "default",
    ()=>__TURBOPACK__default__export__,
    "outline",
    ()=>outline,
    "outlineColor",
    ()=>outlineColor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/responsivePropType/responsivePropType.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/style/style.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/compose/compose.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/spacing/spacing.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/breakpoints/breakpoints.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
function borderTransform(value) {
    if (typeof value !== 'number') {
        return value;
    }
    return `${value}px solid`;
}
function createBorderStyle(prop, transform) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        prop,
        themeKey: 'borders',
        transform: transform
    });
}
const border = createBorderStyle('border', borderTransform);
const borderTop = createBorderStyle('borderTop', borderTransform);
const borderRight = createBorderStyle('borderRight', borderTransform);
const borderBottom = createBorderStyle('borderBottom', borderTransform);
const borderLeft = createBorderStyle('borderLeft', borderTransform);
const borderColor = createBorderStyle('borderColor');
const borderTopColor = createBorderStyle('borderTopColor');
const borderRightColor = createBorderStyle('borderRightColor');
const borderBottomColor = createBorderStyle('borderBottomColor');
const borderLeftColor = createBorderStyle('borderLeftColor');
const outline = createBorderStyle('outline', borderTransform);
const outlineColor = createBorderStyle('outlineColor');
const borderRadius = (props)=>{
    if (props.borderRadius !== undefined && props.borderRadius !== null) {
        const transformer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createUnaryUnit"])(props.theme, 'shape.borderRadius', 4, 'borderRadius');
        const styleFromPropValue = (propValue)=>({
                borderRadius: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValue"])(transformer, propValue)
            });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleBreakpoints"])(props, props.borderRadius, styleFromPropValue);
    }
    return null;
};
borderRadius.propTypes = ("TURBOPACK compile-time truthy", 1) ? {
    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
} : "TURBOPACK unreachable";
borderRadius.filterProps = [
    'borderRadius'
];
const borders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(border, borderTop, borderRight, borderBottom, borderLeft, borderColor, borderTopColor, borderRightColor, borderBottomColor, borderLeftColor, borderRadius, outline, outlineColor);
const __TURBOPACK__default__export__ = borders;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssGrid/cssGrid.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "columnGap",
    ()=>columnGap,
    "default",
    ()=>__TURBOPACK__default__export__,
    "gap",
    ()=>gap,
    "gridArea",
    ()=>gridArea,
    "gridAutoColumns",
    ()=>gridAutoColumns,
    "gridAutoFlow",
    ()=>gridAutoFlow,
    "gridAutoRows",
    ()=>gridAutoRows,
    "gridColumn",
    ()=>gridColumn,
    "gridRow",
    ()=>gridRow,
    "gridTemplateAreas",
    ()=>gridTemplateAreas,
    "gridTemplateColumns",
    ()=>gridTemplateColumns,
    "gridTemplateRows",
    ()=>gridTemplateRows,
    "rowGap",
    ()=>rowGap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/style/style.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/compose/compose.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/spacing/spacing.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/breakpoints/breakpoints.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/responsivePropType/responsivePropType.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
const gap = (props)=>{
    if (props.gap !== undefined && props.gap !== null) {
        const transformer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createUnaryUnit"])(props.theme, 'spacing', 8, 'gap');
        const styleFromPropValue = (propValue)=>({
                gap: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValue"])(transformer, propValue)
            });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleBreakpoints"])(props, props.gap, styleFromPropValue);
    }
    return null;
};
gap.propTypes = ("TURBOPACK compile-time truthy", 1) ? {
    gap: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
} : "TURBOPACK unreachable";
gap.filterProps = [
    'gap'
];
const columnGap = (props)=>{
    if (props.columnGap !== undefined && props.columnGap !== null) {
        const transformer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createUnaryUnit"])(props.theme, 'spacing', 8, 'columnGap');
        const styleFromPropValue = (propValue)=>({
                columnGap: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValue"])(transformer, propValue)
            });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleBreakpoints"])(props, props.columnGap, styleFromPropValue);
    }
    return null;
};
columnGap.propTypes = ("TURBOPACK compile-time truthy", 1) ? {
    columnGap: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
} : "TURBOPACK unreachable";
columnGap.filterProps = [
    'columnGap'
];
const rowGap = (props)=>{
    if (props.rowGap !== undefined && props.rowGap !== null) {
        const transformer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createUnaryUnit"])(props.theme, 'spacing', 8, 'rowGap');
        const styleFromPropValue = (propValue)=>({
                rowGap: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValue"])(transformer, propValue)
            });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleBreakpoints"])(props, props.rowGap, styleFromPropValue);
    }
    return null;
};
rowGap.propTypes = ("TURBOPACK compile-time truthy", 1) ? {
    rowGap: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$responsivePropType$2f$responsivePropType$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
} : "TURBOPACK unreachable";
rowGap.filterProps = [
    'rowGap'
];
const gridColumn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridColumn'
});
const gridRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridRow'
});
const gridAutoFlow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridAutoFlow'
});
const gridAutoColumns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridAutoColumns'
});
const gridAutoRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridAutoRows'
});
const gridTemplateColumns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridTemplateColumns'
});
const gridTemplateRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridTemplateRows'
});
const gridTemplateAreas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridTemplateAreas'
});
const gridArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'gridArea'
});
const grid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(gap, columnGap, rowGap, gridColumn, gridRow, gridAutoFlow, gridAutoColumns, gridAutoRows, gridTemplateColumns, gridTemplateRows, gridTemplateAreas, gridArea);
const __TURBOPACK__default__export__ = grid;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/palette/palette.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "backgroundColor",
    ()=>backgroundColor,
    "bgcolor",
    ()=>bgcolor,
    "color",
    ()=>color,
    "default",
    ()=>__TURBOPACK__default__export__,
    "paletteTransform",
    ()=>paletteTransform
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/style/style.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/compose/compose.mjs [app-ssr] (ecmascript)");
;
;
function paletteTransform(value, userValue) {
    if (userValue === 'grey') {
        return userValue;
    }
    return value;
}
const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'color',
    themeKey: 'palette',
    transform: paletteTransform
});
const bgcolor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'bgcolor',
    cssProperty: 'backgroundColor',
    themeKey: 'palette',
    transform: paletteTransform
});
const backgroundColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'backgroundColor',
    themeKey: 'palette',
    transform: paletteTransform
});
const palette = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(color, bgcolor, backgroundColor);
const __TURBOPACK__default__export__ = palette;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/sizing/sizing.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "boxSizing",
    ()=>boxSizing,
    "default",
    ()=>__TURBOPACK__default__export__,
    "height",
    ()=>height,
    "maxHeight",
    ()=>maxHeight,
    "maxWidth",
    ()=>maxWidth,
    "minHeight",
    ()=>minHeight,
    "minWidth",
    ()=>minWidth,
    "sizeHeight",
    ()=>sizeHeight,
    "sizeWidth",
    ()=>sizeWidth,
    "sizingTransform",
    ()=>sizingTransform,
    "width",
    ()=>width
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/style/style.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/compose/compose.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/breakpoints/breakpoints.mjs [app-ssr] (ecmascript)");
;
;
;
;
const breakpointsValues = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"];
function sizingTransform(value) {
    return value <= 1 && value !== 0 ? `${value * 100}%` : value;
}
const width = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'width',
    transform: sizingTransform
});
const maxWidth = (props)=>{
    if (props.maxWidth !== undefined && props.maxWidth !== null) {
        const styleFromPropValue = (propValue)=>{
            const breakpoint = props.theme?.breakpoints?.values?.[propValue] || breakpointsValues[propValue];
            if (!breakpoint) {
                return {
                    maxWidth: sizingTransform(propValue)
                };
            }
            if (props.theme?.breakpoints?.unit !== 'px') {
                return {
                    maxWidth: `${breakpoint}${props.theme.breakpoints.unit}`
                };
            }
            return {
                maxWidth: breakpoint
            };
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleBreakpoints"])(props, props.maxWidth, styleFromPropValue);
    }
    return null;
};
maxWidth.filterProps = [
    'maxWidth'
];
const minWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'minWidth',
    transform: sizingTransform
});
const height = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'height',
    transform: sizingTransform
});
const maxHeight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'maxHeight',
    transform: sizingTransform
});
const minHeight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'minHeight',
    transform: sizingTransform
});
const sizeWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'size',
    cssProperty: 'width',
    transform: sizingTransform
});
const sizeHeight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'size',
    cssProperty: 'height',
    transform: sizingTransform
});
const boxSizing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    prop: 'boxSizing'
});
const sizing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$compose$2f$compose$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(width, maxWidth, minWidth, height, maxHeight, minHeight, boxSizing);
const __TURBOPACK__default__export__ = sizing;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/spacing/spacing.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/borders/borders.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssGrid$2f$cssGrid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssGrid/cssGrid.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$palette$2f$palette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/palette/palette.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$sizing$2f$sizing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/sizing/sizing.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
const defaultSxConfig = {
    // borders
    border: {
        themeKey: 'borders',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["borderTransform"]
    },
    borderTop: {
        themeKey: 'borders',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["borderTransform"]
    },
    borderRight: {
        themeKey: 'borders',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["borderTransform"]
    },
    borderBottom: {
        themeKey: 'borders',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["borderTransform"]
    },
    borderLeft: {
        themeKey: 'borders',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["borderTransform"]
    },
    borderColor: {
        themeKey: 'palette'
    },
    borderTopColor: {
        themeKey: 'palette'
    },
    borderRightColor: {
        themeKey: 'palette'
    },
    borderBottomColor: {
        themeKey: 'palette'
    },
    borderLeftColor: {
        themeKey: 'palette'
    },
    outline: {
        themeKey: 'borders',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["borderTransform"]
    },
    outlineColor: {
        themeKey: 'palette'
    },
    borderRadius: {
        themeKey: 'shape.borderRadius',
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$borders$2f$borders$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["borderRadius"]
    },
    // palette
    color: {
        themeKey: 'palette',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$palette$2f$palette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paletteTransform"]
    },
    bgcolor: {
        themeKey: 'palette',
        cssProperty: 'backgroundColor',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$palette$2f$palette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paletteTransform"]
    },
    backgroundColor: {
        themeKey: 'palette',
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$palette$2f$palette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paletteTransform"]
    },
    // spacing
    p: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    pt: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    pr: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    pb: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    pl: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    px: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    py: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    padding: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingTop: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingRight: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingBottom: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingLeft: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingX: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingY: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingInline: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingInlineStart: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingInlineEnd: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingBlock: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingBlockStart: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    paddingBlockEnd: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padding"]
    },
    m: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    mt: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    mr: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    mb: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    ml: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    mx: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    my: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    margin: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginTop: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginRight: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginBottom: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginLeft: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginX: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginY: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginInline: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginInlineStart: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginInlineEnd: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginBlock: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginBlockStart: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    marginBlockEnd: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["margin"]
    },
    // display
    displayPrint: {
        cssProperty: false,
        transform: (value)=>({
                '@media print': {
                    display: value
                }
            })
    },
    display: {},
    overflow: {},
    textOverflow: {},
    visibility: {},
    whiteSpace: {},
    // flexbox
    flexBasis: {},
    flexDirection: {},
    flexWrap: {},
    justifyContent: {},
    alignItems: {},
    alignContent: {},
    order: {},
    flex: {},
    flexGrow: {},
    flexShrink: {},
    alignSelf: {},
    justifyItems: {},
    justifySelf: {},
    // grid
    gap: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssGrid$2f$cssGrid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gap"]
    },
    rowGap: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssGrid$2f$cssGrid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowGap"]
    },
    columnGap: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssGrid$2f$cssGrid$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["columnGap"]
    },
    gridColumn: {},
    gridRow: {},
    gridAutoFlow: {},
    gridAutoColumns: {},
    gridAutoRows: {},
    gridTemplateColumns: {},
    gridTemplateRows: {},
    gridTemplateAreas: {},
    gridArea: {},
    // positions
    position: {},
    zIndex: {
        themeKey: 'zIndex'
    },
    top: {},
    right: {},
    bottom: {},
    left: {},
    // shadows
    boxShadow: {
        themeKey: 'shadows'
    },
    // sizing
    width: {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$sizing$2f$sizing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sizingTransform"]
    },
    maxWidth: {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$sizing$2f$sizing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maxWidth"]
    },
    minWidth: {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$sizing$2f$sizing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sizingTransform"]
    },
    height: {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$sizing$2f$sizing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sizingTransform"]
    },
    maxHeight: {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$sizing$2f$sizing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sizingTransform"]
    },
    minHeight: {
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$sizing$2f$sizing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sizingTransform"]
    },
    boxSizing: {},
    // typography
    font: {
        themeKey: 'font'
    },
    fontFamily: {
        themeKey: 'typography'
    },
    fontSize: {
        themeKey: 'typography'
    },
    fontStyle: {
        themeKey: 'typography'
    },
    fontWeight: {
        themeKey: 'typography'
    },
    letterSpacing: {},
    textTransform: {},
    lineHeight: {},
    textAlign: {},
    typography: {
        cssProperty: false,
        themeKey: 'typography'
    }
};
const __TURBOPACK__default__export__ = defaultSxConfig;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/styleFunctionSx.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "unstable_createStyleFunctionSx",
    ()=>unstable_createStyleFunctionSx
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/fastDeepAssign/fastDeepAssign.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/style/style.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/breakpoints/breakpoints.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssContainerQueries/cssContainerQueries.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
/**
 * The `css` function accepts arrays as values for mobile-first responsive styles.
 * Note that this extends to non-theme values also. For example `display=['none', 'block']`
 * will also works.
 */ /**
 * Map of all CSS pseudo selectors (`:hover`, `:focus`, ...).
 */ /**
 * Map all nested selectors.
 */ /**
 * Map all nested selectors and CSS variables.
 */ /**
 * Map of all available CSS properties (including aliases) and their raw value.
 * Only used internally to map CSS properties to input types (responsive value,
 * theme function or nested) in `SystemCssProperties`.
 */ /**
 * The `SystemStyleObject` defines custom properties that will be transformed to
 * their corresponding values from the `Theme`. Other valid CSS properties are also allowed.
 */ /**
 * The `SxProps` can be either object or function
 */ /* eslint-disable guard-for-in */ const EMPTY_THEME = {};
function unstable_createStyleFunctionSx() {
    function styleFunctionSx(props) {
        if (!props.sx) {
            return null;
        }
        const { sx, theme = EMPTY_THEME, nested } = props;
        const config = theme.unstable_sxConfig ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
        // Pass argument without loop allocations
        const wrapper = {
            sx: null,
            theme,
            nested: true
        };
        function process(sxInput) {
            let sxObject = sxInput;
            if (typeof sxInput === 'function') {
                sxObject = sxInput(theme);
            } else if (typeof sxInput !== 'object') {
                // value
                return sxInput;
            }
            if (!sxObject) {
                return null;
            }
            const breakpoints = theme.breakpoints ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_BREAKPOINTS"];
            const css = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createEmptyBreakpointObject"])(breakpoints);
            for(const styleKey in sxObject){
                const value = callIfFn(sxObject[styleKey], theme);
                if (value === null || value === undefined) {
                    continue;
                }
                if (typeof value !== 'object') {
                    setThemeValue(css, styleKey, value, theme, config);
                    continue;
                }
                if (config[styleKey]) {
                    setThemeValue(css, styleKey, value, theme, config);
                    continue;
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasBreakpoint"])(breakpoints, value)) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["iterateBreakpoints"])(css, props.theme, value, (mediaKey, finalValue)=>{
                        css[mediaKey][styleKey] = finalValue;
                    });
                } else {
                    wrapper.sx = value;
                    css[styleKey] = styleFunctionSx(wrapper);
                }
            }
            if (!nested && theme.modularCssLayers) {
                return {
                    '@layer sx': (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sortContainerQueries"])(theme, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeUnusedBreakpoints"])(breakpoints, css))
                };
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sortContainerQueries"])(theme, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeUnusedBreakpoints"])(breakpoints, css));
        }
        return Array.isArray(sx) ? sx.map(process) : process(sx);
    }
    styleFunctionSx.filterProps = [
        'sx'
    ];
    return styleFunctionSx;
}
const __TURBOPACK__default__export__ = unstable_createStyleFunctionSx();
function setThemeValue(css, prop, value, theme, config) {
    const options = config[prop];
    if (!options) {
        css[prop] = value;
        return;
    }
    if (value == null) {
        return;
    }
    const { themeKey } = options;
    // TODO v6: remove, see https://github.com/mui/material-ui/pull/38123
    if (themeKey === 'typography' && value === 'inherit') {
        css[prop] = value;
        return;
    }
    const { style } = options;
    if (style) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(css, style({
            [prop]: value,
            theme
        }));
        return;
    }
    const { cssProperty = prop, transform } = options;
    const themeMapping = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPath"])(theme, themeKey);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$breakpoints$2f$breakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["iterateBreakpoints"])(css, theme, value, (mediaKey, valueFinal)=>{
        const finalValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$style$2f$style$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStyleValue2"])(themeMapping, transform, valueFinal, prop);
        if (cssProperty === false) {
            if (mediaKey) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(css[mediaKey], finalValue);
            } else {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$fastDeepAssign$2f$fastDeepAssign$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(css, finalValue);
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (mediaKey) {
                css[mediaKey][cssProperty] = finalValue;
            } else {
                css[cssProperty] = finalValue;
            }
        }
    });
}
function callIfFn(maybeFn, arg) {
    return typeof maybeFn === 'function' ? maybeFn(arg) : maybeFn;
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/applyStyles.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * A universal utility to style components with multiple color modes. Always use it from the theme object.
 * It works with:
 *  - [Basic theme](https://mui.com/material-ui/customization/dark-mode/)
 *  - [CSS theme variables](https://mui.com/material-ui/customization/css-theme-variables/overview/)
 *  - Zero-runtime engine
 *
 * Tips: Use an array over object spread and place `theme.applyStyles()` last.
 *
 * With the styled function:
 * ✅ [{ background: '#e5e5e5' }, theme.applyStyles('dark', { background: '#1c1c1c' })]
 * 🚫 { background: '#e5e5e5', ...theme.applyStyles('dark', { background: '#1c1c1c' })}
 *
 * With the sx prop:
 * ✅ [{ background: '#e5e5e5' }, theme => theme.applyStyles('dark', { background: '#1c1c1c' })]
 * 🚫 { background: '#e5e5e5', ...theme => theme.applyStyles('dark', { background: '#1c1c1c' })}
 *
 * @example
 * 1. using with `styled`:
 * ```jsx
 *   const Component = styled('div')(({ theme }) => [
 *     { background: '#e5e5e5' },
 *     theme.applyStyles('dark', {
 *       background: '#1c1c1c',
 *       color: '#fff',
 *     }),
 *   ]);
 * ```
 *
 * @example
 * 2. using with `sx` prop:
 * ```jsx
 *   <Box sx={[
 *     { background: '#e5e5e5' },
 *     theme => theme.applyStyles('dark', {
 *        background: '#1c1c1c',
 *        color: '#fff',
 *      }),
 *     ]}
 *   />
 * ```
 *
 * @example
 * 3. theming a component:
 * ```jsx
 *   extendTheme({
 *     components: {
 *       MuiButton: {
 *         styleOverrides: {
 *           root: ({ theme }) => [
 *             { background: '#e5e5e5' },
 *             theme.applyStyles('dark', {
 *               background: '#1c1c1c',
 *               color: '#fff',
 *             }),
 *           ],
 *         },
 *       }
 *     }
 *   })
 *```
 */ __turbopack_context__.s([
    "default",
    ()=>applyStyles
]);
function applyStyles(key, styles) {
    // @ts-expect-error this is 'any' type
    const theme = this;
    if (theme.vars) {
        if (!theme.colorSchemes?.[key] || typeof theme.getColorSchemeSelector !== 'function') {
            return {};
        }
        // If CssVarsProvider is used as a provider, returns '*:where({selector}) &'
        let selector = theme.getColorSchemeSelector(key);
        if (selector === '&') {
            return styles;
        }
        if (selector.includes('data-') || selector.includes('.')) {
            // '*' is required as a workaround for Emotion issue (https://github.com/emotion-js/emotion/issues/2836)
            selector = `*:where(${selector.replace(/\s*&$/, '')}) &`;
        }
        return {
            [selector]: styles
        };
    }
    if (theme.palette.mode === key) {
        return styles;
    }
    return {};
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createTheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createBreakpoints$2f$createBreakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createBreakpoints/createBreakpoints.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssContainerQueries/cssContainerQueries.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$shape$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/shape.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createSpacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createSpacing.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/styleFunctionSx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$applyStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/applyStyles.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
/**
 * Generate a theme base on the options received.
 * @param options Takes an incomplete theme object and adds the missing parts.
 * @param args Deep merge the arguments with the about to be returned theme.
 * @returns A complete, ready-to-use theme object.
 */ function createTheme(options = {}, ...args) {
    const { breakpoints: breakpointsInput = {}, palette: paletteInput = {}, spacing: spacingInput, shape: shapeInput = {}, ...other } = options;
    const breakpoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createBreakpoints$2f$createBreakpoints$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(breakpointsInput);
    const spacing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createSpacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(spacingInput);
    let muiTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        breakpoints,
        direction: 'ltr',
        components: {},
        // Inject component definitions.
        palette: {
            mode: 'light',
            ...paletteInput
        },
        spacing,
        shape: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$shape$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            ...shapeInput
        }
    }, other);
    muiTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssContainerQueries$2f$cssContainerQueries$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(muiTheme);
    muiTheme.applyStyles = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$applyStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
    muiTheme = args.reduce((acc, argument)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(acc, argument), muiTheme);
    muiTheme.unstable_sxConfig = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
        ...other?.unstable_sxConfig
    };
    muiTheme.unstable_sx = function sx(props) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            sx: props,
            theme: this
        });
    };
    muiTheme.internal_cache = {};
    return muiTheme;
}
const __TURBOPACK__default__export__ = createTheme;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/preprocessStyles.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>preprocessStyles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+styled-engine@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emot_e78716923fb2714560d01c0f19f6638c/node_modules/@mui/styled-engine/index.mjs [app-ssr] (ecmascript) <locals>");
;
function preprocessStyles(input) {
    const { variants, ...style } = input;
    const result = {
        variants,
        style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(style),
        isProcessed: true
    };
    // Not supported on styled-components
    if (result.style === style) {
        return result;
    }
    if (variants) {
        variants.forEach((variant)=>{
            if (typeof variant.style !== 'function') {
                variant.style = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(variant.style);
            }
        });
    }
    return result;
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createStyled/createStyled.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createStyled,
    "shouldForwardProp",
    ()=>shouldForwardProp,
    "systemDefaultTheme",
    ()=>systemDefaultTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+styled-engine@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emot_e78716923fb2714560d01c0f19f6638c/node_modules/@mui/styled-engine/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isObjectEmpty$2f$isObjectEmpty$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/isObjectEmpty/isObjectEmpty.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$capitalize$2f$capitalize$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/capitalize/capitalize.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$getDisplayName$2f$getDisplayName$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/getDisplayName/getDisplayName.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/styleFunctionSx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$preprocessStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/preprocessStyles.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
const systemDefaultTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
function shouldForwardProp(prop) {
    return prop !== 'ownerState' && prop !== 'theme' && prop !== 'sx' && prop !== 'as';
}
function shallowLayer(serialized, layerName) {
    if (layerName && serialized && typeof serialized === 'object' && serialized.styles && !serialized.styles.startsWith('@layer') // only add the layer if it is not already there.
    ) {
        serialized.styles = `@layer ${layerName}{${String(serialized.styles)}}`;
    }
    return serialized;
}
function defaultOverridesResolver(slot) {
    if (!slot) {
        return null;
    }
    return (_props, styles)=>styles[slot];
}
function attachTheme(props, themeId, defaultTheme) {
    props.theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$isObjectEmpty$2f$isObjectEmpty$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(props.theme) ? defaultTheme : props.theme[themeId] || props.theme;
}
function processStyle(props, style, layerName) {
    /*
   * Style types:
   *  - null/undefined
   *  - string
   *  - CSS style object: { [cssKey]: [cssValue], variants }
   *  - Processed style object: { style, variants, isProcessed: true }
   *  - Array of any of the above
   */ const resolvedStyle = typeof style === 'function' ? style(props) : style;
    if (Array.isArray(resolvedStyle)) {
        return resolvedStyle.flatMap((subStyle)=>processStyle(props, subStyle, layerName));
    }
    if (Array.isArray(resolvedStyle?.variants)) {
        let rootStyle;
        if (resolvedStyle.isProcessed) {
            rootStyle = layerName ? shallowLayer(resolvedStyle.style, layerName) : resolvedStyle.style;
        } else {
            const { variants, ...otherStyles } = resolvedStyle;
            rootStyle = layerName ? shallowLayer((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(otherStyles), layerName) : otherStyles;
        }
        return processStyleVariants(props, resolvedStyle.variants, [
            rootStyle
        ], layerName);
    }
    if (resolvedStyle?.isProcessed) {
        return layerName ? shallowLayer((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(resolvedStyle.style), layerName) : resolvedStyle.style;
    }
    return layerName ? shallowLayer((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(resolvedStyle), layerName) : resolvedStyle;
}
function processStyleVariants(props, variants, results = [], layerName = undefined) {
    let mergedState; // We might not need it, initialized lazily
    variantLoop: for(let i = 0; i < variants.length; i += 1){
        const variant = variants[i];
        if (typeof variant.props === 'function') {
            mergedState ??= {
                ...props,
                ...props.ownerState,
                ownerState: props.ownerState
            };
            if (!variant.props(mergedState)) {
                continue;
            }
        } else {
            for(const key in variant.props){
                if (props[key] !== variant.props[key] && props.ownerState?.[key] !== variant.props[key]) {
                    continue variantLoop;
                }
            }
        }
        if (typeof variant.style === 'function') {
            mergedState ??= {
                ...props,
                ...props.ownerState,
                ownerState: props.ownerState
            };
            results.push(layerName ? shallowLayer((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(variant.style(mergedState)), layerName) : variant.style(mergedState));
        } else {
            results.push(layerName ? shallowLayer((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(variant.style), layerName) : variant.style);
        }
    }
    return results;
}
function createStyled(input = {}) {
    const { themeId, defaultTheme = systemDefaultTheme, rootShouldForwardProp = shouldForwardProp, slotShouldForwardProp = shouldForwardProp } = input;
    function styleAttachTheme(props) {
        attachTheme(props, themeId, defaultTheme);
    }
    const styled = (tag, inputOptions = {})=>{
        // If `tag` is already a styled component, filter out the `sx` style function
        // to prevent unnecessary styles generated by the composite components.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_mutateStyles"])(tag, (styles)=>styles.filter((style)=>style !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]));
        const { name: componentName, slot: componentSlot, skipVariantsResolver: inputSkipVariantsResolver, skipSx: inputSkipSx, // TODO v6: remove `lowercaseFirstLetter()` in the next major release
        // For more details: https://github.com/mui/material-ui/pull/37908
        overridesResolver = defaultOverridesResolver(lowercaseFirstLetter(componentSlot)), ...options } = inputOptions;
        const layerName = componentName && componentName.startsWith('Mui') || !!componentSlot ? 'components' : 'custom';
        // if skipVariantsResolver option is defined, take the value, otherwise, true for root and false for other slots.
        const skipVariantsResolver = inputSkipVariantsResolver !== undefined ? inputSkipVariantsResolver : // TODO v6: remove `Root` in the next major release
        // For more details: https://github.com/mui/material-ui/pull/37908
        componentSlot && componentSlot !== 'Root' && componentSlot !== 'root' || false;
        const skipSx = inputSkipSx || false;
        let shouldForwardPropOption = shouldForwardProp;
        // TODO v6: remove `Root` in the next major release
        // For more details: https://github.com/mui/material-ui/pull/37908
        if (componentSlot === 'Root' || componentSlot === 'root') {
            shouldForwardPropOption = rootShouldForwardProp;
        } else if (componentSlot) {
            // any other slot specified
            shouldForwardPropOption = slotShouldForwardProp;
        } else if (isStringTag(tag)) {
            // for string (html) tag, preserve the behavior in emotion & styled-components.
            shouldForwardPropOption = undefined;
        }
        const defaultStyledResolver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(tag, {
            shouldForwardProp: shouldForwardPropOption,
            label: generateStyledLabel(componentName, componentSlot),
            ...options
        });
        const transformStyle = (style)=>{
            // - On the server Emotion doesn't use React.forwardRef for creating components, so the created
            //   component stays as a function. This condition makes sure that we do not interpolate functions
            //   which are basically components used as a selectors.
            // - `style` could be a styled component from a babel plugin for component selectors, This condition
            //   makes sure that we do not interpolate them.
            if (style.__emotion_real === style) {
                return style;
            }
            if (typeof style === 'function') {
                return function styleFunctionProcessor(props) {
                    return processStyle(props, style, props.theme.modularCssLayers ? layerName : undefined);
                };
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPlainObject"])(style)) {
                const serialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$preprocessStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(style);
                return function styleObjectProcessor(props) {
                    if (!serialized.variants) {
                        return props.theme.modularCssLayers ? shallowLayer(serialized.style, layerName) : serialized.style;
                    }
                    return processStyle(props, serialized, props.theme.modularCssLayers ? layerName : undefined);
                };
            }
            return style;
        };
        const muiStyledResolver = (...expressionsInput)=>{
            const expressionsHead = [];
            const expressionsBody = expressionsInput.map(transformStyle);
            const expressionsTail = [];
            // Preprocess `props` to set the scoped theme value.
            // This must run before any other expression.
            expressionsHead.push(styleAttachTheme);
            if (componentName && overridesResolver) {
                expressionsTail.push(function styleThemeOverrides(props) {
                    const theme = props.theme;
                    const styleOverrides = theme.components?.[componentName]?.styleOverrides;
                    if (!styleOverrides) {
                        return null;
                    }
                    const resolvedStyleOverrides = {};
                    // TODO: v7 remove iteration and use `resolveStyleArg(styleOverrides[slot])` directly
                    // eslint-disable-next-line guard-for-in
                    for(const slotKey in styleOverrides){
                        resolvedStyleOverrides[slotKey] = processStyle(props, styleOverrides[slotKey], props.theme.modularCssLayers ? 'theme' : undefined);
                    }
                    return overridesResolver(props, resolvedStyleOverrides);
                });
            }
            if (componentName && !skipVariantsResolver) {
                expressionsTail.push(function styleThemeVariants(props) {
                    const theme = props.theme;
                    const themeVariants = theme?.components?.[componentName]?.variants;
                    if (!themeVariants) {
                        return null;
                    }
                    return processStyleVariants(props, themeVariants, [], props.theme.modularCssLayers ? 'theme' : undefined);
                });
            }
            if (!skipSx) {
                expressionsTail.push(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
            }
            // This function can be called as a tagged template, so the first argument would contain
            // CSS `string[]` values.
            if (Array.isArray(expressionsBody[0])) {
                const inputStrings = expressionsBody.shift();
                // We need to add placeholders in the tagged template for the custom functions we have
                // possibly added (attachTheme, overrides, variants, and sx).
                const placeholdersHead = new Array(expressionsHead.length).fill('');
                const placeholdersTail = new Array(expressionsTail.length).fill('');
                let outputStrings;
                // prettier-ignore
                {
                    outputStrings = [
                        ...placeholdersHead,
                        ...inputStrings,
                        ...placeholdersTail
                    ];
                    outputStrings.raw = [
                        ...placeholdersHead,
                        ...inputStrings.raw,
                        ...placeholdersTail
                    ];
                }
                // The only case where we put something before `attachTheme`
                expressionsHead.unshift(outputStrings);
            }
            const expressions = [
                ...expressionsHead,
                ...expressionsBody,
                ...expressionsTail
            ];
            const Component = defaultStyledResolver(...expressions);
            if (tag.muiName) {
                Component.muiName = tag.muiName;
            }
            if ("TURBOPACK compile-time truthy", 1) {
                Component.displayName = generateDisplayName(componentName, componentSlot, tag);
            }
            return Component;
        };
        if (defaultStyledResolver.withConfig) {
            muiStyledResolver.withConfig = defaultStyledResolver.withConfig;
        }
        return muiStyledResolver;
    };
    return styled;
}
function generateDisplayName(componentName, componentSlot, tag) {
    if (componentName) {
        return `${componentName}${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$capitalize$2f$capitalize$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(componentSlot || '')}`;
    }
    return `Styled(${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$getDisplayName$2f$getDisplayName$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(tag)})`;
}
function generateStyledLabel(componentName, componentSlot) {
    let label;
    if ("TURBOPACK compile-time truthy", 1) {
        if (componentName) {
            // TODO v6: remove `lowercaseFirstLetter()` in the next major release
            // For more details: https://github.com/mui/material-ui/pull/37908
            label = `${componentName}-${lowercaseFirstLetter(componentSlot || 'Root')}`;
        }
    }
    return label;
}
// https://github.com/emotion-js/emotion/blob/26ded6109fcd8ca9875cc2ce4564fee678a3f3c5/packages/styled/src/utils.js#L40
function isStringTag(tag) {
    return typeof tag === 'string' && // 96 is one less than the char code
    // for "a" so this is checking that
    // it's a lowercase character
    tag.charCodeAt(0) > 96;
}
function lowercaseFirstLetter(string) {
    if (!string) {
        return string;
    }
    return string.charAt(0).toLowerCase() + string.slice(1);
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/colorManipulator/colorManipulator.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "alpha",
    ()=>alpha,
    "blend",
    ()=>blend,
    "colorChannel",
    ()=>colorChannel,
    "darken",
    ()=>darken,
    "decomposeColor",
    ()=>decomposeColor,
    "emphasize",
    ()=>emphasize,
    "getContrastRatio",
    ()=>getContrastRatio,
    "getLuminance",
    ()=>getLuminance,
    "hexToRgb",
    ()=>hexToRgb,
    "hslToRgb",
    ()=>hslToRgb,
    "lighten",
    ()=>lighten,
    "private_safeAlpha",
    ()=>private_safeAlpha,
    "private_safeColorChannel",
    ()=>private_safeColorChannel,
    "private_safeDarken",
    ()=>private_safeDarken,
    "private_safeEmphasize",
    ()=>private_safeEmphasize,
    "private_safeLighten",
    ()=>private_safeLighten,
    "recomposeColor",
    ()=>recomposeColor,
    "rgbToHex",
    ()=>rgbToHex
]);
/* eslint-disable @typescript-eslint/naming-convention */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$clamp$2f$clamp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/clamp/clamp.mjs [app-ssr] (ecmascript)");
;
;
/**
 * Returns a number whose value is limited to the given range.
 * @param {number} value The value to be clamped
 * @param {number} min The lower boundary of the output range
 * @param {number} max The upper boundary of the output range
 * @returns {number} A number in the range [min, max]
 */ function clampWrapper(value, min = 0, max = 1) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (value < min || value > max) {
            console.error(`MUI: The value provided ${value} is out of range [${min}, ${max}].`);
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$clamp$2f$clamp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(value, min, max);
}
function hexToRgb(color) {
    color = color.slice(1);
    const re = new RegExp(`.{1,${color.length >= 6 ? 2 : 1}}`, 'g');
    let colors = color.match(re);
    if (colors && colors[0].length === 1) {
        colors = colors.map((n)=>n + n);
    }
    if ("TURBOPACK compile-time truthy", 1) {
        if (color.length !== color.trim().length) {
            console.error(`MUI: The color: "${color}" is invalid. Make sure the color input doesn't contain leading/trailing space.`);
        }
    }
    return colors ? `rgb${colors.length === 4 ? 'a' : ''}(${colors.map((n, index)=>{
        return index < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1000) / 1000;
    }).join(', ')})` : '';
}
function intToHex(int) {
    const hex = int.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
}
function decomposeColor(color) {
    // Idempotent
    if (color.type) {
        return color;
    }
    if (color.charAt(0) === '#') {
        return decomposeColor(hexToRgb(color));
    }
    const marker = color.indexOf('(');
    const type = color.substring(0, marker);
    if (![
        'rgb',
        'rgba',
        'hsl',
        'hsla',
        'color'
    ].includes(type)) {
        throw new Error(("TURBOPACK compile-time truthy", 1) ? `MUI: Unsupported \`${color}\` color.\n` + 'The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().' : "TURBOPACK unreachable");
    }
    let values = color.substring(marker + 1, color.length - 1);
    let colorSpace;
    if (type === 'color') {
        values = values.split(' ');
        colorSpace = values.shift();
        if (values.length === 4 && values[3].charAt(0) === '/') {
            values[3] = values[3].slice(1);
        }
        if (![
            'srgb',
            'display-p3',
            'a98-rgb',
            'prophoto-rgb',
            'rec-2020'
        ].includes(colorSpace)) {
            throw new Error(("TURBOPACK compile-time truthy", 1) ? `MUI: unsupported \`${colorSpace}\` color space.\n` + 'The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.' : "TURBOPACK unreachable");
        }
    } else {
        values = values.split(',');
    }
    values = values.map((value)=>parseFloat(value));
    return {
        type,
        values,
        colorSpace
    };
}
const colorChannel = (color)=>{
    const decomposedColor = decomposeColor(color);
    return decomposedColor.values.slice(0, 3).map((val, idx)=>decomposedColor.type.includes('hsl') && idx !== 0 ? `${val}%` : val).join(' ');
};
const private_safeColorChannel = (color, warning)=>{
    try {
        return colorChannel(color);
    } catch (error) {
        if (warning && ("TURBOPACK compile-time value", "development") !== 'production') {
            console.warn(warning);
        }
        return color;
    }
};
function recomposeColor(color) {
    const { type, colorSpace } = color;
    let { values } = color;
    if (type.includes('rgb')) {
        // Only convert the first 3 values to int (i.e. not alpha)
        values = values.map((n, i)=>i < 3 ? parseInt(n, 10) : n);
    } else if (type.includes('hsl')) {
        values[1] = `${values[1]}%`;
        values[2] = `${values[2]}%`;
    }
    if (type.includes('color')) {
        values = `${colorSpace} ${values.join(' ')}`;
    } else {
        values = `${values.join(', ')}`;
    }
    return `${type}(${values})`;
}
function rgbToHex(color) {
    // Idempotent
    if (color.startsWith('#')) {
        return color;
    }
    const { values } = decomposeColor(color);
    return `#${values.map((n, i)=>intToHex(i === 3 ? Math.round(255 * n) : n)).join('')}`;
}
function hslToRgb(color) {
    color = decomposeColor(color);
    const { values } = color;
    const h = values[0];
    const s = values[1] / 100;
    const l = values[2] / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n, k = (n + h / 30) % 12)=>l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    let type = 'rgb';
    const rgb = [
        Math.round(f(0) * 255),
        Math.round(f(8) * 255),
        Math.round(f(4) * 255)
    ];
    if (color.type === 'hsla') {
        type += 'a';
        rgb.push(values[3]);
    }
    return recomposeColor({
        type,
        values: rgb
    });
}
function getLuminance(color) {
    color = decomposeColor(color);
    let rgb = color.type === 'hsl' || color.type === 'hsla' ? decomposeColor(hslToRgb(color)).values : color.values;
    rgb = rgb.map((val)=>{
        if (color.type !== 'color') {
            val /= 255; // normalized
        }
        return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
    });
    // Truncate at 3 digits
    return Number((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(3));
}
function getContrastRatio(foreground, background) {
    const lumA = getLuminance(foreground);
    const lumB = getLuminance(background);
    return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}
function alpha(color, value) {
    color = decomposeColor(color);
    value = clampWrapper(value);
    if (color.type === 'rgb' || color.type === 'hsl') {
        color.type += 'a';
    }
    if (color.type === 'color') {
        color.values[3] = `/${value}`;
    } else {
        color.values[3] = value;
    }
    return recomposeColor(color);
}
function private_safeAlpha(color, value, warning) {
    try {
        return alpha(color, value);
    } catch (error) {
        if (warning && ("TURBOPACK compile-time value", "development") !== 'production') {
            console.warn(warning);
        }
        return color;
    }
}
function darken(color, coefficient) {
    color = decomposeColor(color);
    coefficient = clampWrapper(coefficient);
    if (color.type.includes('hsl')) {
        color.values[2] *= 1 - coefficient;
    } else if (color.type.includes('rgb') || color.type.includes('color')) {
        for(let i = 0; i < 3; i += 1){
            color.values[i] *= 1 - coefficient;
        }
    }
    return recomposeColor(color);
}
function private_safeDarken(color, coefficient, warning) {
    try {
        return darken(color, coefficient);
    } catch (error) {
        if (warning && ("TURBOPACK compile-time value", "development") !== 'production') {
            console.warn(warning);
        }
        return color;
    }
}
function lighten(color, coefficient) {
    color = decomposeColor(color);
    coefficient = clampWrapper(coefficient);
    if (color.type.includes('hsl')) {
        color.values[2] += (100 - color.values[2]) * coefficient;
    } else if (color.type.includes('rgb')) {
        for(let i = 0; i < 3; i += 1){
            color.values[i] += (255 - color.values[i]) * coefficient;
        }
    } else if (color.type.includes('color')) {
        for(let i = 0; i < 3; i += 1){
            color.values[i] += (1 - color.values[i]) * coefficient;
        }
    }
    return recomposeColor(color);
}
function private_safeLighten(color, coefficient, warning) {
    try {
        return lighten(color, coefficient);
    } catch (error) {
        if (warning && ("TURBOPACK compile-time value", "development") !== 'production') {
            console.warn(warning);
        }
        return color;
    }
}
function emphasize(color, coefficient = 0.15) {
    return getLuminance(color) > 0.5 ? darken(color, coefficient) : lighten(color, coefficient);
}
function private_safeEmphasize(color, coefficient, warning) {
    try {
        return emphasize(color, coefficient);
    } catch (error) {
        if (warning && ("TURBOPACK compile-time value", "development") !== 'production') {
            console.warn(warning);
        }
        return color;
    }
}
function blend(background, overlay, opacity, gamma = 1.0) {
    const blendChannel = (b, o)=>Math.round((b ** (1 / gamma) * (1 - opacity) + o ** (1 / gamma) * opacity) ** gamma);
    const backgroundColor = decomposeColor(background);
    const overlayColor = decomposeColor(overlay);
    const rgb = [
        blendChannel(backgroundColor.values[0], overlayColor.values[0]),
        blendChannel(backgroundColor.values[1], overlayColor.values[1]),
        blendChannel(backgroundColor.values[2], overlayColor.values[2])
    ];
    return recomposeColor({
        type: 'rgb',
        values: rgb
    });
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createGetCssVar.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * The benefit of this function is to help developers get CSS var from theme without specifying the whole variable
 * and they does not need to remember the prefix (defined once).
 */ __turbopack_context__.s([
    "default",
    ()=>createGetCssVar
]);
function createGetCssVar(prefix = '') {
    function appendVar(...vars) {
        if (!vars.length) {
            return '';
        }
        const value = vars[0];
        if (typeof value === 'string' && !value.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/)) {
            return `, var(--${prefix ? `${prefix}-` : ''}${value}${appendVar(...vars.slice(1))})`;
        }
        return `, ${value}`;
    }
    // AdditionalVars makes `getCssVar` less strict, so it can be use like this `getCssVar('non-mui-variable')` without type error.
    const getCssVar = (field, ...fallbacks)=>{
        return `var(--${prefix ? `${prefix}-` : ''}${field}${appendVar(...fallbacks)})`;
    };
    return getCssVar;
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createGetCssVar.mjs [app-ssr] (ecmascript) <export default as unstable_createGetCssVar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unstable_createGetCssVar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createGetCssVar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createGetCssVar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createGetCssVar.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createSpacing.mjs [app-ssr] (ecmascript) <export default as createSpacing>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSpacing",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createSpacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createSpacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createSpacing.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/cssVarsParser.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assignNestedKeys",
    ()=>assignNestedKeys,
    "default",
    ()=>cssVarsParser,
    "walkObjectDeep",
    ()=>walkObjectDeep
]);
const prototypePollutingKeys = new Set([
    '__proto__',
    'constructor',
    'prototype'
]);
const assignNestedKeys = (obj, keys, value, arrayKeys = [])=>{
    let temp = obj;
    for(let index = 0; index < keys.length; index += 1){
        const k = keys[index];
        // Prevent prototype pollution: never traverse or write through
        // `__proto__` / `constructor` / `prototype` (e.g. a theme parsed from untrusted JSON).
        if (prototypePollutingKeys.has(k)) {
            break;
        }
        if (index === keys.length - 1) {
            if (Array.isArray(temp)) {
                temp[Number(k)] = value;
            } else if (temp && typeof temp === 'object') {
                temp[k] = value;
            }
        } else if (temp && typeof temp === 'object') {
            if (!temp[k]) {
                temp[k] = arrayKeys.includes(k) ? [] : {};
            }
            temp = temp[k];
        }
    }
};
const walkObjectDeep = (obj, callback, shouldSkipPaths)=>{
    function recurse(object, parentKeys = [], arrayKeys = []) {
        Object.entries(object).forEach(([key, value])=>{
            if (!shouldSkipPaths || shouldSkipPaths && !shouldSkipPaths([
                ...parentKeys,
                key
            ])) {
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object' && Object.keys(value).length > 0) {
                        recurse(value, [
                            ...parentKeys,
                            key
                        ], Array.isArray(value) ? [
                            ...arrayKeys,
                            key
                        ] : arrayKeys);
                    } else {
                        callback([
                            ...parentKeys,
                            key
                        ], value, arrayKeys);
                    }
                }
            }
        });
    }
    recurse(obj);
};
const getCssValue = (keys, value)=>{
    if (typeof value === 'number') {
        if ([
            'lineHeight',
            'fontWeight',
            'opacity',
            'zIndex'
        ].some((prop)=>keys.includes(prop))) {
            // CSS property that are unitless
            return value;
        }
        const lastKey = keys[keys.length - 1];
        if (lastKey.toLowerCase().includes('opacity')) {
            // opacity values are unitless
            return value;
        }
        return `${value}px`;
    }
    return value;
};
function cssVarsParser(theme, options) {
    const { prefix, shouldSkipGeneratingVar } = options || {};
    const css = {};
    const vars = {};
    const varsWithDefaults = {};
    walkObjectDeep(theme, (keys, value, arrayKeys)=>{
        if (typeof value === 'string' || typeof value === 'number') {
            if (!shouldSkipGeneratingVar || !shouldSkipGeneratingVar(keys, value)) {
                // only create css & var if `shouldSkipGeneratingVar` return false
                const cssVar = `--${prefix ? `${prefix}-` : ''}${keys.join('-')}`;
                const resolvedValue = getCssValue(keys, value);
                Object.assign(css, {
                    [cssVar]: resolvedValue
                });
                assignNestedKeys(vars, keys, `var(${cssVar})`, arrayKeys);
                assignNestedKeys(varsWithDefaults, keys, `var(${cssVar}, ${resolvedValue})`, arrayKeys);
            }
        }
    }, (keys)=>keys[0] === 'vars' // skip 'vars/*' paths
    );
    return {
        css,
        vars,
        varsWithDefaults
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareCssVars.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$cssVarsParser$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/cssVarsParser.mjs [app-ssr] (ecmascript)");
;
;
function prepareCssVars(theme, parserConfig = {}) {
    const { getSelector = defaultGetSelector, disableCssColorScheme, colorSchemeSelector: selector, enableContrastVars } = parserConfig;
    // @ts-expect-error - ignore components do not exist
    const { colorSchemes = {}, components, defaultColorScheme = 'light', ...otherTheme } = theme;
    const { vars: rootVars, css: rootCss, varsWithDefaults: rootVarsWithDefaults } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$cssVarsParser$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(otherTheme, parserConfig);
    let themeVars = rootVarsWithDefaults;
    const colorSchemesMap = {};
    const { [defaultColorScheme]: defaultScheme, ...otherColorSchemes } = colorSchemes;
    Object.entries(otherColorSchemes || {}).forEach(([key, scheme])=>{
        const { vars, css, varsWithDefaults } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$cssVarsParser$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(scheme, parserConfig);
        themeVars = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(themeVars, varsWithDefaults);
        colorSchemesMap[key] = {
            css,
            vars
        };
    });
    if (defaultScheme) {
        // default color scheme vars should be merged last to set as default
        const { css, vars, varsWithDefaults } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$cssVarsParser$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(defaultScheme, parserConfig);
        themeVars = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(themeVars, varsWithDefaults);
        colorSchemesMap[defaultColorScheme] = {
            css,
            vars
        };
    }
    function defaultGetSelector(colorScheme, cssObject) {
        let rule = selector;
        if (selector === 'class') {
            rule = '.%s';
        }
        if (selector === 'data') {
            rule = '[data-%s]';
        }
        if (selector?.startsWith('data-') && !selector.includes('%s')) {
            // 'data-joy-color-scheme' -> '[data-joy-color-scheme="%s"]'
            rule = `[${selector}="%s"]`;
        }
        if (colorScheme) {
            if (rule === 'media') {
                if (theme.defaultColorScheme === colorScheme) {
                    return ':root';
                }
                const mode = colorSchemes[colorScheme]?.palette?.mode || colorScheme;
                return {
                    [`@media (prefers-color-scheme: ${mode})`]: {
                        ':root': cssObject
                    }
                };
            }
            if (rule) {
                if (theme.defaultColorScheme === colorScheme) {
                    return `:root, ${rule.replace('%s', String(colorScheme))}`;
                }
                return rule.replace('%s', String(colorScheme));
            }
        }
        return ':root';
    }
    const generateThemeVars = ()=>{
        let vars = {
            ...rootVars
        };
        Object.entries(colorSchemesMap).forEach(([, { vars: schemeVars }])=>{
            vars = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(vars, schemeVars);
        });
        return vars;
    };
    const generateStyleSheets = ()=>{
        const stylesheets = [];
        const colorScheme = theme.defaultColorScheme || 'light';
        function insertStyleSheet(key, css) {
            if (Object.keys(css).length) {
                stylesheets.push(typeof key === 'string' ? {
                    [key]: {
                        ...css
                    }
                } : key);
            }
        }
        insertStyleSheet(getSelector(undefined, {
            ...rootCss
        }), rootCss);
        const { [colorScheme]: defaultSchemeVal, ...other } = colorSchemesMap;
        if (defaultSchemeVal) {
            // default color scheme has to come before other color schemes
            const { css } = defaultSchemeVal;
            const cssColorSheme = colorSchemes[colorScheme]?.palette?.mode;
            const finalCss = !disableCssColorScheme && cssColorSheme ? {
                colorScheme: cssColorSheme,
                ...css
            } : {
                ...css
            };
            insertStyleSheet(getSelector(colorScheme, {
                ...finalCss
            }), finalCss);
        }
        Object.entries(other).forEach(([key, { css }])=>{
            const cssColorSheme = colorSchemes[key]?.palette?.mode;
            const finalCss = !disableCssColorScheme && cssColorSheme ? {
                colorScheme: cssColorSheme,
                ...css
            } : {
                ...css
            };
            insertStyleSheet(getSelector(key, {
                ...finalCss
            }), finalCss);
        });
        if (enableContrastVars) {
            stylesheets.push({
                ':root': {
                    // use double underscore to indicate that these are private variables
                    '--__l-threshold': '0.7',
                    '--__l': 'clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)',
                    '--__a': 'clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)' // 0.87 is the default alpha value for black text.
                }
            });
        }
        return stylesheets;
    };
    return {
        vars: themeVars,
        generateThemeVars,
        generateStyleSheets
    };
}
const __TURBOPACK__default__export__ = prepareCssVars;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareCssVars.mjs [app-ssr] (ecmascript) <export default as prepareCssVars>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareCssVars",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareCssVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareCssVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareCssVars.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareTypographyVars.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>prepareTypographyVars
]);
function prepareTypographyVars(typography) {
    const vars = {};
    const entries = Object.entries(typography);
    entries.forEach((entry)=>{
        const [key, value] = entry;
        if (typeof value === 'object') {
            vars[key] = `${value.fontStyle ? `${value.fontStyle} ` : ''}${value.fontVariant ? `${value.fontVariant} ` : ''}${value.fontWeight ? `${value.fontWeight} ` : ''}${value.fontStretch ? `${value.fontStretch} ` : ''}${value.fontSize || ''}${value.lineHeight ? `/${value.lineHeight} ` : ''}${value.fontFamily || ''}`;
        }
    });
    return vars;
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareTypographyVars.mjs [app-ssr] (ecmascript) <export default as prepareTypographyVars>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareTypographyVars",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareTypographyVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareTypographyVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareTypographyVars.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/getColorSchemeSelector.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* eslint-disable import/prefer-default-export */ __turbopack_context__.s([
    "createGetColorSchemeSelector",
    ()=>createGetColorSchemeSelector
]);
function createGetColorSchemeSelector(selector) {
    return function getColorSchemeSelector(colorScheme) {
        if (selector === 'media') {
            if ("TURBOPACK compile-time truthy", 1) {
                if (colorScheme !== 'light' && colorScheme !== 'dark') {
                    console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${colorScheme}'.`);
                }
            }
            return `@media (prefers-color-scheme: ${colorScheme})`;
        }
        if (selector) {
            if (selector.startsWith('data-') && !selector.includes('%s')) {
                return `[${selector}="${colorScheme}"] &`;
            }
            if (selector === 'class') {
                return `.${colorScheme} &`;
            }
            if (selector === 'data') {
                return `[data-${colorScheme}] &`;
            }
            return `${selector.replace('%s', colorScheme)} &`;
        }
        return '&';
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript) <export default as unstable_defaultSxConfig>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unstable_defaultSxConfig",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/DefaultPropsProvider/DefaultPropsProvider.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "useDefaultProps",
    ()=>useDefaultProps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$resolveProps$2f$resolveProps$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/resolveProps/resolveProps.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const PropsContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"](undefined);
function DefaultPropsProvider({ value, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PropsContext.Provider, {
        value: value,
        children: children
    });
}
("TURBOPACK compile-time truthy", 1) ? DefaultPropsProvider.propTypes = {
    // ┌────────────────────────────── Warning ──────────────────────────────┐
    // │ These PropTypes are generated from the TypeScript type definitions. │
    // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
    // └─────────────────────────────────────────────────────────────────────┘
    /**
   * @ignore
   */ children: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].node,
    /**
   * @ignore
   */ value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object
} : "TURBOPACK unreachable";
function getThemeProps(params) {
    const { theme, name, props } = params;
    if (!theme || !theme.components || !theme.components[name]) {
        return props;
    }
    const config = theme.components[name];
    if (config.defaultProps) {
        // compatible with v5 signature
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$resolveProps$2f$resolveProps$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(config.defaultProps, props, theme.components.mergeClassNameAndStyle);
    }
    if (!config.styleOverrides && !config.variants) {
        // v6 signature, no property 'defaultProps'
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$resolveProps$2f$resolveProps$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(config, props, theme.components.mergeClassNameAndStyle);
    }
    return props;
}
function useDefaultProps({ props, name }) {
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](PropsContext);
    return getThemeProps({
        props,
        name,
        theme: {
            components: ctx
        }
    });
}
const __TURBOPACK__default__export__ = DefaultPropsProvider;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/extendSxProp.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>extendSxProp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript)");
;
;
const splitProps = (props)=>{
    const result = {
        systemProps: {},
        otherProps: {}
    };
    const config = props?.theme?.unstable_sxConfig ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
    Object.keys(props).forEach((prop)=>{
        if (config[prop]) {
            result.systemProps[prop] = props[prop];
        } else {
            result.otherProps[prop] = props[prop];
        }
    });
    return result;
};
function extendSxProp(props) {
    const { sx: inSx, ...other } = props;
    const { systemProps, otherProps } = splitProps(other);
    let finalSx;
    if (Array.isArray(inSx)) {
        finalSx = [
            systemProps,
            ...inSx
        ];
    } else if (typeof inSx === 'function') {
        finalSx = (...args)=>{
            const result = inSx(...args);
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPlainObject"])(result)) {
                return systemProps;
            }
            return {
                ...systemProps,
                ...result
            };
        };
    } else {
        finalSx = {
            ...systemProps,
            ...inSx
        };
    }
    return {
        ...otherProps,
        sx: finalSx
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/extendSxProp.mjs [app-ssr] (ecmascript) <export default as extendSxProp>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extendSxProp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$extendSxProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$extendSxProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/extendSxProp.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useThemeWithoutDefault/useThemeWithoutDefault.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$emotion$2f$react$2f$dist$2f$emotion$2d$element$2d$782f682d$2e$development$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__T__as__ThemeContext$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0/node_modules/@emotion/react/dist/emotion-element-782f682d.development.esm.js [app-ssr] (ecmascript) <export T as ThemeContext>");
'use client';
;
;
function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
}
function useThemeWithoutDefault(defaultTheme = null) {
    const contextTheme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$emotion$2f$react$2f$dist$2f$emotion$2d$element$2d$782f682d$2e$development$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__T__as__ThemeContext$3e$__["ThemeContext"]);
    return !contextTheme || isObjectEmpty(contextTheme) ? defaultTheme : contextTheme;
}
const __TURBOPACK__default__export__ = useThemeWithoutDefault;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useTheme/useTheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "systemDefaultTheme",
    ()=>systemDefaultTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useThemeWithoutDefault$2f$useThemeWithoutDefault$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useThemeWithoutDefault/useThemeWithoutDefault.mjs [app-ssr] (ecmascript)");
'use client';
;
;
const systemDefaultTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
function useTheme(defaultTheme = systemDefaultTheme) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useThemeWithoutDefault$2f$useThemeWithoutDefault$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(defaultTheme);
}
const __TURBOPACK__default__export__ = useTheme;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useTheme/useTheme.mjs [app-ssr] (ecmascript) <export default as useTheme>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTheme",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useTheme/useTheme.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/GlobalStyles/GlobalStyles.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GlobalStyles$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+styled-engine@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emot_e78716923fb2714560d01c0f19f6638c/node_modules/@mui/styled-engine/GlobalStyles/GlobalStyles.mjs [app-ssr] (ecmascript) <export default as GlobalStyles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+styled-engine@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emot_e78716923fb2714560d01c0f19f6638c/node_modules/@mui/styled-engine/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useTheme/useTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function wrapGlobalLayer(styles) {
    const serialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["internal_serializeStyles"])(styles);
    if (styles !== serialized && serialized.styles) {
        if (!serialized.styles.match(/^@layer\s+[^{]*$/)) {
            // If the styles are not already wrapped in a layer, wrap them in a global layer.
            serialized.styles = `@layer global{${serialized.styles}}`;
        }
        return serialized;
    }
    return styles;
}
function GlobalStyles({ styles, themeId, defaultTheme = {} }) {
    const upperTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(defaultTheme);
    const resolvedTheme = themeId ? upperTheme[themeId] || upperTheme : upperTheme;
    let globalStyles = typeof styles === 'function' ? styles(resolvedTheme) : styles;
    if (resolvedTheme.modularCssLayers) {
        if (Array.isArray(globalStyles)) {
            globalStyles = globalStyles.map((styleArg)=>{
                if (typeof styleArg === 'function') {
                    return wrapGlobalLayer(styleArg(resolvedTheme));
                }
                return wrapGlobalLayer(styleArg);
            });
        } else {
            globalStyles = wrapGlobalLayer(globalStyles);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GlobalStyles$3e$__["GlobalStyles"], {
        styles: globalStyles
    });
}
("TURBOPACK compile-time truthy", 1) ? GlobalStyles.propTypes = {
    // ┌────────────────────────────── Warning ──────────────────────────────┐
    // │ These PropTypes are generated from the TypeScript type definitions. │
    // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
    // └─────────────────────────────────────────────────────────────────────┘
    /**
   * @ignore
   */ defaultTheme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object,
    /**
   * @ignore
   */ styles: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] /* @typescript-to-proptypes-ignore */ .oneOfType([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].array,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].number,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].bool
    ]),
    /**
   * @ignore
   */ themeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string
} : "TURBOPACK unreachable";
const __TURBOPACK__default__export__ = GlobalStyles;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/GlobalStyles/GlobalStyles.mjs [app-ssr] (ecmascript) <export default as GlobalStyles>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GlobalStyles",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/GlobalStyles/GlobalStyles.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/memoTheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>unstable_memoTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$preprocessStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/preprocessStyles.mjs [app-ssr] (ecmascript)");
;
/* eslint-disable @typescript-eslint/naming-convention */ // We need to pass an argument as `{ theme }` for PigmentCSS, but we don't want to
// allocate more objects.
const arg = {
    theme: undefined
};
function unstable_memoTheme(styleFn) {
    let lastValue;
    let lastTheme;
    return function styleMemoized(props) {
        let value = lastValue;
        if (value === undefined || props.theme !== lastTheme) {
            arg.theme = props.theme;
            value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$preprocessStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(styleFn(arg));
            lastValue = value;
            lastTheme = props.theme;
        }
        return value;
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/memoTheme.mjs [app-ssr] (ecmascript) <export default as unstable_memoTheme>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unstable_memoTheme",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$memoTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$memoTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/memoTheme.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/RtlProvider/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "useRtl",
    ()=>useRtl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const RtlContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"](undefined);
function RtlProvider({ value, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RtlContext.Provider, {
        value: value ?? true,
        ...props
    });
}
("TURBOPACK compile-time truthy", 1) ? RtlProvider.propTypes = {
    children: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].node,
    value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].bool
} : "TURBOPACK unreachable";
const useRtl = ()=>{
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](RtlContext);
    return value ?? false;
};
const __TURBOPACK__default__export__ = RtlProvider;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/ThemeProvider/useLayerOrder.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useLayerOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEnhancedEffect/useEnhancedEffect.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useId$2f$useId$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useId/useId.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/GlobalStyles/GlobalStyles.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useThemeWithoutDefault$2f$useThemeWithoutDefault$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useThemeWithoutDefault/useThemeWithoutDefault.mjs [app-ssr] (ecmascript)");
/**
 * This hook returns a `GlobalStyles` component that sets the CSS layer order (for server-side rendering).
 * Then on client-side, it injects the CSS layer order into the document head to ensure that the layer order is always present first before other Emotion styles.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
;
;
;
;
;
function useLayerOrder(theme) {
    const upperTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useThemeWithoutDefault$2f$useThemeWithoutDefault$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useId$2f$useId$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])() || '';
    const { modularCssLayers } = theme;
    let layerOrder = 'mui.global, mui.components, mui.theme, mui.custom, mui.sx';
    if (!modularCssLayers || upperTheme !== null) {
        // skip this hook if upper theme exists.
        layerOrder = '';
    } else if (typeof modularCssLayers === 'string') {
        layerOrder = modularCssLayers.replace(/mui(?!\.)/g, layerOrder);
    } else {
        layerOrder = `@layer ${layerOrder};`;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(()=>{
        const head = document.querySelector('head');
        if (!head) {
            return;
        }
        const firstChild = head.firstChild;
        if (layerOrder) {
            // Only insert if first child doesn't have data-mui-layer-order attribute
            if (firstChild && firstChild.hasAttribute?.('data-mui-layer-order') && firstChild.getAttribute('data-mui-layer-order') === id) {
                return;
            }
            const styleElement = document.createElement('style');
            styleElement.setAttribute('data-mui-layer-order', id);
            styleElement.textContent = layerOrder;
            head.prepend(styleElement);
        } else {
            head.querySelector(`style[data-mui-layer-order="${id}"]`)?.remove();
        }
    }, [
        layerOrder,
        id
    ]);
    if (!layerOrder) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        styles: layerOrder
    });
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/ThemeProvider/ThemeProvider.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$private$2d$theming$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$private$2d$theming$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+private-theming@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/private-theming/ThemeProvider/ThemeProvider.mjs [app-ssr] (ecmascript) <export default as ThemeProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$private$2d$theming$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$private$2d$theming$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+private-theming@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/private-theming/useTheme/useTheme.mjs [app-ssr] (ecmascript) <export default as useTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$exactProp$2f$exactProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/exactProp/exactProp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$emotion$2f$react$2f$dist$2f$emotion$2d$element$2d$782f682d$2e$development$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__T__as__ThemeContext$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0/node_modules/@emotion/react/dist/emotion-element-782f682d.development.esm.js [app-ssr] (ecmascript) <export T as ThemeContext>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useThemeWithoutDefault$2f$useThemeWithoutDefault$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useThemeWithoutDefault/useThemeWithoutDefault.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$RtlProvider$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/RtlProvider/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$DefaultPropsProvider$2f$DefaultPropsProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/DefaultPropsProvider/DefaultPropsProvider.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$useLayerOrder$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/ThemeProvider/useLayerOrder.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
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
const EMPTY_THEME = {};
function useThemeScoping(themeId, upperTheme, localTheme, isPrivate = false) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>{
        const resolvedTheme = themeId ? upperTheme[themeId] || upperTheme : upperTheme;
        if (typeof localTheme === 'function') {
            const mergedTheme = localTheme(resolvedTheme);
            const result = themeId ? {
                ...upperTheme,
                [themeId]: mergedTheme
            } : mergedTheme;
            // must return a function for the private theme to NOT merge with the upper theme.
            // see the test case "use provided theme from a callback" in ThemeProvider.test.js
            if (isPrivate) {
                return ()=>result;
            }
            return result;
        }
        return themeId ? {
            ...upperTheme,
            [themeId]: localTheme
        } : {
            ...upperTheme,
            ...localTheme
        };
    }, [
        themeId,
        upperTheme,
        localTheme,
        isPrivate
    ]);
}
/**
 * This component makes the `theme` available down the React tree.
 * It should preferably be used at **the root of your component tree**.
 *
 * <ThemeProvider theme={theme}> // existing use case
 * <ThemeProvider theme={{ id: theme }}> // theme scoping
 */ function ThemeProvider(props) {
    const { children, theme: localTheme, themeId } = props;
    const upperTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useThemeWithoutDefault$2f$useThemeWithoutDefault$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(EMPTY_THEME);
    const upperPrivateTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$private$2d$theming$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$private$2d$theming$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"])() || EMPTY_THEME;
    if ("TURBOPACK compile-time truthy", 1) {
        if (upperTheme === null && typeof localTheme === 'function' || themeId && upperTheme && !upperTheme[themeId] && typeof localTheme === 'function') {
            console.error([
                'MUI: You are providing a theme function prop to the ThemeProvider component:',
                '<ThemeProvider theme={outerTheme => outerTheme} />',
                '',
                'However, no outer theme is present.',
                'Make sure a theme is already injected higher in the React tree ' + 'or provide a theme object.'
            ].join('\n'));
        }
    }
    const engineTheme = useThemeScoping(themeId, upperTheme, localTheme);
    const privateTheme = useThemeScoping(themeId, upperPrivateTheme, localTheme, true);
    const rtlValue = (themeId ? engineTheme[themeId] : engineTheme).direction === 'rtl';
    const layerOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$useLayerOrder$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(engineTheme);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$private$2d$theming$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$private$2d$theming$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__["ThemeProvider"], {
        theme: privateTheme,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$emotion$2f$react$2f$dist$2f$emotion$2d$element$2d$782f682d$2e$development$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__T__as__ThemeContext$3e$__["ThemeContext"].Provider, {
            value: engineTheme,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$RtlProvider$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                value: rtlValue,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$DefaultPropsProvider$2f$DefaultPropsProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    value: themeId ? engineTheme[themeId].components : engineTheme.components,
                    children: [
                        layerOrder,
                        children
                    ]
                })
            })
        })
    });
}
("TURBOPACK compile-time truthy", 1) ? ThemeProvider.propTypes = {
    // ┌────────────────────────────── Warning ──────────────────────────────┐
    // │ These PropTypes are generated from the TypeScript type definitions. │
    // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
    // └─────────────────────────────────────────────────────────────────────┘
    /**
   * Your component tree.
   */ children: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].node,
    /**
   * A theme object. You can provide a function to extend the outer theme.
   */ theme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].oneOfType([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object
    ]).isRequired,
    /**
   * The design system's unique id for getting the corresponded theme when there are multiple design systems.
   */ themeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string
} : "TURBOPACK unreachable";
if ("TURBOPACK compile-time truthy", 1) {
    // eslint-disable-next-line
    ThemeProvider['propTypes' + ''] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$exactProp$2f$exactProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(ThemeProvider.propTypes);
}
const __TURBOPACK__default__export__ = ThemeProvider;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/ThemeProvider/ThemeProvider.mjs [app-ssr] (ecmascript) <export default as ThemeProvider>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/ThemeProvider/ThemeProvider.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/InitColorSchemeScript/InitColorSchemeScript.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_ATTRIBUTE",
    ()=>DEFAULT_ATTRIBUTE,
    "DEFAULT_COLOR_SCHEME_STORAGE_KEY",
    ()=>DEFAULT_COLOR_SCHEME_STORAGE_KEY,
    "DEFAULT_MODE_STORAGE_KEY",
    ()=>DEFAULT_MODE_STORAGE_KEY,
    "buildInitColorSchemeScript",
    ()=>buildInitColorSchemeScript,
    "default",
    ()=>InitColorSchemeScript
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
'use client';
;
;
const DEFAULT_MODE_STORAGE_KEY = 'mode';
const DEFAULT_COLOR_SCHEME_STORAGE_KEY = 'color-scheme';
const DEFAULT_ATTRIBUTE = 'data-color-scheme';
// React 17 has no `useSyncExternalStore`; spread into a plain object so reading the
// missing property returns `undefined` instead of throwing under strict ESM. See #41190 (comment).
const safeReact = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
};
const maybeReactUseSyncExternalStore = safeReact.useSyncExternalStore;
const subscribe = ()=>()=>{};
// Serialize a value into a JS string literal safe to embed in the inline script. JSON.stringify
// escapes quotes and backslashes; the extra replaces handle what it does not: `<` (so `</script>`
// can't close the element) and the U+2028/U+2029 line separators, invalid raw inside a JS string.
function serializeScriptValue(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
// Insert a runtime scheme variable (`light`, `dark`, or `colorScheme`) into every `%s` placeholder
// of an attribute/selector template.
function interpolateScheme(template, variable) {
    const segments = template.split('%s');
    const tokens = [];
    for(let index = 0; index < segments.length; index += 1){
        if (index > 0) {
            tokens.push(variable);
        }
        if (segments[index]) {
            tokens.push(serializeScriptValue(segments[index]));
        }
    }
    return tokens.join(' + ') || '""';
}
/**
 * `true` during the server render and the matching hydration render, `false`
 * on every client render afterwards. React warns when a `<script>` is
 * created during a client render (such scripts never execute), so the inline
 * script is only emitted on the server pass and dropped after hydration — the
 * attribute it already set on the document persists. React <18 has no
 * `useSyncExternalStore` and no such warning, so the script is always emitted.
 */ function useIsServerRender() {
    if (maybeReactUseSyncExternalStore === undefined) {
        return true;
    }
    return maybeReactUseSyncExternalStore(subscribe, ()=>false, ()=>true);
}
function buildInitColorSchemeScript(options) {
    const { defaultMode = 'system', defaultLightColorScheme = 'light', defaultDarkColorScheme = 'dark', modeStorageKey = DEFAULT_MODE_STORAGE_KEY, colorSchemeStorageKey = DEFAULT_COLOR_SCHEME_STORAGE_KEY, attribute: initialAttribute = DEFAULT_ATTRIBUTE, colorSchemeNode = 'document.documentElement', nonce } = options || {};
    let setter = '';
    let attribute = initialAttribute;
    if (initialAttribute === 'class') {
        attribute = '.%s';
    }
    if (initialAttribute === 'data') {
        attribute = '[data-%s]';
    }
    if (attribute.startsWith('.')) {
        const selector = attribute.substring(1);
        setter += `${colorSchemeNode}.classList.remove(${interpolateScheme(selector, 'light')}, ${interpolateScheme(selector, 'dark')});
      ${colorSchemeNode}.classList.add(${interpolateScheme(selector, 'colorScheme')});`;
    }
    const matches = attribute.match(/\[([^[\]]+)\]/); // case [data-color-scheme='%s'] or [data-color-scheme]
    if (matches) {
        const separator = matches[1].indexOf('=');
        const attr = separator === -1 ? matches[1] : matches[1].slice(0, separator);
        const value = separator === -1 ? undefined : matches[1].slice(separator + 1);
        if (!value) {
            setter += `${colorSchemeNode}.removeAttribute(${interpolateScheme(attr, 'light')});
      ${colorSchemeNode}.removeAttribute(${interpolateScheme(attr, 'dark')});`;
        }
        const attributeValue = value ? interpolateScheme(value.replace(/^(['"])(.*)\1$/, '$2'), 'colorScheme') : '""';
        setter += `
      ${colorSchemeNode}.setAttribute(${interpolateScheme(attr, 'colorScheme')}, ${attributeValue});`;
    } else if (!attribute.startsWith('.')) {
        setter += `${colorSchemeNode}.setAttribute(${serializeScriptValue(attribute)}, colorScheme);`;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("script", {
        suppressHydrationWarning: true,
        nonce: ("TURBOPACK compile-time truthy", 1) ? nonce : "TURBOPACK unreachable",
        dangerouslySetInnerHTML: {
            __html: `(function() {
try {
  let colorScheme = '';
  const mode = localStorage.getItem(${serializeScriptValue(modeStorageKey)}) || ${serializeScriptValue(defaultMode)};
  const dark = localStorage.getItem(${serializeScriptValue(`${colorSchemeStorageKey}-dark`)}) || ${serializeScriptValue(defaultDarkColorScheme)};
  const light = localStorage.getItem(${serializeScriptValue(`${colorSchemeStorageKey}-light`)}) || ${serializeScriptValue(defaultLightColorScheme)};
  if (mode === 'system') {
    // handle system mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql.matches) {
      colorScheme = dark
    } else {
      colorScheme = light
    }
  }
  if (mode === 'light') {
    colorScheme = light;
  }
  if (mode === 'dark') {
    colorScheme = dark;
  }
  if (colorScheme) {
    ${setter}
  }
} catch(e){}})();`
        }
    }, "mui-color-scheme-init");
}
function InitColorSchemeScript(options) {
    const isServerRender = useIsServerRender();
    if (!isServerRender) {
        return null;
    }
    return buildInitColorSchemeScript(options);
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/localStorageManager.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
function noop() {}
const localStorageManager = ({ key, storageWindow })=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return {
        get (defaultValue) {
            if ("TURBOPACK compile-time truthy", 1) {
                return undefined;
            }
            //TURBOPACK unreachable
            ;
            let value;
        },
        set: (value)=>{
            if (storageWindow) {
                try {
                    storageWindow.localStorage.setItem(key, value);
                } catch  {
                // Unsupported
                }
            }
        },
        subscribe: (handler)=>{
            if (!storageWindow) {
                return noop;
            }
            const listener = (event)=>{
                const value = event.newValue;
                if (event.key === key) {
                    handler(value);
                }
            };
            storageWindow.addEventListener('storage', listener);
            return ()=>{
                storageWindow.removeEventListener('storage', listener);
            };
        }
    };
};
const __TURBOPACK__default__export__ = localStorageManager;
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/useCurrentColorScheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useCurrentColorScheme,
    "getColorScheme",
    ()=>getColorScheme,
    "getSystemMode",
    ()=>getSystemMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/InitColorSchemeScript/InitColorSchemeScript.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$localStorageManager$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/localStorageManager.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
function noop() {}
function getSystemMode(mode) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return undefined;
}
function processState(state, callback) {
    if (state.mode === 'light' || state.mode === 'system' && state.systemMode === 'light') {
        return callback('light');
    }
    if (state.mode === 'dark' || state.mode === 'system' && state.systemMode === 'dark') {
        return callback('dark');
    }
    return undefined;
}
function getColorScheme(state) {
    return processState(state, (mode)=>{
        if (mode === 'light') {
            return state.lightColorScheme;
        }
        if (mode === 'dark') {
            return state.darkColorScheme;
        }
        return undefined;
    });
}
function useCurrentColorScheme(options) {
    const { defaultMode = 'light', defaultLightColorScheme, defaultDarkColorScheme, supportedColorSchemes = [], modeStorageKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_MODE_STORAGE_KEY"], colorSchemeStorageKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COLOR_SCHEME_STORAGE_KEY"], storageWindow = ("TURBOPACK compile-time truthy", 1) ? undefined : "TURBOPACK unreachable", storageManager = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$localStorageManager$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], noSsr = false } = options;
    const joinedColorSchemes = supportedColorSchemes.join(',');
    const isMultiSchemes = supportedColorSchemes.length > 1;
    const modeStorage = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>storageManager?.({
            key: modeStorageKey,
            storageWindow
        }), [
        storageManager,
        modeStorageKey,
        storageWindow
    ]);
    const lightStorage = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>storageManager?.({
            key: `${colorSchemeStorageKey}-light`,
            storageWindow
        }), [
        storageManager,
        colorSchemeStorageKey,
        storageWindow
    ]);
    const darkStorage = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>storageManager?.({
            key: `${colorSchemeStorageKey}-dark`,
            storageWindow
        }), [
        storageManager,
        colorSchemeStorageKey,
        storageWindow
    ]);
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](()=>{
        const initialMode = modeStorage?.get(defaultMode) || defaultMode;
        const lightColorScheme = lightStorage?.get(defaultLightColorScheme) || defaultLightColorScheme;
        const darkColorScheme = darkStorage?.get(defaultDarkColorScheme) || defaultDarkColorScheme;
        return {
            mode: initialMode,
            systemMode: getSystemMode(initialMode),
            lightColorScheme,
            darkColorScheme
        };
    });
    const [isClient, setIsClient] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](noSsr || !isMultiSchemes);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true); // to rerender the component after hydration
    }, []);
    const colorScheme = getColorScheme(state);
    const setMode = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((mode)=>{
        setState((currentState)=>{
            if (mode === currentState.mode) {
                // do nothing if mode does not change
                return currentState;
            }
            const newMode = mode ?? defaultMode;
            modeStorage?.set(newMode);
            return {
                ...currentState,
                mode: newMode,
                systemMode: getSystemMode(newMode)
            };
        });
    }, [
        modeStorage,
        defaultMode
    ]);
    const setColorScheme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((value)=>{
        if (!value) {
            setState((currentState)=>{
                lightStorage?.set(defaultLightColorScheme);
                darkStorage?.set(defaultDarkColorScheme);
                return {
                    ...currentState,
                    lightColorScheme: defaultLightColorScheme,
                    darkColorScheme: defaultDarkColorScheme
                };
            });
        } else if (typeof value === 'string') {
            if (value && !joinedColorSchemes.includes(value)) {
                console.error(`\`${value}\` does not exist in \`theme.colorSchemes\`.`);
            } else {
                setState((currentState)=>{
                    const newState = {
                        ...currentState
                    };
                    processState(currentState, (mode)=>{
                        if (mode === 'light') {
                            lightStorage?.set(value);
                            newState.lightColorScheme = value;
                        }
                        if (mode === 'dark') {
                            darkStorage?.set(value);
                            newState.darkColorScheme = value;
                        }
                    });
                    return newState;
                });
            }
        } else {
            setState((currentState)=>{
                const newState = {
                    ...currentState
                };
                const newLightColorScheme = value.light === null ? defaultLightColorScheme : value.light;
                const newDarkColorScheme = value.dark === null ? defaultDarkColorScheme : value.dark;
                if (newLightColorScheme) {
                    if (!joinedColorSchemes.includes(newLightColorScheme)) {
                        console.error(`\`${newLightColorScheme}\` does not exist in \`theme.colorSchemes\`.`);
                    } else {
                        newState.lightColorScheme = newLightColorScheme;
                        lightStorage?.set(newLightColorScheme);
                    }
                }
                if (newDarkColorScheme) {
                    if (!joinedColorSchemes.includes(newDarkColorScheme)) {
                        console.error(`\`${newDarkColorScheme}\` does not exist in \`theme.colorSchemes\`.`);
                    } else {
                        newState.darkColorScheme = newDarkColorScheme;
                        darkStorage?.set(newDarkColorScheme);
                    }
                }
                return newState;
            });
        }
    }, [
        joinedColorSchemes,
        lightStorage,
        darkStorage,
        defaultLightColorScheme,
        defaultDarkColorScheme
    ]);
    const handleMediaQuery = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((event)=>{
        if (state.mode === 'system') {
            setState((currentState)=>{
                const systemMode = event?.matches ? 'dark' : 'light';
                // Early exit, nothing changed.
                if (currentState.systemMode === systemMode) {
                    return currentState;
                }
                return {
                    ...currentState,
                    systemMode
                };
            });
        }
    }, [
        state.mode
    ]);
    // Ref hack to avoid adding handleMediaQuery as a dep
    const mediaListener = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](handleMediaQuery);
    mediaListener.current = handleMediaQuery;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        if (typeof window.matchMedia !== 'function' || !isMultiSchemes) {
            return undefined;
        }
        const handler = (...args)=>mediaListener.current(...args);
        // Always listen to System preference
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        // Intentionally use deprecated listener methods to support iOS & old browsers
        media.addListener(handler);
        handler(media);
        return ()=>{
            media.removeListener(handler);
        };
    }, [
        isMultiSchemes
    ]);
    // Handle when localStorage has changed
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        if (isMultiSchemes) {
            const unsubscribeMode = modeStorage?.subscribe((value)=>{
                if (!value || [
                    'light',
                    'dark',
                    'system'
                ].includes(value)) {
                    setMode(value || defaultMode);
                }
            }) || noop;
            const unsubscribeLight = lightStorage?.subscribe((value)=>{
                if (!value || joinedColorSchemes.match(value)) {
                    setColorScheme({
                        light: value
                    });
                }
            }) || noop;
            const unsubscribeDark = darkStorage?.subscribe((value)=>{
                if (!value || joinedColorSchemes.match(value)) {
                    setColorScheme({
                        dark: value
                    });
                }
            }) || noop;
            return ()=>{
                unsubscribeMode();
                unsubscribeLight();
                unsubscribeDark();
            };
        }
        return undefined;
    }, [
        setColorScheme,
        setMode,
        joinedColorSchemes,
        defaultMode,
        storageWindow,
        isMultiSchemes,
        modeStorage,
        lightStorage,
        darkStorage
    ]);
    return {
        ...state,
        mode: isClient ? state.mode : undefined,
        systemMode: isClient ? state.systemMode : undefined,
        colorScheme: isClient ? colorScheme : undefined,
        setMode,
        setColorScheme
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createCssVarsProvider.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DISABLE_CSS_TRANSITION",
    ()=>DISABLE_CSS_TRANSITION,
    "default",
    ()=>createCssVarsProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GlobalStyles$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+styled-engine@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emot_e78716923fb2714560d01c0f19f6638c/node_modules/@mui/styled-engine/GlobalStyles/GlobalStyles.mjs [app-ssr] (ecmascript) <export default as GlobalStyles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$private$2d$theming$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$private$2d$theming$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+private-theming@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/private-theming/useTheme/useTheme.mjs [app-ssr] (ecmascript) <export default as useTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/useEnhancedEffect/useEnhancedEffect.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/ThemeProvider/ThemeProvider.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/InitColorSchemeScript/InitColorSchemeScript.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$useCurrentColorScheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/useCurrentColorScheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
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
const DISABLE_CSS_TRANSITION = '*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}';
function createCssVarsProvider(options) {
    const { themeId, /**
     * This `theme` object needs to follow a certain structure to
     * be used correctly by the finel `CssVarsProvider`. It should have a
     * `colorSchemes` key with the light and dark (and any other) palette.
     * It should also ideally have a vars object created using `prepareCssVars`.
     */ theme: defaultTheme = {}, modeStorageKey: defaultModeStorageKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_MODE_STORAGE_KEY"], colorSchemeStorageKey: defaultColorSchemeStorageKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COLOR_SCHEME_STORAGE_KEY"], disableTransitionOnChange: designSystemTransitionOnChange = false, defaultColorScheme, resolveTheme } = options;
    const defaultContext = {
        allColorSchemes: [],
        colorScheme: undefined,
        darkColorScheme: undefined,
        lightColorScheme: undefined,
        mode: undefined,
        setColorScheme: ()=>{},
        setMode: ()=>{},
        systemMode: undefined
    };
    const ColorSchemeContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"](undefined);
    if ("TURBOPACK compile-time truthy", 1) {
        ColorSchemeContext.displayName = 'ColorSchemeContext';
    }
    const useColorScheme = ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](ColorSchemeContext) || defaultContext;
    const defaultColorSchemes = {};
    const defaultComponents = {};
    function CssVarsProvider(props) {
        const { children, theme: themeProp, modeStorageKey = defaultModeStorageKey, colorSchemeStorageKey = defaultColorSchemeStorageKey, disableTransitionOnChange = designSystemTransitionOnChange, storageManager, storageWindow = ("TURBOPACK compile-time truthy", 1) ? undefined : "TURBOPACK unreachable", documentNode = typeof document === 'undefined' ? undefined : document, colorSchemeNode = typeof document === 'undefined' ? undefined : document.documentElement, disableNestedContext = false, disableStyleSheetGeneration = false, defaultMode: initialMode = 'system', forceThemeRerender = false, noSsr } = props;
        const hasMounted = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](false);
        const upperTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$private$2d$theming$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$private$2d$theming$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"])();
        const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](ColorSchemeContext);
        const nested = !!ctx && !disableNestedContext;
        const initialTheme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>{
            if (themeProp) {
                return themeProp;
            }
            return typeof defaultTheme === 'function' ? defaultTheme() : defaultTheme;
        }, [
            themeProp
        ]);
        const scopedTheme = initialTheme[themeId];
        const restThemeProp = scopedTheme || initialTheme;
        const { colorSchemes = defaultColorSchemes, components = defaultComponents, cssVarPrefix } = restThemeProp;
        const joinedColorSchemes = Object.keys(colorSchemes).filter((k)=>!!colorSchemes[k]).join(',');
        const allColorSchemes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>joinedColorSchemes.split(','), [
            joinedColorSchemes
        ]);
        const defaultLightColorScheme = typeof defaultColorScheme === 'string' ? defaultColorScheme : defaultColorScheme.light;
        const defaultDarkColorScheme = typeof defaultColorScheme === 'string' ? defaultColorScheme : defaultColorScheme.dark;
        const defaultMode = colorSchemes[defaultLightColorScheme] && colorSchemes[defaultDarkColorScheme] ? initialMode : colorSchemes[restThemeProp.defaultColorScheme]?.palette?.mode || restThemeProp.palette?.mode;
        // 1. Get the data about the `mode`, `colorScheme`, and setter functions.
        const { mode: stateMode, setMode, systemMode, lightColorScheme, darkColorScheme, colorScheme: stateColorScheme, setColorScheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$useCurrentColorScheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            supportedColorSchemes: allColorSchemes,
            defaultLightColorScheme,
            defaultDarkColorScheme,
            modeStorageKey,
            colorSchemeStorageKey,
            defaultMode,
            storageManager,
            storageWindow,
            noSsr
        });
        let mode = stateMode;
        let colorScheme = stateColorScheme;
        if (nested) {
            mode = ctx.mode;
            colorScheme = ctx.colorScheme;
        }
        if ("TURBOPACK compile-time truthy", 1) {
            if (forceThemeRerender && !restThemeProp.vars) {
                console.warn([
                    'MUI: The `forceThemeRerender` prop should only be used with CSS theme variables.',
                    'Note that it will slow down the app when changing between modes, so only do this when you cannot find a better solution.'
                ].join('\n'));
            }
        }
        // `colorScheme` is undefined on the server and hydration phase
        let calculatedColorScheme = colorScheme || restThemeProp.defaultColorScheme;
        if (restThemeProp.vars && !forceThemeRerender) {
            calculatedColorScheme = restThemeProp.defaultColorScheme;
        }
        const memoTheme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>{
            // 2. get the `vars` object that refers to the CSS custom properties
            const themeVars = restThemeProp.generateThemeVars?.() || restThemeProp.vars;
            // 3. Start composing the theme object
            const theme = {
                ...restThemeProp,
                components,
                colorSchemes,
                cssVarPrefix,
                vars: themeVars
            };
            if (typeof theme.generateSpacing === 'function') {
                theme.spacing = theme.generateSpacing();
            }
            // 4. Resolve the color scheme and merge it to the theme
            if (calculatedColorScheme) {
                const scheme = colorSchemes[calculatedColorScheme];
                if (scheme && typeof scheme === 'object') {
                    // 4.1 Merge the selected color scheme to the theme
                    Object.keys(scheme).forEach((schemeKey)=>{
                        if (scheme[schemeKey] && typeof scheme[schemeKey] === 'object') {
                            // shallow merge the 1st level structure of the theme.
                            theme[schemeKey] = {
                                ...theme[schemeKey],
                                ...scheme[schemeKey]
                            };
                        } else {
                            theme[schemeKey] = scheme[schemeKey];
                        }
                    });
                }
            }
            return resolveTheme ? resolveTheme(theme) : theme;
        }, [
            restThemeProp,
            calculatedColorScheme,
            components,
            colorSchemes,
            cssVarPrefix
        ]);
        // 5. Declaring effects
        // 5.1 Updates the selector value to use the current color scheme which tells CSS to use the proper stylesheet.
        const colorSchemeSelector = restThemeProp.colorSchemeSelector;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$useEnhancedEffect$2f$useEnhancedEffect$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(()=>{
            if (colorScheme && colorSchemeNode && colorSchemeSelector && colorSchemeSelector !== 'media') {
                const selector = colorSchemeSelector;
                let rule = colorSchemeSelector;
                if (selector === 'class') {
                    rule = `.%s`;
                }
                if (selector === 'data') {
                    rule = `[data-%s]`;
                }
                if (selector?.startsWith('data-') && !selector.includes('%s')) {
                    // 'data-mui-color-scheme' -> '[data-mui-color-scheme="%s"]'
                    rule = `[${selector}="%s"]`;
                }
                if (rule.startsWith('.')) {
                    colorSchemeNode.classList.remove(...allColorSchemes.map((scheme)=>rule.substring(1).replace('%s', scheme)));
                    colorSchemeNode.classList.add(rule.substring(1).replace('%s', colorScheme));
                } else {
                    const matches = rule.replace('%s', colorScheme).match(/\[([^\]]+)\]/);
                    if (matches) {
                        const [attr, value] = matches[1].split('=');
                        if (!value) {
                            // for attributes like `data-theme-dark`, `data-theme-light`
                            // remove all the existing data attributes before setting the new one
                            allColorSchemes.forEach((scheme)=>{
                                colorSchemeNode.removeAttribute(attr.replace(colorScheme, scheme));
                            });
                        }
                        colorSchemeNode.setAttribute(attr, value ? value.replace(/"|'/g, '') : '');
                    } else {
                        colorSchemeNode.setAttribute(rule, colorScheme);
                    }
                }
            }
        }, [
            colorScheme,
            colorSchemeSelector,
            colorSchemeNode,
            allColorSchemes
        ]);
        // 5.2 Remove the CSS transition when color scheme changes to create instant experience.
        // credit: https://github.com/pacocoursey/next-themes/blob/b5c2bad50de2d61ad7b52a9c5cdc801a78507d7a/index.tsx#L313
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
            let timer;
            if (disableTransitionOnChange && hasMounted.current && documentNode) {
                const css = documentNode.createElement('style');
                css.appendChild(documentNode.createTextNode(DISABLE_CSS_TRANSITION));
                documentNode.head.appendChild(css);
                // Force browser repaint
                (()=>window.getComputedStyle(documentNode.body))();
                timer = setTimeout(()=>{
                    documentNode.head.removeChild(css);
                }, 1);
            }
            return ()=>{
                clearTimeout(timer);
            };
        }, [
            colorScheme,
            disableTransitionOnChange,
            documentNode
        ]);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
            hasMounted.current = true;
            return ()=>{
                hasMounted.current = false;
            };
        }, []);
        const contextValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>({
                allColorSchemes,
                colorScheme,
                darkColorScheme,
                lightColorScheme,
                mode,
                setColorScheme,
                setMode: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : (newMode)=>{
                    if (memoTheme.colorSchemeSelector === 'media') {
                        // #host-reference
                        console.error([
                            'MUI: The `setMode` function has no effect if `colorSchemeSelector` is `media` (`media` is the default value).',
                            'To toggle the mode manually, please configure `colorSchemeSelector` to use a class or data attribute.',
                            'To learn more, visit https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually'
                        ].join('\n'));
                    }
                    setMode(newMode);
                },
                systemMode
            }), [
            allColorSchemes,
            colorScheme,
            darkColorScheme,
            lightColorScheme,
            mode,
            setColorScheme,
            setMode,
            systemMode,
            memoTheme.colorSchemeSelector
        ]);
        let shouldGenerateStyleSheet = true;
        if (disableStyleSheetGeneration || restThemeProp.cssVariables === false || nested && upperTheme?.cssVarPrefix === cssVarPrefix) {
            shouldGenerateStyleSheet = false;
        }
        const element = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    themeId: scopedTheme ? themeId : undefined,
                    theme: memoTheme,
                    children: children
                }),
                shouldGenerateStyleSheet && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$styled$2d$engine$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emot_e78716923fb2714560d01c0f19f6638c$2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$GlobalStyles$2f$GlobalStyles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GlobalStyles$3e$__["GlobalStyles"], {
                    styles: memoTheme.generateStyleSheets?.() || []
                })
            ]
        });
        if (nested) {
            return element;
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ColorSchemeContext.Provider, {
            value: contextValue,
            children: element
        });
    }
    ("TURBOPACK compile-time truthy", 1) ? CssVarsProvider.propTypes = {
        /**
     * The component tree.
     */ children: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].node,
        /**
     * The node used to attach the color-scheme attribute
     */ colorSchemeNode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].any,
        /**
     * localStorage key used to store `colorScheme`
     */ colorSchemeStorageKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string,
        /**
     * The default mode when the storage is empty,
     * require the theme to have `colorSchemes` with light and dark.
     */ defaultMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string,
        /**
     * If `true`, the provider creates its own context and generate stylesheet as if it is a root `CssVarsProvider`.
     */ disableNestedContext: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].bool,
        /**
     * If `true`, the style sheet won't be generated.
     *
     * This is useful for controlling nested CssVarsProvider behavior.
     */ disableStyleSheetGeneration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].bool,
        /**
     * Disable CSS transitions when switching between modes or color schemes.
     */ disableTransitionOnChange: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].bool,
        /**
     * The document to attach the attribute to.
     */ documentNode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].any,
        /**
     * If `true`, theme values are recalculated when the mode changes.
     */ forceThemeRerender: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].bool,
        /**
     * The key in the local storage used to store current color scheme.
     */ modeStorageKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].string,
        /**
     * If `true`, the mode will be the same value as the storage without an extra rerendering after the hydration.
     * You should use this option in conjunction with `InitColorSchemeScript` component.
     */ noSsr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].bool,
        /**
     * The storage manager to be used for storing the mode and color scheme
     * @default using `window.localStorage`
     */ storageManager: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].func,
        /**
     * The window that attaches the 'storage' event listener.
     * @default window
     */ storageWindow: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].any,
        /**
     * The calculated theme object that will be passed through context.
     */ theme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prop$2d$types$40$15$2e$8$2e$1$2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].object
    } : "TURBOPACK unreachable";
    const defaultLightColorScheme = typeof defaultColorScheme === 'string' ? defaultColorScheme : defaultColorScheme.light;
    const defaultDarkColorScheme = typeof defaultColorScheme === 'string' ? defaultColorScheme : defaultColorScheme.dark;
    const getInitColorSchemeScript = (params)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildInitColorSchemeScript"])({
            colorSchemeStorageKey: defaultColorSchemeStorageKey,
            defaultLightColorScheme,
            defaultDarkColorScheme,
            modeStorageKey: defaultModeStorageKey,
            ...params
        });
    return {
        CssVarsProvider,
        useColorScheme,
        getInitColorSchemeScript
    };
}
}),
"[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createCssVarsProvider.mjs [app-ssr] (ecmascript) <export default as unstable_createCssVarsProvider>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unstable_createCssVarsProvider",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createCssVarsProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createCssVarsProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createCssVarsProvider.mjs [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=031._%40mui_system_00dqa4f._.js.map