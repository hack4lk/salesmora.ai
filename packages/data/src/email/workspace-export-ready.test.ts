import { describe, expect, it } from 'vitest';
import { renderWorkspaceExportReadyEmail } from './workspace-export-ready';

const requestId = '7424c32d-5e39-4b2e-a48f-9735bf2b153d';

describe('workspace export ready email', () => {
  it('links to the authenticated customer download page without exposing a bearer token', () => {
    const email = renderWorkspaceExportReadyEmail({
      baseURL: 'https://app.salesmora.ai',
      requestId,
      workspaceName: 'Northstar <Heating>',
      expiresAt: '2026-11-09T15:00:00.000Z',
    });
    expect(email.subject).toBe('Your workspace data export is ready');
    expect(email.text).toContain(`https://app.salesmora.ai/workspace-exports/${requestId}`);
    expect(email.text).toContain('verified workspace Owner');
    expect(email.html).toContain('Northstar &lt;Heating&gt;');
    expect(email.html).not.toContain('token=');
  });

  it('normalizes the configured origin and rejects unsafe protocols or malformed identifiers', () => {
    const email = renderWorkspaceExportReadyEmail({
      baseURL: 'https://app.salesmora.ai/ignored-path?tracking=ignored',
      requestId,
      workspaceName: 'Northstar Heating',
      expiresAt: new Date(),
    });
    expect(email.text).toContain(`https://app.salesmora.ai/workspace-exports/${requestId}`);
    expect(email.text).not.toContain('ignored-path');
    expect(() => renderWorkspaceExportReadyEmail({
      baseURL: 'http://attacker.example',
      requestId,
      workspaceName: 'Northstar Heating',
      expiresAt: new Date(),
    })).toThrow('HTTPS except for localhost');
    expect(() => renderWorkspaceExportReadyEmail({
      baseURL: 'https://app.salesmora.ai',
      requestId: '../other',
      workspaceName: 'Northstar Heating',
      expiresAt: new Date(),
    })).toThrow('details are invalid');
  });
});
