'use client';
import {useId} from 'react';
import {DataTable,FilterBar,MetricCard,Pagination} from '@salesmora/ui';
import {workOrderStatuses,type WorkOrderStatus} from '@salesmora/contracts';
import type {WorkOrderListAction,WorkOrderListFilters,WorkOrderListMetrics,WorkOrderListSort,WorkOrderListView,WorkOrderMember,WorkOrderView} from '../work-order-preview.types';
import {woButton,woDate,woInput,woLabel,woPrimary} from '../work-order-ui';
import {WorkOrderCard} from '../work-order-card/work-order-card';
import {WorkOrderRowMenu as RowMenu} from '../work-order-row-menu/work-order-row-menu';
import {WorkOrdersBoard} from '../work-orders-board/work-orders-board';
import {WorkOrderStatusBadge} from '../work-order-status-badge/work-order-status-badge';
import {workOrderStatusBadgeData} from '../work-order-status-badge/work-order-status-badge.data';
import {defaultWorkOrderListFilters} from './work-orders-list.filter';
import {copy} from './work-orders-list.data';

export type WorkOrdersListProps={
 rows:WorkOrderView[];total:number;page:number;pageSize:number;filters:WorkOrderListFilters;sort:WorkOrderListSort;metrics:WorkOrderListMetrics;
 members:WorkOrderMember[];jobNumbers:string[];view?:WorkOrderListView;onView?:(v:WorkOrderListView)=>void;pendingId?:string;onRequestMove?:(w:WorkOrderView,to:WorkOrderStatus)=>void;field?:boolean;canExport?:boolean;exporting?:boolean;state?:'ready'|'loading'|'error';
 onFilters:(f:WorkOrderListFilters)=>void;onSort:(s:WorkOrderListSort)=>void;onPage:(p:number)=>void;onPageSize:(n:number)=>void;
 onOpen:(w:WorkOrderView)=>void;onAction:(w:WorkOrderView,a:WorkOrderListAction)=>void;onExport:()=>void;onRetry?:()=>void;
};

export function WorkOrdersList({rows,total,page,pageSize,filters,sort,metrics,members,jobNumbers,view='table',onView,pendingId,onRequestMove,field=false,canExport=false,exporting=false,state='ready',onFilters,onSort,onPage,onPageSize,onOpen,onAction,onExport,onRetry}:WorkOrdersListProps){
 const id=useId(),disabled=state==='loading',patch=(p:Partial<WorkOrderListFilters>)=>onFilters({...filters,...p});
 const value=(key:keyof WorkOrderListFilters)=>key==='status'?workOrderStatusBadgeData[filters.status as keyof typeof workOrderStatusBadgeData]?.label:key==='assignee'?(filters.assignee==='unassigned'?copy.unassigned:filters.assignee):String(filters[key]);
 const active=(['search','status','assignee','jobNumber','scheduledFrom','scheduledTo'] as const).filter(k=>filters[k]!==''&&filters[k]!=='all'&&!(field&&k==='assignee')).map(k=>({id:k,label:`${copy.chip[k]}: ${value(k)}`}));
 const filtered=active.length>0||filters.archived;
 const metricValues=[metrics.issuedToday,metrics.inProgress,metrics.overdue,metrics.awaitingSignoff];
 return <div className="grid min-w-0 gap-6">
  <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">{(['issuedToday','inProgress','overdue','awaitingSignoff'] as const).map((key,i)=><MetricCard key={key} state={state} label={copy.metrics[key]} value={metricValues[i]} description={copy.descriptions[i]}/>)}</div>
  <FilterBar title={copy.title} activeFilters={active} disabled={disabled} onRemove={key=>patch({[key]:defaultWorkOrderListFilters[key as keyof WorkOrderListFilters]})} onClearAll={()=>onFilters({...defaultWorkOrderListFilters,mine:filters.mine,archived:filters.archived})}>
   <div className="grid min-w-0 flex-1 basis-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <label className={woLabel} htmlFor={id}>{copy.search}<input id={id} type="search" maxLength={200} className={woInput} placeholder={copy.placeholder} value={filters.search} onChange={e=>patch({search:e.target.value})}/></label>
    <label className={woLabel}>{copy.status}<select className={woInput} value={filters.status} onChange={e=>patch({status:e.target.value as WorkOrderListFilters['status']})}><option value="all">{copy.all}</option>{workOrderStatuses.map(s=><option key={s} value={s}>{workOrderStatusBadgeData[s].label}</option>)}</select></label>
    {!field&&<label className={woLabel}>{copy.assignee}<select className={woInput} value={filters.assignee} onChange={e=>patch({assignee:e.target.value})}><option value="all">{copy.all}</option><option value="unassigned">{copy.unassigned}</option>{members.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}</select></label>}
    <label className={woLabel}>{copy.job}<select className={woInput} value={filters.jobNumber} onChange={e=>patch({jobNumber:e.target.value})}><option value="all">{copy.allJobs}</option>{jobNumbers.map(j=><option key={j} value={j}>{j}</option>)}</select></label>
    <label className={woLabel}>{copy.from}<input type="date" className={woInput} value={filters.scheduledFrom} onChange={e=>patch({scheduledFrom:e.target.value})}/></label>
    <label className={woLabel}>{copy.to}<input type="date" className={woInput} value={filters.scheduledTo} onChange={e=>patch({scheduledTo:e.target.value})}/></label>
    <div className="flex flex-wrap items-center gap-4">
     <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"><input role="switch" type="checkbox" disabled={field} checked={filters.mine} onChange={e=>patch({mine:e.target.checked})} className="size-5 accent-primary focus-visible:focus-ring"/>{copy.mine}</label>
     <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"><input role="switch" type="checkbox" checked={filters.archived} onChange={e=>patch({archived:e.target.checked})} className="size-5 accent-primary focus-visible:focus-ring"/>{copy.archived}</label>
    </div>
   </div>
  </FilterBar>
  <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="m-0 text-sm text-muted">{copy.count(total)}</p><div className="flex flex-wrap items-center gap-2">{onView&&<div role="group" aria-label={copy.views} className="flex gap-2">{(['table','board'] as const).map(v=><button key={v} type="button" disabled={disabled} aria-pressed={view===v} className={view===v?woPrimary:woButton} onClick={()=>onView(v)}>{copy[v]}</button>)}</div>}{canExport&&<button type="button" className={woButton} disabled={disabled||exporting||total===0} onClick={onExport}>{exporting?copy.exporting:copy.export}</button>}</div></div>
  {view==='board'?(state==='loading'?<div role="status" aria-busy="true" className="grid gap-4 rounded-2xl border border-line bg-paper p-6"><span className="text-sm text-muted">{copy.loading}</span>{[0,1,2].map(k=><div key={k} aria-hidden="true" className="h-12 rounded-xl bg-canvas motion-safe:animate-pulse"/>)}</div>
   :state==='error'?<div className="grid justify-items-start gap-4 rounded-2xl border border-line bg-paper p-6"><p role="alert" className="m-0 text-sm text-error">{copy.error}</p>{onRetry&&<button type="button" className={woButton} onClick={onRetry}>{copy.retry}</button>}</div>
   :rows.length===0?<p role="status" className="m-0 rounded-2xl border border-line bg-paper p-6 text-sm leading-6 text-muted">{filtered||filters.search?copy.noMatch:copy.empty}</p>
   :<WorkOrdersBoard rows={rows} pendingId={pendingId} onOpen={onOpen} onAction={onAction} onRequestMove={onRequestMove}/>)
  :<DataTable caption={copy.caption} rows={rows} getRowId={r=>r.id} getRowLabel={r=>r.title} onRowOpen={onOpen} sort={sort} onSort={(column,direction)=>onSort({column:column as WorkOrderListSort['column'],direction})} state={state} onRetry={onRetry} emptyMessage={filtered||filters.search?copy.noMatch:copy.empty} errorMessage={copy.error} renderCard={r=><WorkOrderCard workOrder={r} onOpen={()=>onOpen(r)} onAction={a=>onAction(r,a)}/>}
   columns={[
    {id:'number',label:copy.number,sortable:true,render:r=><div className="grid gap-1"><span className="font-semibold">{r.number}</span><span>{r.title}</span></div>},
    {id:'customer',label:copy.customer,render:r=><div className="grid gap-1"><span>{r.customerName}</span><span className="text-xs text-muted">{r.jobNumber}</span></div>},
    {id:'status',label:copy.status,render:r=><WorkOrderStatusBadge status={r.status}/>},
    {id:'assignee',label:copy.assignee,render:r=>r.assigneeName??<span className="text-muted">{copy.unassigned}</span>},
    {id:'scheduledDate',label:copy.scheduled,sortable:true,render:r=><span className={r.overdue?'font-semibold text-error':''}>{r.scheduledDate?woDate(r.scheduledDate):copy.notScheduled}{r.overdue&&` · ${copy.overdue}`}</span>},
    {id:'tasks',label:copy.progress,render:r=>copy.taskProgress(r.tasksDone,r.tasksTotal)},
    {id:'updatedAt',label:copy.updated,sortable:true,render:r=>woDate(r.updatedAt)},
    {id:'actions',label:copy.actions,render:r=><RowMenu row={r} onAction={a=>onAction(r,a)}/>},
   ]}/>}
  {view==='table'&&<Pagination total={total} page={page} pageSize={pageSize} disabled={disabled} onPageChange={onPage} onPageSizeChange={onPageSize}/>}
 </div>;
}
