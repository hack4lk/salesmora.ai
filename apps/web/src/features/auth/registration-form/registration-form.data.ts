import { registrationPolicy } from '@salesmora/contracts';

export const registrationFormData = {
  formLabel: 'Create account',
  labels: { name: 'Your name', email: 'Work email', password: 'Create password', confirmPassword: 'Confirm password' },
  passwordMinimum: registrationPolicy.passwordMinimum,
  passwordHelp: 'Use 8–128 characters.',
  submit: 'Create account',
  pending: 'Creating account…',
  errors: {
    name: 'Enter your name (up to 100 characters).',
    email: 'Enter a valid email address.',
    password: 'Use 8–128 characters for your password.',
    confirmPassword: 'Passwords don’t match.',
    termsAccepted: 'Agree to the Terms of Service and Privacy Policy to create an account.',
    submission: 'We could not create your account. Your details are still here. Please try again.',
  },
  successTitle: 'Account created',
  success: 'Your account is ready. Continue to set up your workspace.',
  stories: {
    preview: 'UI preview only. Submissions and document links are mocked; no accounts are created.',
    name: 'Alex Rivera', email: 'alex@example.com', password: 'Fictional-demo-42!',
    otherPassword: 'Different-demo-42!', invalidEmail: 'alex@', shortPassword: 'short',
    termsHref: '#terms-preview', privacyHref: '#privacy-preview',
    serverError: 'Registration is temporarily unavailable. Please try again.',
    success: 'Demo submission complete. No account was created.',
  },
} as const;
