import 'server-only';
import { cookies } from 'next/headers';
import { validInvitationToken } from './store';
export const invitationCookie = 'salesmora.invitation';
export const invitationCookieOptions = { httpOnly:true,sameSite:'lax' as const,secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60 };
export async function invitationReturnPath() {
  const token = (await cookies()).get(invitationCookie)?.value;
  return validInvitationToken(token) ? `/accept-invitation?token=${token}` : undefined;
}
export async function requestInvitationToken(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0)>512) return undefined;
  const text = await request.text();
  if (text.length>512) return undefined;
  try {
    const body = JSON.parse(text);
    return body && Object.keys(body).length===1 && validInvitationToken(body.token) ? body.token as string : undefined;
  } catch { return undefined; }
}
export const validInvitationOrigin = (request: Request) => !!process.env.BETTER_AUTH_URL && request.headers.get('origin')===new URL(process.env.BETTER_AUTH_URL).origin;
