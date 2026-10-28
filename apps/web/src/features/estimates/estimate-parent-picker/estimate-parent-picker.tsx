"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { JobListResult, LeadListResult, EstimateParentOption } from "@salesmora/contracts";
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

async function json<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { cache: "no-store", signal });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? c.searchError);
  return body as T;
}

async function searchParents(
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
    const result = await json<LeadListResult>(`/api/leads?${params}`, signal);
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
      return json<JobListResult>(`/api/jobs?${params}`, signal);
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

export function EstimateParentPicker({
  workspaceId,
  customerId,
  canReadLeads,
  canReadJobs,
  search,
  onSelect,
}: {
  workspaceId: string;
  customerId?: string;
  canReadLeads: boolean;
  canReadJobs: boolean;
  search?: Search;
  onSelect?: (type: ParentType, id: string) => void;
}) {
  const router = useRouter();
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
      ? json<EstimateParentOption[]>(`/api/estimates/parents?${new URLSearchParams({
          workspace: workspaceId, customerId, type: kind, q: text,
        })}`, signal)
      : searchParents(workspaceId, kind, text, signal),
    [workspaceId, customerId],
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
      <div role="group" aria-label="Related record type" className="flex flex-wrap gap-2">
        {canReadLeads && (
          <button
            type="button"
            aria-pressed={type === "lead"}
            className={estimateButton}
            onClick={() => setType("lead")}
          >
            {c.lead}
          </button>
        )}
        {canReadJobs && (
          <button
            type="button"
            aria-pressed={type === "job"}
            className={estimateButton}
            onClick={() => setType("job")}
          >
            {c.job}
          </button>
        )}
      </div>
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
        <ul className="m-0 grid list-none gap-3 p-0">
          {current.options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="grid min-h-16 w-full gap-1 rounded-xl border border-line bg-paper p-4 text-left hover:bg-canvas focus-visible:focus-ring"
                onClick={() => select(option)}
              >
                <span className="sr-only">{c.choose(type)}</span>
                <span className="text-sm text-muted">{option.number} · {option.status}</span>
                <span className="font-semibold wrap-anywhere">{option.name}</span>
                <span className="text-sm text-muted wrap-anywhere">{option.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p role="status" className="m-0 text-sm text-muted">{c.noResults}</p>
      )}
      <a className="text-sm font-semibold text-primary underline underline-offset-2" href={`/estimates?workspace=${encodeURIComponent(workspaceId)}`}>
        {c.back}
      </a>
    </section>
  );
}
