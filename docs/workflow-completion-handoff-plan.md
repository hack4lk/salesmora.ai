# Completion handoff

Status: UI approved and live integration implemented locally, November 22. Immediate timing was selected by the user.

## Behavior

When a Job is marked Completed after publication, notify one selected teammate immediately if it still has linked, nonarchived Work Orders in Draft, Issued or In progress. Both In-app and Email start on. No daily send time, business-day delay, service filter or historical backfill is inferred. Existing jobs can qualify on a new completion; publishing does not alert for jobs already completed.

The assistant request is “When a job is completed, notify me if any linked work orders are still open.” It asks only for a missing notification contact and clarifies unsupported conditions. A short review states who gets the immediate reminder and offers Change settings, Cancel and Publish workflow. Settings contain the name and eligible teammate; channel choices remain visible. No Details section or testing step. Edit preserves workflow purpose and immediate timing, allows contact/name/channel changes, and requires Save changes. Existing Pause, Resume and typed-confirm Delete controls apply through the global table/menu.

Completed, canceled and archived Work Orders do not count. No linked open work orders means no reminder. A Job canceled or reopened before delivery invalidates the pending reminder. Resolving all linked open work orders before delivery suppresses it. If a notification has already been delivered, relevant changes remove a resolved exception from the unread feed and skip its unsent email. Reading removes it from the UI as usual. Never create a new alert just because a work order is reopened on the same completed Job. A later genuine Job completion is a new completion cycle and may alert once.

No Job or Work Order statuses are changed automatically, and Job completion is not blocked. Existing Work Order controls resolve each item; this workflow does not complete checklists, verify photos/signatures/materials or assert that work happened. Customer follow-up, review requests and invoicing are separate additions.

## Notification and navigation

Use the existing NotificationMenu. Example: **Completed job still has open work orders**; “J-0014 · Roofing repair has 2 open work orders.” Show at most three authorized Work Order number/title/status labels plus a remaining count. **Open job** opens the current protected Job details page, where linked work orders are available. No new reminder detail page or duplicate list. No company-name suffix, amounts, notes, customer contact details or unsafe cross-workspace links.

Staff email uses the existing SalesMora branded template, embedded logo and an Open job action, with notification preferences and a plaintext fallback. Reuse reviewed workflow notification channels and existing applicable staff email preferences. Email verification and current access are checked again at send time. “Sent” means provider acceptance.

## Event architecture and efficiency

Admission is the authoritative Job activity transition to Completed, keyed by workspace, workflow and completion activity ID. The source transaction inserts one durable step per matching active workflow and its existing outbox ticket. BullMQ handles immediate dispatch with the shared notification/recovery path. There is no periodic Job/workflow enumeration, per-client polling or runtime model generation.

Execution runs under current workspace authority and rechecks workflow lifecycle/version, publisher/recipient access, Job status/current completion, and linked open Work Orders. Use a batched count/bounded-label projection for the one Job; do not fetch each Work Order separately or authenticate once per label. Record step completion and notification intent atomically with stable deduplication keys. Queue email through the same durable outbox and attach the existing inline logo. Retries reuse the delivery identity and cannot create a second alert for the same completion.

Work Order status/archive changes and Job reopen/cancel changes target only affected pending steps/notices. Use indexed workspace/job references and the existing shared workspace mutation lock and queue-fairness rules. A unique occurrence key prevents source replays or concurrent handlers from duplicating delivery. Late or recovered queue jobs still check current eligibility. Pause/Delete invalidate pending tickets; Resume starts prospectively and does not replay missed immediate events. Editing invalidates stale pending delivery versions and requires a current reviewed recipient before delivery.

Publisher and recipient need workspace-wide Jobs and Work Orders read access; authoring/publishing/editing use the existing Workflows and Assistant permissions. Calendar and financial permissions are not required. Current membership, workspace holds, suspended/deleted actors, lifecycle and authorization remain server decisions.

UI settings are local state. Reuse cached eligible-recipient choices and a scoped React Query boundary for the live host. Publication/save is one authorized mutation with version/request receipts and targeted invalidation. Do not add a new general-assistant tool profile or a separate model routing call; advertise the recipe only in the Workflows assistant after the complete runtime path is connected.

## Checkpoints

1. Review the canonical draft/edit card and notification presentation on desktop/mobile, with both channels, teammate changes, missing access/recipients, failure, pending, expired/cancelled and read states.
2. After UI review, connect typed recipe contracts, event admission, occurrence/suppression, branded email and notification/API reads.
3. Connect publication/Edit/lifecycle, assistant capability and What can I automate example using those same canonical components.
4. Verify completion/current-work-order eligibility, resolved-before-delivery, reopen/recomplete, retries/concurrency, permissions/tenant isolation, pause/resume/delete/edit, queue recovery and current links. Use isolated databases/fake delivery and real API/browser checks. Do not send real customer email or publish a real workflow during diagnostics.


## Canonical UI checkpoint

The future live draft/edit host will compose `CompletionHandoffCard`; its story mocks publication and cancellation. The review uses existing assistant tokens, the shared channel choices and seafoam publish action. Settings change only name/teammate, and immediate timing stays explicit. Changes stay local, disabled/expired/pending states block submission, and failed saves preserve choices. Notification stories compose the existing `NotificationMenu` with `completionHandoffNotification`, capped at three Work Order labels plus a remaining count. Open job points to the existing scoped Job route. Mark as read removes the notification.

Verification: 17 interaction/accessibility stories passed with zero reported violations, the bounded-label formatter test passed, and web type checking passed. Desktop and mobile screenshots were inspected. All publication and notification operations were mocked; this recipe is not exposed in the live assistant or runtime catalog yet.

Review links:
- http://127.0.0.1:6089/?path=/story/workflows-completion-handoff-review--review
- http://127.0.0.1:6089/?path=/story/workflows-completion-handoff-review--change-teammate
- http://127.0.0.1:6089/?path=/story/workflows-completion-handoff-notification--reminder


## Connected implementation

The typed `completion_handoff` recipe is connected to the Workflows-only assistant, What can I automate, the approved `CompletionHandoffCard`, eligible-teammate setup, reviewed publication and Edit. Both staff channels default on. Users can change name/contact/channels; send time, delay, service filters and historical backfill are unsupported. Run now is omitted. Paused edits stay paused; Pause/Resume/Delete reuse the standard workflow table actions, including typed deletion confirmation.

The completion activity adapter admits only future matching events and persists a deduplicated `handoff` step with the Job and completion activity IDs. Existing workflow queue tickets dispatch it immediately. A bounded authorized snapshot contains the Job identity, total open count and at most three Work Order number/title/status labels. Indexed status/archive adapters update unresolved notices as the remaining work changes, and suppress resolved or reopened-job cycles. Email performs another current-source/read-permission/workflow-version/recipient/preference check before using the existing branded shell and embedded logo. No changes are made to Job/Work Order statuses by execution.

`CompletionHandoffCard` is used by the live `WorkflowDraftCard`, and connected stories exercise the actual `ConnectedWorkflowDraft` with mocked option, publish and edit endpoints. Saved chat receipts do not reload setup contacts. New options use a workspace/viewer-scoped React Query key; field changes remain local. No per-workflow polling, repeated per-recipient authentication or runtime model call was added. The generic branded workflow shell is shared with service-due staff/customer emails, keeping both existing branded renderers covered by regression tests.

Create on Workflows: **“When a job is completed, notify me immediately if any linked work orders are still open. Use in-app and email.”** Review the teammate/channels and Publish workflow. For a manual check, create a Job and at least one linked Draft, Issued or In progress Work Order, then mark the Job Completed. The chosen teammate receives one reminder; Open job opens the existing Job page and its work orders. Resolve all open work orders to remove an unresolved unread notice. Reading removes the notification without altering work. Completing a Job without open Work Orders produces no handoff reminder. Already-completed Jobs are not backfilled.

Verification uses disposable databases and fake email transports. The isolated rehearsal command is `pnpm --filter @salesmora/data test:workflow:completion-handoff`; real Redis integration is covered by `pnpm --filter @salesmora/worker test:workflows`. The browser journey in `apps/web/e2e/calendar.spec.ts` verifies authenticated options/publication, completion-event admission, one notification and navigation to the current Job/work-order list. Assistant adapter checks verify one scoped planning request with only the supported recipe and no specific-job lookup; provider responses are mocked rather than evidence of live-model accuracy. No real completion-handoff workflow or customer outreach was published/sent by diagnostics.


Release verification: 13 isolated runtime-role handoff groups passed, along with 11 existing service-reminder/outreach regression groups. The real Redis queue rehearsal verified immediate committed-event dispatch, branded logo attachment, one email identity and durable completion receipts using fake transport. All 22 canonical/connected/email preview stories passed, with no reported accessibility violations; desktop/mobile layouts were inspected. The authenticated live browser test passed publication, completion, notification and Job/work-order navigation. Forty-three focused regression tests and 100 conversation adapter tests passed; prompt snapshots were updated for the added supported recipe. Web/worker type checks, focused lint and diff checks passed. Migrations through `202611220006_handoff-record-labels` are applied locally. The app was reloaded on port 3000; the existing worker reports ready with zero failed workflow queue jobs. Diagnostics published no real handoff rule and sent no real customer email.
