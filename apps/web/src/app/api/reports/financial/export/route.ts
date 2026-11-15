import { financialExportHttp } from '../../../../../server/reports/financial-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return financialExportHttp(request, 'download'); }
