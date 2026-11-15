import { z } from 'zod';
import { businessOverviewQuerySchema } from './business-overview';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
export const businessOverviewExportInputSchema = z.object({
  query: businessOverviewQuerySchema, dataset: z.literal('summary'),
}).strict();
export type BusinessOverviewExportInput = z.infer<typeof businessOverviewExportInputSchema>;
export const businessOverviewExportScopesSchema = z.object({
  lead: z.object({ scope: z.enum(['workspace', 'assigned']), archives: z.enum(['included', 'excluded']) }).strict().nullable(),
  job: z.enum(['workspace', 'assigned']).nullable(),
  estimate: z.object({ scope: z.enum(['workspace', 'assigned_job']), archives: z.enum(['included', 'excluded']) }).strict().nullable(),
  calendar: z.object({
    scope: z.enum(['workspace', 'own']),
    jobs: z.enum(['workspace', 'assigned']).nullable(),
    workOrders: z.enum(['workspace', 'assigned_job']).nullable(),
  }).strict().nullable(),
}).strict().refine(value => value.calendar === null || value.calendar.jobs !== null || value.calendar.workOrders !== null);
export const businessOverviewExportColumns = [
  'section', 'metric', 'value', 'status', 'date_basis', 'from', 'to', 'snapshot_at_utc',
  'timezone', 'scope', 'coverage',
];
const metadata = {
  workspaceId: z.uuid(), policyRevision: count, asOf: z.iso.datetime(), today: z.iso.date(), timezone: text.max(200),
  scopes: businessOverviewExportScopesSchema, count,
  limits: z.object({ rows: count.refine(n => n > 0), bytes: count.refine(n => n > 0),
    durationMs: count.refine(n => n > 0) }).strict(),
};
function validClock(value: { asOf: string; today: string; timezone: string }) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: value.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(value.asOf));
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === value.today;
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return false;
  }
}
export const businessOverviewExportPreviewSchema = z.object({
  ...metadata, input: businessOverviewExportInputSchema, viewerId: text, columns: z.array(text), coverage: text,
}).strict().superRefine((value, context) => {
  if (!validClock(value) || value.workspaceId !== value.input.query.workspaceId ||
    value.input.query.period.to > value.today || JSON.stringify(value.columns) !== JSON.stringify(businessOverviewExportColumns) ||
    !Object.values(value.scopes).some(Boolean) || value.count < 4) {
    context.addIssue({ code: 'custom', message: 'Overview export input, scope, columns or clock do not match.' });
  }
});
export type BusinessOverviewExportPreview = z.infer<typeof businessOverviewExportPreviewSchema>;
export const businessOverviewExportGenerationSchema = z.object({ ...metadata, id: z.uuid() }).strict().superRefine((value, context) => {
  if (!validClock(value) || value.count > value.limits.rows || value.count < 4 || !Object.values(value.scopes).some(Boolean)) {
    context.addIssue({ code: 'custom', message: 'Overview export scope, clock or limits do not match.' });
  }
});
