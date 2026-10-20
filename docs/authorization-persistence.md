# Authorization persistence and live role migration

Implemented October 12, 2026. This is the database/repository portion of steps 2–3 in the [authorization plan](authorization-permissions-plan.md). The four-role cutover and enforcement for existing application flows are now connected and applied to local development and test databases. See [live cutover notes](authorization-live-cutover.md). The Permissions editor and future resource adapters remain pending.

## What is implemented

- `packages/data/src/migrations/202610120001_authorization.ts`: a transactional, forward-only cutover migration. It maps Member/Office → Office and Member/Field → Field, preserves Owner/Admin, and maps invitation roles the same way. Damaged historical ownership aborts the migration. The obsolete profile columns are removed; role is the single authority. Invitations retain an inviter ID for current-authority checks.
- `workspacePolicies`: one persisted head per workspace, revision, template version and update timestamp. `workspaceRolePolicies`: unique workspace/role/permission grants with scopes and database role/scope/ceiling checks.
- Version 1 defaults are a checked-in snapshot, not an import of mutable future defaults. Catalog entries still marked proposed or unavailable remain denied by the engine, even if the template includes a grant. Future changes to default templates do not overwrite saved workspace policies.
- `authorizationAudit`: immutable records of migration seeding, new-workspace seeding and successful policy saves, including actor, before/after policy, revisions and timestamp. Updates/deletes are rejected. Workspace deletion is restricted while retained evidence exists; a future deletion workflow must define retention explicitly. These protections do not replace least-privilege production database credentials or protect against a database operator disabling triggers/truncating tables.
- Deferred database invariants require exactly one Owner membership matching `workspaces.ownerId` and a persisted policy for each workspace. A valid ownership transfer updates all three facts within one transaction. No transfer endpoint is implemented here.
- Workspace locks coordinate membership/grant/policy mutations with protected reads and Owner policy saves. Repositories reload current membership and policy on every call; there is no session-role cache or fallback to defaults.

## Repository API

All APIs require a server-authenticated identity and server-configured enabled permission IDs. Never accept these claims from a browser/model. Construct responses only after the repository transaction resolves.

| API | Behavior |
|---|---|
| `initializeWorkspacePolicy(trx, identity)` | Explicit initializer inside workspace creation, after Owner membership insertion. Seeds version 1 policy and audit atomically; rejects duplicate initialization. Never called as a read fallback. |
| `saveWorkspacePolicy(db, identity, enabledPermissions, change)` | Locks workspace, reloads current authority, validates Owner-only access, protected grants/dependencies and expected revision; saves grants, next revision and before/after audit together. Stale saves raise `AuthorizationConflictError`; denied saves raise `AuthorizationAccessError`. |
| `listAuthorizedLeads(db, identity, enabledPermissions, limit?)` | Tenant and assignment SQL predicates apply before ordering/limit. Owner/Admin/Office get workspace leads; Field gets only directly assigned leads. Returns a small summary DTO. Limit is 1–100. |
| `authorizedLeadPipelineCounts(db, identity, enabledPermissions)` | Applies the same predicates before grouping/counting. Missing stages are omitted, allowing the UI adapter to fill zeroes. |

Only lead repositories are implemented because leads are the current persisted business resource. Job/team, estimate, customer, calendar, report, campaign and vector repositories require their own tested SQL adapters when those schemas exist. The pure engine’s scopes are not permission to perform an unrestricted query.

Denied/stale saves do not append a successful audit record. Safe denial logging, audit read authorization/retention, Origin/session checks, recent-authentication requirements and HTTP error mapping belong in the connected server use cases. Membership/ownership changes still need authorized use cases and their own audit events; the SQL constraints are integrity protections, not authorization to invoke those changes.

## Rehearsal

Run `pnpm test:authorization:db` with a configured local `TEST_DATABASE_URL` whose database name ends in `_test`. The runner creates a unique temporary schema, sets every fixture connection's search path exclusively to that schema, and removes it in `finally`. Existing development/test tables are not modified. Credentials are not logged.

The 17 PostgreSQL checks cover:

- Transactional migration rollback back to the original legacy rows, then successful role/invitation mapping and policy seeding.
- Two tenants and different roles for the same person across workspaces; assigned-only Field lists/counts; workspace-wide Owner/Admin/Office lists including unassigned leads; denied nonmembers and unavailable features.
- Owner-only saves, conflicting concurrent saves, invalid scopes, immutable Owner powers, tenant mismatch and permanent role ceilings.
- Forced audit-write failure rolling back both grants and revision; membership mutations blocking behind protected-read locks.
- Policy and membership revocation on the next request, corrupt-policy denial without reseeding, immutable audit rows, exactly-one-Owner and persisted-policy constraints.
- Atomic ownership transfer removing the former Owner’s permission-management authority; transactional new-workspace initialization and missing/duplicate seed rejection.

All 17 database checks, 289 pure-engine tests and 68 browser/API tests pass. Lint, typecheck, production and Storybook builds pass; selected role/navigation/Home stories pass desktop/mobile checks. A private development backup was restored into a disposable database, record fingerprints matched, and that copy migrated successfully before the local cutover.

## Live cutover completed

The migration was promoted into `src/migrations` after adapter work and rehearsals passed. Existing code now reads only four-role memberships. Workspace creation atomically seeds policies; lead creation/assignee choices/counts, Home widgets/actions and invitation acceptance/delivery consume current saved authority. Home and the assistant launcher are reviewed baseline capabilities for all four roles. Current navigation receives server-derived capabilities; denied items do not appear as Coming soon placeholders.

The old local Next.js process was stopped, a fresh private backup was taken, the development migration committed, and the compatible app restarted on port 3000. The saved development Owner policy and absence of Member roles were verified. No accounts or business records were reset. The one initial workspace per account restriction remains separate from the one Owner per workspace invariant.

Next: implement the Owner-only Permissions screen, its reviewed Save/preview/conflict/recent-authentication behavior and authorized audit access. Team management after onboarding, atomic ownership-transfer use cases, future resources, cache/tab invalidation and production operational acceptance remain later work. Chat remains deferred. After enforcement, use forward fixes or disable a feature; do not restore the permissive legacy application.
