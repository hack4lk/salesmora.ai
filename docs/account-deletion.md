# Account and workspace deletion

Implemented locally on October 13, 2026. No staging release in this section. This is a user-confirmed permanent action, with immediate access revocation and no recovery/undo endpoint.

## Behavior

Settings → Account uses the authenticated session and current server-resolved membership. Teammates can delete their personal account without deleting workspace business records. An Owner must confirm deletion of their owned workspace and account together. A user who owns a different workspace cannot bypass ownership by deleting from a teammate membership: the server requires opening their owned workspace. Ownership transfer remains a separate, unimplemented workflow.

The confirmation requires current password verification against the locked credential record, exact workspace name (Owner) or email (teammate), and explicit acknowledgement. Client role, user/customer/subscription IDs and unknown fields are rejected. The server rechecks Owner `workspace.delete`, ownership and membership; no assistant tool exposes deletion. Rate limiting permits five validly shaped attempts per account per minute. Requests require the configured exact Origin and an authenticated session; responses are no-store.

Acceptance commits a durable request, marks the user and owned workspace as deleting, revokes all of that user's sessions, cancels active chat turns and revokes pending workspace invitations. Personal and workspace authorization reject tombstoned identities/workspaces. New sign-ins cannot create a usable session; workspace creation and invitation acceptance also reject pending users. Other teammates retain their accounts and access to unrelated workspaces.

The deletion worker runs independently of AI/help ingestion and billing flags, every five seconds. For an owned workspace it uses the existing billing advisory lock, verifies the server's Stripe sandbox customer/subscription mapping, expires open Checkout, cancels subscription schedules and subscriptions immediately without a final invoice or refund proration, and checks the canceled provider state. It also voids an open incomplete/pending-upgrade invoice before cancellation to prevent a stale recovery form from completing that unpaid purchase. Already-paid invoices are retained; no automatic refund is issued.

An uncertain customer creation is recovered using its original idempotency key only inside the safe 23-hour window. Missing/changed mappings, unavailable provider configuration or provider failure leave the request pending with a generic retry marker. The worker retries after one minute; it does not delete the customer mapping or claim purge completion while cancellation is unverified. A crash after cancellation is safe: the next attempt reads current provider state before purging. Multiple workers serialize on the billing/workspace/request locks.

After provider cancellation is verified, a database transaction deletes transcripts, action drafts and LangGraph checkpoint rows, workspace leads/services/invitations/policies, checkout/plan-change/subscription mappings and workspace token overrides. Personal deletion removes the user's private chat/checkpoints across memberships, clears their lead assignments while preserving shared leads, and removes their user, credentials, sessions and memberships. The request becomes completed only after this purge commits.

## Retained data and scope

The confirmation explicitly discloses that Stripe payment/invoice records and SalesMora billing/security audit and usage accounting records remain. Immutable authorization audit records retain opaque workspace IDs without a workspace foreign key; their immutability triggers remain enabled. Chat action audit records contain action metadata/hashes, not the draft transcript. Existing usage counters remain, with the deleted user's ID removed from current rows. Completed deletion requests retain opaque user/workspace IDs and lifecycle timestamps, without passwords or confirmation text. Backup copies follow the hosting retention policy; this workflow cannot erase immutable backup copies directly.

Current workspace application data lives in PostgreSQL. There is no tenant file-upload store, workspace document/vector index or workspace automation queue implemented yet. Shared published help vectors and global retention/help queues are preserved. Future storage/index/job modules must add explicit deletion adapters before exposing tenant content. Commercial retention periods, backup policies, live Stripe support and ownership transfer remain release follow-ups; the sandbox implementation does not establish legal or production readiness.

## Files and operation

- `packages/contracts/src/account-deletion.ts`: strict confirmation request schema.
- `packages/data/src/migrations/202610140001_account_deletion.ts`: tombstone timestamps, durable queue and audit foreign-key adjustment (forward-only).
- `packages/data/src/account-deletion.ts`: acceptance, provider cancellation and retryable atomic purge.
- `apps/web/src/app/api/account/delete/route.ts`: Origin/session/rate/shape guards and Better Auth password verifier.
- `apps/web/src/features/settings/account-page/account-route.tsx`: scoped browser submission; passwords stay in component/request memory and are cleared after submission.
- `apps/web/src/features/settings/account-page/account-page.tsx`: approved confirmation UI, busy/error/accepted states; Storybook callbacks remain mocked.
- `apps/worker/src/account-deletion.ts`: startup schema check, bounded queue loop and graceful stop, connected by worker index.

Run `pnpm db:migrate` and `pnpm worker:dev` locally. Web and worker must both receive the new code and additive migration in a future staging release. Paid deletion requires that worker's sandbox Stripe configuration; Free accounts without a provider mapping require no Stripe key. No new environment variable is introduced.

Operator inspection: query `accountDeletionRequests` for `state = 'pending'`, examining `attempts`, `retryAt`, `lastError` and request IDs. Logs use `worker.account_deletion_retry_pending` without provider messages, credentials or account details. Investigate mapping/configuration issues with approved operator access; do not clear tombstones, reset a deletion into an active account, bypass provider verification, or blindly recreate an old uncertain customer. The worker resumes automatically when the cause is repaired.

## Validation

388 unit tests, workspace type checks, lint and the production app build passed. Six Storybook desktop/mobile confirmation/accepted-state checks passed accessibility and overflow review. The isolated local Docker browser test verified password failure, strict payload/Origin/session/tenant checks, confirmation dismissal without mutation, two-device session revocation, denial of sign-in and teammate access after tombstoning, personal chat/checkpoint purge and preservation of shared leads. It also verified ownership protection across memberships and preservation of another workspace and its business records.

A real Stripe sandbox subscription with a managed schedule and open Embedded Checkout was canceled/expired successfully. A simulated provider outage kept application data and a pending deletion request; a subsequent concurrent retry completed the purge once, preserving audit records. Stripe test customer/subscription resources were cleaned up. No real user account, production service or staging environment was deleted or changed.

Provider behavior follows Stripe's [subscription cancellation reference](https://docs.stripe.com/api/subscriptions/cancel) and [Checkout expiry reference](https://docs.stripe.com/api/checkout/sessions/expire).

## Post-confirmation navigation

After the deletion API accepts the request, the connected Account route performs a full `location.replace` navigation to `/login?accountDeletion=requested`. This removes the current Account entry and clears the signed-in React/Next route cache rather than leaving the revoked session's UI visible. Login shows an accepted-deletion notice that accurately describes background processing; it does not claim distributed purge has already completed. Rejected requests stay in the confirmation dialog with an error. Storybook callbacks continue to show mocked accepted states without real navigation.

## Payment-method intent integration — October 14, 2026

The local purge now verifies and cancels any incomplete card SetupIntents for the mapped customer before removing `billingPaymentMethods` rows. Succeeded setups remain with Stripe's retained customer/payment records; no new renewal-default update can pass authorization after tombstoning. The sandbox card-update integration test verified pending setup cancellation, subscription cancellation, intent-row purge and completed account deletion together.


## Staging release — October 14, 2026

This section was included in the approved combined staging release. Web and worker reached SUCCESS; migrations and HTTPS fictional-account verification completed. Stripe remains sandbox-only. Historical local-only notes above describe the earlier review checkpoints. See [release evidence](railway-staging.md#billing-and-account-follow-up-release--october-14-2026).
