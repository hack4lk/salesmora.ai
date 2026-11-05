'use client';

import type { CaptureGmailHealth } from '@salesmora/contracts';
import { useId } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import type { CaptureDashboardSource } from '../capture-dashboard-summary/capture-dashboard-summary.validation';
import { captureSourceDetailsData as copy } from './capture-source-details.data';
import { validCaptureSourceConfiguration, type CaptureSourceConfiguration } from './capture-source-details.validation';

export type CaptureSourceDetailsProps = {
  source: CaptureDashboardSource;
  configuration?: CaptureSourceConfiguration;
  draftVersion?: number;
  /** Host-authorized data and capabilities; callbacks must reauthorize when integrated. */
  availability: { type: 'website'; status: 'published' | 'unpublished' | 'unavailable' } | { type: 'gmail'; status: 'connected' | 'reconnect-required' | 'not-connected'; email?: string; health?: CaptureGmailHealth };
  canRead: boolean; canEdit: boolean; canManageConnection: boolean; canReadPublication: boolean;
  state?: 'ready' | 'loading' | 'error'; pending?: boolean;
  onEdit?: () => void; onManageConnection?: () => void; onViewPublication?: () => void; onRetry?: () => void;
};
const panel = 'min-w-0 rounded-2xl border border-line bg-paper p-5 sm:p-6';
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function CaptureSourceDetails({ source, configuration, draftVersion, availability, canRead, canEdit, canManageConnection, canReadPublication, state = 'ready', pending = false, onEdit, onManageConnection, onViewPublication, onRetry }: CaptureSourceDetailsProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (state === 'loading') return <p role="status" aria-busy="true" className={panel}>{copy.loading}</p>;
  if (state === 'error') return <div className={`${panel} grid gap-3`}><FormFeedback kind="error" message={copy.error} />{onRetry && <button className={`${button} justify-self-start`} disabled={pending} onClick={onRetry} type="button">{copy.retry}</button>}</div>;
  if (!validCaptureSourceConfiguration(source, configuration, draftVersion) || availability.type !== source.type || availability.type === 'gmail' && availability.status !== 'not-connected' && !availability.email?.trim()) return <FormFeedback kind="error" message={copy.invalid} />;
  const draft = configuration.kind === 'draft', editable = canEdit && source.status !== 'archived';
  return <section aria-label={copy.title} className="grid min-w-0 items-start gap-5 text-ink lg:grid-cols-2">
    <section aria-labelledby={`${id}-configuration`} className={`${panel} grid gap-5`}>
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-3"><div className="grid min-w-0 gap-2"><h2 id={`${id}-configuration`} className="m-0 text-lg font-semibold">{draft ? copy.draftConfiguration : copy.configuration}</h2><p className="m-0 text-sm text-muted">{draft ? copy.draftDescription : copy.configurationDescription}</p><span className="text-sm text-muted">{copy.version} {configuration.version}</span></div>{editable && onEdit && <button type="button" className={button} disabled={pending} onClick={onEdit}>{draftVersion ? copy.continueDraft : copy.edit}</button>}</header>
      <dl className="m-0 grid min-w-0 gap-5 sm:grid-cols-2">{configuration.rows.map((row, index) => <div className="min-w-0" key={`${index}-${row.label}`}><dt className="text-sm font-semibold text-muted wrap-anywhere">{row.label}</dt><dd className="mb-0 ml-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{row.value}</dd></div>)}</dl>
      {draftVersion && <div className="grid gap-2 rounded-xl border border-line bg-canvas p-4"><p className="m-0 text-sm font-semibold">{copy.draftTitle} · {copy.version} {draftVersion}</p><p className="m-0 text-sm leading-6 text-muted">{copy.draftNotice}</p></div>}
      <p className="m-0 text-sm leading-6 text-muted">{source.status === 'archived' ? copy.archived : !canEdit ? copy.readonly : !draft && !draftVersion ? copy.editNotice : null}</p>
    </section>
    <section aria-labelledby={`${id}-availability`} className={`${panel} grid gap-5`}>
      <h2 id={`${id}-availability`} className="m-0 text-lg font-semibold">{availability.type === 'website' ? copy.publication : copy.connection}</h2>
      {availability.type === 'website' ? <><div><StatusBadge label={copy.publicationStates[availability.status]} tone={availability.status === 'published' ? 'success' : 'neutral'} /></div>{canReadPublication && onViewPublication && <button type="button" className={`${button} justify-self-start`} disabled={pending} onClick={onViewPublication}>{copy.publicationAction}</button>}</> : <>
        <div><StatusBadge label={copy.connectionStates[availability.status]} tone={availability.status === 'connected' ? 'success' : 'warning'} /></div>
        {availability.email && <dl className="m-0 min-w-0"><dt className="text-sm font-semibold text-muted">{copy.account}</dt><dd className="mb-0 ml-0 mt-1 text-sm wrap-anywhere">{availability.email}</dd></dl>}
        <p className="m-0 text-sm leading-6 text-muted">{availability.status === 'connected' ? copy.gmailDescription : availability.status === 'reconnect-required' ? copy.reconnectDescription : copy.disconnectedDescription}</p>
        {availability.health && <div className="grid gap-2 text-sm">
          <p role="status" className="m-0">{copy.syncStates[availability.health.sync]}</p>
          <p className="m-0 text-muted">{copy.syncCounts(availability.health.queued, availability.health.failed)}</p>
        </div>}
        {canManageConnection && source.status !== 'archived' && onManageConnection && <button type="button" className={`${button} justify-self-start`} disabled={pending} onClick={onManageConnection}>{copy.connectionAction}</button>}
      </>}
    </section>
  </section>;
}
