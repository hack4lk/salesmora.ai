export const passwordRecoveryFormData = {
  formLabel: 'Request a password reset',
  emailLabel: 'Work email',
  emailHelp: 'Enter the email you use to sign in.',
  submit: 'Send reset link',
  pending: 'Requesting reset link…',
  successTitle: 'Check your email',
  success: 'If an account exists for that email, you’ll receive a password reset link. Check your spam folder too.',
  errors: {
    email: 'Enter a valid email address.',
    submission: 'We could not request a reset link. Please try again.',
  },
  stories: {
    preview: 'UI preview only. Requests are mocked; no emails are sent and no reset tokens are created.',
    email: 'alex@example.com',
    invalidEmail: 'alex@',
    spacedEmail: '  Alex@Example.com  ',
  },
} as const;
