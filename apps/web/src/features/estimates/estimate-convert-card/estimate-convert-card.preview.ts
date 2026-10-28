import { reviewAssistantProposalWindow } from "@salesmora/ui";
import {
  estimateConversionJobHref, getEstimateConversionIssues, initialEstimateConversionReview,
  type EstimateConversionCustomer, type EstimateConversionRecord,
} from "../estimate-convert-dialog/estimate-convert-dialog.preview";
import { estimateConvertDialogData as dialog } from "../estimate-convert-dialog/estimate-convert-dialog.data";
import { estimateConvertCardData as c } from "./estimate-convert-card.data";
import type { EstimateConvertCardProps, EstimateConvertCardRequest, EstimateConvertProposal } from "./estimate-convert-card.types";

function recordIdentity(record: EstimateConversionRecord) {
  return {
    id: record.id, version: record.version, number: record.number, revision: record.revision, name: record.name,
    status: record.status, archived: record.archived, parentType: record.parentType, parentId: record.parentId,
    parentNumber: record.parentNumber, snapshotHash: record.snapshotHash, totalCents: record.totalCents,
    customerId: record.customerId, sourceLeadVersion: record.sourceLeadVersion,
    sourceLeadArchived: record.sourceLeadArchived, customerVersion: record.customerVersion,
    convertedJobExists: record.convertedJobExists, sourceLeadHasJob: record.sourceLeadHasJob,
    service: record.service, scope: record.scope, serviceAddress: record.serviceAddress,
    convertedJob: record.convertedJob && { id: record.convertedJob.id, number: record.convertedJob.number, canOpen: record.convertedJob.canOpen },
  };
}
function customerIdentity(customer: EstimateConversionCustomer) {
  return customer.state === "ready" ? { state: customer.state, id: customer.id, name: customer.name } : { state: customer.state };
}
export function estimateConvertCardRequest(proposal: EstimateConvertProposal): EstimateConvertCardRequest {
  return {
    proposalId: proposal.id, actionType: proposal.actionType, inputHash: proposal.inputHash,
    authorizationVersion: proposal.authorizationVersion, estimateId: proposal.estimate.id,
    expectedVersion: proposal.estimate.version, snapshotHash: proposal.estimate.snapshotHash, sourceLeadId: proposal.estimate.parentId,
  };
}

/** Opening the existing form is not confirmation of its job creation request. */
export function reviewEstimateConvertCard({ proposal, context, capabilities, parentAccess, canCreateJob }: EstimateConvertCardProps, now: number) {
  const window = reviewAssistantProposalWindow(proposal.createdAt, proposal.expiresAt, now);
  if (!capabilities.read || !parentAccess || proposal.state === "forbidden" || context?.customer.state === "unavailable") {
    return { ...window, visible: false, issues: [c.unavailable], canReview: false, canCancel: false, existingJob: null };
  }
  const validMetadata = window.valid && !!proposal.id.trim() && !!proposal.authorizationVersion.trim()
    && /^[a-f0-9]{64}$/.test(proposal.inputHash) && /^[a-f0-9]{64}$/.test(proposal.estimate.snapshotHash)
    && !!proposal.estimate.id.trim() && Number.isSafeInteger(proposal.estimate.version) && proposal.estimate.version > 0;
  const bound = !!context && proposal.id === context.proposalId && proposal.inputHash === context.inputHash
    && proposal.authorizationVersion === context.authorizationVersion
    && JSON.stringify(recordIdentity(proposal.estimate)) === JSON.stringify(recordIdentity(context.estimate))
    && JSON.stringify(customerIdentity(proposal.customer)) === JSON.stringify(customerIdentity(context.customer));
  const conversionIssues = context ? getEstimateConversionIssues({
    estimate: context.estimate, customer: context.customer, capabilities, canCreateJob,
    canScheduleCreation: false, members: [], review: initialEstimateConversionReview(context.estimate, context.customer),
  }) : [];
  if (context?.customer.state === "missing" && context.estimate.customerId !== null) conversionIssues.push(dialog.errors.customerMismatch);
  const issues = [...new Set([
    ...(!validMetadata ? [c.errors.metadata] : []), ...(!bound ? [c.errors.binding] : []), ...conversionIssues,
  ])];
  const active = proposal.state === "pending" && !window.expired;
  const job = context?.estimate.convertedJob ?? (context?.estimate.parentType === "job"
    && context.parentJob?.id === context.estimate.parentId ? context.parentJob : null);
  const href = job ? estimateConversionJobHref(job) : null;
  return {
    ...window, visible: true, issues,
    canReview: active && validMetadata && bound && issues.every((issue) => issue === dialog.customerMissing),
    canCancel: active && validMetadata && bound,
    existingJob: bound && job && href ? { number: job.number, href } : null,
  };
}
