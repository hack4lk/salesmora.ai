/** Review candidates only; never use preview copy as authoritative entitlements. */
export const registrationPricingConceptData = {
  brand: 'SalesMora.ai', logo: '/branding/salesmora-logo.svg',
  preview: 'Design preview · Draft monthly prices in USD · No account or payment is created',
  headline: 'A plan for the way you work.',
  description: 'Start small, bring your team, and grow your workspace when you’re ready.',
  accountTitle: 'Create your account', accountDescription: 'Your business details come next. You can review your plan before subscribing.',
  choose: 'Choose your workspace plan', selected: 'Selected', monthly: '/ month',
  planned: 'Campaigns and storage are planned features. Lead limits cover all creation sources. AI tokens are shared across the workspace. Monthly lead and AI allowances reset on the first of each month at midnight UTC, without rollover.',
  payment: 'Review your monthly payment before subscribing. No charge on this screen.',
  freePayment: 'No credit card required. Upgrade when you need more.',
  continue: 'Continue with', back: 'Back to plans', change: 'Change plan',
  createFree: 'Create free account', createPaid: 'Create account and continue',
  existing: 'Already have an account?', signIn: 'Sign in',
  terms: 'Terms of Service', privacy: 'Privacy Policy',
  steps: ['Account', 'Plan', 'Review'] as const,
  accountNext: 'Continue to plans', review: 'Review your selection',
  reviewDescription: 'Confirm your plan selection before continuing to workspace setup.',
  reviewButton: 'Continue to workspace setup', reviewDone: 'Preview complete. Your plan is ready for workspace setup.',
  summary: 'Your selected plan', nextHeading: 'Room to grow. Control at every step.',
  nextDescription: 'One workspace for your team and your opportunities. Choose a plan now, with a clear view of what is included.',
  successTitle: 'Account preview complete', success: 'Your selected plan will continue into workspace setup.',
  plans: [
    { id: 'free', name: 'Free', price: '$0', audience: 'For getting started', seats: '1 user, including owner', tokens: '1M AI tokens / month', leads: '100 new leads / month', campaigns: '1 published campaign', storage: '1 GB storage' },
    { id: 'standard', name: 'Standard', price: '$29', audience: 'For a small team', seats: '5 users, including owner', tokens: '5M AI tokens / month', leads: '1,000 new leads / month', campaigns: '5 published campaigns', storage: '10 GB storage' },
    { id: 'premium', name: 'Premium', price: '$49', audience: 'For a growing business', seats: '20 users, including owner', tokens: '20M AI tokens / month', leads: '5,000 new leads / month', campaigns: 'Unlimited published campaigns', storage: '25 GB storage' },
  ] as const,
} as const;
export type PreviewPlanId = typeof registrationPricingConceptData.plans[number]['id'];
