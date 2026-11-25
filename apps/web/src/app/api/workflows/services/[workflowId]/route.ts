import {NextResponse} from 'next/server';
import {jobIdSchema,serviceDueCommandSchema,CalendarContractError} from '@salesmora/contracts';
import {readServiceDue,changeServiceDue} from '@salesmora/data';
import {calendarRequest,calendarHeaders} from '../../../../../server/calendar/http';
import {database} from '../../../../../server/workspaces/store';
import {enabledPermissions} from '../../../../../server/authorization/permissions';
import {generateServiceEmail} from '../../../../../server/workflows/service-email';
type Context={params:Promise<{workflowId:string}>};
export async function GET(request:Request,{params}:Context){const {workflowId}=await params;return calendarRequest(request,async identity=>{if(!jobIdSchema.safeParse(workflowId).success)return NextResponse.json({error:'Workflow unavailable.'},{status:404,headers:calendarHeaders});const url=new URL(request.url);return NextResponse.json(await readServiceDue(database(),identity,enabledPermissions,workflowId,Number(url.searchParams.get('page')??1),Number(url.searchParams.get('pageSize')??25)),{headers:calendarHeaders});});}

export async function POST(request:Request,{params}:Context){const {workflowId}=await params;return calendarRequest(request,async(identity,body)=>{if(!body||typeof body!=='object'||!('command'in body)||!('requestId'in body)||!jobIdSchema.safeParse(body.requestId).success||!jobIdSchema.safeParse(workflowId).success)throw new CalendarContractError([]);const parsed=serviceDueCommandSchema.safeParse(body.command);if(!parsed.success)throw new CalendarContractError(parsed.error.issues);return NextResponse.json(parsed.data.action==='generate'?await generateServiceEmail(identity,workflowId,body.requestId as string,parsed.data,request.signal):await changeServiceDue(database(),identity,enabledPermissions,workflowId,body.requestId as string,parsed.data,process.env.BETTER_AUTH_URL??''),{headers:calendarHeaders});},true);}
