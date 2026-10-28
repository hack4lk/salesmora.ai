import { describe, expect, it } from 'vitest';
import { estimateArchiveEvidenceSchema, estimateDraftActionEvidenceSchema, estimateVoidEvidenceSchema } from '@salesmora/contracts';
import { readChatStream } from './chat-stream';
import { estimateTotalsFixture, estimateUnavailableFixture } from './estimate-result/estimate-read-result.fixtures';
import { estimateDraftViewFixture } from './estimate-result/estimate-draft.fixtures';
import { estimateSharingFixture } from './estimate-result/estimate-sharing.fixtures';
import { estimateDecisionFixture } from './estimate-result/estimate-decision.fixtures';
import { estimateDraftActionFixture } from '../estimates/estimate-draft-action-card/estimate-draft-action-card.fixtures';
import { estimateVoidCardFixture } from '../estimates/estimate-void-card/estimate-void-card.fixtures';
import { estimateArchiveCardFixture } from '../estimates/estimate-archive-card/estimate-archive-card.fixtures';
const id = '00000000-0000-4000-8000-000000000001';
const event = (sequence: number, data: object) => ({ version: 1, runId: id, turnId: id, sequence, ...data });
const accepted = event(1, { type: 'turn.accepted', threadId: id, messageId: id });
const delta = event(2, { type: 'message.delta', messageId: id, text: 'Hello 🌍' });
const done = event(3, { type: 'turn.completed', messageId: id });
const frame = (data: object) => `data: ${JSON.stringify(data)}\r\n\r\n`;
async function consume(text: string, byteSize = 1) {
  const bytes = new TextEncoder().encode(text);
  let position = 0;
  const stream = new ReadableStream<Uint8Array>({ pull(controller) {
    if (position === bytes.length) { controller.close(); return; }
    controller.enqueue(bytes.slice(position, position + byteSize));
    position = Math.min(position + byteSize, bytes.length);
  } });
  const events = [];
  for await (const item of readChatStream(stream)) events.push(item);
  return events;
}
describe('chat stream transport', () => {
  it('bounds Void provenance and streams only compact tickets, never the private reason or receipt', async () => {
    const sources = Array.from({ length: 8 }, (_, index) => `00000000-0000-4000-8000-00000000000${index}`);
    expect(estimateVoidEvidenceSchema.parse(sources.slice(0, 7))).toHaveLength(7);
    expect(estimateVoidEvidenceSchema.safeParse(sources).success).toBe(false);
    expect(estimateVoidEvidenceSchema.safeParse(['private model text']).success).toBe(false);
    const view = estimateVoidCardFixture(), result = view.ticket;
    const card = event(2, { type: 'estimates.void', messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    for (const extra of [{ reason: view.review.reason }, { review: view.review }, { recipientName: 'Private' },
      { totalCents: 0 }, { receipt: {} }, { href: '/estimates/private' }]) {
      await expect(consume(frame(accepted) + frame({ ...card, result: { ...result, ...extra } }))).rejects.toThrow();
    }
  });
  it('bounds persisted Draft-action provenance to seven exact source-turn IDs', () => {
    const sources = Array.from({ length: 8 }, (_, index) => `00000000-0000-4000-8000-00000000000${index}`);
    expect(estimateDraftActionEvidenceSchema.parse(sources.slice(0, 7))).toHaveLength(7);
    expect(estimateDraftActionEvidenceSchema.safeParse(sources).success).toBe(false);
    expect(estimateDraftActionEvidenceSchema.safeParse(['private model text']).success).toBe(false);
  });
  it("bounds Archive/Restore provenance and streams only compact tickets", async () => {
    const sources = Array.from({ length: 8 }, (_, index) => `00000000-0000-4000-8000-00000000000${index}`);
    expect(estimateArchiveEvidenceSchema.parse(sources.slice(0, 7))).toHaveLength(7);
    expect(estimateArchiveEvidenceSchema.safeParse(sources).success).toBe(false);
    expect(estimateArchiveEvidenceSchema.safeParse(["private model text"]).success).toBe(false);
    const view = estimateArchiveCardFixture(), result = view.ticket;
    const card = event(2, { type: "estimates.archive", messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    for (const extra of [{ review: view.review }, { recipientName: "Private" }, { receipt: {} }, { href: "/estimates/private" }]) {
      await expect(consume(frame(accepted) + frame({ ...card, result: { ...result, ...extra } }))).rejects.toThrow();
    }
  });
  it.each(['revise', 'reuse', 'duplicate'] as const)('streams/replays compact %s tickets without copied content or receipt extensions', async kind => {
    const view = estimateDraftActionFixture(kind), result = view.ticket;
    const card = event(2, { type: 'estimates.draft_action', messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    for (const extra of [{ review: view.review }, { values: view.review.values }, { receipt: {} }, { href: '/estimates/private' },
      { recipientEmail: 'private@example.test' }, { internalNotes: 'private' }, { paymentLink: 'https://private.test' }]) {
      await expect(consume(frame(accepted) + frame({ ...card, result: { ...result, ...extra } }))).rejects.toThrow();
    }
  });
  it('streams/replays compact decision tickets and rejects recipient, previous decision and proposed private fields', async () => {
    const result = estimateDecisionFixture().ticket;
    const card = event(2, { type: 'estimates.decision', messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    for (const extra of [{ recipientName: 'Private' }, { review: estimateDecisionFixture().review },
      { value: estimateDecisionFixture().value }, { reason: 'Private reason' }, { note: 'Private note' }]) {
      await expect(consume(frame(accepted) + frame({ ...card, result: { ...result, ...extra } }))).rejects.toThrow();
    }
  });
  it('streams/replays compact sharing tickets, never customer paper, destinations or public tokens', async () => {
    const result = estimateSharingFixture().ticket;
    const card = event(2, { type: 'estimates.sharing', messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    for (const extra of [{ recipientEmail: 'private@example.test' }, { review: estimateSharingFixture().review }, { publicToken: 'private' }]) {
      await expect(consume(frame(accepted) + frame({ ...card, result: { ...result, ...extra } }))).rejects.toThrow();
    }
  });
  it('replays complete Draft review cards and rejects private extensions or invalid lifetime', async () => {
    const result = estimateDraftViewFixture();
    const card = event(2, { type: 'estimates.draft', messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    for (const proposed of [
      { ...result.draft.proposed, internalNotes: 'private' },
      { ...result.draft.proposed, paymentLink: 'https://private.test' },
    ]) await expect(consume(frame(accepted) + frame({ ...card, result: { ...result, draft: { ...result.draft, proposed } } }))).rejects.toThrow();
    await expect(consume(frame(accepted) + frame({
      ...card, result: { ...result, draft: { ...result.draft, expiresAt: result.draft.createdAt } },
    }))).rejects.toThrow();
  });
  it('handles fragmented UTF-8 and CRLF frames, comments, multiple frames and replay', async () => {
    const text = ': heartbeat\r\n\r\n' + [accepted, delta, delta, done].map(frame).join('');
    for (const size of [1, 7, 4096]) expect(await consume(text, size)).toEqual([accepted, delta, done]);
  });
  it('requires an accepted run and explicit terminal event', async () => {
    await expect(consume(frame(accepted) + frame(delta))).rejects.toThrow('Interrupted');
    await expect(consume(frame(delta))).rejects.toThrow();
    await expect(consume(frame(accepted) + frame(done))).rejects.toThrow('sequence');
  });
  it('streams and replays typed Estimate summaries and rejects a mismatched result turn', async () => {
    const result = { turnId: id, operation: 'search', summaries: [{
      id, queryLabel: 'Matching estimates', scope: 'assigned', filterLabels: [],
      dateRange: null, retrievedAt: '2026-10-26T18:00:00.000Z', timezone: 'UTC',
      totalMatches: 0, totalCents: 0, rows: [], canOpenList: true, canReviewExport: false,
    }] };
    const card = event(2, { type: 'estimates.result', messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    const forged = { ...card, result: { ...result, turnId: '00000000-0000-4000-8000-000000000002' } };
    await expect(consume(frame(accepted) + frame(forged))).rejects.toThrow('result turn');
  });
  it('rejects mixed runs/messages, invalid payloads, trailing data and oversized frames', async () => {
    for (const invalid of [
      { ...delta, runId: '00000000-0000-4000-8000-000000000002' },
      { ...delta, messageId: '00000000-0000-4000-8000-000000000002' },
      { ...delta, type: 'response.output_text.delta' },
      { ...delta, reasoning: 'private' },
    ]) await expect(consume(frame(accepted) + frame(invalid))).rejects.toThrow();
    await expect(consume(frame(accepted) + frame(delta) + frame(done) + 'data: partial')).rejects.toThrow('Truncated');
    await expect(consume('data: ' + 'x'.repeat(64001), 4096)).rejects.toThrow('frame');
    await expect(consume(frame(accepted) + frame(delta) + frame(done) + frame({ ...delta, sequence: 4 }))).rejects.toThrow();
  });
  it.each([estimateTotalsFixture, estimateUnavailableFixture])('streams and replays detailed Estimate cards without accepting private extensions', async detail => {
    const result = { turnId: id, operation: detail.kind === 'unavailable' ? detail.operation : detail.kind, summaries: [], detail };
    const card = event(2, { type: 'estimates.result', messageId: id, result });
    expect(await consume(frame(accepted) + frame(card) + frame(card) + frame(done), 7)).toEqual([accepted, card, done]);
    const forged = { ...card, result: { ...result, detail: { ...detail, paymentLink: 'https://private.test' } } };
    await expect(consume(frame(accepted) + frame(forged), 4096)).rejects.toThrow();
  });
});
