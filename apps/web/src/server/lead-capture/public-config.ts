export type CapturePublicConfig = { origin: string; authority: string; hostname: string };
/** A canonical origin is deployment configuration, never derived from Host/forwarded headers. */
export function capturePublicConfig(env: Record<string, string | undefined> = process.env): CapturePublicConfig | null {
  try {
    if (!env.CAPTURE_PUBLIC_ORIGIN || !env.BETTER_AUTH_URL) return null;
    const url = new URL(env.CAPTURE_PUBLIC_ORIGIN), app = new URL(env.BETTER_AUTH_URL);
    const loopback = ['localhost', '127.0.0.1'].includes(url.hostname);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || !['https:', 'http:'].includes(url.protocol) || url.hostname === app.hostname || url.origin === app.origin) return null;
    if (url.protocol !== 'https:' && (env.NODE_ENV === 'production' || !loopback)) return null;
    if (env.NODE_ENV === 'production' && loopback) return null;
    return { origin: url.origin, authority: url.host, hostname: url.hostname };
  } catch { return null; }
}
export function captureRequestSurface(host: string | null, pathname: string, method: string, config: CapturePublicConfig | null, development = false) {
  const authority = host?.toLowerCase();
  const reserved = ['forms.salesmora.ai', 'forms-staging.salesmora.ai'].includes(authority?.split(':')[0]?.replace(/\.$/, '') ?? '');
  const publicHost = !!config && authority === config.authority;
  if (!publicHost && !reserved) return (/^\/(f|embed)(\/|$)/.test(pathname) || pathname === '/embed.js') || /^\/api\/public\/capture(\/|$)/.test(pathname) ? 'reject' : 'application';
  if (!config || !publicHost) return 'unconfigured';
  if (pathname.includes('\\') || /(^|\/)\.{1,2}(\/|$)|%(2e|2f|5c|25)/i.test(pathname)) return 'reject';
  if (/^\/api\/public\/capture\/[a-f0-9]{64}$/.test(pathname)) return ['GET', 'HEAD', 'POST'].includes(method) ? 'api' : 'reject';
  if (!['GET', 'HEAD'].includes(method)) return 'reject';
  if (pathname === '/embed.js') return 'loader';
  if (/^\/(f|embed)\/[a-f0-9]{64}$/.test(pathname)) return pathname.startsWith('/embed/') ? 'embed' : 'hosted';
  if (pathname.startsWith('/_next/static/') || development && pathname === '/_next/webpack-hmr') return 'asset';
  return 'reject';
}
export function capturePublicHeaders(embedded: boolean, nonce: string, development = false, turnstile = false) {
  const scripts = `'self' 'nonce-${nonce}'${turnstile ? ' https://challenges.cloudflare.com' : ''}${development ? " 'unsafe-eval'" : ''}`;
  return { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': `default-src 'self'; script-src ${scripts}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'${development ? ' ws://localhost:* ws://127.0.0.1:*' : ''}; frame-src ${turnstile ? 'https://challenges.cloudflare.com' : "'none'"}; frame-ancestors ${embedded ? 'https: http:' : "'none'"}; form-action 'self'; base-uri 'none'; object-src 'none'`,
    ...(!embedded ? { 'X-Frame-Options': 'DENY' } : {}),
  };
}
