import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AIUsagePage } from './ai-usage-page';
import { aiUsagePageData as copy } from './ai-usage-page.data';
const meta = {
  title: 'Settings/AIUsagePage', component: AIUsagePage, parameters: { layout: 'fullscreen' },
  args: { workspaceName: copy.stories.workspace, viewerRole: 'owner', settingsHref: copy.stories.settingsHref, state: 'ready', usage: { usedOrReservedTokens: '1250000', monthlyTokens: '5000000', resetAt: copy.stories.resetAt }, onRefresh: fn() },
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
} satisfies Meta<typeof AIUsagePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
  await expect(c.getByText('3,750,000')).toBeVisible();
  await expect(c.getByRole('progressbar', { name: copy.meter })).toHaveAttribute('value', '25');
  await expect(c.getByRole('link', { name: copy.back })).toHaveAttribute('href', copy.stories.settingsHref);
  const refresh = c.getByRole('button', { name: copy.refresh });
  refresh.focus(); await expect(refresh).toHaveFocus();
  await userEvent.keyboard('{Enter}'); await expect(args.onRefresh).toHaveBeenCalledOnce();
} };
export const NearLimit: Story = { args: { usage: { ...meta.args.usage, usedOrReservedTokens: '4250000' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('heading', { name: copy.nearTitle })).toBeVisible();
} };
export const LimitReached: Story = { args: { usage: { ...meta.args.usage, usedOrReservedTokens: '5000000' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: copy.exhaustedTitle })).toBeVisible(); await expect(c.getByText(copy.exhausted)).toBeVisible();
} };
export const AboveLoweredLimit: Story = { args: { usage: { ...meta.args.usage, usedOrReservedTokens: '6000000' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText('0', { exact: true })).toBeVisible(); await expect(c.getByRole('progressbar')).toHaveAttribute('value', '100');
} };
export const ZeroAllowance: Story = { args: { usage: { ...meta.args.usage, monthlyTokens: '0', usedOrReservedTokens: '0' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('heading', { name: copy.noAllowanceTitle })).toBeVisible();
} };
export const NewMonth: Story = { args: { usage: { ...meta.args.usage, usedOrReservedTokens: '0' } } };
export const Loading: Story = { args: { state: 'loading', usage: undefined }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading); await expect(c.getByRole('button', { name: copy.refreshing })).toBeDisabled(); await expect(c.queryByRole('progressbar')).not.toBeInTheDocument(); await expect(args.onRefresh).not.toHaveBeenCalled();
} };
export const LoadError: Story = { args: { state: 'error', usage: undefined }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.errorTitle); await userEvent.click(c.getByRole('button', { name: copy.refresh })); await expect(args.onRefresh).toHaveBeenCalledOnce();
} };
export const AdminDenied: Story = { args: { viewerRole: 'admin' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.deniedTitle); await expect(c.queryByRole('progressbar')).not.toBeInTheDocument(); await expect(c.queryByText('1,250,000')).not.toBeInTheDocument(); await expect(args.onRefresh).not.toHaveBeenCalled();
} };
export const OfficeDenied: Story = { ...AdminDenied, args: { viewerRole: 'office' } };
export const FieldDenied: Story = { ...AdminDenied, args: { viewerRole: 'field' } };
export const InvalidSnapshot: Story = { args: { usage: { ...meta.args.usage, usedOrReservedTokens: '-1' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.errorTitle); await expect(c.queryByRole('progressbar')).not.toBeInTheDocument();
} };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, usage: { ...meta.args.usage, monthlyTokens: '1000000000000', usedOrReservedTokens: '999999999999' } } };
