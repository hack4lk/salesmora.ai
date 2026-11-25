import {NextResponse} from 'next/server';
import {jobIdSchema} from '@salesmora/contracts';
import {authorize,resolveAuthorizedCollectionScope} from '@salesmora/domain';
import {AuthorizationAccessError,serviceChoices,withWorkspaceAuthorization} from '@salesmora/data';
import {getSession} from '../../../server/auth/session';
import {database} from '../../../server/workspaces/store';
import {enabledPermissions} from '../../../server/authorization/permissions';
import {isWorkspaceSuspended,workspaceSuspendedResponse} from '../../../server/http/suspension';
const headers={'Cache-Control':'private, no-store',Vary:'Cookie'};
export async function GET(request:Request){
  const session=await getSession();if(!session)return NextResponse.json({error:'Sign in to view services.'},{status:401,headers});
  try{const id=jobIdSchema.safeParse(new URL(request.url).searchParams.get('workspace'));if(!id.success)throw new AuthorizationAccessError();
    const services=await withWorkspaceAuthorization(database(),{workspaceId:id.data,userId:session.user.id},enabledPermissions,false,async(trx,context)=>{
      if(!resolveAuthorizedCollectionScope(context,'leads.read').allowed&&!resolveAuthorizedCollectionScope(context,'jobs.read').allowed&&!authorize(context,{permission:'leads.create'}).allowed&&!authorize(context,{permission:'settings.business.read'}).allowed)throw new AuthorizationAccessError();
      return serviceChoices(trx,context.workspaceId);
    });return NextResponse.json({services},{headers});
  }catch(error){if(isWorkspaceSuspended(error))return workspaceSuspendedResponse();return NextResponse.json({error:'Services are unavailable.'},{status:error instanceof AuthorizationAccessError?404:500,headers});}
}
