export const registrationPlanScreenData = {
  brand: 'SalesMora.ai', logo: '/branding/salesmora-logo.svg', headline: 'A plan for the way you work.',
  description: 'Start small, bring your team, and grow your workspace when you’re ready.',
  choose: 'Choose your workspace plan',
  invalidPlan: 'The requested plan is unavailable. Please choose a plan.',
  names: { free: 'Free', standard: 'Standard', premium: 'Premium' },
  paid: 'Review your monthly payment after workspace setup. No charge on this screen.',
  free: 'No credit card required. Upgrade when you need more.',
  continue: (name: string) => `Continue with ${name}`, summary: 'Your selected plan', change: 'Change plan',
  accountTitle: 'Create your account', accountDescription: 'Your business details come next. You can review your plan before subscribing.',
  createFree: 'Create free account', createPaid: 'Create account and continue',
  existing: 'Already have an account?', signIn: 'Sign in',
  preview: 'Storybook preview · Draft monthly prices in USD · No account or payment is created',
} as const;
