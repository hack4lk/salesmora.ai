# SalesMora Campaign Dashboard

**Status:** Phase 1 basic campaign dashboard, role access, and base plan gates approved; advanced analytics are deferred to a later phase.

## Purpose

Give each campaign a dedicated place to see whether it is active, how leads are moving through its workflow, and where a person needs to take action. The dashboard should make campaign health understandable at a glance while keeping the detailed configuration available when needed.

## Phase boundary

**Phase 1 basic view:** Show campaign/source status, campaign-to-date totals for Captured and Approved, the current Awaiting Review count, and direct links to the Intake Review queue. Include basic campaign controls needed to manage a source. Keep the view focused on intake health; do not add a date-range filter in Phase 1.

**Later phase:** Add job conversion metrics, a simple lead-flow funnel, follow-up queues and performance, a separate integration delivery-health card, richer activity history, and advanced date/filter analytics as workflow automation is introduced. Defer additional charts until customer feedback identifies a clear need.

### Access

Owners and Admins can view and manage campaign dashboards and campaign settings. Members cannot access the campaign list, dashboard, or settings. A Member may open an individual Intake Review item only when it is assigned to them, through the assigned task or notification; apply record-level authorization to that item.

The Phase 1 basic dashboard and website/shareable-link campaigns are included on every plan, subject to each plan's published-campaign limit. Gmail intake is available on Standard and Premium. Premium-only integrations remain gated to Premium.

## Confirmed requirements

- Every campaign has its own dashboard.
- Show the number of leads captured.
- Show the number of leads awaiting Intake Review.
- Show the number of approved leads.
- Link directly to Intake Review for pending leads.
- Campaigns can be draft, scheduled, active, paused, or archived.
- Keep paused campaigns in the normal campaign list with a clear Paused status. Put archived campaigns in a separate Archived view; preserve their records and audit history.
- Owners and Admins can launch, schedule, pause, resume, archive, restore, and duplicate campaigns subject to the review/approval rules in the user journey.
- Dashboard status must reflect the campaign's selected destination: SalesMora, connected external systems, or both.

Job counts, follow-up status, integration delivery health, and expanded activity history are later-phase additions, not part of the Phase 1 basic dashboard.

## Proposed dashboard layout

### 1. Campaign header and controls

Show the campaign name, source type, current status, and relevant timing (created, scheduled launch, or last activity). Provide the appropriate controls for that status, such as edit, launch, pause, resume, archive, restore, or duplicate.

Restoring an archived campaign requires an explicit review before intake and automation resume. A duplicated campaign starts as a draft and requires review and approval before launch.

### 2. At-a-glance metrics

Use compact metric cards for the confirmed measures:

| Metric | Definition |
|---|---|
| Captured to date | Unique inbound form submissions or Gmail messages received by this campaign since launch, including items later flagged as duplicates; exclude retry deliveries |
| Awaiting review now | Unique intake items currently awaiting a decision in Intake Review, including items flagged as possible duplicates; exclude items already approved or dismissed |
| Approved to date | Unique intake items approved since launch, counting each item once regardless of the number of selected destinations |
| Jobs created | Distinct SalesMora job records actually created from campaign leads; date-filter this metric by the job creation event date (later phase) |
| Upcoming follow-ups | Count of scheduled follow-up actions due from now through the next seven days, including today; show overdue actions separately and use the business timezone (later phase) |
| Failed follow-ups | Distinct follow-up actions in a failed state that need attention; exclude attempts that are still retrying (later phase) |

Use the same count definitions across campaigns. Count one capture per unique source item; processing or webhook retries must not increase the total. Advanced date-range metrics may be added later with explicitly labeled event-date semantics.
Count each scheduled follow-up action once. Show overdue follow-ups separately from Upcoming. Interpret the seven-day window in the business timezone.

### 3. Lead-flow funnel

Proposed visualization of campaign outcomes:

```text
Captured → Awaiting review → Approved → Converted to job
                    ↘ Dismissed
```

For campaigns that route leads to external systems, show delivery/sync health in a separate delivery metric card, outside the lead-flow funnel. Do not imply that a lead was successfully delivered when an integration action failed. Link the card to failed or retrying deliveries that need attention.

### 4. Follow-up activity

Show upcoming and recently completed follow-ups, with clear distinctions among:

- Scheduled Resend emails.
- Emails waiting for human review, including the reviewer and how long they have been waiting.
- Human tasks assigned to a team member.
- Completed, skipped, rescheduled, paused, and failed actions.

Actions can open the affected lead, job, task, or email review item. For reviewed emails, available operations follow the campaign workflow: edit and send, reschedule, or skip.

### 5. Intake and review status

For Gmail campaigns, show the connected acquisition account and whether intake is active, paused, or needs attention. Provide a direct path to Intake Review and the campaign's matching/mapping configuration. Identify duplicate flags and incomplete or uncertain fields in the review queue rather than hiding them in a total.

For website campaigns, show the widget/link publication status and offer a path to the embed code or hosted link. When paused, the dashboard should expose the paused state and the configured visitor-facing unavailable message.

### 6. Integrations and delivery health

Show connected destinations and their status (for example, healthy, attention needed, or disconnected), plus failed or retrying deliveries that need attention. Display only integrations available under the workspace's current subscription entitlements. Give admins a path to reconnect or update an integration without requiring them to rebuild the campaign.

### 7. Recent activity

Proposed timeline of important campaign events, such as:

- Campaign launched, scheduled, paused, resumed, archived, or restored.
- Intake received, lead approved/dismissed, or duplicate disposition selected.
- Follow-up scheduled, sent, reviewed, skipped, rescheduled, or failed.
- Lead converted into a job.
- Integration connected, disconnected, or delivery failed.
- Campaign configuration changed and approved.

Show the time and responsible actor when available. Keep audit history available after a campaign is archived.

## Proposed filters and navigation

- Date range for metrics and activity.
- Lead/follow-up status.
- Source or destination where a campaign supports more than one connected system.
- Direct navigation from metrics to the corresponding lead, review, task, job, or integration issue list.

## Product and implementation notes

- Keep the default view concise; put detailed charts and configuration behind clear drill-downs.
- Use the shared campaign records and event history as the source of dashboard counts so retries do not inflate lead or job totals.
- Respect tenant boundaries and subscription entitlements in both dashboard data APIs and interface controls.
- Avoid exposing email body/sample content in dashboard summaries; link to the authorized review detail when needed.
- Dashboard updates can be near-real-time where practical, with a visible last-updated time if any data is delayed.
