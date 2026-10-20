import { sandboxBillingEnabled } from '@salesmora/data';
import { invitationReturnPath } from '../../../server/invitations/context';
import { redirect } from 'next/navigation';
import { getSession } from '../../../server/auth/session';
import { RegistrationRoute } from '../../../features/auth/registration-screen/registration-route';
import { registrationScreenData } from '../../../features/auth/registration-screen/registration-screen.data';

export const metadata = { title: registrationScreenData.documentTitle };

export default async function RegisterPage() {
  if (await getSession()) redirect(await invitationReturnPath() ?? '/setup');
  return <RegistrationRoute billingEnabled={sandboxBillingEnabled()} />;
}
