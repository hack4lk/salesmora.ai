import type {
  AdminWorkspaceBillingLinksResponse,
  AdminWorkspaceBillingResponse,
} from '@salesmora/contracts';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminWorkspaceBilling } from './admin-workspace-billing';
import { adminWorkspaceBillingCopy as copy } from './admin-workspace-billing-copy.data';

const workspaceId = 'c65817f9-d60b-4cad-8096-1cfc2b40ece2';
const now = '2026-11-01T10:00:00.000Z';

const paidBilling: AdminWorkspaceBillingResponse = {
  workspaceId,
  subscription: {
    plan: 'standard',
    intendedPlan: 'standard',
    status: 'active',
    cancelAtPeriodEnd: false,
    paidThrough: '2026-12-01T00:00:00.000Z',
    recoveryUntil: null,
  },
  planChanges: [{
    plan: 'standard',
    kind: 'upgrade',
    status: 'complete',
    amountDue: 1450,
    createdAt: '2026-10-25T10:00:00.000Z',
    effectiveAt: '2026-10-25T10:00:00.000Z',
  }],
  invoices: [{
    number: 'SM-2026-1042',
    createdAt: '2026-10-01T10:00:00.000Z',
    currency: 'usd',
    total: 2900,
    amountPaid: 2900,
    amountDue: 0,
    status: 'paid',
  }],
  payment: { brand: 'Visa', last4: '4242', expMonth: 12, expYear: 2028 },
  providerStatus: 'available',
  recoveries: [],
  webhookEvents: [{
    type: 'invoice.paid',
    status: 'processed',
    receivedAt: '2026-10-01T10:00:01.000Z',
    processedAt: '2026-10-01T10:00:02.000Z',
    attempts: 1,
    retryAt: '2026-10-01T10:00:01.000Z',
  }],
};

const recoveryBilling: AdminWorkspaceBillingResponse = {
  ...paidBilling,
  subscription: {
    ...paidBilling.subscription!,
    status: 'past_due',
    recoveryUntil: '2026-11-08T10:00:00.000Z',
  },
  invoices: [],
  payment: null,
  recoveries: [{
    state: 'pending',
    amountDue: 2900,
    attempts: 2,
    createdAt: '2026-10-31T10:00:00.000Z',
    expiresAt: '2026-11-08T10:00:00.000Z',
    retryAt: '2026-11-02T10:00:00.000Z',
  }],
  webhookEvents: [{
    type: 'invoice.payment_failed',
    status: 'retry_scheduled',
    receivedAt: now,
    processedAt: null,
    attempts: 2,
    retryAt: '2026-11-02T10:00:00.000Z',
  }],
};

const freeBilling: AdminWorkspaceBillingResponse = {
  ...paidBilling,
  subscription: {
    plan: 'free',
    intendedPlan: 'free',
    status: 'free',
    cancelAtPeriodEnd: false,
    paidThrough: null,
    recoveryUntil: null,
  },
  planChanges: [],
  invoices: [],
  payment: null,
  providerStatus: 'available',
  webhookEvents: [],
};

const paidBillingLinks: AdminWorkspaceBillingLinksResponse = {
  workspaceId,
  providerStatus: 'available',
  customerUrl: 'https://dashboard.stripe.com/test/customers/cus_storybook',
  subscriptionUrl: 'https://dashboard.stripe.com/test/subscriptions/sub_storybook',
  invoices: [{
    number: 'SM-2026-1042',
    createdAt: '2026-10-01T10:00:00.000Z',
    url: 'https://dashboard.stripe.com/test/invoices/in_storybook',
  }],
};

let originalFetch: typeof window.fetch;

function mockBilling(
  payload: AdminWorkspaceBillingResponse | { error: string },
  status = 200,
  linksPayload?: AdminWorkspaceBillingLinksResponse | { error: string },
  linksStatus = 200,
) {
  originalFetch = window.fetch;
  window.fetch = async input => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith('/billing/links')) {
      return Response.json(
        linksPayload ?? { error: copy.dashboardLinksError },
        { status: linksPayload ? linksStatus : 503 },
      );
    }
    return Response.json(payload, { status });
  };
  return () => { window.fetch = originalFetch; };
}

const meta = {
  title: 'Admin/Customers/AdminWorkspaceBilling',
  component: AdminWorkspaceBilling,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: { workspaceId },
} satisfies Meta<typeof AdminWorkspaceBilling>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PaidSubscriptionWithHistory: Story = {
  beforeEach: () => mockBilling(paidBilling),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(copy.provider.available)).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.title })).toBeVisible();
    await expect(await canvas.findByText('Visa ending 4242 · expires 12/2028')).toBeVisible();
    await expect(await canvas.findByText('Invoice SM-2026-1042')).toBeVisible();
    await expect(await canvas.findByText('$14.50')).toBeVisible();
  },
};

export const PastDueRecoveryAndWebhookRetry: Story = {
  beforeEach: () => mockBilling(recoveryBilling),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('past due', { exact: true })).toBeVisible();
    await expect(canvas.getByText('pending', { exact: true })).toBeVisible();
    await expect(canvas.getByText('retry scheduled', { exact: true })).toBeVisible();
    expect(canvas.getAllByText(/2 attempts · retry/)).toHaveLength(2);
  },
};

export const FreeWorkspaceWithoutCardOrInvoices: Story = {
  beforeEach: () => mockBilling(freeBilling),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(copy.provider.available)).toBeVisible();
    await expect(await canvas.findByText(copy.noPaymentMethod)).toBeVisible();
    await expect(await canvas.findByText(copy.noInvoices)).toBeVisible();
  },
};

export const ProviderUnavailable: Story = {
  beforeEach: () => mockBilling({
    ...freeBilling,
    providerStatus: 'unavailable',
    invoices: [],
    payment: null,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(copy.provider.unavailable)).toBeVisible();
    await expect(await canvas.findByText(copy.noPaymentMethod)).toBeVisible();
    await expect(await canvas.findByText(copy.noInvoices)).toBeVisible();
  },
};

export const BillingRoleDenied: Story = {
  beforeEach: () => mockBilling({ error: copy.denied }, 403),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole('alert')).toHaveTextContent(copy.denied);
  },
};

export const BillingRoleWithStripeDashboardLinks: Story = {
  args: { canReadBillingLinks: true },
  beforeEach: () => mockBilling(paidBilling, 200, paidBillingLinks),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const customerLink = await canvas.findByRole('link', { name: copy.customerDashboardLink });
    const subscriptionLink = canvas.getByRole('link', { name: copy.subscriptionDashboardLink });
    const invoiceLink = canvas.getByRole('link', {
      name: copy.invoiceDashboardLink('SM-2026-1042'),
    });
    await expect(customerLink).toHaveAttribute('href', paidBillingLinks.customerUrl);
    await expect(customerLink).toHaveAttribute('target', '_blank');
    await expect(customerLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(subscriptionLink).toHaveAttribute('href', paidBillingLinks.subscriptionUrl);
    await expect(invoiceLink).toHaveAttribute('href', paidBillingLinks.invoices[0]?.url);
  },
};

export const SupportBillingViewDoesNotShowDashboardLinks: Story = {
  args: { canReadBillingLinks: false },
  beforeEach: () => mockBilling(paidBilling),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(copy.provider.available)).toBeVisible();
    await expect(canvas.queryByRole('heading', { name: copy.dashboardLinks })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('link', { name: copy.customerDashboardLink })).not.toBeInTheDocument();
  },
};

export const DashboardLinksUnavailable: Story = {
  args: { canReadBillingLinks: true },
  beforeEach: () => mockBilling(paidBilling, 200, {
    workspaceId,
    providerStatus: 'unavailable',
    customerUrl: null,
    subscriptionUrl: null,
    invoices: [],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(copy.dashboardLinksUnavailable)).toBeVisible();
    await expect(canvas.queryByRole('link', { name: copy.customerDashboardLink })).not.toBeInTheDocument();
  },
};
