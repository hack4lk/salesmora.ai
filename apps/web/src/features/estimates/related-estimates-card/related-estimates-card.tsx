"use client";

import { useId } from "react";
import Link from "next/link";
import { FormFeedback, MoneyText } from "@salesmora/ui";
import type { EstimateParentType, EstimateRow } from "../estimate-preview.types";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { relatedEstimatesCardData as c } from "./related-estimates-card.data";

export type RelatedEstimate = Pick<
  EstimateRow, "id" | "number" | "revision" | "name" | "status" | "archived" | "totalCents"
> & {
  href?: string;
  /** Omit when the host cannot disclose the associated parent. */
  parent?: { type: EstimateParentType; number: string };
};

export type RelatedEstimatesCardProps = {
  recordType: EstimateParentType | "customer";
  /** Already authorized, filtered, ordered and paged by the host. */
  estimates: readonly RelatedEstimate[];
  /** Count only records readable by the current user. */
  total: number;
  canRead?: boolean;
  canCreate?: boolean;
  state?: "ready" | "loading" | "error" | "unavailable";
  pending?: boolean;
  error?: string;
  /** Lead/Job hosts supply their parent; customer hosts must first choose an authorized parent. */
  onCreate?: () => void;
  onRetry?: () => void;
  onLoadMore?: () => void;
  includeHidden?: boolean;
  onIncludeHiddenChange?: (value: boolean) => void;
};

export function RelatedEstimatesCard({
  recordType, estimates, total, canRead = false, canCreate = false,
  state = "ready", pending = false, error, onCreate, onRetry, onLoadMore,
  includeHidden = false, onIncludeHiddenChange,
}: RelatedEstimatesCardProps) {
  const id = useId();
  const unavailable = !canRead || state === "unavailable";
  return <section aria-labelledby={`${id}-title`} aria-busy={!unavailable && state === "loading"}
    className={`${estimatePanel} grid gap-4 print:hidden`}>
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      {!unavailable && state === "ready" && canCreate && onCreate &&
        <button type="button" className={estimateButton} disabled={pending}
          onClick={() => { if (!pending) onCreate(); }}>{c.create}</button>}
    </header>
    {unavailable ? <p role="status" className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>
      : state === "loading" ? <p role="status" className="m-0 text-sm leading-6 text-muted">{c.loading}</p>
      : state === "error" ? <div className="grid justify-items-start gap-3">
        <FormFeedback kind="error" message={error || c.error} />
        {onRetry && <button type="button" className={estimateButton} disabled={pending}
          onClick={() => { if (!pending) onRetry(); }}>{c.retry}</button>}
      </div> : <>
        <p className="m-0 text-sm leading-6 text-muted">{c.description[recordType]}</p>
        {onIncludeHiddenChange && <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
          <input role="switch" type="checkbox" checked={includeHidden} disabled={pending}
            className="size-5 cursor-pointer accent-primary focus-visible:focus-ring"
            onChange={(event) => onIncludeHiddenChange(event.target.checked)} />
          {c.includeHidden}
        </label>}
        {canCreate && <p className="m-0 text-sm leading-6 text-muted">
          {onCreate ? c.createHint[recordType] : c.createUnavailable}
        </p>}
        {estimates.length ? <ul aria-label={c.title} role="list" className="m-0 grid min-w-0 list-none gap-3 p-0">
          {estimates.map(estimate => <li key={estimate.id} className="grid min-w-0 gap-3 rounded-xl border border-line p-4">
            <div className="grid min-w-0 gap-1">
              <h3 className="m-0 text-base font-semibold wrap-anywhere">{estimate.name}</h3>
              <p className="m-0 text-sm text-muted wrap-anywhere">{c.identity(estimate.number, estimate.revision)}</p>
              {estimate.parent && <p className="m-0 text-sm text-muted wrap-anywhere">
                {c.parent(estimate.parent.type, estimate.parent.number)}
              </p>}
            </div>
            <EstimateStatusBadge status={estimate.status} archived={estimate.archived} />
            <dl className="m-0 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">{c.total}</dt>
              <dd className="m-0 max-w-full font-semibold wrap-anywhere">
                {estimate.totalCents === null ? c.totalUnavailable : <MoneyText cents={estimate.totalCents} />}
              </dd>
            </dl>
            {estimate.href ? pending
              ? <span role="link" aria-disabled="true" aria-label={c.openLabel(estimate.number, estimate.revision)}
                className="text-sm font-semibold text-muted">{c.open}</span>
              : <Link href={estimate.href} className={`${estimateButton} inline-flex items-center justify-center justify-self-start`}
                aria-label={c.openLabel(estimate.number, estimate.revision)}>{c.open}</Link>
              : <p className="m-0 text-sm leading-6 text-muted">{c.cannotOpen}</p>}
          </li>)}
        </ul> : <p className="m-0 text-sm leading-6 text-muted">{c.empty}</p>}
        <p role="status" className="m-0 text-xs leading-5 text-muted">{c.loaded(estimates.length, total)}</p>
        {estimates.length < total && (onLoadMore
          ? <button type="button" className={`${estimateButton} justify-self-start`} disabled={pending}
            onClick={() => { if (!pending) onLoadMore(); }}>{c.more}</button>
          : <p className="m-0 text-sm leading-6 text-muted">{c.moreUnavailable}</p>)}
      </>}
  </section>;
}
