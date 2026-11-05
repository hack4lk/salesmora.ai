import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import {
  adminWorkspaceDetailPreviews,
  adminWorkspaceDetailPreviewCopy as copy,
} from './admin-workspace-detail-preview.data';
import { AdminWorkspaceDetailView } from './admin-workspace-detail';

const meta = {
  title: 'Admin/Customers/AdminWorkspaceDetail',
  component: AdminWorkspaceDetailView,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    detail: adminWorkspaceDetailPreviews.active,
    onBack: fn(),
    onSelectUser: fn(),
  },
} satisfies Meta<typeof AdminWorkspaceDetailView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WorkspaceDetail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.sections.usage })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.sections.members })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.sections.records })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.sections.plan })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.sections.audit })).toBeVisible();
    await expect(canvas.getByText(/ow••••@northsideplumbing\.example/)).toBeVisible();
    await expect(canvas.queryByText('owner@northsideplumbing.example')).not.toBeInTheDocument();
    await expect(canvas.getByText(copy.notice)).toBeVisible();
    await expect(canvas.getByRole('progressbar', { name: copy.fields.leads })).toHaveAttribute('aria-valuenow', '41');
  },
};

export const PlanOverrideAndCounts: Story = {
  args: { detail: adminWorkspaceDetailPreviews.override },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Plan override: Premium until Nov 30, 2026. Stripe continues billing the original subscription plan.')).toBeVisible();
    await expect(canvas.getByText('Standard', { exact: true })).toBeVisible();
    await expect(canvas.getByText('1,406')).toBeVisible();
    await expect(canvas.getByText('Campaigns v2 (pilot)')).toBeVisible();
    await expect(canvas.getByText('9 of 20 seats')).toBeVisible();
  },
};

export const PastDueStatus: Story = {
  args: { detail: adminWorkspaceDetailPreviews.pastDue },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.statusLabel('past_due'), { exact: true })).toBeVisible();
    await expect(canvas.getByText('Past due, in recovery')).toBeVisible();
    await expect(canvas.getByText('Premium features remain available while this subscription is in its payment-recovery period.')).toBeVisible();
  },
};

export const SuspendedStatus: Story = {
  args: { detail: adminWorkspaceDetailPreviews.suspended },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Suspended Oct 26 at 3:14 PM by Alex Rivera. Reason: chargeback fraud; 6 disputed payments (ticket #4790).')).toBeVisible();
    await expect(canvas.getByText('suspended the workspace')).toBeVisible();
  },
};

export const DeletionPendingStatus: Story = {
  args: { detail: adminWorkspaceDetailPreviews.deleting },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.statusLabel('deleting'), { exact: true })).toBeVisible();
    await expect(canvas.getByText('Deletion requested Oct 3 by the Owner. Due Nov 1 under the 30-day SLA. Workspace changes are on hold.')).toBeVisible();
    await expect(canvas.getByText(copy.noAudit)).toBeVisible();
  },
};

export const OnboardingInProgress: Story = {
  args: { detail: adminWorkspaceDetailPreviews.onboarding },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('In progress (3 of 5 steps)')).toBeVisible();
    await expect(canvas.getByText(copy.noFlags)).toBeVisible();
    await expect(canvas.getByRole('progressbar', { name: copy.fields.leads })).toHaveAttribute('aria-valuenow', '3');
  },
};

export const ReturnToDirectory: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: copy.back }));
    await expect(args.onBack).toHaveBeenCalledOnce();
  },
};

export const OpenOwnerProfile: Story = {
  play: async ({ canvasElement, args }) => {
    const overview = within(canvasElement).getByRole('region', { name: /Northside Plumbing/ });
    await userEvent.click(within(overview).getByRole('button', { name: 'Maria Owens' }));
    await expect(args.onSelectUser).toHaveBeenCalledWith(adminWorkspaceDetailPreviews.active.ownerUserId);
  },
};
