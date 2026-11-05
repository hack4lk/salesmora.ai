import { createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import type { CaptureSubmissionLimits } from '@salesmora/data';
import { capturePublicationWorkspaces } from '@salesmora/data/lead-capture/delivery-policy';
import { capturePublicConfig } from './public-config';
function secret(value?: string) { if (!value) return null; const key = Buffer.from(value, 'base64'); return key.length === 32 && key.toString('base64') === value ? key : null; }
function integer(value: string | undefined, fallback?: number) { const n = value === undefined || value === '' ? fallback : Number(value); return n !== undefined && Number.isSafeInteger(n) && n > 0 && n <= 1000000000000 ? n : null; }
export function captureSubmissionPolicy(env: Record<string, string | undefined> = process.env) {
  const publicConfig = capturePublicConfig(env); if (!publicConfig || env.CAPTURE_SUBMISSIONS_ENABLED !== 'true') return null;
  const local = env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(publicConfig.hostname);
  const abuseKey = secret(env.CAPTURE_ABUSE_SECRET), contextKey = secret(env.CAPTURE_CONTEXT_SECRET);
  if (!abuseKey || !contextKey || abuseKey.equals(contextKey)) return null;
  const siteKey = env.TURNSTILE_SITE_KEY, providerSecret = env.TURNSTILE_SECRET_KEY;
  if (!siteKey || !/^[A-Za-z0-9_-]{1,200}$/.test(siteKey) || !providerSecret || providerSecret.length < 10 || providerSecret.length > 2000) return null;
  const mode = env.CAPTURE_CLIENT_IP_MODE;
  const ingressKey = secret(env.CAPTURE_INGRESS_SECRET), ipHeader = env.CAPTURE_TRUSTED_IP_HEADER?.toLowerCase();
  if (mode === 'loopback' ? !local : mode !== 'verified-header' || !ingressKey || !ipHeader || !['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'].includes(ipHeader)) return null;
  if (mode === 'verified-header' && ingressKey && (ingressKey.equals(abuseKey) || ingressKey.equals(contextKey))) return null;
  const requestsPerMinute = integer(env.CAPTURE_REQUESTS_PER_MINUTE, local ? 300 : undefined), sourceRequestsPerMinute = integer(env.CAPTURE_SOURCE_REQUESTS_PER_MINUTE, local ? 100 : undefined), maxPendingItems = integer(env.CAPTURE_MAX_PENDING_ITEMS, local ? 10000 : undefined), maxRetainedBytes = integer(env.CAPTURE_MAX_RETAINED_BYTES, local ? 67108864 : undefined);
  const challengeAfter = integer(env.CAPTURE_CHALLENGE_AFTER, 5), hardLimit = integer(env.CAPTURE_ATTEMPT_LIMIT, 20);
  if (!requestsPerMinute || requestsPerMinute > 1000000 || !sourceRequestsPerMinute || sourceRequestsPerMinute > 1000000 || !maxPendingItems || !maxRetainedBytes || !challengeAfter || !hardLimit || challengeAfter >= hardLimit || hardLimit > 10000) return null;
  let verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  if (env.CAPTURE_TURNSTILE_TEST_ORIGIN) {
    try { const test = new URL(env.CAPTURE_TURNSTILE_TEST_ORIGIN); if (!local || env.SALESMORA_TEST_SERVER !== '1' || test.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(test.hostname) || test.pathname !== '/' || test.username || test.password || test.search || test.hash) return null; verifyURL = `${test.origin}/siteverify`; } catch { return null; }
  }
  const limits: CaptureSubmissionLimits = { challengeAfter, hardLimit, sourceRequestsPerMinute, maxPendingItems, maxRetainedBytes };
  return { ...publicConfig, abuseKey, siteKey, providerSecret, mode, ingressKey, ipHeader, requestsPerMinute, limits, verifyURL };
}
export function captureClientIdentity(headers: Headers, publicKey: string, policy: NonNullable<ReturnType<typeof captureSubmissionPolicy>>) {
  let ip = '127.0.0.1';
  if (policy.mode === 'verified-header') {
    const supplied = Buffer.from(headers.get('x-capture-ingress-key') ?? '', 'base64');
    if (!policy.ingressKey || supplied.length !== policy.ingressKey.length || !timingSafeEqual(supplied, policy.ingressKey)) return null;
    ip = headers.get(policy.ipHeader!)?.trim() ?? ''; if (!isIP(ip)) return null;
    if (isIP(ip) === 6) ip = new URL(`http://[${ip}]/`).hostname.slice(1, -1).toLowerCase();
  }
  return { ip, clientHash: createHmac('sha256', policy.abuseKey).update(`${publicKey}\0${ip}`).digest('hex') };
}

/** Complete deployment policy shared by web reads, writes, installation and private readiness. */
export function captureWebsiteDeliveryPolicy(env: Record<string, string | undefined> = process.env) {
  if (env.CAPTURE_WEBSITE_PUBLICATION_ENABLED !== 'true') return null;
  if (env.NODE_ENV === 'production' && (env.SALESMORA_TEST_SERVER || env.CAPTURE_TURNSTILE_TEST_ORIGIN || env.TEST_DATABASE_URL)) return null;
  const workspaces = capturePublicationWorkspaces(env.CAPTURE_PUBLICATION_WORKSPACE_IDS), policy = captureSubmissionPolicy(env);
  return workspaces?.length && policy ? { workspaces, origin: policy.origin } : null;
}

/** Persisted artifacts use the same policy, with a legacy explicitly configured local preview. */
export function captureInstallationOrigin(env: Record<string, string | undefined> = process.env, workspaceId?: string) {
  const policy = captureWebsiteDeliveryPolicy(env);
  if (workspaceId && policy?.workspaces.includes(workspaceId)) return policy.origin;
  const local = captureSubmissionPolicy(env);
  return env.CAPTURE_WEBSITE_PUBLICATION_ENABLED === undefined && env.NODE_ENV !== 'production' && local && ['localhost', '127.0.0.1'].includes(local.hostname) ? local.origin : undefined;
}
