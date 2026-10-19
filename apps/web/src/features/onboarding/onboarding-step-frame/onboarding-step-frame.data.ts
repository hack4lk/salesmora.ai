export const onboardingStepFrameData = {
  progressLabel: 'Workspace setup progress',
  completed: 'Completed',
  upcoming: 'Not started',
  optional: 'Optional',
  back: 'Back',
  continue: 'Continue',
  create: 'Create workspace',
  pending: 'Please wait…',
  creating: 'Creating workspace…',
  skipTeam: 'Skip for now',
  steps: {
    business: { label: 'Business', title: 'Tell us about your business', description: 'Use the name customers know. This will be the name on your workspace.' },
    services: { label: 'Services', title: 'What work do you take on?', description: 'Choose the services customers can ask you about. Select all that apply.' },
    team: { label: 'Team', title: 'Who should join you?', description: 'Invite teammates now, or skip this step and add people later.' },
    review: { label: 'Review', title: 'Review your workspace details', description: 'Make sure everything looks right before creating your workspace.' },
  },
  stories: {
    title: 'Set up your workspace',
    notice: 'Component preview. Navigation is local; no workspace is created or invitations sent.',
    placeholder: 'Step content will appear here.',
    keyboardLabel: 'Fictional step input',
    keyboardValue: 'Northstar Plumbing',
  },
} as const;
export type OnboardingStep = keyof typeof onboardingStepFrameData.steps;
export const onboardingStepOrder: readonly OnboardingStep[] = ['business', 'services', 'team', 'review'];
