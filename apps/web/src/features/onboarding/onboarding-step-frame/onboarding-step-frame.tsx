'use client';

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import Button from '@mui/material/Button';
import { SubmitButton } from '@salesmora/ui';
import { onboardingStepFrameData as copy, onboardingStepOrder, type OnboardingStep } from './onboarding-step-frame.data';

export interface OnboardingStepFrameProps {
  activeStep: OnboardingStep;
  /** Fields/content only: the frame owns the form and its submit action. */
  children: ReactNode;
  onContinue: () => void;
  onBack: () => void;
  onSkipTeam?: () => void;
  pending?: boolean;
  continueDisabled?: boolean;
}

/** Controlled presentation: the owner validates, preserves values, and saves. */
export function OnboardingStepFrame({ activeStep, children, onContinue, onBack, onSkipTeam, pending = false, continueDisabled = false }: OnboardingStepFrameProps) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(activeStep);
  const currentIndex = onboardingStepOrder.indexOf(activeStep);
  const step = copy.steps[activeStep];
  const review = activeStep === 'review';
  useEffect(() => {
    if (previousStep.current !== activeStep) heading.current?.focus();
    previousStep.current = activeStep;
  }, [activeStep]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending && !continueDisabled) onContinue();
  }

  return <div className="w-full min-w-0 max-w-2xl">
    <nav aria-label={copy.progressLabel} className="mb-6">
      <ol className="m-0 grid list-none grid-cols-4 gap-2 p-0">
        {onboardingStepOrder.map((key, index) => <li key={key} aria-current={key === activeStep ? 'step' : undefined} className={`flex min-w-0 flex-col items-center gap-2 border-b-2 pb-3 text-center text-xs font-semibold sm:text-sm ${index <= currentIndex ? 'border-primary text-primary-dark' : 'border-line text-muted'}`}>
          <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full border ${key === activeStep ? 'border-primary bg-primary text-paper' : index < currentIndex ? 'border-primary bg-canvas text-primary-dark' : 'border-line bg-paper text-muted'}`}>{index + 1}</span>
          <span>{copy.steps[key].label}{key === 'team' && <span className="block text-xs font-normal text-muted">{copy.optional}</span>}</span>
          {index !== currentIndex && <span className="sr-only">{index < currentIndex ? copy.completed : copy.upcoming}</span>}
        </li>)}
      </ol>
    </nav>
    <section className="rounded-2xl border border-line bg-paper p-4 sm:p-6" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} ref={heading} tabIndex={-1} className="m-0 text-xl font-semibold leading-normal tracking-tight text-ink focus-visible:focus-ring">{step.title}</h2>
      <p id={`${id}-description`} className="mb-6 mt-2 text-sm leading-6 text-muted">{step.description}</p>
      <form aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} aria-busy={pending} noValidate onSubmit={submit} className="grid min-w-0 gap-6">
        <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">{children}</fieldset>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {currentIndex > 0 && <Button type="button" variant="outlined" disabled={pending} onClick={onBack} className="min-h-11 rounded-xl border-line px-6 py-3 text-base font-semibold normal-case text-ink hover:border-primary hover:bg-canvas focus-visible:focus-ring">{copy.back}</Button>}
          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            {activeStep === 'team' && onSkipTeam && <Button type="button" variant="text" disabled={pending} onClick={onSkipTeam} className="min-h-11 rounded-xl px-4 py-3 text-base font-semibold normal-case text-primary hover:bg-canvas focus-visible:focus-ring">{copy.skipTeam}</Button>}
            <SubmitButton label={review ? copy.create : copy.continue} pendingLabel={review ? copy.creating : copy.pending} pending={pending} disabled={continueDisabled} fullWidth={false} />
          </div>
        </div>
      </form>
    </section>
  </div>;
}
