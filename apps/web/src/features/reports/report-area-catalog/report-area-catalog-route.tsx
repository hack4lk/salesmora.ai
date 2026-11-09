'use client';

import { useRouter } from 'next/navigation';
import { reportTemplateAreaSchema } from '@salesmora/contracts';
import { ReportAreaCatalogPage } from './report-area-catalog-page';
import type { ReportAreaCatalogItem } from './report-area-catalog';

export function ReportAreaCatalogRoute({ workspaceId, areas }: {
  workspaceId: string; areas: ReportAreaCatalogItem[];
}) {
  const router = useRouter();
  return <ReportAreaCatalogPage areas={areas} canRead
    onOpen={area => {
      const parsed = reportTemplateAreaSchema.parse(area);
      router.push(`/reports/${parsed}?workspace=${encodeURIComponent(workspaceId)}`);
    }} onRetry={() => router.refresh()} />;
}
