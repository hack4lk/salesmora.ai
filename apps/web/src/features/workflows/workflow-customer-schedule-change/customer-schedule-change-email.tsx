import Image from 'next/image';

export type ScheduleChangeCompany = { name: string; phone: string; email: string };
export type CustomerScheduleState = { date: string; arrivalWindow: string | null };
export type ScheduleChangeExample = {
  customer: { name: string; email: string };
  before: CustomerScheduleState; after: CustomerScheduleState | null;
};
export type ScheduleChangeEmailProps = { company: ScheduleChangeCompany; example: ScheduleChangeExample; timezone: string };

/** Customer-safe presentation only; the future host owns eligibility and current-source checks. */
export function CustomerScheduleChangeEmail({ company, example, timezone }: ScheduleChangeEmailProps) {
  const { customer, before, after } = example;
  if (!customer.name.trim() || !customer.email.trim()) return <p role="status" className="m-0 rounded-xl bg-canvas p-4 text-sm text-ink">Customer contact is missing. No email will be sent. You’ll be notified to update it.</p>;
  if (after && before.date === after.date && before.arrivalWindow === after.arrivalWindow) return <p role="status" className="m-0 rounded-xl bg-canvas p-4 text-sm text-ink">The visit returned to its original schedule before delivery. No email will be sent.</p>;
  const subject = `Your visit with ${company.name || '[Company]'} ${after ? 'has changed' : 'is no longer scheduled'}`;
  return <div className="min-w-0 rounded-xl bg-canvas p-3 text-ink sm:p-5">
    <dl className="mb-4 mt-0 grid gap-2 text-sm">
      <div><dt className="font-semibold">To</dt><dd className="m-0 break-words">{customer.email}</dd></div>
      <div><dt className="font-semibold">Subject</dt><dd className="m-0 break-words">{subject}</dd></div>
    </dl>
    <article aria-label="Customer schedule-change email" className="mx-auto max-w-xl rounded-xl border border-line bg-white p-5 text-sm leading-6 sm:p-6">
      <Image unoptimized src="/branding/salesmora-email-logo.png" alt="SalesMora" width={224} height={60} className="mb-6 h-auto max-w-full"/>
      <h4 className="mb-4 mt-0 text-xl font-semibold">{after ? 'Your visit has been updated' : 'Your visit is no longer scheduled'}</h4>
      <p className="my-3">Hi {customer.name},</p>
      {after ? <>
        <p className="my-3">Your visit has been updated.</p>
        <dl className="my-4 grid gap-3 rounded-lg bg-canvas p-4">
          <Schedule label="Previously" value={before}/><Schedule label="Now" value={after}/>
        </dl>
      </> : <p className="my-3">Your visit previously scheduled for <strong>{before.date}</strong> ({before.arrivalWindow || 'Arrival window to be confirmed'}) is no longer scheduled.</p>}
      <p className="my-3 text-xs text-muted">Times shown in {timezone}.</p>
      <p className="mb-0">{after ? 'If you need to discuss this change' : 'For help confirming a new date'}, call {company.phone || '[Company phone]'} or email <span className="break-all">{company.email || '[Company email]'}</span>.</p>
      <p className="mb-0 border-t border-line pt-4 text-muted">{company.name || '[Company]'}</p>
      <p className="mb-0 mt-3 text-xs text-primary underline">Stop schedule-change emails</p>
    </article>
  </div>;
}
function Schedule({ label, value }: { label: string; value: CustomerScheduleState }) {
  return <div><dt className="font-semibold">{label}</dt><dd className="m-0 break-words">{value.date}<br/>{value.arrivalWindow || 'Arrival window to be confirmed'}</dd></div>;
}
