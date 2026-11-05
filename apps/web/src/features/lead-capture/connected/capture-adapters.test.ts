import { gmailSetupApprovalKey } from '../gmail-setup-page/gmail-setup-page.validation';
import { describe, expect, it } from 'vitest';
import { captureDraftConfigurationSchema, type CaptureDetailView, type CaptureDraftConfiguration } from '@salesmora/contracts';
import { captureInitialConfiguration, websiteConfiguration, websiteDraftFrom, gmailConfiguration, gmailDraftFrom, gmailDraftDirty } from './capture-adapters';
const business = { businessName: 'Actual business', businessEmail: '', businessPhone: '555-0100', services: ['Plumbing'], serviceArea: '10013', timezone: 'America/New_York', gmailAccess: 'available' as const, teammates: [] };
function view(configuration: CaptureDraftConfiguration): CaptureDetailView {
  return { canEdit: true, policyRevision: 1, business, detail: { source: { id: '00000000-0000-4000-8000-000000000001', workspaceId: '00000000-0000-4000-8000-000000000002', name: 'Source', type: configuration.type, status: 'draft', block: 'none', version: 1, draftVersion: 1, approvedVersion: null, scheduledAt: null, timezone: null, lastActivityAt: null, metrics: { captured: 0, approved: 0, awaitingReview: 0 } }, approved: null, draft: { id: '00000000-0000-4000-8000-000000000003', version: 1, baseApprovedVersion: null, configuration } } };
}
describe('live capture adapters', () => {
  it('uses business context and valid defaults without invented public contacts or connections', () => {
    for (const type of ['website', 'gmail'] as const) expect(captureDraftConfigurationSchema.safeParse(captureInitialConfiguration(type, business)).success).toBe(true);
    expect(captureInitialConfiguration('website', business)).toMatchObject({ content: { businessName: business.businessName, businessEmail: '', businessPhone: business.businessPhone } });
    expect(captureInitialConfiguration('gmail', business)).not.toHaveProperty('connectionId');
  });
  it('preserves saved privacy, consent, submit and thank-you text while editing the displayed form', () => {
    const initial = captureInitialConfiguration('website', business); if (initial.type !== 'website') throw Error();
    initial.content = { ...initial.content, privacy: { label: 'Privacy', href: 'https://example.test/privacy' }, consent: { id: 'consent', version: 2, label: 'Contact me', required: true }, thankYou: 'Custom thanks', submitLabel: 'Request service' };
    const draft = websiteDraftFrom(view(initial)); draft.content.title = 'Changed title';
    const saved = websiteConfiguration(draft, initial, business); expect(saved).toMatchObject({ content: { ...initial.content, title: 'Changed title' } });
    expect(captureDraftConfigurationSchema.safeParse(saved).success).toBe(true);
  });
  it('retains canonical Gmail references and stable rule values without fabricating samples', () => {
    const initial = captureInitialConfiguration('gmail', business); if (initial.type !== 'gmail') throw Error(); initial.connectionId = '00000000-0000-4000-8000-000000000004'; initial.rules = { phrases: ['quote'], location: 'subject', mode: 'any' };
    const draft = gmailDraftFrom(view(initial)); expect(draft.sample).toBeNull(); expect(gmailConfiguration(draft, initial)).toEqual({ ...initial, contactRequired: true });
  });
  it('restores approved pasted evidence without reporting unsaved changes and detects later corrections', () => {
    const config: CaptureDraftConfiguration = { schemaVersion: 1, type: 'gmail', contactRequired: true, mappings: [], sampleId: '00000000-0000-4000-8000-000000000004' };
    const baseline = gmailDraftFrom(view(config));
    const hydrated = { ...baseline, sample: { id: '00000000-0000-4000-8000-000000000005', version: 1, subject: 'Repair', body: 'Fictional sample' }, example: { subject: 'Repair', body: 'Fictional sample' } };
    hydrated.approvedKey = gmailSetupApprovalKey(hydrated);
    expect(gmailDraftDirty(hydrated, baseline, config)).toBe(false);
    expect(gmailDraftDirty({ ...hydrated, example: { ...hydrated.example, body: 'Changed' } }, baseline, config)).toBe(true);
    expect(gmailDraftDirty({ ...hydrated, approvedSampleId: '00000000-0000-4000-8000-000000000006' }, baseline, config)).toBe(true);
  });
  it('keeps website fields out of a switch to Gmail', () => {
    const previous = captureInitialConfiguration('website', business), draft = gmailDraftFrom(view(previous));
    const saved = gmailConfiguration(draft, previous); expect(saved.type).toBe('gmail'); expect(saved).not.toHaveProperty('content'); expect(saved).not.toHaveProperty('fields');
  });
});
