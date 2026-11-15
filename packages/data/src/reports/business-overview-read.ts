import type { Knex } from 'knex';
import { businessOverviewQuerySchema, businessOverviewReadResultSchema,
  type AuthorizationContext, type BusinessOverviewQuery, type BusinessOverviewReadResult } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { businessOverviewContext, readBusinessOverviewInTransaction } from './business-overview';

/** Exposes only authority already established by the native per-domain readers. */
export async function readBusinessOverviewWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: BusinessOverviewQuery,
): Promise<BusinessOverviewReadResult> {
  const query = businessOverviewQuerySchema.parse(rawQuery);
  const report = await readBusinessOverviewInTransaction(trx, context, query);
  return businessOverviewReadResultSchema.parse({
    workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision, query, report,
    authority: {
      reportScope: report.reportScope,
      lead: report.leads.kind === 'available' ? { scope: report.leads.scope, archives: report.leads.archiveVisibility } : null,
      job: report.jobs.kind === 'available' ? { scope: report.jobs.scope } : null,
      estimate: report.estimates.kind === 'available' ? { scope: report.estimates.scope, archives: report.estimates.archiveVisibility } : null,
      calendar: report.calendar.kind === 'available' ? report.calendar.scope : null,
    },
  });
}
export async function initialBusinessOverviewWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<BusinessOverviewReadResult> {
  const { clock } = await businessOverviewContext(trx, context);
  return readBusinessOverviewWithAuthorityInTransaction(trx, context, {
    workspaceId: context.workspaceId, view: 'business-overview',
    period: { from: addCalendarDays(clock.today, -29), to: clock.today },
  });
}
