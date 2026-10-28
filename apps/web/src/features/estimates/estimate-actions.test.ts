import { describe, expect, it } from "vitest";
import { getEstimateRowActions, getEstimateStatusActions, type EstimateRowAction, type EstimateStatusAction } from "./estimate-actions";
import { estimateCapabilitiesByRole as roles } from "./estimate-preview.data";
import { estimateStatuses, type EstimateCapabilities, type EstimateStatus } from "./estimate-preview.types";

const rowActions: Record<EstimateStatus, EstimateRowAction[]> = {
  draft: ["open", "duplicate", "delete-draft"],
  sent: ["open", "duplicate", "revise", "void"],
  published: ["open", "duplicate", "revise", "void"],
  accepted: ["open", "duplicate"],
  declined: ["open", "duplicate", "revise", "archive"],
  expired: ["open", "duplicate", "revise", "archive"],
  superseded: ["open", "duplicate", "archive"],
  void: ["open", "duplicate", "archive"],
};
const statusActions: Record<EstimateStatus, EstimateStatusAction[]> = {
  draft: ["send", "publish"],
  sent: ["mark-accepted", "mark-declined", "revise"],
  published: ["mark-accepted", "mark-declined", "revise"],
  accepted: ["convert", "correct-decision"],
  declined: ["revise", "correct-decision"],
  expired: ["revise"],
  superseded: [],
  void: [],
};
const caps = roles.owner;
const context = { capabilities: caps, canCorrectDecision: true, canConvertToJob: true, parentType: "lead" as const };
const readOnly: EstimateCapabilities = {
  read: true, create: false, update: false, send: false, decide: false,
  void: false, archive: false, delete: false, export: false,
};

describe("Estimate action presentation eligibility", () => {
  it.each(estimateStatuses)("preserves the existing %s row-menu actions and order", (status) => {
    expect(getEstimateRowActions({ status, capabilities: caps })).toEqual(rowActions[status]);
  });

  it.each(estimateStatuses)("keeps only duplicate/restore for archived %s row menus", (status) => {
    expect(getEstimateRowActions({ status, archived: true, capabilities: caps })).toEqual(["open", "duplicate", "restore"]);
  });

  it.each(estimateStatuses)("offers focused %s status actions", (status) => {
    expect(getEstimateStatusActions({ ...context, status })).toEqual(statusActions[status]);
  });

  it.each(estimateStatuses)("suppresses every primary action on archived %s", (status) => {
    expect(getEstimateStatusActions({ ...context, status, archived: true })).toEqual([]);
  });

  it.each(estimateStatuses)("never exposes %s actions without read permission, even with other grants", (status) => {
    const capabilities = { ...caps, read: false };
    expect(getEstimateRowActions({ status, capabilities })).toEqual([]);
    expect(getEstimateStatusActions({ ...context, status, capabilities })).toEqual([]);
  });

  it.each(estimateStatuses)("leaves read-only %s records without mutation actions", (status) => {
    expect(getEstimateRowActions({ status, capabilities: readOnly })).toEqual(["open"]);
    expect(getEstimateStatusActions({ status, capabilities: readOnly })).toEqual([]);
  });

  it("requires send permission independently from update permission", () => {
    expect(getEstimateStatusActions({ ...context, status: "draft", capabilities: { ...caps, send: false } })).toEqual([]);
    expect(getEstimateStatusActions({ status: "draft", capabilities: { ...readOnly, send: true } })).toEqual(["send", "publish"]);
  });

  it("requires decide for both recording a decision and correcting it", () => {
    const capabilities = { ...caps, decide: false };
    expect(getEstimateStatusActions({ ...context, status: "sent", capabilities })).toEqual(["revise"]);
    expect(getEstimateStatusActions({ ...context, status: "accepted", capabilities })).toEqual(["convert"]);
    expect(getEstimateStatusActions({ ...context, status: "declined", capabilities })).toEqual(["revise"]);
  });

  it("requires the separate correction grant without removing ordinary decision recording", () => {
    expect(getEstimateStatusActions({ status: "accepted", capabilities: caps })).toEqual([]);
    expect(getEstimateStatusActions({ status: "declined", capabilities: caps })).toEqual(["revise"]);
    expect(getEstimateStatusActions({ status: "sent", capabilities: caps })).toEqual(["mark-accepted", "mark-declined", "revise"]);
  });

  it("only offers conversion with the explicit host grant on an unconverted accepted record", () => {
    expect(getEstimateStatusActions({ status: "accepted", capabilities: caps })).toEqual([]);
    expect(getEstimateStatusActions({ status: "accepted", capabilities: caps, canConvertToJob: true, parentType: "lead" })).toEqual(["convert"]);
    expect(getEstimateStatusActions({ ...context, status: "accepted", hasConvertedJob: true })).toEqual(["correct-decision"]);
    expect(getEstimateStatusActions({ ...context, status: "declined", hasConvertedJob: true })).toEqual(["revise", "correct-decision"]);
  });
  it("never offers another job for a job-linked estimate, even with an explicit conversion grant", () => {
    expect(getEstimateStatusActions({ ...context, status: "accepted", parentType: "job" })).toEqual(["correct-decision"]);
    expect(getEstimateStatusActions({ ...context, status: "accepted", parentType: "lead" })).toEqual(["convert", "correct-decision"]);
    expect(getEstimateStatusActions({ ...context, status: "accepted", parentType: undefined })).toEqual(["correct-decision"]);
  });

  it.each(["owner", "admin", "office"] as const)("preserves %s defaults with host-authorized correction/conversion grants", (role) => {
    expect(getEstimateStatusActions({ ...context, status: "accepted", capabilities: roles[role] })).toEqual(["convert", "correct-decision"]);
  });

  it("supports assigned-job Field decisions without role-restricted correction or administrative menu actions", () => {
    expect(getEstimateStatusActions({ status: "sent", capabilities: roles.field })).toEqual(["mark-accepted", "mark-declined", "revise"]);
    expect(getEstimateStatusActions({ status: "accepted", capabilities: roles.field })).toEqual([]);
    expect(getEstimateRowActions({ status: "sent", capabilities: roles.field })).toEqual(["open", "duplicate", "revise"]);
    expect(getEstimateRowActions({ status: "declined", capabilities: roles.field })).toEqual(["open", "duplicate", "revise"]);
    expect(getEstimateRowActions({ status: "draft", capabilities: roles.field })).toEqual(["open", "duplicate"]);
  });

  it.each(estimateStatuses)("keeps revision eligibility identical in menu and panel for %s", (status) => {
    for (const capabilities of [caps, roles.field, { ...caps, update: false }, readOnly]) {
      expect(getEstimateStatusActions({ ...context, status, capabilities }).includes("revise"))
        .toBe(getEstimateRowActions({ status, capabilities }).includes("revise"));
    }
  });

  it("does not mutate a supplied record or permissions", () => {
    const input = { ...context, status: "sent" as const };
    const before = structuredClone(input);
    getEstimateStatusActions(input);
    getEstimateRowActions(input);
    expect(input).toEqual(before);
  });
});
