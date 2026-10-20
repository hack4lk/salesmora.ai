'use client';

import { useId } from 'react';
import { leadSchema } from '@salesmora/contracts';
import { StatusBadge } from '@salesmora/ui';
import { leadContactCardData as copy } from './lead-contact-card.data';

export type LeadContact = {
  name: string; email: string | null; phone: string | null;
  owner: { id: string; name: string; former?: boolean } | null;
};
export type LeadContactCardProps = { contact: LeadContact; viewerId?: string; pending?: boolean };

/** Read-only scoped contact snapshot. Unsupported contact formats remain copyable plain text. */
export function LeadContactCard({ contact, viewerId, pending = false }: LeadContactCardProps) {
  const id = useId();
  const email = contact.email?.trim() ?? '';
  const phone = contact.phone?.trim() ?? '';
  const parsedEmail = leadSchema.shape.email.safeParse(email);
  const mailHref = parsedEmail.success && parsedEmail.data ? `mailto:${encodeURIComponent(parsedEmail.data)}` : undefined;
  const digits = phone.replace(/\D/g, '');
  const phoneHref = /^\+?[\d ().-]+$/.test(phone) && digits.length >= 3 && digits.length <= 15 ? `tel:${phone.startsWith('+') ? '+' : ''}${digits}` : undefined;
  const link = 'inline-flex min-h-11 max-w-full items-center rounded-lg font-semibold text-primary hover:underline focus-visible:focus-ring';
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-6">
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-ink">{copy.title}</h2>
    <dl className="m-0 grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2">
      <div className="min-w-0"><dt className="text-sm text-muted">{copy.name}</dt><dd className="m-0 mt-2 text-base leading-6 text-ink wrap-anywhere">{contact.name.trim() || copy.missing}</dd></div>
      <div className="min-w-0"><dt className="text-sm text-muted">{copy.owner}</dt><dd className="m-0 mt-2 flex min-w-0 flex-wrap items-center gap-2 text-base leading-6 text-ink wrap-anywhere">
        {!contact.owner ? <StatusBadge label={copy.unassigned}/> : contact.owner.former ? <StatusBadge label={copy.former}/> : <><span className="min-w-0 wrap-anywhere">{contact.owner.name.trim() || copy.missing}</span>{viewerId && contact.owner.id === viewerId && <StatusBadge label={copy.assignedMe} tone="info"/>}</>}
      </dd></div>
      <div className="min-w-0"><dt className="text-sm text-muted">{copy.email}</dt><dd className="m-0 mt-1 text-base leading-6 text-ink wrap-anywhere">{email && mailHref && !pending ? <a href={mailHref} className={link}>{email}</a> : <span className="inline-flex min-h-11 max-w-full items-center">{email || copy.missing}</span>}</dd></div>
      <div className="min-w-0"><dt className="text-sm text-muted">{copy.phone}</dt><dd className="m-0 mt-1 text-base leading-6 text-ink wrap-anywhere">{phone && phoneHref && !pending ? <a href={phoneHref} className={link}>{phone}</a> : <span className="inline-flex min-h-11 max-w-full items-center">{phone || copy.missing}</span>}</dd></div>
    </dl>
  </section>;
}
