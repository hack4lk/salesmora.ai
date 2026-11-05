import { expect, it } from 'vitest';
import {
  adminWorkspacePlanChangeOperationSchema,
  adminWorkspacePlanChangeMethodsSchema,
  adminWorkspacePlanChangePreviewResponseSchema,
  adminWorkspacePlanChangeResultSchema,
  adminWorkspacePlanChangeStartResponseSchema,
  adminWorkspacePlanChangeVerifiedSchema,
} from './billing';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const quoteId = '00000000-0000-4000-8000-000000000002';
const token = 'x'.repeat(43);

it('accepts only scoped preview and reason-bound confirmation requests', () => {
  expect(adminWorkspacePlanChangeOperationSchema.safeParse({
    operation: 'preview',
    workspaceId,
    plan: 'premium',
  }).success).toBe(true);
  expect(adminWorkspacePlanChangeOperationSchema.safeParse({
    operation: 'start',
    workspaceId,
    quoteId,
    reason: 'Owner requested a plan change',
  }).success).toBe(true);
});

it('rejects caller-supplied pricing, timing, provider identifiers and weak reasons', () => {
  for (const extra of [
    { amountDue: 1 },
    { effectiveAt: '2026-11-02T00:00:00.000Z' },
    { customerId: 'cus_example' },
    { priceId: 'price_example' },
  ]) {
    expect(adminWorkspacePlanChangeOperationSchema.safeParse({
      operation: 'preview',
      workspaceId,
      plan: 'premium',
      ...extra,
    }).success).toBe(false);
  }
  expect(adminWorkspacePlanChangeOperationSchema.safeParse({
    operation: 'start',
    workspaceId,
    quoteId,
    reason: 'too short',
  }).success).toBe(false);
});

it('requires a valid fresh factor operation and does not accept client payment data', () => {
  expect(adminWorkspacePlanChangeOperationSchema.safeParse({
    operation: 'factor',
    token,
    method: 'totp',
    code: '123456',
  }).success).toBe(true);
  expect(adminWorkspacePlanChangeOperationSchema.safeParse({
    operation: 'factor',
    token,
    method: 'totp',
    code: '123',
    clientSecret: 'pi_secret_example',
  }).success).toBe(false);
});

it('returns a strict quote and a bounded customer-action handoff without secrets', () => {
  const quote = {
    id: quoteId,
    plan: 'premium',
    kind: 'upgrade',
    amountDue: 1250,
    currency: 'usd',
    effectiveAt: '2026-11-02T00:00:00.000Z',
    expiresAt: '2026-11-02T00:10:00.000Z',
  };
  expect(adminWorkspacePlanChangePreviewResponseSchema.safeParse({
    workspaceId,
    quote,
  }).success).toBe(true);
  expect(adminWorkspacePlanChangePreviewResponseSchema.safeParse({
    workspaceId,
    quote: { ...quote, clientSecret: 'pi_secret_example' },
  }).success).toBe(false);
  expect(adminWorkspacePlanChangeResultSchema.safeParse({
    status: 'customer_action_required',
    plan: 'premium',
    effectiveAt: quote.effectiveAt,
    handoff: 'workspace_owner_billing',
  }).success).toBe(true);
  expect(adminWorkspacePlanChangeResultSchema.safeParse({
    status: 'customer_action_required',
    plan: 'premium',
    effectiveAt: quote.effectiveAt,
    handoff: 'workspace_owner_billing',
    clientSecret: 'pi_secret_example',
  }).success).toBe(false);
});

it('keeps factor methods and challenge responses bounded and strict', () => {
  expect(adminWorkspacePlanChangeMethodsSchema.safeParse({ methods: ['totp', 'passkey'] }).success).toBe(true);
  expect(adminWorkspacePlanChangeMethodsSchema.safeParse({ methods: ['sms'] }).success).toBe(false);
  expect(adminWorkspacePlanChangeStartResponseSchema.safeParse({
    token,
    options: {
      challenge: 'challenge-value',
      userVerification: 'required',
      allowCredentials: [],
    },
  }).success).toBe(true);
  expect(adminWorkspacePlanChangeStartResponseSchema.safeParse({
    token,
    options: {
      challenge: 'challenge-value',
      userVerification: 'required',
      allowCredentials: [],
    },
    clientSecret: 'pi_secret_example',
  }).success).toBe(false);
  expect(adminWorkspacePlanChangeVerifiedSchema.safeParse({ verified: true }).success).toBe(true);
  expect(adminWorkspacePlanChangeVerifiedSchema.safeParse({ verified: true, clientSecret: 'pi_secret_example' }).success).toBe(false);
});
