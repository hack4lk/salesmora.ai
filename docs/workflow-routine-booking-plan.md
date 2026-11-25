# Routine booking workflow

Connected locally on November 21, 2026: the Workflows assistant can prepare, review/publish and edit routine booking. New matching unscheduled Jobs are admitted through source events and booked for their existing assigned people. History below records the staged UI and foundation checkpoints; their former “not live” notes describe those checkpoints, not current availability.

## What the application supports today

| Area | Current support | Limits |
| --- | --- | --- |
| Calendar | Canonical shared visits, planned start/duration, saved UTC occupancy and booking gaps | Arrival windows stay separate from work duration |
| Scheduling | Common-slot selection and versioned, atomic canonical writes | Assigned people only; no crew/skill selection or moving existing visits |
| Jobs | Exact service matching, source-event admission and completion deadlines | Future new unscheduled Jobs only; no Run now or bulk enrollment |
| Availability | Saved per-person working hours and full-day unavailable dates | Unknown hours/durations fail closed; no external calendar or inventory inference |
| Execution | Durable outbox/BullMQ, anchored cutoff, targeted saved-fact wakeups and bounded next-day rechecks | No model calls or per-workflow polling; starts the day after Job creation |
| Delivery | One no-slot notice and later success; in-app/email default on | Current recipient permissions, verified email and personal job email preference apply |

Evidence: `packages/domain/src/calendar/availability.ts`, `packages/data/src/calendar/chat.ts`, `packages/data/src/calendar/commands.ts`, `packages/contracts/src/calendar.ts`, `packages/contracts/src/job.ts`, and the approved advice boundaries in `docs/calendar-page-plan.md`. Existing arrival windows describe when staff may arrive; their end is not a recorded work finish. The existing count-based suggestions must retain their advisory meaning.

## First product decision

Approved scope: “Book for the job’s assigned people.” Retain current assignments and find a common slot for every required person. The workflow will not select or replace a crew. Crew selection, skills and capacity modeling remain separate future work.

The remainder of this design uses that approved assigned-people scope.

## User flow

Example request: “Automatically book new maintenance jobs for the assigned team, for one hour on weekday mornings.” The service and duration in the example are illustrative choices, not saved defaults. Resolve the actual workspace service; ask only for missing scheduling choices. Do not ask the user for record IDs, queue settings or database concepts.

1. The assistant identifies the service, duration and allowable work days/hours. If working hours are not configured, explain that once and open the shared scheduling-rules controls. Ask for a gap between appointments, the booking horizon and who should receive a no-slot notice when absent. Display any proposed defaults in the review; do not silently save them as business facts.
2. Show one compact canonical workflow review, with local edits and an expandable scheduling-rules editor only where needed. Keep the established Describe → Review → Publish flow, without a Test step or a Details accordion.

   ```text
   Book routine maintenance

   Book new unscheduled Maintenance jobs for their assigned people.
   Allow 1 hour, Monday–Friday, between 8 AM and noon.

   Duration       [1 hour]
   Work days      [Mon Tue Wed Thu Fri]
   Work hours     [8:00 AM] to [12:00 PM]
   Gap            [30 minutes]
   Book within    [14 days, starting next workday]

   Notify         [Selected scheduling contact]
   [✓] In-app     [✓] Email

   Keeps existing assignments and booked visits.
   If no slot fits, leave the job unscheduled and notify the contact.

   [Publish workflow]   [Cancel]
   ```

   Values shown above illustrate the review. The scheduling contact must be selected from current eligible workspace members. The rule applies to every required assigned person, using the intersection of their schedules. There is no daily reminder Send at: this action responds to matching Job events.
3. Publish confirms the future automatic action and its displayed rules. It does not book existing unscheduled Jobs as a side effect. Existing Jobs require a separate, bounded, explicitly reviewed batch action if that is added later.
4. Successful booking appears in the canonical Calendar and Job details with its planned work time. The notification links to that visit. One concise notice identifies the Job, absolute booked date/time, assigned people and the workflow; do not show company branding or technical execution details.
5. A no-slot result leaves the Job unchanged and sends one actionable notice: “Couldn't find a booking for J-0012 within the next 14 days.” Open job leads to the current protected Job page. Show the specific constraint when authorized, such as no assigned people, unavailable team member or an existing visit with unknown work duration. Do not repeatedly notify on every worker wakeup.

In-app and email default on for the scheduling contact. Reuse current preference/verified-address checks. Coalesce workflow outcome notices with ordinary visit-change delivery when they would otherwise tell the same person the same thing twice. Do not contact the customer or claim the customer agreed to an appointment. Customer communication/consent would need its own reviewed capability.

## Eligibility and limits

- Initially target future newly created Jobs in Needs scheduling for one selected service, with no scheduled canonical visit. Preserve the Job's current owner/team; do not create Jobs from estimates, change owners, infer skills or schedule an unreviewed lead/intake item.
- Resolve service matching from actual workspace choices and the saved Job service value. Do not use runtime AI to decide whether a free-text service is “similar enough.” Define rename behavior before implementing matching.
- Every required assigned person must be active and available for the full work interval plus the selected gap. Assignment to the shared visit is the deduplicated union of active Job/Work Order people. Shared records count once, and the whole linked set requires current scheduling authority.
- Skip completed, canceled, waiting or already scheduled Jobs and any shared visit containing an ineligible or unauthorized record. Never move a booked visit to make room. Respect the earliest applicable linked completion deadline; do not silently book past it or shorten duration to fit.
- Working hours and recorded unavailable dates are explicit scheduling facts. Do not infer time off, holidays, travel duration or availability on external calendars. A configured fixed gap is not a calculated travel-time guarantee.
- Existing visits without a recorded work duration cannot be treated as free after their arrival window. Until their occupied period is explicitly recorded, conservatively exclude that person's affected day from automatic booking and show why. Never fabricate durations in a migration.
- Use workspace-local calendar dates and the saved IANA timezone. Skip invalid/nonexistent local times and resolve repeated DST times deterministically. Persist the chosen actual interval alongside its timezone; later timezone changes must not reinterpret an existing booking.
- Treat all required people as necessary for the whole interval in the first slice. Split shifts, interchangeable crew members, round robin, skill inference and multi-day work remain outside this workflow.

## Calendar foundation before enabling the recipe

Extend the existing Calendar scheduling components and commands, rather than adding a competing booking calendar. Review the minimum shared controls for planned start and duration, person working hours and unavailable dates. Keep arrival windows distinct from occupied work time in the visit drawer, schedule dialog and assistant card. Existing date/window-only visits remain valid and explicitly lack complete occupancy information.

The booking service must load complete authorized busy periods for all required people across Jobs and Work Orders. Customer filters, week-page limits, hidden rows and a count of three visible suggestions cannot limit conflict checks. Derive occupied intervals from canonical shared visits and deduplicate before checking them. Use indexed workspace/person/date ranges; return a bounded display projection separately.

Select and commit a slot under the existing workspace mutation lock, rechecking the workflow version/status, current Job/visit versions, participants, working hours, deadlines and all affected records in the same transaction. Write the canonical schedule, booking receipt, history and notification intent atomically. Queue receipt identity prevents a retry from choosing another slot or booking twice. Do not hold a long database transaction while AI or a provider is running.

All scheduling paths, including direct Job creation/schedule, Work Order scheduling, Calendar changes, shared-visit membership and assignment changes, must maintain occupancy consistently. Existing manual scheduling has nonblocking advisory warnings. Before implementation, specify how an explicit manual overlap or assignment change affects an automatic booking; do not claim a permanent exclusive reservation while another write path can bypass it. Automatic booking itself must never commit an overlap against the current saved schedule.

## Workflow lifecycle and no-slot rechecks

Edit uses the existing versioned Save changes flow; it changes future booking choices without moving completed bookings. Pause/Delete stop future attempts and pending notifications governed by that workflow; they do not undo existing schedules. Resume does not replay all historical Jobs. An approved policy is needed for retained not-yet-booked occurrences, with an explicit enrollment cutoff and no repeated no-slot mail.

Run now is not a one-click bulk scheduling action. If added, it needs an exact bounded review of affected Jobs and proposed bookings, plus a recheck on confirmation. Exclude it from the initial recipe menu instead of reusing notification-only manual runs.

If no slot exists, persist one outcome and a reason. Reevaluate only when relevant saved facts change: affected crew bookings/availability, Job assignment, deadline or workflow rules. A bounded horizon/next-working-day ticket may be needed when only the passage of time changes the search. Coalesce duplicate events and do not repeatedly scan every workflow or Job. Do not create an unbounded daily retry or per-workflow timer.

## Database, authentication and token budget

- Keep authoring on the Workflows assistant surface. Supply a compact server-derived capability description only after the scheduling foundation and recipe are connected. Until then, explain the prerequisite rather than offering a bookable draft.
- Reuse scoped React Query reads for choices and current scheduling rules, and the already-loaded authority snapshot. Form changes, duration calculations and review wording remain local. Publish/Save uses one version-bound mutation and a receipt to update the workflow cache.
- Source events identify affected Jobs/visits/people. Indexed rule matching and durable outbox/BullMQ tickets replace per-workflow polling. Batch candidate/occupancy reads for the selected bounded horizon rather than querying each person/date/slot individually.
- Execution, retry, no-slot decisions and notifications are deterministic and use no model calls. Perform current authority checks once per transaction against the complete affected set; never authenticate for each slot or linked record.
- Measure cold/nonmatching admissions, a busy matching workspace and a many-workspace fixture. Record statement counts, rows read, lock duration and retry behavior. Do not promise 1,000-client throughput based only on SQL statement counts.

## Implementation order and verification

1. Assigned-people scope is approved. Review the minimum Calendar scheduling controls before connecting persistence and execution.
2. Add explicit scheduling/occupancy contracts and canonical component stories for start/duration, working hours, unavailable dates and unknown existing occupancy. Preserve the current advisory-only availability card semantics.
3. Connect the shared Calendar model, indexed busy-period reads and atomic schedule checks across mutation paths. Verify this foundation independently before enabling unattended booking.
4. Add the typed routine-booking recipe, event enrollment, exact occurrence receipts, outcome notifications and lifecycle through the existing workflow architecture.
5. Connect the workflow review/edit card, table and guide, then the assistant's narrow capabilities. Test ordinary phrasing, missing setup, unsupported crew selection and old unsupported-capability messages.
6. Verify same-person/multiple-workflow concurrency, duplicate tickets and lost responses; complete team intersections; all linked records/permissions; manual schedule/assignment changes; unknown duration, time off, buffers, deadlines, weekends and DST; no-slot suppression/rechecks; Pause/Resume/Delete/Edit; default/both channel delivery and current recipient preferences. Exercise actual Calendar/workflow UI with keyboard, mobile, accessibility and bounded query measurements.

The planned-work foundation below is now connected locally. The automatic-booking recipe remains unavailable; existing appointments are not backfilled with inferred durations.

## First canonical UI checkpoint — planned work time

The existing CalendarScheduleDialog composes CalendarWorkTimeFields and the live Calendar route now enables these controls. The canonical UI is shared with its stories; there is no separate preview-only scheduling dialog. Typing and finish calculations are local. Valid, debounced advisories reuse scoped React Query and the existing schedule confirmation request saves the work time.

The optional control starts as Not recorded. Add planned work time reveals Planned start and Time needed (minutes); enabling it does not infer a start from the customer arrival window. The illustrated default duration is 60 minutes and remains editable before review. The local summary shows planned finish and a readable duration. The current/proposed schedule review shows the original and proposed work times, preserves the existing affected-record list and requires the existing explicit confirmation. Cancel saves nothing; Clear removes date, arrival window and work time together in the preview command. Stale advisories are hidden when work-time intent differs.

The shared work-time intent contract accepts minute-precision local starts and whole durations of 15–480 minutes that finish before midnight on the same day. Overnight/multi-day work is outside the first slice. The local summary is not a guarantee of availability. The connected server resolves the reviewed date/timezone into a durable UTC interval and rejects nonexistent/repeated times or periods crossing a daylight-saving transition. Schedule commands accept optional work-time intent; omitted legacy intent preserves recorded work, while an explicit null removes it.

Review the canonical stories Calendar/CalendarWorkTimeFields and Calendar/CalendarScheduleDialog PlannedWork/PlannedWorkMobile. They cover unknown/entered/removed/invalid/disabled work time, current/proposed review, Cancel/Clear and desktop/mobile accessibility, alongside existing scheduling regressions. Persistence and advisory overlap checks are connected as described below. The next shared controls are working hours/unavailable dates, followed by automatic slot selection and atomic booking checks. Automatic booking remains unavailable in the live assistant until that foundation and its recipe are connected.

## Connected planned-work foundation — November 20

Migration `202611200005_calendar-work-time.ts` adds optional work intent, saved timezone and resolved UTC start/end to canonical visits and immutable schedule snapshots. Existing rows remain Not recorded. A database trigger derives the interval on date/work changes, clears all work fields on a cleared date, protects interval derivation against forged UTC values, and advances visit revisions for meaningful direct work/date changes. It preserves a saved timezone rather than reinterpreting an existing interval when business settings change.

The live Calendar schedule dialog sends the reviewed work intent with its existing versioned mutation. Reopening the visit/drawer shows the saved range and duration. The shared command updates all linked record versions/history together; legacy one-record date changes retain and recalculate work time, shared joins inherit the target visit, and separation creates independent occupancy. Snapshots and the existing actor-bound operation receipt retain history/retry behavior. Clear removes date, arrival window and work time together. No real appointments were edited during implementation.

Advisories retain the existing nonblocking manual scheduling policy. They add known full-work-interval overlap warnings even when arrival windows do not intersect, allow adjacent work intervals and explicitly flag missing work times. They use the complete currently authorized Calendar projection rather than customer filters or card limits. This is not unattended booking authority or a guarantee of full team availability. Working hours, unavailable dates and the automatic conflict-checked reservation service remain pending.

Assistant date proposals preserve recorded work intent in their command and compact review; clear proposals explicitly remove it. Pending reviews bind the complete affected versions. Existing visit-change notices/email include previous/proposed work ranges, with saved timezone metadata distinct from client scheduling intent. The Calendar, Job and Work Order HTTP boundaries return a plain validation message for recognized work-time constraint failures.

Verification includes six runtime-role database groups (save/read/retry, snapshots, full overlap/adjacency/unknown work, date changes/DST, invalid clocks/derived-field protection, shared join/separation/current authority and assistant preservation/clear), the twenty existing Calendar command groups and six proposal-storage groups. The isolated live browser test covers Save → reload → reopen → Clear and actual overlap warnings. Canonical scheduling/field/drawer/assistant stories cover desktop/mobile interactions and accessibility; contract, formatter, notification/email and error-boundary unit tests, type checks and lint also run. These checks do not assert working-hours availability or enable automatic booking.


## Second canonical UI checkpoint — person availability

The canonical CalendarAvailabilityDialog is available in Storybook for review. It uses the shared JobDialog, field styles and seafoam Save action, with a compact seven-day weekly-hours editor and full-day unavailable date ranges for one named person. Its host supplies that person, current revision, saved workspace timezone and edit permission. This checkpoint does not add a live Calendar entry point, persistence, new permissions or unattended booking.

Unknown weekly hours remain null. Setting a week starts with no working days and clearly says that the person cannot be booked automatically until working days are selected. Selecting a day reveals blank start/finish fields; no business hours are invented. Explicitly nonworking days remain distinct from unknown hours. Reopening after Cancel restores the supplied saved values. The first slice permits one same-day interval per working day and full-day date ranges, inclusive of both dates; partial-day exceptions, split shifts and external calendars remain outside this editor.

The strict availability contract requires all seven days when configured, validates same-day start/finish and real calendar dates, rejects reversed/overlapping unavailable ranges and bounds the payload at 100 ranges. The local editor sends only a valid reviewed form on explicit Save, bound to person, revision and timezone. Read-only, pending, stale-conflict/reload and failed-save states use the canonical dialog behavior. Field edits, validation and range changes require no database/authentication/model calls. Existing scheduled visits remain as scheduled.

Verification: 16 contract tests and 14 canonical Storybook interaction/accessibility scenarios (unknown, recorded, setting hours, adding/removing dates, invalid hours, overlapping dates, all days off, Cancel/reopen, read-only, pending, conflict/reload, save failure and mobile), plus web type checking and focused lint. The next step after layout review is a scoped/versioned availability read/write boundary and saved rules, followed by warnings and automatic-booking checks against the complete required team. Unknown hours must prevent automatic booking; recorded hours must never be inferred from an empty calendar.

## Connected person availability — November 20

The approved editor is now connected from Availability in each current person's Calendar Team workload row (My workload for a field-scoped viewer). Reads use the same current member visibility constraint as Calendar, including own-scope and limited resource projections; departed, deleting and suspended people are unavailable. Edits additionally require the existing `settings.business.update` permission, whose default grants are Owner/Admin. The server checks current visibility and permission again on every save and receipt replay. A per-person read does not expose another person's rules to an own-scoped viewer.

Migration `202611200006_calendar-availability.ts` stores one versioned JSON rule set and saved IANA timezone per workspace/person. Rows are created only on explicit Save; existing staff have unknown hours. Each successful operation atomically writes the rule version and an actor-bound receipt containing before/result snapshots. Exact retries return that receipt without another version/history write; altered payloads, stale revisions and changed timezone context require reloading. An unavailable or unauthorized current person cannot replay a receipt. Concurrent writes use the existing workspace mutation lock. Existing appointments and work intervals remain unchanged. A workspace timezone change invalidates pending edits and does not reinterpret already saved availability.

The connected editor uses viewer/workspace-scoped React Query, the existing mutation adapter and returned-data cache updates. Opening the same person within the normal cache window reuses the saved projection. Form edits and calculations make no requests; saves invalidate scheduling-advisory caches without polling or model calls. A failed save retains the draft and submission identity for explicit retry; conflicts require reload; an access denial removes the editable content.

Manual scheduling advisories reuse one transaction authority and batch-read all of the target visit's currently visible assigned people's availability once. Warnings identify unknown weekly hours, recorded days off, full-day exceptions and work outside the recorded interval. Actual planned UTC instants are checked in each person's saved timezone; without planned work, the system does not invent an occupied duration or guess dates across different zones. The workload grid remains a visit-count view rather than a promise of free hours. Availability is advisory for manual scheduling and does not enable automatic booking.

Validation: seven isolated runtime-role database groups cover scope, unknown rules, save/reopen/replay, stale/invalid edits, races, atomic history failure, team warnings, unchanged visits, timezone changes and removed people. In the fixture, Save used 10 SQL statements including transaction control, and an advisory read used 16 with one authority load and one team-availability batch. Increasing the assigned team from one to three people did not add statements. These are bounded fixture measurements, not throughput benchmarks. Connected stories cover cache reuse/local-only edits, save/reopen, same-submission retry, conflict/reload and revoked access; workload stories cover workspace/own launchers. Browser checks exercise persistence/reload, warning results and HTTP origin/current-access/version protection. Contract/domain tests, type checking and focused lint also cover the integration.

The next foundation is deterministic common-slot selection and an atomic reservation/recheck, including buffers, deadlines, unknown occupancy and event-driven rechecks after availability changes. Only after that is connected may the assistant offer the automatic routine-booking recipe.

## Connected common-slot and atomic-booking foundation — November 20

`findCalendarBookingSlot` and `bookCalendarJob` now provide the internal deterministic foundation. There is no live booking button, assistant operation, recipe, enrollment or worker consumer yet. The routines require current workspace-wide Calendar/Job/Work Order visibility and scheduling authority: an assigned-only projection cannot establish complete team occupancy. The source must be a current Job in Needs scheduling with an unscheduled canonical visit. Every active linked record must be readable/schedulable and eligible; linked Work Orders must be issued. Assigned people are the deduplicated union of Job owners/teams and Work Order assignees/crews. No crew is selected or replaced.

Rules explicitly provide duration, weekdays, a same-day local time window, a gap and a 1–31 calendar-day horizon. Each search starts on the workspace-local day after execution and respects the earliest linked completion deadline. The future workflow admission layer must additionally bind the selected service, workflow version/status, source-event enrollment and its absolute cutoff under the same workspace lock; it must not reset an occurrence's lifetime by issuing unbounded new attempts. The executor's bounded per-attempt horizon is not enrollment policy.

The adapter loads all required people's active membership and recorded availability in one batch. Null hours, inactive/missing people, empty assignments and an incomplete/unauthorized linked set fail closed. Local date exceptions and each person's saved timezone constrain their working periods. A complete indexed date range across Jobs and Work Orders supplies busy periods, independent of Calendar filters, visible cards and pagination. Shared visits count once. Unknown work duration blocks the affected whole workspace-local day rather than assuming the arrival-window end is free. Unknown dates are deduplicated before time resolution. Current reads are bounded at 100 required people, 100 linked records and 10,000 occupied source rows; exceeding a bound produces a conservative no-slot result rather than truncating and booking.

All local window endpoints are resolved through the existing strict PostgreSQL clock function in a single batch. The first slice conservatively omits a working/rule window whose endpoints are nonexistent/repeated or whose elapsed time crosses a clock transition. It can therefore miss otherwise valid subperiods inside a DST-crossing window; it never guesses an ambiguous endpoint. Adjacent normal windows remain bookable. The pure selector intersects all required people's intervals, subtracts the union of their occupied periods and chooses the earliest complete minute that fits the unchanged duration. There is no per-person/date/slot query or model call.

Gap policy: leave at least the larger of the requested gap and an existing visit's saved booking gap between work intervals. Work plus its trailing gap must fit the recipe window and every person's working period. A fixed gap is not calculated travel time. Migration `202611200007_calendar-booking.ts` stores the saved gap on visits/snapshots and adds actor-bound booking-operation receipts. Legacy gaps remain null (no stored buffer). Shared separation inherits the gap; joining retains the larger gap; clearing the date clears it. Manual date/assignment edits remain permitted under existing nonblocking policies and may introduce an overlap; the system does not claim a permanent exclusive reservation. Subsequent automatic attempts recheck the actual current records and intervals.

Booking selects and writes under the existing exclusive workspace mutation lock. Its current-mutation admission ignores page/read authority snapshots, and reuses a context only when it belongs to a proven current mutation scope; otherwise it reloads authority under the lock. The canonical Calendar transaction helper rechecks all affected versions/authority and commits Job/Work Order dates, work intent/UTC occupancy, status, history, ordinary visit notifications, gap and booking receipt atomically. A failed receipt rolls the whole operation back. Exact retries return the original booked/no-slot receipt; altered payloads, different actors and revoked current authority cannot reuse it. An existing no-slot receipt does not silently become a new booking when facts change: a future bounded source-event recheck needs a new attempt identity. Searches do not hold a transaction while awaiting user input or a provider.

Ordinary visit delivery now loads each recipient's current authority in a separate nested scope under the already-held workspace lock. This avoids accidentally reusing an actor's context when the booking service is composed inside a worker transaction. It retains recipient resource checks, actor suppression and existing delivery preferences; actor authority is not reloaded for each slot. Recipient checks are necessary distinct user authorizations. Workflow-specific success/no-slot notices and deduplication against ordinary visit changes remain part of recipe integration.

Verification: 26 contract/selector unit cases and 16 isolated runtime-role groups cover full-team intersection, no-write search, unknown/inactive/unassigned people, limited authority, per-person timezones, full-day exceptions/deadlines, full busy periods and saved gaps, unknown duration, shared visits, simultaneous bookings/exact retries, stale searches/manual scheduling and assignment changes, already-scheduled/ineligible shared records, stale page-authority snapshots, transactional rollback, no-slot receipts/current authority, nested recipient authorization, gap join/separate/clear/history and batched DST resolutions. The fixture search used 14 SQL statements including transaction control, one actor-authority load, one availability batch and one clock batch. These statement counts do not establish 1,000-client throughput or a many-workspace performance benchmark. Existing Calendar command/planned-work regressions, browser checks, type checks and focused lint validate the shared mutation path.

Next: review the canonical routine-booking workflow card and setup choices, then connect the typed recipe, exact service matching/rename policy, bounded event enrollment/rechecks, lifecycle and outcome delivery. The assistant guide must continue to withhold automatic booking until that complete path is available.

## Routine-booking setup/review UI checkpoint — November 20

The canonical WorkflowRoutineBookingCard is now available in Storybook under Workflows/Routine Booking, including its actual AssistantPanel composition. This is the component intended for both assistant creation and workflow Edit; the preview supplies callbacks rather than duplicating the form or making a real publication. The live workflow recipe union, guide, assistant tools and worker remain unchanged and do not yet offer booking.

The default view shows a compact summary of the selected service, time needed, days, allowed hours, gap, calendar-day horizon and notification recipient. Change settings reveals local controls in the same card. Users can change the recipient as well as scheduling choices, return to the compact review and Publish workflow; an edit uses Save changes and requires a meaningful change. There is no Test step, Details accordion, crew picker or daily Send at. Both notification channels are selected in the illustrative new-workflow draft. At least one channel is required, and turning both off preserves the booking summary while showing one plain-language notification message.

The card explains that it keeps assignments and existing visits, leaves jobs unscheduled and notifies the selected contact if no time fits, and uses recorded hours/date exceptions. It shows the saved timezone. The illustrated horizon starts the day after each new Job is created; the recipe integration must bind that original source-event window and cutoff rather than resetting it on retries. The current internal executor only provides a per-attempt bounded horizon, so this is still a design requirement for the worker, not a claim of live enrollment.

A missing initial availability setup disables publication and offers Set working hours through a host callback. “Ready” means the host can supply the scheduling setup, not that every future assigned person is guaranteed a free slot or recorded hours; execution must still check everyone. Removed service or recipient choices disable saving until replaced with an available choice. The shared review-value schema preserves the exact selected service string, trims the workflow name, canonicalizes day ordering and validates the existing booking-rules contract. It does not add the unconnected recipe to the live union or use AI similarity matching. Final service-rename handling belongs to recipe integration.

Form edits, weekday toggles, summaries and validation are entirely local. Explicit submission sends revision, timezone and the validated choices to the host once, with an in-flight guard. The host must bind the current draft/workflow identity, reauthorize, check server expiry/version and keep the existing idempotent publication receipt. Failed submission preserves choices for explicit retry; expired, superseded, read-only, pending and paused-edit states retain the established review behavior. Paused edits do not resume or move visits. No database or model call is introduced by this UI checkpoint.

Validation covers 12 contract/formatter unit cases and 20 canonical interaction/accessibility stories for keyboard focus, review, local changes, publish/cancel callbacks, missing hours, incomplete/invalid rules, notification channels, missing choices, paused edits, no-op edits, duplicate-submit protection, save failure, expiration, read-only, mobile review/settings and assistant composition. Keyboard focus moves into settings and back to the review title without submitting. Desktop and mobile screenshots are visually inspected, with web type checking and focused lint. The next step after layout review is connecting the typed recipe and current scoped choices, bounded event enrollment/rechecks, lifecycle and outcome delivery before exposing the capability in the assistant.


## Routine-booking recipe connected — November 21

The approved card now composes into the live WorkflowDraftCard for assistant creation and Edit. Creation reads eligible services, recipients and availability setup through one scoped React Query choices request; Edit reuses its existing choices request instead of making a second booking-options request. Availability saves invalidate the shared choices cache. All field changes and summaries stay local. Publish/Save revalidate exact current service, recipient, permissions, timezone and version/expiry. A draft can be prepared while hours are missing; publication is disabled with Set working hours, and the server independently rejects bypasses. Case-insensitive exact service references resolve to the stored value without fuzzy matching. Renamed/removed services require a reviewed update; execution stops rather than guessing. One active booking workflow is allowed per exact service; pause or edit an existing rule before activating a conflicting one.

Migration `202611210001_workflow-routine-booking.ts` adds per-Job workflow steps with immutable original booking dates/cutoff, attempt identity and saved result, indexed source matching, targeted fact wakeups and outcome notifications. Job INSERT admits only matching active workflows after their enrollment cutoff. It never backfills earlier Jobs. Worker execution holds current workspace mutation authority, rechecks lifecycle/publisher/recipient/service/timezone and calls the existing canonical booking engine inside that same transaction. No-slot attempts preserve the original cutoff, notify once, then wait on relevant availability, assignment or Calendar events, with a bounded next-local-day ticket as time advances. Retries cannot extend the horizon or duplicate bookings. No-slot rows on jobs later booked are marked read and their unsent emails skipped; success gets one new notice.

Lifecycle policy: Pause holds queued attempts and stops unsent workflow emails. Resume skips old held booking attempts and enrolls only future new Jobs. Edits cancel pending attempts under the old settings, preserve active/paused state and reset enrollment for future new Jobs; booked visits are untouched. The review states this explicitly. Delete cancels queued/held attempts and future workflow emails. Run now stays unavailable. A source Job changed to another service, manually scheduled or otherwise ineligible is skipped without a misleading failure notice. Lost publisher/recipient authority stops execution with a visible issue; workspace/service timezone changes require review.

Booked/no-slot notifications use the shared unread/read API and link to the protected Job. The selected contact's ordinary visit-change notice for the same operation is coalesced before delivery, while other assignees retain ordinary visit notifications. Both channels default on. Email uses the shared queue, provider idempotency key, verified address, current role/resource/lifecycle checks and the personal job-activity email preference; it stops on Pause/Delete/edit. Booking and notification decisions use no model calls. The general assistant does not receive a separate booking tool; the Workflows surface advertises only its current authorized typed recipe.

Verification includes six isolated full-recipe groups (real proposal publication/replay, source matching/future-only admission, queued booking/notices, no-slot event rechecks, lifecycle, paused edits and email retries), the existing sixteen atomic-booking groups, contract/domain/agent tests, connected card interaction/accessibility stories and a real web browser journey through publication, Edit and future matching Job booking. The real Redis/BullMQ rehearsal covers committed enrollment, booking/outcome email, no-slot delivery, availability-triggered recheck and success, alongside existing workflow regressions. One live local natural-language authoring request produced the expected routine_booking draft; the diagnostic was canceled and its chat removed. No diagnostic workflow was published and no user Job was booked during verification.


## Workspace service catalog — November 21

Settings → Services now owns the shared catalog: add/rename/archive/restore and typed-confirm deletion of unused services. Routine booking choices show active display names. New matching Job enrollment, active-workflow uniqueness and worker source matching use stable workspace-bound service identity. Immutable compatibility keys preserve saved definitions and historical reviews. Renaming a service does not reset workflow versions, enrollment dates, pending attempts or existing bookings. Active booking workflows must be paused before archiving their service; publication/resume reject archived services. Existing workflows are linked by exact prior service keys without being republished.

Jobs and estimate conversion use controlled service selection with server validation; unknown historical text is retained for explicit review. No older Job is enrolled merely because its service is classified. See `docs/workspace-services-plan.md` for migration, authorization, caching and verification details.


## Qualified-worker selection connected — November 21

The approved optional assignment policy is now live. Configure qualified workers and preferred order in Settings → Services, then choose “Choose a qualified worker if unassigned” in a booking workflow review or Edit. It chooses one configured active worker at the earliest valid slot and breaks equal starts by preferred order. Existing explicit assignments keep the original booking path; existing workflows remain assigned-people rules until explicitly changed. Save of qualification settings does not create a workflow or book anything. The operation applies to future matching Jobs and retains the original next-day start/cutoff, notification channels and lifecycle. See `docs/workflow-qualified-workers-plan.md` for atomicity, permission, event and verification details.

## Job schedule display — November 22

Job detail reads now include the current linked visit's planned work time and saved timezone in the existing authorized SQL query. The Schedule and deadline card displays that start/end range and duration; it omits the empty arrival-window row when precise planned work exists. A separately saved arrival window remains visible alongside planned work, and date-only schedules retain the existing fallback. No arrival promise is invented and no booking is changed. Three canonical browser interaction/accessibility stories pass. A read-only check of local J-0012 verified the response contains its November 23, 08:00, 60-minute plan.

Calendar visit cards also display the canonical planned start/end and duration, retaining any separate arrival window and suppressing its empty fallback when planned work exists. They reuse the domain time summary and the existing Calendar response, adding no database calls. Card button names derive from their content so visible titles and assigned names remain accessible. Planned-work, combined-arrival and legacy card interaction/accessibility stories pass.
