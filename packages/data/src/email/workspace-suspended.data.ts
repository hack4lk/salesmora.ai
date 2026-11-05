export const workspaceSuspendedEmailData = {
  brand: 'SalesMora.ai', heading: 'Your workspace has been suspended',
  subject: (workspace: string) => `${workspace} has been suspended`,
  preheader: 'Access to your SalesMora workspace is paused.',
  introduction: (workspace: string) => `SalesMora support has suspended ${workspace}. You and your team cannot open it until it is restored.`,
  held: 'Your data is kept safe. Scheduled emails and file processing are paused and resume when the workspace is restored.',
  contact: 'Contact SalesMora support to learn more or to restore access.',
  reason: 'You received this email because you own this workspace.',
  logoCid: 'cid:salesmora-logo',
  stories: {
    title: 'Workspace suspended email', notice: 'Preview only. No email is sent; the workspace is fictional.', subject: 'Subject',
    frame: 'Workspace suspended email HTML preview', textHeading: 'Plain-text workspace suspended email',
    workspace: 'Northstar Plumbing',
    longWorkspace: 'Northstar Property Maintenance, Construction and Professional Services',
    escapedWorkspace: 'Northstar <script>fictional</script> & Partners',
    logoSrc: '/branding/salesmora-email-logo.png',
  },
} as const;
