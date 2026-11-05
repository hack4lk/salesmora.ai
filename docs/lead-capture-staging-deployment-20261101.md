# Lead Capture staging deployment — November 1, 2026

Status: **web, matching worker and forms gateway deployed successfully** to the existing `salesmora / staging` environment. The user will attach the custom domain. No production deployment or DNS change was performed.

## Exact release and deployments

| Service | Deployment ID | Result |
| --- | --- | --- |
| web | `bce51285-77d9-4bf2-b0de-375b23145744` | SUCCESS; pre-deploy migrations complete; public HTTPS smoke passed |
| worker | `e74c8eaf-cf0f-43be-8a1f-319af8d72e5b` | SUCCESS; ready event and queue diagnostic passed |
| forms-gateway | `bf34e1e4-bf24-49e4-9d87-b7f9c1226fc3` | SUCCESS; health and private upstream probe passed |

All three uploads used `/private/tmp/salesmora-capture-release-20261101-deploy/`. The 2,562-file source manifest digest is `736bbb6b10d7716f41cf58d016d5b9458508d0970986b00f39803bb00e4eb402`. Its retained archive is `.local/releases/capture-release-20261101-deploy/source.tar.gz`, SHA-256 `548ecc9ab79482582870b76eb94ebd3b127b4876c3319b0a244b8bd70061b4e0`. See the adjacent manifest and checksum file.

The deployment candidate differs from the previously frozen source only in two package scripts: the audit worker's accidental `prepare` lifecycle hook was renamed `prepare:archive`, and the root `audit-worker:prepare` command now calls it explicitly. The old name caused dependency installation to run the isolated audit tool without configuration. Normal installation now succeeds without starting audit preparation. Runtime source and the 112 migrations are otherwise unchanged from the prepared freeze.

## Validation and live migration evidence

- Frozen-source unit suite: **3,412 tests / 206 files passed**; workspace typechecks passed.
- All **112 migrations** replayed on a new disposable local database. Email-change signature, atomic completion, expiry/replay, role-boundary, session-revocation and web/email bridge rehearsals passed; local scratch databases were removed.
- Locked dependency installation passed after the lifecycle fix. Railway web production build/typecheck and worker build passed.
- The pre-release live ledger still had **92 migrations**. Web pre-deploy applied the **20 pending forward migrations**, including the user-approved admin email-change migration. A fresh PostgreSQL ledger read then matched **all 112 frozen filenames exactly** before worker upload. No reset, seed or rollback was used.
- The verified private off-volume backup and full scratch restore remain available as recorded in [preparation evidence](lead-capture-staging-preparation-20261101.md).

## Hosted verification

- Existing application origin `https://web-staging-cc17.up.railway.app`: `/api/health` returned `200 {"status":"ok"}`, `/login` returned 200, and anonymous `/api/permissions` returned 401.
- Gateway private probe: liveness passed; explicit canonical Host requests reached `web.railway.internal:3000`; `/embed.js` returned JavaScript with no-store and no session cookie; `/api/auth/get-session` was denied with 404. This probe ran from trusted private infrastructure, not through a public HTTPS edge.
- Worker emitted `worker.ready`. Its status diagnostic reported `ready: true`, retention scheduled, one retention worker and zero failed jobs. One delayed recurring retention job is expected. Existing worker task settings were preserved.
- Final maintained infrastructure plan reported **zero changes**. PostgreSQL and Redis deployment IDs were unchanged; production still had zero service instances. Existing bucket and application domain were retained.

## Configuration and remaining activation boundary

Added missing web forms configuration using the gateway's existing valid ingress key. Independent context/abuse keys were generated privately, and conservative safety limits were configured. Existing unrelated service settings were preserved. Submissions remain explicitly **disabled**. Turnstile keys were absent from web and were not fabricated.

The existing staging database connection configuration was retained; web/worker still use their pre-existing owner-level connection. The separately documented least-privilege runtime-role cutover is not claimed as completed. The separate admin application and audit worker were not newly hosted or activated by this three-service rollout.

Next, attach **forms-staging.salesmora.ai** to **forms-gateway**, target port **8080**, and add Railway-issued DNS records. After DNS/TLS verification, configure the real staging Turnstile widget keys on web and run the public-edge/canary checks in the [rollout runbook](lead-capture-integration-step-4f-rollout.md). This deployment does not establish public forms TLS, trusted public-edge client-IP behavior, real Turnstile validation or live durable submission acceptance. Self-service publication authority remains disabled in source pending those checks and activation review.

## Access cleanup

The temporary Railway SSH key was revoked, and Railway confirmed no registered keys afterward. The isolated SSH agent was stopped and temporary private/public key files were removed. Existing SSH configuration was not changed.

## Custom-domain verification — November 1, 2026

After the user added the custom-domain DNS records, public CNAME resolution returned `x63jmg10.up.railway.app`. Normal certificate-chain and hostname verification passed for `forms-staging.salesmora.ai`; the observed certificate expires January 30, 2027. Public HTTPS `/healthz` returned `200 {"status":"ok"}`.

All four GET-only public smoke groups passed through the real custom domain: gateway liveness, denial of private/auth routes despite forwarded-host forgery, canonical embed-loader headers, and hosted/embedded unavailable-page CSP/framing/cache/session isolation. No canary key was supplied; these checks made no submissions or provider-verification claim.

A read-only settings check now confirms both Turnstile keys are present on web. Their values were not printed, and no real challenge has been verified. `CAPTURE_SUBMISSIONS_ENABLED` remains false. Real Turnstile/canary submission verification, public client-IP bucket checks and publication activation remain outstanding.

## Controlled canary follow-up

The user approved a live fictional canary. Real challenge, receipt/retry/conflict, 5/20 limiter and first-network edge checks have passed; the user’s cellular test is pending. Submission transport is temporarily enabled only while the sole active canary is available; self-service publication remains disabled. See the [canary record](lead-capture-staging-canary-20261101.md) for exact evidence, pending checks and cleanup state.

### Canary closed

The cellular request was verified in a second client bucket. Seven accepted test receipts are retained and zero notifications were queued. The synthetic source was archived with authorization/version checks and operation/event history. Web deployment `2732e3ee-8c79-49e8-96ad-99eed295749e` is SUCCESS with temporary submissions disabled again; live policy and application health checks passed. General publication activation remains disabled. See the [completed canary record](lead-capture-staging-canary-20261101.md).

### Revision/lifecycle verification completed

A second fictional source verified stable-URL revisions, private draft visibility, stale context/consent rejection, browser answer retention and fresh consent, pause/resume gates, persistent blocking after owner access loss, and archive retention. Nine total test receipts remain and zero assignment notifications were queued. Submissions are disabled again in successful web deployment `db311173-ac8b-42d3-ab12-32aa76ce0ebf`; the app remains healthy. Customer-facing lifecycle handlers remain a separate implementation gap. See the [revision/lifecycle record](lead-capture-revision-lifecycle-20261101.md).
