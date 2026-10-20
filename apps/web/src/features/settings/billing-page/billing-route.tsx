"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  billingInvoiceHistorySchema,
  workspaceBillingSnapshotSchema,
  type WorkspaceBillingSnapshot,
  type WorkspaceRole,
} from "@salesmora/contracts";
import { ConnectedPaymentRecoveryDialog } from "../../billing/payment-recovery-dialog/connected-payment-recovery-dialog";
import { ConnectedPaymentMethodDialog } from "../../billing/payment-method-dialog/connected-payment-method-dialog";
import { ConnectedPlanChange } from "../../billing/plan-change/connected-plan-change";
import { PlanChangeDialog } from "../../billing/plan-change-dialog/plan-change-dialog";
import { planChangeData } from "../../billing/plan-change/plan-change.data";
import { BillingPage } from "./billing-page";
import { billingPageData as copy } from "./billing-page.data";

export function BillingRoute(props:Parameters<typeof BillingRouteContent>[0]) {
  return <BillingRouteContent key={props.workspaceId} {...props}/>;
}
function BillingRouteContent({
  workspaceId,
  workspaceName,
  viewerRole,
  initialSnapshot,
  publishableKey,
}: {
  workspaceId: string;
  workspaceName: string;
  viewerRole: WorkspaceRole;
  initialSnapshot: WorkspaceBillingSnapshot;
  publishableKey?: string;
}) {
  const [invoiceHistoryState,setInvoiceHistoryState]=useState<'ready'|'loading'|'error'>('ready');
  const historyRequest=useRef<AbortController|null>(null);
  const historyVersion=useRef(0);
  useEffect(()=>()=>{historyRequest.current?.abort();},[]);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const planTriggerRef = useRef<HTMLButtonElement>(null);
  const [dialogMode, setDialogMode] = useState<"plan" | "cancel" | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [paymentActive, setPaymentActive] = useState(false);
  const [undoPending, setUndoPending] = useState(false);
  const [undoError, setUndoError] = useState(false);
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [state, setState] = useState<"ready" | "loading" | "error">("ready");
  const [denied, setDenied] = useState(false);
  function open(mode: "plan" | "cancel") {
    setDialogBusy(false);
    setPaymentActive(false);
    setDialogMode(mode);
  }
  function close() {
    if (!dialogBusy) setDialogMode(null);
  }
  async function refresh() {
    if (state === "loading") return;
    historyVersion.current++;historyRequest.current?.abort();historyRequest.current=null;setInvoiceHistoryState("ready");
    setState("loading");
    try {
      const response = await fetch(
        `/api/billing/summary?workspace=${encodeURIComponent(workspaceId)}`,
        { cache: "no-store" },
      );
      if (response.status === 401 || response.status === 403) {
        setDenied(true);
        router.refresh();
        return;
      }
      if (!response.ok) throw Error("Unavailable");
      setSnapshot(workspaceBillingSnapshotSchema.parse(await response.json()));
      setState("ready");
    } catch {
      setState("error");
    }
  }
  async function loadOlderInvoices(){
    if(historyRequest.current||state!=='ready'||!snapshot.hasMoreInvoices||!snapshot.providerAvailable)return;
    const after=snapshot.invoices.at(-1)?.id;if(!after)return;
    const controller=new AbortController(),version=historyVersion.current;
    historyRequest.current=controller;setInvoiceHistoryState('loading');
    try{
      const response=await fetch(`/api/billing/invoices?workspace=${encodeURIComponent(workspaceId)}&after=${encodeURIComponent(after)}`,{cache:'no-store',signal:controller.signal});
      if(controller.signal.aborted||version!==historyVersion.current)return;
      if([401,403].includes(response.status)){setDenied(true);router.refresh();return;}
      if(!response.ok)throw Error('Invoice history unavailable');
      const page=billingInvoiceHistorySchema.parse(await response.json());
      if(controller.signal.aborted||version!==historyVersion.current)return;
      setSnapshot(previous=>{
        const known=new Set(previous.invoices.map(invoice=>invoice.id));
        return {...previous,invoices:[...previous.invoices,...page.invoices.filter(invoice=>!known.has(invoice.id))],hasMoreInvoices:page.hasMore};
      });
      setInvoiceHistoryState('ready');
    }catch{if(!controller.signal.aborted&&version===historyVersion.current)setInvoiceHistoryState('error');}
    finally{if(historyRequest.current===controller)historyRequest.current=null;}
  }
  async function undo() {
    if (undoPending || !snapshot.change) return;
    setUndoPending(true);
    setUndoError(false);
    try {
      const response = await fetch("/api/billing/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          action: "undo",
          quoteId: snapshot.change.id,
        }),
      });
      if (!response.ok) throw Error();
      await refresh();
    } catch {
      setUndoError(true);
    } finally {
      setUndoPending(false);
    }
  }
  if (denied) return <p role="alert">{copy.denied}</p>;
  return (
    <div className="grid gap-6">
      {undoError && (
        <p role="alert" className="text-error">
          {planChangeData.error}
        </p>
      )}
      <BillingPage
        onLoadOlderInvoices={()=>void loadOlderInvoices()}
        invoiceHistoryState={invoiceHistoryState}
        planTriggerRef={planTriggerRef}
        viewerRole={viewerRole}
        workspaceName={workspaceName}
        settingsHref={`/settings?workspace=${encodeURIComponent(workspaceId)}`}
        onRecoverPayment={viewerRole === "owner" && snapshot.providerAvailable ? () => setRecoveryOpen(true) : undefined}
        onManagePayment={
          viewerRole === "owner" && snapshot.providerAvailable
            ? () => setCardOpen(true)
            : undefined
        }
        onChangePlan={viewerRole === "owner" ? () => open("plan") : undefined}
        onCancelSubscription={
          viewerRole === "owner" ? () => open("cancel") : undefined
        }
        onKeepSubscription={
          viewerRole === "owner" && snapshot.change?.status === "scheduled"
            ? () => void undo()
            : undefined
        }
        snapshot={state === "ready" ? snapshot : undefined}
        state={state}
        onAction={(action) => {
          if (action === "retry") void refresh();
        }}
      />
      {snapshot.change?.status === "scheduled" &&
        !snapshot.cancelAtPeriodEnd && (
          <p
            role="status"
            className="rounded-xl border border-primary bg-canvas p-4 text-ink"
          >
            {planChangeData.scheduledLabel}:{" "}
            {planChangeData.names[snapshot.change.plan]} ·{" "}
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "long",
              timeZone: "UTC",
            }).format(new Date(snapshot.change.effectiveAt))}
            {viewerRole === "owner" && (
              <button
                type="button"
                disabled={undoPending}
                onClick={() => void undo()}
                className="ml-4 min-h-11 cursor-pointer rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:cursor-wait focus-visible:focus-ring"
              >
                {undoPending ? planChangeData.busy : planChangeData.undo}
              </button>
            )}
          </p>
        )}
      <div>
        <button
          type="button"
          disabled={state === "loading"}
          onClick={() => void refresh()}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas disabled:cursor-wait focus-visible:focus-ring"
        >
          {copy.refresh}
        </button>
      </div>
      {recoveryOpen && viewerRole === "owner" && <ConnectedPaymentRecoveryDialog workspaceId={workspaceId} snapshot={snapshot} publishableKey={publishableKey} onClose={()=>setRecoveryOpen(false)} onUpdated={refresh} />}
      {cardOpen && viewerRole === "owner" && (
        <ConnectedPaymentMethodDialog
          workspaceId={workspaceId}
          snapshot={snapshot}
          publishableKey={publishableKey}
          onClose={() => setCardOpen(false)}
          onUpdated={refresh}
        />
      )}
      <PlanChangeDialog
        open={!!dialogMode}
        mode={dialogMode ?? "plan"}
        busy={dialogBusy}
        paymentActive={paymentActive}
        onClose={close}
        onClosed={() => {
          if (document.activeElement === document.body)
            planTriggerRef.current?.focus();
        }}
      >
        {dialogMode && viewerRole === "owner" && (
          <ConnectedPlanChange
            workspaceId={workspaceId}
            snapshot={snapshot}
            publishableKey={publishableKey}
            mode={dialogMode}
            onClose={close}
            onUpdated={refresh}
            onBusyChange={setDialogBusy}
            onPaymentChange={setPaymentActive}
          />
        )}
      </PlanChangeDialog>
    </div>
  );
}
