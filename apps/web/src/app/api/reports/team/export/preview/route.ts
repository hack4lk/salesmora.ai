import { teamExportHttp } from '../../../../../../server/reports/team-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return teamExportHttp(request, 'preview'); }
