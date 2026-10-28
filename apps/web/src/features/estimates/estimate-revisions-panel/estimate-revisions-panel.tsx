"use client";

import { useId } from "react";
import Link from "next/link";
import { FormFeedback, MoneyText } from "@salesmora/ui";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { estimateRevisionsPanelData as c } from "./estimate-revisions-panel.data";
import { orderEstimateRevisions, type EstimateRevisionSummary } from "./estimate-revisions-panel.preview";

export type EstimateRevisionsPanelProps = {
  number: string;
  currentEstimateId: string;
  revisions: readonly EstimateRevisionSummary[];
  /** Scoped count, never a count of inaccessible family members. */
  total: number;
  canRead?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onLoadMore?: () => void;
};

export function EstimateRevisionsPanel({
  number, currentEstimateId, revisions, total, canRead = false, loading = false, error, onRetry, onLoadMore,
}: EstimateRevisionsPanelProps) {
  const id = useId();
  if (!canRead) return <section aria-labelledby={`${id}-title`} className={`${estimatePanel} grid gap-4 print:hidden`}>
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
    <p role="status" className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>
  </section>;
  const ordered = orderEstimateRevisions(revisions);
  return <section aria-labelledby={`${id}-title`} aria-busy={loading} className={`${estimatePanel} grid gap-5 print:hidden`}>
    <div className="grid min-w-0 gap-2">
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{number}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.description}</p>
    </div>
    {error ? <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} />
      {onRetry && <button type="button" disabled={loading} className={estimateButton}
        onClick={() => { if (!loading) onRetry(); }}>{c.retry}</button>}
    </div> : ordered.length > 0 ? <>
      {ordered.some(row => row.status === "draft" && row.revision > 1) &&
        <p role="note" className="m-0 rounded-xl bg-canvas p-4 text-sm leading-6 text-muted">{c.pendingHint}</p>}
      <ol aria-label={c.title} role="list" className="m-0 grid min-w-0 list-none gap-3 p-0">
        {ordered.map(row => {
          const current = row.id === currentEstimateId;
          return <li key={row.id} aria-current={current ? "page" : undefined}
            className="grid min-w-0 gap-3 rounded-xl border border-line p-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <h3 className="m-0 text-base font-semibold">{c.revision(row.revision)}</h3>
              {current && <span className="rounded-lg bg-canvas px-2 py-1 text-xs font-semibold">{c.viewing}</span>}
            </div>
            <EstimateStatusBadge status={row.status} archived={row.archived} />
            {row.status === "draft" && row.revision > 1 &&
              <p className="m-0 text-sm leading-6 text-muted">{c.pending}</p>}
            <dl className="m-0 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">{c.total}</dt>
              <dd className="m-0 max-w-full font-semibold wrap-anywhere">
                {row.totalCents === null ? c.totalUnavailable : <MoneyText cents={row.totalCents} />}
              </dd>
            </dl>
            {!current && (row.href
              ? <Link href={row.href} className={`${estimateButton} inline-flex items-center justify-center justify-self-start`}
                aria-label={c.openLabel(number, row.revision)}>{c.open}</Link>
              : <p className="m-0 text-sm leading-6 text-muted">{c.cannotOpen}</p>)}
          </li>;
        })}
      </ol>
      {!loading && total === 1 && <p className="m-0 text-sm leading-6 text-muted">{c.single}</p>}
    </> : !loading && <p className="m-0 text-sm leading-6 text-muted">{c.empty}</p>}
    {loading && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.loading}</p>}
    {!loading && !error && <p role="status" className="m-0 text-xs leading-5 text-muted">{c.loaded(revisions.length, total)}</p>}
    {!error && revisions.length < total && (onLoadMore
      ? <button type="button" disabled={loading} className={`${estimateButton} justify-self-start`}
        onClick={() => { if (!loading) onLoadMore(); }}>{c.older}</button>
      : !loading && <p className="m-0 text-sm leading-6 text-muted">{c.moreUnavailable}</p>)}
  </section>;
}
