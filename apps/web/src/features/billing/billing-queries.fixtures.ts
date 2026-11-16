import { workspaceBillingSnapshotSchema, type PlanChangeQuote } from '@salesmora/contracts';
import { billingHistoryPreviewInvoices } from '../settings/billing-page/billing-page.data';
import { paymentRecoveryDialogData } from './payment-recovery-dialog/payment-recovery-dialog.data';

export const billingScope = { viewerId: 'billing-viewer', workspaceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
export const billingSnapshotFixture = workspaceBillingSnapshotSchema.parse({
  plan: 'standard', status: 'active', cancelAtPeriodEnd: false, paidThrough: '2026-12-01T00:00:00.000Z',
  recoveryUntil: null, transitionUntil: null, resetAt: '2026-12-01T00:00:00.000Z', change: null,
  usage: { teammates: 3, newLeads: 240, aiTokens: '1250000', monthlyAITokens: 5000000 },
  payment: { brand: 'Visa', last4: '4242', expMonth: 8, expYear: 2028 }, billingEmail: 'billing@example.test',
  providerAvailable: true, invoices: billingHistoryPreviewInvoices.slice(0, 12), hasMoreInvoices: true,
});
export const billingQuoteFixture: PlanChangeQuote = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', plan: 'premium', kind: 'upgrade', amountDue: 1500,
  currency: 'usd', effectiveAt: '2026-12-01T00:00:00.000Z', expiresAt: '2099-01-01T00:00:00.000Z',
};
export const billingRecoveryFixture = {
  status: 'review' as const, quoteId: billingQuoteFixture.id, expiresAt: billingQuoteFixture.expiresAt,
  invoice: paymentRecoveryDialogData.fixture.invoice, card: billingSnapshotFixture.payment,
};
