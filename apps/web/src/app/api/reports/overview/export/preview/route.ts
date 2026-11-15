import { businessOverviewExportHttp } from '../../../../../../server/reports/business-overview-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return businessOverviewExportHttp(request, 'preview'); }
