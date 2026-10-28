import { estimateDraftActionChatViewSchema, type EstimateDraftActionChatView } from "@salesmora/contracts";
import { estimateDraftActionCardData as c } from "./estimate-draft-action-card.data";
import type { EstimateDraftActionCardContext, EstimateDraftActionCardGrants } from "./estimate-draft-action-card.types";

export const estimateDraftActionWorkspace = "10000000-0000-4000-8000-000000000001";
export const estimateDraftActionOtherWorkspace = "10000000-0000-4000-8000-000000000009";
export const estimateDraftActionGrants: EstimateDraftActionCardGrants = { read: true, parentAccess: true, create: true, update: true };
export function estimateDraftActionFixture(kind: "revise" | "reuse" | "duplicate" = "revise", now = Date.now()): EstimateDraftActionChatView {
  const duplicate = kind === "duplicate", reuse = kind === "reuse", s = c.stories;
  return estimateDraftActionChatViewSchema.parse({
    ticket: {
      id: "10000000-0000-4000-8000-000000000002",
      actionType: duplicate ? "estimate.duplicate" : "estimate.revise",
      inputHash: "a".repeat(64), reviewHash: "b".repeat(64), authorizationVersion: "c".repeat(64),
      createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 900000).toISOString(), state: "pending",
      source: { id: "10000000-0000-4000-8000-000000000003", version: 3, number: "EST-2048", revision: 1,
        name: s.sourceName, status: "published", archived: false },
      plan: { kind: reuse ? "reuse" : "create", revision: duplicate ? 1 : 2,
        existingDraft: reuse ? { id: "10000000-0000-4000-8000-000000000004", version: 2 } : null },
    },
    review: {
      parent: { type: "job", id: "10000000-0000-4000-8000-000000000005", version: 1, number: "J-1038", name: s.parentName },
      values: {
        details: { name: duplicate ? `${s.sourceName} (copy)` : s.sourceName,
          recipientName: duplicate ? "" : s.recipient, recipientEmail: duplicate ? "" : s.email,
          serviceAddress: s.address, ownerId: "10000000-0000-4000-8000-000000000006" },
        scope: reuse ? s.editedScope : s.scope,
        items: [
          { description: s.labor, quantity: "2.5", unitPrice: "125.00", taxable: false, included: false },
          { description: s.material, quantity: "1", unitPrice: "650.00", unit: "set", taxable: true, included: false },
          { description: s.included, quantity: "1", unitPrice: "0.00", taxable: false, included: true },
        ],
        totals: { discount: { type: "percent", value: "5" }, taxRate: "8.875" },
        terms: { message: s.message, validUntil: duplicate ? "" : "2026-11-21",
          paymentTerms: s.paymentTerms, termsNote: s.terms, deposit: { type: "percent", value: "25" } },
        internalNotes: duplicate || reuse ? s.notes : "", paymentLink: duplicate ? "" : s.paymentLink,
      },
      totalCents: 96917, snapshotHash: duplicate ? null : "d".repeat(64),
    },
    receipt: null,
  });
}
export function estimateDraftActionContext(view: EstimateDraftActionChatView): EstimateDraftActionCardContext {
  return { workspaceId: estimateDraftActionWorkspace, view: structuredClone(view) };
}
export function estimateDraftActionConfirmed(view: EstimateDraftActionChatView): EstimateDraftActionChatView {
  return estimateDraftActionChatViewSchema.parse({
    ...view, ticket: { ...view.ticket, state: "confirmed" }, receipt: {
      id: view.ticket.plan.existingDraft?.id ?? "10000000-0000-4000-8000-000000000007",
      number: view.ticket.actionType === "estimate.duplicate" ? "EST-2049" : view.ticket.source.number,
      revision: view.ticket.plan.revision, version: view.ticket.plan.existingDraft?.version ?? 1,
      updatedAt: new Date().toISOString(), reused: view.ticket.plan.kind === "reuse",
    },
  });
}
