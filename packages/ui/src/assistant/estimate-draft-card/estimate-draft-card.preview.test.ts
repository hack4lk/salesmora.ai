import { describe, expect, it } from "vitest";
import { estimateDraftContentFixture, estimateDraftContextFixture, estimateDraftFixture, estimateDraftCardData as c } from "./estimate-draft-card.data";
import { estimateDraftDate, estimateDraftRequest, reviewEstimateDraft, reviewEstimateDraftContent } from "./estimate-draft-card.preview";
import type { EstimateDraftContext, EstimateDraftContent, EstimateDraftProposal } from "./estimate-draft-card.types";

function fixture(action: EstimateDraftProposal["actionType"] = "estimate.create") {
  const draft = estimateDraftFixture(action);
  const context = estimateDraftContextFixture(draft);
  const now = Date.parse(draft.createdAt);
  return { draft, context, now };
}

describe("Draft review and exact shared arithmetic", () => {
  it.each(["estimate.create", "estimate.update"] as const)("validates %s with exact cents", (action) => {
    const { draft, context, now } = fixture(action);
    const result = reviewEstimateDraft(draft, context, now);
    expect(result.canConfirm).toBe(true);
    expect(result.proposed.calculation).toMatchObject({
      items: { subtotalCents: 96250 }, discountCents: 4813, taxCents: 5480,
      totalCents: 96917, depositCents: 24229, balanceCents: 72688,
    });
    expect(result.proposed.unitPrices).toEqual([12500, 65000, 0]);
  });
  it("never infers a price from unknown provenance, even when the numeric value is valid", () => {
    const { draft, context, now } = fixture();
    draft.proposed.items[0].priceSource = { type: "missing" };
    const result = reviewEstimateDraft(draft, context, now);
    expect(result.canConfirm).toBe(false);
    expect(result.proposed.needsPrice).toEqual([true, false, false]);
    expect(result.proposed.unitPrices[0]).toBeNull();
    expect(result.proposed.calculation.totalCents).toBeNull();
    expect(result.issues).toContain(c.issues.price);
    expect(draft.proposed.items[0].unitPrice).toBe("125.00");
  });
  it("flags blank prices even when provenance claims user input", () => {
    const { draft, context, now } = fixture();
    draft.proposed.items[0].unitPrice = "";
    expect(reviewEstimateDraft(draft, context, now).canConfirm).toBe(false);
  });
  it.each(["catalog", "rule"] as const)("requires a named %s source", (type) => {
    const value = structuredClone(estimateDraftContentFixture);
    value.items[0].priceSource = { type, name: "" };
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.price);
    value.items[0].priceSource = { type, name: "Known source" };
    expect(reviewEstimateDraftContent(value).issues).toEqual([]);
  });
  it("accepts a saved price only for an unchanged existing line", () => {
    const { draft, context, now } = fixture("estimate.update");
    if (draft.actionType !== "estimate.update") throw Error("Expected update");
    expect(reviewEstimateDraft(draft, context, now).canConfirm).toBe(true);
    draft.proposed.items[0].unitPrice = "150.00";
    const result = reviewEstimateDraft(draft, context, now);
    expect(result.canConfirm).toBe(false);
    expect(result.proposed.needsPrice[0]).toBe(true);
  });
  it("does not allow a new line or create proposal to claim saved pricing", () => {
    const { draft, context, now } = fixture();
    draft.proposed.items[0].priceSource = { type: "saved" };
    expect(reviewEstimateDraft(draft, context, now).canConfirm).toBe(false);
    const update = fixture("estimate.update");
    update.draft.proposed.items[0].id = "another-line";
    expect(reviewEstimateDraft(update.draft, update.context, update.now).canConfirm).toBe(false);
  });
  it("allows saved prices with changed quantities but not changed no-charge consent", () => {
    const { draft, context, now } = fixture("estimate.update");
    draft.proposed.items[0].quantity = "4";
    expect(reviewEstimateDraft(draft, context, now).proposed.calculation.totalCents).toBe(114730);
    draft.proposed.items[2].included = false;
    expect(reviewEstimateDraft(draft, context, now).canConfirm).toBe(false);
  });
  it("permits zero only with explicit no-charge approval and a known price source", () => {
    const value = structuredClone(estimateDraftContentFixture);
    value.items[0].unitPrice = "0";
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.items);
    value.items[0].included = true;
    expect(reviewEstimateDraftContent(value).issues).toEqual([]);
    value.items[0].priceSource = { type: "missing" };
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.price);
  });
  it("allows an empty Draft without making totals zero", () => {
    const { draft, context, now } = fixture();
    draft.proposed.items = []; draft.proposed.validUntil = "";
    const result = reviewEstimateDraft(draft, context, now);
    expect(result.canConfirm).toBe(true);
    expect(result.proposed.calculation.totalCents).toBeNull();
  });
  it.each([
    { quantity: "0" }, { quantity: "1.0001" }, { unitPrice: "1.001" },
    { unitPrice: "1000000.01" }, { description: "" }, { quantity: "11", unitPrice: "1000000" },
  ])("blocks invalid added lines: %j", (patch) => {
    const value = structuredClone(estimateDraftContentFixture);
    Object.assign(value.items[0], patch);
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.items);
  });
  it("preserves a valid total when a fixed deposit exceeds it", () => {
    const { draft, context, now } = fixture();
    draft.proposed.deposit = { type: "amount", value: "969.18" };
    const result = reviewEstimateDraft(draft, context, now);
    expect(result.canConfirm).toBe(false);
    expect(result.proposed.calculation).toMatchObject({ totalCents: 96917, depositCents: null, balanceCents: null });
  });
  it("rejects invalid adjustments even without items", () => {
    const value = structuredClone(estimateDraftContentFixture); value.items = [];
    value.discount = { type: "percent", value: "101" }; value.taxRate = "8.8751";
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.amounts);
  });
  it("rejects duplicate or missing line references and the 100-line limit", () => {
    const value = structuredClone(estimateDraftContentFixture);
    value.items[1].id = value.items[0].id;
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.lines);
    value.items[0].id = "";
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.lines);
    value.items = Array.from({ length: 101 }, (_, index) => ({ ...value.items[2], id: `${index}` }));
    expect(reviewEstimateDraftContent(value).issues).toContain(c.issues.items);
  });
});

describe("proposal binding, expiry and version", () => {
  it.each([
    { proposalId: "other" }, { inputHash: "b".repeat(64) }, { authorizationVersion: "another-policy:another-membership" }, { parent: { type: "job" as const, id: "lead-sample", version: 2 } },
    { parent: { type: "lead" as const, id: "other", version: 2 } }, { parent: { type: "lead" as const, id: "lead-sample", version: 3 } },
  ] satisfies Partial<EstimateDraftContext>[])("blocks a changed host binding: %j", (patch) => {
    const { draft, context, now } = fixture();
    const result = reviewEstimateDraft(draft, { ...context, ...patch }, now);
    expect(result.canConfirm).toBe(false);
    expect(result.issues).toContain(c.issues.binding);
  });
  it("blocks missing context or a create proposal bound to an existing estimate", () => {
    const { draft, context, now } = fixture();
    expect(reviewEstimateDraft(draft, null, now).canConfirm).toBe(false);
    expect(reviewEstimateDraft(draft, { ...context, estimate: { id: "existing", version: 1, status: "draft", archived: false } }, now).canConfirm).toBe(false);
  });
  it.each([
    { id: "another" }, { version: 4 }, { status: "sent" }, { archived: true },
  ])("blocks stale/readonly update targets: %j", (patch) => {
    const { draft, context, now } = fixture("estimate.update");
    if (!context.estimate) throw Error("Expected estimate context");
    expect(reviewEstimateDraft(draft, { ...context, estimate: { ...context.estimate, ...patch } }, now).canConfirm).toBe(false);
  });
  it.each(["", "not-hash", "a".repeat(63), "G".repeat(64)])("requires a real content hash shape", (hash) => {
    const { draft, context, now } = fixture(); draft.inputHash = hash; context.inputHash = hash;
    expect(reviewEstimateDraft(draft, context, now).issues).toContain(c.issues.metadata);
  });
  it("honors the exact 15-minute deadline", () => {
    const { draft, context, now } = fixture();
    expect(reviewEstimateDraft(draft, context, now + 899999).canConfirm).toBe(true);
    expect(reviewEstimateDraft(draft, context, now + 900000).expired).toBe(true);
    expect(reviewEstimateDraft(draft, context, now + 900000).canConfirm).toBe(false);
    draft.expiresAt = new Date(now + 900001).toISOString();
    expect(reviewEstimateDraft(draft, context, now).validMetadata).toBe(false);
  });
  it.each(["invalid", "2026-02-30T00:00:00.000Z"])("rejects invalid expiry timestamps", (expiresAt) => {
    const { draft, context, now } = fixture(); draft.expiresAt = expiresAt;
    expect(reviewEstimateDraft(draft, context, now).canConfirm).toBe(false);
  });
  it("blocks proposals dated in the future or with a reversed review window", () => {
    const { draft, context, now } = fixture();
    expect(reviewEstimateDraft(draft, context, now - 1).validMetadata).toBe(false);
    draft.expiresAt = draft.createdAt;
    expect(reviewEstimateDraft(draft, context, now).validMetadata).toBe(false);
  });
  it("does not treat provenance-only updates as customer-content changes", () => {
    const { draft, context, now } = fixture("estimate.update");
    if (draft.actionType !== "estimate.update") throw Error("Expected update");
    draft.proposed.name = draft.current.name; draft.proposed.scope = draft.current.scope;
    expect(reviewEstimateDraft(draft, context, now)).toMatchObject({ changed: false, canConfirm: false });
  });
  it("ignores adjustment property order when detecting a no-op", () => {
    const { draft, context, now } = fixture("estimate.update");
    if (draft.actionType !== "estimate.update") throw Error("Expected update");
    draft.proposed = structuredClone(draft.current);
    draft.proposed.discount = { value: "5", type: "percent" };
    expect(reviewEstimateDraft(draft, context, now).changed).toBe(false);
  });
  it.each([{ id: "" }, { version: 0 }, { version: 1.5 }, { number: "" }, { name: "" }])("requires valid parent metadata: %j", (patch) => {
    const { draft, now } = fixture();
    Object.assign(draft.parent, patch);
    expect(reviewEstimateDraft(draft, estimateDraftContextFixture(draft), now).validMetadata).toBe(false);
  });
  it.each([{ id: "" }, { expectedVersion: 0 }, { expectedVersion: 1.5 }, { number: "" }, { revision: 0 }])("requires valid estimate metadata: %j", (patch) => {
    const { draft, now } = fixture("estimate.update");
    if (draft.actionType !== "estimate.update") throw Error("Expected update");
    Object.assign(draft.estimate, patch);
    expect(reviewEstimateDraft(draft, estimateDraftContextFixture(draft), now).validMetadata).toBe(false);
  });
  it("sends a metadata-only explicit allowlist, not model content", () => {
    const { draft } = fixture("estimate.update");
    expect(estimateDraftRequest(draft)).toEqual({
      proposalId: draft.id, inputHash: draft.inputHash, authorizationVersion: draft.authorizationVersion, actionType: "estimate.update",
      parentType: "lead", parentId: "lead-sample", parentVersion: 2,
      estimateId: "estimate-sample", expectedVersion: 3,
    });
    const create = fixture().draft;
    expect(estimateDraftRequest(create)).toMatchObject({ estimateId: null, expectedVersion: null });
  });
  it.each(["confirmed", "cancelled", "expired", "superseded", "conflict", "forbidden"] as const)("cannot reconfirm a %s proposal", (state) => {
    const { draft, context, now } = fixture(); draft.state = state;
    expect(reviewEstimateDraft(draft, context, now).canConfirm).toBe(false);
  });
});

describe("Draft field validation", () => {
  it.each([
    ["name", "x".repeat(121)], ["name", " "], ["scope", "x".repeat(5001)],
    ["message", "x".repeat(2001)], ["paymentTerms", "x".repeat(501)],
    ["termsNote", "x".repeat(5001)], ["validUntil", "2026-02-30"],
  ] satisfies [keyof EstimateDraftContent, string][])("blocks invalid %s", (field, value) => {
    const content = { ...structuredClone(estimateDraftContentFixture), [field]: value };
    expect(reviewEstimateDraftContent(content).issues.length).toBeGreaterThan(0);
  });
  it.each(["", "2026-10-01", "2028-02-29"])("allows a missing or real Draft date: %s", (validUntil) => {
    expect(reviewEstimateDraftContent({ ...structuredClone(estimateDraftContentFixture), validUntil }).issues).toEqual([]);
  });
  it.each(["0000-01-01", "2026-02-29", "2026-13-01", "tomorrow", "2026-1-1"])("rejects invalid local date: %s", (value) => {
    expect(estimateDraftDate(value)).toBe(false);
  });
});
