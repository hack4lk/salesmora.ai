'use client';

import { useId } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, StatusBadge } from '@salesmora/ui';
import { websiteCaptureBriefData as copy } from './website-capture-brief.data';

export type WebsiteSuggestedField = {
  id: string;
  label: string;
  type: keyof typeof copy.types;
  requirement: keyof typeof copy.requirements;
  reason: string;
};
export type WebsiteFieldSuggestion = { id: string; brief: string; fields: readonly WebsiteSuggestedField[] };
export type WebsiteCaptureBriefProps = {
  brief: string;
  context?: { businessName: string; services: readonly string[]; serviceArea: string };
  suggestion?: WebsiteFieldSuggestion;
  /** Identity of the suggestion currently accepted by the host into its draft. */
  acceptedSuggestionId?: string;
  canSuggest?: boolean;
  canRead: boolean;
  canEdit: boolean;
  pending?: boolean;
  error?: string;
  briefError?: string;
  onBriefChange: (brief: string) => void;
  onSuggest: (brief: string) => void;
  onUseFields: (suggestion: WebsiteFieldSuggestion) => void;
};

const buttonBase = 'min-h-11 max-w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Controlled brief and suggestion review; the host owns generation, draft fields and authoritative validation. */
export function WebsiteCaptureBrief({ brief, context, suggestion, acceptedSuggestionId, canRead, canEdit, canSuggest = true, pending = false, error, briefError, onBriefChange, onSuggest, onUseFields }: WebsiteCaptureBriefProps) {
  const id = useId();
  if (!canRead) return <p role="alert" className="m-0 rounded-2xl border border-line bg-paper p-6 text-sm text-error">{copy.forbidden}</p>;
  const disabled = !canEdit || pending;
  const stale = !!suggestion && suggestion.brief !== brief;
  const accepted = !!suggestion && acceptedSuggestionId === suggestion.id;
  const canUse = canSuggest && !disabled && !!suggestion?.fields.length && !stale && !error && !briefError && !accepted;

  return <section className="grid min-w-0 gap-6 text-ink">
    <section aria-labelledby={`${id}-context`} className="rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <h2 id={`${id}-context`} className="mb-4 mt-0 text-base font-semibold">{copy.context}</h2>
      {context ? <dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-3">
        {[[copy.business, context.businessName || copy.missing], [copy.services, context.services.join(', ') || copy.missing], [copy.area, context.serviceArea || copy.missing]].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="mb-0 ml-0 mt-1 text-sm font-semibold leading-6 wrap-anywhere">{value}</dd></div>)}
      </dl> : <p className="m-0 text-sm leading-6 text-muted">{copy.noContext}</p>}
    </section>
    <div className="grid min-w-0 justify-items-start gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <MuiTextField label={copy.brief} placeholder={copy.placeholder} multiline minRows={4} fullWidth required disabled={disabled}
        value={brief} onChange={event => { if (!disabled) onBriefChange(event.target.value); }} variant="outlined" size="small" className={fieldClasses}
        error={!!briefError} helperText={briefError || copy.helper} slotProps={{ htmlInput: { maxLength: 2000, className: 'focus-visible:focus-ring' } }} />
      {canEdit && <button type="button" disabled={pending || !canSuggest || !brief.trim() || !!briefError} aria-busy={pending}
        className={`${buttonBase} bg-primary text-paper hover:bg-primary-dark`} onClick={() => { if (!disabled && canSuggest && brief.trim() && !briefError) onSuggest(brief); }}>{pending ? copy.suggesting : copy.suggest}</button>}
    </div>
    {!canEdit && <p className="m-0 text-sm text-muted">{copy.readOnly}</p>}
    {error && <FormFeedback kind="error" message={error} />}
    {pending && <p role="status" className="m-0 text-sm text-muted">{copy.suggesting}</p>}
    <section aria-labelledby={`${id}-fields`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <div><h2 id={`${id}-fields`} className="m-0 text-base font-semibold">{copy.fields}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.fieldsDescription}</p></div>
      {suggestion?.fields.length ? <ul className="m-0 grid min-w-0 list-none divide-y divide-line p-0">{suggestion.fields.map(field => <li key={field.id} className="grid min-w-0 gap-2 py-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
        <div className="grid min-w-0 gap-1"><h3 className="m-0 text-sm font-semibold wrap-anywhere">{field.label}</h3><p className="m-0 text-sm leading-6 text-muted wrap-anywhere">{field.reason}</p><span className="text-xs text-muted">{copy.types[field.type]}</span></div>
        <StatusBadge label={copy.requirements[field.requirement]} tone={field.requirement === 'optional' ? 'neutral' : 'info'} />
      </li>)}</ul> : <p className="m-0 text-sm leading-6 text-muted">{canSuggest ? copy.empty : copy.suggestionsUnavailable}</p>}
      {stale && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.stale}</p>}
      {accepted && !stale && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.accepted}</p>}
      {canEdit && !!suggestion?.fields.length && <div><button type="button" disabled={!canUse} className={`${buttonBase} border border-line bg-paper text-primary hover:bg-canvas`}
        onClick={() => { if (canUse && suggestion) onUseFields(suggestion); }}>{accepted && !stale ? copy.selected : copy.use}</button></div>}
    </section>
    <section aria-labelledby={`${id}-plan`} className="grid gap-3 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <h2 id={`${id}-plan`} className="m-0 text-base font-semibold">{copy.plan}</h2><p className="m-0 text-sm font-semibold text-primary-dark">{copy.destination}</p>
      <p className="m-0 text-sm leading-6 text-muted">{copy.publication}</p><p className="m-0 text-sm leading-6 text-muted">{copy.admission}</p><p className="m-0 text-sm leading-6 text-muted">{copy.review}</p>
    </section>
  </section>;
}
