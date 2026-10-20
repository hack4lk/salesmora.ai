import { NextResponse } from 'next/server';
import { getInvitation } from '../../../../server/invitations/store';
import { invitationCookie, invitationCookieOptions, requestInvitationToken, validInvitationOrigin } from '../../../../server/invitations/context';
export async function POST(request: Request) {
  if (!validInvitationOrigin(request)) return NextResponse.json({ok:false},{status:403});
  const token = await requestInvitationToken(request);
  if (!token || (await getInvitation(token)).availability!=='ready') return NextResponse.json({ok:false},{status:410});
  const response = NextResponse.json({ok:true});
  response.cookies.set(invitationCookie,token,invitationCookieOptions);
  return response;
}

export async function DELETE(request: Request) {
  if (!validInvitationOrigin(request)) return NextResponse.json({ok:false},{status:403});
  const response = NextResponse.json({ok:true});
  response.cookies.set(invitationCookie,'',{...invitationCookieOptions,maxAge:0});
  return response;
}
