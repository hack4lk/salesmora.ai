import { describe, expect, it } from 'vitest';
import { renderJobDeadlineChangedEmail, type JobDeadlineChangedEmailInput } from './job-deadline-changed';
import { jobDeadlineChangedEmailData as copy } from './job-deadline-changed.data';
const input: JobDeadlineChangedEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace, actorName: copy.stories.actor,
  job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle },
  before: copy.stories.before, after: copy.stories.after, timezone: copy.stories.timezone,
};
describe('Job completion-deadline email boundary', () => {
  it('shows the before/after workspace-local dates and only scoped Job/preferences links', () => {
    const email = renderJobDeadlineChangedEmail({ ...input, baseURL: input.baseURL + '/ignored?query=ignored' });
    for (const value of [input.job.title, input.job.number, input.actorName, input.timezone, 'Oct 30, 2026', 'Nov 6, 2026', copy.before, copy.after, copy.explanation]) {
      expect(email.html).toContain(value); expect(email.text).toContain(value);
    }
    expect(email.html).toContain(`/jobs/${input.job.id}?workspace=${input.workspaceId}`);
    expect(email.html).toContain(`/settings/notifications?workspace=${input.workspaceId}`);
    expect(email.html).not.toContain('/ignored'); expect(email.html).not.toContain('/customers/');
    expect(email.html).not.toContain('/leads/'); expect(email.html).not.toContain('/estimates/');
    expect(email.html).toContain(copy.logoCid);
  });
  it('distinguishes added, changed, earlier and removed deadlines with an explicit unset value', () => {
    for (const [before, after, event] of [[null, input.after, 'added'], [input.before, input.after, 'changed'], [input.before, copy.stories.earlier, 'changed'], [input.before, null, 'removed']] as const) {
      const email = renderJobDeadlineChangedEmail({ ...input, before, after });
      expect(email.subject).toContain(copy.headings[event]); expect(email.text).toContain(copy.headings[event]);
      if (before === null || after === null) { expect(email.html).toContain(copy.notSet); expect(email.text).toContain(copy.notSet); }
    }
  });
  it('preserves calendar dates across UTC offsets, leap days, year changes and DST boundaries', () => {
    for (const timezone of ['America/Los_Angeles', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'America/New_York']) {
      const email = renderJobDeadlineChangedEmail({ ...input, before: '2028-02-29', after: '2029-01-01', timezone });
      expect(email.text).toContain('Feb 29, 2028'); expect(email.text).toContain('Jan 1, 2029');
      const dst = renderJobDeadlineChangedEmail({ ...input, before: '2026-03-08', after: '2026-11-01', timezone });
      expect(dst.text).toContain('Mar 8, 2026'); expect(dst.text).toContain('Nov 1, 2026');
    }
  });
  it('rejects invalid dates, identical/unset-to-unset changes and invalid timezones', () => {
    for (const [before, after] of [[null, null], [input.before, input.before], ['2026-02-29', input.after], [input.before, '2026-02-30'], [input.before, '2026-11-06T00:00:00Z'], ['', input.after], ['2026-13-01', input.after]] as const)
      expect(() => renderJobDeadlineChangedEmail({ ...input, before, after })).toThrow();
    for (const timezone of ['Mars/Olympus', '']) expect(() => renderJobDeadlineChangedEmail({ ...input, timezone })).toThrow();
  });
  it('escapes HTML and strips subject newlines while keeping dynamic content readable in text', () => {
    const email = renderJobDeadlineChangedEmail({ ...input, workspaceName: copy.stories.escapedWorkspace + '\r\nInjected: header', actorName: copy.stories.escapedActor, job: { ...input.job, title: copy.stories.escapedTitle } });
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.html).not.toContain('<script>'); expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;script&gt;'); expect(email.html).toContain('&lt;img'); expect(email.html).toContain('&lt;Rivera&gt;');
    expect(email.text).toContain(copy.stories.escapedActor);
  });
  it('rejects unsafe links and invalid Job identities/content, and uses the missing-actor fallback', () => {
    for (const baseURL of ['javascript:alert(1)', 'https://user:password@app.example.test']) expect(() => renderJobDeadlineChangedEmail({ ...input, baseURL })).toThrow();
    expect(() => renderJobDeadlineChangedEmail({ ...input, workspaceId: '../hidden' })).toThrow();
    for (const job of [{ ...input.job, id: '../other?workspace=hidden' }, { ...input.job, number: 'WO-42' }, { ...input.job, title: ' ' }, { ...input.job, title: 'x'.repeat(201) }]) expect(() => renderJobDeadlineChangedEmail({ ...input, job })).toThrow();
    expect(renderJobDeadlineChangedEmail({ ...input, actorName: '' }).text).toContain(copy.teammate);
  });
});
