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

Logs are structured JSON with a fixed event name and safe task/count/queue fields. Processor errors are replaced with generic messages before BullMQ stores a failure reason; no raw provider/database errors, transcripts, job payloads, URLs or keys are logged. Monitor:

- `worker.startup_failed`, `worker.startup_timeout`, `worker.queue_error`, `worker.shutdown_failed`, and `worker.shutdown_timeout`.
- `worker.job_failed` (may describe a retryable attempt); alert on exhausted retries or repeated failures using queue status.
- Missing `worker.retention_completed` for more than 26 hours while the service is expected to run.
- Repeated `backlogPossible: true` in retention completion logs, rising queue age/counts, or missing workers/scheduler.

Connect these to the deployment's alert destination and test alert delivery in staging; no destination is configured locally. Deploy with chat disabled until streaming/proxy, secret rotation, recovery and final security release checks are complete.
