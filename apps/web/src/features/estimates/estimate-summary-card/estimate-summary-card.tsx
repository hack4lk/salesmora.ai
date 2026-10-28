"use client";

import { MoneyText, FormFeedback } from "@salesmora/ui";
import { useId } from "react";
import { estimateButton } from "../estimate-ui";
import { estimateStatusBadgeData } from "../estimate-status-badge/estimate-status-badge.data";
import { estimateSummaryCardData as c } from "./estimate-summary-card.data";
import { formatEstimateSummaryDate, reviewEstimateSummaryCard } from "./estimate-summary-card.preview";
import type { EstimateSummaryCardProps } from "./estimate-summary-card.types";

export type { EstimateSummaryCardProps } from "./estimate-summary-card.types";

export function EstimateSummaryCard({
  result, state = "ready", canRead = true, disabled = false, error, onRetry, onOpenEstimate, onOpenList, onReviewExport,
}: EstimateSummaryCardProps) {
  const id = useId();
  const review = reviewEstimateSummaryCard({ result, canRead });
  const unavailable = state === "forbidden" || !review.visible;
  const loading = state === "loading";
  const failed = state === "error" || (state === "ready" && !review.valid);
  const rows = review.rows;
  return <section aria-labelledby={`${id}-title`} aria-busy={loading} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground print:hidden">
    <h3 id={`${id}-title`} className="m-0 text-base font-semibold">{c.title}</h3>
    {unavailable ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{c.unavailable}</p>
      : loading ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{c.loading}</p>
        : failed ? <div className="mt-3 grid gap-3">
          <FormFeedback kind="error" message={error || (state === "error" ? c.invalid : review.issues[0] || c.invalid)} />
          {review.issues.length > 1 && <ul aria-label={c.invalid} className="m-0 grid min-w-0 gap-2 pl-5 text-sm leading-6 text-assistant-muted">
            {review.issues.slice(1).map((issue) => <li key={issue} className="wrap-anywhere">{issue}</li>)}
          </ul>}
          {onRetry && <button type="button" disabled={disabled} className={`${estimateButton} justify-self-start`}
            onClick={() => { if (!disabled) onRetry(); }}>{c.retry}</button>}
        </div> : <>
          <p className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{c.description}</p>
          <dl className="mb-0 mt-4 grid min-w-0 gap-4 text-sm">
            <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.query}</dt>
              <dd className="m-0 mt-1 wrap-anywhere">{review.summary!.queryLabel}</dd></div>
            <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.scope}</dt>
              <dd className="m-0 mt-1">{c.scopeValues[review.summary!.scope]}</dd></div>
            <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.filters}</dt>
              <dd className="m-0 mt-1 wrap-anywhere">{review.summary!.filterLabels.length
                ? <ul className="m-0 grid list-disc gap-1 pl-5">{review.summary!.filterLabels.map((label, index) => <li key={index}>{label}</li>)}</ul>
                : c.noFilters}
              </dd>
            </div>
            {review.summary!.dateRange && <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.dateRange}</dt>
              <dd className="m-0 mt-1 wrap-anywhere">{formatEstimateSummaryDate(review.summary!.dateRange.from)} – {formatEstimateSummaryDate(review.summary!.dateRange.to)}</dd>
            </div>}
            <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.retrieved}</dt>
              <dd className="m-0 mt-1"><time dateTime={result!.retrievedAt}>{review.retrieved}</time>{` · ${result!.timezone}`}</dd></div>
            <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.count}</dt>
              <dd className="m-0 mt-1">{review.summary!.totalMatches.toLocaleString("en-US")}</dd></div>
            <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.total}</dt>
              <dd className="m-0 mt-1">{review.summary!.totalCents === null ? c.totalUnavailable : <MoneyText cents={review.summary!.totalCents} />}</dd></div>
          </dl>
          {rows.length > 0 ? <ul className="mb-0 mt-5 grid list-none gap-3 p-0">
            {rows.map((row, index) => <li key={row.id} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-message p-3">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  {onOpenEstimate ? <button type="button" disabled={disabled}
                    onClick={() => { if (!disabled) onOpenEstimate(row.id); }}
                    className="min-h-11 max-w-full cursor-pointer rounded-lg py-2 text-left text-base font-semibold text-assistant-accent wrap-anywhere focus-visible:focus-ring disabled:cursor-default disabled:opacity-50">{row.number} · {c.revision(row.revision)} · {row.name}</button>
                    : <p className="m-0 text-base font-semibold leading-6 wrap-anywhere">{row.number} · {c.revision(row.revision)} · {row.name}</p>}
                </div>
                <p className="m-0 text-sm font-semibold text-assistant-muted"><span>{c.status}: </span>{estimateStatusBadgeData.statuses[row.status].label}
                  {row.archived ? ` · ${estimateStatusBadgeData.archived}` : ""}
                </p>
              </div>
              <dl className="m-0 grid min-w-0 gap-3 text-sm sm:grid-cols-2">
                <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.customer}</dt>
                  <dd className="m-0 mt-1 wrap-anywhere">{row.customerName || c.notProvided}</dd></div>
                <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.amount}</dt>
                  <dd className="m-0 mt-1">{row.totalCents === null ? c.amountUnavailable : <MoneyText cents={row.totalCents} />}</dd></div>
                <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.related}</dt>
                  <dd className="m-0 mt-1 wrap-anywhere">{review.summary!.related[index]?.label ?? c.notProvided}</dd></div>
                <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.validUntil}</dt>
                  <dd className="m-0 mt-1">{formatEstimateSummaryDate(row.validUntil) ?? c.noDate}</dd></div>
              </dl>
            </li>)}
          </ul> : <p className="mb-0 mt-4 rounded-xl border border-assistant-border bg-assistant-message p-4 text-sm leading-6">{c.empty}</p>}
          {review.summary!.hasMore && <p className="mb-0 mt-4 text-sm leading-6 text-assistant-muted">{c.more(rows.length, review.summary!.totalMatches)}</p>}
          {review.canReviewExport ? (onReviewExport
            ? <button type="button" disabled={disabled} className={`${estimateButton} mt-4`}
              onClick={() => { if (!disabled) onReviewExport(review.summary!.id); }}>{c.reviewExport}</button>
            : <p className="mb-0 mt-4 text-sm leading-6 text-assistant-muted">{c.exportUnavailable}</p>)
            : review.summary!.totalMatches > 0 && (onOpenList
            ? <button type="button" disabled={disabled || !review.canOpenList} className={`${estimateButton} mt-4`}
              onClick={() => { if (!disabled && review.canOpenList) onOpenList(review.summary!.id); }}>{c.openList}</button>
            : <p className="mb-0 mt-4 text-sm leading-6 text-assistant-muted">{c.listUnavailable}</p>)}
          <p className="mb-0 mt-3 text-xs leading-5 text-assistant-muted">{c.snapshot}</p>
        </>}
  </section>;
}
