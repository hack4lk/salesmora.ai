import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminPlatformSettingsPage } from '../../components/admin-platform-settings/admin-platform-settings-page';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { adminPlatformSettings, AdminPlatformSettingsError } from '../../server/admin-platform-settings';

export const dynamic = 'force-dynamic';

export default async function AdminPlatformSettingsRoute() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let settings;
  try {
    settings = await adminPlatformSettings.read(
      { userId: session.user.id, sessionId: session.session.id, accessEmail: email },
      { userAgent: requestHeaders.get('user-agent')?.slice(0, 2048) ?? null },
    );
  } catch (error) {
    if (error instanceof AdminPlatformSettingsError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof AdminPlatformSettingsError && error.status === 403)) throw error;
    return <AdminFrame environment={getAdminEnvironment()} activeHref="/settings">
      <h1 id="admin-title">Platform settings access denied</h1>
      <p role="alert">Your current role cannot read platform settings.</p>
    </AdminFrame>;
  }
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/settings" contentWidth="wide">
    <AdminPlatformSettingsPage settings={settings} />
  </AdminFrame>;
}
