import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole, estimatePreviewData } from "../estimate-preview.data";
import { estimateStatuses, type EstimateRole } from "../estimate-preview.types";
import { estimatePaperAmounts, reviewEstimatePaper } from "../estimate-preview-paper/estimate-preview-paper.preview";
import { estimateEditorHistory, estimateEditorInitialValues, estimateEditorPageData as c, estimateEditorSnapshot } from "./estimate-editor-page.data";
import { estimateEditorAccess, estimateEditorPaper, reviewEstimateEditorDraft } from "./estimate-editor-page.preview";

const members = estimatePreviewData.members;
const base = {
  role: "owner" as const, capabilities: estimateCapabilitiesByRole.owner, parentType: "lead" as const,
  assignedJob: false, status: "draft" as const, archived: false, newDraft: false, ready: true,
};

describe("editor access", () => {
  it.each<EstimateRole>(["owner", "admin", "office"])("%s can edit a granted Draft", (role) => {
    expect(estimateEditorAccess({ ...base, role }).edit).toBe(true);
  });
  it.each(estimateStatuses.filter((status) => status !== "draft"))("%s is read-only", (status) => {
    expect(estimateEditorAccess({ ...base, status })).toMatchObject({ read: true, edit: false });
  });
  it("requires read access, readiness and unarchived state", () => {
    expect(estimateEditorAccess({ ...base, ready: false }).read).toBe(false);
    expect(estimateEditorAccess({ ...base, capabilities: { ...base.capabilities, read: false } })).toMatchObject({ read: false, edit: false, assignOwner: false, correctDecision: false, convert: false });
    expect(estimateEditorAccess({ ...base, archived: true }).edit).toBe(false);
  });
  it("distinguishes new creation from saved updates", () => {
    const capabilities = { ...base.capabilities, create: false };
    expect(estimateEditorAccess({ ...base, capabilities, newDraft: true }).edit).toBe(false);
    expect(estimateEditorAccess({ ...base, capabilities }).edit).toBe(true);
    const updateOnlyDenied = { ...base.capabilities, update: false };
    expect(estimateEditorAccess({ ...base, capabilities: updateOnlyDenied, newDraft: true }).edit).toBe(true);
    expect(estimateEditorAccess({ ...base, capabilities: updateOnlyDenied }).edit).toBe(false);
  });
  it.each([
    { parentType: "lead" as const, assignedJob: true, allowed: false },
    { parentType: "lead" as const, assignedJob: false, allowed: false },
    { parentType: "job" as const, assignedJob: false, allowed: false },
    { parentType: "job" as const, assignedJob: true, allowed: true },
  ])("restricts Field to assigned jobs: $parentType / $assignedJob", ({ parentType, assignedJob, allowed }) => {
    expect(estimateEditorAccess({ ...base, role: "field", parentType, assignedJob })).toEqual({
      read: allowed, edit: allowed, assignOwner: false, correctDecision: false, convert: false,
    });
  });
});

describe("explicit Draft save validation", () => {
  it("keeps exact shared amounts", () => {
    const result = reviewEstimateEditorDraft(estimateEditorInitialValues(), members);
    expect(result.valid).toBe(true);
    expect(estimatePaperAmounts(result.calculation)).toEqual(estimateEditorSnapshot.amounts);
  });
  it("allows no items, missing recipient and date without inventing zero totals", () => {
    const value = estimateEditorInitialValues();
    value.items = []; value.details.recipientName = ""; value.details.recipientEmail = "";
    value.details.serviceAddress = ""; value.terms.validUntil = "";
    const result = reviewEstimateEditorDraft(value, members);
    expect(result.valid).toBe(true);
    expect(result.calculation.totalCents).toBeNull();
    expect(result.calculation.items.error).toBe("empty-items");
  });
  it("copies new-Draft defaults, not a payment preset", () => {
    const value = estimateEditorInitialValues(true);
    expect(value.items).toEqual([]);
    expect(value.totals).toEqual({ discount: { type: "none" }, taxRate: "8.875" });
    expect(value.terms).toMatchObject({ paymentTerms: "", deposit: { type: "percent", value: "25" }, validUntil: "2026-11-21" });
    expect(value.details.name).toBe("");
  });
  it.each(["", "x".repeat(121)])("rejects invalid estimate names", (name) => {
    const value = estimateEditorInitialValues(); value.details.name = name;
    expect(reviewEstimateEditorDraft(value, members).details.name).toBeTruthy();
  });
  it.each(["not-email", "jordan@example.com\nBcc: other@example.com"])("rejects invalid entered email", (email) => {
    const value = estimateEditorInitialValues(); value.details.recipientEmail = email;
    expect(reviewEstimateEditorDraft(value, members).valid).toBe(false);
  });
  it("allows an unassigned Draft while rejecting unavailable prepared-by members", () => {
    const value = estimateEditorInitialValues();
    value.details.ownerId = "";
    expect(reviewEstimateEditorDraft(value, members).details.ownerId).toBeUndefined();
    value.details.ownerId = "unknown";
    expect(reviewEstimateEditorDraft(value, members).details.ownerId).toBeTruthy();
  });
  it.each([
    { description: "" }, { description: "x".repeat(201) }, { quantity: "0" }, { quantity: "-1" },
    { quantity: "1.1234" }, { unitPrice: "" }, { unitPrice: "1.001" }, { unitPrice: "1000000.01" },
    { unitPrice: "0", included: false }, { unitPrice: "10", included: true },
  ])("rejects incomplete/invalid added lines: %j", (patch) => {
    const value = estimateEditorInitialValues(); value.items[0] = { ...value.items[0], ...patch };
    const result = reviewEstimateEditorDraft(value, members);
    expect(result.valid).toBe(false);
    expect(result.issues).toContain(c.invalidItems);
  });
  it("enforces count/subtotal limits", () => {
    const value = estimateEditorInitialValues();
    value.items = Array.from({ length: 101 }, (_, index) => ({ ...value.items[0], id: `${index}` }));
    expect(reviewEstimateEditorDraft(value, members).valid).toBe(false);
    value.items = [{ ...value.items[0], quantity: "11", unitPrice: "1000000" }];
    expect(reviewEstimateEditorDraft(value, members).valid).toBe(false);
  });
  it.each([
    { discount: { type: "percent" as const, value: "100.001" } },
    { discount: { type: "amount" as const, value: "962.51" } },
    { taxRate: "-1" }, { taxRate: "8.8751" },
  ])("rejects invalid totals: %j", (patch) => {
    const value = estimateEditorInitialValues(); value.totals = { ...value.totals, ...patch };
    expect(reviewEstimateEditorDraft(value, members).issues).toContain(c.invalidAmounts);
  });
  it("validates entered adjustments even without items", () => {
    const value = estimateEditorInitialValues(); value.items = []; value.totals.taxRate = "invalid";
    value.terms.deposit = { type: "percent", value: "101" };
    expect(reviewEstimateEditorDraft(value, members).valid).toBe(false);
  });
  it("rejects a deposit above the total without losing the valid total", () => {
    const value = estimateEditorInitialValues(); value.terms.deposit = { type: "amount", value: "969.18" };
    const result = reviewEstimateEditorDraft(value, members);
    expect(result.valid).toBe(false);
    expect(result.calculation.totalCents).toBe(96917);
    expect(result.calculation.depositCents).toBeNull();
  });
  it.each(["2026-02-30", "yesterday"])("rejects invalid entered dates", (date) => {
    const value = estimateEditorInitialValues(); value.terms.validUntil = date;
    expect(reviewEstimateEditorDraft(value, members).terms.validUntil).toBeTruthy();
  });
  it("allows a past but real Draft date; sharing has a separate boundary", () => {
    const value = estimateEditorInitialValues(); value.terms.validUntil = "2026-10-01";
    expect(reviewEstimateEditorDraft(value, members).valid).toBe(true);
  });
  it.each(["scope", "internalNotes"] as const)("enforces the %s limit", (field) => {
    const value = estimateEditorInitialValues(); value[field] = "x".repeat(5001);
    expect(reviewEstimateEditorDraft(value, members).valid).toBe(false);
  });
  it.each([["message", 2000], ["paymentTerms", 500], ["termsNote", 5000]] as const)("enforces the %s limit", (field, limit) => {
    const value = estimateEditorInitialValues(); value.terms[field] = "x".repeat(limit + 1);
    expect(reviewEstimateEditorDraft(value, members).terms[field]).toBeTruthy();
  });
});

describe("customer projection and coherent page fixtures", () => {
  it("uses an exact allowlist including only the permitted catalog unit", () => {
    const value = estimateEditorInitialValues();
    const content = estimateEditorPaper(value, {
      number: "EST-2048", revision: 1, business: estimateEditorSnapshot.content.business,
      preparedBy: c.stories.actor, relatedRecord: "Lead LD-1048",
    });
    expect(content).toEqual(estimateEditorSnapshot.content);
    expect(Object.keys(content).sort()).toEqual(Object.keys(estimateEditorSnapshot.content).sort());
    expect(Object.keys(content.items[1]).sort()).toEqual(["description", "included", "quantity", "taxable", "unit", "unitPrice"]);
    expect(JSON.stringify(content)).not.toContain("STAFF_ONLY_EDITOR_SENTINEL");
    expect(JSON.stringify(content)).not.toContain("member-alex");
    expect(JSON.stringify(content)).not.toContain("sample-material");
    expect(reviewEstimatePaper({ state: "draft", content }).amounts).toEqual(estimateEditorSnapshot.amounts);
  });
  it("does not retain mutable adjustment or business objects", () => {
    const value = estimateEditorInitialValues();
    const business = { ...estimateEditorSnapshot.content.business };
    const content = estimateEditorPaper(value, { number: "EST-2048", revision: 1, business, preparedBy: c.stories.actor, relatedRecord: "LD-1048" });
    business.name = "Changed";
    if (value.totals.discount.type !== "none") value.totals.discount.value = "99";
    expect(content.business.name).toBe(estimateEditorSnapshot.content.business.name);
    expect(content.discount).toEqual({ type: "percent", value: "5" });
  });
  it("has no created activity for an unsaved Draft", () => {
    expect(estimateEditorHistory("draft", true)).toEqual([]);
  });
  it.each(estimateStatuses)("never invents unrelated lifecycle activity for %s", (status) => {
    const events = estimateEditorHistory(status, false);
    expect(events[0].kind).toBe("created");
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain("94793");
    expect(serialized).not.toContain("STAFF_ONLY_EDITOR_SENTINEL");
    if (status === "draft") expect(events).toHaveLength(1);
    if (status === "accepted" || status === "declined") expect(events.at(-1)).toMatchObject({ kind: "decision-recorded", changes: [{ kind: "status", before: "sent", after: status }] });
  });
});
