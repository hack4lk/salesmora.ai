'use client';

import { useId } from 'react';
import { TextField } from '@salesmora/ui';
import { captureSourceSelectionData as copy } from './capture-source-selection.data';

export type CaptureSourceSelectionValue = { name: string; source: 'website' | 'gmail' | null };
export type CaptureSourceSelectionProps = {
  value: CaptureSourceSelectionValue;
  canRead: boolean;
  canEdit: boolean;
  /** Resolved by the host from authoritative entitlements, never the displayed plan name. */
  gmailAccess: 'available' | 'upgrade-required' | 'unavailable' | 'loading';
  pending?: boolean;
  errors?: { name?: string; source?: string };
  onChange: (value: CaptureSourceSelectionValue) => void;
  onReviewPlans?: () => void;
};

/** Draft controls only. The host validates, saves and guards progression; nothing connects or publishes here. */
export function CaptureSourceSelection({ value, canRead, canEdit, gmailAccess, pending = false, errors, onChange, onReviewPlans }: CaptureSourceSelectionProps) {
  const id = useId();
  if (!canRead) return <p role="alert" className="m-0 rounded-2xl border border-line bg-paper p-6 text-sm text-error">{copy.forbidden}</p>;
  const disabled = pending || !canEdit;
  const gmailAvailable = gmailAccess === 'available';
  const accessMessage = gmailAccess === 'loading' ? copy.loading : gmailAccess === 'unavailable' ? copy.unavailable : gmailAccess === 'upgrade-required' ? (value.source === 'gmail' ? copy.stale : copy.upgrade) : undefined;
  const sourceError = errors?.source;
  const blockedSelection = value.source === 'gmail' && gmailAccess !== 'loading' && !gmailAvailable;
  const change = (patch: Partial<CaptureSourceSelectionValue>) => {
    if (disabled || (patch.source === 'gmail' && !gmailAvailable)) return;
    onChange({ ...value, ...patch });
  };

  return <section className="grid min-w-0 gap-6 text-ink">
    <div className="min-w-0 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <TextField label={copy.name} required value={value.name} disabled={disabled} placeholder={copy.placeholder}
        error={!!errors?.name} helperText={errors?.name || copy.nameHint} onChange={event => change({ name: event.target.value })}
        slotProps={{ htmlInput: { maxLength: 80, className: 'focus-visible:focus-ring' } }} />
    </div>
    {!canEdit && <p role="status" className="m-0 text-sm text-muted">{copy.readOnly}</p>}
    <fieldset disabled={disabled} aria-describedby={sourceError ? `${id}-source-error` : blockedSelection ? `${id}-access` : undefined} aria-invalid={!!sourceError || blockedSelection}
      className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-4 text-base font-semibold">{copy.choose}</legend>
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {(['website', 'gmail'] as const).map(source => {
          const item = copy[source], selected = value.source === source;
          const unavailable = disabled || (source === 'gmail' && !gmailAvailable);
          return <label key={source} className={`grid min-w-0 content-start gap-4 rounded-2xl border-2 p-5 focus-within:focus-ring ${selected ? 'border-primary bg-primary/10' : 'border-line bg-paper'} ${unavailable ? 'cursor-default' : 'cursor-pointer hover:border-primary'}`}>
            <span className="flex min-w-0 items-start justify-between gap-4">
              <span className="min-w-0 text-lg font-semibold wrap-anywhere">{item.title}</span>
              <input type="radio" name={`${id}-source`} value={source} checked={selected} disabled={unavailable}
                aria-label={item.title} aria-describedby={`${id}-${source}-description${source === 'gmail' && accessMessage ? ` ${id}-access` : ''}${sourceError ? ` ${id}-source-error` : ''}`}
                onChange={() => change({ source })} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring" />
            </span>
            <span id={`${id}-${source}-description`} className="text-sm leading-6 text-muted">{item.description}</span>
            <span role="list" className="grid min-w-0 gap-3 text-sm leading-6 text-muted">
              {item.benefits.map(benefit => <span role="listitem" key={benefit} className="flex min-w-0 gap-2"><span aria-hidden="true">•</span><span>{benefit}</span></span>)}
            </span>
            <span className="text-sm font-semibold text-primary-dark">{item.note}</span>
          </label>;
        })}
      </div>
    </fieldset>
    {sourceError && <p id={`${id}-source-error`} role="alert" className="m-0 text-sm text-error">{sourceError}</p>}
    {accessMessage && <div className="grid justify-items-start gap-3 rounded-xl border border-line bg-paper p-4">
      <p id={`${id}-access`} role={gmailAccess === 'loading' ? 'status' : blockedSelection ? 'alert' : undefined} className="m-0 text-sm leading-6 text-muted">{accessMessage}</p>
      {gmailAccess === 'upgrade-required' && canEdit && onReviewPlans && <button type="button" disabled={pending} onClick={onReviewPlans}
        className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.plans}</button>}
    </div>}
    <p className="m-0 text-sm leading-6 text-muted">{copy.draft}</p>
  </section>;
}
