import { expect, it, vi } from 'vitest';
import { verifyCaptureTurnstile } from './turnstile';
const input = { token: 'fixture-token', idempotencyKey: '00000000-0000-4000-8000-000000000001', cData: 'a'.repeat(64), hostname: 'forms.salesmora.ai', secret: 'fixture-secret', endpoint: 'https://challenges.cloudflare.com/turnstile/v0/siteverify' };
const valid = () => ({ success: true, hostname: input.hostname, action: 'capture_submit', cdata: input.cData, challenge_ts: new Date().toISOString() });
it('validates success, hostname, action, binding and age; reuses the durable provider retry identity', async () => {
  const fetcher = vi.fn<typeof fetch>(async () => Response.json(valid())); expect(await verifyCaptureTurnstile(input, fetcher)).toBeInstanceOf(Date);
  const sent = JSON.parse(String(fetcher.mock.calls[0][1]?.body)); expect(sent.idempotency_key).toBe(input.idempotencyKey); expect(sent.secret).toBe(input.secret); expect(sent.response).toBe(input.token); expect(fetcher.mock.calls[0][1]?.redirect).toBe('error');
  for (const override of [{ success: false }, { success: 'true' }, { hostname: 'other.example' }, { action: 'other' }, { cdata: 'forged' }, { challenge_ts: new Date(Date.now() - 301000).toISOString() }, { challenge_ts: new Date(Date.now() + 60000).toISOString() }]) expect(await verifyCaptureTurnstile(input, async () => Response.json({ ...valid(), ...override }))).toBeNull();
});
it('does not treat timeouts, failed HTTP or malformed provider responses as proof', async () => {
  expect(await verifyCaptureTurnstile(input, async () => { throw Error('Network failure'); })).toBeNull(); expect(await verifyCaptureTurnstile(input, async () => new Response('unavailable', { status: 503 }))).toBeNull(); expect(await verifyCaptureTurnstile(input, async () => new Response('not-json'))).toBeNull();
});
