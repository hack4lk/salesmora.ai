# Workspace service types

## Request and current stage

Add Settings → Services as the workspace's shared service catalog. Replace internal free-text service classification with a searchable selection and update service-based workflow matching. November 21, 2026: the user approved both canonical UI stories, requested removal of the usage sentence and approved Delete where safe. Settings persistence, record selectors and workflow identity matching are now connected. The local migration and full-page browser verification are complete. Storybook hosts mock mutations around the actual components without publishing live settings.

The UI follows `prototype/prototype-screen-16-settings.html` and the current settings page conventions. `ServicesSettingsPage` uses the global `DataTable`, MUI tabs/menus and shared confirmation/field/button components. `ServicePicker` is the canonical controlled searchable selector. SettingsOverview and the authorized settings navigation link to the live Services page.

## User experience

- Settings → Services shows Active and Archived tabs, a compact service table and Add service.
- The rightmost three-dot menu offers Rename and Archive, or Rename and Restore on archived entries. Delete is also available for unused services, requires typing confirm, and is independently checked on the server. Used services retain Archive.
- Names are trimmed, limited to 100 characters and unique without regard to capitalization across active and archived entries. An existing archived name is restored rather than duplicated.
- Add and Rename use one name field and a confirmation action. Cancel makes no change. Duplicate, failed-save and stale-version states retain the draft.
- Archive retains existing record references and removes the service from future choices. Active workflow use blocks archival with an instruction to pause those workflows first. The connected server must enforce this under the same mutation lock, including a concurrent resume/publish.
- A searchable service selector returns the service identity, never arbitrary typed text. New selections include active services only. An unchanged archived reference may remain on an existing record. Unmatched historical text remains visible with an instruction to choose a workspace service; it is never silently discarded or guessed.
- Workspace business-settings read/update permissions govern catalog visibility/management. The connected server must separately expose the minimal authorized active choices to staff who can create or edit business records without permission to manage settings.

## Existing data and reference inventory

`workspaceServices` currently has a `(workspaceId, service)` text primary key populated during onboarding from the curated contract catalog. Catalog values such as `installation` have separate display labels such as Installation. Preserve this distinction when migrating rather than presenting opaque slugs as names.

Jobs currently accept arbitrary service text in create/edit UI, contracts, assistant operations and mutations. Their list facets come from saved Job text. Routine-booking options read `workspaceServices`; admission and execution compare exact saved strings. Changing UI alone will not fix those write boundaries or rename behavior.

Lead create/edit, intake review, captured website/Gmail answers, source setup context, estimate-to-Job conversion, Job filters, reports and assistant projections also use service values. External free-form requests are evidence, not automatically trusted catalog classifications. Preserve original captured text and explicit review where it cannot be mapped exactly.

## Connected implementation and compatibility policy

1. Extend the existing workspace catalog with stable service identity, readable name, archive status and versioned workspace settings. Keep compatibility keys during migration. Use workspace-bound foreign keys/references so an ID from another workspace cannot be selected.
2. Seed readable names from known onboarding labels. Backfill exact unambiguous existing references only; preserve unknown/ambiguous historical values for review. Do not create a new service for every arbitrary customer request or merge similar names through AI. Do not rewrite historical estimate shares or intake evidence.
3. Add scoped reads and a current-authority, version-bound, idempotent settings mutation. Enforce name uniqueness, archive/use checks and current permission on the server. Reuse established workspace mutation locks and settings request/error patterns.
4. Wire Settings → Services using the canonical page and existing authenticated server context. Return saved projections from mutations and invalidate scoped dependent React Query caches. Form typing/search/validation makes no request; there is no polling.
5. Use the canonical picker and IDs in Job create/edit first, including server/assistant validation and conversion writes. Carry classified service references through leads/intake where relevant, preserving external source text. Use the workspace catalog for options, labels and filters rather than deriving inconsistent choices from free text.
6. Bind routine-booking definitions, source admission, uniqueness constraints, execution checks and assistant proposals to service ID. Resolve an author's exact readable name/key once while preparing a review, ask on ambiguity, then carry identity. A rename must not change matching, reset enrollment or cancel existing pending attempts. Source changes must still respect future-only enrollment; classifying an old Job does not silently backfill it.
7. Archive blocks new selections/enrollment. Resuming a paused workflow that references an archived service requires restoring it or choosing an active service. Existing appointments remain unchanged. Preserve current draft/version/expiry rules and surface stale or unavailable references plainly.
8. Verify tenant/permission isolation, duplicate names/concurrent edits, renamed/archived/legacy references, Job and conversion writes, assistant authoring, pending occurrences, lifecycle and cache invalidation. Run relevant DB/queue/browser regression checks after connecting data.

## Efficiency

Reuse the existing onboarding catalog and workspace service storage. Read options once per authorized scoped projection and reuse React Query caches. A catalog save invalidates services, affected record choices and workflow booking choices; do not reauthenticate per service or issue per-row usage queries. Batch workflow-use counts with the settings read. Execution remains deterministic and uses indexed service identity matching with the existing outbox/BullMQ path. No model calls are introduced into matching, renames or booking execution.

## UI checkpoint verification

Storybook covers settings add/rename/duplicate names/archive/restore, active-workflow archival protection, read-only, empty/loading/load failure/save failure/conflict/mobile; selector search/exact ID output/no free-text acceptance, archived/legacy values, empty/disabled/required; and the Services entry in SettingsOverview. Stories exercise the same components intended for live integration with mocked host reads/writes. Type/lint and browser interaction/accessibility results are recorded at delivery.

November 21 checkpoint: all 22 focused stories passed browser interaction/accessibility checks with zero reported accessibility violations. Web type checking and focused ESLint passed; desktop/mobile page screenshots were inspected. No database migration or live catalog/Job/workflow changes were made during this checkpoint.


## Connected behavior — November 21

Migration `202611210002_workspace-services.ts` extends the existing catalog with stable UUID IDs, display names and archival state. It adds workspace-bound service references to Jobs, Leads and Workflows. Existing exact keys and unambiguous exact labels are classified; unmatched text remains unclassified. Existing workflow definitions keep their immutable compatibility key for historical reviews, while source enrollment, the active-workflow uniqueness index and worker source checks use service identity. Renaming changes the display name only, without changing workflow versions, enrollment cutoffs or pending booking attempts.

Settings reads batch service use counts. Writes use current workspace mutation authority once, a catalog version, actor/payload-bound retry receipts and a workspace lock. Add/rename names are unique ignoring case; the original onboarding keys remain immutable. New onboarding rows receive names through the shared database default/trigger. Archive requires active workflows to be paused. Resume/publication recheck active service availability. Delete requires explicit confirmation and no Job, Lead, workflow or stored proposal reference; database foreign keys protect classified records too.

Jobs choose configured services in create/edit. The existing creation-context read supplies service choices with deadline choices under one authorization scope. The existing Jobs projection supplies edit choices; typing/search does not query. Server Job creation/editing and estimate conversion use the same resolver and reject new unknown/archived/cross-workspace references. An unchanged archived or unmatched historical Job service can be retained on an ordinary edit. Classifying an older Job does not enroll it retroactively.

Manual lead forms use a cached workspace service selector. Captured customer/Gmail wording remains source evidence and is never automatically added as a service. Exact selected names carry a classified reference; historical unmatched requests remain visible until reviewed. Estimate conversion supplies its current service choices and classified reference to the canonical Job review. An unmatched conversion value must be explicitly replaced or cleared before creating a Job.

Current names are projected on Job and Lead details, current estimate parent references, assistant lead summaries/search, lead CSV, Job workload/lifecycle/team evidence and Job CSV. Shared estimate content, historical events and intake evidence remain snapshots. Workflow review options, table descriptions and intake setup context use the active catalog names. The booking card retains its approved assistant styling.

React Query invalidates scoped service choices, affected record reads, creation context and workflow booking choices on an explicit settings save. There is no polling, per-keystroke request or runtime AI matching. The service settings route reuses its authorized server context rather than loading authority again for the initial catalog read.

Verification so far: eight isolated runtime-role service groups (CRUD/replay, case-insensitive duplicates, scope/current permissions, concurrent edits, unknown/archived/cross-workspace Job references, rename/pending bookings, lifecycle/delete protection and legacy/future-only classification); six routine-workflow groups; 25 existing Jobs/reporting DB journeys; 48 focused contract/cache tests; and 26 canonical/connected browser interaction/accessibility stories. The isolated full-page browser journey passed service add/rename/persistence, Job service selection and stable reference saving, used-service deletion protection, typed unused-service deletion and invalid-origin rejection. All 26 canonical/connected stories passed again against a fresh shared UI bundle, with no accessibility violations. The local migration completed without booking Jobs or publishing workflows.


## Qualified workers connected — November 21

Each service now has a Qualified workers flyout and count. Active workspace people are explicitly selected and ordered; Save shares the catalog's current permission, version, mutation receipt and workspace lock. Removing qualifications does not unassign existing Jobs. Qualified automatic booking is an explicit workflow policy, using earliest availability and preferred order only for ties. See `docs/workflow-qualified-workers-plan.md`.

## Job work details — November 22

The canonical Edit work details modal places the workspace Service type picker below the title, removes the obsolete design-only warning, and retains the existing optional clear and historical-value behavior. The live Job detail route prefers the catalog already returned with its current detail response, falling back to the list catalog without another request. Saving uses the existing versioned Job edit command and permission checks. This does not change the booking workflow's new-Job-only enrollment policy. Select, clear and read-only browser interaction/accessibility stories pass.
