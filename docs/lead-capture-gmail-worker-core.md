# Gmail synchronization and processing core — November 4, 2026

November 5 update. The scoped worker and activation are now integrated and running locally. See the [local pilot record](lead-capture-gmail-live-integration.md) for current status. This document records the preceding core checkpoint.

This is the tested worker-core substep of checkpoint 4 in the [integration plan](lead-capture-gmail-integration-plan.md). Intake Review (4a) was approved by the user. **The worker core is implemented; live Gmail ingestion is not yet integrated or enabled.** The remaining integration boundary is described below. No new Google account, consent or credential setup is needed for the existing local pilot.

## Current environment and scope

- The local connected account and reviewed sample/source remain unchanged. The real sample email has not been imported as intake.
- No background Gmail task has been registered in `apps/worker/src/index.ts`. Running existing worker tasks, including `all`, does not start this new runner. No task/environment flags were enabled, and no Google/model requests were made in this checkpoint.
- Migration `202611050005_capture_gmail_sync.ts` was applied, empty-rollback tested and reapplied only in disposable local test databases. **It has not been applied to the main development database or staging.** Apply it by exact name after the next integration review; do not run every pending migration against a live database.
- All provider responses, extraction outputs and messages in the worker rehearsal are fictional. No emails were sent and no main-database receipts, intake items or CRM leads were created.

## Implemented core

`packages/data/src/lead-capture/gmail-sync-provider.ts` supplies read-only profile/history/recovery transport with fixed endpoints, per-operation deadlines, bounded streams/schema parsing, decimal-string history IDs, pagination and safe failure codes. Normal sync requests only added-message history. A cursor is advanced only after its final page has been durably queued; this follows Google's documented pagination/checkpoint contract. [Gmail history API](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list).

`gmail-sync-store.ts` supplies:

- A publication-transaction helper to open an eligibility window from a provider baseline obtained before the transaction. It requires an already active, scoped source, its immutable complete Gmail configuration, matching connected account/generation and an eligible workspace plan. It is an internal primitive, not an endpoint and not independent permission to activate a source.
- Workspace-first locking, renewable-by-reclaim mailbox/message leases, stale-lease and account-generation fencing. Provider/model work happens outside database transactions.
- Atomic per-page queue insertion and continuation persistence, stable source/account/message deduplication across retries and reconnects, and scoped fan-out to source windows.
- A shared-mailbox safeguard: a worker cannot advance that mailbox's cursor unless its source scope includes every open source window on the account. The deployment must provide one coherent source scope per workspace; disjoint source-specific runners must not share a mailbox cursor.
- Expired-cursor recovery through a bounded time-range search, then continuation from a profile checkpoint obtained *before* the rescan. Mail arriving during recovery remains eligible for subsequent history polling. Recovery spans at most seven days and 100 pages; larger intervals or queue pressure stop with `recovery-required`, preserving the existing cursor. The initial conservative recovery range begins at the earliest currently open window, so older long-running windows may require explicit operator recovery even after a short outage. It never resets silently to the newest history ID.
- A 10,000 outstanding-job bound. Retained supervised intake is separately limited to 10,000 awaiting items and 64 MiB of evidence. Bounds stop/retry work instead of pretending capture succeeded.
- Exponential retry delay capped at 15 minutes. Message provider/extraction failures stop at a retained failed job after eight attempts; unavailable admission remains retryable. No transport/model error body is retained or logged. Explicit failure/recovery UI and authorized retry actions remain part of the next integration step.

Migration 005 adds durable page/recovery state and observed message-history IDs. Its source-update trigger atomically closes open windows and cancels pending/processing/retry jobs when a Gmail source is paused, archived, blocked or changes approved configuration. It leaves accepted receipts intact. Existing disconnect logic continues to fence account work.

`gmail-ingestion.ts` validates immutable message evidence and proposed answers, matches literal configured phrases with the same separate-subject/body all/any semantics as sample preview, and commits a receipt, awaiting Intake Review item, source event and accepted job in one transaction. It rechecks source/account/configuration/lease, plan/source capacity and retention bounds immediately before commit. Missing/uncertain values, duplicates and exhausted CRM lead capacity are retained as review flags. No branch in Gmail processing creates a lead or sends email.

`apps/worker/src/gmail-capture.ts` supplies bounded polling/processing functions and a dedicated five-second loop with non-overlapping ticks and orderly shutdown. All workspace/source scopes are explicit. The host must inject scoped token refresh, a fresh message-provider factory and the existing tracked/budgeted extraction adapter. There is no fallback model or untracked extraction client. Full-message reads now request labels too, so processing can exclude sent/draft/spam/trash mail before extraction; messages before the exact eligibility timestamp and deterministic nonmatches also bypass extraction.

## Verification

- Full unit suite: 3,562 tests across 239 files passed.
- Gmail runtime-role scratch rehearsal (`apps/worker/src/gmail-capture.rehearsal.ts`): 13 groups passed, including empty migration down/up, worker isolation from OAuth attempts, supervised intake/no leads or emails, pagination atomicity, replay/concurrent claims, expired leases, pause-trigger fencing, pre-launch/nonmatch/sent exclusion, bounded cursor recovery, reconnect generation fencing, rate limits, pagination overflow, shared-mailbox scope safety and bounded extraction failure.
- Existing capture lifecycle scratch rehearsal: nine groups passed with migration 005, including pause/resume/archive, scheduled revision cancellation, current access/assignment, conflicts and audit rollback.
- Data/worker typechecks and focused lint passed; the root React detection warning is pre-existing.
- No UI component changed; existing canonical Intake Review renders the receipts produced by this core. Populated behavior was tested against fictional scratch records, not the user's real mailbox.

Use Node 22:

```sh
pnpm test
pnpm --filter @salesmora/data test:lead-capture-gmail-sync
pnpm --filter @salesmora/data test:lead-capture-lifecycle
pnpm --filter @salesmora/data typecheck
pnpm --filter @salesmora/worker typecheck
```

The guarded DB harness creates and drops a fresh local scratch database using the ignored `TEST_DATABASE_URL`. Do not substitute the main development or staging URL. Sanitized validation is saved in ignored `.local/releases/capture-gmail-worker-20261104/validation.json`; logs are `/private/tmp/gmail-sync-*.log`.

## Remaining live integration — next reviewed step

1. Add a scoped, fresh activation preparation outside DB locks: refresh the selected account, obtain a mailbox history baseline, bind it to exact source/configuration/account generation, actor/request identity and expiry, then open the window atomically with the authorized publication/resume/scheduled-activation transaction. Do not make a Google request inside a publication lock. New versions/resumes get a new eligibility boundary; mail during pause must remain excluded.
2. Supply extraction through the existing tracked model/usage reservation boundary using only the immutable approved mappings and current message evidence. Bound time/output, reject changed field identities or unsupported quotes, handle exhausted model budgets without repeated billable retries, and test malicious message instructions. The core's injected extractor is currently a test boundary, not a production implementation.
3. Register an explicitly selected Gmail-only task and dependencies, with validated workspace/source scopes and runtime-role credentials. It must not start notification, billing, knowledge or unrelated tasks. Connect provider authorization/rate failures to account health safely. Do not instantiate a message provider once for the lifetime of the loop: its operation deadline is intentionally short.
4. Add freshness/heartbeat/schema readiness, exact reviewed-sample checks and account/worker health to every Gmail publication/resume/scheduled path. Project safe queued/failed/recovery-required states into the canonical connection UI, with reviewed retry/recovery actions. The conservative overflow/old-cursor stop must be recoverable without arbitrary manual cursor resets.
5. Apply only the reviewed migration locally, keep notification/email delivery off, then explicitly launch the marked pilot source and request a **new** fictional message. The sample email predates launch and must not become intake. Verify one receipt/item in the real local UI, then exercise a deliberate Intake Review decision. Its reviewed workflow must have notifications off before creating a lead.

Continue with the existing real-account and scoped-staging acceptance plan afterward. Staging still requires its own reviewed source freeze, live ledger comparison, fresh private backup/restore rehearsal and environment/OAuth preparation. Do not deploy or commit the entire shared dirty working tree.
