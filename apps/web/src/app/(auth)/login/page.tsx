import { invitationReturnPath } from '../../../server/invitations/context';
import { redirect } from 'next/navigation';
import { getSession } from '../../../server/auth/session';
import { LoginRoute } from '../../../features/auth/login-screen/login-route';
import { loginScreenData } from '../../../features/auth/login-screen/login-screen.data';

export const metadata = { title: loginScreenData.documentTitle };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ accountDeletion?: string }> }) {
  if (await getSession()) redirect(await invitationReturnPath() ?? '/setup');
  return <LoginRoute accountDeletionRequested={(await searchParams).accountDeletion === 'requested'} />;
}
