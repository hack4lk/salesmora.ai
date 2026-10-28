import { describe, expect, it } from "vitest";
import {
  estimateDraftChatProposeSchema, estimateDraftChatDecisionSchema, estimateDraftChatContentSchema,
  estimateDraftChatToolParameters, estimateDraftChatViewSchema,
} from "./estimate-draft-chat";

const id = "00000000-0000-4000-8000-000000000001";
const changes = {
  name: "Repair", scope: null, message: null, paymentTerms: null, termsNote: null, validUntil: null,
  discount: null, taxRate: null, deposit: null, items: null,
};
describe("Estimate Draft chat contracts", () => {
  function validView() {
    const proposed = {
      name: "Repair", scope: "", message: "", paymentTerms: "", termsNote: "", validUntil: "",
      discount: { type: "none" }, taxRate: "0", deposit: { type: "none" }, items: [],
    };
    const parent = { type: "job", id, name: "Repair", number: "J-1024", version: 1 };
    return estimateDraftChatViewSchema.parse({
      draft: { id, actionType: "estimate.create", parent, proposed, state: "pending",
        inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
        createdAt: "2026-10-26T18:00:00Z", expiresAt: "2026-10-26T18:15:00Z" },
      context: { proposalId: id, inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
        parent: { type: "job", id, version: 1 }, estimate: null },
      grants: { read: true, parentAccess: true, create: true, update: false }, canConfirm: true, receipt: null,
    });
  }
  it("checks exact lifetime boundaries, cross-action bindings and all view identities", () => {
    const view = validView();
    expect(estimateDraftChatViewSchema.safeParse(view).success).toBe(true);
    for (const expiresAt of [view.draft.createdAt, "2026-10-26T18:15:00.001Z"]) {
      expect(estimateDraftChatViewSchema.safeParse({ ...view, draft: { ...view.draft, expiresAt } }).success).toBe(false);
    }
    expect(estimateDraftChatViewSchema.safeParse({ ...view, context: { ...view.context, inputHash: "f".repeat(64) } }).success).toBe(false);
    expect(estimateDraftChatViewSchema.safeParse({ ...view, context: { ...view.context, parent: { ...view.context.parent, version: 2 } } }).success).toBe(false);
    expect(estimateDraftChatViewSchema.safeParse({ ...view, draft: { ...view.draft, state: "confirmed" } }).success).toBe(false);
  });
  it("bounds complete escaped JSON rather than truncating reviewed contents, and rejects duplicate lines", () => {
    const view = validView();
    const item = { id: "line", description: '"'.repeat(200), quantity: "1", unit: "x".repeat(100),
      unitPrice: "1", taxable: false, included: false, priceSource: { type: "user" as const } };
    view.draft.proposed.items = Array.from({ length: 100 }, (_, index) => ({ ...item, id: `line-${index}` }));
    expect(JSON.stringify(view).length).toBeGreaterThan(55000);
    expect(estimateDraftChatViewSchema.safeParse(view).success).toBe(false);
    expect(estimateDraftChatContentSchema.safeParse({ ...view.draft.proposed, items: [item, item] }).success).toBe(false);
    expect(estimateDraftChatContentSchema.safeParse({ ...view.draft.proposed, validUntil: "0000-01-01", items: [] }).success).toBe(false);
    expect(estimateDraftChatContentSchema.safeParse({ ...view.draft.proposed, items: [{ ...item, id: " " }] }).success).toBe(false);
  });
  it("allows only strict create/update preparation, preserving null versus empty changes", () => {
    const input = { request: { operation: "create", parentType: "job", parentRef: "J-1024", estimateRef: null, changes } };
    expect(estimateDraftChatProposeSchema.parse(input).request.changes.items).toBeNull();
    expect(estimateDraftChatProposeSchema.parse({ request: { ...input.request, changes: { ...changes, items: [], scope: "" } } }).request.changes.items).toEqual([]);
    for (const patch of [{ operation: "send" }, { decision: "confirm" }, { workspaceId: id }]) {
      expect(estimateDraftChatProposeSchema.safeParse({ request: { ...input.request, ...patch } }).success).toBe(false);
    }
    expect(estimateDraftChatProposeSchema.safeParse({
      request: { ...input.request, changes: { ...changes, internalNotes: "private" } },
    }).success).toBe(false);
  });
  it("requires complete browser-only bindings and rejects arbitrary save payloads", () => {
    const request = {
      workspaceId: id, proposalId: id, inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
      actionType: "estimate.create", parentType: "job", parentId: id, parentVersion: 1,
      estimateId: null, expectedVersion: null, decision: "confirm",
    };
    expect(estimateDraftChatDecisionSchema.safeParse(request).success).toBe(true);
    expect(estimateDraftChatDecisionSchema.safeParse({ ...request, actionType: "estimate.update" }).success).toBe(false);
    expect(estimateDraftChatDecisionSchema.safeParse({ ...request, estimateId: id, expectedVersion: 1 }).success).toBe(false);
    for (const patch of [{ inputHash: "forged" }, { values: {} }, { href: "/other" }, { expectedVersion: 0 }]) {
      expect(estimateDraftChatDecisionSchema.safeParse({ ...request, ...patch }).success).toBe(false);
    }
  });
  it("serializes strict model parameters and disallows fabricated pricing rules", () => {
    expect(estimateDraftChatToolParameters.additionalProperties).toBe(false);
    expect(estimateDraftChatToolParameters.required).toEqual(["request"]);
    const content = {
      ...changes, scope: "", message: "", paymentTerms: "", termsNote: "", validUntil: "",
      discount: { type: "none" }, taxRate: "0", deposit: { type: "none" },
      items: [{ id, description: "Work", quantity: "1", unit: "each", unitPrice: "10", taxable: false, included: false, priceSource: { type: "rule", name: "Invented" } }],
    };
    expect(estimateDraftChatContentSchema.safeParse(content).success).toBe(false);
  });
});
