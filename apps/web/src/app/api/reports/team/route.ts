import { teamReportQuerySchema } from '@salesmora/contracts';
import { workspaceTeamReport } from '../../../../server/reports/store';
import { readReportHttp } from '../../../../server/reports/http';

export function GET(request: Request) {
  return readReportHttp(request, { name: 'Team', parseQuery: raw => teamReportQuerySchema.safeParse(raw), read: workspaceTeamReport });
}
