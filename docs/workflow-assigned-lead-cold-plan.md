# Assigned lead going cold

Status: approved UX integrated locally November 24, 2026. Typed preparation/publication/editing, activity-driven scheduling, owner/fixed recipient delivery and notification UI are connected. Verification used disposable synthetic data and fake transport; no real workflow was published or lead changed.

## Recommended rule

“Remind the lead owner at 9 AM if an assigned lead has no recorded activity for three business days.”

The delay is editable from 1–30 business days, Monday–Friday, and the send time is editable in workspace timezone. Default to three business days at 9 AM. In-app and Email start on; at least one staff channel must remain selected. The default recipient is the current lead owner, resolved for each occurrence. The user may instead select a fixed eligible teammate, including themselves. Do not invent an owner name while preparing a workflow for future leads.

Qualifying leads have an active workspace owner, are not archived and remain New, Contacted or Estimate sent. Unassigned leads belong to the existing unassigned-lead reminder. Won, Lost, deleted, archived or unavailable-owner leads do not notify. This does not change lead stages, reassign work or contact customers.

## What counts as activity

Use the existing lead `lastActivityAt` value, which is already updated by saved notes, lead edits, ownership changes and archive/restore operations, and is used by the native inactivity reports. Stage updates must use the same recorded-activity write path; verify each admitted path before connecting execution. Any saved update that advances this timestamp resets the inactivity period. Merely viewing a lead, reading a notification or opening an email does not count.

This is recorded lead activity, not a verified customer conversation. Calls or emails outside the application do not reset the clock unless the teammate records a note/update. An estimate view, customer email reply or unrelated Job update must not be inferred as lead activity. Do not label the reminder “customer has not been contacted.” The review should say “Notes and saved lead updates restart the timer.”

## Enrollment and reminder cycles

Include current eligible assigned leads and new assignments. On first publication, current leads start a fresh inactivity period at publication; there is no immediate historical backlog. Future cycles start at the latest recorded activity/assignment timestamp. Bounded initialization may use max(publication time, current lastActivityAt) as the first anchor. Explain this in one short review sentence: “Existing assigned leads start their first reminder period when you publish.”

New recorded activity cancels the pending stale occurrence and schedules a fresh one. Changing owner cancels the old owner's pending delivery and starts a new period for the new owner. Unassignment/closure/archive cancels pending work. Restoring an assigned open lead starts a new period from that recorded restoration.

Send one reminder per lead/workflow/inactivity period. Do not notify every day while the lead remains untouched. After a reminder, another one requires new recorded activity to begin a fresh period. Multiple records of the same source event, queue retries or channel retries must not create another logical reminder. Editing workflow timing must not re-notify an already notified unchanged inactivity period. There is no escalation or manager chain in the initial version.

Pause/Delete stop pending reminders. Resume starts fresh periods for currently eligible leads and does not replay missed alerts. Delay/time edits retime eligible unsent periods using the recorded anchor. Changing the recipient affects unsent reminders and is rechecked at delivery; a sent reminder remains historical. No Run now or creation Test step is needed for this recipe.

## UX and notification

Reuse the established canonical workflow review/settings layout: workflow name, inactivity delay, send time, recipient (“Lead owner” or a chosen teammate), In-app and Email. Preserve locally edited choices until explicit Publish workflow/Save changes. Preparing a card sends nothing and does not require another permission question. Pause/Resume and typed-confirm Delete use existing patterns. The shared automation guide gets an example only after runtime integration is complete.

The card states the activity/reset and first-publication behavior briefly. More implementation details belong in documentation rather than the user flow. Paused editing, current permissions, missing fixed-recipient eligibility, expired review, pending save and errors use the existing states and preserve choices.

In-app example:

**Assigned lead needs attention**

LD-0012 · Roofing enquiry

No recorded activity for 3 business days.

**Open lead** → the existing protected lead-details page and activity history.

Resolve the recipient using the current owner, not a stale name or owner snapshot. A field teammate with assigned-only Lead access may receive only their currently assigned lead. Fixed recipients must have current visibility of each matching lead; require workspace Lead visibility for a fixed-recipient setup in the first version rather than leaking or silently broadening scope. Email uses the existing branded staff-notification transport and verified-address/preferences checks. Never include private lead notes, contact details or another owner's inaccessible records in the notification payload. Marking read removes the notification from the list.

## Efficient architecture

Extend the existing Lead source-event adapters and transactional PostgreSQL outbox/BullMQ path. Assignment and recorded-activity changes schedule/cancel only affected lead occurrences. Store a stable inactivity-period anchor, owner identity and deduplicated receipt. Preserve the original unassigned-lead uniqueness/lifecycle behavior; recurring cold periods must not overwrite that recipe's one-time source receipt.

Initialize current leads in scoped indexed batches, not a publication-time request loading every lead. Use workspace/recipe lookups bounded by the account's workflow capacity. No per-workflow polling, scheduled AI, per-field requests or repeated request authentication. Reuse React Query for setup; resolve dynamic recipients in the worker with bounded current-authority reads, not an AI call. Before in-app/email delivery, recheck workflow state/version, period anchor, lead stage/archive, current owner membership and recipient read permission.

The workflow counts toward Free 2 / Standard 10 / Premium 25. Creation and publication both enforce capacity; dynamic owner selection must not bypass the normal publisher permission boundary. Staff owner delivery needs current scoped Lead visibility, not customer-email or automatic-assignment authority. Workspace suspension, permission revocation and retries follow the existing queue playbook.

## Delivery checkpoints

1. Review the proposed defaults, recipient choices, recorded-activity definition and fresh start for existing leads.
2. Build one canonical card with interaction/accessibility/mobile stories, plus notification examples using the existing NotificationMenu. Review the prototype before runtime integration.
3. Add shared contracts, occurrence/cycle persistence, additive indexed source adapters, dynamic/fixed recipient authorization and branded staff delivery. Integrate the approved card and edit dialog, then the assistant and guide catalog.
4. Verify current/new leads, inactivity resets, stage changes, reassign/unassign/restore, one reminder per period, owner/fixed access, stale email rechecks, initial batching, delay/time edits, pause/resume/delete, quota, business-day/timezone boundaries, tenant isolation and real Redis recovery. Use disposable fixtures and fake delivery; do not alter a real lead or send notifications for diagnostics.


## Canonical UX checkpoint — November 24

`AssignedLeadColdCard` is the single canonical review component. It defaults to a dynamic Lead owner recipient, three business days, 9 AM and both staff notification channels. Timing and recipient are directly editable; Change settings edits the name and restores focus when returning to review. Fixed teammates are supplied as current eligible choices by the future host; no fixed recipient is required for dynamic owner mode. A missing selected teammate blocks saving until replaced or switched back to Lead owner.

The review explicitly says that notes/saved updates restart the timer, one reminder is sent per inactive period, and current leads start a fresh first period at publication. Paused editing keeps the workflow paused; unchanged edits cannot save. Invalid/empty timing, no selected channels, insufficient permissions, expired/terminal reviews and pending callbacks block publication. Callback failures retain choices, and a callback lock prevents duplicate submission. Runtime authority, current eligibility and delivery still require the next integration checkpoint; mocked callback behavior is not backend enforcement.

`assignedLeadColdNotification` projects only the authorized lead identity, inactivity delay and protected lead-details action into the existing `NotificationMenu`. Stories exercise the actual menu, unread count and removal on read. No company suffix or private note/contact content is introduced. No new notification-detail page or duplicate list component was created.

All 23 canonical review/notification interaction and accessibility scenarios passed. Desktop/mobile screenshots were inspected, including fixed-teammate selection; both mobile views had no horizontal overflow. Web type checking, scoped lint and whitespace checks passed. Story callbacks are mocked: no database changes, workflow publication or real delivery occurred. The live assistant and automation catalog remain unchanged until runtime integration is approved and complete.

Review locally:
- http://127.0.0.1:6006/?path=/story/workflows-assigned-lead-going-cold--review
- http://127.0.0.1:6006/?path=/story/workflows-assigned-lead-going-cold--choose-teammate
- http://127.0.0.1:6006/?path=/story/workflows-assigned-lead-going-cold--edit-paused
- http://127.0.0.1:6006/?path=/story/workflows-assigned-lead-cold-notification--reminder
- http://127.0.0.1:6006/?path=/story/workflows-assigned-lead-going-cold--mobile


## Connected runtime — November 24

The `assigned_lead_cold` recipe now uses the approved canonical card in chat and the Edit dialog. Dynamic Lead owner is the default and does not require collecting a staff name. A fixed teammate is resolved against current workspace-wide Lead visibility. Create defaults are three business days, 9 AM, both channels and the reviewed title “Assigned lead needs attention.” These defaults survive repeated validation across the tool and data boundaries, including a planner-supplied null title. Explicit user choices remain authoritative. The Workflows-only assistant and shared guide catalog expose the recipe through current publisher permissions.

Migration `202611240003_assigned-lead-cold.ts` adds period/owner metadata to staff lead notifications, a current-owner stamp on steps, scoped indexes and source adapters. Existing unassigned-lead notification uniqueness remains enforced through a partial index; the original recipe retains its semantics. One reusable cold step per workflow/lead records the current activity timestamp and owner. Source events cancel/replace affected occurrences; completed periods do not reopen without new activity/ownership. Notification receipts independently deduplicate workflow/lead/activity/owner, so changing timing/name/recipient cannot re-notify a consumed period.

Publication initializes current assigned open leads in 100-row cursor batches. The first due date is computed from max(publication cutoff, recorded activity). Assignment, notes, stage updates, saved edits and archive/restore paths already update the native lead activity timestamp. Execution compares period anchors inside PostgreSQL and preserves database timestamp precision when creating notification receipts. It never converts the anchor to JavaScript milliseconds for an equality check. Pause/Resume and partial-initializer recovery reset the initializer cursor safely; missed unnotified periods get a fresh resume grace. Already notified unchanged periods remain consumed.

Current publisher rights, owner membership, lead stage/archive, activity anchor and current recipient access are checked under the workspace mutation boundary. Dynamic owners may have assigned-only Lead access, exclusively for their current lead. Fixed recipients require workspace access, including after a role/grant change; they cannot inherit the dynamic-owner exception. Email uses the existing lead-notification preference, verified recipient address, persisted retries, transport idempotency and embedded branded logo. Ownership/activity changes remove stale unread notices and suppress their pending email. Marking read removes a notice without touching lead activity.

Setup reuses one scoped authorized request and React Query; recipient changes remain local until save. Work runs through the existing PostgreSQL outbox/BullMQ step and lead-email tickets. Redis payloads remain identifiers/version only. No new per-workflow polling, runtime AI, per-field requests or repeated request authentication is introduced. The rule consumes the established Free 2 / Standard 10 / Premium 25 capacity. Run now is not offered.

Verification passed: eleven isolated database groups (including timestamp precision, fixed-recipient downgrade and 101-lead initialization), 147 contract/domain/agent tests, the 23 canonical UI/notification scenarios plus three connected API stories and the updated catalog story. An authenticated browser flow verified chat preparation, idempotent publication, assigned-only owner notifications and paused recipient/time edits. The real Redis rehearsal delivered a cold-lead email and retained existing workflow regressions. The original unassigned-lead and six-recipe edit rehearsals passed; their fixture explicitly scopes the legacy date-based recipes and uses sufficient plan capacity. A live synthetic planner-to-database check created a saved pending dynamic-owner review after both validation layers, without publication or notifications. Web/data/worker/agent type checking, scoped lint and whitespace checks passed.

The migration is applied locally. No real leads were created/modified and no real notification was delivered during diagnostics. Refresh Workflows and ask: “Remind the lead owner at 9 AM if an assigned lead has no recorded activity for three business days.” Review timing, recipient and channels, then publish. Current assigned leads get the initial three-business-day grace; new saved activity restarts it. To test delivery, use a synthetic lead in a test workspace and record updates/reassignments to observe its queued date; clearing an in-app notification alone does not restart the timer.
