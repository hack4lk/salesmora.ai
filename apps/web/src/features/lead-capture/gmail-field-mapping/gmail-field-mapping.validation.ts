import { leadSchema } from '@salesmora/contracts';
import { gmailFieldMappingData as copy } from './gmail-field-mapping.data';
export type GmailMappingTarget = { id: string; key: 'name' | 'email' | 'phone' | 'service' | 'details' | 'address' | 'custom'; label: string; required?: boolean };
export type GmailMappingSample = { id: string; version: number; subject: string; body: string; retrievalId?: string };
export type GmailFieldMappingRow = {
  id: string; fieldId: string; included: boolean; source: 'label' | 'subject' | 'body'; label: string;
  review?: { sampleId: string; sampleVersion: number; configuration: string };
};
export type GmailFieldMappingValue = { rows: readonly GmailFieldMappingRow[] };
export type GmailMappingIssue = { rowId?: string; message: string };
export function mappingConfiguration(row: GmailFieldMappingRow): string { return JSON.stringify([row.id, row.fieldId, row.included, row.source, row.label]); }
export function extractGmailMapping(row: GmailFieldMappingRow, sample: GmailMappingSample | null): { value: string; evidence: string }[] {
  if (!sample) return [];
  if (row.source === 'subject' || row.source === 'body') {
    const evidence = sample[row.source]; return evidence.trim() ? [{ value: evidence.trim(), evidence }] : [];
  }
  if (row.source !== 'label') return [];
  const key = row.label.trim().replace(/:$/, '').trim().toLowerCase();
  if (!key) return [];
  return sample.body.split(/\r?\n/).flatMap(evidence => {
    const colon = evidence.indexOf(':');
    if (colon < 0 || evidence.slice(0, colon).trim().toLowerCase() !== key) return [];
    const value = evidence.slice(colon + 1).trim(); return value ? [{ value, evidence }] : [];
  });
}
export function isGmailMappingReviewed(row: GmailFieldMappingRow, sample: GmailMappingSample | null): boolean {
  return !!sample?.id && Number.isSafeInteger(sample.version) && sample.version > 0 && !!row.review && row.review.sampleId === sample.id && row.review.sampleVersion === sample.version && row.review.configuration === mappingConfiguration(row);
}
export function validateGmailFieldMapping(value: GmailFieldMappingValue, targets: readonly GmailMappingTarget[], sample: GmailMappingSample | null): GmailMappingIssue[] {
  const issues: GmailMappingIssue[] = [], ids = new Set<string>(), used = new Set<string>();
  const included = value.rows.filter(row => row.included);
  if (!included.length || value.rows.length > 50) issues.push({ message: copy.errors.count });
  if (!sample || !sample.id || !Number.isSafeInteger(sample.version) || sample.version < 1) issues.push({ message: copy.noSample });
  for (const row of value.rows) {
    if (!row.id || ids.has(row.id)) issues.push({ rowId: row.id, message: copy.errors.identity });
    ids.add(row.id);
    if (!row.included) continue;
    const target = targets.find(field => field.id === row.fieldId);
    if (!target) issues.push({ rowId: row.id, message: copy.errors.target });
    if (used.has(row.fieldId)) issues.push({ rowId: row.id, message: copy.errors.duplicate });
    used.add(row.fieldId);
    if (!['label', 'subject', 'body'].includes(row.source)) issues.push({ rowId: row.id, message: copy.errors.source });
    if (row.source === 'label' && (!row.label.trim().replace(/:$/, '').trim() || row.label.length > 100)) issues.push({ rowId: row.id, message: copy.errors.label });
    const matches = extractGmailMapping(row, sample);
    if (!matches.length) issues.push({ rowId: row.id, message: copy.errors.missing });
    if (matches.length > 1) issues.push({ rowId: row.id, message: copy.errors.ambiguous });
    if (matches.length === 1 && target?.key === 'email' && !leadSchema.shape.email.safeParse(matches[0].value).success) issues.push({ rowId: row.id, message: copy.errors.email });
    if (!isGmailMappingReviewed(row, sample)) issues.push({ rowId: row.id, message: copy.errors.unreviewed });
  }
  if (targets.some(target => target.required && !included.some(row => row.fieldId === target.id))) issues.push({ message: copy.errors.required });
  if (!included.some(row => targets.some(target => target.id === row.fieldId && (target.key === 'email' || target.key === 'phone')))) issues.push({ message: copy.errors.contact });
  return issues;
}
