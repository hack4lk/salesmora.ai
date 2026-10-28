import { notifyJobCreated, notifyJobStatusChanged, notifyJobAssignmentChanged, notifyJobDeadlineChanged } from '../notifications/jobs';
import { resolveReviewedJobDeadline } from "./deadline";
import { notifyVisitChange } from "../notifications/visits";
import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  createJobSchema, defaultDeadlineRuleSchema, jobMutationSchema, jobQuerySchema, jobIdSchema,
  type JobMember, type JobView, type JobListResult, type JobDetailResult, type JobActivityRecord, type AuthorizationContext, type CreateJobInput, type JobMutation, type JobQuery, type JobRecord, type PermissionId,
} from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope, isClosedJob, scheduledJobStatus, validateJobTransition } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";

import { assertIndependentCalendarSchedule, synchronizeCalendarRecord } from "../calendar/sync";

export class JobConflictError extends Error {
  constructor(message = "This job changed. Reload its current details before trying again.") { super(message); }
}
export class JobValidationError extends Error {}
type JobRow = Omit<JobRecord,"number"|"createdAt"|"updatedAt"> & {workspaceId:string;jobNumber:number;createdAt:Date;updatedAt:Date};
type Source = "ui" | "assistant-confirmed";
function resource(row: JobRow) {
  return {kind:"job" as const,id:row.id,workspaceId:row.workspaceId,ownerId:row.primaryOwnerId,teamUserIds:row.teamUserIds};
}
function permit(context:AuthorizationContext, permission:PermissionId, row?:JobRow) {
  if(!authorize(context,{permission,...(row?{resource:resource(row)}:{})}).allowed) throw new AuthorizationAccessError();
}
/** Apply current read scope in SQL before sorting, pagination, counts or record lookup. */
function scoped(trx:Knex.Transaction, context:AuthorizationContext) {
  const scope=resolveAuthorizedCollectionScope(context,"jobs.read");
  if(!scope.allowed || !["workspace","assigned"].includes(scope.scope)) throw new AuthorizationAccessError();
  const query=trx("jobs as j").where("j.workspaceId",context.workspaceId);
  if(scope.scope==="assigned") query.andWhere(q=>q.where("j.primaryOwnerId",context.userId).orWhereExists(
    trx("jobTeamMembers as jt").select(trx.raw("1")).whereRaw('jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id').where("jt.userId",context.userId)
  ));
  return query;
}
const teamSelect = `(SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "teamUserIds"`;
const dateSelect = `to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate", to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline"`;
async function record(trx:Knex.Transaction,context:AuthorizationContext,id:string,lock=false):Promise<JobRow> {
  const q=scoped(trx,context).where("j.id",id).select("j.*",trx.raw(teamSelect),trx.raw(dateSelect));
  const row=await (lock?q.forUpdate("j"):q).first();
  if(!row) throw new AuthorizationAccessError();
  return row as JobRow;
}
function dto(row:JobRow):JobRecord {
  return {id:row.id,number:`J-${String(row.jobNumber).padStart(4,"0")}`,customerId:row.customerId,customerName:row.customerName,sourceLeadId:row.sourceLeadId,
    title:row.title,service:row.service,location:row.location,description:row.description,status:row.status,
    primaryOwnerId:row.primaryOwnerId,teamUserIds:row.teamUserIds,scheduledDate:row.scheduledDate,arrivalWindow:row.arrivalWindow,
    completionDeadline:row.completionDeadline,waitingReason:row.waitingReason,version:row.version,createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString()};
}
async function validTeam(trx:Knex.Transaction,context:AuthorizationContext,owner:string|null,team:string[]) {
  if(owner && team.includes(owner)) throw new JobValidationError("The primary owner is already on the job team.");
  const ids=[...(owner?[owner]:[]),...team];
  if(!ids.length)return;
  const rows=await trx("workspaceMemberships as m").join("users as u","u.id","m.userId").where("m.workspaceId",context.workspaceId).whereIn("m.userId",ids).whereNull("u.deletionRequestedAt").select("m.userId");
  if(rows.length!==ids.length)throw new JobValidationError("Choose current workspace teammates.");
}
async function receipt(trx:Knex.Transaction,context:AuthorizationContext,id:string,hash:string) {
  const previous=await trx("jobOperations").where({workspaceId:context.workspaceId,submissionId:id}).first();
  if(previous && (previous.actorId!==context.userId || previous.inputHash!==hash)) throw new JobConflictError();
  return previous ? {jobId:previous.jobId as string,version:previous.version as number} : undefined;
}
async function activity(trx:Knex.Transaction,context:AuthorizationContext,jobId:string,submissionId:string,version:number,hash:string,type:string,changes:unknown,source:Source,createdAt?:Date) {
  const actor=await trx("users").where({id:context.userId}).first("name");
  await trx("jobActivity").insert({id:randomUUID(),workspaceId:context.workspaceId,jobId,actorId:context.userId,actorName:actor.name,source,type,changes:JSON.stringify(changes),...(createdAt?{createdAt}:{})});
  await trx("jobOperations").insert({workspaceId:context.workspaceId,jobId,submissionId,actorId:context.userId,inputHash:hash,version});
}
const hashInput=(input:unknown)=>createHash("sha256").update(JSON.stringify(input)).digest("hex");

export async function createJobInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  raw: CreateJobInput,
  options: { source?: Source; acceptedEstimateId?: string; requireRead?: boolean } = {},
) {
  const input = createJobSchema.parse(raw);
  if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  if (options.acceptedEstimateId && !input.sourceLeadId) {
    throw new JobValidationError("An estimate-linked job must retain its source lead.");
  }

  permit(context, "jobs.create");
  const assignmentScope = resolveAuthorizedCollectionScope(context, "jobs.read");
  const fake = {
    id: input.submissionId,
    workspaceId: context.workspaceId,
    primaryOwnerId: input.primaryOwnerId,
    teamUserIds: input.teamUserIds,
  } as JobRow;
  permit(context, "jobs.assign", fake);
  if (!assignmentScope.allowed) throw new AuthorizationAccessError();

  if (input.scheduledDate || (input.deadlineIntent ? input.deadlineIntent.mode !== "workspace" : input.completionDeadline)) permit(context, "jobs.schedule.update", fake);
  if (!input.deadlineIntent && !input.completionDeadline && !authorize(context, { permission: "jobs.schedule.update", resource: resource(fake) }).allowed) {
    const defaultRow = await trx("jobNotificationSettings").where({ workspaceId: context.workspaceId, section: "deadline" }).first("values");
    if (defaultDeadlineRuleSchema.parse(defaultRow?.values ?? { mode: "unset" }).mode === "relative") throw new AuthorizationAccessError();
  }
  const hash = hashInput(input);
  const previous = await receipt(trx, context, input.submissionId, hash);
  if (previous) {
    await record(trx, context, previous.jobId);
    return previous;
  }

  const customer = await trx("customers")
    .where({ id: input.customerId, workspaceId: context.workspaceId })
    .whereNull("archivedAt")
    .first("id", "name");
  if (!customer || !authorize(context, {
    permission: "customers.read",
    resource: { kind: "customer", id: customer.id, workspaceId: context.workspaceId, related: [] },
  }).allowed) throw new AuthorizationAccessError();

  let sourceLeadNumber: string | null = null;
  if (input.sourceLeadId) {
    const lead = await trx("leads")
      .where({ id: input.sourceLeadId, workspaceId: context.workspaceId })
      .whereNull("archivedAt")
      .first();
    if (!lead || !authorize(context, {
      permission: "leads.read",
      resource: { kind: "lead", id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId },
    }).allowed) throw new AuthorizationAccessError();
    if (lead.customerId && lead.customerId !== customer.id) {
      throw new JobValidationError("Choose the customer linked to the source lead.");
    }
    if (await trx("jobs").where({ workspaceId: context.workspaceId, sourceLeadId: lead.id }).first("id")) {
      throw new JobConflictError("This lead already has a job.");
    }
    sourceLeadNumber = `LD-${String(lead.leadNumber).padStart(4, "0")}`;
  }

  await validTeam(trx, context, input.primaryOwnerId, input.teamUserIds);
  const { completionDeadline, createdAt } = await resolveReviewedJobDeadline(trx, context, input);
  // The reviewed workspace rule is a creation policy; manual overrides require scheduling authority above.
  const id = randomUUID();
  const { submissionId, teamUserIds, deadlineIntent, deadlinePreview, ...values } = input;
  await trx("jobs").insert({
    ...values,
    completionDeadline,
    ...(createdAt ? { createdAt, updatedAt: createdAt } : {}),
    id,
    acceptedEstimateId: options.acceptedEstimateId ?? null,
    customerName: customer.name,
    sourceLeadNumber,
    createdBy: context.userId,
    status: input.scheduledDate ? "scheduled" : "needs-scheduling",
  });
  if (teamUserIds.length) {
    await trx("jobTeamMembers").insert(teamUserIds.map((userId) => ({
      workspaceId: context.workspaceId, jobId: id, userId,
    })));
  }
  await synchronizeCalendarRecord(trx, context.workspaceId, "job", id);
  await activity(
    trx, context, id, submissionId, 1, hash, "created",
    {
      status: input.scheduledDate ? "scheduled" : "needs-scheduling",
      primaryOwnerId: input.primaryOwnerId,
      teamUserIds,
      scheduledDate: input.scheduledDate,
      arrivalWindow: input.arrivalWindow,
      completionDeadline,
      ...(deadlineIntent ? { deadlineIntent, deadlinePreview } : {}),
    },
    options.source ?? "ui",
    createdAt,
  );
  await notifyJobCreated(trx, context, id, submissionId);
  if (options.requireRead) await record(trx, context, id);
  return { jobId: id, version: 1 };
}

export async function createJob(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: CreateJobInput,
  source: Source = "ui",
) {
  const input = createJobSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    createJobInTransaction(trx, context, input, { source }),
  );
}

async function membersFor(trx: Knex.Transaction, context: AuthorizationContext, ids?: string[]): Promise<JobMember[]> {
  const query = trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt");
  if (ids) query.whereIn("u.id", ids);
  return query.select("u.id", "u.name", "m.role").orderBy("u.name").orderBy("u.id");
}
function view(row: JobRow, context: AuthorizationContext, members: JobMember[]): JobView {
  const allowed = (permission: PermissionId) => authorize(context, { permission, resource: resource(row) }).allowed;
  return { ...dto(row), ownerName: members.find(m => m.id === row.primaryOwnerId)?.name ?? (row.primaryOwnerId ? "Former teammate" : "Unassigned"),
    teamNames: row.teamUserIds.map(id => members.find(m => m.id === id)?.name ?? "Former teammate"), nextStep: "",
    capabilities: { status: allowed("jobs.status.update"), complete: allowed("jobs.complete"), cancel: allowed("jobs.cancel"),
      reopen: allowed("jobs.reopen"), schedule: allowed("jobs.schedule.update"), assign: allowed("jobs.assign"), note: allowed("jobs.progress.create"),
      edit: allowed("jobs.update"), files: allowed("jobs.progress.create"), removeFiles: allowed("jobs.progress.create") } };
}
export async function readJobs(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: JobQuery): Promise<JobListResult> {
  const input = jobQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const workspace = await trx("workspaces").where({ id: context.workspaceId }).first("timezone");
    // All relative dates use the workspace timezone and the same transaction clock.
    const { today } = (await trx.raw(`select to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') as today`, [workspace.timezone])).rows[0];
    const metricsRow = await scoped(trx, context).whereNotIn("j.status", ["completed", "canceled"]).select(trx.raw(
      `count(*)::int as active, count(*) filter (where j."completionDeadline" < ?::date)::int as overdue,
       count(*) filter (where j.status = 'waiting')::int as waiting, count(*) filter (where j."primaryOwnerId" is null)::int as unassigned`, [today])).first();
    const facets = await scoped(trx, context).distinct("j.customerName", "j.service");
    const canAssign = authorize(context, { permission: "jobs.assign", resource: { kind: "job", id: context.workspaceId, workspaceId: context.workspaceId, ownerId: context.userId, teamUserIds: [] } }).allowed;
    const visibleIds = await scoped(trx, context).select("j.primaryOwnerId", trx.raw(teamSelect));
    const participantIds = [...new Set<string>(visibleIds.flatMap(r => [r.primaryOwnerId, ...r.teamUserIds]).filter(Boolean))];
    const members = await membersFor(trx, context, canAssign ? undefined : participantIds);
    const canReadCustomers = resolveAuthorizedCollectionScope(context, "customers.read");
    const customers: { id: string; name: string }[] = canReadCustomers.allowed && canReadCustomers.scope === "workspace"
      ? await trx("customers").where("workspaceId", context.workspaceId).whereNull("archivedAt").select("id", "name").orderBy("name").orderBy("id") : [];
    const base = scoped(trx, context);
    if (input.closed) base.whereIn("j.status", ["completed", "canceled"]); else base.whereNotIn("j.status", ["completed", "canceled"]);
    if (input.status) base.where("j.status", input.status);
    if (input.ownerId) base.where("j.primaryOwnerId", input.ownerId);
    if (input.unassigned) base.whereNull("j.primaryOwnerId");
    if (input.customerId) base.where("j.customerId", input.customerId);
    if (input.customerName) base.where("j.customerName", input.customerName);
    if (input.service) base.where("j.service", input.service);
    if (input.createdAfter) base.whereRaw(`(j."createdAt" AT TIME ZONE ?)::date >= ?::date`, [workspace.timezone, input.createdAfter]);
    if (input.mine) base.andWhere(q => q.where("j.primaryOwnerId", context.userId).orWhereExists(
      trx("jobTeamMembers as jt").select(trx.raw("1")).whereRaw('jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id').where("jt.userId", context.userId)));
    if (input.deadline === "unset") base.whereNull("j.completionDeadline");
    if (input.deadline === "overdue") base.where("j.completionDeadline", "<", today);
    if (input.deadline === "upcoming") base.whereRaw(`j."completionDeadline" between ?::date and ?::date + 7`, [today, today]);
    if (input.q) { const q = `%${input.q.replace(/[\\%_]/g, "\\$&")}%`; base.andWhere(b => b.whereILike("j.title", q).orWhereILike("j.customerName", q).orWhereILike("j.service", q).orWhereRaw(`('J-' || lpad(j."jobNumber"::text,4,'0')) ILIKE ?`, [q])); }
    const total = Number((await base.clone().count({ n: "j.id" }).first())?.n ?? 0);
    const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
    const sortColumn = input.sort === "number" ? "j.jobNumber" : input.sort === "ownerName" ? "ownerSort.name" : `j.${input.sort}`;
    const query = base.clone();
    if (input.sort === "ownerName") query.leftJoin("users as ownerSort", "ownerSort.id", "j.primaryOwnerId");
    const rows: JobRow[] = await query.select("j.*", trx.raw(teamSelect), trx.raw(dateSelect)).orderBy(sortColumn, input.direction, "last").orderBy("j.id").limit(input.pageSize).offset((page - 1) * input.pageSize);
    return { rows: rows.map(r => view(r, context, members)), total, page, pageSize: input.pageSize, timezone: workspace.timezone, today,
      metrics: { active: Number(metricsRow.active), overdue: Number(metricsRow.overdue), waiting: Number(metricsRow.waiting), unassigned: Number(metricsRow.unassigned) },
      options: { members, customers, customerNames: [...new Set<string>(facets.map(f => f.customerName))].sort(), services: [...new Set<string>(facets.map(f => f.service).filter(Boolean))].sort() },
      canCreate: canAssign && authorize(context, { permission: "jobs.create" }).allowed && canReadCustomers.allowed && canReadCustomers.scope === "workspace",
      canScheduleCreation: authorize(context, { permission: "jobs.schedule.update", resource: { kind: "job", id: context.workspaceId, workspaceId: context.workspaceId, ownerId: context.userId, teamUserIds: [] } }).allowed };
  });
}
export async function readJob(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], id: string, page = 1): Promise<JobDetailResult> {
  id = jobIdSchema.parse(id);
  if (!Number.isInteger(page) || page < 1 || page > 100000) throw new JobValidationError("Invalid activity page.");
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row = await record(trx, context, id);
    const query = trx("jobActivity").where({ workspaceId: context.workspaceId, jobId: id });
    const total = Number((await query.clone().count({ n: "id" }).first())?.n ?? 0);
    const activityPage = Math.min(page, Math.max(1, Math.ceil(total / 20)));
    const entries = await query.clone().select("id", "actorName", "source", "type", "changes", "createdAt").orderBy("createdAt", "desc").orderBy("id", "desc").limit(20).offset((activityPage - 1) * 20);
    const members = await membersFor(trx, context, [row.primaryOwnerId, ...row.teamUserIds].filter((id): id is string => !!id));
    let canOpenCustomer = false, canOpenLead = false;
    if (row.customerId) canOpenCustomer = authorize(context, { permission: "customers.read", resource: { kind: "customer", id: row.customerId, workspaceId: context.workspaceId, related: [{ kind: "job", id: row.id, workspaceId: context.workspaceId, ownerId: row.primaryOwnerId, teamUserIds: row.teamUserIds }] } }).allowed;
    if (row.sourceLeadId) {
      const lead = await trx("leads").where({ workspaceId: context.workspaceId, id: row.sourceLeadId }).first("ownerId");
      canOpenLead = !!lead && authorize(context, { permission: "leads.read", resource: { kind: "lead", id: row.sourceLeadId, workspaceId: context.workspaceId, ownerId: lead.ownerId } }).allowed;
    }
    return { job: view(row, context, members), activity: entries.map(e => ({ ...e, changes: e.changes as Record<string, unknown>, createdAt: e.createdAt.toISOString() })) as JobActivityRecord[], activityTotal: total, activityPage, canOpenCustomer, canOpenLead };
  });
}

export async function mutateJob(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],raw:unknown,source:Source="ui") {
  const input=jobMutationSchema.parse(raw);
  if(input.workspaceId!==identity.workspaceId)throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db,identity,enabled,true,(trx,context)=>mutateJobInTransaction(trx,context,input,source));
}
/** Confirmed assistant actions and future Calendar/Jobs controls must call this same transaction service. */
export async function mutateJobInTransaction(trx:Knex.Transaction,context:AuthorizationContext,raw:JobMutation,source:Source="ui") {
  const input=jobMutationSchema.parse(raw);
  if(input.workspaceId!==context.workspaceId)throw new AuthorizationAccessError();
  const row=await record(trx,context,input.jobId,true);
  const actionPermission:PermissionId=input.action==="note"?"jobs.progress.create":input.action==="assign"?"jobs.assign":input.action==="edit"?"jobs.update":input.action!=="status"?"jobs.schedule.update":input.reopenDeadline!==undefined?"jobs.reopen":input.to==="completed"?"jobs.complete":input.to==="canceled"?"jobs.cancel":"jobs.status.update";
  permit(context,actionPermission,row);
  const hash=hashInput(input),previous=await receipt(trx,context,input.submissionId,hash);
  if(previous){if(previous.jobId!==row.id)throw new JobConflictError();return previous;}
  if(input.action!=="note"&&row.version!==input.expectedVersion)throw new JobConflictError();
  if(isClosedJob(row.status)&&input.action!=="status")throw new JobValidationError("Reopen this job before making changes.");
  const patch:Record<string,unknown>={version:row.version+1,updatedAt:trx.fn.now(),lastActivityAt:trx.fn.now()};
  let changes:unknown;
  if(input.action==="status"){
    validateJobTransition(row,input);
    Object.assign(patch,{status:input.to,waitingReason:input.to==="waiting"?input.waitingReason:null});
    if(isClosedJob(row.status))patch.completionDeadline=input.reopenDeadline;
    changes={from:row.status,to:input.to,waitingReason:input.waitingReason,cancellationReason:input.cancellationReason,note:input.note,...(isClosedJob(row.status)?{previousDeadline:row.completionDeadline,completionDeadline:input.reopenDeadline}:{} )};
  }else if(input.action==="schedule"){
    await assertIndependentCalendarSchedule(trx, context.workspaceId, "job", row.id);
    Object.assign(patch,{scheduledDate:input.scheduledDate,arrivalWindow:input.arrivalWindow,status:scheduledJobStatus(row.status,input.scheduledDate)});
    changes={from:{scheduledDate:row.scheduledDate,arrivalWindow:row.arrivalWindow,status:row.status},to:{scheduledDate:input.scheduledDate,arrivalWindow:input.arrivalWindow,status:patch.status}};
  }else if(input.action==="deadline"){
    patch.completionDeadline=input.completionDeadline;changes={from:row.completionDeadline,to:input.completionDeadline};
  }else if(input.action==="edit"){
    Object.assign(patch,{title:input.title,service:input.service,location:input.location,description:input.description});
    changes={from:{title:row.title,service:row.service,location:row.location,description:row.description},to:{title:input.title,service:input.service,location:input.location,description:input.description}};
  }else if(input.action==="assign"){
    if(row.primaryOwnerId!==input.primaryOwnerId && row.primaryOwnerId && input.teamUserIds.includes(row.primaryOwnerId))throw new JobValidationError("Remove the previous primary owner from the team; add them back explicitly in a later change if needed.");
    await validTeam(trx,context,input.primaryOwnerId,input.teamUserIds);
    patch.primaryOwnerId=input.primaryOwnerId;
    changes={from:{primaryOwnerId:row.primaryOwnerId,teamUserIds:row.teamUserIds},to:{primaryOwnerId:input.primaryOwnerId,teamUserIds:input.teamUserIds}};
    await trx("jobTeamMembers").where({workspaceId:context.workspaceId,jobId:row.id}).delete();
    if(input.teamUserIds.length)await trx("jobTeamMembers").insert(input.teamUserIds.map(userId=>({workspaceId:context.workspaceId,jobId:row.id,userId})));
  }else changes={body:input.body};
  await trx("jobs").where({workspaceId:context.workspaceId,id:row.id}).update(patch);
  await synchronizeCalendarRecord(trx, context.workspaceId, "job", row.id);
  if (input.action === "schedule") await notifyVisitChange(trx, context, input.submissionId, !input.scheduledDate ? "cleared" : row.scheduledDate ? "rescheduled" : "scheduled", [{ type: "job", id: row.id }], { scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow }, { scheduledDate: input.scheduledDate, arrivalWindow: input.arrivalWindow });
  await activity(trx,context,row.id,input.submissionId,row.version+1,hash,input.action,changes,source);
  if (input.action === "status") await notifyJobStatusChanged(trx, context, row.id, input.submissionId, row.status, input.to);
  if (input.action === "deadline") await notifyJobDeadlineChanged(trx, context, row.id, input.submissionId, row.completionDeadline, input.completionDeadline);
  if (input.action === "status" && input.reopenDeadline !== undefined) await notifyJobDeadlineChanged(trx, context, row.id, input.submissionId, row.completionDeadline, input.reopenDeadline);
  if (input.action === "assign") await notifyJobAssignmentChanged(trx, context, row.id, input.submissionId, row, input);
  return {jobId:row.id,version:row.version+1};
}

/**
 * Get messages for a job, ordered by newest first
/**
 * Get messages for a job, ordered by newest first
 */
export async function getJobMessages(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], jobId: string, limit: number = 100): Promise<Array<{id: string; authorId: string; author: string; at: string; text: string; assistant?: boolean; unread?: boolean}>> {
  jobId = jobIdSchema.parse(jobId);
  if (identity.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    // Verify user can access this job
    const job = await record(trx, context, jobId, false);
    
    const messages = await trx('jobMessages')
      .where({workspaceId: context.workspaceId, jobId})
      .orderBy('createdAt', 'desc')
      .limit(Math.min(limit, 500))
      .select('id', 'authorId', 'authorName as author', 'createdAt as at', 'text');
    
    return messages.map(m => ({
      ...m,
      at: (m.at as Date).toISOString()
    }));
  });
}

/**
 * Create a new message for a job
 */
export async function createJobMessage(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], jobId: string, text: string): Promise<{id: string; authorId: string; authorName: string; createdAt: string}> {
  jobId = jobIdSchema.parse(jobId);
  if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 4000) {
    throw new JobValidationError('Message must be between 1 and 4000 characters');
  }
  if (identity.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    // Verify user can access this job
    const job = await record(trx, context, jobId, false);
    
    // Get author name
    const actor = await trx('users').where({ id: context.userId }).first('name');
    
    const id = randomUUID();
    const now = new Date();
    
    // Create message
    await trx('jobMessages').insert({
      id,
      workspaceId: context.workspaceId,
      jobId,
      authorId: context.userId,
      authorName: actor?.name || context.userId,
      text: text.trim(),
      createdAt: now
    });
    
    return {
      id,
      authorId: context.userId,
      authorName: actor?.name || context.userId,
      createdAt: now.toISOString()
    };
  });
}
