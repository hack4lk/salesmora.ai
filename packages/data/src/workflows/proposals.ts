import { assertScheduleChange } from './customer-schedule-changes';
import { assertPostJob } from './post-job';
import { defaultPostJobMessage } from '@salesmora/contracts';
import { assertCustomerVisit } from './customer-visits';
import { assertAnnualReview } from "./annual-service";
import { assertWorkflowCapacity } from "./capacity";
import {assertServiceDue} from "./service-due";
import {assertCancellation} from "./cancellation";
import { assertRoutineBooking, resolveRoutineBookingService } from "./booking";
import { routingSource, assertRoutingAvailable, routingPolicy, routingPolicyFromNames } from "./routing";
import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { workflowPrepareSchema, workflowDraftSchema, workflowDefinitionSchema, workflowPublishDecisionSchema,
  workflowProposalStoredSchema, type AuthorizationContext, type PermissionId, type WorkflowDraft, type WorkflowDefinition } from "@salesmora/contracts";
import { canEditWorkflow, canPublishWorkflow, availableWorkflowRecipes, workflowRuleDescription } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { editableWorkflow, editWorkflowInTransaction, workflowEditValues } from "./editing";
import { workflowRecipient as recipient, WorkflowDraftError } from "./recipients";
import { createProposal, findOwnedProposal, saveProposalResolution, supersedeProposals } from "../chat-proposals";

export { canPublishWorkflow };
export { WorkflowDraftError } from "./recipients";

export async function prepareWorkflowInTransaction(trx: Knex.Transaction, context: AuthorizationContext,
  source: { threadId: string; turnId: string }, raw: unknown): Promise<WorkflowDraft> {
  const input = workflowPrepareSchema.parse(raw);
  const createdAt = new Date().toISOString();
  let content: { name: string; rule: string; definition: WorkflowDefinition; editing?: { id: string; version: number; status: "active" | "paused" } };
  if (input.operation === "edit") {
    const isId = workflowDraftSchema.shape.id.safeParse(input.workflowRef).success;
    const current = await editableWorkflow(trx, context, isId ? { id: input.workflowRef } : { reference: input.workflowRef });
    if (input.kind && input.kind !== current.definition.kind) throw new WorkflowDraftError("Changing the workflow's purpose requires a separate workflow.");
    if(current.definition.kind==='customer_schedule_change'&&input.localTime!=null)throw new WorkflowDraftError('Schedule-change notices send after five minutes; there is no daily send time.');
    if(current.definition.kind==='completion_handoff'&&(input.businessDays!=null||input.localTime!=null))throw new WorkflowDraftError('Completion handoff runs immediately; it has no business-day delay or send time.');
    if (input.businessDays != null && !("businessDays" in current.definition)) throw new WorkflowDraftError(current.definition.kind === "weekly_briefing" ? "This briefing runs on Mondays. You can change its send time." : "This reminder runs the day before a visit. You can change its send time.");
    if ([input.name, input.businessDays, input.localTime, input.recipient, input.notifications, input.source, input.service, input.bookingRules,input.assignmentMode,input.cancellationRules,input.serviceDueRules,input.routing,input.postJobRules].every(value => value == null))
      throw new WorkflowDraftError("Choose a name, time, recipient, delay or notification change. Changing the workflow's purpose requires a separate workflow.");
    if(input.routing&&current.definition.kind!=='lead_routing')throw new WorkflowDraftError('Team routing settings require a lead-routing workflow.');
    if(['customer_visit_reminder','post_job_thank_you','customer_schedule_change'].includes(current.definition.kind)&&(input.recipient!=null||input.notifications!=null))throw new WorkflowDraftError('Customer visit reminders email the customer. Change the name or send time, or pause the workflow.');
    const policySource=current.definition.kind==='lead_routing'?(input.source?await routingSource(trx,context,input.source):{id:current.definition.sourceId,name:current.definition.sourceName}):null;
    const policy=current.definition.kind==='lead_routing'?(input.routing?await routingPolicyFromNames(trx,context,policySource!.id,input.routing):input.recipient?undefined:current.definition.routing):undefined;
    const coldOwner=current.definition.kind==='assigned_lead_cold'&&(input.recipient==null?current.definition.recipientMode==='owner':input.recipient.toLowerCase()==='lead owner');
    const person = policy||coldOwner?undefined:await recipient(trx, context, input.recipient ?? "", current.definition.kind, input.recipient ? undefined : current.definition.recipientId);
    const notifications = input.notifications ? {
      inApp: input.notifications.inApp ?? current.definition.notifications?.inApp ?? true,
      email: input.notifications.email ?? current.definition.notifications?.email ?? false,
    } : current.definition.notifications;
    if (current.definition.kind !== "lead_routing" && notifications && !notifications.inApp && !notifications.email)
      throw new WorkflowDraftError("Keep at least one notification channel on, or use the workflow's Pause option.");
    if (input.source && current.definition.kind !== "lead_routing") throw new WorkflowDraftError("Only a routing workflow can change its intake source.");
    if (current.definition.kind === "lead_routing" && input.localTime) throw new WorkflowDraftError("Routing happens when a new lead is created; it has no send time.");
    if(current.definition.kind==='completion_handoff'&&input.localTime!=null)throw new WorkflowDraftError('Completion handoff runs immediately and has no send time.');
    const routeSource = policySource;
    if(!['routine_booking','cancellation_fill','service_due','annual_service_review'].includes(current.definition.kind) && (input.service!=null || input.bookingRules!=null || input.assignmentMode!=null || input.cancellationRules!=null || input.serviceDueRules!=null || input.annualReviewRules!=null))throw new WorkflowDraftError('Booking settings require a booking workflow.');
    const bookingTimezone=['assigned_lead_cold','routine_booking','cancellation_fill','service_due','annual_service_review'].includes(current.definition.kind)?(await trx('workspaces').where({id:context.workspaceId}).first('timezone')).timezone:undefined;
    if(['routine_booking','cancellation_fill'].includes(current.definition.kind) && input.localTime)throw new WorkflowDraftError('Booking responds to new jobs and has no send time.');
    if(current.definition.kind==='service_due'&&(input.bookingRules||input.cancellationRules||input.assignmentMode))throw new WorkflowDraftError('Use a service interval for this workflow.');
    if(current.definition.kind!=='annual_service_review'&&input.annualReviewRules)throw new WorkflowDraftError('Annual dates require an annual service review.');
    if(current.definition.kind!=='service_due'&&input.serviceDueRules)throw new WorkflowDraftError('Service intervals require a repeat-service workflow.');
    if(current.definition.kind==='routine_booking'&&input.cancellationRules)throw new WorkflowDraftError('Cancellation settings require a cancellation workflow.');
    if(current.definition.kind==='cancellation_fill'&&(input.bookingRules||input.assignmentMode))throw new WorkflowDraftError('Cancellation filling uses a duration and gap, not routine booking rules.');
    if(input.postJobRules&&current.definition.kind!=='post_job_thank_you')throw new WorkflowDraftError('Thank-you settings require a post-job workflow.');
    const definition = workflowDefinitionSchema.parse({ ...current.definition, ...(current.definition.kind==='post_job_thank_you'?{rules:{...current.definition.rules,...Object.fromEntries(Object.entries(input.postJobRules??{}).filter(([,v])=>v!=null))}}:{}), ...(current.definition.kind==='assigned_lead_cold'?{recipientMode:coldOwner?'owner':'teammate'}:{}),
      ...(current.definition.kind==='annual_service_review'?{service:input.service?await resolveRoutineBookingService(trx,context,input.service):current.definition.service,rules:input.annualReviewRules??current.definition.rules}:{}),
      ...(current.definition.kind==='service_due'?{service:input.service?await resolveRoutineBookingService(trx,context,input.service):current.definition.service,rules:input.serviceDueRules??current.definition.rules}:{}),
      ...(current.definition.kind==='cancellation_fill'?{service:input.service?await resolveRoutineBookingService(trx,context,input.service):current.definition.service,rules:input.cancellationRules??current.definition.rules}:{}), ...(bookingTimezone?{timezone:bookingTimezone}:{}),
      ...(current.definition.kind === "routine_booking" ? { service: input.service ? await resolveRoutineBookingService(trx,context,input.service) : current.definition.service, rules: input.bookingRules ?? current.definition.rules,...(input.assignmentMode?{assignmentMode:input.assignmentMode}:{}) } : {}),
      ...(routeSource ? { sourceId: routeSource.id, sourceName: routeSource.name } : {}),
      ...(input.businessDays != null ? { businessDays: input.businessDays } : {}), ...(("localTime" in current.definition) ? { localTime: input.localTime ?? current.definition.localTime } : {}),
      ...(current.definition.kind==='lead_routing'?{routing:policy}:{}),recipientId: person?.id, recipientName: person?.name, notifications });
    if (JSON.stringify(workflowEditValues(input.name ?? current.name, definition)) === JSON.stringify(workflowEditValues(current.name, current.definition)))
      throw new WorkflowDraftError("These settings already match. No changes were made.");
    content = { name: input.name ?? current.name, rule: workflowRuleDescription(definition), definition,
      editing: { id: current.id, version: current.version, status: current.status } };
  } else {
    if (!canPublishWorkflow(context, input.kind)) throw new AuthorizationAccessError();
    await assertWorkflowCapacity(trx, context);
    if(input.routing&&input.kind!=='lead_routing')throw new WorkflowDraftError('Team routing settings require a lead-routing workflow.');
    const coldOwner=input.kind==='assigned_lead_cold'&&(!input.recipient||input.recipient.toLowerCase()==='lead owner');
    const person = input.routing||coldOwner?undefined:await recipient(trx, context, ['customer_visit_reminder','post_job_thank_you','customer_schedule_change'].includes(input.kind)?'me':input.recipient, input.kind);
    const workspace = await trx("workspaces").where({ id: context.workspaceId }).first<{ timezone: string }>("timezone");
    if (!workspace) throw new AuthorizationAccessError();
    const routeSource = input.kind === "lead_routing" ? await routingSource(trx, context, input.source!) : null;
    const policy=routeSource&&input.routing?await routingPolicyFromNames(trx,context,routeSource.id,input.routing):undefined;
    if (routeSource) await assertRoutingAvailable(trx, context.workspaceId, routeSource.id);
    const bookingService=['routine_booking','cancellation_fill','service_due','annual_service_review'].includes(input.kind)?await resolveRoutineBookingService(trx,context,input.service!):undefined;
    if(input.kind==='annual_service_review')await assertAnnualReview(trx,context,bookingService!,input.annualReviewRules!.firstReviewDate,input.localTime??'09:00',workspace.timezone);
    if(input.kind==='service_due')await assertServiceDue(trx,context,bookingService!);
    if(input.kind==='cancellation_fill')await assertCancellation(trx,context,bookingService!);
    if (input.kind==='routine_booking' && bookingService) await assertRoutineBooking(trx,context,bookingService,undefined,true,false,input.assignmentMode??undefined);
    if(input.postJobRules&&input.kind!=='post_job_thank_you')throw new WorkflowDraftError('Thank-you settings require a post-job workflow.');
    const definition = workflowDefinitionSchema.parse({ kind: input.kind,...(input.kind==='customer_schedule_change'?{quietMinutes:5,maxBurstMinutes:15}:{}),...(input.kind==='post_job_thank_you'?{rules:{calendarDays:2,reviewUrl:'',messageChoice:null,thankYouMessage:defaultPostJobMessage,...Object.fromEntries(Object.entries(input.postJobRules??{}).filter(([,v])=>v!=null))},localTime:input.localTime??'09:00'}:{}),...(input.kind==='assigned_lead_cold'?{recipientMode:coldOwner?'owner':'teammate'}:{}),
      ...(input.kind==='annual_service_review'?{service:bookingService,rules:input.annualReviewRules,localTime:input.localTime??'09:00'}:{}),
      ...(input.kind==='service_due'?{service:bookingService,rules:input.serviceDueRules,localTime:input.localTime??'09:00'}:{}),
      ...(input.kind==='cancellation_fill'?{service:bookingService,rules:input.cancellationRules}:{}),
      ...(input.kind === 'routine_booking' ? { service: bookingService, rules: input.bookingRules,...(input.assignmentMode?{assignmentMode:input.assignmentMode}:{}) } : {}),
      ...(routeSource ? { sourceId: routeSource.id, sourceName: routeSource.name } : {}),
      ...(["customer_schedule_change","post_job_thank_you","lead_routing","routine_booking","cancellation_fill","service_due","annual_service_review","completion_handoff"].includes(input.kind) ? {} : ["customer_visit_reminder", "unassigned_visit", "visit_materials"].includes(input.kind) ? { calendarDaysBefore: 1 } : input.kind === "weekly_briefing" ? { weekday: "monday" } : { businessDays: input.businessDays }),
      ...(!["customer_schedule_change","post_job_thank_you","lead_routing","routine_booking","cancellation_fill","service_due","annual_service_review","completion_handoff"].includes(input.kind) ? { localTime: input.localTime ?? (["assigned_lead_cold", "customer_visit_reminder", "unassigned_visit", "visit_materials", "weekly_briefing"].includes(input.kind) ? "09:00" : "17:00") } : {}),
      ...(input.kind==='lead_routing'?{routing:policy}:{}),recipientId: person?.id, recipientName: person?.name, timezone: workspace.timezone, notifications: ['customer_visit_reminder','post_job_thank_you','customer_schedule_change'].includes(input.kind)?{inApp:false,email:true}:input.notifications });
    content = {
      name: input.name,
      rule: workflowRuleDescription(definition), definition,
    };
  }
  const draft = workflowDraftSchema.parse({
    ...content, id: randomUUID(), workspaceId: context.workspaceId, state: "pending",
    inputHash: createHash("sha256").update(JSON.stringify(content)).digest("hex"),
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  });
  await supersedeProposals(trx, context, source.threadId, "workflow", createdAt);
  await createProposal(trx, context, {
    family: "workflow", id: draft.id, workspaceId: context.workspaceId, userId: context.userId,
    ...source, state: "pending", payloadVersion: 1, payload: { draft },
    inputHash: draft.inputHash, requestId: null, createdAt, expiresAt: draft.expiresAt, resolvedAt: null,
  });
  return draft;
}

export async function visibleWorkflowDraft(trx: Knex.Transaction, context: AuthorizationContext, selector: { id: string } | { turnId: string }) {
  if (!availableWorkflowRecipes(context).length) return undefined;
  const proposal = await findOwnedProposal(trx, context, "workflow", selector);
  if (proposal?.family !== "workflow") return undefined;
  const stored = workflowProposalStoredSchema.parse(proposal.payload);
  if (!(stored.draft.editing ? canEditWorkflow(context, stored.draft.definition.kind) : canPublishWorkflow(context, stored.draft.definition.kind))) return undefined;
  return workflowDraftSchema.parse({ ...stored.draft,
    state: proposal.state === "pending" && Date.parse(proposal.expiresAt) <= Date.now() ? "expired" : proposal.state });
}

export async function decideWorkflow(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workflowPublishDecisionSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    if (!availableWorkflowRecipes(context).length) throw new AuthorizationAccessError();
    const original = await findOwnedProposal(trx, context, "workflow", { id: input.id }, true);
    if (original?.family !== "workflow" || original.inputHash !== input.inputHash) throw new AuthorizationAccessError();
    if (original.state !== "pending") return visibleWorkflowDraft(trx, context, { id: input.id });
    if (Date.parse(original.expiresAt) <= Date.now()) throw new WorkflowDraftError("This draft expired. Ask the assistant for a fresh draft.");
    const source = await trx("chatTurns").where({ id: original.turnId, workspaceId: context.workspaceId, userId: context.userId, state: "completed" }).first("id");
    if (!source) throw new WorkflowDraftError("This conversation did not finish. Ask for a fresh draft.");
    const originalDraft = workflowProposalStoredSchema.parse(original.payload).draft;
    if (!canPublishWorkflow(context, originalDraft.definition.kind)) throw new AuthorizationAccessError();
    if (["lead_routing","routine_booking","cancellation_fill","completion_handoff"].includes(originalDraft.definition.kind) && input.localTime) throw new WorkflowDraftError("Routing happens when a new lead is created; it has no send time.");
    if (originalDraft.definition.kind !== "lead_routing" && input.notifications && !input.notifications.inApp && !input.notifications.email) throw new WorkflowDraftError("Choose at least one notification option.");
    if(input.bookingValues && originalDraft.definition.kind !== 'routine_booking') throw new WorkflowDraftError('Booking settings require a booking workflow.');
    if(input.cancellationValues&&originalDraft.definition.kind!=='cancellation_fill')throw new WorkflowDraftError('Cancellation settings require a cancellation workflow.');
    if(input.serviceDueValues&&originalDraft.definition.kind!=='service_due')throw new WorkflowDraftError('Use service-reminder settings for this workflow.');
    if(input.handoffValues&&originalDraft.definition.kind!=='completion_handoff')throw new WorkflowDraftError('Use completion-handoff settings for this workflow.');
    if(input.routingValues&&originalDraft.definition.kind!=='lead_routing')throw new WorkflowDraftError('Routing settings require lead routing.');
    if(input.annualReviewValues&&originalDraft.definition.kind!=='annual_service_review')throw new WorkflowDraftError('Annual dates require an annual service review.');
    if(input.customerVisitValues&&originalDraft.definition.kind!=='customer_visit_reminder')throw new WorkflowDraftError('Customer reminder settings require a customer visit workflow.');
    if(originalDraft.definition.kind==='customer_visit_reminder'&&input.notifications)throw new WorkflowDraftError('Customer reminders use Email only.');
    if(input.assignedLeadColdValues&&originalDraft.definition.kind!=='assigned_lead_cold')throw new WorkflowDraftError('Use assigned-lead reminder settings for this workflow.');
    if(input.postJobValues&&originalDraft.definition.kind!=='post_job_thank_you')throw new WorkflowDraftError('Thank-you settings require a post-job workflow.');
    if(originalDraft.definition.kind==='post_job_thank_you'&&input.notifications)throw new WorkflowDraftError('Post-job thank-you uses customer Email only.');
    const post=input.postJobValues;
    if(input.scheduleChangeValues&&originalDraft.definition.kind!=='customer_schedule_change')throw new WorkflowDraftError('Use schedule-change settings for this workflow.');
    if(originalDraft.definition.kind==='customer_schedule_change'&&(input.localTime||input.notifications))throw new WorkflowDraftError('Schedule-change notices use customer Email after five minutes, with no daily send time.');
    const cold=input.assignedLeadColdValues,coldPerson=cold?.recipient.kind==='teammate'?await recipient(trx,context,'','assigned_lead_cold',cold.recipient.id):undefined;
    const annual=input.annualReviewValues,annualPerson=annual?await recipient(trx,context,'','annual_service_review',annual.recipientId):null;
    const routingValues=input.routingValues,reviewedSource=routingValues?await routingSource(trx,context,'',routingValues.sourceId):undefined;
    const reviewedPolicy=routingValues?await routingPolicy(trx,context,routingValues.sourceId,{strategy:routingValues.strategy,memberIds:routingValues.memberIds,matchWorkZipCodes:routingValues.matchWorkZipCodes}):undefined;
    const handoff=input.handoffValues,handoffPerson=handoff?await recipient(trx,context,'','completion_handoff',handoff.recipientId):null;
    const serviceDue=input.serviceDueValues;const duePerson=serviceDue?await recipient(trx,context,'','service_due',serviceDue.recipientId):null;
    const cancellation=input.cancellationValues;
    const cancellationPerson=cancellation?await recipient(trx,context,'','cancellation_fill',cancellation.recipientId):null;
    const booking = input.bookingValues;
    const bookingPerson = booking && originalDraft.definition.kind === 'routine_booking' ? await recipient(trx,context,'','routine_booking',booking.recipientId) : null;
    const definition = workflowDefinitionSchema.parse({ ...originalDraft.definition, ...(post?{rules:{calendarDays:post.calendarDays,reviewUrl:post.reviewUrl,messageChoice:post.messageChoice,thankYouMessage:post.thankYouMessage},localTime:post.localTime}:{}), ...(cold?{businessDays:cold.businessDays,localTime:cold.localTime,recipientMode:cold.recipient.kind==='owner'?'owner':'teammate',recipientId:coldPerson?.id,recipientName:coldPerson?.name,notifications:cold.notifications}:{}), ...(input.customerVisitValues?{localTime:input.customerVisitValues.localTime}:{}), ...(annual&&annualPerson?{service:await resolveRoutineBookingService(trx,context,annual.service),rules:annual.rules,localTime:annual.localTime,recipientId:annualPerson.id,recipientName:annualPerson.name,notifications:annual.notifications}:{}), ...(routingValues&&reviewedPolicy&&reviewedSource?{sourceId:reviewedSource.id,sourceName:reviewedSource.name,routing:reviewedPolicy,recipientId:undefined,recipientName:undefined,notifications:routingValues.notifications}:{}),
      ...(handoff&&handoffPerson?{recipientId:handoffPerson.id,recipientName:handoffPerson.name,notifications:handoff.notifications}:{}),
      ...(serviceDue&&duePerson?{service:await resolveRoutineBookingService(trx,context,serviceDue.service),rules:serviceDue.rules,recipientId:duePerson.id,recipientName:duePerson.name,localTime:serviceDue.localTime,notifications:serviceDue.notifications}:{}),
      ...(cancellation&&cancellationPerson?{service:await resolveRoutineBookingService(trx,context,cancellation.service),rules:cancellation.rules,recipientId:cancellationPerson.id,recipientName:cancellationPerson.name,notifications:cancellation.notifications}:{}),
      ...(booking && bookingPerson ? { service: booking.service, rules: booking.rules,...(booking.assignmentMode?{assignmentMode:booking.assignmentMode}:{}), recipientId: bookingPerson.id, recipientName: bookingPerson.name, notifications: booking.notifications } : {}),
      ...(input.notifications ? { notifications: input.notifications } : {}),
      ...(input.localTime ? { localTime: input.localTime } : {}) });
    let draft = input.decision === "confirm"
      ? { ...originalDraft, ...(input.scheduleChangeValues?{name:input.scheduleChangeValues.name}:post?{name:post.name}:cold?{name:cold.name}:input.customerVisitValues?{name:input.customerVisitValues.name}:annual?{name:annual.name}:routingValues?{name:routingValues.name}:handoff?{name:handoff.name}:booking ? { name:booking.name } : cancellation?{name:cancellation.name}:serviceDue?{name:serviceDue.name}:{}), definition, rule: workflowRuleDescription(definition) } : originalDraft;
    if (input.decision === "confirm" && draft.editing) {
      const values = input.editValues ?? workflowEditValues(draft.name, draft.definition);
      const saved = await editWorkflowInTransaction(trx, context, { workspaceId: context.workspaceId, id: draft.editing.id,
        version: draft.editing.version, requestId: draft.id, values });
      draft = { ...draft, name: saved.row.name, rule: saved.row.rule, definition: saved.definition };
    } else if (input.decision === "confirm") {
      if (input.editValues) throw new WorkflowDraftError("Ask for an edit review to change an existing workflow.");
      const policy=draft.definition.kind==='lead_routing'&&draft.definition.routing?await routingPolicy(trx,context,draft.definition.sourceId,{strategy:draft.definition.routing.strategy,matchWorkZipCodes:draft.definition.routing.matchWorkZipCodes,memberIds:draft.definition.routing.members.map(member=>member.id)}):undefined;
      const person = policy||draft.definition.kind==='assigned_lead_cold'&&draft.definition.recipientMode==='owner'?undefined:await recipient(trx, context, draft.definition.recipientName!, draft.definition.kind, draft.definition.recipientId);
      const workspace = await trx("workspaces").where({ id: context.workspaceId }).first<{ timezone: string }>("timezone");
      if (policy&&JSON.stringify(policy)!==JSON.stringify(draft.definition.kind==='lead_routing'?draft.definition.routing:undefined)||person&&(person.name !== draft.definition.recipientName || person.id !== draft.definition.recipientId)||workspace?.timezone !== draft.definition.timezone)
        throw new WorkflowDraftError("The recipient or workspace time zone changed. Ask for a fresh draft.");
      if(draft.definition.kind==='annual_service_review')await assertAnnualReview(trx,context,draft.definition.service,draft.definition.rules.firstReviewDate,draft.definition.localTime,draft.definition.timezone);
      if(draft.definition.kind==='service_due')await assertServiceDue(trx,context,draft.definition.service);
      if(draft.definition.kind==='cancellation_fill')await assertCancellation(trx,context,draft.definition.service);
      if (draft.definition.kind === "routine_booking") await assertRoutineBooking(trx,context,draft.definition.service,undefined,true,true,draft.definition.assignmentMode);
      if (draft.definition.kind === "lead_routing") {
        const source = await routingSource(trx, context, "", draft.definition.sourceId);
        if (source.name !== draft.definition.sourceName) throw new WorkflowDraftError("The intake source changed. Ask for a fresh review.");
        await assertRoutingAvailable(trx, context.workspaceId, source.id);
      }
      if(draft.definition.kind==='customer_schedule_change')await assertScheduleChange(trx,context);
      if(draft.definition.kind==='post_job_thank_you'){if(!post||!draft.definition.rules.messageChoice)throw new WorkflowDraftError('Choose the default thank-you or write your own in the review.');await assertPostJob(trx,context);}
      if(draft.definition.kind==='customer_visit_reminder')await assertCustomerVisit(trx,context);
      await assertWorkflowCapacity(trx, context);
      await trx("workflows").insert({
        id: draft.id, workspaceId: context.workspaceId, name: draft.name, rule: draft.rule,
        status: "active", definition: JSON.stringify(draft.definition), publisherId: context.userId,
        enrollAfter: trx.fn.now(),
      });
    }
    const state = input.decision === "confirm" ? "confirmed" : "cancelled";
    await saveProposalResolution(trx, context, original, { ...original, state,
      resolvedAt: new Date().toISOString(), payload: { ...original.payload, draft: { ...draft, state } } }, new Date().toISOString());
    return workflowDraftSchema.parse({ ...draft, state });
  });
}
