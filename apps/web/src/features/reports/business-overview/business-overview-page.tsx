'use client';

import { BusinessOverview } from './business-overview';
import type { BusinessOverviewProps } from './business-overview';

export type BusinessOverviewPageProps = BusinessOverviewProps;

/** Adds report-page layout around the canonical overview without duplicating its UI. */
export function BusinessOverviewPage(props: BusinessOverviewPageProps) {
  return (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8">
      <div className="mx-auto max-w-6xl">
        <BusinessOverview {...props} />
      </div>
    </main>
  );
}
