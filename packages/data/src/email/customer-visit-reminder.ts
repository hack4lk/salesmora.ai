import { arrivalWindows } from '@salesmora/contracts';
import { z } from 'zod';
import { appOrigin, brandedWorkflowEmail } from './branded-workflow';
export function renderCustomerVisitReminder(input:{baseURL:string;token:string;company:string;phone:string;email:string;name:string;date:string;arrivalWindow:string;timezone:string}){
 z.iso.date().parse(input.date);z.enum(arrivalWindows).parse(input.arrivalWindow);new Intl.DateTimeFormat('en-US',{timeZone:input.timezone});
 const token=z.string().regex(/^[A-Za-z0-9_-]{43}$/).parse(input.token),url=new URL('/visit-reminders/unsubscribe',appOrigin(input.baseURL));url.searchParams.set('token',token);
 const date=new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${input.date}T12:00:00Z`));
 const time=(t:string)=>{const [h,m]=t.split(':').map(Number);return `${h%12||12}${m?`:${String(m).padStart(2,'0')}`:''} ${h<12?'AM':'PM'}`;};
 const window=input.arrivalWindow.split('-').map(time).join(' – ');
 return brandedWorkflowEmail({subject:`Your visit with ${input.company} is tomorrow`.replace(/[\r\n]/g,' '),body:`Hi ${input.name},\n\nThis is a reminder of your visit on ${date}, with an arrival window of ${window} (${input.timezone}).\n\nIf you need to make a change, call ${input.phone} or email ${input.email}.\n\n${input.company}`,footerLabel:'Stop visit reminder emails',footerURL:url.href},'cid:salesmora-logo');
}
