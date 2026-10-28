"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstimateArchiveReceipt } from "@salesmora/contracts";
import type { EstimateEditorSeed } from "@salesmora/data";
import { EstimateArchiveDialog } from "./estimate-archive-dialog";
import {
  initialEstimateArchiveReview, type EstimateArchiveMode, type EstimateArchiveRecord, type EstimateArchiveRequest,
} from "./estimate-archive-dialog.preview";
import { estimateArchiveDialogData as c } from "./estimate-archive-dialog.data";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";

export function EstimateArchiveReview({
  workspaceId, estimate, mode, onClose, onArchived,
}: {
  workspaceId: string;
  estimate: EstimateArchiveRecord;
  mode: EstimateArchiveMode;
  onClose: () => void;
  onArchived: (receipt: EstimateArchiveReceipt) => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(estimate);
  const [review, setReview] = useState(() => initialEstimateArchiveReview(estimate, mode));
  const [access, setAccess] = useState({ read: true, archive: false });
  const [operation, setOperation] = useState<"review" | "confirm" | null>("review");
  const [error, setError] = useState<{ kind: "error" | "conflict"; message: string }>();
  const submission = useRef<{ payload: string; id: string } | null>(null);
  const query = `?workspace=${encodeURIComponent(workspaceId)}`;
  const load = useCallback((signal?: AbortSignal, acceptNewVersion = false) => {
    return estimateLifecycleRequest<EstimateEditorSeed>(
      `/api/estimates/${encodeURIComponent(estimate.id)}${query}`, c.live.loadError, { signal },
    ).then(seed => {
      if (signal?.aborted) return;
      const record = seed.estimate;
      if (!record || record.id !== estimate.id) throw new Error(c.live.loadError);
      const latest = { ...record, name: record.values.details.name, recipientName: record.values.details.recipientName };
      setCurrent(latest);
      setAccess({ read: seed.capabilities.read, archive: seed.capabilities.archive });
      if (acceptNewVersion) {
        setReview(initialEstimateArchiveReview(latest, mode));
        submission.current = null;
      }
      setError(!acceptNewVersion && record.version !== estimate.version ? { kind: "conflict", message: c.errors.binding } : undefined);
    }).catch((caught: unknown) => {
      if (signal?.aborted) return;
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setAccess({ read: status !== 401 && status !== 404, archive: false });
      setError({ kind: "error", message: caught instanceof Error ? caught.message : c.live.loadError });
      if (status === 401) router.replace("/login");
    }).finally(() => { if (!signal?.aborted) setOperation(null); });
  }, [estimate.id, estimate.version, mode, query, router]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function confirm(request: EstimateArchiveRequest) {
    setOperation("confirm");
    setError(undefined);
    const payload = { ...request, workspaceId };
    const fingerprint = JSON.stringify(payload);
    if (submission.current?.payload !== fingerprint) submission.current = { payload: fingerprint, id: crypto.randomUUID() };
    try {
      const receipt = await estimateLifecycleRequest<EstimateArchiveReceipt>(
        `/api/estimates/${encodeURIComponent(estimate.id)}/archive${query}`, c.live.saveError,
        { method: "POST", body: JSON.stringify({ ...payload, submissionId: submission.current.id }) },
      );
      if (receipt.estimateId !== request.estimateId || receipt.archived !== (request.mode === "archive") ||
          receipt.version !== request.expectedVersion + 1) throw new Error(c.errors.binding);
      onArchived(receipt);
    } catch (caught) {
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.live.saveError });
      if (status === 401 || status === 404) setAccess({ read: false, archive: false });
      if (status === 401) router.replace("/login");
    } finally { setOperation(null); }
  }
  return <EstimateArchiveDialog open estimate={current} mode={mode} review={review} pending={operation !== null}
    pendingLabel={operation === "review" ? c.live.loading : undefined}
    capabilities={{ ...access, create: false, update: false, send: false, decide: false, void: false, delete: false, export: false }}
    error={error} onConfirm={confirm} onClose={onClose}
    onReload={() => { setOperation("review"); return load(undefined, true); }} />;
}
