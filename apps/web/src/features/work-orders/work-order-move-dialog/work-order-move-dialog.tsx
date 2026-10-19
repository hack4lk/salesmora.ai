'use client';
import {useState} from 'react';
import type {WorkOrderStatus} from '@salesmora/contracts';
import {JobDialog} from '../../jobs/job-dialog/job-dialog';
import {woInput,woLabel} from '../work-order-ui';
import type {WorkOrderView} from '../work-order-preview.types';
import {allowedTransitions} from '../work-order-transitions';
import {workOrderStatusBadgeData} from '../work-order-status-badge/work-order-status-badge.data';
import {copy,reasonLimit} from './work-order-move-dialog.data';

export type WorkOrderMoveDialogProps={open:boolean;workOrder:WorkOrderView;to?:WorkOrderStatus|null;pending?:boolean;error?:string;onClose:()=>void;onConfirm:(to:WorkOrderStatus,reason:string)=>void|Promise<void>};
export function WorkOrderMoveDialog({open,workOrder:w,to=null,pending,error,onClose,onConfirm}:WorkOrderMoveDialogProps){
 const targets=allowedTransitions(w),[picked,setPicked]=useState<WorkOrderStatus|null>(to),[reason,setReason]=useState('');
 const target=picked&&targets.includes(picked)?picked:targets[0]??null,openTasks=w.tasksTotal-w.tasksDone;
 return <JobDialog open={open} title={copy.title(w.number)} description={copy.description} confirmLabel={target?copy.confirm[target]:copy.confirm.issued} confirmDisabled={!target||(target==='canceled'&&!reason.trim())} pending={pending} error={error} closeOnSubmit={target!=='completed'} onClose={onClose} onSubmit={()=>target?onConfirm(target,reason.trim()):undefined}>
  {!target?<p role="status" className="m-0 text-sm text-muted">{copy.none}</p>:<div className="grid gap-4">
   <dl className="m-0 grid gap-3 rounded-xl border border-line bg-canvas p-3 sm:grid-cols-2"><div className="min-w-0"><dt className="text-xs font-semibold text-muted">{copy.current}</dt><dd className="m-0 text-sm">{workOrderStatusBadgeData[w.status].label}</dd></div><div className="min-w-0"><dt className="text-xs font-semibold text-muted">{w.number}</dt><dd className="m-0 text-sm wrap-anywhere">{w.title}</dd></div></dl>
   <label className={woLabel}>{copy.target}<select className={woInput} value={target} onChange={e=>setPicked(e.target.value as WorkOrderStatus)}>{targets.map(s=><option key={s} value={s}>{workOrderStatusBadgeData[s].label}</option>)}</select></label>
   <p className="m-0 text-sm leading-6 text-muted">{copy.hints[target]}</p>
   {target==='issued'&&!w.assigneeName&&<p role="status" className="m-0 rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">{copy.noAssignee}</p>}
   {target==='completed'&&openTasks>0&&<p role="status" className="m-0 rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">{copy.openTasks(openTasks)}</p>}
   {target==='canceled'&&<div className="grid gap-1"><label className={woLabel}>{copy.reason}<textarea className={`${woInput} min-h-24`} maxLength={reasonLimit} value={reason} onChange={e=>setReason(e.target.value)}/></label><span className="text-xs text-muted">{copy.reasonCount(reason.length,reasonLimit)}</span></div>}
  </div>}
 </JobDialog>;
}
