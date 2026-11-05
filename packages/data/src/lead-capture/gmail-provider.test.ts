import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OAuth2Client } from 'google-auth-library';
import { captureGmailConfiguration, googleCaptureProvider, CaptureGmailProviderError } from './gmail-provider';
const workspaceId = randomUUID(), state = 'a'.repeat(43);
const env = { NODE_ENV: 'development', BETTER_AUTH_URL: 'http://localhost:3000', CAPTURE_GMAIL_CONNECTIONS_ENABLED: 'true', CAPTURE_GMAIL_ENVIRONMENT: 'local', CAPTURE_GMAIL_WORKSPACE_IDS: workspaceId, CAPTURE_GMAIL_CLIENT_ID: 'fictional.apps.googleusercontent.com', CAPTURE_GMAIL_CLIENT_SECRET: 'fictional-secret', CAPTURE_GMAIL_REDIRECT_URI: 'http://localhost:3000/api/lead-capture/gmail/oauth/callback', CAPTURE_GMAIL_ACTIVE_KEY_ID: 'test', CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ test: randomBytes(32).toString('base64') }) };
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function mocks() {
  vi.spyOn(OAuth2Client.prototype, 'getToken').mockResolvedValue({ tokens: { access_token: 'fictional-access', refresh_token: 'fictional-refresh', id_token: 'fictional-id' }, res: null } as never);
  vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({ getPayload: () => ({ sub: 'fictional-sub', email: 'fixture@example.test', email_verified: true, nonce: createHash('sha256').update(state).digest('hex') }) } as unknown as Awaited<ReturnType<OAuth2Client['verifyIdToken']>>);
  vi.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockResolvedValue({ aud: env.CAPTURE_GMAIL_CLIENT_ID, scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.readonly'], expiry_date: Date.now() + 3600000 });
  vi.spyOn(OAuth2Client.prototype, 'request').mockImplementation(async (options: { url?: string | URL }) => ({ data: String(options.url).includes('userinfo') ? { sub: 'fictional-sub', email: 'fixture@example.test', email_verified: true } : { emailAddress: 'fixture@example.test' } }) as never);
}
describe('Google Gmail provider boundary', () => {
  it('defaults off and rejects unsafe/missing configuration without exposing its values', () => {
    expect(captureGmailConfiguration({})).toBeNull();
    expect(captureGmailConfiguration(env)?.workspaces).toEqual([workspaceId]);
    for (const patch of [{ CAPTURE_GMAIL_CLIENT_SECRET: '' }, { CAPTURE_GMAIL_WORKSPACE_IDS: '' }, { CAPTURE_GMAIL_REDIRECT_URI: 'https://attacker.example/api/lead-capture/gmail/oauth/callback' }, { CAPTURE_GMAIL_REDIRECT_URI: `${env.CAPTURE_GMAIL_REDIRECT_URI}?redirect=bad` }, { NODE_ENV: 'production' }, { CAPTURE_GMAIL_ENVIRONMENT: 'staging' }, { CAPTURE_GMAIL_CREDENTIAL_KEYS: 'invalid-secret' }]) {
      expect(() => captureGmailConfiguration({ ...env, ...patch })).toThrow(new CaptureGmailProviderError('configuration'));
    }
  });
  it('builds the actual Google consent URL with read-only scopes, PKCE and nonce', () => {
    const url = new URL(googleCaptureProvider(captureGmailConfiguration(env)!).authorizationUrl(state, 'b'.repeat(64)));
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('scope')).toBe('openid email https://www.googleapis.com/auth/gmail.readonly');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toBe(createHash('sha256').update('b'.repeat(64)).digest('base64url'));
    expect(url.searchParams.get('nonce')).toBe(createHash('sha256').update(state).digest('hex'));
    expect(url.href).not.toContain(env.CAPTURE_GMAIL_CLIENT_SECRET);
  });
  it('verifies ID signature/audience/nonce and binds Gmail profile to the verified Google identity', async () => {
    mocks(); const provider = googleCaptureProvider(captureGmailConfiguration(env)!);
    expect((await provider.exchange('code', 'b'.repeat(64), state)).subject).toBe('fictional-sub');
    expect(OAuth2Client.prototype.verifyIdToken).toHaveBeenCalledWith({ idToken: 'fictional-id', audience: env.CAPTURE_GMAIL_CLIENT_ID });
    await expect(provider.exchange('code', 'b'.repeat(64), 'different-state')).rejects.toBeInstanceOf(CaptureGmailProviderError);
    vi.mocked(OAuth2Client.prototype.getTokenInfo).mockResolvedValueOnce({ aud: 'other-client', scopes: ['https://www.googleapis.com/auth/gmail.readonly'], expiry_date: Date.now() + 3600000 });
    await expect(provider.exchange('code', 'b'.repeat(64), state)).rejects.toBeInstanceOf(CaptureGmailProviderError);
  });
  it('denies missing or excessive Gmail permissions and mailbox identity mismatch', async () => {
    mocks(); const provider = googleCaptureProvider(captureGmailConfiguration(env)!);
    vi.mocked(OAuth2Client.prototype.getTokenInfo).mockResolvedValueOnce({ aud: env.CAPTURE_GMAIL_CLIENT_ID, scopes: ['openid', 'email'], expiry_date: Date.now() + 3600000 });
    await expect(provider.exchange('code', 'b'.repeat(64), state)).rejects.toBeInstanceOf(CaptureGmailProviderError);
    vi.mocked(OAuth2Client.prototype.request).mockResolvedValueOnce({ data: { sub: 'different-account', email: 'fixture@example.test', email_verified: true } } as never);
    await expect(provider.exchange('code', 'b'.repeat(64), state)).rejects.toBeInstanceOf(CaptureGmailProviderError);
    vi.mocked(OAuth2Client.prototype.getTokenInfo).mockResolvedValueOnce({ aud: env.CAPTURE_GMAIL_CLIENT_ID, scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'], expiry_date: Date.now() + 3600000 });
    await expect(provider.exchange('code', 'b'.repeat(64), state)).rejects.toBeInstanceOf(CaptureGmailProviderError);
  });
  it('classifies invalid grant without retaining provider error payloads', async () => {
    vi.spyOn(OAuth2Client.prototype, 'refreshAccessToken').mockRejectedValue({ response: { status: 400, data: { error: 'invalid_grant', secret: 'must-not-leak' } } });
    await expect(googleCaptureProvider(captureGmailConfiguration(env)!).refresh('fictional-secret')).rejects.toEqual(new CaptureGmailProviderError('authorization'));
  });
  it('uses native fetch and surfaces a refresh transport timeout as retryable', async () => {
    const request = vi.fn<typeof fetch>().mockRejectedValue(new DOMException('Timed out', 'TimeoutError'));
    vi.stubGlobal('fetch', request);
    await expect(googleCaptureProvider(captureGmailConfiguration(env)!).refresh('fictional-secret'))
      .rejects.toEqual(new CaptureGmailProviderError('temporary'));
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ redirect: 'error', signal: expect.any(AbortSignal) }));
  });
});
