import { getWorkspacePlan } from '@salesmora/domain';
import { workspacePlanIdSchema } from '@salesmora/contracts';
import { sandboxBillingEnabled, billingOnboarding } from '@salesmora/data';
import { database } from '../../../server/workspaces/store';
import { invitationReturnPath } from '../../../server/invitations/context';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AccountLayout, SubmitButton } from '@salesmora/ui';
import { auth } from '../../../server/auth/auth';
import { getSession } from '../../../server/auth/session';
import { findWorkspace } from '../../../server/workspaces/store';
import { OnboardingRoute } from '../../../features/onboarding/onboarding-flow/onboarding-route';
import { onboardingFlowData as copy } from '../../../features/onboarding/onboarding-flow/onboarding-flow.data';
export const metadata = { title: copy.documentTitle };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function SetupPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const invitationPath = await invitationReturnPath();
  if (invitationPath) redirect(invitationPath);
  const workspace = await findWorkspace(session.user.id);
  const billingEnabled = sandboxBillingEnabled();
  if (workspace) {
    if (billingEnabled && workspace.ownerId === session.user.id) {
      const billing = await billingOnboarding(database(),session.user.id,workspace.id);
      if (billing && billing.intendedPlan !== 'free' && billing.plan === 'free' && billing.status === 'free') redirect(`/setup/payment?workspace=${workspace.id}`);
    }
    redirect('/home');
  }
  return <AccountLayout title={copy.title} description={copy.description}>
    <p className="mb-6 text-sm text-muted">{copy.signedIn} <span className="font-semibold text-ink">{session.user.email}</span></p>
    <OnboardingRoute teammateLimit={billingEnabled ? getWorkspacePlan(workspacePlanIdSchema.parse(session.user.registrationPlan)).limits.teammates : undefined} ownerEmail={session.user.email} nextHref={billingEnabled && session.user.registrationPlan !== 'free' ? '/setup' : '/home'} />
    <form action={signOut} className="mt-6"><SubmitButton label={copy.signOut} /></form>
  </AccountLayout>;
}
