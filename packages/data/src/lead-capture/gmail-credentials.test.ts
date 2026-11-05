import { randomBytes, randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createCaptureGmailCipher, CaptureGmailCustodyError } from './gmail-credentials';
const first = randomBytes(32).toString('base64'), second = randomBytes(32).toString('base64');
const env = { CAPTURE_GMAIL_ACTIVE_KEY_ID: 'v1', CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ v1: first }) };
const binding = { environment: 'local' as const, workspaceId: randomUUID(), recordId: randomUUID() };
const tokens = { refreshToken: 'fictional-refresh-secret', accessToken: 'fictional-access-secret', expiresAt: '2026-11-03T12:00:00Z', tokenType: 'Bearer' as const, scopes: ['https://www.googleapis.com/auth/gmail.readonly'] };
describe('Gmail credential custody', () => {
  it('encrypts nondeterministically and returns exact validated data', () => {
    const cipher = createCaptureGmailCipher(env), envelope = cipher.sealTokens(binding, tokens);
    expect(cipher.openTokens(binding, envelope)).toEqual(tokens);
    expect(cipher.sealTokens(binding, tokens)).not.toEqual(envelope);
    expect(JSON.stringify(envelope)).not.toContain(tokens.refreshToken);
    expect(JSON.stringify(envelope)).not.toContain(tokens.accessToken);
  });
  it('authenticates tenant, account, environment, purpose and every envelope field', () => {
    const cipher = createCaptureGmailCipher(env), envelope = cipher.sealTokens(binding, tokens);
    for (const wrong of [{ ...binding, workspaceId: randomUUID() }, { ...binding, recordId: randomUUID() }, { ...binding, environment: 'staging' as const }]) {
      expect(() => cipher.openTokens(wrong, envelope)).toThrow(CaptureGmailCustodyError);
    }
    expect(() => cipher.openOAuth(binding, envelope)).toThrow(CaptureGmailCustodyError);
    for (const key of ['iv', 'tag', 'ciphertext'] as const) {
      const bytes = Buffer.from(envelope[key], 'base64'); bytes[0] ^= 1;
      expect(() => cipher.openTokens(binding, { ...envelope, [key]: bytes.toString('base64') })).toThrow(CaptureGmailCustodyError);
    }
    expect(() => cipher.openTokens(binding, { ...envelope, keyId: 'other' })).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.openTokens(binding, { ...envelope, schemaVersion: 2 })).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.openTokens(binding, { ...envelope, unexpected: 'secret' })).toThrow(CaptureGmailCustodyError);
  });
  it('reads old keys during rotation and reseals under the new key', () => {
    const old = createCaptureGmailCipher(env).sealTokens(binding, tokens);
    const rotated = createCaptureGmailCipher({ CAPTURE_GMAIL_ACTIVE_KEY_ID: 'v2', CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ v1: first, v2: second }) });
    expect(rotated.openTokens(binding, old)).toEqual(tokens);
    const resealed = rotated.sealTokens(binding, rotated.openTokens(binding, old));
    expect(resealed.keyId).toBe('v2');
    const retired = createCaptureGmailCipher({ CAPTURE_GMAIL_ACTIVE_KEY_ID: 'v2', CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ v2: second }) });
    expect(() => retired.openTokens(binding, old)).toThrow(CaptureGmailCustodyError);
    expect(retired.openTokens(binding, resealed)).toEqual(tokens);
  });
  it('rejects absent/malformed keys without file-key fallback or sensitive errors', () => {
    for (const bad of [{}, { FILE_MASTER_KEY: first }, { ...env, CAPTURE_GMAIL_ACTIVE_KEY_ID: 'missing' }, { ...env, CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ v1: 'short' }) }, { ...env, CAPTURE_GMAIL_CREDENTIAL_KEYS: 'fictional-secret' }]) {
      expect(() => createCaptureGmailCipher(bad)).toThrow(new CaptureGmailCustodyError());
    }
    const wrongKey = createCaptureGmailCipher({ ...env, CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ v1: second }) });
    expect(() => wrongKey.openTokens(binding, createCaptureGmailCipher(env).sealTokens(binding, tokens))).toThrow(new CaptureGmailCustodyError());
  });
  it('validates private payloads and keeps OAuth verifier separate from tokens', () => {
    const cipher = createCaptureGmailCipher(env), attempt = cipher.sealOAuth(binding, { pkceVerifier: 'a'.repeat(43) });
    expect(cipher.openOAuth(binding, attempt)).toEqual({ pkceVerifier: 'a'.repeat(43) });
    expect(() => cipher.openTokens(binding, attempt)).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.sealTokens(binding, { ...tokens, refreshToken: '' })).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.sealTokens(binding, { ...tokens, scopes: ['https://www.googleapis.com/auth/gmail.metadata'] })).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.sealTokens(binding, { ...tokens, scopes: [...tokens.scopes, 'https://www.googleapis.com/auth/gmail.modify'] })).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.sealOAuth(binding, { pkceVerifier: 'invalid' })).toThrow(CaptureGmailCustodyError);
  });
  it('keeps candidate references opaque and separate from token and OAuth purposes', () => {
    const cipher = createCaptureGmailCipher(env), sample = { actorId: 'fictional-actor', sessionHash: 'a'.repeat(64), bindingHash: 'b'.repeat(64), messageId: 'fictional-message', subjectPhrase: 'fictional subject', expiresAt: '2026-11-04T12:00:00Z' };
    const envelope = cipher.sealSample(binding, sample);
    expect(cipher.openSample(binding, envelope)).toEqual(sample);
    expect(JSON.stringify(envelope)).not.toContain(sample.messageId);
    expect(() => cipher.openOAuth(binding, envelope)).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.openTokens(binding, envelope)).toThrow(CaptureGmailCustodyError);
    expect(() => cipher.openSample({ ...binding, workspaceId: randomUUID() }, envelope)).toThrow(CaptureGmailCustodyError);
  });
});
