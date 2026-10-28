"use client";

import { useId } from "react";
import { FormFeedback } from "@salesmora/ui";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimatePanel } from "../estimate-ui";
import { estimateRevisionReviewData as c } from "./estimate-revision-review.data";
import {
  estimateRevisionAcknowledgement, isEstimateRevisionAcknowledgementCurrent, reviewEstimateRevisionSharing,
  type EstimateRevisionReviewInput, type EstimateRevisionReviewValue,
} from "./estimate-revision-review.preview";

export type EstimateRevisionReviewProps = EstimateRevisionReviewInput & {
  pending?: boolean;
  onChange: (value: EstimateRevisionReviewValue | null) => void;
};

export function EstimateRevisionReview(props: EstimateRevisionReviewProps) {
  const id = useId();
  const review = reviewEstimateRevisionSharing(props);
  const { estimate, revision, paymentLink, pending = false, onChange } = props;
  const valid = !review.issues.includes(c.invalid);
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className={`${estimatePanel} grid gap-4 print:hidden`}>
    <h3 id={`${id}-title`} className="m-0 text-base font-semibold">{c.title}</h3>
    {!props.canRead ? <FormFeedback kind="error" message={c.unavailable} /> : !valid
      ? <FormFeedback kind="error" message={c.invalid} />
      : <>
        <p className="m-0 text-sm leading-6 wrap-anywhere">{c.replacement(estimate.number, revision.sourceRevision, estimate.revision)}</p>
        <EstimateStatusBadge status={revision.sourceStatus} />
        <p className="m-0 text-sm leading-6 text-muted">{c.effects}</p>
        {revision.requiresPaymentLinkReview ? <fieldset disabled={pending} className="m-0 grid min-w-0 gap-3 rounded-xl border border-line p-4">
          <legend className="px-2 text-sm font-semibold">{c.paymentTitle}</legend>
          <p id={`${id}-hint`} className="m-0 text-sm leading-6 text-muted">{c.paymentHint}</p>
          <p className="m-0 text-sm leading-6 wrap-anywhere">{paymentLink}</p>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl py-2 text-sm leading-6">
            <input type="checkbox" checked={isEstimateRevisionAcknowledgementCurrent(props)}
              disabled={pending || !props.canSend} aria-describedby={`${id}-hint`}
              className="mt-1 size-4 shrink-0 accent-primary focus-visible:focus-ring"
              onChange={event => { if (!pending && props.canSend) onChange(estimateRevisionAcknowledgement(props, event.target.checked)); }} />
            <span>{c.acknowledge}</span>
          </label>
        </fieldset> : <p className="m-0 text-sm leading-6 text-muted">{c.noCarriedLink}</p>}
      </>}
  </section>;
}
