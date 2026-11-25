"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceAssistant } from "../assistant/workspace-assistant/workspace-assistant";
import Dialog from "@mui/material/Dialog";
import { FormFeedback } from "@salesmora/ui";
import type { WorkflowEditData, WorkflowEditValues } from "@salesmora/contracts";
import { workflowRuleDescription } from "@salesmora/domain";
import type { WorkflowSummary } from "./workflows-page";
import { WorkflowDraftCard } from "./workflow-draft-card";

export type WorkflowEditHandlers = {
  onLoadEdit: (row: WorkflowSummary) => Promise<WorkflowEditData>;
  onSaveEdit: (row: WorkflowSummary, values: WorkflowEditValues, requestId: string) => Promise<void>;
  onAskAssistant?: (prompt: string) => void;
};

export function WorkflowEditDialog({ row, onLoadEdit, onSaveEdit, onAskAssistant, onClose }: WorkflowEditHandlers & { row: WorkflowSummary; onClose: () => void }) {
  const id = useId(),router=useRouter(),assistant=useWorkspaceAssistant();
  const load = useEffectEvent(onLoadEdit);
  const [data, setData] = useState<WorkflowEditData>();
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submission = useRef<{ hash: string; id: string } | null>(null);
  useEffect(() => {
    let active = true;
    void load(row).then(result => { if (active) { setData(result); setError(false); } }, () => { if (active) setError(true); });
    return () => { active = false; };
  }, [row, attempt]);
  return <Dialog open onClose={() => { if (!pending) onClose(); }} aria-labelledby={id} fullWidth maxWidth="sm">
    <div className="grid gap-3 bg-assistant-surface p-4 text-assistant-foreground">
      <h2 id={id} className="sr-only">Edit {row.name}</h2>
      {error ? <>
        <FormFeedback kind="error" message="Couldn't open this workflow for editing. It may have changed or your access may have changed." />
        <div className="flex gap-3"><button type="button" onClick={() => { setError(false); setAttempt(value => value + 1); }} className="min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4">Try again</button>
          <button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-lg border border-assistant-border px-4">Cancel</button></div>
      </> : !data ? <><p role="status" className="m-0 p-4 text-sm">Loading workflow…</p><button type="button" onClick={onClose} className="min-h-11 w-fit cursor-pointer rounded-lg border border-assistant-border px-4">Cancel</button></> : <WorkflowDraftCard
        draft={{ id: data.workflow.id, workspaceId: data.workflow.workspaceId, name: data.workflow.name, rule: workflowRuleDescription(data.workflow.definition), definition: data.workflow.definition,
          expiresAt: null, state: "pending", editing: { id: row.id, version: data.workflow.version, status: data.workflow.status } }}
        customerVisitOptions={data.scheduleChangeOptions??data.postJobOptions??data.customerVisitOptions} routingOptions={data.routingOptions} recipients={data.recipients} sources={data.sources} services={data.bookingOptions?.services} availabilityReady={data.bookingOptions?.availabilityReady} qualifiedWorkerCounts={data.bookingOptions?.qualifiedWorkerCounts} canSelectWorkers={data.bookingOptions?.canSelectWorkers} onManageWorkers={()=>{assistant?.setOpen(false);onClose();router.push(`/settings/services?workspace=${data.workflow.workspaceId}`);}} onManageAvailability={()=>{assistant?.setOpen(false);onClose();router.push(`/calendar?workspace=${row.id?data.workflow.workspaceId:""}`);}} disabled={pending}
        onAskAssistant={onAskAssistant ? values => {
          const team=values.routing?values.routing.memberIds.map(id=>data.routingOptions?.members.find(member=>member.id===id)?.name??id).join(', '):undefined;
          const person = data.recipients.find(recipient => recipient.id === values.recipientId);
          onAskAssistant(`Help me edit workflow ${row.id} (${data.workflow.name}). My current review choices are: name ${JSON.stringify(values.name)}, ${data.workflow.definition.kind === "lead_routing" ? `source ${data.sources?.find(source => source.id === values.sourceId)?.name ?? data.workflow.definition.sourceName}, assign to` : `send at ${values.localTime} in ${data.workflow.definition.timezone}, recipient`} ${team?`${values.routing!.strategy==='round_robin'?'Take turns':values.routing!.strategy==='fewest_open_leads'?'Fewest open leads':'One teammate'}, team ${team}, ZIP matching ${values.routing!.matchWorkZipCodes?'on':'off'}`:person?.name ?? data.workflow.definition.recipientName}${values.businessDays === null ? "" : `, delay ${values.businessDays} business days`}, in-app ${values.notifications.inApp ? "on" : "off"}, email ${values.notifications.email ? "on" : "off"}. Ask me what I want to change before preparing an edit.`);
          onClose();
        } : undefined}
        onDecide={async (decision, _notifications, _time, values) => {
          if (decision === "cancel") { onClose(); return; }
          if (!values || pending) return;
          const hash = JSON.stringify(values);
          if (submission.current?.hash !== hash) submission.current = { hash, id: crypto.randomUUID() };
          setPending(true);
          try { await onSaveEdit(row, values, submission.current.id); onClose(); }
          finally { setPending(false); }
        }} />}
    </div>
  </Dialog>;
}
