import type { Knex } from 'knex';
import { captureAnswerIssues, type CaptureDraftConfiguration, type CaptureSetupFinding, type CaptureSetupContext } from '@salesmora/contracts';
import { captureDraftFingerprint, CaptureDraftValidationError } from './store';
export function captureSetupSampleHash(configuration: CaptureDraftConfiguration) {
  if (configuration.type !== 'gmail') throw new CaptureDraftValidationError();
  return captureDraftFingerprint({ connectionId: configuration.connectionId, accountEmail: configuration.accountEmail, fields: configuration.fields, contactRequired: configuration.contactRequired, rules: configuration.rules, mappings: configuration.mappings });
}
export function captureSetupAnswers(configuration: CaptureDraftConfiguration, findings: readonly CaptureSetupFinding[]) {
  return Object.fromEntries(findings.filter(row => row.included).map(row => {
    const field = configuration.fields?.find(field => field.id === row.fieldId);
    const choice = (text: string) => field?.options.find(option => option.id === text.trim() || option.label === text.trim())?.id ?? text.trim();
    return [row.fieldId, field?.type === 'checkboxes' ? row.sampleValue.split(',').map(choice) : field?.type === 'dropdown' ? choice(row.sampleValue) : row.sampleValue];
  }));
}
/** Pasted text is evidence only, never provider authority or a tool instruction. */
export function captureSetupFindingIssues(configuration: CaptureDraftConfiguration, sample: CaptureSetupContext['sample'], findings: readonly CaptureSetupFinding[], complete: boolean, allowCorrections = false): string[] {
  if (configuration.type !== 'gmail' || !sample || !configuration.fields?.length || findings.length > 50 || new Set(findings.map(row => row.id)).size !== findings.length) return ['sample'];
  const issues: string[] = [], included = findings.filter(row => row.included), ids = included.map(row => row.fieldId);
  if (new Set(ids).size !== ids.length || included.some(row => !configuration.fields!.some(field => field.id === row.fieldId))) issues.push('fields');
  for (const row of findings) {
    if (row.included && row.required !== configuration.fields!.find(field => field.id === row.fieldId)?.required) issues.push('required');
    const corrected = row.sampleValue !== row.suggestedValue;
    if (corrected && !allowCorrections) issues.push('correction');
    if (row.suggestedValue && (!row.evidence || !sample[row.evidence.source].includes(row.evidence.text) || !row.evidence.text.includes(row.suggestedValue))) issues.push('evidence');
    if (row.confidence === 'found' && !row.suggestedValue) issues.push('evidence');
    if (complete && row.included && (!row.sampleValue.trim() || !row.instruction.trim())) issues.push('missing');
  }
  if (complete) {
    if (!configuration.contactRequired || !['name', 'service'].every(key => configuration.fields!.some(field => field.key === key && field.required))) issues.push('required');
    const rules = configuration.rules;
    if (!rules?.phrases.length) issues.push('rules');
    else { const parts = (rules.location === 'both' ? [sample.subject, sample.body] : [sample[rules.location]]).map(part => part.toLowerCase()); const matches = rules.phrases.map(phrase => parts.some(part => part.includes(phrase.toLowerCase()))); if (!(rules.mode === 'all' ? matches.every(Boolean) : matches.some(Boolean))) issues.push('rules'); }
    const answers = captureSetupAnswers(configuration, included);
    issues.push(...captureAnswerIssues(configuration.fields, answers, configuration.contactRequired ?? true));
    if (configuration.fields.some(field => field.required && !ids.includes(field.id)) || !configuration.fields.some(field => ['email', 'phone'].includes(field.key) && ids.includes(field.id))) issues.push('required');
    if (configuration.mappings?.length !== included.length || included.some(row => !configuration.mappings?.some(mapping => mapping.fieldId === row.fieldId && mapping.instruction === row.instruction))) issues.push('mappings');
  }
  return issues;
}
export async function captureSetupSampleApproved(trx: Knex.Transaction, workspaceId: string, sourceId: string, draftId: string, configuration: CaptureDraftConfiguration) {
  if (configuration.type !== 'gmail' || !configuration.sampleId) return false;
  const row = await trx('captureSetupSamples').where({ workspaceId, sourceId, draftId, id: configuration.sampleId, configurationHash: captureSetupSampleHash(configuration) }).first('id');
  return !!row;
}
