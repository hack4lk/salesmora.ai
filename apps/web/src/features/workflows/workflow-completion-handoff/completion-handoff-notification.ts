import type {NotificationMenuItem} from '../../notifications/notification-menu/notification-menu';
import type {CompletionHandoffSnapshot} from '@salesmora/contracts';
export type {CompletionHandoffSnapshot} from '@salesmora/contracts';
const status={draft:'Draft',issued:'Issued','in-progress':'In progress'} as const;
/** Snapshot is an authorized, bounded projection; navigation rechecks current Job access. */
export function completionHandoffNotification(input:{id:string;workspaceId:string;createdAt:string;read:boolean;snapshot:CompletionHandoffSnapshot}):NotificationMenuItem{
 const s=input.snapshot,shown=s.workOrders.slice(0,3),remaining=s.totalOpen-shown.length;
 return {id:input.id,title:'Completed job still has open work orders',description:`${s.jobNumber} · ${s.jobTitle} has ${s.totalOpen} open ${s.totalOpen===1?'work order':'work orders'}.`,createdAt:input.createdAt,read:input.read,actionLabel:'Open job',href:`/jobs/${encodeURIComponent(s.jobId)}?workspace=${encodeURIComponent(input.workspaceId)}`,recordLabels:[...shown.map(w=>`${w.number} · ${w.title} · ${status[w.status]}`),...(remaining>0?[`${remaining} more open ${remaining===1?'work order':'work orders'}`]:[])]};
}
