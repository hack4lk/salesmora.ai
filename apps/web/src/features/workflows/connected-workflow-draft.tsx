"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customerVisitOptionsSchema,routingOptionsSchema,completionHandoffOptionsSchema,workflowDraftResultSchema, workflowEditDataSchema, workflowRoutineBookingOptionsSchema, type WorkflowEditData, type WorkflowDraft } from "@salesmora/contracts";
import { useRouter } from "next/navigation";
import { useWorkspaceAssistant } from "../assistant/workspace-assistant/workspace-assistant";
import { useApiViewerId } from "../api/api-query-provider";
import { apiReadOptions } from "../api/api-read-options";
import { useAssistantResultRequest } from "../assistant/use-assistant-result-request";
import { invalidateWorkspaceResources } from "../api/api-read-options";
import { WorkflowDraftCard } from "./workflow-draft-card";

export function ConnectedWorkflowDraft({ ticket, disabled, onSaved }: { ticket: WorkflowDraft; disabled: boolean; onSaved?: (draft: WorkflowDraft) => void }) {
  const [draft, setDraft] = useState(ticket);
  const [editData, setEditData] = useState<WorkflowEditData>();
  const [editError, setEditError] = useState(false);
  const [deciding,setDeciding]=useState(false);
  const client = useQueryClient(),viewerId=useApiViewerId(),scope={viewerId,workspaceId:ticket.workspaceId},router=useRouter(),assistant=useWorkspaceAssistant();
  const cold=draft.definition.kind==='assigned_lead_cold';
  const coldOptions=useQuery({...apiReadOptions(scope,'workflow-cold-lead-options',{},`/api/workflows/cold-lead-options?workspace=${ticket.workspaceId}`,raw=>completionHandoffOptionsSchema.parse(raw),'Could not load reminder recipients.'),enabled:cold&&!draft.editing&&draft.state==='pending'});
  const coldRecipients=cold?(draft.state!=='pending'?(draft.definition.recipientId?[{id:draft.definition.recipientId,name:draft.definition.recipientName!}]:[]):draft.editing?editData?.recipients:coldOptions.data?.recipients):undefined;
  const scheduleChange=draft.definition.kind==='customer_schedule_change',postJob=draft.definition.kind==='post_job_thank_you',customerVisit=draft.definition.kind==='customer_visit_reminder'||postJob||scheduleChange;
  const visitOptions=useQuery({...apiReadOptions(scope,scheduleChange?'workflow-schedule-change-options':postJob?'workflow-post-job-options':'workflow-customer-visit-options',{},`/api/workflows/${scheduleChange?'schedule-change-options':postJob?'post-job-options':'customer-visit-options'}?workspace=${ticket.workspaceId}`,raw=>customerVisitOptionsSchema.parse(raw),'Could not load customer email settings.'),enabled:customerVisit&&!draft.editing&&draft.state==='pending'});
  const visitData=draft.editing?(scheduleChange?editData?.scheduleChangeOptions:postJob?editData?.postJobOptions:editData?.customerVisitOptions):visitOptions.data;
  const routing=draft.definition.kind==='lead_routing';
  const routingQuery=useQuery({...apiReadOptions(scope,'workflow-routing-options',{},`/api/workflows/routing-options?workspace=${ticket.workspaceId}`,raw=>routingOptionsSchema.parse(raw),'Could not load routing settings.'),enabled:routing&&!draft.editing&&draft.state==='pending'});
  const routingData=routing?(draft.editing?editData?.routingOptions:routingQuery.data):undefined;
  const handoff=draft.definition.kind==='completion_handoff';
  const handoffOptions=useQuery({...apiReadOptions(scope,'workflow-handoff-options',{},`/api/workflows/completion-handoff-options?workspace=${ticket.workspaceId}`,raw=>completionHandoffOptionsSchema.parse(raw),'Could not load notification contacts.'),enabled:handoff&&!draft.editing&&draft.state==='pending'});
  const due=['service_due','annual_service_review'].includes(draft.definition.kind),cancellation=draft.definition.kind==='cancellation_fill',booking=draft.definition.kind==='routine_booking'||cancellation||due;
  const bookingOptions=useQuery({...apiReadOptions(scope,'workflow-booking-options',{kind:draft.definition.kind},`/api/workflows/${due?'service-due-options':cancellation?'cancellation-options':'booking-options'}?workspace=${ticket.workspaceId}`,raw=>workflowRoutineBookingOptionsSchema.parse(raw),'Could not load booking settings.'),enabled:booking&&!draft.editing&&draft.state==='pending'});
  const terminalFacts=(draft.definition.kind==='routine_booking'||draft.definition.kind==='cancellation_fill'||draft.definition.kind==='service_due'||draft.definition.kind==='annual_service_review')&&draft.state!=='pending'?{services:[{value:draft.definition.service,label:draft.definition.service}],recipients:[{id:draft.definition.recipientId!,name:draft.definition.recipientName!}],availabilityReady:true,canSelectWorkers:false,qualifiedWorkerCounts:draft.definition.kind==='routine_booking'&&draft.definition.assignmentMode==='qualified_if_unassigned'?{[draft.definition.service]:1}:{}}:undefined;
  const bookingData=terminalFacts??(draft.editing?(editData?.bookingOptions?{...editData.bookingOptions,recipients:editData.recipients}:undefined):bookingOptions.isError?undefined:bookingOptions.data);
  const handoffRecipients=handoff?(draft.state!=='pending'?[{id:draft.definition.recipientId!,name:draft.definition.recipientName!}]:draft.editing?editData?.recipients:handoffOptions.data?.recipients):undefined;
  const waiting=(cold&&!coldRecipients||customerVisit&&!visitData||routing&&!routingData||booking&&!bookingData||handoff&&!handoffRecipients)&&draft.state==='pending';
  const api = useAssistantResultRequest<WorkflowDraft>(ticket.workspaceId, "workflow-proposal", "Couldn't save this workflow.");
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!draft.editing || draft.state !== "pending") return;
    const request = new AbortController();
    void api.read(`/api/workflows/edit?workspace=${ticket.workspaceId}&id=${draft.editing.id}&version=${draft.editing.version}`,
      workflowEditDataSchema.parse, request.signal).then(setEditData, () => { if (!request.signal.aborted) setEditError(true); });
    return () => request.abort();
  }, [api, draft.editing, draft.state, ticket.workspaceId]);
  const decide: ComponentProps<typeof WorkflowDraftCard>['onDecide'] = async (decision, notifications, localTime, editValues, bookingValues, cancellationValues, serviceDueValues, handoffValues, routingValues, annualReviewValues, customerVisitValues, assignedLeadColdValues, postJobValues, scheduleChangeValues) => {
    if (lock.current) return;
    lock.current = true; setDeciding(true);
    const request = new AbortController();
    controller.current = request;
    try {
      const saved = await api.write("/api/chat/workflows/proposals", {
        workspaceId: ticket.workspaceId, id: ticket.id, inputHash: ticket.inputHash, decision, ...(draft.editing ? { editValues } : { ...(notifications ? { notifications } : {}), ...(localTime ? { localTime } : {}), ...(annualReviewValues?{annualReviewValues}:{}),...(customerVisitValues?{customerVisitValues}:{}),...(assignedLeadColdValues?{assignedLeadColdValues}:{}),...(postJobValues?{postJobValues}:{}),...(scheduleChangeValues?{scheduleChangeValues}:{}),...(routingValues?{routingValues}:{}),...(handoffValues?{handoffValues}:{}),...(serviceDueValues?{serviceDueValues}:{}),...(bookingValues?{bookingValues}: {}),...(cancellationValues?{cancellationValues:{name:cancellationValues.name,service:cancellationValues.serviceId,rules:{durationMinutes:cancellationValues.durationMinutes,gapMinutes:cancellationValues.gapMinutes},recipientId:cancellationValues.recipientId,notifications:cancellationValues.notifications}}:{}) }),
      }, raw => workflowDraftResultSchema.parse(raw).draft, request.signal, true);
      setDraft(saved);
      onSaved?.(saved);
      await invalidateWorkspaceResources(client, ticket.workspaceId, ["workflows"]);
    } finally { lock.current = false; setDeciding(false); }
  };
  return <div className="grid gap-2">
    {draft.editing && !booking && draft.state === "pending" && !editData && <p role={editError ? "alert" : "status"} className="m-0 text-sm text-assistant-muted">{editError ? "This workflow changed or is unavailable. Cancel this review and ask for a fresh edit." : "Loading edit options…"}</p>}
    {cold&&waiting&&<p role={coldOptions.isError||editError?"alert":"status"}>{coldOptions.isError||editError?"Reminder recipients are unavailable. Close and reopen this review to try again.":"Loading reminder recipients…"}</p>}
    {customerVisit&&waiting&&<p role={visitOptions.isError||editError?"alert":"status"}>{visitOptions.isError||editError?"Customer email settings are unavailable. Close and reopen this review to try again.":"Loading customer email settings…"}</p>}
    {routing&&waiting&&<p role={routingQuery.isError||editError?'alert':'status'} className="m-0 text-sm text-assistant-muted">{routingQuery.isError||editError?'Routing settings are unavailable. Close and reopen the assistant to try again.':'Loading routing settings…'}</p>}
    {handoff&&waiting&&<p role={handoffOptions.isError||editError?"alert":"status"} className="m-0 text-sm text-assistant-muted">{handoffOptions.isError||editError?"Notification contacts are unavailable. Close and reopen the assistant to try again.":"Loading notification contacts…"}</p>}
    {booking&&draft.state==='pending'&&!bookingData&&<p role={bookingOptions.isError||editError?'alert':'status'} className="m-0 text-sm text-assistant-muted">{bookingOptions.isError||editError?'Booking settings are unavailable. Close and reopen the assistant to try again.':'Loading booking settings…'}</p>}
    {waiting?<button type="button" disabled={disabled||deciding} className="min-h-11 w-fit cursor-pointer rounded-lg border border-assistant-border px-4 text-sm text-assistant-foreground disabled:opacity-50" onClick={()=>{void decide('cancel').catch(()=>setEditError(true));}}>Cancel</button>:<WorkflowDraftCard customerVisitOptions={visitData} routingOptions={routingData} draft={draft} services={bookingData?.services} availabilityReady={bookingData?.availabilityReady} canSelectWorkers={bookingData?.canSelectWorkers} qualifiedWorkerCounts={bookingData?.qualifiedWorkerCounts} onManageWorkers={()=>{assistant?.setOpen(false);router.push(`/settings/services?workspace=${ticket.workspaceId}`);}}
      onManageAvailability={()=>{assistant?.setOpen(false);router.push(`/calendar?workspace=${ticket.workspaceId}`);}}
      recipients={cold?coldRecipients:handoff?handoffRecipients:booking?bookingData?.recipients:editData?.recipients} sources={editData?.sources} saveDisabled={cold?!coldRecipients:routing?!routingData:handoff?!handoffRecipients:booking?!bookingData:!!draft.editing && !editData} disabled={disabled||deciding} onDecide={decide} />}
  </div>;
}
