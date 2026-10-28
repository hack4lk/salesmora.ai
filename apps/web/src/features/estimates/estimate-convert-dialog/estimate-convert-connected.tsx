"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog, FormFeedback } from "@salesmora/ui";
import {
  estimateConversionReceiptSchema,
  estimateConversionReviewSchema,
  type EstimateConversionReceipt,
  type EstimateConversionReview as ConversionReview,
} from "@salesmora/contracts";
import { EstimateConvertDialog } from "./estimate-convert-dialog";
import { estimateConvertDialogData as c } from "./estimate-convert-dialog.data";
import type { EstimateConversionRequest } from "./estimate-convert-dialog.preview";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";
import type { EstimateCapabilities } from "../estimate-preview.types";

const denied: EstimateCapabilities = {
  read: false,
  create: false,
  update: false,
  send: false,
  decide: false,
  void: false,
  archive: false,
  delete: false,
  export: false,
};

export function EstimateConvertConnected({
  workspaceId,
  estimateId,
  expectedVersion,
  expectedSnapshotHash,
  open,
  onClose,
  onConverted,
  onAccessLost,
}: {
  workspaceId: string;
  estimateId: string;
  expectedVersion: number;
  expectedSnapshotHash: string;
  open: boolean;
  onClose: () => void;
  onConverted: (receipt: EstimateConversionReceipt) => void;
  onAccessLost: () => void;
}) {
  const router = useRouter();
  const [review, setReview] = useState<ConversionReview | null>(null);
  const [operation, setOperation] = useState<"review" | "confirm" | null>("review");
  const [error, setError] = useState<{ kind: "error" | "conflict"; message: string }>();
  const [readable, setReadable] = useState(true);
  const sequence = useRef(0);
  const inFlight = useRef(false);
  const resolvingCustomer = useRef(false);
  const submission = useRef<{ payload: string; id: string } | null>(null);
  const query = `?workspace=${encodeURIComponent(workspaceId)}`;
  const url = `/api/estimates/${encodeURIComponent(estimateId)}/convert${query}`;

  const load = useCallback((signal?: AbortSignal, acceptNewVersion = false) => {
    const requestSequence = ++sequence.current;
    setOperation("review");
    return estimateLifecycleRequest<unknown>(url, c.live.reviewError, { signal }).then((raw) => {
      if (signal?.aborted || requestSequence !== sequence.current) return null;
      const parsed = estimateConversionReviewSchema.safeParse(raw);
      if (!parsed.success) throw new Error(c.live.mismatch);
      const latest = parsed.data;
      if (latest.estimate.id !== estimateId) throw new Error(c.live.mismatch);
      setReview(latest);
      setReadable(true);
      setError(!acceptNewVersion && (
        latest.estimate.version !== expectedVersion ||
        latest.estimate.snapshotHash !== expectedSnapshotHash
      ) ? { kind: "conflict", message: c.live.mismatch } : undefined);
      return latest;
    }).catch((caught: unknown) => {
      if (signal?.aborted || requestSequence !== sequence.current) return null;
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setReview(null);
      setReadable(!(status === 401 || status === 404));
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.live.reviewError });
      if (status === 401) router.replace("/login");
      if (status === 401 || status === 404) onAccessLost();
      return null;
    }).finally(() => {
      if (!signal?.aborted && requestSequence === sequence.current) setOperation(null);
    });
  }, [estimateId, expectedSnapshotHash, expectedVersion, onAccessLost, router, url]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(() => { void load(controller.signal); },0);
    return () => {
      clearTimeout(timer);controller.abort();
      sequence.current += 1;
    };
  }, [load, open]);

  useEffect(() => {
    if (!open) return;
    const refreshAfterCustomerResolution = () => {
      if (!resolvingCustomer.current || document.visibilityState !== "visible" || inFlight.current) return;
      resolvingCustomer.current = false;
      void load(undefined, true);
    };
    window.addEventListener("focus", refreshAfterCustomerResolution);
    document.addEventListener("visibilitychange", refreshAfterCustomerResolution);
    return () => {
      window.removeEventListener("focus", refreshAfterCustomerResolution);
      document.removeEventListener("visibilitychange", refreshAfterCustomerResolution);
    };
  }, [load, open]);

  async function confirm(request: EstimateConversionRequest) {
    if (inFlight.current || operation || !review || !readable) return;
    inFlight.current = true;
    setOperation("confirm");
    setError(undefined);
    const payload = { ...request, workspaceId };
    const fingerprint = JSON.stringify(payload);
    if (submission.current?.payload !== fingerprint) {
      submission.current = { payload: fingerprint, id: crypto.randomUUID() };
    }
    const submissionId = submission.current.id;
    try {
      const raw = await estimateLifecycleRequest<unknown>(url, c.live.saveError, {
        method: "POST",
        body: JSON.stringify({ ...payload, submissionId }),
      });
      const parsed = estimateConversionReceiptSchema.safeParse(raw);
      if (!parsed.success) throw new Error(c.live.mismatch);
      const receipt = parsed.data;
      if (receipt.estimateId !== estimateId || receipt.version !== request.expectedVersion ||
        !receipt.job.id || !receipt.job.href.startsWith(`/jobs/${receipt.job.id}?workspace=`)) {
        throw new Error(c.live.mismatch);
      }
      onConverted(receipt);
    } catch (caught) {
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.live.saveError });
      if (status === 401 || status === 404) {
        setReview(null);
        setReadable(false);
        onAccessLost();
      }
      if (status === 401) router.replace("/login");
    } finally {
      inFlight.current = false;
      setOperation(null);
    }
  }

  function resolveCustomer() {
    resolvingCustomer.current = true;
    const customersUrl = `/customers?workspace=${encodeURIComponent(workspaceId)}`;
    const child = window.open(customersUrl, "_blank");
    if (child) child.opener = null;
    else router.push(customersUrl);
  }

  async function reload() {
    if (inFlight.current) return;
    submission.current = null;
    await load(undefined, true);
  }

  if (!open) return null;
  if (!review) {
    return <ConfirmDialog open title={c.title} description={c.description} confirmLabel={c.live.close}
      pending={operation !== null} pendingLabel={c.live.loading} onClose={onClose} onConfirm={onClose}>
      {error ? <div className="grid justify-items-start gap-3">
        <FormFeedback kind="error" message={error.message} />
        <button type="button" className="min-h-11 rounded-xl border border-line px-4 py-2 text-sm font-semibold"
          disabled={operation !== null} onClick={() => { void reload(); }}>{c.live.retry}</button>
      </div> : <p role="status" className="m-0 text-sm leading-6 text-muted">{c.live.loading}</p>}
    </ConfirmDialog>;
  }

  const { parentJob, ...dialogReview } = review;
  return <EstimateConvertDialog
    {...dialogReview}
    parentJob={parentJob ?? undefined}
    capabilities={{ ...denied, read: readable && review.capabilities.read }}
    open
    pending={operation !== null}
    error={error}
    onConfirm={confirm}
    onResolveCustomer={review.canResolveCustomer ? resolveCustomer : undefined}
    onReload={reload}
    onClose={onClose}
  />;
}
