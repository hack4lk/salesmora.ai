# Customer schedule-change notices

Status: connected locally, November 25, 2026. The approved canonical review, typed recipe, transactional source adapters, durable coalescing/outbox delivery, operational unsubscribe preference and staff feedback are integrated. Migration `202611250002_customer-schedule-changes.ts` is applied locally. Verification used disposable records and fake senders; no real workflow was published and no customers were contacted.

## Customer-facing behavior

“Automatically email customers when their visit date or arrival window changes, or their visit is no longer scheduled.”

Publication authorizes future automatic branded emails. Review one workspace-wide email-only rule, then Publish workflow; chat approval does not publish. Keep the established Edit, Pause, Resume and typed-confirm Delete controls, current workflow capacity, and one active/paused rule for this purpose. No Run now, historical backfill, SMS, customer app notifications, promotional content or scheduled runtime AI.

Trigger only a real customer-facing transition after publication:

- An already scheduled visit moves to a different date.
- Its customer arrival window changes, including a corrected window on the same date.
- Its saved schedule is removed, or the final qualifying linked work for that customer is canceled so that their visit is no longer going ahead.

Initial scheduling (no prior date → first date) is not a schedule-change notice. Staff assignments, internal planned work times, notes and unchanged saves do not trigger emails. Joining or separating records without changing a customer's effective date/window must not trigger a change notice. Completing work or archiving an old record must not be presented as cancellation. A canceled Work Order does not cancel a customer's visit when other qualifying work for that customer remains on it.

Apply to known customer relationships on the affected visit; a prior SalesMora reminder is not required. Customers may have received their original appointment details from the office outside this app. Do not infer an email address from free text or treat an unrelated new customer as a recipient of the old customer's schedule history.

## Timing and quick corrections

Approved timing: five minutes after the latest saved customer-facing change. No daily send time: this is an event-based operational notice.

Preserve the first prior schedule and compare it with the final current schedule. A → B → C sends one A → C notice. A → B → A before delivery sends nothing. Clearing and then restoring the same visit to a new date during the quiet period becomes one updated-date notice, not a cancellation followed by an update. Bound a continuously changing burst so it cannot postpone a notice indefinitely; use a maximum of 15 minutes from the first change. Show the approved wait rule plainly in review. A new saved change after a successful email starts a new notice; already sent email cannot be recalled.

Current-day customer-facing changes qualify. Suppress changes whose relevant schedules are wholly in the past. The system stores dates and arrival windows rather than a reliable actual visit-start event, so do not guess whether a visit is in progress or claim an email was read.

## Canonical review and branded previews

Use the established compact workflow card with name, fixed customer-email audience, approved delivery timing, included change types and expandable previews. Do not show staff recipient/channel selectors, a daily send-time field or a required review link. Use concise reviewed template language for the first version; this workflow does not inherit arbitrary thank-you copy.

Update example:

Subject: Your visit with [Company] has changed

Hi [Customer],

Your visit has been updated.

Previously: [Old date], [Old arrival window]
Now: [New date], [New arrival window]

If you need to discuss this change, call [Company phone] or email [Company email].

Schedule removed example:

Subject: Your visit with [Company] is no longer scheduled

Hi [Customer],

Your visit previously scheduled for [Old date], [Old arrival window], is no longer scheduled.

For help confirming a new date, call [Company phone] or email [Company email].

Never say the entire Job was canceled merely because a visit was cleared. Do not promise a replacement date, say a customer approved the change, suggest replying to email, expose internal Job/Work Order titles/notes/IDs, reveal another customer's information or add a nonexistent customer rescheduling portal.

Use the existing branded shell/logo and company phone/email. Prefer known values over guessing: if the date is known but a saved arrival window is absent, say “Arrival window to be confirmed” for that date. An arrival-window removal is itself customer-relevant and must not be silently hidden behind the day-before reminder's missing-window rule. Do not substitute internal planned work times for arrival windows. Sender and company contact setup must be valid before publication, with the existing actionable settings link.

## Source identity, delivery and preferences

Existing Calendar schedule commands, independent Job/Work Order scheduling, shared-visit operations and cancellation paths must converge on one affected visit/customer projection. Existing staff visit notification rows are not a source of customer authorization: they have different recipients and may include internal information. Capture authorized before/after customer identities and customer-safe schedule states in the same committed mutation; rollback must remove the event/outbox too.

For cleared/canceled visits, retain the known prior customer relationship before active visit links end. At send time, recheck that relationship against the scoped Job/customer records, current customer address/archive state, current publisher authority, active workflow/version and the relevant preference. A wholly canceled visit has no active-record projection, so the existing day-before reminder helper alone is insufficient. Changed or ambiguous customer relationships must skip with staff feedback rather than exposing old schedule details to a new customer. Shared records for one customer produce one notice; different customers are isolated. Limit/partition unusually large shared visits into bounded work, without an unbounded per-record query loop.

Model an explicit schedule-change email preference, separate from day-before visit reminders and thank-you/review emails. Use “Stop schedule-change emails” with the established public confirmation-page GET and token-bound POST. Opening/scanning a link does not unsubscribe. Preference changes suppress pending and future notices of this purpose; do not reinterpret an unrelated opt-out as newly granted permission.

At delivery, compare the durable prior state with the current coalesced state and reject superseded queue tickets. Save a stable logical notice/delivery receipt and provider idempotency key; repeated events, transport retries, workflow edits and deletion/recreation must not duplicate a successful notice. Changed content/address during an uncertain attempted send cannot reuse an idempotency key with a different payload; require explicit safe supersession and current-state handling. Current authority is rechecked before sending, not inferred from the original actor. Do not claim exactly-once SMTP delivery.

Missing customer/contact data or exhausted retries produce one actionable publisher alert per notice, with Open visit when a current readable visit exists, otherwise an authorized Open job action. Read alerts disappear from the inbox. No private customer address or internal notes in staff alert payloads.

## Lifecycle and efficient architecture

Use the existing transactional PostgreSQL outbox, durable workflow steps and BullMQ worker. Store before/after state, customer identity, event/burst version, due time and outcome; Redis waits until due while PostgreSQL remains authoritative. Use indexes by workspace, affected visit/customer and pending status. No per-workflow timer, periodic customer enumeration, runtime model generation, new polling worker or user-specific authentication loop.

Reuse current request authorization, workspace mutation serialization, queue fairness, persisted retries and current customer-email permission. Require workspace-wide Calendar, Jobs, Work Orders and Customers read visibility plus workflow publication and customer-email authority. Use React Query for one current sender/contact setup read and local card fields until explicit save.

Pause prevents new admission and holds pending sends. Resume skips missed notices; it must not emit a backlog or label changes made while paused as a new schedule update. Before resuming any future pending burst, recheck its source version and customer-visible baseline. Delete cancels pending work and retains receipts for dedupe. Edits preserve pause state and apply only to eligible unsent notices, without changing an uncertain transport payload.

## Delivery checkpoints

1. Confirm automatic email scope, the arrival-window fallback and the approved five-minute combined-correction timing.
2. Build one canonical review/settings card, branded changed/removed-schedule previews and skip-alert stories. Cover same-date window changes, unknown window, missing setup/contact, shared customers, canceled/cleared wording, unchanged reversal, paused editing, expiry/permissions, errors and mobile. Review UX before runtime coding.
3. Connect typed contracts, additive persistence, all source mutation paths, preference confirmation and deduplicated/coalesced queue execution. Integrate the approved card and existing lifecycle UI, then Workflows-only assistant preparation and the automation guide.
4. Verify in disposable databases with fake senders: complete/partial shared cancellation; initial booking excluded; Job/Work Order/Calendar parity; A→B→C/A→B→A bursts; cancellation/restoration; same-day/past boundaries; current identity/address/preferences/authority; pause/resume/delete/edit; retry ambiguity; quota and tenant isolation. Exercise real Redis and authenticated/public browser flows. Do not publish a real workflow, alter real appointments or send customer mail for diagnostics.


## Prototype checkpoint — November 25, 2026

Canonical UI lives in `apps/web/src/features/workflows/workflow-customer-schedule-change/`:

- `workflow-customer-schedule-change-card.tsx` presents the fixed customer-email audience, five-minute wait and 15-minute burst cap, included/excluded changes, name editing, explicit publication and pause-preserving saves. It handles insufficient access/setup, client expiry, unchanged edits, pending callbacks, save failures and terminal states.
- `customer-schedule-change-email.tsx` renders the branded date/window update and removed-schedule examples, with customer-safe before/after values, timezone, company phone/email and the schedule-change opt-out label. A missing window is “Arrival window to be confirmed”; supplied unchanged or missing-contact examples show why no email would be sent.
- `customer-schedule-change.fixtures.ts` contains only synthetic example customers and schedule display values.
- `workflow-customer-schedule-change-card.stories.tsx` exercises the canonical card, including the existing AssistantPanel composition. `schedule-change-notification.stories.tsx` exercises the current NotificationMenu with Open visit, a removed-visit Open job fallback, read removal and mobile.

Review: http://127.0.0.1:6006/?path=/story/workflows-customer-schedule-changes--date-changed

There are 23 review/preview stories and four notification stories. All 27 interaction/accessibility checks pass; web type checking, scoped ESLint and whitespace checks pass. Desktop and 390px phone previews were visually inspected with no mobile horizontal overflow. The blank-name story caught an empty-heading accessibility issue, fixed by showing the fallback workflow title.

This checkpoint demonstrates presentation and mocked callbacks only. The no-send/changed/removed examples are supplied projections, not a functioning debounce or queue engine. Runtime event admission, current authority and source checks, durable coalescing/dedupe, lifecycle/quota enforcement, sender setup and public unsubscribe confirmation still belong to the next integration step. The footer is a preview label, and the assistant example does not call a model. No new recipe has been added to the live automation guide yet.


## Connected implementation — November 25, 2026

- `customer_schedule_change` has a fixed five-minute quiet period and 15-minute burst cap, email-only customer audience and an editable workflow name. Contracts reject daily send times, alternate delays and staff channel/recipient substitutions. The assistant prepares a review now; only Publish workflow authorizes future delivery. Unsupported immediate/daily/custom-wait requests must be clarified before substituting the supported behavior.
- `workflow_schedule_capture` records the pre-change visit/customer projection once per affected visit in `customerScheduleDirty`. A deferred constraint trigger computes the transaction-final projection, so shared Job/Work Order/Calendar edits and rollbacks cannot create notices for intermediate saves. Independent record mutations, shared Calendar commands and record moves feed the same adapters. Publication performs no visit scan or historical enrollment.
- `customerScheduleNotices` persists the original/final schedule, known customer and source references, first-change timestamp, due time, burst version, attempts, token, payload fingerprint and outcome. The notice UUID is also its `schedule_change` step ID. Receipt/step status triggers retime or close the existing queue entry; source changes after a failed attempted send supersede the old receipt with a fresh update. Idempotency keys bind notice identity plus payload fingerprint so a changed request cannot reuse a key with different content. Exactly-once SMTP is not claimed.
- Original-state restoration cancels the pending burst. Clear/restore combines into one changed-schedule notice. Partial shared cancellation leaves other active work alone; completion/archive are not cancellation. Membership moves follow known source references to their effective schedule; ambiguous splits or changed customer relationships skip customer delivery and alert staff. Missing arrival windows use the reviewed fallback. Same-day changes qualify and wholly past changes do not.
- One existing `step` outbox/BullMQ path handles delayed delivery and retries, with current workspace/publisher/customer/source/preference checks. No new timer scan, periodic per-workflow polling, runtime model call or repeated request authentication is added. Projection source reads are scoped to affected visits/records; very large shared visits get an execution issue instead of unbounded customer expansion. A missing receipt closes its queued step rather than leaving endless recovery work.
- `customerSchedulePreferences` is independent of visit reminders and thank-you/review preferences. The public `/schedule-change-emails/unsubscribe` GET displays confirmation only; token-bound POST saves the purpose-specific opt-out and suppresses pending/future notices. The routes use no-referrer/noncacheable/noindex headers and token URLs are excluded from request logs.
- `customerScheduleNotifications` produces one currently authorized staff alert per logical notice. The current notification menu opens an active visit when available, otherwise the Job; read removal remains standard. The inbox projects destination and count in one scoped query for this notice family.
- Live drafts and edits compose `CustomerScheduleChangeCard` through the connected wrapper. Setup uses one cached React Query read and the shared company contact settings. Existing quotas, permission checks, Edit/Pause/Resume/Delete and stale-review validation apply; no Run now. Paused source changes cannot create a replay backlog. The shared “What can I automate?” catalog includes the new example.

Validation: 18 isolated schedule-change groups, plus 11 customer-visit and 11 post-job regression groups; 57 focused contract/domain/agent/handler/email unit tests; 30 canonical/connected review/notification stories and five guide stories with interaction/accessibility checks. Real Redis delivered the final coalesced schedule through the existing worker with a fake branded sender. A synthetic live planner call produced double-validated arguments and a persisted review without publication. The authenticated/public browser journey prepared/published through chat/API, combined two native changes, simulated delivery, confirmed opt-out without login and saved a paused name edit. Web/data/worker type checks, scoped lint and whitespace checks pass.

Run `pnpm --filter @salesmora/data test:schedule-changes` for the disposable database rehearsal. Do not accelerate real pending customer mail for diagnostics.

Try in Workflows: “Automatically email customers when their visit date or arrival window changes, or their visit is no longer scheduled. Wait five minutes to combine quick corrections.” Review the previews and publish. Then change an existing future visit; initial bookings are excluded. Another saved correction restarts the five-minute quiet period up to the 15-minute burst cap. Restoring the original date/window before delivery sends nothing.
