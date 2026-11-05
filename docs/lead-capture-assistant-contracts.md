# Lead Capture assistant — contracts and capability checkpoint

November 2, 2026. Implements checkpoint one of the approved [assistant plan](lead-capture-assistant-plan.md). This is local groundwork; no assistant handler, provider request, application write, migration or hosted change is introduced.

## Implemented boundary

`packages/contracts/src/lead-capture/assistant.ts` defines six planned surfaces, two planned tool names, eight read operations and 21 proposal operations. Strict context schemas separate list filters, source references and intake references. Browser context cannot supply identity, permission lists, readiness or authoritative versions.

Query inputs require explicit typed record IDs or bounded list windows of at most 20 records. Evidence includes workspace, query operation, retrieval time, access/snapshot hashes and bounded source/intake/lead version references. Duplicate references and unrelated evidence are rejected; record-detail reads require their selected record stamp. Read stamps are server-derived evidence, not browser authority.

Proposal bindings distinguish new sources, existing sources and intake decisions. They bind payload hash, workspace/proposal identity, current source/draft/approved or intake/review/definition/workflow versions, an exact target lead version for linking and the pending transition/configuration version for schedule changes. Tickets expire within fifteen minutes. Confirmation accepts only workspace/proposal/hash/confirm-or-cancel, preventing substitution of business payloads in the decision request. Persistence and canonical operation-specific review payloads follow in later checkpoints; these schemas do not themselves prove an action completed.

`packages/agent/src/lead-capture/authorization.ts` centralizes minimum app permissions and per-operation checks. It requires `assistant.use`, currently enabled/reviewed permissions and real server-loaded records for record operations. It preserves mandatory source/intake/lead collection constraints for SQL callers instead of reducing them to a Boolean. Duplicate links check the selected lead's current assignment scope; changing linked fields additionally requires exact canonical `leads.update` field authorization. Creating leads retains the central creation/assignment rule. Role names do not replace current grants.

All operations are disabled unless the caller explicitly supplies a server-owned implemented-operation list. Neither proposed tool is registered in the shared executable registry, and no planned surface is accepted by the current chat turn contract yet. Register these only with the corresponding complete handler/context integration. The exported helper is an authorization prerequisite, not a commit or readiness authorization.

## Service-gap inventory

| Operations | Existing foundation | Remaining work before enabling |
| --- | --- | --- |
| Source search/detail/summary | `listCaptureSources`, `readCaptureSource` | Bounded assistant projections, read stamps, history validation and result navigation |
| Installation/readiness review | Existing installation projection and publication review | Typed assistant result, same web authority, grounded explanation |
| Create/save/revision | `createCaptureDraft`, `saveCaptureDraft`, `beginCaptureRevision` | Durable chat proposals, review adapter, confirmation and outcome/history binding |
| Website field/workflow suggestions | Approved field/workflow UI and configuration validation | Structured provider proposals, unsaved-draft fingerprint binding and explicit application |
| Sample extraction/refinement/approval | Approved Gmail example/findings UI and evidence contracts | Provider adapter, exact source-quote validation, sample/rule fingerprints and canonical sample-approval service |
| Publish/cancel schedule | `publishCaptureDraft`, `cancelCapturePublication` | Assistant proposals/confirmation, current scoped delivery authority and transition bindings |
| Change schedule | Schedule-change contract and reviewed UI | Complete shared schedule-change transaction, route and manual adapter before assistant enabling |
| Pause/resume/archive | `changeCaptureLifecycle` supports these three actions | Canonical assistant review adapter and confirmation/evidence handling |
| Restore/duplicate | Broad lifecycle intent contracts and reviewed UI | Shared canonical operations and manual connections; current lifecycle command/service does not implement them |
| Intake search/detail/duplicates | Evidence/query/review contracts and approved components | Authorized shared repositories/routes, lead-scoped candidate reads and page connections |
| Intake corrections | `intake.update` exists but is centrally **unreviewed** | Review exact permission/service semantics first; policy deliberately denies this operation today |
| Intake create/separate/link/dismiss | Decision contracts and lead admission/assignment primitives | Shared transactional services, immutable evidence/audits, manual UI, then assistant proposals/confirmation |

Canonical service confirmation must still recheck actual state, versions, access, capacity, sample approval and delivery readiness atomically. Source read authority alone does not authorize reading intake payloads or linked leads. No operation may advertise provider connection, active delivery or successful publication from these metadata contracts.

## Verification

Focused tests cover strict context/query boundaries, operation/target/version bindings, schedule identity, ticket expiry, payload substitution, bounded evidence, unregistered defaults, Owner/Admin/Office permission intersections, default Field denial, custom reviewed Field grants, tenant mismatch, wrong record kinds, assigned-lead scope and exact linked-field permission checks.

Validation passed: 468 tests across nine files, including the surrounding Lead Capture contract, chat page-context, agent access and domain authorization regressions; contract and agent package typechecks; focused ESLint; owned-file whitespace and documentation links. ESLint emitted its existing React auto-detection warning without errors. No visual component changed; canonical component stories are checkpoint two.

## Next reviewable checkpoint

Compose capture read-result and proposal adapters from the approved canonical setup, lifecycle, publication and intake components, with mocked API stories for pending, denied, stale/conflict, confirmation, cancellation and completed outcomes. Then integrate the shared assistant and real handlers in the subsequent approved checkpoints.
