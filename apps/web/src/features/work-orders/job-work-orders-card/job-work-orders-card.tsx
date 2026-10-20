'use client';
import type {JobWorkOrderRow} from '../work-order-preview.types';
import {woButton,woDate,woPanel} from '../work-order-ui';
import {WorkOrderStatusBadge} from '../work-order-status-badge/work-order-status-badge';
import {copy} from './job-work-orders-card.data';
export type JobWorkOrdersCardProps={workOrders:JobWorkOrderRow[];canCreate:boolean;jobClosed?:boolean;onOpen:(workOrderId:string)=>void;onAdd:()=>void};
export function JobWorkOrdersCard({workOrders,canCreate,jobClosed=false,onOpen,onAdd}:JobWorkOrdersCardProps){
 const active=workOrders.filter(w=>w.status!=='canceled');
 const done=active.filter(w=>w.status==='completed').length,open=active.length-done;
 const allDone=active.length>0&&open===0;
 return <section className={woPanel} aria-labelledby="job-wo-title"><header className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h2 id="job-wo-title" className="m-0 text-lg font-semibold">{copy.title}</h2>{workOrders.length>0&&<p className="m-0 mt-1 text-xs text-muted">{copy.summary(open,done)}</p>}</div>{canCreate&&!jobClosed&&<button type="button" className={woButton} onClick={onAdd}>{copy.add}</button>}</header>
  {workOrders.length===0?<p className="m-0 text-sm text-muted">{canCreate&&!jobClosed?copy.empty:copy.emptyReadOnly}</p>:
  <ul className="m-0 grid list-none gap-2 p-0">{workOrders.map(w=><li key={w.id}><button type="button" aria-label={copy.open(w.number,w.title)} onClick={()=>onOpen(w.id)} className="flex w-full min-w-0 cursor-pointer items-start justify-between gap-3 rounded-xl border border-line bg-paper p-3 text-left text-ink hover:bg-canvas focus-visible:focus-ring">
   <span className="min-w-0"><span className="block text-sm wrap-anywhere"><strong>{w.number}</strong> {w.title}</span>
    <span className="mt-1 block text-xs text-muted wrap-anywhere">{w.assigneeName??copy.unassigned} · {w.scheduledDate?woDate(w.scheduledDate):copy.notScheduled} · {copy.progress(w.tasksDone,w.tasksTotal)}{w.overdue&&<span className="ml-2 font-semibold text-error">{copy.overdue}</span>}</span></span>
   <span className="shrink-0"><WorkOrderStatusBadge status={w.status}/></span></button></li>)}</ul>}
  {allDone&&<p role="status" className="mb-0 mt-4 rounded-xl border border-line bg-canvas p-3 text-sm font-semibold text-ink">{copy.allDone}<span className="mt-1 block text-xs font-normal text-muted">{copy.allDoneHint}</span></p>}
  {jobClosed&&canCreate&&<p className="mb-0 mt-4 text-xs leading-5 text-muted">{copy.jobClosed}</p>}
  <p className="mb-0 mt-4 text-xs leading-5 text-muted">{copy.info}</p></section>;
}
