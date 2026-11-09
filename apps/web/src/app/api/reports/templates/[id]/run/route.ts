import { reportTemplateHttp } from '../../../../../../server/reports/template-http';

export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return reportTemplateHttp(request, 'run', (await params).id);
}
