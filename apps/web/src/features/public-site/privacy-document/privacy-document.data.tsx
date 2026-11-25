import type { LegalDocumentProps } from '../legal-document/legal-document';

export const privacyDocumentData = {
  title: 'Privacy Policy',
  contentsLabel: 'Privacy Policy contents',
  documentLabel: 'Privacy Policy draft',
  metadata: 'Effective date: pending legal approval · Version: pending',
  notice: {
    title: 'Draft for legal and data-practices review — not effective',
    description: 'This proposed text is not an effective privacy policy. Verify it against deployed features, provider agreements, data inventories, and retention practices; qualified counsel must approve it before public launch.',
  },
  sections: [
    { id: 'scope', title: 'Who we are and scope', paragraphs: [
      'SalesMora is a product of Karpuk Creative, LLC (“we,” “us,” or “our”). This draft describes how we may handle personal information when people visit the SalesMora website, create an account, contact us, or use SalesMora’s business software.',
      'A business using SalesMora may enter information about its own customers and leads or collect it through its own forms. That business determines how it uses those records and is responsible for its own privacy notices and practices. Our role and obligations depend on the circumstances, applicable law, and any agreement with the business.',
      <>SalesMora accounts are intended for adults who meet the age and capacity requirements in our Terms of Service. <strong>[Counsel to confirm children’s privacy disclosures and controller, processor, and service-provider roles.]</strong></>,
    ] },
    { id: 'collection', title: 'Information we collect', paragraphs: [
      'Depending on how you use the service, we may receive account and workspace information such as your name, email address, sign-in and session information, team membership, subscription details, and communications with us.',
      'Workspace users may provide information about their businesses, customers, and leads, including contact details, service requests, estimates, jobs, schedules, and related records. Depending on the features enabled, information may also come from a customer’s forms or connected email account.',
      'If you use the assistant, we may process prompts, conversation history, and the authorized workspace information needed to respond. Payment providers may process payment information; SalesMora application code is designed not to receive raw card numbers. We may also receive technical and security information associated with use of the service.',
      <strong key="collection-review">[Confirm actual data categories, collection sources, integrations, technical logs, and deployed payment processing before publication.]</strong>,
    ] },
    { id: 'uses', title: 'How information is used', paragraphs: [
      'We use information to provide and secure the service, administer accounts and workspaces, support users, process transactions, communicate about the service, and perform workflows requested by the customer. We may also use information to meet documented legal obligations and respond to security or operational issues.',
      'Our product baseline limits use of customer content to providing and securing the service, carrying out customer-requested workflows, and documented legal obligations. We do not sell personal information or use it for targeted advertising, and we do not use customer content to train general-purpose models.',
      <strong key="uses-review">[Verify production behavior, provider agreements, and the applicable legal meaning of sale and targeted advertising before publication.]</strong>,
    ] },
    { id: 'ai', title: 'AI and automated workflows', paragraphs: [
      'When you use an AI-assisted feature, relevant prompts and authorized workspace context may be sent to a service provider to generate a response or draft. SalesMora is designed to provide the minimum authorized context needed for the request. AI output may be incomplete or incorrect and should be reviewed before use.',
      'Supported workflows may run according to their approved configuration without a new AI generation for each execution. The business is responsible for reviewing its workflows and determining whether its use of personal information is appropriate.',
      <strong key="ai-review">[Confirm the providers used, their retention and data-use terms, available controls, and the data sent by each enabled feature before publication.]</strong>,
    ] },
    { id: 'sharing', title: 'Service providers and sharing', paragraphs: [
      'We may use service providers for hosting and infrastructure, email delivery, payment processing, and AI-assisted features. Providers may receive information needed to perform their services. Optional integrations may receive or provide information when the business enables and authorizes them.',
      'We may disclose information when required by law or to respond to legal and security matters, subject to applicable law and agreements. The final policy and any applicable data-processing terms will describe relevant provider and sharing practices.',
      <strong key="sharing-review">[Confirm the production provider list, purposes, locations, subprocessors, data transfers, and any required customer data-processing terms.]</strong>,
    ] },
    { id: 'cookies', title: 'Cookies and analytics', paragraphs: [
      'SalesMora uses account-session mechanisms to support sign-in and may use cookies or similar browser storage for session and security functions. Browser settings may offer controls for some of these technologies; disabling necessary storage may prevent sign-in or other functions.',
      <strong key="cookies-review">[Inventory all cookies, storage, analytics, and similar technologies used at launch; describe their purposes, applicable controls, and any required consent before publication.]</strong>,
    ] },
    { id: 'rights', title: 'Privacy choices and requests', paragraphs: [
      'Depending on applicable law and your relationship with us, you may have rights to access, correct, or delete personal information, or other choices concerning its use. Contact us using the details below to make a request. We may need to verify your identity or authority before responding, and applicable exceptions may apply.',
      'If a service business using SalesMora holds your information in its workspace, contact that business about its records and privacy practices. We may direct requests about customer-controlled data to the business where appropriate, and will address them according to applicable law and our agreements.',
      <strong key="rights-review">[Counsel to confirm applicable rights, request methods, verification, response periods, appeal procedures, and required state-specific disclosures.]</strong>,
    ] },
    { id: 'retention', title: 'Retention and security', paragraphs: [
      'We retain information for the period needed to provide the service and for other applicable purposes, subject to the final retention schedule and legal requirements. Account or workspace deletion can end access and initiate deletion, but some billing, security, usage, provider, or backup records may remain according to applicable requirements and retention practices.',
      'Private assistant threads become eligible for deletion after 90 days of inactivity. Sending a new turn updates activity; viewing history alone does not. Cleanup may occur later, including when a thread is active or cleanup is delayed. This period does not determine retention by providers or the expiration of backups, and separate audit or usage records may remain.',
      'SalesMora is designed to use access controls and other safeguards appropriate to the service. No method of storage or transmission is completely secure.',
      <strong key="retention-review">[Confirm production retention periods, backup expiration, provider retention, deletion behavior, and security disclosures before publication.]</strong>,
    ] },
    { id: 'changes', title: 'Changes to this policy', paragraphs: [
      'We may update this policy as the service or applicable requirements change. The final policy will identify its effective date and explain how material updates are communicated. Please review the current policy when it is published.',
      <strong key="changes-review">[Counsel to confirm notice, effective-date, and version-history requirements.]</strong>,
    ] },
    { id: 'contact', title: 'Contact us', paragraphs: [
      <>For questions about this policy or to make a privacy request, contact Karpuk Creative, LLC at <a href="mailto:info@salesmora.ai">info@salesmora.ai</a>. Include enough detail for us to understand your request; do not send sensitive information unless requested through an appropriate channel.</>,
      <strong key="contact-review">[Confirm privacy-request handling, business address, and any additional required contact methods before publication.]</strong>,
    ] },
  ],
} satisfies LegalDocumentProps;
