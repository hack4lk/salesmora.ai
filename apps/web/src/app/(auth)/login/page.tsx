import { invitationReturnPath } from '../../../server/invitations/context';
import { redirect } from 'next/navigation';
import { getSession } from '../../../server/auth/session';
import { LoginRoute } from '../../../features/auth/login-screen/login-route';
import { loginScreenData } from '../../../features/auth/login-screen/login-screen.data';

export const metadata = { title: loginScreenData.documentTitle };

const workspaceExportReturnPath = /^\/workspace-exports\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ accountDeletion?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.returnTo && workspaceExportReturnPath.test(params.returnTo) ? params.returnTo : undefined;
  if (await getSession()) redirect(await invitationReturnPath() ?? returnTo ?? '/setup');
  return <LoginRoute accountDeletionRequested={params.accountDeletion === 'requested'} returnTo={returnTo} />;
}
