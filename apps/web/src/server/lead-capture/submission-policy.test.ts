import { expect, it } from 'vitest';
import { captureClientIdentity, captureSubmissionPolicy, captureInstallationOrigin } from './submission-policy';
const key = (n: number) => Buffer.alloc(32, n).toString('base64');
const local = { CAPTURE_SUBMISSIONS_ENABLED: 'true', BETTER_AUTH_URL: 'http://127.0.0.1:3018', CAPTURE_PUBLIC_ORIGIN: 'http://localhost:3018', NODE_ENV: 'development', CAPTURE_CONTEXT_SECRET: key(1), CAPTURE_ABUSE_SECRET: key(2), TURNSTILE_SITE_KEY: 'fixture-key', TURNSTILE_SECRET_KEY: 'fixture-provider-secret', CAPTURE_CLIENT_IP_MODE: 'loopback' };
it('keeps submission disabled unless explicit secrets, provider and IP policy are configured', () => {
  expect(captureInstallationOrigin(local)).toBe('http://localhost:3018');
  expect(captureSubmissionPolicy(local)?.limits.challengeAfter).toBe(5); expect(captureSubmissionPolicy(local)?.limits.hardLimit).toBe(20);
  for (const override of [{ CAPTURE_SUBMISSIONS_ENABLED: 'false' }, { CAPTURE_ABUSE_SECRET: key(1) }, { TURNSTILE_SECRET_KEY: '' }, { CAPTURE_CLIENT_IP_MODE: '' }, { CAPTURE_ATTEMPT_LIMIT: '5' }, { CAPTURE_REQUESTS_PER_MINUTE: '1.5' }]) expect(captureSubmissionPolicy({ ...local, ...override })).toBeNull();
});
it('production requires explicit budgets and verified ingress; local fixture providers cannot enable it', () => {
  const production = { ...local, NODE_ENV: 'production', BETTER_AUTH_URL: 'https://app.salesmora.ai', CAPTURE_PUBLIC_ORIGIN: 'https://forms.salesmora.ai' };
  expect(captureSubmissionPolicy(production)).toBeNull();
  const configured = { ...production, CAPTURE_CLIENT_IP_MODE: 'verified-header', CAPTURE_INGRESS_SECRET: key(3), CAPTURE_TRUSTED_IP_HEADER: 'cf-connecting-ip', CAPTURE_REQUESTS_PER_MINUTE: '300', CAPTURE_SOURCE_REQUESTS_PER_MINUTE: '100', CAPTURE_MAX_PENDING_ITEMS: '10000', CAPTURE_MAX_RETAINED_BYTES: '67108864' };
  expect(captureInstallationOrigin(configured)).toBeUndefined();
  const policy = captureSubmissionPolicy(configured)!; expect(policy).not.toBeNull(); expect(policy.verifyURL).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  expect(captureSubmissionPolicy({ ...configured, CAPTURE_TURNSTILE_TEST_ORIGIN: 'http://127.0.0.1:3019', SALESMORA_TEST_SERVER: '1' })).toBeNull();
  expect(captureClientIdentity(new Headers({ 'cf-connecting-ip': '198.51.100.2' }), 'a'.repeat(64), policy)).toBeNull();
  expect(captureClientIdentity(new Headers({ 'cf-connecting-ip': '198.51.100.2, 10.0.0.1', 'x-capture-ingress-key': key(3) }), 'a'.repeat(64), policy)).toBeNull();
  const headers = new Headers({ 'cf-connecting-ip': '198.51.100.2', 'x-capture-ingress-key': key(3) }); const first = captureClientIdentity(headers, 'a'.repeat(64), policy)!;
  expect(first.clientHash).toMatch(/^[a-f0-9]{64}$/); expect(first.clientHash).not.toContain('198.51'); expect(captureClientIdentity(headers, 'b'.repeat(64), policy)?.clientHash).not.toBe(first.clientHash);
  const ipv6 = (ip: string) => captureClientIdentity(new Headers({ 'cf-connecting-ip': ip, 'x-capture-ingress-key': key(3) }), 'a'.repeat(64), policy)!;
  expect(ipv6('2001:0db8:0:0:0:0:0:1').ip).toBe('2001:db8::1'); expect(ipv6('2001:db8::1').clientHash).toBe(ipv6('2001:0db8:0:0:0:0:0:1').clientHash);
});
