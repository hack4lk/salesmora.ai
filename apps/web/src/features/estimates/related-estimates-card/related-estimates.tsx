"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RelatedEstimatesQuery, RelatedEstimatesResult } from "@salesmora/contracts";
import { RelatedEstimatesCard } from "./related-estimates-card";
import { relatedEstimatesCardData as c } from "./related-estimates-card.data";

class RelatedEstimatesReadError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function read(
  params: URLSearchParams,
  signal: AbortSignal,
  previous?: RelatedEstimatesResult,
): Promise<RelatedEstimatesResult> {
  async function fetchPage(): Promise<RelatedEstimatesResult> {
    const response = await fetch(`/api/estimates/related?${params}`, { cache: "no-store", signal });
    const body = await response.json();
    if (!response.ok) throw new RelatedEstimatesReadError(body.error ?? c.error, response.status);
    return body;
  }
  const next = await fetchPage();
  if (!previous) return next;
  // Never append cached rows after the authorized set or its contents change.
  if (previous.readVersion !== next.readVersion || next.page !== previous.page + 1) {
    params.set("page", "1");
    return fetchPage();
  }
  return { ...next, rows: [...previous.rows, ...next.rows] };
}

export function RelatedEstimates({
  workspaceId, recordType, recordId, onCanCreateChange,
}: {
  workspaceId: string;
  recordType: RelatedEstimatesQuery["recordType"];
  recordId: string;
  onCanCreateChange?: (value: boolean) => void;
}) {
  const router = useRouter();
  const [includeHidden, setIncludeHidden] = useState(false);
  const [result, setResult] = useState<RelatedEstimatesResult>();
  const current = useRef<RelatedEstimatesResult | undefined>(undefined);
  const controller = useRef<AbortController | undefined>(undefined);
  const [state, setState] = useState<"ready" | "loading" | "error" | "unavailable">("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const load = useCallback((more = false) => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    const previous = more ? current.current : undefined;
    const params = new URLSearchParams({
      workspace: workspaceId, recordType, recordId,
      includeHidden: String(includeHidden), page: String(previous ? previous.page + 1 : 1),
    });
    return read(params, request.signal, previous).then((next) => {
      if (!request.signal.aborted) {
        current.current = next; setResult(next); setState("ready");
        setPending(false);
        onCanCreateChange?.(next.canCreate);
      }
    }).catch((failure: unknown) => {
      if (!request.signal.aborted) {
        setResult(undefined); current.current = undefined;
        setState(failure instanceof RelatedEstimatesReadError && [401, 404].includes(failure.status) ? "unavailable" : "error");
        setError(failure instanceof Error ? failure.message : c.error);
        setPending(false);
      }
    });
  }, [workspaceId, recordType, recordId, includeHidden, onCanCreateChange]);

  const beginLoad = useCallback((more = false) => {
    if (!more) { setResult(undefined); current.current = undefined; setState("loading"); }
    setPending(true);
    onCanCreateChange?.(false);
    void load(more);
  }, [load, onCanCreateChange]);

  useEffect(() => {
    onCanCreateChange?.(false);
    void load();
    const refresh = () => { if (document.visibilityState === "visible") beginLoad(); };
    window.addEventListener("focus", refresh);
    return () => { controller.current?.abort(); window.removeEventListener("focus", refresh); };
  }, [load, beginLoad, onCanCreateChange]);

  function create() {
    if (!result?.canCreate || pending || state !== "ready") return;
    const params = new URLSearchParams({ workspace: workspaceId, [`${recordType}Id`]: recordId });
    router.push(`/estimates/new?${params}`);
  }
  return <RelatedEstimatesCard recordType={recordType} estimates={result?.rows ?? []} total={result?.total ?? 0}
    canRead={state !== "unavailable"} canCreate={result?.canCreate} state={state} error={error} pending={pending}
    includeHidden={includeHidden} onIncludeHiddenChange={(value) => {
      controller.current?.abort(); current.current = undefined; setResult(undefined);
      setState("loading"); onCanCreateChange?.(false); setIncludeHidden(value);
    }}
    onCreate={create} onRetry={() => beginLoad()} onLoadMore={() => { if (!pending) beginLoad(true); }} />;
}
