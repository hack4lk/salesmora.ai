import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AccountLayout } from '@salesmora/ui';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmailVerificationNotice } from '../../auth/email-verification-notice/email-verification-notice';
import { emailVerificationNoticeData as verification } from '../../auth/email-verification-notice/email-verification-notice.data';
import { InvitationAcceptance } from '../../auth/invitation-acceptance/invitation-acceptance';
import { invitationAcceptanceData as invitation } from '../../auth/invitation-acceptance/invitation-acceptance.data';
import { LoginScreen } from '../../auth/login-screen/login-screen';
import { PasswordRecoveryScreen } from '../../auth/password-recovery-screen/password-recovery-screen';
import { RegistrationPlanScreen } from '../../auth/registration-plan-screen/registration-plan-screen';
import { registrationPlanScreenData as plans } from '../../auth/registration-plan-screen/registration-plan-screen.data';
import { RegistrationScreen } from '../../auth/registration-screen/registration-screen';
import { ResetPasswordScreen } from '../../auth/reset-password-screen/reset-password-screen';
import { publicSiteLinks } from '../public-site-links';
import { PublicAuthPage } from './public-auth-page';

const meta = {
  title: 'Public Site/PublicAuthPage',
  component: PublicAuthPage,
  parameters: { layout: 'fullscreen' },
  args: {
    links: publicSiteLinks,
    year: 2026,
    children: <LoginScreen layoutVariant="public" onSubmit={fn(async () => ({ ok: true }))} />,
  },
} satisfies Meta<typeof PublicAuthPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const pagePlay: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('main')).toHaveAttribute('id', 'main');
  await expect(canvas.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  await expect(canvas.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  const footer = within(canvas.getByRole('contentinfo'));
  await expect(footer.getByText('SalesMora is a product of Karpuk Creative, LLC.')).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', publicSiteLinks.terms);
};

export const SignIn: Story = { play: pagePlay };
export const SignInMobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: pagePlay };
export const Registration: Story = {
  args: { children: <RegistrationScreen layoutVariant="public" onSubmit={fn(async () => ({ ok: true }))} /> },
  play: pagePlay,
};
export const RegistrationPlans: Story = {
  args: { children: <RegistrationPlanScreen layoutVariant="public" notice={plans.preview} onSubmit={fn(async () => ({ ok: true }))} /> },
  play: pagePlay,
};
export const RegistrationPlanInteraction: Story = {
  args: { children: <RegistrationPlanScreen layoutVariant="public" notice={plans.preview} onSubmit={fn(async () => ({ ok: true }))} /> },
  play: async context => {
    await pagePlay(context);
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: plans.continue(plans.names.free) }));
    await expect(canvas.getByRole('heading', { name: plans.accountTitle })).toHaveFocus();
  },
};
export const ForgotPassword: Story = {
  args: { children: <PasswordRecoveryScreen layoutVariant="public" onSubmit={fn(async () => ({ ok: true }))} /> },
  play: pagePlay,
};
export const ResetPassword: Story = {
  args: { children: <ResetPasswordScreen layoutVariant="public" onSubmit={fn(async () => ({ ok: true }))} /> },
  play: pagePlay,
};
export const EmailVerification: Story = {
  args: { children: <AccountLayout variant="public" title={verification.page.title} description={verification.page.description}>
    <EmailVerificationNotice email={verification.stories.email} onResend={fn(async () => ({ ok: true }))} />
  </AccountLayout> },
  play: pagePlay,
};
export const TeamInvitation: Story = {
  args: { children: <AccountLayout variant="public" title={invitation.page.title} description={invitation.page.description}>
    <InvitationAcceptance availability="ready" invitation={{ id: 'preview', workspaceName: invitation.stories.workspace, inviterName: invitation.stories.inviter, email: invitation.stories.email, role: 'office', expiresAt: invitation.stories.expiry }}
      onAccept={fn(async () => ({ ok: true }))} onCreateAccount={fn(async () => ({ ok: true }))} onSignIn={fn()} onSwitchAccount={fn()} onContinue={fn()} />
  </AccountLayout> },
  play: pagePlay,
};
