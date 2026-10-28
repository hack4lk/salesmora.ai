import { describe, expect, it } from "vitest";
import {
  estimateProposeChatSchema, estimateProposeChatToolParameters,
  estimateShareChatBindingSchema, estimateShareChatDecisionSchema,
  estimateShareChatProposeSchema, estimateShareChatTicketSchema, estimateShareChatViewSchema,
} from "./estimate-share-chat";
function estimateSharingFixture() {
  const id = "10000000-0000-4000-8000-000000000001";
  const content = {
    number: "EST-2048", revision: 1, name: "Repair", validUntil: "2026-11-21",
    business: { name: "Fixture", address: "1 Main Street", email: "fixture@example.test", phone: "555-0100",
      licenseLine: "", logoPath: null, requireServiceAddress: false },
    recipientName: "Customer", recipientEmail: "customer@example.test", serviceAddress: "",
    estimateDate: "2026-10-23", preparedBy: "Owner", relatedRecord: "Job J-1048",
    scope: "", message: "", paymentTerms: "", termsNote: "",
    items: [{ description: "Repair", quantity: "1", unitPrice: "100", unit: "job", taxable: false, included: false }],
    discount: { type: "none" }, taxRate: "0", deposit: { type: "none" },
  };
  return estimateShareChatViewSchema.parse({
    ticket: {
      id, actionType: "estimate.send", inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
      createdAt: "2026-10-23T12:00:00.000Z", expiresAt: "2026-10-23T12:15:00.000Z", state: "pending",
      snapshotHash: "c".repeat(64), requiresDialog: false,
      estimate: { id, version: 3, number: content.number, revision: 1, name: content.name,
        status: "draft", archived: false, totalCents: 10000, validUntil: content.validUntil },
    },
    review: {
      today: "2026-10-23", recipientName: content.recipientName, recipientEmail: content.recipientEmail,
      subject: "Estimate EST-2048", snapshot: { formatVersion: 1, content, amounts: {
        lineAmountsCents: [10000], subtotalCents: 10000, discountCents: 0, taxCents: 0, totalCents: 10000, depositCents: 0, balanceCents: 10000,
      } },
      parent: { type: "job", id, version: 1 }, revision: null,
      delivery: { email: { state: "not-sent" }, link: { state: "not-created", expiresAt: null, firstViewedAt: null } },
    }, receipt: null,
  });
}

describe("Estimate assistant sharing contracts", () => {
  it("uses provider-supported unions in the combined proposal tool schema", () => {
    const schema = JSON.stringify(estimateProposeChatToolParameters);
    expect(schema).toContain('"anyOf"');
    expect(schema).not.toContain('"oneOf"');
  });

  it.each(["send", "publish", "resend"])("accepts only a preparation request for %s", operation => {
    const input = { request: { operation, estimateRef: "EST-2048" } };
    expect(estimateShareChatProposeSchema.parse(input)).toEqual(input);
    expect(estimateProposeChatSchema.parse(input)).toEqual(input);
    for (const field of ["confirm", "recipientEmail", "paymentLinkReviewed", "snapshot", "internalNotes"]) {
      expect(estimateShareChatProposeSchema.safeParse({ request: { ...input.request, [field]: "injected" } }).success).toBe(false);
    }
  });
  it.each(["confirm", "cancel", "open"])("requires a complete exact browser binding for %s", decision => {
    const { ticket } = estimateSharingFixture();
    const binding = {
      proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion, estimateId: ticket.estimate.id,
      expectedVersion: ticket.estimate.version, snapshotHash: ticket.snapshotHash,
    };
    expect(estimateShareChatBindingSchema.parse(binding)).toEqual(binding);
    expect(estimateShareChatDecisionSchema.safeParse({ workspaceId: ticket.estimate.id, request: binding, decision, paymentLinkReviewed: false }).success).toBe(true);
    expect(estimateShareChatDecisionSchema.safeParse({ workspaceId: ticket.estimate.id, request: binding, decision }).success).toBe(false);
    expect(estimateShareChatBindingSchema.safeParse({ ...binding, expectedVersion: 0 }).success).toBe(false);
    expect(estimateShareChatBindingSchema.safeParse({ ...binding, recipientEmail: "not-browser-reviewed@example.test" }).success).toBe(false);
  });
  it("enforces the exact 15-minute window and shared-dialog action family", () => {
    const { ticket } = estimateSharingFixture();
    expect(estimateShareChatTicketSchema.safeParse(ticket).success).toBe(true);
    expect(estimateShareChatTicketSchema.safeParse({ ...ticket, expiresAt: new Date(Date.parse(ticket.createdAt) + 900001).toISOString() }).success).toBe(false);
    expect(estimateShareChatTicketSchema.safeParse({ ...ticket, expiresAt: ticket.createdAt }).success).toBe(false);
    expect(estimateShareChatTicketSchema.safeParse({ ...ticket, actionType: "estimate.publish", requiresDialog: false }).success).toBe(false);
  });
  it("binds customer paper, total, identity and confirmed receipt without public tokens", () => {
    const view = estimateSharingFixture();
    expect(estimateShareChatViewSchema.safeParse(view).success).toBe(true);
    expect(estimateShareChatViewSchema.safeParse({ ...view, ticket: { ...view.ticket, state: "confirmed" } }).success).toBe(false);
    for (const change of [{ number: "EST-9999" }, { revision: 99 }, { totalCents: 0 }, { name: "Other paper" }]) {
      expect(estimateShareChatViewSchema.safeParse({ ...view, ticket: { ...view.ticket, estimate: { ...view.ticket.estimate, ...change } } }).success).toBe(false);
    }
    expect(estimateShareChatViewSchema.safeParse({ ...view, publicToken: "private-token" }).success).toBe(false);
    expect(estimateShareChatViewSchema.safeParse({ ...view, review: { ...view.review, internalNotes: "private" } }).success).toBe(false);
  });
  it("rejects ineligible status, changed Send destinations and hidden revision replacement", () => {
    const view = estimateSharingFixture();
    for (const change of [{ archived: true }, { status: "accepted" }, { status: "sent" }]) {
      expect(estimateShareChatViewSchema.safeParse({ ...view, ticket: { ...view.ticket, estimate: { ...view.ticket.estimate, ...change } } }).success).toBe(false);
    }
    expect(estimateShareChatViewSchema.safeParse({ ...view, review: { ...view.review, recipientEmail: "changed@example.test" } }).success).toBe(false);
    expect(estimateShareChatViewSchema.safeParse({ ...view, review: { ...view.review, subject: "Injected\nsubject" } }).success).toBe(false);
    expect(estimateShareChatViewSchema.safeParse({ ...view, review: { ...view.review, revision: {
      sourceEstimateId: view.ticket.estimate.id, sourceRevision: 1, sourceVersion: 1, sourceStatus: "published", requiresPaymentLinkReview: true,
    } } }).success).toBe(false);
  });
});
