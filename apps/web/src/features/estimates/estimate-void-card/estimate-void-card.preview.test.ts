import { describe, expect, it } from "vitest";
import { estimateVoidCardRequest, reviewEstimateVoidCard } from "./estimate-void-card.preview";
import { estimateVoidCardData as c } from "./estimate-void-card.data";
import {
  estimateVoidCardConfirmed, estimateVoidCardContext, estimateVoidCardFixture, estimateVoidGrants,
} from "./estimate-void-card.fixtures";
import type { EstimateVoidCardProps } from "./estimate-void-card.types";

const now = Date.parse("2026-10-27T12:00:00.000Z");
function props(): EstimateVoidCardProps {
  const view = estimateVoidCardFixture(now);
  return { view, context: estimateVoidCardContext(view), grants: { ...estimateVoidGrants } };
}
function bound(change: (input: EstimateVoidCardProps) => void) {
  const input = props(); change(input); input.context = estimateVoidCardContext(input.view); return input;
}
describe("Estimate Void confirmation presentation", () => {
  it.each(["sent", "published"] as const)("reviews %s without modifying the frozen summary or reason", status => {
    const input = bound(input => { input.view.ticket.estimate.status = status; }), before = structuredClone(input);
    const review = reviewEstimateVoidCard(input, now);
    expect(review).toMatchObject({ visible: true, state: "pending", canConfirm: true, canCancel: true, canOpen: false });
    expect(input).toEqual(before);
  });
  it.each(["confirm", "cancel", "open"] as const)("emits only exact proposal metadata for %s", decision => {
    const input = props(), { ticket } = input.view;
    const command = estimateVoidCardRequest(input.view, input.context!.workspaceId, decision);
    expect(command).toEqual({
      workspaceId: input.context!.workspaceId, decision, request: {
        proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash, snapshotHash: ticket.snapshotHash,
        estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
      },
    });
    for (const field of ["reason", "recipientName", "totalCents", "receipt", "grants", "review", "href", "parent"]) {
      expect(JSON.stringify(command)).not.toContain(`"${field}"`);
    }
  });
  it.each(["read", "parentAccess", "void"] as const)("withholds all private review on %s loss", grant => {
    const input = props(); input.grants[grant] = false;
    expect(reviewEstimateVoidCard(input, now)).toEqual({ visible: false, issue: c.unavailable });
  });
  it("redacts disabled/missing/invalid hosts and requires a valid workspace identity", () => {
    expect(reviewEstimateVoidCard({ ...props(), disabled: true }, now)).toEqual({ visible: false, issue: c.unavailable });
    expect(reviewEstimateVoidCard({ ...props(), context: null }, now)).toEqual({ visible: false, issue: c.changed });
    const input = props(); input.context!.workspaceId = "invalid";
    expect(reviewEstimateVoidCard(input, now)).toEqual({ visible: false, issue: c.changed });
  });
  it.each(["id", "inputHash", "reviewHash", "snapshotHash", "authorizationVersion", "createdAt", "expiresAt"] as const)(
    "binds independently authorized ticket %s", field => {
      const input = props();
      input.context!.view.ticket[field] = field.endsWith("At") ? "2026-10-27T12:01:00.000Z"
        : field === "id" ? input.view.review.parent.id : "f".repeat(64);
      expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
    },
  );
  it.each(["id", "number", "revision", "version", "name", "status", "archived"] as const)("binds the entire Estimate %s", field => {
    const input = props(), estimate = input.context!.view.ticket.estimate;
    Object.assign(estimate, { [field]: typeof estimate[field] === "number" ? 9 : typeof estimate[field] === "boolean" ? true : "Changed" });
    expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
  });
  it.each(["reason", "recipientName", "totalCents", "today", "timezone"] as const)("binds private review %s", field => {
    const input = props(), review = input.context!.view.review;
    Object.assign(review, { [field]: field === "totalCents" ? 1 : field === "today" ? "2026-10-28" : "Changed" });
    expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
  });
  it.each(["id", "type", "version", "number", "name"] as const)("binds the authorized parent %s", field => {
    const input = props();
    Object.assign(input.context!.view.review.parent, { [field]: field === "version" ? 2 : "Changed" });
    expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
  });
  it.each(["draft", "accepted", "declined", "expired", "superseded", "void"])("rejects ineligible source %s even with matching context", status => {
    const input = bound(input => { Object.assign(input.view.ticket.estimate, { status }); });
    expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
  });
  it("rejects archived sources, invalid metadata and extra private/model fields", () => {
    for (const change of [
      (input: EstimateVoidCardProps) => { Object.assign(input.view.ticket.estimate, { archived: true }); },
      (input: EstimateVoidCardProps) => { Object.assign(input.view, { ticket: null }); },
      (input: EstimateVoidCardProps) => { Object.assign(input.view.review, { internalNotes: "private" }); },
      (input: EstimateVoidCardProps) => { input.view.ticket.estimate.version = 0; },
      (input: EstimateVoidCardProps) => { input.view.ticket.estimate.name = " "; },
      (input: EstimateVoidCardProps) => { input.view.review.recipientName = " "; },
      (input: EstimateVoidCardProps) => { input.view.review.parent.name = " "; },
      (input: EstimateVoidCardProps) => { input.view.review.parent.number = " "; },
      (input: EstimateVoidCardProps) => { input.view.review.today = "2026-02-30"; },
    ]) expect(reviewEstimateVoidCard(bound(change), now).visible).toBe(false);
  });
  it.each([-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid frozen total %s without a zero fallback", totalCents => {
    expect(reviewEstimateVoidCard(bound(input => { input.view.review.totalCents = totalCents; }), now).visible).toBe(false);
  });
  it("accepts a legitimate zero total and the exact 500-character reason without calculating or truncating", () => {
    const input = bound(input => { input.view.review.totalCents = 0; input.view.review.reason = "x".repeat(500); });
    expect(reviewEstimateVoidCard(input, now)).toMatchObject({
      visible: true, canConfirm: true, view: { review: { totalCents: 0, reason: "x".repeat(500) } },
    });
  });
  it("keeps literal text and interior whitespace unchanged", () => {
    const reason = `${c.stories.literal}\nLine  two`;
    const input = bound(input => { input.view.review.reason = reason; });
    expect(reviewEstimateVoidCard(input, now)).toMatchObject({ visible: true, view: { review: { reason } } });
  });
  it("does not fill a missing reason or let readiness override it", () => {
    const input = bound(input => { input.view.review.reason = ""; input.view.canConfirm = false; });
    expect(reviewEstimateVoidCard(input, now)).toMatchObject({ visible: true, canConfirm: false, canCancel: true });
    input.view.canConfirm = true; input.context = estimateVoidCardContext(input.view);
    expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
  });
  it.each([" ", " outer space", "x".repeat(501)])("rejects invalid reason instead of rewriting it", reason => {
    expect(reviewEstimateVoidCard(bound(input => { input.view.review.reason = reason; }), now).visible).toBe(false);
  });
  it.each([NaN, Infinity, now - 1])("rejects invalid or not-yet-started clocks %s", clock => {
    expect(reviewEstimateVoidCard(props(), clock)).toEqual({ visible: false, issue: c.invalid });
  });
  it("expires exactly at the deadline, not one millisecond earlier", () => {
    const input = props(), expires = Date.parse(input.view.ticket.expiresAt);
    expect(reviewEstimateVoidCard(input, expires - 1)).toMatchObject({ canConfirm: true, canCancel: true });
    expect(reviewEstimateVoidCard(input, expires)).toMatchObject({
      visible: true, state: "expired", canConfirm: false, canCancel: false, canOpen: false,
    });
  });
  it("rejects noncanonical or overlong windows even when the host matches", () => {
    for (const expiresAt of ["2026-10-27T12:00:00.000Z", "2026-10-27T12:15:00.001Z", "2026-10-27T12:15:00Z"]) {
      expect(reviewEstimateVoidCard(bound(input => { input.view.ticket.expiresAt = expiresAt; }), now).visible).toBe(false);
    }
  });
  it.each(["cancelled", "superseded", "expired"] as const)("offers no operation after %s", state => {
    expect(reviewEstimateVoidCard(bound(input => { input.view.ticket.state = state; }), now)).toMatchObject({
      visible: true, state, canConfirm: false, canCancel: false, canOpen: false,
    });
  });
  it("allows explicit checked opening only for a host-confirmed receipt, including after proposal expiry", () => {
    const input = bound(input => { input.view = estimateVoidCardConfirmed(input.view); });
    expect(reviewEstimateVoidCard(input, now + 900001)).toMatchObject({
      visible: true, state: "confirmed", canConfirm: false, canCancel: false, canOpen: true,
    });
  });
  it("binds authoritative receipt data and rejects forged status, identity, version or missing receipt", () => {
    for (const change of [
      { estimateId: estimateVoidCardFixture(now).review.parent.id }, { version: 3 }, { version: 5 }, { status: "archived" }, { updatedAt: "invalid" },
    ]) {
      const input = bound(input => { input.view = estimateVoidCardConfirmed(input.view); Object.assign(input.view.receipt!, change); });
      expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
    }
    const input = bound(input => { input.view = estimateVoidCardConfirmed(input.view); });
    input.context!.view.receipt!.updatedAt = "2026-10-27T12:03:00.000Z";
    expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
    input.view.receipt = null; input.context = estimateVoidCardContext(input.view);
    expect(reviewEstimateVoidCard(input, now).visible).toBe(false);
  });
  it("compares strict parsed DTOs rather than incoming object property order", () => {
    const input = props(), parent = input.context!.view.review.parent;
    input.context!.view.review.parent = { name: parent.name, number: parent.number, version: parent.version, id: parent.id, type: parent.type };
    expect(reviewEstimateVoidCard(input, now).visible).toBe(true);
  });
});
