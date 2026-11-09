import { z } from 'zod';
import { businessOverviewQuerySchema, businessOverviewResultSchema } from './business-overview';
import { calendarScheduledResultSchema } from './calendar-scheduled';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
export const businessOverviewAuthoritySchema = z.object({
  reportScope: z.enum(['workspace', 'assigned']),
  lead: z.object({ scope: z.enum(['workspace', 'assigned']), archives: z.enum(['included', 'excluded']) }).strict().nullable(),
  job: z.object({ scope: z.enum(['workspace', 'assigned']) }).strict().nullable(),
  estimate: z.object({ scope: z.enum(['workspace', 'assigned_job']), archives: z.enum(['included', 'excluded']) }).strict().nullable(),
  calendar: calendarScheduledResultSchema.shape.scope.nullable(),
}).strict();
export type BusinessOverviewReadAuthority = z.infer<typeof businessOverviewAuthoritySchema>;
export const businessOverviewReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: text, policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  query: businessOverviewQuerySchema, report: businessOverviewResultSchema, authority: businessOverviewAuthoritySchema,
}).strict().superRefine((result, context) => {
  const { query, report, authority } = result;
  const valid = result.workspaceId === query.workspaceId && result.workspaceId === report.workspaceId &&
    query.period.from === report.from && query.period.to === report.to && authority.reportScope === report.reportScope &&
    (report.leads.kind === 'available' ? authority.lead?.scope === report.leads.scope && authority.lead.archives === report.leads.archiveVisibility : authority.lead === null) &&
    (report.jobs.kind === 'available' ? authority.job?.scope === report.jobs.scope : authority.job === null) &&
    (report.estimates.kind === 'available' ? authority.estimate?.scope === report.estimates.scope && authority.estimate.archives === report.estimates.archiveVisibility : authority.estimate === null) &&
    (report.calendar.kind === 'available' ? authority.calendar?.kind === report.calendar.scope.kind &&
      (report.calendar.scope.kind !== 'own' || authority.calendar.kind === 'own' &&
        authority.calendar.viewerId === report.calendar.scope.viewerId && authority.calendar.viewerId === result.viewerId) : authority.calendar === null);
  if (!valid) context.addIssue({ code: 'custom', message: 'Overview request, viewer and native domain authority do not match.' });
});
export type BusinessOverviewReadResult = z.infer<typeof businessOverviewReadResultSchema>;
