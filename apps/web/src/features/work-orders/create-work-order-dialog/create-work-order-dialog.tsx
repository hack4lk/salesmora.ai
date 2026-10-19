'use client';
import {useState} from 'react';
import {JobDialog} from '../../jobs/job-dialog/job-dialog';
import {woInput,woLabel} from '../work-order-ui';
import type {WorkOrderMember,CreateWorkOrderJob,CreateWorkOrderSource,CreateWorkOrderSourceOption,CreateWorkOrderValues} from '../work-order-preview.types';
import {copy,titleLimit} from './create-work-order-dialog.data';
export type CreateWorkOrderDialogProps={open:boolean;job:CreateWorkOrderJob;members:WorkOrderMember[];sources:CreateWorkOrderSourceOption[];canCreate:boolean;jobClosed?:boolean;initialTitle?:string;pending?:boolean;error?:string;onClose:()=>void;onConfirm:(value:CreateWorkOrderValues)=>void|Promise<void>};
const parse=(value:string):CreateWorkOrderSource=>{const [kind,id]=value.split(':');return kind==='duplicate'?{kind,workOrderId:id}:kind==='estimate'?{kind,estimateId:id}:{kind:'blank'}};
export function CreateWorkOrderDialog({open,job,members,sources,canCreate,jobClosed=false,initialTitle='',pending,error,onClose,onConfirm}:CreateWorkOrderDialogProps){
 const [title,setTitle]=useState(initialTitle||job.title),[assignee,setAssignee]=useState(job.ownerId??''),[source,setSource]=useState('blank');
 const allowed=canCreate&&!jobClosed,kind=source.split(':')[0] as keyof typeof copy.sourceHint;
 return <JobDialog open={open} title={copy.title} description={copy.description} confirmLabel={copy.create} confirmDisabled={!allowed||!title.trim()} pending={pending} error={error} onClose={onClose} onSubmit={()=>onConfirm({jobId:job.id,title:title.trim(),assigneeId:assignee||null,source:parse(source)})}>
  {!allowed&&<p role="status" className="m-0 mb-4 text-sm font-semibold text-ink">{jobClosed?copy.jobClosed:copy.noPermission}</p>}
  <dl className="m-0 mb-4 grid gap-3 rounded-xl border border-line bg-canvas p-3 sm:grid-cols-2"><div className="min-w-0"><dt className="text-xs font-semibold text-muted">{copy.job}</dt><dd className="m-0 text-sm wrap-anywhere">{job.number} · {job.title}</dd></div><div className="min-w-0"><dt className="text-xs font-semibold text-muted">{copy.customer}</dt><dd className="m-0 text-sm wrap-anywhere">{job.customerName}</dd></div><div className="min-w-0 sm:col-span-2"><dt className="text-xs font-semibold text-muted">{copy.address}</dt><dd className="m-0 text-sm wrap-anywhere">{job.address}</dd></div></dl>
  <div className="grid gap-4">
   <div className="grid gap-1"><label className={woLabel}>{copy.titleLabel}<input className={woInput} value={title} maxLength={titleLimit} disabled={!allowed} placeholder={copy.titlePlaceholder} aria-describedby="wo-create-title-count" onChange={e=>setTitle(e.target.value)}/></label><span id="wo-create-title-count" className="text-xs text-muted">{copy.counter(title.length,titleLimit)}</span></div>
   <div className="grid gap-1"><label className={woLabel}>{copy.assignee}<select className={woInput} value={assignee} disabled={!allowed} aria-describedby="wo-create-assignee-hint" onChange={e=>setAssignee(e.target.value)}><option value="">{copy.unassigned}</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><span id="wo-create-assignee-hint" className="text-xs text-muted">{copy.assigneeHint}</span></div>
   <div className="grid gap-1"><label className={woLabel}>{copy.start}<select className={woInput} value={source} disabled={!allowed} aria-describedby="wo-create-source-hint" onChange={e=>setSource(e.target.value)}><option value="blank">{copy.blank}</option>{sources.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
    <span id="wo-create-source-hint" className="text-xs text-muted">{sources.find(s=>s.value===source)?.detail||copy.sourceHint[kind]}</span></div>
   <p className="m-0 text-xs leading-5 text-muted">{copy.draftNote}</p></div></JobDialog>;
}
