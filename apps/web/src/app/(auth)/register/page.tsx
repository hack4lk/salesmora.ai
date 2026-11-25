import { sandboxBillingEnabled } from '@salesmora/data';
import { invitationReturnPath } from '../../../server/invitations/context';
import { redirect } from 'next/navigation';
import { getSession } from '../../../server/auth/session';
import { RegistrationRoute } from '../../../features/auth/registration-screen/registration-route';
import { registrationScreenData } from '../../../features/auth/registration-screen/registration-screen.data';
import { PublicAuthPage } from '../../../features/public-site/public-auth-page/public-auth-page';

export const metadata = { title: registrationScreenData.documentTitle };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  if (await getSession()) redirect(await invitationReturnPath() ?? '/setup');
  const { plan } = await searchParams;
  return <PublicAuthPage><RegistrationRoute billingEnabled={sandboxBillingEnabled()} initialPlanQuery={plan} /></PublicAuthPage>;
}
