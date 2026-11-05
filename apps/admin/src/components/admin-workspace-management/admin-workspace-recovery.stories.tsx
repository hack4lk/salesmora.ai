import type {
  AdminWorkspaceRecoveryPreviewResponse,
  AdminWorkspaceRecoveryResult,
} from '@salesmora/contracts';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminWorkspaceRecovery } from './admin-workspace-recovery';
import { adminWorkspaceRecoveryCopy as copy } from './admin-workspace-recovery-copy.data';

const workspaceId = 'c65817f9-d60b-4cad-8096-1cfc2b40ece2';
const recoveryId = 'a25ebd2b-8aec-4798-a82d-7695b68f7c37';
const preview: AdminWorkspaceRecoveryPreviewResponse = {
  workspaceId,
  providerStatus: 'available',
  invoice: {
    number: 'SM-2026-1042',
    createdAt: '2026-11-01T10:00:00.000Z',
    status: 'open',
    amountDue: 2900,
  },
  paymentState: 'none',
  recovery: {
    id: recoveryId,
    state: 'pending',
    amountDue: 2900,
    attempts: 2,
    createdAt: '2026-11-01T10:01:00.000Z',
    attemptedAt: '2026-11-01T10:05:00.000Z',
    retryAt: '2026-11-02T10:00:00.000Z',
    retriesCancelledAt: null,
  },
  grace: {
    currentUntil: '2026-11-08T10:00:00.000Z',
    maximumUntil: '2026-11-15T10:00:00.000Z',
    additionalDaysAvailable: 7,
  },
};
const verificationToken = 's'.repeat(43);

let originalFetch: typeof window.fetch;
let lastStartBody: unknown;

function mockRecovery({
  current = preview,
  result = {
    status: 'owner_action_required' as const,
    recoveryId,
    handoff: 'workspace_owner_billing' as const,
  },
  methods = ['totp'],
}: {
  current?: AdminWorkspaceRecoveryPreviewResponse;
  result?: AdminWorkspaceRecoveryResult;
  methods?: ('passkey' | 'totp')[];
} = {}) {
  originalFetch = window.fetch;
  lastStartBody = null;
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.endsWith('/billing/recovery')) {
      return Response.json({ error: copy.requestUnavailable }, { status: 503 });
    }
    if (init?.method !== 'POST') return Response.json({ methods });
    const body = JSON.parse(String(init.body)) as { operation: string };
    if (body.operation === 'preview') return Response.json(current);
    if (body.operation === 'start') {
      lastStartBody = body;
      return Response.json({
        token: verificationToken,
        options: {
          challenge: 'storybook-recovery-challenge',
          userVerification: 'required',
          allowCredentials: [],
        },
      });
    }
    if (body.operation === 'factor') return Response.json({ verified: true });
    if (body.operation === 'commit') return Response.json(result);
    return Response.json({ error: copy.requestUnavailable }, { status: 400 });
  };
  return () => { window.fetch = originalFetch; };
}

async function reviewAndVerify(
  canvas: ReturnType<typeof within>,
  page: ReturnType<typeof within>,
  actionButton: string,
  reason: string,
) {
  await userEvent.click(canvas.getByRole('button', { name: actionButton }));
  const dialog = within(page.getByRole('alertdialog'));
  await userEvent.type(dialog.getByRole('textbox', { name: copy.reason }), reason);
  await userEvent.click(dialog.getByRole('button', { name: copy.reviewLatest }));
  await userEvent.click(dialog.getByRole('button', { name: copy.startVerification }));
  await userEvent.type(dialog.getByRole('textbox', { name: copy.code }), '123456');
  return dialog;
}

const meta = {
  title: 'Admin/Customers/AdminWorkspaceRecovery',
  component: AdminWorkspaceRecovery,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    workspaceId,
    canManageRecovery: true,
    onComplete: fn(),
  },
} satisfies Meta<typeof AdminWorkspaceRecovery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RetryHandsOffAuthenticationToOwner: Story = {
  beforeEach: () => mockRecovery(),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText('Invoice SM-2026-1042')).toBeVisible();
    const dialog = await reviewAndVerify(
      canvas,
      page,
      copy.retry,
      'Retry only the existing Owner-confirmed invoice, case 8128',
    );
    await userEvent.click(dialog.getByRole('button', { name: copy.confirmRetry }));
    await expect(canvas.getByText(copy.ownerHandoff, { exact: true })).toBeVisible();
    await expect(canvas.queryByText(/client_secret|pi_secret/)).not.toBeInTheDocument();
    await expect(args.onComplete).toHaveBeenCalledOnce();
    expect(lastStartBody).toMatchObject({
      operation: 'start',
      action: 'retry',
      workspaceId,
      recoveryId,
      reason: 'Retry only the existing Owner-confirmed invoice, case 8128',
    });
  },
};

export const GraceExtensionUsesSelectedDays: Story = {
  beforeEach: () => mockRecovery({
    result: { status: 'grace_extended', graceUntil: '2026-11-10T10:00:00.000Z' },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText('Invoice SM-2026-1042')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: copy.extendGrace }));
    const dialog = within(page.getByRole('alertdialog'));
    await userEvent.selectOptions(dialog.getByRole('combobox', { name: copy.additionalDays }), '3');
    await userEvent.type(dialog.getByRole('textbox', { name: copy.reason }), 'Approved extension for card update, case 8129');
    await userEvent.click(dialog.getByRole('button', { name: copy.reviewLatest }));
    await userEvent.click(dialog.getByRole('button', { name: copy.startVerification }));
    await userEvent.type(dialog.getByRole('textbox', { name: copy.code }), '123456');
    await userEvent.click(dialog.getByRole('button', { name: copy.confirmExtend }));
    await expect(canvas.getByText(
      copy.graceExtended(copy.date('2026-11-10T10:00:00.000Z')),
      { exact: true },
    )).toBeVisible();
    expect(lastStartBody).toMatchObject({
      operation: 'start',
      action: 'extend_grace',
      workspaceId,
      additionalDays: 3,
    });
  },
};

export const CancellationPreservesOwnerAuthentication: Story = {
  beforeEach: () => mockRecovery({
    current: { ...preview, paymentState: 'requires_action' },
    result: { status: 'retries_cancelled', paymentState: 'requires_action' },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText(copy.ownerAction)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: copy.cancelRetries }));
    const dialog = within(page.getByRole('alertdialog'));
    await userEvent.type(
      dialog.getByRole('textbox', { name: copy.reason }),
      'Stop worker retries while the Owner completes authentication, case 8130',
    );
    await userEvent.click(dialog.getByRole('button', { name: copy.reviewLatest }));
    await expect(dialog.getByText(copy.cancellationWarning)).toBeVisible();
    await userEvent.click(dialog.getByRole('button', { name: copy.startVerification }));
    await userEvent.type(dialog.getByRole('textbox', { name: copy.code }), '123456');
    await userEvent.click(dialog.getByRole('button', { name: copy.confirmCancel }));
    await expect(canvas.getByText(copy.retriesCancelled, { exact: true })).toBeVisible();
    expect(lastStartBody).toMatchObject({ operation: 'start', action: 'cancel', recoveryId });
  },
};

export const ProviderUnavailableCannotStartActions: Story = {
  args: {},
  beforeEach: () => mockRecovery({
    current: { ...preview, providerStatus: 'unavailable' },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(copy.providerUnavailable)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.retry })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: copy.cancelRetries })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: copy.extendGrace })).not.toBeInTheDocument();
  },
};

export const SupportRoleCannotManageRecovery: Story = {
  args: { canManageRecovery: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('region', { name: copy.title })).not.toBeInTheDocument();
  },
};

export const DeletionPendingCannotManageRecovery: Story = {
  args: { deletionPending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.deletionPending)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.retry })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: copy.cancelRetries })).not.toBeInTheDocument();
  },
};
