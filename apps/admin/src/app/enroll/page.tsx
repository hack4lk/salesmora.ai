import { headers } from 'next/headers';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { StaffEnrollment } from '../../components/staff-enrollment/staff-enrollment';
import { getAdminEnvironment } from '../../server/environment';

export const dynamic = 'force-dynamic';

export default async function StaffEnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [requestHeaders, query] = await Promise.all([headers(), searchParams]);
  return (
    <AdminFrame environment={getAdminEnvironment()} showNavigation={false}>
      <StaffEnrollment
        accessEmail={requestHeaders.get('x-admin-access-email') ?? ''}
        token={query.token}
      />
    </AdminFrame>
  );
}
