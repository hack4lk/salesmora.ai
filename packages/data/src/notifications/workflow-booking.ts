import type { Knex } from 'knex';
import type { AuthorizationContext, PermissionId } from '@salesmora/contracts';
import { workflowDefinitionSchema } from '@salesmora/contracts';
import { canReadWorkflowRecords } from '@salesmora/domain';
import { AuthorizationAccessError, WorkspaceSuspendedError, withWorkspaceAuthorization } from '../authorization/store';
import { workflowParticipantsEligible } from '../workflows/execution';
import { withoutSuspendedWorkspaces } from '../accounts/workspace-hold';
export function bookingNotificationQuery(trx:Knex.Transaction,context:AuthorizationContext,emailOnly=false) {
  const q=trx('workflowBookingNotifications as n').join('jobs as j',p=>p.on('j.workspaceId','n.workspaceId').andOn('j.id','n.jobId')).where({'n.workspaceId':context.workspaceId,'n.userId':context.userId});
  if(!emailOnly)q.where('n.inApp',true);
  if(!canReadWorkflowRecords(context,'routine_booking'))q.whereRaw('false');
  return q;
}
export function bookingNoticeDescription(snapshot:{result:{status:string;assignedWorker?:{id:string;name:string};slot?:{startsAt:string;endsAt:string};reasons?:string[]};timezone:string;throughDate:string}) {
  if(snapshot.result.status==='booked'&&snapshot.result.slot) {
    const format=new Intl.DateTimeFormat('en-US',{timeZone:snapshot.timezone,month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    return `Booked ${format.format(new Date(snapshot.result.slot.startsAt))}–${new Intl.DateTimeFormat('en-US',{timeZone:snapshot.timezone,hour:'numeric',minute:'2-digit'}).format(new Date(snapshot.result.slot.endsAt))}${snapshot.result.assignedWorker?` with ${snapshot.result.assignedWorker.name}.`:' for the assigned people.'}`;
  }
  const reasons:Record<string,string>={missing_zip:'Add the Job ZIP code in Work details.',outside_coverage:'Review member work ZIP codes in Settings → Team.',no_qualified_workers:'Choose active qualified workers in service settings.',manual_assignment:'Assign people manually for this shared visit.',unassigned:'Assign people to the job.',unknown_hours:'Record working hours for the workers who can perform this service.',inactive_person:'Review the assigned people.',unknown_work:'Record work times for existing visits.',clock_change:'The available window crosses a clock change.',capacity_limit:'The schedule needs a manual review.',deadline:'The completion deadline is too soon.'};
  const detail=snapshot.result.reasons?.map(reason=>reasons[reason]).find(Boolean);
  return `Couldn’t find a time through ${snapshot.throughDate}. The job stays unscheduled.${detail?' '+detail:''}`;
}
export type WorkflowBookingEmail={id:string;to:string;workspaceId:string;jobId:string;jobNumber:string;event:string;description:string};
export async function processWorkflowBookingEmails(db:Knex,enabled:readonly PermissionId[],send:(mail:WorkflowBookingEmail)=>Promise<void>,limit=10,target?:{id:string;workspaceId:string}) {
  if(!Number.isInteger(limit)||limit<1||limit>100)throw new RangeError('Invalid email batch size.');
  const summary={sent:0,skipped:0,retryPending:0,failed:0};
  const query=withoutSuspendedWorkspaces(db('workflowBookingNotifications'),'workflowBookingNotifications.workspaceId').where({emailStatus:'queued'}).where('nextAttemptAt','<=',db.fn.now()).limit(limit).orderBy('nextAttemptAt').orderBy('id');
  if(target)query.where(target);
  const candidates=await query.select('id','workspaceId','userId');
  for(const candidate of candidates)try {
    await withWorkspaceAuthorization(db,{workspaceId:candidate.workspaceId,userId:candidate.userId},enabled,false,async(trx,context)=>{
      const queued=await trx('workflowBookingNotifications').where({id:candidate.id,emailStatus:'queued'}).where('nextAttemptAt','<=',trx.fn.now()).forUpdate().skipLocked().first();if(!queued)return;
      const row=await bookingNotificationQuery(trx,context,true).join('workflows as w',q=>q.on('w.workspaceId','n.workspaceId').andOn('w.id','n.workflowId')).join('users as u','u.id','n.userId').leftJoin('notificationPreferences as p','p.userId','u.id')
        .where('n.id',candidate.id).select('n.snapshot','n.jobId','j.jobNumber','w.status','w.definition','w.publisherId','u.email','u.emailVerified','p.jobActivityEmail').first();
      const def=workflowDefinitionSchema.safeParse(row?.definition);
      const valid=row&&row.status==='active'&&row.emailVerified&&row.jobActivityEmail!==false&&def.success&&def.data.kind==='routine_booking'&&def.data.notifications?.email&&def.data.recipientId===context.userId&&row.publisherId&&await workflowParticipantsEligible(trx,context,def.data,row.publisherId)&&Date.now()-new Date(queued.createdAt).getTime()<86400000;
      if(!valid){await trx('workflowBookingNotifications').where({id:candidate.id}).update({emailStatus:'skipped'});summary.skipped++;return;}
      const attempts=queued.attempts+1;
      try{await send({id:candidate.id,to:row.email,workspaceId:candidate.workspaceId,jobId:row.jobId,jobNumber:`J-${String(row.jobNumber).padStart(4,'0')}`,event:queued.event,description:bookingNoticeDescription(row.snapshot)});
        await trx('workflowBookingNotifications').where({id:candidate.id}).update({emailStatus:'sent',attempts,sentAt:trx.fn.now()});summary.sent++;
      }catch{const failed=attempts>=5;summary[failed?'failed':'retryPending']++;await trx('workflowBookingNotifications').where({id:candidate.id}).update({emailStatus:failed?'failed':'queued',attempts,nextAttemptAt:new Date(Date.now()+60000*2**(attempts-1))});}
    });
  }catch(error){if(error instanceof WorkspaceSuspendedError)continue;if(!(error instanceof AuthorizationAccessError))throw error;await db('workflowBookingNotifications').where({id:candidate.id,emailStatus:'queued'}).update({emailStatus:'skipped'});summary.skipped++;}
  return summary;
}
