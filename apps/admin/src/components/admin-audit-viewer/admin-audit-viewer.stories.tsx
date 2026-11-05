import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminAuditViewerView, type AdminAuditViewerViewProps } from './admin-audit-viewer';
import { adminAuditViewerData as copy, auditPreviewEvents } from './admin-audit-viewer.data';

const meta = {
  title: 'Admin/Audit/AdminAuditViewer/View',
  component: AdminAuditViewerView,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    events: auditPreviewEvents, now: copy.stories.now,
    onVerify: fn<AdminAuditViewerViewProps['onVerify']>(async () => ({ state: 'intact', checked: auditPreviewEvents.length, checkedAt: copy.stories.now })),
  },
} satisfies Meta<typeof AdminAuditViewerView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LastSevenDays: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: copy.range })).toHaveValue('week');
    await expect(canvas.getByText(copy.results(1, 5, 10))).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.export })).toBeDisabled();
    await expect(canvas.getByText(copy.unchecked)).toBeVisible();
  },
};
export const EventDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: `${copy.show}: audit-demo-11` }));
    const detail = within(canvas.getByRole('region', { name: `${copy.detail}: audit-demo-11` }));
    await expect(detail.getByText('2001:db8:85a3:0000:0000:8a2e:0370:7334')).toBeVisible();
    await expect(detail.getByText(copy.stories.passwordAgent)).toBeVisible();
    await expect(detail.getByText(/"role": "support"/)).toBeVisible();
    await expect(detail.getByText(/"role": "billing"/)).toBeVisible();
    await expect(detail.getByText(auditPreviewEvents[1].hash)).toBeVisible();
  },
};
export const FilterByStaffAndAction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.actor }), 'staff-jordan');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.category }), 'staff');
    await expect(canvas.getByText(copy.results(1, 2, 2))).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(canvas.getByText(copy.results(1, 5, 10))).toBeVisible();
  },
};
export const SearchRequestId: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /Search events/ }), 'request-demo-10');
    await expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible();
    await expect(canvas.getByText('staff.super_admin.approved')).toBeVisible();
  },
};
export const TargetHistory: Story = {
  args: { initialQuery: 'staff-taylor' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.results(1, 3, 3))).toBeVisible();
    await expect(canvas.getByText('staff.account.disabled')).toBeVisible();
    await expect(canvas.getByText('staff.account.enabled')).toBeVisible();
    await expect(canvas.getByText('staff.account.role_changed')).toBeVisible();
  },
};
export const FilterFromEventDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: `${copy.show}: audit-demo-12` }));
    await userEvent.click(canvas.getByRole('button', { name: copy.onlyTarget }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('textbox', { name: /Search events/ })).toHaveValue('staff-taylor');
    await expect(canvas.getByText(copy.results(1, 3, 3))).toBeVisible();
  },
};
export const DetailsKeyboardClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: `${copy.show}: audit-demo-12` });
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const SystemEvents: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.actor }), 'system');
    await expect(canvas.getByText(copy.results(1, 2, 2))).toBeVisible();
    await expect(canvas.getByText('auth.sign_in.refused')).toBeVisible();
    await expect(canvas.getByText('audit.r2_export.failed')).toBeVisible();
  },
};
export const ViewAsPageViews: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.category }), 'viewas');
    await expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible();
    await expect(canvas.getByText('impersonation.page_view')).toBeVisible();
  },
};
export const DateRangeAndPagination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.next }));
    await expect(canvas.getByText(copy.results(6, 10, 10))).toBeVisible();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.range }), 'month');
    await expect(canvas.getByText(copy.results(1, 5, 11))).toBeVisible();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.range }), 'year');
    await userEvent.click(canvas.getByRole('button', { name: copy.next }));
    await userEvent.click(canvas.getByRole('button', { name: copy.next }));
    await expect(canvas.getByText(copy.results(11, 12, 12))).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.next })).toBeDisabled();
  },
};
export const ExactSevenDayBoundary: Story = {
  args: { events: [
    { ...auditPreviewEvents[0], id: 'boundary-included', occurredAt: '2026-10-23T16:00:00.000Z' },
    { ...auditPreviewEvents[1], id: 'boundary-excluded', occurredAt: '2026-10-23T15:59:59.999Z' },
    { ...auditPreviewEvents[2], id: 'future-excluded', occurredAt: '2026-10-30T16:00:00.001Z' },
  ] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible();
    await expect(canvas.getByRole('button', { name: `${copy.show}: boundary-included` })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: `${copy.show}: boundary-excluded` })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: `${copy.show}: future-excluded` })).not.toBeInTheDocument();
  },
};
export const Empty: Story = { args: { events: [] } };
export const NoMatches: Story = { args: { initialQuery: 'no-matching-event' } };
export const Loading: Story = { args: { loading: true } };
export const LoadError: Story = { args: { error: copy.loadFailed, onRetry: fn(async () => { throw new Error(copy.stories.failed); }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.retry }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.failed);
  },
};
function RetryPreview(args: AdminAuditViewerViewProps) {
  const [error, setError] = useState<string | undefined>(copy.loadFailed);
  return <AdminAuditViewerView {...args} error={error} onRetry={async () => setError(undefined)} />;
}
export const RetrySucceeded: Story = {
  render: args => <RetryPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.retry }));
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument());
    await expect(canvas.getByText(copy.results(1, 5, 10))).toBeVisible();
  },
};
export const ChainVerified: Story = {
  args: { initialQuery: 'no-matching-event' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.verify }));
    await expect(canvas.getByText(copy.intact)).toBeVisible();
    await expect(canvas.getByText(new RegExp(`${copy.checked}: ${auditPreviewEvents.length}`))).toBeVisible();
    await expect(args.onVerify).toHaveBeenCalledTimes(1);
  },
};
export const ChainBroken: Story = { args: { initialChain: { state: 'broken', checked: 5, sequence: '8' } } };
export const ChainVerificationFailed: Story = {
  args: { onVerify: fn<AdminAuditViewerViewProps['onVerify']>(async () => { throw new Error(copy.verificationFailed); }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.verify }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.verificationFailed);
    await expect(canvas.getByRole('button', { name: copy.verify })).toBeEnabled();
  },
};
export const ChainVerifying: Story = {
  args: { onVerify: fn<AdminAuditViewerViewProps['onVerify']>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.verify }));
    await expect(canvas.getByRole('button', { name: copy.verifying })).toBeDisabled();
    await expect(args.onVerify).toHaveBeenCalledTimes(1);
  },
};
export const SupportDenied: Story = {
  args: { reviewerRole: 'support' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.denied);
    await expect(canvas.queryByText(auditPreviewEvents[0].action)).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: copy.verify })).not.toBeInTheDocument();
    await expect(args.onVerify).not.toHaveBeenCalled();
  },
};
export const BillingDenied: Story = { ...SupportDenied, args: { reviewerRole: 'billing' } };
export const WorkspaceHistory: Story = {
  args: { initialQuery: 'ws_demo_001' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.results(1, 3, 3))).toBeVisible();
    await expect(canvas.getByText('impersonation.page_view')).toBeVisible();
    await expect(canvas.getByText('user.suspended')).toBeVisible();
    await expect(canvas.getByText('workspace.suspended')).toBeVisible();
  },
};
export const Today: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.range }), 'today');
    await expect(canvas.getByText(copy.results(1, 2, 2))).toBeVisible();
  },
};
