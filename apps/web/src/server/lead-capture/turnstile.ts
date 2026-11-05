type Verification = { token: string; idempotencyKey: string; cData: string; hostname: string; secret: string; endpoint: string; ip?: string };
/** Called outside DB locks. Never log tokens, provider secrets or raw provider responses. */
export async function verifyCaptureTurnstile(input: Verification, fetcher: typeof fetch = fetch) {
  try {
    const response = await fetcher(input.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret: input.secret, response: input.token, idempotency_key: input.idempotencyKey, ...(input.ip ? { remoteip: input.ip } : {}) }), signal: AbortSignal.timeout(8000), redirect: 'error', cache: 'no-store' });
    if (!response.ok) return null; const text = await response.text(); if (text.length > 16000) return null;
    const result: unknown = JSON.parse(text); if (!result || typeof result !== 'object') return null;
    const value = result as Record<string, unknown>, time = typeof value.challenge_ts === 'string' ? Date.parse(value.challenge_ts) : NaN, now = Date.now();
    if (value.success !== true || value.hostname !== input.hostname || value.action !== 'capture_submit' || value.cdata !== input.cData || !Number.isFinite(time) || time > now + 30000 || now - time >= 300000) return null;
    return new Date(Math.min(time + 300000, now + 300000));
  } catch { return null; }
}
