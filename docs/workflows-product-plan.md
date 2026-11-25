# Salesmora Workflows

November 17, 2026. Product proposal for review.

## Product direction

A service-business owner describes an operating rule to the Salesmora assistant, reviews a short draft, and publishes it from the same conversation. The assistant can revise a workflow, explain why it ran or skipped a record, and prepare a pause, resume, or deletion for confirmation. A Workflows page gives office staff and owners a shared place to see what's active, what's waiting, and what needs their attention.

Start with cross-module handoffs where a dropped step costs the business time or a job. Make each Salesmora capability available through the workflow catalog once it has a supported trigger, filter, or action with explicit permissions and predictable outcomes.

## Market research

- **The front office needs reliable intake and follow-up.** In a handyman discussion, participants described collecting contact details, scheduling the estimate, and manually coordinating approved work with customers. A two-person HVAC operator cited scheduling, texts, estimate drafts, and voicemail follow-up as a growing administrative bottleneck. A cleaning-business discussion described tracking customers who go quiet after receiving a price. These are qualitative signals to validate with Salesmora users. [Handyman scheduling discussion](https://www.reddit.com/r/handyman/comments/1qkvccy/how_do_most_busy_handymen_schedule_track_their/) · [HVAC operator discussion](https://www.reddit.com/r/smallbusiness/comments/1w640zy/need_helpwant_to_build_a_custom_ai_automation_setup_vs_just_using_an_out_of_the_box_crm/) · [Cleaning-business follow-up discussion](https://www.reddit.com/r/cleaningbusiness/comments/1unwl1s/the_worst_localservice_leads_arent_the_nos_its/)
- **There is an established baseline for field-service automation.** Jobber documents quote follow-ups, high-value quote alerts, and draft quotes from requests. Housecall Pro supports status-based follow-up with source or tag filters, quiet hours for pipeline texts, and automatic job creation from approved estimates. Salesmora can connect intake, estimates, scheduling, and reporting in one workflow and explain each cross-module decision. [Jobber automations](https://help.getjobber.com/en/articles/automations/) · [Housecall Pro Pipeline](https://help.housecallpro.com/en/articles/6185127-getting-started-with-pipeline) · [Housecall Pro approved-estimate automation](https://help.housecallpro.com/en/articles/12119814-automate-job-creation-from-approved-estimates)
- **Conversation-based authoring already exists.** HighLevel lets users create and refine workflows with Ask AI, then open its builder to test and publish. Salesmora should let the user review and confirm publication in chat, with any unresolved settings shown where the user can act on them. [HighLevel Ask AI workflow creation](https://help.gohighlevel.com/support/solutions/articles/155000008812-create-workflows-directly-from-ask-ai)

## Workflow ideas

| Priority | Workflow | What it does |
| --- | --- | --- |
| Launch | Intake that reaches the right desk | When a website or Gmail intake arrives, surface incomplete or possible duplicate records in the existing review queue. For a qualified, reviewed intake, assign the lead by source or service area, and notify the office if it remains unassigned after a business-hours delay. |
| Connected | Assigned lead going cold | Notify the current lead owner or a selected teammate after a configurable business-day period without recorded lead activity. Notes/saved updates restart the timer; one reminder per inactive period. See [assigned-lead plan](workflow-assigned-lead-cold-plan.md). |
| Launch | Estimate follow-up | Two business days after an estimate is sent, notify the owner if it is still awaiting a response. Offer an approved email template once channel preferences, existing reminder conflicts, and reliable reply suppression are supported. Cancel on acceptance, decline, expiry, or a recorded reply. |
| Launch | Approved estimate needs a visit | Notify the selected scheduling contact or team when an estimate is approved and no linked job or visit is scheduled. Show the office eligible openings once the availability service can provide them. Recheck the current record before escalating. |
| Launch | Monday owner briefing | Use existing report queries to send an in-app summary of stale leads, outstanding estimates, unscheduled jobs, and upcoming deadlines. Include links to the filtered views and honor each recipient's current access. |
| Launch | Book routine work automatically | Book future new unscheduled Jobs for one exact service and their existing assigned people, using recorded hours/date exceptions, duration, gaps and deadlines. Commit atomically; notify the chosen contact when no slot fits. Crew/skill selection is outside the first version. |
| Launch | Fill a cancellation | When a visit is canceled, find eligible jobs on a waitlist and propose a replacement. As availability and customer communication mature, offer the slot with an expiry and a single-winner reservation. |
| Launch | Catch a job at risk | Notify the selected scheduling contact or team when a visit is approaching without an assignee or a required work-order item. Include what is missing and a link to resolve it. |
| Connected | Annual service review | Review past customers for any workspace service on an explicitly chosen annual date/time. Notify staff and open a compact customer review; customer email requires a separate review and send. See [annual service plan](workflow-seasonal-service-plan.md). |
| Later | Deferred work | Bring customers back into review on a customer-requested follow-up date. |
| Connected | Customer visit reminders | Automatically email customers the calendar day before a visit at a chosen time, using the saved arrival window. Missing details produce a staff alert. See [customer visit plan](workflow-customer-visit-reminders-plan.md). |
| Launch | Completion handoff | Immediately notify a teammate when a Job is marked completed and linked nonarchived Work Orders remain Draft, Issued or In progress. Future completion events only. Customer follow-up and invoicing remain separate additions. |

## Create and publish entirely in chat

The [UX walkthrough](workflows-ux-walkthrough.md) shows the workflow table, the assistant callout beneath it, and the workspace-aware examples users see when they open chat. Workflow conversations load relevant capabilities on demand. General chat can route explicit workflow requests into that conversation.

1. **Describe.** “When a roof repair estimate is accepted, notify the Office team if it still isn't scheduled by the next business day. Send me a summary on Fridays.” The assistant proposes two workflows with independent schedules and pause controls. It resolves the workspace’s actual recipient and asks only about ambiguities that change behavior.
2. **Review.** Show a short card in everyday language: “Notify the Office team if an approved roof repair still has no visit by the next business day.” Keep the card to a plain-language rule, notification choices and Publish/Cancel; answer timing or stop-condition questions in chat without a Details section. “Make that two days” updates the card and highlights the change. Ask one focused question when a decision is required, and use visible workspace defaults for routine choices.
3. **Publish.** An authorized person confirms the exact reviewed version. The server checks current permissions, referenced resources, and action readiness as part of publishing. Show when it goes live and link to run history. New workflows apply prospectively. An optional backfill is a separately reviewed operation with an impact preview.
4. **Operate.** In chat or on the Workflows page, users can inspect runs, duplicate, revise, pause, resume, or delete. “Why didn't this run for Smith?” should return the recorded reason, timestamps, and relevant CRM records when the user can access them.

## UX and architecture review before coding

Use the existing assistant proposal, intake, calendar, and reporting patterns to storyboard the full experience. Walk through a straightforward request, a missing recipient, an unavailable action, a revision, publication, and a pause with office staff and owners. Use existing prototypes and annotated mockups for this review. Agree on the screen states, draft copy, capability checks, and calls each interaction needs before implementation starts.

Keep normal creation to a request, a short review, and Publish. Use clear verbs and show technical details only when they help resolve a problem. Give the assistant a compact, server-derived view of the triggers and actions relevant to the request, based on what's implemented, the user's permissions, and workspace setup. When something is unavailable, explain the specific reason in one sentence and offer a supported next step where possible. For example, if the workspace lacks waitlist booking, offer to notify a selected person or team when a slot opens.

## Database and token efficiency

- Follow the [API and React Query playbook](api-query.md). Reuse scoped query keys and cached workflow list and detail data, seed from server data where supported, and invalidate only affected queries after a change. Keep session handling and streaming chat on their existing paths.
- Resolve identity and workspace authorization once per admitted request and pass that context through shared services. Batch the needed references and capability lookups, select only fields the interaction needs, and avoid per-record queries. Publish is a separate request and rechecks current authority and readiness using the same request-scoped pattern.
- Send the model the compact draft, relevant capability metadata, and the smallest context needed for the turn. Use structured edits and deterministic validation. Publish, pause, resume, and scheduled execution use application services without an additional model call once the action has been prepared and confirmed. Follow existing [AI usage accounting](ai-usage-accounting.md).
- During design review, map API calls, database round trips, and model calls for a normal create, edit, and publish sequence. Set budgets from the existing assistant baseline and measure round trips, input and output tokens, and latency during the pilot.

## Lifecycle and execution

- Record saved edits as versioned revisions. An edit review leaves the current version active until Save changes. Saving updates pending and future reminders; completed deliveries retain their history and are never replayed. Name/recipient/channel edits preserve existing due times; time/delay edits recalculate from the original event or visit date. Paused workflows remain paused.
- Pause blocks new runs and holds pending steps. Display pending counts and any action already in flight. Resume rechecks eligibility and skips missed customer messages or expired actions by default. Deleting removes the workflow from the active list, cancels pending work, and retains a limited audit record according to workspace retention. Previously sent messages and completed CRM updates remain in their original records.
- Use a typed catalog with event and recurring triggers, conditions, waits, conditional branches, and approved app actions. Store a validated workflow definition with typed resource references. The worker executes that definition. Runtime AI can later classify intake or draft text into a constrained result, with uncertainty routed for review.
- Separate authoring and publishing permissions. Bind runtime execution to explicitly authorized workspace scope and recheck permissions, recipient access, current record state, and connector availability before consequential actions. Guard customer messages with channel preferences, quiet hours, suppression rules, and delivery limits.
- Persist triggers and scheduled steps durably. Use idempotency for repeated events, retries, and outbound actions. Cap fan-out, guard against cycles, and expose step outcomes and failure reasons. Require a preview before replaying an action with an uncertain external result.

## Delivery checkpoints

1. **Agree on product behavior.** Review all seven launch recipes with office staff and owners. Confirm which events and permissions exist. Complete the UX and architecture walkthrough and review the proposed call budgets before coding.
2. **Design and review the canonical components.** Use the established intake, calendar, reporting, and assistant proposal patterns. Build stories for the workflow review card, capability and publish states, lifecycle controls, and run history before composing and integrating the Workflows page.
3. **Connect a first vertical slice.** Use the reminder for approved estimates without a visit to prove one committed event, one delay, one fresh-state condition, and one in-app notification. Implement draft/version persistence, lifecycle, permissions, and durable execution through shared application services and the existing worker. Validate duplicate events, restart recovery, rescheduling, and pausing while work is queued.
4. **Complete the assistant loop.** Integrate typed draft and lifecycle tools through the existing proposal and confirmation patterns. Add the remaining launch recipes: intake, estimate follow-up, recurring briefings, routine auto-booking, cancellation filling, and at-risk job alerts. Pilot the internal scheduling reminder first. Verify scheduling safeguards and capacity before enabling booking and cancellation filling for launch.
5. **Measure the pilot.** Track time to first publication, workflows still active after 30 days, time from intake to assignment, accepted estimates still unscheduled after one business day, and failures or duplicate side effects. Compare operational measures with each pilot workspace's starting baseline.

The existing [Lead Capture assistant contracts](lead-capture-assistant-contracts.md), [Calendar plan](calendar-page-plan.md), [Reporting implementation plan](reporting-implementation-plan.md), and [Worker deployment guide](worker-deployment.md) are starting points for integration. Confirm service readiness and permission coverage at checkpoint one.

**Proposed pilot decision.** Start with internal notifications and briefings. Use the scheduling reminder as the first end-to-end slice, and use pilot feedback to sequence the rest of the launch rollout. Routine auto-booking, cancellation filling, and at-risk job alerts are launch scope.

## First executable checkpoint

The unscheduled-estimate reminder is implemented through the Workflows page and shared assistant. Authorized publishers can draft a reminder for themselves or one exactly named teammate, review the timing and recipient, and publish it. This recipe uses Monday through Friday at a chosen time (default 5 PM) in workspace time and uses the selected in-app and email channels for future approvals that still need a visit, with both selected by default for new workflows. The sent-estimate follow-up reminder is also connected; the other launch recipes remain pending.

The assistant exposes its workflow tool only on the Workflows page. A successful draft uses one model planning generation, with a fixed review prompt afterward. Publication and execution use application services. Committed source events create durable due steps and a queue outbox in their database transaction. The BullMQ worker executes due steps by ID and records each reminder atomically with its notification. Local development migrations include the workflow publication schema and permissions.

Run now is connected for the initial unscheduled-estimate recipe. An authorized manager reviews a bounded set of existing matching estimates, then confirms immediate reminders through the workflow’s selected channels. Five-minute actor/version-bound previews and atomic receipts make retries safe. Current eligibility and permissions are checked again before delivery. Manual and scheduled execution share batched notification and deduplication logic. Normal schedules stay unchanged, and manual execution uses zero AI tokens.

## Current launch progress — November 18

Approved estimate needs a visit and Estimate awaiting a response are implemented with channel choices, lifecycle controls and reviewed manual runs. The user approved the follow-up UX on November 18. It detects no recorded decision after the first successful estimate email; it cannot infer whether a customer replied. Both recipes use the existing canonical review card, assistant, guide, notification queue and batched execution path. See the [approved follow-up contract](workflows-ux-walkthrough.md#next-recipe-review--estimate-follow-up). The other launch recipes remain planned.

New lead still unassigned is implemented within Intake that reaches the right desk. It defaults to a staff reminder after one business day at 5 PM when a newly created lead remains unassigned, with both channels selected. It supports reviewed publication and Run now, notification channel edits and Pause/Resume/Delete, using recipe-specific Lead permissions and batched execution. Intake still requires its existing review/approval before becoming a lead. Automatic assignment and routing remain planned. See the [lead reminder UX and architecture review](workflows-ux-walkthrough.md#next-recipe-review--new-lead-still-unassigned).


### Event-driven execution — November 19

Approved replacement for per-workflow minute polling: database source-event adapters enroll only matching workspace/recipe rules, then a durable outbox hands individual delayed reminder/email jobs to the existing Redis/BullMQ infrastructure. A shared 30-second indexed recovery claim replaces workflow enumeration. Existing paused/held and completed work, due times and reviewed manual runs are preserved at migration. Workflow notification emails leave the five-second polling path; ordinary non-workflow Estimate emails retain their existing delivery timer.

Queue processing has global concurrency four and a renewable per-workspace Redis lease so one busy workspace yields queue slots before taking SQL connections. Every action rechecks current database state and authority. All execution remains deterministic with zero AI generations; frontend queries and authentication are unchanged. See [execution and operations](workflows-queue-architecture.md).

### Monday owner briefing — implemented November 19

The approved Monday briefing recipe (default 9 AM, configurable time) is connected to assistant drafting, reviewed publication, both channels, a personal briefing email preference, Pause/Resume/Delete and reviewed Run now. Each delivery saves four counts with an as-of timestamp. View briefing opens the protected saved detail page; report links open current data. The four counts use native report predicates with two aggregate-setup/read statements inside one authorized transaction. No AI runs during publishing, scheduled/manual execution, email or snapshot viewing, and recurrence uses the existing shared outbox/BullMQ service without workflow polling.

See the [approved UX](workflows-ux-walkthrough.md#next-recipe-review--monday-owner-briefing) and [execution details and validation](workflows-queue-architecture.md#monday-briefing-recurrence--november-19). Production Monday-burst throughput measurement remains a rollout check.

### Upcoming visit has no assignee — implemented November 19

**Catch a job at risk** now includes a staff reminder at a chosen time (default 9 AM) the calendar day before an unassigned visit. Reuse canonical Calendar assignments/shared visits and the existing event-driven queue. Both channels default on; use the compact review card without Details. The approved UI and server execution are connected, including bounded enrollment of existing future visits, shared-visit checks, reviewed Run now and both delivery channels. The material-status reminder described below is now connected; broader required-task readiness remains separate. See the [approved UX and implementation details](workflows-ux-walkthrough.md#next-recipe-review--upcoming-visit-has-no-assignee).

Assistant setup recognizes “nobody,” “no one” and “noone” assigned as this recipe. All five workflow types accept a workspace-local send time, such as 8 AM. The assistant preserves an explicit time and asks about ambiguous AM/PM. The review card has an editable Send at field with the workspace timezone, updates its description immediately, and publishes that time with the chosen channels. It must not silently change the requested time or claim that workflow setup requires visit details on the current page. Existing workflows retain their schedules; unspecified new times keep the existing defaults. The rule finds matching visits during execution.

### Visit materials need attention — implemented November 19

**Catch a job at risk** now also includes a reminder the calendar day before a scheduled visit when an active linked, issued/in-progress Work Order has material lines marked Needed or Ordered. Use the chosen send time, both default channels and the existing compact review, notification and Calendar handoff. This checks recorded material statuses; it does not infer missing items from an empty list, use ordinary on-site checklist tasks as pre-visit requirements, or claim stock availability.

The approved [user flow and execution boundaries](workflows-ux-walkthrough.md#next-recipe-review--visit-materials-need-attention) are connected to the Workflows-only assistant, custom send time, both default channels, personal Visit materials reminders email preference, reviewed Run now and lifecycle actions. Existing future visits use bounded initialization and material-list changes synchronize affected visits through statement-level event adapters. Automatic booking and cancellation filling remain launch scope and need their separate availability/reservation prerequisites.


### Edit existing workflows — implemented November 20

Authorized users can choose Edit from the existing three-dot menu. The canonical review card is prefilled with name, send time, recipient, editable business-day delay and notification channels. Its sentence updates locally while the user edits. Save changes commits; Cancel writes nothing. Ask assistant carries the selected workflow reference into chat, where a proposed edit requires the same explicit Save changes confirmation. Workflow purpose, trigger, Monday weekday and previous-calendar-day offset cannot be changed through Edit.

The existing version remains active during review. Saving checks current permissions, recipient eligibility and the reviewed version, retains Active/Paused status, records before/after revision history and updates pending queue entries atomically. Delay changes retain the original trigger timestamp rather than starting again from the edit date. Completed reminders are not sent again or moved to a new recipient. Changing recipient or disabling email stops old unsent emails; renaming does not drop already queued mail. No extra polling or AI execution is introduced. See the [approved edit UX](workflows-ux-walkthrough.md#edit-existing-workflows--november-20) and [queue update mechanics](workflows-queue-architecture.md#editing-published-workflows--november-20).

### Automatic lead routing — implemented November 20

The user approved preserving existing assignments and routing only new, unassigned leads. Source-based routing is connected to assistant drafting, reviewed publication, the existing workflow table, Edit, Pause/Resume/Delete and the capability guide. It assigns future admitted leads from one selected source to one current teammate, preserving existing source/default/manual ownership and excluding duplicate links. Reminder time/delay and Run now are omitted. Both notification channels default on; routing may run with both off.

Assignment commits within the existing website submission or intake decision transaction. Routing email uses the shared durable outbox/BullMQ worker and is excluded from legacy assignment polling. Geographic routing and balancing remain later slices. See the [routing UX and implementation](workflows-ux-walkthrough.md#next-recipe-review--automatic-lead-routing) and [architecture](workflows-queue-architecture.md#source-based-lead-routing--november-20).

The next enhancement is [smarter lead routing](workflow-smart-lead-routing-plan.md): Take turns and Fewest open leads using each member's work ZIP/postal codes. The revised plan adds Settings → Team for member coverage and the existing shared Calendar availability, requires a structured ZIP/postal code on new Jobs, and applies coverage alongside qualifications/availability in automatic crew selection. A separate Service areas settings page is superseded. The plan and canonical UI are approved; Team settings, required new-Job ZIPs, optional lead ZIPs, capture/admission and accepted-Estimate conversion are connected locally. Enhanced routing/scheduling execution is connected locally: One teammate, Take turns and Fewest open leads support selected teams and optional recorded ZIP coverage; automatic booking and cancellation suggestions enforce current Job/member coverage. The first geographic slice explicitly supports US ZIP codes. Existing owners/bookings remain authoritative and execution stays event driven.

### Routine booking — connected November 21

The approved [routine-booking flow](workflow-routine-booking-plan.md#routine-booking-recipe-connected--november-21) is connected to the Workflows assistant, Publish, Edit, Pause/Resume/Delete and capability guide. New unscheduled Jobs for one exact service use their assigned people and recorded hours/date exceptions, full duration, gaps and completion deadlines. Common-slot selection and canonical booking commit under one current workspace mutation lock. Both notification channels default on; no-slot jobs stay unscheduled, get one notice and can recheck on relevant saved changes within their original cutoff. Execution has no model calls or per-workflow polling.

Existing Jobs are never bulk-enrolled; booked visits and assignments are preserved. Search begins the day after Job creation. Edit/resume admit future new Jobs; old pending booking attempts are not replayed. One active booking rule per exact service prevents competing configurations. Run now, crew selection, skills, same-day booking, external calendars, customer messaging and cancellation filling remain outside this version. Validation includes isolated proposal/source/worker/delivery journeys, real Redis/BullMQ and a web browser publication/Edit/booking journey.

### Fill a cancellation — connected November 22

The approved [cancellation-fill flow](workflow-cancellation-fill-plan.md#connected-implementation--november-22) now suggests existing unscheduled Jobs when a matching service's precisely timed future visit is canceled, cleared or moved. It uses the released crew, recorded hours, qualifications, duration/gaps and full occupancy. A scheduling contact receives Review replacements through selected channels, then explicitly reviews/confirms one booking on a saved opening page. Assignment, schedule and the consumed opening commit atomically. Current lifecycle, permissions and capacity are rechecked; competing reviews cannot double-book. No dedicated waitlist, same-day filling, automatic customer offers or automatic replacement booking is introduced. The existing event queue and batched reads handle matching without periodic per-workflow scans or runtime AI. Qualified-worker selection for routine booking is also connected; the earlier assigned-only checkpoint above is historical.


## Completion handoff — November 22

The approved immediate internal reminder is connected through the canonical draft/edit card, Workflows-only assistant, notification menu, branded staff email and existing durable outbox/BullMQ worker. It checks current Jobs and Work Orders authority, admits one occurrence per workflow/Job-completion event, and suppresses resolved or reopened-job cycles. Both channels default on; there is no delay, daily time, backfill, Run now, customer outreach, automatic status change or per-workflow polling. See [behavior, architecture and validation](workflow-completion-handoff-plan.md#connected-implementation).

## Workspace workflow limits — November 24, 2026

Free includes **2** saved workflows, Standard (regular) **10**, and Premium **25**. Active and paused rules both count; deleted rules and unconfirmed assistant drafts do not. The shared plan catalog owns the limits, and current effective subscription/grace/plan-override state determines capacity. New preparation and final publication check capacity through the existing authorized workspace transaction; concurrent publishers cannot overbook a final slot. Exact publication retries and editing do not consume another slot. Existing over-limit workspaces retain every saved rule and can edit, pause/resume or delete; they must free a slot or upgrade before creating another.

The canonical Workflows table is unpaginated end to end, including its API and React Query key. Legacy over-limit rows remain visible. Free and Standard show a compact seafoam callout directly beneath the table, with usage and an upgrade link to the current workspace's Billing settings when billing access is available; other viewers are directed to the workspace owner. Premium shows no upgrade callout. Billing's plan comparison includes workflow capacities. Delete updates the count immediately in the same React Query receipt update, without another read. Plan-changing billing mutations already invalidate workspace entitlement reads.

Capacity uses one scoped subscription/workspace/count projection with the request's existing authority. No per-workflow/authentication loop, model execution or polling was added. No database migration is required. Verification passed all five isolated plan-capacity groups (all tiers, last-slot concurrency, delete/retry behavior, edits at capacity, effective overrides and retained over-limit lifecycle), existing workflow/reminder regressions, 31 focused plan/contract/handler unit tests and the authenticated browser journey covering actual quota enforcement and slot reuse. All 33 selected canonical/connected stories and the added mobile callout story passed interaction/accessibility checks, with no mobile horizontal overflow. Web/data type checks, focused lint and whitespace checks passed. Run `pnpm --filter @salesmora/data test:workflow-capacity` for the dedicated database rehearsal.


## Post-job thank-you — November 25, 2026

Automatic branded customer thank-you emails are connected to future finished-work transitions. Default: two calendar days at 9 AM, with editable timing and explicit default/custom message selection. An external HTTPS review link is optional; SalesMora does not collect or track reviews. Without a link, send only the thank-you. With a link, include at most one review request per customer every 90 days. The Job must be Completed and all nonarchived linked Work Orders Completed or Canceled; reopening cancels pending sends.

Publication authorizes future sends. Reuse Edit/Pause/Resume/typed-confirm Delete, current plan capacity, current authority, branded sender/contact settings and durable outbox/BullMQ delivery. A public confirmation page lets customers stop only thank-you/review emails. No historical backfill, SMS, Run now, periodic per-workflow polling or runtime AI. See [implementation and verification](workflow-post-job-review-plan.md).


The Workflows page header displays saved usage at the top right as “8 / 25 workflows.” It reuses the existing server-provided capacity in the workflow list response, includes active and paused workflows, and updates through the existing React Query receipt/invalidation flow. No additional database or authentication request is made. Missing capacity is not replaced with a guessed plan limit.


## Customer schedule-change notices — November 25, 2026

Automatic branded emails now notify customers about date/window changes to already scheduled visits, or a visit that is no longer scheduled. Corrections combine after a five-minute quiet period, capped at 15 minutes per burst; restoration before delivery sends nothing. Emails show previous/current customer-safe schedules, the known arrival window or “to be confirmed,” and company phone/email. Initial bookings, staff assignments, planned work times, completed/archived work and unchanged membership are excluded. A visit removed from the schedule is not described as cancellation of the entire Job.

Publication authorizes future notices, with one active/paused workspace-wide rule and existing plan quotas. Reuse Edit/Pause/Resume/typed-confirm Delete; no Run now or backfill. Separate confirmed customer opt-out, current authority and durable source/receipt/outbox checks protect delivery. The shared automation guide includes an example. See [implementation and validation](workflow-customer-schedule-changes-plan.md).
