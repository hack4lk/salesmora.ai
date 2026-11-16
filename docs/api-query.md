# Client API queries

TanStack Query (React Query) is the approved standard for client-side API server
state in the web app. Adoption is phased; installing the shared foundation does
not migrate existing feature requests.

## Foundation

- The root layout mounts `ApiQueryProvider`. Its client belongs to that mounted
  application, never to a module-level singleton shared across server requests.
  It does not fetch sessions or replace server rendering/authentication.
- Wrap each migrated authenticated feature route in `ApiQueryScopeBoundary`,
  supplying the server-authenticated `viewerId` and authorized `workspaceId`.
  Do not derive identity from names, email addresses, or browser-supplied inputs.
  The authenticated layout also supplies `ApiViewerProvider` from its server
  session so the workspace assistant can scope connected reviews outside those
  route boundaries. It does not replace route authorization or redirect policy.
- Use `apiQueryKeys` and `useApiQuery`. Keys include viewer, workspace, resource,
  record ID or complete normalized filters. Account data is viewer-scoped.
  Changing identities/workspaces removes incompatible queries and cached mutation
  results. WorkspaceShell also removes other workspace queries and clears the
  client before sign-out. Cancellation prevents late query results from
  repopulating cleared caches.
- `apiRequest` only calls same-origin JSON API paths. It forwards the query's
  abort signal, bypasses HTTP caches, rejects redirects, and requires a parser
  (normally an existing contract schema's `parse`). JSON dates must be decoded
  through the feature's contract rather than assumed to remain `Date` objects.
  Structured error bodies, status codes, and conflict/version information remain
  available as `ApiRequestError.details`.
- Queries stay fresh for 30 seconds and unused data is collected after five
  minutes. Stale active queries refresh on focus/reconnection. Override these
  defaults only for a feature's demonstrated requirements.
- Reads retry transport failures and HTTP 502/503/504 at most twice. Validation,
  contract, authorization, cancellation, conflict, rate-limit, and other HTTP
  failures do not retry automatically. Writes never retry automatically or
  wait in an offline mutation queue.
- `useApiQuery` hides previous successful data if a recheck returns
  401/403/404/423 and removes affected inactive caches. Each migrated feature must
  explicitly handle these errors, hide unauthorized actions, and refresh
  server-owned permissions or redirect as appropriate. Never use stale data or
  `placeholderData` from another viewer/workspace. Client caching is not an
  authorization mechanism.
- Render pending/error/retry states using the canonical feature components.
  Generic errors must not become empty arrays, zero counts, or success feedback.
- Seed initial server data into the corresponding query with its actual read
  timestamp (`initialDataUpdatedAt`) or use request-local dehydration/hydration.
  Keep query keys/contracts identical on server and client. Never hydrate
  unauthorized data, or treat a failed initial section as successful query data.
  `useApiQuery` reconciles newer server snapshots only when their read timestamp
  exceeds the cached data timestamp, preserving more recent client results.

```tsx
const scope = useApiQueryScope();
const query = useApiQuery({
  queryKey: apiQueryKeys.list(scope, 'leads', normalizedFilters),
  queryFn: ({ signal }) => apiRequest(url, {
    signal,
    parse: raw => leadListSchema.parse(raw),
    failureMessage: copy.loadError,
  }),
});
```

This illustrates the pattern; use the actual contract/parser and localized copy
for the feature being migrated.

## Mutations and specialized transports

Use native `useMutation` with the existing request contracts, submission IDs,
versions, and conflict UX. On success, invalidate the affected resource keys,
related details/lists, and relevant Home/report/calendar queries. Await necessary
invalidations before declaring a workflow complete. Capture the originating
scope and do not apply a late result to a different current identity/workspace.
Assistant-confirmed changes must use the same invalidation rules as manual
actions.

Optimistic updates require a feature-specific rollback and reconciliation design;
they are not enabled globally. Keep form drafts, dialog state, and other UI state
local. Authentication, streaming chat, file transfers, public capability-link
flows, and exports retain their specialized transports unless separately reviewed.

## Testing

Storybook mounts an isolated testing provider per story. Automatic retries and
focus/reconnect refetching are disabled there. Mock APIs for canonical feature
stories; do not create parallel preview-only feature components.

The Infrastructure/ApiQueryProvider stories exercise the real shared provider,
scope boundary, and query hook with fictional reads. Unit tests cover request
contracts, keys, retry policy, isolation, deduplication, cancellation, and eviction.
Run validation under Node 22:

```sh
pnpm exec vitest run apps/web/src/features/api/api-query.test.ts apps/web/src/features/api/api-request.test.ts
pnpm --filter @salesmora/web exec tsc --noEmit
```

## Approved rollout

1. **Shared foundation:** provider, typed transport, scoped keys, cache/retry
   policy, lifecycle guards, tests, and Storybook support. Implemented and
   validated: lint, web types, production build, 28 focused unit/regression tests,
   and 84 foundation/shell/Home Storybook interaction, accessibility, and layout
   cases at 1440/768/320px under Node 22. Approved before Leads migration.
2. **Leads:** list/detail queries and mutation invalidation; include relevant Home
   and assistant changes. Implemented, validated, and approved for the next batch.
3. **Customers/Jobs/Calendar:** implemented, validated, and approved for the next
   batch.
4. **Materials/Work Orders/Intake/Estimates:** implemented; validation and
   feature-specific behavior are documented in the sections below.
5. **Notifications and reports:** implemented; details below.
6. **Settings and billing:** implemented; details below.
7. **Assistant:** session history/cancellation and JSON result/proposal adapters
   implemented, including lead, customer, Work Order, calendar, report, capture,
   and estimate flows. Streaming, file downloads, and provider SDKs retain
   specialized transports; see below.

Home can remain a consistent server-rendered snapshot until its client migration.
Adding a provider alone does not enable client caching/background refresh for
existing manual `fetch` or `router.refresh()` calls.

## Assistant session migration

Conversation history uses fresh viewer/workspace/thread-scoped queries.
Concurrent history requests deduplicate; each subsequent authorization check
still reaches the server. Existing open/focus, 15-second idle, and 1.5-second
accepted-run reconciliation checks retain their cadence, without query-level
automatic retries or model regeneration.

History queries own their abort signals. Starting a streamed turn, making a
lead decision, starting a new conversation, or leaving the session cancels
obsolete history work. Generation guards prevent late history from replacing
new streaming content or repopulating a cleared conversation. History errors
hide protected content, display explicit unavailable/access feedback, and block
sending until the user reloads or starts a new conversation.

Stop requests, server-authorized lead navigation, and lead JSON
confirm/cancel/deletion decisions use native non-retrying mutations. Proposal
IDs, input hashes, typed deletion confirmation, and existing domain cache
invalidations remain intact. Decision receipts must match the reviewed
proposal; confirmations evict cached assistant history so deleted evidence is
not retained there. Denied decisions/navigation hide previous cards and block
further sends. Navigation still validates app-only, same-workspace destinations.

Streaming turns/replays retain their specialized mixed JSON/SSE transport,
durable turn identity, cancellation, and interrupted-run recovery. CSV exports
retain complete-blob downloads and explicit confirmation. No streaming/tool
requests or charges are automatically repeated.

Calendar, report, capture, customer, Work Order, and estimate result/proposal
adapter migrations are covered below.

Validation under Node 22: 37 focused session-query/command and stream-parser
tests, nine connected assistant stories, web types, and changed-file lint.
Stories cover history reauthorization, denial/unavailability, late-history
cancellation, exact decision retry, mismatched receipts, streaming stop, and
access revocation during streaming. No model/provider calls were made.

## Assistant calendar and report adapters

Calendar visits/availability, calendar schedule/clear proposals, and report
results use viewer/workspace-scoped queries for reauthorization. Keys include
the request binding and, where not present in the URL, the result mode or full
report ticket. Response contracts and ticket, revision, input-hash, saved-query,
and navigation destination checks are preserved before accepting results.

Reads retain the existing focus and visible 15-second checks, without automatic
retries. Concurrent checks share a transport, while each card owns a temporary
query subscription: leaving one card cannot abort another card's shared read.
Leaving the last card or changing workspace aborts obsolete transport work.
Detached query results are collected immediately. Sequence guards still reject
late responses, and failures hide protected results rather than displaying a
previous cached snapshot.

Calendar/report navigation and calendar proposal decisions use native
non-retrying mutations. Single-flight decisions, exact reviewed payloads,
latest-disabled navigation checks, and saved-receipt authority remain intact.
Confirmed/canceled decisions evict the originating proposal queries; existing
calendar events and transcript reconciliation remain responsible for refreshing
the application. Mutation observers reset after commands and detached results
are collected immediately.

Validation under Node 22: 14 focused helper tests, all 35 existing connected
calendar/result/proposal/report stories, web types, and changed-file lint.
Coverage includes shared-read cancellation, scope changes, denial, stale and
mismatched tickets, exact decisions, single-flight writes, clear scheduling, and
unsafe or changed-query navigation. No model/provider calls were made.

## Assistant capture adapters

Capture result reads/navigation and setup/source proposal reads/decisions reuse
the scoped assistant result request helpers. Query keys include the complete
ticket as well as the request URL, isolating viewer, workspace, turn, snapshot
hash, operation, target versions, and scheduled-transition identity. Shared
reads retain subscriber-owned cancellation, immediate detached-data collection,
fresh authorization on explicit/focus checks, and no automatic retries.

The canonical capture result component retains its review, expiration,
single-flight, cancellation, retry, and denial UI. Proposal responses must match
the full reviewed binding and confirm/cancel outcome before they can be cached,
applied to unsaved setup, or trigger saved callbacks. Suggestion confirmation
still rechecks the server proposal and exact unsaved setup before sending the
decision; applying suggestions is not presented as saving or publishing them.
Source navigation remains restricted to the exact authorized source/workspace.

Decisions and navigation use native non-retrying mutations with unchanged wire
payloads. Successful decisions evict the originating proposal queries, while
existing saved callbacks reconcile the application. No publication, schedule,
provider delivery, or model request is repeated automatically. Capture editor
and provider/OAuth transports outside these assistant adapters are unchanged.

Validation under Node 22: 44 focused capture-response, canonical-binding, and
shared-request tests, 32 connected capture read/setup/source stories, web types,
and changed-file lint. Coverage includes denied reads/decisions, wrong receipt
scope or scheduled transition, changed unsaved setup, exact confirm/cancel
payloads, unsafe navigation, shared-read cancellation, and saved/suggestion
outcomes. No live publication, provider delivery, or model calls were made.

## Assistant customer and Work Order adapters

Customer JSON decisions, server-authorized customer/linked-lead navigation, and
Work Order/catalog JSON decisions use scoped native non-retrying mutations.
Decision receipts must match the reviewed proposal ID, input hash, action,
existing record identity, and requested confirm/cancel outcome. Creation may
return a server-assigned record identity. Typed customer deletion consent and
open-lead unlink consent retain their exact wire payloads.

Successful JSON decisions evict the originating viewer/workspace's assistant
history before existing callbacks invalidate domain resources and reconcile
the transcript. Local review snapshots remain authoritative until that
reconciliation completes. HTTP failures retain explicit reconciliation and
retry behavior; reconciliation failure displays an error without repeating the
command or requesting a second refresh. Denial hides protected cards. Workspace,
turn, and proposal-binding changes abort abandoned requests, while late
navigation checks the current disabled state and exact requested record,
record type, and workspace.

Customer, Work Order, and material CSV confirmations retain their specialized
complete-blob transport, explicit user confirmation, filenames, and download
cleanup. Downloads and JSON commands are never retried automatically; abandoned
or newly disabled results cannot trigger late downloads.

Validation under Node 22: 38 focused record-response/shared-request tests,
27 canonical connected customer/Work Order stories, web types, and changed-file
lint. Coverage includes exact confirmation/cancellation, typed deletion, denied
or mismatched receipts, explicit identical retries, reconciliation failure,
single-flight and abandoned commands, disabled navigation, and all three CSV
download paths. No live customer or Work Order mutations were made.

## Assistant estimate adapters

Archive/restore, duplicate/revise/reuse, draft deletion, voiding, customer
decisions, sharing, and conversion reviews use scoped fresh queries and native
non-retrying mutations. Existing estimate clients retain their contract,
review/snapshot hash, authorization revision, immutable ticket, exact decision
outcome, and authorized navigation checks. Their typed request transport is
injected by the authenticated host, so those checks run before query acceptance
or mutation success. Sharing recipient refresh and unsaved draft proposal
refresh use PATCH mutations, not reads or automatic confirmations.

The unsaved draft editor's focus/15-second reauthorization read also uses the
shared query transport. Editor content remains local and cannot be overwritten
by cache invalidation; refreshing produces a new pending proposal for separate
review and confirmation. Draft commands now validate the exact source binding,
decision outcome, and saved/editor destination before applying results.
Estimate summary/detail/list/export-review navigation uses non-retrying
mutations, checks the requested record and workspace, and rejects late disabled
or abandoned navigation.

Shared reads retain subscriber-owned cancellation, immediate detached-data
collection, and the adapters' existing explicit/focus/polling cadence. Each host
owns cancellation for its in-flight commands; detached mutation entries are
removed after settlement. Successful decisions/PATCH refreshes evict only the
originating viewer/workspace's estimate review and assistant history queries,
without replacing open review UI. Existing domain invalidation callbacks,
saved receipts, history-refresh errors, explicit consent, and separate Job
creation confirmation remain intact. Access denial hides protected reviews.

Validation under Node 22: 91 focused existing client/shared-request and new
scoped estimate tests, 107 connected estimate stories, web types, and
changed-file lint. Coverage includes full binding checks, fresh-read
deduplication, non-retrying commands/PATCH, recipient and draft refresh, exact
typed deletion, conversion review/cancellation, wrong workspace navigation,
receipt authority, and denial. No live email, publication, customer decision,
Job creation, or provider/model operation was exercised.

## Billing migration

The canonical Billing route uses viewer/workspace-scoped summary and invoice
queries. Invoice keys include the cursor. Billing retains its explicit refresh
model: server snapshots and locally accumulated invoices remain frozen until
the user refreshes or a confirmed command requests reconciliation. Queries do
not run on mount/focus or seed the cache with an invented read timestamp.
Refreshing cancels older invoice requests; stale pages cannot append to the new
snapshot. Pages retain contract validation, duplicate-invoice filtering,
independent history errors, and explicit retry.

Plan previews/confirmations/refresh/undo, card preparation/save, renewal recovery,
and onboarding checkout JSON commands use native non-retrying mutations.
Reviewed quote IDs, SetupIntent attempt IDs, and explicit consent are preserved.
Successful billing changes invalidate the originating viewer/workspace's
entitlement-dependent queries without background-replacing open payment reviews.
Preparation/preview alone does not invalidate entitlements. Provider secrets are
never query data; mutation observers reset after each command and detached
mutation results are collected immediately.

Stripe Elements, embedded Checkout, SetupIntent confirmation, payment
confirmation, bank challenges, and payment-completion navigation retain their
specialized SDK transports. A dismissed bank challenge still reconciles status
with the server. No charge is automatically retried, and a failed Billing
reconciliation cannot be presented as a verified card/payment success.
Denied reads or commands hide the Billing snapshot and any open payment dialogs;
workspace/viewer changes remount local reviews and discard late UI results.
Owner-only management, Admin read-only access, and all server authorization
remain unchanged.

Validation under Node 22: 27 focused query/command and related contract tests,
12 connected canonical Billing/checkout stories, web types, and changed-file
lint. Coverage includes 12/24/26-invoice paging, failed history retry, refresh
cancellation, malformed responses, denied reads/commands, exact reviewed quote
retry, cancellation/undo, recovery status reconciliation, missing Stripe SDK
configuration, and checkout reconciliation retry. No live Stripe charge or bank
challenge was exercised.

## Settings migration

The canonical lead assignment, Job notifications, Work Order settings, personal
notification preferences, estimate business profile, permissions, and AI usage
routes use viewer/workspace-scoped query and mutation helpers. Responses are
validated before acceptance; structured denial, conflict, validation, and
reauthentication errors retain their existing feature-specific UX.

Settings forms deliberately keep their server-rendered snapshots and local
drafts outside the query cache. Their queries are disabled until an explicit
reload: mounting, focusing, or invalidating a query must not replace an unsaved
draft or a reviewed revision. Explicit reloads are always fresh. Successful
writes reconcile only the relevant local settings/section and invalidate
dependent resources without background refetching those reviewed forms.
Lead/Job submission identities survive explicit retries of the same command,
and mutations never retry automatically.

Policy changes evict inactive workspace caches and invalidate active authority
without silently reloading editors. Personal notification preference changes
invalidate that viewer's preference queries across workspaces, not another
viewer's preferences. Denied requests hide protected settings instead of
continuing to display an editable cached snapshot.

AI usage retains explicit refresh, precision-preserving numeric strings, and
the existing 15-second timeout without automatic retries. Account deletion,
credential reauthentication, and estimate logo uploads retain their specialized
transports. Server authorization and navigation/draft confirmation behavior are
unchanged.

Validation under Node 22: 25 focused settings query/mutation tests, 11 connected
canonical route stories, web types, and changed-file lint. Stories cover exact
submission retries, conflict/reload, independent Job section drafts, malformed
responses, successful saves, denied access/recovery, explicit AI refresh, and
permission reauthentication.

## Reports migration

All nine canonical report pages (Overview, Leads, Sources, Calendar, Jobs, Team,
Estimates, Activity, and Financial) use the shared `useReportRead` query path.
`TemplateSession` supplies the server-authenticated viewer/workspace boundary.
Keys include the entire request, native policy/scope authority, local date, and
timezone. Fresh exact selections reuse their cache; different selections never
use another selection's results as placeholder data.

Server snapshots retain their actual report `asOf` timestamps. Composite Overview
and Financial responses use the oldest participating snapshot, not browser mount
time. Newer cached responses are not overwritten by older server snapshots.
Existing adapters still validate request, authority, clock, facets, and evidence
before a network response enters the cache. Read failures hide stale evidence,
retain actionable diagnostics, and support explicit refetch; denied reads also
remove cached inactive workspace data. Existing domain mutation invalidations
of `reports` now reach these queries.

Personal template lists are separately scoped by viewer, workspace, and area.
Create, rename, update, delete, and run operations use non-retrying mutations and
validated receipts. Reviewed versions, unsaved dialog values, run/configuration
race checks, and unmount guards remain intact. Successful commands reconcile the
originating list and mark it stale without replacing an open reviewed list.
CSV preview/download flows retain their specialized transports and independent
authorization; no report permissions, financial calculations, or export limits
changed.

Validation under Node 22: 21 focused shared-query/template tests, 17 selected
canonical report/template interaction stories, web typecheck, and changed-file
lint. Historical story fixtures explicitly model fresh server snapshots; cache
reuse stories assert that returning to a fresh selection makes no extra request.
No production build, full regression suite, or database E2E run was needed.

## Notifications migration

The canonical shell notification menu uses a viewer/workspace-scoped infinite
query with validated notification variants and page responses. The authenticated
layout supplies the viewer identity, including on routes outside migrated feature
boundaries. Polling remains every 15 seconds while the document is visible;
opening the menu, focusing the app, and existing
`salesmora:notifications-refresh` events recheck the query.

Older pages share the same query, deduplicate notification IDs, and stop at the
API's 50-page limit. Refreshes recheck all loaded pages instead of dropping older
items. Mark-read uses a non-retrying mutation, cancels in-flight notification
reads, and invalidates only the originating viewer/workspace's notifications.
Read/write access denial hides both the unread count and item details. A manual
retry restores them only after a successful read; other errors retain explicit
load/action feedback rather than appearing as an empty inbox.

Notification preferences remain server-rendered with their existing save flow;
they will migrate with settings. No notification delivery or permission rules
changed.

Validation under Node 22: 28 notification contract/query tests, five canonical
connected-menu interaction stories, web typecheck, and changed-file lint. No
production build, full regression suite, or database E2E run was needed.

## Leads migration

The canonical `LeadsReadRoute` now uses scoped React Query list/detail/quick-view
queries. The server supplies initial data with its read timestamp. URL filters
and sort/paging remain authoritative; cached results for different filters do not
appear as placeholder data. Assigned-only list/detail/quick views retain the
existing 15-second permission/data recheck. Pipeline column pages and note/activity
pages use distinct query keys and reject incompatible policy/scope merges.

Create, edit, stage, assignment, note, archive/restore, and deletion requests use
`useMutation` and validated response schemas. Submission IDs, expected versions,
lost-response retry behavior, and canonical conflict/draft UI are preserved.
Writes cancel pending Lead reads first; completion is guarded against an unmounted
route. No optimistic writes or automatic write retries were added.

Successful manual or assistant Lead actions invalidate dependent workspace keys.
Confirmed deletion additionally removes detail/history/note queries and cancels
pending Lead reads. Estimate-driven Lead stage changes use the same invalidation helper. Intake
decisions now use the shared mutation transport as described below.
Home remains server-rendered: its future query key is invalidated, and normal
navigation/server refresh loads a fresh snapshot. Notification refresh events and
specialized CSV export behavior remain intact.

Validation under Node 22: 42 focused unit/contract tests, web and contract
typechecks, targeted lint, 27 canonical Leads Storybook interaction/accessibility/
layout cases at 1440/768/320px (quick-view cache reuse also rechecked at each width),
and 16 native browser workflow regressions across
separate disposable baseline databases (including a corrected notes-error copy
regression, exact filtered-query request reuse, and assistant-confirmed stage/
deletion refreshes). Shared test data was not reset.

## Customers, Jobs, and Calendar migration

The canonical `CustomersRoute`, `JobsRoute`, and `CalendarRoute` seed their scoped
queries from authenticated server reads. Lists include every filter and paging
parameter in the cache key; detail histories, customer lead candidates, job team
messages, creation-deadline context, visit peeks, and schedule advisories have
separate keys. Filter changes do not use previous-filter placeholder rows.
Customer queries retain the existing guarded 30-second recheck. Calendar keeps
URL canonicalization and requires fresh list/visit reads before schedule review.

`apiReadOptions` builds typed, cancellable JSON reads. Resource families in
`invalidateWorkspaceResources` include their detail/candidate/message/advisory
queries. `useApiMutation` shares pending-read cancellation and unmount guards
with Leads. Native mutations preserve submission IDs, frozen expected versions,
duplicate handling, schedule reviews, and conflict/draft recovery. Confirmed job
messages update the query cache only after the server responds; failed sends keep
the composer text.

Manual writes, customer/calendar assistant confirmations, and existing visit
change events invalidate the affected workspace families. Customer deletion
evicts detail pages and navigates away without refetching the deleted record.
Assistant deletion invalidates without active refetch before eviction/navigation,
so an expected 404 cannot interrupt the redirect. Saved-write reload failures
remain visibly distinct from failed writes. Revoked access hides cached private
content/actions and refreshes server-owned permissions.

Exports, file-management/processing flows (including their metadata reads),
authentication, and streaming assistant transports remain unchanged and outside
this batch. Related estimates/work-order server slots retain their existing
orchestration until their reviewed migration. Home remains a server snapshot.

Validation under Node 22:

- 60 focused query/transport/cache and related contract tests.
- Web/contracts typechecks, targeted lint, and whitespace checks.
- 87 responsive Storybook interaction/accessibility/layout cases at
  1440/768/320px: 39 canonical Customers/Jobs/Calendar cases and 48 shared-provider/
  Leads regressions, including newer server snapshots.
- 13 native API/browser workflows on disposable baseline databases: current
  authorization, filter request reuse for all three routes, customer
  create/edit/notes/archive/deletion, job lifecycle/team-message failure recovery,
  shared scheduling, field scope, cross-feature visit changes, and customer
  assistant edit/deletion refreshes.

No shared test database was reset. Temporary Storybook and isolated build output
are removed after validation; no full production build was rerun for this batch.

## Materials, Work Orders, and Intake checkpoint

The canonical Materials and Work Orders list/detail routes now use scoped,
validated queries seeded by authenticated server snapshots and read timestamps.
List keys include all filters, sorting and pagination; existing search debounce
is preserved. Work-order job pickers, catalog access/search, creation-visit
previews and visit-management reads use the same query foundation. Creation
previews and explicit visit reviews still obtain fresh server authority before
confirmation.

Material and work-order commands use shared native mutations, preserve receipt
IDs and expected versions, and invalidate dependent material/work-order/job/
calendar/estimate/Home/report families as appropriate. Confirmed draft deletion
evicts the deleted detail/visit without actively refetching it before navigation.
Assistant-confirmed material/work-order changes and calendar changes invalidate
the corresponding families. Permission failures hide private cached content and
actions; reload errors are surfaced rather than becoming successful empty data.

Intake lists use URL-backed client queries, including browser history, rather
than a server navigation for each filter. Intake detail reads are cached, but
corrections and prepared decision reviews remain local, frozen snapshots.
Preparation is a cancellable, timeout-bound mutation because its POST creates a
server-bound review ID; it is not a reusable query result. Expired reviews require
explicit review checks instead of silently refreshing an in-progress decision.
Decisions preserve capacity/conflict distinctions, exact retry payloads, and Lead
invalidation.

Exports, file-management/processing, authentication and streaming remain on their
specialized transports. Estimates was migrated in the subsequent checkpoint
described below.

Validation under Node 22:

- 62 focused query/transport/cache and related contract tests.
- Web/contracts typechecks, targeted lint and whitespace checks.
- 69 canonical responsive Storybook interaction/accessibility/layout cases at
  1440/768/320px, including exact retries, denied access, corrections, conflicts,
  capacity, duplicate decisions, and review expiry without automatic preparation.
- Three native workflows on disposable baseline databases: reviewed work-order
  creation; exact Materials/Work Orders/Intake filter-cache reuse and saved
  material refresh and draft deletion without a deleted-detail refetch; reviewed
  visit join/separation.

No shared database was reset and no production build was run.

## Estimates migration

The canonical Estimates list uses scoped, validated queries with complete URL
filter/sort/page keys. Returning to an exact fresh filter reuses its result
without another API request. Assigned-job scope retains its 15-second recheck.
The server-rendered editor seed and unsaved draft remain local; sharing, decision,
history, revision, conversion, lead-stage, related-estimate and parent/catalog
reads use `useEstimateRequest` and response contract schemas.

Explicit reviews always revalidate; parent/catalog searches can reuse the
30-second cache. Query observers keep imperative review consumers active until
their read completes, so one denied read cannot evict and cancel another active
review before it receives its own authorization response. Caller cancellation
discards that caller's result without aborting a deduplicated query used by
another review. Workspace/sign-out cancellation still aborts the shared query.
Frozen version/hash bindings, explicit expiry/conflict reloads, paginated history
deduplication and related-list read-version restarts are preserved.

Commands use native mutations without automatic retries. Existing submission
identities and versions are retained for exact retries. Writes cancel affected
resource reads and invalidate estimate/parent/related, lead, customer, job,
work-order, calendar, Home and report families without silently refetching frozen
reviews. Existing workflow reloads reconcile their own displayed snapshots.
Deletion evicts the deleted record and descendants before navigation, without
refetching a deleted detail. Assistant-confirmed estimate changes invalidate the
same dependent server state before their existing history/server refresh.

Bearer customer-link retrieval bypasses the query cache entirely. Public
capability reads, print/export flows, streaming chat and file transfers retain
their specialized transports.

Validation under Node 22:

- 188 focused query/transport/cache and estimate contract tests, including
  deduplicated-read cancellation, concurrent access denial and capability-link
  cache exclusion.
- Web/contracts typechecks, targeted lint and whitespace checks.
- 21 canonical list/editor Storybook interaction/accessibility/layout cases,
  including Strict Mode review reopen, malformed reads and retained draft retry,
  plus 78 connected assistant sharing/decision regression cases at 1440/768/320px.
- 50 distinct native API/browser workflows verified across broad and targeted
  reruns on unique disposable baseline databases cover
  real response contracts, exact filter request reuse, create/save, frozen
  publish/send/resend, exact retries, duplication/deletion, archive/restore,
  decisions/conversion, revision/history paging, parent creation and related-list
  access changes. Four assistant regressions exercise real sharing, decisions,
  conversion and the independent lead-stage confirmation. Gateway-error tests
  exhaust the two automatic read retries before asserting manual retry behavior.
  Editor tests synchronize with the client sharing read before clicking
  server-rendered controls, avoiding pre-hydration clicks.

No shared database is reset and no production build is required for this slice.
