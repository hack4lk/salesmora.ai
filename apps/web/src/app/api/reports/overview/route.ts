import { businessOverviewQuerySchema } from '@salesmora/contracts';
import { workspaceBusinessOverview } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Business Overview', parseQuery: raw => businessOverviewQuerySchema.safeParse(raw), read: workspaceBusinessOverview });
}
