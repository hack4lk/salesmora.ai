import { NextResponse } from 'next/server';
import { billingCheckoutRequestSchema } from '@salesmora/contracts';
import { AuthorizationAccessError, readWorkspaceBilling, sandboxBillingEnabled } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
const respond = (body:unknown,status=200) => NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request) {
  if (!sandboxBillingEnabled()) return respond({error:'Billing is unavailable.'},503);
  const session = await getSession();
  if (!session) return respond({error:'Sign in to continue.'},401);
  const workspace = billingCheckoutRequestSchema.shape.workspaceId.safeParse(new URL(request.url).searchParams.get('workspace'));
  if (!workspace.success) return respond({error:'Invalid workspace.'},400);
  try {
    const {snapshot} = await readWorkspaceBilling(database(),session.user.id,workspace.data,enabledPermissions);
    return respond(snapshot);
  } catch(error) {
    return respond({error:'Billing could not be loaded.'},error instanceof AuthorizationAccessError ? 403 : 503);
  }
}
