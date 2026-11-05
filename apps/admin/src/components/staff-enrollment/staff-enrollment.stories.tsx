import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { StaffEnrollment } from './staff-enrollment';

const meta = {
  title: 'Admin/Staff/StaffEnrollment',
  component: StaffEnrollment,
  args: {
    accessEmail: 'admin@karpukcreative.com',
    token: 'storybook-invitation-token',
  },
  decorators: [Story => <AdminFrame environment="local"><Story /></AdminFrame>],
} satisfies Meta<typeof StaffEnrollment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnrollmentDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Set up your Admin account' })).toBeVisible();
    await expect(canvas.getByText('admin@karpukcreative.com')).toBeVisible();
    await expect(canvas.getByLabelText('Your name')).toBeVisible();
    await expect(canvas.getByLabelText('Create a password')).toHaveAttribute('minlength', '14');
    await expect(canvas.getByRole('button', { name: 'Continue to factor setup' })).toBeEnabled();

    await userEvent.click(canvas.getByRole('radio', { name: 'Authenticator app' }));
    await expect(canvas.getByRole('radio', { name: 'Authenticator app' })).toBeChecked();
  },
};

export const InvitationRequired: Story = {
  args: { token: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Continue to factor setup' })).toBeDisabled();
  },
};
