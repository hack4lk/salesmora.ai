export const howItWorksData = {
  eyebrow: 'From idea to action',
  title: 'Tell your sidekick what you need.',
  description: 'Set up a supported workflow in plain language, with a review step before it goes live.',
  steps: [
    { number: 'Step 01', title: 'Describe the task', cardTitle: 'Ask your sidekick', cardDescription: 'Remind me when an approved estimate needs a visit.', badge: 'Describe' },
    { number: 'Step 02', title: 'Review the plan', cardTitle: 'Review workflow', cardDescription: 'Approved estimate without a visit', badge: 'Review before publishing' },
    { number: 'Step 03', title: 'Let the workflow run', cardTitle: 'Reminder', cardDescription: 'An approved estimate still needs a visit.', badge: 'Needs attention' },
  ],
} as const;
