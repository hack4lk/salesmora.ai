import 'server-only';
import { readLeadReportWithAuthorityInTransaction, readLeadSourceReportWithAuthorityInTransaction,
  initialLeadSourceReportWithAuthorityInTransaction, readBusinessOverviewWithAuthorityInTransaction,
  initialBusinessOverviewWithAuthorityInTransaction, readCalendarReportWithAuthorityInTransaction,
  initialCalendarReportWithAuthorityInTransaction, readJobReportWithAuthorityInTransaction,
  initialJobReportWithAuthorityInTransaction, readTeamReportWithAuthorityInTransaction,
  initialTeamReportWithAuthorityInTransaction, readEstimateReportWithAuthorityInTransaction,
  initialEstimateReportWithAuthorityInTransaction, readActivityReportWithAuthorityInTransaction,
  initialActivityReportWithAuthorityInTransaction, readFinancialReportWithAuthorityInTransaction,
  initialFinancialReportWithAuthorityInTransaction } from '@salesmora/data';
import { leadReportQuerySchema, leadSourceQuerySchema, businessOverviewQuerySchema,
  calendarReportQuerySchema, jobReportQuerySchema, type LeadReportQuery, type LeadSourceQuery,
  type BusinessOverviewQuery, type CalendarReportQuery, type JobReportQuery,
  teamReportQuerySchema, type TeamReportQuery, estimateReportQuerySchema, type EstimateReportQuery,
  activityReportQuerySchema, type ActivityReportQuery, financialReportQuerySchema, type FinancialReportQuery } from '@salesmora/contracts';
import { authorizedWorkspace } from '../authorization/permissions';
import { addCalendarDays } from '@salesmora/domain';

/** Uses the implemented permission surface unchanged: Reports stays denied until separately activated. */
export async function workspaceLeadReport(userId: string, rawQuery: LeadReportQuery) {
  const query = leadReportQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readLeadReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceLeadReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, async (trx, context) => {
    const filters = { stages: [], owners: [], sources: [] };
    const current = await readLeadReportWithAuthorityInTransaction(trx, context, {
      workspaceId, view: 'pipeline', selection: { kind: 'pipeline' }, filters, page: 1, pageSize: 25,
    });
    const today = current.report.today;
    return readLeadReportWithAuthorityInTransaction(trx, context, {
      workspaceId, view: 'intake', period: { from: addCalendarDays(today, -29), to: today },
      filters, currentFilters: filters, page: 1, pageSize: 25,
    });
  });
}
export async function workspaceLeadSourceReport(userId: string, rawQuery: LeadSourceQuery) {
  const query = leadSourceQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readLeadSourceReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceLeadSourceReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialLeadSourceReportWithAuthorityInTransaction);
}
export async function workspaceBusinessOverview(userId: string, rawQuery: BusinessOverviewQuery) {
  const query = businessOverviewQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readBusinessOverviewWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceBusinessOverview(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialBusinessOverviewWithAuthorityInTransaction);
}
export async function workspaceCalendarReport(userId: string, rawQuery: CalendarReportQuery) {
  const query = calendarReportQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readCalendarReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceCalendarReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialCalendarReportWithAuthorityInTransaction);
}
export async function workspaceJobReport(userId: string, rawQuery: JobReportQuery) {
  const query = jobReportQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readJobReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceJobReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialJobReportWithAuthorityInTransaction);
}
export async function workspaceTeamReport(userId: string, rawQuery: TeamReportQuery) {
  const query = teamReportQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readTeamReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceTeamReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialTeamReportWithAuthorityInTransaction);
}
export async function workspaceEstimateReport(userId: string, rawQuery: EstimateReportQuery) {
  const query = estimateReportQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readEstimateReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceEstimateReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialEstimateReportWithAuthorityInTransaction);
}
export async function workspaceActivityReport(userId: string, rawQuery: ActivityReportQuery) {
  const query = activityReportQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readActivityReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceActivityReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialActivityReportWithAuthorityInTransaction);
}
export async function workspaceFinancialReport(userId: string, rawQuery: FinancialReportQuery) {
  const query = financialReportQuerySchema.parse(rawQuery);
  return authorizedWorkspace(userId, query.workspaceId, false,
    (trx, context) => readFinancialReportWithAuthorityInTransaction(trx, context, query));
}
export async function initialWorkspaceFinancialReport(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, initialFinancialReportWithAuthorityInTransaction);
}
