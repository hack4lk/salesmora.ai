import { jobReportQuerySchema } from '@salesmora/contracts';
import { workspaceJobReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Jobs', parseQuery: raw => jobReportQuerySchema.safeParse(raw), read: workspaceJobReport });
}
