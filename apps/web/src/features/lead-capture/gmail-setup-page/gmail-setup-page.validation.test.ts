import { describe, expect, it } from 'vitest';
import { gmailExtractionBound, gmailSetupApprovalKey, gmailSetupIssue, gmailSetupSave, type GmailSetupDraft } from './gmail-setup-page.validation';
const draft: GmailSetupDraft = {
  selection: { name: ' Gmail ', source: 'gmail' }, account: { accountId: 'account' }, rules: { location: 'body', mode: 'all', phrases: [{ id: 'rule', text: 'Estimate' }] },
  example: { subject: '', body: 'Estimate\nName: Jamie\nEmail: jamie@example.com' }, sample: { id: 'sample', version: 1, subject: '', body: 'Estimate\nName: Jamie\nEmail: jamie@example.com' },
  targets: [{ id: 'name', key: 'name', label: 'Name', required: true }, { id: 'email', key: 'email', label: 'Email' }],
  findings: { sampleId: 'sample', sampleVersion: 1, findings: [ ['name', 'Jamie'], ['email', 'jamie@example.com'] ].map(([key, text]) => ({ id: key, fieldId: key, included: true, required: key === 'name', sampleValue: text, suggestedValue: text, instruction: `Find ${key}`, confidence: 'found', evidence: { source: 'body', text: `${key === 'name' ? 'Name' : 'Email'}: ${text}` } })) },
  approvedKey: null, workflow: { assignment: 'default', teammateId: '', stage: 'new', tagsText: '', notifyAssigned: true },
};
const accounts = [{ id: 'account', email: 'business@example.com', status: 'connected' }] as const;
const approved = { ...draft, approvedKey: gmailSetupApprovalKey(draft) };
describe('Gmail setup composition', () => {
  it('binds extraction to the exact email and sample revision', () => {
    const result = { sample: draft.sample!, value: draft.findings };
    expect(gmailExtractionBound(result, draft.example)).toBe(true);
    expect(gmailExtractionBound(result, { ...draft.example, body: 'Other' })).toBe(false);
    expect(gmailExtractionBound({ ...result, value: { ...result.value, sampleVersion: 2 } }, draft.example)).toBe(false);
  });
  it('requires connected access, matching rules and explicit approval before review', () => {
    expect(gmailSetupIssue(approved, 'all', accounts, [])).toBe(null);
    expect(gmailSetupIssue(draft, 'all', accounts, [])).toBe('fields');
    expect(gmailSetupIssue(approved, 'all', accounts, [], false)).toBe('access');
    expect(gmailSetupIssue(approved, 'all', [{ ...accounts[0], status: 'reconnect-required' }], [])).toBe('account');
    const changed = { ...approved, rules: { ...draft.rules, phrases: [{ id: 'rule', text: 'Absent' }] } };
    expect(gmailSetupIssue({ ...changed, approvedKey: gmailSetupApprovalKey(changed) }, 'all', accounts, [])).toBe('fields');
  });
  it('invalidates approval for account, rules, sample, findings and target edits, while retaining workflow edits', () => {
    for (const patch of [{ account: { accountId: 'other' } }, { rules: { ...draft.rules, mode: 'any' as const } }, { example: { ...draft.example, body: 'Changed' } }, { sample: { ...draft.sample!, version: 2 } }, { findings: { ...draft.findings, findings: [] } }, { targets: [] }]) expect(gmailSetupApprovalKey({ ...approved, ...patch })).not.toBe(approved.approvedKey);
    expect(gmailSetupApprovalKey({ ...approved, workflow: { ...draft.workflow, tagsText: 'Gmail' } })).toBe(approved.approvedKey);
  });
  it('saves isolated versioned snapshots and excludes Gmail settings on website handoff', () => {
    const request = gmailSetupSave('draft', 2, draft)!; expect(request.selection.name).toBe('Gmail'); expect(request.expectedVersion).toBe(2);
    request.gmail!.example.body = 'Changed'; expect(draft.example.body).toContain('Jamie');
    expect(gmailSetupSave('draft', 0, draft)).toBe(null);
    expect(gmailSetupSave('draft', 2, { ...draft, selection: { name: 'Website', source: 'website' } })).toEqual({ draftId: 'draft', expectedVersion: 2, selection: { name: 'Website', source: 'website' } });
  });
});
