'use client';
import {useState} from 'react';
import type {WorkOrderStatus} from '@salesmora/contracts';
import type {WorkOrderAssignment,WorkOrderCapabilities,WorkOrderContact,WorkOrderMember,WorkOrderSchedule} from '../work-order-preview.types';
import {woButton,woDate,woInitials,woInput,woLabel,woPanel,woPrimary} from '../work-order-ui';
import {copy} from './work-order-crew-card.data';
export type WorkOrderCrewCardProps={status:WorkOrderStatus;assignment:WorkOrderAssignment;members:WorkOrderMember[];schedule:WorkOrderSchedule;contact:WorkOrderContact;capabilities:Pick<WorkOrderCapabilities,'update'>;canSchedule:boolean;onSave:(value:WorkOrderAssignment)=>void;onOpenSchedule:()=>void};
const Person=({name}:{name:string})=><li className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-xs font-semibold text-primary">{woInitials(name)}</span><span className="min-w-0 text-base wrap-anywhere">{name}</span></li>;
const link='inline-flex min-h-11 items-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';
export function WorkOrderCrewCard({status,assignment,members,schedule,contact,capabilities:c,canSchedule,onSave,onOpenSchedule}:WorkOrderCrewCardProps){
 const [editing,setEditing]=useState(false);const [draft,setDraft]=useState(assignment);
 const closed=status==='completed'||status==='canceled',canEdit=c.update&&!closed;
 const name=(id:string|null)=>members.find(m=>m.id===id)?.name??null;
 const primary=name(assignment.assigneeId),crew=assignment.crewIds.map(name).filter((n):n is string=>!!n);
 const start=()=>{setDraft(assignment);setEditing(true)};
 const toggle=(id:string,on:boolean)=>setDraft(d=>({...d,crewIds:on?[...d.crewIds,id]:d.crewIds.filter(x=>x!==id)}));
 const setPrimary=(id:string)=>setDraft(d=>({assigneeId:id||null,crewIds:d.crewIds.filter(x=>x!==id)}));
 const submit=(e:React.FormEvent)=>{e.preventDefault();onSave(draft);setEditing(false)};
 const tel=contact.phone?contact.phone.replace(/[^\d+]/g,''):null;
 return <section className={woPanel} aria-labelledby="wo-crew-title"><header className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="wo-crew-title" className="m-0 text-lg font-semibold">{copy.title}</h2>{canEdit&&!editing&&<button type="button" className={woButton} onClick={start}>{copy.edit}</button>}</header>
  {editing?<form className="grid gap-4" onSubmit={submit}>
   <label className={woLabel}>{copy.primary}<select className={woInput} value={draft.assigneeId??''} onChange={e=>setPrimary(e.target.value)}><option value="">{copy.choose}</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
   <fieldset className="m-0 grid min-w-0 gap-1 border-0 p-0"><legend className="mb-1 p-0 text-sm font-semibold text-ink">{copy.crew}</legend>{members.filter(m=>m.id!==draft.assigneeId).map(m=><label key={m.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-base"><input type="checkbox" className="size-5 accent-primary" checked={draft.crewIds.includes(m.id)} onChange={e=>toggle(m.id,e.target.checked)}/>{m.name}</label>)}</fieldset>
   <div className="flex flex-wrap justify-end gap-2"><button type="button" className={woButton} onClick={()=>setEditing(false)}>{copy.cancel}</button><button type="submit" className={woPrimary}>{copy.save}</button></div></form>:
  <dl className="m-0 grid gap-4">
   <div><dt className="mb-2 text-sm font-semibold text-muted">{copy.primary}</dt><dd className="m-0">{primary?<ul className="m-0 grid list-none gap-2 p-0"><Person name={primary}/></ul>:<><p className="m-0 text-base text-muted">{copy.unassigned}</p>{canEdit&&<p className="m-0 mt-1 text-xs text-muted">{copy.assignHint}</p>}</>}</dd></div>
   <div><dt className="mb-2 text-sm font-semibold text-muted">{copy.crew}</dt><dd className="m-0">{crew.length?<ul className="m-0 grid list-none gap-2 p-0">{crew.map(n=><Person key={n} name={n}/>)}</ul>:<p className="m-0 text-base text-muted">{copy.noCrew}</p>}</dd></div>
   <div><dt className="mb-1 text-sm font-semibold text-muted">{copy.schedule}</dt><dd className="m-0 flex flex-wrap items-center justify-between gap-3"><span className={`text-base ${schedule.date?'text-ink':'text-muted'}`}>{schedule.date?`${woDate(schedule.date)}${schedule.window?` · ${copy.window(schedule.window)}`:''}`:copy.notScheduled}</span>{canSchedule&&!closed&&<button type="button" className={woButton} onClick={onOpenSchedule}>{schedule.date?copy.openSchedule:copy.scheduleAction}</button>}</dd></div>
   <div className="border-t border-line pt-4"><dt className="mb-1 text-sm font-semibold text-muted">{copy.customer}</dt><dd className="m-0"><p className="m-0 text-base font-semibold wrap-anywhere">{contact.name}</p><p className="m-0 mt-1 text-sm text-muted wrap-anywhere">{contact.address}</p>
    <div className="mt-3 flex flex-wrap gap-2">{tel?<><a className={link} href={`tel:${tel}`}>{copy.call}</a><a className={link} href={`sms:${tel}`}>{copy.text}</a></>:<span className="text-sm text-muted">{copy.noPhone}</span>}<a className={link} href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`} target="_blank" rel="noreferrer">{copy.navigate}</a></div></dd></div>
  </dl>}
  {closed&&!editing&&<p className="mb-0 mt-4 text-xs leading-5 text-muted">{copy.locked}</p>}</section>;
}
