# U.S.-First Privacy and Messaging Baseline

**Status:** Product and engineering baseline for the MVP. This is not legal advice or a legal compliance determination. Qualified U.S. counsel must review the product and its customer contracts before public launch, with separate review before sending campaign email or enabling SMS.

## Scope

SalesMora is planned as a business SaaS product for U.S. home-service companies. It will handle account and team data, business contact and lead data, website form submissions, connected Gmail intake data, and AI prompts/outputs used to support the customer's workflows. The product should not solicit government identifiers, payment-card credentials, health data, or other sensitive information through ordinary lead forms. Defer any use that requires processing these categories until the applicable obligations and safeguards are reviewed.

The product should not be marketed as universally compliant with privacy, email, or messaging laws. Which rules apply depends on the data, the parties' roles, the recipient's location, and the business's activities and thresholds. Counsel must decide when SalesMora acts as a service provider/processor and when it has independent controller/business responsibilities.

## MVP product rules

### Collection and use

- Collect only information needed for account administration, CRM use, intake, and customer-requested follow-up. Do not collect data merely because a field might be useful later.
- Use customer content only to provide and secure SalesMora, perform the customer's requested workflow, and meet documented legal obligations. Do not sell it, use it for advertising, or use it to train general-purpose models.
- Send the minimum authorized context to AI providers and other subprocessors. Keep provider credentials server-side, restrict access by tenant and role, and document subprocessors and their purposes.
- Publish clear, accurate privacy disclosures and ensure actual product behavior matches them. Provide an appropriate customer data-processing addendum and describe subprocessors, security practices, retention, deletion, and incident contact paths.

### Website forms and lead capture

- Identify the service business that receives the submission and link to its privacy notice. SalesMora should provide configuration for the business's notice and contact information.
- Explain the operational use of submitted information, including responding to the service request. Keep optional marketing consent separate from a service inquiry; do not preselect it or make it a condition of submitting an ordinary service request.
- Store the submitted notice/consent version, timestamp, source form, and selected preferences with the lead. Provide a way to correct or delete a submission through the customer's authorized workflow.
- Require customers to supply accurate notice and sender identity details before publishing a form or sending messages. Counsel should approve the final wording and consent model.

### Email and Gmail

- Gmail access is for the connected customer's authorized intake and reply-monitoring workflow only. Keep the integration read-only; never use Gmail to send SalesMora messages.
- Request the narrowest Google scopes that support the feature, explain the data use at authorization, protect tokens, restrict message content to authorized users, and provide disconnect/revocation and deletion controls.
- Treat Gmail message bodies as restricted Google user data. Before production connection, complete applicable OAuth verification and Google's required security assessment for restricted data stored/transmitted by the server. Do not use Gmail data for advertising or general model training.
- For SalesMora-sent email, separate operational/transactional notices from commercial lead nurturing and marketing. For commercial messages, support accurate sender and subject information, the sender's valid postal address, a clear unsubscribe method, and a durable suppression list. Apply opt-outs promptly across future campaign sends. Do not send commercial email when required sender or unsubscribe information is missing.
- Resend's current pricing page lists 30-day email data retention on Free, Pro, and Scale. Include that retention period and Resend's data-processing terms in the subprocessor review; recheck them before production because provider terms can change.
- Counsel must review the legal classification of templates, the business/customer allocation of CAN-SPAM responsibilities, required consent language, and handling of service-related messages. Build conservatively so marketing controls can be applied without changing the underlying CRM record.

### SMS

- SMS is not enabled for the MVP. Do not expose a send action or imply SMS consent based on a phone number or CRM status.
- Before SMS is enabled, define the consent record and its scope, sender/business identity, permitted message purpose, number, timestamp/source, revocation handling (including common STOP keywords), suppression enforcement, quiet hours, and relevant federal and state requirements. Obtain counsel review of the exact implementation and message templates.

### Security, rights, retention, and incidents

- Enforce tenant isolation and role checks on every read, write, export, agent tool, and file access. Encrypt traffic and sensitive stored credentials; apply least privilege; log access and consequential actions without copying message bodies or secrets into logs.
- Support customer export, correction, deletion, and account closure through authorized workflows. Keep a documented retention schedule for CRM records, raw email content, attachments, AI conversation data, logs, and backups; make deletion apply to recoverable copies according to the schedule.
- Maintain a security incident response plan, vendor escalation paths, and a documented breach assessment and notification workflow. Counsel must map state breach-notification timing and content requirements to the data and customer locations before launch.
- Keep the existing 90-day agent conversation/checkpoint and 30-day redacted operational trace limits. These do not establish retention periods for CRM records, Gmail content, backups, or billing records; define those separately before production.

## Launch review gates

| Gate | Required review before launch |
|---|---|
| Account and website intake | Counsel reviews privacy notice, terms, customer/business roles, form disclosure and consent language, data-processing terms, deletion/export commitments, and applicable U.S. state privacy laws and thresholds. |
| Gmail intake | Complete the least-privilege scope review, Google OAuth verification, restricted-scope security assessment, Google's data-use policy review, and user-facing disconnect/deletion behavior. |
| SalesMora outbound email | Counsel reviews CAN-SPAM applicability and allocation of sender/platform responsibilities, classifies operational versus commercial templates, and approves the unsubscribe/suppression implementation. |
| Security and retention | Approve the data inventory, retention/deletion schedule, backup purge behavior, incident response plan, breach notification responsibilities, access controls, and subprocessor terms. |
| SMS (later phase) | No launch until consent capture, revocation/suppression, sender identification, quiet-hour behavior, state-specific rules, and template review are complete. |

## Official references

- [FTC: CAN-SPAM Act compliance guide for business](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [FTC: Start with Security](https://www.ftc.gov/business-guidance/resources/start-security-guide-business)
- [FTC: Data Breach Response guide](https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business)
- [California Attorney General: CCPA overview](https://oag.ca.gov/privacy/ccpa)
- [Google: Gmail API scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Google: Restricted scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
- [Google Workspace: User data and developer policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)
- [FCC: FCC 24-24](https://docs.fcc.gov/public/attachments/FCC-24-24A1.pdf) — source for counsel to confirm current TCPA consent and revocation rules before SMS is enabled.
