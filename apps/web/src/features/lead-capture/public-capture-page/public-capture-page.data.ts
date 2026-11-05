export const publicCapturePageData = {
  documentTitle: 'Service request', missingTitle: 'Form not found', missing: 'This form is unavailable. Please contact the business directly.',
  errorTitle: 'Requests are temporarily unavailable', error: 'Please try again later or contact the business directly.',
  challenge: 'Complete the security check below, then retry this request.', challengeError: 'The security check could not be confirmed. Please complete a new check, then retry this request.',
  rateLimited: 'Please wait before retrying this request. Your information is still here.',
  stale: 'This form changed or its session expired. Refresh the form and review your information before sending.',
  refresh: 'Refresh form', refreshing: 'Refreshing form…', refreshed: 'The form is refreshed. Review the fields before sending your request.',
  refreshFailed: 'The form could not be refreshed. Your information is still here. Please try again.',
  invalid: 'Please check your information and consent before sending your request.',
  conflict: 'This request could not be confirmed. Please retry the same request or contact the business directly.',
  securityLabel: 'Security check',
  stories: { notice: 'Public rendering preview only. No submission is accepted.', business: 'Northstar Plumbing', title: 'Request plumbing service', phone: '+1 (212) 555-0100' },
} as const;
