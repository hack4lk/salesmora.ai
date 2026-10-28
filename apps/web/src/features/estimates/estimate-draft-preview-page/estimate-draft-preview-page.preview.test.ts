import { describe, expect, it } from "vitest";
import type { EstimateEditorSeed } from "@salesmora/data";
import { estimateDraftPaperSource } from "./estimate-draft-preview-page.preview";

const seed = {
  workspaceId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1",
  timezone: "America/New_York",
  today: "2026-10-23",
  paperBusiness: {
    name: "Harbor Home Services",
    address: "245 Atlantic Avenue",
    phone: "(718) 555-0148",
    email: "estimates@example.com",
    licenseLine: "Registration HHS-1024",
    logoPath: null,
    requireServiceAddress: true,
  },
  parent: null,
  existingEstimates: [],
  estimate: {
    id: "estimate-2048",
    number: "EST-2048",
    revision: 2,
    status: "draft",
    archived: false,
    version: 3,
    updatedAt: "2026-10-23T12:00:00.000Z",
    sharing: "never-shared",
    parent: {
      type: "lead",
      id: "lead-1048",
      number: "LD-1048",
      name: "Kitchen remodel",
      status: "Qualified",
      service: "Kitchen remodel",
      customer: null,
      contactName: "Jordan Lee",
      recipientEmail: "jordan.lee@example.com",
      serviceAddress: "18 Maple Street",
      href: "/leads/lead-1048",
    },
    values: {
      details: {
        name: "Kitchen remodel estimate",
        recipientName: "Jordan Lee",
        recipientEmail: "jordan.lee@example.com",
        serviceAddress: "18 Maple Street",
        ownerId: "member-1",
      },
      items: [{
        description: "Cabinet installation",
        quantity: "2",
        unitPrice: "125.00",
        taxable: false,
        included: false,
        catalog: { id: "material-1", name: "Cabinet installation", unit: "hr", sku: "" },
      }],
      totals: { discount: { type: "none" }, taxRate: "8.875" },
      terms: {
        message: "Thank you.",
        validUntil: "2026-11-22",
        paymentTerms: "Due on completion",
        termsNote: "Standard terms",
        deposit: { type: "percent", value: "25" },
      },
      scope: "Install the cabinets.",
      internalNotes: "STAFF_ONLY_SENTINEL_DO_NOT_PRINT",
    },
  },
  members: [{ id: "member-1", name: "Alex Morgan" }],
  paymentPresets: [],
  defaults: {
    taxRate: "0",
    validUntil: "",
    message: "",
    termsNote: "",
    deposit: { type: "none" },
  },
  capabilities: {
    void: true,
    archive: true,
    read: true,
    create: true,
    update: true,
    delete: true,
    assignOwner: true,
    browseMaterials: true,
    viewMaterialPrices: true,
  },
} satisfies EstimateEditorSeed;

describe("estimateDraftPaperSource", () => {
  it("projects only the saved customer-facing draft content into the approved paper", () => {
    const source = estimateDraftPaperSource(seed);
    expect(source?.state).toBe("draft");
    if (!source) throw new Error("Expected an authorized saved Draft source.");
    expect(source.content).toMatchObject({
      number: "EST-2048",
      revision: 2,
      estimateDate: "2026-10-23",
      preparedBy: "Alex Morgan",
      relatedRecord: "Lead LD-1048 · Kitchen remodel",
      business: {
        name: "Harbor Home Services",
        logoPath: null,
        requireServiceAddress: true,
      },
      items: [{ description: "Cabinet installation", unit: "hr" }],
    });
    expect(JSON.stringify(source)).not.toContain("STAFF_ONLY_SENTINEL_DO_NOT_PRINT");
  });

  it("does not create paper sources for missing, non-draft, or archived records", () => {
    expect(estimateDraftPaperSource({ ...seed, estimate: null })).toBeNull();
    expect(estimateDraftPaperSource({
      ...seed,
      estimate: { ...seed.estimate, status: "sent" },
    })).toBeNull();
    expect(estimateDraftPaperSource({
      ...seed,
      estimate: { ...seed.estimate, archived: true },
    })).toBeNull();
  });
});
