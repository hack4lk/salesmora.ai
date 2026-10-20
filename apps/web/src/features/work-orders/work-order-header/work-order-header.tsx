'use client';
import type {WorkOrderView} from '../work-order-preview.types';import {WorkOrderStatusBadge} from '../work-order-status-badge/work-order-status-badge';import {woButton,woPrimary,woDate} from '../work-order-ui';import {copy} from './work-order-header.data';
export type WorkOrderHeaderAction='issue'|'start'|'complete'|'cancel'|'reopen'|'print'|'duplicate'|'archive'|'delete';
export function WorkOrderHeader({workOrder:w,onBack,onAction,onOpenJob}:{workOrder:WorkOrderView;onBack:()=>void;onOpenJob?:(jobId:string)=>void;onAction:(action:WorkOrderHeaderAction)=>void}){
 const c=w.capabilities,closed=w.status==='completed'||w.status==='canceled';
 const primary:WorkOrderHeaderAction|null=w.status==='draft'&&c.issue?'issue':w.status==='issued'&&c.start?'start':w.status==='in-progress'&&c.complete?'complete':null;
 const secondary:WorkOrderHeaderAction[]=[];
 if(c.cancel&&(w.status==='issued'||w.status==='in-progress'))secondary.push('cancel');
 if(c.reopen&&closed)secondary.push('reopen');
 if(c.print&&w.status!=='draft')secondary.push('print');
 if(c.duplicate)secondary.push('duplicate');
 if(c.archive&&!w.archived&&w.status!=='draft')secondary.push('archive');
 if(c.remove&&w.status==='draft'&&!w.archived)secondary.push('delete');
 const nothing=!primary&&!secondary.length;
 return <header className="grid min-w-0 gap-4"><button type="button" className={`${woButton} justify-self-start`} onClick={onBack}>{copy.back}</button>
  <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="mb-2 mt-0 text-sm font-semibold text-muted">{w.number} · {copy.subtitle}</p><h1 className="m-0 text-heading-lg font-semibold text-ink wrap-anywhere">{w.title}</h1>
   <p className="my-3 text-base text-muted wrap-anywhere">{w.customerName} · {w.address} · {copy.job}{' '}{w.jobId&&onOpenJob?<button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-base font-semibold text-primary underline hover:text-primary-dark focus-visible:focus-ring" aria-label={`${copy.openJob} ${w.jobNumber}`} onClick={()=>onOpenJob(w.jobId)}>{w.jobNumber}</button>:w.jobNumber}</p>
   <div className="flex flex-wrap items-center gap-2"><WorkOrderStatusBadge status={w.status}/>
    {w.overdue&&<span className="text-sm font-semibold text-error">{copy.overdue}</span>}
    {w.changedAfterIssue&&<span className="text-sm text-muted">{copy.changed}</span>}
    {w.archived&&<span className="text-sm text-muted">{copy.archived}</span>}</div>
   <p className="mb-0 mt-3 text-sm text-muted">{w.assigneeName??copy.unassigned} · {w.scheduledDate?woDate(w.scheduledDate)+(w.scheduledWindow?' · '+w.scheduledWindow.replace('-',' – '):''):copy.unscheduled}</p>
   {closed&&<p className="mb-0 mt-2 text-sm text-muted">{copy.closed}</p>}
   {nothing&&<p className="mb-0 mt-2 text-sm text-muted">{copy.readOnly}</p>}</div>
   <div className="flex flex-wrap gap-3">{secondary.map(a=><button key={a} type="button" className={woButton} onClick={()=>onAction(a)}>{copy.actions[a]}</button>)}{primary&&<button type="button" className={woPrimary} onClick={()=>onAction(primary)}>{copy.actions[primary]}</button>}</div></div></header>;
}
