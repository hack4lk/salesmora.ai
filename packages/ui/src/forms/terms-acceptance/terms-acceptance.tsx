'use client';

import { useId, type MouseEventHandler } from 'react';
import Checkbox from '@mui/material/Checkbox';
import { termsAcceptanceData as copy } from './terms-acceptance.data';

export interface TermsAcceptanceProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  termsHref: string;
  privacyHref: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onTermsClick?: MouseEventHandler<HTMLAnchorElement>;
  onPrivacyClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** The form owns acceptance state, validation, and the legal document URLs. */
export function TermsAcceptance({
  checked, onChange, termsHref, privacyHref, id, name = 'terms', disabled = false,
  error = false, helperText, onTermsClick, onPrivacyClick,
}: TermsAcceptanceProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const description = helperText ?? (error ? copy.error : undefined);

  return (
    <div>
      <div className="flex items-start gap-2">
        <Checkbox
          id={inputId}
          name={name}
          checked={checked}
          onChange={(_, value) => onChange(value)}
          disabled={disabled}
          required
          color="primary"
          className={[
            'size-11 shrink-0 rounded-xl text-muted [&.Mui-checked]:text-primary [&.Mui-disabled]:text-disabled has-focus-visible:focus-ring',
            error && !disabled ? '[&:not(.Mui-checked)]:text-error' : '',
          ].filter(Boolean).join(' ')}
          slotProps={{ input: { 'aria-invalid': error || undefined, 'aria-describedby': description ? helperId : undefined } }}
        />
        <label htmlFor={inputId} className={`min-w-0 flex-1 py-2.5 text-sm leading-6 wrap-anywhere ${disabled ? 'text-muted' : 'text-ink'}`}>
          {copy.agreement}{' '}
          <a href={termsHref} onClick={onTermsClick} className="text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.terms}</a>{' '}
          {copy.conjunction}{' '}
          <a href={privacyHref} onClick={onPrivacyClick} className="text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:focus-ring">{copy.privacy}</a>
          {copy.punctuation}
        </label>
      </div>
      {description && <p id={helperId} className={`mt-2 text-sm ${error ? 'text-error' : 'text-muted'}`}>{description}</p>}
    </div>
  );
}
