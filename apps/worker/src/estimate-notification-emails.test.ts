import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Knex } from "@salesmora/data";

const mocks = vi.hoisted(() => ({
  process: vi.fn(),
  send: vi.fn(),
  render: vi.fn(),
  readFile: vi.fn(),
}));
vi.mock("@salesmora/data", () => ({ processEstimateNotificationEmails: mocks.process }));
vi.mock("@salesmora/data/email/transport", () => ({ sendEmail: mocks.send }));
vi.mock("@salesmora/data/email/estimate-notification", () => ({
  renderEstimateNotificationEmail: mocks.render,
}));
vi.mock("node:fs/promises", () => ({ readFile: mocks.readFile }));
import { startEstimateNotificationEmails } from "./estimate-notification-emails";

const hasTable = vi.fn();
const db = {} as Knex;
Object.assign(db, { schema: { hasTable } });

describe("Estimate notification email worker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("BETTER_AUTH_URL", "http://127.0.0.1:3000");
    hasTable.mockResolvedValue(true);
    mocks.readFile.mockResolvedValue(Buffer.from("fixture logo"));
    mocks.render.mockReturnValue({ subject: "Estimate update", text: "minimal", html: "<p>minimal</p>" });
    mocks.send.mockResolvedValue({ providerMessageId: "mailpit-id" });
    mocks.process.mockResolvedValue({ sent: 0, skipped: 0, retryPending: 0, failed: 0 });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("requires the notification migration and application origin", async () => {
    hasTable.mockResolvedValue(false);
    await expect(startEstimateNotificationEmails(db)).rejects.toThrow("migrations");
    expect(mocks.process).not.toHaveBeenCalled();
    hasTable.mockResolvedValue(true);
    vi.stubEnv("BETTER_AUTH_URL", "");
    await expect(startEstimateNotificationEmails(db)).rejects.toThrow("app origin");
    expect(mocks.process).not.toHaveBeenCalled();
  });

  it("runs immediately, avoids overlapping batches and waits on shutdown", async () => {
    let complete!: (value: { sent: number; skipped: number; retryPending: number; failed: number }) => void;
    mocks.process.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const stop = await startEstimateNotificationEmails(db);
    expect(mocks.process).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(mocks.process).toHaveBeenCalledOnce();
    let stopped = false;
    const stopping = stop().then(() => { stopped = true; });
    await Promise.resolve();
    expect(stopped).toBe(false);
    complete({ sent: 1, skipped: 0, retryPending: 0, failed: 0 });
    await stopping;
    await vi.advanceTimersByTimeAsync(5_000);
    expect(mocks.process).toHaveBeenCalledOnce();
  });

  it("does not log provider errors or recipient data", async () => {
    mocks.process.mockRejectedValueOnce(new Error("PRIVATE recipient and provider response"));
    const stop = await startEstimateNotificationEmails(db);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(console.error).toHaveBeenCalledWith(
      '{"event":"worker.estimate_notification_email_error"}',
    );
    await stop();
  });
});
