"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  planChangeResultSchema,
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
import { useQueryClient } from "@tanstack/react-query";
import { useApiQueryScope } from "../../api/api-query-provider";
import { useApiQuery } from "../../api/use-api-query";
import { isApiAccessError } from "../../api/api-query";
import { billingInvoiceOptions, billingSummaryOptions, cancelBillingReads } from "../../billing/billing-queries";
import { BillingQueryBoundary, useBillingAccessError, useBillingMutation } from "../../billing/use-billing-request";

export function BillingRoute(props: Parameters<typeof BillingRouteContent>[0]) {
  return <BillingQueryBoundary workspaceId={props.workspaceId} unavailable={copy.denied}><BillingRouteContent {...props}/></BillingQueryBoundary>;
}
function BillingRouteContent({
  workspaceId,
  viewerRole,
  initialSnapshot,
  publishableKey,
}: {
  workspaceId: string;
  viewerRole: WorkspaceRole;
  initialSnapshot: WorkspaceBillingSnapshot;
  publishableKey?: string;
}) {
  const [invoiceHistoryState, setInvoiceHistoryState] = useState<'ready' | 'loading' | 'error'>('ready');
  const historyRequest = useRef(false), historyVersion = useRef(0);
  const mounted = useRef(true), refreshing = useRef(false), undoing = useRef(false);
  const scope = useApiQueryScope(), client = useQueryClient(), deny = useBillingAccessError();
  const summary = useApiQuery({ ...billingSummaryOptions(scope, copy.error), enabled: false });
  const plan = useBillingMutation('/api/billing/plan', planChangeResultSchema.parse, planChangeData.error);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void cancelBillingReads(client, scope);
    };
  }, [client, scope]);
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
  function open(mode: "plan" | "cancel") {
    setDialogBusy(false);
    setPaymentActive(false);
    setDialogMode(mode);
  }
  function close() {
    if (!dialogBusy) setDialogMode(null);
  }
  async function refresh(throwOnError = false) {
    if (refreshing.current) {
      if (throwOnError) throw new Error(copy.loading);
      return;
    }
    refreshing.current = true;
    historyVersion.current++;
    historyRequest.current = false;
    setInvoiceHistoryState("ready");
    setState("loading");
    try {
      await cancelBillingReads(client, scope);
      const result = await summary.refetch({ throwOnError: true });
      if (!mounted.current || result.data === undefined) throw new Error(copy.error);
      setSnapshot(result.data);
      setState("ready");
    } catch (error) {
      if (mounted.current) {
        deny(error);
        if (isApiAccessError(error)) router.refresh();
        setState("error");
      }
      if (throwOnError) throw error;
    } finally {
      refreshing.current = false;
    }
  }
  async function loadOlderInvoices() {
    if (historyRequest.current || state !== 'ready' || !snapshot.hasMoreInvoices || !snapshot.providerAvailable) return;
    const after = snapshot.invoices.at(-1)?.id;
    if (!after) return;
    const version = historyVersion.current;
    historyRequest.current = true;
    setInvoiceHistoryState('loading');
    try {
      const page = await client.fetchQuery(billingInvoiceOptions(scope, after, copy.historyError));
      if (!mounted.current || version !== historyVersion.current) return;
      setSnapshot(previous => {
        const known = new Set(previous.invoices.map(invoice => invoice.id));
        return { ...previous, invoices: [...previous.invoices, ...page.invoices.filter(invoice => !known.has(invoice.id))], hasMoreInvoices: page.hasMore };
      });
      setInvoiceHistoryState('ready');
    } catch (error) {
      if (mounted.current && version === historyVersion.current) {
        deny(error);
        if (isApiAccessError(error)) router.refresh();
        setInvoiceHistoryState('error');
      }
    } finally {
      if (version === historyVersion.current) historyRequest.current = false;
    }
  }
  async function undo() {
    if (undoing.current || !snapshot.change) return;
    undoing.current = true;
    setUndoPending(true);
    setUndoError(false);
    try {
      await plan.request({
        workspaceId,
        action: "undo",
        quoteId: snapshot.change.id,
      }, true);
      await refresh(true);
    } catch {
      if (mounted.current) setUndoError(true);
    } finally {
      undoing.current = false;
      if (mounted.current) setUndoPending(false);
    }
  }
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
      {recoveryOpen && viewerRole === "owner" && <ConnectedPaymentRecoveryDialog workspaceId={workspaceId} snapshot={snapshot} publishableKey={publishableKey} onClose={()=>setRecoveryOpen(false)} onUpdated={()=>refresh(true)} />}
      {cardOpen && viewerRole === "owner" && (
        <ConnectedPaymentMethodDialog
          workspaceId={workspaceId}
          snapshot={snapshot}
          publishableKey={publishableKey}
          onClose={() => setCardOpen(false)}
          onUpdated={()=>refresh(true)}
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
            onUpdated={()=>refresh(true)}
            onBusyChange={setDialogBusy}
            onPaymentChange={setPaymentActive}
          />
        )}
      </PlanChangeDialog>
    </div>
  );
}
