import { afterEach, describe, expect, it, vi } from "vitest";
import {
  estimateDraftActionConfirmed, estimateDraftActionFixture, estimateDraftActionWorkspace as workspaceId,
} from "../../estimates/estimate-draft-action-card/estimate-draft-action-card.fixtures";
import { estimateDraftActionBinding, estimateDraftActionRequest } from "./estimate-draft-action-client";

afterEach(() => vi.unstubAllGlobals());
describe("connected Revise/Duplicate browser boundary", () => {
  it.each(["revise", "reuse", "duplicate"] as const)("loads only the separately authorized exact %s review", async kind => {
    const view = estimateDraftActionFixture(kind), fetcher = vi.fn().mockResolvedValue(Response.json({ view }));
    vi.stubGlobal("fetch", fetcher);
    expect((await estimateDraftActionRequest(workspaceId, view.ticket, "GET")).view).toEqual(view);
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("/api/chat/estimates/draft-actions?");
    expect(String(url)).toContain(`reviewHash=${view.ticket.reviewHash}`);
    expect(options.cache).toBe("no-store"); expect(options.body).toBeUndefined();
    for (const privateText of [view.review.values.scope, view.review.values.internalNotes].filter(Boolean)) expect(String(url)).not.toContain(privateText);
  });
  it.each(["confirm", "cancel", "open"] as const)("sends strict metadata-only %s and accepts only its exact response", async decision => {
    const original = estimateDraftActionFixture("duplicate");
    const view = decision === "cancel" ? { ...original, ticket: { ...original.ticket, state: "cancelled" } } : estimateDraftActionConfirmed(original);
    const href = `/estimates/${view.receipt?.id}?workspace=${workspaceId}`;
    const fetcher = vi.fn().mockResolvedValue(Response.json({ view, ...(decision === "open" ? { href } : {}) }));
    vi.stubGlobal("fetch", fetcher);
    await estimateDraftActionRequest(workspaceId, original.ticket, "POST", decision);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      workspaceId, request: estimateDraftActionBinding(original.ticket), decision,
    });
  });
  it.each(["source", "plan", "reviewHash", "inputHash", "authorizationVersion", "createdAt", "expiresAt"] as const)(
    "rejects changed immutable %s", async field => {
      const original = estimateDraftActionFixture(), view = structuredClone(original);
      if (field === "source") view.ticket.source.name = "Changed source";
      else if (field === "plan") view.ticket.plan.revision++;
      else if (field === "createdAt" || field === "expiresAt") view.ticket[field] = new Date(Date.parse(view.ticket[field]) - 1).toISOString();
      else view.ticket[field] = "f".repeat(64);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view })));
      await expect(estimateDraftActionRequest(workspaceId, original.ticket, "GET")).rejects.toThrow();
    },
  );
  it("rejects pending confirmation, wrong cancellation state, unchecked href and private extensions", async () => {
    const view = estimateDraftActionFixture();
    for (const result of [{ view }, { view, href: `/estimates/${view.ticket.source.id}?workspace=${workspaceId}` },
      { view: { ...view, sendNow: true } }]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
      await expect(estimateDraftActionRequest(workspaceId, view.ticket, "POST", "confirm")).rejects.toThrow();
      await expect(estimateDraftActionRequest(workspaceId, view.ticket, "POST", "cancel")).rejects.toThrow();
    }
  });
  it("opens only the exact checked destination receipt and current workspace, never the source", async () => {
    const original = estimateDraftActionFixture(), view = estimateDraftActionConfirmed(original);
    for (const href of [undefined, `/estimates/${original.ticket.source.id}?workspace=${workspaceId}`,
      `/estimates/${view.receipt!.id}?workspace=${view.review.parent.id}`, "https://evil.example.test/"]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view, href })));
      await expect(estimateDraftActionRequest(workspaceId, original.ticket, "POST", "open")).rejects.toThrow();
    }
  });
  it("surfaces API errors without fabricating a receipt", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Review changed." }, { status: 409 })));
    await expect(estimateDraftActionRequest(workspaceId, estimateDraftActionFixture().ticket, "GET")).rejects.toThrow("Review changed.");
  });
});
