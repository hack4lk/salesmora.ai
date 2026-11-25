import type { LegalDocumentProps } from '../legal-document/legal-document';

export const termsDocumentData = {
  title: 'Terms of Service',
  contentsLabel: 'Terms contents',
  documentLabel: 'Terms of Service draft',
  metadata: 'Effective date: pending legal approval · Version: pending',
  notice: {
    title: 'Draft for legal review — not effective',
    description: 'This proposed text is not a contract. The effective date and other open terms must be confirmed, and qualified counsel must review the complete terms before public registration.',
  },
  sections: [
    { id: 'service', title: 'Using the service', paragraphs: [
      'These Terms of Service are intended to govern use of SalesMora, a business software service for managing customer work, workflows, and related activities. SalesMora is a product of Karpuk Creative, LLC (“Karpuk Creative,” “we,” or “us”). “You” means the individual using the service and, if that individual acts for a business, both the individual and the business. Both are bound by these terms.',
      'You must be at least the age of legal majority in your jurisdiction and have the legal capacity to enter into these terms. You may access and use SalesMora only in the United States.',
      'If you create or use a workspace on behalf of a business, you represent that you are authorized to accept these terms and act on that business’s behalf. If you do not have that authority, do not use the service on its behalf. Features and availability depend on the plan, permissions, and services enabled for the workspace.',
    ] },
    { id: 'accounts', title: 'Accounts and teams', paragraphs: [
      'Provide accurate account information, keep your sign-in credentials secure, and notify us promptly if you believe your account has been compromised. Do not share credentials or allow another person to use your individual account.',
      'A workspace owner manages the workspace and may invite teammates and assign access. The business is responsible for determining who may access its workspace, managing its users’ permissions, and promptly removing access when a user should no longer have it.',
      'The business is responsible for actions taken in its workspace by users it authorizes, within the access assigned to those users.',
    ] },
    { id: 'acceptable-use', title: 'Acceptable use', paragraphs: [
      'Use SalesMora only for lawful purposes and with the rights and permissions needed for the information you provide. Do not interfere with the service, attempt unauthorized access, bypass usage limits, introduce malicious code, or use the service to harm others.',
      'You are responsible for your business’s communications and for providing required notices and obtaining any permissions or consents needed for your activities. Do not use SalesMora to send unlawful, deceptive, or unauthorized messages.',
      'Do not submit payment-card credentials, government identifiers, health information, or other sensitive information through ordinary lead forms. Any use involving such information requires separate review of applicable obligations and safeguards.',
    ] },
    { id: 'billing', title: 'Plans and billing', paragraphs: [
      'Subscriptions belong to a workspace. Available plans, prices, billing periods, and applicable usage allowances will be presented before purchase. The workspace owner manages paid subscriptions and payment methods. A paid subscription starts when checkout succeeds; there is no paid-plan trial at launch.',
      'Paid subscriptions renew monthly unless canceled. A paid-plan cancellation takes effect at the end of the current paid billing period; paid access continues until then and the workspace moves to Free afterward. Cancellation does not itself delete the workspace. A scheduled cancellation may be undone before it takes effect.',
      'Paid-plan upgrades may be prorated, with the amount shown before confirmation. Downgrades take effect at the end of the current paid period. If usage exceeds the new plan’s limits, affected capacity-increasing actions may be restricted; existing records and teammates are retained.',
      'If a renewal payment fails, paid access continues for seven days while payment is retried and the workspace owner is notified. If payment remains unsuccessful after that period, Free plan limits apply while existing data and teammate access are preserved. A successful verified payment restores paid access without resetting calendar-month usage.',
      <>No automatic refund is provided for mid-period cancellation or immediate deletion. Requests for an exception may be sent to <a href="mailto:info@salesmora.ai">info@salesmora.ai</a>, subject to applicable law. Tax treatment, payment-failure terms, and final pricing disclosures remain subject to legal and commercial review.</>,
    ] },
    { id: 'customer-data', title: 'Customer data', paragraphs: [
      'You retain your rights in the information and content you or your authorized users submit to the service (“Customer Data”). You are responsible for having the rights and permissions needed to submit it and direct its use through SalesMora.',
      'You authorize Karpuk Creative and its service providers to process Customer Data as needed to provide and secure the service, perform your requested workflows, and meet documented legal obligations. We do not sell Customer Data, use it for advertising, or use it to train general-purpose AI models.',
      <>The applicable Privacy Policy and any agreed data-processing terms will describe data handling in more detail. <strong>[Verify actual practices and provider agreements; Privacy Policy and data-processing terms remain subject to review.]</strong></>,
    ] },
    { id: 'ai', title: 'AI assistance', paragraphs: [
      'SalesMora may use AI-assisted features to help answer questions, prepare drafts, or configure supported workflows. Relevant prompts and authorized context may be processed by service providers to perform your request. AI output can be incomplete or incorrect; it is not a substitute for your own business judgment or professional advice.',
      'Review output and proposed actions before relying on them or confirming a change. Workflow actions operate according to the configuration and permissions available to your workspace. You are responsible for reviewing a workflow before publishing it and for monitoring whether it remains appropriate for your business.',
      <><strong>[Verify enabled AI features, data sent, provider terms, and available controls before publication.]</strong></>,
    ] },
    { id: 'availability', title: 'Availability and responsibility', paragraphs: [
      'SalesMora may rely on third-party providers and integrations. Their availability and terms may affect connected features. Service functionality may change, and interruptions, errors, or maintenance may occur. No specific uptime or uninterrupted availability commitment is made in this draft.',
      <strong key="availability-review">[Counsel review required: warranties and disclaimers, remedies, liability limitations and any cap, including treatment of Free users, and allocation of responsibility.]</strong>,
    ] },
    { id: 'termination', title: 'Cancellation and termination', paragraphs: [
      'Canceling a paid plan is separate from deleting an account or workspace. An authorized owner may request workspace deletion through the available account controls. Deletion ends access and begins a permanent deletion process; it cannot be undone through the service. Some billing, security, usage, provider, or backup records may be retained according to applicable requirements and retention policies.',
      'We may suspend access when reasonably necessary to address a security risk, unlawful use, a material breach of these terms, or a legal requirement. We will provide notice when practical; immediate action may be necessary in some circumstances. Suspension does not itself delete the workspace.',
      'Where available, authorized users may export workspace data before deletion or loss of access. The final terms must address any export opportunity following suspension or termination and any obligations that continue afterward.',
      <strong key="termination-review">[Counsel review required: termination rights, notice and remedies, export opportunities, retention periods, and surviving obligations. Verify deletion and export behavior before publication.]</strong>,
    ] },
    { id: 'changes', title: 'Changes to these terms', paragraphs: [
      'We may update these terms as the service or applicable requirements change. We intend to provide advance notice of material changes. The final terms will identify their effective date and describe how updates are communicated and whether renewed acceptance is required.',
      <strong key="changes-review">[Counsel review required: notice periods, exceptions, acceptance procedure, and version history.]</strong>,
    ] },
    { id: 'contact', title: 'Contact and legal details', paragraphs: [
      <>For questions about these proposed terms, contact Karpuk Creative, LLC at <a href="mailto:info@salesmora.ai">info@salesmora.ai</a>.</>,
      'The intended governing law is Maryland law. Disputes are intended to be brought in state or federal courts in Maryland, subject to jurisdiction and applicable law.',
      <strong key="contact-review">[Counsel review required: governing law, specific venue, dispute procedures, and required legal notices. Business address remains to be confirmed.]</strong>,
    ] },
  ],
} satisfies LegalDocumentProps;
