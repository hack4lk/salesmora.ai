import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses } from "../estimate-preview.types";
import { estimateDeleteDraftDialogData as c, estimateDeleteDraftFixture as estimate } from "./estimate-delete-draft-dialog.data";
import {
  initialEstimateDeleteDraftValues, isEstimateDeleteDraftReviewCurrent, reviewEstimateDeleteDraft,
  type EstimateDeleteDraftReviewInput,
} from "./estimate-delete-draft-dialog.preview";

const input: EstimateDeleteDraftReviewInput = {
  estimate, capabilities: roles.owner,
  value: { ...initialEstimateDeleteDraftValues(estimate), typedConfirmation: estimate.number },
};

describe("Draft deletion eligibility", () => {
  it("starts with blank typed confirmation bound to the current record/version", () => {
    expect(initialEstimateDeleteDraftValues(estimate)).toEqual({ estimateId: estimate.id, expectedVersion: estimate.version, typedConfirmation: "" });
    expect(reviewEstimateDeleteDraft({ ...input, value: initialEstimateDeleteDraftValues(estimate) }))
      .toEqual({ issues: [], eligible: true, request: null });
  });
  it.each(estimateStatuses)("allows only Draft, not %s", (status) => {
    const result = reviewEstimateDeleteDraft({ ...input, estimate: { ...estimate, status } });
    expect(result.request !== null).toBe(status === "draft");
  });
  it.each(estimateStatuses)("does not delete archived %s", (status) => {
    const result = reviewEstimateDeleteDraft({ ...input, estimate: { ...estimate, status, archived: true } });
    expect(result.request).toBeNull();
    expect(result.issues).toContain(c.errors.archived);
  });
  it.each(["owner", "admin", "office"] as const)("allows the host-scoped %s delete grant", (role) => {
    expect(reviewEstimateDeleteDraft({ ...input, capabilities: roles[role] }).request).not.toBeNull();
  });
  it("requires delete, not other mutation grants", () => {
    expect(reviewEstimateDeleteDraft({ ...input, capabilities: roles.field }).issues).toContain(c.errors.permission);
    expect(reviewEstimateDeleteDraft({ ...input, capabilities: { ...roles.owner, delete: false } }).request).toBeNull();
    expect(reviewEstimateDeleteDraft({ ...input, capabilities: {
      read: true, delete: true, create: false, update: false, send: false, decide: false, void: false, archive: false, export: false,
    } }).request).not.toBeNull();
  });
  it("hides other validation after read loss, even with delete granted", () => {
    expect(reviewEstimateDeleteDraft({
      ...input, capabilities: { ...roles.owner, read: false }, estimate: { ...estimate, archived: true, sharing: "shared", version: 0 },
    })).toEqual({ issues: [c.errors.read], eligible: false, request: null });
  });
  it.each(["shared", "unavailable"] as const)("fails closed with %s sharing history even for a Draft", (sharing) => {
    const result = reviewEstimateDeleteDraft({ ...input, estimate: { ...estimate, sharing } });
    expect(result.eligible).toBe(false);
    expect(result.request).toBeNull();
    expect(result.issues).toContain(sharing === "shared" ? c.errors.shared : c.errors.sharingUnavailable);
  });
  it("permits an unsent revision without deleting a previously shared revision", () => {
    const record = { ...estimate, revision: 2 };
    const before = structuredClone(record);
    expect(reviewEstimateDeleteDraft({ ...input, estimate: record }).request).toEqual(input.value);
    expect(record).toEqual(before);
  });
  it.each(["", " \n "])("permits incomplete recipient details on an otherwise deletable Draft: %j", (recipientName) => {
    expect(reviewEstimateDeleteDraft({ ...input, estimate: { ...estimate, recipientName } }).request).not.toBeNull();
  });
});

describe("Exact typed confirmation and request", () => {
  it.each(["", "est-2048", "EST-204", "EST-2049", " EST-2048", "EST-2048 ", "EST-2048\n", "EST–2048", "EST-２０４８"])
  ("rejects non-exact typed number %j without trimming or normalizing", (typedConfirmation) => {
    const result = reviewEstimateDeleteDraft({ ...input, value: { ...input.value, typedConfirmation } });
    expect(result.request).toBeNull();
    expect(result.eligible).toBe(true);
  });
  it("requires the current record number, not a hard-coded fixture", () => {
    const current = { ...estimate, number: "EST-3072" };
    expect(reviewEstimateDeleteDraft({ ...input, estimate: current }).request).toBeNull();
    expect(reviewEstimateDeleteDraft({ ...input, estimate: current, value: { ...input.value, typedConfirmation: current.number } }).request?.typedConfirmation)
      .toBe(current.number);
  });
  it("returns only ID/version/exact confirmation, never client grants or deletion scope", () => {
    const value = { ...input.value, status: "draft", sharing: "never-shared", deleteAllRevisions: true, capabilities: roles.owner };
    expect(reviewEstimateDeleteDraft({ ...input, value }).request).toEqual(input.value);
  });
  it("does not mutate the record, values or capabilities", () => {
    const before = structuredClone(input);
    reviewEstimateDeleteDraft(input);
    expect(input).toEqual(before);
  });
});

describe("Saved metadata and record binding", () => {
  it.each([
    { id: "" }, { id: " " }, { number: "" }, { number: " " }, { name: "" }, { name: "x".repeat(121) },
    { revision: 0 }, { revision: -1 }, { revision: 1.5 }, { revision: Number.NaN }, { revision: Number.MAX_SAFE_INTEGER + 1 },
    { version: 0 }, { version: -1 }, { version: 1.5 }, { version: Number.NaN }, { version: Number.MAX_SAFE_INTEGER + 1 },
  ])("blocks invalid saved metadata %j", (patch) => {
    const result = reviewEstimateDeleteDraft({ ...input, estimate: { ...estimate, ...patch } });
    expect(result.request).toBeNull();
    expect(result.issues).toContain(c.errors.record);
  });
  it.each([
    { estimateId: "" }, { estimateId: "another-estimate" }, { expectedVersion: 2 }, { expectedVersion: 4 },
    { expectedVersion: Number.NaN }, { expectedVersion: 3.5 },
  ])("blocks mismatched controlled confirmation %j", (patch) => {
    const next = { ...input, value: { ...input.value, ...patch } };
    expect(isEstimateDeleteDraftReviewCurrent(next)).toBe(false);
    expect(reviewEstimateDeleteDraft(next).request).toBeNull();
    expect(reviewEstimateDeleteDraft(next).issues).toContain(c.errors.binding);
  });
  it("requires host rebinding and a newly typed confirmation after reload", () => {
    const record = { ...estimate, version: estimate.version + 1 };
    expect(reviewEstimateDeleteDraft({ ...input, estimate: record }).request).toBeNull();
    const value = initialEstimateDeleteDraftValues(record);
    expect(isEstimateDeleteDraftReviewCurrent({ ...input, estimate: record, value })).toBe(true);
    expect(reviewEstimateDeleteDraft({ ...input, estimate: record, value }).request).toBeNull();
    expect(reviewEstimateDeleteDraft({ ...input, estimate: record, value: { ...value, typedConfirmation: record.number } }).request)
      .toEqual({ estimateId: record.id, expectedVersion: record.version, typedConfirmation: record.number });
  });
});
