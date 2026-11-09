import { z } from 'zod';
import { financialReportQuerySchema } from './financial-read';
import { estimateReportExportColumns, estimateReportExportInputSchema, type EstimateReportExportInput } from './estimate-export';

export const financialReportExportInputSchema = z.object({
  query: financialReportQuerySchema.omit({ page: true, pageSize: true }),
  dataset: z.enum(['summary', 'evidence']),
}).strict();
export type FinancialReportExportInput = z.infer<typeof financialReportExportInputSchema>;
export function financialEstimateExportInput(input: FinancialReportExportInput): EstimateReportExportInput {
  const { query, dataset } = input;
  if (query.selected === 'materials') throw new Error('Materials are not an Estimate export.');
  return estimateReportExportInputSchema.parse({ dataset, query: query.selected === 'accepted'
    ? { workspaceId: query.workspaceId, view: 'estimate-decisions', selected: 'accepted', period: query.period,
      filters: { owners: [], parents: [] } }
    : { workspaceId: query.workspaceId, view: 'estimate-current', selected: 'awaiting',
      filters: { owners: [], parents: [] } } });
}
export function financialReportExportColumns(input: FinancialReportExportInput): string[] {
  if (input.query.selected !== 'materials') {
    const columns = estimateReportExportColumns(financialEstimateExportInput(input));
    const selected = input.dataset === 'evidence' ? columns
      : input.query.selected === 'accepted' ? columns.filter((_, index) => index !== 11)
        : columns.filter((_, index) => ![11, 12, 13].includes(index));
    return ['financial_section', ...selected];
  }
  const common = ['financial_section', 'snapshot_at_utc', 'workspace_timezone', 'scope', 'coverage'];
  return [...common, ...(input.dataset === 'summary'
    ? ['line_count', 'known_cost_lines', 'missing_cost_lines', 'known_cost_cents']
    : ['material_id', 'work_order_id', 'work_order_label', 'job_label', 'work_order_status', 'item_label',
      'quantity', 'unit', 'material_status', 'unit_cost_cents', 'line_cost_cents', 'changed_after_issue'])];
}
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const metadata = {
  workspaceId: z.uuid(), policyRevision: count, asOf: z.iso.datetime(), today: z.iso.date(), timezone: text.max(100),
  section: z.enum(['accepted', 'awaiting', 'materials']), scope: z.enum(['workspace', 'assigned']),
  jobScope: z.enum(['workspace', 'assigned']).nullable(), archiveVisibility: z.enum(['included', 'excluded']), count,
  limits: z.object({ rows: count.refine(value => value > 0), bytes: count.refine(value => value > 0),
    durationMs: count.refine(value => value > 0) }).strict(),
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
export const financialReportExportPreviewSchema = z.object({
  ...metadata, input: financialReportExportInputSchema, viewerId: text, columns: z.array(text).min(1), coverage: text,
}).strict().superRefine((preview, context) => {
  if (!validClock(preview) || preview.workspaceId !== preview.input.query.workspaceId ||
    preview.section !== preview.input.query.selected || preview.input.query.period.to > preview.today ||
    (preview.section !== 'accepted' && preview.archiveVisibility !== 'excluded') ||
    preview.section !== 'materials' && preview.jobScope !== null ||
    JSON.stringify(preview.columns) !== JSON.stringify(financialReportExportColumns(preview.input)) ||
    preview.input.dataset === 'summary' && preview.count !== 1) {
    context.addIssue({ code: 'custom', message: 'Financial CSV input, section, scope, columns or clock do not match.' });
  }
});
export type FinancialReportExportPreview = z.infer<typeof financialReportExportPreviewSchema>;
export const financialReportExportGenerationSchema = z.object({ ...metadata, id: z.uuid() }).strict().superRefine((value, context) => {
  if (!validClock(value) || value.count > value.limits.rows ||
    value.section !== 'accepted' && value.archiveVisibility !== 'excluded' ||
    value.section !== 'materials' && value.jobScope !== null) {
    context.addIssue({ code: 'custom', message: 'Financial CSV section, clock or limits do not match.' });
  }
});
