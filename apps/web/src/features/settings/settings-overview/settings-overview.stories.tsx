import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { SettingsOverview } from './settings-overview';
import { settingsOverviewData as copy } from './settings-overview.data';

const meta = {
  title: 'Settings/SettingsOverview', component: SettingsOverview,
  parameters: { layout: 'fullscreen' },
  args: { workspaceName: copy.stories.workspace, profile: { businessName: copy.stories.workspace, businessType: 'plumbing', postalCode: copy.stories.postalCode, serviceRange: '25-miles', services: ['repairs', 'drain-cleaning'] }, permissionsHref: copy.stories.permissionsHref, aiUsageHref: '/settings/ai-usage?workspace=fictional-workspace' },
  decorators: [Story => <main className="mx-auto min-h-screen max-w-6xl p-4 sm:p-8"><Story /></main>],
} satisfies Meta<typeof SettingsOverview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Owner: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
  await expect(c.getByRole('heading', { name: copy.businessTitle })).toBeVisible();
  await expect(c.getByRole('link', { name: copy.managePermissions })).toHaveAttribute('href', copy.stories.permissionsHref);
} };
export const Admin: Story = { args: { permissionsHref: undefined, aiUsageHref: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('link', { name: copy.viewAIUsage })).not.toBeInTheDocument();
  await expect(c.getByRole('heading', { name: copy.businessTitle })).toBeVisible();
  await expect(c.queryByRole('link', { name: copy.managePermissions })).not.toBeInTheDocument();
} };
export const PermissionsOnly: Story = { args: { profile: null, aiUsageHref: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('heading', { name: copy.businessTitle })).not.toBeInTheDocument();
  await expect(c.getByRole('link', { name: copy.managePermissions })).toBeVisible();
} };
export const MissingOptionalDetails: Story = { args: { profile: { ...meta.args.profile, postalCode: '', serviceRange: '', services: [] } } };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, profile: { ...meta.args.profile, businessName: copy.stories.longWorkspace } } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
