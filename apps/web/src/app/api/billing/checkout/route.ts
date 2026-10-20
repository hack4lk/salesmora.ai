import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { billingCheckoutRequestSchema } from '@salesmora/contracts';
import { sandboxBillingEnabled, BillingAccessError, createWorkspaceCheckout, continueWorkspaceFree, reconcileWorkspaceSubscription, billingOnboarding } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { database } from '../../../../server/workspaces/store';
import { safelyDeliverOwnerInvitations } from '../../../../server/invitations/store';
const input = billingCheckoutRequestSchema;
export async function POST(request: Request) {
  if (!sandboxBillingEnabled()) return NextResponse.json({error:'Billing is unavailable.'},{status:503});
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!baseURL || request.headers.get('origin') !== new URL(baseURL).origin) return NextResponse.json({error:'Invalid origin.'},{status:403});
  const session = await getSession();
  if (!session) return NextResponse.json({error:'Sign in to continue.'},{status:401});
  const text = await request.text();
  if (text.length>2000) return NextResponse.json({error:'Request is too large.'},{status:413});
  let body;
  try {body=input.parse(JSON.parse(text));} catch {return NextResponse.json({error:'Invalid checkout request.'},{status:400});}
  try {
    const db = database();
    await billingOnboarding(db,session.user.id,body.workspaceId);
    const now = Date.now();
    const rate = await db('rateLimits').insert({id:randomUUID(),key:`billing:${session.user.id}`,count:1,lastRequest:now}).onConflict('key').merge({count:db.raw('CASE WHEN \"rateLimits\".\"lastRequest\" < ? THEN 1 ELSE \"rateLimits\".count + 1 END',[now-60000]),lastRequest:db.raw('CASE WHEN \"rateLimits\".\"lastRequest\" < ? THEN ? ELSE \"rateLimits\".\"lastRequest\" END',[now-60000,now])}).returning('count');
    if (Number(rate[0].count)>10) return NextResponse.json({error:'Too many billing requests. Try again in a minute.'},{status:429});
    if (body.action === 'checkout') return NextResponse.json(await createWorkspaceCheckout(db,session.user.id,body.workspaceId,baseURL),{headers:{'Cache-Control':'no-store'}});
    if (body.action === 'free') await continueWorkspaceFree(db,session.user.id,body.workspaceId);
    else await reconcileWorkspaceSubscription(db,body.workspaceId);
    const billing = await billingOnboarding(db,session.user.id,body.workspaceId);
    if (billing?.plan !== 'free') await safelyDeliverOwnerInvitations(session.user.id);
    return NextResponse.json({billing},{headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    if (error instanceof BillingAccessError) return NextResponse.json({error:error.message},{status:403});
    return NextResponse.json({error:'Payment could not be completed or confirmed yet. Try again; your progress is saved.'},{status:409});
  }
}
