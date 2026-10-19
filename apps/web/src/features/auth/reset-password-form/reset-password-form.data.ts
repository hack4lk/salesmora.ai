export const resetPasswordFormData = {
  formLabel: 'Choose a new password',
  password: 'New password',
  confirmation: 'Confirm new password',
  help: 'Use 8–128 characters.',
  submit: 'Reset password',
  pending: 'Resetting password…',
  successTitle: 'Password updated',
  success: 'Your password has been changed and your existing sessions have been signed out. Sign in with your new password.',
  errors: {
    password: 'Use a password with 8–128 characters.',
    confirmation: 'Enter the same password in both fields.',
    invalidLink: 'This reset link is invalid, expired, or has already been used. Request a new link to continue.',
    submission: 'We could not reset your password. Please try again.',
  },
  requestLink: 'Request a new reset link',
  requestHref: '/forgot-password',
  stories: { password: 'Fictional-new-password-42!' },
} as const;
