import { CaptureGmailProviderError } from './gmail-provider';
import { CaptureGmailMessageError } from './gmail-message';
export interface CaptureGmailMessagesProvider {
  list(accessToken: string, subjectPhrase: string): Promise<readonly string[]>;
  metadata(accessToken: string, id: string): Promise<unknown>;
  message(accessToken: string, id: string): Promise<unknown>;
}
/** Fixed read-only endpoints, bounded response streaming and a shared 15-second operation deadline. */
export function googleCaptureMessages(fetcher: typeof fetch = fetch): CaptureGmailMessagesProvider {
  const deadline = AbortSignal.timeout(15000);
  async function get(accessToken: string, path: string, params: URLSearchParams, maxBytes: number) {
    try {
      const options = { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` }, signal: deadline, redirect: 'error' as const, cache: 'no-store' as const };
      const response = await fetcher(`https://gmail.googleapis.com/gmail/v1/users/me/${path}?${params}`, options);
      if (!response.ok) {
        await response.body?.cancel();
        if (response.status === 404) throw new CaptureGmailMessageError();
        throw new CaptureGmailProviderError(response.status === 401 ? 'authorization' : 'temporary');
      }
      if (Number(response.headers.get('content-length')) > maxBytes || !response.body) { await response.body?.cancel(); throw new CaptureGmailMessageError(); }
      const reader = response.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
      try { for (;;) { const item = await reader.read(); if (item.done) break; size += item.value.byteLength; if (size > maxBytes) { await reader.cancel(); throw new CaptureGmailMessageError(); } chunks.push(item.value); } }
      finally { reader.releaseLock(); }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (error) {
      if (error instanceof CaptureGmailProviderError || error instanceof CaptureGmailMessageError) throw error;
      throw new CaptureGmailProviderError('temporary');
    }
  }
  const messagePath = (id: string) => { if (!/^[A-Za-z0-9_-]{1,200}$/.test(id)) throw new CaptureGmailMessageError(); return `messages/${id}`; };
  return {
    async list(accessToken, subjectPhrase) {
      if (subjectPhrase.length < 3 || subjectPhrase.length > 100 || /["\\\x00-\x1f]/.test(subjectPhrase)) throw new CaptureGmailMessageError();
      const result = await get(accessToken, 'messages', new URLSearchParams({ q: `newer_than:30d subject:"${subjectPhrase}"`, maxResults: '10', includeSpamTrash: 'false', fields: 'messages/id' }), 10000) as { messages?: { id: string }[] };
      const ids = result.messages?.map(row => row.id) ?? [];
      if (ids.length > 10 || ids.some(id => typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(id)) || new Set(ids).size !== ids.length) throw new CaptureGmailMessageError();
      return ids;
    },
    metadata(accessToken, id) {
      const params = new URLSearchParams({ format: 'metadata', fields: 'id,internalDate,payload/headers' });
      for (const name of ['Subject', 'From']) params.append('metadataHeaders', name);
      return get(accessToken, messagePath(id), params, 30000);
    },
    message(accessToken, id) { return get(accessToken, messagePath(id), new URLSearchParams({ format: 'full', fields: 'id,labelIds,internalDate,payload' }), 1000000); },
  };
}
