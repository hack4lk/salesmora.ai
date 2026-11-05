import { createServer, request as upstreamRequest } from 'node:http';
import { isIP } from 'node:net';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
const bytesLimit = 262144;
const responseHeaders = new Set(['content-type', 'content-length', 'content-encoding', 'cache-control', 'vary', 'content-security-policy', 'referrer-policy', 'permissions-policy', 'x-frame-options', 'x-content-type-options', 'x-robots-tag', 'cross-origin-resource-policy', 'retry-after', 'link']);
export function gatewayConfiguration(env = process.env) {
  let origin, backend;
  try { origin = new URL(env.CAPTURE_PUBLIC_ORIGIN ?? ''); backend = new URL(env.CAPTURE_UPSTREAM_URL ?? ''); }
  catch { throw Error('Configure canonical forms and upstream URLs.'); }
  const local = env.NODE_ENV !== 'production';
  if (origin.origin !== env.CAPTURE_PUBLIC_ORIGIN || origin.username || origin.password || !(origin.protocol === 'https:' || local && origin.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(origin.hostname))) throw Error('Invalid forms origin.');
  if (backend.protocol !== 'http:' || backend.username || backend.password || backend.pathname !== '/' || backend.search || backend.hash || !(/^[a-z][a-z0-9-]*\.railway\.internal$/.test(backend.hostname) || local && ['127.0.0.1', 'localhost'].includes(backend.hostname))) throw Error('Configure a private web upstream.');
  const key = Buffer.from(env.CAPTURE_INGRESS_SECRET ?? '', 'base64');
  if (key.length !== 32 || key.toString('base64') !== env.CAPTURE_INGRESS_SECRET) throw Error('Configure an independent ingress secret.');
  const inflight = Number(env.CAPTURE_GATEWAY_MAX_INFLIGHT ?? 32);
  if (!Number.isSafeInteger(inflight) || inflight < 1 || inflight > 128) throw Error('Invalid gateway concurrency budget.');
  if (env.CAPTURE_GATEWAY_EDGE !== 'railway') throw Error('Configure the reviewed Railway HTTPS edge.');
  return { origin: origin.origin, authority: origin.host, backend, ingressKey: key.toString('base64'), inflight };
}
/** Inspect the raw target before URL normalization can erase traversal. */
export function gatewayRoute(target, method) {
  if (typeof target !== 'string' || target.length > 4096 || !target.startsWith('/') || /[\\#\x00-\x20\x7f]/.test(target)) return false;
  const path = target.split('?')[0];
  if (/(^|\/)\.{1,2}(\/|$)|%(2e|2f|5c|25)/i.test(path)) return false;
  const api = /^\/api\/public\/capture\/[a-f0-9]{64}$/.test(path);
  if (method === 'POST') return api;
  if (!['GET', 'HEAD'].includes(method)) return false;
  return api || /^\/(f|embed)\/[a-f0-9]{64}$/.test(path) || path === '/embed.js' || /^\/_next\/static\/[A-Za-z0-9_./%()[\]@~-]+$/.test(path);
}
function reply(response, status, state = 'retry') {
  if (response.headersSent) { response.destroy(); return; }
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Connection': 'close' }); response.end(JSON.stringify({ state }));
}
async function body(request) {
  let size = 0; const chunks = [];
  for await (const chunk of request.iterator({ destroyOnReturn: false })) { size += chunk.length; if (size > bytesLimit) throw new RangeError('Body too large.'); chunks.push(chunk); }
  return Buffer.concat(chunks);
}
/** Railway edge is the only supported public ingress. Private project callers are trusted infrastructure. */
export function createFormsGateway(config) {
  let active = 0;
  const server = createServer({ maxHeaderSize: 16384, requestTimeout: 10000, headersTimeout: 10000, keepAliveTimeout: 5000 }, async (request, response) => {
    if (request.url === '/healthz' && ['GET', 'HEAD'].includes(request.method)) { response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end('{"status":"ok"}'); return; }
    if (request.headers.host?.toLowerCase() !== config.authority || !gatewayRoute(request.url, request.method)) { reply(response, 404, 'unavailable'); return; }
    // X-Real-IP is overwritten by Railway's public edge. Never use an arbitrary XFF chain.
    const ip = request.headers['x-real-ip'];
    if (request.headers['x-forwarded-proto'] !== 'https' || !request.headers['x-railway-edge'] || typeof ip !== 'string' || !isIP(ip)) { reply(response, 503); return; }
    if (request.method === 'POST' && (request.headers.origin !== config.origin || !request.headers['content-type']?.startsWith('application/json'))) { reply(response, 403, 'invalid'); return; }
    if (active >= config.inflight) { response.setHeader('Retry-After', '1'); reply(response, 503); return; }
    active++; let upstream;
    const deadline = setTimeout(() => { upstream?.destroy(); reply(response, 504); }, 35000);
    try {
      const size = request.headers['content-length'];
      if (size && (!/^\d+$/.test(size) || Number(size) > bytesLimit)) { reply(response, 413, 'invalid'); return; }
      const payload = await body(request);
      if (request.method !== 'POST' && payload.length) { reply(response, 400, 'invalid'); return; }
      // A new allowlisted header set discards cookies, Authorization, forwarded claims and visitor ingress keys.
      const headers = { host: config.authority, 'x-forwarded-proto': 'https', 'x-real-ip': ip, 'x-capture-ingress-key': config.ingressKey };
      for (const name of ['accept', 'accept-encoding', 'content-type', 'origin']) if (typeof request.headers[name] === 'string') headers[name] = request.headers[name];
      if (request.method === 'POST') headers['content-length'] = String(payload.length);
      await new Promise((resolve, reject) => {
        upstream = upstreamRequest(config.backend, { path: request.url, method: request.method, headers, timeout: 30000 }, incoming => {
          if (!incoming.statusCode || incoming.statusCode >= 300 && incoming.statusCode < 400) { incoming.resume(); reply(response, 502); resolve(); return; }
          const forwarded = Object.fromEntries(Object.entries(incoming.headers).filter(([name]) => responseHeaders.has(name)));
          response.writeHead(incoming.statusCode, forwarded);
          void pipeline(incoming, response).then(resolve, reject);
        });
        upstream.on('timeout', () => upstream.destroy(Error('Upstream timeout.'))); upstream.on('error', reject);
        response.once('close', () => { if (!response.writableFinished) upstream?.destroy(); });
        upstream.end(payload);
      });
    } catch (error) { reply(response, error instanceof RangeError ? 413 : 502, error instanceof RangeError ? 'invalid' : 'retry'); }
    finally { clearTimeout(deadline); upstream?.destroy(); active--; }
  });
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createFormsGateway(gatewayConfiguration());
  const port = Number(process.env.PORT ?? 8080); if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw Error('Invalid listener port.');
  server.listen(port, '::', () => console.log(JSON.stringify({ event: 'forms_gateway.ready' })));
  let closing = false;
  const stop = () => { if (closing) return; closing = true; server.close(() => process.exit(0)); setTimeout(() => { server.closeAllConnections(); process.exit(1); }, 35000).unref(); };
  process.once('SIGTERM', stop); process.once('SIGINT', stop);
}
