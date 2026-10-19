export const passwordResetEmailData = {
  subject: 'Reset your SalesMora.ai password',
  brand: 'SalesMora.ai',
  heading: 'Reset your password',
  introduction: 'We received a request to reset your SalesMora.ai password.',
  action: 'Choose a new password',
  expiry: 'This link expires in 30 minutes and can be used once.',
  ignore: 'If you did not request this, you can ignore this email. Your password will stay the same.',
  fallback: 'If the button does not work, copy and paste this link into your browser:',
} as const;
