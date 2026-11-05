import { expect, it } from 'vitest';
import { adminWorkspaceBillingLinksResponseSchema } from './billing';

const workspaceId = '00000000-0000-4000-8000-000000000001';

it('accepts fixed test-mode Stripe dashboard URLs for the expected objects', () => {
  expect(adminWorkspaceBillingLinksResponseSchema.safeParse({
    workspaceId,
    providerStatus: 'available',
    customerUrl: 'https://dashboard.stripe.com/test/customers/cus_example',
    subscriptionUrl: 'https://dashboard.stripe.com/test/subscriptions/sub_example',
    invoices: [{
      number: 'INV-1',
      createdAt: '2026-11-01T12:00:00.000Z',
      url: 'https://dashboard.stripe.com/test/invoices/in_example',
    }],
  }).success).toBe(true);
});

it('rejects live-mode, non-dashboard, mismatched-object and injected link values', () => {
  const valid = {
    workspaceId,
    providerStatus: 'available',
    customerUrl: 'https://dashboard.stripe.com/test/customers/cus_example',
    subscriptionUrl: null,
    invoices: [],
  };
  for (const customerUrl of [
    'https://dashboard.stripe.com/customers/cus_example',
    'https://evil.example/test/customers/cus_example',
    'https://dashboard.stripe.com/test/subscriptions/sub_example',
    'https://dashboard.stripe.com/test/customers/cus_example?redirect=https://evil.example',
  ]) {
    expect(adminWorkspaceBillingLinksResponseSchema.safeParse({ ...valid, customerUrl }).success).toBe(false);
  }
  expect(adminWorkspaceBillingLinksResponseSchema.safeParse({
    ...valid,
    customerId: 'cus_example',
  }).success).toBe(false);
});

it('does not return links when provider data is unavailable or not linked', () => {
  for (const providerStatus of ['unavailable', 'not_linked'] as const) {
    expect(adminWorkspaceBillingLinksResponseSchema.safeParse({
      workspaceId,
      providerStatus,
      customerUrl: null,
      subscriptionUrl: null,
      invoices: [],
    }).success).toBe(true);
    expect(adminWorkspaceBillingLinksResponseSchema.safeParse({
      workspaceId,
      providerStatus,
      customerUrl: 'https://dashboard.stripe.com/test/customers/cus_example',
      subscriptionUrl: null,
      invoices: [],
    }).success).toBe(false);
  }
});
