"use client";

import { useId } from "react";
import { FormFeedback, StatusBadge } from "@salesmora/ui";
import type { EstimateParentType } from "../estimate-preview.types";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimateLinkedRecordData as c } from "./estimate-linked-record.data";

type Customer = { id: string; name: string };

/** Authorized display data only. Omit href when record navigation is not authorized. */
export type EstimateLinkedParent = {
  id: string;
  number: string;
  name: string;
  status: string;
  href?: string;
} & (
  | { type: "lead"; customer: Customer | null; contactName: string }
  | { type: "job"; customer: Customer | null }
);

export type EstimateExistingOpenEstimate = {
  id: string;
  number: string;
  status: "draft" | "sent" | "published";
  href?: string;
};

export type EstimateLinkedRecordProps = {
  record: EstimateLinkedParent | null;
  state?: "ready" | "loading" | "error" | "unavailable";
  /** Presentation scope only; the host must authorize the parent and validate assignment. */
  scope?: "workspace" | "assigned-jobs";
  /** Supplied only when selecting the initial parent for a new estimate. */
  onChooseParent?: (type: EstimateParentType) => void;
  /** Already-authorized matches, supplied only when creating a new estimate from a lead. */
  existingEstimates?: readonly EstimateExistingOpenEstimate[];
  selectionError?: string;
  disabled?: boolean;
  onRetry?: () => void;
};

export function EstimateLinkedRecord({
  record,
  state = "ready",
  scope = "workspace",
  onChooseParent,
  existingEstimates = [],
  selectionError,
  disabled = false,
  onRetry,
}: EstimateLinkedRecordProps) {
  const id = useId();
  const unavailable =
    state === "unavailable" ||
    (scope === "assigned-jobs" && record?.type === "lead");

  return (
    <section aria-labelledby={`${id}-title`} aria-busy={state === "loading"} className={`${estimatePanel} grid gap-4`}>
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <p className="m-0 text-sm leading-6 text-muted">
        {scope === "assigned-jobs" ? c.fieldDescription : c.description}
      </p>
      {unavailable ? (
        <FormFeedback kind="error" message={c.unavailable} />
      ) : state === "loading" ? (
        <div role="status" className="grid gap-3">
          <span className="text-sm text-muted">{c.loading}</span>
          <div aria-hidden="true" className="h-20 rounded-xl bg-canvas motion-safe:animate-pulse" />
        </div>
      ) : state === "error" ? (
        <div className="grid justify-items-start gap-3">
          <FormFeedback kind="error" message={c.loadError} />
          {onRetry && <button type="button" disabled={disabled} onClick={onRetry} className={estimateButton}>{c.retry}</button>}
        </div>
      ) : record ? (
        <>
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-4 rounded-xl border border-line p-4">
            <div className="grid min-w-0 flex-1 gap-2">
              <p className="m-0 text-sm text-muted">{c.kinds[record.type]} · {record.number}</p>
              <p className="m-0 text-base font-semibold wrap-anywhere">{record.name}</p>
              <div><StatusBadge label={record.status} tone="info" /></div>
            </div>
            {record.href && !disabled && (
              <a href={record.href} className={estimateButton} aria-label={c.openLabel(c.open[record.type], record.number)}>{c.open[record.type]}</a>
            )}
          </div>
          {!record.href && <p className="m-0 text-sm leading-6 text-muted">{c.cannotOpen}</p>}
          <dl className="m-0 grid min-w-0 gap-3 text-sm">
            <div>
              <dt className="font-semibold text-muted">{c.customer}</dt>
              <dd className="m-0 mt-1 wrap-anywhere">{record.customer?.name ?? c.noCustomer}</dd>
            </div>
            {record.type === "lead" && !record.customer && (
              <div>
                <dt className="font-semibold text-muted">{c.contact}</dt>
                <dd className="m-0 mt-1 wrap-anywhere">{record.contactName}</dd>
              </div>
            )}
          </dl>
          {record.type === "lead" && !record.customer && (
            <p className="m-0 text-sm leading-6 text-muted">{c.noCustomerHint}</p>
          )}
          {record.type === "lead" && existingEstimates.length > 0 && (
            <div role="note" aria-labelledby={`${id}-existing`} className="grid min-w-0 gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <h3 id={`${id}-existing`} className="m-0 text-base font-semibold">{c.existingTitle}</h3>
              <p className="m-0 text-sm leading-6">{c.existingHint}</p>
              <ul className="m-0 grid list-none gap-3 p-0">
                {existingEstimates.map((estimate) => (
                  <li key={estimate.id} className="flex min-w-0 flex-wrap items-center gap-3">
                    <strong className="text-sm wrap-anywhere">{estimate.number}</strong>
                    <EstimateStatusBadge status={estimate.status} />
                    {estimate.href && !disabled && (
                      <a href={estimate.href} className={estimateButton} aria-label={c.openLabel(c.openExisting, estimate.number)}>{c.openExisting}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="grid justify-items-start gap-4">
          <p className="m-0 text-sm leading-6 text-muted">
            {!onChooseParent ? c.readOnlyEmpty : scope === "assigned-jobs" ? c.emptyField : c.empty}
          </p>
          {onChooseParent && (
            <div className="flex flex-wrap gap-3">
              {scope === "workspace" && <button type="button" disabled={disabled} onClick={() => onChooseParent("lead")} className={estimateButton}>{c.chooseLead}</button>}
              <button type="button" disabled={disabled} onClick={() => onChooseParent("job")} className={estimateButton}>{c.chooseJob}</button>
            </div>
          )}
        </div>
      )}
      {!unavailable && state === "ready" && selectionError && (
        <FormFeedback kind="error" message={selectionError} />
      )}
    </section>
  );
}
