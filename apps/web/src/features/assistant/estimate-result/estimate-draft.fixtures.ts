import { estimateDraftChatViewSchema, type EstimateDraftChatView } from "@salesmora/contracts";
import type { EstimateEditorSeed } from "@salesmora/data";

export const estimateDraftWorkspaceId = "00000000-0000-4000-8000-000000000001";
export function estimateDraftViewFixture(update = false): EstimateDraftChatView {
  const id = "00000000-0000-4000-8000-000000000002", now = Date.now();
  const parent = { type: "job", id: estimateDraftWorkspaceId, number: "J-1024", name: "Fixture repair", version: 1 };
  const proposed = {
    name: "Repair estimate", scope: "Replace fixtures and test.", message: "Thank you.", paymentTerms: "",
    termsNote: "", validUntil: "2026-11-30", discount: { type: "none" }, taxRate: "8.875", deposit: { type: "none" },
    items: [{ id: "saved-1", description: "Installation", quantity: "1", unit: "job", unitPrice: "100.00",
      taxable: false, included: false, priceSource: { type: update ? "saved" : "user" } }],
  };
  return estimateDraftChatViewSchema.parse({
    draft: {
      id, inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
      createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 900000).toISOString(), state: "pending",
      parent, proposed,
      ...(update ? { actionType: "estimate.update",
        estimate: { id: estimateDraftWorkspaceId, number: "EST-2048", revision: 1, expectedVersion: 1 },
        current: { ...proposed, scope: "Replace fixtures." },
      } : { actionType: "estimate.create" }),
    },
    context: {
      proposalId: id, inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
      parent: { type: parent.type, id: parent.id, version: parent.version },
      estimate: update ? { id: estimateDraftWorkspaceId, version: 1, status: "draft", archived: false } : null,
    },
    grants: { read: true, parentAccess: true, create: true, update },
    canConfirm: true, receipt: null,
  });
}
export const estimateDraftEditorSeed: EstimateEditorSeed = {
  workspaceId: estimateDraftWorkspaceId, timezone: "America/New_York", today: "2026-10-26",
  paperBusiness: { name: "Fixture Business", address: "", email: "", phone: "", licenseLine: "", logoPath: null, requireServiceAddress: true },
  parent: {
    type: "job", id: estimateDraftWorkspaceId, number: "J-1024", name: "Fixture repair", status: "scheduled", service: "Plumbing",
    customer: null, contactName: "", recipientEmail: "", serviceAddress: "", href: "#job",
  },
  existingEstimates: [], estimate: null, members: [], paymentPresets: [],
  defaults: { taxRate: "8.875", validUntil: "2026-11-30", message: "", termsNote: "", deposit: { type: "none" } },
  capabilities: { read: true, create: true, update: false, delete: false, void: false, archive: false,
    assignOwner: true, browseMaterials: false, viewMaterialPrices: false },
};
