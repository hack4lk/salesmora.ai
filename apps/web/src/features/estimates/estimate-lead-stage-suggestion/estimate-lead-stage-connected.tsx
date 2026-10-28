"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  estimateLeadStageReceiptSchema, estimateLeadStageReviewSchema,
  type EstimateLeadStageQuery, type EstimateLeadStageReview,
} from "@salesmora/contracts";
import { MoveStageDialog, type MoveStageDialogProps, type MoveStageRequest, type MoveStageValue } from "../../leads/move-stage-dialog/move-stage-dialog";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";
import { EstimateLeadStageSuggestion } from "./estimate-lead-stage-suggestion";
import { estimateLeadStageSuggestionData as c } from "./estimate-lead-stage-suggestion.data";

export function EstimateLeadStageConnected({
  binding, estimate, open, pending = false, canRead, onOpenChange, onDismiss, onMoved, container, printHidden,
}: {
  binding: EstimateLeadStageQuery;
  estimate: EstimateLeadStageReview["estimate"];
  open: boolean;
  pending?: boolean;
  canRead: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
  onMoved: () => void;
  container?: () => HTMLElement;
  printHidden?: boolean;
}) {
  const router = useRouter();
  const [review, setReview] = useState<EstimateLeadStageReview | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "unavailable">("loading");
  const [error, setError] = useState<MoveStageDialogProps["error"]>();
  const [value, setValue] = useState<MoveStageValue>({ to: "estimate-sent", reason: "" });
  const [working, setWorking] = useState(false);
  const submission = useRef<{ payload: string; id: string } | null>(null);
  const inFlight = useRef(false);
  const sequence = useRef(0);
  const { workspaceId, estimateId, sourceSubmissionId, expectedEstimateVersion } = binding;
  const query = `?${new URLSearchParams({
    workspace: workspaceId, sourceSubmissionId, expectedEstimateVersion: String(expectedEstimateVersion),
  })}`;
  const url = `/api/estimates/${encodeURIComponent(estimateId)}/lead-stage${query}`;
  const busy = pending || working;
  const load = useCallback((signal?: AbortSignal) => {
    const requestSequence = ++sequence.current;
    return estimateLifecycleRequest<unknown>(url, c.error, { signal }).then(raw => {
      if (signal?.aborted || requestSequence !== sequence.current) return null;
      const latest = estimateLeadStageReviewSchema.parse(raw);
      if (latest.estimate.id !== estimateId || latest.estimate.version !== expectedEstimateVersion) {
        throw new EstimateLifecycleRequestError(c.live.mismatch, 409);
      }
      setReview(latest);
      setState("ready");
      setError(undefined);
      return latest;
    }).catch((caught: unknown) => {
      if (signal?.aborted || requestSequence !== sequence.current) return null;
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setReview(null);
      setState(status === 401 || status === 404 ? "unavailable" : "error");
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.error });
      onOpenChange(false);
      if (status === 401) router.replace("/login");
      return null;
    });
  }, [estimateId, expectedEstimateVersion, onOpenChange, router, url]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  useEffect(() => {
    if (open || !canRead) return;
    const controller = new AbortController();
    const refresh = () => { if (!inFlight.current) void load(controller.signal); };
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); };
  }, [canRead, load, open]);

  async function reload(openAfter: boolean) {
    if (inFlight.current || pending) return;
    inFlight.current = true;
    setWorking(true);
    setState("loading");
    setReview(null);
    try {
      const latest = await load();
      if (latest) {
        submission.current = null;
        setValue({ to: latest.target ?? "estimate-sent", reason: "" });
        onOpenChange(openAfter && !!latest.target);
      }
    } finally { inFlight.current = false; setWorking(false); }
  }
  async function confirm(request: MoveStageRequest) {
    if (inFlight.current || busy || !canRead || !review?.target || request.to !== review.target) return;
    inFlight.current = true;
    setWorking(true);
    setError(undefined);
    const payload = {
      ...binding, leadId: request.lead.id, expectedLeadVersion: request.lead.version, to: request.to,
      ...(request.reason ? { reason: request.reason } : {}),
    };
    const fingerprint = JSON.stringify(payload);
    if (submission.current?.payload !== fingerprint) submission.current = { payload: fingerprint, id: crypto.randomUUID() };
    const submissionId = submission.current.id;
    try {
      const raw = await estimateLifecycleRequest<unknown>(url, c.live.saveError, {
        method: "POST", body: JSON.stringify({ ...payload, submissionId }),
      });
      const receipt = estimateLeadStageReceiptSchema.parse(raw);
      if (receipt.estimateId !== estimateId || receipt.leadId !== request.lead.id ||
          receipt.submissionId !== submissionId || receipt.version < request.lead.version + 1) {
        throw new Error(c.live.mismatch);
      }
      onOpenChange(false);
      onMoved();
    } catch (caught) {
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.live.saveError });
      if (status === 401 || status === 404) {
        setReview(null);
        setState("unavailable");
        onOpenChange(false);
      }
      if (status === 401) router.replace("/login");
    } finally { inFlight.current = false; setWorking(false); }
  }
  return <>
    <EstimateLeadStageSuggestion estimate={review?.estimate ?? estimate} parentType="lead"
      event={review?.event ?? null} status={review?.estimate.status ?? estimate.status}
      archived={review?.estimate.archived ?? estimate.archived} lead={review?.lead}
      canRead={canRead} state={state} pending={busy || open} error={error?.message}
      onReview={() => { void reload(true); }} onDismiss={onDismiss} onReload={() => { void reload(false); }} />
    {open && canRead && review?.target && <MoveStageDialog open container={container} printHidden={printHidden} lead={review.lead} value={value}
      allowedStages={[review.target]} pending={busy} error={error} onChange={setValue}
      onClose={() => onOpenChange(false)} onConfirm={confirm} onReload={() => reload(true)} />}
  </>;
}
