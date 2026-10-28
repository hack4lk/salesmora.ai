import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses } from "../estimate-preview.types";
import { estimateConvertDialogData as dialog } from "../estimate-convert-dialog/estimate-convert-dialog.data";
import { initialEstimateConversionReview } from "../estimate-convert-dialog/estimate-convert-dialog.preview";
import {
  estimateConvertCardContextFixture, estimateConvertCardData as c, estimateConvertProposalFixture,
} from "./estimate-convert-card.data";
import { estimateConvertCardRequest, reviewEstimateConvertCard } from "./estimate-convert-card.preview";
import type { EstimateConvertCardContext, EstimateConvertCardProps } from "./estimate-convert-card.types";

function fixture(): EstimateConvertCardProps & { context: EstimateConvertCardContext } {
  const proposal = estimateConvertProposalFixture();
  return { proposal, context: estimateConvertCardContextFixture(proposal), capabilities: { ...roles.owner }, parentAccess: true, canCreateJob: true };
}
function review(input: EstimateConvertCardProps) { return reviewEstimateConvertCard(input, Date.parse(input.proposal.createdAt)); }
function record(input: ReturnType<typeof fixture>, patch: Partial<EstimateConvertCardProps["proposal"]["estimate"]>) {
  Object.assign(input.proposal.estimate, patch); Object.assign(input.context.estimate, patch);
}
describe("assistant Convert review preparation", () => {
  it("allows only opening a current, accepted lead estimate's job review", () => {
    expect(review(fixture())).toMatchObject({ visible: true, canReview: true, canCancel: true, issues: [], existingJob: null });
  });
  it("reuses exact customer-facing prefills and never guesses assignments, dates or prices", () => {
    const { proposal } = fixture(), { job } = initialEstimateConversionReview(proposal.estimate, proposal.customer);
    expect(job).toEqual({
      customerId: proposal.estimate.customerId, customerName: c.stories.customer, title: proposal.estimate.name,
      service: proposal.estimate.service, location: proposal.estimate.serviceAddress, description: proposal.estimate.scope,
      primaryOwnerId: null, teamUserIds: [], scheduledDate: null, arrivalWindow: null, completionDeadline: null,
    });
    expect(proposal.estimate.totalCents).toBe(96917);
  });
  it.each(estimateStatuses)("requires Accepted, not %s", (status) => {
    const input = fixture(); record(input, { status });
    expect(review(input).canReview).toBe(status === "accepted");
  });
  it("blocks archives, independently of status", () => {
    const input = fixture(); record(input, { archived: true });
    expect(review(input)).toMatchObject({ canReview: false, canCancel: true });
    expect(review(input).issues).toContain(dialog.errors.archived);
  });
  it.each(["owner", "admin", "office"] as const)("uses explicit %s grants", (role) => {
    const input = fixture(); input.capabilities = roles[role];
    expect(review(input).canReview).toBe(true);
  });
  it("requires jobs.create, not estimate mutation permissions", () => {
    const input = fixture(); input.canCreateJob = false;
    expect(review(input)).toMatchObject({ canReview: false, canCancel: true });
    expect(review(input).issues).toContain(dialog.errors.create);
    input.canCreateJob = true;
    input.capabilities = { ...input.capabilities, create: false, update: false, send: false, decide: false };
    expect(review(input).canReview).toBe(true);
  });
  it.each(["read", "parent", "forbidden", "customer"] as const)("hides private information after %s access loss", (kind) => {
    const input = fixture(); record(input, { scope: c.stories.literal, totalCents: -1 });
    if (kind === "read") input.capabilities.read = false;
    if (kind === "parent") input.parentAccess = false;
    if (kind === "forbidden") input.proposal.state = "forbidden";
    if (kind === "customer") input.context.customer = { state: "unavailable" };
    expect(review(input)).toMatchObject({ visible: false, canReview: false, canCancel: false, issues: [c.unavailable], existingJob: null });
  });
  it("lets a truly missing customer continue to the existing separate resolution flow", () => {
    const input = fixture(); record(input, { customerId: null });
    input.proposal.customer = input.context.customer = { state: "missing" };
    expect(review(input)).toMatchObject({ canReview: true, canCancel: true, issues: [dialog.customerMissing] });
  });
  it("does not silently replace an existing customer with a missing-customer flow", () => {
    const input = fixture(); input.proposal.customer = input.context.customer = { state: "missing" };
    expect(review(input).canReview).toBe(false);
    expect(review(input).issues).toContain(dialog.errors.customerMismatch);
  });
  it.each([{ id: "invalid" }, { id: "33333333-3333-4333-8333-333333333333" }, { name: "" }])("rejects invalid/mismatched customers %j", (patch) => {
    const input = fixture();
    if (input.proposal.customer.state !== "ready") throw Error("Expected ready fixture");
    input.proposal.customer = { ...input.proposal.customer, ...patch };
    input.context.customer = structuredClone(input.proposal.customer);
    expect(review(input).issues).toContain(dialog.errors.customerMismatch);
    expect(review(input).canReview).toBe(false);
  });
  it("allows opening the form to explicitly edit an oversized scope without truncation", () => {
    const input = fixture(); record(input, { scope: c.stories.longScope });
    expect(input.proposal.estimate.scope.length).toBeGreaterThan(4000);
    expect(review(input).canReview).toBe(true);
    expect(initialEstimateConversionReview(input.context.estimate, input.context.customer).job.description).toBe(c.stories.longScope);
  });
  it.each([
    { id: "" }, { number: "" }, { name: "" }, { name: "x".repeat(121) }, { parentId: "invalid" },
    { parentNumber: "" }, { version: 0 }, { version: 1.5 }, { version: Number.MAX_SAFE_INTEGER + 1 },
    { revision: 0 }, { totalCents: null }, { totalCents: -1 }, { totalCents: 1.5 }, { totalCents: Number.MAX_SAFE_INTEGER + 1 },
  ])("rejects invalid saved records %j", (patch) => {
    const input = fixture(); record(input, patch); expect(review(input).canReview).toBe(false);
  });
  it("supports a genuine zero-dollar accepted estimate", () => {
    const input = fixture(); record(input, { totalCents: 0 }); expect(review(input).canReview).toBe(true);
  });
});
describe("independent stored-proposal binding", () => {
  it.each(["proposalId", "inputHash", "authorizationVersion"] as const)("rejects changed host %s", (key) => {
    const input = fixture(); input.context[key] = "different";
    expect(review(input)).toMatchObject({ canReview: false, canCancel: false });
  });
  it.each([
    { id: "different" }, { version: 7 }, { number: "EST-9" }, { revision: 2 }, { name: "Changed" },
    { status: "sent" as const }, { archived: true }, { parentType: "job" as const }, { parentId: c.stories.existingJob.id },
    { parentNumber: "L-999" }, { snapshotHash: "f".repeat(64) }, { totalCents: 96918 },
    { customerId: null }, { service: "Changed" }, { scope: "Changed" }, { serviceAddress: "Changed" },
    { convertedJob: c.stories.existingJob },
  ])("binds the complete displayed record: %j", (patch) => {
    const input = fixture(); Object.assign(input.context.estimate, patch);
    expect(review(input)).toMatchObject({ canReview: false, canCancel: false });
    expect(review(input).issues).toContain(c.errors.binding);
  });
  it.each([{ name: "Changed" }, { id: c.stories.existingJob.id }, { state: "missing" as const }])("binds the authorized customer: %j", (patch) => {
    const input = fixture(); Object.assign(input.context.customer, patch);
    expect(review(input)).toMatchObject({ canReview: false, canCancel: false });
  });
  it("compares explicit identities independently of property order", () => {
    const input = fixture(), { scope, ...rest } = input.context.estimate;
    input.context.estimate = { scope, ...rest };
    expect(review(input).canReview).toBe(true);
  });
  it("requires independent context", () => {
    expect(review({ ...fixture(), context: null })).toMatchObject({ canReview: false, canCancel: false });
  });
  it.each(["id", "inputHash", "authorizationVersion"] as const)("requires proposal %s", (key) => {
    const input = fixture(); input.proposal[key] = "";
    expect(review(input).issues).toContain(c.errors.metadata);
  });
  it.each(["", "bad", "e".repeat(63), "G".repeat(64)])("rejects malformed content/snapshot hashes %s", (hash) => {
    const input = fixture(); input.proposal.inputHash = input.context.inputHash = hash;
    expect(review(input).canReview).toBe(false);
    const snapshot = fixture(); record(snapshot, { snapshotHash: hash });
    expect(review(snapshot)).toMatchObject({ canReview: false, canCancel: false });
  });
  it("sends metadata only, not job values, prices, customer names or grants", () => {
    const { proposal } = fixture();
    expect(estimateConvertCardRequest(proposal)).toEqual({
      proposalId: proposal.id, actionType: "estimate.convert", inputHash: proposal.inputHash,
      authorizationVersion: proposal.authorizationVersion, estimateId: "estimate-2048",
      expectedVersion: 6, snapshotHash: proposal.estimate.snapshotHash, sourceLeadId: proposal.estimate.parentId,
    });
  });
});
describe("one conversion and authorized existing jobs", () => {
  it.each([true, false])("blocks repeat conversion; canOpen=%s only controls navigation", (canOpen) => {
    const input = fixture(), convertedJob = { ...c.stories.existingJob, canOpen }; record(input, { convertedJob });
    expect(review(input).canReview).toBe(false);
    expect(review(input).existingJob).toEqual(canOpen ? { number: convertedJob.number, href: `/jobs/${convertedJob.id}` } : null);
  });
  it("offers only the matching authorized parent job instead of another conversion", () => {
    const input = fixture(); record(input, { parentType: "job", parentId: c.stories.existingJob.id });
    input.context.parentJob = { ...c.stories.existingJob };
    expect(review(input)).toMatchObject({ canReview: false, existingJob: { href: `/jobs/${c.stories.existingJob.id}` } });
    input.context.parentJob.id = "33333333-3333-4333-8333-333333333333";
    expect(review(input).existingJob).toBeNull();
  });
  it.each([{ id: "https://example.com" }, { number: "" }, { canOpen: false }])("withholds invalid/unavailable job links %j", (patch) => {
    const input = fixture(); record(input, { convertedJob: { ...c.stories.existingJob, ...patch } });
    expect(review(input).existingJob).toBeNull();
  });
  it("binds converted-job number and access, not just id", () => {
    const input = fixture(); record(input, { convertedJob: { ...c.stories.existingJob } });
    input.context.estimate = structuredClone(input.context.estimate);
    if (!input.context.estimate.convertedJob) throw Error("Expected job fixture");
    input.context.estimate.convertedJob.canOpen = false;
    expect(review(input)).toMatchObject({ canCancel: false, existingJob: null });
  });
});
describe("proposal lifetime", () => {
  it("uses the exact 15-minute cutoff for review and cancellation", () => {
    const input = fixture(), now = Date.parse(input.proposal.createdAt);
    expect(reviewEstimateConvertCard(input, now + 899999).canReview).toBe(true);
    expect(reviewEstimateConvertCard(input, now + 900000)).toMatchObject({ canReview: false, canCancel: false, expired: true });
    input.proposal.expiresAt = new Date(now + 900001).toISOString();
    expect(review(input).canReview).toBe(false);
  });
  it.each(["invalid", "2026-02-30T00:00:00.000Z", "2026-10-23T12:00:00-04:00"])("rejects noncanonical windows %s", (expiresAt) => {
    const input = fixture(); input.proposal.expiresAt = expiresAt; expect(review(input).canReview).toBe(false);
  });
  it("rejects future creation, nonfinite now and zero-length windows", () => {
    const input = fixture(), now = Date.parse(input.proposal.createdAt);
    expect(reviewEstimateConvertCard(input, now - 1).canReview).toBe(false);
    expect(reviewEstimateConvertCard(input, NaN).canReview).toBe(false);
    input.proposal.expiresAt = input.proposal.createdAt; expect(review(input).canReview).toBe(false);
  });
  it.each(["confirmed", "cancelled", "expired", "superseded", "conflict", "forbidden"] as const)("cannot reuse a %s proposal", (state) => {
    const input = fixture(); input.proposal.state = state;
    expect(review(input)).toMatchObject({ canReview: false, canCancel: false });
  });
});
