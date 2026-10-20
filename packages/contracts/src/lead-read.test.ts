import { describe, expect, it } from 'vitest';
import { leadListQuerySchema, leadArchiveSchema, deleteLeadSchema, moveLeadStageSchema, addLeadNoteSchema, updateLeadSchema } from './lead-read';
import { leadQueryFromURL, leadQueryToURL } from './lead-url';
const workspaceId = '24ab2ee0-5407-430c-ad58-24e883a674ad';
describe('lead read query boundary', () => {
  it('ignores invalid URL values and uses Pipeline/newest/25 defaults', () => {
    const query = leadQueryFromURL(workspaceId, new URLSearchParams('view=bad&page=-3&rows=999&sort=password&dir=drop&stage=bad&created=custom&from=2026-02-31&to=2026-03-01'));
    expect(query).toMatchObject({ view: 'pipeline', page: 1, pageSize: 25, sort: 'created', direction: 'desc', stages: [], created: 'any' });
  });
  it('round-trips multi-filter, date, pagination and view state without duplicating values', () => {
    const params = new URLSearchParams('view=list&stage=new&stage=won&stage=new&source=website&owner=me&attention=true&archived=true&created=custom&from=2026-10-01&to=2026-10-15&page=2&rows=50&sort=stage&dir=asc&q=willow');
    const query = leadQueryFromURL(workspaceId, params);
    expect(query.stages).toEqual(['new', 'won']); expect(leadQueryFromURL(workspaceId, leadQueryToURL(query))).toEqual(query);
  });
  it('rejects forged repository scope, SQL sort values and unordered date ranges', () => {
    for (const extra of [{ scope: 'workspace' }, { sort: 'name; DROP TABLE leads' }, { created: 'custom', from: '2026-10-15', to: '2026-10-01' }, { pageSize: 1000 }]) expect(leadListQuerySchema.safeParse({ workspaceId, ...extra }).success).toBe(false);
  });
});

describe('lead stage write boundary', () => {
  const input = { workspaceId, leadId: workspaceId, submissionId: workspaceId, expectedVersion: 1, to: 'contacted' };
  it('rejects forged authority, invalid stages, stale-format versions and inappropriate reasons', () => {
    for (const extra of [{ actorId: 'owner' }, { role: 'owner' }, { to: 'in-progress' }, { expectedVersion: 0 }, { expectedVersion: '1' }, { reason: 'Not Lost' }, { to: 'lost', reason: 'x'.repeat(501) }]) expect(moveLeadStageSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  });
  it('accepts and trims an optional Lost reason', () => {
    expect(moveLeadStageSchema.parse({ ...input, to: 'lost', reason: '  Timing changed.  ' }).reason).toBe('Timing changed.');
    expect(moveLeadStageSchema.safeParse({ ...input, to: 'lost' }).success).toBe(true);
  });
});

describe('team note boundary', () => {
  const input = { workspaceId, leadId: workspaceId, submissionId: workspaceId, body: 'Context for the team.' };
  it('rejects empty, oversized and forged actor/role payloads', () => {
    for (const extra of [{ body: '  ' }, { body: 'x'.repeat(2001) }, { actorId: 'owner' }, { role: 'owner' }, { createdAt: '2026-10-15' }, { workspaceId: 'invalid' }]) expect(addLeadNoteSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  });
  it('trims the outer whitespace and preserves plain text and line breaks', () => {
    expect(addLeadNoteSchema.parse({ ...input, body: '  <script>text</script>\nNext line.  ' }).body).toBe('<script>text</script>\nNext line.');
  });
});

describe('lead edit boundary', () => {
  const input = { workspaceId, leadId: workspaceId, expectedVersion: 1, submissionId: workspaceId, values: { name: 'Example', email: '', phone: '', service: 'Repair', address: '', details: '', notes: '', source: 'website' } };
  it('rejects forged authority/protected fields, invalid versions and invalid content', () => {
    for (const field of ['stage', 'ownerId', 'workspaceId', 'createdBy', 'archivedAt', 'version', 'origin']) expect(updateLeadSchema.safeParse({ ...input, values: { ...input.values, [field]: 'forged' } }).success).toBe(false);
    for (const extra of [{ expectedVersion: 0 }, { actorId: 'owner' }, { role: 'owner' }, { values: { ...input.values, name: ' ' } }, { values: { ...input.values, email: 'invalid' } }, { values: { ...input.values, details: 'x'.repeat(10001) } }]) expect(updateLeadSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  });
  it('normalizes editable text/email and permits omission of protected source', () => {
    const values = Object.fromEntries(Object.entries(input.values).filter(([field]) => field !== 'source'));
    expect(updateLeadSchema.parse({ ...input, values: { ...values, name: ' Example ', email: 'HELLO@EXAMPLE.TEST' } }).values).toMatchObject({ name: 'Example', email: 'hello@example.test' });
  });
});

describe('lead archive write boundary',()=>{
  it('requires scoped identity, version and retry ID; rejects protected archive metadata',()=>{
    const input={workspaceId,leadId:workspaceId,submissionId:workspaceId,expectedVersion:1};
    expect(leadArchiveSchema.parse(input)).toEqual(input);
    for(const extra of [{archivedBy:'forged'},{archivedAt:'2026-01-01'},{actorId:'other'},{expectedVersion:0},{workspaceId:'other'},{submissionId:''}])expect(leadArchiveSchema.safeParse({...input,...extra}).success).toBe(false);
  });
});

describe('permanent lead deletion boundary', () => {
  it('requires exact text and rejects protected fields and invalid retry/version data', () => {
    const input = { workspaceId, leadId: workspaceId, submissionId: workspaceId, expectedVersion: 1, typedConfirmation: 'LD-0001' };
    expect(deleteLeadSchema.parse(input)).toEqual(input);
    expect(deleteLeadSchema.parse({ ...input, typedConfirmation: ' LD-0001 ' }).typedConfirmation).toBe(' LD-0001 ');
    for (const extra of [{ actorId: 'owner' }, { role: 'owner' }, { deleted: true }, { expectedVersion: 0 }, { submissionId: '' }, { typedConfirmation: '' }]) expect(deleteLeadSchema.safeParse({ ...input, ...extra }).success).toBe(false);
  });
});
