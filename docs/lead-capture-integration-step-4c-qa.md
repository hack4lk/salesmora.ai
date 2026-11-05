# Lead Capture integration step 4c — hosted rendering and origin isolation

Implemented, verified and user approved October 31, 2026 after approval of 4b. The [step 4 plan](lead-capture-integration-step-4-plan.md) remains the delivery sequence. Submission was disabled at this checkpoint; the subsequent opt-in implementation is documented in [4d QA](lead-capture-integration-step-4d-qa.md).

## Public routes and safe rendering

Added canonical hosted `/f/{publicKey}` and iFrame `/embed/{publicKey}` routes. They reuse the approved visitor form through `PublicCapturePage`. The database lookup resolves the persisted publication under a workspace lock and projects only the current approved visitor fields/content. Drafts, source names, briefs, workflow/settings IDs and tenant/user IDs are omitted. Contact values whose visibility flags are off are removed from the projection, including the unavailable state.

Published revisions retain the key/URL; a scheduled revision keeps serving the running configuration until the worker changes its pointer. Paused, scheduled, archived, access-blocked and suspended sources show the approved unavailable copy. Workspace/account deletion, absent rules, unavailable assignments, effective capacity overflow and unprocessed access-loss incidents fail closed. Unknown or malformed keys do not disclose a tenant.

Submission remains explicitly disabled: the form does not show a fake sending/success state, and direct public POSTs are rejected. The public view contract requires `submissionAvailable: false` in this checkpoint. Production publication authority is still unavailable. The JavaScript loader and installation projection remain 4e; no `/embed.js` delivery is claimed.

## Origin, sessions and headers

`CAPTURE_PUBLIC_ORIGIN` is server configuration, never inferred from Host/forwarded headers. Production requires HTTPS and a host separate from the application; the selected production origin is `https://forms.salesmora.ai`. Development permits explicit distinct loopback hosts. Missing/invalid configuration fails closed for public routes, including the reserved forms domain.

The Next proxy allows only validated hosted/embed paths and required static assets on the forms host. It rejects private/auth/settings routes, writes and path-encoding/traversal attempts. Public paths on the application host are rejected. Forwarded Host is not routing authority. Cookie and Authorization headers are removed before public rendering, and Better Auth explicitly keeps cross-subdomain cookies disabled. Public routes set no session cookie.

Hosted documents deny framing; embedded documents allow HTTP/HTTPS parents. CSP uses fresh script nonces with matching server-rendered scripts, self-only connections/assets and restricted frame/form/base/object policies. Only development permits the framework's eval/HMR requirements. Referrers are suppressed; robots indexing/archiving and content-type sniffing are disabled. Public URL paths are excluded from normal development request logging.

The production header policy is `private, no-store`. Next's development renderer forcibly replaces page Cache-Control with `no-cache, must-revalidate`; the browser rehearsal verifies that development policy and immediate availability changes, while unit checks assert the intended production headers. Production deployment/TLS/header smoke checks remain the concrete 4f rollout checkpoint.

## Version-bound contexts

Ready projections carry a signed 30-minute submission context using an independent `CAPTURE_CONTEXT_SECRET` (canonical base64 encoding of 32 random bytes). Payloads contain only public key, publication/configuration versions, public origin, request UUID and issue/expiry times. They contain no workspace/source/user IDs or capability grants. Issue time comes from the database read; future admission should verify with its current database time.

HMAC verification rejects tampering, alternate origins/keys/revisions, future-issued and expired contexts, and malformed encodings. Tokens are returned in the page payload, not placed in URLs. Context issuance alone never enables publication or submission.

## Verification

- Full unit suite: **3,402 tests across 201 files passed**. Five new origin/context tests cover configuration, host/path/method gates, framing/cache policy, signature/version/origin binding and expiry. The final traversal additions passed the focused suite again.
- Public database rehearsal: **nine groups passed** on a newly allocated database using the actual web runtime role. Covers safe projections/hidden contacts, unknown keys, draft isolation, stable revision identity/history, scheduled switches, unavailable lifecycle states, workspace/account suspension/deletion, assignment/capacity denial and queued loss after recovery. GETs do not create receipts/leads or acknowledge loss incidents.
- Chromium two-origin application flow passed in **1.3 minutes**. It creates a real test account/workspace and an isolated publication fixture; verifies app session continuity, forms-host auth/private rejection despite forged forwarded Host, host-only cookies/no public Set-Cookie, strict projection/context signatures, matching CSP nonces/no CSP violations, anonymous hosted rendering, 320px overflow, cross-origin iFrame rendering, immediate pause and zero receipts/leads. An initial cache assertion was adjusted to Next's documented local development override before the passing runs.
- **108 Storybook cases passed**: all 36 public-page and visitor-form stories at 1440px, 768px and 320px, including interactions, Axe WCAG A/AA checks, overflow and browser errors. Actual hosted desktop/mobile screenshots were visually inspected.
- All workspace typechecks, focused lint and `git diff --check` passed. Lint emitted only the existing React-version detection notice.

Reproduce with Node 22 and pnpm:

```sh
pnpm test:lead-capture-public:db
pnpm test:lead-capture-public:e2e
pnpm test
pnpm -r typecheck
```

The browser harness uses `127.0.0.1` for the app and `localhost` for forms, creates a random disposable database and ephemeral context key, and restores the harness-owned Next type import on exit. Rehearsals do not migrate configured databases. No production domain, DNS/TLS, provider connection or deployment was changed. No new migration is needed for 4c itself; it requires the previously reviewed schema chain.

Local review: [public page preview](http://127.0.0.1:6010/?path=/story/lead-capture-publiccapturepage--default) and [embedded preview](http://127.0.0.1:6010/?path=/story/lead-capture-publiccapturepage--embedded). Storybook fixtures are explicitly non-operational.
