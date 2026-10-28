import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses, type EstimateStatus } from "../estimate-preview.types";
import { estimateDeliveryFixture as delivery } from "./estimate-delivery-card.data";
import { getEstimateDeliveryActions, type EstimateDeliveryAction, type EstimateDeliverySummary, type EstimateShareLinkState } from "./estimate-delivery-card.preview";

const expected: Record<EstimateStatus, EstimateDeliveryAction[]> = {
  draft: [], sent: ["copy-link", "review-resend"], published: ["copy-link"],
  accepted: ["copy-link"], declined: ["copy-link"], expired: [], superseded: [], void: [],
};
const context = { delivery, capabilities: roles.owner };

describe("Estimate delivery presentation eligibility", () => {
  it.each(estimateStatuses)("offers only the approved %s actions", (status) => {
    expect(getEstimateDeliveryActions({ ...context, status })).toEqual(expected[status]);
  });
  it.each(estimateStatuses)("offers no actions on archived %s records", (status) => {
    expect(getEstimateDeliveryActions({ ...context, status, archived: true })).toEqual([]);
  });
  it.each(estimateStatuses)("never reveals %s actions without read access", (status) => {
    expect(getEstimateDeliveryActions({ ...context, status, capabilities: { ...roles.owner, read: false } })).toEqual([]);
  });
  it.each(estimateStatuses)("requires send independently from other permissions for %s", (status) => {
    expect(getEstimateDeliveryActions({ ...context, status, capabilities: { ...roles.owner, send: false } }))
      .toEqual(expected[status].filter((action) => action !== "review-resend"));
  });
  it.each(["not-created", "expired", "revoked", "replaced", "unavailable"] satisfies EstimateShareLinkState[])("blocks sharing and resend for %s links", (state) => {
    for (const status of estimateStatuses) expect(getEstimateDeliveryActions({
      ...context, status, delivery: { ...delivery, link: { ...delivery.link, state } },
    })).toEqual([]);
  });
  it.each(["queued", "sent", "failed", "bounced"] as const)("handles the %s email attempt independently from link state", (state) => {
    const email = { state, recipientEmail: "recipient@example.test", updatedAt: "2026-10-22T18:00:00Z" };
    expect(getEstimateDeliveryActions({ ...context, status: "sent", delivery: { ...delivery, email } }))
      .toEqual(state === "queued" ? ["copy-link"] : ["copy-link", "review-resend"]);
    expect(getEstimateDeliveryActions({ ...context, status: "published", delivery: { ...delivery, email } })).toEqual(["copy-link"]);
  });
  it("does not call an initial email a resend", () => {
    expect(getEstimateDeliveryActions({ ...context, status: "sent", delivery: { ...delivery, email: { state: "not-sent" } } })).toEqual(["copy-link"]);
  });
  it.each(["owner", "admin", "office", "field"] as const)("uses scoped %s capability grants, not a new role rule", (role) => {
    expect(getEstimateDeliveryActions({ status: "sent", delivery, capabilities: roles[role] })).toEqual(["copy-link", "review-resend"]);
  });
  it("does not require send permission to copy an authorized active link", () => {
    const capabilities = {
      read: true, create: false, update: false, send: false, decide: false,
      void: false, archive: false, delete: false, export: false,
    };
    expect(getEstimateDeliveryActions({ status: "sent", delivery, capabilities })).toEqual(["copy-link"]);
  });
  it("keeps viewed state separate from email transport state", () => {
    const viewed: EstimateDeliverySummary = { ...delivery, link: { ...delivery.link, firstViewedAt: "2026-10-22T19:00:00Z" } };
    expect(getEstimateDeliveryActions({ ...context, status: "sent", delivery: viewed })).toEqual(["copy-link", "review-resend"]);
  });
  it("does not mutate the supplied delivery or permission grants", () => {
    const input = { ...context, status: "sent" as const };
    const before = structuredClone(input);
    getEstimateDeliveryActions(input);
    expect(input).toEqual(before);
  });
});
