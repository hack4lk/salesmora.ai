"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EstimateHistoryCursor, EstimateLifecycleRead } from "@salesmora/contracts";
import { EstimateHistoryTimeline } from "./estimate-history-timeline";
import { estimateLifecycleData as c, estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";

export function EstimateHistoryConnected({
  workspaceId, estimateId, refreshKey, timezone,
}: { workspaceId: string; estimateId: string; refreshKey: string; timezone: string }) {
  const [data, setData] = useState<EstimateLifecycleRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [readable, setReadable] = useState(true);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const sequence = useRef(0);
  const lifetime = useRef<AbortController | null>(null);
  const load = useCallback((signal?: AbortSignal, before?: EstimateHistoryCursor) => {
    if (before && inFlight.current) return Promise.resolve();
    const request = ++sequence.current;
    inFlight.current = true;
    signal ??= lifetime.current?.signal;
    const query = new URLSearchParams({ workspace: workspaceId });
    if (before) { query.set("beforeAt", before.createdAt); query.set("beforeId", before.id); }
    return estimateLifecycleRequest<EstimateLifecycleRead>(
      `/api/estimates/${encodeURIComponent(estimateId)}/lifecycle?${query}`, c.loadError, { signal },
    ).then(result => {
      if (signal?.aborted || request !== sequence.current) return;
      setData(current => before && current ? {
        ...result, events: [...current.events, ...result.events.filter(event => !current.events.some(existing => existing.id === event.id))],
      } : result);
      setError("");
      setReadable(true);
    }).catch((caught: unknown) => {
      if (signal?.aborted || request !== sequence.current) return;
      if (caught instanceof EstimateLifecycleRequestError && [401, 404].includes(caught.status)) {
        setData(null);
        setReadable(false);
      }
      setError(caught instanceof Error ? caught.message : c.loadError);
    }).finally(() => {
      if (request === sequence.current) {
        inFlight.current = false;
        if (!signal?.aborted) setLoading(false);
      }
    });
  }, [estimateId, workspaceId]);
  useEffect(() => {
    const abort = new AbortController();
    lifetime.current = abort;
    void load(abort.signal);
    const refresh = () => { if (document.visibilityState === "visible") { setLoading(true); void load(abort.signal); } };
    window.addEventListener("focus", refresh);
    return () => { abort.abort(); window.removeEventListener("focus", refresh); };
  }, [load, refreshKey]);
  return <EstimateHistoryTimeline events={data?.events ?? []} total={data?.total ?? 0}
    timezone={data?.timezone ?? timezone} canRead={readable} loading={loading} error={error}
    onRetry={() => { setLoading(true); void load(); }}
    onLoadMore={data?.nextCursor ? () => { setLoading(true); void load(undefined, data.nextCursor ?? undefined); } : undefined} />;
}
