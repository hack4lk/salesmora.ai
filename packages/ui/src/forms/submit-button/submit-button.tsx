'use client';

import MuiButton, { type ButtonProps } from '@mui/material/Button';
import { submitButtonData as copy } from './submit-button.data';

export type SubmitButtonProps = Omit<
  ButtonProps,
  'children' | 'type' | 'component' | 'href' | 'variant' | 'color' | 'size' | 'sx' | 'style' |
  'loading' | 'loadingIndicator' | 'loadingPosition' | 'startIcon' | 'endIcon'
> & {
  label: string;
  pending?: boolean;
  pendingLabel?: string;
};

/** The owning form controls pending state and performs the submission. */
export function SubmitButton({
  label,
  pending = false,
  pendingLabel = copy.pendingLabel,
  disabled = false,
  fullWidth = true,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <MuiButton
      {...props}
      type="submit"
      variant="contained"
      color="primary"
      disableElevation
      fullWidth={fullWidth}
      disabled={disabled || pending}
      loading={pending}
      loadingPosition="start"
      loadingIndicator={<span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />}
      aria-busy={pending}
      className={[
        'min-h-11 rounded-xl px-6 py-3 text-base leading-normal font-semibold normal-case whitespace-normal wrap-anywhere focus-visible:focus-ring',
        'bg-primary text-paper hover:bg-primary-dark disabled:bg-line disabled:text-muted',
        className,
      ].filter(Boolean).join(' ')}
    >
      {pending ? pendingLabel : label}
    </MuiButton>
  );
}
