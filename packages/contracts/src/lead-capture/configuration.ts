import { z } from 'zod';
import { leadSchema } from '../lead';
import { captureIdSchema, captureKeySchema, captureVersionSchema } from './common';

const keys = ['name', 'email', 'phone', 'service', 'details', 'address', 'custom'] as const;
const types = ['short_text', 'long_text', 'email', 'phone', 'address', 'dropdown', 'checkboxes', 'date'] as const;
const allowed = { name: ['short_text', 'long_text'], email: ['email'], phone: ['phone'], service: ['short_text', 'dropdown'], details: ['long_text', 'short_text'], address: ['address', 'short_text', 'long_text'], custom: ['short_text', 'long_text', 'dropdown', 'checkboxes', 'date'] };
export const captureFieldSchema = z.object({ id: captureKeySchema, key: z.enum(keys), label: z.string().trim().max(60), type: z.enum(types), required: z.boolean(),
  options: z.array(z.object({ id: captureKeySchema, label: z.string().trim().max(60) }).strict()).max(50),
}).strict().superRefine((field, ctx) => {
  if (!allowed[field.key].includes(field.type)) ctx.addIssue({ code: 'custom', message: 'Invalid standard field type' });
  if (new Set(field.options.map(option => option.id)).size !== field.options.length || new Set(field.options.map(option => option.label.toLowerCase())).size !== field.options.length) ctx.addIssue({ code: 'custom', message: 'Duplicate choices' });
  if (!['dropdown', 'checkboxes'].includes(field.type) && field.options.length) ctx.addIssue({ code: 'custom', message: 'Unexpected choices' });
});
export const captureFieldsSchema = z.array(captureFieldSchema).max(50).superRefine((fields, ctx) => {
  const standard = fields.filter(field => field.key !== 'custom').map(field => field.key);
  if (new Set(fields.map(field => field.id)).size !== fields.length || new Set(standard).size !== standard.length) ctx.addIssue({ code: 'custom', message: 'Duplicate field identities' });
});
export const captureWorkflowSchema = z.object({
  assignment: z.discriminatedUnion('kind', [z.object({ kind: z.literal('default') }).strict(), z.object({ kind: z.literal('teammate'), teammateId: z.string().min(1).max(200) }).strict()]),
  stage: leadSchema.shape.stage, tags: z.array(z.string().trim().min(1).max(50)).max(20).refine(tags => new Set(tags.map(tag => tag.toLowerCase())).size === tags.length, 'Duplicate tags'), notifyAssigned: z.boolean(),
}).strict();
const privacySchema = z.object({ label: z.string().trim().max(200), href: z.url().max(2000).refine(href => ['https:', 'http:'].includes(new URL(href).protocol)) }).strict();
export const captureConsentSchema = z.object({ id: captureKeySchema, version: captureVersionSchema, label: z.string().trim().max(2000), required: z.boolean() }).strict();
export const captureContentSchema = z.object({ businessName: z.string().trim().max(200), title: z.string().trim().max(200), intro: z.string().max(2000), submitLabel: z.string().trim().max(80), thankYou: z.string().trim().max(2000), unavailableMessage: z.string().trim().max(2000), businessEmail: leadSchema.shape.email, businessPhone: z.string().trim().max(100), showBusinessEmail: z.boolean(), showBusinessPhone: z.boolean(), privacy: privacySchema.nullable(), consent: captureConsentSchema.nullable() }).strict();
export const captureGmailRulesSchema = z.object({ phrases: z.array(z.string().trim().min(1).max(200)).max(20), location: z.enum(['subject', 'body', 'both']), mode: z.enum(['all', 'any']) }).strict().refine(value => new Set(value.phrases.map(phrase => phrase.toLowerCase())).size === value.phrases.length, 'Duplicate phrases');
export const captureMappingSchema = z.object({ fieldId: captureKeySchema, instruction: z.string().trim().min(1).max(2000) }).strict();
const common = { schemaVersion: z.literal(1), fields: captureFieldsSchema.optional(), contactRequired: z.boolean().optional(), workflow: captureWorkflowSchema.optional() };
export const captureDraftConfigurationSchema = z.discriminatedUnion('type', [
  z.object({ ...common, type: z.literal('website'), brief: z.string().max(10000).optional(), content: captureContentSchema.partial().optional() }).strict(),
  z.object({ ...common, type: z.literal('gmail'), connectionId: captureIdSchema.optional(), accountEmail: z.email().max(254).optional(), rules: captureGmailRulesSchema.optional(), mappings: z.array(captureMappingSchema).max(50).optional(), sampleId: captureIdSchema.optional() }).strict(),
]);
/** Complete launch shape only. Membership, connection ownership and approved-sample binding remain authoritative repository checks. */
const launchCommon = { schemaVersion: z.literal(1), fields: captureFieldsSchema.min(1), contactRequired: z.literal(true), workflow: captureWorkflowSchema };
export const captureConfigurationSchema = z.discriminatedUnion('type', [
  z.object({ ...launchCommon, type: z.literal('website'), brief: z.string().max(10000).optional(), content: captureContentSchema }).strict(),
  z.object({ ...launchCommon, type: z.literal('gmail'), connectionId: captureIdSchema, accountEmail: z.email().max(254), rules: captureGmailRulesSchema, mappings: z.array(captureMappingSchema).max(50), sampleId: captureIdSchema }).strict(),
]).superRefine((value, ctx) => {
  const fields = value.fields;
  if (!['name', 'service'].every(key => fields.some(field => field.key === key && field.required)) || !fields.some(field => field.key === 'email' || field.key === 'phone')) ctx.addIssue({ code: 'custom', message: 'Required lead/contact fields missing' });
  for (const field of fields) {
    if (!field.label || ['dropdown', 'checkboxes'].includes(field.type) && (field.options.length < 2 || field.options.some(option => !option.label || field.key === 'service' && option.label.length > 200))) ctx.addIssue({ code: 'custom', message: 'Incomplete field definition', path: ['fields'] });
  }
  if (value.type === 'website') {
    const content = captureContentSchema.safeParse(value.content);
    if (!content.success || !content.data.title || !content.data.businessName || !content.data.submitLabel || !content.data.thankYou || !content.data.unavailableMessage || content.data.consent && !content.data.consent.label || content.data.privacy && !content.data.privacy.label) ctx.addIssue({ code: 'custom', message: 'Incomplete form content', path: ['content'] });
  } else {
    if (!value.connectionId || !value.accountEmail || !value.rules?.phrases.length || !value.sampleId || !value.mappings) ctx.addIssue({ code: 'custom', message: 'Incomplete Gmail setup' });
    const mapped = value.mappings?.map(mapping => mapping.fieldId) ?? [];
    if (new Set(mapped).size !== mapped.length || mapped.some(id => !fields.some(field => field.id === id)) || fields.some(field => !mapped.includes(field.id))) ctx.addIssue({ code: 'custom', message: 'Mappings must match configured fields' });
  }
});
export const captureAnswersSchema = z.record(captureKeySchema, z.union([z.string().max(10000), z.array(captureKeySchema).max(50)])).refine(value => Object.keys(value).length <= 50, 'Too many answers');
export type CaptureConfiguration = z.infer<typeof captureConfigurationSchema>;
export type CaptureDraftConfiguration = z.infer<typeof captureDraftConfigurationSchema>;
export type CaptureField = z.infer<typeof captureFieldSchema>;
export type CaptureAnswers = z.infer<typeof captureAnswersSchema>;

/** Validate against the immutable historical field definition; never use current labels to reinterpret an answer. */
export function captureAnswerIssues(fields: readonly CaptureField[], answers: CaptureAnswers, contactRequired = true): string[] {
  const issues: string[] = [];
  if (Object.keys(answers).some(id => !fields.some(field => field.id === id))) issues.push('unknown_field');
  for (const field of fields) {
    const value = Object.hasOwn(answers, field.id) ? answers[field.id] : '';
    if (field.type === 'checkboxes') {
      if (value === '') { if (field.required) issues.push(field.id); continue; }
      if (!Array.isArray(value) || new Set(value).size !== value.length || value.some(id => !field.options.some(option => option.id === id)) || field.required && !value.length) issues.push(field.id);
      continue;
    }
    if (typeof value !== 'string') { issues.push(field.id); continue; }
    const text = value.trim(), limit = field.key === 'name' || field.key === 'service' ? 200 : field.type === 'email' ? 254 : field.type === 'phone' ? 100 : field.key === 'address' || field.type === 'address' ? 500 : field.key === 'details' || field.type === 'long_text' ? 10000 : 200;
    if (field.required && !text || text.length > limit || text && field.type === 'email' && !leadSchema.shape.email.safeParse(text).success || text && field.type === 'dropdown' && !field.options.some(option => option.id === text)) issues.push(field.id);
    if (text && field.type === 'date') { const date = new Date(`${text}T00:00:00Z`); if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text) issues.push(field.id); }
  }
  if (contactRequired && !fields.some(field => ['email', 'phone'].includes(field.key) && typeof answers[field.id] === 'string' && (answers[field.id] as string).trim())) issues.push('contact');
  return [...new Set(issues)];
}
