import { capturePublicConfig } from '../../server/lead-capture/public-config';
import { captureEmbedLoader } from '../../server/lead-capture/embed-loader';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const config = capturePublicConfig();
  const headers = { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'cross-origin' };
  if (!config || request.headers.get('host')?.toLowerCase() !== config.authority) return new Response('', { status: 404, headers });
  return new Response(captureEmbedLoader(config.origin), { headers });
}
