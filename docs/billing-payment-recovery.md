# Failed-payment recovery

Status: design approved and connected locally, October 14, 2026. Stripe sandbox only; not deployed to staging. The preview notes below describe the original design section; the connected implementation follows.

`apps/web/src/features/billing/payment-recovery-dialog/` contains the new presentation component, copy and stories. It uses the approved compact billing dialog, dim backdrop, payment-failure callout styling and shared feedback components. The existing approved PaymentMethodDialog is reused for the fictional card-update subflow.

## Review flow

The Owner reviews an invoice number, subscription description, billing period, invoice total, amount already paid, outstanding amount and renewal card. Payment requires an explicit button labeled with the amount, such as Pay $29.00 now. Opening, closing, refreshing or updating a card never invokes the preview's payment callback. The card-update subflow returns to the still-unpaid invoice for a separate payment decision. There is no payment control without a positive valid balance, current authorization flag and saved card.

Processing, bank verification and confirming states disable dismissal and block another payment. The uncertain-result state allows status refresh and dismissal but has no Pay button. A changed or unavailable balance requires a fresh review. Paid/already-paid states show no additional payment action; an already-paid invoice explicitly says no additional payment was requested. Decline allows retry or another card. Admin is read-only; Office/Field render no dialog.

The verification slot accepts a future embedded Stripe challenge. Modal focus enforcement is relaxed during authentication; the dialog surface is keyboard-focusable so long busy/verification content can still be scrolled when buttons are disabled. Backdrop clicks do not dismiss the flow. Closing returns focus to the opener.

## Storybook review

- `Billing/PaymentRecoveryDialog/Default`: unpaid invoice review.
- `PaymentDeclined`, `BankVerification`, `StatusUnknown`, `BalanceChanged`, `ProviderUnavailable`: recovery/failure states.
- `PaymentReceived`, `AlreadyPaid`: distinct verified outcomes.
- `NoSavedCard`, `AdminReadOnly`, `UnverifiedBalance`: access and payment prerequisites.
- `ConfirmPayment`, `UpdateCardThenReview`, `OpenAndDismiss`: mocked interactions.

All card and invoice values are fictional. The card subflow and payment callbacks deliberately simulate outcomes; they do not contact Stripe. Review this component before adding it to Billing, as requested by the user.

## Integration after approval

Connect the Owner's failed-payment callout to this recovery dialog while keeping Payment details focused on renewal-card updates. Use a server-owned invoice quote scoped to the current workspace's mapped subscription and Owner permission. Restrict this flow to eligible unpaid renewal invoices; incomplete plan upgrades keep their existing plan-change recovery flow.

Recheck invoice ownership, amount/currency, status, current card and authorization before payment. A paid invoice returns an already-paid result without another charge; changed amounts require review. Persist the payment intent/idempotency record before provider mutation, keep client secrets in component memory, handle bank challenges inside SalesMora, and reconcile invoice/subscription state before claiming paid access is restored. Unknown outcomes must resume status checks instead of offering a second payment. Deletion, revoked authority and concurrent retries must fail safely. Saving a card remains a separate action and monthly usage does not reset.

Validation: 32 desktop/mobile preview checks passed, covering all recovery states, explicit payment, separate card update, busy dismissal guards, readonly/prerequisite states and focus restoration. Axe and horizontal-overflow checks passed; mobile and desktop screenshots were reviewed. Web type checks, lint and the Storybook production build passed. No real payment or live page behavior was changed.


## Connected locally — October 14, 2026

Billing’s failed-renewal callout now opens the approved dialog. Payment details remains a separate renewal-card update. An Owner reviews the provider’s current outstanding amount and explicitly selects Pay before any payment submission. Admin retains read-only Billing; Office/Field cannot access its data. No new environment variables are required: existing sandbox secret, publishable key, price IDs and billing flag are reused.

### Responsibilities

- `packages/contracts/src/payment-recovery.ts`: strict preview, confirm and status requests. Browsers provide only workspace and quote IDs, never invoice/customer/card identity or amount.
- `packages/data/src/billing/payment-recovery.ts`: current Owner authorization and provider mapping, ten-minute quote, durable authorized attempt, linked-invoice payment, observed payment status and subscription reconciliation. Scope is USD automatic monthly renewal invoices for the current mapped sandbox subscription. Initial purchases and plan-upgrade invoices retain their existing flows.
- `apps/web/src/app/api/billing/recovery/route.ts`: authenticated POST boundary, exact Origin check, strict input and size limit, per-user rate limit, no-store responses and generic provider errors. Known declines prepare a fresh quote without paying it.
- `connected-payment-recovery-dialog.tsx`: current invoice loading, explicit payment, embedded Stripe bank challenge, uncertain-result status refresh and separate embedded card-update flow. Client secrets stay in component memory. Paid success follows authoritative invoice/subscription reconciliation and refreshes Billing.
- `billing-route.tsx` and `billing-page.tsx`: Owner callout and connected dialog entry point.
- `apps/worker/src/billing.ts`: retry/reconcile committed recovery attempts with bounded backoff. It never pays an unconfirmed quote.
- `packages/data/src/account-deletion.ts`: void an open recovery invoice to invalidate outstanding bank verification before subscription cancellation and workspace purge.

### Database and retry behavior

Additive migration `202610140004_renewal_recovery.ts` creates `billingRenewalRecoveries`. It stores actor/workspace/provider mapping, safe invoice review, confirmed amount/card, quote expiry, attempt timestamp, state and retry evidence. It is applied to local development and the isolated test database. Existing billing tables and the AI usage ledger remain intact; recovery never resets token usage or moves the renewal date.

A workspace billing lock serializes confirmations and conflicting billing changes. Consent commits before contacting Stripe. Every retry of an authorized attempt uses the same Stripe idempotency key and exact invoice/card. Status and preview requests only inspect payment state. If the response is lost, the dialog offers status refresh; the worker observes the linked invoice payment or resumes the already-authorized request. Beyond Stripe’s guaranteed idempotency window it stops submitting payments and requires reconciliation. Amount/card changes require a fresh review. Conflicting plan/card changes are blocked while a payment outcome is uncertain. Deletion and revoked permissions prevent further attempts.

### Local verification

The real Stripe sandbox test creates fictional customers on a test clock, pays an initial subscription, advances into a failed monthly renewal and exercises the connected mobile Billing dialog. It checks decline, stale card quote, Owner-only/cross-workspace/Origin/input enforcement, duplicate submissions, paid replay, worker reconciliation and unchanged renewal date. A later renewal verifies the linked bank-authentication state, concurrent worker reads and deletion cancellation/purge. The existing embedded card-update and deletion regression also passes. Test subscriptions/customers are cleaned up; no development workspace or staging data is reset.

395 unit tests, workspace type checks, lint, app/worker production build and Storybook build passed. Loading/review/unknown/paid previews passed desktop/mobile Axe and overflow checks. See `apps/web/e2e/payment-recovery.spec.ts`; opt in with `SALESMORA_BILLING_TEST=1` and the isolated `_test` database. The final mobile browser run also opened Stripe’s real embedded bank challenge, dismissed verification, verified the non-payable uncertain state and then confirmed deletion voided the invoice, canceled the subscription and purged recovery rows. A seeded 125-token usage record remained unchanged after successful payment.


## Staging release — October 14, 2026

This section was included in the approved combined staging release. Web and worker reached SUCCESS; migrations and HTTPS fictional-account verification completed. Stripe remains sandbox-only. Historical local-only notes above describe the earlier review checkpoints. See [release evidence](railway-staging.md#billing-and-account-follow-up-release--october-14-2026).
