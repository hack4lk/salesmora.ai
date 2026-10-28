import { describe, expect, it } from "vitest";
import { estimateProposeChatSchema, estimateProposeChatToolParameters } from "./estimate-share-chat";
import {
  estimateDecisionChatBindingSchema, estimateDecisionChatCommand, estimateDecisionChatDecisionSchema,
  estimateDecisionChatProposeSchema, estimateDecisionChatTicketSchema, estimateDecisionChatViewSchema,
} from "./estimate-decision-chat";

const id = "10000000-0000-4000-8000-000000000001";
const previousId = "10000000-0000-4000-8000-000000000002";
function fixture(correct = false) {
  const estimate = {
    id, version: 3, number: "EST-2048", revision: 1, name: "Repair", status: correct ? "accepted" : "sent",
    archived: false, totalCents: 10000,
  };
  return estimateDecisionChatViewSchema.parse({
    ticket: {
      id, actionType: "estimate.decision", mode: correct ? "correct" : "record",
      inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
      createdAt: "2026-10-27T12:00:00.000Z", expiresAt: "2026-10-27T12:15:00.000Z", state: "pending",
      estimate, snapshotHash: "c".repeat(64),
    },
    review: {
      estimate: { ...estimate, recipientName: "Customer", decision: correct
        ? { id: previousId, outcome: "accepted", decisionDate: "2026-10-26", channel: "phone", note: "Original private note" } : null },
      today: "2026-10-27", timezone: "America/New_York", canDecide: true, canCorrectDecision: true,
      parent: { type: "job", id, version: 1 },
    },
    value: { estimateId: id, expectedVersion: 3, outcome: "declined", decisionDate: "2026-10-27",
      channel: "email", note: "  New private note\nwith literal <b>text</b>  ", reason: correct ? "  Correction reason  " : "" },
    canConfirm: true, receipt: null,
  });
}
describe("Estimate assistant decision contracts", () => {
  it.each(["decision", "correct-decision"])("accepts nullable preparation fields but no confirmation or authority for %s", operation => {
    const request = { operation, estimateRef: null, outcome: null, decisionDate: null, channel: null, note: null, reason: null };
    expect(estimateDecisionChatProposeSchema.parse({ request })).toEqual({ request });
    expect(estimateProposeChatSchema.parse({ request })).toEqual({ request });
    expect(JSON.stringify(estimateProposeChatToolParameters)).toContain("correct-decision");
    for (const field of ["confirm", "workspaceId", "expectedVersion", "snapshotHash", "acceptedTotalCents", "recipientEmail"]) {
      expect(estimateDecisionChatProposeSchema.safeParse({ request: { ...request, [field]: "injected" } }).success).toBe(false);
    }
    for (const field of ["outcome", "decisionDate", "channel", "note", "reason"]) {
      const missing = { ...request } as Record<string, unknown>; delete missing[field];
      expect(estimateDecisionChatProposeSchema.safeParse({ request: missing }).success).toBe(false);
    }
  });
  it.each(["today", "yesterday", "0000-01-01", "2026-02-30", "2026-13-01"])("rejects nonabsolute or invalid date %s", decisionDate => {
    expect(estimateDecisionChatProposeSchema.safeParse({ request: {
      operation: "decision", estimateRef: "EST-2048", outcome: "accepted", decisionDate, channel: "email", note: null, reason: null,
    } }).success).toBe(false);
  });
  it.each(["confirm", "cancel", "open"])("uses a metadata-only browser command for %s", decision => {
    const { ticket } = fixture();
    const binding = {
      proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion, estimateId: id, expectedVersion: 3, snapshotHash: ticket.snapshotHash,
    };
    expect(estimateDecisionChatBindingSchema.parse(binding)).toEqual(binding);
    expect(estimateDecisionChatDecisionSchema.parse({ workspaceId: id, request: binding, decision }).decision).toBe(decision);
    for (const field of ["note", "reason", "outcome", "decisionDate", "channel", "canCorrectDecision"]) {
      expect(estimateDecisionChatBindingSchema.safeParse({ ...binding, [field]: "injected" }).success).toBe(false);
      expect(estimateDecisionChatDecisionSchema.safeParse({ workspaceId: id, request: binding, decision, [field]: "injected" }).success).toBe(false);
    }
  });
  it("binds the exact window, eligible saved status and action family", () => {
    const { ticket } = fixture();
    for (const change of [
      { expiresAt: ticket.createdAt }, { expiresAt: "2026-10-27T12:15:00.001Z" },
      { actionType: "estimate.send" }, { mode: "correct" }, { estimate: { ...ticket.estimate, archived: true } },
      { estimate: { ...ticket.estimate, status: "expired" } },
    ]) expect(estimateDecisionChatTicketSchema.safeParse({ ...ticket, ...change }).success).toBe(false);
  });
  it("binds all displayed identities, previous decision, values and snapshot without extensions", () => {
    const view = fixture(true);
    for (const change of [{ number: "EST-9999" }, { version: 4 }, { name: "Other" }, { totalCents: 1 }]) {
      expect(estimateDecisionChatViewSchema.safeParse({ ...view,
        review: { ...view.review, estimate: { ...view.review.estimate, ...change } } }).success).toBe(false);
    }
    for (const change of [{ estimateId: previousId }, { expectedVersion: 4 }]) {
      expect(estimateDecisionChatViewSchema.safeParse({ ...view, value: { ...view.value, ...change } }).success).toBe(false);
    }
    expect(estimateDecisionChatViewSchema.safeParse({ ...view,
      review: { ...view.review, estimate: { ...view.review.estimate, decision: null } } }).success).toBe(false);
    expect(estimateDecisionChatViewSchema.safeParse({ ...view, review: { ...view.review, timezone: "Not/A_Zone" } }).success).toBe(false);
    expect(estimateDecisionChatViewSchema.safeParse({ ...view, review: { ...view.review, internalNotes: "private" } }).success).toBe(false);
    expect(estimateDecisionChatViewSchema.safeParse({ ...view, publicToken: "private-token" }).success).toBe(false);
    expect(estimateDecisionChatTicketSchema.safeParse({ ...view.ticket, note: "Do not stream" }).success).toBe(false);
  });
  it.each(["outcome", "decisionDate", "channel"])("keeps missing %s visible and unconfirmable", field => {
    const view = fixture();
    const incomplete = { ...view, value: { ...view.value, [field]: "" }, canConfirm: false };
    expect(estimateDecisionChatViewSchema.safeParse(incomplete).success).toBe(true);
    expect(estimateDecisionChatCommand(incomplete, id)).toBeNull();
    expect(estimateDecisionChatViewSchema.safeParse({ ...incomplete, canConfirm: true }).success).toBe(false);
  });
  it("preserves literal reviewed text, trims submitted text, binds previous ID and supports explicitly clearing a note", () => {
    const view = fixture(true);
    const command = estimateDecisionChatCommand(view, id);
    expect(command).toMatchObject({
      mode: "correct", expectedDecisionId: previousId, note: "New private note\nwith literal <b>text</b>", reason: "Correction reason",
    });
    expect(view.value.note).toMatch(/^  /);
    expect(estimateDecisionChatCommand({ ...view, value: { ...view.value, note: "" } }, id)?.note).toBe("");
    const initial = estimateDecisionChatCommand(fixture(), id);
    expect(initial).toMatchObject({ mode: "record", expectedDecisionId: null });
    expect(initial).not.toHaveProperty("reason");
  });
  it("blocks future dates, missing correction reasons and separate permission loss", () => {
    const view = fixture(true);
    for (const value of [{ ...view.value, reason: "" }, { ...view.value, reason: "  " }, { ...view.value, decisionDate: "2026-10-28" }]) {
      expect(estimateDecisionChatViewSchema.safeParse({ ...view, value, canConfirm: false }).success).toBe(true);
      expect(estimateDecisionChatCommand({ ...view, value }, id)).toBeNull();
    }
    for (const permission of ["canDecide", "canCorrectDecision"]) {
      const review = { ...view.review, [permission]: false };
      expect(estimateDecisionChatViewSchema.safeParse({ ...view, review, canConfirm: false }).success).toBe(true);
      expect(estimateDecisionChatCommand({ ...view, review }, id)).toBeNull();
    }
  });
  it("does not construct a command from mismatched proposed identity or a hidden initial correction reason", () => {
    const view = fixture();
    for (const change of [{ estimateId: previousId }, { expectedVersion: 4 }]) {
      expect(estimateDecisionChatCommand({ ...view, value: { ...view.value, ...change } }, id)).toBeNull();
    }
    expect(estimateDecisionChatViewSchema.safeParse({ ...view, value: { ...view.value, reason: "Not an initial decision field" } }).success).toBe(false);
  });
  it("accepts only a confirmed receipt for the exact saved result", () => {
    const view = fixture();
    const receipt = { estimateId: id, decisionId: previousId, status: "declined", version: 4, updatedAt: "2026-10-27T12:01:00.000Z" };
    const confirmed = { ...view, ticket: { ...view.ticket, state: "confirmed" }, receipt };
    expect(estimateDecisionChatViewSchema.safeParse(confirmed).success).toBe(true);
    expect(estimateDecisionChatViewSchema.safeParse({ ...confirmed, receipt: null }).success).toBe(false);
    expect(estimateDecisionChatViewSchema.safeParse({ ...view, receipt }).success).toBe(false);
    for (const change of [{ estimateId: previousId }, { version: 3 }, { status: "accepted" }]) {
      expect(estimateDecisionChatViewSchema.safeParse({ ...confirmed, receipt: { ...receipt, ...change } }).success).toBe(false);
    }
  });
});
