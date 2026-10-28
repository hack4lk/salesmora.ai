import { describe, expect, it } from "vitest";
import { estimateDeliveryFixture as delivery } from "../estimate-delivery-card/estimate-delivery-card.data";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses } from "../estimate-preview.types";
import { estimateSendDialogData as c, estimateSendFixture as estimate } from "./estimate-send-dialog.data";
import { reviewEstimateSend, type EstimateSendReviewInput } from "./estimate-send-dialog.preview";

const input: EstimateSendReviewInput = {
  mode: "send", estimate, capabilities: roles.owner, today: "2026-10-22",
  subject: c.stories.subject, readiness: { state: "ready" },
  preview: { state: "ready", estimateId: estimate.id, version: estimate.version, snapshotHash: "sample-content-hash" },
};
const resend: EstimateSendReviewInput = {
  ...input, mode: "resend", estimate: { ...estimate, status: "sent" }, delivery,
  resendEmail: c.stories.correctedEmail,
};

describe("Estimate send review", () => {
  it("requires explicit readiness and binds a normalized request to the reviewed record", () => {
    const result = reviewEstimateSend(input);
    expect(result.issues).toEqual([]);
    expect(result.request).toEqual({
      mode: "send", estimateId: estimate.id, expectedVersion: estimate.version,
      snapshotHash: "sample-content-hash", recipientEmail: c.stories.email, subject: c.stories.subject,
    });
  });
  it.each(["owner", "admin", "office", "field"] as const)("respects scoped %s send grants", (role) => {
    expect(reviewEstimateSend({ ...input, capabilities: roles[role] }).request).not.toBeNull();
  });
  it.each(estimateStatuses)("only allows initial send from Draft, not %s", (status) => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, status } }).request !== null).toBe(status === "draft");
  });
  it.each(estimateStatuses)("never allows archived %s confirmation", (status) => {
    const result = reviewEstimateSend({ ...input, estimate: { ...estimate, status, archived: true } });
    expect(result.request).toBeNull();
    expect(result.issues).toContain(c.errors.archived);
  });
  it("hides all supplied issue text when read permission is lost", () => {
    expect(reviewEstimateSend({
      ...input, capabilities: { ...roles.owner, read: false }, readiness: { state: "blocked", issues: ["private business issue"] },
    })).toEqual({ issues: [c.errors.read], request: null });
  });
  it("requires send independently from update and read", () => {
    expect(reviewEstimateSend({ ...input, capabilities: { ...roles.owner, send: false } }).request).toBeNull();
    expect(reviewEstimateSend({ ...input, capabilities: { ...roles.owner, update: false } }).request).not.toBeNull();
  });
  it("shows explicit host readiness issues without inferring readiness from totals", () => {
    expect(reviewEstimateSend({ ...input, readiness: { state: "blocked", issues: [c.stories.itemsIssue, c.stories.profileIssue] } }))
      .toMatchObject({ issues: [c.stories.itemsIssue, c.stories.profileIssue], request: null });
  });
  it("does not accept an empty blocked-issues list as readiness", () => {
    expect(reviewEstimateSend({ ...input, readiness: { state: "blocked", issues: [] } }).issues).toContain(c.errors.readiness);
    expect(reviewEstimateSend({ ...input, readiness: { state: "blocked", issues: ["", " "] } }).issues).toContain(c.errors.readiness);
  });
  it.each(["", " ", "not-an-email", "a\nb@example.test", `${"x".repeat(250)}@test.example`])("rejects an invalid recipient %j", (recipientEmail) => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, recipientEmail } }))
      .toMatchObject({ emailError: c.errors.recipientEmail, request: null });
  });
  it("normalizes email through the established contact contract", () => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, recipientEmail: " Jordan.Lee@EXAMPLE.COM " } }).request?.recipientEmail).toBe("jordan.lee@example.com");
  });
  it.each([null, -1, 1.25, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects unavailable or invalid totals %j", (totalCents) => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, totalCents } }).issues).toContain(c.errors.total);
  });
  it.each([0, 2_000_000_000])("allows legitimate zero and maximum computed totals %s", (totalCents) => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, totalCents } }).request).not.toBeNull();
  });
  it.each(["", " ", "Subject\nBcc: other@example.test", "Subject\rInjection"])("rejects missing or multiline subjects %j", (subject) => {
    expect(reviewEstimateSend({ ...input, subject }).issues).toContain(c.errors.subject);
  });
  it.each(["", "0000-01-01", "2026-02-30", "2026-10-22T00:00:00Z"])("rejects invalid validity dates %j", (validUntil) => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, validUntil } }).issues).toContain(c.errors.date);
  });
  it("allows valid-until today, rejects yesterday, and requires real workspace today", () => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, validUntil: input.today } }).request).not.toBeNull();
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, validUntil: "2026-10-21" } }).issues).toContain(c.errors.past);
    expect(reviewEstimateSend({ ...input, today: "2026-02-30" }).issues).toContain(c.errors.today);
  });
  it.each(["", " ", "x".repeat(121)])("rejects an invalid estimate name %j", (name) => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, name } }).issues).toContain(c.errors.name);
  });
  it("accepts the established 120-character estimate-name limit", () => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, name: "x".repeat(120) } }).request).not.toBeNull();
  });
  it.each([
    { id: "" }, { number: "" }, { version: 0 }, { version: 1.5 },
    { revision: 0 }, { revision: NaN },
  ])("rejects unsaved or invalid record metadata %j", (patch) => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, ...patch } }).issues).toContain(c.errors.record);
  });
  it("requires a named recipient in the frozen customer details", () => {
    expect(reviewEstimateSend({ ...input, estimate: { ...estimate, recipientName: " " } }).issues).toContain(c.errors.recipientName);
  });
});

describe("Estimate preview binding", () => {
  it("blocks a missing preview", () => {
    expect(reviewEstimateSend({ ...input, preview: null })).toMatchObject({ issues: [c.errors.previewMissing], request: null });
  });
  it.each(["loading", "stale", "error"] as const)("blocks a %s preview", (state) => {
    expect(reviewEstimateSend({ ...input, preview: { state } }).request).toBeNull();
  });
  it.each([
    { estimateId: "another-estimate" }, { version: estimate.version - 1 },
    { version: estimate.version + 1 }, { snapshotHash: "" }, { snapshotHash: " " },
  ])("blocks wrong/stale/incomplete ready metadata %j", (patch) => {
    const preview = { state: "ready" as const, estimateId: estimate.id, version: estimate.version, snapshotHash: "sample-content-hash", ...patch };
    expect(reviewEstimateSend({ ...input, preview })).toMatchObject({ issues: [c.errors.previewStale], request: null });
  });
  it("does not silently replace a failed preview message", () => {
    expect(reviewEstimateSend({ ...input, preview: { state: "error", message: "Preview failed" } }).issues).toEqual(["Preview failed"]);
  });
});

describe("Estimate resend review", () => {
  it("corrects only the new destination; preserves frozen and delivery records", () => {
    const before = structuredClone(resend);
    const result = reviewEstimateSend(resend);
    expect(result.request).toMatchObject({ mode: "resend", recipientEmail: c.stories.correctedEmail, expectedVersion: estimate.version });
    expect(resend).toEqual(before);
    expect(resend.estimate.recipientEmail).toBe(c.stories.email);
    expect(resend.delivery?.email).toEqual(delivery.email);
  });
  it.each(estimateStatuses)("only resends from Sent, not %s", (status) => {
    expect(reviewEstimateSend({ ...resend, estimate: { ...estimate, status } }).request !== null).toBe(status === "sent");
  });
  it.each(["queued", "not-sent"] as const)("blocks resend with %s delivery", (state) => {
    const email = state === "not-sent" ? { state } : { state, recipientEmail: c.stories.email, updatedAt: "2026-10-22T18:00:00Z" };
    expect(reviewEstimateSend({ ...resend, delivery: { ...delivery, email } }).issues).toContain(c.errors.resendStatus);
  });
  it.each(["expired", "revoked", "replaced", "not-created", "unavailable"] as const)("blocks resend for a %s link", (state) => {
    expect(reviewEstimateSend({ ...resend, delivery: { ...delivery, link: { ...delivery.link, state } } }).issues).toContain(c.errors.resendStatus);
  });
  it("never substitutes the frozen email for an invalid or missing resend destination", () => {
    for (const resendEmail of ["", "invalid", undefined]) expect(reviewEstimateSend({ ...resend, resendEmail }).request).toBeNull();
  });
  it("blocks resend with unknown delivery state or host readiness errors", () => {
    expect(reviewEstimateSend({ ...resend, delivery: null }).request).toBeNull();
    expect(reviewEstimateSend({ ...resend, readiness: { state: "blocked", issues: [c.errors.readiness] } }).request).toBeNull();
  });
});
