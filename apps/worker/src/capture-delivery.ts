import { randomUUID } from 'node:crypto';
import { captureReadinessResponseSchema } from '@salesmora/contracts';
import type { CaptureDeliveryAuthority } from '@salesmora/data';
import { capturePublicationWorkspaces, captureReadinessKey, captureWebsiteSchemaReady } from '@salesmora/data/lead-capture/delivery-policy';

/** Private server configuration; never log this object because it contains the probe token. */
export function captureSchedulerConfiguration(env: NodeJS.ProcessEnv = process.env) {
  if (env.CAPTURE_SCHEDULER_ENABLED !== 'true') return null;
  try {
    const workspaces = capturePublicationWorkspaces(env.CAPTURE_PUBLICATION_WORKSPACE_IDS);
    if (!workspaces?.length || !captureReadinessKey(env.CAPTURE_READINESS_SECRET)) throw Error();
    const url = new URL(env.CAPTURE_READINESS_URL ?? ''), origin = new URL(env.CAPTURE_PUBLIC_ORIGIN ?? '');
    const local = env.NODE_ENV !== 'production';
    const loopback = (host: string) => ['localhost', '127.0.0.1'].includes(host);
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/api/internal/lead-capture/readiness' || url.protocol !== 'http:' || !(url.hostname === 'web.railway.internal' || local && loopback(url.hostname))) throw Error();
    if (origin.origin !== env.CAPTURE_PUBLIC_ORIGIN || origin.username || origin.password || !(origin.protocol === 'https:' && !loopback(origin.hostname) || local && origin.protocol === 'http:' && loopback(origin.hostname))) throw Error();
    return { workspaces, url: url.href, origin: origin.origin, token: env.CAPTURE_READINESS_SECRET! };
  } catch { throw Error('Invalid capture scheduler configuration.'); }
}

/** Bounded, fresh web confirmation. The web probe must not acquire database locks. */
export function workerCaptureDelivery(config: NonNullable<ReturnType<typeof captureSchedulerConfiguration>>, request: typeof fetch = fetch): CaptureDeliveryAuthority {
  return {
    scheduledType: 'website',
    websiteReady: async (trx, workspaceId) => {
      if (!config.workspaces.includes(workspaceId)) return false;
      try { if (!await captureWebsiteSchemaReady(trx)) return false; } catch { return false; }
      const requestId = randomUUID();
      const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_resolve, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error('Readiness deadline.')); }, 3000); });
      try {
        const response = await Promise.race([request(config.url, { method: 'POST', redirect: 'error', signal: controller.signal,
          headers: { 'Cache-Control': 'no-store', Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, requestId }) }), deadline]);
        if (response.status !== 200 || response.headers.get('content-type')?.split(';')[0].trim() !== 'application/json' || !response.body) { void response.body?.cancel().catch(() => {}); return false; }
        const reader = response.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
        try {
          for (;;) { const part = await Promise.race([reader.read(), deadline]); if (part.done) break; size += part.value.byteLength; if (size > 2048) { void reader.cancel().catch(() => {}); return false; } chunks.push(part.value); }
        } finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
        const parsed = captureReadinessResponseSchema.safeParse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))));
        return parsed.success && parsed.data.websiteReady && parsed.data.workspaceId === workspaceId && parsed.data.requestId === requestId && parsed.data.origin === config.origin;
      } catch { return false; } finally { clearTimeout(timer); controller.abort(); }
    },
    gmailReady: async () => false,
  };
}
