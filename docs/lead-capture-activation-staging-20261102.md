# Website activation staging deployment — November 2, 2026

The reviewed activation candidate is deployed successfully to staging web and worker. Publication, submission transport and capture scheduling remain disabled. This completes the defaults-off deployment checkpoint; the scoped pilot has not started.

## Release

- Source: `/private/tmp/salesmora-capture-activation-release-20261101`.
- Source digest: `2e914a3cf7c8bc4cf73b6078f031a388b01e02fa0263164fb8f2ccfe6368b2aa`.
- Archive SHA-256: `243c5bdfada015c771a52cc5303524861dcb2f94c7e93ed6c8031d4e2865080a`.
- Web deployment: `fec42939-e47b-4d94-9477-9a743bf2245e` — SUCCESS.
- Worker deployment: `8fbdd7c8-595b-4a4c-8c06-0a712bae3baf` — SUCCESS.

Preflight confirmed that live web/worker still matched the handoff's recorded parent releases. All 2,589 frozen files and the archive hash matched before upload. In both running images, 156 selected source files matched the manifest: the 43-path activation delta, all 112 migrations and the lockfile. The moving workspace was not uploaded. No gateway deployment or infrastructure apply was performed.

## Effective controls and verification

Web has `CAPTURE_SUBMISSIONS_ENABLED=false` and `CAPTURE_WEBSITE_PUBLICATION_ENABLED=false`. Worker has `CAPTURE_SCHEDULER_ENABLED=false` and retains `WORKER_TASKS=retention`. Both have an empty publication workspace scope, no readiness token provisioned, and `DATABASE_ROLE_ENFORCED=true`.

Actual connections use `salesmora_web` and `salesmora_worker`; neither is a superuser, database owner or able to create in public. Web retains a separate migration owner. Worker grant checks confirm application reads/receipt insert authority while denying ledger reads, receipt truncation, admin-schema usage and email-column updates.

The web migration/startup logs report migrations complete and ready. The exact 112-name live ledger matches the frozen migration directory. Before/after snapshots are identical across source rows, immutable versions, publications, operations, transitions, receipts, receipt processing, intake items and linked lead-capture data. All three canary sources remain archived, all 12 receipts are retained, and there are zero active/scheduled sources and zero canary assignment notifications/outbox rows.

Public HTTP checks passed:

- Health 200 with `{ "status": "ok" }`; login 200.
- Anonymous source/publication reads and lifecycle writes 401; foreign-origin publication write 403.
- New readiness handler denies missing/invalid tokens with 401; forms gateway rejects that private route with 404.
- Archived public projection returns 200/unavailable, without an active definition/context.
- Submission POST remains 503 with `{ "state": "retry" }`.
- Checked responses issue no session cookies.

Worker diagnostic reports ready, retention scheduled, one retention worker, zero failed jobs, capture scheduling unconfigured with zero workspace scope, and empty assignment/visit/deadline/job delivery summaries. Startup reports retention mode and capture scheduling off. This does not establish real-user interactive login or enabled delivery readiness.

Non-secret evidence is retained in `.local/releases/capture-activation-deploy-20261102/`, including `checkpoint.json`, before/after snapshots, HTTP results, running-image checks, worker role grants and worker status.

## Access cleanup and next checkpoint

A task-specific temporary SSH key was registered using an isolated agent for read-only verification. It was revoked, the account key list confirmed no registered keys, the agent was stopped and its private/public key files were erased. No new readiness token was generated.

No fresh database backup was taken because this deployment adds no migrations or schema changes. The previous backup still predates the latest three receipts; retain that limitation from the handoff and take a fresh verified backup before a future schema/recovery checkpoint.

Next is the separately reviewed scoped pilot in [handoff section 9C](lead-capture-handoff-20261101.md#c-separate-scoped-pilot-after-deployment-review): provision an independent private web/worker token, configure the fictional workspace scope and private origin/URL, verify negative readiness while gates are off, then perform the bounded no-email publication/resume/scheduler checks. Archive canaries and return controls off afterward unless continued operation is approved. Gmail, unrestricted publication, production and real-user interactive readiness remain separate.
