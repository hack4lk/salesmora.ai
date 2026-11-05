import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminSignIn } from './admin-sign-in';

const meta = {
  title: 'Admin/Authentication/AdminSignIn',
  component: AdminSignIn,
  args: { accessEmail: 'admin@karpukcreative.com' },
  decorators: [Story => <AdminFrame environment="local"><Story /></AdminFrame>],
} satisfies Meta<typeof AdminSignIn>;

export default meta;
type Story = StoryObj<typeof meta>;

async function showFactorChoices(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const originalFetch = window.fetch;
  window.fetch = async () => new Response(JSON.stringify({
    twoFactorRedirect: true,
    twoFactorMethods: ['passkey', 'totp', 'backup'],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
  try {
    fireEvent.change(canvas.getByLabelText('Password'), { target: { value: 'a-valid-password' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByRole('heading', { name: 'Confirm with your passkey' })).toBeVisible();
  } finally {
    window.fetch = originalFetch;
  }
  return canvas;
}

export const Password: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Sign in to Admin' })).toBeVisible();
    await expect(canvas.getByLabelText('Staff email')).toHaveValue('admin@karpukcreative.com');
    await expect(canvas.getByLabelText('Staff email')).toHaveAttribute('readonly');
    await expect(canvas.getByLabelText('Password')).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
    fireEvent.change(canvas.getByLabelText('Password'), { target: { value: 'a-valid-password' } });
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
  },
};

export const PasswordResetGuidance: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Forgot password?' }));
    await expect(canvas.getByRole('heading', { name: 'Reset your Admin password' })).toBeVisible();
    await expect(canvas.getByText(/Admin passwords are not reset by email/)).toBeVisible();
    await expect(canvas.getByText(/bootstrap recovery runbook/)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Back to sign-in' }));
    await expect(canvas.getByRole('heading', { name: 'Sign in to Admin' })).toBeVisible();
  },
};

export const PasswordThenChooseFactor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await showFactorChoices(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Use passkey' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Use authenticator app code instead' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Use a recovery code' })).toBeVisible();
  },
};

export const AuthenticatorCode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await showFactorChoices(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Use authenticator app code instead' }));
    await expect(canvas.getByRole('heading', { name: 'Enter authenticator code' })).toBeVisible();
    await expect(canvas.getByLabelText('6-digit code')).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Verify' })).toBeDisabled();
  },
};

export const RecoveryCode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await showFactorChoices(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Use a recovery code' }));
    await expect(canvas.getByRole('heading', { name: 'Use a recovery code' })).toBeVisible();
    await expect(canvas.getByLabelText('Recovery code')).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Verify recovery code' })).toBeDisabled();
  },
};

export const InvalidPassword: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const originalFetch = window.fetch;
    window.fetch = async () => new Response(JSON.stringify({ message: 'Invalid credentials.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
    try {
      fireEvent.change(canvas.getByLabelText('Password'), { target: { value: 'incorrect-password' } });
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
      await expect(canvas.getByRole('alert')).toHaveTextContent(
        'Sign-in could not be completed. Check your credentials or contact another Super Admin.',
      );
    } finally {
      window.fetch = originalFetch;
    }
  },
};

export const AccessIdentityUnavailable: Story = {
  args: { accessEmail: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Admin access required' })).toBeVisible();
    await expect(canvas.queryByLabelText('Password')).not.toBeInTheDocument();
  },
};
