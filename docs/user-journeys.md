# SalesMora User Journeys

**Status:** Working reference; decisions will be refined as product flows are reviewed.

This document records the agreed direction for primary SalesMora user journeys. It is intentionally iterative and separates confirmed decisions from open questions.

## Product experience principles

- **Role-aware:** The home experience should adapt to the user's work profile while respecting their permission role. Permission roles are Owner, Admin, and Member; Office and Field are work profiles that shape home-screen priorities and do not grant access.
- **Simple first, agent-led:** Users describe the outcome they want. The agent handles routine configuration, uses business context already in SalesMora, and asks only for information it cannot safely infer.
- **Visible and controllable:** Agent-created settings and records are reviewable. Users can understand what the agent configured and correct it. Require explicit confirmation before creating records, sending invitations, connecting services, publishing, sending outbound messages, or activating automation.
- **Progressive detail:** A basic workflow should be quick to launch. Advanced matching, routing, and automation controls remain available when needed.

## Journey 1: Login and role-aware home

### Agreed direction

The home page is role-aware. The user's Owner, Admin, or Member role controls what they can access; their Office or Field work profile helps prioritize the information and actions emphasized after login.

### Agreed direction and remaining design

Home is an attention-first workspace with the assistant prominent above items needing attention and a compact business overview. The Office profile prioritizes intake reviews, unassigned leads, follow-ups, and jobs needing attention. The Field profile prioritizes today's schedule, assigned jobs, customer/service details, and quick job updates. These profiles change priorities, not permissions.

Keep these direct actions available from Home: shared **Search** and **Create lead**; Office **Review intake**, **Assign lead**, and **Create task**; Field **Open today's jobs**, **Update job status**, and **Add progress note**.

Keep the compact Home overview work-profile-aware and permission-scoped. Office views show leads created in the last 30 days, open jobs, jobs needing attention, and pending intake reviews. Field views show today's assigned jobs, active assigned jobs, and assigned jobs that are overdue or waiting. Owners/Admins see team-wide totals; Members see counts only for records they are authorized to access.

Use this persistent primary navigation, in order, on every signed-in screen: **Home, Leads, Customers, Estimates, Jobs, Calendar, Reports, Campaigns**. Keep **Settings** at the bottom of the sidebar; selecting it opens a submenu with **Business profile, Team, Integrations, Workflows & notifications, and Plan & billing**.

### Agreed permission roles and work profiles

- **Owner:** owns the business workspace and has full workspace access, including billing and account-level administration.
- **Admin:** manages workspace configuration, team access, integrations, and workflow setup; can access business records needed for operations. Admins can view team-wide reports and export workspace data, but cannot manage billing.
- **Member:** uses day-to-day CRM and job workflows according to record assignment and feature-level permissions; can view only reports within their authorized record access and cannot view team-wide reports or export workspace data. Members have no billing or workspace-administration access by default.
- Both Owners and Admins can view team-wide reports and initiate workspace data exports. Export queries still enforce tenant and row-level authorization server-side.
- **Office** and **Field** are work profiles, not permission roles. They can change home-screen priorities and presentation but never grant access that the user's permission role does not allow.
- New teammate invitations default to **Member**. An Owner or Admin can explicitly invite someone as an **Admin**; ordinary invitations do not grant workspace-administration access.
- Invitation work profile is selected separately from permission role. Default it to **Office**; allow the inviter to choose **Field** when appropriate. Work profile changes Home priorities only and does not grant permissions.
- During initial owner setup, collect optional teammate invitations but send them only after the workspace has been created, so invited teammates cannot enter an unfinished workspace.
- After accepting an invitation, a teammate joins the existing workspace and lands on role-aware Home without repeating owner registration or organization setup.
- Enforce the plan's seat allowance without automatic overage charges. Block new invitations at the limit and offer an upgrade. If a downgrade leaves the workspace over its new seat allowance, keep current members' access and block further invitations until the workspace is within the limit.

### Default lead pipeline

Use the fixed MVP stages **New → Contacted → Estimate sent → Won**, with **Lost** as a closed outcome. Do not allow stage renaming, reordering, or additions in the MVP. A campaign can select its conversion stage from these stages; default to **Won**. Reaching the configured conversion stage creates a linked job. After conversion, track work using job statuses in Jobs, not a lead stage such as “In progress.”

### Customer terminology

Use **Customer** as the primary CRM record and navigation label. A customer may be an individual or a business; store the primary person's name, email, and phone as customer fields. Leads represent prospective customers. Converting a Won lead creates or links a customer and a job. In the MVP, a contact is a person's role/details on a customer record, not a separate first-class CRM record type.

These details are deferred while lead-source setup is being designed.

## Journey 2: Create a campaign and choose a lead source

Use **Create campaign** for the primary action and setup-flow label. The experience then asks where leads come from. A single setup flow branches into the appropriate configuration for each source.

### Source selection

Ask: **“Where do these leads come from?”**

- **Website or shareable link:** Build a lead-capture form and publish it as both an embeddable widget and a hosted shareable link by default.
- **Gmail inbox:** Connect an authorized Google account, define explicit matching and field-mapping rules, and review examples before activation.
- **Other sources:** Add additional connected sources through the integration/plugin architecture as they are prioritized.

Website form/widget capture and Gmail intake are included in Phase 1. Phase 1 includes source setup, secure capture/connection, supervised extraction and review, creating the approved CRM lead, and a basic campaign dashboard with source status, captured/pending-review/approved counts, and links to Intake Review. Website/shareable-link intake and the basic dashboard are available on every plan within its published-campaign limit; Gmail intake is Standard and Premium. Advanced follow-up automation and campaign analytics remain later-phase scope.

Owners and Admins can view and manage campaign dashboards and settings. Members cannot access campaign dashboards or settings, but can open an individual Intake Review item assigned to them through its assigned task or notification.

## Journey 2A: Create a website capture campaign

1. The user chooses **Website or shareable link**.
2. The agent asks what kind of leads or work the business wants to capture, then uses the existing business profile, services, service area, team, and workflow settings.
3. The agent asks only for missing essentials and drafts a concise form, SalesMora destination, assignment, starting stage, and campaign tags. Advanced follow-up setup is deferred.
4. The user reviews and refines the preview using plain language or simple inline edits. Advanced field and workflow configuration is available when needed.
5. The user approves publication. SalesMora provides the embed code and a hosted link for the same form.
6. Each submission enters the normal CRM lead lifecycle with its source recorded.

The campaign builder should not require the owner to manually configure a long list of fields and automation rules to get a useful first version live.

## Journey 2B: Connect Gmail for lead intake

### 1. Connect and scope the source

The user authorizes Gmail access and may narrow intake to a chosen mailbox, address, or Gmail label. Each campaign is tied to one Gmail account as its acquisition source. The product should make the selected account, scope, and access clear.

### 2. Define which emails qualify

The user specifies the exact phrase or phrases to look for and where to look:

- Subject
- Body
- Subject or body

Examples include “subject contains `Request a Quote`” or “body contains `please send an estimate`.” The matching rule must remain visible and understandable. The agent can help formulate it, but should not silently decide which messages count as leads.

Confirmed matching behavior:

- Phrase matching is case-insensitive.
- When multiple phrases are configured, the user can choose **AND** (all phrases must match) or **OR** (any phrase can match).
- Matching is limited to the user-selected location: subject, body, or both.
- Phase 1 matching conditions are phrase-based only. Sender and attachment conditions are not supported as lead-matching rules in Phase 1.

### 3. Map email content to lead fields

The user defines how email content maps to CRM lead fields. The agent can suggest likely mappings from field names and sample emails, then asks the user to confirm or correct them.

Example:

| Email source | CRM lead field |
|---|---|
| Text after `Name:` | Lead name |
| Text after `Phone:` | Phone |
| Text after `Service requested:` | Service requested |
| Text after `Job address:` | Service address |
| Sender address | Email |

If useful content has no existing CRM field, ask whether to create a custom field, put it in notes, or omit it. Do not add custom fields without user approval.

### 4. Preview at least one email sample

Before activation, the user must preview at least one representative email sample. They can select an email from Gmail, choose another real email to refine the rules against, or paste sample subject and body content. A pasted or selected sample is for preview and rule refinement; it does not create a lead by itself. The preview should show:

If Gmail has no message that matches the current rules, let the user paste a representative subject and body to validate extraction and mapping. The sample does not need to be an actual Gmail message and does not create a lead.

Retain the selected or pasted sample with the campaign so admins can test later rule changes.

- The matched phrase and whether it came from the subject or body.
- The relevant source text for every proposed field value.
- The proposed CRM field mapping and any missing or ambiguous values.
- The proposed destination and workflow behavior.

The user can refine the match rule and field mappings from the preview.

### 5. Start in supervised review

After activation, matching messages produce proposed leads in a dedicated **Intake Review** queue. The agreed direction is to keep these unapproved items in that queue; approving one creates the CRM lead in the main pipeline.

Proposed review actions include approve, edit, dismiss, and refine the rule. The original email and source should remain linked to the created lead for traceability.

If an extracted field is missing or uncertain, the proposed lead still enters Intake Review with that field visibly flagged. The user can correct it before approval.

Duplicate handling has two levels:

- **Repeated Gmail message:** Store the Gmail account identity and immutable Gmail message ID, and use that pair to avoid processing the same message more than once.
- **Possible existing contact:** Compare extracted email address and phone number with existing leads. Flag a likely contact duplicate for human review; do not merge automatically. Offer **update/link to the existing lead**, **create a separate lead**, or **dismiss**.

### 6. Configure the campaign's post-approval workflow

During campaign creation, ask: **“When a lead is approved, what would you like to do?”** The selected actions are campaign-level rules that apply to every lead approved through that campaign, rather than settings users configure separately for each lead. The agent should help configure these in plain language and keep the setup concise.

The Phase 1 post-approval action set is approved: add the lead to SalesMora, assign it to the business default or one selected teammate, set its starting stage and campaign tags, and notify the assigned teammate. Keep the first-release flow concise and apply the configured actions when the lead is approved.

Later-phase action candidates include round-robin assignment, notifying additional selected teammates, follow-up tasks and reminders, Resend email follow-ups (automatic or human-reviewed), external-system delivery, campaign-triggered job creation, and nurture sequences. These actions may use immediate, delayed, or conditional timing and require separate workflow design.

Phase 1 assignment options, selectable per campaign:

- Use the business's default assignment rule.
- Assign every approved lead to one selected team member.

Phase 1 notification behavior:

- Notify the assigned lead owner using the available in-app and email notification channels.
- Defer notifications to additional recipients and SMS to later feature phases.

Later-phase follow-up direction:

- A campaign can define multiple follow-up steps, rather than just one task.
- A step can create a task for the lead owner or an email follow-up sent through Resend.
- Gmail OAuth access is read-only for lead intake and, when configured, monitoring customer replies. SalesMora must not use Gmail to send messages or create Gmail drafts.
- System-generated email, including teammate invitations, campaign follow-ups, and notifications, is sent through SalesMora's Resend account. Human replies and ongoing correspondence are handled in the Gmail app.
- Gmail OAuth remains read-only for lead intake and, when configured, reply monitoring; it is never used to send messages or create Gmail drafts. Send outbound messages through Resend's Node.js SDK/API with idempotency keys; verify signed webhook events and disable provider pay-as-you-go overages. Businesses do not enter their own outbound email credentials in the initial plan.
- Use a SalesMora-managed no-reply From address so the business does not need to verify its own sending domain. Keep email sender identity and related sending information tied to SalesMora; brand the message content with the client's business information (for example, business name, logo, and contact details).
- Help the admin create email templates with the agent; the admin reviews and edits templates for the campaign before they can be used.
- For each email follow-up step, support the previously agreed campaign choice: automatic Resend sending after admin approval, or presenting the email for human review before the Resend send.
- Time each follow-up step relative to the preceding step/state, rather than measuring every step from lead approval.
- Pause the remaining email follow-up sequence when an incoming message in the connected Gmail inbox has a sender address that exactly matches the lead's email address. Notify the lead owner and keep already-created human follow-up tasks in place. System emails use a SalesMora no-reply address.
- Stop the remaining follow-up sequence when the lead is converted into a job or marked **Lost**.
- Let campaign admins choose when follow-up emails send: send when the step is due; send during configured business days/hours (wait until the next allowed window if needed); or use a custom schedule with selected days and times. Use the business's configured timezone.
- In human-review mode, send each due email to the lead owner for review by default. The campaign admin may choose a different reviewer.
- Reviewers can edit and send, reschedule, or skip a queued email.
- Keep the sequence paused while an email awaits review. Start the next step's delay only after the reviewer sends, reschedules, or skips the email.
- If an email remains unreviewed, remind its reviewer after one day and daily until they act. Do not send it automatically while it is awaiting review.

Confirmed CRM organization behavior:

- A campaign may choose the starting pipeline stage and apply campaign tags when a lead is approved.
- If either setting is left unchanged, use the business's default.
- Phase 1 keeps the approved lead in SalesMora; external-system delivery is deferred to the connector phase.

Later-phase connected-system behavior:

- For each campaign, let the user choose to keep approved leads in SalesMora, send them to one or more connected external systems, or do both.
- Each external system is a modular connector that can be added or removed independently.
- Connector availability and use are gated by subscription plan entitlements; some integrations may be Premium-only. Enforce entitlements in the interface and on the server side.

Confirmed job-conversion behavior:

- Each campaign lets the user choose which pipeline stage means a lead should be converted into a job.
- Default the conversion stage to **Won**.
- Convert the lead when it reaches that selected stage, rather than on initial lead approval.
- Include job assignment in the default job-creation setup. The admin chooses what happens when a job is created; initial options include assigning it to the lead owner or to a specific team member.
- Let admins set a fixed job deadline, a relative deadline (for example, 14 days after job creation), or leave the date to be set manually on each job.
- Start jobs with the statuses **Scheduled**, **In Progress**, **Waiting**, **Completed**, and **Canceled**. Admins can customize the statuses to match their process.
- Make these events available as job notification triggers: status changes, assignment changes, approaching deadlines, and overdue deadlines.
- Send job notifications to the assigned job team by default. Admins can add other team members, including themselves, to receive each notification.
- Let admins configure one or more deadline reminder offsets, including a chosen number of days before or after the deadline, and reminders on the due date.

Any outbound email or other consequential external action must be explicitly configured and authorized by the user.

### 7. Offer user-controlled automation

Once the user has reviewed real results and is satisfied with the rule, SalesMora may offer automatic lead creation. The user must explicitly enable it; the agent must not turn it on by itself. Users should be able to pause the rule and return to supervised review.

## Shared outcomes across sources

- In Phase 1, website submissions and approved Gmail intake create leads in SalesMora. Delivery to external systems is deferred to the connector phase.
- Each lead records its source and links back to the originating submission or email.
- After lead creation, Phase 1 applies the campaign's approved assignment, starting stage, tags, and assigned-owner notification.
- Later phases may add connected external destinations, follow-up automation, and campaign-triggered job conversion.
- For Gmail campaigns, a reviewer approves each proposed lead before it enters the CRM by default. Any later automatic-creation mode requires separate, explicit user authorization.
- Before Phase 1 activation, present a concise summary of the campaign source and rules, field mappings, SalesMora destination, assignment, stage/tags, and assigned-owner notification. The admin can revise the setup and must explicitly approve the final summary before the campaign goes live.
- After approval, let the admin either launch immediately or schedule a future launch.
- Let admins duplicate an existing campaign or save a campaign configuration as a reusable template, so they can start from prior work instead of repeating setup.
- Make saved templates available across the business account for reuse by its admins.
- A reusable template contains campaign configuration only. When using one, admins confirm Gmail and external account connections; do not carry the original campaign's retained email sample into the template.
- A duplicate copies campaign configuration but not leads, jobs, history, or the retained email sample. It always starts as a draft; the admin can provide/select a replacement sample, reconfirm account connections, and review and approve it before launch.
- After launch, let admins pause and resume the campaign. Pausing stops new intake and unsent campaign follow-ups while preserving leads and tasks already created.
- Give every campaign its own dashboard for monitoring lead flow, review status, job conversion, and follow-up activity. Dashboard layout and additional metrics are specified in [Campaign Dashboard](campaign-dashboard.md).
- Job creation and day-to-day job tracking are detailed in [Job Module Plan](job-module-plan.md).
- For Gmail sources, pause intake processing without discarding messages; when the campaign resumes, process eligible messages received during the pause using the campaign's current rules and configured intake mode.
- While a website campaign is paused, its widget and hosted link show a temporary-unavailable message with business contact details; the admin can customize the message.
- Pausing freezes pending follow-up timers; when the campaign resumes, they continue with their remaining time rather than sending overdue messages all at once.
- Let admins archive campaigns instead of deleting them. Archiving stops intake and future campaign automation while preserving captured leads, jobs, and audit history.
- Keep paused campaigns visible in the normal campaign list with a clear status. Show archived campaigns in a separate Archived view.
- Let admins restore archived campaigns, but require explicit review before intake and automation resume.

## Resolved design decisions

The Owner/Admin/Member permission model, Office/Field work-profile priorities, Home action set, and Phase 1 Gmail matching/sample-preview behavior are decided.
