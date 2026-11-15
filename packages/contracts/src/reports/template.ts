import { z } from 'zod';
import { reportTemplatePeriodSchema } from './template-period';
import { leadReportQuerySchema } from './leads';
import { leadSourceQuerySchema } from './lead-source';
import { businessOverviewQuerySchema } from './business-overview';
import { calendarReportQuerySchema } from './calendar-read';
import { jobReportQuerySchema } from './job-read';
import { teamReportQuerySchema } from './team-read';
import { estimateReportQuerySchema } from './estimate-read';
import { activityReportQuerySchema } from './activity';
import { financialReportQuerySchema } from './financial-read';

export const reportTemplateAreas = ['overview', 'leads', 'sources', 'calendar', 'jobs', 'team', 'estimates', 'activity', 'financial'] as const;
export const reportTemplateAreaSchema = z.enum(reportTemplateAreas);
export type ReportTemplateArea = z.infer<typeof reportTemplateAreaSchema>;
export const reportTemplateNameSchema = z.string().trim().min(1).max(80)
  .refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const querySchemas = {
  overview: businessOverviewQuerySchema, leads: leadReportQuerySchema, sources: leadSourceQuerySchema,
  calendar: calendarReportQuerySchema, jobs: jobReportQuerySchema, team: teamReportQuerySchema,
  estimates: estimateReportQuerySchema, activity: activityReportQuerySchema, financial: financialReportQuerySchema,
};
const dummyWorkspace = '00000000-0000-4000-8000-000000000001';
const dummyPeriod = { from: '2026-01-01', to: '2026-01-01' };
const currentViews = new Set(['pipeline', 'age', 'attention', 'workload', 'team-leads', 'team-jobs',
  'estimate-current', 'calendar-unscheduled']);
export const reportTemplateConfigurationSchema = z.object({
  area: reportTemplateAreaSchema,
  query: z.record(z.string(), z.unknown()),
  period: reportTemplatePeriodSchema.nullable(),
}).strict().superRefine((value, context) => {
  const { query, area, period } = value;
  const view = query.view;
  const hasPeriod = typeof view === 'string' && !currentViews.has(view);
  const forbidden = ['workspaceId', 'page', 'pageSize', 'period'].some(key => Object.hasOwn(query, key));
  const validPreset = !period || period.preset === 'custom' ||
    (area === 'calendar' ? period.preset === 'next7days' : period.preset === 'last30days');
  const relativeDay = period && period.preset !== 'custom' &&
    (query.trendBucket !== undefined || query.selectedDate !== undefined);
  const parsed = querySchemas[area].safeParse({
    ...query, workspaceId: dummyWorkspace,
    ...(area === 'overview' ? {} : { page: 1, pageSize: 25 }),
    ...(hasPeriod ? { period: period?.preset === 'custom' ? { from: period.from, to: period.to } : dummyPeriod } : {}),
  });
  if (forbidden || !validPreset || !!period !== hasPeriod || relativeDay || !parsed.success) {
    context.addIssue({ code: 'custom', message: 'Invalid report template configuration or date choice.' });
  }
});
export type ReportTemplateConfiguration = z.infer<typeof reportTemplateConfigurationSchema>;
export const reportTemplateSchema = z.object({
  id: z.uuid(), workspaceId: z.uuid(), area: reportTemplateAreaSchema, name: reportTemplateNameSchema,
  configuration: reportTemplateConfigurationSchema, version: z.number().int().positive().refine(Number.isSafeInteger),
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
}).strict().refine(value => value.area === value.configuration.area);
export type ReportTemplate = z.infer<typeof reportTemplateSchema>;
export const reportTemplateCreateSchema = z.object({
  workspaceId: z.uuid(), name: reportTemplateNameSchema, configuration: reportTemplateConfigurationSchema,
}).strict();
export const reportTemplateUpdateSchema = z.object({
  workspaceId: z.uuid(), version: z.number().int().positive().refine(Number.isSafeInteger),
  name: reportTemplateNameSchema.optional(), configuration: reportTemplateConfigurationSchema.optional(),
}).strict().refine(value => value.name !== undefined || value.configuration !== undefined);
export const reportTemplateDeleteSchema = z.object({
  workspaceId: z.uuid(), version: z.number().int().positive().refine(Number.isSafeInteger),
}).strict();
export const reportTemplateIdSchema = z.uuid();
export const reportTemplateRunInputSchema = z.object({ workspaceId: z.uuid() }).strict();
export const reportTemplateListSchema = z.array(reportTemplateSchema);
export const reportTemplateRunResultSchema = z.object({ template: reportTemplateSchema, result: z.unknown() }).strict();
