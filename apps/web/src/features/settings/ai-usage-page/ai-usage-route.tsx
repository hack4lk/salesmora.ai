'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { workspaceAIUsageSchema } from '@salesmora/contracts';
import { AIUsagePage, type AIUsageSnapshot } from './ai-usage-page';

export function AIUsageRoute({ workspaceId, workspaceName, initialUsage }: { workspaceId: string; workspaceName: string; initialUsage: AIUsageSnapshot }) {
  const router = useRouter();
  const [usage, setUsage] = useState(initialUsage);
  const [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  async function refresh() {
    if (pending.current) return;
    const controller = new AbortController(); pending.current = controller; setState('loading');
    try {
      const response = await fetch(`/api/ai-usage?workspace=${encodeURIComponent(workspaceId)}`, { cache: 'no-store', credentials: 'same-origin', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]) });
      if (response.status === 401 || response.status === 403) { setState('error'); router.refresh(); return; }
      if (!response.ok) throw Error();
      const result = workspaceAIUsageSchema.parse((await response.json()).usage);
      if (!controller.signal.aborted) { setUsage(result); setState('ready'); }
    } catch { if (!controller.signal.aborted) setState('error'); }
    finally { if (pending.current === controller) pending.current = null; }
  }
  return <AIUsagePage workspaceName={workspaceName} viewerRole="owner" settingsHref={`/settings?workspace=${encodeURIComponent(workspaceId)}`} state={state} usage={state === 'ready' ? usage : undefined} onRefresh={refresh}/>;
}
