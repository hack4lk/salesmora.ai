import {NextResponse} from 'next/server';
import {jobIdSchema,CalendarContractError,cancellationBookingSchema} from '@salesmora/contracts';
import {readCancellationOpening,confirmCancellationBooking} from '@salesmora/data';
import {calendarRequest,calendarHeaders} from '../../../../../server/calendar/http';
import {database} from '../../../../../server/workspaces/store';
import {enabledPermissions} from '../../../../../server/authorization/permissions';
type Context={params:Promise<{openingId:string}>};
export async function GET(request:Request,{params}:Context){const {openingId}=await params;return calendarRequest(request,async identity=>{if(!jobIdSchema.safeParse(openingId).success)return NextResponse.json({error:'Opening unavailable.'},{status:404,headers:calendarHeaders});return NextResponse.json(await readCancellationOpening(database(),identity,enabledPermissions,openingId),{headers:calendarHeaders});});}
export async function POST(request:Request,{params}:Context){const {openingId}=await params;return calendarRequest(request,async(identity,body)=>{const input=cancellationBookingSchema.safeParse(body);if(!input.success)throw new CalendarContractError(input.error.issues);if(input.data.openingId!==openingId)return NextResponse.json({error:'Opening unavailable.'},{status:404,headers:calendarHeaders});return NextResponse.json(await confirmCancellationBooking(database(),identity,enabledPermissions,input.data),{headers:calendarHeaders});},true);}
