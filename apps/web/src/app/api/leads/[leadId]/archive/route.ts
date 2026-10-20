import { NextResponse } from 'next/server';
import { AuthorizationAccessError, LeadArchiveConflictError } from '@salesmora/data';
import { leadArchiveSchema } from '@salesmora/contracts';
import { getSession } from '../../../../../server/auth/session';
import { archiveWorkspaceLead } from '../../../../../server/leads/archive';
async function change(request:Request,params:Promise<{leadId:string}>,archived:boolean) {
  const headers={'Cache-Control':'private, no-store',Vary:'Cookie'};
  if(!process.env.BETTER_AUTH_URL || request.headers.get('origin')!==new URL(process.env.BETTER_AUTH_URL).origin)return NextResponse.json({error:'Invalid origin.'},{status:403,headers});
  const session=await getSession();if(!session)return NextResponse.json({error:'Sign in to manage leads.'},{status:401,headers});
  let body:unknown;
  try{const text=await request.text();if(text.length>4000)return NextResponse.json({error:'Request too large.'},{status:413,headers});body=JSON.parse(text);}catch{return NextResponse.json({error:'Invalid archive request.'},{status:400,headers});}
  const input=leadArchiveSchema.safeParse(body),{leadId}=await params;
  if(!input.success || input.data.leadId!==leadId)return NextResponse.json({error:'Invalid archive request.'},{status:400,headers});
  try{return NextResponse.json(await archiveWorkspaceLead(session.user.id,input.data,archived),{headers});}
  catch(error){
    if(error instanceof AuthorizationAccessError)return NextResponse.json({error:'This lead is unavailable or you no longer have permission to archive or restore it.'},{status:404,headers});
    if(error instanceof LeadArchiveConflictError)return NextResponse.json({error:'This lead changed or its archive state already changed. Reload before trying again.'},{status:409,headers});
    return NextResponse.json({error:'The change could not be confirmed. Try again.'},{status:500,headers});
  }
}
export function POST(request:Request,{params}:{params:Promise<{leadId:string}>}){return change(request,params,true);}
export function DELETE(request:Request,{params}:{params:Promise<{leadId:string}>}){return change(request,params,false);}
