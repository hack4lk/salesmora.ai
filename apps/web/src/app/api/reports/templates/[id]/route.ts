import { reportTemplateHttp } from '../../../../../server/reports/template-http';

export const runtime = 'nodejs';
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return reportTemplateHttp(request, 'update', (await params).id);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return reportTemplateHttp(request, 'delete', (await params).id);
}
