import type {Knex} from 'knex';
import {getWorkspacePlan,workspaceUsagePeriod} from '@salesmora/domain';
import {workspacePlanIdSchema} from '@salesmora/contracts';
import {sandboxBillingEnabled} from './stripe';

export class PlanCapacityError extends Error {
  constructor(public readonly resource:'leads'|'teammates',public readonly limit:number,public readonly resetAt:string|null=null){
    super('Workspace plan capacity reached');
  }
}
async function lockAdmissionWorkspace(trx:Knex.Transaction,workspaceId:string){
  if(!await trx('workspaces').where({id:workspaceId}).whereNull('deletionRequestedAt').forUpdate().first('id'))throw Error('Workspace unavailable');
}
/** Server-owned effective plan; selected checkout plans never grant capacity. */
export async function workspaceEntitlements(db:Knex,workspaceId:string){
  const row=await db('workspaceSubscriptions').where({workspaceId}).first();
  const {rows}=await db.raw('SELECT statement_timestamp() AS now');
  const now=new Date(rows[0].now);
  const paid=row?.status==='active'&&row.paidThrough&&new Date(row.paidThrough)>now;
  const grace=row?.status==='past_due'&&row.recoveryUntil&&new Date(row.recoveryUntil)>now;
  const plan=getWorkspacePlan(paid||grace?workspacePlanIdSchema.parse(row.plan):'free');
  const transition=!!row?.transitionUntil&&new Date(row.transitionUntil)>now;
  return{plan,now,enforced:sandboxBillingEnabled()&&!transition,period:workspaceUsagePeriod(now)};
}
/** Call inside the authorized workspace write transaction, before inserting a new lead. */
export async function assertLeadCapacity(trx:Knex.Transaction,workspaceId:string){
  await lockAdmissionWorkspace(trx,workspaceId);
  const entitlement=await workspaceEntitlements(trx,workspaceId);
  if(!entitlement.enforced)return entitlement.now;
  const count=await trx('workspaceLeadAdmissions').where({workspaceId}).where('createdAt','>=',entitlement.period.start).where('createdAt','<',entitlement.period.end).count('* as count').first();
  if(Number(count?.count??0)>=entitlement.plan.limits.newLeadsPerMonth)throw new PlanCapacityError('leads',entitlement.plan.limits.newLeadsPerMonth,entitlement.period.end.toISOString());
  return entitlement.now;
}
/** Live reservations include queued invitations and unexpired sent links, plus paid setup drafts. */
export async function workspaceSeatUsage(db:Knex,workspaceId:string,now:Date,excludeInvitationId?:string){
  const members=await db('workspaceMemberships').where({workspaceId}).count('* as count').first();
  const invitations=db('workspaceInvitations').where({workspaceId}).where(q=>q.whereIn('status',['queued','pending_verification']).orWhere(s=>s.where({status:'sent'}).where('expiresAt','>',now)));
  if(excludeInvitationId)invitations.whereNot({id:excludeInvitationId});
  const reserved=await invitations.count('* as count').first();
  const billing=await db('workspaceSubscriptions').where({workspaceId}).first('pendingInvitations');
  return Number(members?.count??0)+Number(reserved?.count??0)+(Array.isArray(billing?.pendingInvitations)?billing.pendingInvitations.length:0);
}
/** An accepted invitation converts its reservation; never double-count it as a new seat. */
export async function assertSeatCapacity(trx:Knex.Transaction,workspaceId:string,additional:number,excludeInvitationId?:string){
  await lockAdmissionWorkspace(trx,workspaceId);
  if(!Number.isSafeInteger(additional)||additional<0)throw Error('Invalid seat reservation');
  const entitlement=await workspaceEntitlements(trx,workspaceId);
  if(!entitlement.enforced)return;
  const used=await workspaceSeatUsage(trx,workspaceId,entitlement.now,excludeInvitationId);
  if(used+additional>entitlement.plan.limits.teammates)throw new PlanCapacityError('teammates',entitlement.plan.limits.teammates);
}
