# Reports step 0: evidence and metric fixtures

Status: **Discovery, D1-D4 definitions and fixture expectations approved interactively.** November 5, 2026.

Parent: [Workspace Reports implementation plan](reporting-implementation-plan.md).

This is a source-backed design assessment and an exact synthetic fixture specification, not an implemented report or an executed database test suite. No application code, permissions, schema, live data or feature availability changed. Existing histories are evidence for future tests; this document does not certify deployed database contents or migration coverage.

## 1. Findings and delivery impact

| Area | Verified source evidence | Conclusion |
|---|---|---|
| Job completion/reopening | [Job mutations](../packages/data/src/jobs/store.ts#L273), [lifecycle validation](../packages/domain/src/jobs/lifecycle.ts#L15) | Completion/cancellation are `jobActivity.type = status` with `changes.from/to`; reopening is a closed-to-active status transition. Do not query a nonexistent Job `completedAt` or infer completion from current status. |
| Job deadlines | [Creation activity](../packages/data/src/jobs/store.ts#L134), [deadline mutation](../packages/data/src/jobs/store.ts#L295), [Job schema](../packages/data/src/migrations/202610190001_jobs_foundation.ts#L5) | Current deadline and change history exist; on-time analysis still needs continuity/coverage validation. No new history table is necessary for basic completion metrics. |
| Retry safety | [Operation receipt and activity](../packages/data/src/jobs/store.ts#L57), [stage event receipt](../packages/data/src/leads/stage.ts#L32) | Canonical mutations already avoid duplicate events for retries. Report queries must still deduplicate identities after joins. |
| Estimate decisions | [Decision writes](../packages/data/src/estimates/decisions.ts#L150), [decision schema](../packages/data/src/migrations/202610240006_estimate_decisions.ts#L4) | Decision date is a stored business calendar date; corrections append a new linked decision/version. Use effective decision date, not activity insertion time or first decision row. |
| Frozen money | [Snapshot amounts](../packages/contracts/src/estimate-sharing.ts#L48), [snapshot validation](../packages/domain/src/estimates/sharing.ts#L31), [hash validation](../packages/data/src/estimates/sharing-paper.ts#L59) | Snapshot stores subtotal, discount, tax and total. Approved pre-tax value is `subtotalCents - discountCents`; no new monetary backfill is needed for valid snapshots. Verify hash/content and decision-to-snapshot consistency. |
| Estimate revisions | [Revision creation](../packages/data/src/estimates/drafts.ts#L1428), [revision restrictions](../packages/data/src/estimates/drafts.ts#L1462), [sharing](../packages/data/src/estimates/sharing.ts#L273) | An unissued revision leaves the old issued quote active. Sharing the new revision atomically supersedes its source. Accepted estimates cannot be revised through this service; declined estimates can. |
| Existing estimate visibility | [Latest-revision list rule](../packages/data/src/estimates/read.ts#L41) | Existing default list excludes any older revision when a newer draft exists. It is not the correct report-family predicate for outstanding issued value. Reuse authorization, not this visibility rule unchanged. |
| Broad source | [Editable lead fields](../packages/contracts/src/lead-read.ts#L47), [creation origin](../packages/data/src/leads/origin.ts#L2) | Current source label and creation provenance differ. Broad reports can use current recorded source; do not describe it as immutable acquisition attribution. |
| Source relationships | [Job source linkage](../packages/data/src/migrations/202610190001_jobs_foundation.ts#L33), [estimate conversion](../packages/data/src/estimates/conversion.ts#L422), [capture decisions](../packages/data/src/lead-capture/intake-store.ts#L117) | Lead-parent estimates and Job-parent estimates via `jobs.sourceLeadId` have explicit paths. Several capture receipts may link the same lead; first-release broad attribution must not join them and multiply monetary value. |
| Material cost | [Material storage](../packages/data/src/migrations/202610190002_work_orders_foundation.ts#L59), [material mutations](../packages/data/src/work-orders/mutations.ts#L184) | Quantity is decimal(12,3), unit costs are nullable integer cents. Linked rows keep saved catalog snapshots unless relinked; quantity/status/rows can change. Activity records material names, not an immutable quantity/cost ledger. Only current recorded cost is supportable. |
| Existing material totals | [Material UI](../apps/web/src/features/work-orders/work-order-materials/work-order-materials.tsx#L20) | Current UI coalesces missing costs to zero and totals floating products. Do not copy that calculation into Reports. Build a coverage-aware report calculation; any change to existing UI behavior requires its own tightly scoped review. |
| Owner loss | [Job foreign keys](../packages/data/src/migrations/202610190001_jobs_foundation.ts#L35), [lead owner projection](../packages/data/src/leads/read.ts#L21) | Job membership removal clears primary owner and team relationships. Leads can retain an owner ID/name after membership loss, but user deletion can clear ID. Distinguish former owner only where evidence survives; null cannot prove "never assigned." |
| Lead historical coverage | [Lead migration/backfill](../packages/data/src/migrations/202610150001_leads_read_model.ts#L18) | Old creation events were backfilled, not historical stage changes. Current Won/Lost does not prove a dated transition. Report only recorded transitions and explain coverage; no fabricated stage-entry dates. |
| Activity reuse | [Customer history union](../packages/data/src/customers/store.ts#L404), [estimate safe projector](../packages/data/src/estimates/history.ts#L15) | Customer detail already repeats linked lead events. Unified Reports must read each native history once, not union already-composed detail feeds. Estimate projector is prior art for safe allowlists, not permission to expose every detailed payload. |
| Calendar reuse | [Canonical visibility](../packages/data/src/calendar/read.ts#L27), [week read](../packages/data/src/calendar/read.ts#L105) | Shared visits/record scope exist. Current reader normalizes to Monday-Sunday and paginates unscheduled visits; it cannot directly return arbitrary report ranges or unpaged record-type queue totals. Extract/reuse its scoped base, not concatenate returned pages. |
| CSV reuse | [CSV encoder](../packages/data/src/leads/csv.ts#L3), [estimate export](../packages/data/src/estimates/export.ts#L1), [customer export](../packages/data/src/customers/store.ts#L943), [Work Order export](../packages/data/src/work-orders/export.ts#L14) | Formula-safe encoding is reusable. Customer CSV buffers rows/output; Work Order CSV buffers paginated output and has no financial columns. Do not claim all existing exports stream or export report predicates/costs. No unrelated export rewrite in step 0. |

### Coverage states

Future DTOs must distinguish:

- **Available:** complete for the declared surviving, currently authorized evidence.
- **Empty:** a valid authorized query returns no matching records.
- **Incomplete:** some permitted records have missing/invalid evidence; expose safe coverage, not a complete-looking total.
- **Unavailable:** permissions or unsupported evidence prevent a truthful metric.

Malformed events/snapshots require explicit standard errors/diagnostics or an explicit incomplete state. They must never silently become zero, raw JSON or an apparently complete partial rate.

## 2. Approved definition choices

### D1. Completion events and trend reconciliation

For each Job, select the latest valid completion event **within the selected period**, using timestamp then event ID as deterministic tie-breaker. Current reopened status does not erase the selected historical completion.

The period's count, rows, CSV, duration and trend buckets use that same selected event set. A daily trend therefore sums to its enclosing period total. Querying one day independently can produce a different selected event for a Job completed twice on different days; unique-record metrics across separate ranges are not additive.

Elapsed duration is business-local completion date minus business-local creation date, in calendar days, not rounded milliseconds or labor hours. Display average elapsed days and sample size; no sample means unavailable, not zero. Reject a completion before creation as invalid evidence.

Reopened/canceled counts independently count distinct Jobs with qualifying period transitions. Reopening from either completed or canceled is valid. These counts overlap and must not be added as exclusive outcomes.

### D2. Estimate-family and decision semantics

- Family key: `(workspaceId, estimateNumber)`, never display number alone.
- For current outstanding value, select the latest **issued** revision, ignoring newer unissued drafts. Include only effective Sent/Published, non-archived, non-expired records; expired separate, void excluded.
- "First quoted" counts a family once, on its earliest persisted initial Send/Publish event, including surviving superseded revisions. Resends and later revised quotes do not add another family.
- Accepted/declined analysis selects the latest issued revision for each family and its latest effective decision version. A superseded declined revision is not a second decision alongside a new accepted revision.
- A new issued revision with no decision removes the superseded decision from the family's current-effective acceptance denominator. Earlier periods may restate after revision or correction; this is not an immutable "as reported then" accounting report.
- Filter effective decisions by stored `decisionDate`, not the date staff recorded/corrected them.
- An archived effective declined revision remains in historical decided outcomes; no current attention row.
- A later invalid snapshot does not cause fallback to current draft/catalog totals.
- Acceptance numerator/denominator are count metrics; invalid money may make value unavailable without erasing a valid decision count.

Label the rate "Acceptance among currently effective decided quotes." Explain restatement and show the selected period. A future issued-cohort funnel or historical-as-of report is separate scope.

### D3. Attention, missing owners and attribution

- Inactive open lead: apply the existing strict `lastActivityAt < asOf - INTERVAL '7 days'` expression under the same database timezone semantics; exactly the boundary is not stale. It is not seven business days or seven local date changes.
- Restrict attention to New/Contacted/Estimate sent and non-archived leads. Existing general `attention` also includes missing current membership, so do not equate it with inactivity alone.
- Lead age bands use business-local date difference: 0-7, 8-14, 15-30, 31+; future-created records are invalid, not bucket 0.
- Show "Former owner" only with surviving identifiable evidence. Null ownership is "No current primary owner"; never claim it was never assigned.
- Historical assignment attribution is out of scope: owner/source breakdowns use current surviving values and must say so.
- Accepted-value-by-source uses the **estimate decision period**, independently of lead creation cohort. Direct lead parent first; Job parent only through its explicit source lead. No match/ambiguous path is unattributed, not inferred from customer or capture receipts.
- Unattributed is not permission redaction: if underlying relationships are hidden, withhold that monetary breakdown instead of exposing hidden linkage through a residual bucket.
- Initially expose cross-domain rates/attribution only where the permission contract can prove complete supporting access without probing hidden rows. The conservative baseline is workspace report and relevant workspace domain reads; assigned-only users retain their own ordinary counts but no misleading conversion percentage.

### D4. Recorded-cost calculation

- First release reports current persisted material rows on non-archived Work Orders, grouped by material status, across active and closed Jobs. Default excludes Work Order Drafts/Canceled; a clearly labeled status filter can include them. No historical expenditure or actual usage claims.
- Multiply persisted decimal quantity by saved unit cost in exact decimal arithmetic. Round each known line to the nearest whole cent, half-up, then sum rounded line cents. Never aggregate using binary floating point.
- `null` is unknown, `0` is a real zero. Show known subtotal and known/missing line counts; if any selected line is missing, never label the subtotal as a complete cost total.
- Do not sum unlike physical units into one quantity.
- No profit/margin subtraction from accepted value; the commercial and materials populations are not proven equivalent.
- Saved Used status means "recorded as used," not independently verified actual consumption.

These are new report semantics. Do not silently change existing Work Order UI totals, material persistence precision or history.

## 3. Fixture conventions

Each fixture group is isolated unless explicitly linked. Short IDs below map to synthetic UUIDs in the eventual runtime-role harness; they are not executable production IDs.

- Workspace A: `America/New_York`. Workspace B: separate tenant with lookalike names/numbers.
- Default `asOf = 2026-11-05T17:00:00Z` (November 5, noon in Workspace A).
- Historical period P: October 1-31, 2026, both local dates inclusive.
- P timestamp bounds: `[2026-10-01T04:00:00Z, 2026-11-01T04:00:00Z)`.
- Unspecified fixture times are noon business-local, with explicit immutable event timestamps.
- Full authorized Owner baseline unless an access variation says otherwise. Saved grants, not role names alone, authorize tests.
- Pin the eventual test transaction's PostgreSQL session timezone to UTC for the seven-day interval fixtures. [Database creation](../packages/data/src/database.ts#L5) does not explicitly configure session timezone; production interval semantics must be checked in step 1, not assumed from the business timezone.
- All monetary expected values are integer cents; labels display USD, not floating numeric financial calculations.
- Tests must create canonical valid states through domain services where possible, then apply narrowly isolated malformed-evidence cases. A duplicate prohibited by a DB unique key is a rejection test, not a pretend valid row.

### T: time boundaries

| ID | Input | Exact expectation |
|---|---|---|
| T01 | P endpoints: one lead at start, one at end minus one microsecond, one at exclusive end | First two included; exclusive-end lead excluded. Preserve DB microseconds. |
| T02 | Local November 1, 2026 only | UTC interval `[2026-11-01T04:00Z, 2026-11-02T05:00Z)`; 25 hours. Both repeated 01:30 local instants included. |
| T03 | Local March 8, 2026 only | UTC interval `[2026-03-08T05:00Z, 2026-03-09T04:00Z)`; 23 hours. |
| T04 | Calendar next seven days at default asOf | Visit dates November 5-11 inclusive, seven dates. |
| T05 | Job due-soon at default asOf | Deadlines November 5-12 inclusive, eight dates; November 4 overdue, November 13 outside. |
| T06 | Invalid timezone, reversed range, nonexistent date | Explicit validation/configuration failure; no fallback to UTC or empty-success response. |

### L: lead cohort, attention and source

| Lead | Created | Current stage / owner | Source | Last activity | Archive/link |
|---|---|---|---|---|---|
| L0 | September 20 | New / A | Other | November 5 noon | Active, no Job |
| L1 | October 1 | Contacted / A | Website | October 29 17:00Z (13:00 local) | Active; linked Job created November 2, canceled November 3 |
| L2 | October 15 | Won / B | Referral | October 30 noon | Active, no Job |
| L3 | October 20 | Lost / B | Phone | October 31 noon (archive) | Archived October 31; linked Job created October 25 |
| L4 | October 31 | Estimate sent / null | Gmail | October 28 11:59 local | Active, no Job |

L2 has a recorded Lost transition October 18 and Won October 22. L3 has a Lost transition October 30. A separately deleted October lead and its content do not enter any surviving totals.

| ID | Metric | Exact expectation |
|---|---|---|
| L01 | P creation cohort | IDs L1,L2,L3,L4; count 4, including archived L3 |
| L02 | P cohort linked Jobs as of now | Lead IDs L1,L3; 2 / 4 = 50%. November Job and canceled Job still prove creation. Won L2 is not converted. |
| L03 | Current open pipeline | L0,L1,L4; New 1, Contacted 1, Estimate sent 1; total 3 |
| L04 | Seven-day inactivity, open only | L4 only. L1 exactly cutoff is not stale. Closed L2/L3 not attention. |
| L05 | No current owner and combined attention | L4 only; unassigned OR stale returns one distinct lead, not two |
| L06 | P recorded outcomes | Won {L2}=1; Lost {L2,L3}=2. Overlap disclosed, not exclusive pie slices. |
| L07 | P source cohort | Website 1/converted 1; Referral 1/0; Phone 1/1; Gmail 1/0; Other 0. Source totals sum to 4. |
| L08 | Archived toggle/current state | Historical P remains 4 by default; current open remains 3. Archive authorization still applies; no grant widening. |
| L09 | Missing stage history | Surviving lead currently Won with only created event: current closed count allowed, dated Won transition not invented; coverage limitation visible |
| L10 | Edited label | Change L1 current source to Referral: broad-source counts regroup, immutable creation provenance remains unchanged |
| L11 | Age boundaries | Local ages 7/8/14/15/30/31 map to 0-7/8-14/8-14/15-30/15-30/31+ respectively |

### J: completion selection

| Job | Created | Recorded transitions |
|---|---|---|
| JA | September 30 | Completed October 3; reopened October 5; completed October 10; reopened November 2 |
| JB | October 2 | Completed October 7 |
| JC | October 4 | Canceled October 9 |

| ID | Metric | Exact expectation |
|---|---|---|
| J01 | P created/completed/canceled/reopened | Created {JB,JC}=2; completed {JA,JB}=2; canceled {JC}=1; reopened {JA}=1 |
| J02 | P completion selection | JA October 10, JB October 7; October 3 contributes no row to P's selected trend |
| J03 | P elapsed calendar days | JA 10, JB 5; mean 7.5 days, sample 2 |
| J04 | P daily completion buckets | October 7=1, October 10=1, other days=0; sum 2 |
| J05 | October 1-5 queried separately | JA completion October 3=1; do not sum overlapping/reselected period results as though distinct forever |
| J06 | Retry a completion with same submission | Same receipt; no new activity or count |
| J07 | No completion events | Completion count 0; duration unavailable with sample 0, not mean 0 days |
| J08 | Completion before creation/invalid transition payload | Explicit invalid-evidence result; no negative duration or silently repaired event |

Deadline fixture, separate from JA-JC: D0 active/deadline November 4, D1 active/November 5, D2 Waiting/November 12, D3 active/no deadline, D4 Completed/November 4, D5 active/November 13.

Expected: active=5; overdue={D0}=1; due-soon={D1,D2}=2; active without deadline={D3}=1. D4 is never overdue. An active past scheduled date with future deadline is scheduling attention, not another overdue Job.

### W: team workload and former owners

| ID | Setup | Exact expectation |
|---|---|---|
| W01 | Active Job has primary A, team B and C | Primary A=1; support B=1/C=1; distinct workspace Jobs=1, not 3 |
| W02 | Attempt duplicate job-team row | DB/contract rejects duplicate; query dedup also protects joins against other one-to-many tables |
| W03 | Remove A's current membership | Job primary FK becomes null; show no current primary owner, not identifiable former A without separately authorized reliable evidence |
| W04 | Lead retains owner A ID/name but A is no longer member | Former-owner/reassignment row, not a currently assigned A workload row |
| W05 | Assigned-only B | Own participation/count only; no A/C workload totals or hidden roster options |

### E: estimate revision and money

Each family has explicit valid frozen snapshots:

| Family | Issuance/decision state |
|---|---|
| E1 | Revision 1 sent September 25 and still awaiting; revision 2 is an unissued October Draft; resend of revision 1 October 5 |
| E2 | Revision 1 declined October 10; revision 2 shared October 20, supersedes revision 1, accepted decision October 25 |
| E3 | Revision 1 accepted October 12; corrected to Declined with decision date October 13; effective revision archived October 30 |
| E4 | Revision 1 first published October 3, still awaiting as of now |
| E5 | Revision 1 first sent October 4, subsequently voided |

For E2 revision 2: one included taxable line, subtotal 10,000 cents, discount 1,000 cents, tax 900 cents, customer total 9,900 cents. Deposit does not reduce accepted value. E1 issued pre-tax value 5,000 cents; E4 value 20,000 cents. Set validUntil after asOf for E1/E4.

| ID | Metric | Exact expectation |
|---|---|---|
| E01 | Current awaiting | E1 revision 1 and E4; count 2; pre-tax value 25,000. Newer E1 Draft does not erase quote. |
| E02 | Effective P decisions | Accepted E2 revision 2=1; Declined E3=1; acceptance 1/2=50%. Superseded E2 revision 1 excluded. |
| E03 | Accepted money | Pre-tax 9,000; customer total 9,900. Not 10,000, not 9,900 pre-tax, not current catalog amount. |
| E04 | Family first quote | E1 excluded from P despite resend/revision Draft. E2/E3 fixture first issues must be before their decisions; when set in P, E2/E3/E4/E5 count 4, once per family. Voiding does not erase first issuance. |
| E05 | Backdated correction | E3 correction recorded November 2 with effective October 13 still contributes one declined P decision, not a November business decision |
| E06 | New issued E3 revision, no decision | Separate variant with E3 restored then revised/shared: superseded E3 decision excluded; P decided set only E2 => 1/1=100%, restatement disclosed |
| E07 | Expiry at business-local boundary | validUntil today remains awaiting; yesterday moves to separate expired set; no fabricated expired activity required for effective status |
| E08 | Invalid hash/mismatched total | Monetary result unavailable/incomplete explicitly; never recompute from today's draft/catalog |
| E09 | Decision corrects Accepted to Declined after Job creation | Existing Job still proves lead conversion; effective acceptance/value changes. No fabricated Job deletion/reversal. |
| E10 | Converted acceptance handoff | Separate accepted lead-parent fixture with authorized `acceptedEstimateId` Job: converted, not awaiting handoff. No linked Job visible under inadequate grants must not imply "not converted." |

E04's first-issuance timestamps must be explicit in executable fixtures (proposed E2 October 2, E3 October 5). A test must not leave the date prerequisite implicit.

### S: monetary source attribution

| ID | Setup | Exact expectation |
|---|---|---|
| S01 | E2 effective decision in P; lead created before P, source Website | 9,000 pre-tax accepted value assigned to Website despite lead outside P cohort; clearly different date basis from L07 |
| S02 | Job-parent estimate, Job points to one surviving source lead | Attribute once through explicit Job -> lead path; two capture receipts for that lead do not double value |
| S03 | No source lead or deleted source lead | Value in Unattributed, no name/customer/date heuristic |
| S04 | Relevant lead/Job relationship unreadable | Attribution metric unavailable under conservative access contract, not a numerical "Unattributed" disclosure of hidden relationships |
| S05 | Foreign workspace has same estimate number | Never joins family/source/value across workspace boundary |

### C: Calendar and unscheduled queues

All scheduled visits are on November 5, active, in the default report range:

| Visit | Authorized active records / people | Window |
|---|---|---|
| V1 | Job + two Work Orders explicitly shared; union of people A,B | 08:00-10:00 |
| V2 | Separate Job; A | 09:00-11:00 |
| V3 | Separate Work Order; A | 11:00-13:00 |
| V4 | Separate Job; A | No arrival window |

| ID | Metric | Exact expectation |
|---|---|---|
| C01 | Visits/person-days | Distinct visits=4; A visits=4, B visits=1; one busy person-day (A) |
| C02 | Overlap | One overlapping visit pair for A: V1/V2. V2/V3 are adjacent, not overlapping. Unknown V4 window is not a proven conflict or proven free time. |
| C03 | Explicit vs inferred sharing | Separate visit with same date/customer remains separate; no inferred merge |
| C04 | Unscheduled shared Job + two Work Orders | Unscheduled visits=1; unscheduled Job records=1; Work Order records=2. Label units; record queue counts do not equal visit count. |
| C05 | Work Order-only permission | Only authorized Work Order content and own projection; no parent-Job deadline/title or unrelated crew totals |
| C06 | Range across two Calendar weeks | November 5-11 includes both partial weeks, not just normalized week of November 2. Drill-through may open two week views; report table stays exact range. |

### F: current recorded costs

On selected issued non-archived Work Orders, independent material lines:

| Line | Quantity | Saved unit cost cents | Status |
|---|---|---|---|
| M1 | 1.250 | 101 | Used |
| M2 | 2.000 | null | Ordered |
| M3 | 3.000 | 0 | On hand |
| M4 | 0.500 | 101 | Needed |

| ID | Metric | Exact expectation |
|---|---|---|
| F01 | Rounded known amounts | M1=126, M3=0, M4=51; known subtotal 177 cents; known lines 3/4, missing 1. Complete total unavailable. |
| F02 | Status breakdown | Recorded Used=126, Needed=51, On hand=0 with known cost, Ordered unknown; not actual spending or actual profit |
| F03 | Catalog cost later changes | Saved linked row value unchanged until explicit relink; no report query joins current catalog cost as fallback |
| F04 | Edit/remove row after issue | Current recorded-cost snapshot changes; no historical October cost claim from today's rows |
| F05 | Cost read revoked/Office/Field | No R9 cost amount, cost-derived margin, coverage leakage from protected rows or CSV |
| F06 | Two 0.500 lines at 101 cents/unit | Rounded lines 51+51=102 cents; not aggregate-then-round 101. Exact rounding policy must match UI/report CSV. |

### A: activity and authorization

| ID | Setup | Exact expectation |
|---|---|---|
| A01 | One native event per five domains; customer detail also displays linked lead event | Unified report has five native events, not six; key `(domain,eventId)` |
| A02 | Two domains intentionally use same synthetic event UUID/timestamp | Both retained; stable `(timestamp,domain,eventId)` ordering, no pagination omission/duplication |
| A03 | Notes, material changes, decision event include private bodies/amounts | Summary only, no raw changes/note content/money/secret values in UI or CSV |
| A04 | One operation changes several records | Multiple domain events allowed; not advertised as unique business actions |
| A05 | Parent record deleted | No retained content returned; historical event totals may decrease |
| A06 | Unsupported event/source shape | Explicit error/incomplete state with safe diagnostic; never serialize raw payload |
| P01 | Workspace B lookalikes | Zero B rows, facets, counts or monetary influence |
| P02 | `reports.read=assigned`, domain read=workspace | Narrow to actor's actual assignment; report grant cannot widen data |
| P03 | Field/assigned user with no complete cross-domain visibility | Own lead/Job counts available; cohort conversion percentage unavailable, not understated 0% |
| P04 | Revoked report/domain/export/price/cost permission | Next page/API/preview/download/assistant read denies or withholds relevant section; no zero-success substitution |
| P05 | Owner role but revoked ordinary grant | No role-name bypass |
| P06 | Empty authorized scope | Real zero counts/empty table, no false permission-denied state; rates without denominator unavailable |
| P07 | Actor filter | Only actors from currently authorized native events, not a hidden workspace audit roster |

## 4. Drill-through and export parity assessment

| Report predicate | Existing destination capability | Required approach |
|---|---|---|
| Lead created range/stage/source/owner | [Lead filter](../packages/data/src/leads/query.ts#L18) supports these | Reuse exact supported filters. Historical archived visibility cannot bypass archive authority. |
| Lead stale-only/age/dated Won-Lost/converted cohort | General attention combines unassigned OR stale; no event/conversion/age filter | Own report supporting table and matching CSV projection, not an approximate Leads URL |
| Job created range | [Job contract](../packages/contracts/src/job.ts#L61) has createdAfter only, no end date | Own table for bounded period; optional future general list filter review |
| Job completed/reopened period | List filters current status, not status-event dates | Own event-selected table, then record detail links |
| Job due-soon/overdue/primary owner | [Job queries](../packages/data/src/jobs/store.ts#L228) support corresponding current filters | Reuse when exact; report-assigned scope still intersected |
| Supporting Job participation | List `mine` supports self; arbitrary owner filter is primary-only | Own participant table for team breakdown; never substitute primary-owner filter |
| Estimate family/decision period | [Estimate filters](../packages/contracts/src/estimate.ts#L31) have no decision-date range; default list hides older issued quote behind newer Draft | Own family-selected table/CSV; extract scoped read base separately from default visibility |
| Calendar rolling range | Monday-Sunday reader, ten-row unscheduled visit queue | Reusable range/scoped query extraction; report record totals before queue pagination |
| Activity | Native histories are record-specific; customer detail composes lead history | New unified authorized projection and export |
| Recorded material costs | Existing Work Order CSV excludes prices/costs/material line quantities | New approved financial report projection/CSV, not existing Work Order export pretending parity |

No generic full-account export or admin archive reuse. New report-table CSV and missing Jobs/activity backend still need the step 1 permission design. Existing customer/Work Order buffering is evidence to measure, not a reason to rewrite unrelated exports here.

## 5. Gaps and prerequisites

### Ready with scoped-query work, not new business data

- Recorded lead intake/stage transitions and current workload.
- Job event-derived completion/cancellation/reopening and current deadlines.
- Valid frozen estimate pre-tax/tax-inclusive money.
- Explicit lead/Job source attribution and canonical shared visits.
- Current saved material values with incomplete-coverage semantics.
- Safe native CRM activity projection.

### Must resolve during step 1 design

1. Encode the approved D1-D4 and fixture outputs in the proposed contracts; preserve restating estimate-family acceptance and per-line cost rounding.
2. Report-assigned intersection helper and conservative cross-domain availability; no cloning context/policy to fake broader grants.
3. Historical archive visibility versus existing action-based archive gate. Reports must either reuse authorized record access or explicitly review a new scoped historical-read contract; CSV cannot expose records hidden from its source authority.
4. Permission IDs/default migration policy for report-table CSV, financial access and reviewed activity export.
5. Query extraction for Jobs/Calendar/estimate scoped bases without duplicating domain authorization.
6. Explicit incomplete-history/snapshot DTOs and diagnostics; current lead helper silently falls back to UTC, which is not the approved report behavior. Do not broaden this task into unrelated timezone cleanup.
7. Jobs source/owner FKs can lose identity; use safe current-state labels. Do not add a past-ownership inference subsystem.
8. Timestamp/DB precision, one asOf, DB session timezone and exact numeric rounding implementation.

### Deliberately unavailable in first release

- Past assignment/source values where not durably captured.
- Unrecorded historical lead-stage movements.
- Proven actual material consumption/cost, customer receipts, labor cost and true profit.
- Historical schedule snapshots/reschedule rates and on-time completion percentage.
- Source/capture attribution guessed from mutable names, matching customers or duplicate receipts.

## 6. Verification and next checkpoint

Performed for this step: source inspection, documentation reference/whitespace checks, and independent fixture arithmetic/DST boundary checks using built-in runtime utilities. These checks are not evidence that report queries pass.

Not performed: application tests, database connection, data migration, performance benchmark, Storybook/browser tests or report implementation. There is no report implementation yet to validate with those suites.

User approved D1-D4 and the fixture expectations after discovery review. This settles report semantics, not implementation, permission/default-policy changes or deployment.

Next action: **step 1 only** -- strict contracts, permission/export mapping and query design/performance fixture design. Review those before beginning the first component or changing stored policies.
