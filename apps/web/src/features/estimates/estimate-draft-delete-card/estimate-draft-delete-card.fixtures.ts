import {
  estimateDraftDeleteChatViewSchema,
  type EstimateDraftDeleteChatView,
} from "@salesmora/contracts";
import { estimateDraftDeleteCardData as c } from "./estimate-draft-delete-card.data";
import type {
  EstimateDraftDeleteCardContext,
  EstimateDraftDeleteCardGrants,
} from "./estimate-draft-delete-card.types";

export const estimateDraftDeleteWorkspace = "10000000-0000-4000-8000-000000000001";
export const estimateDraftDeleteGrants: EstimateDraftDeleteCardGrants = {
  read: true, parentAccess: true, delete: true,
};

export function estimateDraftDeleteCardFixture(now = Date.now()): EstimateDraftDeleteChatView {
  return estimateDraftDeleteChatViewSchema.parse({
    ticket: {
      id: "10000000-0000-4000-8000-000000000002",
      actionType: "estimate.delete-draft",
      inputHash: "a".repeat(64),
      authorizationVersion: "c".repeat(64),
      reviewHash: "b".repeat(64),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 900000).toISOString(),
      state: "pending",
      estimate: {
        id: "10000000-0000-4000-8000-000000000003",
        version: 3,
        number: "EST-2048",
        revision: 1,
      },
    },
    review: {
      name: c.stories.sourceName,
      recipientName: c.stories.recipient,
      parent: {
        type: "job",
        id: "10000000-0000-4000-8000-000000000005",
        version: 1,
        number: "J-1038",
        name: c.stories.parentName,
      },
    },
    receipt: null,
  });
}

export function estimateDraftDeleteCardContext(view: EstimateDraftDeleteChatView): EstimateDraftDeleteCardContext {
  return { workspaceId: estimateDraftDeleteWorkspace, view: structuredClone(view) };
}

export function estimateDraftDeleteCardConfirmed(view: EstimateDraftDeleteChatView): EstimateDraftDeleteChatView {
  return estimateDraftDeleteChatViewSchema.parse({
    ...view,
    ticket: { ...view.ticket, state: "confirmed" },
    receipt: {
      estimateId: view.ticket.estimate.id,
      version: view.ticket.estimate.version,
      number: view.ticket.estimate.number,
      revision: view.ticket.estimate.revision,
    },
  });
}

export function estimateDraftDeleteCardCancelled(view: EstimateDraftDeleteChatView): EstimateDraftDeleteChatView {
  return estimateDraftDeleteChatViewSchema.parse({
    ...view,
    ticket: { ...view.ticket, state: "cancelled" },
    receipt: null,
  });
}

export const estimateDraftDeleteCardStoryCopy = c.stories;
