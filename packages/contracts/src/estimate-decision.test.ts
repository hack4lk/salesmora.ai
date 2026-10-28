import { describe, expect, it } from "vitest";
import { estimateDecisionCommandSchema } from "./estimate-decision";

const input = {
  workspaceId: "11111111-1111-4111-8111-111111111111", estimateId: "22222222-2222-4222-8222-222222222222",
  submissionId: "33333333-3333-4333-8333-333333333333", expectedVersion: 2, snapshotHash: "a".repeat(64),
  mode: "record", expectedDecisionId: null, outcome: "accepted", decisionDate: "2026-10-24", channel: "phone", note: "",
};
describe("estimate decision command", () => {
  it("requires explicit snapshot/version/current-decision binding and trims private text", () => {
    expect(estimateDecisionCommandSchema.parse({ ...input, note: "  Customer\nconfirmed  " }).note).toBe("Customer\nconfirmed");
    expect(estimateDecisionCommandSchema.parse({
      ...input, mode: "correct", expectedDecisionId: input.submissionId, reason: "  Wrong outcome  ",
    })).toMatchObject({ mode: "correct", reason: "Wrong outcome" });
  });
  it.each([
    { workspaceId: "other" }, { expectedVersion: 0 }, { expectedVersion: 1.5 }, { expectedDecisionId: "unbound" },
    { expectedDecisionId: undefined }, { snapshotHash: undefined }, { snapshotHash: "wrong" },
    { outcome: "void" }, { channel: "sms" }, { decisionDate: "2026-02-30" }, { decisionDate: "2026-13-01" }, { decisionDate: "0000-01-01" },
    { decisionDate: "2026-10-24T00:00:00Z" }, { note: " ".repeat(501) }, { note: null },
    { acceptedTotalCents: 1 }, { canCorrectDecision: true }, { reason: "Not a correction" },
    { mode: "correct", expectedDecisionId: null, reason: "Wrong outcome" },
    { mode: "correct", expectedDecisionId: input.submissionId, reason: "" },
    { mode: "correct", expectedDecisionId: input.submissionId, reason: " " },
    { mode: "correct", expectedDecisionId: input.submissionId, reason: " ".repeat(501) },
  ])("rejects invalid, unbound and client-authoritative input: %j", patch => {
    expect(estimateDecisionCommandSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  });
});
