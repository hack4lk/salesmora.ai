import { z } from "zod";
import { estimateStatusSchema } from "./estimate";
import { arrivalWindows, jobDateSchema } from "./job";

const estimateJobReferenceSchema = z.object({
  id: z.uuid(),
  number: z.string().trim().min(1).max(20),
  canOpen: z.boolean(),
}).strict();

const conversionJobFields = {
  customerId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  service: z.string().trim().max(200),
  location: z.string().trim().max(500),
  description: z.string().trim().max(4000),
  primaryOwnerId: z.string().trim().min(1).max(200).nullable(),
  teamUserIds: z.array(z.string().trim().min(1).max(200)).max(100)
    .refine((ids) => new Set(ids).size === ids.length),
  scheduledDate: jobDateSchema.nullable(),
  arrivalWindow: z.enum(arrivalWindows).nullable(),
  completionDeadline: jobDateSchema.nullable(),
};

export const estimateConversionJobSchema = z.object(conversionJobFields)
  .strict()
  .refine((job) => !job.arrivalWindow || !!job.scheduledDate, {
    message: "An arrival window requires a scheduled work date.",
    path: ["arrivalWindow"],
  });

export const estimateConversionCommandSchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  submissionId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  expectedLeadVersion: z.number().int().positive(),
  expectedCustomerVersion: z.number().int().positive(),
  snapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
  sourceLeadId: z.uuid(),
  job: estimateConversionJobSchema,
}).strict();
export type EstimateConversionCommand = z.infer<typeof estimateConversionCommandSchema>;

const estimateConversionRecordSchema = z.object({
  id: z.uuid(),
  number: z.string().trim().min(1).max(20),
  revision: z.number().int().positive(),
  version: z.number().int().positive(),
  name: z.string().max(120),
  status: estimateStatusSchema,
  archived: z.boolean(),
  parentType: z.enum(["lead", "job"]),
  parentId: z.uuid(),
  parentNumber: z.string().trim().min(1).max(20),
  snapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
  totalCents: z.number().int().nonnegative().nullable(),
  customerId: z.uuid().nullable(),
  sourceLeadVersion: z.number().int().positive().nullable(),
  sourceLeadArchived: z.boolean(),
  customerVersion: z.number().int().positive().nullable(),
  convertedJobExists: z.boolean(),
  sourceLeadHasJob: z.boolean(),
  service: z.string().max(200),
  scope: z.string().max(4000),
  serviceAddress: z.string().max(500),
  convertedJob: estimateJobReferenceSchema.nullable(),
}).strict();

const conversionCustomerSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("missing") }).strict(),
  z.object({ state: z.literal("unavailable") }).strict(),
  z.object({ state: z.literal("ready"), id: z.uuid(), name: z.string().max(200) }).strict(),
]);

export const estimateConversionReviewSchema = z.object({
  estimate: estimateConversionRecordSchema,
  capabilities: z.object({ read: z.boolean() }).strict(),
  canCreateJob: z.boolean(),
  canScheduleCreation: z.boolean(),
  canResolveCustomer: z.boolean(),
  customer: conversionCustomerSchema,
  review: z.object({
    estimateId: z.uuid(),
    expectedVersion: z.number().int().positive(),
    expectedLeadVersion: z.number().int().positive().nullable(),
    expectedCustomerVersion: z.number().int().positive().nullable(),
    snapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
    sourceLeadId: z.uuid(),
    job: z.object({
      customerId: z.string(),
      customerName: z.string(),
      title: z.string(),
      service: z.string(),
      location: z.string(),
      description: z.string(),
      primaryOwnerId: z.string().nullable(),
      teamUserIds: z.array(z.string()),
      scheduledDate: jobDateSchema.nullable(),
      arrivalWindow: z.enum(arrivalWindows).nullable(),
      completionDeadline: jobDateSchema.nullable(),
    }).strict(),
  }).strict(),
  members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(["owner", "admin", "office", "field"]),
  }).strict()),
  parentJob: estimateJobReferenceSchema.nullable(),
}).strict();
export type EstimateConversionReview = z.infer<typeof estimateConversionReviewSchema>;

export const estimateConversionReceiptSchema = z.object({
  estimateId: z.uuid(),
  version: z.number().int().positive(),
  job: z.object({
    id: z.uuid(),
    number: z.string().trim().min(1).max(20),
    href: z.string().regex(/^\/jobs\/[0-9a-f-]+\?workspace=[0-9a-f-]+$/),
  }).strict(),
}).strict();
export type EstimateConversionReceipt = z.infer<typeof estimateConversionReceiptSchema>;
