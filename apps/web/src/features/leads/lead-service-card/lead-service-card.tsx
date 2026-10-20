'use client';

import { useId } from 'react';
import { HomeOutlined } from '@salesmora/ui';
import { leadServiceCardData as copy } from './lead-service-card.data';

export type LeadServiceCardProps = { service: string; details?: string | null; address?: string | null };

/** Displays an authorized lead snapshot as plain text, preserving useful line breaks. */
export function LeadServiceCard({ service, details, address }: LeadServiceCardProps) {
  const id = useId();
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-6">
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-ink">{copy.title}</h2>
    <div className="flex min-w-0 items-start gap-4">
      <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><HomeOutlined/></span>
      <div className="grid min-w-0 flex-1 gap-4">
        <h3 className="m-0 text-base leading-6 font-semibold text-ink wrap-anywhere">{service.trim() || copy.missingService}</h3>
        <p className="m-0 text-base leading-6 whitespace-pre-line text-muted wrap-anywhere">{details?.trim() || copy.missingDetails}</p>
        <dl className="m-0 min-w-0 border-t border-line pt-4"><dt className="text-sm font-semibold text-ink">{copy.address}</dt>
          <dd className="m-0 mt-2 text-base leading-6 whitespace-pre-line text-muted wrap-anywhere">{address?.trim() || copy.missingAddress}</dd>
        </dl>
      </div>
    </div>
  </section>;
}
