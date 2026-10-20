export const emailVerificationEmailData = {
  subject: 'Verify your SalesMora.ai email', brand: 'SalesMora.ai',
  heading: 'Verify your email', preheader: 'Confirm your email address to enable teammate invitations.',
  introduction: 'Confirm this email address for your SalesMora.ai account.',
  purpose: 'You can keep using your workspace while verification is pending. Verify your email before sending teammate invitations.',
  action: 'Verify email', expiry: 'This link expires in 1 hour.',
  ignore: 'If you did not create a SalesMora.ai account or request this email, you can ignore it.',
  fallback: 'If the button does not work, copy and paste this link into your browser:',
  logoCid: 'cid:salesmora-logo',
  stories: {
    title: 'Email verification template', notice: 'Email preview. The link is fictional and cannot verify an account.',
    frame: 'Verification email HTML preview', textHeading: 'Plain-text email', subject: 'Subject',
    url: 'http://127.0.0.1:3000/api/auth/verify-email?token=preview-token-not-valid&callbackURL=%2Fhome',
    longUrl: 'http://127.0.0.1:3000/api/auth/verify-email?token=fictional-long-verification-token-for-layout-review-only-0123456789-abcdefghijklmnopqrstuvwxyz-0123456789&callbackURL=%2Fhome',
    escapedUrl: 'http://127.0.0.1:3000/api/auth/verify-email?token=%22%3E%3Cscript%3Efictional%3C%2Fscript%3E&callbackURL=%2Fhome',
    logoSrc: '/branding/salesmora-email-logo.png', previewRecipient: 'verification-preview@salesmora.test',
  },
} as const;
