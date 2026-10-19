import type {WorkOrderListFilters,WorkOrderListSort,WorkOrderView} from '../work-order-preview.types';
export const defaultWorkOrderListFilters:WorkOrderListFilters={search:'',status:'all',assignee:'all',jobNumber:'all',scheduledFrom:'',scheduledTo:'',mine:false,archived:false};
export const defaultWorkOrderListSort:WorkOrderListSort={column:'scheduledDate',direction:'asc'};

/** Preview-side mirror of the server query; the real list filters and sorts in the store. */
export function filterWorkOrders(rows:WorkOrderView[],f:WorkOrderListFilters,mineName?:string){
 const q=f.search.trim().toLowerCase();
 return rows.filter(r=>{
  if(r.archived!==f.archived)return false;
  if(q&&![r.number,r.title,r.customerName,r.jobNumber,r.address].some(v=>v.toLowerCase().includes(q)))return false;
  if(f.status!=='all'&&r.status!==f.status)return false;
  if(f.assignee==='unassigned'?r.assigneeName!==null:f.assignee!=='all'&&r.assigneeName!==f.assignee)return false;
  if(f.jobNumber!=='all'&&r.jobNumber!==f.jobNumber)return false;
  if(f.scheduledFrom&&(!r.scheduledDate||r.scheduledDate<f.scheduledFrom))return false;
  if(f.scheduledTo&&(!r.scheduledDate||r.scheduledDate>f.scheduledTo))return false;
  if(f.mine&&mineName&&r.assigneeName!==mineName&&!r.crewNames.includes(mineName))return false;
  return true;
 });
}
export function sortWorkOrders(rows:WorkOrderView[],s:WorkOrderListSort){
 const sign=s.direction==='asc'?1:-1;
 return [...rows].sort((a,b)=>{
  const av=a[s.column]??'',bv=b[s.column]??'';
  if(!av&&bv)return 1;if(av&&!bv)return -1;
  return av<bv?-sign:av>bv?sign:a.number.localeCompare(b.number);
 });
}
