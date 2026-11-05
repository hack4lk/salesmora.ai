'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog, FormFeedback, StatusBadge } from '@salesmora/ui';
import { captureSetupHeaderData as copy } from './capture-setup-header.data';

export type CaptureSetupStep = keyof typeof copy.steps;
export type CaptureSetupDestination = CaptureSetupStep | 'list';
export type CaptureSetupHeaderProps = {
  /** Step contents render between the heading and the action footer. */
  children?: ReactNode;
  name: string;
  source?: keyof typeof copy.source;
  step: CaptureSetupStep;
  completedSteps: readonly CaptureSetupStep[];
  dirty?: boolean;
  revision?: boolean;
  canEdit: boolean;
  pending?: boolean;
  continueDisabled?: boolean;
  continueHint?: string;
  pendingMessage?: string;
  reviewMessage?: string;
  showSave?: boolean;
  onNavigate: (destination: CaptureSetupDestination) => void;
  /** Resolve only when saving succeeds; the host updates dirty/version state. */
  onSave: () => Promise<void>;
  /** The host validates this step before advancing; this is never publication. */
  onContinue: () => void;
};

const steps = ['source', 'intake', 'review'] as const;
const buttonBase = 'min-h-11 max-w-full cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
const buttonClass = `${buttonBase} border-line bg-paper text-primary hover:bg-canvas`;

/** Shared setup layout: heading, step contents, then actions. The host owns persistence, permissions and navigation. */
export function CaptureSetupHeader({ name, source, step, completedSteps, dirty = false, revision = false, canEdit, pending = false, continueDisabled = false, continueHint, pendingMessage, reviewMessage, showSave = true, children, onNavigate, onSave, onContinue }: CaptureSetupHeaderProps) {
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState(false);
  const [destination, setDestination] = useState<CaptureSetupDestination | null>(null);
  const inFlight = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const busy = pending || saving;
  const index = steps.indexOf(step);

  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);

  const navigate = (next: CaptureSetupDestination) => {
    if (busy || inFlight.current) return;
    if (dirty) setDestination(next);
    else onNavigate(next);
  };
  const save = async () => {
    if (!canEdit || !dirty || busy || inFlight.current) return;
    inFlight.current = true; setSaving(true); setFailure(false);
    try { await onSave(); }
    catch { setFailure(true); }
    finally { inFlight.current = false; setSaving(false); }
  };

  return <div className="grid min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-6">
    <nav aria-label={copy.progress}>
      <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:gap-3">
        {steps.map((key, position) => <li key={key} aria-current={step === key ? 'step' : undefined} className="min-w-0">
          <button type="button" aria-label={copy.stepLabel(position + 1, copy.steps[key])} disabled={busy || position >= index || !completedSteps.includes(key)}
            onClick={() => navigate(key)}
            className={`flex h-full min-h-16 w-full min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-b-[3px] px-1 py-3 text-center text-base leading-tight font-bold focus-visible:focus-ring enabled:cursor-pointer disabled:cursor-default sm:flex-row sm:gap-3 sm:px-3 sm:text-xl ${step === key ? 'border-primary border-b-primary-dark bg-seafoam text-ink' : position < index ? 'border-primary/35 border-b-primary bg-primary/10 text-primary-dark enabled:hover:bg-primary/15' : 'border-line bg-paper text-ink'}`}>
            <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm sm:size-9 sm:text-base ${step === key ? 'border-current' : position < index ? 'border-primary text-primary-dark' : 'border-line text-muted'}`}>{position + 1}</span>
            <span className="wrap-anywhere">{copy.steps[key]}</span>
          </button>
          {key !== step && <span className="sr-only">{position < index ? copy.completed : copy.upcoming}</span>}
        </li>)}
      </ol>
    </nav>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="grid min-w-0 gap-2">
        <p className="m-0 text-sm font-semibold text-primary-dark">{copy.stepCount(index + 1)}</p>
        <h1 ref={heading} tabIndex={-1} className="m-0 text-heading font-semibold focus-visible:focus-ring">{copy.stepTitles[step]}</h1>
        <p className="m-0 max-w-3xl text-base leading-6 text-muted">{copy.stepDescriptions[step]}</p>
        <p className="mb-0 mt-2 text-sm font-semibold wrap-anywhere">{name.trim() || copy.unnamed}</p>
        <div className="flex flex-wrap items-center gap-3"><StatusBadge label={revision ? copy.revision : copy.draft} tone="info" />{source && <span className="text-sm text-muted">{copy.source[source]}</span>}</div>
        {revision && <p className="m-0 text-sm leading-6 text-muted">{copy.revisionHelp}</p>}
      </div>
      <button type="button" className={buttonClass} disabled={busy} onClick={() => navigate('list')}>{copy.exit}</button>
    </div>
    </header>
    {children && <div className="grid min-w-0 gap-6" data-capture-setup-content>{children}</div>}
    <footer aria-label={copy.actions} className="grid min-w-0 gap-4">
      <p role="status" className="m-0 text-sm text-muted">{busy ? pendingMessage ?? copy.saving : !canEdit ? copy.readOnly : dirty ? copy.dirty : copy.saved}</p>
      {failure && <FormFeedback kind="error" message={copy.failed} />}
      {continueHint && <p className="m-0 text-sm leading-6 text-muted">{continueHint}</p>}
      {step === 'review' && <p className="m-0 text-sm leading-6 text-muted">{reviewMessage ?? copy.reviewHelp}</p>}
      <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className={buttonClass} disabled={busy} onClick={() => navigate(index === 0 ? 'list' : steps[index - 1])}>{copy.back}</button>
        {canEdit && (showSave || step !== 'review') && <div className="flex flex-col gap-3 sm:flex-row">
          {showSave && <button type="button" className={buttonClass} disabled={busy || !dirty} aria-busy={saving} onClick={() => { void save(); }}>{saving ? copy.saving : copy.save}</button>}
          {step !== 'review' && <button type="button" className={`${buttonBase} border-primary bg-primary text-paper hover:bg-primary-dark`} disabled={busy || continueDisabled} onClick={() => { if (!busy && !inFlight.current) onContinue(); }}>{copy.continue}</button>}
        </div>}
      </div>
    </footer>
    <ConfirmDialog open={destination !== null} title={copy.discardTitle} description={copy.discardDescription} confirmLabel={copy.discard} cancelLabel={copy.stay}
      pending={busy} onClose={() => setDestination(null)} onConfirm={() => {
        if (destination === null || busy || inFlight.current) return;
        const next = destination; setDestination(null); onNavigate(next);
      }} />
  </div>;
}
