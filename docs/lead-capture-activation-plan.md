# Website publication activation — implementation review

Prepared November 1, 2026 after the user approved the activation review. The user subsequently approved local implementation. See the [implementation and validation checkpoint](lead-capture-activation-qa.md); hosted activation remains a separate step. The design below records the approved scope.

## Goal and initial scope

Supply the verified website delivery authority to the authenticated publication/review/resume paths and to scheduled launches, and expose actual installation instructions in production-mode staging. Start with an explicit workspace allowlist. Reuse the approved screens, dialogs, contracts and permission checks. Gmail delivery stays unavailable. Production and unrestricted workspace activation are later decisions.

The existing live evidence establishes real ingress/TLS, Turnstile, two client networks, durable submission/retry behavior, stable revisions, lifecycle/access protection, restricted database roles, and active cookie-blocked hosted/direct/loader delivery. All three synthetic sources are archived, all 12 receipts retained, and transport disabled after testing. See the [active browser checkpoint](lead-capture-active-embed-20261101.md).

## Findings from the deployed source

The ten relevant integration files were compared byte-for-byte with the frozen deployed lifecycle source (`44715c227cf13b86ee6bc1b756a1cd515694f4d974c9232da172d864baa9059b`).

1. Publication GET/POST and lifecycle POST omit the delivery dependency, so they use `unavailableCaptureDelivery`. Setting `CAPTURE_SUBMISSIONS_ENABLED=true` does not enable self-service publication or resume.
2. `readCaptureSource` independently creates both publication and lifecycle reviews with that default dependency. Wiring only the mutation routes would leave the UI review blocked even if writes could succeed.
3. `captureInstallationOrigin` only returns an origin for non-production loopback environments. Railway staging runs production-mode code, so verified staging URLs/snippets are still suppressed.
4. The capture scheduler starts inside `WORKER_TASKS !== retention`; staging uses retention. Changing a delivery flag alone cannot start it. Switching the entire worker to `all` would also start the knowledge queue and is unnecessary for this feature.
5. The scheduler currently scans every published workspace. An authority returning false outside a pilot allowlist is insufficient isolation: due transitions outside that scope could be marked blocked. Pilot scope must constrain candidate selection before processing/reconciliation.

The worker's other notification loops start outside the task-mode condition. `retention` must not be described as an email kill switch. The completed canaries prevented emails through their reviewed `notifyAssigned: false` workflows and verified empty notification/outbox evidence.

## Server authority and controls

| Control | Web | Worker | Default |
| --- | --- | --- | --- |
| `CAPTURE_WEBSITE_PUBLICATION_ENABLED` | Enables website readiness only after full submission-policy validation | Not a worker readiness substitute | Off |
| `CAPTURE_PUBLICATION_WORKSPACE_IDS` | Exact UUID allowlist | Same pilot allowlist constrains scheduler candidates | No eligible workspace |
| `CAPTURE_SCHEDULER_ENABLED` | Not needed | Separately starts capture processing while retaining `WORKER_TASKS=retention` | Off |
| `CAPTURE_READINESS_SECRET` | Dedicated independent 32-byte canonical base64 token | Same server-only token | No private readiness access |
| `CAPTURE_READINESS_URL` | Not required | Exact private web readiness URL | Scheduler cannot enable delivery |

No wildcard or implicit all-workspaces mode is included in the first patch. Missing, malformed or empty activation scope cannot broaden access. No request, form field, role name or client readiness flag can supply authority. Existing permission, workspace/account status, assignment, capacity, configuration and exact-version/idempotency checks remain authoritative.

Web website readiness requires all of: publication enabled, workspace allowlisted, canonical public/app origins valid, submissions enabled, full existing secret/provider/verified-ingress/budget policy valid, and relevant database schema available through the existing transaction checks. Gmail always returns false. Publication, resume and both review projections receive this same authority instance.

Installation projection uses the verified canonical forms origin only when the workspace is eligible under the same authority/configuration. The data layer still requires a persisted publication key and approved version; no draft key or example URL is invented. Existing local loopback fixtures retain their explicitly configured behavior.

## Scheduled delivery readiness

Do not copy Turnstile, context, abuse or gateway credentials into the worker or trust a duplicated worker Boolean as proof of web readiness. Add a narrow server-to-server endpoint:

`POST /api/internal/lead-capture/readiness`

- Authenticate a dedicated server token with constant-time comparison before inspecting a bounded JSON body. No app session is used or issued.
- Accept only `{ workspaceId, requestId }`, both UUIDs. Return only `{ workspaceId, requestId, origin, websiteReady }`; private/no-store, no redirect or cookie, and no provider/configuration details.
- Derive readiness using the web's actual activation scope and complete submission policy. **Do not acquire a workspace lock or perform application database reads in this endpoint**: the scheduler may already hold that lock while requesting the readiness result. Database/schema prerequisites remain checked in the scheduler transaction.
- The gateway's public forms allowlist must continue rejecting this route. The private URL is deployment configuration, never supplied by a browser, publication payload, forwarded host or stored customer configuration.
- The worker validates an approved internal URL, refuses redirects, bounds connection/response time and response size, checks exact response shape, request/workspace binding and canonical origin. No stale positive cache or provider-test fallback is allowed. Raw tokens, URLs with credentials, source paths and customer payloads are excluded from logs.
- A timeout, malformed response, origin mismatch or negative response means unavailable delivery. Preserve the existing due-transition semantics: a failed readiness check records a blocked transition and requires explicit review/rescheduling; restored availability does not silently relaunch it. Document this operational consequence before activation.

The scheduler filters its workspace candidates using the validated server allowlist before reconciliation or transition processing. It preserves existing workspace/source lock order, authorization rechecks, immutable target configuration, concurrency/idempotency and failure retention. Capture start/stop and startup status become independently observable; existing worker task mode and unrelated loops stay as configured.

## Concrete implementation surface

- Add a web delivery-policy/authority module and private readiness handler with focused boundary tests.
- Extend `readCaptureSource` with a backward-compatible optional delivery dependency, preserving the unavailable default for existing callers; pass it to both review builders.
- Wire publication GET/POST, lifecycle POST, scoped source GET and server-rendered source pages to that dependency. Cancellation and source-list permission behavior stay unchanged.
- Extend installation-origin selection with the checked workspace scope and production-mode readiness.
- Add the worker private readiness client and a validated scoped scheduler-start configuration. Place the explicitly enabled capture scheduler outside the knowledge-task condition; include it in existing graceful shutdown.
- Add optional explicit workspace filtering to the scheduler data service without changing default behavior for existing isolated rehearsals. Test that excluded workspaces are not reconciled, launched or marked blocked.
- Add safe scheduler status reporting and document the five new controls. No new component, provider integration, database table or migration is proposed.

## Verification before deployment review

1. Unit/HTTP tests: defaults and malformed scopes fail closed; production policy requires real ingress/budgets; web read/write/review/install paths agree; Gmail stays denied; private endpoint rejects missing/incorrect auth, wrong/oversized bodies, wrong methods and public forms routing without leaking secrets or sessions.
2. Worker tests: retention mode can start only the explicitly enabled capture scheduler; knowledge task configuration is preserved; wrong URL/origin/binding, redirects, timeout, oversized/malformed responses and invalid tokens deny readiness; shutdown waits for the active tick.
3. Disposable runtime-role database groups: immediate launch and approved-only resume, scheduled first launch/revision, expiry/readiness loss, cross-workspace filtering, permissions/capacity, concurrent processing and exact retries. Existing default-unavailable regressions remain passing.
4. Real local authenticated browser journeys: eligible publication and real installation projection, ineligible workspace denial, resume review/write consistency, scheduled activation and fail-closed readiness loss. Use fresh scratch databases and local provider fixtures; do not run these harnesses against Railway.
5. Relevant workspace types, lint and unit suites. Reuse approved responsive component evidence; add browser checks for any changed readiness/installation state. Freeze and hash the reviewed overlay with unchanged lockfiles/migrations before staging upload.

## Staging sequence after implementation review

First deploy the reviewed patch with both activation switches off, submissions off and existing task mode retained. Verify access boundaries, deployment health and the unchanged 112-file ledger before setting any pilot flag. Provision only the new dedicated readiness token in private web/worker settings; it does not belong on the gateway or in build arguments.

Next, configure matching private origin/allowlists for the existing fictional workspace, validate the private readiness exchange while it is negative, then enable transport and website publication for that scope. Confirm fresh authoritative reads before an explicitly reviewed publication. Enable the capture scheduler separately and test one near-future fictional launch plus a planned readiness-loss case. Use no-email fictional workflows; retain receipts, source history and blocked-transition evidence. Archive test sources through the normal lifecycle and return pilot switches/transport to off unless continued operation is explicitly approved.

This sequence does not change `WORKER_TASKS` to `all`, enable Gmail, republish archived sources, start unrestricted publication or send a real recipient message. Real-user login/workspace/assistant readiness remains a distinct check; a synthetic cookie marker does not satisfy it.

## Disable and recovery

Disable the capture scheduler first to stop new due-transition processing, then publication authority. Existing active intake is controlled separately by the submission transport switch. Confirm each running deployment's effective settings and readiness result; configuration updates alone are not proof that old instances stopped.

Preserve stable keys, approved versions, receipts, transitions and migration history. A temporary transport-off endpoint returns retry rather than an acceptance acknowledgment. Retain strict runtime roles and the migration owner separation. Do not restore an older database over accepted submissions or automatically resume blocked sources.
