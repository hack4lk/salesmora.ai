'use client';

import { useId, type ReactNode } from 'react';
import { accountLayoutData as copy } from './account-layout.data';

export interface AccountLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared login/registration frame. Forms and authentication stay with the app. */
export function AccountLayout({ title, description, children, footer }: AccountLayoutProps) {
  const headingId = useId();
  const contentId = useId();

  return (
    <div className="min-h-svh bg-paper">
      <a href={`#${contentId}`} className="sr-only rounded-xl bg-paper p-3 font-semibold text-primary underline focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-10">
        {copy.skipLink}
      </a>
      <div className="flex min-h-svh flex-col md:grid md:grid-cols-2">
        <header className="relative flex flex-col items-start overflow-hidden bg-canvas px-6 pt-6 sm:px-10 sm:pt-8 md:border-r md:border-line md:px-12 md:py-10 lg:px-16 lg:py-12">
          {/* Native image keeps the shared UI independent of Next.js image handling. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={copy.logoSrc} alt={copy.brandName} width={540} height={144} className="relative z-10 h-auto w-brand-logo shrink-0" />
          <div className="relative z-10 my-auto hidden max-w-brand py-16 md:block">
            <p className="mb-5 text-xs font-bold tracking-widest text-primary-dark uppercase">{copy.eyebrow}</p>
            <h2 className="mb-6 text-display font-semibold lg:text-display-lg">{copy.headline}</h2>
            <p className="max-w-reading text-lg leading-relaxed text-muted">{copy.summary}</p>
          </div>
          <p className="relative z-10 hidden text-sm text-muted md:block">{copy.brandFooter}</p>
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 hidden size-96 -translate-x-1/2 translate-y-1/2 rounded-full border border-decoration md:block" />
        </header>
        <main id={contentId} tabIndex={-1} aria-labelledby={headingId} className="flex min-w-0 flex-1 items-start justify-center px-6 pt-8 pb-12 focus:outline-none sm:p-10 md:items-center md:px-12 md:py-16">
          <div className="w-full max-w-form wrap-anywhere">
            <h1 id={headingId} className="mb-3 text-heading font-semibold sm:text-heading-lg">{title}</h1>
            <p className="mb-8 leading-relaxed text-muted">{description}</p>
            {children}
            {footer && <footer className="mt-6 text-center text-sm text-muted">{footer}</footer>}
          </div>
        </main>
      </div>
    </div>
  );
}
