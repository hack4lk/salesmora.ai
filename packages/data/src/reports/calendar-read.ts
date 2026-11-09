import type { Knex } from 'knex';
import { calendarReportQuerySchema, calendarReportReadResultSchema,
  type AuthorizationContext, type CalendarReportQuery, type CalendarReportReadResult } from '@salesmora/contracts';
import { addCalendarDays, calendarWeekStart } from '@salesmora/domain';
import { calendarReportContext } from './calendar-context';
import { readCalendarReportFilterOptionsInTransaction } from './calendar-filters';
import { readCalendarScheduledReportInTransaction } from './calendar-scheduled';
import { readCalendarReviewReportInTransaction } from './calendar-review';
import { readCalendarUnscheduledReportInTransaction } from './calendar-unscheduled';
import { resolveCalendarExportAccess } from './calendar-export-access';

export async function readCalendarReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: CalendarReportQuery,
): Promise<CalendarReportReadResult> {
  const query = calendarReportQuerySchema.parse(rawQuery);
  const report = query.view === 'calendar-scheduled' ? await readCalendarScheduledReportInTransaction(trx, context, query)
    : query.view === 'calendar-review' ? await readCalendarReviewReportInTransaction(trx, context, query)
      : await readCalendarUnscheduledReportInTransaction(trx, context, query);
  const options = await readCalendarReportFilterOptionsInTransaction(trx, context, {
    workspaceId: query.workspaceId, context: query.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated',
  });
  const access = resolveCalendarExportAccess(context);
  return calendarReportReadResultSchema.parse({ workspaceId: context.workspaceId, viewerId: context.userId,
    canExport: access !== null, exportScopes: access?.outputScopes ?? null,
    policyRevision: context.policy.revision, scope: report.scope, query, report, options });
}
export async function initialCalendarReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<CalendarReportReadResult> {
  const { today } = await calendarReportContext(trx, context, context.workspaceId);
  const from = calendarWeekStart(today);
  return readCalendarReportWithAuthorityInTransaction(trx, context, {
    workspaceId: context.workspaceId, view: 'calendar-scheduled', period: { from, to: addCalendarDays(from, 6) },
    selected: 'visits', filters: { participants: [], recordTypes: [] }, page: 1, pageSize: 25,
  });
}
