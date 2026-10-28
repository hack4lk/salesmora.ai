import { afterEach, describe, expect, it, vi } from "vitest";
import {
  estimateVoidCardConfirmed, estimateVoidCardFixture, estimateVoidWorkspace as workspaceId, estimateVoidOtherWorkspace,
} from "../../estimates/estimate-void-card/estimate-void-card.fixtures";
import { estimateVoidBinding, estimateVoidRequest } from "./estimate-void-client";

afterEach(() => vi.unstubAllGlobals());
describe("connected Void browser boundary", () => {
  it("loads only the separately authorized exact review without private query data", async () => {
    const view = estimateVoidCardFixture(), fetcher = vi.fn().mockResolvedValue(Response.json({ view }));
    vi.stubGlobal("fetch", fetcher);
    const abort = new AbortController();
    expect((await estimateVoidRequest(workspaceId, view.ticket, "GET", undefined, abort.signal)).view).toEqual(view);
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("/api/chat/estimates/voids?");
    expect(String(url)).toContain(`reviewHash=${view.ticket.reviewHash}`);
    expect(String(url)).toContain(`snapshotHash=${view.ticket.snapshotHash}`);
    expect(options).toMatchObject({ cache: "no-store", signal: abort.signal });
    expect(options.body).toBeUndefined();
    for (const text of [view.review.reason, view.review.recipientName, view.review.parent.name]) expect(String(url)).not.toContain(text);
  });
  it.each(["confirm", "cancel", "open"] as const)("sends strict metadata-only %s and accepts only its exact response", async decision => {
    const original = estimateVoidCardFixture();
    const view = decision === "cancel" ? { ...original, ticket: { ...original.ticket, state: "cancelled" } } : estimateVoidCardConfirmed(original);
    const href = `/estimates/${original.ticket.estimate.id}?workspace=${workspaceId}`;
    const fetcher = vi.fn().mockResolvedValue(Response.json({ view, ...(decision === "open" ? { href } : {}) }));
    vi.stubGlobal("fetch", fetcher);
    await estimateVoidRequest(workspaceId, original.ticket, "POST", decision);
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body).toEqual({ workspaceId, request: estimateVoidBinding(original.ticket), decision });
    for (const key of ["reason", "recipientName", "totalCents", "review", "receipt", "grants"]) expect(JSON.stringify(body)).not.toContain(`"${key}"`);
  });
  it.each(["estimate", "reviewHash", "snapshotHash", "inputHash", "authorizationVersion", "createdAt", "expiresAt"] as const)(
    "rejects changed immutable %s", async field => {
      const original = estimateVoidCardFixture(), view = structuredClone(original);
      if (field === "estimate") view.ticket.estimate.name = "Changed source";
      else if (field.endsWith("At")) view.ticket[field] = new Date(Date.parse(view.ticket[field]) - 1).toISOString();
      else view.ticket[field] = "f".repeat(64);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view })));
      await expect(estimateVoidRequest(workspaceId, original.ticket, "GET")).rejects.toThrow();
    },
  );
  it("rejects pending confirmations, wrong cancellations, forged receipts and private extensions", async () => {
    const view = estimateVoidCardFixture(), confirmed = estimateVoidCardConfirmed(view);
    for (const result of [{ view }, { view, href: `/estimates/${view.ticket.estimate.id}?workspace=${workspaceId}` },
      { view: { ...view, sendNow: true } }, { view: { ...confirmed, receipt: { ...confirmed.receipt, version: 99 } } }]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
      await expect(estimateVoidRequest(workspaceId, view.ticket, "POST", "confirm")).rejects.toThrow();
      await expect(estimateVoidRequest(workspaceId, view.ticket, "POST", "cancel")).rejects.toThrow();
    }
  });
  it("opens only the exact checked receipt and current workspace, never on a GET or confirmation", async () => {
    const original = estimateVoidCardFixture(), view = estimateVoidCardConfirmed(original);
    for (const href of [undefined, `/estimates/${view.review.parent.id}?workspace=${workspaceId}`,
      `/estimates/${view.ticket.estimate.id}?workspace=${estimateVoidOtherWorkspace}`, "https://evil.example.test/"]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view, href })));
      await expect(estimateVoidRequest(workspaceId, original.ticket, "POST", "open")).rejects.toThrow();
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view,
      href: `/estimates/${view.ticket.estimate.id}?workspace=${workspaceId}` })));
    await expect(estimateVoidRequest(workspaceId, original.ticket, "GET")).rejects.toThrow();
    await expect(estimateVoidRequest(workspaceId, original.ticket, "POST", "confirm")).rejects.toThrow();
  });
  it("surfaces API errors without fabricating a receipt and rejects invalid workspace metadata", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ error: "Review changed." }, { status: 409 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(estimateVoidRequest(workspaceId, estimateVoidCardFixture().ticket, "GET")).rejects.toThrow("Review changed.");
    await expect(estimateVoidRequest("invalid", estimateVoidCardFixture().ticket, "GET")).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
