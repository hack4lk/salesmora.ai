# SalesMora Reporting and Data Export Plan

**Status:** Detailed working proposal for review. Phase 1 recommendations are explicit; items needing a product decision are listed at the end.

## 1. Goals

Reporting should help small-business owners and their teams answer practical questions quickly:

- Are new leads being captured and followed up?
- Where are leads in the pipeline, and which ones need attention?
- How many leads are becoming jobs?
- What work is assigned to each team member?
- Can an authorized user download the business's CRM data for their own records or use in another system?

Keep the default experience simple: useful summaries first, clear paths into the underlying records, and downloadable data in a common format. Reporting must use the same tenant boundaries and permissions as the CRM.

## 2. Reporting locations

| Location | Purpose | Phase |
|---|---|---|
| Role-aware home | Small set of role-relevant indicators and attention items; link to deeper reports | 1 |
| Reports area | Shared reports for leads, pipeline, jobs, and team workload | 1 |
| Lead and job lists | Filtered, searchable records with an export action for the current view | 1 |
| Lead/customer/job detail | Individual record history and relevant activity, with no separate analytics layer required | 1 |
| Campaign dashboard | Source-specific lead flow, review queue, job conversion, and follow-up health | 2+, as capture campaigns are introduced |
| Integration/workflow health | Sync failures and workflow execution reporting | 2–3, as workflows and connectors are introduced |
| Subscription/usage area | Plan limits and usage indicators; at a hard cap block only the metered action and show the reset date and upgrade option; billing details remain in billing settings | 1 foundation; expand as metering is built |

The home page remains role-aware and concise. It should not duplicate the full Reports area. Campaign reporting belongs on the campaign dashboard described in [Campaign Dashboard](campaign-dashboard.md), with links into shared reports where appropriate.

## 3. Phase 1 reports

Phase 1 is the CRM and paid foundation: lead/customer records, pipeline, activity timeline, jobs and job status, assignment, and basic notifications. Reports should not depend on future campaign, Gmail, or connector capabilities.

### 3.1 Owner overview

- New and active leads, grouped by current pipeline stage.
- Leads with no owner or no recent activity, where those fields are available.
- Job counts by status.
- Leads converted into jobs during the selected period.
- Assigned lead and job workload by team member.
- A short list of items requiring attention, with links to the relevant records.

### 3.2 Lead and pipeline report

- Lead count by stage, status, source, and assigned owner.
- New leads over time.
- Lead age and last-activity age, to help identify stale opportunities.
- Lead-to-job conversion counts for a selected period, using a clearly defined date basis.
- Drill-through from a count or chart to the underlying filtered lead list.

### 3.3 Job report

- Job count by status and assigned team member.
- Jobs created over time.
- Job status distribution and job-level progress through the available status set.
- Drill-through to the job list and individual job record.

Deadlines, overdue work, and richer scheduling analysis should wait until job deadline and scheduling capabilities are available in the later operations phase.

### 3.4 Team workload report

- Leads and jobs assigned to each team member.
- Unassigned leads and jobs.
- Counts by pipeline/job status for each assignee.

Phase 1 reporting should describe workload, not rank employee performance. Activity volume alone can be misleading and should not be presented as a productivity score.

### 3.5 Common filters and definitions

Phase 1 reports should support, where relevant:

- Date range.
- Pipeline stage or job status.
- Lead source, where recorded.
- Assigned team member.
- Search and drill-through to source records.

The standard report date range defaults to **Last 30 days**. Use these date bases and name them in the report UI:

- Lead lists and lead counts use the lead's creation date; stage-movement reports use the date the lead entered the relevant stage. A current-pipeline snapshot filters by lead creation date and groups the matching leads by their current stage.
- Job reports use job creation date; completion metrics use the date the job was completed.
- Campaign reports use the date the lead was captured.
- Activity reports use the activity event date.

Date ranges include both selected calendar dates and use the business timezone. Convert the local start date to an inclusive timestamp and the day after the local end date to an exclusive timestamp so daylight-saving transitions are handled correctly.

## 4. Confirmed Phase 1 data export

### 4.1 Supported export format

**CSV is the Phase 1 export format.** It opens in common spreadsheet tools and is simple to produce and consume. Make the files UTF-8 encoded, include a header row, and use stable column names.

Phase 1 does not include XLSX, PDF report generation, scheduled exports, a public reporting API, or automated data delivery to third-party systems. Those can be evaluated later based on customer use.

Use stable, documented default columns for each dataset in Phase 1. Do not offer a column picker in the first release; preserve predictable exports for spreadsheet use and downstream imports.

### 4.2 Supported Phase 1 datasets

Allow authorized users to export these records as separate CSV files:

1. **Leads** — core lead fields, status/stage, source if present, assignee, created/updated timestamps, and customer/contact linkage.
2. **Customers** — customer fields (including primary contact details) and record timestamps.
3. **Jobs** — core job details, status, assigned team members, customer/lead reference, and timestamps.
4. **CRM activity history** — event time, event type, actor, related lead/customer/job IDs, and visible activity details.

The activity export covers CRM record history, not internal security logs, OAuth credentials, AI chain-of-thought, provider tokens, or application diagnostics. Do not export secret values.

### 4.3 Export entry points and scope

- Provide an **Export CSV** action on the lead, customer, and job list pages.
- Export the current filtered result set by default; make the scope clear in the confirmation step (for example, “All 142 leads matching these filters”).
- Offer a separate **Export report data** action for tabular report results.
- Provide activity-history export from the activity report or authorized record views.
- Apply the same tenant, role, and row-level access rules used to display records. An export must never reveal records hidden from the requesting user.
- Allow Owners/Admins to export on every subscription plan; do not impose plan-specific row quotas. Export the full filtered result set within the authorized scope.
- Include only fields the user is authorized to see. Do not include OAuth tokens, payment credentials, internal prompts, or other system secrets.

Phase 1 should export one selected dataset per file. A bundled full-account export can be added after the individual CSV flows and data-portability requirements are validated.

Do not offer a bundled full-workspace download in Phase 1. After cancellation, keep the workspace's records available to its Owner to view and export for a 30-day grace period; do not delete business records immediately. A failed renewal starts a seven-day active payment-recovery period with Owner notification. If payment remains unsuccessful, apply plan limits while preserving business records and Owner view/export access.

### 4.4 Export usability and data handling

- Use stable, human-readable headers and one record per row.
- Include a stable SalesMora record ID so a row can be matched back to its CRM record.
- Represent timestamps consistently; document the timezone convention in the export UI or README for exports.
- Preserve commas, quotes, line breaks, and non-English characters correctly.
- Protect spreadsheet users from CSV formula injection by safely encoding values that spreadsheet applications may interpret as formulas.
- Represent linked records with stable IDs and useful names where available; do not duplicate large nested structures into opaque JSON in the Phase 1 CSVs.
- Show the user the dataset, filters, and expected row count before download. Show a clear error if the export cannot be completed.
- Record an audit event for exports (actor, organization, dataset, filter/scope, time, and outcome), without copying exported cell contents into the audit log.

For initial business-sized datasets, stream CSV output from a tenant-scoped server-side query rather than loading every row into web-server memory. Set a configurable technical request limit based on performance testing, and explain when a request exceeds it so the user can narrow filters. Never silently truncate an export. Move large or bundled exports to a background job with private, expiring downloads in a later phase if needed.

## 5. Subscription and permissions

The current three-tier proposal includes basic reporting on every plan and reserves advanced reporting for Premium. Recommended Phase 1 packaging:

| Tier | Phase 1 reporting proposal |
|---|---|
| Free | Owner overview, basic lead/pipeline and job summaries, standard filters, and CSV export for accessible records with no plan-specific row quota |
| Standard | Same standard reports; CSV export has no plan-specific row quota |
| Premium | Standard reports plus advanced reporting when those metrics are available |

Do not make a user’s own CRM records inaccessible solely because an advanced reporting feature is plan-gated. Keep feature/usage entitlements in server-side policy so plans can change without duplicating report code. Use the provisional plan prices and core quotas in the product roadmap. There are no plan-specific export row quotas; set the configurable technical request limit through performance testing.

Owners and Admins can view team-wide reports and initiate workspace data exports. Members may view only reports within their authorized record access and cannot initiate workspace exports. Apply these role and row-level rules in the server-side report/export service, not just by hiding buttons in the interface.

## 6. Architecture and data quality

- PostgreSQL remains the system of record. Build reports from tenant-scoped domain queries and indexed relational columns for common filters and groupings.
- Keep the initial reports on live CRM data; do not introduce a separate analytics warehouse in Phase 1.
- Centralize metric definitions so dashboard cards, report tables, and CSV exports agree.
- Use stable database IDs and explicit event timestamps. Do not calculate conversion from mutable labels alone; record the stage/job conversion event needed to explain counts.
- Add or verify indexes for organization, status/stage, owner, source, and relevant timestamps before broad report queries are enabled.
- Use Knex-managed migrations for any new indexes or reporting-supporting tables.
- Add query timeouts, pagination for interactive tables, and a maximum configurable export size to protect the application and database.
- Keep campaign-specific metrics, workflow execution history, and connector delivery health in their later phases, while designing IDs/events so they can be added without breaking Phase 1 reports.

## 7. Phased delivery

| Phase | Reporting and export scope |
|---|---|
| **0 — Discovery** | Confirm report definitions, roles, date semantics, baseline export columns, plan limits, and data-portability expectations. Prototype the main report screens. |
| **1 — CRM, paid foundation, and core intake** | Owner overview; lead/pipeline, job, and team workload reports; filters and drill-through; per-dataset CSV exports for leads (including available campaign/source fields), customers, jobs, and activity history; tenant/role checks and export audit events. |
| **2 — Workflow automation and Google Calendar** | Advanced campaign dashboards and campaign-level outcome reporting; workflow execution and review-queue reporting; export any additional campaign fields introduced after Phase 1. |
| **3 — Operations and connectors** | Job deadline/overdue reporting; connector delivery health; workflow failure and retry reporting; expanded team/operations reports. |
| **4 — Scale and ecosystem** | Evaluate XLSX/PDF, scheduled reports, saved report definitions, large bundled exports, API access, and richer attribution based on usage and customer requests. |

## 8. Phase 1 acceptance criteria

- A user with permission can find reporting from the home/navigation and reach the lead, job, and team reports.
- Counts reconcile with the underlying records for the same organization, filters, and date basis.
- Every report offers a clear path from a summary to the underlying records.
- CSV exports contain the expected authorized records and columns, honor active filters, and contain no other tenant's records or secrets.
- Export files open correctly in standard spreadsheet tools, including values with commas, quotes, Unicode, and formula-like prefixes.
- Export authorization is enforced server-side and each export outcome is auditable.
- Export requests that exceed the configured limit fail clearly or route to the explicitly implemented large-export path; they do not exhaust application memory.
- Tune the configurable export request-size threshold through performance testing with representative data before launch.
- Basic reporting is available on the Free tier as proposed, with any usage limits communicated clearly.

## 9. Decisions for review
