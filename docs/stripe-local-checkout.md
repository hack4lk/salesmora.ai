# Local sandbox registration and Checkout

Status: initial purchase section, local only. No live payments or staging release enabled.

## What is connected

With `BILLING_SANDBOX_ENABLED=true`, `/register` renders the approved Compare first screen from the shared catalog. The signup contract validates `plan`; the auth hook maps that intent to `users.registrationPlan` and discards caller-supplied entitlement claims. The intent survives verification/sign-in. Invited teammates still use their existing acceptance flow.

Workspace setup validates selected-plan seat capacity including the Owner. It creates a Free baseline subscription projection and holds paid-plan invitation drafts separately. Free skips payment. Paid signup resumes at `/setup/payment?workspace=…`; email verification does not block signup, Checkout or paid activation. It remains required before teammate invitation delivery.

Only the current Owner with locked `billing.manage` can create or refresh initial Checkout, or abandon it for Free. Exact Origin, strict bounded inputs, current membership/workspace ownership and per-user request limits are checked. Prices, customer IDs, subscription IDs and return URLs come from the server. The browser cannot choose a price, grant a paid plan or mutate another workspace.

Checkout uses a durable attempt and provider idempotency keys. Concurrent requests reuse one session. Expired sessions allow a new attempt; choosing Free expires open sessions before discarding unpaid invitation drafts. Unknown creation results older than 23 hours require explicit reconciliation rather than blindly creating a second customer/subscription after Stripe's idempotency window.

`/api/stripe/webhook` verifies the raw request bytes with the SDK, rejects live/Connect scope, bounds payloads and durably stores only event/object identifiers. The worker drains the DB inbox every five seconds and periodically repairs missed events, including initial purchases. Workspace serialization precedes retrieval of authoritative Stripe state. Matching customer, workspace, subscription, single monthly price/quantity, paid Checkout and a paid invoice are required for initial activation. Duplicate or delayed events do not reset usage or trust stale payload claims.

After verification, the projection supplies the new AI allowance to the existing reservation ledger. Paid invitation drafts are released only if current permissions and seat capacity still allow them; changed invitation policy does not undo a verified subscription. Existing support budget overrides remain explicit and take precedence. Existing workspaces retain their former default allowance during the recorded 30-day transition; switching off the sandbox flag restores the prior allowance behavior.

The worker also projects current renewal/cancellation state and seven-day failed-renewal grace. Owner notices, full Billing/Portal UI, upgrade/downgrade management, complete non-AI quota admission and permanent deletion remain subsequent sections. This initial section does not complete those features or enable commercial billing.

## Database additions

Migration `202610130001_billing_checkout.ts` adds:

- `users.registrationPlan`: validated onboarding intent, default Free.
- `workspaceSubscriptions`: workspace plan/status projection, customer/subscription mapping, paid-through/recovery/transition dates and unpaid invitation drafts. Existing workspaces receive a stable 30-day transition at migration time.
- `billingCheckoutAttempts`: durable initial purchase attempts, configured price/session mapping and expiry.
- `billingWebhookEvents`: metadata-only inbox with deduplication and retry timing.
- `billingAudit`: retained change metadata, without card data, prompts or full provider payloads.

Existing accounts, role policies, membership access and token history are preserved. The existing `aiUsageCalls` ledger remains authoritative; no second token counter is introduced. Billing records restrict casual cascading deletion until the explicit deletion workflow is implemented.

## Local operation

Server-only ignored `.env.local` values:

```dotenv
BILLING_SANDBOX_ENABLED=true
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_STANDARD_MONTHLY_PRICE_ID=
STRIPE_PREMIUM_MONTHLY_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

Use only sandbox keys. Restart the local app/worker after changing root environment values. The application refuses live credentials in this section. The matching STRIPE_PUBLISHABLE_KEY is passed to Stripe.js; the secret API key remains server-only.

- Apply additive migrations with `pnpm db:migrate` against the standard local Docker database.
- Provision/reuse the sandbox catalog with `node --import ./packages/data/node_modules/tsx/dist/loader.mjs scripts/setup-stripe-sandbox.mts --apply`. Without `--apply`, it is an offline preview.
- Start the app with `pnpm dev` at `http://127.0.0.1:3000`.
- Install the official Stripe CLI and run `pnpm stripe:listen`. If needed, supply `STRIPE_CLI_PATH` to its executable. The helper uses the sandbox key from the ignored environment, filters billing events and saves the listener signing secret without printing it. Restart the app if the signing secret changed.
- Run `pnpm worker:dev` for inbox processing and periodic reconciliation.
- Read verification emails in local Mailpit at `http://127.0.0.1:18025`.

Use fictional details and Stripe's sandbox card `4242 4242 4242 4242`, a future expiry and any valid test CVC. These are test-mode subscriptions, not live charges.

## Validation recorded October 13, 2026

- Real local signup preserved Standard intent despite a forged additional user field. Free baseline and 1M AI allowance remained until payment; invitation drafts were held.
- Concurrent real Stripe sandbox Checkout requests reused a session/customer. Forged Origin, cross-workspace calls, caller price claims and unsigned webhooks were rejected.
- Real hosted sandbox card payment completed, its signed event was delivered, and the worker activated Standard with a 5M allowance and one invitation draft release.
- Duplicate/stale expiry events did not downgrade the active subscription or reset a 100-token fictional ledger sample.
- Cleanup cancelled the fictional sandbox subscription, expired unused sessions, revoked temporary local auth sessions and removed temporary credential files. Fictional workspace/audit fixtures remain locally for evidence.
- Unit tests, type checks, lint, Storybook build and desktop/mobile handoff accessibility checks are recorded in the implementation plan. Separate billing E2E tests use an isolated `_test` database; no reset/seed command targets staging or ordinary local user data.

Run the explicit isolated suite with:

```sh
SALESMORA_BILLING_TEST=1 SALESMORA_STRIPE_LIVE_TEST=1 pnpm --filter @salesmora/web exec playwright test e2e/billing-checkout.spec.ts
```

The live flag here means real **sandbox API calls**, not Stripe live mode. The suite creates and expires test Checkout sessions, with no charges. Ordinary regression tests force billing off to retain their legacy-flow fixtures.

References: [Stripe hosted fulfillment](https://docs.stripe.com/checkout/fulfillment), [webhook verification](https://docs.stripe.com/events/manage-webhook-endpoints), [idempotent requests](https://docs.stripe.com/api/idempotent_requests).

## Purchase-flow update

The user approved allowing payment before email verification and removing the Free fallback from the payment handoff. Checkout no longer checks email verification on the server or disables the purchase button for it. The verification notice/link and Free fallback action/copy are removed from this screen. The Free plan remains available at initial plan selection. The internal abandoned-checkout cleanup service remains for controlled recovery; it is not offered by the handoff UI. Teammate invitation delivery retains its existing email-verification requirement. Payment-status recovery appears only after a persisted Checkout session exists.

## Embedded Checkout update

Payment now stays on the SalesMora payment route. The official @stripe/react-stripe-js and @stripe/stripe-js SDKs mount Embedded Checkout after Enter payment details. The server creates subscription sessions with ui_mode=embedded_page and redirect_on_completion=never, returning the client secret only to the authorized Owner with no-store. The client secret remains in memory and is not written to URLs, local storage, audit or database records. The matching sandbox publishable key is public by design; secret API and webhook keys remain server-only.

Open legacy hosted sessions are expired before issuing a fresh embedded attempt. Completed sessions are never replaced; they continue through authoritative reconciliation. No database migration was needed. Completion unmounts the Stripe form, verifies payment through the existing server endpoint, then navigates within SalesMora to Home. Webhooks remain authoritative for interrupted/closed browsers.

Verified a real embedded sandbox card payment by an unverified fictional Owner at desktop and mobile widths: browser remained on SalesMora during payment, Standard activated with 5M tokens, and the invitation remained pending_verification. Sandbox test subscription cancelled and temporary credentials removed afterward. Session reuse/no-redirect regression passed. Staging and live billing remain unchanged.

Reference: [Stripe embedded Checkout and completion callbacks](https://docs.stripe.com/payments/checkout/custom-success-page?payment-ui=embedded-page).


## Connected Settings Billing view

`packages/data/src/billing/summary.ts` reads the current effective plan, existing usage ledger, seat reservations and Stripe customer/subscription/payment summary plus recent invoices under workspace authorization. `packages/contracts/src/billing.ts` validates the browser-safe DTO. `GET /api/billing/summary` and `/settings/billing` enforce current `billing.read` or locked Owner `billing.manage`; Admin reads do not authorize mutations. The additive `202610130002_billing_read.ts` migration grants Owner/Admin billing visibility, increments policy revisions and records authorization audit snapshots. New workspaces receive matching grants through the explicit initializer.

`billing-page` retains fictional Storybook previews, while `billing-route.tsx` passes real snapshots and provides no-store refresh. Actual pages hide mutation controls until wired. Invoice details stay inline. Only the 12 most recent invoices are included currently; older-history pagination remains to implement. Campaign/storage counters and the remaining admission limits are still pending. All future payment-method and subscription management must remain embedded inside SalesMora; the user rejected hosted Billing Portal redirects. No staging changes for this local section.

## Plan changes inside Billing

- `features/billing/plan-change/`: comparison, dated amount review and embedded Checkout/Elements container; stories under Billing/PlanChange.
- `POST /api/billing/plan`: exact Origin, session, strict request and rate limit; Owner permission rechecked at the repository boundary. Actions preview/confirm/refresh/undo accept workspace and plan or durable quote UUID, never customer/price/amount fields.
- `packages/data/src/billing/plan-changes.ts`: scoped provider reads, ten-minute quotes, committed applying intent, idempotent paid upgrades, future downgrades and undo. Payment settings save the successful upgrade card for renewals. Unknown/conflicting states fail closed.
- `billingPlanChanges` migration: durable quoted intent and provider operation basis. No stored card data or client secrets.
- Reconciliation preserves the old paid plan for unpaid/expired upgrade invoices, finalizes paid intents, and releases completed managed downgrade schedules.

Official API references: [invoice previews](https://docs.stripe.com/api/invoices/create_preview), [pending updates](https://docs.stripe.com/billing/subscriptions/pending-updates), [subscription schedules](https://docs.stripe.com/billing/subscriptions/subscription-schedules). These flows remain sandbox-only and local pending section review.
