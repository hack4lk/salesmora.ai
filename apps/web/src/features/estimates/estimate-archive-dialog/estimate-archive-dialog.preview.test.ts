import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses } from "../estimate-preview.types";
import { estimateArchiveDialogData as c, estimateArchiveFixture as estimate } from "./estimate-archive-dialog.data";
import {
  initialEstimateArchiveReview, isEstimateArchiveReviewCurrent, reviewEstimateArchive,
  type EstimateArchiveReviewInput,
} from "./estimate-archive-dialog.preview";

const input: EstimateArchiveReviewInput = {
  estimate, capabilities: roles.owner, mode: "archive", review: initialEstimateArchiveReview(estimate, "archive"),
};
const restore: EstimateArchiveReviewInput = {
  ...input, estimate: { ...estimate, archived: true }, mode: "restore", review: initialEstimateArchiveReview(estimate, "restore"),
};

describe("Archive/restore eligibility", () => {
  it("binds the explicit reviewed action, estimate ID and version without guessing from the flag", () => {
    expect(initialEstimateArchiveReview(estimate, "archive")).toEqual({ estimateId: estimate.id, expectedVersion: estimate.version, mode: "archive" });
    expect(initialEstimateArchiveReview(estimate, "restore").mode).toBe("restore");
  });
  it.each(estimateStatuses)("archives only the agreed inactive statuses, not %s", (status) => {
    expect(reviewEstimateArchive({ ...input, estimate: { ...estimate, status } }).request !== null)
      .toBe(["declined", "expired", "superseded", "void"].includes(status));
  });
  it.each(estimateStatuses)("does not re-archive or implicitly restore archived %s", (status) => {
    const result = reviewEstimateArchive({ ...input, estimate: { ...estimate, status, archived: true } });
    expect(result.request).toBeNull();
    expect(result.issues).toContain(c.errors.archived);
  });
  it.each(estimateStatuses)("restores an authorized archived %s without changing its status", (status) => {
    const record = { ...restore.estimate, status };
    expect(reviewEstimateArchive({ ...restore, estimate: record }).request).toEqual(restore.review);
    expect(record.status).toBe(status);
    expect(record.archived).toBe(true);
  });
  it.each(estimateStatuses)("does not restore or implicitly archive active %s", (status) => {
    const result = reviewEstimateArchive({ ...restore, estimate: { ...estimate, status } });
    expect(result.request).toBeNull();
    expect(result.issues).toContain(c.errors.notArchived);
  });
  it.each(["owner", "admin", "office"] as const)("allows scoped %s archive/restore grants", (role) => {
    for (const current of [input, restore])
      expect(reviewEstimateArchive({ ...current, capabilities: roles[role] }).request).not.toBeNull();
  });
  it.each([input, restore])("blocks Field and missing archive grants in $mode mode", (current) => {
    for (const capabilities of [roles.field, { ...roles.owner, archive: false }]) {
      const result = reviewEstimateArchive({ ...current, capabilities });
      expect(result.request).toBeNull();
      expect(result.issues).toContain(c.errors.permission);
    }
  });
  it.each([input, restore])("requires the archive grant alone, not other mutation grants in $mode mode", (current) => {
    const capabilities = { read: true, archive: true, create: false, update: false, send: false, decide: false, void: false, delete: false, export: false };
    expect(reviewEstimateArchive({ ...current, capabilities }).request).not.toBeNull();
  });
  it.each([input, restore])("hides all other validation after read loss in $mode mode", (current) => {
    expect(reviewEstimateArchive({
      ...current, capabilities: { ...roles.owner, read: false, archive: false },
      estimate: { ...estimate, name: "", version: 0 }, review: { ...current.review, estimateId: "wrong" },
    })).toEqual({ issues: [c.errors.read], request: null });
  });
});

describe("Current review binding and saved metadata", () => {
  it.each([input, restore])("requires a current explicit $mode binding", (current) => {
    expect(isEstimateArchiveReviewCurrent(current)).toBe(true);
    for (const patch of [
      { estimateId: "" }, { estimateId: "another-estimate" }, { expectedVersion: estimate.version - 1 },
      { expectedVersion: estimate.version + 1 }, { expectedVersion: Number.NaN }, { expectedVersion: 1.5 },
      { mode: current.mode === "archive" ? "restore" as const : "archive" as const },
    ]) {
      const next = { ...current, review: { ...current.review, ...patch } };
      expect(isEstimateArchiveReviewCurrent(next)).toBe(false);
      expect(reviewEstimateArchive(next).request).toBeNull();
      expect(reviewEstimateArchive(next).issues).toContain(c.errors.binding);
    }
  });
  it.each([
    { id: "" }, { id: " " }, { number: "" }, { name: " " }, { name: "x".repeat(121) }, { recipientName: " " },
    { revision: 0 }, { revision: -1 }, { revision: 1.5 }, { revision: Number.NaN }, { revision: Number.MAX_SAFE_INTEGER + 1 },
    { version: 0 }, { version: -1 }, { version: 1.5 }, { version: Number.NaN }, { version: Number.MAX_SAFE_INTEGER + 1 },
  ])("rejects invalid saved metadata %j in both modes", (patch) => {
    for (const current of [input, restore]) {
      const result = reviewEstimateArchive({ ...current, estimate: { ...current.estimate, ...patch } });
      expect(result.request).toBeNull();
      expect(result.issues).toContain(c.errors.record);
    }
  });
  it("does not automatically rebind a refreshed record or invert the action", () => {
    const next = { ...estimate, version: estimate.version + 1 };
    expect(reviewEstimateArchive({ ...input, estimate: next }).request).toBeNull();
    expect(reviewEstimateArchive({ ...input, estimate: next, review: initialEstimateArchiveReview(next, "archive") }).request)
      .toEqual({ estimateId: estimate.id, expectedVersion: next.version, mode: "archive" });
    expect(reviewEstimateArchive({ ...input, estimate: { ...next, archived: true }, review: initialEstimateArchiveReview(next, "archive") }).request).toBeNull();
  });
  it.each([input, restore])("returns only the allowed $mode request fields and never mutates input", (current) => {
    const supplied = { ...current, review: { ...current.review, status: "void", archived: !current.estimate.archived, capabilities: roles.owner } };
    const before = structuredClone(supplied);
    expect(reviewEstimateArchive(supplied).request).toEqual({
      estimateId: current.estimate.id, expectedVersion: current.estimate.version, mode: current.mode,
    });
    expect(supplied).toEqual(before);
  });
});
