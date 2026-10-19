# Calendar page plan

Status: **Core Jobs UI/API connected locally; Calendar pending** — October 19, 2026. October 14 product decisions remain the baseline; the implementation refresh below supersedes outdated current-state and assistant assumptions.
Scope: the scheduling calendar (`/calendar`), scheduling a job from the calendar, the "Needs a scheduled date" queue, team availability, deadline visibility, deadline reminders and notification settings, optional Google Calendar visibility, and a schedule-aware assistant.

> Folder note: the request said "documents"; this repository's documentation folder is `docs/`, so the file lives here.

## How to use this document

Walk it top to bottom in a QA session, as we did for [customers-page-plan.md](customers-page-plan.md) and [leads-page-plan.md](leads-page-plan.md). Every requirement has an ID (`VWS-`, `SCH-`, …) and a **Decision / Status** column to fill in: `Agreed`, `Change`, `Defer`, or `Question`. Section 12 collects open questions (each with a recommendation); section 13 holds risks. Nothing here is built until a requirement is `Agreed`.

Sources: `prototype/prototype-screen-30-scheduling-calendar.html` (primary), `-31-deadline-notifications.html`, `-32-integrations.html` (Google Calendar card), `-09/-10/-12` (jobs board, table, detail), `-11-create-job.html`; [job-module-plan.md](job-module-plan.md), [user-journeys.md](user-journeys.md), [permission-catalog.md](permission-catalog.md), [application-structure-plan.md](application-structure-plan.md), [context-aware-agent-architecture.md](context-aware-agent-architecture.md), [salesmora-product-roadmap.md](salesmora-product-roadmap.md), [component-conventions.md](component-conventions.md), [chat-tools.md](chat-tools.md).

---

## October 19 implementation refresh

- Preserve the existing decided Week/Monday/seven-day MVP, fixed arrival presets, peek-before-edit, warning-only conflicts, Field visibility limits and explicit assistant confirmations. Scheduling remains a Jobs-domain operation.
- Jobs foundations are the current slice. Contracts/migration/services precede reviewed Jobs create/board/detail UI and then Calendar components; one component at a time with Storybook approval before the next.
- Reuse the existing timezone, shared notification menu/preferences, worker, generic UI primitives and global private assistant. Per-job team chat is separate planned Jobs work with separate membership/visibility rules.
- Replace the historical per-action tool lists in §9 with permission-filtered Jobs/Calendar query/propose operations in the established domain registry. No model commit/SQL tool. All writes delegate the same Jobs transaction service; all confirmations recheck current policy, scope, version, expiry and source evidence.
- The agreed Field schedule rule is a permission **and** primary-owner check, never a bypass around revoked grants. The initial stored/default code template still denies Field scheduling: define a versioned migration/cutover before activation, preserving explicit Owner policy choices.
- `jobs.update` is still unreviewed; do not expose ordinary edits until its field contract/approval. Permanent job deletion stays unavailable. Attachments, team chat, conversion, notifications and reminders must not be claimed complete with the data foundation.
- Reminder settings and Premium entitlements remain a separate reviewed slice. Confirm the exact fixed Free/Standard reminder offset before activating delivery; the old Q15 gives an example rather than an exact rule.
- No Google/ICS, additional views, drag-and-drop, recurring/multi-day work or estimate visits in this MVP. Assistant bulk scheduling stays a separate later reviewed action slice, rather than being implied by the initial single-job service.

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
| AVL-3 | Overlap/overload warning in the dialog when the owner already has N visits that day or an overlapping window | Agreed: warn at 4+ visits or exact window overlap (Q8) | Q8 |
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
| NTF-6 | Worker evaluates rules daily/at send time in the workspace timezone; one delivery per job × rule × due date × channel × recipient (idempotent) | Agreed (Q16: send time configurable, default 9:00 AM) | |
| NTF-7 | Reminders stop when the job is Completed/Canceled or the deadline changes; a changed deadline re-plans reminders | Agreed | |
| NTF-8 | Reminder content: job title, customer name, deadline, link only; no address/notes/contact details (follows leads E1) | Agreed | |
| NTF-9 | Scheduled-date changes notify the job team, skipping the actor | Agreed | |
| NTF-10 | Per-user opt-out for email; in-app always on (follows leads E3). Lives on the shared per-user notification preferences surface (see leads §8.1, shared surface note); the workspace-level settings page does not hold it | Agreed | |
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
| QLT-2 | Performance: week query P95 < 300 ms at 10k jobs; index/`EXPLAIN` checks | Agreed | |
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
| Q8 | Availability depth | Count-based visits per day, warn at 4+ per member and exact window overlap (**recommended**); no hours/time off | **Decided:** Count-based visits per day; warn at 4+ per member and on exact window overlap; no hours/time off. |
| Q9 | Which statuses appear on the grid; completed history | Scheduled and In Progress on the grid (prototype); Waiting with a date shown muted; Completed/Canceled hidden (**recommended**) | **Decided:** Scheduled and In Progress on grid; Waiting with a date muted; Completed/Canceled hidden. |
| Q10 | Past dates | Allow with a warning (data entry after the fact) (**recommended**) / block | **Decided:** Allowed with a warning. |
| Q11 | Create a job from the calendar | Defer; Jobs owns creation (**recommended**) | **Decided:** Deferred; Jobs owns creation. |
| Q12 | Google Calendar / ICS | MVP none (prototype footnote); ICS download for the viewer in Phase 1.5; Google read+write Phase 2 (**recommended**) | **Decided:** No external calendar in MVP; ICS download Phase 1.5; Google read+write Phase 2. |
| Q13 | Multi-day or recurring jobs | Out of scope; single scheduled date per job (job plan) (**recommended**) | **Decided:** Out of scope; single scheduled date per job. |
| Q14 | Deadline markers on the grid | Show a small deadline marker on the due day (filterable) in a later slice; cards show the hint now (**recommended**) | **Decided:** Cards show the hint now; deadline marker on the due day (filterable) in a later slice. |
| Q15 | What do non-Premium plans get? | One fixed default reminder (e.g. on due date) and default recipients; Premium unlocks multi-offset and expanded recipients (**recommended**) | **Decided:** Non-Premium: one fixed default reminder and default recipients; Premium: multi-offset and expanded recipients. |
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
