import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AdminFrame } from './admin-frame';

const meta = {
  title: 'Admin/Foundation/AdminFrame',
  component: AdminFrame,
  args: { environment: 'local' },
} satisfies Meta<typeof AdminFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LocalDevelopment: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Local development');
    await expect(canvas.getByRole('heading', { name: 'Admin authentication is being set up' })).toBeVisible();
    await expect(canvas.getByRole('navigation', { name: 'Admin' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/users');
    await expect(canvas.getByRole('link', { name: 'Data requests' })).toHaveAttribute('href', '/data-requests');
    await expect(canvas.getByRole('link', { name: 'Queues and delivery' })).toHaveAttribute('href', '/operations');
    await expect(canvas.getByRole('link', { name: 'Platform settings' })).toHaveAttribute('href', '/settings');
    await expect(canvas.getByRole('link', { name: 'System rollout flags' })).toHaveAttribute('href', '/rollout-flags');
  },
};
export const Staging: Story = {
  args: { environment: 'staging' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Staging environment');
  },
};
export const Production: Story = {
  args: { environment: 'production' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Production environment');
  },
};

export const AuthenticationLayout: Story = {
  args: { showNavigation: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('navigation', { name: 'Admin' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'SalesMora.ai' })).toBeVisible();
  },
};

export const SignOutFailure: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fn(async () => new Response('{}', { status: 503 }));
    return () => { globalThis.fetch = originalFetch; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Sign out' }));
    await expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/sign-out', expect.objectContaining({
      method: 'POST', body: '{}', cache: 'no-store', redirect: 'error',
    }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('Your session may still be active');
    await expect(canvas.getByRole('button', { name: 'Sign out' })).toBeEnabled();
  },
};

export const SigningOut: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fn(() => new Promise<Response>(() => {}));
    return () => { globalThis.fetch = originalFetch; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Sign out' }));
    await expect(canvas.getByRole('button', { name: 'Signing out...' })).toBeDisabled();
  },
};
