import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAIUsagePeriodSchema, type AdminAIUsageResponse } from '@salesmora/contracts';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminAIUsagePage } from '../../components/admin-ai-usage/admin-ai-usage-page';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { adminAIUsage, AdminAIUsageError } from '../../server/admin-ai-usage';

export const dynamic = 'force-dynamic';

export default async function AdminAIUsageRoute({
  searchParams,
}: {
  searchParams: Promise<{ period?: string | string[] }>;
}) {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  const query = await searchParams;
  const period = Array.isArray(query.period) ? null : adminAIUsagePeriodSchema.safeParse(query.period ?? '30d');
  if (!period || !period.success) redirect('/ai-usage');
  let report: AdminAIUsageResponse | undefined;
  let denied = false;
  try {
    report = await adminAIUsage.read(
      { userId: session.user.id, sessionId: session.session.id, accessEmail: email },
      period.data,
      requestHeaders.get('user-agent')?.slice(0, 2048) ?? null,
    );
  } catch (error) {
    if (error instanceof AdminAIUsageError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof AdminAIUsageError && error.status === 403)) throw error;
    denied = true;
  }
  if (denied) return <AdminFrame environment={getAdminEnvironment()} activeHref="/ai-usage">
    <h1 id="admin-title">AI usage access denied</h1>
    <p role="alert">Your current role cannot read AI usage.</p>
  </AdminFrame>;
  if (!report) throw new Error('The AI usage report returned no response.');
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/ai-usage" contentWidth="wide">
    <AdminAIUsagePage report={report} />
  </AdminFrame>;
}
