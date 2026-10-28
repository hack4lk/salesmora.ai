import { describe, expect, it } from 'vitest';
import { renderJobStatusChangedEmail, type JobStatusChangedEmailInput } from './job-status-changed';
import { jobStatusChangedEmailData as copy } from './job-status-changed.data';
const input: JobStatusChangedEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace, actorName: copy.stories.actor,
  job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle }, before: 'scheduled', after: 'in-progress',
};
describe('Job status-change email boundary', () => {
  it('renders the recorded before/after change and minimal scoped links in HTML and text', () => {
    const email = renderJobStatusChangedEmail({ ...input, baseURL: input.baseURL + '/ignored?query=ignored' });
    for (const text of [input.job.title, input.job.number, input.actorName, copy.statusLabels.scheduled, copy.statusLabels['in-progress'], copy.before, copy.after]) {
      expect(email.text).toContain(text); expect(email.html).toContain(text);
    }
    expect(email.html).toContain(`/jobs/${input.job.id}?workspace=${input.workspaceId}`);
    expect(email.html).toContain(`/settings/notifications?workspace=${input.workspaceId}`);
    expect(email.html).not.toContain('/ignored');
    expect(email.html).not.toContain('/leads/');
    expect(email.html).not.toContain('/estimates/');
    expect(email.html).toContain(copy.logoCid);
  });
  it('distinguishes completion, cancellation and reopening from ordinary status changes', () => {
    for (const [before, after, event] of [
      ['scheduled', 'in-progress', 'changed'], ['in-progress', 'waiting', 'changed'],
      ['in-progress', 'completed', 'completed'], ['scheduled', 'canceled', 'canceled'],
      ['completed', 'needs-scheduling', 'reopened'], ['canceled', 'scheduled', 'reopened'],
    ] as const) {
      const email = renderJobStatusChangedEmail({ ...input, before, after });
      expect(email.subject).toContain(copy.headings[event]);
      expect(email.text).toContain(copy.headings[event]);
      expect(email.html).toContain(copy.statusLabels[before]); expect(email.html).toContain(copy.statusLabels[after]);
    }
  });
  it('escapes dynamic HTML and strips subject header injection', () => {
    const email = renderJobStatusChangedEmail({ ...input, workspaceName: copy.stories.escapedWorkspace + '\r\nInjected: header', actorName: copy.stories.escapedActor, job: { ...input.job, title: copy.stories.escapedTitle } });
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.html).not.toContain('<script>'); expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;script&gt;'); expect(email.html).toContain('&lt;img'); expect(email.html).toContain('&lt;Rivera&gt;');
  });
  it('rejects malformed/no-op/closed-to-closed status changes, unsafe links and invalid Job identities', () => {
    for (const [before, after] of [['scheduled', 'scheduled'], ['completed', 'canceled'], ['canceled', 'completed'], ['unknown', 'scheduled']] as const)
      expect(() => renderJobStatusChangedEmail({ ...input, before: before as JobStatusChangedEmailInput['before'], after })).toThrow();
    for (const baseURL of ['javascript:alert(1)', 'https://user:password@app.example.test'])
      expect(() => renderJobStatusChangedEmail({ ...input, baseURL })).toThrow();
    expect(() => renderJobStatusChangedEmail({ ...input, workspaceId: '../hidden' })).toThrow();
    expect(() => renderJobStatusChangedEmail({ ...input, job: { ...input.job, id: '../other?workspace=hidden' } })).toThrow();
    for (const job of [{ ...input.job, number: 'WO-42' }, { ...input.job, title: ' ' }, { ...input.job, title: 'x'.repeat(201) }])
      expect(() => renderJobStatusChangedEmail({ ...input, job })).toThrow();
  });
  it('uses a teammate fallback when the actor is no longer available', () => {
    const email = renderJobStatusChangedEmail({ ...input, actorName: '' });
    expect(email.text).toContain(copy.teammate); expect(email.html).toContain(copy.teammate);
  });
});
