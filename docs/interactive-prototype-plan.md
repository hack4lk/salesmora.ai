# SalesMora Interactive Prototype Plan

**Status:** Working plan based on the current product documentation. This plan describes a clickable product prototype, not production behavior or a commitment to ship every proposed feature.

## Purpose

Build and review SalesMora as a sequence of connected screens. Each screen should answer one product question, demonstrate its key interactions, and link to the next screen in a realistic user journey. Complete and review one screen before expanding the prototype to the next.

The prototype should make the documented product principles visible: role-aware, simple-first setup; progressive detail; and user control over configuration and consequential actions. Use fictional sample business data. Do not connect real email, payment, CRM, or other external services.

## Source documents and scope

This plan synthesizes the README, product roadmap, user journeys, campaign dashboard, reporting and export plan, job module plan, and end-to-end user-flow diagram. Those documents are a mix of confirmed requirements, proposals, and open decisions. Prototype labels and interactions should preserve that distinction; use plausible examples for undecided areas and mark them for review.

The roadmap defines Phase 1 as the CRM, paid, and core intake foundation, including website forms/widgets and Gmail intake with supervised review. Phase 2 adds advanced workflow automation, follow-up sequences, campaign analytics, and Google Calendar. Phase 3 covers operations and connector expansion; Phase 4 covers scale and ecosystem. The reporting plan places basic CRM reporting in Phase 1. The job plan assigns core jobs and attachments to Phase 1 and campaign-configured job conversion/checklists to Phase 2.

## Prototype rules

- Use persistent signed-in navigation on every screen: Home, Leads, Customers, Estimates, Jobs, Calendar, Reports, and Campaigns in the primary sidebar; Settings stays at the bottom and opens Business profile, Team, Integrations, Workflows & notifications, and Plan & billing.
- Use Owner, Admin, and Member as permission roles. Office and Field are work profiles that can change home-screen priorities but do not grant access. Prototype role switching should respect that distinction; approved Home priorities, metrics, and direct actions are documented below.
- Every meaningful button should navigate, open a dialog/drawer, change visible sample state, or show a clear unavailable/confirmation state. Avoid decorative controls that appear functional.
- Include representative states: empty, populated, loading, validation error, success, permission-limited, and attention-needed when they apply.
- Keep consequential actions reviewable and explicitly confirmed: workspace creation, sending invitations, connecting services, publishing, campaign activation, automatic lead creation, outbound email behavior, archive/restore, permanent file removal, and job status changes.
- Show clear provenance and status for records (source, assignee, stage/status, and activity). Keep sample data consistent as users move between screens.
- Build each screen in the smallest useful slice. Do not imply real persistence, delivery, OAuth, billing, or integrations in the prototype.

## Relationship to Storybook and the Next.js implementation

The standalone HTML screens in this plan remain journey-level prototypes and design references. Storybook is a later implementation tool: introduce it when the Next.js app has shared React components, and use it to review reusable component variants and states. Do not turn each prototype screen into a Storybook story as a substitute for building the application. Compose screens in Next.js and verify full navigation and journeys in the app; use stories for focused component review. See [Local Development Setup](local-development.md#ui-component-development-with-storybook) for the proposed Storybook approach.

## Screen-by-screen sequence

### Stage 0 — Shared entry and product frame

| # | Screen | Prototype interactions and states | Source / notes |
|---:|---|---|---|
| 1 | Sign in / invitation entry | Sign-in form, validation, invitation acceptance, and a sample route into the app. An invited teammate accepts access to the existing workspace and lands on role-aware Home without owner setup. | Roadmap: authentication. Keep auth simulated and enforce the invited role's permissions. |
| 1a | Account registration | Name, work email, password and confirmation, terms acceptance, validation, success handoff to organization setup, and a return link to sign in. Show a verification notice without blocking setup or workspace entry; gate invitation sending and Gmail connection until verified. | Self-serve owner registration creates a new workspace through Screen 02. Invitees use invitation acceptance instead. Keep signup simulated. |
| 2 | Organization setup | Business name, trade/service type, fixed service choices, service area, optional teammate invitations, and a review step that seeds the sample workspace; invitation role defaults to Member, with optional Admin, and the separate work profile defaults to Office, with optional Field. Send queued invitations only after workspace creation and email verification, then continue to the role-aware Home screen. | Keep the accepted Screen 02 flow intact; defer agent-suggested services, lead-source setup, and a separate onboarding checklist. See the working [First-Login Onboarding](first-login-onboarding.md) plan. |
| 3 | Role-aware Home — owner/admin | Attention-first home with a prominent assistant above the attention queue and a compact business overview. For a new workspace, the assistant suggests creating a first lead or setting up a lead-capture campaign. Shared actions are Search and Create lead. The assistant prepares a lead draft and requires user review and confirmation before the simulated change; follow-up and pipeline prompts return sample-data summaries. [Prototype](../prototype/prototype-screen-03-home-owner.html) | Office profile metrics: leads created in the last 30 days, open jobs, jobs needing attention, and pending intake reviews. Owners/Admins see team-wide totals. |
| 4 | Role-aware Home — office / field profiles | Compare work-profile priorities and navigation in the same sample organization; a prototype-only profile selector switches attention queues, schedules, and assistant prompts without changing permissions. [Prototype](../prototype/prototype-screen-04-home-team.html) | Office actions: Review intake, Assign lead, Create task. Field profile metrics: today's assigned jobs, active assigned jobs, and assigned jobs overdue or waiting; actions: Open today's jobs, Update job status, Add progress note. Member totals respect record access. |

**Stage review:** Can a new user understand the product, enter a sample business, and identify their next action? Validate the first-use journey and remaining navigation/action choices before polishing.

### Stage 1 — CRM and paid foundation (Phase 1 prototype priority)

| # | Screen | Prototype interactions and states | Source / notes |
|---:|---|---|---|
| 5 | Leads workspace / pipeline | Switch between pipeline/list views; search and filter by stage/source/owner/date; open a lead; create a lead; and move a lead between stages with confirmation and activity history. A prominent assistant hero can find unassigned leads, search records, or start a reviewed lead draft, matching the role-home assistant treatment. [Prototype](../prototype/prototype-screen-05-leads.html) | Fixed MVP stages: New, Contacted, Estimate sent, Won, and Lost. Campaign conversion stage is selectable and defaults to Won; custom stage editing is deferred. |
| 6 | Create / edit lead | Capture contact, service need, source, owner, stage, and notes through the manual form, or use the right-side assistant to draft recognizable details into that form; review, edit, save, or cancel. [Prototype](../prototype/prototype-screen-06-lead-form.html) | Roadmap: manual lead entry. Align fields with shared domain concepts. |
| 7 | Lead detail | Edit details, change owner/stage, view source and customer links, add a note, inspect chronological activity, and prepare a reviewed job handoff. [Prototype](../prototype/prototype-screen-07-lead-detail.html) | User journeys require traceable source and campaign lifecycle; job plan defines lead-to-job entry path. |
| 8 | Customers list and detail | Search/filter, open a customer, see linked leads/jobs and activity, and create/edit a customer with primary contact details. [Prototype](../prototype/prototype-screen-08-customers.html) | Customer is the primary CRM record and navigation label; a contact is not a separate first-class record type in the MVP. Reporting includes customer exports; lead/customer record surfaces are Phase 1. |
| 9 | Jobs workspace — board | Move jobs among active status columns; open a card; search/filter by status, team member, deadline, customer, or service; show attention items; switch to table view or closed jobs; create a reviewed starter job. [Prototype](../prototype/prototype-screen-09-jobs.html) | Job plan: board default, sortable table alternate, active vs closed jobs. Default statuses: Needs Scheduling, Scheduled, In Progress, Waiting, Completed, Canceled; admins can customize status names. Completed and Canceled remain in the closed-jobs view. |
| 10 | Jobs workspace — table / closed jobs | Sort and scan records; filter completed/canceled; use the same core filters and sample records as the board. [Prototype](../prototype/prototype-screen-10-jobs-table.html) | Job plan and CSV export plan. |
| 11 | Create job | Find/create customer inline, capture the job title and optional details, select a primary owner and optional team, review, save, and offer scheduling/deadline setup with the deadline unset by default. [Prototype](../prototype/prototype-screen-11-create-job.html) | Job plan’s manual creation journey. |
| 12 | Job detail | Edit summary, change status/assignment, set scheduled date/deadline, add progress note, upload fictional attachment, inspect files and newest-first activity, and use persistent job-scoped team/agent chat. [Prototype](../prototype/prototype-screen-12-job-detail.html) | Job plan: one scrollable detail page, chat visible to current job team, confirmed changes recorded in activity. No real uploads or agent actions. |
| 13 | Reports overview | Owner overview cards, attention list, date filter (default: Last 30 days), and drill-through to source records. [Prototype](../prototype/prototype-screen-13-reports.html) | Use the date basis defined for each report in the reporting plan. Owners/Admins can view team-wide reports; Members see only reports within their record access. |
| 14 | Lead/pipeline, job, and team workload reports | Filter and drill into matching lists; make metric date basis clear; show counts without employee performance rankings. [Prototype](../prototype/prototype-screen-14-report-details.html) | Reporting plan Phase 1. |
| 15 | Export confirmation | Pick one dataset (leads, customers, jobs, or CRM activity history), show active filters and expected row count, confirm CSV download state. Use a fixed documented column set per dataset. [Prototype](../prototype/prototype-screen-15-export.html) | Owners/Admins can export on every plan without plan-specific row quotas. Explain technical size-limit errors; never imply silent truncation. |
| 16 | Settings, team, plan and billing entry | View business profile, team context, and proposed plan/storage details; show monthly billing only; simulate an invitation and billing portal handoff. Include a usage-limit state that blocks only the capped action, explains the reset date, and offers an upgrade while core CRM access and existing records remain available. At the seat limit, block new invitations and offer an upgrade; after a downgrade, retain existing member access until the workspace is within its seat allowance. Show a failed-renewal notice and seven-day active recovery period; if unpaid, apply plan limits while preserving Owner record view/export access. [Prototype](../prototype/prototype-screen-16-settings.html) | Owner/Admin/Member permission roles are decided. Plan names, provisional monthly prices and quotas are in the product roadmap; validate the numbers before billing launch. Revisit annual billing discounts after customer and retention data is available. |

**Stage review:** Can the team capture and manage leads, see work ownership, create and update jobs, and reach useful reports? Confirm remaining feature-level permissions, job statuses, report defaults, and Phase 1 export scope.

### Stage 2 — Lead capture and supervised intake (Phase 1 prototype priority)

| # | Screen | Prototype interactions and states | Source / notes |
|---:|---|---|---|
| 17 | Campaign list | Show draft, scheduled, active, and paused campaigns in the normal list; keep paused rows visible with a clear status. Provide a separate Archived view; preserve archived records and audit history. Create, duplicate, restore, or open a campaign. [Prototype](../prototype/prototype-screen-17-campaigns.html) | Owners/Admins manage campaigns. Restoring requires review; duplicates begin as drafts. |
| 18 | Choose lead source | Select Website/shareable link or Gmail; explain what each setup will create/connect and show future sources as unavailable if appropriate. [Prototype](../prototype/prototype-screen-18-source.html) | Both are Phase 1 sources. Website/shareable link is on all plans; Gmail intake is Standard and Premium. The setup action is labeled **Create campaign**. |
| 19 | Capture brief and email sample intake | Require the email assistant modal first: collect a sample subject and body, infer case-insensitive phrase rules in the subject, body, or both, and let the user choose AND/OR logic when multiple phrases are configured. Then extract labeled values from the body. The page starts with suggested fields and sample values, supports manual sample editing and custom field-to-email-label mapping, and includes the sample preview before the intake plan. [Prototype](../prototype/prototype-screen-19-website-brief.html) | Phase 1 matching is phrase-based; sender and attachment conditions are deferred. The modal has no skip/cancel action. Simulate agent suggestions. |
| 20 | Website form editor and preview | Refine through plain-language prompt or inline edits; preview the hosted form and website embed; save and continue into campaign workflow setup. [Prototype](../prototype/prototype-screen-20-form-editor.html) | Journey 2A. Keep useful default concise; final field set remains configurable. |
| 21 | Website publish review | Shared final campaign review in Screen 25 summarizes the form, SalesMora destination, assignment, starting stage/tags, assigned-owner notification, and publication; require explicit approval; then show embed code and hosted link, launch-now/schedule choice, and published state. [Prototype](../prototype/prototype-screen-25-campaign-review.html) | Phase 1 Journey 2A. No live publication. |
| 22 | Gmail account and scope | Simulate account selection/connection; choose mailbox/address/label scope; make selected account and read-only purpose clear. [Prototype](../prototype/prototype-screen-22-gmail-scope.html) | Journey 2B. No real OAuth. |

| 23 | Post-approval setup | Configure SalesMora lead creation, business-default or selected assignee, starting stage/tags, and assigned-owner notification. [Prototype](../prototype/prototype-screen-23-gmail-workflow.html) | Phase 1 approved action set. Round-robin, extra recipients, follow-up steps, external delivery, and campaign-triggered job creation are later-phase candidates.
| 24 | Follow-up step editor | Add task or SalesMora email steps, relative timing, business/custom send window, automatic-after-approval vs human review, reviewer, and pause/stop behavior summary. [Prototype](../prototype/prototype-screen-24-gmail-follow-up.html) | Phase 2 advanced follow-up automation. Outbound mail uses Resend through SalesMora, never Gmail. Use sample templates and make sending explicitly simulated. |
| 25 | Final campaign review and activation | Summarize source rules, mapping, SalesMora destination, assignment, stage/tags, assigned-owner notification, and schedule; edit sections; explicitly approve and launch/schedule. [Prototype](../prototype/prototype-screen-25-campaign-review.html) | Phase 1 summary requires explicit approval. Advanced workflow configuration is deferred; automatic lead creation remains off until separately enabled after reviewing results. |
| 26 | Intake Review queue | Review proposed leads, edit/approve/dismiss/refine rule; flag missing/uncertain fields and likely duplicates with update/link, separate lead, or dismiss choices. [Prototype](../prototype/prototype-screen-26-intake-review.html) | Gmail intake begins supervised. Approve is what creates the CRM lead. |
| 27 | Intake review detail | Show original email context, source/matches/extractions, duplicate comparisons, proposed workflow; confirm human disposition. [Prototype](../prototype/prototype-screen-27-intake-detail.html) | Preserve traceability; sample/email content should only appear to authorized reviewers. |
| 28 | Campaign dashboard | Phase 1: show source status, Captured to date (unique inbound items, including duplicates but excluding retries), Awaiting review now (unique items pending a decision, including possible duplicates), Approved to date (unique items approved, counted once across destinations), and direct Intake Review links. Later: start with distinct SalesMora jobs created from campaign leads (dated by job creation), a simple lead-flow funnel, scheduled follow-up action counts due in the next seven days with overdue shown separately, failed follow-up actions needing attention (excluding retries in progress), and a separate integration delivery-health card outside the funnel. Defer other charts until customer feedback identifies a need. [Prototype](../prototype/prototype-screen-28-campaign-dashboard.html) | Owners/Admins can view and manage dashboards. Members can open only Intake Review items assigned to them. Phase 1 has no date-range filter. |
| 29 | Follow-up review and delivery state | Edit/send (simulated), reschedule, skip; show reviewer/wait duration/reminders and paused sequence; show failed delivery attention. [Prototype](../prototype/prototype-screen-29-follow-up-review.html) | Phase 2 follow-up review. Never imply Gmail sends; outbound email uses Resend through SalesMora. |

**Stage review:** Can an admin explain what qualifies as a lead, verify extraction, understand the Phase 1 post-approval actions, and launch only after explicit review? Validate remaining metric definitions.

### Stage 3 — Operations and connector expansion (Phase 3 prototype candidates)

| # | Screen | Prototype interactions and states | Source / notes |
|---:|---|---|---|
| 30 | Scheduling/calendar view | Schedule/reschedule jobs by week; set an optional arrival window and primary owner; see the assigned team and unscheduled jobs. [Prototype](../prototype/prototype-screen-30-scheduling-calendar.html) | Roadmap: operations improvements and Calendar integration. No external calendar is connected; scheduling details remain a prototype proposal. |
| 31 | Deadline and notification settings | Configure reminder offsets, business timezone, notification events/recipients, relative deadline defaults, and overdue states. [Prototype](../prototype/prototype-screen-31-deadline-notifications.html) | Job plan places configurable multi-offset reminders and expanded notification controls in Phase 3. Controls are marked as a Premium preview; entitlements remain undecided. |
| 32 | Integration catalog and connection detail | Browse entitlement-aware connectors, connect/reconnect mock provider, choose campaign destination, inspect delivery/sync failures. [Prototype](../prototype/prototype-screen-32-integrations.html) | Roadmap: connector SDK/Salesforce Phase 3; campaign docs require modular connectors and subscription gates. Gmail is read-only for intake; future-phase connectors remain unavailable. |
| 33 | Estimates and estimate lifecycle | Create/review/send/accept/reject estimate and link it to lead/job. [Prototype](../prototype/prototype-screen-33-estimate.html) | Roadmap Phase 3; detailed workflow is not yet in current journey docs. Treat as discovery prototype only. |
| 34 | Estimates list | Browse and filter estimates by status; open each estimate and follow links to its related lead or job. [Prototype](../prototype/prototype-screen-34-estimates.html) | Added after estimate lifecycle prototyping; sample records demonstrate navigation between estimates and CRM records. |

### Stage 4 — Ecosystem and scale (Phase 4 candidates)

Prototype only after validating demand and documenting details: accounting connector handoff, Mailchimp-like consent-aware audience sync, customer portal/job updates, advanced reporting, integration catalog expansion, and reliability/usage surfaces. Current documentation does not define enough screen-level behavior to make these detailed wireframes yet.

## Screen delivery loop

For each screen, follow this order before moving to the next:

1. **Frame the question:** state the user, task, success outcome, and source requirements.
2. **Sketch the screen:** define hierarchy, primary action, secondary actions, navigation, and responsive behavior.
3. **List states:** define empty, normal, validation/error, success, and permission/plan states that matter.
4. **Wire interactions:** connect buttons, fields, menus, dialogs, and navigation to realistic sample state changes.
5. **Walk the journey:** enter from the preceding screen, complete the task, and follow its next step; check back/navigation behavior.
6. **Review and record:** capture unresolved decisions, reviewer feedback, and accepted scope before starting the next screen.

## Prototype acceptance criteria

- A reviewer can complete at least one end-to-end journey per current stage using only visible controls.
- Navigation and sample records remain coherent across Home, Leads, Customers, Jobs, Reports, and Campaigns.
- Every described irreversible, external, or automation-related action has a visible review/confirmation step or is clearly a simulation.
- Forms explain required inputs and show actionable validation feedback.
- Users can identify record source, status/stage, ownership, and available next action where relevant.
- Role/plan-limited controls communicate the reason and an appropriate next step without exposing inaccessible data.
- Open decisions are labeled for review instead of silently presented as settled product behavior.

## Decisions to resolve while prototyping

1. The Owner/Admin/Member roles, Member-by-default invitation choice, and report/export access are decided. Confirm any additional feature-level permissions as those features are designed.
2. Home navigation, attention-first structure, work-profile priorities, direct actions, and overview metrics are decided.
3. Date-filter defaults and event semantics are decided: Last 30 days, with each report labeling its date basis. Customer terminology and fixed MVP lead stages are decided; custom-stage editing is deferred.
4. Website forms/widgets, Gmail intake with supervised review, and a basic source-status/capture/review dashboard are Phase 1. Campaign-configured job conversion remains in Phase 2 per the job plan.
5. “Create campaign” and the Phase 1 post-approval action set are decided; advanced actions remain later-phase candidates.
6. Campaign plan gates, Phase 1 dashboard counts, and the later-phase seven-day Upcoming follow-up window are decided.
7. Validate provisional subscription prices and quotas with customers. CSV access, datasets (including CRM activity history), fixed columns, no plan-specific row quotas, seat limits without automatic overage charges, hard usage caps without automatic overage charges, and Owner export access during a 30-day post-cancellation grace period are decided. Set the technical request-size threshold through performance testing.
8. Estimate lifecycle and detailed scheduling interactions before wireframing those areas beyond discovery.

## Recommended first review slice

Start with screens 1, 1a, and 2–7: sign-in, registration, organization setup, the owner home, role-aware navigation, lead pipeline, lead creation, and lead detail. This validates the first-use frame and core CRM model before the prototype expands into jobs, reports, or complex campaign setup. Keep the first slice to fictional data and a single sample service business so every screen can be evaluated in context.
