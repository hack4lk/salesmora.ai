"use client";
import { Fragment, useId, type ReactNode } from "react";
import { metricCardData as copy } from "./metric-card.data";

export interface MetricCardProps {
  label: string;
  /** Actual count supplied by the host. Missing/invalid values are never represented as zero. */
  value?: number;
  description?: string;
  headerAction?: ReactNode;
  labelAdornment?: ReactNode;
  labelPosition?: "above" | "below" | "beside" | "left";
  /** Host-formatted value (for example money). Replaces the numeric count when present. */
  displayValue?: string;
  state?: "ready" | "loading" | "error";
  /** Makes the card a toggle (for example a list quick filter). The host owns what selection means. */
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
}
const format = new Intl.NumberFormat("en-US");

/** Presentational count only. The host owns authorization, aggregation and filter semantics. */
export function MetricCard({
  label,
  value,
  displayValue,
  description,
  headerAction,
  labelAdornment,
  labelPosition = "above",
  state = "ready",
  onSelect,
  selected = false,
  className = "",
}: MetricCardProps) {
  const id = useId();
  const formatted =
    typeof displayValue === "string" && displayValue.trim() !== "";
  const valid =
    formatted ||
    (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);
  const unavailable = state !== "loading" && (state === "error" || !valid);
  const labelOnLeft = labelPosition === "left";
  const metricLabel = (
    <p
      id={`${id}-label`}
      className="m-0 min-w-0 text-md font-semibold text-muted wrap-anywhere"
    >
      {label.trim() || copy.fallbackLabel}
    </p>
  );
  const metricDescription = description?.trim() && (
    <p
      id={`${id}-description`}
      className={`mb-0 text-sm text-muted wrap-anywhere ${labelOnLeft ? "mt-1 leading-5" : "mt-3 leading-6"}`}
    >
      {description}
    </p>
  );
  const metricValue = (
    <div className={labelPosition === "above" ? "mt-3" : "min-w-0 max-w-full"}>
      <div
        className={`flex min-w-0 items-center gap-1 ${labelOnLeft ? "justify-end" : ""}`}
      >
        {state === "loading" ? (
          <span
            aria-hidden="true"
            className="block h-10 w-24 max-w-full rounded-lg bg-line motion-safe:animate-pulse"
          />
        ) : unavailable ? (
          <p
            aria-hidden="true"
            className="m-0 min-w-0 text-heading-lg font-semibold text-muted"
          >
            {copy.placeholder}
          </p>
        ) : (
          <p className="m-0 min-w-0 text-heading-lg font-semibold tabular-nums text-ink wrap-anywhere">
            {formatted
              ? displayValue
              : format
                  .format(value!)
                  .split(",")
                  .map((group, index, groups) => (
                    <Fragment key={index}>
                      {group}
                      {index < groups.length - 1 && (
                        <>
                          {","}
                          <wbr />
                        </>
                      )}
                    </Fragment>
                  ))}
          </p>
        )}
      </div>
      {(state === "loading" || unavailable) && (
        <p
          role="status"
          className={`mb-0 text-sm text-muted ${labelOnLeft ? "mt-1 leading-5" : "mt-3 leading-6"}`}
        >
          {state === "loading" ? copy.loading : copy.unavailable}
        </p>
      )}
    </div>
  );
  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={description?.trim() ? `${id}-description` : undefined}
      aria-busy={state === "loading"}
      className={`relative min-w-0 rounded-2xl border bg-paper ${labelOnLeft ? "px-4 py-3" : "p-6"} ${selected ? "border-primary ring-2 ring-primary" : "border-line"} ${onSelect ? "hover:bg-canvas" : ""} ${className}`}
    >
      {onSelect && (
        <button
          type="button"
          aria-pressed={selected}
          aria-label={label.trim() || copy.fallbackLabel}
          disabled={state !== "ready"}
          onClick={onSelect}
          className="absolute inset-0 cursor-pointer rounded-2xl focus-visible:focus-ring disabled:cursor-not-allowed"
        />
      )}
      {labelOnLeft ? (
        <div className="flex h-full min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1">
              {metricLabel}
              {labelAdornment && (
                <div className="relative z-10 shrink-0">{labelAdornment}</div>
              )}
            </div>
            {metricDescription}
          </div>
          <div className="flex min-w-0 max-w-[50%] flex-col items-end gap-1 text-right">
            {headerAction && (
              <div className="relative z-10 max-w-full">{headerAction}</div>
            )}
            {metricValue}
          </div>
        </div>
      ) : labelPosition !== "above" ? (
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div
            className={
              labelPosition === "beside"
                ? "flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0"
                : "min-w-0 flex-1"
            }
          >
            {metricValue}
            <div className="flex min-w-0 max-w-full shrink-0 items-center gap-1">
              {metricLabel}
              {labelAdornment && (
                <div className="relative z-10 shrink-0">{labelAdornment}</div>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="relative z-10 max-w-[45%] shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1">
              {metricLabel}
              {labelAdornment && (
                <div className="relative z-10 shrink-0">{labelAdornment}</div>
              )}
            </div>
            {headerAction && (
              <div className="relative z-10 max-w-[45%] shrink-0">
                {headerAction}
              </div>
            )}
          </div>
          {metricValue}
        </>
      )}
      {!labelOnLeft && metricDescription}
    </div>
  );
}
