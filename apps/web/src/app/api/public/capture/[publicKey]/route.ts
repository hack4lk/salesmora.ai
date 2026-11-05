import { capturePublicViewSchema } from '@salesmora/contracts';
import { publicCaptureSource } from '../../../../../server/lead-capture/public';
import { submitPublicCapture } from '../../../../../server/lead-capture/submit';
export async function POST(request: Request, { params }: { params: Promise<{ publicKey: string }> }) { return submitPublicCapture(request, (await params).publicKey); }
export async function GET(request: Request, { params }: { params: Promise<{ publicKey: string }> }) {
  const source = await publicCaptureSource((await params).publicKey, request.headers.get('host'), false);
  return Response.json(capturePublicViewSchema.parse(source), { status: source.state === 'not-found' ? 404 : source.state === 'error' ? 503 : 200, headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
}
