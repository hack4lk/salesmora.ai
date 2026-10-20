'use client';

import { useId } from 'react';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { useFormReady } from '../../auth/use-form-ready';
import { workOrderSettingsPageData as copy } from './work-order-settings-page.data';

export type WorkOrderSettingsValues = { signoffRequired: boolean; businessPhone: string };
export type WorkOrderSettingsPageProps = {
  settingsHref: string;
  canEdit: boolean;
  values: WorkOrderSettingsValues;
  savedValues: WorkOrderSettingsValues;
  saveState: 'idle' | 'pending' | 'error' | 'saved';
  onChange: (values: WorkOrderSettingsValues) => void;
  onSave: (values: WorkOrderSettingsValues) => void;
  onDiscard: () => void;
};
const secondaryClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';

/** Controlled workspace work-order settings. The live adapter owns persistence and request state. */
export function WorkOrderSettingsPage({ settingsHref, canEdit, values, savedValues, saveState, onChange, onSave, onDiscard }: WorkOrderSettingsPageProps) {
  const id = useId(), interactive = useFormReady();
  const pending = saveState === 'pending', locked = pending || !interactive || !canEdit;
  const dirty = values.signoffRequired !== savedValues.signoffRequired || values.businessPhone.trim() !== savedValues.businessPhone;
  return <div className="grid min-w-0 gap-6">
    <header>
      <a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a>
      <p className="mb-0 mt-4 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p>
      <h1 className="mb-0 mt-3 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1>
      <p className="mb-0 mt-4 text-base leading-relaxed text-muted">{copy.description}</p>
    </header>
    <form aria-busy={pending} onSubmit={event => { event.preventDefault(); if (!locked && dirty) onSave({ ...values, businessPhone: values.businessPhone.trim() }); }} className="grid min-w-0 gap-6">
      <section className="min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8" aria-labelledby={`${id}-signoff`}>
        <h2 id={`${id}-signoff`} className="m-0 text-xl font-semibold text-ink">{copy.signoffTitle}</h2>
        <div className="mt-6 flex min-w-0 flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <div className="min-w-0 sm:flex-1 sm:basis-64">
            <h3 id={`${id}-signoff-label`} className="m-0 text-base font-semibold text-ink">{copy.signoffLabel}</h3>
            <p id={`${id}-signoff-help`} className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.signoffDescription}</p>
          </div>
          <button type="button" role="switch" aria-checked={values.signoffRequired} aria-labelledby={`${id}-signoff-label`} aria-describedby={`${id}-signoff-help`} disabled={locked}
            onClick={() => onChange({ ...values, signoffRequired: !values.signoffRequired })}
            className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 font-semibold text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60">
            <span aria-hidden="true" className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-1 ${values.signoffRequired ? 'justify-end border-primary bg-primary' : 'justify-start border-muted bg-muted'}`}><span className="size-5 rounded-full bg-paper"/></span>
            <span aria-hidden="true" className="min-w-8 text-sm">{values.signoffRequired ? copy.on : copy.off}</span>
          </button>
        </div>
      </section>
      <section className="min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8" aria-labelledby={`${id}-phone`}>
        <h2 id={`${id}-phone`} className="m-0 text-xl font-semibold text-ink">{copy.phoneTitle}</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.phoneDescription}</p>
        <label className="mt-6 grid gap-2 text-sm font-semibold text-ink">{copy.phoneLabel}
          <input type="tel" inputMode="tel" autoComplete="off" maxLength={32} disabled={locked} value={values.businessPhone} placeholder={copy.phonePlaceholder}
            onChange={event => onChange({ ...values, businessPhone: event.target.value })}
            className="min-h-11 w-full max-w-sm rounded-xl border border-line bg-paper px-4 py-2 text-base font-normal text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60"/>
        </label>
      </section>
      {!canEdit && <p role="status" className="m-0 text-sm text-muted">{copy.readOnly}</p>}
      {saveState === 'error' && <FormFeedback kind="error" title={copy.saveErrorTitle} message={copy.saveError}/>}
      {saveState === 'saved' && !dirty && <FormFeedback kind="success" title={copy.successTitle} message={copy.success}/>}
      {canEdit && <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="m-0 text-sm text-muted">{dirty ? copy.changed : copy.unchanged}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!dirty || pending || !interactive} className={secondaryClass} onClick={() => { if (dirty && !pending) onDiscard(); }}>{copy.discard}</button>
          <SubmitButton label={copy.save} pendingLabel={copy.saving} pending={pending} disabled={!dirty || !interactive} fullWidth={false}/>
        </div>
      </div>}
    </form>
  </div>;
}
