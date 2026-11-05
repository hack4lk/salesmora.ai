import { z } from 'zod';
import { captureIdSchema } from './common';
import { captureSourceSummarySchema, captureSourceDetailSchema } from './commands';
import { captureInstallationSchema } from './installation';
import { capturePublicationReviewSchema } from './publication';
import { captureSourceListQuerySchema } from './common';

export const captureChatReadOperations = ['sources', 'source_details', 'source_summary', 'installation', 'publication_review'] as const;
export const captureChatQuerySchema = z.object({
  operation: z.enum(captureChatReadOperations), sourceId: captureIdSchema.nullable(),
  search: z.string().trim().max(200).nullable(), type: z.enum(['website', 'gmail']).nullable(),
  status: z.enum(['draft', 'active', 'paused', 'scheduled', 'archived']).nullable(),
  archived: z.boolean(), usePageFilters: z.boolean(), page: z.number().int().min(1).max(100000), limit: z.number().int().min(1).max(20),
}).strict().superRefine((value, context) => {
  if (value.operation !== 'sources' && (value.search !== null || value.type !== null || value.status !== null || value.archived || value.usePageFilters || value.page !== 1 || value.limit !== 1)) context.addIssue({ code: 'custom', message: 'Record reads accept only a source reference.' });
  if (value.operation === 'sources' && value.sourceId !== null) context.addIssue({ code: 'custom', message: 'List reads do not select a source.' });
});
const base = { id: captureIdSchema, workspaceId: captureIdSchema, retrievedAt: z.iso.datetime(), timezone: z.string().min(1).max(100) };
export const captureChatResultSchema = z.discriminatedUnion('operation', [
  z.object({ ...base, operation: z.literal('sources'), rows: z.array(captureSourceSummarySchema).max(20), total: z.number().int().nonnegative(), page: z.number().int().positive(), limit: z.number().int().min(1).max(20), filters: captureSourceListQuerySchema.omit({ workspaceId: true, page: true, pageSize: true }) }).strict(),
  z.object({ ...base, operation: z.literal('source_summary'), source: captureSourceSummarySchema }).strict(),
  z.object({ ...base, operation: z.literal('source_details'), detail: captureSourceDetailSchema, installation: captureInstallationSchema.nullable() }).strict(),
  z.object({ ...base, operation: z.literal('installation'), source: captureSourceSummarySchema, installation: captureInstallationSchema.nullable() }).strict(),
  z.object({ ...base, operation: z.literal('publication_review'), source: captureSourceSummarySchema, review: capturePublicationReviewSchema }).strict(),
]).superRefine((value, context) => {
  const sources = value.operation === 'sources' ? value.rows : [value.operation === 'source_details' ? value.detail.source : value.source];
  try { new Intl.DateTimeFormat('en', { timeZone: value.timezone }); } catch { context.addIssue({ code: 'custom', message: 'Invalid timezone.' }); }
  if (sources.some(source => source.workspaceId !== value.workspaceId) || new Set(sources.map(source => source.id)).size !== sources.length) context.addIssue({ code: 'custom', message: 'Invalid source scope.' });
  if (value.operation === 'sources' && (value.rows.length > value.limit || value.total < value.rows.length || value.rows.some(source => value.filters.archived ? source.status !== 'archived' : source.status === 'archived'))) context.addIssue({ code: 'custom', message: 'Invalid list window.' });
  if (value.operation === 'installation' && value.installation && (value.installation.id !== value.source.id || value.installation.version !== value.source.approvedVersion)) context.addIssue({ code: 'custom', message: 'Invalid installation binding.' });
  if (value.operation === 'publication_review' && (value.review.sourceId !== value.source.id || value.review.sourceVersion !== value.source.version || value.review.draftVersion !== value.source.draftVersion)) context.addIssue({ code: 'custom', message: 'Invalid review binding.' });
});
export const captureChatReferenceSchema = z.object({ workspaceId: captureIdSchema, turnId: captureIdSchema, resultId: captureIdSchema, snapshotHash: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const captureChatTicketSchema = captureChatReferenceSchema.extend({ operation: z.enum(captureChatReadOperations) }).strict();
export const captureChatSnapshotSchema = z.object({ result: captureChatResultSchema, query: captureChatQuerySchema, snapshotHash: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const captureChatOpenSchema = captureChatReferenceSchema.extend({ sourceId: captureIdSchema }).strict();
export type CaptureChatQuery = z.infer<typeof captureChatQuerySchema>;
export type CaptureChatResult = z.infer<typeof captureChatResultSchema>;
export type CaptureChatTicket = z.infer<typeof captureChatTicketSchema>;
export type CaptureChatSnapshot = z.infer<typeof captureChatSnapshotSchema>;
