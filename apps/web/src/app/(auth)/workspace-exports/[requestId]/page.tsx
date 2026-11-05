import { notFound, redirect } from 'next/navigation';
import { getSession } from '../../../../server/auth/session';
import {
  readOwnerWorkspaceExport,
  WorkspaceExportUnavailableError,
} from '../../../../server/workspace-exports';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Workspace data export' };

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function WorkspaceExportPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  if (!requestIdPattern.test(requestId)) notFound();
  const session = await getSession();
  if (!session) redirect(`/login?returnTo=${encodeURIComponent(`/workspace-exports/${requestId}`)}`);

  let workspaceName: string;
  let expiresAt: Date;
  try {
    const exportRecord = await readOwnerWorkspaceExport(requestId, session.user.id);
    workspaceName = exportRecord.workspaceName;
    expiresAt = exportRecord.expiresAt;
  } catch (error) {
    if (error instanceof WorkspaceExportUnavailableError) notFound();
    throw error;
  }

  return <main className="mx-auto my-12 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm sm:p-8">
    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">SalesMora.ai · Data portability</p>
    <h1 className="m-0 text-2xl font-bold tracking-tight">Workspace export ready</h1>
    <p className="mt-4 text-sm leading-6 text-slate-700">
      The encrypted export for <strong>{workspaceName}</strong> is available to the current verified workspace Owner.
    </p>
    <p className="text-sm leading-6 text-slate-700">
      Download before {expiresAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}. Uploaded file contents are not included.
    </p>
    <a href={`/api/workspace-exports/${requestId}/download`}
      className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
      Download encrypted ZIP
    </a>
  </main>;
}
