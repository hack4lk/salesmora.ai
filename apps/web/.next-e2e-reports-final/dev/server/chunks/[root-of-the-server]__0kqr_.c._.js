module.exports = [
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/error.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APIError",
    ()=>APIError,
    "BetterCallError",
    ()=>BetterCallError,
    "ValidationError",
    ()=>ValidationError,
    "hideInternalStackFrames",
    ()=>hideInternalStackFrames,
    "kAPIErrorHeaderSymbol",
    ()=>kAPIErrorHeaderSymbol,
    "makeErrorForHideStackFrame",
    ()=>makeErrorForHideStackFrame,
    "statusCodes",
    ()=>statusCodes
]);
//#region src/error.ts
function isErrorStackTraceLimitWritable() {
    const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
    if (desc === void 0) return Object.isExtensible(Error);
    return Object.prototype.hasOwnProperty.call(desc, "writable") ? desc.writable : desc.set !== void 0;
}
/**
* Hide internal stack frames from the error stack trace.
*/ function hideInternalStackFrames(stack) {
    const lines = stack.split("\n    at ");
    if (lines.length <= 1) return stack;
    lines.splice(1, 1);
    return lines.join("\n    at ");
}
/**
* Creates a custom error class that hides stack frames.
*/ function makeErrorForHideStackFrame(Base, clazz) {
    class HideStackFramesError extends Base {
        #hiddenStack;
        constructor(...args){
            if (isErrorStackTraceLimitWritable()) {
                const limit = Error.stackTraceLimit;
                Error.stackTraceLimit = 0;
                super(...args);
                Error.stackTraceLimit = limit;
            } else super(...args);
            const stack = /* @__PURE__ */ new Error().stack;
            if (stack) this.#hiddenStack = hideInternalStackFrames(stack.replace(/^Error/, this.name));
        }
        get errorStack() {
            return this.#hiddenStack;
        }
    }
    Object.defineProperty(HideStackFramesError.prototype, "constructor", {
        get () {
            return clazz;
        },
        enumerable: false,
        configurable: true
    });
    return HideStackFramesError;
}
const statusCodes = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    "I'M_A_TEAPOT": 418,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511
};
var InternalAPIError = class extends Error {
    status;
    body;
    headers;
    statusCode;
    constructor(status = "INTERNAL_SERVER_ERROR", body = void 0, headers = {}, statusCode = typeof status === "number" ? status : statusCodes[status]){
        super(body?.message, body?.cause ? {
            cause: body.cause
        } : void 0);
        this.status = status;
        this.body = body;
        this.headers = headers;
        this.statusCode = statusCode;
        this.name = "APIError";
        this.status = status;
        this.headers = headers;
        this.statusCode = statusCode;
        this.body = body;
    }
};
var ValidationError = class extends InternalAPIError {
    message;
    issues;
    constructor(message, issues){
        super(400, {
            message,
            code: "VALIDATION_ERROR"
        });
        this.message = message;
        this.issues = issues;
        this.issues = issues;
    }
};
var BetterCallError = class extends Error {
    constructor(message){
        super(message);
        this.name = "BetterCallError";
    }
};
const kAPIErrorHeaderSymbol = Symbol.for("better-call:api-error-headers");
const APIError = makeErrorForHideStackFrame(InternalAPIError, Error);
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/crypto.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCryptoKey",
    ()=>getCryptoKey,
    "signCookieValue",
    ()=>signCookieValue,
    "verifySignature",
    ()=>verifySignature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$5$2e$0$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.5.0/node_modules/@better-auth/utils/dist/index.mjs [app-route] (ecmascript)");
;
//#region src/crypto.ts
const algorithm = {
    name: "HMAC",
    hash: "SHA-256"
};
const getCryptoKey = async (secret)=>{
    const secretBuf = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$5$2e$0$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebcryptoSubtle"])().importKey("raw", secretBuf, algorithm, false, [
        "sign",
        "verify"
    ]);
};
const verifySignature = async (base64Signature, value, secret)=>{
    try {
        const signatureBinStr = atob(base64Signature);
        const signature = new Uint8Array(signatureBinStr.length);
        for(let i = 0, len = signatureBinStr.length; i < len; i++)signature[i] = signatureBinStr.charCodeAt(i);
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$5$2e$0$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebcryptoSubtle"])().verify(algorithm, secret, signature, new TextEncoder().encode(value));
    } catch  {
        return false;
    }
};
const makeSignature = async (value, secret)=>{
    const key = await getCryptoKey(secret);
    const signature = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$5$2e$0$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebcryptoSubtle"])().sign(algorithm.name, key, new TextEncoder().encode(value));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
};
const signCookieValue = async (value, secret)=>{
    const signature = await makeSignature(value, secret);
    value = `${value}.${signature}`;
    value = encodeURIComponent(value);
    return value;
};
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/utils.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBody",
    ()=>getBody,
    "isAPIError",
    ()=>isAPIError,
    "isRequest",
    ()=>isRequest,
    "tryCatch",
    ()=>tryCatch,
    "tryDecode",
    ()=>tryDecode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/error.mjs [app-route] (ecmascript)");
;
//#region src/utils.ts
const jsonContentTypeRegex = /^application\/([a-z0-9.+-]*\+)?json/i;
async function getBody(request, allowedMediaTypes) {
    const contentType = request.headers.get("content-type") || "";
    const normalizedContentType = contentType.toLowerCase();
    if (!request.body) return;
    if (allowedMediaTypes && allowedMediaTypes.length > 0) {
        if (!allowedMediaTypes.some((allowed)=>{
            const normalizedContentTypeBase = normalizedContentType.split(";")[0].trim();
            const normalizedAllowed = allowed.toLowerCase().trim();
            return normalizedContentTypeBase === normalizedAllowed || normalizedContentTypeBase.includes(normalizedAllowed);
        })) {
            if (!normalizedContentType) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"](415, {
                message: `Content-Type is required. Allowed types: ${allowedMediaTypes.join(", ")}`,
                code: "UNSUPPORTED_MEDIA_TYPE"
            });
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"](415, {
                message: `Content-Type "${contentType}" is not allowed. Allowed types: ${allowedMediaTypes.join(", ")}`,
                code: "UNSUPPORTED_MEDIA_TYPE"
            });
        }
    }
    if (jsonContentTypeRegex.test(normalizedContentType)) try {
        return await request.json();
    } catch (e) {
        if (e instanceof SyntaxError) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"](400, {
            message: "Invalid JSON in request body",
            code: "BAD_REQUEST"
        });
        throw e;
    }
    if (normalizedContentType.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        const result = {};
        formData.forEach((value, key)=>{
            result[key] = value.toString();
        });
        return result;
    }
    if (normalizedContentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const result = {};
        formData.forEach((value, key)=>{
            result[key] = value;
        });
        return result;
    }
    if (normalizedContentType.includes("text/plain")) return await request.text();
    if (normalizedContentType.includes("application/octet-stream")) return await request.arrayBuffer();
    if (normalizedContentType.includes("application/pdf") || normalizedContentType.includes("image/") || normalizedContentType.includes("video/")) return await request.blob();
    if (normalizedContentType.includes("application/stream") || request.body instanceof ReadableStream) return request.body;
    return await request.text();
}
function isAPIError(error) {
    return error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"] || error?.name === "APIError";
}
function tryDecode(str) {
    try {
        return str.includes("%") ? decodeURIComponent(str) : str;
    } catch  {
        return str;
    }
}
async function tryCatch(promise) {
    try {
        return {
            data: await promise,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error
        };
    }
}
/**
* Check if an object is a `Request`
* - `instanceof`: works for native Request instances
* - `toString`: handles where instanceof check fails but the object is still a valid Request
*/ function isRequest(obj) {
    return obj instanceof Request || Object.prototype.toString.call(obj) === "[object Request]";
}
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/cookies.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCookieKey",
    ()=>getCookieKey,
    "parseCookies",
    ()=>parseCookies,
    "serializeCookie",
    ()=>serializeCookie,
    "serializeSignedCookie",
    ()=>serializeSignedCookie
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$crypto$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/crypto.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/utils.mjs [app-route] (ecmascript)");
;
;
//#region src/cookies.ts
const getCookieKey = (key, prefix)=>{
    let finalKey = key;
    if (prefix) if (prefix === "secure") finalKey = "__Secure-" + key;
    else if (prefix === "host") finalKey = "__Host-" + key;
    else return;
    return finalKey;
};
/**
* Parse an HTTP Cookie header string and returning an object of all cookie
* name-value pairs.
*
* Inspired by https://github.com/unjs/cookie-es/blob/main/src/cookie/parse.ts
*
* @param str the string representing a `Cookie` header value
*/ function parseCookies(str) {
    if (typeof str !== "string") throw new TypeError("argument str must be a string");
    const cookies = /* @__PURE__ */ new Map();
    let index = 0;
    while(index < str.length){
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break;
        let endIdx = str.indexOf(";", index);
        if (endIdx === -1) endIdx = str.length;
        else if (endIdx < eqIdx) {
            index = str.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }
        const key = str.slice(index, eqIdx).trim();
        if (!cookies.has(key)) {
            let val = str.slice(eqIdx + 1, endIdx).trim();
            if (val.codePointAt(0) === 34) val = val.slice(1, -1);
            cookies.set(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryDecode"])(val));
        }
        index = endIdx + 1;
    }
    return cookies;
}
const _serialize = (key, value, opt = {})=>{
    let cookie;
    if (opt?.prefix === "secure") cookie = `${`__Secure-${key}`}=${value}`;
    else if (opt?.prefix === "host") cookie = `${`__Host-${key}`}=${value}`;
    else cookie = `${key}=${value}`;
    if (key.startsWith("__Secure-") && !opt.secure) opt.secure = true;
    if (key.startsWith("__Host-")) {
        if (!opt.secure) opt.secure = true;
        if (opt.path !== "/") opt.path = "/";
        if (opt.domain) opt.domain = void 0;
    }
    if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
        if (opt.maxAge > 3456e4) throw new Error("Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration.");
        cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
    }
    if (opt.domain && opt.prefix !== "host") cookie += `; Domain=${opt.domain}`;
    if (opt.path) cookie += `; Path=${opt.path}`;
    if (opt.expires) {
        if (opt.expires.getTime() - Date.now() > 3456e7) throw new Error("Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future.");
        cookie += `; Expires=${opt.expires.toUTCString()}`;
    }
    if (opt.httpOnly) cookie += "; HttpOnly";
    if (opt.secure) cookie += "; Secure";
    if (opt.sameSite) cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
    if (opt.partitioned) {
        if (!opt.secure) opt.secure = true;
        cookie += "; Partitioned";
    }
    return cookie;
};
const serializeCookie = (key, value, opt)=>{
    value = encodeURIComponent(value);
    return _serialize(key, value, opt);
};
const serializeSignedCookie = async (key, value, secret, opt)=>{
    value = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$crypto$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signCookieValue"])(value, secret);
    return _serialize(key, value, opt);
};
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/validator.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runValidation",
    ()=>runValidation
]);
//#region src/validator.ts
/**
* Runs validation on body and query
* @returns error and data object
*/ async function runValidation(options, context = {}) {
    const request = {
        body: context.body,
        query: context.query
    };
    if (options.body) {
        const result = await options.body["~standard"].validate(context.body);
        if (result.issues) return {
            data: null,
            error: fromError(result.issues, "body")
        };
        request.body = result.value;
    }
    if (options.query) {
        const result = await options.query["~standard"].validate(context.query);
        if (result.issues) return {
            data: null,
            error: fromError(result.issues, "query")
        };
        request.query = result.value;
    }
    if (options.requireHeaders && !context.headers) return {
        data: null,
        error: {
            message: "Headers is required",
            issues: []
        }
    };
    if (options.requireRequest && !context.request) return {
        data: null,
        error: {
            message: "Request is required",
            issues: []
        }
    };
    return {
        data: request,
        error: null
    };
}
function fromError(error, validating) {
    return {
        message: error.map((e)=>{
            return `[${e.path?.length ? `${validating}.` + e.path.map((x)=>typeof x === "object" ? x.key : x).join(".") : validating}] ${e.message}`;
        }).join("; "),
        issues: error
    };
}
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/context.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createInternalContext",
    ()=>createInternalContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$crypto$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/crypto.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/utils.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$cookies$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/cookies.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$validator$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/validator.mjs [app-route] (ecmascript)");
;
;
;
;
;
//#region src/context.ts
const createInternalContext = async (context, { options, path })=>{
    const headers = new Headers();
    let responseStatus = void 0;
    const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$validator$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runValidation"])(options, context);
    if (error) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"](error.message, error.issues);
    const requestHeaders = "headers" in context ? context.headers instanceof Headers ? context.headers : new Headers(context.headers) : "request" in context && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRequest"])(context.request) ? context.request.headers : null;
    const requestCookies = requestHeaders?.get("cookie");
    const parsedCookies = requestCookies ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$cookies$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseCookies"])(requestCookies) : void 0;
    const internalContext = {
        ...context,
        body: data.body,
        query: data.query,
        path: context.path || path || "virtual:",
        context: "context" in context && context.context ? context.context : {},
        returned: void 0,
        headers: context?.headers,
        request: context?.request,
        params: "params" in context ? context.params : void 0,
        method: context.method ?? (Array.isArray(options.method) ? options.method[0] : options.method === "*" ? "GET" : options.method),
        setHeader: (key, value)=>{
            headers.set(key, value);
        },
        getHeader: (key)=>{
            if (!requestHeaders) return null;
            return requestHeaders.get(key);
        },
        getCookie: (key, prefix)=>{
            const finalKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$cookies$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCookieKey"])(key, prefix);
            if (!finalKey) return null;
            return parsedCookies?.get(finalKey) || null;
        },
        getSignedCookie: async (key, secret, prefix)=>{
            const finalKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$cookies$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCookieKey"])(key, prefix);
            if (!finalKey) return null;
            const value = parsedCookies?.get(finalKey);
            if (!value) return null;
            const signatureStartPos = value.lastIndexOf(".");
            if (signatureStartPos < 1) return null;
            const signedValue = value.substring(0, signatureStartPos);
            const signature = value.substring(signatureStartPos + 1);
            if (signature.length !== 44 || !signature.endsWith("=")) return null;
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$crypto$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifySignature"])(signature, signedValue, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$crypto$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCryptoKey"])(secret)) ? signedValue : false;
        },
        setCookie: (key, value, options)=>{
            const cookie = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$cookies$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializeCookie"])(key, value, options);
            headers.append("set-cookie", cookie);
            return cookie;
        },
        setSignedCookie: async (key, value, secret, options)=>{
            const cookie = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$cookies$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializeSignedCookie"])(key, value, secret, options);
            headers.append("set-cookie", cookie);
            return cookie;
        },
        redirect: (url)=>{
            headers.set("location", url);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"]("FOUND", void 0, headers);
        },
        error: (status, body, headers)=>{
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"](status, body, headers);
        },
        setStatus: (status)=>{
            responseStatus = status;
        },
        json: (json, routerResponse)=>{
            if (!context.asResponse) return json;
            return {
                body: routerResponse?.body || json,
                routerResponse,
                _flag: "json"
            };
        },
        responseHeaders: headers,
        get responseStatus () {
            return responseStatus;
        }
    };
    for (const middleware of options.use || []){
        const response = await middleware({
            ...internalContext,
            returnHeaders: true,
            asResponse: false
        });
        if (response.response) Object.assign(internalContext.context, response.response);
        /**
		* Apply headers from the middleware to the endpoint headers
		*/ if (response.headers) response.headers.forEach((value, key)=>{
            internalContext.responseHeaders.set(key, value);
        });
    }
    return internalContext;
};
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/to-response.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toResponse",
    ()=>toResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/utils.mjs [app-route] (ecmascript)");
;
//#region src/to-response.ts
function isJSONSerializable(value) {
    if (value === void 0) return false;
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean" || t === null) return true;
    if (t !== "object") return false;
    if (Array.isArray(value)) return true;
    if (value.buffer) return false;
    return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
function safeStringify(obj) {
    const parents = /* @__PURE__ */ new WeakMap();
    const ids = /* @__PURE__ */ new WeakMap();
    let id = 0;
    const isAncestor = (value, holder)=>{
        let curr = holder;
        while(curr){
            if (curr === value) return true;
            curr = parents.get(curr);
        }
        return false;
    };
    return JSON.stringify(obj, function(_key, value) {
        if (typeof value === "bigint") return value.toString();
        if (typeof value === "object" && value !== null) {
            if (isAncestor(value, this)) return `[Circular ref-${ids.get(value)}]`;
            parents.set(value, this);
            if (!ids.has(value)) ids.set(value, id++);
        }
        return value;
    });
}
function isJSONResponse(value) {
    if (!value || typeof value !== "object") return false;
    return "_flag" in value && value._flag === "json";
}
/**
* Headers that MUST be stripped when building an HTTP response from
* arbitrary header input. These are request-only, hop-by-hop, or
* transport-managed headers that cause protocol violations when present
* on responses (e.g. Content-Length mismatch → net::ERR_CONTENT_LENGTH_MISMATCH).
*
* Sources:
*   - RFC 9110 §10.1   (Request Context Fields)
*   - RFC 9110 §7.6.1  (Connection / hop-by-hop)
*   - RFC 9110 §11.6-7 (Authentication credentials)
*   - RFC 9110 §12.5   (Content negotiation)
*   - RFC 9110 §13.1   (Conditional request headers)
*   - RFC 9110 §14.2   (Range requests)
*   - RFC 6265 §5.4    (Cookie)
*   - RFC 6454         (Origin)
*/ const REQUEST_ONLY_HEADERS = /* @__PURE__ */ new Set([
    "host",
    "user-agent",
    "referer",
    "from",
    "expect",
    "authorization",
    "proxy-authorization",
    "cookie",
    "origin",
    "accept-charset",
    "accept-encoding",
    "accept-language",
    "if-match",
    "if-none-match",
    "if-modified-since",
    "if-unmodified-since",
    "if-range",
    "range",
    "max-forwards",
    "connection",
    "keep-alive",
    "transfer-encoding",
    "te",
    "upgrade",
    "trailer",
    "proxy-connection",
    "content-length"
]);
function stripRequestOnlyHeaders(headers) {
    for (const name of REQUEST_ONLY_HEADERS)headers.delete(name);
}
/**
* Copy headers from `source` into `target`. `Set-Cookie` is appended (one
* header per cookie) because RFC 9110 §5.3 notes it cannot be combined
* into a single comma-separated value; other headers are set (replace).
*/ function copyHeaders(target, source) {
    if (!source) return;
    for (const [key, value] of new Headers(source).entries())if (key.toLowerCase() === "set-cookie") target.append(key, value);
    else target.set(key, value);
}
function toResponse(data, init) {
    if (data instanceof Response) {
        if (init?.headers) {
            const safeHeaders = new Headers(init.headers);
            stripRequestOnlyHeaders(safeHeaders);
            copyHeaders(data.headers, safeHeaders);
        }
        return data;
    }
    if (isJSONResponse(data)) {
        const body = data.body;
        const routerResponse = data.routerResponse;
        if (routerResponse instanceof Response) return routerResponse;
        const headers = new Headers();
        copyHeaders(headers, routerResponse?.headers);
        copyHeaders(headers, data.headers);
        if (init?.headers) {
            const safeHeaders = new Headers(init.headers);
            stripRequestOnlyHeaders(safeHeaders);
            copyHeaders(headers, safeHeaders);
        }
        headers.set("Content-Type", "application/json");
        return new Response(JSON.stringify(body), {
            ...routerResponse,
            headers,
            status: data.status ?? init?.status ?? routerResponse?.status,
            statusText: init?.statusText ?? routerResponse?.statusText
        });
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAPIError"])(data)) return toResponse(data.body, {
        status: init?.status ?? data.statusCode,
        statusText: data.status.toString(),
        headers: init?.headers || data.headers
    });
    let body = data;
    const headers = new Headers(init?.headers);
    stripRequestOnlyHeaders(headers);
    if (!data) {
        if (data === null) body = JSON.stringify(null);
        headers.set("content-type", "application/json");
    } else if (typeof data === "string") {
        body = data;
        headers.set("Content-Type", "text/plain");
    } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        body = data;
        headers.set("Content-Type", "application/octet-stream");
    } else if (data instanceof Blob) {
        body = data;
        headers.set("Content-Type", data.type || "application/octet-stream");
    } else if (data instanceof FormData) body = data;
    else if (data instanceof URLSearchParams) {
        body = data;
        headers.set("Content-Type", "application/x-www-form-urlencoded");
    } else if (data instanceof ReadableStream) {
        body = data;
        headers.set("Content-Type", "application/octet-stream");
    } else if (isJSONSerializable(data)) {
        body = safeStringify(data);
        headers.set("Content-Type", "application/json");
    }
    return new Response(body, {
        ...init,
        headers
    });
}
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/endpoint.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createEndpoint",
    ()=>createEndpoint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/utils.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$context$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/context.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$to$2d$response$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/to-response.mjs [app-route] (ecmascript)");
;
;
;
;
//#region src/endpoint.ts
function createEndpoint(pathOrOptions, handlerOrOptions, handlerOrNever) {
    const path = typeof pathOrOptions === "string" ? pathOrOptions : void 0;
    const options = typeof handlerOrOptions === "object" ? handlerOrOptions : pathOrOptions;
    const handler = typeof handlerOrOptions === "function" ? handlerOrOptions : handlerOrNever;
    if ((options.method === "GET" || options.method === "HEAD") && options.body) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BetterCallError"]("Body is not allowed with GET or HEAD methods");
    if (path && /\/{2,}/.test(path)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BetterCallError"]("Path cannot contain consecutive slashes");
    const internalHandler = async (...inputCtx)=>{
        const context = inputCtx[0] || {};
        const { data: internalContext, error: validationError } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryCatch"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$context$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createInternalContext"])(context, {
            options,
            path
        }));
        if (validationError) {
            if (!(validationError instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"])) throw validationError;
            if (options.onValidationError) await options.onValidationError({
                message: validationError.message,
                issues: validationError.issues
            });
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIError"](400, {
                message: validationError.message,
                code: "VALIDATION_ERROR"
            });
        }
        const response = await handler(internalContext).catch(async (e)=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAPIError"])(e)) {
                const onAPIError = options.onAPIError;
                if (onAPIError) await onAPIError(e);
                if (context.asResponse) return e;
            }
            throw e;
        });
        const headers = internalContext.responseHeaders;
        const status = internalContext.responseStatus;
        return context.asResponse ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$to$2d$response$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toResponse"])(response, {
            headers,
            status
        }) : context.returnHeaders ? context.returnStatus ? {
            headers,
            response,
            status
        } : {
            headers,
            response
        } : context.returnStatus ? {
            response,
            status
        } : response;
    };
    internalHandler.options = options;
    internalHandler.path = path;
    return internalHandler;
}
function combineMiddleware(local, configured) {
    return [
        ...local ?? [],
        ...configured ?? []
    ];
}
createEndpoint.create = (opts)=>{
    function createConfiguredEndpoint(...args) {
        if (args.length === 3) {
            const [path, options, handler] = args;
            return createEndpoint(path, {
                ...options,
                use: combineMiddleware(options.use, opts?.use)
            }, handler);
        }
        const [options, handler] = args;
        return createEndpoint({
            ...options,
            use: combineMiddleware(options.use, opts?.use)
        }, handler);
    }
    return createConfiguredEndpoint;
};
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/middleware.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createMiddleware",
    ()=>createMiddleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/utils.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$context$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/context.mjs [app-route] (ecmascript)");
;
;
;
//#region src/middleware.ts
function createMiddleware(optionsOrHandler, handler) {
    const internalHandler = async (inputCtx)=>{
        const context = inputCtx;
        const _handler = typeof optionsOrHandler === "function" ? optionsOrHandler : handler;
        const internalContext = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$context$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createInternalContext"])(context, {
            options: typeof optionsOrHandler === "function" ? {} : optionsOrHandler,
            path: "/"
        });
        if (!_handler) throw new Error("handler must be defined");
        try {
            const response = await _handler(internalContext);
            const headers = internalContext.responseHeaders;
            return context.returnHeaders ? {
                headers,
                response
            } : response;
        } catch (e) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAPIError"])(e)) Object.defineProperty(e, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kAPIErrorHeaderSymbol"], {
                enumerable: false,
                configurable: true,
                get () {
                    return internalContext.responseHeaders;
                }
            });
            throw e;
        }
    };
    internalHandler.options = typeof optionsOrHandler === "function" ? {} : optionsOrHandler;
    return internalHandler;
}
createMiddleware.create = (opts)=>{
    function fn(optionsOrHandler, handler) {
        if (typeof optionsOrHandler === "function") return createMiddleware({
            use: opts?.use
        }, optionsOrHandler);
        if (!handler) throw new Error("Middleware handler is required");
        return createMiddleware({
            ...optionsOrHandler,
            method: "*",
            use: [
                ...opts?.use || [],
                ...optionsOrHandler.use || []
            ]
        }, handler);
    }
    return fn;
};
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/openapi.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generator",
    ()=>generator,
    "getHTML",
    ()=>getHTML
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js [app-route] (ecmascript)");
;
//#region src/openapi.ts
const paths = {};
function getTypeFromZodType(zodType) {
    switch(zodType.constructor.name){
        case "ZodString":
            return "string";
        case "ZodNumber":
            return "number";
        case "ZodBoolean":
            return "boolean";
        case "ZodObject":
            return "object";
        case "ZodArray":
            return "array";
        default:
            return "string";
    }
}
function getParameters(options) {
    const parameters = [];
    if (options.metadata?.openapi?.parameters) {
        parameters.push(...options.metadata.openapi.parameters);
        return parameters;
    }
    if (options.query instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodObject"]) Object.entries(options.query.shape).forEach(([key, value])=>{
        if (value instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodObject"]) parameters.push({
            name: key,
            in: "query",
            schema: {
                type: getTypeFromZodType(value),
                ..."minLength" in value && value.minLength ? {
                    minLength: value.minLength
                } : {},
                description: value.description
            }
        });
    });
    return parameters;
}
function getRequestBody(options) {
    if (options.metadata?.openapi?.requestBody) return options.metadata.openapi.requestBody;
    if (!options.body) return void 0;
    if (options.body instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodObject"] || options.body instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodOptional"]) {
        const shape = options.body.shape;
        if (!shape) return void 0;
        const properties = {};
        const required = [];
        Object.entries(shape).forEach(([key, value])=>{
            if (value instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodObject"]) {
                properties[key] = {
                    type: getTypeFromZodType(value),
                    description: value.description
                };
                if (!(value instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodOptional"])) required.push(key);
            }
        });
        return {
            required: options.body instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodOptional"] ? false : options.body ? true : false,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties,
                        required
                    }
                }
            }
        };
    }
}
function getResponse(responses) {
    return {
        "400": {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string"
                            }
                        },
                        required: [
                            "message"
                        ]
                    }
                }
            },
            description: "Bad Request. Usually due to missing parameters, or invalid parameters."
        },
        "401": {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string"
                            }
                        },
                        required: [
                            "message"
                        ]
                    }
                }
            },
            description: "Unauthorized. Due to missing or invalid authentication."
        },
        "403": {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string"
                            }
                        }
                    }
                }
            },
            description: "Forbidden. You do not have permission to access this resource or to perform this action."
        },
        "404": {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string"
                            }
                        }
                    }
                }
            },
            description: "Not Found. The requested resource was not found."
        },
        "429": {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string"
                            }
                        }
                    }
                }
            },
            description: "Too Many Requests. You have exceeded the rate limit. Try again later."
        },
        "500": {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string"
                            }
                        }
                    }
                }
            },
            description: "Internal Server Error. This is a problem with the server that you cannot fix."
        },
        ...responses
    };
}
async function generator(endpoints, config) {
    const components = {
        schemas: {}
    };
    Object.entries(endpoints).forEach(([_, value])=>{
        const options = value.options;
        if (!value.path || options.metadata?.SERVER_ONLY) return;
        if (options.method === "GET") paths[value.path] = {
            get: {
                tags: [
                    "Default",
                    ...options.metadata?.openapi?.tags || []
                ],
                description: options.metadata?.openapi?.description,
                operationId: options.metadata?.openapi?.operationId,
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: getParameters(options),
                responses: getResponse(options.metadata?.openapi?.responses)
            }
        };
        if (options.method === "POST") {
            const body = getRequestBody(options);
            paths[value.path] = {
                post: {
                    tags: [
                        "Default",
                        ...options.metadata?.openapi?.tags || []
                    ],
                    description: options.metadata?.openapi?.description,
                    operationId: options.metadata?.openapi?.operationId,
                    security: [
                        {
                            bearerAuth: []
                        }
                    ],
                    parameters: getParameters(options),
                    ...body ? {
                        requestBody: body
                    } : {
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {}
                                    }
                                }
                            }
                        }
                    },
                    responses: getResponse(options.metadata?.openapi?.responses)
                }
            };
        }
    });
    return {
        openapi: "3.1.1",
        info: {
            title: "Better Auth",
            description: "API Reference for your Better Auth Instance",
            version: "1.1.0"
        },
        components,
        security: [
            {
                apiKeyCookie: []
            }
        ],
        servers: [
            {
                url: config?.url
            }
        ],
        tags: [
            {
                name: "Default",
                description: "Default endpoints that are included with Better Auth by default. These endpoints are not part of any plugin."
            }
        ],
        paths
    };
}
const getHTML = (apiReference, config)=>`<!doctype html>
<html>
  <head>
    <title>Scalar API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      type="application/json">
    ${JSON.stringify(apiReference)}
    <\/script>
	 <script>
      var configuration = {
	  	favicon: ${config?.logo ? `data:image/svg+xml;utf8,${encodeURIComponent(config.logo)}` : void 0} ,
	   	theme: ${config?.theme || "saturn"},
        metaData: {
			title: ${config?.title || "Open API Reference"},
			description: ${config?.description || "Better Call Open API"},
		}
      }
      document.getElementById('api-reference').dataset.configuration =
        JSON.stringify(configuration)
    <\/script>
	  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"><\/script>
  </body>
</html>`;
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/router.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRouter",
    ()=>createRouter$1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/utils.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$to$2d$response$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/to-response.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$endpoint$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/endpoint.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$openapi$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/openapi.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$rou3$40$0$2e$9$2e$2$2f$node_modules$2f$rou3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/rou3@0.9.2/node_modules/rou3/dist/index.mjs [app-route] (ecmascript)");
;
;
;
;
;
//#region src/router.ts
const createRouter$1 = (endpoints, config)=>{
    if (!config?.openapi?.disabled) {
        const openapi = {
            path: "/api/reference",
            ...config?.openapi
        };
        endpoints["openapi"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$endpoint$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEndpoint"])(openapi.path, {
            method: "GET"
        }, async (c)=>{
            const schema = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$openapi$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generator"])(endpoints);
            return new Response((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$openapi$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHTML"])(schema, openapi.scalar), {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        });
    }
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$rou3$40$0$2e$9$2e$2$2f$node_modules$2f$rou3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRouter"])();
    const middlewareRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$rou3$40$0$2e$9$2e$2$2f$node_modules$2f$rou3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRouter"])();
    for (const endpoint of Object.values(endpoints)){
        if (!endpoint.options || !endpoint.path) continue;
        if (endpoint.options?.metadata?.SERVER_ONLY) continue;
        const methods = Array.isArray(endpoint.options?.method) ? endpoint.options.method : [
            endpoint.options?.method
        ];
        for (const method of methods)(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$rou3$40$0$2e$9$2e$2$2f$node_modules$2f$rou3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addRoute"])(router, method, endpoint.path, endpoint);
    }
    if (config?.routerMiddleware?.length) for (const { path, middleware } of config.routerMiddleware)(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$rou3$40$0$2e$9$2e$2$2f$node_modules$2f$rou3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addRoute"])(middlewareRouter, "*", path, middleware);
    const basePath = config?.basePath && config.basePath !== "/" ? config.basePath.replace(/\/+$/, "") : "";
    const processRequest = async (request)=>{
        const url = new URL(request.url);
        const pathname = url.pathname;
        let path;
        if (basePath) {
            if (!pathname.startsWith(`${basePath}/`)) return new Response(null, {
                status: 404,
                statusText: "Not Found"
            });
            path = pathname.slice(basePath.length);
        } else path = pathname;
        if (path.length === 0 || /\/{2,}/.test(path)) return new Response(null, {
            status: 404,
            statusText: "Not Found"
        });
        const route = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$rou3$40$0$2e$9$2e$2$2f$node_modules$2f$rou3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findRoute"])(router, request.method, path);
        if (path.endsWith("/") !== route?.data?.path?.endsWith("/") && !config?.skipTrailingSlashes) return new Response(null, {
            status: 404,
            statusText: "Not Found"
        });
        if (!route?.data) return new Response(null, {
            status: 404,
            statusText: "Not Found"
        });
        const query = {};
        url.searchParams.forEach((value, key)=>{
            if (key in query) if (Array.isArray(query[key])) query[key].push(value);
            else query[key] = [
                query[key],
                value
            ];
            else query[key] = value;
        });
        const handler = route.data;
        try {
            const allowedMediaTypes = handler.options.metadata?.allowedMediaTypes || config?.allowedMediaTypes;
            const context = {
                path,
                method: request.method,
                headers: request.headers,
                params: route.params ? {
                    ...route.params
                } : {},
                request,
                body: handler.options.disableBody ? void 0 : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBody"])(handler.options.cloneRequest ? request.clone() : request, allowedMediaTypes),
                query,
                _flag: "router",
                asResponse: true,
                context: config?.routerContext
            };
            const middlewareRoutes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$rou3$40$0$2e$9$2e$2$2f$node_modules$2f$rou3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findAllRoutes"])(middlewareRouter, "*", path);
            if (middlewareRoutes?.length) for (const { data: middleware, params } of middlewareRoutes){
                const res = await middleware({
                    ...context,
                    params: params ? {
                        ...params
                    } : {},
                    asResponse: false
                });
                if (res instanceof Response) return res;
            }
            return await handler(context);
        } catch (error) {
            if (config?.onError) try {
                const errorResponse = await config.onError(error, request);
                if (errorResponse instanceof Response) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$to$2d$response$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toResponse"])(errorResponse);
            } catch (error) {
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAPIError"])(error)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$to$2d$response$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toResponse"])(error);
                throw error;
            }
            if (config?.throwError) throw error;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAPIError"])(error)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$to$2d$response$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toResponse"])(error);
            console.error(`# SERVER_ERROR: `, error);
            return new Response(null, {
                status: 500,
                statusText: "Internal Server Error"
            });
        }
    };
    return {
        handler: async (request)=>{
            const onReq = await config?.onRequest?.(request);
            if (onReq instanceof Response) return onReq;
            const req = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$utils$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRequest"])(onReq) ? onReq : request;
            const res = await processRequest(req);
            const onRes = await config?.onResponse?.(res, req);
            if (onRes instanceof Response) return onRes;
            return res;
        },
        endpoints
    };
};
;
}),
"[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$error$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/error.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$cookies$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/cookies.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$context$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/context.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$to$2d$response$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/to-response.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$endpoint$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/endpoint.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$middleware$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/middleware.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$openapi$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/openapi.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$better$2d$call$40$1$2e$4$2e$0_zod$40$4$2e$6$2e$5$2f$node_modules$2f$better$2d$call$2f$dist$2f$router$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/better-call@1.4.0_zod@4.6.5/node_modules/better-call/dist/router.mjs [app-route] (ecmascript)");
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
"[project]/node_modules/.pnpm/@better-auth+utils@0.5.0/node_modules/@better-auth/utils/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getWebcryptoSubtle",
    ()=>getWebcryptoSubtle
]);
//#region src/index.ts
function getWebcryptoSubtle() {
    const cr = typeof globalThis !== "undefined" && globalThis.crypto;
    if (cr && typeof cr.subtle === "object" && cr.subtle != null) return cr.subtle;
    throw new Error("crypto.subtle must be defined");
}
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/random.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRandomStringGenerator",
    ()=>createRandomStringGenerator
]);
function expandAlphabet(alphabet) {
    switch(alphabet){
        case "a-z":
            return "abcdefghijklmnopqrstuvwxyz";
        case "A-Z":
            return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        case "0-9":
            return "0123456789";
        case "-_":
            return "-_";
        default:
            throw new Error(`Unsupported alphabet: ${alphabet}`);
    }
}
function createRandomStringGenerator(...baseAlphabets) {
    const baseCharSet = baseAlphabets.map(expandAlphabet).join("");
    if (baseCharSet.length === 0) {
        throw new Error("No valid characters provided for random string generation.");
    }
    const baseCharSetLength = baseCharSet.length;
    return (length, ...alphabets)=>{
        if (length <= 0) {
            throw new Error("Length must be a positive integer.");
        }
        let charSet = baseCharSet;
        let charSetLength = baseCharSetLength;
        if (alphabets.length > 0) {
            charSet = alphabets.map(expandAlphabet).join("");
            charSetLength = charSet.length;
        }
        const maxValid = Math.floor(256 / charSetLength) * charSetLength;
        const buf = new Uint8Array(length * 2);
        const bufLength = buf.length;
        let result = "";
        let bufIndex = bufLength;
        let rand;
        while(result.length < length){
            if (bufIndex >= bufLength) {
                crypto.getRandomValues(buf);
                bufIndex = 0;
            }
            rand = buf[bufIndex++];
            if (rand < maxValid) {
                result += charSet[rand % charSetLength];
            }
        }
        return result;
    };
}
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/password.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const config = {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64
};
function generateKey(password, salt) {
    return new Promise((resolve, reject)=>{
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["scrypt"])(password.normalize("NFKC"), salt, config.dkLen, {
            N: config.N,
            r: config.r,
            p: config.p,
            maxmem: 128 * config.N * config.r * 2
        }, (err, key)=>{
            if (err) reject(err);
            else resolve(key);
        });
    });
}
async function hashPassword(password) {
    const salt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16).toString("hex");
    const key = await generateKey(password, salt);
    return `${salt}:${key.toString("hex")}`;
}
async function verifyPassword(hash, password) {
    const [salt, key] = hash.split(":");
    if (!salt || !key) {
        throw new Error("Invalid password hash");
    }
    const targetKey = await generateKey(password, salt);
    return targetKey.toString("hex") === key;
}
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/base64.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "base64",
    ()=>base64,
    "base64Url",
    ()=>base64Url
]);
function getAlphabet(urlSafe) {
    return urlSafe ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
}
function base64Encode(data, alphabet, padding) {
    let result = "";
    let buffer = 0;
    let shift = 0;
    for (const byte of data){
        buffer = buffer << 8 | byte;
        shift += 8;
        while(shift >= 6){
            shift -= 6;
            result += alphabet[buffer >> shift & 63];
        }
    }
    if (shift > 0) {
        result += alphabet[buffer << 6 - shift & 63];
    }
    if (padding) {
        const padCount = (4 - result.length % 4) % 4;
        result += "=".repeat(padCount);
    }
    return result;
}
function base64Decode(data, alphabet) {
    const decodeMap = /* @__PURE__ */ new Map();
    for(let i = 0; i < alphabet.length; i++){
        decodeMap.set(alphabet[i], i);
    }
    const result = [];
    let buffer = 0;
    let bitsCollected = 0;
    for (const char of data){
        if (char === "=") break;
        const value = decodeMap.get(char);
        if (value === void 0) {
            throw new Error(`Invalid Base64 character: ${char}`);
        }
        buffer = buffer << 6 | value;
        bitsCollected += 6;
        if (bitsCollected >= 8) {
            bitsCollected -= 8;
            result.push(buffer >> bitsCollected & 255);
        }
    }
    return Uint8Array.from(result);
}
const base64 = {
    encode (data, options = {}) {
        const alphabet = getAlphabet(false);
        const buffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
        return base64Encode(buffer, alphabet, options.padding ?? true);
    },
    decode (data) {
        if (typeof data !== "string") {
            data = new TextDecoder().decode(data);
        }
        const urlSafe = data.includes("-") || data.includes("_");
        const alphabet = getAlphabet(urlSafe);
        return base64Decode(data, alphabet);
    }
};
const base64Url = {
    encode (data, options = {}) {
        const alphabet = getAlphabet(true);
        const buffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
        return base64Encode(buffer, alphabet, options.padding ?? true);
    },
    decode (data) {
        const urlSafe = data.includes("-") || data.includes("_");
        const alphabet = getAlphabet(urlSafe);
        return base64Decode(data, alphabet);
    }
};
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/binary.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "binary",
    ()=>binary
]);
const decoders = /* @__PURE__ */ new Map();
const encoder = new TextEncoder();
const binary = {
    decode: (data, encoding = "utf-8")=>{
        if (!decoders.has(encoding)) {
            decoders.set(encoding, new TextDecoder(encoding));
        }
        const decoder = decoders.get(encoding);
        return decoder.decode(data);
    },
    encode: encoder.encode
};
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/hex.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hex",
    ()=>hex
]);
const hexadecimal = "0123456789abcdef";
const hex = {
    encode: (data)=>{
        if (typeof data === "string") {
            data = new TextEncoder().encode(data);
        }
        if (data.byteLength === 0) {
            return "";
        }
        const buffer = new Uint8Array(data);
        let result = "";
        for (const byte of buffer){
            result += byte.toString(16).padStart(2, "0");
        }
        return result;
    },
    decode: (data)=>{
        if (!data) {
            return "";
        }
        if (typeof data === "string") {
            if (data.length % 2 !== 0) {
                throw new Error("Invalid hexadecimal string");
            }
            if (!new RegExp(`^[${hexadecimal}]+$`).test(data)) {
                throw new Error("Invalid hexadecimal string");
            }
            const result = new Uint8Array(data.length / 2);
            for(let i = 0; i < data.length; i += 2){
                result[i / 2] = parseInt(data.slice(i, i + 2), 16);
            }
            return new TextDecoder().decode(result);
        }
        return new TextDecoder().decode(data);
    }
};
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getWebcryptoSubtle",
    ()=>getWebcryptoSubtle
]);
function getWebcryptoSubtle() {
    const cr = typeof globalThis !== "undefined" && globalThis.crypto;
    if (cr && typeof cr.subtle === "object" && cr.subtle != null) return cr.subtle;
    throw new Error("crypto.subtle must be defined");
}
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/hmac.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createHMAC",
    ()=>createHMAC
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$hex$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/hex.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/base64.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/index.mjs [app-route] (ecmascript)");
;
;
;
const createHMAC = (algorithm = "SHA-256", encoding = "none")=>{
    const hmac = {
        importKey: async (key, keyUsage)=>{
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebcryptoSubtle"])().importKey("raw", typeof key === "string" ? new TextEncoder().encode(key) : key, {
                name: "HMAC",
                hash: {
                    name: algorithm
                }
            }, false, [
                keyUsage
            ]);
        },
        sign: async (hmacKey, data)=>{
            if (typeof hmacKey === "string") {
                hmacKey = await hmac.importKey(hmacKey, "sign");
            }
            const signature = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebcryptoSubtle"])().sign("HMAC", hmacKey, typeof data === "string" ? new TextEncoder().encode(data) : data);
            if (encoding === "hex") {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$hex$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hex"].encode(signature);
            }
            if (encoding === "base64" || encoding === "base64url" || encoding === "base64urlnopad") {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["base64Url"].encode(signature, {
                    padding: encoding !== "base64urlnopad"
                });
            }
            return signature;
        },
        verify: async (hmacKey, data, signature)=>{
            if (typeof hmacKey === "string") {
                hmacKey = await hmac.importKey(hmacKey, "verify");
            }
            if (encoding === "hex") {
                signature = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$hex$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hex"].decode(signature);
            }
            if (encoding === "base64" || encoding === "base64url" || encoding === "base64urlnopad") {
                signature = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["base64"].decode(signature);
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebcryptoSubtle"])().verify("HMAC", hmacKey, typeof signature === "string" ? new TextEncoder().encode(signature) : signature, typeof data === "string" ? new TextEncoder().encode(data) : data);
        }
    };
    return hmac;
};
;
}),
"[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/hash.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createHash",
    ()=>createHash
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/base64.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/index.mjs [app-route] (ecmascript)");
;
;
function createHash(algorithm, encoding) {
    return {
        digest: async (input)=>{
            const encoder = new TextEncoder();
            const data = typeof input === "string" ? encoder.encode(input) : input;
            const hashBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWebcryptoSubtle"])().digest(algorithm, data);
            if (encoding === "hex") {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map((b)=>b.toString(16).padStart(2, "0")).join("");
                return hashHex;
            }
            if (encoding === "base64" || encoding === "base64url" || encoding === "base64urlnopad") {
                if (encoding.includes("url")) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["base64Url"].encode(hashBuffer, {
                        padding: encoding !== "base64urlnopad"
                    });
                }
                const hashBase64 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["base64"].encode(hashBuffer);
                return hashBase64;
            }
            return hashBuffer;
        }
    };
}
;
}),
"[project]/node_modules/.pnpm/rou3@0.9.2/node_modules/rou3/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NullProtoObj",
    ()=>NullProtoObj,
    "addRoute",
    ()=>addRoute,
    "compareRoutes",
    ()=>compareRoutes,
    "createRouter",
    ()=>createRouter,
    "findAllRoutes",
    ()=>findAllRoutes,
    "findOverlappingRoutes",
    ()=>findOverlappingRoutes,
    "findRoute",
    ()=>findRoute,
    "regExpToRoute",
    ()=>regExpToRoute,
    "removeRoute",
    ()=>removeRoute,
    "routeNodeKeys",
    ()=>routeNodeKeys,
    "routeToRegExp",
    ()=>routeToRegExp,
    "routesOverlap",
    ()=>routesOverlap
]);
const NullProtoObj = /* @__PURE__ */ (()=>{
    const e = function() {};
    return e.prototype = Object.create(null), Object.freeze(e.prototype), e;
})();
function createRouter() {
    return {
        root: {
            key: ""
        },
        static: new NullProtoObj()
    };
}
function scanFirstGroup(path) {
    let i = 0;
    let depth = 0;
    for(; i < path.length; i++){
        const c = path.charCodeAt(i);
        if (c === 92) i++;
        else if (c === 40) depth++;
        else if (c === 41 && depth > 0) depth--;
        else if (c === 123 && depth === 0) break;
    }
    if (i >= path.length) return;
    let j = i + 1;
    depth = 0;
    for(; j < path.length; j++){
        const c = path.charCodeAt(j);
        if (c === 92) j++;
        else if (c === 40) depth++;
        else if (c === 41 && depth > 0) depth--;
        else if (c === 125 && depth === 0) break;
    }
    if (j >= path.length) return;
    const mod = path[j + 1];
    const hasMod = mod === "?" || mod === "+" || mod === "*";
    return [
        path.slice(0, i),
        path.slice(i + 1, j),
        path.slice(j + (hasMod ? 2 : 1)),
        hasMod ? mod : void 0
    ];
}
function expandGroupDelimiters(path) {
    if (!path.includes("{")) return;
    const group = scanFirstGroup(path);
    if (!group) return;
    const [pre, body, suf, mod] = group;
    if (!mod) return [
        pre + body + suf
    ];
    if (mod === "?") return [
        pre + body + suf,
        pre + suf
    ];
    if (body.includes("/")) throw new Error("unsupported group repetition across segments");
    return [
        `${pre}(?:${body})${mod}${suf}`
    ];
}
const UNNAMED_GROUP_PREFIX = "__rou3_unnamed_";
const ESCAPED_GROUP_PREFIX = "__rou3_esc_";
function toUnnamedGroupKey(index) {
    return `${UNNAMED_GROUP_PREFIX}${index}`;
}
function toGroupName(name) {
    return /^(?!__rou3_|_\d)[A-Za-z_]\w*$/.test(name) ? name : ESCAPED_GROUP_PREFIX + name.replace(/[_-]/g, (c)=>c === "_" ? "__" : "_h");
}
function fromGroupName(key) {
    if (key.charCodeAt(0) !== 95) return key;
    if (key.startsWith("__rou3_esc_")) return key.slice(11).replace(/__|_h/g, (c)=>c === "__" ? "_" : "-");
    return key.startsWith("__rou3_unnamed_") ? key.slice(15) : key;
}
function hasSegmentWildcard(segment) {
    let depth = 0;
    for(let i = 0; i < segment.length; i++){
        const ch = segment.charCodeAt(i);
        if (ch === 92) {
            i++;
            continue;
        }
        if (ch === 40) {
            depth++;
            continue;
        }
        if (ch === 41 && depth > 0) {
            depth--;
            continue;
        }
        if (ch === 42 && depth === 0) return true;
    }
    return false;
}
function replaceSegmentWildcards(segment, unnamedStart, toGroupKey = toUnnamedGroupKey) {
    let depth = 0;
    let nextIndex = unnamedStart;
    let replaced = "";
    for(let i = 0; i < segment.length; i++){
        const ch = segment.charCodeAt(i);
        if (ch === 92) {
            replaced += segment[i];
            if (i + 1 < segment.length) replaced += segment[++i];
            continue;
        }
        if (ch === 40) {
            depth++;
            replaced += segment[i];
            continue;
        }
        if (ch === 41 && depth > 0) {
            depth--;
            replaced += segment[i];
            continue;
        }
        if (ch === 42 && depth === 0) {
            replaced += `(?<${toGroupKey(nextIndex++)}>[^/]*)`;
            continue;
        }
        replaced += segment[i];
    }
    return [
        replaced,
        nextIndex
    ];
}
function encodeEscapes(path) {
    if (!path.includes("\\")) return path;
    return path.replace(/\\([:(){}])/g, (_, c)=>"�" + "ABCDE"[":(){}".indexOf(c)]);
}
function segmentKey(segment) {
    if (segment.startsWith("**")) return 2;
    if (segment === "*" || segment.includes(":") || segment.includes("(") || hasSegmentWildcard(segment)) return 1;
    if (segment === "\\*") return "*";
    if (segment === "\\*\\*") return "**";
    if (!segment.includes("�")) return segment;
    return segment.replace(/\uFFFD([A-E])/g, (_, c)=>c === "A" ? ":" : c === "B" ? "(" : c === "C" ? ")" : c === "D" ? "{" : "}");
}
function expandModifiers(segments) {
    for(let i = 0; i < segments.length; i++){
        const last = segments[i].charCodeAt(segments[i].length - 1);
        if (last !== 63 && last !== 43 && last !== 42) continue;
        const m = segments[i].match(/^(.*:[\w-]+(?:\([^)]*\))?)([?+*])$/);
        if (!m) continue;
        const pre = segments.slice(0, i);
        const suf = segments.slice(i + 1);
        if (m[2] === "?") return [
            "/" + pre.concat(m[1]).concat(suf).join("/"),
            "/" + pre.concat(suf).join("/")
        ];
        const name = m[1].match(/:([\w-]+)/)?.[1] || "_";
        const wc = "/" + [
            ...pre,
            `**:${name}`,
            ...suf
        ].join("/");
        const without = "/" + [
            ...pre,
            ...suf
        ].join("/");
        return m[2] === "+" ? [
            wc
        ] : [
            wc,
            without
        ];
    }
}
function normalizePath(path) {
    if (!path.includes("/.")) return path;
    const r = [];
    for (const s of path.split("/"))if (s === ".") continue;
    else if (s === ".." && r.length > 1) r.pop();
    else r.push(s);
    return r.join("/") || "/";
}
function splitPath(path) {
    const s = path.split("/");
    s.shift();
    if (s[s.length - 1] === "") s.pop();
    return s;
}
function splitRoute(path) {
    const s = splitPath(path);
    while(s[s.length - 1] === "")s.pop();
    return s;
}
function getMatchParams(segments, paramsMap) {
    const params = new NullProtoObj();
    for (const [index, name] of paramsMap){
        const segment = index < 0 ? segments.slice(-(index + 1)).join("/") : segments[index];
        if (typeof name === "string") params[name] = segment;
        else {
            const match = segment.match(name);
            if (match) for(const key in match.groups)params[fromGroupName(key)] = match.groups[key];
        }
    }
    return params;
}
function addRoute(ctx, method = "", path, data) {
    method = method.toUpperCase();
    if (path.charCodeAt(0) !== 47) path = `/${path}`;
    const groupExpanded = expandGroupDelimiters(path);
    if (groupExpanded) {
        for (const expandedPath of groupExpanded)addRoute(ctx, method, expandedPath, data);
        return;
    }
    path = encodeEscapes(path);
    const segments = splitRoute(path);
    const expanded = expandModifiers(segments);
    if (expanded) {
        for (const p of expanded)addRoute(ctx, method, p, data);
        return;
    }
    let node = ctx.root;
    let _unnamedParamIndex = 0;
    const paramsMap = [];
    const paramsRegexp = [];
    for(let i = 0; i < segments.length; i++){
        let segment = segments[i];
        const key = segmentKey(segment);
        if (key === 2) {
            if (!node.wildcard) node.wildcard = {
                key: "**"
            };
            node = node.wildcard;
            paramsMap.push([
                -(i + 1),
                segment.split(":")[1] || "_",
                segment.length === 2
            ]);
            break;
        }
        if (key === 1) {
            if (!node.param) node.param = {
                key: "*"
            };
            node = node.param;
            if (segment === "*") paramsMap.push([
                i,
                String(_unnamedParamIndex++),
                true
            ]);
            else if (segment.includes("(") || segment.includes(":", 1) || !/^:[\w-]+$/.test(segment)) {
                const [regexp, nextIndex] = getParamRegexp(segment, _unnamedParamIndex);
                _unnamedParamIndex = nextIndex;
                paramsRegexp[i] = regexp;
                node.hasRegexParam = true;
                paramsMap.push([
                    i,
                    regexp,
                    false
                ]);
            } else paramsMap.push([
                i,
                segment.slice(1),
                false
            ]);
            continue;
        }
        segment = segments[i] = key;
        const child = node.static?.[segment];
        if (child) node = child;
        else {
            const staticNode = {
                key: segment
            };
            if (!node.static) node.static = new NullProtoObj();
            node.static[segment] = staticNode;
            node = staticNode;
        }
    }
    const hasParams = paramsMap.length > 0;
    const methods = node.methods ??= new NullProtoObj();
    (methods[method] ??= []).push({
        data: data || null,
        paramsRegexp,
        paramsMap: hasParams ? paramsMap : void 0
    });
    if (!hasParams) ctx.static["/" + segments.join("/")] = node;
}
function getParamRegexp(segment, unnamedStart = 0) {
    let _i = unnamedStart;
    let _s = "", _d = 0;
    for(let j = 0; j < segment.length; j++){
        const c = segment.charCodeAt(j);
        if (c === 40) _d++;
        else if (c === 41 && _d > 0) _d--;
        else if (c === 92 && _d === 0 && j + 1 < segment.length) {
            const n = segment[j + 1];
            if (n !== ":" && n !== "(" && n !== "*" && n !== "\\") {
                _s += "￾" + n;
                j++;
                continue;
            }
        } else if (c === 46 && _d === 0) {
            _s += "\\.";
            continue;
        }
        _s += segment[j];
    }
    [_s, _i] = replaceSegmentWildcards(_s, _i);
    const regex = _s.replace(/:([\w-]+)(?:\(([^)]*)\))?/g, (_, id, p)=>`(?<${toGroupName(id)}>${p || "[^/]+"})`).replace(/\((?![?<])/g, ()=>`(?<${toUnnamedGroupKey(_i++)}>`).replace(/\uFFFE(.)/g, (_, c)=>/[.*+?^${}()|[\]\\]/.test(c) ? `\\${c}` : c);
    return [
        new RegExp(`^${regex}$`),
        _i
    ];
}
function findRoute(ctx, method = "", path, opts) {
    if (opts?.normalize) path = normalizePath(path);
    if (path.charCodeAt(path.length - 1) === 47) path = path.slice(0, -1);
    const staticNode = ctx.static[path];
    if (staticNode && staticNode.methods) {
        const staticMatch = staticNode.methods[method] || staticNode.methods[""];
        if (staticMatch !== void 0) return staticMatch[0];
    }
    const segments = splitPath(path);
    const match = _lookupTree(ctx.root, method, segments, 0);
    if (match === void 0) return;
    if (opts?.params === false) return match;
    return {
        data: match.data,
        params: match.paramsMap ? getMatchParams(segments, match.paramsMap) : void 0
    };
}
function _lookupTree(node, method, segments, index) {
    if (index === segments.length) {
        if (node.methods) {
            const match = _selectMatcher(node.methods, method, segments, node.key === "*", false);
            if (match) return match;
        }
        return node.param?.methods && _selectMatcher(node.param.methods, method, segments, true, true) || node.wildcard?.methods && _selectMatcher(node.wildcard.methods, method, segments, true, true) || void 0;
    }
    const segment = segments[index];
    if (node.static) {
        const staticChild = node.static[segment];
        if (staticChild) {
            const match = _lookupTree(staticChild, method, segments, index + 1);
            if (match) return match;
        }
    }
    if (node.param) {
        const match = _lookupTree(node.param, method, segments, index + 1);
        if (match) return match;
    }
    if (node.wildcard && node.wildcard.methods) return _selectMatcher(node.wildcard.methods, method, segments, true, false);
}
function _selectMatcher(methods, method, segments, dynamicTerminal, optionalOnly) {
    const match = methods[method] || methods[""];
    if (!match) return;
    const first = match[0];
    if (match.length === 1 && first.paramsRegexp.length === 0) {
        if (!optionalOnly) return first;
        const pMap = first.paramsMap;
        return pMap?.[pMap.length - 1]?.[2] ? first : void 0;
    }
    let best;
    let bestWeight = -1;
    for (const m of match){
        const pMap = m.paramsMap;
        const lastOptional = pMap?.[pMap.length - 1]?.[2];
        if (optionalOnly && !lastOptional) continue;
        let weight = dynamicTerminal && pMap && !lastOptional ? 1 : 0;
        const regexps = m.paramsRegexp;
        for(let i = 0; i < regexps.length; i++)if (regexps[i]) {
            if (!regexps[i].test(segments[i])) {
                weight = -1;
                break;
            }
            weight++;
        }
        if (weight > bestWeight) {
            best = m;
            bestWeight = weight;
        }
    }
    return best;
}
function removeRoute(ctx, method = "", path) {
    method = method.toUpperCase();
    if (path.charCodeAt(0) !== 47) path = `/${path}`;
    const groupExpanded = expandGroupDelimiters(path);
    if (groupExpanded) {
        for (const expandedPath of groupExpanded)removeRoute(ctx, method, expandedPath);
        return;
    }
    path = encodeEscapes(path);
    const segments = splitRoute(path);
    const modExpanded = expandModifiers(segments);
    if (modExpanded) {
        for (const expandedPath of modExpanded)removeRoute(ctx, method, expandedPath);
        return;
    }
    _remove(ctx.root, method, segments, 0);
}
function _remove(node, method, segments, index) {
    if (index === segments.length) {
        if (node.methods && method in node.methods) {
            delete node.methods[method];
            if (Object.keys(node.methods).length === 0) node.methods = void 0;
        }
        return;
    }
    const segment = segments[index];
    const key = segmentKey(segment);
    if (key === 2) {
        if (node.wildcard) {
            _remove(node.wildcard, method, segments, segments.length);
            if (_isEmptyNode(node.wildcard)) node.wildcard = void 0;
        }
        return;
    }
    if (key === 1) {
        if (node.param) {
            _remove(node.param, method, segments, index + 1);
            if (_isEmptyNode(node.param)) node.param = void 0;
        }
        return;
    }
    const childNode = node.static?.[key];
    if (childNode) {
        _remove(childNode, method, segments, index + 1);
        if (_isEmptyNode(childNode)) {
            delete node.static[key];
            if (Object.keys(node.static).length === 0) node.static = void 0;
        }
    }
}
function _isEmptyNode(node) {
    return node.methods === void 0 && node.static === void 0 && node.param === void 0 && node.wildcard === void 0;
}
function findAllRoutes(ctx, method = "", path, opts) {
    if (opts?.normalize) path = normalizePath(path);
    if (path.charCodeAt(path.length - 1) === 47) path = path.slice(0, -1);
    const segments = splitPath(path);
    const matches = _findAll(ctx.root, method, segments, 0);
    if (opts?.params === false) return matches;
    return matches.map((m)=>{
        return {
            data: m.data,
            params: m.paramsMap ? getMatchParams(segments, m.paramsMap) : void 0
        };
    });
}
function _findAll(node, method, segments, index, matches = []) {
    const segment = segments[index];
    if (node.wildcard && node.wildcard.methods) {
        const match = node.wildcard.methods[method] || node.wildcard.methods[""];
        if (match) if (index < segments.length) pushSorted(matches, match, true);
        else {
            const optional = [];
            for (const m of match){
                const pMap = m.paramsMap;
                if (pMap?.[pMap.length - 1]?.[2]) optional.push(m);
            }
            pushSorted(matches, optional, true);
        }
    }
    if (node.param) {
        if (index < segments.length) {
            const start = matches.length;
            _findAll(node.param, method, segments, index + 1, matches);
            if (node.param.hasRegexParam) {
                for(let r = matches.length - 1; r >= start; r--)if (matches[r].paramsRegexp[index]?.test(segment) === false) matches.splice(r, 1);
            }
        } else if (node.param.methods) {
            const match = node.param.methods[method] || node.param.methods[""];
            if (match) {
                const optional = [];
                for (const m of match){
                    const pMap = m.paramsMap;
                    if (pMap?.[pMap.length - 1]?.[2]) optional.push(m);
                }
                pushSorted(matches, optional, true);
            }
        }
    }
    if (index < segments.length) {
        const staticChild = node.static?.[segment];
        if (staticChild) _findAll(staticChild, method, segments, index + 1, matches);
    }
    if (index === segments.length && node.methods) {
        const match = node.methods[method] || node.methods[""];
        if (match) pushSorted(matches, match, node.key === "*");
    }
    return matches;
}
function pushSorted(matches, match, dynamicTerminal) {
    if (match.length > 1) match = match.map((m)=>{
        let w = 0;
        const { paramsRegexp: rx, paramsMap: pm } = m;
        for(let i = 0; i < rx.length; i++)if (rx[i]) w++;
        if (dynamicTerminal && pm && !pm[pm.length - 1][2]) w++;
        return [
            m,
            w
        ];
    }).sort((a, b)=>a[1] - b[1]).map((e)=>e[0]);
    for (const m of match)matches.push(m);
}
function shapeSubsumes(a, b) {
    const fa = a.fixed.length;
    const fb = b.fixed.length;
    if (fa + a.tailMin > fb + b.tailMin || fa + a.tailMax < fb + b.tailMax) return false;
    const common = fa < fb ? fa : fb;
    for(let k = 0; k < common; k++)if (!_segmentSubsumes(a.fixed[k], b.fixed[k])) return false;
    for(let k = fb; k < fa; k++)if (a.fixed[k] !== void 0) return false;
    return true;
}
function mergeShapes(shapes) {
    for(let i = 0; i < shapes.length; i++)for(let j = i + 1; j < shapes.length; j++){
        const a = shapes[i];
        const b = shapes[j];
        if (_sameFixed(a.fixed, b.fixed) && a.tailMin <= b.tailMax + 1 && b.tailMin <= a.tailMax + 1) {
            a.tailMin = Math.min(a.tailMin, b.tailMin);
            a.tailMax = Math.max(a.tailMax, b.tailMax);
            shapes.splice(j, 1);
            j = i;
        }
    }
    return shapes;
}
function _sameFixed(a, b) {
    if (a.length !== b.length) return false;
    for(let k = 0; k < a.length; k++)if (!_segmentEqual(a[k], b[k])) return false;
    return true;
}
function _segmentEqual(x, y) {
    return x === y || x instanceof RegExp && y instanceof RegExp && x.flags === y.flags && _regExpKey(x) === _regExpKey(y);
}
function _segmentSubsumes(x, y) {
    if (x === void 0) return true;
    if (typeof x === "string") return x === y;
    if (typeof y === "string") return x.test(y);
    return y instanceof RegExp && x.flags === y.flags && _regExpKey(x) === _regExpKey(y);
}
const _regExpKeys = /* @__PURE__ */ new WeakMap();
function _regExpKey(r) {
    let key = _regExpKeys.get(r);
    if (key === void 0) {
        const s = r.source;
        key = "";
        for(let i = 0; i < s.length; i++){
            const c = s[i];
            if (c === "\\") key += c + s[++i];
            else if (c === "[") {
                let j = i + 1;
                while(j < s.length && s[j] !== "]")j += s[j] === "\\" ? 2 : 1;
                key += s.slice(i, j + 1);
                i = j;
            } else if (c === "(" && s[i + 1] === "?" && s[i + 2] === "<" && s[i + 3] !== "=" && s[i + 3] !== "!") {
                const end = s.indexOf(">", i + 3);
                key += "(";
                i = end === -1 ? i : end;
            } else key += c;
        }
        _regExpKeys.set(r, key);
    }
    return key;
}
function routeToShapes(pattern) {
    let shapes = _patternShapes.get(pattern);
    if (shapes === void 0) {
        const ctx = createRouter();
        addRoute(ctx, "", pattern);
        shapes = [];
        _collectShapes(ctx.root, [], shapes);
        shapes = mergeShapes(shapes);
        if (_patternShapes.size >= 1024) _patternShapes.clear();
        _patternShapes.set(pattern, shapes);
    }
    return shapes;
}
function shapeOf(edges, entry) {
    let shape = _shapeCache.get(entry);
    if (!shape) _shapeCache.set(entry, shape = _computeShape(edges, entry));
    return shape;
}
function shapesOverlap(a, b) {
    const fa = a.fixed.length;
    const fb = b.fixed.length;
    const common = fa < fb ? fa : fb;
    for(let k = 0; k < common; k++)if (!_segmentsCanOverlap(a.fixed[k], b.fixed[k])) return false;
    return Math.max(fa + a.tailMin, fb + b.tailMin) <= Math.min(fa + a.tailMax, fb + b.tailMax);
}
function mayMatchAt(query, depth, key) {
    for (const q of query)if (depth < q.fixed.length) {
        const m = q.fixed[depth];
        if (m === void 0 || (typeof m === "string" ? m === key : m.test(key))) return true;
    } else if (depth - q.fixed.length < q.tailMax) return true;
    return false;
}
const _shapeCache = /* @__PURE__ */ new WeakMap();
const _patternShapes = /* @__PURE__ */ new Map();
function _collectShapes(node, edges, shapes) {
    if (node.methods) for (const entry of node.methods[""] || [])shapes.push(_computeShape(edges, entry));
    if (node.static) for(const key in node.static){
        edges.push(key);
        _collectShapes(node.static[key], edges, shapes);
        edges.pop();
    }
    if (node.param) {
        edges.push(0);
        _collectShapes(node.param, edges, shapes);
        edges.pop();
    }
    if (node.wildcard) {
        edges.push(1);
        _collectShapes(node.wildcard, edges, shapes);
        edges.pop();
    }
}
function _computeShape(edges, entry) {
    const fixed = [];
    let tailMin = 0;
    let tailMax = 0;
    const pMap = entry.paramsMap;
    for(let d = 0; d < edges.length; d++){
        const edge = edges[d];
        if (typeof edge === "string") fixed.push(edge);
        else if (edge === 1) {
            tailMin = pMap[pMap.length - 1][2] ? 0 : 1;
            tailMax = Number.POSITIVE_INFINITY;
        } else if (pMap) {
            const p = pMap.find((e)=>e[0] === d);
            if (p[1] instanceof RegExp) fixed.push(p[1]);
            else if (p[2] && d === edges.length - 1) tailMax = 1;
            else fixed.push(void 0);
        }
    }
    let f = fixed.length;
    while(f > 0 && fixed[f - 1] === void 0)f--;
    if (f < fixed.length) {
        tailMin += fixed.length - f;
        tailMax += fixed.length - f;
        fixed.length = f;
    }
    return {
        fixed,
        tailMin,
        tailMax
    };
}
function _segmentsCanOverlap(x, y) {
    if (typeof x === "string") return typeof y === "string" ? x === y : y instanceof RegExp ? y.test(x) : true;
    if (x instanceof RegExp && typeof y === "string") return x.test(y);
    return true;
}
function routesOverlap(patternA, patternB) {
    return _anyOverlap(routeToShapes(patternA), routeToShapes(patternB));
}
function compareRoutes(patternA, patternB) {
    const a = routeToShapes(patternA);
    const b = routeToShapes(patternB);
    const aCoversB = _covers(a, b);
    const bCoversA = _covers(b, a);
    if (aCoversB && bCoversA) return "equal";
    if (aCoversB) return "superset";
    if (bCoversA) return "subset";
    return _anyOverlap(a, b) ? "partial" : "disjoint";
}
function findOverlappingRoutes(ctx, method = "", pattern) {
    const query = routeToShapes(pattern);
    const matches = [];
    _collectOverlaps(ctx.root, method, query, [], /* @__PURE__ */ new Set(), matches);
    return matches;
}
function _anyOverlap(a, b) {
    for (const x of a)for (const y of b)if (shapesOverlap(x, y)) return true;
    return false;
}
function _covers(sup, sub) {
    return sub.every((s)=>sup.some((x)=>shapeSubsumes(x, s)));
}
function _collectOverlaps(node, method, query, edges, seen, matches) {
    if (node.wildcard) {
        edges.push(1);
        _collectOverlaps(node.wildcard, method, query, edges, seen, matches);
        edges.pop();
    }
    if (node.param) {
        edges.push(0);
        _collectOverlaps(node.param, method, query, edges, seen, matches);
        edges.pop();
    }
    if (node.static) {
        for(const key in node.static)if (mayMatchAt(query, edges.length, key)) {
            edges.push(key);
            _collectOverlaps(node.static[key], method, query, edges, seen, matches);
            edges.pop();
        }
    }
    if (node.methods) {
        const data = node.methods[method] || node.methods[""];
        if (data) for (const entry of data){
            const d = entry.data;
            const isRef = d !== null && (typeof d === "object" || typeof d === "function");
            if (isRef && seen.has(d)) continue;
            const shape = shapeOf(edges, entry);
            if (query.some((q)=>shapesOverlap(q, shape))) {
                if (isRef) seen.add(d);
                matches.push({
                    data: d
                });
            }
        }
    }
}
function routeNodeKeys(pattern) {
    let keys = _patternKeys.get(pattern);
    if (keys === void 0) {
        const ctx = createRouter();
        addRoute(ctx, "", pattern);
        keys = [];
        _collectKeys(ctx.root, "", keys);
        if (_patternKeys.size >= 1024) _patternKeys.clear();
        _patternKeys.set(pattern, keys);
    }
    return keys.slice();
}
const _patternKeys = /* @__PURE__ */ new Map();
function _collectKeys(node, prefix, keys) {
    if (node.methods) keys.push(prefix || "/");
    if (node.static) for(const key in node.static)_collectKeys(node.static[key], prefix + "/" + _escapeKey(key), keys);
    if (node.param) _collectKeys(node.param, prefix + "/*", keys);
    if (node.wildcard) _collectKeys(node.wildcard, prefix + "/**", keys);
}
function _escapeKey(key) {
    if (key === "*") return "\\*";
    if (key === "**") return "\\*\\*";
    return key.replace(/[:(){}]/g, "\\$&");
}
const _P = "￾";
function replaceEscapesOutsideGroups(segment) {
    let r = "", d = 0;
    for(let i = 0; i < segment.length; i++){
        const c = segment.charCodeAt(i);
        if (c === 40) d++;
        else if (c === 41 && d > 0) d--;
        else if (c === 92 && d === 0 && i + 1 < segment.length) {
            const n = segment[i + 1];
            if (n !== ":" && n !== "(" && n !== "*" && n !== "\\") {
                r += _P + n;
                i++;
                continue;
            }
        }
        r += segment[i];
    }
    return r;
}
function resolveEscapePlaceholders(str) {
    return str.replace(/\uFFFE(.)/g, (_, c)=>/[.*+?^${}()|[\]\\]/.test(c) ? `\\${c}` : c);
}
function escapeBareDots(str) {
    let r = "", d = 0;
    for(let i = 0; i < str.length; i++){
        const c = str.charCodeAt(i);
        if (c === 92 || c === 65534) {
            r += str[i] + (str[i + 1] || "");
            i++;
        } else if (c === 40) {
            d++;
            r += str[i];
        } else if (c === 41) {
            if (d > 0) d--;
            r += str[i];
        } else if (c === 46 && d === 0) r += "\\.";
        else r += str[i];
    }
    return r;
}
function routeToRegExp(route = "/") {
    if (route.charCodeAt(0) !== 47) route = `/${route}`;
    const inlineOptional = inlineOptionalGroup(route);
    if (inlineOptional) return inlineOptional;
    const groupExpanded = expandGroupDelimiters(route);
    if (groupExpanded) {
        const sources = groupExpanded.map((expandedRoute)=>routeToRegExp(expandedRoute).source.slice(1, -1));
        return new RegExp(`^(?:${sources.join("|")})$`);
    }
    return _routeToRegExp(route);
}
function inlineOptionalGroup(route) {
    const group = scanFirstGroup(route);
    if (!group) return;
    const [pre, body, suf, mod] = group;
    if (mod !== "?" || suf !== "" || body === "" || scanFirstGroup(pre) || scanFirstGroup(body)) return;
    const baseSegs = routeToRegExpSegments(pre);
    const fullSegs = routeToRegExpSegments(pre + body);
    const baseLen = baseSegs.length;
    if (baseLen === 0 || fullSegs.length < baseLen) return;
    const midSegment = fullSegs.length === baseLen;
    const sharedLen = midSegment ? baseLen - 1 : baseLen;
    for(let i = 0; i < sharedLen; i++)if (fullSegs[i] !== baseSegs[i]) return;
    if (midSegment) {
        const prefix = baseSegs[baseLen - 1];
        const last = fullSegs[baseLen - 1];
        if (!last.startsWith(prefix)) return;
        if (/(?:\[\^\/\]|\.)[*+]\)?$/.test(prefix)) return;
        const k = prefix.length;
        const inlineSegs = fullSegs.slice(0, baseLen - 1);
        inlineSegs.push(`${last.slice(0, k)}(?:${last.slice(k)})?`);
        return new RegExp(`^/${inlineSegs.join("/")}/?$`);
    }
    const head = fullSegs.slice(0, baseLen).join("/");
    const tail = fullSegs.slice(baseLen).join("/");
    return new RegExp(`^/${head}(?:/${tail})?/?$`);
}
function _routeToRegExp(route) {
    return new RegExp(`^/${routeToRegExpSegments(route).join("/")}/?$`);
}
function routeToRegExpSegments(route) {
    const reSegments = [];
    let idCtr = 0;
    for (const segment of splitRoute(route)){
        if (!segment) {
            reSegments.push("");
            continue;
        }
        if (segment === "*") reSegments.push(`(?<${toRegExpUnnamedKey(idCtr++)}>[^/]*)`);
        else if (segment.startsWith("**")) reSegments.push(segment === "**" ? "?(?<_>.*)" : `?(?<${toGroupName(segment.slice(3))}>.+)`);
        else if (segment.includes(":") || /(^|[^\\])\(/.test(segment) || hasSegmentWildcard(segment)) {
            const modMatch = segment.match(/^(.*:[\w-]+(?:\([^)]*\))?)([?+*])$/);
            if (modMatch) {
                const [, base, mod] = modMatch;
                const name = toGroupName(base.match(/:([\w-]+)/)?.[1] || `_${idCtr++}`);
                if (mod === "?") {
                    const inner = escapeBareDots(base.replace(/:([\w-]+)(?:\(([^)]*)\))?/g, (_, id, pattern)=>`(?<${toGroupName(id)}>${pattern || "[^/]+"})`));
                    if (reSegments.length > 0) {
                        const prevQ = reSegments.pop();
                        reSegments.push(`${prevQ}(?:/${inner})?`);
                    } else reSegments.push(`?${inner}?`);
                    continue;
                }
                const pattern = base.match(/:([\w-]+)(?:\(([^)]*)\))?/)?.[2];
                if (reSegments.length > 0) {
                    const prevMod = reSegments.pop();
                    if (pattern) {
                        const repeated = `${pattern}(?:/${pattern})*`;
                        reSegments.push(mod === "+" ? `${prevMod}/(?<${name}>${repeated})` : `${prevMod}(?:/(?<${name}>${repeated}))?`);
                    } else reSegments.push(mod === "+" ? `${prevMod}/(?<${name}>.+)` : `${prevMod}(?:/(?<${name}>.*))?`);
                } else if (pattern) {
                    const repeated = `${pattern}(?:/${pattern})*`;
                    reSegments.push(mod === "+" ? `?(?<${name}>${repeated})` : `?(?<${name}>${repeated})?`);
                } else reSegments.push(mod === "+" ? `?(?<${name}>.+)` : `?(?<${name}>.*)`);
                continue;
            }
            let dynamicSegment = replaceEscapesOutsideGroups(segment);
            [dynamicSegment, idCtr] = replaceSegmentWildcards(dynamicSegment, idCtr, toRegExpUnnamedKey);
            reSegments.push(resolveEscapePlaceholders(escapeBareDots(dynamicSegment.replace(/:([\w-]+)(?:\(([^)]*)\))?/g, (_, id, pattern)=>`(?<${toGroupName(id)}>${pattern || "[^/]+"})`).replace(/(^|[^\\])\((?![?<])/g, (_, p)=>`${p}(?<${toRegExpUnnamedKey(idCtr++)}>`))));
        } else reSegments.push(segment.replace(/\\(.)/g, "$1").replace(/[.*+?^${}()|[\]]/g, "\\$&"));
    }
    return reSegments;
}
function toRegExpUnnamedKey(index) {
    return `_${index}`;
}
const ROUTE_SPECIAL = /* @__PURE__ */ new Set([
    ":",
    "(",
    ")",
    "{",
    "}",
    "*",
    "\\",
    "?",
    "+",
    "|",
    "^",
    "$",
    "[",
    "]"
]);
function regExpToRoute(regexp) {
    if (typeof regexp !== "string" && /[ims]/.test(regexp.flags)) throw new Error(`rou3: cannot represent regexp flag(s) "${regexp.flags}" as a route`);
    let src = typeof regexp === "string" ? regexp : regexp.source;
    if (src.startsWith("^")) src = src.slice(1);
    if (src.endsWith("$")) src = src.slice(0, -1);
    if (src.endsWith("\\/?")) src = src.slice(0, -3);
    if (src === "" || src === "\\/") return "/";
    const segments = [];
    const n = src.length;
    let i = 0;
    while(i < n){
        if (src.startsWith("(?:", i)) {
            const end = readGroup(src, i);
            if (src[end] !== "?") throw new Error(`rou3: unsupported non-optional group in "${src}"`);
            applyOptional(segments, src.slice(i + 3, end - 1));
            i = end + 1;
            continue;
        }
        if (src.startsWith("\\/?", i)) {
            const g = matchNamedGroup(src, i + 3);
            if (g && g.end === n && (g.body === ".*" || g.body === ".+")) {
                segments.push(g.name === "_" ? "**" : `**:${g.name}`);
                break;
            }
        }
        if (src.startsWith("\\/", i)) {
            const end = segmentEnd(src, i + 2);
            segments.push(reverseSegment(src.slice(i + 2, end)));
            i = end;
            continue;
        }
        throw new Error(`rou3: cannot parse "${src}" at index ${i}`);
    }
    return "/" + segments.join("/");
}
function reverseSegment(seg) {
    const whole = matchNamedGroup(seg, 0);
    if (whole && whole.end === seg.length) {
        if (whole.body === ".+") return `:${whole.name}+`;
        const rep = matchRepeat(whole.body);
        if (rep) return `:${whole.name}${constraint(rep)}+`;
    }
    let out = "";
    let i = 0;
    while(i < seg.length){
        const c = seg[i];
        if (c === "(") {
            const g = matchNamedGroup(seg, i);
            if (g) {
                out += paramToken(g.name, g.body);
                i = g.end;
                continue;
            }
            if (!seg.startsWith("(?", i)) {
                const end = readGroup(seg, i);
                out += paramToken("_0", seg.slice(i + 1, end - 1));
                i = end;
                continue;
            }
            throw new Error(`rou3: unsupported group construct in "${seg}"`);
        }
        if (c === "\\") {
            const next = seg[i + 1];
            if (next === void 0) throw new Error(`rou3: dangling escape in "${seg}"`);
            if (/[a-z0-9]/i.test(next)) throw new Error(`rou3: unsupported escape "\\${next}" in "${seg}"`);
            out += escapeLiteral(next);
            i += 2;
            continue;
        }
        if (BARE_META.has(c)) throw new Error(`rou3: unsupported metacharacter "${c}" in "${seg}"`);
        out += escapeLiteral(c);
        i += 1;
    }
    return out;
}
const BARE_META = /* @__PURE__ */ new Set([
    ".",
    "^",
    "$",
    "*",
    "+",
    "?",
    "|",
    "[",
    "]",
    "{",
    "}",
    ")"
]);
function applyOptional(segments, inner) {
    if (inner.startsWith("\\/")) {
        const rest = inner.slice(2);
        const g = matchNamedGroup(rest, 0);
        if (g && g.end === rest.length) {
            segments.push(optionalParam(g.name, g.body));
            return;
        }
        mergeGroup(segments, `/${reverseSegment(rest)}`);
        return;
    }
    mergeGroup(segments, reverseSegment(inner));
}
function mergeGroup(segments, body) {
    if (segments.length === 0) throw new Error(`rou3: optional group "{${body}}?" has no preceding segment`);
    segments[segments.length - 1] += `{${body}}?`;
}
function paramToken(name, body) {
    const unnamed = /^_\d+$/.test(name);
    if (unnamed && body === "[^/]*") return "*";
    if (!unnamed && body === "[^/]+") return `:${name}`;
    return unnamed ? constraint(body) : `:${name}${constraint(body)}`;
}
function optionalParam(name, body) {
    if (body === "[^/]+") return `:${name}?`;
    if (body === ".*") return `:${name}*`;
    const rep = matchRepeat(body);
    if (rep) return `:${name}${constraint(rep)}*`;
    return `:${name}${constraint(body)}?`;
}
function matchRepeat(body) {
    const m = body.match(/^(.+)\(\?:\\\/(.+)\)\*$/);
    return m && m[1] === m[2] ? m[1] : void 0;
}
function constraint(body) {
    if (body.includes("/")) throw new Error(`rou3: param constraint "(${body})" cannot contain "/"`);
    return `(${body})`;
}
function escapeLiteral(ch) {
    return ROUTE_SPECIAL.has(ch) ? `\\${ch}` : ch;
}
function matchNamedGroup(src, start) {
    if (!src.startsWith("(?<", start)) return;
    const after = src[start + 3];
    if (after === "=" || after === "!") return;
    const gt = src.indexOf(">", start);
    if (gt === -1) return;
    const end = readGroup(src, start);
    return {
        name: fromGroupName(src.slice(start + 3, gt)),
        body: src.slice(gt + 1, end - 1),
        end
    };
}
function readGroup(src, start) {
    let depth = 0;
    let inClass = false;
    for(let i = start; i < src.length; i++){
        const c = src[i];
        if (inClass) {
            if (c === "\\") i++;
            else if (c === "]") inClass = false;
            continue;
        }
        if (c === "\\") i++;
        else if (c === "[") inClass = true;
        else if (c === "(") depth++;
        else if (c === ")" && --depth === 0) return i + 1;
    }
    throw new Error(`rou3: unbalanced group in "${src}"`);
}
function segmentEnd(src, start) {
    let depth = 0;
    let inClass = false;
    let i = start;
    while(i < src.length){
        if (inClass) {
            if (src[i] === "\\") i++;
            else if (src[i] === "]") inClass = false;
            i++;
            continue;
        }
        if (depth === 0 && (src.startsWith("\\/", i) || src.startsWith("(?:", i))) break;
        const c = src[i];
        if (c === "\\") i += 2;
        else if (c === "[") {
            inClass = true;
            i++;
        } else {
            if (c === "(") depth++;
            else if (c === ")") depth--;
            i++;
        }
    }
    return i;
}
;
}),
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/id.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "uuid5",
    ()=>uuid5,
    "uuid6",
    ()=>uuid6
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/utils/uuid/index.js [app-route] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v6"])({
        clockseq,
        msecs,
        nsecs: lastNsecs
    });
}
function uuid5(name, namespace) {
    const namespaceBytes = namespace.replace(/-/g, "").match(/.{2}/g).map((byte)=>parseInt(byte, 16));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$uuid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v5"])(name, new Uint8Array(namespaceBytes));
}
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/utils/fast-safe-stringify/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/jsonplus.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonPlusSerializer",
    ()=>JsonPlusSerializer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$utils$2f$fast$2d$safe$2d$stringify$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/utils/fast-safe-stringify/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+credential-provider-node@3.972.87_@smithy_ceedde168aa1432de0ea6c024f9ed7f8/node_modules/@langchain/core/dist/load/index.js [app-route] (ecmascript)");
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
        else if (isDeltaSnapshotRecord(revivedObj)) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DeltaSnapshot"](revivedObj.value);
        else if (isConstructorRecord(revivedObj)) return reviveConstructorRecord(revivedObj) ?? revivedObj;
        else if (isLangChainSerializedObject(revivedObj)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$credential$2d$provider$2d$node$40$3$2e$972$2e$87_$40$smithy_ceedde168aa1432de0ea6c024f9ed7f8$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["load"])(JSON.stringify(revivedObj));
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
    else if (obj instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DeltaSnapshot"]) return {
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
        return new TextEncoder().encode((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$utils$2f$fast$2d$safe$2d$stringify$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringify"])(obj, (_, value)=>{
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$id$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/id.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/jsonplus.js [app-route] (ecmascript)");
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
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$id$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid6"])(0),
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
    serde = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JsonPlusSerializer"]();
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
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ERROR"]]: -1,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SCHEDULED"]]: -2,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["INTERRUPT"]]: -3,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RESUME"]]: -4
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/memory.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MemorySaver",
    ()=>MemorySaver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [app-route] (ecmascript)");
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
var MemorySaver = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseCheckpointSaver"] {
    storage = Object.create(null);
    writes = Object.create(null);
    constructor(serde){
        super(serde);
    }
    /** @internal */ async _migratePendingSends(mutableCheckpoint, threadId, checkpointNs, parentCheckpointId) {
        const deseriablizableCheckpoint = mutableCheckpoint;
        const parentKey = _generateKey(threadId, checkpointNs, parentCheckpointId);
        const pendingSends = await Promise.all(Object.values(this.writes[parentKey] ?? {}).filter(([_taskId, channel])=>channel === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TASKS"]).map(async ([_taskId, _channel, writes])=>await this.serde.loadsTyped("json", writes)));
        deseriablizableCheckpoint.channel_values ??= {};
        deseriablizableCheckpoint.channel_values[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TASKS"]] = pendingSends;
        deseriablizableCheckpoint.channel_versions ??= {};
        deseriablizableCheckpoint.channel_versions[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TASKS"]] = Object.keys(deseriablizableCheckpoint.channel_versions).length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maxChannelVersion"])(...Object.values(deseriablizableCheckpoint.channel_versions)) : this.getNextVersion(void 0);
    }
    async getTuple(config) {
        const thread_id = config.configurable?.thread_id;
        const checkpoint_ns = config.configurable?.checkpoint_ns ?? "";
        let checkpoint_id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCheckpointId"])(config);
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
        const preparedCheckpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["copyCheckpoint"])(checkpoint);
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
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WRITES_IDX_MAP"][channel] || idx
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
        const checkpointId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCheckpointId"])(config);
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/batch.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncBatchedStore",
    ()=>AsyncBatchedStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [app-route] (ecmascript)");
;
//#region src/store/batch.ts
/**
* Extracts and returns the underlying store from an `AsyncBatchedStore`,
* or returns the input if it is not an `AsyncBatchedStore`.
*/ const extractStore = (input)=>{
    if ("lg_name" in input && input.lg_name === "AsyncBatchedStore") return input.store;
    return input;
};
var AsyncBatchedStore = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseStore"] {
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/memory.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InMemoryStore",
    ()=>InMemoryStore,
    "MemoryStore",
    ()=>MemoryStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/utils.js [app-route] (ecmascript)");
;
;
//#region src/store/memory.ts
function validateMemoryNamespace(namespace) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateNamespace"])(namespace, {
        allowReservedRoot: true
    });
    if (namespace.some((label)=>label.includes(":"))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InvalidNamespaceError"]("Namespace labels cannot contain colons (':'), the InMemoryStore path separator.");
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
*/ var InMemoryStore = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseStore"] {
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
                    ] : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokenizePath"])(p)
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
        if (op.filter) filteredCandidates = candidates.filter((item)=>Object.entries(op.filter).every(([key, value])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compareValues"])(item.value[key], value)));
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
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokenizePath"])(ix)
                ]);
            for (const [path, field] of paths){
                const texts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTextAtPath"])(op.value, field);
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCache",
    ()=>BaseCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/jsonplus.js [app-route] (ecmascript)");
;
//#region src/cache/base.ts
var BaseCache = class {
    serde = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$jsonplus$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JsonPlusSerializer"]();
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/memory.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InMemoryCache",
    ()=>InMemoryCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [app-route] (ecmascript)");
;
//#region src/cache/memory.ts
var InMemoryCache = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseCache"] {
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$memory$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/memory.js [app-route] (ecmascript)");
;
;
;
}),
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$id$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/id.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$memory$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/memory.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$batch$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/batch.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$store$2f$memory$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/store/memory.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$memory$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/memory.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$cache$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/cache/index.js [app-route] (ecmascript)");
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
"[project]/node_modules/.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
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
"[project]/node_modules/.pnpm/p-finally@1.0.0/node_modules/p-finally/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
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
"[project]/node_modules/.pnpm/p-timeout@3.2.0/node_modules/p-timeout/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const pFinally = __turbopack_context__.r("[project]/node_modules/.pnpm/p-finally@1.0.0/node_modules/p-finally/index.js [app-route] (ecmascript)");
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
"[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/lower-bound.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
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
"[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/priority-queue.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const lower_bound_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/lower-bound.js [app-route] (ecmascript)");
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
"[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const EventEmitter = __turbopack_context__.r("[project]/node_modules/.pnpm/eventemitter3@4.0.7/node_modules/eventemitter3/index.js [app-route] (ecmascript)");
const p_timeout_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/p-timeout@3.2.0/node_modules/p-timeout/index.js [app-route] (ecmascript)");
const priority_queue_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/p-queue@6.6.2/node_modules/p-queue/dist/priority-queue.js [app-route] (ecmascript)");
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
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js [app-route] (ecmascript)");
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
        const keyBase = `${basePointer}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
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
                dereference(subSchema[subKey], lookup, baseURI, `${keyBase}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(subKey)}`);
            }
        } else {
            dereference(subSchema, lookup, baseURI, keyBase);
        }
    }
    return lookup;
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/types.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validate",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$ucs2$2d$length$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js [app-route] (ecmascript)");
;
;
;
;
;
function validate(instance, schema, draft = '2019-09', lookup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dereference"])(schema), shortCircuit = true, recursiveAnchor = null, instanceLocation = '#', schemaLocation = '#', evaluated = Object.create(null)) {
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
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepCompareStrict"])(instance, $const)) {
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
            if (!$enum.some((value)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepCompareStrict"])(instance, value))) {
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
                const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
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
                    const result = validate(instance, $dependentSchemas[key], draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`, evaluated);
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
                        const result = validate(instance, propsOrSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`);
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
                const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
                const result = validate(instance[key], $properties[key], draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`);
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
                    const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
                    const result = validate(instance[key], subSchema, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(pattern)}`);
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
                const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
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
                    const subInstancePointer = `${instanceLocation}/${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$pointer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodePointer"])(key)}`;
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
                    if (a === b || ao && bo && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepCompareStrict"])(a, b)) {
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
        const length = $minLength === undefined && $maxLength === undefined ? 0 : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$ucs2$2d$length$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ucs2length"])(instance);
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
        if ($format !== undefined && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["format"][$format] && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["format"][$format](instance)) {
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
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Validator",
    ()=>Validator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [app-route] (ecmascript)");
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
        this.lookup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dereference"])(schema);
    }
    validate(instance) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validate"])(instance, this.schema, this.draft, this.lookup, this.shortCircuit);
    }
    addSchema(schema, id) {
        if (id) {
            schema = {
                ...schema,
                $id: id
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dereference"])(schema, this.lookup);
    }
}
}),
"[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
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
"[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tiktoken",
    ()=>Tiktoken,
    "getEncodingNameForModel",
    ()=>getEncodingNameForModel,
    "never",
    ()=>never
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$base64$2d$js$40$1$2e$5$2e$1$2f$node_modules$2f$base64$2d$js$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js [app-route] (ecmascript)");
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
            const bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$base64$2d$js$40$1$2e$5$2e$1$2f$node_modules$2f$base64$2d$js$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].toByteArray(token);
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
"[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/lite.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js [app-route] (ecmascript)");
;
}),
"[project]/node_modules/.pnpm/mustache@4.2.0/node_modules/mustache/mustache.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/sql.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSQLStatements",
    ()=>getSQLStatements,
    "getTablesWithSchema",
    ()=>getTablesWithSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [app-route] (ecmascript)");
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
      and cw.channel = '${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TASKS"]}'
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/migrations.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMigrations",
    ()=>getMigrations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/sql.js [app-route] (ecmascript)");
;
//#region src/migrations.ts
/**
* To add a new migration, add a new string to the list returned by the getMigrations function.
* The position of the migration in the list is the version number.
*/ const getMigrations = (schema)=>{
    const SCHEMA_TABLES = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTablesWithSchema"])(schema);
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
"[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PostgresSaver",
    ()=>PostgresSaver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/sql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$migrations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint-postgres@1.0.6_@langchain+core@1.2.17_openai@7.32.0_@aw_22e335dc6fb3b7c3391d9bf48bd6440f/node_modules/@langchain/langgraph-checkpoint-postgres/dist/migrations.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/base.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+langgraph-checkpoint@1.1.6_@langchain+core@1.2.17_openai@7.32.0_@aws-sdk+cre_34f5a3fc2d0f83189e2c89ae4241b098/node_modules/@langchain/langgraph-checkpoint/dist/serde/types.js [app-route] (ecmascript)");
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
*/ var PostgresSaver = class PostgresSaver extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BaseCheckpointSaver"] {
    pool;
    options;
    SQL_STATEMENTS;
    isSetup;
    constructor(pool, serde, options){
        super(serde);
        this.pool = pool;
        this.isSetup = false;
        this.options = _ensureCompleteOptions(options);
        this.SQL_STATEMENTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSQLStatements"])(this.options.schema);
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
        const SCHEMA_TABLES = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTablesWithSchema"])(this.options.schema);
        try {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${this.options.schema}"`);
            let version = -1;
            const MIGRATIONS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$2d$postgres$40$1$2e$0$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aw_22e335dc6fb3b7c3391d9bf48bd6440f$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2d$postgres$2f$dist$2f$migrations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMigrations"])(this.options.schema);
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
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WRITES_IDX_MAP"][channel] ?? idx,
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
            textEncoder.encode(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TASKS"]),
            textEncoder.encode(enc),
            blob
        ]);
        row.checkpoint.channel_versions[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$serde$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TASKS"]] = Object.keys(mutableRow.checkpoint.channel_versions).length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maxChannelVersion"])(...Object.values(mutableRow.checkpoint.channel_versions)) : this.getNextVersion(void 0);
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
        const query = writes.every((w)=>w[0] in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$langgraph$2d$checkpoint$40$1$2e$1$2e$6_$40$langchain$2b$core$40$1$2e$2$2e$17_openai$40$7$2e$32$2e$0_$40$aws$2d$sdk$2b$cre_34f5a3fc2d0f83189e2c89ae4241b098$2f$node_modules$2f40$langchain$2f$langgraph$2d$checkpoint$2f$dist$2f$base$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WRITES_IDX_MAP"]) ? this.SQL_STATEMENTS.UPSERT_CHECKPOINT_WRITES_SQL : this.SQL_STATEMENTS.INSERT_CHECKPOINT_WRITES_SQL;
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chain",
    ()=>chain
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [app-route] (ecmascript)");
;
const chain = (...providers)=>async ()=>{
        if (providers.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProviderError"]("No providers in chain");
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CredentialsProviderError",
    ()=>CredentialsProviderError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [app-route] (ecmascript)");
;
class CredentialsProviderError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProviderError"] {
    name = "CredentialsProviderError";
    constructor(message, options = true){
        super(message, options);
        Object.setPrototypeOf(this, CredentialsProviderError.prototype);
    }
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromEnv",
    ()=>fromEnv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [app-route] (ecmascript)");
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CredentialsProviderError"](e.message || `Not found in ENV: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSelectorName"])(envVarSelector.toString())}`, {
                logger: options?.logger
            });
        }
    };
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_PREFIX_SEPARATOR",
    ()=>CONFIG_PREFIX_SEPARATOR
]);
const CONFIG_PREFIX_SEPARATOR = ".";
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConfigData",
    ()=>getConfigData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/profile.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [app-route] (ecmascript)");
;
;
const getConfigData = (data)=>Object.entries(data).filter(([key])=>{
        const indexOfSeparator = key.indexOf(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
        if (indexOfSeparator === -1) {
            return false;
        }
        return Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IniSectionType"]).includes(key.substring(0, indexOfSeparator));
    }).reduce((acc, [key, value])=>{
        const indexOfSeparator = key.indexOf(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
        const updatedKey = key.substring(0, indexOfSeparator) === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IniSectionType"].PROFILE ? key.substring(indexOfSeparator + 1) : key;
        acc[updatedKey] = value;
        return acc;
    }, {
        ...data.default && {
            default: data.default
        }
    });
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigFilepath.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENV_CONFIG_PATH",
    ()=>ENV_CONFIG_PATH,
    "getConfigFilepath",
    ()=>getConfigFilepath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [app-route] (ecmascript)");
;
;
const ENV_CONFIG_PATH = "AWS_CONFIG_FILE";
const getConfigFilepath = ()=>process.env[ENV_CONFIG_PATH] || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHomeDir"])(), ".aws", "config");
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getCredentialsFilepath.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENV_CREDENTIALS_PATH",
    ()=>ENV_CREDENTIALS_PATH,
    "getCredentialsFilepath",
    ()=>getCredentialsFilepath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [app-route] (ecmascript)");
;
;
const ENV_CREDENTIALS_PATH = "AWS_SHARED_CREDENTIALS_FILE";
const getCredentialsFilepath = ()=>process.env[ENV_CREDENTIALS_PATH] || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHomeDir"])(), ".aws", "credentials");
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseIni",
    ()=>parseIni
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/profile.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [app-route] (ecmascript)");
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
                if (Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IniSectionType"]).includes(prefix)) {
                    currentSection = [
                        prefix,
                        name
                    ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
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
                    ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]) : name;
                    map[currentSection][key] = value;
                }
            }
        }
    }
    return map;
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadSharedConfigFiles",
    ()=>loadSharedConfigFiles
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigData$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigFilepath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigFilepath.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getCredentialsFilepath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getCredentialsFilepath.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js [app-route] (ecmascript)");
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
    const { filepath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getCredentialsFilepath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCredentialsFilepath"])(), configFilepath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigFilepath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfigFilepath"])() } = init;
    const homeDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHomeDir"])();
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readFile"])(resolvedConfigFilepath, {
            ignoreCache: init.ignoreCache
        }).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseIni"]).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigData$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfigData"]).catch(swallowError),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readFile"])(resolvedFilepath, {
            ignoreCache: init.ignoreCache
        }).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseIni"]).catch(swallowError)
    ]);
    return {
        configFile: parsedFiles[0],
        credentialsFile: parsedFiles[1]
    };
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromSharedConfigFiles",
    ()=>fromSharedConfigFiles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [app-route] (ecmascript)");
;
;
;
;
const fromSharedConfigFiles = (configSelector, { preferredFile = "config", ...init } = {})=>async ()=>{
        const profile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProfileName"])(init);
        const { configFile, credentialsFile } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadSharedConfigFiles"])(init);
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CredentialsProviderError"](e.message || `Not found in config files w/ profile [${profile}]: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSelectorName"])(configSelector.toString())}`, {
                logger: init.logger
            });
        }
    };
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromValue",
    ()=>fromValue
]);
const fromValue = (staticValue)=>()=>Promise.resolve(staticValue);
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromStatic",
    ()=>fromStatic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$fromValue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js [app-route] (ecmascript)");
;
const isFunction = (func)=>typeof func === "function";
const fromStatic = (defaultValue)=>isFunction(defaultValue) ? async ()=>await defaultValue() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$fromValue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromValue"])(defaultValue);
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadConfig",
    ()=>loadConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$chain$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$memoize$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromEnv$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromSharedConfigFiles$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromStatic$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js [app-route] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$memoize$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$chain$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["chain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromEnv$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromEnv"])(environmentVariableSelector, envOptions), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromSharedConfigFiles$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromSharedConfigFiles"])(configFileSelector, configuration), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromStatic$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromStatic"])(defaultValue)));
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointUrlConfig.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_ENDPOINT_URL",
    ()=>CONFIG_ENDPOINT_URL,
    "ENV_ENDPOINT_URL",
    ()=>ENV_ENDPOINT_URL,
    "getEndpointUrlConfig",
    ()=>getEndpointUrlConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [app-route] (ecmascript)");
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
                ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
                if (!config || !config[servicesSectionKey]) {
                    throw new Error(`The services section "${profile.services}" specified in the profile is not present in the shared configuration file.`);
                }
                const servicesSection = config[servicesSectionKey];
                const servicePrefixParts = serviceId.split(" ").map((w)=>w.toLowerCase());
                const endpointUrl = servicesSection[[
                    servicePrefixParts.join("_"),
                    CONFIG_ENDPOINT_URL
                ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"])];
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/booleanSelector.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/types.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getIgnoreConfiguredEndpointUrls.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS",
    ()=>CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS,
    "ENV_IGNORE_CONFIGURED_ENDPOINT_URLS",
    ()=>ENV_IGNORE_CONFIGURED_ENDPOINT_URLS,
    "ignoreConfiguredEndpointUrlsConfigSelectors",
    ()=>ignoreConfiguredEndpointUrlsConfigSelectors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$booleanSelector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/booleanSelector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/types.js [app-route] (ecmascript)");
;
const ENV_IGNORE_CONFIGURED_ENDPOINT_URLS = "AWS_IGNORE_CONFIGURED_ENDPOINT_URLS";
const CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS = "ignore_configured_endpoint_urls";
const ignoreConfiguredEndpointUrlsConfigSelectors = {
    environmentVariableSelector: (env)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$booleanSelector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["booleanSelector"])(env, ENV_IGNORE_CONFIGURED_ENDPOINT_URLS, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SelectorType"].ENV),
    configFileSelector: (profile)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$booleanSelector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["booleanSelector"])(profile, CONFIG_IGNORE_CONFIGURED_ENDPOINT_URLS, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$util$2d$config$2d$provider$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SelectorType"].CONFIG),
    default: false
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEndpointFromConfig",
    ()=>getEndpointFromConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointUrlConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointUrlConfig.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getIgnoreConfiguredEndpointUrls$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getIgnoreConfiguredEndpointUrls.js [app-route] (ecmascript)");
;
;
;
const getEndpointFromConfig = async (serviceId)=>{
    const ignore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getIgnoreConfiguredEndpointUrls$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ignoreConfiguredEndpointUrlsConfigSelectors"])();
    if (ignore) {
        return undefined;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointUrlConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEndpointUrlConfig"])(serviceId ?? ""))();
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasOwn",
    ()=>hasOwn
]);
function hasOwn(o, k) {
    return Object.prototype.hasOwnProperty.call(o, k);
}
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUrl",
    ()=>parseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseQueryString$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js [app-route] (ecmascript)");
;
const parseUrl = (url)=>{
    if (typeof url === "string") {
        return parseUrl(new URL(url));
    }
    const { hostname, pathname, port, protocol, search } = url;
    let query;
    if (search) {
        query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseQueryString$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQueryString"])(search);
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toEndpointV1",
    ()=>toEndpointV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$hasOwn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/hasOwn.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js [app-route] (ecmascript)");
;
;
const toEndpointV1 = (endpoint)=>{
    if (typeof endpoint === "object") {
        if ("url" in endpoint) {
            const v1Endpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseUrl"])(endpoint.url);
            if (endpoint.headers) {
                v1Endpoint.headers = {};
                for(const name in endpoint.headers){
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$hasOwn$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasOwn"])(endpoint.headers, name)) {
                        continue;
                    }
                    v1Endpoint.headers[name.toLowerCase()] = endpoint.headers[name].join(", ");
                }
            }
            return v1Endpoint;
        }
        return endpoint;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseUrl"])(endpoint);
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindGetEndpointFromInstructions",
    ()=>bindGetEndpointFromInstructions,
    "resolveParams",
    ()=>resolveParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$service$2d$customizations$2f$s3$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$createConfigValueProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [app-route] (ecmascript)");
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
                clientConfig.endpoint = ()=>Promise.resolve((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toEndpointV1"])(endpointFromConfig));
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
                endpointParams[name] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$createConfigValueProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createConfigValueProvider"])(instruction.name, name, clientConfig, instruction.type !== "builtInParams")();
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
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$service$2d$customizations$2f$s3$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveParamsForS3"])(endpointParams);
    }
    return endpointParams;
};
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSmithyContext",
    ()=>getSmithyContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$middleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/middleware.js [app-route] (ecmascript)");
;
const getSmithyContext = (context)=>context[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$middleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SMITHY_CONTEXT_KEY"]] || (context[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$types$40$4$2e$19$2e$0$2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$middleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SMITHY_CONTEXT_KEY"]] = {});
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindEndpointMiddleware",
    ()=>bindEndpointMiddleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$getSmithyContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js [app-route] (ecmascript)");
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
    const getEndpointFromInstructions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bindGetEndpointFromInstructions"])(getEndpointFromConfig);
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
                    const smithyContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$getSmithyContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSmithyContext"])(context);
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/getEndpointPlugin.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindGetEndpointPlugin",
    ()=>bindGetEndpointPlugin,
    "endpointMiddlewareOptions",
    ()=>endpointMiddlewareOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js [app-route] (ecmascript)");
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
    const endpointMiddleware = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bindEndpointMiddleware"])(getEndpointFromConfig);
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bindResolveEndpointConfig",
    ()=>bindResolveEndpointConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [app-route] (ecmascript)");
;
;
function bindResolveEndpointConfig(getEndpointFromConfig) {
    return (input)=>{
        const tls = input.tls ?? true;
        const { endpoint, useDualstackEndpoint, useFipsEndpoint } = input;
        const customEndpointProvider = endpoint != null ? async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toEndpointV1"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProvider"])(endpoint)()) : undefined;
        const isCustomEndpoint = !!endpoint;
        const resolvedConfig = Object.assign(input, {
            endpoint: customEndpointProvider,
            tls,
            isCustomEndpoint,
            useDualstackEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProvider"])(useDualstackEndpoint ?? false),
            useFipsEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProvider"])(useFipsEndpoint ?? false),
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
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$getEndpointPlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/getEndpointPlugin.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$resolveEndpointConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js [app-route] (ecmascript)");
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
const getEndpointFromInstructions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromInstructions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bindGetEndpointFromInstructions"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
const resolveEndpointConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$resolveEndpointConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bindResolveEndpointConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
const endpointMiddleware = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$endpointMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bindEndpointMiddleware"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
const getEndpointPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$getEndpointPlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bindGetEndpointPlugin"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$middleware$2d$endpoint$2f$adaptors$2f$getEndpointFromConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEndpointFromConfig"]);
;
;
;
;
}),
"[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/profile.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@smithy+types@4.19.0/node_modules/@smithy/types/dist-es/middleware.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SMITHY_CONTEXT_KEY",
    ()=>SMITHY_CONTEXT_KEY
]);
const SMITHY_CONTEXT_KEY = "__smithy_context";
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.shared.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runtimeConfig",
    ()=>runtimeConfig
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$shared$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.shared.js [app-route] (ecmascript)");
;
;
const runtimeConfig = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$shared$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runtimeConfigShared"],
    runtime: "node",
    statSync: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["statSync"],
    isFileReadStream (f) {
        return f instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["ReadStream"];
    }
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLength.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "byteLength",
    ()=>byteLength
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.js [app-route] (ecmascript)");
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
    } else if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runtimeConfig"].isFileReadStream(input)) {
        try {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runtimeConfig"].statSync(input.path).size;
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLengthSource.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BYTE_LENGTH_SOURCE",
    ()=>BYTE_LENGTH_SOURCE,
    "byteLengthSource",
    ()=>byteLengthSource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/runtimeConfig.js [app-route] (ecmascript)");
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
    } else if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runtimeConfig"].isFileReadStream(input)) {
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runtimeConfig"].statSync(input.path).size;
            return BYTE_LENGTH_SOURCE.STAT;
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkStream.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkUint8Array.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadable.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadableStream.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunker.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getChunk",
    ()=>getChunk
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkStream.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkUint8Array$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getChunkUint8Array.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadable$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadable.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadableStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunks/getDataReadableStream.js [app-route] (ecmascript)");
;
;
;
;
;
;
const getChunk = (data, partSize)=>{
    if (data instanceof Uint8Array) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkUint8Array$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getChunkUint8Array"])(data, partSize);
    }
    if (data instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["Readable"]) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getChunkStream"])(data, partSize, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadable$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDataReadable"]);
    }
    if (data instanceof String || typeof data === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkUint8Array$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getChunkUint8Array"])(__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(data), partSize);
    }
    if (typeof data.stream === "function") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getChunkStream"])(data.stream(), partSize, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadableStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDataReadableStream"]);
    }
    if (data instanceof ReadableStream) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getChunkStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getChunkStream"])(data, partSize, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunks$2f$getDataReadableStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDataReadableStream"]);
    }
    throw new Error("Body Data is unsupported format, expected data to be one of: string | Uint8Array | Buffer | Readable | ReadableStream | Blob;.");
};
}),
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/Upload.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Upload",
    ()=>Upload
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/.pnpm/@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/client-s3)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/endpoints/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$extended$2d$encode$2d$uri$2d$component$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@smithy+core@3.38.1/node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/events [external] (events, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLength.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLengthSource$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/byteLengthSource.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/chunker.js [app-route] (ecmascript)");
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
        this.totalBytes = this.params.ContentLength ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["byteLength"])(this.params.Body);
        this.totalBytesSource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLengthSource$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["byteLengthSource"])(this.params.Body, this.params.ContentLength);
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
            endpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$toEndpointV1$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toEndpointV1"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEndpointFromInstructions"])(params, __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["PutObjectCommand"], {
                ...clientConfig
            }));
        }
        if (!endpoint) {
            throw new Error('Could not resolve endpoint from S3 "client.config.endpoint()" nor EndpointsV2.');
        }
        if (eventEmitter !== null) {
            eventEmitter.off("xhr.upload.progress", uploadEventListener);
        }
        const locationKey = this.params.Key.split("/").map((segment)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$extended$2d$encode$2d$uri$2d$component$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extendedEncodeURIComponent"])(segment)).join("/");
        const locationBucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$smithy$2b$core$40$3$2e$38$2e$1$2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$extended$2d$encode$2d$uri$2d$component$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extendedEncodeURIComponent"])(this.params.Bucket);
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
        const totalSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["byteLength"])(dataPart.data);
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
            const partSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["byteLength"])(dataPart.data) || 0;
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
        const dataFeeder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getChunk"])(this.params.Body, this.partSize);
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
        const actualPartSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$byteLength$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["byteLength"])(dataPart.data);
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
"[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$lib$2d$storage$40$3$2e$1153$2e$0_$40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1153$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$storage$2f$dist$2d$es$2f$Upload$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+lib-storage@3.1153.0_@aws-sdk+client-s3@3.1153.0/node_modules/@aws-sdk/lib-storage/dist-es/Upload.js [app-route] (ecmascript)");
;
}),
"[externals]/sharp [external] (sharp, esm_import, [project]/node_modules/.pnpm/sharp@0.35.5_@types+node@22.20.5/node_modules/sharp)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("sharp-5b8fb420cf576716");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/sqlite-introspector-DSCAP82F.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>DEFAULT_MIGRATION_LOCK_TABLE,
    "i",
    ()=>toSqliteTableMetadata,
    "n",
    ()=>introspectSqliteTables,
    "o",
    ()=>DEFAULT_MIGRATION_TABLE,
    "r",
    ()=>sqliteIntegerPrimaryKeyColumn,
    "t",
    ()=>createSqliteIntrospector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/raw-builder/sql.js [app-route] (ecmascript)");
;
//#region src/kysely-migration-tables.ts
/**
* Kysely's internal migration table names, mirrored as local constants.
*
* Kysely 0.29 moved these from its main entry to the `kysely/migration`
* subpath (which 0.28 lacks), and the main entry now exports only type stubs
* with no runtime value, which breaks strict ESM bundlers.
*
* The values are stable parts of Kysely's public migration contract. Mirroring
* them allows the SQLite dialects to support both Kysely 0.28 and 0.29.
*
* TODO: Import these from `kysely/migration` after dropping Kysely 0.28.
*/ const DEFAULT_MIGRATION_TABLE = "kysely_migration";
const DEFAULT_MIGRATION_LOCK_TABLE = "kysely_migration_lock";
//#endregion
//#region src/sqlite-introspector.ts
function sqliteIntegerPrimaryKeyColumn(columns) {
    const primaryKeys = columns.filter((column)=>column.pk > 0);
    const primaryKey = primaryKeys.length === 1 ? primaryKeys[0] : void 0;
    return primaryKey?.type.toLowerCase() === "integer" ? primaryKey.name : void 0;
}
async function sqliteGeneratedPrimaryKeyColumn(db, name, columns) {
    const column = sqliteIntegerPrimaryKeyColumn(columns);
    if (!column) return;
    const { rows } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
		PRAGMA index_list(${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].id(name)})
	`.execute(db.withoutPlugins());
    return rows.some((index)=>index.origin === "pk") ? void 0 : column;
}
function toSqliteTableMetadata(table, columns, autoIncrementColumn) {
    return {
        name: table.name,
        isView: table.type === "view",
        columns: columns.map((column)=>({
                name: column.name,
                dataType: column.type,
                isNullable: column.notnull === 0,
                isAutoIncrementing: column.name === autoIncrementColumn,
                hasDefaultValue: column.dflt_value != null
            }))
    };
}
async function readTableMetadata(db, name) {
    const { rows: columns } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
		PRAGMA table_info(${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].id(name)})
	`.execute(db.withoutPlugins());
    if (columns.length === 0) return;
    const generatedColumn = await sqliteGeneratedPrimaryKeyColumn(db, name, columns);
    return toSqliteTableMetadata({
        name
    }, columns, generatedColumn);
}
async function introspectSqliteTables(db, tableNames) {
    if (tableNames.length === 0) return [];
    try {
        return await db.introspection.getTables();
    } catch  {
        return (await Promise.all(tableNames.map((name)=>readTableMetadata(db, name)))).filter((table)=>table !== void 0);
    }
}
function createSqliteIntrospector(db) {
    const systemDb = db;
    async function getSchemas() {
        return [];
    }
    async function getTables(options = {
        withInternalKyselyTables: false
    }) {
        let query = systemDb.selectFrom("sqlite_schema").where("type", "=", "table").where("name", "not like", "sqlite_%").select("name");
        if (!options.withInternalKyselyTables) query = query.where("name", "!=", DEFAULT_MIGRATION_TABLE).where("name", "!=", DEFAULT_MIGRATION_LOCK_TABLE);
        const tables = await query.execute();
        return Promise.all(tables.map(async ({ name })=>{
            const columns = await db.selectFrom(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`pragma_table_info(${name})`.as("table_info")).select([
                "cid",
                "name",
                "type",
                "notnull",
                "dflt_value",
                "pk"
            ]).execute();
            const generatedColumn = await sqliteGeneratedPrimaryKeyColumn(db, name, columns);
            return toSqliteTableMetadata({
                name
            }, columns, generatedColumn);
        }));
    }
    return {
        getSchemas,
        getTables,
        getMetadata: async (options)=>({
                tables: await getTables(options)
            })
    };
}
;
}),
"[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createKyselyAdapter",
    ()=>createKyselyAdapter,
    "getKyselyDatabaseType",
    ()=>getKyselyDatabaseType,
    "getMssqlSchema",
    ()=>getMssqlSchema,
    "getPostgresSchema",
    ()=>getPostgresSchema,
    "kyselyAdapter",
    ()=>kyselyAdapter,
    "toIntrospectedTables",
    ()=>toIntrospectedTables,
    "toPhysicalSchema",
    ()=>toPhysicalSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$kysely$2d$adapter$40$1$2e$7$2e$7_$40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$bet_e634cb8c9ba639d5a1eb368bdd259776$2f$node_modules$2f40$better$2d$auth$2f$kysely$2d$adapter$2f$dist$2f$sqlite$2d$introspector$2d$DSCAP82F$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/sqlite-introspector-DSCAP82F.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/error/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$column$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/operation-node/column-node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$kysely$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/kysely.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$mssql$2f$mssql$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/dialect/mssql/mssql-dialect.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$mysql$2f$mysql$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/dialect/mysql/mysql-dialect.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$postgres$2f$postgres$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/dialect/postgres/postgres-dialect.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$reference$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/operation-node/reference-node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$select$2d$query$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/operation-node/select-query-node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$sqlite$2f$sqlite$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/dialect/sqlite/sqlite-dialect.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$table$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/operation-node/table-node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/kysely@0.29.6/node_modules/kysely/dist/raw-builder/sql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$adapter$2f$factory$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/db/adapter/factory.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$check$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/db/schema-check.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$diff$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/db/schema-diff.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$logger$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/env/logger.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2f$string$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/utils/string.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
//#region src/dialect.ts
function getKyselyDatabaseType(db) {
    if (!db) return null;
    if ("dialect" in db) return getKyselyDatabaseType(db.dialect);
    if ("createDriver" in db) {
        if (db instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$sqlite$2f$sqlite$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SqliteDialect"]) return "sqlite";
        if (db instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$mysql$2f$mysql$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MysqlDialect"]) return "mysql";
        if (db instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$postgres$2f$postgres$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PostgresDialect"]) return "postgres";
        if (db instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$mssql$2f$mssql$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MssqlDialect"]) return "mssql";
    }
    if ("aggregate" in db) return "sqlite";
    if ("getConnection" in db) return "mysql";
    if ("connect" in db) return "postgres";
    if ("fileControl" in db) return "sqlite";
    if ("open" in db && "close" in db && "prepare" in db) return "sqlite";
    if ("batch" in db && "exec" in db && "prepare" in db) return "sqlite";
    return null;
}
function checkSchemaName(schemaName, databaseType) {
    if (schemaName === void 0) return;
    if (typeof schemaName !== "string" || schemaName.length === 0) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BetterAuthError"]("`database.schemaName` must be a non-empty schema name.");
    if (databaseType !== "postgres") throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BetterAuthError"](`\`database.schemaName\` is only supported on PostgreSQL, but the configured database type is "${databaseType ?? "unknown"}".`);
}
const createKyselyAdapter = async (config)=>{
    const db = config.database;
    if (!db) return {
        kysely: null,
        databaseType: null,
        introspectIndexes: void 0,
        schemaName: void 0,
        transaction: void 0
    };
    if ("db" in db) {
        const schemaName = db.schemaName;
        checkSchemaName(schemaName, db.type);
        return {
            kysely: schemaName ? db.db.withSchema(schemaName) : db.db,
            databaseType: db.type,
            introspectIndexes: void 0,
            schemaName,
            transaction: db.transaction
        };
    }
    if ("dialect" in db) {
        const schemaName = db.schemaName;
        checkSchemaName(schemaName, db.type);
        const kysely = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$kysely$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Kysely"]({
            dialect: db.dialect
        });
        return {
            kysely: schemaName ? kysely.withSchema(schemaName) : kysely,
            databaseType: db.type,
            introspectIndexes: void 0,
            schemaName,
            transaction: db.transaction
        };
    }
    let dialect = void 0;
    let introspectIndexes = void 0;
    let transaction = void 0;
    const databaseType = getKyselyDatabaseType(db);
    if ("createDriver" in db) dialect = db;
    if ("aggregate" in db && !("createSession" in db)) {
        dialect = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$sqlite$2f$sqlite$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SqliteDialect"]({
            database: db
        });
        transaction = true;
    }
    if ("getConnection" in db) {
        dialect = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$mysql$2f$mysql$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MysqlDialect"](db);
        transaction = true;
    }
    if ("connect" in db) {
        dialect = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$dialect$2f$postgres$2f$postgres$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PostgresDialect"]({
            pool: db
        });
        transaction = true;
    }
    if ("fileControl" in db) {
        const { BunSqliteDialect } = await __turbopack_context__.A("[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/bun-sqlite-dialect-DoOVo4ja.mjs [app-route] (ecmascript, async loader)");
        dialect = new BunSqliteDialect({
            database: db
        });
        transaction = true;
    }
    if ("createSession" in db) {
        let DatabaseSync = void 0;
        try {
            const nodeSqlite = "node:sqlite";
            ({ DatabaseSync } = await import(/* @vite-ignore */ /* webpackIgnore: true */ nodeSqlite));
        } catch (error) {
            if (error !== null && typeof error === "object" && "code" in error && error.code !== "ERR_UNKNOWN_BUILTIN_MODULE") throw error;
        }
        if (DatabaseSync && db instanceof DatabaseSync) {
            const { NodeSqliteDialect } = await __turbopack_context__.A("[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/node-sqlite-dialect.mjs [app-route] (ecmascript, async loader)");
            dialect = new NodeSqliteDialect({
                database: db
            });
            transaction = true;
        }
    }
    if ("batch" in db && "exec" in db && "prepare" in db) {
        const { createD1IndexIntrospector, D1SqliteDialect } = await __turbopack_context__.A("[project]/node_modules/.pnpm/@better-auth+kysely-adapter@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@bet_e634cb8c9ba639d5a1eb368bdd259776/node_modules/@better-auth/kysely-adapter/dist/d1-sqlite-dialect-Cru74LbR.mjs [app-route] (ecmascript, async loader)");
        dialect = new D1SqliteDialect({
            database: db
        });
        introspectIndexes = createD1IndexIntrospector(db);
        transaction = false;
    }
    return {
        kysely: dialect ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$kysely$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Kysely"]({
            dialect
        }) : null,
        databaseType,
        introspectIndexes,
        schemaName: void 0,
        transaction
    };
};
//#endregion
//#region src/query-builders.ts
/**
* Case-insensitive ILIKE/LIKE for pattern matching.
* Uses ILIKE on PostgreSQL, LOWER()+LIKE on MySQL/SQLite/MSSQL.
*/ function insensitiveIlike(columnRef, pattern, dbType) {
    return dbType === "postgres" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(columnRef)} ILIKE ${pattern}` : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`LOWER(${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(columnRef)}) LIKE LOWER(${pattern})`;
}
/**
* Case-insensitive IN for string arrays.
* Returns { lhs, values } for use with eb(lhs, "in", values).
*/ function insensitiveIn(columnRef, values) {
    return {
        lhs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`LOWER(${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(columnRef)})`,
        values: values.map((v)=>v.toLowerCase())
    };
}
/**
* Case-insensitive NOT IN for string arrays.
*/ function insensitiveNotIn(columnRef, values) {
    return {
        lhs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`LOWER(${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(columnRef)})`,
        values: values.map((v)=>v.toLowerCase())
    };
}
/**
* Case-insensitive equality for strings.
* Returns { lhs, value } for use with eb(lhs, "=", value).
*/ function insensitiveEq(columnRef, value) {
    return {
        lhs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`LOWER(${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(columnRef)})`,
        value: value.toLowerCase()
    };
}
/**
* Case-insensitive inequality for strings.
*/ function insensitiveNe(columnRef, value) {
    return {
        lhs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`LOWER(${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(columnRef)})`,
        value: value.toLowerCase()
    };
}
//#endregion
//#region src/schema-check.ts
/**
* Converts Kysely table metadata into the shape `diffSchema` compares.
*/ function toIntrospectedTables(tables) {
    return tables.map((table)=>({
            name: table.name,
            schema: table.schema,
            columns: table.columns.map((column)=>({
                    name: column.name,
                    nullable: column.isNullable,
                    hasDefault: column.hasDefaultValue || column.isAutoIncrementing
                }))
        }));
}
/**
* The expected schema in the identifiers the connection sends. A plugin that
* renames identifiers, such as `CamelCasePlugin`, does so in `transformQuery`,
* so compiling one select per table through the connection yields the names
* the database is asked for. Without such a plugin the schema is unchanged.
*/ function toPhysicalSchema(db, expected) {
    const physical = {};
    for (const [table, definition] of Object.entries(expected)){
        const entries = Object.entries(definition.fields);
        const sent = sentIdentifiers(db, table, [
            definition.idColumn ?? "id",
            ...entries.map(([column])=>column)
        ]);
        const fields = {};
        entries.forEach(([column, attribute], index)=>{
            fields[sent.columns[index + 1] ?? column] = attribute;
        });
        physical[sent.table] = {
            ...definition,
            fields,
            schema: sent.schema ?? definition.schema,
            ...sent.columns[0] !== "id" && {
                idColumn: sent.columns[0]
            }
        };
    }
    return physical;
}
/**
* Compiles a select of `columns` from `table` and reads the identifiers back
* out of the transformed query, including the schema a plugin such as
* `WithSchemaPlugin` qualifies the table with. A node the query does not
* carry in the expected shape leaves its identifier undefined.
*/ function sentIdentifiers(db, table, columns) {
    const { query } = db.selectFrom(table).select(columns).compile();
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$select$2d$query$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SelectQueryNode"].is(query)) return {
        table,
        columns: []
    };
    const from = query.from?.froms[0];
    const sentTable = from && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$table$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TableNode"].is(from) ? from.table : void 0;
    return {
        schema: sentTable?.schema?.name,
        table: sentTable?.identifier.name ?? table,
        columns: (query.selections ?? []).map(({ selection })=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$reference$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReferenceNode"].is(selection) && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$operation$2d$node$2f$column$2d$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ColumnNode"].is(selection.column) ? selection.column.column.name : void 0)
    };
}
/**
* The default schema for migration tooling. Let PostgreSQL resolve role
* names and privileges, retaining the legacy public fallback when none exists.
* Runtime validation uses the effective search path instead of this fallback.
*/ async function getPostgresSchema(db) {
    return (await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
		SELECT pg_catalog.current_schema() AS schema
	`.execute(db.withoutPlugins())).rows[0]?.schema ?? "public";
}
async function getMssqlSchema(db) {
    return (await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
		SELECT SCHEMA_NAME() AS "schemaName"
	`.execute(db.withoutPlugins())).rows[0]?.schemaName || "dbo";
}
async function schemaSearchPath(db, dbType) {
    if (dbType === "postgres") return (await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
			SELECT pg_catalog.current_schemas(true)::text[] AS schemas
		`.execute(db.withoutPlugins())).rows[0]?.schemas ?? [];
    if (dbType === "mssql") return [
        await getMssqlSchema(db),
        "dbo"
    ];
}
/**
* Compares the live database with the tables this configuration writes. Both
* sides are read in the identifiers the connection sends: a plugin that
* renames identifiers or qualifies them with a schema is applied to the
* expected side, and introspection reports what the database stores.
*/ async function findSchemaProblems(db, dbType, expected) {
    const physical = toPhysicalSchema(db, expected);
    if (dbType === "sqlite") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$diff$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diffSchema"])(physical, toIntrospectedTables(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$kysely$2d$adapter$40$1$2e$7$2e$7_$40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$bet_e634cb8c9ba639d5a1eb368bdd259776$2f$node_modules$2f40$better$2d$auth$2f$kysely$2d$adapter$2f$dist$2f$sqlite$2d$introspector$2d$DSCAP82F$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["n"])(db, Object.entries(physical).flatMap(([name, table])=>table.disableMigrations ? [] : [
            name
        ]))));
    return db.connection().execute(async (connection)=>{
        const searchPath = await schemaSearchPath(connection, dbType);
        const tables = toIntrospectedTables(await connection.introspection.getTables());
        for (const [name, table] of Object.entries(physical)){
            if (table.schema !== void 0 || !searchPath) continue;
            table.schema = searchPath.find((schema)=>tables.some((candidate)=>candidate.name === name && candidate.schema === schema)) ?? "";
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$diff$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diffSchema"])(physical, tables);
    });
}
//#endregion
//#region src/kysely-adapter.ts
const kyselyAdapter = (db, config)=>{
    let lazyOptions = null;
    let mysqlNoIdWarned = false;
    const createCustomAdapter = (db, inTransaction = false)=>{
        return ({ getFieldName, schema, getDefaultFieldName, getDefaultModelName, getFieldAttributes, getModelName, options })=>{
            if (config?.type === "mysql" && options.advanced?.database?.generateId === false && !mysqlNoIdWarned) {
                mysqlNoIdWarned = true;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$logger$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn("[Kysely Adapter] MySQL does not support INSERT...RETURNING. With generateId set to false, the adapter uses best-effort fallback strategies (unique columns, full-field match) to retrieve inserted rows. For reliable behavior, use Better Auth's default ID generation, a custom generateId function, or generateId: \"serial\" for auto-increment.");
            }
            const selectAllJoins = (join)=>{
                const allSelects = [];
                const allSelectsStr = [];
                if (join) for (const [joinModel, joinConfig] of Object.entries(join)){
                    const fields = schema[joinConfig.modelKey ?? getDefaultModelName(joinModel)]?.fields;
                    const [_joinModelSchema, joinModelName] = joinModel.includes(".") ? joinModel.split(".") : [
                        void 0,
                        joinModel
                    ];
                    if (!fields) continue;
                    fields.id = {
                        type: "string"
                    };
                    for (const [field, fieldAttr] of Object.entries(fields)){
                        allSelects.push(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(`join_${joinModelName}`)}.${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(fieldAttr.fieldName || field)} as ${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(`_joined_${joinModelName}_${fieldAttr.fieldName || field}`)}`);
                        allSelectsStr.push({
                            joinModel,
                            joinModelRef: joinModelName,
                            fieldName: fieldAttr.fieldName || field
                        });
                    }
                }
                return {
                    allSelectsStr,
                    allSelects
                };
            };
            const withReturning = async (values, builder, model, modelKey, where)=>{
                if (config?.type === "mysql") {
                    if (where.length > 0) {
                        const updateResult = await builder.executeTakeFirst();
                        if (!updateResult || Number(updateResult.numUpdatedRows ?? 0) === 0) return null;
                        const idEqualityWhere = where.find((w)=>w.field === "id" && (w.operator === void 0 || w.operator === "eq") && w.connector !== "OR" && w.value !== void 0 && w.value !== null);
                        let reselectField;
                        let reselectValue;
                        if (values.id !== void 0 && values.id !== null) {
                            reselectField = "id";
                            reselectValue = values.id;
                        } else if (idEqualityWhere) {
                            reselectField = "id";
                            reselectValue = idEqualityWhere.value;
                        } else if (where[0]?.field) {
                            reselectField = where[0].field;
                            reselectValue = values[reselectField] !== void 0 ? values[reselectField] : where[0].value;
                        } else return null;
                        return await db.selectFrom(model).selectAll().where(getFieldName({
                            model: modelKey,
                            field: reselectField
                        }), reselectValue === null ? "is" : "=", reselectValue).limit(1).executeTakeFirst();
                    }
                    await builder.execute();
                    const fetchInserted = async (trx)=>{
                        if (values.id) return await trx.selectFrom(model).selectAll().where(getFieldName({
                            model: modelKey,
                            field: "id"
                        }), "=", values.id).limit(1).executeTakeFirst();
                        if (options.advanced?.database?.generateId === "serial") {
                            const lastId = (await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`SELECT LAST_INSERT_ID() as id`.execute(trx)).rows[0]?.id;
                            if (lastId) return await trx.selectFrom(model).selectAll().where(getFieldName({
                                model: modelKey,
                                field: "id"
                            }), "=", lastId).limit(1).executeTakeFirst();
                        }
                        const modelSchema = schema[modelKey]?.fields;
                        if (modelSchema) for (const [fieldKey, fieldAttr] of Object.entries(modelSchema)){
                            if (!fieldAttr.unique) continue;
                            const dbFieldName = getFieldName({
                                model: modelKey,
                                field: fieldKey
                            });
                            const val = values[dbFieldName];
                            if (val === void 0 || val === null) continue;
                            const row = await trx.selectFrom(model).selectAll().where(dbFieldName, "=", val).limit(1).executeTakeFirst();
                            if (row) return row;
                        }
                        let query = trx.selectFrom(model).selectAll();
                        let hasConditions = false;
                        for (const [key, val] of Object.entries(values)){
                            if (val === void 0) continue;
                            query = query.where(key, val === null ? "is" : "=", val);
                            hasConditions = true;
                        }
                        if (hasConditions) {
                            const rows = await query.limit(2).execute();
                            if (rows.length === 1) return rows[0];
                        }
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$logger$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn(`[Kysely Adapter] Unable to safely identify the inserted "${model}" row on MySQL. Enable Better Auth ID generation or use generateId: "serial" for reliable behavior.`);
                        return null;
                    };
                    return inTransaction ? fetchInserted(db) : db.transaction().execute(fetchInserted);
                }
                if (config?.type === "mssql") return await builder.outputAll("inserted").executeTakeFirst();
                return await builder.returningAll().executeTakeFirst();
            };
            function convertWhereClause(model, modelKey, w) {
                if (!w) return {
                    and: null,
                    or: null
                };
                const conditions = {
                    and: [],
                    or: []
                };
                w.forEach((condition)=>{
                    const { field: _field, value: _value, operator = "eq", connector = "AND", mode = "sensitive" } = condition;
                    const value = _value;
                    const field = getFieldName({
                        model: modelKey,
                        field: _field
                    });
                    const isInsensitive = mode === "insensitive" && (typeof value === "string" || Array.isArray(value) && value.every((v)=>typeof v === "string"));
                    const expr = (eb)=>{
                        const f = `${model}.${field}`;
                        if (operator.toLowerCase() === "in") {
                            if (isInsensitive) {
                                const { lhs, values } = insensitiveIn(f, Array.isArray(value) ? value : [
                                    value
                                ]);
                                return eb(lhs, "in", values);
                            }
                            return eb(f, "in", Array.isArray(value) ? value : [
                                value
                            ]);
                        }
                        if (operator.toLowerCase() === "not_in") {
                            if (isInsensitive) {
                                const { lhs, values } = insensitiveNotIn(f, Array.isArray(value) ? value : [
                                    value
                                ]);
                                return eb(lhs, "not in", values);
                            }
                            return eb(f, "not in", Array.isArray(value) ? value : [
                                value
                            ]);
                        }
                        if (operator === "contains") {
                            if (isInsensitive && typeof value === "string") return insensitiveIlike(f, `%${value}%`, config?.type);
                            return eb(f, "like", `%${value}%`);
                        }
                        if (operator === "starts_with") {
                            if (isInsensitive && typeof value === "string") return insensitiveIlike(f, `${value}%`, config?.type);
                            return eb(f, "like", `${value}%`);
                        }
                        if (operator === "ends_with") {
                            if (isInsensitive && typeof value === "string") return insensitiveIlike(f, `%${value}`, config?.type);
                            return eb(f, "like", `%${value}`);
                        }
                        if (operator === "eq") {
                            if (value === null) return eb(f, "is", null);
                            if (isInsensitive && typeof value === "string") {
                                const { lhs, value: v } = insensitiveEq(f, value);
                                return eb(lhs, "=", v);
                            }
                            return eb(f, "=", value);
                        }
                        if (operator === "ne") {
                            if (value === null) return eb(f, "is not", null);
                            if (isInsensitive && typeof value === "string") {
                                const { lhs, value: v } = insensitiveNe(f, value);
                                return eb(lhs, "<>", v);
                            }
                            return eb(f, "<>", value);
                        }
                        if (operator === "gt") return eb(f, ">", value);
                        if (operator === "gte") return eb(f, ">=", value);
                        if (operator === "lt") return eb(f, "<", value);
                        if (operator === "lte") return eb(f, "<=", value);
                        return eb(f, operator, value);
                    };
                    if (connector === "OR") conditions.or.push(expr);
                    else conditions.and.push(expr);
                });
                return {
                    and: conditions.and.length ? conditions.and : null,
                    or: conditions.or.length ? conditions.or : null
                };
            }
            function processJoinedResults(rows, joinConfig, allSelectsStr) {
                if (!joinConfig || !rows.length) return rows;
                const groupedByMainId = /* @__PURE__ */ new Map();
                for (const currentRow of rows){
                    const mainModelFields = {};
                    const joinedModelFields = {};
                    for (const [joinModel] of Object.entries(joinConfig))joinedModelFields[joinModel] = {};
                    for (const [key, value] of Object.entries(currentRow)){
                        const keyStr = String(key);
                        let assigned = false;
                        for (const { joinModel, fieldName, joinModelRef } of allSelectsStr)if (keyStr === `_joined_${joinModelRef}_${fieldName}` || keyStr === `_Joined${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2f$string$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capitalizeFirstLetter"])(joinModelRef)}${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2f$string$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capitalizeFirstLetter"])(fieldName)}`) {
                            joinedModelFields[joinModel][getFieldName({
                                model: joinConfig[joinModel]?.modelKey ?? joinModel,
                                field: fieldName
                            })] = value;
                            assigned = true;
                            break;
                        }
                        if (!assigned) mainModelFields[key] = value;
                    }
                    const mainId = mainModelFields.id;
                    if (!mainId) continue;
                    if (!groupedByMainId.has(mainId)) {
                        const entry = {
                            ...mainModelFields
                        };
                        for (const [joinModel, joinAttr] of Object.entries(joinConfig))entry[joinModel] = joinAttr.relation === "one-to-one" ? null : [];
                        groupedByMainId.set(mainId, entry);
                    }
                    const entry = groupedByMainId.get(mainId);
                    for (const [joinModel, joinAttr] of Object.entries(joinConfig)){
                        const isUnique = joinAttr.relation === "one-to-one";
                        const limit = joinAttr.limit ?? 100;
                        const joinedObj = joinedModelFields[joinModel];
                        const hasData = joinedObj && Object.keys(joinedObj).length > 0 && Object.values(joinedObj).some((value)=>value !== null && value !== void 0);
                        if (isUnique) entry[joinModel] = hasData ? joinedObj : null;
                        else {
                            const joinModelName = joinModel;
                            if (Array.isArray(entry[joinModelName]) && hasData) {
                                if (entry[joinModelName].length >= limit) continue;
                                const idFieldName = getFieldName({
                                    model: joinAttr.modelKey ?? joinModel,
                                    field: "id"
                                });
                                const joinedId = joinedObj[idFieldName];
                                if (joinedId) {
                                    if (!entry[joinModelName].some((item)=>item[idFieldName] === joinedId) && entry[joinModelName].length < limit) entry[joinModelName].push(joinedObj);
                                } else if (entry[joinModelName].length < limit) entry[joinModelName].push(joinedObj);
                            }
                        }
                    }
                }
                const result = Array.from(groupedByMainId.values());
                for (const entry of result)for (const [joinModel, joinAttr] of Object.entries(joinConfig))if (joinAttr.relation !== "one-to-one") {
                    const joinModelName = joinModel;
                    if (Array.isArray(entry[joinModelName])) {
                        const limit = joinAttr.limit ?? 100;
                        if (entry[joinModelName].length > limit) entry[joinModelName] = entry[joinModelName].slice(0, limit);
                    }
                }
                return result;
            }
            return {
                async create ({ data, model, modelKey = model }) {
                    return await withReturning(data, db.insertInto(model).values(data), model, modelKey, []);
                },
                async findOne ({ model, modelKey = model, where, select, join }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    let query = db.selectFrom((eb)=>{
                        let b = eb.selectFrom(model);
                        if (and) b = b.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                        if (or) b = b.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                        if (select?.length && select.length > 0) b = b.select(select.map((field)=>getFieldName({
                                model: modelKey,
                                field
                            })));
                        else b = b.selectAll();
                        return b.as("primary");
                    }).selectAll("primary");
                    if (join) for (const [joinModel, joinAttr] of Object.entries(join)){
                        const [_joinModelSchema, joinModelName] = joinModel.includes(".") ? joinModel.split(".") : [
                            void 0,
                            joinModel
                        ];
                        query = query.leftJoin(`${joinModel} as join_${joinModelName}`, (join)=>join.onRef(`join_${joinModelName}.${joinAttr.on.to}`, "=", `primary.${joinAttr.on.from}`));
                    }
                    const { allSelectsStr, allSelects } = selectAllJoins(join);
                    query = query.select(allSelects);
                    const res = await query.execute();
                    if (!res || !Array.isArray(res) || res.length === 0) return null;
                    const row = res[0];
                    if (join) return processJoinedResults(res, join, allSelectsStr)[0];
                    return row;
                },
                async findMany ({ model, modelKey = model, where, limit, select, offset, sortBy, join }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    let query = db.selectFrom((eb)=>{
                        let b = eb.selectFrom(model);
                        if (config?.type === "mssql") {
                            if (offset !== void 0) {
                                if (!sortBy) b = b.orderBy(getFieldName({
                                    model: modelKey,
                                    field: "id"
                                }));
                                b = b.offset(offset).fetch(limit || 100);
                            } else if (limit !== void 0) b = b.top(limit);
                        } else {
                            if (limit !== void 0) b = b.limit(limit);
                            if (offset !== void 0) b = b.offset(offset);
                        }
                        if (sortBy?.field) b = b.orderBy(`${getFieldName({
                            model: modelKey,
                            field: sortBy.field
                        })}`, sortBy.direction);
                        if (and) b = b.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                        if (or) b = b.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                        if (select?.length && select.length > 0) b = b.select(select.map((field)=>getFieldName({
                                model: modelKey,
                                field
                            })));
                        else b = b.selectAll();
                        return b.as("primary");
                    }).selectAll("primary");
                    if (join) for (const [joinModel, joinAttr] of Object.entries(join)){
                        const [_joinModelSchema, joinModelName] = joinModel.includes(".") ? joinModel.split(".") : [
                            void 0,
                            joinModel
                        ];
                        query = query.leftJoin(`${joinModel} as join_${joinModelName}`, (join)=>join.onRef(`join_${joinModelName}.${joinAttr.on.to}`, "=", `primary.${joinAttr.on.from}`));
                    }
                    const { allSelectsStr, allSelects } = selectAllJoins(join);
                    query = query.select(allSelects);
                    if (sortBy?.field) query = query.orderBy(`${getFieldName({
                        model: modelKey,
                        field: sortBy.field
                    })}`, sortBy.direction);
                    const res = await query.execute();
                    if (!res) return [];
                    if (join) return processJoinedResults(res, join, allSelectsStr);
                    return res;
                },
                async update ({ model, modelKey = model, where, update: values }) {
                    if (where.length === 0) return null;
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    let query = db.updateTable(model).set(values);
                    if (and) query = query.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                    if (or) query = query.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                    return await withReturning(values, query, model, modelKey, where);
                },
                async updateMany ({ model, modelKey = model, where, update: values }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    let query = db.updateTable(model).set(values);
                    if (and) query = query.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                    if (or) query = query.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                    const res = (await query.executeTakeFirst()).numUpdatedRows;
                    return res > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number(res);
                },
                async count ({ model, modelKey = model, where }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    let query = db.selectFrom(model).select(db.fn.count("id").as("count"));
                    if (and) query = query.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                    if (or) query = query.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                    const res = await query.execute();
                    if (typeof res[0].count === "number") return res[0].count;
                    if (typeof res[0].count === "bigint") return Number(res[0].count);
                    return parseInt(res[0].count);
                },
                async delete ({ model, modelKey = model, where }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    let query = db.deleteFrom(model);
                    if (and) query = query.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                    if (or) query = query.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                    await query.execute();
                },
                async deleteMany ({ model, modelKey = model, where }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    let query = db.deleteFrom(model);
                    if (and) query = query.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                    if (or) query = query.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                    const res = (await query.executeTakeFirst()).numDeletedRows;
                    return res > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number(res);
                },
                async consumeOne ({ model, modelKey = model, where }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    const applyWhere = (query)=>{
                        if (and) query = query.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                        if (or) query = query.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                        return query;
                    };
                    const idField = getFieldName({
                        model: modelKey,
                        field: "id"
                    });
                    const deleteSelectedRow = async (db, row)=>{
                        const targetId = row[idField] ?? row.id;
                        if (targetId === void 0 || targetId === null) return null;
                        const query = db.deleteFrom(model).where(`${model}.${idField}`, "=", targetId);
                        if (config?.type === "mysql") {
                            const result = await query.executeTakeFirst();
                            return Number(result.numDeletedRows) > 0 ? row : null;
                        }
                        if (config?.type === "mssql") return await query.outputAll("deleted").executeTakeFirst() ?? null;
                        return await query.returningAll().executeTakeFirst() ?? null;
                    };
                    const deleteWithReturning = async (query)=>{
                        if (config?.type === "mssql") return await query.outputAll("deleted").executeTakeFirst() ?? null;
                        return await query.returningAll().executeTakeFirst() ?? null;
                    };
                    if (config?.type === "mysql") {
                        const claimFromTransaction = async (trx)=>{
                            const row = await applyWhere(trx.selectFrom(model).selectAll().forUpdate()).limit(1).executeTakeFirst();
                            if (!row) return null;
                            return deleteSelectedRow(trx, row);
                        };
                        return inTransaction ? claimFromTransaction(db) : db.transaction().execute(claimFromTransaction);
                    }
                    const selectIds = applyWhere(db.selectFrom(model).select(`${model}.${idField}`));
                    const targetIds = config?.type === "mssql" ? selectIds.top(1) : selectIds.limit(1);
                    return deleteWithReturning(applyWhere(db.deleteFrom(model).where(`${model}.${idField}`, "in", targetIds)));
                },
                async incrementOne ({ model, modelKey = model, where, increment, set }) {
                    const { and, or } = convertWhereClause(model, modelKey, where);
                    const applyWhere = (query)=>{
                        if (and) query = query.where((eb)=>eb.and(and.map((expr)=>expr(eb))));
                        if (or) query = query.where((eb)=>eb.or(or.map((expr)=>expr(eb))));
                        return query;
                    };
                    const assignments = {
                        ...set ?? {}
                    };
                    for (const [field, delta] of Object.entries(increment))assignments[field] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$kysely$40$0$2e$29$2e$6$2f$node_modules$2f$kysely$2f$dist$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].ref(field)} + ${delta}`;
                    const idField = getFieldName({
                        model: modelKey,
                        field: "id"
                    });
                    if (config?.type === "mysql") {
                        const incrementInTransaction = async (trx)=>{
                            const target = await applyWhere(trx.selectFrom(model).select(`${model}.${idField}`).forUpdate()).limit(1).executeTakeFirst();
                            if (!target) return null;
                            const targetId = target[idField] ?? target.id;
                            if (targetId === void 0 || targetId === null) return null;
                            const updated = await applyWhere(trx.updateTable(model).set(assignments)).where(`${model}.${idField}`, "=", targetId).executeTakeFirst();
                            if (Number(updated.numUpdatedRows) === 0) return null;
                            return await trx.selectFrom(model).selectAll().where(`${model}.${idField}`, "=", targetId).limit(1).executeTakeFirst() ?? null;
                        };
                        return inTransaction ? incrementInTransaction(db) : db.transaction().execute(incrementInTransaction);
                    }
                    const selectIds = applyWhere(db.selectFrom(model).select(`${model}.${idField}`));
                    const targetIds = config?.type === "mssql" ? selectIds.top(1) : selectIds.limit(1);
                    const updateQuery = applyWhere(db.updateTable(model).set(assignments)).where(`${model}.${idField}`, "in", targetIds);
                    if (config?.type === "mssql") return await updateQuery.outputAll("inserted").executeTakeFirst() ?? null;
                    return await updateQuery.returningAll().executeTakeFirst() ?? null;
                },
                options: config
            };
        };
    };
    let adapterOptions = null;
    adapterOptions = {
        config: {
            adapterId: "kysely",
            adapterName: "Kysely Adapter",
            usePlural: config?.usePlural,
            debugLogs: config?.debugLogs,
            supportsBooleans: config?.type === "sqlite" || config?.type === "mssql" || config?.type === "mysql" || !config?.type ? false : true,
            supportsDates: config?.type === "sqlite" || config?.type === "mssql" || !config?.type ? false : true,
            supportsJSON: config?.type === "postgres" ? true : false,
            supportsArrays: false,
            supportsUUIDs: config?.type === "postgres" ? true : false,
            transaction: config?.transaction ? (cb)=>db.transaction().execute((trx)=>{
                    return cb((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$adapter$2f$factory$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdapterFactory"])({
                        config: {
                            ...adapterOptions.config,
                            transaction: false
                        },
                        adapter: createCustomAdapter(trx, true)
                    })(lazyOptions));
                }) : false
        },
        adapter: createCustomAdapter(db)
    };
    const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$adapter$2f$factory$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdapterFactory"])(adapterOptions);
    return (options)=>{
        lazyOptions = options;
        const instance = adapter(options);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$check$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerSchemaCheck"])(instance, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$check$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSchemaCheck"])(()=>findSchemaProblems(db, config?.type, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$diff$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExpectedSchema"])(options, {
                usePlural: config?.usePlural
            })), "database", options.database), {
            runtimeEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$db$2f$schema$2d$check$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checksSchema"])(options)
        });
        return instance;
    };
};
;
}),
"[project]/node_modules/.pnpm/@opentelemetry+semantic-conventions@1.43.0/node_modules/@opentelemetry/semantic-conventions/build/esm/stable_attributes.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */ //----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/registry/stable/attributes.ts.j2
//----------------------------------------------------------------------------------------------------------
/**
 * ASP.NET Core exception middleware handling result.
 *
 * @example handled
 * @example unhandled
 */ __turbopack_context__.s([
    "ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED",
    ()=>ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED,
    "ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED",
    ()=>ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED,
    "ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED",
    ()=>ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED,
    "ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED",
    ()=>ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED,
    "ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED",
    ()=>ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED,
    "ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER",
    ()=>ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER,
    "ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER",
    ()=>ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER,
    "ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED",
    ()=>ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED,
    "ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE",
    ()=>ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE,
    "ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS",
    ()=>ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS,
    "ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT",
    ()=>ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT,
    "ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE",
    ()=>ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE,
    "ATTR_ASPNETCORE_RATE_LIMITING_POLICY",
    ()=>ATTR_ASPNETCORE_RATE_LIMITING_POLICY,
    "ATTR_ASPNETCORE_RATE_LIMITING_RESULT",
    ()=>ATTR_ASPNETCORE_RATE_LIMITING_RESULT,
    "ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED",
    ()=>ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED,
    "ATTR_ASPNETCORE_ROUTING_IS_FALLBACK",
    ()=>ATTR_ASPNETCORE_ROUTING_IS_FALLBACK,
    "ATTR_ASPNETCORE_ROUTING_MATCH_STATUS",
    ()=>ATTR_ASPNETCORE_ROUTING_MATCH_STATUS,
    "ATTR_ASPNETCORE_USER_IS_AUTHENTICATED",
    ()=>ATTR_ASPNETCORE_USER_IS_AUTHENTICATED,
    "ATTR_CLIENT_ADDRESS",
    ()=>ATTR_CLIENT_ADDRESS,
    "ATTR_CLIENT_PORT",
    ()=>ATTR_CLIENT_PORT,
    "ATTR_CODE_COLUMN_NUMBER",
    ()=>ATTR_CODE_COLUMN_NUMBER,
    "ATTR_CODE_FILE_PATH",
    ()=>ATTR_CODE_FILE_PATH,
    "ATTR_CODE_FUNCTION_NAME",
    ()=>ATTR_CODE_FUNCTION_NAME,
    "ATTR_CODE_LINE_NUMBER",
    ()=>ATTR_CODE_LINE_NUMBER,
    "ATTR_CODE_STACKTRACE",
    ()=>ATTR_CODE_STACKTRACE,
    "ATTR_CONTAINER_ID",
    ()=>ATTR_CONTAINER_ID,
    "ATTR_CONTAINER_IMAGE_NAME",
    ()=>ATTR_CONTAINER_IMAGE_NAME,
    "ATTR_CONTAINER_IMAGE_REPO_DIGESTS",
    ()=>ATTR_CONTAINER_IMAGE_REPO_DIGESTS,
    "ATTR_CONTAINER_IMAGE_TAGS",
    ()=>ATTR_CONTAINER_IMAGE_TAGS,
    "ATTR_DB_COLLECTION_NAME",
    ()=>ATTR_DB_COLLECTION_NAME,
    "ATTR_DB_NAMESPACE",
    ()=>ATTR_DB_NAMESPACE,
    "ATTR_DB_OPERATION_BATCH_SIZE",
    ()=>ATTR_DB_OPERATION_BATCH_SIZE,
    "ATTR_DB_OPERATION_NAME",
    ()=>ATTR_DB_OPERATION_NAME,
    "ATTR_DB_QUERY_SUMMARY",
    ()=>ATTR_DB_QUERY_SUMMARY,
    "ATTR_DB_QUERY_TEXT",
    ()=>ATTR_DB_QUERY_TEXT,
    "ATTR_DB_RESPONSE_STATUS_CODE",
    ()=>ATTR_DB_RESPONSE_STATUS_CODE,
    "ATTR_DB_STORED_PROCEDURE_NAME",
    ()=>ATTR_DB_STORED_PROCEDURE_NAME,
    "ATTR_DB_SYSTEM_NAME",
    ()=>ATTR_DB_SYSTEM_NAME,
    "ATTR_DEPLOYMENT_ENVIRONMENT_NAME",
    ()=>ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
    "ATTR_DOTNET_GC_HEAP_GENERATION",
    ()=>ATTR_DOTNET_GC_HEAP_GENERATION,
    "ATTR_ERROR_TYPE",
    ()=>ATTR_ERROR_TYPE,
    "ATTR_EXCEPTION_ESCAPED",
    ()=>ATTR_EXCEPTION_ESCAPED,
    "ATTR_EXCEPTION_MESSAGE",
    ()=>ATTR_EXCEPTION_MESSAGE,
    "ATTR_EXCEPTION_STACKTRACE",
    ()=>ATTR_EXCEPTION_STACKTRACE,
    "ATTR_EXCEPTION_TYPE",
    ()=>ATTR_EXCEPTION_TYPE,
    "ATTR_HTTP_REQUEST_HEADER",
    ()=>ATTR_HTTP_REQUEST_HEADER,
    "ATTR_HTTP_REQUEST_METHOD",
    ()=>ATTR_HTTP_REQUEST_METHOD,
    "ATTR_HTTP_REQUEST_METHOD_ORIGINAL",
    ()=>ATTR_HTTP_REQUEST_METHOD_ORIGINAL,
    "ATTR_HTTP_REQUEST_RESEND_COUNT",
    ()=>ATTR_HTTP_REQUEST_RESEND_COUNT,
    "ATTR_HTTP_RESPONSE_HEADER",
    ()=>ATTR_HTTP_RESPONSE_HEADER,
    "ATTR_HTTP_RESPONSE_STATUS_CODE",
    ()=>ATTR_HTTP_RESPONSE_STATUS_CODE,
    "ATTR_HTTP_ROUTE",
    ()=>ATTR_HTTP_ROUTE,
    "ATTR_JVM_GC_ACTION",
    ()=>ATTR_JVM_GC_ACTION,
    "ATTR_JVM_GC_NAME",
    ()=>ATTR_JVM_GC_NAME,
    "ATTR_JVM_MEMORY_POOL_NAME",
    ()=>ATTR_JVM_MEMORY_POOL_NAME,
    "ATTR_JVM_MEMORY_TYPE",
    ()=>ATTR_JVM_MEMORY_TYPE,
    "ATTR_JVM_THREAD_DAEMON",
    ()=>ATTR_JVM_THREAD_DAEMON,
    "ATTR_JVM_THREAD_STATE",
    ()=>ATTR_JVM_THREAD_STATE,
    "ATTR_K8S_CLUSTER_NAME",
    ()=>ATTR_K8S_CLUSTER_NAME,
    "ATTR_K8S_CLUSTER_UID",
    ()=>ATTR_K8S_CLUSTER_UID,
    "ATTR_K8S_CONTAINER_NAME",
    ()=>ATTR_K8S_CONTAINER_NAME,
    "ATTR_K8S_CONTAINER_RESTART_COUNT",
    ()=>ATTR_K8S_CONTAINER_RESTART_COUNT,
    "ATTR_K8S_CRONJOB_ANNOTATION",
    ()=>ATTR_K8S_CRONJOB_ANNOTATION,
    "ATTR_K8S_CRONJOB_LABEL",
    ()=>ATTR_K8S_CRONJOB_LABEL,
    "ATTR_K8S_CRONJOB_NAME",
    ()=>ATTR_K8S_CRONJOB_NAME,
    "ATTR_K8S_CRONJOB_UID",
    ()=>ATTR_K8S_CRONJOB_UID,
    "ATTR_K8S_DAEMONSET_ANNOTATION",
    ()=>ATTR_K8S_DAEMONSET_ANNOTATION,
    "ATTR_K8S_DAEMONSET_LABEL",
    ()=>ATTR_K8S_DAEMONSET_LABEL,
    "ATTR_K8S_DAEMONSET_NAME",
    ()=>ATTR_K8S_DAEMONSET_NAME,
    "ATTR_K8S_DAEMONSET_UID",
    ()=>ATTR_K8S_DAEMONSET_UID,
    "ATTR_K8S_DEPLOYMENT_ANNOTATION",
    ()=>ATTR_K8S_DEPLOYMENT_ANNOTATION,
    "ATTR_K8S_DEPLOYMENT_LABEL",
    ()=>ATTR_K8S_DEPLOYMENT_LABEL,
    "ATTR_K8S_DEPLOYMENT_NAME",
    ()=>ATTR_K8S_DEPLOYMENT_NAME,
    "ATTR_K8S_DEPLOYMENT_UID",
    ()=>ATTR_K8S_DEPLOYMENT_UID,
    "ATTR_K8S_JOB_ANNOTATION",
    ()=>ATTR_K8S_JOB_ANNOTATION,
    "ATTR_K8S_JOB_LABEL",
    ()=>ATTR_K8S_JOB_LABEL,
    "ATTR_K8S_JOB_NAME",
    ()=>ATTR_K8S_JOB_NAME,
    "ATTR_K8S_JOB_UID",
    ()=>ATTR_K8S_JOB_UID,
    "ATTR_K8S_NAMESPACE_ANNOTATION",
    ()=>ATTR_K8S_NAMESPACE_ANNOTATION,
    "ATTR_K8S_NAMESPACE_LABEL",
    ()=>ATTR_K8S_NAMESPACE_LABEL,
    "ATTR_K8S_NAMESPACE_NAME",
    ()=>ATTR_K8S_NAMESPACE_NAME,
    "ATTR_K8S_NODE_ANNOTATION",
    ()=>ATTR_K8S_NODE_ANNOTATION,
    "ATTR_K8S_NODE_LABEL",
    ()=>ATTR_K8S_NODE_LABEL,
    "ATTR_K8S_NODE_NAME",
    ()=>ATTR_K8S_NODE_NAME,
    "ATTR_K8S_NODE_UID",
    ()=>ATTR_K8S_NODE_UID,
    "ATTR_K8S_POD_ANNOTATION",
    ()=>ATTR_K8S_POD_ANNOTATION,
    "ATTR_K8S_POD_HOSTNAME",
    ()=>ATTR_K8S_POD_HOSTNAME,
    "ATTR_K8S_POD_IP",
    ()=>ATTR_K8S_POD_IP,
    "ATTR_K8S_POD_LABEL",
    ()=>ATTR_K8S_POD_LABEL,
    "ATTR_K8S_POD_NAME",
    ()=>ATTR_K8S_POD_NAME,
    "ATTR_K8S_POD_START_TIME",
    ()=>ATTR_K8S_POD_START_TIME,
    "ATTR_K8S_POD_UID",
    ()=>ATTR_K8S_POD_UID,
    "ATTR_K8S_REPLICASET_ANNOTATION",
    ()=>ATTR_K8S_REPLICASET_ANNOTATION,
    "ATTR_K8S_REPLICASET_LABEL",
    ()=>ATTR_K8S_REPLICASET_LABEL,
    "ATTR_K8S_REPLICASET_NAME",
    ()=>ATTR_K8S_REPLICASET_NAME,
    "ATTR_K8S_REPLICASET_UID",
    ()=>ATTR_K8S_REPLICASET_UID,
    "ATTR_K8S_STATEFULSET_ANNOTATION",
    ()=>ATTR_K8S_STATEFULSET_ANNOTATION,
    "ATTR_K8S_STATEFULSET_LABEL",
    ()=>ATTR_K8S_STATEFULSET_LABEL,
    "ATTR_K8S_STATEFULSET_NAME",
    ()=>ATTR_K8S_STATEFULSET_NAME,
    "ATTR_K8S_STATEFULSET_UID",
    ()=>ATTR_K8S_STATEFULSET_UID,
    "ATTR_NETWORK_LOCAL_ADDRESS",
    ()=>ATTR_NETWORK_LOCAL_ADDRESS,
    "ATTR_NETWORK_LOCAL_PORT",
    ()=>ATTR_NETWORK_LOCAL_PORT,
    "ATTR_NETWORK_PEER_ADDRESS",
    ()=>ATTR_NETWORK_PEER_ADDRESS,
    "ATTR_NETWORK_PEER_PORT",
    ()=>ATTR_NETWORK_PEER_PORT,
    "ATTR_NETWORK_PROTOCOL_NAME",
    ()=>ATTR_NETWORK_PROTOCOL_NAME,
    "ATTR_NETWORK_PROTOCOL_VERSION",
    ()=>ATTR_NETWORK_PROTOCOL_VERSION,
    "ATTR_NETWORK_TRANSPORT",
    ()=>ATTR_NETWORK_TRANSPORT,
    "ATTR_NETWORK_TYPE",
    ()=>ATTR_NETWORK_TYPE,
    "ATTR_OTEL_EVENT_NAME",
    ()=>ATTR_OTEL_EVENT_NAME,
    "ATTR_OTEL_SCOPE_NAME",
    ()=>ATTR_OTEL_SCOPE_NAME,
    "ATTR_OTEL_SCOPE_VERSION",
    ()=>ATTR_OTEL_SCOPE_VERSION,
    "ATTR_OTEL_STATUS_CODE",
    ()=>ATTR_OTEL_STATUS_CODE,
    "ATTR_OTEL_STATUS_DESCRIPTION",
    ()=>ATTR_OTEL_STATUS_DESCRIPTION,
    "ATTR_SERVER_ADDRESS",
    ()=>ATTR_SERVER_ADDRESS,
    "ATTR_SERVER_PORT",
    ()=>ATTR_SERVER_PORT,
    "ATTR_SERVICE_INSTANCE_ID",
    ()=>ATTR_SERVICE_INSTANCE_ID,
    "ATTR_SERVICE_NAME",
    ()=>ATTR_SERVICE_NAME,
    "ATTR_SERVICE_NAMESPACE",
    ()=>ATTR_SERVICE_NAMESPACE,
    "ATTR_SERVICE_VERSION",
    ()=>ATTR_SERVICE_VERSION,
    "ATTR_SIGNALR_CONNECTION_STATUS",
    ()=>ATTR_SIGNALR_CONNECTION_STATUS,
    "ATTR_SIGNALR_TRANSPORT",
    ()=>ATTR_SIGNALR_TRANSPORT,
    "ATTR_TELEMETRY_DISTRO_NAME",
    ()=>ATTR_TELEMETRY_DISTRO_NAME,
    "ATTR_TELEMETRY_DISTRO_VERSION",
    ()=>ATTR_TELEMETRY_DISTRO_VERSION,
    "ATTR_TELEMETRY_SDK_LANGUAGE",
    ()=>ATTR_TELEMETRY_SDK_LANGUAGE,
    "ATTR_TELEMETRY_SDK_NAME",
    ()=>ATTR_TELEMETRY_SDK_NAME,
    "ATTR_TELEMETRY_SDK_VERSION",
    ()=>ATTR_TELEMETRY_SDK_VERSION,
    "ATTR_URL_FRAGMENT",
    ()=>ATTR_URL_FRAGMENT,
    "ATTR_URL_FULL",
    ()=>ATTR_URL_FULL,
    "ATTR_URL_PATH",
    ()=>ATTR_URL_PATH,
    "ATTR_URL_QUERY",
    ()=>ATTR_URL_QUERY,
    "ATTR_URL_SCHEME",
    ()=>ATTR_URL_SCHEME,
    "ATTR_USER_AGENT_ORIGINAL",
    ()=>ATTR_USER_AGENT_ORIGINAL,
    "DB_SYSTEM_NAME_VALUE_MARIADB",
    ()=>DB_SYSTEM_NAME_VALUE_MARIADB,
    "DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER",
    ()=>DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER,
    "DB_SYSTEM_NAME_VALUE_MYSQL",
    ()=>DB_SYSTEM_NAME_VALUE_MYSQL,
    "DB_SYSTEM_NAME_VALUE_POSTGRESQL",
    ()=>DB_SYSTEM_NAME_VALUE_POSTGRESQL,
    "DEPLOYMENT_ENVIRONMENT_NAME_VALUE_DEVELOPMENT",
    ()=>DEPLOYMENT_ENVIRONMENT_NAME_VALUE_DEVELOPMENT,
    "DEPLOYMENT_ENVIRONMENT_NAME_VALUE_PRODUCTION",
    ()=>DEPLOYMENT_ENVIRONMENT_NAME_VALUE_PRODUCTION,
    "DEPLOYMENT_ENVIRONMENT_NAME_VALUE_STAGING",
    ()=>DEPLOYMENT_ENVIRONMENT_NAME_VALUE_STAGING,
    "DEPLOYMENT_ENVIRONMENT_NAME_VALUE_TEST",
    ()=>DEPLOYMENT_ENVIRONMENT_NAME_VALUE_TEST,
    "DOTNET_GC_HEAP_GENERATION_VALUE_GEN0",
    ()=>DOTNET_GC_HEAP_GENERATION_VALUE_GEN0,
    "DOTNET_GC_HEAP_GENERATION_VALUE_GEN1",
    ()=>DOTNET_GC_HEAP_GENERATION_VALUE_GEN1,
    "DOTNET_GC_HEAP_GENERATION_VALUE_GEN2",
    ()=>DOTNET_GC_HEAP_GENERATION_VALUE_GEN2,
    "DOTNET_GC_HEAP_GENERATION_VALUE_LOH",
    ()=>DOTNET_GC_HEAP_GENERATION_VALUE_LOH,
    "DOTNET_GC_HEAP_GENERATION_VALUE_POH",
    ()=>DOTNET_GC_HEAP_GENERATION_VALUE_POH,
    "ERROR_TYPE_VALUE_OTHER",
    ()=>ERROR_TYPE_VALUE_OTHER,
    "HTTP_REQUEST_METHOD_VALUE_CONNECT",
    ()=>HTTP_REQUEST_METHOD_VALUE_CONNECT,
    "HTTP_REQUEST_METHOD_VALUE_DELETE",
    ()=>HTTP_REQUEST_METHOD_VALUE_DELETE,
    "HTTP_REQUEST_METHOD_VALUE_GET",
    ()=>HTTP_REQUEST_METHOD_VALUE_GET,
    "HTTP_REQUEST_METHOD_VALUE_HEAD",
    ()=>HTTP_REQUEST_METHOD_VALUE_HEAD,
    "HTTP_REQUEST_METHOD_VALUE_OPTIONS",
    ()=>HTTP_REQUEST_METHOD_VALUE_OPTIONS,
    "HTTP_REQUEST_METHOD_VALUE_OTHER",
    ()=>HTTP_REQUEST_METHOD_VALUE_OTHER,
    "HTTP_REQUEST_METHOD_VALUE_PATCH",
    ()=>HTTP_REQUEST_METHOD_VALUE_PATCH,
    "HTTP_REQUEST_METHOD_VALUE_POST",
    ()=>HTTP_REQUEST_METHOD_VALUE_POST,
    "HTTP_REQUEST_METHOD_VALUE_PUT",
    ()=>HTTP_REQUEST_METHOD_VALUE_PUT,
    "HTTP_REQUEST_METHOD_VALUE_TRACE",
    ()=>HTTP_REQUEST_METHOD_VALUE_TRACE,
    "JVM_MEMORY_TYPE_VALUE_HEAP",
    ()=>JVM_MEMORY_TYPE_VALUE_HEAP,
    "JVM_MEMORY_TYPE_VALUE_NON_HEAP",
    ()=>JVM_MEMORY_TYPE_VALUE_NON_HEAP,
    "JVM_THREAD_STATE_VALUE_BLOCKED",
    ()=>JVM_THREAD_STATE_VALUE_BLOCKED,
    "JVM_THREAD_STATE_VALUE_NEW",
    ()=>JVM_THREAD_STATE_VALUE_NEW,
    "JVM_THREAD_STATE_VALUE_RUNNABLE",
    ()=>JVM_THREAD_STATE_VALUE_RUNNABLE,
    "JVM_THREAD_STATE_VALUE_TERMINATED",
    ()=>JVM_THREAD_STATE_VALUE_TERMINATED,
    "JVM_THREAD_STATE_VALUE_TIMED_WAITING",
    ()=>JVM_THREAD_STATE_VALUE_TIMED_WAITING,
    "JVM_THREAD_STATE_VALUE_WAITING",
    ()=>JVM_THREAD_STATE_VALUE_WAITING,
    "NETWORK_TRANSPORT_VALUE_PIPE",
    ()=>NETWORK_TRANSPORT_VALUE_PIPE,
    "NETWORK_TRANSPORT_VALUE_QUIC",
    ()=>NETWORK_TRANSPORT_VALUE_QUIC,
    "NETWORK_TRANSPORT_VALUE_TCP",
    ()=>NETWORK_TRANSPORT_VALUE_TCP,
    "NETWORK_TRANSPORT_VALUE_UDP",
    ()=>NETWORK_TRANSPORT_VALUE_UDP,
    "NETWORK_TRANSPORT_VALUE_UNIX",
    ()=>NETWORK_TRANSPORT_VALUE_UNIX,
    "NETWORK_TYPE_VALUE_IPV4",
    ()=>NETWORK_TYPE_VALUE_IPV4,
    "NETWORK_TYPE_VALUE_IPV6",
    ()=>NETWORK_TYPE_VALUE_IPV6,
    "OTEL_STATUS_CODE_VALUE_ERROR",
    ()=>OTEL_STATUS_CODE_VALUE_ERROR,
    "OTEL_STATUS_CODE_VALUE_OK",
    ()=>OTEL_STATUS_CODE_VALUE_OK,
    "SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN",
    ()=>SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN,
    "SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE",
    ()=>SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE,
    "SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT",
    ()=>SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT,
    "SIGNALR_TRANSPORT_VALUE_LONG_POLLING",
    ()=>SIGNALR_TRANSPORT_VALUE_LONG_POLLING,
    "SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS",
    ()=>SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS,
    "SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS",
    ()=>SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS,
    "TELEMETRY_SDK_LANGUAGE_VALUE_CPP",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_CPP,
    "TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET,
    "TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG,
    "TELEMETRY_SDK_LANGUAGE_VALUE_GO",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_GO,
    "TELEMETRY_SDK_LANGUAGE_VALUE_JAVA",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_JAVA,
    "TELEMETRY_SDK_LANGUAGE_VALUE_KOTLIN",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_KOTLIN,
    "TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS,
    "TELEMETRY_SDK_LANGUAGE_VALUE_PHP",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_PHP,
    "TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON,
    "TELEMETRY_SDK_LANGUAGE_VALUE_RUBY",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_RUBY,
    "TELEMETRY_SDK_LANGUAGE_VALUE_RUST",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_RUST,
    "TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT,
    "TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS",
    ()=>TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS
]);
const ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = 'aspnetcore.diagnostics.exception.result';
const ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = "aborted";
const ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = "handled";
const ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = "skipped";
const ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = "unhandled";
const ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = 'aspnetcore.diagnostics.handler.type';
const ATTR_ASPNETCORE_RATE_LIMITING_POLICY = 'aspnetcore.rate_limiting.policy';
const ATTR_ASPNETCORE_RATE_LIMITING_RESULT = 'aspnetcore.rate_limiting.result';
const ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = "acquired";
const ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = "endpoint_limiter";
const ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = "global_limiter";
const ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = "request_canceled";
const ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = 'aspnetcore.request.is_unhandled';
const ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = 'aspnetcore.routing.is_fallback';
const ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = 'aspnetcore.routing.match_status';
const ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = "failure";
const ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = "success";
const ATTR_ASPNETCORE_USER_IS_AUTHENTICATED = 'aspnetcore.user.is_authenticated';
const ATTR_CLIENT_ADDRESS = 'client.address';
const ATTR_CLIENT_PORT = 'client.port';
const ATTR_CODE_COLUMN_NUMBER = 'code.column.number';
const ATTR_CODE_FILE_PATH = 'code.file.path';
const ATTR_CODE_FUNCTION_NAME = 'code.function.name';
const ATTR_CODE_LINE_NUMBER = 'code.line.number';
const ATTR_CODE_STACKTRACE = 'code.stacktrace';
const ATTR_CONTAINER_ID = 'container.id';
const ATTR_CONTAINER_IMAGE_NAME = 'container.image.name';
const ATTR_CONTAINER_IMAGE_REPO_DIGESTS = 'container.image.repo_digests';
const ATTR_CONTAINER_IMAGE_TAGS = 'container.image.tags';
const ATTR_DB_COLLECTION_NAME = 'db.collection.name';
const ATTR_DB_NAMESPACE = 'db.namespace';
const ATTR_DB_OPERATION_BATCH_SIZE = 'db.operation.batch.size';
const ATTR_DB_OPERATION_NAME = 'db.operation.name';
const ATTR_DB_QUERY_SUMMARY = 'db.query.summary';
const ATTR_DB_QUERY_TEXT = 'db.query.text';
const ATTR_DB_RESPONSE_STATUS_CODE = 'db.response.status_code';
const ATTR_DB_STORED_PROCEDURE_NAME = 'db.stored_procedure.name';
const ATTR_DB_SYSTEM_NAME = 'db.system.name';
const DB_SYSTEM_NAME_VALUE_MARIADB = "mariadb";
const DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER = "microsoft.sql_server";
const DB_SYSTEM_NAME_VALUE_MYSQL = "mysql";
const DB_SYSTEM_NAME_VALUE_POSTGRESQL = "postgresql";
const ATTR_DEPLOYMENT_ENVIRONMENT_NAME = 'deployment.environment.name';
const DEPLOYMENT_ENVIRONMENT_NAME_VALUE_DEVELOPMENT = "development";
const DEPLOYMENT_ENVIRONMENT_NAME_VALUE_PRODUCTION = "production";
const DEPLOYMENT_ENVIRONMENT_NAME_VALUE_STAGING = "staging";
const DEPLOYMENT_ENVIRONMENT_NAME_VALUE_TEST = "test";
const ATTR_DOTNET_GC_HEAP_GENERATION = 'dotnet.gc.heap.generation';
const DOTNET_GC_HEAP_GENERATION_VALUE_GEN0 = "gen0";
const DOTNET_GC_HEAP_GENERATION_VALUE_GEN1 = "gen1";
const DOTNET_GC_HEAP_GENERATION_VALUE_GEN2 = "gen2";
const DOTNET_GC_HEAP_GENERATION_VALUE_LOH = "loh";
const DOTNET_GC_HEAP_GENERATION_VALUE_POH = "poh";
const ATTR_ERROR_TYPE = 'error.type';
const ERROR_TYPE_VALUE_OTHER = "_OTHER";
const ATTR_EXCEPTION_ESCAPED = 'exception.escaped';
const ATTR_EXCEPTION_MESSAGE = 'exception.message';
const ATTR_EXCEPTION_STACKTRACE = 'exception.stacktrace';
const ATTR_EXCEPTION_TYPE = 'exception.type';
const ATTR_HTTP_REQUEST_HEADER = (key)=>`http.request.header.${key}`;
const ATTR_HTTP_REQUEST_METHOD = 'http.request.method';
const HTTP_REQUEST_METHOD_VALUE_OTHER = "_OTHER";
const HTTP_REQUEST_METHOD_VALUE_CONNECT = "CONNECT";
const HTTP_REQUEST_METHOD_VALUE_DELETE = "DELETE";
const HTTP_REQUEST_METHOD_VALUE_GET = "GET";
const HTTP_REQUEST_METHOD_VALUE_HEAD = "HEAD";
const HTTP_REQUEST_METHOD_VALUE_OPTIONS = "OPTIONS";
const HTTP_REQUEST_METHOD_VALUE_PATCH = "PATCH";
const HTTP_REQUEST_METHOD_VALUE_POST = "POST";
const HTTP_REQUEST_METHOD_VALUE_PUT = "PUT";
const HTTP_REQUEST_METHOD_VALUE_TRACE = "TRACE";
const ATTR_HTTP_REQUEST_METHOD_ORIGINAL = 'http.request.method_original';
const ATTR_HTTP_REQUEST_RESEND_COUNT = 'http.request.resend_count';
const ATTR_HTTP_RESPONSE_HEADER = (key)=>`http.response.header.${key}`;
const ATTR_HTTP_RESPONSE_STATUS_CODE = 'http.response.status_code';
const ATTR_HTTP_ROUTE = 'http.route';
const ATTR_JVM_GC_ACTION = 'jvm.gc.action';
const ATTR_JVM_GC_NAME = 'jvm.gc.name';
const ATTR_JVM_MEMORY_POOL_NAME = 'jvm.memory.pool.name';
const ATTR_JVM_MEMORY_TYPE = 'jvm.memory.type';
const JVM_MEMORY_TYPE_VALUE_HEAP = "heap";
const JVM_MEMORY_TYPE_VALUE_NON_HEAP = "non_heap";
const ATTR_JVM_THREAD_DAEMON = 'jvm.thread.daemon';
const ATTR_JVM_THREAD_STATE = 'jvm.thread.state';
const JVM_THREAD_STATE_VALUE_BLOCKED = "blocked";
const JVM_THREAD_STATE_VALUE_NEW = "new";
const JVM_THREAD_STATE_VALUE_RUNNABLE = "runnable";
const JVM_THREAD_STATE_VALUE_TERMINATED = "terminated";
const JVM_THREAD_STATE_VALUE_TIMED_WAITING = "timed_waiting";
const JVM_THREAD_STATE_VALUE_WAITING = "waiting";
const ATTR_K8S_CLUSTER_NAME = 'k8s.cluster.name';
const ATTR_K8S_CLUSTER_UID = 'k8s.cluster.uid';
const ATTR_K8S_CONTAINER_NAME = 'k8s.container.name';
const ATTR_K8S_CONTAINER_RESTART_COUNT = 'k8s.container.restart_count';
const ATTR_K8S_CRONJOB_ANNOTATION = (key)=>`k8s.cronjob.annotation.${key}`;
const ATTR_K8S_CRONJOB_LABEL = (key)=>`k8s.cronjob.label.${key}`;
const ATTR_K8S_CRONJOB_NAME = 'k8s.cronjob.name';
const ATTR_K8S_CRONJOB_UID = 'k8s.cronjob.uid';
const ATTR_K8S_DAEMONSET_ANNOTATION = (key)=>`k8s.daemonset.annotation.${key}`;
const ATTR_K8S_DAEMONSET_LABEL = (key)=>`k8s.daemonset.label.${key}`;
const ATTR_K8S_DAEMONSET_NAME = 'k8s.daemonset.name';
const ATTR_K8S_DAEMONSET_UID = 'k8s.daemonset.uid';
const ATTR_K8S_DEPLOYMENT_ANNOTATION = (key)=>`k8s.deployment.annotation.${key}`;
const ATTR_K8S_DEPLOYMENT_LABEL = (key)=>`k8s.deployment.label.${key}`;
const ATTR_K8S_DEPLOYMENT_NAME = 'k8s.deployment.name';
const ATTR_K8S_DEPLOYMENT_UID = 'k8s.deployment.uid';
const ATTR_K8S_JOB_ANNOTATION = (key)=>`k8s.job.annotation.${key}`;
const ATTR_K8S_JOB_LABEL = (key)=>`k8s.job.label.${key}`;
const ATTR_K8S_JOB_NAME = 'k8s.job.name';
const ATTR_K8S_JOB_UID = 'k8s.job.uid';
const ATTR_K8S_NAMESPACE_ANNOTATION = (key)=>`k8s.namespace.annotation.${key}`;
const ATTR_K8S_NAMESPACE_LABEL = (key)=>`k8s.namespace.label.${key}`;
const ATTR_K8S_NAMESPACE_NAME = 'k8s.namespace.name';
const ATTR_K8S_NODE_ANNOTATION = (key)=>`k8s.node.annotation.${key}`;
const ATTR_K8S_NODE_LABEL = (key)=>`k8s.node.label.${key}`;
const ATTR_K8S_NODE_NAME = 'k8s.node.name';
const ATTR_K8S_NODE_UID = 'k8s.node.uid';
const ATTR_K8S_POD_ANNOTATION = (key)=>`k8s.pod.annotation.${key}`;
const ATTR_K8S_POD_HOSTNAME = 'k8s.pod.hostname';
const ATTR_K8S_POD_IP = 'k8s.pod.ip';
const ATTR_K8S_POD_LABEL = (key)=>`k8s.pod.label.${key}`;
const ATTR_K8S_POD_NAME = 'k8s.pod.name';
const ATTR_K8S_POD_START_TIME = 'k8s.pod.start_time';
const ATTR_K8S_POD_UID = 'k8s.pod.uid';
const ATTR_K8S_REPLICASET_ANNOTATION = (key)=>`k8s.replicaset.annotation.${key}`;
const ATTR_K8S_REPLICASET_LABEL = (key)=>`k8s.replicaset.label.${key}`;
const ATTR_K8S_REPLICASET_NAME = 'k8s.replicaset.name';
const ATTR_K8S_REPLICASET_UID = 'k8s.replicaset.uid';
const ATTR_K8S_STATEFULSET_ANNOTATION = (key)=>`k8s.statefulset.annotation.${key}`;
const ATTR_K8S_STATEFULSET_LABEL = (key)=>`k8s.statefulset.label.${key}`;
const ATTR_K8S_STATEFULSET_NAME = 'k8s.statefulset.name';
const ATTR_K8S_STATEFULSET_UID = 'k8s.statefulset.uid';
const ATTR_NETWORK_LOCAL_ADDRESS = 'network.local.address';
const ATTR_NETWORK_LOCAL_PORT = 'network.local.port';
const ATTR_NETWORK_PEER_ADDRESS = 'network.peer.address';
const ATTR_NETWORK_PEER_PORT = 'network.peer.port';
const ATTR_NETWORK_PROTOCOL_NAME = 'network.protocol.name';
const ATTR_NETWORK_PROTOCOL_VERSION = 'network.protocol.version';
const ATTR_NETWORK_TRANSPORT = 'network.transport';
const NETWORK_TRANSPORT_VALUE_PIPE = "pipe";
const NETWORK_TRANSPORT_VALUE_QUIC = "quic";
const NETWORK_TRANSPORT_VALUE_TCP = "tcp";
const NETWORK_TRANSPORT_VALUE_UDP = "udp";
const NETWORK_TRANSPORT_VALUE_UNIX = "unix";
const ATTR_NETWORK_TYPE = 'network.type';
const NETWORK_TYPE_VALUE_IPV4 = "ipv4";
const NETWORK_TYPE_VALUE_IPV6 = "ipv6";
const ATTR_OTEL_EVENT_NAME = 'otel.event.name';
const ATTR_OTEL_SCOPE_NAME = 'otel.scope.name';
const ATTR_OTEL_SCOPE_VERSION = 'otel.scope.version';
const ATTR_OTEL_STATUS_CODE = 'otel.status_code';
const OTEL_STATUS_CODE_VALUE_ERROR = "ERROR";
const OTEL_STATUS_CODE_VALUE_OK = "OK";
const ATTR_OTEL_STATUS_DESCRIPTION = 'otel.status_description';
const ATTR_SERVER_ADDRESS = 'server.address';
const ATTR_SERVER_PORT = 'server.port';
const ATTR_SERVICE_INSTANCE_ID = 'service.instance.id';
const ATTR_SERVICE_NAME = 'service.name';
const ATTR_SERVICE_NAMESPACE = 'service.namespace';
const ATTR_SERVICE_VERSION = 'service.version';
const ATTR_SIGNALR_CONNECTION_STATUS = 'signalr.connection.status';
const SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = "app_shutdown";
const SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = "normal_closure";
const SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = "timeout";
const ATTR_SIGNALR_TRANSPORT = 'signalr.transport';
const SIGNALR_TRANSPORT_VALUE_LONG_POLLING = "long_polling";
const SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = "server_sent_events";
const SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = "web_sockets";
const ATTR_TELEMETRY_DISTRO_NAME = 'telemetry.distro.name';
const ATTR_TELEMETRY_DISTRO_VERSION = 'telemetry.distro.version';
const ATTR_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
const TELEMETRY_SDK_LANGUAGE_VALUE_CPP = "cpp";
const TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = "dotnet";
const TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = "erlang";
const TELEMETRY_SDK_LANGUAGE_VALUE_GO = "go";
const TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = "java";
const TELEMETRY_SDK_LANGUAGE_VALUE_KOTLIN = "kotlin";
const TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = "nodejs";
const TELEMETRY_SDK_LANGUAGE_VALUE_PHP = "php";
const TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = "python";
const TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = "ruby";
const TELEMETRY_SDK_LANGUAGE_VALUE_RUST = "rust";
const TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = "swift";
const TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
const ATTR_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
const ATTR_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';
const ATTR_URL_FRAGMENT = 'url.fragment';
const ATTR_URL_FULL = 'url.full';
const ATTR_URL_PATH = 'url.path';
const ATTR_URL_QUERY = 'url.query';
const ATTR_URL_SCHEME = 'url.scheme';
const ATTR_USER_AGENT_ORIGINAL = 'user_agent.original';
}),
"[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Checks if something is Uint8Array. Be careful: nodejs Buffer will return true.
 * @param a - value to test
 * @returns `true` when the value is a Uint8Array-compatible view.
 * @example
 * Check whether a value is a Uint8Array-compatible view.
 * ```ts
 * isBytes(new Uint8Array([1, 2, 3]));
 * ```
 */ __turbopack_context__.s([
    "abool",
    ()=>abool,
    "abytes",
    ()=>abytes,
    "aexists",
    ()=>aexists,
    "ahash",
    ()=>ahash,
    "anumber",
    ()=>anumber,
    "aoutput",
    ()=>aoutput,
    "asyncLoop",
    ()=>asyncLoop,
    "byteSwap",
    ()=>byteSwap,
    "byteSwap32",
    ()=>byteSwap32,
    "bytesToHex",
    ()=>bytesToHex,
    "checkOpts",
    ()=>checkOpts,
    "clean",
    ()=>clean,
    "concatBytes",
    ()=>concatBytes,
    "copyBytes",
    ()=>copyBytes,
    "createHasher",
    ()=>createHasher,
    "createView",
    ()=>createView,
    "hexToBytes",
    ()=>hexToBytes,
    "isBytes",
    ()=>isBytes,
    "isLE",
    ()=>isLE,
    "kdfInputToBytes",
    ()=>kdfInputToBytes,
    "nextTick",
    ()=>nextTick,
    "oidNist",
    ()=>oidNist,
    "randomBytes",
    ()=>randomBytes,
    "rotl",
    ()=>rotl,
    "rotr",
    ()=>rotr,
    "swap32IfBE",
    ()=>swap32IfBE,
    "swap8IfBE",
    ()=>swap8IfBE,
    "u32",
    ()=>u32,
    "u8",
    ()=>u8,
    "utf8ToBytes",
    ()=>utf8ToBytes,
    "validateObject",
    ()=>validateObject
]);
function isBytes(a) {
    // Plain `instanceof Uint8Array` is too strict for some Buffer / proxy / cross-realm cases.
    // The fallback still requires a real ArrayBuffer view, so plain
    // JSON-deserialized `{ constructor: ... }` spoofing is rejected, and
    // `BYTES_PER_ELEMENT === 1` keeps the fallback on byte-oriented views.
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array' && 'BYTES_PER_ELEMENT' in a && a.BYTES_PER_ELEMENT === 1;
}
// Shared error-message prefix builder. Only called on throw paths, so assert
// success paths never pay for the string concatenation.
const atitle = (title)=>title ? `"${title}" ` : '';
function anumber(n, title = '') {
    if (typeof n !== 'number') throw new TypeError(atitle(title) + 'expected number, got ' + typeof n);
    if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(atitle(title) + 'expected integer >= 0, got ' + n);
    return n;
}
function abool(value, title = '') {
    if (typeof value !== 'boolean') throw new TypeError(atitle(title) + 'expected boolean, got type=' + typeof value);
    return value;
}
function abytes(value, length, title = '') {
    // Success path first: this runs at the start of every update() / digestInto(), and the
    // common `abytes(data)` form must not pay for length handling it does not use.
    if (isBytes(value) && (length === undefined || value.length === length)) return value;
    // Error path: recompute freely to build the exact message.
    if (length !== undefined) anumber(length, 'length');
    const bytes = isBytes(value);
    const ofLen = length !== undefined ? ` of length ${length}` : '';
    const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
    const message = atitle(title) + 'expected Uint8Array' + ofLen + ', got ' + got;
    if (!bytes) throw new TypeError(message);
    throw new RangeError(message);
}
function copyBytes(bytes) {
    // `Uint8Array.from(...)` would also accept arrays / other typed arrays. Keep this helper strict
    // because callers use it at byte-validation boundaries before mutating the detached copy.
    return Uint8Array.from(abytes(bytes));
}
function ahash(h) {
    if (typeof h !== 'function' || typeof h.create !== 'function') throw new TypeError('expected hash wrapped by utils.createHasher');
    anumber(h.outputLen);
    anumber(h.blockLen);
    // HMAC and KDF callers treat these as real byte lengths; allowing zero lets fake wrappers pass
    // validation and can produce empty outputs instead of failing fast.
    if (h.outputLen < 1 || h.blockLen < 1) throw new Error('hash blockLen / outputLen must be >= 1');
}
const aobject = (value, label)=>{
    if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError((label === 'object' ? '' : `"${label}" `) + 'expected object, got type=' + typeof value);
};
const aopts = (value, label)=>{
    aobject(value, label);
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) throw new TypeError(`"${label}" expected plain object`);
    // Object.assign() treats an own "__proto__" source key as a write to the target's legacy
    // prototype setter. Reject it before merging so inherited option values cannot be injected.
    if (Object.hasOwn(value, '__proto__')) throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists(instance, checkFinished = true) {
    // Runs on every update()/digestInto(); the flags are library-owned booleans, so only their
    // truthiness is checked - re-validating their type per call was pure hot-path overhead.
    if (instance.destroyed) throw new Error('hash was destroyed');
    if (checkFinished && instance.finished) throw new Error('digest() was already called');
}
function aoutput(out, instance) {
    abytes(out, undefined, 'output');
    // `outputLen` is a library-owned readonly number; the negated comparison keeps failing fast
    // when it is missing/NaN (comparisons with undefined/NaN are false) without an anumber() call.
    const min = instance.outputLen;
    if (!(out.length >= min)) {
        throw new RangeError('"output" expected length >= ' + min);
    }
}
function u8(arr) {
    return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
}
function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
    for(let i = 0; i < arrays.length; i++){
        arrays[i].fill(0);
    }
}
function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
}
function rotl(word, shift) {
    return word << shift | word >>> 32 - shift >>> 0;
}
const isLE = /* @__PURE__ */ (()=>new Uint8Array(new Uint32Array([
        0x11223344
    ]).buffer)[0] === 0x44)();
function byteSwap(word) {
    return word << 24 & 0xff000000 | word << 8 & 0xff0000 | word >>> 8 & 0xff00 | word >>> 24 & 0xff;
}
const swap8IfBE = isLE ? (n)=>n : (n)=>byteSwap(n) >>> 0;
function byteSwap32(arr) {
    for(let i = 0; i < arr.length; i++){
        arr[i] = byteSwap(arr[i]);
    }
    return arr;
}
const swap32IfBE = isLE ? (u)=>u : byteSwap32;
// Built-in hex conversion https://caniuse.com/mdn-javascript_builtins_uint8array_fromhex
const hasHexBuiltin = /* @__PURE__ */ (()=>// @ts-ignore
    typeof Uint8Array.from([]).toHex === 'function' && typeof Uint8Array.fromHex === 'function')();
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({
    length: 256
}, (_, i)=>i.toString(16).padStart(2, '0'));
function bytesToHex(bytes) {
    abytes(bytes);
    // @ts-ignore
    if (hasHexBuiltin) return bytes.toHex();
    // pre-caching improves the speed 6x
    let hex = '';
    for(let i = 0; i < bytes.length; i++){
        hex += hexes[bytes[i]];
    }
    return hex;
}
// Strict ASCII nibble parser: non-ASCII hex lookalikes are rejected as undefined.
// ASCII codes: '0'..'9' = 48..57, 'A'..'F' = 65..70, 'a'..'f' = 97..102.
// prettier-ignore
function asciiToBase16(ch) {
    return ch >= 48 && ch <= 57 ? ch - 48 // '2' => 50-48
     : ch >= 65 && ch <= 70 ? ch - (65 - 10) // 'B' => 66-(65-10)
     : ch >= 97 && ch <= 102 ? ch - (97 - 10) // 'b' => 98-(97-10)
     : undefined;
}
function hexToBytes(hex) {
    if (typeof hex !== 'string') throw new TypeError('hex string expected, got ' + typeof hex);
    if (hasHexBuiltin) {
        try {
            return Uint8Array.fromHex(hex);
        } catch (error) {
            if (error instanceof SyntaxError) throw new RangeError(error.message);
            throw error;
        }
    }
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2) throw new RangeError('hex string expected, got unpadded hex of length ' + hl);
    const array = new Uint8Array(al);
    for(let ai = 0, hi = 0; ai < al; ai++, hi += 2){
        const n1 = asciiToBase16(hex.charCodeAt(hi)); // parse first char, multiply it by 16
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1)); // parse second char
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // example: 'A9' => 10*16 + 9
    }
    return array;
}
function nextTick(onReject) {
    const host = globalThis;
    if (typeof host.scheduler?.yield === 'function') {
        const promise = host.scheduler.yield();
        // Keep the original scheduler rejection; this handler exists only for cleanup.
        if (onReject) promise.catch(onReject);
        return promise;
    }
    return new Promise((resolve)=>host.setTimeout(resolve, 0));
}
async function asyncLoop(iters, tick, cb, onReject) {
    anumber(iters, 'iters');
    anumber(tick, 'tick');
    if (typeof cb !== 'function') throw new TypeError('callback must be a function');
    // Callback is synchronous by contract; asyncLoop only yields between sync work windows.
    let ts = Date.now();
    for(let i = 0; i < iters; i++){
        cb(i);
        // Date.now() is not monotonic, so in case if clock goes backwards we return return control too
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick) continue;
        await nextTick(onReject);
        // Track only synchronous work time; scheduler delay after yielding is outside our budget.
        ts = Date.now();
    }
}
function utf8ToBytes(str) {
    if (typeof str !== 'string') throw new TypeError('string expected');
    const encoded = new TextEncoder().encode(str);
    try {
        // Copy into the current realm for Firefox extension contexts. Callers that own the returned
        // buffer can then wipe it independently of TextEncoder's temporary result.
        return new Uint8Array(encoded); // https://bugzil.la/1681809
    } finally{
        clean(encoded);
    }
}
function kdfInputToBytes(data, errorTitle = '') {
    if (typeof data === 'string') return utf8ToBytes(data);
    return abytes(data, undefined, errorTitle);
}
function concatBytes(...arrays) {
    let sum = 0;
    for(let i = 0; i < arrays.length; i++){
        const a = arrays[i];
        abytes(a);
        sum += a.length;
    }
    const res = new Uint8Array(sum);
    for(let i = 0, pad = 0; i < arrays.length; i++){
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
    }
    return res;
}
const validateObject = (object, fields = {}, optFields = {}, title = 'object')=>{
    aobject(object, title);
    aobject(fields, 'fields');
    aobject(optFields, 'optFields');
    function checkField(fieldName, expectedType, isOpt) {
        const label = title === 'object' ? `param "${String(fieldName)}"` : `"${title}.${String(fieldName)}"`;
        // Config fields must be explicit own properties. Optional inherited values are rejected too
        // because callers keep reading the same options object after validation.
        const val = object[fieldName];
        // Runtime objects such as Field instances intentionally satisfy required method slots
        // via their shared prototype.
        if (!Object.hasOwn(object, fieldName) && (isOpt ? val !== undefined : expectedType !== 'function')) {
            throw new TypeError(`${label} is invalid: expected own property`);
        }
        if (isOpt && val === undefined) return;
        const current = typeof val;
        if (current !== expectedType || val === null) throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
    }
    const iter = (f, isOpt)=>Object.entries(f).forEach(([k, v])=>checkField(k, v, isOpt));
    iter(fields, false);
    iter(optFields, true);
};
function checkOpts(defaults, opts, title = 'opts') {
    aopts(defaults, 'defaults');
    if (opts !== undefined) aopts(opts, title);
    // Callers read optional fields directly, so omitted values must not fall through to ambient
    // Object.prototype pollution (for example a forged `dkLen` changing SHAKE's default output).
    const merged = Object.assign(Object.create(null), defaults, opts);
    return merged;
}
function createHasher(hashCons, info = {}) {
    if (typeof hashCons !== 'function') throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
    info = checkOpts({}, info, 'info');
    const hashC = (msg, opts)=>hashCons(opts).update(msg).digest();
    const tmp = hashCons(undefined);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.canXOF = tmp.canXOF;
    hashC.create = (opts)=>hashCons(opts);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
    // Match the repo's other length-taking helpers instead of relying on Uint8Array coercion.
    anumber(bytesLength, 'bytesLength');
    const cr = typeof globalThis === 'object' ? globalThis.crypto : null;
    if (typeof cr?.getRandomValues !== 'function') throw new Error('crypto.getRandomValues must be defined');
    // Web Cryptography API Level 2 §10.1.1:
    // if `byteLength > 65536`, throw `QuotaExceededError`.
    // Keep the guard explicit so callers can see the quota in code
    // instead of discovering it by reading the spec or host errors.
    // This wrapper surfaces the same quota as a stable library RangeError.
    if (bytesLength > 65536) throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
    return cr.getRandomValues(new Uint8Array(bytesLength));
}
const oidNist = (suffix)=>({
        // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
        // Larger suffix values would need base-128 OID encoding and a different length byte.
        oid: Uint8Array.from([
            0x06,
            0x09,
            0x60,
            0x86,
            0x48,
            0x01,
            0x65,
            0x03,
            0x04,
            0x02,
            suffix
        ])
    });
}),
"[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/hmac.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_HMAC",
    ()=>_HMAC,
    "hmac",
    ()=>hmac
]);
/**
 * HMAC: RFC2104 message authentication code.
 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/utils.js [app-route] (ecmascript)");
;
class _HMAC {
    oHash;
    iHash;
    blockLen;
    outputLen;
    canXOF = false;
    finished = false;
    destroyed = false;
    constructor(hash, key){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ahash"])(hash);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(key, undefined, 'key');
        this.iHash = hash.create();
        if (typeof this.iHash.update !== 'function') throw new Error('expected Hash instance');
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        // blockLen can be bigger than outputLen
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for(let i = 0; i < pad.length; i++)pad[i] ^= 0x36;
        this.iHash.update(pad);
        // By doing update (processing of the first block) of the outer hash here,
        // we can re-use it between multiple calls via clone.
        this.oHash = hash.create();
        // Undo internal XOR && apply outer XOR
        for(let i = 0; i < pad.length; i++)pad[i] ^= 0x36 ^ 0x5c;
        this.oHash.update(pad);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(pad);
    }
    update(buf) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aexists"])(this);
        this.iHash.update(buf);
        return this;
    }
    digestInto(out) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aexists"])(this);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aoutput"])(out, this);
        this.finished = true;
        const buf = out.subarray(0, this.outputLen);
        // Reuse the first outputLen bytes for the inner digest; the outer hash consumes them before
        // overwriting that same prefix with the final tag, leaving any oversized tail untouched.
        this.iHash.digestInto(buf);
        this.oHash.update(buf);
        this.oHash.digestInto(buf);
        this.destroy();
    }
    digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
    }
    _cloneInto(to) {
        // Create new instance without calling constructor since the key
        // is already in state and we don't know it.
        to ||= Object.create(Object.getPrototypeOf(this), {});
        const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.canXOF = canXOF;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
    }
    clone() {
        return this._cloneInto();
    }
    destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
    }
}
const hmac = /* @__PURE__ */ (()=>{
    const hmac_ = (hash, key, message)=>new _HMAC(hash, key).update(message).digest();
    hmac_.create = (hash, key)=>new _HMAC(hash, key);
    return hmac_;
})();
}),
"[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/hkdf.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "expand",
    ()=>expand,
    "extract",
    ()=>extract,
    "hkdf",
    ()=>hkdf
]);
/**
 * HKDF (RFC 5869): extract + expand in one step.
 * See {@link https://soatok.blog/2021/11/17/understanding-hkdf/}.
 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$hmac$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/hmac.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/utils.js [app-route] (ecmascript)");
;
;
function extract(hash, ikm, salt) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ahash"])(hash);
    // NOTE: some libraries treat zero-length array as 'not provided';
    // we don't, since we have undefined as 'not provided'
    // https://github.com/RustCrypto/KDFs/issues/15
    if (salt === undefined) salt = new Uint8Array(hash.outputLen);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$hmac$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hmac"])(hash, salt, ikm);
}
// Shared mutable scratch byte for the RFC 5869 block counter `N`.
// Safe to reuse because `expand()` is synchronous and resets it with `clean(...)` before returning.
const HKDF_COUNTER = /* @__PURE__ */ Uint8Array.of(0);
// Shared RFC 5869 empty string for both `info === undefined` and the first-block `T(0)` input.
const EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
function expand(hash, prk, info, length = 32, _recycled) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ahash"])(hash);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["anumber"])(length, 'length');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(prk, undefined, 'prk');
    const olen = hash.outputLen;
    // RFC 5869 §2.3: PRK is "a pseudorandom key of at least HashLen octets".
    if (prk.length < olen) throw new Error('"prk" must be at least HashLen octets');
    // RFC 5869 §2.3 only bounds `L` by `<= 255*HashLen`; `L=0` is valid and yields empty OKM.
    if (length > 255 * olen) throw new Error('Length must be <= 255*HashLen');
    const blocks = Math.ceil(length / olen);
    if (info === undefined) info = EMPTY_BUFFER;
    else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(info, undefined, 'info');
    if (!blocks) {
        if (_recycled) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(prk); // Full hkdf() owns this intermediate PRK.
        return new Uint8Array();
    }
    // first L(ength) octets of T
    // The private PRK can become both T and a one-block result after HMAC consumes the key.
    const okm = _recycled && blocks === 1 ? prk : new Uint8Array(blocks * olen);
    const { iHash, oHash } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$hmac$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hmac"].create(hash, prk);
    // Driving them directly also skips `_HMAC.digestInto`'s per-digest destroy.
    const T = _recycled ? prk : new Uint8Array(olen);
    // Full hkdf() donates one destroyed extract hash; standalone creates one alternating worker.
    const worker = blocks > 1 ? _recycled?.iHash || hash.create() : undefined;
    for(let counter = 0; counter < blocks - 1; counter++){
        HKDF_COUNTER[0] = counter + 1;
        const iWork = iHash._cloneInto(worker);
        // T(0) = empty string (zero length)
        // T(N) = HMAC-Hash(PRK, T(N-1) | info | N)
        if (counter) iWork.update(T);
        iWork.update(info).update(HKDF_COUNTER).digestInto(T);
        oHash._cloneInto(worker).update(T).digestInto(T);
        okm.set(T, olen * counter);
    }
    // Midstates are key-equivalent: they allow computing HMAC(prk, ...) for any message.
    HKDF_COUNTER[0] = blocks; // Final block consumes them; retain worker for cleanup.
    if (blocks > 1) iHash.update(T);
    iHash.update(info).update(HKDF_COUNTER).digestInto(T);
    oHash.update(T).digestInto(T);
    okm.set(T, olen * (blocks - 1));
    iHash.destroy(); // Raw digests may leave key-derived base/worker state; wipe all explicitly.
    oHash.destroy();
    worker?.destroy();
    if (T !== okm) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(T); // Wipe private T/PRK; standalone preserves caller-owned PRK.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(HKDF_COUNTER);
    // Exact fit: return without the extra copy.
    if (length === okm.length) return okm;
    // Copy the requested prefix, then wipe the full buffer: its tail holds
    // up to HashLen-1 bytes of derived key material past `length`.
    const res = okm.slice(0, length);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(okm);
    return res;
}
const hkdf = (hash, ikm, salt, info, length)=>{
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ahash"])(hash);
    if (salt === undefined) salt = new Uint8Array(hash.outputLen);
    const HMAC = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$hmac$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hmac"].create(hash, salt).update(ikm);
    // The intermediate PRK is secret key material; wipe it instead of
    // leaving it for GC.
    return expand(hash, HMAC.digest(), info, length, HMAC); // expand() owns and consumes it.
};
}),
"[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/_u64.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "add",
    ()=>add,
    "add3H",
    ()=>add3H,
    "add3L",
    ()=>add3L,
    "add4H",
    ()=>add4H,
    "add4L",
    ()=>add4L,
    "add5H",
    ()=>add5H,
    "add5L",
    ()=>add5L,
    "fromBig",
    ()=>fromBig,
    "fromNumH",
    ()=>fromNumH,
    "fromNumL",
    ()=>fromNumL,
    "rotr32H",
    ()=>rotr32H,
    "rotr32L",
    ()=>rotr32L,
    "rotrBH",
    ()=>rotrBH,
    "rotrBL",
    ()=>rotrBL,
    "rotrSH",
    ()=>rotrSH,
    "rotrSL",
    ()=>rotrSL,
    "setU64FromNum",
    ()=>setU64FromNum,
    "shrSH",
    ()=>shrSH,
    "shrSL",
    ()=>shrSL,
    "split",
    ()=>split,
    "toBig",
    ()=>toBig
]);
const U32_MASK64 = /* @__PURE__ */ (()=>BigInt(2 ** 32 - 1))();
const _32n = /* @__PURE__ */ BigInt(32);
// Split bigint into two 32-bit halves. With `le=true`, returned fields become `{ h: low, l: high
// }` to match little-endian word order rather than the property names.
function fromBig(n, le = false) {
    if (le) return {
        h: Number(n & U32_MASK64),
        l: Number(n >> _32n & U32_MASK64)
    };
    return {
        h: Number(n >> _32n & U32_MASK64) | 0,
        l: Number(n & U32_MASK64) | 0
    };
}
// Split bigint list into `[highWords, lowWords]` when `le=false`; with `le=true`, the first array
// holds the low halves because `fromBig(...)` swaps the semantic meaning of `h` and `l`.
function split(lst, le = false) {
    const len = lst.length;
    let Ah = new Uint32Array(len);
    let Al = new Uint32Array(len);
    for(let i = 0; i < len; i++){
        const { h, l } = fromBig(lst[i], le);
        [Ah[i], Al[i]] = [
            h,
            l
        ];
    }
    return [
        Ah,
        Al
    ];
}
// Combine explicit `(high, low)` 32-bit halves into a bigint; `>>> 0` normalizes signed JS
// bitwise results back to uint32 first, and little-endian callers must swap.
const toBig = (h, l)=>BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
// Split a JS number into u32 halves without a BigInt allocation. Exact only for integers
// `0 <= n < 2**53`; callers use it on byte / bit counters, which JS length math caps far below
// that (an ArrayBuffer cannot exceed 2**53 - 1 bytes).
const fromNumH = (n)=>n / 2 ** 32 | 0;
const fromNumL = (n)=>n >>> 0;
// Drop-in replacement for `view.setBigUint64(byteOffset, BigInt(n), isLE)` without the per-call
// BigInt allocation. Same `n < 2**53` precondition as `fromNumH`/`fromNumL`.
function setU64FromNum(view, byteOffset, n, isLE) {
    const h = fromNumH(n);
    const l = fromNumL(n);
    view.setUint32(byteOffset, isLE ? l : h, isLE);
    view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}
// High 32-bit half of a 64-bit logical right shift for `s` in `0..31`.
const shrSH = (h, _l, s)=>h >>> s;
// Low 32-bit half of a 64-bit logical right shift, valid for `s` in `1..31`.
const shrSL = (h, l, s)=>h << 32 - s | l >>> s;
// High 32-bit half of a 64-bit right rotate, valid for `s` in `1..31`.
const rotrSH = (h, l, s)=>h >>> s | l << 32 - s;
// Low 32-bit half of a 64-bit right rotate, valid for `s` in `1..31`.
const rotrSL = (h, l, s)=>h << 32 - s | l >>> s;
// High 32-bit half of a 64-bit right rotate, valid for `s` in `33..63`; `32` uses `rotr32*`.
const rotrBH = (h, l, s)=>h << 64 - s | l >>> s - 32;
// Low 32-bit half of a 64-bit right rotate, valid for `s` in `33..63`; `32` uses `rotr32*`.
const rotrBL = (h, l, s)=>h >>> s - 32 | l << 64 - s;
// High 32-bit half of a 64-bit right rotate for `s === 32`; this is just the swapped low half.
const rotr32H = (_h, l)=>l;
// Low 32-bit half of a 64-bit right rotate for `s === 32`; this is just the swapped high half.
const rotr32L = (h, _l)=>h;
// 64-bit left rotates (rotl*) are not defined here: sha3.ts, their only consumer, keeps
// local copies so V8 inlines them into keccakP.
// Add two split 64-bit words and return the split `{ h, l }` sum.
// JS uses 32-bit signed integers for bitwise operations, so we cannot simply shift the carry out
// of the low sum and instead use division.
function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return {
        h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
        l: l | 0
    };
}
// Addition with more than 2 elements
// Unmasked low-word accumulator for 3-way addition; pass the raw result into `add3H(...)`.
const add3L = (Al, Bl, Cl)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
// High-word finalize step for 3-way addition; `low` must be the untruncated output of `add3L(...)`.
const add3H = (low, Ah, Bh, Ch)=>Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
// Unmasked low-word accumulator for 4-way addition; pass the raw result into `add4H(...)`.
const add4L = (Al, Bl, Cl, Dl)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
// High-word finalize step for 4-way addition; `low` must be the untruncated output of `add4L(...)`.
const add4H = (low, Ah, Bh, Ch, Dh)=>Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
// Unmasked low-word accumulator for 5-way addition; pass the raw result into `add5H(...)`.
const add5L = (Al, Bl, Cl, Dl, El)=>(Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
// High-word finalize step for 5-way addition; `low` must be the untruncated output of `add5L(...)`.
const add5H = (low, Ah, Bh, Ch, Dh, Eh)=>Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
;
}),
"[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/_md.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Chi",
    ()=>Chi,
    "HashMD",
    ()=>HashMD,
    "Maj",
    ()=>Maj,
    "SHA224_IV",
    ()=>SHA224_IV,
    "SHA256_IV",
    ()=>SHA256_IV,
    "SHA384_IV",
    ()=>SHA384_IV,
    "SHA512_IV",
    ()=>SHA512_IV
]);
/**
 * Internal Merkle-Damgard hash utils.
 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/_u64.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/utils.js [app-route] (ecmascript)");
;
;
function Chi(a, b, c) {
    return a & b ^ ~a & c;
}
function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
}
class HashMD {
    blockLen;
    outputLen;
    canXOF = false;
    padOffset;
    isLE;
    // For partial updates less than block size
    buffer;
    view;
    finished = false;
    length = 0;
    pos = 0;
    destroyed = false;
    constructor(blockLen, outputLen, padOffset, isLE){
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE;
        this.buffer = new Uint8Array(blockLen);
        this.view = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createView"])(this.buffer);
    }
    update(data) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aexists"])(this);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(data);
        const { view, buffer, blockLen } = this;
        const len = data.length;
        let processed = false;
        for(let pos = 0; pos < len;){
            const take = Math.min(blockLen - this.pos, len - pos);
            // Fast path only when there is no buffered partial block: `take === blockLen` implies
            // `this.pos === 0`, so we can process full blocks directly from the input view.
            if (take === blockLen) {
                const dataView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createView"])(data);
                for(; blockLen <= len - pos; pos += blockLen)this.process(dataView, pos);
                processed = true;
                continue;
            }
            // When the whole input is buffered in one go (common for short messages), passing `data`
            // directly avoids allocating a subarray view.
            buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
                this.process(view, 0);
                this.pos = 0;
                processed = true;
            }
        }
        this.length += data.length;
        // Shared schedule buffers only pick up input-derived words inside process(); if everything
        // was buffered without processing, there is nothing to zero.
        if (processed) this.roundClean();
        return this;
    }
    digestInto(out) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aexists"])(this);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aoutput"])(out, this);
        this.finished = true;
        // Padding
        // We can avoid allocation of buffer for padding completely if it
        // was previously not allocated here. But it won't change performance.
        const { buffer, view, blockLen, isLE } = this;
        let { pos } = this;
        // append the bit '1' to the message, then zero-pad the rest of the block
        buffer[pos++] = 0b10000000;
        buffer.fill(0, pos);
        // we have less than padOffset left in buffer, so we cannot put length in
        // current block, need process it and pad again
        if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            buffer.fill(0);
        }
        // `padOffset` reserves the whole length field. For SHA-384/512 the high 64 bits stay zero from
        // the padding fill above, and JS will overflow before user input can make that half non-zero.
        // So we only need to write the low 64 bits here (`length * 8` only scales the exponent of an
        // integer below 2**53, so the split inside the helper stays exact).
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setU64FromNum"])(view, blockLen - 8, this.length * 8, isLE);
        this.process(view, 0);
        // The final block above is processed outside update(), so the shared message-schedule
        // buffers (e.g. SHA256_W) would otherwise retain input-derived words after digest().
        this.roundClean();
        // digest() passes our own `buffer` as `out`; reuse its cached view instead of allocating one.
        const oview = out === buffer ? view : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createView"])(out);
        const len = this.outputLen;
        // NOTE: we do division by 4 later, which must be fused in single op with modulo by JIT
        const outLen = len / 4;
        const state = this.get();
        // Subclass-misconfiguration invariant: outputLen must be 32-bit aligned and fit the state.
        if (len % 4 || outLen > state.length) throw new Error('invalid outputLen');
        for(let i = 0; i < outLen; i++)oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        // Copy before destroy(): subclasses wipe `buffer` during cleanup, but `digest()` must return
        // fresh bytes to the caller.
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
    }
    _cloneIntoMeta(to) {
        const { buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        // Only partial-block bytes need copying: when `length % blockLen === 0`, `pos === 0` and
        // later `update()` / `digestInto()` overwrite `to.buffer` from the start before reading it.
        if (pos) to.buffer.set(buffer); // Avoid a hot modulo guard.
        return to;
    }
    clone() {
        return this._cloneInto();
    }
}
const SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19
]);
const SHA224_IV = /* @__PURE__ */ Uint32Array.from([
    0xc1059ed8,
    0x367cd507,
    0x3070dd17,
    0xf70e5939,
    0xffc00b31,
    0x68581511,
    0x64f98fa7,
    0xbefa4fa4
]);
const SHA384_IV = /* @__PURE__ */ Uint32Array.from([
    0xcbbb9d5d,
    0xc1059ed8,
    0x629a292a,
    0x367cd507,
    0x9159015a,
    0x3070dd17,
    0x152fecd8,
    0xf70e5939,
    0x67332667,
    0xffc00b31,
    0x8eb44a87,
    0x68581511,
    0xdb0c2e0d,
    0x64f98fa7,
    0x47b5481d,
    0xbefa4fa4
]);
const SHA512_IV = /* @__PURE__ */ Uint32Array.from([
    0x6a09e667,
    0xf3bcc908,
    0xbb67ae85,
    0x84caa73b,
    0x3c6ef372,
    0xfe94f82b,
    0xa54ff53a,
    0x5f1d36f1,
    0x510e527f,
    0xade682d1,
    0x9b05688c,
    0x2b3e6c1f,
    0x1f83d9ab,
    0xfb41bd6b,
    0x5be0cd19,
    0x137e2179
]);
}),
"[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/sha2.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_SHA224",
    ()=>_SHA224,
    "_SHA256",
    ()=>_SHA256,
    "_SHA384",
    ()=>_SHA384,
    "_SHA512",
    ()=>_SHA512,
    "_SHA512_224",
    ()=>_SHA512_224,
    "_SHA512_256",
    ()=>_SHA512_256,
    "sha224",
    ()=>sha224,
    "sha256",
    ()=>sha256,
    "sha384",
    ()=>sha384,
    "sha512",
    ()=>sha512,
    "sha512_224",
    ()=>sha512_224,
    "sha512_256",
    ()=>sha512_256
]);
/**
 * SHA2 hash function. A.k.a. sha256, sha384, sha512, sha512_224, sha512_256.
 * SHA256 is the fastest hash implementable in JS, even faster than Blake3.
 * Check out {@link https://www.rfc-editor.org/rfc/rfc4634 | RFC 4634} and
 * {@link https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf | FIPS 180-4}.
 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/_md.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/_u64.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+hashes@2.4.0/node_modules/@noble/hashes/utils.js [app-route] (ecmascript)");
;
;
;
/**
 * SHA-224 / SHA-256 round constants from RFC 6234 §5.1: the first 32 bits
 * of the cube roots of the first 64 primes (2..311).
 */ // prettier-ignore
const SHA256_K = /* @__PURE__ */ Uint32Array.from([
    0x428a2f98,
    0x71374491,
    0xb5c0fbcf,
    0xe9b5dba5,
    0x3956c25b,
    0x59f111f1,
    0x923f82a4,
    0xab1c5ed5,
    0xd807aa98,
    0x12835b01,
    0x243185be,
    0x550c7dc3,
    0x72be5d74,
    0x80deb1fe,
    0x9bdc06a7,
    0xc19bf174,
    0xe49b69c1,
    0xefbe4786,
    0x0fc19dc6,
    0x240ca1cc,
    0x2de92c6f,
    0x4a7484aa,
    0x5cb0a9dc,
    0x76f988da,
    0x983e5152,
    0xa831c66d,
    0xb00327c8,
    0xbf597fc7,
    0xc6e00bf3,
    0xd5a79147,
    0x06ca6351,
    0x14292967,
    0x27b70a85,
    0x2e1b2138,
    0x4d2c6dfc,
    0x53380d13,
    0x650a7354,
    0x766a0abb,
    0x81c2c92e,
    0x92722c85,
    0xa2bfe8a1,
    0xa81a664b,
    0xc24b8b70,
    0xc76c51a3,
    0xd192e819,
    0xd6990624,
    0xf40e3585,
    0x106aa070,
    0x19a4c116,
    0x1e376c08,
    0x2748774c,
    0x34b0bcb5,
    0x391c0cb3,
    0x4ed8aa4a,
    0x5b9cca4f,
    0x682e6ff3,
    0x748f82ee,
    0x78a5636f,
    0x84c87814,
    0x8cc70208,
    0x90befffa,
    0xa4506ceb,
    0xbef9a3f7,
    0xc67178f2
]);
/** Reusable SHA-224 / SHA-256 message schedule buffer `W_t` from RFC 6234 §6.2 step 1. */ const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
/** Internal SHA-224 / SHA-256 compression engine from RFC 6234 §6.2. */ class SHA2_32B extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HashMD"] {
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    // Numeric initializers matter: starting the fields as `undefined` changes
    // V8's field representation and makes sha256 3x slower (measured).
    A = 0;
    B = 0;
    C = 0;
    D = 0;
    E = 0;
    F = 0;
    G = 0;
    H = 0;
    constructor(outputLen, IV){
        super(64, outputLen, 8, false);
        this.A = IV[0] | 0;
        this.B = IV[1] | 0;
        this.C = IV[2] | 0;
        this.D = IV[3] | 0;
        this.E = IV[4] | 0;
        this.F = IV[5] | 0;
        this.G = IV[6] | 0;
        this.H = IV[7] | 0;
    }
    get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [
            A,
            B,
            C,
            D,
            E,
            F,
            G,
            H
        ];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
    }
    _cloneInto(to) {
        (to ||= new this.constructor()).set(...this.get());
        return this._cloneIntoMeta(to);
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
        for(let i = 0; i < 16; i++, offset += 4)SHA256_W[i] = view.getUint32(offset, false);
        for(let i = 16; i < 64; i++){
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(W15, 7) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(W15, 18) ^ W15 >>> 3;
            const s1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(W2, 17) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(W2, 19) ^ W2 >>> 10;
            SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        // Compression function main loop, 64 rounds
        let { A, B, C, D, E, F, G, H } = this;
        for(let i = 0; i < 64; i++){
            const sigma1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(E, 6) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(E, 11) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(E, 25);
            const T1 = H + sigma1 + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Chi"])(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
            const sigma0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(A, 2) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(A, 13) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotr"])(A, 22);
            const T2 = sigma0 + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Maj"])(A, B, C) | 0;
            H = G;
            G = F;
            F = E;
            E = D + T1 | 0;
            D = C;
            C = B;
            B = A;
            A = T1 + T2 | 0;
        }
        // Add the compressed chunk to the current hash value
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(SHA256_W);
    }
    destroy() {
        // HashMD callers route post-destroy usability through `destroyed`; zeroizing alone still leaves
        // update()/digest() callable on reused instances.
        this.destroyed = true;
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(this.buffer);
    }
}
class _SHA256 extends SHA2_32B {
    constructor(){
        super(32, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHA256_IV"]);
    }
}
class _SHA224 extends SHA2_32B {
    constructor(){
        super(28, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHA224_IV"]);
    }
}
// SHA2-512 is slower than sha256 in js because u64 operations are slow.
// SHA-384 / SHA-512 round constants from RFC 6234 §5.2:
// 80 full 64-bit words split into high/low halves.
// prettier-ignore
const K512 = /* @__PURE__ */ (()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["split"]([
        '0x428a2f98d728ae22',
        '0x7137449123ef65cd',
        '0xb5c0fbcfec4d3b2f',
        '0xe9b5dba58189dbbc',
        '0x3956c25bf348b538',
        '0x59f111f1b605d019',
        '0x923f82a4af194f9b',
        '0xab1c5ed5da6d8118',
        '0xd807aa98a3030242',
        '0x12835b0145706fbe',
        '0x243185be4ee4b28c',
        '0x550c7dc3d5ffb4e2',
        '0x72be5d74f27b896f',
        '0x80deb1fe3b1696b1',
        '0x9bdc06a725c71235',
        '0xc19bf174cf692694',
        '0xe49b69c19ef14ad2',
        '0xefbe4786384f25e3',
        '0x0fc19dc68b8cd5b5',
        '0x240ca1cc77ac9c65',
        '0x2de92c6f592b0275',
        '0x4a7484aa6ea6e483',
        '0x5cb0a9dcbd41fbd4',
        '0x76f988da831153b5',
        '0x983e5152ee66dfab',
        '0xa831c66d2db43210',
        '0xb00327c898fb213f',
        '0xbf597fc7beef0ee4',
        '0xc6e00bf33da88fc2',
        '0xd5a79147930aa725',
        '0x06ca6351e003826f',
        '0x142929670a0e6e70',
        '0x27b70a8546d22ffc',
        '0x2e1b21385c26c926',
        '0x4d2c6dfc5ac42aed',
        '0x53380d139d95b3df',
        '0x650a73548baf63de',
        '0x766a0abb3c77b2a8',
        '0x81c2c92e47edaee6',
        '0x92722c851482353b',
        '0xa2bfe8a14cf10364',
        '0xa81a664bbc423001',
        '0xc24b8b70d0f89791',
        '0xc76c51a30654be30',
        '0xd192e819d6ef5218',
        '0xd69906245565a910',
        '0xf40e35855771202a',
        '0x106aa07032bbd1b8',
        '0x19a4c116b8d2d0c8',
        '0x1e376c085141ab53',
        '0x2748774cdf8eeb99',
        '0x34b0bcb5e19b48a8',
        '0x391c0cb3c5c95a63',
        '0x4ed8aa4ae3418acb',
        '0x5b9cca4f7763e373',
        '0x682e6ff3d6b2b8a3',
        '0x748f82ee5defb2fc',
        '0x78a5636f43172f60',
        '0x84c87814a1f0ab72',
        '0x8cc702081a6439ec',
        '0x90befffa23631e28',
        '0xa4506cebde82bde9',
        '0xbef9a3f7b2c67915',
        '0xc67178f2e372532b',
        '0xca273eceea26619c',
        '0xd186b8c721c0c207',
        '0xeada7dd6cde0eb1e',
        '0xf57d4f7fee6ed178',
        '0x06f067aa72176fba',
        '0x0a637dc5a2c898a6',
        '0x113f9804bef90dae',
        '0x1b710b35131c471b',
        '0x28db77f523047d84',
        '0x32caab7b40c72493',
        '0x3c9ebe0a15c9bebc',
        '0x431d67c49c100d4c',
        '0x4cc5d4becb3e42b6',
        '0x597f299cfc657e2a',
        '0x5fcb6fab3ad6faec',
        '0x6c44198c4a475817'
    ].map((n)=>BigInt(n))))();
const SHA512_Kh = /* @__PURE__ */ (()=>K512[0])();
const SHA512_Kl = /* @__PURE__ */ (()=>K512[1])();
// Reusable high-half schedule buffer for the RFC 6234 §6.4 64-bit `W_t` words.
const SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
// Reusable low-half schedule buffer for the RFC 6234 §6.4 64-bit `W_t` words.
const SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
/** Internal SHA-384 / SHA-512 compression engine from RFC 6234 §6.4. */ class SHA2_64B extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HashMD"] {
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    // h -- high 32 bits, l -- low 32 bits
    // Numeric initializers matter: starting the fields as `undefined` changes
    // V8's field representation and slows hashing down (measured on sha256).
    Ah = 0;
    Al = 0;
    Bh = 0;
    Bl = 0;
    Ch = 0;
    Cl = 0;
    Dh = 0;
    Dl = 0;
    Eh = 0;
    El = 0;
    Fh = 0;
    Fl = 0;
    Gh = 0;
    Gl = 0;
    Hh = 0;
    Hl = 0;
    constructor(outputLen, IV){
        super(128, outputLen, 16, false);
        this.Ah = IV[0] | 0;
        this.Al = IV[1] | 0;
        this.Bh = IV[2] | 0;
        this.Bl = IV[3] | 0;
        this.Ch = IV[4] | 0;
        this.Cl = IV[5] | 0;
        this.Dh = IV[6] | 0;
        this.Dl = IV[7] | 0;
        this.Eh = IV[8] | 0;
        this.El = IV[9] | 0;
        this.Fh = IV[10] | 0;
        this.Fl = IV[11] | 0;
        this.Gh = IV[12] | 0;
        this.Gl = IV[13] | 0;
        this.Hh = IV[14] | 0;
        this.Hl = IV[15] | 0;
    }
    // prettier-ignore
    get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [
            Ah,
            Al,
            Bh,
            Bl,
            Ch,
            Cl,
            Dh,
            Dl,
            Eh,
            El,
            Fh,
            Fl,
            Gh,
            Gl,
            Hh,
            Hl
        ];
    }
    // prettier-ignore
    set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
    }
    _cloneInto(to) {
        (to ||= new this.constructor()).set(...this.get());
        return this._cloneIntoMeta(to);
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
        for(let i = 0; i < 16; i++, offset += 4){
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset += 4);
        }
        for(let i = 16; i < 80; i++){
            // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSH"](W15h, W15l, 1) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSH"](W15h, W15l, 8) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shrSH"](W15h, W15l, 7);
            const s0l = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSL"](W15h, W15l, 1) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSL"](W15h, W15l, 8) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shrSL"](W15h, W15l, 7);
            // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSH"](W2h, W2l, 19) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBH"](W2h, W2l, 61) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shrSH"](W2h, W2l, 6);
            const s1l = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSL"](W2h, W2l, 19) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBL"](W2h, W2l, 61) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shrSL"](W2h, W2l, 6);
            // SHA512_W[i] = s0 + s1 + SHA512_W[i - 7] + SHA512_W[i - 16];
            const SUMl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add4L"](s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add4H"](SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        // Compression function main loop, 80 rounds
        for(let i = 0; i < 80; i++){
            // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
            const sigma1h = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSH"](Eh, El, 14) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSH"](Eh, El, 18) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBH"](Eh, El, 41);
            const sigma1l = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSL"](Eh, El, 14) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSL"](Eh, El, 18) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBL"](Eh, El, 41);
            //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
            // prettier-ignore
            const T1ll = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add5L"](Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add5H"](T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)
            const sigma0h = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSH"](Ah, Al, 28) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBH"](Ah, Al, 34) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBH"](Ah, Al, 39);
            const sigma0l = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrSL"](Ah, Al, 28) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBL"](Ah, Al, 34) ^ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotrBL"](Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add3L"](T1l, sigma0l, MAJl);
            Ah = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add3H"](All, T1h, sigma0h, MAJh);
            Al = All | 0;
        }
        // Add the compressed chunk to the current hash value
        ({ h: Ah, l: Al } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_u64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["add"](this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(SHA512_W_H, SHA512_W_L);
    }
    destroy() {
        // HashMD callers route post-destroy usability through `destroyed`; zeroizing alone still leaves
        // update()/digest() callable on reused instances.
        this.destroyed = true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(this.buffer);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
}
class _SHA512 extends SHA2_64B {
    constructor(){
        super(64, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHA512_IV"]);
    }
}
class _SHA384 extends SHA2_64B {
    constructor(){
        super(48, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$_md$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHA384_IV"]);
    }
}
/**
 * Truncated SHA512/256 and SHA512/224.
 * SHA512_IV is XORed with 0xa5a5a5a5a5a5a5a5, then used as "intermediary" IV of SHA512/t.
 * Then t hashes string to produce result IV.
 * See the repo-side derivation recipe in `test/misc/sha2-gen-iv.js`.
 * These IV literals are checked against that script rather than a dedicated
 * local RFC section.
 */ /** SHA-512/224 IV derived by the SHA-512/t recipe in `test/misc/sha2-gen-iv.js` and
 * stored as sixteen big-endian 32-bit halves. */ const T224_IV = /* @__PURE__ */ Uint32Array.from([
    0x8c3d37c8,
    0x19544da2,
    0x73e19966,
    0x89dcd4d6,
    0x1dfab7ae,
    0x32ff9c82,
    0x679dd514,
    0x582f9fcf,
    0x0f6d2b69,
    0x7bd44da8,
    0x77e36f73,
    0x04c48942,
    0x3f9d85a8,
    0x6a1d36c8,
    0x1112e6ad,
    0x91d692a1
]);
/** SHA-512/256 IV derived by the SHA-512/t recipe in `test/misc/sha2-gen-iv.js` and
 * stored as sixteen big-endian 32-bit halves. */ const T256_IV = /* @__PURE__ */ Uint32Array.from([
    0x22312194,
    0xfc2bf72c,
    0x9f555fa3,
    0xc84c64c2,
    0x2393b86b,
    0x6f53b151,
    0x96387719,
    0x5940eabd,
    0x96283ee2,
    0xa88effe3,
    0xbe5e1e25,
    0x53863992,
    0x2b0199fc,
    0x2c85b8aa,
    0x0eb72ddc,
    0x81c52ca2
]);
class _SHA512_224 extends SHA2_64B {
    constructor(){
        super(28, T224_IV);
    }
}
class _SHA512_256 extends SHA2_64B {
    constructor(){
        super(32, T256_IV);
    }
}
const sha256 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHasher"])(()=>new _SHA256(), /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["oidNist"])(0x01));
const sha224 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHasher"])(()=>new _SHA224(), /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["oidNist"])(0x04));
const sha512 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHasher"])(()=>new _SHA512(), /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["oidNist"])(0x03));
const sha384 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHasher"])(()=>new _SHA384(), /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["oidNist"])(0x02));
const sha512_256 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHasher"])(()=>new _SHA512_256(), /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["oidNist"])(0x06));
const sha512_224 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHasher"])(()=>new _SHA512_224(), /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$hashes$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$hashes$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["oidNist"])(0x05));
}),
"[project]/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createDefu",
    ()=>createDefu,
    "default",
    ()=>defu,
    "defu",
    ()=>defu,
    "defuArrayFn",
    ()=>defuArrayFn,
    "defuFn",
    ()=>defuFn
]);
function isPlainObject(value) {
    if (value === null || typeof value !== "object") {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
        return false;
    }
    if (Symbol.iterator in value) {
        return false;
    }
    if (Symbol.toStringTag in value) {
        return Object.prototype.toString.call(value) === "[object Module]";
    }
    return true;
}
function _defu(baseObject, defaults, namespace = ".", merger) {
    if (!isPlainObject(defaults)) {
        return _defu(baseObject, {}, namespace, merger);
    }
    const object = {
        ...defaults
    };
    for (const key of Object.keys(baseObject)){
        if (key === "__proto__" || key === "constructor") {
            continue;
        }
        const value = baseObject[key];
        if (value === null || value === void 0) {
            continue;
        }
        if (merger && merger(object, key, value, namespace)) {
            continue;
        }
        if (Array.isArray(value) && Array.isArray(object[key])) {
            object[key] = [
                ...value,
                ...object[key]
            ];
        } else if (isPlainObject(value) && isPlainObject(object[key])) {
            object[key] = _defu(value, object[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
        } else {
            object[key] = value;
        }
    }
    return object;
}
function createDefu(merger) {
    return (...arguments_)=>// eslint-disable-next-line unicorn/no-array-reduce
        arguments_.reduce((p, c)=>_defu(p, c, "", merger), {});
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue)=>{
    if (object[key] !== void 0 && typeof currentValue === "function") {
        object[key] = currentValue(object[key]);
        return true;
    }
});
const defuArrayFn = createDefu((object, key, currentValue)=>{
    if (Array.isArray(object[key]) && typeof currentValue === "function") {
        object[key] = currentValue(object[key]);
        return true;
    }
});
;
}),
"[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utilities for hex, bytes, CSPRNG.
 * @module
 */ /*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */ __turbopack_context__.s([
    "aarray",
    ()=>aarray,
    "abool",
    ()=>abool,
    "abytes",
    ()=>abytes,
    "aexists",
    ()=>aexists,
    "anumber",
    ()=>anumber,
    "aoutput",
    ()=>aoutput,
    "aoutput32",
    ()=>aoutput32,
    "byteSwap",
    ()=>byteSwap,
    "byteSwap32",
    ()=>byteSwap32,
    "bytesToHex",
    ()=>bytesToHex,
    "bytesToNumberBE",
    ()=>bytesToNumberBE,
    "bytesToUtf8",
    ()=>bytesToUtf8,
    "checkOpts",
    ()=>checkOpts,
    "clean",
    ()=>clean,
    "complexOverlapBytes",
    ()=>complexOverlapBytes,
    "concatBytes",
    ()=>concatBytes,
    "copyBytes",
    ()=>copyBytes,
    "createView",
    ()=>createView,
    "equalBytes",
    ()=>equalBytes,
    "getOutput",
    ()=>getOutput,
    "hexToBytes",
    ()=>hexToBytes,
    "hexToNumber",
    ()=>hexToNumber,
    "isAligned32",
    ()=>isAligned32,
    "isBytes",
    ()=>isBytes,
    "isLE",
    ()=>isLE,
    "managedNonce",
    ()=>managedNonce,
    "numberToBytesBE",
    ()=>numberToBytesBE,
    "overlapBytes",
    ()=>overlapBytes,
    "randomBytes",
    ()=>randomBytes,
    "swap32IfBE",
    ()=>swap32IfBE,
    "swap8IfBE",
    ()=>swap8IfBE,
    "u32",
    ()=>u32,
    "u64Lengths",
    ()=>u64Lengths,
    "u8",
    ()=>u8,
    "utf8ToBytes",
    ()=>utf8ToBytes,
    "wrapCipher",
    ()=>wrapCipher,
    "wrapMacConstructor",
    ()=>wrapMacConstructor
]);
function aarray(item, title, inner = ()=>{}) {
    if (!Array.isArray(item)) throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
    for(let i = 0; i < item.length; i++)inner(item[i], `${title}[${i}]`);
    return item;
}
function isBytes(a) {
    // Plain `instanceof Uint8Array` is too strict for some Buffer / proxy /
    // cross-realm cases. The fallback still requires a real ArrayBuffer view
    // so plain JSON-deserialized `{ constructor: ... }`
    // spoofing is rejected, and `BYTES_PER_ELEMENT === 1` keeps the fallback on byte-oriented views.
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array' && 'BYTES_PER_ELEMENT' in a && a.BYTES_PER_ELEMENT === 1;
}
// Shared error-message prefix builder. Only called on throw paths, so assert
// success paths never pay for the string concatenation.
const atitle = (title)=>title ? `"${title}" ` : '';
function abool(value, title = '') {
    if (typeof value !== 'boolean') throw new TypeError(atitle(title) + 'expected boolean, got type=' + typeof value);
    return value;
}
function anumber(n, title = '') {
    if (typeof n !== 'number') throw new TypeError(atitle(title) + 'expected number, got ' + typeof n);
    if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(atitle(title) + 'expected integer >= 0, got ' + n);
    return n;
}
function abytes(value, length, title = '') {
    // Success path first: this runs at the start of every update() / digestInto(), and the
    // common `abytes(data)` form must not pay for length handling it does not use.
    if (isBytes(value) && (length === undefined || value.length === length)) return value;
    // Error path: recompute freely to build the exact message.
    if (length !== undefined) anumber(length, 'length');
    const bytes = isBytes(value);
    const ofLen = length !== undefined ? ` of length ${length}` : '';
    const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
    const message = atitle(title) + 'expected Uint8Array' + ofLen + ', got ' + got;
    if (!bytes) throw new TypeError(message);
    throw new RangeError(message);
}
const aobject = (value, label)=>{
    if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(label === 'object' ? 'expected valid options object' : `"${label}" expected object, got type=${typeof value}`);
};
function aexists(instance, checkFinished = true) {
    // Runs on every update()/digestInto(); the flags are library-owned booleans, so only their
    // truthiness is checked - re-validating their type per call was pure hot-path overhead.
    if (instance.destroyed) throw new Error('hash was destroyed');
    if (checkFinished && instance.finished) throw new Error('digest() was already called');
}
function aoutput(out, instance) {
    abytes(out, undefined, 'output');
    // `outputLen` is a library-owned readonly number; the negated comparison keeps failing fast
    // when it is missing/NaN (comparisons with undefined/NaN are false) without an anumber() call.
    const min = instance.outputLen;
    if (!(out.length >= min)) {
        throw new RangeError('"output" expected length >= ' + min);
    }
}
function aoutput32(out, instance) {
    aoutput(out, instance);
    if (!isAligned32(out)) throw new Error('invalid output, must be aligned');
}
function u8(arr) {
    return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
}
function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
    for(let i = 0; i < arrays.length; i++){
        arrays[i].fill(0);
    }
}
function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
const isLE = /* @__PURE__ */ (()=>new Uint8Array(new Uint32Array([
        0x11223344
    ]).buffer)[0] === 0x44)();
function byteSwap(word) {
    return word << 24 & 0xff000000 | word << 8 & 0xff0000 | word >>> 8 & 0xff00 | word >>> 24 & 0xff;
}
const swap8IfBE = isLE ? (n)=>n : (n)=>byteSwap(n) >>> 0;
function byteSwap32(arr) {
    for(let i = 0; i < arr.length; i++){
        arr[i] = byteSwap(arr[i]);
    }
    return arr;
}
const swap32IfBE = isLE ? (u)=>u : byteSwap32;
// Built-in hex conversion:
// {@link https://caniuse.com/mdn-javascript_builtins_uint8array_fromhex | caniuse entry}
const hasHexBuiltin = /* @__PURE__ */ (()=>// @ts-ignore
    typeof Uint8Array.from([]).toHex === 'function' && typeof Uint8Array.fromHex === 'function')();
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({
    length: 256
}, (_, i)=>i.toString(16).padStart(2, '0'));
function bytesToHex(bytes) {
    abytes(bytes);
    // @ts-ignore
    if (hasHexBuiltin) return bytes.toHex();
    // pre-caching improves the speed 6x
    let hex = '';
    for(let i = 0; i < bytes.length; i++){
        hex += hexes[bytes[i]];
    }
    return hex;
}
// Strict ASCII nibble parser: non-ASCII hex lookalikes are rejected as undefined.
// ASCII codes: '0'..'9' = 48..57, 'A'..'F' = 65..70, 'a'..'f' = 97..102.
// prettier-ignore
function asciiToBase16(ch) {
    return ch >= 48 && ch <= 57 ? ch - 48 // '2' => 50-48
     : ch >= 65 && ch <= 70 ? ch - (65 - 10) // 'B' => 66-(65-10)
     : ch >= 97 && ch <= 102 ? ch - (97 - 10) // 'b' => 98-(97-10)
     : undefined;
}
function hexToBytes(hex) {
    if (typeof hex !== 'string') throw new TypeError('hex string expected, got ' + typeof hex);
    if (hasHexBuiltin) {
        try {
            return Uint8Array.fromHex(hex);
        } catch (error) {
            if (error instanceof SyntaxError) throw new RangeError(error.message);
            throw error;
        }
    }
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2) throw new RangeError('hex string expected, got unpadded hex of length ' + hl);
    const array = new Uint8Array(al);
    for(let ai = 0, hi = 0; ai < al; ai++, hi += 2){
        const n1 = asciiToBase16(hex.charCodeAt(hi)); // parse first char, multiply it by 16
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1)); // parse second char
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // example: 'A9' => 10*16 + 9
    }
    return array;
}
const _0n = /* @__PURE__ */ BigInt(0);
function hexToNumber(hex) {
    if (typeof hex !== 'string') throw new TypeError('hex string expected, got ' + typeof hex);
    // Numeric parser, not byte-hex decoder: odd-length forms like 'f' are valid,
    // and malformed syntax follows BigInt's native error behavior.
    return hex === '' ? _0n : BigInt('0x' + hex); // Big Endian
}
function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
}
/**
 * Validates that a value is a non-negative bigint or safe integer.
 * @param n - Value to validate.
 * @returns The same validated value.
 * @throws On wrong argument ranges or values. {@link RangeError}
 */ function abignumber(n) {
    if (typeof n === 'bigint') {
        if (!(_0n <= n)) throw new RangeError('positive bigint expected, got ' + n);
    } else anumber(n);
    return n;
}
function numberToBytesBE(n, len) {
    anumber(len);
    if (len === 0) throw new Error('zero output length is invalid');
    n = abignumber(n);
    const expectedLen = len * 2;
    const hex = n.toString(16);
    // Detect overflow before hex parsing so oversized values don't leak the shared odd-hex error.
    if (hex.length > expectedLen) throw new RangeError('number is too large');
    return hexToBytes(hex.padStart(expectedLen, '0'));
}
function utf8ToBytes(str) {
    if (typeof str !== 'string') throw new TypeError('string expected');
    return new Uint8Array(new TextEncoder().encode(str)); // {@link https://bugzil.la/1681809 | Firefox bug 1681809}
}
function bytesToUtf8(bytes) {
    return new TextDecoder().decode(bytes);
}
function overlapBytes(a, b) {
    // Zero-length views cannot overwrite anything, even if their offset sits inside another range.
    if (!a.byteLength || !b.byteLength) return false;
    return a.buffer === b.buffer && // best we can do, may fail with an obscure Proxy
    a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
    b.byteOffset < a.byteOffset + a.byteLength // b starts before a end
    ;
}
function complexOverlapBytes(input, output) {
    // This is very cursed. It works somehow, but I'm completely unsure,
    // reasoning about overlapping aligned windows is very hard.
    if (overlapBytes(input, output) && input.byteOffset < output.byteOffset) throw new Error('complex overlap of input and output is not supported');
}
function concatBytes(...arrays) {
    let sum = 0;
    for(let i = 0; i < arrays.length; i++){
        const a = arrays[i];
        abytes(a);
        sum += a.length;
    }
    const res = new Uint8Array(sum);
    for(let i = 0, pad = 0; i < arrays.length; i++){
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
    }
    return res;
}
function checkOpts(defaults, opts) {
    aobject(defaults, 'defaults');
    aobject(opts, 'opts');
    // Mutates defaults by design. __proto__ follows Object.assign semantics here and can only
    // affect this local option object; callers already control this low-level options surface.
    const merged = Object.assign(defaults, opts);
    return merged;
}
function equalBytes(a, b) {
    a = abytes(a);
    b = abytes(b);
    if (a.length !== b.length) return false;
    let diff = 0;
    for(let i = 0; i < a.length; i++)diff |= a[i] ^ b[i];
    return diff === 0;
}
function wrapMacConstructor(keyLen, macCons, fromMsg) {
    const mac = macCons;
    const getArgs = fromMsg || (()=>[]);
    const macC = (msg, key)=>mac(key, ...getArgs(msg)).update(msg).digest();
    const tmp = mac(new Uint8Array(keyLen), ...getArgs(new Uint8Array(0)));
    macC.outputLen = tmp.outputLen;
    macC.blockLen = tmp.blockLen;
    macC.create = (key, ...args)=>mac(key, ...args);
    return macC;
}
const wrapCipher = (params, constructor)=>{
    function wrappedCipher(key, ...args) {
        // Validate key
        abytes(key, undefined, 'key');
        // Validate nonce if nonceLength is present
        if (params.nonceLength !== undefined) {
            const nonce = args[0];
            abytes(nonce, params.varSizeNonce ? undefined : params.nonceLength, 'nonce');
        }
        // Keep tag length available for decrypt-size checks after constructor validation.
        const tagl = params.tagLength;
        const aadStart = params.nonceLength !== undefined ? 1 : 0;
        // No-AAD constructors otherwise silently ignore byte args meant as AAD.
        if (!params.withAAD) {
            for(let i = aadStart; i < args.length; i++)if (isBytes(args[i])) throw new Error('AAD not supported');
        }
        // Validate the first AAD slot early; rest-arg AAD constructors validate the tail themselves.
        if (params.withAAD && args[aadStart] !== undefined) abytes(args[aadStart], undefined, 'AAD');
        const cipher = constructor(key, ...args);
        const checkOutput = (fnLength, output)=>{
            if (output !== undefined) {
                if (fnLength !== 2) throw new Error('cipher output not supported');
                abytes(output, undefined, 'output');
            }
        };
        // Create wrapped cipher with validation and single-use encryption
        let called = false;
        const wrCipher = {
            encrypt (data, output) {
                if (called) throw new Error('cannot encrypt() twice with same key + nonce');
                // Any encrypt attempt consumes the instance, even if validation rejects below.
                called = true;
                abytes(data, undefined, 'data');
                checkOutput(cipher.encrypt.length, output);
                return cipher.encrypt(data, output);
            },
            decrypt (data, output) {
                abytes(data, undefined, 'data');
                if (tagl && data.length < tagl) throw new Error('"ciphertext" expected length >= tagLength=' + tagl);
                checkOutput(cipher.decrypt.length, output);
                return cipher.decrypt(data, output);
            }
        };
        return wrCipher;
    }
    Object.assign(wrappedCipher, params);
    return wrappedCipher;
};
function getOutput(expectedLength, out, onlyAligned = true) {
    if (out === undefined) return new Uint8Array(expectedLength);
    // Keep Buffer/cross-realm Uint8Array support here instead of trusting a shape-compatible object.
    abytes(out, expectedLength, 'output');
    if (onlyAligned && !isAligned32(out)) throw new Error('invalid output, must be aligned');
    return out;
}
function u64Lengths(dataLength, aadLength, isLE) {
    // Reject coercible non-number lengths like '10' and true before BigInt(...) accepts them.
    anumber(dataLength);
    anumber(aadLength);
    abool(isLE);
    const num = new Uint8Array(16);
    const view = createView(num);
    view.setBigUint64(0, BigInt(aadLength), isLE);
    view.setBigUint64(8, BigInt(dataLength), isLE);
    return num;
}
function isAligned32(bytes) {
    return bytes.byteOffset % 4 === 0;
}
function copyBytes(bytes) {
    // `Uint8Array.from(...)` would also accept arrays / other typed arrays. Keep this helper strict
    // because callers use it at byte-validation boundaries before mutating the detached copy.
    return Uint8Array.from(abytes(bytes));
}
function randomBytes(bytesLength = 32) {
    // Match the repo's other length-taking helpers instead of relying on Uint8Array coercion.
    anumber(bytesLength, 'bytesLength');
    const cr = typeof globalThis === 'object' ? globalThis.crypto : null;
    if (typeof cr?.getRandomValues !== 'function') throw new Error('crypto.getRandomValues must be defined');
    // Web Cryptography API Level 2 §10.1.1:
    // if `byteLength > 65536`, throw `QuotaExceededError`.
    // Keep the guard explicit so callers can see the quota in code
    // instead of discovering it by reading the spec or host errors.
    // This wrapper surfaces the same quota as a stable library RangeError.
    if (bytesLength > 65536) throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
    return cr.getRandomValues(new Uint8Array(bytesLength));
}
function managedNonce(fn, randomBytes_ = randomBytes) {
    if (typeof fn !== 'function') throw new TypeError('"fn" expected cipher constructor, got type=' + typeof fn);
    if (typeof randomBytes_ !== 'function') throw new TypeError('"randomBytes_" expected function, got type=' + typeof randomBytes_);
    const { nonceLength } = fn;
    anumber(nonceLength, 'fn.nonceLength');
    const addNonce = (nonce, ciphertext, plaintext)=>{
        const out = concatBytes(nonce, ciphertext);
        // Wrapped ciphers may alias caller plaintext on encrypt(); never zero
        // caller-owned buffers here.
        if (!overlapBytes(plaintext, ciphertext)) ciphertext.fill(0);
        return out;
    };
    // NOTE: we cannot support DST here, it would be mistake:
    // - we don't know how much dst length cipher requires
    // - nonce may unalign dst and break everything
    // - we create new u8a anyway (concatBytes)
    // - previously we passed all args to cipher, but that was mistake!
    const res = (key, ...args)=>({
            encrypt (plaintext) {
                abytes(plaintext, undefined, 'data');
                const nonce = randomBytes_(nonceLength);
                const encrypted = fn(key, nonce, ...args).encrypt(plaintext);
                // @ts-ignore
                if (encrypted instanceof Promise) return encrypted.then((ct)=>addNonce(nonce, ct, plaintext));
                return addNonce(nonce, encrypted, plaintext);
            },
            decrypt (ciphertext) {
                abytes(ciphertext, undefined, 'data');
                const nonce = ciphertext.subarray(0, nonceLength);
                const decrypted = ciphertext.subarray(nonceLength);
                return fn(key, nonce, ...args).decrypt(decrypted);
            }
        });
    // Auto-nonce wrappers still preserve the wrapped payload geometry.
    if ('blockSize' in fn) res.blockSize = fn.blockSize;
    if ('tagLength' in fn) res.tagLength = fn.tagLength;
    if ('withAAD' in fn) res.withAAD = fn.withAAD;
    return res;
}
}),
"[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/_arx.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_XorStreamPRG",
    ()=>_XorStreamPRG,
    "createCipher",
    ()=>createCipher,
    "createPRG",
    ()=>createPRG,
    "rotl",
    ()=>rotl
]);
/**
 * Basic utils for ARX (add-rotate-xor) salsa and chacha ciphers.

RFC8439 requires multi-step cipher stream, where
authKey starts with counter: 0, actual msg with counter: 1.

For this, we need a way to re-use nonce / counter:

    const counter = new Uint8Array(4);
    chacha(..., counter, ...); // counter is now 1
    chacha(..., counter, ...); // counter is now 2

This is complicated:

- 32-bit counters are enough, no need for 64-bit: max ArrayBuffer size in JS is 4GB
- Original papers don't allow mutating counters
- Counter overflow is undefined [^1]
- Idea A: allow providing (nonce | counter) instead of just nonce, re-use it
- Caveat: Cannot be re-used through all cases:
- * chacha has (counter | nonce)
- * xchacha has (nonce16 | counter | nonce16)
- Idea B: separate nonce / counter and provide separate API for counter re-use
- Caveat: there are different counter sizes depending on an algorithm.
- salsa & chacha also differ in structures of key & sigma:
  salsa20:      s[0] | k(4) | s[1] | nonce(2) | cnt(2) | s[2] | k(4) | s[3]
  chacha:       s(4) | k(8) | cnt(1) | nonce(3)
  chacha20orig: s(4) | k(8) | cnt(2) | nonce(2)
- Idea C: helper method such as `setSalsaState(key, nonce, sigma, data)`
- Caveat: we can't re-use counter array

xchacha uses the subkey and remaining 8 byte nonce with ChaCha20 as normal
(prefixed by 4 NUL bytes, since RFC8439 specifies a 12-byte nonce).
Counter overflow is undefined; see {@link https://mailarchive.ietf.org/arch/msg/cfrg/gsOnTJzcbgG6OqD8Sc0GO5aR_tU/ | the CFRG thread}.
Current noble policy is strict non-wrap for the shared 32-bit counter path:
exported ARX ciphers reject initial `0xffffffff` and stop before any implicit
wrap back to zero.
See {@link https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha#appendix-A.2 | the XChaCha appendix} for the extended-nonce construction.

 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/utils.js [app-route] (ecmascript)");
;
// Replaces `TextEncoder` for ASCII literals, which is enough for sigma constants.
// Non-ASCII input would not match UTF-8 `TextEncoder` output.
const encodeStr = (str)=>Uint8Array.from(str.split(''), (c)=>c.charCodeAt(0));
// Raw `createCipher(...)` exports consume these native-endian `u32(...)` views directly.
// Public `wrapCipher(...)` APIs reject non-little-endian platforms before reaching this path.
// RFC 8439 §2.3 / RFC 7539 §2.3 only define the 256-bit-key constants; this 16-byte sigma is
// kept for legacy allowShortKeys Salsa/ChaCha variants.
const sigma16_32 = /* @__PURE__ */ (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(encodeStr('expand 16-byte k'))))();
// RFC 8439 §2.3 / RFC 7539 §2.3 define words 0-3 as
// `0x61707865 0x3320646e 0x79622d32 0x6b206574`, i.e. `expand 32-byte k`.
const sigma32_32 = /* @__PURE__ */ (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(encodeStr('expand 32-byte k'))))();
function rotl(a, b) {
    return a << b | a >>> 32 - b;
}
// Salsa and Chacha block length is always 512-bit
const BLOCK_LEN = 64;
// RFC 8439 §2.2 / RFC 7539 §2.2: the ChaCha state has 16 32-bit words.
const BLOCK_LEN32 = 16;
// Counter policy for the shared public `counter` argument:
// - RFC/IETF ChaCha20 uses a 32-bit counter.
// - OpenSSL/Node `chacha20` instead treat the full 16-byte IV as a 128-bit
//   counter state and carry into the next word.
// - Raw `chacha20orig`, `salsa20`, `xsalsa20`, and `xchacha20` use 64-bit counters in libsodium
//   and libtomcrypt, while some libs (for example libtomcrypt's RFC/IETF path) reject the max
//   boundary instead of carrying.
// - AEAD wrappers diverge too: libsodium `xchacha20poly1305` uses the IETF payload counter from
//   block 1, while `secretstream_xchacha20poly1305` is a different protocol with rekey/reset.
// Noble intentionally throws instead of silently picking one wrap model for users. In the default
// path, even a 32-bit boundary would take 2^32 blocks * 64 bytes = 256 GiB, which is practically
// unreachable for normal JS callers; advanced users who pass `counter` explicitly can implement
// whatever wider carry / wrap policy they need on top.
const MAX_COUNTER = /* @__PURE__ */ (()=>2 ** 32 - 1)();
const U32_EMPTY = /* @__PURE__ */ Uint32Array.of();
function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
    const len = data.length;
    const block = new Uint8Array(BLOCK_LEN);
    const b32 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(block);
    // Make sure that buffers aligned to 4 bytes
    const isAligned = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"] && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAligned32"])(data) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAligned32"])(output);
    const d32 = isAligned ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(data) : U32_EMPTY;
    const o32 = isAligned ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(output) : U32_EMPTY;
    // RFC 8439 §2.4.1 / RFC 7539 §2.4.1 allow XORing one keystream block at a time and
    // truncating the final partial block instead of materializing the whole keystream.
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"]) {
        for(let pos = 0; pos < len; counter++){
            core(sigma, key, nonce, b32, counter, rounds);
            // RFC 8439 §2.4 / RFC 7539 §2.4 serialize keystream words in little-endian order.
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(b32);
            if (counter >= MAX_COUNTER) throw new Error('arx: counter overflow');
            const take = Math.min(BLOCK_LEN, len - pos);
            for(let j = 0, posj; j < take; j++){
                posj = pos + j;
                output[posj] = data[posj] ^ block[j];
            }
            pos += take;
        }
        return;
    }
    for(let pos = 0; pos < len; counter++){
        core(sigma, key, nonce, b32, counter, rounds);
        // See MAX_COUNTER policy note above: never silently wrap the shared public counter.
        if (counter >= MAX_COUNTER) throw new Error('arx: counter overflow');
        const take = Math.min(BLOCK_LEN, len - pos);
        // aligned to 4 bytes
        if (isAligned && take === BLOCK_LEN) {
            const pos32 = pos / 4;
            if (pos % 4 !== 0) throw new Error('arx: invalid block position');
            for(let j = 0, posj; j < BLOCK_LEN32; j++){
                posj = pos32 + j;
                o32[posj] = d32[posj] ^ b32[j];
            }
            pos += BLOCK_LEN;
            continue;
        }
        for(let j = 0, posj; j < take; j++){
            posj = pos + j;
            output[posj] = data[posj] ^ block[j];
        }
        pos += take;
    }
}
function createCipher(core, opts) {
    const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkOpts"])({
        allowShortKeys: false,
        counterLength: 8,
        counterRight: false,
        rounds: 20
    }, opts);
    if (typeof core !== 'function') throw new Error('core must be a function');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["anumber"])(counterLength);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["anumber"])(rounds);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abool"])(counterRight);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abool"])(allowShortKeys);
    return (key, nonce, data, output, counter = 0)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(key, undefined, 'key');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(nonce, undefined, 'nonce');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(data, undefined, 'data');
        const len = data.length;
        // Raw XorStream APIs return ciphertext/plaintext bytes directly, so caller-provided outputs
        // must match the logical result length exactly instead of returning an oversized workspace.
        const hasOutput = output !== undefined;
        output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOutput"])(len, output, false);
        if (hasOutput) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["complexOverlapBytes"])(data, output);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["anumber"])(counter);
        // See MAX_COUNTER policy note above: reject advanced explicit-counter requests before any wrap.
        if (counter < 0 || counter >= MAX_COUNTER) throw new Error('arx: counter overflow');
        const toClean = [];
        // Key & sigma
        // key=16 -> sigma16, k=key|key
        // key=32 -> sigma32, k=key
        let l = key.length;
        let k;
        let sigma;
        if (l === 32) {
            // Copy caller keys too: big-endian normalization, extended-nonce subkey derivation, and
            // final clean(...) all mutate or wipe the temporary buffer in place.
            toClean.push(k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["copyBytes"])(key));
            sigma = sigma32_32;
        } else if (l === 16 && allowShortKeys) {
            k = new Uint8Array(32);
            k.set(key);
            k.set(key, 16);
            sigma = sigma16_32;
            toClean.push(k);
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(key, 32, 'arx key');
            throw new Error('invalid key size');
        // throw new Error(`"arx key" expected Uint8Array of length 32, got length=${l}`);
        }
        // Nonce
        // salsa20:      8   (8-byte counter)
        // chacha20orig: 8   (8-byte counter)
        // chacha20:     12  (4-byte counter)
        // xsalsa20:     24  (16 -> hsalsa,  8 -> old nonce)
        // xchacha20:    24  (16 -> hchacha, 8 -> old nonce)
        // Copy before taking u32(...) views on misaligned inputs, and on big-endian so later
        // swap32IfBE(...) never mutates caller nonce bytes in place.
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"] || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAligned32"])(nonce)) toClean.push(nonce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["copyBytes"])(nonce));
        let k32 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(k);
        // hsalsa & hchacha: handle extended nonce
        if (extendNonceFn) {
            if (nonce.length !== 24) throw new Error('arx: extended nonce must be 24 bytes');
            const n16 = nonce.subarray(0, 16);
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"]) extendNonceFn(sigma, k32, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(n16), k32);
            else {
                const sigmaRaw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(Uint32Array.from(sigma));
                extendNonceFn(sigmaRaw, k32, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(n16), k32);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(sigmaRaw);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(k32);
            }
            nonce = nonce.subarray(16);
        } else if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"]) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(k32);
        // Handle nonce counter
        const nonceNcLen = 16 - counterLength;
        if (nonceNcLen !== nonce.length) throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
        // Normalize 64-bit-nonce layouts to the 12-byte core input: ChaCha/XChaCha prefix 4 zero
        // counter bytes, while Salsa/XSalsa append them after the nonce words.
        if (nonceNcLen !== 12) {
            const nc = new Uint8Array(12);
            nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
            nonce = nc;
            toClean.push(nonce);
        }
        const n32 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u32"])(nonce));
        // Ensure temporary key/nonce copies are wiped even if the remaining
        // runtime guard in runCipher(...) throws on counter overflow.
        try {
            runCipher(core, sigma, k32, n32, data, output, counter, rounds);
            return output;
        } finally{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(...toClean);
        }
    };
}
class _XorStreamPRG {
    blockLen;
    keyLen;
    nonceLen;
    state;
    buf;
    key;
    nonce;
    pos;
    ctr;
    cipher;
    destroyed = false;
    constructor(cipher, blockLen, keyLen, nonceLen, seed){
        this.cipher = cipher;
        this.blockLen = blockLen;
        this.keyLen = keyLen;
        this.nonceLen = nonceLen;
        this.state = new Uint8Array(this.keyLen + this.nonceLen);
        this.reseed(seed);
        this.ctr = 0;
        this.pos = this.blockLen;
        this.buf = new Uint8Array(this.blockLen);
        // Keep a single key||nonce backing buffer so reseed/addEntropy/clean update the live cipher
        // inputs in place through these subarray views.
        this.key = this.state.subarray(0, this.keyLen);
        this.nonce = this.state.subarray(this.keyLen);
    }
    reseed(seed) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(seed, undefined, 'seed');
        if (!seed || seed.length === 0) throw new Error('entropy required');
        // Mix variable-length entropy cyclically across the whole key||nonce state, then restart the
        // keystream so buffered leftovers from the previous state are never reused.
        for(let i = 0; i < seed.length; i++)this.state[i % this.state.length] ^= seed[i];
        this.ctr = 0;
        this.pos = this.blockLen;
    }
    addEntropy(seed) {
        if (this.destroyed) throw new Error('cannot use destroyed PRG');
        // Reject empty entropy before re-keying, otherwise a throwing call would still advance state.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(seed, undefined, 'seed');
        if (seed.length === 0) throw new Error('entropy required');
        // Re-key from the current stream first, then mix external entropy into the fresh key||nonce
        // state through reseed() so stale buffered bytes are discarded.
        this.state.set(this.randomBytes(this.state.length));
        this.reseed(seed);
    }
    randomBytes(len) {
        if (this.destroyed) throw new Error('cannot use destroyed PRG');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["anumber"])(len);
        if (len === 0) return new Uint8Array(0);
        const avail = this.pos < this.blockLen ? this.blockLen - this.pos : 0;
        const blocks = Math.ceil(Math.max(0, len - avail) / this.blockLen);
        // Preflight overflow so failed reads don't partially consume keystream
        // and leave the PRG repeating blocks.
        if (blocks > 0 && this.ctr > MAX_COUNTER - blocks) throw new Error('arx: counter overflow');
        const out = new Uint8Array(len);
        let outPos = 0;
        // `out` starts zero-filled, and `buf.fill(0)` below does the same for leftovers: XOR-stream
        // ciphers then emit raw keystream bytes directly into those buffers.
        // Serve buffered leftovers first so split reads stay identical to one larger read.
        if (this.pos < this.blockLen) {
            const take = Math.min(len, this.blockLen - this.pos);
            out.set(this.buf.subarray(this.pos, this.pos + take), 0);
            this.pos += take;
            outPos += take;
            if (outPos === len) return out; // fast path
        }
        // Full blocks directly to out
        const full = Math.floor((len - outPos) / this.blockLen);
        if (full > 0) {
            const blockBytes = full * this.blockLen;
            const b = out.subarray(outPos, outPos + blockBytes);
            this.cipher(this.key, this.nonce, b, b, this.ctr);
            this.ctr += full;
            outPos += blockBytes;
        }
        // Save leftovers
        const left = len - outPos;
        if (left > 0) {
            this.buf.fill(0);
            // NOTE: cipher will handle overflow
            this.cipher(this.key, this.nonce, this.buf, this.buf, this.ctr++);
            out.set(this.buf.subarray(0, left), outPos);
            this.pos = left;
        }
        return out;
    }
    // Clone seeds the new instance from this stream, so the source PRG advances too.
    clone() {
        if (this.destroyed) throw new Error('cannot use destroyed PRG');
        return new _XorStreamPRG(this.cipher, this.blockLen, this.keyLen, this.nonceLen, this.randomBytes(this.state.length));
    }
    // Zeroes the current state, leftover buffer, and marks the instance destroyed.
    // The instance fails closed: any later randomBytes()/addEntropy()/clone() throws instead
    // of silently continuing from zero key||nonce state (which would yield predictable output).
    clean() {
        this.pos = 0;
        this.ctr = 0;
        this.buf.fill(0);
        this.state.fill(0);
        this.destroyed = true;
    }
}
const createPRG = (cipher, blockLen, keyLen, nonceLen)=>{
    return (seed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["randomBytes"])(32))=>new _XorStreamPRG(cipher, blockLen, keyLen, nonceLen, seed);
};
}),
"[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/_poly1305.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Poly1305",
    ()=>Poly1305,
    "poly1305",
    ()=>poly1305
]);
/**
 * Poly1305 ({@link https://cr.yp.to/mac/poly1305-20050329.pdf | PDF},
 * {@link https://en.wikipedia.org/wiki/Poly1305 | wiki})
 * is a fast and parallel secret-key message-authentication code suitable for
 * a wide variety of applications. It was standardized in
 * {@link https://www.rfc-editor.org/rfc/rfc8439 | RFC 8439} and is now used in TLS 1.3.
 *
 * Polynomial MACs are not perfect for every situation:
 * they lack Random Key Robustness: the MAC can be forged, and can't be used in PAKE schemes.
 * See {@link https://keymaterial.net/2020/09/07/invisible-salamanders-in-aes-gcm-siv/ | the invisible salamanders attack writeup}.
 * To combat invisible salamanders, `hash(key)` can be included in ciphertext,
 * however, this would violate ciphertext indistinguishability:
 * an attacker would know which key was used - so `HKDF(key, i)`
 * could be used instead.
 *
 * Check out the {@link https://cr.yp.to/mac.html | original website}.
 * Based on public-domain {@link https://github.com/floodyberry/poly1305-donna | poly1305-donna}.
 * @module
 */ // prettier-ignore
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/utils.js [app-route] (ecmascript)");
;
// A simple-loop reference version (`poly1305_small`) lives in
// `test/misc/micro-ciphers.ts`, provided for auditability.
// Little-endian 2-byte load used by the Poly1305 limb decomposition.
function u8to16(a, i) {
    return a[i++] & 0xff | (a[i++] & 0xff) << 8;
}
class Poly1305 {
    blockLen = 16;
    outputLen = 16;
    buffer = new Uint8Array(16);
    r = new Uint16Array(10);
    h = new Uint16Array(10);
    pad = new Uint16Array(8);
    pos = 0;
    finished = false;
    destroyed = false;
    // Can be speed-up using BigUint64Array, at the cost of complexity
    constructor(key){
        key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["copyBytes"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(key, 32, 'key'));
        const t0 = u8to16(key, 0);
        const t1 = u8to16(key, 2);
        const t2 = u8to16(key, 4);
        const t3 = u8to16(key, 6);
        const t4 = u8to16(key, 8);
        const t5 = u8to16(key, 10);
        const t6 = u8to16(key, 12);
        const t7 = u8to16(key, 14);
        // RFC 8439 §2.5.1 / RFC 7539 §2.5.1 clamp r before multiplication.
        // These masks unpack that clamped value into 13-bit limbs, while pad
        // keeps the raw s half for finalize().
        // {@link https://github.com/floodyberry/poly1305-donna/blob/e6ad6e091d30d7f4ec2d4f978be1fcfcbce72781/poly1305-donna-16.h#L47 | poly1305-donna reference}
        this.r[0] = t0 & 0x1fff;
        this.r[1] = (t0 >>> 13 | t1 << 3) & 0x1fff;
        this.r[2] = (t1 >>> 10 | t2 << 6) & 0x1f03;
        this.r[3] = (t2 >>> 7 | t3 << 9) & 0x1fff;
        this.r[4] = (t3 >>> 4 | t4 << 12) & 0x00ff;
        this.r[5] = t4 >>> 1 & 0x1ffe;
        this.r[6] = (t4 >>> 14 | t5 << 2) & 0x1fff;
        this.r[7] = (t5 >>> 11 | t6 << 5) & 0x1f81;
        this.r[8] = (t6 >>> 8 | t7 << 8) & 0x1fff;
        this.r[9] = t7 >>> 5 & 0x007f;
        for(let i = 0; i < 8; i++)this.pad[i] = u8to16(key, 16 + 2 * i);
    }
    process(data, offset, isLast = false) {
        // RFC 8439 §2.5 / §2.5.1 and RFC 7539 §2.5 / §2.5.1 add an extra high
        // bit to every full 16-byte block. The final partial block gets its
        // explicit `1` byte during digestInto(), so `hibit` stays zero there.
        const hibit = isLast ? 0 : 1 << 11;
        const { h, r } = this;
        const r0 = r[0];
        const r1 = r[1];
        const r2 = r[2];
        const r3 = r[3];
        const r4 = r[4];
        const r5 = r[5];
        const r6 = r[6];
        const r7 = r[7];
        const r8 = r[8];
        const r9 = r[9];
        const t0 = u8to16(data, offset + 0);
        const t1 = u8to16(data, offset + 2);
        const t2 = u8to16(data, offset + 4);
        const t3 = u8to16(data, offset + 6);
        const t4 = u8to16(data, offset + 8);
        const t5 = u8to16(data, offset + 10);
        const t6 = u8to16(data, offset + 12);
        const t7 = u8to16(data, offset + 14);
        let h0 = h[0] + (t0 & 0x1fff);
        let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 0x1fff);
        let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 0x1fff);
        let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 0x1fff);
        let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 0x1fff);
        let h5 = h[5] + (t4 >>> 1 & 0x1fff);
        let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 0x1fff);
        let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 0x1fff);
        let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 0x1fff);
        let h9 = h[9] + (t7 >>> 5 | hibit);
        let c = 0;
        let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
        c = d0 >>> 13;
        d0 &= 0x1fff;
        d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
        c += d0 >>> 13;
        d0 &= 0x1fff;
        let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
        c = d1 >>> 13;
        d1 &= 0x1fff;
        d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
        c += d1 >>> 13;
        d1 &= 0x1fff;
        let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
        c = d2 >>> 13;
        d2 &= 0x1fff;
        d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
        c += d2 >>> 13;
        d2 &= 0x1fff;
        let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
        c = d3 >>> 13;
        d3 &= 0x1fff;
        d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
        c += d3 >>> 13;
        d3 &= 0x1fff;
        let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
        c = d4 >>> 13;
        d4 &= 0x1fff;
        d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
        c += d4 >>> 13;
        d4 &= 0x1fff;
        let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
        c = d5 >>> 13;
        d5 &= 0x1fff;
        d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
        c += d5 >>> 13;
        d5 &= 0x1fff;
        let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
        c = d6 >>> 13;
        d6 &= 0x1fff;
        d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
        c += d6 >>> 13;
        d6 &= 0x1fff;
        let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
        c = d7 >>> 13;
        d7 &= 0x1fff;
        d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
        c += d7 >>> 13;
        d7 &= 0x1fff;
        let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
        c = d8 >>> 13;
        d8 &= 0x1fff;
        d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
        c += d8 >>> 13;
        d8 &= 0x1fff;
        let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
        c = d9 >>> 13;
        d9 &= 0x1fff;
        d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
        c += d9 >>> 13;
        d9 &= 0x1fff;
        c = (c << 2) + c | 0;
        c = c + d0 | 0;
        d0 = c & 0x1fff;
        c = c >>> 13;
        d1 += c;
        h[0] = d0;
        h[1] = d1;
        h[2] = d2;
        h[3] = d3;
        h[4] = d4;
        h[5] = d5;
        h[6] = d6;
        h[7] = d7;
        h[8] = d8;
        h[9] = d9;
    }
    finalize() {
        const { h, pad } = this;
        const g = new Uint16Array(10);
        let c = h[1] >>> 13;
        h[1] &= 0x1fff;
        for(let i = 2; i < 10; i++){
            h[i] += c;
            c = h[i] >>> 13;
            h[i] &= 0x1fff;
        }
        h[0] += c * 5;
        c = h[0] >>> 13;
        h[0] &= 0x1fff;
        h[1] += c;
        c = h[1] >>> 13;
        h[1] &= 0x1fff;
        h[2] += c;
        // RFC 8439 §2.5 / RFC 7539 §2.5 reduce modulo 2^130-5 before repacking
        // to 16-bit words and adding the raw s half.
        g[0] = h[0] + 5;
        c = g[0] >>> 13;
        g[0] &= 0x1fff;
        for(let i = 1; i < 10; i++){
            g[i] = h[i] + c;
            c = g[i] >>> 13;
            g[i] &= 0x1fff;
        }
        g[9] -= 1 << 13;
        let mask = (c ^ 1) - 1;
        for(let i = 0; i < 10; i++)g[i] &= mask;
        mask = ~mask;
        for(let i = 0; i < 10; i++)h[i] = h[i] & mask | g[i];
        h[0] = (h[0] | h[1] << 13) & 0xffff;
        h[1] = (h[1] >>> 3 | h[2] << 10) & 0xffff;
        h[2] = (h[2] >>> 6 | h[3] << 7) & 0xffff;
        h[3] = (h[3] >>> 9 | h[4] << 4) & 0xffff;
        h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 0xffff;
        h[5] = (h[6] >>> 2 | h[7] << 11) & 0xffff;
        h[6] = (h[7] >>> 5 | h[8] << 8) & 0xffff;
        h[7] = (h[8] >>> 8 | h[9] << 5) & 0xffff;
        let f = h[0] + pad[0];
        h[0] = f & 0xffff;
        for(let i = 1; i < 8; i++){
            f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
            h[i] = f & 0xffff;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(g);
    }
    update(data) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aexists"])(this);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(data);
        data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["copyBytes"])(data);
        const { buffer, blockLen } = this;
        const len = data.length;
        for(let pos = 0; pos < len;){
            const take = Math.min(blockLen - this.pos, len - pos);
            // Fast path: we have at least one block in input
            if (take === blockLen) {
                for(; blockLen <= len - pos; pos += blockLen)this.process(data, pos);
                continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
                this.process(buffer, 0, false);
                this.pos = 0;
            }
        }
        return this;
    }
    destroy() {
        // `aexists(this)` guards update/digest paths, so destroy must mark the instance unusable too.
        this.destroyed = true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(this.h, this.r, this.buffer, this.pad);
    }
    digestInto(out) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aexists"])(this);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aoutput"])(out, this);
        this.finished = true;
        const { buffer, h } = this;
        let { pos } = this;
        if (pos) {
            // RFC 8439 §2.5 / RFC 7539 §2.5: the final short block appends a
            // single `0x01` byte and zero-fills the remaining bytes before the
            // last multiplication step.
            buffer[pos++] = 1;
            for(; pos < 16; pos++)buffer[pos] = 0;
            this.process(buffer, 0, true);
        }
        this.finalize();
        let opos = 0;
        for(let i = 0; i < 8; i++){
            out[opos++] = h[i] >>> 0;
            out[opos++] = h[i] >>> 8;
        }
    }
    digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        // Copy out before destroy() zeroes the internal buffer.
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
    }
}
const poly1305 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrapMacConstructor"])(32, (key)=>new Poly1305(key));
}),
"[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/chacha.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__TESTS",
    ()=>__TESTS,
    "_poly1305_aead",
    ()=>_poly1305_aead,
    "chacha12",
    ()=>chacha12,
    "chacha20",
    ()=>chacha20,
    "chacha20orig",
    ()=>chacha20orig,
    "chacha20poly1305",
    ()=>chacha20poly1305,
    "chacha8",
    ()=>chacha8,
    "hchacha",
    ()=>hchacha,
    "rngChacha20",
    ()=>rngChacha20,
    "rngChacha8",
    ()=>rngChacha8,
    "xchacha20",
    ()=>xchacha20,
    "xchacha20poly1305",
    ()=>xchacha20poly1305
]);
/**
 * ChaCha stream cipher, released
 * in 2008. Developed after Salsa20, ChaCha aims to increase diffusion per round.
 * It was standardized in
 * {@link https://www.rfc-editor.org/rfc/rfc8439 | RFC 8439} and
 * is now used in TLS 1.3.
 *
 * {@link https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha | XChaCha20}
 * extended-nonce variant is also provided. Similar to XSalsa, it's safe to use with
 * randomly-generated nonces.
 *
 * Check out
 * {@link http://cr.yp.to/chacha/chacha-20080128.pdf | PDF},
 * {@link https://en.wikipedia.org/wiki/Salsa20 | wiki}, and
 * {@link https://cr.yp.to/chacha.html | website}.
 *
 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/_arx.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_poly1305$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/_poly1305.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@noble+ciphers@2.4.0/node_modules/@noble/ciphers/utils.js [app-route] (ecmascript)");
;
;
;
/**
 * ChaCha core function. Uses an unrolled loop (chachaCore, hchacha) - 4x
 * faster than a simple loop, but larger & harder to read. A simple-loop
 * reference version lives in `test/misc/micro-ciphers.ts`;
 * `test/arx.test.ts` keeps the two aligned.
 * The specific implementation is selected in `createCipher` below.
 */ /** RFC 8439 §2.3 block core for `state = constants | key | counter | nonce`. */ // prettier-ignore
function chachaCore(s, k, n, out, cnt, rounds = 20) {
    let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2]; // Counter  Nonce   Nonce   Nonce
    // Save state to temporary variables
    let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
    for(let r = 0; r < rounds; r += 2){
        x00 = x00 + x04 | 0;
        x12 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x12 ^ x00, 16);
        x08 = x08 + x12 | 0;
        x04 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x04 ^ x08, 12);
        x00 = x00 + x04 | 0;
        x12 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x12 ^ x00, 8);
        x08 = x08 + x12 | 0;
        x04 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x04 ^ x08, 7);
        x01 = x01 + x05 | 0;
        x13 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x13 ^ x01, 16);
        x09 = x09 + x13 | 0;
        x05 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x05 ^ x09, 12);
        x01 = x01 + x05 | 0;
        x13 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x13 ^ x01, 8);
        x09 = x09 + x13 | 0;
        x05 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x05 ^ x09, 7);
        x02 = x02 + x06 | 0;
        x14 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x14 ^ x02, 16);
        x10 = x10 + x14 | 0;
        x06 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x06 ^ x10, 12);
        x02 = x02 + x06 | 0;
        x14 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x14 ^ x02, 8);
        x10 = x10 + x14 | 0;
        x06 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x06 ^ x10, 7);
        x03 = x03 + x07 | 0;
        x15 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x15 ^ x03, 16);
        x11 = x11 + x15 | 0;
        x07 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x07 ^ x11, 12);
        x03 = x03 + x07 | 0;
        x15 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x15 ^ x03, 8);
        x11 = x11 + x15 | 0;
        x07 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x07 ^ x11, 7);
        x00 = x00 + x05 | 0;
        x15 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x15 ^ x00, 16);
        x10 = x10 + x15 | 0;
        x05 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x05 ^ x10, 12);
        x00 = x00 + x05 | 0;
        x15 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x15 ^ x00, 8);
        x10 = x10 + x15 | 0;
        x05 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x05 ^ x10, 7);
        x01 = x01 + x06 | 0;
        x12 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x12 ^ x01, 16);
        x11 = x11 + x12 | 0;
        x06 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x06 ^ x11, 12);
        x01 = x01 + x06 | 0;
        x12 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x12 ^ x01, 8);
        x11 = x11 + x12 | 0;
        x06 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x06 ^ x11, 7);
        x02 = x02 + x07 | 0;
        x13 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x13 ^ x02, 16);
        x08 = x08 + x13 | 0;
        x07 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x07 ^ x08, 12);
        x02 = x02 + x07 | 0;
        x13 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x13 ^ x02, 8);
        x08 = x08 + x13 | 0;
        x07 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x07 ^ x08, 7);
        x03 = x03 + x04 | 0;
        x14 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x14 ^ x03, 16);
        x09 = x09 + x14 | 0;
        x04 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x04 ^ x09, 12);
        x03 = x03 + x04 | 0;
        x14 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x14 ^ x03, 8);
        x09 = x09 + x14 | 0;
        x04 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rotl"])(x04 ^ x09, 7);
    }
    // RFC 8439 §2.3 / §2.3.1: add the original state words back in state order.
    let oi = 0;
    out[oi++] = y00 + x00 | 0;
    out[oi++] = y01 + x01 | 0;
    out[oi++] = y02 + x02 | 0;
    out[oi++] = y03 + x03 | 0;
    out[oi++] = y04 + x04 | 0;
    out[oi++] = y05 + x05 | 0;
    out[oi++] = y06 + x06 | 0;
    out[oi++] = y07 + x07 | 0;
    out[oi++] = y08 + x08 | 0;
    out[oi++] = y09 + x09 | 0;
    out[oi++] = y10 + x10 | 0;
    out[oi++] = y11 + x11 | 0;
    out[oi++] = y12 + x12 | 0;
    out[oi++] = y13 + x13 | 0;
    out[oi++] = y14 + x14 | 0;
    out[oi++] = y15 + x15 | 0;
}
function hchacha(s, k, i, out) {
    // Runs the shared chachaCore permutation, then subtracts the RFC 8439 feed-forward
    // it applies, recovering the raw permutation words hchacha needs.
    // LE hosts read the caller arrays in place (no copies); BE hosts get
    // byte-swapped scratch copies, wiped before returning.
    const s2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"] ? s : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(s.slice(0, 4));
    const k2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"] ? k : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(k.slice(0, 8));
    const i2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"] ? i : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(i.slice(0, 4));
    const t = new Uint32Array(16);
    chachaCore(s2, k2, i2.subarray(1), t, i2[0]);
    let oi = 0;
    out[oi++] = t[0] - s2[0] | 0;
    out[oi++] = t[1] - s2[1] | 0;
    out[oi++] = t[2] - s2[2] | 0;
    out[oi++] = t[3] - s2[3] | 0;
    out[oi++] = t[12] - i2[0] | 0;
    out[oi++] = t[13] - i2[1] | 0;
    out[oi++] = t[14] - i2[2] | 0;
    out[oi++] = t[15] - i2[3] | 0;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["swap32IfBE"])(out);
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLE"]) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(s2, k2, i2);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(t);
}
const chacha20orig = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCipher"])(chachaCore, {
    counterRight: false,
    counterLength: 8,
    allowShortKeys: true
});
const chacha20 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCipher"])(chachaCore, {
    counterRight: false,
    counterLength: 4,
    allowShortKeys: false
});
const xchacha20 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCipher"])(chachaCore, {
    counterRight: false,
    counterLength: 8,
    extendNonceFn: hchacha,
    allowShortKeys: false
});
const chacha8 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCipher"])(chachaCore, {
    counterRight: false,
    counterLength: 4,
    rounds: 8
});
const chacha12 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCipher"])(chachaCore, {
    counterRight: false,
    counterLength: 4,
    rounds: 12
});
const __TESTS = /* @__PURE__ */ Object.freeze({
    chachaCore
});
// RFC 8439 §2.8.1 pad16(x): shared zero block for AAD/ciphertext padding.
const ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
// RFC 8439 §2.8 / §2.8.1: aligned inputs add nothing, otherwise append 16-(len%16) zero bytes.
const updatePadded = (h, msg)=>{
    h.update(msg);
    const leftover = msg.length % 16;
    if (leftover) h.update(ZEROS16.subarray(leftover));
};
// RFC 8439 §2.6.1 poly1305_key_gen returns `block[0..31]`, so AEAD key
// generation only needs 32 zero bytes.
const ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
function computeTag(fn, key, nonce, ciphertext, AAD) {
    if (AAD !== undefined) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["abytes"])(AAD, undefined, 'AAD');
    // RFC 8439 §2.6 / §2.8: derive the Poly1305 one-time key from counter 0,
    // then MAC AAD || pad16(AAD) || ciphertext || pad16(ciphertext) || len(AAD) || len(ciphertext).
    const authKey = fn(key, nonce, ZEROS32);
    const lengths = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["u64Lengths"])(ciphertext.length, AAD ? AAD.length : 0, true);
    // Methods below can be replaced with
    // `return poly1305_computeTag_small(authKey, lengths, ciphertext, AAD)`
    // from `test/misc/micro-ciphers.ts`.
    const h = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_poly1305$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["poly1305"].create(authKey);
    if (AAD) updatePadded(h, AAD);
    updatePadded(h, ciphertext);
    h.update(lengths);
    const res = h.digest();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(authKey, lengths);
    return res;
}
const _poly1305_aead = (xorStream)=>(key, nonce, AAD)=>{
        // This borrows caller key/nonce/AAD buffers by reference; mutating them after construction
        // changes future encrypt/decrypt results.
        const tagLength = 16;
        return {
            encrypt (plaintext, output) {
                const plength = plaintext.length;
                output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOutput"])(plength + tagLength, output, false);
                output.set(plaintext);
                const oPlain = output.subarray(0, -tagLength);
                // RFC 8439 §2.8: payload encryption starts at counter 1 because counter 0 produced the OTK.
                xorStream(key, nonce, oPlain, oPlain, 1);
                const tag = computeTag(xorStream, key, nonce, oPlain, AAD);
                output.set(tag, plength); // append tag
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(tag);
                return output;
            },
            decrypt (ciphertext, output) {
                output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOutput"])(ciphertext.length - tagLength, output, false);
                const data = ciphertext.subarray(0, -tagLength);
                const passedTag = ciphertext.subarray(-tagLength);
                const tag = computeTag(xorStream, key, nonce, data, AAD);
                // RFC 8439 §2.8 / §4: authenticate ciphertext before decrypting it, and compare tags with
                // the constant-time equalBytes() helper rather than decrypting speculative plaintext first.
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["equalBytes"])(passedTag, tag)) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(tag);
                    throw new Error('invalid tag');
                }
                output.set(ciphertext.subarray(0, -tagLength));
                // Actual decryption
                xorStream(key, nonce, output, output, 1); // start stream with i=1
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clean"])(tag);
                return output;
            }
        };
    };
const chacha20poly1305 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrapCipher"])({
    blockSize: 64,
    nonceLength: 12,
    tagLength: 16,
    withAAD: true
}, /* @__PURE__ */ _poly1305_aead(chacha20));
const xchacha20poly1305 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrapCipher"])({
    blockSize: 64,
    nonceLength: 24,
    tagLength: 16,
    withAAD: true
}, /* @__PURE__ */ _poly1305_aead(xchacha20));
const rngChacha20 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPRG"])(chacha20orig, 64, 32, 8);
const rngChacha8 = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$noble$2b$ciphers$40$2$2e$4$2e$0$2f$node_modules$2f40$noble$2f$ciphers$2f$_arx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPRG"])(chacha8, 64, 32, 12);
}),
"[project]/node_modules/.pnpm/@better-fetch+fetch@1.3.2/node_modules/@better-fetch/fetch/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BetterFetchError",
    ()=>BetterFetchError,
    "ValidationError",
    ()=>ValidationError,
    "applySchemaPlugin",
    ()=>applySchemaPlugin,
    "betterFetch",
    ()=>betterFetch,
    "bodyParser",
    ()=>bodyParser,
    "createFetch",
    ()=>createFetch,
    "createRetryStrategy",
    ()=>createRetryStrategy,
    "createSchema",
    ()=>createSchema,
    "detectContentType",
    ()=>detectContentType,
    "detectResponseType",
    ()=>detectResponseType,
    "getBody",
    ()=>getBody,
    "getFetch",
    ()=>getFetch,
    "getHeaders",
    ()=>getHeaders,
    "getMethod",
    ()=>getMethod,
    "getTimeout",
    ()=>getTimeout,
    "getURL",
    ()=>getURL,
    "initializePlugins",
    ()=>initializePlugins,
    "isFunction",
    ()=>isFunction,
    "isJSONParsable",
    ()=>isJSONParsable,
    "isJSONSerializable",
    ()=>isJSONSerializable,
    "isPayloadMethod",
    ()=>isPayloadMethod,
    "isRouteMethod",
    ()=>isRouteMethod,
    "jsonParse",
    ()=>jsonParse,
    "mergeHeaders",
    ()=>mergeHeaders,
    "methods",
    ()=>methods,
    "parseStandardSchema",
    ()=>parseStandardSchema
]);
//#region src/error.ts
var BetterFetchError = class extends Error {
    constructor(status, statusText, error){
        super(statusText || status.toString(), {
            cause: error
        });
        this.status = status;
        this.statusText = statusText;
        this.error = error;
        Error.captureStackTrace(this, this.constructor);
    }
};
//#endregion
//#region src/plugins.ts
const initializePlugins = async (url, options)=>{
    let opts = options || {};
    const hooks = {
        onRequest: [
            options === null || options === void 0 ? void 0 : options.onRequest
        ],
        onResponse: [
            options === null || options === void 0 ? void 0 : options.onResponse
        ],
        onSuccess: [
            options === null || options === void 0 ? void 0 : options.onSuccess
        ],
        onError: [
            options === null || options === void 0 ? void 0 : options.onError
        ],
        onRetry: [
            options === null || options === void 0 ? void 0 : options.onRetry
        ]
    };
    if (!options || !(options === null || options === void 0 ? void 0 : options.plugins)) return {
        url,
        options: opts,
        hooks
    };
    for (const plugin of (options === null || options === void 0 ? void 0 : options.plugins) || []){
        var _plugin$hooks, _plugin$hooks2, _plugin$hooks3, _plugin$hooks4, _plugin$hooks5;
        if (plugin.init) {
            var _plugin$init;
            const pluginRes = await ((_plugin$init = plugin.init) === null || _plugin$init === void 0 ? void 0 : _plugin$init.call(plugin, url.toString(), opts));
            opts = pluginRes.options || opts;
            url = pluginRes.url;
        }
        hooks.onRequest.push((_plugin$hooks = plugin.hooks) === null || _plugin$hooks === void 0 ? void 0 : _plugin$hooks.onRequest);
        hooks.onResponse.push((_plugin$hooks2 = plugin.hooks) === null || _plugin$hooks2 === void 0 ? void 0 : _plugin$hooks2.onResponse);
        hooks.onSuccess.push((_plugin$hooks3 = plugin.hooks) === null || _plugin$hooks3 === void 0 ? void 0 : _plugin$hooks3.onSuccess);
        hooks.onError.push((_plugin$hooks4 = plugin.hooks) === null || _plugin$hooks4 === void 0 ? void 0 : _plugin$hooks4.onError);
        hooks.onRetry.push((_plugin$hooks5 = plugin.hooks) === null || _plugin$hooks5 === void 0 ? void 0 : _plugin$hooks5.onRetry);
    }
    return {
        url,
        options: opts,
        hooks
    };
};
//#endregion
//#region src/retry.ts
var LinearRetryStrategy = class {
    constructor(options){
        this.options = options;
    }
    shouldAttemptRetry(attempt, response) {
        if (this.options.shouldRetry) return Promise.resolve(attempt < this.options.attempts && this.options.shouldRetry(response));
        return Promise.resolve(attempt < this.options.attempts);
    }
    getDelay() {
        return this.options.delay;
    }
};
var ExponentialRetryStrategy = class {
    constructor(options){
        this.options = options;
    }
    shouldAttemptRetry(attempt, response) {
        if (this.options.shouldRetry) return Promise.resolve(attempt < this.options.attempts && this.options.shouldRetry(response));
        return Promise.resolve(attempt < this.options.attempts);
    }
    getDelay(attempt) {
        return Math.min(this.options.maxDelay, this.options.baseDelay * 2 ** attempt);
    }
};
function createRetryStrategy(options) {
    if (typeof options === "number") return new LinearRetryStrategy({
        type: "linear",
        attempts: options,
        delay: 1e3
    });
    switch(options.type){
        case "linear":
            return new LinearRetryStrategy(options);
        case "exponential":
            return new ExponentialRetryStrategy(options);
        default:
            throw new Error("Invalid retry strategy");
    }
}
//#endregion
//#region src/create-fetch/schema.ts
const methods = [
    "get",
    "post",
    "put",
    "patch",
    "delete"
];
const createSchema = (schema, config)=>{
    return {
        schema,
        config
    };
};
//#endregion
//#region src/method.ts
function parseMethodModifier(path) {
    if (!path.startsWith("@")) return {
        method: void 0,
        path
    };
    const separator = path.indexOf("/");
    const method = path.slice(1, separator === -1 ? void 0 : separator);
    if (!methods.includes(method)) return {
        method: void 0,
        path
    };
    return {
        method,
        path: separator === -1 ? path : path.slice(separator + 1)
    };
}
//#endregion
//#region src/url.ts
const isReservedPathSegment = (value)=>value === "." || value === "..";
const encodeLiteralPathSegment = (segment)=>segment.split(":").map((part)=>encodeURIComponent(part)).join(":");
function resolvePathSegment(segment, pathParams) {
    const pathParam = pathParams.get(segment);
    if (pathParam === void 0) return encodeLiteralPathSegment(segment);
    if (isReservedPathSegment(pathParam)) throw new TypeError("Path parameters cannot be reserved path segments");
    return encodeURIComponent(pathParam);
}
/**
* Normalize URL
*/ function getURL$1(url, option) {
    const { baseURL, params, query } = option || {
        query: {},
        params: {},
        baseURL: ""
    };
    let basePath = url.startsWith("http") ? url.split("/").slice(0, 3).join("/") : baseURL || "";
    const { path: requestPath } = parseMethodModifier(url);
    if (requestPath !== url) url = `/${requestPath}`;
    if (!basePath.endsWith("/")) basePath += "/";
    let [path, urlQuery] = url.replace(basePath, "").split("?");
    const queryParams = new URLSearchParams(urlQuery);
    for (const [key, value] of Object.entries(query || {})){
        if (value == null) continue;
        let serializedValue;
        if (typeof value === "string") serializedValue = value;
        else if (Array.isArray(value)) {
            for (const val of value)queryParams.append(key, val);
            continue;
        } else serializedValue = JSON.stringify(value);
        queryParams.set(key, serializedValue);
    }
    const pathParams = /* @__PURE__ */ new Map();
    if (params) if (Array.isArray(params)) {
        const paramPaths = path.split("/").filter((p)=>p.startsWith(":"));
        for (const [index, key] of paramPaths.entries()){
            const value = params[index];
            pathParams.set(key, String(value));
        }
    } else for (const [key, value] of Object.entries(params))pathParams.set(`:${key}`, String(value));
    path = path.split("/").map((segment)=>resolvePathSegment(segment, pathParams)).join("/");
    path = path.replace(/^\/+/, "");
    let queryParamString = queryParams.toString();
    queryParamString = queryParamString.length > 0 ? `?${queryParamString}`.replace(/\+/g, "%20") : "";
    if (!basePath.startsWith("http")) return `${basePath}${path}${queryParamString}`;
    return new URL(`${path}${queryParamString}`, basePath);
}
//#endregion
//#region src/auth.ts
const getAuthHeader = async (options)=>{
    const headers = {};
    const getValue = async (value)=>typeof value === "function" ? await value() : value;
    if (options === null || options === void 0 ? void 0 : options.auth) {
        if (options.auth.type === "Bearer") {
            const token = await getValue(options.auth.token);
            if (!token) return headers;
            headers["authorization"] = `Bearer ${token}`;
        } else if (options.auth.type === "Basic") {
            const [username, password] = await Promise.all([
                getValue(options.auth.username),
                getValue(options.auth.password)
            ]);
            if (!username || !password) return headers;
            headers["authorization"] = `Basic ${btoa(`${username}:${password}`)}`;
        } else if (options.auth.type === "Custom") {
            const [prefix, value] = await Promise.all([
                getValue(options.auth.prefix),
                getValue(options.auth.value)
            ]);
            if (!value) return headers;
            headers["authorization"] = `${prefix !== null && prefix !== void 0 ? prefix : ""} ${value}`;
        }
    }
    return headers;
};
//#endregion
//#region src/utils.ts
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(request) {
    const _contentType = request.headers.get("content-type");
    const textTypes = /* @__PURE__ */ new Set([
        "image/svg",
        "application/xml",
        "application/xhtml",
        "application/html"
    ]);
    if (!_contentType) return "json";
    const contentType = _contentType.split(";").shift() || "";
    if (JSON_RE.test(contentType)) return "json";
    if (textTypes.has(contentType) || contentType.startsWith("text/")) return "text";
    return "blob";
}
function isJSONParsable(value) {
    try {
        JSON.parse(value);
        return true;
    } catch (error) {
        return false;
    }
}
function isJSONSerializable(value) {
    if (value === void 0) return false;
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean" || t === null) return true;
    if (t !== "object") return false;
    if (Array.isArray(value)) return true;
    if (value.buffer) return false;
    return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
function jsonParse(text) {
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
}
function isFunction(value) {
    return typeof value === "function";
}
function getFetch(options) {
    if (options === null || options === void 0 ? void 0 : options.customFetchImpl) return options.customFetchImpl;
    if (typeof globalThis !== "undefined" && isFunction(globalThis.fetch)) return globalThis.fetch;
    if (("TURBOPACK compile-time value", "undefined") !== "undefined" && isFunction(window.fetch)) //TURBOPACK unreachable
    ;
    throw new Error("No fetch implementation found");
}
function isPayloadMethod(method) {
    if (!method) return false;
    return [
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ].includes(method.toUpperCase());
}
function isRouteMethod(method) {
    const routeMethod = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ];
    if (!method) return false;
    return routeMethod.includes(method.toUpperCase());
}
function mergeHeaders(...sources) {
    const merged = {};
    for (const source of sources){
        if (!source) continue;
        if (source instanceof Headers) source.forEach((value, key)=>{
            merged[key] = value;
        });
        else {
            const entries = Array.isArray(source) ? source : Object.entries(source);
            for (const [key, value] of entries)if (value !== null && value !== void 0) merged[key] = value;
        }
    }
    return merged;
}
async function getHeaders(opts) {
    const headers = new Headers(mergeHeaders(opts === null || opts === void 0 ? void 0 : opts.headers, await getAuthHeader(opts)));
    if (!headers.has("content-type")) {
        const contentType = detectContentType(opts === null || opts === void 0 ? void 0 : opts.body);
        if (contentType) headers.set("content-type", contentType);
    }
    return headers;
}
function getURL(url, options) {
    const { path } = parseMethodModifier(url);
    if (path !== url) url = `/${path}`;
    let _url;
    try {
        if (url.startsWith("http")) _url = url;
        else {
            let baseURL = options === null || options === void 0 ? void 0 : options.baseURL;
            if (baseURL && !(baseURL === null || baseURL === void 0 ? void 0 : baseURL.endsWith("/"))) baseURL = baseURL + "/";
            if (url.startsWith("/")) _url = new URL(url.substring(1), baseURL);
            else _url = new URL(url, options === null || options === void 0 ? void 0 : options.baseURL);
        }
    } catch (e) {
        if (e instanceof TypeError) {
            if (!(options === null || options === void 0 ? void 0 : options.baseURL)) throw TypeError(`Invalid URL ${url}. Are you passing in a relative url but not setting the baseURL?`);
            throw TypeError(`Invalid URL ${url}. Please validate that you are passing the correct input.`);
        }
        throw e;
    }
    /**
	* Dynamic Parameters.
	*/ if (options === null || options === void 0 ? void 0 : options.params) if (Array.isArray(options === null || options === void 0 ? void 0 : options.params)) {
        const params = (options === null || options === void 0 ? void 0 : options.params) ? Array.isArray(options.params) ? `/${options.params.join("/")}` : `/${Object.values(options.params).join("/")}` : "";
        _url = _url.toString().split("/:")[0];
        _url = `${_url.toString()}${params}`;
    } else for (const [key, value] of Object.entries(options === null || options === void 0 ? void 0 : options.params))_url = _url.toString().replace(`:${key}`, String(value));
    const __url = new URL(_url);
    /**
	* Query Parameters
	*/ const queryParams = options === null || options === void 0 ? void 0 : options.query;
    if (queryParams) for (const [key, value] of Object.entries(queryParams))__url.searchParams.append(key, String(value));
    return __url;
}
function detectContentType(body) {
    if (isJSONSerializable(body)) return "application/json";
    return null;
}
function getMediaType(headers) {
    const contentType = headers.get("content-type");
    return contentType ? contentType.split(";")[0].trim().toLowerCase() : null;
}
function getBody(options, headers) {
    const { body } = options;
    if (!body) return null;
    if (!isJSONSerializable(body)) return body;
    if (typeof body === "string") return body;
    if (getMediaType(headers) === "application/x-www-form-urlencoded") return new URLSearchParams(body).toString();
    return JSON.stringify(body);
}
function getMethod(url, options) {
    if (options === null || options === void 0 ? void 0 : options.method) return options.method.toUpperCase();
    const { method } = parseMethodModifier(url);
    if (method) return method.toUpperCase();
    return (options === null || options === void 0 ? void 0 : options.body) ? "POST" : "GET";
}
function getTimeout(options, controller) {
    let abortTimeout;
    if (!(options === null || options === void 0 ? void 0 : options.signal) && (options === null || options === void 0 ? void 0 : options.timeout)) abortTimeout = setTimeout(()=>controller === null || controller === void 0 ? void 0 : controller.abort(), options === null || options === void 0 ? void 0 : options.timeout);
    return {
        abortTimeout,
        clearTimeout: ()=>{
            if (abortTimeout) clearTimeout(abortTimeout);
        }
    };
}
function bodyParser(data, responseType) {
    if (responseType === "json") return JSON.parse(data);
    return data;
}
var ValidationError = class ValidationError extends Error {
    constructor(issues, message){
        super(message || JSON.stringify(issues, null, 2));
        this.issues = issues;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
};
async function parseStandardSchema(schema, input) {
    const result = await schema["~standard"].validate(input);
    if (result.issues) throw new ValidationError(result.issues);
    return result.value;
}
//#endregion
//#region \0@oxc-project+runtime@0.140.0/helpers/esm/typeof.js
function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
        return typeof o;
    } : function(o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.140.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.140.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.140.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
//#endregion
//#region \0@oxc-project+runtime@0.140.0/helpers/esm/objectSpread2.js
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread2(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
//#endregion
//#region src/fetch.ts
const betterFetch = async (url, options)=>{
    var _opts$signal, _options$body, _options$jsonParser;
    const { hooks, url: __url, options: opts } = await initializePlugins(url, options);
    const fetch = getFetch(opts);
    const controller = new AbortController();
    const signal = (_opts$signal = opts.signal) !== null && _opts$signal !== void 0 ? _opts$signal : controller.signal;
    const _url = getURL$1(__url, opts);
    const headers = await getHeaders(opts);
    const body = getBody(opts, headers);
    const method = getMethod(__url, opts);
    const context = _objectSpread2(_objectSpread2({}, opts), {}, {
        url: _url,
        headers,
        body,
        method,
        signal
    });
    /**
	* Run all on request hooks
	*/ for (const onRequest of hooks.onRequest)if (onRequest) {
        const res = await onRequest(context);
        if (typeof res === "object" && res !== null) Object.assign(context, res);
    }
    if ("pipeTo" in context && typeof context.pipeTo === "function" || typeof (options === null || options === void 0 || (_options$body = options.body) === null || _options$body === void 0 ? void 0 : _options$body.pipe) === "function") {
        if (!("duplex" in context)) context.duplex = "half";
    }
    const { clearTimeout: clearTimeout1 } = getTimeout(opts, controller);
    let response = await fetch(context.url, context);
    clearTimeout1();
    const responseContext = {
        response,
        request: context
    };
    for (const onResponse of hooks.onResponse)if (onResponse) {
        var _options$hookOptions;
        const r = await onResponse(_objectSpread2(_objectSpread2({}, responseContext), {}, {
            response: (options === null || options === void 0 || (_options$hookOptions = options.hookOptions) === null || _options$hookOptions === void 0 ? void 0 : _options$hookOptions.cloneResponse) ? response.clone() : response
        }));
        if (r instanceof Response) response = r;
        else if (typeof r === "object" && r !== null) response = r.response;
    }
    /**
	* OK Branch
	*/ if (response.ok) {
        if (!(context.method !== "HEAD")) return {
            data: "",
            error: null
        };
        const responseType = detectResponseType(response);
        const successContext = {
            data: null,
            response,
            request: context
        };
        if (responseType === "json" || responseType === "text") {
            var _context$jsonParser;
            const text = await response.text();
            successContext.data = await ((_context$jsonParser = context.jsonParser) !== null && _context$jsonParser !== void 0 ? _context$jsonParser : jsonParse)(text);
        } else successContext.data = await response[responseType]();
        /**
		* Parse the data if the output schema is defined
		*/ if (context === null || context === void 0 ? void 0 : context.output) {
            if (context.output && !context.disableValidation) successContext.data = await parseStandardSchema(context.output, successContext.data);
        }
        for (const onSuccess of hooks.onSuccess)if (onSuccess) {
            var _options$hookOptions2;
            await onSuccess(_objectSpread2(_objectSpread2({}, successContext), {}, {
                response: (options === null || options === void 0 || (_options$hookOptions2 = options.hookOptions) === null || _options$hookOptions2 === void 0 ? void 0 : _options$hookOptions2.cloneResponse) ? response.clone() : response
            }));
        }
        if (options === null || options === void 0 ? void 0 : options.throw) return successContext.data;
        return {
            data: successContext.data,
            error: null
        };
    }
    const parser = (_options$jsonParser = options === null || options === void 0 ? void 0 : options.jsonParser) !== null && _options$jsonParser !== void 0 ? _options$jsonParser : jsonParse;
    const responseText = await response.text();
    const isJSONResponse = isJSONParsable(responseText);
    const errorObject = isJSONResponse ? await parser(responseText) : null;
    /**
	* Error Branch
	*/ const errorContext = {
        response,
        responseText,
        request: context,
        error: _objectSpread2(_objectSpread2({}, errorObject), {}, {
            status: response.status,
            statusText: response.statusText
        })
    };
    for (const onError of hooks.onError)if (onError) {
        var _options$hookOptions3;
        await onError(_objectSpread2(_objectSpread2({}, errorContext), {}, {
            response: (options === null || options === void 0 || (_options$hookOptions3 = options.hookOptions) === null || _options$hookOptions3 === void 0 ? void 0 : _options$hookOptions3.cloneResponse) ? response.clone() : response
        }));
    }
    if (options === null || options === void 0 ? void 0 : options.retry) {
        var _options$retryAttempt;
        const retryStrategy = createRetryStrategy(options.retry);
        const _retryAttempt = (_options$retryAttempt = options.retryAttempt) !== null && _options$retryAttempt !== void 0 ? _options$retryAttempt : 0;
        if (await retryStrategy.shouldAttemptRetry(_retryAttempt, response)) {
            for (const onRetry of hooks.onRetry)if (onRetry) await onRetry(responseContext);
            const delay = retryStrategy.getDelay(_retryAttempt);
            await new Promise((resolve)=>setTimeout(resolve, delay));
            return await betterFetch(url, _objectSpread2(_objectSpread2({}, options), {}, {
                retryAttempt: _retryAttempt + 1
            }));
        }
    }
    if (options === null || options === void 0 ? void 0 : options.throw) throw new BetterFetchError(response.status, response.statusText, isJSONResponse ? errorObject : responseText);
    return {
        data: null,
        error: _objectSpread2(_objectSpread2({}, errorObject), {}, {
            status: response.status,
            statusText: response.statusText
        })
    };
};
//#endregion
//#region src/create-fetch/index.ts
const applySchemaPlugin = (config)=>({
        id: "apply-schema",
        name: "Apply Schema",
        version: "1.0.0",
        async init (url, options) {
            var _config$plugins;
            let opts = _objectSpread2(_objectSpread2({}, options), config.query !== void 0 && {
                query: _objectSpread2(_objectSpread2({}, config.query), options === null || options === void 0 ? void 0 : options.query)
            });
            const schema = ((_config$plugins = config.plugins) === null || _config$plugins === void 0 || (_config$plugins = _config$plugins.find((plugin)=>{
                var _plugin$schema;
                return ((_plugin$schema = plugin.schema) === null || _plugin$schema === void 0 ? void 0 : _plugin$schema.config) ? url.startsWith(plugin.schema.config.baseURL || "") || url.startsWith(plugin.schema.config.prefix || "") : false;
            })) === null || _config$plugins === void 0 ? void 0 : _config$plugins.schema) || config.schema;
            if (schema) {
                var _schema$config, _schema$config2;
                let urlKey = url;
                if ((_schema$config = schema.config) === null || _schema$config === void 0 ? void 0 : _schema$config.prefix) {
                    if (urlKey.startsWith(schema.config.prefix)) {
                        urlKey = urlKey.replace(schema.config.prefix, "");
                        if (schema.config.baseURL) url = url.replace(schema.config.prefix, schema.config.baseURL);
                    }
                }
                if ((_schema$config2 = schema.config) === null || _schema$config2 === void 0 ? void 0 : _schema$config2.baseURL) {
                    if (urlKey.startsWith(schema.config.baseURL)) urlKey = urlKey.replace(schema.config.baseURL, "");
                }
                if (urlKey.startsWith("/") && urlKey.charAt(1) === "@") urlKey = urlKey.substring(1);
                const keySchema = schema.schema[urlKey];
                if (keySchema) {
                    var _keySchema$method;
                    const { method: schemaMethod, path } = parseMethodModifier(urlKey);
                    if (schemaMethod) url = url.slice(0, url.length - urlKey.length) + path;
                    let validatedHeaders = options === null || options === void 0 ? void 0 : options.headers;
                    if (keySchema.headers && !(options === null || options === void 0 ? void 0 : options.disableValidation)) {
                        const normalizedHeaders = {};
                        if (options === null || options === void 0 ? void 0 : options.headers) {
                            if (options.headers instanceof Headers) options.headers.forEach((value, key)=>{
                                normalizedHeaders[key.toLowerCase()] = value;
                            });
                            else if (typeof options.headers === "object") {
                                for (const [key, value] of Object.entries(options.headers))if (value !== null && value !== void 0) normalizedHeaders[key.toLowerCase()] = value;
                            }
                        }
                        const validated = await parseStandardSchema(keySchema.headers, normalizedHeaders);
                        const finalHeaders = {};
                        for (const [key, value] of Object.entries(validated))finalHeaders[key.toLowerCase()] = value;
                        validatedHeaders = finalHeaders;
                    }
                    const method = (_keySchema$method = keySchema.method) !== null && _keySchema$method !== void 0 ? _keySchema$method : schemaMethod;
                    opts = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, opts), method !== void 0 && {
                        method
                    }), keySchema.output !== void 0 && {
                        output: keySchema.output
                    }), validatedHeaders !== void 0 && {
                        headers: validatedHeaders
                    });
                    if (!(options === null || options === void 0 ? void 0 : options.disableValidation)) {
                        if (keySchema.query) {
                            opts.query = await parseStandardSchema(keySchema.query, options === null || options === void 0 ? void 0 : options.query);
                            if (opts.query !== null && typeof opts.query === "object") {
                                const defaults = _objectSpread2({}, config.query);
                                for (const key of Object.keys(defaults))if ((options === null || options === void 0 ? void 0 : options.query) && Object.prototype.hasOwnProperty.call(options.query, key)) defaults[key] = options.query[key];
                                opts.query = _objectSpread2(_objectSpread2({}, defaults), opts.query);
                            }
                        }
                        opts = _objectSpread2(_objectSpread2({}, opts), {}, {
                            body: keySchema.input ? await parseStandardSchema(keySchema.input, options === null || options === void 0 ? void 0 : options.body) : options === null || options === void 0 ? void 0 : options.body,
                            params: keySchema.params ? await parseStandardSchema(keySchema.params, options === null || options === void 0 ? void 0 : options.params) : options === null || options === void 0 ? void 0 : options.params
                        });
                    }
                    return {
                        url,
                        options: opts
                    };
                }
            }
            return _objectSpread2({
                url
            }, (options !== void 0 || config.query !== void 0) && {
                options: opts
            });
        }
    });
const createFetch = (config)=>{
    async function $fetch(url, options) {
        const opts = _objectSpread2(_objectSpread2(_objectSpread2({}, config), options), {}, {
            headers: mergeHeaders(config === null || config === void 0 ? void 0 : config.headers, options === null || options === void 0 ? void 0 : options.headers),
            plugins: [
                ...(config === null || config === void 0 ? void 0 : config.plugins) || [],
                applySchemaPlugin(config || {}),
                ...(options === null || options === void 0 ? void 0 : options.plugins) || []
            ]
        });
        if (config === null || config === void 0 ? void 0 : config.catchAllError) try {
            return await betterFetch(url, opts);
        } catch (error) {
            return {
                data: null,
                error: {
                    status: 500,
                    statusText: "Fetch Error",
                    message: "Fetch related error. Captured by catchAllError option. See error property for more details.",
                    error
                }
            };
        }
        return await betterFetch(url, opts);
    }
    return $fetch;
};
;
}),
"[project]/node_modules/.pnpm/@better-auth+telemetry@1.7.7_@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-f_252164e19da40b1450a372125dd49988/node_modules/@better-auth/telemetry/dist/node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTelemetry",
    ()=>createTelemetry,
    "getTelemetryAuthConfig",
    ()=>getTelemetryAuthConfig
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/env/env-impl.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$logger$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+core@1.7.7_@better-auth+utils@0.4.2_@better-fetch+fetch@1.3.2_better-call@_b63585350719241c1657a0f197e58f54/node_modules/@better-auth/core/dist/env/logger.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2$2f$node_modules$2f40$better$2d$fetch$2f$fetch$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-fetch+fetch@1.3.2/node_modules/@better-fetch/fetch/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/base64.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$hash$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/hash.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$random$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@better-auth+utils@0.4.2/node_modules/@better-auth/utils/dist/random.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
//#region src/detectors/detect-auth-config.ts
async function getTelemetryAuthConfig(options, context) {
    return {
        database: context?.database,
        adapter: context?.adapter,
        emailVerification: {
            sendVerificationEmail: !!options.emailVerification?.sendVerificationEmail,
            sendOnSignUp: !!options.emailVerification?.sendOnSignUp,
            sendOnSignIn: !!options.emailVerification?.sendOnSignIn,
            autoSignInAfterVerification: !!options.emailVerification?.autoSignInAfterVerification,
            expiresIn: options.emailVerification?.expiresIn,
            beforeEmailVerification: !!options.emailVerification?.beforeEmailVerification,
            afterEmailVerification: !!options.emailVerification?.afterEmailVerification
        },
        emailAndPassword: {
            enabled: !!options.emailAndPassword?.enabled,
            disableSignUp: !!options.emailAndPassword?.disableSignUp,
            requireEmailVerification: !!options.emailAndPassword?.requireEmailVerification,
            maxPasswordLength: options.emailAndPassword?.maxPasswordLength,
            minPasswordLength: options.emailAndPassword?.minPasswordLength,
            sendResetPassword: !!options.emailAndPassword?.sendResetPassword,
            resetPasswordTokenExpiresIn: options.emailAndPassword?.resetPasswordTokenExpiresIn,
            onPasswordReset: !!options.emailAndPassword?.onPasswordReset,
            password: {
                hash: !!options.emailAndPassword?.password?.hash,
                verify: !!options.emailAndPassword?.password?.verify
            },
            autoSignIn: !!options.emailAndPassword?.autoSignIn,
            revokeSessionsOnPasswordReset: !!options.emailAndPassword?.revokeSessionsOnPasswordReset
        },
        socialProviders: await Promise.all(Object.keys(options.socialProviders || {}).map(async (key)=>{
            const p = options.socialProviders?.[key];
            if (!p) return {};
            const provider = typeof p === "function" ? await p() : p;
            return {
                id: key,
                mapProfileToUser: !!provider.mapProfileToUser,
                disableDefaultScope: !!provider.disableDefaultScope,
                disableIdTokenSignIn: !!provider.disableIdTokenSignIn,
                disableImplicitSignUp: provider.disableImplicitSignUp,
                disableSignUp: provider.disableSignUp,
                getUserInfo: !!provider.getUserInfo,
                overrideUserInfoOnSignIn: !!provider.overrideUserInfoOnSignIn,
                prompt: provider.prompt,
                verifyIdToken: !!provider.verifyIdToken,
                scope: provider.scope,
                refreshAccessToken: !!provider.refreshAccessToken
            };
        })),
        plugins: options.plugins?.map((p)=>p.id.toString()),
        user: {
            modelName: options.user?.modelName,
            fields: options.user?.fields,
            additionalFields: options.user?.additionalFields,
            changeEmail: {
                enabled: options.user?.changeEmail?.enabled,
                sendChangeEmailConfirmation: !!options.user?.changeEmail?.sendChangeEmailConfirmation
            }
        },
        verification: {
            modelName: options.verification?.modelName,
            disableCleanup: options.verification?.disableCleanup,
            fields: options.verification?.fields
        },
        session: {
            modelName: options.session?.modelName,
            additionalFields: options.session?.additionalFields,
            cookieCache: {
                enabled: options.session?.cookieCache?.enabled,
                maxAge: options.session?.cookieCache?.maxAge,
                strategy: options.session?.cookieCache?.strategy
            },
            disableSessionRefresh: options.session?.disableSessionRefresh,
            expiresIn: options.session?.expiresIn,
            fields: options.session?.fields,
            freshAge: options.session?.freshAge,
            preserveSessionInDatabase: options.session?.preserveSessionInDatabase,
            storeSessionInDatabase: options.session?.storeSessionInDatabase,
            updateAge: options.session?.updateAge
        },
        account: {
            modelName: options.account?.modelName,
            fields: options.account?.fields,
            encryptOAuthTokens: options.account?.encryptOAuthTokens,
            updateAccountOnSignIn: options.account?.updateAccountOnSignIn,
            accountLinking: {
                enabled: options.account?.accountLinking?.enabled,
                trustedProviders: options.account?.accountLinking?.trustedProviders,
                updateUserInfoOnLink: options.account?.accountLinking?.updateUserInfoOnLink,
                allowUnlinkingAll: options.account?.accountLinking?.allowUnlinkingAll
            }
        },
        hooks: {
            after: !!options.hooks?.after,
            before: !!options.hooks?.before
        },
        secondaryStorage: !!options.secondaryStorage,
        advanced: {
            cookiePrefix: !!options.advanced?.cookiePrefix,
            cookies: !!options.advanced?.cookies,
            crossSubDomainCookies: {
                domain: !!options.advanced?.crossSubDomainCookies?.domain,
                enabled: options.advanced?.crossSubDomainCookies?.enabled,
                additionalCookies: options.advanced?.crossSubDomainCookies?.additionalCookies
            },
            database: {
                generateId: options.advanced?.database?.generateId,
                defaultFindManyLimit: options.advanced?.database?.defaultFindManyLimit
            },
            useSecureCookies: options.advanced?.useSecureCookies,
            ipAddress: {
                disableIpTracking: options.advanced?.ipAddress?.disableIpTracking,
                ipAddressHeaders: options.advanced?.ipAddress?.ipAddressHeaders
            },
            disableCSRFCheck: options.advanced?.disableCSRFCheck,
            cookieAttributes: {
                expires: options.advanced?.defaultCookieAttributes?.expires,
                secure: options.advanced?.defaultCookieAttributes?.secure,
                sameSite: options.advanced?.defaultCookieAttributes?.sameSite,
                domain: !!options.advanced?.defaultCookieAttributes?.domain,
                path: options.advanced?.defaultCookieAttributes?.path,
                httpOnly: options.advanced?.defaultCookieAttributes?.httpOnly
            }
        },
        trustedOrigins: options.trustedOrigins?.length,
        rateLimit: {
            storage: options.rateLimit?.storage,
            modelName: options.rateLimit?.modelName,
            window: options.rateLimit?.window,
            customStorage: !!options.rateLimit?.customStorage,
            enabled: options.rateLimit?.enabled,
            max: options.rateLimit?.max
        },
        onAPIError: {
            errorURL: options.onAPIError?.errorURL,
            onError: !!options.onAPIError?.onError,
            throw: options.onAPIError?.throw
        },
        logger: {
            disabled: options.logger?.disabled,
            level: options.logger?.level,
            log: !!options.logger?.log
        },
        databaseHooks: {
            user: {
                create: {
                    after: !!options.databaseHooks?.user?.create?.after,
                    before: !!options.databaseHooks?.user?.create?.before
                },
                update: {
                    after: !!options.databaseHooks?.user?.update?.after,
                    before: !!options.databaseHooks?.user?.update?.before
                }
            },
            session: {
                create: {
                    after: !!options.databaseHooks?.session?.create?.after,
                    before: !!options.databaseHooks?.session?.create?.before
                },
                update: {
                    after: !!options.databaseHooks?.session?.update?.after,
                    before: !!options.databaseHooks?.session?.update?.before
                }
            },
            account: {
                create: {
                    after: !!options.databaseHooks?.account?.create?.after,
                    before: !!options.databaseHooks?.account?.create?.before
                },
                update: {
                    after: !!options.databaseHooks?.account?.update?.after,
                    before: !!options.databaseHooks?.account?.update?.before
                }
            },
            verification: {
                create: {
                    after: !!options.databaseHooks?.verification?.create?.after,
                    before: !!options.databaseHooks?.verification?.create?.before
                },
                update: {
                    after: !!options.databaseHooks?.verification?.update?.after,
                    before: !!options.databaseHooks?.verification?.update?.before
                }
            }
        }
    };
}
//#endregion
//#region src/detectors/detect-project-info.ts
function detectPackageManager() {
    const userAgent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].npm_config_user_agent;
    if (!userAgent) return;
    const pmSpec = userAgent.split(" ")[0];
    const separatorPos = pmSpec.lastIndexOf("/");
    const name = pmSpec.substring(0, separatorPos);
    return {
        name: name === "npminstall" ? "cnpm" : name,
        version: pmSpec.substring(separatorPos + 1)
    };
}
//#endregion
//#region src/detectors/detect-system-info.ts
function isCI() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].CI !== "false" && ("BUILD_ID" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "BUILD_NUMBER" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "CI" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "CI_APP_ID" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "CI_BUILD_ID" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "CI_BUILD_NUMBER" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "CI_NAME" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "CONTINUOUS_INTEGRATION" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"] || "RUN_ID" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"]);
}
//#endregion
//#region src/detectors/detect-runtime.ts
function detectRuntime() {
    if (typeof Deno !== "undefined") return {
        name: "deno",
        version: Deno?.version?.deno ?? null
    };
    if (typeof Bun !== "undefined") return {
        name: "bun",
        version: Bun?.version ?? null
    };
    if (typeof process !== "undefined" && process?.versions?.node) return {
        name: "node",
        version: process.versions.node ?? null
    };
    return {
        name: "edge",
        version: null
    };
}
function detectEnvironment() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnvVar"])("NODE_ENV") === "production" ? "production" : isCI() ? "ci" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTest"])() ? "test" : "development";
}
//#endregion
//#region src/utils/hash.ts
async function hashToBase64(data) {
    const buffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$hash$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createHash"])("SHA-256").digest(data);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$base64$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["base64"].encode(buffer);
}
//#endregion
//#region src/utils/id.ts
const generateId = (size)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$utils$40$0$2e$4$2e$2$2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$random$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRandomStringGenerator"])("a-z", "A-Z", "0-9")(size || 32);
};
//#endregion
//#region src/node.ts
let packageJSONCache;
async function readRootPackageJson() {
    if (packageJSONCache) return packageJSONCache;
    try {
        const cwd = process.cwd();
        if (!cwd) return void 0;
        const raw = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(cwd, "package.json"), "utf-8");
        packageJSONCache = JSON.parse(raw);
        return packageJSONCache;
    } catch  {}
}
async function getPackageVersion(pkg) {
    if (packageJSONCache) return packageJSONCache.dependencies?.[pkg] || packageJSONCache.devDependencies?.[pkg] || packageJSONCache.peerDependencies?.[pkg];
    try {
        const cwd = process.cwd();
        if (!cwd) throw new Error("no-cwd");
        const pkgJsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(cwd, "node_modules", pkg, "package.json");
        const raw = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(pkgJsonPath, "utf-8");
        return JSON.parse(raw).version || await getVersionFromLocalPackageJson(pkg) || void 0;
    } catch  {}
    return getVersionFromLocalPackageJson(pkg);
}
async function getVersionFromLocalPackageJson(pkg) {
    const json = await readRootPackageJson();
    if (!json) return void 0;
    return ({
        ...json.dependencies,
        ...json.devDependencies,
        ...json.peerDependencies
    })[pkg];
}
async function getNameFromLocalPackageJson() {
    return (await readRootPackageJson())?.name;
}
async function detectSystemInfo() {
    try {
        const cpus = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].cpus();
        return {
            deploymentVendor: getVendor(),
            systemPlatform: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].platform(),
            systemRelease: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].release(),
            systemArchitecture: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].arch(),
            cpuCount: cpus.length,
            cpuModel: cpus.length ? cpus[0].model : null,
            cpuSpeed: cpus.length ? cpus[0].speed : null,
            memory: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].totalmem(),
            isWSL: await isWsl(),
            isDocker: await isDocker(),
            isTTY: process.stdout ? process.stdout.isTTY : null
        };
    } catch  {
        return {
            systemPlatform: null,
            systemRelease: null,
            systemArchitecture: null,
            cpuCount: null,
            cpuModel: null,
            cpuSpeed: null,
            memory: null,
            isWSL: null,
            isDocker: null,
            isTTY: null
        };
    }
}
function getVendor() {
    const env = process.env;
    const hasAny = (...keys)=>keys.some((k)=>Boolean(env[k]));
    if (hasAny("CF_PAGES", "CF_PAGES_URL", "CF_ACCOUNT_ID") || typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers") return "cloudflare";
    if (hasAny("VERCEL", "VERCEL_URL", "VERCEL_ENV")) return "vercel";
    if (hasAny("NETLIFY", "NETLIFY_URL")) return "netlify";
    if (hasAny("RENDER", "RENDER_URL", "RENDER_INTERNAL_HOSTNAME", "RENDER_SERVICE_ID")) return "render";
    if (hasAny("AWS_LAMBDA_FUNCTION_NAME", "AWS_EXECUTION_ENV", "LAMBDA_TASK_ROOT")) return "aws";
    if (hasAny("GOOGLE_CLOUD_FUNCTION_NAME", "GOOGLE_CLOUD_PROJECT", "GCP_PROJECT", "K_SERVICE")) return "gcp";
    if (hasAny("AZURE_FUNCTION_NAME", "FUNCTIONS_WORKER_RUNTIME", "WEBSITE_INSTANCE_ID", "WEBSITE_SITE_NAME")) return "azure";
    if (hasAny("DENO_DEPLOYMENT_ID", "DENO_REGION")) return "deno-deploy";
    if (hasAny("FLY_APP_NAME", "FLY_REGION", "FLY_ALLOC_ID")) return "fly-io";
    if (hasAny("RAILWAY_STATIC_URL", "RAILWAY_ENVIRONMENT_NAME")) return "railway";
    if (hasAny("DYNO", "HEROKU_APP_NAME")) return "heroku";
    if (hasAny("DO_DEPLOYMENT_ID", "DO_APP_NAME", "DIGITALOCEAN")) return "digitalocean";
    if (hasAny("KOYEB", "KOYEB_DEPLOYMENT_ID", "KOYEB_APP_NAME")) return "koyeb";
    return null;
}
let isDockerCached;
async function hasDockerEnv() {
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync("/.dockerenv");
        return true;
    } catch  {
        return false;
    }
}
async function hasDockerCGroup() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync("/proc/self/cgroup", "utf8").includes("docker");
    } catch  {
        return false;
    }
}
async function isDocker() {
    if (isDockerCached === void 0) isDockerCached = await hasDockerEnv() || await hasDockerCGroup();
    return isDockerCached;
}
let isInsideContainerCached;
const hasContainerEnv = async ()=>{
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync("/run/.containerenv");
        return true;
    } catch  {
        return false;
    }
};
async function isInsideContainer() {
    if (isInsideContainerCached === void 0) isInsideContainerCached = await hasContainerEnv() || await isDocker();
    return isInsideContainerCached;
}
async function isWsl() {
    try {
        if ("TURBOPACK compile-time truthy", 1) return false;
        //TURBOPACK unreachable
        ;
    } catch  {
        return false;
    }
}
let projectIdCached = null;
async function getProjectId(baseUrl) {
    if (projectIdCached) return projectIdCached;
    const projectName = await getNameFromLocalPackageJson();
    if (projectName) {
        projectIdCached = await hashToBase64(baseUrl ? baseUrl + projectName : projectName);
        return projectIdCached;
    }
    if (baseUrl) {
        projectIdCached = await hashToBase64(baseUrl);
        return projectIdCached;
    }
    projectIdCached = generateId(32);
    return projectIdCached;
}
async function detectDatabaseNode() {
    for (const [pkg, name] of Object.entries({
        pg: "postgresql",
        mysql: "mysql",
        mariadb: "mariadb",
        sqlite3: "sqlite",
        "better-sqlite3": "sqlite",
        "@prisma/client": "prisma",
        mongoose: "mongodb",
        mongodb: "mongodb",
        "drizzle-orm": "drizzle"
    })){
        const version = await getPackageVersion(pkg);
        if (version) return {
            name,
            version
        };
    }
}
async function detectFrameworkNode() {
    for (const [pkg, name] of Object.entries({
        next: "next",
        nuxt: "nuxt",
        "react-router": "react-router",
        astro: "astro",
        "@sveltejs/kit": "sveltekit",
        "solid-start": "solid-start",
        "tanstack-start": "tanstack-start",
        hono: "hono",
        express: "express",
        elysia: "elysia",
        expo: "expo"
    })){
        const version = await getPackageVersion(pkg);
        if (version) return {
            name,
            version
        };
    }
}
const noop = async function noop() {};
async function createTelemetry(options, context) {
    const debugEnabled = options.telemetry?.debug || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanEnvVar"])("BETTER_AUTH_TELEMETRY_DEBUG", false);
    const telemetryEndpoint = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ENV"].BETTER_AUTH_TELEMETRY_ENDPOINT;
    if (!telemetryEndpoint && !context?.customTrack) return {
        publish: noop
    };
    const track = async (event)=>{
        if (context?.customTrack) await context.customTrack(event).catch(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$logger$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error);
        else if (telemetryEndpoint) if (debugEnabled) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$logger$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("telemetry event", JSON.stringify(event, null, 2));
        else await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2$2f$node_modules$2f40$better$2d$fetch$2f$fetch$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["betterFetch"])(telemetryEndpoint, {
            method: "POST",
            body: event
        }).catch(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$logger$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error);
    };
    const isEnabled = async ()=>{
        const telemetryEnabled = options.telemetry?.enabled !== void 0 ? options.telemetry.enabled : false;
        return ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBooleanEnvVar"])("BETTER_AUTH_TELEMETRY", false) || telemetryEnabled) && (context?.skipTestCheck || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$better$2d$auth$2b$core$40$1$2e$7$2e$7_$40$better$2d$auth$2b$utils$40$0$2e$4$2e$2_$40$better$2d$fetch$2b$fetch$40$1$2e$3$2e$2_better$2d$call$40$_b63585350719241c1657a0f197e58f54$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$env$2d$impl$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTest"])());
    };
    const enabled = await isEnabled();
    let anonymousId;
    if (enabled) {
        anonymousId = await getProjectId(typeof options.baseURL === "string" ? options.baseURL : void 0);
        track({
            type: "init",
            payload: {
                config: await getTelemetryAuthConfig(options, context),
                runtime: detectRuntime(),
                database: await detectDatabaseNode(),
                framework: await detectFrameworkNode(),
                environment: detectEnvironment(),
                systemInfo: await detectSystemInfo(),
                packageManager: detectPackageManager()
            },
            anonymousId
        });
    }
    return {
        publish: async (event)=>{
            if (!enabled) return;
            if (!anonymousId) anonymousId = await getProjectId(typeof options.baseURL === "string" ? options.baseURL : void 0);
            await track({
                type: event.type,
                payload: event.payload,
                anonymousId
            });
        }
    };
}
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0kqr_.c._.js.map