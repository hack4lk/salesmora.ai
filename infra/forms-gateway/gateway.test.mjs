import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { createFormsGateway, gatewayConfiguration, gatewayRoute } from './gateway.mjs';
const key = Buffer.alloc(32, 4).toString('base64');
const policy = { NODE_ENV: 'production', CAPTURE_PUBLIC_ORIGIN: 'https://forms.salesmora.ai', CAPTURE_UPSTREAM_URL: 'http://web.railway.internal:3000', CAPTURE_INGRESS_SECRET: key, CAPTURE_GATEWAY_EDGE: 'railway' };
const path = `/api/public/capture/${'a'.repeat(64)}`;
const claims = { host: 'forms.salesmora.ai', 'x-real-ip': '198.51.100.4', 'x-forwarded-proto': 'https', 'x-railway-edge': 'fixture-pop' };
function send(port, method, target, headers = claims, chunks = []) {
  return new Promise((resolve, reject) => {
    const call = request({ host: '127.0.0.1', port, method, path: target, headers }, incoming => { const data = []; incoming.on('data', chunk => data.push(chunk)); incoming.on('end', () => resolve({ status: incoming.statusCode, headers: incoming.headers, body: Buffer.concat(data).toString() })); });
    call.on('error', reject); for (const chunk of chunks) call.write(chunk); call.end();
  });
}
async function listen(server) { server.listen(0, '127.0.0.1'); await once(server, 'listening'); return server.address().port; }
async function close(server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
test('configuration refuses public upstreams, noncanonical origins, weak keys and unreviewed edges', () => {
  assert.equal(gatewayConfiguration(policy).authority, 'forms.salesmora.ai');
  assert.throws(() => gatewayConfiguration({ ...policy, CAPTURE_UPSTREAM_URL: 'http://user:secret@[' }), error => !error.message.includes('user:secret'));
  for (const change of [{ CAPTURE_UPSTREAM_URL: 'https://web.example.com' }, { CAPTURE_UPSTREAM_URL: 'http://127.0.0.1:3000' }, { CAPTURE_UPSTREAM_URL: 'http://user:secret@web.railway.internal:3000' }, { CAPTURE_PUBLIC_ORIGIN: 'http://forms.salesmora.ai' }, { CAPTURE_PUBLIC_ORIGIN: 'https://forms.salesmora.ai/path' }, { CAPTURE_INGRESS_SECRET: 'weak' }, { CAPTURE_GATEWAY_EDGE: '' }, { CAPTURE_GATEWAY_MAX_INFLIGHT: '0' }]) assert.throws(() => gatewayConfiguration({ ...policy, ...change }));
});
test('raw routing rejects private paths, traversal, invalid keys and unsupported methods', () => {
  assert.equal(gatewayRoute('/api/internal/lead-capture/readiness', 'POST'), false);
  for (const target of ['/api/auth/get-session', '/login', '/_next/static/../api/auth', '/_next/static/%2e%2e/api/auth', '/_next/static/%252fapi/auth', '/embed/invalid', '/f/../login', '/f/%2f', '//login']) assert.equal(gatewayRoute(target, 'GET'), false);
  assert.equal(gatewayRoute(path, 'POST'), true); assert.equal(gatewayRoute('/embed.js', 'POST'), false); assert.equal(gatewayRoute(path, 'DELETE'), false); assert.equal(gatewayRoute('/_next/static/chunks/a.js?dpl=v1', 'GET'), true);
});
test('live proxy strips claims and sessions, preserves safe response policies and never redirects', async () => {
  const received = []; let redirect = false;
  const backend = createServer(async (incoming, response) => { let payload = ''; for await (const chunk of incoming) payload += chunk; received.push({ headers: incoming.headers, path: incoming.url, payload }); response.writeHead(redirect ? 302 : 200, { 'Content-Type': 'application/json', 'Content-Security-Policy': "default-src 'self'", 'Cache-Control': 'private, no-store', 'Set-Cookie': 'private=secret', 'Location': 'https://example.test/login' }); response.end('{"state":"accepted"}'); });
  const backendPort = await listen(backend), config = gatewayConfiguration({ ...policy, NODE_ENV: 'development', CAPTURE_UPSTREAM_URL: `http://127.0.0.1:${backendPort}` }), gateway = createFormsGateway(config), port = await listen(gateway);
  try {
    assert.equal((await send(port, 'GET', '/healthz', { host: 'probe.internal' })).status, 200);
    const result = await send(port, 'POST', path, { ...claims, origin: policy.CAPTURE_PUBLIC_ORIGIN, 'content-type': 'application/json', cookie: 'session=private', authorization: 'Bearer private', 'x-forwarded-for': '203.0.113.99', 'cf-connecting-ip': '203.0.113.99', 'x-capture-ingress-key': 'visitor-forgery' }, ['{"requestId":"fixture"}']);
    assert.equal(result.status, 200); assert.equal(result.headers['content-security-policy'], "default-src 'self'"); assert.equal(result.headers['set-cookie'], undefined); assert.equal(result.headers.location, undefined);
    assert.equal(received[0].headers['x-capture-ingress-key'], key); assert.equal(received[0].headers['x-real-ip'], claims['x-real-ip']); assert.equal(received[0].headers.host, 'forms.salesmora.ai'); assert.equal(received[0].path, path); assert.equal(received[0].payload, '{"requestId":"fixture"}');
    for (const header of ['cookie', 'authorization', 'x-forwarded-for', 'cf-connecting-ip']) assert.equal(received[0].headers[header], undefined);
    for (const headers of [{ ...claims, host: 'app.salesmora.ai' }, { ...claims, 'x-real-ip': '198.51.100.4, 10.0.0.1' }, { ...claims, 'x-forwarded-proto': 'http' }, { ...claims, 'x-railway-edge': '' }]) assert.notEqual((await send(port, 'GET', '/embed.js', headers)).status, 200);
    assert.equal((await send(port, 'GET', '/api/auth/get-session')).status, 404);
    assert.equal((await send(port, 'POST', '/api/internal/lead-capture/readiness')).status, 404);
    assert.equal((await send(port, 'POST', path, { ...claims, origin: 'https://evil.test', 'content-type': 'application/json' }, ['{}'])).status, 403);
    assert.equal((await send(port, 'POST', path, { ...claims, origin: policy.CAPTURE_PUBLIC_ORIGIN, 'content-type': 'application/json', 'content-length': '262145' })).status, 413);
    assert.equal((await send(port, 'POST', path, { ...claims, origin: policy.CAPTURE_PUBLIC_ORIGIN, 'content-type': 'application/json' }, [Buffer.alloc(262145)])).status, 413);
    assert.equal(received.length, 1); redirect = true; assert.equal((await send(port, 'GET', '/embed.js')).status, 502);
  } finally { await close(gateway); await close(backend); }
});
test('upstream failure never fabricates an accepted reply', async () => {
  const backend = createServer((_incoming, response) => response.destroy()), backendPort = await listen(backend);
  const gateway = createFormsGateway(gatewayConfiguration({ ...policy, NODE_ENV: 'development', CAPTURE_UPSTREAM_URL: `http://127.0.0.1:${backendPort}` })), port = await listen(gateway);
  try { const result = await send(port, 'GET', '/embed.js'); assert.equal(result.status, 502); assert.deepEqual(JSON.parse(result.body), { state: 'retry' }); } finally { await close(gateway); await close(backend); }
});
test('concurrency refuses overload while liveness remains available and slots recover', async () => {
  let entered, release; const started = new Promise(resolve => { entered = resolve; }), finish = new Promise(resolve => { release = resolve; });
  const backend = createServer(async (_incoming, response) => { entered(); await finish; response.end('ok'); }), backendPort = await listen(backend);
  const gateway = createFormsGateway(gatewayConfiguration({ ...policy, NODE_ENV: 'development', CAPTURE_UPSTREAM_URL: `http://127.0.0.1:${backendPort}`, CAPTURE_GATEWAY_MAX_INFLIGHT: '1' })), port = await listen(gateway);
  try {
    const first = send(port, 'GET', '/embed.js'); await started;
    const overloaded = await send(port, 'GET', '/embed.js'); assert.equal(overloaded.status, 503); assert.equal(overloaded.headers['retry-after'], '1'); assert.equal((await send(port, 'GET', '/healthz')).status, 200);
    release(); assert.equal((await first).status, 200); assert.equal((await send(port, 'GET', '/embed.js')).status, 200);
  } finally { release(); await close(gateway); await close(backend); }
});
