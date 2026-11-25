# Workflows UX and architecture walkthrough

Design draft for review. The [product plan](workflows-product-plan.md) defines the seven launch recipes. This walkthrough uses the reminder for approved estimates without a visit as the first example because it exercises creation, publishing, and pausing with one internal action.

[Open the clickable prototype](../prototype/prototype-screen-46-workflows.html). The prototype uses sample data and scripted assistant responses. Changes reset on reload.

## Start from chat or Workflows

The Workflows page starts with a table showing workflow name and status. Open a row for its rule. A three-dot menu at the right offers View workflow, Pause or Resume, and Delete. Below the table, a full-width **Create a workflow with the assistant** callout invites users to describe a task they want Salesmora to handle. Use one action, **Open assistant**, inside the callout and omit the header create button. With no workflows, show a short empty state above the same callout. Use the shared Pagination controls directly below the table, with the assistant callout beneath them. Support the standard row count, page buttons, and 25, 50, or 100 rows per page.

Opening from the callout starts a workflow-focused conversation. Show a short welcome and up to three clickable examples drawn from workflows currently available to the user. For example:

> **What would you like to automate?**
>
> [Route new leads] · [Flag unscheduled work] · [Send a weekly briefing]

Selecting an example puts an editable prompt in the composer. Show the welcome on entry and keep a compact **What can I automate?** link available later. The link opens a guide beside the assistant, with one short example prompt per available automation. On narrow screens, the guide uses the assistant’s full width and **Back to chat** restores the draft. A short note can call out a relevant limit, such as automatic booking being unavailable. Use the same source for examples, limits, and the assistant's available actions. Surface a missing connection or permission when it affects the user's request.

Use the existing [assistant proposal patterns](chat-proposal-consolidation.md) for review and confirmation. Borrow list and detail behavior from [Intake Review](../prototype/prototype-screen-26-intake-review.html), terminology from [Estimates](../prototype/prototype-screen-34-estimates.html) and [Calendar](../prototype/prototype-screen-30-scheduling-calendar.html), and links into [Reports](../prototype/prototype-screen-13-reports.html) for briefings.

## Describe, review, publish

**User** “Notify the Office team if an approved estimate still has no visit by the next business day.”

The Office team is the selected recipient in this example. The assistant uses an authorized person or team from the workspace and asks who should get the reminder when the recipient is unclear. It shows the draft directly in chat.

```text
Unscheduled estimate reminder

Notify the Office team if an approved estimate still has
no visit by the end of the next business day.

[Publish workflow]
```

The review card shows the workflow name, plain-language rule, notification choices and Publish/Cancel controls. It has no expandable Details section. The composer stays available for questions and changes.

**User** “Make it two business days.”

The card updates in place and briefly highlights “two business days.” The current draft is the only card with an active Publish button. Publication uses the exact displayed version.

After confirmation, the card shows **Unscheduled estimate reminder is active** and **View workflow**. A pending request disables the button until resolved. If publication fails, the draft stays visible with a specific recovery action. If the chosen recipient loses access, show “The Office team can no longer receive this alert. Choose another recipient.”

## When the assistant needs something

| Situation | What the user sees |
| --- | --- |
| The user says “tell whoever handles scheduling” and no default is configured | “Who should get this reminder?” Show the two permitted choices. Selecting one fills the draft. |
| Business hours are available | Include the timing in the plain-language rule. Ask only when the timing cannot be resolved from the request or settings. |
| Automatic booking is unavailable for this job type | “Automatic booking isn't available for roof repairs. I can notify the Office team when approved work needs scheduling.” Offer **Draft scheduling reminder**. |
| User can draft but only a publisher can activate | Show **Save draft** and “A workspace publisher can turn this on.” |
| A published rule may overlap | “This may send a second reminder to the Office team.” Link to the existing rule and keep the draft available. |

## Pause, resume, and delete

Show **Pause** and **Resume** on the workflow detail view according to its state. The assistant uses the same actions and receipts. If the user requests a pause, show “Pause Unscheduled estimate reminder? Two reminders are waiting.” Confirm with **Pause workflow**. Afterward, show **Paused** and what happened to any waiting reminders. **Delete** shows its effect on pending work and requires explicit confirmation.

Recent activity uses language such as “Notified the Office team,” “Skipped because a visit was booked,” and “Couldn't send because the Office team lost access.” Show record links only where the viewer has access.

## Scope workflow capabilities to the conversation

Use workflow capabilities by default when chat is opened from the Workflows page. Keep the workflow catalog and tool schemas out of unrelated general chats. Leave the general assistant a small routing affordance for an explicit request to create or manage a recurring rule. For example, “Show my unscheduled jobs” stays a normal CRM query and “Send me a list of unscheduled jobs every Friday” can open a workflow-focused conversation with the request carried over. Reuse existing page and intent routing where possible, with no separate model call solely to choose the mode.

The workflow conversation loads the relevant subset of the catalog from the server based on workspace setup and permissions. The welcome can use a small server-provided capability summary and scoped React Query caching if its options are fetched in a separate read. The server rechecks availability when preparing or publishing a draft.

## Request budget for design review

These are proposed targets for the scheduling reminder example. Validate database round trips and token counts against the current assistant baseline before setting numeric budgets for either.

| Interaction | App and database work | Model work |
| --- | --- | --- |
| Describe | One assistant request. Resolve identity and workspace scope once. Load only relevant capabilities, recipient choices, and scheduling defaults. Persist the reviewed proposal through the existing proposal path. | Target one generation for a straightforward draft, using the relevant capability metadata and compact user intent. |
| Change timing in chat | One assistant request. Load the current draft and references required by the edit. Batch lookups and reuse request-local authorization. | Target one generation for a structured edit to the current draft. |
| Change notification choices | Update the local draft card using its existing authorized payload. Persist the selection on publication. | Zero generations. |
| Publish or confirm a lifecycle action | One confirmation mutation. Check current scope, version, and dependencies in the confirmation path and return the receipt. Reconcile affected scoped React Query entries from the receipt or invalidate them where a fresh read is needed. | Zero generations. |
| Run a scheduled reminder | The worker checks the current estimate, visit, and recipient eligibility through shared services. Record the outcome and use an idempotent notification key. | Zero generations. |

Use the [React Query playbook](api-query.md) for normal API reads and mutations. Keep chat on its existing streaming transport. The capability catalog supplies the assistant with a bounded projection of actions implemented and available in this workspace. The server validates the completed draft against that same catalog before confirmation and rechecks current access on publication.

## Walkthrough review

Walk an owner and the person who schedules visits through finding the callout, choosing a starter prompt, drafting, changing timing, publishing, and pausing. Include a request made from general chat and an unavailable booking request, and check whether the starter examples and capability list help users choose a supported workflow. Check whether they can explain in their own words what will happen, when it will happen, who is notified, and what Pause does. Capture where they hesitate and whether each question or confirmation changes a decision. Review the request budget against the existing assistant and proposal code before starting component work.

## Application integration checkpoint

The shared assistant uses the approved Option 2 compact conversation layout. User messages have a dark fill, small corner radius, and subtle left accent. Assistant replies sit directly on the conversation surface. Small speaker labels and tighter spacing keep the transcript easy to scan. Workflow review cards retain their own outline.

The dark composer places a circular seafoam send arrow beside the textarea on the same row, aligned to the bottom as the text area expands. Its accessible label and pending indicator remain available to assistive technology. The send control disables while sending or when the draft is empty.

The approved page is available at /workflows inside WorkspaceShell. Navigation preserves the selected workspace. The server loads workspace authorization and the first 25 workflows inside one authorized transaction. The client seeds a viewer/workspace-scoped React Query entry with that snapshot and its read timestamp. Further pages use the same scoped read endpoint.

The workflows.read permission controls page and API access. Owner, Admin, and Office receive initial read grants. Owner and Admin receive workflows.manage by default. Eligible Office users can receive management through Permissions. Field access is denied by the catalog. Each lifecycle request resolves session identity once and passes it to the shared data service, which reloads current workspace authority once for the transaction.

The additive migration stores workflow summaries, waiting steps, and lifecycle audit entries. Pause holds queued steps. Resume skips held steps whose due time passed and releases future steps. Delete requires the exact confirmation word, hides the workflow, and cancels queued or held steps while retaining the lifecycle record. Version checks serialize concurrent commands. A running step can finish, so the future executor must recheck lifecycle state immediately before a side effect.

The connected page applies successful receipts to its cache and marks other workflow pages stale without an immediate extra read. Conflict responses refresh the list. Access failures hide records and refresh server permissions. The first executable recipe is the reminder for accepted estimates without a scheduled visit. Users open the shared assistant from the callout, describe the delay and recipient, review the structured card, and select Publish workflow. Its guide lists both the approved-work and sent-estimate follow-up reminders with short examples. The remaining launch recipes are planned.

The workflows.publish permission initially belongs to Owner and Admin and depends on workflow read and assistant access. Authoring also requires workspace-wide estimate read access. The recipient is the user or one exactly named workspace teammate with workspace-wide estimate read access. This recipe uses Monday through Friday at a chosen send time (default 5 PM) in the reviewed workspace time zone. It uses the selected in-app and email notification options and starts with future approvals. New drafts select both options by default. Customer messages and holiday calendars require later recipe work.

A workflow draft uses the canonical chat proposal store, with its exact hash, owner, source turn, expiry, and supersession state. Publishing rechecks current permissions, recipient identity and access, and the time zone. Repeated confirmation returns the original result. A changed draft requires a new review. The workflow tool is available only on the Workflows surface. That surface skips intent routing and a successful draft returns a short fixed response after one model planning generation. Publishing uses application services without a model call.

The original minute-based per-workflow poller has been replaced by event-driven queue execution. Source events persist matching due steps in their transaction; BullMQ handles waiting, and each job checks one due step. A shared indexed outbox claim runs on commit notifications and every 30 seconds for recovery. Named-zone SQL resolves daylight saving time. Each delivery rechecks publisher and recipient access, workflow lifecycle, current estimate status, and linked job and visit scheduling. A unique step per workflow and estimate, and a notification dedupe key, prevent replay duplication. The notification and step completion commit in one workspace transaction. Resume excludes approvals received during the pause and skips overdue held steps.

Database rehearsal covers tenant isolation, permission denial, version conflicts, pending-step transitions, and typed deletion. Connected Storybook stories use mocked API responses to check that the first render and a successful pause avoid redundant reads.

## Manual run component review

Run now appears in the three-dot menu only for an active workflow with explicit manual-run capability supplied by the host. The canonical list opens a simple confirmation after checking matching records. The review describes the real action and count, explains that existing matching records are included and the wait is skipped, and leaves the normal schedule unchanged. Cancel never executes the workflow. Empty matches disable Run now. Preview failures allow another check. Execution failures retain the reviewed scope for retry. While running, both actions are disabled. A receipt reports completed and skipped actions.

Storybook covers confirmation, cancel, no matches, preview retry, execution failure, duplicate-click protection, eligibility changes, unavailable actions, and mobile layout. The live route now uses React Query mutations for preview and confirmation. The server resolves the session once per request and checks workspace authority once per transaction. A five-minute preview binds the acting user, workflow version, and up to 100 matching estimates, including existing approvals. Confirmation rechecks lifecycle, publisher and recipient access, and scheduling eligibility. It delivers only the reviewed records through the same batched notification helper as the worker, records the result atomically, and returns the same receipt on retry. The workflow schedule and enrollment cutoff stay unchanged. Completed reminders are excluded from future manual runs. After an execution failure, the user can retry the same review or check matching records again. Successful receipts update the current React Query list and mark other pages stale without another list read. The component itself performs no API, database, authentication, or model calls.


## Notification options

New workflow drafts start with both In-app and Email selected. The user can change these directly in the review card without another model request. At least one option is required. View workflow shows the saved choices; authorized managers can change them and save with one React Query mutation. The receipt updates the current cached row without another read. Updating channels increments the workflow version, invalidating older manual-run previews, and retains an audit entry. It leaves the schedule and enrollment cutoff unchanged.

Reminders retain one deduplicated notification ledger row with separate in-app visibility and email queue status. Email-only reminders stay out of the bell. The existing email worker requires current recipient access, a verified address, and Estimate email preferences enabled. It rechecks the workflow, publisher, recipient and scheduling eligibility before delivery. Disabling Email stops pending workflow email; enabling it affects future reminders and does not replay previously skipped messages. Older workflow definitions retain their reviewed in-app-only behavior until changed. The single existing local workflow was explicitly switched to both channels at the user's request.

## Next recipe review — estimate follow-up

The user selected Estimate awaiting a response and approved its UX on November 18. The canonical WorkflowDraftCard and assistant/guide composition have reviewed stories under Workflows / Estimate Follow-up. Storybook publication, channel selection, cancellation, expiry, failure, guide navigation and mobile use mocked callbacks. Live preparation, publication, scheduled execution, Run now and staff notification delivery now support both implemented recipe kinds.

The proposed prompt is “Remind me two business days after an estimate is sent if it still has no decision.” The review says “Notify Ava Morgan at 5 PM after 2 business days if a sent estimate still has no recorded decision.” Both In-app and Email start selected. The recipient and delay can be changed through the existing assistant draft flow; channel changes are local controls. Normal creation remains Describe → Review → Publish.

The app records decisions but does not currently have reliable customer-reply evidence. If a request explicitly depends on whether the customer replied, the assistant explains that distinction and confirms use of recorded decisions before preparing the draft. Explain this limit in chat when relevant. This recipe reminds staff and does not send customer follow-up messages. Reply-aware suppression and customer messaging remain pending capabilities.

### Approved execution contract

- Start after the first successful email delivery for an estimate revision, using the earliest estimate_deliveries.sentAt with status sent. Queueing, failed delivery and link-only publication do not start the clock. Later resends do not restart it.
- Default to two business days, Monday through Friday, at 5 PM in workspace time. Preserve the existing 1–30-business-day bounds and time-zone handling. Holidays remain outside the supported calendar.
- Notify once per workflow and estimate revision, only while the current estimate remains Sent, unarchived, unreplaced and unexpired. Skip acceptance, decline, expiry, archive, replacement or withdrawal before execution. Repeat those checks before email delivery.
- Enroll future first successful sends only. Pause holds work; resume skips missed reminders and excludes first sends received during the pause. Delete cancels waiting work. Reuse the existing confirmation dialogs.
- Run now reviews at most 100 currently eligible sent estimates, including existing sends, then runs only that reviewed set with idempotent confirmation. Do not include unsent or failed-only estimates.
- Keep the existing channel defaults, recipient preference/verification checks, scoped React Query cache, one authorization snapshot per transaction and batched eligibility/notification inserts. Reuse the one-generation assistant draft flow. Publication, channel changes and execution use zero model calls.

### Implementation after UX review

All four steps below are connected. A disposable database rehearsal verifies successful-send timing, failed/queued sends, resends, eligibility changes, exact manual-run scope, lifecycle behavior and queued email delivery. The live browser regression verifies real publication, Run now and the resulting in-app staff notification using a fake transport for the estimate email.

1. Introduce a typed recipe discriminator and shared recipe metadata. Preserve existing stored definitions and pending drafts. Keep capability publication tied to actual server support.
2. Add batched successful-send enrollment and eligibility through the existing worker and manual-run path. Distinguish the notification event/copy from the approved-work scheduling reminder.
3. Connect draft preparation, exact publication, guide examples and queued email checks for the new recipe. The worker must fail closed for unsupported kinds.
4. Verify successful versus failed/queued sends, resends, decisions/expiry/revisions, manual-run scope, lifecycle races, channels, permissions and deduplication before enabling the recipe.

### Planner capability consistency — November 19

The workflow planner lists its supported recipe IDs from workflowRecipeSchema, with a required description for every recipe. Requests such as “remind me 2 days after an estimate has been sent out if a decision has not been recorded” explicitly map to estimate_follow_up in those instructions. The “remind me” wording supplies the current-user recipient reference. Current advertised capabilities override earlier assistant claims of unavailability. The workflow instructions remain scoped to the workflow tool profile. Regression tests check the exact request in the model adapter, both recipe names in planner context, strict tool availability, and a single planning request without an intent-routing generation. Model transport is mocked; these assertions do not claim live-model accuracy from a stubbed response.

### Floating assistant launcher

The shared floating assistant button uses the same ink-to-blue-to-teal gradient, seafoam icon tile and subtle circle decoration as the workflow assistant callout and chat header. It retains the existing launcher label, click/keyboard interaction and focus restoration, with its width constrained on small screens. The AssistantPanel / FloatingLauncher story previews the canonical control.

Workflow lifecycle and notification-setting success messages appear immediately above the workflow table. The shared list owns their placement so feedback stays beside the affected workflows, ahead of pagination and the assistant callout.

## Next recipe review — new lead still unassigned

The next launch slice is the unassigned-lead reminder from Intake that reaches the right desk. The canonical WorkflowDraftCard, assistant, guide and notification choices have design stories under Workflows / Unassigned Lead. This review was approved. The live server recipe schema, tool catalog, scheduled worker, reviewed manual runs and notification delivery now support this recipe alongside the two estimate recipes. This slice sends staff reminders; source/service-area assignment rules remain planned.

The proposed prompt is “Remind me after one business day if a new lead is still unassigned.” The review says “Notify Ava Morgan at 5 PM after 1 business day if a new lead is still unassigned.” Both In-app and Email start selected. The existing assistant draft flow can resolve a different recipient or 1–30-business-day delay. Describe → Review → Publish remains the creation flow.

### Proposed behavior

- Anchor timing to lead creation after publication. At 5 PM after the selected Monday–Friday business-day delay, check the current owner and stage. Default to one business day in the reviewed workspace time zone. Holidays and business-hour countdowns are outside this slice.
- Remind once per workflow and lead only while it is unassigned, unarchived and not Won or Lost. Recheck immediately before notification creation and queued email delivery. Assignment changes do not restart the creation-based clock or cause repeat reminders.
- A website/Gmail intake must first become a lead through the existing intake review/approval path. Unreviewed intake, automatic assignment and customer messaging are outside this recipe.
- Reuse channel defaults, expiry, explicit Publish, Pause/Resume/Delete confirmations and reviewed Run now. Manual runs may include existing eligible leads, are bounded to 100 reviewed records, and never silently include records added after review.

### Approved implementation

1. Add a typed lead recipe and recipe-specific read scope. Publishers and recipients must have workspace-wide Lead read for this recipe; do not substitute Estimate access or expose unassigned lead data to assignment-only readers. Derive the advertised tool kinds and planner capability descriptions from current supported, authorized recipes.
2. Extend workflow steps and manual reviews with an explicit record kind and a workspace-bound Lead reference, retaining old estimate definitions and pending reviews. Use separate uniqueness constraints and current scope checks so Lead IDs cannot be interpreted as Estimate IDs.
3. Add a deduplicated lead workflow notification through the existing notification inbox and email queue patterns. A reminder is not an assignment event. Show the Lead number/name and a protected Lead link; respect the selected channels, verified address, recipient preferences and current access. Read notices stay out of the inbox.
4. Batch creation-based enrollment and due eligibility. Reuse request-local authorization, the workspace transaction lock and scoped React Query receipts. Publication, channel settings, manual execution and scheduled execution add zero model calls; drafting retains one planning generation.
5. Verify current assignment/stage changes, archived leads, scope loss, duplicate delivery, prospective enrollment, manual reviewed scope, lifecycle races and both channel choices before enabling the new kind. Keep both estimate recipes covered by regression tests.

### Lead reminder verification — November 19

The canonical review card is connected through the existing publication API and assistant. Recipe availability is derived from the current authorization snapshot and narrows the model’s strict recipe selector; preparation and confirmation independently recheck the chosen recipe’s scope. Workflow instructions remain scoped to the workflow page. Drafting retains one planning request; publication, lifecycle, channel edits and execution use no model calls or additional authentication lookups.

The additive migration keeps existing steps and pending manual reviews as Estimate records, adds a workspace-bound Lead reference, and labels new manual review snapshots by record kind. Lead reminders have a dedicated notification row and retry queue, not an assignment event. The existing personal Lead email preference now explicitly covers both assignments and workflow reminders; existing opt-outs are preserved. In-app notices expose only lead number/name and a protected lead link, and disappear after being read. Reading does not cancel a selected email.

Disposable database rehearsals cover prospective enrollment, Friday-to-Monday timing, current assignment/stage/archive, workspace isolation and permissions, exact reviewed manual scope, record-kind mismatch, concurrent retries, duplicate delivery, channel choices, email preference/verification/access rechecks, transport retry and Pause/Resume/Delete. Both Estimate recipes pass their existing database regressions. The real browser journey publishes through HTTP, runs one reviewed Lead from the workflow menu, checks its notification link and removes the notice by marking it read. Desktop/mobile canonical publication and email stories pass interaction/accessibility checks. Model adapter tests use mocked transport and verify the authorized selector and one planning call; they do not measure live-model intent accuracy. Local development migration applied; hosted environments need the migration and updated web/worker release.


### Event-driven scheduler cutover — November 19

The UX and reviewed rule definitions are unchanged. The database adapters for Lead creation, Estimate acceptance and first successful Estimate email now create persistent steps immediately, alongside a versioned queue outbox. Intake, imports and chat writes use the same table events. Existing due times, held/completed steps and manual reviews survive cutover; migration catches events the previous poller had not yet enrolled. Run now still operates only on the exact reviewed records.

The workflow queue owns delayed reminders and selected workflow email delivery. Commit notifications wake a bounded dispatcher; one shared 30-second recovery query targets pending/expired outbox leases and never enumerates clients or workflows. Lost Redis jobs recover after the persisted handoff lease (normally ten minutes beyond due time/last dispatch). Email transport retries retain their saved nextAttemptAt and idempotency keys. Recovered/retimed jobs use new tickets, making older jobs harmless. Pause closes pending tickets while holding future steps; Resume reopens only future held steps and skips missed work; Delete cancels pending steps. Hourly maintenance removes completed handoff records older than seven days in bounded 1,000-row batches, scheduling another batch while backlog remains, without deleting domain history.

Verification includes fresh and upgrade migrations, 10,000 idle workflows across 1,000 valid workspace fixtures, concurrent outbox claims, stale tickets, real Redis execution and queue loss, temporary email failure, tenant isolation, lifecycle and both Estimate recipes. These are correctness and query-count checks, not production throughput measurements.

Workflow rows show the saved plain-language rule beneath the clickable title, including the configured recipient, timing and condition. Descriptions wrap in full rather than truncate; mobile cards place them beneath the title/status/action row. The existing list response already includes this rule, so rendering it adds no database queries, API requests or AI generations.

## Next recipe review — Monday owner briefing

Approved and implemented November 19. The shared WorkflowDraftCard, AssistantPanel and automation guide support the weekly recipe. WorkflowBriefingCard is the canonical delivery presentation used by Run now and the saved detail page. The Workflows-only tool catalog advertises this recipe only when current permissions permit it. Stories use fictional data and simulated actions.

### Approved experience

- Prompt: “Send me a Monday morning briefing of what needs attention.” Default to Monday at 9 AM in the saved workspace timezone, one selected teammate, with In-app and Email both selected.
- Review one sentence listing the four included categories, with existing channel switches and Publish/Cancel controls. Keep the card concise without a Details section; answer questions about category definitions, access or missed runs in chat. No workflow-testing step is added to creation.
- Monday remains the supported weekday, with an editable send time (default 9 AM). Other weekday, monthly and custom-report requests need a brief clarification; do not silently substitute the supported schedule.
- Delivery contains four counts and protected report links: inactive open leads, estimates awaiting a decision, active unscheduled jobs, and active jobs due soon. An as-of timestamp labels the saved snapshot. Native report links open current data, which may have changed since delivery. Do not add overlapping categories into one total.
- Send a valid all-zero briefing with “No items in these four categories.” Access-unavailable states hide all counts and links rather than presenting false zeros. The workflow does not assign, book, contact customers, or generate speculative AI commentary.

### Definitions checked against current reporting services

- Inactive leads: native Team Leads inactivity, open New/Contacted/Estimate-sent leads with lastActivityAt strictly older than seven days; archived leads excluded.
- Awaiting estimates: native Estimate current awaiting queue. Shared Sent/Published estimates that remain awaiting a recorded decision and are not expired. Published link-only estimates are included here even though they do not start the separate email follow-up reminder clock. Preserve current-revision and archive rules.
- Unscheduled jobs: native Calendar unscheduled Jobs queue, using canonical visit scheduling and active-record eligibility. Do not substitute “no Job exists” or sum visits and Jobs.
- Due soon: native Jobs workload dueSoon definition, active completion deadlines from business-local today through today +7 inclusive. This is not a seven-item/weekday limit and does not include already overdue Jobs. No financial values are included.

### Approved implementation

1. Add a typed weekly recipe and immutable snapshot contract. Publishers/recipients need Reports and workspace-wide underlying Lead, Estimate, Job and Calendar read for the four included sections. Resolve roles/scopes once per transaction. Recheck before execution, email and snapshot viewing; suppress the briefing if required access is missing rather than leaking partial workspace counts.
2. Reuse native report predicates through summary-only projections. Avoid invoking the full Business Overview or materializing every estimate snapshot/evidence row just to produce four counts. Generate one saved snapshot per run, reused by In-app and Email. Display current data as of generation, not a fabricated previous-week trend. Measure the actual query budget before enabling.
3. Extend the current durable outbox/BullMQ path for recurring occurrences. Publication persists the first future Monday 9 AM occurrence (including today if published before 9 AM Monday). Completing/skipping an occurrence durably schedules the next local-calendar Monday; do not add seven UTC days across DST and do not scan every workflow on a timer. Use a unique workflow/occurrence key, versioned handoff tickets and existing recovery/fairness limits.
4. Preserve Pause/Resume/Delete. Missed weekly briefings are not replayed; scheduled-delivery grace ends three hours after the chosen send time, after which that occurrence is skipped and the next is scheduled. A separate reviewed Run now prepares one current snapshot, expires after five minutes, rechecks access before sending that exact snapshot, and leaves the next Monday schedule unchanged.
5. Connect the existing one-generation workflow draft flow and capability guide only after server support exists. Publish and scheduled/manual execution use zero model calls. Add personal briefing email preferences, a dedicated inbox event, protected snapshot view and static email rendering; do not reuse assignment/estimate-event copy or rerun aggregation for each delivery channel.
6. Verify weekday/DST boundaries, publication before/after 9 AM, delayed/recovered occurrences, duplicate/manual retries, exact snapshot reuse, empty results, access loss, channels, lifecycle and matching report counts. Load-test the Monday burst separately from the existing 10,000-idle-workflow query check.

The Monday briefing notification design uses the existing NotificationMenu: one unread item titled “Your Monday briefing is ready,” a compact sentence containing the four authorized counts, the existing timestamp, View briefing, and Mark as read. The full four-row snapshot belongs behind View briefing rather than inside the notification modal. Mark as read removes this item from the list. Workflows / Weekly Briefing includes NotificationModal, MobileNotification and MarkBriefingRead stories using the canonical menu; these are simulated states. Live View briefing opens `/workflows/briefings/[briefingId]?workspace=...`, backed by a saved snapshot and current recipient access checks. The connected Saved Briefing stories exercise this real page component with mocked API responses.


Implementation verification: native report parity and Monday/DST timing pass in an isolated database; the four-count projection uses two SQL statements inside the existing authorization context. Manual confirmation sends the exact actor/version-bound snapshot reviewed within five minutes, and leaves the next scheduled occurrence unchanged. In-app and Email reuse it; each email checks current access, verification, workflow state and the personal briefing preference. Real Redis and runtime-role browser tests pass, including protected detail access, notification navigation and report links. Production Monday-burst load measurement is still required before broad hosted rollout.

## Next recipe review — upcoming visit has no assignee

Approved and implemented next slice of **Catch a job at risk**, following the completed Monday briefing. The unassigned-visit recipe is connected to the Workflows-only assistant and existing queue. Reuse WorkflowDraftCard, WorkflowNotificationChoices, the workflow table/menu, NotificationMenu and the current Calendar visit view.

### Approved user flow

1. Ask: “Remind me the day before a visit if nobody is assigned.” Resolve “me” or one exact teammate; use the requested time, defaulting to 9 AM on the previous calendar day in the saved workspace timezone. Business-day timing still needs clarification before drafting.
2. Review a compact card:

   ```text
   Upcoming visit has no assignee
   Notify Morgan Ellis at 9 AM the day before a visit if nobody is assigned.
   In-app [on]   Email [on]
   [Publish workflow]   [Cancel]
   ```

   Keep the existing publication status/error states. No Details section or testing step. Answer scope/timing questions in chat; the capability guide has a short description and one example.
3. Publish covers future scheduled visits, including visits already on the Calendar. It does not send alerts for past visits. Keep authoring to one planning generation; review/channel changes and publication are deterministic.
4. Delivery: “A scheduled visit has no assignee,” the scheduled date/window when available, and an **Open visit** link. Use the existing canonical Calendar visit view and current access checks. Both channels default on, with an independent personal email preference; reuse the same saved occurrence for both channels.
5. Existing Pause/Resume/Delete and reviewed Run now remain. Run now previews currently eligible upcoming visits, up to the existing batch limit, and never silently expands that set on confirmation. It changes no regular due dates. No match is a normal result.

### Meaning of an unassigned visit

Use the canonical Calendar visit identity and active linked record eligibility, not a Job's legacy scheduledDate. A shared visit is unassigned only when none of its active visible Job/Work Order records has an assignee or supporting team/crew member, matching the Calendar's current unassigned filter. A Job without a primary owner can still have an assigned team; an assigned Work Order can cover a shared visit. Send one notice per workflow, visit and scheduled date, not one per linked record. Do not infer separate visits from matching titles, customers or dates.

Require workspace-wide Calendar, Job and Work Order read for the publisher and recipient so hidden linked records cannot produce a false “nobody is assigned.” Recheck membership, policy and record access when generating, emailing and following the link. Mapping former/suspended assignees to a new risk category needs a separate explicit rule; do not silently change the existing Calendar definition.

Skip cleared schedules, visits without eligible active records and visits that have become assigned. Completion deadlines already have their own reminders: this recipe is about the visit's scheduled date, not a Job deadline. Missing materials or a missing Work Order do not establish that an item is required; required-item readiness remains a later slice of this launch workflow.

### Approved timing

- The chosen send time (default 9 AM) on the previous calendar day, including weekends, in the saved workspace timezone. “Day before” is not “24 hours before an arrival-window start.” Calendar days work even when no arrival window is recorded. Explicitly explain the weekend behavior in the guide/chat when asked.
- If publication, scheduling or assignment removal happens after that reminder time but before the visit day starts, queue one immediate check. This closes late-created gaps without sending a retrospective alert after the visit date begins.
- A canceled/cleared/rescheduled visit invalidates its old pending occurrence. Re-evaluate the new date; never let an old queued ticket decide which date to mention.
- Resume skips missed alerts, schedules future checks, and rechecks any still-open previous-day window. Never replay alerts for a visit date that has started.

### Architecture and call budget

- Extend the existing durable workflow steps/outbox/BullMQ queue. Scheduling, clearing, linking/separating, assignment and active-record changes maintain affected visit occurrences in their transaction. Queue payloads contain only versioned IDs. Recheck current visit state at execution and email delivery.
- Publication and resume perform a bounded, indexed initialization of future visit occurrences for that one workflow; chunk large sets through the existing outbox. This is not a timer scanning every client or workflow. Handle a visit changed during initialization through the same unique occurrence keys/current-state recheck.
- Persist one occurrence per workflow/visit/date. Coalesce multiple record changes; queued and skipped occurrences may be reconsidered while their alert window is open, but a delivered occurrence is never resent for the same date. Rescheduling to a different date can create a new alert.
- Resolve authorization once per request/job; derive publisher/recipient contexts from the same policy snapshot and batch needed membership references. Reuse scoped React Query list data/receipts and invalidate affected resources only. No additional browser polling, per-record authentication or runtime AI generation.
- Measure SQL statements, payload size and latency for publication, initialization batches, execution and email. Preserve the existing worker concurrency/workspace fairness controls. Confirm actual query/index budgets before enabling the recipe; a Monday burst/load benchmark is separate from correctness tests.

### Review and implementation checkpoints

Scope, timing and canonical UI were approved. The canonical component stories cover review/publication, notification/link, shared visits, empty/denied access and mobile. The typed catalog, migration/source adapters, date-bound occurrences, notification/email and assistant capability guide are connected. Verify day-before timing/DST, late scheduling, assignment changes, shared visit deduplication, rescheduling/clear/completion, current permissions, channels/preferences, lifecycle, exact manual previews, duplicate queue tickets and bounded-query behavior. The live assistant exposes this recipe only when publisher permissions permit all required record scopes.

### UI checkpoint — unassigned visit

The approved default timing is 9 AM the previous calendar day, including weekends; the send time is now configurable. Workflows / Unassigned Visit now previews the canonical compact review card, both default channels, channel validation, simulated Publish/Cancel, expired/failure states, the assistant capability guide and mobile conversation. Notification stories use the existing NotificationMenu with one unread item for a shared visit and an Open visit action that opens the existing CalendarVisitPeekDrawer using fictional records. Missing arrival windows are omitted; unavailable access hides visit data; marking the notice read removes it. A Run now empty state uses the existing review dialog.

The notification heading is “A scheduled visit has no assignee,” with an absolute scheduled date, so the heading does not incorrectly say “tomorrow” when the notification is read later. Stories explicitly identify simulated publication/delivery. After UI approval, execution was connected. These stories now use the live draft contract and shared notification formatter. The live adapter validates complete server-owned workflow drafts and publication tickets; story actions remain mocked.

Review links: [conversation](http://127.0.0.1:6087/?path=/story/workflows-unassigned-visit--conversation), [notification](http://127.0.0.1:6087/?path=/story/workflows-unassigned-visit--notification), [Calendar handoff](http://127.0.0.1:6087/?path=/story/workflows-unassigned-visit--open-visit). The connected publication, notification, email, personal preference and Calendar handoff reuse these approved canonical components.

### Connected unassigned-visit verification

The migration and local worker support both newly changed and already scheduled future visits. Initialization is paged at 100 visits with a persisted date/UUID cursor. The measured one-visit service batch uses 10 application SQL statements including transaction/authorization. The same bounded batch path handles up to 100 visits without per-visit application round trips; database event functions still perform indexed work for each affected record within those statements. Tests cover multiple batches and a visit rescheduled behind the cursor during initialization. No workflow timer scans are added.

Delivery snapshots at most five record labels plus the total linked-record count. One shared projection is reused to recheck current visible labels/count/assignment before listing or emailing a notice, so archived, reassigned or moved records cannot expose stale linked-record details. Email uses its own personal Unassigned visit reminders switch and verifies the address, selected channel, current participants, future scheduled date and active workflow before transport. The notification preferences API passes all validated preference fields, including briefing preferences, instead of dropping newly added fields.

Verified in disposable databases: native Calendar assignment parity, supporting crew/shared Work Orders, weekend/DST timing, initialization/cursor bounds, schedule changes/clearing, exact manual date reviews, expiry, deduplication, current read scopes, archived shared records, read removal, preferences and lifecycle. Browser coverage publishes through HTTP, reviews Run now, follows Open visit into the canonical Calendar drawer, and marks the notice read; it also checks preference round trips. Redis rehearsal uses fake transport and verifies initialization, reminder/email jobs and retry keys. Model adapter tests use mocked responses and verify one planning generation and authorized recipe selection; they do not measure live-model intent accuracy.


## Approved update — choose a send time for every workflow

Describe → Review → Publish remains unchanged. “Remind me at 8am the day before a visit is scheduled and noone is assigned” prepares an unassigned-visit draft for 8 AM. The compact review card shows the matching rule, a Send at time input beside the workspace timezone, both notification channels and Publish/Cancel. Changing the field immediately updates the rule description; no chat turn, request or authentication lookup occurs until publication. Empty/invalid times disable Publish. Published and expired cards show a disabled time field.

Apply the same control to all five types. Default to 9 AM for visits/briefings and 5 PM for lead/estimate reminders when no time is requested. Retain the existing day/offset rules and existing workflow schedules. The assistant asks about ambiguous AM/PM rather than silently choosing a different time. The capability guide explains that time is selectable and uses an 8 AM visit example. There is no test step in creation.

## Next recipe review — visit materials need attention

Approved and implemented slice of **Catch a job at risk**. It uses existing Work Order material statuses: Needed, Ordered, On hand and Used. The live capability guide advertises it only to authorized publishers. Keep its rule independent of the existing unassigned-visit workflow so users can select different recipients, times and pause states.

### Concrete user experience

1. Ask: “Remind me at 8 AM the day before a visit if materials are still needed or on order.” Resolve “me” or one exact teammate through the existing setup path. If no time is supplied, default to 9 AM in workspace time. Do not ask for a particular visit: publication covers matching future scheduled visits, including existing bookings.
2. Reuse the canonical WorkflowDraftCard:

   ```text
   Upcoming visit: materials need attention
   Notify Morgan Ellis at 8 AM the day before a visit if a work order
   has materials marked Needed or Ordered.

   Send at [8:00 AM]    America/New_York
   In-app [on]    Email [on]
   [Publish workflow]    [Cancel]
   ```

   Keep the normal Describe → Review → Publish flow. No Details section or test step. The time and channels are local edits; the assistant handles recipient changes through a fresh draft.
3. Show one notification per workflow/visit/scheduled date, including shared visits:

   ```text
   Materials need attention before a visit
   Kitchen faucet installation · Jamie Parker
   Scheduled visit: Monday, March 15 · 9–11 AM
   WO-0018: 2 materials Needed, 1 Ordered
   [Open visit]
   ```

   Use an absolute visit date so a saved notice does not inaccurately say “tomorrow.” Limit linked Work Order labels/counts in the preview and expose no costs, prices, internal notes or company branding. For multiple matching Work Orders, show a bounded list and the remaining count.
4. Open visit uses the current protected Calendar visit drawer, whose linked Work Orders open their existing detail pages. The user can update the recorded material status there. No new detail page, procurement flow or automatic material changes are needed.
5. Preserve reviewed Run now, Pause/Resume/Delete and read-removal behavior. Run now checks eligible upcoming visits immediately, after the existing bounded preview, without changing their normal reminder time. Delete retains the simple type-confirm dialog.

### Exact matching rule and capability education

- Only explicit material lines marked Needed or Ordered on non-archived Issued or In progress Work Orders actively linked to the canonical scheduled visit count. A linked Job alone, a Draft Work Order, an empty materials list or an unchecked required task does not establish a material problem. Required tasks may be work performed during the visit.
- On hand and Used lines do not count. If every relevant line is ready, deleted or no longer attached to an eligible Work Order, skip the reminder. Completed/canceled/archived Work Orders and cleared/past visit dates do not qualify. Assignment is irrelevant to this separate recipe.
- The guide example is the prompt above. The short limitation is: “Uses work-order material statuses. It doesn’t check supplier deliveries, verify stock, order materials or move visits.” If the user says “required items” ambiguously, clarify whether they mean recorded material statuses before drafting; do not silently substitute this recipe for task readiness.
- Require the same workspace-wide Calendar, Jobs and Work Orders read scopes as the existing visit reminder, for both publisher and recipient, together with existing workflow authoring permissions. No additional Materials-catalog access is needed to read material lines already authorized through a Work Order; prices/costs stay excluded.

### Execution and call budget

- Reuse date-bound visit steps, durable outbox, BullMQ delays, current-state checks and workspace fairness. Calculate the previous-calendar-day timestamp from the chosen time and saved IANA timezone. Keep weekend, DST, late-before-visit-day and reschedule behavior consistent with the existing visit reminder.
- Material changes, Work Order status/archive changes and active visit-link/date changes synchronize only affected visits and indexed workspace/recipe matches. The current materials mutation replaces its list with a delete/insert sequence: coalesce affected Work Orders/visits at statement or service level rather than running a separate application query for every material line. Coalesce durable occurrence keys within the same transaction.
- Use bounded initialization for existing future visits, and batched material-count projections for execution and notification visibility. Recheck current material state and access before sending either channel. Do not email stale material labels after the issue is resolved.
- Deliver once per workflow/visit/date. A later material status change must not resend an already delivered occurrence for that date; a new visit date may create a new occurrence. Independent material and assignment workflows may both notify if both conditions apply.
- No additional browser polling, per-workflow database scans, repeated authentication or AI generations during execution. Time/channel edits remain local; preparation and publication reuse their existing request-scoped authority. Measure query counts and burst behavior before enabling delivery; do not assume performance from statement counts alone.

### Review checkpoints

The rule, compact draft, notification wording and Calendar handoff were approved before implementation. Canonical stories, the typed recipe, event adapters, current-state notification/email projections and capability guide are connected. Verify defaults/custom times, both channels/preferences, material-list replacement, mixed statuses, empty lists, shared visits, assignment independence, rescheduling, late changes, current access, lifecycle, initialization bounds and duplicate-safe delivery in isolated tests.


### Connected materials-reminder verification

The `visit_materials` recipe shares visit initialization, date-bound occurrences, notification storage, Redis job types, exact manual reviews and the canonical email/Calendar handoff with `unassigned_visit`. Its snapshot has reason `materials` and contains only up to five affected Work Order labels with Needed/Ordered line counts and the total affected Work Order count. Prices, costs, material notes and catalog stock are excluded. Each notification projection rechecks current labels/counts before exposing a snapshot, including before email transport. Personal Visit materials reminders email preferences are independent of unassigned-visit email preferences.

Material edits use statement-level transition tables, including both old/new parents for a moved line. The app's delete/insert replacement runs inside the same workspace-authorized transaction. One durable occurrence/outbox entry wins; there is no query per material line or new polling loop. Non-scheduling Work Order edits no longer replay stale legacy schedule fields into a shared visit; actual schedule and closure/reopen actions retain the existing Calendar safeguards.

Verified in isolated databases: assigned/shared visits, custom times across DST, ten-statement initialization including authority/transaction, actual material-list replacement and issue events, empty lists and on-site-task exclusion, bounded six-Work-Order snapshots, current manual/scheduled checks, email preferences, resolved-notice hiding, archive/completion and Pause/Resume/Delete. The runtime-role browser journey publishes, reviews Run now, opens the Calendar and linked Work Order, changes a material to On hand, preserves the visit date and hides the resolved notice. Real Redis tests use fake transport and verify the material email subject, retry identity and one saved notice. Canonical review, publication, mobile, notification handoff, preferences and email stories pass interaction/accessibility checks.

Live model spot checks recognize the stated 8 AM and 4:30 PM Needed/Ordered prompts and request clarification for supplier tracking. Single-status-only filters and ambiguous required-item requests require clarification; the initial recipe always checks Needed OR Ordered together. Spot checks do not establish general intent accuracy.

### Automation guide scrolling

The What can I automate? flyout keeps its title and Back to chat control above a bounded, independently scrollable list. Examples and capability limitations scroll together inside that region, with scroll chaining contained so wheel/touch gestures at its edges do not move the assistant dialog. The region supports keyboard scrolling and keeps the same behavior on mobile.


## Edit existing workflows — November 20

Approved flow: Workflows → row three-dot menu → Edit → review current settings → Save changes. Keep the same compact WorkflowDraftCard and existing modal conventions. Editing exposes Name, Recipient, Send at with the saved timezone, Delay (business days) only for lead/estimate reminders, and In-app/Email. It keeps Publish workflow for new drafts and uses Save changes for existing rules. No Details section or test step is added.

The recipient picker contains current eligible workspace members, including the current recipient when eligible, in a bounded batch of up to 500 candidates. It does not include suspended/deleted members or members limited to assigned records. The review shows a short effect note: updates pending reminders, completed reminders do not resend, overdue matches may send now. A paused workflow explicitly stays paused. Neither status nor workflow purpose can be changed from this form; existing Pause/Resume controls remain separate.

Typing, choosing a time, changing channels and the live rule sentence are local state. Opening Edit makes one scoped React Query read for the current version and recipient choices. Save makes one version-bound mutation with a stable retry identity; its receipt updates the table cache, while related resources are marked stale without another list read. A stale save retains the user's form values and tells them to reopen current settings. Cancel, including while loading, saves nothing. The success message appears above the workflow table.

Ask assistant prefills a prompt with the selected exact workflow reference and current review choices, then opens the existing assistant; it does not auto-send or commit. Users can also name an existing workflow in chat. The workflow tool's edit operation preserves null/unspecified fields, rather than using creation defaults, and returns the same canonical edit card. The server freezes the target/version; a chat yes cannot save it. Only users with current read/manage/publish, assistant and complete recipe source permissions receive Edit. The model receives create-only capabilities when editing is unavailable. Unsupported changes of purpose need a separate workflow; empty/no-op edit requests do not produce a misleading review.

Canonical stories cover prefilled settings, unchanged/invalid Save disabling, all fields, Cancel, save errors with retained values, paused copy, assistant handoff, mobile and connected assistant edit confirmation. The runtime-role browser journey opens Edit from the actual menu, changes name/time/recipient/delay/channels, verifies one initial read, saves, cancels a later change, edits while paused and exercises a concurrent stale save. Existing creation stories and scheduling/notification regressions remain covered.

## Next recipe review — automatic lead routing

Approved and implemented November 20. The user selected “Keep existing assignments; route unassigned leads only.” Source-specific and business-default assignments win; this recipe handles only future newly admitted leads that would otherwise have no owner.

### First slice and compact review

Choose one existing intake source and one current teammate. Assign future new, unassigned leads from that source as they become leads, either through automatic admission or an explicit Intake Review decision. Do not bypass incomplete/duplicate review or apply a routing rule to a duplicate linked to an existing lead. Do not reassign existing leads on publication or resume.

Example request: “Assign new unassigned leads from the Website quote form to Jordan Lee.” Names in the example are illustrative; resolve the actual source and teammate from the authorized workspace. Ask “Which intake source?” or “Who should own those leads?” only when necessary. Offer actual choices if a name is ambiguous. Do not accept a team name as if it identified a single person.

Reuse the canonical assistant review card, with routing-specific controls rather than reminder timing:

```text
Website lead routing

Assign new unassigned leads from Website quote form to Jordan Lee.

Source     [Website quote form ▾]
Assign to  [Jordan Lee ▾]

Notify Jordan when assigned
[✓] In-app    [✓] Email

Applies to new leads. Existing owners stay unchanged.

[Publish workflow]   [Cancel]
```

No Send at, business-day delay, timezone, Details section or test step. Assignment happens when the eligible lead is created. Notification channels are optional for this action: allow both off while assignment remains enabled. This differs from notification-only recipes, which still require a channel or Pause. Email follows existing personal preferences and verification requirements.

Source/teammate choices, channel changes and the preview sentence use local form state. Keep the established clean conversation layout and the independently scrolling capability guide. After Publish, show the sentence in the workflow table with Status beside the three-dot menu. The success callout stays immediately above/below the table.

### Assignment precedence and exceptions

- Approved precedence: an existing owner from an explicit source assignment or business default wins. The routing workflow handles only a new lead that would otherwise have no owner. It never changes source settings behind the user's back.
- During preparation, show a specific conflict if the selected source currently assigns every new lead already: “This source already assigns new leads to Alex Parker. This rule would have nothing to assign.” Tell the user to review the existing source/default assignment settings; do not silently publish a useless rule or overwrite the setting. Recheck at publication.
- Permit at most one active routing workflow for the same source in this first slice. A second matching rule must offer editing the existing one rather than silently introducing priority or round robin. Recheck uniqueness atomically on Publish and Resume. A paused duplicate can remain saved, but cannot resume while another rule is active.
- Pausing/deleting stops future routing; prior assignments remain. Resume applies only to future lead admissions. Edit changes the name, source, assignee and channel choices using the existing versioned Save changes flow. A source change rechecks overlap and current source assignment.
- Exclude Run now for routing. The existing manual-run UI applies to reminder/briefing recipes; retroactive assignment would need a separate, explicitly reviewed bulk action and must not appear as an ordinary reminder run.
- If the assignee is removed, suspended or no longer eligible, or the publisher loses required authority, do not choose a replacement. Preserve the lead's normal admission outcome, leave it unassigned where applicable, and record a bounded, actionable workflow issue. Surface that issue to authorized managers. The existing unassigned-lead reminder can independently catch the lead.

### Current capability boundaries

Add “Route new leads” to What can I automate only after the server recipe and source/teammate authorization are connected. Example: “Assign new unassigned leads from Website quote form to Jordan Lee.” Limit: “Uses the selected intake source. Keeps existing owners.” Keep this capability on the Workflows assistant surface and derive its availability from server permissions, as with existing recipes.

The first slice matches an exact persisted source ID, not the editable Lead source label or free-text address. A website/Gmail label alone may identify several sources and requires clarification. Website submissions can create a lead automatically; the assistant must not claim every submission requires human approval. Gmail still follows its existing provider rollout and intake-review restrictions; routing does not activate a connection or change those restrictions.

Service-type conditions, service-area/postcode routing, round robin and workload balancing remain subsequent slices. Current lead addresses are free text; geographic routing needs structured, validated geography and agreed matching rules. Do not infer a service area from an address using AI during execution or advertise that capability prematurely.

### Architecture and request budget

1. Resolve authorized source/teammate choices in a bounded setup read, reusing the request's authority snapshot. Authoring requires current workflow authoring/manage authority, workspace Lead read/assignment access and the relevant source read permission. Validate the assignee's current ability to access newly assigned leads; it need not require workspace-wide lead visibility as notification-only reminder recipients do.
2. Integrate routing with existing capture admission transactions in `lead-capture/submissions.ts` and `lead-capture/intake-store.ts`. Match using the source ID already held by these services, after admission/review eligibility and before the final owner/history/notification outcome is committed. Do not add a global lead-insert trigger that has to rediscover provenance: `leadCaptureData` is written after the lead itself. Do not route duplicate-link decisions or ordinary manual lead creation.
3. Use an indexed lookup for active routing rules by workspace, recipe and source. Enforce the single active match in the database. Resolve the selected rule/publisher/assignee against one current policy snapshot, not separate authentication calls for each rule or candidate. Source/default assignment remains authoritative under the recommended precedence. Keep intake's prepared review consistent: its assignment fingerprint includes the routing decision and reviewed rule version so a changed rule requires a fresh review before approval.
4. Commit owner assignment, current owner stamp, assignment activity, workflow execution receipt and notification intent atomically. Reuse the canonical assignment behavior and existing in-app/email delivery infrastructure; do not emit both a source-assignment notice and a routing notice for the same assignment. Bind retries to the original admission/decision identity. Record which workflow/version assigned the lead.
5. Assignment itself is synchronous and deterministic in the existing transaction. Queue only outbound delivery through the established durable queue path; no timer, per-workflow polling, new recurring scan or runtime model call. A delivery retry cannot reassign a lead or recreate the assignment notice. Recheck current notification visibility/preferences before delivery.
6. Opening Edit uses one scoped React Query read; Publish/Save uses one version-bound mutation with an idempotent receipt. Update the affected cache entries from receipts and invalidate only related resources. Cancel has no write. No additional list polling or model generation after a successful structured draft.

### Implementation and verification checkpoints

After the precedence decision and review of this UX, extend the existing typed workflow definition/proposal/lifecycle contracts for a routing action; do not force it through reminder-only business-day/time/channel validation. Add canonical review/edit/guide stories before connecting the server recipe and assistant. Keep unsupported capabilities out of the live guide during implementation.

Verify source isolation, both admission paths, duplicate-link exclusion, preservation of manual/source/default owners, paused/deleted workflows, future-only resume, active-rule conflicts including concurrent Publish/Resume, changed intake review fingerprints, revoked permissions, unavailable assignees, retries, no duplicate notifications and both-off channel settings. Exercise the actual three-dot Edit window and assistant review at desktop/mobile sizes, including keyboard/accessible labels and the one-read setup budget. Measure database statement counts for matching and nonmatching admissions and a many-workspace fixture; do not infer scale guarantees solely from an indexed query.

### Connected routing verification — November 20

The canonical WorkflowDraftCard has a routing branch with a short rule sentence, notification choices and Publish/Cancel; no timing or delay inputs. Initial source/assignee choices are resolved in chat and revisions use a fresh proposal. The three-dot Edit window loads the current source and eligible assignee choices in its existing scoped read, including teammates with access to assigned leads. It retains Save/Cancel and paused status. The read-only detail window supports silent routing without a spurious channel-validation message. Run now is absent and denied server-side.

The shared admission resolver runs after normal source/default assignment resolution and returns immediately when an owner is already chosen. A nonmatch makes one indexed lookup without another policy/member load. Intake fingerprinting binds the selected workflow ID/version and notification settings; duplicate-link decisions never apply assignment. Failures of publisher/assignee eligibility preserve admission and leave a short issue on the workflow table. No workflow is created or published as part of deployment.

Validation: six isolated database integration groups cover actual source publication, website admission/retries, current owner stamps, assigned-only assignees, source/default precedence, lookup budget, pause/resume/delete, edits, both-off/email-only notifications, stale intake review, duplicate linking, tenant isolation, concurrent Publish/Resume and revoked/suspended participants. The eight existing Intake Review and sixteen website-submission groups passed, as did the existing workflow database suite. The real Redis rehearsal additionally covers routing assignment-email retries through the common queue. Browser verification uses the live workflow page/Edit/detail/menu and actual API in an isolated database; canonical desktop/mobile stories include accessibility checks. Live model diagnostics recognized both ordinary and silent routing prompts without publishing any workflow. Type checks and targeted lint also passed.

### Routing intent consistency — November 20

The exact request “assign new website leads automatically to alex parker” must use the authorized `lead_routing` workflow, with source alias `website` and the named assignee. Empty individual Lead operations on the Workflows surface do not disable routing: they limit single-record actions. The server resolves a unique website source or asks which source; it preserves existing owners and requires the existing Publish workflow confirmation.

The workflow tool and current capability message now state this distinction explicitly. The web build explicitly transpiles the Agent and Domain workspace packages alongside the existing UI, Contracts and Data packages. A fresh local build removed the earlier page/chat capability mismatch. Adapter/runtime regressions cover this exact wording with no individual Lead tools/operations and one planning generation. A live local API check produced the correct routing review; its temporary draft was canceled and diagnostic chat removed without publishing or assigning a real lead.

## Next recipe review — routine booking

See the [routine booking design](workflow-routine-booking-plan.md) for the concrete compact review, no-slot notification, current Calendar gaps, assigned-people scope decision and implementation sequence. This is a design checkpoint before coding. Current Calendar suggestions count distinct visits and known arrival-window overlaps; they do not establish working hours or full work duration. Do not advertise automatic booking from those suggestions alone.


## Smart routing follow-up — November 23

The initial single-person routing slice above has been extended with the approved [smart lead routing integration](workflow-smart-lead-routing-plan.md#connected-execution--november-23). The same connected review now supports One teammate, Take turns and Fewest open leads, selected members, source and optional exact work-ZIP matching. Settings → Team manages member ZIPs and the same Calendar availability records. The guide and Workflows-only assistant describe these current capabilities. Review/Publish and versioned Edit/Save use the canonical card; there is no routing Run now. Existing source/default owners are preserved. ZIP routing requires a published source with a required US ZIP field; unsupported or ambiguous requests ask for clarification rather than inventing a capability.


## Automation examples catalog — November 24, 2026

The Workflows assistant's “What can I automate?” list and canonical guide stories now share `workflow-automation-examples.ts`. Every executable recipe must have at least one example through an exhaustive, nonempty typed catalog. The list contains 17 examples covering all 14 recipes, including separate single-owner, round-robin and fewest-open-leads routing, plus booking with existing assignees or one configured qualified worker. Annual date reviews, completion-based service reminders and automatic customer visit emails are shown separately. The host filters entries by its existing server-authorized recipe list; no new setup queries, model context or authentication calls are introduced.

Guide checks cover every displayed example, restricted recipe visibility, empty access, independent list scrolling and mobile overflow. The examples illustrate services and teammate names that users can replace with their own workspace choices.


## Post-job thank-you

Ask the Workflows assistant to email a thank-you after finished work. It proposes wording and asks whether to use the default, revise it or write your own. Choose wording, timing and optionally an external review page, then inspect the branded preview and publish. No review link is required. The preview shows only a thank-you when blank; a supplied link exposes both review-request and cooldown thank-you-only variants. The assistant cannot claim to collect or track reviews.

The three-dot Edit action reuses this card, retaining approved wording and pause state. Missing customer details or failed delivery appear as an Open job notification; reading removes it from the inbox. Customer opt-out opens a public confirmation page and changes preferences only on confirmation, without affecting visit or repeat-service emails.


## Customer schedule-change notices

Ask the Workflows assistant to email customers when an existing visit date/window changes or the visit is no longer scheduled. Review the fixed five-minute quiet period, 15-minute burst cap and three branded example previews, then publish. There is no daily send-time picker, staff recipient selector or custom template editor. Missing windows are described as “Arrival window to be confirmed.” The preview for a cleared visit does not claim the entire Job is canceled.

Pause/resume/delete use existing controls; Edit reuses the canonical review and preserves pause state. Quick corrections combine; a restored original schedule sends nothing. Missing customer details or failed delivery produce Open visit/Open job feedback, removed after reading. Customer opt-out opens a public confirmation page, changes preferences only on confirmation and does not stop day-before reminders or thank-you emails.
