'use client';

import { seafoamButtonTextSizes, type SeafoamButtonProps } from '../seafoam-button/seafoam-button';

export type SeafoamOutlineButtonProps = SeafoamButtonProps;

export function SeafoamOutlineButton({ label, size = 12, type = 'button', className, ...props }: SeafoamOutlineButtonProps) {
  return <button {...props} type={type} className={[
    'min-h-11 max-w-full cursor-pointer rounded-lg border-2 border-transparent p-4 font-semibold text-ink shadow-sm wrap-anywhere [--button-surface:var(--color-paper)] [background:linear-gradient(var(--button-surface),var(--button-surface))_padding-box,linear-gradient(110deg,var(--color-seafoam-pale),var(--color-seafoam-light))_border-box] enabled:hover:[--button-surface:var(--color-gray-100)] focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50',
    seafoamButtonTextSizes[size],
    className,
  ].filter(Boolean).join(' ')}>{label}</button>;
}
