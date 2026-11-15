import { z } from 'zod';
import { reportSelectionSchema } from './assistant-query';
import { businessOverviewQuerySchema } from './business-overview';
import { leadReportQuerySchema } from './leads';
import { leadSourceQuerySchema } from './lead-source';
import { calendarReportQuerySchema } from './calendar-read';
import { jobReportQuerySchema } from './job-read';
import { teamReportQuerySchema } from './team-read';
import { estimateReportQuerySchema } from './estimate-read';
import { activityReportQuerySchema } from './activity';
import { financialReportQuerySchema } from './financial-read';
import { reportTemplateAreaSchema } from './template';
import { reportTemplatePeriodSchema } from './template-period';
import { businessOverviewReadResultSchema } from './business-overview-read';
import { leadReportReadResultSchema } from './lead-read';
import { leadSourceReadResultSchema } from './lead-source-read';
import { calendarReportReadResultSchema } from './calendar-read';
import { jobReportReadResultSchema } from './job-read';
import { teamReportReadResultSchema } from './team-read';
import { estimateReportReadResultSchema } from './estimate-read';
import { activityReportReadResultSchema } from './activity-read';
import { financialReportReadResultSchema } from './financial-read';

function modelQuery<T extends z.ZodRawShape>(schema: { shape: T }) {
  const { workspaceId, page, pageSize, ...shape } = schema.shape;
  void workspaceId; void page; void pageSize;
  return z.object(shape).strict();
}
const explicitSelection = z.discriminatedUnion('area', [
  z.object({ area: z.literal('overview'), query: modelQuery(businessOverviewQuerySchema) }).strict(),
  z.object({ area: z.literal('leads'), query: z.union(leadReportQuerySchema.options.map(option => modelQuery({ shape: option.shape }))) }).strict(),
  z.object({ area: z.literal('sources'), query: modelQuery(leadSourceQuerySchema) }).strict(),
  z.object({ area: z.literal('calendar'), query: z.union(calendarReportQuerySchema.options.map(option => modelQuery({ shape: option.shape }))) }).strict(),
  z.object({ area: z.literal('jobs'), query: z.union(jobReportQuerySchema.options.map(option => modelQuery({ shape: option.shape }))) }).strict(),
  z.object({ area: z.literal('team'), query: z.union(teamReportQuerySchema.options.map(option => modelQuery({ shape: option.shape }))) }).strict(),
  z.object({ area: z.literal('estimates'), query: z.union(estimateReportQuerySchema.options.map(option => modelQuery({ shape: option.shape }))) }).strict(),
  z.object({ area: z.literal('activity'), query: modelQuery(activityReportQuerySchema) }).strict(),
  z.object({ area: z.literal('financial'), query: modelQuery(financialReportQuerySchema) }).strict(),
]).superRefine((selection, context) => {
  const query = { ...selection.query, workspaceId: '00000000-0000-4000-8000-000000000001',
    ...(selection.area === 'overview' ? {} : { page: 1, pageSize: 25 }) };
  if (!reportSelectionSchema.safeParse({ area: selection.area, query }).success) {
    context.addIssue({ code: 'custom', message: 'Choose a supported native report query and period.' });
  }
});
const request = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('current_report') }).strict(),
  z.object({ mode: z.literal('query'), selection: explicitSelection }).strict(),
  z.object({
    mode: z.literal('default'),
    area: reportTemplateAreaSchema,
    period: reportTemplatePeriodSchema.nullable(),
  }).strict().superRefine((value, context) => {
    if (value.period?.preset !== undefined && value.period.preset !== 'custom' &&
      value.period.preset !== (value.area === 'calendar' ? 'next7days' : 'last30days')) {
      context.addIssue({ code: 'custom', message: 'The period preset is not supported by this report.' });
    }
    if (value.area === 'team' && value.period !== null) {
      context.addIssue({ code: 'custom', message: 'Team reports are current snapshots, not historical reports.' });
    }
  }),
]);

/** Strict model schemas represent optional properties as null; native queries use omission. */
function omitNullFields(value: unknown, schema: z.core.$ZodType): unknown {
  if (schema instanceof z.ZodDefault || schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return omitNullFields(value, schema.unwrap());
  }
  if (schema instanceof z.ZodUnion) {
    for (const option of schema.options) {
      const candidate = omitNullFields(value, option);
      if (z.safeParse(option, candidate).success) return candidate;
    }
    return value;
  }
  if (schema instanceof z.ZodObject && value && typeof value === 'object' && !Array.isArray(value)) {
    const shape: z.ZodRawShape = schema.shape;
    return Object.fromEntries(Object.entries(value)
      .filter(([key, item]) => !(item === null && shape[key] && z.safeParse(shape[key], undefined).success))
      .map(([key, item]) => [key, shape[key] ? omitNullFields(item, shape[key]) : item]));
  }
  return value;
}
const input = z.object({ request }).strict();
export const reportAssistantToolInputSchema = z.preprocess(value => omitNullFields(value, input), input);
export type ReportAssistantToolInput = z.infer<typeof reportAssistantToolInputSchema>;

type JsonSchema = z.core.JSONSchema.JSONSchema;
function strictModelSchema(value: JsonSchema | boolean): JsonSchema {
  if (typeof value === 'boolean') return value ? {} : { not: {} };
  const result = { ...value };
  if (Array.isArray(result.anyOf)) result.anyOf = result.anyOf.map(item => strictModelSchema(item));
  if (Array.isArray(result.oneOf)) { result.anyOf = result.oneOf.map(item => strictModelSchema(item)); delete result.oneOf; }
  if (result.items && typeof result.items === 'object' && !Array.isArray(result.items)) result.items = strictModelSchema(result.items);
  if (result.properties && typeof result.properties === 'object') {
    const required = new Set(Array.isArray(result.required) ? result.required : []);
    const properties = Object.fromEntries(Object.entries(result.properties).map(([key, item]) => {
      const property = strictModelSchema(item);
      return [key, required.has(key) ? property : { anyOf: [property, { type: 'null' as const }] }];
    }));
    result.properties = properties; result.required = Object.keys(properties); result.additionalProperties = false;
  }
  delete result.default;
  delete result.$schema;
  return result;
}
export const reportAssistantModelParameters: Record<string, unknown> = strictModelSchema(z.toJSONSchema(input, { io: 'input' }));

export const reportNativeReadSchema = z.discriminatedUnion('area', [
  z.object({ area: z.literal('overview'), read: businessOverviewReadResultSchema }).strict(),
  z.object({ area: z.literal('leads'), read: leadReportReadResultSchema }).strict(),
  z.object({ area: z.literal('sources'), read: leadSourceReadResultSchema }).strict(),
  z.object({ area: z.literal('calendar'), read: calendarReportReadResultSchema }).strict(),
  z.object({ area: z.literal('jobs'), read: jobReportReadResultSchema }).strict(),
  z.object({ area: z.literal('team'), read: teamReportReadResultSchema }).strict(),
  z.object({ area: z.literal('estimates'), read: estimateReportReadResultSchema }).strict(),
  z.object({ area: z.literal('activity'), read: activityReportReadResultSchema }).strict(),
  z.object({ area: z.literal('financial'), read: financialReportReadResultSchema }).strict(),
]);
export type ReportNativeRead = z.infer<typeof reportNativeReadSchema>;

export const reportAssistantReadLimits = { pageSize: 25, bytes: 60000, durationMs: 15000 } as const;
