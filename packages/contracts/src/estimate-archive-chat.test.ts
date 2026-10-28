import { describe, expect, it } from "vitest";
import {
  estimateArchiveChatBindingSchema, estimateArchiveChatDecisionSchema, estimateArchiveChatProposeSchema,
  estimateArchiveChatResponseSchema, estimateArchiveChatStoredSchema, estimateArchiveChatTicketSchema, estimateArchiveChatViewSchema,
} from "./estimate-archive-chat";
import { estimateProposeChatSchema } from "./estimate-share-chat";

const id = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
function fixture(operation: "archive" | "restore" = "archive") {
  return estimateArchiveChatViewSchema.parse({
    ticket: {
      id, actionType: `estimate.${operation}`, inputHash: "a".repeat(64), reviewHash: "b".repeat(64), authorizationVersion: "c".repeat(64),
      createdAt: "2026-10-27T12:00:00.000Z", expiresAt: "2026-10-27T12:15:00.000Z", state: "pending",
      estimate: { id, version: 3, number: "EST-2048", revision: 1, name: "Repair", status: "declined", archived: operation === "restore" },
    },
    review: {
      recipientName: "Customer", parent: { type: "job", id, version: 1, number: "J-2048", name: "Repair work" },
      today: "2026-10-27", timezone: "America/New_York",
    },
    receipt: null,
  });
}
describe("Estimate assistant Archive/Restore foundation contracts", () => {
  it.each(["archive", "restore"] as const)("accepts only exact or selected-page references for %s", operation => {
    for (const estimateRef of [null, id, "EST-2048"]) {
      const request = { operation, estimateRef };
      expect(estimateArchiveChatProposeSchema.parse({ request })).toEqual({ request });
      expect(estimateProposeChatSchema.parse({ request })).toEqual({ request });
    }
  });
  it.each(["latest estimate", "Repair", "", "EST-1", 123, undefined])("rejects ambiguous/invalid reference %s", estimateRef => {
    expect(estimateArchiveChatProposeSchema.safeParse({ request: { operation: "archive", estimateRef } }).success).toBe(false);
    expect(estimateProposeChatSchema.safeParse({ request: { operation: "archive", estimateRef } }).success).toBe(false);
  });
  it.each(["confirm", "workspaceId", "reason", "snapshotHash", "version", "archivedAt", "archivedBy", "status", "recipientName", "canArchive", "submissionId"])("rejects model authority field %s", field => {
    for (const operation of ["archive", "restore"]) {
      expect(estimateArchiveChatProposeSchema.safeParse({ request: { operation, estimateRef: id, [field]: "injected" } }).success).toBe(false);
      expect(estimateArchiveChatProposeSchema.safeParse({ request: { operation, estimateRef: id }, [field]: "injected" }).success).toBe(false);
      expect(estimateProposeChatSchema.safeParse({ request: { operation, estimateRef: id, [field]: "injected" } }).success).toBe(false);
      expect(estimateProposeChatSchema.safeParse({ request: { operation, estimateRef: id }, [field]: "injected" }).success).toBe(false);
    }
  });
  it.each(["confirm", "cancel", "open"])("uses strict metadata only for %s", decision => {
    const { ticket } = fixture();
    const request = {
      proposalId: id, actionType: ticket.actionType, inputHash: ticket.inputHash, authorizationVersion: ticket.authorizationVersion,
      reviewHash: ticket.reviewHash, estimateId: id, expectedVersion: 3,
    };
    expect(estimateArchiveChatDecisionSchema.parse({ workspaceId: id, request, decision }).decision).toBe(decision);
    for (const field of ["reason", "status", "archivedAt", "archivedBy", "recipientName", "receipt", "confirmed"]) {
      expect(estimateArchiveChatBindingSchema.safeParse({ ...request, [field]: "injected" }).success).toBe(false);
      expect(estimateArchiveChatDecisionSchema.safeParse({ workspaceId: id, request, decision, [field]: "injected" }).success).toBe(false);
    }
    expect(estimateArchiveChatDecisionSchema.safeParse({ workspaceId: id, request, decision: "yes" }).success).toBe(false);
  });
  it("keeps all private review and destination data out of compact tickets", () => {
    for (const operation of ["archive", "restore"] as const) {
      const { ticket } = fixture(operation);
      for (const field of ["reason", "recipientName", "recipientEmail", "totalCents", "review", "receipt", "href", "privateNotes", "parent"]) {
        expect(JSON.stringify(ticket)).not.toContain(`"${field}"`);
        expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, [field]: "injected" }).success).toBe(false);
      }
    }
  });
  it.each(["draft", "sent", "published", "accepted"])("rejects Archive source status %s", status => {
    const { ticket } = fixture();
    expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, estimate: { ...ticket.estimate, status } }).success).toBe(false);
  });
  it.each(["declined", "expired", "superseded", "void"])("accepts only unarchived %s for Archive", status => {
    const { ticket } = fixture();
    expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, estimate: { ...ticket.estimate, status } }).success).toBe(true);
    expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, estimate: { ...ticket.estimate, status, archived: true } }).success).toBe(false);
  });
  it.each(["draft", "sent", "published", "accepted", "declined", "expired", "superseded", "void"])("allows Restore of archived %s without rewriting the underlying status", status => {
    const { ticket } = fixture("restore");
    expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, estimate: { ...ticket.estimate, status } }).success).toBe(true);
    expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, estimate: { ...ticket.estimate, status, archived: false } }).success).toBe(false);
  });
  it("requires a positive at-most-15-minute review window and exact typed identifiers", () => {
    const { ticket } = fixture();
    for (const change of [
      { expiresAt: ticket.createdAt }, { expiresAt: "2026-10-27T12:15:00.001Z" },
      { inputHash: "invalid" }, { actionType: "estimate.delete" }, { estimate: { ...ticket.estimate, version: 0 } },
    ]) expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, ...change }).success).toBe(false);
    expect(estimateArchiveChatTicketSchema.safeParse({ ...ticket, expiresAt: "2026-10-27T12:00:00.001Z" }).success).toBe(true);
  });
  it.each(["archive", "restore"] as const)("binds %s receipts to the source, exact action and next version", operation => {
    const view = fixture(operation);
    const confirmed = { ...view, ticket: { ...view.ticket, state: "confirmed" },
      receipt: { estimateId: id, version: 4, archived: operation === "archive", updatedAt: view.ticket.createdAt } };
    expect(estimateArchiveChatViewSchema.parse(confirmed).receipt?.version).toBe(4);
    expect(estimateArchiveChatViewSchema.safeParse({ ...view, receipt: confirmed.receipt }).success).toBe(false);
    for (const receipt of [
      null, { ...confirmed.receipt, estimateId: other }, { ...confirmed.receipt, version: 3 },
      { ...confirmed.receipt, archived: !confirmed.receipt.archived }, { ...confirmed.receipt, status: "void" },
    ]) expect(estimateArchiveChatViewSchema.safeParse({ ...confirmed, receipt }).success).toBe(false);
    expect(estimateArchiveChatStoredSchema.safeParse({ ...confirmed, stamp: "e".repeat(32), resultStamp: null }).success).toBe(false);
    expect(estimateArchiveChatStoredSchema.parse({ ...confirmed, stamp: "e".repeat(32), resultStamp: "f".repeat(32) }).resultStamp).not.toBeNull();
    expect(estimateArchiveChatStoredSchema.safeParse({ ...view, stamp: "e".repeat(32), resultStamp: "f".repeat(32) }).success).toBe(false);
  });
  it("retains an actual empty saved recipient and validates identity/parent/date without requiring frozen paper", () => {
    const view = fixture("restore");
    expect(estimateArchiveChatViewSchema.parse({
      ...view,
      review: { ...view.review, recipientName: "" },
    }).review.recipientName).toBe("");
    expect(estimateArchiveChatTicketSchema.safeParse({ ...view.ticket, estimate: { ...view.ticket.estimate, name: "" } }).success).toBe(false);
    for (const review of [
      { ...view.review, timezone: "invalid" }, { ...view.review, today: "2026-02-30" },
      { ...view.review, parent: { ...view.review.parent, version: 0 } }, { ...view.review, reason: "not required" },
      { ...view.review, recipientName: "x".repeat(201) },
    ]) expect(estimateArchiveChatViewSchema.safeParse({ ...view, review }).success).toBe(false);
  });
  it("allows only explicit exact saved-result URLs and never server evidence or customer links", () => {
    const view = fixture(), href = `/estimates/${id}?workspace=${other}`;
    expect(estimateArchiveChatResponseSchema.parse({ view })).toEqual({ view });
    expect(estimateArchiveChatResponseSchema.safeParse({ view, href }).success).toBe(false);
    const saved = { ...view, ticket: { ...view.ticket, state: "confirmed" },
      receipt: { estimateId: id, version: 4, archived: true, updatedAt: view.ticket.createdAt } };
    expect(estimateArchiveChatResponseSchema.parse({ view: saved, href }).href).toBe(href);
    for (const href of [`/estimates/${other}?workspace=${id}`, "https://other.example.test", "/e/customer-token"]) {
      expect(estimateArchiveChatResponseSchema.safeParse({ view: saved, href }).success).toBe(false);
    }
    expect(estimateArchiveChatViewSchema.safeParse({ ...view, stamp: "e".repeat(32) }).success).toBe(false);
    expect(estimateArchiveChatResponseSchema.safeParse({ view, bearerToken: "private" }).success).toBe(false);
  });
});
