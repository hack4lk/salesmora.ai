module.exports = [
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/max.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>max_default
]);
//#region src/utils/uuid/max.ts
var max_default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/nil.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>nil_default
]);
//#region src/utils/uuid/nil.ts
var nil_default = "00000000-0000-0000-0000-000000000000";
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/regex.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>regex_default
]);
//#region src/utils/uuid/regex.ts
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/validate.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$regex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/regex.js [app-rsc] (ecmascript)");
;
//#region src/utils/uuid/validate.ts
function validate(uuid) {
    return typeof uuid === "string" && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$regex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].test(uuid);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/parse.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>parse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/validate.js [app-rsc] (ecmascript)");
;
//#region src/utils/uuid/parse.ts
function parse(uuid) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(uuid)) throw TypeError("Invalid UUID");
    let v;
    return Uint8Array.of((v = parseInt(uuid.slice(0, 8), 16)) >>> 24, v >>> 16 & 255, v >>> 8 & 255, v & 255, (v = parseInt(uuid.slice(9, 13), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(14, 18), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(19, 23), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255, v / 4294967296 & 255, v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>stringify,
    "unsafeStringify",
    ()=>unsafeStringify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/validate.js [app-rsc] (ecmascript)");
;
//#region src/utils/uuid/stringify.ts
/**
* Convert array of 16 byte values to UUID string format of the form:
* XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
*/ const byteToHex = [];
for(let i = 0; i < 256; ++i)byteToHex.push((i + 256).toString(16).slice(1));
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(uuid)) throw TypeError("Stringified UUID is invalid");
    return uuid;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/rng.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>rng
]);
//#region src/utils/uuid/rng.ts
const rnds8 = /* @__PURE__ */ new Uint8Array(16);
function rng() {
    return crypto.getRandomValues(rnds8);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v1.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>v1,
    "updateV1State",
    ()=>updateV1State
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/rng.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/uuid/v1.ts
const _state = {};
function v1(options, buf, offset) {
    let bytes;
    const isV6 = options?._v6 ?? false;
    if (options) {
        const optionsKeys = Object.keys(options);
        if (optionsKeys.length === 1 && optionsKeys[0] === "_v6") options = void 0;
    }
    if (options) bytes = v1Bytes(options.random ?? options.rng?.() ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(), options.msecs, options.nsecs, options.clockseq, options.node, buf, offset);
    else {
        const now = Date.now();
        const rnds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])();
        updateV1State(_state, now, rnds);
        bytes = v1Bytes(rnds, _state.msecs, _state.nsecs, isV6 ? void 0 : _state.clockseq, isV6 ? void 0 : _state.node, buf, offset);
    }
    return buf ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unsafeStringify"])(bytes);
}
function updateV1State(state, now, rnds) {
    state.msecs ??= -Infinity;
    state.nsecs ??= 0;
    if (now === state.msecs) {
        state.nsecs++;
        if (state.nsecs >= 1e4) {
            state.node = void 0;
            state.nsecs = 0;
        }
    } else if (now > state.msecs) state.nsecs = 0;
    else if (now < state.msecs) state.node = void 0;
    if (!state.node) {
        state.node = rnds.slice(10, 16);
        state.node[0] |= 1;
        state.clockseq = (rnds[8] << 8 | rnds[9]) & 16383;
    }
    state.msecs = now;
    return state;
}
function v1Bytes(rnds, msecs, nsecs, clockseq, node, buf, offset = 0) {
    if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
    if (!buf) {
        buf = /* @__PURE__ */ new Uint8Array(16);
        offset = 0;
    } else if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    msecs ??= Date.now();
    nsecs ??= 0;
    clockseq ??= (rnds[8] << 8 | rnds[9]) & 16383;
    node ??= rnds.slice(10, 16);
    msecs += 0xb1d069b5400;
    const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
    buf[offset++] = tl >>> 24 & 255;
    buf[offset++] = tl >>> 16 & 255;
    buf[offset++] = tl >>> 8 & 255;
    buf[offset++] = tl & 255;
    const tmh = msecs / 4294967296 * 1e4 & 268435455;
    buf[offset++] = tmh >>> 8 & 255;
    buf[offset++] = tmh & 255;
    buf[offset++] = tmh >>> 24 & 15 | 16;
    buf[offset++] = tmh >>> 16 & 255;
    buf[offset++] = clockseq >>> 8 | 128;
    buf[offset++] = clockseq & 255;
    for(let n = 0; n < 6; ++n)buf[offset++] = node[n];
    return buf;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v4.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>v4
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/rng.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/uuid/v4.ts
function v4(options, buf, offset) {
    if (!buf && !options && crypto.randomUUID) return crypto.randomUUID();
    return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])();
    if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        for(let i = 0; i < 16; ++i)buf[offset + i] = rnds[i];
        return buf;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unsafeStringify"])(rnds);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/sha1.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>sha1
]);
//#region src/utils/uuid/sha1.ts
function f(s, x, y, z) {
    switch(s){
        case 0:
            return x & y ^ ~x & z;
        case 1:
            return x ^ y ^ z;
        case 2:
            return x & y ^ x & z ^ y & z;
        case 3:
            return x ^ y ^ z;
    }
}
function ROTL(x, n) {
    return x << n | x >>> 32 - n;
}
function sha1(bytes) {
    const K = [
        1518500249,
        1859775393,
        2400959708,
        3395469782
    ];
    const H = [
        1732584193,
        4023233417,
        2562383102,
        271733878,
        3285377520
    ];
    const newBytes = new Uint8Array(bytes.length + 1);
    newBytes.set(bytes);
    newBytes[bytes.length] = 128;
    bytes = newBytes;
    const l = bytes.length / 4 + 2;
    const N = Math.ceil(l / 16);
    const M = new Array(N);
    for(let i = 0; i < N; ++i){
        const arr = /* @__PURE__ */ new Uint32Array(16);
        for(let j = 0; j < 16; ++j)arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
        M[i] = arr;
    }
    M[N - 1][14] = (bytes.length - 1) * 8 / 2 ** 32;
    M[N - 1][14] = Math.floor(M[N - 1][14]);
    M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
    for(let i = 0; i < N; ++i){
        const W = /* @__PURE__ */ new Uint32Array(80);
        for(let t = 0; t < 16; ++t)W[t] = M[i][t];
        for(let t = 16; t < 80; ++t)W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
        let a = H[0];
        let b = H[1];
        let c = H[2];
        let d = H[3];
        let e = H[4];
        for(let t = 0; t < 80; ++t){
            const s = Math.floor(t / 20);
            const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
            e = d;
            d = c;
            c = ROTL(b, 30) >>> 0;
            b = a;
            a = T;
        }
        H[0] = H[0] + a >>> 0;
        H[1] = H[1] + b >>> 0;
        H[2] = H[2] + c >>> 0;
        H[3] = H[3] + d >>> 0;
        H[4] = H[4] + e >>> 0;
    }
    return Uint8Array.of(H[0] >> 24, H[0] >> 16, H[0] >> 8, H[0], H[1] >> 24, H[1] >> 16, H[1] >> 8, H[1], H[2] >> 24, H[2] >> 16, H[2] >> 8, H[2], H[3] >> 24, H[3] >> 16, H[3] >> 8, H[3], H[4] >> 24, H[4] >> 16, H[4] >> 8, H[4]);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v35.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DNS",
    ()=>DNS,
    "URL",
    ()=>URL,
    "default",
    ()=>v35,
    "stringToBytes",
    ()=>stringToBytes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/parse.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/uuid/v35.ts
function stringToBytes(str) {
    str = unescape(encodeURIComponent(str));
    const bytes = new Uint8Array(str.length);
    for(let i = 0; i < str.length; ++i)bytes[i] = str.charCodeAt(i);
    return bytes;
}
const DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(version, hash, value, namespace, buf, offset) {
    const valueBytes = typeof value === "string" ? stringToBytes(value) : value;
    const namespaceBytes = typeof namespace === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(namespace) : namespace;
    if (typeof namespace === "string") namespace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(namespace);
    if (namespace?.length !== 16) throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    let bytes = new Uint8Array(16 + valueBytes.length);
    bytes.set(namespaceBytes);
    bytes.set(valueBytes, namespaceBytes.length);
    bytes = hash(bytes);
    bytes[6] = bytes[6] & 15 | version;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
        offset ??= 0;
        if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        for(let i = 0; i < 16; ++i)buf[offset + i] = bytes[i];
        return buf;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unsafeStringify"])(bytes);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v5.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>v5
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$sha1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/sha1.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v35.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/uuid/v5.ts
function v5(value, namespace, buf, offset) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(80, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$sha1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], value, namespace, buf, offset);
}
v5.DNS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DNS"];
v5.URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["URL"];
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v1ToV6.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>v1ToV6
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/parse.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/uuid/v1ToV6.ts
function v1ToV6(uuid) {
    const v6Bytes = _v1ToV6(typeof uuid === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(uuid) : uuid);
    return typeof uuid === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unsafeStringify"])(v6Bytes) : v6Bytes;
}
function _v1ToV6(v1Bytes) {
    return Uint8Array.of((v1Bytes[6] & 15) << 4 | v1Bytes[7] >> 4 & 15, (v1Bytes[7] & 15) << 4 | (v1Bytes[4] & 240) >> 4, (v1Bytes[4] & 15) << 4 | (v1Bytes[5] & 240) >> 4, (v1Bytes[5] & 15) << 4 | (v1Bytes[0] & 240) >> 4, (v1Bytes[0] & 15) << 4 | (v1Bytes[1] & 240) >> 4, (v1Bytes[1] & 15) << 4 | (v1Bytes[2] & 240) >> 4, 96 | v1Bytes[2] & 15, v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v6.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>v6
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v1.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v1ToV6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v1ToV6.js [app-rsc] (ecmascript)");
;
;
;
//#region src/utils/uuid/v6.ts
function v6(options, buf, offset) {
    options ??= {};
    offset ??= 0;
    let bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])({
        ...options,
        _v6: true
    }, /* @__PURE__ */ new Uint8Array(16));
    bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v1ToV6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(bytes);
    if (buf) {
        if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        for(let i = 0; i < 16; i++)buf[offset + i] = bytes[i];
        return buf;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unsafeStringify"])(bytes);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v7.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>v7,
    "updateV7State",
    ()=>updateV7State
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/rng.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/uuid/v7.ts
const _state = {};
function v7(options, buf, offset) {
    let bytes;
    if (options) bytes = v7Bytes(options.random ?? options.rng?.() ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(), options.msecs, options.seq, buf, offset);
    else {
        const now = Date.now();
        const rnds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])();
        updateV7State(_state, now, rnds);
        bytes = v7Bytes(rnds, _state.msecs, _state.seq, buf, offset);
    }
    return buf ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unsafeStringify"])(bytes);
}
function updateV7State(state, now, rnds) {
    state.msecs ??= -Infinity;
    state.seq ??= 0;
    if (now > state.msecs) {
        state.seq = rnds[6] << 23 | rnds[7] << 16 | rnds[8] << 8 | rnds[9];
        state.msecs = now;
    } else {
        state.seq = state.seq + 1 | 0;
        if (state.seq === 0) state.msecs++;
    }
    return state;
}
function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
    if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
    if (!buf) {
        buf = /* @__PURE__ */ new Uint8Array(16);
        offset = 0;
    } else if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    msecs ??= Date.now();
    seq ??= rnds[6] * 127 << 24 | rnds[7] << 16 | rnds[8] << 8 | rnds[9];
    buf[offset++] = msecs / 1099511627776 & 255;
    buf[offset++] = msecs / 4294967296 & 255;
    buf[offset++] = msecs / 16777216 & 255;
    buf[offset++] = msecs / 65536 & 255;
    buf[offset++] = msecs / 256 & 255;
    buf[offset++] = msecs & 255;
    buf[offset++] = 112 | seq >>> 28 & 15;
    buf[offset++] = seq >>> 20 & 255;
    buf[offset++] = 128 | seq >>> 14 & 63;
    buf[offset++] = seq >>> 6 & 255;
    buf[offset++] = seq << 2 & 255 | rnds[10] & 3;
    buf[offset++] = rnds[11];
    buf[offset++] = rnds[12];
    buf[offset++] = rnds[13];
    buf[offset++] = rnds[14];
    buf[offset++] = rnds[15];
    return buf;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/version.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>version
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/validate.js [app-rsc] (ecmascript)");
;
//#region src/utils/uuid/version.ts
function version(uuid) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(uuid)) throw TypeError("Invalid UUID");
    return parseInt(uuid.slice(14, 15), 16);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX",
    ()=>MAX,
    "NIL",
    ()=>NIL,
    "parse",
    ()=>parse,
    "stringify",
    ()=>stringify,
    "uuid_exports",
    ()=>uuid_exports,
    "v1",
    ()=>v1,
    "v4",
    ()=>v4,
    "v5",
    ()=>v5,
    "v6",
    ()=>v6,
    "v7",
    ()=>v7,
    "validate",
    ()=>validate,
    "version",
    ()=>version
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$max$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/max.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$nil$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/nil.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/validate.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/parse.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/stringify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v1.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v4.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v5.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v6.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v7$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/v7.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$version$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/version.js [app-rsc] (ecmascript)");
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
//#region src/utils/uuid/index.ts
var uuid_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    MAX: ()=>MAX,
    NIL: ()=>NIL,
    parse: ()=>parse,
    stringify: ()=>stringify,
    v1: ()=>v1,
    v4: ()=>v4,
    v5: ()=>v5,
    v6: ()=>v6,
    v7: ()=>v7,
    validate: ()=>validate,
    version: ()=>version
});
const MAX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$max$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const NIL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$nil$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const parse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const stringify = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const v1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const v4 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const v5 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const v6 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const v7 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$v7$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const validate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
const version = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$version$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env_exports",
    ()=>env_exports,
    "getEnv",
    ()=>getEnv,
    "getEnvironmentVariable",
    ()=>getEnvironmentVariable,
    "getRuntimeEnvironment",
    ()=>getRuntimeEnvironment,
    "isBrowser",
    ()=>isBrowser,
    "isDeno",
    ()=>isDeno,
    "isJsDom",
    ()=>isJsDom,
    "isNode",
    ()=>isNode,
    "isWebWorker",
    ()=>isWebWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/utils/env.ts
var env_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    getEnv: ()=>getEnv,
    getEnvironmentVariable: ()=>getEnvironmentVariable,
    getRuntimeEnvironment: ()=>getRuntimeEnvironment,
    isBrowser: ()=>isBrowser,
    isDeno: ()=>isDeno,
    isJsDom: ()=>isJsDom,
    isNode: ()=>isNode,
    isWebWorker: ()=>isWebWorker
});
const isBrowser = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined" && typeof window.document !== "undefined";
const isWebWorker = ()=>typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope";
const isJsDom = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom");
const isDeno = ()=>typeof Deno !== "undefined";
const isNode = ()=>typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno();
const getEnv = ()=>{
    let env;
    if (isBrowser()) env = "browser";
    else if (isNode()) env = "node";
    else if (isWebWorker()) env = "webworker";
    else if (isJsDom()) env = "jsdom";
    else if (isDeno()) env = "deno";
    else env = "other";
    return env;
};
let runtimeEnvironment;
function getRuntimeEnvironment() {
    if (runtimeEnvironment === void 0) runtimeEnvironment = {
        library: "langchain-js",
        runtime: getEnv()
    };
    return runtimeEnvironment;
}
function getEnvironmentVariable(name) {
    try {
        if (typeof process !== "undefined") return process.env?.[name];
        else if (isDeno()) return Deno?.env.get(name);
        else return;
    } catch  {
        return;
    }
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/js-sha256/hash.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sha256",
    ()=>sha256
]);
//#region src/utils/js-sha256/hash.ts
/**
* [js-sha256]{@link https://github.com/emn178/js-sha256}
*
* @version 0.11.1
* @author Chen, Yi-Cyuan [emn178@gmail.com]
* @copyright Chen, Yi-Cyuan 2014-2025
* @license MIT
*/ var HEX_CHARS = "0123456789abcdef".split("");
var EXTRA = [
    -2147483648,
    8388608,
    32768,
    128
];
var SHIFT = [
    24,
    16,
    8,
    0
];
var K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
];
var blocks = [];
function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        this.blocks = blocks;
    } else this.blocks = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ];
    if (is224) {
        this.h0 = 3238371032;
        this.h1 = 914150663;
        this.h2 = 812702999;
        this.h3 = 4144912697;
        this.h4 = 4290775857;
        this.h5 = 1750603025;
        this.h6 = 1694076839;
        this.h7 = 3204075428;
    } else {
        this.h0 = 1779033703;
        this.h1 = 3144134277;
        this.h2 = 1013904242;
        this.h3 = 2773480762;
        this.h4 = 1359893119;
        this.h5 = 2600822924;
        this.h6 = 528734635;
        this.h7 = 1541459225;
    }
    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
    this.is224 = is224;
}
Sha256.prototype.update = function(message) {
    if (this.finalized) return;
    var notString, type = typeof message;
    if (type !== "string") {
        if (type === "object") {
            if (message === null) throw new Error(ERROR);
            else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) message = new Uint8Array(message);
            else if (!Array.isArray(message)) {
                if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) throw new Error(ERROR);
            }
        } else throw new Error(ERROR);
        notString = true;
    }
    var code, index = 0, i, length = message.length, blocks = this.blocks;
    while(index < length){
        if (this.hashed) {
            this.hashed = false;
            blocks[0] = this.block;
            this.block = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        if (notString) for(i = this.start; index < length && i < 64; ++index)blocks[i >>> 2] |= message[index] << SHIFT[i++ & 3];
        else for(i = this.start; index < length && i < 64; ++index){
            code = message.charCodeAt(index);
            if (code < 128) blocks[i >>> 2] |= code << SHIFT[i++ & 3];
            else if (code < 2048) {
                blocks[i >>> 2] |= (192 | code >>> 6) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else if (code < 55296 || code >= 57344) {
                blocks[i >>> 2] |= (224 | code >>> 12) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else {
                code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                blocks[i >>> 2] |= (240 | code >>> 18) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (128 | code >>> 12 & 63) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            }
        }
        this.lastByteIndex = i;
        this.bytes += i - this.start;
        if (i >= 64) {
            this.block = blocks[16];
            this.start = i - 64;
            this.hash();
            this.hashed = true;
        } else this.start = i;
    }
    if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
    }
    return this;
};
Sha256.prototype.finalize = function() {
    if (this.finalized) return;
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex;
    blocks[16] = this.block;
    blocks[i >>> 2] |= EXTRA[i & 3];
    this.block = blocks[16];
    if (i >= 56) {
        if (!this.hashed) this.hash();
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
};
Sha256.prototype.hash = function() {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks = this.blocks, j = 16, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;
    for(; j < 64; ++j){
        t1 = blocks[j - 15];
        s0 = (t1 >>> 7 | t1 << 25) ^ (t1 >>> 18 | t1 << 14) ^ t1 >>> 3;
        t1 = blocks[j - 2];
        s1 = (t1 >>> 17 | t1 << 15) ^ (t1 >>> 19 | t1 << 13) ^ t1 >>> 10;
        blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
    }
    bc = b & c;
    for(j = 0; j < 64; j += 4){
        if (this.first) {
            if (this.is224) {
                ab = 300032;
                t1 = blocks[0] - 1413257819;
                h = t1 - 150054599 << 0;
                d = t1 + 24177077 << 0;
            } else {
                ab = 704751109;
                t1 = blocks[0] - 210244248;
                h = t1 - 1521486534 << 0;
                d = t1 + 143694565 << 0;
            }
            this.first = false;
        } else {
            s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
            s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
            ab = a & b;
            maj = ab ^ a & c ^ bc;
            ch = e & f ^ ~e & g;
            t1 = h + s1 + ch + K[j] + blocks[j];
            t2 = s0 + maj;
            h = d + t1 << 0;
            d = t1 + t2 << 0;
        }
        s0 = (d >>> 2 | d << 30) ^ (d >>> 13 | d << 19) ^ (d >>> 22 | d << 10);
        s1 = (h >>> 6 | h << 26) ^ (h >>> 11 | h << 21) ^ (h >>> 25 | h << 7);
        da = d & a;
        maj = da ^ d & b ^ ab;
        ch = g & h ^ ~g & e;
        t1 = f + s1 + ch + K[j + 1] + blocks[j + 1];
        t2 = s0 + maj;
        g = c + t1 << 0;
        c = t1 + t2 << 0;
        s0 = (c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10);
        s1 = (g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7);
        cd = c & d;
        maj = cd ^ c & a ^ da;
        ch = f & g ^ ~f & h;
        t1 = e + s1 + ch + K[j + 2] + blocks[j + 2];
        t2 = s0 + maj;
        f = b + t1 << 0;
        b = t1 + t2 << 0;
        s0 = (b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10);
        s1 = (f >>> 6 | f << 26) ^ (f >>> 11 | f << 21) ^ (f >>> 25 | f << 7);
        bc = b & c;
        maj = bc ^ b & d ^ cd;
        ch = f & g ^ ~f & h;
        t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
        t2 = s0 + maj;
        e = a + t1 << 0;
        a = t1 + t2 << 0;
        this.chromeBugWorkAround = true;
    }
    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
    this.h5 = this.h5 + f << 0;
    this.h6 = this.h6 + g << 0;
    this.h7 = this.h7 + h << 0;
};
Sha256.prototype.hex = function() {
    this.finalize();
    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
    var hex = HEX_CHARS[h0 >>> 28 & 15] + HEX_CHARS[h0 >>> 24 & 15] + HEX_CHARS[h0 >>> 20 & 15] + HEX_CHARS[h0 >>> 16 & 15] + HEX_CHARS[h0 >>> 12 & 15] + HEX_CHARS[h0 >>> 8 & 15] + HEX_CHARS[h0 >>> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >>> 28 & 15] + HEX_CHARS[h1 >>> 24 & 15] + HEX_CHARS[h1 >>> 20 & 15] + HEX_CHARS[h1 >>> 16 & 15] + HEX_CHARS[h1 >>> 12 & 15] + HEX_CHARS[h1 >>> 8 & 15] + HEX_CHARS[h1 >>> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >>> 28 & 15] + HEX_CHARS[h2 >>> 24 & 15] + HEX_CHARS[h2 >>> 20 & 15] + HEX_CHARS[h2 >>> 16 & 15] + HEX_CHARS[h2 >>> 12 & 15] + HEX_CHARS[h2 >>> 8 & 15] + HEX_CHARS[h2 >>> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >>> 28 & 15] + HEX_CHARS[h3 >>> 24 & 15] + HEX_CHARS[h3 >>> 20 & 15] + HEX_CHARS[h3 >>> 16 & 15] + HEX_CHARS[h3 >>> 12 & 15] + HEX_CHARS[h3 >>> 8 & 15] + HEX_CHARS[h3 >>> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >>> 28 & 15] + HEX_CHARS[h4 >>> 24 & 15] + HEX_CHARS[h4 >>> 20 & 15] + HEX_CHARS[h4 >>> 16 & 15] + HEX_CHARS[h4 >>> 12 & 15] + HEX_CHARS[h4 >>> 8 & 15] + HEX_CHARS[h4 >>> 4 & 15] + HEX_CHARS[h4 & 15] + HEX_CHARS[h5 >>> 28 & 15] + HEX_CHARS[h5 >>> 24 & 15] + HEX_CHARS[h5 >>> 20 & 15] + HEX_CHARS[h5 >>> 16 & 15] + HEX_CHARS[h5 >>> 12 & 15] + HEX_CHARS[h5 >>> 8 & 15] + HEX_CHARS[h5 >>> 4 & 15] + HEX_CHARS[h5 & 15] + HEX_CHARS[h6 >>> 28 & 15] + HEX_CHARS[h6 >>> 24 & 15] + HEX_CHARS[h6 >>> 20 & 15] + HEX_CHARS[h6 >>> 16 & 15] + HEX_CHARS[h6 >>> 12 & 15] + HEX_CHARS[h6 >>> 8 & 15] + HEX_CHARS[h6 >>> 4 & 15] + HEX_CHARS[h6 & 15];
    if (!this.is224) hex += HEX_CHARS[h7 >>> 28 & 15] + HEX_CHARS[h7 >>> 24 & 15] + HEX_CHARS[h7 >>> 20 & 15] + HEX_CHARS[h7 >>> 16 & 15] + HEX_CHARS[h7 >>> 12 & 15] + HEX_CHARS[h7 >>> 8 & 15] + HEX_CHARS[h7 >>> 4 & 15] + HEX_CHARS[h7 & 15];
    return hex;
};
Sha256.prototype.toString = Sha256.prototype.hex;
Sha256.prototype.digest = function() {
    this.finalize();
    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
    var arr = [
        h0 >>> 24 & 255,
        h0 >>> 16 & 255,
        h0 >>> 8 & 255,
        h0 & 255,
        h1 >>> 24 & 255,
        h1 >>> 16 & 255,
        h1 >>> 8 & 255,
        h1 & 255,
        h2 >>> 24 & 255,
        h2 >>> 16 & 255,
        h2 >>> 8 & 255,
        h2 & 255,
        h3 >>> 24 & 255,
        h3 >>> 16 & 255,
        h3 >>> 8 & 255,
        h3 & 255,
        h4 >>> 24 & 255,
        h4 >>> 16 & 255,
        h4 >>> 8 & 255,
        h4 & 255,
        h5 >>> 24 & 255,
        h5 >>> 16 & 255,
        h5 >>> 8 & 255,
        h5 & 255,
        h6 >>> 24 & 255,
        h6 >>> 16 & 255,
        h6 >>> 8 & 255,
        h6 & 255
    ];
    if (!this.is224) arr.push(h7 >>> 24 & 255, h7 >>> 16 & 255, h7 >>> 8 & 255, h7 & 255);
    return arr;
};
Sha256.prototype.array = Sha256.prototype.digest;
Sha256.prototype.arrayBuffer = function() {
    this.finalize();
    var buffer = /* @__PURE__ */ new ArrayBuffer(this.is224 ? 28 : 32);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    dataView.setUint32(20, this.h5);
    dataView.setUint32(24, this.h6);
    if (!this.is224) dataView.setUint32(28, this.h7);
    return buffer;
};
const sha256 = (...strings)=>{
    return new Sha256(false, true).update(strings.join("")).hex();
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/hash.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hash_exports",
    ()=>hash_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/js-sha256/hash.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/hash.ts
var hash_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    sha256: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sha256"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/namespace.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createNamespace",
    ()=>createNamespace,
    "ns",
    ()=>ns
]);
//#region src/utils/namespace.ts
/**
* Create a symbol-based namespace for hierarchical `isInstance` checking.
*
* Each namespace level gets its own `Symbol.for(path)`. When a class is
* branded via `.brand()`, only the new symbol for that level is stamped
* on the prototype. Parent symbols are inherited implicitly through the
* class extension chain -- `symbol in obj` traverses the prototype chain,
* so a `ConfigError` instance is recognized by `LangChainError.isInstance()`
* because it extends `GoogleError` which extends `LangChainError`, whose
* prototype already carries the `langchain.error` symbol.
*
* @param path - The dot-separated namespace path (e.g. "langchain.error")
* @returns A Namespace object with `.brand()`, `.sub()`, and `.isInstance()`
*
* @example
* ```typescript
* const langchain = createNamespace("langchain");
* const errorNs = langchain.sub("error");
* const googleNs = errorNs.sub("google");
*
* class LangChainError extends errorNs.brand(Error) {}
* class GoogleError extends googleNs.brand(LangChainError) {}
* class ConfigError extends googleNs.brand(GoogleError, "configuration") {}
*
* const err = new ConfigError("bad config");
* LangChainError.isInstance(err); // true (checks langchain.error symbol)
* GoogleError.isInstance(err);    // true (checks langchain.error.google symbol)
* ConfigError.isInstance(err);    // true (checks langchain.error.google.configuration symbol)
* ```
*/ function createNamespace(path) {
    const symbol = Symbol.for(path);
    return {
        brand (Base, marker) {
            const brandSymbol = marker ? Symbol.for(`${path}.${marker}`) : symbol;
            class _Branded extends Base {
                [brandSymbol] = true;
                constructor(...args){
                    super(...args);
                }
                static isInstance(obj) {
                    return typeof obj === "object" && obj !== null && brandSymbol in obj && obj[brandSymbol] === true;
                }
                static [Symbol.hasInstance](obj) {
                    return this.isInstance(obj);
                }
            }
            Object.defineProperty(_Branded, "name", {
                value: Base.name
            });
            return _Branded;
        },
        sub (childPath) {
            return createNamespace(`${path}.${childPath}`);
        },
        isInstance (obj) {
            return typeof obj === "object" && obj !== null && symbol in obj && obj[symbol] === true;
        }
    };
}
/** Base namespace used throughout LangChain */ const ns = createNamespace("langchain");
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseJsonMarkdown",
    ()=>parseJsonMarkdown,
    "parsePartialJson",
    ()=>parsePartialJson,
    "strictParsePartialJson",
    ()=>strictParsePartialJson
]);
//#region src/utils/json.ts
function parseJsonMarkdown(s, parser = parsePartialJson) {
    s = s.trim();
    const firstFenceIndex = s.indexOf("```");
    if (firstFenceIndex === -1) return parser(s);
    let contentAfterFence = s.substring(firstFenceIndex + 3);
    if (contentAfterFence.startsWith("json\n")) contentAfterFence = contentAfterFence.substring(5);
    else if (contentAfterFence.startsWith("json")) contentAfterFence = contentAfterFence.substring(4);
    else if (contentAfterFence.startsWith("\n")) contentAfterFence = contentAfterFence.substring(1);
    const closingFenceIndex = contentAfterFence.indexOf("```");
    let finalContent = contentAfterFence;
    if (closingFenceIndex !== -1) finalContent = contentAfterFence.substring(0, closingFenceIndex);
    return parser(finalContent.trim());
}
/**
* Recursive descent partial JSON parser.
* @param s - The string to parse.
* @returns The parsed value.
* @throws Error if the input is a malformed JSON string.
*/ function strictParsePartialJson(s) {
    try {
        return JSON.parse(s);
    } catch  {}
    const buffer = s.trim();
    if (buffer.length === 0) throw new Error("Unexpected end of JSON input");
    let pos = 0;
    function skipWhitespace() {
        while(pos < buffer.length && /\s/.test(buffer[pos]))pos += 1;
    }
    function parseString() {
        if (buffer[pos] !== "\"") throw new Error(`Expected '"' at position ${pos}, got '${buffer[pos]}'`);
        pos += 1;
        let result = "";
        let escaped = false;
        while(pos < buffer.length){
            const char = buffer[pos];
            if (escaped) {
                if (char === "n") result += "\n";
                else if (char === "t") result += "	";
                else if (char === "r") result += "\r";
                else if (char === "\\") result += "\\";
                else if (char === "\"") result += "\"";
                else if (char === "b") result += "\b";
                else if (char === "f") result += "\f";
                else if (char === "/") result += "/";
                else if (char === "u") {
                    const hex = buffer.substring(pos + 1, pos + 5);
                    if (/^[0-9A-Fa-f]{0,4}$/.test(hex)) {
                        if (hex.length === 4) result += String.fromCharCode(Number.parseInt(hex, 16));
                        else result += `u${hex}`;
                        pos += hex.length;
                    } else throw new Error(`Invalid unicode escape sequence '\\u${hex}' at position ${pos}`);
                } else throw new Error(`Invalid escape sequence '\\${char}' at position ${pos}`);
                escaped = false;
            } else if (char === "\\") escaped = true;
            else if (char === "\"") {
                pos += 1;
                return result;
            } else result += char;
            pos += 1;
        }
        if (escaped) result += "\\";
        return result;
    }
    function parseNumber() {
        const start = pos;
        let numStr = "";
        if (buffer[pos] === "-") {
            numStr += "-";
            pos += 1;
        }
        if (pos < buffer.length && buffer[pos] === "0") {
            numStr += "0";
            pos += 1;
            if (buffer[pos] >= "0" && buffer[pos] <= "9") throw new Error(`Invalid number at position ${start}`);
        }
        if (pos < buffer.length && buffer[pos] >= "1" && buffer[pos] <= "9") while(pos < buffer.length && buffer[pos] >= "0" && buffer[pos] <= "9"){
            numStr += buffer[pos];
            pos += 1;
        }
        if (pos < buffer.length && buffer[pos] === ".") {
            numStr += ".";
            pos += 1;
            while(pos < buffer.length && buffer[pos] >= "0" && buffer[pos] <= "9"){
                numStr += buffer[pos];
                pos += 1;
            }
        }
        if (pos < buffer.length && (buffer[pos] === "e" || buffer[pos] === "E")) {
            numStr += buffer[pos];
            pos += 1;
            if (pos < buffer.length && (buffer[pos] === "+" || buffer[pos] === "-")) {
                numStr += buffer[pos];
                pos += 1;
            }
            while(pos < buffer.length && buffer[pos] >= "0" && buffer[pos] <= "9"){
                numStr += buffer[pos];
                pos += 1;
            }
        }
        if (numStr === "-") return -0;
        const num = Number.parseFloat(numStr);
        if (Number.isNaN(num)) {
            pos = start;
            throw new Error(`Invalid number '${numStr}' at position ${start}`);
        }
        return num;
    }
    function parseValue() {
        skipWhitespace();
        if (pos >= buffer.length) throw new Error(`Unexpected end of input at position ${pos}`);
        const char = buffer[pos];
        if (char === "{") return parseObject();
        if (char === "[") return parseArray();
        if (char === "\"") return parseString();
        if ("null".startsWith(buffer.substring(pos, pos + 4))) {
            pos += Math.min(4, buffer.length - pos);
            return null;
        }
        if ("true".startsWith(buffer.substring(pos, pos + 4))) {
            pos += Math.min(4, buffer.length - pos);
            return true;
        }
        if ("false".startsWith(buffer.substring(pos, pos + 5))) {
            pos += Math.min(5, buffer.length - pos);
            return false;
        }
        if (char === "-" || char >= "0" && char <= "9") return parseNumber();
        throw new Error(`Unexpected character '${char}' at position ${pos}`);
    }
    function parseArray() {
        if (buffer[pos] !== "[") throw new Error(`Expected '[' at position ${pos}, got '${buffer[pos]}'`);
        const arr = [];
        pos += 1;
        skipWhitespace();
        if (pos >= buffer.length) return arr;
        if (buffer[pos] === "]") {
            pos += 1;
            return arr;
        }
        while(pos < buffer.length){
            skipWhitespace();
            if (pos >= buffer.length) return arr;
            arr.push(parseValue());
            skipWhitespace();
            if (pos >= buffer.length) return arr;
            if (buffer[pos] === "]") {
                pos += 1;
                return arr;
            } else if (buffer[pos] === ",") {
                pos += 1;
                continue;
            }
            throw new Error(`Expected ',' or ']' at position ${pos}, got '${buffer[pos]}'`);
        }
        return arr;
    }
    function parseObject() {
        if (buffer[pos] !== "{") throw new Error(`Expected '{' at position ${pos}, got '${buffer[pos]}'`);
        const obj = {};
        pos += 1;
        skipWhitespace();
        if (pos >= buffer.length) return obj;
        if (buffer[pos] === "}") {
            pos += 1;
            return obj;
        }
        while(pos < buffer.length){
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            const key = parseString();
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            if (buffer[pos] !== ":") throw new Error(`Expected ':' at position ${pos}, got '${buffer[pos]}'`);
            pos += 1;
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            obj[key] = parseValue();
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            if (buffer[pos] === "}") {
                pos += 1;
                return obj;
            } else if (buffer[pos] === ",") {
                pos += 1;
                continue;
            }
            throw new Error(`Expected ',' or '}' at position ${pos}, got '${buffer[pos]}'`);
        }
        return obj;
    }
    const value = parseValue();
    skipWhitespace();
    if (pos < buffer.length) throw new Error(`Unexpected character '${buffer[pos]}' at position ${pos}`);
    return value;
}
function parsePartialJson(s) {
    try {
        if (typeof s === "undefined") return null;
        return strictParsePartialJson(s);
    } catch  {
        return null;
    }
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/callbacks.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isTracingEnabled",
    ()=>isTracingEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
;
//#region src/utils/callbacks.ts
const isTracingEnabled = (tracingEnabled)=>{
    if (tracingEnabled !== void 0) return tracingEnabled;
    return !![
        "LANGSMITH_TRACING_V2",
        "LANGCHAIN_TRACING_V2",
        "LANGSMITH_TRACING",
        "LANGCHAIN_TRACING"
    ].find((envVar)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(envVar) === "true");
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/signal.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAbortSignalError",
    ()=>getAbortSignalError,
    "raceWithSignal",
    ()=>raceWithSignal
]);
//#region src/utils/signal.ts
/**
* Race a promise with an abort signal. If the signal is aborted, the promise will
* be rejected with the error from the signal. If the promise is rejected, the signal will be aborted.
*
* @param promise - The promise to race.
* @param signal - The abort signal.
* @returns The result of the promise.
*/ async function raceWithSignal(promise, signal) {
    if (signal === void 0) return promise;
    let listener;
    return Promise.race([
        promise.catch((err)=>{
            if (!signal?.aborted) throw err;
            else return;
        }),
        new Promise((_, reject)=>{
            listener = ()=>{
                reject(getAbortSignalError(signal));
            };
            signal.addEventListener("abort", listener, {
                once: true
            });
            if (signal.aborted) reject(getAbortSignalError(signal));
        })
    ]).finally(()=>signal.removeEventListener("abort", listener));
}
/**
* Get the error from an abort signal. Since you can set the reason to anything,
* we have to do some type gymnastics to get a proper error message.
*
* @param signal - The abort signal.
* @returns The error from the abort signal.
*/ function getAbortSignalError(signal) {
    if (signal?.reason instanceof Error) return signal.reason;
    if (typeof signal?.reason === "string") return new Error(signal.reason);
    return /* @__PURE__ */ new Error("Aborted");
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncGeneratorWithSetup",
    ()=>AsyncGeneratorWithSetup,
    "IterableReadableStream",
    ()=>IterableReadableStream,
    "atee",
    ()=>atee,
    "concat",
    ()=>concat,
    "pipeGeneratorWithSetup",
    ()=>pipeGeneratorWithSetup,
    "stream_exports",
    ()=>stream_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/singletons/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/config.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/signal.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/utils/stream.ts
var stream_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    AsyncGeneratorWithSetup: ()=>AsyncGeneratorWithSetup,
    IterableReadableStream: ()=>IterableReadableStream,
    atee: ()=>atee,
    concat: ()=>concat,
    pipeGeneratorWithSetup: ()=>pipeGeneratorWithSetup
});
var IterableReadableStream = class IterableReadableStream extends ReadableStream {
    reader;
    ensureReader() {
        if (!this.reader) this.reader = this.getReader();
    }
    async next() {
        this.ensureReader();
        try {
            const result = await this.reader.read();
            if (result.done) {
                this.reader.releaseLock();
                return {
                    done: true,
                    value: void 0
                };
            } else return {
                done: false,
                value: result.value
            };
        } catch (e) {
            this.reader.releaseLock();
            throw e;
        }
    }
    async return() {
        this.ensureReader();
        if (this.locked) {
            const cancelPromise = this.reader.cancel();
            this.reader.releaseLock();
            await cancelPromise;
        }
        return {
            done: true,
            value: void 0
        };
    }
    async throw(e) {
        this.ensureReader();
        if (this.locked) {
            const cancelPromise = this.reader.cancel();
            this.reader.releaseLock();
            await cancelPromise;
        }
        throw e;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    async [Symbol.asyncDispose]() {
        await this.return();
    }
    static fromReadableStream(stream) {
        const reader = stream.getReader();
        return new IterableReadableStream({
            start (controller) {
                return pump();
                //TURBOPACK unreachable
                ;
                function pump() {
                    return reader.read().then(({ done, value })=>{
                        if (done) {
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                        return pump();
                    });
                }
            },
            cancel () {
                reader.releaseLock();
            }
        });
    }
    static fromAsyncGenerator(generator) {
        return new IterableReadableStream({
            async pull (controller) {
                const { value, done } = await generator.next();
                if (done) controller.close();
                controller.enqueue(value);
            },
            async cancel (reason) {
                await generator.return(reason);
            }
        });
    }
};
function atee(iter, length = 2) {
    const buffers = Array.from({
        length
    }, ()=>[]);
    return buffers.map(async function* makeIter(buffer) {
        while(true)if (buffer.length === 0) {
            const result = await iter.next();
            for (const buffer of buffers)buffer.push(result);
        } else if (buffer[0].done) return;
        else yield buffer.shift().value;
    });
}
function concat(first, second) {
    if (Array.isArray(first) && Array.isArray(second)) return first.concat(second);
    else if (typeof first === "string" && typeof second === "string") return first + second;
    else if (typeof first === "number" && typeof second === "number") return first + second;
    else if ("concat" in first && typeof first.concat === "function") return first.concat(second);
    else if (typeof first === "object" && typeof second === "object") {
        const chunk = {
            ...first
        };
        for (const [key, value] of Object.entries(second))if (key in chunk && !Array.isArray(chunk[key])) chunk[key] = concat(chunk[key], value);
        else chunk[key] = value;
        return chunk;
    } else throw new Error(`Cannot concat ${typeof first} and ${typeof second}`);
}
var AsyncGeneratorWithSetup = class {
    generator;
    setup;
    config;
    signal;
    firstResult;
    firstResultUsed = false;
    constructor(params){
        this.generator = params.generator;
        this.config = params.config;
        this.signal = params.signal ?? this.config?.signal;
        this.setup = new Promise((resolve, reject)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(params.config), async ()=>{
                this.firstResult = this.signal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["raceWithSignal"])(params.generator.next(), this.signal) : params.generator.next();
                if (params.startSetup) this.firstResult.then(params.startSetup).then(resolve, reject);
                else this.firstResult.then((_result)=>resolve(void 0), reject);
            }, true);
        });
    }
    async next(...args) {
        this.signal?.throwIfAborted();
        if (!this.firstResultUsed) {
            this.firstResultUsed = true;
            return this.firstResult;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(this.config), this.signal ? async ()=>{
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["raceWithSignal"])(this.generator.next(...args), this.signal);
        } : async ()=>{
            return this.generator.next(...args);
        }, true);
    }
    async return(value) {
        return this.generator.return(value);
    }
    async throw(e) {
        return this.generator.throw(e);
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    async [Symbol.asyncDispose]() {
        await this.return();
    }
};
async function pipeGeneratorWithSetup(to, generator, startSetup, signal, ...args) {
    const gen = new AsyncGeneratorWithSetup({
        generator,
        startSetup,
        signal
    });
    const setup = await gen.setup;
    return {
        output: to(gen, setup, ...args),
        setup
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PatchError",
    ()=>PatchError,
    "_deepClone",
    ()=>_deepClone,
    "_objectKeys",
    ()=>_objectKeys,
    "escapePathComponent",
    ()=>escapePathComponent,
    "hasOwnProperty",
    ()=>hasOwnProperty,
    "hasUndefined",
    ()=>hasUndefined,
    "isInteger",
    ()=>isInteger,
    "unescapePathComponent",
    ()=>unescapePathComponent
]);
//#region src/utils/fast-json-patch/src/helpers.ts
/*!
* https://github.com/Starcounter-Jack/JSON-Patch
* (c) 2017-2022 Joachim Wester
* MIT licensed
*/ const _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
}
function _objectKeys(obj) {
    if (Array.isArray(obj)) {
        const keys = new Array(obj.length);
        for(let k = 0; k < keys.length; k++)keys[k] = "" + k;
        return keys;
    }
    if (Object.keys) return Object.keys(obj);
    let keys = [];
    for(let i in obj)if (hasOwnProperty(obj, i)) keys.push(i);
    return keys;
}
/**
* Deeply clone the object.
* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
* @param  {any} obj value to clone
* @return {any} cloned obj
*/ function _deepClone(obj) {
    switch(typeof obj){
        case "object":
            return JSON.parse(JSON.stringify(obj));
        case "undefined":
            return null;
        default:
            return obj;
    }
}
function isInteger(str) {
    let i = 0;
    const len = str.length;
    let charCode;
    while(i < len){
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
/**
* Escapes a json pointer path
* @param path The raw pointer
* @return the Escaped path
*/ function escapePathComponent(path) {
    if (path.indexOf("/") === -1 && path.indexOf("~") === -1) return path;
    return path.replace(/~/g, "~0").replace(/\//g, "~1");
}
/**
* Unescapes a json pointer path
* @param path The escaped pointer
* @return The unescaped path
*/ function unescapePathComponent(path) {
    return path.replace(/~1/g, "/").replace(/~0/g, "~");
}
/**
* Recursively checks whether an object has any undefined values inside.
*/ function hasUndefined(obj) {
    if (obj === void 0) return true;
    if (obj) {
        if (Array.isArray(obj)) {
            for(let i = 0, len = obj.length; i < len; i++)if (hasUndefined(obj[i])) return true;
        } else if (typeof obj === "object") {
            const objKeys = _objectKeys(obj);
            const objKeysLength = objKeys.length;
            for(var i = 0; i < objKeysLength; i++)if (hasUndefined(obj[objKeys[i]])) return true;
        }
    }
    return false;
}
function patchErrorMessageFormatter(message, args) {
    const messageParts = [
        message
    ];
    for(const key in args){
        const value = typeof args[key] === "object" ? JSON.stringify(args[key], null, 2) : args[key];
        if (typeof value !== "undefined") messageParts.push(`${key}: ${value}`);
    }
    return messageParts.join("\n");
}
var PatchError = class extends Error {
    name;
    index;
    operation;
    tree;
    constructor(message, name, index, operation, tree){
        super(patchErrorMessageFormatter(message, {
            name,
            index,
            operation,
            tree
        }));
        this.name = name;
        this.index = index;
        this.operation = operation;
        this.tree = tree;
        Object.setPrototypeOf(this, new.target.prototype);
        this.message = patchErrorMessageFormatter(message, {
            name,
            index,
            operation,
            tree
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonPatchError",
    ()=>JsonPatchError,
    "_areEquals",
    ()=>_areEquals,
    "applyOperation",
    ()=>applyOperation,
    "applyPatch",
    ()=>applyPatch,
    "applyReducer",
    ()=>applyReducer,
    "core_exports",
    ()=>core_exports,
    "deepClone",
    ()=>deepClone,
    "getValueByPointer",
    ()=>getValueByPointer,
    "validate",
    ()=>validate,
    "validator",
    ()=>validator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/fast-json-patch/src/core.ts
var core_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    JsonPatchError: ()=>JsonPatchError,
    _areEquals: ()=>_areEquals,
    applyOperation: ()=>applyOperation,
    applyPatch: ()=>applyPatch,
    applyReducer: ()=>applyReducer,
    deepClone: ()=>deepClone,
    getValueByPointer: ()=>getValueByPointer,
    validate: ()=>validate,
    validator: ()=>validator
});
/*!
* https://github.com/Starcounter-Jack/JSON-Patch
* (c) 2013-2021 Joachim Wester
* MIT license
*/ const JsonPatchError = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PatchError"];
const deepClone = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"];
const objOps = {
    add: function(obj, key, document) {
        if (key === "__proto__" || key === "constructor") throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor` prop is banned for security reasons");
        obj[key] = this.value;
        return {
            newDocument: document
        };
    },
    remove: function(obj, key, document) {
        if (key === "__proto__" || key === "constructor") throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor` prop is banned for security reasons");
        var removed = obj[key];
        delete obj[key];
        return {
            newDocument: document,
            removed
        };
    },
    replace: function(obj, key, document) {
        if (key === "__proto__" || key === "constructor") throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor` prop is banned for security reasons");
        var removed = obj[key];
        obj[key] = this.value;
        return {
            newDocument: document,
            removed
        };
    },
    move: function(obj, key, document) {
        let removed = getValueByPointer(document, this.path);
        if (removed) removed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(removed);
        const originalValue = applyOperation(document, {
            op: "remove",
            path: this.from
        }).removed;
        applyOperation(document, {
            op: "add",
            path: this.path,
            value: originalValue
        });
        return {
            newDocument: document,
            removed
        };
    },
    copy: function(obj, key, document) {
        const valueToCopy = getValueByPointer(document, this.from);
        applyOperation(document, {
            op: "add",
            path: this.path,
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(valueToCopy)
        });
        return {
            newDocument: document
        };
    },
    test: function(obj, key, document) {
        return {
            newDocument: document,
            test: _areEquals(obj[key], this.value)
        };
    },
    _get: function(obj, key, document) {
        this.value = obj[key];
        return {
            newDocument: document
        };
    }
};
var arrOps = {
    add: function(arr, i, document) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteger"])(i)) arr.splice(i, 0, this.value);
        else arr[i] = this.value;
        return {
            newDocument: document,
            index: i
        };
    },
    remove: function(arr, i, document) {
        return {
            newDocument: document,
            removed: arr.splice(i, 1)[0]
        };
    },
    replace: function(arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return {
            newDocument: document,
            removed
        };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
};
/**
* Retrieves a value from a JSON document by a JSON pointer.
* Returns the value.
*
* @param document The document to get the value from
* @param pointer an escaped JSON pointer
* @return The retrieved value
*/ function getValueByPointer(document, pointer) {
    if (pointer == "") return document;
    var getOriginalDestination = {
        op: "_get",
        path: pointer
    };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
}
/**
* Apply a single JSON Patch Operation on a JSON document.
* Returns the {newDocument, result} of the operation.
* It modifies the `document` and `operation` objects - it gets the values by reference.
* If you would like to avoid touching your values, clone them:
* `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
*
* @param document The document to patch
* @param operation The operation to apply
* @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
* @param mutateDocument Whether to mutate the original document or clone it before applying
* @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
* @return `{newDocument, result}` after the operation
*/ function applyOperation(document, operation, validateOperation = false, mutateDocument = true, banPrototypeModifications = true, index = 0) {
    if (validateOperation) {
        if (typeof validateOperation == "function") validateOperation(operation, 0, document, operation.path);
        else validator(operation, 0);
    }
    if (operation.path === "") {
        let returnValue = {
            newDocument: document
        };
        if (operation.op === "add") {
            returnValue.newDocument = operation.value;
            return returnValue;
        } else if (operation.op === "replace") {
            returnValue.newDocument = operation.value;
            returnValue.removed = document;
            return returnValue;
        } else if (operation.op === "move" || operation.op === "copy") {
            returnValue.newDocument = getValueByPointer(document, operation.from);
            if (operation.op === "move") returnValue.removed = document;
            return returnValue;
        } else if (operation.op === "test") {
            returnValue.test = _areEquals(document, operation.value);
            if (returnValue.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
            returnValue.newDocument = document;
            return returnValue;
        } else if (operation.op === "remove") {
            returnValue.removed = document;
            returnValue.newDocument = null;
            return returnValue;
        } else if (operation.op === "_get") {
            operation.value = document;
            return returnValue;
        } else if (validateOperation) throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
        else return returnValue;
    } else {
        if (!mutateDocument) document = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(document);
        const keys = (operation.path || "").split("/");
        let obj = document;
        let t = 1;
        let len = keys.length;
        let existingPathFragment = void 0;
        let key;
        let validateFunction;
        if (typeof validateOperation == "function") validateFunction = validateOperation;
        else validateFunction = validator;
        while(true){
            key = keys[t];
            if (key && key.indexOf("~") != -1) key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unescapePathComponent"])(key);
            if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t > 0 && keys[t - 1] == "constructor")) throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
            if (validateOperation) {
                if (existingPathFragment === void 0) {
                    if (obj[key] === void 0) existingPathFragment = keys.slice(0, t).join("/");
                    else if (t == len - 1) existingPathFragment = operation.path;
                    if (existingPathFragment !== void 0) validateFunction(operation, 0, document, existingPathFragment);
                }
            }
            t++;
            if (Array.isArray(obj)) {
                if (key === "-") key = obj.length;
                else if (validateOperation && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteger"])(key)) throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteger"])(key)) key = ~~key;
                if (t >= len) {
                    if (validateOperation && operation.op === "add" && key > obj.length) throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
                    const returnValue = arrOps[operation.op].call(operation, obj, key, document);
                    if (returnValue.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
                    return returnValue;
                }
            } else if (t >= len) {
                const returnValue = objOps[operation.op].call(operation, obj, key, document);
                if (returnValue.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
                return returnValue;
            }
            obj = obj[key];
            if (validateOperation && t < len && (!obj || typeof obj !== "object")) throw new JsonPatchError("Cannot perform operation at the desired path", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
        }
    }
}
/**
* Apply a full JSON Patch array on a JSON document.
* Returns the {newDocument, result} of the patch.
* It modifies the `document` object and `patch` - it gets the values by reference.
* If you would like to avoid touching your values, clone them:
* `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
*
* @param document The document to patch
* @param patch The patch to apply
* @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
* @param mutateDocument Whether to mutate the original document or clone it before applying
* @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
* @return An array of `{newDocument, result}` after the patch
*/ function applyPatch(document, patch, validateOperation, mutateDocument = true, banPrototypeModifications = true) {
    if (validateOperation) {
        if (!Array.isArray(patch)) throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
    if (!mutateDocument) document = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(document);
    const results = new Array(patch.length);
    for(let i = 0, length = patch.length; i < length; i++){
        results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
        document = results[i].newDocument;
    }
    results.newDocument = document;
    return results;
}
/**
* Apply a single JSON Patch Operation on a JSON document.
* Returns the updated document.
* Suitable as a reducer.
*
* @param document The document to patch
* @param operation The operation to apply
* @return The updated document
*/ function applyReducer(document, operation, index) {
    const operationResult = applyOperation(document, operation);
    if (operationResult.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
    return operationResult.newDocument;
}
/**
* Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
* @param {object} operation - operation object (patch)
* @param {number} index - index of operation in the sequence
* @param {object} [document] - object where the operation is supposed to be applied
* @param {string} [existingPathFragment] - comes along with `document`
*/ function validator(operation, index, document, existingPathFragment) {
    if (typeof operation !== "object" || operation === null || Array.isArray(operation)) throw new JsonPatchError("Operation is not an object", "OPERATION_NOT_AN_OBJECT", index, operation, document);
    else if (!objOps[operation.op]) throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
    else if (typeof operation.path !== "string") throw new JsonPatchError("Operation `path` property is not a string", "OPERATION_PATH_INVALID", index, operation, document);
    else if (operation.path.indexOf("/") !== 0 && operation.path.length > 0) throw new JsonPatchError("Operation `path` property must start with \"/\"", "OPERATION_PATH_INVALID", index, operation, document);
    else if ((operation.op === "move" || operation.op === "copy") && typeof operation.from !== "string") throw new JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)", "OPERATION_FROM_REQUIRED", index, operation, document);
    else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && operation.value === void 0) throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_REQUIRED", index, operation, document);
    else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasUndefined"])(operation.value)) throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED", index, operation, document);
    else if (document) {
        if (operation.op == "add") {
            var pathLen = operation.path.split("/").length;
            var existingPathLen = existingPathFragment.split("/").length;
            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) throw new JsonPatchError("Cannot perform an `add` operation at the desired path", "OPERATION_PATH_CANNOT_ADD", index, operation, document);
        } else if (operation.op === "replace" || operation.op === "remove" || operation.op === "_get") {
            if (operation.path !== existingPathFragment) throw new JsonPatchError("Cannot perform the operation at a path that does not exist", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
        } else if (operation.op === "move" || operation.op === "copy") {
            var error = validate([
                {
                    op: "_get",
                    path: operation.from,
                    value: void 0
                }
            ], document);
            if (error && error.name === "OPERATION_PATH_UNRESOLVABLE") throw new JsonPatchError("Cannot perform the operation from a path that does not exist", "OPERATION_FROM_UNRESOLVABLE", index, operation, document);
        }
    }
}
/**
* Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
* If error is encountered, returns a JsonPatchError object
* @param sequence
* @param document
* @returns {JsonPatchError|undefined}
*/ function validate(sequence, document, externalValidator) {
    try {
        if (!Array.isArray(sequence)) throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
        if (document) applyPatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(document), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(sequence), externalValidator || true);
        else {
            externalValidator = externalValidator || validator;
            for(var i = 0; i < sequence.length; i++)externalValidator(sequence[i], i, document, void 0);
        }
    } catch (e) {
        if (e instanceof JsonPatchError) return e;
        else throw e;
    }
}
function _areEquals(a, b) {
    if (a === b) return true;
    if (a && b && typeof a == "object" && typeof b == "object") {
        var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
        if (arrA && arrB) {
            length = a.length;
            if (length != b.length) return false;
            for(i = length; i-- !== 0;)if (!_areEquals(a[i], b[i])) return false;
            return true;
        }
        if (arrA != arrB) return false;
        var keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for(i = length; i-- !== 0;)if (!b.hasOwnProperty(keys[i])) return false;
        for(i = length; i-- !== 0;){
            key = keys[i];
            if (!_areEquals(a[key], b[key])) return false;
        }
        return true;
    }
    return a !== a && b !== b;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compare",
    ()=>compare
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/fast-json-patch/src/duplex.ts
/*!
* https://github.com/Starcounter-Jack/JSON-Patch
* (c) 2013-2021 Joachim Wester
* MIT license
*/ function _generate(mirror, obj, patches, path, invertible) {
    if (obj === mirror) return;
    if (typeof obj.toJSON === "function") obj = obj.toJSON();
    var newKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_objectKeys"])(obj);
    var oldKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_objectKeys"])(mirror);
    var deleted = false;
    for(var t = oldKeys.length - 1; t >= 0; t--){
        var key = oldKeys[t];
        var oldVal = mirror[key];
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasOwnProperty"])(obj, key) && !(obj[key] === void 0 && oldVal !== void 0 && Array.isArray(obj) === false)) {
            var newVal = obj[key];
            if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null && Array.isArray(oldVal) === Array.isArray(newVal)) _generate(oldVal, newVal, patches, path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["escapePathComponent"])(key), invertible);
            else if (oldVal !== newVal) {
                if (invertible) patches.push({
                    op: "test",
                    path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(oldVal)
                });
                patches.push({
                    op: "replace",
                    path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(newVal)
                });
            }
        } else if (Array.isArray(mirror) === Array.isArray(obj)) {
            if (invertible) patches.push({
                op: "test",
                path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
                value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(oldVal)
            });
            patches.push({
                op: "remove",
                path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["escapePathComponent"])(key)
            });
            deleted = true;
        } else {
            if (invertible) patches.push({
                op: "test",
                path,
                value: mirror
            });
            patches.push({
                op: "replace",
                path,
                value: obj
            });
        }
    }
    if (!deleted && newKeys.length == oldKeys.length) return;
    for(var t = 0; t < newKeys.length; t++){
        var key = newKeys[t];
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasOwnProperty"])(mirror, key) && obj[key] !== void 0) patches.push({
            op: "add",
            path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_deepClone"])(obj[key])
        });
    }
}
/**
* Create an array of patches from the differences in two objects
*/ function compare(tree1, tree2, invertible = false) {
    var patches = [];
    _generate(tree1, tree2, patches, "", invertible);
    return patches;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)");
;
;
;
({
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["core_exports"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/is-network-error/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>isNetworkError
]);
//#region src/utils/is-network-error/index.js
const objectToString = Object.prototype.toString;
const isError = (value)=>objectToString.call(value) === "[object Error]";
const errorMessages = /* @__PURE__ */ new Set([
    "network error",
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed",
    "fetch failed",
    "terminated",
    " A network error occurred.",
    "Network connection lost"
]);
function isNetworkError(error) {
    if (!(error && isError(error) && error.name === "TypeError" && typeof error.message === "string")) return false;
    const { message, stack } = error;
    if (message === "Load failed") return stack === void 0 || "__sentry_captured__" in error;
    if (message.startsWith("error sending request for url")) return true;
    return errorMessages.has(message);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/p-retry/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AbortError",
    ()=>AbortError,
    "default",
    ()=>pRetry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$is$2d$network$2d$error$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/is-network-error/index.js [app-rsc] (ecmascript)");
;
//#region src/utils/p-retry/index.js
function validateRetries(retries) {
    if (typeof retries === "number") {
        if (retries < 0) throw new TypeError("Expected `retries` to be a non-negative number.");
        if (Number.isNaN(retries)) throw new TypeError("Expected `retries` to be a valid number or Infinity, got NaN.");
    } else if (retries !== void 0) throw new TypeError("Expected `retries` to be a number or Infinity.");
}
function validateNumberOption(name, value, { min = 0, allowInfinity = false } = {}) {
    if (value === void 0) return;
    if (typeof value !== "number" || Number.isNaN(value)) throw new TypeError(`Expected \`${name}\` to be a number${allowInfinity ? " or Infinity" : ""}.`);
    if (!allowInfinity && !Number.isFinite(value)) throw new TypeError(`Expected \`${name}\` to be a finite number.`);
    if (value < min) throw new TypeError(`Expected \`${name}\` to be \u2265 ${min}.`);
}
var AbortError = class extends Error {
    constructor(message){
        super();
        if (message instanceof Error) {
            this.originalError = message;
            ({ message } = message);
        } else {
            this.originalError = new Error(message);
            this.originalError.stack = this.stack;
        }
        this.name = "AbortError";
        this.message = message;
    }
};
function calculateDelay(retriesConsumed, options) {
    const attempt = Math.max(1, retriesConsumed + 1);
    const random = options.randomize ? Math.random() + 1 : 1;
    let timeout = Math.round(random * options.minTimeout * options.factor ** (attempt - 1));
    timeout = Math.min(timeout, options.maxTimeout);
    return timeout;
}
function calculateRemainingTime(start, max) {
    if (!Number.isFinite(max)) return max;
    return max - (performance.now() - start);
}
async function onAttemptFailure({ error, attemptNumber, retriesConsumed, startTime, options }) {
    const normalizedError = error instanceof Error ? error : /* @__PURE__ */ new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`);
    if (normalizedError instanceof AbortError) throw normalizedError.originalError;
    const retriesLeft = Number.isFinite(options.retries) ? Math.max(0, options.retries - retriesConsumed) : options.retries;
    const maxRetryTime = options.maxRetryTime ?? Number.POSITIVE_INFINITY;
    const context = Object.freeze({
        error: normalizedError,
        attemptNumber,
        retriesLeft,
        retriesConsumed
    });
    await options.onFailedAttempt(context);
    if (calculateRemainingTime(startTime, maxRetryTime) <= 0) throw normalizedError;
    const consumeRetry = await options.shouldConsumeRetry(context);
    const remainingTime = calculateRemainingTime(startTime, maxRetryTime);
    if (remainingTime <= 0 || retriesLeft <= 0) throw normalizedError;
    if (normalizedError instanceof TypeError && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$is$2d$network$2d$error$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(normalizedError)) {
        if (consumeRetry) throw normalizedError;
        options.signal?.throwIfAborted();
        return false;
    }
    if (!await options.shouldRetry(context)) throw normalizedError;
    if (!consumeRetry) {
        options.signal?.throwIfAborted();
        return false;
    }
    let delayTime = calculateDelay(retriesConsumed, options);
    const retryAfterMs = typeof normalizedError.retryAfterMs === "number" && normalizedError.retryAfterMs >= 0 ? normalizedError.retryAfterMs : void 0;
    if (retryAfterMs !== void 0) delayTime = Math.max(delayTime, retryAfterMs);
    const finalDelay = Math.min(delayTime, remainingTime);
    if (finalDelay > 0) await new Promise((resolve, reject)=>{
        const onAbort = ()=>{
            clearTimeout(timeoutToken);
            options.signal?.removeEventListener("abort", onAbort);
            reject(options.signal.reason);
        };
        const timeoutToken = setTimeout(()=>{
            options.signal?.removeEventListener("abort", onAbort);
            resolve();
        }, finalDelay);
        if (options.unref) timeoutToken.unref?.();
        options.signal?.addEventListener("abort", onAbort, {
            once: true
        });
    });
    options.signal?.throwIfAborted();
    return true;
}
async function pRetry(input, options = {}) {
    options = {
        ...options
    };
    validateRetries(options.retries);
    if (Object.hasOwn(options, "forever")) throw new Error("The `forever` option is no longer supported. For many use-cases, you can set `retries: Infinity` instead.");
    options.retries ??= 10;
    options.factor ??= 2;
    options.minTimeout ??= 1e3;
    options.maxTimeout ??= Number.POSITIVE_INFINITY;
    options.maxRetryTime ??= Number.POSITIVE_INFINITY;
    options.randomize ??= false;
    options.onFailedAttempt ??= ()=>{};
    options.shouldRetry ??= ()=>true;
    options.shouldConsumeRetry ??= ()=>true;
    validateNumberOption("factor", options.factor, {
        min: 0,
        allowInfinity: false
    });
    validateNumberOption("minTimeout", options.minTimeout, {
        min: 0,
        allowInfinity: false
    });
    validateNumberOption("maxTimeout", options.maxTimeout, {
        min: 0,
        allowInfinity: true
    });
    validateNumberOption("maxRetryTime", options.maxRetryTime, {
        min: 0,
        allowInfinity: true
    });
    if (!(options.factor > 0)) options.factor = 1;
    options.signal?.throwIfAborted();
    let attemptNumber = 0;
    let retriesConsumed = 0;
    const startTime = performance.now();
    while(Number.isFinite(options.retries) ? retriesConsumed <= options.retries : true){
        attemptNumber++;
        try {
            options.signal?.throwIfAborted();
            const result = await input(attemptNumber);
            options.signal?.throwIfAborted();
            return result;
        } catch (error) {
            if (await onAttemptFailure({
                error,
                attemptNumber,
                retriesConsumed,
                startTime,
                options
            })) retriesConsumed++;
        }
    }
    throw new Error("Retry attempts exhausted without throwing an error.");
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/async_caller.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncCaller",
    ()=>AsyncCaller,
    "async_caller_exports",
    ()=>async_caller_exports,
    "classifyRateLimitError",
    ()=>classifyRateLimitError,
    "parseRetryAfterMs",
    ()=>parseRetryAfterMs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/signal.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$p$2d$retry$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/p-retry/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/index.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/utils/async_caller.ts
var async_caller_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    AsyncCaller: ()=>AsyncCaller,
    classifyRateLimitError: ()=>classifyRateLimitError,
    parseRetryAfterMs: ()=>parseRetryAfterMs
});
const STATUS_NO_RETRY = [
    400,
    401,
    402,
    403,
    404,
    405,
    406,
    407,
    409,
    413
];
const RETRY_AFTER_AUTO_RETRY_THRESHOLD_MS = 6e4;
const QUOTA_EXHAUSTED_MESSAGE_PATTERNS = [
    /insufficient[_ -]?quota/i,
    /exceeded (?:your|the current|the available).+quota/i,
    /usage quota/i,
    /quota (?:has been )?exhausted/i,
    /billing/i,
    /credit balance/i,
    /out of credits/i,
    /will reset at/i
];
const RETRY_AFTER_MESSAGE_PATTERN = /(?:try again in|retry after)\s+(\d+(?:\.\d+)?)\s*(milliseconds?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)\b/i;
function getResponseStatus(error) {
    return typeof error === "object" && error !== null && "response" in error && typeof error.response === "object" && error.response !== null && "status" in error.response && typeof error.response.status === "number" ? error.response.status : void 0;
}
function getDirectStatus(error) {
    if (typeof error !== "object" || error === null) return;
    if ("status" in error && typeof error.status === "number") return error.status;
    if ("statusCode" in error && typeof error.statusCode === "number") return error.statusCode;
}
function getErrorMessage(error) {
    return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string" ? error.message : void 0;
}
function getErrorCode(error) {
    if (typeof error !== "object" || error === null) return;
    if ("code" in error && typeof error.code === "string") return error.code;
    return "error" in error && typeof error.error === "object" && error.error !== null && "code" in error.error && typeof error.error.code === "string" ? error.error.code : void 0;
}
function _getRetryAfterHeader(error) {
    if (error?.headers) {
        if (typeof error.headers.get === "function") return error.headers.get("retry-after");
        return error.headers["retry-after"] ?? error.headers["Retry-After"];
    }
    if (error?.response?.headers) {
        if (typeof error.response.headers.get === "function") return error.response.headers.get("retry-after");
        return error.response.headers["retry-after"] ?? error.response.headers["Retry-After"];
    }
}
function parseRetryAfterFromMessageMs(message) {
    if (message == null) return;
    const match = RETRY_AFTER_MESSAGE_PATTERN.exec(message);
    if (!match) return;
    const rawValue = Number(match[1]);
    const unit = match[2]?.toLowerCase();
    if (Number.isNaN(rawValue) || !unit) return;
    if (unit === "ms" || unit.startsWith("millisecond")) return rawValue;
    if (unit === "m" || unit.startsWith("min")) return rawValue * 6e4;
    if (unit === "h" || unit.startsWith("hr") || unit.startsWith("hour")) return rawValue * 36e5;
    return rawValue * 1e3;
}
function coerceError(error, fallbackMessage) {
    if (error instanceof Error) return error;
    const coerced = new Error(fallbackMessage);
    if (typeof error === "object" && error !== null) Object.assign(coerced, error);
    return coerced;
}
function setRateLimitMetadata(error, classification) {
    if (typeof error !== "object" || error === null) return;
    const mutableError = error;
    mutableError.rateLimitType = classification.action;
    mutableError.rateLimitReason = classification.reason;
    if (classification.retryAfterMs !== void 0) mutableError.retryAfterMs = classification.retryAfterMs;
}
function parseRetryAfterMs(headerValue) {
    if (headerValue == null) return;
    const trimmed = headerValue.trim();
    if (!trimmed) return;
    const seconds = Number(trimmed);
    if (!Number.isNaN(seconds) && seconds >= 0) return seconds * 1e3;
    const date = Date.parse(trimmed);
    if (!Number.isNaN(date)) {
        const delayMs = date - Date.now();
        return delayMs > 0 ? delayMs : 0;
    }
}
function classifyRateLimitError(error) {
    if ((getResponseStatus(error) ?? getDirectStatus(error)) !== 429) return;
    if (getErrorCode(error) === "insufficient_quota") return {
        action: "stop",
        reason: "insufficient_quota"
    };
    const message = getErrorMessage(error);
    if (message && QUOTA_EXHAUSTED_MESSAGE_PATTERNS.some((pattern)=>pattern.test(message))) return {
        action: "stop",
        reason: "quota_message"
    };
    const retryAfterMs = parseRetryAfterMs(_getRetryAfterHeader(error)) ?? parseRetryAfterFromMessageMs(message);
    if (retryAfterMs !== void 0) {
        if (retryAfterMs <= RETRY_AFTER_AUTO_RETRY_THRESHOLD_MS) return {
            action: "wait",
            retryAfterMs,
            reason: "retry_after_hint"
        };
        return {
            action: "capacity",
            retryAfterMs,
            reason: "retry_after_too_large"
        };
    }
    return {
        action: "capacity",
        reason: "headerless_429"
    };
}
/**
* The default failed attempt handler for the AsyncCaller.
* @param error - The error to handle.
* @returns void
*/ const defaultFailedAttemptHandler = (error)=>{
    if (typeof error !== "object" || error === null) return;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRetryable"])(error) === false) throw error;
    if ("message" in error && typeof error.message === "string" && (error.message.startsWith("Cancel") || error.message.startsWith("AbortError")) || "name" in error && typeof error.name === "string" && error.name === "AbortError") throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stampRetryable"])(error, false);
    if ("code" in error && typeof error.code === "string" && error.code === "ECONNABORTED") throw error;
    const status = getResponseStatus(error) ?? getDirectStatus(error);
    if (status && STATUS_NO_RETRY.includes(+status)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stampRetryable"])(error, false);
    if (getErrorCode(error) === "insufficient_quota") {
        const err = coerceError(error, getErrorMessage(error) ?? "Insufficient quota");
        err.name = "InsufficientQuotaError";
        setRateLimitMetadata(err, {
            action: "stop",
            reason: "insufficient_quota"
        });
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stampRetryable"])(err, false);
    }
    const rateLimitClassification = classifyRateLimitError(error);
    if (rateLimitClassification) {
        if (rateLimitClassification.action === "wait") {
            setRateLimitMetadata(error, rateLimitClassification);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stampRetryable"])(error, true);
            return;
        }
        const err = coerceError(error, getErrorMessage(error) ?? "Rate limit exceeded");
        if (err.name === "Error") err.name = rateLimitClassification.action === "stop" ? "RateLimitQuotaExhaustedError" : "RateLimitCapacityError";
        setRateLimitMetadata(err, rateLimitClassification);
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stampRetryable"])(err, rateLimitClassification.action !== "stop");
    }
};
/**
* A class that can be used to make async calls with concurrency and retry logic.
*
* This is useful for making calls to any kind of "expensive" external resource,
* be it because it's rate-limited, subject to network issues, etc.
*
* Concurrent calls are limited by the `maxConcurrency` parameter, which defaults
* to `Infinity`. This means that by default, all calls will be made in parallel.
*
* Retries are limited by the `maxRetries` parameter, which defaults to 6. This
* means that by default, each call will be retried up to 6 times, with an
* exponential backoff between each attempt.
*/ var AsyncCaller = class {
    maxConcurrency;
    maxRetries;
    onFailedAttempt;
    queue;
    constructor(params){
        this.maxConcurrency = params.maxConcurrency ?? Infinity;
        this.maxRetries = params.maxRetries ?? 6;
        this.onFailedAttempt = params.onFailedAttempt ?? defaultFailedAttemptHandler;
        const PQueue = "default" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].default : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$6$2e$6$2e$2$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
        this.queue = new PQueue({
            concurrency: this.maxConcurrency
        });
    }
    async call(callable, ...args) {
        return this.callWithRetries(this.maxRetries, callable, args);
    }
    callWithRetries(retries, callable, args) {
        return this.queue.add(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$p$2d$retry$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(()=>callable(...args).catch((error)=>{
                    if (error instanceof Error) throw error;
                    else throw new Error(error);
                }), {
                onFailedAttempt: ({ error })=>this.onFailedAttempt?.(error),
                retries,
                randomize: true
            }), {
            throwOnTimeout: true
        });
    }
    callWithOptions(options, callable, ...args) {
        const retries = options.maxRetries ?? this.maxRetries;
        if (options.signal) {
            let listener;
            return Promise.race([
                this.callWithRetries(retries, callable, args),
                new Promise((_, reject)=>{
                    listener = ()=>{
                        reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAbortSignalError"])(options.signal));
                    };
                    options.signal?.addEventListener("abort", listener, {
                        once: true
                    });
                })
            ]).finally(()=>{
                if (options.signal && listener) options.signal.removeEventListener("abort", listener);
            });
        }
        return this.callWithRetries(retries, callable, args);
    }
    fetch(...args) {
        return this.call(()=>fetch(...args).then((res)=>res.ok ? res : Promise.reject(res)));
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/standard_schema.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isSerializableSchema",
    ()=>isSerializableSchema,
    "isStandardJsonSchema",
    ()=>isStandardJsonSchema,
    "isStandardSchema",
    ()=>isStandardSchema,
    "standard_schema_exports",
    ()=>standard_schema_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/utils/standard_schema.ts
var standard_schema_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    isSerializableSchema: ()=>isSerializableSchema,
    isStandardJsonSchema: ()=>isStandardJsonSchema,
    isStandardSchema: ()=>isStandardSchema
});
/**
* Type guard for Standard Schema V1. Returns true if the value has a `~standard.validate`
* interface, indicating it can validate unknown values at runtime (e.g. for parsing LLM output).
*/ function isStandardSchema(schema) {
    return (typeof schema === "object" || typeof schema === "function") && schema !== null && "~standard" in schema && typeof schema["~standard"] === "object" && schema["~standard"] !== null && "validate" in schema["~standard"];
}
/**
* Type guard for Standard JSON Schema V1. Returns true if the value has a `~standard.jsonSchema`
* interface, indicating it can be converted to a JSON Schema object (e.g. for sending as a tool
* definition to an LLM).
*/ function isStandardJsonSchema(schema) {
    return (typeof schema === "object" || typeof schema === "function") && schema !== null && "~standard" in schema && typeof schema["~standard"] === "object" && schema["~standard"] !== null && "jsonSchema" in schema["~standard"];
}
/**
* Type guard for Standard Schema V1. Returns true if the value has a `~standard.validate` interface,
* indicating it can validate unknown values at runtime (e.g. for parsing LLM output).
*/ function isSerializableSchema(schema) {
    return isStandardSchema(schema) && isStandardJsonSchema(schema);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extendInteropZodObject",
    ()=>extendInteropZodObject,
    "getInteropZodDefaultGetter",
    ()=>getInteropZodDefaultGetter,
    "getInteropZodObjectShape",
    ()=>getInteropZodObjectShape,
    "getSchemaDescription",
    ()=>getSchemaDescription,
    "interopParse",
    ()=>interopParse,
    "interopParseAsync",
    ()=>interopParseAsync,
    "interopSafeParse",
    ()=>interopSafeParse,
    "interopSafeParseAsync",
    ()=>interopSafeParseAsync,
    "interopZodObjectMakeFieldsOptional",
    ()=>interopZodObjectMakeFieldsOptional,
    "interopZodObjectPartial",
    ()=>interopZodObjectPartial,
    "interopZodObjectPassthrough",
    ()=>interopZodObjectPassthrough,
    "interopZodObjectStrict",
    ()=>interopZodObjectStrict,
    "interopZodTransformInputSchema",
    ()=>interopZodTransformInputSchema,
    "isInteropZodError",
    ()=>isInteropZodError,
    "isInteropZodLiteral",
    ()=>isInteropZodLiteral,
    "isInteropZodObject",
    ()=>isInteropZodObject,
    "isInteropZodSchema",
    ()=>isInteropZodSchema,
    "isShapelessZodSchema",
    ()=>isShapelessZodSchema,
    "isSimpleStringZodSchema",
    ()=>isSimpleStringZodSchema,
    "isZodArrayV4",
    ()=>isZodArrayV4,
    "isZodLiteralV3",
    ()=>isZodLiteralV3,
    "isZodLiteralV4",
    ()=>isZodLiteralV4,
    "isZodNullableV4",
    ()=>isZodNullableV4,
    "isZodObjectV3",
    ()=>isZodObjectV3,
    "isZodObjectV4",
    ()=>isZodObjectV4,
    "isZodOptionalV4",
    ()=>isZodOptionalV4,
    "isZodSchema",
    ()=>isZodSchema,
    "isZodSchemaV3",
    ()=>isZodSchemaV3,
    "isZodSchemaV4",
    ()=>isZodSchemaV4
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/schemas.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/parse.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__util$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js [app-rsc] (ecmascript) <export * as util>");
;
//#region src/utils/types/zod.ts
function isZodSchemaV4(schema) {
    if (typeof schema !== "object" || schema === null) return false;
    const obj = schema;
    if (!("_zod" in obj)) return false;
    const zod = obj._zod;
    return typeof zod === "object" && zod !== null && "def" in zod;
}
function isZodSchemaV3(schema) {
    if (typeof schema !== "object" || schema === null) return false;
    const obj = schema;
    if (!("_def" in obj) || "_zod" in obj) return false;
    const def = obj._def;
    return typeof def === "object" && def != null && "typeName" in def;
}
/** Backward compatible isZodSchema for Zod 3 */ function isZodSchema(schema) {
    if (isZodSchemaV4(schema)) console.warn("[WARNING] Attempting to use Zod 4 schema in a context where Zod 3 schema is expected. This may cause unexpected behavior.");
    return isZodSchemaV3(schema);
}
/**
* Given either a Zod schema, or plain object, determine if the input is a Zod schema.
*
* @param {unknown} input
* @returns {boolean} Whether or not the provided input is a Zod schema.
*/ function isInteropZodSchema(input) {
    if (!input) return false;
    if (typeof input !== "object") return false;
    if (Array.isArray(input)) return false;
    if (isZodSchemaV4(input) || isZodSchemaV3(input)) return true;
    return false;
}
function isZodLiteralV3(obj) {
    if (typeof obj === "object" && obj !== null && "_def" in obj && typeof obj._def === "object" && obj._def !== null && "typeName" in obj._def && obj._def.typeName === "ZodLiteral") return true;
    return false;
}
function isZodLiteralV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "literal") return true;
    return false;
}
/**
* Determines if the provided value is an InteropZodLiteral (Zod v3 or v4 literal schema).
*
* @param obj The value to check.
* @returns {boolean} True if the value is a Zod v3 or v4 literal schema, false otherwise.
*/ function isInteropZodLiteral(obj) {
    if (isZodLiteralV3(obj)) return true;
    if (isZodLiteralV4(obj)) return true;
    return false;
}
/**
* Asynchronously parses the input using the provided Zod schema (v3 or v4) and returns a safe parse result.
* This function handles both Zod v3 and v4 schemas, returning a result object indicating success or failure.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {Promise<InteropZodSafeParseResult<T>>} A promise that resolves to a safe parse result object.
* @throws {Error} If the schema is not a recognized Zod v3 or v4 schema.
*/ async function interopSafeParseAsync(schema, input) {
    if (isZodSchemaV4(schema)) try {
        return {
            success: true,
            data: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAsync"])(schema, input)
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
    if (isZodSchemaV3(schema)) return await schema.safeParseAsync(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Asynchronously parses the input using the provided Zod schema (v3 or v4) and returns the parsed value.
* Throws an error if parsing fails or if the schema is not a recognized Zod v3 or v4 schema.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {Promise<T>} A promise that resolves to the parsed value.
* @throws {Error} If parsing fails or the schema is not a recognized Zod v3 or v4 schema.
*/ async function interopParseAsync(schema, input) {
    if (isZodSchemaV4(schema)) return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAsync"])(schema, input);
    if (isZodSchemaV3(schema)) return await schema.parseAsync(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Safely parses the input using the provided Zod schema (v3 or v4) and returns a result object
* indicating success or failure. This function is compatible with both Zod v3 and v4 schemas.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {InteropZodSafeParseResult<T>} An object with either the parsed data (on success)
*   or the error (on failure).
* @throws {Error} If the schema is not a recognized Zod v3 or v4 schema.
*/ function interopSafeParse(schema, input) {
    if (isZodSchemaV4(schema)) try {
        return {
            success: true,
            data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parse"])(schema, input)
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
    if (isZodSchemaV3(schema)) return schema.safeParse(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Parses the input using the provided Zod schema (v3 or v4) and returns the parsed value.
* Throws an error if parsing fails or if the schema is not a recognized Zod v3 or v4 schema.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {T} The parsed value.
* @throws {Error} If parsing fails or the schema is not a recognized Zod v3 or v4 schema.
*/ function interopParse(schema, input) {
    if (isZodSchemaV4(schema)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parse"])(schema, input);
    if (isZodSchemaV3(schema)) return schema.parse(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Retrieves the description from a schema definition (v3, v4, standard schema, or plain object), if available.
*
* @param {unknown} schema - The schema to extract the description from.
* @returns {string | undefined} The description of the schema, or undefined if not present.
*/ function getSchemaDescription(schema) {
    if (isZodSchemaV4(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema)?.description;
    if (isZodSchemaV3(schema)) return schema.description;
    if ("description" in schema && typeof schema.description === "string") return schema.description;
}
/**
* Determines if the provided Zod schema is "shapeless".
* A shapeless schema is one that does not define any object shape,
* such as ZodString, ZodNumber, ZodBoolean, ZodAny, etc.
* For ZodObject, it must have no shape keys to be considered shapeless.
* ZodRecord schemas are considered shapeless since they define dynamic
* key-value mappings without fixed keys.
*
* @param schema The Zod schema to check.
* @returns {boolean} True if the schema is shapeless, false otherwise.
*/ function isShapelessZodSchema(schema) {
    if (!isInteropZodSchema(schema)) return false;
    if (isZodSchemaV3(schema)) {
        const def = schema._def;
        if (def.typeName === "ZodObject") {
            const obj = schema;
            return !obj.shape || Object.keys(obj.shape).length === 0;
        }
        if (def.typeName === "ZodRecord") return true;
    }
    if (isZodSchemaV4(schema)) {
        const def = schema._zod.def;
        if (def.type === "object") {
            const obj = schema;
            return !obj.shape || Object.keys(obj.shape).length === 0;
        }
        if (def.type === "record") return true;
    }
    if (typeof schema === "object" && schema !== null && !("shape" in schema)) return true;
    return false;
}
/**
* Determines if the provided Zod schema should be treated as a simple string schema
* that maps to DynamicTool. This aligns with the type-level constraint of
* InteropZodType<string | undefined> which only matches basic string schemas.
* If the provided schema is just z.string(), we can make the determination that
* the tool is just a generic string tool that doesn't require any input validation.
*
* This function only returns true for basic ZodString schemas, including:
* - Basic string schemas (z.string())
* - String schemas with validations (z.string().min(1), z.string().email(), etc.)
*
* This function returns false for everything else, including:
* - String schemas with defaults (z.string().default("value"))
* - Branded string schemas (z.string().brand<"UserId">())
* - String schemas with catch operations (z.string().catch("default"))
* - Optional/nullable string schemas (z.string().optional())
* - Transformed schemas (z.string().transform() or z.object().transform())
* - Object or record schemas, even if they're empty
* - Any other schema type
*
* @param schema The Zod schema to check.
* @returns {boolean} True if the schema is a basic ZodString, false otherwise.
*/ function isSimpleStringZodSchema(schema) {
    if (!isInteropZodSchema(schema)) return false;
    if (isZodSchemaV3(schema)) return schema._def.typeName === "ZodString";
    if (isZodSchemaV4(schema)) return schema._zod.def.type === "string";
    return false;
}
function isZodObjectV3(obj) {
    if (typeof obj === "object" && obj !== null && "_def" in obj && typeof obj._def === "object" && obj._def !== null && "typeName" in obj._def && obj._def.typeName === "ZodObject") return true;
    return false;
}
function isZodObjectV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "object") return true;
    return false;
}
function isZodArrayV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "array") return true;
    return false;
}
function isZodOptionalV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "optional") return true;
    return false;
}
function isZodNullableV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "nullable") return true;
    return false;
}
/**
* Determines if the provided value is an InteropZodObject (Zod v3 or v4 object schema).
*
* @param obj The value to check.
* @returns {boolean} True if the value is a Zod v3 or v4 object schema, false otherwise.
*/ function isInteropZodObject(obj) {
    if (isZodObjectV3(obj)) return true;
    if (isZodObjectV4(obj)) return true;
    return false;
}
/**
* Retrieves the shape (fields) of a Zod object schema, supporting both Zod v3 and v4.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @returns {InteropZodObjectShape<T>} The shape of the object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function getInteropZodObjectShape(schema) {
    if (isZodSchemaV3(schema)) return schema.shape;
    if (isZodSchemaV4(schema)) return schema._zod.def.shape;
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Extends a Zod object schema with additional fields, supporting both Zod v3 and v4.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {InteropZodObjectShape} extension - The fields to add to the schema.
* @returns {InteropZodObject} The extended Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function extendInteropZodObject(schema, extension) {
    if (isZodSchemaV3(schema)) return schema.extend(extension);
    if (isZodSchemaV4(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__util$3e$__["util"].extend(schema, extension);
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a partial version of a Zod object schema, making all fields optional.
* Supports both Zod v3 and v4.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @returns {InteropZodObject} The partial Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectPartial(schema) {
    if (isZodSchemaV3(schema)) return schema.partial();
    if (isZodSchemaV4(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__util$3e$__["util"].partial(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$ZodOptional"], schema, void 0);
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a strict version of a Zod object schema, disallowing unknown keys.
* Supports both Zod v3 and v4 object schemas. If `recursive` is true, applies strictness
* recursively to all nested object schemas and arrays of object schemas.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {boolean} [recursive=false] - Whether to apply strictness recursively to nested objects/arrays.
* @returns {InteropZodObject} The strict Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectStrict(schema, recursive = false) {
    if (isZodObjectV3(schema)) return schema.strict();
    if (isZodObjectV4(schema)) {
        const outputShape = schema._zod.def.shape;
        if (recursive) for (const [key, keySchema] of Object.entries(schema._zod.def.shape)){
            if (isZodObjectV4(keySchema)) outputShape[key] = interopZodObjectStrict(keySchema, recursive);
            else if (isZodArrayV4(keySchema)) {
                let elementSchema = keySchema._zod.def.element;
                if (isZodObjectV4(elementSchema)) elementSchema = interopZodObjectStrict(elementSchema, recursive);
                outputShape[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(keySchema, {
                    ...keySchema._zod.def,
                    element: elementSchema
                });
            } else outputShape[key] = keySchema;
            const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].get(keySchema);
            if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].add(outputShape[key], meta);
        }
        const modifiedSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(schema, {
            ...schema._zod.def,
            shape: outputShape,
            catchall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_never"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$ZodNever"])
        });
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].add(modifiedSchema, meta);
        return modifiedSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a passthrough version of a Zod object schema, allowing unknown keys.
* Supports both Zod v3 and v4 object schemas. If `recursive` is true, applies passthrough
* recursively to all nested object schemas and arrays of object schemas.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {boolean} [recursive=false] - Whether to apply passthrough recursively to nested objects/arrays.
* @returns {InteropZodObject} The passthrough Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectPassthrough(schema, recursive = false) {
    if (isZodObjectV3(schema)) return schema.passthrough();
    if (isZodObjectV4(schema)) {
        const outputShape = schema._zod.def.shape;
        if (recursive) for (const [key, keySchema] of Object.entries(schema._zod.def.shape)){
            if (isZodObjectV4(keySchema)) outputShape[key] = interopZodObjectPassthrough(keySchema, recursive);
            else if (isZodArrayV4(keySchema)) {
                let elementSchema = keySchema._zod.def.element;
                if (isZodObjectV4(elementSchema)) elementSchema = interopZodObjectPassthrough(elementSchema, recursive);
                outputShape[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(keySchema, {
                    ...keySchema._zod.def,
                    element: elementSchema
                });
            } else outputShape[key] = keySchema;
            const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].get(keySchema);
            if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].add(outputShape[key], meta);
        }
        const modifiedSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(schema, {
            ...schema._zod.def,
            shape: outputShape,
            catchall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$api$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_unknown"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$ZodUnknown"])
        });
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].add(modifiedSchema, meta);
        return modifiedSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a getter function for the default value of a Zod schema, if one is defined.
* Supports both Zod v3 and v4 schemas. If the schema has a default value,
* the returned function will return that value when called. If no default is defined,
* returns undefined.
*
* @template T - The type of the Zod schema.
* @param {T} schema - The Zod schema instance (either v3 or v4).
* @returns {(() => InferInteropZodOutput<T>) | undefined} A function that returns the default value, or undefined if no default is set.
*/ function getInteropZodDefaultGetter(schema) {
    if (isZodSchemaV3(schema)) try {
        const defaultValue = schema.parse(void 0);
        return ()=>defaultValue;
    } catch  {
        return;
    }
    if (isZodSchemaV4(schema)) try {
        const defaultValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parse"])(schema, void 0);
        return ()=>defaultValue;
    } catch  {
        return;
    }
}
function isZodTransformV3(schema) {
    return isZodSchemaV3(schema) && "typeName" in schema._def && schema._def.typeName === "ZodEffects";
}
function isZodTransformV4(schema) {
    return isZodSchemaV4(schema) && schema._zod.def.type === "pipe";
}
function interopZodTransformInputSchemaImpl(schema, recursive, cache) {
    const cached = cache.get(schema);
    if (cached !== void 0) return cached;
    if (isZodSchemaV3(schema)) {
        if (isZodTransformV3(schema)) return interopZodTransformInputSchemaImpl(schema._def.schema, recursive, cache);
        return schema;
    }
    if (isZodSchemaV4(schema)) {
        let outputSchema = schema;
        if (isZodTransformV4(schema)) outputSchema = interopZodTransformInputSchemaImpl(schema._zod.def.in, recursive, cache);
        if (recursive) {
            if (isZodObjectV4(outputSchema)) {
                const outputShape = {};
                for (const [key, keySchema] of Object.entries(outputSchema._zod.def.shape))outputShape[key] = interopZodTransformInputSchemaImpl(keySchema, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    shape: outputShape
                });
            } else if (isZodArrayV4(outputSchema)) {
                const elementSchema = interopZodTransformInputSchemaImpl(outputSchema._zod.def.element, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    element: elementSchema
                });
            } else if (isZodOptionalV4(outputSchema)) {
                const innerSchema = interopZodTransformInputSchemaImpl(outputSchema._zod.def.innerType, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    innerType: innerSchema
                });
            } else if (isZodNullableV4(outputSchema)) {
                const innerSchema = interopZodTransformInputSchemaImpl(outputSchema._zod.def.innerType, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    innerType: innerSchema
                });
            }
        }
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].add(outputSchema, meta);
        cache.set(schema, outputSchema);
        return outputSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Returns the input type of a Zod transform schema, for both v3 and v4.
* If the schema is not a transform, returns undefined. If `recursive` is true,
* recursively processes nested object schemas and arrays of object schemas.
*
* @param schema - The Zod schema instance (v3 or v4)
* @param {boolean} [recursive=false] - Whether to recursively process nested objects/arrays.
* @returns The input Zod schema of the transform, or undefined if not a transform
*/ function interopZodTransformInputSchema(schema, recursive = false) {
    return interopZodTransformInputSchemaImpl(schema, recursive, /* @__PURE__ */ new WeakMap());
}
/**
* Creates a modified version of a Zod object schema where fields matching a predicate are made optional.
* Supports both Zod v3 and v4 schemas and preserves the original schema version.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {(key: string, value: InteropZodType) => boolean} predicate - Function to determine which fields should be optional.
* @returns {InteropZodObject} The modified Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectMakeFieldsOptional(schema, predicate) {
    if (isZodSchemaV3(schema)) {
        const shape = getInteropZodObjectShape(schema);
        const modifiedShape = {};
        for (const [key, value] of Object.entries(shape))if (predicate(key, value)) modifiedShape[key] = value.optional();
        else modifiedShape[key] = value;
        return schema.extend(modifiedShape);
    }
    if (isZodSchemaV4(schema)) {
        const shape = getInteropZodObjectShape(schema);
        const outputShape = {
            ...schema._zod.def.shape
        };
        for (const [key, value] of Object.entries(shape))if (predicate(key, value)) outputShape[key] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$ZodOptional"]({
            type: "optional",
            innerType: value
        });
        const modifiedSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clone"])(schema, {
            ...schema._zod.def,
            shape: outputShape
        });
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalRegistry"].add(modifiedSchema, meta);
        return modifiedSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
function isInteropZodError(e) {
    return e instanceof Error && (e.constructor.name === "ZodError" || e.constructor.name === "$ZodError");
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultOptions",
    ()=>defaultOptions,
    "getDefaultOptions",
    ()=>getDefaultOptions,
    "ignoreOverride",
    ()=>ignoreOverride
]);
//#region src/utils/zod-to-json-schema/Options.ts
const ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
const defaultOptions = {
    name: void 0,
    $refStrategy: "root",
    basePath: [
        "#"
    ],
    effectStrategy: "input",
    pipeStrategy: "all",
    dateStrategy: "format:date-time",
    mapStrategy: "entries",
    removeAdditionalStrategy: "passthrough",
    allowedAdditionalProperties: true,
    rejectedAdditionalProperties: false,
    definitionPath: "definitions",
    target: "jsonSchema7",
    strictUnions: false,
    definitions: {},
    errorMessages: false,
    markdownDescription: false,
    patternStrategy: "escape",
    applyRegexFlags: false,
    emailStrategy: "format:email",
    base64Strategy: "contentEncoding:base64",
    nameStrategy: "ref",
    openAiAnyTypeName: "OpenAiAnyType"
};
const getDefaultOptions = (options)=>typeof options === "string" ? {
        ...defaultOptions,
        name: options
    } : {
        ...defaultOptions,
        ...options
    };
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Refs.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRefs",
    ()=>getRefs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/Refs.ts
const getRefs = (options)=>{
    const _options = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultOptions"])(options);
    const currentPath = _options.name !== void 0 ? [
        ..._options.basePath,
        _options.definitionPath,
        _options.name
    ] : _options.basePath;
    return {
        ..._options,
        flags: {
            hasReferencedOpenAiAnyType: false
        },
        currentPath,
        propertyPath: void 0,
        seen: new Map(Object.entries(_options.definitions).map(([name, def])=>[
                def._def,
                {
                    def: def._def,
                    path: [
                        ..._options.basePath,
                        _options.definitionPath,
                        name
                    ],
                    jsonSchema: void 0
                }
            ]))
    };
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRelativePath",
    ()=>getRelativePath
]);
//#region src/utils/zod-to-json-schema/getRelativePath.ts
const getRelativePath = (pathA, pathB)=>{
    let i = 0;
    for(; i < pathA.length && i < pathB.length; i++)if (pathA[i] !== pathB[i]) break;
    return [
        (pathA.length - i).toString(),
        ...pathB.slice(i)
    ].join("/");
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseAnyDef",
    ()=>parseAnyDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/any.ts
function parseAnyDef(refs) {
    if (refs.target !== "openAi") return {};
    const anyDefinitionPath = [
        ...refs.basePath,
        refs.definitionPath,
        refs.openAiAnyTypeName
    ];
    refs.flags.hasReferencedOpenAiAnyType = true;
    return {
        $ref: refs.$refStrategy === "relative" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRelativePath"])(anyDefinitionPath, refs.currentPath) : anyDefinitionPath.join("/")
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addErrorMessage",
    ()=>addErrorMessage,
    "setResponseValueAndErrors",
    ()=>setResponseValueAndErrors
]);
//#region src/utils/zod-to-json-schema/errorMessages.ts
function addErrorMessage(res, key, errorMessage, refs) {
    if (!refs?.errorMessages) return;
    if (errorMessage) res.errorMessage = {
        ...res.errorMessage,
        [key]: errorMessage
    };
}
function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
    res[key] = value;
    addErrorMessage(res, key, errorMessage, refs);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/array.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseArrayDef",
    ()=>parseArrayDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v3/types.js [app-rsc] (ecmascript)");
;
;
;
//#region src/utils/zod-to-json-schema/parsers/array.ts
function parseArrayDef(def, refs) {
    const res = {
        type: "array"
    };
    if (def.type?._def && def.type?._def?.typeName !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodAny) res.items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.type._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "items"
        ]
    });
    if (def.minLength) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minItems", def.minLength.value, def.minLength.message, refs);
    if (def.maxLength) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
    if (def.exactLength) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
    }
    return res;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/bigint.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseBigintDef",
    ()=>parseBigintDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/bigint.ts
function parseBigintDef(def, refs) {
    const res = {
        type: "integer",
        format: "int64"
    };
    if (!def.checks) return res;
    for (const check of def.checks)switch(check.kind){
        case "min":
            if (refs.target === "jsonSchema7") {
                if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
                else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMinimum", check.value, check.message, refs);
            } else {
                if (!check.inclusive) res.exclusiveMinimum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            }
            break;
        case "max":
            if (refs.target === "jsonSchema7") {
                if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
                else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMaximum", check.value, check.message, refs);
            } else {
                if (!check.inclusive) res.exclusiveMaximum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
            }
            break;
        case "multipleOf":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "multipleOf", check.value, check.message, refs);
    }
    return res;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/boolean.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseBooleanDef",
    ()=>parseBooleanDef
]);
//#region src/utils/zod-to-json-schema/parsers/boolean.ts
function parseBooleanDef() {
    return {
        type: "boolean"
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseBrandedDef",
    ()=>parseBrandedDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/branded.ts
function parseBrandedDef(_def, refs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(_def.type._def, refs);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/catch.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseCatchDef",
    ()=>parseCatchDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/catch.ts
const parseCatchDef = (def, refs)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, refs);
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/date.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDateDef",
    ()=>parseDateDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/date.ts
function parseDateDef(def, refs, overrideDateStrategy) {
    const strategy = overrideDateStrategy ?? refs.dateStrategy;
    if (Array.isArray(strategy)) return {
        anyOf: strategy.map((item)=>parseDateDef(def, refs, item))
    };
    switch(strategy){
        case "string":
        case "format:date-time":
            return {
                type: "string",
                format: "date-time"
            };
        case "format:date":
            return {
                type: "string",
                format: "date"
            };
        case "integer":
            return integerDateParser(def, refs);
    }
}
const integerDateParser = (def, refs)=>{
    const res = {
        type: "integer",
        format: "unix-time"
    };
    if (refs.target === "openApi3") return res;
    for (const check of def.checks)switch(check.kind){
        case "min":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            break;
        case "max":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
    }
    return res;
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/default.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDefaultDef",
    ()=>parseDefaultDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/default.ts
function parseDefaultDef(_def, refs) {
    return {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(_def.innerType._def, refs),
        default: _def.defaultValue()
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/effects.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseEffectsDef",
    ()=>parseEffectsDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/effects.ts
function parseEffectsDef(_def, refs) {
    return refs.effectStrategy === "input" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(_def.schema._def, refs) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/enum.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseEnumDef",
    ()=>parseEnumDef
]);
//#region src/utils/zod-to-json-schema/parsers/enum.ts
function parseEnumDef(def) {
    return {
        type: "string",
        enum: Array.from(def.values)
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/intersection.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseIntersectionDef",
    ()=>parseIntersectionDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/intersection.ts
const isJsonSchema7AllOfType = (type)=>{
    if ("type" in type && type.type === "string") return false;
    return "allOf" in type;
};
function parseIntersectionDef(def, refs) {
    const allOf = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.left._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "allOf",
                "0"
            ]
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.right._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "allOf",
                "1"
            ]
        })
    ].filter((x)=>!!x);
    let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? {
        unevaluatedProperties: false
    } : void 0;
    const mergedAllOf = [];
    allOf.forEach((schema)=>{
        if (isJsonSchema7AllOfType(schema)) {
            mergedAllOf.push(...schema.allOf);
            if (schema.unevaluatedProperties === void 0) unevaluatedProperties = void 0;
        } else {
            let nestedSchema = schema;
            if ("additionalProperties" in schema && schema.additionalProperties === false) {
                const { additionalProperties, ...rest } = schema;
                nestedSchema = rest;
            } else unevaluatedProperties = void 0;
            mergedAllOf.push(nestedSchema);
        }
    });
    return mergedAllOf.length ? {
        allOf: mergedAllOf,
        ...unevaluatedProperties
    } : void 0;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/literal.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseLiteralDef",
    ()=>parseLiteralDef
]);
//#region src/utils/zod-to-json-schema/parsers/literal.ts
function parseLiteralDef(def, refs) {
    const parsedType = typeof def.value;
    if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") return {
        type: Array.isArray(def.value) ? "array" : "object"
    };
    if (refs.target === "openApi3") return {
        type: parsedType === "bigint" ? "integer" : parsedType,
        enum: [
            def.value
        ]
    };
    return {
        type: parsedType === "bigint" ? "integer" : parsedType,
        const: def.value
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseStringDef",
    ()=>parseStringDef,
    "zodPatterns",
    ()=>zodPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/string.ts
let emojiRegex = void 0;
/**
* Generated from the regular expressions found here as of 2024-05-22:
* https://github.com/colinhacks/zod/blob/master/src/types.ts.
*
* Expressions with /i flag have been changed accordingly.
*/ const zodPatterns = {
    /**
	* `c` was changed to `[cC]` to replicate /i flag
	*/ cuid: /^[cC][^\s-]{8,}$/,
    cuid2: /^[0-9a-z]+$/,
    ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
    /**
	* `a-z` was added to replicate /i flag
	*/ email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
    /**
	* Constructed a valid Unicode RegExp
	*
	* Lazily instantiate since this type of regex isn't supported
	* in all envs (e.g. React Native).
	*
	* See:
	* https://github.com/colinhacks/zod/issues/2433
	* Fix in Zod:
	* https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
	*/ emoji: ()=>{
        if (emojiRegex === void 0) emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
        return emojiRegex;
    },
    /**
	* Unused
	*/ uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    /**
	* Unused
	*/ ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    /**
	* Unused
	*/ ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
    ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    nanoid: /^[a-zA-Z0-9_-]{21}$/,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function parseStringDef(def, refs) {
    const res = {
        type: "string"
    };
    if (def.checks) for (const check of def.checks)switch(check.kind){
        case "min":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
            break;
        case "max":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
            break;
        case "email":
            switch(refs.emailStrategy){
                case "format:email":
                    addFormat(res, "email", check.message, refs);
                    break;
                case "format:idn-email":
                    addFormat(res, "idn-email", check.message, refs);
                    break;
                case "pattern:zod":
                    addPattern(res, zodPatterns.email, check.message, refs);
            }
            break;
        case "url":
            addFormat(res, "uri", check.message, refs);
            break;
        case "uuid":
            addFormat(res, "uuid", check.message, refs);
            break;
        case "regex":
            addPattern(res, check.regex, check.message, refs);
            break;
        case "cuid":
            addPattern(res, zodPatterns.cuid, check.message, refs);
            break;
        case "cuid2":
            addPattern(res, zodPatterns.cuid2, check.message, refs);
            break;
        case "startsWith":
            addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
            break;
        case "endsWith":
            addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
            break;
        case "datetime":
            addFormat(res, "date-time", check.message, refs);
            break;
        case "date":
            addFormat(res, "date", check.message, refs);
            break;
        case "time":
            addFormat(res, "time", check.message, refs);
            break;
        case "duration":
            addFormat(res, "duration", check.message, refs);
            break;
        case "length":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
            break;
        case "includes":
            addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
            break;
        case "ip":
            if (check.version !== "v6") addFormat(res, "ipv4", check.message, refs);
            if (check.version !== "v4") addFormat(res, "ipv6", check.message, refs);
            break;
        case "base64url":
            addPattern(res, zodPatterns.base64url, check.message, refs);
            break;
        case "jwt":
            addPattern(res, zodPatterns.jwt, check.message, refs);
            break;
        case "cidr":
            if (check.version !== "v6") addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
            if (check.version !== "v4") addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
            break;
        case "emoji":
            addPattern(res, zodPatterns.emoji(), check.message, refs);
            break;
        case "ulid":
            addPattern(res, zodPatterns.ulid, check.message, refs);
            break;
        case "base64":
            switch(refs.base64Strategy){
                case "format:binary":
                    addFormat(res, "binary", check.message, refs);
                    break;
                case "contentEncoding:base64":
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "contentEncoding", "base64", check.message, refs);
                    break;
                case "pattern:zod":
                    addPattern(res, zodPatterns.base64, check.message, refs);
            }
            break;
        case "nanoid":
            addPattern(res, zodPatterns.nanoid, check.message, refs);
    }
    return res;
}
function escapeLiteralCheckValue(literal, refs) {
    return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
}
const ALPHA_NUMERIC = /* @__PURE__ */ new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
function escapeNonAlphaNumeric(source) {
    let result = "";
    for(let i = 0; i < source.length; i++){
        if (!ALPHA_NUMERIC.has(source[i])) result += "\\";
        result += source[i];
    }
    return result;
}
function addFormat(schema, value, message, refs) {
    if (schema.format || schema.anyOf?.some((x)=>x.format)) {
        if (!schema.anyOf) schema.anyOf = [];
        if (schema.format) {
            schema.anyOf.push({
                format: schema.format,
                ...schema.errorMessage && refs.errorMessages && {
                    errorMessage: {
                        format: schema.errorMessage.format
                    }
                }
            });
            delete schema.format;
            if (schema.errorMessage) {
                delete schema.errorMessage.format;
                if (Object.keys(schema.errorMessage).length === 0) delete schema.errorMessage;
            }
        }
        schema.anyOf.push({
            format: value,
            ...message && refs.errorMessages && {
                errorMessage: {
                    format: message
                }
            }
        });
    } else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "format", value, message, refs);
}
function addPattern(schema, regex, message, refs) {
    if (schema.pattern || schema.allOf?.some((x)=>x.pattern)) {
        if (!schema.allOf) schema.allOf = [];
        if (schema.pattern) {
            schema.allOf.push({
                pattern: schema.pattern,
                ...schema.errorMessage && refs.errorMessages && {
                    errorMessage: {
                        pattern: schema.errorMessage.pattern
                    }
                }
            });
            delete schema.pattern;
            if (schema.errorMessage) {
                delete schema.errorMessage.pattern;
                if (Object.keys(schema.errorMessage).length === 0) delete schema.errorMessage;
            }
        }
        schema.allOf.push({
            pattern: stringifyRegExpWithFlags(regex, refs),
            ...message && refs.errorMessages && {
                errorMessage: {
                    pattern: message
                }
            }
        });
    } else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "pattern", stringifyRegExpWithFlags(regex, refs), message, refs);
}
function stringifyRegExpWithFlags(regex, refs) {
    if (!refs.applyRegexFlags || !regex.flags) return regex.source;
    const flags = {
        i: regex.flags.includes("i"),
        m: regex.flags.includes("m"),
        s: regex.flags.includes("s")
    };
    const source = flags.i ? regex.source.toLowerCase() : regex.source;
    let pattern = "";
    let isEscaped = false;
    let inCharGroup = false;
    let inCharRange = false;
    for(let i = 0; i < source.length; i++){
        if (isEscaped) {
            pattern += source[i];
            isEscaped = false;
            continue;
        }
        if (flags.i) {
            if (inCharGroup) {
                if (source[i].match(/[a-z]/)) {
                    if (inCharRange) {
                        pattern += source[i];
                        pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
                        inCharRange = false;
                    } else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
                        pattern += source[i];
                        inCharRange = true;
                    } else pattern += `${source[i]}${source[i].toUpperCase()}`;
                    continue;
                }
            } else if (source[i].match(/[a-z]/)) {
                pattern += `[${source[i]}${source[i].toUpperCase()}]`;
                continue;
            }
        }
        if (flags.m) {
            if (source[i] === "^") {
                pattern += `(^|(?<=[\r\n]))`;
                continue;
            } else if (source[i] === "$") {
                pattern += `($|(?=[\r\n]))`;
                continue;
            }
        }
        if (flags.s && source[i] === ".") {
            pattern += inCharGroup ? `${source[i]}\r\n` : `[${source[i]}\r\n]`;
            continue;
        }
        pattern += source[i];
        if (source[i] === "\\") isEscaped = true;
        else if (inCharGroup && source[i] === "]") inCharGroup = false;
        else if (!inCharGroup && source[i] === "[") inCharGroup = true;
    }
    try {
        new RegExp(pattern);
    } catch  {
        console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
        return regex.source;
    }
    return pattern;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseRecordDef",
    ()=>parseRecordDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v3/types.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/utils/zod-to-json-schema/parsers/record.ts
function parseRecordDef(def, refs) {
    if (refs.target === "openAi") console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
    if (refs.target === "openApi3" && def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEnum) return {
        type: "object",
        required: def.keyType._def.values,
        properties: def.keyType._def.values.reduce((acc, key)=>({
                ...acc,
                [key]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
                    ...refs,
                    currentPath: [
                        ...refs.currentPath,
                        "properties",
                        key
                    ]
                }) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
            }), {}),
        additionalProperties: refs.rejectedAdditionalProperties
    };
    const schema = {
        type: "object",
        additionalProperties: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "additionalProperties"
            ]
        }) ?? refs.allowedAdditionalProperties
    };
    if (refs.target === "openApi3") return schema;
    if (def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodString && def.keyType._def.checks?.length) {
        const { type, ...keyType } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseStringDef"])(def.keyType._def, refs);
        return {
            ...schema,
            propertyNames: keyType
        };
    } else if (def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEnum) return {
        ...schema,
        propertyNames: {
            enum: def.keyType._def.values
        }
    };
    else if (def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBranded && def.keyType._def.type._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodString && def.keyType._def.type._def.checks?.length) {
        const { type, ...keyType } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseBrandedDef"])(def.keyType._def, refs);
        return {
            ...schema,
            propertyNames: keyType
        };
    }
    return schema;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/map.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseMapDef",
    ()=>parseMapDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
;
;
//#region src/utils/zod-to-json-schema/parsers/map.ts
function parseMapDef(def, refs) {
    if (refs.mapStrategy === "record") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRecordDef"])(def, refs);
    return {
        type: "array",
        maxItems: 125,
        items: {
            type: "array",
            items: [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.keyType._def, {
                    ...refs,
                    currentPath: [
                        ...refs.currentPath,
                        "items",
                        "items",
                        "0"
                    ]
                }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
                    ...refs,
                    currentPath: [
                        ...refs.currentPath,
                        "items",
                        "items",
                        "1"
                    ]
                }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
            ],
            minItems: 2,
            maxItems: 2
        }
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nativeEnum.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNativeEnumDef",
    ()=>parseNativeEnumDef
]);
//#region src/utils/zod-to-json-schema/parsers/nativeEnum.ts
function parseNativeEnumDef(def) {
    const object = def.values;
    const actualValues = Object.keys(def.values).filter((key)=>{
        return typeof object[object[key]] !== "number";
    }).map((key)=>object[key]);
    const parsedTypes = Array.from(new Set(actualValues.map((values)=>typeof values)));
    return {
        type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : [
            "string",
            "number"
        ],
        enum: actualValues
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/never.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNeverDef",
    ()=>parseNeverDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/never.ts
function parseNeverDef(refs) {
    return refs.target === "openAi" ? void 0 : {
        not: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])({
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "not"
            ]
        })
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/null.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNullDef",
    ()=>parseNullDef
]);
//#region src/utils/zod-to-json-schema/parsers/null.ts
function parseNullDef(refs) {
    return refs.target === "openApi3" ? {
        enum: [
            "null"
        ],
        nullable: true
    } : {
        type: "null"
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUnionDef",
    ()=>parseUnionDef,
    "primitiveMappings",
    ()=>primitiveMappings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/union.ts
const primitiveMappings = {
    ZodString: "string",
    ZodNumber: "number",
    ZodBigInt: "integer",
    ZodBoolean: "boolean",
    ZodNull: "null"
};
function parseUnionDef(def, refs) {
    if (refs.target === "openApi3") return asAnyOf(def, refs);
    const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
    if (options.every((x)=>x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
        const types = options.reduce((types, x)=>{
            const type = primitiveMappings[x._def.typeName];
            return type && !types.includes(type) ? [
                ...types,
                type
            ] : types;
        }, []);
        return {
            type: types.length > 1 ? types : types[0]
        };
    } else if (options.every((x)=>x._def.typeName === "ZodLiteral" && !x.description)) {
        const types = options.reduce((acc, x)=>{
            const type = typeof x._def.value;
            switch(type){
                case "string":
                case "number":
                case "boolean":
                    return [
                        ...acc,
                        type
                    ];
                case "bigint":
                    return [
                        ...acc,
                        "integer"
                    ];
                case "object":
                    if (x._def.value === null) return [
                        ...acc,
                        "null"
                    ];
                    return acc;
                default:
                    return acc;
            }
        }, []);
        if (types.length === options.length) {
            const uniqueTypes = types.filter((x, i, a)=>a.indexOf(x) === i);
            return {
                type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
                enum: options.reduce((acc, x)=>{
                    return acc.includes(x._def.value) ? acc : [
                        ...acc,
                        x._def.value
                    ];
                }, [])
            };
        }
    } else if (options.every((x)=>x._def.typeName === "ZodEnum")) return {
        type: "string",
        enum: options.reduce((acc, x)=>[
                ...acc,
                ...x._def.values.filter((x)=>!acc.includes(x))
            ], [])
    };
    return asAnyOf(def, refs);
}
const asAnyOf = (def, refs)=>{
    const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(x._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "anyOf",
                `${i}`
            ]
        })).filter((x)=>!!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
    return anyOf.length ? {
        anyOf
    } : void 0;
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nullable.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNullableDef",
    ()=>parseNullableDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/nullable.ts
function parseNullableDef(def, refs) {
    if ([
        "ZodString",
        "ZodNumber",
        "ZodBigInt",
        "ZodBoolean",
        "ZodNull"
    ].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
        if (refs.target === "openApi3") return {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["primitiveMappings"][def.innerType._def.typeName],
            nullable: true
        };
        return {
            type: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["primitiveMappings"][def.innerType._def.typeName],
                "null"
            ]
        };
    }
    if (refs.target === "openApi3") {
        const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath
            ]
        });
        if (base && "$ref" in base) return {
            allOf: [
                base
            ],
            nullable: true
        };
        return base && {
            ...base,
            nullable: true
        };
    }
    const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "anyOf",
            "0"
        ]
    });
    return base && {
        anyOf: [
            base,
            {
                type: "null"
            }
        ]
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/number.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNumberDef",
    ()=>parseNumberDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/number.ts
function parseNumberDef(def, refs) {
    const res = {
        type: "number"
    };
    if (!def.checks) return res;
    for (const check of def.checks)switch(check.kind){
        case "int":
            res.type = "integer";
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addErrorMessage"])(res, "type", check.message, refs);
            break;
        case "min":
            if (refs.target === "jsonSchema7") {
                if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
                else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMinimum", check.value, check.message, refs);
            } else {
                if (!check.inclusive) res.exclusiveMinimum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            }
            break;
        case "max":
            if (refs.target === "jsonSchema7") {
                if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
                else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMaximum", check.value, check.message, refs);
            } else {
                if (!check.inclusive) res.exclusiveMaximum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
            }
            break;
        case "multipleOf":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "multipleOf", check.value, check.message, refs);
    }
    return res;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/object.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseObjectDef",
    ()=>parseObjectDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/object.ts
function parseObjectDef(def, refs) {
    const forceOptionalIntoNullable = refs.target === "openAi";
    const result = {
        type: "object",
        properties: {}
    };
    const required = [];
    const shape = def.shape();
    for(const propName in shape){
        let propDef = shape[propName];
        if (propDef === void 0 || propDef._def === void 0) continue;
        let propOptional = safeIsOptional(propDef);
        if (propOptional && forceOptionalIntoNullable) {
            if (propDef._def.typeName === "ZodOptional") propDef = propDef._def.innerType;
            if (!propDef.isNullable()) propDef = propDef.nullable();
            propOptional = false;
        }
        const parsedDef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(propDef._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "properties",
                propName
            ],
            propertyPath: [
                ...refs.currentPath,
                "properties",
                propName
            ]
        });
        if (parsedDef === void 0) continue;
        result.properties[propName] = parsedDef;
        if (!propOptional) required.push(propName);
    }
    if (required.length) result.required = required;
    const additionalProperties = decideAdditionalProperties(def, refs);
    if (additionalProperties !== void 0) result.additionalProperties = additionalProperties;
    return result;
}
function decideAdditionalProperties(def, refs) {
    if (def.catchall._def.typeName !== "ZodNever") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.catchall._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "additionalProperties"
        ]
    });
    switch(def.unknownKeys){
        case "passthrough":
            return refs.allowedAdditionalProperties;
        case "strict":
            return refs.rejectedAdditionalProperties;
        case "strip":
            return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
    }
}
function safeIsOptional(schema) {
    try {
        return schema.isOptional();
    } catch  {
        return true;
    }
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/optional.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseOptionalDef",
    ()=>parseOptionalDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/optional.ts
const parseOptionalDef = (def, refs)=>{
    if (refs.currentPath.toString() === refs.propertyPath?.toString()) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, refs);
    const innerSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "anyOf",
            "1"
        ]
    });
    return innerSchema ? {
        anyOf: [
            {
                not: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
            },
            innerSchema
        ]
    } : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/pipeline.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parsePipelineDef",
    ()=>parsePipelineDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/pipeline.ts
const parsePipelineDef = (def, refs)=>{
    if (refs.pipeStrategy === "input") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.in._def, refs);
    else if (refs.pipeStrategy === "output") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.out._def, refs);
    const a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.in._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "allOf",
            "0"
        ]
    });
    return {
        allOf: [
            a,
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.out._def, {
                ...refs,
                currentPath: [
                    ...refs.currentPath,
                    "allOf",
                    a ? "1" : "0"
                ]
            })
        ].filter((x)=>x !== void 0)
    };
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/promise.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parsePromiseDef",
    ()=>parsePromiseDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/promise.ts
function parsePromiseDef(def, refs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.type._def, refs);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/set.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseSetDef",
    ()=>parseSetDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/set.ts
function parseSetDef(def, refs) {
    const schema = {
        type: "array",
        uniqueItems: true,
        items: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "items"
            ]
        })
    };
    if (def.minSize) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "minItems", def.minSize.value, def.minSize.message, refs);
    if (def.maxSize) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
    return schema;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/tuple.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseTupleDef",
    ()=>parseTupleDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/tuple.ts
function parseTupleDef(def, refs) {
    if (def.rest) return {
        type: "array",
        minItems: def.items.length,
        items: def.items.map((x, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(x._def, {
                ...refs,
                currentPath: [
                    ...refs.currentPath,
                    "items",
                    `${i}`
                ]
            })).reduce((acc, x)=>x === void 0 ? acc : [
                ...acc,
                x
            ], []),
        additionalItems: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.rest._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "additionalItems"
            ]
        })
    };
    else return {
        type: "array",
        minItems: def.items.length,
        maxItems: def.items.length,
        items: def.items.map((x, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(x._def, {
                ...refs,
                currentPath: [
                    ...refs.currentPath,
                    "items",
                    `${i}`
                ]
            })).reduce((acc, x)=>x === void 0 ? acc : [
                ...acc,
                x
            ], [])
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/undefined.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUndefinedDef",
    ()=>parseUndefinedDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/undefined.ts
function parseUndefinedDef(refs) {
    return {
        not: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/unknown.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUnknownDef",
    ()=>parseUnknownDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/unknown.ts
function parseUnknownDef(refs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/readonly.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseReadonlyDef",
    ()=>parseReadonlyDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/readonly.ts
const parseReadonlyDef = (def, refs)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, refs);
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/selectParser.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "selectParser",
    ()=>selectParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$array$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/array.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$bigint$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/bigint.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$boolean$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/boolean.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$catch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/catch.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$date$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/date.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$default$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/default.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$effects$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/effects.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$enum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/enum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$intersection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/intersection.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$literal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/literal.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$map$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/map.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nativeEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nativeEnum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$never$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/never.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$null$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/null.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nullable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nullable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$number$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/number.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$object$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/object.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$optional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/optional.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$pipeline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/pipeline.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$promise$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/promise.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$set$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/set.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$tuple$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/tuple.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$undefined$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/undefined.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$unknown$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/unknown.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$readonly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/readonly.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v3/types.js [app-rsc] (ecmascript)");
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
//#region src/utils/zod-to-json-schema/selectParser.ts
const selectParser = (def, typeName, refs)=>{
    switch(typeName){
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodString:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseStringDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNumber:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$number$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseNumberDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodObject:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$object$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseObjectDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBigInt:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$bigint$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseBigintDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBoolean:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$boolean$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseBooleanDef"])();
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodDate:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$date$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDateDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodUndefined:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$undefined$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseUndefinedDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNull:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$null$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseNullDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodArray:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$array$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseArrayDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodUnion:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodDiscriminatedUnion:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseUnionDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodIntersection:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$intersection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseIntersectionDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodTuple:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$tuple$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseTupleDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodRecord:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRecordDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodLiteral:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$literal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseLiteralDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEnum:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$enum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseEnumDef"])(def);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNativeEnum:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nativeEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseNativeEnumDef"])(def);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNullable:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nullable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseNullableDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodOptional:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$optional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseOptionalDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodMap:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$map$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseMapDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodSet:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$set$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseSetDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodLazy:
            return ()=>def.getter()._def;
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodPromise:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$promise$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePromiseDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNaN:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNever:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$never$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseNeverDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEffects:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$effects$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseEffectsDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodAny:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodUnknown:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$unknown$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseUnknownDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodDefault:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$default$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDefaultDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBranded:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseBrandedDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodReadonly:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$readonly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseReadonlyDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodCatch:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$catch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCatchDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodPipeline:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$pipeline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePipelineDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodFunction:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodVoid:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodSymbol:
            return;
        default:
            /* c8 ignore next */ return ((_)=>void 0)(typeName);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDef",
    ()=>parseDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$selectParser$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/selectParser.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/utils/zod-to-json-schema/parseDef.ts
function parseDef(def, refs, forceResolution = false) {
    const seenItem = refs.seen.get(def);
    if (refs.override) {
        const overrideResult = refs.override?.(def, refs, seenItem, forceResolution);
        if (overrideResult !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ignoreOverride"]) return overrideResult;
    }
    if (seenItem && !forceResolution) {
        const seenSchema = get$ref(seenItem, refs);
        if (seenSchema !== void 0) return seenSchema;
    }
    const newItem = {
        def,
        path: refs.currentPath,
        jsonSchema: void 0
    };
    refs.seen.set(def, newItem);
    const jsonSchemaOrGetter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$selectParser$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["selectParser"])(def, def.typeName, refs);
    const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
    if (jsonSchema) addMeta(def, refs, jsonSchema);
    if (refs.postProcess) {
        const postProcessResult = refs.postProcess(jsonSchema, def, refs);
        newItem.jsonSchema = jsonSchema;
        return postProcessResult;
    }
    newItem.jsonSchema = jsonSchema;
    return jsonSchema;
}
const get$ref = (item, refs)=>{
    switch(refs.$refStrategy){
        case "root":
            return {
                $ref: item.path.join("/")
            };
        case "relative":
            return {
                $ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRelativePath"])(refs.currentPath, item.path)
            };
        case "none":
        case "seen":
            if (item.path.length < refs.currentPath.length && item.path.every((value, index)=>refs.currentPath[index] === value)) {
                console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
            }
            return refs.$refStrategy === "seen" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs) : void 0;
    }
};
const addMeta = (def, refs, jsonSchema)=>{
    if (def.description) {
        jsonSchema.description = def.description;
        if (refs.markdownDescription) jsonSchema.markdownDescription = def.description;
    }
    return jsonSchema;
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/zodToJsonSchema.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "zodToJsonSchema",
    ()=>zodToJsonSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Refs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Refs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
;
;
;
//#region src/utils/zod-to-json-schema/zodToJsonSchema.ts
const zodToJsonSchema = (schema, options)=>{
    const refs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Refs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRefs"])(options);
    let definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name, schema])=>({
            ...acc,
            [name]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(schema._def, {
                ...refs,
                currentPath: [
                    ...refs.basePath,
                    refs.definitionPath,
                    name
                ]
            }, true) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
        }), {}) : void 0;
    const name = typeof options === "string" ? options : options?.nameStrategy === "title" ? void 0 : options?.name;
    const main = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseDef"])(schema._def, name === void 0 ? refs : {
        ...refs,
        currentPath: [
            ...refs.basePath,
            refs.definitionPath,
            name
        ]
    }, false) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
    const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
    if (title !== void 0) main.title = title;
    if (refs.flags.hasReferencedOpenAiAnyType) {
        if (!definitions) definitions = {};
        if (!definitions[refs.openAiAnyTypeName]) definitions[refs.openAiAnyTypeName] = {
            type: [
                "string",
                "number",
                "integer",
                "boolean",
                "array",
                "null"
            ],
            items: {
                $ref: refs.$refStrategy === "relative" ? "1" : [
                    ...refs.basePath,
                    refs.definitionPath,
                    refs.openAiAnyTypeName
                ].join("/")
            }
        };
    }
    const combined = name === void 0 ? definitions ? {
        ...main,
        [refs.definitionPath]: definitions
    } : main : {
        $ref: [
            ...refs.$refStrategy === "relative" ? [] : refs.basePath,
            refs.definitionPath,
            name
        ].join("/"),
        [refs.definitionPath]: {
            ...definitions,
            [name]: main
        }
    };
    if (refs.target === "jsonSchema7") combined.$schema = "http://json-schema.org/draft-07/schema#";
    else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
    if (refs.target === "openAi" && ("anyOf" in combined || "oneOf" in combined || "allOf" in combined || "type" in combined && Array.isArray(combined.type))) console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
    return combined;
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Refs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Refs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$array$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/array.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$bigint$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/bigint.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$boolean$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/boolean.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$catch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/catch.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$date$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/date.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$default$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/default.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$effects$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/effects.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$enum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/enum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$intersection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/intersection.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$literal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/literal.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$map$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/map.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nativeEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nativeEnum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$never$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/never.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$null$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/null.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nullable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nullable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$number$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/number.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$object$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/object.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$optional$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/optional.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$pipeline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/pipeline.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$promise$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/promise.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$set$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/set.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$tuple$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/tuple.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$undefined$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/undefined.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$unknown$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/unknown.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$readonly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/readonly.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$selectParser$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/selectParser.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$zodToJsonSchema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/zodToJsonSchema.js [app-rsc] (ecmascript)");
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
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "json_schema_exports",
    ()=>json_schema_exports,
    "toJsonSchema",
    ()=>toJsonSchema,
    "validatesOnlyStrings",
    ()=>validatesOnlyStrings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$zodToJsonSchema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/zodToJsonSchema.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/zod-to-json-schema/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/standard_schema.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$json$2d$schema$2d$processors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/json-schema-processors.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
//#region src/utils/json_schema.ts
var json_schema_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    Validator: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Validator"],
    deepCompareStrict: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deepCompareStrict"],
    toJsonSchema: ()=>toJsonSchema,
    validatesOnlyStrings: ()=>validatesOnlyStrings
});
/**
* WeakMap cache for Zod/Standard-Schema → JSON Schema conversions.
*
* Keyed on the schema object reference. Since Zod schemas are immutable and
* the same `tool.schema` reference is passed on every LLM call, this
* eliminates redundant serializations. For example, an agent with 6 tools
* doing 15 steps across 3 parallel subagents would otherwise run 270
* identical conversions per invocation.
*
* Only used when no custom `params` are passed (the common case for tool
* binding). WeakMap ensures cached entries are GC'd when the schema goes
* out of scope.
*
* @internal
*/ const _jsonSchemaCache = /* @__PURE__ */ new WeakMap();
/**
* Converts a Standard JSON schema, Zod schema or JSON schema to a JSON schema.
* Results are cached by schema reference when no custom params are passed.
* @param schema - The schema to convert.
* @param params - The parameters to pass to the toJSONSchema function.
* @returns The converted schema.
*/ function toJsonSchema(schema, params) {
    const canCache = !params && schema != null && typeof schema === "object";
    if (canCache) {
        const cached = _jsonSchemaCache.get(schema);
        if (cached) return cached;
    }
    let result;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$standard_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isStandardJsonSchema"])(schema) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodSchemaV4"])(schema)) result = schema["~standard"].jsonSchema.input({
        target: "draft-07"
    });
    else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodSchemaV4"])(schema)) {
        const inputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopZodTransformInputSchema"])(schema, true);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodObjectV4"])(inputSchema)) {
            const strictSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopZodObjectStrict"])(inputSchema, true);
            result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$json$2d$schema$2d$processors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toJSONSchema"])(strictSchema, params);
        } else result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$core$2f$json$2d$schema$2d$processors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toJSONSchema"])(schema, params);
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodSchemaV3"])(schema)) result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$zodToJsonSchema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["zodToJsonSchema"])(schema);
    else result = schema;
    if (canCache && result != null && typeof result === "object") _jsonSchemaCache.set(schema, result);
    return result;
}
/**
* Validates if a JSON schema validates only strings. May return false negatives in some edge cases
* (like recursive or unresolvable refs).
*
* @param schema - The schema to validate.
* @returns `true` if the schema validates only strings, `false` otherwise.
*/ function validatesOnlyStrings(schema) {
    if (!schema || typeof schema !== "object" || Object.keys(schema).length === 0 || Array.isArray(schema)) return false;
    if ("type" in schema) {
        if (typeof schema.type === "string") return schema.type === "string";
        if (Array.isArray(schema.type)) return schema.type.every((t)=>t === "string");
        return false;
    }
    if ("enum" in schema) return Array.isArray(schema.enum) && schema.enum.length > 0 && schema.enum.every((val)=>typeof val === "string");
    if ("const" in schema) return typeof schema.const === "string";
    if ("allOf" in schema && Array.isArray(schema.allOf)) return schema.allOf.some((subschema)=>validatesOnlyStrings(subschema));
    if ("anyOf" in schema && Array.isArray(schema.anyOf) || "oneOf" in schema && Array.isArray(schema.oneOf)) {
        const subschemas = "anyOf" in schema ? schema.anyOf : schema.oneOf;
        return subschemas.length > 0 && subschemas.every((subschema)=>validatesOnlyStrings(subschema));
    }
    if ("not" in schema) return false;
    if ("$ref" in schema && typeof schema.$ref === "string") {
        const ref = schema.$ref;
        const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dereference"])(schema);
        if (resolved[ref]) return validatesOnlyStrings(resolved[ref]);
        return false;
    }
    return false;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/tiktoken.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "encodingForModel",
    ()=>encodingForModel,
    "getEncoding",
    ()=>getEncoding,
    "tiktoken_exports",
    ()=>tiktoken_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/async_caller.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$lite$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/lite.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js [app-rsc] (ecmascript)");
;
;
;
//#region src/utils/tiktoken.ts
var tiktoken_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    encodingForModel: ()=>encodingForModel,
    getEncoding: ()=>getEncoding
});
const cache = {};
const caller = /* #__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncCaller"]({});
async function getEncoding(encoding) {
    if (!(encoding in cache)) cache[encoding] = caller.fetch(`https://tiktoken.pages.dev/js/${encoding}.json`).then((res)=>res.json()).then((data)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Tiktoken"](data)).catch((e)=>{
        delete cache[encoding];
        throw e;
    });
    return await cache[encoding];
}
async function encodingForModel(model) {
    return getEncoding((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEncodingNameForModel"])(model));
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_patch.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "json_patch_exports",
    ()=>json_patch_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/fast-json-patch/index.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
//#region src/utils/json_patch.ts
var json_patch_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    applyPatch: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyPatch"],
    compare: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["compare"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/sax-js/sax.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sax",
    ()=>sax
]);
//#region src/utils/sax-js/sax.ts
const initializeSax = function() {
    const sax = {};
    sax.parser = function(strict, opt) {
        return new SAXParser(strict, opt);
    };
    sax.SAXParser = SAXParser;
    sax.SAXStream = SAXStream;
    sax.createStream = createStream;
    sax.MAX_BUFFER_LENGTH = 65536;
    const buffers = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
    ];
    sax.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
    ];
    function SAXParser(strict, opt) {
        if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);
        var parser = this;
        clearBuffers(parser);
        parser.q = parser.c = "";
        parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
        parser.opt = opt || {};
        parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
        parser.looseCase = parser.opt.lowercase ? "toLowerCase" : "toUpperCase";
        parser.tags = [];
        parser.closed = parser.closedRoot = parser.sawRoot = false;
        parser.tag = parser.error = null;
        parser.strict = !!strict;
        parser.noscript = !!(strict || parser.opt.noscript);
        parser.state = S.BEGIN;
        parser.strictEntities = parser.opt.strictEntities;
        parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
        parser.attribList = [];
        if (parser.opt.xmlns) parser.ns = Object.create(rootNS);
        parser.trackPosition = parser.opt.position !== false;
        if (parser.trackPosition) parser.position = parser.line = parser.column = 0;
        emit(parser, "onready");
    }
    if (!Object.create) Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
    if (!Object.keys) Object.keys = function(o) {
        var a = [];
        for(var i in o)if (o.hasOwnProperty(i)) a.push(i);
        return a;
    };
    function checkBufferLength(parser) {
        var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
        var maxActual = 0;
        for(var i = 0, l = buffers.length; i < l; i++){
            var len = parser[buffers[i]].length;
            if (len > maxAllowed) switch(buffers[i]){
                case "textNode":
                    closeText(parser);
                    break;
                case "cdata":
                    emitNode(parser, "oncdata", parser.cdata);
                    parser.cdata = "";
                    break;
                case "script":
                    emitNode(parser, "onscript", parser.script);
                    parser.script = "";
                    break;
                default:
                    error(parser, "Max buffer length exceeded: " + buffers[i]);
            }
            maxActual = Math.max(maxActual, len);
        }
        parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH - maxActual + parser.position;
    }
    function clearBuffers(parser) {
        for(var i = 0, l = buffers.length; i < l; i++)parser[buffers[i]] = "";
    }
    function flushBuffers(parser) {
        closeText(parser);
        if (parser.cdata !== "") {
            emitNode(parser, "oncdata", parser.cdata);
            parser.cdata = "";
        }
        if (parser.script !== "") {
            emitNode(parser, "onscript", parser.script);
            parser.script = "";
        }
    }
    SAXParser.prototype = {
        end: function() {
            end(this);
        },
        write,
        resume: function() {
            this.error = null;
            return this;
        },
        close: function() {
            return this.write(null);
        },
        flush: function() {
            flushBuffers(this);
        }
    };
    var Stream = ReadableStream;
    if (!Stream) Stream = function() {};
    var streamWraps = sax.EVENTS.filter(function(ev) {
        return ev !== "error" && ev !== "end";
    });
    function createStream(strict, opt) {
        return new SAXStream(strict, opt);
    }
    function SAXStream(strict, opt) {
        if (!(this instanceof SAXStream)) return new SAXStream(strict, opt);
        Stream.apply(this);
        this._parser = new SAXParser(strict, opt);
        this.writable = true;
        this.readable = true;
        var me = this;
        this._parser.onend = function() {
            me.emit("end");
        };
        this._parser.onerror = function(er) {
            me.emit("error", er);
            me._parser.error = null;
        };
        this._decoder = null;
        streamWraps.forEach(function(ev) {
            Object.defineProperty(me, "on" + ev, {
                get: function() {
                    return me._parser["on" + ev];
                },
                set: function(h) {
                    if (!h) {
                        me.removeAllListeners(ev);
                        me._parser["on" + ev] = h;
                        return h;
                    }
                    me.on(ev, h);
                },
                enumerable: true,
                configurable: false
            });
        });
    }
    SAXStream.prototype = Object.create(Stream.prototype, {
        constructor: {
            value: SAXStream
        }
    });
    SAXStream.prototype.write = function(data) {
        this._parser.write(data.toString());
        this.emit("data", data);
        return true;
    };
    SAXStream.prototype.end = function(chunk) {
        if (chunk && chunk.length) this.write(chunk);
        this._parser.end();
        return true;
    };
    SAXStream.prototype.on = function(ev, handler) {
        var me = this;
        if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) me._parser["on" + ev] = function() {
            var args = arguments.length === 1 ? [
                arguments[0]
            ] : Array.apply(null, arguments);
            args.splice(0, 0, ev);
            me.emit.apply(me, args);
        };
        return Stream.prototype.on.call(me, ev, handler);
    };
    var CDATA = "[CDATA[";
    var DOCTYPE = "DOCTYPE";
    var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
    var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
    var rootNS = {
        xml: XML_NAMESPACE,
        xmlns: XMLNS_NAMESPACE
    };
    var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function isWhitespace(c) {
        return c === " " || c === "\n" || c === "\r" || c === "	";
    }
    function isQuote(c) {
        return c === "\"" || c === "'";
    }
    function isAttribEnd(c) {
        return c === ">" || isWhitespace(c);
    }
    function isMatch(regex, c) {
        return regex.test(c);
    }
    function notMatch(regex, c) {
        return !isMatch(regex, c);
    }
    var S = 0;
    sax.STATE = {
        BEGIN: S++,
        BEGIN_WHITESPACE: S++,
        TEXT: S++,
        TEXT_ENTITY: S++,
        OPEN_WAKA: S++,
        SGML_DECL: S++,
        SGML_DECL_QUOTED: S++,
        DOCTYPE: S++,
        DOCTYPE_QUOTED: S++,
        DOCTYPE_DTD: S++,
        DOCTYPE_DTD_QUOTED: S++,
        COMMENT_STARTING: S++,
        COMMENT: S++,
        COMMENT_ENDING: S++,
        COMMENT_ENDED: S++,
        CDATA: S++,
        CDATA_ENDING: S++,
        CDATA_ENDING_2: S++,
        PROC_INST: S++,
        PROC_INST_BODY: S++,
        PROC_INST_ENDING: S++,
        OPEN_TAG: S++,
        OPEN_TAG_SLASH: S++,
        ATTRIB: S++,
        ATTRIB_NAME: S++,
        ATTRIB_NAME_SAW_WHITE: S++,
        ATTRIB_VALUE: S++,
        ATTRIB_VALUE_QUOTED: S++,
        ATTRIB_VALUE_CLOSED: S++,
        ATTRIB_VALUE_UNQUOTED: S++,
        ATTRIB_VALUE_ENTITY_Q: S++,
        ATTRIB_VALUE_ENTITY_U: S++,
        CLOSE_TAG: S++,
        CLOSE_TAG_SAW_WHITE: S++,
        SCRIPT: S++,
        SCRIPT_ENDING: S++
    };
    sax.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: "\"",
        apos: "'"
    };
    sax.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: "\"",
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
    };
    Object.keys(sax.ENTITIES).forEach(function(key) {
        var e = sax.ENTITIES[key];
        var s = typeof e === "number" ? String.fromCharCode(e) : e;
        sax.ENTITIES[key] = s;
    });
    for(var s in sax.STATE)sax.STATE[sax.STATE[s]] = s;
    S = sax.STATE;
    function emit(parser, event, data) {
        parser[event] && parser[event](data);
    }
    function emitNode(parser, nodeType, data) {
        if (parser.textNode) closeText(parser);
        emit(parser, nodeType, data);
    }
    function closeText(parser) {
        parser.textNode = textopts(parser.opt, parser.textNode);
        if (parser.textNode) emit(parser, "ontext", parser.textNode);
        parser.textNode = "";
    }
    function textopts(opt, text) {
        if (opt.trim) text = text.trim();
        if (opt.normalize) text = text.replace(/\s+/g, " ");
        return text;
    }
    function error(parser, er) {
        closeText(parser);
        if (parser.trackPosition) er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c;
        er = new Error(er);
        parser.error = er;
        emit(parser, "onerror", er);
        return parser;
    }
    function end(parser) {
        if (parser.sawRoot && !parser.closedRoot) strictFail(parser, "Unclosed root tag");
        if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) error(parser, "Unexpected end");
        closeText(parser);
        parser.c = "";
        parser.closed = true;
        emit(parser, "onend");
        SAXParser.call(parser, parser.strict, parser.opt);
        return parser;
    }
    function strictFail(parser, message) {
        if (typeof parser !== "object" || !(parser instanceof SAXParser)) throw new Error("bad call to strictFail");
        if (parser.strict) error(parser, message);
    }
    function newTag(parser) {
        if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
        var parent = parser.tags[parser.tags.length - 1] || parser;
        var tag = parser.tag = {
            name: parser.tagName,
            attributes: {}
        };
        if (parser.opt.xmlns) tag.ns = parent.ns;
        parser.attribList.length = 0;
        emitNode(parser, "onopentagstart", tag);
    }
    function qname(name, attribute) {
        var qualName = name.indexOf(":") < 0 ? [
            "",
            name
        ] : name.split(":");
        var prefix = qualName[0];
        var local = qualName[1];
        if (attribute && name === "xmlns") {
            prefix = "xmlns";
            local = "";
        }
        return {
            prefix,
            local
        };
    }
    function attrib(parser) {
        if (!parser.strict) parser.attribName = parser.attribName[parser.looseCase]();
        if (parser.attribList.indexOf(parser.attribName) !== -1 || parser.tag.attributes.hasOwnProperty(parser.attribName)) {
            parser.attribName = parser.attribValue = "";
            return;
        }
        if (parser.opt.xmlns) {
            var qn = qname(parser.attribName, true);
            var prefix = qn.prefix;
            var local = qn.local;
            if (prefix === "xmlns") {
                if (local === "xml" && parser.attribValue !== XML_NAMESPACE) strictFail(parser, "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser.attribValue);
                else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE) strictFail(parser, "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser.attribValue);
                else {
                    var tag = parser.tag;
                    var parent = parser.tags[parser.tags.length - 1] || parser;
                    if (tag.ns === parent.ns) tag.ns = Object.create(parent.ns);
                    tag.ns[local] = parser.attribValue;
                }
            }
            parser.attribList.push([
                parser.attribName,
                parser.attribValue
            ]);
        } else {
            parser.tag.attributes[parser.attribName] = parser.attribValue;
            emitNode(parser, "onattribute", {
                name: parser.attribName,
                value: parser.attribValue
            });
        }
        parser.attribName = parser.attribValue = "";
    }
    function openTag(parser, selfClosing) {
        if (parser.opt.xmlns) {
            var tag = parser.tag;
            var qn = qname(parser.tagName);
            tag.prefix = qn.prefix;
            tag.local = qn.local;
            tag.uri = tag.ns[qn.prefix] || "";
            if (tag.prefix && !tag.uri) {
                strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(parser.tagName));
                tag.uri = qn.prefix;
            }
            var parent = parser.tags[parser.tags.length - 1] || parser;
            if (tag.ns && parent.ns !== tag.ns) Object.keys(tag.ns).forEach(function(p) {
                emitNode(parser, "onopennamespace", {
                    prefix: p,
                    uri: tag.ns[p]
                });
            });
            for(var i = 0, l = parser.attribList.length; i < l; i++){
                var nv = parser.attribList[i];
                var name = nv[0];
                var value = nv[1];
                var qualName = qname(name, true);
                var prefix = qualName.prefix;
                var local = qualName.local;
                var uri = prefix === "" ? "" : tag.ns[prefix] || "";
                var a = {
                    name,
                    value,
                    prefix,
                    local,
                    uri
                };
                if (prefix && prefix !== "xmlns" && !uri) {
                    strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(prefix));
                    a.uri = prefix;
                }
                parser.tag.attributes[name] = a;
                emitNode(parser, "onattribute", a);
            }
            parser.attribList.length = 0;
        }
        parser.tag.isSelfClosing = !!selfClosing;
        parser.sawRoot = true;
        parser.tags.push(parser.tag);
        emitNode(parser, "onopentag", parser.tag);
        if (!selfClosing) {
            if (!parser.noscript && parser.tagName.toLowerCase() === "script") parser.state = S.SCRIPT;
            else parser.state = S.TEXT;
            parser.tag = null;
            parser.tagName = "";
        }
        parser.attribName = parser.attribValue = "";
        parser.attribList.length = 0;
    }
    function closeTag(parser) {
        if (!parser.tagName) {
            strictFail(parser, "Weird empty close tag.");
            parser.textNode += "</>";
            parser.state = S.TEXT;
            return;
        }
        if (parser.script) {
            if (parser.tagName !== "script") {
                parser.script += "</" + parser.tagName + ">";
                parser.tagName = "";
                parser.state = S.SCRIPT;
                return;
            }
            emitNode(parser, "onscript", parser.script);
            parser.script = "";
        }
        var t = parser.tags.length;
        var tagName = parser.tagName;
        if (!parser.strict) tagName = tagName[parser.looseCase]();
        var closeTo = tagName;
        while(t--)if (parser.tags[t].name !== closeTo) strictFail(parser, "Unexpected close tag");
        else break;
        if (t < 0) {
            strictFail(parser, "Unmatched closing tag: " + parser.tagName);
            parser.textNode += "</" + parser.tagName + ">";
            parser.state = S.TEXT;
            return;
        }
        parser.tagName = tagName;
        var s = parser.tags.length;
        while(s-- > t){
            var tag = parser.tag = parser.tags.pop();
            parser.tagName = parser.tag.name;
            emitNode(parser, "onclosetag", parser.tagName);
            var x = {};
            for(var i in tag.ns)x[i] = tag.ns[i];
            var parent = parser.tags[parser.tags.length - 1] || parser;
            if (parser.opt.xmlns && tag.ns !== parent.ns) Object.keys(tag.ns).forEach(function(p) {
                var n = tag.ns[p];
                emitNode(parser, "onclosenamespace", {
                    prefix: p,
                    uri: n
                });
            });
        }
        if (t === 0) parser.closedRoot = true;
        parser.tagName = parser.attribValue = parser.attribName = "";
        parser.attribList.length = 0;
        parser.state = S.TEXT;
    }
    function parseEntity(parser) {
        var entity = parser.entity;
        var entityLC = entity.toLowerCase();
        var num;
        var numStr = "";
        if (parser.ENTITIES[entity]) return parser.ENTITIES[entity];
        if (parser.ENTITIES[entityLC]) return parser.ENTITIES[entityLC];
        entity = entityLC;
        if (entity.charAt(0) === "#") {
            if (entity.charAt(1) === "x") {
                entity = entity.slice(2);
                num = parseInt(entity, 16);
                numStr = num.toString(16);
            } else {
                entity = entity.slice(1);
                num = parseInt(entity, 10);
                numStr = num.toString(10);
            }
        }
        entity = entity.replace(/^0+/, "");
        if (isNaN(num) || numStr.toLowerCase() !== entity) {
            strictFail(parser, "Invalid character entity");
            return "&" + parser.entity + ";";
        }
        return String.fromCodePoint(num);
    }
    function beginWhiteSpace(parser, c) {
        if (c === "<") {
            parser.state = S.OPEN_WAKA;
            parser.startTagPosition = parser.position;
        } else if (!isWhitespace(c)) {
            strictFail(parser, "Non-whitespace before first tag.");
            parser.textNode = c;
            parser.state = S.TEXT;
        }
    }
    function charAt(chunk, i) {
        var result = "";
        if (i < chunk.length) result = chunk.charAt(i);
        return result;
    }
    function write(chunk) {
        var parser = this;
        if (this.error) throw this.error;
        if (parser.closed) return error(parser, "Cannot write after close. Assign an onready handler.");
        if (chunk === null) return end(parser);
        if (typeof chunk === "object") chunk = chunk.toString();
        var i = 0;
        var c = "";
        while(true){
            c = charAt(chunk, i++);
            parser.c = c;
            if (!c) break;
            if (parser.trackPosition) {
                parser.position++;
                if (c === "\n") {
                    parser.line++;
                    parser.column = 0;
                } else parser.column++;
            }
            switch(parser.state){
                case S.BEGIN:
                    parser.state = S.BEGIN_WHITESPACE;
                    if (c === "﻿") continue;
                    beginWhiteSpace(parser, c);
                    continue;
                case S.BEGIN_WHITESPACE:
                    beginWhiteSpace(parser, c);
                    continue;
                case S.TEXT:
                    if (parser.sawRoot && !parser.closedRoot) {
                        var starti = i - 1;
                        while(c && c !== "<" && c !== "&"){
                            c = charAt(chunk, i++);
                            if (c && parser.trackPosition) {
                                parser.position++;
                                if (c === "\n") {
                                    parser.line++;
                                    parser.column = 0;
                                } else parser.column++;
                            }
                        }
                        parser.textNode += chunk.substring(starti, i - 1);
                    }
                    if (c === "<" && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                        parser.state = S.OPEN_WAKA;
                        parser.startTagPosition = parser.position;
                    } else {
                        if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) strictFail(parser, "Text data outside of root node.");
                        if (c === "&") parser.state = S.TEXT_ENTITY;
                        else parser.textNode += c;
                    }
                    continue;
                case S.SCRIPT:
                    if (c === "<") parser.state = S.SCRIPT_ENDING;
                    else parser.script += c;
                    continue;
                case S.SCRIPT_ENDING:
                    if (c === "/") parser.state = S.CLOSE_TAG;
                    else {
                        parser.script += "<" + c;
                        parser.state = S.SCRIPT;
                    }
                    continue;
                case S.OPEN_WAKA:
                    if (c === "!") {
                        parser.state = S.SGML_DECL;
                        parser.sgmlDecl = "";
                    } else if (isWhitespace(c)) {} else if (isMatch(nameStart, c)) {
                        parser.state = S.OPEN_TAG;
                        parser.tagName = c;
                    } else if (c === "/") {
                        parser.state = S.CLOSE_TAG;
                        parser.tagName = "";
                    } else if (c === "?") {
                        parser.state = S.PROC_INST;
                        parser.procInstName = parser.procInstBody = "";
                    } else {
                        strictFail(parser, "Unencoded <");
                        if (parser.startTagPosition + 1 < parser.position) {
                            var pad = parser.position - parser.startTagPosition;
                            c = new Array(pad).join(" ") + c;
                        }
                        parser.textNode += "<" + c;
                        parser.state = S.TEXT;
                    }
                    continue;
                case S.SGML_DECL:
                    if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                        emitNode(parser, "onopencdata");
                        parser.state = S.CDATA;
                        parser.sgmlDecl = "";
                        parser.cdata = "";
                    } else if (parser.sgmlDecl + c === "--") {
                        parser.state = S.COMMENT;
                        parser.comment = "";
                        parser.sgmlDecl = "";
                    } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                        parser.state = S.DOCTYPE;
                        if (parser.doctype || parser.sawRoot) strictFail(parser, "Inappropriately located doctype declaration");
                        parser.doctype = "";
                        parser.sgmlDecl = "";
                    } else if (c === ">") {
                        emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
                        parser.sgmlDecl = "";
                        parser.state = S.TEXT;
                    } else if (isQuote(c)) {
                        parser.state = S.SGML_DECL_QUOTED;
                        parser.sgmlDecl += c;
                    } else parser.sgmlDecl += c;
                    continue;
                case S.SGML_DECL_QUOTED:
                    if (c === parser.q) {
                        parser.state = S.SGML_DECL;
                        parser.q = "";
                    }
                    parser.sgmlDecl += c;
                    continue;
                case S.DOCTYPE:
                    if (c === ">") {
                        parser.state = S.TEXT;
                        emitNode(parser, "ondoctype", parser.doctype);
                        parser.doctype = true;
                    } else {
                        parser.doctype += c;
                        if (c === "[") parser.state = S.DOCTYPE_DTD;
                        else if (isQuote(c)) {
                            parser.state = S.DOCTYPE_QUOTED;
                            parser.q = c;
                        }
                    }
                    continue;
                case S.DOCTYPE_QUOTED:
                    parser.doctype += c;
                    if (c === parser.q) {
                        parser.q = "";
                        parser.state = S.DOCTYPE;
                    }
                    continue;
                case S.DOCTYPE_DTD:
                    parser.doctype += c;
                    if (c === "]") parser.state = S.DOCTYPE;
                    else if (isQuote(c)) {
                        parser.state = S.DOCTYPE_DTD_QUOTED;
                        parser.q = c;
                    }
                    continue;
                case S.DOCTYPE_DTD_QUOTED:
                    parser.doctype += c;
                    if (c === parser.q) {
                        parser.state = S.DOCTYPE_DTD;
                        parser.q = "";
                    }
                    continue;
                case S.COMMENT:
                    if (c === "-") parser.state = S.COMMENT_ENDING;
                    else parser.comment += c;
                    continue;
                case S.COMMENT_ENDING:
                    if (c === "-") {
                        parser.state = S.COMMENT_ENDED;
                        parser.comment = textopts(parser.opt, parser.comment);
                        if (parser.comment) emitNode(parser, "oncomment", parser.comment);
                        parser.comment = "";
                    } else {
                        parser.comment += "-" + c;
                        parser.state = S.COMMENT;
                    }
                    continue;
                case S.COMMENT_ENDED:
                    if (c !== ">") {
                        strictFail(parser, "Malformed comment");
                        parser.comment += "--" + c;
                        parser.state = S.COMMENT;
                    } else parser.state = S.TEXT;
                    continue;
                case S.CDATA:
                    if (c === "]") parser.state = S.CDATA_ENDING;
                    else parser.cdata += c;
                    continue;
                case S.CDATA_ENDING:
                    if (c === "]") parser.state = S.CDATA_ENDING_2;
                    else {
                        parser.cdata += "]" + c;
                        parser.state = S.CDATA;
                    }
                    continue;
                case S.CDATA_ENDING_2:
                    if (c === ">") {
                        if (parser.cdata) emitNode(parser, "oncdata", parser.cdata);
                        emitNode(parser, "onclosecdata");
                        parser.cdata = "";
                        parser.state = S.TEXT;
                    } else if (c === "]") parser.cdata += "]";
                    else {
                        parser.cdata += "]]" + c;
                        parser.state = S.CDATA;
                    }
                    continue;
                case S.PROC_INST:
                    if (c === "?") parser.state = S.PROC_INST_ENDING;
                    else if (isWhitespace(c)) parser.state = S.PROC_INST_BODY;
                    else parser.procInstName += c;
                    continue;
                case S.PROC_INST_BODY:
                    if (!parser.procInstBody && isWhitespace(c)) continue;
                    else if (c === "?") parser.state = S.PROC_INST_ENDING;
                    else parser.procInstBody += c;
                    continue;
                case S.PROC_INST_ENDING:
                    if (c === ">") {
                        emitNode(parser, "onprocessinginstruction", {
                            name: parser.procInstName,
                            body: parser.procInstBody
                        });
                        parser.procInstName = parser.procInstBody = "";
                        parser.state = S.TEXT;
                    } else {
                        parser.procInstBody += "?" + c;
                        parser.state = S.PROC_INST_BODY;
                    }
                    continue;
                case S.OPEN_TAG:
                    if (isMatch(nameBody, c)) parser.tagName += c;
                    else {
                        newTag(parser);
                        if (c === ">") openTag(parser);
                        else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
                        else {
                            if (!isWhitespace(c)) strictFail(parser, "Invalid character in tag name");
                            parser.state = S.ATTRIB;
                        }
                    }
                    continue;
                case S.OPEN_TAG_SLASH:
                    if (c === ">") {
                        openTag(parser, true);
                        closeTag(parser);
                    } else {
                        strictFail(parser, "Forward-slash in opening tag not followed by >");
                        parser.state = S.ATTRIB;
                    }
                    continue;
                case S.ATTRIB:
                    if (isWhitespace(c)) continue;
                    else if (c === ">") openTag(parser);
                    else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
                    else if (isMatch(nameStart, c)) {
                        parser.attribName = c;
                        parser.attribValue = "";
                        parser.state = S.ATTRIB_NAME;
                    } else strictFail(parser, "Invalid attribute name");
                    continue;
                case S.ATTRIB_NAME:
                    if (c === "=") parser.state = S.ATTRIB_VALUE;
                    else if (c === ">") {
                        strictFail(parser, "Attribute without value");
                        parser.attribValue = parser.attribName;
                        attrib(parser);
                        openTag(parser);
                    } else if (isWhitespace(c)) parser.state = S.ATTRIB_NAME_SAW_WHITE;
                    else if (isMatch(nameBody, c)) parser.attribName += c;
                    else strictFail(parser, "Invalid attribute name");
                    continue;
                case S.ATTRIB_NAME_SAW_WHITE:
                    if (c === "=") parser.state = S.ATTRIB_VALUE;
                    else if (isWhitespace(c)) continue;
                    else {
                        strictFail(parser, "Attribute without value");
                        parser.tag.attributes[parser.attribName] = "";
                        parser.attribValue = "";
                        emitNode(parser, "onattribute", {
                            name: parser.attribName,
                            value: ""
                        });
                        parser.attribName = "";
                        if (c === ">") openTag(parser);
                        else if (isMatch(nameStart, c)) {
                            parser.attribName = c;
                            parser.state = S.ATTRIB_NAME;
                        } else {
                            strictFail(parser, "Invalid attribute name");
                            parser.state = S.ATTRIB;
                        }
                    }
                    continue;
                case S.ATTRIB_VALUE:
                    if (isWhitespace(c)) continue;
                    else if (isQuote(c)) {
                        parser.q = c;
                        parser.state = S.ATTRIB_VALUE_QUOTED;
                    } else {
                        strictFail(parser, "Unquoted attribute value");
                        parser.state = S.ATTRIB_VALUE_UNQUOTED;
                        parser.attribValue = c;
                    }
                    continue;
                case S.ATTRIB_VALUE_QUOTED:
                    if (c !== parser.q) {
                        if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_Q;
                        else parser.attribValue += c;
                        continue;
                    }
                    attrib(parser);
                    parser.q = "";
                    parser.state = S.ATTRIB_VALUE_CLOSED;
                    continue;
                case S.ATTRIB_VALUE_CLOSED:
                    if (isWhitespace(c)) parser.state = S.ATTRIB;
                    else if (c === ">") openTag(parser);
                    else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
                    else if (isMatch(nameStart, c)) {
                        strictFail(parser, "No whitespace between attributes");
                        parser.attribName = c;
                        parser.attribValue = "";
                        parser.state = S.ATTRIB_NAME;
                    } else strictFail(parser, "Invalid attribute name");
                    continue;
                case S.ATTRIB_VALUE_UNQUOTED:
                    if (!isAttribEnd(c)) {
                        if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_U;
                        else parser.attribValue += c;
                        continue;
                    }
                    attrib(parser);
                    if (c === ">") openTag(parser);
                    else parser.state = S.ATTRIB;
                    continue;
                case S.CLOSE_TAG:
                    if (!parser.tagName) {
                        if (isWhitespace(c)) continue;
                        else if (notMatch(nameStart, c)) {
                            if (parser.script) {
                                parser.script += "</" + c;
                                parser.state = S.SCRIPT;
                            } else strictFail(parser, "Invalid tagname in closing tag.");
                        } else parser.tagName = c;
                    } else if (c === ">") closeTag(parser);
                    else if (isMatch(nameBody, c)) parser.tagName += c;
                    else if (parser.script) {
                        parser.script += "</" + parser.tagName;
                        parser.tagName = "";
                        parser.state = S.SCRIPT;
                    } else {
                        if (!isWhitespace(c)) strictFail(parser, "Invalid tagname in closing tag");
                        parser.state = S.CLOSE_TAG_SAW_WHITE;
                    }
                    continue;
                case S.CLOSE_TAG_SAW_WHITE:
                    if (isWhitespace(c)) continue;
                    if (c === ">") closeTag(parser);
                    else strictFail(parser, "Invalid characters in closing tag");
                    continue;
                case S.TEXT_ENTITY:
                case S.ATTRIB_VALUE_ENTITY_Q:
                case S.ATTRIB_VALUE_ENTITY_U:
                    var returnState;
                    var buffer;
                    switch(parser.state){
                        case S.TEXT_ENTITY:
                            returnState = S.TEXT;
                            buffer = "textNode";
                            break;
                        case S.ATTRIB_VALUE_ENTITY_Q:
                            returnState = S.ATTRIB_VALUE_QUOTED;
                            buffer = "attribValue";
                            break;
                        case S.ATTRIB_VALUE_ENTITY_U:
                            returnState = S.ATTRIB_VALUE_UNQUOTED;
                            buffer = "attribValue";
                    }
                    if (c === ";") {
                        if (parser.opt.unparsedEntities) {
                            var parsedEntity = parseEntity(parser);
                            parser.entity = "";
                            parser.state = returnState;
                            parser.write(parsedEntity);
                        } else {
                            parser[buffer] += parseEntity(parser);
                            parser.entity = "";
                            parser.state = returnState;
                        }
                    } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) parser.entity += c;
                    else {
                        strictFail(parser, "Invalid character in entity name");
                        parser[buffer] += "&" + parser.entity + c;
                        parser.entity = "";
                        parser.state = returnState;
                    }
                    continue;
                default:
                    throw new Error(parser, "Unknown state: " + parser.state);
            }
        }
        if (parser.position >= parser.bufferCheckPosition) checkBufferLength(parser);
        return parser;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */ /* istanbul ignore next */ if (!String.fromCodePoint) (function() {
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        var fromCodePoint = function() {
            var MAX_SIZE = 16384;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) return "";
            var result = "";
            while(++index < length){
                var codePoint = Number(arguments[index]);
                if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) !== codePoint) throw RangeError("Invalid code point: " + codePoint);
                if (codePoint <= 65535) codeUnits.push(codePoint);
                else {
                    codePoint -= 65536;
                    highSurrogate = (codePoint >> 10) + 55296;
                    lowSurrogate = codePoint % 1024 + 56320;
                    codeUnits.push(highSurrogate, lowSurrogate);
                }
                if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                    result += stringFromCharCode.apply(null, codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        };
        /* istanbul ignore next */ if (Object.defineProperty) Object.defineProperty(String, "fromCodePoint", {
            value: fromCodePoint,
            configurable: true,
            writable: true
        });
        else String.fromCodePoint = fromCodePoint;
    })();
    return sax;
};
const sax = initializeSax();
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "types_exports",
    ()=>types_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/types/index.ts
var types_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    extendInteropZodObject: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extendInteropZodObject"],
    getInteropZodDefaultGetter: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getInteropZodDefaultGetter"],
    getInteropZodObjectShape: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getInteropZodObjectShape"],
    getSchemaDescription: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSchemaDescription"],
    interopParse: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopParse"],
    interopParseAsync: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopParseAsync"],
    interopSafeParse: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopSafeParse"],
    interopSafeParseAsync: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopSafeParseAsync"],
    interopZodObjectMakeFieldsOptional: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopZodObjectMakeFieldsOptional"],
    interopZodObjectPartial: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopZodObjectPartial"],
    interopZodObjectPassthrough: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopZodObjectPassthrough"],
    interopZodObjectStrict: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopZodObjectStrict"],
    interopZodTransformInputSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopZodTransformInputSchema"],
    isInteropZodError: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodError"],
    isInteropZodLiteral: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodLiteral"],
    isInteropZodObject: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodObject"],
    isInteropZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodSchema"],
    isShapelessZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isShapelessZodSchema"],
    isSimpleStringZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSimpleStringZodSchema"],
    isZodArrayV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodArrayV4"],
    isZodLiteralV3: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodLiteralV3"],
    isZodLiteralV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodLiteralV4"],
    isZodNullableV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodNullableV4"],
    isZodObjectV3: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodObjectV3"],
    isZodObjectV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodObjectV4"],
    isZodOptionalV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodOptionalV4"],
    isZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodSchema"],
    isZodSchemaV3: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodSchemaV3"],
    isZodSchemaV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isZodSchemaV4"]
});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/stream.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "streamMatchers",
    ()=>streamMatchers,
    "toHaveStreamOutput",
    ()=>toHaveStreamOutput,
    "toHaveStreamReasoning",
    ()=>toHaveStreamReasoning,
    "toHaveStreamText",
    ()=>toHaveStreamText,
    "toHaveStreamToolCalls",
    ()=>toHaveStreamToolCalls,
    "toHaveStreamUsage",
    ()=>toHaveStreamUsage
]);
//#region src/utils/testing/stream.ts
function isChatModelStream(received) {
    if (received == null || typeof received !== "object") return false;
    const stream = received;
    return typeof stream.text !== "undefined" && typeof stream.toolCalls !== "undefined" && typeof stream.reasoning !== "undefined" && typeof stream.usage !== "undefined" && typeof stream.output !== "undefined" && typeof stream[Symbol.asyncIterator] === "function";
}
function matchesPartialObject(actual, expected, equals) {
    if (actual == null) return false;
    return Object.entries(expected).every(([key, value])=>equals(actual[key], value));
}
function matchesStreamUsage(actual, expected, equals) {
    if (actual == null) return false;
    return matchesPartialObject(actual, expected, equals);
}
function getOutputText(message) {
    return message.content.find((block)=>block.type === "text")?.text;
}
function matchesStreamOutput(message, expected, equals) {
    if (expected.id !== void 0 && message.id !== expected.id) return false;
    if (expected.text !== void 0 && getOutputText(message) !== expected.text) return false;
    if (expected.toolCalls !== void 0) {
        const calls = message.tool_calls ?? [];
        if (calls.length !== expected.toolCalls.length) return false;
        for(let i = 0; i < expected.toolCalls.length; i++){
            const call = calls[i];
            const exp = expected.toolCalls[i];
            if (call?.name !== exp.name || !equals(call.args, exp.args)) return false;
        }
    }
    if (expected.usage !== void 0 && !matchesStreamUsage(message.usage_metadata, expected.usage, equals)) return false;
    if (expected.responseMetadata !== void 0 && !matchesPartialObject(message.response_metadata, expected.responseMetadata, equals)) return false;
    return true;
}
function invalidStreamResult(received, matcherName, utils) {
    return {
        pass: false,
        message: ()=>`${utils.matcherHint(matcherName)}\n\nExpected: ChatModelStream (return value of model.streamEvents("Hello"))\nReceived: ${utils.printReceived(received)}`,
        actual: received,
        expected: "ChatModelStream"
    };
}
function applyNot(pass, isNot) {
    return isNot ? !pass : pass;
}
async function toHaveStreamText(received, expected) {
    const { isNot, utils } = this;
    const matcherName = "toHaveStreamText";
    if (!isChatModelStream(received)) return invalidStreamResult(received, matcherName, utils);
    const actual = await received.text;
    return {
        pass: applyNot(actual === expected, isNot),
        message: ()=>`${utils.matcherHint(matcherName, void 0, void 0, {
                isNot
            })}\n\nExpected stream text: ${isNot ? "not " : ""}${utils.printExpected(expected)}\nReceived stream text: ${utils.printReceived(actual)}`,
        actual,
        expected
    };
}
async function toHaveStreamReasoning(received, expected) {
    const { isNot, utils } = this;
    const matcherName = "toHaveStreamReasoning";
    if (!isChatModelStream(received)) return invalidStreamResult(received, matcherName, utils);
    const actual = await received.reasoning;
    return {
        pass: applyNot(actual === expected, isNot),
        message: ()=>`${utils.matcherHint(matcherName, void 0, void 0, {
                isNot
            })}\n\nExpected stream reasoning: ${isNot ? "not " : ""}${utils.printExpected(expected)}\nReceived stream reasoning: ${utils.printReceived(actual)}`,
        actual,
        expected
    };
}
async function toHaveStreamToolCalls(received, expected) {
    const { isNot, utils } = this;
    const matcherName = "toHaveStreamToolCalls";
    if (!isChatModelStream(received)) return invalidStreamResult(received, matcherName, utils);
    const actual = await received.toolCalls;
    let pass = actual.length === expected.length && expected.every((exp, i)=>{
        const call = actual[i];
        return call?.name === exp.name && this.equals(call.args, exp.args);
    });
    pass = applyNot(pass, isNot);
    return {
        pass,
        message: ()=>`${utils.matcherHint(matcherName, void 0, void 0, {
                isNot
            })}\n\nExpected stream tool calls: ${utils.printExpected(expected)}\nReceived stream tool calls: ${utils.printReceived(actual.map((tc)=>({
                    name: tc.name,
                    args: tc.args
                })))}`,
        actual: actual.map((tc)=>({
                name: tc.name,
                args: tc.args
            })),
        expected
    };
}
async function toHaveStreamUsage(received, expected) {
    const { isNot, utils } = this;
    const matcherName = "toHaveStreamUsage";
    if (!isChatModelStream(received)) return invalidStreamResult(received, matcherName, utils);
    const actual = await received.usage;
    return {
        pass: applyNot(matchesStreamUsage(actual, expected, this.equals), isNot),
        message: ()=>`${utils.matcherHint(matcherName, void 0, void 0, {
                isNot
            })}\n\nExpected stream usage: ${utils.printExpected(expected)}\nReceived stream usage: ${utils.printReceived(actual)}`,
        actual,
        expected
    };
}
async function toHaveStreamOutput(received, expected) {
    const { isNot, utils } = this;
    const matcherName = "toHaveStreamOutput";
    if (!isChatModelStream(received)) return invalidStreamResult(received, matcherName, utils);
    const message = await received.output;
    return {
        pass: applyNot(matchesStreamOutput(message, expected, this.equals), isNot),
        message: ()=>`${utils.matcherHint(matcherName, void 0, void 0, {
                isNot
            })}\n\nExpected stream output: ${utils.printExpected(expected)}\nReceived stream output: ${utils.printReceived({
                id: message.id,
                text: getOutputText(message),
                tool_calls: message.tool_calls?.map((tc)=>({
                        name: tc.name,
                        args: tc.args
                    })),
                usage_metadata: message.usage_metadata,
                response_metadata: message.response_metadata
            })}`,
        actual: message,
        expected
    };
}
/** Stream matchers for `expect.extend()`. */ const streamMatchers = {
    toHaveStreamText,
    toHaveStreamReasoning,
    toHaveStreamToolCalls,
    toHaveStreamUsage,
    toHaveStreamOutput
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/openai_stream_fixtures.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asAsyncIterable",
    ()=>asAsyncIterable,
    "openAIReasoningTextChunks",
    ()=>openAIReasoningTextChunks,
    "openAITextOnlyChunks",
    ()=>openAITextOnlyChunks,
    "openAITextOnlyChunksWithUsage",
    ()=>openAITextOnlyChunksWithUsage,
    "openAIToolCallChunks",
    ()=>openAIToolCallChunks,
    "sseResponseFromOpenAIChunks",
    ()=>sseResponseFromOpenAIChunks
]);
//#region src/utils/testing/openai_stream_fixtures.ts
function asAsyncIterable(items) {
    return {
        async *[Symbol.asyncIterator] () {
            for (const item of items)yield item;
        }
    };
}
function openAITextOnlyChunksWithUsage(model = "test-model") {
    const chunks = openAITextOnlyChunks(model);
    const last = chunks[chunks.length - 1];
    chunks[chunks.length - 1] = {
        ...last,
        usage: {
            prompt_tokens: 10,
            completion_tokens: 2,
            total_tokens: 12
        }
    };
    return chunks;
}
function openAITextOnlyChunks(model = "test-model") {
    return [
        {
            id: "chatcmpl-text",
            model,
            choices: [
                {
                    index: 0,
                    delta: {
                        role: "assistant",
                        content: "Hello"
                    },
                    finish_reason: null
                }
            ]
        },
        {
            id: "chatcmpl-text",
            model,
            choices: [
                {
                    index: 0,
                    delta: {
                        content: " world"
                    },
                    finish_reason: null
                }
            ]
        },
        {
            id: "chatcmpl-text",
            model,
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: "stop"
                }
            ]
        }
    ];
}
function openAIReasoningTextChunks(model = "test-model") {
    return [
        {
            id: "chatcmpl-reason",
            model,
            choices: [
                {
                    index: 0,
                    delta: {
                        role: "assistant",
                        reasoning_content: "Let me reason..."
                    },
                    finish_reason: null
                }
            ]
        },
        {
            id: "chatcmpl-reason",
            model,
            choices: [
                {
                    index: 0,
                    delta: {
                        content: "Answer."
                    },
                    finish_reason: null
                }
            ]
        },
        {
            id: "chatcmpl-reason",
            model,
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: "stop"
                }
            ]
        }
    ];
}
function openAIToolCallChunks(model = "test-model") {
    return [
        {
            id: "chatcmpl-tools",
            model,
            choices: [
                {
                    index: 0,
                    delta: {
                        role: "assistant",
                        content: "Let me search."
                    },
                    finish_reason: null
                }
            ]
        },
        {
            id: "chatcmpl-tools",
            model,
            choices: [
                {
                    index: 0,
                    delta: {
                        tool_calls: [
                            {
                                index: 0,
                                id: "call_abc",
                                type: "function",
                                function: {
                                    name: "web_search",
                                    arguments: "{\"query\""
                                }
                            }
                        ]
                    },
                    finish_reason: null
                }
            ]
        },
        {
            id: "chatcmpl-tools",
            model,
            choices: [
                {
                    index: 0,
                    delta: {
                        tool_calls: [
                            {
                                index: 0,
                                function: {
                                    arguments: ":\"weather\"}"
                                }
                            }
                        ]
                    },
                    finish_reason: null
                }
            ]
        },
        {
            id: "chatcmpl-tools",
            model,
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: "tool_calls"
                }
            ]
        }
    ];
}
function sseResponseFromOpenAIChunks(chunks) {
    const encoder = new TextEncoder();
    return new Response(new ReadableStream({
        start (controller) {
            for (const chunk of chunks)controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            controller.close();
        }
    }), {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream"
        }
    });
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/chunk_array.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chunkArray",
    ()=>chunkArray,
    "chunk_array_exports",
    ()=>chunk_array_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/utils/chunk_array.ts
var chunk_array_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    chunkArray: ()=>chunkArray
});
const chunkArray = (arr, chunkSize)=>arr.reduce((chunks, elem, index)=>{
        const chunkIndex = Math.floor(index / chunkSize);
        chunks[chunkIndex] = (chunks[chunkIndex] || []).concat([
            elem
        ]);
        return chunks;
    }, []);
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/context.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "context",
    ()=>context,
    "context_exports",
    ()=>context_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/utils/context.ts
var context_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    context: ()=>context
});
/**
* A tagged template function for creating formatted strings.
*
* This utility provides a clean, template literal-based API for string formatting
* that can be used for prompts, descriptions, and other text formatting needs.
*
* It automatically handles whitespace normalization and indentation, making it
* ideal for multi-line strings in code.
*
* When using this utility, it will:
* - Strip common leading indentation from all lines
* - Trim leading/trailing whitespace
* - Align multi-line interpolated values to match indentation
* - Support escape sequences: `\\n` (newline), `\\`` (backtick), `\\$` (dollar), `\\{` (brace)
*
* @example
* ```typescript
* import { context } from "@langchain/core/utils/context";
*
* const role = "agent";
* const prompt = context`
*   You are an ${role}.
*   Your task is to help users.
* `;
* // Returns: "You are an agent.\nYour task is to help users."
* ```
*
* @example
* ```typescript
* // Multi-line interpolated values are aligned
* const items = "- Item 1\n- Item 2\n- Item 3";
* const message = context`
*   Shopping list:
*     ${items}
*   End of list.
* `;
* // The items will be indented to match "    " (4 spaces)
* ```
*/ function context(strings, ...values) {
    const raw = strings.raw;
    let result = "";
    for(let i = 0; i < raw.length; i++){
        const next = raw[i].replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`").replace(/\\\$/g, "$").replace(/\\\{/g, "{");
        result += next;
        if (i < values.length) {
            const value = alignValue(values[i], result);
            result += typeof value === "string" ? value : JSON.stringify(value);
        }
    }
    result = stripIndent(result);
    result = result.trim();
    result = result.replace(/\\n/g, "\n");
    return result;
}
/**
* Adjusts the indentation of a multi-line interpolated value to match the current line.
*
* @param value - The interpolated value
* @param precedingText - The text that comes before this value
* @returns The value with adjusted indentation
*/ function alignValue(value, precedingText) {
    if (typeof value !== "string" || !value.includes("\n")) return value;
    const indentMatch = precedingText.slice(precedingText.lastIndexOf("\n") + 1).match(/^(\s+)/);
    if (indentMatch) {
        const indent = indentMatch[1];
        return value.replace(/\n/g, `\n${indent}`);
    }
    return value;
}
/**
* Strips common leading indentation from all lines.
*
* @param text - The text to process
* @returns The text with common indentation removed
*/ function stripIndent(text) {
    const lines = text.split("\n");
    let minIndent = null;
    for (const line of lines){
        const match = line.match(/^(\s+)\S+/);
        if (match) {
            const indent = match[1].length;
            if (minIndent === null) minIndent = indent;
            else minIndent = Math.min(minIndent, indent);
        }
    }
    if (minIndent === null) return text;
    return lines.map((line)=>line[0] === " " || line[0] === "	" ? line.slice(minIndent) : line).join("\n");
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/event_source_parse.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventStreamContentType",
    ()=>EventStreamContentType,
    "convertEventStreamToIterableReadableDataStream",
    ()=>convertEventStreamToIterableReadableDataStream,
    "event_source_parse_exports",
    ()=>event_source_parse_exports,
    "getBytes",
    ()=>getBytes,
    "getLines",
    ()=>getLines,
    "getMessages",
    ()=>getMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/event_source_parse.ts
var event_source_parse_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    EventStreamContentType: ()=>EventStreamContentType,
    convertEventStreamToIterableReadableDataStream: ()=>convertEventStreamToIterableReadableDataStream,
    getBytes: ()=>getBytes,
    getLines: ()=>getLines,
    getMessages: ()=>getMessages
});
const EventStreamContentType = "text/event-stream";
/**
* Converts a ReadableStream into a callback pattern.
* @param stream The input ReadableStream.
* @param onChunk A function that will be called on each new byte chunk in the stream.
* @returns {Promise<void>} A promise that will be resolved when the stream closes.
*/ async function getBytes(stream, onChunk) {
    if (stream instanceof ReadableStream) {
        const reader = stream.getReader();
        while(true){
            const result = await reader.read();
            if (result.done) {
                onChunk(/* @__PURE__ */ new Uint8Array(), true);
                break;
            }
            onChunk(result.value);
        }
    } else try {
        for await (const chunk of stream)onChunk(new Uint8Array(chunk));
        onChunk(/* @__PURE__ */ new Uint8Array(), true);
    } catch (e) {
        throw new Error([
            "Parsing event source stream failed.",
            "Ensure your implementation of fetch returns a web or Node readable stream.",
            `Error: ${e.message}`
        ].join("\n"));
    }
}
/**
* Parses arbitary byte chunks into EventSource line buffers.
* Each line should be of the format "field: value" and ends with \r, \n, or \r\n.
* @param onLine A function that will be called on each new EventSource line.
* @returns A function that should be called for each incoming byte chunk.
*/ function getLines(onLine) {
    let buffer;
    let position;
    let fieldLength;
    let discardTrailingNewline = false;
    return function onChunk(arr, flush) {
        if (flush) {
            onLine(arr, 0, true);
            return;
        }
        if (buffer === void 0) {
            buffer = arr;
            position = 0;
            fieldLength = -1;
        } else buffer = concat(buffer, arr);
        const bufLength = buffer.length;
        let lineStart = 0;
        while(position < bufLength){
            if (discardTrailingNewline) {
                if (buffer[position] === 10) lineStart = ++position;
                discardTrailingNewline = false;
            }
            let lineEnd = -1;
            for(; position < bufLength && lineEnd === -1; ++position)switch(buffer[position]){
                case 58:
                    if (fieldLength === -1) fieldLength = position - lineStart;
                    break;
                case 13:
                    discardTrailingNewline = true;
                case 10:
                    lineEnd = position;
            }
            if (lineEnd === -1) break;
            onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
            lineStart = position;
            fieldLength = -1;
        }
        if (lineStart === bufLength) buffer = void 0;
        else if (lineStart !== 0) {
            buffer = buffer.subarray(lineStart);
            position -= lineStart;
        }
    };
}
/**
* Parses line buffers into EventSourceMessages.
* @param onId A function that will be called on each `id` field.
* @param onRetry A function that will be called on each `retry` field.
* @param onMessage A function that will be called on each message.
* @returns A function that should be called for each incoming line buffer.
*/ function getMessages(onMessage, onId, onRetry) {
    let message = newMessage();
    const decoder = new TextDecoder();
    return function onLine(line, fieldLength, flush) {
        if (flush) {
            if (!isEmpty(message)) {
                onMessage?.(message);
                message = newMessage();
            }
            return;
        }
        if (line.length === 0) {
            onMessage?.(message);
            message = newMessage();
        } else if (fieldLength > 0) {
            const field = decoder.decode(line.subarray(0, fieldLength));
            const valueOffset = fieldLength + (line[fieldLength + 1] === 32 ? 2 : 1);
            const value = decoder.decode(line.subarray(valueOffset));
            switch(field){
                case "data":
                    message.data = message.data ? message.data + "\n" + value : value;
                    break;
                case "event":
                    message.event = value;
                    break;
                case "id":
                    onId?.(message.id = value);
                    break;
                case "retry":
                    {
                        const retry = parseInt(value, 10);
                        if (!Number.isNaN(retry)) onRetry?.(message.retry = retry);
                        break;
                    }
            }
        }
    };
}
function concat(a, b) {
    const res = new Uint8Array(a.length + b.length);
    res.set(a);
    res.set(b, a.length);
    return res;
}
function newMessage() {
    return {
        data: "",
        event: "",
        id: "",
        retry: void 0
    };
}
function convertEventStreamToIterableReadableDataStream(stream, onMetadataEvent) {
    const dataStream = new ReadableStream({
        async start (controller) {
            const enqueueLine = getMessages((msg)=>{
                if (msg.event === "error") throw new Error(msg.data ?? "Unspecified event streaming error.");
                else if (msg.event === "metadata") onMetadataEvent?.(msg);
                else if (msg.data) controller.enqueue(msg.data);
            });
            const onLine = (line, fieldLength, flush)=>{
                enqueueLine(line, fieldLength, flush);
                if (flush) controller.close();
            };
            await getBytes(stream, getLines(onLine));
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromReadableStream(dataStream);
}
function isEmpty(message) {
    return message.data === "" && message.event === "" && message.id === "" && message.retry === void 0;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/format.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "format_exports",
    ()=>format_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/utils/format.ts
var format_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({});
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/function_calling.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToOpenAIFunction",
    ()=>convertToOpenAIFunction,
    "convertToOpenAITool",
    ()=>convertToOpenAITool,
    "function_calling_exports",
    ()=>function_calling_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/types.js [app-rsc] (ecmascript)");
;
;
;
//#region src/utils/function_calling.ts
var function_calling_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    convertToOpenAIFunction: ()=>convertToOpenAIFunction,
    convertToOpenAITool: ()=>convertToOpenAITool,
    isLangChainTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isLangChainTool"],
    isRunnableToolLike: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRunnableToolLike"],
    isStructuredTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isStructuredTool"],
    isStructuredToolParams: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isStructuredToolParams"]
});
/**
* Formats a `StructuredTool` or `RunnableToolLike` instance into a format
* that is compatible with OpenAI function calling. If `StructuredTool` or
* `RunnableToolLike` has a zod schema, the output will be converted into a
* JSON schema, which is then used as the parameters for the OpenAI tool.
*
* @param {StructuredToolInterface | RunnableToolLike} tool The tool to convert to an OpenAI function.
* @returns {FunctionDefinition} The inputted tool in OpenAI function format.
*/ function convertToOpenAIFunction(tool, fields) {
    const fieldsCopy = typeof fields === "number" ? void 0 : fields;
    return {
        name: tool.name,
        description: tool.description,
        parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(tool.schema),
        ...fieldsCopy?.strict !== void 0 ? {
            strict: fieldsCopy.strict
        } : {}
    };
}
/**
* Formats a `StructuredTool` or `RunnableToolLike` instance into a
* format that is compatible with OpenAI tool calling. If `StructuredTool` or
* `RunnableToolLike` has a zod schema, the output will be converted into a
* JSON schema, which is then used as the parameters for the OpenAI tool.
*
* @param {StructuredToolInterface | Record<string, any> | RunnableToolLike} tool The tool to convert to an OpenAI tool.
* @returns {ToolDefinition} The inputted tool in OpenAI tool format.
*/ function convertToOpenAITool(tool, fields) {
    const fieldsCopy = typeof fields === "number" ? void 0 : fields;
    let toolDef;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isLangChainTool"])(tool)) toolDef = {
        type: "function",
        function: convertToOpenAIFunction(tool)
    };
    else toolDef = tool;
    if (fieldsCopy?.strict !== void 0) toolDef.function.strict = fieldsCopy.strict;
    return toolDef;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/gateway.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_LANGSMITH_GATEWAY",
    ()=>DEFAULT_LANGSMITH_GATEWAY,
    "gateway_exports",
    ()=>gateway_exports,
    "resolveLangSmithGatewayConfig",
    ()=>resolveLangSmithGatewayConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/gateway.ts
var gateway_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    DEFAULT_LANGSMITH_GATEWAY: ()=>DEFAULT_LANGSMITH_GATEWAY,
    resolveLangSmithGatewayConfig: ()=>resolveLangSmithGatewayConfig
});
const LANGSMITH_GATEWAY = "LANGSMITH_GATEWAY";
const LANGSMITH_GATEWAY_API_KEY = "LANGSMITH_GATEWAY_API_KEY";
const LANGSMITH_API_KEY = "LANGSMITH_API_KEY";
const DEFAULT_LANGSMITH_GATEWAY = "https://gateway.smith.langchain.com";
const TRUE_VALUES = [
    "true",
    "1",
    "yes"
];
const FALSE_VALUES = [
    "false",
    "0",
    "no"
];
function resolveLangSmithGatewayBaseURL(providerPath) {
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(LANGSMITH_GATEWAY);
    if (!value || FALSE_VALUES.includes(value.toLowerCase())) return;
    return `${TRUE_VALUES.includes(value.toLowerCase()) ? DEFAULT_LANGSMITH_GATEWAY : value.replace(/\/+$/, "")}/${providerPath}`;
}
function resolveLangSmithGatewayConfig({ baseURL, providerPath }) {
    if (baseURL !== void 0) return {
        baseURL
    };
    const gatewayBaseURL = resolveLangSmithGatewayBaseURL(providerPath);
    if (gatewayBaseURL === void 0) return {};
    return {
        baseURL: gatewayBaseURL,
        apiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(LANGSMITH_GATEWAY_API_KEY) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(LANGSMITH_API_KEY)
    };
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ml-distance/similarities.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cosine",
    ()=>cosine
]);
//#region src/utils/ml-distance/similarities.ts
/**
* Returns the average of cosine distances between vectors a and b
* @param a - first vector
* @param b - second vector
*
*/ function cosine(a, b) {
    let p = 0;
    let p2 = 0;
    let q2 = 0;
    for(let i = 0; i < a.length; i++){
        p += a[i] * b[i];
        p2 += a[i] * a[i];
        q2 += b[i] * b[i];
    }
    return p / (Math.sqrt(p2) * Math.sqrt(q2));
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ml-distance/distances.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "innerProduct",
    ()=>innerProduct
]);
//#region src/utils/ml-distance/distances.ts
/**
*Returns the Inner Product similarity between vectors a and b
* @link [Inner Product Similarity algorithm](https://www.naun.org/main/NAUN/ijmmas/mmmas-49.pdf)
* @param a - first vector
* @param b - second vector
*
*/ function innerProduct(a, b) {
    let ans = 0;
    for(let i = 0; i < a.length; i++)ans += a[i] * b[i];
    return ans;
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ml-distance-euclidean/euclidean.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "euclidean",
    ()=>euclidean,
    "squaredEuclidean",
    ()=>squaredEuclidean
]);
//#region src/utils/ml-distance-euclidean/euclidean.ts
function squaredEuclidean(p, q) {
    let d = 0;
    for(let i = 0; i < p.length; i++)d += (p[i] - q[i]) * (p[i] - q[i]);
    return d;
}
function euclidean(p, q) {
    return Math.sqrt(squaredEuclidean(p, q));
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/math.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cosineSimilarity",
    ()=>cosineSimilarity,
    "euclideanDistance",
    ()=>euclideanDistance,
    "innerProduct",
    ()=>innerProduct,
    "math_exports",
    ()=>math_exports,
    "matrixFunc",
    ()=>matrixFunc,
    "maximalMarginalRelevance",
    ()=>maximalMarginalRelevance,
    "normalize",
    ()=>normalize
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2f$similarities$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ml-distance/similarities.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2f$distances$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ml-distance/distances.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2d$euclidean$2f$euclidean$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ml-distance-euclidean/euclidean.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/utils/math.ts
var math_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    cosineSimilarity: ()=>cosineSimilarity,
    euclideanDistance: ()=>euclideanDistance,
    innerProduct: ()=>innerProduct,
    matrixFunc: ()=>matrixFunc,
    maximalMarginalRelevance: ()=>maximalMarginalRelevance,
    normalize: ()=>normalize
});
/**
* Apply a row-wise function between two matrices with the same number of columns.
*
* @param {number[][]} X - The first matrix.
* @param {number[][]} Y - The second matrix.
* @param {VectorFunction} func - The function to apply.
*
* @throws {Error} If the number of columns in X and Y are not the same.
*
* @returns {number[][] | [[]]} A matrix where each row represents the result of applying the function between the corresponding rows of X and Y.
*/ function matrixFunc(X, Y, func) {
    if (X.length === 0 || X[0].length === 0 || Y.length === 0 || Y[0].length === 0) return [
        []
    ];
    if (X[0].length !== Y[0].length) throw new Error(`Number of columns in X and Y must be the same. X has shape ${[
        X.length,
        X[0].length
    ]} and Y has shape ${[
        Y.length,
        Y[0].length
    ]}.`);
    return X.map((xVector)=>Y.map((yVector)=>func(xVector, yVector)).map((similarity)=>Number.isNaN(similarity) ? 0 : similarity));
}
function normalize(M, similarity = false) {
    const max = matrixMaxVal(M);
    return M.map((row)=>row.map((val)=>similarity ? 1 - val / max : val / max));
}
/**
* This function calculates the row-wise cosine similarity between two matrices with the same number of columns.
*
* @param {number[][]} X - The first matrix.
* @param {number[][]} Y - The second matrix.
*
* @throws {Error} If the number of columns in X and Y are not the same.
*
* @returns {number[][] | [[]]} A matrix where each row represents the cosine similarity values between the corresponding rows of X and Y.
*/ function cosineSimilarity(X, Y) {
    return matrixFunc(X, Y, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2f$similarities$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cosine"]);
}
function innerProduct(X, Y) {
    return matrixFunc(X, Y, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2f$distances$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["innerProduct"]);
}
function euclideanDistance(X, Y) {
    return matrixFunc(X, Y, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2d$euclidean$2f$euclidean$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["euclidean"]);
}
/**
* This function implements the Maximal Marginal Relevance algorithm
* to select a set of embeddings that maximizes the diversity and relevance to a query embedding.
*
* @param {number[]|number[][]} queryEmbedding - The query embedding.
* @param {number[][]} embeddingList - The list of embeddings to select from.
* @param {number} [lambda=0.5] - The trade-off parameter between relevance and diversity.
* @param {number} [k=4] - The maximum number of embeddings to select.
*
* @returns {number[]} The indexes of the selected embeddings in the embeddingList.
*/ function maximalMarginalRelevance(queryEmbedding, embeddingList, lambda = .5, k = 4) {
    if (Math.min(k, embeddingList.length) <= 0) return [];
    const similarityToQuery = cosineSimilarity(Array.isArray(queryEmbedding[0]) ? queryEmbedding : [
        queryEmbedding
    ], embeddingList)[0];
    const mostSimilarEmbeddingIndex = argMax(similarityToQuery).maxIndex;
    const selectedEmbeddings = [
        embeddingList[mostSimilarEmbeddingIndex]
    ];
    const selectedEmbeddingsIndexes = [
        mostSimilarEmbeddingIndex
    ];
    while(selectedEmbeddingsIndexes.length < Math.min(k, embeddingList.length)){
        let bestScore = -Infinity;
        let bestIndex = -1;
        const similarityToSelected = cosineSimilarity(embeddingList, selectedEmbeddings);
        similarityToQuery.forEach((queryScore, queryScoreIndex)=>{
            if (selectedEmbeddingsIndexes.includes(queryScoreIndex)) return;
            const maxSimilarityToSelected = Math.max(...similarityToSelected[queryScoreIndex]);
            const score = lambda * queryScore - (1 - lambda) * maxSimilarityToSelected;
            if (score > bestScore) {
                bestScore = score;
                bestIndex = queryScoreIndex;
            }
        });
        selectedEmbeddings.push(embeddingList[bestIndex]);
        selectedEmbeddingsIndexes.push(bestIndex);
    }
    return selectedEmbeddingsIndexes;
}
/**
* Finds the index of the maximum value in the given array.
* @param {number[]} array - The input array.
*
* @returns {number} The index of the maximum value in the array. If the array is empty, returns -1.
*/ function argMax(array) {
    if (array.length === 0) return {
        maxIndex: -1,
        maxValue: NaN
    };
    let maxValue = array[0];
    let maxIndex = 0;
    for(let i = 1; i < array.length; i += 1)if (array[i] > maxValue) {
        maxIndex = i;
        maxValue = array[i];
    }
    return {
        maxIndex,
        maxValue
    };
}
function matrixMaxVal(arrays) {
    return arrays.reduce((acc, array)=>Math.max(acc, argMax(array).maxValue), 0);
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ssrf.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isCloudMetadata",
    ()=>isCloudMetadata,
    "isLocalhost",
    ()=>isLocalhost,
    "isPrivateIp",
    ()=>isPrivateIp,
    "isSafeUrl",
    ()=>isSafeUrl,
    "isSameOrigin",
    ()=>isSameOrigin,
    "ssrf_exports",
    ()=>ssrf_exports,
    "validateSafeUrl",
    ()=>validateSafeUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
;
//#region src/utils/ssrf.ts
var ssrf_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    isCloudMetadata: ()=>isCloudMetadata,
    isLocalhost: ()=>isLocalhost,
    isPrivateIp: ()=>isPrivateIp,
    isSafeUrl: ()=>isSafeUrl,
    isSameOrigin: ()=>isSameOrigin,
    validateSafeUrl: ()=>validateSafeUrl
});
const PRIVATE_IP_RANGES = [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "127.0.0.0/8",
    "169.254.0.0/16",
    "0.0.0.0/8",
    "::1/128",
    "fc00::/7",
    "fe80::/10",
    "ff00::/8"
];
const CLOUD_METADATA_IPS = [
    "169.254.169.254",
    "169.254.170.2",
    "100.100.100.200"
];
const CLOUD_METADATA_HOSTNAMES = [
    "metadata.google.internal",
    "metadata",
    "instance-data"
];
const LOCALHOST_NAMES = [
    "localhost",
    "localhost.localdomain"
];
/**
* IPv4 regex: four octets 0-255
*/ const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
/**
* Check if a string is a valid IPv4 address.
*/ function isIPv4(ip) {
    return IPV4_REGEX.test(ip);
}
/**
* Check if a string is a valid IPv6 address.
* Uses expandIpv6 for validation.
*/ function isIPv6(ip) {
    return expandIpv6(ip) !== null;
}
/**
* Check if a string is a valid IP address (IPv4 or IPv6).
*/ function isIP(ip) {
    return isIPv4(ip) || isIPv6(ip);
}
/**
* Parse an IP address string to an array of integers (for IPv4) or an array of 16-bit values (for IPv6)
* Returns null if the IP is invalid.
*/ function parseIp(ip) {
    if (isIPv4(ip)) return ip.split(".").map((octet)=>parseInt(octet, 10));
    else if (isIPv6(ip)) {
        const expanded = expandIpv6(ip);
        if (!expanded) return null;
        const parts = expanded.split(":");
        const result = [];
        for (const part of parts)result.push(parseInt(part, 16));
        return result;
    }
    return null;
}
/**
* Expand compressed IPv6 address to full form.
*/ function expandIpv6(ip) {
    if (!ip || typeof ip !== "string") return null;
    if (!ip.includes(":")) return null;
    if (!/^[0-9a-fA-F:]+$/.test(ip)) return null;
    let normalized = ip;
    if (normalized.includes("::")) {
        const parts = normalized.split("::");
        if (parts.length > 2) return null;
        const [left, right] = parts;
        const leftParts = left ? left.split(":") : [];
        const rightParts = right ? right.split(":") : [];
        const missing = 8 - (leftParts.length + rightParts.length);
        if (missing < 0) return null;
        const zeros = Array(missing).fill("0");
        normalized = [
            ...leftParts,
            ...zeros,
            ...rightParts
        ].filter((p)=>p !== "").join(":");
    }
    const parts = normalized.split(":");
    if (parts.length !== 8) return null;
    for (const part of parts){
        if (part.length === 0 || part.length > 4) return null;
        if (!/^[0-9a-fA-F]+$/.test(part)) return null;
    }
    return parts.map((p)=>p.padStart(4, "0").toLowerCase()).join(":");
}
/**
* Parse CIDR notation (e.g., "192.168.0.0/24") into network address and prefix length.
*/ function parseCidr(cidr) {
    const [addrStr, prefixStr] = cidr.split("/");
    if (!addrStr || !prefixStr) return null;
    const addr = parseIp(addrStr);
    if (!addr) return null;
    const prefixLen = parseInt(prefixStr, 10);
    if (isNaN(prefixLen)) return null;
    const isIpv6 = isIPv6(addrStr);
    if (isIpv6 && prefixLen > 128) return null;
    if (!isIpv6 && prefixLen > 32) return null;
    return {
        addr,
        prefixLen,
        isIpv6
    };
}
/**
* Check if an IP address is in a given CIDR range.
*/ function isIpInCidr(ip, cidr) {
    const ipParsed = parseIp(ip);
    if (!ipParsed) return false;
    const cidrParsed = parseCidr(cidr);
    if (!cidrParsed) return false;
    const isIpv6 = isIPv6(ip);
    if (isIpv6 !== cidrParsed.isIpv6) return false;
    const { addr: cidrAddr, prefixLen } = cidrParsed;
    if (isIpv6) for(let i = 0; i < Math.ceil(prefixLen / 16); i++){
        const mask = 65535 << 16 - Math.min(16, prefixLen - i * 16) & 65535;
        if ((ipParsed[i] & mask) !== (cidrAddr[i] & mask)) return false;
    }
    else for(let i = 0; i < Math.ceil(prefixLen / 8); i++){
        const mask = 255 << 8 - Math.min(8, prefixLen - i * 8) & 255;
        if ((ipParsed[i] & mask) !== (cidrAddr[i] & mask)) return false;
    }
    return true;
}
/**
* Check if an IP address is private (RFC 1918, loopback, link-local, etc.)
*/ function isPrivateIp(ip) {
    if (!isIP(ip)) return false;
    for (const range of PRIVATE_IP_RANGES)if (isIpInCidr(ip, range)) return true;
    return false;
}
/**
* Check if a hostname or IP is a known cloud metadata endpoint.
*/ function isCloudMetadata(hostname, ip) {
    if (CLOUD_METADATA_IPS.includes(ip || "")) return true;
    const lowerHostname = hostname.toLowerCase();
    if (CLOUD_METADATA_HOSTNAMES.includes(lowerHostname)) return true;
    return false;
}
/**
* Check if a hostname or IP is localhost.
*/ function isLocalhost(hostname, ip) {
    if (ip) {
        if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") return true;
        if (ip.startsWith("127.")) return true;
    }
    const lowerHostname = hostname.toLowerCase();
    if (LOCALHOST_NAMES.includes(lowerHostname)) return true;
    return false;
}
/**
* Validate that a URL is safe to connect to.
* Performs static validation checks against hostnames and direct IP addresses.
* Does not perform DNS resolution.
*
* @param url URL to validate
* @param options.allowPrivate Allow private IPs (default: false)
* @param options.allowHttp Allow http:// scheme (default: false)
* @returns The validated URL
* @throws Error if URL is not safe
*/ function validateSafeUrl(url, options) {
    const allowPrivate = options?.allowPrivate ?? false;
    const allowHttp = options?.allowHttp ?? false;
    try {
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch  {
            throw new Error(`Invalid URL: ${url}`);
        }
        const hostname = parsedUrl.hostname;
        if (!hostname) throw new Error("URL missing hostname.");
        if (isCloudMetadata(hostname)) throw new Error(`URL points to cloud metadata endpoint: ${hostname}`);
        if (isLocalhost(hostname)) {
            if (!allowPrivate) throw new Error(`URL points to localhost: ${hostname}`);
            return url;
        }
        const scheme = parsedUrl.protocol;
        if (scheme !== "http:" && scheme !== "https:") throw new Error(`Invalid URL scheme: ${scheme}. Only http and https are allowed.`);
        if (scheme === "http:" && !allowHttp) throw new Error("HTTP scheme not allowed. Use HTTPS or set allowHttp: true.");
        if (isIP(hostname)) {
            const ip = hostname;
            if (isLocalhost(hostname, ip)) {
                if (!allowPrivate) throw new Error(`URL points to localhost: ${hostname}`);
                return url;
            }
            if (isCloudMetadata(hostname, ip)) throw new Error(`URL resolves to cloud metadata IP: ${ip} (${hostname})`);
            if (isPrivateIp(ip)) {
                if (!allowPrivate) throw new Error(`URL resolves to private IP: ${ip} (${hostname}). Set allowPrivate: true to allow.`);
            }
            return url;
        }
        return url;
    } catch (error) {
        if (error && typeof error === "object" && "message" in error) throw error;
        throw new Error(`URL validation failed: ${error}`);
    }
}
/**
* Check if a URL is safe to connect to (non-throwing version).
*
* @param url URL to check
* @param options.allowPrivate Allow private IPs (default: false)
* @param options.allowHttp Allow http:// scheme (default: false)
* @returns true if URL is safe, false otherwise
*/ function isSafeUrl(url, options) {
    try {
        validateSafeUrl(url, options);
        return true;
    } catch  {
        return false;
    }
}
/**
* Check if two URLs have the same origin (scheme, host, port).
* Uses semantic URL parsing to prevent SSRF bypasses via URL variations.
*
* @param url1 First URL
* @param url2 Second URL
* @returns true if both URLs have the same origin, false otherwise
*/ function isSameOrigin(url1, url2) {
    try {
        return new URL(url1).origin === new URL(url2).origin;
    } catch  {
        return false;
    }
}
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/chat_models.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeChatModel",
    ()=>FakeChatModel,
    "FakeListChatModel",
    ()=>FakeListChatModel,
    "FakeStreamingChatModel",
    ()=>FakeStreamingChatModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/chat_models.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
//#region src/utils/testing/chat_models.ts
var FakeChatModel = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseChatModel"] {
    _combineLLMOutput() {
        return [];
    }
    _llmType() {
        return "fake";
    }
    async _generate(messages, options, runManager) {
        if (options?.stop?.length) return {
            generations: [
                {
                    message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"](options.stop[0]),
                    text: options.stop[0]
                }
            ]
        };
        const text = messages.map((m)=>{
            if (typeof m.content === "string") return m.content;
            return JSON.stringify(m.content, null, 2);
        }).join("\n");
        await runManager?.handleLLMNewToken(text);
        return {
            generations: [
                {
                    message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"](text),
                    text
                }
            ],
            llmOutput: {}
        };
    }
};
var FakeStreamingChatModel = class FakeStreamingChatModel extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseChatModel"] {
    sleep = 50;
    responses = [];
    chunks = [];
    toolStyle = "openai";
    thrownErrorString;
    tools = [];
    constructor({ sleep = 50, responses = [], chunks = [], toolStyle = "openai", thrownErrorString, ...rest }){
        super(rest);
        this.sleep = sleep;
        this.responses = responses;
        this.chunks = chunks;
        this.toolStyle = toolStyle;
        this.thrownErrorString = thrownErrorString;
    }
    _llmType() {
        return "fake";
    }
    bindTools(tools) {
        const merged = [
            ...this.tools,
            ...tools
        ];
        const toolDicts = merged.map((t)=>{
            switch(this.toolStyle){
                case "openai":
                    return {
                        type: "function",
                        function: {
                            name: t.name,
                            description: t.description,
                            parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                        }
                    };
                case "anthropic":
                    return {
                        name: t.name,
                        description: t.description,
                        input_schema: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                    };
                case "bedrock":
                    return {
                        toolSpec: {
                            name: t.name,
                            description: t.description,
                            inputSchema: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                        }
                    };
                case "google":
                    return {
                        name: t.name,
                        description: t.description,
                        parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                    };
                default:
                    throw new Error(`Unsupported tool style: ${this.toolStyle}`);
            }
        });
        const wrapped = this.toolStyle === "google" ? [
            {
                functionDeclarations: toolDicts
            }
        ] : toolDicts;
        const next = new FakeStreamingChatModel({
            sleep: this.sleep,
            responses: this.responses,
            chunks: this.chunks,
            toolStyle: this.toolStyle,
            thrownErrorString: this.thrownErrorString
        });
        next.tools = merged;
        return next.withConfig({
            tools: wrapped
        });
    }
    async _generate(messages, _options, _runManager) {
        if (this.thrownErrorString) throw new Error(this.thrownErrorString);
        const content = this.responses?.[0]?.content ?? messages[0].content ?? "";
        return {
            generations: [
                {
                    text: "",
                    message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"]({
                        content,
                        tool_calls: this.chunks?.[0]?.tool_calls
                    })
                }
            ]
        };
    }
    async *_streamResponseChunks(_messages, options, runManager) {
        if (this.thrownErrorString) throw new Error(this.thrownErrorString);
        if (this.chunks?.length) {
            for (const msgChunk of this.chunks){
                const cg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatGenerationChunk"]({
                    message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
                        content: msgChunk.content,
                        tool_calls: msgChunk.tool_calls,
                        additional_kwargs: msgChunk.additional_kwargs ?? {}
                    }),
                    text: msgChunk.content?.toString() ?? ""
                });
                if (options.signal?.aborted) break;
                yield cg;
                await runManager?.handleLLMNewToken(msgChunk.content, void 0, void 0, void 0, void 0, {
                    chunk: cg
                });
            }
            return;
        }
        const fallback = this.responses?.[0] ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"](typeof _messages[0].content === "string" ? _messages[0].content : "");
        const text = typeof fallback.content === "string" ? fallback.content : "";
        for (const ch of text){
            await new Promise((r)=>setTimeout(r, this.sleep));
            const cg = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatGenerationChunk"]({
                message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
                    content: ch
                }),
                text: ch
            });
            if (options.signal?.aborted) break;
            yield cg;
            await runManager?.handleLLMNewToken(ch, void 0, void 0, void 0, void 0, {
                chunk: cg
            });
        }
    }
};
/**
* A fake Chat Model that returns a predefined list of responses. It can be used
* for testing purposes.
* @example
* ```typescript
* const chat = new FakeListChatModel({
*   responses: ["I'll callback later.", "You 'console' them!"]
* });
*
* const firstMessage = new HumanMessage("You want to hear a JavaScript joke?");
* const secondMessage = new HumanMessage("How do you cheer up a JavaScript developer?");
*
* // Call the chat model with a message and log the response
* const firstResponse = await chat.call([firstMessage]);
* console.log({ firstResponse });
*
* const secondResponse = await chat.call([secondMessage]);
* console.log({ secondResponse });
* ```
*/ var FakeListChatModel = class FakeListChatModel extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseChatModel"] {
    static lc_name() {
        return "FakeListChatModel";
    }
    lc_serializable = true;
    responses;
    i = 0;
    sleep;
    emitCustomEvent = false;
    generationInfo;
    tools = [];
    toolStyle = "openai";
    constructor(params){
        super(params);
        const { responses, sleep, emitCustomEvent, generationInfo } = params;
        this.responses = responses;
        this.sleep = sleep;
        this.emitCustomEvent = emitCustomEvent ?? this.emitCustomEvent;
        this.generationInfo = generationInfo;
    }
    _combineLLMOutput() {
        return [];
    }
    _llmType() {
        return "fake-list";
    }
    async _generate(_messages, options, runManager) {
        await this._sleepIfRequested();
        if (options?.thrownErrorString) throw new Error(options.thrownErrorString);
        if (this.emitCustomEvent) await runManager?.handleCustomEvent("some_test_event", {
            someval: true
        });
        if (options?.stop?.length) return {
            generations: [
                this._formatGeneration(options.stop[0])
            ]
        };
        else {
            const response = this._currentResponse();
            this._incrementResponse();
            return {
                generations: [
                    this._formatGeneration(response)
                ],
                llmOutput: {}
            };
        }
    }
    _formatGeneration(text) {
        return {
            message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"](text),
            text
        };
    }
    async *_streamResponseChunks(_messages, options, runManager) {
        const response = this._currentResponse();
        this._incrementResponse();
        if (this.emitCustomEvent) await runManager?.handleCustomEvent("some_test_event", {
            someval: true
        });
        const responseChars = [
            ...response
        ];
        for(let i = 0; i < responseChars.length; i++){
            const text = responseChars[i];
            const isLastChunk = i === responseChars.length - 1;
            await this._sleepIfRequested();
            if (options?.thrownErrorString) throw new Error(options.thrownErrorString);
            const chunk = this._createResponseChunk(text, isLastChunk ? this.generationInfo : void 0);
            if (options.signal?.aborted) break;
            yield chunk;
            runManager?.handleLLMNewToken(text);
        }
    }
    async _sleepIfRequested() {
        if (this.sleep !== void 0) await this._sleep();
    }
    async _sleep() {
        return new Promise((resolve)=>{
            setTimeout(()=>resolve(), this.sleep);
        });
    }
    _createResponseChunk(text, generationInfo) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatGenerationChunk"]({
            message: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
                content: text
            }),
            text,
            generationInfo
        });
    }
    _currentResponse() {
        return this.responses[this.i];
    }
    _incrementResponse() {
        if (this.i < this.responses.length - 1) this.i += 1;
        else this.i = 0;
    }
    bindTools(tools) {
        const merged = [
            ...this.tools,
            ...tools
        ];
        const toolDicts = merged.map((t)=>{
            switch(this.toolStyle){
                case "openai":
                    return {
                        type: "function",
                        function: {
                            name: t.name,
                            description: t.description,
                            parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                        }
                    };
                case "anthropic":
                    return {
                        name: t.name,
                        description: t.description,
                        input_schema: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                    };
                case "bedrock":
                    return {
                        toolSpec: {
                            name: t.name,
                            description: t.description,
                            inputSchema: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                        }
                    };
                case "google":
                    return {
                        name: t.name,
                        description: t.description,
                        parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(t.schema)
                    };
                default:
                    throw new Error(`Unsupported tool style: ${this.toolStyle}`);
            }
        });
        const wrapped = this.toolStyle === "google" ? [
            {
                functionDeclarations: toolDicts
            }
        ] : toolDicts;
        const next = new FakeListChatModel({
            responses: this.responses,
            sleep: this.sleep,
            emitCustomEvent: this.emitCustomEvent,
            generationInfo: this.generationInfo
        });
        next.tools = merged;
        next.toolStyle = this.toolStyle;
        next.i = this.i;
        return next.withConfig({
            tools: wrapped
        });
    }
    withStructuredOutput(_params, _config) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunnableLambda"].from(async (input)=>{
            const message = await this.invoke(input);
            if (message.tool_calls?.[0]?.args) return message.tool_calls[0].args;
            if (typeof message.content === "string") return JSON.parse(message.content);
            throw new Error("No structured output found");
        });
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/embeddings.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeEmbeddings",
    ()=>FakeEmbeddings,
    "SyntheticEmbeddings",
    ()=>SyntheticEmbeddings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/embeddings.js [app-rsc] (ecmascript)");
;
//#region src/utils/testing/embeddings.ts
/**
* A class that provides synthetic embeddings by overriding the
* embedDocuments and embedQuery methods to generate embeddings based on
* the input documents. The embeddings are generated by converting each
* document into chunks, calculating a numerical value for each chunk, and
* returning an array of these values as the embedding.
*/ var SyntheticEmbeddings = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Embeddings"] {
    vectorSize;
    constructor(params){
        super(params ?? {});
        this.vectorSize = params?.vectorSize ?? 4;
    }
    /**
	* Generates synthetic embeddings for a list of documents.
	* @param documents List of documents to generate embeddings for.
	* @returns A promise that resolves with a list of synthetic embeddings for each document.
	*/ async embedDocuments(documents) {
        return Promise.all(documents.map((doc)=>this.embedQuery(doc)));
    }
    /**
	* Generates a synthetic embedding for a document. The document is
	* converted into chunks, a numerical value is calculated for each chunk,
	* and an array of these values is returned as the embedding.
	* @param document The document to generate an embedding for.
	* @returns A promise that resolves with a synthetic embedding for the document.
	*/ async embedQuery(document) {
        let doc = document;
        doc = doc.toLowerCase().replaceAll(/[^a-z ]/g, "");
        const padMod = doc.length % this.vectorSize;
        const padGapSize = padMod === 0 ? 0 : this.vectorSize - padMod;
        const padSize = doc.length + padGapSize;
        doc = doc.padEnd(padSize, " ");
        const chunkSize = doc.length / this.vectorSize;
        const docChunk = [];
        for(let co = 0; co < doc.length; co += chunkSize)docChunk.push(doc.slice(co, co + chunkSize));
        return docChunk.map((s)=>{
            let sum = 0;
            for(let co = 0; co < s.length; co += 1)sum += s === " " ? 0 : s.charCodeAt(co);
            return sum % 26 / 26;
        });
    }
};
/**
* A class that provides fake embeddings by overriding the embedDocuments
* and embedQuery methods to return fixed values.
*/ var FakeEmbeddings = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Embeddings"] {
    constructor(params){
        super(params ?? {});
    }
    /**
	* Generates fixed embeddings for a list of documents.
	* @param documents List of documents to generate embeddings for.
	* @returns A promise that resolves with a list of fixed embeddings for each document.
	*/ embedDocuments(documents) {
        return Promise.resolve(documents.map(()=>[
                .1,
                .2,
                .3,
                .4
            ]));
    }
    /**
	* Generates a fixed embedding for a query.
	* @param _ The query to generate an embedding for.
	* @returns A promise that resolves with a fixed embedding for the query.
	*/ embedQuery(_) {
        return Promise.resolve([
            .1,
            .2,
            .3,
            .4
        ]);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/llms.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeLLM",
    ()=>FakeLLM,
    "FakeStreamingLLM",
    ()=>FakeStreamingLLM
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/language_models/llms.js [app-rsc] (ecmascript)");
;
//#region src/utils/testing/llms.ts
var FakeLLM = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LLM"] {
    response;
    thrownErrorString;
    constructor(fields){
        super(fields);
        this.response = fields.response;
        this.thrownErrorString = fields.thrownErrorString;
    }
    _llmType() {
        return "fake";
    }
    async _call(prompt, _options, runManager) {
        if (this.thrownErrorString) throw new Error(this.thrownErrorString);
        const response = this.response ?? prompt;
        await runManager?.handleLLMNewToken(response);
        return response;
    }
};
var FakeStreamingLLM = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LLM"] {
    sleep = 50;
    responses;
    thrownErrorString;
    constructor(fields){
        super(fields);
        this.sleep = fields.sleep ?? this.sleep;
        this.responses = fields.responses;
        this.thrownErrorString = fields.thrownErrorString;
    }
    _llmType() {
        return "fake";
    }
    async _call(prompt) {
        if (this.thrownErrorString) throw new Error(this.thrownErrorString);
        const response = this.responses?.[0];
        this.responses = this.responses?.slice(1);
        return response ?? prompt;
    }
    async *_streamResponseChunks(input, _options, runManager) {
        if (this.thrownErrorString) throw new Error(this.thrownErrorString);
        const response = this.responses?.[0];
        this.responses = this.responses?.slice(1);
        for (const c of response ?? input){
            await new Promise((resolve)=>setTimeout(resolve, this.sleep));
            yield {
                text: c,
                generationInfo: {}
            };
            await runManager?.handleLLMNewToken(c);
        }
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/message_history.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeChatMessageHistory",
    ()=>FakeChatMessageHistory,
    "FakeListChatMessageHistory",
    ()=>FakeListChatMessageHistory,
    "FakeTracer",
    ()=>FakeTracer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/human.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$chat_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/chat_history.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/utils/testing/message_history.ts
var FakeChatMessageHistory = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$chat_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseChatMessageHistory"] {
    lc_namespace = [
        "langchain_core",
        "message",
        "fake"
    ];
    messages = [];
    constructor(){
        super();
    }
    async getMessages() {
        return this.messages;
    }
    async addMessage(message) {
        this.messages.push(message);
    }
    async addUserMessage(message) {
        this.messages.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"](message));
    }
    async addAIMessage(message) {
        this.messages.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"](message));
    }
    async clear() {
        this.messages = [];
    }
};
var FakeListChatMessageHistory = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$chat_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseListChatMessageHistory"] {
    lc_namespace = [
        "langchain_core",
        "message",
        "fake"
    ];
    messages = [];
    constructor(){
        super();
    }
    async addMessage(message) {
        this.messages.push(message);
    }
    async getMessages() {
        return this.messages;
    }
};
var FakeTracer = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    name = "fake_tracer";
    runs = [];
    constructor(){
        super();
    }
    persistRun(run) {
        this.runs.push(run);
        return Promise.resolve();
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/output_parsers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeSplitIntoListParser",
    ()=>FakeSplitIntoListParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
;
//#region src/utils/testing/output_parsers.ts
/**
* Parser for comma-separated values. It splits the input text by commas
* and trims the resulting values.
*/ var FakeSplitIntoListParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    lc_namespace = [
        "tests",
        "fake"
    ];
    getFormatInstructions() {
        return "";
    }
    async parse(text) {
        return text.split(",").map((value)=>value.trim());
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/retrievers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeRetriever",
    ()=>FakeRetriever
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/document.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/retrievers/index.js [app-rsc] (ecmascript)");
;
;
//#region src/utils/testing/retrievers.ts
var FakeRetriever = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$retrievers$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseRetriever"] {
    lc_namespace = [
        "test",
        "fake"
    ];
    output = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"]({
            pageContent: "foo"
        }),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"]({
            pageContent: "bar"
        })
    ];
    constructor(fields){
        super();
        this.output = fields?.output ?? this.output;
    }
    async _getRelevantDocuments(_query) {
        return this.output;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/runnables.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeRunnable",
    ()=>FakeRunnable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
;
//#region src/utils/testing/runnables.ts
var FakeRunnable = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    lc_namespace = [
        "tests",
        "fake"
    ];
    returnOptions;
    constructor(fields){
        super(fields);
        this.returnOptions = fields.returnOptions;
    }
    async invoke(input, options) {
        if (this.returnOptions) return options ?? {};
        return {
            input
        };
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/tools.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeTool",
    ()=>FakeTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tools/index.js [app-rsc] (ecmascript) <locals>");
;
//#region src/utils/testing/tools.ts
var FakeTool = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["StructuredTool"] {
    name;
    description;
    schema;
    constructor(fields){
        super(fields);
        this.name = fields.name;
        this.description = fields.description;
        this.schema = fields.schema;
    }
    async _call(arg, _runManager) {
        return JSON.stringify(arg);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/tracers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SingleRunExtractor",
    ()=>SingleRunExtractor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
;
//#region src/utils/testing/tracers.ts
var SingleRunExtractor = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    runPromiseResolver;
    runPromise;
    /** The name of the callback handler. */ name = "single_run_extractor";
    constructor(){
        super();
        this.runPromise = new Promise((extract)=>{
            this.runPromiseResolver = extract;
        });
    }
    async persistRun(run) {
        this.runPromiseResolver(run);
    }
    async extract() {
        return this.runPromise;
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/vectorstores.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FakeVectorStore",
    ()=>FakeVectorStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/documents/document.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2f$similarities$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/ml-distance/similarities.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$vectorstores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/vectorstores.js [app-rsc] (ecmascript)");
;
;
;
//#region src/utils/testing/vectorstores.ts
/**
* Class that extends `VectorStore` to store vectors in memory. Provides
* methods for adding documents, performing similarity searches, and
* creating instances from texts, documents, or an existing index.
*/ var FakeVectorStore = class FakeVectorStore extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$vectorstores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["VectorStore"] {
    memoryVectors = [];
    similarity;
    _vectorstoreType() {
        return "memory";
    }
    constructor(embeddings, { similarity, ...rest } = {}){
        super(embeddings, rest);
        this.similarity = similarity ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$ml$2d$distance$2f$similarities$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cosine"];
    }
    /**
	* Method to add documents to the memory vector store. It extracts the
	* text from each document, generates embeddings for them, and adds the
	* resulting vectors to the store.
	* @param documents Array of `Document` instances to be added to the store.
	* @returns Promise that resolves when all documents have been added.
	*/ async addDocuments(documents) {
        const texts = documents.map(({ pageContent })=>pageContent);
        return this.addVectors(await this.embeddings.embedDocuments(texts), documents);
    }
    /**
	* Method to add vectors to the memory vector store. It creates
	* `MemoryVector` instances for each vector and document pair and adds
	* them to the store.
	* @param vectors Array of vectors to be added to the store.
	* @param documents Array of `Document` instances corresponding to the vectors.
	* @returns Promise that resolves when all vectors have been added.
	*/ async addVectors(vectors, documents) {
        const memoryVectors = vectors.map((embedding, idx)=>({
                content: documents[idx].pageContent,
                embedding,
                metadata: documents[idx].metadata
            }));
        this.memoryVectors = this.memoryVectors.concat(memoryVectors);
    }
    /**
	* Method to perform a similarity search in the memory vector store. It
	* calculates the similarity between the query vector and each vector in
	* the store, sorts the results by similarity, and returns the top `k`
	* results along with their scores.
	* @param query Query vector to compare against the vectors in the store.
	* @param k Number of top results to return.
	* @param filter Optional filter function to apply to the vectors before performing the search.
	* @returns Promise that resolves with an array of tuples, each containing a `Document` and its similarity score.
	*/ async similaritySearchVectorWithScore(query, k, filter) {
        const filterFunction = (memoryVector)=>{
            if (!filter) return true;
            return filter(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"]({
                metadata: memoryVector.metadata,
                pageContent: memoryVector.content
            }));
        };
        const filteredMemoryVectors = this.memoryVectors.filter(filterFunction);
        return filteredMemoryVectors.map((vector, index)=>({
                similarity: this.similarity(query, vector.embedding),
                index
            })).sort((a, b)=>a.similarity > b.similarity ? -1 : 0).slice(0, k).map((search)=>[
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"]({
                    metadata: filteredMemoryVectors[search.index].metadata,
                    pageContent: filteredMemoryVectors[search.index].content
                }),
                search.similarity
            ]);
    }
    /**
	* Static method to create a `FakeVectorStore` instance from an array of
	* texts. It creates a `Document` for each text and metadata pair, and
	* adds them to the store.
	* @param texts Array of texts to be added to the store.
	* @param metadatas Array or single object of metadata corresponding to the texts.
	* @param embeddings `Embeddings` instance used to generate embeddings for the texts.
	* @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
	* @returns Promise that resolves with a new `FakeVectorStore` instance.
	*/ static async fromTexts(texts, metadatas, embeddings, dbConfig) {
        const docs = [];
        for(let i = 0; i < texts.length; i += 1){
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$documents$2f$document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Document"]({
                pageContent: texts[i],
                metadata
            });
            docs.push(newDoc);
        }
        return FakeVectorStore.fromDocuments(docs, embeddings, dbConfig);
    }
    /**
	* Static method to create a `FakeVectorStore` instance from an array of
	* `Document` instances. It adds the documents to the store.
	* @param docs Array of `Document` instances to be added to the store.
	* @param embeddings `Embeddings` instance used to generate embeddings for the documents.
	* @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
	* @returns Promise that resolves with a new `FakeVectorStore` instance.
	*/ static async fromDocuments(docs, embeddings, dbConfig) {
        const instance = new this(embeddings, dbConfig);
        await instance.addDocuments(docs);
        return instance;
    }
    /**
	* Static method to create a `FakeVectorStore` instance from an existing
	* index. It creates a new `FakeVectorStore` instance without adding any
	* documents or vectors.
	* @param embeddings `Embeddings` instance used to generate embeddings for the documents.
	* @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
	* @returns Promise that resolves with a new `FakeVectorStore` instance.
	*/ static async fromExistingIndex(embeddings, dbConfig) {
        return new this(embeddings, dbConfig);
    }
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "testing_exports",
    ()=>testing_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/_virtual/_rolldown/runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/openai_stream_fixtures.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/chat_models.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/embeddings.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/llms.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$message_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/message_history.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$output_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/output_parsers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$retrievers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/retrievers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$runnables$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/runnables.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$tools$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/tools.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$tracers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/tracers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$vectorstores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/testing/vectorstores.js [app-rsc] (ecmascript)");
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
//#region src/utils/testing/index.ts
var testing_exports = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$_rolldown$2f$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__exportAll"])({
    FakeChatMessageHistory: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$message_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeChatMessageHistory"],
    FakeChatModel: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeChatModel"],
    FakeEmbeddings: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeEmbeddings"],
    FakeLLM: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeLLM"],
    FakeListChatMessageHistory: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$message_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeListChatMessageHistory"],
    FakeListChatModel: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeListChatModel"],
    FakeRetriever: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$retrievers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeRetriever"],
    FakeRunnable: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$runnables$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeRunnable"],
    FakeSplitIntoListParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$output_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeSplitIntoListParser"],
    FakeStreamingChatModel: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$chat_models$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeStreamingChatModel"],
    FakeStreamingLLM: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$llms$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeStreamingLLM"],
    FakeTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$tools$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeTool"],
    FakeTracer: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$message_history$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeTracer"],
    FakeVectorStore: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$vectorstores$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FakeVectorStore"],
    SingleRunExtractor: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$tracers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SingleRunExtractor"],
    SyntheticEmbeddings: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$embeddings$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SyntheticEmbeddings"],
    asAsyncIterable: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asAsyncIterable"],
    openAIReasoningTextChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAIReasoningTextChunks"],
    openAITextOnlyChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAITextOnlyChunks"],
    openAITextOnlyChunksWithUsage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAITextOnlyChunksWithUsage"],
    openAIToolCallChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openAIToolCallChunks"],
    sseResponseFromOpenAIChunks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$openai_stream_fixtures$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sseResponseFromOpenAIChunks"],
    streamMatchers: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$testing$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["streamMatchers"]
});
;
}),
];

//# sourceMappingURL=09_2_%40langchain_core_dist_utils_001rcz6._.js.map