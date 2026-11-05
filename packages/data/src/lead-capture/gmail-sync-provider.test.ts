import { describe, it, expect, vi } from 'vitest';
import { googleGmailSync } from './gmail-sync-provider';
import { gmailRuleMatches } from './gmail-ingestion';
describe('bounded Gmail history transport', () => {
  it('requests only added-message history and preserves large decimal IDs exactly', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ historyId: '999999999999999999999', nextPageToken: 'page2', history: [{ id: '999999999999999999998', messagesAdded: [{ message: { id: 'mail1', labelIds: ['INBOX'] } }] }] }));
    const page = await googleGmailSync(fetcher).history('fictional', '999999999999999999997');
    expect(page.nextPageToken).toBe('page2'); const url = new URL(String(fetcher.mock.calls[0][0]));
    expect(url.searchParams.get('historyTypes')).toBe('messageAdded'); expect(url.searchParams.get('startHistoryId')).toBe('999999999999999999997'); expect(url.searchParams.get('maxResults')).toBe('100'); expect(fetcher.mock.calls[0][1]).toMatchObject({ redirect: 'error', method: 'GET' });
  });
  it.each([[401, 'authorization'], [429, 'rate-limit'], [404, 'cursor-expired'], [503, 'provider']] as const)('classifies %i without leaking provider data', async (status, kind) => {
    const provider = googleGmailSync(vi.fn<typeof fetch>().mockResolvedValue(new Response('private response', { status })));
    await expect(provider.history('private token', '10')).rejects.toMatchObject({ kind });
  });
  it('rejects malformed, regressing and oversized responses', async () => {
    for (const body of [{ historyId: '9' }, { historyId: '20', history: [{ id: '21' }] }, { historyId: 'NaN' }, { historyId: '20', history: Array(101).fill({ id: '11' }) }]) {
      await expect(googleGmailSync(vi.fn<typeof fetch>().mockResolvedValue(Response.json(body))).history('fictional', '10')).rejects.toMatchObject({ kind: 'provider' });
    }
    await expect(googleGmailSync(vi.fn<typeof fetch>().mockResolvedValue(new Response('x'.repeat(1000001)))).history('fictional', '10')).rejects.toMatchObject({ kind: 'provider' });
  });
  it('limits cursor recovery to a fixed recent interval and read-only search', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ messages: [{ id: 'one' }] })); const provider = googleGmailSync(fetcher), start = new Date('2026-11-04T12:00:00Z'), until = new Date('2026-11-04T13:00:00Z');
    expect(await provider.recovery('fictional', start, until)).toEqual({ messages: [{ id: 'one' }] }); expect(new URL(String(fetcher.mock.calls[0][0])).searchParams.get('q')).toContain('-in:sent');
    await expect(provider.recovery('fictional', new Date('2026-10-01'), until)).rejects.toMatchObject({ kind: 'recovery-required' }); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('matches every configured phrase literally, with all/any and subject/body scope', () => {
    const message = { subject: 'TEST: Request', body: 'Water heater <script> is inert text' };
    expect(gmailRuleMatches({ location: 'both', mode: 'all', phrases: ['test:', 'WATER HEATER'] }, message)).toBe(true);
    expect(gmailRuleMatches({ location: 'subject', mode: 'all', phrases: ['water heater'] }, message)).toBe(false);
    expect(gmailRuleMatches({ location: 'body', mode: 'any', phrases: ['missing', '<script>'] }, message)).toBe(true);
    expect(gmailRuleMatches({ location: 'body', mode: 'all', phrases: [] }, message)).toBe(false);
    expect(gmailRuleMatches({ location: 'both', mode: 'all', phrases: ['Request\nWater'] }, message)).toBe(false);
  });
});
