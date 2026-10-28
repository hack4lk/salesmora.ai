"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { FormFeedback } from "@salesmora/ui";
import { estimateButton, estimatePrimary } from "../estimate-ui";
import {
  estimateCreationFlowData as c, estimateCreationStepOrder, type EstimateCreationStep,
} from "./estimate-creation-flow.data";

export type EstimateCreationFlowProps = {
  step: EstimateCreationStep;
  children: ReactNode;
  pending?: boolean;
  continueDisabled?: boolean;
  sendDisabled?: boolean;
  publishDisabled?: boolean;
  error?: string;
  notice?: string;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft?: () => void;
  onSend?: () => void;
  onPublish?: () => void;
};

/** The host preserves edits, validates each transition and confirms authoritative save/delivery results. */
export function EstimateCreationFlow({
  step, children, pending = false, continueDisabled = false, sendDisabled = false, publishDisabled = false,
  error, notice, onBack, onContinue, onSaveDraft, onSend, onPublish,
}: EstimateCreationFlowProps) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const previous = useRef(step);
  const index = estimateCreationStepOrder.indexOf(step);
  useEffect(() => {
    if (previous.current !== step) heading.current?.focus();
    previous.current = step;
  }, [step]);
  useEffect(() => {
    if (error) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [error]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (step === "send") {
      if (!sendDisabled) onSend?.();
    } else if (!continueDisabled) onContinue();
  }

  return <div className="grid min-w-0 gap-6">
    <nav aria-label={c.progress} className="print:hidden">
      <ol className="m-0 flex list-none gap-3 p-0">
        {estimateCreationStepOrder.map((key, position) => <li key={key}
          aria-current={key === step ? "step" : undefined}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1 border-b-2 pb-3 text-center text-sm font-semibold sm:gap-2 ${
            position <= index ? "border-primary text-primary-dark" : "border-line text-muted"
          }`}>
          <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full border sm:size-9 ${
            key === step ? "border-primary bg-primary text-paper"
              : position < index ? "border-primary bg-canvas" : "border-line bg-paper"
          }`}>{position + 1}</span>
          <span>{c.steps[key].label}</span>
          {key !== step && <span className="sr-only">{position < index ? c.completed : c.upcoming}</span>}
        </li>)}
      </ol>
    </nav>
    <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6">
      <header className="grid gap-2 print:hidden">
        <p className="m-0 text-sm font-semibold text-primary-dark">{c.current(index + 1)}</p>
        <h2 id={`${id}-title`} ref={heading} tabIndex={-1}
          className="m-0 text-heading font-semibold text-ink focus-visible:focus-ring">{c.steps[step].title}</h2>
        <p id={`${id}-description`} className="m-0 max-w-3xl text-base leading-6 text-muted">{c.steps[step].description}</p>
      </header>
      <form ref={form} noValidate aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
        aria-busy={pending} onSubmit={submit} className="grid min-w-0 gap-6">
        <fieldset disabled={pending} className="m-0 grid min-w-0 gap-6 border-0 p-0">{children}</fieldset>
        <div className="grid gap-3 print:hidden">
          {error && <FormFeedback kind="error" message={error} />}
          {notice && <p role="status" className="m-0 text-sm leading-6">{notice}</p>}
          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>{step !== "details" && <button type="button" className={`${estimateButton} w-full sm:w-auto`}
              disabled={pending} onClick={onBack}>{c.back[step]}</button>}</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {onSaveDraft && <button type="button" className={estimateButton} disabled={pending}
                onClick={onSaveDraft}>{c.save}</button>}
              {step === "send" ? <>
                {onPublish && <button type="button" className={estimateButton}
                  disabled={pending || publishDisabled} onClick={onPublish}>{c.publish}</button>}
                {onSend && <button type="submit" className={estimatePrimary}
                  disabled={pending || sendDisabled}>{pending ? c.pending : c.send}</button>}
              </> : <button type="submit" className={estimatePrimary}
                disabled={pending || continueDisabled}>{pending ? c.pending : c.continue[step]}</button>}
            </div>
          </div>
        </div>
      </form>
    </section>
  </div>;
}
