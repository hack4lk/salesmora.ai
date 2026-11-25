import {createHash,randomUUID} from 'node:crypto';
import type {Knex} from 'knex';
import {saveServiceSettingsSchema,serviceSettingsSnapshotSchema,type AuthorizationContext,type PermissionId,type WorkspaceServiceChoice} from '@salesmora/contracts';
import {authorize} from '@salesmora/domain';
import {AuthorizationAccessError,withWorkspaceAuthorization,withCurrentWorkspaceMutation,type WorkspaceIdentity} from '../authorization/store';
export class ServiceSettingsConflict extends Error {}
export class ServiceSettingsInvalid extends Error {}
/** Fixed internal aliases only; current labels never rewrite historical record text. */
export function serviceDisplaySql(alias:'j'|'l') {return `coalesce((SELECT s.name FROM "workspaceServices" s WHERE s."workspaceId"=${alias}."workspaceId" AND s.id=${alias}."serviceId"),${alias}.service)`;}
export async function serviceChoices(trx:Knex.Transaction,workspaceId:string):Promise<WorkspaceServiceChoice[]> {
  return trx('workspaceServices').where({workspaceId}).select('id','service as key','name',trx.raw(`CASE WHEN "archivedAt" IS NULL THEN 'active' ELSE 'archived' END AS status`)).orderBy('name');
}
/** Resolve only explicit identity/key/name references. No fuzzy matching or new catalog entries. */
export async function resolveWorkspaceService(trx:Knex.Transaction,workspaceId:string,reference:string,retained?:{service:string;serviceId?:string|null}) {
  const rows=await serviceChoices(trx,workspaceId),ref=reference.trim();
  if(retained && (reference===retained.service || reference===retained.serviceId))return rows.find(s=>s.id===retained.serviceId)?.key??retained.service;
  if(!ref)return '';
  const byId=rows.find(s=>s.id===ref),byKey=rows.find(s=>s.key===ref);
  const names=rows.filter(s=>s.name.toLowerCase()===ref.toLowerCase());
  const selected=byId??(names.length===1?names[0]:undefined)??byKey;
  if(selected?.id===retained?.serviceId && selected)return selected.key;
  if(!selected||selected.status!=='active')throw new ServiceSettingsInvalid('Choose an active service from this workspace.');
  return selected.key;
}
function permit(context:AuthorizationContext,write=false){if(!authorize(context,{permission:'settings.business.read'}).allowed||write&&!authorize(context,{permission:'settings.business.update'}).allowed)throw new AuthorizationAccessError();}
export async function readServiceSettingsInTransaction(trx:Knex.Transaction,context:AuthorizationContext) {
  permit(context);
  const workspace=await trx('workspaces').where({id:context.workspaceId}).first('servicesVersion');
  // One batched projection; no per-row application queries or repeated authorization.
  const services=await trx('workspaceServices as s').where('s.workspaceId',context.workspaceId).select('s.id','s.service as key','s.name',trx.raw(`CASE WHEN s."archivedAt" IS NULL THEN 'active' ELSE 'archived' END AS status`),
    trx.raw(`(SELECT count(*)::int FROM workflows w WHERE w."workspaceId"=s."workspaceId" AND w."serviceId"=s.id AND w.status='active' AND w."deletedAt" IS NULL) AS "activeWorkflows"`),
    trx.raw(`((SELECT count(*) FROM jobs j WHERE j."workspaceId"=s."workspaceId" AND (j."serviceId"=s.id OR j.service=s.service OR j.service=s.name))+
      (SELECT count(*) FROM leads l WHERE l."workspaceId"=s."workspaceId" AND (l."serviceId"=s.id OR l.service=s.service OR l.service=s.name))+
      (SELECT count(*) FROM workflows w WHERE w."workspaceId"=s."workspaceId" AND w."serviceId"=s.id)+
      (SELECT count(*) FROM "chatProposals" p WHERE p."workspaceId"=s."workspaceId" AND (position(to_json(s.service)::text IN p.payload::text)>0 OR position(to_json(s.name)::text IN p.payload::text)>0 OR position(s.id::text IN p.payload::text)>0)))::int AS "references"`)).orderBy('s.name');
  const facts=(await trx.raw(`SELECT
    (SELECT coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.name,'available',u."suspendedAt" IS NULL AND u."deletionRequestedAt" IS NULL) ORDER BY u.name,u.id),'[]'::jsonb) FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=?) AS members,
    (SELECT coalesce(jsonb_object_agg(x."serviceId",x.people),'{}'::jsonb) FROM (SELECT "serviceId",jsonb_agg("personId" ORDER BY priority,"personId") AS people FROM "serviceQualifiedWorkers" WHERE "workspaceId"=? GROUP BY "serviceId") x) AS "byService"`,[context.workspaceId,context.workspaceId])).rows[0];
  return serviceSettingsSnapshotSchema.parse({workspaceId:context.workspaceId,version:workspace.servicesVersion,canManage:authorize(context,{permission:'settings.business.update'}).allowed,services,qualifications:facts});
}
export async function readServiceSettings(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[]) {
  return withWorkspaceAuthorization(db,identity,enabled,false,(trx,context)=>readServiceSettingsInTransaction(trx,context));
}
export async function saveServiceSettings(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],raw:unknown) {
  const parsed=saveServiceSettingsSchema.safeParse(raw);if(!parsed.success)throw new ServiceSettingsInvalid('Invalid service settings request.');
  const input=parsed.data;if(input.workspaceId!==identity.workspaceId)throw new AuthorizationAccessError();
  return withCurrentWorkspaceMutation(db,identity,enabled,async(trx,context)=>{
    permit(context,true);const current=await readServiceSettingsInTransaction(trx,context),command=input.command;
    const inputHash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const receipt=await trx('serviceSettingsOperations').where({workspaceId:context.workspaceId,requestId:input.requestId}).first();
    if(receipt){if(receipt.actorId!==context.userId||receipt.inputHash!==inputHash||receipt.afterVersion!==current.version)throw new ServiceSettingsConflict();return current;}
    if(command.expectedVersion!==current.version)throw new ServiceSettingsConflict();
    const target='serviceId'in command?current.services.find(s=>s.id===command.serviceId):undefined;
    if(command.action!=='add'&&!target)throw new ServiceSettingsConflict();
    if('name'in command && current.services.some(s=>s.id!==target?.id&&s.name.toLowerCase()===command.name.toLowerCase()))throw new ServiceSettingsInvalid('A service with this name already exists.');
    const query=()=>trx('workspaceServices').where({workspaceId:context.workspaceId,id:target!.id});
    if(command.action==='add'){const id=randomUUID();const existingKey=await trx('workspaceServices').where({workspaceId:context.workspaceId,service:command.name}).first('id');await trx('workspaceServices').insert({workspaceId:context.workspaceId,id,service:existingKey?id:command.name,name:command.name});}
    else if(command.action==='rename')await query().update({name:command.name});
    else if(command.action==='set_workers'){const members=command.workerIds.length?await trx('workspaceMemberships as m').join('users as u','u.id','m.userId').where('m.workspaceId',context.workspaceId).whereIn('u.id',command.workerIds).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt').select('u.id').forShare('u'):[];if(members.length!==command.workerIds.length)throw new ServiceSettingsInvalid('Choose active workers from this workspace.');await trx('serviceQualifiedWorkers').where({workspaceId:context.workspaceId,serviceId:target!.id}).delete();if(command.workerIds.length)await trx('serviceQualifiedWorkers').insert(command.workerIds.map((personId,priority)=>({workspaceId:context.workspaceId,serviceId:target!.id,personId,priority})));}
    else if(command.action==='archive'){if(target!.activeWorkflows)throw new ServiceSettingsInvalid('Pause active workflows before archiving this service.');await query().update({archivedAt:trx.fn.now()});}
    else if(command.action==='restore')await query().update({archivedAt:null});
    else {if(target!.references||target!.activeWorkflows)throw new ServiceSettingsInvalid('This service has been used. Archive it instead.');await query().delete();}
    await trx('workspaces').where({id:context.workspaceId}).update({servicesVersion:current.version+1});
    await trx('serviceSettingsOperations').insert({workspaceId:context.workspaceId,requestId:input.requestId,actorId:context.userId,inputHash,afterVersion:current.version+1,command:JSON.stringify(command)});
    return readServiceSettingsInTransaction(trx,context);
  });
}
