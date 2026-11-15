'use client';
import { useRouter } from 'next/navigation';
import type { LeadReportReadResult } from '@salesmora/contracts';
import { LeadReportPage } from './lead-report-page';

export function LeadReportRoute({ initial }: { initial: LeadReportReadResult }) {
  const router = useRouter();
  return <LeadReportPage initial={initial} onReload={() => router.refresh()}
    onRecord={id => router.push(`/leads/${encodeURIComponent(id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
