import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminFeatureFlagsPage } from '../../components/admin-feature-flags/admin-feature-flags-page';
import type { AdminFeatureFlagResponse } from '@salesmora/contracts';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { adminFeatureFlags, AdminFeatureFlagsError } from '../../server/admin-feature-flags';

export const dynamic = 'force-dynamic';

export default async function FeatureFlagsRoute() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let flags: AdminFeatureFlagResponse | null = null;
  let accessDenied = false;
  try {
    flags = await adminFeatureFlags.read(
      { userId: session.user.id, sessionId: session.session.id, accessEmail: email },
      { userAgent: requestHeaders.get('user-agent')?.slice(0, 2048) ?? null },
    );
  } catch (error) {
    if (error instanceof AdminFeatureFlagsError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof AdminFeatureFlagsError && error.status === 403)) throw error;
    accessDenied = true;
  }
  if (accessDenied) {
    return <AdminFrame environment={getAdminEnvironment()} activeHref="/flags">
      <h1 id="admin-title">Feature flag access denied</h1>
      <p role="alert">Your current role cannot read or change feature flags.</p>
    </AdminFrame>;
  }
  if (!flags) throw new Error('Feature flags were not loaded.');
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/flags" contentWidth="wide">
    <AdminFeatureFlagsPage flags={flags} />
  </AdminFrame>;
}
