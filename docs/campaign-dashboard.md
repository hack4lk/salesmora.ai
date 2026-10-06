# SalesMora Campaign Dashboard

**Status:** Working design outline for review. Confirmed requirements are separated from proposed dashboard elements and open decisions.

## Purpose

Give each campaign a dedicated place to see whether it is active, how leads are moving through its workflow, and where a person needs to take action. The dashboard should make campaign health understandable at a glance while keeping the detailed configuration available when needed.

## Confirmed requirements

- Every campaign has its own dashboard.
- Show the number of leads captured.
- Show the number of leads awaiting Intake Review.
- Show the number of approved leads.
- Show the number of jobs created from the campaign.
- Show upcoming and failed follow-ups.
- Campaigns can be draft, scheduled, active, paused, or archived.
- Admins can launch, schedule, pause, resume, archive, restore, and duplicate campaigns subject to the review/approval rules in the user journey.
- Dashboard activity must reflect the campaign's selected destination: SalesMora, connected external systems, or both.

## Proposed dashboard layout

### 1. Campaign header and controls

Show the campaign name, source type, current status, and relevant timing (created, scheduled launch, or last activity). Provide the appropriate controls for that status, such as edit, launch, pause, resume, archive, restore, or duplicate.

Restoring an archived campaign requires an explicit review before intake and automation resume. A duplicated campaign starts as a draft and requires review and approval before launch.

### 2. At-a-glance metrics

Use compact metric cards for the confirmed measures:

| Metric | Meaning to refine |
|---|---|
| Leads captured | Leads/messages/forms received from the campaign source |
| Awaiting review | Proposed Gmail leads in Intake Review, or other campaign items requiring human approval |
| Approved leads | Leads approved into the selected destination(s) |
| Jobs created | Leads converted to jobs at the campaign's chosen pipeline stage |
| Upcoming follow-ups | Scheduled follow-ups or human-review emails that are due soon |
| Failed follow-ups | Follow-up actions that need attention, such as an SMTP delivery failure |

The number definitions should be consistent across campaigns and clear about whether counts are lifetime totals or scoped to a selected date range.

### 3. Lead-flow funnel

Proposed visualization of campaign outcomes:

```text
Captured → Awaiting review → Approved → Converted to job
                    ↘ Dismissed
```

For campaigns that route leads to external systems, show delivery/sync status alongside the relevant stage. Do not imply that a lead was successfully delivered when an integration action failed.

### 4. Follow-up activity

Show upcoming and recently completed follow-ups, with clear distinctions among:

- Scheduled SMTP emails.
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

## Open decisions

- Which roles can view the campaign dashboard, and which can operate its controls?
- Should metrics default to lifetime totals or a recent date range, with a date filter available?
- Should external delivery status be a separate metric card, part of the funnel, or both?
- What is the threshold for “upcoming” follow-ups?
- Should paused and archived campaigns remain in the normal campaign list, and how should they be visually separated?
- Which charts are necessary for the first release beyond the simple lead-flow funnel?
- Which dashboard features belong in Free, Standard, and Premium?
