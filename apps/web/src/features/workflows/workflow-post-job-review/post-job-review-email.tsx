import Image from 'next/image';

export type PostJobCompany = { name: string; phone: string; email: string };
export type PostJobCustomer = { name: string; email: string };
export type PostJobReviewEmailProps = {
  company: PostJobCompany; customer: PostJobCustomer; message: string; reviewUrl: string; includeReview: boolean;
};

/** Customer-safe preview shared with the workflow review. Custom wording is plain text. */
export function PostJobReviewEmail({ company, customer, message, reviewUrl, includeReview }: PostJobReviewEmailProps) {
  if (!customer.name.trim() || !customer.email.trim()) return <p role="status" className="m-0 rounded-xl bg-canvas p-4 text-sm text-ink">Customer contact is missing. No email will be sent for this job. You’ll be notified to update it.</p>;
  return <div className="min-w-0 rounded-xl bg-canvas p-3 text-ink sm:p-5">
    <dl className="mb-4 mt-0 grid gap-2 text-sm">
      <div><dt className="font-semibold">To</dt><dd className="m-0 break-words">{customer.email}</dd></div>
      <div><dt className="font-semibold">Subject</dt><dd className="m-0 break-words">Thank you for choosing {company.name || '[Company]'}</dd></div>
    </dl>
    <article aria-label="Customer thank-you email" className="mx-auto max-w-xl rounded-xl border border-line bg-white p-5 text-sm leading-6 sm:p-6">
      <Image unoptimized src="/branding/salesmora-email-logo.png" alt="SalesMora" width={224} height={60} className="mb-6 h-auto max-w-full"/>
      <h4 className="mb-4 mt-0 text-xl font-semibold">Thank you for choosing us</h4>
      <p className="my-3">Hi {customer.name},</p>
      <p className="my-3 whitespace-pre-wrap break-words">{message || '[Your thank-you message]'}</p>
      {includeReview && reviewUrl && <div className="my-5">
        <p className="my-3">We’d love to hear about your experience.</p>
        <a className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-primary px-4 py-2 font-semibold text-white underline focus-visible:focus-ring" href={reviewUrl} target="_blank" rel="noreferrer">Leave a review</a>
      </div>}
      <p className="mb-0">If you need anything else, call {company.phone || '[Company phone]'} or email <span className="break-all">{company.email || '[Company email]'}</span>.</p>
      <p className="mb-0 border-t border-line pt-4 text-muted">{company.name || '[Company]'}</p>
      <p className="mb-0 mt-3 text-xs text-primary underline">Stop thank-you and review emails</p>
    </article>
  </div>;
}
