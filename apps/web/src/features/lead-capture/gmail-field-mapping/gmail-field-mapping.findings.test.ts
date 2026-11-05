import { describe, expect, it } from 'vitest';
import { findingsIssues, type GmailFinding } from './gmail-field-mapping.findings';
import { gmailFieldMappingData as copy } from './gmail-field-mapping.data';
const sample = { id: 'example', version: 1, subject: 'Inquiry', body: 'Name: Alex\nEmail: alex@example.com' };
const targets = [{ id: 'name', key: 'name' as const, label: 'Name', required: true }, { id: 'email', key: 'email' as const, label: 'Email' }];
const findings: GmailFinding[] = targets.map(target => {
  const evidence = sample.body.split('\n').find(line => line.startsWith(`${target.label}:`))!;
  const value = evidence.split(':')[1].trim();
  return { id: target.id, fieldId: target.id, included: true, sampleValue: value, suggestedValue: value, confidence: 'found', required: !!('required' in target && target.required), instruction: `Find ${target.label}`, evidence: { source: 'body', text: evidence } };
});
const value = { sampleId: sample.id, sampleVersion: sample.version, findings };
describe('assistant-guided Gmail findings', () => {
  it('accepts complete supported findings', () => { expect(findingsIssues(value, targets, sample)).toEqual([]); });
  it('requires the current sample identity and version', () => {
    expect(findingsIssues(value, targets, { ...sample, version: 2 }).length).toBeGreaterThan(0);
    expect(findingsIssues(value, targets, { ...sample, id: 'new' }).length).toBeGreaterThan(0);
  });
  it('rejects fabricated or stale evidence for unchanged suggestions', () => {
    expect(findingsIssues({ ...value, findings: findings.map(field => ({ ...field, evidence: { source: 'body', text: 'fabricated' } })) }, targets, sample).length).toBeGreaterThan(0);
    expect(findingsIssues(value, targets, { ...sample, body: 'Email: alex@example.com' }).length).toBeGreaterThan(0);
  });
  it('allows explicit example corrections without rewriting future extraction', () => {
    const edited = { ...value, findings: findings.map(field => field.id === 'name' ? { ...field, sampleValue: 'Alexandra' } : field) };
    expect(findingsIssues(edited, targets, sample)).toEqual([]);
    expect(edited.findings[0].instruction).toBe(findings[0].instruction);
  });
  it('rejects missing/invalid values, invalid destinations and duplicate fields', () => {
    for (const updated of [{ ...findings[0], sampleValue: '' }, { ...findings[0], fieldId: 'unknown' }, { ...findings[0], instruction: '' }]) expect(findingsIssues({ ...value, findings: [updated, findings[1]] }, targets, sample).length).toBeGreaterThan(0);
    expect(findingsIssues({ ...value, findings: [...findings, findings[0]] }, targets, sample).length).toBeGreaterThan(0);
    expect(findingsIssues({ ...value, findings: [findings[0], { ...findings[1], sampleValue: 'bad' }] }, targets, sample).length).toBeGreaterThan(0);
  });
  it('does not approve excluded required/contact fields', () => {
    expect(findingsIssues({ ...value, findings: findings.map(field => ({ ...field, included: false })) }, targets, sample).length).toBeGreaterThan(0);
  });
  it('accepts a source-local custom field with an explicit user example', () => {
    const field: GmailFinding = { id: 'budget', fieldId: 'budget', included: true, sampleValue: '$3000', suggestedValue: '', confidence: 'missing', required: false, instruction: 'Estimated customer budget including currency', evidence: null };
    expect(findingsIssues({ ...value, findings: [...findings, field] }, [...targets, { id: 'budget', key: 'custom', label: 'Budget' }], sample)).toEqual([]);
  });
  it('asks for a missing phone example without reporting stale evidence', () => {
    const phone: GmailFinding = { id: 'phone', fieldId: 'phone', included: true, sampleValue: '', suggestedValue: '', confidence: 'missing', required: false, instruction: 'Find the callback number', evidence: null };
    expect(findingsIssues({ ...value, findings: [...findings, phone] }, [...targets, { id: 'phone', key: 'phone', label: 'Phone' }], sample)).toEqual([{ fieldId: 'phone', message: copy.findings.missingValue }]);
  });
});
