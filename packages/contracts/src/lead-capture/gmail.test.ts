import { describe, expect, it } from 'vitest';
import { captureGmailAccountSchema, captureGmailConnectSchema, captureGmailDisconnectSchema, captureGmailSelectAccountSchema } from './gmail';
const id = '11111111-1111-4111-8111-111111111111';
const source = { workspaceId: id, sourceId: id, expectedVersion: 1, expectedDraftVersion: 1, requestId: id };
describe('Gmail browser contracts', () => {
  it('rejects tokens and provider identity in account projections', () => {
    const account = { id, email: 'fictional@example.test', status: 'connected', version: 1 };
    expect(captureGmailAccountSchema.safeParse(account).success).toBe(true);
    for (const extra of [{ refreshToken: 'secret' }, { envelope: {} }, { providerSubject: 'google-sub' }, { accessToken: 'secret' }, { scopes: [] }]) {
      expect(captureGmailAccountSchema.safeParse({ ...account, ...extra }).success).toBe(false);
    }
  });
  it('binds connection and selection to versions and rejects forged account evidence', () => {
    expect(captureGmailConnectSchema.safeParse({ ...source, reconnect: null }).success).toBe(true);
    expect(captureGmailConnectSchema.safeParse({ ...source, reconnect: { accountId: id, expectedAccountVersion: 2 } }).success).toBe(true);
    expect(captureGmailConnectSchema.safeParse({ ...source, reconnect: { accountId: id } }).success).toBe(false);
    const selection = { ...source, accountId: id, expectedAccountVersion: 2 };
    expect(captureGmailSelectAccountSchema.safeParse(selection).success).toBe(true);
    for (const extra of [{ accountEmail: 'forged@example.test' }, { connected: true }, { expectedAccountVersion: 0 }, { returnUrl: 'https://attacker.example' }]) {
      expect(captureGmailSelectAccountSchema.safeParse({ ...selection, ...extra }).success).toBe(false);
    }
  });
  it('requires an explicit reviewed disconnect rather than a browser affected-source claim', () => {
    const input = { workspaceId: id, accountId: id, expectedAccountVersion: 1, requestId: id, reviewId: id, confirmed: true };
    expect(captureGmailDisconnectSchema.safeParse(input).success).toBe(true);
    expect(captureGmailDisconnectSchema.safeParse({ ...input, confirmed: false }).success).toBe(false);
    expect(captureGmailDisconnectSchema.safeParse({ ...input, reviewId: undefined }).success).toBe(false);
    expect(captureGmailDisconnectSchema.safeParse({ ...input, affectedSources: [] }).success).toBe(false);
  });
});
