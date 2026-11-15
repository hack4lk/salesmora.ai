# Chat proposal consolidation: compatibility and schema contract

> Historical migration paths in this document refer to the prior release. Current fresh databases use the [curated baseline](../packages/data/src/baseline/); existing databases require a separately designed upgrade.

Status: a canonical-only application and guarded retirement migration are
staged locally. Fresh migration replay removes 14 empty legacy proposal and
12 empty legacy lifecycle-audit tables; existing rows block retirement.
No existing development, test or production database has been migrated.
The historical backfill and rollback sections below describe earlier
rehearsals, not a supported upgrade path for this canonical-only release.
Broader regression-suite adaptation and production readiness remain open.

## Scope and invariants

Replace all 14 proposal-storage tables with one canonical `chatProposals`
store and one transaction-bound repository. Materials currently shares Work
Order storage, so the target has **15 logical families**, not 14.

Consolidate persistence, owned lookup, locking, lifecycle updates, supersession
and lifecycle auditing. Keep domain-specific preparation, current record
permissions, fingerprints, confirmation commands, receipts and UI components.
Do not consolidate business audits, export logs, Estimate delivery/token
records, Capture samples or business records into proposal storage.

Required invariants:

- Existing proposal IDs, binding hashes, timestamps and external API shapes
  survive migration. An existing pending proposal does not require regeneration
  solely because storage changed.
- Proposal preparation never executes its business operation. Existing
  preparation side effects, such as supersession, remain transactional.
- Independent review, navigation and confirmation requests use fresh
  authority. An admitted answer reuses its request authority; the repository
  must not reload it or trust identity supplied by model arguments.
- Owned source-turn, thread, target/version and private-record checks remain
  domain-owned. A stored proposal or audit event does not grant access.
- Model history remains recorded state plus authorized narrative, not a
  confirmation-ready review. Display history retains current review checks.
- Interruption does not persist completed prose or staged turn metadata.
  Proposal rows may already exist from a committed tool transaction; their
  source turn still gates whether they can be used.
- No network/model wait is held inside a database transaction.
- Corrupt data or unknown schema versions fail explicitly. There is no
  automatic legacy-table fallback or permanent dual-write architecture.

## 1. Verified source-storage matrix

All source proposal tables persist `pending`, `confirmed`, cancellation and
`superseded`. Customer/Work Order storage spells cancellation `canceled`;
the other tables spell it `cancelled`. UI states such as expired, stale,
conflict or forbidden must not be mistaken for new persisted lifecycle states.

`P` below means a database-enforced unique pending row for
`(workspaceId, userId, threadId)` within that source table.
`T` means a database-enforced unique `turnId` across all states.
`R` means unique `(workspaceId, userId, requestId)` across all states.

| Source table | Target family | Existing uniqueness | Stored binding/body and confirmation effect | Existing lifecycle audit |
|---|---|---|---|---|
| `chatActionDrafts` | `action` | T; same-family pending supersession in code, not a pending unique index | `actionType`/capability, input/access hashes, Lead/owner snapshot and per-action payload columns. Create, stage, update, assign, note, archive/restore, export and typed delete remain distinct commands. | `chatActionAudit`; immutable, including original `draft.*` event names, action type and optional Lead ID |
| `chatEstimateDrafts` | `estimateDraft` | P | `estimateDraftChatStoredSchema`; hash/expiry at `view.draft`. Confirm creates/updates a Draft; editor navigation does not confirm. | `chatEstimateDraftAudit` |
| `chatEstimateShares` | `estimateSharing` | P | `estimateShareChatStoredSchema`; `ticket` binding and review. Confirm performs the existing share/send/publish command; receipt is not proof of email delivery. | `chatEstimateShareAudit` |
| `chatEstimateDecisions` | `estimateDecision` | P | `estimateDecisionChatStoredSchema`; `ticket`, review, decision value and confirmability. Confirm records the reviewed decision/outcome. | `chatEstimateDecisionAudit` |
| `chatEstimateDraftActions` | `estimateDraftAction` | P | `estimateDraftActionChatStoredSchema`; source/review/plan binding. Confirm revises or duplicates, including existing reuse semantics. | `chatEstimateDraftActionAudit` |
| `chatEstimateVoids` | `estimateVoid` | P | `estimateVoidChatStoredSchema`; review hash and withdrawal reason. Confirm withdraws the reviewed Estimate. | `chatEstimateVoidAudit` |
| `chatEstimateArchives` | `estimateArchive` | P | `estimateArchiveChatStoredSchema`; reviewed archive/restore mode and target version. Confirm changes the archived flag. | `chatEstimateArchiveAudit` |
| `chatEstimateDraftDeletes` | `estimateDraftDelete` | P | `estimateDraftDeleteChatStoredSchema`; exact typed confirmation and receipt checks. Confirm deletes an eligible Draft, not arbitrary Estimate revisions. | `chatEstimateDraftDeleteAudit` |
| `chatEstimateConversions` | `estimateConversion` | P | `estimateConversionChatStoredSchema`; decision is review/cancel. Review appends `review-opened` and leaves the proposal pending; it neither confirms nor creates a Job. | `chatEstimateConversionAudit` |
| `chatCalendarProposals` | `calendar` | P | `calendarProposalStoredSchema`; hash/expiry at `draft`, command, authority, captured visit/records and result receipt. Confirm schedules or clears the reviewed visit. | `chatCalendarProposalAudit` |
| `chatCaptureSetupProposals` | `captureSetup` | P + R | Typed setup stored envelope; hash/expiry at `view.ticket`, input, authority and optional manual context. Create/begin/save operations save a Draft; application operations return suggestions, with sample approval retaining its separate sample evidence. | `chatCaptureSetupAudit`; immutable with explicit workspace-erasure/user-deletion exceptions |
| `chatCaptureSourceProposals` | `captureSource` | P + R | Typed source stored envelope; hash/expiry at `view.ticket`, input/authority/delivery binding and receipt. Publish/schedule/lifecycle/duplicate commands retain native readiness and version checks. | `chatCaptureSourceAudit`; same immutability trigger as setup |
| `chatCustomerDrafts` | `customer` | T | Payload/review, input/access hashes, customer stamp and explicit expiry. Confirm executes Customer create/mutation/export; delete requires its current typed/unlink checks and redaction behavior. | No dedicated lifecycle audit in this table's creation migration; native business auditing remains separate |
| `chatWorkOrderDrafts` | `workOrder` or `material` | T shared by both target families | Payload/review, input/access hashes and explicit expiry. `material`/`material-export` payload kinds route to Materials; other kinds route to Work Orders. Confirm retains native mutation/export behavior. | No dedicated proposal-lifecycle audit in this table's creation migration; `workOrderExportAudit` and domain events remain separate |

Schema evidence: the original Lead action migration (historical migration; see the prior release)
and action-type extension (historical migration; see the prior release),
the Estimate proposal migrations (historical migration; see the prior release)
and conversion migration (historical migration; see the prior release),
Calendar (historical migration; see the prior release),
Capture setup (historical migration; see the prior release),
Capture source (historical migration; see the prior release),
Customer (historical migration; see the prior release) and
Work Order (historical migration; see the prior release) migrations.
All eight Estimate creation migrations enforce P, not T.

### Directional supersession: preserve exactly

All replacements are scoped to the same workspace, user and thread, and
only pending rows. No new universal exclusivity group is introduced.

| Newly prepared family | Pending families replaced today |
|---|---|
| `action` | `action` only |
| `customer` | `customer`, `action` |
| `workOrder` or `material` | `workOrder`, `material`, `customer`, `action` |
| Any of the eight Estimate families | All eight Estimate families |
| `calendar` | `calendar` only |
| `captureSetup` or `captureSource` | Both Capture families |

This is intentionally asymmetric: a new Lead proposal does not retire a
Customer or Work Order proposal. Do not replace the matrix with "one pending
proposal per thread." Database P constraints remain family-specific; the
broader replacement behavior remains a transactional repository operation.

Estimate replacement also prunes the new turn's inherited pending-family
evidence, including same-Estimate archive references where required. Capture
and Calendar replacement update their nested ticket/draft state as required
by their existing contracts. Some Estimate superseded rows legitimately retain
a nested `pending` ticket; do not impose unconditional row/nested-state equality.

Sources: [Estimate supersession](../packages/data/src/estimates/chat-proposals.ts),
[Customer preparation](../apps/web/src/server/chat/customers.ts),
[Work Order/Materials storage](../apps/web/src/server/chat/work-orders-actions.ts),
[Lead preparation](../apps/web/src/server/chat/actions.ts),
[Capture supersession](../packages/data/src/lead-capture/proposal-supersession.ts)
and [Calendar proposals](../packages/data/src/calendar/proposals.ts).

### Replay, erasure and non-mutation exceptions

- Repository locking/state checks do not decide whether repeating confirm,
  cancel, open, editor or review is legal. Preserve each domain's existing
  decision matrix and result validation.
- Customer/Work Order/Materials export confirmation is not a repeat-download
  authorization: repeated confirmed exports require a fresh proposal.
- Lead CSV export intentionally differs: only its dedicated download path can
  confirm, and a confirmed proposal can be downloaded again while its native
  expiry, authority, filter-label and preview checks still pass. JSON-only
  confirmation is rejected. Do not apply the other export families' replay
  rule to Lead exports.
- Estimate confirmed-result navigation/replay rechecks the existing result
  and receipt. Conversion review is a repeatable pending-state operation with
  an audit event, not `pending -> confirmed`.
- Capture setup distinguishes saved Draft receipts from suggestion receipts;
  neither implies publication/delivery. Capture request-ID replay remains
  family-scoped, including manual sample review.
- Lead deletion erases Lead-containing proposal copies and restores only the
  minimal confirmed deletion receipt. Its retained original input hash cannot
  be verified by hashing the replacement receipt as if it were original input.
- Customer deletion conservatively erases other Customer drafts and
  Customer-derived assistant content in the workspace, retaining a redacted
  deleted receipt. Do not restore erased content during backfill.
- Proposal deletion must not cascade-delete retained lifecycle audits.
  Historical audits may outlive their source proposal or actor.

Sources: [Lead deletion](../packages/data/src/leads/delete.ts),
[Lead deletion receipts](../apps/web/src/server/chat/delete-actions.ts),
[Customer resolution](../apps/web/src/server/chat/customers.ts),
[Work Order/Materials resolution](../apps/web/src/server/chat/work-orders-actions.ts),
[Estimate conversion review](../packages/data/src/estimates/chat-conversions.ts),
[Capture setup decisions](../packages/data/src/lead-capture/setup-proposals.ts)
and [Estimate sharing decisions](../packages/data/src/estimates/chat-sharing.ts).

## 2. Proposed canonical database contract

### `chatProposals`

| Column | Contract |
|---|---|
| `family` | Constrained text: the 12 existing discovery families plus `customer`, `workOrder`, `material` |
| `id` | Original UUID; primary key `(family, id)` avoids assuming cross-table UUID uniqueness |
| `workspaceId`, `userId`, `threadId`, `turnId` | Required owned routing fields; UUIDs except text user ID |
| `payloadVersion` | Required positive integer; version 1 uses the explicit lossless family adapter below |
| `state` | Required `pending`, `confirmed`, `cancelled`, `superseded`; adapters preserve public `canceled` spelling |
| `requestId` | Nullable UUID; required for both Capture families, absent unless a family's existing protocol uses it |
| `inputHash` | Required original binding hash; extracted, never recomputed to make stale data pass |
| `payload` | Required JSON object; family/version-discriminated stored envelope, including reviews and receipts |
| `expiresAt` | Required original expiry; extracted from the existing column or family ticket/draft |
| `createdAt`, `resolvedAt` | Preserve source timestamps; resolution remains nullable |

Version 1 envelope mapping:

- Estimate, Calendar and Capture: retain their existing stored payload
  structure, including original ticket/draft, authority and receipt fields.
- Customer and Work Order/Materials: retain `{ payload, review, accessHash }`,
  plus `customerStamp` for Customer. This wrapper is storage-only and is not
  included in the existing input hash calculation.
- Lead actions: retain the existing domain columns as a typed envelope:
  capability/action type, Lead/owner snapshot/result ID, access hash and the
  applicable per-action payload columns. Preserve null/absent semantics.
- Family validators select the existing inner hashing algorithm. Changing
  wrapper shape, cancellation spelling or `payloadVersion` must not change
  signed inner values. Do not introduce a generic replacement digest.
- `inputHash`, `expiresAt` and routing projections must agree with their
  corresponding original binding fields where those fields exist. Preserve
  legitimate receipt and supersession exceptions through family schemas.
- Unsupported versions, ambiguous Materials routing and malformed stored
  envelopes are explicit errors, never "no proposal."

Required constraints/indexes:

1. Owned thread FK `(threadId, workspaceId, userId)` to `chatThreads`.
2. Owned turn FK `(turnId, threadId, workspaceId, userId)` to `chatTurns`,
   requiring an additive unique key there. Preflight existing ownership before
   validating stronger constraints; do not silently repair mismatches.
3. Preserve existing proposal cascade on source-turn/thread/workspace/user
   deletion; lifecycle audit retention is handled separately.
4. Unique `(family, turnId)` for `action` and `customer`.
5. Unique `turnId` and unique `id` across the subset `workOrder`/`material`,
   preserving their shared-table limits and unambiguous bare-ID endpoint even
   after the logical family split.
6. Partial unique `(workspaceId, userId, threadId, family)` for pending rows of
   the eight Estimate, Calendar and two Capture families. Do not add this
   constraint to Lead/Customer/Work Order/Materials without a separate behavior
   decision.
7. Partial unique `(workspaceId, userId, family, requestId)` for Capture;
   also enforce the required request ID for those families.
8. Owned history index `(workspaceId, userId, turnId, family, createdAt DESC,
   id DESC)`; pending lookup indexes must also cover families without P.
9. CHECK allowed family/state/version, object payload, and 64-hex binding
   hash. Family-specific capability/body validity must remain enforced through
   SQL CHECKs where replacing existing Lead constraints, plus typed schemas.
10. Apply and rehearse [runtime grants](../packages/data/src/runtime-roles.ts);
    migration-owner credentials must not become application credentials.

Family is supplied by trusted endpoint/tool routing. Existing bare-ID APIs
remain unchanged: adapters qualify IDs with their family. The existing Work
Order endpoint accepts its two families without ambiguity because item 5
preserves uniqueness across that subset. Do not let an arbitrary client family
select a different domain handler.

### `chatProposalAudit`

New lifecycle audit rows carry original/assigned UUID, family, proposal ID,
workspace, nullable actor, original event name, input hash, timestamp and a
typed details object for operation/action type/result identifiers.

Backfilled events additionally retain source table and source event ID.
Deduplication uses `(sourceTable, sourceId)`, not assumed global legacy UUID
uniqueness. Preserve original event names and details; do not synthesize
missing historical prepared/confirmed events for Customer or Work Order.

No proposal FK with cascading deletion: Lead erasure and retained orphan
audits require events to survive proposal deletion. Preserve provenance even
when the legacy proposal can no longer be mapped. Work Order export audit rows
remain in their business audit store; do not reinterpret them as lifecycle events.

Use an append-only lifecycle audit API for new operations. Preserve historical
Lead audit actor/retention behavior and Capture's explicit deletion exceptions;
do not silently apply Capture's erasure policy to every legacy audit. Exact
per-origin trigger/grant rules and existing account/workspace retention
rehearsals must pass before merging historical audit stores. Retain original
audit tables read-only until that parity is established.

Adding lifecycle events for future Customer/Work Order/Materials operations is
an intentional new internal behavior, not a claim that historical events exist.
Write them atomically with state changes; benchmark their cost. Native
business/export/delivery audits remain unchanged.

## 3. Shared repository and family boundary

The repository accepts an existing transaction and trusted identity/authority.
It does not acquire global/root DB handles or independently authenticate an
already admitted tool call.

Proposed operations, kept small and concrete:

- `createProposal`: validate family/version and original binding projections,
  insert a pending proposal and audit atomically.
- `replaceProposal`: apply exact directional supersession, optional native
  evidence pruning, insertion and audits in one savepoint. This explicit
  preparation operation avoids accidentally replacing siblings during an
  insertion-only operation. Native adapters still own request replay policy.
- `readOwnedProposal` / `lockOwnedProposal`: one family-qualified scoped
  read, optionally `FOR UPDATE`; handlers still validate current domain access.
- `resolveProposal`: guarded transition plus validated result payload and
  lifecycle audit in the same transaction as the domain command.
- `supersedeProposals`: update the directional family set with one statement,
  return affected rows, preserve family-specific body updates/evidence pruning,
  and batch required lifecycle events.
- `readProposalHistory`: newest recorded state per owned turn/family from one
  table. Use turn metadata to retain zero reads for known plain answers.
- Explicit family-scoped erasure used by the current Lead/Customer deletion
  paths; do not add a generic public delete method.

The family registry holds typed schemas, storage adapters and explicit
supersession/replay policies. It is not a configurable workflow engine and
does not implement every domain command. Request preparation uses the
[existing runner](../apps/web/src/server/chat/tools/runner.ts);
confirmation APIs invoke existing domain services inside fresh authority.

Lock order remains workspace admission/write lock, then proposal rows, then
the existing domain record locks. Deterministic ordering across affected
proposal families/IDs must be rehearsed for concurrent replacement and
confirmation. No new transaction spans provider work.

The runner must recognize Customer and Work Order/Materials proposals from
their actual structured result drafts, not only the current 12 top-level
proposal fields. Direct Capture/manual/native preparation also uses the
repository. A proposal must not be missed because it bypassed model tooling.

Expand the turn metadata CHECK and typed registry together. Backfill every
turn's family set only after comparing it with actual canonical rows:
legacy `null` is unknown, not empty. Keep current evidence reference formats,
card props and endpoints; update their storage resolution, not their semantics.

## 4. Acceptance test contract

These are the full cutover acceptance requirements. Step 2 verifies the
foundational subset described below; it does not claim complete adapter,
backfill, UI or retention parity.

| ID | Required evidence |
|---|---|
| C01 | Lossless fixtures for all 14 source tables and all 15 target families; every persisted state, empty/expired/stale review and supported payload variant |
| C02 | Same UUID in different legacy source tables survives; same-table uniqueness and shared Work Order/Materials ID/turn constraints still reject duplicates |
| C03 | Migration rejects ownership mismatches, malformed versions/bodies and binding projection mismatches; it accepts legitimate redacted deletion receipts and superseded nested-state exceptions |
| C04 | Same owned turn/thread/workspace bindings preserved; foreign identities/families cannot load, resolve or inherit a proposal |
| C05 | Every row/column payload, original input hash, request ID, timestamp, expiry and review/receipt agrees with its source; no current-record freshness requirement is imposed on a historical backfill |
| C06 | Each directional supersession edge is exercised, plus negative edges such as new Lead not replacing Customer; confirmed/cancelled receipts and other users/threads remain untouched |
| C07 | Parallel confirm/confirm, confirm/cancel, replace/confirm and repeated Capture requests retain native outcomes; one domain operation at most; failure rolls back proposal, command and audit |
| C08 | Exact family replay decisions remain: Customer/Work Order/Materials export redownload denied; Lead dedicated downloads retain native revalidation/replay; Estimate open/editor behavior retained; Conversion review keeps pending and creates no Job |
| C09 | Capture saved-versus-suggestion receipts and manual approval samples remain distinct; source publication/readiness/delivery bindings remain native |
| C10 | Lead/Customer deletion removes the same sensitive copies and retains only allowed receipts/audits; account/workspace erasure retains existing policies |
| C11 | Display reviews, confirmation routes, SSE results, restored cards, history/navigation and inherited evidence remain compatible across every family; canonical existing stories use mocked APIs |
| C12 | Stop, provider failure and unfinished turns cannot yield usable completed proposals/metadata; standalone/manual preparation records the correct family too |
| C13 | New canonical audit events are atomic/append-only; old events keep original IDs via provenance, actor semantics and original details; absent historical events are not invented |
| C14 | Least-privilege runtime migration rehearsal passes; web/admin/worker access does not broaden accidentally |
| C15 | All 38 labelled deterministic workloads have one authority read, zero fingerprint queries and zero failed/pending/unobserved calls; plain history performs zero proposal queries; cold flags/LISTEN are accounted separately |
| C16 | Backfill retry, paused-writer activation, post-activation verification and canonical-compatible rollback are rehearsed without shared-table truncation |

Baseline: Overview 41 warm driver calls, ordinary Lead follow-up 23,
Estimate-proposal follow-up 26 and Capture-proposal follow-up 25 warm / 28
with three flag-cache reads. Two-phase accounting adds six SQL statements to
driver totals. Consolidation must measure supersession/discovery savings and
new audit overhead separately; it does not promise to remove native target,
readiness, version or frozen-money reads.

Use the safe [Reports cross-chat suite](../apps/web/e2e/chat-reports.spec.ts),
focused proposal units and disposable native/retention rehearsals. Never run
shared-table truncation or global limiter-clearing suites in this environment.

## 5. Implementation sequence and review gates

1. **Complete:** review the matrix, proposed schema and acceptance contract.
2. **Foundation complete, ready for review:** typed family contracts, additive
   schema/repository and disposable migration/constraint tests. Original
   tables, handlers and live data are preserved.
3. **All 15 native adapters and all-family metadata/history integration staged:**
   canonical authority remains restricted to disposable rehearsals until
   operational approval. Do not make split stores permanent.
4. **Backfill, compatible rollback and workload benchmark rehearsed:** stop on
   discrepancies and complete remaining UI/history acceptance before seeking
   separate operational cutover approval.
5. If separately approved, install the authority migration before deploying
   startup-check code. Pause all writers and retention/erasure workers, drain
   in-flight transactions, activate atomically, then restart all compatible
   processes. Ordinary migrations do not activate canonical storage.
6. Verify UI/history/confirmation/retention and measured workloads after any
   approved cutover; remove temporary adapters only after verification.
7. Drop retired tables through a later guarded migration once source parity,
   retention and operational rollback requirements are satisfied.

Before activation, the legacy store remains authoritative. After activation,
rollback must deploy a release compatible with canonical contract version 1;
legacy-only code cannot safely resume. There is no reverse synchronization or
automatic fallback. The activation retires legacy payload copies, while
retaining source lifecycle audits with restricted access.

### Approved design decisions

- Approve 15 logical families over 14 legacy tables, retaining current API
  naming and the shared Work Order/Materials uniqueness rule.
- Approve exact directional supersession and no universal pending-thread rule.
- Approve versioned lossless envelopes and original family-specific digests.
- Approve canonical lifecycle auditing for future operations, with historical
  audit retention parity as a gate before removing source audit stores.
- Approve incremental code adaptation followed by one controlled storage
  cutover, with no automatic old-store fallback.
- Approve canonical-compatible release rollback instead of reverse-syncing
  post-activation writes to legacy tables.

## 6. Step 2 implementation and verified limits

The [typed registry](../packages/contracts/src/chat-proposals.ts) defines all
15 version-1 envelopes and the directional replacement matrix. It reuses
native schemas for validation but retains the original JSON values rather
than storing trimmed, defaulted or transformed parse output. Prepared Customer
deletion permits its existing omission of confirmation-only fields.

The additive migration (historical migration; see the prior release)
creates the canonical tables, composite owned-turn key, source-compatible
uniqueness constraints, history/pending indexes and Lead capability/body
checks. Down refuses retained proposals **or audits**. Migration replay and
empty down/up were run only in exclusively owned disposable databases.

The [transaction-bound repository](../packages/data/src/chat-proposals.ts)
provides owned lookup/locking, Capture request lookup, atomic insertion and
replacement, guarded terminal transitions, Conversion review auditing and
metadata-directed recorded history. Replacement uses one savepoint, not
nested savepoints per sibling or duplicate authority database reads. It
returns replaced rows to native evidence-pruning callbacks. Calendar changes
its nested draft state on supersession; Capture, Estimate and Customer/Work
Order review bodies retain their current row-only supersession behavior.

Callers must hold the existing workspace write lock before proposal/native
record locks. Confirmation callbacks must perform native fresh permissions,
binding/hash/version/expiry checks and execute commands on the supplied
transaction. The repository is **not** a generic confirmation endpoint or
replay engine. Conversion review stays pending; generic confirmation of a
Conversion is rejected. Historical binding validation does not recompute
original hashes or require current business-record freshness.

New lifecycle audit writes are atomic and append-only. Runtime grants allow
read/append but deny update, delete and truncate; database triggers enforce
immutability independently. This is the **future-event foundation**, not
approval to import legacy audit rows under one blanket retention policy.
Historical import/actor-erasure rules remain a separate per-origin parity
gate, and all original audit stores remain unchanged. Provenance columns and
namespace uniqueness are tested without importing real historical events.

Verified:

- **29 contract tests** across the canonical contracts and native Calendar,
  Capture setup/source and Estimate Conversion contracts.
- **20 disposable PostgreSQL check groups**: migration rollback/down/up,
  composite ownership, 15 family namespaces, original turn/pending/request
  uniqueness, malformed SQL constraints, lossless representative native
  envelopes, directional and negative replacement, pruning/audit failure
  rollback, concurrent confirm/confirm and confirm/cancel, Capture replay,
  Calendar/Conversion state exceptions, scoped latest-family history,
  unsupported versions, outer rollback, proposal erasure with retained audit,
  audit immutability/provenance and runtime grants.
- Contracts/data/web typechecks and scoped ESLint passed.

The representative envelope checks cover Lead, Customer, Work Order,
Materials, Capture setup, Calendar and Conversion; SQL namespace/uniqueness
checks cover every family. Full lossless fixtures for every legacy payload
variant/state, all native replay decisions, replacement/confirmation races,
other Capture receipts/manual samples, legacy erasure parity and migration
backfill remain C01-C16 work, not completed claims.

**Step 2 review gate (subsequently approved):** begin grouped native adapters,
starting with Estimates.
No handler has switched stores, turn metadata still permits the existing
12 discovery families, and the 38-workload database-count baseline is
unchanged. Expand metadata and every relevant live surface together only
when adapters/discovery are ready; operational cutover needs separate approval.

## 7. Step 3: staged Estimate adapter group

All eight native Estimate handlers now use one
[storage adapter](../packages/data/src/estimates/proposal-storage.ts) for
proposal lookup, insertion, resolution and lifecycle events. No parallel
business handlers or UI implementations were introduced. Domain code still
owns preparation, signed input checks, fresh authority/native record review,
expiry, explicit confirmation, replay, receipts and editor/open behavior.
Draft deletion now resolves its retained confirmation proof through the same
adapter instead of reaching directly into its legacy audit table.

Default requests still use legacy storage. The common repository provides
one explicit asynchronous `withCanonicalProposalStorage` rehearsal scope for
all staged adapter groups; there is no per-family environment flag, client
selector, dual write, missing-row fallback or automatic schema detection.
Concurrent/default scopes remain isolated. Do not enable this scope in live
request entry points until all groups, discovery, erasure and backfill are
ready for the separately approved paused-writer cutover.

Canonical Estimate supersession locks the owned pending family set with
**one lookup**, updates its states and batches its audit events through the
common repository. Native inherited-evidence pruning remains intact,
including removal of same-Estimate Archive sources even when already
cancelled. Resolution reuses the already locked original proposal;
Conversion review also reuses that lock and appends its event without a
second proposal lookup. Native command writes and common lifecycle writes
remain inside the same outer workspace write transaction. Adapter handles
must originate from a locked lookup in that exact active transaction.

Verified with the
[disposable native rehearsal](../packages/data/src/estimates/proposal-storage.rehearsal.ts):

- **27 check groups**: equivalent legacy/canonical native Draft
  create/editor/refresh, concurrent confirmed replay, Share send/publish and
  queued-versus-delivered semantics, Decision, duplicate/revise, Void,
  Archive/Restore, typed Draft deletion/retained audit proof and Conversion
  review/cancel without Job creation.
- Foreign actor, missing permission, forged binding, unfinished source, exact
  expiry, replacement/confirmation race, inherited evidence pruning and
  native business/receipt/mail rollback when lifecycle audit insertion fails.
- All eight canonical namespaces exercised with **zero legacy SQL** in the
  canonical run; a real legacy-only proposal is not used as fallback.
  Canonical/default scope isolation and unlocked/foreign-transaction handle
  rejection are also checked.
- **193 focused unit tests**, the **20 shared canonical PostgreSQL groups**,
  data/web typechecks and scoped ESLint passed.

These are backend adapter checks, not a claim that the operational cutover,
full legacy backfill/erasure parity, every Resend/editor variant or the full
38-workload canonical benchmark is complete. Existing canonical UI
components/stories and endpoint contracts are unchanged. Current app
database-count baselines are unchanged; measure end-to-end savings only after
the remaining groups and coordinated discovery switch are ready.

The Calendar/Capture group now reuses the same adapter implementation, as
described below.

## 8. Step 3: staged Calendar/Capture adapter group

The [shared storage adapter](../packages/data/src/proposal-storage.ts) now
serves all eight Estimate families plus Calendar, Capture Setup and Capture
Source. The Estimate file is only its typed family registry, not a second
implementation. Owned reads, Capture request replay lookup, preparation,
locked resolution and lifecycle persistence share this boundary. Lock handles
are bound to their family and exact active transaction.

Calendar evidence, visible tickets, schedule/clear decisions and receipt reads
use the selected store. Canonical replacement uses one owned pending lookup,
synchronizes the nested Calendar draft state and retains native inherited
evidence pruning. Capture replacement handles Setup and Source together with
one canonical pending-set lookup and no legacy schema-presence probe; nested
Capture tickets retain their existing row-only supersession behavior.

Capture manual sample approval also reads its origin and request through the
adapter. Ordinary requests retain turn identity; manual approval retains its
distinct request ID on the original completed turn. Saved-draft receipts,
unsaved suggestion receipts, pasted versus verified Gmail sample provenance,
publication readiness, delivery stamps and native lifecycle replay remain
separate. Gmail activation preparation stays in its native pre-transaction
orchestration; business/publication/sample audits stay in their native stores.
The existing fail-closed lifecycle error commit behavior is unchanged.

Verified with `pnpm --filter @salesmora/data test:calendar-capture-proposal-storage`:

- **48 disposable PostgreSQL check groups** in total: 12 Calendar groups,
  18 Capture Setup groups and 18 Capture Source/native action groups, running
  under the web runtime role in both legacy and canonical modes.
- Shared Job/Work Order scheduling, clear/cancel and concurrent confirmed
  replay; forged/foreign/unfinished/expired/stale reviews; permission changes;
  confirm/cancel races; nested-state replacement and inherited evidence.
- Setup create/save/begin-revision versus unsaved suggestions; exact manual
  approval replay; pasted and locally seeded verified-Gmail sample bindings,
  including wrong actor, content, credential generation and expiry denials.
- Source publish, change/cancel schedule, pause/resume, archive/restore and
  duplicate receipts; request replay and changed-input rejection; not-ready
  reviews, delivery-stamp changes and both cross-family replacement directions.
  Evidence and visible-ticket helpers exercise the selected store.
- Failed lifecycle audits roll back Calendar records/operation, Setup source
  creation, retained sample/binding inserts and native publication/version
  writes. Safe retries still produce one result. Canonical runtime runs issue
  **zero legacy proposal/audit SQL**, and real legacy-only Calendar/Source rows
  are not used as fallback.
- The extracted adapter also passes the **27 Estimate groups**, **20 shared
  repository groups**, **57 focused contract/history units**, contracts/data/web
  typechecks and scoped ESLint.

These are staged backend checks, not full C01–C16 acceptance. No shared database
was migrated, no provider was called and no email was delivered. Existing UI,
stories and API shapes are unchanged. Connected Gmail fixtures verify local
sample provenance, not live provider activation/baseline calls. Exhaustive
historical envelopes/audit retention and account erasure, every race/variant,
all-family history/UI integration, backfill, operational rollback and the
38-workload database benchmark remain gates.

Live requests still use the legacy tables. No metadata expansion, historical
audit import, automatic fallback, dual write, new live feature flag or cutover
was introduced. This step does not claim an end-to-end query-count reduction.

The Lead group is now staged on this boundary, as described below.

## 9. Step 3: staged Lead adapter group

All eight native Lead action variants (create, stage, update/compound update,
assign, note, archive/restore, CSV export and typed delete) now use
`leadProposalStorage` in the same [shared adapter module](../packages/data/src/proposal-storage.ts).
Its flat-column codec preserves existing handler row/review shapes while
using the same canonical repository, asynchronous staging scope and
family/exact-transaction lock handles. The handlers retain all native
permission, access hash, source/evidence, owner snapshot, input hash, version,
expiry, explicit-confirmation and replay decisions.

Preparation, same-turn replay, same-family supersession, confirmation,
visible reviews, deletion receipts and both CSV gate transactions use the
selected storage boundary. Canonical decisions reuse their one locked
proposal read rather than reselecting during terminal persistence.
Customer and Work Order/Materials preparation now route their Lead
supersession edge through this boundary too; their own proposal storage is
still legacy pending the next adapter group. The reverse edge remains
absent: a new Lead does not supersede Customer or Work Order intent.

Manual and assistant Lead deletion share selected-store copy erasure across
the whole workspace, including other actors' drafts whose turns contain the
deleted Lead evidence. Canonical deletion restores only the existing minimal
receipt after native erasure, preserving the original full-request hash,
expiry, routing and creation timestamp. A guarded `INSERT … SELECT` checks
native deletion-audit proof as part of insertion, without an extra proof
lookup or proposal reread. Receipt insertion and lifecycle audit remain in
the outer business transaction. Deleted-source evidence stays on the turn,
so this receipt does not authorize restoring old CRM answer text.

Lead lifecycle events retain `draft.*` names, action type and optional target
Lead identity using one shared audit-details mapper. Business, deletion,
export, activity, billing-admission and notification audits remain native.
Lead CSV confirmed redownload behavior is deliberately preserved, unlike
Customer/Work Order/Materials exports; no replay policy was broadened.

Verified with `pnpm --filter @salesmora/data test:lead-proposal-storage`:

- **35 disposable native check groups** in legacy and canonical modes under
  the web runtime role, covering every Lead variant and compound updates.
- Preparation/same-turn replay without business writes, unfinished/foreign/
  forged decisions, concurrent confirmation, native mutations, visible
  reviews and refreshed Lead evidence.
- Cancellation, exact expiry, active-thread guards, permission revocation,
  source-version and teammate-snapshot conflicts; confirm/cancel and
  replacement races; directional Customer/Work Order supersession.
- Typed deletion, workspace-wide copied-proposal erasure across actors,
  original-hash minimal receipts, receipt replay after source erasure and
  manual deletion using the same erasure path.
- Dedicated streamed CSV confirmation and native confirmed redownload;
  JSON-only confirmation/cancelled download rejection and preview changes.
- Injected lifecycle-audit failures roll back Lead creation, compound
  edits/stage/evidence, native deletion/proposal erasure/receipt restoration,
  and export proposal confirmation. Export attempt logs retain their native
  failed-attempt semantics.
- Canonical runs issue **zero legacy Lead proposal/audit SQL**, do not fall
  back to a real legacy-only row and do not leak into default legacy calls.
  One proposal read per decision, one pending-set lookup per replacement,
  unlocked/foreign-transaction handle rejection and missing native deletion
  proof rejection are asserted.
- Regression checks pass: **27 Estimate groups**, **48 Calendar/Capture
  groups**, **20 shared repository groups**, **51 focused units**,
  contracts/data/web typechecks and scoped ESLint.

This is not a live storage switch or complete C01–C16 acceptance. Test turns
use known-empty discovery metadata to isolate native adapters; live
metadata/discovery/history orchestration remains unchanged until all-family
integration. The Customer/Work Order/Materials group is staged below; full backfill/audit
retention/account-erasure parity, UI/history integration, exhaustive variants,
the paused-writer cutover and the 38-workload benchmark remain gates.
The later activation design retires legacy payload copies; see section 13.
No shared database migration, provider call, email delivery, permanent dual
write or automatic fallback was introduced.

Live database-count baselines are unchanged; operational cutover still
requires separate approval.

## 10. Step 3 staged Customer/Work Order/Materials adapter group

Customer and the shared Work Order/Materials handlers now use one reviewed-
column codec in the [same adapter module](../packages/data/src/proposal-storage.ts).
It reuses the existing lossless envelope validators, canonical repository,
rehearsal scope and exact-transaction lock handles. Work Order/Materials use
one owned lookup across their two trusted families, never a lookup per family.
Their shared legacy ID namespace now has a canonical partial unique ID index,
as well as shared turn uniqueness; bare-ID resolution remains unambiguous.
Cross-source-table UUID collisions remain valid.

Preparation uses the repository's atomic replacement operation once.
Customer replaces Customer/Lead; Work Order or Material replaces Work Order/
Material/Customer/Lead. New Customer/Lead intent does not replace Work Order/
Material. Native row/API `canceled` translates to canonical `cancelled` only
at the storage boundary. Resolution reuses its original locked row, retains
signed business payloads and updates native review results without another
proposal read. Material preparation composes the existing Work Order storage
function, not a parallel handler or UI.

Customer deletion erases Customer proposal copies across workspace actors in
the selected store and retains the native redacted `{ kind: "deleted" }`
receipt with original hash/expiry/routing. Typed confirmation and explicit
open-Lead unlink consent still run through the native mutation service.
Assistant-text erasure and turn-result redaction are unchanged. A redacted
receipt cannot be used as a pending command. Confirmed Customer/Work Order/
Material exports still require a new proposal to download again; no replay
or access rule was broadened. Legacy Customer/Work Order operations retain
their lack of lifecycle audit writes; future canonical events are atomic
internal additions, not synthesized historical events.

Verified with
`pnpm --filter @salesmora/data test:customer-work-order-material-proposal-storage`:

- **62 disposable native check groups** across both stores under the web
  runtime role, using the existing actual-handler rehearsal scaffold.
- Customer create/update/assignment/note/link/unlink/archive/restore/delete
  and CSV; Work Order creation/edit/schedule/assignment/tasks/task progress/
  materials/note/issue/start/complete/reopen/cancel and CSV; Material create/
  propose-only/edit/archive/restore and CSV.
- Durable visible reviews, native confirmation replay, one business command,
  cancellation replay and export redownload rejection.
- Source completion, expiry, active-thread, foreign ownership, forged hash,
  fresh permission revocation and native record-version conflicts.
- Native Customer deletion/unlink, other-actor copy/text/result erasure,
  minimal original-hash receipt and replay after deletion.
- Canonical audit failures roll back Customer creation/deletion/erasure,
  Material creation and Work Order export; failed preparation restores
  superseded siblings even when the caller catches the failure.
- Canonical runs issue **zero legacy proposal/audit SQL**, reject real
  legacy-only Customer/Work Order rows, and retain default legacy behavior.
  One proposal read per Customer decision, one pending-set lookup per
  replacement, and unlocked/foreign-transaction handle rejection are asserted.
- Regression checks: **35 Lead**, **27 Estimate**, **48 Calendar/Capture**
  and **20 shared repository groups**, **40 focused units**, contracts/data/
  web typechecks and scoped ESLint (only the existing unused `_from` warning).

All 15 proposal families now have staged native adapters. This remains a
test-only canonical scope, not a live switch or complete C01-C16 acceptance.
No shared migration, backfill, provider call, email delivery, dual write,
fallback, metadata expansion or database-count reduction is claimed.

The coordinated metadata/discovery/history group is staged below. Lossless backfill, historical
audit retention/account-workspace erasure parity, UI acceptance, the paused-
writer cutover, guarded legacy retirement and the 38-workload benchmark remain
separate gates. The later activation design retires legacy payload copies;
see section 13. Operational cutover still requires separate approval.

## 11. Staged all-family metadata, discovery and inherited history

The [tool runner](../apps/web/src/server/chat/tools/runner.ts) recognizes all
15 families, including drafts nested in Customer and Work Order results.
Material routing follows the native review action. Results without a draft
remain plain reads; canceled/aborted tools cannot stage family metadata.
The [shared adapters](../packages/data/src/proposal-storage.ts) also record
families for direct/manual preparation, independently of model tooling.
An admitted request stages this in memory with no additional query. Standalone
preparation updates known metadata inside its existing transaction.
Legacy `null` stays unknown, never a falsely complete partial list.

The additive metadata migration (historical migration; see the prior release)
expands the turn CHECK to all 15 families without rewriting old metadata or
proposal rows. Downgrade refuses retained new-family values. It has only been
applied in owned disposable databases; deploy it before code begins recording
the new values in a shared environment.

[History discovery](../apps/web/src/server/chat/history-proposals.ts) now
selects the same storage mode as native handlers. Canonical discovery uses
the shared repository's single latest-state query for the bounded history
window, not 15 source-table lookups. Known plain turns perform zero proposal
queries. Legacy compatibility still uses metadata-directed source discovery;
unknown legacy turns may inspect all 14 physical source tables (15 family
branches, with Work Order/Materials kind filters). There is no canonical
missing-row fallback. Recorded history normalizes `canceled` to `cancelled`;
native card/API spelling stays unchanged.

[Inherited-source validation](../apps/web/src/server/chat/historical-evidence.ts)
loads referenced canonical Estimate/Calendar/Capture and reviewed Customer/
Work Order/Material payloads in one owned completed-thread batch per
validation. It retains native binding fingerprints, source ownership,
versions supported by storage, original record access and deletion checks.
Customer/Work Order/Material snapshots additionally require their durable
proposal binding rather than trusting result JSON alone. This does not
revalidate historical facts against current record contents. Missing,
unfinished, wrong-thread or erased source proposals cannot be inherited.
Foreign/unsupported/malformed sources remain explicit rejection or errors.

The existing native visible-card helpers still own review authorization and
receipt rules. Cards compose the same UI/API shapes, including the dedicated
Lead deletion receipt. Thread deletion cascades selected-store proposals while
immutable lifecycle audits remain retained.

Verified:

- **10 disposable actual web-history groups**, in legacy/canonical modes:
  mixed native preparation metadata, runtime recorded states, restored cards,
  plain zero-query history, unknown discovery, inherited batching, erased/
  unfinished-source denial, foreign actors, thread erasure/audit retention,
  shared Work Order/Material routing and migration downgrade/roundtrip.
- **21 shared repository groups**, including recorded history for all 15
  families and one-query mixed completed-source evidence; bounds, wrong
  identities/threads and unsupported payload versions are tested.
- **103 focused unit tests** for metadata staging/union, nested draft routing,
  interrupted tools, unknown metadata preservation, legacy discovery and
  cancellation, mixed signed Calendar/Capture evidence and request/contracts.
- Native regressions: **62 Customer/Work Order/Material**, **35 Lead**,
  **27 Estimate**, **48 Calendar/Capture groups**; contracts/data/web
  typechecks and scoped lint pass.

No shared migration, lossless backfill, historical audit import, provider
call, email delivery, permanent dual write or live canonical cutover occurred.
These are bounded proposal-query assertions, not an end-to-end DB-count claim.
Visible-card domain reads and source-record authorization still have their
native costs; the full 38-workload benchmark remains a post-integration gate.

**Subsequent stage:** lossless backfill and historical audit-retention/
account-workspace erasure/rollback rehearsal, including correction of old
unknown or incomplete family metadata against actual rows. Full UI acceptance
and exhaustive inherited variants remain C01-C16 evidence before separately
approved paused-writer cutover. Never resume legacy-only code after canonical
activation.

## 12. Staged lossless legacy backfill and historical audit retention

The explicit [maintenance helper](../packages/data/src/proposal-backfill.ts)
maps 14 source tables into 15 families inside a caller-owned transaction and
an atomic savepoint. It is not invoked by startup, migrations, normal chat
requests or an automatic storage selector. Shared/live storage remains legacy.

Before invocation, pause and drain **all** assistant confirmations, tool
writers, manual mutations, account/workspace purges and retention workers.
Exclusive `NOWAIT` locks on the routing, source and target tables reject an
undrained writer immediately. Reads are paged in batches of 250; this remains
one maintenance transaction, not a resumable online migration.

The import validates canonical envelopes/ownership constraints and preserves
original IDs, states, hashes, raw signed JSON, request IDs and timestamps.
It reuses the shared Lead projection and native ticket binding codec.
Timestamp reads bypass node-postgres `Date` conversion to preserve PostgreSQL
microseconds; outer timestamps use equivalent six-digit UTC precision without
rewriting timestamps embedded in signed JSON. No native preparation, new hash,
business command or invented lifecycle event runs during import.

Audit IDs are separately allocated in the canonical namespace; original
`(sourceTable, sourceId)` provenance is retained and uniquely reconciled.
Orphan events, nullable actors, native actions/details and source-UUID
collisions survive. Customer/Work Order/Materials have no historical proposal
lifecycle table, so their business/export audits remain separate and no
historical lifecycle events are synthesized.

### Historical erasure parity

The additive retention migration (historical migration; see the prior release)
must precede historical import:

- Imported eight-Estimate, Calendar and both Capture audit origins preserve
  their original workspace-delete cascade and actor-delete nulling.
- Imported Lead audits retain their original non-FK immutable policy.
- New canonical events without provenance retain the foundation's immutable,
  non-cascading policy; thread deletion does not erase any lifecycle audit.
- Only deletion of the actual parent allows the origin-specific exceptions.
  Parent triggers perform the narrow operation as schema owner with a pinned
  search path; runtime audit mutation/truncate privileges remain denied.
  Runtime inserts cannot forge historical provenance: that requires the
  canonical audit table owner. No general erasure function is exposed.
- Retained FK-origin imports block removal of their retention migration.

Source and target equality is checked on every repeat import. Divergent
states, payloads, routing, timestamps or original events fail rather than
being overwritten. Unmatched target rows or new canonical events fail with
an explicit reconciliation requirement. Turn family metadata is rebuilt
from actual canonical rows, including old `null` and incomplete arrays.
All inserts and metadata changes roll back together on any failure.

### Disposable evidence and remaining gates

The now-retired `test:proposal-backfill` script reused the real native
Lead/Customer/Work Order/Material, Estimate, Calendar and Capture fixtures in
five exclusively owned random databases with the full migrations. It checks
every family, persisted states/minimal receipts, exact repeat reconciliation,
malformed late-family/audit-insert rollback, undrained writers, orphan events,
nullable actors, colliding audit source UUIDs, microseconds, canonical owned/
history readers, metadata correction, runtime provenance/mutation denial,
account/workspace erasure parity and rollback to the original legacy state.
Each imported dataset and erasure is rolled back; each owned database is
dropped. Providers, live email and shared data are untouched.

Verified **69 additional backfill groups**, the existing **203 database
regression groups** and **103 focused units**; contracts/data/web typechecks
and scoped lint pass. Native fixture counts can vary with race winners; exact
source/target reconciliation, not a fixed fixture row count, is asserted.

**Rollback boundary:** this importer verifies rollback **before canonical
writes**, not reverse synchronization. The subsequently staged compatible
release approach is described below. Full UI/inherited acceptance and the
38-workload DB benchmark remain gates before any approved cutover.

## 13. Canonical-compatible rollback guard

The authority migration (historical migration; see the prior release)
creates a singleton marker initially set to legacy, with storage contract
version 1. Web and worker startup must initialize against the committed
marker before serving traffic or starting work. Initialization reads it once
per startup, rejects missing or unsupported authority and pins the selection
for the process; it adds no per-turn authority lookup. Install the migration
before deploying code that requires this startup check.

The internal [activation helper](../packages/data/src/proposal-backfill.ts)
is not an automatic migration, public route or normal request operation.
In one caller-owned maintenance transaction it locks authority, performs
exact backfill and reconciliation, deletes legacy proposal payload copies,
marks canonical authority and revokes protected runtime roles' access to
legacy proposal and lifecycle audit tables. Original audit tables remain
retained; applying runtime grants again does not reopen them. Any failure
rolls the whole operation back. The marker cannot ordinarily be downgraded,
deleted or truncated, and its migration cannot be rolled back after activation.

Any future activation requires separate approval, a prevalidated release
supporting canonical contract 1, and all writers and erasure/retention
processes paused and drained. Every application process must restart with the
compatible release; initialized processes do not hot-switch storage. Rollback
after activation also requires a canonical-compatible release. No reverse sync
is provided, and a legacy-only release must not be used. The rehearsal
validates the current compatible contract, not a particular older binary.

The now-retired `test:proposal-compatible-rollback` script ran five
native fixture runners in owned disposable databases. The **40 shared check
groups** cover activation rollback, undrained writers, committed import and
payload retirement, startup selection, native writes and receipts, repeat
initialization, downgrade refusal and privilege reapplication. The backfill
rehearsal also passes **69 groups** under the authority migration, and **112
focused units**, data/web/worker typechecks and scoped lint pass. No shared
database, provider request, email or production deployment is involved.
The ordinary native suites were rerun after the authority changes: **35 Lead,
62 Customer/Work Order/Material, 27 Estimate and 48 Calendar/Capture groups**
passed in legacy and canonical modes.

Full UI/inherited acceptance remains outstanding. The subsequent disposable
benchmark is documented below; it does not approve an operational cutover.

## 14. Disposable browser and history acceptance

This section records the earlier dual-mode staging, not current test commands.

The proposal browser rehearsal creates and migrates an exclusively owned
local database, activates canonical authority, runs the fixture-provider
Playwright tests as the web runtime role, and drops the database afterward.
The prior rehearsal also ran in legacy mode; the current canonical-only
harness no longer supports that mode. It does not activate a shared database
or contact a live provider.

Canonical browser checks have exercised at least one journey in each of the
15 families: Lead, Customer, eight Estimate families, Calendar, Capture setup,
Capture source, Work Order and Material. Work Order and Material confirmations,
Capture setup and source draft creation, and their restored inherited
follow-ups were checked against persisted canonical rows. Capture setup and
source lifecycle, including scheduled review and cancellation, also passed
API/history checks. These are selected scenarios, not exhaustive UI and
inherited-history acceptance for every operation and state.

The Archive card now disables actions while its parent refresh is pending.
The browser regression holds that refresh and checks the confirmed Open
button remains disabled. Confirmed Estimate Draft deletion history verifies
the native deletion receipt and still checks captured records other than the
intentionally deleted Estimate. Its browser regression passed in canonical
and legacy modes, including denial after the parent Job is removed. This
receipt verification adds database work; the benchmark below does not
include a confirmed Draft-deletion follow-up.

Capture source dialogs now mount inside the assistant's native dialog, so
their controls are reachable without escaping its modal layer. The duplicate
browser journey checks Escape, reopening, mouse confirmation and reload; the
shared lifecycle confirmation and Escape Storybook interactions also passed.
Confirmed Estimate Decision, Draft Action and Void follow-ups passed in both
storage modes, including later access-loss redaction. These assertions use
generic `historyEvidence` for newer follow-ups rather than expecting the
legacy family-specific evidence to be copied into every new turn.

Data and web typechecks, scoped lint, 10 historical-evidence tests, 12
fixture/runtime tests and 19 Capture validation tests passed. Full variant UI
and inherited-evidence acceptance remain outstanding.

## 15. Canonical database-call benchmark

The four selected authenticated tests passed in an owned disposable database
with committed canonical authority, the `salesmora_web` runtime role and a
deterministic provider. All 38 distinct labels were matched one-to-one with
completed database measurements: each has one authority read, zero SQL
fingerprint queries, and zero failed, pending or unobserved calls. A separate
direct history check confirms that known plain turns make zero proposal
queries. The first Lead summary includes cold initialization; the long-stream
summary is warm. Counts include two-phase usage accounting; the six
additional SQL statements per request are not eliminated by batching.

The comparison uses the preceding 38-workload legacy run after the Overview
and history optimizations. Both runs use fictional data and the same workload
labels, but differ in storage authority and runtime environment, so differences
are observations, not proof of their isolated cause. Driver calls are shown
below; every current row has six more server SQL statements.

| Workload | Legacy calls | Canonical calls |
|---|---:|---:|
| Lead summary (cold) | 22 | 22 |
| Lead follow-up | 23 | 23 |
| Leads Report | 30 | 30 |
| Overview Report | 41 | 41 |
| Sources Report | 26 | 26 |
| Calendar Report | 23 | 23 |
| Jobs Report | 29 | 29 |
| Team Report | 22 | 22 |
| Estimates Report | 25 | 25 |
| Activity Report | 25 | 25 |
| Financial Report | 34 | 34 |
| Lead proposal | 23 | 27 |
| Long stream (warm) | 18 | 18 |
| Lead search | 20 | 20 |
| 50-turn history | 24 | 24 |
| Customer read / follow-up | 22 / 23 | 22 / 23 |
| Customer proposal / follow-up | 21 / 24 | 23 / 26 |
| Work Order read / follow-up | 22 / 24 | 22 / 24 |
| Work Order proposal / follow-up | 25 / 24 | 26 / 27 |
| Material read / follow-up | 22 / 23 | 22 / 23 |
| Material proposal / follow-up | 26 / 24 | 27 / 26 |
| Estimate read / follow-up | 21 / 23 | 21 / 23 |
| Estimate proposal / follow-up | 39 / 26 | 36 / 26 |
| Capture read / follow-up | 26 / 23 | 26 / 23 |
| Capture proposal / follow-up | 38 / 25 | 40 / 25 |
| Calendar read / follow-up | 23 / 23 | 23 / 23 |
| Calendar proposal | 45 | 49 |

Twenty-eight workloads are unchanged, nine use more driver calls and one
uses fewer. The increases for initial proposals occur in tool execution;
the Customer, Work Order and Material proposal-follow-up increases occur in
history. No overall end-to-end reduction is established. This run does not
measure confirmed Draft-deletion receipt verification, real-provider latency,
every proposal variant or a live cutover.
