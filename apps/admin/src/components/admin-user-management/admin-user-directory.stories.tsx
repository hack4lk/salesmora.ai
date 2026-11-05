import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminUserDirectory, type AdminUserDirectoryProps } from './admin-user-directory';
import { adminCustomerUserPreviews, adminUserManagementData as copy } from './admin-user-management.data';

const pageSize = 2;
const meta = {
  title: 'Admin/Customers/AdminUserDirectory',
  component: AdminUserDirectory,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    users: adminCustomerUserPreviews.slice(0, pageSize),
    query: '',
    status: 'all',
    page: 0,
    pageSize,
    total: adminCustomerUserPreviews.length,
    onQueryChange: fn<AdminUserDirectoryProps['onQueryChange']>(),
    onStatusChange: fn<AdminUserDirectoryProps['onStatusChange']>(),
    onPageChange: fn<AdminUserDirectoryProps['onPageChange']>(),
    onSelect: fn<AdminUserDirectoryProps['onSelect']>(),
  },
} satisfies Meta<typeof AdminUserDirectory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CustomerDirectory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title })).toBeVisible();
    await expect(canvas.getByText(adminCustomerUserPreviews[0].maskedEmail)).toBeVisible();
    await expect(canvas.getByText(copy.results(1, 2, adminCustomerUserPreviews.length))).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.previous })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: copy.next })).toBeEnabled();
    await expect(canvas.getByText(copy.previewNotice)).toBeVisible();
  },
};

export const SearchAndChooseStatus: Story = {
  render: args => <SearchPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: copy.search });
    await userEvent.type(search, 'Jordan');
    await expect(search).toHaveValue('Jordan');
    await userEvent.click(canvas.getByRole('tab', { name: copy.statuses.suspended }));
    await expect(args.onStatusChange).toHaveBeenLastCalledWith('suspended');
    await expect(canvas.getByRole('tab', { name: copy.statuses.suspended })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'user-status-tab-suspended');
  },
};

export const NavigateStatusTabsWithKeyboard: Story = {
  render: args => <SearchPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const activeTab = canvas.getByRole('tab', { name: copy.statuses.active });
    activeTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: copy.statuses.unverified })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: copy.statuses.unverified })).toHaveAttribute('aria-selected', 'true');
    await expect(args.onStatusChange).toHaveBeenLastCalledWith('unverified');
  },
};

export const OpenCustomerProfile: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await expect(args.onSelect).toHaveBeenCalledWith(adminCustomerUserPreviews[0].id);
  },
};

export const NextPage: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.next }));
    await expect(args.onPageChange).toHaveBeenCalledWith(1);
  },
};

export const NoMatches: Story = {
  args: { users: [], total: 0, query: 'not-found' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.emptyTitle })).toBeVisible();
    await expect(canvas.getByText(copy.emptyDescription)).toBeVisible();
  },
};

export const Loading: Story = {
  args: { loading: true, users: [], total: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.loading, { exact: true })).toBeVisible();
  },
};

export const LoadError: Story = {
  args: { error: copy.loadFailed, users: [], total: 0, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.loadFailed);
    await userEvent.click(canvas.getByRole('button', { name: copy.retry }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

function FilteredPreview(args: AdminUserDirectoryProps) {
  const [status, setStatus] = useState<AdminUserDirectoryProps['status']>('all');
  const filtered = status === 'all' ? adminCustomerUserPreviews : adminCustomerUserPreviews.filter(user => {
    if (status === 'deletion_pending') return Boolean(user.deletionRequestedAt);
    if (status === 'suspended') return Boolean(user.suspendedAt);
    if (status === 'unverified') return !user.emailVerified;
    return user.emailVerified && !user.suspendedAt && !user.deletionRequestedAt;
  });
  return <AdminUserDirectory {...args} users={filtered} total={filtered.length} status={status}
    onStatusChange={next => { setStatus(next); args.onStatusChange(next); }} page={0} />;
}

function SearchPreview(args: AdminUserDirectoryProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AdminUserDirectoryProps['status']>('all');
  return <AdminUserDirectory {...args} query={query} status={status}
    onQueryChange={next => { setQuery(next); args.onQueryChange(next); }}
    onStatusChange={next => { setStatus(next); args.onStatusChange(next); }} />;
}

export const FilterResults: Story = {
  render: args => <FilteredPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: copy.statuses.suspended }));
    await expect(canvas.getByText('Casey Rivera')).toBeVisible();
    await expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible();
  },
};
