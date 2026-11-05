# Lead Capture integration step 4e — embed loader and installation

Implemented November 1, 2026 after user approval of 4d. Implemented and verified; user approved November 1, 2026 before 4f rollout preparation. The [step 4 plan](lead-capture-integration-step-4-plan.md) retains 4f as the concrete rollout review before any production delivery changes.

## Installation projection

The authorized source detail read now returns optional installation details from the persisted website publication key and current approved configuration version. The existing source dashboard/settings and publication-instructions components display the real hosted URL, iFrame snippet and JavaScript snippet. After publication, the connected review routes to the source installation tab. No installation key is manufactured in the browser or copied from a draft.

Projection occurs inside the existing tenant-authorized workspace transaction. Absent delivery policy or submission schema withholds artifacts; draft and Gmail sources receive none. Public availability is checked in the same transaction so an active source with an unavailable assignment/access incident is shown as blocked. Scheduled, paused and archived statuses retain their distinct copy. The approved version binds the dashboard projection even when a newer draft or scheduled revision exists.

For this checkpoint, actual installation artifacts are available only for explicitly configured nonproduction loopback delivery with the 4d submission policy. Production artifact projection and publication authority remain disabled until 4f verifies hosting, ingress, credentials, budgets and the complete delivery path. A valid origin alone cannot enable production publication. Existing reserved-example-domain Storybook fixtures remain simulated.

## Script and resizing

`GET /embed.js` is served only on the canonical forms host, with a JavaScript content type, nosniff, cross-origin resource policy and no-store caching. The application host and non-read methods reject it. Existing forms-host isolation still rejects application/auth/private routes.

The small classic script reads only its own `data-public-key`, validates the public key, and inserts an isolated iFrame immediately before that script. It uses the canonical server-configured origin and `/embed/{publicKey}` path. It does not inspect the customer's page fields or visitor answers. Multiple scripts create independent frames. The direct iFrame snippet uses a fixed initial height with normal frame scrolling; the JavaScript variant also adjusts height automatically. Both suppress referrers and use the same approved public renderer and durable submission endpoint.

Each loader frame gets a fresh random 128-bit channel. On load the parent sends a bounded initialization message to the exact forms origin; a brief bounded retry covers hydration timing. The child accepts initialization only from its immediate HTTP/HTTPS parent, observes its form content and replies to that exact parent origin. No wildcard delivery is used. Resize messages contain only protocol type/version, channel and integer height, bounded from 128 to 20,000 pixels.

The loader validates exact forms origin, exact iFrame window, channel, protocol/version, complete message shape and height bounds before changing height. Additional fields, wrong frames/origins/channels, invalid numbers and oversized messages cannot resize another form. Successful submission can shrink the frame; validation, challenge and refresh content can grow it. The embedded renderer measures natural content height instead of a viewport minimum, preventing a resize feedback loop. No receipt, answer, contact, tenant or source identifiers are posted to the parent.

## Verification

- Full unit suite: **3,412 tests across 206 files passed**. New tests execute the standalone script with a controlled DOM/window boundary and cover forged messages, shape/size bounds, malformed keys, detached frames and safe artifact generation. Origin-routing and delivery-policy tests include the loader and production gating.
- Disposable runtime-role public database rehearsal: **ten groups passed**, including the new authorized installation projection, absent-origin denial, cross-tenant/permission denial and unavailable-assignment status. Existing immutable revision, scheduling, lifecycle, access-loss and public-projection regression checks still pass.
- **210 responsive Storybook cases passed** across 70 installation, dashboard, connected and public-page stories at 1440px, 768px and 320px, with interactions, Axe WCAG A/AA, overflow and browser-error checks. Two long-run preview timeouts were resumed with the remaining cases; each target passed. Desktop/mobile screenshots were inspected. Final mobile tab spacing also received focused installation and keyboard checks.
- **Two Chromium browser tests passed in 3.7 minutes**, covering standalone cross-origin script delivery and the full durable submission/installation/loader flow described below. Tests use a real plain HTTP customer host; the initial intercepted/React host fixture was corrected before the passing run. No final page/CSP errors were observed. The loader challenge screenshot was visually inspected at 320px.
- All workspace typechecks, focused ESLint and `git diff --check` passed. ESLint emits only the existing React-version detection notice.

Reproduce with Node 22 and pnpm:

```sh
pnpm test:lead-capture-public:db
pnpm test:lead-capture-submissions:e2e
pnpm test
pnpm -r typecheck
```

The expanded submission browser harness exercises the actual loader response, real renderer and durable writes across app `127.0.0.1:3018`, forms `localhost:3018` and a plain customer host at `127.0.0.1:3019`, using a random disposable database and local Siteverify fixture. It verifies actual snippets and the authorized application installation page, multiple frames, forged resize attempts, mobile overflow, success shrinking, stable revision URLs, challenge/provider-response-loss retry, lifecycle states and account/workspace suspension. Chromium's third-party cookie restriction is explicitly enabled for the host page and no forms-origin cookies are required. The local challenge fixture is explicitly simulated; real Cloudflare/domain/ingress verification remains 4f.

No new migration is required for 4e. Configured databases, DNS/TLS, production credentials and deployment remain unchanged. Staff lifecycle mutations, Gmail and staff Intake Review retain their separate integration checkpoints.

Local review: [connected installation preview](http://127.0.0.1:6010/?path=/story/lead-capture-connecteddrafts--installation) and [embedded form preview](http://127.0.0.1:6010/?path=/story/lead-capture-publiccapturepage--embedded). Storybook uses reserved example URLs and simulated responses; the disposable browser rehearsal verifies actual local delivery.
