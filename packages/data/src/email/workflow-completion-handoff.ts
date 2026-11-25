import {z} from 'zod';
import {completionHandoffSnapshotSchema,type CompletionHandoffSnapshot} from '@salesmora/contracts';
import {appOrigin,brandedWorkflowEmail} from './branded-workflow';
export function renderCompletionHandoffEmail(input:{baseURL:string;workspaceId:string;snapshot:CompletionHandoffSnapshot},logoSrc='cid:salesmora-logo'){
 const origin=appOrigin(input.baseURL),workspaceId=z.uuid().parse(input.workspaceId),s=completionHandoffSnapshotSchema.parse(input.snapshot),job=new URL(`/jobs/${s.jobId}`,origin);job.searchParams.set('workspace',workspaceId);const preferences=new URL('/settings/notifications',origin);preferences.searchParams.set('workspace',workspaceId);
 const status={draft:'Draft',issued:'Issued','in-progress':'In progress'},remaining=s.totalOpen-s.workOrders.length;
 const labels=s.workOrders.map(w=>`${w.number} · ${w.title} · ${status[w.status]}`);
 return brandedWorkflowEmail({subject:'Completed job still has open work orders',body:[`${s.jobNumber} · ${s.jobTitle} has ${s.totalOpen} open ${s.totalOpen===1?'work order':'work orders'}.`,...labels,...(remaining>0?[`${remaining} more open work orders`]:[]),'Review the linked work orders on the job.'].join('\n\n'),action:{label:'Open job',url:job.href},footerLabel:'Notification preferences',footerURL:preferences.href},logoSrc);
}
