# Service reviews on a chosen annual date

Status: approved UX integrated locally November 24, 2026. Contracts, persistence, queue execution, assistant preparation, editing, customer review and notifications are connected. The user replaced a March 1 spring default with an explicitly selected custom date for any workspace service.

## User experience

The user chooses an existing workspace service, the first review date, a send time and the teammate to notify. The workflow repeats annually on the chosen month/day in the workspace timezone. There is no season selector, inferred seasonal date or March 1 default. “Review gutter-cleaning customers every spring” asks which date to use; a request already containing a service/date/time/contact preserves those choices and asks only for missing information. A date without a year means the next future matching occurrence, shown with its full date in the review before publication. An explicit first date must still be in the future at the chosen time.

Example, only after the user selects the date: “Notify me at 9 AM every March 15 to review gutter-cleaning customers.” The assistant resolves the existing service, prepares a short review, and the user reviews and publishes. The review clearly states its first delivery date and annual recurrence. In-app and Email default on and notify staff. Workflow Edit/Save, Pause/Resume and typed-confirm Delete use the existing lifecycle. No Test step in creation. Do not automatically contact customers or publish a workflow from a chat confirmation.

The review card uses the established workflow controls: name, service, first review date, send time, notification recipient, In-app and Email. Advanced scheduling terminology and implementation details stay out of the user flow. “What can I automate?” includes a short dated-service-review example and explains that the assistant needs a chosen date rather than assuming a season. This is distinct from the completion-based 3/6/12-month service_due recipe.

## Customer review and outreach

Start with a compact customer/service review list based on existing completed Jobs for the selected stable service ID, deduplicated by customer and showing the latest reliable marked-completed date and source Job. Do not infer completion from a visit date or identify services by similarity. The annual review does not itself establish that a customer is overdue. Exclude archived/unavailable customers/services and avoid fresh outreach for matching work already open; link to existing work when useful. Do not invent a minimum time since completion, property boundary or marketing consent from an annual date.

Reuse the established service-review and separately reviewed customer-email experience where its actual semantics fit. Existing branded email templates, company contact instructions and reviewed recipient selection remain authoritative. Reuse components and shared email services rather than cloning the due-list page. Any cycle-specific exclusions, suppressions, dismissals and successful sends belong to the particular annual occurrence and must not erase next year's review. Do not quietly reuse completion-based due dates for annual selection.

A notification says, for example, “Review gutter-cleaning customers” with a protected Review customers link. The same list is reachable from the workflow's action menu after a notification is read. Empty annual results do not generate customer outreach or repetitive notifications.

## Scheduling and efficiency

Persist the selected first date, annual month/day, local send time and timezone as reviewed rule data. Keep the calendar date explicit. For February 29, show that annual matches occur only in leap years and preview the next valid delivery rather than silently moving it to February 28. Publish schedules the first reviewed future occurrence through the existing PostgreSQL outbox/BullMQ queue. Each occurrence schedules only its next valid future occurrence; do not enumerate all workspaces or scan every workflow on a timer. No automatic replay of missed annual reviews on Resume.

Use current customer/job/service projections and bounded background batches at occurrence time; do not snapshot every customer or create a queue job per customer when the rule is published. Preserve scoped indexed selection, shared request authorization, tenant-bound occurrence receipts and current permission checks. The assistant plans only creation/editing, never scheduled execution. Setup uses React Query and local field state until explicit save. No per-field requests, repeated authentication calls or runtime model calls.

Annual rules count toward the existing workspace workflow capacity: Free 2, Standard 10, Premium 25; active and paused workflows count, deleted workflows and unconfirmed drafts do not. Recheck capacity at publication under the existing workspace write lock.

## Delivery steps and review checkpoints

1. Review this UX and annual-date behavior, then build the canonical date-based service-review card and notification/customer-list stories. Review desktop/mobile layouts before runtime integration.
2. Add shared typed contracts, calendar recurrence helpers, occurrence persistence and queue adapters with current access/tenant/lifecycle boundaries. Reuse the supported email-review infrastructure.
3. Connect the approved canonical card, edit path and protected annual customer review to existing APIs and caches. Add Workflows-only assistant preparation and the automation-guide entry.
4. Verify explicit dates and clarification follow-ups; local timezone/DST and leap-year dates; next-occurrence scheduling and queue recovery; cohort deduplication and exclusions; pause/resume/edit/delete; quota/concurrency; notification actions and branded reviewed emails. Use disposable data and fake delivery; do not publish a real workflow or contact customers for diagnostics.


## Approved UX prototype checkpoint — November 24

The following records the prototype checkpoint before the connected integration described below.

The canonical `WorkflowAnnualServiceCard` exposes a first review date and send time directly on the review. Change settings edits the workflow name, any current service and notification recipient. Both channels start on, at least one must remain on, and no date is invented when missing. The first occurrence must be future in the supplied workspace-local clock; the host will recheck timezone validity, DST and current authority when runtime integration is connected. Editing labels the selected future occurrence “Next review date” and preserves a paused workflow. Read-only, expired, published, pending, cancellation and save-failure states use the same card. Calendar dates are validated without deriving UTC send instants in the browser.

Annual customer reviews compose the existing canonical service customer list, email draft drawer and email-send review. A review-date presentation mode shows To review, a shared review date, latest marked-completed evidence and existing row actions; it removes the completion-based Due date column and due-date insertion button from the annual email editor. Dismiss explicitly applies only to the current year's review. Selection resets when the host changes annual occurrences. Existing service-due callers keep their current presentation and behavior. Prototype rows adapt the current shared presentation shape only; no annual cohort is silently interpreted as a completion-based due cycle. Shared API/domain schemas and annual occurrence selection remain part of the next integration checkpoint.

The notification preview uses the real NotificationMenu, including unread count, read removal and Review customers navigation into the shared customer list. The automation guide preview uses the canonical scrollable guide and an explicit custom-date example. No new recipe is advertised in the live assistant or live automation catalog yet. Story callbacks simulate review, publication and email drafting only; no database writes, workflow publication or real emails occurred.

Review locally:
- http://127.0.0.1:6006/?path=/story/workflows-annual-service-review--review
- http://127.0.0.1:6006/?path=/story/workflows-annual-service-review--choose-custom-date
- http://127.0.0.1:6006/?path=/story/workflows-annual-service-review--change-service-and-recipient
- http://127.0.0.1:6006/?path=/story/workflows-annual-customer-review--customers
- http://127.0.0.1:6006/?path=/story/workflows-annual-customer-review--notification-to-customers
- http://127.0.0.1:6006/?path=/story/workflows-annual-service-review--automation-guide

Verification: all 57 initially selected new/shared interaction and accessibility scenarios passed, including existing completion-based reminder regressions. The additional guide and final edit/mobile/email/notification scenarios were verified after refinements. Desktop/mobile screenshots were inspected and both mobile views had no horizontal overflow. Web type checking, focused lint and whitespace checks passed. Runtime date scheduling, cohort querying, permissions and quota enforcement are deliberately not claimed by a mocked prototype and remain required integration checks.


## Connected integration — November 24

The `annual_service_review` recipe uses the approved canonical card in connected assistant publication and paused-workflow editing. Setup reuses React Query and scoped request authorization; editing fields stays local until save. The assistant must resolve a workspace service and an explicit first date/time. A yearless date resolves to the next future occurrence, while a season without a date prompts for clarification. Preparation and publication enforce current permissions and the existing workspace capacity under the workspace lock.

Migration `202611240001_annual-service-review.ts` adds annual occurrence dates, period-specific customer cycles and a separate annual email-template purpose. Existing completion-based templates retain their repeat purpose. Publication persists one next annual step through the existing transactional outbox/BullMQ path. Completion schedules the next valid annual occurrence. February 29 skips non-leap years. Ambiguous or nonexistent initial local times are rejected; invalid future clock occurrences surface an execution issue and skip to a valid occurrence. Reviews more than three hours late are skipped, and Resume schedules the next future occurrence without replaying missed reviews.

At delivery, current service, recipient, permissions and workflow status are checked again. Cohort preparation processes at most 200 customers per transaction, using reliable completed-Job evidence as of the occurrence. Partial cohorts stay hidden until ready. Matching open work and later matching completions suppress outreach; dismissed or successfully contacted rows belong only to the current review period. A completed annual review produces one staff digest with a protected Review customers action. An empty eligible cohort does not generate outreach. No customer is emailed automatically: assistant drafting, template save, recipient review and explicit send reuse the existing branded and unsubscribe-aware services. Annual templates cannot insert a completion-based Due date.

No per-workflow polling, runtime model calls, per-customer queue jobs at publication or repeated setup authentication were added. The existing bounded outbox recovery process handles queue recovery.

Verification used disposable databases, synthetic records and fake email delivery: nine annual database groups, eleven existing repeat-service/outreach groups, 198 contract/domain/agent tests, 66 shared and annual UI scenarios, an authenticated browser publication/edit/customer-list flow, and a real Redis queue rehearsal all passed. A live planner diagnostic used fictional service/date data and resolved the annual recipe correctly. Focused final UI checks cover connected publish/edit/history and annual preparation states. Web, data and worker type checks and focused lint passed.

The migration is applied locally; the web app and worker have restarted. Worker status reports ready, its maintenance scheduler present and zero failed workflow queue jobs. No real annual workflow was published or customer contacted during verification.

To try it, open Workflows and ask, for example: “Every March 15 at 9 AM, remind me to review Gutter cleaning customers.” Use a service that exists in the workspace, review the full first date, recipient and channels, and publish. Choose a near-future custom date/time to observe delivery without waiting for the example date. The staff reminder opens the compact customer review list; customer email remains a separate reviewed action.


### Annual intent recognition refinement

The service selector description now explicitly includes annual reviews, matching the recipe instructions. The current capability message also identifies chosen-date annual customer reviews as `workflows_prepare` requests independent of individual reminder/customer tools, and overrides earlier assistant refusals without expanding authority. A synthetic live planner check with all recipe choices and a prior refusal prepared November 24 at noon correctly; 109 agent/tool tests and agent type checking passed. No private saved chat or customer records were exported for this diagnostic.
