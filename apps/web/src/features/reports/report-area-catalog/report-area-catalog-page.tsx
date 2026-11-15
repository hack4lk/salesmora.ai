'use client';

import { ReportAreaCatalog } from './report-area-catalog';
import type { ReportAreaCatalogProps } from './report-area-catalog';

export type ReportAreaCatalogPageProps = ReportAreaCatalogProps;

/** Adds report landing-page layout around the canonical catalog component. */
export function ReportAreaCatalogPage(props: ReportAreaCatalogPageProps) {
  return (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8">
      <div className="mx-auto max-w-6xl">
        <ReportAreaCatalog {...props} />
      </div>
    </main>
  );
}
