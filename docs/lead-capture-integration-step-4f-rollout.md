# Lead Capture 4f — staging rollout proposal

> Latest staging update: connected lifecycle handlers/dialogs are deployed. Web and worker use restricted database roles with strict startup enforcement. Live unavailable and active forms passed cookie restriction, resize-forgery, responsive and keyboard checks. Three bounded fictional hosted/direct-iframe/loader submissions passed; the canary was archived and transport disabled again. General publication remains disabled. See the [active browser record](lead-capture-active-embed-20261101.md), [runtime-role/embed record](lead-capture-runtime-cutover-20261101.md) and [lifecycle deployment](lead-capture-lifecycle-staging-20261101.md). The proposal and earlier updates below are historical.

> Earlier revision/lifecycle update: stable-URL revisions, stale-context/consent refresh, pause/resume gates, owner access-loss protection and archive retention were verified on a second fictional staging source using authorized/audited operator actions, before the customer lifecycle API was implemented. See the [revision/lifecycle evidence](lead-capture-revision-lifecycle-20261101.md).

> Deployment update: web, matching worker and forms gateway are now SUCCESS in staging, with the live ledger verified at 112 migrations. The user is handling the custom domain. Submissions and publication activation remain disabled. See the [November 1 deployment record](lead-capture-staging-deployment-20261101.md) for exact deployed hashes, IDs, verification and remaining configuration.

> November 1 preparation update: the user applied the gateway infrastructure configuration. Live ledger inspection, a private off-volume backup with full scratch restoration, and the application source freeze are now complete. The user also approved the additional admin email-change work, so the current candidate has **20 pending migrations / 112 total**, superseding the original 19-file comparison below. See the [preparation record](lead-capture-staging-preparation-20261101.md) for exact paths, hashes, verification and cleanup. Application deployment and publication activation remain separate steps.

Prepared November 1, 2026 after approval of 4e. The user selected **forms-staging.salesmora.ai first**, reserving **forms.salesmora.ai for production**. This document proposes the external rollout; it does not record a deployment. Publication authority and production installation projection remain disabled in source. Live verification and activation remain unfinished until the approved rollout is performed.

## Observed target and exact infrastructure change

Read-only Railway inspection confirmed project `salesmora` (`e0865ab2-d136-4e6c-a1bd-e96af3e52e74`), staging environment `41e4f7c2-f517-49ed-9c8e-6b654b926982`, application `https://web-staging-cc17.up.railway.app`. Web deployment remains `589ba322-c154-4466-9c37-2d0af6b884b0`; worker remains `05fba878-ff4b-4164-b4f3-498a386c7865`. Production has no service instances. No variables were exported.

The reviewed candidate is [.railway/forms-staging.ts](../.railway/forms-staging.ts). It is guarded to staging and imports the complete existing resource definition. Its live preview has exactly one change: **create `forms-gateway`**, with no deletions or modifications. The default definition previews zero changes. A discovered omission of the live `salesmora-staging-files` bucket was corrected by declaring its existing `iad` region; no bucket was changed. Keep that declaration after rollout.

| Service | Source and runtime | Network/configuration |
| --- | --- | --- |
| Existing `web` | Current reviewed application release; repository root; `infra/railway/web.Dockerfile` | Keep existing app domain, auth origin and web runtime DB role. Set explicit `PORT=3000`; listen on `::` for public/private dual-stack access. |
| New `forms-gateway` | Repository root; `infra/railway/forms-gateway.Dockerfile`; pinned Node 22; user `node`; no dependencies, DB or provider keys | One `us-west2` replica, `PORT=8080`, `/healthz`, 60s deployment health timeout, 40s draining, three restart retries. No volume, TCP proxy, sleeping or application credentials. |
| Existing `worker` | Same reviewed source as web, after migrations | Retain existing private network/queue/task configuration. The existing capture scheduler and abuse-expiry loop run approximately every 30 seconds; delivery authority remains disabled until activation is reviewed. |
| PostgreSQL, Redis and files bucket | Preserve all existing services, volumes, data and bucket region | No infrastructure replacement, upgrade or reset in this rollout. |

Gateway upstream: `http://${{web.RAILWAY_PRIVATE_DOMAIN}}:${{web.PORT}}`. The exact runtime reference belongs in Railway, not a literal copied private credential. Railway documents internal HTTP and environment-scoped private DNS; older environments can resolve private names over IPv6 only, which is why the web listener is prepared for dual stack. See [private-domain networking](https://docs.railway.com/networking/domains/working-with-domains).

## DNS, TLS and Turnstile

Public DNS inspection found Squarespace authoritative nameservers for `salesmora.ai` and no CNAME answer for either forms hostname. The staging hostname also had no A, AAAA or TXT answer. The proposed change is limited to `forms-staging.salesmora.ai`; production DNS and the application's existing domain remain untouched.

After gateway creation, attach custom hostname `forms-staging.salesmora.ai` to gateway port **8080**. Railway will issue the literal **CNAME target and ownership TXT name/value**. Record both returned values and add them unchanged in Squarespace. Do not invent a Railway target or use the web service's generated hostname as a substitute. Use a five-minute TTL if available. Both records must verify before relying on routing. Railway provisions the certificate; check its hostname, validity and complete chain through the actual domain with normal TLS verification. No nameserver move or Cloudflare traffic proxy is proposed. [Railway domain instructions](https://docs.railway.com/networking/domains/working-with-domains).

Create a staging Turnstile widget restricted to **forms-staging.salesmora.ai**, with separate staging site/secret keys. Keep production `forms.salesmora.ai` credentials separate. Use the normal managed/explicit widget without pre-clearance; no customer-site field access or third-party app session is needed. Siteverify must validate the exact hostname, `capture_submit` action, context binding and five-minute token lifetime. Complete a real challenge through the deployed form; test credentials or the local adapter do not satisfy this check. [Cloudflare server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Variables and initial operating caps

The ready-to-review fragments are [gateway](../infra/forms-gateway/staging.env.example) and [web](../infra/forms-gateway/web-staging.env.example). Enter them as additive Railway variables; do not source reference expressions in a shell. Preserve all current unrelated variables. Generate independent random secrets directly into sealed Railway settings and a recovery store; never paste values into source, chat, logs or Docker build arguments.

| Variable | Web | Gateway | Worker |
| --- | --- | --- | --- |
| `CAPTURE_PUBLIC_ORIGIN` | `https://forms-staging.salesmora.ai` | Same | Not required while publication remains disabled |
| `CAPTURE_CONTEXT_SECRET` | New 32-byte canonical base64 key | Absent | Absent |
| `CAPTURE_ABUSE_SECRET` | Different 32-byte canonical base64 key | Absent | Absent |
| `CAPTURE_INGRESS_SECRET` | Third independent 32-byte canonical base64 key | Exact same ingress key | Absent |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Real staging widget credentials | Absent | Absent |
| `CAPTURE_CLIENT_IP_MODE`, `CAPTURE_TRUSTED_IP_HEADER` | `verified-header`, `x-real-ip` | Absent | Absent |
| `CAPTURE_UPSTREAM_URL` | Absent | Private web reference above | Absent |
| `CAPTURE_GATEWAY_EDGE` | Absent | `railway` | Absent |
| `CAPTURE_GATEWAY_MAX_INFLIGHT` | Absent | `32` | Absent |
| `CAPTURE_SUBMISSIONS_ENABLED` | `false` until the approved canary phase | Absent | Absent |
| `CAPTURE_REQUESTS_PER_MINUTE` | `300` deployment-wide dynamic requests | Absent | Absent |
| `CAPTURE_SOURCE_REQUESTS_PER_MINUTE` | `100` per published source | Absent | Absent |
| `CAPTURE_MAX_PENDING_ITEMS` | `1000` per workspace | Absent | Absent |
| `CAPTURE_MAX_RETAINED_BYTES` | `16777216` (16 MiB) per workspace | Absent | Absent |
| `CAPTURE_CHALLENGE_AFTER`, `CAPTURE_ATTEMPT_LIMIT` | `5`, `20`, per form/IP/rolling ten minutes | Absent | Absent |

These are conservative first-staging caps, not a traffic capacity guarantee. The retained-input counter covers receipt evidence/original answers, not total PostgreSQL/index/WAL/backup size. Watch overall database disk and pending/input growth; do not extrapolate per-workspace caps into a global disk allowance. Keep the existing volume alerts and inspect trends before widening access or replicas. Failed storage/pending checks never acknowledge receipt acceptance.

Never deploy `SALESMORA_TEST_SERVER`, `CAPTURE_TURNSTILE_TEST_ORIGIN`, `TEST_DATABASE_URL`, loopback IP mode or local fault adapters to Railway. The gateway gets no auth, database, email, object-storage or Turnstile secret.

## Trusted ingress boundary

Only attach the forms domain to the gateway. Its fixed upstream must be the private web service. It accepts canonical-host public form/embed/API/static routes only. It rejects private routes, traversal, unsupported methods, bodies over 256 KiB, malformed client addresses and requests missing Railway edge/protocol metadata. At most 32 requests are active; excess traffic receives a retry response. Request/upload, upstream and total handling are bounded; shutdown drains before force-closing.

Railway documents `X-Real-IP` as the remote client address. Gateway uses exactly one valid address from that header, never an arbitrary forwarded chain or visitor `CF-Connecting-IP`. A fresh upstream header allowlist discards Cookie, Authorization, forwarded claims and supplied ingress keys, then inserts the configured ingress key and validated address. Web independently checks the key before accepting limiter identity. Responses retain public cache/CSP/frame policies and suppress session cookies, redirects and unapproved headers. Request bodies, keys, IPs and publication paths are not logged by the gateway.

This trust model requires the Railway HTTPS edge as the public path and treats other services in the private project network as trusted infrastructure. Do not expose a TCP proxy or an alternate public origin that bypasses this boundary. Railway's edge header overwrite does not authenticate private-network callers. Live probes must establish that forged forwarding/IP headers through the actual public edge do not change the submission bucket, and that a second real client network gets a distinct bucket. Provider specifications are a design input, not observed live verification. See [Railway header specifications](https://docs.railway.com/networking/public-networking/specs-and-limits).

## Application/source and migration review

The gateway alone needs no migration. The currently deployed application predates Lead Capture, so a complete reviewed web/worker release is also required before forms can operate. Do not upload the moving working directory as an implicitly approved Lead Capture-only release.

The current source has **111 migration files**. Comparison with the exact last approved October 28 release manifest (`2de210356202f62b8e8af9dbfb2c1ea1ecfbbfe984e9ecda3bb3e548466b19d9`, 92 migrations) identifies these **19 additional files**, in order:

```text
202610280001_runtime_grants.ts
202610280002_suspension.ts
202610290001_plan_override.ts
202610290002_account_audit.ts
202610290003_team_admin_grants.ts
202610290004_ownership_transfer.ts
202610300001_admin_identity.ts
202610300002_admin_bootstrap_invitations.ts
202610300003_admin_enrollment.ts
202610300004_admin_audit.ts
202610300005_admin_staff_management.ts
202610300006_admin_staff_lifecycle.ts
202610300007_lead_capture_foundation.ts
202610300008_lead_capture_permissions.ts
202610300009_admin_audit_preparation.ts
202610310001_admin_audit_publication.ts
202610310002_capture_publication.ts
202610310003_lead_assignment_settings.ts
202610310004_capture_submissions.ts
```

This includes separate admin/account work that needs explicit release-scope review. One already-applied migration source differs: `202610120001_authorization.ts` now filters growing default grants to the constraints available at that historical replay step. Knex will not rerun an applied filename; the edit is relevant to fresh/legacy replay, not permission replacement on staging. The existing legacy-workspace rehearsal exercises that path. Preserve custom grants and existing data; review the ordered forward migrations rather than cherry-picking by suffix.

A fresh read of the live ledger was not available: Railway SSH reported no registered keys, and none were registered. The 19-file difference is a comparison to the verified historical source manifest, **not a new database observation**. An authorized operator must read the actual ledger before approving migration execution, check for divergent/missing filenames, and freeze/hash the exact reviewed upload. A source inventory is generated with:

```sh
node scripts/capture-rollout-inventory.mjs /private/tmp/capture-4f-inventory.json /private/tmp/salesmora-calendar-release-20261028/release-manifest.json
```

The inventory omits environment/credential/build directories, records paths/hashes and lists the migration delta. It is not a frozen upload or permission to deploy pending unrelated work. Rebuild it after source changes. Before any schema change, make a fresh private backup and restore it into a separate scratch database; verify the ledger and representative retained records, then remove the scratch restore. Existing same-volume backups do not establish off-volume recovery. Do not run local reset/seed/E2E harnesses against Railway.

## Prepared artifacts and local verification

A frozen **gateway-only** upload candidate is at `/private/tmp/salesmora-forms-gateway-candidate-20261101/`, with `release-manifest.json`. It contains only `.dockerignore`, the gateway Dockerfile and gateway source, with digest `dce3de1c7c285885757cdcf240eef482b7b6ceab2f01af21add382513e3d9b01`. It contains no application migrations or populated credentials and has not been uploaded. Use that reviewed package for gateway upload; a complete app/worker upload must be frozen separately after the broader scope/ledger review.

Verified locally:

- **Five native HTTP gateway tests passed**: strict configuration/raw routing, header/session stripping and response policy, body limits and redirects, upstream failures, overload/liveness and recovered slots.
- The exact pinned Node 22 **production-mode container built and passed** on a temporary private Docker network, with no published port. It reached its private upstream, replaced forged ingress claims, suppressed session response cookies, denied private paths, ran as `node` and exited cleanly on SIGTERM. Test containers, network and temporary fixture/config files were removed. A temporary anonymous Docker configuration avoided an unrelated credential-helper stall; global Docker settings were unchanged.
- **16 foundation database groups passed across all 111 migrations**, including legacy workspaces, audited/custom policy upgrades, idempotence, evidence, tenant boundaries and runtime/staff grants. **Ten assignment groups passed**, including existing-workspace unassigned defaults, authorization, concurrent saves and publication/scheduler denial while delivery is disabled. These ran on random disposable local databases, not configured or hosted databases.
- **3,412 unit tests across 206 files passed**, including the added staging-host fail-closed/routing assertions. Gateway's five native HTTP tests are separate from this unit count.
- Web typecheck, candidate IaC typecheck, focused ESLint and `git diff --check` passed. Lint reports only the existing React-version detection notice. The public smoke command passes syntax checks; it has not been run against an undeployed domain.
- Read-only live Railway plans: **zero baseline changes; one gateway creation in the candidate; zero destructive changes**. No apply, domain creation, variable change, service upload, SSH-key registration or hosted database mutation was performed.

These checks establish a prepared local candidate, not deployed TLS, Railway header behavior, real Turnstile verification, production load capacity or a functioning live publication. Those remain mandatory in the proposed sequence.

## Proposed external sequence — requires rollout review

1. Approve the exact application/source/migration scope and establish authorized ledger/backup access. Freeze web/worker/gateway source and record hashes. Resolve any schema or default-policy drift first.
2. Preview `.railway/forms-staging.ts` again against the live environment. Proceed only if its sole infrastructure change is gateway creation and all existing services, volumes and bucket are retained. Apply the reviewed candidate, then make it the maintained default so a later baseline apply cannot remove the gateway.
3. Stage the independent secrets, widget and additive variables with submissions disabled. Preserve the app auth origin and unrelated provider settings. Configure the private upstream and explicit ports. Deploy the approved web release with its owner-only migration pre-deploy command, then the same worker source after the ledger is verified. Runtime DB roles remain separate from the migration owner.
4. Deploy the thin gateway, attach the staging custom domain and apply only Railway-issued CNAME/TXT records. Verify health, HTTPS/TLS, canonical host/route isolation, private connectivity and public asset/CSP/cache behavior. Do not infer delivery readiness from `/healthz` or `/api/health`.
5. After schema, ingress and credentials are verified, enable submission handling for a bounded fictional canary. Self-service publication remains disabled. A separately reviewed, workspace-bound canary publication is needed to test the real path; no example-domain or local-provider response counts as live evidence.
6. Run GET-only checks with `CAPTURE_SMOKE_ORIGIN=https://forms-staging.salesmora.ai pnpm capture:smoke`. Add `CAPTURE_SMOKE_PUBLIC_KEY` only for the approved ready canary. The script checks liveness, private-route denial despite forwarded-host forgery, loader headers, production CSP/framing/cache and safe public projection. GETs can consume safety budgets. The script makes no submission/provider-verification claim.
7. Through real browsers and two client networks, complete the actual Turnstile challenge, test failed/expired proof, identical/lost-response retry, changed-payload conflict, 5/20 thresholds and forged ingress/IP headers. Verify a single receipt and lead-or-review item, immutable consent/provenance, current assignment, stage/tags and notification intent. Use notification-off canary rules unless real recipient delivery is separately authorized.
8. Verify hosted/direct-iFrame/loader delivery with third-party cookies blocked, multiple embeds, mobile/keyboard behavior, resize forgery rejection and a stable URL after revision. Check pause/archive/suspension/access loss, stale refresh/consent and continuing app authentication on its own origin. Remove or archive canary data through the normal lifecycle; do not delete retained evidence directly.
9. Record deployment IDs, exact ledger, public TLS/header checks, provider evidence, bucket-identity checks, write/retry counts and resource observations. Only then prepare/review the activation patch supplying matching website delivery authority to web publication/reviews and the worker scheduler, and allowing verified production-mode installation projection. The current hard-disabled authority is not bypassed by setting submission variables. No Gmail activation is included.

## Recovery

Before writes, revert gateway/app variables or detach the new forms domain if validation fails. After durable receipts exist, disable new submissions and self-service launch while retaining the same schema, keys, receipt evidence and retry/accounting records. Current expired-context exact replays remain safe only while submission handling is available; an emergency transport shutdown can temporarily return retry. Do not claim retry acknowledgment during a disabled endpoint.

For an application issue, deploy a compatible reviewed fix against the retained schema. Do not roll back forward-only capture/admin migrations or restore an old database over newer accepted submissions. A database restore requires an explicit recovery decision and reconciliation of receipts/admissions; keep that separate from ordinary release rollback. Existing app traffic, database, Redis and bucket must remain intact.
