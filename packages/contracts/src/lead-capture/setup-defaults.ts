import type { CaptureDraftConfiguration } from './configuration';
/** Canonical draft defaults shared by manual setup and confirmed assistant creation. */
export function initialCaptureSetupConfiguration(type: 'website' | 'gmail', business: { businessName: string; businessEmail: string; businessPhone: string }): CaptureDraftConfiguration {
  const workflow = { assignment: { kind: 'default' as const }, stage: 'new' as const, tags: [], notifyAssigned: true };
  if (type === 'gmail') return { schemaVersion: 1, type, rules: { phrases: [], location: 'both', mode: 'all' }, workflow };
  const labels = { name: 'Name', email: 'Email', phone: 'Phone', service: 'Service requested', details: 'Project details', address: 'Service address' };
  return { schemaVersion: 1, type, brief: '', contactRequired: true, fields: (Object.keys(labels) as (keyof typeof labels)[]).map(key => ({ id: key, key, label: labels[key], type: key === 'email' ? 'email' : key === 'phone' ? 'phone' : key === 'details' ? 'long_text' : key === 'address' ? 'address' : 'short_text', required: key === 'name' || key === 'service', options: [] })),
    content: { businessName: business.businessName, businessEmail: business.businessEmail, businessPhone: business.businessPhone, title: 'Tell us about your project', intro: 'Share a few details and our team will be in touch.', submitLabel: 'Send request', thankYou: 'Thanks for your request. Our team will be in touch.', unavailableMessage: 'We are not accepting online requests right now. Please contact our team directly.', showBusinessEmail: false, showBusinessPhone: !!business.businessPhone, privacy: null, consent: null }, workflow };
}
