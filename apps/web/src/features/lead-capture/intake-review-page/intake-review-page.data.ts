export const intakeReviewPageData = {
  title: 'Intake Review',
  description: 'Review captured requests and matching emails before creating or updating a lead.',
  denied: 'You do not have access to Intake Review.',
  stories: {
    preview: 'Fictional intake queue. Filters and navigation are simulated; no emails are accessed and no leads are created or changed.',
    opened: (name: string) => `Preview: open intake details for ${name}. No decision has been applied.`,
    workspace: 'Harbor Home Services', viewer: 'Ava Morgan', email: 'ava@example.com',
    archived: 'Previous season enquiries (archived)',
    long: 'Whole-home renovation and extended residential property improvement enquiry ',
  },
} as const;
