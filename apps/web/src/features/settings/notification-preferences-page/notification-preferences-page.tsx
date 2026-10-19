'use client';

import { useId } from 'react';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { useFormReady } from '../../auth/use-form-ready';
import { notificationPreferencesPageData as copy } from './notification-preferences-page.data';

export type NotificationPreferencesValues = { leadAssignedEmail: boolean };
export type NotificationPreferencesPageProps = {
  settingsHref: string;
  state: 'ready' | 'loading' | 'error';
  values: NotificationPreferencesValues;
  savedValues: NotificationPreferencesValues;
  saveState: 'idle' | 'pending' | 'error' | 'saved';
  onChange: (values: NotificationPreferencesValues) => void;
  onSave: (values: NotificationPreferencesValues) => void;
  onDiscard: () => void;
  onRetry: () => void;
};
const secondaryClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';

/** Controlled personal preferences. The live adapter owns identity, persistence and request state. */
export function NotificationPreferencesPage({ settingsHref, state, values, savedValues, saveState, onChange, onSave, onDiscard, onRetry }: NotificationPreferencesPageProps) {
  const id = useId(), interactive = useFormReady();
  const pending = saveState === 'pending';
  const dirty = values.leadAssignedEmail !== savedValues.leadAssignedEmail;
  return <div className="grid min-w-0 gap-6">
    <header>
      <a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a>
      <p className="mb-0 mt-4 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p>
      <h1 className="mb-0 mt-3 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1>
      <p className="mb-0 mt-4 text-base leading-relaxed text-muted">{copy.description}</p>
    </header>
    {state === 'loading' ? <p role="status" className="m-0 rounded-2xl border border-line bg-paper p-6 text-base text-muted">{copy.loading}</p> : state === 'error' ? <div className="grid gap-4">
      <FormFeedback kind="error" title={copy.loadErrorTitle} message={copy.loadError}/>
      <div><button type="button" className={secondaryClass} disabled={!interactive} onClick={onRetry}>{copy.retry}</button></div>
    </div> : <form aria-labelledby={`${id}-emails`} aria-busy={pending} onSubmit={event => { event.preventDefault(); if (interactive && dirty && !pending) onSave({ ...values }); }} className="grid min-w-0 gap-6">
      <section className="min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8" aria-labelledby={`${id}-emails`}>
        <h2 id={`${id}-emails`} className="m-0 text-xl font-semibold text-ink">{copy.emailTitle}</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.emailDescription}</p>
        <div className="mt-6 flex min-w-0 flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <div className="min-w-0 sm:flex-1 sm:basis-64">
            <h3 id={`${id}-lead`} className="m-0 text-base font-semibold text-ink">{copy.leadAssigned}</h3>
            <p id={`${id}-help`} className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.leadDescription}</p>
          </div>
          <button type="button" role="switch" aria-checked={values.leadAssignedEmail} aria-labelledby={`${id}-lead`} aria-describedby={`${id}-help`} disabled={pending || !interactive}
            onClick={() => { if (interactive && !pending) onChange({ ...values, leadAssignedEmail: !values.leadAssignedEmail }); }}
            className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 font-semibold text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60">
            <span aria-hidden="true" className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-1 ${values.leadAssignedEmail ? 'justify-end border-primary bg-primary' : 'justify-start border-muted bg-muted'}`}><span className="size-5 rounded-full bg-paper"/></span>
            <span aria-hidden="true" className="min-w-8 text-sm">{values.leadAssignedEmail ? copy.on : copy.off}</span>
          </button>
        </div>
      </section>
      <aside aria-labelledby={`${id}-app`} className="rounded-2xl border border-line bg-canvas p-6">
        <h2 id={`${id}-app`} className="m-0 text-base font-semibold text-ink">{copy.appTitle}</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.appDescription}</p>
      </aside>
      {saveState === 'error' && <FormFeedback kind="error" title={copy.saveErrorTitle} message={copy.saveError}/>}
      {saveState === 'saved' && !dirty && <FormFeedback kind="success" title={copy.successTitle} message={copy.success}/>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="m-0 text-sm text-muted">{dirty ? copy.changed : copy.unchanged}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!dirty || pending || !interactive} className={secondaryClass} onClick={() => { if (interactive && dirty && !pending) onDiscard(); }}>{copy.discard}</button>
          <SubmitButton label={copy.save} pendingLabel={copy.saving} pending={pending} disabled={!dirty || !interactive} fullWidth={false}/>
        </div>
      </div>
    </form>}
    <p className="m-0 text-sm leading-6 text-muted">{copy.later}</p>
  </div>;
}
