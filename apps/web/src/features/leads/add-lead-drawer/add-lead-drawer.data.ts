import { createLeadFormData } from '../create-lead-form/create-lead-form.data';
import { leadOwnerSelectData } from '../lead-owner-select/lead-owner-select.data';
export const addLeadDrawerData = {
  title: 'Add a lead', description: 'Capture the essentials. New leads start in New.',
  denied: 'You do not have permission to create leads.', limit: 'Your workspace has reached its lead allowance.',
  billing: 'Manage plan', contactOwner: 'Contact the workspace Owner to review your plan.',
  invalid: 'Some details exceed the allowed limits or are invalid. Review the entered information and try again.',
  ownerInvalid: 'Choose a current workspace teammate or Unassigned.',
  duplicate: 'A lead with matching contact details already exists.', openDuplicate: 'View existing lead', duplicateHelp: 'You can still create this lead if it is a separate opportunity.',
  stories: { title: 'Quick-add lead drawer', description: 'Local preview only. No lead is saved and no invitations or notifications are sent.',
    open: 'Add a lead', success: 'Lead created (preview only).', created: 'Open new lead', hidden: 'The new lead is hidden by the current filters.', clear: 'Clear filters',
    filled: { name: 'Taylor Brooks', service: 'Furnace repair', email: 'taylor@example.com', phone: '(212) 555-0100', source: 'referral' },
    members: leadOwnerSelectData.stories.members, failure: createLeadFormData.stories.serverError,
    oversizedName: 'A'.repeat(201),
    href: '#preview-created-lead', billingHref: '#preview-billing', duplicateHref: '#preview-existing-lead',
  },
} as const;
