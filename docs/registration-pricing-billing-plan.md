# Registration, plans and billing implementation plan

Status: registration, embedded purchase, Billing and plan changes deployed to staging in sandbox mode. Account deletion, card updates, renewal recovery, lead/seat admission limits and complete invoice browsing were released together to staging on October 14, 2026. Live payments remain disabled. See the chronological sections below for details.

## Confirmed decisions

- Three workspace plans: Free, Standard and Premium. Subscriptions belong to a workspace, not an individual teammate.
- USD monthly draft list prices: $0, $29 and $49. The user approved using these as design candidates; final commercial pricing is not approved.
- Owner manages payment methods, subscription changes and cancellation. Admin can view billing. Office and Field cannot access billing. Preserve locked Owner-only `billing.manage`; add a distinct `billing.read` capability for Owner/Admin.
- The user already has a Stripe account. Use an isolated Stripe sandbox for local and staging payment tests. Live-mode activation is a separate approval.
- Build and test locally; review related sections together and deploy approved sections, not individual fixes.
- Follow existing blue/mint brand tokens, approved logo and registration controls. Keep display strings in colocated data files and components/stories together.

## Registration design — Compare first selected

One local Storybook concept screen contains three alternative compositions, using the existing RegistrationForm with mocked callbacks. The real `/register` route remains unchanged.

1. **Compare first:** full-width three-plan comparison, followed by an account form with a selected-plan summary. Best when comparing packages is the main decision; introduces a navigation step before credentials.
2. **Plan and account (recommended):** plan options beside the account form, with a live summary and a clear Free/paid continuation label. Prices and account fields remain visible together; mobile stacks plan selection above the form.
3. **Guided setup:** account first, then plans and a review step, with a progress rail. Reduces the initial form's density but asks for account details before comparing plans.

All concepts offer Free as a real selection, no preselected paid plan, no unsupported popularity claims and no charge on the account form. Paid payment terms are reviewed before subscribing. Prices are explicitly draft, and planned intake/campaign capabilities are marked as such.

The user selected **Compare first**. Paid checkout follows account creation and workspace details; Free skips payment. Extract this selected composition into production components after the remaining product decisions are reviewed. Concept-only state is not a billing contract or server entitlement source.

## Approved allowances and remaining package decisions

The user approved the seats, all-new-lead counting, campaigns, AI tokens and storage allowances below during the walkthrough. Prices remain draft. AI tokens and the existing lead/teammate admission paths are enforced locally. Campaign/storage limits will be connected with their modules. Automation limits are deferred.

| Allowance | Free | Standard | Premium | Measurement |
| --- | --- | --- | --- | --- |
| Monthly price, USD | $0 | $29 | $49 | Draft list price; final tax/price display reviewed before checkout |
| Users including Owner | 1 | 5 | 20 | Active memberships plus reserved pending invitations; no double-count on acceptance |
| All new leads/month | 100 | 1,000 | 5,000 | Manual, confirmed chat, forms, campaigns, email and imports; existing leads do not count; proposals count only on successful creation |
| Published intake campaigns | 1 | 5 | Unlimited | Concurrent published campaigns, not total campaign history |
| AI tokens/month | 1,000,000 | 5,000,000 | 20,000,000 | Shared workspace allowance: planning + answers + query embeddings and unresolved reservations |
| Attachment storage | 1 GB | 10 GB | 25 GB | Stored bytes; staged uploads reserve capacity |
| Active automations | Deferred | Deferred | Deferred | Important follow-up; no approved limits or registration pricing claims yet |

Packaging decisions still needed before enforcement:

- **Existing AI allowances:** current workspaces receive 5M tokens by default. Preserve their recorded allowance until an explicit migration/effective-date policy is approved. The approved token meter replaces the old AI-action proposal; do not double-meter actions and tokens.
- **Periods — approved:** lead and AI allowances reset on the first of each calendar month at midnight UTC, with no rollover. Stripe monthly renewals follow the subscription anniversary. Show the usage reset date and next charge date separately. Aligning quotas to subscription anniversaries later requires a deliberate migration. Plan changes must not silently reset consumed usage.
- **Upgrade token allowance — approved:** apply the new monthly allowance minus tokens already consumed in the current calendar month. Unused tokens from the previous plan do not carry over or stack. Standard to Premium after 4M consumed leaves 16M available; upgrading does not reset usage.
- **Downgrades — approved:** take effect at the end of the current paid billing period. Preserve existing records, files and teammates. Block affected capacity-increasing actions while above the lower limits, including new uploads/invitations. Lead and AI consumption remains counted until the next calendar-month reset. Pause excess published campaigns, with the Owner choosing which remain active; specify the fallback selection and notification behavior before implementation.
- **Cancellation — approved:** schedule a move to Free at the end of the paid period; retain paid access until then, prevent further renewals, preserve existing data and apply Free limits afterward. The Owner can undo cancellation before it takes effect. Cancellation itself does not delete the workspace.
- **Paid trials — approved:** no paid-plan trial at launch. Free provides the evaluation path; Standard/Premium begin charging when checkout succeeds.
- **Upgrade payments — approved:** paid-to-paid upgrades charge the prorated difference for the remaining billing period, with the exact amount shown before confirmation. Activate the higher plan only after successful payment and retain the renewal date. Free-to-paid starts a new monthly subscription. Calendar-month usage remains counted under the approved allowance rule. No automatic usage/seat overages are proposed.

Existing-workspace transition — approved: assign preexisting workspaces without a verified paid subscription to Free, preserve data and teammates, and allow 30 days before enforcing the new limits. Display the effective date and upgrade options to the Owner; never charge automatically. Record the existing allowances and a stable transition start/enforcement timestamp, preserve usage history, and do not infer a paid subscription from a token override. Re-running migration must not restart the grace period. Verified subscriptions, if present at rollout, must retain their reconciled plan. During the transition preserve existing allowances; after it ends enforce Free limits without deleting records or removing teammates. Define the rollout start date before release.

Planned features are not paid production capabilities merely because a quota exists. Campaign, intake, storage, workflow and connector gates are implemented alongside their actual modules. Their counters and plan metadata can be specified now; do not claim those features work or enable paid live checkout based on unimplemented benefits.

## Important follow-up — automations

**Priority: important. Deferred by the user during the tier walkthrough.** Define and build event-triggered workspace rules, such as lead assignment, follow-up tasks and accepted-estimate/job actions. Review supported triggers/actions, role and record-scope enforcement, retry/idempotency behavior, execution costs and per-plan limits before implementation. No automation allowance is approved. Exclude automation benefits and limits from registration pricing cards until the feature is defined and available.

## Application entitlement layer

Use one versioned, server-owned plan catalog under contracts/domain, separate from preview copy. Feature eligibility is:

`implemented feature ∩ current role permission ∩ workspace plan entitlement ∩ authorized record scope`

A Premium Field teammate still cannot create leads when the app permission denies it. Upgrading never grants a role or broadens assigned-record access. Apply the same checks to manual endpoints, assistant tools, proposal confirmation, background jobs and future connectors. Navigation and disabled controls mirror these decisions; they do not enforce them.

Add a central workspace entitlement resolver backed by verified billing state. It returns the effective plan/catalog version, feature flags, numerical limits, usage/reset information and safe limit reasons. Unknown plan/price/status fails closed for paid features. Free workspaces have explicit baseline entitlements, not an arbitrary browser-supplied plan string. Do not put Stripe network requests on every CRM read; use the reconciled database projection.

Use atomic quota admission in the same transaction as the protected mutation, with a workspace/meter/period lock and idempotent operation key. Two requests for the final lead slot must not both succeed. Replays must not consume quota twice. Reserve capacity for invitations/uploads/queued intake and release it only on a documented terminal outcome. A draft alone does not create a lead or consume lead quota; confirmation rechecks current role, plan and available quota. AI planning/answers still consume tokens even if a lead proposal is never confirmed.

Extend the existing AI reservation/settlement ledger rather than creating a second token counter. The catalog supplies the effective allowance. Support overrides must be explicit and audited; existing operator overrides cannot accidentally grant unlimited paid entitlement. Unknown usage retains conservative reservations. Shared corpus ingestion/evaluation remains outside workspace chat allowance.

A limit blocks only the affected action, with a clear amount/reset date. Keep existing records readable and ordinary unrelated CRM work available. A user without billing management gets “Contact your workspace owner” instead of a payment action. Never delete data, remove teammates or silently charge overages to solve a cap.

Help/RAG also needs authoritative plan context: today retrieval accepts only the Free baseline. Expand validated plan IDs and article plan metadata, preserving role/capability/publication/status filtering in SQL. Do not let Standard/Premium fail the old Free-only guard or bypass role filters.

## Registration and checkout flow

1. Choose a plan and create an authenticated account using the existing server validation, terms acceptance and verification flow. A selected tier is purchase intent only.
2. Collect the existing workspace setup details and create an Owner-owned workspace with a Free baseline and a persisted intended-plan/billing intent. The Stripe subscription must map to a real workspace before charging.
3. Free selection completes onboarding without Stripe or card collection. Paid selection starts Stripe-hosted Checkout for a server-allowlisted monthly Price ID.
4. Preserve setup progress and any proposed invitations while payment is pending. Do not send invitations or provision paid seat capacity based on selected-plan text. Commit/check reservations against confirmed capacity after payment; handle conflicting changes visibly.
5. On return, show “Confirming your subscription” while server verification/webhook reconciliation completes. Redirect parameters, Checkout success URLs and a session ID supplied by the browser never grant a paid plan.
6. Payment success activates the verified paid entitlement and completes setup. Cancelled/expired/failed checkout keeps the account/workspace recoverable on Free, with retry/change-plan options and no duplicate subscription.
7. Invited teammates join their existing workspace without a pricing purchase flow or creating another subscription. An existing authenticated workspace owner resumes setup or opens Billing rather than registering again.

Preserve selected-plan intent through verification/sign-in with a server-owned expiring onboarding record. Do not store passwords/card details in URL parameters, local storage, billing metadata or analytics. Disable repeated submission and make account/workspace/Checkout creation repeat-safe; external Stripe creation cannot be assumed atomic with a database transaction.

## Stripe integration

Use Stripe Embedded Checkout in subscription mode for initial purchase. All Owner billing management must remain inside SalesMora, including payment-method updates, subscription changes and cancellation; do not create hosted Billing Portal redirects. Stripe SDK elements handle sensitive card fields. The application billing page presents scoped plan/usage/invoice information; application code never receives raw card numbers.

Proposed server routes:

- `POST /api/billing/checkout`: current authenticated Owner, exact Origin, validated workspace access and current purchase intent; maps plan key to allowlisted server Price ID, reuses active attempts and prevents concurrent duplicate subscriptions.
- Future embedded billing mutation endpoints: current Owner + `billing.manage`, fresh auth and exact Origin; customer/subscription mappings and prices come from the server. Never accept arbitrary customer IDs or prices from the browser.
- `GET /api/billing/summary?workspace=…`: Owner/Admin + `billing.read` (Owner also retains locked `billing.manage`); scoped summary and recent invoice DTOs, no-store. Admin receives no mutation controls. Historical invoice pagination remains follow-up.
- `POST /api/stripe/webhook`: raw-body signature verification with the environment-specific signing secret, bounded payload, correct sandbox/live mode and known event types. This provider-authenticated route does not use browser session/Origin as webhook authentication.

New data model (names finalized during implementation):

- `workspaceSubscriptions`: one current subscription projection per workspace; unique Stripe customer/subscription mapping, catalog/price version, status, paid-through dates, scheduled change/cancellation and recovery deadline.
- `billingCheckoutAttempts`: authenticated workspace purchase intent, target catalog price, lifecycle/expiry, Stripe session linkage and idempotency key. Reconcile a crash between provider creation and local persistence.
- `billingWebhookEvents`: unique event ID + mode, event/object identifiers, processing state and retries; retain minimal metadata, not unredacted provider/customer/card payloads.
- `workspaceUsageEvents` and quota reservations: deduplicated meter admissions for future intake/campaign/storage/invitation uses. Retain `aiUsageCalls` for AI; do not duplicate its charges.
- `billingAudit`: append-only actor/workspace/change/result metadata without card secrets; billing records do not cascade with chat retention.

After verifying and durably recording a webhook, acknowledge promptly and process retryable reconciliation in the worker. Use workspace-serialized reconciliation and retrieve authoritative Stripe state where needed; delivery may be duplicated, delayed or out of order. A duplicate event must not grant duplicate allowance, reopen an ended subscription or repeat notifications. Never associate a customer with a workspace by matching email alone.

Handle Checkout completion/expiry, subscription created/updated/deleted, successful invoices, failed/action-required payments and relevant customer/payment detail changes. Treat paid invoices + verified subscription state as fulfillment evidence. Add reviewed refund/dispute handling before live launch. Reconciliation jobs repair missed webhooks; audit mismatches rather than trusting stale frontend state.

Renewal/recovery — approved: maintain paid access for seven days after a failed renewal while Stripe retries payment; notify the Owner and expose payment recovery in Billing. If still unpaid after seven days, apply Free limits while preserving existing data and membership access. Record a stable recovery deadline so repeated events/retries do not extend the grace period. Successful verified payment restores the paid entitlement without resetting calendar-month usage. Cancellation retains paid access until the paid period ends, then moves the workspace to Free; it does not delete data. Explicit immediate account/workspace deletion is separate and is described below.

## Account and workspace deletion

The user requested account deletion in addition to subscription cancellation and selected **immediate permanent deletion**, with no 30-day recovery window. This is a planned capability, not authorization to delete any current account or workspace.

Proposed scope: teammates can delete their own account without deleting the workspace. Because each workspace must have exactly one Owner, an Owner deleting only their personal account must first transfer ownership; alternatively they can explicitly delete their workspace and account. Confirm and implement ownership-transfer rules before exposing that path.

For workspace deletion, require current Owner authorization, recent password reauthentication and workspace-name confirmation. Explain that all teammates lose access and distinguish deletion from period-end subscription cancellation. Cancel paid renewal/subscription immediately and durably coordinate provider cancellation with deletion so a provider failure cannot silently leave a deleted workspace being billed. Revoke sessions and stop queued work, then purge workspace application data, files, vectors and assistant history through a retryable deletion workflow. Access ends immediately; physical distributed purge completion must be tracked rather than falsely promised as instantaneous. Do not advertise a recovery window.

Specify retained invoice/audit records and backup expiration separately, including retention basis and minimization. Disclose any required retention before confirmation; do not promise immediate erasure from immutable backups or Stripe records. Refund policy — approved: no automatic refunds for mid-period cancellation or immediate deletion. Exceptional refunds are handled manually through support. Review applicable obligations before live commercial launch.

## Billing page design and access

Approved structure: add Settings → Billing as a subpage and left-menu child, keeping Settings overview as the default. Account/workspace deletion lives separately under Settings → Account. Show it only to Owner/Admin, with authoritative route/API access checks.

Page sections:

- Current plan, subscription state, monthly price/currency, next charge and scheduled change/cancellation.
- Usage cards for AI tokens and implemented meters, with clear reset dates. Explain planned limits separately; do not display invented live campaign/storage usage.
- Plan comparison and upgrade/downgrade preview, including effective date and any quoted charge/proration, available only to Owner.
- Payment method summary and billing details; Owner will use embedded Stripe SDK controls to manage them. Admin sees read-only information and a clear Owner-management note.
- Paginated invoice/charge history with date, amount/currency, status, refund/payment details when applicable, and scoped hosted invoice/PDF links.
- Pending checkout, confirming payment, payment failed/action required, recovery, period-end cancellation, over-limit downgrade, provider unavailable and empty-history states.

Future reusable components: `PlanSelector`, `PlanCard`, `SelectedPlanSummary`, `RegistrationPlanScreen`, `PlanUsageMeter`, `SubscriptionSummary`, `InvoiceHistory`, `BillingPage`. Create/approve one coherent screen/component section at a time, using colocated copy, mocked stories, keyboard/a11y and narrow/wide review. Do not duplicate business pricing rules in component files.

## Validation and approved deployment sections

**Section 1 — design and product decisions (current):** three local registration concepts, packaging/meter decisions and this plan. Approve a layout, quotas, lead counting and lifecycle semantics before the implementation contracts settle.

**Section 2 — entitlements and registration components:** extract selected design, typed server catalog, workspace billing/read permissions, existing-workspace migration strategy and atomic usage enforcement. Test Free/Standard/Premium × role × current/scheduled/recovery states. Review locally; payment actions remain disabled until end-to-end billing is ready.

**Section 3 — Stripe sandbox and Billing:** signed webhooks, worker reconciliation, Checkout/Portal endpoints and the Billing subpage. Add keys only to ignored local/server-side configuration; never paste them into chat. Use sandbox Price IDs and a local CLI webhook signing secret. Test complete paid onboarding, abandoned/resumed checkout, authentication challenges, duplicate/inverted webhooks, concurrent checkout creation, renewals/test clocks, failures/recovery, cancellation, proration and downgrades over quota. Verify Admin can view but cannot mutate, cross-workspace denial and Premium never elevates Field permissions.

**Section 4 — coherent staging release:** after local review/approval, deploy the complete usable registration/entitlement/billing section behind a server-owned sandbox feature flag. Apply backward-compatible migrations, set staging sandbox secrets and approved prices, register the HTTPS webhook, and run bounded fictional-workspace checks. Do not point resetting local browser fixtures at staging. Preserve existing accounts, payment state, role grants and token history. Hold production/live checkout for separate commercial/operational approval.

No per-fix deployment. Record the approved scope, local checks, migrations and rollback/recovery procedure for each staging batch. Acceptance includes actual card-sandbox payment, monthly renewal, failed renewal, plan changes, invoice history, role/tenant boundaries, token cutoff and migration preservation—not just a Checkout success page.

## Official integration references

- [Stripe subscriptions and webhooks](https://docs.stripe.com/billing/subscriptions/webhooks): asynchronous lifecycle, payment outcomes, signature verification and fulfillment.
- [Stripe Customer Portal](https://docs.stripe.com/customer-management): hosted payment/subscription/invoice management.
- [Stripe Checkout subscription flow](https://docs.stripe.com/payments/checkout/build-subscriptions): hosted initial subscription checkout.

Source product decisions: [roadmap](salesmora-product-roadmap.md#subscription-tiers-initial-proposal), [permission catalog](permission-catalog.md), [AI usage accounting](ai-usage-accounting.md), [component conventions](component-conventions.md). This proposal does not override those decisions silently; unresolved changes are identified above.

## Local design validation recorded — October 13, 2026

Created `RegistrationPricingConcept` with colocated data/stories and three compositions, reusing existing account form controls and the approved logo. Nine Storybook stories cover primary layouts, mobile variants and mocked selection/continuation/guided journeys. All six desktop/mobile layout checks (1440/390 pixels) passed Axe with no violations or horizontal overflow. Three interaction journeys passed, along with keyboard radio selection, visible focus and keyboard continuation. Web type checking, lint and the production Storybook build passed. An initial screenshot timed out while concurrent tooling was running; the final review passed after the build completed.

These are local design previews only. Existing registration/API/workspace behavior, permissions, token allowances, Stripe resources and staging deployment are unchanged. The user selected Compare first and approved the allowance table above. Next: review usage periods, subscription lifecycle and existing-account migration before production component extraction and billing implementation.

## Billing design preview — local review

The user approved the updated Compare first registration preview. Created Settings/BillingPage with fictional data, Owner controls and Admin read-only access. Stories cover Free, payment failure, scheduled cancellation, loading, load error and Field denial. No routes, Stripe calls, database or staging changes. Web type checking, lint and Storybook production build passed. All eight states passed Axe and overflow checks at 1440px and 390px; desktop/mobile screenshots were reviewed. Default story exercised plan/invoice callbacks; Admin and Field stories checked restricted controls/data. Billing design awaits user approval before the next screen.

## Account design preview — local review

Billing design approved after matching the payment-failure and scheduled-cancellation callouts with the same red warning treatment. Created Settings/AccountPage with fictional Owner/teammate views and native confirmation dialogs. Deletion is mocked; no authentication, API, database, Stripe or staging mutations occur. Web type checking, lint and Storybook build passed. All four views passed Axe and overflow checks at desktop/mobile widths. Confirmed disabled submit for mismatched text, matching-text/acknowledgment gating, initial focus on Keep my account, Escape dismissal and clearing sensitive inputs on reopen. Screenshots reviewed. Account design awaits local user approval.

## Integration foundation — October 13, 2026

Account design approved. Added typed workspace plan IDs/strict selection-intent contract and a frozen shared versioned plan catalog with the approved allowances. Prices remain draft/sandbox-only. Added UTC month boundaries and allowance arithmetic preserving consumption on upgrades/downgrades. These helpers do not grant access or replace current enforcement.

Extracted the approved Compare first layout into Auth/RegistrationPlanScreen, deriving numerical values from the shared catalog, reusing existing validated account fields and retaining draft legal disclosures. Submission callbacks include selected plan intent. No public signup route change yet: durable onboarding intent, billing persistence and verified Checkout fulfillment must be connected together before routing real users through paid selection.

With user authorization, created SalesMora Standard and Premium sandbox products and recurring monthly prices for $29/$49 USD. Sandbox IDs saved only in ignored .env.local; verified livemode=false and repeated setup reused the same resources. No customers, subscriptions, charges, webhooks, database migrations or staging changes in this foundation section. Reusable guarded script: scripts/setup-stripe-sandbox.mts (offline preview by default; --apply explicitly provisions the sandbox catalog).

Validation: 293 plan/authorization tests passed, all package type checks passed after correcting a story selector type, lint and Storybook production build passed. Eight registration variant/viewport checks passed Axe and overflow checks at 1440/390px, including keyboard radio navigation, heading focus on continuation, selection persistence on back navigation and mocked paid submission. Screenshots reviewed. Next backend section: persisted workspace plan intent and subscription/checkout/webhook records, then authoritative entitlement enforcement and connected Billing/deletion workflows.

## Initial registration and sandbox Checkout — local implementation

Connected the approved registration screen behind BILLING_SANDBOX_ENABLED, validated/persisted plan intent through signup and setup, added initial-plan seat controls and held paid invitation drafts until verified payment. Added bounded Owner-authorized checkout/free/refresh API and signed raw-body webhook inbox. Checkout creation commits durable attempts before provider calls, reuses idempotency keys and locks workspace billing/current membership. The worker drains events and periodically reconciles missed initial purchases and mapped subscriptions. Other sandbox projects/test databases cannot establish local entitlements.

Applied the additive billing migration to the standard local Docker database, preserving existing workspaces and recording their 30-day transition. The existing token ledger now resolves the approved plan allowance when sandbox billing is enabled; operator overrides retain precedence. Non-AI monthly lead/storage/campaign admission and full ongoing seat enforcement remain a subsequent section.

Validation: 379 unit tests passed; all package type checks, lint, Storybook and production app builds passed. Existing browser regression run had 104 passes/8 skipped and one still-pending save timeout; that case passed on focused rerun. Three new isolated billing browser tests passed, including real sandbox session reuse/expiry, Free initial seats, intent persistence, Owner/Admin/Office/Field boundaries and signed/unsigned event handling. Transactional membership-lock changes were followed by another passing concurrency test. Payment handoff and verification-required previews passed Axe/overflow checks at desktop/mobile widths.

A real hosted sandbox payment completed locally. The signed webhook and worker activated Standard, 5M AI allowance and its paid invitation draft. Duplicate/stale events preserved the entitlement and existing consumption. Fictional sandbox subscription cancelled after verification; unused checkout sessions expired; temporary local logins revoked and credential files removed. No real charges or staging changes. The local webhook listener and development worker remain running for review.

Operational/file map and commands: [local Stripe Checkout](stripe-local-checkout.md). Next: local user review of the connected signup section, then authoritative Settings Billing/embedded management/invoice integration, remaining quota admission and deletion workflow.

## Approved purchase-flow correction

Allow users to sign up and complete paid Checkout before email verification. Remove verification gating from Checkout creation and its handoff UI; retain verification for teammate invitation delivery. Remove Continue with Free instead from the paid handoff (initial Free plan selection remains). Show Check payment status only after a persisted Checkout session exists. Updated billing browser coverage exercises an unverified Owner against the real sandbox API.

## Embedded payment — user-requested implementation

Replaced offsite hosted Checkout with Stripe Embedded Checkout on the payment route. Official React/browser SDKs use the sandbox publishable key; card details go directly to Stripe. Subscription sessions use embedded_page and no completion redirect; client secrets are Owner-scoped/no-store and held only in component memory. Open hosted sessions are expired before replacement, while completed sessions reconcile without duplication. Real unverified-owner sandbox card payment stayed on site, activated Standard and preserved invitation verification gating. No additional database migration or staging change. See local Stripe documentation for operation and validation.


## Connected Billing view — local section (October 13)

User confirmed that **all billing management stays inside SalesMora**. Connected Settings → Billing and its left submenu to an authoritative read adapter. The screen shows the effective plan, UTC reset, real teammate reservations/new lead/AI ledger totals, safe Stripe payment summary, and the 12 most recent invoice totals/statuses/line items. Invoice details open inline; no hosted portal or invoice redirects. Stripe failure shows an explicit unavailable state, never fictional card/invoice data. Campaign/storage usage stays unreported until real counters exist.

Added configurable Owner/Admin `billing.read` with an additive local migration that audits policy revisions and preserves existing grants. Historical defaults-v1.json and applied migrations remain unchanged. New workspace initialization explicitly seeds the new read grants. Locked Owner-only `billing.manage` remains separate and gives Owner a read fallback. Route/API authorization runs before protected data/provider reads under the shared workspace lock; revocation and other-workspace access fail closed. Secrets/customer IDs are excluded from the strict browser DTO.

This section intentionally connects **viewing**, with a manual refresh and inline invoice details. Owner plan changes, card updates, cancellation/undo and invoice pagination are not wired yet, and real pages do not show inactive mutation buttons. Their approved Storybook design previews remain available. Finish those controls using embedded SDK flows and verified server mutations after reviewing this screen; do not deploy this incomplete billing-management section to staging.

Validation: 383 unit checks, package type checks, lint, isolated Billing browser authorization test (Owner/Admin, revoked grant, Office/Field, other workspace, Owner-only mutation denial), Storybook build and production app build passed. Six desktop/mobile story checks passed accessibility/overflow review, including inline invoice open/close. Additive migration applied only to local Docker. No staging deployment or live charge.

## Owner plan changes — local section

Connected Change plan on Settings → Billing to a new plan comparison/review component and server-owned preview/confirm/refresh/undo requests. Admin stays read-only. Free-to-paid uses Embedded Checkout on the Billing page, including a new purchase after a terminal subscription. Paid upgrades use a ten-minute invoice preview with a fixed proration timestamp and revalidated amount before confirmation; Stripe pending updates apply the higher price only on payment. Renewal date and calendar-month usage remain unchanged. Replacement cards entered for an upgrade are saved for subscription renewals through Stripe. Card challenges/recovery use embedded Stripe Elements rather than redirects.

Paid-to-paid downgrades use a server-owned Subscription Schedule at the paid period end; choosing Free schedules cancellation at that date. Both can be undone before the effective date, with scoped schedule/customer validation and audit records. The worker releases a managed schedule after its target phase takes effect so later changes remain available. Declined/expired upgrade invoices preserve the previously paid entitlement until its paid-through date; failed renewal grace remains separate.

Additive `202610130003_plan_changes.ts` stores durable quotes/intents with actor/workspace, target, subscription basis, amount, proration time, lifecycle and optional schedule ID. Applying intent commits before provider mutation, per-intent idempotency prevents duplicate charges, and retries beyond the provider key window require reconciliation. Strict DTOs exclude customer IDs and client-selected prices/amounts. Checkout/payment client secrets remain Owner-only, no-store and in browser component memory. Existing grants and token ledger rows are preserved.

Local validation: real sandbox upgrades charged the exact previewed amount, preserved renewal and 500 consumed tokens, and survived concurrent confirmations. Scheduled downgrade/Free/undo worked; stale quotes, undone-intent replay, Admin, other workspace, forged amount and cross-origin requests are denied. Decline/expiry kept Standard and its 5M allowance. A browser completed Free → Standard through embedded Billing without leaving SalesMora. Plan picker/review stories passed desktop/mobile accessibility and overflow checks. Unit/type/lint/Storybook/app checks completed. Test subscriptions/customers were cleaned up. Local Docker migration only; no staging deployment or live charges.

Remaining separate sections: standalone payment-method/billing-contact management, older invoice pagination, complete lead/seat/campaign/storage admission enforcement, deletion, and a coherent approved staging release. Campaign over-limit retention selection applies when that module is implemented; this plan-change section does not invent campaign/storage counters.

## Billing actions aligned with the app — local UI follow-up

Change plan now opens a portal-based MUI dialog from Billing instead of an inline section. Plan comparison stays wide; the Stripe payment step uses a compact dialog, with focus enforcement relaxed while Stripe handles its own overlays. The background is dimmed, accidental backdrop clicks do not dismiss the flow, in-flight actions block closing, and focus returns to the trigger (or the remaining Change plan button if cancellation removes its trigger).

The live Owner page now shows Cancel subscription for a paid plan. It opens a dedicated compact cancellation review, fetches a fresh server quote for Free at period end, and requires Confirm cancellation. Opening or dismissing the dialog never cancels. After confirmation, the live cancellation notice includes Keep subscription, using the existing authenticated undo endpoint. Conflicting payments/scheduled changes disable new cancellation with an explanation. Admin remains read-only. Change plan keeps its meaning even when a downgrade is scheduled: it opens the scheduled-change dialog rather than silently undoing it.

Updated Settings/BillingPage previews to exercise the same dialog behavior; added Billing/PlanChangeDialog stories. Local sandbox browser checks covered modal selection, Escape/focus restoration, cancellation open/dismiss/confirm/undo and mouse-completed embedded payment. Both dialogs passed mobile/desktop accessibility and overflow review; web type/lint/app/Storybook checks passed. No database migration, new billing policy or staging deployment in this follow-up. Standalone payment/contact management and remaining quota enforcement stay separate.

## Approved staging release — October 13, 2026

The user approved deploying these sections together. Registration pricing, embedded purchase, connected Billing, plan changes and cancellation/undo are now deployed on staging, with the three additive billing migrations and matching worker. Stripe remains sandbox-only. Public HTTPS checks completed a fictional purchase, verified invoice/allowance visibility, exercised cancellation and undo, and confirmed asynchronous cancellation reconciliation. The test subscription was canceled and session signed out. Production is unchanged. See [the staging release record](railway-staging.md#registration-and-billing-release--october-13-2026) for deployment IDs, validation and remaining scope. Historical local-only notes above describe the state at those earlier checkpoints.

## Connected Account settings — local follow-up

Account now appears beneath Settings and in the user account menu, with an authenticated `/settings/account?workspace=…` route. It displays the current session's name/email and server-resolved workspace role; links preserve workspace selection. Active teammates can reach personal Account settings independently of business-settings grants. Existing business settings and billing authorization remain enforced. Settings overview also links to Account; viewers without workspace-settings access land on personal settings instead.

The approved deletion design remains visible but its action is disabled in the connected app, with an explicit unavailable notice. Simulated confirmation remains limited to fictional Storybook props; no deletion endpoint, password submission or simulated-success flow is connected to real accounts. Full deletion and provider cancellation remain a separate implementation section.

Local validation: workspace type checks and lint passed. Desktop/mobile Account and submenu previews passed accessibility/overflow checks. A fictional signed-in Owner navigated from Home to Account and saw its real profile and workspace-scoped Billing link. Signed-out requests redirected to login and another workspace did not expose Account details. The fictional session was signed out. No migration or staging deployment in this follow-up.

## Account deletion connected — local implementation

The approved permanent-deletion workflow is now connected to Account. Current password, exact confirmation and acknowledgement are checked on the server. Access and all actor sessions end at acceptance; the durable worker verifies sandbox subscription cancellation before purging application data, with retries on provider failure and no recovery window. Teammates' shared business records and unrelated workspaces remain intact. Billing/security audit and accounting retention is disclosed before confirmation. No staging deployment in this section. See [account deletion](account-deletion.md) for file responsibilities, validation, retention scope and worker operation.

## Embedded payment-method design — October 14, 2026

Added the local PaymentMethodDialog design and Billing Storybook entry points. The Owner saves a verified renewal card, then separately confirms the exact outstanding invoice amount for recovery; Admin remains read-only. Busy, verification, error and success states are previewed with fictional callbacks. No live route/payment adapter, migration or staging release in this design section. See [payment-method design and implementation scope](billing-payment-methods.md); review the preview before connecting the provider boundary.

## Renewal card updates — connected local section, October 14, 2026

Connected Billing's Payment details action to embedded Stripe card setup and Owner-authorized renewal-default updates. Both customer and subscription defaults are verified before success, with durable consent, replay protection, partial-write reconciliation/backoff and account-deletion cleanup. Saving a card leaves explicit outstanding-invoice payment as a separate future action. The local sandbox/mobile browser check and 392 unit/type/lint/build checks passed; no staging deployment or new environment variables. See [card update implementation](billing-payment-methods.md#card-updates-connected-locally--october-14-2026).

## Failed-payment recovery design — October 14, 2026

Added Billing/PaymentRecoveryDialog with invoice/card review, explicit amount-labelled payment, processing/bank-verification/confirmation states, unknown-result status refresh, changed balances, declines and paid/already-paid outcomes. The preview reuses the approved card-update dialog and returns to the unpaid invoice without charging. Admin stays readonly. Local desktop/mobile interactions, accessibility, types/lint and Storybook build checks passed. Await user design review before page/provider integration, as requested. See [payment recovery](billing-payment-recovery.md).


## Failed-renewal recovery — connected locally, October 14, 2026

The approved payment-recovery dialog is now connected to Billing and Stripe sandbox. Owners review and explicitly pay the current renewal invoice, with linked bank verification, duplicate/replay protection, status-only refresh and durable worker reconciliation. Saving a card remains separate. Admin cannot pay. Recovery preserves renewal dates and monthly usage; pending attempts block conflicting billing changes and are canceled during account deletion. The additive recovery migration is applied locally. No new environment variables or staging deployment. See [implementation and validation](billing-payment-recovery.md#connected-locally--october-14-2026).


## Lead and teammate admission — connected locally, October 14, 2026

Implemented the approved 100/1,000/5,000 monthly lead limits and 1/5/20 teammate capacities on the existing server creation/acceptance paths. Manual and confirmed-chat lead creation share the transaction check; a database admission ledger prevents deletion/replay from replenishing quota. Seat acceptance converts live reservations, respects downgrades and does not double-count accepted invitations. Expired sent links release their reservation. Existing-workspace transition deadlines remain unchanged, and subscription reconciliation serializes with admission. Billing meters now use the durable lead ledger and shared seat count. No new environment variables or staging release. Campaign/storage modules and future ongoing invite-management UI remain separate. See [plan-limit enforcement](plan-limit-enforcement.md).


## Complete invoice browsing — connected locally, October 14, 2026

Billing now appends older invoices in pages of 12 until the full customer history is reached. Loading/errors preserve visible rows; retry, count/end feedback, refresh reset and stale-response guards are connected. Every page rechecks Owner/Admin billing access and validates the cursor against the mapped workspace customer. Previous paid invoices remain visible after a move to Free. No migration, new variables, charges or staging deployment. See [invoice history](billing-invoice-history.md) for files, previews and validation.


## Approved follow-up staging release — October 14, 2026

Released Account/deletion, embedded renewal-card management, explicit renewal recovery, lead/seat admission and invoice-history paging together. Both web and worker reached SUCCESS; the migration runner completed through the lead-tracking trigger. HTTPS fictional-account checks passed for embedded purchase/card update, invoice/allowance/lead-meter visibility, scope/Origin denial, deletion login redirect/session revocation and worker subscription cancellation. Stripe remains sandbox-only. Billing-contact editing is deferred. See [release evidence](railway-staging.md#billing-and-account-follow-up-release--october-14-2026).
