"use client";
import { useId } from "react";
import { FormFeedback, MetricCard } from "@salesmora/ui";
import { customersMetricsData as copy } from "./customers-metrics.data";

export interface CustomersMetricsProps {
  /** Authorized workspace totals, independent of the current list filters. */
  totals?: {
    customers: number;
    withOpenLeads: number;
    withActiveJobs?: number;
  };
  state?: "ready" | "loading" | "error";
  /** Module/data availability supplied by the host; this flag does not grant access. */
  jobsAvailable?: boolean;
  onRetry?: () => void;
}
const count = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export function CustomersMetrics({
  totals,
  state = "ready",
  jobsAvailable = false,
  onRetry,
}: CustomersMetricsProps) {
  const id = useId();
  const valid =
    !!totals &&
    count(totals.customers) &&
    count(totals.withOpenLeads) &&
    totals.withOpenLeads <= totals.customers;
  const failed = state === "error" || (state === "ready" && !valid);
  const cardState =
    state === "loading" ? "loading" : failed ? "error" : "ready";
  const jobCount =
    jobsAvailable &&
    valid &&
    count(totals.withActiveJobs) &&
    totals.withActiveJobs <= totals.customers
      ? totals.withActiveJobs
      : undefined;
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      className="grid min-w-0 gap-4"
    >
      <h2 id={`${id}-title`} className="sr-only">
        {copy.title}
      </h2>
      <p id={`${id}-description`} className="m-0 text-sm leading-6 text-muted">
        {copy.description}
      </p>
      {failed && (
        <div className="grid gap-3">
          <FormFeedback
            kind="error"
            title={copy.errorTitle}
            message={copy.error}
          />
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 w-fit cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring hover:bg-canvas"
            >
              {copy.retry}
            </button>
          )}
        </div>
      )}
      <div className="grid min-w-0 gap-4 sm:grid-cols-3">
        <MetricCard
          label={copy.customers.label}
          description={copy.customers.description}
          value={valid ? totals.customers : undefined}
          state={cardState}
        />
        <MetricCard
          label={copy.leads.label}
          description={copy.leads.description}
          value={valid ? totals.withOpenLeads : undefined}
          state={cardState}
        />
        <MetricCard
          label={copy.jobs.label}
          description={
            jobsAvailable ? copy.jobs.description : copy.jobs.unavailable
          }
          value={jobCount}
          state={jobsAvailable ? cardState : "ready"}
        />
      </div>
    </section>
  );
}
