import { describe, expect, it } from "vitest";
import { estimateDraftActionContent, estimateDraftActionCardRequest, reviewEstimateDraftActionCard } from "./estimate-draft-action-card.preview";
import { estimateDraftActionCardData as c } from "./estimate-draft-action-card.data";
import {
  estimateDraftActionConfirmed, estimateDraftActionContext, estimateDraftActionFixture, estimateDraftActionGrants,
} from "./estimate-draft-action-card.fixtures";
import type { EstimateDraftActionCardProps } from "./estimate-draft-action-card.types";

const now = Date.parse("2026-10-27T12:00:00.000Z");
function props(kind: "revise" | "reuse" | "duplicate" = "revise"): EstimateDraftActionCardProps {
  const view = estimateDraftActionFixture(kind, now);
  return { view, context: estimateDraftActionContext(view), grants: { ...estimateDraftActionGrants } };
}
describe("Revise/Duplicate confirmation presentation", () => {
  it.each(["revise", "reuse", "duplicate"] as const)("reviews %s without changing the saved copy or inventing prices", kind => {
    const input = props(kind), before = structuredClone(input);
    const review = reviewEstimateDraftActionCard(input, now);
    expect(review.visible).toBe(true);
    if (!review.visible) throw new Error("Expected a visible fixture.");
    expect(review.kind).toBe(kind);
    expect(review.canConfirm).toBe(true); expect(review.canCancel).toBe(true); expect(review.canOpen).toBe(false);
    expect(review.contentReview.calculation).toMatchObject({
      discountCents: 4813, taxCents: 5480, totalCents: 96917, depositCents: 24229, balanceCents: 72688,
    });
    expect(review.contentReview.calculation.items.subtotalCents).toBe(96250);
    expect(review.contentReview.needsPrice).toEqual([false, false, false]);
    expect(review.content.items.every(item => item.priceSource.type === "saved")).toBe(true);
    expect(input).toEqual(before);
  });
  it.each(["confirm", "cancel", "open"] as const)("submits only strict metadata for %s", decision => {
    const input = props(), { ticket } = input.view;
    expect(estimateDraftActionCardRequest(input.view, input.context!.workspaceId, decision)).toEqual({
      workspaceId: input.context!.workspaceId, decision, request: {
        proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
        reviewHash: ticket.reviewHash, authorizationVersion: ticket.authorizationVersion,
        estimateId: ticket.source.id, expectedVersion: ticket.source.version,
      },
    });
    const text = JSON.stringify(estimateDraftActionCardRequest(input.view, input.context!.workspaceId, decision));
    for (const field of ["scope", "values", "paymentLink", "recipientEmail", "internalNotes", "receipt", "plan"]) expect(text).not.toContain(`"${field}"`);
  });
  it.each(["read", "parentAccess", "create", "update"] as const)("withholds private Revise content after %s access loss", grant => {
    const input = props(); input.grants[grant] = false;
    expect(reviewEstimateDraftActionCard(input, now)).toEqual({ visible: false, issue: c.unavailable });
  });
  it("does not require update/send/decision permission for Duplicate", () => {
    const input = props("duplicate"); input.grants.update = false;
    expect(reviewEstimateDraftActionCard(input, now).visible).toBe(true);
  });
  it("withholds private content for disabled or missing authorized hosts", () => {
    expect(reviewEstimateDraftActionCard({ ...props(), disabled: true }, now)).toEqual({ visible: false, issue: c.unavailable });
    expect(reviewEstimateDraftActionCard({ ...props(), context: null }, now)).toEqual({ visible: false, issue: c.changed });
  });
  it.each(["id", "inputHash", "reviewHash", "authorizationVersion", "createdAt", "expiresAt"] as const)("rejects an independently changed %s binding", key => {
    const input = props();
    input.context!.view.ticket[key] = key.endsWith("At") ? "2026-10-27T12:01:00.000Z"
      : key === "id" ? input.view.review.parent.id : "f".repeat(64);
    expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
  });
  it.each(["name", "number", "revision", "version", "status", "archived"] as const)("binds the full displayed source %s", key => {
    const input = props();
    const source = input.context!.view.ticket.source;
    Object.assign(source, { [key]: typeof source[key] === "number" ? 9 : typeof source[key] === "boolean" ? true : "Changed" });
    expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
  });
  it.each(["scope", "internalNotes", "paymentLink"] as const)("binds private copied %s independently", key => {
    const input = props("reuse");
    input.context!.view.review.values[key] = key === "paymentLink" ? "https://payments.example.test/changed" : "Changed private content";
    expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
  });
  it("binds the parent, plan, snapshot, workspace and terminal receipt", () => {
    for (const change of [
      (input: EstimateDraftActionCardProps) => { input.context!.view.review.parent.version++; },
      (input: EstimateDraftActionCardProps) => { input.context!.view.review.snapshotHash = "f".repeat(64); },
      (input: EstimateDraftActionCardProps) => { input.context!.view.ticket.plan.revision++; },
      (input: EstimateDraftActionCardProps) => { input.context!.workspaceId = "bad-workspace"; },
    ]) {
      const input = props(); change(input);
      expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
    }
    const input = props(); input.view = estimateDraftActionConfirmed(input.view);
    input.context = estimateDraftActionContext(input.view);
    input.context.view.receipt!.version++;
    expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
  });
  it("compares canonical strict DTOs rather than object property ordering", () => {
    const input = props();
    input.context!.view.review.values.totals.discount = { value: "5", type: "percent" };
    expect(reviewEstimateDraftActionCard(input, now).visible).toBe(true);
  });
  it("rejects forged totals, invalid saved lines and impossible dates even when the host binding matches", () => {
    for (const change of [
      (input: EstimateDraftActionCardProps) => { input.view.review.totalCents = 1; },
      (input: EstimateDraftActionCardProps) => { input.view.review.values.items[0].unitPrice = ""; },
      (input: EstimateDraftActionCardProps) => { input.view.review.values.items[0].quantity = "0"; },
      (input: EstimateDraftActionCardProps) => { input.view.review.values.terms.validUntil = "2026-02-30"; },
    ]) {
      const input = props(); change(input); input.context = estimateDraftActionContext(input.view);
      expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
    }
  });
  it("fails closed on malformed or extra-field private projections", () => {
    for (const change of [
      (input: EstimateDraftActionCardProps) => { Object.assign(input.view, { ticket: null }); },
      (input: EstimateDraftActionCardProps) => { Object.assign(input.view.review.values, { sendNow: true }); },
      (input: EstimateDraftActionCardProps) => { input.view.ticket.state = "confirmed"; },
      (input: EstimateDraftActionCardProps) => { input.view.ticket.plan.kind = "reuse"; },
    ]) {
      const input = props(); change(input); input.context = estimateDraftActionContext(input.view);
      expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
    }
  });
  it("rejects copy-rule violations even with matching host objects", () => {
    const duplicate = props("duplicate"); duplicate.view.review.values.details.recipientName = c.stories.recipient;
    duplicate.context = estimateDraftActionContext(duplicate.view);
    expect(reviewEstimateDraftActionCard(duplicate, now).visible).toBe(false);
    const revision = props(); revision.view.review.values.internalNotes = c.stories.notes;
    revision.context = estimateDraftActionContext(revision.view);
    expect(reviewEstimateDraftActionCard(revision, now).visible).toBe(false);
  });
  it("rejects forged receipt identity, family, version, revision or reuse outcome", () => {
    for (const change of [
      { id: props().view.ticket.source.id }, { number: "EST-9999" }, { version: 2 }, { revision: 3 }, { reused: true },
    ]) {
      const input = props(); input.view = estimateDraftActionConfirmed(input.view);
      Object.assign(input.view.receipt!, change); input.context = estimateDraftActionContext(input.view);
      expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
    }
  });
  it("keeps literal saved text and never treats copied content as instructions", () => {
    const input = props("duplicate");
    input.view.review.values.scope = c.stories.literal;
    input.context = estimateDraftActionContext(input.view);
    const review = reviewEstimateDraftActionCard(input, now);
    expect(review.visible && review.content.scope).toBe(c.stories.literal);
    expect(estimateDraftActionContent(input.view)).not.toHaveProperty("internalNotes");
  });
  it("uses saved catalog units but never the current catalog selling price", () => {
    const input = props("duplicate");
    input.view.review.values.items[0].catalog = {
      id: input.view.review.parent.id, name: "Saved material", unit: "hr", sku: "",
    };
    input.context = estimateDraftActionContext(input.view);
    const review = reviewEstimateDraftActionCard(input, now);
    expect(review.visible && review.content.items[0]).toMatchObject({ unit: "hr", unitPrice: "125.00", priceSource: { type: "saved" } });
  });
  it("keeps empty Draft amounts unavailable, distinct from legitimate zero", () => {
    const input = props("duplicate");
    input.view.review.values.items = []; input.view.review.totalCents = null;
    input.context = estimateDraftActionContext(input.view);
    const empty = reviewEstimateDraftActionCard(input, now);
    expect(empty.visible && empty.contentReview.calculation.totalCents).toBeNull();
    const zero = props("duplicate");
    zero.view.review.values.items = [{ description: "Included cleanup", quantity: "1", unitPrice: "0", included: true, taxable: false }];
    zero.view.review.values.totals.discount = { type: "none" }; zero.view.review.totalCents = 0;
    zero.context = estimateDraftActionContext(zero.view);
    expect(reviewEstimateDraftActionCard(zero, now).visible).toBe(true);
  });
  it("enforces both sides of the exact expiry boundary and action-time metadata", () => {
    const input = props();
    const before = reviewEstimateDraftActionCard(input, now + 900000 - 1);
    expect(before.visible && before.canConfirm).toBe(true);
    const boundary = reviewEstimateDraftActionCard(input, now + 900000);
    expect(boundary.visible && boundary.state).toBe("expired");
    expect(boundary.visible && boundary.canConfirm).toBe(false);
    expect(boundary.visible && boundary.canCancel).toBe(false);
    expect(reviewEstimateDraftActionCard(input, now - 1).visible).toBe(false);
    input.view.ticket.expiresAt = new Date(now + 900001).toISOString();
    input.context = estimateDraftActionContext(input.view);
    expect(reviewEstimateDraftActionCard(input, now).visible).toBe(false);
  });
  it.each(["cancelled", "superseded", "expired"] as const)("never permits mutation or navigation for %s", state => {
    const input = props(); input.view.ticket.state = state; input.context = estimateDraftActionContext(input.view);
    const review = reviewEstimateDraftActionCard(input, now);
    expect(review.visible).toBe(true);
    expect(review.visible && [review.canConfirm, review.canCancel, review.canOpen]).toEqual([false, false, false]);
  });
  it.each(["revise", "reuse", "duplicate"] as const)("only permits checked opening of a host-confirmed %s receipt after expiry", kind => {
    const input = props(kind); input.view = estimateDraftActionConfirmed(input.view); input.context = estimateDraftActionContext(input.view);
    const review = reviewEstimateDraftActionCard(input, now + 900001);
    expect(review.visible && review.canOpen).toBe(true);
    expect(review.visible && review.canConfirm).toBe(false);
    expect(review.visible && review.canCancel).toBe(false);
  });
});
