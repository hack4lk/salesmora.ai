import { createJobSchema, jobIdSchema, type JobMember } from "@salesmora/contracts";
import { getEstimateStatusActions } from "../estimate-actions";
import type { EstimateCapabilities, EstimateRow } from "../estimate-preview.types";
import { isEstimateLocalDate } from "../estimate-timestamp";
import type { JobCreateValues } from "../../jobs/job-create-dialog/job-create-dialog";
import { estimateConvertDialogData as c } from "./estimate-convert-dialog.data";

export type EstimateConversionJobRef = { id: string; number: string; canOpen: boolean };
export type EstimateConversionRecord = Pick<EstimateRow, "id" | "number" | "revision" | "version" | "name" | "status" | "archived" | "parentType" | "parentId" | "parentNumber"> & {
  snapshotHash: string; totalCents: number | null; customerId: string | null;
  sourceLeadVersion: number | null; sourceLeadArchived: boolean; customerVersion: number | null;
  convertedJobExists: boolean; sourceLeadHasJob: boolean;
  service: string; scope: string; serviceAddress: string;
  convertedJob: EstimateConversionJobRef | null;
};
export type EstimateConversionCustomer =
  | { state: "missing" }
  | { state: "unavailable" }
  | { state: "ready"; id: string; name: string };
export type EstimateConversionReview = {
  estimateId: string; expectedVersion: number; expectedLeadVersion: number | null;
  expectedCustomerVersion: number | null; snapshotHash: string; sourceLeadId: string;
  job: JobCreateValues;
};
export type EstimateConversionInput = {
  estimate: EstimateConversionRecord;
  capabilities: EstimateCapabilities;
  canCreateJob: boolean;
  canScheduleCreation: boolean;
  customer: EstimateConversionCustomer;
  review: EstimateConversionReview;
  members: JobMember[];
};
export type EstimateConversionRequest = {
  estimateId: string; expectedVersion: number; expectedLeadVersion: number;
  expectedCustomerVersion: number; snapshotHash: string; sourceLeadId: string;
  job: Pick<JobCreateValues, "customerId" | "title" | "service" | "location" | "description" | "primaryOwnerId" | "teamUserIds" | "scheduledDate" | "arrivalWindow" | "completionDeadline">;
};

export function initialEstimateConversionReview(
  estimate: EstimateConversionRecord, customer: EstimateConversionCustomer,
): EstimateConversionReview {
  return {
    estimateId: estimate.id, expectedVersion: estimate.version,
    expectedLeadVersion: estimate.sourceLeadVersion,
    expectedCustomerVersion: estimate.customerVersion,
    snapshotHash: estimate.snapshotHash, sourceLeadId: estimate.parentId,
    job: {
      customerId: customer.state === "ready" ? customer.id : "", customerName: customer.state === "ready" ? customer.name : "",
      title: estimate.name, service: estimate.service, location: estimate.serviceAddress, description: estimate.scope,
      primaryOwnerId: null, teamUserIds: [], scheduledDate: null, arrivalWindow: null, completionDeadline: null,
    },
  };
}
export function isEstimateConversionReviewCurrent({ estimate, review }: Pick<EstimateConversionInput, "estimate" | "review">): boolean {
  return review.estimateId === estimate.id && review.expectedVersion === estimate.version
    && review.expectedLeadVersion === estimate.sourceLeadVersion
    && review.expectedCustomerVersion === estimate.customerVersion
    && review.snapshotHash === estimate.snapshotHash && !!review.snapshotHash.trim() && review.sourceLeadId === estimate.parentId;
}
export function estimateConversionJobHref(job: EstimateConversionJobRef): string | null {
  return job.canOpen && jobIdSchema.safeParse(job.id).success && job.number.trim() ? `/jobs/${job.id}` : null;
}
export function getEstimateConversionIssues(input: EstimateConversionInput): string[] {
  const { estimate, capabilities, canCreateJob, customer } = input;
  if (!capabilities.read) return [c.errors.read];
  const issues: string[] = [];
  if (!canCreateJob) issues.push(c.errors.create);
  if (estimate.status !== "accepted") issues.push(c.errors.status);
  if (estimate.archived) issues.push(c.errors.archived);
  if (estimate.parentType !== "lead") issues.push(c.parentJob);
  if (estimate.convertedJobExists || estimate.convertedJob) issues.push(c.converted);
  if (estimate.sourceLeadHasJob && !estimate.convertedJobExists) issues.push(c.errors.leadHasJob);
  if (estimate.sourceLeadArchived) issues.push(c.errors.leadArchived);
  if (!estimate.id.trim() || !estimate.number.trim() || !estimate.name.trim() || estimate.name.length > 120
    || !createJobSchema.shape.sourceLeadId.safeParse(estimate.parentId).success || !estimate.parentNumber.trim() || !estimate.snapshotHash.trim()
    || !Number.isSafeInteger(estimate.revision) || estimate.revision < 1 || !Number.isSafeInteger(estimate.version) || estimate.version < 1
    || (estimate.parentType === "lead" && (!Number.isSafeInteger(estimate.sourceLeadVersion) || (estimate.sourceLeadVersion ?? 0) < 1))) {
    issues.push(c.errors.record);
  }
  if (estimate.totalCents === null || !Number.isSafeInteger(estimate.totalCents) || estimate.totalCents < 0) issues.push(c.errors.total);
  if (!isEstimateConversionReviewCurrent(input)) issues.push(c.errors.binding);
  if (customer.state === "missing") issues.push(c.customerMissing);
  else if (customer.state === "unavailable") issues.push(c.errors.customerAccess);
  else if (!createJobSchema.shape.customerId.safeParse(customer.id).success || !customer.name.trim()
    || !Number.isSafeInteger(estimate.customerVersion) || (estimate.customerVersion ?? 0) < 1
    || estimate.customerId !== customer.id) issues.push(c.errors.customerMismatch);
  return issues;
}

/** Reuses Jobs' field contracts; authorization, idempotency and conversion linkage remain server-owned. */
export function reviewEstimateConversion(input: EstimateConversionInput, job: JobCreateValues = input.review.job): {
  issues: string[]; request: EstimateConversionRequest | null;
} {
  const issues = getEstimateConversionIssues(input);
  if (!input.capabilities.read) return { issues, request: null };
  if (input.customer.state !== "ready" || job.customerId !== input.customer.id || job.newCustomer || job.allowDuplicate) {
    if (!issues.includes(c.customerMissing) && !issues.includes(c.errors.customerAccess)) issues.push(c.errors.customerMismatch);
  }
  const shape = createJobSchema.shape;
  if (!shape.title.safeParse(job.title).success) issues.push(c.errors.title);
  if (!shape.service.safeParse(job.service).success) issues.push(c.errors.service);
  if (!shape.location.safeParse(job.location).success) issues.push(c.errors.location);
  if (!shape.description.safeParse(job.description).success) issues.push(c.errors.description);
  if (!shape.primaryOwnerId.safeParse(job.primaryOwnerId).success || !shape.teamUserIds.safeParse(job.teamUserIds).success
    || (job.primaryOwnerId !== null && !input.members.some((member) => member.id === job.primaryOwnerId))
    || job.teamUserIds.some((id) => id === job.primaryOwnerId || !input.members.some((member) => member.id === id))) issues.push(c.errors.members);
  if ((job.scheduledDate !== null && !isEstimateLocalDate(job.scheduledDate))
    || (job.completionDeadline !== null && !isEstimateLocalDate(job.completionDeadline))
    || !shape.arrivalWindow.safeParse(job.arrivalWindow).success || (job.arrivalWindow && !job.scheduledDate)) issues.push(c.errors.dates);
  if (!input.canScheduleCreation && (job.scheduledDate || job.arrivalWindow || job.completionDeadline)) issues.push(c.errors.schedule);
  if (issues.length || input.review.expectedLeadVersion === null || input.review.expectedCustomerVersion === null ||
    !getEstimateStatusActions({
    ...input.estimate, capabilities: input.capabilities, canConvertToJob: input.canCreateJob,
    hasConvertedJob: input.estimate.convertedJobExists,
  }).includes("convert")) return { issues, request: null };
  return {
    issues: [], request: {
      estimateId: input.estimate.id, expectedVersion: input.review.expectedVersion,
      expectedLeadVersion: input.review.expectedLeadVersion,
      expectedCustomerVersion: input.review.expectedCustomerVersion,
      snapshotHash: input.review.snapshotHash,
      sourceLeadId: input.review.sourceLeadId,
      job: {
        customerId: job.customerId, title: job.title.trim(), service: job.service.trim(), location: job.location.trim(),
        description: job.description.trim(), primaryOwnerId: job.primaryOwnerId, teamUserIds: [...job.teamUserIds],
        scheduledDate: job.scheduledDate, arrivalWindow: job.arrivalWindow, completionDeadline: job.completionDeadline,
      },
    },
  };
}
