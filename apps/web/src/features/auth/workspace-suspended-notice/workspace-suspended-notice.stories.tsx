import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkspaceSuspendedNotice, type WorkspaceSuspendedNoticeProps } from './workspace-suspended-notice';
import { workspaceSuspendedNoticeData as copy } from './workspace-suspended-notice.data';
const meta = {
  title: 'Auth/WorkspaceSuspendedNotice', component: WorkspaceSuspendedNotice,
  args: { workspaces: [], onSignOut: fn<WorkspaceSuspendedNoticeProps['onSignOut']>(async () => true) },
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-form gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof WorkspaceSuspendedNotice>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.title })).toBeVisible();
  await expect(c.getByText(copy.contact)).toBeVisible();
  await expect(c.queryByRole('navigation')).toBeNull();
  await expect(c.getByRole('button', { name: copy.signOut })).toBeEnabled();
} };
export const OtherWorkspaces: Story = { args: { workspaces: copy.stories.workspaces }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  const [first] = copy.stories.workspaces;
  await expect(c.getByRole('link', { name: copy.open(first.name) })).toHaveAttribute('href', `/home?workspace=${first.id}`);
} };
export const LongName: Story = { args: { workspaces: [{ id: copy.stories.workspaces[0].id, name: copy.stories.longName }] } };
export const SigningOut: Story = { args: { onSignOut: fn<WorkspaceSuspendedNoticeProps['onSignOut']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.dblClick(c.getByRole('button', { name: copy.signOut }));
  await expect(c.getByRole('button', { name: copy.signingOut })).toBeDisabled();
  await expect(args.onSignOut).toHaveBeenCalledTimes(1);
} };
export const SignOutError: Story = { args: { onSignOut: fn<WorkspaceSuspendedNoticeProps['onSignOut']>(async () => false) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.signOut }));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.signOutError);
} };
export const Mobile: Story = { ...OtherWorkspaces, globals: { viewport: { value: 'phone', isRotated: false } } };
