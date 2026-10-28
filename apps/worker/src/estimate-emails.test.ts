import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Knex } from "@salesmora/data";
const mocks = vi.hoisted(() => ({
  process: vi.fn(), available: vi.fn(), send: vi.fn(), render: vi.fn(), readFile: vi.fn(),
}));
vi.mock("@salesmora/data", () => ({ processEstimateEmails: mocks.process }));
vi.mock("@salesmora/data/email/transport", () => ({
  estimateEmailDeliveryAvailable: mocks.available, sendEstimateEmail: mocks.send,
}));
vi.mock("@salesmora/data/email/estimate", () => ({ renderEstimateEmail: mocks.render }));
vi.mock("node:fs/promises", () => ({ readFile: mocks.readFile }));
import { startEstimateEmails } from "./estimate-emails";
const hasColumn = vi.fn();
const db = {} as Knex;
Object.assign(db, { schema: { hasColumn } });

describe("estimate email worker", () => {
  beforeEach(() => {
    vi.useFakeTimers(); vi.stubEnv("BETTER_AUTH_URL", "http://127.0.0.1:3000");
    vi.stubEnv("FILE_MASTER_KEY", Buffer.alloc(32, 1).toString("base64"));
    mocks.available.mockReturnValue(true); hasColumn.mockResolvedValue(true);
    mocks.readFile.mockResolvedValue(Buffer.from("fixture logo"));
    mocks.process.mockResolvedValue({ sent: 0, failed: 0, retryPending: 0 });
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.clearAllMocks(); vi.unstubAllEnvs(); });
  it("never runs for disabled origins/providers", async () => {
    mocks.available.mockReturnValue(false);
    await (await startEstimateEmails(db))();
    expect(hasColumn).not.toHaveBeenCalled(); expect(mocks.process).not.toHaveBeenCalled();
  });
  it("requires delivery migrations", async () => {
    hasColumn.mockResolvedValue(false);
    await expect(startEstimateEmails(db)).rejects.toThrow("migrations");
    expect(mocks.process).not.toHaveBeenCalled();
  });
  it("passes frozen delivery metadata, stable key, reply-to and inline logo to the transport", async () => {
    const queuedAt = new Date().toISOString();
    const mail = { id: '12345678-1234-1234-1234-123456789abc', to: 'fixture@example.test', replyTo: 'business@example.test', queuedAt };
    mocks.render.mockReturnValue({ subject: 'Fixture estimate', text: 'Fixture', html: '<p>Fixture</p>', replyTo: mail.replyTo });
    mocks.process.mockImplementationOnce(async (_db, _permissions, send) => {
      await send(mail); return { sent: 1, failed: 0, retryPending: 0 };
    });
    mocks.send.mockResolvedValue({ providerMessageId: 'fixture-receipt' });
    const stop = await startEstimateEmails(db);
    await vi.advanceTimersByTimeAsync(0);
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({
      to: mail.to, replyTo: mail.replyTo, idempotencyKey: `estimate-delivery-${mail.id}`,
      attachments: [expect.objectContaining({ cid: 'salesmora-logo', contentDisposition: 'inline' })],
    }), 'http://127.0.0.1:3000', queuedAt);
    await stop();
  });
  it.each(["", Buffer.alloc(31).toString("base64")])("requires a valid recovery key before processing mail", async key => {
    vi.stubEnv("FILE_MASTER_KEY", key);
    await expect(startEstimateEmails(db)).rejects.toThrow("file-encryption key");
    expect(mocks.process).not.toHaveBeenCalled();
  });
  it("runs immediately and every five seconds, without overlapping or leaving work on shutdown", async () => {
    let complete!: (value: { sent: number; failed: number; retryPending: number }) => void;
    mocks.process.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const stop = await startEstimateEmails(db);
    expect(mocks.process).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(mocks.process).toHaveBeenCalledOnce();
    let stopped = false;
    const stopping = stop().then(() => { stopped = true; });
    await Promise.resolve(); expect(stopped).toBe(false);
    complete({ sent: 1, failed: 0, retryPending: 0 });
    await stopping;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(mocks.process).toHaveBeenCalledOnce();
  });
  it("reports only safe failure metadata and continues subsequent ticks", async () => {
    mocks.process.mockRejectedValueOnce(new Error("PRIVATE SMTP data"));
    const stop = await startEstimateEmails(db);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(console.error).toHaveBeenCalledWith('{"event":"worker.estimate_delivery_error"}');
    expect(mocks.process).toHaveBeenCalledTimes(2);
    await stop();
  });
});
