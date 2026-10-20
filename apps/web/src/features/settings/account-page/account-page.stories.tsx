import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AccountPage } from './account-page';
import { accountPageData as copy } from './account-page.data';
const meta = {
  title: 'Settings/AccountPage', component: AccountPage, parameters: { layout: 'fullscreen' },
  args: { viewerRole: 'owner' },
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.preview}</p><Story/></main>],
} satisfies Meta<typeof AccountPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Owner: Story = {};
export const Teammate: Story = { args: { viewerRole: 'field' } };
export const OwnerConfirmation: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.ownerTitle }));
  await expect(c.getByRole('dialog', { name: copy.confirmOwner })).toBeVisible();
  await expect(c.getByRole('button', { name: copy.deleteOwner })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toHaveFocus();
} };
export const TeammateConfirmation: Story = { args: { viewerRole: 'field' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.memberTitle }));
  await expect(c.getByRole('dialog', { name: copy.confirmMember })).toBeVisible();
  await expect(c.getByRole('button', { name: copy.deleteMember })).toBeDisabled();
} };

export const ConnectedAccount: Story = {
  args: { account: copy.connectedFixture, settingsHref: '/settings?workspace=fictional-workspace', billingHref: '/settings/billing?workspace=fictional-workspace' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText(args.account!.email)).toBeVisible();
    await expect(c.getByRole('button', { name: copy.ownerTitle })).toBeDisabled();
    await expect(c.getByRole('link', { name: copy.billing })).toHaveAttribute('href', args.billingHref);
  },
};

export const DeletionAccepted: Story = {
  args: { account: copy.connectedFixture, onDelete: fn(async () => ({ ok: true })) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: copy.ownerTitle }));
    await userEvent.type(c.getByLabelText(new RegExp(copy.password)), 'Fictional-preview-only');
    await userEvent.type(c.getByLabelText(new RegExp(copy.workspaceLabel)), copy.connectedFixture.workspace);
    await userEvent.click(c.getByRole('checkbox'));
    await userEvent.click(c.getByRole('button', { name: copy.deleteOwner }));
    await expect(c.getByRole('status')).toHaveTextContent(copy.accepted);
  },
};
export const DeletionDenied: Story = {
  args: { account: copy.connectedFixture, onDelete: fn(async () => ({ ok: false, message: copy.failed })) },
};
