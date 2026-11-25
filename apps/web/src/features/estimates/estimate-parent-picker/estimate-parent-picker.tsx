"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { estimateParentOptionsSchema, leadListResultSchema, jobListResultSchema } from "@salesmora/contracts";
import { ApiQueryScopeBoundary } from "../../api/api-query-provider";
import { useEstimateRequest } from "../use-estimate-request";
import { FormFeedback } from "@salesmora/ui";
import { estimateButton, estimateInput, estimatePanel } from "../estimate-ui";
import { estimateParentPickerData as c } from "./estimate-parent-picker.data";

type ParentType = "lead" | "job";
type ParentOption = {
  id: string;
  number: string;
  name: string;
  detail: string;
  status: string;
};
type Search = (
  type: ParentType,
  query: string,
  signal: AbortSignal,
) => Promise<ParentOption[]>;

async function searchParents(
  request: ReturnType<typeof useEstimateRequest>,
  workspaceId: string,
  type: ParentType,
  query: string,
  signal: AbortSignal,
): Promise<ParentOption[]> {
  if (type === "lead") {
    const params = new URLSearchParams({
      workspace: workspaceId,
      view: "list",
      q: query,
      rows: "50",
    });
    const result = await request(`/api/leads?${params}`, c.searchError, { signal, fresh: false }, raw => leadListResultSchema.parse(raw));
    return result.rows.map((lead) => ({
      id: lead.id,
      number: lead.leadNumber,
      name: lead.name,
      detail: lead.service,
      status: lead.stage,
    }));
  }
  const requests = await Promise.all(
    [false, true].map((closed) => {
      const params = new URLSearchParams({
        workspace: workspaceId,
        q: query,
        closed: String(closed),
        pageSize: "50",
      });
      return request(`/api/jobs?${params}`, c.searchError, { signal, fresh: false }, raw => jobListResultSchema.parse(raw));
    }),
  );
  const jobs = new Map(
    requests.flatMap((result) => result.rows).map((job) => [job.id, job]),
  );
  return [...jobs.values()].map((job) => ({
    id: job.id,
    number: job.number,
    name: job.title,
    detail: job.service || job.customerName,
    status: job.status,
  }));
}

type EstimateParentPickerProps = {
  workspaceId: string; viewerId: string; customerId?: string; canReadLeads: boolean; canReadJobs: boolean;
  search?: Search; onSelect?: (type: ParentType, id: string) => void;
};
export function EstimateParentPicker(props: EstimateParentPickerProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.workspaceId }}>
    <ParentPickerContent key={`${props.viewerId}:${props.workspaceId}:${props.customerId ?? ""}`} {...props}/>
  </ApiQueryScopeBoundary>;
}
function ParentPickerContent({
  workspaceId,
  customerId,
  canReadLeads,
  canReadJobs,
  search,
  onSelect,
}: EstimateParentPickerProps) {
  const router = useRouter();
  const request = useEstimateRequest();
  const id = useId();
  const [type, setType] = useState<ParentType>(
    canReadLeads ? "lead" : "job",
  );
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    key: string;
    state: "loading" | "ready" | "error";
    options: ParentOption[];
    error?: string;
  }>({ key: "", state: "loading", options: [] });
  const [retry, setRetry] = useState(0);
  const defaultSearch = useCallback(
    (kind: ParentType, text: string, signal: AbortSignal) => customerId
      ? request(`/api/estimates/parents?${new URLSearchParams({
          workspace: workspaceId, customerId, type: kind, q: text,
        })}`, c.searchError, { signal, fresh: false }, raw => estimateParentOptionsSchema.parse(raw))
      : searchParents(request, workspaceId, kind, text, signal),
    [workspaceId, customerId, request],
  );
  const searchRecords = search ?? defaultSearch;
  const available = (type === "lead" && canReadLeads) || (type === "job" && canReadJobs);
  const requestKey = `${workspaceId}:${customerId ?? ""}:${type}:${query}`;

  useEffect(() => {
    if (!available) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setResult({ key: requestKey, state: "loading", options: [] });
      searchRecords(type, query.trim(), controller.signal)
        .then((options) => {
          if (!controller.signal.aborted) setResult({ key: requestKey, state: "ready", options });
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setResult({
              key: requestKey,
              state: "error",
              options: [],
              error: error instanceof Error ? error.message : c.searchError,
            });
          }
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [available, query, requestKey, retry, searchRecords, type]);

  function select(option: ParentOption) {
    if (onSelect) {
      onSelect(type, option.id);
      return;
    }
    const params = new URLSearchParams({
      workspace: workspaceId,
      [`${type}Id`]: option.id,
      ...(customerId ? { customerId } : {}),
    });
    router.push(`/estimates/new?${params}`);
  }

  if (!canReadLeads && !canReadJobs) {
    return <FormFeedback kind="error" message={c.noSources} />;
  }

  const current = result.key === requestKey ? result : { state: "loading" as const, options: [] };
  return (
    <section className={`${estimatePanel} grid min-w-0 gap-5`}>
      <header>
        <h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{c.title}</h1>
        <p className="mb-0 mt-3 text-base leading-6 text-muted">{customerId ? c.customerDescription : c.description}</p>
      </header>
      <Tabs value={type} onChange={(_, next: ParentType) => setType(next)} aria-label="Related record type" className="border-b border-line">
        {canReadLeads && <Tab id={`${id}-lead-tab`} value="lead" label={c.lead} aria-controls={`${id}-panel`} />}
        {canReadJobs && <Tab id={`${id}-job-tab`} value="job" label={c.job} aria-controls={`${id}-panel`} />}
      </Tabs>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${type}-tab`} tabIndex={0} className="grid min-w-0 gap-5 focus-visible:focus-ring">
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-search`} className="text-sm font-semibold text-ink">{c.search}</label>
        <input
          id={`${id}-search`}
          type="search"
          className={`${estimateInput} focus-visible:focus-ring`}
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {current.state === "loading" ? (
        <p role="status" className="m-0 text-sm text-muted">{c.loading}</p>
      ) : current.state === "error" ? (
        <div className="grid justify-items-start gap-3">
          <FormFeedback kind="error" message={result.error ?? c.searchError} />
          <button type="button" className={estimateButton} onClick={() => setRetry((value) => value + 1)}>
            {c.retry}
          </button>
        </div>
      ) : current.options.length ? (
        <ul className="m-0 min-w-0 list-none divide-y divide-line overflow-hidden rounded-xl border border-line p-0">
          {current.options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="grid min-h-11 w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-paper px-3 py-2 text-left hover:bg-canvas focus-visible:focus-ring focus-visible:-outline-offset-3"
                onClick={() => select(option)}
              >
                <span className="sr-only">{c.choose(type)}</span>
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="whitespace-nowrap text-xs text-muted">{option.number}</span>
                  <span className="text-sm font-semibold text-ink wrap-anywhere">{option.name}</span>
                  {option.detail && <span className="text-sm text-muted wrap-anywhere">{option.detail}</span>}
                </span>
                <span className="whitespace-nowrap text-xs text-muted">{option.status}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p role="status" className="m-0 text-sm text-muted">{c.noResults}</p>
      )}
      </div>
      <a className="text-sm font-semibold text-primary underline underline-offset-2" href={`/estimates?workspace=${encodeURIComponent(workspaceId)}`}>
        {c.back}
      </a>
    </section>
  );
}
