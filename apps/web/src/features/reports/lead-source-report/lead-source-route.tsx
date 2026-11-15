'use client';

import { useRouter } from 'next/navigation';
import type { LeadSourceReadResult } from '@salesmora/contracts';
import { LeadSourcePage } from './lead-source-page';

export function LeadSourceRoute({ initial }: { initial: LeadSourceReadResult }) {
  const router = useRouter();
  return <LeadSourcePage initial={initial} onReload={() => router.refresh()}
    onRecord={id => router.push(`/leads/${encodeURIComponent(id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
