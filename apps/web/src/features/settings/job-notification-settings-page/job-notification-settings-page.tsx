'use client';
import { useId } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { DefaultCompletionDeadline, type DefaultCompletionDeadlineProps } from '../default-completion-deadline/default-completion-deadline';
import { DeadlineReminderSettings, type DeadlineReminderSettingsProps } from '../deadline-reminder-settings/deadline-reminder-settings';
import { JobNotificationEvents, type JobNotificationEventsProps } from '../job-notification-events/job-notification-events';
import { jobButton } from '../../jobs/job-ui';
import { jobNotificationSettingsPageData as copy } from './job-notification-settings-page.data';
type Shared = 'canManage' | 'state';
export type JobNotificationSettingsPageProps = {
  settingsHref: string; preferencesHref: string; plan: 'free' | 'standard' | 'premium'; timezone: string; canManage: boolean;
  deliveryPending?: boolean;
  state?: 'ready' | 'loading' | 'error'; onRetry: () => void;
  deadline: Omit<DefaultCompletionDeadlineProps, Shared | 'timezone'>;
  reminders: Omit<DeadlineReminderSettingsProps, Shared | 'plan' | 'timezone'>;
  events: Omit<JobNotificationEventsProps, Shared | 'plan'>;
};
/** Page composition only; the route adapter owns authorization, persistence and scoped context. */
export function JobNotificationSettingsPage({ settingsHref, preferencesHref, plan, timezone, canManage, deliveryPending = false, state = 'ready', onRetry, deadline, reminders, events }: JobNotificationSettingsPageProps) {
  const id = useId();
  return <div className="grid min-w-0 gap-6">
    <header><a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a>
      <p className="mb-0 mt-4 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p><h1 className="mb-0 mt-3 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-4 text-base leading-relaxed text-muted">{copy.description}</p></header>
    {deliveryPending && <aside className="grid gap-2 rounded-2xl border border-primary bg-primary/5 p-6"><h2 className="m-0 text-base font-semibold">{copy.configurationTitle}</h2><p className="m-0 text-sm leading-6">{copy.configurationHelp}</p></aside>}
    {state === 'loading' ? <p role="status" className="m-0 rounded-2xl border border-line bg-paper p-6 text-base text-muted">{copy.loading}</p> : state === 'error' ? <div className="grid gap-4"><FormFeedback kind="error" message={copy.loadError}/><button type="button" className={`${jobButton} justify-self-start`} onClick={onRetry}>{copy.retry}</button></div> : <>
      <aside aria-labelledby={`${id}-scope`} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-canvas p-6"><h2 id={`${id}-scope`} className="m-0 text-base font-semibold">{copy.scope} · {copy.plan[plan]}</h2><p className="m-0 text-sm leading-6 text-muted">{plan === 'premium' ? copy.premium : copy.fixed}</p><p className="m-0 text-sm leading-6 text-muted">{copy.saveHelp}</p><p className="m-0 text-sm wrap-anywhere"><strong>{copy.timezone}:</strong> {timezone}</p></aside>
      <DefaultCompletionDeadline {...deadline} timezone={timezone} canManage={canManage}/>
      <DeadlineReminderSettings {...reminders} plan={plan} timezone={timezone} canManage={canManage}/>
      <JobNotificationEvents {...events} plan={plan} canManage={canManage}/>
      <aside aria-labelledby={`${id}-behavior`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-6 sm:p-8"><h2 id={`${id}-behavior`} className="m-0 text-xl font-semibold">{copy.behavior}</h2><dl className="m-0 grid gap-4 text-sm sm:grid-cols-2">{copy.rules.map(rule => <div key={rule.label}><dt className="font-semibold">{rule.label}</dt><dd className="m-0 mt-2 leading-6 text-muted">{rule.detail}</dd></div>)}</dl><p className="m-0 text-sm leading-6 text-muted">{copy.channels}</p></aside>
      <aside aria-labelledby={`${id}-personal`} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-canvas p-6"><h2 id={`${id}-personal`} className="m-0 text-base font-semibold">{copy.personalTitle}</h2><p className="m-0 text-sm leading-6 text-muted">{copy.personal}</p><a href={preferencesHref} className="inline-flex min-h-11 items-center justify-self-start rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.personalLink}</a></aside>
    </>}
  </div>;
}
