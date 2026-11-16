'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { workspaceAIUsageSchema } from '@salesmora/contracts';
import { AIUsagePage, type AIUsageSnapshot } from './ai-usage-page';
import { SettingsQueryBoundary, useSettingsRequest } from '../use-settings-request';
import { isApiAccessError } from '../../api/api-query';
import { aiUsagePageData as copy } from './ai-usage-page.data';

export function AIUsageRoute({ workspaceId, initialUsage }: { workspaceId: string; initialUsage: AIUsageSnapshot }) {
  return <SettingsQueryBoundary workspaceId={workspaceId}><AIUsageHost workspaceId={workspaceId} initialUsage={initialUsage}/></SettingsQueryBoundary>;
}
function AIUsageHost({ workspaceId, initialUsage }: { workspaceId: string; initialUsage: AIUsageSnapshot }) {
  const api = useSettingsRequest('ai-usage', `/api/ai-usage?workspace=${encodeURIComponent(workspaceId)}`, raw => {
    if (!raw || typeof raw !== 'object' || !('usage' in raw)) throw new Error(copy.error);
    return workspaceAIUsageSchema.parse(raw.usage);
  }, copy.error);
  const router = useRouter();
  const [usage, setUsage] = useState(initialUsage);
  const [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const pending = useRef(false);
  async function refresh() {
    if (pending.current) return;
    pending.current = true; setState('loading');
    try {
      const result = await api.read();
      setUsage(result); setState('ready');
    } catch (error) {
      if (api.isActive()) {setState('error');if (isApiAccessError(error)) router.refresh();}
    } finally {pending.current = false;}
  }
  return <AIUsagePage viewerRole="owner" state={state} usage={state === 'ready' ? usage : undefined} onRefresh={refresh}/>;
}
