# Customer visit reminders

Status: approved UX connected locally November 24, 2026. Typed preparation/publication/editing, durable scheduling, customer-safe email delivery, operational preferences and staff skip alerts are integrated. Verification used synthetic data and fake transport; no real customer sends.

## User-facing rule

“Email customers at 9 AM the day before their visit with the arrival window.”

The first version sends a branded operational email automatically for an eligible scheduled visit. The user reviews the timing, audience and email preview once before publishing the workflow. This is distinct from staff reminders and from separately reviewed service-marketing emails. No SMS, customer in-app channel, promotional content, reply tracking or customer confirmation/rescheduling portal is implied.

Use one workspace-wide rule for scheduled customer visits, without service filtering in the first version. Include existing future visits through bounded initialization as well as newly scheduled visits. The offset is one calendar day, including weekends, with an editable send time in workspace timezone. Show these choices explicitly in review and let the user edit the send time before publication. Do not offer a staff recipient or In-app/Email switches for a customer email-only rule. Workflow capacity and current publishing permissions still apply. Limit active/paused customer-visit rules to one per workspace to avoid overlapping emails.

## Canonical review and email

Reuse the current workflow card/settings layout: workflow name, “Day before the visit,” send time, “Customer on each visit,” and an expandable branded email preview. Publishing explicitly authorizes future automatic reminders; chat yes does not publish. Existing Edit/Save, Pause/Resume and typed-confirm Delete patterns apply. No creation Test step or Run now. The automation guide should include a concise example only once the runtime path is connected.

Email example:

Subject: Your visit with [Company] is tomorrow

Hi [Customer first name],

This is a reminder of your visit on [Date], with an arrival window of [Window] ([Timezone]).

If you need to make a change, call [Company phone] or email [Company email].

Use the established branded email shell and embedded logo. Include only current customer-safe date/window and company contact information. Do not expose internal Job/Work Order titles, staff notes, record IDs, staff-only app links or another customer's details. Do not suggest replying to the reminder email. Initial prototype uses fixed reviewed wording and safe substitutions; assistant-written arbitrary email templates are a separate extension.

The review must explain that emails send automatically after publication. Sender/reply-address and company contact readiness must be validated using existing setup services; missing configuration gets an actionable settings link. Operational reminder preferences must be modeled explicitly rather than interpreting marketing unsubscribe state as an operational preference or silently overriding existing delivery suppression.

## Eligibility and changed visits

Resolve the intended customer from current active linked work and its stored customer relationship; never infer identity from free-text names. Multiple records for the same visit/customer produce one email. Different customers sharing a visit are isolated, each receiving only their own safe visit information. If the customer relationship is missing, contradictory or lacks a deliverable address, skip and expose the reason to staff without guessing. A standalone Work Order must have a reliable current customer relationship to qualify.

Recommended missing-window policy: require a saved arrival window. Skip an email that cannot state it and notify the workflow's publishing teammate with an Open visit action so they can correct it. Never substitute planned work time as a promised arrival window. Skip/alert once per affected occurrence rather than on every recovery attempt. If corrected before the reminder time, normal delivery proceeds; do not replay late reminders in the first version.

Only future, active visits with qualifying nonarchived, noncompleted linked work qualify. Canceled, cleared, completed and entirely archived visits do not send. Source scheduling, linked-work/customer changes and current email preference/address changes are checked again immediately before delivery.

Rescheduling before delivery cancels the old pending occurrence and schedules the new reminder. Arrival-window edits update the facts used at delivery. An already sent reminder is never silently edited or recalled. Moving a visit to a different date permits one reminder for that new visit date if its reminder time is still future. Same-date changes do not send another reminder. Automatic change/cancellation notices after a prior send are outside this initial recipe and must be stated in the review limitations.

Visits booked after the reminder's send time are skipped rather than triggering surprise immediate emails. Pausing or deleting prevents queued sends. Resuming schedules only future reminder times and does not replay a backlog. Changing timing applies to unsent future occurrences; already delivered occurrences stay deduplicated. Record changes that occur after a message has been handed to the transport cannot retract the email.

## Architecture and access

Extend the existing visit source-event adapters and transactional PostgreSQL outbox/BullMQ scheduling. Persist versioned visit/date/customer delivery receipts and one eligible recipient per logical email; deduplicate independently of workflow edits/recreation so two versions cannot double-send the same customer/visit/date. Retain the normal transport idempotency/retry boundary; do not claim exactly-once SMTP delivery.

Enrollment and source-event updates must use scoped indexes and bounded batches; publication must not load every visit/customer into the web request. No per-workflow polling or scheduled AI calls. Reuse shared request authorization and React Query for setup, local state for review fields, and existing workspace transaction/lifecycle guards. Before send, reload current publisher permissions, active workflow state/version, visit date/window, customer link/email and relevant customer delivery preferences. Do not reuse staff visit-notification records or their staff-only email renderer as customer authorization or content.

Customer communication needs explicit server authorization, not just Calendar read or permission to notify staff. Resolve and enforce the repository's existing customer/email and scheduling permissions; design an explicit capability if existing permissions do not cover automated operational sends. Web, worker and assistant must share this decision. Existing staff day-before reminder recipes and customer service outreach retain their current behavior.

## Delivery checkpoints

1. Review this rule, especially automatic email publication, missing-window skip/alert and no after-send change notices.
2. Build the canonical review/settings and branded email-preview stories. Cover eligible, missing configuration, missing window/contact, edited time, paused, read-only, publication failure and mobile states. Review this UX before runtime coding.
3. Add contracts, additive persistence, indexed adapters, customer-safe delivery, current access/preference checks and lifecycle behavior. Integrate the approved canonical UI, then Workflows-only assistant preparation and the shared automation guide catalog.
4. Verify with disposable synthetic records and fake email: duplicate/shared visits, current contact/preference changes, stale queued work, rescheduling, window edits, pause/resume/delete, quota, permissions/tenant isolation, calendar-day/timezone/DST boundaries, retries and queue recovery. Use branded HTML/text checks plus browser and real-Redis rehearsal. Do not send a real customer email during diagnostics.


## Canonical UX checkpoint — November 24

`CustomerVisitReminderCard` is the single canonical review component, with local name/time editing, fixed day-before timing, customer email audience and an expandable `CustomerVisitReminderEmail` preview. The preview follows the established email palette/logo and shows only synthetic customer-safe date/window/contact content; no internal record links. No staff-channel switches or customer recipient picker are offered. The card states that publication authorizes automatic emails and explains missing details, late bookings and changes after delivery.

Sender/company setup failures block publication with a host-supplied settings link. Missing contact/window on a sample illustrates a skipped visit without preventing publication of the general rule. Paused editing preserves its status; unchanged saves, insufficient access, expired/canceled/published reviews and pending callbacks cannot publish. Save failures retain local choices. Callback locking prevents duplicate submission. Hosts must still supply current permission, setup and expiration state; mocked UI checks do not establish runtime enforcement.

All 18 prototype interaction/accessibility stories passed, including email preview, chosen time, publication callback, paused editing, missing sender/contact/window, invalid time, failure/pending/cancel and terminal states. Desktop and mobile screenshots were inspected; mobile has no horizontal overflow. Web type checking and focused lint passed. Story callbacks do not write a workflow or send an email. The live assistant/catalog and queue recipe remain unchanged until the UX is reviewed and runtime integration completed.

Review locally:
- http://127.0.0.1:6006/?path=/story/workflows-customer-visit-reminder--review
- http://127.0.0.1:6006/?path=/story/workflows-customer-visit-reminder--email-preview
- http://127.0.0.1:6006/?path=/story/workflows-customer-visit-reminder--missing-arrival-window
- http://127.0.0.1:6006/?path=/story/workflows-customer-visit-reminder--edit-paused
- http://127.0.0.1:6006/?path=/story/workflows-customer-visit-reminder--mobile


## Connected runtime — November 24

The `customer_visit_reminder` recipe now composes the approved canonical card for chat publication and the existing Edit dialog. The Workflows-only assistant and shared automation catalog expose it only when currently authorized. `customers.email.send` is required in addition to workflow publication and workspace-wide Customers, Calendar, Jobs and Work Orders reads. No SMS or staff-recipient selection is advertised. The reviewed rule fixes customer email delivery, and attempts to use staff notification channels are rejected rather than silently changed. Name/time edits retain a paused workflow; capacity is enforced using the existing workspace serialization.

One active or paused customer-visit rule is allowed per workspace. Migration `202611240002_customer-visit-reminders.ts` adds isolated operational preferences and durable customer/visit/date receipts, reuses scoped Calendar references and extends the existing step/outbox adapter. Receipts deduplicate across workflow edits and soft deletion/recreation. Initial enrollment reads 100 visits per transaction through the indexed date/ID cursor; source events update only affected visits. No per-workflow scan, runtime AI or repeated setup authentication is added.

The worker uses the existing queue dispatcher and injects its established email transport/embedded logo into the customer step processor. Current publisher authority, active workflow, timezone, visit date, window, customer association, archive/contact state, sender readiness and operational opt-out are checked inside the workspace mutation boundary before send. A shared visit resolves stable customer IDs from linked active Jobs/Work Orders and sends once per customer; one customer's email contains no other customer's information or internal work labels. A pathological visit with more than 100 linked customers is skipped with an alert rather than expanded into an unbounded send.

Late bookings and missed reminder times on Resume do not backfill. Queued delivery has a three-hour recovery grace, ending no later than the start of the visit date in workspace time. Ambiguous/nonexistent local send times skip with an actionable workflow issue. Transport failures persist up to five attempts with stable provider keys and bounded retries. A changed payload/contact during a retry is skipped and reported, preserving idempotency semantics. SMTP acceptance still has the existing uncertainty boundary; this is not an exactly-once SMTP guarantee.

Missing setup/contact/window and exhausted retries insert one in-app publisher alert for the affected occurrence, with Open visit navigation. Reading removes it using the existing notification system. Sender/contact setup uses one scoped query; eligible administrators can open the existing shared company-contact editor directly in the review and save those details without publishing or emailing. The fixed branded email includes the current visit date/window, company call/email instructions and a token-confirmed “Stop visit reminder emails” action. This preference is distinct from service-marketing unsubscribe. Changing a preference serializes with sends and suppresses queued and future reminders for that customer/company.

Verification passed: eleven disposable database groups, 144 focused contract/domain/agent/email tests, 24 canonical/connected UI and guide stories with accessibility checks, an authenticated browser chat/publication/fake-send/paused-edit journey, and the existing real Redis rehearsal extended with branded customer delivery. The browser also verifies the token-confirmed public opt-out without login, including no-referrer and noncacheable responses; production headers configure private/no-store while Next development rendering uses no-cache. Token paths are excluded from request logs. Existing unassigned-visit and material-reminder database regressions passed, including their ten-statement initialization checks. A live planner check using entirely synthetic text recognized the new recipe in one planning request even after an earlier fictional refusal. Web/data/worker type checks, focused lint and whitespace checks passed. No saved private conversation was exported.

The migration is applied locally; worker status reports ready, maintenance present and zero failed workflow jobs. Existing user web/Storybook servers remain in place. No real customer reminder workflow was published during diagnostics.

### Try it

Refresh Workflows and ask: “Automatically email customers at 9 AM the day before their visit with the arrival window.” Review the email preview, change the send time if desired, and publish. To observe a real reminder, use a customer address you control and a visit at least two days ahead with a saved arrival window. Confirm company phone/email in the review if prompted. Existing eligible future visits are included. Visits created after their reminder time are skipped; choose a future send time when testing. Customer sending begins only after explicit publication.


### Review preparation refinement

A reported turn completed on the Workflows surface without a saved draft. Generic planner wording still referred to staff-only reminders and prohibited automatic sends without distinguishing future workflow configuration from sending during preparation. The instructions now explicitly prepare a supported customer reminder card in the current turn, without another permission request or staff-recipient question, while publication and delivery remain separate. Customer email-only defaults are explicit in field guidance. A live synthetic planner-to-database check verified argument validation through both layers and a persisted pending review, with no publication or send. The focused 129-test agent/contracts suite and agent type checking passed. Only metadata for the exact user-supplied request was inspected locally; saved private conversation text was not exported.
