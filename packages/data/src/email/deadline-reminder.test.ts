import { describe, expect, it } from 'vitest';
import { renderDeadlineReminderEmail, type DeadlineReminderEmailInput } from './deadline-reminder';
import { deadlineReminderEmailData as copy } from './deadline-reminder.data';

const input: DeadlineReminderEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace,
  job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle },
  completionDeadline: copy.stories.deadline, reminderDate: copy.stories.reminderDate, timezone: copy.stories.timezone,
};
describe('deadline-reminder email boundary', () => {
  it('includes only supplied Job details, date-only deadline and scoped app/preferences links', () => {
    const email = renderDeadlineReminderEmail({ ...input, baseURL: input.baseURL + '/untrusted/path?query=ignored' });
    for (const content of [input.job.number, input.job.title, 'Oct 30, 2026', input.timezone, copy.explanation, copy.reason])
      expect(email.text).toContain(content);
    expect(email.html).toContain(`/jobs/${input.job.id}?workspace=${input.workspaceId}`);
    expect(email.html).toContain(`/settings/notifications?workspace=${input.workspaceId}`);
    expect(email.html).not.toContain('/untrusted/path');
    expect(email.html).not.toContain('/work-orders/');
    expect(email.html).toContain(copy.logoCid);
  });
  it('distinguishes approaching, due and overdue without browser-clock dependency', () => {
    for (const [reminderDate, days, heading] of [
      [copy.stories.reminderDate, 2, copy.headings.approaching],
      [copy.stories.oneDayBefore, 1, copy.headings.approaching],
      [copy.stories.dueDate, 0, copy.headings.due],
      [copy.stories.oneDayAfter, -1, copy.headings.overdue],
      [copy.stories.overdueDate, -3, copy.headings.overdue],
    ] as const) {
      const email = renderDeadlineReminderEmail({ ...input, reminderDate });
      expect(email.subject).toContain(heading);
      expect(email.text).toContain(copy.timing(days));
      expect(email.html).toContain(copy.timing(days));
    }
  });
  it('uses calendar dates across DST and year boundaries', () => {
    expect(renderDeadlineReminderEmail({ ...input, completionDeadline: '2026-11-02', reminderDate: '2026-10-31' }).text).toContain(copy.timing(2));
    expect(renderDeadlineReminderEmail({ ...input, completionDeadline: '2027-01-01', reminderDate: '2026-12-31' }).text).toContain(copy.timing(1));
  });
  it('escapes dynamic HTML and prevents subject header injection', () => {
    const email = renderDeadlineReminderEmail({ ...input, workspaceName: copy.stories.escapedWorkspace + '\r\nInjected: header', job: { ...input.job, title: copy.stories.escapedTitle } });
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.html).not.toContain('<script>');
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('&lt;img');
  });
  it('rejects unsafe origins, forged identities, invalid dates and timezones', () => {
    for (const baseURL of ['javascript:alert(1)', 'https://user:password@app.example.test'])
      expect(() => renderDeadlineReminderEmail({ ...input, baseURL })).toThrow();
    expect(() => renderDeadlineReminderEmail({ ...input, workspaceId: '../hidden' })).toThrow();
    expect(() => renderDeadlineReminderEmail({ ...input, job: { ...input.job, id: '../other?workspace=hidden' } })).toThrow();
    expect(() => renderDeadlineReminderEmail({ ...input, job: { ...input.job, number: 'WO-42' } })).toThrow();
    expect(() => renderDeadlineReminderEmail({ ...input, completionDeadline: '2026-02-30' })).toThrow();
    expect(() => renderDeadlineReminderEmail({ ...input, reminderDate: 'not-a-date' })).toThrow();
    expect(() => renderDeadlineReminderEmail({ ...input, timezone: 'invalid/zone' })).toThrow();
  });
});
