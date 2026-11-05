export const adminAuditViewerData = {
  failed: 'The audit request failed. Check your connection and retry.',
  invalid: 'The server returned an invalid audit response. Reload before relying on these results.',
  invalidLink: 'This audit deep link is invalid. The q value must contain at most 254 characters.',
  stories: { unavailable: 'The audit store is unavailable.', expired: 'Sign in with your verified staff identity.' },
} as const;
