import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AdminRolloutFlag } from '@salesmora/contracts';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminRolloutFlagsPage } from '../../components/admin-rollout-flags/admin-rollout-flags-page';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { adminFeatureFlags, AdminFeatureFlagsError } from '../../server/admin-feature-flags';

export const dynamic = 'force-dynamic';

export default async function RolloutFlagsRoute() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let flags: AdminRolloutFlag[];
  try {
    const result = await adminFeatureFlags.readRollouts(
      { userId: session.user.id, sessionId: session.session.id, accessEmail: email },
      { userAgent: requestHeaders.get('user-agent')?.slice(0, 2048) ?? null },
    );
    flags = result.flags;
  } catch (error) {
    if (error instanceof AdminFeatureFlagsError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof AdminFeatureFlagsError && error.status === 403)) throw error;
    return <AdminFrame environment={getAdminEnvironment()} activeHref="/rollout-flags">
      <h1 id="admin-title">Rollout flag access denied</h1>
      <p role="alert">Your current role cannot read or change rollout flags.</p>
    </AdminFrame>;
  }
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/rollout-flags" contentWidth="wide">
    <AdminRolloutFlagsPage initialFlags={flags} />
  </AdminFrame>;
}
