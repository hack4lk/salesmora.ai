import { estimateDecisionDialogData, estimateDecisionFixture, estimateDecisionCorrectionFixture } from "../estimate-decision-dialog/estimate-decision-dialog.data";
import { initialEstimateDecisionValues } from "../estimate-decision-dialog/estimate-decision-dialog.preview";
import type { EstimateDecisionMode } from "../estimate-decision-dialog/estimate-decision-dialog.preview";
import type { EstimateDecisionCardContext, EstimateDecisionProposal } from "./estimate-decision-card.types";

export const estimateDecisionCardData = {
  titles: { record: "Record customer decision", correct: "Correct customer decision" },
  descriptions: { record: estimateDecisionDialogData.description, correct: estimateDecisionDialogData.correctionDescription },
  labels: {
    number: "Estimate", name: "Estimate name", recipientName: "Prepared for", totalCents: "Frozen snapshot total",
  },
  revision: estimateDecisionDialogData.revision,
  proposed: "Proposed decision",
  current: "Existing decision",
  outcome: "Customer decision",
  date: "Decision date",
  timezone: "Workspace timezone",
  channel: "Received via",
  note: "Staff decision note",
  reason: "Reason for correction",
  outcomes: estimateDecisionDialogData.outcomes,
  channels: estimateDecisionDialogData.channels,
  missing: "Not provided",
  unavailable: "This estimate proposal is unavailable in your permitted scope.",
  previousUnavailable: "The existing decision is unavailable or inconsistent. Reload before reviewing a correction.",
  confirm: { record: "Confirm decision", correct: "Confirm correction" },
  cancel: "Cancel proposal",
  effects: "The customer is not notified. This is not an online signature, contract or payment. No job is created and the lead stage does not change.",
  acceptedEffect: estimateDecisionDialogData.acceptedEffect,
  declinedEffect: estimateDecisionDialogData.declinedEffect,
  reviewHint: "Check the date, channel and note against the customer's response. To change this proposal, cancel and request a refreshed review. This card never guesses missing details.",
  issuesLabel: "Before recording the decision",
  expires: "Proposal expires",
  working: "Requesting the operation...",
  requested: "Request received. Waiting for the host to return the outcome. This card has not marked any decision or history entry as saved.",
  noHandler: "Decision confirmation and cancellation are not connected in this view.",
  failure: "The proposal operation failed. No saved decision was confirmed. Review the current status before retrying.",
  states: {
    pending: "Ready for your review",
    confirmed: "The host reports this decision proposal was saved.",
    cancelled: "The host reports this proposal was cancelled. No decision change was requested.",
    expired: "Proposal expired. Request a new proposal.",
    superseded: "Replaced by a newer proposal. Review the latest one.",
    conflict: "The estimate or decision changed. Reload and review a new proposal.",
    forbidden: "This proposal is no longer authorized.",
  },
  errors: {
    metadata: "The proposal reference, content hash or 15-minute review window is invalid. Request a new proposal.",
    binding: "The proposal no longer matches the authorized record, decision, snapshot or policy. Reload and review a new proposal.",
    snapshot: "The frozen estimate snapshot is unavailable or changed. Reload before recording the decision.",
  },
  stories: {
    title: "Assistant Decision proposal card",
    heading: "Review the customer's response",
    notice: "Fictional assistant presentation only. No decision, history entry, customer notification, job or payment is created.",
    note: estimateDecisionDialogData.stories.note,
    declineNote: estimateDecisionDialogData.stories.declineNote,
    reason: estimateDecisionDialogData.stories.correctionReason,
    literal: estimateDecisionDialogData.stories.literal,
    longName: estimateDecisionDialogData.stories.longName,
    longCustomer: estimateDecisionDialogData.stories.longCustomer,
    longNote: "Customer reviewed the installation details and confirmed the agreed scope by phone. ".repeat(6),
    longWord: "MontgomeryWellingtonRestorationPartnership".repeat(12),
    failure: "Sample operation rejected. No decision was saved by this preview.",
    yes: "yes",
    revoke: "Remove sample read access",
    parent: "Remove sample parent access",
    grant: "Remove sample decision permission",
    correctionGrant: "Remove sample correction permission",
    policy: "Simulate policy or membership change",
    version: "Simulate a newer estimate version",
    snapshot: "Replace the sample frozen snapshot",
    values: "Change the sample proposed decision",
    previous: "Change the sample existing decision",
    replace: "Supply a new sample proposal",
    release: "Resolve the previous sample operation",
    hostConfirm: "Supply a confirmed host status",
    toggleDisabled: "Toggle sample disabled state",
  },
} as const;

export function estimateDecisionProposalFixture(mode: EstimateDecisionMode = "record"): EstimateDecisionProposal {
  const now = Date.now();
  const estimate = {
    ...structuredClone(mode === "correct" ? estimateDecisionCorrectionFixture : estimateDecisionFixture),
    id: "estimate-2048", totalCents: 96917,
  };
  return {
    id: "estimate-decision-proposal-sample", actionType: "estimate.decision",
    inputHash: "e".repeat(64), authorizationVersion: "sample-policy-1:membership-1",
    createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 900000).toISOString(),
    state: "pending", mode, estimate, snapshotHash: "d".repeat(64),
    value: {
      ...initialEstimateDecisionValues(estimate, "2026-10-23"), outcome: "accepted", channel: "phone",
      note: estimateDecisionCardData.stories.note,
      reason: mode === "correct" ? estimateDecisionCardData.stories.reason : "",
    },
  };
}
export function estimateDecisionCardContextFixture(proposal: EstimateDecisionProposal): EstimateDecisionCardContext {
  return {
    proposalId: proposal.id, inputHash: proposal.inputHash, authorizationVersion: proposal.authorizationVersion,
    mode: proposal.mode, estimate: structuredClone(proposal.estimate), value: structuredClone(proposal.value),
    snapshotHash: proposal.snapshotHash, today: "2026-10-23", timezone: "America/New_York",
  };
}
