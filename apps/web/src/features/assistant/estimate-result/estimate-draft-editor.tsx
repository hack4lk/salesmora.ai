"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, FormFeedback, ConfirmDialog } from "@salesmora/ui";
import { estimateDraftChatResponseSchema, type EstimateDraftChatView } from "@salesmora/contracts";
import type { EstimateEditorSeed } from "@salesmora/data";
import { EstimateItemsEditor } from "../../estimates/estimate-items-editor/estimate-items-editor";
import { EstimateScopeCard } from "../../estimates/estimate-scope-card/estimate-scope-card";
import { EstimateTotals } from "../../estimates/estimate-totals/estimate-totals";
import { EstimateTermsCard } from "../../estimates/estimate-terms-card/estimate-terms-card";
import { estimateButton } from "../../estimates/estimate-ui";
import { calculateEstimateTotals } from "@salesmora/domain";
import { estimateDraftBinding, estimateDraftRequest, estimateDraftConnectedData as c } from "./estimate-draft-client";
import { ConnectedEstimateDraft } from "./estimate-draft-result";
import { guardEstimateUnsavedNavigation } from "../../estimates/estimate-editor-page/estimate-editor-page.preview";
import { estimateEditorRouteData as editorCopy } from "../../estimates/estimate-editor-page/estimate-editor-route.data";

export function EstimateDraftProposalEditor({ initial, seed, workspaceId, initialReviewed = false }: {
  initial: EstimateDraftChatView; seed: Pick<EstimateEditorSeed, "timezone" | "paymentPresets">; workspaceId: string; initialReviewed?: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState(initial);
  const [content, setContent] = useState(initial.draft.proposed);
  const [reviewed, setReviewed] = useState(initialReviewed);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const refreshController = useRef<AbortController | null>(null);
  const checkSequence = useRef(0);
  const calculation = calculateEstimateTotals(content);
  const dirty = !reviewed && JSON.stringify(content) !== JSON.stringify(view.draft.proposed);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; refreshController.current?.abort(); };
  }, []);
  const checkCurrent = useCallback(async () => {
    const sequence = ++checkSequence.current;
    try {
      const response = await fetch(`/api/chat/estimates/draft?workspace=${workspaceId}&proposal=${view.draft.id}`, { cache: "no-store" });
      if (!response.ok) throw new Error(c.error);
      const result = estimateDraftChatResponseSchema.parse(await response.json());
      if (mounted.current && sequence === checkSequence.current) {
        setView(result.view);
        if (result.view.draft.state !== "pending") setReviewed(true);
      }
    } catch (caught) {
      if (mounted.current && sequence === checkSequence.current) throw caught;
    }
  }, [workspaceId, view.draft.id]);
  useEffect(() => {
    let active = true;
    const focus = () => {
      if (!lock.current && document.visibilityState !== "hidden") {
        void checkCurrent().catch(caught => {
          if (active) { setUnavailable(true); setError(caught instanceof Error ? caught.message : c.error); }
        });
      }
    };
    window.addEventListener("focus", focus);
    const timer = setInterval(focus, 15000);
    return () => { active = false; window.removeEventListener("focus", focus); clearInterval(timer); };
  }, [checkCurrent]);
  useEffect(() => {
    if (!dirty) return;
    return guardEstimateUnsavedNavigation(setLeaveTarget);
  }, [dirty]);
  async function refresh() {
    if (lock.current) return;
    checkSequence.current++;
    lock.current = true; setPending(true); setError("");
    const controller = new AbortController();
    refreshController.current = controller;
    try {
      const result = await estimateDraftRequest("PATCH", {
        workspaceId, request: estimateDraftBinding(view), content,
      }, controller.signal);
      if (!mounted.current) return;
      setView(result.view); setContent(result.view.draft.proposed); setReviewed(true);
      const draft = result.view.draft;
      window.history.replaceState(null, "", `/estimates/${draft.actionType === "estimate.update" ? draft.estimate.id : "new"}?workspace=${workspaceId}&proposal=${draft.id}&review=1`);
    } catch (caught) {
      if (mounted.current) setError(caught instanceof Error ? caught.message : c.error);
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  }
  return <main className="grid min-w-0 gap-6 print:hidden">
    <ConfirmDialog open={leaveTarget !== null} title={editorCopy.leaveTitle}
      description={editorCopy.leaveDescription} confirmLabel={editorCopy.discard} cancelLabel={editorCopy.stay}
      pending={pending} onClose={() => setLeaveTarget(null)} onConfirm={() => {
        if (leaveTarget) router.push(leaveTarget); setLeaveTarget(null);
      }} />
    <h1 className="m-0 text-heading font-semibold">{c.editorTitle}</h1>
    <p role="status" className="m-0 leading-6">{reviewed ? c.refreshed : c.editorNotice}</p>
    {error && <FormFeedback kind="error" message={error} />}
    {unavailable ? null : reviewed ? <ConnectedEstimateDraft view={view} workspaceId={workspaceId}
      onRefresh={checkCurrent}
      onNavigate={href => router.push(href)} /> : <>
      <TextField name="proposalName" label={c.name} value={content.name} disabled={pending}
        onChange={event => setContent({ ...content, name: event.target.value })}
        slotProps={{ htmlInput: { maxLength: 120 } }} />
      <EstimateScopeCard value={content.scope} status="draft" canEdit pending={pending}
        onChange={scope => setContent({ ...content, scope })} />
      <EstimateItemsEditor items={content.items} status="draft" canEdit pending={pending} showErrors
        onChange={items => setContent({ ...content, items: items.map(item => ({
          id: item.id, description: item.description, quantity: item.quantity, unitPrice: item.unitPrice,
          unit: item.unit ?? "", taxable: item.taxable, included: item.included,
          priceSource: { type: item.unitPrice.trim() ? "user" : "missing" },
        })) })} />
      <EstimateTotals items={content.items} value={{ discount: content.discount, taxRate: content.taxRate }}
        deposit={content.deposit} status="draft" canEdit pending={pending}
        onChange={totals => setContent({ ...content, ...totals })} />
      <EstimateTermsCard value={{
        message: content.message, paymentTerms: content.paymentTerms, termsNote: content.termsNote,
        validUntil: content.validUntil, deposit: content.deposit,
      }} timezone={seed.timezone} calculation={calculation} paymentPresets={seed.paymentPresets}
        status="draft" canEdit pending={pending} onChange={terms => setContent({ ...content, ...terms })} />
      <button type="button" disabled={pending} className={`${estimateButton} justify-self-start`}
        onClick={() => { void refresh(); }}>{c.refresh}</button>
    </>}
  </main>;
}
