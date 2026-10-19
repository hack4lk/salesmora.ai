# Main assistant chat implementation plan

**Status:** October 12, 2026: the local assistant supports current help, scoped lead pipeline reads and reviewed lead creation. The new draft tool prepares a persistent proposal; only a separate explicit browser confirmation can create a lead. The approved floating modal retains Thinking, streaming, history, Stop/retry and citations. Owner/Admin/Office/Field and current app permissions remain authoritative. Other business writes and production release gates remain deferred.

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

Check membership and record scope on each turn/read/action. Recheck before releasing newly retrieved sensitive data and before commits; stop an active run when revocation is detected. Content already delivered cannot be recalled. Permission-filtered retrieval and stored history require the same checks: an old assistant answer cannot bypass a later revocation.

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

Proposed storage decision: app-owned `chatThreads`, `chatTurns`, and `chatMessages` are the canonical UI transcript. PostgreSQL LangGraph checkpoints are execution/resume state referencing those IDs, not a second independently editable transcript. Store only execution context needed to resume; make transcript/checkpoint deletion consistent.

- Scope threads to workspace and user; no team-shared assistant threads in this slice. Never authorize a thread using its opaque ID alone. Validate history reads, writes, delete, status, cancellation, and resume.
- Use unique client-turn IDs, one active turn per thread, persisted run states, sequence/message IDs, and an execution lease. Persist the accepted turn before provider work. Save partial output in bounded batches and mark completion durably before `turn.completed`. Detect stale runs after a web restart and expose them as interrupted; do not imply invisible generation continues.
- Use an outbox/reconciliation record where checkpoint and app state cannot be committed atomically. Never rerun an uncertain business commit because a stream disconnected. Add a status/history endpoint for recovery rather than requiring SSE replay in the first slice.
- Continue an existing task across navigation with fresh surface/record context; New conversation creates a fresh thread. Do not silently mix workspaces or unrelated records. A selected record/task label is useful; the removed ordinary page badge and suggestion buttons remain absent.
- Expire conversations/checkpoints after 90 days of inactivity and support earlier user deletion. Redacted operational traces expire after 30 days. Action/approval audit history follows the separate business retention policy. Do not apply assistant expiry to immutable team job chat/progress history when those features are added.

Use the [PostgreSQL checkpointer model](https://docs.langchain.com/oss/javascript/langgraph/persistence) already selected in the architecture. Add no cross-thread Store/memory feature until there is an explicit product requirement.

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
| 4. Live bounded runtime | Server-only provider adapter and LangChain loop/checkpointer; help retrieval and authorized read tools; connect modal | Visible Thinking… before real deltas, safe errors, real RAG citations, cross-tenant/role denial, bounded cost/tool/time limits, restart recovery; fictional data first |
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

Current bounded transport defaults: 16,000 request bytes, 4,000 input characters, 32,000 assistant characters, ten accepted turns per user/workspace/minute, one active turn per user/workspace, a 90-second request timeout and a fixed 120-second execution lease. A persisted Stop is checked every 250ms to abort generation while waiting for tokens. Disconnect aborts upstream. Ten-second SSE comments keep quiet connections active. Completion is persisted before its terminal event. If terminal persistence fails, the connection ends as interrupted and the lease supports subsequent recovery.

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
