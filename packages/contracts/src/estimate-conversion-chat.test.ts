import { describe, expect, it } from "vitest";
import { estimateProposeChatSchema, estimateProposeChatToolParameters } from "./estimate-share-chat";
import {
  estimateConversionChatBindingSchema,
  estimateConversionChatDecisionSchema,
  estimateConversionChatProposeSchema,
  estimateConversionChatTicketSchema,
  estimateConversionChatViewSchema,
} from "./estimate-conversion-chat";

const estimateId = "10000000-0000-4000-8000-000000000001";
const leadId = "10000000-0000-4000-8000-000000000002";
const customerId = "10000000-0000-4000-8000-000000000003";
const hash = "a".repeat(64);

function fixture() {
  const estimate = {
    id: estimateId,
    number: "EST-2048",
    revision: 1,
    version: 3,
    name: "Repair",
    status: "accepted" as const,
    archived: false,
    parentType: "lead" as const,
    parentId: leadId,
    parentNumber: "LD-1024",
    snapshotHash: hash,
    totalCents: 10000,
    customerId,
    sourceLeadVersion: 4,
    sourceLeadArchived: false,
    customerVersion: 2,
    convertedJobExists: false,
    sourceLeadHasJob: false,
    service: "Plumbing",
    scope: "Repair the fixture.",
    serviceAddress: "1 Fixture Avenue",
    convertedJob: null,
  };
  const customer = { state: "ready" as const, id: customerId, name: "Customer" };
  const now = "2026-10-27T12:00:00.000Z";
  const ticket = estimateConversionChatTicketSchema.parse({
    id: "20000000-0000-4000-8000-000000000001",
    actionType: "estimate.convert",
    inputHash: "b".repeat(64),
    authorizationVersion: "c".repeat(64),
    createdAt: now,
    expiresAt: "2026-10-27T12:15:00.000Z",
    state: "pending",
    estimate,
    customer,
  });
  const review = {
    estimate,
    capabilities: { read: true },
    canCreateJob: true,
    canScheduleCreation: false,
    canResolveCustomer: false,
    customer,
    review: {
      estimateId,
      expectedVersion: 3,
      expectedLeadVersion: 4,
      expectedCustomerVersion: 2,
      snapshotHash: hash,
      sourceLeadId: leadId,
      job: {
        customerId,
        customerName: "Customer",
        title: "Repair",
        service: "Plumbing",
        location: "1 Fixture Avenue",
        description: "Repair the fixture.",
        primaryOwnerId: null,
        teamUserIds: [],
        scheduledDate: null,
        arrivalWindow: null,
        completionDeadline: null,
      },
    },
    members: [],
    parentJob: null,
  };
  const view = estimateConversionChatViewSchema.parse({ ticket, review });
  return { ticket, view };
}

describe("Estimate assistant conversion contracts", () => {
  it("allows only an exact proposal request and publishes it in the shared tool schema", () => {
    const request = { operation: "convert", estimateRef: estimateId };
    expect(estimateConversionChatProposeSchema.parse({ request })).toEqual({ request });
    expect(estimateProposeChatSchema.parse({ request })).toEqual({ request });
    expect(JSON.stringify(estimateProposeChatToolParameters)).toContain("convert");
    expect(estimateConversionChatProposeSchema.parse({
      request: { operation: "convert", estimateRef: null },
    }).request.estimateRef).toBeNull();
    for (const field of ["workspaceId", "confirm", "job", "snapshotHash", "customerId"]) {
      expect(estimateConversionChatProposeSchema.safeParse({
        request: { ...request, [field]: "injected" },
      }).success).toBe(false);
    }
  });

  it("limits the proposal lifetime to fifteen minutes and rejects hidden ticket extensions", () => {
    const { ticket } = fixture();
    expect(ticket.state).toBe("pending");
    for (const change of [
      { expiresAt: ticket.createdAt },
      { expiresAt: "2026-10-27T12:15:00.001Z" },
      { actionType: "estimate.send" },
      { internalNotes: "private" },
    ]) {
      expect(estimateConversionChatTicketSchema.safeParse({ ...ticket, ...change }).success).toBe(false);
    }
  });

  it("uses a strictly bound review-or-cancel command without job fields", () => {
    const { ticket } = fixture();
    const binding = {
      proposalId: ticket.id,
      actionType: ticket.actionType,
      inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion,
      estimateId,
      expectedVersion: ticket.estimate.version,
      snapshotHash: ticket.estimate.snapshotHash,
      sourceLeadId: ticket.estimate.parentId,
    };
    expect(estimateConversionChatBindingSchema.parse(binding)).toEqual(binding);
    for (const decision of ["review", "cancel"]) {
      expect(estimateConversionChatDecisionSchema.parse({
        workspaceId: leadId,
        request: binding,
        decision,
      }).decision).toBe(decision);
      expect(estimateConversionChatDecisionSchema.safeParse({
        workspaceId: leadId,
        request: binding,
        decision,
        job: {},
      }).success).toBe(false);
    }
  });

  it("requires the compact ticket and authorized review to describe the same records", () => {
    const { view } = fixture();
    expect(estimateConversionChatViewSchema.parse(view)).toEqual(view);
    expect(estimateConversionChatViewSchema.safeParse({
      ...view,
      review: { ...view.review, estimate: { ...view.review.estimate, version: 4 } },
    }).success).toBe(false);
    expect(estimateConversionChatViewSchema.safeParse({
      ...view,
      review: { ...view.review, customer: { ...view.review.customer, name: "Different customer" } },
    }).success).toBe(false);
    expect(estimateConversionChatViewSchema.safeParse({
      ...view,
      review: { ...view.review, internalNotes: "private" },
    }).success).toBe(false);
  });
});
