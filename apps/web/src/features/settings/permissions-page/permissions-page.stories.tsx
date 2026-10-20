import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import type { PermissionId, PolicyChange } from '@salesmora/contracts';
import { PermissionsPage, type PermissionSaveResult } from './permissions-page';
import { permissionsPageData as copy } from './permissions-page.data';

const policy = createDefaultWorkspacePolicy('11111111-1111-4111-8111-111111111111');
// Match the live feature registry. Stored grants for future modules stay visible but disabled.
const availablePermissions: PermissionId[] = ['home.access', 'assistant.use', 'leads.read', 'leads.create', 'leads.assign', 'team.invite', 'permissions.read', 'permissions.manage', 'settings.business.read'];
const save = async (change: PolicyChange): Promise<PermissionSaveResult> => ({ ok: true, policy: change.policy });
const meta = {
  title: 'Settings/PermissionsPage',
  component: PermissionsPage,
  parameters: { layout: 'fullscreen' },
  args: {
    workspaceName: copy.stories.workspace, viewerRole: 'owner', policy,
    defaultPolicy: policy, availablePermissions, initialRole: 'office',
    onSave: fn(save), onReload: fn(async () => ({ ...policy, revision: 1 })),
    onReauthenticate: fn(async () => {}),
  },
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
} satisfies Meta<typeof PermissionsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Field: Story = { args: { initialRole: 'field' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch', { name: copy.labels['leads.create'] })).not.toBeChecked();
  await expect(c.getByRole('combobox', { name: `${copy.labels['leads.read']} ${copy.scope}` })).toHaveValue('assigned');
  await expect(c.getByRole('switch', { name: copy.labels['leads.export'] })).toBeDisabled();
} };
export const OwnerProtected: Story = { args: { initialRole: 'owner' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const permission of ['permissions.manage', 'billing.manage', 'ownership.transfer'] as const) {
    await expect(c.getByRole('switch', { name: copy.labels[permission] })).toBeChecked();
    await expect(c.getByRole('switch', { name: copy.labels[permission] })).toBeDisabled();
  }
} };
export const AdminViewerDenied: Story = { args: { viewerRole: 'admin' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.deniedTitle);
  await expect(c.queryByRole('switch')).not.toBeInTheDocument();
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace } };

const openReview: NonNullable<Story['play']> = async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch', { name: copy.labels['leads.create'] }));
  await userEvent.click(c.getByRole('button', { name: copy.review }));
  await expect(c.getByRole('heading', { name: copy.reviewTitle })).toHaveFocus();
  await expect(args.onSave).not.toHaveBeenCalled();
};
export const Review: Story = { play: openReview };
export const SaveChanges: Story = { play: async context => {
  await openReview(context);
  const c = within(context.canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(context.args.onSave).toHaveBeenCalledTimes(1);
  await expect(c.getByText(copy.successTitle)).toBeVisible();
  await expect(c.getByRole('switch', { name: copy.labels['leads.create'] })).not.toBeChecked();
  await expect(c.getByText(copy.clean)).toBeVisible();
  await expect(c.queryByText(copy.conflictTitle)).not.toBeInTheDocument();
} };
export const DraftAcrossRoles: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch', { name: copy.labels['leads.create'] }));
  await userEvent.click(c.getByRole('button', { name: copy.roles.field }));
  await userEvent.click(c.getByRole('button', { name: copy.roles.office }));
  await expect(c.getByRole('switch', { name: copy.labels['leads.create'] })).not.toBeChecked();
  await expect(c.getByText(copy.pending(1))).toBeVisible();
} };
export const DependencyError: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch', { name: copy.labels['leads.read'] }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.invalidTitle);
  await expect(c.getByRole('button', { name: copy.review })).toBeDisabled();
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const ScopeChange: Story = { args: { initialRole: 'field' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: `${copy.labels['leads.read']} ${copy.scope}` }), 'workspace');
  await expect(c.getByText(copy.pending(1))).toBeVisible();
  await expect(c.getByRole('button', { name: copy.review })).toBeEnabled();
} };
export const Conflict: Story = { args: { onSave: fn<typeof save>(async (): Promise<PermissionSaveResult> => ({ ok: false, reason: 'conflict' })) }, play: async context => {
  await openReview(context);
  const c = within(context.canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByText(copy.conflictTitle)).toBeVisible();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const ReloadAfterConflict: Story = { args: Conflict.args, play: async context => {
  await Conflict.play!(context);
  const c = within(context.canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.reload }));
  await expect(context.args.onReload).toHaveBeenCalledTimes(1);
  await expect(c.getByText(copy.clean)).toBeVisible();
  await expect(c.getByRole('switch', { name: copy.labels['leads.create'] })).toBeChecked();
} };
export const SaveFailure: Story = { args: { onSave: fn<typeof save>(async (): Promise<PermissionSaveResult> => ({ ok: false, reason: 'error' })) }, play: async context => {
  await openReview(context);
  const c = within(context.canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByText(copy.errorTitle)).toBeVisible();
  await expect(c.getByText(copy.pending(1))).toBeVisible();
  await expect(c.getByRole('button', { name: copy.save })).toBeEnabled();
} };
export const Reauthentication: Story = { args: { onSave: fn<typeof save>(async (): Promise<PermissionSaveResult> => ({ ok: false, reason: 'reauthentication' })) }, play: async context => {
  await openReview(context);
  const c = within(context.canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByText(copy.reauthTitle)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.reauthenticate }));
  await expect(context.args.onReauthenticate).toHaveBeenCalledTimes(1);
  await expect(c.getByText(copy.pending(1))).toBeVisible();
} };
export const Saving: Story = { args: { onSave: fn<typeof save>(() => new Promise<PermissionSaveResult>(() => {})) }, play: async context => {
  await openReview(context);
  const c = within(context.canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByRole('button', { name: copy.saving })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.back })).toBeDisabled();
} };
export const ResetDefaults: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch', { name: copy.labels['leads.create'] }));
  await userEvent.click(c.getByRole('button', { name: copy.reset }));
  await expect(c.getByText(copy.clean)).toBeVisible();
  await expect(c.getByRole('switch', { name: copy.labels['leads.create'] })).toBeChecked();
} };
export const SearchEmpty: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('searchbox', { name: copy.search }), 'zzzz');
  await expect(c.getByText(copy.noResults)).toBeVisible();
} };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  c.getByRole('switch', { name: copy.labels['leads.create'] }).focus();
  await userEvent.keyboard(' ');
  await expect(c.getByText(copy.pending(1))).toBeVisible();
  c.getByRole('button', { name: copy.review }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(c.getByRole('heading', { name: copy.reviewTitle })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect(c.getByRole('button', { name: copy.review })).toHaveFocus();
} };
