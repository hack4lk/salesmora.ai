# Lead Capture integration step 4d — durable submissions

Implemented October 31, 2026 after user approval of 4c. This checkpoint connects the approved hosted/iFrame form to durable admission and abuse controls. User approved this implementation November 1, 2026; continue with 4e loader and installation integration. The [step 4 plan](lead-capture-integration-step-4-plan.md) remains authoritative.

## Admission and retries

The forms-origin `/api/public/capture/{publicKey}` POST accepts a strict, bounded contract: signed context, submission UUID, answers, consent, hidden bot trap and optional challenge token. Bodies are streamed with a 256 KiB ceiling. Client workspace, source, actor and capability claims are rejected. The server verifies canonical Host/Origin, the context signature and audience; database time determines expiry. The signed render-context nonce and separate submission UUID bind each fixed payload.

A workspace-locked preparation transaction resolves the publication, checks the immutable configuration and records a new attempt. External challenge verification runs without holding that lock. A second workspace-locked transaction rechecks availability, versions, assignment and challenge binding before writing. Observed account/access loss commits source reconciliation even when acceptance is denied.

An exact committed retry returns its original generic acknowledgment, including after context expiry or a publication change. Changed answers, consent or context under the same UUID conflict. Receipt lookup still consumes general traffic budgets. The public acknowledgment exposes only the submission UUID, never lead IDs, duplicate matches or review reasons.

Eligible submissions use the shared lead admission primitive, including lead numbering, history and monthly admission tracking. Public capture enforces the monthly allowance independently of the billing sandbox flag, while honoring the approved existing-workspace transition without resetting usage. Duplicate email/normalized phone matches, incomplete lead data, exhausted capacity and unavailable assignment produce an awaiting Intake Review item. They do not update an existing lead or automatically approve themselves later.

The receipt, original answers, exact consent wording/version/privacy link, source/version provenance, resolved assignment/default-setting version, configured stage/tags, lead or intake item, notification intent, retained-input accounting and redacted acceptance event commit atomically. Assignment notification intent is inserted once and the existing email worker honors recipient preferences. No live email was sent by verification.

The forward-only `202610310004_capture_submissions` migration adds shared abuse state, immutable receipt-processing evidence, retained-input accounting and tenant-scoped lead tags. It was exercised only on disposable rehearsal databases; configured databases were not migrated.

## Abuse and Turnstile

New valid attempts use the approved per-form/client-IP rolling ten-minute limits: 1–5 without challenge, 6–20 requiring Turnstile, then HTTP 429 with a retry time. An accepted exact retry does not consume another attempt. Filled bot traps, unknown fields/choices, invalid shapes and mismatched consent are rejected. Global and per-source fixed-minute request budgets protect lookup/retry traffic as well. Workspace pending-item and retained-input-byte budgets refuse acceptance before storage is exhausted.

Client addresses are represented in database limiter records by a form-scoped keyed digest. Raw addresses and challenge tokens are not retained there. Attempt records expire after ten minutes; challenge-check records after at most five minutes; request buckets at their minute boundary. Request handling and the existing approximately 30-second publication worker purge expired abuse state without touching receipts.

The server checks Siteverify success, configured hostname, `capture_submit` action, context/payload binding and challenge time. A token hash is bound to one submission and a durable verification UUID, which is reused as Siteverify's `idempotency_key` after response loss. Verified proof is persisted briefly and checked again inside the admission transaction. This implements Cloudflare's required server validation and five-minute, single-use token rules; see [Siteverify documentation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/). The client lazily loads the explicit widget only when challenged; the forms CSP permits its script/frame origin and propagates the page nonce as described in [Cloudflare's CSP guidance](https://developers.cloudflare.com/turnstile/reference/content-security-policy/).

Production opt-in requires `CAPTURE_SUBMISSIONS_ENABLED=true`, a canonical forms origin, independent 32-byte base64 context/abuse/ingress secrets, Turnstile site/secret keys, and `verified-header` address mode. The trusted ingress must strip visitor-supplied identity headers and supply its own single validated IP plus ingress key. Global/source request and pending/retained-byte budgets must be explicitly configured; missing policy fails closed. The actual ingress implementation and measured rollout budgets remain 4f. Names and development examples are in `.env.example`; no real secrets were changed.

Only explicit nonproduction loopback origins may use the shared loopback client bucket and local defaults (300 global requests/minute, 100 per source/minute, 10,000 pending items and 64 MiB retained input per workspace). A local provider adapter additionally requires the isolated test-server flag; production cannot select it.

## Connected visitor behavior

The existing visitor component now submits the fixed request and requires a matching accepted acknowledgment. Network failures, mismatched acknowledgments, service errors, challenge requirements and rate limits preserve answers and retry identity. Challenge expiry/error offers another verification. Rate limits expose the retry time. Stale configuration locks the old form and offers explicit refresh; stable field-ID answers survive, a fresh context/submission identity is used, and changed definitions require renewed consent. Duplicate/review acceptance uses the same visitor success copy as automatic lead creation.

Review the explicitly simulated Storybook [challenge flow](http://127.0.0.1:6010/?path=/story/lead-capture-publiccapturepage--connected-challenge), [lost-response retry](http://127.0.0.1:6010/?path=/story/lead-capture-publiccapturepage--connected-lost-response), [rate limit](http://127.0.0.1:6010/?path=/story/lead-capture-publiccapturepage--connected-rate-limit) and [stale refresh](http://127.0.0.1:6010/?path=/story/lead-capture-publiccapturepage--connected-stale-form). These fixtures make no provider calls or persistent writes.

## Verification

- Full unit suite: **3,409 tests across 204 files passed**. Includes strict submission/acknowledgment contracts, context expiry lookup, production policy/ingress and Siteverify validation failures.
- Disposable runtime-role submission rehearsal: **16 groups passed**, covering concurrency/idempotency, duplicate and missing-data review, last monthly slot, approved transition grace, thresholds, durable provider identity/token replay, stale proof/configuration, access-loss reconciliation, whole-transaction rollback, assignment/notification preferences, pending/storage refusal and abuse expiry.
- Existing manual/chat admission regression: **five groups passed**, including authorization, confirmed chat creation, concurrent retries and shared capacity enforcement.
- **132 Storybook cases passed**: all 44 visitor/public-page stories at 1440px, 768px and 320px with interactions, Axe WCAG A/AA checks, overflow and browser errors. Connected desktop/mobile screenshots were also inspected.
- Two-origin Chromium submission flow passed in **2.9 minutes** using a real Next server and disposable database. It covers lost accepted responses, challenge after five attempts, provider response loss with durable retry identity, generic duplicate acceptance, origin/forged-claim/bot/oversize rejection, hard-limit recovery with the same payload, changed-revision refresh/consent and cross-origin iFrame submission. No page/CSP errors were observed.
- All workspace typechecks, focused ESLint and `git diff --check` passed. ESLint emits the existing React-version detection notice.

Reproduce with Node 22 and pnpm:

```sh
pnpm test:lead-capture-submissions:db
pnpm test:lead-admission:db
pnpm test:lead-capture-submissions:e2e
pnpm test
pnpm -r typecheck
```

The browser harness creates a random disposable database, ephemeral independent keys, separate app/forms loopback hosts and a local Siteverify fixture. The fixture deliberately persists a decision then drops a response to test retry behavior; it does not prove a real Cloudflare widget or production ingress deployment. Configured databases, DNS/TLS, deployment and live provider accounts remain unchanged. Production website publication authority remains explicitly unavailable until 4f verifies the complete path. `/embed.js`, resizing and live installation artifacts remain 4e; Gmail and staff intake actions retain their later checkpoints.
