import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { GmailCaptureScope, type GmailCaptureScopeProps, type GmailCaptureAccount } from './gmail-capture-scope';
import { gmailCaptureScopeData as copy } from './gmail-capture-scope.data';

const accounts: GmailCaptureAccount[] = [{ id: 'primary', email: copy.stories.account, status: 'connected' }, { id: 'second', email: copy.stories.secondAccount, status: 'connected' }];
const selected = { accountId: 'primary' };
function Preview(args: GmailCaptureScopeProps) {
  const [value, setValue] = useState(args.value);
  const [available, setAvailable] = useState(args.accounts);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.description}</p>
    <GmailCaptureScope {...args} value={value} accounts={available} onChange={next => { args.onChange(next); setValue(next); }}
      onConnect={() => { args.onConnect(); setAvailable(accounts); setValue(selected); }}
      onReconnect={accountId => { args.onReconnect(accountId); setAvailable(current => current.map(item => item.id === accountId ? { ...item, status: 'connected' } : item)); }} />
  </main>;
}
const meta = {
  title: 'Lead Capture/GmailCaptureScope', component: GmailCaptureScope, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: { accountId: null }, accounts: [], gmailAccess: 'available', canRead: true, canEdit: true,
    onChange: fn<GmailCaptureScopeProps['onChange']>(), onConnect: fn(), onReconnect: fn<GmailCaptureScopeProps['onReconnect']>(), onRetryAccounts: fn(), onReviewPlans: fn() },
} satisfies Meta<typeof GmailCaptureScope>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('radio')).not.toBeInTheDocument();
  await expect(c.getAllByRole('combobox')).toHaveLength(1);
  await expect(c.getByText(copy.incoming)).toBeVisible();
} };
export const Connected: Story = { args: { accounts, value: selected } };
export const Connect: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.connect }));
  await expect(args.onConnect).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('combobox', { name: copy.account })).toHaveValue('primary');
  await expect(c.getByText(copy.connected)).toBeVisible();
} };
export const ChangeAccount: Story = { args: { accounts, value: selected }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.account }), 'second');
  await expect(args.onChange).toHaveBeenLastCalledWith({ accountId: 'second' });
  await expect(c.getByText(copy.stories.secondAccount, { selector: 'p' })).toBeVisible();
  await expect(c.queryByRole('radio')).not.toBeInTheDocument();
} };
export const ReconnectRequired: Story = { args: { accounts: [{ ...accounts[0], status: 'reconnect-required' }], value: selected }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.reconnect }));
  await expect(args.onReconnect).toHaveBeenCalledWith('primary');
  await expect(c.getByRole('combobox', { name: copy.account })).toHaveValue('primary');
  await expect(c.getByText(copy.connected)).toBeVisible();
} };
export const ConnectionFailure: Story = { args: { connectionError: copy.stories.connectionError, accounts, value: selected } };
export const Pending: Story = { args: { pending: true, accounts, value: selected }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const control of [...c.getAllByRole('combobox'), ...c.getAllByRole('button')]) await expect(control).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
  await expect(args.onConnect).not.toHaveBeenCalled();
} };
export const LoadingAccounts: Story = { args: { accountsStatus: 'loading' } };
export const AccountsFailure: Story = { args: { accountsStatus: 'error', accounts, value: selected }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.retryAccounts }));
  await expect(args.onRetryAccounts).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('combobox', { name: copy.account })).toHaveValue('primary');
} };
export const RemovedAccount: Story = { args: { accounts, value: { accountId: 'removed' } } };
export const ValidationErrors: Story = { args: { showErrors: true } };
export const ReadOnly: Story = { args: { accounts, value: selected, canEdit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('combobox')).toBeDisabled();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { accounts, value: selected, canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.forbidden);
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(c.queryByText(copy.stories.account)).not.toBeInTheDocument();
} };
export const UpgradeRequired: Story = { args: { accounts, value: selected, gmailAccess: 'upgrade-required' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('combobox')).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.plans }));
  await expect(args.onReviewPlans).toHaveBeenCalledTimes(1);
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const AccessLoading: Story = { args: { gmailAccess: 'loading' } };
export const AccessUnavailable: Story = { args: { gmailAccess: 'unavailable' } };
export const LongContent: Story = { args: { accounts: [{ ...accounts[0], email: copy.stories.longAccount }], value: selected } };
export const Narrow: Story = { args: { accounts, value: selected }, globals: { viewport: { value: 'mobile1', isRotated: false } } };

export const ConnectionUnavailable: Story = { args: { connectionAvailable: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.queryByRole('button', { name: copy.connect })).not.toBeInTheDocument(); } };
