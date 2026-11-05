import { headers } from 'next/headers';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminSignIn } from '../../components/admin-sign-in/admin-sign-in';
import { getAdminEnvironment } from '../../server/environment';

export const dynamic = 'force-dynamic';

export default async function AdminSignInPage() {
  const accessEmail = (await headers()).get('x-admin-access-email') ?? '';
  return (
    <AdminFrame environment={getAdminEnvironment()} showNavigation={false}>
      <AdminSignIn accessEmail={accessEmail} />
    </AdminFrame>
  );
}
