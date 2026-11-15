# Main assistant chat implementation plan

> Historical migration paths in this document refer to the prior release. Current fresh databases use the [curated baseline](../packages/data/src/baseline/); existing databases require a separately designed upgrade.

**Status:** Local assistant capabilities have expanded beyond the initial October
12 slice described below. Canonical-only proposal storage and empty-legacy
table retirement are staged locally, but broader regression adaptation and
production release gates remain open. No existing database has been migrated.
See the [proposal consolidation status](chat-proposal-consolidation.md).

## Scope and source decisions

Keep the approved bottom-right assistant callout and dark-blue modal on signed-in workspace pages. This supersedes the earlier top-of-page form. Embedded assistants, campaigns, external connectors, attachments, voice, and autonomous actions are outside the first chat slice.

This plan applies the [context-aware agent architecture](context-aware-agent-architecture.md), [application structure](application-structure-plan.md), [implementation stages](implementation-start-plan.md), [role definitions](user-journeys.md#agreed-permission-roles-and-work-profiles), and [local credential guidance](local-development.md). The [assistant tracker](assistant-build-tracker.md) records the approved UI.

The first working slice supports streamed conversation, current-product help with cited RAG sources, authorized lead summaries, and then reviewed lead creation. Start on existing Home and Create lead pages; add Leads list/detail tools when those pages and services exist.

## Remaining implementation and release work

- Reviewed lead creation is implemented for local review. Future business mutations require their own scoped draft/confirmation flow; no model commit tool is enabled.
- Provider usage accounting and a configurable 5-million-token monthly workspace allowance are implemented. Retention scheduling, production secrets/Redis setup, staging proxy streaming and deployment restore validation remain release gates. Production remains opt-in; a key alone cannot enable chat. See [usage accounting and allowance enforcement](ai-usage-accounting.md).
- Server-only development credentials are configured in ignored `.env.local`; no values are recorded in this document or the repository.

## Authorization: the app and agent share one policy

Implement typed capabilities in `packages/domain` and use them from manual pages/APIs, agent tools, retrieval filters, and action confirmation. The server reloads membership, role, record access, and applicable plan restrictions. The browser, prompt, conversation history, and retrieved text cannot assign permissions.

Effective tools are the intersection of implemented tools, the registered surface/task allowlist, current app capabilities, authorized record scope, and applicable entitlements. Every tool enforces these checks independently of its advertised availability. Default unknown capabilities and unimplemented features to deny.

| App role | Agent access |
|---|---|
| Owner | Current implemented app grants; only Owner manages role permissions |
| Admin | Current implemented operational grants; no Owner-only permission management |
| Office | Current configured grants; workspace lead reads and creation by default |
| Field | Assigned lead reads by default; no lead creation or campaign access |

There is no separate powerful agent role. Every tool intersects the registered surface, server-enabled implementations, current app grants, and authorized record scope. Campaign execution remains unavailable to everyone until its app feature and tool exist. The initial registry includes Home, Create lead, Settings overview, and Settings Permissions; surface keys are intent hints and cannot authorize data.

Check membership and record scope on each new request/action. The November 13 approved request-snapshot contract supersedes the earlier per-release checkpoints documented below: authenticate and establish authority at admission, then reuse it for that answer's tools, text, structured results and completion. Session/user/permission revocation applies to the next request, not the in-flight answer. No transaction or workspace lock remains open across model/network waits.

History/navigation and explicit business confirmations authorize independently. Historical answers retain timestamped evidence through ordinary data edits but cannot bypass later private-access revocation; confirmations also require current target versions and proposal bindings. Stop/disconnect/timeout/listener failure still abort without periodic authorization reads, and one atomic completion statement checks active state and lease before saving text and staged evidence.

## Credentials and provider boundary

- Use SalesMora-managed server credentials for the MVP, with separate development/staging/production projects or credentials. Customer-provided keys are not part of this slice.
- Proposed configuration: `OPENAI_API_KEY`, `CHAT_MODEL`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS`, `CHAT_ENABLED`, and bounded timeout/token/tool/usage settings. Publish placeholders only in `.env.example`; local values live in ignored `.env.local`, deployed values in service secrets. No `NEXT_PUBLIC_` credentials.
- Inject the model key only into web runtime services that call the provider, and embedding credentials only into ingestion/retrieval services that need them. Use least-privilege project credentials, documented rotation/revocation, and redacted configuration errors. Keep keys out of database transcripts, prompts, vectors, browser bundles, stream events, URLs, and logs.
- Retain the agreed provider-neutral adapter and OpenAI MVP choice. The planning documents nominate GPT-6 Luna first and GPT-6.1 Sol conditionally; verify the actual API model identifiers, account access, SDK compatibility, and evaluation results before pinning configuration. Desktop model labels are not assumed to be API identifiers. Pin an embedding model and dimensions separately; changing either requires explicit reindex/version handling.
- Use streamed Responses requests with `store: false`; do not use provider-hosted conversation storage for app continuity. This disables response storage, not all provider retention. Review the actual account’s data controls before using customer data; begin with fictional development content.

OpenAI documents [SSE streaming](https://developers.openai.com/api/docs/guides/streaming-responses), [server-side API-key handling](https://developers.openai.com/api/reference/overview), and [data retention controls](https://developers.openai.com/api/docs/guides/your-data). The adapter must verify these settings in integration tests rather than rely on SDK defaults.

## Streaming and UI contract

1. On Send, immediately append the user message and show **Thinking…** in the assistant response area. Announce the status accessibly without announcing every token. Disable duplicate submission while keeping Stop and Close available.
2. Send authenticated `POST /api/chat/turns` with a bounded message, selected workspace, optional thread ID, client turn/idempotency ID, registered surface key, and minimal validated record/UI references. Identity, role, tools, prompts, and authoritative history are server-owned. Enforce session, configured Origin, body limits, membership, thread ownership, rate/usage limits, and schema validation before opening the stream.
3. Return an app-owned typed SSE stream consumed with `fetch` and a streaming reader (POST/session support), not a direct browser-to-provider connection. Translate provider/LangChain output into stable product events; never forward raw provider events or tool arguments.
4. Stream answer deltas into one assistant message as they arrive. Replace Thinking… on the first visible answer delta. For later tool work, show a separate bounded progress status while retaining already displayed text. Stream only user-facing answer text, never internal reasoning, prompts, credentials, or hidden tool output.
5. Finish with an explicit terminal event; a socket closing alone does not mean success. Partial text remains visibly interrupted on failure/cancel. A failure before any text removes Thinking… and shows a useful retry message. Unsupported/restricted requests explain the limitation without leaking hidden record existence.

### Checkpointed streaming architecture — November 9, 2026

Historical design: the November 12 completion-only slice below supersedes partial transcript checkpoints and their timer. Batching and fresh delivery authorization remain.

The approved performance slice separates provider fragments, authorized browser delivery and transcript durability. It supersedes per-provider-fragment transcript persistence; it does not change model selection, tool permissions, proposal confirmation or history authorization.

```text
Provider fragments
  -> bounded text batches (150 ms / 1,000-character flush threshold)
  -> fresh session, evidence and active-turn checks
  -> app-owned SSE delivery

Delivered transcript suffix
  -> serialized checkpoint every 5 seconds or before exceeding 8,000 characters
  -> final authorized checkpoint
  -> durable completed turn
```

- [Text batching](../packages/agent/src/text-batches.ts) preserves answer ordering and existing 8,000-character fragment/event and 16,000-character answer limits. Read-ahead is bounded to one provider fragment. A fragment exceeding an event's capacity is not silently truncated; buffered and new text are delivered separately when valid.
- [Transcript delivery](../apps/web/src/server/chat/transcript-delivery.ts) separates display from persistence. A single serialized queue protects delivery/checkpoint ordering, bounds the unsaved suffix to 8,000 characters and applies backpressure during a slow write. The five-second timer starts with the accepted stream; empty ticks do not write. Size-boundary and terminal checkpoints may add writes beyond the timer cadence.
- Each browser batch still receives fresh session/evidence/active-turn checks in the [turn route](../apps/web/src/app/api/chat/turns/route.ts). The live runtime delegates text delivery authorization to that boundary instead of checking the same batch again in the graph. Other runtime callers retain the graph's authorization fallback. There is **no two-second permission cache**: the subsequently approved fresh-per-batch alternative is implemented.
- Checkpoint writes independently recheck the session, current authority, evidence, active turn and lease. The [store](../apps/web/src/server/chat/store.ts) transitions to `running` only when needed rather than rewriting the same state on every checkpoint. Persisted text is a suffix appended exactly once by the serialized delivery path, not a repeatedly rewritten client-supplied answer.
- Completion waits for the remaining text to persist before marking the turn complete or sending `turn.completed`. Background save failures abort upstream work and surface through the existing failure path; they cannot produce a success-shaped response. Stop/disconnect/provider failure attempts a final authorized partial checkpoint; if cancellation has already made the durable turn inactive, that append is rejected rather than reopening the turn. Access denial does not flush buffered facts. Report-dependent incomplete history continues to be redacted.

**Durability tradeoff:** newly displayed text can precede its checkpoint. A process crash, failed final partial save or reload during an active stream can lose the suffix since the last successful checkpoint. Five seconds is the healthy scheduling cadence, not a hard data-loss bound during database stalls. No automatic replay of tools or proposals is introduced. Existing interrupted-turn recovery and confirmation requirements remain authoritative.

**Content-free diagnostics:** `chat_model_stream` logs provider fragment count and time to first provider text, measured from answer-stream consumption. `chat_delivery` logs delivered batch count, successful checkpoint append count, cumulative delivery-validation/persistence milliseconds and time to first dispatched text since accepted-stream delivery setup. These counters contain no prompts, answer text, IDs, native facts or credentials. Existing usage records remain the source for planning/answer phase durations. Checkpoint counts exclude turn acceptance, evidence storage, usage accounting and lifecycle writes.

Verification:

- **700 focused tests** passed, including 11 new batching/checkpoint tests covering order, timer boundaries, buffer/answer bounds, cancellation, revocation, slow writes and surfaced persistence failure.
- All **14 authenticated Reports browser tests** passed, including all-nine card/native parity, 25 configurations, replay/history, scope denial and revocation. The Stop test explicitly observes displayed text before persistence, waits for its durable checkpoint, then verifies incomplete report facts are not restored.
- **21 private-evidence/database groups**, agent/web typechecks and targeted lint passed. No new UI markup was introduced; existing canonical stories remain applicable.
- Two opt-in fictional provider journeys passed. Overview produced **86 provider fragments -> four delivered batches -> one transcript append**; Leads produced **88 -> four -> one**. Cumulative delivery-validation time was about 165/200 ms and persistence about 18/19 ms. Existing code would have appended once per nonempty provider fragment and repeatedly updated turn state.
- Observed submit-to-validated-card times were **14.868 s (Overview)** and **8.352 s (Leads)**, versus earlier single samples of 23.316/19.586 s. These are small, non-controlled development samples affected by provider variability and compilation, not a promised latency reduction or p95 result. Time to first dispatched text was 8.446/5.828 s from delivery setup; first provider answer text arrived after 2.652/1.116 s from answer-stream consumption.

No schema/dependency change, new infrastructure, production change or weaker authorization cache is required. Model-context/tool-schema reduction, faster planning, revision-based report validation and production-scale latency/concurrency profiling remain separate reviewable follow-ups.

### Database amplification reduction: measured baseline — November 9, 2026

The approved sequence is measurement, authorization consolidation, evidence batching, removal of unused persistent graph checkpoints, notification-driven cancellation, then accounting/concurrency tuning. Implement and review one slice at a time. Proposed acceptance targets for a short authorized Leads question are at least 75% fewer database calls than baseline and fewer than 60 total driver calls, including transaction control. These targets are not yet achieved. Preserve fresh per-delivery-batch authorization, quota reservations, cancellation, confirmation boundaries and partial-transcript recovery; no time-based permission cache or Redis dependency is introduced.

The first slice adds opt-in `CHAT_DB_METRICS=true` instrumentation to the application, authentication and graph PostgreSQL clients. A request-scoped async context isolates concurrent turns and attributes calls to request, acceptance, runtime, tools, delivery, transcript checkpoint, finalization and cancellation. The handler emits one content-free `chat_database` JSON log and returns an independent random `X-Chat-Database-Metrics-Id` for correlation. No SQL, bindings, result rows, errors, prompts, user IDs, workspace IDs or turn IDs enter these metrics; metrics are not written to the database. The flag defaults off.

Counters distinguish reads, writes, transaction-control calls, other commands, failed calls, pending calls and unsupported completion APIs (`unobserved`). Timings sum client-query durations, including driver queue time, not pool-acquisition time or total elapsed request time. Concurrent durations can overlap. A driver invocation is one call, not a row count; a multi-statement SQL string is still one invocation. Knex's cold-connection version/search-path bootstrap before its `afterCreate` hook is excluded. Coverage starts inside the turns handler: middleware, browser history/card fetches and a separate Stop HTTP request are not included. Row scans, lock-wait attribution and pool saturation still require separate profiling. The final report waits for an already-in-flight cancellation check asynchronously without delaying stream closure.

Deterministic authenticated local baseline (one sample per workload, isolated fictional workspace, routing off):

| Workload | Total calls | Reads | Writes | Transaction control | Summed query ms |
|---|---:|---:|---:|---:|---:|
| Fresh Leads pipeline summary | 423 | 297 | 42 | 84 | 760 |
| Same-thread Leads follow-up | 432 | 307 | 41 | 84 | 524 |
| Applied Leads report | 461 | 332 | 43 | 86 | 534 |
| Lead creation proposal, not confirmed | 422 | 293 | 45 | 84 | 447 |
| Longer Leads stream, 12 timed fragments | 600 | 449 | 43 | 108 | 661 |

These are real database calls through the current authorization/history/tool/evidence/delivery/graph paths. The benchmark-only model performs real planning/answer budget reservations and finalization with explicitly fictional token usage; it makes no provider requests. It is gated by the existing isolated, non-production fixture-provider checks. Counts are not production latency or live-model output guarantees; evidence/history, billing settings, output batches and elapsed time can change them. The fresh sample also includes cold route compilation in its approximately five-second HTTP duration, which is not the summed query time.

The fresh Leads sample breaks down into 336 application, 42 authentication and 45 graph calls. Its execution phases are request 29, acceptance 16, runtime 300, tools 34, cancellation 6, delivery 13, transcript checkpoint 15 and finalization 10. All five samples completed with zero failed, pending or unobserved calls. Graph persistence alone adds 45 calls per turn (26 writes, 18 transaction-control calls and one read). Each delivered Leads text batch adds 13 calls in this fixture; 12 batches contribute 156 calls in the longer stream. A single transcript checkpoint is therefore not a single database call.

Reproduce without paid model requests:

```sh
DEBUG=pw:webserver CHAT_DB_METRICS=true CHAT_INTENT_ROUTING=false \
  pnpm --filter @salesmora/web test:e2e e2e/chat-reports.spec.ts \
  --grep 'benchmark deterministic chat database workloads' --reporter=line --max-failures=1
```

Match each `CHAT_DATABASE_BENCHMARK` workload to its `chat_database` record by measurement ID. Unit tests cover concurrent isolation, async timers, callback and promise semantics, transaction classification, error propagation, privacy and unsupported APIs. The benchmark verifies successful terminal events and both completed usage records. The next slice is authorization consolidation; none of the measured permission checks, graph writes or cancellation polls has been removed yet.

#### First reduction: batched history proposal discovery

The deep dive reprioritized history amplification ahead of authorization consolidation. Previously `readThreads` ran 12 proposal-family visibility helpers for every completed turn, even when the turn had no proposal. An ordinary completed Leads-summary turn caused 13 empty reads: 11 cross-domain proposal lookups plus the Lead action lookup and its redundant turn read. With 49 completed ordinary turns, this added 637 reads before model-history trimming.

The first reduction replaces those empty probes with a single user/workspace/turn-scoped `UNION ALL` presence query across the 12 proposal tables. It runs only when completed turns exist. Presence is not authority: every existing visibility helper still loads and validates an actual proposal, including its state, ownership, expiry, authorization, evidence and deletion receipt checks. Neither the 50-turn UI history window nor the runtime's later 12-message/character limits change. Proposal creation/confirmation, fresh streaming authorization and transcript durability are unchanged. Existing Customer and Work Order result hydration already checks for a saved result and is untouched.

The batch reduces driver round trips; its 12 branches still do database work. It does not eliminate per-proposal validation, broad evidence fingerprints or hydration of actual older proposals. A runtime-specific bounded history read and authorization consolidation remain subsequent work; this is not the final history/scaling design.

Measured deterministic comparisons:

- The two-turn ordinary Leads runtime phase fell from 313 to 301 calls: one batch replaces 13 absent-proposal reads, saving 12. Whole-request counts also vary with cancellation timing and cold feature flags, so those incidental differences are not attributed to this change.
- A new full-window regression seeds 48 ordinary completed turns alongside one real pending Lead proposal, then asks a new question in that thread (50 turns total). The runtime phase measured 303 calls and the complete request measured 423, with zero failed, pending or unobserved calls. Its proposal discovery/validation needs three reads (one batch plus the existing action/turn reads), rather than the source-derived previous 637 reads for those 49 completed turns: 634 fewer. The old 50-turn path was not separately benchmarked.
- Fresh one-turn workloads skip discovery, so this slice intentionally leaves their fixed overhead unchanged.

Validation includes constant one-query discovery for 1, 49 and 50 requested IDs, no query for empty input, scoped SQL bindings, correct per-domain presence and propagated failures. The real-database regression checks one-call discovery with 49 actual completed turns, user/workspace isolation, retained proposal presentation through HTTP, denied foreign-user history and successful full-window follow-up. Nine deterministic Reports journeys and the five existing query-benchmark workloads also passed. No provider requests or dependency/migration changes were needed.

Reproduce the full-window regression with the baseline command above, changing `--grep` to `'history batches'`. The `history-50` benchmark record identifies its follow-up measurement.

#### Second reduction: coherent capability discovery per model boundary

Planning and answering previously each called the tools, Lead-operation, Customer-operation and Capture-operation callbacks separately. Each callback independently loaded session validity and turn authorization/evidence. The runtime now requires one complete `RuntimeCapabilities` result, and the web implementation derives all four lists synchronously from one freshly loaded authorization context. Each model boundary gets its own fresh result; nothing is cached across planning, tool execution, answering or delivery, and no time-based permission cache is introduced.

Pre-execution operation checks also load fresh capabilities instead of using the planning result. Independent tool/operation authorization, handler/database authorization, per-batch session/evidence checks, transcript checkpoints, cancellation polling, quota accounting, graph persistence and proposal confirmation remain unchanged. The model still receives the same list types in the same argument positions; provider prompts, routing flag and model selection are unchanged. This slice does not yet consolidate the six reads inside each workspace authorization transaction.

For the simple Leads fixture, four 12-call capability loads become one before planning and one before answering: six redundant loads are removed, saving 72 driver calls (60 reads and 12 transaction-control calls), including 12 authentication-pool reads. Runtime phase comparisons isolate that change from duration-dependent cancellation polling and cold flag reads:

| Workload | Previous runtime calls | New runtime calls | New full-request calls |
|---|---:|---:|---:|
| Fresh Leads summary | 300 | 228 | 346 |
| Same-thread Leads follow-up | 301 | 229 | 347 |
| Applied Leads report | 286 | 208 | 381 |
| Lead creation proposal | 300 | 228 | 349 |
| Longer Leads stream | 300 | 228 | 528 |
| Full-window history with one Lead proposal | 303 | 231 | 350 |

Report savings are 78 rather than 72 calls because post-read report-evidence validation also repeats its two-call fingerprint; its pre-planning capabilities still have no report evidence. Full-request totals are single deterministic samples and also vary with cancellation timing and feature-flag warmness. No production-scale or live-provider speed claim follows from these counts. All six measurements had zero failed, pending and unobserved calls.

Validation: 240 focused agent/history/delivery/measurement tests, agent/web typechecks and scoped lint passed. New graph regressions verify one complete snapshot per model boundary, refreshed answering capabilities, failure before model invocation, and operation revocation between planning and execution. Eleven authenticated deterministic tests passed: nine Reports journeys, the five-workload benchmark, and the full-window proposal/ownership regression. No provider requests, dependencies or migrations were needed. The next reduction can address the underlying authorization reads and duplicate pre-tool checks without weakening fresh execution/delivery boundaries.

#### Third reduction: joined workspace authorization context

The shared authorization loader now replaces five sequential context reads with one joined read after the existing workspace lock has been acquired. The join includes the active, undeleted user, their workspace membership, the persisted policy head and **all** workspace role grants, not just the current member's grants. Existing schema/policy validation and the Owner/ownerId invariant still apply. Missing membership/user/policy, empty or invalid grants and deleted/suspended identities still deny; workspace suspension retains its specific error.

The lock remains a separate `FOR SHARE`/`FOR UPDATE` query before context loading. A standalone authority transaction falls from eight calls to four (`BEGIN`, lock, joined context, `COMMIT`). No fresh check is removed or reused across boundaries: capability discovery, pre-tool checks, handler authorization, streaming delivery, evidence validation and transcript persistence still load fresh authority. No permission cache, graph/accounting/cancellation changes or migration is introduced.

Deterministic authenticated measurements, routing off:

| Workload | Previous total calls | New total calls | Reads | Writes | Transaction control | Previous runtime calls | New runtime calls |
|---|---:|---:|---:|---:|---:|---:|---:|
| Fresh Leads summary | 346 | 254 | 140 | 42 | 72 | 228 | 172 |
| Same-thread Leads follow-up | 347 | 255 | 142 | 41 | 72 | 229 | 173 |
| Applied Leads report | 381 | 285 | 168 | 43 | 74 | 208 | 160 |
| Lead creation proposal | 349 | 258 | 141 | 45 | 72 | 228 | 172 |
| Longer Leads stream | 528 | 387 | 248 | 43 | 96 | 228 | 172 |
| Full-window history with one Lead proposal | 350 | 257 | 144 | 41 | 72 | 231 | 175 |

Fresh Leads saves 92 calls (26.6% against the preceding slice), including 56 runtime calls; each delivered Leads batch drops from 13 to nine calls. Proposal polling increased by one call and long-stream/history polling decreased by one, so their total differences are not entirely authorization savings. All six measurements had zero failed, pending and unobserved calls. Against the original 423-call fresh baseline, 254 is about 40% lower: the 75% reduction and fewer-than-60-call targets remain unmet. These are database-work measurements, not live-provider latency guarantees.

Validation: 240 focused agent/history/delivery/measurement tests, 20 PostgreSQL authorization checks, data/web typechecks and scoped lint passed. Eleven authenticated deterministic tests passed, covering nine Reports journeys, all five benchmark workloads and the full-window proposal/ownership regression. The authorization rehearsal now uses a task-owned temporary database instead of a scratch schema: current migrations explicitly target `admin`/`public`, causing schema collisions or missing tables during isolated-schema replay. It requires `CREATEDB`, replays the real migrations, and removes only its own database; existing shared test/development tables remain untouched. Regressions verify exact four-call loading, complete contexts for every role, missing/disabled state denial, no protected callback on missing policy/empty grants, and membership writers blocking behind the actual authorization wrapper's read lock.

Next: consolidate duplicate pre-tool authorization checks at genuine execution boundaries, preserving independent delivery authorization and revocation behavior. Empty evidence writes and unused persistent graph checkpoints remain later reductions.

#### Fourth reduction: one coherent pre-tool check and one Lead handler gate

The graph now loads one fresh complete capability snapshot for **each** tool invocation and uses it to check both the tool and its Lead/Customer/Capture operation. It no longer separately reloads tool authority and Lead-operation authority before requesting the same operation capability list. Planning and answering still get separate fresh snapshots, and a second tool invocation reloads again rather than inheriting the first tool's snapshot.

The Leads dispatcher now only parses the closed operation envelope and routes it. Every operation handler retains its own fresh session/turn-evidence/tool/operation check, including paths that return clarification without accessing a record. The protected database use cases retain their independent workspace locks and record/field authorization. A graph capability check is not sufficient to bypass a handler check. Fresh per-batch delivery, evidence validation, confirmation, quota accounting, transcript recovery, cancellation and graph persistence are unchanged; no time-based cache or cross-boundary snapshot reuse is introduced.

For one Lead invocation, three graph authority loads become one, saving 16 calls; removing the dispatcher repeat saves another eight. A short Lead request therefore saves **24 structural calls** (18 reads and six transaction-control calls), not 25: the latest fresh sample also had one fewer cancellation poll.

| Workload | Previous total calls | New total calls | Previous runtime calls | New runtime calls | Previous tool-phase calls | New tool-phase calls |
|---|---:|---:|---:|---:|---:|---:|
| Fresh Leads summary | 254 | 229 | 172 | 156 | 22 | 14 |
| Same-thread Leads follow-up | 255 | 230 | 173 | 157 | 22 | 14 |
| Applied Leads report | 285 | 285 | 160 | 160 | 51 | 51 |
| Lead creation proposal | 258 | 234 | 172 | 156 | 25 | 17 |
| Longer Leads stream | 387 | 363 | 172 | 156 | 22 | 14 |
| Full-window history with one Lead proposal | 257 | 232 | 175 | 159 | 22 | 14 |

Fresh/follow-up/full-window cancellation each fell by one poll; proposal and long-stream polling were unchanged. Report counts intentionally do not improve: its graph already had one authority load and does not use the Leads dispatcher. All six benchmark measurements, and all 25 measured requests in the run, had zero failed, pending and unobserved calls. The original fresh baseline of 423 is now 229 (about 46% lower), still short of the 75% reduction and fewer-than-60-call targets. The provider model, prompts and tool schemas are unchanged; these deterministic counts do not establish live-model latency.

Validation: 261 focused agent/handler/history/delivery/measurement tests, agent/web typechecks and scoped lint passed. New regressions verify one execution snapshot, tool revocation even when the operation remains available, operation revocation for Leads/Customers/Capture, fresh checks between two tools, and no answer after an independent handler denial. All 13 Lead operations deny before protected work or clarification; successful pipeline and missing-field paths authorize exactly once in their handler. Eleven authenticated deterministic tests passed, including nine Reports journeys, all five workload benchmarks and full-window proposal/ownership coverage.

Next: skip or batch empty/unchanged evidence writes, then address unused persistent graph checkpoints. Those fixed costs remain in the measured request; this slice does not remove independent record or delivery authorization.

#### Fifth reduction: empty additions and unchanged evidence updates

The additive Lead, lead-search and Calendar-proposal evidence helpers now validate the supplied additions and return without opening a transaction when there is nothing to add, following the existing Estimate/Report helper pattern. An empty addition does not clear stored provenance, authorize a request or assert that existing evidence remains valid. Runtime history loading, the subsequent page-reference and model capability checks, independent tool handlers and fresh per-delivery authorization remain responsible for their own boundaries. An empty-result search still has a nonempty source binding and is not discarded.

Nonempty additions continue through the existing fresh workspace authorization, active-turn checks and evidence validation. Only after those checks succeed does an unchanged merged value skip its redundant `UPDATE`. New bindings, changed Lead versions and changed owner stamps still persist. Lead equality compares the actual typed fields rather than serialized property ordering, and merging continues to preserve a stored owner stamp when incoming evidence omits it. The helpers do not cache authorization, remove evidence limits or batch unrelated domains into a long-lived transaction.

Deterministic authenticated measurements, routing off:

| Workload | Previous total calls | New total calls | Reads | Writes | Transaction control | Previous runtime calls | New runtime calls |
|---|---:|---:|---:|---:|---:|---:|---:|
| Fresh Leads summary | 229 | 211 | 112 | 39 | 60 | 156 | 138 |
| Same-thread Leads follow-up | 230 | 212 | 114 | 38 | 60 | 157 | 139 |
| Applied Leads report | 285 | 267 | 159 | 40 | 68 | 160 | 142 |
| Lead creation proposal | 234 | 214 | 112 | 42 | 60 | 156 | 138 |
| Longer Leads stream | 363 | 345 | 221 | 40 | 84 | 156 | 138 |
| Full-window history with one Lead proposal | 232 | 214 | 116 | 38 | 60 | 159 | 141 |

All six runtime phases save exactly **18 calls**: three empty transactions previously performed nine reads, three writes and six transaction-control calls. Proposal polling also fell by two calls, so its whole-request reduction is 20 rather than 18. All other benchmark poll counts were unchanged. All six benchmark measurements, and all 25 measured requests in the run, had zero failed, pending and unobserved calls. The original 423-call fresh baseline is now 211 (about **50% lower**); the 75% reduction and fewer-than-60-call targets remain unmet. Provider/model latency is not measured by this deterministic benchmark.

Validation: 290 focused agent/handler/evidence/history/delivery/measurement tests, web typecheck and scoped lint passed. The 29 new evidence tests cover zero-query empty additions, malformed-input rejection before transactions, unchanged-value revalidation without updates, revoked/missing/inactive-turn denial, new-binding persistence, changed Lead versions/owner stamps, preserved omitted owner stamps and rejection of newly merged unauthorized evidence. Eleven authenticated deterministic tests passed, including nine Reports journeys, all five workload benchmarks and full-window proposal/ownership coverage. No schema, provider, UI or dependency changes were needed.

Next: inspect and remove unnecessary persistent graph checkpoints while preserving the canonical transcript, cancellation and terminal recovery behavior. Graph persistence still contributes 45 calls per measured turn.

#### Sixth reduction: no persistent graph checkpoints for live turns

The live web runtime no longer creates a PostgreSQL saver or a separate graph connection pool. Each bounded graph executes from its supplied messages and fresh server capabilities without checkpoint persistence. The agent dependency is optional so diagnostic tests can still inject an in-memory saver and verify that graph state contains only IDs/phases, not prompts, tool payloads or proposal contents. Synchronous durability is requested only when such a saver is explicitly supplied.

The removed state was never used to resume execution: every accepted turn starts a fresh graph, and provider calls/proposals are not automatically replayed. Canonical `chatThreads`/`chatTurns`/`chatMessages`, evidence bindings, five-second/size-boundary/final transcript checkpoints, persisted completion before terminal events, Stop polling, session/record authorization, budget reservations/finalization and expired-lease recovery remain unchanged. Exact client-turn retries still reconcile existing state instead of regenerating. No in-memory transcript replacement, Redis dependency or checkpoint-table drop is introduced.

Historical migrations and the PostgreSQL saver package remain required for
replay. A subsequent staged migration retires the four graph tables only if
the three data tables are empty; it does not erase retained rows. Current web
and worker startup require that migration, and all old processes must be
drained before it runs. The transcript and admin audit archives are separate.
No existing database has been migrated as part of this staging.

Deterministic authenticated measurements, routing off:

| Workload | Previous total calls | New total calls | Reads | Writes | Transaction control | Previous runtime calls | New runtime calls |
|---|---:|---:|---:|---:|---:|---:|---:|
| Fresh Leads summary | 211 | 166 | 111 | 13 | 42 | 138 | 93 |
| Same-thread Leads follow-up | 212 | 167 | 113 | 12 | 42 | 139 | 94 |
| Applied Leads report | 267 | 223 | 159 | 14 | 50 | 142 | 97 |
| Lead creation proposal | 214 | 169 | 111 | 16 | 42 | 138 | 93 |
| Longer Leads stream | 345 | 302 | 222 | 14 | 66 | 138 | 93 |
| Full-window history with one Lead proposal | 214 | 169 | 115 | 12 | 42 | 141 | 96 |

Every runtime phase saves exactly **45 calls**: one read, 26 writes and 18 transaction-control calls. All six completed benchmark measurements have zero graph calls and zero failed, pending or unobserved calls. Report polling increased by one call; the longer stream had one fewer cancellation poll and three additional delivery-phase reads, so their whole-request differences are 44 and 43 rather than 45. These timing-dependent differences are not attributed to graph persistence. The original 423-call fresh baseline is now 166 (about **61% lower**), with writes reduced from 42 to 13. The 75% reduction and fewer-than-60-call targets remain unmet; these are not live-model latency guarantees.

Validation: 296 focused agent/handler/evidence/history/delivery/measurement/migration tests, agent/data/web typechecks and scoped lint passed. Thirteen authenticated deterministic tests passed: nine Reports journeys, all five workload benchmarks, full-window proposal/ownership coverage, canonical history/replay/expired-lease recovery and persisted Stop during an accounted graph stream. Tests verify no rows in any of the three graph tables for new turns, exact saved-versus-streamed transcript text, one canonical turn and only two usage records after retries, interrupted recovery without regeneration, and cancelled terminal/usage state after Stop. The expired-lease test simulates dead-process persisted state rather than actually restarting the server. Optional in-memory-saver tests retain privacy coverage; saver-free tests cover execution, abort, access denial, tool failure and allowance denial.

Across all 29 measured requests, graph calls were zero. The intentional Stop sample captured one pending runtime database call at the final metric snapshot (zero failed/unobserved), although its final usage records were verified. Completed benchmark comparisons above exclude that cancellation-tail measurement; it must not be interpreted as a complete stopped-request count.

Next: notification-driven cancellation with missed-notification recovery, then remaining fixed authorization/accounting/calendar overhead.

#### Seventh reduction: notification-driven Stop cancellation

Stop now publishes a PostgreSQL notification in the same transaction that changes an active turn to cancelled. PostgreSQL delivers it after commit. A process-local listener receives only the validated turn UUID and wakes the turn watcher, which reloads persisted state before aborting; the notification is a wake-up hint, never authorization. Repeated Stop requests that do not change an active turn do not publish duplicate notifications.

The watcher retains a five-second persisted-state check as recovery for missed notifications, listener disconnects and reconnect attempts. If the listener cannot be configured or connected, the check continues without it. A status-query failure is logged without turn content and aborts the run as unavailable rather than being treated as a successful cancellation. This removes the prior 250 ms database polling interval without adding Redis or weakening transcript, authorization, usage-accounting or cancellation-state boundaries.

Validation: nine focused listener/watcher tests passed, including transaction-bound publishing, authoritative state checks, missed-notification recovery, listener reconnect, unavailable-listener behavior and cleanup. Data/web typechecks and scoped lint passed. The isolated authenticated persisted-Stop browser regression passed once and verified the cancelled terminal event, canonical transcript state and usage outcomes. A subsequent metrics-enabled rerun stopped during fixture setup because registration returned HTTP 429, before exercising chat; therefore no new end-to-end cancellation query count is claimed.

#### Eighth reduction: no cancellation polling, completion-only answers — November 12, 2026

The approved durability change removes the five-second cancellation fallback and every timed or size-triggered partial-response write. [Transcript delivery](../apps/web/src/server/chat/transcript-delivery.ts) retains at most 32,000 characters in memory; the agent's existing 16,000-character generation limit and 8,000-character batch limit remain. On success, the full assistant text and completed state commit together in one freshly authorized transaction before `turn.completed`. Stop, disconnect, provider failure, access denial or process loss discards the unsaved answer. User messages, accepted turns, evidence/proposal records and usage accounting are still durable; this is not removal of lifecycle or quota writes. Existing saved history remains readable.

The cancellation watcher waits for `LISTEN` readiness, performs one initial persisted-state check to close the subscribe/Stop race, then checks only when a valid notification arrives. A notification during an in-flight check queues a recheck instead of being lost. There are no periodic status queries or automatic reconnects for active turns. Listener setup failure or disconnect aborts the affected run as unavailable; new turns can reconnect. Connection and LISTEN-query timeouts are five-second deadlines, not polling intervals. Fresh per-batch authorization and active-state checks remain; those are delivery-triggered database calls, not background polling. The SSE heartbeat is a network comment, not a database query.

Cancellation still uses PostgreSQL because a separate authenticated Stop request may reach a different web process. The Stop endpoint checks current authority and turn ownership, persists cancelled state, then publishes `pg_notify` in the same transaction. The receiving watcher performs a state read before aborting the provider. The shared `LISTEN` command is issued once per connection, not once per chunk or five seconds. Stop calls are separate from the measured turns request. Removing PostgreSQL from this control path would require a replacement cross-process control transport and explicit durability/recovery decisions.

Operation-level metrics now group calls by fixed `phase:operation` labels without retaining SQL, bindings, data or identities. Labels cover runtime session checks, turn-evidence validation, history, page context, Calendar clock and model-usage reservation/finalization; remaining calls are explicitly unattributed. They partition existing counts and do not add database work.

The exact live-model question **"what are the current open leads?"** was repeated three times through the isolated authenticated benchmark with routing off:

| Sample | Total calls | Reads | Writes | Transaction control | Other | Cancellation calls |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 170 | 115 | 12 | 42 | 1 | 2 |
| 2 | 263 | 196 | 13 | 54 | 0 | 1 |
| 3 | 166 | 112 | 12 | 42 | 0 | 1 |

The first request includes the shared listener's one `LISTEN` command; all three have one initial status read and no periodic cancellation queries. All three completed with zero failed, pending and unobserved measured calls. Median calls are **170**, but these live-model samples chose variable response paths and delivered two/six/two text batches. This is not a controlled claim that the changes alone reduce 263 to 170. The six-batch sample still needs 78 delivery calls; fresh delivery authorization has deliberately not been removed.

Runtime operation counts are now explicit:

| Runtime operation | Sample 1 | Sample 2 | Sample 3 |
|---|---:|---:|---:|
| History | 8 | 8 | 8 |
| Page context | 5 | 5 | 5 |
| Session checks | 15 | 15 | 15 |
| Turn-evidence checks | 30 | 38 | 30 |
| Calendar clock | 6 | 6 | 6 |
| Model-usage reservations | 18 | 18 | 18 |
| Model-usage finalization | 8 | 8 | 8 |
| Unattributed | 3 | 3 | 3 |
| **Total runtime** | **93** | **101** | **93** |

The deterministic benchmark measured 161/158/211/160/256 calls for fresh Leads/follow-up/report/proposal/long-stream. The seven-second long stream retained only one cancellation check and no transcript-checkpoint phase. Measurements retain the previously documented exclusions and are not production p95 or row-scan measurements.

Validation: 122 focused tests, data/web typechecks and scoped lint passed. Five isolated deterministic tests passed, covering all five workload measurements, canonical transcript/replay recovery, persisted Stop with an empty saved answer, provider failure without saved partial text and the browser Stop/reload journey after more than five seconds of unsaved visible text. The three-sample live-model benchmark passed. Notification-triggered checks retain the subscribing turn's async measurement context rather than inheriting the shared listener connection's context. No UI markup or model selection changed.

#### Ninth reduction: consolidate session and turn checks — November 12, 2026

The approved authorization slice removes repeated cookie authentication inside the running turn, not session revocation enforcement. The request entry still authenticates through Better Auth. Its server-owned session ID is then passed explicitly to the live runtime and completion boundary. Each fresh [turn-evidence validation](../apps/web/src/server/chat/store.ts) includes an `EXISTS` predicate for that exact session, matching user and unexpired database expiry, in the existing owned-turn query. Workspace authorization independently reloads active-user, membership and policy state as before. No session token, identity or role supplied by the browser/model is trusted and no permission snapshot is cached across boundaries.

Streaming validation also checks active state and lease from the already-read turn instead of querying it again. Successful completion checks the session in its locked turn read before saving text and terminal state. Structured result events, including Lead proposals, retain a fresh session/evidence check immediately before release, even after durable completion.

Generic `retrieving`/`preparing_draft` progress events contain no private payload and now only check the abort signal instead of loading authorization again. Planning, pre-tool capability checks, independent tool handlers, answering, every private text batch, sources, result events and completion retain their fresh boundaries. The runtime's final capability reload and the route's unconditional post-runtime checks were removed: sources are checked only when present, result payloads have their own checks, and text/final persistence already have authoritative checks. The duplicate session check immediately before completion is removed for the same reason.

Deterministic comparisons against the preceding slice:

| Workload | Previous total calls | New total calls (first selected run) |
|---|---:|---:|
| Fresh Leads summary | 161 | 112 |
| Same-thread Leads follow-up | 158 | 109 |
| Applied Leads report | 211 | 155 |
| Lead creation proposal | 160 | 116 |
| Longer Leads stream | 256 | 163 |

The selected fresh sample includes one shared `LISTEN` command and three cold request reads. A later warm fresh sample measured **108**, with 62 reads, 12 writes and 34 transaction-control calls. The long-stream sample in that run measured 166 because its request phase had three additional reads. All listed completed measurements reported zero failed, pending and unobserved calls. Runtime for the simple Leads fixture falls **93 -> 65** calls: history 8, page context 5, turn-evidence 20, Calendar clock 6, usage reservation 18 and usage finalization 8. Separate runtime session calls disappear because session validity is now checked within the turn read. Each simple delivered batch falls **9 -> 5** calls; more complex evidence still costs additional reads.

The same exact live-model question **"what are the current open leads?"**, routing off and isolated fictional workspace, measured:

| Sample | Total calls | Reads | Writes | Transaction control | Other | Runtime calls | Delivery calls |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 117 | 68 | 12 | 36 | 1 | 65 | 10 |
| 2 | 186 | 125 | 13 | 48 | 0 | 69 | 54 |
| 3 | 186 | 125 | 13 | 48 | 0 | 69 | 54 |

All three completed with zero failed, pending and unobserved measured calls. Model-selected paths and batching still vary; the new live median of 186 must not be interpreted as a regression against the prior 170 median from different responses. Deterministic comparisons above isolate the repeated-check reduction more directly. The original scaling targets remain unmet. Accounting, Calendar context, history hydration and remaining independent authorization transactions are not redesigned by this slice.

Validation: 132 focused tests, data/web typechecks, scoped lint and whitespace checks passed. Coverage includes SQL-shape and constant-call tests for combined session/turn checks, session-constrained completion denial, independent revalidation, inactive/expired-turn rejection and completed-result validation. Twenty isolated deterministic tests passed across validation runs: all nine Reports journeys, all 25 report configurations, context clearing, workload benchmarks, replay/recovery, Stop, provider failure, history, scope and Financial revocation. A new authenticated streaming matrix verifies expired/deleted sessions, suspended users, revoked `assistant.use`, cancelled turns and expired leases release no private text and save no answer. The live three-sample benchmark passed. No UI components, model selection, business confirmation boundaries or polling behavior changed.

#### Post-consolidation measurement check — November 12, 2026

The exact live-model question **"what are the current open leads?"** was repeated three more times with database metrics enabled, intent routing off and isolated fictional records. All three turns completed with zero failed, pending and unobserved measured calls. No application behavior was changed for this check.

| Phase | Sample 1 | Sample 2 | Sample 3 |
|---|---:|---:|---:|
| Request / remaining route work | 10 | 16 | 16 |
| Acceptance | 12 | 12 | 12 |
| Runtime | 65 | 69 | 69 |
| Tools | 11 | 23 | 23 |
| Text delivery | 10 | 27 | 45 |
| Final answer persistence | 7 | 11 | 11 |
| Cancellation | 2 | 1 | 1 |
| **Total** | **117** | **159** | **177** |
| Reads | 68 | 104 | 118 |
| Writes | 12 | 13 | 13 |
| Transaction control | 36 | 42 | 46 |
| Other | 1 | 0 | 0 |

Median calls were **159**. Sample 1 includes one shared `LISTEN` command; each sample has one startup cancellation status read and no polling or partial-response writes. Samples 2 and 3 have identical phase counts except delivery: three versus five batches at nine calls each explain their entire 18-call difference. The request phase also includes structured-result checks executed after the runtime returns; it is not exclusively HTTP preflight.

Runtime remains history 8, page context 5, turn-evidence 20/24/24, Calendar clock 6, usage reservation 18 and usage finalization 8. The 26 accounting calls comprise two model-phase reservations and two settlements, including locks, allowance reads, inserts/updates and transaction control.

The [search evidence validator](../packages/data/src/leads/chat-search.ts) reloads the saved snapshot and reruns the authorized filtered search to compare it. For these simple search snapshots that adds four reads per validation: source snapshot, workspace timezone, matching count and bounded rows. Consequently a delivery check costs nine calls instead of the aggregate path's five; repeated checks redo collection data work as well as permissions. This preserves current snapshot consistency but is the main variable amplification to redesign. The [search handler](../apps/web/src/server/chat/leads/search.ts) also independently revalidates after storing the snapshot, in addition to its handler/read boundary. History hydration, page context and Calendar clock together account for another 19 runtime calls. These are candidates for the next design discussion, not checks removed by this measurement.

The benchmark covers the instrumented turns handler and excludes middleware, separate Stop requests and browser/history/card fetches. Counts include transaction control and are not row-scan or production latency measurements. The existing benchmark checks completion, not factual answer correctness.

#### Tenth reduction: snapshots, accounting and shared runtime setup — November 12, 2026

The approved consistency contract is now a **timestamped search snapshot with current access checks**, rather than a live search rerun before every text batch.

- New Lead search results carry `asOf`; the canonical result card renders it in UTC, and model instructions identify search counts/fields as historical facts. Ordinary stage/name/version edits and new matching records do not rewrite or invalidate a workspace snapshot. Native navigation still checks current access.
- Modern snapshot validation checks current collection scope, archive permission, displayed record access and membership for historical owner names. It reuses the already-loaded current turn and batches inherited source-turn reads. It does not rerun filtered counts, date bounds or the sorted search window. Removed members and workspace-to-assigned scope changes still deny delivery.
- Assigned snapshots retain a private fingerprint of the full currently accessible assigned record set, not just the first ten rows. Reassignment/deletion/archive access loss outside the displayed window therefore also invalidates historical scoped totals. This is intentionally conservative: adding an accessible assigned lead can also invalidate the snapshot. It requires a scoped ID aggregate, not a filtered search or row-version fingerprint. Older snapshots without a timestamp retain strict requery validation; their timestamp is not invented.
- The search handler no longer independently reruns evidence validation immediately after its authorized snapshot transaction. Fresh authorization remains at private model/browser delivery, completion, history, navigation and confirmation boundaries.
- Accounting now uses five calls per reservation and one per settlement, down from nine and four. Two model phases use **12 instead of 26** accounting calls. The allowance query still reads the ledger/default/override/billing state, after the advisory lock is acquired; statement consolidation is not elimination of those underlying reads. The same quota locks, UTC clock, unknown-usage holds and idempotent finalization remain.
- New threads use the just-accepted user input without a second UI-history load. Follow-ups load at most 13 turns, sufficient for the existing last-12-message prompt window, and omit display-only expired-turn recovery. Display history remains at 50 turns with recovery. Applicable proposal/result visibility and inherited evidence checks remain.
- Page reference, exact session/active-turn validation and initial capability preparation share one authorized setup transaction. Only the initial planning capability callback consumes that context; later capability/tool/private-release checks reload authority. Calendar-capable turns obtain timezone/today through **one query inside that transaction**, instead of a separate six-call Calendar transaction and another capability check. The clock is deliberately retained for off-page relative-date Calendar questions; no keyword-based routing or permission cache was added.
- The application still has no cancellation polling, partial transcript persistence or live graph checkpoints. Business writes still require their existing explicit browser confirmation.

Verification: **253 focused unit tests**, **45 disposable-database Leads checks**, isolated accounting concurrency/default/billing/UTC checks, **21 authenticated deterministic journeys**, and **three real-model turns** passed. The timestamp story passed interaction, Axe and overflow checks at 1440px and 320px. Data/agent/UI/web typechecks, scoped lint and whitespace checks passed. The older search suite's expectations were updated for the snapshot contract but that suite was not run because it globally deletes shared rate-limit rows; the safe Reports suite covers snapshot retention, inherited answers and assignment revocation. A cold development compile initially delayed Stop until provider work finished; the regression now compiles the cancel endpoint with an invalid request before timing the finite cancellation fixture, without changing production behavior.

| Deterministic workload | Measured calls after |
|---|---:|
| Fresh Lead summary, warm process | **71** (previous warm **108**) |
| Lead follow-up | 79 |
| Applied Leads report | 118 |
| Explicit Lead proposal | 79 |
| Twelve-batch long stream | **126** (previous **163**) |
| Follow-up from a 49-turn displayed history | 79 |

The history case now hydrates only the bounded runtime window; the separately fetched display history and its proposal are still present. Driver-call measurements do not measure rows scanned.

The exact live question **"what are the current open leads?"**, intent routing off, completed with:

| Phase | Sample 1 | Sample 2 | Sample 3 |
|---|---:|---:|---:|
| Request / remaining route work | 17 | 7 | 7 |
| Acceptance | 12 | 12 | 12 |
| Runtime | 30 | 28 | 28 |
| Tools | 14 | 11 | 11 |
| Text delivery | 35 | 15 | 15 |
| Final persistence | 9 | 7 | 7 |
| Cancellation | 2 | 1 | 1 |
| **Total** | **119** | **81** | **81** |
| Reads | 74 | 44 | 44 |
| Writes | 12 | 11 | 11 |
| Transaction control | 32 | 26 | 26 |
| Other | 1 | 0 | 0 |

All samples had zero failed, pending or unobserved measured calls. Sample 1 searched rows, delivered five batches at seven calls each, and includes the shared `LISTEN` plus initial request overhead. Samples 2 and 3 used the cheaper summary path and three batches at five calls each. Runtime contains page setup 5, clock 1, reservations 10, settlements 2 and remaining turn-evidence checks 12/10/10; fresh history costs zero. First text arrived at 11.567/6.532/5.069 seconds and completion at 12.378/6.894/5.441 seconds.

The new live median is **81**, versus the previous observed **159** (117/159/177), but differing model-selected operations and delivery batches prevent attributing the entire median difference to code changes. The deterministic warm comparison is **108 -> 71**. This remains well above the requested **3-4 calls**: acceptance alone uses 12 calls, accounting 12 per two-phase turn, and each private release retains a fresh authority transaction. No claim is made that the target has been achieved. Middleware, separate Stop requests and browser/history/card reads remain excluded, and the live benchmark checks completion rather than answer factual correctness.

#### Eleventh reduction: consolidated request admission — November 12, 2026

The turns route no longer opens a read-only workspace authorization transaction immediately before the acceptance transaction. Acceptance's existing exclusive workspace lock and fresh context enforce membership, workspace/user suspension, Owner consistency and `assistant.use` once, then run the route's availability check before recovery or transcript writes. Provider/feature unavailability still returns 503; unauthorized callers still receive access denial first. Other internal acceptance callers retain their existing contract.

Under the same exclusive lock, one aggregate now answers both "is there an active turn?" and "how many turns were created in the last minute?" An active turn is included regardless of age; conflict still takes precedence over the ten-turn limit. The recent cutoff is computed once for both the candidate predicate and filtered count. Exact replay and conflicting-payload detection remain before new-turn admission. Expired-lease recovery, thread ownership and concurrent serialization are unchanged.

A newly inserted thread already has the transaction's current timestamp, so acceptance no longer immediately updates that timestamp again. Existing threads retain their update. This removes six calls from a warm fresh turn (four duplicate-authorization calls, one admission read and one thread update), or five from a follow-up.

The availability callback receives the held transaction. Cold feature-flag reads use that connection rather than trying to acquire a second pool slot while holding the workspace lock; this avoids pool exhaustion when concurrent admissions occupy the remaining connections. Feature flags keep the existing root-database cache identity, 60-second TTL, plan/workspace override precedence and expiry behavior. This is connection reuse, not a new permission cache or weaker authority policy.

Verification passed: **145 focused unit tests**, **23 isolated authenticated journeys**, the feature-flag database rehearsal including its one-connection-pool check, data/web typechecks, scoped lint and whitespace checks. All three final live-model samples completed with zero failed, pending or unobserved measured calls. A web typecheck initially overlapped Next's generated-route rewrite and failed parsing the intermediate generated file; the final check runs after E2E shutdown and restoration of the original generated-route import.

| Deterministic workload | Before this slice | After |
|---|---:|---:|
| Warm fresh Lead summary | 71 | **65** |
| Lead follow-up | 79 | **74** |
| Applied Leads report | 118 | **112** |
| Explicit Lead proposal | 79 | **73** |
| Twelve-batch long stream | 126 | **120** |
| Full-window-history follow-up | 79 | **74** |

Warm fresh acceptance is now ten calls instead of twelve; request/remaining route work is three instead of seven. Other phases are unchanged for the identical summary workload: cancellation 1, runtime 28, tools 11, delivery 5 and completion 7. These 65 calls comprise 35 reads, 10 writes and 20 transaction-control statements.

Final live samples for **"what are the current open leads?"**, intent routing off:

| Phase | Sample 1 | Sample 2 | Sample 3 |
|---|---:|---:|---:|
| Request / remaining route work | 3 | 3 | 10 |
| Acceptance | 13 | 10 | 10 |
| Runtime | 28 | 28 | 30 |
| Tools | 11 | 11 | 14 |
| Text delivery | 15 | 10 | 35 |
| Final persistence | 7 | 7 | 9 |
| Cancellation | 2 | 1 | 1 |
| **Total** | **79** | **70** | **109** |
| Reads | 44 | 38 | 68 |
| Writes | 10 | 10 | 11 |
| Transaction control | 24 | 22 | 30 |
| Other | 1 | 0 | 0 |

The observed live median is **79**, versus the immediately previous **81**; the controlled reduction is **six calls**, not the difference between medians. Sample 1 includes three cold flag reads and the shared listener setup. Samples 1/2 chose the summary path with three/two delivery batches; sample 3 searched rows and delivered five batches. First text arrived at 8.453/5.918/4.977 seconds, with completion at 8.898/6.181/5.662 seconds. An earlier run before connection reuse was finalized measured 84/75/123; retain it as variability evidence, not the final implementation's baseline.

The requested **3-4 calls per question remains unachieved**. Warm acceptance still costs ten calls, two-phase accounting twelve, and each private text batch five (summary) or seven (this search fixture). Any larger reduction needs a separately designed change to those transaction/release/accounting boundaries, not simply deletion of fresh authorization checks. Measurements retain the same exclusions and completion-only benchmark limitations described above.

#### Twelfth reduction: first-batch-only prose authorization — November 13, 2026

The user explicitly accepted the risk of mid-answer revocation and approved checking only the first streamed text batch. The shared transcript delivery helper now serializes one successful initial authorization before any text is sent; all later batches bypass that database check. A failed initial check fails the stream rather than retrying or releasing queued text. Each batch still checks the in-memory abort signal before sending, including cancellation arriving while the initial authorization is pending. No new polling, cache TTL or revocation-notification mechanism was added.

This changes only streamed prose delivery. Fresh authorization remains for tool reads, completion persistence, structured-result events, history, navigation and business-write confirmations. Revocation after the first batch can allow the remainder of the answer to reach the browser but prevent durable completion; this is intentional. Empty successful answers still use the independently authorized completion path. Stop, disconnect, listener loss, timeout, answer bounds and completion-only persistence remain.

Verification: 134 focused unit tests and five targeted authenticated journeys passed, including denial before first text, continued text after session expiry at the first batch with denied completion/no saved answer, Stop, provider failure and deterministic query benchmarks. The twelve-batch stream now uses **65 calls instead of 120**: delivery costs **five calls total instead of 60**, independent of the number of text batches. The one-batch warm summary remains 65 calls; its cold measured run was 69 because of three feature-flag reads and shared LISTEN setup. This does not claim that 3-4 total calls have been achieved.

The exact live question "what are the current open leads?" completed three times with **85 / 65 / 81 calls** and zero failed, pending or unobserved measured calls. Delivery was **7 / 5 / 7 calls**, one authorization per turn regardless of streamed batch count. Samples 1/3 searched rows; sample 2 used the cheaper pipeline summary. Sample 1 includes three cold flag reads and shared listener setup. First text arrived at 10.430/5.868/6.311 seconds; completion at 11.278/6.337/7.057 seconds. The observed median of 81 versus the preceding 79 is not evidence of a regression: model-selected tools and batch counts differ, while the controlled twelve-batch workload eliminates 55 calls. An earlier live attempt was blocked by registration HTTP 429 before any question ran; the successful retry waited for the limit window without clearing shared rate limits. Final web typecheck, scoped lint and whitespace checks passed.

#### Thirteenth reduction: shared completion release and request-local reads — November 13, 2026

Successful completion now provides the fresh session/authority/evidence check for the immediately emitted sources and every structured-result event. The route saves the complete answer atomically, checks the in-memory abort signal, then synchronously sends sources/cards and `turn.completed` without intervening I/O or per-card authorization. Sources therefore move from before persistence to after successful persistence, while remaining before the terminal event. Failed completion emits no sources/cards. The three Estimate proposal validators that require a persisted completed turn now run after the state update inside that same transaction; denial rolls back both transcript and completion.

History/navigation reuse is explicitly **per HTTP request**, not original-turn-only permission caching:

- History already loads one workspace authority context for the entire response. Unique evidence and proposal visibility remain independently checked, so inaccessible items are still redacted. Shared Lead search references reuse both allowed and denied validation results in a transaction-local map; the next history load starts with an empty map.
- Leads navigation now has one authority transaction and one owned completed-turn read rather than a separate preflight and repeated turn/search checks. It retains full evidence checks, exact displayed-ID binding, filter reconstruction and legacy snapshot fallback validation.
- Customer navigation reuses its held context through the existing transaction-aware record reader instead of loading the entire Customer detail page with another authorization transaction. Calendar navigation and Calendar proposal visibility likewise use a context-aware version of the canonical visit reader, retaining scoped SQL, hidden-record protections and schedule capabilities.
- Later navigation/history requests, target record pages and business-write confirmations still perform fresh authorization. No cross-request authorization cache, polling or new permission TTL was introduced.

Verification: **138 focused unit tests, 45 disposable Leads DB checks and 26 isolated authenticated journeys** passed, plus data/web typechecks and scoped lint. Coverage includes prepared cards withheld after session expiry, current navigation denial after assignment/permission changes, forged destinations, cross-user access, per-history-request cache lifetime and one transaction pair for Calendar proposal visibility. Existing canonical cards/UI are unchanged; no parallel preview component was added.

Controlled deterministic measurements with two accounted model phases:

| Workload | Calls | Notes |
|---|---:|---|
| Warm Lead summary | **65** | Unchanged; no structured card |
| Follow-up summary | **74** | Unchanged; fresh bounded history |
| Leads search | **74** | Request phase is now 3 instead of the earlier matching search path's 10; removes one seven-call card check |
| Report | **105** | Previously 112; removes one seven-call card check |
| Proposal | **68** | Previously 73; removes one five-call card check |
| Twelve-batch summary | **68 observed** | Delivery remains 5 total; this run had 3 additional completion-phase reads versus the earlier 65-call sample |

The 74-call search comprises request 3, acceptance 10, cancellation 1, runtime 30, tools 14, first-text delivery 7 and completion 9: 43 reads, 11 writes and 20 transaction-control calls. All listed measurements had zero failed, pending and unobserved calls. These are deterministic authenticated database measurements, not a new real-provider latency/factual-quality benchmark. Separate browser/history/navigation requests and middleware remain outside the turn count. The **3-4 call target is still not achieved**.

#### Fourteenth reduction: transactional Lead tool authorization and setup-capability reuse — November 13, 2026

This slice implements the first two approved follow-ups:

1. **Consolidate Lead read tool boundaries.** Search, pipeline summary, details and history now validate session-bound ownership, active lease/evidence and exact tool/operation inside their existing handler transaction, returning the checked turn. Their prior duplicate preflight call plus repeated turn read is removed.
2. **Reuse setup capabilities for graph presentation only.** Runtime now derives one request-local capability list from setup authority and reuses it for planning/answer tool visibility. Execution still uses the handler transaction checks above; first-text release and completion checks remain independent.

Security behavior is unchanged: revocation between planning and tool execution still denies tool work. A targeted isolated regression delays planning and then revokes session/permission/cancels the turn before execution; all three cases stop without `turn.completed`, without `leads.results`, and without persisted search snapshots.

Deterministic authenticated benchmark (same fixture set) moved:

| Workload | Previous | Current |
|---|---:|---:|
| Warm Lead summary | 65 | **50** |
| Follow-up summary | 74 | **59** |
| Report | 105 | **93** |
| Proposal | 68 | **58** |
| Long-stream summary | 68 observed / 65 earlier controlled | **50** |
| Lead search | 74 | **57** |

For the matched Lead search fixture, phase costs are now request 3, acceptance 10, cancellation 1, runtime 18, tools 9, delivery 7 and completion 9 (32 reads, 11 writes, 14 transaction-control). All measured runs reported zero failed/pending/unobserved calls.

Verification: runtime/lead/store/transcript/cancellation focused tests passed; web typecheck and scoped lint passed; targeted isolated Reports regression and deterministic benchmark passed. One later full-suite run stopped early on a persisted-Stop fixture failure; its cause was not established by that run. Targeted regressions for this slice passed and include the new execution-revocation checks.

#### Fifteenth reduction: one execution lifecycle for every tool — November 13, 2026

The approved full migration moves all 16 read/proposal tools onto the exhaustive web registry and one shared [transaction runner](../apps/web/src/server/chat/tools/runner.ts). Every invocation validates its schema, opens fresh workspace authority, validates the trusted session/owned active turn/lease/evidence and tool/operation, executes a transaction-bound domain adapter, persists sources and validates resulting evidence before commit. Handler contexts contain the checked transaction/authority/turn rather than independent authorization callbacks or root DB handles.

Existing native services retain record/parent permissions, filtering, fingerprints, proposal bindings and explicit confirmations. Opt-in nested reads reuse authority only on the exact exclusive transaction handle and callback lifetime. Identity changes deny; permissions can only narrow; nested writes retain rollback savepoints. Help embedding/accounting runs outside transactions between initial admission and a fresh execution boundary. First-text, completion, history/navigation and explicit business confirmations retain their existing independent boundaries. This does not introduce polling, partial transcript saves or cross-request authority caching.

Matched deterministic measurements:

| Workload | Previous | Common runner |
|---|---:|---:|
| Warm Lead summary | 50 | **51** |
| Follow-up summary | 59 | **60** |
| Report | 93 | **79** |
| Lead creation proposal | 58 | **57** |
| Long-stream summary | 50 | **51** |
| Lead search | 57 | **60** |

Report tool work drops from 45 to 31 driver calls. Uniform post-execution evidence validation adds one call to summaries and three to searched-Lead turns; these are intentional measured costs, not claimed reductions. Report fingerprints still scan the existing broad native populations and have not been weakened. The matched 60-call search comprises request 3, acceptance 10, cancellation 1, runtime 18, tools 12, delivery 7 and completion 9. All benchmark rows had zero failed/pending/unobserved calls. A cold summary measured 55 (three flag queries plus LISTEN); the long full-suite search measured 63 after the feature cache expired. Middleware and separate navigation/history requests remain outside these turn totals. The **3–4 call goal remains unmet**.

Validation: **230 focused tests**, **24 disposable authorization checks**, **45 Lead database checks**, **21 private Report evidence groups**, and **28 full-suite authenticated Reports tests** passed. A final targeted authenticated test additionally executes ten real read/proposal domain adapters, checks native evidence/card families and pending reviews, and verifies unchanged business-record/activity counts. Typechecks and scoped lint passed. The previously observed persisted-Stop fixture passed in this full run; no root cause for its earlier intermittent failure is claimed. No new UI component or parallel preview implementation was introduced.

#### Sixteenth reduction: request authority and completion-only staged evidence — November 13, 2026

The approved request-snapshot contract replaces repeated session/authority/freshness checks across setup, tool execution, text delivery and completion. Admission authenticates once, combines ownership/replay/rate housekeeping and transcript insertion, and provides request-local authority and clock. Domain services retain record-scope predicates and independently authorized explicit confirmations. Sources and result provenance stage in memory and save atomically with the completed transcript; interrupted text/evidence is discarded. Historical references validate owned completed source turns and current private access rather than whole-workspace mutation fingerprints.

The final isolated regression passed **30 tests**, with **two live-provider-only tests skipped**. It covers nine Report areas, all 25 Report configurations, business-domain reads/proposals and inherited answers, restored history/navigation, ordinary edits, next-request revocation, Stop, lease expiry, replay, concurrency and provider failure. Proposal preparation leaves business records unchanged. All **38 labelled measurements** have one authority read, zero fingerprint queries, and zero failed/pending/unobserved database calls. Fixtures use the real authenticated runtime, native readers, persistence and two-phase accounting, but deterministic model output; this is not a live-model latency or answer-quality evaluation.

| Workload | Previous driver calls | Current driver calls | Current SQL statements |
|---|---:|---:|---:|
| Warm Lead summary / long stream | 51 | 18 | 24 |
| Lead follow-up | 60 | 24 | 30 |
| Lead search | 60 | 20 | 26 |
| Lead creation proposal | 57 | 23 | 29 |
| Leads Report | 79 | 30 | 36 |

| Report area | Driver calls | SQL statements |
|---|---:|---:|
| Overview | 70 | 76 |
| Leads | 30 | 36 |
| Sources | 26 | 32 |
| Calendar | 23 | 29 |
| Jobs | 29 | 35 |
| Team | 22 | 28 |
| Estimates | 25 | 31 |
| Activity | 25 | 31 |
| Financial | 34 | 40 |

Other business-domain counts below include accounting, unlike earlier unaccounted domain fixtures. Follow-ups ask the same Lead summary question after the domain answer, so they measure inherited-source overhead rather than repeating the domain operation.

| Domain | Read calls | Proposal calls | Follow-up after read / proposal |
|---|---:|---:|---:|
| Customers | 22 | 21 | 24 / 25 |
| Work Orders | 22 | 25 | 25 / 25 |
| Materials | 22 | 26 | 24 / 25 |
| Estimates | 21 | 39 | 24 / 35 |
| Lead Capture | 26 | 38 | 24 / 35 |
| Calendar | 23 | 45 | 24 / not measured |

Every accounted sample above has six more server SQL statements than driver calls: two-phase allowance reservations/settlements use **five driver calls but eleven SQL statements**, including transaction control. This is batching, not elimination of those statements. Warm shared overhead is **15 driver calls**: authentication 2, admission 6, cancellation startup 1, accounting 5 and completion 1. Domain tool work adds 3 for a Lead summary, 15 for the Leads Report and 55 for Overview. No delivery-phase queries or periodic cancellation/partial-save queries remain. A full-window-history summary measured 24 calls / 30 statements.

The largest remaining measured costs are native composed Reports and proposal preparation/visibility, not authority reloads: Overview 55 tool calls, Calendar proposal 30, Estimate proposal 24 and Capture proposal 23. Overview composes its native business sections; Financial composes accepted/awaiting Estimate and material projections. History after Estimate/Capture proposals adds 17/14 calls respectively for retained-source/proposal visibility. These still merit consolidation; the original 3–4-total-call target is **not achieved**.

Regression fixes: proposal presence now explicitly selects identity fields instead of accidentally turning an entire authorization context into SQL predicates. Calendar proposal checks exercise the actual HTTP boundary with its configured permission set rather than a different all-catalog-permissions context. The new benchmark includes all Report areas and domain follow-up measurement IDs; signup rate-limit retries wait rather than clearing shared limits. A fresh isolated Next build directory avoids stale generated-route artifacts.

#### Seventeenth reduction: Overview aggregates and metadata-directed proposal history — November 13, 2026

Overview now calls shared native aggregate primitives for Leads and Jobs instead of loading six complete reports with unused evidence pages and breakdowns. Lead intake archive rules, open stages, the strict seven-day inactivity cutoff, Job lifecycle validation and distinct completed-job counts remain canonical. Estimates retain their frozen-money validation scans; Calendar retains its existing combined aggregate/evidence projection.

The shared tool runner records the actual proposal families on the admitted turn and stages them with completion-only evidence. The additive `202611130003_chat_proposal_families` migration deliberately distinguishes **null** (legacy/unknown) from **[]** (known plain answer). Previously, no per-turn discriminator existed, so discovery had to check all 12 family tables in one scoped UNION. Modern plain turns now make **zero proposal-table queries**; modern proposal turns query only their recorded families. Legacy turns retain the bounded 12-family compatibility lookup; they are not falsely backfilled as empty. Each queried family returns only its newest recorded row per turn.

Runtime history uses one shared recorded-family/state projection plus the authorized saved narrative, not confirmation-ready reviews. Pending does not promise confirmability; confirmed remains family-specific (Capture setup suggestions still need saving and Estimate conversion only opens Job review). Display history still loads freshly checked canonical proposal cards, and explicit confirmations still validate current authority and target/binding versions. Historical source access and immutable bindings remain checked. Discovery is reused within a history load; an inherited ancestor outside that window gets its own scoped fallback rather than being silently treated as absent.

| Workload | Previous driver calls | Full regression driver calls | SQL statements |
|---|---:|---:|---:|
| Overview | 70 | **41** | 47 |
| Lead follow-up | 24 | **23** | 29 |
| Estimate-proposal follow-up | 35 | **26** | 32 |
| Capture-proposal follow-up | 35 | **28** | 34 |
| Legacy 50-turn history fixture | 24 | 24 | 30 |

Overview tool work drops **55 -> 26 calls**, with the same 15-call warm shared overhead. Estimate-proposal history drops **17 -> 8** calls; Capture-proposal history drops **14 -> 7**. The matched full-run Capture follow-ups each include three feature-cache reads; the final focused run measures **25 calls / 31 statements** when that cache is warm. A cold first summary measures 22 rather than warm 18 (three feature reads and one listener startup); these are not domain/history regressions. All other initial Report/domain read and proposal counts remain as listed above. Ordinary Customer/Materials/Estimate/Capture/Calendar read follow-ups now use 23 calls; Work Order read and Customer/Work Order/Materials proposal follow-ups use 24.

Validation: the full safe authenticated regression passed **30 tests**, with **two live-provider-only skips**. A final four-test rerun covers all domain adapters, every benchmark, modern/legacy proposal discovery and Calendar history/revocation. Both runs contain **38 complete labelled measurements**, each with one authority read, no fingerprint queries and zero failed/pending/unobserved calls. Two-phase accounting still adds six SQL statements beyond the driver count; batching is not reported as statement elimination. **175 focused unit tests**, **10 rollback-only Report database groups**, **25 disposable authorization/migration checks**, typechecks, scoped lint and whitespace checks passed. Aggregate parity includes workspace/assigned access, archived Leads, exact inactivity boundaries, future-created rejection and reopened/recompleted Jobs. The metadata migration was applied to local development/test databases, not production. No provider, dependency, UI or confirmation behavior change is included.

### Proposal storage consolidation: step 1 contract — November 13, 2026

The approved scope includes all 14 proposal-storage tables, including Customer
and Work Order drafts. Materials currently shares Work Order storage, producing
15 logical target families. The [compatibility matrix and schema contract](./chat-proposal-consolidation.md)
records the existing uniqueness, directional supersession, family-specific
binding/replay/receipt semantics, erasure and audit rules, canonical schema,
acceptance tests and controlled cutover gates.

The contract was approved. The design-only step changed no runtime storage;
the following foundation step does not switch existing handlers either.

### Proposal storage consolidation: step 2 foundation — November 13, 2026

Added [15 typed lossless family envelopes](../packages/contracts/src/chat-proposals.ts),
the additive canonical proposal/audit migration (historical migration; see the prior release)
and a [transaction-bound repository](../packages/data/src/chat-proposals.ts).
Owned lookup, request replay lookup, directional replacement, guarded
resolution, recorded history and atomic append-only lifecycle events now have
one shared persistence boundary. Native preparation, confirmation permission/
hash/version/expiry checks and replay outcomes remain domain responsibilities.

Validation passed: 29 focused contract tests, 20 disposable PostgreSQL check
groups, contracts/data/web typechecks and scoped ESLint. The rehearsal creates
and removes only its own random database; no shared database was migrated.
The [contract implementation status](./chat-proposal-consolidation.md#6-step-2-implementation-and-verified-limits)
states coverage and the remaining full-family adapter/backfill/retention gates.

Existing handlers still use all 14 legacy proposal tables; no storage switch,
metadata expansion, legacy audit import or production cutover occurred.
Database-call counts are unchanged at this step. Next review: grouped
Estimate adapters, followed by Calendar/Capture and Lead/Customer/Work
Order/Materials, before separately approved backfill and operational cutover.

### Proposal storage consolidation: staged Estimate adapters — November 13, 2026

All eight Estimate proposal handlers now share one
[storage adapter](../packages/data/src/estimates/proposal-storage.ts), including
visibility/evidence reads, preparation, refresh, terminal persistence and
lifecycle proof lookup. Native permissions, signed bindings, confirmations,
receipts, replay and editor/open behavior remain in the existing handlers.
The canonical branch delegates to the common proposal repository, with one
owned pending-set lookup for supersession and no duplicate proposal lookup
when saving a previously locked resolution or Conversion review.

Default app requests remain on legacy storage. One common explicit rehearsal
scope stages the canonical path without dual writes, fallback or per-family
feature flags. No shared database migration, backfill, discovery/metadata
switch or operational cutover occurred.

Validation passed: **27 disposable native adapter check groups** across both
stores, **20 shared repository PostgreSQL groups**, **193 focused unit tests**,
data/web typechecks and scoped lint. The canonical native run issued no legacy
proposal SQL. Checks include native concurrent replay, replacement races,
inherited evidence pruning, audit-failure rollback and no-Job Conversion
review. See [coverage and limitations](./chat-proposal-consolidation.md#7-step-3-staged-estimate-adapter-group).
Calendar/Capture now reuse the same foundation, as described below. End-to-end
database-count changes remain a post-integration benchmark, not a claim from
these staged slices.

### Proposal storage consolidation: staged Calendar/Capture adapters — November 13, 2026

Extracted the Estimate adapter mechanics into one
[shared storage adapter](../packages/data/src/proposal-storage.ts). Calendar,
Capture Setup and Capture Source now use it for all native proposal reads,
request replay, insertion and terminal persistence, including evidence,
visible-ticket and manual sample-approval surfaces. Calendar supersession
retains nested-state synchronization/evidence pruning; Capture supersession
visits both families once through the common repository. Native permissions,
hash/version/expiry checks, confirmation, saved-versus-suggestion receipts,
sample provenance, publication/readiness/delivery checks and replay stay native.

Validation passed: **48 disposable Calendar/Capture check groups** in both
stores under the web role, **27 Estimate adapter groups**, **20 shared
repository groups**, **57 focused units**, contracts/data/web typechecks and
scoped lint. Audit-failure injection verifies rollback of native Calendar
records, Setup creation/sample bindings and Source publication/version writes.
Canonical runs issue zero legacy proposal/audit SQL and reject legacy-only
fallback. See [coverage and limitations](./chat-proposal-consolidation.md#8-step-3-staged-calendarcapture-adapter-group).

Live storage, UI/API contracts and current database-count baselines are
unchanged. No shared migrations, provider calls, historical audit import,
backfill or metadata/discovery switch occurred. The Lead group is staged
below; retain separate approval for cutover.

### Proposal storage consolidation: staged Lead adapters — November 13, 2026

All eight native Lead variants now use the flat-column codec in the same
[shared proposal adapter](../packages/data/src/proposal-storage.ts).
Preparation, same-turn replay, supersession, locked confirmation, visible
reviews, typed deletion receipts and CSV download gates use the selected
store without moving native business/security/replay decisions. Customer and
Work Order preparation route their Lead supersession edge through this
boundary; their own staged adapters are described below.

Manual/native deletion erases Lead proposal copies in the selected store
across actors/evidence turns. Canonical confirmation restores only the minimal
original-hash receipt after native erasure; proof-checked insertion and
lifecycle audit share the business transaction, without another proposal read.
Lead CSV dedicated-download and confirmed-redownload rules remain native,
distinct from Customer/Work Order/Materials export replay.

Validation passed: **35 disposable native Lead groups**, **27 Estimate
groups**, **48 Calendar/Capture groups**, **20 shared repository groups**,
**51 focused units**, contracts/data/web typechecks and scoped lint.
Canonical native Lead runs issue zero legacy Lead proposal/audit SQL.
See [coverage and limitations](./chat-proposal-consolidation.md#9-step-3-staged-lead-adapter-group).
Live stores, metadata/discovery, UI/API contracts, shared databases and
database-count baselines are unchanged. Backfill and cutover remain
separately gated.

### Proposal storage consolidation: staged Customer/Work Order/Materials adapters — November 14, 2026

The last three families now reuse one reviewed-column codec in the
[shared proposal adapter](../packages/data/src/proposal-storage.ts).
Native preparation/confirmation/visible-result surfaces, including Material
preparation through the Work Order handler, use the selected store.
One canonical replacement and one owned proposal lookup preserve directional
supersession and locked resolution; there is no lookup per logical family.
Shared Work Order/Materials ID and turn uniqueness preserve their native
shared-table identity. External `canceled` spelling stays unchanged.

Customer deletion preserves typed/unlink consent, workspace-wide copy/text/
result erasure and the original-hash minimal receipt. All three confirmed
exports still reject redownload. Native domain authorization, hashes,
versions, timestamps, replay, business/export audits and UI contracts remain
unchanged; future canonical lifecycle events are atomic internal additions.

Validation: **62 disposable native final-family groups**, **35 Lead**,
**27 Estimate**, **48 Calendar/Capture**, **20 shared repository groups**,
**40 focused units**, contracts/data/web typechecks and scoped lint.
Canonical native runs issue zero legacy proposal/audit SQL and reject real
legacy-only rows. Audit injection checks native-write/erasure rollback and
atomic replacement even when a caller catches the preparation failure.
See [coverage and limits](./chat-proposal-consolidation.md#10-step-3-staged-customerwork-ordermaterials-adapter-group).

All 15 families have staged native adapters; live storage remains legacy.
The coordinated metadata/discovery/history group is staged below.
Shared migrations, lossless backfill, historical audit
retention, operational cutover and database-count benchmarking remain gated.

### Proposal storage consolidation: all-family metadata/history integration — November 14, 2026

The common runner now recognizes Customer and Work Order/Material result
drafts alongside the original 12 families. Shared native adapters record
metadata for direct/manual writers too: admitted requests stage it without
another query; standalone preparation persists it in the existing transaction.
Unknown metadata remains unknown. An additive, guarded migration expands the
CHECK without backfilling or modifying shared databases.

Canonical history discovery uses one shared latest-state query; plain
metadata skips proposal SQL. Inherited Estimate/Calendar/Capture and Customer/
Work Order/Material bindings use one canonical completed-thread payload batch
per validation, retaining native fingerprints/access/erasure checks.
Legacy discovery remains metadata-directed and uses payload-kind routing for
Work Order/Materials. Cards, cancellation spelling and receipt rules remain
native. There is no cross-store fallback.

Verified **10 native history groups**, **21 shared repository groups**,
**103 focused units** and all **172 native adapter regression groups**,
contracts/data/web typechecks and scoped lint. Assertions include mixed
restored cards, foreign/unfinished/erased inherited sources, thread/audit
retention, all 15 recorded families, zero-query plain history, one canonical
discovery query and one payload batch for mixed inheritance.
See [coverage and limits](./chat-proposal-consolidation.md#11-staged-all-family-metadata-discovery-and-inherited-history).

Next review: lossless backfill, historical audit retention/erasure and rollback
rehearsal. Full UI/exhaustive inherited acceptance, live canonical cutover and
the 38-workload benchmark remain separately gated. No shared migration,
provider request, email delivery or live DB-count reduction is claimed.

### Proposal storage consolidation: lossless backfill and retention rehearsal — November 14, 2026

Staged an explicit transaction-bound maintenance importer for all 14 legacy
tables/15 families. It preserves signed payloads, original hashes/routing/
states, request IDs and microsecond timestamps, imports original lifecycle
events with source-table/ID provenance, and rebuilds family metadata from
actual canonical rows. Exclusive non-waiting locks reject undrained writers.
Repeat reconciliation is exact; malformed/divergent/post-cutover targets
fail without repair, fallback or partial imports.

An additive retention migration preserves historical Estimate/Calendar/
Capture workspace cascades and actor nulling while keeping imported Lead
and future canonical events immutable/non-cascading. Runtime mutation remains
denied, and historical provenance requires the audit table owner.

Verified **69 new backfill groups**, all **203 existing database regression
groups**, **103 focused units**, contracts/data/web typechecks and scoped
lint. The five native disposable fixtures cover every family, orphan events,
source-ID collisions, original minimal receipts, owned/history reads,
metadata, rollback, provenance restrictions and parent-erasure parity.
See [implementation and remaining gates](./chat-proposal-consolidation.md#12-staged-lossless-legacy-backfill-and-historical-audit-retention).

No shared migration/import, live selector, provider request or email delivery.
The later canonical-compatible rollback guard is described below.

### Proposal storage consolidation: canonical-compatible rollback guard — November 14, 2026

Staged a one-way committed storage authority and version-1 startup contract.
The explicit maintenance activation imports and reconciles before retiring
legacy payload copies, preserves source audits, selects canonical authority
and revokes runtime access to retired tables atomically. Web and worker read
the marker once on startup, not per request. There is no reverse sync or
legacy fallback. Any future activation requires separate approval, drained
writers and retention workers, a prevalidated compatible release and process
restarts; the authority migration must precede startup-check deployment.

Five disposable native runners passed **40 rollback check groups**, alongside
**69 backfill groups**, **172 native adapter regression groups** and **112
focused units**; data/web/worker typechecks and scoped lint passed. The
rehearsal validates current compatible behavior, not a particular historical
release artifact.
See [rollback guarantees and remaining gates](./chat-proposal-consolidation.md#13-canonical-compatible-rollback-guard).
Representative canonical browser journeys cover all 15 families, while
exhaustive UI/inherited variants remain open. The subsequent 38-workload
canonical DB benchmark is complete and records both increases and decreases;
see [measured comparison](./chat-proposal-consolidation.md#15-canonical-database-call-benchmark).
No shared cutover, provider request, email or production deployment occurred.

### Report-only answer context reduction — November 9, 2026

The [model adapter](../packages/agent/src/openai-model.ts) now uses compact answer instructions only when nonempty server-produced evidence consists entirely of `report-native-read` or `report-clarification` entries. Empty, mixed-domain and unrelated evidence retain the original full instructions. Record text cannot select this branch. The planner, authorized tool schemas, model, quota reservation and output budgets are unchanged.

- Compact instructions retain untrusted-evidence boundaries, factual limitations, structured confirmation requirements, historical/private-data restrictions and the distinction between reading a report and changing application state. The answer model still has no bound tools.
- Report metric/date/scope/missing-cost rules reuse the canonical Reports tool description rather than duplicating definitions. All currently authorized capabilities remain listed. Original conversation roles and evidence-as-user-data are preserved.
- An [adapter regression](../packages/agent/src/openai-model.test.ts) compares serialized system/developer input using identical tools and history: **31,646 -> 4,043 characters, an 87.2% reduction** for that fixture, with a minimum 60% reduction assertion. This measures instructions, not total input tokens; evidence and history are not shortened. Live requests logged **4,502 instruction-text characters** with their larger capability sets (a different metric from serialized fixture input).
- Content-free `chat_answer_context` diagnostics contain only `reportOnly` and `instructionCharacters`; no evidence, message text or identifiers are logged.
- **705 focused tests**, agent/web typechecks and adapter lint passed. All **nine isolated, signed-in real-provider Reports journeys** passed native/card parity. No new UI component was introduced, so existing canonical stories remain applicable.
- Provider observations: Overview **16.245 s**, Leads **8.527 s**, Sources **10.318 s**, Calendar **10.492 s**, Jobs **8.588 s**, Team **12.933 s**, Estimates **46.827 s**, Activity **15.539 s**, Financial **23.879 s** submit-to-validated-card. First dispatched text ranged **5.500–9.154 s** from delivery setup. Each used one transcript checkpoint except Estimates, which used two. These uncontrolled local samples demonstrate working report answers and reduced context, **not a guaranteed latency improvement**; the Estimates outlier and unchanged planning work remain reasons to profile further.

Broader planner instruction/schema reduction, model changes and revision-based report authorization remain separate approval steps. This optimization does not apply to every assistant request and does not weaken fresh delivery or persistence authorization.

### Capability-scoped planner instructions, first slice — November 9, 2026

The approved next step keeps all authorized tools available regardless of page or request wording. In the [model adapter](../packages/agent/src/openai-model.ts), the planner now omits the separate Estimate proposal instructions (including revise/duplicate, Void, Archive/Restore and CSV export) when `estimates_propose_action` is unavailable. It independently omits the extra Lead Capture source-action/setup blocks when `lead_capture_propose_action` is unavailable. Selection uses the existing effective tool list after operation-based filtering, so an advertised Capture tool with no authorized operations does not retain these blocks.

- Shared base instructions remain unchanged, including their other domain guidance and general access/evidence rules. This is deliberately **partial capability scoping**, not a full domain-prompt extraction or tool router. Operation-specific text within an available tool's block is not pruned.
- Bound tool definitions, strict schemas, parallel-call policy, model, quota handling, budgets and server authorization are unchanged. Authorized off-page tools remain available. Full/non-report answer instructions and compact report answers are unchanged; current authorization still controls whether an action is available, not a historical receipt or user claim.
- [Adapter regressions](../packages/agent/src/openai-model.test.ts) exercise all four independent Estimate/Capture availability combinations, including Capture with zero operations, preserved conversation roles, unavailable-action requests and page/history sentinels. With both proposal tools available, planner system input equals the original full answer system input. With both unavailable, the identical-tool/history fixture measures **31,646 -> 22,679 serialized instruction characters (28.3% smaller)** and enforces at least 25% reduction. This is not a token count or a reduction in tool schemas.
- Content-free `chat_planning_context` logs only `instructionCharacters`. The all-nine live owner journeys logged **24,815 instruction-text characters**, reflecting their own capability set; administrators with both tools available may see no reduction from this slice.
- **710 focused tests**, agent/web typechecks and adapter lint passed. All **nine isolated signed-in provider Reports journeys** passed native/card parity. Observed submit-to-validated-card times: Overview **15.100 s**, Leads **7.823 s**, Sources **8.807 s**, Calendar **9.340 s**, Jobs **8.150 s**, Team **8.720 s**, Estimates **8.089 s**, Activity **9.099 s**, Financial **9.369 s**. Each used one transcript checkpoint. These are uncontrolled local observations, not latency certification or evidence that prompt reduction alone caused the differences.

No UI changes or new Storybook components are required. Further extraction of shared domain instructions, schema reduction, routing or model changes needs a separate reviewed slice; no keyword-based tool narrowing was introduced.

### Shared planner domain scoping — November 9, 2026

The approved first cross-context step extends [capability-scoped planning](../packages/agent/src/openai-model.ts) to the shared Leads, Customers, Materials, Work Orders, Calendar and Lead Capture guidance. Each domain's existing text is included when an effective authorized read or proposal tool in that domain is available. Estimate proposal blocks remain independently scoped as above; Estimate read guidance stays in the common introduction and authorized tool definition. Reports and Help use the shared rules plus their bound tool definitions. Jobs scheduling guidance remains part of Calendar; no standalone Job tool is introduced.

- Selection is based only on the already-filtered server tool list, never the active page, request keywords, CRM text or past access. All authorized off-page tools remain bound. Work Order proposals also retain Materials guidance because their material input is resolved against the catalog by the server; this does not grant catalog tools.
- Common evidence/access rules remain in every request. Explicit shared planner safeguards retain clarification for compound requests, no input collection for unavailable actions, structured confirmation, historical receipt limitations, no invented identifiers or implicit commits, and protection against reconstructing private historical/deleted content. Detailed rules for an available domain remain intact; this is domain-level, not operation-level, pruning.
- Full/non-report answer prompts remain byte-for-byte unchanged in adapter fixtures. With all capabilities present, planner system input preserves every previous instruction and adds only the shared planner safeguards. Compact Report answers, schemas, model, quota handling, budgets and server permission enforcement are unchanged.
- [Adapter tests](../packages/agent/src/openai-model.test.ts) cover every one of the **16 implemented tools** individually, all-capability preservation, operation-filtered unavailable domains, preserved user/assistant roles, cross-page tools, untrusted sentinels and independent Estimate/Capture availability. The report/help-only fixture measures **31,611 -> 3,696 serialized system/developer characters (88.3% smaller)**. The mixed Reports/Help/Lead-proposal fixture measures **31,646 -> 15,461 (51.1% smaller)**. These are instruction sizes for those capability sets, not total tokens or universal reductions.
- **729 focused tests**, agent/web typechecks and adapter lint passed. All **nine isolated signed-in live Reports journeys** passed native/card parity. Their planner instruction-text diagnostic decreased from **24,815 to 14,125 characters (43.1%)** compared with the previous slice's same fixture capability set. Observed submit-to-validated-card times ranged **6.994–14.368 s**; these uncontrolled samples do not establish causal speedup or p95 performance.

Live provider/browser acceptance for non-report domain workflows has **not** been exhaustively rerun by this slice; their adapter/domain/runtime regressions passed, but that is not equivalent to end-to-end live acceptance. Older cross-domain browser suites that truncate shared test tables were deliberately not run. No UI components changed, so existing canonical stories remain applicable.

Step 1 is complete. Step 2—compact non-report answer instructions, including mixed evidence and proposal/history privacy—still requires its own approved implementation and validation. No development-server restart or cache purge was needed after the transient in-progress parse error cleared.

### Compact tool-backed answers across domains — November 9, 2026

The approved second step adds [compact answer policies](../packages/agent/src/answer-instructions.ts) for Help, Leads, Customers, Materials, Work Orders, Calendar, Estimates and Lead Capture. The [runtime](../packages/agent/src/runtime.ts) passes an ephemeral ordered list of successfully executed tools alongside their evidence. This list is not taken from request text, record tags or prior history and is not stored in graph checkpoints. Failed tool execution never proceeds to answering.

- The answer adapter uses a shared evidence/authorization/confirmation/privacy policy plus the rules for each executed tool. Mixed results include all relevant policies, deduplicated; Work Order proposals retain Materials rules. Reports mixed with another domain reuse the canonical Reports description. Existing report-only instructions remain unchanged.
- No-tool turns, callers without provenance, and empty/misaligned/unrecognized provenance retain the full legacy answer prompt. Capabilities still list current authorized tools and operations independently from historical execution. No tools are bound to the answer model. Planning, schemas, model, quota handling, budgets and fresh delivery/persistence authorization are unchanged.
- Shared rules distinguish clarification/blocked/unchanged/unavailable outcomes from success, reviews from saved changes, chat yes from explicit browser confirmation, and historical receipts from current state or delivery. Domain rules preserve missing-cost limitations, bounded scope, Calendar advice limitations, Capture readiness and private Estimate-review boundaries.
- Adapter fixtures compare identical capabilities, history and evidence. Serialized system/developer input decreases from **31,954 characters** to **3,404 for Help (89.3%)**, **5,018 for an Estimate proposal (84.3%)**, and **3,819 for mixed Calendar/Work Order reads (88.0%)**. Tests enforce at least 60% reduction for each of the 16 implemented tool policies. These are instruction characters, not total input tokens.
- **757 focused tests**, agent/web typechecks and scoped lint passed. The [opt-in fictional answer evaluation](../apps/web/e2e/chat-answer-context.spec.ts) passed **17 live-provider cases** spanning eight read domains, seven pending proposal domains, mixed Report/Estimate evidence and historical-receipt privacy. These direct adapter evaluations execute no business tools or confirmation actions; tracked answer calls took **0.683–2.446 s** in that run, not end-to-end request times or a controlled speed benchmark.
- The [isolated authenticated suite](../apps/web/e2e/chat-reports.spec.ts) passed **10 live journeys**: all nine unchanged Reports journeys plus a Home lead-pipeline answer through the actual planner/runtime/store path. The lead answer selected `toolBacked: true` and logged **3,912 instruction-text characters**. Its planner still used **33,084 characters** with that account's broader capabilities, illustrating that compact answering does not eliminate planning overhead.

`chat_answer_context` now also logs the content-free `toolBacked` boolean. No UI components changed; existing canonical stories apply. Full live browser/confirmation coverage for every non-report workflow remains outstanding. The legacy no-tool prompt and monolithic planner source remain explicit follow-ups, not silently optimized here.

### Exact-question local benchmark — November 9, 2026

The opt-in [open-leads benchmark](../apps/web/e2e/chat-reports.spec.ts) sends **“what are the current open leads?”** three times through the authenticated streaming API on Home, using independent turns in the isolated fictional workspace. It measures request-to-headers, accepted/retrieving/first-text/terminal events and persisted phase metadata without logging prompts, answers, cookies or identities.

| Sample | Request to first text | Request to completed | Recorded planning | Recorded answer | Durable turn |
|---|---|---|---|---|---|
| 1 | 9.818 s | 10.281 s | 3.499 s | 1.285 s | 8.220 s |
| 2 | 6.257 s | 6.807 s | 2.153 s | 1.454 s | 6.740 s |
| 3 | 6.217 s | 7.003 s | 3.147 s | 1.102 s | 6.959 s |

Median completion was **7.003 s** and median first text **6.257 s**. Sample 1 spent **2.225 s** reaching response headers versus 67/31 ms subsequently; development cold/compile overhead is plausible but not separately proven. Each planner used **22,751 input tokens** (mostly provider-cache hits), versus **1,120–1,123 answer input tokens**. Answer instructions selected the compact tool-backed path. Each answer used **one transcript checkpoint**, taking **13–29 ms**; cumulative delivery validation was **88–148 ms**.

The newest local development turn's metadata near the user's report showed **7.053 s durable time**, with planning **2.413 s** and answering **1.440 s**. Its prompt was deliberately not read, so this is a nearby observation, not verified identification of that exact question.

Phase usage timestamps begin after the separate provider `/responses/input_tokens` request and quota reservation. Thus recorded model durations exclude that count-call latency; pre-planning/inter-phase gaps combine counting, context preparation, authorization and tool work. The lookup time alone is not isolated by current metrics. Three local API samples are not a p95 benchmark, a browser-render measurement or a guarantee for other roles, histories or data volumes. Remaining suspects are broad planner schemas/context, two sequential generation phases and their token-count round trips—not per-fragment transcript writes. No permission, quota or model changes were made for this benchmark.

#### Live-model database remeasurement — November 10, 2026

The same exact-question benchmark was repeated after notification-driven cancellation, using three independent authenticated turns against an isolated fictional workspace, the live `gpt-6-luna` provider, intent routing off and `CHAT_DB_METRICS=true`. All three streams completed; the benchmark does not independently verify the factual content of the answers.

| Sample | Total calls | Reads | Writes | Transaction control | Other | Request to terminal |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 254 | 187 | 14 | 52 | 1 | 12.744 s |
| 2 | 275 | 205 | 14 | 56 | 0 | 8.819 s |
| 3 | 263 | 195 | 14 | 54 | 0 | 11.808 s |

Median calls were **263**. The first request included the shared listener's one `LISTEN` command; subsequent requests reused it. Phase counts for samples 1/2/3 were request **34/31/31**, acceptance **12/12/12**, runtime **101/101/101**, tools **26/26/26**, cancellation **4/2/3**, delivery **52/78/65**, transcript checkpoint **15/15/15** and finalization **10/10/10**. All measurements reported zero failed, pending and unobserved calls. Delivery counts reflect four, six and five batches at 13 calls each; cancellation includes the initial status check and any five-second fallback checks.

These are real instrumented driver calls, including transaction-control calls, not database rows or query latency. The total excludes middleware, separate Stop requests, browser/history/card fetches and cold Knex bootstrap queries, as described in the measurement baseline. The earlier **166-call** fresh Leads result used a deterministic fixture provider and is not an apples-to-apples measurement of these live-model responses. Three samples do not establish production averages or the cancellation change's isolated savings.

### Opt-in intent-routed planner experiment — November 9, 2026

The [intent router](../packages/agent/src/intent-routing.ts) classifies domain(s) plus read/proposal/mixed intent before the existing planner receives tool schemas. It is **disabled by default**, enabled for subsequent requests with `CHAT_INTENT_ROUTING=true` in the web server environment. The adapter also accepts an explicit `intentRouting` option for evaluations. No live/customer workspace setting was changed.

- A strict `route_intent` classification call uses the current model, a 256-token output budget, the intact latest question (maximum 2,000 characters), and up to three prior context messages clipped to 1,200 characters with explicit truncation markers. Oversized/missing questions skip routing and retain broad planning. Page/history text is data, never authorization or new action intent.
- Candidate tools are intersected with the existing **effective authorized tools**, after operation-based access filtering. Reads exclude proposal tools. Proposal/mixed routes retain both domain reads and preparation tools so references can be resolved without guessing. Compound requests include every classified domain. Scheduling uses Calendar even for Jobs/Work Orders; product how-to retains Help; plain open-lead questions select Leads, not Reports. Available operation schemas are otherwise unchanged.
- Uncertain, malformed, missing or unmapped classification results explicitly retain broad authorized planning and log a content-free fallback reason. Provider/quota failures surface normally rather than triggering unbudgeted retries. A planner call outside its selected tool set is rejected before execution. Existing runtime authorization and operation/record checks still apply to every tool; routing grants nothing and cannot commit actions.
- Both classification and main planning have independent token counting, reservation and completion accounting. Both use the existing `planning` usage phase, so an enabled successful turn normally records **two planning calls**, not one. `chat_intent_route` logs only fallback reason, available/selected tool counts and elapsed milliseconds, including counting/reservation overhead. No question, route arguments, record content or identity is logged.

Verification:

- **783 focused tests** passed, including opt-in adapter transport/accounting, read/proposal selection, compound domains, malformed/uncertain fallback, cancellation, quota failure and rejection of out-of-subset calls. Default-off prompt hash tests remain unchanged.
- [14 fictional live classifier/planner cases](../apps/web/e2e/chat-intent-routing.spec.ts) passed: all domains, Job scheduling, compound Leads/Calendar, assignment follow-up, ambiguous context retaining all tools, and untrusted page text. These do not execute business tools or confirm actions.
- All **nine authenticated live Reports journeys** passed native/card parity with routing enabled. Their planner selected only Reports, using **3,941 instruction-text characters**. The suite checks the additional accounted planning call when enabled.
- The exact-question authenticated benchmark selected **one tool instead of 16**. Its main planner used **4,148 input tokens**, plus **595 router input tokens**: **4,743 total versus 22,751 (79.2% fewer)** across the planning stages. The main planner still includes full Leads domain guidance; operation-specific pruning is not implemented.

| Three-call local batch | First-text times | Completion times | Median completion |
|---|---|---|---|
| Routed | 6.736 / 4.735 / 4.664 s | 7.641 / 5.246 / 5.317 s | 5.317 s |
| Repeated broad baseline | 8.843 / 5.152 / 4.962 s | 9.288 / 5.581 / 5.697 s | 5.697 s |

Median completion was **0.380 s (6.7%) lower** and median first text **0.417 s lower** in these batches. Router time including its extra count/reservation was **0.849–1.449 s**. Both batches had about 1.9 s initial response-header overhead, and cache/provider/output variation remains significant. The broad planner chose Reports in one baseline sample rather than Leads; output/native evidence sizes consequently differed. These are small, sequential development samples, not controlled causal proof, p95 certification or full semantic parity for all requests.

**Decision:** retain the feature as an opt-in experiment pending broader multi-turn/domain acceptance and repeated latency/cost evaluation. Input reduction is clear; the observed latency advantage is modest because the router adds a sequential generation and count request. No default model, authorization, proposal confirmation or quota policy was changed.

### Future update: deployment-free model configuration

**Deferred; not implemented.** Replace the hardcoded shared model ID with versioned database-backed configuration managed through the existing Admin platform-settings workflow. An environment-variable-only change is insufficient because it generally still requires a service restart or deployment.

- Configure planning, answering and Gmail extraction independently, retaining the current model as the initial configuration.
- Restrict changes to authorized staff through the existing audited settings/review/verification mechanisms. Provide version-conflict protection and an explicit audited rollback.
- Allow only validated compatible model configurations. Verify Responses API, strict tool schemas, streaming, reasoning/output settings, token reservation and accounting compatibility before enabling a model; do not silently substitute models on failure.
- Resolve and pin a configuration version once per chat turn or extraction run, so an Admin update affects subsequent requests without changing an active request midway. Define bounded cache freshness and explicit invalid/missing-configuration error behavior during implementation design.
- Record the actual selected model in each planning/answer/extraction usage entry. Preserve existing permission checks, confirmation boundaries and budgets.
- Include canonical Admin component stories with mocked APIs, permission/version-conflict tests, configuration-read and accounting tests, and fictional provider compatibility evaluations before rollout.

This item records future scope only; implementation and rollout require a separately approved plan.

### Instruction source organization — November 9, 2026

The [planner instruction module](../packages/agent/src/planner-instructions.ts) separates named domain text, shared introduction/boundaries, planner safeguards and Estimate/Capture proposal blocks from the [provider adapter](../packages/agent/src/openai-model.ts). `instructionsFor` is now a small capability-based composer. This is source organization only: text, whitespace, domain order, system-message boundaries, fallback behavior and model workload are unchanged.

An adapter snapshot captures SHA-256 hashes of the complete serialized system/developer messages **before extraction**, for all 16 individual tool profiles and the all-tools profile, in both planning and legacy answering. The refactor must match those exact hashes without snapshot updates, in addition to the existing capability, size, privacy and runtime tests. No new UI, dependencies or live-provider calls are needed for this output-preserving refactor.

Proposed event contract (each event includes a version, run/turn ID and monotonic sequence):

| Event | Meaning |
|---|---|
| `turn.accepted` | Server-owned thread, turn, and assistant message IDs |
| `status` | Safe finite status such as thinking, retrieving, or preparing a draft |
| `message.delta` | Append visible answer text to the identified message |
| `sources` | Server-validated help article/version/section references |
| `action.proposed` | Validated review-card data for an authorized draft |
| `turn.completed` | Persisted final message and completion metadata |
| `turn.failed` / `turn.cancelled` | Terminal failure/cancellation with safe recovery information |

Parse fragmented UTF-8/SSE frames and multiple events per network chunk. Deduplicate by run/sequence. Use no-cache/no-transform response headers and verify actual incremental delivery through staging proxies. Bound the turn duration; send lightweight heartbeats where needed. Do not buffer the complete answer or simulate streaming by revealing a completed response with timers.

Stop aborts upstream work and marks the run cancelled; it never commits a proposed action. Close hides the modal without cancelling the active bounded request; reopening shows its current state. Navigation/unmount aborts the request and reloads persisted state on return; workspace switches never carry another workspace’s context. On retry, reconcile the original client turn ID before starting new generation. Never automatically retry a partial response or commit.

The UI adapter owns transport/state; shared `packages/ui` components render messages, statuses, citations, Stop/retry controls, and review cards. Keep scroll position when the user reads earlier messages, autoscroll only near the bottom, and preserve keyboard/modal behavior. Plain text is sufficient initially; any later Markdown must disable raw HTML and validate link destinations.

LangChain’s [streaming modes](https://docs.langchain.com/oss/javascript/langchain/streaming) expose model output and progress separately; use an adapter so provider/framework event shapes do not become the browser API.

## Conversation and action persistence

Current storage decision: app-owned `chatThreads`, `chatTurns`, and `chatMessages` are the canonical UI transcript and recovery state. Live LangGraph turns do not persist execution checkpoints or resume provider/tool calls; an expired active lease becomes interrupted. Legacy PostgreSQL graph rows remain subject to transcript deletion/retention, not a second independently editable transcript. See the sixth database-amplification reduction above.

- Scope threads to workspace and user; no team-shared assistant threads in this slice. Never authorize a thread using its opaque ID alone. Validate history reads, writes, delete, status, cancellation, and resume.
- Use unique client-turn IDs, one active turn per thread, persisted run states, sequence/message IDs, and an execution lease. Persist the accepted turn before provider work. Stream bounded batches without partial transcript writes; save the complete answer and terminal state atomically before `turn.completed`. Interrupted output can be lost. Detect stale runs after a web restart and expose them as interrupted; do not imply invisible generation continues.
- Reconcile against app-owned turn/history state rather than graph checkpoints. Never rerun an uncertain business commit because a stream disconnected. Use the status/history endpoint for recovery rather than requiring SSE replay.
- Continue an existing task across navigation with fresh surface/record context; New conversation creates a fresh thread. Do not silently mix workspaces or unrelated records. A selected record/task label is useful; the removed ordinary page badge and suggestion buttons remain absent.
- Expire conversations/checkpoints after 90 days of inactivity and support earlier user deletion. Redacted operational traces expire after 30 days. Action/approval audit history follows the separate business retention policy. Do not apply assistant expiry to immutable team job chat/progress history when those features are added.

The originally selected [PostgreSQL checkpointer model](https://docs.langchain.com/oss/javascript/langgraph/persistence) is retained only for legacy migrations and cleanup. Live execution intentionally runs without a saver because no graph resumption is supported. Add no cross-thread Store/memory feature until there is an explicit product requirement.

## Development RAG: real vectors early

Create reviewed Markdown articles in `knowledge/operations` and seed actual development/test vector rows during implementation, before treating RAG as complete. Keep canonical text and metadata separate from embeddings.

Initial corpus: approximately 6–8 short articles and 15–30 coherent chunks covering manual lead creation, required fields and owner choices, pipeline stages, assistant draft/confirmation behavior, permission roles, and workspace navigation. Include a clearly marked planning-status campaign-permissions article only for evaluating permissions explanations; it must say campaigns are not implemented. Never describe a planned workflow as available.

Add test-only unpublished, retired, wrong-role, wrong-plan, and prompt-injection fixtures outside the published source corpus. No real customer records, OAuth tokens, keys, or private emails belong in these vectors.

Implementation requirements:

- Select and pin a pgvector-capable PostgreSQL image matching the existing PostgreSQL major; back up and validate an isolated restore before changing an existing development volume. No volume deletion/reinitialization as an upgrade method. Verify the extension/version in both development and isolated test databases. Production restore/upgrade validation remains a release gate.
- Migrate canonical articles, chunks, and embeddings with article/version/content hashes, title, section, valid source path/anchor, publication state, implemented/planned product status, role/capability/plan applicability, embedding model/dimensions, and timestamps. Start with exact vector search for the tiny corpus; add approximate indexing only when measurements justify it.
- Add Redis/BullMQ configuration and worker handlers for idempotent embedding/reindex jobs. A local seed command explicitly targets development/test and refuses production. Mock embeddings support deterministic CI; a separate integration run generates real embeddings and proves semantic retrieval.
- Publish an article version only after all its embeddings are ready. Exclude retired/stale versions immediately, and remove obsolete vectors. Reindex on content/model changes without mixing incompatible embedding spaces.
- Filter publication, product availability, and current capability/plan metadata in SQL before supplying retrieved text to the model. Do not fetch global nearest neighbors then rely on the model to discard unauthorized chunks. Future tenant-owned documents additionally require tenant/source authorization; they are outside this slice.
- Retrieve a bounded top-k, revalidate source/version/access, and attach source references. If evidence is absent or weak, say so and offer an authorized next step. Never fabricate a citation. All citations resolve through a real help viewer or published help URL included in this slice; do not ship dead Markdown-file links.
- Retrieved text is untrusted evidence. It cannot alter tool policy or system instructions. Current lead counts/status come from authorized SQL tools, not vectors.

Proposed initial evaluation gate: 20 paraphrased how-to questions with expected article/section; at least 18 retrieve the expected section in the top three. All cited answers must use actual returned current sources. Every unauthorized/unpublished/retired/planned-as-live case must be excluded; every injection case must preserve the tool boundary. Evaluate no-answer behavior separately. These are proposed acceptance targets, not measured results.

See [pgvector documentation](https://github.com/pgvector/pgvector) for vector types, dimensions, and filtering/index tradeoffs.

## Reviewed business actions

Start with `get_lead_pipeline_summary`, `search_help`, and `draft_create_lead`, enabled only where implemented and authorized. The draft uses the same schemas and owner validation as manual lead creation; ask for missing required data rather than invent it.

Store app-owned action drafts with workspace/user, normalized inputs, capability, status, expiry, input hash, and relevant record versions. Show a structured review card with explicit Confirm/Cancel. Confirmation is a separate authenticated endpoint; natural-language “yes,” a model tool call, or retrieved instructions alone cannot trigger a commit.

On Confirm, reload permission/entitlement and current target/owner state, validate the draft, claim it atomically, reuse the shared create-lead use case, and record approval/outcome with an idempotency key in one safe transactional flow. Repeated confirmation returns the original result. Expired, modified, cross-user/workspace, replayed-conflicting, or stale drafts fail safely. Keep commit credentials/capability out of the model’s ordinary tool loop. Quota reservation/accounting must also be repeat-safe and preserve manual CRM access when the metered AI operation is capped.

## Implementation sequence and review gates

| Step | Deliverable | Review/validation gate |
|---|---|---|
| 1. Contracts and shared policy | Typed capabilities, initial surface registry, context/stream schemas, role/record matrix, provider/config decisions, domain extraction for lead services | Manual and agent permission parity; two-workspace denial tests; preserve Field assignment scope; shared transactional lead use cases before draft/commit tools |
| 2. Streaming UI and persistence | App transcript/run lifecycle, authenticated mocked stream endpoint, Thinking…, real incremental rendering, Stop/retry/history/New conversation, keyboard/mobile stories | Fragmented stream parsing, delayed first delta, duplicate Send, midstream failure, refresh, ownership, cancellation and navigation tests; no live provider yet |
| 3. Development knowledge ingestion | Safe pgvector setup, source articles/help viewer, worker embedding jobs, real development vectors and retrieval evaluator | Seed/reseed/delete/reindex tests, actual semantic matches, citations, permission/publication filtering, injection and no-answer cases |
| 4. Live bounded runtime | Server-only provider adapter and bounded LangChain loop with canonical transcript recovery; help retrieval and authorized read tools; connect modal | Visible Thinking… before real deltas, safe errors, real RAG citations, cross-tenant/role denial, bounded cost/tool/time limits, restart recovery; fictional data first |
| 5. Reviewed lead creation | Draft/review/confirm/cancel with shared domain service, persistent approvals and audit | Missing fields, owner changes, revoked role, stale/expired draft, double confirmation, retry after lost response: exactly one lead |
| 6. Release hardening | Retention jobs, usage accounting, monitoring, secret rotation/rollback runbooks, staging proxy/database recovery tests | Security/evaluation suite passes; verify no secrets/raw traces in browser/logs; model quality, first-token latency, total latency and cost measured before enablement |

Review each completed component/feature slice locally before beginning the next, per project conventions.

### First contracts/access slice — October 12, 2026

- Added strict browser turn schema: workspace/thread/client-turn IDs, registered surface, and bounded text. Client role, tools, prompt, history and arbitrary record references are rejected. Selected record context will receive a separate schema when corresponding record surfaces exist.
- Added versioned accepted/status/text/terminal event schemas and run-state types. Thinking is a finite status; error codes cannot contain raw provider details. Source and action event schemas will accompany the help viewer and review-card slices. Sequence ordering, SSE frame parsing and lifecycle transitions must be enforced by the upcoming transport/state implementation.
- Added a code-owned surface registry and tool access checks reusing `authorize` and `resolveAuthorizedCollectionScope`. No tool is executable by default. Planned tool IDs are not implementations; per-article retrieval filters, per-record repositories, thread ownership and live revocation checks remain required at their server boundaries.
- Added tests for all four roles, Field collection scope/no creation, grant revocation, unknown surface/tool, cross-workspace intent, forged browser fields, unavailable implementations/features, and stream payload validation.
- This slice adds no endpoint, provider calls, database changes, vectors, or UI behavior. Step 1 remains in progress: reusable lead services and provider/configuration decisions must precede their runtime consumers. Next reviewable slice: streaming UI stories with Thinking, incremental responses, Stop, interruption and retry; then authenticated transcript persistence/transport.


## Required regression and security coverage

Use isolated fictional workspaces for Owner, Admin, Office, and Field. Cover forged role/tool/surface/record/thread identifiers, another workspace’s thread/history/citations/drafts, membership revocation, unauthorized campaign requests and direct invocation, and changed permissions between proposal and confirmation. No model wording is an authorization assertion.

Test Origin/session checks, payload limits, rate/concurrency/token/tool limits, partial stream frames/Unicode, provider timeout/429/failure, Stop, missing terminal event, interrupted persistence, recovery, safe retry, and redacted error output. Verify `store: false` and server-only key boundaries. Use deterministic mocked-provider tests plus separately invoked live provider/vector evaluation; do not require network/model spend for ordinary CI.

Measure time to Thinking…, first visible answer delta, total turn duration, retrieval accuracy, task correctness, refusal correctness, and cost. Define model latency/cost pass limits using the development baseline and reviewed budget; never relax the zero-unauthorized-action requirement for a cheaper/faster model.


### Streaming presentation slice — October 12, 2026

The approved shared modal now renders transport-controlled thinking/streaming/terminal statuses and partial messages, with Stop and async retry callbacks. Storybook uses an explicitly fictional incremental fixture. Closing preserves the run; stopping marks partial output incomplete; retry uses the same duplicate-send lock. Status announcements are separate from token rendering. Earlier-message scroll position is retained through deltas and completion. No endpoint, transcript persistence or live provider is connected in this slice.

Review the Streaming/Interrupted Stream/Stop Stream/Close During Stream/Thinking stories, then implement the Step 2 server persistence and transport boundary. Source/action events remain reserved for their feature slices, and real vector seeding remains Step 3.


### Authenticated persistence and streaming transport — October 12, 2026

Implemented additive `chatThreads`, `chatTurns`, and `chatMessages` tables and authenticated `/api/chat/turns`, `/api/chat/threads`, and `/api/chat/cancel` routes. Thread ownership is user-and-workspace scoped, including for Owners. Each turn is accepted durably before generation, stores a bounded user message and assistant output, and uses a workspace/user/client-turn uniqueness constraint plus request hash. Replaying the exact original body returns existing state as JSON; a different payload under the same key conflicts. Reconcile through history before any explicitly requested new attempt; do not auto-regenerate a partial answer.

Current bounded transport defaults: 16,000 request bytes, 4,000 input characters, 32,000 assistant characters, ten accepted turns per user/workspace/minute, one active turn per user/workspace, a 90-second request timeout and a fixed 120-second execution lease. Persisted Stop notifications trigger state checks without periodic polling; listener loss aborts the run as unavailable. Disconnect aborts upstream. Ten-second SSE comments keep quiet connections active without database calls. Complete answer text and completion state are persisted atomically before the terminal event; interrupted answers are not saved. If terminal persistence fails, the connection ends as interrupted and the lease supports subsequent recovery.

Session validity and current `assistant.use` permission are checked before releasing each delta. History and cancellation reload current membership/grants and verify ownership. Expired active leases become interrupted on history/start; no provider work is silently resumed. Owned inactive threads can be deleted with cascading transcript removal. History currently returns the last 50 turns (ordered user-before-assistant messages); the thread list is capped at 50. Paging and scheduled 90-day retention remain release work.

The POST SSE decoder validates strict product events, run/message identity, monotonic sequences and explicit terminal events. It handles fragmented UTF-8/CRLF frames, multiple events per chunk, heartbeat comments and replayed sequences; gaps, mixed runs, raw provider payloads, oversized/truncated frames and EOF without a terminal event fail safely.

The only generation implementation is an explicitly fictional provider gated by non-production mode, the isolated test-server marker, an explicit fixture flag, and a `_test` database. The normal app returns provider-unavailable and its composer remains disabled. No credentials, real CRM tools, vectors, LangGraph checkpoints or live provider were added. History access for future sensitive tool outputs still needs source/record provenance and current permission filtering before those tools are introduced.

The additive migration was rehearsed on a private restored development backup, then applied locally. Next slice: published help articles/viewer and real fictional development embeddings, with role/publication filters and retrieval evaluation. Live provider integration and the modal's persisted transport adapter follow after that review.


### Development knowledge ingestion and retrieval — October 12, 2026

Implemented eight reviewed Markdown articles under `knowledge/operations`, split into 23 heading-based chunks. Seven articles describe current behavior and explicitly identify future assistant actions and other unfinished workflows; the campaign planning article is marked planned and is excluded from current retrieval and the help viewer. These sources contain no customer records.

Local PostgreSQL extends the exact existing PostgreSQL 17 Alpine base with checksum-pinned pgvector 0.8.7. Before switching the preserved volume, a private backup was restored into a disposable new-image container: account/CRM fingerprints matched before and after the additive migrations. Both development and isolated test databases now have the extension. No volume was reset. Redis has loopback-only exposure, AOF persistence and `noeviction`.

Canonical articles, chunks, content hashes, source paths/anchors, publication status, role/capability/plan/product metadata and model/dimension namespaces are stored separately from embedding rows. BullMQ jobs identify reviewed articles by slug/content hash/model/dimensions; they do not carry credentials or CRM records. A draft build immediately invalidates older versions and removes their vectors. Only a complete embedding batch publishes transactionally; superseded jobs cannot republish. Missing articles retire on manifest reconciliation. Reseeding unchanged articles skips the provider entirely.

The server embedding adapter pins OpenAI `text-embedding-3-small` at 1536 dimensions, validates indices/count/model/vectors, bounds request/response size and timeout, and redacts provider failures. The filesystem loader is a worker-only package entry point, separate from web runtime imports. Query embedding is preceded by an access check and followed by a fresh locked authorization transaction.

Exact cosine retrieval filters current publication/head, implemented product status, role, capabilities, the free entitlement baseline, and embedding space in SQL before returning at most three sources. Similarity below 0.35 produces no source. Unknown plans fail closed; an authoritative paid entitlement service is not implemented. Retrieved text is labelled untrusted reference material and has no tool authority. Citations resolve to an authenticated, current-version help viewer, which repeats the access checks and renders escaped plain text. The viewer has Default/Narrow Storybook stories; it does not change the assistant launcher/modal design.

Measured real development results: 23 embedding rows generated; 19/20 paraphrased questions retrieved the expected section in the top three (target at least 18/20). The one miss was the expected `roles#field-access` section for a Field lead-creation question; related lead-creation/assignment sections ranked above it. The unrelated-question probe returned no evidence at the 0.35 threshold. This small development corpus is a baseline, not a production relevance guarantee. A repeat seed completed zero jobs and made no new embedding calls.

Validation: 309 unit tests, rollback-only SQL seed/reseed/reindex/publication/stale-job/retirement/access/no-answer fixtures, 24 browser/API tests (citations, chat transport and authorization/permissions regressions), four narrow/wide help story interaction/Axe/layout checks, visual review, workspace lint/typecheck and production build passed. Adversarial text remains a returned untrusted reference without changing the app policy; live model prompt-injection/tool-call evaluations remain pending until Step 4 introduces a model loop. No conversation model, lead data tool or commit tool is enabled by this slice.

Next review: inspect the Help/HelpArticle story, then connect the bounded live runtime and persisted modal adapter, with Thinking before real deltas, current-access citations and authorized SQL read tools. Do not enable reviewed lead writes before the separate draft/confirm slice.


### Live bounded read-only runtime — October 12, 2026

The local app now connects the approved modal to authenticated POST SSE and canonical private history. Thinking appears immediately; visible answer deltas arrive from the provider. Stop, close/reopen, refresh, explicit retry and New conversation are connected. A lost acceptance response is reconciled by replaying the identical request key, without regenerating. Interrupted turns never resume automatically.

The server pins `gpt-6-luna` through LangChain's OpenAI Responses adapter with `store: false`, tracing disabled and zero automatic provider retries. LangGraph performs one planning call, at most two distinct authorized read tools, then one answer call with no tools available. Limits: 400 planning tokens, 1,200 answer tokens, 16,000 answer characters, last 12 canonical messages capped at 24,000 characters, and a 90-second total deadline. Existing acceptance/concurrency/rate limits still apply. Query embeddings honor the same cancellation signal.

Only `search_help` and `get_lead_pipeline_summary` are implemented. Pipeline counts reuse the manual Home SQL repository and mandatory assignment/workspace scope. Every tool and released delta rechecks the session, current app authorization and the accepted policy fingerprint. Help links are server-owned, current-version references; retrieved text cannot activate tools. The answer call receives untrusted evidence but has no tool capability. Campaigns, lead details and all business mutations remain unavailable.

Each accepted turn records its role/policy/grant fingerprint and authorized sources. History hides assistant output after fingerprint changes or loss of source access/publication/version, while retaining the user's messages. This intentionally includes conservative invalidation after any policy revision. Checkpoints contain only turn ID and phase, never prompts, transcripts or tool results. Each execution uses a fresh turn ID; deleting a private thread atomically removes its checkpoint rows as well as canonical transcript. Additive migrations and repair migration were verified on a disposable restored backup without changing account/CRM records.

Validation: 320 unit tests; chat/lead and authorization/permissions browser regressions; 38 desktop/mobile assistant interaction, accessibility and layout checks; production build, lint and typecheck. Two opt-in live evaluations passed using fictional isolated accounts: streamed cited help with refresh/checkpoints, Field-only assigned totals, user role-forgery refusal and a retrieved prompt-injection fixture that could not activate write tools. These small live tests establish a development baseline; production quality, budget and operational release gates remain separate.

Next review: try product-help and lead pipeline questions in the local app. After approval, implement reviewed lead drafts and explicit confirmation as Step 5.


### Explicit tool structure — October 12, 2026

Extracted the two existing read tools into `packages/agent/src/tools/` definitions and `apps/web/src/server/chat/tools/` server handlers. Explicit typed registries replace inline model definitions and tool-specific runtime branching. Shared schema validation, fresh authorization, untrusted help evidence, source persistence, scoped lead repository reads and execution limits are preserved. No database or UI change is required. See [assistant tool organization](chat-tools.md) for responsibilities and the checklist for adding future tools; write tools still require the separate draft/confirm slice.

Tool-extraction validation: 322 unit tests, workspace typecheck/lint and production build passed. Both opt-in live evaluations passed after extraction, including cited help, Field-only totals and user/retrieved injection checks.


### Reviewed lead creation — October 12, 2026

Added `draft_create_lead` as an explicitly registered draft capability on Home/Create lead, gated by current assistant, lead creation and assignment permissions. The model has no commit tool. Missing name/service, invalid fields or unavailable owners produce clarification evidence rather than a confirmable proposal. Drafts are normalized with the manual lead schema and display every saved field; stage is New and an unspecified owner is Unassigned. To revise, ask for a new draft. Name-based owner lookup and inline editing remain outside this slice.

A saved private proposal contains the exact lead payload/input hash, original access fingerprint, capability, owner snapshot/version, turn/thread identity, state, expiry and result ID. Proposals expire after 15 minutes; a newer valid draft supersedes pending drafts in the same thread. The review event is released only after successful generating-turn completion; stopped/failed turns cannot be confirmed. History repeats current authority checks. Follow-up model context includes app-recorded action outcomes, never a provider-owned memory of approval.

The explicit `/api/chat/actions` endpoint accepts only draft identity, hash and confirm/cancel decision. It validates session/Origin, current grants, original policy fingerprint, completed turn, immutable normalized payload, expiry and owner state. An exclusive workspace transaction calls the shared manual create-lead use case and saves approval/outcome plus append-only audit atomically. Lost responses and concurrent repeat confirmation return one original lead. Cancellation, expired/superseded/stale drafts, forged edits, cross-user/workspace attempts and permission changes fail closed.

Migration `202610120006_chat_actions` adds proposal and non-content audit tables after a private backup/restore rehearsal. Proposal data cascades with transcript deletion; audit survives it for the separate business retention policy. No existing account or CRM records were changed by the migration. Audit storage failure rolls back the lead and leaves a safely retryable pending proposal.

Added `Assistant/LeadDraftCard` stories for review, saving, failure, confirmed/cancelled/expired/superseded states and narrow/wide checks. Live fictional evaluation verifies real-model drafting and explicit creation; deterministic tests cover role parity, boundary attacks, expiry, revocation, owner changes, repeat confirmation, response loss and transaction rollback. See [tool organization](chat-tools.md) for file responsibilities. Production budgets, scheduled retention, staging streaming and operational release checks remain outstanding.

Reviewed lead validation: 325 unit tests, 28 chat/approval/manual-lead browser checks, 54 narrow/wide assistant/review interaction/Axe/layout checks, three live model/RAG/security evaluations and an additional live verbal-confirmation/outcome check passed. Workspace lint/typecheck and production build passed. The corpus remains eight articles/23 vectors after refreshing three changed articles.

The additional deletion check passed: private proposal data is removed with its transcript while the created lead and immutable non-content audit survive.

### Implemented: scheduled private assistant retention

The local worker now schedules transactional cleanup after 90 days of inactivity, preserving active/recent threads, immutable action audit records and usage accounting. See [chat retention](chat-retention.md) for exact activity semantics, bounded batches, rollback checks and production deployment limitations. Earlier notes listing scheduled retention as unimplemented are superseded for the local worker; production scheduling and monitoring remain release work.
