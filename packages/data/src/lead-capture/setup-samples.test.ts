import { describe, expect, it } from 'vitest';
import type { CaptureDraftConfiguration, CaptureSetupFinding } from '@salesmora/contracts';
import { captureSetupFindingIssues, captureSetupSampleHash } from './setup-samples';
const sample = { id: '00000000-0000-4000-8000-000000000001', version: 1, subject: 'Repair request', body: 'Name: Jordan\nEmail: jordan@example.test\nService: Repair\nOptions: Morning, Evening' };
const fields = [{ id: 'name', key: 'name' as const, label: 'Name', type: 'short_text' as const, required: true, options: [] }, { id: 'email', key: 'email' as const, label: 'Email', type: 'email' as const, required: false, options: [] }, { id: 'service', key: 'service' as const, label: 'Service', type: 'dropdown' as const, required: true, options: [{ id: 'repair', label: 'Repair' }, { id: 'install', label: 'Install' }] }];
const findings: CaptureSetupFinding[] = fields.map(field => { const value = field.id === 'name' ? 'Jordan' : field.id === 'email' ? 'jordan@example.test' : 'Repair'; return { id: field.id, fieldId: field.id, included: true, sampleValue: value, suggestedValue: value, required: field.required, confidence: 'found', instruction: `Read ${field.label}`, evidence: { source: 'body', text: sample.body.split('\n').find(line => line.includes(value))! } }; });
const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'gmail', fields, contactRequired: true, rules: { phrases: ['Repair request'], location: 'subject', mode: 'all' }, mappings: findings.map(row => ({ fieldId: row.fieldId, instruction: row.instruction })) };
describe('pasted setup sample evidence', () => {
  it('accepts deterministic dropdown labels and exact sample quotes', () => { expect(captureSetupFindingIssues(configuration, sample, findings, true)).toEqual([]); });
  it('rejects invented values and hidden manual corrections from model output', () => {
    expect(captureSetupFindingIssues(configuration, sample, findings.map(row => row.id === 'name' ? { ...row, suggestedValue: 'Invented', sampleValue: 'Invented' } : row), false)).toContain('evidence');
    const corrected = findings.map(row => row.id === 'name' ? { ...row, sampleValue: 'Jordan Corrected' } : row);
    expect(captureSetupFindingIssues(configuration, sample, corrected, true)).toContain('correction'); expect(captureSetupFindingIssues(configuration, sample, corrected, true, true)).toEqual([]);
  });
  it('checks rules, required identity/contact fields, mappings and excluded findings independently', () => {
    expect(captureSetupFindingIssues({ ...configuration, rules: { phrases: ['Missing phrase'], location: 'body', mode: 'all' } }, sample, findings, true)).toContain('rules');
    expect(captureSetupFindingIssues({ ...configuration, fields: fields.filter(field => field.id !== 'name') }, sample, findings.filter(row => row.id !== 'name'), true)).toContain('required');
    expect(captureSetupFindingIssues(configuration, sample, [...findings, { ...findings[0], id: 'excluded', fieldId: 'removed', included: false }], true)).toEqual([]);
    expect(captureSetupFindingIssues({ ...configuration, mappings: [] }, sample, findings, true)).toContain('mappings');
  });
  it('binds approval to extraction-relevant config while allowing an independent workflow change', () => {
    expect(captureSetupSampleHash(configuration)).toBe(captureSetupSampleHash({ ...configuration, workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: false } }));
    expect(captureSetupSampleHash(configuration)).not.toBe(captureSetupSampleHash({ ...configuration, contactRequired: false }));
    expect(captureSetupSampleHash(configuration)).not.toBe(captureSetupSampleHash({ ...configuration, connectionId: '00000000-0000-4000-8000-000000000002', accountEmail: 'verified@example.test' }));
  });
});
