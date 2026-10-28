import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateDecisionFixture, estimateDecisionWorkspaceId as workspaceId } from "./estimate-decision.fixtures";
import { estimateDecisionBinding, estimateDecisionRequest } from "./estimate-decision-client";

afterEach(() => vi.unstubAllGlobals());
describe("connected Decision browser boundary", () => {
  it("requests only exact metadata and parses the separately authorized review", async () => {
    const view = estimateDecisionFixture(), fetcher = vi.fn().mockResolvedValue(Response.json({ view }));
    vi.stubGlobal("fetch", fetcher);
    expect((await estimateDecisionRequest(workspaceId, view.ticket, "GET")).view).toEqual(view);
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("/api/chat/estimates/decisions?");
    expect(String(url)).toContain(`proposalId=${view.ticket.id}`);
    expect(options.cache).toBe("no-store"); expect(options.body).toBeUndefined();
  });
  it.each(["confirm", "cancel", "open"] as const)("sends metadata-only %s and accepts only its exact response", async decision => {
    const view = estimateDecisionFixture();
    view.ticket.state = decision === "cancel" ? "cancelled" : "confirmed";
    if (decision !== "cancel") view.receipt = {
      estimateId: view.ticket.estimate.id, version: 4, decisionId: "10000000-0000-4000-8000-000000000007",
      status: "accepted", updatedAt: new Date().toISOString(),
    };
    const href = `/estimates/${view.ticket.estimate.id}?workspace=${workspaceId}`;
    const fetcher = vi.fn().mockResolvedValue(Response.json({ view, ...(decision === "open" ? { href } : {}) }));
    vi.stubGlobal("fetch", fetcher);
    await estimateDecisionRequest(workspaceId, view.ticket, "POST", decision);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      workspaceId, request: estimateDecisionBinding(view.ticket), decision,
    });
  });
  it.each(["mode", "createdAt", "expiresAt", "snapshotHash", "inputHash", "authorizationVersion", "name", "totalCents"])(
    "rejects a response with changed immutable %s", async field => {
      const original = estimateDecisionFixture(), view = structuredClone(original);
      if (field === "name") { view.ticket.estimate.name = "Other"; view.review.estimate.name = "Other"; }
      else if (field === "totalCents") { view.ticket.estimate.totalCents = 1; view.review.estimate.totalCents = 1; }
      else if (field === "mode") view.ticket.mode = "correct";
      else if (field === "createdAt") view.ticket.createdAt = new Date(Date.parse(view.ticket.createdAt) + 1).toISOString();
      else if (field === "expiresAt") view.ticket.expiresAt = new Date(Date.parse(view.ticket.expiresAt) - 1).toISOString();
      else view.ticket[field as "snapshotHash" | "inputHash" | "authorizationVersion"] = "f".repeat(64);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view })));
      await expect(estimateDecisionRequest(workspaceId, original.ticket, "GET")).rejects.toThrow();
    },
  );
  it("rejects success-shaped pending confirmation, unchecked href and private extensions", async () => {
    const view = estimateDecisionFixture();
    for (const result of [{ view }, { view, href: `/estimates/${view.ticket.estimate.id}?workspace=${workspaceId}` },
      { view: { ...view, privateNote: "private" } }]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
      await expect(estimateDecisionRequest(workspaceId, view.ticket, "POST", "confirm")).rejects.toThrow();
    }
  });
  it("surfaces API errors instead of fabricating a terminal result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Review changed." }, { status: 409 })));
    await expect(estimateDecisionRequest(workspaceId, estimateDecisionFixture().ticket, "GET")).rejects.toThrow("Review changed.");
  });
});
