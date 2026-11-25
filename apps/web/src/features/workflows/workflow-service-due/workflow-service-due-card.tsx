'use client';
import {useId,useRef,useState} from 'react';
import type {WorkflowNotificationChannels} from '@salesmora/contracts';
import {WorkflowNotificationChoices} from '../workflow-notification-choices';
export type ServiceDueRule={name:string;serviceId:string;intervalMonths:3|6|12;recipientId:string;localTime:string;includeExisting:boolean;notifications:WorkflowNotificationChannels};
export type WorkflowServiceDueCardProps={value:ServiceDueRule;services:readonly {id:string;name:string}[];recipients:readonly {id:string;name:string}[];timezone:string;canPublish:boolean;editing?:boolean;state?:'draft'|'published'|'expired'|'cancelled';onPublish:(rule:ServiceDueRule)=>Promise<void>;onCancel:()=>void|Promise<void>};
const input='min-h-11 w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 py-2 text-base text-assistant-foreground scheme-dark focus-visible:focus-ring disabled:opacity-60';
const button='min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function WorkflowServiceDueCard({value:initial,services,recipients,timezone,canPublish,editing=false,state='draft',onPublish,onCancel}:WorkflowServiceDueCardProps){
 const id=useId(),[value,setValue]=useState(initial),[settings,setSettings]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),lock=useRef(false),heading=useRef<HTMLHeadingElement>(null),firstField=useRef<HTMLInputElement>(null);
 const service=services.find(item=>item.id===value.serviceId),recipient=recipients.find(item=>item.id===value.recipientId);
 const valid=!!value.name.trim()&&value.name.trim().length<=120&&!!service&&!!recipient&&[3,6,12].includes(value.intervalMonths)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value.localTime)&&(value.notifications.inApp||value.notifications.email),allowed=canPublish&&state==='draft'&&!pending;
 return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
  <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name}</h3>
  <p className="m-0 text-sm leading-6">Notify {recipient?.name??'the selected contact'} when customers are due for {service?.name??'the selected service'}, {value.intervalMonths} months after their latest job was marked completed.</p>
  {settings&&<fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-4 border-0 p-0">
   <label className="grid gap-1 text-sm font-semibold">Workflow name<input ref={firstField} className={input} maxLength={120} value={value.name} onChange={event=>setValue({...value,name:event.target.value})}/></label>
   <label className="grid gap-1 text-sm font-semibold">Service<select className={input} value={value.serviceId} onChange={event=>setValue({...value,serviceId:event.target.value})}><option value="">Choose a service</option>{services.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
   <label className="grid gap-1 text-sm font-semibold">Repeat after<select className={input} value={value.intervalMonths} onChange={event=>{const interval=Number(event.target.value);if(interval===3||interval===6||interval===12)setValue({...value,intervalMonths:interval});}}>{[3,6,12].map(month=><option key={month} value={month}>{month} months</option>)}</select></label>
   <label className="grid gap-1 text-sm font-semibold">Notify<select className={input} value={value.recipientId} onChange={event=>setValue({...value,recipientId:event.target.value})}><option value="">Choose a contact</option>{recipients.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
  </fieldset>}
  <label className="grid gap-1 text-sm font-semibold">Send at<input type="time" className={input} value={value.localTime} disabled={!allowed} onChange={event=>setValue({...value,localTime:event.target.value})}/></label><p className="m-0 text-xs text-assistant-muted">{timezone}</p>
  <WorkflowNotificationChoices dark value={value.notifications} disabled={!allowed} onChange={notifications=>setValue({...value,notifications})}/>
  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-5 accent-seafoam-dark" checked={value.includeExisting} disabled={!allowed||editing} onChange={event=>setValue({...value,includeExisting:event.target.checked})}/>Include existing completed jobs</label>
  <p className="m-0 text-xs leading-5">{value.includeExisting?'Existing reliable completion history will be checked, including overdue customers.':'Starts with future job completions.'} Your team reviews due customers. Customer emails require a separate review and Send action.</p>
  {state==='published'?<p role="status" className="m-0 text-sm">{editing?'Changes saved.':'Workflow published.'}</p>:state==='cancelled'?<p role="status">Draft canceled.</p>:state==='expired'?<p role="status" className="m-0 text-sm">This draft expired. Ask for a fresh review.</p>:<>
   {!canPublish&&<p role="status" className="m-0 text-sm">You don’t have permission to publish this workflow.</p>}
   {!valid&&<p role="alert" className="m-0 text-sm">Choose a service, contact, valid send time and at least one notification channel.</p>}
   {error&&<p role="alert" className="m-0 text-sm">{error}</p>}
   <div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={!allowed} onClick={()=>{setSettings(!settings);requestAnimationFrame(()=>(settings?heading.current:firstField.current)?.focus());}}>{settings?'Back to review':'Change settings'}</button><button type="button" className={button} disabled={pending} onClick={async()=>{if(lock.current)return;lock.current=true;setPending(true);try{await onCancel();}catch{setError('The draft could not be canceled. Try again.');}finally{lock.current=false;setPending(false);}}}>Cancel</button>
    <button type="button" className={`${button} seafoam-action text-ink`} disabled={!allowed||!valid} onClick={async()=>{if(lock.current||!allowed||!valid)return;lock.current=true;setPending(true);setError('');try{await onPublish({...value,name:value.name.trim()});}catch{setError('The workflow could not be published. Your choices are still here.');}finally{lock.current=false;setPending(false);}}}>{pending?'Saving…':editing?'Save changes':'Publish workflow'}</button></div>
  </>}
 </section>;
}
