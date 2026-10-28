import { estimateVoidChatViewSchema, type EstimateVoidChatView } from "@salesmora/contracts";
import { estimateVoidCardData as c } from "./estimate-void-card.data";
import type { EstimateVoidCardContext, EstimateVoidCardGrants } from "./estimate-void-card.types";

export const estimateVoidWorkspace = "10000000-0000-4000-8000-000000000001";
export const estimateVoidOtherWorkspace = "10000000-0000-4000-8000-000000000009";
export const estimateVoidGrants: EstimateVoidCardGrants = { read: true, parentAccess: true, void: true };
export function estimateVoidCardFixture(now = Date.now()): EstimateVoidChatView {
  return estimateVoidChatViewSchema.parse({
    ticket: {
      id: "10000000-0000-4000-8000-000000000002", actionType: "estimate.void",
      inputHash: "a".repeat(64), reviewHash: "b".repeat(64), authorizationVersion: "c".repeat(64), snapshotHash: "d".repeat(64),
      createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 900000).toISOString(), state: "pending",
      estimate: { id: "10000000-0000-4000-8000-000000000003", version: 3, number: "EST-2048", revision: 1,
        name: c.stories.sourceName, status: "sent", archived: false },
    },
    review: {
      recipientName: c.stories.recipient, totalCents: 96917, reason: c.stories.reason,
      parent: { type: "job", id: "10000000-0000-4000-8000-000000000005", version: 1, number: "J-1038", name: c.stories.parentName },
      today: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(now)), timezone: "America/New_York",
    },
    canConfirm: true, receipt: null,
  });
}
export function estimateVoidCardContext(view: EstimateVoidChatView): EstimateVoidCardContext {
  return { workspaceId: estimateVoidWorkspace, view: structuredClone(view) };
}
export function estimateVoidCardConfirmed(view: EstimateVoidChatView): EstimateVoidChatView {
  return estimateVoidChatViewSchema.parse({
    ...view, ticket: { ...view.ticket, state: "confirmed" }, receipt: {
      estimateId: view.ticket.estimate.id, version: view.ticket.estimate.version + 1,
      status: "void", updatedAt: new Date().toISOString(),
    },
  });
}
