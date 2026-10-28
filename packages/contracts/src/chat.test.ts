import { describe, expect, it } from 'vitest';
import { chatStreamEventSchema, chatTurnRequestSchema } from './chat';

const id = '00000000-0000-4000-8000-000000000001';
const request = { workspaceId: id, clientTurnId: id, surfaceKey: 'home', message: '  Help me create a lead  ' };
const envelope = { version: 1, runId: id, turnId: id, sequence: 1 };
describe('chat transport contracts', () => {
  it('normalizes text and validates the bounded client intent', () => {
    expect(chatTurnRequestSchema.parse(request).message).toBe('Help me create a lead');
    for (const message of ['', '  ', 'x'.repeat(4001)]) expect(chatTurnRequestSchema.safeParse({ ...request, message }).success).toBe(false);
    expect(chatTurnRequestSchema.safeParse({ ...request, surfaceKey: 'campaigns' }).success).toBe(false);
    expect(chatTurnRequestSchema.safeParse({ ...request, threadId: '../other-thread' }).success).toBe(false);
  });
  it('supports thinking, incremental text, and explicit terminal events', () => {
    for (const event of [
      { type: 'turn.accepted', threadId: id, messageId: id },
      { type: 'status', status: 'thinking' },
      { type: 'message.delta', messageId: id, text: 'Hello 🌍' },
      { type: 'turn.completed', messageId: id },
      { type: 'turn.cancelled', messageId: id },
      { type: 'turn.failed', messageId: id, code: 'interrupted' },
    ]) expect(chatStreamEventSchema.safeParse({ ...envelope, ...event }).success).toBe(true);
  });
  it("streams only compact Archive/Restore tickets", () => {
    const result = {
      id, actionType: "estimate.archive", inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
      reviewHash: "c".repeat(64), createdAt: "2026-10-27T12:00:00.000Z",
      expiresAt: "2026-10-27T12:15:00.000Z", state: "pending",
      estimate: { id, version: 3, number: "EST-2048", revision: 1, name: "Repair", status: "declined", archived: false },
    };
    const event = { ...envelope, type: "estimates.archive", messageId: id, result };
    expect(chatStreamEventSchema.safeParse(event).success).toBe(true);
    for (const extra of [{ review: {} }, { receipt: {} }, { href: "/estimates/private" }]) {
      expect(chatStreamEventSchema.safeParse({
        ...event, result: { ...result, ...extra },
      }).success).toBe(false);
    }
  });
  it("streams only the compact permanent Draft-deletion ticket", () => {
    const result = {
      id,
      actionType: "estimate.delete-draft",
      inputHash: "a".repeat(64),
      authorizationVersion: "b".repeat(64),
      reviewHash: "c".repeat(64),
      createdAt: "2026-10-27T12:00:00.000Z",
      expiresAt: "2026-10-27T12:15:00.000Z",
      state: "pending",
      estimate: { id, version: 3, number: "EST-2048", revision: 1 },
    };
    const event = { ...envelope, type: "estimates.draft_delete", messageId: id, result };
    expect(chatStreamEventSchema.safeParse(event).success).toBe(true);
    for (const extra of [{ review: {} }, { receipt: {} }, { href: "/estimates/private" }]) {
      expect(chatStreamEventSchema.safeParse({
        ...event,
        result: { ...result, ...extra },
      }).success).toBe(false);
    }
  });
  it('rejects raw provider payloads, internal reasoning, arbitrary error details and bad sequences', () => {
    for (const event of [
      { type: 'response.output_text.delta', delta: 'text' },
      { type: 'status', status: 'private reasoning' },
      { type: 'turn.failed', messageId: id, code: 'interrupted', error: 'secret provider error' },
      { type: 'message.delta', messageId: id, text: 'Hello', reasoning: 'private' },
      { type: 'turn.completed', messageId: id, sequence: 0 },
      { type: 'turn.completed', messageId: id, version: 2 },
    ]) expect(chatStreamEventSchema.safeParse({ ...envelope, ...event }).success).toBe(false);
  });
});
