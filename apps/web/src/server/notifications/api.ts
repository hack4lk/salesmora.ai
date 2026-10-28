import 'server-only';
import { NextResponse } from 'next/server';
import { AuthorizationAccessError, readNotifications, markNotificationRead, readNotificationPreferences, saveNotificationPreferences } from '@salesmora/data';
import { notificationQuerySchema, markNotificationReadSchema, saveNotificationPreferencesSchema } from '@salesmora/contracts';
import { getSession } from '../auth/session';
import { database } from '../workspaces/store';
import { enabledPermissions } from '../authorization/permissions';
const headers = { 'Cache-Control':'private, no-store', Vary:'Cookie' };
export async function notificationAPI(request: Request, operation: 'list' | 'read' | 'preferences' | 'save') {
  if (['read','save'].includes(operation) && (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin)) return NextResponse.json({error:'Invalid origin.'},{status:403,headers});
  const session = await getSession();
  if (!session) return NextResponse.json({error:'Sign in to manage notifications.'},{status:401,headers});
  try {
    const db = database();
    if (operation === 'list' || operation === 'preferences') {
      const url = new URL(request.url);
      const parsed = notificationQuerySchema.safeParse({workspaceId:url.searchParams.get('workspace'),page:url.searchParams.get('page') ?? '1'});
      if (!parsed.success) return NextResponse.json({error:'Invalid notification request.'},{status:400,headers});
      const identity = {userId:session.user.id,workspaceId:parsed.data.workspaceId};
      return NextResponse.json(operation === 'list' ? await readNotifications(db,identity,enabledPermissions,parsed.data.page) : await readNotificationPreferences(db,identity,enabledPermissions),{headers});
    }
    let body: unknown;
    try {const text=await request.text();if(text.length>4000)return NextResponse.json({error:'Request too large.'},{status:413,headers});body=JSON.parse(text);} catch {return NextResponse.json({error:'Invalid notification request.'},{status:400,headers});}
    if (operation === 'read') {
      const parsed = markNotificationReadSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({error:'Invalid notification request.'},{status:400,headers});
      await markNotificationRead(db,{userId:session.user.id,workspaceId:parsed.data.workspaceId},enabledPermissions,parsed.data.id);
      return NextResponse.json({ok:true},{headers});
    }
    const parsed = saveNotificationPreferencesSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:'Invalid preferences.'},{status:400,headers});
    return NextResponse.json(await saveNotificationPreferences(db,{userId:session.user.id,workspaceId:parsed.data.workspaceId},enabledPermissions,{leadAssignedEmail:parsed.data.leadAssignedEmail,visitChangedEmail:parsed.data.visitChangedEmail,estimateEmail:parsed.data.estimateEmail,deadlineReminderEmail:parsed.data.deadlineReminderEmail,jobActivityEmail:parsed.data.jobActivityEmail}),{headers});
  } catch(error) {
    return NextResponse.json({error: error instanceof AuthorizationAccessError ? 'Notifications are unavailable.' : 'Could not complete the notification request. Try again.'},{status:error instanceof AuthorizationAccessError ? 404 : 500,headers});
  }
}
