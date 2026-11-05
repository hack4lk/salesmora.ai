import Link from 'next/link';
import { AccountLayout } from '@salesmora/ui';
import { getSession } from '../../../server/auth/session';
import { database } from '../../../server/workspaces/store';
import { WorkspaceSuspendedRoute } from '../../../features/auth/workspace-suspended-notice/workspace-suspended-route';
import { workspaceSuspendedNoticeData as copy } from '../../../features/auth/workspace-suspended-notice/workspace-suspended-notice.data';
export const metadata = { title: copy.page.documentTitle, referrer: 'no-referrer' as const, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function WorkspaceSuspendedPage() {
  const session = await getSession();
  // Only active workspaces are offered; this page must never call findWorkspace, which redirects here.
  const workspaces = session ? await database()('workspaces')
    .join('workspaceMemberships', 'workspaces.id', 'workspaceMemberships.workspaceId')
    .where('workspaceMemberships.userId', session.user.id)
    .whereNull('workspaces.deletionRequestedAt').whereNull('workspaces.suspendedAt')
    .orderBy('workspaces.createdAt').orderBy('workspaces.id')
    .select('workspaces.id', 'workspaces.businessName as name') as { id: string; name: string }[] : [];
  return <AccountLayout title={copy.page.title} description={copy.page.description}>
    {session ? <WorkspaceSuspendedRoute workspaces={workspaces} /> : <div className="grid min-w-0 gap-4">
      <p className="m-0 text-sm leading-6 text-muted">{copy.page.signedOut}</p>
      <Link href="/login" className="rounded text-sm font-semibold text-primary underline focus-visible:focus-ring">{copy.page.signIn}</Link>
    </div>}
  </AccountLayout>;
}
