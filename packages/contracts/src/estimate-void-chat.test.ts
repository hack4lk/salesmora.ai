import { describe, expect, it } from "vitest";
import {
  estimateVoidChatBindingSchema, estimateVoidChatDecisionSchema, estimateVoidChatProposeSchema,
  estimateVoidChatResponseSchema, estimateVoidChatStoredSchema, estimateVoidChatTicketSchema, estimateVoidChatViewSchema,
} from "./estimate-void-chat";
import { estimateProposeChatSchema } from "./estimate-share-chat";

const id = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
function fixture() {
  return estimateVoidChatViewSchema.parse({
    ticket: {
      id, actionType: "estimate.void", inputHash: "a".repeat(64), reviewHash: "b".repeat(64),
      authorizationVersion: "c".repeat(64), snapshotHash: "d".repeat(64),
      createdAt: "2026-10-27T12:00:00.000Z", expiresAt: "2026-10-27T12:15:00.000Z", state: "pending",
      estimate: { id, version: 3, number: "EST-2048", revision: 1, name: "Repair", status: "sent", archived: false },
    },
    review: {
      recipientName: "Customer", totalCents: 0, reason: "Customer requested withdrawal",
      parent: { type: "job", id, version: 1, number: "J-2048", name: "Repair work" },
      today: "2026-10-27", timezone: "America/New_York",
    },
    canConfirm: true, receipt: null,
  });
}
describe("Estimate assistant Void contracts", () => {
  it.each([null, id, "EST-2048"])("advertises only exact or selected-page reference %s and a user reason", estimateRef => {
    const request = { operation: "void", estimateRef, reason: "User supplied reason" };
    expect(estimateVoidChatProposeSchema.parse({ request })).toEqual({ request });
    expect(estimateProposeChatSchema.parse({ request })).toEqual({ request });
  });
  it.each(["latest estimate", "Repair", "", "EST-1", 123])("rejects ambiguous/invalid reference %s", estimateRef => {
    expect(estimateVoidChatProposeSchema.safeParse({ request: { operation: "void", estimateRef, reason: null } }).success).toBe(false);
  });
  it.each(["confirm", "workspaceId", "snapshotHash", "version", "status", "recipientName", "canVoid", "submissionId"])("rejects model authority field %s", field => {
    expect(estimateVoidChatProposeSchema.safeParse({
      request: { operation: "void", estimateRef: id, reason: null, [field]: "injected" },
    }).success).toBe(false);
    expect(estimateProposeChatSchema.safeParse({
      request: { operation: "void", estimateRef: id, reason: null, [field]: "injected" },
    }).success).toBe(false);
  });
  it("uses the manual raw reason limit before trimming, retaining inner whitespace/newlines", () => {
    const parse = (reason: unknown) => estimateVoidChatProposeSchema.safeParse({ request: { operation: "void", estimateRef: id, reason } });
    expect(parse(null).success).toBe(true);
    for (const reason of ["", " \n ", "x".repeat(501), ` ${"x".repeat(499)} `, undefined]) expect(parse(reason).success).toBe(false);
    expect(parse("x".repeat(500)).success).toBe(true);
    expect(estimateVoidChatProposeSchema.parse({ request: {
      operation: "void", estimateRef: id, reason: "  User reason\nsecond  line  ",
    } }).request.reason).toBe("User reason\nsecond  line");
  });
  it.each(["confirm", "cancel", "open"])("uses strict metadata only for %s", decision => {
    const { ticket } = fixture();
    const request = {
      proposalId: id, actionType: ticket.actionType, inputHash: ticket.inputHash, authorizationVersion: ticket.authorizationVersion,
      reviewHash: ticket.reviewHash, snapshotHash: ticket.snapshotHash, estimateId: id, expectedVersion: 3,
    };
    expect(estimateVoidChatDecisionSchema.parse({ workspaceId: id, request, decision }).decision).toBe(decision);
    for (const field of ["reason", "status", "canVoid", "recipientName", "receipt", "confirmed"]) {
      expect(estimateVoidChatBindingSchema.safeParse({ ...request, [field]: "injected" }).success).toBe(false);
      expect(estimateVoidChatDecisionSchema.safeParse({ workspaceId: id, request, decision, [field]: "injected" }).success).toBe(false);
    }
    expect(estimateVoidChatDecisionSchema.safeParse({ workspaceId: id, request, decision: "yes" }).success).toBe(false);
  });
  it("keeps the reason, recipient and amounts out of compact tickets", () => {
    const { ticket } = fixture();
    for (const field of ["reason", "recipientName", "recipientEmail", "totalCents", "review", "receipt", "href", "privateNotes"]) {
      expect(JSON.stringify(ticket)).not.toContain(`"${field}"`);
      expect(estimateVoidChatTicketSchema.safeParse({ ...ticket, [field]: "injected" }).success).toBe(false);
    }
  });
  it.each(["draft", "accepted", "declined", "expired", "superseded", "void"])("rejects source status %s", status => {
    const { ticket } = fixture();
    expect(estimateVoidChatTicketSchema.safeParse({ ...ticket, estimate: { ...ticket.estimate, status } }).success).toBe(false);
  });
  it("requires unarchived sources and a positive, at-most-15-minute review window", () => {
    const { ticket } = fixture();
    for (const change of [
      { estimate: { ...ticket.estimate, archived: true } }, { expiresAt: ticket.createdAt },
      { expiresAt: "2026-10-27T12:15:00.001Z" }, { inputHash: "invalid" }, { actionType: "estimate.archive" },
    ]) expect(estimateVoidChatTicketSchema.safeParse({ ...ticket, ...change }).success).toBe(false);
    expect(estimateVoidChatTicketSchema.parse({ ...ticket, estimate: { ...ticket.estimate, status: "published" } }).estimate.status).toBe("published");
  });
  it("represents a missing reason explicitly without enabling confirmation or allowing false receipts", () => {
    const view = fixture(), review = { ...view.review, reason: "" };
    expect(estimateVoidChatViewSchema.parse({ ...view, review, canConfirm: false }).canConfirm).toBe(false);
    for (const change of [
      { review }, { canConfirm: false }, { review: { ...view.review, reason: " reason " } },
      { review: { ...view.review, reason: "x".repeat(501) } }, { review: { ...view.review, timezone: "invalid" } },
      { ticket: { ...view.ticket, state: "confirmed" } }, { receipt: { estimateId: id, version: 4, status: "void", updatedAt: view.ticket.createdAt } },
    ]) expect(estimateVoidChatViewSchema.safeParse({ ...view, ...change }).success).toBe(false);
  });
  it("binds saved receipts to the exact source and next version, never a new or unrelated Estimate", () => {
    const view = fixture();
    const confirmed = { ...view, ticket: { ...view.ticket, state: "confirmed" },
      receipt: { estimateId: id, version: 4, status: "void", updatedAt: view.ticket.createdAt } };
    expect(estimateVoidChatViewSchema.parse(confirmed).receipt?.status).toBe("void");
    for (const receipt of [
      { ...confirmed.receipt, estimateId: other }, { ...confirmed.receipt, version: 3 }, { ...confirmed.receipt, status: "archived" },
    ]) expect(estimateVoidChatViewSchema.safeParse({ ...confirmed, receipt }).success).toBe(false);
    expect(estimateVoidChatStoredSchema.safeParse({ ...confirmed, stamp: "e".repeat(32), resultStamp: null }).success).toBe(false);
    expect(estimateVoidChatStoredSchema.parse({ ...confirmed, stamp: "e".repeat(32), resultStamp: "f".repeat(32) }).resultStamp).not.toBeNull();
    expect(estimateVoidChatStoredSchema.safeParse({ ...view, stamp: "e".repeat(32), resultStamp: "f".repeat(32) }).success).toBe(false);
  });
  it("does not put server evidence or customer token URLs in browser responses", () => {
    const view = fixture();
    expect(estimateVoidChatResponseSchema.parse({ view })).toEqual({ view });
    expect(estimateVoidChatResponseSchema.safeParse({ view, href: "https://other.example.test" }).success).toBe(false);
    expect(estimateVoidChatViewSchema.safeParse({ ...view, stamp: "e".repeat(32) }).success).toBe(false);
    expect(estimateVoidChatResponseSchema.safeParse({ view, bearerToken: "private" }).success).toBe(false);
  });
});
