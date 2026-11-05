import { captureAnswersSchema, captureEvidenceSchema } from '@salesmora/contracts';
import { createGmailExtractionModel } from '@salesmora/agent';
import { createAIUsageRecorder, type Knex } from '@salesmora/data';
import type { GmailCaptureDependencies } from './gmail-capture.js';

export function gmailExtractor(db: Knex, apiKey: string): GmailCaptureDependencies['extract'] {
  return async (lease, message) => {
    const configuration = lease.configuration;
    if (configuration.type !== 'gmail') throw Error('Gmail extraction configuration unavailable.');
    const extract = createGmailExtractionModel(apiKey, createAIUsageRecorder(db, { workspaceId: lease.workspaceId }));
    const evidence = { from: message.sender, subject: message.subject, body: message.body };
    const raw = await extract(JSON.stringify({ fields: configuration.fields, mappings: configuration.mappings, evidence }), AbortSignal.timeout(35_000));
    return validateGmailFindings(configuration.fields, evidence, raw);
  };
}

export function validateGmailFindings(
  fields: readonly { id: string; type: string; options: readonly { id: string; label: string }[] }[],
  evidence: Record<'from' | 'subject' | 'body', string>,
  raw: unknown,
): Awaited<ReturnType<GmailCaptureDependencies['extract']>> {
  const findings = raw && typeof raw === 'object' && 'findings' in raw ? raw.findings : null;
  if (!Array.isArray(findings) || findings.length > fields.length) throw Error('Invalid Gmail findings.');
  const answers: Record<string, string | string[]> = Object.create(null);
  const origins: Awaited<ReturnType<GmailCaptureDependencies['extract']>>['fields'] = [];
  for (const item of findings) {
    const field = item ? fields.find(candidate => candidate.id === item.fieldId) : undefined;
    if (!field || Object.hasOwn(answers, field.id) || typeof item.uncertain !== 'boolean' ||
        !Object.hasOwn(evidence, item.location) || typeof item.quote !== 'string' || !item.quote.trim() ||
        item.quote.length > 6000 || !evidence[item.location as keyof typeof evidence].includes(item.quote) ||
        !Array.isArray(item.values) || !item.values.length || item.values.length > 50 ||
        (field.type !== 'checkboxes' && item.values.length !== 1)) throw Error('Invalid Gmail finding evidence.');
    const values: string[] = item.values;
    const choice = field.type === 'dropdown' || field.type === 'checkboxes';
    if (new Set(values).size !== values.length || values.some(value => {
      if (typeof value !== 'string' || !value.trim()) return true;
      const literal = choice ? field.options.find(option => option.id === value)?.label : value;
      return !literal || !item.quote.includes(literal);
    })) throw Error('Unsupported Gmail finding value.');
    answers[field.id] = field.type === 'checkboxes' ? values : values[0];
    origins.push({ fieldId: field.id, uncertain: item.uncertain, origin: { kind: 'email', location: item.location, quote: item.quote } });
  }
  captureEvidenceSchema.parse({ schemaVersion: 1, type: 'gmail', ...evidence, fields: origins });
  return { answers: captureAnswersSchema.parse(answers), fields: origins };
}
