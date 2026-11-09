'use client';

import type { ComponentPropsWithoutRef } from 'react';

export type SeafoamButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'style' | 'dangerouslySetInnerHTML'> & {
  label: string;
  /** Text size in pixels; padding and minimum touch target remain unchanged. */
  size?: 12 | 14 | 16;
};

export const seafoamButtonTextSizes = { 12: 'text-xs', 14: 'text-sm', 16: 'text-base' } as const;

/** Compact brand action. Defaults to a non-submitting button with a 44px touch target. */
export function SeafoamButton({ label, size = 12, type = 'button', className, ...props }: SeafoamButtonProps) {
  return <button {...props} type={type} className={[
    'min-h-11 max-w-full cursor-pointer rounded-lg border-0 bg-seafoam-light bg-linear-110 from-seafoam-pale to-seafoam-light p-4 font-semibold text-ink shadow-sm wrap-anywhere enabled:hover:bg-none enabled:hover:bg-seafoam-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50',
    seafoamButtonTextSizes[size],
    className,
  ].filter(Boolean).join(' ')}>{label}</button>;
}
