# SalesMora Interactive Prototype Plan

**Status:** Working plan based on the current product documentation. This plan describes a clickable product prototype, not production behavior or a commitment to ship every proposed feature.

## Purpose

Build and review SalesMora as a sequence of connected screens. Each screen should answer one product question, demonstrate its key interactions, and link to the next screen in a realistic user journey. Complete and review one screen before expanding the prototype to the next.

The prototype should make the documented product principles visible: role-aware, simple-first setup; progressive detail; and user control over configuration and consequential actions. Use fictional sample business data. Do not connect real email, payment, CRM, or other external services.

## Source documents and scope

This plan synthesizes the README, product roadmap, user journeys, campaign dashboard, reporting and export plan, job module plan, and end-to-end user-flow diagram. Those documents are a mix of confirmed requirements, proposals, and open decisions. Prototype labels and interactions should preserve that distinction; use plausible examples for undecided areas and mark them for review.

The roadmap defines Phase 1 as the CRM and paid foundation, Phase 2 as capture, workflow, and Google, Phase 3 as operations and connector expansion, and Phase 4 as scale and ecosystem. The reporting plan places basic CRM reporting in Phase 1. The job plan assigns core jobs and attachments to Phase 1 and campaign conversion/checklists to Phase 2. Use the screen phases below to reflect these detailed plans; validate cross-document phase boundaries during discovery.

## Prototype rules

- Use a persistent application shell once a user is signed in, with navigation to Home, Leads, Customers, Jobs, Reports, Campaigns, and Settings/Billing as those areas enter scope.
- Make owner/admin, office manager, and field-team views demonstrably different where permissions or priorities differ. Exact role permissions and home content remain open product decisions.
- Every meaningful button should navigate, open a dialog/drawer, change visible sample state, or show a clear unavailable/confirmation state. Avoid decorative controls that appear functional.
- Include representative states: empty, populated, loading, validation error, success, permission-limited, and attention-needed when they apply.
- Keep consequential actions reviewable and explicitly confirmed: publishing, campaign activation, automatic lead creation, outbound email behavior, archive/restore, permanent file removal, and job status changes.
- Show clear provenance and status for records (source, assignee, stage/status, and activity). Keep sample data consistent as users move between screens.
- Build each screen in the smallest useful slice. Do not imply real persistence, delivery, OAuth, billing, or integrations in the prototype.

## Screen-by-screen sequence

### Stage 0 — Shared entry and product frame

| # | Screen | Prototype interactions and states | Source / notes |
|---:|---|---|---|
| 1 | Sign in / invitation entry | Sign-in form, validation, invitation acceptance, and a sample route into the app. | Roadmap: authentication. Keep auth simulated. |
| 1a | Account registration | Name, work email, password and confirmation, terms acceptance, validation, success handoff to organization setup, and a return link to sign in. | Added to support self-serve account creation; registration policy and email verification remain discovery decisions. Keep signup simulated. |
| 2 | Organization setup | Business name, trade/service type, service area, services, team setup, and a review step that seeds the sample workspace. | User journeys expect the agent to use business profile, services, service area, team, and workflow context. The exact onboarding flow is not specified; treat as an assumption to validate. |
| 3 | Role-aware Home — owner/admin | Agent-first home with a prominent assistant prompt and suggested actions above the overview, followed by attention items, concise lead/job indicators, quick actions, and links into records/reports. The assistant prepares a lead draft and requires user review and confirmation before the simulated change; follow-up and pipeline prompts return sample-data summaries. [Prototype](../prototype/prototype-screen-03-home-owner.html) | Role-aware home is agreed; exact layout and contents are open. Avoid duplicating full reports. The assistant is foregrounded to reflect the simple-first, visible-and-controllable product principles. |
| 4 | Role-aware Home — office manager / field team | Compare role-specific priorities and navigation in the same sample organization; a prototype-only role selector switches attention queues, schedules, and assistant prompts. [Prototype](../prototype/prototype-screen-04-home-team.html) | Roles and home behavior are not finalized; use the screen to review permission and information hierarchy. |

**Stage review:** Can a new user understand the product, enter a sample business, and identify their next action? Agree the first-release roles and home-page direction before polishing.

### Stage 1 — CRM and paid foundation (Phase 1 prototype priority)

| # | Screen | Prototype interactions and states | Source / notes |
|---:|---|---|---|
| 5 | Leads workspace / pipeline | Switch between pipeline/list views; search and filter by stage/source/owner/date; open a lead; create a lead; and move a lead between stages with confirmation and activity history. A prominent assistant hero can find unassigned leads, search records, or start a reviewed lead draft, matching the role-home assistant treatment. [Prototype](../prototype/prototype-screen-05-leads.html) | Roadmap: lead records and pipeline. Reporting defines lead filters and drill-through. Exact pipeline stages are undecided. |
| 6 | Create / edit lead | Capture contact, service need, source, owner, stage, and notes through the manual form, or use the right-side assistant to draft recognizable details into that form; review, edit, save, or cancel. [Prototype](../prototype/prototype-screen-06-lead-form.html) | Roadmap: manual lead entry. Align fields with shared domain concepts. |
| 7 | Lead detail | Edit details, change owner/stage, view source and customer links, add a note, inspect chronological activity, and prepare a reviewed job handoff. [Prototype](../prototype/prototype-screen-07-lead-detail.html) | User journeys require traceable source and campaign lifecycle; job plan defines lead-to-job entry path. |
| 8 | Customers / contacts list and detail | Search/filter, open contact, see linked leads/jobs and activity, create/edit contact. [Prototype](../prototype/prototype-screen-08-customers.html) | Reporting includes customer exports; lead/customer record surfaces are Phase 1. |
| 9 | Jobs workspace — board | Move jobs among active status columns; open a card; search/filter by status, team member, deadline, customer, or service; show attention items; switch to table view or closed jobs; create a reviewed starter job. [Prototype](../prototype/prototype-screen-09-jobs.html) | Job plan: board default, sortable table alternate, active vs closed jobs. Default statuses: Needs Scheduling, Scheduled, In Progress, Waiting, Completed, Canceled; admins can customize status names. Completed and Canceled remain in the closed-jobs view. |
| 10 | Jobs workspace — table / closed jobs | Sort and scan records; filter completed/canceled; use the same core filters and sample records as the board. [Prototype](../prototype/prototype-screen-10-jobs-table.html) | Job plan and CSV export plan. |
| 11 | Create job | Find/create customer inline, capture the job title and optional details, select a primary owner and optional team, review, save, and offer scheduling/deadline setup with the deadline unset by default. [Prototype](../prototype/prototype-screen-11-create-job.html) | Job plan’s manual creation journey. |
| 12 | Job detail | Edit summary, change status/assignment, set scheduled date/deadline, add progress note, upload fictional attachment, inspect files and newest-first activity, and use persistent job-scoped team/agent chat. [Prototype](../prototype/prototype-screen-12-job-detail.html) | Job plan: one scrollable detail page, chat visible to current job team, confirmed changes recorded in activity. No real uploads or agent actions. |
| 13 | Reports overview | Owner overview cards, attention list, date filter, and drill-through to source records. [Prototype](../prototype/prototype-screen-13-reports.html) | Reporting plan Phase 1; date semantics and role access need decisions. |
| 14 | Lead/pipeline, job, and team workload reports | Filter and drill into matching lists; make metric date basis clear; show counts without employee performance rankings. [Prototype](../prototype/prototype-screen-14-report-details.html) | Reporting plan Phase 1. |
| 15 | Export confirmation | Pick one dataset, show active filters and expected row count, confirm CSV download state. [Prototype](../prototype/prototype-screen-15-export.html) | CSV is Phase 1 proposal; authorized fields, tenant scope, and audit behavior belong to backend, not prototype claims. |
| 16 | Settings, team, plan and billing entry | View business profile, team context, and proposed plan/storage details; simulate an invitation and billing portal handoff. [Prototype](../prototype/prototype-screen-16-settings.html) | Roadmap: roles, plans, Stripe billing Phase 1. Exact role permissions, tier entitlements, pricing, and quotas are open. |

**Stage review:** Can the team capture and manage leads, see work ownership, create and update jobs, and reach useful reports? Confirm initial lead stages, roles, job statuses, report defaults, and Phase 1 export scope.

### Stage 2 — Lead capture and supervised intake (Phase 2 prototype priority)

| # | Screen | Prototype interactions and states | Source / notes |
|---:|---|---|---|
| 17 | Campaign list | Filter campaigns by draft/scheduled/active/paused/archived; create, duplicate, restore, or open a campaign; clearly distinguish these states. [Prototype](../prototype/prototype-screen-17-campaigns.html) | User journeys and campaign dashboard. Restoring requires review; duplicates begin as drafts. |
| 18 | Choose lead source | Select Website/shareable link or Gmail; explain what each setup will create/connect and show future sources as unavailable if appropriate. [Prototype](../prototype/prototype-screen-18-source.html) | User journey asks “Where do these leads come from?” Final umbrella label and phase boundary are open. |
| 19 | Capture brief and email sample intake | Require the email assistant modal first: collect a sample subject and body, infer a match phrase and location for user review, then extract labeled values from the body. The page starts with suggested fields and sample values, supports manual sample editing and custom field-to-email-label mapping, and includes the sample preview before the intake plan. [Prototype](../prototype/prototype-screen-19-website-brief.html) | Gmail matching, initial field extraction, and representative sample review happen here; the modal has no skip/cancel action. Simulate agent suggestions. |
| 20 | Website form editor and preview | Refine through plain-language prompt or inline edits; preview the hosted form and website embed; save and continue into campaign workflow setup. [Prototype](../prototype/prototype-screen-20-form-editor.html) | Journey 2A. Keep useful default concise; final field set remains configurable. |
| 21 | Website publish review | Shared final campaign review in Screen 25 summarizes the form, destination, assignment, follow-up and publication; require explicit approval; then show embed code and hosted link, launch-now/schedule choice, and published state. [Prototype](../prototype/prototype-screen-25-campaign-review.html) | Journey 2A/shared outcomes. No live publication. |
| 22 | Gmail account and scope | Simulate account selection/connection; choose mailbox/address/label scope; make selected account and read-only purpose clear. [Prototype](../prototype/prototype-screen-22-gmail-scope.html) | Journey 2B. No real OAuth. |

| 23 | Post-approval workflow setup | Configure single/round-robin/default assignment, notifications, CRM stage/tags, and an optional reviewed job handoff. Reveal follow-up steps separately. [Prototype](../prototype/prototype-screen-23-gmail-workflow.html) | User journey's confirmed choices plus working action catalogue. Follow-up timing is the next screen.
| 24 | Follow-up step editor | Add task or SalesMora email steps, relative timing, business/custom send window, automatic-after-approval vs human review, reviewer, and pause/stop behavior summary. [Prototype](../prototype/prototype-screen-24-gmail-follow-up.html) | User journeys specify behavior in detail. Use sample templates and make sending explicitly simulated. |
| 25 | Final campaign review and activation | Summarize source rules, mapping, destination, workflow, approval/automation mode, and schedule; edit sections; explicitly approve and launch/schedule. [Prototype](../prototype/prototype-screen-25-campaign-review.html) | Shared outcomes require concise summary and explicit approval. Automatic lead creation remains off until separately enabled after reviewing results. |
| 26 | Intake Review queue | Review proposed leads, edit/approve/dismiss/refine rule; flag missing/uncertain fields and likely duplicates with update/link, separate lead, or dismiss choices. [Prototype](../prototype/prototype-screen-26-intake-review.html) | Gmail intake begins supervised. Approve is what creates the CRM lead. |
| 27 | Intake review detail | Show original email context, source/matches/extractions, duplicate comparisons, proposed workflow; confirm human disposition. [Prototype](../prototype/prototype-screen-27-intake-detail.html) | Preserve traceability; sample/email content should only appear to authorized reviewers. |
| 28 | Campaign dashboard | Status controls; captured/review/approved/jobs/follow-up metrics; funnel; follow-up queue; intake/publication status; integrations and activity; drill-through. [Prototype](../prototype/prototype-screen-28-campaign-dashboard.html) | Campaign dashboard working proposal. Metrics are labeled lifetime and upcoming uses a provisional 7-day threshold. |
| 29 | Follow-up review and delivery state | Edit/send (simulated), reschedule, skip; show reviewer/wait duration/reminders and paused sequence; show failed delivery attention. [Prototype](../prototype/prototype-screen-29-follow-up-review.html) | User journeys and campaign dashboard. Never imply Gmail sends; outbound email is via SalesMora SMTP in the documented direction. |

**Stage review:** Can an admin explain what qualifies as a lead, verify extraction, understand every post-approval action, and launch only after explicit review? Confirm campaign naming, initial source scope, action catalogue, and campaign metrics.

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

1. Initial roles and their permissions; which roles can see team-wide reports and exports.
2. Role-aware home content, navigation labels, and whether Home is an attention queue, dashboard, or both.
3. Lead pipeline stages, customer/contact terminology, and date-filter defaults/semantics.
4. Phase boundary for website capture, Gmail intake, campaign dashboard, and job conversion.
5. Final umbrella label for lead-source setup and first-release post-approval action catalogue.
6. Campaign metric date scope, “upcoming” follow-up threshold, and campaign dashboard access/plan gates.
7. Subscription prices, quotas, feature entitlements, and export limits.
8. Estimate lifecycle and detailed scheduling interactions before wireframing those areas beyond discovery.

## Recommended first review slice

Start with screens 1, 1a, and 2–7: sign-in, registration, organization setup, the owner home, role-aware navigation, lead pipeline, lead creation, and lead detail. This validates the first-use frame and core CRM model before the prototype expands into jobs, reports, or complex campaign setup. Keep the first slice to fictional data and a single sample service business so every screen can be evaluated in context.
