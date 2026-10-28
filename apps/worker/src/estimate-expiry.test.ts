import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Knex } from "@salesmora/data";

const mocks = vi.hoisted(() => ({ expire: vi.fn(), reminders: vi.fn() }));
vi.mock("@salesmora/data", () => ({
  expireEstimates: mocks.expire,
  scheduleEstimateReminders: mocks.reminders,
}));
import { startEstimateExpiry } from "./estimate-expiry";

const hasTable = vi.fn();
const db = {} as Knex;
Object.assign(db, { schema: { hasTable } });

describe("scheduled estimate expiry worker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    hasTable.mockResolvedValue(true);
    mocks.expire.mockResolvedValue({ expired: 0 });
    mocks.reminders.mockResolvedValue({ reminders: 0 });
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetAllMocks();
    vi.unstubAllEnvs();
  });

  it.each(["estimates", "estimate_activity", "estimate_deliveries", "estimateNotifications"])("refuses startup without %s", async missing => {
    hasTable.mockImplementation(async table => table !== missing);
    await expect(startEstimateExpiry(db)).rejects.toThrow("Apply estimate migrations");
    expect(mocks.expire).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("runs immediately and once per minute, passing no browser or process date", async () => {
    const stop = await startEstimateExpiry(db);
    expect(mocks.expire).toHaveBeenCalledExactlyOnceWith(db);
    expect(mocks.reminders).toHaveBeenCalledExactlyOnceWith(db);
    expect(console.log).toHaveBeenCalledWith('{"event":"worker.estimate_expiry_started","intervalMs":60000}');
    await vi.advanceTimersByTimeAsync(59_999);
    expect(mocks.expire).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect(mocks.expire).toHaveBeenCalledTimes(2);
    expect(mocks.reminders).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mocks.expire).toHaveBeenCalledTimes(3);
    await stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not overlap batches and resumes on the next interval after completion", async () => {
    let complete!: (result: { expired: number }) => void;
    mocks.expire.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const stop = await startEstimateExpiry(db);
    await vi.advanceTimersByTimeAsync(180_000);
    expect(mocks.expire).toHaveBeenCalledOnce();
    complete({ expired: 100 });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mocks.expire).toHaveBeenCalledTimes(2);
    expect(mocks.reminders).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith('{"event":"worker.estimate_expiry_completed","expired":100,"reminders":0}');
    await stop();
  });

  it("waits for an active sweep during shutdown and never runs again after stopping", async () => {
    let complete!: (result: { expired: number }) => void;
    mocks.expire.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const stop = await startEstimateExpiry(db);
    let stopped = false;
    const stopping = stop().then(() => { stopped = true; });
    await vi.advanceTimersByTimeAsync(180_000);
    expect(stopped).toBe(false);
    expect(mocks.expire).toHaveBeenCalledOnce();
    complete({ expired: 1 });
    await stopping;
    await stop();
    await vi.advanceTimersByTimeAsync(180_000);
    expect(mocks.expire).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("logs sanitized failure metadata and retries at the next interval", async () => {
    mocks.expire.mockRejectedValueOnce(new Error("PRIVATE database connection and estimate payload"));
    const stop = await startEstimateExpiry(db);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(console.error).toHaveBeenCalledExactlyOnceWith('{"event":"worker.estimate_expiry_error"}');
    expect(mocks.expire).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledExactlyOnceWith('{"event":"worker.estimate_expiry_started","intervalMs":60000}');
    await stop();
  });

  it("settles shutdown after a failed in-flight sweep without leaking its error", async () => {
    let fail!: (error: Error) => void;
    mocks.expire.mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }));
    const stop = await startEstimateExpiry(db);
    const stopping = stop();
    fail(new Error("PRIVATE failure"));
    await expect(stopping).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith('{"event":"worker.estimate_expiry_error"}');
    expect(vi.getTimerCount()).toBe(0);
  });

  it("is independent of Mailpit, sharing, encryption and embedding settings", async () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://app.example.test");
    vi.stubEnv("EMAIL_PROVIDER", "disabled");
    vi.stubEnv("FILE_MASTER_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("WORKER_TASKS", "retention");
    const stop = await startEstimateExpiry(db);
    expect(mocks.expire).toHaveBeenCalledExactlyOnceWith(db);
    await stop();
  });

  it("catches up immediately after restart without retaining the previous timer", async () => {
    const firstStop = await startEstimateExpiry(db);
    await firstStop();
    expect(vi.getTimerCount()).toBe(0);
    const secondStop = await startEstimateExpiry(db);
    expect(mocks.expire).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mocks.expire).toHaveBeenCalledTimes(3);
    await secondStop();
    expect(vi.getTimerCount()).toBe(0);
  });
});
