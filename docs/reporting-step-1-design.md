# Reports step 1: contracts, access and query design

> Historical migration paths in this document refer to the prior release. Current fresh databases use the [curated baseline](../packages/data/src/baseline/); existing databases require a separately designed upgrade.

Status: **Design approved interactively, including the 366-day range and 32 MiB new-report CSV limits.** November 5, 2026.

Parent: [Implementation plan](reporting-implementation-plan.md). Metric authority: [approved step 0 definitions and fixtures](reporting-step-0-discovery.md). This document specifies future implementation; it does not add executable contracts, routes, permissions, policy grants, migrations or report queries.

## 1. Decisions confirmed during this step

- Preserve existing archive-visibility gates. Historical scope is explicitly labeled when archived records are excluded by authority; never imply workspace-complete historical results.
- Add distinct, revocable `reports.export` and `reports.financial.read` permissions. Existing workspace policies opt in explicitly; do not backfill these grants automatically.
- Underlying domain read/export and monetary permissions remain mandatory. Neither new permission overrides them.

All other approved product boundaries remain unchanged: standard reports on every plan, Office within grants, Field assigned-only, CSV Owner/Admin only, financial report Owner/Admin only, manual UI before read-only assistant.

## 2. Strict query contracts

Use strict Zod discriminated unions in `packages/contracts/src/reports/`, exported through the existing package index. Do not introduce a generic query builder, arbitrary column/grouping/expression input, client role/scope or browser-supplied asOf.

### Common rules

| Input | Specification |
|---|---|
| Workspace | UUID; compare against authenticated selected workspace; actor always comes from session |
| Report key | `overview`, `leads`, `jobs`, `team`, `estimates`, `calendar`, `sources`, `activity`, `financial` |
| Period selection | Strict union `{preset: last30days}` or `{preset: custom, from: ISODate, to: ISODate}`; current sections have no creation-period predicate |
| Calendar selection | Separate union `{preset: next7days}` or `{preset: custom, from, to}` for visit dates; unscheduled queues remain current |
| Dates | Real ordered Gregorian dates, business timezone from database; reject year zero and impossible dates. Proposed maximum selected range: 366 inclusive dates, a technical limit shown in validation copy. No silent clipping. |
| Table | Closed per-report `table` key, per-table sort enum, `direction: asc|desc`, integer page 1-100000, pageSize 25|50|100 |
| Filters | Enumerated stages/statuses/sources/material states. IDs are validated canonical IDs; `me`/`unassigned` only where supported. No arbitrary JSON conditions. |
| Filter arrays | Deduplicate; at most 50 teammate IDs, five lead stages/sources, six Job statuses. Invalid values fail; unauthorized teammate selections fail without naming hidden members. |
| Search | Only record-table search where needed, trimmed <=200 characters; no global search over raw activity payloads |
| URLs | One occurrence per scalar parameter. Arrays use one documented JSON-array parameter rather than ambiguous repeated scalars. Reject malformed/duplicate API input. |
| Defaults | Normalize on server once; return normalized query. UI URL adapters may project supported navigation parameters using existing patterns, but API validators reject unknown fields. |

Technical range limit is approved, not a new product entitlement. Current snapshots are not clipped to 366-day-old records.

### Report-specific projection

Each detail request selects one supporting table plus its applicable summaries. Stable table keys are part of the schema, not labels:

| Report | Tables / filter applicability |
|---|---|
| Overview | No table pagination; selected period for outcomes, current state for pipeline/attention, next-seven-days for visits. Links point to canonical detail queries. |
| Leads | `intake`, `pipeline`, `won`, `lost`, `converted`, `attention`, `age`; owner/source/stage applicable per table, with dateBasis fixed by table. Intake/converted use creation cohort; Won/Lost use transition window; pipeline/attention/age are current. |
| Jobs | `created`, `completed`, `canceled`, `reopened`, `active`, `overdue`, `dueSoon`, `noDeadline`, `waiting`; event period only for first four, current for rest; owner/service/status filters must not overwrite event semantics. |
| Team | `leads`, `primaryJobs`, `supportJobs`, `unassignedLeads`, `unassignedJobs`; current only. Member filter is self under assigned scope. |
| Estimates | `firstQuoted`, `accepted`, `declined`, `awaiting`, `expired`, `handoff`; period for first three, current for remainder; family selection precedes status/decision/owner filters. |
| Calendar | `visits`, `busyDays`, `overlaps`, `pastScheduled`, `unscheduledJobs`, `unscheduledWorkOrders`; visit-date range only for scheduled tables. Person/type filters intersect canonical record visibility. |
| Sources | `leadCohort`, `acceptedValue`; the period selects Lead creation for both, with effective accepted-family value current as of the snapshot (acceptance may follow the period); current recorded broad-source grouping. |
| Activity | `events`; event period, selected domains, allowlisted action IDs and authorized actor filter; no note-body search |
| Financial | `acceptedValue`, `recordedMaterials`; decision period for accepted value; current snapshot for materials, with Job/Work Order/material status filters. |

Not every table needs its own route/component: the discriminated result and shared table compose the same canonical UI. Counts and drill-through must always come from the selected table's exact predicate.

Selected period must not be sent as an applicable predicate to Team/current material queries. If a parent route preserves it in URL state, show it only on sections that use it.

## 3. Typed result contracts

### Response envelope

Proposed `ReportResult` is a discriminated union by report key, not `Record<string, unknown>`. Every variant contains:

- `schemaVersion: 1`, workspaceId and normalized query.
- `asOf` UTC timestamp and validated business timezone.
- Selected business-date ranges, corresponding UTC boundaries for timestamp metrics, and typed dateBasis per section: `leadCreated`, `leadTransition`, `jobCreated`, `jobTransition`, `decisionDate`, `firstQuote`, `visitDate`, `eventTime`, or `current`.
- Scope metadata per domain: effective workspace/assigned projection and `archiveVisibility: included|excluded`. Inclusion means authorized inclusion, not a claim that deleted data survives.
- Explicit notices for restating effective decisions, current owner/source attribution, non-additive participant totals and incomplete recorded history.
- Typed section states, one paginated supporting table where applicable, authorized drill-through descriptors and export capability.

### Section state union

Use disjoint fields so unavailable values cannot accidentally render as zero:

```ts
type Section<T> =
  | { state: "available"; value: T }
  | { state: "empty"; value: T }
  | {
      state: "incomplete";
      known: T;
      coverage: { knownRecords: number; missingRecords: number };
      reason: "missing-evidence" | "invalid-evidence";
    }
  | {
      state: "unavailable";
      reason: "permission" | "unsupported-evidence" | "no-denominator";
    };
```

This is a design sketch, not a new runtime type. Each concrete schema further restricts valid states and payloads:

- Count/table empty states contain real zero/empty rows for authorized evidence.
- Incomplete monetary payload uses `knownSubtotalCents`, never a field labeled complete `totalCents`.
- Invalid identity/count evidence fails the affected section explicitly; do not manufacture a trustworthy count from malformed events.
- Rates are unavailable if numerator/denominator completeness cannot be proved. Do not compute a percentage over a known-only subset.
- Permission denial never carries totals, missing-row counts or hidden denominator metadata.
- Unexpected SQL/configuration errors fail with an explicit error/retry boundary and safe standard diagnostics. They are not modeled as ordinary empty or unsupported data.

### Scalar and identity rules

- Counts/page totals: nonnegative safe integers; reject overflow. Do not cast PostgreSQL bigint/text counts blindly.
- Money: signedness-appropriate canonical integer-cent decimal strings in DTOs; known values here are nonnegative. SQL numeric/bigint or exact integer arithmetic internally; no floating sums.
- Materials quantity: canonical persisted decimal string, <=3 fractional places. Never derive financial calculations from a converted JS float.
- Rates: `{numerator, denominator}` with denominator >0; UI formats from these, not a server/browser independently recalculated population.
- Elapsed duration: exact `sumCalendarDays` and `sampleSize`; presentation derives rounded mean (one decimal), with zero sample unavailable.
- Supporting event identity: `(domain,eventId)`; family identity uses workspace plus estimate number and selected revision ID; visits use canonical visit ID.
- Row references contain only authorized identity/label and permitted application route information. No raw activity JSON, frozen paper content, policy fingerprints, actor credentials or opaque query SQL in browser DTOs.
- Drill-through descriptor uses a closed application destination plus validated query/reference. No model/client-provided arbitrary URL.

### Money access distinction

R5 estimate values remain governed by existing `estimates.read`; adding a dedicated financial report does not silently remove already approved ordinary Estimate visibility.

R9 requires `reports.financial.read` as well. Its materials subsection additionally requires per-record price/cost permissions. Overview/source estimate-value sections retain the corresponding Estimate access contract; no materials costs leak through them.

## 4. Authorization composition

### Reuse existing authority

[The engine](../packages/domain/src/authorization/authorize.ts#L82) already returns `reports.read.sourceScopes` intersected for lead and Job. Preserve that mechanism rather than synthesizing a wider policy/context.

The existing resolver denies Reports when neither lead nor Job source is authorized. Preserve this entrance rule for this release. An estimate-only/calendar-only user with neither read remains denied rather than silently changing the existing catalog behavior; extending standalone source entrance is separate review.

Server-owned report access plan:

1. Authenticate and enter [withWorkspaceAuthorization](../packages/data/src/authorization/store.ts#L43).
2. Resolve `reports.read`; denied => deny page/API, not empty.
3. Use returned lead/Job source scopes. Resolve other domain permissions independently.
4. Intersect every relevant underlying relationship with the Reports scope:
   - Leads: current owner.
   - Jobs: current primary owner OR team.
   - Estimates under assigned Reports: Job-parent estimate on the actor's assigned Job, also satisfying current estimate read authority. Do not invent assigned access to lead-parent estimates.
   - Work Orders: current domain-scoped relationship (primary/crew or permitted assigned parent Job); assigned Reports narrows workspace domain grants to those relationships, excluding Field/assigned Drafts according to existing rules.
   - Calendar: own/assigned projection plus each contributing record's existing visibility; Work Order-only access never implies full parent-Job access.
   - Customer activity: existing full customer read contract only. Related-customer DTO access does not authorize full customer history. Assigned Reports omits customer-domain history initially rather than invent a customer assignment scope.
5. Apply authorized scope and archive eligibility before facets/counts/grouping/pagination.
6. Cross-domain conversion/monetary attribution only when workspace report plus all participating workspace reads and equivalent archive coverage prove complete support. Otherwise section unavailable; do not inspect hidden links to decide.
7. Do not return parent names, teammate facets or missing-row coverage outside the authorized projection.

When domain query helpers need a narrower report constraint, pass a typed server-produced constraint in addition to the genuine context; never mutate grants or add enabled permissions inside a repository to force access.

### Archived records

Historical reports include archived records only where the domain's existing archive visibility allows them. Leads/customers/estimates preserve current archive permission gates; Work Orders preserve their existing read/lifecycle rules. No archive mutation is performed.

For archive-restricted users:

- Default to authorized historical scope and visibly say "Archived records excluded by your access."
- Never display how many hidden archived rows exist.
- Detail rows/CSV use exactly that scope. A read grant is not elevated to an archive grant.
- A complete-within-declared-scope count is available, not numerically zero for hidden rows. Do not call it a full-workspace historical total.
- Cross-domain rates require matching archive populations; withhold if support cannot be complete. An Owner with revoked archive authority is not exempt.

### Permission catalog design

| Permission | Shape | Eligible/default for new workspace | Enforcement |
|---|---|---|---|
| `reports.export` (new) | report resource, workspace mode, scope `enabled`, unlocked, dependency `reports.read` | Owner/Admin enabled; Office/Field absent | Every report-table CSV plus per-dataset export grants below. `enabled` avoids implying a global scope lattice across different resources. |
| `reports.financial.read` (new) | report resource, workspace mode, scope `enabled`, unlocked, dependency `reports.read` | Owner/Admin eligible, explicit opt-in only; all default grants absent | R9 entry; per-domain/price/cost checks still required; catalog foundation approved November 7, production activation deferred |
| `reports.read` (existing) | Existing collection W/A | Preserve existing defaults/policies | No auto-grant or widening |
| `activity.export` (existing, unreviewed) | Preserve current workspace scope and existing lead/customer/Job dependencies | Preserve existing defaults; activate only with implemented service | Add per-selected-domain runtime checks for estimate/Work Order reads/exports; no dependency removal or automatic policy rewrite |
| `jobs.export` (existing) | Preserve current shape | Preserve grants | Enable only with functioning Jobs export backend |

Validate the new enabled-scope dependencies with [existing policy validation](../packages/domain/src/authorization/policy.ts#L16). Do not add all domain reads as static dependencies to `reports.export`: that would invalidate partial-domain policies and force unrelated access.

Existing policies receive no new grants at feature rollout. Owners explicitly enable the new capabilities per role through the established permissions UI. Explain this availability in rollout guidance. New-workspace initializer/default fixtures must include the approved new defaults when implementation happens.

Audit catalog/template/permission-setting changes through existing mechanisms; no runtime "missing grant => default allow." Do not use the older broad backfill (historical migration; see the prior release) as a template for this opt-in decision.

## 5. Export authority and contracts

### Required permissions by projection

All report-table exports require authenticated current Owner/Admin eligibility, `reports.read`, new `reports.export`, applicable read scope and all listed export grants:

| Export projection | Additional authority |
|---|---|
| Lead intake/stage/attention/age | `leads.export` |
| Lead conversion | `leads.export` AND `jobs.export`; complete supporting read/archive contract |
| Job events/current status/deadline | `jobs.export` |
| Team leads / primary or supporting Jobs | `leads.export` or `jobs.export` for that one selected table; no mixed-scope bundle |
| Estimate decisions/pipeline | `estimates.export`; new family/period projection, not unchanged default-list export |
| Source lead cohort | `leads.export`; Job conversion columns additionally `jobs.export` |
| Source accepted value | `estimates.export`, `leads.export`, `jobs.export`, complete workspace cross-domain reads |
| Calendar visits/person-days/overlaps | Job projections require `jobs.export`; Work Order projections require `workorders.export`; all-types selection requires both. Still intersect Calendar/domain visibility. |
| Activity | `activity.export` AND each explicitly selected domain's export/read authority; customer requires `customers.export`, estimate requires `estimates.export`, etc. |
| Financial accepted value | `reports.financial.read`, `estimates.export`; any attributed linkage adds relevant domain export/read grants |
| Financial material rows | `reports.financial.read`, `workorders.export`, current Work Order read plus `workorders.view_prices`/`workorders.view_costs`; Job export only if Job fields beyond an already authorized Work Order label are included |

No automatic per-row schema reduction on an export request. If selected columns/domains are unauthorized, reject and require review of a supported selection. UI can offer a clearly narrower selection, but may not silently change a confirmed all-domain request.

Ordinary record exports outside Reports keep their existing permission requirements; do not impose `reports.export` on existing Leads/Customers pages. A Reports link handing off to an existing record export must preserve all report scope constraints; if it cannot, use the canonical report projection rather than grant a wider download.

Overview exports are not an opaque dashboard ZIP. Each section links to one named tabular export with its own date basis.

### Request/preview/download

- `ReportExportRequest`: versioned report key, closed table/projection key, normalized relevant filters, closed column-set version, expected row count at confirmation. No page/pageSize, actor, scope, arbitrary column expressions or permission flags.
- First release report exports use documented fixed columns for each projection. Existing dataset column pickers remain unchanged.
- Preview: `{count, rowLimit, schemaVersion, scope, dateBasis, ranges, timezone, asOf}`; not a token authorizing future access.
- Proposed API: `POST /api/reports/[reportKey]/export/preview` returns preview; `POST /api/reports/[reportKey]/export` returns streamed CSV. Same-origin/session/body limits on both; private no-store, `nosniff`, safe filename on download.
- Recheck and recount in the download query snapshot. Count mismatch => conflict/review again before returning bytes. Same count does not prove unchanged content: explicitly describe export as fresh current data, not a frozen preview.
- Document column semantics and CSV schema version, especially dates versus UTC timestamps and integer money formatting.
- Technical row cap starts at 50,000, configurable and validated; byte cap starts at 32 MiB for new browser CSVs. No plan-specific limits, no silent truncation.
- Use exact serialized row count and fixed sort/tie-breaker. Monetary exports include coverage and known-subtotal labels where incomplete, never implicit zero.

### Lifetime, audit and failure

Use existing cursor/backpressure precedent from [Estimate export](../packages/data/src/estimates/export.ts#L210), not buffered Work Order/customer implementations for new report exports.

- Persist content-free started/rejected audit in a short completed transaction before generation; do not try to upgrade a held shared workspace lock from a second audit connection.
- Generate under its own current authorized transaction and stable snapshot. Cursor fetches bounded batches (initial 100); finish protected work before transaction release.
- Bounded generation timeout, row/byte checks and request cancellation close cursor, transaction and stream.
- Mark generation completed only after output generation succeeds; do not claim the client saved a file. Persist failed/canceled outcomes separately after rollback, with safe diagnostics if audit persistence itself fails.
- Midstream errors destroy/error the transport; never append an error CSV row and end successfully.
- Existing fetch/blob client boundary must wait for successful completion before initiating save, with byte cap enforced. Test actual truncated-response behavior rather than assume HTTP 200 guarantees success.
- Generation limit must leave time for cleanup/audit inside the 40-second route budget; initial 30-second generation timeout, 10-second statement timeout and 5-second lock timeout follow relevant prior art, subject to measurements.

No new async exports/private object delivery in this design.

## 6. Query architecture and consistency

### Shared boundary

Contracts -> domain definitions/access composition -> Knex scoped projections -> session-bound server orchestration -> page/API/manual CSV -> later read-only assistant.

Each read gets one server-owned `asOf` and one business timezone. For a multi-query response, establish a repeatable-read transaction before protected queries and run the existing authorization boundary within it (nested savepoint as supported by Knex). Verify lock/isolation behavior in runtime-role tests before adopting the wrapper. Do not assume the current default read-committed wrapper produces an immutable snapshot across statements.

Serialization/lock failures return an explicit retry error through normal HTTP handling; no broad empty fallback. Release locks promptly; no network/provider calls while holding the workspace transaction. Preview and download are separate snapshots.

Keep the PostgreSQL session timezone semantics of the existing seven-day interval expression. Determine/record that configuration in runtime-role fixtures; do not change global database timezone in this feature to make a test pass. Date-range and calendar-day calculations explicitly use business timezone.

### Reusable query operations

| Area | Planned operation |
|---|---|
| Lead | Extend/reuse `scopedLeadQuery`; add mandatory Reports assignment restriction and authorized archive predicate before count/facets. Shared normalized date-bound construction; no UTC fallback for invalid business zone. |
| Job | Extract internal scoped base from Jobs without changing existing list behavior; add report-specific event-selected CTEs. Completion: period-filter valid status events -> row_number per Job by timestamp/id desc -> rank 1 -> same rows drive count/trend/duration/detail. |
| Estimate | Extract scoped base separately from default latest-revision visibility. Select latest issued family revision before decision/status filters; earliest family issuance is a separate historical event projection. Latest decision by estimateVersion, then business decision-date filter; validate frozen hash/amount/decision relationship. |
| Team | Aggregate distinct currently scoped lead/Job IDs; unnest/deduplicate participants only after scope; primary and support separate. Never sum participant totals as workspace distinct Jobs. |
| Calendar | Extract scoped canonical visit records from current reader; apply rolling range directly, group by visit/person. Unscheduled Job/Work Order record totals before pagination, distinct visit totals separately. Preserve current Calendar Week API unchanged. |
| Sources | Lead-cohort grouping independent of estimate-decision grouping. One estimate-family-to-lead path; no receipt join. Conservative workspace authorization before attribution query. |
| Activity | Union each native domain history once with a namespaced ID after parent visibility; explicit action/source allowlists; count and row filters identical. Do not call record-detail APIs repeatedly. |
| Materials | Authorized saved rows, status/archive predicates; SQL numeric multiply and per-line rounding, bigint/numeric sum; known/missing counts. No catalog-price fallback or historical spend reconstruction. |
| Overview | Compose the same report projections/definitions within one authorized response boundary. Do not call each page/API over HTTP, duplicate KPI logic or fetch full record populations. |

Invalid history must not be quietly eliminated by a SQL WHERE that makes a complete-looking metric. Validate expected event shapes and declare section failure/incompleteness. Use ID-stable SQL selection and narrow validation payloads; do not ship frozen papers or raw histories to the browser.

Index candidates are hypotheses until EXPLAIN: workspace/event timestamp/parent ID, estimate family/issued revision/latest decision version, visit date, assignments and archive/status/date predicates. Inventory existing indexes first. No speculative indexes or reporting summary tables in step 1.

## 7. Fixture and performance design

Reuse [step 0 exact fixtures](reporting-step-0-discovery.md#3-fixture-conventions). Add contract/access cases:

| ID | Expected result |
|---|---|
| Q01 | Unknown report/table/filter/sort/date basis, duplicate scalar, invalid date, custom range >366 dates => validation error before queries |
| Q02 | Source-only date windows cannot be accidentally applied to current sections; normalized response declares applicable basis |
| Q03 | Unavailable union cannot contain a numeric value/coverage; incomplete money cannot parse as complete total |
| Q04 | Money/quantity decimal strings and safe integer counts validated; integer overflow explicit |
| P08 | Existing policy with no new grants remains unchanged and cannot export report tables/open R9 |
| P09 | New default template grants new capabilities only to Owner/Admin; dependency validation passes without unrelated domain reads |
| P10 | Revoked archive authority excludes archived records with declared scope; no hidden row counts; exact table/CSV parity |
| P11 | Assigned Report + workspace estimate/calendar/Work Order grant still narrows by approved relationship; customer history omitted |
| P12 | Missing one selected-domain export grant rejects all-domain activity/Calendar export; no silent column/data reduction |
| P13 | Neither lead nor Job read => existing Reports entrance denial preserved |
| X01 | Preview count changed at download => conflict before headers; same count changed rows => fresh-data notice, no frozen-preview claim |
| X02 | Cancel, permission change between requests, row/byte cap exceeded, SQL timeout, midstream failure => no successful partial download; failure audit/cleanup verified |
| X03 | Concurrent policy change blocked only for bounded protected work; no lock-upgrade/audit deadlock |
| X04 | Concurrent mutations during multi-query response do not mix count/trend/detail snapshots; next request may change |

### Isolated synthetic benchmark

Follow [Calendar benchmark safety](../packages/data/src/calendar/performance.rehearsal.ts#L1): explicit distinct loopback `_test` database; reject development/staging/production URL; fixture-owned workspace IDs; no reset/truncate; exact cleanup in finally. Run under restricted runtime grants, not an unrestricted superuser for query measurements.

Proposed primary workspace:

- 50,000 surviving leads across 24 months; 10% archived, skewed 70% to one source and 60% to one current owner.
- 10,000 Jobs; 20% repeated completion/reopen histories, primary/team skew and unassigned records.
- 10,000 estimate families with 15,000 revision rows; issued+pending Draft, superseded declines, corrected/backdated decisions and frozen money. Counts explicitly distinguish families/rows.
- 20,000 canonical visits; 25% shared, 10% unscheduled, overlapping windows and participant duplication across records.
- Sufficient Work Orders (30,000 proposed) and 120,000 material rows to exercise shared visits, all material statuses, fractional quantities and missing costs.
- 250,000 native CRM history events across all five domains, including the above lifecycle events; generated with a frozen seed and expected cardinality manifest.
- A second tenant with at least the same major cardinalities and colliding display labels, to expose missing workspace predicates.
- All four roles plus customized archive/assigned/monetary revocations; fixture grants activate only the permissions needed by the test.

Large rows may be inserted by a dedicated fixture builder respecting constraints, canonical history/snapshot formats and source relationships. Compare a representative subset to the real domain mutation output; do not benchmark impossible states.

Measurements:

1. Validate expected totals/fixture IDs before timing; a fast incorrect query fails.
2. Report first-use response separately; do not claim an OS/PostgreSQL cold cache unless actually controlled.
3. Five warmups, then >=100 measured requests per representative report/role/filter scenario with five concurrent readers. Include pool wait and DTO validation in request latency.
4. p95 <=2 seconds per report API on recorded production-like hardware/configuration. Test expensive overview/activity/unfiltered current workload and 366-day event queries, not just selective lists.
5. One 50,000-row/<=32-MiB new CSV: generation <=30 seconds initially and whole request within 40 seconds; incremental RSS <=128 MiB. Test alongside five readers and measure both; no claim of independent pool capacity.
6. Existing Knex pool maximum is five. Streaming export holds a connection/authorization lock, so record queue waits and policy-write contention; do not increase pool or weaken authorization to pass.
7. Capture EXPLAIN ANALYZE/BUFFERS, row counts, snapshot-validation cost, peak RSS, cursor cleanup, audit outcomes, database/app versions and resource settings.
8. Test simultaneous exports explicitly. If a concurrency admission limit is needed, propose it from measurements before implementation rather than assume a process-local counter is a distributed limit.
9. Tune justified indexes/query structure/technical caps when gates fail, then rerun the exact failing scenario. Do not waive gates because a build passed.

No benchmark executed in this step.

## 8. Proposed implementation surfaces and review order

- Contracts: query/result/export schemas under `packages/contracts/src/reports/`; closed report-specific types, not new global DTO framework.
- Domain: extend existing Reports scope composition only where needed; pure date/rate/rounding definitions reused by manual and assistant presentation.
- Data: scoped query extractions in existing domains, report projections in `packages/data/src/reports/`; reuse genuine authorization context.
- Web: existing server/session/error conventions, report page shells and canonical feature components with mocked API stories.
- Policy: catalog/default fixture/permission-page copy updates when implemented; no grant backfill. Historical access behavior documented with UI copy.
- Audit schema: add report-export audit only during reviewed backend integration if existing tables cannot represent the projection; record metadata/outcomes, never content.

After approving this design, the user chose **HTML prototype review before React implementation**, beginning with shared report date-range controls and date-basis presentation. The [interactive controls study](../prototype/prototype-screen-43-report-date-controls.html) uses fixed example dates, no live data and no API requests. The user then clarified that review must include report selection and the complete journey, and approved a [connected reporting flow](../prototype/prototype-screen-44-reporting-flow.html): nine-area landing catalog, configuration/generation setup, results/evidence and CSV confirmation. It demonstrates representative projections and explicit simulated states, not every planned table or runtime permission enforcement.

After prototype approval, implement **only the first Step 2 component**, with colocated copy/stories and mocked typed inputs. Review it before the next item. Executable shared contracts needed by that component should be introduced with focused contract tests in the same bounded slice; no database/API/policy enablement yet.

### Prototype-review addition: personal templates

The user approved personal-only report templates after reviewing the connected flow: report-area template lists, one-click runs, a prominent results-screen save callout, rename, update configuration and confirmed deletion. Relative presets roll forward at run time; custom dates remain fixed. Templates store configuration, never results or grants; each run revalidates current access. The prototype persists fixture configurations in local browser storage and labels that limitation explicitly.

The original Step 1 approval did not include template persistence. Before runtime template work, extend the reviewed contracts/data/access design to enforce workspace + owning-user isolation, valid report-specific filter configuration, current authorization on every run, and safe mutation/error handling. Do not copy browser-local prototype storage or treat the original permission design as authority for sharing templates.

## 9. Review checklist

- Strict report/table unions, 366-day custom-range limit and explicit period/current sections.
- Typed available/empty/incomplete/unavailable states, exact money/count contracts.
- Existing archive gates and report entrance rule preserved; assigned/mixed-source narrowing explicit.
- New opt-in permissions, new-workspace-only defaults, per-projection CSV matrix.
- Stable query snapshot, exact supporting tables and audit/stream lifecycle.
- Synthetic data scale, five-reader/one-export measurements and no unverified performance claims.

The user approved this design, including the 366-day selected range and 32 MiB new-report CSV cap. Documentation links, source line bounds and whitespace were checked. No application/database tests or performance benchmark ran because no executable report implementation changed.

Checkpoint approval governs design only. Runtime permission definitions, executable schemas, components and migrations still follow implementation review/testing.
