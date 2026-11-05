import { timingSafeEqual } from 'node:crypto';
import { captureReadinessRequestSchema } from '@salesmora/contracts';
import { captureReadinessKey } from '@salesmora/data/lead-capture/delivery-policy';
import { captureWebsiteDeliveryPolicy } from './delivery';
const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
const reply = (status: number) => Response.json({ error: 'Readiness unavailable.' }, { status, headers });

/** Environment-only probe: never acquire the scheduler's already-held workspace lock. */
export async function captureReadiness(request: Request, env: Record<string, string | undefined> = process.env) {
  const key = captureReadinessKey(env.CAPTURE_READINESS_SECRET);
  const independent = key && ![env.CAPTURE_CONTEXT_SECRET, env.CAPTURE_ABUSE_SECRET, env.CAPTURE_INGRESS_SECRET, env.TURNSTILE_SECRET_KEY].includes(env.CAPTURE_READINESS_SECRET);
  const authorization = request.headers.get('authorization');
  const supplied = authorization?.startsWith('Bearer ') ? captureReadinessKey(authorization.slice(7)) : null;
  if (!independent || !supplied || !timingSafeEqual(key, supplied)) return reply(401);
  if (request.method !== 'POST') return reply(405);
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json' || !request.body) return reply(400);
  let input: unknown;
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0, timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(Error('Readiness body deadline.')), 2000); });
  try {
    for (;;) { const part = await Promise.race([reader.read(), deadline]); if (part.done) break; size += part.value.byteLength; if (size > 1024) { void reader.cancel().catch(() => {}); return reply(413); } chunks.push(part.value); }
    input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch { void reader.cancel().catch(() => {}); return reply(400); } finally { clearTimeout(timer); reader.releaseLock(); }
  const parsed = captureReadinessRequestSchema.safeParse(input); if (!parsed.success) return reply(400);
  const policy = captureWebsiteDeliveryPolicy(env);
  return Response.json({ ...parsed.data, origin: policy?.origin ?? null, websiteReady: !!policy?.workspaces.includes(parsed.data.workspaceId) }, { headers });
}
