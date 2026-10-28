import { describe, expect, it } from "vitest";
import { estimateArchiveCommandSchema, estimateHistoryQuerySchema, voidEstimateSchema } from "./estimate-lifecycle";

const command = {
  workspaceId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1",
  estimateId: "b1e7c29c-6aec-4f7d-a0be-e0de8bf648b2",
  submissionId: "f4f5d450-faf8-4f02-b2b8-4d13a5900819",
  expectedVersion: 2, reason: "  Customer requested withdrawal.  ",
};
describe("estimate withdrawal commands", () => {
  it("trims a real reason, accepts the exact 500-character boundary and preserves literal text", () => {
    expect(voidEstimateSchema.parse(command).reason).toBe("Customer requested withdrawal.");
    expect(voidEstimateSchema.parse({ ...command, reason: "x".repeat(500) }).reason).toHaveLength(500);
    expect(voidEstimateSchema.parse({ ...command, reason: "<script>literal</script>\nNext line" }).reason).toContain("<script>");
  });
  it.each([
    { reason: "" }, { reason: " \n\t " }, { reason: "x".repeat(501) },
    { reason: " " + "x".repeat(500) }, { reason: null }, { expectedVersion: 0 },
    { expectedVersion: 1.5 }, { estimateId: "missing" }, { workspaceId: "" },
    { submissionId: "" }, { status: "void" }, { canVoid: true },
  ])("rejects invalid or authority-bearing inputs: %j", patch => {
    expect(voidEstimateSchema.safeParse({ ...command, ...patch }).success).toBe(false);
  });
});
describe("estimate history paging", () => {
  const query = { workspaceId: command.workspaceId, estimateId: command.estimateId };
  it("accepts bounded server paging and full-precision database cursors", () => {
    expect(estimateHistoryQuerySchema.parse(query)).toEqual(query);
    const before = { createdAt: "2026-10-24T14:00:00.123456Z", id: command.submissionId };
    expect(estimateHistoryQuerySchema.parse({ ...query, before }).before).toEqual(before);
  });

  describe("estimate archive and restore commands", () => {
    const base = {
      workspaceId: command.workspaceId, estimateId: command.estimateId,
      submissionId: command.submissionId, expectedVersion: command.expectedVersion,
    };
    it.each(["archive", "restore"])("accepts an explicit %s confirmation without client-supplied authority", mode => {
      expect(estimateArchiveCommandSchema.parse({ ...base, mode })).toEqual({ ...base, mode });
    });
    it.each([
      { mode: undefined }, { mode: "" }, { mode: "delete" }, { mode: true }, { expectedVersion: 0 },
      { expectedVersion: -1 }, { expectedVersion: 1.5 }, { expectedVersion: "2" },
      { workspaceId: "" }, { estimateId: "missing" }, { submissionId: null },
      { archived: true }, { archivedAt: "2026-10-26" }, { archivedBy: command.estimateId },
      { status: "expired" }, { canArchive: true }, { reason: "Not part of this command" },
    ])("rejects invalid, extra or authority-bearing fields: %j", patch => {
      expect(estimateArchiveCommandSchema.safeParse({ ...base, mode: "archive", ...patch }).success).toBe(false);
    });
  });
  it.each([
    { before: {} }, { before: { createdAt: "2026-10-24", id: command.submissionId } },
    { before: { createdAt: "2026-10-24T14:00:00Z", id: "bad" } }, { limit: 1_000_000 },
  ])("rejects invalid cursors and unbounded query fields: %j", patch => {
    expect(estimateHistoryQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
  });
});
