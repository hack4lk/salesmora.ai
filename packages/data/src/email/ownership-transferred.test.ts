import { describe, expect, it } from 'vitest';
import { renderOwnershipTransferredEmail, type OwnershipTransferredEmailInput } from './ownership-transferred';
import { ownershipTransferredEmailData as copy } from './ownership-transferred.data';

const base = { workspaceName: copy.stories.workspace, newOwnerName: copy.stories.newOwnerName, previousOwnerName: copy.stories.previousOwnerName };

describe('ownership-transferred email', () => {
  it('tells the new Owner who they took over from, without links into the app', () => {
    const email = renderOwnershipTransferredEmail({ ...base, recipient: 'new_owner' });
    expect(email.subject).toBe(copy.newOwner.subject(copy.stories.workspace));
    for (const content of [copy.newOwner.introduction(copy.stories.workspace, copy.stories.previousOwnerName), copy.newOwner.detail, copy.contact, copy.newOwner.reason]) {
      expect(email.text).toContain(content);
      expect(email.html).toContain(content);
    }
    expect(email.html).not.toMatch(/<a\s/);
    expect(email.html).toContain(copy.logoCid);
  });
  it('tells the previous Owner who the new Owner is and that they remain an Admin', () => {
    const email = renderOwnershipTransferredEmail({ ...base, recipient: 'previous_owner' });
    expect(email.subject).toBe(copy.previousOwner.subject(copy.stories.workspace));
    for (const content of [copy.previousOwner.introduction(copy.stories.workspace, copy.stories.newOwnerName), copy.previousOwner.detail, copy.contact, copy.previousOwner.reason]) {
      expect(email.text).toContain(content);
      expect(email.html).toContain(content);
    }
    expect(email.text).not.toContain(copy.newOwner.detail);
  });
  it.each<OwnershipTransferredEmailInput['recipient']>(['new_owner', 'previous_owner'])('escapes dynamic HTML and prevents subject header injection (%s)', recipient => {
    const email = renderOwnershipTransferredEmail({ recipient, workspaceName: copy.stories.escapedWorkspace + '\r\nBcc: attacker@example.test',
      newOwnerName: '<img src=x onerror=alert(1)>', previousOwnerName: '<img src=x onerror=alert(1)>' });
    expect(email.html).not.toContain('<script>');
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.subject).not.toMatch(/[\r\n]/);
  });
});
