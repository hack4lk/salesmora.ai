"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstimateVoidReceipt } from "@salesmora/contracts";
import type { EstimateEditorSeed } from "@salesmora/data";
import { EstimateVoidDialog } from "./estimate-void-dialog";
import { initialEstimateVoidValues, type EstimateVoidRecord, type EstimateVoidRequest } from "./estimate-void-dialog.preview";
import { estimateLifecycleData as c, estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";

export function EstimateVoidReview({
  workspaceId, estimate, onClose, onVoided,
}: {
  workspaceId: string;
  estimate: EstimateVoidRecord;
  onClose: () => void;
  onVoided: (receipt: EstimateVoidReceipt) => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(estimate);
  const [value, setValue] = useState(() => initialEstimateVoidValues(estimate));
  const [access, setAccess] = useState({ read: true, void: true });
  const [operation, setOperation] = useState<"review" | "void" | null>("review");
  const [error, setError] = useState<{ kind: "error" | "conflict"; message: string }>();
  const submission = useRef<{ payload: string; id: string } | null>(null);
  const query = `?workspace=${encodeURIComponent(workspaceId)}`;
  const load = useCallback((signal?: AbortSignal, acceptNewVersion = false) => {
    return estimateLifecycleRequest<EstimateEditorSeed>(
      `/api/estimates/${encodeURIComponent(estimate.id)}${query}`, c.reviewError, { signal },
    ).then(seed => {
      if (signal?.aborted) return;
      const record = seed.estimate;
      if (!record || record.id !== estimate.id) throw new Error(c.reviewError);
      const reviewed = { ...record, name: record.values.details.name, recipientName: record.values.details.recipientName };
      setCurrent(reviewed);
      setAccess({ read: seed.capabilities.read, void: seed.capabilities.void });
      if (acceptNewVersion) {
        setValue(initialEstimateVoidValues(reviewed));
        submission.current = null;
      }
      setError(!acceptNewVersion && record.version !== estimate.version ? { kind: "conflict", message: c.mismatch } : undefined);
    }).catch((caught: unknown) => {
      if (signal?.aborted) return;
      setError({ kind: "error", message: caught instanceof Error ? caught.message : c.reviewError });
      setAccess({ read: !(caught instanceof EstimateLifecycleRequestError && [401, 404].includes(caught.status)), void: false });
      if (caught instanceof EstimateLifecycleRequestError && caught.status === 401) router.replace("/login");
    }).finally(() => {
      if (!signal?.aborted) setOperation(null);
    });
  }, [estimate.id, estimate.version, query, router]);
  useEffect(() => {
    const abort = new AbortController();
    void load(abort.signal);
    return () => abort.abort();
  }, [load]);

  async function confirm(request: EstimateVoidRequest) {
    setOperation("void");
    setError(undefined);
    const payload = { ...request, workspaceId };
    const fingerprint = JSON.stringify(payload);
    if (submission.current?.payload !== fingerprint) submission.current = { payload: fingerprint, id: crypto.randomUUID() };
    try {
      const receipt = await estimateLifecycleRequest<EstimateVoidReceipt>(
        `/api/estimates/${encodeURIComponent(estimate.id)}/void${query}`, c.voidError,
        { method: "POST", body: JSON.stringify({ ...payload, submissionId: submission.current.id }) },
      );
      if (receipt.estimateId !== request.estimateId || receipt.status !== "void" || receipt.version !== request.expectedVersion + 1) {
        throw new Error(c.mismatch);
      }
      onVoided(receipt);
    } catch (caught) {
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      setError({ kind: status === 409 ? "conflict" : "error", message: caught instanceof Error ? caught.message : c.voidError });
      if (status === 401 || status === 404) setAccess({ read: false, void: false });
      if (status === 401) router.replace("/login");
    } finally { setOperation(null); }
  }
  return <EstimateVoidDialog open estimate={current} value={value} onChange={setValue} pending={operation !== null}
    pendingLabel={operation === "review" ? c.reviewLoading : undefined}
    capabilities={{ ...access, create: false, update: false, send: false, decide: false, archive: false, delete: false, export: false }}
    error={error} onConfirm={confirm} onClose={onClose} onReload={() => { setOperation("review"); return load(undefined, true); }} />;
}
