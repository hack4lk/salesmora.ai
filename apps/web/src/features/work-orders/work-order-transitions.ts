import type {WorkOrderStatus} from '@salesmora/contracts';
import type {WorkOrderView} from './work-order-preview.types';

export const workOrderTransitions:Record<WorkOrderStatus,WorkOrderStatus[]>={draft:['issued','canceled'],issued:['in-progress','canceled'],'in-progress':['completed','canceled'],completed:[],canceled:[]};

/** Targets this user may move the work order to; mirrors the server's lifecycle and permission checks. */
export function allowedTransitions(w:WorkOrderView):WorkOrderStatus[]{
 if(w.archived)return [];
 const c=w.capabilities,need:Record<WorkOrderStatus,boolean>={draft:false,issued:c.issue,'in-progress':c.start,completed:c.complete,canceled:c.cancel};
 return workOrderTransitions[w.status].filter(to=>need[to]);
}
