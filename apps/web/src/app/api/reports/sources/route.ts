import { leadSourceQuerySchema } from '@salesmora/contracts';
import { workspaceLeadSourceReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Sources', parseQuery: raw => leadSourceQuerySchema.safeParse(raw), read: workspaceLeadSourceReport });
}
