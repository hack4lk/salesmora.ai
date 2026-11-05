import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AdminUserDirectoryResponse } from '@salesmora/contracts';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminUserManagement } from '../../components/admin-user-management/admin-user-management';
import { adminUserManagementData as copy } from '../../components/admin-user-management/admin-user-management.data';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { customerUserManagement, CustomerUserManagementError } from '../../server/customer-user-management';

export const dynamic = 'force-dynamic';

export default async function CustomerUsersPage() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let initialDirectory: AdminUserDirectoryResponse | undefined;
  try {
    initialDirectory = await customerUserManagement.readDirectory(
      { userId: session.user.id, sessionId: session.session.id, accessEmail: email },
      {},
      { userAgent: requestHeaders.get('user-agent')?.slice(0, 2048) ?? null },
    );
  } catch (error) {
    if (error instanceof CustomerUserManagementError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof CustomerUserManagementError && error.status === 403)) throw error;
  }
  if (!initialDirectory) return <AdminFrame environment={getAdminEnvironment()} activeHref="/users">
    <h1 id="admin-title">{copy.deniedTitle}</h1>
    <p role="alert">{copy.denied}</p>
  </AdminFrame>;
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/users" contentWidth="wide">
    <AdminUserManagement initialDirectory={initialDirectory} />
  </AdminFrame>;
}
