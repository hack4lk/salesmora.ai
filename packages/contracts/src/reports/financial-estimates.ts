import { z } from 'zod';
import { estimateDecisionsQuerySchema, estimateDecisionsResultSchema } from './estimate-decisions';
import { estimateCurrentResultSchema } from './estimate-current';
import { estimateReportFiltersSchema } from './estimate-filters';

export const financialEstimatesQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('financial-estimates'),
  period: estimateDecisionsQuerySchema.shape.period, selected: z.enum(['accepted', 'awaiting']),
  filters: estimateReportFiltersSchema.default({ owners: [], parents: [] }),
  page: estimateDecisionsQuerySchema.shape.page, pageSize: estimateDecisionsQuerySchema.shape.pageSize,
}).strict();
export type FinancialEstimatesQuery = z.infer<typeof financialEstimatesQuerySchema>;
const unavailable = z.object({
  kind: z.literal('unavailable'), reason: z.literal('permissions'), explanation: z.string().trim().min(1),
}).strict();
export const financialEstimatesResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('financial-estimates'),
  from: financialEstimatesQuerySchema.shape.period.shape.from,
  to: financialEstimatesQuerySchema.shape.period.shape.to,
  selected: financialEstimatesQuerySchema.shape.selected,
  estimates: z.union([
    unavailable,
    z.object({ kind: z.literal('accepted'), report: estimateDecisionsResultSchema }).strict(),
    z.object({ kind: z.literal('awaiting'), report: estimateCurrentResultSchema }).strict(),
  ]),
}).strict().superRefine((result, context) => {
  const section = result.estimates;
  let valid = financialEstimatesQuerySchema.shape.period.safeParse({ from: result.from, to: result.to }).success;
  if (section.kind !== 'unavailable') {
    valid &&= section.kind === result.selected && section.report.workspaceId === result.workspaceId &&
      section.report.selected === section.kind;
    if (section.kind === 'accepted') valid &&= section.report.from === result.from && section.report.to === result.to;
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Financial Estimate selection and native evidence do not match.' });
});
export type FinancialEstimatesResult = z.infer<typeof financialEstimatesResultSchema>;
