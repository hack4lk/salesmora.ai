import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses } from "../estimate-preview.types";
import { estimateVoidDialogData as c, estimateVoidFixture as estimate } from "./estimate-void-dialog.data";
import { initialEstimateVoidValues, reviewEstimateVoid, type EstimateVoidReviewInput } from "./estimate-void-dialog.preview";

const input: EstimateVoidReviewInput = {
  estimate, capabilities: roles.owner, value: { ...initialEstimateVoidValues(estimate), reason: c.stories.reason },
};

describe("Void review authorization and lifecycle", () => {
  it("defaults to an empty required reason, bound to the reviewed estimate/version", () => {
    expect(initialEstimateVoidValues(estimate)).toEqual({ estimateId: estimate.id, expectedVersion: estimate.version, reason: "" });
  });
  it.each(estimateStatuses)("withdraws only Sent/Published, not %s", (status) => {
    expect(reviewEstimateVoid({ ...input, estimate: { ...estimate, status } }).request !== null).toBe(["sent", "published"].includes(status));
  });
  it.each(estimateStatuses)("rejects archived %s records", (status) => {
    const result = reviewEstimateVoid({ ...input, estimate: { ...estimate, status, archived: true } });
    expect(result.issues).toContain(c.errors.archived);
    expect(result.request).toBeNull();
  });
  it.each(["owner", "admin", "office"] as const)("allows the host-scoped %s void grant", (role) => {
    expect(reviewEstimateVoid({ ...input, capabilities: roles[role] }).request).not.toBeNull();
  });
  it("blocks Field, even on an otherwise readable estimate", () => {
    expect(reviewEstimateVoid({ ...input, capabilities: roles.field }).issues).toContain(c.errors.permission);
    expect(reviewEstimateVoid({ ...input, capabilities: roles.field }).request).toBeNull();
  });
  it("requires void, not update, send or decide", () => {
    expect(reviewEstimateVoid({ ...input, capabilities: { ...roles.owner, void: false } }).request).toBeNull();
    expect(reviewEstimateVoid({ ...input, capabilities: { ...roles.owner, update: false, send: false, decide: false } }).request).not.toBeNull();
  });
  it("requires read even when void is granted and hides all other validation information", () => {
    expect(reviewEstimateVoid({
      ...input, capabilities: { ...roles.owner, read: false },
      estimate: { ...estimate, name: "", status: "accepted", archived: true }, value: { ...input.value, reason: "" },
    })).toEqual({ issues: [c.errors.read], fieldErrors: {}, eligible: false, request: null });
  });
});

describe("Required staff reason and exact request", () => {
  it.each(["", " ", "\n\t", "x".repeat(501), ` ${"x".repeat(499)} `])("rejects blank or raw over-limit reason %j", (reason) => {
    const result = reviewEstimateVoid({ ...input, value: { ...input.value, reason } });
    expect(result.request).toBeNull();
    expect(result.fieldErrors.reason).toBe(c.errors.reason);
  });
  it.each([1, 499, 500])("allows exactly %i raw characters", (length) => {
    expect(reviewEstimateVoid({ ...input, value: { ...input.value, reason: "x".repeat(length) } }).request?.reason).toHaveLength(length);
  });
  it("trims only outer whitespace and preserves literal multiline content", () => {
    expect(reviewEstimateVoid({ ...input, value: { ...input.value, reason: ` \n${c.stories.literal}\t ` } }).request).toEqual({
      estimateId: estimate.id, expectedVersion: estimate.version, reason: c.stories.literal,
    });
  });
  it("does not forward additional client values or grants", () => {
    const value = { ...input.value, totalCents: 0, status: "void", capabilities: roles.owner };
    expect(reviewEstimateVoid({ ...input, value }).request).toEqual({
      estimateId: estimate.id, expectedVersion: estimate.version, reason: c.stories.reason,
    });
  });
  it("does not mutate the original record or form values", () => {
    const before = structuredClone(input);
    reviewEstimateVoid(input);
    expect(input).toEqual(before);
  });
});

describe("Record/version binding", () => {
  it.each([
    { estimateId: "another-estimate" }, { estimateId: "" }, { expectedVersion: 4 }, { expectedVersion: 6 },
    { expectedVersion: Number.NaN }, { expectedVersion: 5.5 },
  ])("rejects stale or mismatched controlled values %j", (patch) => {
    const result = reviewEstimateVoid({ ...input, value: { ...input.value, ...patch } });
    expect(result.request).toBeNull();
    expect(result.issues).toContain(c.errors.binding);
  });
  it("requires explicit host rebinding after a version refresh and retains the supplied reason", () => {
    const next = { ...estimate, version: estimate.version + 1 };
    expect(reviewEstimateVoid({ ...input, estimate: next }).request).toBeNull();
    expect(reviewEstimateVoid({ ...input, estimate: next, value: { ...input.value, expectedVersion: next.version } }).request)
      .toEqual({ ...input.value, expectedVersion: next.version });
  });
  it.each([
    { id: "" }, { id: " " }, { number: "" }, { name: " " }, { name: "x".repeat(121) }, { recipientName: "" },
    { revision: 0 }, { revision: -1 }, { revision: 1.5 }, { revision: Number.NaN }, { revision: Number.MAX_SAFE_INTEGER + 1 },
    { version: 0 }, { version: -1 }, { version: 1.5 }, { version: Number.NaN }, { version: Number.MAX_SAFE_INTEGER + 1 },
  ])("rejects invalid saved metadata %j", (patch) => {
    const result = reviewEstimateVoid({ ...input, estimate: { ...estimate, ...patch } });
    expect(result.request).toBeNull();
    expect(result.issues).toContain(c.errors.record);
  });
});
