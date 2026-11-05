import { createHash } from 'node:crypto';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';
import { captureGmailTokenSecretsSchema } from '@salesmora/contracts/lead-capture/gmail-secrets';
import { captureIdSchema } from '@salesmora/contracts';
import { createCaptureGmailCipher, type CaptureGmailTokens } from './gmail-credentials';

export class CaptureGmailProviderError extends Error {
  constructor(readonly kind: 'authorization' | 'temporary' | 'configuration' = 'temporary') { super('Gmail could not verify the connection. Try again or reconnect the account.'); }
}
export type CaptureGmailConfiguration = {
  clientId: string; clientSecret: string; redirectUri: string; origin: string;
  environment: 'local' | 'staging' | 'production'; workspaces: string[];
  cipher: ReturnType<typeof createCaptureGmailCipher>;
};
export function captureGmailConfiguration(env: Record<string, string | undefined>): CaptureGmailConfiguration | null {
  if (env.CAPTURE_GMAIL_CONNECTIONS_ENABLED !== 'true') return null;
  try {
    const origin = new URL(env.BETTER_AUTH_URL ?? ''), redirect = new URL(env.CAPTURE_GMAIL_REDIRECT_URI ?? '');
    const environment = env.CAPTURE_GMAIL_ENVIRONMENT;
    if (!['local', 'staging', 'production'].includes(environment ?? '')) throw Error();
    const local = environment === 'local' && env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(origin.hostname);
    if (environment === 'local' && !local) throw Error();
    if (origin.username || origin.password || !['http:', 'https:'].includes(origin.protocol) || (!local && origin.protocol !== 'https:') || (!local && ['localhost', '127.0.0.1'].includes(origin.hostname))) throw Error();
    if (redirect.origin !== origin.origin || redirect.pathname !== '/api/lead-capture/gmail/oauth/callback' || redirect.username || redirect.password || redirect.search || redirect.hash) throw Error();
    const clientId = env.CAPTURE_GMAIL_CLIENT_ID ?? '', clientSecret = env.CAPTURE_GMAIL_CLIENT_SECRET ?? '';
    if (!/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/.test(clientId) || !clientSecret.trim() || clientSecret.length > 4096) throw Error();
    const workspaces = [...new Set((env.CAPTURE_GMAIL_WORKSPACE_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean))];
    if (!workspaces.length || workspaces.length > 100 || workspaces.some(id => !captureIdSchema.safeParse(id).success)) throw Error();
    return { clientId, clientSecret, redirectUri: redirect.href, origin: origin.origin, environment: environment as CaptureGmailConfiguration['environment'], workspaces, cipher: createCaptureGmailCipher(env) };
  } catch { throw new CaptureGmailProviderError('configuration'); }
}
export type VerifiedCaptureGmailGrant = { subject: string; email: string; tokens: Omit<CaptureGmailTokens, 'refreshToken'> & { refreshToken: string | null } };
export interface CaptureGmailProvider {
  authorizationUrl(state: string, verifier: string): string;
  exchange(code: string, verifier: string, state: string): Promise<VerifiedCaptureGmailGrant>;
  refresh(refreshToken: string): Promise<VerifiedCaptureGmailGrant>;
}
/** One client per operation. The library validates signatures/audience; no global credential cache. */
export function googleCaptureProvider(config: CaptureGmailConfiguration): CaptureGmailProvider {
  const client = () => {
    const oauth = new OAuth2Client({ clientId: config.clientId, clientSecret: config.clientSecret, redirectUri: config.redirectUri });
    // Native fetch rejects aborted requests without emitting an unhandled Node stream error.
    // Apply the transport policy after the SDK's per-method defaults.
    oauth.transporter.interceptors.request.add({ resolved: async options => ({
      ...options, fetchImplementation: globalThis.fetch, redirect: 'error',
      timeout: 10000, signal: AbortSignal.timeout(10000), retry: false, retryConfig: { retry: 0 }, maxRedirects: 0,
    }) });
    return oauth;
  };
  function failure(error: unknown): never {
    const value = error as { response?: { status?: number; data?: { error?: string } } };
    throw new CaptureGmailProviderError(value.response?.data?.error === 'invalid_grant' || [400, 401, 403].includes(value.response?.status ?? 0) ? 'authorization' : 'temporary');
  }
  async function verified(oauth: OAuth2Client, accessToken: string, refreshToken: string | null, identity?: { sub?: string; email?: string; email_verified?: boolean }) {
    const info = await oauth.getTokenInfo(accessToken);
    if (info.aud !== config.clientId || !info.scopes.includes('https://www.googleapis.com/auth/gmail.readonly')) throw new CaptureGmailProviderError('authorization');
    oauth.setCredentials({ access_token: accessToken });
    const { data: user } = await oauth.request<{ sub: string; email: string; email_verified: boolean }>({ url: 'https://openidconnect.googleapis.com/v1/userinfo', method: 'GET' });
    const { data: profile } = await oauth.request<{ emailAddress: string }>({ url: 'https://gmail.googleapis.com/gmail/v1/users/me/profile', method: 'GET' });
    if (!user.sub || !user.email_verified || !user.email || user.email.toLowerCase() !== profile.emailAddress?.toLowerCase() || identity && (identity.sub !== user.sub || identity.email_verified !== true || identity.email?.toLowerCase() !== user.email.toLowerCase())) throw new CaptureGmailProviderError('authorization');
    // Validate scopes/types with a sentinel when Google legitimately omits a new refresh token.
    const parsed = captureGmailTokenSecretsSchema.parse({ refreshToken: refreshToken ?? 'omitted', accessToken, expiresAt: new Date(info.expiry_date).toISOString(), tokenType: 'Bearer', scopes: info.scopes });
    return { subject: user.sub, email: user.email, tokens: { ...parsed, refreshToken } };
  }
  return {
    authorizationUrl(state, verifier) {
      const url = new URL(client().generateAuthUrl({ access_type: 'offline', scope: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.readonly'], prompt: 'consent select_account', include_granted_scopes: false, state, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: CodeChallengeMethod.S256 }));
      url.searchParams.set('nonce', createHash('sha256').update(state).digest('hex')); return url.href;
    },
    async exchange(code, verifier, state) {
      try {
        const oauth = client(), { tokens } = await oauth.getToken({ code, codeVerifier: verifier, redirect_uri: config.redirectUri });
        if (!tokens.access_token || !tokens.id_token) throw new CaptureGmailProviderError('authorization');
        const payload = (await oauth.verifyIdToken({ idToken: tokens.id_token, audience: config.clientId })).getPayload();
        if (!payload || payload.nonce !== createHash('sha256').update(state).digest('hex')) throw new CaptureGmailProviderError('authorization');
        return await verified(oauth, tokens.access_token, tokens.refresh_token ?? null, payload);
      } catch (error) { if (error instanceof CaptureGmailProviderError) throw error; return failure(error); }
    },
    async refresh(refreshToken) {
      try {
        const oauth = client(); oauth.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth.refreshAccessToken();
        if (!credentials.access_token) throw new CaptureGmailProviderError('authorization');
        return await verified(oauth, credentials.access_token, credentials.refresh_token ?? refreshToken);
      } catch (error) { if (error instanceof CaptureGmailProviderError) throw error; return failure(error); }
    },
  };
}
