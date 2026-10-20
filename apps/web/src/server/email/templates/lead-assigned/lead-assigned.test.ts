import { describe, expect, it } from 'vitest';
import { renderLeadAssignedEmail, type LeadAssignedEmailInput } from './lead-assigned';
const input: LeadAssignedEmailInput = { baseURL: 'https://app.example.test', workspaceId: '00000000-0000-4000-8000-000000000001', leadId: '00000000-0000-4000-8000-000000000002', workspaceName: 'Example workspace', assignerName: 'Alex', leadNumber: 'LD-0001', leadName: 'Jordan', service: 'Sink repair', stage: 'estimate-sent' };
describe('lead assignment email boundary', () => {
  it('builds a scoped login-protected app link, includes required context and excludes unrelated private fields', () => {
    const email = renderLeadAssignedEmail({ ...input, ...{ notes: 'Private team note', address: 'Private address' } });
    for (const output of [email.html, email.text]) { expect(output).toContain(input.leadName); expect(output).toContain(input.assignerName); expect(output).toContain(input.workspaceName); expect(output).toContain('Estimate sent'); expect(output).toContain(`/leads/${input.leadId}?workspace=${input.workspaceId}`); expect(output).not.toContain('Private team note'); expect(output).not.toContain('Private address'); }
    expect(email.html).toContain('cid:salesmora-logo');
  });
  it('escapes HTML and prevents injected subject headers', () => {
    const email = renderLeadAssignedEmail({ ...input, workspaceName: '<script>bad</script>\r\nBcc: fake@example.test', leadName: '<img src=x onerror=alert(1)>', service: 'Repair <strong>sink</strong> & pipes' });
    expect(email.subject).not.toMatch(/[\r\n]/); expect(email.html).not.toContain('<script>bad'); expect(email.html).not.toContain('<img src=x'); expect(email.html).toContain('&lt;strong&gt;'); expect(email.text).toContain('<img src=x');
  });
  it('rejects invalid identities, unsafe app origins and invalid lead stages', () => {
    for (const extra of [{ baseURL: 'javascript:alert(1)' }, { baseURL: 'https://user:password@app.example.test' }, { workspaceId: 'invalid' }, { leadNumber: 'LD-1\r\nBcc: bad' }]) expect(() => renderLeadAssignedEmail({ ...input, ...extra })).toThrow();
    expect(() => renderLeadAssignedEmail({ ...input, stage: 'in-progress' as LeadAssignedEmailInput['stage'] })).toThrow();
  });
});
