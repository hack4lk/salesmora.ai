import { NextResponse, type NextRequest } from 'next/server';
import {
  AccessConfigurationError,
  AccessTokenError,
  createVerifiedAccessHeaders,
  getAdminAccessEmail,
} from './server/cloudflare-access';

export async function proxy(request: NextRequest) {
  try {
    const email = await getAdminAccessEmail(request.headers);
    const requestHeaders = createVerifiedAccessHeaders(request.headers, email);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    if (error instanceof AccessConfigurationError) {
      return new Response('Admin access is not configured.', {
        status: 503,
        headers: { 'cache-control': 'no-store' },
      });
    }
    if (error instanceof AccessTokenError) {
      return new Response('Unauthorized.', {
        status: 401,
        headers: { 'cache-control': 'no-store' },
      });
    }
    throw error;
  }
}

export const config = {
  matcher: '/:path*',
};
