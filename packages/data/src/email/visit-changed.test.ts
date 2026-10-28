import { describe, expect, it } from 'vitest';
import { renderVisitChangedEmail, type VisitChangedEmailInput } from './visit-changed';
import { visitChangedEmailData as copy } from './visit-changed.data';
const input: VisitChangedEmailInput = { baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace, actorName: copy.stories.actor,
  event: 'rescheduled', before: { scheduledDate: copy.stories.beforeDate, arrivalWindow: '09:00-11:00' }, after: { scheduledDate: copy.stories.afterDate, arrivalWindow: '13:00-15:00' }, timezone: copy.stories.timezone,
  records: [{ type: 'work_order', id: copy.stories.orderId, number: copy.stories.orderNumber, title: copy.stories.orderTitle }] };
describe('visit-change email boundary', () => {
  it('renders both schedules, timezone and only the supplied authorized projection', () => {
    const email = renderVisitChangedEmail(input);
    expect(email.text).toContain('9 AM – 11 AM'); expect(email.text).toContain('1 PM – 3 PM'); expect(email.text).toContain(input.timezone);
    expect(email.html).toContain(`/work-orders/${copy.stories.orderId}?workspace=${input.workspaceId}`); expect(email.html).not.toContain('/jobs/'); expect(email.text).not.toContain(copy.stories.jobNumber);
  });
  it('escapes all dynamic HTML and removes newlines from the subject', () => {
    const email = renderVisitChangedEmail({ ...input, workspaceName: copy.stories.escapedWorkspace + '\r\nInjected: header', actorName: copy.stories.escapedActor, records: [{ ...input.records[0], title: copy.stories.escapedTitle }] });
    expect(email.subject).not.toMatch(/[\r\n]/); expect(email.html).not.toContain('<script>'); expect(email.html).not.toContain('<img src=x'); expect(email.html).toContain('&lt;img'); expect(email.html).toContain('&lt;script&gt;');
  });
  it('rejects unsafe origins and malformed record identities', () => {
    for (const baseURL of ['javascript:alert(1)', 'https://user:password@app.example.test']) expect(() => renderVisitChangedEmail({ ...input, baseURL })).toThrow();
    expect(() => renderVisitChangedEmail({ ...input, records: [] })).toThrow();
    expect(() => renderVisitChangedEmail({ ...input, records: [{ ...input.records[0], id: '../other?workspace=hidden' }] })).toThrow();
    expect(() => renderVisitChangedEmail({ ...input, records: [input.records[0], input.records[0]] })).toThrow();
  });
  it('validates dates, windows, timezone and event consistency', () => {
    expect(() => renderVisitChangedEmail({ ...input, after: { scheduledDate: '2026-02-30', arrivalWindow: null } })).toThrow();
    expect(() => renderVisitChangedEmail({ ...input, after: { scheduledDate: null, arrivalWindow: '09:00-11:00' } })).toThrow();
    expect(() => renderVisitChangedEmail({ ...input, timezone: 'invalid/zone' })).toThrow();
    expect(() => renderVisitChangedEmail({ ...input, event: 'cleared' })).toThrow();
  });
  it('supports clearing and an unscheduled separate visit without implying other records moved', () => {
    for (const event of ['cleared', 'separated'] as const) {
      const email = renderVisitChangedEmail({ ...input, event, after: { scheduledDate: null, arrivalWindow: null } });
      expect(email.text).toContain(copy.noDate); expect(email.text).toContain(copy.explanations[event]);
    }
  });
});
