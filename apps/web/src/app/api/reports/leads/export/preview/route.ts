import { leadReportExportHttp } from '../../../../../../server/reports/lead-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return leadReportExportHttp(request, 'preview'); }
