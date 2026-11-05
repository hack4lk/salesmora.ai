import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminDeletionRequestsQuerySchema, type AdminDataRequestsResponse } from '@salesmora/contracts';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminDataRequestsRoute } from '../../components/admin-data-requests/admin-data-requests-route';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { adminDataRequests, AdminDataRequestsError } from '../../server/admin-data-requests';
import { adminWorkspaceExports } from '../../server/admin-workspace-exports';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function parseQuery(searchParams: SearchParams) {
  if (Object.keys(searchParams).some(key => key !== 'filter' && key !== 'page')) return null;
  if (Array.isArray(searchParams.filter) || Array.isArray(searchParams.page)) return null;
  const page = searchParams.page;
  if (page !== undefined && !/^(0|[1-9]\d*)$/.test(page)) return null;
  const parsed = adminDeletionRequestsQuerySchema.safeParse({
    ...(searchParams.filter === undefined ? {} : { filter: searchParams.filter }),
    ...(page === undefined ? {} : { page: Number(page) }),
  });
  return parsed.success ? parsed.data : null;
}

export default async function AdminDataRequestsPageRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  const query = parseQuery(await searchParams);
  if (!query) redirect('/data-requests');

  let data: AdminDataRequestsResponse | undefined;
  let exports: Awaited<ReturnType<typeof adminWorkspaceExports.read>> | undefined;
  let denied = false;
  try {
    const identity = { userId: session.user.id, sessionId: session.session.id, accessEmail: email };
    const context = { userAgent: requestHeaders.get('user-agent')?.slice(0, 2048) ?? null };
    data = await adminDataRequests.readDeletionQueue(
      identity,
      query,
      context,
    );
    exports = await adminWorkspaceExports.read(identity, context);
  } catch (error) {
    if (error instanceof AdminDataRequestsError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof AdminDataRequestsError && error.status === 403)) throw error;
    denied = true;
  }

  if (denied) return <AdminFrame environment={getAdminEnvironment()} activeHref="/data-requests">
    <h1 id="admin-title">Data requests</h1>
    <p role="alert">Your current role cannot read data requests.</p>
  </AdminFrame>;
  if (!data) throw new Error('The Data Requests service returned no response.');
  if (!exports) throw new Error('The workspace export service returned no response.');
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/data-requests" contentWidth="wide">
    <AdminDataRequestsRoute data={data} exports={exports} />
  </AdminFrame>;
}
