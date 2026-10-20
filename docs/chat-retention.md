# Chat retention

The trusted maintenance worker deletes private assistant threads after **90 days of inactivity**. Sending a new turn updates thread activity; merely viewing history does not extend retention. Recent turn creation/completion and unexpired active turn leases also protect a thread. The exact 90-day boundary is retained until the next run.

`packages/data/src/chat-retention.ts` selects a bounded oldest-first batch, acquires the same workspace row lock as chat acceptance/confirmation, then rechecks eligibility. Busy workspaces are skipped. Each deletion atomically removes all three LangGraph checkpoint tables for that thread's turn IDs and deletes the canonical thread. Foreign keys cascade through turns, messages and action draft payloads. An error rolls back that thread's entire deletion. Expired crashed leases cannot indefinitely retain old transcripts.

The job never deletes `chatActionAudit`, `aiUsageCalls`, workspace AI budget overrides, CRM leads, help vectors or team/job records. Existing action audits remain immutable. Usage and unknown reservations continue to count for their original UTC month even when a transcript is deleted. Audit/accounting deletion needs a separate approved business/account-deletion policy; no automatic lifetime is assigned here.

No operational trace store exists today: model tracing is disabled, and worker errors contain generic messages only. The documented 30-day limit applies to any future redacted trace sink and must be configured when one is introduced. This job does not control external provider retention, database backup expiry or checkpoints orphaned by account/workspace deletion; account deletion reconciliation and backup policies remain deployment work.

## Scheduling and operations

`apps/worker/src/retention.ts` registers the stable BullMQ scheduler `daily-chat-retention` on a separate environment-specific queue derived from the local knowledge queue. It runs at **03:00 UTC daily**, processes at most ten batches of 100 threads, retries failures three times with exponential backoff, and retains at most ten completed/failed job records. Job payloads contain no customer identifiers or transcript data; results contain only deletion counts. Repeated registration and cleanup are safe.

Run/restart `pnpm worker:dev` for local scheduling. The current worker configuration intentionally refuses production. Production must wire this same cleanup service into a trusted worker with database/Redis configuration, daily scheduling and failure/backlog monitoring before enabling chat. A stopped worker means retention is delayed; the next run removes eligible data, with large backlogs draining over subsequent daily runs. Multiple workers remain safe through row locks and eligibility rechecks.

No schema migration, new UI, provider request or key is needed for this slice.

## Validation

`pnpm test:chat:retention` uses fictional, rollback-only fixtures on the isolated local `_test` database. It covers boundary/recent/active protection, expired crashed leases, cross-workspace isolation, all checkpoint tables, cascading draft/message deletion, preserved immutable audit/usage, rollback after a simulated deletion failure and repeated runs. Scheduler unit checks cover cadence, bounded batches, retry propagation and lifecycle cleanup. Existing monthly allowance checks remain available through `pnpm --filter @salesmora/data test:usage`.

Verified October 12, 2026: retention database rehearsal and existing allowance/concurrency rehearsal passed; all 342 unit tests, lint and workspace type checking passed. No customer fixtures were committed and no live provider calls were needed.

## Shared runtime update — October 12, 2026

The worker now supports explicit production/staging settings through `NODE_ENV=production` and a required environment queue namespace; it continues to support the existing local Docker services. This supersedes the earlier local-only entry point restriction. See [worker deployment](worker-deployment.md) for runtime dependency packaging, retention-only mode, status checks, shutdown bounds, structured logs and staging alert requirements. No production service has been deployed by this change.
