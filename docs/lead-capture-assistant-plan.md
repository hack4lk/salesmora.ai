# Lead Capture assistant implementation plan

Prepared November 2, 2026. Status: approved by the user; checkpoints one through three approved; checkpoint four implemented and verified locally for review on November 3, 2026. See the [contracts and service-gap inventory](lead-capture-assistant-contracts.md), [canonical presentation checkpoint](lead-capture-assistant-ui.md) and [connected reads/evidence verification](lead-capture-assistant-reads.md) and [setup proposals and confirmations](lead-capture-assistant-setup.md).

## Intended result

Extend the existing workspace assistant across Lead Capture and Intake Review. A teammate can describe the setup they want, review concrete configuration suggestions, save an approved draft, review launch or lifecycle changes, understand current source performance, obtain actual installation instructions, and work through intake decisions. Use the existing streaming conversation, private history, Stop/retry, allowance accounting, evidence validation and explicit browser confirmation infrastructure.

“Fully capable” means coverage of the approved Lead Capture workflows, including their missing application services. A help-only connection or a tool registry entry is not completion. Separate source creation, draft saving, field/sample approval, publication and intake decisions must remain visible outcomes; preparing a suggestion must never be reported as completing one of those actions.

## Verified starting point

- `packages/contracts/src/chat.ts` contains no Lead Capture/Intake surfaces, record references or tools. The shared registry, runtime result types and server executor have no capture handlers.
- `apps/web/src/server/lead-capture/read-page.tsx` renders the shared shell without enabling the assistant or passing capture context. Its default shell surface is Home; explicitly register the appropriate capture surface instead.
- The connected website wizard passes `canSuggest=false`; Gmail extraction and assistant callbacks are unavailable. Approved field-mapping components already exist and must be connected rather than replaced.
- Source list/detail, draft create/save/revision, publication review/commit/cancel, lifecycle services and installation projections exist. Reuse their permissions, immutable versions, access/capacity checks and real delivery authority.
- Intake evidence/decision contracts and approved page/components exist, but the inspected capture data module and application routes do not implement the complete intake read/update/decision flow. Build those shared application services before claiming assistant intake completion. Check for concurrent work before adding them.
- Website delivery is deployed to staging with all activation controls off. Gmail connection and ingestion are not live. Local assistant development does not require changing those hosted gates.

## Capability coverage

| Area | Assistant behavior | Review/save boundary |
| --- | --- | --- |
| Source discovery | Find sources by name/type/status, respect current filters, clarify ambiguous names, open authorized records | Navigation links resolve current access; no guessed IDs |
| Source summaries | Explain counts, last activity, approved versus draft versions, pending launches and blocking reasons | Database-derived snapshots with retrieval time; distinguish unavailable data from zero |
| Website setup | Turn a business brief into field/order/required/mapping and content suggestions; explain choices and ask about missing facts | Structured draft comparison; explicit application/save; never silently replace unsaved work |
| Workflow setup | Propose existing supported assignment, tags, intake mode and notification settings | Resolve current teammate/tag options; expose notification effects before confirming |
| Draft changes | Create source drafts, begin revisions, propose validated configuration edits | Actor-bound saved proposal; explicit confirmation calls canonical source service |
| Sample guidance | Explain sample rule checks and mapping uncertainty; suggest corrections supported by sample text | Bind approval to exact sample/rules/configuration fingerprints; no invented successful check |
| Gmail sample mapping | Extract supported fields from a pasted sample, show exact source quotes, flag uncertainty, refine findings conversationally | Existing example/findings UI; explicit field/sample approval; connection readiness remains separate |
| Publication | Review immediate/scheduled launch or revision, explain timezone, capacity, readiness and installation consequences | Exact source/draft/approved versions and current readiness; browser confirmation only |
| Lifecycle | Prepare pause/resume, archive/restore, duplication and scheduled-launch changes/cancellation | Existing reviewed dialogs/services; add missing canonical operations before enabling their proposals |
| Installation | Explain and show actual persisted hosted URL, iframe and loader snippets, and consent/version behavior | Use existing scoped installation projection; never fabricate a published URL |
| Intake discovery | Find awaiting/processed items and explain source, flags, uncertainty and duplicate candidates | Requires independent intake and linked-lead permissions; bounded evidence display |
| Intake decisions | Draft corrections, create/separate/link proposals and dismissal with precise selected changes | Existing approved editor/review UI, immutable source evidence, exact review/item/lead versions, explicit confirmation |
| Product help | Answer setup, scheduling, lifecycle, intake and installation questions with reviewed citations | Permission-filtered help; operational facts come from current tools |

The assistant cannot enable server delivery gates, provision credentials, override capacity/permissions, rewrite receipt evidence, complete OAuth in the background or claim Gmail is connected. Pasted-email mapping can work independently of Gmail OAuth; mailbox connection, retrieval and ingestion remain separate integration work. This is the authenticated teammate assistant; a conversational bot for anonymous form visitors would be a separate product surface.

## Shared architecture

### Context and tools

Register explicit surfaces for source list/new/setup/detail and intake list/detail, with capture-source/intake references and validated list filters. Context is browser intent only: load identity, records, versions, permissions and readiness from server state. Preserve existing global authorized-tool availability where appropriate so an authorized teammate can ask about capture from Home or another feature, while selected-record and filter context remains surface-specific.

Use `lead_capture_query` and `lead_capture_propose_action` as explicit read/proposal tools, with strict discriminated operation schemas and a centralized capability matrix. The model receives only currently authorized operations. Enforce `assistant.use` plus the exact source/intake/linked-lead permissions on every invocation and confirmation. Derive collection and record scopes from current application authorization, never from a role-name shortcut or model-supplied workspace ID.

No model commit tool. A tool may persist an assistant proposal; business mutations require a dedicated authenticated browser confirmation route. Cancellation resolves the proposal without changing the business record.

### Durable proposals and evidence

Persist proposals through the existing chat proposal conventions with identity, thread/turn, operation, payload hash, access stamp, expiry and relevant source/draft/approved/intake/review/lead versions. Use a narrowly scoped additive migration where the existing schema does not safely support this feature; do not overload an unrelated feature's payload column. Capture business audits and immutable operation results must survive private transcript retention.

Confirm under the established transaction and workspace/source lock order. Recheck current session, membership, permissions, record state, versions, sample approval, capacity and delivery authority. Bind confirmation to the reviewed payload. Exact retries return the recorded outcome; changed payloads, stale records, superseded/expired proposals and revoked access require a new review. A chat message saying “yes” cannot execute confirmation.

Store bounded source/intake read stamps with the turn. Carry them through streaming, completion, follow-up turns, history reload and result navigation. Revalidate before model reuse and browser rendering; redact or withhold stale/revoked evidence consistently with the other features. A fresh proposal is required after conflicting edits. Do not expose unrelated source content through aggregate results, errors or clarification suggestions.

Source names, descriptions, form answers, email samples, extracted text, retrieved help and historical conversation text are untrusted data. They cannot alter tool policy, impersonate confirmation or supply server readiness. Validate source quotes and field IDs deterministically. Bound sample/field/result sizes, model calls and output; use existing usage reservations/accounting and cancellation.

### UI integration

Keep the shared floating assistant, existing dark-blue conversation and canonical source/setup/intake components. Add typed capture read results and a thin capture proposal card adapter. That adapter composes the approved field, workflow, publication, lifecycle and intake review components; do not build a second copy of their forms inside chat.

Wire website “Suggest fields” to a real structured proposal. Feed explicit current unsaved configuration through a bounded setup-specific request, label it as unsaved, and bind returned suggestions to its fingerprint. If the wizard changes while generation is pending, require regeneration/review. Applying suggestions changes the local draft only when the teammate explicitly chooses it; persisting uses the existing Save boundary.

Connect the approved Gmail example/findings conversation to the same authorized provider/proposal services and usage accounting. Do not create an independent untracked provider client. Preserve corrections, exact source text and uncertainty. Changing the example or rules invalidates prior findings/sample approval.

Stories must exercise the canonical connected adapter with mocked APIs and fictional data. Include pending/streaming, cancellation, provider failure, allowance denial, no permissions, stale context, conflict/reload, readiness loss, exact retry and completed outcome states. Reuse current navigation/leave guards and preserve dirty wizard changes when opening or closing chat.

## Implementation checkpoints

Each checkpoint ends with a reviewable result under the repository's incremental-review instruction. This document is checkpoint zero; implementation starts after design approval.

1. **Contracts and capability policy.** Finalize operations, surfaces, context/evidence/proposal schemas, exact grants and service-gap inventory. Add focused contract/permission tests. Record which operations are not yet enabled rather than advertising unavailable handlers.
2. **Canonical assistant presentation.** Implement capture result/proposal adapters and colocated stories using the approved components. Review responsive, keyboard, focus and accessibility behavior before page integration.
3. **Page integration and read assistant.** Enable the shared shell on source pages; add context adapters, authorized source queries, actual installation reads, read evidence persistence/history validation and reviewed help. Verify real local chat turns and navigation. This is an intermediate checkpoint, not full completion.
4. **Setup assistant and confirmed draft writes.** Add durable proposal storage/confirmation, source create/revision/save, website field/workflow suggestions, pasted Gmail sample extraction/refinement and exact sample approvals. Connect both shared chat and approved inline setup controls to those services. Verify that no business write occurs from generation or verbal agreement.
5. **Publication and lifecycle assistant.** Wire canonical launch/revision/schedule/cancel/pause/resume/archive/restore/duplicate reviews. Implement any missing shared operations first. Use the same scoped delivery authority as normal UI, including scheduler readiness behavior. Test blocked and successful paths locally.
6. **Complete shared intake backend and pages.** Build authorized list/detail/evidence/correction/duplicate-review and create/separate/link/dismiss transactions, manual routes and canonical page connections. Preserve immutable receipt evidence and current lead admission/assignment/audit behavior. This closes the underlying application gap before assistant intake mutations.
7. **Intake assistant.** Add bounded intake queries/explanations, evidence stamps, correction and decision proposals and reviewed confirmation using checkpoint six's services. Cover duplicate ambiguity, stale target leads, capacity/access loss and exact retry.
8. **Integrated completion review.** Run the full capability matrix across current roles, shared/inline assistant entry points, persisted history and all supported operations. Freeze only owned changes over a reconciled current baseline. Report remaining provider integration limits explicitly. Staging deployment/activation follows as a separately reviewed checkpoint.

## Acceptance criteria

- Every enabled operation has a server handler, current capability check, typed result/proposal, canonical review UI, durable outcome and evidence/history validation.
- Unit tests cover strict tool schemas, context/reference mismatch, exact permissions, untrusted prompt injection, unsupported field/quote claims, sample invalidation, operation selection and bounded payloads.
- Disposable runtime-role database tests cover cross-workspace denial, source/intake/lead access loss, expiry, supersession, stale-version conflicts, concurrent confirmations, exact retries, atomic audits and transcript retention. Never point rehearsal harnesses at staging.
- Authenticated browser tests cover actual streamed source queries, website brief-to-reviewed-save, dirty-draft protection, sample mapping refinement, confirmed launch/lifecycle, installation links, intake correction/duplicate decisions and cancellation/recovery. Model output alone does not prove a mutation occurred; assert durable state and visible outcome.
- A bounded provider evaluation checks real structured tool selection and grounded answers using fictional data, including injection attempts and verbal-confirmation denial, after deterministic/local tests pass. Use existing provider settings and accounting; report fixture-only verification honestly if real provider access is unavailable.
- Canonical stories pass interaction/accessibility checks; inspect desktop and 320px mobile results. Run relevant types/lint/regressions and update assistant capability/help documentation.
- Local work preserves unrelated dirty-tree changes. Reconcile concurrent chat/contracts/admin edits before modifying shared files. No hosted gates, sources or receipts change during implementation.

## Operational context

The [staging activation checkpoint](lead-capture-activation-staging-20261102.md) remains the current deployment record. Its no-email scoped pilot is pending and independent of this local assistant implementation. Future assistant tests must not imply that staging publication, Gmail or real-user readiness is already enabled.
