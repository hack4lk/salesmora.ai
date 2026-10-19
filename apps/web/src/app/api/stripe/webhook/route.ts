import { NextResponse } from 'next/server';
import { sandboxBillingEnabled, verifyBillingWebhook, recordBillingEvent } from '@salesmora/data';
import { database } from '../../../../server/workspaces/store';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!sandboxBillingEnabled()) return NextResponse.json({error:'Billing is unavailable.'},{status:503});
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({error:'Missing payload.'},{status:400});
  const chunks: Uint8Array[] = []; let length=0;
  while (true) {
    const {done,value}=await reader.read(); if(done)break;
    length+=value.length;
    if(length>256000){await reader.cancel();return NextResponse.json({error:'Payload too large.'},{status:413});}
    chunks.push(value);
  }
  let event;
  try {event=verifyBillingWebhook(Buffer.concat(chunks).toString('utf8'),request.headers.get('stripe-signature') ?? '');}
  catch {return NextResponse.json({error:'Invalid webhook signature or scope.'},{status:400});}
  try {await recordBillingEvent(database(),event);return NextResponse.json({received:true});}
  catch {return NextResponse.json({error:'Event could not be saved.'},{status:503});}
}
