'use client';
import type { WorkspaceInput } from '@salesmora/contracts';
import { OnboardingFlow } from './onboarding-flow';
async function saveWorkspace(input: WorkspaceInput) {
  const response = await fetch('/api/workspaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(input) });
  return { ok: response.ok, status: response.status };
}
export function OnboardingRoute({ ownerEmail, nextHref = '/home', teammateLimit }: { ownerEmail: string; nextHref?: string; teammateLimit?: number }) {
  return <OnboardingFlow teammateLimit={teammateLimit} ownerEmail={ownerEmail} onCreate={saveWorkspace} onCreated={() => window.location.assign(nextHref)} />;
}
