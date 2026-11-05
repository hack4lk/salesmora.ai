import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminFrame } from '../../components/admin-frame/admin-frame';
import { AdminAuditViewerPage } from '../../components/admin-audit-viewer/admin-audit-viewer-page';
import { AdminAuditArchiveHealth } from '../../components/admin-audit-archive-health/admin-audit-archive-health';
import { adminAuditViewerData as copy } from '../../components/admin-audit-viewer/admin-audit-viewer.data';
import { getAdminEnvironment } from '../../server/environment';
import { getAdminSession } from '../../server/get-admin-session';
import { auditViewer, AuditViewerError } from '../../server/audit-viewer';

export const dynamic = 'force-dynamic';
export default async function AuditPage() {
  const requestHeaders = await headers();
  const session = await getAdminSession(requestHeaders);
  const email = requestHeaders.get('x-admin-access-email');
  if (!session || !email || session.user.email.toLowerCase() !== email.toLowerCase()) redirect('/sign-in');
  let page;
  try {
    page = await auditViewer.read({ userId: session.user.id, sessionId: session.session.id, accessEmail: email }, {},
      { userAgent: requestHeaders.get('user-agent')?.slice(0, 2048) ?? null });
  } catch (error) {
    if (error instanceof AuditViewerError && error.status === 401) redirect('/sign-in');
    if (!(error instanceof AuditViewerError && error.status === 403)) throw error;
  }
  if (!page) return <AdminFrame environment={getAdminEnvironment()} activeHref="/audit"><h1 id="admin-title">{copy.deniedTitle}</h1><p role="alert">{copy.liveDenied}</p></AdminFrame>;
  return <AdminFrame environment={getAdminEnvironment()} activeHref="/audit" contentWidth="wide">
    <AdminAuditViewerPage initialPage={page} archiveHealth={<AdminAuditArchiveHealth />} />
  </AdminFrame>;
}
