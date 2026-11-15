import { estimateReportQuerySchema } from '@salesmora/contracts';
import { workspaceEstimateReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Estimates', parseQuery: raw => estimateReportQuerySchema.safeParse(raw), read: workspaceEstimateReport });
}
