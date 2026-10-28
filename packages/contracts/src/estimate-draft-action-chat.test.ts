import { describe, expect, it } from "vitest";
import {
  estimateDraftActionChatBindingSchema, estimateDraftActionChatDecisionSchema, estimateDraftActionChatProposeSchema,
  estimateDraftActionChatResponseSchema, estimateDraftActionChatStoredSchema,
  estimateDraftActionChatTicketSchema, estimateDraftActionChatViewSchema,
} from "./estimate-draft-action-chat";
import { estimateProposeChatSchema } from "./estimate-share-chat";

const id = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
function fixture(duplicate = false, reuse = false) {
  return estimateDraftActionChatViewSchema.parse({
    ticket: {
      id, actionType: duplicate ? "estimate.duplicate" : "estimate.revise",
      inputHash: "a".repeat(64), reviewHash: "b".repeat(64), authorizationVersion: "c".repeat(64),
      createdAt: "2026-10-27T12:00:00.000Z", expiresAt: "2026-10-27T12:15:00.000Z", state: "pending",
      source: { id, version: 3, number: "EST-2048", revision: 1, name: "Repair", status: "published", archived: false },
      plan: { kind: reuse ? "reuse" : "create", revision: duplicate ? 1 : 3, existingDraft: reuse ? { id: other, version: 2 } : null },
    },
    review: {
      parent: { type: "job", id, version: 1, number: "J-2048", name: "Customer work" },
      values: {
        details: { name: duplicate ? "Repair (copy)" : "Repair", recipientName: duplicate ? "" : "Customer",
          recipientEmail: duplicate ? "" : "customer@example.test", serviceAddress: "1 Test Lane", ownerId: id },
        scope: "Literal scope <tag>", items: [{ description: "Repair", quantity: "1", unitPrice: "100.00", taxable: false, included: false }],
        totals: { discount: { type: "none" }, taxRate: "0" },
        terms: { message: "Customer message", validUntil: duplicate ? "" : "2026-11-01",
          paymentTerms: "Due in 30 days", termsNote: "Customer terms", deposit: { type: "none" } },
        internalNotes: duplicate || reuse ? "Private staff note" : "", paymentLink: duplicate ? "" : "https://payments.example.test/review-me",
      },
      totalCents: 10000, snapshotHash: duplicate ? null : "d".repeat(64),
    },
    receipt: null,
  });
}
describe("Estimate assistant Revise/Duplicate contracts", () => {
  it.each(["revise", "duplicate"])("prepares %s with only an exact reference or selected-page reference", operation => {
    for (const estimateRef of [null, id, "EST-2048"]) {
      const request = { operation, estimateRef };
      expect(estimateDraftActionChatProposeSchema.parse({ request })).toEqual({ request });
      expect(estimateProposeChatSchema.parse({ request })).toEqual({ request });
    }
    for (const estimateRef of ["repair", "latest estimate", "", 123]) {
      expect(estimateDraftActionChatProposeSchema.safeParse({ request: { operation, estimateRef } }).success).toBe(false);
    }
    for (const field of ["confirm", "workspaceId", "values", "parentId", "recipientEmail", "snapshotHash", "submissionId", "expectedVersion"]) {
      expect(estimateDraftActionChatProposeSchema.safeParse({ request: { operation, estimateRef: id, [field]: "injected" } }).success).toBe(false);
      expect(estimateProposeChatSchema.safeParse({ request: { operation, estimateRef: id, [field]: "injected" } }).success).toBe(false);
    }
    expect(estimateDraftActionChatProposeSchema.safeParse({ request: { operation } }).success).toBe(false);
  });
  it.each(["confirm", "cancel", "open"])("uses a metadata-only binding for %s", decision => {
    const { ticket } = fixture();
    const request = { proposalId: id, actionType: ticket.actionType, inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash, estimateId: id, expectedVersion: 3 };
    expect(estimateDraftActionChatDecisionSchema.parse({ workspaceId: id, request, decision }).decision).toBe(decision);
    for (const field of ["values", "plan", "parentId", "receipt", "snapshotHash", "source", "canCreate", "confirm"]) {
      expect(estimateDraftActionChatBindingSchema.safeParse({ ...request, [field]: "injected" }).success).toBe(false);
      expect(estimateDraftActionChatDecisionSchema.safeParse({ workspaceId: id, request, decision, [field]: "injected" }).success).toBe(false);
    }
    expect(estimateDraftActionChatDecisionSchema.safeParse({ workspaceId: id, request, decision: "yes" }).success).toBe(false);
  });
  it("keeps all private copied fields out of compact tickets and rejects extensions", () => {
    const view = fixture(true), text = JSON.stringify(view.ticket);
    for (const field of ["recipientName", "recipientEmail", "internalNotes", "scope", "paymentLink", "items", "values", "receipt"]) {
      expect(text).not.toContain(`"${field}"`);
      expect(estimateDraftActionChatTicketSchema.safeParse({ ...view.ticket, [field]: "injected" }).success).toBe(false);
    }
    expect(estimateDraftActionChatViewSchema.safeParse({ ...view, bearerToken: "private" }).success).toBe(false);
  });
  it("requires a real bounded review window and a distinct pending Draft identity", () => {
    const { ticket } = fixture();
    for (const change of [
      { expiresAt: ticket.createdAt }, { expiresAt: "2026-10-27T12:15:00.001Z" },
      { plan: { ...ticket.plan, kind: "reuse" } },
      { plan: { ...ticket.plan, existingDraft: { id: other, version: 1 } } },
      { plan: { ...ticket.plan, kind: "reuse", existingDraft: { id, version: 1 } } },
      { plan: { ...ticket.plan, revision: 1 } },
      { actionType: "estimate.send" }, { reviewHash: "x" },
    ]) expect(estimateDraftActionChatTicketSchema.safeParse({ ...ticket, ...change }).success).toBe(false);
  });
  it.each(["draft", "accepted", "superseded", "void"])("rejects ineligible Revise source %s", status => {
    const { ticket } = fixture();
    expect(estimateDraftActionChatTicketSchema.safeParse({ ...ticket, source: { ...ticket.source, status } }).success).toBe(false);
  });
  it("allows manual-equivalent Duplicate of saved archived/closed sources, but not a revision/reuse plan", () => {
    const { ticket } = fixture(true);
    expect(estimateDraftActionChatTicketSchema.safeParse({ ...ticket, source: { ...ticket.source, archived: true, status: "void" } }).success).toBe(true);
    expect(estimateDraftActionChatTicketSchema.safeParse({ ...ticket, plan: { ...ticket.plan, revision: 2 } }).success).toBe(false);
    expect(estimateDraftActionChatTicketSchema.safeParse({ ...ticket,
      plan: { kind: "reuse", revision: 2, existingDraft: { id: other, version: 1 } } }).success).toBe(false);
  });
  it.each(["recipientName", "recipientEmail"])("requires Duplicate to clear %s", field => {
    const view = fixture(true);
    expect(estimateDraftActionChatViewSchema.safeParse({ ...view, review: { ...view.review,
      values: { ...view.review.values, details: { ...view.review.values.details, [field]: "Uncleared" } } } }).success).toBe(false);
  });
  it("requires Duplicate's copy name, cleared validity/payment and null frozen hash", () => {
    const view = fixture(true);
    for (const values of [
      { ...view.review.values, details: { ...view.review.values.details, name: "Invented name" } },
      { ...view.review.values, terms: { ...view.review.values.terms, validUntil: "2026-11-01" } },
      { ...view.review.values, paymentLink: "https://payments.example.test/wrong" },
    ]) expect(estimateDraftActionChatViewSchema.safeParse({ ...view, review: { ...view.review, values } }).success).toBe(false);
    expect(estimateDraftActionChatViewSchema.safeParse({ ...view, review: { ...view.review, snapshotHash: "d".repeat(64) } }).success).toBe(false);
  });
  it("does not copy private notes into new revisions, while preserving reviewed existing Draft edits", () => {
    const view = fixture();
    expect(estimateDraftActionChatViewSchema.safeParse({ ...view, review: { ...view.review,
      values: { ...view.review.values, internalNotes: "Private source note" } } }).success).toBe(false);
    expect(fixture(false, true).review.values.internalNotes).toBe("Private staff note");
    expect(estimateDraftActionChatViewSchema.safeParse({ ...view, review: { ...view.review, snapshotHash: null } }).success).toBe(false);
  });
  it("permits empty saved Draft copies with unavailable rather than zero amounts", () => {
    const view = fixture(true);
    const empty = { ...view, review: { ...view.review, totalCents: null, values: { ...view.review.values, items: [] } } };
    expect(estimateDraftActionChatViewSchema.safeParse(empty).success).toBe(true);
    expect(estimateDraftActionChatViewSchema.safeParse({ ...empty, review: { ...empty.review, totalCents: 0 } }).success).toBe(false);
    expect(estimateDraftActionChatViewSchema.safeParse({ ...view, review: { ...view.review, totalCents: null } }).success).toBe(false);
  });
  it.each([false, true])("binds exact new-Draft receipts for duplicate=%s", duplicate => {
    const view = fixture(duplicate);
    const confirmed = { ...view, ticket: { ...view.ticket, state: "confirmed" }, receipt: {
      id: other, number: duplicate ? "EST-3000" : view.ticket.source.number, revision: view.ticket.plan.revision,
      version: 1, updatedAt: "2026-10-27T12:01:00.000Z", reused: false,
    } };
    expect(estimateDraftActionChatViewSchema.safeParse(confirmed).success).toBe(true);
    for (const change of [
      { id }, { number: duplicate ? view.ticket.source.number : "EST-3000" }, { revision: 99 }, { version: 2 }, { reused: true },
    ]) expect(estimateDraftActionChatViewSchema.safeParse({ ...confirmed, receipt: { ...confirmed.receipt, ...change } }).success).toBe(false);
    expect(estimateDraftActionChatViewSchema.safeParse({ ...confirmed, receipt: null }).success).toBe(false);
    expect(estimateDraftActionChatViewSchema.safeParse({ ...confirmed, ticket: view.ticket }).success).toBe(false);
  });
  it("binds reused Draft identity/version and stores post-operation evidence only for confirmation", () => {
    const view = fixture(false, true);
    const confirmed = { ...view, ticket: { ...view.ticket, state: "confirmed" }, receipt: {
      id: other, number: view.ticket.source.number, revision: view.ticket.plan.revision,
      version: 2, updatedAt: "2026-10-27T12:01:00.000Z", reused: true,
    } };
    expect(estimateDraftActionChatStoredSchema.safeParse({ ...confirmed, stamp: "e".repeat(32), resultStamp: "f".repeat(32) }).success).toBe(true);
    expect(estimateDraftActionChatStoredSchema.safeParse({ ...confirmed, stamp: "e".repeat(32), resultStamp: null }).success).toBe(false);
    expect(estimateDraftActionChatStoredSchema.safeParse({ ...view, stamp: "e".repeat(32), resultStamp: "f".repeat(32) }).success).toBe(false);
    expect(estimateDraftActionChatViewSchema.safeParse({ ...confirmed, receipt: { ...confirmed.receipt, version: 1 } }).success).toBe(false);
    expect(estimateDraftActionChatResponseSchema.safeParse({ view: confirmed, href: "https://outside.example.test" }).success).toBe(false);
    expect(estimateDraftActionChatResponseSchema.safeParse({ view: confirmed, href: `/estimates/${id}?workspace=${id}` }).success).toBe(false);
    expect(estimateDraftActionChatResponseSchema.safeParse({ view, href: `/estimates/${other}?workspace=${id}` }).success).toBe(false);
    expect(estimateDraftActionChatResponseSchema.safeParse({ view: confirmed, href: `/estimates/${other}?workspace=${id}` }).success).toBe(true);
  });
});
