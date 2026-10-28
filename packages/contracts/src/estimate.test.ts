import { describe, expect, it } from "vitest";
import {
  estimateBusinessProfileSchema,
  estimateDraftValuesSchema,
  estimateListQueryFromURL,
  estimateListQueryToURL,
} from "./estimate";

const workspaceId = "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1";

describe("estimate list URL query", () => {
  it("parses supported filters and paging", () => {
    const query = estimateListQueryFromURL(
      workspaceId,
      new URLSearchParams(
        "q=roof&status=sent&owner=me&parent=job&quickFilter=expiring&sort=validUntil&direction=asc&page=2&size=50",
      ),
    );
    expect(query).toMatchObject({
      workspaceId,
      q: "roof",
      status: "sent",
      owner: "me",
      parent: "job",
      quickFilter: "expiring",
      sort: "validUntil",
      direction: "asc",
      page: 2,
      pageSize: 50,
    });

  });

  it("ignores unsupported, oversized, and injection-shaped filter values", () => {
    const query = estimateListQueryFromURL(
      workspaceId,
      new URLSearchParams(
        `q=${"x".repeat(201)}&status=unknown&owner=all%27%20OR%201%3D1&parent=customer&quickFilter=all&sort=createdAt&direction=sideways&page=0&size=75`,
      ),
    );
    expect(query).toMatchObject({
      workspaceId,
      q: "",
      status: "all",
      owner: "all",
      parent: "all",
      quickFilter: null,
      sort: "updatedAt",
      direction: "desc",
      page: 1,
      pageSize: 25,
    });
  });

  describe("estimate Draft values", () => {
    const values = {
      details: {
        name: "Kitchen remodel",
        recipientName: "",
        recipientEmail: "",
        serviceAddress: "",
        ownerId: "",
      },
      items: [],
      totals: { discount: { type: "none" as const }, taxRate: "0" },
      terms: {
        message: "",
        validUntil: "",
        paymentTerms: "",
        termsNote: "",
        deposit: { type: "none" as const },
      },
      scope: "",
      internalNotes: "",
    };

    it("accepts unassigned drafts without requiring fabricated owner identifiers", () => {
      expect(estimateDraftValuesSchema.safeParse(values).success).toBe(true);
    });

    it("continues to reject oversized owner identifiers", () => {
      expect(estimateDraftValuesSchema.safeParse({
        ...values,
        details: { ...values.details, ownerId: "x".repeat(201) },
      }).success).toBe(false);
    });
  });

  it("serializes the supported URL state and round-trips it", () => {
    const query = estimateListQueryFromURL(
      workspaceId,
      new URLSearchParams(
        "q=roofing&status=accepted&owner=me&parent=job&includeHidden=true&quickFilter=expiring&sort=validUntil&direction=asc&page=3&size=50",
      ),
    );
    const serialized = estimateListQueryToURL(query);
    expect(serialized).toContain(`workspace=${workspaceId}`);
    expect(estimateListQueryFromURL(workspaceId, new URLSearchParams(serialized))).toEqual(
      query,
    );
  });
});

describe("estimate business profile settings", () => {
  const profile = {
    name: "Harbor Home Services",
    address: "245 Atlantic Avenue",
    phone: "(718) 555-0148",
    email: "estimates@example.com",
    licenseLine: "Registration HHS-1024",
    logoPath: null,
    requireServiceAddress: true,
    validForDays: "30",
    taxRate: "8.875",
    deposit: { type: "percent" as const, value: "25" },
    paymentPresets: [{
      id: "completion",
      label: "Due on completion",
      text: "Payment is due after completion.",
    }],
    message: "Thank you.",
    termsNote: "Work is subject to site access.",
  };

  it("accepts incomplete identity while retaining validated defaults", () => {
    expect(estimateBusinessProfileSchema.safeParse({
      ...profile,
      name: "",
      address: "",
      phone: "",
      email: "",
    }).success).toBe(true);
  });

  it("rejects invalid email, out-of-range validity, and duplicate preset IDs", () => {
    expect(estimateBusinessProfileSchema.safeParse({ ...profile, email: "not-an-email" }).success).toBe(false);
    expect(estimateBusinessProfileSchema.safeParse({ ...profile, validForDays: "366" }).success).toBe(false);
    expect(estimateBusinessProfileSchema.safeParse({
      ...profile,
      paymentPresets: [profile.paymentPresets[0], profile.paymentPresets[0]],
    }).success).toBe(false);
  });
});
