'use client';
import { WorkspaceSuspendedNotice, type WorkspaceSuspendedNoticeProps } from './workspace-suspended-notice';
export function WorkspaceSuspendedRoute({ workspaces }: Pick<WorkspaceSuspendedNoticeProps, 'workspaces'>) {
  async function signOut() {
    const response = await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!response.ok) return false;
    window.location.assign('/login');
    return true;
  }
  return <WorkspaceSuspendedNotice workspaces={workspaces} onSignOut={signOut} />;
}
