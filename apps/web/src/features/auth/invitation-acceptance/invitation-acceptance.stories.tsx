import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { InvitationAcceptance, type InvitationAcceptanceProps, type InvitationSummary } from './invitation-acceptance';
import { registrationFormData as registrationCopy } from '../registration-form/registration-form.data';
import { invitationAcceptanceData as copy } from './invitation-acceptance.data';
const invitation = { id: 'fictional-invitation', workspaceName: copy.stories.workspace, inviterName: copy.stories.inviter, email: copy.stories.email, role: 'office' as const, expiresAt: copy.stories.expiry };
// Storybook controls use flat args; the actual component retains its discriminated contract.
type PreviewProps = Omit<InvitationAcceptanceProps, 'availability' | 'invitation'> & { availability: InvitationAcceptanceProps['availability']; invitation?: InvitationSummary };
function InvitationPreview({ availability, invitation, ...actions }: PreviewProps) {
  if (availability === 'ready' || availability === 'accepted') {
    if (!invitation) throw new Error('Active preview requires invitation data.');
    return <InvitationAcceptance {...actions} availability={availability} invitation={invitation} />;
  }
  return <InvitationAcceptance {...actions} availability={availability} />;
}
const meta = {
  title: 'Auth/InvitationAcceptance', component: InvitationPreview,
  args: { availability: 'ready', invitation, currentEmail: copy.stories.email, onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => ({ ok: true })), onCreateAccount: fn<InvitationAcceptanceProps['onCreateAccount']>(async () => ({ok:true})), onSignIn: fn(), onSwitchAccount: fn(), onContinue: fn() },
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-form gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof InvitationPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.stories.workspace)).toBeVisible();
  await expect(c.getByRole('button', { name: copy.accept })).toBeEnabled();
  await expect(args.onAccept).not.toHaveBeenCalled();
} };
export const SignedOut: Story = { args: { currentEmail: undefined }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: copy.accept })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.signIn }));
  await expect(c.getByRole('textbox', { name: registrationCopy.labels.email })).toHaveValue(copy.stories.email);
  await expect(c.getByRole('textbox', { name: registrationCopy.labels.email })).toBeDisabled();
  await expect(c.getByRole('button', {name:copy.createAccount})).toBeVisible();
  await expect(args.onSignIn).toHaveBeenCalledTimes(1);
  await expect(args.onAccept).not.toHaveBeenCalled();
} };
export const WrongAccount: Story = { args: { currentEmail: copy.stories.otherEmail }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.wrongAccount);
  await expect(c.queryByRole('button', { name: copy.accept })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.switchAccount }));
  await expect(args.onSwitchAccount).toHaveBeenCalledTimes(1);
  await expect(args.onAccept).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.dblClick(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('button', { name: copy.accepting })).toBeDisabled();
  await expect(c.getByRole('form')).toHaveAttribute('aria-busy', 'true');
  await expect(args.onAccept).toHaveBeenCalledTimes(1);
} };
export const Accepted: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.success);
  await expect(c.getByRole('status').parentElement).toHaveFocus();
  await expect(c.queryByRole('button', { name: copy.accept })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.continue }));
  await expect(args.onContinue).toHaveBeenCalledTimes(1);
  await expect(args.onAccept).toHaveBeenCalledWith();
} };
export const AlreadyAccepted: Story = { args: { availability: 'accepted' }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('status')).toHaveAccessibleDescription(copy.success);
  await expect(args.onAccept).not.toHaveBeenCalled();
} };
export const AdminField: Story = { args: { invitation: { ...invitation, role: 'admin' } } };
export const ServerError: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => ({ ok: false })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.error);
  await expect(c.getByRole('alert').parentElement).toHaveFocus();
  await expect(c.getByRole('button', { name: copy.accept })).toBeEnabled();
} };
export const NetworkError: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => { throw new Error(copy.stories.networkError); }) }, play: ServerError.play };
export const Retry: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => ({ ok: true })).mockResolvedValueOnce({ ok: false }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.getByText(copy.stories.workspace)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.success);
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await expect(args.onAccept).toHaveBeenCalledTimes(2);
} };
export const Expired: Story = { args: { availability: 'expired', invitation: undefined }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.unavailable.expired.message);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(c.queryByText(copy.stories.email)).not.toBeInTheDocument();
  await expect(args.onAccept).not.toHaveBeenCalled();
} };
export const Invalid: Story = { args: { availability: 'invalid', invitation: undefined } };
export const Revoked: Story = { args: { availability: 'revoked', invitation: undefined } };
export const ExpiresDuringAcceptance: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => ({ ok: false, reason: 'expired' })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.unavailable.expired.message);
  await expect(c.getByRole('alert').parentElement).toHaveFocus();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(c.queryByText(copy.stories.email)).not.toBeInTheDocument();
} };
export const AccountChangedOnServer: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => ({ ok: false, reason: 'wrong-account' })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.wrongAccount);
  await expect(c.queryByRole('button', { name: copy.accept })).not.toBeInTheDocument();
} };
export const RateLimited: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => ({ ok: false, reason: 'rate-limited' })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.accept }));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.limited);
  await expect(c.getByRole('button', { name: copy.accept })).toBeEnabled();
} };
export const Keyboard: Story = { args: { currentEmail: ` ${copy.stories.email.toUpperCase()} ` }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: copy.accept }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.success);
  await expect(args.onAccept).toHaveBeenCalledTimes(1);
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.accept })).toBeDisabled();
  await expect(args.onAccept).not.toHaveBeenCalled();
} };
export const Mobile: Story = { args: { invitation: { ...invitation, workspaceName: copy.stories.longWorkspace, email: copy.stories.longEmail }, currentEmail: copy.stories.longEmail }, globals: { viewport: { value: 'phone', isRotated: false } } };

export const SetPassword: Story = { args: { currentEmail: undefined }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', {name:registrationCopy.labels.name}), registrationCopy.stories.name);
  await userEvent.type(c.getByLabelText(registrationCopy.labels.password, {exact:false,selector:'input'}), registrationCopy.stories.password);
  await userEvent.type(c.getByLabelText(registrationCopy.labels.confirmPassword, {exact:false,selector:'input'}), registrationCopy.stories.password);
  await userEvent.click(c.getByRole('checkbox'));
  await userEvent.click(c.getByRole('button', {name:copy.createAccount}));
  await expect(args.onCreateAccount).toHaveBeenCalledWith({name:registrationCopy.stories.name,email:copy.stories.email,password:registrationCopy.stories.password,termsAccepted:true});
  await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.accountReady);
  await expect(args.onAccept).not.toHaveBeenCalled();
} };
export const AccountCreationError: Story = { args: { currentEmail: undefined, onCreateAccount: fn<InvitationAcceptanceProps['onCreateAccount']>(async () => ({ok:false,message:copy.accountError})) }, play: async context => {
  const c = within(context.canvasElement);
  await userEvent.type(c.getByRole('textbox', {name:registrationCopy.labels.name}), registrationCopy.stories.name);
  await userEvent.type(c.getByLabelText(registrationCopy.labels.password, {exact:false,selector:'input'}), registrationCopy.stories.password);
  await userEvent.type(c.getByLabelText(registrationCopy.labels.confirmPassword, {exact:false,selector:'input'}), registrationCopy.stories.password);
  await userEvent.click(c.getByRole('checkbox'));
  await userEvent.click(c.getByRole('button', {name:copy.createAccount}));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.accountError);
  await expect(c.getByRole('button', {name:copy.signIn})).toBeEnabled();
} };
export const SignedOutMobile: Story = { args: { currentEmail: undefined, invitation: {...invitation,email:copy.stories.longEmail} }, globals: {viewport:{value:'phone',isRotated:false}} };

export const PlanCapacityReached: Story = { args: { onAccept: fn<InvitationAcceptanceProps['onAccept']>(async () => ({ ok: false, reason: 'capacity' })) }, play: async ({ canvasElement }) => {
  const c=within(canvasElement);
  await userEvent.click(c.getByRole('button',{name:copy.accept}));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.capacity);
  await expect(c.getByRole('alert').parentElement).toHaveFocus();
  await expect(c.getByRole('button',{name:copy.accept})).toBeEnabled();
}};
