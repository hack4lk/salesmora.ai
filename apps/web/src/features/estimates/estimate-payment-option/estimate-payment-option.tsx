"use client";

import { useId } from "react";
import { FormFeedback } from "@salesmora/ui";
import { estimateInput, estimatePanel, estimatePrimary } from "../estimate-ui";
import { estimatePaymentOptionData as c } from "./estimate-payment-option.data";
import { reviewEstimatePaymentLink } from "./estimate-payment-option.validation";

export type EstimatePaymentOptionProps = {
  value: string;
  canEdit?: boolean;
  pending?: boolean;
  showErrors?: boolean;
  onChange?: (value: string) => void;
};

export function EstimatePaymentOption({
  value, canEdit = false, pending = false, showErrors = false, onChange,
}: EstimatePaymentOptionProps) {
  const id = useId();
  const review = reviewEstimatePaymentLink(value);
  const editable = canEdit && !!onChange;
  if (!editable && review.state === "empty") return null;

  return <section aria-labelledby={`${id}-title`}
    className={`${estimatePanel} grid min-w-0 gap-4 border-primary/40 bg-primary/5 break-inside-avoid print:bg-paper print:p-3`}>
    <h2 id={`${id}-title`} className={editable ? "m-0 text-lg font-semibold text-ink" : "sr-only"}>{c.title}</h2>
    {editable ? <div className="grid min-w-0 gap-2">
      <label htmlFor={`${id}-link`} className="text-sm font-semibold">{c.field}</label>
      <input id={`${id}-link`} name="paymentLink" type="url" value={value} disabled={pending}
        autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={2048} className={estimateInput}
        aria-invalid={showErrors && review.state === "invalid"} aria-describedby={`${id}-hint`}
        onChange={event => { if (!pending) onChange?.(event.target.value); }} />
      <p id={`${id}-hint`} className={`m-0 text-sm leading-6 ${showErrors && review.state === "invalid" ? "text-red-800" : "text-muted"}`}>
        {showErrors && review.state === "invalid" ? review.error : c.hint}
      </p>
    </div>
      : review.state === "invalid" ? <FormFeedback kind="error" message={review.error} />
        : review.state === "ready" && <div className="flex min-w-0 items-center gap-4">
          <a href={review.href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
            className={`${estimatePrimary} shrink-0 print:hidden`}>{c.action}<span className="sr-only"> — {c.external}</span></a>
          <p className="m-0 min-w-0 flex-1 text-sm leading-6 wrap-anywhere">
            <span className="font-semibold">{c.printedLink}: </span>
            <a href={review.href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
              className="text-primary-dark underline focus-visible:focus-ring">{review.href}</a>
          </p>
        </div>}
  </section>;
}
