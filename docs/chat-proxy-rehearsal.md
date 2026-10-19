# Local streaming proxy rehearsal

This opt-in Docker proxy forwards **only to the isolated test server on port 3002**, using a fictional provider and `_test` database. Proxy mode explicitly disables live evaluation even if the caller has enabled that flag. It does not front the normal app on port 3000, change the main Docker services, enable production chat or make paid provider calls.

## Run

Start the normal local PostgreSQL/Redis services first, then:

```sh
docker compose -f compose.chat-proxy.yaml up -d --wait
pnpm --filter @salesmora/web test:proxy
docker compose -f compose.chat-proxy.yaml down
```

The test runner starts its own Next.js server and migrates the isolated test database. Keep ports 3002 and 3006 free, and do not run other browser/worker tests concurrently: browser suites reset the test database. Port 3003 is loopback-only. `host.docker.internal` forwards container requests to the host; this rehearsal is validated with Docker Desktop on macOS. Linux host-loopback reachability can differ and needs its own network validation.

The image is pinned to the resolved official Nginx digest in `compose.chat-proxy.yaml`. The proxy is read-only with temporary runtime directories, no request/access logs, and only critical error logging. It contains no application/provider/database credentials. Stop it after the rehearsal; it exposes fault injection routes intended only for these tests.

## Transport settings and fault injection

`infra/chat-proxy/nginx.conf` uses HTTP/1.1, preserves the public Host and Origin rather than rewriting Origin, disables response/request buffering and compression, disables proxy caching, and closes upstream work on client disconnect. Its 120-second upstream inactivity timeout exceeds the application's 90-second deadline; server heartbeat comments arrive every ten seconds. The development HMR WebSocket is forwarded separately; omitting it can trigger page reloads and invalidate browser stream measurements. Application SSE responses also send `Cache-Control: no-store, no-transform` and `X-Accel-Buffering: no`.

- `/api/chat/turns`: normal unbuffered stream through the proxy.
- `/__proxy-buffered/api/chat/turns`: deliberately enables buffering, ignores the application's buffering header, and passes through a test-only intermediary that holds the full response. Nginx buffering alone can still flush short frames, so it is not a deterministic negative control. This negative control must deliver the response only after the durable turn completes; the normal route must deliver Thinking while the turn is still active.
- `/__proxy-timeout/api/chat/turns`: two-second proxy idle timeout, before the quiet fictional provider's first token. The browser must treat this as incomplete transport, the durable run must cancel, and explicit retry must work.

`fixture:timeout` waits 95 seconds in the already guarded test provider. The test runs the **real application 90-second deadline**, with no deadline override, and expects an explicit persisted `turn.failed` / `timeout` event across the proxy. The provider fixture remains unavailable in production and outside the isolated marked test server.

## Coverage and files

`playwright.proxy.config.ts` selects the existing chat API/UI/action suites plus `chat-proxy.spec.ts`, uses the public proxy origin for authentication and mutation checks, and starts one isolated server. `scripts/e2e-server.mjs` changes the auth origin only when the proxy-test flag is set. Existing direct browser suites keep their normal port 3002 behavior.

The rehearsal checks incremental Thinking/deltas, heartbeat delivery, persisted Stop and client disconnect, retained partial output/history, replay and lost-acceptance recovery, proxy and application timeouts, explicit UI retry, monthly allowance denial without bypass, and lead proposal confirmation idempotency after a lost response. Real provider adapters remain covered by their separate accounting/cancellation tests; fictional proxy checks do not establish provider cancellation billing behavior.

## Staging follow-up

Repeat the transport/security scenarios through the actual hosting/CDN/TLS chain before enabling chat. Verify SSE is not buffered/compressed/cached there, public-origin validation works without trusting a forged Origin, load balancer/server timeouts accommodate the deadline/heartbeats, disconnect reaches the app, and failed attempts retain conservative usage reservations. Observe first-event/token latency and total runtime. Keep fault injection paths and test-provider flags out of production configuration; use approved fictional staging accounts and reviewed budget limits. Local proxy success does not validate the hosting platform.

## Verified October 12, 2026

All 26 proxy browser checks passed: 25 in the final regression run, plus the real 90-second deadline check in an isolated run. The buffered control also passed in both final runs. All 358 unit tests, lint, workspace type checking and web production build passed. Initial harness failures exposed Playwright server-config merging, development HMR forwarding and nondeterministic Nginx-only buffering assumptions; the final configuration addresses those issues. No unresolved transport failures remain in the local rehearsal. The opt-in proxy was stopped afterward.
