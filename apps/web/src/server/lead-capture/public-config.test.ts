import { expect, it } from 'vitest';
import { capturePublicConfig, capturePublicHeaders, captureRequestSurface } from './public-config';
const env = { BETTER_AUTH_URL: 'https://app.salesmora.ai', CAPTURE_PUBLIC_ORIGIN: 'https://forms.salesmora.ai', NODE_ENV: 'production' };
it('requires an explicit separate canonical origin, HTTPS in production and no credentials/path', () => {
  expect(capturePublicConfig(env)?.origin).toBe('https://forms.salesmora.ai');
  for (const origin of ['', 'https://app.salesmora.ai', 'https://forms.salesmora.ai/path', 'https://user:secret@forms.salesmora.ai', 'https://forms.salesmora.ai?host=other', 'http://forms.salesmora.ai', 'https://localhost']) expect(capturePublicConfig({ ...env, CAPTURE_PUBLIC_ORIGIN: origin })).toBeNull();
  expect(capturePublicConfig({ BETTER_AUTH_URL: 'http://127.0.0.1:3016', CAPTURE_PUBLIC_ORIGIN: 'http://localhost:3016', NODE_ENV: 'development' })?.origin).toBe('http://localhost:3016');
});
it('denies private/auth routes on the forms host, and form routes on the app host', () => {
  const config = capturePublicConfig(env), key = 'a'.repeat(64);
  expect(captureRequestSurface('forms.salesmora.ai', '/api/internal/lead-capture/readiness', 'POST', config)).toBe('reject');
  expect(captureRequestSurface('forms.salesmora.ai', '/embed.js', 'GET', config)).toBe('loader');
  expect(captureRequestSurface('forms.salesmora.ai', '/embed.js', 'POST', config)).toBe('reject');
  expect(captureRequestSurface('app.salesmora.ai', '/embed.js', 'GET', config)).toBe('reject');
  for (const path of ['/login', '/settings/leads', '/api/auth/get-session', '/api/settings/leads', '/', '/f/invalid', '/api/public/capture/anything', '/_next/image', '/%61pi/auth/get-session']) expect(captureRequestSurface('forms.salesmora.ai', path, 'GET', config)).toBe('reject');
  expect(captureRequestSurface('app.salesmora.ai', `/f/${key}`, 'GET', config)).toBe('reject');
  expect(captureRequestSurface('forms.salesmora.ai', `/f/${key}`, 'POST', config)).toBe('reject');
  expect(captureRequestSurface('forms.salesmora.ai', `/f/${key}`, 'GET', config)).toBe('hosted');
  expect(captureRequestSurface('forms.salesmora.ai', `/embed/${key}`, 'GET', config)).toBe('embed');
  expect(captureRequestSurface('forms.salesmora.ai', '/_next/static/example.js', 'GET', config)).toBe('asset');
  for (const path of ['/_next/static/../api/auth', '/_next/static/%2e%2e/api/auth', '/_next/static/%252fapi/auth']) expect(captureRequestSurface('forms.salesmora.ai', path, 'GET', config)).toBe('reject');
  expect(captureRequestSurface('forms.salesmora.ai', '/login', 'GET', null)).toBe('unconfigured');
  expect(captureRequestSurface('forms-staging.salesmora.ai', '/login', 'GET', null)).toBe('unconfigured');
  const staging = capturePublicConfig({ ...env, CAPTURE_PUBLIC_ORIGIN: 'https://forms-staging.salesmora.ai', BETTER_AUTH_URL: 'https://web-staging-cc17.up.railway.app' });
  expect(captureRequestSurface('forms-staging.salesmora.ai', `/f/${key}`, 'GET', staging)).toBe('hosted');
  expect(captureRequestSurface('forms-staging.salesmora.ai', '/api/auth/get-session', 'GET', staging)).toBe('reject');
  expect(captureRequestSurface('forms.salesmora.ai.', '/login', 'GET', config)).toBe('unconfigured');
  expect(captureRequestSurface('app.salesmora.ai', '/login', 'GET', config)).toBe('application');
});
it('permits embedding only for the embed document and never caches availability', () => {
  const hosted = capturePublicHeaders(false, 'fixture-nonce'), embedded = capturePublicHeaders(true, 'fixture-nonce');
  expect(hosted['Content-Security-Policy']).toContain("frame-ancestors 'none'"); expect(hosted['X-Frame-Options']).toBe('DENY');
  expect(embedded['Content-Security-Policy']).toContain('frame-ancestors https: http:'); expect(embedded).not.toHaveProperty('X-Frame-Options');
  expect(hosted['Cache-Control']).toContain('no-store'); expect(hosted['Content-Security-Policy']).not.toContain('unsafe-eval'); expect(hosted['Content-Security-Policy']).toContain("form-action 'self'");
});
