# Admin staging rollout

Status: authorized isolated release deployed; private-origin checks passed; first Super Admin enrolled and dashboard login confirmed by user; remaining acceptance checks pending. Backup/restore deferred for this staging release.
Hostname approved: `admin-staging.salesmora.ai`.
On November 3, the user configured the tunnel token privately, deployed `admin-tunnel`,
and confirmed a successful connection in Cloudflare. The Admin hostname route remains
unpublished. Workspace exports stay disabled
until staging storage, encryption and delivery are separately verified. Knowledge
publishing and the admin-only assistant remain deferred.

## Authorized staging release — November 3

After explicitly deferring backup/restore as a staging-only exception, the user
authorized migrations, role provisioning and deployment. The previously documented
preparation/blocker entries below are historical, not the current deployment state.

- Reviewed the staged patch: variable changes only on Admin, web and worker. Validated
  secret lengths/independence and matching bridge, database, Redis, queue and email
  references without printing values. Added the missing non-secret Admin
  `BETTER_AUTH_URL` pointing to customer web. Committed the reviewed variable patch
  with automatic deployments suppressed, then revalidated effective configuration.
- Extracted a clean upload directory from the checksum-verified 2,694-file source
  archive. Uploaded only that isolated snapshot, never the dirty worktree.
- Web deployment `56b451aa-f4d9-45ca-8555-09de097b4550` succeeded. Read-only database
  verification found exactly 123 migrations: the 112 previously applied plus the
  11 approved files. Excluded capture-assistant columns remain absent. Web health
  and login returned HTTP 200.
- Ran the deployed owner-side role procedure with all other login-password variables
  removed from that process: only `salesmora_admin_app` was provisioned; existing
  web/worker passwords were not rotated. Verified Admin is a narrow runtime role,
  can read staff state, cannot read customer verification/session tokens or write
  migration history. Web cannot use the Admin schema; narrow targeted/rollout flag
  readers work, with chat default true and unknown rollout false.
- Matching worker deployment `9f173581-cffb-42c8-a897-a0093222c22b` and Admin deployment
  `e035ae42-2440-4b31-aec5-befee7b6917e` succeeded. All three services matched the
  snapshot across 1,788 retained runtime source files. Worker and Admin exports are
  explicitly false. Worker retains its existing retention-only mode, with status
  ready and retention scheduled; capture scheduler remains unconfigured.
- Actual Admin private DNS is `admin.railway.internal`. No Admin or connector public
  HTTP domains or TCP proxies exist; sleeping is disabled. Admin has no migration
  predeploy command or unauthenticated healthcheck. Private-origin requests to home,
  sign-in, health and rollout API returned HTTP 401 with `Cache-Control: no-store`
  for missing or forged Access credentials/spoofed identity.
- Actual Admin database connection uses `salesmora_admin_app`; configured auth origin
  and RP ID match the staging hostname. Staff count is zero: no bootstrap/enrollment
  has run. Both targeted flag defaults remain enabled. Customer health remains 200.

Previous image/deployment references: web `fec42939-e47b-4d94-9477-9a743bf2245e`,
worker `8fbdd7c8-595b-4a4c-8c06-0a712bae3baf`. Image rollback does not undo the
additive migrations or provide database recovery.

The user subsequently published the tunnel application route for
`admin-staging.salesmora.ai` to `http://admin.railway.internal:3003`, with path blank.
External unauthenticated requests to home and `/api/health` both returned Cloudflare
HTTP 302 redirects to `empty-brook-5775.cloudflareaccess.com`, without following
or recording token-bearing redirect URLs. Protected-hostname authenticated Access
acceptance, nonmember denial, authorized health, separate Admin enrollment/login/MFA
and staging email-bridge delivery remain pending. Railway deployment success is not
full Admin acceptance. The archived release manifest/checksum remains unchanged;
this later release record supersedes its historical deployment blockers.

### First staff enrollment and login — November 3

The user confirmed seeing the separate Admin sign-in page after Cloudflare Access,
approved their verified company identity as the first staging Super Admin, and ran
the bootstrap command privately. The invitation URL was not collected in chat.
The user subsequently confirmed full authentication and successful dashboard login.
Read-only aggregate verification found one staff account, one `super_admin` role
assignment, one two-factor record and zero application passkeys; exports remain
disabled. Do not describe this as application passkey enrollment or assume recovery
codes were saved. No credential, factor secret or recovery code was inspected.

The user opened `/api/health` in their authenticated browser and reported
`{"status":"ok"}`. This confirms authorized health reachability; browser response
headers were not inspected. Nonmember Access denial, fresh-session login/MFA,
representative dashboard reads and staging email-bridge delivery remain separate
acceptance checks.

### Application sign-out follow-up

The first fresh-login acceptance check exposed a missing Admin sign-out control.
The approved fix adds Sign out to the shared dashboard sidebar, using the
existing POST `/api/auth/sign-out` endpoint to revoke the current staff session and
expire its cookies before returning to `/sign-in`. Failure remains visible and
retryable. Customer and Cloudflare Access sessions are unchanged; the next Admin
login still requires password and application MFA.

Local typecheck, focused lint, production/Storybook builds and auth database rehearsal
passed, including cookie expiry, session deletion and denial of the revoked cookie.
Following separate user approval, a new isolated snapshot
`.local/releases/admin-signout-20261103` overlaid only six Admin files on the previous
verified archive, retaining all migrations/web/worker inputs unchanged.
Admin-only deployment `6fecfc9d-4a52-4e88-a082-3b03a71b79f4` succeeded; all six overlay
hashes matched the deployed source. Private health remains HTTP 401/no-store without
Access, exports remain disabled and prior web/worker deployments remain successful.
No migrations, variable edits or other service deployments ran for this follow-up.
The user confirmed staging browser acceptance: Sign out returned to sign-in, the
next login required password followed by application MFA, and the dashboard opened.
The user subsequently confirmed non-admin Access denial. This is user-reported
acceptance; no additional identity or denial logs were collected by the agent.
The user confirmed Users, Workspaces, Audit, Operations, Platform settings, Feature
flags and System rollout flags load without errors. These are read smoke tests,
not mutation acceptance. Their controlled company inbox belongs to separate staff
and staging customer identities. The customer password-reset action reported success
and the user confirmed receiving the email. Password-reset completion, verification,
email-change and invitation delivery remain unverified; no reset token was collected.

## Staff identity and Access setup (November 3, 2026)

- Karpuk Creative owns SalesMora. Staff identities use only `@karpukcreative.com`,
  not the fictional local `@salesmora.ai` identities. The shared staff email schema
  applies to Access JWT validation, password sign-in, invitation input, bootstrap
  and MFA enrollment.
  Existing local records are left untouched; old-domain identities no longer pass
  the Access/enrollment boundary. Do not migrate local identities into staging.
- The working Google Workspace provider uses Karpuk Creative's Internal OAuth client.
  Group lookup returned membership in `salesmora-admins@karpukcreative.com`.
  Earlier incomplete provider entries must not be enabled for the application;
  remove unused duplicates only after confirming their references.
- The Access application covers the entire `admin-staging.salesmora.ai` hostname.
  Its Allow policy includes only the SalesMora Admins Google group and requires the
  working Google Workspace login method. The session duration is 30 minutes.
- Application-level independent MFA allows Biometrics and Security key and requires
  MFA on every access. The policy override is off so it inherits application MFA.
  Global default enforcement and identity-provider MFA substitution remain off.
  Cloudflare's separate FIDO2/PIV settings apply to SSH infrastructure applications,
  not this browser-based Admin.
- The user enrolled Touch ID and confirmed a Cloudflare passkey challenge after
  App Launcher sign-out/sign-in. This verifies launcher behavior, not an end-to-end
  test of the undeployed Admin origin or a non-member denial test.
- Authoritative DNS moved to Cloudflare with existing site/forms/mail records kept
  DNS-only. The old DNSSEC DS record was removed before the switch. Re-enable DNSSEC
  separately using Cloudflare's new DS details and verify the registrar delegation.
- Local identity-change validation passed: 15 focused unit tests; bootstrap,
  enrollment, auth (11 checks), and audited staff-management database/API rehearsals;
  contracts/data/Admin typechecks; focused lint; Admin production and Storybook builds.
  Tests explicitly reject the legacy domain, lookalike domains and malformed emails.
  Storybook build is not a new browser acceptance run. No staging deployment,
  migration, bootstrap, secret read or local account/environment rewrite was performed.

## Preparation evidence (November 2, 2026)

- After the user's go-ahead, the reviewed IaC was applied: only `admin` and
  `admin-tunnel` were created. Existing web deployment `fec42939-e47b-4d94-9477-9a743bf2245e`
  remained online and unchanged. Neither new service has a public domain in the
  post-apply inventory. A second plan reported no changes.
- Set only non-secret Admin defaults with `--skip-deploys`: production Node mode,
  staging environment, port 3003, the approved auth origin/RP ID, existing staging
  customer origin, and exports disabled. No migrations, application uploads,
  staff bootstraps or secret reads were performed. Access policy, tunnel token
  and service secrets remain pending secure setup.
- Live local Admin navigation passed for all ten integrated areas. A temporary rollout
  flag passed create/off-default, toggle, refresh persistence, description edit and
  deletion checks; its four mutation events were found through the Audit API. Existing
  flags were left unchanged.
- Isolated auth, customer-user, workspace, staff, audit-viewer and data-request rehearsals
  passed. Browser navigation is not full E2E coverage of every existing mutation.
- `railway config plan --environment staging` under Node 22 reported exactly two service
  additions, zero changes and zero deletions. No configuration was applied.
- The Admin Docker image built locally with disposable configuration. Its runtime
  environment does not retain the build-only auth secret or database URL.
- A network-isolated production-container smoke test confirmed non-root execution and
  HTTP 401/no-store responses for home, sign-in, rollout API and health without a valid
  Access JWT, even with a spoofed identity header and the development bypass variable set.
  The fixture deliberately has no database connection; this does not establish staging
  database readiness or valid-Access/MFA behavior.
- The official Cloudflare connector's pinned multi-platform image digest was verified
  from the registry. The connector has not been started against a real tunnel.

## Architecture

- Separate `admin` Railway service, built from [admin.Dockerfile](../infra/railway/admin.Dockerfile).
- No Railway public domain, custom domain directly on the service, or public TCP proxy.
- Separate `admin-tunnel` connector, using the digest-pinned official Cloudflare image.
- A remotely managed Cloudflare Tunnel routes the approved hostname to
  `http://admin.railway.internal:3003`. Confirm the actual private hostname in Railway.
- Cloudflare Access protects the entire hostname, including API, health and static paths.
  Use the approved staff Google Workspace group, with phishing-resistant authentication.
- The app verifies the Access JWT, then separately requires Admin password and MFA.
  Customer sessions are not Admin sessions.
- Staging web remains the sole migration owner. Admin has no migration pre-deploy command.

The [Railway definition](../.railway/railway.ts) retains all existing services, volumes
and the files bucket, adds the two services, and refuses non-staging environments.
Variables remain unmanaged. Applying the definition can start services before their
variables exist; a fail-closed startup is expected, not a reason to bypass Access.

## Secure configuration

### Read-only preflight (November 3, 2026)

- Railway status confirmed staging: web/worker/Postgres/Redis/forms/connector online,
  Admin offline, and the web deployment unchanged from the recorded deployment above.
- The Node 22 IaC plan reported no drift; no configuration was applied.
- Railway reported PITR disabled and no PITR bucket wiring. The custom Postgres
  Docker build is not a supported Railway PITR image. Do not replace the database
  image to bypass this gate; volume backups or an approved logical backup/restore
  procedure must be verified separately.
- Remote metadata inspection via Railway SSH was blocked because this CLI account
  has no registered SSH keys. No key was registered automatically, no runtime variable
  values were retrieved, and the applied migration list and Admin role grants remain
  unverified. Read-only database inventory requires approved secure access first.
- Follow-up: the user registered a dedicated passphrase-protected SSH key and verified
  Node 22.23.3 remotely. A subsequent read-only transaction through staging web succeeded.
  Migration history ends at `202611010001_admin_email_change.ts`; 13 migrations in the
  current local directory are not applied. `salesmora_web` and `salesmora_worker` exist
  without superuser/create-role/create-database privileges; `salesmora_admin_app` does
  not exist. Web variable-name inventory includes email transport names but no
  `ADMIN_*` or `DB_ADMIN_*` names. Secret values were not printed. This does not verify
  email transport validity, table-level grants, backups or restore capability.
  No migration, role provisioning, deployment or environment mutation was performed.
- Postgres volume backup API inventory returned no backups and no backup schedules
  for the staging Postgres volume instance. Together with disabled PITR, this blocks
  migrations until an approved backup is created and recovery is rehearsed on an
  isolated destination, never by restoring over live staging.
- The pending set includes `202611040001_capture_assistant_reads.ts` and
  `202611040002_capture_assistant_setup.ts`, which add customer capture-assistant
  schema. This is distinct from the deferred Admin assistant, but is not part of
  the approved Admin/feature-flag release. The current web migration command runs
  every pending migration, so a web deployment cannot be treated as flags-only.
  Review and approve the exact release scope before any migration or web upload.
- The user approved a pre-release volume backup. Railway rejected the creation
  request: manual backups and schedules require a Pro workspace. No backup workflow
  started and no snapshot was created. Do not assume approval means backup success.
  Next options are an explicitly approved plan upgrade or an encrypted logical
  Postgres backup with an isolated restore rehearsal and approved storage/access.
- The user subsequently deferred backups and declined a Pro upgrade. Do not retry
  backup creation or schedule changes. Continue only non-destructive preparation;
  the backup/restore release gate remained unresolved at that point. The later
  staging-only exception below supersedes this blocker.

### Staging backup/restore exception — November 3

The user explicitly confirmed excluding backup/restore for now, declining the premium
plan and planning to implement recovery later. Backup creation and restore rehearsal
are therefore no longer prerequisites for this staging release. Do not upgrade the
plan, create backups or substitute another recovery implementation without approval.
This exception is limited to staging; it does not establish a production policy.

No verified backup, PITR or rehearsed database recovery is available. Application-image
rollback cannot undo database mutations or recover lost data. The local synthetic
migration rehearsal is not a substitute for a recoverable staging database.
Only the reviewed, additive release scope may proceed after separate explicit
migration/deployment authorization; this deferral does not authorize those operations.
Implement and verify backup/restore in a separately approved follow-up.

### Pending migration scope review

The read-only inventory identifies 13 pending files. The following is a proposed
release classification, not authorization to migrate or proof of lock/runtime
compatibility. Web's current migration runner applies all pending files.

The user approved this scope November 3: existing Admin tools plus both flag
systems, exports disabled, customer capture assistant excluded. This scope approval
did not itself authorize deployment or waive the then-unresolved backup/restore gate.
The later staging-only exception above now governs that gate.

| Migration | Purpose | Proposed Admin release treatment |
|---|---|---|
| [202611010002_workspace_invitation_delivery.ts](../packages/data/src/migrations/202611010002_workspace_invitation_delivery.ts) | Durable Admin workspace invitation email delivery and identity grants | Include for existing workspace-management actions |
| [202611010003_billing_webhook_workspace.ts](../packages/data/src/migrations/202611010003_billing_webhook_workspace.ts) | Nullable webhook workspace reference and index | Include for existing billing tooling; alters a customer billing table |
| [202611010004_admin_billing_plan_change_grants.ts](../packages/data/src/migrations/202611010004_admin_billing_plan_change_grants.ts) | Reapply runtime grants for Admin billing plan changes | Include; review current grant helper, not just this thin migration |
| [202611020001_admin_billing_recovery.ts](../packages/data/src/migrations/202611020001_admin_billing_recovery.ts) | Retry cancellation field and retained grace-extension evidence | Include for existing billing recovery; explicitly forward-only |
| [202611030001_admin_workspace_export_requests.ts](../packages/data/src/migrations/202611030001_admin_workspace_export_requests.ts) | Export request metadata | Include schema prerequisite; exports remain disabled |
| [202611030002_admin_workspace_export_worker.ts](../packages/data/src/migrations/202611030002_admin_workspace_export_worker.ts) | Export retry/artifact metadata | Include schema prerequisite; no export key/storage enablement |
| [202611030003_admin_workspace_export_delivery.ts](../packages/data/src/migrations/202611030003_admin_workspace_export_delivery.ts) | Export notification fields, Owner functions, account-audit constraint and grants | Include schema prerequisite; modifies public audit constraint and web execute grants |
| [202611040001_admin_ai_pricing.ts](../packages/data/src/migrations/202611040001_admin_ai_pricing.ts) | Admin pricing history | Include for existing AI usage tooling, not an Admin assistant |
| [202611040002_admin_ai_budget_defaults.ts](../packages/data/src/migrations/202611040002_admin_ai_budget_defaults.ts) | Versioned budget defaults and narrow runtime reader | Include for existing platform settings; empty table seeds no token allowance |
| [202611040003_admin_feature_flags.ts](../packages/data/src/migrations/202611040003_admin_feature_flags.ts) | Targeted flags and runtime reader | Include; seeds chat and estimate sharing enabled to preserve existing defaults |
| [202611040004_admin_rollout_flags.ts](../packages/data/src/migrations/202611040004_admin_rollout_flags.ts) | Dynamic rollout CRUD table and boolean reader | Include; no flags seeded and unknown keys return false |
| [202611040001_capture_assistant_reads.ts](../packages/data/src/migrations/202611040001_capture_assistant_reads.ts) | Customer chat capture result/stamp columns | Exclude from the proposed Admin release |
| [202611040002_capture_assistant_setup.ts](../packages/data/src/migrations/202611040002_capture_assistant_setup.ts) | Customer capture setup proposals, samples and chat evidence | Exclude from the proposed Admin release |

The three export migrations form a chain and supply tables used by the Admin data
request views; schema presence must not be confused with export feature enablement.
The two customer capture migrations are separate from the deferred Admin assistant,
but excluding their migrations alone is insufficient if newly deployed web/worker
code expects their schema. Before deployment, approve and rehearse a coherent release
snapshot or a reviewed explicit migration-selection mechanism together with matching
application code. Do not delete migrations, falsify migration history, or add silent
missing-table fallbacks to work around release scope.

### Code/migration coupling inspection

The current web/worker Dockerfiles copy the entire worktree, and the web image retains
the complete migration directory. A normal upload is therefore not an Admin-only
release snapshot. Git HEAD also does not represent deployed staging: the current
worktree includes uncommitted Admin, capture and other integration work.

Customer capture-assistant changes are wired into the existing web chat store,
runtime, tool registry, turn streaming and dedicated setup API, not only a separate
page. In particular, chat history explicitly selects `captureStamp`, `captureResult`
and `captureSetupEvidence`, supplied by the two excluded migrations. Skipping those
migrations while deploying the current web source risks breaking ordinary chat.
The full-worktree upload and a migration-only exclusion are not approved release
strategies. Prepare an isolated coherent release snapshot that excludes the capture
integration from shared runtime/UI paths and matches the approved migration set,
without deleting or reverting the ongoing worktree changes. Its build, typechecks,
chat regression tests and flag/runtime rehearsals must pass before release approval.

The user approved isolated snapshot preparation November 3. Preserve the original
worktree, omit secrets/local data from the snapshot, and keep live staging unchanged.
Preparation approval does not authorize migration, upload, deployment or removing
the unresolved backup/restore gate.

### Isolated release preparation — November 3

The candidate is assembled under `.local/releases/admin-tools-flags-20261103/source`.
Its source-only `source.tar.gz`, archive checksum and `release-manifest.json` live
alongside it, outside Git. Do not upload the original worktree or recursively archive
the candidate directory: local dependency/build outputs are not release inputs.
The manifest lists the exact archived files and their hashes.

The saved activation archive passed its recorded SHA-256 and all 2,589 source-file
checks. Read-only Railway SSH then verified all 1,588 retained runtime source files
against both deployed web and worker, with no mismatches. That verified baseline
supplies the candidate's agent, chat contracts/store/runtime, capture contracts/data
and shared capture/assistant UI. Dedicated capture-assistant APIs, tests/scripts and
the two excluded migrations are omitted only from the candidate. Current Admin
tools, company-domain identity restrictions, export dependencies and both flag
systems are retained. Snapshot-only integration changes remove capture-assistant
data exports, retain the chat-turn feature-flag guard, and explicitly scope each
Next Turbopack root to the candidate so local builds cannot infer the parent worktree.
The original application sources remain unchanged.

Local validation passed:

- Seven runtime/application package typechecks; focused lint.
- 604 chat/contracts/Access/config unit tests and 10 additional export/retention/file
  worker regressions.
- Web, Admin and worker production builds; Admin Storybook build. Compile-time
  configuration was disposable; Better Auth reported schema-validation warnings
  against the deliberately non-listening build database, not a real staging database.
- An isolated local database migrated through the 112 deployed migrations, then the
  exact 11 approved migrations (123 total). Synthetic upgrade took about six seconds;
  this is not evidence of lock duration on populated staging.
- Database rehearsals for Admin auth/enrollment, targeted flag reads and Admin changes,
  rollout CRUD and platform settings. Ordinary chat accepted a turn, persisted its
  answer, completed it, returned history/replay and denied a nonmember under the web
  role, without capture-assistant columns. The disposable database was removed.

This is a locally validated candidate, **not deployment approval or staging
acceptance**. Exports must remain disabled. Effective runtime secret/bridge configuration,
staging role/grant verification and Cloudflare origin
end-to-end acceptance remain outstanding.

Use Railway's secure Variables UI or a secret manager. Do not copy local environment
files, staff identities, encryption keys or database data to staging. Do not print
secret values in CLI output or pass secrets as build arguments.

| Service | Variables / requirements |
|---|---|
| Admin | `NODE_ENV=production`, `ADMIN_ENVIRONMENT=staging`, `PORT=3003` |
| Admin | `ADMIN_AUTH_URL=https://admin-staging.salesmora.ai`, `ADMIN_WEBAUTHN_RP_ID=admin-staging.salesmora.ai` |
| Admin | New dedicated `ADMIN_AUTH_SECRET` of at least 32 characters, independent of customer auth |
| Admin | `ADMIN_DATABASE_URL` using private staging Postgres and `salesmora_admin_app`, never the owner role |
| Admin | `ADMIN_ACCESS_TEAM_DOMAIN` and `ADMIN_ACCESS_AUD` from the exact staging Access application |
| Admin | `CUSTOMER_APP_URL` set to the existing staging web HTTPS origin |
| Admin | `BETTER_AUTH_URL` set to that same staging web HTTPS origin for customer password-reset and signed email bridges; never set it to the Admin origin |
| Admin | `ADMIN_WORKSPACE_EXPORTS_ENABLED=false`; do not provision an export master key yet |
| Admin | `REDIS_URL` referencing authenticated private staging Redis and `WORKER_QUEUE_NAME` referencing the staging worker for Operations reads |
| Admin | Staging email transport: `EMAIL_PROVIDER=resend`, `EMAIL_FROM=${{web.EMAIL_FROM}}`, `RESEND_API_KEY=${{web.RESEND_API_KEY}}`; shared staging key/sender explicitly approved November 3 |
| Admin + web | Dedicated matching `ADMIN_EMAIL_VERIFICATION_SECRET` and a separate matching `ADMIN_EMAIL_CHANGE_SECRET` for signed customer-auth bridges |
| Web migration provisioning | Staging `DB_ADMIN_APP_PASSWORD` (at least 24 characters) used by `pnpm db:roles` with the owner URL |
| Worker | `ADMIN_WORKSPACE_EXPORTS_ENABLED=false` |
| Tunnel only | `TUNNEL_TOKEN` for a dedicated remotely managed staging tunnel; never supply it to web, Admin or worker |

Never set `ADMIN_ACCESS_DEV_EMAIL`, test-provider switches, `TEST_DATABASE_URL` or local
test-server switches in staging. Disable serverless sleeping for Admin and the connector;
the connector is a persistent process. Both services stay private. The tunnel token is
read from its environment, not placed in the command line.

Variable preparation must not deploy either application. Save Railway variable changes
without applying staged deployment changes; if using the CLI, use `--skip-deploys` and
never put secret values in command arguments or output. Copy the Access application
AUD from the exact `admin-staging.salesmora.ai` application's configuration, not the
Workspace provider ID, tunnel ID or team account ID. `ADMIN_ACCESS_TEAM_DOMAIN` is
`empty-brook-5775.cloudflareaccess.com`, without `https://` or a path.

### Variable preparation reported by user — November 3

The user confirmed preparing the Access domain/application AUD, a new independent
Admin auth secret, origins/RP ID, exports disabled, private Redis/worker-queue
references, two separate web-owned email-bridge secrets referenced by Admin, and
a new web-owned `DB_ADMIN_APP_PASSWORD` referenced in the Admin-role private URL.
The user then explicitly approved reusing staging web's Resend key and sender via
references and confirmed preparing all three Admin email variables. Sharing the
email key does not share application authentication; key rotation/revocation affects
both services. A dedicated email key remains an optional isolation improvement.

These are user-confirmed staged edits, not verified active runtime configuration.
No deployment, staging migration, database role provisioning, bridge delivery test
or staff bootstrap was performed. The Admin role remains unprovisioned. Keep staged
changes unapplied until separate release authorization. Backup/restore is deferred
under the staging-only exception above, not verified or implemented.
The user subsequently confirmed or staged
`ADMIN_WORKSPACE_EXPORTS_ENABLED=false` on worker without deploying. Verify the
effective value on both Admin and worker during authorized release. The
previously validated source archive is unchanged; this later runbook update is not
part of its existing checksum.

## Release sequence and gates

1. Complete local acceptance. Navigation and live rollout CRUD passed; this is not full
   browser acceptance for all existing mutations. User/staff/workspace actions must be
   tested on fictional fixtures, never on a real account just to exercise a control.
2. Confirm staging project/environment and inspect an IaC plan:

   ```sh
   railway status --project salesmora --environment staging
   railway config plan --environment staging
   ```

   Expect additions for `admin` and `admin-tunnel` only. Stop on any proposed deletion,
   unexpected change, or public-network exposure. Do not apply without reviewing the plan.
3. Configure the staging Access application and policy before routing the hostname.
   Create a dedicated remotely managed tunnel and securely configure its token in Railway.
   Configure the private origin above; all unmatched ingress must return 404.
4. Configure the Admin runtime variables and signed bridge secrets securely. Keep
   exports disabled in Admin and worker. Verify the staging web and worker can run
   the release with those disabled features.
5. Record the staging-only backup/restore exception and lack of verified recovery;
   no backup or restore operation is authorized for this release. Review **all** pending
   staging migrations, not only the two flag migrations. Local Admin development
   introduced earlier schema and grant changes that staging may not have yet.
   Plan additive, backward-compatible migrations; do not reset or seed staging.
6. Apply the reviewed infrastructure only after explicit deployment authorization.
   Deploy web first so its owner-only pre-deploy step applies migrations. Provision
   runtime roles through the existing secure owner procedure; this is not automatically
   performed by the web migration command. Verify the Admin role and narrow flag
   reader grants before starting Admin. Deploy the matching worker after migrations.
7. Deploy Admin and the connector. Do not generate a Railway public domain. The Admin
   service intentionally has no unauthenticated Railway HTTP health check: the proxy
   protects `/api/health`, so Railway's request without an Access JWT would be rejected.
   Check container startup and connector connectivity, then monitor health through Access
   using a suitable authorized identity. Do not exempt health paths merely to turn a
   deployment green.
8. Through the protected staging hostname, verify: unauthenticated requests are denied
   by Access; forged Access identity is denied by the app; customer cookies cannot
   authorize Admin; the separate Admin login/MFA works; health returns a no-store 200
   for an authorized Access request; no direct public origin bypass exists.
9. Bootstrap a new staging staff identity with `pnpm admin:bootstrap -- <staff-email@karpukcreative.com>`
   inside the configured Admin service shell. The command prints a single-use enrollment
   URL: treat that output as a secret and do not capture it in chat, logs or evidence.
   Enroll a new MFA factor at the staging hostname; local passkeys cannot be reused
   across origins. Test read permissions, audit and rollout CRUD using fictional data.
10. Verify the customer app and worker enforce the existing targeted flags, that environment
    ceilings still win, and that simple rollout flags affect only explicitly wired checks.
    Record release evidence before declaring staging accepted.

## Recovery

Keep the previous web and worker deployment IDs before release. If checks fail, disable
the tunnel's public-hostname route or stop its dedicated connector to close external
Admin access, then restore the previous application images as appropriate. Leave
additive schema changes in place unless a separately reviewed database recovery is
necessary. Do not use blanket migration rollback: Admin audit history must not be lost.
Do not delete shared database/Redis volumes or the files bucket. Rotate any credentials
suspected of exposure.
