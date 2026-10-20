'use client';
import { FormFeedback } from '@salesmora/ui';
import { leadsReadRouteData as copy } from '../../../features/leads/leads-page/leads-read-route.data';
import { leadsPageData } from '../../../features/leads/leads-page/leads-page.data';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="min-h-screen bg-canvas p-6 sm:p-10"><div className="mx-auto grid max-w-form gap-6 rounded-2xl border border-line bg-paper p-6"><h1 className="m-0 text-heading font-semibold text-ink">{leadsPageData.title}</h1><FormFeedback kind="error" message={copy.failure}/><button type="button" onClick={reset} className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-white focus-visible:focus-ring">{leadsPageData.retry}</button></div></main>;
}
