'use client';
import type {DragEventHandler,ReactNode} from 'react';
import type {WorkOrderListAction,WorkOrderView} from '../work-order-preview.types';
import {woDate,woInitials} from '../work-order-ui';
import {WorkOrderStatusBadge} from '../work-order-status-badge/work-order-status-badge';
import {WorkOrderRowMenu} from '../work-order-row-menu/work-order-row-menu';
import {copy} from './work-order-card.data';

export type WorkOrderCardProps={workOrder:WorkOrderView;disabled?:boolean;dragging?:boolean;onOpen:()=>void;onAction:(a:WorkOrderListAction)=>void;onDragStart?:DragEventHandler<HTMLElement>;onDragEnd?:DragEventHandler<HTMLElement>;movementControl?:ReactNode;hideStatus?:boolean};
export function WorkOrderCard({workOrder:w,disabled=false,dragging=false,onOpen,onAction,onDragStart,onDragEnd,movementControl,hideStatus=false}:WorkOrderCardProps){
 return <article draggable={!!onDragStart&&!disabled} onDragStart={onDragStart} onDragEnd={onDragEnd} aria-label={`${w.number} ${w.title}`} className={`min-w-0 rounded-xl border border-line bg-paper p-4 text-ink shadow-sm ${dragging?'opacity-50':''}`}>
  <div className="flex items-start justify-between gap-2"><span className="text-xs font-semibold text-muted">{w.number} · {w.jobNumber}</span><div className="flex shrink-0">{movementControl}<WorkOrderRowMenu row={w} disabled={disabled} onAction={onAction}/></div></div>
  <button type="button" onClick={onOpen} disabled={disabled} aria-label={copy.open(w.title)} className="mb-2 min-h-11 w-full cursor-pointer rounded-lg text-left text-base font-semibold text-ink wrap-anywhere hover:text-primary focus-visible:focus-ring disabled:opacity-50">{w.title}</button>
  <p className="mb-3 mt-0 text-sm text-muted wrap-anywhere">{w.customerName}</p>
  {!hideStatus&&<WorkOrderStatusBadge status={w.status}/>}
  <dl className="my-4 grid min-w-0 grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-muted">{copy.schedule}</dt><dd className={`m-0 font-medium ${w.overdue?'text-error':''}`}>{w.scheduledDate?woDate(w.scheduledDate):copy.notScheduled}{w.overdue&&` · ${copy.overdue}`}</dd></div><div><dt className="text-xs text-muted">{copy.tasks}</dt><dd className="m-0 font-medium">{copy.taskProgress(w.tasksDone,w.tasksTotal)}</dd></div></dl>
  {w.changedAfterIssue&&<p className="mb-3 mt-0 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{copy.changed}</p>}
  <div className="flex min-w-0 items-center gap-2 border-t border-line pt-3"><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{w.assigneeName?woInitials(w.assigneeName):'?'}</span><span className="min-w-0 text-sm wrap-anywhere"><span className="block text-xs text-muted">{copy.assignee}</span>{w.assigneeName??copy.unassigned}</span></div>
 </article>;
}
