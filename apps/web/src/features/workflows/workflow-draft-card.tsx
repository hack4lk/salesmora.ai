'use client';
import { ConnectedScheduleChangeReview } from './workflow-customer-schedule-change/connected-schedule-change-review';
import { postJobValuesSchema } from '@salesmora/contracts';
import { ConnectedPostJobReview } from './workflow-post-job-review/connected-post-job-review';
import { AssignedLeadColdCard } from './workflow-assigned-lead-cold/workflow-assigned-lead-cold-card';
import { ConnectedCustomerVisitReview } from './workflow-customer-visit-reminder/connected-customer-visit-review';
import {SmartRoutingCard,type SmartRoutingValues} from './workflow-smart-routing/workflow-smart-routing-card';
import {CompletionHandoffCard} from "./workflow-completion-handoff/workflow-completion-handoff-card";
import {WorkflowServiceDueCard} from "./workflow-service-due/workflow-service-due-card";
import {WorkflowCancellationCard} from "./workflow-cancellation-card/workflow-cancellation-card";

import { useEffect, useState } from "react";
import type { WorkflowDraft, WorkflowEditValues, WorkflowEditData, WorkflowNotificationChannels, WorkflowRoutineBookingValues } from "@salesmora/contracts";
import { WorkflowAnnualServiceCard } from "./workflow-annual-service-review/workflow-annual-service-card";
import { workflowLocalTimeSchema, workflowEditValuesSchema } from "@salesmora/contracts";
import { workflowLocalTime, workflowRuleDescription } from "@salesmora/domain";
import { WorkflowRoutineBookingCard } from "./workflow-routine-booking-card/workflow-routine-booking-card";
import { WorkflowNotificationChoices } from "./workflow-notification-choices";

export type WorkflowDraftReview = WorkflowDraft;
export type WorkflowEditReview = Pick<WorkflowDraft, "name" | "rule" | "definition" | "state"> & {
  id: string; workspaceId: string; expiresAt: null; editing: NonNullable<WorkflowDraft["editing"]>;
};

type WorkflowDraftCardProps = {
  customerVisitOptions?: import("@salesmora/contracts").CustomerVisitOptions;
  routingOptions?:WorkflowEditData['routingOptions'];
  qualifiedWorkerCounts?:Readonly<Record<string,number>>;canSelectWorkers?:boolean;onManageWorkers?:()=>void;
  services?: readonly { value:string;label:string }[]; availabilityReady?:boolean; onManageAvailability?:()=>void;
  draft: WorkflowDraftReview | WorkflowEditReview;
  recipients?: WorkflowEditData["recipients"];
  sources?: WorkflowEditData["sources"];
  onAskAssistant?: (values: WorkflowEditValues) => void;
  disabled?: boolean;
  saveDisabled?: boolean;
  onDecide: (decision: "confirm" | "cancel", notifications?: WorkflowNotificationChannels, localTime?: string, values?: WorkflowEditValues, bookingValues?: WorkflowRoutineBookingValues, cancellationValues?: import("./workflow-cancellation-card/workflow-cancellation-card").CancellationWorkflowValues, serviceDueValues?: import("@salesmora/contracts").ServiceDueValues, handoffValues?: import("@salesmora/contracts").CompletionHandoffValues, routingValues?: SmartRoutingValues, annualReviewValues?: import("@salesmora/contracts").AnnualReviewValues, customerVisitValues?: {name:string;localTime:string}, assignedLeadColdValues?: import("@salesmora/contracts").AssignedLeadColdValues, postJobValues?: import("@salesmora/contracts").PostJobValues, scheduleChangeValues?: {name:string}) => Promise<void>;
};

export function WorkflowDraftCard(props:WorkflowDraftCardProps) {
  const {draft}=props;
  if(draft.definition.kind==='customer_schedule_change'){
    const d=draft.definition;
    return <ConnectedScheduleChangeReview workspaceId={draft.workspaceId} setup={props.customerVisitOptions} expiresAt={draft.expiresAt} value={{name:draft.name}} timezone={d.timezone} canPublish={!props.disabled&&!props.saveDisabled&&!!props.customerVisitOptions} editing={!!draft.editing} paused={draft.editing?.status==='paused'}
      state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'} onCancel={()=>props.onDecide('cancel')}
      onPublish={async value=>{const edit=draft.editing?{name:value.name,localTime:'17:00',businessDays:null,recipientId:d.recipientId,notifications:{inApp:false,email:true}}:undefined;await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,draft.editing?undefined:value);}}/>;
  }
  if(draft.definition.kind==='post_job_thank_you'){
    const d=draft.definition;
    return <ConnectedPostJobReview workspaceId={draft.workspaceId} setup={props.customerVisitOptions} expiresAt={draft.expiresAt} value={{name:draft.name,localTime:d.localTime,...d.rules}} timezone={d.timezone}
      canPublish={!props.disabled&&!props.saveDisabled&&!!props.customerVisitOptions} editing={!!draft.editing} paused={draft.editing?.status==='paused'}
      state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'} onCancel={()=>props.onDecide('cancel')}
      onPublish={async value=>{const v=postJobValuesSchema.parse(value);const edit=draft.editing?{name:v.name,localTime:v.localTime,businessDays:null,recipientId:d.recipientId,notifications:{inApp:false,email:true},postJobValues:v}:undefined;await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,draft.editing?undefined:v);}}/>;
  }
  if(draft.definition.kind==='assigned_lead_cold'){
    const d=draft.definition;
    return <AssignedLeadColdCard value={{name:draft.name,businessDays:d.businessDays,localTime:d.localTime,recipient:d.recipientMode==='owner'?{kind:'owner'}:{kind:'teammate',id:d.recipientId!},notifications:d.notifications??{inApp:true,email:true}}} recipients={props.recipients??[]} timezone={d.timezone} canPublish={!props.disabled&&!props.saveDisabled} expiresAt={draft.expiresAt} editing={!!draft.editing} paused={draft.editing?.status==='paused'}
      state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'} onCancel={()=>props.onDecide('cancel')} onPublish={async v=>{const edit=draft.editing?{name:v.name,businessDays:v.businessDays,localTime:v.localTime,notifications:v.notifications,coldRecipientMode:v.recipient.kind==='owner'?'owner' as const:'teammate' as const,recipientId:v.recipient.kind==='owner'?'':v.recipient.id}:undefined;await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,undefined,undefined,undefined,undefined,undefined,draft.editing?undefined:v);}}/>;
  }
  if(draft.definition.kind==='customer_visit_reminder'){
    const def=draft.definition,setup=props.customerVisitOptions;
    return <ConnectedCustomerVisitReview workspaceId={draft.workspaceId} setup={setup} expiresAt={draft.expiresAt} value={{name:draft.name,localTime:def.localTime}} timezone={def.timezone}
      canPublish={!props.disabled&&!props.saveDisabled&&!!setup} editing={!!draft.editing} paused={draft.editing?.status==='paused'}
      state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'}
      onCancel={()=>props.onDecide('cancel')} onPublish={async value=>{const edit=draft.editing?{...value,businessDays:null,recipientId:def.recipientId,notifications:{inApp:false,email:true}}:undefined;await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,undefined,undefined,undefined,undefined,draft.editing?undefined:value);}}/>;
  }
  if(draft.definition.kind==='lead_routing'){
    const d=draft.definition,policy=d.routing;
    return <SmartRoutingCard value={{name:draft.name,sourceId:d.sourceId,strategy:policy?.strategy??'one_teammate',memberIds:policy?policy.members.map(member=>member.id):d.recipientId?[d.recipientId]:[],matchWorkZipCodes:policy?.matchWorkZipCodes??false,notifications:d.notifications}}
      sources={props.routingOptions?.sources??[{id:d.sourceId,name:d.sourceName,collectsPostalCode:false}]} members={props.routingOptions?.members??(policy?.members??(d.recipientId?[{id:d.recipientId,name:d.recipientName!}]:[])).map(member=>({...member,workZipCodes:[]}))}
      teamSettingsHref={`/settings/team?workspace=${draft.workspaceId}`} canPublish={!props.disabled&&!props.saveDisabled} editing={!!draft.editing} expiresAt={draft.expiresAt} paused={draft.editing?.status==='paused'}
      onAskAssistant={props.onAskAssistant?value=>props.onAskAssistant!({name:value.name,sourceId:value.sourceId,localTime:'17:00',businessDays:null,recipientId:'',notifications:value.notifications,routing:{strategy:value.strategy,memberIds:value.memberIds,matchWorkZipCodes:value.matchWorkZipCodes}}):undefined}
      state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'} onReload={()=>{}} onCancel={()=>props.onDecide('cancel')}
      onPublish={async value=>{const edit=draft.editing?{name:value.name,sourceId:value.sourceId,localTime:'17:00',businessDays:null,recipientId:'',notifications:value.notifications,routing:{strategy:value.strategy,memberIds:value.memberIds,matchWorkZipCodes:value.matchWorkZipCodes}}:undefined;await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,undefined,undefined,value);}}/>;
  }
  if(draft.definition.kind==='completion_handoff'){
    const d=draft.definition;return <CompletionHandoffCard value={{name:draft.name,recipientId:d.recipientId,notifications:d.notifications??{inApp:true,email:true}}} recipients={props.recipients??[]} canPublish={!props.disabled&&!props.saveDisabled} editing={!!draft.editing} expiresAt={draft.expiresAt}
      state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'} onCancel={()=>props.onDecide('cancel')} onPublish={async v=>{const edit=draft.editing?{...v,localTime:'17:00',businessDays:null}:undefined;await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,undefined,v);}}/>;
  }
  if(draft.definition.kind==='annual_service_review')return <AnnualWorkflowReview key={draft.id+draft.definition.timezone} {...props}/>;
  if(draft.definition.kind==='service_due'){
    const d=draft.definition;return <WorkflowServiceDueCard key={draft.id+JSON.stringify(draft.editing)} value={{name:draft.name,serviceId:d.service,intervalMonths:d.rules.intervalMonths,includeExisting:d.rules.includeExisting,recipientId:d.recipientId,localTime:d.localTime,notifications:d.notifications??{inApp:true,email:true}}}
      services={props.services?.map(s=>({id:s.value,name:s.label}))??[]} recipients={props.recipients??[]} timezone={d.timezone} canPublish={!props.disabled&&!props.saveDisabled} editing={!!draft.editing}
      state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'} onCancel={()=>props.onDecide('cancel')} onPublish={async v=>{
        const values={name:v.name,service:v.serviceId,rules:{intervalMonths:v.intervalMonths,includeExisting:v.includeExisting},recipientId:v.recipientId,localTime:v.localTime,notifications:v.notifications};
        const edit=draft.editing?{name:v.name,service:v.serviceId,serviceDueRules:values.rules,bookingTimezone:d.timezone,recipientId:v.recipientId,localTime:v.localTime,businessDays:null,notifications:v.notifications}:undefined;
        await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,values);
      }}/>;
  }
  if(draft.definition.kind==='cancellation_fill'){
    const definition=draft.definition;
    return <WorkflowCancellationCard key={draft.id+JSON.stringify(draft.editing)} value={{name:draft.name,serviceId:definition.service,durationMinutes:definition.rules.durationMinutes,gapMinutes:definition.rules.gapMinutes,recipientId:definition.recipientId,notifications:definition.notifications??{inApp:true,email:true}}}
      timezone={definition.timezone} expiresAt={draft.expiresAt} editing={!!draft.editing}
      services={props.services?.map(s=>({id:s.value,name:s.label}))??[]} recipients={props.recipients??[]}
      canPublish={!props.disabled&&!props.saveDisabled} state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'?'draft':'expired'}
      onCancel={()=>props.onDecide('cancel')} onPublish={async values=>{
        const editValues=draft.editing?{name:values.name,localTime:'17:00',businessDays:null,recipientId:values.recipientId,notifications:values.notifications,service:values.serviceId,cancellationRules:{durationMinutes:values.durationMinutes,gapMinutes:values.gapMinutes},bookingTimezone:definition.timezone}:undefined;
        await props.onDecide('confirm',undefined,undefined,editValues,undefined,values);
      }}/>;
  }
  if(draft.definition.kind==='routine_booking') {
    const definition=draft.definition;
    const submit=async({values,timezone,assignmentMode}:{values:WorkflowRoutineBookingValues;timezone:string;assignmentMode?:'assigned'|'qualified_if_unassigned'})=>{
      const mode=assignmentMode??values.assignmentMode??definition.assignmentMode;
      const chosen={...values,...(mode?{assignmentMode:mode}:{})};
      const editValues=draft.editing?{name:chosen.name,localTime:'17:00',businessDays:null,recipientId:chosen.recipientId,notifications:chosen.notifications,service:chosen.service,bookingRules:chosen.rules,bookingTimezone:timezone,...(mode?{assignmentMode:mode}:{})}:undefined;
      await props.onDecide('confirm',chosen.notifications,undefined,editValues,chosen);
    };
    return <WorkflowRoutineBookingCard value={{name:draft.name,service:definition.service,rules:definition.rules,recipientId:definition.recipientId,notifications:definition.notifications??{inApp:true,email:true}}}
      revision={draft.editing?String(draft.editing.version):'inputHash' in draft?draft.inputHash:draft.id} timezone={definition.timezone} state={draft.state} expiresAt={draft.expiresAt} editing={draft.editing}
      services={props.services??[]} recipients={props.recipients??[]} availabilityReady={props.availabilityReady??false} canSubmit disabled={props.disabled||props.saveDisabled}
      workerSelection={props.canSelectWorkers||definition.assignmentMode==='qualified_if_unassigned'?{canChoose:props.canSelectWorkers,mode:definition.assignmentMode??'assigned',qualifiedWorkerCounts:props.qualifiedWorkerCounts??{},onManageWorkers:props.onManageWorkers,onSubmit:submit}:undefined}
      onManageAvailability={props.onManageAvailability} onCancel={()=>props.onDecide('cancel')} onSubmit={input=>submit({...input,...(props.canSelectWorkers||definition.assignmentMode==='qualified_if_unassigned'?{assignmentMode:'assigned' as const}:{})})}/>;
  }
  return <LegacyWorkflowDraftCard {...props}/>;
}
function AnnualWorkflowReview(props:WorkflowDraftCardProps){
  const {draft}=props;
  const [clock]=useState(()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:draft.definition.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const part=(type:string)=>parts.find(p=>p.type===type)!.value;return {date:`${part('year')}-${part('month')}-${part('day')}`,time:`${part('hour')}:${part('minute')}`};});
  const [expired,setExpired]=useState(()=>!!draft.expiresAt&&Date.parse(draft.expiresAt)<=Date.now());
  useEffect(()=>{if(!draft.expiresAt)return;const timer=setTimeout(()=>setExpired(true),Math.max(0,Date.parse(draft.expiresAt)-Date.now()));return()=>clearTimeout(timer);},[draft.expiresAt]);
  if(draft.definition.kind!=='annual_service_review')return null;
  const d=draft.definition;
    return <WorkflowAnnualServiceCard key={draft.id} value={{name:draft.name,serviceId:d.service,firstReviewDate:d.rules.firstReviewDate,recipientId:d.recipientId,localTime:d.localTime,notifications:d.notifications??{inApp:true,email:true}}}
      services={props.services?.map(s=>({id:s.value,name:s.label}))??[]} recipients={props.recipients??[]} timezone={d.timezone} clock={clock}
      canPublish={!props.disabled&&!props.saveDisabled} editing={!!draft.editing} paused={draft.editing?.status==='paused'} state={draft.state==='confirmed'?'published':draft.state==='cancelled'?'cancelled':draft.state==='pending'&&!expired?'draft':'expired'}
      onCancel={()=>props.onDecide('cancel')} onPublish={async v=>{const values={name:v.name,service:v.serviceId,rules:{firstReviewDate:v.firstReviewDate},recipientId:v.recipientId,localTime:v.localTime,notifications:v.notifications};
        const edit=draft.editing?{name:v.name,service:v.serviceId,annualReviewRules:values.rules,bookingTimezone:d.timezone,recipientId:v.recipientId,localTime:v.localTime,businessDays:null,notifications:v.notifications}:undefined;
        await props.onDecide('confirm',undefined,undefined,edit,undefined,undefined,undefined,undefined,undefined,draft.editing?undefined:values);}}/>;
}

function LegacyWorkflowDraftCard({ draft, disabled, saveDisabled, recipients, sources, onAskAssistant, onDecide }: WorkflowDraftCardProps) {
  const [expired, setExpired] = useState(() => draft.expiresAt !== null && Date.parse(draft.expiresAt) <= Date.now());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState(draft.definition.notifications ?? { inApp: true, email: false });
  const [localTime, setLocalTime] = useState(() => workflowLocalTime(draft.definition));
  const routing = draft.definition.kind === "lead_routing";
  const [sourceId, setSourceId] = useState(draft.definition.kind === "lead_routing" ? draft.definition.sourceId : undefined);
  const validTime = workflowLocalTimeSchema.safeParse(localTime).success;
  const editing = !!draft.editing;
  const [name, setName] = useState(draft.name);
  const [recipientId, setRecipientId] = useState(draft.definition.recipientId??'');
  const [businessDays, setBusinessDays] = useState("businessDays" in draft.definition ? draft.definition.businessDays : null);
  const values = { ...(routing ? { sourceId } : {}), name, localTime, businessDays, recipientId, notifications };
  const validSettings = workflowEditValuesSchema.safeParse(values).success && (!("businessDays" in draft.definition) || businessDays !== null) &&
    (!recipients || recipients.some(person => person.id === recipientId)) &&
    (routing ? !!sourceId && (!sources || sources.some(source => source.id === sourceId)) : notifications.inApp || notifications.email);
  const changed = (draft.definition.kind === "lead_routing" && sourceId !== draft.definition.sourceId) || draft.expiresAt !== null || name !== draft.name || localTime !== workflowLocalTime(draft.definition) ||
    recipientId !== draft.definition.recipientId || businessDays !== ("businessDays" in draft.definition ? draft.definition.businessDays : null) ||
    notifications.inApp !== (draft.definition.notifications?.inApp ?? true) || notifications.email !== (draft.definition.notifications?.email ?? false);
  const preview = { ...draft.definition, ...(routing ? { sourceId: sourceId!, sourceName: sources?.find(source => source.id === sourceId)?.name ?? (draft.definition.kind === "lead_routing" ? draft.definition.sourceName : "") } : { localTime }), recipientId,
    recipientName: recipients?.find(person => person.id === recipientId)?.name ?? draft.definition.recipientName??'Selected teammate',
    ...("businessDays" in draft.definition && businessDays !== null ? { businessDays } : {}) };
  useEffect(() => {
    if (draft.expiresAt === null) return;
    const timeout = setTimeout(() => setExpired(true), Math.max(0, Date.parse(draft.expiresAt) - Date.now()));
    return () => clearTimeout(timeout);
  }, [draft.expiresAt]);
  const state = draft.state === "pending" && expired ? "expired" : draft.state;
  const labels = {
    pending: editing ? "Review and save when you're ready." : "Review and publish when you're ready.",
    confirmed: editing ? "Workflow updated." : "Workflow published.",
    cancelled: "Draft canceled.",
    superseded: "A newer draft replaces this one.",
    expired: "This draft expired. Ask for a fresh draft.",
  };
  async function decide(decision: "confirm" | "cancel") {
    setPending(true);
    setError("");
    try {
      if (editing && decision === "confirm") await onDecide(decision, notifications, localTime, workflowEditValuesSchema.parse(values));
      else await onDecide(decision, decision === "confirm" ? notifications : undefined, decision === "confirm" && !routing ? localTime : undefined);
    }
    catch { setError(editing ? "Couldn't save these changes. Reopen Edit to check the current settings, then try again." : "Couldn't save this decision. Your draft may have expired or access changed. Ask for a fresh draft if retrying fails."); }
    finally { setPending(false); }
  }
  return (
    <section aria-label="Workflow draft" className="grid gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
      <h3 className="m-0 text-base font-semibold">{editing ? "Edit workflow" : draft.name}</h3>
      {editing && <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold sm:col-span-2">Name
          <input value={name} maxLength={120} required disabled={state !== "pending" || disabled || pending}
            onChange={event => setName(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 text-assistant-foreground focus-visible:focus-ring" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">{routing ? "Assign to" : "Recipient"}
          <select value={recipients && !recipients.some(person => person.id === recipientId) ? "" : recipientId} onChange={event => setRecipientId(event.target.value)} disabled={!recipients || state !== "pending" || disabled || pending}
            className="min-h-11 min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 text-assistant-foreground scheme-dark focus-visible:focus-ring">
            <option value="" disabled>Choose a recipient</option>
            {(recipients ?? [{ id: draft.definition.recipientId, name: draft.definition.recipientName }]).map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        {routing && sources && <label className="grid gap-1 text-sm font-semibold">Source
          <select value={sourceId ?? ""} onChange={event => setSourceId(event.target.value)} disabled={state !== "pending" || disabled || pending}
            className="min-h-11 min-w-0 cursor-pointer rounded-lg border border-assistant-border bg-assistant-surface px-3 text-assistant-foreground scheme-dark focus-visible:focus-ring">
            <option value="" disabled>Choose an intake source</option>
            {sources.map(source => <option key={source.id} value={source.id}>{source.name}</option>)}
          </select>
        </label>}
        {"businessDays" in draft.definition && <label className="grid gap-1 text-sm font-semibold">Delay (business days)
          <input type="number" min={1} max={30} required value={businessDays ?? ""} disabled={state !== "pending" || disabled || pending}
            onChange={event => setBusinessDays(event.target.value === "" ? null : Number(event.target.value))}
            className="min-h-11 min-w-0 rounded-lg border border-assistant-border bg-assistant-surface px-3 text-assistant-foreground focus-visible:focus-ring" />
        </label>}

      </div>}

      <p className="m-0 text-sm leading-6">{validTime && (!editing || validSettings) ? workflowRuleDescription(preview) : draft.rule}</p>
      {!routing && <div className="flex flex-wrap items-end gap-x-4 gap-y-2 text-sm">
        <label className="grid gap-1 font-semibold">Send at
          <input type="time" required value={localTime} onChange={event => setLocalTime(event.target.value)}
            disabled={state !== "pending" || disabled || pending} aria-invalid={!validTime}
            className="min-h-11 rounded-lg border border-assistant-border bg-assistant-surface px-3 text-assistant-foreground scheme-dark disabled:opacity-70" />
        </label>
        <p className="m-0 pb-3 text-assistant-muted">{draft.definition.timezone}</p>
      </div>}
      {!validTime && <p role="alert" className="m-0 text-sm">Choose a valid send time.</p>}
      <WorkflowNotificationChoices dark optional={routing} value={notifications} onChange={state === "pending" ? setNotifications : undefined} disabled={disabled || pending} />
      {routing && <p className="m-0 text-sm leading-6 text-assistant-muted">Applies to new leads. Existing owners stay unchanged. {draft.editing?.status === "paused" ? "This workflow will stay paused." : ""}</p>}
      {editing && !routing && <p className="m-0 text-sm leading-6 text-assistant-muted">Updates pending reminders. Completed reminders won’t resend. Overdue matches may send now. {draft.editing?.status === "paused" ? "This workflow will stay paused." : ""}</p>}
      {editing && !validSettings && validTime && <p role="alert" className="m-0 text-sm">Enter a name, recipient and valid delay, and choose at least one notification option.</p>}
      <p role="status" className="m-0 text-sm">{pending ? "Saving…" : labels[state]}</p>
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      {state === "pending" && <div className="flex flex-wrap gap-3">
        <button type="button" disabled={disabled || saveDisabled || pending || !validTime || (editing && (!validSettings || !changed)) || (!routing && !notifications.inApp && !notifications.email)} onClick={() => { void decide("confirm"); }} className="min-h-11 cursor-pointer rounded-lg bg-assistant-accent px-4 font-semibold text-assistant-surface disabled:opacity-50">{editing ? "Save changes" : "Publish workflow"}</button>
        <button type="button" disabled={disabled || pending} onClick={() => { void decide("cancel"); }} className="min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
        {editing && onAskAssistant && <button type="button" disabled={disabled || pending || !validSettings} onClick={() => onAskAssistant(workflowEditValuesSchema.parse(values))}
          className="min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4 text-sm disabled:opacity-50">Ask assistant</button>}
      </div>}
    </section>
  );
}
