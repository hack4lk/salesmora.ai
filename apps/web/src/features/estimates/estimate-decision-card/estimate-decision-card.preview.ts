import { reviewAssistantProposalWindow } from "@salesmora/ui";
import {
  reviewEstimateDecision, type EstimateDecisionRecord, type EstimateDecisionValues,
} from "../estimate-decision-dialog/estimate-decision-dialog.preview";
import { estimateDecisionCardData as c } from "./estimate-decision-card.data";
import type { EstimateDecisionCardProps, EstimateDecisionCardRequest, EstimateDecisionProposal } from "./estimate-decision-card.types";

function decisionIdentity(value: EstimateDecisionRecord["decision"]) {
  return value && { outcome: value.outcome, decisionDate: value.decisionDate, channel: value.channel, note: value.note };
}
function recordIdentity(record: EstimateDecisionRecord) {
  return {
    id: record.id, version: record.version, number: record.number, revision: record.revision, name: record.name,
    status: record.status, archived: record.archived, recipientName: record.recipientName,
    totalCents: record.totalCents, decision: decisionIdentity(record.decision),
  };
}
function valueIdentity(value: EstimateDecisionValues) {
  return {
    estimateId: value.estimateId, expectedVersion: value.expectedVersion,
    outcome: value.outcome, decisionDate: value.decisionDate, channel: value.channel, note: value.note, reason: value.reason,
  };
}
export function estimateDecisionCardRequest(proposal: EstimateDecisionProposal): EstimateDecisionCardRequest {
  return {
    proposalId: proposal.id, actionType: proposal.actionType, inputHash: proposal.inputHash,
    authorizationVersion: proposal.authorizationVersion, estimateId: proposal.estimate.id,
    expectedVersion: proposal.estimate.version, snapshotHash: proposal.snapshotHash,
  };
}

/** UI review only. The server must independently authorize and commit the stored proposal. */
export function reviewEstimateDecisionCard({ proposal, context, capabilities, parentAccess, canCorrectDecision }: EstimateDecisionCardProps, now: number) {
  const window = reviewAssistantProposalWindow(proposal.createdAt, proposal.expiresAt, now);
  if (!capabilities.read || !parentAccess || proposal.state === "forbidden") {
    return { ...window, visible: false, issues: [c.unavailable], canConfirm: false, canCancel: false };
  }
  const validMetadata = window.valid && !!proposal.id.trim() && !!proposal.authorizationVersion.trim()
    && /^[a-f0-9]{64}$/.test(proposal.inputHash) && /^[a-f0-9]{64}$/.test(proposal.snapshotHash)
    && !!proposal.estimate.id.trim() && Number.isSafeInteger(proposal.estimate.version) && proposal.estimate.version > 0;
  const bound = !!context && proposal.id === context.proposalId && proposal.inputHash === context.inputHash
    && proposal.authorizationVersion === context.authorizationVersion && proposal.mode === context.mode
    && JSON.stringify(recordIdentity(proposal.estimate)) === JSON.stringify(recordIdentity(context.estimate))
    && JSON.stringify(valueIdentity(proposal.value)) === JSON.stringify(valueIdentity(context.value));
  const snapshotCurrent = !!context && proposal.snapshotHash === context.snapshotHash;
  const decision = context ? reviewEstimateDecision({
    estimate: context.estimate, value: context.value, mode: context.mode,
    today: context.today, timezone: context.timezone, capabilities, canCorrectDecision,
  }) : null;
  const issues = [
    ...(!validMetadata ? [c.errors.metadata] : []),
    ...(!bound ? [c.errors.binding] : []),
    ...(!snapshotCurrent ? [c.errors.snapshot] : []),
    ...(decision?.issues ?? []), ...Object.values(decision?.fieldErrors ?? {}),
  ];
  const active = proposal.state === "pending" && !window.expired;
  return {
    ...window, visible: true, issues: [...new Set(issues)],
    canConfirm: active && validMetadata && bound && snapshotCurrent && !issues.length && !!decision?.request,
    canCancel: active && validMetadata && bound && snapshotCurrent,
  };
}
