import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateDecisionDialogData as dialog } from "../estimate-decision-dialog/estimate-decision-dialog.data";
import type { EstimateDecisionMode, EstimateDecisionValues } from "../estimate-decision-dialog/estimate-decision-dialog.preview";
import {
  estimateDecisionCardContextFixture, estimateDecisionCardData as c, estimateDecisionProposalFixture,
} from "./estimate-decision-card.data";
import { estimateDecisionCardRequest, reviewEstimateDecisionCard } from "./estimate-decision-card.preview";
import type { EstimateDecisionCardContext, EstimateDecisionCardProps } from "./estimate-decision-card.types";

function fixture(mode: EstimateDecisionMode = "record"): EstimateDecisionCardProps & { context: EstimateDecisionCardContext } {
  const proposal = estimateDecisionProposalFixture(mode);
  return {
    proposal, context: estimateDecisionCardContextFixture(proposal), capabilities: { ...roles.owner },
    parentAccess: true, canCorrectDecision: true,
  };
}
function review(input: EstimateDecisionCardProps) {
  return reviewEstimateDecisionCard(input, Date.parse(input.proposal.createdAt));
}
function values(input: ReturnType<typeof fixture>, patch: Partial<EstimateDecisionValues>) {
  Object.assign(input.proposal.value, patch);
  Object.assign(input.context.value, patch);
}
describe("assistant Decision proposal review", () => {
  it.each(["record", "correct"] as const)("permits a bound %s with the exact frozen amount", (mode) => {
    const input = fixture(mode);
    expect(review(input)).toMatchObject({ visible: true, canConfirm: true, canCancel: true, issues: [] });
    expect(input.proposal.estimate.totalCents).toBe(96917);
  });
  it.each(["accepted", "declined"] as const)("records an explicit %s response", (outcome) => {
    const input = fixture(); values(input, { outcome });
    expect(review(input).canConfirm).toBe(true);
  });
  it.each(["email", "phone", "in-person", "other"] as const)("supports explicit %s provenance", (channel) => {
    const input = fixture(); values(input, { channel });
    expect(review(input).canConfirm).toBe(true);
  });
  it.each(["sent", "published"] as const)("records a decision on a %s estimate", (status) => {
    const input = fixture(); input.proposal.estimate.status = status; input.context.estimate.status = status;
    expect(review(input).canConfirm).toBe(true);
  });
  it.each(["draft", "accepted", "declined", "expired", "superseded", "void"] as const)("cannot initially record a decision on %s", (status) => {
    const input = fixture(); input.proposal.estimate.status = status; input.context.estimate.status = status;
    expect(review(input).canConfirm).toBe(false);
  });
  it.each(["read", "parent", "forbidden"] as const)("removes private errors after %s access loss", (kind) => {
    const input = fixture("correct"); values(input, { reason: "x".repeat(501) });
    if (kind === "read") input.capabilities.read = false;
    if (kind === "parent") input.parentAccess = false;
    if (kind === "forbidden") input.proposal.state = "forbidden";
    expect(review(input)).toMatchObject({ visible: false, issues: [c.unavailable], canConfirm: false, canCancel: false });
  });
  it("requires decision permission, not update or send", () => {
    const input = fixture(); input.capabilities.decide = false;
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: true });
    expect(review(input).issues).toContain(dialog.errors.permission);
    input.capabilities.decide = true; input.capabilities.update = false; input.capabilities.send = false;
    expect(review(input).canConfirm).toBe(true);
  });
  it.each(["owner", "admin", "office", "field"] as const)("uses current scoped %s grants", (role) => {
    const input = fixture(); input.capabilities = roles[role]; input.canCorrectDecision = role !== "field";
    expect(review(input).canConfirm).toBe(true);
  });
  it("requires the separate correction grant, even with decide permission", () => {
    const input = fixture("correct"); input.canCorrectDecision = false;
    expect(review(input).canConfirm).toBe(false);
    expect(review(input).issues).toContain(dialog.errors.correctionPermission);
  });
  it("does not allow Field correction without the host-derived grant", () => {
    const input = fixture("correct"); input.capabilities = roles.field; input.canCorrectDecision = false;
    expect(review(input).canConfirm).toBe(false);
  });
  it.each(["proposalId", "inputHash", "authorizationVersion"] as const)("rejects changed host %s", (key) => {
    const input = fixture(); input.context[key] = "different";
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
    expect(review(input).issues).toContain(c.errors.binding);
  });
  it("rejects a changed proposal mode", () => {
    const input = fixture(); input.context.mode = "correct";
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it.each([
    { id: "other" }, { version: 6 }, { number: "EST-9999" }, { revision: 2 }, { name: "Changed" },
    { recipientName: "Changed" }, { totalCents: 96918 }, { status: "published" as const }, { archived: true },
  ])("binds every displayed record field: %j", (patch) => {
    const input = fixture(); Object.assign(input.context.estimate, patch);
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it.each([
    { outcome: "declined" }, { decisionDate: "2026-10-22" }, { channel: "email" }, { note: "Changed" },
  ] as const)("binds proposed decision values: %j", (patch) => {
    const input = fixture(); Object.assign(input.context.value, patch);
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it("binds the correction reason", () => {
    const input = fixture("correct"); input.context.value.reason = "Changed reason";
    expect(review(input).issues).toContain(c.errors.binding);
  });
  it("invalidates changed existing decisions even without a version increment", () => {
    const input = fixture("correct");
    if (!input.context.estimate.decision) throw Error("Expected existing decision");
    input.context.estimate.decision.note = "Another existing decision";
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it("uses an explicit record/value identity, not object insertion order", () => {
    const input = fixture("correct");
    const { decision, ...record } = input.context.estimate;
    const { note, ...value } = input.context.value;
    input.context.estimate = { decision, ...record };
    input.context.value = { note, ...value };
    expect(review(input).canConfirm).toBe(true);
  });
  it.each([null, "f".repeat(64), ""])("rejects a missing/changed snapshot %s", (snapshotHash) => {
    const input = fixture(); input.context.snapshotHash = snapshotHash;
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
    expect(review(input).issues).toContain(c.errors.snapshot);
  });
  it("blocks missing host context", () => {
    const input = fixture();
    expect(review({ ...input, context: null })).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it.each(["id", "inputHash", "authorizationVersion", "snapshotHash"] as const)("rejects missing proposal %s", (key) => {
    const input = fixture(); input.proposal[key] = "";
    expect(review(input).issues).toContain(c.errors.metadata);
  });
  it.each(["not-hash", "e".repeat(63), "G".repeat(64)])("rejects malformed hash %s", (hash) => {
    const input = fixture(); input.proposal.inputHash = hash; input.context.inputHash = hash;
    expect(review(input).canConfirm).toBe(false);
  });
  it.each([0, -1, 1.5, NaN])("rejects invalid saved version %s", (version) => {
    const input = fixture(); input.proposal.estimate.version = version; input.context.estimate.version = version;
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it.each([
    { outcome: "" }, { channel: "" }, { decisionDate: "" }, { decisionDate: "2026-02-30" },
    { decisionDate: "2026-10-24" }, { note: "x".repeat(501) }, { estimateId: "other" }, { expectedVersion: 6 },
  ] satisfies Partial<EstimateDecisionValues>[])("blocks incomplete/invalid decision values: %j", (patch) => {
    const input = fixture(); values(input, patch);
    expect(review(input).canConfirm).toBe(false);
  });
  it("allows an empty optional note and maximum-length notes/reasons", () => {
    const input = fixture(); values(input, { note: "" });
    expect(review(input).canConfirm).toBe(true);
    const correction = fixture("correct"); values(correction, { note: "x".repeat(500), reason: "x".repeat(500) });
    expect(review(correction).canConfirm).toBe(true);
  });
  it.each(["", " ", "x".repeat(501)])("requires a bounded correction reason", (reason) => {
    const input = fixture("correct"); values(input, { reason });
    expect(review(input).issues).toContain(dialog.errors.reason);
  });
  it("binds date interpretation to the host workspace date and timezone", () => {
    const input = fixture(); input.context.today = "2026-10-22";
    expect(review(input).issues).toContain(dialog.errors.future);
    input.context.today = "";
    expect(review(input).issues).toContain(dialog.errors.today);
    input.context.timezone = "invalid-timezone";
    expect(review(input).issues).toContain(dialog.errors.timezone);
  });
  it("allows past real dates and never resolves relative dates itself", () => {
    const input = fixture(); values(input, { decisionDate: "2024-02-29" });
    expect(review(input).canConfirm).toBe(true);
    values(input, { decisionDate: "yesterday" });
    expect(review(input).canConfirm).toBe(false);
  });
  it.each(["record", "correct"] as const)("blocks archived records in %s mode", (mode) => {
    const input = fixture(mode); input.proposal.estimate.archived = true; input.context.estimate.archived = true;
    expect(review(input).issues).toContain(dialog.errors.archived);
  });
  it("requires a consistent existing decision for correction", () => {
    const input = fixture("correct"); input.proposal.estimate.decision = null; input.context.estimate.decision = null;
    expect(review(input).issues).toContain(dialog.errors.previous);
  });
  it("does not record a second initial decision", () => {
    const input = fixture(); const prior = fixture("correct").proposal.estimate.decision;
    input.proposal.estimate.decision = prior; input.context.estimate.decision = prior;
    expect(review(input).issues).toContain(dialog.errors.previous);
  });
  it("binds confirmation to the exact 15-minute deadline", () => {
    const input = fixture(), now = Date.parse(input.proposal.createdAt);
    expect(reviewEstimateDecisionCard(input, now + 899999).canConfirm).toBe(true);
    expect(reviewEstimateDecisionCard(input, now + 900000)).toMatchObject({ canConfirm: false, canCancel: false, expired: true });
    input.proposal.expiresAt = new Date(now + 900001).toISOString();
    expect(review(input).canConfirm).toBe(false);
  });
  it.each(["invalid", "2026-02-30T00:00:00.000Z"])("rejects invalid expiration %s", (expiresAt) => {
    const input = fixture(); input.proposal.expiresAt = expiresAt;
    expect(review(input).canConfirm).toBe(false);
  });
  it("blocks reversed windows, future-created proposals and nonfinite clocks", () => {
    const input = fixture(), now = Date.parse(input.proposal.createdAt);
    expect(reviewEstimateDecisionCard(input, now - 1).canConfirm).toBe(false);
    expect(reviewEstimateDecisionCard(input, NaN).canConfirm).toBe(false);
    input.proposal.expiresAt = input.proposal.createdAt;
    expect(review(input).canConfirm).toBe(false);
  });
  it.each(["confirmed", "cancelled", "expired", "superseded", "conflict", "forbidden"] as const)("cannot reconfirm a %s proposal", (state) => {
    const input = fixture(); input.proposal.state = state;
    expect(review(input)).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it("requests only metadata for the stored proposal, never client-edited decision data", () => {
    const { proposal } = fixture("correct");
    expect(estimateDecisionCardRequest(proposal)).toEqual({
      proposalId: proposal.id, actionType: "estimate.decision", inputHash: proposal.inputHash,
      authorizationVersion: proposal.authorizationVersion, estimateId: "estimate-2048",
      expectedVersion: 6, snapshotHash: proposal.snapshotHash,
    });
  });
});
