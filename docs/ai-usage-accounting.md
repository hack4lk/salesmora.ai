# Assistant usage accounting

October 12, 2026. Provider usage accounting and a configurable monthly workspace token allowance are implemented. The approved default is 5,000,000 tokens per workspace per UTC calendar month, shared by every teammate. Existing request, concurrency, duration and output-token limits still apply. Manual lead creation and explicit confirmation of an already prepared lead do not call a model and remain independent of the AI allowance. This is a token quota, not a currency budget or invoice.

## Ledger and boundaries

Migration `202610120007_ai_usage` adds `aiUsageCalls`. Every production code path that calls the current model or embedder first persists a call record, then finalizes it once. Planning and streamed answers are distinct calls; query embeddings carry the same authenticated workspace/user/turn identity. Shared help ingestion and development relevance evaluation have no customer identity and use distinct phases. Identity is supplied by server code, never a prompt or browser field.

The ledger stores model/provider, phase, timestamps, outcome, optional workspace/user/turn IDs and provider-reported input/output/total, cached-input and reasoning token counts. Cached input is included in input; reasoning is included in output. Neither should be added again to the total. The adapters use the [Responses usage fields](https://developers.openai.com/api/docs/guides/token-counting) and [embedding usage fields](https://developers.openai.com/api/reference/resources/embeddings/methods/create). Counts are not a dollar invoice; model prices and account billing still require separate reconciliation.

No prompt, answer, lead payload, credential or raw provider error is stored. There is no browser ledger endpoint or new UI. The table has no transcript foreign key, so deleting a conversation does not erase operational accounting. Its retention and account-deletion policy must be finalized with the other release retention work.

Completed, failed and cancelled calls are distinguished. Missing/malformed provider usage stays null, including an interrupted stream with no terminal usage. Never treat null as free usage. A process crash or failure to persist the final accounting leaves a `started` row; reports count it as unknown. There is no automatic provider retry or invented token estimate. A failure to create the initial ledger row prevents provider work. A final accounting failure fails the turn rather than claiming a fully recorded success.

Finalization conditionally updates only `started` records, so concurrent/repeated finalization cannot double-count a call. Replaying an already accepted chat request returns persisted turn state before reaching the provider or its ledger. New explicit attempts are new calls. BullMQ retries are also separately accounted provider attempts when they actually call embeddings.

## Files and verification

- `packages/contracts/src/ai-usage.ts`: internal adapter recorder/result/token contract and validation.
- `packages/data/src/ai-usage.ts`: persistent start/finalize recorder.
- `packages/data/src/ai-usage-session.test.ts` and `ai-usage-session.rehearsal.ts`: request-scoped buffering, protocol batching and quota regressions.
- `packages/agent/src/openai-model.ts`: planning and final-stream usage capture. Non-streaming SDK normalization turns missing metadata into zeroes; a zero-token nonempty chat request is conservatively unknown.
- `packages/data/src/knowledge/embeddings.ts`: validated embedding usage capture.
- `apps/web/src/server/chat/runtime.ts` and `help.ts`: authenticated attribution for chat and retrieval.
- `apps/worker/src/index.ts` and `evaluate.ts`: shared corpus/evaluation attribution.
- `packages/data/src/ai-usage-report.ts`: local-only monthly aggregate report.

Run `corepack pnpm ai:usage`, or `corepack pnpm ai:usage -- --test` for the isolated test database. It reports this UTC calendar month's counts and known token sums by model/phase/outcome, with unknown-call counts alongside them. No customer text or individual identifiers are printed. Restart an already running embedding worker after upgrading so its process loads the recorder.

Run `corepack pnpm --filter @salesmora/data test:usage` for rollback-only isolated database checks. Adapter unit tests verify real Responses-shaped usage, cache/reasoning accounting, missing metadata, interruption, cancellation and database failure. The opt-in live help evaluation verifies separate planning/answer/query-embedding rows with positive token counts and matching authenticated turn identity.

## Monthly allowance enforcement

Validation: the additive migration passed private backup/restore rehearsal and was applied locally. All 330 unit tests, rollback-only ledger checks, 19 chat transport/approval/modal regressions, one real-provider streamed help accounting evaluation, workspace lint/typecheck and production build passed. The live evaluation produced positive, internally consistent planning/answer/query-embedding token rows for one fictional authenticated turn. No UI or Storybook changes were needed.

Migration `202610120008_ai_budgets` adds `reservationTokens` to the ledger and the trusted operational `workspaceAITokenBudgets` configuration table. Existing known usage remains charged at its measured total; legacy unknown workspace calls receive a conservative 5-million-token hold. Transcript deletion cannot reset usage. No per-user allowance or rollover balance is applied.

Set `CHAT_MONTHLY_WORKSPACE_TOKENS=5000000` server-side to configure the default. Missing configuration uses the approved 5-million default; malformed configuration fails closed. Zero stops new calls. A persisted workspace override takes precedence. Configure or inspect a local workspace with:

```bash
corepack pnpm ai:budget -- --workspace WORKSPACE_UUID --tokens 5000000
corepack pnpm ai:budget -- --workspace WORKSPACE_UUID
```

Add `--test` to select the isolated test database. This local-only CLI checks workspace existence. The configuration service is reserved for trusted operators; there is no browser/model tool to increase the allowance and no new settings screen. Changing the server default requires a process restart; persisted overrides apply to new calls immediately. Lowering a limit never cancels a request already admitted.

Before generation, a transport wrapper sends the exact serialized stateless input/tool configuration to OpenAI's [input token count endpoint](https://developers.openai.com/api/docs/guides/token-counting). It reserves that input count plus the configured maximum output (400 planning / 1,200 answer tokens). Counting has a 15-second timeout within the existing total turn deadline. An unavailable or malformed count prevents generation; there is no estimation fallback. Counting sends the same minimized context to the same provider; the count response is not a user-visible stream or conversation record.

Text-only embedding requests reserve UTF-8 input bytes plus one framing token per text as a conservative byte-pair-token bound. Chat query embeddings are charged to the authenticated workspace. Shared corpus/evaluation embeddings remain separately accounted operational costs.

An exclusive transaction advisory lock per workspace serializes admission, settlement and override changes across processes and teammates. Admission sums this month's known totals plus reservations for unknown calls, then atomically inserts the new reservation only when it fits. It uses one database timestamp for the admission month and call start, including a request waiting across midnight. Completed calls replace their reservation with reported total usage; cancelled/failed/crashed calls with unknown usage retain their full reservation for that admission month. Repeated settlement is idempotent. A new UTC calendar month excludes older calls automatically; no reset job is necessary. Cached/reasoning tokens are already included in totals and are not counted twice.

### Request-scoped accounting

`createAIUsageSession(db, identity)` returns `{ recorder, flush }`. Pass the **same recorder** to the conversation model, deterministic fixture model and query embedder. Await all provider work and `flush(signal.aborted ? 'cancelled' : 'failed')` in the request's outer `finally`, before publishing successful turn completion. `flush` preserves completed provider results and marks admitted calls whose finish callback never ran as unknown failed/cancelled calls. Do not catch and ignore its failures: they must fail the turn. Failed flushes can be retried; successful flushes are idempotent. A flushed session cannot admit new calls.

Each phase still reserves its exact counted input plus its actual configured output limit before provider work. There is deliberately **no guessed whole-request reservation**: the final answer's exact input depends on post-tool evidence, planner output limits vary by tool, and optional intent routing and up to two help queries add provider phases. The existing model adapter and embedder remain responsible for their bounds. This optimization does not remove provider input-token-count requests.

On a regular database handle, admission pins one connection for two PostgreSQL simple-protocol driver calls: `BEGIN; advisory lock; allowance SELECT`, then `INSERT; COMMIT`. These are separate ordered SQL statements, not a lock/read CTE sharing a stale pre-lock snapshot. Knex escapes values before batching. The connection and workspace lock are released before any provider work. Errors roll back; a failed rollback marks the connection unusable rather than returning an open transaction to the pool. Existing transaction handles retain normal nested-transaction semantics.

Finish callbacks buffer validated per-provider results and their completion timestamps locally. The next admission settles those results inside its allowance query, adjusting the pre-update statement snapshot by only the rows actually settled in the current UTC month. This preserves admission near the quota limit without an extra write roundtrip; a rejected admission rolls back those settlements too. Unknown results retain their original reservation. The final flush settles remaining rows with one conditional batch update under the workspace lock. A crash before flushing retains durable unknown reservations, never free usage; every provider call keeps its own model, phase, identity and outcome row for administrative reporting.

A planning-plus-answer request uses **five accounting driver calls instead of twelve**: two per admission and one final flush. Each additional model/embedding admission adds two calls. Database metrics retain `usage-reserve`/`usage-finalize` operation attribution and count the real driver calls; batching does **not** eliminate per-admission allowance scans or reduce the number of SQL statements inside each transaction. This is the safe bounded fallback, not a claim of a single aggregate reservation. No migration or changed grants are required.

Run focused tests with `corepack pnpm exec vitest run packages/data/src/ai-usage.test.ts packages/data/src/ai-usage-session.test.ts` and `corepack pnpm --filter @salesmora/data typecheck`. Run the additional isolated PostgreSQL rehearsal with `corepack pnpm --filter @salesmora/data exec node --import tsx src/ai-usage-session.rehearsal.ts`; it requires the existing local `TEST_DATABASE_URL` safeguards, creates only fictional random workspace IDs, and removes only its own ledger/budget rows.

The November 12 roundtrip reduction consolidates the admission clock, allowance override, UTC usage sum, platform default, subscription and plan-override reads into one statement **after** acquiring the workspace lock. A reservation now uses five driver calls: BEGIN, lock, allowance read, insert, COMMIT. Settlement uses one atomic conditional UPDATE with a materialized advisory-lock CTE, retaining the workspace lock through the write without separate transaction-control calls. Two model phases therefore use 12 accounting calls instead of 26. This consolidates existing reads; it does not eliminate the monthly ledger scan or relax quota concurrency. The isolated accounting rehearsal asserts the exact five/one call budgets as well as concurrent admission, repeated settlement, billing transitions, defaults and UTC rollover.

A response can be refused before the exact quota is exhausted if there is insufficient headroom for its maximum output. It can also stop between planning, retrieval and answering; each phase has its own admission check. This consumes only already incurred/unknown usage, never commits a lead, and leaves failed-turn drafts unconfirmable. The chat displays an allowance-specific error; manual CRM actions and confirmation of previously completed proposals remain available. Retrying never bypasses admission or automatically increases the limit.

Currency budgets, billing reconciliation, an owner-facing usage/configuration UI and retention scheduling remain future release work. They must use reviewed pricing and preserve current app authorization.

Allowance validation: the additive migration passed private backup/restore rehearsal before local application. All 338 unit tests, real concurrent database reservation/settlement checks, UTC month-rollover checks, a live streamed provider count/reservation evaluation, narrow/wide allowance and adjacent streaming interaction/Axe/layout checks, lint/typecheck and production build passed. Browser checks verify the specific limit message, repeated denial without provider spending, recovery after raising a limit, and manual lead access while AI is blocked.

## Owner usage page

`/settings/ai-usage?workspace=<id>` is the read-only Owner subpage alongside Permissions. The Settings overview links to it and the main navigation nests it under Settings on every signed-in page for the current workspace Owner. General Settings and the Permissions page keep their existing routes and behavior.

`apps/web/src/server/workspaces/ai-usage.ts` enters the existing workspace authorization transaction and requires the current validated membership role to be Owner before reading any usage. It returns decimal-string totals and the next first-of-month reset from the database UTC clock. `GET /api/ai-usage` repeats that check on every refresh and returns `Cache-Control: no-store`; unauthorized callers receive no usage fields. Admin, Office, Field and Owners without membership in the requested workspace cannot read it. There is no write endpoint or model tool for allowance configuration.

`AIUsageRoute` connects the approved page to initial server data and a bounded, abortable refresh. Errors hide stale totals, retry is available, and authentication/access failures refresh the server route to re-evaluate navigation. The server-provided route key resets client state when the workspace or server snapshot changes. Usage data is never added to assistant prompts.

No database migration or provider request is needed. Existing environment/defaults and trusted operator budget overrides still control the allowance.
