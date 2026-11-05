# Workspace Reports implementation plan

Status: **Product scope reviewed interactively on November 5, 2026. Implementation has not started.**

This plan records the agreed reporting scope and proposes its technical delivery. Product decisions below are approved; technical designs, new permission definitions, data migrations, individual components and deployment still require their own review. Start one delivery step at a time and pause for approval before proceeding.

This supersedes conflicting first-release scope and phasing assumptions in [Reporting and data export](reporting-and-data-export.md), but preserves its CSV safety, tenant isolation and portability principles. It does not expand the basic Campaign dashboard or authorize production deployment.

## 1. Goals and boundaries

Provide customer-facing workspace reports that explain business intake, pipeline, operational workload, scheduling, decisions and recorded financial values. Every aggregate must reconcile with authorized underlying evidence.

### Agreed report areas

1. Business overview.
2. Leads and pipeline.
3. Jobs, completion and deadlines.
4. Team workload, without employee performance rankings.
5. Estimates, acceptance and value pipeline.
6. Calendar and scheduling.
7. Broad lead-source effectiveness.
8. CRM activity history.
9. Sales value and recorded costs.

All first-release reports are available on every subscription plan, subject to permissions and any underlying feature entitlement. A report does not activate an unavailable capture integration. No plan-specific CSV row quotas.

Initial delivery is on-screen reporting and CSV. Reuse existing export services where their semantics match; an existing dialog or catalog permission is not proof of an implemented export.

### Deferred

- Detailed capture-cohort approval, dismissal and job-conversion analytics.
- Historical workload snapshots and historical schedule/reschedule analytics.
- On-time completion percentages until historical deadline evidence is verified.
- True revenue, customer payment accounting and actual job profitability.
- Advertising ROI, acquisition cost, multi-touch attribution and employee scores.
- Custom report builders, saved reports, scheduled email, XLSX and generated PDF.
- An analytics warehouse, materialized aggregation system or new export worker.
- Platform-admin reporting and changes to existing admin export operations.

## 2. Existing implementation and reuse

Source inspection, November 5, 2026:

| Surface | Evidence and delivery implication |
|---|---|
| Reports design | [Overview prototype](../prototype/prototype-screen-13-reports.html), [detail prototype](../prototype/prototype-screen-14-report-details.html), [export prototype](../prototype/prototype-screen-15-export.html). Use as layout references, not authority for fictional values, outdated interactions or permissions. |
| Live availability | Reports is absent from `WorkspaceShell.availablePages`; authorization treats it as upcoming. There is no live Reports page in the inspected route tree. Enable only after the relevant route and backend are ready. |
| Authorization | `reports.read` already supports workspace/assigned scopes. Lead/job/estimate/calendar scopes differ and must be intersected, not replaced by a report grant. |
| Leads | Five stages, source/owner, creation/last-activity timestamps, stage activity, scoped queries and CSV already exist. Existing attention logic includes seven-day inactivity. |
| Jobs | Six statuses, assignments, team membership, schedule, completion deadlines and immutable activity exist. Current list metrics already distinguish active/overdue/waiting/unassigned. Job export UI and catalog exist, but no Jobs CSV API was found. |
| Estimates | Decision dates/corrections, captured amounts, revision/status handling, scoped reads and audited CSV exist. Current estimate queries already distinguish effective expiry and revision visibility. |
| Calendar | Canonical shared visits, record links, scoped queries and existing workload/window warnings exist. Do not rebuild visit identity or infer sharing. |
| Work orders/materials | Separate customer price/internal cost, material quantity/status and monetary permissions exist. These alone do not prove actual cost accounting. |
| CSV | Lead/customer/estimate/work-order/material routes exist. Reuse shared formula-safe CSV serialization and applicable authorization/audit/streaming patterns. Confirm each existing service's response, buffering and count semantics before reuse. |
| Activity | Domain histories exist; no unified CRM activity reporting/export service was found. Build a safe read projection over those histories rather than a second event-writing system. |
| Finance | Existing billing invoices are SalesMora subscription invoices. No business-customer payment ledger or actual labor-cost foundation was found in the inspected surfaces. |
| Assistant | Existing global assistant and domain-specific evidence/authorization patterns are the integration point. Do not add a page composer or independent analytics implementation. |

Primary implementation references:

- [Authorization catalog](../packages/contracts/src/authorization/catalog.ts).
- [Server capabilities/navigation](../apps/web/src/server/authorization/permissions.ts).
- [Workspace shell](../apps/web/src/features/workspace/workspace-shell/workspace-shell.tsx).
- [Lead query](../packages/data/src/leads/query.ts), [stage events](../packages/data/src/leads/stage.ts), [immutable origin](../packages/data/src/leads/origin.ts), [CSV encoder](../packages/data/src/leads/csv.ts).
- [Jobs service](../packages/data/src/jobs/store.ts), [Job contracts](../packages/contracts/src/job.ts).
- [Estimate reads](../packages/data/src/estimates/read.ts), [export](../packages/data/src/estimates/export.ts), [decision contracts](../packages/contracts/src/estimate-decision.ts).
- [Calendar services](../packages/data/src/calendar/), [Calendar decisions](calendar-page-plan.md).
- [Work-order contracts](../packages/contracts/src/work-order.ts), [materials plan](materials-plan.md).
- [Component conventions](component-conventions.md), [permission catalog](permission-catalog.md).

## 3. Shared metric contract

### 3.1 Time and report modes

- Standard historical default: Last 30 calendar days, including today.
- Calendar default: next seven calendar days, including today.
- Current workload: explicitly labeled "As of now"; do not restrict it to recently created records.
- Job due-soon: today through the following seven calendar days, inclusive. This is intentionally different from Calendar's seven-day display range.
- Calendar dates use `workspaces.timezone`. Translate a historical start date to inclusive local midnight and the day after the end date to exclusive local midnight. Handle DST; do not assume 24 hours per date.
- Use one server-owned `asOf`/business-local today per response. Historical time windows, effective statuses and current attention checks must agree within that response.
- Reject invalid date ranges/timezones explicitly through standard errors. Do not invent dates, silently fall back to another timezone or render unavailable evidence as zero.
- Responses and CSV confirmation identify date basis, range, timezone, historical/current mode and applied scope.
- Current/period sections have separate controls or explicit filter applicability. Changing a period must never silently change the meaning of a current snapshot.
- Prior-period percentage comparisons are not initial scope. If added later, define equal-length ranges and zero-denominator behavior first.

### 3.2 History, counting and missing data

- Include archived records in historical intake/outcomes; exclude them from current workload and attention unless the report explicitly exposes an archive view.
- Honor permanent deletion. Do not retain deleted-record content through reports or build new retained aggregates now. Explain that historical totals may change.
- History means surviving, authorized recorded evidence, not a reconstruction of past visibility or assignment.
- Deduplicate lead/job/estimate/visit identities before summing across one-to-many joins.
- Separate counts of records, transitions, participants and activity events. Label non-additive breakdowns.
- A zero denominator yields "Not enough data"/not applicable, never 0% or an invented rate.
- Missing historical evidence or financial values are unavailable/incomplete, not zero.
- Cross-request live data can change. Preview/export rechecks authorization and filters; explain changed results rather than promise a frozen snapshot the application does not implement.

### 3.3 Drill-through and reconciliation

- Every card/chart count has an authorized supporting record/evidence view.
- URL-backed report filters survive navigation and back/forward.
- Reuse existing list URLs only if they express the complete report predicate.
- A completion-event report cannot link to a creation-date-only list and claim reconciliation. Where existing filters are insufficient, keep a paginated report detail table using the exact report query; extend source-list filters only when generally useful.
- Define stable sorting with an ID tie-breaker; standard detail tables use 25/50/100 rows.
- CSV exports the full authorized filtered result, not just the displayed page.
- Show supported date/grouping semantics in the UI and document them in export help.

## 4. Report specifications

### R1. Business overview

Purpose: "How is my business doing, and what needs attention?"

**Selected-period results:** new leads, jobs created, jobs completed, accepted estimate count and value.

**Current state:** open lead stages, estimates awaiting decisions, active/overdue jobs, upcoming visits and an attention list.

Reuse definitions from R2-R6 rather than implementing independent KPI queries. Accepted value is a sales commitment, not revenue. Monetary metrics follow their underlying permissions. Home remains a concise daily workspace; Reports provides analysis. Review any shared Home metric alignment separately; do not redesign Home.

Acceptance: every overview metric reconciles with its detailed report, and current sections remain current when the historical period changes.

### R2. Leads and pipeline

- Intake counts/trends by lead creation date.
- Current open pipeline: New, Contacted and Estimate sent; Won/Lost separate.
- Period outcomes: distinct leads with recorded Won/Lost transitions in the selected event window. A lead can appear in both if it genuinely changed outcomes; disclose this, do not imply additive exclusive outcomes.
- Creation-cohort conversion: distinct leads created in the period with a surviving authorized linked job as of now, divided by authorized leads created in that period. Job cancellation does not erase the fact that a job was created.
- Do not require the linked job to have been created in the cohort's date window.
- Recent cohorts have had less time to convert. Won and job conversion are separate facts.
- Age/last-recorded-activity age, unassigned work and seven-day inactivity on open leads. Reuse existing boundary semantics exactly and disclose recorded activity is not proof of external contact.
- Filter by stage, owner, source and applicable dates. Broad-source analysis shares R7 definitions.

Conversion needs both authorized lead and job evidence. If access prevents a truthful numerator, withhold the conversion metric with a permission explanation rather than counting hidden jobs or presenting an understated rate as complete.

Proposed initial age bands, requiring definition review: 0-7, 8-14, 15-30 and 31+ business-calendar days. Define boundaries in pure tests before showing them.

Acceptance: cohort rate reconciles to distinct supporting leads; retries, multiple joins, stage changes and immature cohorts cannot inflate it.

### R3. Jobs and deadlines

- Selected-period distinct jobs created, completed, canceled and reopened; event totals are not additive because the same job can have several lifecycle events.
- Current active status/owner/service breakdowns and unassigned jobs.
- Overdue: active completion deadline strictly before business-local today. Completed/canceled jobs excluded; due today is not overdue.
- Due soon: active completion deadline in the agreed inclusive window.
- Active jobs without a completion deadline, Waiting by reason.
- Completion trend and elapsed calendar time from creation to recorded completion, explicitly not labor hours.
- For repeated completions, select the latest completion event per job within the requested period for the period's completion count/duration. A subsequent reopen does not erase the historical completion; show reopening separately. This technical event-selection rule needs fixture review before implementation.
- Past scheduled dates are scheduling attention, not automatically overdue completion deadlines.
- On-time completion percentage remains unavailable until historical deadlines at completion can be verified.

Acceptance: repeated completion/reopen events do not inflate distinct-job totals; deadline checks agree with Jobs on local-day boundaries.

### R4. Team workload

- Current open leads by owner/stage.
- Active jobs by primary responsibility and, separately, supporting team participation.
- Assigned stale leads, overdue/waiting jobs and separate unassigned queues.
- Alphabetical default, optional count sorting; no scores/rankings.
- One shared job can appear for multiple people; distinct workspace totals count it once.
- Counts are not hours, capacity or utilization.
- Former/missing owners remain distinguishable from genuinely unassigned records; disclose whether a record needs reassignment.
- Assigned-scope report is "My workload"; do not expose unrelated teammate identities/totals.
- No historical workload reconstruction initially.

Acceptance: duplicate team relationships cannot duplicate a person's job count; participation totals are labeled non-additive.

### R5. Estimates

- Period first sent/published, accepted and declined estimates.
- Acceptance among decided estimates: effective accepted decisions / effective accepted plus declined decisions, by customer decision date in the selected period.
- Current awaiting-decision count/value; expired estimates separate.
- Accepted count/value by decision date, accepted estimates awaiting Job conversion.
- Primary amount after discounts and before sales tax; customer tax-inclusive total separately.
- Use frozen issued/accepted amounts, not current catalog/business settings.
- Awaiting rows show age/expiry; no arbitrary overdue threshold.
- Drafts excluded from quoted pipeline; archived records remain historical but not current attention.
- Resends and decision corrections are not new estimates. Superseded revisions must not inflate counts/value.

**Definition gate:** verify estimate-family lifecycle, decision correction/void behavior and frozen subtotal availability. Specify which effective issued revision represents a family; a newer unissued draft must not silently erase the last issued quote from analysis. Preserve accepted commitments according to the actual lifecycle, not guessed "latest row" logic. Fixture review must settle this before calculations are implemented.

Acceptance: correction/revision/resend fixtures reconcile with source histories; no current-price recalculation or tax double counting.

### R6. Calendar and scheduling

- Current canonical visits for selected visit dates, grouped by day/week/person.
- Separate unscheduled active Job and Work Order queues.
- Busy person-days at four or more visits, reusing Calendar's existing definition.
- Any intersecting arrival windows per person; adjacent windows do not overlap.
- Past scheduled dates on active records flag review, not assumed missed attendance.
- Explicit shared visit counted once overall and once per distinct authorized participant.
- Record/participant totals are non-additive; do not merge by matching customer/date.
- No inferred labor duration, available hours or utilization.
- Drill through to the matching Calendar week/visit and permitted record.
- No historical schedule/reschedule/cancellation analytics initially.

Acceptance: a shared Job/Work Order visit and duplicate crew memberships cannot inflate visit/person counts. Work Order-only access never grants parent-Job access.

### R7. Broad lead-source effectiveness

- Website, Referral, Phone, Gmail and Other breakdowns.
- Creation-cohort lead counts, outcomes and lead-to-job conversion using R2.
- Accepted estimate value only with durable, unambiguous and authorized source-to-lead-to-estimate links; unattributed separately.
- Distinguish current editable lead-source labels from immutable capture provenance. Initially label broad grouping as the current recorded source; do not imply historical acquisition labels are immutable.
- Avoid one-to-many attribution joins that multiply estimate value.
- No ad spend/ROI/acquisition-cost or multi-touch claims.

Detailed capture-cohort outcomes are later work: unique received items excluding retries, approval versus new-record creation, dismissal, current review backlog and durable downstream linkage. Do not change the basic Campaign dashboard in this release.

Acceptance: source breakdowns reconcile to the same lead cohort; unattributed data is visible rather than silently discarded.

### R8. CRM activity

- Unified safe read projection of lead/customer/job/estimate/work-order histories.
- Event-date range, record type, action type and authorized actor filters.
- Timestamp, actor/system source, safe action summary and record reference.
- Detail stays on existing record history pages.
- No note bodies, raw change JSON, secret values, private chat, security diagnostics or unauthorized monetary fields.
- Apply current parent-record/field authority before event pagination, totals, actor facets and export.
- Stable identity includes domain and event ID. Do not assume IDs across event tables are globally unique.
- Multiple record events from one business operation are legitimate; do not label them unique actions or productivity.
- Omit deleted-record content. Historical totals may change after deletion.

Acceptance: all five domain histories have explicit adapters/allowlists and consistent sorting; unknown event shapes fail visibly rather than leak raw payloads.

### R9. Sales value and recorded costs

- Owner/Admin only, with current report and underlying monetary read permissions.
- Reuse R5 accepted/quoted values; label commitments rather than revenue.
- Record material costs only from valid persisted quantities/cost snapshots.
- Show coverage: records/lines with known costs, missing costs and excluded scopes.
- Distinguish material status Needed/Ordered/On hand/Used. A Used status and listed quantity do not automatically prove an actual consumed-quantity ledger.
- Proposed safe first cut: current recorded material-cost snapshot grouped by Job/Work Order/status, separate from historical estimate-value sections. Do not imply the period's historical actual spending from current rows.
- Do not add material customer prices to accepted estimate value; that can double count the same commercial work.
- No profit/margin KPI until scope, value matching and missing-cost treatment are approved.

**Definition gate:** verify cost snapshots, fractional quantity arithmetic/rounding and whether issued rows can change. If a trustworthy amount is unavailable, ship explicit coverage/unavailable states or defer that subsection; never calculate from incomplete evidence as though complete.

Later financial foundation needs a separately approved model for customer invoices/payments, allocation/refunds, revenue basis, labor/subcontractor/other actual costs and accounting integrations. SalesMora subscription billing is not that model.

## 5. Permissions, plans and privacy

### Access matrix

| Capability | Owner/Admin | Office | Field |
|---|---|---|---|
| Standard reports | Current report and underlying grants | Current report and underlying grants | Assigned-work projection only |
| Financial report R9 | Current report, explicit financial access and underlying price/cost grants | Not initially | Not initially |
| CSV | Current relevant export grants as well as read/report authority | No | No |
| Read-only report assistant | Same access as manual reports plus `assistant.use` | Same | Assigned only |

Implementation rules:

1. Authenticate workspace membership and intersect `reports.read` with each domain read scope before filtering/grouping/counting. An assigned report grant must restrict workspace-wide underlying reads too.
2. Map report-assigned scope to actual relationships: lead owner; Job primary/team; estimate authorized assigned Job; Calendar own/assigned projection; activity through its authorized parent. Do not treat report scope as a database table.
3. Different domains on a mixed report may have different scopes. Omit inaccessible sections with an explicit unavailable state; never expose global denominator/teammate facets or turn permission denial into zero.
4. Cross-domain conversion/attribution requires an explicit authorization contract; do not reveal hidden linked records through an aggregate or supporting link.
5. Financial role eligibility is a ceiling, not an Owner/Admin bypass around revoked grants.
6. Recheck access for pages, APIs, CSV preview/download, assistant execution and saved assistant evidence.
7. Private/no-store responses and workspace-bound query keys; no shared cross-user response cache.
8. Preserve saved policy customizations and explicit denials. New permission/default migration behavior needs review; merely enabling a catalog entry must not rewrite grants.
9. Use existing plan and account-state services. Reporting must not bypass suspension/deletion; verify applicable read/export grace behavior rather than implement a second billing state machine.

### Permission-design checkpoint

Before feature enablement, review:

- Whether a new `reports.export` permission is needed for aggregate tables without an existing dataset export permission; proposed eligibility Owner/Admin only, intersecting all represented dataset export grants.
- A dedicated financial-report capability, proposed `reports.financial.read`, plus existing estimate/price/cost permissions.
- `activity.export`, currently unreviewed and dependent on three domain reads: define per-domain inclusion without widening other record access.
- Jobs export activation only after its API/audit/tests exist.

These are proposed catalog changes, not automatically approved grants or permission IDs to enable now. Do not reuse `reports.read` as export authority.

## 6. CSV delivery

Separate two actions:

1. **Export underlying records:** existing Leads/Customers/Estimates/etc. service when its predicates match; new Jobs implementation where absent.
2. **Export report data:** the selected tabular report projection, with its own reviewed export permission mapping and identical metric/query semantics.

Each export:

- Has stable documented columns, UTF-8 header/rows and deterministic ordering.
- Includes stable record IDs for record rows; aggregate rows have explicit dimension keys/date basis, not invented record IDs.
- Uses the existing formula-safe quoting/encoding helper; test commas, quotes, CR/LF, Unicode, leading whitespace and formula prefixes.
- Previews dataset, authorized scope, filters, date basis and expected row count.
- Rechecks permission and filters at execution; preview is not an authorization token.
- Exports full matching data, not pagination; no silent truncation.
- Has configurable technical limits, timeout/backpressure/cancellation and auditable started/completed/failed/rejected outcomes as supported by repository patterns.
- Logs content-free filter/scope metadata, not cell values or raw sensitive search terms.
- Never presents an interrupted stream as successfully complete. Test disconnects/failure after headers and use the established client download boundary to surface failure.

Reuse existing dataset limits. Proposed new-export starting cap: 50,000 rows, subject to representative measurements before release; it is a technical safeguard, not a subscription quota. Reject larger requests explicitly. No new asynchronous export system in this scope.

## 7. Proposed application structure

Use the existing TypeScript/Next.js/Knex separation, adding files only as required:

```text
packages/contracts/src/reports/
  query.ts              strict report keys, filters, date bases and query schemas
  results.ts            discriminated authorized DTOs and availability states
packages/domain/src/reports/
  definitions.ts        pure date/count/rate/money semantics where shareable
packages/data/src/reports/
  <report-area>.ts      authorized query/projection implementations
apps/web/src/server/reports/
  store.ts              session-bound orchestration using existing auth boundary
apps/web/src/features/reports/
  <component>/          canonical UI, .data.ts, stories and focused tests
apps/web/src/app/(auth)/reports/page.tsx
apps/web/src/app/(auth)/reports/[reportKey]/page.tsx
apps/web/src/app/api/reports/.../route.ts
```

Proposed route keys: `leads`, `jobs`, `team`, `estimates`, `calendar`, `sources`, `activity`, `financial`; overview is `/reports`.

Design strict server-approved filter schemas per report, not a generic client-authored SQL/group-by API. Reject duplicate/unknown malformed API inputs according to existing route patterns. Identity comes from session, not browser role/actor fields.

DTOs carry typed available/unavailable sections, `asOf`, timezone/date basis, scope description, normalized filters, rows/groupings and pagination. Keep counts and large money sums type-safe using repository conventions; avoid JavaScript floating-point totals or unsafe integer conversion.

Reuse existing scoped domain queries, extracted only where necessary. Do not copy authorization predicates into parallel report-only implementations. Not every query belongs in a universal reporting abstraction.

Initially use live PostgreSQL queries. Inspect representative `EXPLAIN (ANALYZE, BUFFERS)` plans before adding indexes. Candidate access patterns: workspace/date, stage/activity date, assignments, lifecycle events, estimate decisions/revisions and visit dates. Add only justified Knex migrations; no speculative index bundle.

## 8. Component-first delivery and review sequence

For each UI item: prototype-informed design -> canonical component -> mocked API stories -> interaction/accessibility/responsive checks -> user approval. No parallel preview-only page. Use colocated copy, Tailwind and existing shared tokens/controls.

After report components are approved, assemble pages and integrate server data. Keep assistant integration last. Test each slice while building, then run cross-report acceptance.

| Step | Deliverable | Prerequisites | Review/exit gate |
|---|---|---|---|
| 0 | Metric fixtures and gap audit: timestamps, lifecycle events, estimate family/amounts, costs, predicate/drill-through coverage | This scope review | Approve exact definitions and disclose unavailable evidence; no guessed historical backfill |
| 1 | Permission/export mapping, strict query/result contracts and performance fixture design | 0 | Review catalog/default-policy implications, mixed-scope behavior and DTOs |
| 2 | Shared report controls, metric presentation, accessible breakdown/table, date-basis/coverage/error states | 1 | Approve each component separately, not as one unreviewed bundle |
| 3 | Leads report components and stories | 2 | Approve R2 creation-cohort, current-state and attention UX |
| 4 | Jobs report components and stories | 2 | Approve R3 lifecycle/deadline definitions and unavailable on-time state |
| 5 | Team report components and stories | 2 | Approve primary/support split and assigned-only layout |
| 6 | Estimate report components and stories | 2, estimate gate in 0 | Approve decision/revision/money explanations |
| 7 | Calendar report components and stories | 2 | Approve shared-visit and schedule-attention presentation |
| 8 | Source report components and stories | 3, 6 | Approve attribution/coverage; detailed capture outcomes remain deferred |
| 9 | Activity report components and stories | 2 | Approve safe summaries and filters across all five domains |
| 10 | Financial report components and stories | 6, cost gate in 0 | Approve commitment/cost separation, missing coverage and denial states |
| 11 | Overview components, composing the approved report semantics | 3-10 | Approve period/current split and concise attention list |
| 12 | Assemble overview/detail pages from approved components | 3-11 | Mocked API page stories exercise the same canonical UI |
| 13 | Authorized data services, targeted indexes and APIs, integrated one report area at a time | 1, corresponding approved page/components | Reconciliation, scope and query-plan tests per area; start with Leads, then Jobs/Team, Estimates, Calendar, Sources, Activity, Financial, Overview |
| 14 | CSV integration and missing Jobs/activity/report-table export services | 13 for relevant area, reviewed permission mapping | Filter/column parity, streaming/error/cap/audit tests; reuse existing dialogs where appropriate |
| 15 | Route navigation/availability and permission settings, Home/deep-link wiring | Relevant 13-14 complete | Direct URLs and navigation agree; no premature enabled placeholder |
| 16 | Read-only assistant integration | Manual services/UI and relevant release checks | Same authorized queries/evidence, no new mutation or CSV execution tool |
| 17 | Cross-report QA, performance tuning and release review | 13-16 | Explicit acceptance and rollout approval; no assumed deployment |

Backend foundations can be prepared after contracts and approved designs; do not integrate a report ahead of its component approval. Independent steps need not wait for unrelated report logic, but review still proceeds one item at a time.

Suggested implementation checkpoints:

- **A:** Leads/Jobs/Team plus their approved supporting contracts and export foundations.
- **B:** Estimates/Calendar/Sources, including attribution gates.
- **C:** Activity/Financial/Overview and complete cross-report navigation.
- **D:** Read-only assistant, integrated validation and release approval.

These are review boundaries, not promises that an incomplete Reports suite is already released. Do not activate unimplemented report links.

## 9. Read-only assistant

After manual reporting works:

- Register bounded report reads in the existing assistant; no arbitrary SQL or model-authored aggregations.
- Share filter normalization, authorized services, metric definitions and results with manual pages.
- Require `assistant.use`, report grants and every relevant domain/monetary permission.
- Missing/ambiguous date basis, source attribution or selection requires clarification; no silent widening from "mine" to workspace.
- Return exact period/current context, numerator/denominator, timezone, data coverage and authorized drill-through.
- Follow existing evidence binding/revalidation for streamed results and saved private history. Record/policy changes must not expose stale unauthorized answers.
- Money, missing-cost and commitment-versus-revenue wording matches the UI.
- No report-specific mutation, automatic download, outbound email or extra inline composer. Navigation to the existing export review is allowed only after its authorization contract is reviewed.

## 10. Validation plan

### Fixtures and correctness

Use isolated synthetic workspaces, never production copies. Build explicit examples with expected IDs and exact totals:

- Empty, one-row, large counts, no denominator, invalid evidence and unavailable permission.
- Two tenants, all roles, customized/revoked grants, report-assigned plus domain-workspace grants, mixed-domain scopes, removed memberships and hidden related records.
- DST transitions, local midnight, leap day, due today/yesterday, both range endpoints, Calendar seven-day versus deadline eight-date windows.
- Archived versus current; permanent deletion and former owners.
- Reopened/recompleted Jobs, repeated stage outcomes, retries and multiple joined assignments.
- Estimate revisions/new drafts/resends, corrected/backdated decisions, expiry/void/archive and frozen pre-tax/tax-inclusive amounts.
- Shared visits, duplicated participants, overlap/adjacency, Work Order-only access.
- Linked/unattributed source values, edited labels versus immutable provenance.
- Unknown/sensitive activity shapes and safe parent authorization.
- Null costs versus true zero, fractional quantities/rounding, missing frozen subtotals and large monetary sums.

Unit tests cover pure definitions/contracts. Runtime-role database rehearsals verify real queries, authorization, reconciliation and additive migrations. Browser tests exercise authenticated pages/APIs/navigation, filter persistence, CSV and access revocation.

### UI and accessibility

Canonical stories include loading, empty, zero, denied/unavailable, partial coverage, query error/retry, overflow and real large values. Verify at 320, 768 and 1440 pixels; keyboard operation/focus, labels, accessible chart/table equivalents and no color-only meaning.

CSV tests verify full filtered scope, stable columns/order, formula-safe encoding, preview/download changes, cancellation, limits, no truncation and audit outcomes.

### Proposed measurable performance gates

These are design targets, not verified claims. Confirm fixture scale in step 1 and record actual results before release:

- Benchmark representative skewed workspaces with 50,000 leads, 10,000 Jobs, 10,000 estimates, 20,000 visits and 250,000 activity events, plus a foreign workspace and assigned-scope users.
- At five concurrent readers, target p95 <= 2 seconds for a report API response on agreed production-like infrastructure, excluding browser/network rendering.
- First report table page <= 100 rows; no unbounded client-side full-record fetch.
- A 50,000-row new CSV export should finish within the selected route budget (initial target 40 seconds) and add <= 128 MiB process RSS under the measured concurrency setting. Reduce the technical cap or tune implementation if it cannot meet the budget; do not silently truncate or relabel failure as success.
- Record database query plans, cold/warm runs, dataset cardinalities, concurrent export policy, application RSS and cancellation cleanup.
- Timeouts, lock waits and technical limits must return explicit retry/narrow-filter guidance, not success-shaped empty data.

Use existing Vitest, data rehearsals, Storybook/browser harnesses, focused ESLint and package typechecks. Run targeted selectors for each slice; run the broader regression/build checks at final integration. Restore dependencies only when validation exposes missing packages; do not install new tooling for planning.

## 11. Release, documentation and rollback

Before enabling:

1. Resolve each definition gate and approve any necessary permission/schema changes.
2. Review one component/step at a time; update this plan's execution status without claiming unrun tests.
3. Document report definitions, filters, CSV columns, permission rules, known coverage and deferred finance/capture capabilities.
4. Update existing reporting/Home/source/permission documentation only where this feature changes it.
5. Run isolated migration/replay checks and apply the established backup/restore review for actual database changes.
6. Verify all report/CSV routes with the restricted runtime role.
7. Complete reconciliation, accessibility, browser, assistant and performance acceptance.
8. Gate initial enablement through existing rollout mechanisms where suitable; no shared sensitive response caches.
9. Obtain separate staging and production approval. This plan authorizes neither.

Rollback disables new report routes/navigation/assistant tools via the existing availability mechanism, preserving business data and saved policy decisions. Revert additive schema only when explicitly safe and approved; never delete histories or reset grants as rollback.

## 12. Immediate next action

Start **step 0 only**: produce a reviewable metric-definition fixture matrix and evidence/gap assessment, especially Job completion selection, estimate revision/decision semantics, source attribution, current cost coverage and report-to-list predicate parity. Resolve these before implementing the first component or migration.

No application code, schema, policy or feature availability was changed by writing this plan.
