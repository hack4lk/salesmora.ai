import { leadSourceExportHttp } from '../../../../../server/reports/lead-source-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return leadSourceExportHttp(request, 'download'); }
