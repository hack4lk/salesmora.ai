import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { StaffManagement } from '../../components/staff-management/staff-management';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { staffManagement, StaffManagementError } from '../../server/staff-management';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let snapshot;
  let denied: string | null = null;
  try {
    snapshot = await staffManagement.snapshot({ userId: session.user.id, sessionId: session.session.id, accessEmail: email });
  } catch (error) {
    if (error instanceof StaffManagementError && error.status === 401) redirect('/sign-in');
    if (error instanceof StaffManagementError && error.status === 403) {
      denied = error.message;
    } else throw error;
  }
  if (!snapshot) return <AdminFrame environment={getAdminEnvironment()} activeHref="/staff"><h1 id="admin-title">Staff access denied</h1><p role="alert">{denied}</p></AdminFrame>;
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/staff" contentWidth="wide"><StaffManagement initialSnapshot={snapshot} /></AdminFrame>;
}
