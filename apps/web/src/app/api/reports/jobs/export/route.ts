import { jobExportHttp } from '../../../../../server/reports/job-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return jobExportHttp(request, 'download'); }
