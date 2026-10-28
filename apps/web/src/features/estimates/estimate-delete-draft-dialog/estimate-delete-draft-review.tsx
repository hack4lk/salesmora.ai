"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstimateEditorSeed } from "@salesmora/data";
import { EstimateDeleteDraftDialog } from "./estimate-delete-draft-dialog";
import { estimateDeleteDraftDialogData as c } from "./estimate-delete-draft-dialog.data";
import {
  initialEstimateDeleteDraftValues, type EstimateDeleteDraftRecord, type EstimateDeleteDraftRequest,
} from "./estimate-delete-draft-dialog.preview";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";

export function EstimateDeleteDraftReview({
  workspaceId, estimate, onClose, onDeleted,
}: {
  workspaceId: string;
  estimate: EstimateDeleteDraftRecord;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(estimate);
  const [value, setValue] = useState(() => initialEstimateDeleteDraftValues(estimate));
  const [access, setAccess] = useState({ read: true, delete: false });
  const [operation, setOperation] = useState<"review" | "confirm" | null>("review");
  const [error, setError] = useState<{ kind: "error" | "conflict"; message: string }>();
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
      setAccess({ read: seed.capabilities.read, delete: seed.capabilities.delete });
      if (acceptNewVersion) setValue(initialEstimateDeleteDraftValues(latest));
      setError(!acceptNewVersion && record.version !== estimate.version
        ? { kind: "conflict", message: c.errors.binding } : undefined);
    }).catch((caught: unknown) => {
      if (signal?.aborted) return;
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setAccess({ read: status !== 401 && status !== 404, delete: false });
      setError({ kind: "error", message: caught instanceof Error ? caught.message : c.live.loadError });
      if (status === 401) router.replace("/login");
    }).finally(() => { if (!signal?.aborted) setOperation(null); });
  }, [estimate.id, estimate.version, query, router]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function confirm(request: EstimateDeleteDraftRequest) {
    setOperation("confirm");
    setError(undefined);
    try {
      const receipt = await estimateLifecycleRequest<{ deleted: boolean; id: string }>(
        `/api/estimates/${encodeURIComponent(estimate.id)}${query}`, c.live.saveError,
        { method: "DELETE", body: JSON.stringify({ ...request, workspaceId }) },
      );
      if (receipt.deleted !== true || receipt.id !== request.estimateId) throw new Error(c.live.saveError);
      onDeleted();
    } catch (caught) {
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.live.saveError });
      if (status === 401 || status === 404) setAccess({ read: false, delete: false });
      if (status === 401) router.replace("/login");
    } finally { setOperation(null); }
  }
  return <EstimateDeleteDraftDialog open estimate={current} value={value} onChange={setValue}
    pending={operation !== null} pendingLabel={operation === "review" ? c.live.loading : undefined}
    capabilities={{ ...access, create: false, update: false, send: false, decide: false, void: false, archive: false, export: false }}
    error={error} onConfirm={confirm} onClose={onClose}
    onReload={() => { setOperation("review"); return load(undefined, true); }} />;
}
