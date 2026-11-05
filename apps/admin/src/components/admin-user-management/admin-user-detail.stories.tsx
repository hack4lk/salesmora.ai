import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminUserDetail } from './admin-user-detail';
import {
  adminCustomerUserPreviews,
  adminUserDetailSupplementalEmptyPreview,
  adminUserDetailSupplementalPreview,
  adminUserManagementData as copy,
} from './admin-user-management.data';

const meta = {
  title: 'Admin/Customers/AdminUserDetail',
  component: AdminUserDetail,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: { user: adminCustomerUserPreviews[0], onBack: fn() },
} satisfies Meta<typeof AdminUserDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileAndMemberships: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Jordan Lee' })).toBeVisible();
    await expect(canvas.getByText(adminCustomerUserPreviews[0].maskedEmail)).toBeVisible();
    await expect(canvas.getByText('Northstar Home Services')).toBeVisible();
    await expect(canvas.getByText('Northstar Field Team')).toBeVisible();
    await expect(canvas.getByText(copy.statusLabel('active'))).toBeVisible();
    await expect(canvas.getByText(copy.privacyNotice)).toBeVisible();
  },
};

export const EmptyMemberships: Story = {
  args: { user: adminCustomerUserPreviews[2] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.noWorkspaces)).toBeVisible();
  },
};

export const DeletionPendingProfile: Story = {
  args: { user: adminCustomerUserPreviews[4] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Avery Chen' })).toBeVisible();
    await expect(canvas.getByText('Avery Chen Services')).toBeVisible();
    await expect(canvas.getByText(copy.statusLabel('deletion_pending'))).toBeVisible();
  },
};

export const SupplementalReadOnlyDetails: Story = {
  args: { supplemental: adminUserDetailSupplementalPreview },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.authMethods })).toBeVisible();
    await expect(canvas.getByText('Password')).toBeVisible();
    await expect(canvas.getByText('Google')).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.sessions })).toBeVisible();
    await expect(canvas.getByText('Chrome on macOS')).toBeVisible();
    await expect(canvas.getByText('73.162.x.x')).toBeVisible();
    await expect(canvas.getByText(copy.sessionsShown(2, 2))).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.notificationPreferences })).toBeVisible();
    await expect(canvas.getByText(copy.notificationPreferenceLabels.deadlineReminderEmail)).toBeVisible();
    await expect(canvas.getByText(copy.disabled)).toBeVisible();
  },
};

export const EmptySupplementalDetails: Story = {
  args: {
    user: adminCustomerUserPreviews[2],
    supplemental: adminUserDetailSupplementalEmptyPreview,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.noAuthMethods)).toBeVisible();
    await expect(canvas.getByText(copy.noSessions)).toBeVisible();
    await expect(canvas.getByText(copy.defaultNotificationPreferences)).toBeVisible();
  },
};

export const Loading: Story = {
  args: { user: undefined, loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.loadingDetail);
  },
};

export const LoadError: Story = {
  args: { user: undefined, error: 'The fictional profile could not be loaded.', onRetry: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('The fictional profile could not be loaded.');
    await expect(canvas.getByRole('button', { name: copy.retry })).toBeVisible();
  },
};
