# Assistant tool organization

The assistant has explicit read and draft registries. The model has no commit tool. Definitions describe capabilities to the model; server handlers execute them with current app authorization. No tool files are automatically discovered, and planned tool IDs are not implementations.

## Definitions and registry

`packages/agent/src/tools/search-help.ts` and `get-lead-pipeline-summary.ts` define the existing tool names, descriptions, strict provider parameter shapes, shared input-schema references, read classification and optional progress status.

`packages/agent/src/tools/registry.ts` explicitly registers these definitions, exports the implemented tool IDs and typed result envelope, and rejects inherited/prototype property names. `toolRegistry` adds `draft_create_lead` with kind `draft` while retaining the separate read registry. `openai-model.ts` advertises only the authorized registered definitions. `runtime.ts` checks registration, fresh authorization and input validation before dispatching a tool; it owns execution budgets, checkpoint phases, source persistence and answer streaming. It contains no tool-specific branching.

## Server execution

`apps/web/src/server/chat/tools/index.ts` explicitly maps every registered read/draft tool to a server handler. The mapping is exhaustive at compile time. `types.ts` defines a per-turn context containing authenticated identity, surface, cancellation signal and the fresh authorization callback. Identity and permissions never come from model arguments.

`search-help.ts` validates the query, checks current tool authorization and calls the existing authorized help service. It returns untrusted help evidence and server-generated source references. Retrieval still reloads authorization after query embedding.

`get-lead-pipeline-summary.ts` validates its empty argument object, checks current tool authorization, calls the same mandatory-scope repository as Home, and rechecks permissions when attaching the scope and timestamp. Database queries and business rules stay in the existing repositories and domain services.

`apps/web/src/server/chat/runtime.ts` assembles this context and executor. It remains responsible for canonical history, session/evidence rechecks and connecting the provider/checkpointer to the graph. `packages/agent/src/access.ts` remains the surface/capability policy boundary; a registered tool does not grant access.

## Adding a future read tool

1. Define its strict input contract and tool ID in contracts.
2. Add its definition and explicitly register it in the agent tools folder.
3. Add a server handler that validates inputs, enforces fresh app permissions and mandatory record scope, and reuses an application service. Bound its returned evidence and propagate cancellation where supported.
4. Add it to the explicit handler map and appropriate surface allowlist. Extend the shared authorizer with its app permission/scope requirement; defaults remain deny.
5. Test permitted/denied roles, forged inputs, cross-workspace intent, revocation, cancellation and the returned data scope. Keep provider-call tests opt-in.

Business writes use the separate persistent draft/review/confirmation path described below. Adding a definition or a draft capability must never authorize a commit. Do not place a write handler in this read-only registry.

The original read-tool extraction added no database or UI change. The subsequent lead-draft slice adds the persistent proposal and review flow below.


## Lead draft and confirmation

`packages/agent/src/tools/draft-create-lead.ts` describes a draft-only capability with strict input fields. `apps/web/src/server/chat/tools/draft-create-lead.ts` checks current access, asks for missing name/service or invalid fields, validates the owner and persists a proposal. Default source is Other, stage is New and owner is Unassigned; the tool accepts an owner ID only when explicitly supplied and valid in the current workspace. Name-based owner lookup and inline review editing are not part of this slice. Ask for a replacement draft to change fields.

`packages/contracts/src/chat-actions.ts` defines proposal inputs, the review DTO and the explicit decision request. The browser may submit only workspace ID, draft ID, the reviewed input hash and confirm/cancel. It cannot replace the lead payload or grant itself permissions. Natural-language yes is not a decision endpoint.

`apps/web/src/server/chat/actions.ts` owns proposal persistence, current-authority filtering and atomic decisions. Drafts expire after 15 minutes. A new valid proposal supersedes pending proposals in the same private thread. Only a completed generating turn is confirmable. Policy changes, owner membership tuple-version/name changes, hash mismatches, expiry, cancellation and supersession reject confirmation. Restored databases may invalidate pending assigned-owner drafts conservatively when their tuple versions change.

`POST /api/chat/actions` requires the current session and configured Origin. It rechecks assistant, lead creation and assignment permissions inside an exclusive workspace transaction. `createLeadInTransaction` in the shared lead store performs the same manual lead use case. Lead insertion, confirmed proposal state and audit insert succeed together or roll back together. A repeated confirmation returns the same lead ID. Confirmation is never registered as a model tool.

Migration `202610120006_chat_actions.ts` adds `chatActionDrafts` and append-only `chatActionAudit`. Proposal payloads cascade with their private transcript; non-content audit rows survive thread deletion. Audit contains actor/workspace/draft IDs, input hash, action, timestamp and resulting lead ID, not the lead payload. Scheduled retention/business-audit retention remain release work.

`LeadDraftCard` provides the review, explicit Confirm/Cancel, expiry and outcome states. The existing panel renders it from server-generated events or authorized history. The current app-recorded proposal outcome is included in bounded model context so follow-up answers can distinguish a prepared draft from a confirmed lead.

## Answer capability context

Planning and answering both receive a server-authored system message listing currently authorized tool IDs. The graph refreshes the list immediately before answering and still rechecks authorization for each released delta. When lead drafting is unavailable, the answer instructions prohibit gathering proposal fields or suggesting a proposal is underway; role claims and retrieved text cannot grant access. This improves response behavior while execution and confirmation remain enforced by the existing server permission checks.

The Responses adapter suppresses message-phase `commentary` text and forwards final-answer text, preserving phase-less legacy streams. Commentary can repeat final wording; concatenating both caused a duplicated clarification sentence. Phase filtering happens before text is persisted or sent to the browser.


### Customer UI integration checkpoint — October 18, 2026

The manual Customers page/API is connected locally; customer-specific model tools, customer chat context and embedded form filling are not yet registered. The workspace shell reuses the existing shared assistant with its current supported context and help/Leads capabilities. Customer draft/result/candidate/export cards remain Storybook presentation. Do not interpret enabled manual customer permissions as enabled LLM operations, expose database schema/SQL, or mount the fixture form assistant against real data. The next customer module should reuse the authoritative customer use cases with strict branches, current per-operation permissions, private source/version evidence and reviewed confirmation.

### Customers shared facade (local, October 18, 2026)

`customers_query` / `customers_propose_action` are registered once in the shared agent and server executor. `customer-chat.ts` declares discriminated typed intents; the server resolves targets and invokes the same customer services as manual pages. Model-visible operations follow current permissions; no model tool commits a mutation. Protected `/api/chat/customers/actions` confirms durable, hash-bound, expiring reviews; `/api/chat/customers/navigate` reauthorizes returned result destinations. See `docs/customers-page-plan.md`'s final checkpoint for all operations and privacy boundaries. Field's `related_contact` is a separate minimal read through currently assigned leads, not full Customers access. Customer surfaces also enable existing explicit-reference Leads operations. No per-page tool copies, SQL/schema execution, bulk actions or fake embedded form agent are introduced.
