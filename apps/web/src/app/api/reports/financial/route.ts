import { financialReportQuerySchema } from '@salesmora/contracts';
import { workspaceFinancialReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Financial', parseQuery: raw => financialReportQuerySchema.safeParse(raw), read: workspaceFinancialReport });
}
