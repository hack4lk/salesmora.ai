import { z } from 'zod';
import { businessOverviewQuerySchema } from './business-overview';
import { leadReportQuerySchema } from './leads';
import { leadSourceQuerySchema } from './lead-source';
import { calendarReportQuerySchema } from './calendar-read';
import { jobReportQuerySchema } from './job-read';
import { teamReportQuerySchema } from './team-read';
import { estimateReportQuerySchema } from './estimate-read';
import { activityReportQuerySchema } from './activity';
import { financialReportQuerySchema } from './financial-read';
import { reportTemplatePeriodSchema } from './template-period';
import { reportAssistantResultSchema } from './assistant-result';

/** Native read intent only. Scope, identity and authorization are never supplied by the model. */
export const reportSelectionSchema = z.discriminatedUnion('area', [
  z.object({ area: z.literal('overview'), query: businessOverviewQuerySchema }).strict(),
  z.object({ area: z.literal('leads'), query: leadReportQuerySchema }).strict(),
  z.object({ area: z.literal('sources'), query: leadSourceQuerySchema }).strict(),
  z.object({ area: z.literal('calendar'), query: calendarReportQuerySchema }).strict(),
  z.object({ area: z.literal('jobs'), query: jobReportQuerySchema }).strict(),
  z.object({ area: z.literal('team'), query: teamReportQuerySchema }).strict(),
  z.object({ area: z.literal('estimates'), query: estimateReportQuerySchema }).strict(),
  z.object({ area: z.literal('activity'), query: activityReportQuerySchema }).strict(),
  z.object({ area: z.literal('financial'), query: financialReportQuerySchema }).strict(),
]).superRefine(({ query }, context) => {
  if ('period' in query) {
    const days = (Date.parse(`${query.period.to}T12:00:00Z`) - Date.parse(`${query.period.from}T12:00:00Z`)) / 86400000;
    if (days < 0 || days >= 366) context.addIssue({ code: 'custom', message: 'Report periods must contain 1 to 366 calendar dates.' });
  }
});
export type ReportSelection = z.infer<typeof reportSelectionSchema>;

/** Browser-applied configuration, not trusted evidence or proof that the caller may read it. */
export const reportAssistantContextSchema = z.object({
  selection: reportSelectionSchema,
  period: reportTemplatePeriodSchema.nullable(),
}).strict().superRefine(({ selection, period }, context) => {
  const query = selection.query;
  const dated = 'period' in query;
  if (dated !== (period !== null) ||
    period && period.preset !== 'custom' && period.preset !== (selection.area === 'calendar' ? 'next7days' : 'last30days') ||
    dated && period?.preset === 'custom' && (period.from !== query.period.from || period.to !== query.period.to)) {
    context.addIssue({ code: 'custom', message: 'Applied report period does not match the native query.' });
  }
});
export type ReportAssistantContext = z.infer<typeof reportAssistantContextSchema>;

/** Immutable query binding for subsequent server evidence storage; parsing does not authorize a read. */
export const reportAssistantSnapshotSchema = z.object({
  selection: reportSelectionSchema,
  result: reportAssistantResultSchema,
}).strict().superRefine(({ selection, result }, context) => {
  const period = 'period' in selection.query ? selection.query.period : null;
  if (selection.area !== result.area || period?.from !== result.period?.from || period?.to !== result.period?.to) {
    context.addIssue({ code: 'custom', message: 'Report result does not match its area and applied period.' });
  }
});
export type ReportAssistantSnapshot = z.infer<typeof reportAssistantSnapshotSchema>;
