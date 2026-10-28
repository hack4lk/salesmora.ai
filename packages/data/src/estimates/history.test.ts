import { describe, expect, it } from "vitest";
import type { EstimateDraftValues } from "@salesmora/contracts";
import { projectEstimateActivity } from "./history";
import { changedEstimateDraftFields } from "./drafts";

const row = {
  id: "activity", createdAt: "2026-10-24T14:00:00.123456Z",
  source: "ui", actorName: "Fixture teammate", type: "draft.saved",
  changes: { fromVersion: 1, toVersion: 2, itemCount: 3 },
};
describe("persisted estimate activity projection", () => {
  it("does not invent diffs for legacy saves and normalizes display time without changing paging precision", () => {
    expect(projectEstimateActivity(row)).toMatchObject({ kind: "updated", changes: [], createdAt: "2026-10-24T14:00:00.123Z" });
  });
  it("allowlists field names and status, never raw contents, email, token, URL or delivery errors", () => {
    const projected = projectEstimateActivity({
      ...row, changes: {
        fields: ["paymentLink", "scope", "internalNotes", "paymentLink"],
        status: { before: "draft", after: "sent" },
        paymentLink: "SECRET_PAYMENT_URL", scope: "SECRET_SCOPE", internalNotes: "SECRET_NOTE",
        recipient: "SECRET_RECIPIENT", token: "SECRET_TOKEN", error: "SECRET_ERROR",
      },
    });
    expect(projected.changes).toEqual([
      { kind: "status", before: "draft", after: "sent" },
      ...["paymentLink", "scope", "internalNotes"].map(field => ({ kind: "field", field })),
    ]);
    expect(JSON.stringify(projected)).not.toContain("SECRET");
  });
  it.each([
    ["created", "created"], ["draft.saved", "updated"], ["sent", "sent"], ["published", "published"],
    ["resent", "delivery-queued"], ["email-sent", "delivery-sent"], ["delivery-failed", "delivery-failed"], ["viewed", "viewed"],
    ["revision-created", "revision-created"], ["superseded", "superseded"], ["expired", "expired"],
    ["archived", "archived"], ["restored", "restored"],
  ])("maps persisted %s to %s", (type, kind) => {
    expect(projectEstimateActivity({ ...row, type }).kind).toBe(kind);
  });
  it("keeps withdrawal reasons staff-only and maps system/confirmed assistant sources accurately", () => {
    expect(projectEstimateActivity({ ...row, type: "voided", changes: { reason: "Private reason" } }))
      .toMatchObject({ kind: "voided", reason: "Private reason" });
    expect(projectEstimateActivity({ ...row, source: "assistant-confirmed" }).source.type).toBe("chat");
    expect(projectEstimateActivity({ ...row, source: "system", type: "viewed", actorName: "Customer" }).source)
      .toEqual({ type: "system", actorName: "Customer" });
    expect(projectEstimateActivity({ ...row, source: "worker" }).source).toEqual({ type: "worker" });
  });
  it.each([
    { type: "unknown" }, { source: "untrusted" }, { changes: null },
    { changes: { fields: ["not-a-field"] } }, { changes: { status: { before: "invented", after: "sent" } } },
    { type: "voided", changes: {} },
  ])("reports unsupported/invalid activity instead of silently dropping it: %j", patch => {
    expect(() => projectEstimateActivity({ ...row, ...patch })).toThrow();
  });
  it("projects explicit decision/correction metadata and preserves both staff-only entries", () => {
    const decision = { outcome: "accepted", decisionDate: "2026-10-24", channel: "phone", note: "Private note" };
    expect(projectEstimateActivity({ ...row, type: "decision-recorded", changes: { decision } }))
      .toMatchObject({ kind: "decision-recorded", decisionDate: decision.decisionDate, note: "Private note", channel: "phone" });
    expect(projectEstimateActivity({ ...row, type: "decision-corrected", changes: { decision, reason: "Private correction" } }))
      .toMatchObject({ kind: "decision-corrected", note: "Private note", reason: "Private correction" });
    for (const changes of [{}, { decision: { ...decision, channel: "sms" } }, { decision: { ...decision, decisionDate: "2026-02-30" } }]) {
      expect(() => projectEstimateActivity({ ...row, type: "decision-recorded", changes })).toThrow();
    }
    expect(() => projectEstimateActivity({ ...row, type: "decision-corrected", changes: { decision } })).toThrow();
  });
  it("shows actual revision relationships, including gaps after deleted Drafts", () => {
    expect(projectEstimateActivity({ ...row, type: "revision-created", changes: { revision: { before: 1, after: 3 } } }).changes)
      .toEqual([{ kind: "revision", before: 1, after: 3 }]);
    expect(() => projectEstimateActivity({ ...row, type: "superseded", changes: { revision: { before: 0, after: 2 } } })).toThrow();
  });
});
describe("safe Draft change metadata", () => {
  const values: EstimateDraftValues = {
    details: { name: "Fixture", recipientName: "Customer", recipientEmail: "", ownerId: "", serviceAddress: "" },
    items: [], totals: { discount: { type: "none" }, taxRate: "0" },
    terms: { message: "", validUntil: "", paymentTerms: "", termsNote: "", deposit: { type: "none" } },
    scope: "", internalNotes: "", paymentLink: "https://payments.example.test/private",
  };
  it("reports actual fields without values and preserves omitted legacy payment links", () => {
    const after = { ...values, scope: "PRIVATE_SCOPE", internalNotes: "PRIVATE_NOTE", paymentLink: "" };
    expect(changedEstimateDraftFields(values, after)).toEqual(["scope", "internalNotes", "paymentLink"]);
    const legacy = { ...values };
    delete legacy.paymentLink;
    expect(changedEstimateDraftFields(values, legacy)).toEqual([]);
  });
  it("records item, recipient, owner, term and total-setting edits without changing inputs", () => {
    const after: EstimateDraftValues = {
      ...values, details: { ...values.details, name: "Changed", recipientEmail: "private@example.test", ownerId: "teammate" },
      items: [{ description: "Private", quantity: "1", unitPrice: "2", included: false, taxable: false }],
      terms: { ...values.terms, paymentTerms: "Private terms" }, totals: { discount: { type: "amount", value: "1" }, taxRate: "8" },
    };
    expect(changedEstimateDraftFields(values, after)).toEqual(["name", "recipientEmail", "owner", "paymentTerms", "items", "discount", "taxRate"]);
    expect(values.details.name).toBe("Fixture");
  });
});
