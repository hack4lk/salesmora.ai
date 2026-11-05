import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminOperationsPage } from '../../components/admin-operations/admin-operations-page';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { adminOperations, AdminOperationsError } from '../../server/admin-operations';

export const dynamic = 'force-dynamic';

export default async function AdminOperationsRoute() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let report;
  try {
    report = await adminOperations.read(
      { userId: session.user.id, sessionId: session.session.id, accessEmail: email },
      requestHeaders.get('user-agent')?.slice(0, 2048) ?? null,
    );
  } catch (error) {
    if (error instanceof AdminOperationsError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof AdminOperationsError && error.status === 403)) throw error;
    return <AdminFrame environment={getAdminEnvironment()} activeHref="/operations">
      <h1 id="admin-title">Operations access denied</h1>
      <p role="alert">Your current role cannot read queue and delivery operations.</p>
    </AdminFrame>;
  }
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/operations" contentWidth="wide">
    <AdminOperationsPage report={report} />
  </AdminFrame>;
}
