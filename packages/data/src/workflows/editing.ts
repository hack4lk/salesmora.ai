import { assertScheduleChange, scheduleChangeOptions } from './customer-schedule-changes';
import { assertPostJob, postJobOptions } from './post-job';
import { assertCustomerVisit, customerVisitOptions } from './customer-visits';
import {assertAnnualReview} from "./annual-service";
import {assertServiceDue,serviceDueOptions} from "./service-due";
import {assertCancellation,cancellationOptions} from "./cancellation";
import { assertRoutineBooking, routineBookingOptions } from "./booking";
import { routingSource, assertRoutingAvailable, routingOptions, routingPolicy } from "./routing";
import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { workflowEditCommandSchema, workflowEditDataSchema, workflowEditResultSchema, workflowDefinitionSchema,
  type AuthorizationContext, type PermissionId, type WorkflowDefinition, type WorkflowEditValues, type WorkspaceRole } from "@salesmora/contracts";
import { canEditWorkflow, canReceiveWorkflow, isVisitWorkflow, workflowLocalTime, workflowRuleDescription } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { workflowRecipient, WorkflowDraftError } from "./recipients";
import { WorkflowConflictError, readWorkflowsInTransaction } from "./store";

export async function editableWorkflow(trx: Knex.Transaction, context: AuthorizationContext, selector: { id?: string; reference?: string }) {
  const query = trx("workflows").where({ workspaceId: context.workspaceId }).whereNull("deletedAt");
  if (selector.id) query.where("id", selector.id);
  else if (selector.reference) query.whereRaw("lower(name) = lower(?)", [selector.reference]);
  else throw new AuthorizationAccessError();
  const rows = await query.select("id", "name", "version", "definition", "status", "publisherId").limit(2);
  if (rows.length !== 1) throw new WorkflowDraftError("Choose Edit from the workflow's menu so I can identify the workflow.");
  const row = rows[0], definition = workflowDefinitionSchema.safeParse(row.definition);
  if (!["active", "paused"].includes(row.status) || !row.publisherId || !definition.success || !canEditWorkflow(context, definition.data.kind)) throw new AuthorizationAccessError();
  return { ...row, definition: definition.data } as { id: string; name: string; version: number; status: "active" | "paused"; publisherId: string; definition: WorkflowDefinition };
}

export function workflowEditValues(name: string, definition: WorkflowDefinition): WorkflowEditValues {
  return { ...(definition.kind==='post_job_thank_you'?{postJobValues:{...definition.rules,messageChoice:definition.rules.messageChoice!,name,localTime:definition.localTime}}:{}), ...(definition.kind==='assigned_lead_cold'?{coldRecipientMode:definition.recipientMode}:{}), ...(definition.kind==='annual_service_review'?{service:definition.service,annualReviewRules:definition.rules,bookingTimezone:definition.timezone}:{}), ...(definition.kind==='service_due'?{service:definition.service,serviceDueRules:definition.rules,bookingTimezone:definition.timezone}:{}), ...(definition.kind==='cancellation_fill'?{service:definition.service,cancellationRules:definition.rules,bookingTimezone:definition.timezone}:{}), ...(definition.kind === "routine_booking" ? { ...(definition.assignmentMode?{assignmentMode:definition.assignmentMode}:{}),service:definition.service,bookingRules:definition.rules,bookingTimezone:definition.timezone } : {}), ...(definition.kind === "lead_routing" ? { sourceId: definition.sourceId } : {}), name, localTime: workflowLocalTime(definition), businessDays: "businessDays" in definition ? definition.businessDays : null,
    ...(definition.kind==='lead_routing'&&definition.routing?{routing:{strategy:definition.routing.strategy,matchWorkZipCodes:definition.routing.matchWorkZipCodes,memberIds:definition.routing.members.map(member=>member.id)}}:{}),recipientId: definition.recipientId??'',
    notifications: definition.notifications ?? { inApp: true, email: false } };
}

export async function readWorkflowEditData(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], input: { workspaceId: string; id: string; version: number }) {
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row = await editableWorkflow(trx, context, { id: input.id });
    if (row.version !== input.version) throw new WorkflowConflictError();
    const members = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId")
      .where("m.workspaceId", context.workspaceId).whereNull("u.suspendedAt").whereNull("u.deletionRequestedAt")
      .orderByRaw(`CASE WHEN u.id = ? THEN 0 WHEN m.role = 'owner' THEN 1 WHEN m.role = 'admin' THEN 2 ELSE 3 END`, [row.definition.recipientId??''])
      .orderBy("u.name").orderBy("u.id").select<{ id: string; name: string; role: WorkspaceRole }[]>("u.id", "u.name", "m.role").limit(500);
    const roleAccess = new Map<WorkspaceRole, boolean>();
    const recipients = members.filter(person => {
      if (!roleAccess.has(person.role)) roleAccess.set(person.role, canReceiveWorkflow({ ...context, userId: person.id,
        membership: { userId: person.id, workspaceId: context.workspaceId, role: person.role } }, row.definition.kind));
      return roleAccess.get(person.role);
    }).map(({ id, name }) => ({ id, name }));
    const sources = row.definition.kind === "lead_routing" ? await trx("captureSources").where({ workspaceId: context.workspaceId }).whereNot("status", "archived").select("id", "name").orderBy("name").limit(500) : undefined;
    const bookingOptions = row.definition.kind === "routine_booking" ? await routineBookingOptions(trx,context) : row.definition.kind==='cancellation_fill'?await cancellationOptions(trx,context):['service_due','annual_service_review'].includes(row.definition.kind)?await serviceDueOptions(trx,context):undefined;
    return workflowEditDataSchema.parse({ ...(row.definition.kind==='customer_schedule_change'?{scheduleChangeOptions:await scheduleChangeOptions(trx,context,process.env.BETTER_AUTH_URL??'')}:{}), ...(row.definition.kind==='post_job_thank_you'?{postJobOptions:await postJobOptions(trx,context,process.env.BETTER_AUTH_URL??'')}:{}), ...(row.definition.kind==='customer_visit_reminder'?{customerVisitOptions:await customerVisitOptions(trx,context,process.env.BETTER_AUTH_URL??'')}:{}), ...(row.definition.kind==='lead_routing'?{routingOptions:await routingOptions(trx,context)}:{}), bookingOptions,sources, workflow: { id: row.id, workspaceId: context.workspaceId, name: row.name, version: row.version,
      status: row.status, definition: ["assigned_lead_cold","routine_booking","cancellation_fill","service_due","annual_service_review"].includes(row.definition.kind) ? { ...row.definition,timezone:(await trx("workspaces").where({id:context.workspaceId}).first("timezone")).timezone } : row.definition }, recipients });
  });
}

/** One workspace-authorized transaction serializes edits with scheduled/manual delivery and lifecycle actions. */
export async function editWorkflowInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  const input = workflowEditCommandSchema.parse(raw);
  if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const current = await editableWorkflow(trx, context, { id: input.id });
  const requestHash = createHash("sha256").update(JSON.stringify({ id: input.id, version: input.version, values: input.values })).digest("hex");
  const previous = await trx("workflowEditAudit").where({ workspaceId: context.workspaceId, actorId: context.userId, requestId: input.requestId }).first();
  if (previous) {
    if (previous.requestHash !== requestHash || previous.workflowId !== input.id || previous.version !== current.version) throw new WorkflowConflictError();
    return workflowEditResultSchema.parse(previous.response);
  }
  if (current.version !== input.version) throw new WorkflowConflictError();
  if (("businessDays" in current.definition) !== (input.values.businessDays !== null)) throw new WorkflowDraftError("businessDays" in current.definition ? "Choose a delay of 1–30 business days." : "You can change the send time, but this workflow keeps its current day.");
  if (current.definition.kind === "lead_routing" && input.values.localTime !== workflowLocalTime(current.definition)) throw new WorkflowDraftError("Routing happens when a new lead is created; it has no send time.");
  if(current.definition.kind==='completion_handoff'&&input.values.localTime!==workflowLocalTime(current.definition))throw new WorkflowDraftError('Completion handoff runs immediately and has no send time.');
  if(input.values.routing&&current.definition.kind!=='lead_routing')throw new WorkflowDraftError('Team routing settings require lead routing.');
  const policy=current.definition.kind==='lead_routing'&&input.values.routing?await routingPolicy(trx,context,input.values.sourceId??current.definition.sourceId,input.values.routing):undefined;
  if(input.values.postJobValues&&current.definition.kind!=='post_job_thank_you')throw new WorkflowDraftError('Thank-you settings require a post-job workflow.');
  if(current.definition.kind==='customer_schedule_change'){if(input.values.recipientId!==current.definition.recipientId||input.values.notifications.inApp||!input.values.notifications.email||input.values.localTime!==workflowLocalTime(current.definition))throw new WorkflowDraftError('Customer schedule changes use Email after five minutes, with no daily send time.');await assertScheduleChange(trx,context,input.id);}
  if(current.definition.kind==='post_job_thank_you'){const post=input.values.postJobValues;if(!post||post.name!==input.values.name||post.localTime!==input.values.localTime||input.values.recipientId!==current.definition.recipientId||input.values.notifications.inApp||!input.values.notifications.email)throw new WorkflowDraftError('Review the thank-you wording and timing. Customer email is the only channel.');await assertPostJob(trx,context,input.id);}
  if(current.definition.kind==='customer_visit_reminder'){if(input.values.recipientId!==current.definition.recipientId||input.values.notifications.inApp||!input.values.notifications.email)throw new WorkflowDraftError('Customer reminders use the visit customer and Email only.');await assertCustomerVisit(trx,context,input.id);}
  if(input.values.coldRecipientMode&&current.definition.kind!=='assigned_lead_cold')throw new WorkflowDraftError('Lead-owner settings require an assigned-lead reminder.');
  const coldMode=current.definition.kind==='assigned_lead_cold'?(input.values.coldRecipientMode??current.definition.recipientMode):undefined;
  if(coldMode==='owner'&&input.values.recipientId)throw new WorkflowDraftError('Lead owner is chosen when the reminder runs.');
  const person = policy||coldMode==='owner'?undefined:await workflowRecipient(trx, context, "", current.definition.kind, input.values.recipientId);
  if (current.definition.kind !== "lead_routing" && (!input.values.notifications.inApp && !input.values.notifications.email || input.values.sourceId)) throw new WorkflowDraftError("Choose a notification channel for this reminder.");
  const source = current.definition.kind === "lead_routing" ? await routingSource(trx, context, "", input.values.sourceId ?? current.definition.sourceId) : null;
  if (source && current.status === "active") await assertRoutingAvailable(trx, context.workspaceId, source.id, input.id);
  if(current.definition.kind==='annual_service_review'){
    if(!input.values.service||!input.values.annualReviewRules||input.values.bookingRules||input.values.cancellationRules||input.values.serviceDueRules||input.values.assignmentMode)throw new WorkflowDraftError('Review the service and annual review date.');
    const zone=(await trx('workspaces').where({id:context.workspaceId}).first('timezone')).timezone;
    await assertAnnualReview(trx,context,input.values.service,input.values.annualReviewRules.firstReviewDate,input.values.localTime,zone,input.id,current.status==='active',input.values.annualReviewRules.firstReviewDate!==current.definition.rules.firstReviewDate||input.values.localTime!==current.definition.localTime||zone!==current.definition.timezone);
  } else if(current.definition.kind==='service_due'){
    if(!input.values.service||!input.values.serviceDueRules||input.values.serviceDueRules.includeExisting!==current.definition.rules.includeExisting||input.values.bookingRules||input.values.cancellationRules||input.values.assignmentMode)throw new WorkflowDraftError('Review the service interval. Historical inclusion is only chosen when creating a workflow.');
    await assertServiceDue(trx,context,input.values.service,input.id,current.status==='active');
  } else if(current.definition.kind==='cancellation_fill'){
    if(!input.values.service||!input.values.cancellationRules||input.values.bookingRules||input.values.assignmentMode||input.values.localTime!==workflowLocalTime(current.definition))throw new WorkflowDraftError('Review the cancellation service, duration and gap.');
    await assertCancellation(trx,context,input.values.service,input.id,current.status==='active');
  } else if(current.definition.kind==='routine_booking') {
    if(input.values.localTime!==workflowLocalTime(current.definition))throw new WorkflowDraftError('Booking has no daily send time.');
    if(!input.values.service || !input.values.bookingRules) throw new WorkflowDraftError('Review the service and booking rules.');
    await assertRoutineBooking(trx,context,input.values.service,input.id,current.status==='active',true,input.values.assignmentMode??current.definition.assignmentMode);
  } else if(input.values.service || input.values.bookingRules || input.values.bookingTimezone || input.values.assignmentMode || input.values.cancellationRules || input.values.serviceDueRules || input.values.annualReviewRules) throw new WorkflowDraftError('Booking settings require a booking workflow.');
  const timezone = ['assigned_lead_cold','routine_booking','cancellation_fill','service_due','annual_service_review'].includes(current.definition.kind) ? (await trx('workspaces').where({id:context.workspaceId}).first('timezone')).timezone : current.definition.timezone;
  if(['routine_booking','cancellation_fill','service_due','annual_service_review'].includes(current.definition.kind) && input.values.bookingTimezone!==timezone)throw new WorkflowDraftError('The workspace timezone changed. Reload this review.');
  const definition = workflowDefinitionSchema.parse({ ...current.definition,...(current.definition.kind==='post_job_thank_you'?{rules:{calendarDays:input.values.postJobValues!.calendarDays,reviewUrl:input.values.postJobValues!.reviewUrl,messageChoice:input.values.postJobValues!.messageChoice,thankYouMessage:input.values.postJobValues!.thankYouMessage}}:{}),...(coldMode?{recipientMode:coldMode,timezone}:{}), ...(current.definition.kind==='annual_service_review'?{service:input.values.service,rules:input.values.annualReviewRules,timezone}:{}), ...(current.definition.kind==='service_due'?{service:input.values.service,rules:input.values.serviceDueRules,timezone}:{}), ...(current.definition.kind==='cancellation_fill'?{service:input.values.service,rules:input.values.cancellationRules,timezone}:{}), ...(current.definition.kind==='routine_booking'?{service:input.values.service,rules:input.values.bookingRules,timezone,...(input.values.assignmentMode?{assignmentMode:input.values.assignmentMode}:{})}:{}), ...(source ? { sourceId: source.id, sourceName: source.name } : ["customer_schedule_change","routine_booking","cancellation_fill","completion_handoff"].includes(current.definition.kind) ? {} : { localTime: input.values.localTime }),
    ...(input.values.businessDays !== null ? { businessDays: input.values.businessDays } : {}),
    ...(current.definition.kind==='lead_routing'?{routing:policy}:{}),recipientId: person?.id, recipientName: person?.name, notifications: input.values.notifications });
  const unchanged = current.name === input.values.name && JSON.stringify(workflowEditValues(current.name, current.definition)) === JSON.stringify(input.values)
    && current.definition.recipientName === person?.name && current.definition.timezone === definition.timezone;
  if (unchanged) return workflowEditResultSchema.parse({ row: (await readWorkflowsInTransaction(trx, context, input.id)).rows[0], definition: current.definition });
  const version = current.version + 1;
  await trx("workflows").where({ workspaceId: context.workspaceId, id: input.id, version: current.version }).update({
    ...(["routine_booking","cancellation_fill"].includes(definition.kind) || (definition.kind==='service_due'&&current.definition.kind==='service_due'&&current.definition.service!==definition.service) ? { enrollAfter:trx.fn.now() } : {}), name: input.values.name, rule: workflowRuleDescription(definition), definition: JSON.stringify(definition), publisherId: context.userId, version, executionIssue: null, updatedAt: trx.fn.now(),
  });
  // Updating dueAt refreshes the existing outbox version even for recipient/channel-only edits.
  const timingChanged = workflowLocalTime(current.definition) !== workflowLocalTime(definition) ||
    ("businessDays" in current.definition && "businessDays" in definition && current.definition.businessDays !== definition.businessDays);
  if(definition.kind==='assigned_lead_cold'){
    await trx('workflowSteps').where({workspaceId:context.workspaceId,workflowId:input.id,recordKind:'cold_lead'}).whereIn('status',['queued','held']).update({status:'canceled'});
    // The source adapter queues bounded re-enrollment using original period anchors.
  } else if(definition.kind==='customer_schedule_change'){
    await trx('workflowSteps').where({workspaceId:context.workspaceId,workflowId:input.id,recordKind:'schedule_change'}).whereIn('status',['queued','held']).update({dueAt:trx.raw('"dueAt"')});
  } else if(definition.kind==='post_job_thank_you'){
    await trx('workflowSteps').where({workspaceId:context.workspaceId,workflowId:input.id,recordKind:'post_job'}).whereIn('status',['queued','held']).update({dueAt:trx.raw('coalesce(workflow_annual_instant(("triggeredAt" AT TIME ZONE ?)::date+?::int,?::time,?),"dueAt")',[definition.timezone,definition.rules.calendarDays,definition.localTime,definition.timezone])});
  } else if(definition.kind==='customer_visit_reminder'){
    // Source adapter rebuilds only unsent future occurrences when timing changes.
    await trx('workflowSteps').where({workspaceId:context.workspaceId,workflowId:input.id,recordKind:'customer_visit'}).whereIn('status',['queued','held']).update({dueAt:trx.raw('"dueAt"')});
  } else if(definition.kind==='annual_service_review'){
    await trx('workflowSteps').where({workspaceId:context.workspaceId,workflowId:input.id,recordKind:'annual_review'}).whereIn('status',['queued','held']).update({dueAt:trx.raw('"dueAt"')});
  } else if(definition.kind==='service_due'){
    await trx('workflowSteps').where({workspaceId:context.workspaceId,workflowId:input.id,recordKind:'service_due'}).whereIn('status',['queued','held']).update({status:'canceled'});
    if(current.definition.kind==='service_due'&&current.definition.service!==definition.service){await trx('workflowSteps').where({workspaceId:context.workspaceId,workflowId:input.id,recordKind:'service_due_init'}).whereIn('status',['queued','held']).update({status:'canceled'});await trx('workflowServiceDueCycles').where({workspaceId:context.workspaceId,workflowId:input.id}).update({status:'superseded',version:trx.raw('version+1')});}
    else await trx.raw(`UPDATE "workflowServiceDueCycles" SET "reminderOn"=CASE WHEN "reminderOn"="dueDate" THEN (("completedAt" AT TIME ZONE ?)::date+make_interval(months=>?))::date ELSE "reminderOn" END,"dueDate"=(("completedAt" AT TIME ZONE ?)::date+make_interval(months=>?))::date,version=version+1 WHERE "workspaceId"=? AND "workflowId"=? AND status='due'`,[definition.timezone,definition.rules.intervalMonths,definition.timezone,definition.rules.intervalMonths,context.workspaceId,input.id]);
    if(current.status==='active')await trx.raw(`SELECT workflow_service_schedule(?, ?, d) FROM (SELECT DISTINCT "reminderOn" d FROM "workflowServiceDueCycles" WHERE "workspaceId"=? AND "workflowId"=? AND status='due' AND "notifiedAt" IS NULL) dates`,[context.workspaceId,input.id,context.workspaceId,input.id]);
  } else if (definition.kind === "lead_routing" || definition.kind === "routine_booking" || definition.kind === "cancellation_fill") {
    // Future admissions read the new definition; no pending reminder steps exist.
  } else if (!timingChanged) {
    await trx("workflowSteps").where({ workspaceId: context.workspaceId, workflowId: input.id }).whereIn("status", ["queued", "held"])
      .update({ dueAt: trx.raw('"dueAt"') });
  } else if (definition.kind === "weekly_briefing") {
    await trx.raw(`UPDATE "workflowSteps" SET "dueAt" = workflow_next_monday(now(),?,?::time)
      WHERE "workspaceId" = ? AND "workflowId" = ? AND status IN ('queued','held') AND "recordKind" = 'briefing'`,
    [definition.timezone, workflowLocalTime(definition), context.workspaceId, input.id]);
  } else if (isVisitWorkflow(definition)) {
    await trx.raw(`UPDATE "workflowSteps" SET "dueAt" = CASE WHEN "recordKind" = 'visit_init' THEN now() ELSE greatest((("visitDate" - 1) + ?::time) AT TIME ZONE ?,now()) END
      WHERE "workspaceId" = ? AND "workflowId" = ? AND status IN ('queued','held') AND "recordKind" IN ('visit','visit_init')`,
    [workflowLocalTime(definition), definition.timezone, context.workspaceId, input.id]);
  } else if ("businessDays" in definition) {
    const legacyAnchor = definition.kind === "unassigned_lead"
      ? '(SELECT l."createdAt" FROM leads l WHERE l."workspaceId" = s."workspaceId" AND l.id = s."leadId")'
      : definition.kind === "estimate_follow_up"
        ? `(SELECT min(d."sentAt") FROM estimate_deliveries d WHERE d."workspaceId" = s."workspaceId" AND d."estimateId" = s."estimateId" AND d.status = 'sent')`
        : '(SELECT e."decidedAt" FROM estimates e WHERE e."workspaceId" = s."workspaceId" AND e.id = s."estimateId")';
    await trx.raw(`WITH anchors AS (SELECT s.id,coalesce(s."triggeredAt",${legacyAnchor}) AS anchor FROM "workflowSteps" s
      WHERE s."workspaceId" = ? AND s."workflowId" = ? AND s.status IN ('queued','held'))
      UPDATE "workflowSteps" s SET "triggeredAt" = a.anchor, "dueAt" = coalesce(workflow_reminder_due(a.anchor,?,?::time,?),s."dueAt")
      FROM anchors a WHERE s.id = a.id AND s."workspaceId" = ?`,
    [context.workspaceId, input.id, definition.businessDays, workflowLocalTime(definition), definition.timezone, context.workspaceId]);
  }
  // Completed reminders stay historical; unsent emails belonging to those old deliveries cannot move to a new recipient.
  const notices = definition.kind==='completion_handoff'?'workflowHandoffNotifications':['service_due','annual_service_review'].includes(definition.kind)?'workflowServiceDueNotifications':definition.kind==='cancellation_fill'?"workflowCancellationNotifications":definition.kind === "routine_booking" ? "workflowBookingNotifications" : isVisitWorkflow(definition) ? "workflowVisitNotifications" : definition.kind === "weekly_briefing" ? "workflowBriefingNotifications" : ["assigned_lead_cold","unassigned_lead"].includes(definition.kind) ? "leadWorkflowNotifications" : "estimateNotifications";
  if (definition.kind !== "lead_routing" && (current.definition.recipientId !== definition.recipientId || !definition.notifications?.email)) await trx(notices).where({ workspaceId: context.workspaceId, workflowId: input.id, emailStatus: "queued" }).update({ emailStatus: "skipped" });
  const response = workflowEditResultSchema.parse({ row: (await readWorkflowsInTransaction(trx, context, input.id)).rows[0], definition });
  await trx("workflowEditAudit").insert({ id: randomUUID(), workspaceId: context.workspaceId, workflowId: input.id, actorId: context.userId,
    requestId: input.requestId, requestHash, version, before: JSON.stringify({ name: current.name, definition: current.definition, publisherId: current.publisherId }),
    after: JSON.stringify({ name: input.values.name, definition, publisherId: context.userId }), response: JSON.stringify(response) });
  return response;
}

export async function editWorkflow(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workflowEditCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) => editWorkflowInTransaction(trx, context, input));
}
