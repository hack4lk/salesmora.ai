'use client';
import { Fragment, useId } from 'react';
import { metricCardData as copy } from './metric-card.data';

export interface MetricCardProps {
  label: string;
  /** Actual count supplied by the host. Missing/invalid values are never represented as zero. */
  value?: number;
  description?: string;
  /** Host-formatted value (for example money). Replaces the numeric count when present. */
  displayValue?: string;
  state?: 'ready' | 'loading' | 'error';
  /** Makes the card a toggle (for example a list quick filter). The host owns what selection means. */
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
}
const format = new Intl.NumberFormat('en-US');

/** Presentational count only. The host owns authorization, aggregation and filter semantics. */
export function MetricCard({ label, value, displayValue, description, state = 'ready', onSelect, selected = false, className = '' }: MetricCardProps) {
  const id = useId();
  const formatted = typeof displayValue === 'string' && displayValue.trim() !== '';
  const valid = formatted || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0);
  const unavailable = state !== 'loading' && (state === 'error' || !valid);
  return <div role="group" aria-labelledby={`${id}-label`} aria-describedby={description?.trim() ? `${id}-description` : undefined} aria-busy={state === 'loading'} className={`relative min-w-0 rounded-2xl border bg-paper p-6 ${selected ? 'border-primary ring-2 ring-primary' : 'border-line'} ${onSelect ? 'hover:bg-canvas' : ''} ${className}`}>
    {onSelect && <button type="button" aria-pressed={selected} aria-label={label.trim() || copy.fallbackLabel} disabled={state !== 'ready'} onClick={onSelect} className="absolute inset-0 cursor-pointer rounded-2xl focus-visible:focus-ring disabled:cursor-not-allowed"/>}
    <p id={`${id}-label`} className="m-0 text-sm font-semibold text-muted wrap-anywhere">{label.trim() || copy.fallbackLabel}</p>
    {state === 'loading' ? <>
      <span aria-hidden="true" className="mt-3 block h-10 w-24 rounded-lg bg-line motion-safe:animate-pulse"/>
      <p role="status" className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.loading}</p>
    </> : unavailable ? <>
      <p aria-hidden="true" className="mb-0 mt-3 text-heading-lg font-semibold text-muted">{copy.placeholder}</p>
      <p role="status" className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.unavailable}</p>
    </> : formatted ? <p className="mb-0 mt-3 text-heading-lg font-semibold tabular-nums text-ink wrap-anywhere">{displayValue}</p> : <p className="mb-0 mt-3 text-heading-lg font-semibold tabular-nums text-ink wrap-anywhere">{format.format(value!).split(',').map((group, index, groups) => <Fragment key={index}>{group}{index < groups.length - 1 && <>{','}<wbr/></>}</Fragment>)}</p>}
    {description?.trim() && <p id={`${id}-description`} className="mb-0 mt-3 text-sm leading-6 text-muted wrap-anywhere">{description}</p>}
  </div>;
}
