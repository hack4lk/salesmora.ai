# SalesMora User Journeys

**Status:** Working reference; decisions will be refined as product flows are reviewed.

This document records the agreed direction for primary SalesMora user journeys. It is intentionally iterative and separates confirmed decisions from open questions.

## Product experience principles

- **Role-aware:** The home experience should adapt to the user's role. The exact owner, office, and field-team home content is still to be designed.
- **Simple first, agent-led:** Users describe the outcome they want. The agent handles routine configuration, uses business context already in SalesMora, and asks only for information it cannot safely infer.
- **Visible and controllable:** Agent-created settings and records are reviewable. Users can understand what the agent configured, correct it, and explicitly authorize automation.
- **Progressive detail:** A basic workflow should be quick to launch. Advanced matching, routing, and automation controls remain available when needed.

## Journey 1: Login and role-aware home

### Agreed direction

The home page is role-aware. A user's role and responsibilities determine the information and actions emphasized after login.

### To design later

- The exact home layout and navigation for owners, office managers, and field team members.
- Whether the home page is an attention queue, dashboard, or combination.
- Which actions are available directly from each role's home page.

These details are deferred while lead-source setup is being designed.

## Journey 2: Set up a lead source

The experience should begin by asking where leads come from. A single lead-source setup flow can branch into the appropriate configuration for each source.

### Source selection

Ask: **“Where do these leads come from?”**

- **Website or shareable link:** Build a lead-capture form and publish it as both an embeddable widget and a hosted shareable link by default.
- **Gmail inbox:** Connect an authorized Google account, define explicit matching and field-mapping rules, and review examples before activation.
- **Other sources:** Add additional connected sources through the integration/plugin architecture as they are prioritized.

The first release scope and phase placement for each source remain to be confirmed against the product roadmap.

## Journey 2A: Create a website capture campaign

1. The user chooses **Website or shareable link**.
2. The agent asks what kind of leads or work the business wants to capture, then uses the existing business profile, services, service area, team, and workflow settings.
3. The agent asks only for missing essentials and drafts a concise form, destination, assignment, and suggested follow-up.
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

The action catalogue is being explored. Initial candidates are assignment, team notifications, follow-up tasks and reminders, email follow-ups (automatic SMTP send or human review before send), CRM organization (pipeline stage, tags, fields), delivery to connected systems, conversion to a job, and nurture sequences as that capability becomes available. Actions may need immediate, delayed, or conditional timing. This list is a working proposal, not a finalized release commitment.

Confirmed assignment options, selectable per campaign:

- Assign every approved lead to one selected team member.
- Distribute approved leads among selected team members using round-robin assignment.
- Use the business's default assignment rule.

Confirmed notification options, selectable per campaign:

- Notify the assigned lead owner, selected teammates, or both.
- Support in-app notifications and email notifications in the initial options.
- Defer SMS notifications to a later feature phase.

Confirmed follow-up direction:

- A campaign can define multiple follow-up steps, rather than just one task.
- A step can create a task for the lead owner or an email follow-up sent through SMTP.
- Gmail OAuth access is read-only for lead intake and, when configured, monitoring customer replies. SalesMora must not use Gmail to send messages or create Gmail drafts.
- System-generated email, including campaign follow-ups and email notifications, is sent through an SMTP server. Human replies and ongoing correspondence are handled in the Gmail app.
- Use a shared SMTP provider operated/configured by SalesMora; businesses do not enter their own SMTP credentials in the initial plan.
- Use a SalesMora-managed no-reply From address so the business does not need to verify its own sending domain. Keep email sender identity and related sending information tied to SalesMora; brand the message content with the client's business information (for example, business name, logo, and contact details).
- Help the admin create email templates with the agent; the admin reviews and edits templates for the campaign before they can be used.
- For each email follow-up step, support the previously agreed campaign choice: automatic SMTP sending after admin approval, or presenting the email for human review before the SMTP send.
- Time each follow-up step relative to the preceding step/state, rather than measuring every step from lead approval.
- Pause the remaining email follow-up sequence when an incoming message in the connected Gmail inbox has a sender address that exactly matches the lead's email address. Notify the lead owner and keep already-created human follow-up tasks in place. System emails use a SalesMora no-reply address.
- Stop the remaining follow-up sequence when the lead is converted into a job or marked **Lost/Closed**.
- Let campaign admins choose when follow-up emails send: send when the step is due; send during configured business days/hours (wait until the next allowed window if needed); or use a custom schedule with selected days and times. Use the business's configured timezone.
- In human-review mode, send each due email to the lead owner for review by default. The campaign admin may choose a different reviewer.
- Reviewers can edit and send, reschedule, or skip a queued email.
- Keep the sequence paused while an email awaits review. Start the next step's delay only after the reviewer sends, reschedules, or skips the email.
- If an email remains unreviewed, remind its reviewer after one day and daily until they act. Do not send it automatically while it is awaiting review.

Confirmed CRM organization behavior:

- A campaign may choose the starting pipeline stage and apply campaign tags when a lead is approved.
- If either setting is left unchanged, use the business's default.

Confirmed connected-system behavior:

- For each campaign, let the user choose to keep approved leads in SalesMora, send them to one or more connected external systems, or do both.
- Each external system is a modular connector that can be added or removed independently.
- Connector availability and use are gated by subscription plan entitlements; some integrations may be Premium-only. Enforce entitlements in the interface and on the server side.

Confirmed job-conversion behavior:

- Each campaign lets the user choose which pipeline stage means a lead should be converted into a job.
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

- Website submissions and approved Gmail intake follow the destination selected for their campaign: SalesMora, connected external systems, or both.
- Each lead records its source and links back to the originating submission or email.
- The same assignment, follow-up, workflow, and job-conversion capabilities apply after lead creation.
- External systems can be selected as a destination when the user configures an applicable integration or workflow.
- For Gmail campaigns, approving a lead starts the campaign-level post-approval workflow selected during campaign creation. In automatic-creation mode, the corresponding configured workflow runs when the lead is created, subject to the user's explicit authorization.
- Before activation, present a concise summary of the campaign source and rules, field mappings, destinations, assignments, notifications, job-conversion behavior, and follow-up sequence. The admin can revise the setup and must explicitly approve the final summary before the campaign goes live.
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
- Let admins restore archived campaigns, but require explicit review before intake and automation resume.

## Open design questions

- What is the final label for the umbrella entry point: **Set up lead source**, **Capture leads**, or **Create campaign**? “Campaign” fits web capture better than Gmail intake.
- Which additional email match operators belong in the initial UI beyond case-insensitive phrase matching with configurable AND/OR logic (for example sender or attachment conditions)?
- Which post-approval action options should be available in the first release, and which can be delayed or conditional? This will be decided one action category at a time.
- What is the phase boundary for website capture and Gmail intake?
- Define the setup path when the Gmail account has no matching email available to preview.
- What should the role-aware home show? This remains intentionally deferred.
