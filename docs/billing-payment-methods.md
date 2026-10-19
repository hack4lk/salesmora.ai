# Embedded payment-method management

Status: local design preview, October 14, 2026. No new Stripe calls, schema changes, environment variables or staging deployment in this section. The real Billing route does not expose the new payment action until its server adapter is implemented.

## Design

The Owner opens a compact Payment method dialog from Billing's Manage payment details button or failed-payment callout. It shows the current renewal card, an embedded Stripe field slot, and explicit consent to use the replacement for future subscription renewals. Saving a renewal card preserves the plan and renewal date.

Saving a card and paying an outstanding invoice are separate actions. After the card is verified and saved, recovery displays the invoice number and exact amount with a Pay amount now button. Nothing is charged merely by saving a card. States cover saving, bank verification, save failure, saved card, processing payment, payment failure and verified payment received. Failed recovery allows retry or another card. Admin has a read-only preview; Office/Field do not render the dialog.

Backdrop clicks do not dismiss the flow. Close/Escape are blocked during saving, authentication and payment. MUI supplies modal focus handling; focus returns to the Billing trigger after dismissal. Focus enforcement is relaxed only during bank authentication. Card fields and bank verification are injected slots; Storybook uses clearly labeled placeholders and fictional callbacks, not unsecured card inputs.

Source/copy/stories live in `apps/web/src/features/billing/payment-method-dialog/`. BillingPage accepts an optional Owner payment callback, and its Storybook wrapper connects both payment entry points to this preview. The actual Billing adapter has no payment callback yet.

Review URLs:

- `/story/billing-paymentmethoddialog--editing`
- `/story/billing-paymentmethoddialog--recovery-review`
- `/story/billing-paymentmethoddialog--payment-failed`
- `/story/settings-billingpage--manage-payment`

Validation: 26 desktop/mobile checks passed across dialog states and Billing integration, including Axe accessibility, overflow, consent gating, explicit payment, busy Escape protection and focus restoration. Web types, lint and Storybook production build are the release checks for this design section.

## Next implementation after design approval

1. Owner-only server boundary with current membership/policy, exact Origin, rate limits, strict request DTOs and no-store responses. Use the same billing advisory/workspace lock order and deny tombstoned users/workspaces. No assistant tool may manage payment methods.
2. Create a customer-scoped SetupIntent for future off-session card use, with durable intent and idempotency records before provider mutations. Embed Stripe SDK fields using the existing sandbox publishable key; client secrets stay in component memory and never enter logs or persistent browser storage.
3. Verify SetupIntent success and customer/payment-method ownership before setting subscription and customer renewal defaults. Handle concurrent saves, authorization revocation, deletion, provider failures and retries. Show a new card only from verified provider state, then refresh Billing.
4. Recover only an eligible unpaid renewal invoice for the server-mapped subscription. Provide a server-owned exact amount/currency quote, revalidate before explicit payment, and handle already-paid/changed invoices without duplicate charges. Keep incomplete upgrades in their existing plan-change flow. Complete any bank challenge through embedded Stripe Elements.
5. Reconcile provider/webhook state before claiming payment success or restored entitlement. Test sandbox success, decline, bank challenge, replay/concurrency, role/tenant denial, provider outage and account-deletion races locally. Deploy with the next approved coherent staging section.

Standalone billing-contact editing, older invoice pagination and remaining product quota enforcement remain separate sections. Follow the component approval checkpoint in `docs/component-conventions.md` before beginning the connected adapter.

## Card updates connected locally — October 14, 2026

Owner Billing → Payment details → Manage payment details now opens the approved dialog with real embedded Stripe Payment Element card fields. The failed-payment entry point also opens card updating; saving does not explicitly pay an overdue invoice, and a saved-state notice explains this. Explicit invoice recovery remains the next separate section. Admin controls stay hidden/read-only and direct mutations are denied.

`packages/data/src/billing/payment-methods.ts` authorizes the current Owner and validates the customer/subscription mapping under the existing billing/workspace locks. It commits a durable intent before creating an off-session, card-only SetupIntent with a stable idempotency key. Only the Owner receives its client secret in a no-store response. The browser checks consent and completes card verification through Stripe; raw card data never reaches the application API. The server retrieves the succeeded SetupIntent and attached card before accepting consent and updating both customer and subscription renewal defaults. The final provider reads verify both defaults before success is reported.

Applying state commits before default changes. The worker can finish a partial update after a crash, with bounded retry/backoff; fresh ownership and mapping checks still apply. Pending setup creation is never blindly recreated beyond the safe idempotency window. Stale defaults/actors/subscriptions invalidate a reusable prepared intent; completed-request replay cannot restore a previous card. Logs/audit contain generic event/attempt identifiers, not client secrets, card numbers or provider errors. Expired idempotency windows or changed mappings require operator reconciliation rather than guessing.

New additive local migrations:

- `202610140002_payment_methods.ts`: actor/workspace/customer/subscription intent, previous defaults, SetupIntent/payment-method IDs and consent/completion lifecycle.
- `202610140003_card_retries.ts`: retry scheduling and attempt counters. Applied migration history was not rewritten.

`/api/billing/payment-method` provides strict prepare/save requests with Origin/session/rate/Owner checks. `connected-payment-method-dialog.tsx` hosts Elements and confirmation; the embedded widget keeps its fields mounted during authentication. Card and wallet configuration presents an expanded card form without Link/wallet prompts. Secrets stay in component memory. Billing refreshes from the authoritative snapshot after success. Account deletion now cancels incomplete card SetupIntents and purges the new mapping rows before removing the workspace. Both web and worker must receive these migrations/code in a future staging release.

Validation: 392 unit tests, workspace types, lint and production app build passed. The isolated local Docker/real Stripe sandbox test exercised Owner-only mutation, cross-workspace/origin/payload denial, required consent and verified SetupIntent state, repeated preparation, concurrent partial-write recovery and single audit completion. A mobile browser saved a replacement through the actual embedded card fields; both defaults matched afterward, the paid period stayed unchanged and invoice count did not increase. Older completed-intent replay preserved the newer card. Deleting the fictional account canceled a pending setup and subscription, purged the intent rows and completed the deletion request. Test Stripe customer/subscription resources were cleaned up and sessions signed out. No live charge or staging deployment.

No new environment variable is required: this uses the existing sandbox Stripe secret/publishable keys and billing flag. Provider behavior follows Stripe's [SetupIntent confirmation reference](https://docs.stripe.com/api/setup_intents/confirm) and [saving subscription payment methods guidance](https://support.stripe.com/questions/saving-payment-methods-for-subscriptions-after-strong-customer-authentication-%28sca%29-regulations-take-effect).


## Staging release — October 14, 2026

This section was included in the approved combined staging release. Web and worker reached SUCCESS; migrations and HTTPS fictional-account verification completed. Stripe remains sandbox-only. Historical local-only notes above describe the earlier review checkpoints. See [release evidence](railway-staging.md#billing-and-account-follow-up-release--october-14-2026).
