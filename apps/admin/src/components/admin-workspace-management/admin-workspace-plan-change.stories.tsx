import type { AdminWorkspaceBillingResponse, AdminWorkspacePlanChangePreviewResponse } from '@salesmora/contracts';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminWorkspacePlanChange } from './admin-workspace-plan-change';
import { adminWorkspacePlanChangeCopy as copy } from './admin-workspace-plan-change-copy.data';

const workspaceId = 'c65817f9-d60b-4cad-8096-1cfc2b40ece2';
const verificationToken = 's'.repeat(43);
const effectiveAt = '2026-12-01T00:00:00.000Z';
const activeSubscription: NonNullable<AdminWorkspaceBillingResponse['subscription']> = {
  plan: 'standard',
  intendedPlan: 'standard',
  status: 'active',
  cancelAtPeriodEnd: false,
  paidThrough: effectiveAt,
  recoveryUntil: null,
};
const upgradeQuote: AdminWorkspacePlanChangePreviewResponse['quote'] = {
  id: 'a25ebd2b-8aec-4798-a82d-7695b68f7c37',
  plan: 'premium',
  kind: 'upgrade',
  amountDue: 1450,
  currency: 'usd',
  effectiveAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
};

let originalFetch: typeof window.fetch;

function mockPlanChange({
  quote = upgradeQuote,
  result = {
    status: 'complete' as const,
    plan: 'premium' as const,
    effectiveAt: upgradeQuote.effectiveAt,
  },
  methods = ['totp'],
}: {
  quote?: AdminWorkspacePlanChangePreviewResponse['quote'];
  result?: {
    status: 'complete' | 'scheduled' | 'expired' | 'customer_action_required';
    plan: 'free' | 'standard' | 'premium';
    effectiveAt: string;
    handoff?: 'workspace_owner_billing';
  };
  methods?: ('passkey' | 'totp')[];
} = {}) {
  originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith('/billing/plan-change') && init?.method !== 'POST') {
      return Response.json({ methods });
    }
    if (url.endsWith('/billing/plan-change')) {
      const body = JSON.parse(String(init?.body)) as { operation: string };
      if (body.operation === 'preview') return Response.json({ workspaceId, quote });
      if (body.operation === 'start') {
        return Response.json({
          token: verificationToken,
          options: {
            challenge: 'storybook-challenge',
            userVerification: 'required',
            allowCredentials: [],
          },
        });
      }
      if (body.operation === 'factor') return Response.json({ verified: true });
      if (body.operation === 'commit') return Response.json(result);
    }
    return Response.json({ error: copy.requestUnavailable }, { status: 503 });
  };
  return () => { window.fetch = originalFetch; };
}

async function preview(
  canvas: ReturnType<typeof within>,
  page: ReturnType<typeof within>,
  targetPlan?: string,
) {
  await userEvent.click(canvas.getByRole('button', { name: copy.change }));
  const dialog = within(await page.findByRole('alertdialog'));
  if (targetPlan) {
    await userEvent.selectOptions(dialog.getByRole('combobox', { name: copy.selectedPlan }), targetPlan);
  }
  await userEvent.type(dialog.getByRole('textbox', { name: copy.reason }), 'Finance approved this change, ticket 8124');
  await userEvent.click(dialog.getByRole('button', { name: copy.continue }));
}

async function verifyAndApply(page: ReturnType<typeof within>) {
  const dialog = within(page.getByRole('alertdialog'));
  await userEvent.click(dialog.getByRole('button', { name: copy.startVerification }));
  await userEvent.type(dialog.getByRole('textbox', { name: copy.code }), '123456');
  await userEvent.click(dialog.getByRole('button', { name: copy.verifyAndApply }));
}

const meta = {
  title: 'Admin/Customers/AdminWorkspacePlanChange',
  component: AdminWorkspacePlanChange,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    workspaceId,
    subscription: activeSubscription,
    providerStatus: 'available',
    canChangePlan: true,
    onComplete: fn(),
  },
} satisfies Meta<typeof AdminWorkspacePlanChange>;
export default meta;
type Story = StoryObj<typeof meta>;

export const UpgradeRequiresQuoteAndFreshFactor: Story = {
  beforeEach: () => mockPlanChange(),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await preview(canvas, page);
    const dialog = within(page.getByRole('alertdialog'));
    await expect(dialog.getByText(copy.kind('upgrade'))).toBeVisible();
    await expect(dialog.getByText(copy.amount(1450))).toBeVisible();
    await expect(dialog.getByText(copy.date(upgradeQuote.effectiveAt))).toBeVisible();
    await verifyAndApply(page);
    await expect(canvas.getByText(copy.completed('Premium', copy.date(upgradeQuote.effectiveAt)), { exact: true }))
      .toBeVisible();
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};

export const ScheduledMoveToFree: Story = {
  beforeEach: () => mockPlanChange({
    quote: {
      ...upgradeQuote,
      plan: 'free',
      kind: 'free',
      amountDue: 0,
      effectiveAt,
    },
    result: { status: 'scheduled', plan: 'free', effectiveAt },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await preview(canvas, page, 'free');
    const dialog = within(page.getByRole('alertdialog'));
    await expect(dialog.getByText(copy.kind('free'))).toBeVisible();
    await expect(dialog.getByText(copy.date(effectiveAt))).toBeVisible();
    await verifyAndApply(page);
    await expect(canvas.getByText(copy.completed('Free', copy.date(effectiveAt)), { exact: true })).toBeVisible();
  },
};

export const ExpiredQuoteCannotProceed: Story = {
  beforeEach: () => mockPlanChange({
    quote: { ...upgradeQuote, expiresAt: new Date(Date.now() - 60_000).toISOString() },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await preview(canvas, page);
    const dialog = within(page.getByRole('alertdialog'));
    await expect(dialog.getByRole('alert')).toHaveTextContent(copy.quoteExpired);
    await expect(dialog.getByRole('button', { name: copy.startVerification })).toBeDisabled();
  },
};

export const QuoteExpiresDuringConfirmation: Story = {
  beforeEach: () => mockPlanChange({
    result: { status: 'expired', plan: 'premium', effectiveAt: upgradeQuote.effectiveAt },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await preview(canvas, page);
    await verifyAndApply(page);
    await expect(canvas.getByText(copy.expiredResult, { exact: true })).toBeVisible();
  },
};

export const PaymentAuthenticationHandsOffToOwner: Story = {
  beforeEach: () => mockPlanChange({
    result: {
      status: 'customer_action_required',
      plan: 'premium',
      effectiveAt: upgradeQuote.effectiveAt,
      handoff: 'workspace_owner_billing',
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await preview(canvas, page);
    await verifyAndApply(page);
    await expect(canvas.getByText(copy.handoff('Premium', copy.date(upgradeQuote.effectiveAt)), { exact: true }))
      .toBeVisible();
  },
};

export const FreeWorkspaceCannotStartCheckout: Story = {
  args: {
    subscription: {
      ...activeSubscription,
      plan: 'free',
      intendedPlan: 'free',
      status: 'free',
      paidThrough: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.notEligible)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.change })).not.toBeInTheDocument();
  },
};

export const ProviderUnavailable: Story = {
  args: { providerStatus: 'unavailable' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.unavailable)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.change })).not.toBeInTheDocument();
  },
};

export const ReadOnlyRoleCannotChangePlan: Story = {
  args: { canChangePlan: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: copy.change })).not.toBeInTheDocument();
  },
};
