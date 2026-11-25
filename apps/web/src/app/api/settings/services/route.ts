import {NextResponse} from 'next/server';
import {jobIdSchema} from '@salesmora/contracts';
import {AuthorizationAccessError,ServiceSettingsConflict,ServiceSettingsInvalid,readServiceSettings,saveServiceSettings} from '@salesmora/data';
import {getSession} from '../../../../server/auth/session';
import {database} from '../../../../server/workspaces/store';
import {enabledPermissions} from '../../../../server/authorization/permissions';
import {isWorkspaceSuspended,workspaceSuspendedResponse} from '../../../../server/http/suspension';
const headers={'Cache-Control':'private, no-store',Vary:'Cookie'};
async function handle(request:Request,write:boolean){
  if(write&&(!process.env.BETTER_AUTH_URL||request.headers.get('origin')!==new URL(process.env.BETTER_AUTH_URL).origin))return NextResponse.json({error:'Invalid origin.'},{status:403,headers});
  const session=await getSession();if(!session)return NextResponse.json({error:'Sign in to access settings.'},{status:401,headers});
  try{
    let raw:unknown,workspace:unknown=new URL(request.url).searchParams.get('workspace');
    if(write){if(!request.headers.get('content-type')?.startsWith('application/json'))return NextResponse.json({error:'Use a JSON request.'},{status:415,headers});const text=await request.text();if(new TextEncoder().encode(text).length>32000)return NextResponse.json({error:'Request too large.'},{status:413,headers});try{raw=JSON.parse(text);}catch{throw new ServiceSettingsInvalid('Invalid request.');}workspace=raw&&typeof raw==='object'&&'workspaceId'in raw?raw.workspaceId:null;}
    const parsed=jobIdSchema.safeParse(workspace);if(!parsed.success)throw new AuthorizationAccessError();
    const identity={workspaceId:parsed.data,userId:session.user.id};
    return NextResponse.json(write?await saveServiceSettings(database(),identity,enabledPermissions,raw):await readServiceSettings(database(),identity,enabledPermissions),{headers});
  }catch(error){if(isWorkspaceSuspended(error))return workspaceSuspendedResponse();const status=error instanceof AuthorizationAccessError?404:error instanceof ServiceSettingsConflict?409:error instanceof ServiceSettingsInvalid?422:500;return NextResponse.json({error:status===422?(error as Error).message:status===409?'Services changed. Reload before saving.':status===404?'Service settings are unavailable.':'Services could not be loaded or saved.'},{status,headers});}
}
export function GET(request:Request){return handle(request,false);}
export function PUT(request:Request){return handle(request,true);}
