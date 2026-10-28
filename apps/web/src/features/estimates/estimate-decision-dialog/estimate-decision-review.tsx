"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstimateDecisionReceipt, EstimateDecisionReview as DecisionReview } from "@salesmora/contracts";
import { EstimateDecisionDialog } from "./estimate-decision-dialog";
import {
  initialEstimateDecisionValues, type EstimateDecisionMode, type EstimateDecisionRequest,
} from "./estimate-decision-dialog.preview";
import { estimateDecisionDialogData } from "./estimate-decision-dialog.data";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";

const c = estimateDecisionDialogData.live;
export function EstimateDecisionReview({
  workspaceId, review, mode, outcome, onClose, onRecorded,
}: {
  workspaceId: string;
  review: DecisionReview;
  mode: EstimateDecisionMode;
  outcome: "accepted" | "declined";
  onClose: () => void;
  onRecorded: (receipt: EstimateDecisionReceipt, suggestionSource: string | null) => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(review);
  const [value, setValue] = useState(() => initialEstimateDecisionValues(review.estimate, review.today, outcome));
  const [readable, setReadable] = useState(true);
  const [operation, setOperation] = useState<"review" | "confirm" | null>("review");
  const [error, setError] = useState<{ kind: "error" | "conflict"; message: string }>();
  const submission = useRef<{ payload: string; id: string } | null>(null);
  const query = `?workspace=${encodeURIComponent(workspaceId)}`;
  const load = useCallback((signal?: AbortSignal, acceptNewVersion = false) => {
    return estimateLifecycleRequest<DecisionReview>(
      `/api/estimates/${encodeURIComponent(review.estimate.id)}/decision${query}`, c.loadError, { signal },
    ).then(latest => {
      if (signal?.aborted) return;
      if (latest.estimate.id !== review.estimate.id) throw new Error(c.mismatch);
      setCurrent(latest);
      setReadable(true);
      if (acceptNewVersion) {
        setValue(initialEstimateDecisionValues(latest.estimate, latest.today, outcome));
        submission.current = null;
      }
      setError(!acceptNewVersion && (latest.estimate.version !== review.estimate.version ||
        latest.snapshotHash !== review.snapshotHash || latest.estimate.decision?.id !== review.estimate.decision?.id)
        ? { kind: "conflict", message: c.mismatch } : undefined);
    }).catch((caught: unknown) => {
      if (signal?.aborted) return;
      setError({ kind: "error", message: caught instanceof Error ? caught.message : c.loadError });
      setReadable(!(caught instanceof EstimateLifecycleRequestError && [401, 404].includes(caught.status)));
      setCurrent(previous => ({ ...previous, canDecide: false, canCorrectDecision: false }));
      if (caught instanceof EstimateLifecycleRequestError && caught.status === 401) router.replace("/login");
    }).finally(() => { if (!signal?.aborted) setOperation(null); });
  }, [outcome, query, review.estimate.id, review.estimate.version, review.estimate.decision?.id, review.snapshotHash, router]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function confirm(request: EstimateDecisionRequest) {
    setOperation("confirm");
    setError(undefined);
    const payload = {
      ...request, workspaceId, snapshotHash: current.snapshotHash,
      expectedDecisionId: current.estimate.decision?.id ?? null,
    };
    const fingerprint = JSON.stringify(payload);
    if (submission.current?.payload !== fingerprint) submission.current = { payload: fingerprint, id: crypto.randomUUID() };
    try {
      const receipt = await estimateLifecycleRequest<EstimateDecisionReceipt>(
        `/api/estimates/${encodeURIComponent(review.estimate.id)}/decision${query}`, c.saveError,
        { method: "POST", body: JSON.stringify({ ...payload, submissionId: submission.current.id }) },
      );
      if (receipt.estimateId !== request.estimateId || receipt.status !== request.outcome ||
          receipt.version !== request.expectedVersion + 1 || !receipt.decisionId) throw new Error(c.mismatch);
      onRecorded(receipt, receipt.status === "declined" && current.estimate.decision?.outcome !== "declined"
        ? submission.current.id : null);
    } catch (caught) {
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.saveError });
      if (status === 401 || status === 404) {
        setReadable(false);
        setCurrent(previous => ({ ...previous, canDecide: false, canCorrectDecision: false }));
      }
      if (status === 401) router.replace("/login");
    } finally { setOperation(null); }
  }
  return <EstimateDecisionDialog open estimate={current.estimate} mode={mode} value={value} onChange={setValue}
    today={current.today} timezone={current.timezone} canCorrectDecision={current.canCorrectDecision}
    convertedJob={current.convertedJob} pending={operation !== null} pendingLabel={operation === "review" ? c.loading : undefined}
    capabilities={{
      read: readable, decide: current.canDecide,
      create: false, update: false, send: false, void: false, archive: false, delete: false, export: false,
    }}
    error={error} onConfirm={confirm} onClose={onClose}
    onReload={() => { setOperation("review"); return load(undefined, true); }} />;
}
