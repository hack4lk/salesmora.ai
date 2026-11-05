import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AdminWorkspaceDirectoryResponse } from '@salesmora/contracts';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminWorkspaceDirectoryPage } from '../../components/admin-workspace-management/admin-workspace-directory-page';
import { adminWorkspaceManagementData as copy } from '../../components/admin-workspace-management/admin-workspace-management.data';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { WorkspaceManagementError, workspaceManagement } from '../../server/workspace-management';

export const dynamic = 'force-dynamic';

export default async function AdminWorkspacesPage() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let initialDirectory: AdminWorkspaceDirectoryResponse | undefined;
  try {
    initialDirectory = await workspaceManagement.readDirectory(
      { userId: session.user.id, sessionId: session.session.id, accessEmail: email },
      {},
      { userAgent: requestHeaders.get('user-agent')?.slice(0, 2048) ?? null },
    );
  } catch (error) {
    if (error instanceof WorkspaceManagementError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof WorkspaceManagementError && error.status === 403)) throw error;
  }
  if (!initialDirectory) return <AdminFrame environment={getAdminEnvironment()} activeHref="/workspaces">
    <h1 id="admin-title">{copy.deniedTitle}</h1>
    <p role="alert">{copy.deniedDescription}</p>
  </AdminFrame>;
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/workspaces" contentWidth="wide">
    <AdminWorkspaceDirectoryPage initialDirectory={initialDirectory} />
  </AdminFrame>;
}
