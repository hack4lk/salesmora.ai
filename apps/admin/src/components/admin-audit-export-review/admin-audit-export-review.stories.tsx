import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { BrandProvider } from '@salesmora/ui';
import { AdminFrame } from '../admin-frame/admin-frame';
import type { StaffVerificationResult } from '../staff-action-review/staff-action-review';
import { AdminAuditExportReview, type AdminAuditExportReviewProps } from './admin-audit-export-review';
import { adminAuditExportReviewData as copy } from './admin-audit-export-review.data';

function Preview(args: AdminAuditExportReviewProps) {
  const [open, setOpen] = useState(true);
  const [complete, setComplete] = useState(false);
  return <BrandProvider><AdminFrame environment="local" contentWidth="wide">
    <h1 id="admin-title">{copy.stories.title}</h1><p>{copy.stories.description}</p>
    <button type="button" className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-paper focus-visible:focus-ring"
      onClick={() => { setComplete(false); setOpen(true); }}>{copy.stories.open}</button>
    {complete && <p role="status" className="mt-5 text-sm text-success">{copy.stories.completed}</p>}
    {open && <AdminAuditExportReview {...args} onClose={() => { args.onClose(); setOpen(false); }} onConfirm={async input => {
      const result = await args.onConfirm(input);
      if (result.ok) setComplete(true);
      return result;
    }} />}
  </AdminFrame></BrandProvider>;
}

function ChangingSnapshotPreview(args: AdminAuditExportReviewProps) {
  const [snapshot, setSnapshot] = useState(args.snapshot);
  return <Preview {...args} snapshot={snapshot} onVerifyPassword={async (password, input) => {
    const result = await args.onVerifyPassword(password, input);
    setSnapshot({ ...snapshot, count: snapshot.count + 1 });
    return result;
  }} />;
}

const success = async (): Promise<StaffVerificationResult> => ({ ok: true });
const meta = {
  title: 'Admin/Audit/AdminAuditExportReview',
  component: Preview,
  parameters: { layout: 'fullscreen' },
  args: {
    snapshot: { filters: { query: '', actor: '', category: 'all', range: 'week' }, count: 1212,
      asOf: copy.stories.now, throughSequence: '2418' },
    reviewerRole: 'super_admin', methods: ['passkey', 'totp'],
    onVerifyPassword: fn(success), onVerifyFactor: fn(success), onConfirm: fn(success), onClose: fn(),
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = ReturnType<typeof within>;

async function enterReason(canvas: Canvas) {
  await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
  await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.reason }), copy.stories.reason);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.review }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.password })).toBeVisible());
}
async function verifyPassword(canvas: Canvas) {
  await enterReason(canvas);
  await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.password }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.factor })).toBeVisible());
}
async function verifyPasskey(canvas: Canvas) {
  await verifyPassword(canvas);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.passkey }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.confirm })).toBeVisible());
}
async function blocked(canvas: Canvas, message: string) {
  await expect(canvas.getByRole('alert')).toHaveTextContent(message);
  await expect(canvas.getByRole('button', { name: copy.buttons.review })).toBeDisabled();
  await expect(canvas.queryByRole('textbox', { name: copy.labels.reason })).not.toBeInTheDocument();
}

export const ExportScope: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('button', { name: copy.buttons.review })).toBeDisabled();
    await waitFor(() => expect(canvas.getByText('1,212')).toBeVisible());
    await expect(canvas.getByText(copy.preview)).toBeVisible();
    await expect(args.onVerifyPassword).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const FilteredScope: Story = {
  args: { snapshot: { ...meta.args.snapshot, count: 18,
    filters: { query: 'staff-taylor', actor: 'staff-jordan', category: 'staff', range: 'month' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(canvas.getByText('staff-taylor')).toBeVisible());
    await expect(canvas.getByText('staff-jordan')).toBeVisible();
    await expect(canvas.getByText('18')).toBeVisible();
  },
};
export const ExactlyFiftyThousand: Story = {
  args: { snapshot: { ...meta.args.snapshot, count: 50_000 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(canvas.getByText('50,000')).toBeVisible());
    await enterReason(canvas);
  },
};
export const AboveLimitBlocked: Story = {
  args: { snapshot: { ...meta.args.snapshot, count: 50_001 } },
  play: async ({ canvasElement, args }) => {
    await blocked(within(canvasElement.ownerDocument.body), copy.limit);
    await expect(args.onVerifyPassword).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const EmptyScope: Story = {
  args: { snapshot: { ...meta.args.snapshot, count: 0 } },
  play: async ({ canvasElement }) => blocked(within(canvasElement.ownerDocument.body), copy.empty),
};
export const InvalidCount: Story = {
  args: { snapshot: { ...meta.args.snapshot, count: -1 } },
  play: async ({ canvasElement }) => blocked(within(canvasElement.ownerDocument.body), copy.invalid),
};
export const SupportDenied: Story = {
  args: { reviewerRole: 'support' },
  play: async ({ canvasElement }) => blocked(within(canvasElement.ownerDocument.body), copy.denied),
};
export const BillingDenied: Story = {
  args: { reviewerRole: 'billing' },
  play: async ({ canvasElement }) => blocked(within(canvasElement.ownerDocument.body), copy.denied),
};
export const NoSecondFactor: Story = {
  args: { methods: [] },
  play: async ({ canvasElement }) => blocked(within(canvasElement.ownerDocument.body), copy.noFactors),
};
export const PasswordReauthentication: Story = {
  play: async ({ canvasElement }) => enterReason(within(canvasElement.ownerDocument.body)),
};
export const SecondFactorSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPassword(canvas);
    await expect(args.onVerifyPassword).toHaveBeenCalledWith(copy.stories.password, { snapshot: args.snapshot, reason: copy.stories.reason });
    await expect(canvas.queryByLabelText(copy.labels.password, { exact: false, selector: 'input' })).not.toBeInTheDocument();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const AuthenticatorVerification: Story = {
  args: { methods: ['totp'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPassword(canvas);
    await expect(canvas.queryByRole('radio', { name: copy.labels.passkey })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: copy.buttons.totp })).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.code }), '12');
    await expect(canvas.getByRole('button', { name: copy.buttons.totp })).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.code }), '3456');
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.totp }));
    await expect(args.onVerifyFactor).toHaveBeenCalledWith({ method: 'totp', code: copy.stories.code });
    await expect(canvas.getByRole('heading', { name: copy.stages.confirm })).toBeVisible();
    await expect(canvas.queryByRole('textbox', { name: copy.labels.code })).not.toBeInTheDocument();
  },
};
export const FinalConfirmation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await expect(canvas.getByText(copy.stories.reason)).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.buttons.confirm })).toBeEnabled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const ExportCompleted: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.confirm }));
    await expect(args.onConfirm).toHaveBeenCalledWith({ snapshot: args.snapshot, reason: copy.stories.reason });
    await expect(canvas.getByText(copy.stories.completed)).toBeVisible();
    await expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
  },
};
export const PasswordRejected: Story = {
  args: { onVerifyPassword: fn(async () => ({ ok: false, message: copy.stories.passwordFailed })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.password }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.passwordFailed);
    await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toHaveValue('');
    await expect(args.onVerifyFactor).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const PasskeyCancelled: Story = {
  args: { onVerifyFactor: fn(async () => ({ ok: false, message: copy.stories.factorFailed })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPassword(canvas);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.passkey }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.factorFailed);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const ExportRejected: Story = {
  args: { onConfirm: fn(async () => ({ ok: false, message: copy.stories.exportFailed })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.confirm }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.exportFailed);
    await expect(canvas.getByRole('alertdialog')).toBeVisible();
  },
};
export const PendingVerification: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    let finish!: (result: StaffVerificationResult) => void;
    args.onVerifyPassword.mockImplementationOnce(() => new Promise<StaffVerificationResult>(resolve => { finish = resolve; }));
    const form = canvas.getByRole('alertdialog').querySelector('form')!;
    fireEvent.submit(form); fireEvent.submit(form);
    await waitFor(() => expect(args.onVerifyPassword).toHaveBeenCalledTimes(1));
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect(canvas.getByRole('alertdialog')).toHaveAttribute('tabindex', '0');
    await userEvent.keyboard('{Escape}');
    await expect(args.onClose).not.toHaveBeenCalled();
    finish({ ok: true });
    await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.factor })).toBeVisible());
  },
};
export const CancelAndReopen: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(canvas.getByRole('button', { name: copy.stories.open }));
    await expect(canvas.getByRole('textbox', { name: copy.labels.reason })).toHaveValue('');
    await expect(args.onVerifyPassword).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const EscapeCloses: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const ExpiredVerification: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    const originalNow = Date.now;
    const future = originalNow() + 5 * 60 * 1000;
    Date.now = () => future;
    try {
      await waitFor(() => expect(canvas.getByText(copy.expired)).toBeVisible(), { timeout: 3000 });
      await expect(canvas.getByRole('button', { name: copy.buttons.confirm })).toBeDisabled();
      await expect(args.onConfirm).not.toHaveBeenCalled();
      await userEvent.click(canvas.getByRole('button', { name: copy.verifyAgain }));
      await expect(canvas.getByRole('heading', { name: copy.stages.password })).toBeVisible();
      await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toHaveValue('');
    } finally { Date.now = originalNow; }
  },
};

export const ExpiredFactorChallenge: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPassword(canvas);
    const originalNow = Date.now;
    const future = originalNow() + 5 * 60 * 1000;
    Date.now = () => future;
    try {
      await waitFor(() => expect(canvas.getByText(copy.expired)).toBeVisible(), { timeout: 3000 });
      await expect(canvas.getByRole('button', { name: copy.buttons.passkey })).toBeDisabled();
      await expect(args.onVerifyFactor).not.toHaveBeenCalled();
      await userEvent.click(canvas.getByRole('button', { name: copy.verifyAgain }));
      await expect(canvas.getByRole('heading', { name: copy.stages.password })).toBeVisible();
    } finally { Date.now = originalNow; }
  },
};

export const PendingExport: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    let finish!: (result: StaffVerificationResult) => void;
    args.onConfirm.mockImplementationOnce(() => new Promise<StaffVerificationResult>(resolve => { finish = resolve; }));
    const form = canvas.getByRole('alertdialog').querySelector('form')!;
    fireEvent.submit(form); fireEvent.submit(form);
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledTimes(1));
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(args.onClose).not.toHaveBeenCalled();
    finish({ ok: true });
    await waitFor(() => expect(canvas.getByText(copy.stories.completed)).toBeVisible());
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardFocusRestored: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    const trigger = canvas.getByRole('button', { name: copy.stories.open });
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const SnapshotChanged: Story = {
  render: args => <ChangingSnapshotPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.password }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(copy.changed));
    await expect(canvas.getByRole('button', { name: copy.buttons.passkey })).toBeDisabled();
    await expect(args.onVerifyFactor).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const UnexpectedVerificationError: Story = {
  args: { onVerifyPassword: fn(async () => { throw new Error(copy.stories.passwordFailed); }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.password }));
    await expect(canvas.getByRole('alert')).toBeVisible();
    await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toHaveValue('');
    await expect(args.onVerifyFactor).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
