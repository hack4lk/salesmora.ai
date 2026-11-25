# Fill a cancellation

Status: connected locally, November 22. The behavior and canonical UI checkpoints below are retained as the approved design record.

## First version

Suggest replacements to an internal scheduling contact after a future, precisely timed visit frees capacity. The user reviews a suggestion and explicitly confirms a new independent visit. No customer offers, automatic booking, waitlist claims or automatic crew replacement.

Use existing unscheduled Jobs for one selected workspace service as the candidate pool. There is no dedicated waitlist in this version. The workflow's review must say this. A configured duration is an explicit service-level planning assumption, as in routine booking; descriptions are never used to infer duration. The replacement review shows that duration before confirmation.

## Simple user experience

1. On Workflows, ask: “When a roofing visit is canceled, suggest an unscheduled roofing job to fill the opening.”
2. The assistant gathers the selected service, planned duration, gap and scheduling contact. Review a short sentence with In-app and Email on by default, then Publish. No testing step.
3. A qualifying opening produces one notification: “An opening is available on Tuesday, 10–11 AM.” Its action is Review replacements. Notification text uses the saved timezone and no company-name suffix.
4. Review replacements opens a saved opening detail view. Show the date/time, available crew, and at most five currently eligible Jobs, each with title/number, customer, proposed time, duration and people. An empty/stale state explains the concrete reason briefly. Do not show a technical workflow trace.
5. Selecting a Job opens the existing canonical scheduling review, composed with the saved opening and proposed assignment. Confirm booking rechecks eligibility and reserves atomically. Cancel changes nothing. Successful booking marks the opening filled and disables the other suggestions. An unavailable opening prompts a fresh review, never a silent different time or worker.
6. Use the existing workflow table/menu and Edit, Pause, Resume and typed-confirm Delete. Editing affects future openings. Pausing/deleting prevents new confirmations from saved suggestions. Existing confirmed bookings remain.

## Trigger and matching boundaries

- Trigger only after a committed cancellation, clear or move releases a known future planned interval. Date-only visits cannot identify an opening; do not invent their duration from an arrival window.
- Shared visits release capacity only when the remaining active records no longer occupy it. Canceling one linked record must not create a false opening.
- First version excludes same-day/past openings, unsupported multi-day work, customer communications, geographic/travel optimization and external calendars. The UI states tomorrow-or-later.
- Retain the original future interval, timezone, crew, source revision and operation identity. Match exact stable service identity, not title text.
- Candidates are current nonclosed unscheduled Jobs for the configured service. Preserve explicit owners/teams. Their complete crew must fit the opening. For unassigned Jobs, choose one current qualified worker who was part of the released crew and can fill the opening. Never claim freed capacity by silently choosing unrelated people.
- Respect working hours, full-day exceptions, existing complete occupancy, planned duration, gaps and completion deadlines. Unknown hours or overlapping visits with unknown durations cannot establish safe availability.
- Prefer earliest valid proposed start within the original interval; then oldest candidate creation time and stable Job ID. Existing qualified-worker preference breaks ties for an unassigned candidate. Return a bounded five suggestions; acknowledge when the bounded search cannot provide results.
- Never use the canceled Job itself, schedule already scheduled work, move existing visits, alter the canceled source, infer skills or replace an explicit team.
- Notification snapshots are informational. On opening and again on confirmation, recheck current source facts, capacity, permissions, workflow lifecycle, job version/service/status and memberships/qualifications. Suggestions do not hold capacity. A race has one successful canonical booking; other reviewers receive an unavailable state.

## Architecture and efficiency

Reuse committed events, durable queue outbox and BullMQ. Source-event processing deduplicates by opening/source revision; no scan per workspace/workflow and no model calls during matching, retries or delivery. The shared recovery mechanism remains unchanged.

Load a bounded candidate set, union of relevant people, availability and complete busy intervals in batches. Compare candidates in memory; never call the existing booking search once per candidate or authenticate once per person. Use the current authorized transaction context, stable service IDs and the existing workspace mutation lock. Persist the opening and deduplicated notification intents atomically. Do not store indefinitely growing candidate snapshots.

The saved opening page has one scoped React Query projection. Fetch latest suggestions when opened or explicitly refreshed, without a background polling loop. Reuse scoped choices and cache invalidation. Booking confirmation binds actor, opening/version, Job/revision, proposed crew, time and submission receipt. Assignment, canonical scheduling, opening-consumed marker, activity and notice intents commit together or roll back together. A lost response replays the existing receipt, not another selection.

Notification recipient must have current permission to read the candidate pool and schedule the proposed work; qualified selection additionally requires Job assignment authority. Publication and runtime use existing full-workspace scheduling authority rules. Check current permission before email, link navigation and confirmation. Emails link to review and never include unauthorized customer/Job details. No email is a booking confirmation until a booking actually commits.

Expose only the implemented typed recipe to the Workflows-scoped assistant after the full path is connected. Its guide explains unscheduled-Job candidates, tomorrow-or-later, internal suggestions and explicit confirmation. The general assistant does not gain the matching catalog.

## Delivery steps

1. Review this behavior and candidate-pool decision.
2. Build canonical review-card, opening-detail and scheduling-review stories using established components and prototype conventions. Review desktop/mobile, empty, stale, conflict, read-only, loading and failure states before integration.
3. Add typed contracts, durable opening/source adapters, batched matching and idempotent atomic booking. Include current authority and shared-visit capacity guards.
4. Integrate saved detail route, notification actions, workflow lifecycle and scoped caches.
5. Connect assistant drafting and capability guide only after the recipe works through review/publication/confirmation.
6. Verify source cancellations/clear/move, shared remaining occupancy, unknown intervals, deterministic bounded selection, manual crew preservation, qualified fallback, permission revocation, competing confirmations, rollback/replay, pause/edit/delete, queue restart and duplicate delivery. Use isolated database fixtures and fake outbound transport; add the real browser journey and accessibility checks.

At the behavior checkpoint, production code and schema changes were deferred until UI approval.

## Canonical UI checkpoint — November 22

The approved behavior now has two canonical components in Storybook, without live routes, APIs, database writes, execution or assistant advertisement:

- `WorkflowCancellationCard`: compact assistant review, local settings for service/duration/gap/contact, both notification channels initially selected, explicit Publish, no testing step. Publication is a host callback. Invalid settings, missing choices, read-only, expired, error and mobile states use the same component.
- `WorkflowCancellationOpening`: saved-opening layout, date and precise planned range/timezone, service and released people, up to five compact suggested Jobs and an explicit Review booking action. It composes the shared `JobDialog` for the final job/customer/time/crew review and Confirm booking. Pending writes lock controls, failures retain the review, and host lifecycle/access changes disable or remove the relevant actions. The review snapshots the complete selected suggestion; changed time, people or Job facts invalidate the old selection rather than silently substituting a new one. A single expiry timer prevents expired confirmations; no polling or field-level fetches exist.

The UI uses the existing workflow prototype, assistant styles, seafoam actions, shared status/feedback/dialog controls, domain time summaries and responsive page conventions. Story hosts mock callback results around these exact components; there is no parallel preview implementation. The opening and publication screens were visually inspected at desktop and 390-pixel widths, as was the booking review dialog. These components must receive server-authorized projections and confirmed bookings must revalidate/commit under the approved architecture when connected.

Review links (local Storybook):
- http://127.0.0.1:6089/?path=/story/workflows-cancellation-review--review
- http://127.0.0.1:6089/?path=/story/workflows-cancellation-opening--suggestions
- http://127.0.0.1:6089/?path=/story/workflows-cancellation-opening--booking-review

The UI was subsequently approved; the connected implementation is recorded below.

Checkpoint verification: all 29 browser interaction/accessibility stories passed with zero reported accessibility violations. Coverage includes publication/channel/settings choices, missing setup, invalid duration, cancellation, saved/expired/read-only/error states, reviewed booking, no write before confirmation, cancel without booking, empty/loading/load failure, access removal, filled/paused/expired openings, stale suggestion invalidation, pending write controls, five-suggestion bound and mobile. Web TypeScript, focused ESLint and diff whitespace checks passed. No live workflow was published or real visit booked by these design checks.


## Connected implementation — November 22

The approved screens now compose the live Workflows proposal/Edit paths and a saved `/workflows/openings/[openingId]` route. `cancellation_fill` definitions carry a stable catalog-backed service reference, planned duration/gap, scheduling contact and channel choices. Creation requires a reviewed Publish action; Edit uses Save changes and preserves paused status. Pause/Delete block confirmations, and any version change invalidates previously offered openings. Resume starts with future source events; it does not resurrect old offers. There is no Run now or bulk enrollment.

Migration `202611220001_workflow-cancellation-fill.ts` records the original known future interval and released people inside the Calendar mutation, with a unique workflow/source-visit/source-version identity. Matching workflow service identity is resolved through the existing service catalog trigger. Cancellation of one shared record leaves an occupied visit alone; date-only visits, same-day/past slots, unrelated services and future completion alone do not create offers. Clearing or moving a timed visit can create an opening, and its new occupancy remains part of every capacity check. The original canceled Job (or Work Order parent) cannot be its own replacement.

Committed openings create existing `workflowSteps` and the shared durable queue outbox atomically. BullMQ processes an opening once and issues one notification only when at least one eligible replacement currently exists. If no candidates fit at that event, no offer notification is sent; there is no periodic search for new candidates. Once an offer exists, opening or explicitly refreshing its page calculates current suggestions. In-app and email default on, read notifications disappear through the existing feed, and email follows verified-address/current Job activity preferences. Links open Review replacements, never confirm booking. Email transport uses the queue's existing retries, idempotency keys and lifecycle/access checks.

Matching loads at most 100 oldest eligible independent unscheduled Jobs for the selected service, a union of up to 100 released people and their hours/qualification order, a complete bounded occupancy batch, and one local-clock resolution batch. It compares candidates in memory and returns up to five earliest fits, with oldest Job/stable ID ties and qualified-worker preference for equal openings. A search-bound indicator tells the user when some work could not be checked. Unknown hours/durations and ambiguous clock intervals fail closed. Jobs with explicit assignments retain their whole team; unassigned Jobs can receive one currently qualified person from the released crew. No unrelated worker, inferred skill, customer availability or travel assumption is introduced.

Current full-workspace Calendar/Jobs/Work Orders read and scheduling authority plus Job assignment authority are required for publishers and review recipients. The saved-opening page uses the same authorized server transaction as the workspace shell, then one scoped React Query projection. It fetches on opening/explicit refresh, has no polling loop, and adds no candidate/field-level authentication or model calls. Confirmation binds actor/request receipt, opening revision, Job version, selected people and exact proposed local time. Under the existing workspace mutation lock it recalculates complete capacity, rechecks current workflow/participants/service/timezone/Job state, compares the reviewed suggestion, then commits canonical assignment/schedule, opening-consumed status and the actor-bound receipt together. A failure rolls back all writes; competing confirmations have one winner; a lost response replays the existing result. Ordinary assignment/visit notices are coalesced for the same operation.

The Workflows-only assistant and What can I automate guide now advertise the recipe with its precise limits. The general agent does not receive a new tool. A live local natural-language request prepared the correct cancellation rule with a 60-minute duration and 30-minute gap; the diagnostic draft was canceled and its chat removed without publishing.

Verification: 15 isolated database groups pass using web/worker roles, covering proposal publication, source events, shared visits, date/service limits, exact review matching, atomic rollback, competing confirmations, response replay, preserved multi-person assignments, missing hours/unknown occupied duration, lifecycle, queue enrollment and fake email retries. Two- and three-candidate measurements each use one availability batch and one clock batch (not a throughput benchmark). All six prior routine-booking groups pass. The real Redis/BullMQ rehearsal now includes cancellation source-to-notification-to-fake-email delivery and confirms the suggested Job remains unbooked. All 133 focused contract/authorization/agent tests pass, including intentional planner snapshot updates. The 29 canonical UI stories and four connected API-mocked stories pass with accessibility checks. The isolated full browser journey publishes the workflow, schedules/cancels a source, receives the notification, reviews/confirms a replacement and reloads the filled opening. The local schema migration completed and TypeScript/focused lint checks passed.

Local worker readiness was verified after migration: one active workflow worker, shared cleanup scheduled, and zero failed queue jobs. The natural-language diagnostic did not publish a workflow, book a user Job or send a notification.
