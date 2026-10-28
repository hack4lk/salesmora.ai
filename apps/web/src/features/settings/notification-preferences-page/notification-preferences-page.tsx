'use client';

import { useId } from 'react';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { useFormReady } from '../../auth/use-form-ready';
import { notificationPreferencesPageData as copy } from './notification-preferences-page.data';

export type NotificationPreferencesValues = { leadAssignedEmail: boolean; visitChangedEmail?: boolean; estimateEmail?: boolean; deadlineReminderEmail?: boolean; jobActivityEmail?: boolean };
export type NotificationPreferencesPageProps = {
  /** Optional groups let preview and live adapters expose their supported preferences. */
  showVisitChanges?: boolean;
  showEstimateNotifications?: boolean;
  showDeadlineReminders?: boolean;
  /** Expose supported Job activity preferences in previews and live adapters. */
  showJobActivity?: boolean;
  /** Keep live copy accurate while remaining Job lifecycle events are implemented separately. */
  jobActivityScope?: 'all' | 'creation' | 'creation-status' | 'creation-status-assignment';
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
export function NotificationPreferencesPage({ showVisitChanges = false, showEstimateNotifications = false, showDeadlineReminders = false, showJobActivity = false, jobActivityScope = 'all', settingsHref, state, values, savedValues, saveState, onChange, onSave, onDiscard, onRetry }: NotificationPreferencesPageProps) {
  const id = useId(), interactive = useFormReady();
  const pending = saveState === 'pending';
  const dirty = values.leadAssignedEmail !== savedValues.leadAssignedEmail ||
    (showVisitChanges && (values.visitChangedEmail ?? true) !== (savedValues.visitChangedEmail ?? true)) ||
    (showEstimateNotifications && (values.estimateEmail ?? true) !== (savedValues.estimateEmail ?? true)) ||
    (showDeadlineReminders && (values.deadlineReminderEmail ?? true) !== (savedValues.deadlineReminderEmail ?? true)) ||
    (showJobActivity && (values.jobActivityEmail ?? true) !== (savedValues.jobActivityEmail ?? true));
  const preferences = [
    { key: 'leadAssignedEmail' as const, label: copy.leadAssigned, help: copy.leadDescription },
    ...(showJobActivity ? [{ key: 'jobActivityEmail' as const, label: copy.jobActivity, help: jobActivityScope === 'creation-status-assignment' ? copy.jobActivityAssignmentDescription : jobActivityScope === 'creation' ? copy.jobActivityCreationDescription : jobActivityScope === 'creation-status' ? copy.jobActivityStatusDescription : copy.jobActivityDescription }] : []),
    ...(showVisitChanges ? [{ key: 'visitChangedEmail' as const, label: copy.visitChanged, help: copy.visitDescription }] : []),
    ...(showDeadlineReminders ? [{ key: 'deadlineReminderEmail' as const, label: copy.deadlineReminders, help: copy.deadlineDescription }] : []),
    ...(showEstimateNotifications ? [{ key: 'estimateEmail' as const, label: copy.estimateEvents, help: copy.estimateDescription }] : []),
  ];
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
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{showVisitChanges || showDeadlineReminders || showEstimateNotifications || showJobActivity ? copy.activityEmailDescription : copy.emailDescription}</p>
        {preferences.map(preference => <div key={preference.key} className="mt-6 flex min-w-0 flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <div className="min-w-0 sm:flex-1 sm:basis-64">
            <h3 id={`${id}-${preference.key}`} className="m-0 text-base font-semibold text-ink">{preference.label}</h3>
            <p id={`${id}-${preference.key}-help`} className="mb-0 mt-2 text-sm leading-6 text-muted">{preference.help}</p>
          </div>
          <button type="button" role="switch" aria-checked={(values[preference.key] ?? true)} aria-labelledby={`${id}-${preference.key}`} aria-describedby={`${id}-${preference.key}-help`} disabled={pending || !interactive}
            onClick={() => { if (interactive && !pending) onChange({ ...values, [preference.key]: !(values[preference.key] ?? true) }); }}
            className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 font-semibold text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60">
            <span aria-hidden="true" className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-1 ${(values[preference.key] ?? true) ? 'justify-end border-primary bg-primary' : 'justify-start border-muted bg-muted'}`}><span className="size-5 rounded-full bg-paper"/></span>
            <span aria-hidden="true" className="min-w-8 text-sm">{(values[preference.key] ?? true) ? copy.on : copy.off}</span>
          </button>
        </div>)}
      </section>
      <aside aria-labelledby={`${id}-app`} className="rounded-2xl border border-line bg-canvas p-6">
        <h2 id={`${id}-app`} className="m-0 text-base font-semibold text-ink">{copy.appTitle}</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{showJobActivity ? copy.jobActivityAppDescription : showDeadlineReminders ? copy.deadlineAppDescription : showVisitChanges ? copy.visitAppDescription : copy.appDescription}</p>
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
    <p className="m-0 text-sm leading-6 text-muted">{showJobActivity ? copy.jobActivityLater : showDeadlineReminders ? copy.deadlineLater : showVisitChanges ? copy.visitLater : copy.later}</p>
  </div>;
}
