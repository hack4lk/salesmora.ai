# SalesMora Lead Capture handoff

**Gmail account controls — November 3, 2026:** [Checkpoint two](lead-capture-gmail-connections.md) now implements the actual Connect Gmail button/Google consent redirect/callback, verified account binding, reconnect, versioned selection, reviewed disconnect and private refresh services. Validation: 3,530 full-suite unit cases, eight foundation and ten connection DB groups, one authenticated real-app browser journey with external Google navigation intercepted, and 78 responsive/a11y story cases. Real-account acceptance is pending one-time Salesmora Google client configuration; customers only click the button and consent, never configure client secrets. Both owned Gmail migrations were applied by name to the main local database, and a private local keyring was generated in ignored `.env.local`. Google credentials, feature enablement, Gmail delivery/ingestion and staging remain unchanged. Read [the operator setup guide](lead-capture-gmail-google-setup.md). Evidence: `.local/releases/capture-gmail-connections-20261103/`. Final focused lint and contracts/data/web typechecks passed. Real-account configuration/acceptance remains pending; later provider-backed sample/worker/staging checkpoints remain separate. The older descriptions below are historical.

**Gmail continuation — November 3, 2026:** The user approved the [Gmail integration plan](lead-capture-gmail-integration-plan.md), choosing new messages after launch and an existing Gmail account for real testing. [Foundation checkpoint one](lead-capture-gmail-foundation.md) now provides strict account contracts, current-grant capabilities, safe account listing, isolated encrypted credential custody and an additive Gmail database/role foundation. It is ready for review before OAuth/account control wiring. Validation: 3,525 unit cases, eight disposable DB groups, 54 existing role checks, contracts/data types and focused lint. Evidence: `.local/releases/capture-gmail-foundation-20261103/`. The new migration ran only on disposable databases; no Gmail account was accessed and no local main/staging schema or hosted settings changed. Read the [Google setup instructions](lead-capture-gmail-google-setup.md) for the reserved callback and credentials. Earlier assistant setup/publication work remains in the dirty tree; do not deploy or certify that work from this checkpoint. The older checkpoint descriptions below are historical.

**Current local work — November 3, 2026:** The user requested full Lead Capture assistant parity and approved the [assistant plan](lead-capture-assistant-plan.md) and checkpoints one through three. [Checkpoint four](lead-capture-assistant-setup.md) now implements eight draft/setup proposal operations, canonical in-app confirmation, current unsaved wizard binding and pasted Gmail sample extraction/refinement/approval. Verification passed: 3,506 full-suite unit cases plus final adapter regressions, eight disposable runtime-role database groups, nine browser journeys across the main and corrected Gmail runs, 123 story cases, package typechecks and lint. Evidence is in `.local/releases/capture-assistant-setup-20261103/`. This setup checkpoint is ready for review before proceeding. The additive `202611040002_capture_assistant_setup.ts` migration has been tested only in disposable databases. No assistant code/migration was deployed. After setup review, continue with checkpoint five (publication/lifecycle), then intake services. The staging scoped pilot remains separate; never upload the moving dirty tree.

**Continuation update — November 2, 2026:** The defaults-off deployment checkpoint is complete. Staging web `fec42939-e47b-4d94-9477-9a743bf2245e` and worker `8fbdd7c8-595b-4a4c-8c06-0a712bae3baf` successfully run candidate `2e914a3c...`. All publication/submission/scheduler controls remain off, scope empty, no readiness token provisioned, strict runtime roles and retention mode preserved. Ledger and all retained canary evidence hashes are unchanged (112 migrations, 12 receipts). Temporary SSH access was revoked and erased. Read the [current staging checkpoint](lead-capture-activation-staging-20261102.md) first. The next checkpoint is section 9C's separately reviewed scoped pilot; deployment instructions and live-version statements below describe the earlier handoff baseline and are now historical.

Prepared November 1, 2026 for continuation by another model. This document records the last verified state; recheck live state before any external change. The user's current request was to create this handoff, not to deploy or activate anything.

## 1. Start here

The website activation implementation is complete and verified **locally**, frozen over the last deployed lifecycle release. It has **not been deployed**. The next logical checkpoint, once the user asks to continue, is deployment of that exact candidate to staging web and matching worker **with all activation/submission switches off**. A separately reviewed, workspace-scoped pilot follows. Do not jump to unrestricted publication or production.

Latest message to the user before this handoff:

> Implemented and verified locally: scoped publication/resume, installation links, private worker readiness, and scheduler controls. Passed 3,431 unit tests, 28 database groups, five gateway groups, three authenticated browser journeys, types and lint. Staging is unchanged. The frozen candidate is ready for deployment with activation switches off.

Important reading order:

1. [Repository instructions](/Users/lukasz/dev/salesmora.ai/.github/instructions/General%20Instructions.instructions.md).
2. [Approved activation design](/Users/lukasz/dev/salesmora.ai/docs/lead-capture-activation-plan.md).
3. [Implementation and local QA](/Users/lukasz/dev/salesmora.ai/docs/lead-capture-activation-qa.md).
4. [Last active staging browser checkpoint](/Users/lukasz/dev/salesmora.ai/docs/lead-capture-active-embed-20261101.md).
5. [Restricted runtime-role cutover](/Users/lukasz/dev/salesmora.ai/docs/lead-capture-runtime-cutover-20261101.md).
6. [Lifecycle deployment](/Users/lukasz/dev/salesmora.ai/docs/lead-capture-lifecycle-staging-20261101.md).

The long [4f rollout document](/Users/lukasz/dev/salesmora.ai/docs/lead-capture-integration-step-4f-rollout.md) contains historical proposals and superseded deployment/ledger statements. Read its latest update and the dated evidence documents above before following older instructions.

## 2. Workspace, instructions and authorization

- Repository: `/Users/lukasz/dev/salesmora.ai`; shell zsh; timezone America/New_York.
- Follow `AGENTS.md` and `.github/instructions/General Instructions.instructions.md`. Reuse approved prototypes/components and existing camelCase conventions.
- The project requires incremental review: “Do one step at a time and ask for review and feedback from team members before proceeding to the next step.” The user has been approving each named checkpoint with “go”. Do not repeatedly ask about already authorized routine actions.
- The user approved the activation design and then its **local implementation/testing**. Hosted deployment of this new candidate is the next review checkpoint, not something already performed.
- Earlier the user explicitly approved staging deployment and inclusion of the extra admin email-change migration. That initial release had **20 additions**, superseding the original 19-migration runbook comparison. The live ledger subsequently reached 112. No migrations are added by the activation candidate.
- The user explicitly approved registering a temporary Railway SSH key, doing staging checks/backup work, then revoking it. Several subsequent bounded uses were completed and revoked. There are no known keys left from this task. Respect any new tool approval requirement; do not claim a credential exists just because this authorization was given.
- Real Turnstile completion was explicitly approved for the earlier canary. A later browser check used three submissions below the challenge threshold and did not complete a CAPTCHA. Follow the active browser tool's confirmation requirements if another challenge is encountered.
- The user was concerned about emails. All canaries used `notifyAssigned: false`, fictional `@example.test` contacts, and verified empty notification/outbox evidence. No real-recipient email test was authorized.
- No production activation, Gmail OAuth/ingestion, broad publication, Git push/merge or automatic deployment was requested in the current local implementation checkpoint.
- Do not send Slack/email messages. Do not spawn subagents unless newly requested or applicable instructions explicitly require delegation.

### Shared working-tree warning

There is a large, pre-existing dirty/untracked tree, and unrelated admin/billing work changed concurrently during this task. **Never reset it, commit everything, upload the moving directory, or overwrite unrelated changes.** A shared-workspace typecheck temporarily failed in unrelated `admin-billing-management.ts`; this was excluded from our candidate rather than edited. Other work also modified the data export barrel and root package scripts. Our isolated candidate synthesizes those two files from the deployed baseline plus only our changes.

Always use the frozen candidate below. If a live service has since moved beyond the recorded releases, reconcile with that newer work before deploying this older-baseline overlay; do not accidentally roll back another release.

## 3. Exact frozen activation candidate

| Item | Value |
| --- | --- |
| Read-only source directory | `/private/tmp/salesmora-capture-activation-release-20261101` |
| Source manifest digest | `2e914a3cf7c8bc4cf73b6078f031a388b01e02fa0263164fb8f2ccfe6368b2aa` |
| Parent lifecycle digest | `44715c227cf13b86ee6bc1b756a1cd515694f4d974c9232da172d864baa9059b` |
| Archive | `/Users/lukasz/dev/salesmora.ai/.local/releases/capture-activation-20261101/source.tar.gz` |
| Archive SHA-256 | `243c5bdfada015c771a52cc5303524861dcb2f94c7e93ed6c8031d4e2865080a` |
| Archive size | 4,054,883 bytes |
| Source file count | 2,589 |
| Changed/new paths over parent | 43 |
| Migration files | 112, all byte-identical to parent |
| Dependency versions / lockfiles | Unchanged |
| Hosted changes by this implementation | None |

Evidence directory: `/Users/lukasz/dev/salesmora.ai/.local/releases/capture-activation-20261101/` contains `release-manifest.json`, `validation.json`, `overlay-files.json`, archive/checksum and inspected `ready-review-320.png` / `ready-resume-320.png`.

The manifest's `files` array records every relative path and SHA-256. Its aggregate `digest` is SHA-256 of newline-joined `path + NUL + sha256` for sorted files. The manifest itself is separate from that file list and is included in the archive. No private validation settings, dependencies, generated builds, backup dumps or unrelated admin changes are included.

Useful checks:

```sh
cd /Users/lukasz/dev/salesmora.ai
shasum -a 256 .local/releases/capture-activation-20261101/source.tar.gz
```

Verify each frozen source file against the manifest before uploading. Do not regenerate the candidate from the current workspace unless intentionally changing the reviewed scope and rerunning appropriate checks. This handoff document was written afterward and is not part of the frozen candidate.

## 4. What the new candidate implements

### Shared web policy

`apps/web/src/server/lead-capture/submission-policy.ts` now exports `captureWebsiteDeliveryPolicy`; `delivery.ts` supplies `captureDeliveryAuthority` and workspace readiness. It requires explicit publication enablement, a nonempty bounded UUID allowlist, full existing submission/provider/verified-ingress/budget policy, and transactional schema checks. Production test settings cannot enable it. Gmail always remains unavailable.

The same authority is wired through publication GET/POST, lifecycle POST, scoped source GET and server-rendered source reads. `readCaptureSource` now accepts a backward-compatible optional delivery dependency and uses it for **both** lifecycle and publication review projections. Fixing mutation routes alone would have left dialogs incorrectly blocked.

Production-mode installation selection now uses the same scoped policy and the existing persisted publication key/version. It does not fabricate links from a draft. Legacy explicitly configured local previews remain supported when activation settings are absent.

Existing authorization, actor-bound idempotency, source/version bindings, assignment/access/capacity checks, immutable approvals and audit behavior are preserved. Pause/archive still work when delivery is unavailable.

### Private web readiness endpoint

`POST /api/internal/lead-capture/readiness`:

- Dedicated independent canonical 32-byte base64 bearer token; constant-time comparison before body parsing.
- Strict `{ workspaceId, requestId }` UUID body, at most 1 KiB, total body deadline two seconds.
- Response contains only matching IDs, canonical origin (or null), and `websiteReady`; private/no-store, no session/cookie.
- **No database reads or workspace locks**. The scheduler may already hold that workspace lock while calling it; introducing DB reads here can create lock inversion.
- Public forms routing/gateway continue rejecting this route, verified in both policy and native gateway tests.

### Worker

`apps/worker/src/capture-delivery.ts` validates fixed private URL/configuration and supplies `workerCaptureDelivery`:

- Production URL must use HTTP host `web.railway.internal` and exact readiness path, without credentials/query/hash. Non-production loopback is allowed for local tests.
- Worker checks the same schema prerequisites in its transaction, then requires a fresh exact-shape response bound to request ID, workspace and configured public origin.
- No positive cache. Redirects, non-200, invalid credentials, bad content/schema/origin/binding, response over 2 KiB, connection/body stall all deny delivery. Total network deadline three seconds.
- Worker needs no Turnstile/context/abuse/ingress credentials.

`startCapturePublications` is independently opt-in and is called outside the knowledge-task condition, preserving `WORKER_TASKS=retention`. Scope filters scheduler candidates **before** reconciliation or transition processing, so excluded workspaces are not inadvertently blocked. `processCapturePublications` has an optional fifth `workspaceIds` argument; existing internal callers retain their default behavior.

The loop remains single-flight at roughly 30-second intervals; shutdown waits for the active tick. Due readiness failure retains existing blocked-transition behavior. Restoring readiness does not automatically relaunch blocked work. Startup/status adds safe configured/scope-size reporting; this is not a continuous readiness proof.

**Important:** `WORKER_TASKS=retention` does not disable every notification loop. Other email loops already start outside that condition. Never treat retention mode as the canary's email-off control.

### New deployment controls

| Variable | Service | Initial setting |
| --- | --- | --- |
| `CAPTURE_WEBSITE_PUBLICATION_ENABLED` | Web | `false` |
| `CAPTURE_PUBLICATION_WORKSPACE_IDS` | Web + worker | Empty until scoped pilot |
| `CAPTURE_SCHEDULER_ENABLED` | Worker | `false` |
| `CAPTURE_READINESS_SECRET` | Web + worker only | Not provisioned yet; required for pilot |
| `CAPTURE_READINESS_URL` | Worker | Exact private web URL for pilot |
| Existing `CAPTURE_PUBLIC_ORIGIN` | Web + worker for pilot | `https://forms-staging.salesmora.ai` |
| Existing `CAPTURE_SUBMISSIONS_ENABLED` | Web | Remain `false` for first deployment |

No wildcard/all-workspace activation is implemented. Examples are in root `.env.example` and `infra/forms-gateway/{web,worker}-staging.env.example`. Keep private Railway references literal; never source `${{...}}` examples in a shell. Do not put the new token on the gateway or in build arguments/logs.

A narrow `@salesmora/data/lead-capture/delivery-policy` package export avoids loading the full data barrel in the proxy/private probe. No framework/package upgrade, authentication bypass, startup role-check bypass or webpack-specific application configuration is retained.

## 5. Verification already completed

On the isolated candidate:

- **3,431 unit tests / 214 files passed.**
- **19 publication database groups** and **nine lifecycle groups** passed using disposable local databases and runtime roles.
- **Five native gateway groups** passed, including private readiness-route denial.
- **Three real authenticated Chromium journeys passed** (final run 32.4 seconds):
  1. Actual confirmed UI launch, persisted installation URL, pause and approved-only ready resume.
  2. Non-allowlisted workspace gets blocked review, rejected publication and no installation authority; an app session cannot substitute for the private token.
  3. Scheduled launch through the real private web endpoint while holding the runtime-role transaction; then a second scheduled source is blocked by an invalid probe credential and does not auto-launch when the valid authority returns.
- All workspace typechecks and focused ESLint passed; final focused web typecheck passed after screenshot changes.
- Review-page overflow checked at 1440/768/320. Mobile launch-review and footer-focused resume screenshots visually inspected.
- All 112 migration hashes, lockfiles and dependency versions verified unchanged.
- Frozen manifest revalidated after archive creation. Private copied validation `.env.local` removed.

Final logs, if still present:

```text
/private/tmp/capture-activation-isolated-unit.log
/private/tmp/capture-activation-isolated-types.log
/private/tmp/capture-activation-final-web-types.log
/private/tmp/capture-activation-lint.log
/private/tmp/capture-activation-db.log
/private/tmp/capture-activation-lifecycle-db.log
/private/tmp/capture-activation-gateway.log
/private/tmp/capture-activation-isolated-e2e-clean.log
```

### Local framework/dependency-layout trap

Several earlier browser runs failed with Next `headers was called outside a request scope`, including unrelated notification routes. Both bundlers showed it. Symptoms match the upstream [Next singleton issue](https://github.com/vercel/next.js/pull/97255) and [Node realpath report](https://github.com/nodejs/node/pull/65113); the exact cause remains an inference.

The successful run used a **clean physical hoisted dependency layout** in the disposable validation copy, with the same frozen lockfile/versions and normal Turbopack. A first attempted conversion was insufficient because old per-workspace `node_modules/next` links remained and yielded two Next copies. Cleaning **only that disposable copy's** generated root/workspace dependency directories and its dedicated activation build, then installing afresh with:

```sh
CI=1 pnpm install --offline --frozen-lockfile --config.node-linker=hoisted
pnpm test:lead-capture-activation:e2e
```

resolved the observed failures. Do not apply framework monkeypatches, weaken authentication, upgrade dependencies casually, or delete the user's dependency tree. The retained browser harness resolves Next through the web package's module resolver and clears only its own `.next-e2e-capture-activation` build directory. Cold activation-server startup allowance is 240 seconds; actual private-probe timeout remains three seconds.

Validation copy: `/private/tmp/salesmora-capture-activation-validation-20261101`. Its dependencies remain, but its private `.env.local` has been removed. To rerun DB/browser tests, supply **local-only** database/auth settings privately. Do not copy provider credentials or use hosted URLs. Harnesses allocate/drop random `_test` databases; never point them at Railway.

Source preparation/freezing helpers (read before using):

```text
/private/tmp/prepare-capture-activation-validation-20261101.py
/private/tmp/freeze-capture-activation-20261101.py
```

These are task-specific, not generic deployment tools. The freeze helper refuses to overwrite the existing release directory. The prepare helper reads explicit owned files from the workspace and synthesizes the export barrel/package scripts over the old baseline; do not rerun it blindly after unrelated changes.

## 6. Last verified Railway state

This was observed during the completed preceding staging checkpoints, not re-queried while writing the handoff. Recheck before changes.

| Resource | ID |
| --- | --- |
| Project `salesmora` | `e0865ab2-d136-4e6c-a1bd-e96af3e52e74` |
| Environment `staging` | `41e4f7c2-f517-49ed-9c8e-6b654b926982` |
| Web service | `7409b770-a60e-4bf4-a60f-879a89e5efb5` |
| Worker service | `6a92c5f4-6cad-4a68-9059-f3dc1297c4b0` |
| Forms gateway | `745188d7-1395-48ed-9af4-24b6fcf37c72` |
| PostgreSQL | `ffc40393-0952-470a-bb20-09cbcf93bd18` |
| Redis | `9cb7b9c3-4998-4016-9560-cf56af61fb87` |

Application: `https://web-staging-cc17.up.railway.app`.
Forms: `https://forms-staging.salesmora.ai`.
Forms CNAME target: `x63jmg10.up.railway.app`; user added Railway-issued CNAME/TXT and real TLS checks passed. Gateway port 8080 reaches private web port 3000. Keep the gateway in maintained `.railway/railway.ts`; `.railway/forms-staging.ts` delegates to it.

Last verified successful deployments:

| Service | Deployment |
| --- | --- |
| Web, transport disabled | `4fc92907-c4db-418c-92fb-dd04615c8e08` |
| Worker, strict role enforced | `96b25e29-c980-4475-8373-6ffd9a611147` |
| Forms gateway | `bf34e1e4-bf24-49e4-9d87-b7f9c1226fc3` |
| PostgreSQL | `78e3d5ca-f9e6-4791-be81-74ce28e42d2c` |
| Redis | `df683cff-ee73-4364-8fee-df16c325f297` |

Production had **no service instances**. Last maintained Railway plan was zero changes. No infrastructure apply is required for this activation code candidate.

Live web/worker source is still the frozen lifecycle parent, `/private/tmp/salesmora-capture-lifecycle-release-20261101`, digest `44715c...`. The newly implemented activation endpoint/authority/scheduler wiring is absent live until the new candidate is deployed.

- Web `DATABASE_URL`: restricted `salesmora_web`.
- Worker `DATABASE_URL`: restricted `salesmora_worker`.
- Both: `DATABASE_ROLE_ENFORCED=true`.
- Web `MIGRATION_DATABASE_URL`: retained owner connection for pre-deploy migrations.
- Web `CAPTURE_SUBMISSIONS_ENABLED=false`.
- Worker `WORKER_TASKS=retention`.
- General publication/delivery disabled by old source. New flags were not provisioned by the local implementation.
- Real staging Turnstile, independent context/abuse/ingress secrets, verified `x-real-ip` ingress mode and conservative budgets were already configured and tested. Preserve them; do not print their values.
- Last worker diagnostic: ready, retention scheduled, one retention worker, zero failed jobs, empty notification-delivery rows.

## 7. Retained synthetic evidence: do not delete/reset

Workspace: `5d7342e2-f48e-4d5b-a9de-944851aac28d`.
Owner: `capture-canary-47a6f0b7-c904-4377-b5da-f442842457be` (fictional `@example.test` identity; no authentication account/session was created for it).

| Source | Final state | Receipts |
| --- | --- | --- |
| `a9c09c90-fc59-436e-ad60-a74a38d78f4a` | Archived, version 3 | 7 |
| `fb5232c4-6d78-4e4c-8734-8ad9a321869c` | Archived, version 9 | 2 |
| `d3c1ef5c-e5ac-4eec-b84f-eddf878f4410` | Archived, version 3 | 3 |

Total **12 receipts**, immutable consent/provenance/processing and linked lead-or-review evidence retained. No active or scheduled source remained at the last check; verify this again before enabling transport.

Earlier live checks covered real challenge acceptance, failed/expired contexts, exact/lost-response retry, changed-payload conflict, 5/20 thresholds, forged ingress headers, actual phone-cellular second-network acceptance, stable revision URL/consent refresh, access loss and archive retention. The user personally confirmed “request received” on the phone. The last three requests covered mobile hosted, third-party-cookie-blocked direct iframe and loader, success shrinking and an untouched second embed.

Safe evidence/state files:

```text
/Users/lukasz/dev/salesmora.ai/.local/releases/capture-canary-20261101/state.json
/Users/lukasz/dev/salesmora.ai/.local/releases/capture-revision-20261101/state.json
/Users/lukasz/dev/salesmora.ai/.local/releases/capture-active-embed-20261101/state.json
/Users/lukasz/dev/salesmora.ai/.local/releases/capture-active-embed-20261101/final-verification.json
```

Read `state.json` to obtain public keys rather than inventing one. Archived pages intentionally return HTTP 200 with unavailable content; their projection is `state: unavailable`. Missing keys return 404. With transport off, POST returns 503 `{ "state": "retry" }`; do not claim accepted retry acknowledgment during shutdown.

## 8. Backup and access state

Latest retained pre-runtime-cutover backup:

- `/Users/lukasz/dev/salesmora.ai/.local/backups/capture-runtime-cutover-20261101/staging.dump`.
- SHA-256 `91d5efdf16d6c002dd6e37ad95b84e8bfc4df7c8b695493a2b1d575d44fe61ca`; 844,169 bytes; mode 600, directory 700.
- Off-volume copy hash-verified and fully restored into a separate scratch database; **168 table counts and 112 ledger names matched**; scratch access revoked and scratch dropped.
- Remote copy: `/var/lib/postgresql/data/release-backups/capture-runtime-cutover-20261101/`.
- **This backup predates the last three accepted receipts.** Do not restore it over the current database. Take a fresh private backup before any future schema change/recovery or when the next operational checkpoint calls for it. No schema change is proposed by this candidate.

Older initial-release backup: `.local/backups/capture-release-20261101/staging.dump`, hash `47d2a61152522398070627108c873e841a860404cc378aa2a74952376b8c73a5`, 92-migration historical snapshot. It is not the current recovery point.

Temporary Railway SSH keys were revoked after each checkpoint, account list confirmed no registered keys at last cleanup, isolated agents stopped and private key files erased. No temporary runtime-password state remains. Runtime credentials live privately in Railway, not in this document.

Old helper directories remain under `/private/tmp/capture-runtime-cutover-20261101`, `/private/tmp/capture-active-embed-20261101`, and older preparation directories. Their private keys/agents are gone and configs may identify old deployment instances. Read them for patterns, not as ready-to-run current access.

## 9. Next execution checklist

### A. Resume/read-only preflight

1. Read instructions and the design/QA. Check current user direction before performing external actions.
2. Verify archive and manifest hashes. Inspect the 43-path delta, not the entire dirty-tree diff.
3. Re-query Railway service versions, gate booleans and task mode without printing credentials. If another deployment has appeared, reconcile before upload.
4. Retain strict runtime roles, migration owner separation, all data, gateway/domain, PostgreSQL/Redis/bucket and production's empty state.

Use Node 22 for Railway IaC/CLI:

```sh
export PATH=/Users/lukasz/.nvm/versions/node/v22.23.3/bin:$PATH
```

Default Node 20 previously produced `node: bad option: --experimental-strip-types` for Railway IaC. CLI used in this work was 5.71.0.

### B. Deploy code with controls off, after checkpoint approval

Explicitly preserve/set web publication/submissions off and worker scheduler off; no readiness token is needed to deploy defaults-off code. Use stdin/structured subprocess arguments for sensitive values and `--skip-deploys` when staging variable changes. Never dump `railway variable list --json` into chat: it contains raw secrets.

Upload the immutable candidate, not cwd:

```sh
railway up /private/tmp/salesmora-capture-activation-release-20261101 --path-as-root \
  --project e0865ab2-d136-4e6c-a1bd-e96af3e52e74 \
  --service web --environment staging --detach \
  --message 'Reviewed scoped website activation 2e914a3c; switches off; unchanged 112 migrations'
```

Wait for SUCCESS, inspect migration/startup logs and verify health/ledger/evidence. Then deploy the matching worker from the same candidate using `--service worker`. Gateway code did not change; no gateway redeploy or infrastructure apply is required.

Expected checks: `/api/health` 200 `{status:ok}`, login 200, anonymous lifecycle/source requests 401, foreign-origin writes 403, new private readiness handler denies missing/wrong token, no session issuance, forms gateway rejects private endpoint, submission transport remains 503/retry. Verify web/worker actual restricted-role facts and enforcement, worker retention readiness, exact 112-name ledger and retained 12-receipt evidence. The web liveness endpoint alone does not establish DB/auth/delivery readiness.

If SSH is needed, use a new task-specific temporary key/isolated agent, generate configs for the **current** deployment, use owner MURL only for ledger/backup, and revoke/erase access immediately after checks. Never fabricate a hosted customer login/session just to smoke-test an API.

### C. Separate scoped pilot after deployment review

Provision the new independent readiness token privately to web/worker only. Configure matching scope/origin and the private URL. Start with the existing fictional workspace only; no wildcard. Verify a negative authenticated readiness response while gates are off.

Then, with the scoped pilot authorized, enable transport and web publication for that workspace, verify current readiness, and enable the capture scheduler independently. Keep `WORKER_TASKS=retention`. Use the real web authority in server operations; do not substitute the old one-shot `websiteReady: true` adapters when claiming that the new activation patch works.

Test immediate publication/installation/resume and an actual scheduled launch, followed by planned readiness loss. Free capacity is one published source, so archive completed test sources before reserving another slot. Schedule sufficiently far ahead to complete any web deployment/configuration change before its due instant. **Never copy the local rehearsal's trigger-disabling/backdating helper to staging.** It is exclusively for fresh disposable local databases.

Use no-email fictional configuration, new request UUIDs, current source/draft/approved versions and existing audited services. Do not republish archived evidence through direct SQL or invent auth sessions. Do not send real-recipient notifications without explicit authorization. Inspect durable results and notification intent. Archive canaries normally and return scheduler/publication/transport to off unless continued operation was separately approved.

Disable scheduler first when stopping due processing, then publication. Intake has its own transport switch. A blocked due transition remains blocked after recovery until explicitly reviewed/rescheduled. Never roll back migrations, reset tables, delete receipt evidence or restore an old snapshot over accepted requests.

### D. Record the checkpoint

Record exact new deployment IDs, source/archive digests, gate/role checks, ledger/evidence counts and token/SSH cleanup. Update the dated deployment/activation documents. Distinguish code deployment, scoped pilot and broad activation.

Still separate/unclaimed: real-user interactive login/workspace/assistant readiness, Gmail provider integration, general/unrestricted publication, and production hosting/activation. A fictional app-host cookie probe is not proof of a real signed-in session.

## 10. Do not repeat these mistakes

- Do not treat historical 92/111/19-migration prose as the current ledger: current verified baseline is 112, with the user-approved admin email-change addition included.
- Do not deploy the moving workspace or accidentally include concurrent admin/billing changes.
- Do not set worker task mode to `all` merely to start the capture scheduler.
- Do not assume changing a submission Boolean enables the old hard-disabled authority; the new code must be deployed first.
- Do not put workspace locks/DB reads in the private readiness endpoint.
- Do not give the worker/gateway unnecessary provider credentials or log raw variable JSON.
- Do not infer dynamic scheduler liveness from `captureSchedulerConfigured`.
- Do not reuse stale SSH instance configs or leave registered keys/agents behind.
- Do not assume `assignmentEmailOutbox` has a workspace column; scope via its `id` foreign key to `assignmentNotifications`.
- Do not assert archived pages return 404; inspect unavailable state/content.
- Do not capture modal screenshots mid-fade. The final screenshot disables animation and focuses the Cancel footer before capture.
- Do not keep changing application code to mask the observed local Next module-identity issue; a clean physical test dependency layout succeeded without those experiments.

## 11. Exact activation delta

The following 43 paths are copied directly from the frozen manifest. Root `.env.example` was also updated in the working tree with defaults-off examples, but is excluded from the release source's environment-file inventory.

```text
README.md
apps/web/e2e/lead-capture-activation.spec.ts
apps/web/e2e/lead-capture.spec.ts
apps/web/playwright.config.ts
apps/web/src/app/api/internal/lead-capture/readiness/route.ts
apps/web/src/app/api/lead-capture/[sourceId]/lifecycle/route.ts
apps/web/src/app/api/lead-capture/[sourceId]/publication/route.ts
apps/web/src/app/api/lead-capture/[sourceId]/route.ts
apps/web/src/features/lead-capture/connected/capture-connected.data.ts
apps/web/src/features/lead-capture/connected/capture-connected.stories.tsx
apps/web/src/server/lead-capture/activation-http.test.ts
apps/web/src/server/lead-capture/delivery.test.ts
apps/web/src/server/lead-capture/delivery.ts
apps/web/src/server/lead-capture/lifecycle-http.test.ts
apps/web/src/server/lead-capture/public-config.test.ts
apps/web/src/server/lead-capture/read-page.tsx
apps/web/src/server/lead-capture/readiness.ts
apps/web/src/server/lead-capture/submission-policy.ts
apps/worker/src/capture-delivery.test.ts
apps/worker/src/capture-delivery.ts
apps/worker/src/capture-publication.test.ts
apps/worker/src/capture-publication.ts
apps/worker/src/index.ts
apps/worker/src/status.ts
docs/lead-capture-activation-plan.md
docs/lead-capture-activation-qa.md
docs/lead-capture-plan.md
infra/forms-gateway/gateway.test.mjs
infra/forms-gateway/web-staging.env.example
infra/forms-gateway/worker-staging.env.example
package.json
packages/contracts/src/lead-capture/index.ts
packages/contracts/src/lead-capture/readiness.ts
packages/data/package.json
packages/data/src/index.ts
packages/data/src/lead-capture/delivery-policy.test.ts
packages/data/src/lead-capture/delivery-policy.ts
packages/data/src/lead-capture/lifecycle.rehearsal.ts
packages/data/src/lead-capture/publication.rehearsal.ts
packages/data/src/lead-capture/publication.ts
packages/data/src/lead-capture/store.ts
scripts/e2e-server.mjs
scripts/lead-capture-e2e.mjs
```
