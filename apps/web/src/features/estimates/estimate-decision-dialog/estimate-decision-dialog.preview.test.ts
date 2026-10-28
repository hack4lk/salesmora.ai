import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateDecisionChannels, estimateDecisionOutcomes, estimateStatuses } from "../estimate-preview.types";
import { estimateDecisionDialogData as c, estimateDecisionFixture as estimate, estimateDecisionCorrectionFixture as correction } from "./estimate-decision-dialog.data";
import {
  initialEstimateDecisionValues, isEstimateDecisionChannel, isEstimateDecisionOutcome, isEstimateRecordedDecisionCurrent, reviewEstimateDecision,
  type EstimateDecisionReviewInput,
} from "./estimate-decision-dialog.preview";

const input: EstimateDecisionReviewInput = {
  estimate, capabilities: roles.owner, mode: "record", today: "2026-10-22", timezone: "America/New_York",
  value: { ...initialEstimateDecisionValues(estimate, "2026-10-22"), channel: "phone", note: c.stories.note },
};
const correctionInput: EstimateDecisionReviewInput = {
  ...input, estimate: correction, mode: "correct", canCorrectDecision: true,
  value: { ...initialEstimateDecisionValues(correction, input.today), outcome: "accepted", reason: c.stories.correctionReason },
};

describe("Controlled decision defaults", () => {
  it("binds to the reviewed record and defaults to workspace today with an explicit channel choice", () => {
    expect(initialEstimateDecisionValues(estimate, input.today)).toEqual({
      estimateId: estimate.id, expectedVersion: estimate.version, outcome: "accepted",
      decisionDate: input.today, channel: "", note: "", reason: "",
    });
    expect(initialEstimateDecisionValues(estimate, input.today, "declined").outcome).toBe("declined");
  });
  it("prefills correction fields without changing the original entry", () => {
    expect(initialEstimateDecisionValues(correction, input.today)).toEqual({
      estimateId: correction.id, expectedVersion: correction.version, ...correction.decision, reason: "",
    });
    expect(correction.decision?.outcome).toBe("declined");
  });
  it("does not invent a valid workspace date when it is unavailable", () => {
    expect(initialEstimateDecisionValues(estimate, "").decisionDate).toBe("");
  });
});

describe("Decision authorization and lifecycle", () => {
  it.each(estimateStatuses)("records only Sent or Published, not %s", (status) => {
    const result = reviewEstimateDecision({ ...input, estimate: { ...estimate, status } });
    expect(result.request !== null).toBe(status === "sent" || status === "published");
  });
  it.each(estimateStatuses)("blocks an archived %s record", (status) => {
    expect(reviewEstimateDecision({ ...input, estimate: { ...estimate, status, archived: true } }).issues).toContain(c.errors.archived);
  });
  it.each(["owner", "admin", "office", "field"] as const)("allows scoped %s decision grants", (role) => {
    expect(reviewEstimateDecision({ ...input, capabilities: roles[role] }).request).not.toBeNull();
  });
  it("requires decide, not update or send", () => {
    expect(reviewEstimateDecision({ ...input, capabilities: { ...roles.owner, decide: false } }).issues).toContain(c.errors.permission);
    expect(reviewEstimateDecision({ ...input, capabilities: { ...roles.owner, send: false, update: false } }).request).not.toBeNull();
  });
  it.each(["record", "correct"] as const)("returns only generic information after read loss in %s mode", (mode) => {
    expect(reviewEstimateDecision({
      ...(mode === "correct" ? correctionInput : input), mode, capabilities: { ...roles.owner, read: false },
      value: { ...input.value, outcome: "", channel: "", note: "x".repeat(501), reason: "" },
    })).toEqual({ request: null, eligible: false, issues: [c.errors.read], fieldErrors: {} });
  });
  it.each(["owner", "admin", "office"] as const)("allows correction for the host-scoped %s grant", (role) => {
    expect(reviewEstimateDecision({ ...correctionInput, capabilities: roles[role] }).request).not.toBeNull();
  });
  it("does not infer a correction grant from role capabilities", () => {
    expect(reviewEstimateDecision({ ...correctionInput, canCorrectDecision: false }).issues).toContain(c.errors.correctionPermission);
    expect(reviewEstimateDecision({ ...correctionInput, canCorrectDecision: undefined }).request).toBeNull();
  });
  it("blocks correction for Field without the additional grant, and after decision permission is revoked", () => {
    expect(reviewEstimateDecision({ ...correctionInput, capabilities: roles.field, canCorrectDecision: false }).request).toBeNull();
    expect(reviewEstimateDecision({ ...correctionInput, capabilities: { ...roles.owner, decide: false } }).request).toBeNull();
  });
  it.each(estimateStatuses)("only corrects an existing Accepted/Declined decision, not %s", (status) => {
    const previous = status === "accepted" ? { ...correction.decision!, outcome: "accepted" as const } : correction.decision;
    expect(reviewEstimateDecision({ ...correctionInput, estimate: { ...correction, status, decision: previous } }).request !== null)
      .toBe(status === "accepted" || status === "declined");
  });
});

describe("Decision fields, dates and exact request shape", () => {
  it.each(estimateDecisionOutcomes)("records %s without trusting client amount or capabilities", (outcome) => {
    expect(reviewEstimateDecision({ ...input, value: { ...input.value, outcome, reason: "Ignored for initial record" } }).request).toEqual({
      mode: "record", estimateId: estimate.id, expectedVersion: estimate.version,
      outcome, decisionDate: input.today, channel: "phone", note: c.stories.note,
    });
  });
  it.each(estimateDecisionChannels)("supports the agreed %s channel", (channel) => {
    expect(reviewEstimateDecision({ ...input, value: { ...input.value, channel } }).request?.channel).toBe(channel);
  });
  it("does not allow an unselected outcome or channel", () => {
    expect(reviewEstimateDecision({ ...input, value: { ...input.value, outcome: "", channel: "" } }).fieldErrors)
      .toEqual({ outcome: c.errors.outcome, channel: c.errors.channel });
  });
  it.each(["sms", "chat", "", "in person"])("guards unsupported channel %j", (channel) => {
    expect(isEstimateDecisionChannel(channel)).toBe(false);
  });
  it.each(["draft", "expired", "", "Accepted"])("guards unsupported outcome %j", (outcome) => {
    expect(isEstimateDecisionOutcome(outcome)).toBe(false);
  });
  it.each(["", "2026-02-30", "2026-2-03", "0000-01-01", "2026-10-22T12:00:00Z"])("rejects invalid decision date %j", (decisionDate) => {
    expect(reviewEstimateDecision({ ...input, value: { ...input.value, decisionDate } }).fieldErrors.decisionDate).toBe(c.errors.date);
  });
  it.each(["2026-10-22", "2026-10-21", "2024-02-29"])("allows today or a past real date %s", (decisionDate) => {
    expect(reviewEstimateDecision({ ...input, value: { ...input.value, decisionDate } }).request?.decisionDate).toBe(decisionDate);
  });
  it.each(["2026-10-23", "2027-01-01"])("blocks future date %s", (decisionDate) => {
    const result = reviewEstimateDecision({ ...input, value: { ...input.value, decisionDate } });
    expect(result.request).toBeNull();
    expect(result.fieldErrors.decisionDate).toBe(c.errors.future);
  });
  it("also rejects future dates and archive state in correction mode", () => {
    expect(reviewEstimateDecision({ ...correctionInput, value: { ...correctionInput.value, decisionDate: "2026-10-23" } }).fieldErrors.decisionDate)
      .toBe(c.errors.future);
    expect(reviewEstimateDecision({ ...correctionInput, estimate: { ...correction, archived: true } }).issues).toContain(c.errors.archived);
  });
  it("uses host today rather than the browser/UTC date", () => {
    expect(reviewEstimateDecision({ ...input, today: "2026-10-21" }).fieldErrors.decisionDate).toBe(c.errors.future);
  });
  it.each(["", "2026-02-30", "2026-10-22T00:00:00Z"])("blocks invalid workspace today %j", (today) => {
    expect(reviewEstimateDecision({ ...input, today }).issues).toContain(c.errors.today);
  });
  it.each(["", " ", "not-a-timezone"])("blocks invalid timezone %j without a silent fallback", (timezone) => {
    expect(reviewEstimateDecision({ ...input, timezone }).issues).toContain(c.errors.timezone);
  });
  it.each(["UTC", "Asia/Kathmandu", "America/Los_Angeles"])("accepts a real workspace timezone %s", (timezone) => {
    expect(reviewEstimateDecision({ ...input, timezone }).request).not.toBeNull();
  });
  it.each(["", " ", "x".repeat(500)])("allows optional note through 500 raw characters", (note) => {
    expect(reviewEstimateDecision({ ...input, value: { ...input.value, note } }).request?.note).toBe(note.trim());
  });
  it("rejects note over the raw character limit, not silently truncating", () => {
    const result = reviewEstimateDecision({ ...input, value: { ...input.value, note: " ".repeat(501) } });
    expect(result.request).toBeNull(); expect(result.fieldErrors.note).toBe(c.errors.note);
  });
  it("keeps multiline literal text and trims only outer whitespace", () => {
    expect(reviewEstimateDecision({ ...input, value: { ...input.value, note: ` \n${c.stories.literal} \n` } }).request?.note).toBe(c.stories.literal);
  });
  it("includes a required correction reason and the exact reviewed version", () => {
    expect(reviewEstimateDecision(correctionInput).request).toEqual({
      mode: "correct", estimateId: correction.id, expectedVersion: correction.version,
      outcome: "accepted", decisionDate: "2026-10-21", channel: "phone", note: correction.decision?.note,
      reason: c.stories.correctionReason,
    });
  });
  it.each(["", " ", "x".repeat(501)])("blocks missing/over-limit correction reason", (reason) => {
    const result = reviewEstimateDecision({ ...correctionInput, value: { ...correctionInput.value, reason } });
    expect(result.request).toBeNull(); expect(result.fieldErrors.reason).toBe(c.errors.reason);
  });
  it("allows exactly 500 reason characters and preserves internal line breaks", () => {
    expect(reviewEstimateDecision({ ...correctionInput, value: { ...correctionInput.value, reason: "x".repeat(500) } }).request).not.toBeNull();
    expect(reviewEstimateDecision({ ...correctionInput, value: { ...correctionInput.value, reason: `  ${c.stories.literal}  ` } }).request)
      .toMatchObject({ reason: c.stories.literal });
  });
  it("allows correction of date/channel/note without forcing an outcome reversal", () => {
    expect(reviewEstimateDecision({ ...correctionInput, value: { ...correctionInput.value, outcome: "declined", channel: "email" } }).request).not.toBeNull();
  });
});

describe("Current record binding and retained history", () => {
  it.each([{ id: "other" }, { version: 4 }, { version: 6 }])("blocks changed record %j", (patch) => {
    expect(reviewEstimateDecision({ ...input, estimate: { ...estimate, ...patch } }).issues).toContain(c.errors.binding);
  });
  it.each([{ id: "" }, { number: " " }, { revision: 0 }, { revision: 1.5 }, { version: NaN }, { name: "" }, { name: "x".repeat(121) }, { recipientName: "" }])("rejects invalid saved record %j", (patch) => {
    expect(reviewEstimateDecision({ ...input, estimate: { ...estimate, ...patch } }).issues).toContain(c.errors.record);
  });
  it.each([null, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("blocks invalid snapshot total %j", (totalCents) => {
    expect(reviewEstimateDecision({ ...input, estimate: { ...estimate, totalCents } }).issues).toContain(c.errors.total);
  });
  it.each([0, 2_000_000_000])("allows a legitimate zero/maximum snapshot total %s", (totalCents) => {
    expect(reviewEstimateDecision({ ...input, estimate: { ...estimate, totalCents } }).request).not.toBeNull();
  });
  it("blocks a new decision when an existing one unexpectedly appears", () => {
    expect(reviewEstimateDecision({ ...input, estimate: { ...estimate, decision: correction.decision } }).issues).toContain(c.errors.previous);
  });
  it("requires an existing, well-formed matching correction baseline", () => {
    expect(isEstimateRecordedDecisionCurrent(correction)).toBe(true);
    for (const decision of [null, { ...correction.decision!, outcome: "accepted" as const }, { ...correction.decision!, decisionDate: "2026-02-30" }, { ...correction.decision!, note: "x".repeat(501) }]) {
      expect(reviewEstimateDecision({ ...correctionInput, estimate: { ...correction, decision } }).issues).toContain(c.errors.previous);
    }
  });
  it("does not mutate the original decision, review fields or permissions", () => {
    const before = structuredClone(correctionInput);
    reviewEstimateDecision(correctionInput);
    expect(correctionInput).toEqual(before);
  });
});
