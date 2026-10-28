import { describe, expect, it } from "vitest";
import type { LeadStage } from "../leads/move-stage-dialog/move-stage-dialog";
import { estimateStatuses } from "./estimate-preview.types";
import { getEstimateLeadStageTarget, type EstimateLeadStageContext } from "./estimate-lead-suggestions";

const lead = { id: "lead", version: 3, name: "Jordan Lee", stage: "contacted", canMove: true, archived: false } as const;
const sent = { event: { kind: "send" }, parentType: "lead", status: "sent", canRead: true, lead } satisfies EstimateLeadStageContext;
const declined = {
  ...sent, event: { kind: "decision", outcome: "declined", previousOutcome: null }, status: "declined",
} satisfies EstimateLeadStageContext;
const stages: readonly LeadStage[] = ["new", "contacted", "estimate-sent", "won", "lost"];

describe("Estimate lead-stage suggestion presentation eligibility", () => {
  it.each(stages)("only suggests Estimate sent from an open earlier stage (%s)", (stage) => {
    expect(getEstimateLeadStageTarget({ ...sent, lead: { ...lead, stage } }))
      .toBe(stage === "new" || stage === "contacted" ? "estimate-sent" : null);
  });
  it.each(stages)("only suggests Lost from an open lead (%s)", (stage) => {
    expect(getEstimateLeadStageTarget({ ...declined, lead: { ...lead, stage } }))
      .toBe(stage === "won" || stage === "lost" ? null : "lost");
  });
  it.each(estimateStatuses)("requires a still-Sent estimate for the Send event (%s)", (status) => {
    expect(getEstimateLeadStageTarget({ ...sent, status })).toBe(status === "sent" ? "estimate-sent" : null);
  });
  it.each(estimateStatuses)("requires a still-Declined estimate for the decision event (%s)", (status) => {
    expect(getEstimateLeadStageTarget({ ...declined, status })).toBe(status === "declined" ? "lost" : null);
  });
  for (const context of [sent, declined]) {
    it.each(["publish", "resend"] as const)(`does not suggest a move after %s (${context.status})`, (kind) => {
      expect(getEstimateLeadStageTarget({ ...context, event: { kind } })).toBeNull();
    });
    it.each([
      { canRead: false }, { canRead: undefined }, { parentType: "job" as const }, { archived: true },
      { lead: undefined }, { event: null }, { lead: { ...lead, canMove: false } }, { lead: { ...lead, archived: true } },
    ])(`suppresses unavailable, ungranted and unrelated ${context.status} suggestions (%j)`, (override) => {
      expect(getEstimateLeadStageTarget({ ...context, ...override })).toBeNull();
    });
  }
  it("offers Lost when a correction changes Accepted to Declined", () => {
    expect(getEstimateLeadStageTarget({
      ...declined, event: { kind: "decision", outcome: "declined", previousOutcome: "accepted" },
    })).toBe("lost");
  });
  it("does not retrigger for a note, date or channel correction to an existing Declined decision", () => {
    expect(getEstimateLeadStageTarget({
      ...declined, event: { kind: "decision", outcome: "declined", previousOutcome: "declined" },
    })).toBeNull();
  });
  it("does not suggest Lost for an Accepted decision, even with stale Declined presentation", () => {
    expect(getEstimateLeadStageTarget({
      ...declined, event: { kind: "decision", outcome: "accepted", previousOutcome: "declined" },
    })).toBeNull();
  });
  it("does not change the supplied estimate, event or lead", () => {
    const before = structuredClone(declined);
    getEstimateLeadStageTarget(declined);
    expect(declined).toEqual(before);
  });
});
