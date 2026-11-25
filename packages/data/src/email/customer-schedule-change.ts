import { scheduleChangeSnapshotSchema } from '@salesmora/contracts';
import { appOrigin, brandedWorkflowEmail } from './branded-workflow';
export function renderCustomerScheduleChange(input:{baseURL:string;token:string;company:string;phone:string;email:string;name:string;timezone:string;snapshot:unknown}){
 const snapshot=scheduleChangeSnapshotSchema.parse(input.snapshot);if(!/^[a-f0-9]{64}$/.test(input.token))throw Error('Invalid unsubscribe token.');
 const url=new URL('/schedule-change-emails/unsubscribe',appOrigin(input.baseURL));url.searchParams.set('token',input.token);
 const date=(d:string)=>new Intl.DateTimeFormat('en-US',{dateStyle:'full',timeZone:'UTC'}).format(new Date(`${d}T12:00:00Z`));
 const window=(s:string|null)=>{if(!s)return 'Arrival window to be confirmed';return s.split('-').map(t=>{const [h,m]=t.split(':').map(Number);return `${h%12||12}${m?':'+String(m).padStart(2,'0'):''} ${h<12?'AM':'PM'}`;}).join(' – ');};
 const schedule=(s:typeof snapshot.before)=>`${date(s.date)}, ${window(s.arrivalWindow)}`;
 const body=snapshot.after?`Your visit has been updated.\n\nPreviously: ${schedule(snapshot.before)}\nNow: ${schedule(snapshot.after)}`:`Your visit previously scheduled for ${schedule(snapshot.before)} is no longer scheduled.`;
 return brandedWorkflowEmail({subject:`Your visit with ${input.company} ${snapshot.after?'has changed':'is no longer scheduled'}`.replace(/[\r\n]/g,' '),body:`Hi ${input.name},\n\n${body}\n\nTimes shown in ${input.timezone}.\n\n${snapshot.after?'If you need to discuss this change':'For help confirming a new date'}, call ${input.phone} or email ${input.email}.\n\n${input.company}`,footerLabel:'Stop schedule-change emails',footerURL:url.href},'cid:salesmora-logo');
}
