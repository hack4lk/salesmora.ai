import { leadSchema } from '@salesmora/contracts';
import type { GmailMappingSample, GmailMappingTarget } from './gmail-field-mapping.validation';
import { gmailFieldMappingData as copy } from './gmail-field-mapping.data';
import type { GmailCaptureRulesValue } from '../gmail-capture-rules/gmail-capture-rules.validation';
export type GmailFinding = {
  id: string; fieldId: string; included: boolean; sampleValue: string; suggestedValue: string;
  confidence: 'found' | 'uncertain' | 'missing'; required: boolean; instruction: string;
  evidence: { source: 'subject' | 'body'; text: string } | null;
};
export type GmailFindingsValue = { sampleId: string; sampleVersion: number; findings: readonly GmailFinding[] };
export type GmailFindingsApproval = { value: GmailFindingsValue; sample: GmailMappingSample; targets: readonly GmailMappingTarget[]; rules: GmailCaptureRulesValue };
export type GmailFindingsMessage = { id: string; role: 'user' | 'assistant'; text: string };
export function findingsIssues(value: GmailFindingsValue, targets: readonly GmailMappingTarget[], sample: GmailMappingSample | null): { fieldId?: string; message: string }[] {
  const issues: { fieldId?: string; message: string }[] = [], ids = new Set<string>(), used = new Set<string>();
  if (!sample || !sample.id || !Number.isSafeInteger(sample.version) || sample.version < 1 || value.sampleId !== sample.id || value.sampleVersion !== sample.version) issues.push({ message: copy.findings.stale });
  const included = value.findings.filter(field => field.included);
  if (!included.length || value.findings.length > 50) issues.push({ message: copy.errors.count });
  for (const field of value.findings) {
    if (!field.id || ids.has(field.id)) issues.push({ fieldId: field.id, message: copy.errors.identity });
    ids.add(field.id); if (!field.included) continue;
    const target = targets.find(item => item.id === field.fieldId);
    if (!target) issues.push({ fieldId: field.id, message: copy.errors.target });
    if (used.has(field.fieldId)) issues.push({ fieldId: field.id, message: copy.errors.duplicate });
    used.add(field.fieldId);
    const limit = target?.key === 'name' || target?.key === 'service' ? 200 : target?.key === 'email' ? 254 : target?.key === 'phone' ? 100 : target?.key === 'address' ? 500 : 10000;
    const hasValue = !!field.sampleValue.trim();
    if (!hasValue) issues.push({ fieldId: field.id, message: copy.findings.missingValue });
    else if (field.sampleValue.length > limit) issues.push({ fieldId: field.id, message: copy.findings.valueError(limit) });
    if (!field.instruction.trim() || field.instruction.length > 2000) issues.push({ fieldId: field.id, message: copy.findings.instructionError });
    if (hasValue && target?.key === 'email' && !leadSchema.shape.email.safeParse(field.sampleValue.trim()).success) issues.push({ fieldId: field.id, message: copy.errors.email });
    if (field.suggestedValue && field.sampleValue === field.suggestedValue && (!field.evidence?.text || !sample || !['subject', 'body'].includes(field.evidence.source) || !sample[field.evidence.source].includes(field.evidence.text))) issues.push({ fieldId: field.id, message: copy.findings.evidenceError });
  }
  if (targets.some(target => target.required && !included.some(field => field.fieldId === target.id))) issues.push({ message: copy.errors.required });
  if (!included.some(field => targets.some(target => target.id === field.fieldId && (target.key === 'email' || target.key === 'phone')))) issues.push({ message: copy.errors.contact });
  return issues;
}
