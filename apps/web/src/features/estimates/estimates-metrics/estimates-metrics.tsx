"use client";
import { useId } from "react";
import { FormFeedback, MetricCard, formatMoney } from "@salesmora/ui";
import { estimatesMetricsData as c } from "./estimates-metrics.data";

export type EstimateQuickFilter = "awaiting" | "expiring" | null;

export type EstimatesMetricsProps = {
  totals?: {
    awaitingResponse: number;
    openValueCents: number | string;
    acceptedThisMonthCount: number;
    acceptedThisMonthValueCents: number | string;
    expiringIn7Days: number;
  };
  state?: "ready" | "loading" | "error";
  quickFilter?: EstimateQuickFilter;
  onQuickFilterChange?: (value: EstimateQuickFilter) => void;
  onRetry?: () => void;
};

const count = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

const validCents = (value: number | string | undefined): value is number | string =>
  typeof value === "number"
    ? Number.isSafeInteger(value) && value >= 0
    : typeof value === "string" && /^(0|[1-9]\d*)$/.test(value);

function formatCents(value: number | string): string | undefined {
  if (typeof value === "number") return formatMoney(value);
  if (!validCents(value)) return undefined;
  const cents = BigInt(value);
  const dollars = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100n);
  return `${dollars}.${String(cents % 100n).padStart(2, "0")}`;
}

export function EstimatesMetrics({
  totals,
  state = "ready",
  quickFilter = null,
  onQuickFilterChange,
  onRetry,
}: EstimatesMetricsProps) {
  const id = useId();
  const valid =
    !!totals &&
    count(totals.awaitingResponse) &&
    validCents(totals.openValueCents) &&
    count(totals.acceptedThisMonthCount) &&
    validCents(totals.acceptedThisMonthValueCents) &&
    count(totals.expiringIn7Days);
  const failed = state === "error" || (state === "ready" && !valid);
  const cardState = state === "loading" ? "loading" : failed ? "error" : "ready";
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      className="grid min-w-0 gap-4"
    >
      <h2 id={`${id}-title`} className="sr-only">
        {c.title}
      </h2>
      <p id={`${id}-description`} className="m-0 text-sm leading-6 text-muted">
        {c.description}
      </p>
      {failed && (
        <div className="grid gap-3">
          <FormFeedback kind="error" title={c.errorTitle} message={c.error} />
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 w-fit cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring hover:bg-canvas"
            >
              {c.retry}
            </button>
          )}
        </div>
      )}
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={c.awaiting.label}
          description={c.awaiting.description}
          value={valid ? totals.awaitingResponse : undefined}
          state={cardState}
          onSelect={
            onQuickFilterChange
              ? () =>
                  onQuickFilterChange(
                    quickFilter === "awaiting" ? null : "awaiting",
                  )
              : undefined
          }
          selected={quickFilter === "awaiting"}
        />
        <MetricCard
          label={c.openValue.label}
          description={c.openValue.description}
          displayValue={valid ? formatCents(totals.openValueCents) : undefined}
          state={cardState}
        />
        <MetricCard
          label={c.accepted.label}
          description={c.accepted.description}
          displayValue={
            valid
              ? c.accepted.value(
                  totals.acceptedThisMonthCount,
                  formatCents(totals.acceptedThisMonthValueCents) ?? "—",
                )
              : undefined
          }
          state={cardState}
        />
        <MetricCard
          label={c.expiring.label}
          description={c.expiring.description}
          value={valid ? totals.expiringIn7Days : undefined}
          state={cardState}
          onSelect={
            onQuickFilterChange
              ? () =>
                  onQuickFilterChange(
                    quickFilter === "expiring" ? null : "expiring",
                  )
              : undefined
          }
          selected={quickFilter === "expiring"}
        />
      </div>
    </section>
  );
}
