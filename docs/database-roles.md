# Database roles

Staging web/worker cutover and strict enforcement were completed November 1, 2026. See the [live verification and recovery record](lead-capture-runtime-cutover-20261101.md). Production remains empty; separate admin/audit hosting was not activated.

Least-privilege PostgreSQL roles for the app and the admin console ([admin console plan §5.2](admin-console-plan.md), [step 0a](admin-console-step-0-plan.md)). Before this change every service connected as the database owner. The owner role is now used only for migrations and role provisioning.

| Role | Login | Used by | Privileges |
| --- | --- | --- | --- |
| Owner (`salesmora` locally, Railway's `POSTGRES_USER`) | yes | `migrate.ts` (`MIGRATION_DATABASE_URL`), `pnpm db:roles`, test fixtures | Owns the schema and everything in it |
| `salesmora_runtime` | no | Group role only | `SELECT/INSERT/UPDATE/DELETE` on every application table, sequence usage. No access to `knex_migrations*` or the staff-only tables (`suspensionAudit`, `workspaceSuspensionNotices`, `accountAudit`, `workspaceOwnershipNotices`), no DDL or `TRUNCATE`. The `suspension_columns_guard` trigger rejects changes to `suspendedAt`/`suspendedReason`, and `plan_override_columns_guard` rejects changes to the `workspaces.planOverride*` columns |
| `salesmora_web` | yes | Web app (`DATABASE_URL`) | Member of `salesmora_runtime`. The Owner export download migration also grants execute on two narrowly scoped public functions for current verified-Owner artifact lookup and download auditing; it grants no `admin` schema usage or artifact-table access |
| `salesmora_worker` | yes | Worker (`DATABASE_URL`) | Member of `salesmora_runtime`, plus `SELECT, UPDATE` on `workspaceSuspensionNotices` and `workspaceOwnershipNotices` to deliver the staff notices. After the Admin export-worker migration, it receives only `admin` schema usage, column-scoped export-request reads/updates, artifact-row inserts/deletes, and audit-chain append access; it cannot read Admin identities or artifact keys |
| `salesmora_audit_worker` | yes, when explicitly provisioned | Separate audit preparation/copy worker (`ADMIN_AUDIT_DATABASE_URL`) | No group membership. `SELECT` on `admin.auditEvents`; preparation metadata DML; copy/attempt SELECT/INSERT plus state/evidence-only UPDATE; verifier observations SELECT only. No customer/identity/audit-write access |
| `salesmora_audit_verifier` | yes, when explicitly provisioned | Separate local verifier rehearsal (`ADMIN_AUDIT_VERIFIER_DATABASE_URL`) | No group membership. Audit events/copies SELECT; verifier observations SELECT/INSERT only. No copy mutations, observation UPDATE/DELETE, customer or staff-identity access. Private filesystem checkpoint state must be isolated separately |
| `salesmora_admin_app` | yes | Admin console (step 2+) | `SELECT`, except `accounts`, `verifications`, `rateLimits`, `sessions.token` and `estimate_share_tokens.encryptedToken`. Writes are limited to the list in `ADMIN_WRITES`: the suspension columns on `users`/`workspaces`, `DELETE` on `sessions`, `chatTurns.state`/`finishedAt`, `INSERT` on `suspensionAudit`, `INSERT`/`UPDATE (status)` on `workspaceSuspensionNotices`, the `planOverride*` columns on `workspaces`, `INSERT` on `billingAudit`, `users.emailVerified`/`updatedAt`, `INSERT` on `accountAudit`, `DELETE` on `workspaceMemberships`, the assignment columns on `leads` (`ownerId`, `ownerName`, `version`, `updatedAt`, `lastActivityAt`), `INSERT` on `leadActivity`, the delivery columns on `workspaceInvitations` (`status`, `tokenHash`, `expiresAt`, `sentAt`, `lastAttemptAt`, `deliveryAttempts`), `INSERT` on `authorizationAudit`, `workspaces.ownerId` and `workspaceMemberships.role` (ownership transfer), and `INSERT` on `workspaceOwnershipNotices` |

Grants live in [runtime-roles.ts](../packages/data/src/runtime-roles.ts). Migration `202610280001_runtime_grants` applies public-schema grants, along with default privileges, so later application tables are covered automatically. Admin-schema grants are separately revoked from public/runtime roles; the workspace-export migration and `pnpm db:roles` re-apply only the export worker's explicit column/table allow-list after the general Admin identity and audit grants. The migration is a no-op until the roles exist. `pnpm db:roles` creates or updates the roles and re-applies grants idempotently. Public-schema grants target the connection's current schema, which is `public` in every deployment. Replay rehearsals run migrations in a scratch schema, so those grants stay inside it.

**Adding a new public table:** the web and worker roles get full DML automatically. If customer code must not write it, add it to `STAFF_ONLY_TABLES`. If the admin app writes it, add the narrowest entry to `ADMIN_WRITES`. Admin-schema tables never inherit public-schema grants; add a separate least-privilege grant helper and rehearsal for each required role.

## Variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `MIGRATION_DATABASE_URL` | Web service (pre-deploy), local | Owner URL for migrations and `db:roles`. Falls back to `DATABASE_URL` when unset |
| `DATABASE_URL` | Web, worker | Runtime role URL (`salesmora_web` or `salesmora_worker`) |
| `DB_WEB_PASSWORD`, `DB_WORKER_PASSWORD`, `DB_ADMIN_APP_PASSWORD` | Wherever `pnpm db:roles` runs | Role passwords, at least 24 characters. A role whose password is unset is skipped. Never logged |
| `DATABASE_ROLE_ENFORCED` | Web, worker | `true` makes startup fail when the service connects as a superuser, a database owner, or a role that can create objects in `public`. Otherwise this only logs a warning |
| `TEST_APP_DATABASE_URL` | Local only | Runtime role URL for the app under e2e test. `TEST_DATABASE_URL` stays the owner URL for fixtures and rehearsals |
| `ADMIN_WORKSPACE_EXPORTS_ENABLED` | Admin, worker | Explicit opt-in for Admin export requests and worker processing; keep `false` until the private bucket, Owner download flow, and export key are ready |
| `ADMIN_EXPORT_MASTER_KEY` | Web, worker | Separate canonical base64 encoding of exactly 32 random bytes for export encryption/decryption; never reuse `FILE_MASTER_KEY` |
| `DB_AUDIT_WORKER_PASSWORD` | Approved owner provisioning environment only | Optional separate audit-worker role password, at least 24 characters. Never provisioned by customer worker startup |
| `DB_AUDIT_VERIFIER_PASSWORD` | Approved owner provisioning environment only | Optional separate verifier role password, at least 24 characters. No production provisioning in this slice |
| `ADMIN_AUDIT_VERIFIER_DATABASE_URL`, `ADMIN_AUDIT_VERIFIER_STATE_DIRECTORY` | Separate verifier only | Exact verifier-role URL and private checkpoint path; local `_test` rehearsal only. See [publication runbook](admin-audit-log.md#durable-publication-and-verifier-owned-acceptance) |
| `ADMIN_AUDIT_DATABASE_URL`, `ADMIN_AUDIT_LEDGER_ID` | Separate audit worker only | Dedicated role URL and stable database ledger UUID. Current preparation slice accepts only a local `_test` database and refuses production; see [audit runbook](admin-audit-log.md#isolated-preparation-worker) |

## Local development

`pnpm db:setup` upgrades an existing `.env.local` once:

- The owner URL moves to `MIGRATION_DATABASE_URL`.
- `DATABASE_URL` switches to `salesmora_web`.
- `TEST_APP_DATABASE_URL` and random role passwords are added.
- `DATABASE_ROLE_ENFORCED=true` is set.

It then runs `pnpm db:roles` and `pnpm db:roles:test`. Roles are cluster-wide, so both databases share them. When local Admin exports are enabled, the worker derives a `salesmora_worker` connection from `DB_WORKER_PASSWORD`; test workers continue to use `TEST_APP_DATABASE_URL`.

Verify with `pnpm test:grants:db`. It proves that DML is allowed and that DDL, `TRUNCATE`, migration-history access and admin writes are denied. It also checks that hidden columns stay hidden and that future tables inherit the grants.

## Railway rollout (staging, then production)

Do this once per environment. The order keeps the running app working at every step.

1. Generate three random passwords (for example `openssl rand -hex 24`) in a secret manager. Never paste them into chat or logs.
2. On the **web** service, add `MIGRATION_DATABASE_URL` set to the current owner reference URL, plus the three `DB_*_PASSWORD` variables. Keep `DATABASE_URL` unchanged and deploy. The pre-deploy migration runs `202610280001_runtime_grants` as a no-op.
3. In a web service shell, run `node --import /app/packages/data/node_modules/tsx/dist/loader.mjs /app/packages/data/src/db-roles.ts`. Expect `Provisioned …` for each role and `Database roles ready (deployment)`.
4. Set web `DATABASE_URL` to the same private host and database, but with user `salesmora_web` and `DB_WEB_PASSWORD`. Set worker `DATABASE_URL` likewise with `salesmora_worker`. Remove the `DB_*_PASSWORD` variables from the services afterwards if you like, and keep them in the secret manager. Redeploy web, then the worker. Neither log should contain a `database role` warning.
5. Run the remote checklist (login, workspace, assistant, worker status). Then set `DATABASE_ROLE_ENFORCED=true` on both services and redeploy.

To roll back, point `DATABASE_URL` back at the owner reference URL and unset `DATABASE_ROLE_ENFORCED`. The roles and grants can stay in place.

To rotate a password, update `DB_<ROLE>_PASSWORD`, re-run step 3, then update that service's `DATABASE_URL`.
