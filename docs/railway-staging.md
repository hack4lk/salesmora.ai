# Railway staging preparation

The approved staging deployment now uses the existing Railway account. See the deployment record below for the live target and verified checks. Use the dedicated `staging` environment in the `salesmora` project with fictional accounts and CRM records. Do not attach existing unrelated Railway databases or copy local accounts, transcripts or credentials.

## Service layout

All repository services use the **repository root** as their build context/root directory, not `apps/web` or `apps/worker`. The supported definition is `.railway/railway.ts`, imported from the live staging environment with variables unmanaged. Railway rejects legacy Config as Code for new services; the earlier per-service JSON files have been replaced. Do not set a legacy Config File path.

| Service | Deployment source | Networking / storage |
| --- | --- | --- |
| `postgres` | `infra/postgres/Dockerfile` | Private only; volume at `/var/lib/postgresql/data` |
| `web` | `infra/railway/web.Dockerfile` | Public Railway HTTPS domain; `PORT` supplied by Railway |
| `worker` | `infra/railway/worker.Dockerfile` | Private process, no public domain/port; one replica |
| `redis` | Railway Redis service, configure explicitly below | Private only; persistent volume at `/data` |

The PostgreSQL image uses the existing pinned PostgreSQL 17 + pgvector 0.8.7 Dockerfile. It does not include the local Compose test-database initialization mount. Configure `POSTGRES_DB=salesmora_staging`, `POSTGRES_USER=salesmora`, `PGDATA=/var/lib/postgresql/data/pgdata`, and a generated, unique `POSTGRES_PASSWORD` through Railway. The PGDATA subdirectory is required because Railway volumes include `lost+found`; initializing at the mount root fails. Define its `DATABASE_URL` with percent-encoded credentials, the private service hostname and port 5432, referencing the service variables. Do not assume a custom database service automatically has the variables of Railway's database template.

For Redis, use the pinned Redis image from `compose.yaml`, require a generated unique password, and configure `--appendonly yes --appendfsync everysec --maxmemory-policy noeviction` with a persistent `/data` volume. Reference its authenticated private `REDIS_URL` from the worker. Verify persistence and eviction settings on the running service; a stock template is not proof of these settings. Use certificate-verified `rediss://` for connections outside the trusted private network. No public database/Redis TCP proxy is needed.

The web and worker images retain source and installed development dependencies because workspace exports and migration tooling currently require TypeScript. This is a reproducible first deployment package, not an optimized standalone bundle. Both run as the unprivileged Node user and receive SIGTERM directly. `.dockerignore` excludes environment files, credentials directories, local backups and local build artifacts. The web build supplies disposable compile-time placeholders; Railway runtime variables must provide real values. No secrets or service access are needed at build time.

## Runtime variables

Configure these in Railway's Variables UI or a secure secret manager; do not paste secrets into chat, commit them, or pass them as Docker build arguments.

| Variable | Web | Worker |
| --- | --- | --- |
| `NODE_ENV` | `production` (image default) | `production` (image default) |
| `DATABASE_URL` | Reference private staging PostgreSQL URL | Same staging reference |
| `BETTER_AUTH_URL` | Exact generated HTTPS web origin, no wildcard | Unneeded |
| `BETTER_AUTH_SECRET` | New random secret, at least 32 characters | Unneeded |
| `TERMS_VERSION` | Explicit reviewed staging terms identifier | Unneeded |
| `CHAT_ENABLED` | `false` initially; `true` only for the reviewed live-chat rehearsal | Unneeded |
| `CHAT_MODEL` | `gpt-6-luna` | Unneeded |
| `CHAT_MONTHLY_WORKSPACE_TOKENS` | `5000000`, the approved default; use a lower reviewed staging allowance if desired | Unneeded |
| `OPENAI_API_KEY` | Separate restricted staging key when enabling chat | Only needed for `WORKER_TASKS=all` |
| `LANGSMITH_TRACING`, `LANGCHAIN_TRACING_V2` | `false` | `false` |
| `REDIS_URL` | Unneeded for current web runtime | Reference private authenticated staging Redis URL |
| `WORKER_QUEUE_NAME` | Unneeded | `salesmora-staging-help` |
| `WORKER_TASKS` | Unneeded | `retention` initially |

Never configure `SALESMORA_TEST_SERVER`, `CHAT_TEST_PROVIDER`, `SALESMORA_PROXY_TEST`, `SALESMORA_LIVE_EVAL`, `TEST_DATABASE_URL`, or local proxy fault paths in Railway. Keep one web replica initially while measuring streaming; scale only after concurrency/redeploy checks. Disable serverless sleeping for the persistent worker. Only trust the configured HTTPS auth origin; forwarded client IP headers remain deliberately untrusted, so auth rate limits currently share a conservative fallback bucket. Validate a Railway-specific trusted-proxy policy before broad public use.

## Deployment order

1. Create the dedicated project/environment and set a Railway spending limit/alert appropriate to the account. Confirm region, private networking and persistent database/Redis volumes before starting applications. Configure backups and rehearse restoration into a separate disposable service.
2. Deploy PostgreSQL and Redis, configure their private URLs, and check connectivity and Redis persistence. The database must support `CREATE EXTENSION vector`; use the custom image above.
3. Add the web service and generate its HTTPS domain. Set all required runtime variables with chat disabled. Its pre-deploy command directly executes `node --import /app/packages/data/node_modules/tsx/dist/loader.mjs /app/packages/data/src/migrate.ts`. A shell-dependent `cd ... && ...` command failed on Railway; the absolute loader/script command passed. A failed migration stops deployment; it is not automatically retried. Inspect the failure safely, resolve it and redeploy. No test reset/rollback/seed commands run. Migrations must remain backward compatible with the old application during rollout.
4. Verify `/api/health` returns a no-store `200 {"status":"ok"}` and `/login` renders. Health is **process liveness**, not database readiness or a continuous uptime monitor. Verify registration/login and workspace creation separately to establish database/auth readiness. Keep credentials and session cookies out of evidence logs.
5. Deploy the retention-only worker after web migrations succeed. Check its structured ready log, then run `cd /app/apps/worker && node --import tsx src/status.ts` in a Railway service shell. Confirm scheduler and worker counts. Worker shutdown grace is 40 seconds; web grace is 100 seconds to accommodate a 90-second turn. Rehearse an actual restart; config alone does not prove draining behavior.
6. Configure external failure/retention-backlog alerts and test delivery. Railway deployment health checks are not a substitute for queue/retention monitoring. See [worker operations](worker-deployment.md).
7. Resolve email delivery and help-corpus publication below, create approved fictional Owner/Admin/Office/Field accounts, and review the staging allowance/key before enabling chat. Then run the remote checklist below through the actual public HTTPS origin.

## Outstanding integration gates

**Email:** Verification, invitations and password recovery now share a Resend HTTPS transport for staging, with Mailpit retained for local loopback origins. The user verified `staging.mail.salesmora.ai` and added its sending-only key in Railway. Web needs `EMAIL_PROVIDER=resend` and `EMAIL_FROM=SalesMora Staging <no-reply@staging.mail.salesmora.ai>`. No key is copied to source or local env files. See [email setup](email-verification.md). The user confirmed inbox delivery and all verification, invitation and password-reset links work on staging.

**Help/RAG:** The dedicated guarded publisher has published eight articles/23 vectors and passed repeat-publication, role/status and semantic checks; see [staging knowledge publication](staging-knowledge-publication.md). Existing `knowledge:seed`, `knowledge:evaluate`, `ai:budget` and browser/worker rehearsals remain local-only. Staging publication requires a separate OpenAI key and an explicit reviewed corpus digest; preview makes no network requests. The publisher executes inside the staging worker as a one-off command and does not require switching its persistent retention worker to `all`. No remote budget editor was added; the configured default allowance applies to new staging workspaces.

## Remote verification checklist

Do not run `test:e2e` or `test:proxy` against Railway: their fixtures reset the isolated local test database. Remote checks must use dedicated fictional accounts/workspaces and bounded live calls, never production test-provider overrides.

- Verify HTTPS cookies, exact-origin accepted mutations, missing/forged-origin denial, unauthenticated denial and cross-workspace isolation. Field access must follow current permissions and assigned-record scope.
- Observe Thinking before completion and progressive deltas through Railway TLS/edge. Inspect `text/event-stream`, `no-store, no-transform`, no buffering/caching, and heartbeat delivery when provider latency permits. Record timings/counts, not prompts, tokens, sessions or customer IDs.
- Verify Stop, browser disconnect, close/reopen, explicit retry, incomplete-stream recovery and safe duplicate-request replay. Use a controlled staging fault exercise for timeout/disconnect; do not deploy local injection routes or assume a live model will reliably wait 90 seconds.
- Verify usage reservations/settlement, concurrent admission and exhausted allowance behavior in an intentionally limited staging workspace. Unknown provider usage must retain conservative reservations.
- Draft one fictional lead, verify verbal confirmation cannot commit, explicitly confirm once, then repeat the same confirmation/reload to prove idempotency. Revoke permissions before a separate draft confirmation and verify denial.
- Verify help citations only after corpus publication; test policy revocation, role filtering and inaccessible/retired sources.
- Restart web during a bounded active turn and worker during a safe controlled retention job. Verify recovery, stable schedules and alert delivery. Verify backup restoration without altering the live staging database.

## Local image rehearsal

```sh
docker build -f infra/railway/web.Dockerfile -t salesmora-staging-web:rehearsal .
docker build -f infra/railway/worker.Dockerfile -t salesmora-staging-worker:rehearsal .
```

Use ignored, staging-specific runtime env files for local container tests if needed. The regular local app/Compose remains unchanged; do not use the development database to rehearse deployment migrations or cleanup. Basic HTTPS readiness and worker restart are verified in staging. Live edge chat streaming, backup restoration, secret rotation and conversation recovery remain release checks.

Use Node 22 and Railway CLI 5.66.0 or newer with the pinned `railway` development dependency. Preview changes with `railway config plan --environment staging`; the imported definition initially produced no changes. Review before `railway config apply --environment staging`. Variable values stay in Railway: never use `--include-variables`, `--decrypt-variables` or `--show-values` for shared evidence. CLI uploads deploy source, while IaC plan/apply updates infrastructure separately. No GitHub auto-deploy source is connected.

Configuration was checked against Railway's [Infrastructure as Code guide](https://docs.railway.com/infrastructure-as-code), [monorepo guidance](https://docs.railway.com/deployments/monorepo), [pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command) and [health checks](https://docs.railway.com/deployments/healthchecks).

## Approved deployment record — October 12, 2026

- Project: [salesmora](https://railway.com/project/e0865ab2-d136-4e6c-a1bd-e96af3e52e74?environmentId=41e4f7c2-f517-49ed-9c8e-6b654b926982), project ID `e0865ab2-d136-4e6c-a1bd-e96af3e52e74`.
- Active environment: `staging`, ID `41e4f7c2-f517-49ed-9c8e-6b654b926982`. The automatically created `production` environment is empty. Repository CLI link selects the staging web service.
- Application: [staging login](https://web-staging-cc17.up.railway.app/login). All four services succeeded in `us-west2`, one replica each. PostgreSQL and Redis have private networking and separate 5 GB volumes; only web has a public domain.
- Separate random staging database/Redis/auth credentials were generated and sent through stdin to Railway; no local accounts, data or provider key were copied. Variables remain unmanaged by IaC. Chat is disabled and worker tasks are retention-only.
- Verified HTTPS health/login `200`, no-store headers, signed-out AI usage `401`, and Home redirect to login. Database has all 12 migrations and zero user accounts. pgvector 0.8.7 is available. Redis authenticated PING, AOF/everysec and noeviction checks passed. Worker status reports database ready, one worker, one daily scheduler, no failed jobs; graceful restart retained this state. Temporary registered SSH key and dedicated local agent/key files were revoked/removed.
- Replaced unsupported legacy config files with `.railway/railway.ts`; pinned SDK `railway@3.15.0`. Current CLI 5.66.0 was installed temporarily, leaving the global CLI unchanged. IaC SDK type checking, lint and the no-change infrastructure plan passed. The CLI-generated unmanaged-variable policy is retained despite its missing field in SDK 3.15's ProjectDefinition typings. No infrastructure apply, secret export, GitHub source connection or billing-plan change was needed.
- Railway rejected backup schedules because this workspace is not Pro. No upgrade was performed; managed backups/restoration remain unconfigured. External alert destinations, account spending controls, staging email, remote help publisher, restricted provider key and live chat/RAG/security checks remain follow-ups. No paid AI calls were made.

Initial deployment failures were resolved: direct volume-root initialization (`lost+found`) required a PGDATA subdirectory; shell-dependent web migration pre-deploy failed and was replaced with absolute Node loader/script paths. CLI config-file mutations were not applied because new Railway services now reject legacy Config as Code. The supported IaC import matches the live settings with no pending changes.

## Email rollout status — October 13, 2026

Web deployment `42c1d554-192d-4b55-bb3a-24f05318b86c` reached SUCCESS after an initial pre-deploy delay. The delay cleared without code changes or a retry. Public `/api/health` and `/login` both return 200. Resend accepted the neutral test-recipient message and both CID template checks from local source using staging variables; no real account tokens were sent. Local validation passed seven unit tests, 26 browser tests, lint and web types. The user subsequently confirmed inbox delivery and all verification, invitation and password-reset flows work on staging.

## Assistant provider gate — October 13, 2026

The guarded publisher is deployed successfully. The user added staging provider keys to web and worker, and model metadata access succeeded. Corpus publication was attempted inside the deployed worker after its no-network preview matched the reviewed digest. The provider refused embedding with HTTP 429 `credit_balance_exhausted` (type `insufficient_quota`). Fund the API organization owning the key before retrying. Publication left one draft article, zero vectors and one failed corpus usage call; retry remains safe. Chat is still disabled. No customer content was sent in diagnostic requests. Temporary SSH access used for publication/inspection was revoked and removed.

## Live assistant rehearsal — October 13, 2026

After the user funded the API organization, the reviewed corpus published successfully: eight articles, 23 vectors; repeat invocation reported all eight unchanged. Twelve direct role/product-status checks and three semantic retrieval cases passed. The direct checks use synthetic default-policy contexts; the HTTP checks below use actual staged membership/policy records.

Enabled `CHAT_ENABLED=true` only on staging web. Deployment `d5a5216d-595b-4f39-8e27-0358540a784c` reached SUCCESS. The persistent worker remains retention-only; the publisher runs as a separate operator command. Production remains empty.

Four fictional accounts use unique Resend delivered-test-recipient labels. Two fictional workspaces isolate checks from existing accounts. Three memberships were created by an operator fixture that checks exact workspace owner/name and account email labels; no existing account or customer data was changed. Test artifacts remain in those fictional workspaces for audit/retention; four test sessions were revoked and temporary local session data removed.

Verified through the public Railway HTTPS origin:

- Owner/Admin/Office/Field all received completed live streamed responses, with Thinking before text and no-store SSE headers. Owner help emitted 69 deltas, first text at 4.85 seconds and completion at 15.85 seconds. Field help emitted 112 deltas, first text at 4.83 seconds and completion at 20.94 seconds. These are single-run observations, not latency guarantees.
- Owner, Field and Admin help citations resolved to accessible pages. Field history contained no create-lead, lead-fields, permissions or planned campaign evidence and no proposed action. Field manual lead creation and confirmation of another actor’s draft were denied.
- Signed-out, forged-origin and cross-workspace requests were denied. Private history restored the pending proposal. Completed-turn replay did not regenerate or add provider calls.
- Natural-language approval produced no lead. Explicit confirmation created exactly one fictional lead and one confirmation audit row; duplicate confirmation returned the same lead. Office prepared a proposal, then confirmation was denied after Owner revoked its creation permission through the real permissions endpoint. Original grants were restored afterward.
- Stop after the first response delta produced a durable cancelled terminal event (three deltas arrived before cancellation completed).
- A zero allowance on the fictional workspace returned `budget_exceeded` without answer deltas or new provider usage calls. Its allowance was restored to 5,000,000.
- Seventeen calls reported 11,003 total tokens, with input/output sums and reservations validated. One interrupted answer retained an unknown-usage reservation. Thirty-six checkpoint rows passed checks for absence of the tested prompt/lead strings; no checkpoint content was logged. Shared corpus and semantic evaluation usage remain separately recorded.

Temporary SSH registration, private key, dedicated agent and trust files were revoked/removed. No test-provider override, local fixture reset, new schema migration, production deployment or subscription change was used.

Remaining release checks include broader adversarial/concurrency coverage, disconnect/timeout and redeploy recovery, backup restoration, secret rotation, trusted-proxy rate limits and external alert delivery. These staging smoke checks do not establish production readiness.

## Registration and billing release — October 13, 2026

Released the approved pricing registration, embedded Stripe Checkout, Settings → Billing, plan-change dialogs and cancellation/undo to staging. Final web deployment `cebc7ca6-e333-4a23-817f-74e17f429fec` and worker deployment `d40c5266-df46-474a-a167-ccfbe9ac1e18` reached SUCCESS. Production and database/Redis service configuration were unchanged. Source was uploaded with Railway CLI; no GitHub auto-deploy connection or Git push was made.

The web pre-deploy migration completed successfully, applying the three additive billing migrations (`202610130001_billing_checkout`, `202610130002_billing_read`, `202610130003_plan_changes`). Staging web and worker now enable sandbox billing with the approved monthly Standard/Premium prices. Provider keys were passed through stdin and remain in Railway variables. The staging-only webhook endpoint uses Stripe API version `2026-09-30.endive`; its signing secret is separate from the local Stripe CLI secret. No live payments are enabled.

The initial web release exposed a build-time flag issue: Billing had been prerendered as 404 because image builds intentionally have no Stripe configuration. Billing's page and summary endpoint now explicitly use dynamic rendering. A production build with billing disabled followed by runtime enablement correctly redirected a signed-out Billing request to login, and the corrected Railway build listed Billing as dynamic.

Validation: 383 unit tests, workspace type checks, lint and the production build passed. Public HTTPS staging checks passed for health, registration pricing, signed-out/forged-origin/cross-workspace denial and rejection of an unsigned webhook. A fresh fictional Owner workspace completed an embedded sandbox purchase without leaving SalesMora; its Standard allowance and paid invoice appeared in Billing. Cancellation open/dismiss/confirm and Keep subscription undo passed. Subsequent provider-side cancellation reconciled asynchronously back to Free through the webhook/worker path. The worker reported ready. The fictional subscription was canceled and the app session signed out (subsequent summary request returned 401); fictional workspace/invoice/audit records remain for evidence. No existing customer account was changed.

Automatic approval review rejected optional registration of a temporary Railway SSH key. No key was created or registered; verification used deployment logs and public HTTPS checks instead. No direct database audit was performed for this release.

Remaining billing sections: standalone payment-method/contact management, older invoice pagination, complete ongoing seat/lead/campaign/storage admission enforcement and account deletion. AI allowance and initial registration seat admission are connected; the other catalog limits should not be treated as fully enforced. Existing backup/production-readiness follow-ups remain open.

## Field response regression — October 13, 2026

Deployed `ef92c142-5ce2-4657-9f5e-1196a4f94348` successfully. Planning and final answering now both receive current server-authorized tools, and lead-drafting instructions forbid requesting proposal fields when its tool is unavailable. The adapter suppresses commentary text, which could repeat the final response. Existing server/tool/confirmation permissions are unchanged.

All 371 unit tests, 15 local chat/action browser checks, workspace types and lint passed. The previous release reproduced Field service collection without any proposal. On the new release, three live Field requests (missing service, supplied service and a claimed Owner role) were refused in that same thread without collecting inputs or preparing a proposal. An actual Owner retained the valid missing-service clarification without repeated text. Scoped database inspection confirmed zero drafts/leads. Two isolated fictional accounts were used; their sessions and temporary SSH access were revoked and all temporary credential/session files removed. No production, schema or policy change.

## Billing and Account follow-up release — October 14, 2026

User approved the combined staging release. Scope: Settings → Account and permanent account/workspace deletion; embedded renewal-card updates; explicit failed-renewal recovery with bank verification and durable retries; lead/teammate admission limits; complete invoice-history paging. Billing-contact editing remains deferred. Campaign/storage admission gates remain tied to their future modules. Stripe stays sandbox-only; no production deployment or Git push.

Web deployment `0e0697fe-a9a9-4e48-b1f0-6b5d19390306` reached SUCCESS. Its pre-deploy runner completed migrations through `202610140006_lead_admission_tracking`, including the six additive account/card/recovery/lead-accounting migrations. Worker deployment `c46e26d0-c893-49ac-8661-ddf8f3d5243e` also reached SUCCESS and reported ready with retention, billing reconciliation and account-deletion processing.

Local release gates: 397 unit tests, types, lint and production app/worker builds passed. All seven targeted sandbox quota/history/card/renewal tests passed after focused corrections: explicit test country/postal fields, duplicate confirmation of the browser's actual quote, and exercising status-only refresh when a provider result is uncertain. Desktop/mobile Storybook coverage and accessibility checks passed in the individual sections. No application behavior was weakened to make the tests pass.

Existing staging variables were checked in memory, emitting only presence/mode booleans. Web/worker billing flags and sandbox secret/price configuration, web publishable key, webhook secret and HTTPS auth origin passed. No values were logged, copied into source or changed. CLI source upload excludes local credentials, generated builds, test output and Git metadata. Infrastructure, database/Redis service configuration and production were not changed. No temporary SSH registration or resetting test suite was used against staging.

Initial HTTPS checks passed: health/login 200; signed-out Account/Billing redirects; invoice-history, card-update, renewal-recovery and deletion endpoints reject unauthenticated requests. Signed-in HTTPS verification completed in a new fictional workspace (`18c5e28a-5d3e-41eb-9afa-ccd725d02f23`): embedded Standard sandbox purchase activated 5M AI tokens, invoice history returned its paid invoice, a mobile embedded Mastercard update changed the renewal card while preserving invoice count and renewal date, and creation of one fictional lead incremented the durable usage meter. Cross-workspace and forged-Origin requests were denied; the renewal-only recovery route correctly rejected an initial-purchase invoice. Account deletion returned the browser to login, revoked access immediately, and the worker canceled the exact fixture subscription, verified directly against sandbox Stripe state. No direct staging database purge audit was performed; purge/accounting integrity was covered locally. Two preceding unpaid fixtures were also queued for deletion. Checkout test setup was corrected to opt out of optional Link enrollment, which otherwise required a phone; no deployed application fix was needed. Test passwords/session data remained in memory and contexts were signed out/closed.

## Assignment notification release configuration

The October 15 assignment/notification section was approved and released with the October 17 Leads batch below. Its additive migration ran before the new worker started. Configure **worker**, as well as web, with `BETTER_AUTH_URL` pointing at the staging app origin and the existing `EMAIL_PROVIDER=resend`, `EMAIL_FROM`, and `RESEND_API_KEY` transport variables. Keep credentials in Railway variables. The worker uses the same sender/template/transport as web, and needs no public port or new queue service. Its durable PostgreSQL outbox runs independently of the help-ingestion BullMQ queue. `worker:status` includes delivery state counts; logs contain no recipients, customer payloads or provider bodies. Do not copy local mail configuration or development data into staging.


## Leads and shared assistant release — October 17, 2026

User approved the staging release of the Leads page and all locally approved assistant work. Deployed a fixed, sanitized source snapshot through Railway CLI to the existing salesmora/staging environment. Web deployment `89571d90-9361-46cb-b680-68ce61f1c993` and worker deployment `18542444-da48-402a-8657-ffa2eabd416d` both reached SUCCESS. The web pre-deploy runner reported `Migrations complete (deployment)` before the worker upload; this applies the reviewed Leads, notification, action, search/details/history migrations through `202610170004_chat_lead_history`. Local migration/backup restore rehearsals had passed. No new staging backup/restore audit was performed; the existing managed-backup/production-readiness follow-ups remain open.

Release scope includes Leads list/pipeline/detail and single-record lifecycle actions, notifications/preferences and assignment email delivery, the shared assistant capability catalogue, review/confirmation cards, page context, bounded search, lead details, and activity/team-note reads. Bulk actions, import, estimates/jobs, automations and sending customer messages remain deferred. Billing stays sandbox-only.

Added worker `BETTER_AUTH_URL`, `EMAIL_PROVIDER`, `EMAIL_FROM` and `RESEND_API_KEY` as Railway references to existing staging web variables, with automatic redeploy skipped until the reviewed source upload. In-memory checks confirmed resolved origin/sender/provider/key parity, shared staging database, retention task mode and absence of local fixture/proxy/test override variables. No secret values were printed, copied into source or written to local env files. Worker deployment reported `worker.ready`, tasks retention, queue salesmora-staging-help. Assignment delivery runs independently of knowledge ingestion, alongside existing retention/billing/account-deletion processing. No new SSH key, DB/Redis service change, public database proxy, production deployment or Git push.

Snapshot digest: `f09e99fa1def7db735797c4f64fd3cd2c87c9adf67b9df3be0845f913d92a19e` (693 files before its manifest). Packaging excluded credentials, local data/backups/builds, Git metadata and unrelated prototypes; the working tree and Git index were preserved. Local gates had passed: 471 unit tests, types/lint, app/shared/worker and Storybook builds, 39 manual database checks, 52 distinct successful browser/API journeys and 116 shared activity-card/panel desktop/mobile interaction/accessibility/layout checks.

Public HTTPS smoke checks passed against the deployed app: no-store health 200 and login render; signed-out Leads/notification/preferences/thread denial; fictional Owner registration/workspace creation; persisted lead creation, self-assignment and team note; pipeline and full record/history queries; notification menu/preferences data; authenticated browser list/detail rendering and shared assistant launcher. Three real-model requests completed through SSE with Thinking before text: exact contact/Internal notes retrieval, team-note history retrieval/restoration with safe app-owned navigation, and a stage-change proposal. The proposal left the record unchanged until explicit confirmation; confirmation saved Contacted. Old history navigation then returned 403. Forged Origin and foreign workspace requests were denied.

The initial smoke fixture expected two history rows; manual creation plus self-assignment plus the note correctly produces three. Correcting that expectation required no deployed code change. Both isolated fictional workspaces were queued for account deletion and their sessions revoked; browser/API contexts were closed and credentials/session state stayed in memory. No existing account or customer record was edited. No direct purge audit, multi-role staging membership fixture or assignment-email inbox-delivery test was performed in this release; role/data/confirmation/delivery boundaries remain covered by the local suites and prior staging checks. Final web liveness remained 200, both application deployments SUCCESS, PostgreSQL/Redis deployment IDs unchanged, production still empty.

## Customers and shared assistant release — October 19, 2026

The user approved and requested this staging batch: Customers list/profile and manual actions, permission-scoped shared customer assistant tools/cards, related lead contacts, and removal of embedded chat from the Add/Edit customer popup. The shared global assistant remains available.

- Target: existing `salesmora` / `staging`; [application login](https://web-staging-cc17.up.railway.app/login).
- Fixed sanitized upload: 799 source files before its manifest; digest `5b3f20732fb9480525bf7b258e185fecc07a76d329cac2ab519151d8c435e9ca`. Credentials, environment files, local accounts/backups, build artifacts, Git metadata and unrelated prototypes were excluded. The uploaded Next route declaration is regenerated during the image build. No Git commit/push or index reset was performed.
- Web deployment `295987ea-bf7d-46aa-b680-7308183dc394`: SUCCESS. Pre-deploy reported `Migrations complete (deployment)` and HTTPS health passed. New additive migrations: `202610180001_customers` and `202610180002_customer_chat`; customer records/counters/activity/operation receipts/export audit, workspace-safe lead relationships, private retained chat drafts/results/evidence. No existing lead-to-customer backfill or test seed was run on staging.
- Worker deployment `0b914ac4-20fb-4bc2-94d9-cc910e2110e6`: SUCCESS after web migrations. Ready log confirms retention tasks and queue `salesmora-staging-help`.
- Local validation: 480 unit tests/39 files, workspace typecheck/lint, 37 customer/lead/context/stage browser and API/security checks, production workspace builds, Storybook production build and nine popup/page interaction/accessibility/layout checks across three widths. Next's initial restricted build hit a sandbox port-binding error; the normal-access rerun passed without application changes.
- Rollback-only local scale smoke: 5,000 customers, 5,000 leads, 5,000 customer activity records; list 42 ms, five evidence stamps 87/22/22/21/20 ms. No fixture rows were committed. This does not establish concurrency or production capacity; broader load testing and optimization of the conservative evidence fingerprint remain follow-ups.
- Remote fictional-workspace smoke passed: health/login, signed-out denial, create and replay, duplicate review, team note, lead link, real list/profile/browser launcher, archive/restore, CSV, foreign workspace/forged Origin denial and stale versioned-action denial. Three actual staging-model turns passed: customer details, phone+location review and explicit/idempotent confirmation, and customer search from Home. Private SSE headers and Thinking before answer deltas were verified. The full role/revocation matrix was exercised locally, not repeated against live model accounts.
- The first remote harness mistakenly expected an append-only note to reject an old record version. Notes intentionally append independently; the corrected stale archive assertion passed. The API/browser harness was rerun without repeating already-passed paid model calls. Both isolated fictional workspaces were queued through account deletion, with sessions revoked; existing users/data were untouched.
- No runtime variables changed or new provider keys were required. PostgreSQL and Redis deployment IDs are unchanged, and production remains empty. Existing managed-backup/restore, external alerting and wider production-readiness follow-ups remain open; no new staging backup or draining rehearsal was performed.
