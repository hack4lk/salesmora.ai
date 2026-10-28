import { describe, expect, it } from 'vitest';
import { renderJobAssignmentChangedEmail, type JobAssignmentChangedEmailInput } from './job-assignment-changed';
import { jobAssignmentChangedEmailData as copy } from './job-assignment-changed.data';
const input: JobAssignmentChangedEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace, actorName: copy.stories.actor,
  access: 'current', change: 'primary', job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle },
};
describe('Job assignment email boundary', () => {
  it('renders authorized assignment changes and only origin-rooted workspace-scoped links', () => {
    for (const change of ['primary', 'team', 'updated', 'removed'] as const) {
      const email = renderJobAssignmentChangedEmail({ ...input, change, baseURL: input.baseURL + '/ignored?query=ignored' });
      expect(email.subject).toContain(copy.headings[change]); expect(email.text).toContain(copy.updates[change]);
      expect(email.html).toContain('/jobs/' + copy.stories.jobId + '?workspace=' + input.workspaceId);
      expect(email.html).not.toContain('/ignored');
    }
  });
  it('removes Job title, ID, actor and Job links from the final lost-access notice', () => {
    const email = renderJobAssignmentChangedEmail({ ...input, access: 'ended', change: 'removed', job: { number: input.job.number } });
    for (const content of [copy.stories.jobTitle, copy.stories.jobId, copy.stories.actor, '/jobs/']) {
      expect(email.html).not.toContain(content); expect(email.text).not.toContain(content);
    }
    expect(email.text).toContain(input.workspaceName); expect(email.text).toContain(input.job.number);
    expect(email.html).toContain('/home?workspace=' + input.workspaceId); expect(email.text).toContain(copy.endedReason);
    expect(email.html).not.toContain(copy.updatedBy);
  });
  it('rejects additional Job details and non-removal changes in lost-access projections', () => {
    expect(() => renderJobAssignmentChangedEmail({ ...input, access: 'ended', change: 'removed' } as JobAssignmentChangedEmailInput)).toThrow();
    expect(() => renderJobAssignmentChangedEmail({ ...input, access: 'ended', change: 'primary', job: { number: input.job.number } } as unknown as JobAssignmentChangedEmailInput)).toThrow();
    expect(() => renderJobAssignmentChangedEmail({ ...input, access: 'invalid' } as unknown as JobAssignmentChangedEmailInput)).toThrow();
  });
  it('escapes HTML, strips subject newlines and supports a missing actor', () => {
    const email = renderJobAssignmentChangedEmail({ ...input, workspaceName: copy.stories.escapedWorkspace + '\r\nInjected: header', actorName: copy.stories.escapedActor,
      job: { ...input.job, title: copy.stories.escapedTitle } });
    expect(email.subject).not.toMatch(/[\r\n]/); expect(email.html).not.toContain('<script>'); expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;script&gt;'); expect(email.html).toContain('&lt;Rivera&gt;');
    expect(renderJobAssignmentChangedEmail({ ...input, actorName: '' }).text).toContain(copy.teammate);
  });
  it('rejects malformed identities, Job content and unsafe origins', () => {
    for (const baseURL of ['javascript:alert(1)', 'https://user:password@app.example.test']) expect(() => renderJobAssignmentChangedEmail({ ...input, baseURL })).toThrow();
    expect(() => renderJobAssignmentChangedEmail({ ...input, workspaceId: '../hidden' })).toThrow();
    expect(() => renderJobAssignmentChangedEmail({ ...input, job: { ...input.job, id: '../other?workspace=hidden' } })).toThrow();
    for (const job of [{ ...input.job, number: 'WO-42' }, { ...input.job, title: ' ' }, { ...input.job, title: 'x'.repeat(201) }]) expect(() => renderJobAssignmentChangedEmail({ ...input, job })).toThrow();
  });
});
