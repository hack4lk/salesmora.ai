import { isValidElement } from "react";
import { reviewAssistantProposalWindow } from "@salesmora/ui";
import { reviewEstimateSend } from "../estimate-send-dialog/estimate-send-dialog.preview";
import { estimateSendCardData as c } from "./estimate-send-card.data";
import type { EstimateSendCardProps, EstimateSendCardRequest, EstimateSendProposal } from "./estimate-send-card.types";

function recordIdentity(record: EstimateSendProposal["estimate"]) {
  return {
    id: record.id, version: record.version, number: record.number, revision: record.revision, name: record.name,
    status: record.status, archived: record.archived, recipientName: record.recipientName, recipientEmail: record.recipientEmail,
    totalCents: record.totalCents, validUntil: record.validUntil,
  };
}

export function estimateSendCardRequest(proposal: EstimateSendProposal): EstimateSendCardRequest {
  return {
    proposalId: proposal.id, actionType: proposal.actionType, inputHash: proposal.inputHash,
    authorizationVersion: proposal.authorizationVersion, estimateId: proposal.estimate.id,
    expectedVersion: proposal.estimate.version, snapshotHash: proposal.snapshotHash,
  };
}

/** Presentation checks only. The host must reauthorize and atomically execute the stored proposal. */
export function reviewEstimateSendCard({ proposal, context, capabilities, parentAccess }: EstimateSendCardProps, now: number) {
  const visible = capabilities.read && parentAccess && proposal.state !== "forbidden";
  const window = reviewAssistantProposalWindow(proposal.createdAt, proposal.expiresAt, now);
  if (!visible) return { visible: false, issues: [c.unavailable], canConfirm: false, canCancel: false, previewUsable: false, ...window };
  const validMetadata = window.valid && !!proposal.id.trim() && !!proposal.authorizationVersion.trim()
    && /^[a-f0-9]{64}$/.test(proposal.inputHash) && /^[a-f0-9]{64}$/.test(proposal.snapshotHash)
    && !!proposal.estimate.id.trim() && Number.isSafeInteger(proposal.estimate.version) && proposal.estimate.version > 0;
  const bound = !!context && proposal.id === context.proposalId && proposal.inputHash === context.inputHash
    && proposal.authorizationVersion === context.authorizationVersion && proposal.subject === context.subject
    && proposal.snapshotHash === context.snapshotHash
    && JSON.stringify(recordIdentity(proposal.estimate)) === JSON.stringify(recordIdentity(context.estimate));
  const sharing = context ? reviewEstimateSend({
    mode: "send", estimate: context.estimate, capabilities, today: context.today,
    subject: context.subject, readiness: context.readiness, preview: context.preview,
  }) : null;
  const previewUsable = bound && context?.preview?.state === "ready"
    && context.preview.snapshotHash === proposal.snapshotHash
    && context.preview.estimateId === proposal.estimate.id && context.preview.version === proposal.estimate.version
    && isValidElement(context.preview.content);
  const issues = [
    ...(!validMetadata ? [c.errors.metadata] : []),
    ...(!bound ? [c.errors.binding] : []),
    ...(context?.unsavedChanges ? [c.errors.unsaved] : []),
    ...(sharing?.issues ?? []), ...(sharing?.emailError ? [sharing.emailError] : []),
    ...(!previewUsable ? [c.previewBlocked] : []),
  ];
  const active = proposal.state === "pending" && !window.expired;
  return {
    visible: true, ...window, issues: [...new Set(issues)], previewUsable,
    canConfirm: active && validMetadata && bound && !issues.length && !!sharing?.request,
    canCancel: active && validMetadata && bound,
  };
}
