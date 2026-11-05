import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { capturePublicConfig, captureRequestSurface, capturePublicHeaders } from './server/lead-capture/public-config';
import { captureSubmissionPolicy } from './server/lead-capture/submission-policy';
export function proxy(request: NextRequest) {
  const development = process.env.NODE_ENV === 'development', config = capturePublicConfig();
  const surface = captureRequestSurface(request.headers.get('host'), request.nextUrl.pathname, request.method, config, development);
  if (surface === 'application') return NextResponse.next();
  const nonce = randomBytes(18).toString('base64'), headers = capturePublicHeaders(surface === 'embed', nonce, development, !!captureSubmissionPolicy());
  if (surface === 'reject' || surface === 'unconfigured') return new NextResponse(surface === 'unconfigured' ? 'Requests are temporarily unavailable.' : 'Not found.', { status: surface === 'unconfigured' ? 503 : 404, headers });
  const forwarded = new Headers(request.headers);
  // Public rendering never consumes app sessions, including deliberately supplied domain cookies.
  forwarded.delete('cookie'); forwarded.delete('authorization'); forwarded.delete('x-forwarded-host');
  forwarded.set('Content-Security-Policy', headers['Content-Security-Policy']);
  const response = NextResponse.next({ request: { headers: forwarded } });
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}
export const config = { matcher: '/:path*' };
