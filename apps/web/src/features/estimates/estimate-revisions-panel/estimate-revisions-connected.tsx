"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EstimateRevisionFamily } from "@salesmora/contracts";
import { EstimateRevisionsPanel } from "./estimate-revisions-panel";
import { estimateRevisionsPanelData as c } from "./estimate-revisions-panel.data";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";

export function EstimateRevisionsConnected({
  workspaceId, estimateId, number, version, canRead, refreshOnFocus, onReview,
}: {
  workspaceId: string; estimateId: string; number: string; version: number;
  canRead: boolean; refreshOnFocus: boolean; onReview: (review: EstimateRevisionFamily | null) => void;
}) {
  const [data, setData] = useState<EstimateRevisionFamily | null>(null);
  const [loading, setLoading] = useState(true);
  const [readable, setReadable] = useState(true);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const sequence = useRef(0);
  const lifetime = useRef<AbortController | null>(null);
  const load = useCallback((signal?: AbortSignal, beforeRevision?: number) => {
    if (beforeRevision && inFlight.current) return Promise.resolve();
    const current = ++sequence.current;
    inFlight.current = true;
    signal ??= lifetime.current?.signal;
    setLoading(true);
    onReview(null);
    const query = new URLSearchParams({ workspace: workspaceId });
    if (beforeRevision !== undefined) query.set("beforeRevision", String(beforeRevision));
    return estimateLifecycleRequest<EstimateRevisionFamily>(
      `/api/estimates/${encodeURIComponent(estimateId)}/revisions?${query}`, c.loadError, { signal },
    ).then(result => {
      if (signal?.aborted || current !== sequence.current) return;
      if (result.currentEstimateId !== estimateId || result.version !== version) {
        throw new EstimateLifecycleRequestError(c.changed, 409);
      }
      setData(previous => beforeRevision !== undefined && previous ? {
        ...result, revisions: [...previous.revisions, ...result.revisions.filter(row => !previous.revisions.some(existing => existing.id === row.id))],
      } : result);
      setError("");
      setReadable(true);
      onReview(result);
    }).catch((caught: unknown) => {
      if (signal?.aborted || current !== sequence.current) return;
      setData(null);
      onReview(null);
      if (caught instanceof EstimateLifecycleRequestError && [401, 404].includes(caught.status)) setReadable(false);
      setError(caught instanceof Error ? caught.message : c.loadError);
    }).finally(() => {
      if (current === sequence.current) {
        inFlight.current = false;
        if (!signal?.aborted) setLoading(false);
      }
    });
  }, [estimateId, onReview, version, workspaceId]);
  useEffect(() => {
    if (!canRead) { onReview(null); return; }
    const abort = new AbortController();
    lifetime.current = abort;
    void load(abort.signal);
    return () => abort.abort();
  }, [canRead, load, onReview]);
  useEffect(() => {
    if (!canRead || !refreshOnFocus) return;
    const refresh = () => { if (document.visibilityState === "visible" && !inFlight.current) void load(); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [canRead, load, refreshOnFocus]);
  return <EstimateRevisionsPanel number={number} currentEstimateId={estimateId}
    revisions={data?.revisions ?? []} total={data?.total ?? 0} canRead={canRead && readable}
    loading={loading} error={error}
    onRetry={() => { void load(); }}
    onLoadMore={data?.nextBeforeRevision ? () => { void load(undefined, data.nextBeforeRevision ?? undefined); } : undefined} />;
}
