# Calendar page plan

Status: **Calendar deployed to staging with the approved complete-app release** — October 28, 2026. The October 20 decisions below supersede conflicting older Jobs-only assumptions and historical checkpoints. The schema/services are migrated locally and the live `/calendar` page is ready for review. The approved Work Order creation visit choice is connected locally with atomic shared-draft creation. Existing-record join/separate controls are connected locally. Combined in-app/email notifications and personal visit-email preferences are connected locally. Reviewed Job defaults, personal reminder preferences and deadline reminder delivery are connected locally. Job-created notifications and personal Job activity preferences are connected locally; explicit status-change and assignment-change notifications are also connected locally; completion-deadline change notifications are connected locally as well; Calendar context and scheduled/unscheduled assistant reads are connected locally; read-only availability/date suggestions and reviewed schedule/reschedule proposals with browser confirmation are connected locally; reviewed clear-schedule proposals are connected locally; approved focused-visit context is connected locally; grouped release QA and blocker fixes are complete; QLT-2 performance and repository lint pass locally. The complete current app was explicitly approved, the backup/restore and migration ledger were checked, and matching staging web/worker deployments passed bounded smoke checks. See [staging release record](calendar-staging-release.md). Production is unchanged.
Scope: the scheduling calendar (`/calendar`), scheduling a job from the calendar, the "Needs a scheduled date" queue, team availability, deadline visibility, deadline reminders and notification settings, optional Google Calendar visibility, and a schedule-aware assistant.

> Folder note: the request said "documents"; this repository's documentation folder is `docs/`, so the file lives here.

## How to use this document

Walk it top to bottom in a QA session, as we did for [customers-page-plan.md](customers-page-plan.md) and [leads-page-plan.md](leads-page-plan.md). Every requirement has an ID (`VWS-`, `SCH-`, …) and a **Decision / Status** column to fill in: `Agreed`, `Change`, `Defer`, or `Question`. Section 12 collects open questions (each with a recommendation); section 13 holds risks. Nothing here is built until a requirement is `Agreed`.

Sources: `prototype/prototype-screen-30-scheduling-calendar.html` (primary), `-31-deadline-notifications.html`, `-32-integrations.html` (Google Calendar card), `-09/-10/-12` (jobs board, table, detail), `-11-create-job.html`; [job-module-plan.md](job-module-plan.md), [user-journeys.md](user-journeys.md), [permission-catalog.md](permission-catalog.md), [application-structure-plan.md](application-structure-plan.md), [context-aware-agent-architecture.md](context-aware-agent-architecture.md), [salesmora-product-roadmap.md](salesmora-product-roadmap.md), [component-conventions.md](component-conventions.md), [chat-tools.md](chat-tools.md).

---

## October 20 agreed Calendar decisions

The walkthrough approved the following rules. These are product decisions, not claims that shared visits already exist in the database.

| Area | Agreed behavior |
|---|---|
| Calendar records | Show Jobs and Work Orders, clearly distinguished. One explicitly shared visit produces one Calendar card, with the Job and linked Work Order references. The peek exposes only records the viewer may access. Never infer shared identity from matching date, customer or assignee. |
| Linking | When creating a Work Order for a scheduled Job, require an explicit **Use Job’s visit** or **Separate visit** choice. |
| Shared schedule | Linked active records share one date/arrival window. Rescheduling is reviewed and confirmed, naming every affected record, then committed atomically. Independent record versions and permissions still apply. |
| Separation | A reviewed **Move to a separate visit** action detaches only the selected Work Order. The original visit and other records stay unchanged. |
| Authorization | Changing a shared visit requires current scheduling authority for every affected active record. Otherwise it is read-only; do not reveal unauthorized linked-record details to explain the refusal. |
| Field default | Allow scheduling only with the current grant and primary responsibility for every affected active record: primary owner for each Job and primary assignee for each Work Order. Team/crew membership alone permits authorized viewing, not scheduling. The workspace Owner can disable the scheduling permission. A reviewed policy cutover must preserve customized Owner policy decisions. |
| Closed records | Completing/canceling one linked record preserves its schedule as history. Later rescheduling affects only remaining active records; closing a Work Order never automatically closes the Job or other Work Orders. |
| Workload | Count a visit once for each distinct assigned owner/team/crew member across the linked active records. Deduplicate people by user ID. No double counting the Job and its linked Work Orders. Field receives only their permitted own-schedule projection. |
| Warnings | Warn at four or more visits per person/day and for **any intersecting** arrival windows, across all assigned people. Adjacent windows do not overlap. Exclude the visit being edited. Warnings do not block saving; arrival windows do not imply full work duration or actual availability. |
| Schedule notifications | One combined notification per affected person for a shared-visit change, containing only authorized records; skip the actor. Email follows existing per-user preferences. Reuse current Work Order notification infrastructure. |
| Free / Standard reminders | One Job completion-deadline reminder **on the due date**. Workspace-local send time is configurable, default **9:00 AM**. |
| Premium reminders | Up to **five distinct reminders**, from **365 days before through 365 days after** the deadline, plus expanded recipients (approved October 22). Keep completion deadlines distinct from scheduled visits. |
| Storage | File storage is implemented: RustFS locally and Railway buckets when deployed. Reuse existing infrastructure; storage is not a Calendar dependency to rebuild. |
| Review cadence | **One component at a time**, with Storybook approval before starting the next component. All listed components and the assembled Calendar page are approved. Continue backend integration in reviewable sections; retain individual review for any new components. |

Preserve Week-only/Monday/seven-day MVP, URL-backed range/filters, fixed arrival presets, peek-before-edit, mobile day lists and explicit assistant confirmation. No extra assistant composer: use the global launcher/modal. Keep Day/Month/Agenda, drag-and-drop, recurring/multi-day visits, estimate visits, bulk scheduling, external customer notices, ICS (Phase 1.5) and Google Calendar (Phase 2) out of this first release.

### Implementation sequence

1. Record the agreed rules and review components individually in Storybook. **Complete:** event card, toolbar, day column, week grid, visit peek drawer, scheduling dialog, filters, unscheduled list, Team Workload and assembled Calendar page approved.
2. Design the shared-visit contract/schema and additive backfill. **Complete locally:** foundation, coordinated live-service synchronization and reconciliation are implemented (see persistence and command checkpoints). Existing Job and Work Order dates remain independent unless explicitly linked; do not merge historical records by matching fields. Store shared visit identity, active record links and immutable historical schedule snapshots. Define reopen/relink behavior before implementing that lifecycle edge. Do not reset current statuses or dates.
3. **Complete locally:** scoped Calendar range/queue/workload reads. `calendar.read` and each resource’s current read permission apply before counts, filters and pagination; Work Order-only assignees must not gain full parent-Job access. Keep snapshots and model context minimal.
4. **Complete locally:** `/calendar`, navigation, URL state, Week grid, peek, queue and workload use the approved components.
5. **Complete locally:** commands, schedule/clear, new-draft joining and existing-record join/separate controls. Shared-visit commands (schedule/reschedule/clear/link/separate) are atomic domain operations that reuse existing Jobs/Work Orders validations, versions, audit and lifecycle rules. Do not perform independent HTTP writes that could partially save. Cross-surface scheduling controls and later assistant confirmations must use the same commands.
6. **Complete locally:** combined visit notifications, Job creation/status/assignment/deadline events, reminder settings/worker and personal preferences, with entitlement checks and recipient-aware idempotency. Existing Work Order notifications and file infrastructure are reused.
7. **Partially complete locally:** Calendar context, scheduled/unscheduled read operations and the approved result card are connected through the shared permission-filtered assistant. The approved availability-suggestion card is connected to complete permitted visit data. The approved schedule/reschedule card is connected to server-owned proposals and atomic all-record confirmation. Clearing and focused-visit context remain later reviewed slices. No model commit tool or SQL tool. Reauthorize all affected records at confirmation.
8. Validate DST/week boundaries, scoped visibility, shared/independent counting, partial permissions, detachment, closed history, concurrent edits, notification dedupe, keyboard/mobile behavior and query performance locally. Release approved sections to staging separately.

The historical sections below still provide the original screen and checklist detail. References to Jobs-only entries, separate per-action tools, Jobs-only schedule endpoints, exact-window-only warnings and older Field/reminder decisions must be interpreted using the agreed rules above.

## 1. Current state

| Area | Exists today | Gap |
|---|---|---|
| Prototype | Screen 30: assistant card, week grid (7 days), prev/today/next, "Schedule job" modal (job, date, optional arrival window, primary owner), "Needs a scheduled date" list, "Team availability" list, note that no external calendar is connected. Screen 31: default deadline rule, reminder offsets, send time, timezone, event table (in-app/email), recipients, Premium banner. Screen 32: Google Calendar card (demo connect/disconnect). All client-only with 8 seeded jobs, state in `sessionStorage` | Everything below |
| Jobs | Foundation contracts, lifecycle, additive migration and scoped server services are implemented/tested locally; reviewed core Jobs board/table/detail/create/action components now connected locally | Complete remaining Jobs service slices separately; Calendar range/UI and reminder wiring remain; see Q1 |
| Data / API / contracts | Shared notifications/preferences exist; job scheduling contracts/services are in the foundation slice | Calendar range API, UI, reminders and job notification integration remain |
| Permissions | Catalog defines `calendar.read` (Owner/Admin/Office W, Field S = own schedule) and `jobs.schedule.update` (Owner/Admin/Office W, Field none) | Enforce in the schedule store; resolve the conflict with the job plan (Q2) |
| Navigation | Order fixed: Home, Leads, Customers, Estimates, Jobs, **Calendar**, Reports, Campaigns. Route `/calendar` (structure plan also allows `/schedule`) | `WorkspaceNavigation` entry not routed |
| Assistant | Global shared assistant, page contexts, permission-filtered domain query/propose tools and durable explicit-confirmation cards for Leads/Customers | Add Jobs/Calendar capabilities through the same architecture, globally available |
| Worker | BullMQ retention, billing/account processing and lead notification delivery exist | Add job notification delivery and timezone-aware deadline reminders |
| Workspace timezone | `workspaces.timezone` already exists, default UTC | Validate/use existing IANA value and add reviewed settings; no duplicate timezone migration |
| Email | Template pattern exists (`server/email/templates/*` with stories) | No schedule or deadline templates |

---

## 2. Product decisions this page depends on

| ID | Statement (from existing docs) | Status |
|---|---|---|
| D-1 | **Scheduled work date** (when the team plans to do the work) is separate from the **completion deadline** (when it must be finished). The calendar edits only the scheduled date and optional arrival window | Agreed (job plan) |
| D-2 | Arrival is an optional **window** (e.g. 9–11 AM), not an exact appointment time | Agreed (job plan) |
| D-3 | Saving a scheduled date moves a job **Needs Scheduling → Scheduled**; removing it from a Scheduled job returns it to **Needs Scheduling**. Other statuses change explicitly | Agreed (job plan) |
| D-4 | Only the job's **primary owner** and org **Owners/Admins** may set, change, or remove the scheduled date or window | Agreed (job plan), **conflicts with catalog (Q2)** |
| D-5 | Calendar display checks job access and **excludes unrelated event details**; Field sees only their own schedule and entries for authorized assigned jobs | Agreed (catalog) |
| D-6 | Business days are Monday–Friday; no holiday calendars | Agreed (job plan) |
| D-7 | Notification channels are in-app and email; SMS later. Configurable multi-offset reminders and expanded recipient controls are **Premium** | Agreed (job plan) |
| D-8 | Google Calendar integration is **Phase 2** and "calendar visibility and job scheduling support"; there is no external calendar in the prototype | Roadmap |
| D-9 | The assistant proposes; the user confirms before a job moves ("You confirm before a job moves") | Agreed (prototype, agent architecture) |

---

## 3. Design and architecture

### 3.1 Routes

| Route | Purpose |
|---|---|
| `/calendar` | Calendar page (default Week view); `?view=week` (Day/Month/Agenda later), `?date=YYYY-MM-DD`, filters, `?job=<id>` opens the job peek drawer |
| `/settings/jobs/notifications` (name per settings IA) | Deadline defaults, reminders, events, recipients (prototype 31). Owned by this plan but built in its own slice |
| `/settings/integrations` | Google Calendar card (prototype 32); owned by the integrations plan, referenced here (§9) |

| API | Purpose |
|---|---|
| `GET /api/calendar` | Entries for a date range (+ filters): scheduled jobs, plus unscheduled queue and team load summary |
| `PUT /api/jobs/[id]/schedule` | Set date, window, and optionally primary owner (single transaction, `version` check) |
| `DELETE /api/jobs/[id]/schedule` | Clear date and window (job returns to Needs Scheduling per D-3) |
| `GET/PUT /api/settings/job-notifications` | Reminder rules, events, recipients |
| `GET /api/calendar/export.ics` | Optional ICS feed or download (Q12) |

### 3.2 Layering

```
packages/contracts/src/schedule.ts           zod: scheduleInput, calendarQuery, calendarEntry DTO, reminderRules
packages/data/src/                           migration, schedule store, reminder queries
apps/web/src/server/calendar/store.ts        server-only: authorize → query → DTO (scope-aware: W vs own/assigned)
apps/web/src/server/calendar/reminders.ts    rule evaluation, due-time computation
apps/worker/src/                             reminder + notification jobs (BullMQ), idempotent
apps/web/src/app/(auth)/calendar/page.tsx    server component
apps/web/src/features/calendar/              presentational + route components (see §5)
packages/ui/src/…                            only genuinely shared primitives
```

Rules: scheduling is a **Jobs-domain operation** exposed through the calendar. The calendar store calls the job service for writes so status auto-transitions, activity history, notifications and audit cannot diverge from the Jobs pages. Authorization in the store, never only in the UI. UI copy in `*.data.ts`; one kebab-case folder per component with `.tsx`, `.data.ts`, `.stories.tsx`.

### 3.3 Page layout (from prototype 30)

1. Shell with sidebar (Calendar active), breadcrumb `Jobs / Scheduling calendar` (prototype) or `Workspace / Calendar` (consistency with other pages, Q3).
2. **Shared floating assistant launcher** and existing blue modal, matching current Leads/Customers. No duplicate top composer or embedded creation assistant; calendar range/job context belongs in the shared assistant.
3. Page header: eyebrow "Operations · Schedule", H1 "Scheduling calendar", links to Jobs board and Jobs table.
4. **Toolbar**: range label, previous / Today / next, view switch (Week default), filters (owner, status), **＋ Schedule job**.
5. **Week grid**: 7 day columns (Mon–Sun), day header with date and count, event cards (service, customer · job number, arrival window or "Arrival window not set", owner avatar + name, completion deadline hint), empty-day text, today highlighted.
6. Below the grid: **Needs a scheduled date** (active jobs with no date, count tag) and **Team availability** (scheduled visits per member this week).
7. Footnote clarifying schedule vs deadline (and external calendar status).
8. **Schedule dialog**: job, scheduled work date, optional arrival window, primary owner; helper note on D-1/D-3.
9. Toast feedback.

### 3.4 Event card and drawer

Decided (Q6): card click opens a read-only job peek (customer, address, next step, deadline, status) with "Open job" and "Reschedule", so users do not lose context.

---

## 4. Data model (additive; depends on the Jobs migration)

| Item | Detail |
|---|---|
| Job columns | `scheduledDate date` (workspace-local calendar date, no time zone drift), `arrivalWindowStart/End time` nullable (or `arrivalWindow` enum/preset, Q7), `primaryOwnerId` (already a job-plan concept), `version`, `updatedAt` |
| Indexes | `(workspaceId, scheduledDate)`, `(workspaceId, primaryOwnerId, scheduledDate)`, partial index on `status = 'needs-scheduling'` |
| Schedule history | Activity row per change: old/new date, window, owner, actor, source (`ui` \| `chat` \| `system`) in the job activity table (job plan); no separate history table |
| Workspace timezone | `workspaces.timezone` (IANA) required for "today", day boundaries, reminders and display (shared with leads L1) |
| Reminder rules | `jobReminderRules(workspaceId, offsetDays int, relative 'before' \| 'on' \| 'after', enabled)`, `sendTimeLocal`, workspace setting for default deadline mode (`unset` \| `relative`, days, `business` \| `calendar`) |
| Notification events | `jobNotificationSettings(workspaceId, event, inApp bool, email bool)` and `jobNotificationRecipients(workspaceId, userId)` for extra recipients |
| Reminder dedupe | `jobReminderDeliveries(jobId, ruleId, dueOn, channel, sentAt)` unique key → worker is idempotent |
| Capacity (if Q8 yes) | Optional `jobs.estimatedDurationMinutes`; availability stays count-based otherwise |
| External calendar (Phase 2) | `calendarConnections`, `calendarEventLinks(jobId, externalEventId)`; not in MVP |
| Migration rules | Additive, nullable first; no backfill of dates; existing jobs default to Needs Scheduling |

---

## 5. Storybook plan

Conventions: literal story titles, copy from `*.data.ts`, fictional data, one folder per component, stories cover **states**.

### 5.1 Shared primitives (`packages/ui`; check before adding)

| Component | Stories |
|---|---|
| `avatar` | initials, unassigned "—", long name |
| `status-pill` | each job status (Needs Scheduling, Scheduled, In Progress, Waiting, Completed, Canceled) |
| `dialog` / `side-drawer` | default, error, loading |
| `toast` | success, error, conflict |
| `segmented-control` (view switch) | 2–4 options, disabled |
| `date-field`, `select-field` | empty, value, error, disabled |
| `empty-state` | no jobs, no results |

### 5.2 Calendar components (`apps/web/src/features/calendar/`)

| Component | Notes | Story states |
|---|---|---|
| `calendar-toolbar` | Range label, prev/Today/next, view switch, filters, Schedule job | default, week boundary, filtered, disabled (read-only role) |
| `week-grid` | 7 columns | populated, empty week, today in view, many events per day, weekend, loading, error, Field (own only), keyboard focus |
| `day-column` | Header, count, events | empty, 1, 6, overflow ("+3 more") |
| `calendar-event-card` | Service, customer, job no, window, owner, deadline | with window, no window, overdue deadline, In Progress, long text, unassigned, read-only |
| `month-grid`, `day-list`, `agenda-list` | if views agreed (Q4) | normal, dense, empty |
| `unscheduled-jobs-list` | Needs a scheduled date | 0, 1, many, with overdue deadline, loading, "Schedule" action disabled by role |
| `team-availability-list` | Visits per member | balanced, one overloaded, none, unassigned bucket |
| `schedule-dialog` | Job, date, window, owner | new, edit existing, clear schedule, validation, conflict (version), saving, server error, past date warning, owner double-booked warning |
| `arrival-window-select` | Presets (+ custom if Q7) | none, preset, custom, invalid range |
| `schedule-conflict-banner` | Owner overlap / over capacity | one, several |
| `job-peek-drawer` | Read-only job context | full, minimal (Field related), loading |
| `calendar-filters` | Owner, status, "Only mine" | default, owner list long |
| `deadline-reminder-settings` (prototype 31) | Default deadline, offsets, send time, timezone | unset mode, relative mode, 5 offsets, max offsets, invalid, Premium locked, saving |
| `notification-events-table` | Event × channel | defaults, all off warning |
| `notification-recipients` | Include me / teammates | few, many |
| Emails (`server/email/templates`) | `job-scheduled`, `job-schedule-changed`, `deadline-reminder`, `deadline-overdue` | each with/without window, to assignee, digest |

### 5.3 Assistant components (`packages/ui/src/assistant/`)

Shared with leads/customers plans (§5.3 there). Calendar-specific:

| Component | States |
|---|---|
| `schedule-draft-card` (before/after date, window, owner) | pending, confirming, confirmed, failed, expired, superseded, stale (version) |
| `schedule-results-card` (unscheduled list, week summary, open dates) | results, none, "showing 10 of 24" with open-in-calendar link |
| `availability-suggestion-card` (open dates/owners) | 3 suggestions, none available |
| `context-chip` ("Using J-1038 · Kitchen remodel", "Week of Oct 5") | removable |
| `candidate-picker` | ambiguous job / team member |

### 5.4 Full-page stories (`calendar-page.stories.tsx`, with desktop/tablet/mobile variants and `play` interactions)

Owner populated week; empty week; first-run (no jobs, hint to create a job); loading; error; schedule dialog open; edit dialog; conflict warning; unscheduled list long; Field (own only); read-only role; Office; assistant modal with schedule draft; settings page (deadline & notifications) in Premium and non-Premium.

---

## 6. Requirements checklist (QA walkthrough)

### 6.1 Access and permissions (ACC)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| ACC-1 | `/calendar` and `GET /api/calendar` require a session and `calendar.read`; else login / branded 404 | Agreed | |
| ACC-2 | Owner/Admin/Office see all scheduled jobs in the workspace; Field sees only their own schedule and assigned-job entries (counts, availability and chat included) | Agreed | |
| ACC-3 | Field never sees other members' schedules, the Team availability list, or unrelated event details; the availability card shows only "My schedule" | Agreed | |
| ACC-4 | Scheduling needs `jobs.schedule.update` **and** job access; see Q2 for who qualifies | Agreed (Q2: permission + primary-owner exception for assigned Field jobs) | Q2 |
| ACC-5 | Assigning the primary owner from the dialog also needs `jobs.assign`; without it the owner field is read-only | Agreed | |
| ACC-6 | Buttons hidden/disabled with reason when permission missing; server rejects forged calls | Agreed | |
| ACC-7 | Cross-workspace job IDs return 404; permission changes apply without re-login | Agreed | |
| ACC-8 | Archived/Canceled/Completed jobs are not schedulable and do not appear on future days (history view per Q9) | Agreed | |

### 6.2 Views and navigation (VWS)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| VWS-1 | Default **Week** view, 7 days, Monday first, as in the prototype | Agreed | Q4 (week start) |
| VWS-2 | Previous / Today / Next; label "Oct 5 – Oct 11, 2026"; **Today** returns to the current week in workspace timezone | Agreed | |
| VWS-3 | Additional views: Day, Month, Agenda list | Deferred (Day/Month/Agenda after MVP) | Q4 |
| VWS-4 | Date and view live in the URL (shareable, back-button safe); invalid params ignored | Agreed | |
| VWS-5 | Today column highlighted; "now" marker not needed (windows, not times) | Agreed | |
| VWS-6 | Day header shows date and count; empty day shows "No scheduled jobs" | Agreed | |
| VWS-7 | Event card shows service, customer · job number, arrival window or "Arrival window not set", owner avatar + name, completion deadline hint | Agreed | |
| VWS-8 | Ordering inside a day: by arrival window start, then no-window cards, then job number | Agreed | |
| VWS-9 | Overflow: a day with more than N cards collapses ("+3 more") and opens the Day view | Agreed: "+N more" opens a day popover (no Day view in MVP) | Q4 |
| VWS-10 | Which statuses render: Scheduled and In Progress (prototype). Waiting with a date? Completed history? | Agreed (Q9: Scheduled/In Progress; Waiting muted; Completed/Canceled hidden) | Q9 |
| VWS-11 | Responsive: grid becomes a vertical day list under the tablet breakpoint; dialogs become sheets | Agreed | |
| VWS-12 | Weekend columns shown always (7 days) vs hidden when empty | Agreed: all 7 columns always shown | Q4 |
| VWS-13 | Event card click/Enter opens the schedule dialog (or peek, Q6); full keyboard grid navigation | Agreed: opens the peek drawer (Q6) | |
| VWS-14 | Loading skeleton and error with retry; stale-while-refresh on week change | Agreed | |

### 6.3 Scheduling a job (SCH)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| SCH-1 | **＋ Schedule job** opens the dialog with a job picker limited to jobs the user may schedule, defaulting to Needs Scheduling jobs | Agreed | |
| SCH-2 | Fields: Job (required), Scheduled work date (required), Arrival window (optional, presets from prototype: 8–10, 9–11, 10–12, 12–2, 1–3, 2–4), Primary owner (members + Unassigned) | Agreed: fixed presets only (Q7) | Q7 for custom windows |
| SCH-3 | Saving moves a Needs Scheduling job to Scheduled; the helper text states it and that the deadline is not changed (D-1, D-3) | Agreed | |
| SCH-4 | Opening from an event card edits that job's schedule; opening from the Unscheduled list pre-selects the job; opening from an empty day pre-fills the date | Agreed | |
| SCH-5 | **Clear schedule** action (job returns to Needs Scheduling) with confirmation | Agreed | |
| SCH-6 | Past dates: allowed with a warning, or blocked (Q10) | Agreed: allowed with a warning (Q10) | |
| SCH-7 | Scheduled date after the completion deadline: warn, do not block | Agreed | |
| SCH-8 | Concurrency: `version` check; conflict dialog shows the latest values, nothing overwritten | Agreed | |
| SCH-9 | Idempotent save; double-click safe; preserves entered values on error | Agreed | |
| SCH-10 | Each save writes a job activity entry (old → new date/window/owner, actor, source) and fires `scheduled-date changed` notification (§8) | Agreed | |
| SCH-11 | Moving the job via drag-and-drop between days | Deferred (Q5) | Q5 |
| SCH-12 | Create a job from the calendar ("＋ New job") | Deferred (Q11) | Defer? Q11 |
| SCH-13 | Scheduling jobs that are In Progress/Waiting: allowed; status unchanged | Agreed | |
| SCH-14 | Recurring or multi-day jobs | Out of scope (Q13) | Out unless Q13 |
| SCH-15 | Time zone: dates are workspace-local calendar dates; no UTC drift across DST | Agreed | |

### 6.4 Needs-a-date queue and availability (UNS / AVL)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| UNS-1 | "Needs a scheduled date" lists active jobs without a date (Needs Scheduling, plus statuses that need one per Q9) with count tag, customer, job number, owner, deadline | Agreed | |
| UNS-2 | Each row has Schedule action; overdue or soonest deadlines sort first | Agreed | |
| UNS-3 | List is capped (10) with "View all in Jobs" filtered link | Agreed | |
| UNS-4 | Field sees only their assigned unscheduled jobs, with Schedule only if D-4/Q2 allows | Agreed | |
| AVL-1 | "Team availability" shows scheduled visits per member for the visible week; Unassigned bucket included | Agreed | |
| AVL-2 | Clicking a member filters the grid | Agreed | |
| AVL-3 | Overlap/overload warning in the dialog when the owner already has N visits that day or an overlapping window | Agreed: warn at 4+ visits/person/day or any intersecting windows; adjacent windows do not overlap (October 20) | Q8 |
| AVL-4 | Capacity (hours/visits per day), working hours, time off | Deferred (Q8) | Defer/Q8 |
| AVL-5 | Suggest open dates for a job/owner (assistant and dialog) | Agreed (count-based open dates) | Q8 |

### 6.5 Filters (FLT)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| FLT-1 | Filters: owner (members, Unassigned, Me), status, customer search | Agreed | |
| FLT-2 | "Only mine" toggle (default on for Field, off for others) | Agreed | |
| FLT-3 | Filters apply to grid, queue, availability and ICS export; shown as chips; Clear all | Agreed | |
| FLT-4 | Filters live in the URL | Agreed | |

### 6.6 Deadlines on the calendar (DLN)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| DLN-1 | Completion deadline appears on the event card as a hint (prototype), highlighted if overdue | Agreed | |
| DLN-2 | Deadlines as **their own calendar markers** on the due day, distinct from scheduled visits | Deferred to a later slice (Q14) | Q14 |
| DLN-3 | Deadlines are not editable from the calendar; edited on the job (only primary owner and Owner/Admin per job plan) | Agreed | |
| DLN-4 | "Deadlines coming up" semantics follow the configured reminder offsets (job plan), not a fixed window | Agreed | |

### 6.7 Reminders and notification settings (NTF)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| NTF-1 | Settings page per prototype 31: default deadline (unset or relative N days, business/calendar days), offsets before and on/after deadline, send time, business timezone | Agreed | |
| NTF-2 | Events table: lead-to-job creation, status change, assignment change, scheduled-date change, deadline change, approaching deadline, overdue; in-app and email toggles | Agreed | |
| NTF-3 | Recipients: assigned job team by default; admins can add others (including themselves) | Agreed | |
| NTF-4 | Premium gating: multi-offset reminders and expanded recipients; Free/Standard get one default reminder rule (Q15) with the Premium preview banner | Agreed (Q15: one fixed default reminder when not Premium) | |
| NTF-5 | "Review & save" shows a summary of rules before saving; assistant can propose changes (draft card) | Agreed | |
| NTF-6 | Worker evaluates rules daily/at send time in the workspace timezone; one delivery per job × rule × due date × channel × recipient (idempotent) | Implemented locally | Minute sweep, same-local-day recovery, recipient/generation/semantic-offset unique key; provider idempotency; SMTP crash caveat below. |
| NTF-7 | Reminders stop when the job is Completed/Canceled or the deadline changes; a changed deadline re-plans reminders | Implemented locally | DB generation trigger; current state rechecked at delivery. Reviewed reopen starts a new generation. |
| NTF-8 | Reminder content: authorized Job number/title, deadline, timing/date/timezone and scoped links; no address/notes/contact details | Approved template; connected locally | October 26 template approval supersedes the historical customer-name inclusion. No customer details or roster in reminder email. |
| NTF-9 | Scheduled-date changes notify the job team, skipping the actor | Agreed | |
| NTF-10 | Per-user opt-out for email; in-app always on (follows leads E3). Lives on the shared per-user notification preferences surface (see leads §8.1, shared surface note); the workspace-level settings page does not hold it | Implemented locally | Separate deadlineReminderEmail preference; current Job read scope before counts, paging and mark-read. |
| NTF-11 | Bulk changes produce one digest per recipient (follows leads E2) | Agreed | |
| NTF-12 | Email follows the privacy/messaging baseline and existing template pattern, each with a Storybook story | Agreed | |

### 6.8 External calendar and export (EXT)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| EXT-1 | MVP: **no external calendar**; page footnote states it (prototype) | Agreed: no external calendar in MVP | |
| EXT-2 | Phase 2: Google Calendar **read** context (busy blocks) in the dialog's conflict check; connector entitlement-gated | Phase 2 (Q12) | Q12 |
| EXT-3 | Phase 2: write scheduled jobs to a chosen Google calendar; one-way, idempotent via `calendarEventLinks`; opt-in per user/workspace | Phase 2 (Q12) | Q12 |
| EXT-4 | ICS subscription/download of the viewer's scoped schedule; token URL revocable; no PII beyond job title/customer/city | Phase 1.5 (Q12) | Q12 |
| EXT-5 | Calendar export (CSV) of the visible range | Dropped: ICS only (Q19) | Defer? |

### 6.9 Quality attributes (QLT)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| QLT-1 | Accessibility WCAG 2.2 AA: grid semantics, labelled controls, focus management in dialogs, keyboard alternatives, live regions for week changes | Agreed | |
| QLT-2 | Performance: week query P95 < 300 ms at 10k jobs; index/`EXPLAIN` checks | Agreed; local target met October 28 | Owner 129.35 ms / Field 79.88 ms read-service P95 after safe visit-range selection. See [release QA](calendar-release-qa.md) for baseline and final measurements. |
| QLT-3 | Date correctness tests: DST transitions, week boundaries, workspace-timezone "today" | Agreed | |
| QLT-4 | Security: scope in SQL, no event detail leakage for Field, tokenised ICS, injection-safe email templates | Agreed | |
| QLT-5 | Privacy: bounded fields to the model and emails; customer contact data not in reminder emails | Agreed | |
| QLT-6 | Copy in `*.data.ts`; terminology "Scheduled work date", "Arrival window", "Completion deadline" used consistently | Agreed | |
| QLT-7 | Failure handling: retry, preserved form input, partial failure messages | Agreed | |

---

## 7. Component and data flow

```
page.tsx (server) ─authorize─▶ calendarStore.range(viewer, from, to, filters)
        │                               │
        ▼                               ▼
 CalendarRoute (client) ◀── entries + queue + availability DTO (zod)
        │ prev/next/view/filters → URL → refetch GET /api/calendar
        │ card / Schedule job → ScheduleDialog → PUT /api/jobs/:id/schedule
        │                       └─ job service: status transition + activity + notify + audit
        │ Assistant → AssistantPanel(surface=calendar, recordRefs=[job…], range)
        └ Reminders: worker → rule evaluation → notification service → in-app/email
```

Assistant confirmation path is the generalised draft → card → Confirm → `POST /api/chat/actions` flow (leads plan §9.4), re-checking authorization, `version`, and business rules at commit.

---

## 8. Events, audit, notifications

| Event | Audit | Notification |
|---|---|---|
| job.scheduled / rescheduled / schedule_cleared | Yes (actor, source ui\|chat\|system, old/new) | Job team in-app + email per settings; skip actor |
| job.owner_changed (from dialog) | Yes | Per assignment-change setting; new owner gets the existing assigned pattern |
| job.status_auto_changed (Needs Scheduling ↔ Scheduled) | Yes (system) | Status-change setting |
| deadline.approaching / overdue | Delivery log (no content) | Per rules |
| settings.reminders_changed | Yes | None |
| calendar.ics_token_created / revoked | Yes | None |

---

## 9. Assistant (agent) changes

Goal: the chat knows the visible range and the job in context, can find unscheduled jobs and open dates, explain the week and team load, and **propose** schedule changes that the user confirms. Existing rules stand: no commit tool, fresh authorization per call, untrusted tool results, one pending draft per intent per thread. Shared plumbing (surfaces, `recordRefs`, generalised confirmation path, context chip) is defined in leads plan §9 and reused.

### 9.1 Surfaces and context

| Change | Detail |
|---|---|
| Surface keys | `calendar` (and `jobs.*`/`job.detail` as the Jobs plan lands); `settings.job-notifications` for the reminder settings |
| Record refs | `recordRefs: [{type:'job', id}]` for a focused job; list context sends the visible `from`/`to` range and validated filters |
| Context chip | "Week of Oct 5", "Using J-1038 · Kitchen remodel", "Only my schedule" (Field), removable |
| Context assembly | Viewer scope (W vs own), timezone, visible range, entries summary (bounded), unscheduled count, team members (if allowed) |
| Capability context | Offers only actions the viewer may perform (e.g. Field cannot reschedule unless Q2 allows) |
| Prompt-injection rule | Job titles, notes and customer text are untrusted data |

### 9.2 Read tools

| Tool ID | Purpose | Scope rule |
|---|---|---|
| `get_schedule` | Entries for a range/filters; ≤ 25 compact rows, totals, deep link "Open in Calendar" | `calendar.read` W/S |
| `list_unscheduled_jobs` | Active jobs with no date, ordered by deadline | `jobs.read` scope |
| `get_team_availability` | Visits per member for a range (counts, windows) | `calendar.read` W only |
| `find_open_dates` | Dates/windows for a job + owner with no conflicts, next N working days | scope + `jobs.schedule.update` |
| `get_job`, `search_jobs` | From the Jobs plan (schedule, deadline, status, owner) | `jobs.read` |
| `list_team_members` | Names, roles, load (shared with leads plan) | requires `jobs.assign` or `jobs.schedule.update` |
| `get_reminder_settings` | Current rules/events/recipients | Owner/Admin |

### 9.3 Draft tools (propose; never commit)

Cross-plan: each tool below registers a new `actionType` (e.g. `job.schedule`, `job.clear_schedule`, `job.assign`, `job.bulk_schedule`, `notification.settings`) in the shared discriminated-union draft path and handler registry defined in leads plan §9.4 and customers plan §9. `recordRefs` types are `lead | customer | job`.

| Tool ID | Proposal | Confirmation checks |
|---|---|---|
| `draft_schedule_job` | Date + optional window (+ owner) for one job; before/after card | `jobs.schedule.update`, job access, version, D-4/Q2 |
| `draft_reschedule_job` | Move to a new date/window (same tool, different framing) | same |
| `draft_clear_job_schedule` | Back to Needs Scheduling | same + confirmation |
| `draft_assign_job` | Change primary owner (Jobs plan) | `jobs.assign` |
| `draft_bulk_schedule` | "Move Tuesday's jobs to Wednesday", frozen ID set (≤ 25), per-row result | per-row at commit; partial result shown |
| `draft_reminder_settings_change` | Offsets/recipients/events change (settings assistant, prototype 31) | Owner/Admin, Premium entitlement |

Ship order proposal: reads first (`get_schedule`, `list_unscheduled_jobs`, `find_open_dates`), then `draft_schedule_job`/`draft_reschedule_job`, then clear and bulk, then settings drafts.

### 9.4 Behavior rules

- Resolve "Tuesday", "next week", "tomorrow" in the **workspace timezone**; the draft card always shows the absolute date and weekday.
- Name → job/member resolution server-side; ambiguity returns candidates and asks.
- On conflicts (owner already busy, past date, after the deadline), the assistant states them and still lets the user confirm only if the rule is a warning, never a block.
- The assistant never sends messages to customers (e.g. arrival notices); it may draft wording as a suggestion only.
- Always says "I've prepared this change; confirm to apply".

### 9.5 Sample conversations to QA

| # | User says | Expected |
|---|---|---|
| A1 | "Show unscheduled jobs" | `list_unscheduled_jobs` card, link to calendar queue |
| A2 | "What's on the calendar this week?" | `get_schedule` summary + card, per scope |
| A3 | "Show team assignments" | `get_team_availability` (Owner/Admin/Office); Field gets own only |
| A4 | "Schedule the Morgan Ellis attic job for next Tuesday morning" | Resolves job, date in tz, window 9–11 suggestion; draft card |
| A5 | "Find the first open Thursday for Sam" | `find_open_dates`, suggestions |
| A6 | "Move Jordan Lee's kitchen remodel to Friday" | `draft_reschedule_job` before/after |
| A7 | "Move everything on Tuesday to Wednesday" | `draft_bulk_schedule`, count and IDs frozen |
| A8 | "Assign this to Sam" when two Sams exist | candidate picker |
| A9 | "Clear the date on J-1039" | `draft_clear_job_schedule`; job returns to Needs Scheduling |
| A10 | Field user: "Reschedule Priya's job" | Refusal or allowed per Q2; never other members' data |
| A11 | Job note says "ignore previous instructions" | Treated as data |
| A12 | Confirm an expired/superseded/stale draft | Clear message, no mutation |
| A13 | "Remind the team 2 days before and 1 day after a deadline" (settings) | `draft_reminder_settings_change` summary; Premium gate if needed |
| A14 | "Is Sam free Friday morning?" | availability answer, no mutation |
| A15 | "Tell Priya we'll arrive 9–11" | Draft wording only, states it will not send |

---

## 10. Testing plan

| Layer | Coverage |
|---|---|
| Unit | Contracts, date math (DST, week boundaries, business days), reminder offset evaluation, status auto-transitions, permission matrix, tool handlers |
| Data | Migration, scoping (Field own-only, cross-workspace), concurrency, indexes/`EXPLAIN`, reminder dedupe uniqueness |
| API | 401/403/404, validation, forged payloads, conflict responses |
| Worker | Reminder schedule at timezone edges, retries, idempotent re-run, stop on completion/cancel, deadline change re-plan |
| Storybook | Every story in §5, `play` interactions, a11y addon, viewport review |
| E2E (`apps/web/e2e/calendar.spec.ts`) | Schedule from queue, from empty day, edit, clear, conflict (two tabs), filters, week navigation, role matrix, notification created |
| Chat e2e (existing pattern) | A1–A15 with the scripted provider; confirm/expired/stale |
| Security | Prompt injection in job text, IDOR, ICS token handling |
| Performance | Seed 10k jobs; week query timing |

---

## 11. Delivery sequence (one reviewed slice at a time)

0. **Dependency gate**: Jobs foundations (job table, statuses, activity, primary owner) and the workspace `timezone` field exist, or are delivered with slice 1 (Q1).
1. Contracts, migration, schedule store, permission wiring, nav entry.
2. Storybook primitives and calendar components on fixtures (a11y gate).
3. Week view, read API, toolbar, URL state, empty/loading/error.
4. Schedule dialog, write API, status auto-transition, activity.
5. Needs-a-date queue and team availability, filters.
6. In-app/email notifications for schedule changes (templates + stories).
7. Reminder settings page and worker (deadline rules, Premium gating).
8. Assistant: surfaces/refs → reads → schedule drafts → bulk → settings drafts.
9. Optional views (Day, Month, Agenda), drag-and-drop (Q4, Q5).
10. Phase 2: Google Calendar read/write and ICS (Q12).
11. Hardening: performance, a11y audit, e2e matrix, docs (`docs/calendar.md`, `permission-catalog.md`, `chat-tools.md`).

---

## 12. Open questions (decide in QA)

| # | Question | Options / recommendation | Decision |
|---|---|---|---|
| Q1 | Jobs module does not exist. How do we sequence? | Build the Jobs foundations first (create/board/detail), then Calendar slice 1 (**recommended**) / ship scheduling columns with Calendar and build Jobs UI later / calendar with sample data only | **Decided:** Jobs foundations (create/board/detail) first, then Calendar slice 1. |
| Q2 | Who may schedule? Job plan: primary owner + Owner/Admin. Catalog: `jobs.schedule.update` for Owner/Admin/Office, none for Field | Update the catalog to match: Owner/Admin/Office via permission, plus a primary-owner exception for assigned Field jobs (**recommended**) / catalog wins (Field never schedules) / job plan wins (Office cannot) | **Decided:** Owner/Admin/Office via `jobs.schedule.update`, plus a primary-owner exception for assigned Field jobs; update `permission-catalog.md` to match. |
| Q3 | Breadcrumb and parent: `Jobs / Scheduling calendar` (prototype) or `Workspace / Calendar` | Workspace / Calendar for consistency with the nav (**recommended**) | **Decided:** Workspace / Calendar. |
| Q4 | Views and week start | Week only in MVP, Monday start, 7 days (**recommended**); Day/Month/Agenda later; hide empty weekends? | **Decided:** Week only, Monday start, 7 days; Day/Month/Agenda later. |
| Q5 | Drag-and-drop rescheduling | Defer; dialog and assistant only in MVP, keyboard-accessible alternative required when added (**recommended**) | **Decided:** Deferred; dialog and assistant only in MVP (keyboard-accessible alternative required when added). |
| Q6 | Card click: schedule dialog (prototype) or read-only peek first | Peek drawer with Reschedule and Open job (**recommended**) | **Decided:** Peek drawer with Reschedule and Open job. |
| Q7 | Arrival windows | Fixed presets only in MVP (**recommended**) / allow custom start–end | **Decided:** Fixed presets only in MVP. |
| Q8 | Availability depth | Count-based visits per day, warn at 4+ per member and exact window overlap (**recommended**); no hours/time off | **Decided:** Count-based distinct visits per person/day; warn at 4+ and any intersecting windows; adjacent windows do not overlap. Shared records and duplicate crew assignments count once (October 20). No hours/time off. |
| Q9 | Which statuses appear on the grid; completed history | Scheduled and In Progress on the grid (prototype); Waiting with a date shown muted; Completed/Canceled hidden (**recommended**) | **Decided:** Scheduled and In Progress on grid; Waiting with a date muted; Completed/Canceled hidden. |
| Q10 | Past dates | Allow with a warning (data entry after the fact) (**recommended**) / block | **Decided:** Allowed with a warning. |
| Q11 | Create a job from the calendar | Defer; Jobs owns creation (**recommended**) | **Decided:** Deferred; Jobs owns creation. |
| Q12 | Google Calendar / ICS | MVP none (prototype footnote); ICS download for the viewer in Phase 1.5; Google read+write Phase 2 (**recommended**) | **Decided:** No external calendar in MVP; ICS download Phase 1.5; Google read+write Phase 2. |
| Q13 | Multi-day or recurring jobs | Out of scope; single scheduled date per job (job plan) (**recommended**) | **Decided:** Out of scope; single scheduled date per job. |
| Q14 | Deadline markers on the grid | Show a small deadline marker on the due day (filterable) in a later slice; cards show the hint now (**recommended**) | **Decided:** Cards show the hint now; deadline marker on the due day (filterable) in a later slice. |
| Q15 | What do non-Premium plans get? | One fixed default reminder (e.g. on due date) and default recipients; Premium unlocks multi-offset and expanded recipients (**recommended**) | **Decided:** Free/Standard: one on-due-date reminder at workspace-local configured time (default 9:00 AM); default recipients. Premium: multi-offset and expanded recipients (October 20). |
| Q16 | Reminder send time and timezone | Workspace timezone, send time configurable (default 9:00 AM) (**recommended**) | **Decided:** Workspace timezone; send time configurable, default 9:00 AM. |
| Q17 | Customer-facing notices (arrival window) | Out of scope; assistant can draft wording only (**recommended**) | **Decided:** Out of scope; assistant can draft wording only. |
| Q18 | Does the page assistant card open the shared modal? | Yes, as agreed for Customers Q4 (**recommended**) | **Updated October 19:** use the existing global floating launcher/modal; no extra top assistant card, following the current Customers implementation. |
| Q19 | Calendar export | ICS only; no CSV (**recommended**) | **Decided:** ICS only; no CSV. |
| Q20 | Estimates site visits (estimate screens 33–34) on the calendar | Not in MVP; revisit when the estimates module lands (**recommended**) | **Decided:** Not in MVP; revisit with the estimates module. |

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Calendar blocked by the missing Jobs module | Dependency gate (§11 step 0, Q1); fixtures in Storybook unblock UI work |
| Permission mismatch between job plan and catalog | Resolve Q2 first; one permission table and tests |
| Date/timezone bugs (DST, week boundaries) | Store local calendar dates; central date helpers; dedicated tests (QLT-3) |
| Schedule vs deadline confusion | Consistent labels, helper text, separate fields and markers (D-1) |
| Duplicate or missed reminders | Idempotent delivery table, worker retries, stop conditions (NTF-6, NTF-7) |
| Field users seeing others' schedules | Scope in SQL, DTO minimisation, two-user tests |
| Assistant moving work without consent | Draft/confirm only, version check, audit `source: chat` |
| Overloading the page (views, drag-and-drop, integrations) | Defer per Q4, Q5, Q12 |
| Notification noise | Defaults conservative, per-user opt-out, digests for bulk |
| Prototype drift | Build stories from prototypes 30 and 31 and review before wiring data |

---

## 14. Acceptance summary (definition of done)

- Every `Agreed` requirement in §6 is implemented, tested, and has a Storybook state.
- Role matrix verified (Owner, Admin, Office, Field) in unit, API and e2e tests; Field only ever sees their own schedule.
- Scheduling a job moves it between Needs Scheduling and Scheduled correctly and writes activity and notifications.
- Reminders fire once per job × rule × due date in the workspace timezone.
- Assistant scenarios A1–A15 pass against the scripted provider; a live-model smoke check is run once.
- Docs updated: `permission-catalog.md`, `chat-tools.md`, `application-structure-plan.md`, a new `docs/calendar.md`.
- Lint, typecheck, vitest, Playwright and Storybook build pass.


## Jobs foundation checkpoint — October 19, 2026

The local backend foundation is implemented and validated; see [Jobs foundation](jobs.md) and [Jobs plan](job-module-plan.md#verified-foundation-checkpoint--october-19-2026). The existing workspace timezone is reused. The single shared job mutation service already handles scheduled work date/arrival window separately from completion deadline, automatic Needs Scheduling/Scheduled transitions, current permissions and Field primary ownership. This is not a completed Calendar range API, page, reminder engine or chat tool.

The first JobStatusBadge is ready for Storybook review. Continue job cards, board/table, creation/review and detail components one at a time; then protected UI/API/notification/assistant integration and Calendar components. Keep the Field default-policy cutover explicit before activation. No staging deployment or historical job backfill occurred.


### Jobs component review workflow update — October 19, 2026

JobStatusBadge is approved. The user explicitly replaced one-at-a-time Jobs component review with a batch review of all remaining components before connection. The [Jobs review gallery](http://127.0.0.1:6006/?path=/story/jobs-reviewgallery--default) and [review index](jobs-components-review.md) collect the previews. Jobs/Calendar live feature gates are unchanged. Finish review and integration of Jobs before Calendar range UI/API and reminders; this batch does not claim the Calendar page has been built.

## First Calendar component — October 20, 2026

`Calendar/CalendarEventCard` is a fictional presentational preview for Job-only, Work Order-only and shared visits. It reuses the existing Job/Work Order status badges and calls only an injected open-peek callback. Additional states cover multiple Work Orders/duplicate crew, Field-scoped/read-only, Waiting, In Progress, missing arrival window, overdue deadline, unassigned, long content and keyboard activation. It does not create a peek drawer, authorize data, write schedules, add routes, migrate data or deploy. Event card approved by the user; continue with the toolbar only.

Validation for the first component: 13 stories × 3 widths (1440/768/320), all 39 interaction/accessibility/overflow checks passed, including keyboard focus/activation. Web typecheck, affected ESLint and Storybook production build passed. Wide shared-visit and narrow long-content screenshots were visually inspected. No live Calendar route, schema change or staging deployment. Review: [Calendar event card](http://127.0.0.1:6006/?path=/story/calendar-calendareventcard--default).

## Calendar toolbar review — October 20, 2026

The user approved `Calendar/CalendarEventCard`. The next single component is `Calendar/CalendarToolbar`: Monday–Sunday range, Previous/Today/Next, server-supplied workspace-local Today, timezone label, optional scope label, and permission-aware Schedule visit callback. Week is a passive label; unimplemented view choices are not shown. Read-only users can navigate, with an explained disabled scheduling action. Loading and cross-year/leap-year/keyboard states are included. Date helpers use UTC only as arithmetic over local calendar-date strings; they never infer the workspace date from the browser clock. Filters and the grid remain separate future components. This Storybook controller changes fictional state only; no Calendar route, dialog, database or staging changes. Await toolbar approval before starting the next component.

Toolbar validation: all 27 story/viewport interaction, Axe accessibility, keyboard-focus and overflow checks passed (9 stories at 1440/768/320 px), along with 3 local-date boundary tests, web typecheck, affected lint and Storybook production build. Wide and narrow screenshots were visually reviewed. Review [Calendar toolbar](http://127.0.0.1:6006/?path=/story/calendar-calendartoolbar--default). No live Calendar API/page, schema or deployment changes.

## Calendar day column review — October 20, 2026

The user approved `Calendar/CalendarToolbar`. The next single component is `Calendar/CalendarDayColumn`, composing the already approved visit cards. It shows the workspace-local day, Today marker, distinct visit count, optional permitted Schedule visit callback, and empty/read-only/weekend states. Arrival windows sort before unset windows with stable record-number ordering. Three cards are visible initially; **+N more visits** opens an accessible day popover containing all authorized visits (not a new Day view), with Escape/Close and focus return. Shared Job/Work Order records remain one card and one count; only identical explicit visit IDs are deduplicated. The component consumes already scoped data and injected callbacks only. No live page/API, scheduling dialog, schema or staging changes. Await approval before the next component.

Day-column validation: 11 stories across 1440/768/320 px (33 distinct interaction/accessibility/layout checks) passed. Native browser keys additionally verify opening, Escape dismissal, focus restoration and a visible outline; the open popover passes Axe at all three widths. The Storybook keyboard assertion waits for the opening transition. Narrow popover inspection found and corrected a max-width override; all 6 affected busy-day/keyboard combinations were rechecked. Web typecheck, affected lint and Storybook production build passed. Review [Calendar day column](http://127.0.0.1:6006/?path=/story/calendar-calendardaycolumn--default), including the Busy Day overflow state. Stop here for component approval.

## Calendar week grid review — October 20, 2026

The user approved `Calendar/CalendarDayColumn`. The next single component is `Calendar/CalendarWeekGrid`, composing seven approved day columns and visit cards. It normalizes the workspace-local selected date to Monday, keeps all seven days including weekends, highlights Today when in range, and displays one count per distinct explicit visit ID. Out-of-range entries are ignored. At desktop/tablet sizes the seven-column layout has a named, keyboard-focusable horizontal scroll region to preserve readable cards; below the tablet breakpoint the same days become a vertical list. Day groups support Left/Right, Home/End and Down to the first control, alongside normal Tab navigation; semantic day sections/native controls are used rather than an incomplete ARIA grid. Empty, loading, error/retry, Field-scoped, read-only, dense, year-boundary and DST-week stories use fictional data. Loading/error do not display stale visit cards. No live Calendar route/API, scheduling dialog, schema or staging changes. Await week-grid approval before starting the next component.

Week-grid validation: all 48 checks passed (12 stories at 1440/1024/768/320 px), including interaction, Axe accessibility, keyboard focus, overflow and explicit day-column layout assertions. Seven columns begin at the established 900 px breakpoint; narrower screens show a vertical list. The loading scroll region is keyboard-focusable. Web typecheck, affected lint and Storybook production build passed. Desktop, horizontally scrolling tablet and mobile screenshots were visually inspected. Review [Calendar week grid](http://127.0.0.1:6006/?path=/story/calendar-calendarweekgrid--default). Stop here for approval.

## Compact Calendar cards — October 21, 2026

The user requested two card states to make vertically stacked visits easier to scan. CalendarEventCard now starts compact, showing only the visit title and deduplicated assigned people (or Unassigned). Activating the summary expands the existing customer, arrival window, record references/statuses, waiting/deadline and read-only details inline; activating it again collapses them. The assigned people remain visible in the summary in both states. Expansion does not invoke the peek callback or write data. A separate View visit details action inside the expanded card retains the existing injected peek callback. Summary controls expose expanded state and work with Enter/Space. Multiple cards can expand independently.

The same shared component updates CalendarDayColumn, its all-visits popover and CalendarWeekGrid automatically. Existing three-card overflow behavior remains. Detailed Storybook fixtures remain available, alongside compact, expanded and long-content states. This is a revision to the current component slice; no new Calendar component, live route, database change or deployment. Await approval of the revision before continuing.

Revision validation: 104 card/day-column story/viewport combinations passed, plus all 48 week-grid combinations after targeted rechecks, at 1440/1024/768/320 px. Coverage includes compact/expanded toggle, Enter/Space, independent expansion, explicit peek callback, permission-scoped fixtures, overflow popover, Axe, visible keyboard focus and responsive geometry. A screen-reader-only label needed a positioned summary container to prevent tablet document overflow; the affected week states were rechecked. One DST check interrupted by the development preview reloading during a production build passed on rerun at all four widths. Web typecheck, affected lint and the final Storybook production build passed. Compact week-grid and compact/expanded narrow card screenshots were visually inspected. Review the updated [week grid](http://127.0.0.1:6006/?path=/story/calendar-calendarweekgrid--default) and [expanded event card](http://127.0.0.1:6006/?path=/story/calendar-calendareventcard--expanded).

## Calendar review checkpoint — October 21, 2026

The user approved the compact/expanded event-card revision and week-grid composition. Next proposed single component: CalendarVisitPeekDrawer, adapting the historical Job-only peek to Job, Work Order and explicitly shared visits. It will show only authorized record summaries, customer/location, schedule, deadline and assigned people, with links to accessible records and a permission-aware Reschedule callback. Start with fictional Storybook states and approval; do not connect live data or build the scheduling dialog in this slice.

## Calendar visit peek drawer review — October 21, 2026

`Calendar/CalendarVisitPeekDrawer` now reuses the existing SideDrawer modal shell with trapped/restored focus, backdrop/Escape dismissal and a scrollable content area. It presents already-authorized customer/location, workspace-local scheduled date and arrival window/timezone, deduplicated assigned people, completion deadline, next step and linked record summaries with existing Job/Work Order status badges. Open-record actions and Schedule/Reschedule use injected callbacks only. Shared-visit copy explains that all affected active records must be reviewed. Scheduling is disabled with a generic explanation when the supplied visit capability or callback is unavailable; it does not infer authority from displayed records. Loading/error hide stale visit data and scheduling actions, and retain dismissal/retry behavior.

Twelve fictional Storybook states cover shared, Job-only, Work Order-only, Field-scoped/minimal, read-only, unscheduled/unassigned, Waiting, overdue, long content, loading, error/retry and keyboard open/close. The existing week-grid callback is not connected yet; this slice builds the drawer only, without adding a scheduling dialog, page/API, schema or deployment. Await component approval before continuing.

Visit peek validation: all 36 story/viewport combinations passed (12 states at 1440/768/320 px), with interaction, Axe and document overflow checks after the drawer’s opening transition settles. Native browser keys additionally verify Tab/Shift+Tab focus trapping, Escape dismissal and focus restoration. Web typecheck, affected ESLint and the Storybook production build passed. Wide shared/long-content and narrow shared/long-content layouts were visually inspected. Review [Calendar visit peek drawer](http://127.0.0.1:6006/?path=/story/calendar-calendarvisitpeekdrawer--default). Stop for approval before the next component or live integration.

## Calendar scheduling dialog review — October 21, 2026

The user approved CalendarVisitPeekDrawer. The next single component, Calendar/CalendarScheduleDialog, reuses the existing JobDialog shell used by Job and Work Order scheduling. It consumes already-authorized visit snapshots, fixed arrival-window presets and workspace-local dates. Selecting a visit, choosing a date/window and then Review changes reveals the old/new schedule and every visible affected active record before a separate confirmation. Schedule clearing has its own review/confirmation. Already closed records are excluded from the affected list and preserve their historical schedule. Assignments and completion deadlines are not changed here; existing assignment controls remain on resource pages. An empty-day initial date can prefill the chosen schedule.

The supplied canReschedule capability must cover every affected active record, including records not exposed to the viewer; the component never infers authority from the visible list. Drafts carry an opaque snapshot revision for the future live integration; no server contract is introduced. Target/revision changes and a new open session reset the editing state. Past-date/deadline advisories are nonblocking; supplied workload/overlap advisories are displayed only when visit, revision, date and window match the current draft. The parent can refresh advisories through the injected draft-change callback. Conflict blocks submission pending an explicit reload; errors preserve entries, and the modal shell guards in-flight submissions/dismissal.

Eighteen fictional stories cover shared/default, review, new visit, Work Order-only, clear review/confirmation, read-only, Field-scoped, closed history, warnings/stale advisories, missing date, server error, version conflict, saving, no targets, keyboard, allowed past date and failed-confirmation recovery. The peek, calendar grid and live data are not wired in this slice. Detaching a Work Order into a separate visit and shared-visit persistence remain separate work; this dialog performs no database writes or deployment. Pause for component approval before the next slice.

Scheduling-dialog accessibility follow-up: the reused JobDialog Close action now resists flex shrinking on narrow screens. Its paper is programmatically focusable during normal editing (rather than part of the regular Tab order), fixing a focus loop in the current MUI focus trap. While busy, when all controls are disabled, the paper becomes keyboard-tabbable and has a visible focus ring so long dialog content remains scrollable. The correction also applies to existing Job/Work Order dialogs; representative existing scheduling states are included in regression checks.

Scheduling validation: all 54 distinct story/viewport combinations passed after targeted rechecks (18 stories at 1440/768/320 px), including review-before-confirm, clear payload, error/draft preservation, version conflict, read-only and Field projections, historical-record exclusion, candidate-specific advisory invalidation, native keyboard focus trapping/restoration, busy-state dismissal protection, Axe and overflow. Fifteen representative existing Job/Work Order story/viewport combinations also passed; the 6 busy-state combinations were rechecked after the final shared-shell correction. Web typecheck, affected lint and final Storybook production build passed. Wide review and narrow edit/review/clear layouts were visually inspected. Review [Calendar scheduling dialog](http://127.0.0.1:6006/?path=/story/calendar-calendarscheduledialog--default) and its [Review state](http://127.0.0.1:6006/?path=/story/calendar-calendarscheduledialog--review). Stop for approval; live wiring remains pending.

## Calendar filters review — October 21, 2026

The user approved CalendarScheduleDialog. The next single component, Calendar/CalendarFilters, composes the existing FilterBar and removable FilterChip controls. Assigned person includes Me, Unassigned and already-scoped teammates; the Only mine switch and Me selection share one value so contradictory filters cannot occur. An own-schedule scope, derived from server authority rather than the role name, locks Me/Only mine on and hides other teammate options. Clearing optional filters never removes that access scope, which is presented separately from removable chips.

Record type supports Jobs, Work Orders or both. Status options use existing resource-specific labels and exclude completed/canceled records from this active scheduling filter; Needs Scheduling/Draft also serve the future unscheduled queue. Switching resource type clears an incompatible status; removing the type chip can keep a valid resource-qualified status. Shared visits must match record type/status on the same linked record and remain counted once when queries are connected. Customer search is controlled (200-character limit), with search debounce and URL synchronization reserved for the page. Unavailable teammate/status values normalize to supported options; duplicate teammates are deduplicated by ID. The component does not fetch, filter live records, change authority or implement URL handling.

Thirteen fictional Storybook states cover default, active chips, Me/Only mine synchronization, unassigned, Field/own scope with Clear all, disabled, long labels, many teammates, resource/status switching, stale options, customer-search removal, empty team and keyboard chip-removal/focus return. Keep grid, unscheduled queue and workload application for the later page integration. No live route, database change or deployment. Pause for approval before the next component.

Calendar filters validation: all 39 interaction/accessibility/layout combinations passed (13 stories at 1440/768/320 px), including synchronized Me/Only mine, own-scope Clear all, incompatible-status reset, stale options, disabled callbacks, customer-query removal and keyboard chip-focus restoration. Web typecheck, affected lint and final Storybook production build passed. Wide default and narrow default/long-content/own-scope screenshots were visually reviewed. Storybook’s generated development stylesheet needed refreshing to pick up the new flex-basis utility; the final checks use the correct stacked mobile layout. Review [Calendar filters](http://127.0.0.1:6006/?path=/story/calendar-calendarfilters--default). Stop for approval before the next component or live integration.

## Calendar unscheduled visits list review — October 21, 2026

The user approved CalendarFilters. The next single component is Calendar/CalendarUnscheduledList, adapting the prototype’s Jobs-only queue to Jobs, Work Orders and explicit shared visit identities. It shows customer, authorized active record references/statuses using existing badges, deduplicated assigned people and completion deadline/overdue state, plus injected peek and schedule callbacks. Active entries without a visit date are sorted by soonest deadline, then stable record number/visit ID; no-deadline entries come last. Only identical explicit visit IDs are deduplicated. Scheduled entries and closed-only records are omitted; closed records on a mixed visit are historical context, not unscheduled affected records. Cap the visible list at ten visits. A paged server response must authorize/filter/deduplicate and deadline-sort before truncation, returning its distinct total separately.

The count is in visits, not linked records. Read-only entries retain the peek action and explain the disabled Schedule action; canReschedule must be computed upstream for every affected active record, never inferred from visible records. Field/own-schedule stories contain only permitted records/people. Empty and filtered-empty states are distinct; loading/error hide stale rows/counts. A generic View all unscheduled visits callback replaces the obsolete Jobs-only destination for this mixed queue. Its destination must preserve filters and resource authorization when the page is integrated; no new all-visits page or route is introduced here.

Fifteen fictional stories cover default/deadline order, duplicate shared visit/crew, Work Order-only/unassigned, read-only, Field-scoped, more than ten visits, a capped server response with larger total, empty, filtered-empty, loading, retryable error, long content, scheduled/closed exclusion, closed linked-record history and keyboard activation. No Calendar page/data wiring, scheduling writes, database migration or deployment. Stop for approval before starting the next component.

Unscheduled-list validation: all 45 story/viewport combinations passed (15 states at 1440/768/320 px), including deadline order, explicit-ID/crew deduplication, the ten-visit cap, paged totals, scoped/read-only actions, stale-content suppression, keyboard activation, Axe and overflow. Nine affected combinations were rechecked after correcting the fictional standalone Work Order to have a distinct ID/number from the shared visit’s Work Order. Web typecheck, affected lint and final Storybook production build passed. Wide default and narrow long-content/Field-scoped layouts were visually reviewed. Review [Unscheduled visits list](http://127.0.0.1:6006/?path=/story/calendar-calendarunscheduledlist--default). Await approval before the next component or page integration.

## Calendar Team Workload review — October 21, 2026

The user approved CalendarUnscheduledList. The next single component is Calendar/CalendarTeamWorkload, adapting the prototype’s Team availability count panel to the approved shared-visit model. Its title/copy make clear that counts are not working hours, time off or actual availability. It shows Monday–Sunday counts and weekly totals for each authorized person, plus Unassigned at workspace scope. The incoming crew projection is the union of primary owners, Job team and Work Order crew members on active records, already authorized upstream. Explicit visit/person IDs are deduplicated; one shared visit counts once per assigned person, while the section’s visit count remains distinct across people. Out-of-week dates are ignored, zero-visit teammates remain visible and four or more visits on a single person/day receive a nonblocking Busy day cue. The Unassigned bucket is not treated as a person/capacity warning.

Clicking a person filters by the existing CalendarFilters person value (Me/member ID/Unassigned); clicking again or Show everyone clears that optional filter. Scope, selected person and disabled state are controlled props/callbacks only. Own-schedule scope shows just the viewer’s permitted visits/counts, hides other people and Unassigned, and keeps Me selected without a control to widen access. The future server range query must apply current filters consistently and return the full authorized active-visit projection for these counts; client filtering does not replace server authorization. Loading/error hide stale counts and rows; retry uses an injected callback.

Sixteen fictional stories cover selection/reset, shared visit/duplicate crew counting, busy day vs visits spread across a week, Unassigned, own scope, zero visits, no team, long names, disabled, loading/error, out-of-range visits, year boundary and keyboard activation. No new actual-capacity/working-hours logic, overlap calculation, schedule suggestions, page/API wiring, schema or deployment. Calendar scheduling warnings still use the reviewed dialog and future server advisory pipeline. Stop for approval before the next slice.

Team Workload validation: all 48 interaction/accessibility/layout checks passed (16 states at 1440/768/320 px), including explicit visit/person deduplication, distinct week totals, daily overload versus spread-out work, selection/reset, Unassigned, own-scope visibility, loading/error suppression, year boundaries and keyboard focus/activation. Three Calendar Filters default checks also passed after extracting its person-filter union to a named shared type (no value/behavior change); this avoids Storybook’s indexed-access prop-documentation crash. Web typecheck, affected lint and final Storybook production build passed. Wide default and narrow default/own-scope/long-name layouts were visually reviewed. Review [Team Workload](http://127.0.0.1:6006/?path=/story/calendar-calendarteamworkload--default). Stop for approval; no live Calendar integration or deployment.

## Assembled Calendar page review — October 21, 2026

The user approved CalendarTeamWorkload. The next review slice composes the approved toolbar, filters, week grid/day columns/cards, unscheduled list, workload panel, visit peek and scheduling dialog in Calendar/CalendarPage. The controlled CalendarPage accepts authorized projections, current filters/date, capability flags, overlay props and injected callbacks. It has no data fetching, URL parsing, record writes or embedded assistant. The future workspace route will supply the existing global assistant shell. The week uses the approved desktop/tablet horizontal scroll and mobile day list; the queue/workload panels sit side by side from the established 1200 px breakpoint, stacking below it. Dismissal falls back to page focus only when a confirmed move removes its launch button.

A separate Storybook-only CalendarPagePreview controller uses fictional, distinct record/visit identities to demonstrate combined filtering, week navigation, workload-to-person-filter synchronization, peek-to-reschedule, empty-day date prefill and queue-to-calendar scheduling after explicit review/confirmation. Type/status filters match the same linked record; person/customer filters affect the grid, queue and workload together. Own scope shows only the viewer’s projection; shared visits without fictional primary responsibility across every record are view-only. Eligible unscheduled targets are offered first. Mock saves update the preview’s visit date/window/revision and the existing Job schedule status transitions; they do not call services or persist. Open-record/View-all callbacks intentionally do not navigate in this preview. Backend shared-visit lifecycle/history, detach actions, real workload advisories and permission rechecks remain future authoritative domain work.

Seventeen page stories cover default composition, week navigation, cross-panel filtering, person selection, peek, schedule review, queue scheduling/count updates, empty-day scheduling, peek-to-dialog handoff, Field scope, read-only, empty, filtered empty, loading, persistent error, retry recovery and keyboard. No Calendar app route/API, migration, AI tool, reminder or deployment is added by this slice. Await page approval before live integration.

Page review refinement: the toolbar now accepts a separate scheduleDisabled flag for temporary loading/error conditions, so disabling scheduling does not imply a role-permission denial. The fictional empty-calendar story retains scheduling permission and can open the existing no-eligible-visits dialog. Error remains a persistent visual state; RetryRecovery demonstrates recovery separately. These changes do not grant access or add live commands.

Assembled-page validation: all 68 page story/viewport combinations passed (17 states at 1440/1024/768/320 px), including synchronized filters/counts, navigation, queue scheduling after confirmation, empty-day prefill, peek-to-dialog handoff, own scope/read-only behavior, empty/loading/error/retry, Axe, document overflow and composed week geometry. Nine existing toolbar regression combinations passed. Mobile overlay review led to a small shared scheduling-dialog improvement: entering review/clear moves focus to the labeled old/new comparison, rather than leaving focus at a potentially clipped footer. All 24 affected composed-page/direct-dialog combinations were rechecked across four widths, and comparison focus was explicitly asserted in desktop/mobile captures. Web typecheck, affected lint and the final Storybook production build passed. Wide full-page layout and desktop/mobile drawer/review overlays were visually reviewed. Review [Calendar page](http://127.0.0.1:6006/?path=/story/calendar-calendarpage--default). Await approval before shared-visit persistence, API/route wiring or deployment.

## Assembled Calendar page approved — October 21, 2026

The user approved the assembled page. Component review is complete. Next is the shared-visit backend foundation: additive schema/contracts and safe migration of existing independent schedules, followed by atomic authorized commands and scoped reads. Reopen/relink behavior still needs a product decision before implementing that lifecycle edge. Route wiring, notifications/reminders, assistant integration and staging deployment remain pending; Storybook scheduling is still fictional local state.

## Shared-visit persistence foundation — October 21, 2026

Implemented the additive foundation migration `202610210001_calendar_visits.ts`, shared schedule/record/version contracts, and a pure domain guard comparing the complete active membership and every reviewed record version. These do not expose a Calendar API, change permissions, or authorize a mutation by themselves. The guard must receive the full server-loaded active set, not the viewer's filtered projection; transactional authorization remains required on every affected record.

New tables:

- `calendarVisits`: explicit tenant-scoped visit identity, workspace-local date, fixed arrival window and positive revision.
- `calendarVisitRecords`: exactly one Job or Work Order per link, tenant-safe composite foreign keys, unique active membership per resource and an end timestamp for historical membership.
- `calendarScheduleSnapshots`: per-record date/window/status/version snapshots, protected from UPDATE. Record/workspace erasure cascades remain allowed under the existing deletion policy; this is not a separate retention exemption.

The migration seeds a separate visit for each existing Job and Work Order, including unscheduled and closed records. Identical schedule fields never merge identities. Closed links are ended; every source record receives a baseline snapshot. Source dates, statuses, versions and timestamps are not modified. The rollback refuses to remove retained visits. This is an additive migration tested in a rolled-back isolated test schema; it has not been applied to the normal development database or deployed to staging in this section.

**Cutover barrier:** existing Job/Work Order columns and services remain authoritative. No production code reads or writes the new tables yet. Their baseline is not a live synchronized read model. Before enabling Calendar reads or shared links, implement one coordinated transactional command path and migrate all Job/Work Order creation, scheduling, close/reopen and deletion paths to maintain it. Under appropriate write locks, reconcile records created or changed after the baseline, preserve historical snapshots, and validate membership/schedule parity before enabling reads. Do not expose the new backfilled data as current until this is complete. Reopen/relink product behavior remains unresolved; do not silently reconnect a reopened record to a changed former visit.

Validation: Calendar contract/revision tests and existing Job/Work Order contract/lifecycle regressions, contracts/domain/data typechecks and affected lint. The isolated local PostgreSQL rehearsal checks independent backfill and unchanged source rows, closed/unscheduled identities, cross-tenant foreign keys, unique active membership, resource-link exclusivity, protected snapshots, valid schedules, rollback guard and tenant-scoped erasure. Run `pnpm --filter @salesmora/data test:calendar:foundation`; it requires the existing isolated local `TEST_DATABASE_URL`, creates a temporary schema inside a transaction, and rolls everything back. Next section: implement atomic shared-visit commands and the coordinated existing-service cutover before live range/queue/workload reads.


## Atomic shared-visit commands and local service cutover — October 21, 2026

The user approved reopening a closed Job or Work Order into a **separate visit**, preserving its existing date/window. Rejoining a former visit requires a new explicit reviewed link; reopening never mutates the former visit or its other records.

Implemented in `packages/data/src/calendar/commands.ts`:

- `scheduleCalendarVisit`: schedule, reschedule or clear one explicitly identified visit. Load and authorize the entire active membership, compare the visit revision and every record version against the reviewed set, then update all affected resources and the visit atomically. Reuse Job schedule-status transitions, Work Order editability and changed-after-issue behavior. Snapshot prior schedules and write per-resource activity. No partial commits.
- `linkCalendarWorkOrder`: join an independently scheduled Work Order to its own Job's explicitly selected scheduled visit. Review both source and destination versions and every destination record; preserve the old ended link/history. Dates alone never link anything.
- `separateCalendarWorkOrder`: review the shared membership and move only the selected Work Order into a new independent visit/date/window. Leave the other resource rows and original visit date/window unchanged; increment its membership revision.
- `calendarOperations`: actor/payload/source-bound durable receipts prevent duplicate commits or reuse of a submission for a different action. Retries reauthorize current access. No HTTP endpoint, UI or assistant commit bypass is introduced here.

Existing Job/Work Order creation and mutation services now synchronize Calendar identities, dates and closed memberships in the same transaction. Completing/canceling preserves a per-record schedule snapshot and ends only that record's active link. Reopening creates a new independent visit. Existing one-record scheduling controls reject shared mutations with a review-required conflict; they cannot silently expand a user-confirmed one-record write. Draft Work Order deletion removes its links/snapshots through existing erasure cascades and cleans up unreferenced visits. The original one-record assistant confirmation paths use these same guarded services; shared-visit assistant review UI/tools are still pending.

Work Order scheduling now has a separate `workorders.schedule.update` permission, so primary-assignee Field scheduling does not grant general editing. The engine requires primary assignment for Field even with a wider saved scope; all affected records also need current read access. The live Work Order detail scheduling flag and assistant operation gate use this permission. Primary Work Order assignment does not grant parent Job read access. Jobs retain their primary-owner Field check. The permissions editor includes the new scheduling permission. No new visual component was required.

Migration `202610210002` creates receipts and performs an audited permission cutover: inherit existing explicit non-Field Work Order edit authority as schedule authority; adopt Field defaults only for uncustomized policies with their read dependencies. Preserve missing Field grants in every Owner-customized policy. New-workspace initialization seeds the agreed defaults. Migration `202610210003` freezes writers and reconciles missing/stale independent visit baselines in batches, without changing source records or historical snapshots; inconsistent shared schedules fail closed. Apply the migrations with the matching service release; older writers must be stopped during a future staging rollout so they cannot resume bypassing synchronization afterward.

All three Calendar migrations were applied to the local Docker test and development databases. A read-only development parity check found zero missing/inconsistent active links and no active links on closed records. **Nothing was deployed to staging.**

Validation: 406 targeted contract/domain/authorization/agent/policy tests passed; all workspace typechecks passed; affected lint passed with existing unrelated unused-variable warnings. The Calendar database rehearsal covers creation, explicit linking, actor-bound retries, legacy guards, all-resource authorization, primary responsibility, cross-workspace claims, stale versions/membership, concurrent confirmations, forced write failure rollback, clear/separate, Job and Work Order close/reopen history, direct Work Order scheduling without parent Job access, and reconciliation. Existing Jobs (10 journeys) and Work Orders (16 journeys) database rehearsals passed. Run `pnpm --filter @salesmora/data test:calendar:commands`; fictional source fixtures are cleaned up, while immutable authorization audit evidence remains in the isolated test database under the existing retention policy.

Next: build permission-filtered range/peek/queue/workload reads and wire the approved Calendar page and schedule review dialog. Then connect reviewed link/separate controls and the required explicit “Use Job’s visit / Separate visit” choice during Work Order creation. That creation UI still creates independent visits today. Shared commands are available to server code but not yet exposed through a live Calendar endpoint. Combined schedule-change notifications, reminder settings/workers, Calendar assistant proposals/reviews and staging rollout remain separate sections; do not treat the new shared command paths as a finished end-user Calendar release.


## Live Calendar reads and page integration — October 22, 2026

Connected the approved Calendar composition at `/calendar` with workspace-aware left navigation. Reused the approved toolbar, filters, compact/expanded cards, week/day layouts, peek drawer, unscheduled list, workload panel and schedule review dialog. The global assistant remains available through the existing shell; this section adds no Calendar-specific assistant actions or embedded composer. Parallel Gantt work remains separate.

Implemented `readCalendar`, `readCalendarVisit` and `readCalendarAdvisories` in `packages/data/src/calendar/read.ts`, with shared strict Week/filter/paging contracts. SQL visibility intersects `calendar.read` with each resource's current read scope before filtering, distinct counts and pagination. Shared visits count once. Type/status filters match the same visible record; person filters match the authorized union across the visit. Customer search treats wildcard characters literally. Queue results are sorted by deadline, record reference and visit ID before returning ten distinct visits per page. The existing reusable Pagination component is integrated and demonstrated with 23 fictional visits in Calendar/CalendarPage/QueuePagination.

Own-schedule projections lock the person filter to Me, return only the viewer's permitted assigned records and workload identity, and hide unrelated roster options. Work Order-only access returns no hidden parent Job reference/title/deadline. Read-only shared projections expose neither hidden linked records nor mutation review versions. Scheduling capability requires visible access and current scheduling authority over the complete active membership. Workspace views with narrower resource grants derive teammate options from authorized active records rather than the unrestricted roster.

The page is session-protected, checks current Calendar access and reuses WorkspaceShell. Week, filters, queue page and visit peek are URL-backed; search is debounced, browser Back/Forward restores state, canonical responses normalize dates/scopes/clamped pages, and stale/aborted requests cannot overwrite a newer query. Loading/error states suppress prior-query rows and totals. Peek links open the permitted Job/Work Order detail page. The schedule selector uses the current week/current queue page plus an explicitly opened visit; it does not claim to search every workspace record.

New API adapters:

- `GET /api/calendar`: authorized range, queue, roster and workload projection.
- `GET /api/calendar/[visitId]`: fresh authorized peek and, only when permitted, the complete versioned scheduling review.
- `PATCH /api/calendar/[visitId]`: strict input, session-derived identity, origin/size checks, actor-bound receipt and current authority. Calendar scope and full-record capability are rechecked inside the same exclusive workspace transaction as the atomic schedule command. A user with broader resource permissions cannot use this endpoint to bypass an own-schedule Calendar restriction.
- `POST /api/calendar/advisories`: current scoped warnings for an exact visit revision/date/window. Count people once per visit, exclude the visit being edited, warn at four or more visits including the proposed visit and for any intersecting windows; adjacent windows do not overlap. Warnings reflect only the schedule the viewer may access and remain nonblocking. A failed warning request is explained without blocking a reviewed save.

Requests use private/no-store responses and generic access-denied output. Explicit review/confirmation is required before schedule or clear commits. Conflicts preserve the draft and offer a fresh review; retries reuse their submission ID to avoid duplicate writes. A saved-but-failed-refresh result is distinguished from a failed save. Updated page/dialog stories retain all approved visual behavior; entering a draft now supplies exact-candidate advisories, including on the initial date/window. The assembled page has a unique React key alongside the global assistant.

Validation: 17 isolated database journeys cover both command foundations and new scoped reads, hidden shared links, literal search, 24-item queue pagination, read denial and advisory overlap/adjacency/version rules. Targeted Calendar contract/date/domain/policy tests passed (15 tests in the final run). All 144 Storybook interaction/accessibility/layout combinations passed for the assembled page and scheduling dialog at 1440/1024/768/320 px; Storybook production build passed. Desktop/mobile story layouts were visually reviewed. Live browser/API tests cover current authorization, strict requests, origin/session denial, shared review/save/retry, advisory API, URL-backed queue navigation and search, the narrow Field view and a forged own-schedule shared update. The final live rerun passed all four API/browser tests against the final URL-state code. All workspace typechecks, affected lint and diff whitespace checks passed.

No new migration, environment variable, staging deployment or external service was required in this section. Review the local Calendar before proceeding. Next sections remain: reviewed link/separate controls and the explicit Work Order creation visit choice; combined notifications; deadline reminders/settings/worker; Calendar assistant context/proposals/reviews; and an approved staging rollout. Existing one-record controls still reject a shared change instead of silently expanding it; use the Calendar's reviewed shared scheduling flow for date/window changes today.


## Work Order visit choice in Storybook review — October 22, 2026

The user authorized the next creation-choice component. Added `WorkOrderVisitChoice` under Work Orders/WorkOrderVisitChoice, using the existing creation-form styles and approved Calendar schedule formatting. The original Work Order prototypes remain the visual reference; the October 20 explicit shared/separate decisions supersede their independent-only scheduling behavior.

For a scheduled Job, two native, keyboard-accessible radio cards require an explicit choice: **Use Job’s visit** shares the displayed date/window without changing the existing visit; **Separate visit** creates an independent unscheduled visit to schedule after draft creation. Display workspace-local date, fixed arrival window (or unset), timezone and already-authorized record references. Explain that future shared schedule changes require review of all affected active records. Nothing is preselected. Joining can be disabled while separate creation remains available. A selected shared choice that loses permission displays as unselected, without silently choosing Separate or emitting an automatic change.

For an unscheduled Job, explain that the draft has a separate visit and can be scheduled afterward; no nonexistent shared option is offered and no callback is fabricated. Loading/error hide stale schedule references and choices; retry is injected. Pending/disabled, long references and keyboard use have dedicated stories. All visible product copy and fictional examples live in the colocated data file.

This is a controlled presentation component, not an authorization boundary. Future integration must reset an explicit selection when the selected visit/revision changes, validate current choice/capability and all affected record permissions on the server, and create/link atomically. It must not infer linking from dates. The existing creation dialog, live routes, database, assistant and staging are unchanged in this slice. Review this component before composing it into the creation dialog and its final confirmation.

Visit-choice validation: all 39 interaction/accessibility/layout combinations passed (13 stories at 1440/768/320 px), including explicit selection, unavailable/revoked joining authority without fallback selection, disabled state, retry, hidden stale choices, keyboard arrows/Space and narrow long-reference wrapping. Web typecheck and affected lint passed. Default narrow and selected wide layouts were visually reviewed. The final Storybook production build passed. Review [Work Order visit choice](http://127.0.0.1:6006/?path=/story/work-orders-workordervisitchoice--default); stop for approval before creation-dialog composition or live wiring.


## Visit choice approved; creation dialog composition in review — October 22, 2026

The user approved WorkOrderVisitChoice. The next review slice composes it into the existing CreateWorkOrderDialog through an opt-in `visitContext` presentation prop. Scheduled Jobs require an explicit shared/separate choice. Loading/error contexts cannot advance. An unscheduled Job uses an independent visit without offering an unavailable shared option. Joining-unavailable users can explicitly choose Separate.

The enhanced flow has an edit step, then a focused summary with Job/customer, draft title, assignee, source and visit decision. Shared review includes the date/window/timezone, current visible linked references and unchanged-existing-schedule explanation; Separate review explicitly says Not scheduled and preserves the original Job visit. Only the final Confirm and create draft invokes the callback. Back to editing preserves entered details and restores focus to the title input. The selected visit ID/revision is included only for shared preview submissions. Changing the visit revision/date/window or joining capability invalidates the choice and previous review; no silent fallback to Separate occurs. Callback errors preserve the reviewed draft.

The existing live callers do not supply `visitContext`, so their current single-step creation flow and payload remain available and covered by an ExistingLiveFlow regression story. No backend schema/API, live visit creation/link adapter, assistant or deployment is added here. Future live integration must validate all data again and create/link in one transaction. Review the composed dialog before that integration.

Creation-dialog validation: all 66 Storybook interaction/accessibility/layout checks passed (22 stories at 1440/768/320 px), including both review/confirmation payloads, no premature callback/close, unscheduled Jobs, unavailable/loading/error context, failure retention, Back-to-editing focus, and revision/permission changes. An additional restoration check verifies that an old choice/review does not reappear after access is restored. The desktop confirmation summary was made two-column and now includes the service address; all 27 affected review combinations were rechecked successfully. Narrow edit and wide shared-review layouts were visually inspected. Web typecheck, affected lint and whitespace checks passed. Final production Storybook build passed. Review the composed [creation dialog](http://127.0.0.1:6006/?path=/story/work-orders-createworkorderdialog--default) and [shared visit review](http://127.0.0.1:6006/?path=/story/work-orders-createworkorderdialog--shared-visit-review). Await approval before live atomic creation/link wiring.


### Approved creation dialog connected locally — October 22, 2026

The approved WorkOrderVisitChoice and two-step creation review are now used by the live Work Orders Add flow, including Jobs’ `newForJob` entry point. A private, no-store `/api/work-orders/creation-visit` endpoint authorizes Job read and Work Order creation, then loads the scheduled visit. Shared joining is offered only after every existing active record passes current scheduling/read authority. Unauthorized linked references are not returned. Calendar menu access is not required to create a Work Order from an authorized Job.

Creation accepts an explicit separate visit or a Job visit ID plus revision. The shared path rechecks the complete current membership/versions and permissions, creates the draft and independent baseline, then invokes the existing authorized link command inside the same workspace-locked transaction. The new draft must also pass its own scheduling authority. Any denial, stale review or write error rolls the whole operation back. Idempotent creation receipts return the final draft version, so a lost response does not create twice. Separate creation leaves the Job unchanged and the new visit unscheduled. No new migration or storage infrastructure is needed.

The live adapter suppresses stale preview responses, blocks during loading/error, supports reloading, preserves draft fields on failure and refreshes the visit context before another review. Legacy duplicate and assistant creation callers remain independent unless they explicitly provide a reviewed visit selection; they never silently join a visit. Reviewed existing-record join/separate controls and assistant shared-visit review remain separate follow-ups.

Validation: 18 isolated database journeys passed, including atomic shared creation, receipt retry, stale membership review, separate creation, revoked permissions, hidden-reference suppression and rollback when the new draft cannot be scheduled. Five local API/browser tests passed, including the live creation review, no write before confirmation, final navigation, stale-review rejection and origin/scope controls. The final stale-preview adapter was rechecked with the live creation test. All 16 existing Work Order database journeys passed. All workspace typechecks, the final web typecheck, affected lint and whitespace checks passed. No staging deployment.

Next review slice: explicit controls for linking an existing independent Work Order to its Job visit and moving a shared Work Order into a separate visit, reusing the approved review/schedule components where possible.

### Existing Work Order visit management in Storybook review — October 22, 2026

The user approved the live creation integration. The next review slice is `Work Orders/WorkOrderVisitDialog`, one reusable dialog with **Join Job’s visit** and **Move to a separate visit** modes. It composes the established JobDialog, Work Order field/button styles, Calendar date/window formatting and schedule warning copy. Shared-visit behavior extends the approved Calendar prototype using the October 20 decisions; no date matching or implicit linking is introduced.

Join reviews the independent Work Order’s current schedule, its Job’s destination schedule/timezone and the authorized destination record references. Confirming proposes moving only that Work Order; existing destination records retain their schedules. A Work Order already sharing a visit must first be separated. The destination must be a scheduled distinct visit containing the parent Job, with current authority on all active source/destination records.

Separate reviews a selected active Work Order on a shared visit, the active records that stay on the original visit, and a proposed independent schedule. Its initial draft keeps the current date/window; the user may change them or explicitly leave the visit unscheduled. Past-date and completion-deadline warnings reuse the approved nonblocking wording. Closed records are excluded from affected lists and keep historical schedules. Assignments, deadlines and statuses stay unchanged.

Both modes require Review before confirmation, emit an injected draft callback containing source/destination visit revisions, and never fetch/write data. Pending blocks duplicate submissions/dismissal. Loading/error suppress stale visit details; reload, conflict, retryable failure and back-to-editing states are included. A changed authoritative revision or capability invalidates the old review, including revoke/restore. Server adapters must reauthorize the complete membership set, validate exact versions and atomically execute the existing link/separate commands; presentation capability flags are not authority.

Twenty-five fictional stories cover join/separate edit/review/confirmation, unscheduled separation, preserved edit values, source/destination denial, already-shared/wrong-Job/unscheduled-target/closed states, loading/retry, pending, failure/conflict, long content, invalid dates, closed history, permission/revision invalidation and keyboard focus. Review [join](http://127.0.0.1:6006/?path=/story/work-orders-workordervisitdialog--join-review) and [separate](http://127.0.0.1:6006/?path=/story/work-orders-workordervisitdialog--separate-review). Live controls/endpoints and Calendar-specific assistant changes remain pending. Await approval before live integration. No database migration or staging deployment in this slice.

Visit-management validation: all 75 unique Storybook interaction/accessibility/layout combinations passed (25 stories at 1440/768/320 px; the historical-record story was rechecked at all three widths after waiting for the modal entrance transition). Join/separate callbacks carry the expected reviewed revisions, unscheduled separation clears both date/window, review does not mutate, failed confirmation preserves the dialog, and permission/revision changes require fresh review. Desktop join review and narrow separate review were visually inspected. Final web typecheck, affected lint and whitespace checks passed. Production Storybook build passed.


### Approved existing Work Order visit controls connected locally — October 22, 2026

The user approved WorkOrderVisitDialog. Work Order details now expose **Join Job’s visit** or **Move to a separate visit** in the existing Crew and schedule card when the server reports the corresponding current capability. New colocated CrewCard stories show independent/shared/read-only action placements. Opening either action reloads the current preview and reuses the approved two-step dialog; no write occurs at Review.

`GET /api/work-orders/[workOrderId]/visit` returns private, no-store projections with workspace-local today and separate action flags. `readWorkOrderVisitManagement` requires current Work Order read access and full scheduling/read authority over each affected active record before exposing a visit’s records, people, dates and revision. It does not depend on Work Order create or Calendar-menu access. Hidden or unschedulable linked sets return no projection/action. Parent completion deadlines appear only with current Job read authority; full parent access is never inferred from Work Order assignment.

`PATCH` uses the strict `workOrderVisitChangeSchema`, session/origin/workspace validation and path/body matching. `changeWorkOrderVisit` holds the workspace write lock, reauthorizes the full source/destination membership, compares both reviewed revisions for join (the source revision for separate), and invokes the existing link/separate command transactionally. The source must really contain the selected Work Order; joining requires its actual Job’s scheduled, distinct visit. One actor-bound receipt covers the submitted UI action, with the underlying command receipt in the same transaction. Exact retries do not move twice. The new independent schedule may retain/change date/window or explicitly clear both. Original Job and other record schedules/versions remain unchanged.

The live adapter cancels stale reads, blocks while loading, supports retry/reload, serializes submissions and retains the dialog/draft on failure. Conflicts require reload and fresh review. After commit the dialog closes and current Work Order details/action capabilities reload; a subsequent detail-refresh failure is shown separately from save errors. No schema migration, new storage or staging deployment.

Validation: all 19 isolated Calendar database journeys passed, including the new managed join/separate round trip, stale source/target revisions, denied/cross-workspace claims, actor-bound retries and unchanged neighboring rows. Six API/browser tests passed, including real join and unscheduled separation from the Work Order page, strict payload/origin/scope checks, no write before confirmation, and Field scheduling without Calendar menu access. All nine new CrewCard interaction/accessibility/layout combinations passed at 1440/768/320 px after correcting the action placement’s definition-list semantics. Wide independent and narrow shared layouts were visually inspected. All workspace typechecks, affected lint and whitespace checks passed. Production Storybook build passed.

Next: combined recipient-aware visit-change notifications, then the agreed reminder settings/worker slices; Calendar-specific assistant reviews remain after page/service integration. Review this live section locally before proceeding.

### Combined visit notice in Storybook review — October 22, 2026

The user approved live Work Order join/separate controls. The next single review slice extends the existing `Notifications/NotificationMenu` presentation with optional schedule detail rows and authorized record labels. One visit event is one notification card and one unread item, even when its authorized projection lists both a Job and multiple Work Orders. The card shows the actor/action, previous and new schedules, workspace timezone, authorized record references, one authorized destination link and the existing mark-as-read control.

Seven new fictional stories preview shared rescheduling, clearing, a Work Order-only recipient projection, joining, separating, marking one combined card read and long content. Existing lead/Work Order/material cards retain their original layout when optional details/record labels are absent. A Work Order-only recipient fixture contains no Job reference or hidden-record count and links directly to the Work Order. Server adapters must choose an accessible record destination when the recipient cannot access Calendar.

This is presentation only: no notification is generated or sent, and no notification contract, database, outbox, worker, preference or live menu adapter is changed yet. Recipient selection, deduplication, actor exclusion, current read/delivery authorization, transaction-bound idempotency and email preferences remain required backend work after the notice design is approved. Email template/preferences review follows individually before delivery integration. Review [combined visit notice](http://127.0.0.1:6006/?path=/story/notifications-notificationmenu--shared-visit-rescheduled) and [Work Order-only notice](http://127.0.0.1:6006/?path=/story/notifications-notificationmenu--work-order-only-visit). No staging deployment.

Combined-notice validation: 30 interaction/accessibility/layout combinations passed (seven new visit stories and three existing lead/Work Order/material regression stories, each at 1440/768/320 px). Coverage includes one card/unread count for a shared update, authorized record display, Work Order-only destination, clearing, join/separate copy and one mark-read callback with focus restoration. Wide shared and narrow scoped layouts were visually reviewed. Web typecheck, affected lint and whitespace checks passed. Production Storybook build passed. Await design approval before the next slice.

### Visit-change email in Storybook review — October 22, 2026

The user approved the combined in-app notice. The next single component is `Email/VisitChanged`, using the existing transactional email palette/logo, presentation tables/inline email styles and plain-text alternative. One email shows the actor/workspace, event explanation, previous/new date and arrival window, explicit workspace timezone and only the recipient-authorized record labels. The primary button opens the first authorized Job or Work Order directly, avoiding a Calendar-menu permission dependency. A workspace-scoped notification-preferences link and fallback URL are included. No addresses, contact details, prices, inaccessible record counts or tracking assets are added.

The renderer lives in `packages/data/src/email/visit-changed.ts` with all copy/fictional content in `visit-changed.data.ts`; thin web template exports mirror LeadAssigned. It validates workspace/record identity, schedule/date/window consistency, timezone and link origin; escapes dynamic HTML and strips subject newlines. It accepts an already-authorized projection and cannot select recipients or grant access. Eleven stories cover shared rescheduling, initial scheduling, clearing, Work Order-only projection, join, separation with/without a date, no window, long/escaped content and plain text.

Review [visit-change email](http://127.0.0.1:6006/?path=/story/email-visitchanged--default), [Work Order-only email](http://127.0.0.1:6006/?path=/story/email-visitchanged--work-order-only) and [plain text](http://127.0.0.1:6006/?path=/story/email-visitchanged--plain-text). This section sends no email and does not change preferences, outbox, database, worker or live notifications. After design approval, review the visit-email preference control, then wire transaction-bound per-recipient deduplication and delivery reauthorization; skip actors and unreadable/draft-only records. No staging deployment.

Visit-email validation: five renderer boundary tests passed (authorized projection only, subject/HTML escaping, unsafe origins/record identities, date/window/timezone/event consistency, clearing and unscheduled separation). All 33 Storybook story/viewport combinations passed at 1440/768/320 px. The sandboxed email iframe was checked for overflow and its exact rendered HTML was separately audited at the same inner width with scripts enabled for the accessibility auditor; the preview itself remains script-disabled. Plain-text and Work Order-only interaction assertions passed. All workspace typechecks, affected lint and whitespace checks passed. Production Storybook build passed.

### Visit-email preference in Storybook review — October 22, 2026

The user approved the visit-change email template. The next single review slice updates the existing `Settings/NotificationPreferencesPage` with **Visit schedule changes**, independently controlled from Lead assigned to you. The description covers scheduling, rescheduling, clearing, Work Order joining/separation, one combined email containing only accessible records, and actor exclusion. Supporting copy clarifies that in-app notices remain on and deadline reminders are a separate future setting.

The controlled presentation values add optional `visitChangedEmail`; the row and associated copy are explicitly gated behind `showVisitChanges`. Existing live callers keep the old single-preference flow and payload until the API/migration/worker integration is implemented. Both switches participate in dirty/save/discard/error/pending state when the preview is enabled. The fictional default fixture is On, matching the existing lead-email preview; this does not initialize a production preference or activate delivery.

Eight new stories cover both switches On, visit emails Off, saving only the visit change without altering the lead choice, discarding both edits, saving disabled states, failure retention/retry, keyboard toggling and loading suppression. Existing twelve stories remain regression coverage. Review [visit-email preferences](http://127.0.0.1:6006/?path=/story/settings-notificationpreferencespage--visit-change-emails) and [visit emails off](http://127.0.0.1:6006/?path=/story/settings-notificationpreferencespage--visit-email-off). No contract/API/database/worker/deployment changes in this design slice. Await approval before persistence and recipient-aware delivery integration.

Visit-preference validation: all 60 interaction/accessibility/layout combinations passed (eight new and twelve existing stories at 1440/768/320 px). Checks cover independent preference payloads, no save on toggle, both-value discard, disabled controls while pending, retained failure/retry, loading suppression and keyboard focus. Wide and narrow two-toggle layouts were visually inspected. Web typecheck, affected lint and whitespace checks passed. Production Storybook build passed.


### Approved notifications, email and preferences connected locally — October 22, 2026

The user approved all three previews. Combined visit notices, their branded email/plain-text template and the independent personal **Visit schedule changes** preference are now live locally. This slice adds migration `202610220001_visit_notifications`: `notificationPreferences.visitChangedEmail` (On by default, consistent with the approved fixture), `visitNotifications` with per-recipient command uniqueness/read state and bounded email outbox status, and normalized `visitNotificationRecords` with resource-deletion cascades. Applied to local development and isolated test databases; no staging deployment or new environment keys.

Confirmed Calendar schedule/clear operations and legacy independent Job/Work Order scheduling enqueue one notice per assigned person across all affected active records, deduplicating Job owners/team and Work Order assignees/crew and excluding the actor. Join/separate events affect only the moved Work Order and its assigned people: existing records keep their schedules and do not receive misleading changed-date notices. Draft-only Work Orders never generate crew notifications. The old single-Work-Order reschedule notice is suppressed so the combined event does not duplicate it. Unchanged schedules enqueue nothing. Resource changes, notification projection and queued-delivery state commit or roll back together; command retries do not enqueue twice.

The enqueue path intersects assigned recipients with current membership/read authority. Only authorized record IDs are stored for each recipient. SQL resource scopes run again before notification counts, pagination and mark-read, and current record titles/numbers are projected afterward. Lost access removes records from the card; if none remain, its card/unread count disappears. Calendar-menu access is not required; the primary link opens a currently readable Job or Work Order directly. Personal preferences apply to the user across workspaces, matching the existing lead preference; changing only lead emails through an older caller preserves the current visit-email choice.

`processVisitEmails` rechecks membership, resource read scope, verified email and the current opt-out before sending. The worker polls every five seconds, claims rows with skip-locked locking under the workspace authorization lock, and uses the approved template/logo plus provider idempotency key `visit-changed-<notification-id>`. Five bounded attempts use exponential backoff; notices older than 23 hours are skipped, matching the existing assignment-email pattern and provider idempotency window. Opt-out or revoked/deleted/unreadable recipients are skipped without changing in-app read state. Provider idempotency protects supported-provider retries; SMTP cannot promise exactly-once external delivery after a process failure. Worker status now includes sanitized visit-delivery counts.

Validation: 20 Calendar database journeys passed, including shared-recipient deduplication, actor/draft suppression, record/count filtering, personal opt-out isolation and old-caller compatibility, competing delivery claims, transient retry and access revocation at delivery. An induced receipt failure after enqueue rolled back both notices and the schedule. Existing Work Orders (16), Jobs (10) and isolated Lead/notification (39) journeys passed; the Lead fixture was updated for the additive preference column. Seven local API/browser tests passed, including the combined card, exactly one unread increment across a retry, mark-read, scoped navigation and personal preference saving/impersonation rejection. Seven renderer/transport unit tests and all workspace typechecks passed. Affected lint and whitespace checks passed. Final production Storybook build passed and the local worker reports ready. Final worker typecheck and affected lint rechecks passed.

Next review slice: the agreed Job completion-deadline reminder settings (due-date reminder and configurable workspace-local send time for Free/Standard; Premium offsets/recipients), then worker integration. Calendar-specific assistant context/proposals/reviews remain after the page/service slices. Keep staging rollout as a separately approved section.


### DeadlineReminderSettings in Storybook review — October 22, 2026

The user approved proceeding to reminders and explicitly chose **up to five distinct reminders** per Job deadline, with a 365-day before/after range. The next single component is `Settings/DeadlineReminderSettings`, adapted from prototype 31’s reminder schedule and recipients sections. Deadline defaults and the broader Job-event table are separate later components; this does not silently build the entire settings page or embed another assistant.

Free/Standard show one fixed on-due-date rule and assigned Job owner/team recipients, with editable workspace-local send time (default 09:00). Premium permits one to five distinct before/on/after timings, 1–365 days for before/after, and additional workspace teammates; default team recipients cannot be removed. The workspace timezone is shown as authoritative context rather than changing the workspace timezone from this panel. Extra recipients are a current scoped roster; a removed teammate or incompatible downgraded policy blocks review until reload. Default recipients and additional selections are deduplicated at eventual delivery, with fresh Job read authorization.

The controlled panel validates time/rule count/days/duplicates/current roster and has review-before-save, discard, loading/retry, read-only, pending, failure/conflict and plan-limited states. The review summarizes timing, timezone and default/additional recipients and carries the authoritative revision in its injected callback. Revision/plan/authority/roster changes invalidate an old review. Pending confirmation stays visible and blocks dismissal/repeated submission. Personal reminder-email opt-out, current-role/entitlement checks, DST-safe worker evaluation, stop/re-plan/idempotency rules and the API are required integration work after component/page approvals; the visit-email preference must not be repurposed for deadline reminders.

Twenty-seven fictional stories cover Free/Standard/Premium, review/confirmation, editing the Free send time, add/remove and max-five rules, duplicate/invalid/zero rules, invalid time, additional/unavailable/no teammates, read-only, downgraded settings, saving (including active confirmation), failure/conflict, loading/retry, discard, long names, revision invalidation and keyboard focus. Review [reminder settings](http://127.0.0.1:6006/?path=/story/settings-deadlineremindersettings--default), [Premium](http://127.0.0.1:6006/?path=/story/settings-deadlineremindersettings--premium) and [review summary](http://127.0.0.1:6006/?path=/story/settings-deadlineremindersettings--review). No backend, migration, live route, worker or deployment changes in this slice. Await approval before the next component.

Reminder-settings validation: all 81 interaction/accessibility/layout combinations passed (27 stories at 1440/768/320 px). Review mount focus was corrected to occur when modal content mounts; save completion checks wait for the normal modal exit transition. Active pending confirmation stays visible and blocks close/repeated submission. Validation includes five-rule maximum, duplicate/range/time errors, fixed Free/Standard behavior, extra-recipient summary, read-only/plan downgrade and stale revision handling. Wide Premium review and narrow Standard layouts were visually inspected. Web typecheck, affected lint and whitespace checks passed. Production Storybook build passed.

Reminder row layout adjustment — October 22, 2026: the Remove reminder button now spans the row below the fields for every timing, including On the due date, so it never occupies the unused days-input column. Premium stories passed interaction/accessibility/layout checks at 1440/768/320 px; desktop layout was visually checked. Affected lint and whitespace checks passed.

Reminder row desktop refinement — October 22, 2026: supersedes the previous below-fields desktop arrangement. Desktop now puts timing and optional days in the left two columns and Remove reminder at the far right, aligned with the inputs. Due-date rows reserve the days column so remove buttons align consistently. Tablet/mobile retain the stacked button layout. Storybook’s generated stylesheet was refreshed for the new responsive utilities; Premium passed at 1440/768/320 px and the desktop row was visually verified. Affected lint and whitespace checks passed.

### Approved reminder schedule; default deadline in Storybook review — October 22, 2026

The user approved DeadlineReminderSettings, including the desktop timing/days-left and Remove reminder-right arrangement. It remains presentation-only pending settings-page composition and the API/worker slices.

The next single component is `Settings/DefaultCompletionDeadline`, following prototype 31 and the Job plan. The initial choice is **Leave unset by default**. The alternative sets a relative deadline 1–365 whole days after Job creation, defaulting to business days; business days are Monday–Friday without holiday exclusions, and calendar days include weekends. Counting excludes the creation day. A workspace-local date illustration demonstrates the result. A specific Job/campaign deadline rule takes precedence, and changing this default does not rewrite existing Jobs or reminders. Visit dates remain separate.

The controlled component includes review-before-save with authoritative revision, discard, read-only, loading/retry, pending, save failure/conflict and revision invalidation. Switching modes preserves the unsaved relative configuration; saving Unset emits no inactive relative fields. Twenty-two fictional stories cover both counting modes, Friday/weekend calculations, review/confirmation/clearing, mode switching, invalid ranges/fractions, read-only and asynchronous states, discard, long timezone, stale review and keyboard focus.

Review [relative business days](http://127.0.0.1:6006/?path=/story/settings-defaultcompletiondeadline--relative-business), [unset default](http://127.0.0.1:6006/?path=/story/settings-defaultcompletiondeadline--default) and [review summary](http://127.0.0.1:6006/?path=/story/settings-defaultcompletiondeadline--review). No live defaults, Job deadlines, database, API, worker or staging deployment are changed. Await component approval before the next slice.

Default-deadline validation: all 66 interaction/accessibility/layout combinations passed (22 stories at 1440/768/320 px), including weekend counting, exact reviewed payloads, inactive-field removal, mode preservation, invalid inputs, authority/loading states, failure retention, stale revision and keyboard focus. Desktop review and narrow relative settings were visually inspected. Web typecheck, affected lint, whitespace checks and production Storybook build passed.

### Default completion deadline approved — October 22, 2026

The user approved `Settings/DefaultCompletionDeadline`. Both it and DeadlineReminderSettings remain Storybook-only until settings-page composition and protected persistence/worker integration.

Next single review component: the Job notification-events table from prototype 31, covering lead-to-Job creation, status, assignment, visit schedule, deadline changes and approaching/overdue reminders. Reuse the established component/copy/Storybook conventions and review-before-save flow; no new delivery is activated by this preview. Job team chat is excluded until that separate capability is implemented. Avoid a separate Job schedule notification that duplicates the existing combined visit notice.

One policy conflict requires clarification before building the controls: NTF-2/prototype 31 shows editable in-app and email channels, whereas NTF-10 requires in-app notices always on. The Job plan gates expanded notification controls to Premium. Proposed reconciliation submitted for user review: in-app stays on for every plan; Premium may customize workspace email events, while Free/Standard use fixed defaults. Personal email opt-out remains independent and must apply during eventual delivery. This reconciliation is pending, not approved or implemented.

### Job notification events in Storybook review — October 22, 2026

The user resolved the channel-policy conflict: **in-app notices remain on for every plan; Premium customizes email events; Free/Standard use fixed defaults**. This supersedes editable in-app controls in prototype 31 and NTF-2. Personal email opt-out and current record authorization remain authoritative at delivery.

Added `Settings/JobNotificationEvents`, following prototype 31’s event table with seven rows: lead-to-Job creation, status, assignment, combined visit scheduling, deadline changes, approaching/due and overdue reminders. Every row has an Always on in-app indicator. Premium exposes email checkboxes; Free/Standard show disabled fixed On defaults. Downgraded previews show fixed defaults instead of silently retaining effective Premium customization. On means an event is eligible for email, not that a matching reminder offset exists or a message is sent now. Job chat is omitted pending its separate implementation. The visit row explicitly reuses the existing combined visit notice, avoiding a second Job email.

The component accepts controlled values, current management capability, plan and authoritative revision. Review-before-save emits only email choices plus revision; in-app settings are not writable. It includes discard, read-only, loading/retry, pending confirmation, failure/conflict retention and stale revision invalidation. No live endpoint, entitlement decision, preference override, database table or worker is changed. Future integration must enforce plan and permission checks server-side, keep personal opt-out separate and apply event choices within the existing combined-visit delivery path without duplicating or exposing inaccessible Work Orders.

Eighteen stories cover Premium/default, Free/Standard, toggle without saving, review/confirmation, all email off with in-app retained, discard, read-only, saving/pending review, save failure, conflict/retry, loading, downgrade normalization, revision invalidation and keyboard interaction. Review this component before settings-page composition and integration. No staging deployment.

Job-event validation: all 54 interaction/accessibility/layout combinations passed (18 stories at 1440/768/320 px). After refreshing Storybook’s generated stylesheet, all 12 final table/review/Free/pending-review combinations passed again; desktop and narrow tables were visually inspected. Web typecheck, affected ESLint and whitespace checks passed. The preview performs no external requests or delivery.

Production Storybook build passed. Review [Premium event controls](http://127.0.0.1:6006/?path=/story/settings-jobnotificationevents--default), [Free defaults](http://127.0.0.1:6006/?path=/story/settings-jobnotificationevents--free) and [review summary](http://127.0.0.1:6006/?path=/story/settings-jobnotificationevents--review). Await approval before the next component or page integration.

### Job event controls approved; settings page composition in review — October 22, 2026

The user approved `Settings/JobNotificationEvents`. The next single review slice is `Settings/JobNotificationSettingsPage`, composing the three approved components rather than duplicating their controls. Its header and reminder-behavior guidance follow prototype 31; approved global assistant placement supersedes that prototype’s embedded assistant. Deadline defaults, reminder timing/recipients and email events remain separate full-width cards so the approved desktop reminder row has sufficient space.

Each section retains its own explicit review/save/discard and authoritative revision. Page copy explains that saving one section leaves other unsaved sections untouched; there is no misleading global Save button or extra unsaved-summary panel. The route adapter will own shared current plan, timezone, management capability, load state and workspace-aware Settings/personal-preferences links. Page loading/error suppress all stale controls; section-specific conflicts stay local. The page explains plan differences, immutable in-app notices and independent personal email preferences. It summarizes cancel/re-plan/history/reopen rules without activating delivery.

Eleven fictional page stories cover Premium, Free, Standard, relative deadlines, read-only, loading/retry, one-section conflict, independent saves, reminder review and failure retention. No live settings route/menu, API, migration, worker, reminder delivery or staging change is included. After page approval, proceed to protected settings persistence and reminder lifecycle/delivery integration in reviewed slices, including the separate personal reminder-email preference and email template. Live visit notices retain their current behavior until the settings adapter is explicitly integrated.

Page-composition validation: all 33 interaction/accessibility/layout combinations passed (11 stories at 1440/768/320 px). Independent-save coverage confirms a reviewed deadline save leaves an unsaved email switch unchanged and performs no reminder/event save. Read-only, loading suppression, section conflict/retry, plan gates, review focus and retained failures passed. The desktop composition and mobile reminder controls were visually inspected. Web typecheck, affected ESLint and whitespace checks passed.

Production Storybook build passed. Review [Premium settings page](http://127.0.0.1:6006/?path=/story/settings-jobnotificationsettingspage--default) and [Free settings page](http://127.0.0.1:6006/?path=/story/settings-jobnotificationsettingspage--free). Await page approval before connecting live settings.

### Approved settings page connected locally: configuration persistence — October 22, 2026

The user approved the composed page. `/settings/job-notifications?workspace=…` now renders it inside the existing workspace shell, with an Owner/Admin business-settings-gated Settings overview card and left-menu subitem. The shared capability is supplied by server adapters on all existing workspace pages; omitted capabilities remain denied. The existing reviewed `settings.business.update` permission is now enabled alongside read. Reads require Owner/Admin plus current business-settings read; writes also require current update. A role label alone grants nothing, and even forged business grants do not admit Office/Field to this administrative surface. The global assistant stays in place with its existing capabilities; no reminder mutation tool is registered yet.

This is explicitly a **configuration-only persistence slice**. A prominent live notice states that applying defaults and activating reminder delivery are upcoming steps. Saving these settings does not alter existing/new Job deadlines, current visit notices, personal preferences or delivery queues yet. The subsequent activation slice must consume the reviewed settings, apply default precedence at Job creation and implement stop/re-plan/reopen/idempotency rules. Existing combined visit delivery continues unchanged until integrated; workspace email settings must be applied within that path rather than adding duplicate Job notices.

Migration `202610220002_job_notification_settings` adds per-workspace/section JSON settings with independent versions and an actor-bound audit/receipt table. No destructive backfill; old workspaces read unset/default-due-date/09:00/all-event-email defaults without a write. Both tables cascade with workspace deletion. Saves hold the workspace authorization lock, recheck current authority and paid entitlement, compare the reviewed section revision and commit settings/audit together. Submission IDs bind exact retries to the actor and normalized request; changed retries and stale review versions fail. Independent section versions avoid overwriting another section. Audit preserves actual stored before/after policy even when downgrade changes the effective policy.

`GET/PUT /api/settings/job-notifications` uses session identity, strict section-specific contracts, same-origin JSON writes, bounded request size, private/no-store responses and sanitized errors. In-app settings are not accepted in writes. Free/Standard accept one due-date reminder plus send-time edits and no extra recipients; event customization requires current Premium entitlement. Selected checkout plans, expired paid terms and transition flags do not grant Premium controls. Premium extra recipients must be current workspace teammates. Downgrades expose fixed effective reminders/events while retaining the saved Premium configuration; removed recipients are excluded from the current projection. Workspace-local Today comes from the database and timezone, not the browser clock.

The live adapter validates responses, serializes submissions, retains drafts/receipt IDs for retries, scopes save/discard/reload to the selected section and preserves other sections’ unsaved drafts/revisions. Conflicts require explicit reload and fresh review. Permission loss hides stale controls. Plan/timezone/roster changes update shared authoritative context and invalidate incompatible reviews. Navigation and page stories include the new administrative link and configuration-only notice. Migration applied to local Docker development and isolated test databases only; no new environment keys and no staging deployment.

Persistence validation: three strict-contract unit tests, ten isolated settings database journeys and four real API/browser journeys passed. Coverage includes forged role/plan/workspace claims, private session reads, same-origin strict JSON writes, Premium/downgrade/expired-plan rules, current recipient membership, actor-bound retries, competing stale versions, independent sections, atomic rollback/audit, no Job/notice side effects, live persistence across reload, conflict recovery and immediate permission revocation. The paid browser fixture explicitly creates a local test subscription rather than relying on billing-disabled onboarding; it makes no Stripe requests. All 51 final page/overview/navigation interaction/accessibility/layout combinations passed at 1440/768/320 px, including the configuration-only state, new menu selection, omitted capability, Owner and Field regressions. The navigation story helper was corrected to find its hidden desktop mobile-button by label.

All workspace typechecks and the final web typecheck passed. Affected lint and whitespace checks passed. Repository-wide lint still fails on pre-existing file-upload/file-processing `any` and Job-files hook-order errors outside this slice; those unrelated files were not changed. Existing unrelated dirty work, including Gantt and file/camera implementation, is preserved. No staging rollout.

### Persistence handoff completed — October 26, 2026

Resumed the interrupted final production-build check against the current workspace, preserving subsequent Estimates/Gantt/file work. The production Next.js build passed and includes `/settings/job-notifications` and its API. The three settings-contract unit tests and focused settings/contracts/store lint passed again. Earlier persistence validation remains recorded above; no extra migrations, activation or staging deployment occurred on this resume. Review the connected local Settings → Deadlines & notifications page before the next activation slice. Configuration persistence is implemented; default application, reminder email preference/template and worker delivery remain pending.

### Default activation: explicit creation choice in Storybook review — October 26, 2026

The user approved proceeding with activation. Inspection found the current Job creation form always sends `completionDeadline: null` for a blank date; strict parsing also normalizes omitted values to null. Applying a workspace default directly would therefore either skip normal UI creations or silently override an intentional no-deadline choice. The shared `createJobInTransaction` is now also used by the newer accepted-Estimate conversion flow; preserve that flow’s explicit reviewed dates and retry semantics rather than altering its meaning implicitly.

Before changing creation behavior, added the single reusable `Jobs/JobDeadlineChoice` presentation component for review. Its three explicit choices are Use workspace default, Choose a date and Leave this Job without a deadline. It consumes an authoritative rule revision, workspace-local creation date, projected deadline and timezone; no browser-clock calculation or settings-edit authority is assumed. The result is visible before a future creation confirmation. A changed default blocks the result until the user explicitly accepts the current revision. Lack/loss of override capability disables custom/unset choices while leaving the workspace-default path available; server-side creation authorization remains required. Loading/error/invalid projection suppress usable controls, and pending/read-only prevent edits.

Sixteen fictional stories cover relative/unset workspace defaults, a custom date, explicit unset, switching, missing date, default-only authority, permission loss, stale rule acceptance, pending/read-only, loading/retry, invalid projection, long timezone and keyboard use. This slice does not integrate the choice into the creation dialog, change contracts/services, apply Job defaults or activate reminders. Await component approval, then compose it into creation review with an authoritative server preview and revision/date recheck; apply the selected result atomically in the shared creation service. Existing Jobs, accepted-Estimate conversion review and other work remain unchanged. No migration, new environment keys or staging deployment.

Deadline-choice validation: all 48 interaction/accessibility/layout combinations passed (16 stories at 1440/768/320 px). Coverage includes explicit intent payloads, no custom/unset controls without override capability, recovery from lost authority, suppression of stale/invalid results, explicit current-rule acceptance, pending/read-only behavior, reload and visible keyboard focus. Desktop and narrow layouts were visually inspected. Web typecheck, affected lint and whitespace checks passed. Review [Job deadline choice](http://127.0.0.1:6006/?path=/story/jobs-jobdeadlinechoice--default) before composing it into creation.

Production Storybook build passed. Await this component’s approval before creation-dialog composition and default activation.

### Approved deadline choice composed into Job creation review — October 26, 2026

The user approved JobDeadlineChoice. The next single review slice adds an opt-in `deadlineContext` to the existing JobCreateDialog and reuses that component below the core customer/title/owner fields. The legacy optional date input is hidden only when this context is supplied. Current live callers, including the newer accepted-Estimate conversion dialog, omit it and keep their existing reviewed date/null behavior and payloads.

The composed edit step distinguishes workspace default, custom date and explicit no deadline. The confirmation summary shows the resolved completion deadline, intent and workspace timezone. Its injected callback carries the explicit intent plus the reviewed rule revision, creation date, resolved result and timezone for future server binding. These are presentation values, not a trusted command contract. No write occurs on Review job; confirmation is separate.

The review binds the complete entered draft, current default projection/revision/date/timezone, override capability and scheduling capability. A changed rule or preview invalidates the old confirmation without erasing customer/work/assignment fields; stale workspace intent requires accepting the current rule and reviewing again. Loading/error/invalid choices cannot advance. Permission-limited users can review the workspace default but cannot choose custom/unset. Save errors preserve the review. All new behavior is opt-in and no live route/API/service, Job deadline, reminder delivery, migration or staging deployment is changed yet.

Twelve additional stories cover the composed edit/default review, reviewed workspace confirmation, explicit unset, custom date, unset workspace rule, rule loading/retry, default-only permission, rule changes during review, failure retention and pending confirmation. Existing eight creation stories remain regression coverage, alongside representative accepted-Estimate conversion stories using the shared dialog. Review this composition before implementing the authoritative creation preview and atomic default application.

Creation-composition validation: all 75 interaction/accessibility/layout combinations passed at 1440/768/320 px: twenty JobCreateDialog stories (eight original plus twelve new) and five representative accepted-Estimate conversion stories. Checks cover no callback before confirmation, exact workspace/custom/unset intent and result, loading/error gates, default-only capability, preserved entries and renewed review after a changed rule, pending/error retention, and unchanged Estimate review/edit/confirmation/permission/reload behavior. Initial-dialog assertions were updated to wait for MUI’s normal opening transition. Desktop deadline review and narrow creation layouts were visually inspected. Web typecheck, affected lint and whitespace checks passed.

Production Storybook build passed. Review [creation with workspace default](http://127.0.0.1:6006/?path=/story/jobs-jobcreatedialog--with-workspace-default) and [deadline confirmation summary](http://127.0.0.1:6006/?path=/story/jobs-jobcreatedialog--default-deadline-review). Await this composition’s approval before live preview/service activation.

### Reviewed default deadlines activated in the local Job creation form — October 26, 2026

The user approved the composed creation dialog. The Jobs page now uses a connected adapter that loads `/api/jobs/creation-deadline` before mounting the editable form. Initial loading/error is blocked with retry; later deadline reloads keep the mounted form and entered work intact. The endpoint requires current Job create/read/assignment authority and exposes only the default rule, opaque revision, workspace-local creation date, projected date, timezone and override capability. It requires no Settings-menu permission and exposes no reminder policy or recipient roster.

The strict create contract pairs `deadlineIntent` with `deadlinePreview` and the resulting `completionDeadline`. Workspace/default, explicit date and explicit unset remain distinct. Forged capabilities, inactive/extra fields, missing paired evidence and contradictory results are rejected. Under the existing workspace creation lock, the shared creation service reauthorizes the action, checks its actor-bound retry receipt, re-reads the default and evaluates date-only business/calendar arithmetic using the database clock in the workspace timezone. The captured timestamp also becomes the new Job’s created/updated time, so waiting across midnight cannot give the deadline a different creation day than the stored Job. Business days exclude weekends, not holidays, and counting begins after creation day.

A changed rule, local day, timezone or projected result returns a specific 409 and inserts no Job, activity, calendar membership or receipt. The live reload action refreshes only the deadline context; it retains the customer/title/owner and requires accepting a changed default and reviewing again. Confirmed writes record intent and reviewed evidence with the Job creation activity. Exact authorized retries return the original Job before re-evaluating later default changes; they cannot create a duplicate or recalculate its deadline. Manual date and explicit no-deadline overrides still require current scheduling permission; the immutable configured default can apply to a permitted creation without granting override authority.

This activation is opt-in through reviewed intent. Legacy explicit date/null create commands, including accepted-Estimate conversion’s separate reviewed flow, retain their prior meaning. Existing Jobs are never backfilled. Administrative settings now return `activation: defaults-active`, and their notice accurately says default creation is active while reminder timing/email-event delivery integration remains pending. No worker or external email is activated, no new migration/environment key is needed and no staging deployment is made.

Default-activation validation: five date-calculation/strict-contract unit tests and seven isolated deadline database journeys passed. The final timestamp check binds creation activity and the Job to the same captured instant. Existing Jobs (10), Estimates including accepted conversion (92), and settings (10) database journeys passed. Six API/browser journeys passed, covering creator-only safe preview, Office preview without administrative Settings access, Field denial, contradictory/stale evidence, exact retries after rule changes, persistent independent settings, and actual Job creation after a conflict reload that retains entered work and requires fresh confirmation. The dropdown browser test uses semantic combobox locators; no production workaround was needed for the initial locator timeout. All six updated page/activation-notice accessibility/layout combinations passed at 1440/768/320 px. No real email or Stripe call was made by the tests.

All workspace typechecks passed. Affected lint passed with only the existing unused-variable warnings in unrelated Job-message code, and whitespace checks passed. The initial isolated database run was delayed by an automatic permission-review timeout; its authorized retry and final rerun both passed. No migration, deployment or reminder delivery was triggered.

Public-boundary hardening: `POST /api/jobs` now requires the paired reviewed deadline contract, preventing omission of intent/evidence as a way around the new form. Existing API fixture factories were updated to fetch and submit that preview. The internal base schema remains compatible with separately reviewed Estimate conversion and trusted domain callers, but legacy null cannot bypass a configured relative default for an actor without scheduling/override permission. An unset workspace default still permits those legacy no-date creations. A later conversion-UI enhancement should expose the same explicit workspace-default option for permission-limited converters; this slice does not silently reinterpret their existing reviewed null/date choice. The added database assertions cover both sides of this boundary.

The older Jobs API fixture assumed Field scheduling was always denied; the approved Calendar defaults now allow primary Field scheduling. That fixture now explicitly revokes the scoped scheduling grant before asserting current denial, preserving the original authorization test’s intent.

Final hardened validation supersedes the earlier counts: six unit tests, seven deadline-activation database journeys, the Jobs (10) and Estimates (92) database regressions, and eight API/browser journeys passed. The additional API checks include the public no-evidence bypass, updated Jobs creation/retry factory and Estimate sharing fixture; the full live conflict/review/create journey passed again. All workspace typechecks passed after these changes; affected lint has zero errors and only the two pre-existing unused Job-message variables. The previously recorded ten settings database regressions and six activation-notice Storybook combinations also passed. The Storybook production build passed. No staging deployment.

Final production Next.js build passed with `/api/jobs/creation-deadline` and the hardened Job creation route. Default activation is ready for local user review: set a relative default under Settings → Deadlines & notifications, then create a Job to preview and confirm it. Review custom/no-deadline overrides where authorized. Existing Jobs keep their dates. Next single review slice remains the personal reminder-email preference and reminder template before worker delivery activation. No staging deployment.

### Personal deadline-reminder email preference in Storybook review — October 26, 2026

The user approved local default-deadline activation. The next single review slice extends the existing controlled NotificationPreferencesPage with an opt-in Job deadline reminders switch, defaulting on when the optional presentation value is absent. It is separate from visit-change and Estimate activity preferences. Its copy explains primary owner/team/additional-recipient eligibility, workspace timing and email-event rules, current Job access, and that in-app notices stay on. Personal opt-out changes no workspace rule or teammate preference.

Ten additional stories cover the combined four preferences, reminder opt-out, reminder-only save, discard, pending controls, save failure/retry, keyboard use, loading, load failure/retry and absent-value default behavior. Existing preference stories remain regression coverage. This slice is presentation-only: the live adapter does not enable the new switch, and no contract, API, database, worker or delivery behavior is changed. After component approval, review the reminder email template before persistence and delivery activation. No staging deployment.

Preference-preview validation: all 99 interaction/accessibility/layout combinations passed (33 stories at 1440/768/320 px), including the existing preferences and ten new reminder scenarios. Desktop and narrow layouts were visually inspected. Web typecheck, affected lint, whitespace checks and the production Storybook build passed. Review Settings/NotificationPreferencesPage → Deadline Reminder Emails before continuing to the reminder email template. No live integration or staging deployment.

### Deadline-reminder email template in Storybook review — October 26, 2026

The user approved the personal reminder-email preference preview. The next single slice adds Email/DeadlineReminder with approaching, due-today and overdue variants, singular day counts, long/escaped content and plain text. The branded renderer follows the existing transactional email format and consumes only a supplied recipient-authorized Job projection, completion deadline, evaluation date in the workspace timezone and workspace identity. Date-only calendar arithmetic derives the heading and day count; it does not use the browser clock or infer a visit schedule. Copy explicitly distinguishes completion deadlines from scheduled visits/arrival windows.

HTML and plain text include the Job number/title, completion deadline, reminder date, workspace timezone, scoped Job link, preferences link and recipient/access explanation. The renderer validates identities, dates, timezone and HTTP(S) origin, escapes dynamic HTML, strips subject newlines and exposes no customer/contact/internal notes or team roster. It performs no recipient selection or delivery and cannot grant access. The future worker must reauthorize, reevaluate current eligibility/settings/preferences/status/deadline and handle deduplication before calling it.

This slice adds no database migration, live preference persistence, worker activation, real email or staging deployment. Await template review before integrating the approved preference and reminder lifecycle/delivery.

Template validation: five focused renderer tests and five existing visit-email regression tests passed. All 24 Storybook interaction/accessibility/layout combinations passed (eight stories at 1440/768/320 px), including accessibility and overflow checks against the generated email markup as well as its Storybook host. The isolated inspection page avoids the intentionally script-restricted preview iframe and its loading lifecycle; no production behavior was changed for the test harness. Desktop and narrow previews were visually inspected. Data/web typechecks, affected lint, whitespace checks and the production Storybook build passed. Review Email/DeadlineReminder before the persistence/worker activation slice. No emails sent or staging deployment.


### Approved reminder preference and email connected to local delivery — October 26, 2026

The user approved Email/DeadlineReminder. The personal NotificationPreferencesPage now enables its reviewed Job deadline reminders switch live. The strict preferences contract and API carry a separate boolean, default true; omitted fields from older callers preserve the stored value. The API continues to derive identity from the session, enforce same-origin writes and scope reads/saves to current membership. Saving preferences locks the user as well as the workspace so delivery cannot race an opt-out from another workspace. In-app reminders remain on independently of email preferences and verification.

Additive migration `202610260004_deadline_reminders.ts` is applied to local development and isolated test databases only. It adds `notificationPreferences.deadlineReminderEmail`, `jobs.reminderRevision`, an indexed recipient-specific `deadlineNotifications` outbox/read history, and a Job lifecycle trigger. Changing/removing a completion deadline or crossing the active/closed boundary increments the reminder generation and immediately skips old queued emails. All trusted mutation paths share this protection, including existing UI and confirmed assistant Job changes. Ordinary edits, assignment changes, visits and no-op deadline writes do not reset the generation. Existing deadlines, Job versions and activity are preserved; no retroactive dates are queued during migration.

A minute worker evaluates today's completion-deadline occurrences using the database clock and workspace IANA timezone, under the same workspace lock used for policy/Job mutations. It recovers today's due occurrences after the configured send time, not missed dates from previous days. DST spring gaps run at the first later valid local minute; repeated autumn minutes share the same daily occurrence key. Free/Standard always use the fixed due-date offset and saved send time. Premium uses up to five current offsets and current additional recipients. Stored Premium rules remain retained but ineffective after downgrade/expiration. Primary owner, team and extras are deduplicated by user ID and reauthorized for current Job read access; invalid/removed members are excluded. Reminder in-app notices are inserted regardless of personal email opt-out or workspace email-event switches.

Uniqueness binds workspace, Job, reminder generation, semantic offset (before/on/after and days) and recipient; renaming a reminder ID or concurrent/restarted sweeps cannot duplicate an occurrence. Delivery separately rechecks Job state/deadline/generation, date/timezone, current role/resource read scope, current team/extra-recipient eligibility, paid entitlement, offset existence, workspace approaching/due or overdue email event, verified email and personal opt-out. A later saved send time postpones queued mail without consuming an attempt. Old-date/timezone messages expire instead of sending a backlog. Provider failures retry up to five times with exponential backoff and a stable `deadline-reminder-<notice-id>` provider idempotency key. The shared workspace and outbox-row locks span the provider call; SMTP can still duplicate on a crash after acceptance and before database commit, unlike provider-supported idempotency. No claim of exactly-once SMTP delivery is made.

The existing notification menu renders reminder notices using its approved generic detail layout, with scoped Job links and mark-read behavior. SQL resource scoping applies before counts, pagination and mark-read, and hidden Job details never enter projections. Notice history survives Job closure/deadline changes but remains subject to current access. The approved email renderer is used by the worker with inline branding; no customer address, notes, contact information or team roster is included.

The combined visit-email processor now also consumes the effective workspace schedule-email rule while keeping its existing personal visit preference and single combined-notice behavior. Creation/status/assignment/deadline-change event delivery remains pending; the live settings activation notice explicitly distinguishes these saved event choices from active defaults, reminders and combined visit email rules. These remaining events must reuse transactional notices rather than infer changes in the timer. Calendar assistant context/reviews remain a separate pending slice.

Validation: 18 isolated reminder database journeys passed, covering lifecycle stop/replan/reopen, same-day eligibility, concurrent planning/delivery, semantic dedupe, personal/workspace opt-outs, independent in-app notices, paid downgrade, current assignment/role/membership/feature denial, unverified users, expired dates/timezones, changed send times, deletion requests, retry limits and current authorized projection. Existing Calendar commands/combined notifications (20), Jobs (10) and Job settings (10) database journeys passed. Twenty-two focused unit tests passed, covering DST/date arithmetic, worker startup/shutdown/non-overlap/sanitized failures/template binding, email renderer and settings contract. Seven browser/API journeys passed: five settings/default/preference regressions plus the actual reminder menu/mark-read and existing combined visit preference flows. Thirty-nine affected Storybook interaction/accessibility/layout combinations passed at 1440/768/320 px. Web and worker production builds and Storybook production build passed; workspace typechecks and affected lint passed (one existing unused Estimate schema import warning). No credentials or new environment variables required.

The existing local worker was restarted after the migration and reached worker.ready. Local transport defaults to Mailpit. Automated delivery tests used injected/mocked senders; no external email provider was called. Review Settings → Notification preferences → Job deadline reminders, then use Settings → Deadlines & notifications to choose a send time and create a Job due today. The worker creates an in-app reminder and eligible local email on its next minute sweep once the send time has passed. Local inbox: http://127.0.0.1:18025. No staging deployment.

### Job-created email template in Storybook review — October 26, 2026

The user approved local reminder delivery. The next single review slice begins the remaining Job lifecycle notifications with Email/JobCreated, following the approved branded reminder/visit email layout. It shows a recipient-authorized Job number/title, creator and workspace, plus scoped Job/preferences links. It does not expose source Lead/Estimate references, customer/contact details, addresses, notes, pricing or team roster. A missing creator uses the existing teammate fallback. The recipient explanation describes primary-owner/team eligibility, actor exclusion and enabled Job activity email; this is preview copy for the future protected delivery path, not a claim that creation emails are active.

Five fictional stories cover normal creation, long content, a missing creator, escaped content and plain text. The renderer validates HTTP(S) app origin, identity and Job number/title, escapes HTML and strips subject newlines. This slice performs no external I/O and changes no Job creation transaction, preference contract, outbox, worker or live notification behavior. Existing deadline reminders stay active locally. After template approval, review a separate personal Job activity email preference before connecting creation notices transactionally; do not repurpose deadlineReminderEmail or visitChangedEmail. Status/assignment/deadline-change events remain separate subsequent slices. No migration or staging deployment.

Job-created template validation: all 15 Storybook interaction/accessibility/layout combinations passed (five stories at 1440/768/320 px), including checks of the rendered email markup separately from its script-restricted preview iframe. Desktop and narrow layouts were visually inspected. Four focused renderer tests and five existing deadline-renderer regressions passed. Data/web typechecks, affected lint, whitespace checks and production Storybook build passed. Review Email/JobCreated before the next personal preference/delivery slice. No email sent, migration, worker change or staging deployment.

### Personal Job activity email preference in Storybook review — October 26, 2026

The user approved Email/JobCreated. The next single review slice extends the controlled NotificationPreferencesPage with an opt-in Job activity switch, separate from Lead assignments, Visit schedule changes, Job deadline reminders and Estimate activity. Its copy covers creation, status, assignment and completion-deadline change events on assigned Jobs, excludes the actor’s own actions and explains that in-app notices remain on. Workspace rules, personal preferences and current Job access must all permit future email delivery. It does not alter reminder timing or reuse either deadlineReminderEmail or visitChangedEmail.

Eleven new stories cover the five-preference composition, Job activity off, activity-only save, discard, pending, retained save error/retry, keyboard operation, loading, load failure/retry, missing-value default-on and a hidden unsupported group that cannot make the form dirty. Existing preference stories remain regressions. The optional jobActivityEmail presentation value and showJobActivity visibility prop are not enabled in the live adapter. This review slice adds no API, contract, migration, live persistence, outbox or worker behavior. After approval, connect creation notices transactionally with current authorization and the separate personal preference; keep later lifecycle event slices individually reviewable. No staging deployment.

Job activity preference validation: all 132 interaction/accessibility/layout combinations passed (44 total preference stories at 1440/768/320 px), including eleven new Job activity scenarios and existing Lead/Visit/Estimate/reminder regressions. Keyboard checks verify the visible focus outline. Desktop and narrow compositions were visually inspected. Web typecheck, affected lint, whitespace checks and production Storybook build passed. Review Settings/NotificationPreferencesPage → Job Activity Emails before connecting persistence and creation-event delivery. No email sent, live integration or staging deployment.

### Job activity preference and creation notifications connected locally — October 27, 2026 checkpoint

The approved Job activity preference now persists independently through the strict session-derived notification API. It defaults on; omitted fields from older callers preserve the stored choice. The live description identifies creation as active and status/assignment/completion-deadline changes as pending, while the reviewed full-activity preview remains available for later activation.

Additive migration `202610260005_job_notifications.ts` is applied to development and isolated test databases. It adds `notificationPreferences.jobActivityEmail` and a recipient-specific `jobNotifications` outbox/read history. Shared Job creation enqueues creation notices within the same transaction as the Job, team, calendar identity, creation activity and operation receipt; rollback removes all of them, and actor-bound exact retries create no duplicate. This applies to manual and confirmed assistant creation and the conversion paths that reuse the service. Recipients are current authorized primary owner/team members, deduplicated and excluding the creator; no workspace-wide broadcast or reminder extras are implied.

Current Job scope is applied before notification projections, unread counts, pagination and mark-read, using a shared internal Job notification access helper also used by reminders. Delivery rechecks membership, resource permission, current assignment, verified email, personal Job activity opt-out and effective workspace creation-email settings. Free/Standard use fixed defaults; Premium can disable creation email without disabling its in-app notice. Messages older than 23 hours are skipped. Five bounded attempts use exponential backoff and stable provider idempotency keys; the existing SMTP acceptance/commit crash limitation remains. The worker polls every five seconds, uses the approved Job-created renderer and inline logo, reports aggregate status and waits on active work during shutdown.

Validation completed: 15 new notification database journeys, 18 reminder regressions, 20 Calendar checks, 10 Jobs checks and 92 Estimate journeys (including conversion) passed. Nineteen focused renderer/worker tests passed. Four browser/API journeys passed for settings access, independent reminder preference, reminder menu and the new Job activity persistence/creation-menu/read flow. Twenty-one affected Storybook interaction/accessibility/layout combinations, workspace typechecks, affected lint (one pre-existing unused Estimate schema import warning), Storybook build and web/worker production builds passed. The existing local worker restarted after migration and reported ready with the new jobDelivery status. No external email provider call or staging deployment.

Remaining local slices: Job status events (including complete/cancel/reopen), assignment changes and completion-deadline changes; then Calendar-specific assistant context/query/proposal reviews and final combined QA before an explicitly approved staging release. The previously noted accepted-Estimate conversion UI enhancement for the explicit workspace-default deadline choice remains a separate follow-up. ICS and Google Calendar remain deferred per the approved release scope.

### Job status-change email template in Storybook review — October 27, 2026

The user approved proceeding to Job status notifications. The next single review slice adds Email/JobStatusChanged using the approved Job-created email layout. It records the authorized Job number/title, previous/new status and actor. Completion, cancellation and reopening have distinct headings; reopening from either completed or canceled is clearly distinguished from ordinary active-status changes. Missing actors use the teammate fallback. Copy explains that the email records a transition and the Job/access may have changed subsequently. Internal notes, waiting/cancellation reasons, customer/contact details, schedules, prices and team rosters are omitted.

Ten fictional stories cover ordinary changes, waiting, completion, cancellation, two reopening paths, long content, a missing actor, escaped content and plain text. The renderer validates enum statuses, rejects no-op and closed-to-closed snapshots, checks app origin/identity/Job content, escapes dynamic HTML and strips subject newlines. It performs no transition, authorization, recipient selection or external I/O; future live delivery must enforce the full domain lifecycle/permissions and use this historical transition snapshot.

No change to status mutations, notification contracts, outbox schema, worker, preference persistence or live delivery is included in this slice. Existing creation notices and reminders remain active locally. Await email approval before wiring transactional status notices with the existing Job activity preference and effective workspace status-email rule. Assignment and completion-deadline change events remain later slices. No migration, email sent or staging deployment.

Status-template validation: all 30 distinct Storybook interaction/accessibility/layout combinations passed (ten stories at 1440/768/320 px), with generated email markup checked separately from its sandboxed preview. One initial page-inspection navigation race during Storybook refresh passed its focused three-width rerun; no production code workaround was added. Completion on narrow screens and reopening on desktop were visually inspected. Five focused renderer tests and four existing creation-renderer regressions passed. Data/web typechecks, affected lint, whitespace checks and production Storybook build passed. Review Email/JobStatusChanged before live status-event integration. No email sent, migration or staging deployment.

### Approved Job status notifications connected locally — October 27, 2026

The user approved the JobStatusChanged email and requested live integration. Additive migration `202610270001_job_status_notifications.ts` is applied to development and isolated test databases. It extends the existing Job notification outbox with nullable beforeStatus/afterStatus and a status event, preserving existing creation rows. Database constraints require valid distinct statuses for status events, prohibit closed-to-closed transitions, and require null status snapshots for creation events. Rollback refuses to discard retained status history.

The shared explicit Job status mutation enqueues recipient notices inside the same transaction as the status/version, lifecycle/calendar/reminder changes, activity and actor-bound retry receipt. No-op, invalid, stale, unauthorized and rolled-back changes enqueue nothing. Creation and status notifications share current owner/team targeting, deduplication and creator/actor exclusion. Confirmed assistant mutations use the same path. Schedule-derived status transitions retain their existing combined visit notice and do not create a second status notice.

Status snapshots are immutable event history, not inferred from the Job’s latest status. Reads apply current Job scope before counts, paging and mark-read. The existing notification menu shows previous/new status and a scoped Job link, with distinct completed/canceled/reopened headings. Delivery uses the approved status template and its recorded snapshot, while rechecking current read/assignment eligibility, membership, verification, personal Job activity preference and effective workspace status-email rule. It retains bounded retry, expiry, stable provider keys and the documented SMTP acceptance/commit crash limitation. Creation email retains its existing template/key and uses its own independent workspace event switch.

The live Job activity description now identifies creation and status (including completion/cancellation/reopening) as active; assignment and completion-deadline change emails remain upcoming. A single presentation scope prop replaces the previous creation-only boolean, keeping capability-specific preview/live copy accurate as these reviewed slices progress. No new personal preference, environment variable or assistant tool is introduced. The administrative activation notice also distinguishes active events from those still pending.

Validation completed before the interrupted browser resume: twelve new database journeys and fifteen renderer/worker unit tests passed. Existing creation notifications (15), deadline reminders (18), Calendar commands/combined notices (20) and Jobs (10) database checks passed. Workspace typechecks passed. The first browser attempt exhausted the default 30-second beforeAll budget during cold signup-route setup; the fixture now explicitly uses the intended 120-second setup budget rather than relying on the per-test timeout. The rerun passed all three browser/API journeys: independent reminder preference, creation-notice preference/menu and actual status mutation/retry/history/menu/mark-read. Twenty-seven affected Storybook interaction/accessibility/layout combinations passed at 1440/768/320 px. Affected lint has zero errors and three pre-existing unused imports/variables; whitespace checks passed. Final production builds and worker health are recorded below when complete. No staging deployment.

Status integration finalization: production Storybook, Next.js web and worker builds passed. The existing local worker was reloaded after the development migration, reached worker.ready and returned a healthy status including the Job delivery outbox. All checks above are complete. No staging deployment or external provider email was performed. Local review: have a teammate change the status of a Job assigned to you, then inspect the notification bell and eligible email in Mailpit at http://127.0.0.1:18025. The actor receives no activity notice. Next individual review slice is assignment-change notifications.

### Assignment-removal privacy decision and email preview — October 27, 2026

The user approved proceeding after local status-notification integration. Inspection of the Jobs plan confirmed that previous primary owners and removed optional members must receive one final removal notice, even when their Job-based access ends. The user explicitly chose **Job number and workspace only**, with no title or Job link, for that lost-access case. The preview also omits actor identity and the internal Job ID. This is a narrowly scoped final event confirmation; it must never restore Job access or permit reading later Job changes. Current membership/deletion state and email settings still apply at eventual delivery. Users who independently retain current workspace-wide Job access may receive the ordinary authorized projection.

Added Email/JobAssignmentChanged following the approved Job-created/status email layout. Nine fictional stories cover assignment as primary owner, addition to a team, assignment updates, lost-access removal, removal with retained workspace-wide access, long content, a missing actor, escaped content and plain text. Normal variants show authorized Job number/title, the recipient’s assignment update and actor, with a scoped Job link. The restricted final notice accepts only the Job number, shows the workspace, and links to workspace Home and personal preferences rather than the Job. No team roster, source record, customer contact data, internal note or pricing is displayed.

The renderer discriminates current-access versus ended-access projections, rejects title/ID fields in ended-access Job data and permits ended access only for removal. It validates HTTP(S) origin/identities/Job content, escapes dynamic HTML and strips subject newlines. It performs no recipient selection, authorization, mutation or external I/O. Storybook explicitly supplies the stripped removal projection to avoid merging current-access fixture details into that case; renderer tests independently reject such details.

This is the next individual component review, not live assignment delivery. No assignment mutation, notification contract, migration, worker or preference change is included. After approval, integrate assignment events transactionally, honoring previous/new/team recipients, actor exclusion, idempotency, current permissions and the newly approved minimal removal exception. Existing creation/status/reminder/visit delivery stays active locally. No emails sent or staging deployment.

Assignment-template validation: all 27 distinct Storybook interaction/accessibility/layout combinations passed (nine stories at 1440/768/320 px), including generated email markup checks. One Storybook refresh interrupted the initial long-content inspection; its focused three-width rerun passed with no product workaround. The restricted removal email on desktop and primary-assignment email on mobile were visually inspected. Five assignment-renderer tests and five existing status-renderer regressions passed. Data/web typechecks, affected lint, whitespace checks and production Storybook build passed. Review Email/JobAssignmentChanged, particularly Removed, before live assignment delivery. No email sent, migration, live delivery change or staging deployment.


### Assignment-change notifications connected locally — October 27, 2026

After approval of Email/JobAssignmentChanged, assignment events now enqueue inside the shared confirmed Job mutation transaction. Before/after recipient roles come from the locked Job and validated replacement assignments. Primary assignment, team addition, retained-recipient updates and removals are distinct events. Recipients are deduplicated, the actor is excluded, and unchanged assignments (including reordered team lists) produce no notices. Existing actor-bound receipts and transactional rollback cover activity, assignment and outbox writes together. UI and confirmed assistant mutations share this service.

Additive migration `202610270008_job_assignment_notifications.ts` extends the existing outbox with checked assignment-role evidence and an immutable Job-number snapshot, preserving creation/status history. Current Job permission still governs every ordinary notification, unread count, page, mark-read and email projection. The sole exception is the approved final removal event: a recipient who remains an active workspace member may read and mark their own removal notice even after Job access ends. Its API projection omits Job ID, title and actor entirely; the email uses only the Job number and workspace and links to Home/preferences. The exception cannot read a Job or mark anyone else’s notice. Membership loss, user/workspace deletion requests and cross-workspace requests still fail closed. A removed teammate who retains independent Job read receives the ordinary authorized removal projection. If re-added before delivery, current access is checked and the historical notice uses the current-access branch rather than claiming access ended.

Delivery rechecks the effective assignment email rule, personal Job activity preference, verified email and current membership/deletion state under existing locks. Removal delivery does not require still being assigned; other event types retain that requirement. Stable `job-assignment-<notice-id>` provider keys and bounded retry are independent of creation/status keys. Personal and administrative live copy now identifies assignment as active while completion-deadline change emails remain pending. No new environment variables or assistant tools are required. Development and isolated test migrations are applied; the existing local worker has reloaded and reports ready. No staging deployment.


Assignment integration validation: 12 new database journeys passed, covering recipient classification, minimal removal projection/mark-read, current workspace-reader access, no-op/reordered assignments, concurrent receipts, rollback/stale/unauthorized changes, ordinary-notice access loss, membership/deletion suppression, personal/Premium controls, fixed plan defaults, re-addition before delivery, stable retries and database snapshot constraints. Existing creation (15), status (12), deadline reminder (18), Job foundation (10) and Calendar commands (20) regressions passed. Eighteen renderer/worker unit tests, three live browser/API journeys and eighteen new Storybook interaction/accessibility/layout combinations at 1440/768/320 px passed. All workspace typechecks, affected lint (three pre-existing unused-variable warnings), whitespace checks and production web/worker/Storybook builds passed. The first browser run caught a client-directive ordering error, which was corrected; the final three-journey run passed. The production web build required the usual local process/port access for Turbopack. The local worker status reports ready with one ingestion worker and one retention worker; no staging deployment or external-provider test sends.

Review locally by assigning a Job to another teammate, then removing them: an active Field teammate loses Job details but retains only the Job-number/workspace removal notice. Current workspace-wide readers retain the ordinary authorized Job link. Local email appears in Mailpit. The next individual review slice is the completion-deadline change email template, followed by its integration; Calendar assistant work remains later.


### Completion-deadline change email preview — October 27, 2026

The user approved assignment integration and proceeding to the next slice. Added Email/JobDeadlineChanged using the established Job-created/status/assignment email layout and shared branding. It shows the authorized Job number/title, previous/new completion deadlines, workspace timezone and actor. Distinct set/changed/removed headings and an explicit Not set value cover nullable deadlines; moving a deadline earlier remains a changed event. Copy distinguishes completion deadlines from visit dates/arrival windows and identifies this as historical change information subject to current access.

Eight fictional stories cover ordinary change, deadline added, deadline removed, earlier deadline, long content, missing actor, escaped content and plain text. The pure renderer validates dates, rejects no-op and unset-to-unset changes, validates identity/origin/timezone and escapes dynamic HTML. Dates are formatted as workspace calendar dates without converting through the recipient’s timezone; leap-day, DST and year-boundary tests cover date preservation. The template includes scoped Job/preferences links and omits notes, customer/contact details, pricing and team rosters.

This is the next individual component review only. No migration, assignment/deadline mutation, worker, preference, notification API or staging change. Existing local notifications remain active. After template approval, connect completion-deadline change events transactionally with authorized recipients, actor exclusion, receipt idempotency, immutable date snapshots and current delivery permissions/settings, keeping deadline reminders and visit events separate.

Deadline-template validation: six new renderer tests and five existing status-renderer regressions passed. All 24 distinct story/viewport combinations passed interaction, accessibility and overflow checks, including generated email markup; a Storybook navigation refresh interrupted the first desktop DeadlineRemoved check, and its focused three-width rerun passed. Desktop/mobile previews were visually inspected. Data/web typechecks, affected lint, whitespace checks and the production Storybook build passed. Review Email/JobDeadlineChanged (Default, DeadlineAdded and DeadlineRemoved) before delivery integration. No email sent, migration or staging deployment.


### Completion-deadline change notifications connected locally — October 27, 2026

The user approved Email/JobDeadlineChanged. Actual completion-deadline additions, changes and removals now enqueue in the confirmed shared Job mutation transaction. This includes a different deadline explicitly confirmed during reopening; its status event remains a separate historical event. Unchanged dates, creation with an initial deadline, workspace default edits and visit scheduling do not produce a duplicate deadline-change notice. UI and confirmed assistant calls use the same service. Current primary owner/team recipients are deduplicated, the actor is excluded, and receipt/transaction handling prevents duplicate retries or notices from failed updates.

Additive migration `202610270009_job_deadline_notifications.ts` extends the existing outbox with nullable SQL date snapshots and the workspace timezone at the change. Constraints reject identical/unset-to-unset snapshots, missing timezone, unrelated snapshot fields and impossible SQL dates. Existing created/status/assignment history is preserved. Read/mail projection formats SQL dates explicitly as YYYY-MM-DD rather than converting them through a process or recipient timezone. Later deadline/workspace-timezone edits do not rewrite earlier notices.

The notification API, unread counts, paging, mark-read and delivery use current workspace membership and Job read scope. Deadline events receive no assignment-removal access exception. Delivery additionally requires current assignment, verified email, personal Job activity opt-in, the effective workspace deadline-email rule, current deletion state and the existing event age cutoff. Free/Standard use fixed effective defaults; Premium customizes the deadline event. Reminder preferences, offset planning and combined visit notices remain independent. Five bounded retries retain stable `job-deadline-<notice-id>` provider keys and the existing SMTP acceptance/commit crash limitation.

The worker dispatches to the approved deadline-change template and refuses startup without the new snapshot column. The local development and isolated test migrations are applied and the existing worker has reloaded. NotificationMenu now shows added/changed/removed headings, previous/new calendar dates (including Not set), recorded workspace timezone and an authorized Job link. Personal and administrative settings copy identifies all reviewed Job activity events as active. No new personal preference, environment variable or assistant tool is needed; no staging deployment.

Deadline integration validation: 15 new database journeys passed, covering nullable dates, timezone snapshots, no-op/generation behavior, concurrent receipts, stale/invalid/unauthorized requests, rollback, assistant-confirmed actions, both reopen paths, creation/schedule separation, current access, personal/Premium controls, fixed Free/Standard defaults, deletion/verification/age suppression, retry caps and SQL constraints. Existing creation (15), status (12), assignment (12), reminder (18), Job foundation (10) and Calendar command (20) regressions passed. Seventeen worker/renderer unit tests, four live browser/API journeys and fifteen Storybook interaction/accessibility/layout combinations at 1440/768/320 px passed. The new browser test initially expected 400 for an invalid date; it was corrected to the existing Job API’s 422 validation contract and its focused rerun passed. Desktop/mobile notices were visually inspected. All workspace typechecks, affected lint (three pre-existing unused-variable warnings), whitespace checks and production web/worker/Storybook builds passed. The local worker reports ready with one ingestion and one retention worker; provider calls in automated tests were mocked/injected. No staging deployment.

Review by setting, changing and removing the completion deadline of a Job assigned to another active teammate. Its notification shows the recorded previous/new dates and workspace timezone; a later edit does not rewrite it. Personal Job activity opt-out affects email only; reminder email uses its separate switch. All reviewed Job event types are now integrated locally. Next: Calendar-specific assistant context/query/proposal reviews, followed by final combined release QA. The accepted-Estimate conversion explicit workspace-default deadline UI choice remains a separate follow-up; ICS/Google Calendar remain deferred.

### Calendar assistant read-result presentation — October 27, 2026

The user approved completion-deadline notification integration and proceeding to the Calendar assistant. Inspection confirms that the current shared assistant has Lead/Customer/Work Order/Materials/Estimate registries, but no registered Calendar surface/tool and no general Jobs tool. The Calendar page does not yet publish its visible range/filter context. The older §9 Job-only examples and individual proposed tool IDs are planning references, not implemented capabilities; current shared visits and per-record permissions govern this work.

First review slice: Assistant/CalendarResultsCard, a read-only bounded result for either a scheduled range or the active unscheduled queue. It uses the shared assistant color tokens, approved Job/Work Order status badges and Calendar arrival-window formatter. One row represents one visit, explicitly labels each visible Job/Work Order and marks a shared visit as counted once. It shows assigned people once per visit, absolute workspace dates, timezone, filter labels, snapshot time, returned/total counts and callback-only View visit/Open in Calendar actions. It performs no fetch/navigation/scheduling or permission inference. The future host must supply fresh authorized results and recheck access before either action.

Presentation rejects duplicate visits/records, invalid/reversed/out-of-range schedule dates, dated unscheduled rows, invalid totals/timestamps/timezones and more than 25 rows. Loading/error/access-changed states hide previous rows, counts, filters and actions; disabled results cannot invoke callbacks. Empty and truncated sets remain distinct. Stories cover shared/Job-only/Work-Order-only rows, personal scope, unscheduled, truncation, both empty states, loading, error, access loss, disabled actions, invalid snapshots, long content and keyboard use. No live page context, model tool, stream/history, database/API/worker or staging change is included in this preview.

After this component is approved, connect Calendar context and the first scoped read operation in a separate slice. Use the established simplified domain-tool organization: a Calendar query entry point with explicit validated operations, followed later by a separate draft/proposal entry point; do not expose arbitrary schema/SQL or model commits. Reuse the current Calendar repositories and shared visit commands, including all-record scheduling authority, frozen affected sets and explicit shared-change confirmation. Read operations must deduplicate shared visits and return only current authorized record/person projections. Availability/open-date advice and scheduling/clearing/settings proposals remain later reviewed slices. No separate embedded assistant is being added to the Calendar page.

Calendar assistant result-card validation: all 39 interaction/accessibility/layout combinations passed (13 stories at 1440/768/320 px), including keyboard actions, disabled callbacks, hidden stale content, empty/truncated sets and invalid snapshots. The first accessibility run exposed status-badge contrast against the dark assistant message surface; light badge backings fixed it without changing the shared badges. The unscheduled story’s exact text assertion also exposed combined labels; date/window labels now have distinct text elements. Final full rerun passed. Desktop/mobile results were visually inspected. Web typecheck, affected lint, whitespace checks and production Storybook build passed. Review Assistant/CalendarResultsCard Default and Unscheduled before live context/query integration. No model/provider call, database/API/worker change or staging deployment.

### Calendar assistant context and read operations connected locally — October 27, 2026

After approval of CalendarResultsCard, the Calendar page now registers the `calendar` surface and publishes its current validated week/person/type/status/customer-filter intent to the shared assistant while the page is ready. The existing removable context chip shows the absolute week and Field own-only scope. Clearing the chip removes that page intent from subsequent requests. Changing weeks/filters creates a new context key; old queries/loading states do not publish stale intent. The server reconstructs context and workspace today/timezone; client labels, roles and scope claims are never accepted as authority.

One strict `calendar_query` tool implements schedule-week and active-unscheduled reads, reusing the existing Calendar repository. It is available globally, including Home, to currently authorized assistant/Calendar readers. Jobs and Work Orders remain explicitly typed, shared visits count once, Field scope/people are narrowed by the repository, and hidden linked records stay omitted. Scheduled results are capped at 25; unscheduled uses the page’s first 10-row queue with its authorized total. Title/name lengths and serialized frame size are bounded. Projections omit customer contacts, notes, addresses, price/costs, internal descriptions and scheduling review/version metadata. Responses are untrusted factual evidence, not instructions or mutation receipts.

The owned turn stores a strict result/query snapshot and current evidence fingerprint through additive migration `202610270010_calendar_chat.ts`, applied only to development and isolated test databases. One PostgreSQL metadata aggregate fingerprints all relevant Job/team, Work Order/crew, visit/link, membership/user, workspace and workspace-local-day tuple versions; no private business content is copied into evidence. Current policy/access hashes remain an independent boundary. Calendar-dependent follow-up text inherits the same stamp, so access loss or a later edit redacts both original and dependent restored answers. Empty results/counts and membership replacement are covered; an unrelated relevant workspace edit conservatively asks the user to query again rather than replaying old content.

The real graph streams Thinking first, then retrieval and answer deltas; `calendar.result` carries the approved card after a successful owned completion. Canonical history restores only currently allowed snapshots/text. The connected card reloads independently, refreshes on focus/idle, hides data after access loss, and sends metadata-only Open requests. Navigation checks current ownership, evidence and optional membership in the frozen returned visit set before building a workspace-scoped Calendar URL. No browser-supplied URL or model commit is accepted. New requests/aborts/key changes and single-flight guards prevent stale navigation.

This slice adds no scheduling/clearing, free-time guarantee, bulk operation, settings draft or separate embedded assistant. Existing Work Order proposals retain their current independently authorized behavior. Next reviews: availability/open-date advice, then shared-visit schedule/clear proposals using the existing full-record command/review service. The accepted-Estimate conversion deadline choice and later release QA remain separate; ICS/Google Calendar stay deferred. No staging deployment or live provider usage in automated checks.

Calendar read integration validation: 99 focused contract/agent/provider-adapter/graph/stream-decoder tests passed; 20 shared Calendar command and 10 Job foundation database regressions passed. Seven live local browser/API journeys passed across the full run and focused row-bound recheck: Thinking/stream/result ordering, owned replay/Open, missing/cross-user access, same-origin/forged-visit protection, a real shared Job/Work Order counted once, Field own-only rows/roster, unscheduled and Home reads, inherited-history invalidation after assignment changes, removable page context and real card navigation, permission revocation during streaming, replaced membership, and the 25-row bound with full authorized totals. The row-bound fixture initially echoed the whole tool evidence as one oversized answer chunk and correctly hit the graph answer budget; only the fictional answer was shortened and the focused recheck passed. No live provider was used.

All 57 distinct Storybook interaction/accessibility/layout combinations passed (approved presentation and six mocked connected-host stories at 1440/768/320 px). The 18 connected combinations were rerun after final lifecycle/late-navigation guards and passed. Connected coverage includes authorized visit/list navigation, disabled actions, mismatched responses, unsafe URLs and focus-driven access loss with hidden data. All workspace typechecks, affected lint, whitespace checks and web/worker/Storybook production builds passed. Existing local worker status remains ready; no new worker, environment variable, model/provider request or staging deployment.

Review locally on Calendar with “What’s on the calendar this week?” or “Show unscheduled visits,” then use View visit/Open in Calendar. Change the week/filters or clear the context chip to check relevance. Home uses the same registered tool with a workspace-current-week default; it needs no separate assistant component. Availability/open-date advice, focused-visit context and confirmed shared schedule/clear proposals remain future review slices.


### Availability-suggestion card preview — October 27, 2026

After approving the live Calendar read integration, the user approved proceeding to advice. The next individual review component is Assistant/CalendarAvailabilityCard. Following prototype 30’s count-based suggestions and §5/§9, it shows up to three dates to review, the people checked (including for no-match results), complete visible visit counts, an optional requested arrival window, the absolute checked range and workspace timezone/snapshot time. It explicitly calls these schedule-based suggestions rather than confirmed availability. Working hours, time off, holidays, travel, external calendars and full work duration are not inferred.

No-known-overlap and timing-not-checked are explicit input states. Unknown arrival windows have a prominent caveat; a wholly untimed day cannot claim a known timing check. Partial known windows may show the limited overlap finding alongside the unknown-window caveat. Four or more existing visible visits trigger the approved nonblocking busy-day warning. A no-match result does not label the person fully booked. Three returned suggestions and the full candidate count are distinct. Own scope rejects any other person’s row before rendering.

Review date in Calendar and Open in Calendar call injected result/suggestion-identity callbacks only; there is no booking, scheduling, target assignment, network request or URL construction. The future connected host must reauthorize and map the frozen suggestion to its saved query. The card validates dates/range, totals, counts, duplicate identities, own scope and timing claims. Loading/error/access-loss states hide stale dates, people, counts and controls; disabled actions cannot call the host.

Eighteen fictional stories cover three suggestions, own schedule, count-only, all-unknown and partial timing, timing not checked, busy day, more candidates, no matches, loading, error, access change, disabled, invalid own scope/range/timing, long content and keyboard use. The shared assistant palette, existing arrival-window formatter and shared warning badge are reused. This is presentation only: the existing live calendar_query still supports schedule/unscheduled reads; no availability operation, ranking/search algorithm, role change, database/API, worker or staging deployment is added. After approval, implement scoped advice using complete active permitted visit data across Jobs and Work Orders for the checked people (not a truncated chat card or a customer/type filter that could hide a conflict), deduplicated visit/person IDs, intersecting-window rules, current permissions and the existing evidence/replay/navigation safeguards. The metadata must identify the checked people even when there are no matches; own scope must reject any other person before projecting names or suggestions. Scheduling proposals stay a separate later review.

Availability-preview validation: all 54 interaction/accessibility/layout combinations passed (18 stories at 1440/768/320 px), including keyboard callbacks, disabled controls, no-match target metadata, own-scope rejection, unknown/partial timing, invalid timing claims, busy-day warnings and hidden stale content. An initial Storybook dependency/navigation refresh interrupted the first desktop check; the final complete run passed. Desktop/mobile previews were visually inspected. Web typecheck, affected lint, whitespace checks and production Storybook build passed. Review Assistant/CalendarAvailabilityCard Default and BusyDay before live advice integration. No API/model/provider/database/worker or staging change.


### Calendar date advice connected locally — October 27, 2026

The user approved Assistant/CalendarAvailabilityCard and a default search of **14 calendar days starting on the workspace-local current date, weekdays only**. An explicit date checks that day; an explicit range is limited to 31 calendar days. Explicitly requested weekends are supported. The unified `calendar_query` now includes an `availability` read operation, available through the shared assistant on Home, Calendar and the other registered surfaces with current assistant/Calendar read access.

This is general schedule-based advice, not a Job-specific permission to schedule. It checks all permitted active Jobs and Work Orders for the requested people, independent of customer/type/status page filters and the 25-row read-card cap. Each explicit shared visit counts once per person; ordinary team/crew membership contributes to workload. Exact authorized person ID/full-name matching rejects ambiguity and unavailable targets. `me` is the default without selected person context; `all` checks at most ten authorized people. Field/own scope refuses checking other people or the whole team. No roster is disclosed in a clarification. Fewer existing visits rank first, then fewer unknown windows, then earlier dates and stable person identity; return three candidates plus the full count.

Any intersecting known window excludes that person/date for the requested window; adjacent windows are safe. Untimed visits remain visible as a timing caveat; all-unknown days never claim their timing was checked. No requested window means counts only. Four or more visits retain the existing Busy day warning and do not block advice. No candidate means no match under this check, not fully booked. Working hours, time off, holidays, travel, external calendars and full duration remain unknown.

Advice uses the existing private Calendar snapshot/fingerprint lifecycle: persist evidence before streaming; recheck deltas, completion, replay, inherited history, GET and Open. The connected host independently rechecks on mount/focus/idle, hides unavailable data, guards response identity/mode and validates navigation. POST accepts only owned turn/result and a frozen suggestion identity; the server derives date/person and clears conflict-hiding filters. No browser/model dates, person IDs, URLs or mutation authority are accepted for Open. Old scheduled/unscheduled snapshots remain readable through a strict result union. No new migration, environment variable or worker task is needed.

Next single review: shared-visit schedule/reschedule proposal presentation, then integration through the existing complete-record Calendar command service. Clearing follows as another reviewed action. Any future target-specific change requires schedule permission and current responsibility on every affected active record at proposal and confirmation. Advice itself does not grant those permissions. No staging deployment is included.

Date-advice validation: 97 targeted contract/domain/agent/stream unit checks passed, and all 12 isolated local Calendar chat journeys passed. A final focused rerun of three advice/scope/navigation journeys also passed after strict page-context validation. Coverage includes complete counts beyond 25 cards, shared Job/Work Order deduplication, conflict-hiding page filters, own-scope denial, ambiguity, explicit weekends, default weekday search, known/adjacent/unknown timing, metadata-only navigation, inherited evidence, changed membership and permission revocation during both week-read and advice streaming. Thirty connected Storybook interaction/accessibility/layout combinations passed at 1440/768/320 px; connected advice previews were visually inspected on desktop/mobile. All workspace typechecks, affected lint, whitespace checks and web/worker/Storybook production builds passed. The expanded test fixture ages only its own completed test turns between independent journeys to respect the unchanged ten-turn/minute app limit; membership-removal fixtures run after assignment-dependent checks because removing membership correctly clears assignments. Tests use fictional responses and the isolated local test DB; no live provider calls, staging deployment or real notifications are added.


### Calendar schedule/reschedule proposal presentation — October 27, 2026

After approval of the live date-advice integration, the next single component is **Assistant/CalendarScheduleDraftCard**, following prototype 30's From → To / Confirm / Cancel draft and the approved complete-record Calendar scheduling dialog. It reviews one visit with its previous and proposed workspace-local date/window, timezone, deduplicated assigned people and the **entire affected active Job/Work Order set**. Shared visits explicitly move all listed active records together; moving only one Work Order requires canceling this proposal and explicitly separating that visit first. Completed/canceled records retain their history. Assignments and completion deadlines remain unchanged, while a Needs Scheduling Job becomes Scheduled under the existing service rules; other active statuses remain unchanged.

The proposed date is required; clearing is intentionally a separate later reviewed action. Schedule-new, reschedule and arrival-window-only changes share this card. Untimed work, overlap, workload, past-date and after-deadline warnings are injected by the future authorized host for the exact proposal. They do not block confirmation and do not imply actual availability. No client count calculation, model-authored authority, editable embedded form or inferred role grants are added.

The pure component requires an independently loaded host context bound to proposal ID/hash, visit ID/revision and the exact full record/version set, with current full read/schedule capability. Missing access, replaced/stale bindings, superseded proposals and invalid/closed/duplicate records hide the old review. Empty/partial sets are rejected rather than filtered or truncated. Existing badges, Calendar date/window formatting, shared assistant palette and 15-minute proposal-window validation are reused. Expiry removes actions and is also checked at click time; duplicate clicks are locked while submitting and while awaiting the authoritative result. Callback success does not mark a proposal saved; only the controlled host state does. Errors allow retry without falsely reporting success. Confirm/Cancel emit only frozen proposal identity/hash/visit/revision plus the decision, never browser-authored dates, assignments or record sets.

Review Default (pending shared reschedule), ScheduleNew, WorkOrderOnly, Warnings and ManyRecords, plus the expiry, no-change, loading, access-loss, stale-set and submission states. This is a **Storybook presentation review only**: no Calendar proposal API/tool, persistence, database migration, actual scheduling mutation, worker, provider call or staging deployment is added. After approval, connect a unified Calendar proposal entry point and server-owned confirmation to the existing atomic all-record command/review service, reauthorizing the full affected set and comparing locked versions at confirmation. Receipt/history access must remain independently authorized; a model or browser callback can never prove a save.

Schedule-proposal presentation validation: all **90 interaction/accessibility/layout combinations** passed (30 stories at 1440/768/320 px), including full nine-record review, deduplicated people, callback-only metadata, cancellation, keyboard focus, single-flight submission, delayed authoritative status, retries, exact expiry, disabled/no-op controls and hiding stale/unauthorized details. Twelve review-safeguard unit tests passed for bound IDs/hash/revision/full record versions, expired/future/overlong windows, invalid/clear schedules, closed/duplicate records and window-only changes. Web typecheck, affected lint, whitespace checks and production Storybook build passed. Desktop/mobile pending shared reviews were visually inspected. Default stays pending for design review; separate ConfirmSchedule/CancelProposal stories exercise the controlled fictional receipt. Review before live proposal integration. No API, database, provider, worker or staging changes in this slice.


### Calendar schedule/reschedule proposals connected locally — October 27, 2026

The user approved the schedule review. `calendar_propose_action` is now a separate explicit draft entry point beside `calendar_query`, registered globally wherever the shared assistant operates, including Home and Calendar. It requires assistant/Calendar read plus a scheduling launcher grant; the selected visit is independently loaded and requires complete current read/scheduling authority on **every active linked record**. Field must have primary responsibility on each affected Job/Work Order; ordinary team/crew membership cannot authorize the change. A Job/Work Order number resolves only within the authenticated workspace; a UUID is an explicit Calendar visit identity. Missing references require clarification. Null can use a server-resolved open Work Order detail reference. Calendar peek/focused-visit context is not inferred from a title, current filters or a list position and remains follow-up work.

The model supplies an absolute date and explicit arrival-window intent: `keep` preserves the current window unless the user asks to change it; `set` requires an offered window; `unset` removes only the window when explicitly requested. Legacy null-without-mode input also preserves the current window. The scheduled date is mandatory; clearing, assignment/deadline edits and linking/separation are not part of this tool. The review contains the full current active set and versions, assigned people, From/To and frozen advisories. Complete authorized Calendar entries, not chat row caps or customer/type filters, supply intersecting-window, busy-day and unknown-timing warnings. Past-date and after-deadline warnings are included. Large reviews are declined rather than truncated.

Local additive migration **202610270011_calendar_proposals.ts** adds private `chatCalendarProposals`, minimal `chatCalendarProposalAudit` and a bounded `chatTurns.calendarProposalEvidence` array. Its pending-thread uniqueness serializes replacement proposals; the new request supersedes older pending reviews in the same actor/thread. Turn/thread/workspace/user ownership, current membership tuple, policy/grants and relevant implemented Calendar permissions bind the stored proposal; a hash binds the frozen command, full review, authority and advisory snapshot. The existing Calendar fingerprint protects current versions, memberships, names, workspace timezone/day and other schedule changes. Chat retention cascades proposal payloads with turns/threads; the minimal hashed audit follows existing workspace/user lifecycle behavior. No reset or historical Job/Work Order merging occurs. This migration alone was applied to local development and test databases; an unrelated pending Estimate migration in development was left untouched.

Preparation writes only the private proposal/audit/evidence, with abort/lease checks. `calendar.proposal` streams opaque review metadata **after** completed-turn evidence validation. It does not stream private review fields to the model. The connected host independently GETs the owned, completed proposal, validates its exact binding and rechecks on focus/idle. Source turns that fail, cancel or remain active cannot authorize confirmation. Missing/currently revoked access and conflicts hide stale details. A chat “yes” never confirms. Browser POST accepts only workspace plus the frozen proposal identity/hash/visit/revision and Confirm/Cancel; strict contracts reject browser-authored schedules, record sets, roles or arbitrary actions. Origin and authenticated actor checks apply.

Confirm runs inside the workspace write lock and proposal row lock. It reloads authority, full active membership and versions, checks hash/expiry/advisory evidence and invokes the existing `scheduleCalendarVisit(..., 'assistant-confirmed')` command with the **stored** command. All records, history, activity, the combined recipient-scoped notification, operation receipt and proposal audit/state commit together. Exact actor-bound repeated confirmation returns the recorded result without saving twice; a different decision conflicts. A canceled proposal saves no schedule. Confirmed views require an actual validated command receipt and current result evidence, not a successful browser callback. Their old binding is the stored intent; receipt status is derived from the saved result. Later relevant edits may invalidate the conservative snapshot and require a new read. Terminal receipt cards can be independently reauthorized even when earlier answer/read context is redacted after the save.

Proposal-derived history references are inherited only from assistant messages retained in the bounded model history, tied to the same actor/workspace/thread and revalidated before every released delta, completion/replay and subsequent tool. Replacing a pending proposal removes its superseded dependency from the new turn. A failed authority/version/evidence check cannot be revived through old answer text. The confirmed proposal card refreshes its owned transcript and dispatches an invalidation event so the currently visible Calendar, Jobs or Work Orders route reloads authorized data without remounting list filters; the event itself carries no data or authority. Existing Work Order independent-schedule tools retain the shared-visit guard; the model is instructed to prefer the complete Calendar proposal for scheduling.

Validation: all **13 new live local proposal journeys** passed, including full shared review, metadata/Origin/ownership rejection, explicit confirmation/retry, Field primary responsibility, stale versions and inherited evidence, superseding/cancellation, revocation/membership replacement, exact server expiry, transaction rollback, uncapped advisories, pre-completion/stream revocation, live Calendar refresh/reload, keep/unset window intent, evidence-bound no-op answers and open Work Order context/detail refresh. All **12 existing Calendar read/advice journeys** also passed; **20 shared-command/notification regressions** passed. **108 targeted unit checks**, **24 connected Storybook interaction/accessibility/layout checks** at 1440/768/320 px, workspace typechecks, affected lint, whitespace checks and production web/worker/Storybook builds passed. Early checks corrected the launcher to use record-permission checks rather than collection-scope checks, and brought assignment/edit fixtures into compliance with the existing domain rules. The relevant implemented-permission fingerprint is consistent for web/data adapters; unrelated module flags do not grant scheduling authority. Tests use fictional model responses and the isolated Docker test database; notification/outbox behavior is tested without real provider sends. No staging deployment or new environment variables.

Review locally through the global assistant: name an existing Job/Work Order and a date, inspect the complete review, then Confirm or Cancel. The same implementation serves Home and Calendar; no separate Home agent update is required. Next single component: clear-schedule review, followed by its integration. Focused-visit context and final grouped release QA remain separate follow-ups before an explicitly approved staging deployment. ICS/Google Calendar remain deferred.

A final privacy journey covers no-op/already-set replies. Both these replies and oversized-review clarifications retain the existing Calendar read stamp even though no proposal row is created. Assignment/access changes invalidate those answers and their inherited context. Confirmed reviews label the old window as Previous schedule and the recorded result as Saved schedule; six focused receipt/cancellation Storybook checks passed after that copy correction. The Work Order detail browser journey confirms that a null reference uses the current authorized record and its client-held details refresh after confirmation; Jobs/Work Order lists keep filters through their existing scoped reloads.


### Clear-schedule assistant review presentation — October 27, 2026

The approved schedule/reschedule card now also presents an **explicit clear intent** in Storybook, following the existing Calendar clear-schedule dialog and screen 30 scheduling prototype. Review **Assistant/CalendarScheduleDraftCard → ClearSharedVisit**. It shows the current schedule, the proposed Not scheduled state, deduplicated assigned people, timezone and every affected active Job/Work Order. The shared-visit notice explains that all listed records lose their date and arrival window together. Scheduled Jobs return to Needs Scheduling; other active statuses, assignments and completion deadlines remain unchanged. Closed records retain their historical schedule. Clearing just one Work Order requires canceling and explicitly separating its visit first.

Clear reviews reuse the same independently bound full record/version context, access checks, expiry, metadata-only Confirm/Cancel, single-flight submission and authoritative-result handling. A missing date on an ordinary scheduling proposal is still invalid: clear intent must be explicit, the existing schedule must have a date and both target fields must be null. Already-unscheduled and irrelevant overlap/workload-warning payloads are rejected. Confirmed clear previews label the old schedule Previous schedule and the result Saved schedule; a successful callback alone does not claim a save.

Nine additional fictional stories cover shared clearing, explicit confirmation/cancellation, a Work Order alone, an In Progress Job, expiry, incomplete records, access removal and waiting for authoritative state. This slice changes presentation only. The live tool/API/storage schemas still require a scheduled date and reject clearing. No migration, provider/worker change or staging deployment. After design approval, connect explicit clearing through the same stored-proposal and atomic Calendar command boundary, with full authority/version/evidence rechecks.

Clear-review validation: 17 targeted presentation/contract unit checks passed. All 117 Storybook interaction/accessibility/layout combinations passed (39 stories at 1440/768/320 px), plus three focused confirmation checks after the fictional host was updated to show the resulting Needs Scheduling status. Desktop/mobile clear reviews were visually inspected. Web typecheck, affected lint, whitespace checks and the final production Storybook build passed. Await design approval before live clear integration.


### Approved clear-schedule assistant integration — October 27, 2026

After approval of ClearSharedVisit, explicit clearing is connected locally through the existing global `calendar_propose_action`, protected proposal API and shared connected host. The tool requires operation clear with null scheduled date/window and explicit unset mode. The stored review uses explicit clear intent; ordinary scheduling continues to require a date, preserving older stored schedule reviews and their hashes. Clear proposals require an existing date, show every active linked record and omit inapplicable overlap/workload/past-date advisories. Already-unscheduled replies retain Calendar evidence and create no new proposal.

All active linked records are reauthorized at preparation and browser confirmation, including Field primary responsibility on every record. The same owned completed turn, private thread, current membership/policy, hash/revision/full version set, expiry, evidence and receipt checks apply. No chat yes or model-authored command can save. The existing atomic Calendar command removes both date and arrival window, restores Scheduled Jobs to Needs Scheduling, preserves other active statuses and leaves assignments/deadlines unchanged. Closed record history is untouched. Confirmation, activity, scoped combined notifications, command receipt and audit commit together; cancellation saves nothing and exact retries do not duplicate the write. Confirmed cards independently reload the saved receipt and refresh the visible Calendar/Jobs/Work Orders data globally. No separate Home assistant update, DB migration, new environment variable, worker task or staging deployment.

Next separate section after local approval: focused Calendar visit context, then grouped release checks before any requested staging rollout. Joining/separating from chat, bulk operations and external calendar sync remain outside this action.

Clear integration validation: all 19 local proposal journeys passed (18 in the main run and the closed-history journey after adding its required cancellation-reason fixture). Six new journeys cover complete shared clearing, browser-only confirmation/replay/idempotency, Field responsibility and revocation, cancellation/expiry/stale versions/transaction rollback, closed-record preservation, already-unscheduled evidence invalidation and Calendar refresh with restored receipt. All 103 targeted contract/presentation/agent unit checks, 20 existing Calendar command/notification regressions and 36 connected Storybook interaction/accessibility/layout checks passed. Workspace typechecks, affected lint, whitespace and production web/worker/Storybook builds passed. The production web build was rerun successfully with local build-process permissions after the sandbox blocked a temporary port bind. No application fix was needed for either the fixture or build-environment correction. No staging deployment.


### Focused Calendar visit handoff preview — October 27, 2026

After approval of clear-schedule integration, the next single component update is **Calendar/CalendarVisitPeekDrawer → AssistantReady / AskAssistant**. The existing visit drawer gains an optional **Ask assistant about this visit** action. Its presentation callback emits only the selected visit identity. The fictional handoff closes the drawer and opens the existing global AssistantPanel, with a removable context chip listing the visible linked Job/Work Order numbers. It sends no message automatically and adds no embedded assistant. Clearing the chip returns keyboard focus to the composer; closing chat restores the Calendar launch control. The label is presentation only and grants no authority.

The host independently supplies assistant availability. Read-only scheduling can still allow assistant help, while busy responses disable switching context, absent assistant access hides the action, and loading/error states reveal no stale visit actions. Existing Schedule/Reschedule behavior is unchanged. Ten additional stories cover ready/handoff, removing context, read-only scheduling, busy/no-access/loading, unscheduled/long content and keyboard handoff with focus restoration.

This is a presentation review only: CalendarRoute does not yet pass the callback, no selected visit is sent in a chat request, and no context schema/API/model/proposal/database/worker/staging change is included. After approval, wire the explicit handoff and server-authorized selected visit identity to the global assistant. Preserve week/filter context, remove the selected reference when context is cleared or replaced, reauthorize current scoped visit data and evidence on every relevant boundary, and resolve null proposal references only from that explicit Calendar selection. An explicit Job/Work Order reference must still resolve independently; selecting a visit cannot bypass the existing full active-record scheduling checks. Missing/stale/unavailable selections must ask for a fresh selection rather than guess from titles, filters, list order or old conversation text.

Focused-visit preview validation: 66 interaction/accessibility/layout checks passed across 22 stories at 1440/768/320 px (63 in the complete run, then all three keyboard-handoff checks after adapting synthetic/native dialog test handling). The real browser also verifies native Escape dismissal and focus restoration; the Storybook play verifies keyboard activation of Close chat. Desktop/mobile drawer and global-assistant handoffs were visually inspected. Web typecheck, affected lint, whitespace and the final production Storybook build passed. No shared modal behavior was changed. Await component approval before live focused-context integration.


### Approved focused Calendar context connected locally — October 27, 2026

The visit drawer now hands off to the existing global assistant with an explicit selected visit/revision and removable record-number context chip. No message is sent automatically and an existing unsent draft is preserved. The drawer closes before the global modal opens; closing chat returns focus to the stable Calendar container. Handoff stays disabled while the assistant, current normalized week/query or peek is not ready. Read-only scheduling can still allow help. Clearing the chip removes context from new requests, and week/filter changes, refreshed Calendar data and page unmounting invalidate the selected context. A fresh explicit selection can reattach the same visit after clearing.

The browser sends only strict `{id, revision}` identity metadata on the Calendar surface. Before accepting a turn, the server reloads the current scoped visit, rejects stale/missing/foreign selections and persists its Calendar evidence stamp. The model gets only a bounded, explicitly untrusted current-page visit summary with permitted linked records and crew; no contact/location/private parent fields or client capabilities are forwarded. Field reads omit other people and unreadable shared records. The existing access and Calendar fingerprint lifecycle protects released deltas, completion/replay and dependent history after record/assignment/policy/membership changes.

Null-target Calendar proposals resolve only this explicit current selection and recheck the selected revision. Schedule/reschedule/clear still require permission on **all** active linked records, current Field primary responsibility, frozen full versions/revision/hash, expiry and explicit browser confirmation. A partial/read-only focused summary supplies no write authority. Explicit Job/Work Order references resolve independently; missing context asks for a fresh selection/exact reference and does not fall back to old chat text, titles or list positions. Existing Work Order detail targeting remains supported. No new DB migration, environment variable, worker task, embedded assistant or staging deployment.

Next: grouped Calendar release validation after local approval, before an explicitly requested staging rollout. Settings drafts, chat join/separation, bulk operations, ICS and external calendar sync remain deferred.

Focused-context integration validation: all 24 local proposal/context journeys passed across the complete run and focused reruns. The five new journeys cover server-projected selected data, null-target resolution and removal, wrong surfaces/forged fields/stale revisions/foreign access, Field-only projections with blocked partial shared mutations, mid-stream reassignment and inherited-answer invalidation, plus actual drawer-to-global-chat handoff. The browser also verifies no automatic send, identity-only request data, context-chip removal, no old implicit target after removal, and recovery from a stale selection without blocking chat. One fixture lookup was corrected to find the readable Work Order when its Job is hidden; the browser check also caught and fixed premature handoff during week normalization. Stale-selection recovery uses a generic context conflict and an allowlisted client message; real permission failures remain access denials. All 93 targeted contract/agent checks, workspace typechecks, affected lint, whitespace checks and production worker/Storybook builds passed. No live provider calls or staging deployment.

Final production web build passed after the client recovery-message fix. Focused Calendar context is ready for local user review; grouped release QA is the next separate section.


### Grouped Calendar release QA — October 27, 2026

The local grouped QA section is complete. [Calendar release QA](calendar-release-qa.md) records the commands, coverage, findings, reproducible performance fixture and deployment boundary. All **57 browser/API journeys**, **186 unit checks**, **123 database regressions** and **54 Storybook interaction/accessibility/layout checks** passed across the initial runs and corrected focused reruns. Workspace typechecks and production package/web/worker/Storybook builds passed; the new benchmark has separate clean lint/type/build checks. No provider calls or staging deployment were made.

Older browser tests now account for implemented Files/Job team chat, wait for the actual Work Order source-Job fetch and committed note/saved schedule state, and set up Field scheduling denial independently. These are test corrections; application behavior was not changed in this QA section.

**Two release gates remain open.** The planned 10,000-Job benchmark uses five warm-ups and 50 samples per role with scoped count/crew assertions and EXPLAIN plans. Local read-service P95 is **341.22 ms Owner / 306.12 ms Field**, exceeding the under-300 ms target. Existing indexes are used but full visible-record projection is repeated in the queue/read queries. The fixture is cleaned up and the benchmark deliberately fails this target. Repository-wide lint separately reports **7 errors / 43 warnings** in file-storage/Estimate work outside the Calendar integration; their exact locations are listed in the report. Neither failure is waived or hidden by the passing builds.

Next: optimize Calendar reads without weakening scoping/full-active-set checks, rerun the same benchmark and security regressions, then resolve the owning modules' lint errors. Approve a release snapshot and inspect the real staging migration ledger before a separately requested web/worker rollout. Preserve other unreviewed Estimate/Gantt/storage changes. ICS, external calendars and the other deferred features remain out of scope.

### Calendar release blocker fixes — October 28, 2026

The two gates identified by October 27 grouped QA are now resolved locally. Calendar reads select visits in the requested week plus the complete unscheduled queue before projecting details. Canonical shared-visit dates retain every readable active linked record; hidden active-link counts and complete-record scheduling authorization remain unchanged. The restricted workspace roster still considers its full authorized record set. No cache, migration, new environment variable or row truncation was introduced.

The same isolated 10,000-Job benchmark now measures **Owner P95 129.35 ms / Field P95 79.88 ms**, both below 300 ms, with five warm-ups and 50 samples per role after other test/build workloads stopped. All **20 Calendar command/database checks**, including new far-future visit and all-week queue assertions, **186 unit checks**, **58 browser/API journeys** across the grouped run and focused rerun, and **54 Storybook interaction/accessibility/layout checks** passed. The browser suite also covers the Estimate conversion form touched by the lint correction. File initial loading, processing polling, ready-state stop/navigation cleanup and all four worker thumbnail checks passed. Workspace typechecks and production package/web/worker/Storybook builds passed. Repository-wide lint passes with **zero errors and 43 existing warnings**. The Work Order creation test now waits for a successful POST and allows destination navigation to complete; its saved version/link assertions remain intact.

[Calendar release QA](calendar-release-qa.md) preserves the initial failures and records the fixes, current evidence and deployment boundary. Next: approve the exact release snapshot, inspect staging's migration ledger and backup readiness, then perform a separately requested matching web/worker rollout. Other Estimate/Gantt/storage work remains in the checkout and must be scoped deliberately. No staging deployment or actual provider delivery test was performed in this section.

### Approved complete-app staging release — October 28, 2026

The user approved deploying the complete current application, including Estimates and Gantt. [Staging release record](calendar-staging-release.md) captures the exact source manifest, same-volume logical backup/restore, 39 applied migrations (92 total), interrupted cutover recovery, matching successful web/worker deployments and bounded live checks. Calendar/Gantt rendering, shared schedule/clear/idempotency, Field denial, combined in-app notices, actual-model SSE reads and explicit browser-only shared proposal confirmation passed. Worker readiness and scheduler checks passed. Production and database/Redis deployments are unchanged. Live notification inbox/reminder delivery and off-volume disaster recovery remain operational follow-ups, not verified claims of this release.
