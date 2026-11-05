import type { VisitorCaptureDefinition } from '../visitor-capture-form/visitor-capture-form.validation';

export const captureFormPreviewData = {
  title: 'Customer preview',
  description: 'Preview only · nothing is published',
  testNotice: 'Test the form here. No request is sent and no lead is created.',
  viewport: 'Preview size', desktop: 'Desktop', mobile: 'Mobile',
  state: 'Preview state', active: 'Accepting requests', paused: 'Paused message',
  reset: 'Reset test', denied: 'You do not have permission to preview this capture source.',
  invalid: 'This draft has incomplete or invalid settings. Update the form configuration before publishing.',
  stories: { name: 'Alex Morgan', email: 'alex@example.com', service: 'Kitchen plumbing', change: 'Update draft', updatedTitle: 'Request a plumbing visit' },
};
export const captureFormPreviewExample: VisitorCaptureDefinition = {
  id: 'draft-preview', version: 1, businessName: 'Northstar Plumbing', title: 'Tell us about your project',
  intro: 'Share a few details and our team will follow up with you.', contactRequired: true,
  thankYou: 'Thank you for getting in touch. Our team will follow up with you soon.',
  unavailableMessage: 'We are not accepting online requests right now. Please contact our team directly.',
  businessEmail: 'hello@example.com', businessPhone: '+1 212 555 0100',
  privacy: { label: 'Read our privacy policy', href: 'https://example.com/privacy' },
  fields: [
    { id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] },
    { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] },
    { id: 'phone', key: 'phone', label: 'Phone', type: 'phone', required: false, options: [] },
    { id: 'service', key: 'service', label: 'Service needed', type: 'short_text', required: true, options: [] },
    { id: 'details', key: 'details', label: 'Project details', type: 'long_text', required: false, options: [] },
  ],
};
