import {NextResponse} from 'next/server';
import {unsubscribePostJob} from '@salesmora/data';
import {database} from '../../../../server/workspaces/store';
export async function POST(request:Request){if(Number(request.headers.get('content-length')??0)>2048)return new Response('Invalid request',{status:400});const text=await request.text();if(text.length>2048)return new Response('Invalid request',{status:400});const token=new URLSearchParams(text).get('token')??'';const ok=await unsubscribePostJob(database(),token);if(!ok)return new Response('This unsubscribe link is unavailable.',{status:404,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});return NextResponse.redirect(new URL('/thank-you-emails/unsubscribe?done=1',process.env.BETTER_AUTH_URL??request.url),303);}
