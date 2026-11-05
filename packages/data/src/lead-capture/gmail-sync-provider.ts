import { z } from 'zod';
const historyId = z.string().regex(/^[0-9]{1,30}$/);
const messageId = z.string().regex(/^[A-Za-z0-9_-]{1,200}$/);
const token = z.string().min(1).max(2048);
const historyPage = z.object({ historyId, nextPageToken: token.optional(), history: z.array(z.object({ id: historyId, messagesAdded: z.array(z.object({ message: z.object({ id: messageId, labelIds: z.array(z.string().max(100)).max(100).optional() }) })).max(500).optional() })).max(100).optional() });
const recoveryPage = z.object({ messages: z.array(z.object({ id: messageId })).max(100).optional(), nextPageToken: token.optional() });
export type GmailHistoryPage = z.infer<typeof historyPage>;
export type GmailRecoveryPage = z.infer<typeof recoveryPage>;
export class GmailSyncError extends Error {
  constructor(readonly kind: 'authorization' | 'rate-limit' | 'provider' | 'cursor-expired' | 'recovery-required' | 'unavailable') { super(`Gmail synchronization unavailable (${kind}).`); }
}
export interface GmailSyncProvider {
  profile(accessToken: string): Promise<{ historyId: string }>;
  history(accessToken: string, startHistoryId: string, pageToken?: string): Promise<GmailHistoryPage>;
  recovery(accessToken: string, startedAt: Date, until: Date, pageToken?: string): Promise<GmailRecoveryPage>;
}
/** Fixed read-only endpoints. No token/body/URL is included in diagnostic errors. */
export function googleGmailSync(fetcher: typeof fetch = fetch): GmailSyncProvider {
  async function get(accessToken: string, path: string, params: URLSearchParams, cursor = false): Promise<unknown> {
    try {
      const response = await fetcher(`https://gmail.googleapis.com/gmail/v1/users/me/${path}?${params}`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}`, 'Cache-Control': 'no-store' }, redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        await response.body?.cancel();
        throw new GmailSyncError(response.status === 401 ? 'authorization' : response.status === 429 ? 'rate-limit' : response.status === 404 && cursor ? 'cursor-expired' : [400, 403].includes(response.status) ? 'recovery-required' : 'provider');
      }
      if (!response.body || Number(response.headers.get('content-length')) > 1_000_000) { await response.body?.cancel(); throw new GmailSyncError('provider'); }
      const reader = response.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
      try { for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 1_000_000) { await reader.cancel(); throw new GmailSyncError('provider'); } chunks.push(part.value); } }
      finally { reader.releaseLock(); }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (error) { throw error instanceof GmailSyncError ? error : new GmailSyncError('provider'); }
  }
  function parsed<T>(schema: z.ZodType<T>, value: unknown) { const result = schema.safeParse(value); if (!result.success) throw new GmailSyncError('provider'); return result.data; }
  return {
    async profile(accessToken) { return parsed(z.object({ historyId }), await get(accessToken, 'profile', new URLSearchParams({ fields: 'historyId' }))); },
    async history(accessToken, startHistoryId, pageToken) {
      if (!historyId.safeParse(startHistoryId).success || pageToken !== undefined && !token.safeParse(pageToken).success) throw new GmailSyncError('provider');
      const params = new URLSearchParams({ startHistoryId, historyTypes: 'messageAdded', maxResults: '100', fields: 'historyId,nextPageToken,history(id,messagesAdded/message(id,labelIds))' }); if (pageToken) params.set('pageToken', pageToken);
      const page = parsed(historyPage, await get(accessToken, 'history', params, true));
      if (BigInt(page.historyId) < BigInt(startHistoryId) || page.history?.some(row => BigInt(row.id) <= BigInt(startHistoryId) || BigInt(row.id) > BigInt(page.historyId))) throw new GmailSyncError('provider');
      return page;
    },
    async recovery(accessToken, startedAt, until, pageToken) {
      if (!Number.isFinite(startedAt.getTime()) || !Number.isFinite(until.getTime()) || until <= startedAt || until.getTime() - startedAt.getTime() > 7 * 86400000 || pageToken !== undefined && !token.safeParse(pageToken).success) throw new GmailSyncError('recovery-required');
      // Round outward. Internal dates are checked against exact eligibility windows at commit.
      const params = new URLSearchParams({ q: `after:${Math.floor(startedAt.getTime() / 1000) - 1} before:${Math.ceil(until.getTime() / 1000) + 1} -in:sent -in:drafts -in:spam -in:trash`, maxResults: '100', includeSpamTrash: 'false', fields: 'messages/id,nextPageToken' }); if (pageToken) params.set('pageToken', pageToken);
      return parsed(recoveryPage, await get(accessToken, 'messages', params));
    },
  };
}
