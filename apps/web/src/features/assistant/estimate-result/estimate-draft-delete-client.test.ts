import { afterEach, describe, expect, it, vi } from "vitest";
import {
  estimateDraftDeleteCardCancelled,
  estimateDraftDeleteCardConfirmed,
  estimateDraftDeleteCardFixture,
  estimateDraftDeleteWorkspace,
} from "../../estimates/estimate-draft-delete-card/estimate-draft-delete-card.fixtures";
import { estimateDraftDeleteBinding, estimateDraftDeleteRequest } from "./estimate-draft-delete-client";

afterEach(() => vi.unstubAllGlobals());

describe("connected Draft-deletion browser boundary", () => {
  it("loads only the separately authorized exact review without private query data", async () => {
    const view = estimateDraftDeleteCardFixture();
    const fetcher = vi.fn().mockResolvedValue(Response.json({ view }));
    vi.stubGlobal("fetch", fetcher);
    const abort = new AbortController();
    expect((await estimateDraftDeleteRequest(
      estimateDraftDeleteWorkspace, view.ticket, "GET", undefined, undefined, abort.signal,
    )).view).toEqual(view);
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("/api/chat/estimates/draft-deletions?");
    expect(String(url)).toContain(`reviewHash=${view.ticket.reviewHash}`);
    expect(options).toMatchObject({ cache: "no-store", signal: abort.signal });
    expect(options.body).toBeUndefined();
    for (const value of [
      view.review.name, view.review.recipientName, view.review.parent.name,
    ]) expect(String(url)).not.toContain(value);
  });

  it.each([
    ["confirm", "EST-2048"],
    ["cancel", undefined],
  ] as const)("sends strict metadata-only %s and accepts only its checked outcome", async (decision, typedConfirmation) => {
    const original = estimateDraftDeleteCardFixture();
    const view = decision === "confirm"
      ? estimateDraftDeleteCardConfirmed(original)
      : estimateDraftDeleteCardCancelled(original);
    const fetcher = vi.fn().mockResolvedValue(Response.json({ view }));
    vi.stubGlobal("fetch", fetcher);
    await estimateDraftDeleteRequest(
      estimateDraftDeleteWorkspace, original.ticket, "POST", decision, typedConfirmation,
    );
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body).toEqual({
      workspaceId: estimateDraftDeleteWorkspace,
      request: estimateDraftDeleteBinding(original.ticket),
      decision,
      ...(decision === "confirm" ? { typedConfirmation } : {}),
    });
    for (const key of ["name", "recipientName", "parent", "review", "receipt", "grants"]) {
      expect(JSON.stringify(body)).not.toContain(`"${key}"`);
    }
  });

  it("rejects responses that do not carry the matching terminal state and receipt", async () => {
    const original = estimateDraftDeleteCardFixture();
    for (const view of [
      original,
      estimateDraftDeleteCardCancelled(original),
      {
        ...estimateDraftDeleteCardConfirmed(original),
        receipt: { ...estimateDraftDeleteCardConfirmed(original).receipt!, version: 99 },
      },
    ]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ view })));
      await expect(estimateDraftDeleteRequest(
        estimateDraftDeleteWorkspace, original.ticket, "POST", "confirm", "EST-2048",
      )).rejects.toThrow();
    }
  });

  it("surfaces API errors and rejects invalid workspace metadata", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({ error: "Review changed." }, { status: 409 }),
    );
    vi.stubGlobal("fetch", fetcher);
    await expect(estimateDraftDeleteRequest(
      estimateDraftDeleteWorkspace, estimateDraftDeleteCardFixture().ticket, "GET",
    )).rejects.toThrow("Review changed.");
    await expect(estimateDraftDeleteRequest(
      "invalid", estimateDraftDeleteCardFixture().ticket, "GET",
    )).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
