import { estimateExportHttp } from '../../../../../server/reports/estimate-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return estimateExportHttp(request, 'download'); }
