'use client';
import {useState} from 'react';
import type {WorkOrderStatus} from '@salesmora/contracts';
import type {WorkOrderCapabilities,WorkOrderInstructions} from '../work-order-preview.types';
import {woButton,woInput,woLabel,woPanel,woPrimary} from '../work-order-ui';
import {copy,instructionsLimit} from './work-order-instructions-card.data';
export type WorkOrderInstructionsCardProps={status:WorkOrderStatus;value:WorkOrderInstructions;changedAfterIssue?:boolean;capabilities:Pick<WorkOrderCapabilities,'update'>;onSave:(value:WorkOrderInstructions)=>void};
const fields=[{key:'instructions',label:copy.instructions,placeholder:copy.instructionsPlaceholder},{key:'accessNotes',label:copy.access,placeholder:copy.accessPlaceholder},{key:'safetyNotes',label:copy.safety,placeholder:copy.safetyPlaceholder}] as const;
export function WorkOrderInstructionsCard({status,value,changedAfterIssue=false,capabilities:c,onSave}:WorkOrderInstructionsCardProps){
 const [editing,setEditing]=useState(false);const [draft,setDraft]=useState(value);
 const closed=status==='completed'||status==='canceled',canEdit=c.update&&!closed;
 const empty=fields.every(f=>!value[f.key].trim());
 const start=()=>{setDraft(value);setEditing(true)};
 const submit=(e:React.FormEvent)=>{e.preventDefault();onSave({instructions:draft.instructions.trim(),accessNotes:draft.accessNotes.trim(),safetyNotes:draft.safetyNotes.trim()});setEditing(false)};
 return <section className={woPanel} aria-labelledby="wo-instructions-title"><header className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="wo-instructions-title" className="m-0 text-lg font-semibold">{copy.title}</h2>{canEdit&&!editing&&<button type="button" className={woButton} onClick={start}>{copy.edit}</button>}</header>
  {changedAfterIssue&&!editing&&<p role="status" className="mb-4 mt-0 rounded-xl border border-line bg-canvas p-3 text-sm font-semibold text-ink">{copy.changedAfterIssue}</p>}
  {editing?<form className="grid gap-4" onSubmit={submit}>{fields.map(f=><div key={f.key} className="grid gap-1"><label className={woLabel}>{f.label}<textarea className={`${woInput} min-h-24 resize-y`} rows={f.key==='instructions'?5:3} maxLength={instructionsLimit} value={draft[f.key]} placeholder={f.placeholder} aria-describedby={`wo-${f.key}-count`} onChange={e=>setDraft(d=>({...d,[f.key]:e.target.value}))}/></label><span id={`wo-${f.key}-count`} className="text-xs text-muted">{copy.counter(draft[f.key].length,instructionsLimit)}</span></div>)}
   <div className="flex flex-wrap justify-end gap-2"><button type="button" className={woButton} onClick={()=>setEditing(false)}>{copy.cancel}</button><button type="submit" className={woPrimary}>{copy.save}</button></div></form>:
  empty?<p className="m-0 text-sm text-muted">{copy.emptyAll}</p>:
  <div className="grid gap-4">{fields.map(f=>{const text=value[f.key].trim();const safety=f.key==='safetyNotes';return <div key={f.key} className={safety&&text?'rounded-xl border border-error p-3':''}><h3 className="m-0 mb-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">{f.label}{safety&&text&&<span className="text-xs font-semibold text-error">{copy.safetyBadge}</span>}</h3>{text?<p className="m-0 whitespace-pre-wrap text-base leading-6 text-ink wrap-anywhere">{text}</p>:<p className="m-0 text-sm text-muted">{copy.emptyView}</p>}</div>})}</div>}
  {closed&&!editing&&<p className="mb-0 mt-4 text-xs leading-5 text-muted">{copy.locked}</p>}</section>;
}
