import { leadSchema } from '@salesmora/contracts';
import { validateCaptureFormFields, type CaptureFormFieldEditorValue, type CaptureFormField } from '../capture-form-field-editor/capture-form-field-editor.validation';
import { visitorCaptureFormData as copy } from './visitor-capture-form.data';

export type VisitorCaptureDefinition = CaptureFormFieldEditorValue & {
  id: string; version: number; businessName: string; title: string; intro?: string; submitLabel?: string; thankYou?: string; unavailableMessage?: string;
  businessEmail?: string; businessPhone?: string;
  showBusinessEmail?: boolean; showBusinessPhone?: boolean;
  privacy?: { label: string; href: string };
  consent?: { id: string; version: number; label: string; required: boolean };
};
export type VisitorCaptureValues = { answers: Record<string, string | string[]>; consent: boolean; website: string };
export type VisitorCaptureSubmission = {
  definitionId: string; definitionVersion: number; idempotencyKey: string;
  answers: Record<string, string | string[]>;
  consent: { id: string; version: number; accepted: boolean } | null;
  website: string;
  /** A host-supplied token is evidence for server verification, never authorization. */
  challengeToken?: string;
};
export type VisitorCaptureErrors = { fields: Record<string, string>; consent?: string };
export const safePrivacyHref = (href: string): string | undefined => {
  try { const url = new URL(href); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
};
export function isVisitorDefinitionValid(definition: VisitorCaptureDefinition): boolean {
  return !!definition.id && Number.isSafeInteger(definition.version) && definition.version > 0 && !!definition.title.trim()
    && validateCaptureFormFields(definition).length === 0
    && (!definition.privacy || (!!definition.privacy.label.trim() && !!safePrivacyHref(definition.privacy.href)))
    && (!definition.consent || (!!definition.consent.id && definition.consent.version > 0 && !!definition.consent.label.trim()));
}
export function visitorFieldLimit(field: CaptureFormField): number {
  if (field.key === 'name' || field.key === 'service') return 200;
  if (field.type === 'email') return 254;
  if (field.type === 'phone') return 100;
  if (field.key === 'address' || field.type === 'address') return 500;
  if (field.key === 'details' || field.type === 'long_text') return 10000;
  return 200;
}
export function visitorAnswer(values: VisitorCaptureValues, id: string): string | string[] {
  return Object.hasOwn(values.answers, id) ? values.answers[id] : '';
}
/** UX validation only; the server must bind the published definition and independently validate every answer. */
export function validateVisitorCapture(definition: Pick<VisitorCaptureDefinition, 'fields' | 'contactRequired' | 'consent'>, values: VisitorCaptureValues): VisitorCaptureErrors {
  const fields: Record<string, string> = Object.create(null);
  for (const field of definition.fields) {
    const value = visitorAnswer(values, field.id);
    const choices = field.options.map(option => option.id);
    if (field.type === 'checkboxes') {
      if (!Array.isArray(value) && value !== '') fields[field.id] = copy.choice;
      else if (Array.isArray(value) && (value.some(item => !choices.includes(item)) || new Set(value).size !== value.length)) fields[field.id] = copy.choice;
      else if (field.required && (!Array.isArray(value) || value.length === 0)) fields[field.id] = copy.required;
      continue;
    }
    if (typeof value !== 'string') { fields[field.id] = copy.choice; continue; }
    const text = value.trim();
    if (field.required && !text) fields[field.id] = copy.required;
    else if (text.length > visitorFieldLimit(field)) fields[field.id] = copy.length(visitorFieldLimit(field));
    else if (text && field.type === 'email' && !leadSchema.shape.email.safeParse(text).success) fields[field.id] = copy.email;
    else if (text && field.type === 'dropdown' && !choices.includes(text)) fields[field.id] = copy.choice;
    else if (text && field.type === 'date') {
      const date = new Date(`${text}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) fields[field.id] = copy.date;
    }
  }
  const contacts = definition.fields.filter(field => field.key === 'email' || field.key === 'phone');
  if (definition.contactRequired && !contacts.some(field => { const answer = visitorAnswer(values, field.id); return typeof answer === 'string' && !!answer.trim(); })) {
    for (const field of contacts) fields[field.id] = copy.contact;
  }
  return { fields, consent: definition.consent?.required && !values.consent ? copy.consent : undefined };
}
export function normalizeVisitorCapture(definition: VisitorCaptureDefinition, values: VisitorCaptureValues): Omit<VisitorCaptureSubmission, 'idempotencyKey'> {
  return {
    definitionId: definition.id, definitionVersion: definition.version,
    answers: Object.fromEntries(definition.fields.map(field => {
      const answer = visitorAnswer(values, field.id);
      if (field.type === 'checkboxes') return [field.id, field.options.filter(option => Array.isArray(answer) && answer.includes(option.id)).map(option => option.id)];
      const text = typeof answer === 'string' ? answer.trim() : '';
      return [field.id, field.type === 'email' ? text.toLowerCase() : text];
    })),
    consent: definition.consent ? { id: definition.consent.id, version: definition.consent.version, accepted: values.consent } : null,
    website: values.website,
  };
}
