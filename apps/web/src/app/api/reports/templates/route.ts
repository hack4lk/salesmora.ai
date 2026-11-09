import { reportTemplateHttp } from '../../../../server/reports/template-http';

export const runtime = 'nodejs';
export function GET(request: Request) { return reportTemplateHttp(request, 'list'); }
export function POST(request: Request) { return reportTemplateHttp(request, 'create'); }
