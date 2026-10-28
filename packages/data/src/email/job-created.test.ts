import { describe, expect, it } from 'vitest';
import { renderJobCreatedEmail, type JobCreatedEmailInput } from './job-created';
import { jobCreatedEmailData as copy } from './job-created.data';
const input: JobCreatedEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace, actorName: copy.stories.actor,
  job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle },
};
describe('Job created email boundary', () => {
  it('renders the minimal Job projection and workspace-scoped links using only the app origin', () => {
    const email = renderJobCreatedEmail({ ...input, baseURL: input.baseURL + '/ignored?query=ignored' });
    for (const content of [copy.heading, input.workspaceName, input.actorName, input.job.number, input.job.title, copy.reason]) expect(email.text).toContain(content);
    expect(email.html).toContain(`/jobs/${input.job.id}?workspace=${input.workspaceId}`);
    expect(email.html).toContain(`/settings/notifications?workspace=${input.workspaceId}`);
    expect(email.html).not.toContain('/ignored');
    expect(email.html).not.toContain('/leads/');
    expect(email.html).not.toContain('/estimates/');
    expect(email.html).toContain(copy.logoCid);
  });
  it('escapes dynamic HTML and strips subject header injection', () => {
    const email = renderJobCreatedEmail({ ...input, workspaceName: copy.stories.escapedWorkspace + '\r\nInjected: header', actorName: copy.stories.escapedActor, job: { ...input.job, title: copy.stories.escapedTitle } });
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.html).not.toContain('<script>');
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('&lt;img');
    expect(email.html).toContain('&lt;Rivera&gt;');
  });
  it('rejects unsafe origins, malformed identities and invalid Job content', () => {
    for (const baseURL of ['javascript:alert(1)', 'https://user:password@app.example.test']) expect(() => renderJobCreatedEmail({ ...input, baseURL })).toThrow();
    expect(() => renderJobCreatedEmail({ ...input, workspaceId: '../hidden' })).toThrow();
    expect(() => renderJobCreatedEmail({ ...input, job: { ...input.job, id: '../other?workspace=hidden' } })).toThrow();
    for (const job of [{ ...input.job, number: 'WO-42' }, { ...input.job, title: ' ' }, { ...input.job, title: 'x'.repeat(201) }]) expect(() => renderJobCreatedEmail({ ...input, job })).toThrow();
  });
  it('supports a removed creator without exposing other source records', () => {
    const email = renderJobCreatedEmail({ ...input, actorName: '' });
    expect(email.text).toContain(copy.teammate);
    expect(email.html).toContain(copy.teammate);
  });
});
