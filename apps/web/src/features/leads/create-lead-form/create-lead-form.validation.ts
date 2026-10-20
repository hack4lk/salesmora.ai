import { createLeadFormData as copy } from './create-lead-form.data';

export interface CreateLeadValues {
  name: string; email: string; phone: string; service: string; address: string; details: string;
  source: typeof copy.sources[number]['value']; stage: typeof copy.stages[number]['value'];
  ownerId: string; notes: string;
}
export type CreateLeadErrors = Partial<Record<'name' | 'service' | 'email', string>>;
export const emptyLead: CreateLeadValues = { name: '', email: '', phone: '', service: '', address: '', details: '', source: 'website', stage: 'new', ownerId: '', notes: '' };

/** UI checks only; persistence must independently validate and authorize every value. */
export function validateCreateLead(values: CreateLeadValues): CreateLeadErrors {
  const errors: CreateLeadErrors = {};
  if (!values.name.trim()) errors.name = copy.errors.name;
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = copy.errors.email;
  if (!values.service.trim()) errors.service = copy.errors.service;
  return errors;
}
export function normalizeCreateLead(values: CreateLeadValues): CreateLeadValues {
  return { ...values, name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), service: values.service.trim(), address: values.address.trim(), details: values.details.trim(), notes: values.notes.trim() };
}
