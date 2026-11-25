import { AccountLayout } from '@salesmora/ui';
import { getSession } from '../../../server/auth/session';
import { getInvitation } from '../../../server/invitations/store';
import { InvitationAcceptanceRoute } from '../../../features/auth/invitation-acceptance/invitation-acceptance-route';
import { invitationAcceptanceData as copy } from '../../../features/auth/invitation-acceptance/invitation-acceptance.data';
import { PublicAuthPage } from '../../../features/public-site/public-auth-page/public-auth-page';
export const metadata = { title:copy.page.documentTitle,referrer:'no-referrer' as const,robots:{index:false,follow:false} };
export default async function AcceptInvitationPage({ searchParams }: { searchParams:Promise<{token?:string}> }) {
  const { token } = await searchParams;
  const session = await getSession();
  const view = await getInvitation(token,session?.user.id);
  return <PublicAuthPage><AccountLayout variant="public" title={copy.page.title} description={copy.page.description}>
    <InvitationAcceptanceRoute view={view} token={token} currentEmail={session?.user.email} />
  </AccountLayout></PublicAuthPage>;
}
