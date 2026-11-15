import { z } from 'zod';
import { financialEstimatesQuerySchema, financialEstimatesResultSchema } from './financial-estimates';
import { financialMaterialsQuerySchema, financialMaterialsResultSchema } from './financial-materials';

export const financialReportQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('financial'),
  period: financialEstimatesQuerySchema.shape.period,
  selected: z.enum(['accepted', 'awaiting', 'materials']).default('accepted'),
  page: financialMaterialsQuerySchema.shape.page, pageSize: financialMaterialsQuerySchema.shape.pageSize,
}).strict();
export type FinancialReportQuery = z.infer<typeof financialReportQuerySchema>;

export function financialReportNativeQueries(query: FinancialReportQuery) {
  const estimate = (selected: 'accepted' | 'awaiting') => financialEstimatesQuerySchema.parse({
    workspaceId: query.workspaceId, view: 'financial-estimates', period: query.period, selected,
    filters: { owners: [], parents: [] }, page: query.selected === selected ? query.page : 1, pageSize: query.pageSize,
  });
  return {
    accepted: estimate('accepted'), awaiting: estimate('awaiting'),
    materials: financialMaterialsQuerySchema.parse({ workspaceId: query.workspaceId, view: 'financial-materials',
      filters: { statuses: [] }, selected: 'all', page: query.selected === 'materials' ? query.page : 1, pageSize: query.pageSize }),
  };
}
export const financialReportReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: z.string().trim().min(1).max(4000),
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  today: z.iso.date(), timezone: z.string().trim().min(1),
  authority: z.object({
    scope: z.enum(['workspace', 'assigned']), financial: z.literal(true),
    estimates: z.object({ scope: z.enum(['workspace', 'assigned_job']),
      archives: z.enum(['included', 'excluded']), money: z.literal(true) }).strict().nullable(),
    materials: z.object({ scope: z.enum(['workspace', 'assigned']), read: z.boolean(),
      costs: z.boolean(), jobLabels: z.boolean() }).strict(),
  }).strict(),
  exportAccess: z.object({ estimates: z.enum(['workspace', 'assigned']).nullable(),
    materials: z.object({ scope: z.enum(['workspace', 'assigned']),
      jobScope: z.enum(['workspace', 'assigned']).nullable() }).strict().nullable() }).strict(),
  query: financialReportQuerySchema,
  reports: z.object({ accepted: financialEstimatesResultSchema, awaiting: financialEstimatesResultSchema,
    materials: financialMaterialsResultSchema }).strict(),
}).strict().superRefine((result, context) => {
  const { query, reports, authority, exportAccess } = result, requests = financialReportNativeQueries(query);
  const accepted = reports.accepted.estimates, awaiting = reports.awaiting.estimates, materials = reports.materials;
  let valid = result.workspaceId === query.workspaceId && query.period.to <= result.today &&
    (exportAccess.estimates === null || authority.estimates !== null &&
      (authority.estimates.scope === 'workspace' || exportAccess.estimates === 'assigned')) &&
    (exportAccess.materials === null || authority.materials.read && authority.materials.costs &&
      (authority.materials.scope === 'workspace' || exportAccess.materials.scope === 'assigned') &&
      (exportAccess.materials.jobScope === null || authority.materials.jobLabels) &&
      (authority.scope !== 'assigned' || exportAccess.materials.jobScope !== 'workspace')) &&
    (authority.scope !== 'assigned' || (authority.estimates === null || authority.estimates.scope === 'assigned_job') &&
      authority.materials.scope === 'assigned') &&
    materials.workspaceId === result.workspaceId && materials.scope === authority.materials.scope &&
    materials.today === result.today && materials.timezone === result.timezone &&
    materials.selected === 'all' && materials.filters.statuses.length === 0 &&
    (materials.costs.kind === 'available') === authority.materials.costs &&
    (!authority.materials.costs || authority.materials.read) &&
    (authority.materials.jobLabels || materials.rows.every(row => row.jobLabel === null));
  const stamps = [materials.asOf];
  const pageMatches = (page: number, pageSize: number, total: number, request: { page: number; pageSize: number }) =>
    pageSize === request.pageSize && page === Math.min(request.page, Math.max(1, Math.ceil(total / request.pageSize)));
  valid &&= pageMatches(materials.page, materials.pageSize, materials.evidenceTotal, requests.materials);
  for (const kind of ['accepted', 'awaiting'] as const) {
    const section = reports[kind], native = section.estimates;
    valid &&= section.workspaceId === result.workspaceId && section.from === query.period.from &&
      section.to === query.period.to && section.selected === kind;
    if (native.kind !== 'unavailable') {
      valid &&= authority.estimates !== null && native.kind === kind &&
        native.report.scope === authority.estimates?.scope && native.report.timezone === result.timezone &&
        native.report.filters.owners.length === 0 && native.report.filters.parents.length === 0 &&
        pageMatches(native.report.page, native.report.pageSize, native.report.evidenceTotal, requests[kind]);
      stamps.push(native.report.asOf);
    }
  }
  valid &&= authority.estimates === null ? accepted.kind === 'unavailable' && awaiting.kind === 'unavailable'
    : accepted.kind === 'accepted' && awaiting.kind === 'awaiting' &&
      accepted.report.archiveVisibility === authority.estimates.archives && awaiting.report.today === result.today;
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: result.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    });
    valid &&= stamps.every(stamp => {
      const parts = formatter.formatToParts(new Date(stamp));
      return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === result.today;
    });
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Financial request, authority, native sections and clock do not match.' });
});
export type FinancialReportReadResult = z.infer<typeof financialReportReadResultSchema>;
