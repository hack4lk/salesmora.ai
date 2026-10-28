import { describe, expect, it } from "vitest";
import { estimateArchiveCardRequest, reviewEstimateArchiveCard } from "./estimate-archive-card.preview";
import { estimateArchiveCardData as c } from "./estimate-archive-card.data";
import {
  estimateArchiveCardConfirmed, estimateArchiveCardContext, estimateArchiveCardFixture, estimateArchiveGrants,
} from "./estimate-archive-card.fixtures";
import type { EstimateArchiveCardProps } from "./estimate-archive-card.types";

const now = Date.parse("2026-10-27T12:00:00.000Z");
function props(operation: "archive" | "restore" = "archive"): EstimateArchiveCardProps {
  const view = estimateArchiveCardFixture(operation, now);
  return { view, context: estimateArchiveCardContext(view), grants: { ...estimateArchiveGrants } };
}
function bound(change: (input: EstimateArchiveCardProps) => void, operation: "archive" | "restore" = "archive") {
  const input = props(operation); change(input); input.context = estimateArchiveCardContext(input.view); return input;
}
describe("Estimate Archive/Restore confirmation presentation", () => {
  it.each(["declined", "expired", "superseded", "void"] as const)("reviews Archive of %s without modifying saved data", status => {
    const input = bound(input => { input.view.ticket.estimate.status = status; }), before = structuredClone(input);
    expect(reviewEstimateArchiveCard(input, now)).toMatchObject({
      visible: true, operation: "archive", state: "pending", canConfirm: true, canCancel: true, canOpen: false,
    });
    expect(input).toEqual(before);
  });
  it.each(["draft", "sent", "published", "accepted", "declined", "expired", "superseded", "void"] as const)(
    "reviews Restore of archived %s without imposing Archive eligibility", status => {
      const input = bound(input => { input.view.ticket.estimate.status = status; }, "restore"), before = structuredClone(input);
      expect(reviewEstimateArchiveCard(input, now)).toMatchObject({
        visible: true, operation: "restore", canConfirm: true, canCancel: true, canOpen: false,
      });
      expect(input).toEqual(before);
    },
  );
  it.each(["confirm", "cancel", "open"] as const)("emits only exact proposal metadata for %s of either action", decision => {
    for (const operation of ["archive", "restore"] as const) {
      const input = props(operation), { ticket } = input.view;
      const command = estimateArchiveCardRequest(input.view, input.context!.workspaceId, decision);
      expect(command).toEqual({
        workspaceId: input.context!.workspaceId, decision, request: {
          proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
          authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash,
          estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
        },
      });
      for (const field of ["reason", "recipientName", "totalCents", "receipt", "grants", "review", "href", "parent", "archivedAt", "archivedBy"]) {
        expect(JSON.stringify(command)).not.toContain(`"${field}"`);
      }
    }
  });
  it.each(["read", "parentAccess", "archive"] as const)("withholds private reviews on %s loss in every state", grant => {
    for (const operation of ["archive", "restore"] as const) {
      for (const state of ["pending", "confirmed", "cancelled"] as const) {
        const input = bound(input => {
          if (state === "confirmed") input.view = estimateArchiveCardConfirmed(input.view);
          else input.view.ticket.state = state;
        }, operation);
        input.grants[grant] = false;
        expect(reviewEstimateArchiveCard(input, now)).toEqual({ visible: false, issue: c.unavailable });
      }
    }
  });
  it("redacts disabled/missing/invalid host context and requires a valid workspace identity", () => {
    expect(reviewEstimateArchiveCard({ ...props(), disabled: true }, now)).toEqual({ visible: false, issue: c.unavailable });
    expect(reviewEstimateArchiveCard({ ...props(), context: null }, now)).toEqual({ visible: false, issue: c.changed });
    const input = props(); input.context!.workspaceId = "invalid";
    expect(reviewEstimateArchiveCard(input, now)).toEqual({ visible: false, issue: c.changed });
  });
  it.each(["id", "actionType", "inputHash", "reviewHash", "authorizationVersion", "createdAt", "expiresAt", "state"] as const)(
    "binds independently authorized ticket %s", field => {
      const input = props();
      Object.assign(input.context!.view.ticket, {
        [field]: field.endsWith("At") ? "2026-10-27T12:01:00.000Z"
          : field === "id" ? input.view.review.parent.id : field === "actionType" ? "estimate.restore" : field === "state" ? "cancelled" : "f".repeat(64),
      });
      expect(reviewEstimateArchiveCard(input, now).visible).toBe(false);
    },
  );
  it.each(["id", "number", "revision", "version", "name", "status", "archived"] as const)("binds the entire Estimate %s", field => {
    const input = props(), estimate = input.context!.view.ticket.estimate;
    Object.assign(estimate, { [field]: typeof estimate[field] === "number" ? 9 : typeof estimate[field] === "boolean" ? true : "Changed" });
    expect(reviewEstimateArchiveCard(input, now).visible).toBe(false);
  });
  it.each(["recipientName", "today", "timezone"] as const)("binds private review %s", field => {
    const input = props();
    input.context!.view.review[field] = field === "today" ? "2026-10-28" : field === "timezone" ? "UTC" : "Changed";
    expect(reviewEstimateArchiveCard(input, now).visible).toBe(false);
  });
  it.each(["id", "type", "version", "number", "name"] as const)("binds the authorized parent %s", field => {
    const input = props();
    Object.assign(input.context!.view.review.parent, { [field]: field === "version" ? 2 : field === "type" ? "lead" : "Changed" });
    expect(reviewEstimateArchiveCard(input, now).visible).toBe(false);
  });
  it.each(["draft", "sent", "published", "accepted"])("rejects Archive of active %s with matching context", status => {
    expect(reviewEstimateArchiveCard(bound(input => { Object.assign(input.view.ticket.estimate, { status }); }), now).visible).toBe(false);
  });
  it.each(["archive", "restore"] as const)("rejects the wrong archived flag for %s", operation => {
    expect(reviewEstimateArchiveCard(bound(input => {
      input.view.ticket.estimate.archived = operation === "archive";
    }, operation), now).visible).toBe(false);
  });
  it("accepts missing or whitespace-only saved recipients without inventing required input", () => {
    for (const recipientName of ["", " ", "\n "]) {
      const input = bound(input => { input.view.review.recipientName = recipientName; }, "restore");
      expect(reviewEstimateArchiveCard(input, now)).toMatchObject({
        visible: true, canConfirm: true, view: { review: { recipientName } },
      });
    }
  });
  it("preserves literal and maximum-length saved details without truncating, executing or calculating", () => {
    const input = bound(input => {
      input.view.ticket.estimate.name = c.stories.longSourceName;
      input.view.review.recipientName = c.stories.longRecipient;
      input.view.review.parent.name = c.stories.longParentName;
    });
    expect(reviewEstimateArchiveCard(input, now)).toMatchObject({ visible: true, view: input.view });
    const literal = bound(input => { input.view.review.recipientName = c.stories.literal; });
    expect(reviewEstimateArchiveCard(literal, now)).toMatchObject({ visible: true, view: literal.view });
  });
  it("rejects invalid saved identity, metadata and extra private/model fields", () => {
    for (const change of [
      (input: EstimateArchiveCardProps) => { Object.assign(input.view, { ticket: null }); },
      (input: EstimateArchiveCardProps) => { Object.assign(input.view.review, { internalNotes: "private" }); },
      (input: EstimateArchiveCardProps) => { Object.assign(input.view.review, { reason: "unneeded" }); },
      (input: EstimateArchiveCardProps) => { Object.assign(input.view.ticket, { href: "/e/token" }); },
      (input: EstimateArchiveCardProps) => { input.view.ticket.estimate.version = 0; },
      (input: EstimateArchiveCardProps) => { input.view.ticket.estimate.name = " "; },
      (input: EstimateArchiveCardProps) => { input.view.review.parent.name = " "; },
      (input: EstimateArchiveCardProps) => { input.view.review.parent.number = " "; },
      (input: EstimateArchiveCardProps) => { input.view.review.recipientName = "x".repeat(201); },
      (input: EstimateArchiveCardProps) => { input.view.review.today = "2026-02-30"; },
    ]) expect(reviewEstimateArchiveCard(bound(change), now).visible).toBe(false);
  });
  it.each([NaN, Infinity, now - 1])("rejects invalid or not-yet-started clocks %s", clock => {
    expect(reviewEstimateArchiveCard(props(), clock)).toEqual({ visible: false, issue: c.invalid });
  });
  it.each(["archive", "restore"] as const)("expires %s exactly at the deadline, not one millisecond earlier", operation => {
    const input = props(operation), expires = Date.parse(input.view.ticket.expiresAt);
    expect(reviewEstimateArchiveCard(input, expires - 1)).toMatchObject({ canConfirm: true, canCancel: true });
    expect(reviewEstimateArchiveCard(input, expires)).toMatchObject({
      visible: true, state: "expired", canConfirm: false, canCancel: false, canOpen: false,
    });
  });
  it("rejects noncanonical or overlong windows even when the host matches", () => {
    for (const expiresAt of ["2026-10-27T12:00:00.000Z", "2026-10-27T12:15:00.001Z", "2026-10-27T12:15:00Z"]) {
      expect(reviewEstimateArchiveCard(bound(input => { input.view.ticket.expiresAt = expiresAt; }), now).visible).toBe(false);
    }
  });
  it.each(["cancelled", "superseded", "expired"] as const)("offers no operation after %s", state => {
    for (const operation of ["archive", "restore"] as const) {
      expect(reviewEstimateArchiveCard(bound(input => { input.view.ticket.state = state; }, operation), now)).toMatchObject({
        visible: true, state, canConfirm: false, canCancel: false, canOpen: false,
      });
    }
  });
  it.each(["archive", "restore"] as const)("allows only explicit opening for host-confirmed %s, including after proposal expiry", operation => {
    const input = bound(input => { input.view = estimateArchiveCardConfirmed(input.view); }, operation);
    expect(reviewEstimateArchiveCard(input, now + 900001)).toMatchObject({
      visible: true, state: "confirmed", canConfirm: false, canCancel: false, canOpen: true,
    });
    expect(input.view.ticket.estimate.archived).toBe(operation === "restore");
  });
  it("binds authoritative receipts to exact action, identity, next version and timestamp", () => {
    for (const operation of ["archive", "restore"] as const) {
      for (const change of [
        { estimateId: estimateArchiveCardFixture(operation, now).review.parent.id }, { version: 3 }, { version: 5 },
        { archived: operation !== "archive" }, { updatedAt: "invalid" },
      ]) {
        const input = bound(input => { input.view = estimateArchiveCardConfirmed(input.view); Object.assign(input.view.receipt!, change); }, operation);
        expect(reviewEstimateArchiveCard(input, now).visible).toBe(false);
      }
      const input = bound(input => { input.view = estimateArchiveCardConfirmed(input.view); }, operation);
      input.context!.view.receipt!.updatedAt = "2026-10-27T12:03:00.000Z";
      expect(reviewEstimateArchiveCard(input, now).visible).toBe(false);
      input.view.receipt = null; input.context = estimateArchiveCardContext(input.view);
      expect(reviewEstimateArchiveCard(input, now).visible).toBe(false);
    }
  });
  it("compares strict parsed DTOs rather than incoming property order", () => {
    const input = props(), parent = input.context!.view.review.parent;
    input.context!.view.review.parent = { name: parent.name, number: parent.number, version: parent.version, id: parent.id, type: parent.type };
    expect(reviewEstimateArchiveCard(input, now).visible).toBe(true);
  });
});
