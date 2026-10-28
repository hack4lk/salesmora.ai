# Worker runtime and deployment

The worker entry point supports local Docker services and an explicitly configured production/staging process. [Railway staging preparation](railway-staging.md) now provides a worker Dockerfile and service configuration. The approved Railway staging service is now running in retention-only mode; live staging chat has passed bounded streaming/permission/action checks; external alerts remain unconfigured. Production chat has not been enabled.

## Local Docker

PostgreSQL and Redis remain in the existing Docker Compose services; Node runs on the host:

```sh
pnpm worker:dev
pnpm worker:status
```

For retention-only operation without an embedding credential:

```sh
WORKER_TASKS=retention pnpm worker:start
WORKER_TASKS=retention pnpm worker:status
```

Stop an existing development worker before starting a replacement. Local startup still loads ignored `.env.local`, requires PostgreSQL at localhost:55432 and Redis at localhost:56379, and selects the existing `help-ingestion-development` queue. `--test` uses the isolated `_test` database/queue. Seed and evaluation commands retain their local-only guards.

`pnpm --filter @salesmora/worker test:runtime` rehearses startup, actual retention execution, bounded failed-job retries, status, SIGTERM shutdown and restart using the isolated local test resources. It requires no other test retention worker and makes no provider calls. It leaves the daily scheduler registered and removes its own immediate test jobs. Tests must not run concurrently with browser suites that reset the test database.

## Production/staging process

Use Node 22 and the repository-pinned pnpm version. Install workspace dependencies with the frozen lockfile and retain workspace source files plus `knowledge/operations/`: package exports currently point to TypeScript source. `tsx` is now a worker runtime dependency, so a production dependency installation includes it. The emitted `dist/index.js` is not a standalone deployment bundle.

Configure service secrets through the hosting provider, not a checked-in environment file:

| Variable | Requirement |
| --- | --- |
| `NODE_ENV` | `production` for production **and staging** worker processes |
| `DATABASE_URL` | Explicit PostgreSQL URL for that environment; `_test` targets are refused |
| `REDIS_URL` | Explicit `redis://` or `rediss://` URL; ACL username/password and numeric Redis database are supported |
| `WORKER_QUEUE_NAME` | Explicit distinct lowercase/hyphen namespace, e.g. `salesmora-production-help` or `salesmora-staging-help`; local development/test queue names are refused |
| `WORKER_TASKS` | `all` (default) or `retention` |
| `OPENAI_API_KEY` | Required for `all`; unnecessary for `retention` |

```sh
NODE_ENV=production pnpm worker:start
NODE_ENV=production pnpm worker:status
```

Production does not load `.env.local`, infer a Redis endpoint, or accept `--test`. `rediss://` enables certificate-verified TLS using the Redis hostname. Plain Redis is supported for a trusted private service network; require TLS for public connections. Configure PostgreSQL TLS through the deployment's PostgreSQL URL/certificate policy. Credentials and URLs are never printed by worker diagnostics.

Use a dedicated database and queue namespace per environment. All producers must use the same queue name and embedding model/dimensions. Existing `knowledge:seed` is deliberately local-only: the separate [staging publisher](staging-knowledge-publication.md) can publish reviewed help directly inside the approved staging worker; it does not enqueue jobs. Production publishing is not implemented. The retention-only worker is independently usable with the migrated database.

Apply reviewed database migrations once before starting workers. Startup checks connectivity and required core tables but does not run migrations. Keep backups and rehearse restoration before risky migrations. Configure Redis AOF persistence, persistent storage and `maxmemory-policy=noeviction` as in local Compose; verify the actual deployment settings.

Run as a supervised separate service without a public port. Grant at least 35 seconds of termination grace; startup and shutdown have 30-second limits, and the status command has a 15-second limit. Graceful shutdown drains active jobs and closes Redis/database resources. After a forced stop, BullMQ can recover stalled jobs; ingestion publication and retention deletion remain repeat-safe. Do not change the queue namespace on routine redeploys: that would strand queued work and schedules.

## Retention and monitoring

The same runtime registers `daily-chat-retention` at 03:00 UTC on `<WORKER_QUEUE_NAME>-chat-retention`. Registration is stable across restarts. One run processes at most 1,000 expired threads; retries/backoff and bounded completed/failed job history remain enabled. No provider calls are made by retention.

`worker:status` performs a database connectivity check, verifies the scheduler exists, reports connected worker counts and waiting/active/delayed/failed job counts, and exits nonzero when workers or the scheduler are missing. It is an operational snapshot, not proof that jobs are making progress. Historical failed jobs can remain visible after a successful retry/replacement and do not alone make the command fail.

## Scheduled estimate expiry

The worker starts an independent expiry sweep immediately and every 60 seconds, including in `WORKER_TASKS=retention` mode. It does not depend on the Mailpit-only estimate email rollout, app origin, encryption key or embedding provider. Startup requires the existing estimate, activity and delivery tables; apply migrations first.

Each sweep uses the database clock and each workspace's timezone. Sent/Published estimates expire only after the entire valid-until day has ended; Accepted/Declined records are unchanged. A sweep handles up to 50 workspaces and 100 records per workspace. Large backlogs drain over later ticks; reads and customer-link checks enforce effective expiry even before the persisted sweep catches up.

The existing workspace transaction lock coordinates expiry with decisions, replacement and SMTP delivery. Status/version, stopped queued mail and one staff-history event commit together. Expiry does not email customers, change frozen paper, renew/revoke tokens or create Jobs. A failed workspace transaction rolls back and can retry on the next tick. Completed work in earlier workspace transactions remains committed. Concurrent workers and restarts do not duplicate expiry events.

Ticks never overlap within a process. Graceful shutdown clears the timer and waits for an active sweep before closing the database. Restart runs an immediate catch-up sweep; there is no additional Redis expiry schedule to restore.

`worker.estimate_expiry_started` reports the interval, `worker.estimate_expiry_completed` reports only the expired count when nonzero, and `worker.estimate_expiry_error` reports sanitized failures. Repeated errors need operator attention; idle sweeps do not produce completion logs. The queue-oriented `worker:status` command does not provide an expiry timer heartbeat or prove sweep progress.

Local verification covers timer cadence, overlap prevention, failure/retry, shutdown/restart, the runtime startup hook, exact workspace-midnight/DST boundaries and live browser/API history. These code changes have not been deployed to staging or production.

## Safe worker diagnostics

Logs are structured JSON with a fixed event name and safe task/count/queue fields. Processor errors are replaced with generic messages before BullMQ stores a failure reason; no raw provider/database errors, transcripts, job payloads, URLs or keys are logged. Monitor:

- `worker.startup_failed`, `worker.startup_timeout`, `worker.queue_error`, `worker.shutdown_failed`, and `worker.shutdown_timeout`.
- `worker.job_failed` (may describe a retryable attempt); alert on exhausted retries or repeated failures using queue status.
- Missing `worker.retention_completed` for more than 26 hours while the service is expected to run.
- Repeated `backlogPossible: true` in retention completion logs, rising queue age/counts, or missing workers/scheduler.
- Missing `worker.estimate_expiry_started` on a new process or repeated `worker.estimate_expiry_error` events.

Connect these to the deployment's alert destination and test alert delivery in staging; no destination is configured locally. Deploy with chat disabled until streaming/proxy, secret rotation, recovery and final security release checks are complete.


### Job deadline reminders (local integration, October 26)

The worker now requires migration `202610260004_deadline_reminders.ts` in addition to the Job/notification settings migrations. Its minute sweep plans only current workspace-local-day reminders, then processes the durable recipient-specific outbox with fresh authorization, plan/settings/preference checks and bounded retry. The status report includes `deadlineDelivery` grouped by email status. Startup refuses missing tables/columns. The existing app-origin and email-provider settings are reused; no additional environment variables are needed.

Free/Standard use the fixed due-date reminder and saved send time; Premium uses current offsets/extras. DST gaps use the first later valid local minute; folds deduplicate the same occurrence. Previously missed dates are not replayed. Provider idempotency keys remain stable across retries; SMTP has the usual acceptance/commit crash limitation. Keep logs aggregate-only and never log reminder payloads or addresses. Local email remains in Mailpit. This section documents local implementation; apply the migration before restarting any later approved staging worker rollout.

### Job status event delivery (local integration, October 27)

Job email delivery now handles explicit status snapshots with the approved status-change template and `job-status-<notice-id>` keys, retaining creation's existing `job-created-<notice-id>` keys. It requires migration `202610270001_job_status_notifications.ts` and checks the new snapshot column at startup. Status email consumes the current effective workspace status rule and existing personal Job activity preference. In-app status history remains independent of email choices.

For a later approved staging rollout, stop any creation-only worker before enabling status writes, apply the additive migration, and deploy the updated worker and web together; an older worker must not consume the new status events as creation emails. Restart and verify worker health before exercising the live status flow. This implementation has only been activated locally.


### Job assignment event delivery (local integration, October 27)

The worker now requires `202610270008_job_assignment_notifications.ts` and checks `assignmentChange` at startup. It dispatches to the approved assignment template with `job-assignment-<notice-id>` keys. Proven removal events may deliver a minimal Job-number/workspace notice to a still-active workspace member after Job read ends; all other Job delivery keeps current Job read and assignment checks. Verification, age cutoff, personal preference, effective workspace rule and deletion checks apply to both branches. Re-added recipients use their current authorized projection for historical notices. No additional environment variables.

For a later approved deployment, stop older Job-email workers before enabling assignment writes, apply migrations, and deploy web/worker together. Older workers must not consume assignment events as creation mail. Verify ready/status and test a primary reassignment with a Field user before opening traffic. This migration and worker are currently active locally only; SMTP retains its acceptance/commit crash limitation.


### Job completion-deadline event delivery (local integration, October 27)

The worker now requires migration `202610270009_job_deadline_notifications.ts` and checks `deadlineTimezone` at startup. It routes deadline events to the approved JobDeadlineChanged template with `job-deadline-<notice-id>` provider keys, retaining all prior event keys. Dates and the timezone are immutable event snapshots; current membership, Job read/assignment, verified email, deletion state, personal Job activity preference and effective workspace deadline-email policy control delivery. Deadline reminders remain a separate scheduler/outbox/preference. No new environment variables.

For a later approved release, stop older Job-email workers before enabling deadline writes, apply the additive migration and deploy web/worker together. Older workers must not consume deadline events as creation mail. Verify ready/status and exercise set/change/remove plus permission loss before opening traffic. This has only been activated locally. Bounded retry and the documented SMTP acceptance/commit crash limitation remain.

### Calendar assistant read evidence (local integration, October 27)

Apply `202610270010_calendar_chat.ts` before a future approved web rollout. It adds nullable private result/evidence fields to chat turns and refuses rollback over retained evidence. Existing turns remain null/unmodified. This slice adds no worker task or environment variable; worker builds/health should still be checked during release. Workspace-local day and conservative PostgreSQL tuple-version evidence protect streaming/replay/Open; restored or changed tuple versions may invalidate old read snapshots. This migration has only been applied locally. Read-only date advice now reuses these Calendar snapshot fields locally without another migration, worker task or environment variable. Calendar scheduling proposals and staging rollout remain separate approvals.


### Calendar schedule proposal persistence (local integration, October 27)

Apply `202610270011_calendar_proposals.ts` before a future approved web rollout. It adds actor/thread-owned private Calendar review payloads, minimal proposal audit and bounded turn evidence; rollback refuses retained proposal/audit/history data. Development and isolated test databases have this migration locally. This integration uses the existing shared Calendar command and combined visit notification/outbox; no new worker task, queue, provider setting or environment variable is needed. Web, worker and Storybook builds passed locally. Deployment remains a separately approved grouped release; production/staging databases were not changed.


### Complete-app staging activation — October 28, 2026

The separately approved complete-app rollout is now active on staging. Worker `33332492-3b93-48ba-9780-a54b46e411d0` matches web `60aac1dd-cb0f-4167-afcc-48dd103a5437` after all 92 migrations, including the Calendar/Job/Estimate additions. Safe status reports ready, a retention scheduler and one worker with no failed retention jobs. Earlier sections labeled local integration describe the implementation history; their migration/startup requirements have now been applied on staging. Production remains unchanged. Estimate customer sending is still guarded to local Mailpit, while Estimate expiry and staff notification infrastructure are included. See [release evidence and remaining operational follow-ups](calendar-staging-release.md).


### Staging Estimate customer delivery — October 28, 2026

The user explicitly enabled Estimate email on staging. The worker now selects the existing Mailpit recovery transport locally or the existing Resend HTTPS transport on explicitly enabled Railway staging. Both web and worker require `ESTIMATE_EMAIL_ENABLED=true`; remote production remains disabled. The active worker is `05fba878-ff4b-4164-b4f3-498a386c7865`, matching web `589ba322-c154-4466-9c37-2d0af6b884b0`. Existing Read/Send authorization and frozen-data/active-link checks run before each send. Durable queue time bounds external sends to 23 hours, within the provider's documented idempotency retention; five-attempt backoff remains. Local Mailpit lookup recovery remains unchanged. No migration or additional credential is required. See [rollout, live-test evidence and pause procedure](estimate-staging-email.md). Earlier Mailpit-only statements describe the prior rollout, not current staging behavior.
