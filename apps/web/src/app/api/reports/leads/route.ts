import { leadReportQuerySchema } from '@salesmora/contracts';
import { workspaceLeadReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Leads', parseQuery: raw => leadReportQuerySchema.safeParse(raw), read: workspaceLeadReport });
}
