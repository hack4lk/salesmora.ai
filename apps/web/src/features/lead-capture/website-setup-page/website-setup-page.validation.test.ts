import { describe, expect, it } from 'vitest';
import { websiteSetupIssue as issue, websiteSetupSave as snapshot, type WebsiteSetupDraft } from './website-setup-page.validation';
const draft: WebsiteSetupDraft = { selection: { name: ' Website ', source: 'website' }, brief: 'Kitchen requests', content: { title: 'Request details', intro: '', unavailableMessage: '', showBusinessEmail: false, showBusinessPhone: true }, form: { contactRequired: true, fields: [{ id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }] }, workflow: { assignment: 'default', teammateId: '', stage: 'new', tagsText: '', notifyAssigned: true } };
describe('website setup composition', () => {
  it('validates each section and all requirements before final review', () => {
    expect(issue(draft, 'all', [])).toBe(null); expect(issue({ ...draft, brief: '' }, 'all', [])).toBe('briefError'); expect(issue({ ...draft, content: { ...draft.content, title: '' } }, 'all', [])).toBe('contentError'); expect(issue({ ...draft, form: { ...draft.form, fields: [] } }, 'all', [])).toBe('fieldsError');
    expect(issue({ ...draft, workflow: { ...draft.workflow, assignment: 'teammate', teammateId: 'unknown' } }, 'all', [])).toBe('workflowError');
  });
  it('binds source/draft identity and returns an isolated snapshot', () => {
    const request = snapshot('draft', 2, draft)!; expect(request.selection.name).toBe('Website'); expect(request.expectedVersion).toBe(2);
    request.website!.content.title = 'Changed'; expect(draft.content.title).toBe('Request details'); expect(snapshot('draft', 0, draft)).toBe(null); expect(snapshot('', 1, draft)).toBe(null);
  });
  it('never carries website settings into Gmail setup', () => { expect(issue({ ...draft, selection: { name: 'Gmail', source: 'gmail' } }, 'all', [])).toBe('sourceError'); expect(snapshot('draft', 1, { ...draft, selection: { name: 'Gmail', source: 'gmail' } })).toEqual({ draftId: 'draft', expectedVersion: 1, selection: { name: 'Gmail', source: 'gmail' } }); });
});
