module.exports = [
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createPalette.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "contrastColor",
    ()=>contrastColor,
    "dark",
    ()=>dark,
    "default",
    ()=>createPalette,
    "light",
    ()=>light
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/colorManipulator/colorManipulator.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$common$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/common.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$grey$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/grey.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$purple$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/purple.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$red$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/red.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$orange$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/orange.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$blue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/blue.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$lightBlue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/lightBlue.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$green$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/colors/green.mjs [app-ssr] (ecmascript)");
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
function getLight() {
    return {
        // The colors used to style the text.
        text: {
            // The most important text.
            primary: 'rgba(0, 0, 0, 0.87)',
            // Secondary text.
            secondary: 'rgba(0, 0, 0, 0.6)',
            // Disabled text have even lower visual prominence.
            disabled: 'rgba(0, 0, 0, 0.38)'
        },
        // The color used to divide different elements.
        divider: 'rgba(0, 0, 0, 0.12)',
        // The background colors used to style the surfaces.
        // Consistency between these values is important.
        background: {
            paper: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$common$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].white,
            default: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$common$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].white
        },
        // The colors used to style the action elements.
        action: {
            // The color of an active action like an icon button.
            active: 'rgba(0, 0, 0, 0.54)',
            // The color of an hovered action.
            hover: 'rgba(0, 0, 0, 0.04)',
            hoverOpacity: 0.04,
            // The color of a selected action.
            selected: 'rgba(0, 0, 0, 0.08)',
            selectedOpacity: 0.08,
            // The color of a disabled action.
            disabled: 'rgba(0, 0, 0, 0.26)',
            // The background color of a disabled action.
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
            disabledOpacity: 0.38,
            focus: 'rgba(0, 0, 0, 0.12)',
            focusOpacity: 0.12,
            activatedOpacity: 0.12
        }
    };
}
const light = getLight();
function getDark() {
    return {
        text: {
            primary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$common$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].white,
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
            icon: 'rgba(255, 255, 255, 0.5)'
        },
        divider: 'rgba(255, 255, 255, 0.12)',
        background: {
            paper: '#121212',
            default: '#121212'
        },
        action: {
            active: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$common$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].white,
            hover: 'rgba(255, 255, 255, 0.08)',
            hoverOpacity: 0.08,
            selected: 'rgba(255, 255, 255, 0.16)',
            selectedOpacity: 0.16,
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
            disabledOpacity: 0.38,
            focus: 'rgba(255, 255, 255, 0.12)',
            focusOpacity: 0.12,
            activatedOpacity: 0.24
        }
    };
}
const dark = getDark();
function addLightOrDark(intent, direction, shade, tonalOffset) {
    const tonalOffsetLight = tonalOffset.light || tonalOffset;
    const tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;
    if (!intent[direction]) {
        if (intent.hasOwnProperty(shade)) {
            intent[direction] = intent[shade];
        } else if (direction === 'light') {
            intent.light = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lighten"])(intent.main, tonalOffsetLight);
        } else if (direction === 'dark') {
            intent.dark = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["darken"])(intent.main, tonalOffsetDark);
        }
    }
}
function mixLightOrDark(colorSpace, intent, direction, shade, tonalOffset) {
    const tonalOffsetLight = tonalOffset.light || tonalOffset;
    const tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;
    if (!intent[direction]) {
        if (intent.hasOwnProperty(shade)) {
            intent[direction] = intent[shade];
        } else if (direction === 'light') {
            intent.light = `color-mix(in ${colorSpace}, ${intent.main}, #fff ${(tonalOffsetLight * 100).toFixed(0)}%)`;
        } else if (direction === 'dark') {
            intent.dark = `color-mix(in ${colorSpace}, ${intent.main}, #000 ${(tonalOffsetDark * 100).toFixed(0)}%)`;
        }
    }
}
function getDefaultPrimary(mode = 'light') {
    if (mode === 'dark') {
        return {
            main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$blue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][200],
            light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$blue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][50],
            dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$blue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][400]
        };
    }
    return {
        main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$blue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700],
        light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$blue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][400],
        dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$blue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][800]
    };
}
function getDefaultSecondary(mode = 'light') {
    if (mode === 'dark') {
        return {
            main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$purple$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][200],
            light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$purple$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][50],
            dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$purple$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][400]
        };
    }
    return {
        main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$purple$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][500],
        light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$purple$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][300],
        dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$purple$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700]
    };
}
function getDefaultError(mode = 'light') {
    if (mode === 'dark') {
        return {
            main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$red$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][500],
            light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$red$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][300],
            dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$red$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700]
        };
    }
    return {
        main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$red$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700],
        light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$red$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][400],
        dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$red$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][800]
    };
}
function getDefaultInfo(mode = 'light') {
    if (mode === 'dark') {
        return {
            main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$lightBlue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][400],
            light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$lightBlue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][300],
            dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$lightBlue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700]
        };
    }
    return {
        main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$lightBlue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700],
        light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$lightBlue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][500],
        dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$lightBlue$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][900]
    };
}
function getDefaultSuccess(mode = 'light') {
    if (mode === 'dark') {
        return {
            main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$green$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][400],
            light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$green$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][300],
            dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$green$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700]
        };
    }
    return {
        main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$green$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][800],
        light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$green$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][500],
        dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$green$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][900]
    };
}
function getDefaultWarning(mode = 'light') {
    if (mode === 'dark') {
        return {
            main: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$orange$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][400],
            light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$orange$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][300],
            dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$orange$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][700]
        };
    }
    return {
        main: '#ed6c02',
        // closest to orange[800] that pass 3:1.
        light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$orange$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][500],
        dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$orange$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][900]
    };
}
function contrastColor(background) {
    return `oklch(from ${background} var(--__l) 0 h / var(--__a))`;
}
function createPalette(palette) {
    const { mode = 'light', contrastThreshold = 3, tonalOffset = 0.2, colorSpace, ...other } = palette;
    const primary = palette.primary || getDefaultPrimary(mode);
    const secondary = palette.secondary || getDefaultSecondary(mode);
    const error = palette.error || getDefaultError(mode);
    const info = palette.info || getDefaultInfo(mode);
    const success = palette.success || getDefaultSuccess(mode);
    const warning = palette.warning || getDefaultWarning(mode);
    // Use the same logic as
    // Bootstrap: https://github.com/twbs/bootstrap/blob/1d6e3710dd447de1a200f29e8fa521f8a0908f70/scss/_functions.scss#L59
    // and material-components-web https://github.com/material-components/material-components-web/blob/ac46b8863c4dab9fc22c4c662dc6bd1b65dd652f/packages/mdc-theme/_functions.scss#L54
    function getContrastText(background) {
        if (colorSpace) {
            return contrastColor(background);
        }
        const contrastText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getContrastRatio"])(background, dark.text.primary) >= contrastThreshold ? dark.text.primary : light.text.primary;
        if ("TURBOPACK compile-time truthy", 1) {
            const contrast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getContrastRatio"])(background, contrastText);
            if (contrast < 3) {
                console.error([
                    `MUI: The contrast ratio of ${contrast}:1 for ${contrastText} on ${background}`,
                    'falls below the WCAG recommended absolute minimum contrast ratio of 3:1.',
                    'https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast'
                ].join('\n'));
            }
        }
        return contrastText;
    }
    const augmentColor = ({ color, name, mainShade = 500, lightShade = 300, darkShade = 700 })=>{
        color = {
            ...color
        };
        if (!color.main && color[mainShade]) {
            color.main = color[mainShade];
        }
        if (!color.hasOwnProperty('main')) {
            throw new Error(("TURBOPACK compile-time truthy", 1) ? `MUI: The color${name ? ` (${name})` : ''} provided to augmentColor(color) is invalid.\n` + `The color object needs to have a \`main\` property or a \`${mainShade}\` property.` : "TURBOPACK unreachable");
        }
        if (typeof color.main !== 'string') {
            throw new Error(("TURBOPACK compile-time truthy", 1) ? `MUI: The color${name ? ` (${name})` : ''} provided to augmentColor(color) is invalid.\n` + `\`color.main\` should be a string, but \`${JSON.stringify(color.main)}\` was provided instead.\n` + '\n' + 'Did you intend to use one of the following approaches?\n' + '\n' + 'import { green } from "@mui/material/colors";\n' + '\n' + 'const theme1 = createTheme({ palette: {\n' + '  primary: green,\n' + '} });\n' + '\n' + 'const theme2 = createTheme({ palette: {\n' + '  primary: { main: green[500] },\n' + '} });' : "TURBOPACK unreachable");
        }
        if (colorSpace) {
            mixLightOrDark(colorSpace, color, 'light', lightShade, tonalOffset);
            mixLightOrDark(colorSpace, color, 'dark', darkShade, tonalOffset);
        } else {
            addLightOrDark(color, 'light', lightShade, tonalOffset);
            addLightOrDark(color, 'dark', darkShade, tonalOffset);
        }
        if (!color.contrastText) {
            color.contrastText = getContrastText(color.main);
        }
        return color;
    };
    let modeHydrated;
    if (mode === 'light') {
        modeHydrated = getLight();
    } else if (mode === 'dark') {
        modeHydrated = getDark();
    }
    if ("TURBOPACK compile-time truthy", 1) {
        if (!modeHydrated) {
            console.error(`MUI: The palette mode \`${mode}\` is not supported.`);
        }
    }
    const paletteOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        // A collection of common colors.
        common: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$common$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        },
        // prevent mutable object.
        // The palette mode, can be light or dark.
        mode,
        // The colors used to represent primary interface elements for a user.
        primary: augmentColor({
            color: primary,
            name: 'primary'
        }),
        // The colors used to represent secondary interface elements for a user.
        secondary: augmentColor({
            color: secondary,
            name: 'secondary',
            mainShade: 'A400',
            lightShade: 'A200',
            darkShade: 'A700'
        }),
        // The colors used to represent interface elements that the user should be made aware of.
        error: augmentColor({
            color: error,
            name: 'error'
        }),
        // The colors used to represent potentially dangerous actions or important messages.
        warning: augmentColor({
            color: warning,
            name: 'warning'
        }),
        // The colors used to present information to the user that is neutral and not necessarily important.
        info: augmentColor({
            color: info,
            name: 'info'
        }),
        // The colors used to indicate the successful completion of an action that user triggered.
        success: augmentColor({
            color: success,
            name: 'success'
        }),
        // The grey colors.
        grey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$colors$2f$grey$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
        // Used by `getContrastText()` to maximize the contrast between
        // the background and the text.
        contrastThreshold,
        // Takes a background color and returns the text color that maximizes the contrast.
        getContrastText,
        // Generate a rich color object.
        augmentColor,
        // Used by the functions below to shift a color's luminance by approximately
        // two indexes within its tonal palette.
        // E.g., shift from Red 500 to Red 300 or Red 700.
        tonalOffset,
        // The light and dark mode object.
        ...modeHydrated
    }, other);
    return paletteOutput;
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/focusVisible.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyChildrenFocusVisible",
    ()=>applyChildrenFocusVisible,
    "applyInsetFocusVisible",
    ()=>applyInsetFocusVisible,
    "isResolvedFocusVisible",
    ()=>isResolvedFocusVisible,
    "mergeFocusVisibleInput",
    ()=>mergeFocusVisibleInput,
    "outsetFocusRing",
    ()=>outsetFocusRing,
    "resolveFocusVisible",
    ()=>resolveFocusVisible,
    "wireFocusVisibleVars",
    ()=>wireFocusVisibleVars
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
;
const focusVisibleOffsetVar = '--_focusVisible-offset';
const focusVisibleBehaviorVar = '--_focusVisible-behavior';
const focusVisibleShadowVar = '--_focusVisible-shadow';
const offsetValue = `var(${focusVisibleOffsetVar}, 1)`;
const behaviorValue = `var(${focusVisibleBehaviorVar}, )`;
const outsetFocusRing = {
    [focusVisibleOffsetVar]: 1,
    [focusVisibleBehaviorVar]: 'initial' // reverts the var to guaranteed-invalid so `var(--_focusVisible-behavior, )` falls back to empty — there is no explicit `outset` keyword.
};
function applyChildrenFocusVisible(color) {
    return {
        [focusVisibleShadowVar]: color
    };
}
function applyInsetFocusVisible(offset) {
    return {
        [focusVisibleOffsetVar]: -offset,
        [focusVisibleBehaviorVar]: 'inset'
    };
}
function mergeFocusVisibleInput(optionsFocusVisible, args) {
    return args.reduce((acc, arg)=>arg && 'focusVisible' in arg ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(acc, {
            focusVisible: arg.focusVisible
        }) : acc, {
        focusVisible: optionsFocusVisible
    }).focusVisible;
}
function isResolvedFocusVisible(input) {
    return input != null && typeof input === 'object' && typeof input.outlineOffset === 'string' && input.outlineOffset.includes(focusVisibleOffsetVar);
}
function resolveFocusVisible(input, outlineColor) {
    return wireFocusVisibleVars({
        outlineStyle: 'solid',
        outlineColor,
        outlineWidth: 2,
        outlineOffset: 2,
        // invisible shadow for parent component with solid background (AppBar, Snackbar, Alert) can control the ring color.
        boxShadow: `var(${focusVisibleShadowVar}, 0 0)`,
        ...input === true ? null : input
    });
}
function wireFocusVisibleVars(resolved) {
    // Multiply the offset by the sign var so it flips to inset on clip-prone components. Skip if
    // already wired: re-composing a resolved theme must not wrap the calc twice and invert the sign.
    const offset = resolved.outlineOffset ?? 0;
    if (typeof offset !== 'string' || !offset.includes(focusVisibleOffsetVar)) {
        const offsetPx = typeof offset === 'number' ? `${offset}px` : offset;
        resolved.outlineOffset = `calc(${offsetValue} * ${offsetPx})`;
    }
    // Prefix a box-shadow with the behavior var so it insets there too, unless it already opts in.
    // Standalone keywords are complete values — prefixing would produce an invalid `inset none`.
    const standaloneBoxShadows = new Set([
        'none',
        'initial',
        'inherit',
        'unset',
        'revert',
        'revert-layer'
    ]);
    if (typeof resolved.boxShadow === 'string' && !standaloneBoxShadows.has(resolved.boxShadow.trim().toLowerCase()) && !/\binset\b/.test(resolved.boxShadow) && !resolved.boxShadow.includes(focusVisibleBehaviorVar)) {
        resolved.boxShadow = `${behaviorValue} ${resolved.boxShadow}`;
    }
    return resolved;
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createMixins.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createMixins
]);
function createMixins(breakpoints, mixins) {
    return {
        toolbar: {
            minHeight: 56,
            [breakpoints.up('xs')]: {
                '@media (orientation: landscape)': {
                    minHeight: 48
                }
            },
            [breakpoints.up('sm')]: {
                minHeight: 64
            }
        },
        ...mixins
    };
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTypography.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createTypography
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
;
function round(value) {
    return Math.round(value * 1e5) / 1e5;
}
const caseAllCaps = {
    textTransform: 'uppercase'
};
const defaultFontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
function createTypography(palette, typography) {
    const { fontFamily = defaultFontFamily, // The default font size of the Material Specification.
    fontSize = 14, // px
    fontWeightLight = 300, fontWeightRegular = 400, fontWeightMedium = 500, fontWeightBold = 700, // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize = 16, // Apply the CSS properties to all the variants.
    allVariants, pxToRem: pxToRem2, ...other } = typeof typography === 'function' ? typography(palette) : typography;
    if ("TURBOPACK compile-time truthy", 1) {
        if (typeof fontSize !== 'number') {
            console.error('MUI: `fontSize` is required to be a number.');
        }
        if (typeof htmlFontSize !== 'number') {
            console.error('MUI: `htmlFontSize` is required to be a number.');
        }
    }
    const coef = fontSize / 14;
    const pxToRem = pxToRem2 || ((size)=>`${size / htmlFontSize * coef}rem`);
    const buildVariant = (fontWeight, size, lineHeight, letterSpacing, casing)=>({
            fontFamily,
            fontWeight,
            fontSize: pxToRem(size),
            // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
            lineHeight,
            // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
            // across font-families can cause issues with the kerning.
            ...fontFamily === defaultFontFamily ? {
                letterSpacing: `${round(letterSpacing / size)}em`
            } : {},
            ...casing,
            ...allVariants
        });
    const variants = {
        h1: buildVariant(fontWeightLight, 96, 1.167, -1.5),
        h2: buildVariant(fontWeightLight, 60, 1.2, -0.5),
        h3: buildVariant(fontWeightRegular, 48, 1.167, 0),
        h4: buildVariant(fontWeightRegular, 34, 1.235, 0.25),
        h5: buildVariant(fontWeightRegular, 24, 1.334, 0),
        h6: buildVariant(fontWeightMedium, 20, 1.6, 0.15),
        subtitle1: buildVariant(fontWeightRegular, 16, 1.75, 0.15),
        subtitle2: buildVariant(fontWeightMedium, 14, 1.57, 0.1),
        body1: buildVariant(fontWeightRegular, 16, 1.5, 0.15),
        body2: buildVariant(fontWeightRegular, 14, 1.43, 0.15),
        button: buildVariant(fontWeightMedium, 14, 1.75, 0.4, caseAllCaps),
        caption: buildVariant(fontWeightRegular, 12, 1.66, 0.4),
        overline: buildVariant(fontWeightRegular, 12, 2.66, 1, caseAllCaps),
        // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
        inherit: {
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            letterSpacing: 'inherit'
        }
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        htmlFontSize,
        pxToRem,
        fontFamily,
        fontSize,
        fontWeightLight,
        fontWeightRegular,
        fontWeightMedium,
        fontWeightBold,
        ...variants
    }, other, {
        clone: false // No need to clone deep
    });
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/shadows.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const shadowKeyUmbraOpacity = 0.2;
const shadowKeyPenumbraOpacity = 0.14;
const shadowAmbientShadowOpacity = 0.12;
function createShadow(...px) {
    return [
        `${px[0]}px ${px[1]}px ${px[2]}px ${px[3]}px rgba(0,0,0,${shadowKeyUmbraOpacity})`,
        `${px[4]}px ${px[5]}px ${px[6]}px ${px[7]}px rgba(0,0,0,${shadowKeyPenumbraOpacity})`,
        `${px[8]}px ${px[9]}px ${px[10]}px ${px[11]}px rgba(0,0,0,${shadowAmbientShadowOpacity})`
    ].join(',');
}
// Values from https://github.com/material-components/material-components-web/blob/be8747f94574669cb5e7add1a7c54fa41a89cec7/packages/mdc-elevation/_variables.scss
const shadows = [
    'none',
    createShadow(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0),
    createShadow(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0),
    createShadow(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0),
    createShadow(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0),
    createShadow(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0),
    createShadow(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0),
    createShadow(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1),
    createShadow(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2),
    createShadow(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2),
    createShadow(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3),
    createShadow(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3),
    createShadow(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4),
    createShadow(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4),
    createShadow(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4),
    createShadow(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5),
    createShadow(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5),
    createShadow(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5),
    createShadow(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6),
    createShadow(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6),
    createShadow(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7),
    createShadow(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7),
    createShadow(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7),
    createShadow(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8),
    createShadow(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)
];
const __TURBOPACK__default__export__ = shadows;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTransitions.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createTransitions,
    "duration",
    ()=>duration,
    "easing",
    ()=>easing
]);
const DEFAULT_TRANSITION_PROPS = [
    'all'
];
const EMPTY_OPTIONS = {};
const easing = {
    // This is the most common easing curve.
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Objects enter the screen at full velocity from off-screen and
    // slowly decelerate to a resting point.
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    // Objects leave the screen at full velocity. They do not decelerate when off-screen.
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    // The sharp curve is used by objects that may return to the screen at any time.
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
};
const duration = {
    shortest: 150,
    shorter: 200,
    short: 250,
    // most basic recommended timing
    standard: 300,
    // this is to be used in complex animations
    complex: 375,
    // recommended when something is entering screen
    enteringScreen: 225,
    // recommended when something is leaving screen
    leavingScreen: 195
};
function formatMs(milliseconds) {
    return `${Math.round(milliseconds)}ms`;
}
function getAutoHeightDuration(height) {
    if (!height) {
        return 0;
    }
    const constant = height / 36;
    // https://www.desmos.com/calculator/vbrp3ggqet
    return Math.min(Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10), 3000);
}
function createTransitions(inputTransitions) {
    const transitions = {
        ...inputTransitions
    };
    delete transitions.reducedMotion;
    const mergedEasing = {
        ...easing,
        ...transitions.easing
    };
    const mergedDuration = {
        ...duration,
        ...transitions.duration
    };
    const createTransitionValue = (props = DEFAULT_TRANSITION_PROPS, options = EMPTY_OPTIONS)=>{
        const { duration: durationOption = mergedDuration.standard, easing: easingOption = mergedEasing.easeInOut, delay = 0, ...other } = options;
        if ("TURBOPACK compile-time truthy", 1) {
            const isString = (value)=>typeof value === 'string';
            const isNumber = (value)=>!Number.isNaN(parseFloat(value));
            if (!isString(props) && !Array.isArray(props)) {
                console.error('MUI: Argument "props" must be a string or Array.');
            }
            if (!isNumber(durationOption) && !isString(durationOption)) {
                console.error(`MUI: Argument "duration" must be a number or a string but found ${durationOption}.`);
            }
            if (!isString(easingOption)) {
                console.error('MUI: Argument "easing" must be a string.');
            }
            if (!isNumber(delay) && !isString(delay)) {
                console.error('MUI: Argument "delay" must be a number or a string.');
            }
            if (typeof options !== 'object') {
                console.error([
                    'MUI: Secong argument of transition.create must be an object.',
                    "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"
                ].join('\n'));
            }
            if (Object.keys(other).length !== 0) {
                console.error(`MUI: Unrecognized argument(s) [${Object.keys(other).join(',')}].`);
            }
        }
        return (Array.isArray(props) ? props : [
            props
        ]).map((animatedProp)=>`${animatedProp} ${typeof durationOption === 'string' ? durationOption : formatMs(durationOption)} ${easingOption} ${typeof delay === 'string' ? delay : formatMs(delay)}`).join(',');
    };
    const create = transitions.create ?? createTransitionValue;
    return {
        getAutoHeightDuration,
        create,
        ...transitions,
        easing: mergedEasing,
        duration: mergedDuration
    };
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createMotion.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createMotion
]);
const EMPTY_MOTION = {};
function createMotion(inputMotion = EMPTY_MOTION) {
    return {
        reducedMotion: 'never',
        ...inputMotion
    };
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/zIndex.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// We need to centralize the zIndex definitions as they work
// like global values in the browser.
const zIndex = {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
};
const __TURBOPACK__default__export__ = zIndex;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/stringifyTheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stringifyTheme",
    ()=>stringifyTheme
]);
/* eslint-disable import/prefer-default-export */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
;
function isSerializable(val) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPlainObject"])(val) || typeof val === 'undefined' || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number' || Array.isArray(val);
}
function stringifyTheme(baseTheme = {}) {
    const serializableTheme = {
        ...baseTheme
    };
    function serializeTheme(object) {
        const array = Object.entries(object);
        // eslint-disable-next-line no-plusplus
        for(let index = 0; index < array.length; index++){
            const [key, value] = array[index];
            if (!isSerializable(value) || key.startsWith('unstable_') || key.startsWith('internal_')) {
                delete object[key];
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPlainObject"])(value)) {
                object[key] = {
                    ...value
                };
                serializeTheme(object[key]);
            }
        }
    }
    serializeTheme(serializableTheme);
    return `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(serializableTheme, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.motion = { reducedMotion: 'never', ...theme.motion };
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createThemeNoVars.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/styleFunctionSx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_defaultSxConfig$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript) <export default as unstable_defaultSxConfig>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/colorManipulator/colorManipulator.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$generateUtilityClass$2f$generateUtilityClass$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/generateUtilityClass/generateUtilityClass.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createMixins$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createMixins.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createPalette.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTypography$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTypography.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$shadows$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/shadows.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTransitions$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTransitions.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createMotion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createMotion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$zIndex$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/zIndex.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$stringifyTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/stringifyTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/focusVisible.mjs [app-ssr] (ecmascript)");
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
function coefficientToPercentage(coefficient) {
    if (typeof coefficient === 'number') {
        return `${(coefficient * 100).toFixed(0)}%`;
    }
    return `calc((${coefficient}) * 100%)`;
}
// This can be removed when moved to `color-mix()` entirely.
const parseAddition = (str)=>{
    if (!Number.isNaN(+str)) {
        return +str;
    }
    const numbers = str.match(/\d*\.?\d+/g);
    if (!numbers) {
        return 0;
    }
    let sum = 0;
    for(let i = 0; i < numbers.length; i += 1){
        sum += +numbers[i];
    }
    return sum;
};
// `rgba()` takes rgb channels, so `hsl()` is converted like the theme's `*Channel` tokens.
function toRgb(color) {
    return color.startsWith('hsl') ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hslToRgb"])(color) : color;
}
// Replaces the `var()` matches in `alpha()`: `var(--x, #1976d2)` -> `var(--xChannel, 25 118 210)`.
// The fallback keeps the color valid when the CSS variables aren't defined (no `ThemeProvider`).
// It's dropped when it isn't a color `colorChannel()` parses, for example `currentColor` or a nested `var()`,
// or when it's a `color()`, whose channels aren't sRGB.
// More than one level of nested parentheses isn't supported: the match ends at the first run of `)`,
// so the rest of the fallback stays in the output.
function toChannelVar(match, name, fallback = '') {
    const color = fallback.trim();
    if (color && !color.startsWith('color(')) {
        try {
            const channel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colorChannel"])(toRgb(color));
            // Space-separated syntax like `rgb(0 0 0)` doesn't throw but gives a single value, or `NaN`s for `hsl()`.
            if (channel.split(' ').length === 3 && !channel.includes('NaN')) {
                return `var(--${name}Channel, ${channel})`;
            }
        } catch  {
        // Not a supported color.
        }
    }
    return `var(--${name}Channel)`;
}
function attachColorManipulators(theme) {
    Object.assign(theme, {
        alpha (color, coefficient) {
            const obj = this || theme;
            if (obj.colorSpace) {
                return `oklch(from ${color} l c h / ${typeof coefficient === 'string' ? `calc(${coefficient})` : coefficient})`;
            }
            if (obj.vars) {
                // To preserve the behavior of the CSS theme variables
                // In the future, this could be replaced by `color-mix` (when https://caniuse.com/?search=color-mix reaches 95%).
                // Raw colors (for example, `theme.palette.*`) have no channel tokens,
                // so they are converted to channels the same way the theme generates `*Channel` tokens,
                // which keeps a CSS coefficient (for example, `theme.vars.palette.action.hoverOpacity`) in `calc()`.
                const alphaValue = typeof coefficient === 'string' ? `calc(${coefficient})` : coefficient;
                // `color()` channels are not sRGB, so only the alpha is replaced to keep any color space and unit.
                if (color.startsWith('color(')) {
                    return color.replace(/\s*(?:\/[^)]*)?\)$/, ` / ${alphaValue})`);
                }
                const channels = color.includes('var(') ? color.replace(/var\(--([^,\s)]+)(?:,((?:[^()]|\([^()]*\))+)\)|(?:,[^)]+)?\)+)/g, toChannelVar) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeColorChannel"])(toRgb(color));
                return `rgba(${channels} / ${alphaValue})`;
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["alpha"])(color, parseAddition(coefficient));
        },
        lighten (color, coefficient) {
            const obj = this || theme;
            if (obj.colorSpace) {
                return `color-mix(in ${obj.colorSpace}, ${color}, #fff ${coefficientToPercentage(coefficient)})`;
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lighten"])(color, coefficient);
        },
        darken (color, coefficient) {
            const obj = this || theme;
            if (obj.colorSpace) {
                return `color-mix(in ${obj.colorSpace}, ${color}, #000 ${coefficientToPercentage(coefficient)})`;
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["darken"])(color, coefficient);
        }
    });
}
function createThemeNoVars(options = {}, ...args) {
    const { breakpoints: breakpointsInput, mixins: mixinsInput = {}, spacing: spacingInput, palette: paletteInput = {}, motion: motionInput = {}, transitions: transitionsInput = {}, typography: typographyInput = {}, shape: shapeInput, colorSpace, ...other } = options;
    if (options.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
    // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
    options.generateThemeVars === undefined) {
        throw new Error(("TURBOPACK compile-time truthy", 1) ? 'MUI: `vars` is a private field used for CSS variables support.\n' + // #host-reference
        'Please use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature.' : "TURBOPACK unreachable");
    }
    const palette = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        ...paletteInput,
        colorSpace
    });
    const systemTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(options);
    let muiTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(systemTheme, {
        mixins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createMixins$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(systemTheme.breakpoints, mixinsInput),
        palette,
        // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
        shadows: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$shadows$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].slice(),
        typography: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTypography$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(palette, typographyInput),
        motion: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createMotion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(motionInput),
        transitions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTransitions$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(transitionsInput),
        zIndex: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$zIndex$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        }
    });
    muiTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(muiTheme, other);
    muiTheme = args.reduce((acc, argument)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(acc, argument), muiTheme);
    // `reducedMotion` is owned by `theme.motion`; remove stale values preserved by systemCreateTheme.
    delete muiTheme.transitions.reducedMotion;
    // Normalize once so components read a resolved object, never the boolean. The color is a hex off
    // this (default) scheme; `createTheme` attaches a per-scheme copy so dark mode stays reactive.
    // Read the palette off `muiTheme` — a merge argument may have recolored it after `palette` was built.
    if (muiTheme.focusVisible != null && muiTheme.focusVisible !== false) {
        muiTheme.focusVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveFocusVisible"])(muiTheme.focusVisible, muiTheme.palette.primary.main);
    }
    if ("TURBOPACK compile-time truthy", 1) {
        // TODO v6: Refactor to use globalStateClassesMapping from @mui/utils once `readOnly` state class is used in Rating component.
        const stateClasses = [
            'active',
            'checked',
            'completed',
            'disabled',
            'error',
            'expanded',
            'focused',
            'focusVisible',
            'required',
            'selected'
        ];
        const traverse = (node, component)=>{
            let key;
            // eslint-disable-next-line guard-for-in
            for(key in node){
                const child = node[key];
                if (stateClasses.includes(key) && Object.keys(child).length > 0) {
                    if ("TURBOPACK compile-time truthy", 1) {
                        const stateClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$generateUtilityClass$2f$generateUtilityClass$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('', key);
                        console.error([
                            `MUI: The \`${component}\` component increases ` + `the CSS specificity of the \`${key}\` internal state.`,
                            'You can not override it like this: ',
                            JSON.stringify(node, null, 2),
                            '',
                            `Instead, you need to use the '&.${stateClass}' syntax:`,
                            JSON.stringify({
                                root: {
                                    [`&.${stateClass}`]: child
                                }
                            }, null, 2),
                            '',
                            'https://mui.com/r/state-classes-guide'
                        ].join('\n'));
                    }
                    // Remove the style to prevent global conflicts.
                    node[key] = {};
                }
            }
        };
        Object.keys(muiTheme.components).forEach((component)=>{
            const styleOverrides = muiTheme.components[component].styleOverrides;
            if (styleOverrides && component.startsWith('Mui')) {
                traverse(styleOverrides, component);
            }
        });
    }
    muiTheme.unstable_sxConfig = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_defaultSxConfig$3e$__["unstable_defaultSxConfig"],
        ...other?.unstable_sxConfig
    };
    muiTheme.unstable_sx = function sx(props) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            sx: props,
            theme: this
        });
    };
    muiTheme.toRuntimeSource = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$stringifyTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringifyTheme"]; // for Pigment CSS integration
    attachColorManipulators(muiTheme);
    return muiTheme;
}
const __TURBOPACK__default__export__ = createThemeNoVars;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/getOverlayAlpha.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Inspired by https://github.com/material-components/material-components-ios/blob/bca36107405594d5b7b16265a5b0ed698f85a5ee/components/Elevation/src/UIColor%2BMaterialElevation.m#L61
__turbopack_context__.s([
    "default",
    ()=>getOverlayAlpha
]);
function getOverlayAlpha(elevation) {
    let alphaValue;
    if (elevation < 1) {
        alphaValue = 5.11916 * elevation ** 2;
    } else {
        alphaValue = 4.5 * Math.log(elevation + 1) + 2;
    }
    return Math.round(alphaValue * 10) / 1000;
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createColorScheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createColorScheme,
    "getOpacity",
    ()=>getOpacity,
    "getOverlays",
    ()=>getOverlays
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createPalette.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$getOverlayAlpha$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/getOverlayAlpha.mjs [app-ssr] (ecmascript)");
;
;
const defaultDarkOverlays = [
    ...Array(25)
].map((_, index)=>{
    if (index === 0) {
        return 'none';
    }
    const overlay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$getOverlayAlpha$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(index);
    return `linear-gradient(rgba(255 255 255 / ${overlay}), rgba(255 255 255 / ${overlay}))`;
});
function getOpacity(mode) {
    return {
        inputPlaceholder: mode === 'dark' ? 0.5 : 0.42,
        inputUnderline: mode === 'dark' ? 0.7 : 0.42,
        switchTrackDisabled: mode === 'dark' ? 0.2 : 0.12,
        switchTrack: mode === 'dark' ? 0.3 : 0.38
    };
}
function getOverlays(mode) {
    return mode === 'dark' ? defaultDarkOverlays : [];
}
function createColorScheme(options) {
    const { palette: paletteInput = {
        mode: 'light'
    }, // need to cast to avoid module augmentation test
    opacity, overlays, colorSpace, ...other } = options;
    // need to cast because `colorSpace` is considered internal at the moment.
    const palette = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        ...paletteInput,
        colorSpace
    });
    return {
        palette,
        opacity: {
            ...getOpacity(palette.mode),
            ...opacity
        },
        overlays: overlays || getOverlays(palette.mode),
        ...other
    };
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/shouldSkipGeneratingVar.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>shouldSkipGeneratingVar
]);
function shouldSkipGeneratingVar(keys) {
    return keys[0] === 'motion' || // Keep `focusVisible` inline: its values reference the per-component private vars
    // (`--_focusVisible-offset`/`-behavior`). Hoisted to a `:root` var they resolve where those
    // vars are unset, silently breaking the inner-ring inset.
    keys[0] === 'focusVisible' || !!keys[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!keys[0].match(/sxConfig$/) || // ends with sxConfig
    keys[0] === 'palette' && !!keys[1]?.match(/(mode|contrastThreshold|tonalOffset)/);
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/excludeVariablesFromRoot.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
/**
 * @internal These variables should not appear in the :root stylesheet when the `defaultColorScheme="dark"`
 */ const excludeVariablesFromRoot = (cssVarPrefix)=>[
        ...[
            ...Array(25)
        ].map((_, index)=>`--${cssVarPrefix ? `${cssVarPrefix}-` : ''}overlays-${index}`),
        `--${cssVarPrefix ? `${cssVarPrefix}-` : ''}palette-AppBar-darkBg`,
        `--${cssVarPrefix ? `${cssVarPrefix}-` : ''}palette-AppBar-darkColor`
    ];
const __TURBOPACK__default__export__ = excludeVariablesFromRoot;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createGetSelector.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$excludeVariablesFromRoot$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/excludeVariablesFromRoot.mjs [app-ssr] (ecmascript)");
;
const __TURBOPACK__default__export__ = (theme)=>(colorScheme, css)=>{
        const root = theme.rootSelector || ':root';
        const selector = theme.colorSchemeSelector;
        let rule = selector;
        if (selector === 'class') {
            rule = '.%s';
        }
        if (selector === 'data') {
            rule = '[data-%s]';
        }
        if (selector?.startsWith('data-') && !selector.includes('%s')) {
            // 'data-mui-color-scheme' -> '[data-mui-color-scheme="%s"]'
            rule = `[${selector}="%s"]`;
        }
        if (theme.defaultColorScheme === colorScheme) {
            if (colorScheme === 'dark') {
                const excludedVariables = {};
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$excludeVariablesFromRoot$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(theme.cssVarPrefix).forEach((cssVar)=>{
                    excludedVariables[cssVar] = css[cssVar];
                    delete css[cssVar];
                });
                if (rule === 'media') {
                    return {
                        [root]: css,
                        [`@media (prefers-color-scheme: dark)`]: {
                            [root]: excludedVariables
                        }
                    };
                }
                if (rule) {
                    return {
                        [rule.replace('%s', colorScheme)]: excludedVariables,
                        [`${root}, ${rule.replace('%s', colorScheme)}`]: css
                    };
                }
                return {
                    [root]: {
                        ...css,
                        ...excludedVariables
                    }
                };
            }
            if (rule && rule !== 'media') {
                return `${root}, ${rule.replace('%s', String(colorScheme))}`;
            }
        } else if (colorScheme) {
            if (rule === 'media') {
                return {
                    [`@media (prefers-color-scheme: ${String(colorScheme)})`]: {
                        [root]: css
                    }
                };
            }
            if (rule) {
                return rule.replace('%s', String(colorScheme));
            }
        }
        return root;
    };
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createThemeWithVars.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createGetCssVar",
    ()=>createGetCssVar,
    "default",
    ()=>createThemeWithVars
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+utils@9.5.0_@types+react@19.3.0_react@19.3.0/node_modules/@mui/utils/deepmerge/deepmerge.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createGetCssVar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_createGetCssVar$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createGetCssVar.mjs [app-ssr] (ecmascript) <export default as unstable_createGetCssVar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createSpacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createSpacing$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createTheme/createSpacing.mjs [app-ssr] (ecmascript) <export default as createSpacing>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/spacing/spacing.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareCssVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__prepareCssVars$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareCssVars.mjs [app-ssr] (ecmascript) <export default as prepareCssVars>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareTypographyVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__prepareTypographyVars$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/prepareTypographyVars.mjs [app-ssr] (ecmascript) <export default as prepareTypographyVars>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$getColorSchemeSelector$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/getColorSchemeSelector.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/styleFunctionSx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_defaultSxConfig$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/defaultSxConfig.mjs [app-ssr] (ecmascript) <export default as unstable_defaultSxConfig>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/colorManipulator/colorManipulator.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createThemeNoVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createThemeNoVars.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createColorScheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createColorScheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$shouldSkipGeneratingVar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/shouldSkipGeneratingVar.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createGetSelector$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createGetSelector.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$stringifyTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/stringifyTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createPalette.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/focusVisible.mjs [app-ssr] (ecmascript)");
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
function assignNode(obj, keys) {
    keys.forEach((k)=>{
        if (!obj[k]) {
            obj[k] = {};
        }
    });
}
function setColor(obj, key, defaultValue) {
    if (!obj[key] && defaultValue) {
        obj[key] = defaultValue;
    }
}
function toRgb(color) {
    if (typeof color !== 'string' || !color.startsWith('hsl')) {
        return color;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hslToRgb"])(color);
}
function setColorChannel(obj, key) {
    if (!(`${key}Channel` in obj)) {
        // custom channel token is not provided, generate one.
        // if channel token can't be generated, show a warning.
        obj[`${key}Channel`] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeColorChannel"])(toRgb(obj[key]), `MUI: Can't create \`palette.${key}Channel\` because \`palette.${key}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` + '\n' + `To suppress this warning, you need to explicitly provide the \`palette.${key}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`);
    }
}
function getSpacingVal(spacingInput) {
    if (typeof spacingInput === 'number') {
        return `${spacingInput}px`;
    }
    if (typeof spacingInput === 'string' || typeof spacingInput === 'function' || Array.isArray(spacingInput)) {
        return spacingInput;
    }
    return '8px';
}
const silent = (fn)=>{
    try {
        return fn();
    } catch (error) {
    // ignore error
    }
    return undefined;
};
const createGetCssVar = (cssVarPrefix = 'mui')=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createGetCssVar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_createGetCssVar$3e$__["unstable_createGetCssVar"])(cssVarPrefix);
function attachColorScheme(colorSpace, colorSchemes, scheme, restTheme, colorScheme) {
    if (!scheme) {
        return undefined;
    }
    scheme = scheme === true ? {} : scheme;
    const mode = colorScheme === 'dark' ? 'dark' : 'light';
    if (!restTheme) {
        colorSchemes[colorScheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createColorScheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            ...scheme,
            palette: {
                mode,
                ...scheme?.palette
            },
            colorSpace
        });
        return undefined;
    }
    const { palette, ...muiTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createThemeNoVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        ...restTheme,
        palette: {
            mode,
            ...scheme?.palette
        },
        colorSpace
    });
    colorSchemes[colorScheme] = {
        ...scheme,
        palette,
        opacity: {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createColorScheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOpacity"])(mode),
            ...scheme?.opacity
        },
        overlays: scheme?.overlays || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createColorScheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOverlays"])(mode)
    };
    return muiTheme;
}
function createThemeWithVars(options = {}, ...args) {
    const { colorSchemes: colorSchemesInput = {
        light: true
    }, defaultColorScheme: defaultColorSchemeInput, disableCssColorScheme = false, cssVarPrefix = 'mui', nativeColor = false, shouldSkipGeneratingVar = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$shouldSkipGeneratingVar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], colorSchemeSelector: selector = colorSchemesInput.light && colorSchemesInput.dark ? 'media' : undefined, rootSelector = ':root', ...input } = options;
    const firstColorScheme = Object.keys(colorSchemesInput)[0];
    const defaultColorScheme = defaultColorSchemeInput || (colorSchemesInput.light && firstColorScheme !== 'light' ? 'light' : firstColorScheme);
    const getCssVar = createGetCssVar(cssVarPrefix);
    const { [defaultColorScheme]: defaultSchemeInput, light: builtInLight, dark: builtInDark, ...customColorSchemes } = colorSchemesInput;
    const colorSchemes = {
        ...customColorSchemes
    };
    let defaultScheme = defaultSchemeInput;
    // For built-in light and dark color schemes, ensure that the value is valid if they are the default color scheme.
    if (defaultColorScheme === 'dark' && !('dark' in colorSchemesInput) || defaultColorScheme === 'light' && !('light' in colorSchemesInput)) {
        defaultScheme = true;
    }
    if (!defaultScheme) {
        throw new Error(("TURBOPACK compile-time truthy", 1) ? `MUI: The \`colorSchemes.${defaultColorScheme}\` option is either missing or invalid.` : "TURBOPACK unreachable");
    }
    // The reason to use `oklch` is that it is the most perceptually uniform color space and widely supported.
    let colorSpace;
    if (nativeColor) {
        colorSpace = 'oklch';
    }
    // Create the palette for the default color scheme, either `light`, `dark`, or custom color scheme.
    const muiTheme = attachColorScheme(colorSpace, colorSchemes, defaultScheme, input, defaultColorScheme);
    if (builtInLight && !colorSchemes.light) {
        attachColorScheme(colorSpace, colorSchemes, builtInLight, undefined, 'light');
    }
    if (builtInDark && !colorSchemes.dark) {
        attachColorScheme(colorSpace, colorSchemes, builtInDark, undefined, 'dark');
    }
    let theme = {
        defaultColorScheme,
        ...muiTheme,
        cssVarPrefix,
        colorSchemeSelector: selector,
        rootSelector,
        getCssVar,
        colorSchemes,
        font: {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareTypographyVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__prepareTypographyVars$3e$__["prepareTypographyVars"])(muiTheme.typography),
            ...muiTheme.font
        },
        spacing: getSpacingVal(input.spacing)
    };
    Object.keys(theme.colorSchemes).forEach((key)=>{
        const palette = theme.colorSchemes[key].palette;
        const setCssVarColor = (cssVar)=>{
            const tokens = cssVar.split('-');
            const color = tokens[1];
            const colorToken = tokens[2];
            return getCssVar(cssVar, palette[color][colorToken]);
        };
        // attach black & white channels to common node
        if (palette.mode === 'light') {
            setColor(palette.common, 'background', '#fff');
            setColor(palette.common, 'onBackground', '#000');
        }
        if (palette.mode === 'dark') {
            setColor(palette.common, 'background', '#000');
            setColor(palette.common, 'onBackground', '#fff');
        }
        // Generate `text.primaryChannel` before the component tokens:
        // `palette.Skeleton.bg` uses it as its CSS variable fallback.
        if (!nativeColor) {
            setColorChannel(palette.text, 'primary');
        }
        function colorMix(method, color, coefficient) {
            if (colorSpace) {
                let mixer;
                if (method === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeAlpha"]) {
                    mixer = `transparent ${((1 - coefficient) * 100).toFixed(0)}%`;
                }
                if (method === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"]) {
                    mixer = `#000 ${(coefficient * 100).toFixed(0)}%`;
                }
                if (method === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"]) {
                    mixer = `#fff ${(coefficient * 100).toFixed(0)}%`;
                }
                return `color-mix(in ${colorSpace}, ${color}, ${mixer})`;
            }
            return method(color, coefficient);
        }
        // assign component variables
        assignNode(palette, [
            'Alert',
            'AppBar',
            'Avatar',
            'Button',
            'Chip',
            'FilledInput',
            'Input',
            'LinearProgress',
            'Skeleton',
            'Slider',
            'SnackbarContent',
            'SpeedDialAction',
            'StepConnector',
            'StepContent',
            'Switch',
            'TableCell',
            'Tooltip'
        ]);
        if (palette.mode === 'light') {
            setColor(palette.Alert, 'errorColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-error-light') : palette.error.light, 0.6));
            setColor(palette.Alert, 'infoColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-info-light') : palette.info.light, 0.6));
            setColor(palette.Alert, 'successColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-success-light') : palette.success.light, 0.6));
            setColor(palette.Alert, 'warningColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-warning-light') : palette.warning.light, 0.6));
            setColor(palette.Alert, 'errorFilledBg', setCssVarColor('palette-error-main'));
            setColor(palette.Alert, 'infoFilledBg', setCssVarColor('palette-info-main'));
            setColor(palette.Alert, 'successFilledBg', setCssVarColor('palette-success-main'));
            setColor(palette.Alert, 'warningFilledBg', setCssVarColor('palette-warning-main'));
            setColor(palette.Alert, 'errorFilledColor', silent(()=>palette.getContrastText(palette.error.main)));
            setColor(palette.Alert, 'infoFilledColor', silent(()=>palette.getContrastText(palette.info.main)));
            setColor(palette.Alert, 'successFilledColor', silent(()=>palette.getContrastText(palette.success.main)));
            setColor(palette.Alert, 'warningFilledColor', silent(()=>palette.getContrastText(palette.warning.main)));
            setColor(palette.Alert, 'errorStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-error-light') : palette.error.light, 0.9));
            setColor(palette.Alert, 'infoStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-info-light') : palette.info.light, 0.9));
            setColor(palette.Alert, 'successStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-success-light') : palette.success.light, 0.9));
            setColor(palette.Alert, 'warningStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-warning-light') : palette.warning.light, 0.9));
            setColor(palette.Alert, 'errorIconColor', setCssVarColor('palette-error-main'));
            setColor(palette.Alert, 'infoIconColor', setCssVarColor('palette-info-main'));
            setColor(palette.Alert, 'successIconColor', setCssVarColor('palette-success-main'));
            setColor(palette.Alert, 'warningIconColor', setCssVarColor('palette-warning-main'));
            setColor(palette.AppBar, 'defaultBg', setCssVarColor('palette-grey-100'));
            setColor(palette.Avatar, 'defaultBg', setCssVarColor('palette-grey-400'));
            setColor(palette.Button, 'inheritContainedBg', setCssVarColor('palette-grey-300'));
            setColor(palette.Button, 'inheritContainedHoverBg', setCssVarColor('palette-grey-A100'));
            setColor(palette.Chip, 'defaultBorder', setCssVarColor('palette-grey-400'));
            setColor(palette.Chip, 'defaultAvatarColor', setCssVarColor('palette-grey-700'));
            setColor(palette.Chip, 'defaultIconColor', setCssVarColor('palette-grey-700'));
            setColor(palette.FilledInput, 'bg', 'rgba(0, 0, 0, 0.06)');
            setColor(palette.FilledInput, 'hoverBg', 'rgba(0, 0, 0, 0.09)');
            setColor(palette.FilledInput, 'disabledBg', 'rgba(0, 0, 0, 0.12)');
            setColor(palette.Input, 'autofillWebkitBoxShadow', 'none');
            setColor(palette.LinearProgress, 'primaryBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-primary-main') : palette.primary.main, 0.62));
            setColor(palette.LinearProgress, 'secondaryBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-secondary-main') : palette.secondary.main, 0.62));
            setColor(palette.LinearProgress, 'errorBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-error-main') : palette.error.main, 0.62));
            setColor(palette.LinearProgress, 'infoBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-info-main') : palette.info.main, 0.62));
            setColor(palette.LinearProgress, 'successBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-success-main') : palette.success.main, 0.62));
            setColor(palette.LinearProgress, 'warningBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-warning-light') : palette.warning.main, 0.62));
            setColor(palette.Skeleton, 'bg', colorSpace ? colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeAlpha"], nativeColor ? getCssVar('palette-text-primary') : palette.text.primary, 0.11) : `rgba(${setCssVarColor('palette-text-primaryChannel')} / 0.11)`);
            setColor(palette.Slider, 'primaryTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-primary-main') : palette.primary.main, 0.62));
            setColor(palette.Slider, 'secondaryTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-secondary-main') : palette.secondary.main, 0.62));
            setColor(palette.Slider, 'errorTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-error-main') : palette.error.main, 0.62));
            setColor(palette.Slider, 'infoTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-info-main') : palette.info.main, 0.62));
            setColor(palette.Slider, 'successTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-success-main') : palette.success.main, 0.62));
            setColor(palette.Slider, 'warningTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-warning-main') : palette.warning.main, 0.62));
            const snackbarContentBackground = colorSpace ? colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-background-default') : palette.background.default, 0.6825) // use `0.6825` instead of `0.8` to match the contrast ratio of JS implementation
             : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeEmphasize"])(palette.background.default, 0.8);
            setColor(palette.SnackbarContent, 'bg', snackbarContentBackground);
            setColor(palette.SnackbarContent, 'color', silent(()=>colorSpace ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dark"].text.primary : palette.getContrastText(snackbarContentBackground)));
            setColor(palette.SpeedDialAction, 'fabHoverBg', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeEmphasize"])(palette.background.paper, 0.15));
            setColor(palette.StepConnector, 'border', setCssVarColor('palette-grey-400'));
            setColor(palette.StepContent, 'border', setCssVarColor('palette-grey-400'));
            setColor(palette.Switch, 'defaultColor', setCssVarColor('palette-common-white'));
            setColor(palette.Switch, 'defaultDisabledColor', setCssVarColor('palette-grey-100'));
            setColor(palette.Switch, 'primaryDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-primary-main') : palette.primary.main, 0.62));
            setColor(palette.Switch, 'secondaryDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-secondary-main') : palette.secondary.main, 0.62));
            setColor(palette.Switch, 'errorDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-error-main') : palette.error.main, 0.62));
            setColor(palette.Switch, 'infoDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-info-main') : palette.info.main, 0.62));
            setColor(palette.Switch, 'successDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-success-main') : palette.success.main, 0.62));
            setColor(palette.Switch, 'warningDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-warning-main') : palette.warning.main, 0.62));
            setColor(palette.TableCell, 'border', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeAlpha"])(nativeColor ? getCssVar('palette-divider') : palette.divider, 1), 0.88));
            setColor(palette.Tooltip, 'bg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeAlpha"], nativeColor ? getCssVar('palette-grey-700') : palette.grey[700], 0.92));
        }
        if (palette.mode === 'dark') {
            setColor(palette.Alert, 'errorColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-error-light') : palette.error.light, 0.6));
            setColor(palette.Alert, 'infoColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-info-light') : palette.info.light, 0.6));
            setColor(palette.Alert, 'successColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-success-light') : palette.success.light, 0.6));
            setColor(palette.Alert, 'warningColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-warning-light') : palette.warning.light, 0.6));
            setColor(palette.Alert, 'errorFilledBg', setCssVarColor('palette-error-dark'));
            setColor(palette.Alert, 'infoFilledBg', setCssVarColor('palette-info-dark'));
            setColor(palette.Alert, 'successFilledBg', setCssVarColor('palette-success-dark'));
            setColor(palette.Alert, 'warningFilledBg', setCssVarColor('palette-warning-dark'));
            setColor(palette.Alert, 'errorFilledColor', silent(()=>palette.getContrastText(palette.error.dark)));
            setColor(palette.Alert, 'infoFilledColor', silent(()=>palette.getContrastText(palette.info.dark)));
            setColor(palette.Alert, 'successFilledColor', silent(()=>palette.getContrastText(palette.success.dark)));
            setColor(palette.Alert, 'warningFilledColor', silent(()=>palette.getContrastText(palette.warning.dark)));
            setColor(palette.Alert, 'errorStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-error-light') : palette.error.light, 0.9));
            setColor(palette.Alert, 'infoStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-info-light') : palette.info.light, 0.9));
            setColor(palette.Alert, 'successStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-success-light') : palette.success.light, 0.9));
            setColor(palette.Alert, 'warningStandardBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-warning-light') : palette.warning.light, 0.9));
            setColor(palette.Alert, 'errorIconColor', setCssVarColor('palette-error-main'));
            setColor(palette.Alert, 'infoIconColor', setCssVarColor('palette-info-main'));
            setColor(palette.Alert, 'successIconColor', setCssVarColor('palette-success-main'));
            setColor(palette.Alert, 'warningIconColor', setCssVarColor('palette-warning-main'));
            setColor(palette.AppBar, 'defaultBg', setCssVarColor('palette-grey-900'));
            setColor(palette.AppBar, 'darkBg', setCssVarColor('palette-background-paper')); // specific for dark mode
            setColor(palette.AppBar, 'darkColor', setCssVarColor('palette-text-primary')); // specific for dark mode
            setColor(palette.Avatar, 'defaultBg', setCssVarColor('palette-grey-600'));
            setColor(palette.Button, 'inheritContainedBg', setCssVarColor('palette-grey-800'));
            setColor(palette.Button, 'inheritContainedHoverBg', setCssVarColor('palette-grey-700'));
            setColor(palette.Chip, 'defaultBorder', setCssVarColor('palette-grey-700'));
            setColor(palette.Chip, 'defaultAvatarColor', setCssVarColor('palette-grey-300'));
            setColor(palette.Chip, 'defaultIconColor', setCssVarColor('palette-grey-300'));
            setColor(palette.FilledInput, 'bg', 'rgba(255, 255, 255, 0.09)');
            setColor(palette.FilledInput, 'hoverBg', 'rgba(255, 255, 255, 0.13)');
            setColor(palette.FilledInput, 'disabledBg', 'rgba(255, 255, 255, 0.12)');
            setColor(palette.Input, 'autofillWebkitBoxShadow', '0 0 0 100px #266798 inset');
            setColor(palette.LinearProgress, 'primaryBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-primary-main') : palette.primary.main, 0.5));
            setColor(palette.LinearProgress, 'secondaryBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-secondary-main') : palette.secondary.main, 0.5));
            setColor(palette.LinearProgress, 'errorBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-error-main') : palette.error.main, 0.5));
            setColor(palette.LinearProgress, 'infoBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-info-main') : palette.info.main, 0.5));
            setColor(palette.LinearProgress, 'successBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-success-main') : palette.success.main, 0.5));
            setColor(palette.LinearProgress, 'warningBg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-warning-main') : palette.warning.main, 0.5));
            setColor(palette.Skeleton, 'bg', colorSpace ? colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeAlpha"], nativeColor ? getCssVar('palette-text-primary') : palette.text.primary, 0.13) : `rgba(${setCssVarColor('palette-text-primaryChannel')} / 0.13)`);
            setColor(palette.Slider, 'primaryTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-primary-main') : palette.primary.main, 0.5));
            setColor(palette.Slider, 'secondaryTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-secondary-main') : palette.secondary.main, 0.5));
            setColor(palette.Slider, 'errorTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-error-main') : palette.error.main, 0.5));
            setColor(palette.Slider, 'infoTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-info-main') : palette.info.main, 0.5));
            setColor(palette.Slider, 'successTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-success-main') : palette.success.main, 0.5));
            setColor(palette.Slider, 'warningTrack', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-warning-light') : palette.warning.main, 0.5));
            const snackbarContentBackground = colorSpace ? colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeLighten"], nativeColor ? getCssVar('palette-background-default') : palette.background.default, 0.985) // use `0.985` instead of `0.98` to match the contrast ratio of JS implementation
             : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeEmphasize"])(palette.background.default, 0.98);
            setColor(palette.SnackbarContent, 'bg', snackbarContentBackground);
            setColor(palette.SnackbarContent, 'color', silent(()=>colorSpace ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["light"].text.primary : palette.getContrastText(snackbarContentBackground)));
            setColor(palette.SpeedDialAction, 'fabHoverBg', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeEmphasize"])(palette.background.paper, 0.15));
            setColor(palette.StepConnector, 'border', setCssVarColor('palette-grey-600'));
            setColor(palette.StepContent, 'border', setCssVarColor('palette-grey-600'));
            setColor(palette.Switch, 'defaultColor', setCssVarColor('palette-grey-300'));
            setColor(palette.Switch, 'defaultDisabledColor', setCssVarColor('palette-grey-600'));
            setColor(palette.Switch, 'primaryDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-primary-main') : palette.primary.main, 0.55));
            setColor(palette.Switch, 'secondaryDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-secondary-main') : palette.secondary.main, 0.55));
            setColor(palette.Switch, 'errorDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-error-main') : palette.error.main, 0.55));
            setColor(palette.Switch, 'infoDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-info-main') : palette.info.main, 0.55));
            setColor(palette.Switch, 'successDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-success-main') : palette.success.main, 0.55));
            setColor(palette.Switch, 'warningDisabledColor', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], nativeColor ? getCssVar('palette-warning-light') : palette.warning.main, 0.55));
            setColor(palette.TableCell, 'border', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeDarken"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeAlpha"])(nativeColor ? getCssVar('palette-divider') : palette.divider, 1), 0.68));
            setColor(palette.Tooltip, 'bg', colorMix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeAlpha"], nativeColor ? getCssVar('palette-grey-700') : palette.grey[700], 0.92));
        }
        if (!nativeColor) {
            setColorChannel(palette.background, 'default');
            // added for consistency with the `background.default` token
            setColorChannel(palette.background, 'paper');
            setColorChannel(palette.common, 'background');
            setColorChannel(palette.common, 'onBackground');
            setColorChannel(palette, 'divider');
        }
        Object.keys(palette).forEach((color)=>{
            const colors = palette[color];
            // The default palettes (primary, secondary, error, info, success, and warning) errors are handled by the above `createTheme(...)`.
            if (color !== 'tonalOffset' && !nativeColor && colors && typeof colors === 'object') {
                // Silent the error for custom palettes.
                if (colors.main) {
                    setColor(palette[color], 'mainChannel', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeColorChannel"])(toRgb(colors.main)));
                }
                if (colors.light) {
                    setColor(palette[color], 'lightChannel', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeColorChannel"])(toRgb(colors.light)));
                }
                if (colors.dark) {
                    setColor(palette[color], 'darkChannel', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeColorChannel"])(toRgb(colors.dark)));
                }
                if (colors.contrastText) {
                    setColor(palette[color], 'contrastTextChannel', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$colorManipulator$2f$colorManipulator$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["private_safeColorChannel"])(toRgb(colors.contrastText)));
                }
                if (color === 'text') {
                    // Text colors: text.primary, text.secondary
                    setColorChannel(palette[color], 'primary');
                    setColorChannel(palette[color], 'secondary');
                }
                if (color === 'action') {
                    // Action colors: action.active, action.selected
                    if (colors.active) {
                        setColorChannel(palette[color], 'active');
                    }
                    if (colors.selected) {
                        setColorChannel(palette[color], 'selected');
                    }
                }
            }
        });
    });
    theme = args.reduce((acc, argument)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$utils$40$9$2e$5$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$mui$2f$utils$2f$deepmerge$2f$deepmerge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(acc, argument), theme);
    // Default color is the palette var, not a hex: `focusVisible` is spread inline (skipped from var
    // generation, see `shouldSkipGeneratingVar`), so the var adapts per scheme at the CSS level — no
    // per-scheme copy needed here, unlike the no-vars path in `createTheme`.
    const focusVisibleInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeFocusVisibleInput"])(options.focusVisible, args);
    if (focusVisibleInput != null && focusVisibleInput !== false) {
        theme.focusVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveFocusVisible"])(focusVisibleInput, getCssVar('palette-primary-main'));
    }
    const parserConfig = {
        prefix: cssVarPrefix,
        disableCssColorScheme,
        shouldSkipGeneratingVar,
        getSelector: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createGetSelector$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(theme),
        enableContrastVars: nativeColor
    };
    const { vars, generateThemeVars, generateStyleSheets } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$prepareCssVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__prepareCssVars$3e$__["prepareCssVars"])(theme, parserConfig);
    theme.vars = vars;
    Object.entries(theme.colorSchemes[theme.defaultColorScheme]).forEach(([key, value])=>{
        theme[key] = value;
    });
    theme.generateThemeVars = generateThemeVars;
    theme.generateStyleSheets = generateStyleSheets;
    theme.generateSpacing = function generateSpacing() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createTheme$2f$createSpacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createSpacing$3e$__["createSpacing"])(input.spacing, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$spacing$2f$spacing$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createUnarySpacing"])(this));
    };
    theme.getColorSchemeSelector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$getColorSchemeSelector$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createGetColorSchemeSelector"])(selector);
    theme.spacing = theme.generateSpacing();
    theme.shouldSkipGeneratingVar = shouldSkipGeneratingVar;
    theme.unstable_sxConfig = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$defaultSxConfig$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_defaultSxConfig$3e$__["unstable_defaultSxConfig"],
        ...input?.unstable_sxConfig
    };
    theme.unstable_sx = function sx(props) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            sx: props,
            theme: this
        });
    };
    theme.internal_cache = {};
    theme.toRuntimeSource = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$stringifyTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringifyTheme"]; // for Pigment CSS integration
    return theme;
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createPalette.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/focusVisible.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createThemeWithVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createThemeWithVars.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createThemeNoVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createThemeNoVars.mjs [app-ssr] (ecmascript)");
;
;
;
;
// eslint-disable-next-line consistent-return
function attachColorScheme(theme, scheme, colorScheme) {
    if (!theme.colorSchemes) {
        return undefined;
    }
    if (colorScheme) {
        theme.colorSchemes[scheme] = {
            ...colorScheme !== true && colorScheme,
            palette: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createPalette$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
                ...colorScheme === true ? {} : colorScheme.palette,
                mode: scheme
            }) // cast type to skip module augmentation test
        };
    }
}
function createTheme(options = {}, // cast type to skip module augmentation test
...args) {
    const { palette, cssVariables = false, colorSchemes: initialColorSchemes = !palette ? {
        light: true
    } : undefined, defaultColorScheme: initialDefaultColorScheme = palette?.mode, ...other } = options;
    const defaultColorSchemeInput = initialDefaultColorScheme || 'light';
    const defaultScheme = initialColorSchemes?.[defaultColorSchemeInput];
    const colorSchemesInput = {
        ...initialColorSchemes,
        ...palette ? {
            [defaultColorSchemeInput]: {
                ...typeof defaultScheme !== 'boolean' && defaultScheme,
                palette
            }
        } : undefined
    };
    if (cssVariables === false) {
        if (!('colorSchemes' in options)) {
            // Behaves exactly as v5
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createThemeNoVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(options, ...args);
        }
        let paletteOptions = palette;
        if (!('palette' in options)) {
            if (colorSchemesInput[defaultColorSchemeInput]) {
                if (colorSchemesInput[defaultColorSchemeInput] !== true) {
                    paletteOptions = colorSchemesInput[defaultColorSchemeInput].palette;
                } else if (defaultColorSchemeInput === 'dark') {
                    // @ts-ignore to prevent the module augmentation test from failing
                    paletteOptions = {
                        mode: 'dark'
                    };
                }
            }
        }
        const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createThemeNoVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            ...options,
            palette: paletteOptions
        }, ...args);
        theme.defaultColorScheme = defaultColorSchemeInput;
        theme.colorSchemes = colorSchemesInput;
        if (theme.palette.mode === 'light') {
            theme.colorSchemes.light = {
                ...colorSchemesInput.light !== true && colorSchemesInput.light,
                palette: theme.palette
            };
            attachColorScheme(theme, 'dark', colorSchemesInput.dark);
        }
        if (theme.palette.mode === 'dark') {
            theme.colorSchemes.dark = {
                ...colorSchemesInput.dark !== true && colorSchemesInput.dark,
                palette: theme.palette
            };
            attachColorScheme(theme, 'light', colorSchemesInput.light);
        }
        if (theme.focusVisible != null && theme.focusVisible !== false) {
            let focusVisibleInput = theme.focusVisible;
            const rawFocusVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeFocusVisibleInput"])(options.focusVisible, args);
            const authoredColor = rawFocusVisible && typeof rawFocusVisible === 'object' ? rawFocusVisible.outlineColor : undefined;
            // A re-composed theme carries a baked default that looks authored, so it falls back to value
            // equality — the one case where a pinned `primary.main` is indistinguishable and gets reset.
            if (!authoredColor || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isResolvedFocusVisible"])(rawFocusVisible) && authoredColor === theme.palette.primary.main) {
                const { outlineColor, ...rest } = focusVisibleInput;
                focusVisibleInput = rest;
            }
            Object.keys(theme.colorSchemes).forEach((scheme)=>{
                const schemePalette = theme.colorSchemes?.[scheme]?.palette;
                if (schemePalette?.primary) {
                    theme.colorSchemes[scheme].focusVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$focusVisible$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveFocusVisible"])(focusVisibleInput, schemePalette.primary.main);
                }
            });
        }
        return theme;
    }
    if (!palette && !('light' in colorSchemesInput) && defaultColorSchemeInput === 'light') {
        colorSchemesInput.light = true;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createThemeWithVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
        ...other,
        colorSchemes: colorSchemesInput,
        defaultColorScheme: defaultColorSchemeInput,
        ...typeof cssVariables !== 'boolean' && cssVariables
    }, ...args);
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/defaultTheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTheme.mjs [app-ssr] (ecmascript)");
'use client';
;
const defaultTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
const __TURBOPACK__default__export__ = defaultTheme;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/identifier.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = '$$material';
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/slotShouldForwardProp.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// copied from @mui/system/createStyled
function slotShouldForwardProp(prop) {
    return prop !== 'ownerState' && prop !== 'theme' && prop !== 'sx' && prop !== 'as';
}
const __TURBOPACK__default__export__ = slotShouldForwardProp;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/rootShouldForwardProp.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$slotShouldForwardProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/slotShouldForwardProp.mjs [app-ssr] (ecmascript)");
;
const rootShouldForwardProp = (prop)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$slotShouldForwardProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(prop) && prop !== 'classes';
const __TURBOPACK__default__export__ = rootShouldForwardProp;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/styled.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createStyled$2f$createStyled$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/createStyled/createStyled.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$defaultTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/defaultTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/identifier.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$rootShouldForwardProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/rootShouldForwardProp.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const styled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$createStyled$2f$createStyled$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
    themeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    defaultTheme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$defaultTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    rootShouldForwardProp: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$rootShouldForwardProp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
});
const __TURBOPACK__default__export__ = styled;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/styled.mjs [app-ssr] (ecmascript) <locals> <export default as styled>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "styled",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$styled$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$styled$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/styled.mjs [app-ssr] (ecmascript) <locals>");
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/useTheme.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/useTheme/useTheme.mjs [app-ssr] (ecmascript) <export default as useTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$defaultTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/defaultTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/identifier.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function useTheme() {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$useTheme$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$defaultTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
    if ("TURBOPACK compile-time truthy", 1) {
        // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/rules-of-hooks
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDebugValue"](theme);
    }
    return theme[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]] || theme;
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/reducedMotion.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultStyles",
    ()=>defaultStyles,
    "resolveReducedMotionStyles",
    ()=>resolveReducedMotionStyles
]);
const defaultStyles = {
    transition: 'none'
};
function resolveReducedMotionStyles(reducedMotion, styles) {
    if (reducedMotion === 'always') {
        return styles;
    }
    if (reducedMotion === 'system') {
        return {
            '@media (prefers-reduced-motion: reduce)': styles
        };
    }
    return null;
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/useTheme.mjs [app-ssr] (ecmascript) <export default as useTheme>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTheme",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/useTheme.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/ThemeProviderNoVars.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeProviderNoVars
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/ThemeProvider/ThemeProvider.mjs [app-ssr] (ecmascript) <export default as ThemeProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/identifier.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function ThemeProviderNoVars({ theme: themeInput, ...props }) {
    const scopedTheme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] in themeInput ? themeInput[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]] : undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$ThemeProvider$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__["ThemeProvider"], {
        ...props,
        themeId: scopedTheme ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] : undefined,
        theme: scopedTheme || themeInput
    });
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/ThemeProviderWithVars.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CssVarsProvider",
    ()=>CssVarsProvider,
    "Experimental_CssVarsProvider",
    ()=>Experimental_CssVarsProvider,
    "getInitColorSchemeScript",
    ()=>getInitColorSchemeScript,
    "useColorScheme",
    ()=>useColorScheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/styleFunctionSx/styleFunctionSx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createCssVarsProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_createCssVarsProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+system@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+sty_7ada95cedadd5ce05ca25b51adcd2579/node_modules/@mui/system/cssVars/createCssVarsProvider.mjs [app-ssr] (ecmascript) <export default as unstable_createCssVarsProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTheme.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTypography$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTypography.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/identifier.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/InitColorSchemeScript/InitColorSchemeScript.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const { CssVarsProvider: InternalCssVarsProvider, useColorScheme, getInitColorSchemeScript: deprecatedGetInitColorSchemeScript } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$cssVars$2f$createCssVarsProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_createCssVarsProvider$3e$__["unstable_createCssVarsProvider"])({
    themeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
    // @ts-ignore ignore module augmentation tests
    theme: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            cssVariables: true
        }),
    colorSchemeStorageKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultConfig"].colorSchemeStorageKey,
    modeStorageKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultConfig"].modeStorageKey,
    defaultColorScheme: {
        light: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultConfig"].defaultLightColorScheme,
        dark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$InitColorSchemeScript$2f$InitColorSchemeScript$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultConfig"].defaultDarkColorScheme
    },
    resolveTheme: (theme)=>{
        const newTheme = {
            ...theme,
            typography: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTypography$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(theme.palette, theme.typography)
        };
        newTheme.unstable_sx = function sx(props) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$system$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$sty_7ada95cedadd5ce05ca25b51adcd2579$2f$node_modules$2f40$mui$2f$system$2f$styleFunctionSx$2f$styleFunctionSx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
                sx: props,
                theme: this
            });
        };
        return newTheme;
    }
});
let warnedOnce = false;
// TODO: remove in v7
// eslint-disable-next-line @typescript-eslint/naming-convention
function Experimental_CssVarsProvider(props) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (!warnedOnce) {
            console.warn([
                'MUI: The Experimental_CssVarsProvider component has been ported into ThemeProvider.',
                '',
                "You should use `import { ThemeProvider } from '@mui/material/styles'` instead.",
                'For more details, check out https://mui.com/material-ui/customization/css-theme-variables/usage/'
            ].join('\n'));
            warnedOnce = true;
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(InternalCssVarsProvider, {
        ...props
    });
}
let warnedInitScriptOnce = false;
// TODO: remove in v7
const getInitColorSchemeScript = (params)=>{
    if (!warnedInitScriptOnce) {
        console.warn([
            'MUI: The getInitColorSchemeScript function has been deprecated.',
            '',
            "You should use `import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'`",
            'and replace the function call with `<InitColorSchemeScript />` instead.'
        ].join('\n'));
        warnedInitScriptOnce = true;
    }
    return deprecatedGetInitColorSchemeScript(params);
};
const CssVarsProvider = InternalCssVarsProvider;
;
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/ThemeProvider.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProviderNoVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/ThemeProviderNoVars.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProviderWithVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/ThemeProviderWithVars.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/identifier.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function ThemeProvider({ theme, ...props }) {
    const noVarsTheme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>{
        if (typeof theme === 'function') {
            return theme;
        }
        const muiTheme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] in theme ? theme[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$identifier$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]] : theme;
        if (!('colorSchemes' in muiTheme)) {
            if (!('vars' in muiTheme)) {
                // For non-CSS variables themes, set `vars` to null to prevent theme inheritance from the upper theme.
                // The example use case is the docs demo that uses ThemeProvider to customize the theme while the upper theme is using CSS variables.
                return {
                    ...theme,
                    vars: null
                };
            }
            return theme;
        }
        return null;
    }, [
        theme
    ]);
    if (noVarsTheme) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProviderNoVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            theme: noVarsTheme,
            ...props
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProviderWithVars$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CssVarsProvider"], {
        theme: theme,
        ...props
    });
}
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/ThemeProvider.mjs [app-ssr] (ecmascript) <export default as ThemeProvider>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/ThemeProvider.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTheme.mjs [app-ssr] (ecmascript) <export default as createTheme>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTheme",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$mui$2b$material$40$9$2e$5$2e$0_$40$emotion$2b$react$40$11$2e$14$2e$0_$40$types$2b$react$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f40$emotion$2b$s_700aa9eebc76968ccc7d05d63c1911b8$2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@mui+material@9.5.0_@emotion+react@11.14.0_@types+react@19.3.0_react@19.3.0__@emotion+s_700aa9eebc76968ccc7d05d63c1911b8/node_modules/@mui/material/styles/createTheme.mjs [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=0pyw_%40mui_material_styles_0rfjgya._.js.map