export const formFeedbackData = {
  titles: { error: 'Unable to continue', success: 'Success' },
  stories: {
    previewLabel: 'Form feedback preview',
    errorMessage: 'We could not sign you in. Check your email and password and try again.',
    successTitle: 'Account created',
    successMessage: 'Your account is ready. Continue to set up your workspace.',
    customTitle: 'Workspace could not be created',
    customMessage: 'Your details are still here. Please try again.',
    longMessage: 'We could not complete your request. Your entered details have been preserved so you can review them and try again. If this keeps happening, contact your workspace administrator for help.',
  },
} as const;
