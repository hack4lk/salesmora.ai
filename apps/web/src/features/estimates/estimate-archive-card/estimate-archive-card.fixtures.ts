import { estimateArchiveChatViewSchema, type EstimateArchiveChatView } from "@salesmora/contracts";
import { estimateArchiveCardData as c } from "./estimate-archive-card.data";
import type { EstimateArchiveCardContext, EstimateArchiveCardGrants } from "./estimate-archive-card.types";

export const estimateArchiveWorkspace = "10000000-0000-4000-8000-000000000001";
export const estimateArchiveOtherWorkspace = "10000000-0000-4000-8000-000000000009";
export const estimateArchiveGrants: EstimateArchiveCardGrants = { read: true, parentAccess: true, archive: true };
export function estimateArchiveCardFixture(operation: "archive" | "restore" = "archive", now = Date.now()): EstimateArchiveChatView {
  return estimateArchiveChatViewSchema.parse({
    ticket: {
      id: "10000000-0000-4000-8000-000000000002", actionType: `estimate.${operation}`,
      inputHash: "a".repeat(64), reviewHash: "b".repeat(64), authorizationVersion: "c".repeat(64),
      createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 900000).toISOString(), state: "pending",
      estimate: { id: "10000000-0000-4000-8000-000000000003", version: 3, number: "EST-2048", revision: 1,
        name: c.stories.sourceName, status: "declined", archived: operation === "restore" },
    },
    review: {
      recipientName: c.stories.recipient,
      parent: { type: "job", id: "10000000-0000-4000-8000-000000000005", version: 1, number: "J-1038", name: c.stories.parentName },
      today: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(now)), timezone: "America/New_York",
    },
    receipt: null,
  });
}
export function estimateArchiveCardContext(view: EstimateArchiveChatView): EstimateArchiveCardContext {
  return { workspaceId: estimateArchiveWorkspace, view: structuredClone(view) };
}
export function estimateArchiveCardConfirmed(view: EstimateArchiveChatView): EstimateArchiveChatView {
  return estimateArchiveChatViewSchema.parse({
    ...view, ticket: { ...view.ticket, state: "confirmed" }, receipt: {
      estimateId: view.ticket.estimate.id, version: view.ticket.estimate.version + 1,
      archived: view.ticket.actionType === "estimate.archive", updatedAt: new Date().toISOString(),
    },
  });
}
