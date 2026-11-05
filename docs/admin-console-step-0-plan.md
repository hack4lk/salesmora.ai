# Admin console: Step 0 (Prerequisites) implementation plan

Status: **Approved** (October 28, 2026). All open decisions were accepted as recommended. Parent plan: [admin-console-plan.md](admin-console-plan.md) §10, step 0.

Step 0 changes only the existing apps and shared packages. Nothing in `apps/admin` is created yet. When it's done:

1. Each service connects with its own least-privilege PostgreSQL role (§5.2).
2. Users and workspaces can be suspended, and the customer app and worker enforce it (A8, U3, W3).
3. Workspaces can carry a time-boxed plan override that every entitlement check respects (W5).
4. The tenant mutations that the slice 1 admin pages need exist as tested use cases in `@salesmora/data`, so `apps/admin` never imports `apps/web` (H1, §5.3).

Each sub-step below ends with a review gate.

---

## What exists today (research summary)

| Area | Current state | Source |
|---|---|---|
| DB connections | One `DATABASE_URL` (owner `salesmora`) for web Knex, the Better Auth `pg.Pool`, the worker and the pre-deploy migrator. No `GRANT` or `CREATE ROLE` anywhere. | `packages/data/src/database.ts`, `apps/web/src/server/workspaces/store.ts`, `apps/web/src/server/auth/auth.ts`, `apps/worker/src/config.ts`, `packages/data/src/migrate.ts` |
| Local DB | Compose Postgres 17 + pgvector with user `salesmora`; `init.sql` creates `salesmora_test`. | `compose.yaml`, `infra/postgres/init.sql`, `scripts/setup-local.mjs` |
| Deletion blocking | A Better Auth `session.create.before` hook refuses sessions for users with `deletionRequestedAt`; `getSession()` re-checks on every request; `findWorkspace()` filters `workspaces.deletionRequestedAt`. | `auth.ts:122-126`, `session.ts:5-9`, `workspaces/store.ts:38-53` |
| Workspace guard | `loadWorkspaceAuthorization` / `withWorkspaceAuthorization` in `packages/data/src/authorization/store.ts` back most actions; some pages call `findWorkspace()` directly. No Next.js middleware. | `apps/web/src/server/authorization/permissions.ts` |
| Worker | No central job wrapper. Processors start separately (`startJobEmails`, `startVisitEmails`, `startFileProcessing`, and so on) and mostly derive `workspaceId` from DB rows. | `apps/worker/src/index.ts` |
| Effective plan | Computed in `workspaceEntitlements()` and again in `readWorkspaceBilling()`. | `packages/data/src/billing/entitlements.ts:15-27`, `billing/summary.ts:20-29` |
| Shared use cases | Already shared: account deletion, plan change, recovery, AI budget. Missing or web-only: session revocation, member removal, invitation resend/revoke, ownership transfer, mark verified, password reset/verification emails. | `packages/data/src/index.ts`, `apps/web/src/server/invitations/store.ts`, `apps/web/src/server/email/*` |

---

## 0a. Database roles

| # | Change | Files |
|---|---|---|
| 0a.1 | Idempotent provisioning script `pnpm db:roles` that creates the login roles `salesmora_web`, `salesmora_worker` and `salesmora_admin_app` (passwords from env, never logged) and the group role `salesmora_runtime`. The existing owner `salesmora` becomes the migrator role (it already owns every object, so no ownership changes). | `scripts/db-roles.mjs`, `infra/postgres/roles.sql` |
| 0a.2 | Migration `…_runtime_grants.ts`: grants DML on all `public` tables and sequences to `salesmora_runtime`, plus `ALTER DEFAULT PRIVILEGES` so future tables are covered. Web and worker inherit it. `salesmora_admin_app` gets `SELECT` only on `public` for now (its writes are granted per table in step 2). No `TRUNCATE`, DDL or `CREATE` on any schema for runtime roles. Skips cleanly if the roles don't exist yet, so existing environments don't break. | `packages/data/src/migrations/` |
| 0a.3 | Connection wiring: `migrate.ts` reads `MIGRATION_DATABASE_URL ?? DATABASE_URL`; web and worker keep `DATABASE_URL`, which now points to their own role. Railway variables updated in staging. | `packages/data/src/migrate.ts`, `.railway/railway.ts` comments, `docs/` runbook |
| 0a.4 | Local and test parity: `setup-local.mjs` runs `db:roles` and writes per-role URLs into `.env.local`, so tests and e2e run as `salesmora_web`, not as the owner, and catch missing grants. | `scripts/setup-local.mjs`, `infra/postgres/init.sql` |
| 0a.5 | Startup self-check: web and worker log their `current_user` and fail fast in production if it's the owner role. | `apps/web/src/server/...`, `apps/worker/src/config.ts` |

**Validation:** a DB test proves `salesmora_web` can read and write tenant tables and can't `DROP`, `ALTER` or `TRUNCATE`; the whole existing unit, DB and e2e suites pass under the runtime role.

**Status: implemented locally and approved (October 28). The Railway rollout is pending.** Runbook: [database-roles.md](database-roles.md).

How the implementation differs from the table above:

- **Files.**
  - The provisioning script is `packages/data/src/db-roles.ts` (`pnpm db:roles` / `db:roles:test`).
  - The shared grant logic is in `packages/data/src/runtime-roles.ts` and is used by both the script and the migration `202610280001_runtime_grants`.
  - No SQL file and no `init.sql` change were needed.
- **Admin reads.** `salesmora_admin_app` can't read `accounts`, `verifications`, `rateLimits`, `sessions.token` or `estimate_share_tokens.encryptedToken`. The plan said "SELECT on `public`", which would have exposed credentials.
- **Self-check (0a.5).** It runs in `apps/web/src/instrumentation.ts` and at worker startup. It flags a superuser, a database owner, or a role with `CREATE` on `public`.
  - By default it only warns.
  - It fails when `DATABASE_ROLE_ENFORCED=true`, rather than failing whenever `NODE_ENV=production`. This keeps staging deploying until the roles are provisioned.
  - Local setup sets the flag to `true`.
- **Tests.** Test fixtures and rehearsals keep the owner `TEST_DATABASE_URL`, because they TRUNCATE tables and create schemas. The e2e app server and a `--test` worker use `TEST_APP_DATABASE_URL` (`salesmora_web`).
- **Results.**
  - `pnpm test:grants:db`: 24 checks.
  - Migration down/up cycle passed.
  - Unit suite: 3,125 tests passed. Typecheck clean, lint 0 errors.
  - e2e subset run as `salesmora_web` (login, leads, ai-usage, email verification): 28 of 28 passed after a cold-start retry.
  - Worker: starts as the runtime role, refuses the owner when enforced, warns when not enforced.

## 0b. Suspension columns and enforcement

| # | Change | Files |
|---|---|---|
| 0b.1 | Migration: `users.suspendedAt`, `users.suspendedReason`, `workspaces.suspendedAt`, `workspaces.suspendedReason` (nullable; the reason is internal and never shown to customers, per W8). Partial indexes on `suspendedAt IS NOT NULL`. | `packages/data/src/migrations/` |
| 0b.2 | Shared domain helpers in `@salesmora/domain`: `isUserBlocked(user)`, `workspaceAccess(workspace)` returning `active`, `suspended` or `deleting`. | `packages/domain/src/accounts/` |
| 0b.3 | Customer auth: the `session.create.before` hook and `getSession()` reject users with `suspendedAt` as well as `deletionRequestedAt`. Sign-in shows a generic "This account is unavailable. Contact support." message. | `apps/web/src/server/auth/auth.ts`, `session.ts`, login page |
| 0b.4 | Workspace guard: `loadWorkspaceAuthorization` throws a typed `WorkspaceSuspendedError`; `findWorkspace()` returns the suspension state; pages redirect to a new `/workspace-suspended` page and API routes return `423 Locked` with a generic message. Members can still sign out and switch to another workspace they belong to. | `packages/data/src/authorization/store.ts`, `apps/web/src/server/workspaces/store.ts`, `apps/web/src/app/(auth)/workspace-suspended/page.tsx` (+ story) |
| 0b.5 | Worker: a shared `skipIfWorkspaceSuspended(db, workspaceId)` guard at the start of every workspace-bearing processor. Outgoing customer email and file processing are **held** (left pending and retried after unsuspend), not dropped. Retention, deletion and billing reconciliation keep running. | `apps/worker/src/*.ts`, `packages/data/src/accounts/` |
| 0b.6 | Shared use cases `suspendUser`, `unsuspendUser`, `suspendWorkspace` and `unsuspendWorkspace` in `@salesmora/data`. In one transaction each sets or clears the columns, deletes the user's sessions (for user suspension) and writes `authorizationAudit`. They take an `actor` argument so step 2 can add the `admin.auditEvents` row in the same transaction. Suspending a workspace queues the generic Owner notice email (W8). | `packages/data/src/accounts/suspension.ts` |

**Validation:** unit tests for the domain helpers; DB tests for the use cases (sessions revoked, audit written, idempotent); e2e: a suspended user can't sign in, an existing session is rejected on the next request, members of a suspended workspace see the suspension page, API calls get 423, and unsuspending restores access; worker tests: held jobs resume after unsuspend.

**Delivery:** in three reviewed parts: (1) data layer 0b.1, 0b.2, 0b.6; (2) web enforcement 0b.3, 0b.4; (3) worker 0b.5 and the Owner notice email.

**Part 1 status: implemented locally and approved (October 28).** Migration `202610280002_suspension`, `packages/domain/src/accounts/suspension.ts`, `packages/data/src/accounts/suspension.ts`; rehearsal `pnpm test:suspension:db` (12 checks; the use cases run as `salesmora_admin_app`). Differences from the table:

- **Audit table.** A new immutable `suspensionAudit` table (subject, action, actor type and ID, reason) replaces `authorizationAudit`, which requires a workspace and policy revisions and can't record user suspensions.
- **Owner notice.** `suspendWorkspace` inserts a row into a new `workspaceSuspensionNotices` outbox; the worker sends it in part 3. Unsuspending skips a notice that hasn't been sent.
- **Extra effects.** Suspending cancels the user's or workspace's active chat turns, matching account deletion. A deleting user or workspace can't be suspended. A database check requires a reason whenever `suspendedAt` is set.
- **Actor.** `{ type: 'staff' | 'system', id }`. Passing a transaction as `db` lets step 2 add `admin.auditEvents` in the same commit.
- **Isolation (review, October 28).** Only the admin app can change suspension state; the customer app's roles can't forge or undo it.
  - The `suspension_columns_guard` trigger rejects changes to `suspendedAt`/`suspendedReason` by any `salesmora_runtime` member. A trigger is used because web keeps table-level `UPDATE` on `users` for Better Auth.
  - `suspensionAudit` and `workspaceSuspensionNotices` are staff-only (`STAFF_ONLY_TABLES`). The worker gets only `SELECT, UPDATE` on the notice outbox.
  - `salesmora_admin_app` gets just the writes these use cases need (`ADMIN_WRITES` in `runtime-roles.ts`), rather than waiting for step 2. This follows §5.2.

**Parts 2 and 3 status: implemented locally and approved.** The support copy stays without an address for now. These were combined into one review so the central guard never ships without the worker hold; otherwise queued emails for a suspended workspace would be marked skipped. The API decision is **423 Locked** with the body `{ error, code: 'workspace_suspended' }` and no reason. Validation: `pnpm test:suspension:db` (12 + 8 hold checks, processors run as `salesmora_worker`), the e2e spec `workspace-suspension.spec.ts`, and the unit suite.

- **Guard (0b.4).** `WorkspaceSuspendedError` extends `AuthorizationAccessError`, so any caller that doesn't know about it still fails closed. `lockedWorkspace` throws it; `loadContext` refuses suspended users with a plain access error, so a user suspension never looks like a workspace suspension.
- **Pages.** `findWorkspace()` redirects to `/workspace-suspended` when the workspace is suspended, and prefers an active workspace when none is requested. API code uses `findWorkspaceRecord()`, which doesn't redirect. The page lists the member's other active workspaces and offers sign-out (`features/auth/workspace-suspended-notice`, with a story). There was no prototype, so it uses the existing `AccountLayout` auth-screen pattern.
- **API.** `server/http/suspension.ts` returns the 423. It runs first in every catch block that maps `AuthorizationAccessError`, covering 27 route files directly (including both export `failure()` helpers and `jobs/[jobId]/messages`), plus the shared `server/*/http.ts` mappers, `server/notifications/api.ts` and `chatError`. The chat-turn stream is already running, so it isn't given a 423 mid-stream; the request is refused before streaming starts.
- **Auth (0b.3).** The session hook throws `LOCKED` (423) for a suspended user. It runs only after the password check, so it doesn't reveal which emails have accounts. `getSession()` also checks `suspendedAt`. The login form shows "This account is unavailable. Contact SalesMora support."
- **Worker hold (0b.5).** Instead of a per-processor `skipIfWorkspaceSuspended`, the shared `withoutSuspendedWorkspaces(query, column)` filters candidate queries in the six email processors, file processing and the orphan sweeper. Each processor's catch block also leaves the row queued on `WorkspaceSuspendedError`, which covers a suspension that lands mid-batch. The deadline reminder scheduler skips suspended workspaces. Estimate expiry and reminder scheduling still run, but their emails are held.
- **Owner notice.** `processWorkspaceSuspensionNotices` runs as the worker and is deliberately not held. It sends to a verified Owner email, skips the notice if the workspace is no longer suspended, and retries with exponential backoff up to 5 times. The template is `email/workspace-suspended` with a test and an `Email/WorkspaceSuspended` story. It has no reason and no links.
- **Known limits.**
  - Some outboxes have staleness rules; for example, assignment emails older than 23 hours are skipped. Email held through a long suspension may therefore be skipped after unsuspend.
  - Members can't request account deletion from inside a suspended workspace, because it goes through workspace authorization. Staff handle that case.
  - No support contact address exists yet, so the copy says "Contact SalesMora support" without an address.

## 0c. Plan override

| # | Change | Files |
|---|---|---|
| 0c.1 | Migration: `workspaces.planOverride` (`standard`/`premium`), `planOverrideEndsAt`, `planOverrideReason`, with a check constraint that both are set together. | `packages/data/src/migrations/` |
| 0c.2 | One `effectiveWorkspacePlan(subscriptionRow, workspaceRow, now)` function in `@salesmora/domain`; `workspaceEntitlements()` and `readWorkspaceBilling()` both use it, removing the duplicated plan logic. Billing summary shows both the billed plan and the override (Stripe keeps billing the original plan, per W8). | `packages/domain/src/billing/`, `packages/data/src/billing/entitlements.ts`, `summary.ts` |
| 0c.3 | Use cases `applyPlanOverride` and `clearPlanOverride`: end date at most 12 months away, write `billingAudit` (`plan.override_applied`/`plan.override_cleared`). Expiry needs no job because the check is time-based; a daily worker task only writes the `plan.override_expired` audit row. | `packages/data/src/billing/plan-override.ts`, `apps/worker/src/billing.ts` |

**Validation:** unit tests for `effectiveWorkspacePlan` (no override, active, expired, override lower than billed plan); DB tests for limits (seats, leads, AI tokens) under an override; the existing `plan-admissions` and `billing-checkout` e2e pass.

**Decisions (October 29):** the higher of the billed plan and the override applies, so an override never removes paid capacity. Customers see the override on the billing page, but never the reason. A database guard means only the admin app can change it. There is no expiry email. Delivery is in two reviews: (1) data layer and worker; (2) billing page display, with stories and e2e.

**Part 1 status: implemented locally and approved (October 29).** Migration `202610290001_plan_override`, `packages/domain/src/billing/plan-override.ts` (with a unit test), `packages/data/src/billing/plan-override.ts`, and the worker task `apps/worker/src/plan-override-expiry.ts`. Validation:

- `pnpm test:plan-override:db`: 9 checks. The use cases run as `salesmora_admin_app`, the limits as `salesmora_web` and the expiry audit as `salesmora_worker`.
- Unit tests and the grants, suspension, AI usage and job settings rehearsals pass.
- `plan-admissions` passes, and the local `billing-checkout` tests pass. The live-Stripe tests stay opt-in. The first registration test of a fresh dev server can fail because it fills the form before the page hydrates; this happens without any 0c change and passes on a warm server.

Differences from the table:

- **Columns.** A fourth column, `planOverrideId`, identifies each grant. Its expiry is then audited exactly once, enforced by a unique index on `billingAudit`, even if staff grant the same plan again. A check constraint requires all four columns to be set or all four to be empty.
- **Isolation.** The `plan_override_columns_guard` trigger blocks the customer-app roles, following the 0b pattern. `ADMIN_WRITES` gains the four columns and `INSERT` on `billingAudit`.
- **Single plan rule.** `effectiveWorkspacePlan()` also replaces a third copy of the rule in `workspaceAIAllowance()`. A per-workspace `workspaceAITokenBudgets` value still takes precedence for AI tokens. Overrides only affect limits when sandbox billing is enforced, exactly like paid plans.
- **Use cases.**
  - Applying an override replaces any existing one; the audit records both the new and the previous grant.
  - Clearing requires a reason. Clearing a workspace with no override is a no-op.
  - A workspace being deleted can't get an override; a suspended workspace can.
  - Audit `details` include `actorType`.
- **Expiry.** The worker checks hourly rather than daily. It leaves the expired values in place so staff can see what ended. The next apply or clear replaces them.
- **Billing summary.** `readWorkspaceBilling()` uses the shared function for the billed plan. The snapshot doesn't include the override until part 2. Until then, the AI allowance on the billing page already reflects an override, but the plan name doesn't.

**Part 2 status: implemented locally and approved (October 29).** The billing page shows an active override:

- **Snapshot.** The billing summary gains `override: {plan, endsAt}`. It's included only when the override raises the plan. The reason is never included. `plan` stays the billed plan, so plan changes, cancellation and payment details still follow the subscription.
- **Billing page.**
  - The plan name shows the override plan with a "Complimentary" pill.
  - The price stays the billed price.
  - A note under the price gives the end date and what applies after it: "Complimentary access until December 31, 2026. There's no charge, and Free limits apply after that." On a paid plan, it reads "You're still billed for Standard, and Standard limits apply after that."
  - Usage meters use the override plan's limits.
- **Stories.** `ComplimentaryPlan` and `ComplimentaryAbovePaidPlan`, with play tests at desktop and mobile widths.
- **E2E.** `apps/web/e2e/plan-override.spec.ts` (needs `SALESMORA_BILLING_TEST=1`) checks the following:
  - The summary includes the override with raised limits, and not the reason.
  - The page shows the plan, pill and note.
  - Everything disappears once the override has ended or been cleared.

## 0d. Move use cases into `@salesmora/data`

Only what the slice 1 pages (Users, Workspaces) need. Each move keeps the web app working through the same function, with tests.

| # | Use case | Today | Change |
|---|---|---|---|
| 0d.1 | `revokeUserSessions(userId, sessionIds?)` | Doesn't exist | New; deletes `sessions` rows; audited. |
| 0d.2 | `removeWorkspaceMember` | Policy only (`team.remove`) | New transactional use case; refuses the Owner; audited. |
| 0d.3 | `resendWorkspaceInvitation`, `revokeWorkspaceInvitation` | Web-only (`invitations/store.ts`) | Move token and status logic to `@salesmora/data`; web keeps calling it. |
| 0d.4 | `transferWorkspaceOwnership` | Doesn't exist | New; updates `workspaces.ownerId` and both memberships atomically (previous Owner becomes Admin, per W8); adds a DB-level "exactly one owner" guard; audited. |
| 0d.5 | `markEmailVerified` | Inline in `acceptInvitation` | Extract; audited. |
| 0d.6 | Email templates and senders (password reset, verification, invitation, workspace suspended) | `apps/web/src/server/email/*` | Move to `@salesmora/data/email` (the subpath export already exists) so both apps send the same email. Token creation for password reset stays with the customer Better Auth instance; see decision D4. |

**Validation:** DB tests for each use case; the existing invitation, workspace and account-deletion e2e suites pass unchanged.

**Findings (October 29):**

- **Mostly new code.** The customer app has no remove-member, resend or revoke invitation, or ownership transfer feature today, so 0d.1–0d.4 are new use cases rather than moves. Only invitation delivery and acceptance move.
- **The owner guard already exists.** The deferred trigger `authorization_check_owner` (from the authorization migration) already enforces "exactly one owner", so 0d.4 adds no new guard.
- **One owned workspace per user.** `workspaces.ownerId` is unique.
- **Lead ownership.** `leads.ownerId` references `users` (not the membership), so it doesn't block member removal, but a removed member would keep owning leads in a workspace they left. Jobs and work orders reference the membership and clear the assignee; job team and work order crew rows are deleted with it. (Corrected during part (b); the first finding said the lead reference blocked removal.)

**Decisions (October 29):**

- **Audit.**
  - Workspace actions (remove member, invitations, ownership transfer) write to the existing `authorizationAudit`.
  - Session revocation and mark-verified write to a new `accountAudit` table, which can't be updated or deleted, like `suspensionAudit`.
  - The staff audit of record still arrives in step 2.
- **Removing a member** unassigns their leads, the same as jobs and work orders.
- **Ownership transfer** is refused unless the new Owner is a verified member who doesn't own another workspace. The previous Owner becomes an Admin (W8).
- **The transfer email** is one simple email in the workspace-suspended style, with stories for the new Owner and the previous Owner. The copy is reviewed with part (c).
- **Resending an invitation** keeps the existing rule: the Owner's email must be verified. Staff can mark it verified first (U6).
- **Delivery in three reviews:**
  - (a) Session revocation, mark-verified and the email move.
  - (b) Remove member and invitations.
  - (c) Ownership transfer and its email.
- No customer-app UI is added. The use cases are for the separate admin app only.

**Part (a) status: implemented locally and approved (October 29).**

- **Migration `202610290002_account_audit`.** Adds the `accountAudit` table. Its rows can't be updated or deleted. It is staff-only, so the web and worker roles can't read or write it.
- **Admin grants.** `ADMIN_WRITES` gains `users.emailVerified`/`updatedAt` and `INSERT` on `accountAudit`.
- **`revokeUserSessions`** (`packages/data/src/accounts/account-actions.ts`).
  - Revokes all of a user's sessions, or only the selected ones (1–100 IDs).
  - Session IDs that belong to another user are ignored.
  - The audit row records the scope and the revoked IDs. Revoking nothing writes no audit row.
- **`markEmailVerified`.**
  - Refuses a user being deleted. Repeating it does nothing.
  - The Owner's queued invitations go out the next time they open Home, as after a normal verification.
  - Invitation acceptance keeps its own update, because it also completes onboarding and is already audited in `authorizationAudit`.
- **Reasons.** Both use cases require a reason (U8), checked by `normalizeStaffReason` in `@salesmora/domain`.
- **Email move.** The team invitation, email verification and password reset templates now live in `@salesmora/data/email`, with a unit test. The web template files re-export them, so the senders and stories are unchanged.
  - The senders stay in the web app. Verification and password reset links come from the customer Better Auth instance (D4).
  - The invitation sender also stays per app (see part (b)).
- **Fix.** The 0b change to `apps/web/src/server/workspaces/store.ts` imported `next/navigation` at the top. That broke the invitation e2e helper, which loads the store outside Next. The import now happens only when redirecting to the suspension page.
- **Validation.**
  - `pnpm test:account-actions:db`: 9 checks, run as `salesmora_admin_app`.
  - Unit tests pass, as do the grants, suspension and plan-override rehearsals.
  - The verification, password reset and registration e2e suites pass. In `invitations`, every test passes except one: it still expects the "Campaigns" nav item, which the in-progress lead-capture work renames.
  - The email stories pass.

**Part (b) status: implemented locally and approved (October 29).**

- **Shared token helpers** (`packages/data/src/workspaces/invitation-tokens.ts`). The token, its hash, the seven-day lifetime and the link format. The web delivery in `apps/web/src/server/invitations/store.ts` now uses them, so both apps issue identical links.
- **Grants-only migration `202610290003_team_admin_grants`.** `ADMIN_WRITES` gains `DELETE` on `workspaceMemberships`, the assignment columns on `leads`, `INSERT` on `leadActivity`, the delivery columns on `workspaceInvitations`, and `INSERT` on `authorizationAudit`. The admin app still can't create invitations, change roles, or edit any other lead field.
- **Use cases** (`packages/data/src/workspaces/team-actions.ts`). Each requires a reason and writes one `authorizationAudit` row (`member.removed`, `invitation.revoked`, `invitation.resent`) with the staff actor, the reason and the details. The policy revision doesn't change.
  - **`removeWorkspaceMember`.** Refuses the Owner ("transfer ownership first") and workspaces being deleted; suspended workspaces are allowed. Unassigns the member's leads, archived ones included, with an "assigned" activity entry by "SalesMora support" on each.
  - **`revokeWorkspaceInvitation`.** Works on open invitations; the link then shows "revoked". Accepted invitations are refused ("remove the member instead"). Repeating it does nothing.
  - **`resendWorkspaceInvitation`.** Sends a new seven-day link, and the previous link stops working. Expired links can be resent. It follows the normal delivery rules: the workspace isn't suspended or being deleted, the Owner's email is verified, the original inviter can still invite that role, there's a free seat, and the last attempt was over a minute ago. The email is sent last inside the transaction, so a failed send changes nothing and the old link keeps working.
- **The invitation sender stays per app.** Each app has its own email transport and logo file, so the caller passes the send function. The template is shared (part (a)).
- **Not changed:** `customers.ownerId` and `estimates.ownerId` reference `users` and keep the removed member's name. They are records of who handled the work, not assignments.
- **Fixes found during validation.**
  - The token change had dropped an import that the invitation acceptance rate limit still uses. The invitations e2e caught it, and it's restored.
  - `pnpm -s typecheck` hides the output of the failing package. Run without `-s`, it found a type error in the 0c `ComplimentaryPlan` story, now fixed. Typecheck is checked by exit code from here on.
  - The 0b suspension rehearsal asserted the admin app can't delete memberships. It now asserts it can't change a member's role.
- **Validation.**
  - `pnpm test:team-actions:db`: 13 checks, run as `salesmora_admin_app`.
  - Typecheck and lint pass (0 errors); 3,198 unit tests pass.
  - The grants, suspension, suspension-hold, plan-override and account-actions rehearsals pass.
  - In `invitations`, 11 of 12 pass. The failure is the same "Campaigns" nav item as in part (a).

**Follow-up fix (approved with part (b)): authorization and leads rehearsals.** These rehearsals failed for two reasons:
- **The seed outgrew its constraint.** The Oct 12 authorization migration seeded from the live `defaults-v1.json`. That file now gives Office `estimates.archive`/`delete`, which the Oct 12 constraint rejects.
- **Partial replay.** The rehearsals replayed a hand-picked set of migrations, then ran current store code that reads newer columns, such as 0b's `suspendedAt`.

What changed:
- **Full replay.** `replayMigrations` (`packages/data/src/migration-replay.ts`) runs the real migration files in order in a scratch schema. Each rehearsal seeds its legacy data right before the migration it tests, then replays every later migration. Assertions about policy revisions and audit counts are now relative to the replayed state.
- **The Oct 12 migration** seeds only the grants its own constraints allow. Later migrations add the rest. Databases that already ran it, and fresh installs, are unaffected, because it only seeds existing workspaces.
- **`applyRuntimeGrants`/`revokeRuntimeGrants`** target `current_schema()` instead of a hard-coded `public`. Every deployment uses `public`, so nothing changes there, and a scratch-schema replay grants inside its own schema.
- **Result:** authorization rehearsal 17 checks, leads 39. The calendar and jobs rehearsals, which also import migrations, still pass.
- **Estimates rehearsal, fixed with approval:** it expected the delivery failure message to mention "five attempts", but the code says "within the retry window". This was already broken in HEAD, outside step 0. The assertion now matches the current message and the rehearsal passes.
- **Status:** reviewed and approved.


**Part (c) status: implemented locally and approved (October 29).**

- **Delivery decisions (approved with the plan):** the notices go through an outbox that the worker retries, so a mail outage never blocks a transfer. The Stripe customer email stays the previous Owner's for now; the admin billing screen (step 2+) will show it with an update action.
- **Migration `202610290004_ownership_transfer`.**
  - Adds the `workspaceOwnershipNotices` outbox (one row per recipient). It is staff-only: the customer app can't read or write it, and the worker can only read it and update its status.
  - `ADMIN_WRITES` gains `workspaces.ownerId`, `workspaceMemberships.role` and `INSERT` on the outbox. The admin app still can't add members or change policies.
- **`transferWorkspaceOwnership`** (`packages/data/src/workspaces/team-actions.ts`).
  - Locks the workspace. Refuses one being deleted; suspended workspaces are allowed.
  - The new Owner must be a member, verified, not being deleted, not suspended, and must not own another workspace. A reason is required.
  - Sets the previous Owner to Admin, the new Owner to Owner, and `workspaces.ownerId`, in one transaction. The existing deferred trigger checks "exactly one matching Owner" at commit.
  - Writes one `ownership.transferred` row to `authorizationAudit` (staff actor, reason, both people, the new Owner's previous role). The policy revision doesn't change.
  - Queues one notice for each person. Sessions are kept; the next request reads the new role.
- **`processWorkspaceOwnershipNotices`** (`packages/data/src/workspaces/ownership-notices.ts`) and the worker loop (`apps/worker/src/ownership-notices.ts`).
  - Sends with backoff, five attempts at most, and an idempotency key per notice. Like the suspension notice, it isn't held while the workspace is suspended, because the email has no link into the app.
  - Skips a notice that is no longer true: the workspace is being deleted, ownership moved again, either person left, or the recipient is unverified or being deleted.
- **Email `ownership-transferred`** (`packages/data/src/email/`), in the workspace-suspended style, with two variants. Neither includes the staff reason or a link. There's a unit test, and the web stories cover both recipients, long names, escaped content, plain text and mobile.
- **Changed rehearsal checks.** The suspension and team-actions rehearsals asserted the admin app can't change a member's role. That is now granted on purpose, so both assert it can't add a member instead.
- **Validation.**
  - `pnpm test:ownership-transfer:db`: 11 checks, run as the admin, web and worker roles.
  - The grants (24), suspension (12 + 8), plan-override (9), account-actions (9), team-actions (13), authorization (17) and leads (39) rehearsals all pass.
  - Typecheck exits 0; lint has 0 errors; 3,210 unit tests pass.
  - Storybook builds, and all eight new stories render without errors.

---

## Order and review gates

0a (roles) → 0b (suspension) → 0c (plan override) → 0d (use cases). Each sub-step is a separate change with its own review. 0a goes first so every later test runs under the restricted role.

**Status (October 29):** all four sub-steps are implemented locally and approved. Nothing is committed yet. Still to do: the Railway rollout of the database roles (0a), then step 2 (`apps/admin` on its own domain).

## Decisions (approved October 28)

| # | Question | Decision |
|---|---|---|
| D1 | How are DB roles created? | A provisioning script run once per environment (needs the owner credentials), plus grants in a migration that skips if the roles are missing. Alternative: create roles inside a migration (puts passwords in migration env). |
| D2 | What does a suspended user see at sign-in? | Generic "This account is unavailable. Contact support." (doesn't confirm suspension to someone with stolen credentials). |
| D3 | What can members of a suspended workspace do? | Nothing except sign out, switch workspace or contact support. Owners can't change billing while suspended. |
| D4 | How does the admin trigger a customer password reset? | The admin calls a small signed internal endpoint on the web app (`POST /internal/password-reset`, HMAC with a shared secret, private network only) so the customer Better Auth instance creates the token. Alternative: admin writes the `verifications` row directly (couples admin to Better Auth internals). |
| D5 | Worker jobs for a suspended workspace | Hold and resume after unsuspend (no lost customer emails). Alternative: drop them. |
| D6 | Scope of 0d | Only slice 1 use cases (above). Billing, data requests and ops use cases move in their own later steps. |
