import Image from 'next/image';

export type VisitReminderCompany = { name: string; phone: string; email: string };
export type VisitReminderSample = { customerName: string | null; email: string | null; date: string; arrivalWindow: string | null };
export type VisitReminderEmailProps = { company: VisitReminderCompany; visit: VisitReminderSample; timezone: string };

/** Canonical customer-safe preview. No internal record details or staff-only links. */
export function CustomerVisitReminderEmail({ company, visit, timezone }: VisitReminderEmailProps) {
  const missing = !visit.customerName || !visit.email ? 'Customer contact is missing.' : !visit.arrivalWindow ? 'Arrival window is missing.' : '';
  return <div className="min-w-0 rounded-xl bg-canvas p-3 text-ink sm:p-5">
    {missing ? <p role="status" className="m-0 text-sm">{missing} No email will be sent for this visit. You’ll be notified to update it.</p> : <>
      <dl className="mb-4 mt-0 grid gap-2 text-sm">
        <div><dt className="font-semibold">To</dt><dd className="m-0 break-words">{visit.email}</dd></div>
        <div><dt className="font-semibold">Subject</dt><dd className="m-0 break-words">Your visit with {company.name || '[Company]'} is tomorrow</dd></div>
      </dl>
      <article aria-label="Customer reminder email" className="mx-auto max-w-xl rounded-xl border border-line bg-white p-5 text-sm leading-6 sm:p-6">
        <Image unoptimized src="/branding/salesmora-email-logo.png" alt="SalesMora" width={224} height={60} className="mb-6 h-auto max-w-full"/>
        <h4 className="mb-4 mt-0 text-xl font-semibold">Your visit is tomorrow</h4>
        <p className="my-3">Hi {visit.customerName},</p>
        <p className="my-3">This is a reminder of your visit on <strong>{visit.date}</strong>, with an arrival window of <strong>{visit.arrivalWindow}</strong> ({timezone}).</p>
        <p className="mb-0">If you need to make a change, call {company.phone || '[Company phone]'} or email <span className="break-all">{company.email || '[Company email]'}</span>.</p>
        <p className="mb-0 border-t border-line pt-4 text-muted">{company.name || '[Company]'}</p>
        <p className="mb-0 mt-3 text-xs text-primary underline">Stop visit reminder emails</p>
      </article>
    </>}
  </div>;
}
