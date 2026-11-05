import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminFrame } from '../components/admin-frame/admin-frame';
import { AdminDashboard } from '../components/admin-dashboard/admin-dashboard';
import { getAdminEnvironment } from '../server/environment';
import { getAdminSession } from '../server/get-admin-session';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const session = await getAdminSession(await headers());
  if (!session) redirect('/sign-in');
  return <AdminFrame environment={getAdminEnvironment()} contentWidth="wide">
    <AdminDashboard />
  </AdminFrame>;
}
