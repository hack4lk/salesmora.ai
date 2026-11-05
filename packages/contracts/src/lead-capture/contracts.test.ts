import { describe, expect, it } from 'vitest';
import { captureAnswersSchema, captureAnswerIssues, captureConfigurationSchema, captureCreateDraftSchema, captureDraftConfigurationSchema, captureEvidenceSchema, captureIntakeDecisionSchema, captureKeySchema, captureLaunchIsFuture, captureLaunchSchema, captureLifecycleSchema, captureOperationResultSchema, captureSourceListQuerySchema, captureWorkflowSchema, captureSourceDetailSchema, captureGmailSampleSchema, captureReceiptSchema, captureSourceEventSchema, readPublishedCaptureSourceLimit, workspacePolicySchema, canonicalCaptureResource, type CaptureDraftConfiguration, type CaptureField } from '../index';

const id = '24ab2ee0-5407-430c-ad58-24e883a674ad';
const fields: CaptureField[] = [
  { id: 'name', key: 'name', type: 'short_text', label: 'Name', required: true, options: [] },
  { id: 'email', key: 'email', type: 'email', label: 'Email', required: false, options: [] },
  { id: 'service', key: 'service', type: 'short_text', label: 'Service', required: true, options: [] },
];
const workflow = { assignment: { kind: 'default' }, stage: 'new', tags: ['Kitchen'], notifyAssigned: true };
const website = { schemaVersion: 1, type: 'website', contactRequired: true, fields, workflow, content: { businessName: 'Fixture', title: 'Request service', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } };
const gmail = { schemaVersion: 1, type: 'gmail', fields, contactRequired: true, workflow, connectionId: id, accountEmail: 'fixture@example.test', sampleId: id, rules: { phrases: ['estimate'], location: 'both', mode: 'any' }, mappings: fields.map(field => ({ fieldId: field.id, instruction: 'Use the source value' })) };
const answers = { name: 'Jamie', email: 'jamie@example.test', service: 'Kitchen' };
const decision = { workspaceId: id, intakeId: id, expectedVersion: 1, reviewId: id, requestId: id };
describe('Lead Capture shared contracts', () => {
  it('saves incomplete typed drafts without permitting publication', () => {
    for (const type of ['website', 'gmail']) {
      const configuration = { schemaVersion: 1, type };
      expect(captureCreateDraftSchema.safeParse({ workspaceId: id, requestId: id, name: 'Draft', configuration }).success).toBe(true);
      expect(captureConfigurationSchema.safeParse(configuration).success).toBe(false);
    }
  });
  it('accepts complete website and Gmail snapshots and rejects cross-type/extra properties', () => {
    expect(captureConfigurationSchema.safeParse(website).success).toBe(true); expect(captureConfigurationSchema.safeParse(gmail).success).toBe(true);
    for (const input of [{ ...website, connectionId: id }, { ...gmail, content: website.content }, { ...website, role: 'owner' }, { ...website, schemaVersion: 2 }]) expect(captureDraftConfigurationSchema.safeParse(input).success).toBe(false);
  });
  it.each(['__proto__', 'constructor', 'prototype', 'a/b', 'a b', ''])('rejects unsafe field identities: %s', key => { expect(captureKeySchema.safeParse(key).success).toBe(false); });
  it('rejects duplicate standard/field/choice identities and invalid standard field types', () => {
    for (const next of [[...fields, fields[0]], [...fields, { ...fields[0], id: 'other' }], [{ ...fields[0], type: 'date' }, ...fields.slice(1)]]) expect(captureConfigurationSchema.safeParse({ ...website, fields: next }).success).toBe(false);
    expect(captureConfigurationSchema.safeParse({ ...website, fields: [...fields, { id: 'custom', key: 'custom', label: 'Choice', type: 'dropdown', required: false, options: [{ id: 'one', label: 'One' }, { id: 'one', label: 'Two' }] }] }).success).toBe(false);
  });
  it('enforces required lead fields/contact, content, safe links and Gmail sample/mapping completeness', () => {
    for (const input of [{ ...website, fields: fields.slice(1) }, { ...website, contactRequired: false }, { ...website, content: { ...website.content, title: '' } }, { ...website, content: { ...website.content, privacy: { label: 'Policy', href: 'javascript:alert(1)' } } }, { ...gmail, sampleId: undefined }, { ...gmail, mappings: [] }, { ...gmail, rules: { ...gmail.rules, phrases: [] } }]) expect(captureConfigurationSchema.safeParse(input).success).toBe(false);
  });
  it('normalizes workflow tags and rejects duplicates/unknown assignment modes', () => {
    expect(captureWorkflowSchema.parse({ ...workflow, tags: [' Kitchen '] }).tags).toEqual(['Kitchen']);
    expect(captureWorkflowSchema.safeParse({ ...workflow, tags: ['Kitchen', 'kitchen'] }).success).toBe(false);
    expect(captureWorkflowSchema.safeParse({ ...workflow, assignment: { kind: 'round_robin' } }).success).toBe(false);
  });
  it('checks answer types, contact, lengths, unknown fields and actual calendar dates', () => {
    expect(captureAnswerIssues(fields, answers)).toEqual([]);
    for (const value of [{ ...answers, email: 'bad' }, { ...answers, email: '' }, { ...answers, name: 'x'.repeat(201) }, { ...answers, email: [] }, { ...answers, injected: '' }]) expect(captureAnswerIssues(fields, value).length).toBeGreaterThan(0);
    expect(captureAnswerIssues([...fields, { id: 'choices', key: 'custom', type: 'checkboxes', label: 'Choices', required: false, options: [{ id: 'one', label: 'One' }] }], answers)).toEqual([]);
    const date: CaptureField = { id: 'date', key: 'custom', type: 'date', label: 'Date', required: false, options: [] };
    expect(captureAnswerIssues([...fields, date], { ...answers, date: '2026-02-30' })).toContain('date');
    expect(captureAnswersSchema.safeParse(JSON.parse('{"constructor":"attack"}')).success).toBe(false);
  });
  it('keeps historical choice IDs meaningful when labels or subsequent configuration change', () => {
    const choice: CaptureField = { id: 'timing', key: 'custom', type: 'dropdown', label: 'Timing', required: true, options: [{ id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' }] };
    const old = structuredClone(choice); const changed = { ...choice, options: [{ id: 'later', label: 'Morning' }] };
    expect(captureAnswerIssues([...fields, old], { ...answers, timing: 'morning' })).toEqual([]);
    expect(captureAnswerIssues([...fields, changed], { ...answers, timing: 'morning' })).toContain('timing');
  });
  it('binds consent to its version and verifies source quotes without interpreting markup', () => {
    const evidence = { schemaVersion: 1, type: 'gmail', from: '', subject: '', body: '<img src=x onerror=alert(1)>', fields: [{ fieldId: 'name', uncertain: true, origin: { kind: 'email', location: 'body', quote: '<img src=x onerror=alert(1)>' } }] };
    expect(captureEvidenceSchema.safeParse(evidence).success).toBe(true);
    expect(captureEvidenceSchema.safeParse({ ...evidence, body: 'Different message' }).success).toBe(false);
    expect(captureEvidenceSchema.safeParse({ schemaVersion: 1, type: 'website', answers, fields: [], consent: { id: 'consent', version: 0, wording: 'Agree', accepted: true, privacyHref: null } }).success).toBe(false);
  });
  it('keeps lifecycle/source/configuration versions and absolute schedule boundaries separate', () => {
    const input = { workspaceId: id, sourceId: id, expectedVersion: 3, configurationVersion: 2, draftVersion: 4, requestId: id, timing: { kind: 'scheduled', at: '2026-11-01T12:00:00Z', timezone: 'America/New_York' } };
    const parsed = captureLaunchSchema.parse(input); expect(captureLaunchIsFuture(parsed, new Date('2026-11-01T11:00:00Z'))).toBe(true); expect(captureLaunchIsFuture(parsed, new Date('2026-11-01T12:00:00Z'))).toBe(false);
    expect(captureLaunchSchema.safeParse({ ...input, timing: { ...input.timing, timezone: 'unknown' } }).success).toBe(false);
    expect(captureLifecycleSchema.safeParse({ workspaceId: id, sourceId: id, expectedVersion: 1, requestId: id, action: 'duplicate' }).success).toBe(false);
    expect(captureSourceListQuerySchema.safeParse({ workspaceId: id, pageSize: 100000 }).success).toBe(false);
  });
  it('does not accept client-proposed field values in link/dismiss requests or omit review identity', () => {
    expect(captureIntakeDecisionSchema.safeParse({ ...decision, kind: 'dismiss' }).success).toBe(true);
    expect(captureIntakeDecisionSchema.safeParse({ ...decision, kind: 'create', definitionVersion: 1, workflowVersion: 1, answers }).success).toBe(true);
    const link = { ...decision, kind: 'link', leadId: id, expectedLeadVersion: 3, changeIds: ['phone'] };
    expect(captureIntakeDecisionSchema.safeParse(link).success).toBe(true);
    for (const input of [{ ...link, values: { phone: 'forged' } }, { ...link, changeIds: ['phone', 'phone'] }, { ...decision, kind: 'dismiss', answers }, { ...link, reviewId: undefined }]) expect(captureIntakeDecisionSchema.safeParse(input).success).toBe(false);
    expect(captureOperationResultSchema.safeParse({ kind: 'intake', intakeId: id, intakeVersion: 2, outcome: 'create', leadId: null }).success).toBe(false);
  });
  it('allows restoring a draft but requires an approved configuration for resume', () => {
    const base = { workspaceId: id, sourceId: id, expectedVersion: 1, requestId: id, configuration: { kind: 'draft', version: 2 } };
    expect(captureLifecycleSchema.safeParse({ ...base, action: 'restore' }).success).toBe(true);
    expect(captureLifecycleSchema.safeParse({ ...base, action: 'resume' }).success).toBe(false);
    expect(captureLifecycleSchema.safeParse({ ...base, action: 'duplicate', copyName: 'Copy' }).success).toBe(true);
  });
  it('binds detail projections to the exact approved and draft versions and source type', () => {
    const source = { id, workspaceId: id, version: 3, name: 'Source', type: 'website', status: 'active', block: 'none', approvedVersion: 1, draftVersion: 2, lastActivityAt: null, scheduledAt: null, timezone: null, metrics: { captured: 0, awaitingReview: 0, approved: 0 } };
    const detail = { source, approved: { version: 1, definitionVersion: 1, workflowVersion: 1, configuration: website }, draft: { id, version: 2, baseApprovedVersion: 1, configuration: { schemaVersion: 1, type: 'website' } } };
    expect(captureSourceDetailSchema.safeParse(detail).success).toBe(true);
    expect(captureSourceDetailSchema.safeParse({ ...detail, approved: { ...detail.approved, version: 2 } }).success).toBe(false);
    expect(captureSourceDetailSchema.safeParse({ ...detail, draft: { ...detail.draft, configuration: { schemaVersion: 1, type: 'gmail' } } }).success).toBe(false);
  });
  it('rejects sample/receipt source mismatches and prevents customer evidence leaking into source events', () => {
    const evidence = { schemaVersion: 1, type: 'website', answers: {}, consent: null, fields: [] };
    expect(captureGmailSampleSchema.safeParse({ id, workspaceId: id, sourceId: id, draftId: id, draftVersion: 1, connectionId: id, accountEmail: 'fixture@example.test', bindingHash: 'a'.repeat(64), evidence, answers: {}, reviewedBy: null, reviewedAt: null }).success).toBe(false);
    expect(captureReceiptSchema.safeParse({ id, workspaceId: id, sourceId: id, type: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, inputHash: 'a'.repeat(64), connectionId: id, messageId: 'message', admission: 'review', evidence, originalAnswers: {}, receivedAt: '2026-10-31T12:00:00Z' }).success).toBe(false);
    expect(captureSourceEventSchema.safeParse({ workspaceId: id, sourceId: id, kind: 'receipt.accepted', actor: { kind: 'service', service: 'website' }, data: { sourceVersion: 1, body: 'Sensitive source message' } }).success).toBe(false);
  });
  it('maps legacy inputs at deliberate read boundaries without broadening or guessing limits', () => {
    expect(canonicalCaptureResource('campaign')).toBe('capture_source');
    expect(workspacePolicySchema.parse({ workspaceId: id, revision: 0, grants: [{ role: 'office', permission: 'campaigns.pause', scope: 'workspace' }] }).grants[0].permission).toBe('leadCapture.pause');
    expect(readPublishedCaptureSourceLimit({ publishedCampaigns: 5 })).toBe(5); expect(readPublishedCaptureSourceLimit({ publishedCaptureSources: null })).toBe(null);
    expect(() => readPublishedCaptureSourceLimit({ publishedCaptureSources: 5, publishedCampaigns: 1 })).toThrow(); expect(() => readPublishedCaptureSourceLimit({})).toThrow();
  });
});
export const captureContractFixture = website as CaptureDraftConfiguration;
