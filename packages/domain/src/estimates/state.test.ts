import { describe, expect, it } from "vitest";
import { canTransitionEstimate, estimateStatusAtDate } from "./state";

describe("estimate lifecycle state", () => {
  it("allows only the approved lifecycle transitions", () => {
    expect(canTransitionEstimate("draft", "sent")).toBe(true);
    expect(canTransitionEstimate("draft", "published")).toBe(true);
    expect(canTransitionEstimate("sent", "accepted")).toBe(true);
    expect(canTransitionEstimate("published", "void")).toBe(true);
    expect(canTransitionEstimate("declined", "superseded")).toBe(true);
    expect(canTransitionEstimate("draft", "accepted")).toBe(false);
    expect(canTransitionEstimate("accepted", "void")).toBe(false);
    expect(canTransitionEstimate("superseded", "sent")).toBe(false);
    expect(canTransitionEstimate("void", "published")).toBe(false);
  });

  it("expires sent and published estimates only after their valid-through date", () => {
    expect(estimateStatusAtDate("sent", "2026-10-23", "2026-10-23")).toBe("sent");
    expect(estimateStatusAtDate("published", "2026-10-22", "2026-10-23")).toBe("expired");
    expect(estimateStatusAtDate("draft", "2026-10-22", "2026-10-23")).toBe("draft");
    expect(estimateStatusAtDate("accepted", "2026-10-22", "2026-10-23")).toBe("accepted");
    expect(estimateStatusAtDate("sent", null, "2026-10-23")).toBe("sent");
  });
});
