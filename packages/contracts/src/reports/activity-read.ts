import { z } from 'zod';
import { activityReportQuerySchema, activityReportResultSchema } from './activity';

export const activityReportReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: z.string().trim().min(1).max(4000),
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  authority: z.object({ scope: z.enum(['workspace', 'assigned']) }).strict(),
  exportScopes: z.array(z.object({ domain: z.enum(['lead', 'customer', 'job', 'estimate', 'work-order']),
    scope: z.enum(['workspace', 'assigned']) }).strict()).max(5),
  query: activityReportQuerySchema,
  report: activityReportResultSchema,
}).strict().superRefine((result, context) => {
  const { query, report } = result;
  let valid = result.workspaceId === query.workspaceId && result.workspaceId === report.workspaceId &&
    new Set(result.exportScopes.map(item => item.domain)).size === result.exportScopes.length &&
    result.exportScopes.every(item => report.includedDomains.some(read => read.domain === item.domain &&
      (read.scope === 'workspace' || item.scope === 'assigned'))) &&
    query.period.from === report.from && query.period.to === report.to &&
    JSON.stringify(query.filters) === JSON.stringify(report.filters) &&
    query.pageSize === report.pageSize &&
    report.page === Math.min(query.page, Math.max(1, Math.ceil(report.total / query.pageSize))) &&
    (result.authority.scope !== 'assigned' || report.includedDomains.every(item => item.scope === 'assigned')) &&
    report.omittedDomains.every(item => item.reason === 'permissions');
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: report.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(report.asOf));
    valid &&= ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === report.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Activity request, authority and native clock do not match.' });
});
export type ActivityReportReadResult = z.infer<typeof activityReportReadResultSchema>;
