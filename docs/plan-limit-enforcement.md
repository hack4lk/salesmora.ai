# Plan-limit enforcement

Status: connected locally, October 14, 2026. No staging deployment or new environment variables. This section implements admission limits for the existing lead and invitation paths; campaign/storage gates belong with their future modules. Existing AI token enforcement remains in place.

## Approved limits

| Capacity | Free | Standard | Premium |
| --- | ---: | ---: | ---: |
| New leads per calendar month | 100 | 1,000 | 5,000 |
| Teammates, including Owner and reservations | 1 | 5 | 20 |

Only the server's effective paid subscription or unexpired failed-renewal grace grants a paid allowance. Selected checkout plans do not. The approved existing-workspace transition defers admission enforcement until its original deadline without resetting it. Monthly lead periods are UTC calendar months, independent of renewal dates. Upgrades retain usage, and downgrades preserve existing data/members while blocking capacity-increasing actions.

## Server boundaries

`packages/data/src/billing/entitlements.ts` resolves current limits, locks the workspace for capacity decisions, counts live seat reservations and raises a typed `PlanCapacityError`. Permission/record authorization remains a separate prerequisite; the plan helper never grants roles or access.

`apps/web/src/server/leads/store.ts` checks capacity after authorization and idempotent replay lookup, inside the same write transaction as creation. Manual forms and confirmed assistant proposals share this path. A proposal alone consumes no lead slot. Failed attempts roll back; replay of a successfully created lead returns that lead even at capacity. A plan-limit rejection leaves a chat proposal pending so it can be retried after capacity is available or canceled. Forms and chat show an explicit monthly-limit message.

`apps/web/src/server/invitations/store.ts` checks capacity during invitation delivery and acceptance. Active teammates, queued/pending-verification invitations, unexpired sent invitations and paid-onboarding drafts reserve seats. Expired sent links and revoked/accepted invitations do not reserve an extra seat. Acceptance replaces its own reservation instead of adding a second seat. Existing membership is preserved. A downgrade that leaves the workspace over capacity blocks adding a teammate; no existing teammate is removed. The invitation remains available for a later retry after an upgrade or capacity release. `Auth/InvitationAcceptance/PlanCapacityReached` previews the feedback.

Subscription reconciliation locks the workspace before updating entitlements or releasing paid invitation drafts. Lead admission and seat changes therefore serialize with subscription changes. Billing uses the same seat usage calculation and the lead admission ledger for its meters.

Future invite-creation/resend paths must authorize the actor, check `assertSeatCapacity` in the same workspace write transaction, and insert/revoke reservations atomically. Future imports/forms/campaign intake must use the shared lead creation use case; inserting database rows directly is not an authorized application boundary.

## Database

- `202610140005_plan_admissions.ts` creates `workspaceLeadAdmissions` with one row per successfully created lead and a workspace/month index. Backfills existing leads using their creation dates.
- `202610140006_lead_admission_tracking.ts` installs an atomic AFTER INSERT tracking trigger and closes the migration/app-rollout gap with a locked, duplicate-safe backfill.

Both additive migrations are applied to local Docker development and the isolated test database. The ledger deliberately has no lead foreign key: deleting a lead does not restore the monthly creation allowance. Workspace deletion removes its ledger; existing security/billing/AI retention rules are unchanged. The trigger records all inserts, including trusted fixtures and future paths, but does not replace authorization or the transactional capacity check.

## Local validation

Four isolated quota tests passed: each tier's final lead slot under simultaneous requests; retry/deletion/UTC-period/transition accounting; confirmed-chat quota rejection and retry after upgrade; seat conversion/downgrade/expiry/concurrent reservation; exact 1/5/20 seat boundaries. Fixtures simulate trusted subscription state without making Stripe calls. Production credentials and staging data are not used.

395 unit tests, workspace type checks, lint and app/worker/Storybook builds passed. The capacity-feedback story passed interaction, focus, Axe and overflow checks at desktop/mobile widths, and its mobile screenshot was reviewed. All 29 existing lead/chat/invitation regressions passed, with two stale fixture expectations corrected and verified on focused rerun: personal Settings access and an explicit test-only billing flag in the delivery helper. A read-only local check confirmed zero existing leads were missing admission records after migration.


## Staging release — October 14, 2026

This section was included in the approved combined staging release. Web and worker reached SUCCESS; migrations and HTTPS fictional-account verification completed. Stripe remains sandbox-only. Historical local-only notes above describe the earlier review checkpoints. See [release evidence](railway-staging.md#billing-and-account-follow-up-release--october-14-2026).
