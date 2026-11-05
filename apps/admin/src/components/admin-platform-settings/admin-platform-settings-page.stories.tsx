import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import type { AdminPlatformSettingsResponse } from '@salesmora/contracts';
import { AdminPlatformSettingsPage } from './admin-platform-settings-page';

const token = 's'.repeat(43);
let startBody: Record<string, unknown> | null = null;

function mock() {
  const original = window.fetch;
  startBody = null;
  window.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown> & { operation: string };
    if (body.operation === 'start') {
      startBody = body;
      return Response.json({
        token,
        options: {
          challenge: 'storybook-platform-settings',
          userVerification: 'required',
          allowCredentials: [],
        },
      });
    }
    if (body.operation === 'factor') return Response.json({ verified: true });
    if (body.operation === 'commit') {
      return Response.json({ changed: true, version: 1, monthlyTokens: startBody?.monthlyTokens });
    }
    return Response.json({ error: 'Platform setting verification expired.' }, { status: 409 });
  };
  return () => { window.fetch = original; };
}

const settings: AdminPlatformSettingsResponse = {
  defaultMonthlyAITokens: 5_000_000,
  source: 'environment',
  version: 0,
  methods: ['totp'],
  history: [],
};

const meta = {
  title: 'Admin/Platform/PlatformSettings',
  component: AdminPlatformSettingsPage,
  decorators: [Story => <AdminFrame environment="local" activeHref="/settings" contentWidth="wide"><Story /></AdminFrame>],
  args: { settings },
} satisfies Meta<typeof AdminPlatformSettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnvironmentDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Platform settings' })).toBeVisible();
    await expect(canvas.getByText('5,000,000 tokens')).toBeVisible();
    await expect(canvas.getByText(/environment-configured default/)).toBeVisible();
    await expect(canvas.getByText(/workspace has no explicit budget or plan allowance/)).toBeVisible();
  },
};

export const ChangeDefaultWithStepUp: Story = {
  beforeEach: mock,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Change default allowance' }));
    fireEvent.change(canvas.getByRole('textbox', { name: 'Monthly tokens per workspace' }), {
      target: { value: '6000000' },
    });
    fireEvent.change(canvas.getByRole('textbox', { name: 'Reason for this change' }), {
      target: { value: 'Adjust default for the approved launch cohort' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to verification' }));
    await waitFor(() => expect(canvas.getByRole('region', { name: 'Verify platform setting change' })).toBeVisible());
    fireEvent.change(canvas.getByRole('textbox', { name: 'Six-digit authenticator code' }), {
      target: { value: '123456' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Verify and save' }));
    await waitFor(() => expect(canvas.getByText('The default allowance is now 6,000,000 tokens per workspace per month.')).toBeVisible());
    expect(startBody).toMatchObject({
      operation: 'start',
      monthlyTokens: 6_000_000,
      expectedVersion: 0,
      reason: 'Adjust default for the approved launch cohort',
    });
  },
};
