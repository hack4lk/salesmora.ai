"use client";

import { useId } from "react";
import { FormFeedback, StatusBadge } from "@salesmora/ui";
import type { EstimateActionContext } from "../estimate-actions";
import { createEstimateTimestampFormatter, formatEstimateTimestamp } from "../estimate-timestamp";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { estimateDeliveryCardData as c } from "./estimate-delivery-card.data";
import { getEstimateDeliveryActions, type EstimateDeliveryAction, type EstimateDeliverySummary } from "./estimate-delivery-card.preview";

export type EstimateDeliveryCardProps = EstimateActionContext & {
  delivery: EstimateDeliverySummary | null;
  timezone: string;
  state?: "ready" | "loading" | "error";
  pending?: boolean;
  error?: string;
  actionError?: string;
  /** Host confirms completion; requesting a copy never implies success. */
  copyState?: "idle" | "pending" | "copied" | "error";
  copyError?: string;
  onCopyLink?: () => void;
  onReviewResend?: () => void;
  onRetry?: () => void;
};

export function EstimateDeliveryCard({
  status, archived = false, capabilities, delivery, timezone, state = "ready", pending = false,
  error, actionError, copyState = "idle", copyError, onCopyLink, onReviewResend, onRetry,
}: EstimateDeliveryCardProps) {
  const id = useId();
  const busy = pending || copyState === "pending";
  const shell = `${estimatePanel} grid gap-5 print:hidden`;
  const heading = <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>;
  if (!capabilities.read) return <section aria-labelledby={`${id}-title`} className={shell}>
    {heading}<p role="status" className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>
  </section>;
  if (state === "loading") return <section aria-labelledby={`${id}-title`} aria-busy className={shell}>
    {heading}<p role="status" className="m-0 text-sm leading-6 text-muted">{c.loading}</p>
  </section>;
  if (state === "error" || !delivery) return <section aria-labelledby={`${id}-title`} aria-busy={busy} className={shell}>
    {heading}<FormFeedback kind="error" message={error || (state === "error" ? c.loadError : c.missing)} />
    {onRetry && <button type="button" disabled={busy} className={`${estimateButton} justify-self-start`}
      onClick={() => { if (!busy) onRetry(); }}>{c.retry}</button>}
  </section>;
  const formatter = createEstimateTimestampFormatter(timezone);
  const actions = getEstimateDeliveryActions({ status, archived, capabilities, delivery });
  const handlers: Record<EstimateDeliveryAction, (() => void) | undefined> = { "copy-link": onCopyLink, "review-resend": onReviewResend };
  const connected = actions.filter((action) => handlers[action]);
  const { email, link } = delivery;
  function time(value: string | null, missing: string) {
    if (!value) return missing;
    const formatted = formatEstimateTimestamp(value, formatter);
    return formatted ? <time dateTime={value}>{formatted}</time> : c.timeUnavailable;
  }
  return <section aria-labelledby={`${id}-title`} aria-busy={busy} className={shell}>
    {heading}
    <p className="m-0 text-sm leading-6 text-muted">{c.description}</p>
    {formatter ? <p className="m-0 text-xs leading-5 text-muted wrap-anywhere">{c.timezone(timezone)}</p>
      : <FormFeedback kind="error" message={c.timezoneError} />}
    {status === "draft" && <p className="m-0 text-sm leading-6 text-muted">{c.draft}</p>}
    {status === "published" && <p className="m-0 text-sm leading-6 text-muted">{c.published}</p>}
    {archived && <p className="m-0 text-sm leading-6 text-muted">{c.archived}</p>}
    {["expired", "superseded", "void"].includes(status) && <p className="m-0 text-sm leading-6 text-muted">{c.inactiveRecord}</p>}
    <div className="grid min-w-0 gap-4 rounded-xl border border-line p-4">
      <h3 className="m-0 text-base font-semibold">{c.emailTitle}</h3>
      {email.state === "not-sent" ? <p className="m-0 text-sm text-muted">{c.noEmail}</p> : <>
        <div><StatusBadge {...c.emailStates[email.state]} /></div>
        <dl className="m-0 grid min-w-0 gap-3 text-sm">
          <div className="min-w-0"><dt className="font-semibold text-muted">{c.recipient}</dt>
            <dd className="m-0 mt-1 wrap-anywhere">{email.recipientEmail.trim() || c.recipientMissing}</dd></div>
          <div className="min-w-0"><dt className="font-semibold text-muted">{c.emailTimes[email.state]}</dt>
            <dd className="m-0 mt-1 wrap-anywhere">{time(email.updatedAt, c.timeUnavailable)}</dd></div>
        </dl>
        <p className="m-0 text-xs leading-5 text-muted">{c.recipientHint}</p>
        {email.state === "sent" && <p className="m-0 text-sm leading-6 text-muted">{c.sentHint}</p>}
        {email.state === "queued" && <p className="m-0 text-sm leading-6 text-muted">{c.queuedHint}</p>}
        {email.state === "queued" && !!email.attemptCount && <>
          <p role="status" className="m-0 text-sm leading-6 text-muted">{c.retryCount(email.attemptCount)}</p>
          {email.nextAttemptAt && <p className="m-0 text-sm leading-6 text-muted">
            {c.retryAt}: {time(email.nextAttemptAt, c.timeUnavailable)}
          </p>}
        </>}
        {(email.state === "failed" || email.state === "bounced") && <>
          {email.failureMessage && <p className="m-0 whitespace-pre-wrap text-sm leading-6 text-error wrap-anywhere">{email.failureMessage}</p>}
          <p className="m-0 text-sm leading-6 text-muted">{c.failureHint}</p>
        </>}
      </>}
    </div>
    <div className="grid min-w-0 gap-4 rounded-xl border border-line p-4">
      <h3 className="m-0 text-base font-semibold">{c.linkTitle}</h3>
      <div><StatusBadge {...c.linkStates[link.state]} /></div>
      {link.state !== "not-created" && <dl className="m-0 grid min-w-0 gap-3 text-sm">
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.expires}</dt>
          <dd className="m-0 mt-1 wrap-anywhere">{time(link.expiresAt, c.expiryUnavailable)}</dd></div>
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.viewed}</dt>
          <dd className="m-0 mt-1 wrap-anywhere">{time(link.firstViewedAt, c.noView)}</dd></div>
      </dl>}
      {link.firstViewedAt && <p className="m-0 text-sm leading-6 text-muted">{c.noViewHint}</p>}
      {actions.includes("copy-link") && <p className="m-0 text-sm leading-6 text-muted">{c.linkHint}</p>}
    </div>
    {actionError && <FormFeedback kind="error" message={actionError} />}
    {connected.length > 0 && <div role="group" aria-label={c.actionsLabel} className="grid min-w-0 gap-3">
      {connected.map((action) => <button key={action} type="button" disabled={busy} className={estimateButton}
        onClick={() => { if (!busy) handlers[action]?.(); }}>{action === "copy-link" && copyState === "pending" ? c.copying : c.actions[action]}</button>)}
    </div>}
    {actions.includes("copy-link") && <>
      {copyState === "pending" && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.copying}</p>}
      {copyState === "copied" && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.copied}</p>}
      {copyState === "error" && <FormFeedback kind="error" message={copyError || c.copyError} />}
    </>}
    {actions.length > connected.length && <p className="m-0 text-sm leading-6 text-muted">{c.noHandlers}</p>}
    {actions.includes("review-resend") && <p className="m-0 text-sm leading-6 text-muted">{c.resendHint}</p>}
  </section>;
}
