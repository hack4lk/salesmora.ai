import {PlanCapacityError} from '@salesmora/data';
import { NextResponse } from 'next/server';
import { getSession } from '../../../../server/auth/session';
import { acceptInvitation, allowInvitationAttempt, safelyDeliverOwnerInvitations } from '../../../../server/invitations/store';
import { invitationCookie, invitationCookieOptions, requestInvitationToken, validInvitationOrigin } from '../../../../server/invitations/context';
export async function POST(request: Request) {
  if (!validInvitationOrigin(request)) return NextResponse.json({ok:false},{status:403});
  const session = await getSession();
  if (!session) return NextResponse.json({ok:false},{status:401});
  if (!await allowInvitationAttempt(session.user.id)) return NextResponse.json({ok:false,reason:'rate-limited'},{status:429,headers:{'Retry-After':'60'}});
  const token = await requestInvitationToken(request);
  if (!token) return NextResponse.json({ok:false,reason:'invalid'},{status:400});
  try {
    const result = await acceptInvitation(token,session.user.id);
    if (result.ok) await safelyDeliverOwnerInvitations(session.user.id);
    const response = NextResponse.json(result,{status:result.ok?200:result.reason==='wrong-account'?403:410});
    if (result.ok) response.cookies.set(invitationCookie,'',{...invitationCookieOptions,maxAge:0});
    return response;
  } catch(error) {
    if(error instanceof PlanCapacityError)return NextResponse.json({ok:false,reason:'capacity'},{status:409,headers:{'Cache-Control':'no-store'}});
    return NextResponse.json({ok:false},{status:503});
  }
}
