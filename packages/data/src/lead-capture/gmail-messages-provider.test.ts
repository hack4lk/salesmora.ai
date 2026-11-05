import { describe, expect, it, vi } from 'vitest';
import { googleCaptureMessages } from './gmail-messages-provider';
import { CaptureGmailMessageError } from './gmail-message';
import { CaptureGmailProviderError } from './gmail-provider';
describe('bounded Google Gmail read transport', () => {
  it('uses only metadata on search and a literal, bounded subject query', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ messages: [{ id: 'mail1' }] })).mockResolvedValueOnce(Response.json({ id: 'mail1' }));
    const provider = googleCaptureMessages(fetcher); expect(await provider.list('fictional', 'test: phrase')).toEqual(['mail1']); await provider.metadata('fictional', 'mail1');
    const list = new URL(String(fetcher.mock.calls[0][0])), meta = new URL(String(fetcher.mock.calls[1][0]));
    expect(list.origin).toBe('https://gmail.googleapis.com'); expect(list.searchParams.get('q')).toBe('newer_than:30d subject:"test: phrase"'); expect(list.searchParams.get('maxResults')).toBe('10');
    expect(meta.searchParams.get('format')).toBe('metadata'); expect(meta.searchParams.getAll('metadataHeaders')).toEqual(['Subject', 'From']);
    expect(fetcher.mock.calls[0][1]).toMatchObject({ redirect: 'error', method: 'GET', cache: 'no-store' });
  });
  it('only fetches a full message for an explicit preview', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id: 'mail1' }));
    await googleCaptureMessages(fetcher).message('fictional', 'mail1');
    expect(new URL(String(fetcher.mock.calls[0][0])).searchParams.get('format')).toBe('full'); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects query injection and path injection before any fetch', async () => {
    const fetcher = vi.fn<typeof fetch>(), provider = googleCaptureMessages(fetcher);
    await expect(provider.list('fictional', 'x" OR in:anywhere')).rejects.toBeInstanceOf(CaptureGmailMessageError);
    expect(() => provider.message('fictional', '../profile')).toThrow(CaptureGmailMessageError); expect(fetcher).not.toHaveBeenCalled();
  });
  it('bounds streamed bytes even when content length is absent', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('x'.repeat(10001)));
    await expect(googleCaptureMessages(fetcher).list('fictional', 'example')).rejects.toBeInstanceOf(CaptureGmailMessageError);
  });
  it.each([[401, CaptureGmailProviderError], [429, CaptureGmailProviderError], [503, CaptureGmailProviderError], [404, CaptureGmailMessageError]] as const)('handles provider status %i without leaking its body', async (status, kind) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('private provider response', { status }));
    await expect(googleCaptureMessages(fetcher).message('fictional', 'mail1')).rejects.toBeInstanceOf(kind);
  });
});
