'use client';
import {useEffect,useId,useRef,useState} from 'react';
import type {CompletionHandoffValues} from '@salesmora/contracts';
import {WorkflowNotificationChoices} from '../workflow-notification-choices';
export type {CompletionHandoffValues} from '@salesmora/contracts';
export type CompletionHandoffCardProps={value:CompletionHandoffValues;recipients:readonly {id:string;name:string}[];canPublish:boolean;editing?:boolean;state?:'draft'|'published'|'cancelled'|'expired';expiresAt?:string|null;onPublish:(values:CompletionHandoffValues)=>Promise<void>;onCancel:()=>Promise<void>};
const input='min-h-11 w-full min-w-0 rounded-xl border border-assistant-border bg-assistant-panel p-3 text-base font-normal text-assistant-foreground focus-visible:focus-ring';
const button='min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60';
/** Canonical review for the immediate completion-handoff recipe. Host owns current authority and publication. */
export function CompletionHandoffCard(props:CompletionHandoffCardProps){return <HandoffReview key={JSON.stringify([props.value,props.editing,props.expiresAt])} {...props}/>;}
function HandoffReview({value:initial,recipients,canPublish,editing=false,state:suppliedState='draft',expiresAt,onPublish,onCancel}:CompletionHandoffCardProps){
 const id=useId(),heading=useRef<HTMLHeadingElement>(null),first=useRef<HTMLInputElement>(null),lock=useRef(false);
 const [value,setValue]=useState(initial),[settings,setSettings]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[expired,setExpired]=useState(()=>!!expiresAt&&Date.parse(expiresAt)<=Date.now());
 useEffect(()=>{if(!expiresAt||expired)return;let timer:ReturnType<typeof setTimeout>;const check=()=>{const delay=Date.parse(expiresAt)-Date.now();if(!Number.isFinite(delay)||delay<=0)setExpired(true);else timer=setTimeout(check,Math.min(delay,2147483647));};check();return()=>clearTimeout(timer);},[expiresAt,expired]);
 const state=suppliedState==='draft'&&expired?'expired':suppliedState,contact=recipients.find(p=>p.id===value.recipientId),editable=canPublish&&state==='draft'&&!busy;
 const valid=!!contact&&!!value.name.trim()&&value.name.trim().length<=120&&(value.notifications.inApp||value.notifications.email),changed=JSON.stringify(value)!==JSON.stringify(initial);
 async function save(){if(lock.current||!editable||!valid||editing&&!changed||expiresAt&&Date.parse(expiresAt)<=Date.now())return;lock.current=true;setBusy(true);setError('');try{await onPublish({...value,name:value.name.trim()});}catch{setError('The workflow could not be saved. Your choices are still here.');}finally{lock.current=false;setBusy(false);}}
 return <section aria-labelledby={`${id}-title`} aria-busy={busy} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
  <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{value.name}</h3>
  <p className="m-0 text-sm leading-6">Notify {contact?.name??'the selected teammate'} immediately when a job is marked completed and linked work orders are still open.</p>
  {settings&&<fieldset disabled={!editable} className="m-0 grid min-w-0 gap-4 border-0 p-0 disabled:opacity-60"><label className="grid gap-1 text-sm font-semibold">Workflow name<input ref={first} className={input} maxLength={120} value={value.name} onChange={event=>setValue({...value,name:event.target.value})}/></label><label className="grid gap-1 text-sm font-semibold">Notify<select className={input} value={value.recipientId} onChange={event=>setValue({...value,recipientId:event.target.value})}><option value="">Choose a teammate</option>{recipients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></fieldset>}
  <WorkflowNotificationChoices value={value.notifications} dark disabled={!editable} onChange={notifications=>setValue({...value,notifications})}/>
  <p className="m-0 text-xs leading-5">Checks Draft, Issued and In progress work orders. Starts with future job completions. No customer emails or automatic status changes.</p>
  {state==='published'?<p role="status" className="m-0 text-sm">{editing?'Changes saved.':'Workflow published.'}</p>:state==='cancelled'?<p role="status" className="m-0 text-sm">Draft canceled.</p>:state==='expired'?<p role="status" className="m-0 text-sm">This draft expired. Ask the assistant for a new review.</p>:<>
   {!canPublish&&<p role="status" className="m-0 text-sm">You don’t have permission to publish this workflow.</p>}
   {!valid&&<p role="alert" className="m-0 text-sm">Choose a workflow name, eligible teammate and at least one notification channel.</p>}
   {error&&<p role="alert" className="m-0 text-sm">{error}</p>}
   <div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={!editable} onClick={()=>{setSettings(!settings);requestAnimationFrame(()=>(settings?heading.current:first.current)?.focus());}}>{settings?'Back to review':'Change settings'}</button><button type="button" className={button} disabled={busy} onClick={async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await onCancel();}catch{setError('The draft could not be canceled. Try again.');}finally{lock.current=false;setBusy(false);}}}>Cancel</button><button type="button" className={`${button} seafoam-action text-ink`} disabled={!editable||!valid||editing&&!changed} onClick={()=>void save()}>{busy?'Saving…':editing?'Save changes':'Publish workflow'}</button></div>
  </>}
 </section>;
}
