import { describe, expect, it } from "vitest";
import { estimateDraftDeleteCardData as c } from "./estimate-draft-delete-card.data";
import {
  estimateDraftDeleteCardCancelled,
  estimateDraftDeleteCardConfirmed,
  estimateDraftDeleteCardContext,
  estimateDraftDeleteCardFixture,
  estimateDraftDeleteGrants,
} from "./estimate-draft-delete-card.fixtures";
import {
  estimateDraftDeleteCardRequest,
  reviewEstimateDraftDeleteCard,
} from "./estimate-draft-delete-card.preview";
import type { EstimateDraftDeleteCardProps } from "./estimate-draft-delete-card.types";

const now = Date.parse("2026-10-27T12:00:00.000Z");
function props(): EstimateDraftDeleteCardProps {
  const view = estimateDraftDeleteCardFixture(now);
  return { view, context: estimateDraftDeleteCardContext(view), grants: { ...estimateDraftDeleteGrants } };
}
function bound(change: (input: EstimateDraftDeleteCardProps) => void) {
  const input = props();
  change(input);
  input.context = estimateDraftDeleteCardContext(input.view);
  return input;
}

describe("Estimate Draft-deletion card review", () => {
  it("reviews the exact pending revision without mutating saved details", () => {
    const input = props(), before = structuredClone(input);
    expect(reviewEstimateDraftDeleteCard(input, now)).toMatchObject({
      visible: true, state: "pending", canConfirm: true, canCancel: true,
    });
    expect(input).toEqual(before);
  });
  it.each(["read", "parentAccess", "delete"] as const)("withholds private review when %s is missing", grant => {
    const input = props();
    input.grants[grant] = false;
    expect(reviewEstimateDraftDeleteCard(input, now)).toEqual({ visible: false, issue: c.unavailable });
  });
  it("redacts unavailable, disconnected and mismatched host context", () => {
    expect(reviewEstimateDraftDeleteCard({ ...props(), disabled: true }, now))
      .toEqual({ visible: false, issue: c.unavailable });
    expect(reviewEstimateDraftDeleteCard({ ...props(), context: null }, now))
      .toEqual({ visible: false, issue: c.changed });
    const input = props();
    input.context!.workspaceId = "invalid";
    expect(reviewEstimateDraftDeleteCard(input, now)).toEqual({ visible: false, issue: c.changed });
    const changed = props();
    changed.context!.view.review.recipientName = c.stories.literal;
    expect(reviewEstimateDraftDeleteCard(changed, now)).toEqual({ visible: false, issue: c.changed });
  });
  it.each([
    "id", "actionType", "inputHash", "authorizationVersion", "reviewHash", "createdAt", "expiresAt",
  ] as const)("binds the independently reviewed ticket %s", field => {
    const input = props();
    Object.assign(input.context!.view.ticket, {
      [field]: field.endsWith("At") ? "2026-10-27T12:01:00.000Z"
        : field === "id" ? input.view.review.parent.id
          : field === "actionType" ? "estimate.archive" : "f".repeat(64),
    });
    expect(reviewEstimateDraftDeleteCard(input, now).visible).toBe(false);
  });
  it.each(["id", "version", "number", "revision"] as const)("binds the exact target %s", field => {
    const input = props();
    Object.assign(input.context!.view.ticket.estimate, {
      [field]: typeof input.view.ticket.estimate[field] === "number" ? 9 : input.view.review.parent.id,
    });
    expect(reviewEstimateDraftDeleteCard(input, now).visible).toBe(false);
  });
  it.each(["name", "recipientName"] as const)("binds private review %s", field => {
    const input = props();
    Object.assign(input.context!.view.review, { [field]: "Changed" });
    expect(reviewEstimateDraftDeleteCard(input, now).visible).toBe(false);
  });
  it.each(["id", "type", "version", "number", "name"] as const)("binds parent details %s", field => {
    const input = props();
    Object.assign(input.context!.view.review.parent, {
      [field]: field === "id" ? "10000000-0000-4000-8000-000000000007"
        : field === "version" ? 2 : field === "type" ? "lead" : "Changed",
    });
    expect(reviewEstimateDraftDeleteCard(input, now).visible).toBe(false);
  });
  it("accepts an unspecified recipient without inventing personal details", () => {
    for (const recipientName of ["", " ", "\n "]) {
      const input = bound(input => { input.view.review.recipientName = recipientName; });
      expect(reviewEstimateDraftDeleteCard(input, now)).toMatchObject({
        visible: true, view: { review: { recipientName } },
      });
    }
  });
  it("preserves literal and long display values without executing or truncating them", () => {
    const input = bound(input => {
      input.view.review.name = c.stories.longSourceName;
      input.view.review.recipientName = c.stories.longRecipient;
      input.view.review.parent.name = c.stories.longParentName;
    });
    expect(reviewEstimateDraftDeleteCard(input, now)).toMatchObject({ visible: true, view: input.view });
  });
  it("rejects malformed, extended or inconsistent saved review data", () => {
    const changes: Array<(input: EstimateDraftDeleteCardProps) => void> = [
      input => { Object.assign(input.view, { ticket: null }); },
      input => { Object.assign(input.view.review, { internalNotes: "private" }); },
      input => { Object.assign(input.view.ticket, { href: "/customer-link" }); },
      input => { input.view.ticket.estimate.version = 0; },
      input => { input.view.review.name = " "; },
      input => { input.view.review.parent.name = " "; },
      input => { input.view.review.parent.number = " "; },
    ];
    for (const change of changes) expect(reviewEstimateDraftDeleteCard(bound(change), now).visible).toBe(false);
  });
  it.each([NaN, Infinity, now - 1])("rejects invalid proposal clocks %s", clock => {
    expect(reviewEstimateDraftDeleteCard(props(), clock)).toEqual({ visible: false, issue: c.invalid });
  });
  it("expires exactly at the proposal deadline", () => {
    const input = props(), expires = Date.parse(input.view.ticket.expiresAt);
    expect(reviewEstimateDraftDeleteCard(input, expires - 1)).toMatchObject({
      state: "pending", canConfirm: true, canCancel: true,
    });
    expect(reviewEstimateDraftDeleteCard(input, expires)).toMatchObject({
      state: "expired", canConfirm: false, canCancel: false,
    });
  });
  it.each([
    ["confirmed", estimateDraftDeleteCardConfirmed] as const,
    ["cancelled", estimateDraftDeleteCardCancelled] as const,
  ])("presents checked %s state without actions", (state, result) => {
    const input = bound(input => { input.view = result(input.view); });
    expect(reviewEstimateDraftDeleteCard(input, now)).toMatchObject({
      visible: true, state, canConfirm: false, canCancel: false,
    });
  });
  it("presents superseded and expired stored proposals without allowing a decision", () => {
    for (const state of ["superseded", "expired"] as const) {
      const input = bound(input => { input.view.ticket.state = state; });
      expect(reviewEstimateDraftDeleteCard(input, now)).toMatchObject({
        visible: true, state, canConfirm: false, canCancel: false,
      });
    }
  });
});

describe("Estimate Draft-deletion request binding", () => {
  it.each(["confirm", "cancel"] as const)("contains only validated proposal bindings for %s", decision => {
    const input = props(), { ticket } = input.view;
    const command = estimateDraftDeleteCardRequest(
      input.view, input.context!.workspaceId, decision, decision === "confirm" ? ticket.estimate.number : undefined,
    );
    expect(command).toEqual({
      workspaceId: input.context!.workspaceId,
      decision,
      request: {
        proposalId: ticket.id,
        actionType: ticket.actionType,
        inputHash: ticket.inputHash,
        authorizationVersion: ticket.authorizationVersion,
        reviewHash: ticket.reviewHash,
        estimateId: ticket.estimate.id,
        expectedVersion: ticket.estimate.version,
      },
      ...(decision === "confirm" ? { typedConfirmation: ticket.estimate.number } : {}),
    });
    for (const field of ["name", "recipientName", "parent", "review", "receipt", "grants", "deleteAllRevisions"]) {
      expect(JSON.stringify(command)).not.toContain(`"${field}"`);
    }
  });
  it.each(["", "est-2048", " EST-2048", "EST-2048 ", "EST-2049"])(
    "does not trim or normalize typed Estimate numbers: %j", typedConfirmation => {
      const input = props();
      expect(() => estimateDraftDeleteCardRequest(
        input.view, input.context!.workspaceId, "confirm", typedConfirmation,
      )).toThrow();
    },
  );
  it("does not include typed confirmation when cancelling", () => {
    const input = props();
    const request = estimateDraftDeleteCardRequest(
      input.view, input.context!.workspaceId, "cancel", "EST-2048",
    );
    expect(request).not.toHaveProperty("typedConfirmation");
  });
});
