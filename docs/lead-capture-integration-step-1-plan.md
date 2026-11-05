# Lead Capture integration step 1 — contracts and persistence design

Status: design approved in this chat. Contracts and persistence foundation implemented and verified October 31, 2026; awaiting implementation review before page connections. See [implementation and verification](lead-capture-integration-step-1-qa.md). All seven composed page stories are approved.

## Outcome and boundary

Create the strict shared contracts, database foundation and compatibility rules needed to connect the approved pages. Reuse the current Knex/PostgreSQL, Zod, workspace authorization and migration-rehearsal conventions. This slice will not enable public submissions, publish a form, connect Gmail, ingest messages, decide real intake items, invoke an assistant or deploy a database change.

The following product behavior is already approved in [the delivery plan](lead-capture-plan.md): immutable original evidence; editable proposals; version-bound publication and decisions; immediate website creation when eligible; supervised Gmail intake; tenant isolation; retry-safe admission; slot reservations; existing-role defaults and preservation of explicit permission customizations.

## Existing boundaries to preserve

- `apps/web/src/server/leads/store.ts` exposes `createLeadInTransaction` for manual and confirmed-chat creation. It requires a real user authorization context, `leads.create` and `leads.assign`; validates assignment, uses a submission hash and calls the shared lead-capacity check. Public ingestion cannot call this as an impersonated Owner or insert leads around it.
- `packages/data/src/billing/entitlements.ts` serializes lead admission using the workspace lock and derives the effective plan from server state. `workspaceLeadAdmissions` records creation once and survives lead deletion. Capture uses this accounting rather than adding another monthly counter.
- `packages/data/src/authorization/store.ts` reloads membership/policy inside a workspace transaction and denies suspended/deleting workspaces. Tenant repositories must retain this boundary. Public/worker operations need an explicit, narrow source authorization boundary under the same workspace lock.
- The permission catalog and stored policies still use `campaigns.*`; source capacity uses `publishedCampaigns`; lead provenance accepts `campaign`. Office archive is currently ineligible. Stored grants do not carry per-grant override metadata.
- Existing role grants give the runtime broad tenant-table access, while the staff app has default read access and explicit secret exclusions. Future Gmail credentials need deliberate grants/exclusions rather than inheriting those defaults.
- Custom answers and source workflow tags are not part of the current lead write contract. The business-default assignment setting is also absent. They are required before real capture admission is enabled; a successful draft save must not imply those downstream features already work.

## Canonical names and compatibility

| Surface | Canonical name | Compatibility |
| --- | --- | --- |
| Product section and routes | Lead Capture; `/lead-capture` | Preserve old `/campaigns` links with redirects when routing is connected |
| Source resource | `capture_source` | Explicit `campaign` resource adapter during transition |
| Permission family | `leadCapture.read/create/update/activate/pause/archive` | Map old `campaigns.*` by explicit allowlist; do not evaluate both as alternative grants |
| Plan capacity property | `publishedCaptureSources` | Translate the old `publishedCampaigns` property at compatibility boundaries |
| Lead origin | `lead_capture` with website/Gmail source metadata | Continue parsing historical `campaign`/`gmail` origins; preserve recorded history |

Keep the existing `intake.*` permissions. A rename must preserve scopes and denials. Write only canonical identifiers after the cutover; inventory each remaining alias, owner and removal condition. Historical audit payloads remain historical records, not input to live authorization.

The permission migration, catalog/schema changes, enabled-permission configuration, role-policy validation and navigation capability changes must ship as one compatible application cutover. There must be no interval in which canonical policies are silently rejected or old permissions bypass a denial. A local migration rehearsal comes first; any deployed cutover is a later explicitly reviewed step.

## Proposed persisted records

Use UUID primary identities, tenant keys on every tenant record, positive versions, server timestamps and the existing camelCase database naming convention. Composite tenant-aware foreign keys must prevent cross-workspace relationships; every repository query must also include the authorized workspace. A client-supplied workspace ID never establishes authority.

| Record | Purpose and required constraints |
| --- | --- |
| `captureSources` | Workspace, name, website/Gmail type, lifecycle status, record version, current draft/approved references, schedule and actor/timestamp metadata. Draft, active, paused, scheduled and archived remain separate from entitlement/connection blocks. A blocked source does not become a slot-free draft. |
| `captureSourceVersions` | Immutable configuration snapshots with schema version, source-local field/choice identities, workflow and approval provenance. Unique source/configuration version; typed website/Gmail payload. Historical references cannot point to a different source or tenant. |
| `captureSourceDrafts` | One mutable working revision per source, with its own optimistic version and base approved reference. Permit incomplete drafts under a strict draft schema; publication requires the complete launch schema. The approved configuration keeps running while the draft changes. |
| `captureSourceSamples` | Retained representative Gmail sample, original text and evidence, bound to the exact draft/configuration/account/rule/target snapshot. Sample approval is an actor/time/version record. Any relevant setup change invalidates it. Duplication copies no sample or approval. |
| `capturePublications` | Stable public identity per website source, separate from configuration revisions. Keep lifecycle version and approved configuration reference distinct. Store UTC launch instant plus business timezone. No example-domain URL is a publication record. |
| `captureReceipts` | Unique accepted inbound item with source/configuration/publication or account/message identity, immutable original evidence, original extracted values, typed custom answers and consent snapshot. Transport retries reuse the receipt. Original evidence cannot be replaced by reviewer corrections. |
| `intakeItems` | Receipt reference, review status, optimistic version, proposal/corrections, review flags and definition/workflow versions. One item per accepted receipt when review is needed. Store automatic website acceptance distinctly from a human decision. |
| `intakeReviewSnapshots` | Server-created, actor-bound, expiring review references that bind intake/proposal/workflow versions, authorized duplicate candidates and selected changes. Client freshness strings are never authority. A changed candidate or permission forces a new review. |
| `intakeDecisions` | One terminal outcome per intake item: create, separate, link/update or dismiss; actor/service identity, versions, selected changes, resulting lead reference and timestamps. A unique intake constraint prevents two reviewers applying different terminal outcomes. |
| `captureOperations` | Durable operation/request ID, canonical request hash, authoritative reviewed target versions and committed result, scoped to workspace and operation. Reauthorize before returning a replay. Same ID with a different payload is a conflict; replay cannot rerun side effects. |
| `captureSourceEvents` | Audited source/configuration/lifecycle/intake events with actor or explicit service principal. Do not put raw email bodies, OAuth tokens or unrestricted customer evidence into event payloads. |
| `leadCaptureData` | Lead/receipt/source/configuration linkage and versioned custom-answer snapshots. Linking preserves the existing lead's original creation provenance and adds the new receipt relationship. Deleting a lead must not erase source counts or permit a decided intake item to create again. |

Configuration JSON is validated through shared schemas and has a declared schema version. Identity, tenant relationships, uniqueness, lifecycle/status enums and positive versions also receive database constraints; JSON validation alone is insufficient. Field/choice IDs remain stable through label edits and reordering. Historical configuration versions remain available while referenced. Workspace/account deletion must explicitly cover these records and respect the existing deletion flow.

Gmail connection credentials and ingestion cursors are introduced with provider integration in step 5. Step 1 defines opaque connection/account references and sample binding without creating a fictional live connection. Cross-source Gmail matching/deduplication, archived-source cursor eligibility and secret custody must be finalized before ingestion is enabled.

## Contract families

Create colocated strict schemas and tests under `packages/contracts/src/lead-capture/`, with exported types consumed by the domain, data layer and later UI adapters. Client-only Storybook validation does not become an authoritative server contract by importing React feature files.

1. Common source identities, lifecycle/block states, configuration/draft versions, bounded pagination/filter inputs and typed result envelopes.
2. Versioned website fields/content/privacy/consent and Gmail account/rules/targets/mapping/sample configuration. Retain the approved field types and limits; normalize stable IDs and choices instead of storing comma-separated UI text.
3. Workflow settings: inherit business default or select a current teammate; valid lead stage; normalized unique tags; assigned-teammate notification flag. Store intent and settings version, not an assumed configured Owner.
4. Draft create/save/read/list and source detail/metrics contracts. All writes include expected versions and a request identity where replay is meaningful. Saving incomplete drafts preserves them without permitting launch.
5. Publication/lifecycle requests tied to exact reviewed source/configuration versions, schedule instant and business timezone. A source-state version is not a configuration version.
6. Receipt/evidence, typed original and corrected answers, intake filters and authorized duplicate comparison contracts. Preserve original input separately from normalized values.
7. Reviewed intake decisions as a discriminated union. Create/separate carries reviewed definition/workflow/answers; link carries target lead/version and explicitly selected field changes; dismiss carries no fabricated lead data. The server obtains actual proposed values from the stored review snapshot.
8. Typed permission, validation, stale-version, capacity, connection, source-unavailable and retry/conflict results. Repeated successful requests return the original accepted result after current authorization.

Reject unexpected keys, unsafe field/choice identities, cross-type configuration, invalid timezone/schedule combinations and excess payload size. Verify submission/default field limits against the existing lead contract before allowing publication; configurable labels/types must not produce values the shared lead boundary cannot accept.

## Permissions and policy migration

For new workspaces, Owner/Admin/Office receive the approved source capabilities, including archive; Field remains denied by default with existing configurability retained. Candidate visibility and mutations also require the current lead permissions for the target and selected operations. Intake approval does not become an unrestricted lead-edit grant.

Rename existing grants without changing their meaning. For the new Office archive default, grant it automatically only when the policy history demonstrates that the workspace still uses the untouched applicable default template. Preserve customized policies and ambiguous histories, leaving their Office archive capability unchanged for an Owner to configure. Do not infer intent solely from the absence of an old ineligible grant. Audit the migration and advance policy revisions.

Update the archive role constraint narrowly for the canonical capture-source permission; do not grant Office unrelated archive/delete/export permissions. Verify legacy/default policy initialization and migration replay as well as existing-workspace upgrades. If legacy and canonical grants coexist with conflicting scopes, stop with a repair report instead of combining them permissively.

## Transactions and downstream admission

Lock order: workspace first, then source, intake and target lead rows in a documented deterministic order. Reload actor membership/policy, workspace state, effective plan, source state and relevant versions within the protected transaction. Database uniqueness is the final protection against competing requests.

Publication, scheduling and restoration must reserve capacity atomically at their later service boundary. Active/paused/scheduled sources consume slots; drafts/archived sources do not. Entitlement blocks are explicit and preserve the approved all-published-sources block after forced overflow. Creating the tables alone does not implement these transitions.

Before step 4 enables website creation, extract the common lead write/admission core into the shared data/domain boundary. Preserve existing authenticated manual/chat behavior and establish a separate publication-authorized service path; never manufacture an Owner session or client-supplied creator. Public creation must atomically validate availability, effective workflow, membership/assignment, custom answers, provenance and monthly capacity. Catch only a recognized capacity outcome to persist review intake; do not turn arbitrary database/authorization failures into visitor success.

At step 6, intake decision, shared lead creation or selected lead updates, provenance/custom-answer storage, audit, operation result and notification outbox enqueue must commit together. Reuse existing notification preferences and deduplicate outbox effects. A rolled-back decision must leave no committed operation success. Link-only/dismiss bypass new-lead admission, while every new lead uses the same shared admission ledger.

The missing default-assignment setting and actual tag persistence/read behavior must be implemented and reviewed before launching a source that depends on them. Do not silently discard configured tags or pretend business-default assignment has been resolved. Persisting workflow intent in step 1 is not completion of these dependencies.

## Implementation sequence for this slice

1. Add shared schemas, canonical identifiers and an explicit legacy mapping inventory; test strict parsing and version/field identity rules. Add compatibility readers before changing persisted identifiers.
2. Add source/draft/configuration/sample/publication persistence and constraints, then receipt/intake/review/decision/operation/provenance/event records in dependency order. Keep new operations disabled until their authorized repositories exist.
3. Add the coordinated permission rename/Office-default migration, narrow database constraint update and runtime grant classification. Keep credentials out of customer/staff read surfaces; do not weaken existing staff/runtime isolation.
4. Rehearse fresh migration replay and upgrade of representative old policies/data in disposable local databases, then verify actual runtime-role grants and tenant constraints. Publish implementation evidence for review before beginning step 2 page connections.

No staging or production migration is part of this design approval. Local implementation/rehearsal must leave the existing manual/chat lead creation and current billing/authorization flows working.

## Acceptance evidence

- Shared contracts reject unknown properties, duplicate IDs, stale or cross-type configuration, invalid field values, broken decision unions and mismatched version references.
- Fresh replay and upgrade preserve legacy grants/provenance; unchanged default policies receive the approved Office archive default, customized policies retain their choices, and ambiguity/conflicting identifiers fail closed.
- Tenant-aware foreign keys reject cross-workspace source/configuration/intake/lead relationships; unique receipt and decision constraints reject competing duplicates.
- Historical answers retain their original configuration/field/choice meaning after later source edits; immutable evidence cannot be overwritten through proposal writes.
- Local rehearsal covers draft versus approved versions, source versus configuration concurrency, durable operation hashes/results, lead-deletion history and workspace-deletion coverage.
- Runtime/staff grant checks protect credential custody and migration metadata. Existing authorization, billing and manual/chat admission regressions pass.
- No story callback, mocked Gmail connection or installation example is presented as a live service.

After this implementation checkpoint is approved, step 2 connects authorized draft CRUD and source list/detail pages. Public hosting/abuse protection, provider-backed Gmail, actual intake decisions, dashboard/lifecycle services and assistant integration remain in their previously agreed phases.
