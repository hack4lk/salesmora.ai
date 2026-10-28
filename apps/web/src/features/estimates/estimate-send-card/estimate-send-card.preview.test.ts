import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { estimateSendCardCapabilitiesFixture, estimateSendCardContextFixture, estimateSendCardData as c, estimateSendProposalFixture } from "./estimate-send-card.data";
import { estimateSendCardRequest, reviewEstimateSendCard } from "./estimate-send-card.preview";
import { estimateSendDialogData } from "../estimate-send-dialog/estimate-send-dialog.data";
import type { EstimateSendCardProps, EstimateSendCardContext } from "./estimate-send-card.types";

function fixture(): EstimateSendCardProps & { context: EstimateSendCardContext } {
  const proposal = estimateSendProposalFixture(), context = estimateSendCardContextFixture(proposal);
  context.preview = {
    state: "ready", estimateId: proposal.estimate.id, version: proposal.estimate.version,
    snapshotHash: proposal.snapshotHash, content: createElement("article", null, c.preview),
  };
  return { proposal, context, capabilities: { ...estimateSendCardCapabilitiesFixture }, parentAccess: true };
}
function review(value: EstimateSendCardProps) {
  return reviewEstimateSendCard(value, Date.parse(value.proposal.createdAt));
}
describe("assistant Send proposal review", () => {
  it("requires a current saved Draft, exact summary and ready customer preview", () => {
    const value = fixture();
    expect(review(value)).toMatchObject({ visible: true, canConfirm: true, canCancel: true, previewUsable: true, issues: [] });
    expect(value.proposal.estimate.totalCents).toBe(96917);
  });
  it("emits only immutable stored-proposal metadata, never email text or preview content", () => {
    const { proposal } = fixture();
    expect(estimateSendCardRequest(proposal)).toEqual({
      proposalId: proposal.id, actionType: "estimate.send", inputHash: proposal.inputHash,
      authorizationVersion: proposal.authorizationVersion, estimateId: "estimate-2048",
      expectedVersion: 3, snapshotHash: proposal.snapshotHash,
    });
  });
  it.each(["read", "parent", "forbidden"] as const)("suppresses private issue text after loss of %s access", (kind) => {
    const value = fixture();
    value.context.readiness = { state: "blocked", issues: [c.stories.profileIssue] };
    if (kind === "read") value.capabilities.read = false;
    if (kind === "parent") value.parentAccess = false;
    if (kind === "forbidden") value.proposal.state = "forbidden";
    expect(review(value)).toMatchObject({ visible: false, issues: [c.unavailable], canConfirm: false, canCancel: false, previewUsable: false });
  });
  it("blocks Send without send permission, but permits cancelling a current authorized proposal", () => {
    const value = fixture(); value.capabilities.send = false;
    expect(review(value)).toMatchObject({ canConfirm: false, canCancel: true });
    expect(review(value).issues).toContain(estimateSendDialogData.errors.permission);
  });
  it("does not require update/create permission for a saved Draft send", () => {
    const value = fixture(); value.capabilities.update = false; value.capabilities.create = false;
    expect(review(value).canConfirm).toBe(true);
  });
  it("requires explicit Save before requesting a refreshed Send proposal", () => {
    const value = fixture(); value.context.unsavedChanges = true;
    expect(review(value).canConfirm).toBe(false);
    expect(review(value).issues).toContain(c.errors.unsaved);
  });
  it.each(["proposalId", "inputHash", "authorizationVersion", "subject", "snapshotHash"] as const)("invalidates changed host %s", (field) => {
    const value = fixture(); value.context[field] = "different";
    expect(review(value)).toMatchObject({ canConfirm: false, canCancel: false, previewUsable: false });
    expect(review(value).issues).toContain(c.errors.binding);
  });
  it.each([
    { id: "other" }, { version: 4 }, { revision: 2 }, { number: "EST-9999" }, { name: "Changed" },
    { recipientName: "Another customer" }, { recipientEmail: "different@example.com" }, { validUntil: "2026-11-22" },
    { totalCents: 96918 }, { status: "sent" as const }, { archived: true },
  ])("invalidates any changed estimate summary: %j", (patch) => {
    const value = fixture(); Object.assign(value.context.estimate, patch);
    expect(review(value)).toMatchObject({ canConfirm: false, canCancel: false, previewUsable: false });
    expect(review(value).issues).toContain(c.errors.binding);
  });
  it("blocks a missing host binding", () => {
    const value = fixture();
    expect(review({ ...value, context: null })).toMatchObject({ canConfirm: false, canCancel: false, previewUsable: false });
  });
  it.each(["id", "inputHash", "authorizationVersion", "snapshotHash"] as const)("rejects missing proposal %s", (field) => {
    const value = fixture(); value.proposal[field] = "";
    expect(review(value).canConfirm).toBe(false);
    expect(review(value).issues).toContain(c.errors.metadata);
  });
  it.each(["invalid", "a".repeat(63), "G".repeat(64)])("rejects malformed content hashes: %s", (hash) => {
    const value = fixture(); value.proposal.inputHash = hash; value.context.inputHash = hash;
    expect(review(value).canConfirm).toBe(false);
  });
  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid saved version %s", (version) => {
    const value = fixture(); value.proposal.estimate.version = version; value.context.estimate.version = version;
    expect(review(value)).toMatchObject({ canConfirm: false, canCancel: false });
  });
  it.each(["sent", "published", "accepted", "declined", "expired", "superseded", "void"] as const)("cannot first-send a %s record", (status) => {
    const value = fixture(); value.proposal.estimate.status = status; value.context.estimate.status = status;
    expect(review(value).canConfirm).toBe(false);
  });
  it("cannot send an archived Draft", () => {
    const value = fixture(); value.proposal.estimate.archived = true; value.context.estimate.archived = true;
    expect(review(value).issues).toContain(estimateSendDialogData.errors.archived);
  });
  it.each(["", "not-an-email", "x\r\nBcc: other@example.com", `${"x".repeat(245)}@example.com`])("reuses existing invalid-recipient checks", (email) => {
    const value = fixture(); value.proposal.estimate.recipientEmail = email; value.context.estimate.recipientEmail = email;
    expect(review(value).canConfirm).toBe(false);
    expect(review(value).issues).toContain(estimateSendDialogData.errors.recipientEmail);
  });
  it.each(["", " ", "Estimate\r\nBcc: other@example.com"])("reuses subject safety checks", (subject) => {
    const value = fixture(); value.proposal.subject = subject; value.context.subject = subject;
    expect(review(value).issues).toContain(estimateSendDialogData.errors.subject);
  });
  it.each([
    { name: "" }, { number: "" }, { recipientName: "" }, { revision: 0 },
    { totalCents: null }, { totalCents: -1 }, { totalCents: 96917.5 },
    { validUntil: "" }, { validUntil: "2026-02-30" }, { validUntil: "2026-10-22" },
  ])("reuses saved-record/validity/amount checks: %j", (patch) => {
    const value = fixture(); Object.assign(value.proposal.estimate, patch); Object.assign(value.context.estimate, patch);
    expect(review(value).canConfirm).toBe(false);
  });
  it("permits today in the host workspace timezone, not the browser date", () => {
    const value = fixture(); value.context.today = "2026-11-21";
    expect(review(value).canConfirm).toBe(true);
    value.context.today = "2026-11-22";
    expect(review(value).issues).toContain(estimateSendDialogData.errors.past);
    value.context.today = "";
    expect(review(value).issues).toContain(estimateSendDialogData.errors.today);
  });
  it.each([{ issues: [] }, { issues: [c.stories.profileIssue] }, { issues: [c.stories.itemIssue] }])("blocks incomplete sharing readiness: %j", ({ issues }) => {
    const value = fixture(); value.context.readiness = { state: "blocked", issues };
    expect(review(value).canConfirm).toBe(false);
  });
  it.each(["loading", "error", "stale"] as const)("blocks %s preview", (state) => {
    const value = fixture(); value.context.preview = { state };
    expect(review(value)).toMatchObject({ canConfirm: false, previewUsable: false });
  });
  it("blocks a missing preview", () => {
    const value = fixture(); value.context.preview = null;
    expect(review(value)).toMatchObject({ canConfirm: false, previewUsable: false });
  });
  it.each([{ estimateId: "other" }, { version: 4 }, { snapshotHash: "e".repeat(64) }])("blocks and hides stale preview content: %j", (patch) => {
    const value = fixture();
    if (value.context.preview?.state !== "ready") throw Error("Expected ready preview");
    Object.assign(value.context.preview, patch);
    expect(review(value)).toMatchObject({ canConfirm: false, previewUsable: false });
  });
  it("does not treat metadata without a React preview as reviewable", () => {
    const value = fixture();
    if (value.context.preview?.state !== "ready") throw Error("Expected ready preview");
    Object.assign(value.context.preview, { content: null });
    expect(review(value)).toMatchObject({ canConfirm: false, previewUsable: false });
  });
  it("honors the exact deadline, never extending the 15-minute window", () => {
    const value = fixture(), now = Date.parse(value.proposal.createdAt);
    expect(reviewEstimateSendCard(value, now + 899999).canConfirm).toBe(true);
    expect(reviewEstimateSendCard(value, now + 900000)).toMatchObject({ expired: true, canConfirm: false, canCancel: false });
    value.proposal.expiresAt = new Date(now + 900001).toISOString();
    expect(review(value).canConfirm).toBe(false);
  });
  it.each(["invalid", "2026-02-30T00:00:00.000Z"])("rejects invalid timestamp %s", (expiresAt) => {
    const value = fixture(); value.proposal.expiresAt = expiresAt;
    expect(review(value).canConfirm).toBe(false);
  });
  it("blocks proposals from the future, reversed windows and nonfinite clocks", () => {
    const value = fixture(), now = Date.parse(value.proposal.createdAt);
    expect(reviewEstimateSendCard(value, now - 1).canConfirm).toBe(false);
    expect(reviewEstimateSendCard(value, NaN).canConfirm).toBe(false);
    value.proposal.expiresAt = value.proposal.createdAt;
    expect(review(value).canConfirm).toBe(false);
  });
  it.each(["confirmed", "cancelled", "expired", "superseded", "conflict", "forbidden"] as const)("cannot reconfirm a %s proposal", (state) => {
    const value = fixture(); value.proposal.state = state;
    expect(review(value)).toMatchObject({ canConfirm: false, canCancel: false });
  });
});
