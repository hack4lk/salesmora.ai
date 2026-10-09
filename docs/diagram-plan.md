# SalesMora Diagram Plan

**Status:** Ordered working plan. Diagrams will be built and reviewed one at a time. This plan distinguishes confirmed product rules from unresolved design decisions.

## Purpose

Create a coherent diagram set for SalesMora that covers the user experience, automation rules, core data, integrations, and deployment. Keep each diagram focused on one question; use links between diagrams instead of putting every rule into one unreadable chart.

Use Mermaid in Markdown under `docs/diagrams/`. Keep the detailed prose rules in the existing product documents; diagrams explain sequence, state, relationships, and boundaries.

## Recommended order

| Order | Diagram | Main question answered | Status |
|---:|---|---|---|
| 1 | End-to-end user flow | How does a user go from login and campaign setup to leads, follow-up, jobs, and reporting? | First draft created |
| 2 | Campaign lifecycle and state transitions | What can happen to draft, scheduled, active, paused, and archived campaigns? What pauses or resumes with each state? | Planned |
| 3 | Website/widget campaign journey | How are a form and link configured, approved, published, paused, and submitted? | Planned |
| 4 | Gmail campaign setup journey | How does OAuth, mailbox scope, phrase logic, field mapping, samples, and activation work? | Planned |
| 5 | Gmail intake and review processing | How are messages deduplicated, mapped, flagged, reviewed, approved, or sent through authorized automatic intake? | Planned |
| 6 | Campaign workflow and follow-up sequence | How do assignment, notifications, CRM routing, integrations, tasks, Resend sends, BullMQ scheduling/retries, review, timing, and stop conditions execute? | Planned |
| 7 | Lead-to-job and job operations | How does a selected pipeline stage create a job, and how are assignment, deadlines, statuses, and alerts handled? | Planned |
| 8 | Core domain data model (ERD) | Which tenant-scoped records and relationships are needed for users, leads, campaigns, jobs, and history? | Planned |
| 9 | Workflow data and execution model | How are triggers, conditions, actions, delayed steps, approvals, retries, and idempotency represented? | Planned |
| 10 | Agent/tool approval boundaries | Which tasks can the agent suggest, configure, execute, or require a human to approve? | Planned |
| 11 | Connector/plugin architecture and routing | How does a campaign route records to modular integrations, handle failures, and honor plan entitlements? | Planned |
| 12 | Subscription and entitlement model | How do plan state, feature access, usage limits, upgrade/downgrade, and grace periods affect the product? | Planned |
| 13 | Reporting and export data flow | How do tenant-scoped records become reports and CSV exports under role permissions? | Planned |
| 14 | Railway deployment and service architecture | How do Next.js, Node worker, PostgreSQL/Knex, BullMQ/Redis, Resend API/webhooks, OAuth providers, and deployment jobs relate? | Planned; cross-check against roadmap |

## Diagram conventions

- Put one diagram per Markdown file and number filenames in review order.
- Label confirmed behavior directly. Use a `TBD` or note for unresolved rules; do not make a diagram silently decide a product question.
- Use separate diagrams for user journeys, state machines, data relationships, and runtime sequence/architecture. Pick Mermaid `flowchart`, `stateDiagram-v2`, `erDiagram`, `sequenceDiagram`, or `C4`-style flow as appropriate.
- Every diagram should link to its source-of-truth prose document, such as `user-journeys.md`, `campaign-dashboard.md`, or `reporting-and-data-export.md`.
- Update both the diagram and the source prose when a confirmed rule changes.
- Review each diagram for role boundaries, failure paths, pause/resume behavior, tenant scope, and human approval gates before marking it complete.

## Coverage checklist

- Role-aware login and home, without assuming the deferred home layout.
- Website, link, and Gmail acquisition sources.
- Gmail read-only OAuth, case-insensitive AND/OR phrase matching, explicit field mappings, sample selection/paste and retention, and Intake Review.
- Message-ID deduplication and contact duplicate review actions.
- Campaign-level assignment, notifications, CRM stage/tags, destination routing, and follow-up sequences.
- Shared Resend sender/no-reply identity with client-branded content; Gmail remains read-only.
- Exact-email sender matching for incoming Gmail messages that pauses follow-ups.
- Human email review actions, reminders, sequence timing and stop rules.
- Campaign/job lifecycle, team assignment, deadlines, status alerts, pause/archive/restore, duplication, and shared templates.
- Subscription entitlements, reporting, export permissions, and audit history.
- Agent approvals, external connector failure handling, retries, and idempotency.

## Review workflow

1. Review Diagram 1 for completeness and correct major branches.
2. Confirm or refine it before treating it as the index flow for the detailed diagrams.
3. Build Diagram 2, then proceed through the numbered inventory one diagram at a time.
4. Add cross-links and update this table as each diagram is reviewed.
