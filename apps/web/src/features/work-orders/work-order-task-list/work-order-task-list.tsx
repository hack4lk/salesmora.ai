'use client';
import {useState} from 'react';
import type {WorkOrderCapabilities,WorkOrderTask} from '../work-order-preview.types';
import type {WorkOrderStatus} from '@salesmora/contracts';
import {woButton,woInput,woLabel,woPanel} from '../work-order-ui';
import {copy} from './work-order-task-list.data';
const when=(iso:string)=>new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
export type WorkOrderTaskListProps={status:WorkOrderStatus;tasks:WorkOrderTask[];capabilities:Pick<WorkOrderCapabilities,'update'|'progress'>;onToggle:(taskId:string,done:boolean)=>void;onAdd:(label:string,required:boolean)=>void;onRemove:(taskId:string)=>void;onToggleRequired:(taskId:string,required:boolean)=>void};
export function WorkOrderTaskList({status,tasks,capabilities:c,onToggle,onAdd,onRemove,onToggleRequired}:WorkOrderTaskListProps){
 const [label,setLabel]=useState('');const [required,setRequired]=useState(false);
 const closed=status==='completed'||status==='canceled',draft=status==='draft';
 const canCheck=c.progress&&(status==='issued'||status==='in-progress'),canEdit=c.update&&!closed;
 const done=tasks.filter(t=>t.done).length,openRequired=tasks.filter(t=>t.required&&!t.done).length;
 const note=closed?copy.locked:draft&&!canEdit?null:draft?copy.draftHint:!canCheck?copy.noProgress:null;
 const submit=(e:React.FormEvent)=>{e.preventDefault();const v=label.trim();if(!v)return;onAdd(v,required);setLabel('');setRequired(false)};
 return <section className={woPanel} aria-labelledby="wo-tasks-title"><header className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="wo-tasks-title" className="m-0 text-lg font-semibold">{copy.title}</h2>{tasks.length>0&&<span className="text-sm font-semibold text-muted">{copy.progress(done,tasks.length)}</span>}</header>
  {tasks.length>0&&<><div role="img" aria-label={`${copy.progressLabel}: ${copy.progress(done,tasks.length)}`} className="mb-3 flex gap-1">{tasks.map(t=><span key={t.id} className={`h-2 min-w-1 flex-1 rounded-full ${t.done?'bg-primary':'bg-line'}`}/>)}</div>
   <p className={`mb-4 mt-0 text-sm ${openRequired?'font-semibold text-ink':'text-muted'}`}>{openRequired?copy.requiredOpen(openRequired):copy.allRequiredDone}</p></>}
  {tasks.length===0?<p className="m-0 text-sm text-muted">{canEdit?copy.emptyEdit:copy.empty}</p>:
   <ul className="m-0 grid list-none gap-2 p-0">{tasks.map(t=><li key={t.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-line bg-paper p-3">
    <input type="checkbox" id={`wo-task-${t.id}`} className="mt-1 size-5 shrink-0 cursor-pointer accent-primary focus-visible:focus-ring disabled:cursor-not-allowed" checked={t.done} disabled={!canCheck} onChange={e=>onToggle(t.id,e.target.checked)}/>
    <div className="min-w-0 flex-1"><label htmlFor={`wo-task-${t.id}`} className={`block text-base wrap-anywhere ${t.done?'text-muted line-through':'text-ink'}`}>{copy.toggle(t.label)}</label>
     <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">{t.required&&!canEdit&&<span className="font-semibold">{copy.required}</span>}{t.done&&t.doneByName&&t.doneAt&&<span>{copy.doneBy(t.doneByName,when(t.doneAt))}</span>}</div></div>
    {canEdit&&<div className="flex shrink-0 items-center gap-2"><label className="flex min-h-11 cursor-pointer items-center gap-1 text-xs text-muted"><input type="checkbox" className="size-4 accent-primary" aria-label={copy.markRequired(t.label)} checked={t.required} onChange={e=>onToggleRequired(t.id,e.target.checked)}/>{copy.required}</label><button type="button" className={woButton} aria-label={copy.remove(t.label)} onClick={()=>onRemove(t.id)}>×</button></div>}
   </li>)}</ul>}
  {canEdit&&<form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end" onSubmit={submit}><label className={woLabel}>{copy.addLabel}<input className={woInput} value={label} placeholder={copy.addPlaceholder} onChange={e=>setLabel(e.target.value)}/></label>
   <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-muted"><input type="checkbox" className="size-4 accent-primary" checked={required} onChange={e=>setRequired(e.target.checked)}/>{copy.required}</label><button type="submit" className={woButton} disabled={!label.trim()}>{copy.add}</button></form>}
  {note&&<p className="mb-0 mt-4 text-xs leading-5 text-muted">{note}</p>}</section>;
}
