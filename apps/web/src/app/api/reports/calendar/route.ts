import { calendarReportQuerySchema } from '@salesmora/contracts';
import { workspaceCalendarReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Calendar', parseQuery: raw => calendarReportQuerySchema.safeParse(raw), read: workspaceCalendarReport });
}
