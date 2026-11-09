module.exports = [
"[project]/apps/web/src/server/lead-capture/public-config.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "capturePublicConfig",
    ()=>capturePublicConfig,
    "capturePublicHeaders",
    ()=>capturePublicHeaders,
    "captureRequestSurface",
    ()=>captureRequestSurface
]);
function capturePublicConfig(env = process.env) {
    try {
        if (!env.CAPTURE_PUBLIC_ORIGIN || !env.BETTER_AUTH_URL) return null;
        const url = new URL(env.CAPTURE_PUBLIC_ORIGIN), app = new URL(env.BETTER_AUTH_URL);
        const loopback = [
            'localhost',
            '127.0.0.1'
        ].includes(url.hostname);
        if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || ![
            'https:',
            'http:'
        ].includes(url.protocol) || url.hostname === app.hostname || url.origin === app.origin) return null;
        if (url.protocol !== 'https:' && (env.NODE_ENV === 'production' || !loopback)) return null;
        if (env.NODE_ENV === 'production' && loopback) return null;
        return {
            origin: url.origin,
            authority: url.host,
            hostname: url.hostname
        };
    } catch  {
        return null;
    }
}
function captureRequestSurface(host, pathname, method, config, development = false) {
    const authority = host?.toLowerCase();
    const reserved = [
        'forms.salesmora.ai',
        'forms-staging.salesmora.ai'
    ].includes(authority?.split(':')[0]?.replace(/\.$/, '') ?? '');
    const publicHost = !!config && authority === config.authority;
    if (!publicHost && !reserved) return /^\/(f|embed)(\/|$)/.test(pathname) || pathname === '/embed.js' || /^\/api\/public\/capture(\/|$)/.test(pathname) ? 'reject' : 'application';
    if (!config || !publicHost) return 'unconfigured';
    if (pathname.includes('\\') || /(^|\/)\.{1,2}(\/|$)|%(2e|2f|5c|25)/i.test(pathname)) return 'reject';
    if (/^\/api\/public\/capture\/[a-f0-9]{64}$/.test(pathname)) return [
        'GET',
        'HEAD',
        'POST'
    ].includes(method) ? 'api' : 'reject';
    if (![
        'GET',
        'HEAD'
    ].includes(method)) return 'reject';
    if (pathname === '/embed.js') return 'loader';
    if (/^\/(f|embed)\/[a-f0-9]{64}$/.test(pathname)) return pathname.startsWith('/embed/') ? 'embed' : 'hosted';
    if (pathname.startsWith('/_next/static/') || development && pathname === '/_next/webpack-hmr') return 'asset';
    return 'reject';
}
function capturePublicHeaders(embedded, nonce, development = false, turnstile = false) {
    const scripts = `'self' 'nonce-${nonce}'${turnstile ? ' https://challenges.cloudflare.com' : ''}${development ? " 'unsafe-eval'" : ''}`;
    return {
        'Cache-Control': 'private, no-store',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'X-Content-Type-Options': 'nosniff',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': `default-src 'self'; script-src ${scripts}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'${development ? ' ws://localhost:* ws://127.0.0.1:*' : ''}; frame-src ${turnstile ? 'https://challenges.cloudflare.com' : "'none'"}; frame-ancestors ${embedded ? 'https: http:' : "'none'"}; form-action 'self'; base-uri 'none'; object-src 'none'`,
        ...!embedded ? {
            'X-Frame-Options': 'DENY'
        } : {}
    };
}
}),
"[project]/apps/web/src/server/lead-capture/submission-policy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "captureClientIdentity",
    ()=>captureClientIdentity,
    "captureInstallationOrigin",
    ()=>captureInstallationOrigin,
    "captureSubmissionPolicy",
    ()=>captureSubmissionPolicy,
    "captureWebsiteDeliveryPolicy",
    ()=>captureWebsiteDeliveryPolicy
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$delivery$2d$policy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/delivery-policy.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$public$2d$config$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/lead-capture/public-config.ts [middleware] (ecmascript)");
;
;
;
;
function secret(value) {
    if (!value) return null;
    const key = Buffer.from(value, 'base64');
    return key.length === 32 && key.toString('base64') === value ? key : null;
}
function integer(value, fallback) {
    const n = value === undefined || value === '' ? fallback : Number(value);
    return n !== undefined && Number.isSafeInteger(n) && n > 0 && n <= 1000000000000 ? n : null;
}
function captureSubmissionPolicy(env = process.env) {
    const publicConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$public$2d$config$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["capturePublicConfig"])(env);
    if (!publicConfig || env.CAPTURE_SUBMISSIONS_ENABLED !== 'true') return null;
    const local = env.NODE_ENV !== 'production' && [
        'localhost',
        '127.0.0.1'
    ].includes(publicConfig.hostname);
    const abuseKey = secret(env.CAPTURE_ABUSE_SECRET), contextKey = secret(env.CAPTURE_CONTEXT_SECRET);
    if (!abuseKey || !contextKey || abuseKey.equals(contextKey)) return null;
    const siteKey = env.TURNSTILE_SITE_KEY, providerSecret = env.TURNSTILE_SECRET_KEY;
    if (!siteKey || !/^[A-Za-z0-9_-]{1,200}$/.test(siteKey) || !providerSecret || providerSecret.length < 10 || providerSecret.length > 2000) return null;
    const mode = env.CAPTURE_CLIENT_IP_MODE;
    const ingressKey = secret(env.CAPTURE_INGRESS_SECRET), ipHeader = env.CAPTURE_TRUSTED_IP_HEADER?.toLowerCase();
    if (mode === 'loopback' ? !local : mode !== 'verified-header' || !ingressKey || !ipHeader || ![
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip'
    ].includes(ipHeader)) return null;
    if (mode === 'verified-header' && ingressKey && (ingressKey.equals(abuseKey) || ingressKey.equals(contextKey))) return null;
    const requestsPerMinute = integer(env.CAPTURE_REQUESTS_PER_MINUTE, local ? 300 : undefined), sourceRequestsPerMinute = integer(env.CAPTURE_SOURCE_REQUESTS_PER_MINUTE, local ? 100 : undefined), maxPendingItems = integer(env.CAPTURE_MAX_PENDING_ITEMS, local ? 10000 : undefined), maxRetainedBytes = integer(env.CAPTURE_MAX_RETAINED_BYTES, local ? 67108864 : undefined);
    const challengeAfter = integer(env.CAPTURE_CHALLENGE_AFTER, 5), hardLimit = integer(env.CAPTURE_ATTEMPT_LIMIT, 20);
    if (!requestsPerMinute || requestsPerMinute > 1000000 || !sourceRequestsPerMinute || sourceRequestsPerMinute > 1000000 || !maxPendingItems || !maxRetainedBytes || !challengeAfter || !hardLimit || challengeAfter >= hardLimit || hardLimit > 10000) return null;
    let verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    if (env.CAPTURE_TURNSTILE_TEST_ORIGIN) {
        try {
            const test = new URL(env.CAPTURE_TURNSTILE_TEST_ORIGIN);
            if (!local || env.SALESMORA_TEST_SERVER !== '1' || test.protocol !== 'http:' || ![
                'localhost',
                '127.0.0.1'
            ].includes(test.hostname) || test.pathname !== '/' || test.username || test.password || test.search || test.hash) return null;
            verifyURL = `${test.origin}/siteverify`;
        } catch  {
            return null;
        }
    }
    const limits = {
        challengeAfter,
        hardLimit,
        sourceRequestsPerMinute,
        maxPendingItems,
        maxRetainedBytes
    };
    return {
        ...publicConfig,
        abuseKey,
        siteKey,
        providerSecret,
        mode,
        ingressKey,
        ipHeader,
        requestsPerMinute,
        limits,
        verifyURL
    };
}
function captureClientIdentity(headers, publicKey, policy) {
    let ip = '127.0.0.1';
    if (policy.mode === 'verified-header') {
        const supplied = Buffer.from(headers.get('x-capture-ingress-key') ?? '', 'base64');
        if (!policy.ingressKey || supplied.length !== policy.ingressKey.length || !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(supplied, policy.ingressKey)) return null;
        ip = headers.get(policy.ipHeader)?.trim() ?? '';
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(ip)) return null;
        if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(ip) === 6) ip = new URL(`http://[${ip}]/`).hostname.slice(1, -1).toLowerCase();
    }
    return {
        ip,
        clientHash: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])('sha256', policy.abuseKey).update(`${publicKey}\0${ip}`).digest('hex')
    };
}
function captureWebsiteDeliveryPolicy(env = process.env) {
    if (env.CAPTURE_WEBSITE_PUBLICATION_ENABLED !== 'true') return null;
    if (env.NODE_ENV === 'production' && (env.SALESMORA_TEST_SERVER || env.CAPTURE_TURNSTILE_TEST_ORIGIN || env.TEST_DATABASE_URL)) return null;
    const workspaces = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$delivery$2d$policy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["capturePublicationWorkspaces"])(env.CAPTURE_PUBLICATION_WORKSPACE_IDS), policy = captureSubmissionPolicy(env);
    return workspaces?.length && policy ? {
        workspaces,
        origin: policy.origin
    } : null;
}
function captureInstallationOrigin(env = process.env, workspaceId) {
    const policy = captureWebsiteDeliveryPolicy(env);
    if (workspaceId && policy?.workspaces.includes(workspaceId)) return policy.origin;
    const local = captureSubmissionPolicy(env);
    return env.CAPTURE_WEBSITE_PUBLICATION_ENABLED === undefined && env.NODE_ENV !== 'production' && local && [
        'localhost',
        '127.0.0.1'
    ].includes(local.hostname) ? local.origin : undefined;
}
}),
"[project]/apps/web/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.64.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$public$2d$config$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/lead-capture/public-config.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$submission$2d$policy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/lead-capture/submission-policy.ts [middleware] (ecmascript)");
;
;
;
;
function proxy(request) {
    const development = ("TURBOPACK compile-time value", "development") === 'development', config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$public$2d$config$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["capturePublicConfig"])();
    const surface = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$public$2d$config$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["captureRequestSurface"])(request.headers.get('host'), request.nextUrl.pathname, request.method, config, development);
    if (surface === 'application') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const nonce = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(18).toString('base64'), headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$public$2d$config$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["capturePublicHeaders"])(surface === 'embed', nonce, development, !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$lead$2d$capture$2f$submission$2d$policy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["captureSubmissionPolicy"])());
    if (surface === 'reject' || surface === 'unconfigured') return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"](surface === 'unconfigured' ? 'Requests are temporarily unavailable.' : 'Not found.', {
        status: surface === 'unconfigured' ? 503 : 404,
        headers
    });
    const forwarded = new Headers(request.headers);
    // Public rendering never consumes app sessions, including deliberately supplied domain cookies.
    forwarded.delete('cookie');
    forwarded.delete('authorization');
    forwarded.delete('x-forwarded-host');
    forwarded.set('Content-Security-Policy', headers['Content-Security-Policy']);
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$64$2e$0_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: forwarded
        }
    });
    for (const [key, value] of Object.entries(headers))response.headers.set(key, value);
    return response;
}
const config = {
    matcher: '/:path*'
};
}),
];

//# sourceMappingURL=apps_web_src_0qq5dyt._.js.map