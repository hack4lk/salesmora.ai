import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import type { AdminFeatureFlagResponse } from '@salesmora/contracts';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminFeatureFlagsPage } from './admin-feature-flags-page';

const token = 'f'.repeat(43);
let startBody: Record<string, unknown> | null = null;

const flags: AdminFeatureFlagResponse = {
  methods: ['totp'],
  flags: [
    {
      id: 'chat.enabled',
      label: 'AI chat',
      description: 'Allows workspace members to use the AI assistant in the application.',
      owner: 'Product',
      environmentVariable: 'CHAT_ENABLED',
      defaultEnabled: true,
      global: { enabled: true, expiresAt: null, updatedAt: null, updatedBy: null },
      overrides: [],
    },
    {
      id: 'estimate.sharing.enabled',
      label: 'Estimate sharing',
      description: 'Allows workspaces to share estimates with customers.',
      owner: 'Product',
      environmentVariable: 'ESTIMATE_EMAIL_ENABLED',
      defaultEnabled: true,
      global: { enabled: true, expiresAt: null, updatedAt: null, updatedBy: null },
      overrides: [{
        target: { type: 'plan', planId: 'free' },
        enabled: false,
        expiresAt: null,
        updatedAt: '2026-11-02T12:00:00.000Z',
        updatedBy: 'Admin Operator',
      }],
    },
  ],
  history: [],
};

function mock() {
  const original = window.fetch;
  startBody = null;
  window.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown> & { operation: string };
    if (body.operation === 'start') {
      startBody = body;
      return Response.json({
        token,
        options: { challenge: 'storybook-feature-flags', userVerification: 'required', allowCredentials: [] },
      });
    }
    if (body.operation === 'factor') return Response.json({ verified: true });
    if (body.operation === 'commit') {
      const start = startBody!;
      return Response.json({
        changed: true,
        flagId: start.flagId,
        target: start.target,
        enabled: start.enabled,
      });
    }
    return Response.json({ error: 'Feature flag verification expired.' }, { status: 409 });
  };
  return () => { window.fetch = original; };
}

const meta = {
  title: 'Admin/Platform/FeatureFlags',
  component: AdminFeatureFlagsPage,
  decorators: [Story => <AdminFrame environment="local" activeHref="/flags" contentWidth="wide"><Story /></AdminFrame>],
  args: { flags },
} satisfies Meta<typeof AdminFeatureFlagsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CatalogAndOverrides: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Feature flags' })).toBeVisible();
    await expect(canvas.getByText('Environment ceiling: CHAT_ENABLED=true')).toBeVisible();
    await expect(canvas.getByText('Plan · free · Disabled')).toBeVisible();
    await expect(canvas.getByText(/Environment variables remain hard-off ceilings/)).toBeVisible();
  },
};

export const ChangePlanOverrideWithStepUp: Story = {
  beforeEach: mock,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Change Estimate sharing' }));
    fireEvent.change(canvas.getByRole('combobox', { name: 'Target scope' }), { target: { value: 'plan' } });
    fireEvent.change(canvas.getByRole('combobox', { name: 'Plan' }), { target: { value: 'premium' } });
    fireEvent.change(canvas.getByRole('combobox', { name: 'Result' }), { target: { value: 'disabled' } });
    fireEvent.change(canvas.getByRole('textbox', { name: 'Reason (10–500 characters)' }), {
      target: { value: 'Pause estimate sharing for premium plan QA' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to verification' }));
    await waitFor(() => expect(canvas.getByRole('region', { name: 'Verify feature flag change' })).toBeVisible());
    fireEvent.change(canvas.getByRole('textbox', { name: 'Six-digit authenticator code' }), {
      target: { value: '123456' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Verify and save' }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Estimate sharing: disabled.'));
    expect(startBody).toMatchObject({
      operation: 'start',
      flagId: 'estimate.sharing.enabled',
      target: { type: 'plan', planId: 'premium' },
      enabled: false,
      reason: 'Pause estimate sharing for premium plan QA',
    });
  },
};
