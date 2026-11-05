import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import type { AdminRolloutFlag } from '@salesmora/contracts';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminRolloutFlagsPage } from './admin-rollout-flags-page';

const initialFlags: AdminRolloutFlag[] = [
  { key: 'new_dashboard', description: 'Release the redesigned customer dashboard.', enabled: false },
  { key: 'calendar_export', description: 'Allow calendar export across the system.', enabled: true },
];

function mockApi(fail = false) {
  const original = window.fetch;
  let flags = initialFlags.map(flag => ({ ...flag }));
  window.fetch = async (input, init) => {
    if (input !== '/api/admin/rollout-flags') return original(input, init);
    if (fail) return Response.json({ error: 'Your Admin session expired. Sign in again.' }, { status: 401 });
    const body = JSON.parse(String(init?.body)) as {
      operation: 'create' | 'update' | 'delete'; flag: AdminRolloutFlag; originalKey: string; key: string;
    };
    if (body.operation === 'create') {
      if (flags.some(flag => flag.key === body.flag.key)) {
        return Response.json({ error: 'A flag with this key already exists.' }, { status: 409 });
      }
      flags = [...flags, body.flag];
    } else if (body.operation === 'update') {
      flags = flags.map(flag => flag.key === body.originalKey ? body.flag : flag);
    } else flags = flags.filter(flag => flag.key !== body.key);
    return Response.json({ flags });
  };
  return () => { window.fetch = original; };
}

const meta = {
  title: 'Admin/Platform/SystemRolloutFlags',
  component: AdminRolloutFlagsPage,
  decorators: [Story => <AdminFrame environment="local" activeHref="/rollout-flags" contentWidth="wide"><Story /></AdminFrame>],
  args: { initialFlags },
  beforeEach: () => mockApi(),
} satisfies Meta<typeof AdminRolloutFlagsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TableAndToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Enable new_dashboard' });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'true'));
    await expect(canvas.getByText('new_dashboard: enabled.')).toBeVisible();
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'false'));
  },
};

export const CreateEditDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Create flag' }));
    await expect(canvas.getByRole('checkbox', { name: 'Enabled' })).not.toBeChecked();
    fireEvent.change(canvas.getByRole('textbox', { name: 'Flag key / value' }), { target: { value: 'job_reports' } });
    fireEvent.change(canvas.getByRole('textbox', { name: 'Short description' }), { target: { value: 'Release job reports.' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Save flag' }));
    await waitFor(() => expect(canvas.getByText('job_reports: created.')).toBeVisible());
    await expect(canvas.getByRole('switch', { name: 'Enable job_reports' })).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Edit job_reports' }));
    fireEvent.change(canvas.getByRole('textbox', { name: 'Short description' }), { target: { value: 'Release updated job reports.' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Save flag' }));
    await waitFor(() => expect(canvas.getByText('Release updated job reports.')).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: 'Delete job_reports' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByRole('switch', { name: 'Enable job_reports' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Delete job_reports' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Confirm delete' }));
    await waitFor(() => expect(canvas.queryByRole('switch', { name: 'Enable job_reports' })).not.toBeInTheDocument());
  },
};

export const Validation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Create flag' }));
    fireEvent.change(canvas.getByRole('textbox', { name: 'Flag key / value' }), { target: { value: 'new_dashboard' } });
    fireEvent.change(canvas.getByRole('textbox', { name: 'Short description' }), { target: { value: 'Duplicate flag.' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Save flag' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('A flag with this key already exists.');
    fireEvent.change(canvas.getByRole('textbox', { name: 'Flag key / value' }), { target: { value: 'Invalid key!' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Save flag' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('Use a lowercase key');
  },
};

export const FailedToggle: Story = {
  beforeEach: () => mockApi(true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('switch', { name: 'Enable new_dashboard' }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('Your Admin session expired.'));
    await expect(canvas.getByRole('switch', { name: 'Enable new_dashboard' })).toHaveAttribute('aria-checked', 'false');
  },
};

export const Empty: Story = { args: { initialFlags: [] } };
export const ReadOnly: Story = {
  args: { canManage: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Create flag' })).toBeDisabled();
    await expect(canvas.getByRole('switch', { name: 'Enable new_dashboard' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Delete new_dashboard' })).toBeDisabled();
  },
};
