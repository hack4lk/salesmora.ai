import { StrictMode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { planChangeRequestSchema, paymentRecoveryRequestSchema, type WorkspaceBillingSnapshot } from '@salesmora/contracts';
import { BillingRoute } from '../settings/billing-page/billing-route';
import { billingHistoryPreviewInvoices, billingPageData as copy } from '../settings/billing-page/billing-page.data';
import { ApiViewerProvider } from '../api/api-query-provider';
import { planChangeData as planCopy } from './plan-change/plan-change.data';
import { paymentRecoveryDialogData as recoveryCopy } from './payment-recovery-dialog/payment-recovery-dialog.data';
import { paymentMethodDialogData as cardCopy } from './payment-method-dialog/payment-method-dialog.data';
import { CheckoutHandoff } from './checkout-handoff/checkout-handoff';
import { checkoutHandoffData as checkoutCopy } from './checkout-handoff/checkout-handoff.data';
import { billingQuoteFixture, billingRecoveryFixture, billingScope, billingSnapshotFixture } from './billing-queries.fixtures';

const reads = fn(), commands = fn();
let snapshot: WorkspaceBillingSnapshot, summaryStatus = 200, historyStatus = 200, commandStatus = 200;
let malformed = false, deferHistory = false, releaseHistory: (() => void) | undefined;
let recoveryStatus: 'review' | 'pending' = 'review';
let checkoutMalformed = false;
let quote = billingQuoteFixture;
const meta = {
  title: 'Billing/ConnectedBilling', component: BillingRoute,
  args: { workspaceId: billingScope.workspaceId, viewerRole: 'owner', initialSnapshot: billingSnapshotFixture },
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <StrictMode><ApiViewerProvider viewerId={billingScope.viewerId}><main className="mx-auto max-w-6xl p-4 sm:p-8"><Story/></main></ApiViewerProvider></StrictMode>],
  beforeEach: () => {
    reads.mockClear(); commands.mockClear();
    snapshot = structuredClone(billingSnapshotFixture); quote = { ...billingQuoteFixture };
    summaryStatus = historyStatus = commandStatus = 200;
    malformed = deferHistory = checkoutMalformed = false; releaseHistory = undefined; recoveryStatus = 'review';
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const url = new URL(String(input), 'http://localhost'), path = url.pathname;
      if (!path.startsWith('/api/billing/')) return original(input, init);
      if (path === '/api/billing/summary') {
        reads(path);
        return Response.json(malformed ? {} : summaryStatus === 200 ? snapshot : { error: 'Billing unavailable.' }, { status: summaryStatus });
      }
      if (path === '/api/billing/invoices') {
        reads(path);
        if (deferHistory) await new Promise<void>(resolve => { releaseHistory = resolve; });
        if (historyStatus !== 200) return Response.json({ error: 'History unavailable.' }, { status: historyStatus });
        const index = billingHistoryPreviewInvoices.findIndex(row => row.id === url.searchParams.get('after'));
        const invoices = billingHistoryPreviewInvoices.slice(index + 1, index + 13);
        const hasMore = index + 13 < billingHistoryPreviewInvoices.length;
        return Response.json({ invoices, hasMore, nextCursor: hasMore ? invoices.at(-1)?.id : null });
      }
      const body: unknown = JSON.parse(String(init?.body));
      commands({ path, body });
      if (commandStatus !== 200) return Response.json({ error: 'Billing command unavailable.' }, { status: commandStatus });
      if (path === '/api/billing/plan') {
        const command = planChangeRequestSchema.parse(body);
        if (command.action === 'preview') {
          quote = { ...billingQuoteFixture, plan: command.plan, kind: command.plan === 'free' ? 'free' : 'upgrade' };
          return Response.json(quote);
        }
        snapshot = { ...snapshot, change: command.action === 'undo' ? null : { ...quote, status: 'scheduled' } };
        return Response.json({ status: command.action === 'undo' ? 'complete' : 'scheduled' });
      }
      if (path === '/api/billing/recovery') {
        const command = paymentRecoveryRequestSchema.parse(body);
        return Response.json({ ...billingRecoveryFixture, status: command.action === 'status' ? 'paid' : recoveryStatus });
      }
      if (path === '/api/billing/checkout') return Response.json(checkoutMalformed ? {} : {
        billing: { hasCheckout: true, intendedPlan: 'standard', plan: 'free', status: 'incomplete' },
      });
      throw new Error('Unexpected billing endpoint.');
    };
    return () => { releaseHistory?.(); globalThis.fetch = original; };
  },
} satisfies Meta<typeof BillingRoute>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SnapshotWithoutRefresh: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(reads).not.toHaveBeenCalled();
  await expect(c.queryByRole('button', { name: 'Refresh billing' })).not.toBeInTheDocument();
  await expect(c.getByText(copy.invoiceCount(12))).toBeVisible();
} };
export const MalformedReconciliationRetry: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  const dialog = await openPremium(canvasElement);
  malformed = true;
  await userEvent.click(dialog.getByRole('button', { name: planCopy.confirm }));
  await expect(await dialog.findByText(planCopy.error)).toBeVisible();
  await userEvent.click(dialog.getByRole('button', { name: 'Close plan selection' }));
  await expect(await c.findByText(copy.error)).toBeVisible();
  await expect(c.queryByText(copy.invoiceCount(12))).not.toBeInTheDocument();
  malformed = false;
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(await c.findByText(copy.invoiceCount(12))).toBeVisible();
} };
export const InvoicePagingRetry: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  historyStatus = 409;
  await userEvent.click(c.getByRole('button', { name: copy.loadOlder }));
  await expect(await c.findByText(copy.historyError)).toBeVisible();
  await expect(c.getByText(copy.invoiceCount(12))).toBeVisible();
  historyStatus = 200;
  await userEvent.click(c.getByRole('button', { name: copy.retryInvoices }));
  await expect(await c.findByText(copy.invoiceCount(24))).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.loadOlder }));
  await expect(await c.findByText(`${copy.invoiceCount(26)} · ${copy.allInvoices}`)).toBeVisible();
  await expect(c.getAllByRole('button', { name: new RegExp(copy.view) })).toHaveLength(26);
} };
export const ReconciliationCancelsOlderPage: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  deferHistory = true;
  await userEvent.click(c.getByRole('button', { name: copy.loadOlder }));
  await waitFor(() => expect(releaseHistory).toBeDefined());
  snapshot = { ...snapshot, invoices: snapshot.invoices.slice(0, 1), hasMoreInvoices: false };
  const dialog = await openPremium(canvasElement);
  await userEvent.click(dialog.getByRole('button', { name: planCopy.confirm }));
  await expect(await dialog.findByText(planCopy.scheduled)).toBeVisible();
  await userEvent.click(dialog.getByRole('button', { name: 'Close plan selection' }));
  await expect(await c.findByText(`${copy.invoiceCount(1)} · ${copy.allInvoices}`)).toBeVisible();
  releaseHistory?.();
  await expect(c.getAllByRole('button', { name: new RegExp(copy.view) })).toHaveLength(1);
} };
export const SummaryDenied: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  const dialog = await openPremium(canvasElement);
  summaryStatus = 403;
  await userEvent.click(dialog.getByRole('button', { name: planCopy.confirm }));
  await expect(await c.findByText(copy.denied)).toBeVisible();
  await expect(c.queryByRole('heading', { name: copy.history })).not.toBeInTheDocument();
} };
export const AdminReadOnly: Story = { args: { viewerRole: 'admin' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const name of [copy.change, copy.cancel, copy.manage]) await expect(c.queryByRole('button', { name })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: 'Refresh billing' })).not.toBeInTheDocument();
  await expect(c.getByText(copy.adminNote)).toBeVisible();
  await expect(commands).not.toHaveBeenCalled();
} };
async function openPremium(canvasElement: HTMLElement) {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.change }));
  const dialog = within(await body.findByRole('dialog'));
  const premium = dialog.getByRole('heading', { name: planCopy.names.premium }).closest('article');
  if (!premium) throw new Error('Premium plan card missing.');
  await userEvent.click(within(premium).getByRole('button', { name: planCopy.select }));
  await expect(await dialog.findByText(`${planCopy.review} · ${planCopy.names.premium}`)).toBeVisible();
  return dialog;
}
export const ReviewedQuoteExactRetry: Story = { play: async ({ canvasElement }) => {
  const dialog = await openPremium(canvasElement);
  commandStatus = 409;
  await userEvent.click(dialog.getByRole('button', { name: planCopy.confirm }));
  await expect(await dialog.findByText(planCopy.error)).toBeVisible();
  await expect(commands).toHaveBeenCalledTimes(2);
  commandStatus = 200;
  await userEvent.click(dialog.getByRole('button', { name: planCopy.confirm }));
  await expect(await dialog.findByText(planCopy.scheduled)).toBeVisible();
  await expect(commands.mock.calls[1]).toEqual(commands.mock.calls[2]);
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const CommandDenied: Story = { play: async ({ canvasElement }) => {
  const dialog = await openPremium(canvasElement);
  commandStatus = 423;
  await userEvent.click(dialog.getByRole('button', { name: planCopy.confirm }));
  const c = within(canvasElement);
  await expect(await c.findByText(copy.denied)).toBeVisible();
  await expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).not.toBeInTheDocument();
} };
export const CancelAndUndo: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  const dialog = within(await body.findByRole('dialog'));
  await userEvent.click(await dialog.findByRole('button', { name: planCopy.cancelConfirm }));
  await expect(await dialog.findByText(planCopy.cancelScheduled)).toBeVisible();
  await userEvent.click(dialog.getByRole('button', { name: planCopy.undo }));
  await expect(await dialog.findByText(planCopy.complete)).toBeVisible();
  await expect(commands).toHaveBeenCalledTimes(3);
  await expect(commands.mock.calls[1][0].body).toMatchObject({ action: 'confirm', quoteId: billingQuoteFixture.id });
  await expect(commands.mock.calls[2][0].body).toMatchObject({ action: 'undo', quoteId: billingQuoteFixture.id });
} };
export const RecoveryStatusReconciliation: Story = {
  args: { initialSnapshot: { ...billingSnapshotFixture, status: 'past_due' } },
  play: async ({ canvasElement }) => {
    recoveryStatus = 'pending';
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole('button', { name: copy.recover }));
    const dialog = within(await body.findByRole('dialog'));
    await waitFor(() => expect(dialog.getByText(recoveryCopy.pending)).toBeVisible());
    await expect(commands).toHaveBeenCalledTimes(1);
    await userEvent.click(dialog.getByRole('button', { name: recoveryCopy.refreshStatus }));
    await waitFor(() => expect(dialog.getByRole('heading', { name: recoveryCopy.successTitle })).toBeVisible());
    await expect(commands.mock.calls[1][0].body).toMatchObject({ action: 'status', quoteId: billingQuoteFixture.id });
    await expect(reads).toHaveBeenCalledTimes(1);
  },
};
export const CardSDKUnavailable: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.manage }));
  const dialog = within(await body.findByRole('dialog'));
  await waitFor(() => expect(dialog.getByText(cardCopy.unavailable)).toBeVisible());
  await expect(commands).not.toHaveBeenCalled();
} };
export const CheckoutStatusRetry: Story = {
  render: () => <CheckoutHandoff workspaceId={billingScope.workspaceId} plan="standard" hasCheckout/>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    checkoutMalformed = true;
    await userEvent.click(c.getByRole('button', { name: checkoutCopy.check }));
    await expect(await c.findByRole('alert')).toHaveTextContent(checkoutCopy.error);
    checkoutMalformed = false;
    await userEvent.click(c.getByRole('button', { name: checkoutCopy.check }));
    await expect(await c.findByText(checkoutCopy.verifying)).toBeVisible();
    await expect(commands).toHaveBeenCalledTimes(2);
    await expect(commands.mock.calls[0]).toEqual(commands.mock.calls[1]);
  },
};
