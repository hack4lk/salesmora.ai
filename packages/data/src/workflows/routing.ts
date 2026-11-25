import type { Knex } from "knex";
import { randomUUID } from "node:crypto";
import { routingSelectionSchema, routingPolicySchema, routingOptionsSchema, workflowDefinitionSchema, type AuthorizationContext, type CaptureAssignmentResolution, type WorkspaceRole } from "@salesmora/contracts";
import { canPublishWorkflow, canReceiveWorkflow } from "@salesmora/domain";
import { resolveCaptureAssignment } from "../lead-assignment-settings/store";
import { AuthorizationAccessError, loadWorkspaceAuthorization } from "../authorization/store";
import { WorkflowDraftError } from "./recipients";

export async function routingSource(trx: Knex.Transaction, context: AuthorizationContext, reference: string, exactId?: string) {
  const query = trx("captureSources").where({ workspaceId: context.workspaceId }).whereNot("status", "archived");
  if (exactId) query.where("id", exactId);
  else if (/^[a-f0-9-]{36}$/i.test(reference)) query.where("id", reference);
  else if (["website", "gmail"].includes(reference.toLowerCase())) query.where("type", reference.toLowerCase());
  else query.whereRaw("lower(name) = lower(?)", [reference]);
  const rows = await query.select("id", "name", "approvedVersion").limit(2);
  if (rows.length !== 1) throw new WorkflowDraftError("Which intake source should this use? Use its full name from Lead Capture.");
  const source = rows[0];
  if (!source.approvedVersion) throw new WorkflowDraftError("Publish this intake source before setting up routing.");
  const version = await trx("captureSourceVersions").where({ workspaceId: context.workspaceId, sourceId: source.id, configurationVersion: source.approvedVersion }).first("configuration");
  if (!version?.configuration?.workflow?.assignment) throw new WorkflowDraftError("This intake source is not ready for routing.");
  const assignment = await resolveCaptureAssignment(trx, context.workspaceId, version.configuration.workflow.assignment);
  if (!assignment.ready) throw new WorkflowDraftError("Resolve the intake source assignment settings before setting up routing.");
  if (assignment.assigneeId) throw new WorkflowDraftError("This source already assigns new leads. Routing only assigns leads without an owner; review the existing source or default assignment first.");
  return { id: source.id, name: source.name } as { id: string; name: string };
}

export async function assertRoutingAvailable(trx: Knex.Transaction, workspaceId: string, sourceId: string, exceptId?: string) {
  const existing = await trx("workflows").where({ workspaceId, status: "active" }).whereNull("deletedAt")
    .whereRaw("definition->>'kind' = 'lead_routing' AND definition->>'sourceId' = ?", [sourceId])
    .modify(query => { if (exceptId) query.whereNot("id", exceptId); }).first("id");
  if (existing) throw new WorkflowDraftError("This source already has an active routing workflow. Edit or pause that workflow first.");
}

type Route = { id: string; version: number; publisherId: string; sourceId: string; notifications: { inApp: boolean; email: boolean }; details?: {strategy:string;postalCode?:string;coverageVersion?:number;openLeads?:number}; advanceCursor?:boolean; clearIssue?:boolean };
export type RoutingAssignment = CaptureAssignmentResolution & { routing?: Route; routingIssue?: string; routingIssueWorkflow?:{id:string;version:number} };
const routingPermissions = ["workflows.read", "workflows.publish", "workflows.manage", "assistant.use", "leads.read", "leads.assign", "leadCapture.read"] as const;

/** One indexed lookup only when normal source/default assignment leaves a new lead unassigned. */
export async function resolveLeadRouting(trx: Knex.Transaction, workspaceId: string, sourceId: string,
  assignment: CaptureAssignmentResolution, context?: AuthorizationContext, options: {commit?:boolean;postalCode?:string;countryCode?:string} = {}): Promise<RoutingAssignment> {
  if (!assignment.ready || assignment.assigneeId) return assignment;
  const row = await trx("workflows").where({ workspaceId, status: "active" }).whereNull("deletedAt")
    .whereRaw("definition->>'kind' = 'lead_routing' AND definition->>'sourceId' = ?", [sourceId]).first("id", "version", "publisherId", "definition", "executionIssue", 'routingCursor');
  if (!row) return assignment;
  const definition = workflowDefinitionSchema.safeParse(row.definition);
  if (!definition.success || definition.data.kind !== "lead_routing") return assignment;
  const rule = definition.data;
  if (rule.routing) {
    const route: Route = { id:row.id, version:row.version, publisherId:row.publisherId, sourceId, notifications:rule.notifications };
    // Reviews bind the policy/version, never a transient candidate or workload count.
    if (!options.commit) return {...assignment,routing:route};
    const fail=async(issue:string)=>({...assignment,routingIssue:issue,routingIssueWorkflow:{id:row.id,version:row.version}});
    if(!row.publisherId)return fail('Routing needs a current workflow owner.');
    const people: {id:string;role:WorkspaceRole;coverageVersion:number|null;covers:boolean}[]=await trx('workspaceMemberships as m').join('users as u','u.id','m.userId')
      .leftJoin('workspaceMemberCoverage as c',q=>q.on('c.workspaceId','m.workspaceId').andOn('c.personId','m.userId'))
      .where('m.workspaceId',workspaceId).whereIn('u.id',[row.publisherId,...rule.routing.members.map(member=>member.id)])
      .whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt').select('u.id','m.role','c.version as coverageVersion',trx.raw(`EXISTS(SELECT 1 FROM "workspaceMemberPostalCodes" p WHERE p."workspaceId"=m."workspaceId" AND p."personId"=m."userId" AND p."countryCode"=? AND p."postalCode"=?) AS covers`,[options.countryCode??'',options.postalCode??''])).forShare('u');
    const publisher=people.find(person=>person.id===row.publisherId);if(!publisher)return fail('Routing needs a current workflow owner.');
    let authority:AuthorizationContext;
    try{authority=context??await loadWorkspaceAuthorization(trx,{workspaceId,userId:publisher.id},routingPermissions);}catch(error){if(error instanceof AuthorizationAccessError)return fail('Routing needs a workflow owner with current lead-assignment access.');throw error;}
    const forPerson=(person:typeof publisher)=>({...authority,userId:person.id,membership:{workspaceId,userId:person.id,role:person.role}});
    if(!canPublishWorkflow(forPerson(publisher),'lead_routing'))return fail('Routing needs a workflow owner with current lead-assignment access.');
    if(rule.routing.matchWorkZipCodes&&(!options.postalCode||options.countryCode!=='US'))return fail('Routing left a lead unassigned because its US ZIP code is missing.');
    const eligible=rule.routing.members.map(member=>people.find(person=>person.id===member.id)).filter((person):person is typeof publisher=>!!person&&canReceiveWorkflow(forPerson(person),'lead_routing')&&(!rule.routing!.matchWorkZipCodes||person.covers));
    if(!eligible.length)return fail('Routing left a lead unassigned because no selected teammate currently qualifies for its ZIP code or lead access.');
    const order=rule.routing.members.map(member=>member.id),cursor=order.indexOf(row.routingCursor),rank=(id:string)=>(order.indexOf(id)-cursor-1+order.length)%order.length;
    const counts=new Map<string,number>();
    if(rule.routing.strategy==='fewest_open_leads'){
      const rows=await trx('leads').where({workspaceId}).whereNull('archivedAt').whereIn('ownerId',eligible.map(person=>person.id)).whereIn('stage',['new','contacted','estimate-sent']).groupBy('ownerId').select('ownerId').count('* as count');
      for(const row of rows)counts.set(String(row.ownerId),Number(row.count));
    }
    eligible.sort((a,b)=>(counts.get(a.id)??0)-(counts.get(b.id)??0)||rank(a.id)-rank(b.id));
    const selected=eligible[0];
    return {...assignment,assigneeId:selected.id,routing:{...route,advanceCursor:true,clearIssue:!!row.executionIssue,details:{strategy:rule.routing.strategy,...(options.postalCode?{postalCode:options.postalCode}:{}),coverageVersion:selected.coverageVersion??0,...(rule.routing.strategy==='fewest_open_leads'?{openLeads:counts.get(selected.id)??0}:{})}}};
  }
  if(!rule.recipientId)return assignment;
  const unavailable = async () => {
    const issue = "Routing could not assign a new lead. Check the workflow owner’s permissions and selected teammate.";
    if (row.executionIssue !== issue) await trx("workflows").where({ workspaceId, id: row.id }).update({ executionIssue: issue });
    return assignment;
  };
  if (!row.publisherId) return unavailable();
  const people = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", workspaceId).whereIn("u.id", [row.publisherId, rule.recipientId!])
    .whereNull("u.suspendedAt").whereNull("u.deletionRequestedAt").select("u.id", "m.role");
  const publisher = people.find(person => person.id === row.publisherId), assignee = people.find(person => person.id === rule.recipientId);
  if (!publisher || !assignee) return unavailable();
  let authority: AuthorizationContext;
  try {
    authority = context ?? await loadWorkspaceAuthorization(trx, { workspaceId, userId: publisher.id }, routingPermissions);
  } catch (error) { if (error instanceof AuthorizationAccessError) return unavailable(); throw error; }
  const forPerson = (person: typeof publisher) => ({ ...authority, userId: person.id, membership: { workspaceId, userId: person.id, role: person.role } });
  if (!canPublishWorkflow(forPerson(publisher), "lead_routing") || !canReceiveWorkflow(forPerson(assignee), "lead_routing")) return unavailable();
  if (row.executionIssue) await trx("workflows").where({ workspaceId, id: row.id }).update({ executionIssue: null });
  return { ...assignment, assigneeId: rule.recipientId??null, routing: { id: row.id, version: row.version, publisherId: publisher.id, sourceId, notifications: rule.notifications } };
}

/** Called exactly once for a newly admitted lead, inside the existing source transaction. */
export async function recordLeadRouting(trx: Knex.Transaction, workspaceId: string, leadId: string, assignment: RoutingAssignment) {
  if(assignment.routingIssue)await trx('leadActivity').insert({id:randomUUID(),workspaceId,leadId,actorId:null,actorType:'system',actorName:'SalesMora',createdAt:trx.fn.now(),type:'note',changes:JSON.stringify({body:assignment.routingIssue})});
  if(assignment.routingIssue&&assignment.routingIssueWorkflow)await trx('workflows').where({workspaceId,...assignment.routingIssueWorkflow}).update({executionIssue:assignment.routingIssue});
  const route = assignment.routing;
  if (!route || !assignment.assigneeId) return;
  const [receipt] = await trx("workflowRoutingReceipts").insert({ workspaceId, leadId, workflowId: route.id, version: route.version,
    assigneeId: assignment.assigneeId, sourceId: route.sourceId, routingDetails:route.details?JSON.stringify(route.details):null }).onConflict(["workspaceId", "leadId"]).ignore().returning("leadId");
  if (!receipt) return;
  if(route.advanceCursor)await trx('workflows').where({workspaceId,id:route.id,version:route.version}).update({routingCursor:assignment.assigneeId,...(route.clearIssue?{executionIssue:null}:{})});
  const actors=await trx('users').whereIn('id',[assignment.assigneeId,route.publisherId]).select('id','name');
  const assignee=actors.find(person=>person.id===assignment.assigneeId)!,publisher=actors.find(person=>person.id===route.publisherId)!;
  const id = randomUUID();
  await trx("leadActivity").insert({ id, workspaceId, leadId, actorId: route.publisherId, actorName: publisher.name, actorType: "assistant-confirmed", type: "assigned", createdAt: trx.fn.now(),
    changes: JSON.stringify({ from: null, to: assignee.name, ownerId: assignment.assigneeId, toVersion: 1, workflowId: route.id, workflowVersion: route.version }) });
  if (route.notifications.inApp || route.notifications.email) {
    await trx("assignmentNotifications").insert({ id, workspaceId, leadId, userId: assignment.assigneeId, inApp: route.notifications.inApp });
    if (route.notifications.email) await trx("assignmentEmailOutbox").insert({ id, workflowRouting: true });
  }
}

/** Bounded setup read, one current authority snapshot and no per-person authentication. */
export async function routingOptions(trx:Knex.Transaction,context:AuthorizationContext){
  if(!canPublishWorkflow(context,'lead_routing'))throw new AuthorizationAccessError();
  const people=await trx('workspaceMemberships as m').join('users as u','u.id','m.userId').where('m.workspaceId',context.workspaceId).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt')
    .select('u.id','u.name','m.role',trx.raw(`ARRAY(SELECT "postalCode" FROM "workspaceMemberPostalCodes" p WHERE p."workspaceId"=m."workspaceId" AND p."personId"=m."userId" AND p."countryCode"='US' ORDER BY "postalCode") AS "workZipCodes"`)).orderBy('u.name').orderBy('u.id').limit(501);
  if(people.length>500)throw new WorkflowDraftError('Routing setup supports up to 500 current workspace members.');
  const sources=await trx('captureSources as s').join('captureSourceVersions as v',q=>q.on('v.workspaceId','s.workspaceId').andOn('v.sourceId','s.id').andOn('v.configurationVersion','s.approvedVersion'))
    .where('s.workspaceId',context.workspaceId).whereNot('s.status','archived').select('s.id','s.name','v.configuration').orderBy('s.name').limit(501);
  if(sources.length>500)throw new WorkflowDraftError('Routing setup supports up to 500 intake sources.');
  return routingOptionsSchema.parse({members:people.filter(person=>canReceiveWorkflow({...context,userId:person.id,membership:{workspaceId:context.workspaceId,userId:person.id,role:person.role}},'lead_routing')),sources:sources.map(source=>({id:source.id,name:source.name,collectsPostalCode:source.configuration.postalCountryCode==='US'&&source.configuration.fields?.some((field:{key:string;required:boolean})=>field.key==='postalCode'&&field.required)}))});
}
export async function routingPolicy(trx:Knex.Transaction,context:AuthorizationContext,sourceId:string,selection:unknown,suppliedOptions?:Awaited<ReturnType<typeof routingOptions>>){
  const input=routingSelectionSchema.parse(selection),options=suppliedOptions??await routingOptions(trx,context),members=input.memberIds.map(id=>options.members.find(person=>person.id===id));
  if(members.some(member=>!member))throw new WorkflowDraftError('Choose current teammates who can access their assigned leads.');
  if (input.matchWorkZipCodes) {
    if (!options.sources.find(source => source.id === sourceId)?.collectsPostalCode)
      throw new WorkflowDraftError('Make the US ZIP field required on the published intake source before using ZIP routing.');
    const missingCoverage = members.filter(member => !member!.workZipCodes.length).map(member => member!.name);
    if (missingCoverage.length) throw new WorkflowDraftError(`Add work ZIP codes for ${missingCoverage.slice(0, 3).join(', ')}${missingCoverage.length > 3 ? ` and ${missingCoverage.length - 3} others` : ''} in Settings → Team before creating this ZIP-matching workflow.`);
  }
  return routingPolicySchema.parse({strategy:input.strategy,matchWorkZipCodes:input.matchWorkZipCodes,members:members.map(member=>({id:member!.id,name:member!.name}))});
}
export async function routingPolicyFromNames(trx:Knex.Transaction,context:AuthorizationContext,sourceId:string,input:{strategy:'one_teammate'|'round_robin'|'fewest_open_leads';members:string[];matchWorkZipCodes:boolean}){
  const options=await routingOptions(trx,context),memberIds=input.members.map(reference=>{const matches=options.members.filter(person=>person.id===reference||reference.toLowerCase()==='me'&&person.id===context.userId||person.name.toLowerCase()===reference.toLowerCase());if(matches.length!==1)throw new WorkflowDraftError('Which teammates should receive these leads? Use their full names.');return matches[0].id;});
  return routingPolicy(trx,context,sourceId,{strategy:input.strategy,memberIds,matchWorkZipCodes:input.matchWorkZipCodes},options);
}
