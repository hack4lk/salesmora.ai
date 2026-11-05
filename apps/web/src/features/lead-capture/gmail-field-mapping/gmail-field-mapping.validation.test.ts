import { describe, expect, it } from 'vitest';
import { extractGmailMapping as extract, isGmailMappingReviewed as reviewed, mappingConfiguration, validateGmailFieldMapping as validate, type GmailFieldMappingRow, type GmailMappingTarget } from './gmail-field-mapping.validation';
const sample = { id: 'sample', version: 1, subject: 'Quote: plumbing', body: 'Name: Alex\nEMAIL: alex@example.com\nService: Plumbing' };
const row: GmailFieldMappingRow = { id: 'name-map', fieldId: 'name', source: 'label', label: 'Name', included: true };
const targets: GmailMappingTarget[] = [{ id: 'name', key: 'name', label: 'Name', required: true }, { id: 'email', key: 'email', label: 'Email' }];
describe('Gmail field mapping', () => {
  it('extracts literal same-line labels with original evidence and preserves additional colons', () => {
    expect(extract({ ...row, label: ' name: ' }, sample)).toEqual([{ value: 'Alex', evidence: 'Name: Alex' }]);
    expect(extract(row, { ...sample, body: 'Name: Alex: owner' })[0].value).toBe('Alex: owner');
    expect(extract({ ...row, label: 'Name.*' }, sample)).toEqual([]);
  });
  it('retains ambiguous candidates instead of choosing the first', () => {
    expect(extract(row, { ...sample, body: 'Name: Alex\r\nName: Jamie' })).toHaveLength(2);
    expect(validate({ rows: [row] }, targets, { ...sample, body: 'Name: Alex\nName: Jamie' }).some(issue => issue.message.includes('More than one'))).toBe(true);
  });
  it('does not guess missing or multiline values', () => {
    expect(extract(row, { ...sample, body: 'Name:\nAlex' })).toEqual([]);
    expect(extract(row, null)).toEqual([]);
  });
  it('supports explicit whole-subject/body extraction as text', () => {
    expect(extract({ ...row, source: 'subject' }, sample)[0]).toEqual({ value: sample.subject, evidence: sample.subject });
    expect(extract({ ...row, source: 'body' }, sample)[0].evidence).toBe(sample.body);
  });
  it('binds review to sample identity/version and exact configuration', () => {
    const accepted = { ...row, review: { sampleId: sample.id, sampleVersion: sample.version, configuration: mappingConfiguration(row) } };
    expect(reviewed(accepted, sample)).toBe(true);
    expect(reviewed(accepted, { ...sample, version: 2 })).toBe(false);
    expect(reviewed(accepted, { ...sample, id: 'different' })).toBe(false);
    expect(reviewed({ ...accepted, fieldId: 'email' }, sample)).toBe(false);
    expect(reviewed({ ...accepted, included: false }, sample)).toBe(false);
    expect(reviewed(accepted, { ...sample, version: 0 })).toBe(false);
  });
  it('accepts complete reviewed mappings and excludes disabled mappings from requirements', () => {
    const rows = [row, { ...row, id: 'email-map', fieldId: 'email', label: 'Email' }].map(item => ({ ...item, review: { sampleId: sample.id, sampleVersion: sample.version, configuration: mappingConfiguration(item) } }));
    expect(validate({ rows }, targets, sample)).toEqual([]);
    expect(validate({ rows: rows.map(item => ({ ...item, included: false })) }, targets, sample).length).toBeGreaterThan(0);
  });
  it('rejects duplicate targets/identities, invalid email, removed fields and missing required contact', () => {
    const issues = validate({ rows: [row, { ...row, fieldId: 'name' }, { ...row, id: 'bad-email', fieldId: 'email', label: 'Name' }, { ...row, id: 'unknown', fieldId: 'removed' }] }, targets, sample);
    expect(issues.some(issue => issue.message.includes('unique identity'))).toBe(true);
    expect(issues.some(issue => issue.message.includes('only once'))).toBe(true);
    expect(issues.some(issue => issue.message.includes('valid email'))).toBe(true);
    expect(issues.some(issue => issue.message.includes('available lead field'))).toBe(true);
    expect(validate({ rows: [] }, targets, null).length).toBeGreaterThan(0);
  });
  it('validates extraction choices and label limits, leaving email text unexecuted', () => {
    expect(extract(row, { ...sample, body: 'Name: <script>alert(1)</script>' })[0].value).toBe('<script>alert(1)</script>');
    expect(validate({ rows: [{ ...row, label: 'x'.repeat(101) }] }, targets, sample).some(issue => issue.message.includes('100 characters'))).toBe(true);
    expect(validate({ rows: [{ ...row, source: 'regex' as GmailFieldMappingRow['source'] }] }, targets, sample).some(issue => issue.message.includes('supported extraction'))).toBe(true);
  });
});
