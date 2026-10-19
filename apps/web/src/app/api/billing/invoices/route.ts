import {NextResponse} from 'next/server';
import {billingInvoiceHistoryRequestSchema} from '@salesmora/contracts';
import {AuthorizationAccessError,readWorkspaceInvoices,sandboxBillingEnabled} from '@salesmora/data';
import {getSession} from '../../../../server/auth/session';
import {database} from '../../../../server/workspaces/store';
import {enabledPermissions} from '../../../../server/authorization/permissions';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
  if(!sandboxBillingEnabled())return reply({error:'Billing unavailable.'},503);
  const session=await getSession();if(!session)return reply({error:'Sign in to continue.'},401);
  const params=new URL(request.url).searchParams;
  const parsed=billingInvoiceHistoryRequestSchema.safeParse(Object.fromEntries(params));
  if(!parsed.success||[...params.keys()].some(key=>params.getAll(key).length!==1))return reply({error:'Invalid invoice request.'},400);
  try{return reply(await readWorkspaceInvoices(database(),session.user.id,parsed.data.workspace,enabledPermissions,parsed.data.after));}
  catch(error){return reply({error:'Invoice history unavailable.'},error instanceof AuthorizationAccessError?403:503);}
}
