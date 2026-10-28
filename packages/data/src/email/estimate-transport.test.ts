import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const smtp = vi.hoisted(() => ({ sendMail: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => smtp } }));
import { localEstimateEmailDeliveryAvailable, sendLocalEstimateEmail } from "./transport";

const id = "estimate-delivery-12345678-1234-1234-1234-123456789abc";
const messageId = `${id}@salesmora.test`;
const origin = "http://127.0.0.1:3000";
const mail = {
  to: "fixture@example.test", subject: "Fixture estimate", text: "Fictional estimate", html: "<p>Fixture</p>",
  replyTo: "business@example.test", idempotencyKey: id,
};
const lookup = vi.fn();
beforeEach(() => {
  vi.stubEnv("EMAIL_PROVIDER", "mailpit");
  vi.stubGlobal("fetch", lookup);
  lookup.mockResolvedValue(new Response(JSON.stringify({ messages_count: 0, messages: [], total: 99 })));
  smtp.sendMail.mockResolvedValue({ messageId: `<${messageId}>` });
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("local-only estimate email adapter", () => {
  it("looks up the stable message ID before SMTP and preserves reply-to and receipt", async () => {
    expect(await sendLocalEstimateEmail(mail, origin)).toEqual({ providerMessageId: `<${messageId}>` });
    const [url, options] = lookup.mock.calls[0];
    expect(url.origin).toBe("http://127.0.0.1:18025");
    expect(url.searchParams.get("query")).toBe(`message-id:${messageId}`);
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(smtp.sendMail).toHaveBeenCalledWith(expect.objectContaining({ messageId: `<${messageId}>`, replyTo: mail.replyTo }));
  });
  it.each([messageId, `<${messageId}>`])("recovers a previous acceptance without another SMTP send: %s", async found => {
    lookup.mockResolvedValue(new Response(JSON.stringify({ messages_count: 1, messages: [{ MessageID: found }] })));
    expect(await sendLocalEstimateEmail(mail, origin)).toEqual({ providerMessageId: `<${messageId}>` });
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });
  it.each([
    {}, { messages: [] }, { messages_count: 1, messages: [] },
    { messages_count: 1, messages: [{}] },
    { messages_count: 1, messages: [{ MessageID: "other-id" }] },
  ])("fails closed on ambiguous or malformed lookup %j", async result => {
    lookup.mockResolvedValue(new Response(JSON.stringify(result)));
    await expect(sendLocalEstimateEmail(mail, origin)).rejects.toThrow("temporarily unavailable");
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });
  it("does not send when Mailpit lookup fails", async () => {
    lookup.mockRejectedValue(new Error("Private provider details"));
    await expect(sendLocalEstimateEmail(mail, origin)).rejects.toThrow("temporarily unavailable");
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });
  it("bounds SMTP failure and never exposes its details", async () => {
    smtp.sendMail.mockRejectedValue(new Error("Private recipient and provider details"));
    await expect(sendLocalEstimateEmail(mail, origin)).rejects.toThrow("Local estimate email delivery is temporarily unavailable.");
  });
  it("refuses nonlocal origins, non-Mailpit providers and invalid delivery IDs before IO", async () => {
    for (const value of ["https://app.example.test", "ftp://localhost", "http://user:pw@localhost"]) {
      expect(localEstimateEmailDeliveryAvailable(value)).toBe(false);
      await expect(sendLocalEstimateEmail(mail, value)).rejects.toThrow("requires local");
    }
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    await expect(sendLocalEstimateEmail(mail, origin)).rejects.toThrow("requires local");
    vi.stubEnv("EMAIL_PROVIDER", "mailpit");
    await expect(sendLocalEstimateEmail({ ...mail, idempotencyKey: "unstable" }, origin)).rejects.toThrow("requires local");
    expect(lookup).not.toHaveBeenCalled(); expect(smtp.sendMail).not.toHaveBeenCalled();
  });
});
