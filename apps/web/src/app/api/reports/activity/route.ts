import { activityReportQuerySchema } from '@salesmora/contracts';
import { workspaceActivityReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Activity', parseQuery: raw => activityReportQuerySchema.safeParse(raw), read: workspaceActivityReport });
}
