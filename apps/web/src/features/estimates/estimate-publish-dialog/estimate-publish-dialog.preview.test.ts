import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses } from "../estimate-preview.types";
import type { EstimateSharingReview } from "../estimate-sharing-review";
import { estimatePublishDialogData as c, estimatePublishFixture as estimate, estimatePublishReceiptFixture as receipt } from "./estimate-publish-dialog.data";
import { canCopyPublishedEstimate, isEstimatePublicationCurrent, reviewEstimatePublish } from "./estimate-publish-dialog.preview";

const input: EstimateSharingReview & { capabilities: typeof roles.owner } = {
  estimate, capabilities: roles.owner, today: "2026-10-22", readiness: { state: "ready" },
  preview: { state: "ready", estimateId: estimate.id, version: estimate.version, snapshotHash: "sample-content-hash" },
};
const published = { ...estimate, status: "published" as const, version: receipt.version };
const link = { state: "active" as const, expiresAt: "2026-11-19T04:59:59Z", firstViewedAt: null };

describe("Publish review readiness", () => {
  it("sends only record/version/content binding, never delivery email or subject", () => {
    const result = reviewEstimatePublish(input);
    expect(result).toEqual({ issues: [], request: {
      estimateId: estimate.id, expectedVersion: estimate.version, snapshotHash: "sample-content-hash",
    } });
    const extraEmail = { ...estimate, recipientEmail: "not-an-email" };
    expect(reviewEstimatePublish({ ...input, estimate: extraEmail })).toEqual(result);
  });
  it.each(["owner", "admin", "office", "field"] as const)("accepts scoped %s publish grants", (role) => {
    expect(reviewEstimatePublish({ ...input, capabilities: roles[role] }).request).not.toBeNull();
  });
  it.each(estimateStatuses)("only allows Draft publication, not %s", (status) => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, status } }).request !== null).toBe(status === "draft");
  });
  it.each(estimateStatuses)("blocks archived %s", (status) => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, status, archived: true } })).toMatchObject({ request: null });
  });
  it("read loss hides private blockers and preview errors", () => {
    expect(reviewEstimatePublish({
      ...input, capabilities: { ...roles.owner, read: false },
      readiness: { state: "blocked", issues: [c.stories.profileIssue] }, preview: { state: "error", message: "Private preview failure" },
    })).toEqual({ request: null, issues: [c.errors.read] });
  });
  it("requires send independently from update", () => {
    expect(reviewEstimatePublish({ ...input, capabilities: { ...roles.owner, send: false } }).issues).toContain(c.errors.permission);
    expect(reviewEstimatePublish({ ...input, capabilities: { ...roles.owner, update: false } }).request).not.toBeNull();
  });
  it.each([{ issues: [] }, { issues: [""] }, { issues: [" ", ""] }])("blocked readiness never becomes successful with $issues", ({ issues }) => {
    expect(reviewEstimatePublish({ ...input, readiness: { state: "blocked", issues } })).toMatchObject({ request: null, issues: [c.errors.readiness] });
  });
  it("preserves real host blockers", () => {
    expect(reviewEstimatePublish({ ...input, readiness: { state: "blocked", issues: [c.stories.itemsIssue, c.stories.profileIssue] } }))
      .toEqual({ request: null, issues: [c.stories.itemsIssue, c.stories.profileIssue] });
  });
  it.each([null, -1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid totals %j", (totalCents) => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, totalCents } }).issues).toContain(c.errors.total);
  });
  it.each([0, 2_000_000_000])("allows legitimate zero and maximum calculated total %s", (totalCents) => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, totalCents } }).request).not.toBeNull();
  });
  it.each(["", "0000-01-01", "2026-02-30", "2026-10-22T00:00:00Z"])("rejects malformed validity %j", (validUntil) => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, validUntil } }).issues).toContain(c.errors.date);
  });
  it("uses workspace-local today and keeps the selected day inclusive", () => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, validUntil: input.today } }).request).not.toBeNull();
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, validUntil: "2026-10-21" } }).issues).toContain(c.errors.past);
    expect(reviewEstimatePublish({ ...input, today: "2026-02-30" }).issues).toContain(c.errors.today);
  });
  it.each([{ name: "" }, { name: "x".repeat(121) }, { recipientName: " " }])("rejects missing/invalid customer content %j", (patch) => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, ...patch } }).request).toBeNull();
  });
  it.each([{ id: "" }, { number: "" }, { revision: 0 }, { revision: 1.5 }, { version: 0 }])("rejects invalid saved metadata %j", (patch) => {
    expect(reviewEstimatePublish({ ...input, estimate: { ...estimate, ...patch } }).issues).toContain(c.errors.record);
  });
  it("blocks missing preview", () => {
    expect(reviewEstimatePublish({ ...input, preview: null })).toEqual({ request: null, issues: [c.errors.previewMissing] });
  });
  it.each(["loading", "error", "stale"] as const)("blocks a %s preview", (state) => {
    expect(reviewEstimatePublish({ ...input, preview: { state } }).request).toBeNull();
  });
  it.each([{ estimateId: "other" }, { version: 3 }, { version: 5 }, { snapshotHash: " " }])("blocks mismatched preview %j", (patch) => {
    expect(reviewEstimatePublish({ ...input, preview: { state: "ready", estimateId: estimate.id, version: estimate.version, snapshotHash: "sample-content-hash", ...patch } }))
      .toEqual({ request: null, issues: [c.errors.previewStale] });
  });
  it("does not mutate any supplied state", () => {
    const before = structuredClone(input);
    reviewEstimatePublish(input);
    expect(input).toEqual(before);
  });
});

describe("Host-confirmed publication and authorized link copying", () => {
  it("requires host replacement with a matching Published record and receipt", () => {
    expect(isEstimatePublicationCurrent(estimate, receipt)).toBe(false);
    expect(isEstimatePublicationCurrent(published, receipt)).toBe(true);
  });
  it.each(estimateStatuses)("does not treat %s as a new publication result", (status) => {
    expect(isEstimatePublicationCurrent({ ...published, status }, receipt)).toBe(status === "published");
  });
  it.each([{ estimateId: "other" }, { version: 4 }, { version: 6 }, { version: 0 }, { snapshotHash: "" }])("rejects a mismatched receipt %j", (patch) => {
    expect(isEstimatePublicationCurrent(published, { ...receipt, ...patch })).toBe(false);
    expect(canCopyPublishedEstimate({ estimate: published, receipt: { ...receipt, ...patch }, link, capabilities: roles.owner })).toBe(false);
  });
  it.each(["not-created", "expired", "revoked", "replaced", "unavailable"] as const)("never copies %s links", (state) => {
    expect(canCopyPublishedEstimate({ estimate: published, receipt, link: { ...link, state }, capabilities: roles.owner })).toBe(false);
  });
  it("never allows copying after archive or read loss", () => {
    expect(canCopyPublishedEstimate({ estimate: { ...published, archived: true }, receipt, link, capabilities: roles.owner })).toBe(false);
    expect(canCopyPublishedEstimate({ estimate: published, receipt, link, capabilities: { ...roles.owner, read: false } })).toBe(false);
  });
  it("allows an authorized reader to copy after losing send permission", () => {
    expect(canCopyPublishedEstimate({ estimate: published, receipt, link, capabilities: { ...roles.owner, send: false } })).toBe(true);
  });
});
