import { afterEach, describe, expect, it, vi } from "vitest";
import {
  estimateArchiveCardConfirmed, estimateArchiveCardFixture, estimateArchiveOtherWorkspace, estimateArchiveWorkspace,
} from "../../estimates/estimate-archive-card/estimate-archive-card.fixtures";
import { estimateArchiveBinding, estimateArchiveRequest } from "./estimate-archive-client";

afterEach(() => vi.unstubAllGlobals());
describe("connected Archive/Restore browser boundary", () => {
  it("loads only the separately authorized exact review without private query data", async () => {
    const view = estimateArchiveCardFixture(), fetcher = vi.fn().mockResolvedValue(Response.json({ view }));
    vi.stubGlobal("fetch", fetcher);
    const abort = new AbortController();
    expect((await estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, "GET", undefined, abort.signal)).view).toEqual(view);
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("/api/chat/estimates/archives?");
    expect(String(url)).toContain(`reviewHash=${view.ticket.reviewHash}`);
    expect(options).toMatchObject({ cache: "no-store", signal: abort.signal });
    expect(options.body).toBeUndefined();
    for (const text of [view.review.recipientName, view.review.parent.name]) expect(String(url)).not.toContain(text);
  });
  it.each(["confirm", "cancel", "open"] as const)("sends strict metadata-only %s and accepts only its exact response", async decision => {
    const original = estimateArchiveCardFixture();
    const view = decision === "cancel" ? { ...original, ticket: { ...original.ticket, state: "cancelled" } } : estimateArchiveCardConfirmed(original);
    const href = `/estimates/${original.ticket.estimate.id}?workspace=${estimateArchiveWorkspace}`;
    const fetcher = vi.fn().mockResolvedValue(Response.json({ view, ...(decision === "open" ? { href } : {}) }));
    vi.stubGlobal("fetch", fetcher);
    await estimateArchiveRequest(estimateArchiveWorkspace, original.ticket, "POST", decision);
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body).toEqual({ workspaceId: estimateArchiveWorkspace, request: estimateArchiveBinding(original.ticket), decision });
    for (const key of ["recipientName", "review", "receipt", "grants", "href", "parent"]) {
      expect(JSON.stringify(body)).not.toContain(`"${key}"`);
    }
  });
  it.each(["estimate", "reviewHash", "inputHash", "authorizationVersion", "createdAt", "expiresAt"] as const)(
    "rejects changed immutable %s", async field => {
      const original = estimateArchiveCardFixture(), view = structuredClone({ view: original });
      if (field === "estimate") view.view.ticket.estimate.name = "Changed source";
      else if (field.endsWith("At")) view.view.ticket[field] = new Date(Date.parse(view.view.ticket[field]) - 1).toISOString();
      else view.view.ticket[field] = "f".repeat(64);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(view)));
      await expect(estimateArchiveRequest(estimateArchiveWorkspace, original.ticket, "GET")).rejects.toThrow();
    },
  );
  it("rejects pending confirmations, wrong cancellations, forged receipts and private extensions", async () => {
    const view = estimateArchiveCardFixture(), confirmed = estimateArchiveCardConfirmed(view);
    for (const result of [{ view }, { view, href: `/estimates/${view.ticket.estimate.id}?workspace=${estimateArchiveWorkspace}` },
      { view: { ...view, sendNow: true } }, { view: { ...confirmed, receipt: { ...confirmed.receipt, version: 99 } } }]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
      await expect(estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, "POST", "confirm")).rejects.toThrow();
      await expect(estimateArchiveRequest(estimateArchiveWorkspace, view.ticket, "POST", "cancel")).rejects.toThrow();
    }
  });
  it("opens only the exact checked receipt and current workspace, never on a GET or confirmation", async () => {
    const original = estimateArchiveCardFixture(), view = estimateArchiveCardConfirmed(original);
    for (const href of [undefined, `/estimates/${view.review.parent.id}?workspace=${estimateArchiveWorkspace}`,
      `/estimates/${view.ticket.estimate.id}?workspace=${estimateArchiveOtherWorkspace}`, "https://evil.example.test/"]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view, href })));
      await expect(estimateArchiveRequest(estimateArchiveWorkspace, original.ticket, "POST", "open")).rejects.toThrow();
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view,
      href: `/estimates/${view.ticket.estimate.id}?workspace=${estimateArchiveWorkspace}` })));
    await expect(estimateArchiveRequest(estimateArchiveWorkspace, original.ticket, "GET")).rejects.toThrow();
    await expect(estimateArchiveRequest(estimateArchiveWorkspace, original.ticket, "POST", "confirm")).rejects.toThrow();
  });
  it("surfaces API errors without fabricating a receipt and rejects invalid workspace metadata", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ error: "Review changed." }, { status: 409 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(estimateArchiveRequest(estimateArchiveWorkspace, estimateArchiveCardFixture().ticket, "GET")).rejects.toThrow("Review changed.");
    await expect(estimateArchiveRequest("invalid", estimateArchiveCardFixture().ticket, "GET")).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
