'use client';
import { useId } from 'react';
import { jobInput, jobLabel } from '../job-ui';
import { normalizeJobZip } from './postal-code';
export function JobPostalCodeField({ value, onChange, disabled = false }: {
  value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  const id = useId(), invalid = !!value && normalizeJobZip(value) === null;
  return <label className={jobLabel}>Job ZIP code<input required autoComplete="postal-code" className={jobInput}
    value={value} disabled={disabled} maxLength={10} aria-invalid={invalid || undefined} aria-describedby={`${id}-help`}
    onChange={event => onChange(event.target.value)}/><span id={`${id}-help`} className="text-xs font-normal leading-5 text-muted">
      {invalid ? 'Enter a 5-digit US ZIP code or ZIP+4.' : 'Service location · United States'}</span></label>;
}
