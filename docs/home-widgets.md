# Home screen update plan

**Status:** Content, revised static HTML prototype, all nine component sections, composed page, and live Home integration approved November 15, 2026. Implementation and validation complete.

## Agreed direction

- Attention-first: help users identify what needs action today.
- Design Owner/Admin and Member experiences together, including Office and Field work profiles.
- Keep the existing assistant surface, below the welcome header; do not introduce a second assistant surface.
- Explore all nine sections below in the static HTML prototype. Inclusion in the production page depends on content review and verified data support.
- Work in order: content decisions, static HTML prototype, Storybook components, component review, updated page, integration, final review.
- Request review and approval at each checkpoint before proceeding.

## Starting point and constraints

The current [Home route](../apps/web/src/app/(auth)/home/page.tsx) composes the shared workspace shell, welcome/empty state, Create lead action, and a lead-pipeline widget when lead records exist. It also handles email verification and invitation delivery notices; preserve those flows.

Use the established [owner prototype](../prototype/prototype-screen-03-home-owner.html) and [team prototype](../prototype/prototype-screen-04-home-team.html) as design references, adapted to the current application brand and shared shell. Preserve the prior removal of redundant Home title/subtitle and workspace-details actions unless explicitly changed during review.

Reuse [HomeOverview](../apps/web/src/features/workspace/home-overview/home-overview.tsx), [LeadPipelineWidget](../apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx), and other suitable existing components rather than creating parallel implementations.

Older prototype assumptions about unavailable modules are not a current data audit. Verify the implemented sources and capabilities before promising any widget or action.

## 1. Define page content

### Proposed content matrix

The following definitions are proposed for approval, not shipped behavior. Counts describe the complete authorized set, never just the visible preview rows.

| Section | Proposed content and limit | Primary action | Audience |
|---|---|---|---|
| Needs your attention | Up to 5 distinct records: overdue active jobs first (earliest deadline), flagged awaiting intake next (oldest received), unassigned open leads next (oldest created), then other waiting/needs-scheduling jobs (oldest updated). A record appears once at its highest priority. Show the reason, customer/record, owner if visible, and relevant date. | Open the existing record/review screen; assignment or status changes remain in the existing reviewed flow. | All, limited to readable records and useful permitted actions; Field emphasizes assigned jobs. |
| Summary metrics | Owner/Admin/Office: new leads in the last 30 calendar days, active jobs, jobs needing attention, awaiting intake. Field: assigned visits today, active assigned jobs, assigned jobs needing attention. Omit inaccessible metrics. No percentage comparisons or revenue estimates. | Open the corresponding authorized list/calendar; use a filtered destination only when supported. | All, using the actual collection scope; Office does not imply workspace-wide access. |
| Lead pipeline | Existing 5 stages: New, Contacted, Estimate sent, Won, Lost; stage counts and proportional bars with an explicit scope label. | View leads using the existing pipeline destination. | Anyone with lead-read access; lower priority for Field. |
| Recent activity | Latest 5 supported lead/job events across readable records, newest first, with actor, event, record, and timestamp. Do not expose note bodies or claim to be a comprehensive audit log. | Open the record. Add a history/report destination only if available and authorized. | All, scoped to readable records. |
| Today's schedule | First 5 authorized visits for today in workspace timezone; arrival-window order, then a separate time-not-set group. Linked job/work-order records count as one explicit visit. Include customer, location, arrival window, and visible crew. | Open visit/calendar; no invented exact arrival time. | All with calendar access; Field prioritizes own visits. |
| Active jobs | Up to 5 jobs in needs-scheduling, scheduled, in-progress, or waiting; overdue first, then today's scheduled work, then earliest deadline, with stable record-number ordering for ties. Show status and deadline/schedule context. | Open job; View jobs for the remaining records. | All with job-read access; Field prioritizes own assignments. |
| Team workload | Up to 5 current teammates, showing open assigned leads (New/Contacted/Estimate sent) and active assigned jobs as separate counts; highest active-job count first, then open-lead count, then name. No utilization/capacity percentages. | Open jobs/leads filtered by owner where supported. | Only viewers authorized for workspace-wide collection data and teammate identities; omit otherwise. |
| Intake review | Awaiting count and first 3 awaiting items, flagged first then oldest received; source, received time, and review flags. Approved/dismissed items do not count as pending. | Review intake or open the existing review screen. | Anyone with intake-read access; decisions still require their own capabilities. |
| Quick actions | Up to 3 shortcuts. Owner/Admin/Office: Create lead, Review intake, Open calendar. Field: Today's schedule, Open my jobs, Create lead if permitted. Substitute only useful authorized actions; do not add a new task feature. | Existing route or canonical action flow. | Capability-gated for every user. |

**Attention definitions:** An active job needs attention if it is overdue, waiting, or needs-scheduling, counted once even when multiple conditions apply. Overdue means its explicit completion deadline is before today in the workspace timezone. Missing deadlines are not overdue. Unassigned open leads exclude Won/Lost and archived records. No invented follow-up deadlines, stale-record thresholds, or urgency scores.

**Date windows:** Last 30 calendar days means today plus the preceding 29 dates in the workspace timezone. Use the same timezone for metrics, deadlines, and schedule, and display it near today's date. Derive local boundaries using existing timezone helpers, not a fixed 720-hour interval.

### Proposed layout and variants

- Show the welcome greeting first at the top of the main content, with date but no standalone Workspace/scope badge; avoid a second Home title or repeated workspace details. Put the top quick actions inside an accessible three-dot disclosure beside notifications, with keyboard access, Escape dismissal, and outside-click dismissal. Keep useful actions in the empty-state onboarding callout. Place the existing assistant below this header and preserve its permission/unavailable treatment.
- Use the application's `NotificationsNoneOutlined` bell icon with an accessible name, not a text-only Notifications button. Reuse the connected notification menu in the implementation.
- Place summary callout boxes above two independent desktop card stacks. Cards within each column have a consistent gap and do not wait for the other column's row height.
- Owner/Admin/Office desktop: left stack contains attention, intake, and pipeline; right stack contains today's schedule, active jobs, team workload (when authorized), and recent activity.
- Field desktop: left stack contains today's schedule and active jobs; right stack contains assigned attention and recent activity.
- Mobile: summary callouts precede a single card stack ordered attention, schedule, intake, jobs, pipeline, workload, activity; Field puts schedule before attention. Keep quick actions near the top and do not hide primary record actions behind hover.
- Use clearly labeled scope within widgets, such as "Workspace", "Accessible work", or "Assigned to you", rather than a redundant header badge; never label restricted aggregates as workspace totals.

### State rules proposed for approval

- Genuine empty sections explain the state, such as "Nothing needs attention" or "No visits scheduled today", with a useful permitted destination.
- A truly new workspace retains the welcome/get-started treatment. No accessible records is not proof that the workspace is empty.
- Unauthorized sections and actions are omitted without revealing hidden counts.
- Unsupported sections are labeled as proposed/unavailable in the design review but omitted from production until supported.
- Loading and data errors are distinct from zero/empty states. A failed section has an explicit message and retry; other successful sections remain useful.

### Repository evidence and implementation boundaries

- [Authorization types](../packages/contracts/src/authorization/types.ts) currently encode `owner`, `admin`, `office`, and `field` as roles. Earlier planning language about a separate Member role and independent work profiles does not match this contract. Prototype the four existing experiences without changing the authorization model; a role/profile migration is outside this Home update.
- [Workspace capabilities](../apps/web/src/server/authorization/permissions.ts) expose leads, jobs, calendar, and intake reads. Permission scopes must be checked for both lists and aggregates.
- [Job contracts](../packages/contracts/src/job.ts) provide statuses, assignment/filter inputs, deadline filters, timezone/today, and active/overdue/waiting/unassigned metrics. A combined attention count requires a distinct-record query, not addition of overlapping totals.
- [Calendar contracts](../packages/contracts/src/calendar.ts) provide explicit visit identities, arrival windows, timezone/today, and collection scope. Reuse the canonical visit projection to avoid counting linked records twice.
- [Intake contracts](../packages/contracts/src/lead-capture/intake.ts) define awaiting/approved/dismissed states and duplicate/missing/uncertain/capacity flags.
- The [Home lead store](../apps/web/src/server/leads/store.ts) already returns all five pipeline stages through an authorized aggregate.
- [Lead history](../packages/contracts/src/lead-history.ts) exposes supported per-record events. A cross-record Home feed still needs a dedicated authorized projection; do not fetch every detail record to construct it.
- [Report readers](../apps/web/src/server/reports/store.ts) have activity/team projections, but Reports permissions are development-only in the current enabled surface. Home must not bypass or depend on Reports-only grants to ship its own widgets.
- Schedule/job/intake surfaces exist, but Home-specific combined queries, workload aggregation, and new-lead window counts still need implementation. The prototype is not evidence that those data contracts already exist.

No permission grants change as part of this design. Restricted records must not leak through totals, activity, or workload summaries.

**Checkpoint:** Approve the content matrix, role/profile variants, metric definitions, and handling of unsupported sections.

**Approved November 15:** Proposed content and four existing role experiences; workspace timezone and today plus the preceding 29 dates for new leads; label unsupported sections during prototype review and omit them from production until supported.

## 2. Create and review the static HTML prototype

- Update the established Home prototype files with fictional, internally consistent sample data; no backend calls or real mutations.
- Show populated Owner/Admin and Office/Field profile variants, permission-limited views, first-use/empty states, and desktop/mobile layouts.
- Keep the existing assistant below the welcome header and distinguish simulated interactions from live behavior.
- Make proposed controls navigate, demonstrate sample state, or clearly indicate unavailable behavior.
- Review information hierarchy, density, wording, primary actions, and responsive ordering in the browser.
- Iterate until the page content and layout are approved.

The [updated Home review prototype](../prototype/prototype-screen-45-home-review.html) is a single standalone HTML file linked from both established Home prototypes. It retains their navigation/journey references while applying the current brand and assistant placement. Preview controls cover all four existing roles, populated, new workspace, nothing-needs-attention, permission-limited, loading, and attention-error states. Workload and cross-record activity are explicitly marked as proposed data connections. Fixture totals are derived from the same sample records shown in widgets.

**Prototype validation November 15:** Browser checks passed for 72 role/state/width combinations at 1440px, 768px, and 320px, including overflow checks (1px tolerance), a single page heading, empty-state composition, and permission-limited section omission. Owner fixture metrics are 6 new leads, 8 active jobs, 4 distinct attention jobs, and 3 awaiting intake items; Field metrics are 3 visits, 3 active jobs, and 1 attention job. Retry, assistant simulation, record dialog opening/closing, and keyboard Enter opening/closing were checked. Inline script syntax and all 12 local prototype destinations were validated under Node 22. No live data or production authorization was tested by these prototype checks.

**Design revisions November 15:** Welcome greeting moved to the top, text-only notification control replaced with the app's outlined bell icon, and summary callouts moved above independent left/right card stacks to remove shared-row whitespace. Apply the same ordering and layout during implementation. All 72 role/state/width checks passed again, including welcome-first ordering, metrics above cards, independent 20px desktop stack gaps, restricted-section omission, and no horizontal overflow. Node 22 validation confirmed script syntax and an exact match with the app's installed notification icon.

**Checkpoint:** Approve the HTML prototype before React implementation.

**Approved November 15:** Revised prototype, including welcome-first header, canonical notification icon, no header scope badge, three-dot quick-action disclosure, and independent card columns below summary callouts.

## 3. Build and review Storybook components

After prototype approval, inventory reusable components and agree on a component build order. Start with the attention queue and quick actions; then address summary metrics, pipeline refinements, and the remaining approved widgets.

### First component: Needs your attention

The [HomeAttentionWidget](../apps/web/src/features/workspace/home-attention-widget/home-attention-widget.tsx) is the canonical presentation component for both Storybook and the future page. It accepts a typed ready/loading/error state. The caller must provide distinct authorized records in approved priority order, an authorized total, formatted metadata, and workspace-scoped record destinations. No live queries or authorization policies are changed in this step.

**Component review revision November 15:** "Needs your attention" is a prominent level-two headline (24px), with no subheadline or scope description underneath. The owning page still supplies authorized records; removing presentation copy does not change access scope.

The widget renders up to five records, explicit empty/loading/error states, retry/pending behavior, unique accessible action names, and a remainder explanation. Unauthorized sections are omitted by the future owning page; the assigned-only story demonstrates already-scoped inputs, not a client-side authorization mechanism.

Review Default, Office, Assigned Only, Empty, Loading, Error, Retrying, Keyboard, Five Item Limit, Long Content, Mobile, and Long Content Mobile before proceeding to the next component.

**Validation November 15:** Targeted widget ESLint and web TypeScript checks passed under Node 22. All 12 stories passed interaction, WCAG 2 A/AA and 2.1 AA accessibility, and zero-horizontal-overflow checks at 1440px, 768px, and 320px (36 cases). Review at http://127.0.0.1:6007/?path=/story/home-homeattentionwidget--default using the existing Storybook server. Record links are fixture destinations; live navigation and authorized data projection remain for the page integration step.

**Approved November 15:** Attention widget with prominent H2 headline and no subheadline.

### Second component: Home actions menu

The [HomeActionsMenu](../apps/web/src/features/workspace/home-actions-menu/home-actions-menu.tsx) reuses the existing MUI Menu/MenuItem and shared MoreHorizOutlined icon. The caller supplies only authorized actions, each with either a workspace-scoped destination or a callback to the canonical action flow. Empty action lists render no trigger. The menu supports keyboard navigation, focus restoration, Escape and outside-click dismissal. The production page will supply up to three useful shortcuts; permission filtering remains server-owned.

Review Default, Select Action, Keyboard, Escape, Outside Click, Field, Single Action, No Actions, Linked Destinations, and Mobile at http://127.0.0.1:6007/?path=/story/home-homeactionsmenu--default.

**Validation November 15:** Targeted menu ESLint and web TypeScript checks passed under Node 22. All 10 stories passed interactions, WCAG 2 A/AA and 2.1 AA accessibility, and zero-horizontal-overflow checks at 1440px, 768px, and 320px (30 cases). Linked destinations were checked without navigating to fixture routes. No live page integration or permission changes in this step.

**Approved November 15:** Home actions menu. Both approved components are grouped under Home in the Storybook sidebar; source-code folders remain unchanged.

### Third component: Summary callout boxes

The [HomeSummaryMetrics](../apps/web/src/features/workspace/home-summary-metrics/home-summary-metrics.tsx) composes the existing shared MetricCard without changing it. Business variants show new leads, active jobs, distinct jobs needing attention, and awaiting intake; assigned-work variants show today's visits, active assigned jobs, and assigned jobs needing attention. Labels sit beside the number, matching Reports. Scope, date basis, and description appear in the shared HelpTooltip, opened by click, tap, or keyboard activation. There is no extra visible section headline.

Only authorized metrics are supplied by the future page. Each has a ready/loading/error state; real zero remains distinct from unavailable data. Successful metrics can link to authorized workspace-scoped destinations; errors expose individual retry controls so other metrics remain usable. The shared card handles count formatting and unavailable/loading presentation. No totals, date windows, or authorization rules are calculated in this UI.

Review Default, Office, Assigned Work, Zero, Loading, Partial Error, Retrying, Keyboard, Permission Limited, No Access, Large Counts, Mobile, and Assigned Work Mobile at http://127.0.0.1:6007/?path=/story/home-homesummarymetrics--default.

**Validation November 15:** Targeted summary ESLint and web TypeScript checks passed under Node 22. All 13 stories passed interaction, WCAG 2 A/AA and 2.1 AA accessibility, and zero-horizontal-overflow checks at 1440px, 768px, and 320px (39 cases). Counts and destinations match the approved sample definitions; live data integration remains deferred until page composition.

**Review revision November 15:** Applied Reports-style beside-number labels and moved descriptions into contextual help. Added Description Tooltip coverage for keyboard opening, description visibility, closing, and focus restoration. Lint, web TypeScript, and all 14 stories at three widths passed again (42 interaction/accessibility/layout cases) under Node 22.

**Tooltip copy revision November 15:** Omit the redundant "Workspace" prefix from business metric tooltips. Keep metric definitions/date basis and meaningful restricted-scope wording such as "Assigned to you" or "Accessible work". The future page must supply the same copy convention; workspace-scoped destinations and authorization are unchanged.

**Approved November 15:** Revised summary callouts, beside-number labels, description tooltips, and no redundant Workspace prefix.

### Fourth component: Lead pipeline

Reuse the existing [LeadPipelineWidget](../apps/web/src/features/workspace/lead-pipeline-widget/lead-pipeline-widget.tsx); no duplicate dashboard component or live behavior change. Its stories now appear under Home, and mobile variants use the configured phone viewport. Added the approved eight-lead sample and workspace-scoped linked navigation. The default story checks every stage's count, accessible value text, and exact proportional bar width.

Review Default, Home Sample, Linked Pipeline, Empty, First Lead, Pipeline Unavailable, Keyboard, Large Counts, Mobile, and Mobile Large Counts at http://127.0.0.1:6007/?path=/story/home-leadpipelinewidget--home-sample.

**Approved November 15:** Lead pipeline with "A quick view of your current opportunities" moved from the visible subheadline into the shared HelpTooltip beside the heading. Description Tooltip story covers keyboard opening, description visibility, closing, and focus restoration.

**Tooltip validation November 15:** Targeted lint, web TypeScript, and all 11 pipeline stories at three widths passed under Node 22 (33 interaction/accessibility/layout cases).

**Validation November 15:** Targeted pipeline ESLint and web TypeScript checks passed under Node 22. All 10 stories passed interactions, WCAG 2 A/AA and 2.1 AA accessibility, and zero-horizontal-overflow checks at 1440px, 768px, and 320px (30 cases). The current widget remains a ready-data component; loading/error and scope presentation must be addressed when the page's data orchestration is implemented, never by passing failed counts as zero.

### Fifth component: Today's schedule

The [HomeScheduleWidget](../apps/web/src/features/workspace/home-schedule-widget/home-schedule-widget.tsx) uses a narrow projection of the canonical CalendarVisit contract and existing calendar arrival-window/date formatting. The caller supplies distinct authorized visits for today, ordered by arrival window and stable record identity, plus the complete authorized total and workspace-scoped calendar destinations. The widget renders up to five visits; linked records remain together in one row with one visit action.

The heading has contextual help rather than a descriptive subheadline. Date/timezone remain visible. Rows include arrival window (or explicit not-set text), customer, location, assigned crew, and linked record numbers. Empty, loading, and error/retry states are separate; unavailable data never becomes zero visits. No calendar data queries or live navigation are changed in this step.

**Review revision November 15:** Compact schedule rows use 12px vertical padding, inline arrival window/title, and a combined crew/record line. All visit details remain available without truncation, and visit actions retain a 44px minimum touch target.

The Open calendar header link uses the same forward-arrow icon, spacing, and styling as View pipeline.

Review Default, Assigned Work, Shared Visit, No Arrival Window, Missing Details, Empty, Loading, Error, Retrying, Five Visit Limit, Description Tooltip, Long Content, Mobile, and Long Content Mobile at http://127.0.0.1:6007/?path=/story/home-homeschedulewidget--default.

**Validation November 15:** Targeted schedule ESLint and web TypeScript passed under Node 22. All 14 stories passed interactions, WCAG 2 A/AA and 2.1 AA accessibility, and zero-horizontal-overflow checks at 1440px, 768px, and 320px (42 cases). Assigned-only inputs, shared-visit identity, five-row limit, record links, and tooltip keyboard interaction are covered. Server-side day selection, timezone boundaries, authorization, and sorting remain for live integration.

**Approved November 15:** Today's schedule with compact rows and the matching arrow-styled Open calendar link.

### Sixth component: Active jobs

The [HomeActiveJobsWidget](../apps/web/src/features/workspace/home-active-jobs-widget/home-active-jobs-widget.tsx) uses a narrow JobView projection, the canonical JobStatusBadge, and the existing job date formatter. Its type excludes completed/canceled jobs. The caller supplies distinct authorized active jobs in approved order, workspace-local overdue flags, the complete authorized total, and workspace-scoped record/list destinations.

Rows are compact with title/status, customer/owner/number, and deadline/schedule context. No deadline, no schedule, and unassigned owner states are explicit. The explanation lives in shared contextual help beside the H2 headline; View jobs matches the pipeline arrow link. The component caps the preview at five jobs and separates empty/loading/error/retrying states.

Review Default, Assigned Work, Needs Scheduling, Empty, Loading, Error, Retrying, Keyboard, Five Job Limit, Description Tooltip, Long Content, Mobile, and Long Content Mobile at http://127.0.0.1:6007/?path=/story/home-homeactivejobswidget--default.

**Validation November 15:** Targeted widget ESLint and web TypeScript passed under Node 22. All 13 stories passed interactions, WCAG 2 A/AA and 2.1 AA accessibility, and zero-horizontal-overflow checks at 1440px, 768px, and 320px (39 cases). Default desktop rows measured 103px, below the 125px compact-row threshold. No live data queries, authorization changes, or job mutations were introduced.

**Approved November 15:** Active jobs.

### Seventh component: Intake review

The [HomeIntakeWidget](../apps/web/src/features/workspace/home-intake-widget/home-intake-widget.tsx) uses a narrow IntakeListView projection and canonical intake source, flag, and action labels. The caller supplies authorized awaiting submissions in review order, the complete authorized total, timezone, and scoped destinations. The widget previews three items, with Review or View details according to each record's review permission. No decisions or mutations are introduced.

The heading uses a description tooltip and an arrow-styled Review intake link. Empty, loading, error, and retrying states remain distinct. Compact rows combine name and summary, use 8px vertical padding, and retain source, received time, flags, wrapping for long content, and 44px action targets.

Review the 15 populated, view-only, flag, missing-detail, state, keyboard, limit, tooltip, timezone, long-content, and mobile stories at http://127.0.0.1:6007/?path=/story/home-homeintakewidget--default.

**Validation November 15:** Targeted ESLint, web TypeScript, and all 15 stories at 1440px, 768px, and 320px passed under Node 22 (45 interaction/accessibility/layout cases). Default desktop rows measure 77px, reduced from 117px. The earlier run encountered a Storybook hot-reload initialization error; the complete post-edit run passed without browser errors. Live authorization, sorting, and data integration remain deferred pending component approval.

**Approved November 15:** Intake review with compact rows.

### Eighth component: Team workload

The [HomeTeamWorkloadWidget](../apps/web/src/features/workspace/home-team-workload-widget/home-team-workload-widget.tsx) previews five distinct current teammates, with names on the left and separate active-job/open-lead counts on the right. Counts stack on narrow screens, retaining the left/right arrangement. Authorized count links retain 44px targets; without a supported teammate-filtered destination, counts are plain text. No generic list is presented as a filtered result.

The caller owns authorization for workspace-wide collections and teammate identities, counts, and ordering (active jobs descending, open leads descending, then name). Restricted state renders nothing and accepts no teammate data. Loading and failure never appear as zero work; zero assigned work remains a real ready state. Tooltip copy defines counts and explicitly disclaims capacity, availability, and utilization.

Existing Team report contracts describe lead ownership and primary/supporting job responsibilities separately; this presentation does not combine report totals or bypass development-only report grants. Live integration must supply a verified, distinct assigned-job aggregate and authorize any actual destinations. The Authorized Destinations story uses explicitly fictional Storybook routes.

Review at http://127.0.0.1:6007/?path=/story/home-hometeamworkloadwidget--default.

**Validation November 15:** Targeted ESLint, web TypeScript, and all 14 stories at 1440px, 768px, and 320px passed under Node 22 (42 interaction/accessibility/layout cases). Left/right separation is checked across every row and width, including long content. Default desktop rows measure 37px; rows with authorized links measure 61px. Awaiting component approval; no live queries, permissions, or page integration changed.

**Approved November 15:** Team workload with names left and counts right.

### Ninth component: Recent activity

The [HomeActivityWidget](../apps/web/src/features/workspace/home-activity-widget/home-activity-widget.tsx) displays up to five supported lead/job events, using a narrow projection of ActivityReportEvent and the existing activity action/domain labels. Its types restrict actions to their supported lead/job domains. The caller supplies safe actor labels, readable record destinations, workspace timezone, and distinct events sorted newest first with stable domain/event ID ties. No note bodies or raw changes are accepted as display inputs.

Compact rows put event, actor, and record link on the left and the localized timestamp on the right, with a semantic time element and 44px record-link target. The description tooltip explains scope and that this is not a comprehensive audit log. Empty, restricted, loading, error, and retrying states remain separate. No unsupported history destination or fabricated total is shown.

Review at http://127.0.0.1:6007/?path=/story/home-homeactivitywidget--default.

**Validation November 15:** Targeted ESLint, web TypeScript, and all 15 stories at 1440px, 768px, and 320px passed under Node 22 (45 interaction/accessibility/layout cases). Checks cover record destinations, event order, actors, semantic timestamps, timezone formatting, five-event limit, plain-text rendering, restricted omission, retry, keyboard tooltip behavior, no horizontal overflow, left/right separation, and touch targets. Default desktop rows measure 101px. Live event queries and authorization remain deferred; existing development-only Reports grants must not be bypassed during Home integration.

**Activity compactness revision November 15:** Combine event and actor on one wrapping line above the record label inside a single 44px-minimum link. Default desktop rows are now 61px instead of 101px. Render date and time as separate nonwrapping lines so AM/PM stays with the time. Targeted lint, web TypeScript, and all 45 activity interaction/accessibility/layout cases passed again under Node 22, including a single-line time assertion at every width.

**Approved November 15:** Recent activity with compact 61px desktop rows and nonwrapping time/AM-PM. All nine planned component sections are now approved. Next checkpoint is composing the reviewed components into the updated Home page; live data integration follows page review.

For each component, one at a time:

1. Define typed inputs, copy, actions, and applicable states using existing project conventions.
2. Implement one canonical component used by both Storybook and the live feature. Connected stories mock API responses; never duplicate feature markup in a preview-only implementation.
3. Add stories for populated, empty, loading, error/retry, permission-limited, long-content, and mobile states where applicable.
4. Add interaction and accessibility checks for meaningful actions, keyboard operation, labels, and state transitions.
5. Review in Storybook and obtain approval before moving to the next component.

Verify backend contracts before fixing component inputs. Add shared orchestration only where needed; do not introduce live page integration ahead of component approval.

**Checkpoint:** All required components and their relevant states are approved.

## 4. Compose the updated Home page

The canonical [HomePageView](../apps/web/src/features/workspace/home-page-view/home-page-view.tsx) composes the approved widgets inside the real WorkspaceShell. An optional shell composition slot places the welcome, canonical connected notification menu, and Home actions above the existing assistant without reordering other pages. HomeOverview retains its default behavior; an optional hidden header lets the composed page reuse its existing onboarding callout without a duplicate welcome.

Summary callouts precede independent desktop stacks with 24px card gaps. Narrow layouts interleave the approved priorities, with schedule first for Field. Missing optional inputs omit inaccessible sections; restricted workload/activity inputs contain no records. Loading and failed pipeline states wrap the existing pipeline component without substituting zero counts. Existing account/invitation notices can be supplied beneath the welcome/assistant and before metrics.

Full-page stories include Owner, Admin, Office, Field, Quiet, New Workspace, Permission Limited, Loading, Partial Error, Account Notices, Actions Keyboard, Mobile, Field Mobile, and Long Content. Notification API responses are mocked; record data and destinations are fictional. The live Home route is unchanged, and no data queries or permission grants have been added.

Review at http://127.0.0.1:6007/?path=/story/home-homepageview--owner.

**Validation November 15:** Node 22 targeted ESLint and web TypeScript passed. All 37 composed-page, WorkspaceShell, and HomeOverview stories passed at 1440px, 768px, and 320px (111 settled interaction/accessibility/layout cases). Explicit layout checks verify welcome first, mobile order, and independent desktop stacks with exact 24px gaps. WCAG 2 A/AA and 2.1 AA checks and zero horizontal overflow passed. The Owner story assertion was corrected to use the existing pipeline's canonical heading rather than inventing a new label.

**Approved November 15:** Composed Home layout and live integration.

### Live integration

The [Home route](../apps/web/src/app/(auth)/home/page.tsx) now uses [HomeRoute](../apps/web/src/features/workspace/home-page-view/home-route.tsx), which projects server inputs into the same reviewed HomePageView. Server [Home snapshot reads](../apps/web/src/server/home/read.ts) hold the canonical authorized workspace transaction and isolate each section in a savepoint. Unexpected section failures are logged and displayed with retry; unrelated sections remain usable. Retry refreshes server data and current grants. Authorization failures are never converted into successful empty results.

Native [Home data readers](../packages/data/src/home/read.ts) apply existing Lead/Job SQL scopes before counts, ordering, and previews. Metrics use complete authorized sets: new leads cover today plus 29 preceding local dates, active jobs exclude closed jobs, and attention jobs use a distinct union of overdue/waiting/needs-scheduling. Missing deadlines are not overdue. Field reads include only owned Leads and primary/supporting assigned Jobs; duplicate participation counts a Job once.

The Home schedule reader reuses canonical Calendar projections, counts explicit distinct visit identities for today, and loads at most five visits with unset arrival windows last. Intake reuses canonical answer/capability projection, selects flagged awaiting items before oldest receipt time, and preserves the original Intake list's newest-first behavior. The attention widget merges bounded candidate previews by approved priority and sums disjoint record totals; any failed contributing collection makes attention explicitly unavailable.

Team workload requires workspace-wide Lead and Job collection grants plus the canonical Lead assignment-roster grant. It counts distinct primary/supporting assigned Jobs per current teammate and open assigned Leads, with no utilization inference. Counts remain plain text because a generic owner-filtered Jobs route would exclude supporting assignments.

Recent activity uses native surviving readable Lead/Job parents and shared safe action-summary SQL, not the Reports host or its development-only grants. Each source and final preview are bounded to five events; events sort newest first with stable domain/event ID ties. Notes and raw payloads never leave the data layer. Actor labels use current authorized workspace membership, with an explicit former/unavailable label rather than private historical names. Unsupported summaries fail explicitly.

Create lead remains in the three-dot menu and genuine empty-state onboarding. Supported destinations include Leads' 30-day filter, pipeline view, Field's `mine=true` Jobs filter, awaiting Intake, and today's Calendar. Email verification, invitation-delivery status/retry, sign-out, workspace selection, notifications, and the existing assistant remain intact. Empty onboarding is shown only when all contributing readable data is successfully known empty.

**Live validation November 15:** Under Node 22, targeted lint, web/data TypeScript checks, five Home projection tests, eight fresh-database rehearsals, and the optimized production build passed. Five targeted browser scenarios passed across the combined runs: live Home across roles and widths with explicit failure/retry and revocation; Home lead creation/persistence; floating assistant focus/draft preservation; all-role Home/create authorization; and assigned Field pipeline isolation/navigation. Existing expectations were updated for the approved menu, genuine zero pipeline, and canonical pipeline-view destination. The role regression needed a 120-second cold-compilation allowance instead of its original 30-second timeout.

The configured test database has a legacy migration ledger. It was not rebuilt or modified; integration tests used uniquely named temporary baseline databases with the runtime database role, and removed those databases afterward. The production build used a separate output directory to avoid interfering with the user's running dev server.

**Final review:** Open http://127.0.0.1:3000/home and sign in. The integrated browser currently shows sign-in; no real account credentials were used for validation.

**Final approval November 15:** User approved the integrated Home page ("looks good"). The staged Home redesign is complete.

- Compose approved components into the existing shared shell with welcome first, the canonical notification menu, assistant below the welcome header, and independent card stacks beneath summary callouts. Preserve full-width responsive content; add a Home-specific shell composition option if needed without reordering other pages.
- Connect verified data sources scoped to the authenticated user's authorized current workspace and record access.
- Apply capability checks at the server boundary and to exposed actions.
- Use real values only; do not fabricate trends, activity, deadlines, or unsupported totals.
- Preserve welcome/onboarding, Create lead, email verification, invitation notices, and workspace selection.
- Handle partial data failures explicitly without presenting unavailable data as zero or an empty workspace.
- Verify page navigation and record destinations. Change assistant logic only if separately approved and required.

**Checkpoint:** Review the integrated page across roles/profiles and populated/empty workspaces.

## 5. Validate and document

- Run targeted existing lint, type checks, component/story tests, and integration tests under Node 22.
- Verify cross-workspace isolation, restricted-record visibility, unauthorized actions, and role/profile behavior.
- Check metric definitions and time boundaries against real data.
- Review desktop and narrow mobile widths, keyboard navigation, accessible headings, and no horizontal overflow.
- Confirm existing onboarding and account notices still work.
- Update this document with approved content, shipped behavior, deferred items, and validation results.

**Completion:** The approved page is integrated, verified, and documented.

## Home content width — October 11, 2026

Home uses the shared shell's full-width option so the assistant and dashboard occupy the available main area instead of being capped at `max-w-4xl`. Responsive edge padding remains 24px on small screens and 40px from the small breakpoint. Form pages retain the standard content width.

Validation: workspace lint/typecheck and all seven shell Storybook interaction/accessibility checks passed; desktop/320px previews have no horizontal overflow. Restored the chat textarea's accessible name after its visible label was removed.
