import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminWorkspaceDirectoryPage } from './admin-workspace-directory-page';
import {
  adminWorkspaceDirectoryPreviews,
  adminWorkspaceManagementData as copy,
} from './admin-workspace-management.data';
import { AdminWorkspaceDirectoryView, type AdminWorkspaceDirectoryViewProps } from './admin-workspace-directory';

const pageSize = 5;
const meta = {
  title: 'Admin/Customers/AdminWorkspaceDirectory',
  component: AdminWorkspaceDirectoryView,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    workspaces: adminWorkspaceDirectoryPreviews.slice(0, pageSize),
    query: '',
    plan: 'all',
    status: 'all',
    page: 0,
    pageSize,
    total: adminWorkspaceDirectoryPreviews.length,
    onQueryChange: fn<AdminWorkspaceDirectoryViewProps['onQueryChange']>(),
    onPlanChange: fn<AdminWorkspaceDirectoryViewProps['onPlanChange']>(),
    onStatusChange: fn<AdminWorkspaceDirectoryViewProps['onStatusChange']>(),
    onPageChange: fn<AdminWorkspaceDirectoryViewProps['onPageChange']>(),
    onSelect: fn<NonNullable<AdminWorkspaceDirectoryViewProps['onSelect']>>(),
  },
} satisfies Meta<typeof AdminWorkspaceDirectoryView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WorkspaceDirectoryViewStory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title })).toBeVisible();
    await expect(canvas.getByText('Northside Plumbing')).toBeVisible();
    await expect(canvas.getByText(adminWorkspaceDirectoryPreviews[0].maskedOwnerEmail)).toBeVisible();
    await expect(canvas.getByText(copy.results(1, pageSize, adminWorkspaceDirectoryPreviews.length))).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.previous })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: copy.next })).toBeEnabled();
    await expect(canvas.getByText(copy.previewNotice)).toBeVisible();
    await expect(canvas.queryByText(adminWorkspaceDirectoryPreviews[0].ownerEmail)).not.toBeInTheDocument();
  },
};

export const WorkspaceDirectory: Story = {
  render: () => <AdminWorkspaceDirectoryPage initialDirectory={{
    workspaces: adminWorkspaceDirectoryPreviews.map(({
      id, name, ownerName, maskedOwnerEmail, plan, overridePlan, status, memberCount, createdAt,
    }) => ({ id, name, ownerName, maskedOwnerEmail, plan, overridePlan, status, memberCount, createdAt })),
    total: adminWorkspaceDirectoryPreviews.length,
    page: 0,
    pageSize: 20,
  }} preview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.previewNotice)).toBeVisible();
    await expect(canvas.getByText(adminWorkspaceDirectoryPreviews[0].maskedOwnerEmail)).toBeVisible();
    await expect(canvas.queryByText(adminWorkspaceDirectoryPreviews[0].ownerEmail)).not.toBeInTheDocument();
    await expect(canvas.getByText('Northside Plumbing')).toBeVisible();
  },
};

export const SearchAndChooseStatus: Story = {
  render: args => <FilterPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: copy.search });
    await userEvent.type(search, 'brightlineelectric.example');
    await expect(search).toHaveValue('brightlineelectric.example');
    await expect(canvas.getByText('Brightline Electric')).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: copy.statuses.suspended }));
    await expect(args.onStatusChange).toHaveBeenLastCalledWith('suspended');
    await expect(canvas.getByRole('tab', { name: copy.statuses.suspended })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'workspace-status-tab-suspended');
  },
};

export const NavigateStatusTabsWithKeyboard: Story = {
  render: args => <FilterPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const activeTab = canvas.getByRole('tab', { name: copy.statuses.active });
    activeTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: copy.statuses.past_due })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: copy.statuses.past_due })).toHaveAttribute('aria-selected', 'true');
    await expect(args.onStatusChange).toHaveBeenLastCalledWith('past_due');
  },
};

export const FilterByPlanAndOverride: Story = {
  render: args => <FilterPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.planFilter }), 'override');
    await expect(canvas.getByText('Summit HVAC')).toBeVisible();
    await expect(canvas.getByText(`${copy.override}: ${copy.plans.premium}`)).toBeVisible();
    await expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible();
  },
};

export const OpenWorkspace: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Northside Plumbing/ }));
    await expect(args.onSelect).toHaveBeenCalledWith(adminWorkspaceDirectoryPreviews[0].id);
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
  args: { workspaces: [], total: 0, query: 'not-found' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.emptyTitle })).toBeVisible();
    await expect(canvas.getByText(copy.emptyDescription)).toBeVisible();
  },
};

export const Loading: Story = {
  args: { loading: true, workspaces: [], total: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.loading, { exact: true })).toBeVisible();
  },
};

export const LoadError: Story = {
  args: { error: copy.loadFailed, workspaces: [], total: 0, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.loadFailed);
    await userEvent.click(canvas.getByRole('button', { name: copy.retry }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

function FilterPreview(args: AdminWorkspaceDirectoryViewProps) {
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<AdminWorkspaceDirectoryViewProps['plan']>('all');
  const [status, setStatus] = useState<AdminWorkspaceDirectoryViewProps['status']>('all');
  const [page, setPage] = useState(0);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = adminWorkspaceDirectoryPreviews.filter(workspace => {
    const matchesQuery = normalizedQuery.length === 0 || [
      workspace.name,
      workspace.id,
      workspace.ownerName,
      workspace.ownerEmail,
    ].some(value => value.toLocaleLowerCase().includes(normalizedQuery));
    const matchesPlan = plan === 'all'
      || (plan === 'override' ? Boolean(workspace.overridePlan) : (workspace.overridePlan ?? workspace.plan) === plan);
    const matchesStatus = status === 'all' || workspace.status === status;
    return matchesQuery && matchesPlan && matchesStatus;
  });
  const pages = Math.ceil(filtered.length / args.pageSize);
  const activePage = Math.min(page, Math.max(0, pages - 1));
  const visible = filtered.slice(activePage * args.pageSize, (activePage + 1) * args.pageSize);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(0);
    args.onQueryChange(value);
  }

  function changePlan(value: AdminWorkspaceDirectoryViewProps['plan']) {
    setPlan(value);
    setPage(0);
    args.onPlanChange(value);
  }

  function changeStatus(value: AdminWorkspaceDirectoryViewProps['status']) {
    setStatus(value);
    setPage(0);
    args.onStatusChange(value);
  }

  function changePage(value: number) {
    setPage(value);
    args.onPageChange(value);
  }

  return <AdminWorkspaceDirectoryView {...args} workspaces={visible} query={query} plan={plan} status={status}
    page={activePage} total={filtered.length} onQueryChange={changeQuery} onPlanChange={changePlan}
    onStatusChange={changeStatus} onPageChange={changePage} />;
}
