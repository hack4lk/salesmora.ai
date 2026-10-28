import { describe, expect, it } from "vitest";
import { deleteEstimateDraftSchema } from "./estimate";
import {
  estimateProposeChatSchema,
  estimateProposeChatToolParameters,
} from "./estimate-share-chat";
import {
  estimateDraftDeleteChatBindingSchema,
  estimateDraftDeleteChatDecisionSchema,
  estimateDraftDeleteChatProposeSchema,
  estimateDraftDeleteChatStoredSchema,
  estimateDraftDeleteChatTicketSchema,
  estimateDraftDeleteChatViewSchema,
} from "./estimate-draft-delete-chat";

const id = "10000000-0000-4000-8000-000000000001";
const workspaceId = "10000000-0000-4000-8000-000000000002";
function view() {
  return estimateDraftDeleteChatViewSchema.parse({
    ticket: {
      id,
      actionType: "estimate.delete-draft",
      inputHash: "a".repeat(64),
      authorizationVersion: "b".repeat(64),
      reviewHash: "c".repeat(64),
      createdAt: "2026-10-27T12:00:00.000Z",
      expiresAt: "2026-10-27T12:15:00.000Z",
      state: "pending",
      estimate: { id, version: 3, number: "EST-2048", revision: 2 },
    },
    review: {
      name: "Draft estimate",
      recipientName: "Customer",
      parent: { type: "job", id: workspaceId, version: 5, number: "J-2048", name: "Repair" },
    },
    receipt: null,
  });
}

describe("Estimate assistant Draft deletion foundation contracts", () => {
  it("advertises only the exact Draft reference and excludes confirmation from preparation", () => {
    for (const estimateRef of [null, id, "EST-2048"]) {
      const request = { operation: "delete-draft", estimateRef };
      expect(estimateDraftDeleteChatProposeSchema.parse({ request })).toEqual({ request });
      expect(estimateProposeChatSchema.parse({ request })).toEqual({ request });
    }
    for (const estimateRef of ["latest estimate", "Repair", "", "EST-1", 123]) {
      expect(estimateDraftDeleteChatProposeSchema.safeParse({
        request: { operation: "delete-draft", estimateRef },
      }).success).toBe(false);
    }
    for (const field of ["confirm", "typedConfirmation", "workspaceId", "deleteAllRevisions", "status"]) {
      expect(estimateDraftDeleteChatProposeSchema.safeParse({
        request: { operation: "delete-draft", estimateRef: id, [field]: "injected" },
      }).success).toBe(false);
      expect(estimateProposeChatSchema.safeParse({
        request: { operation: "delete-draft", estimateRef: id, [field]: "injected" },
      }).success).toBe(false);
    }
    expect(JSON.stringify(estimateProposeChatToolParameters)).toContain("delete-draft");
  });

  it("binds only the exact estimate revision and rejects extra authority or private fields", () => {
    const ticket = view().ticket;
    for (const field of ["name", "recipientName", "parent", "review", "receipt", "typedConfirmation"]) {
      expect(estimateDraftDeleteChatTicketSchema.safeParse({ ...ticket, [field]: "injected" }).success).toBe(false);
    }
    expect(estimateDraftDeleteChatTicketSchema.safeParse({
      ...ticket,
      expiresAt: "2026-10-27T12:15:00.001Z",
    }).success).toBe(false);
    expect(estimateDraftDeleteChatTicketSchema.safeParse({
      ...ticket,
      expiresAt: ticket.createdAt,
    }).success).toBe(false);
    expect(estimateDraftDeleteChatTicketSchema.safeParse({
      ...ticket,
      estimate: { ...ticket.estimate, version: 0 },
    }).success).toBe(false);
  });

  it("keeps typed confirmation outside the ticket binding and requires it only on Confirm", () => {
    const ticket = view().ticket;
    const request = {
      proposalId: ticket.id,
      actionType: ticket.actionType,
      inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion,
      reviewHash: ticket.reviewHash,
      estimateId: ticket.estimate.id,
      expectedVersion: ticket.estimate.version,
    };
    expect(estimateDraftDeleteChatBindingSchema.parse(request)).toEqual(request);
    expect(estimateDraftDeleteChatDecisionSchema.parse({
      workspaceId, request, decision: "confirm", typedConfirmation: "EST-2048",
    }).typedConfirmation).toBe("EST-2048");
    expect(estimateDraftDeleteChatDecisionSchema.parse({
      workspaceId, request, decision: "cancel",
    }).decision).toBe("cancel");
    expect(estimateDraftDeleteChatDecisionSchema.safeParse({
      workspaceId, request, decision: "confirm",
    }).success).toBe(false);
    expect(estimateDraftDeleteChatDecisionSchema.safeParse({
      workspaceId, request, decision: "cancel", typedConfirmation: "EST-2048",
    }).success).toBe(false);
    expect(estimateDraftDeleteChatDecisionSchema.safeParse({
      workspaceId, request, decision: "confirm", typedConfirmation: "EST-2048", deleteAllRevisions: true,
    }).success).toBe(false);
  });

  it("exposes only the bounded private review and binds deletion receipts to the exact revision", () => {
    const pending = view();
    const confirmed = {
      ...pending,
      ticket: { ...pending.ticket, state: "confirmed" as const },
      receipt: {
        estimateId: id,
        version: 3,
        number: "EST-2048",
        revision: 2,
      },
    };
    expect(estimateDraftDeleteChatViewSchema.parse(confirmed).receipt?.revision).toBe(2);
    expect(estimateDraftDeleteChatViewSchema.safeParse({ ...pending, receipt: confirmed.receipt }).success).toBe(false);
    expect(estimateDraftDeleteChatViewSchema.safeParse({
      ...confirmed, receipt: { ...confirmed.receipt, estimateId: workspaceId },
    }).success).toBe(false);
    expect(estimateDraftDeleteChatViewSchema.safeParse({
      ...confirmed, receipt: { ...confirmed.receipt, version: 2 },
    }).success).toBe(false);
    expect(estimateDraftDeleteChatViewSchema.safeParse({
      ...confirmed, receipt: { ...confirmed.receipt, number: "EST-2049" },
    }).success).toBe(false);
    expect(estimateDraftDeleteChatViewSchema.safeParse({
      ...confirmed, receipt: { ...confirmed.receipt, revision: 1 },
    }).success).toBe(false);
    expect(estimateDraftDeleteChatStoredSchema.safeParse({
      ...confirmed, stamp: "d".repeat(32), resultStamp: null,
    }).success).toBe(false);
    expect(estimateDraftDeleteChatStoredSchema.parse({
      ...confirmed, stamp: "d".repeat(32), resultStamp: "e".repeat(32),
    }).resultStamp).not.toBeNull();
    expect(JSON.stringify(pending.ticket)).not.toContain("Customer");
    expect(JSON.stringify(pending.ticket)).not.toContain("Repair");
  });

  it("preserves exact, case-sensitive typed-number input without trimming in the existing delete contract", () => {
    const base = { workspaceId, estimateId: id, expectedVersion: 3 };
    expect(deleteEstimateDraftSchema.parse({ ...base, typedConfirmation: "EST-2048" }).typedConfirmation)
      .toBe("EST-2048");
    for (const typedConfirmation of [" EST-2048", "EST-2048 ", "EST-2048\n", "est-2048"]) {
      expect(deleteEstimateDraftSchema.parse({ ...base, typedConfirmation }).typedConfirmation)
        .toBe(typedConfirmation);
    }
  });
});
