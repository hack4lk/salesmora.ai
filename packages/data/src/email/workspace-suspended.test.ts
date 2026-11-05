import { describe, expect, it } from 'vitest';
import { renderWorkspaceSuspendedEmail } from './workspace-suspended';
import { workspaceSuspendedEmailData as copy } from './workspace-suspended.data';

describe('workspace-suspended email', () => {
  it('names the workspace and explains the hold without links into the app', () => {
    const email = renderWorkspaceSuspendedEmail({ workspaceName: copy.stories.workspace });
    expect(email.subject).toBe(copy.subject(copy.stories.workspace));
    for (const content of [copy.introduction(copy.stories.workspace), copy.held, copy.contact, copy.reason]) {
      expect(email.text).toContain(content);
      expect(email.html).toContain(content);
    }
    expect(email.html).not.toMatch(/<a\s/);
    expect(email.html).toContain(copy.logoCid);
  });
  it('escapes dynamic HTML and prevents subject header injection', () => {
    const email = renderWorkspaceSuspendedEmail({ workspaceName: copy.stories.escapedWorkspace + '\r\nBcc: attacker@example.test' });
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.subject).not.toMatch(/[\r\n]/);
  });
});
