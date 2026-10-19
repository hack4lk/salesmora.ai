'use client';
import { AccountPage, type AccountPageProps } from './account-page';
import { accountPageData as copy } from './account-page.data';

export function AccountRoute({ workspaceId, ...props }: Omit<AccountPageProps, 'onDelete'> & { workspaceId: string }) {
  return <AccountPage {...props} onDelete={async input => {
    const response = await fetch('/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, ...input }) });
    if (response.status === 202) {
      // A full navigation discards the signed-in UI and Next's in-memory route cache.
      window.location.replace('/login?accountDeletion=requested');
      return { ok: true };
    }
    const body = await response.json().catch(() => null);
    return { ok: false, message: typeof body?.error === 'string' ? body.error : copy.failed };
  }} />;
}
