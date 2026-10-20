import { describe, expect, it, vi } from 'vitest';
import { accountDeletionRequestSchema } from '@salesmora/contracts';
import type { Stripe } from './billing/stripe';
import { cancelDeletedWorkspaceBilling } from './account-deletion';

function provider({ mismatch = false, schedule = false } = {}) {
  const sub = { id: 'sub_fixture', livemode: false, customer: 'cus_fixture', metadata: { workspaceId: mismatch ? 'another' : 'workspace' }, status: 'active', schedule: schedule ? 'sched_fixture' : null };
  const expire = vi.fn(async () => ({}));
  const cancel = vi.fn(async () => ({ ...sub, status: 'canceled' }));
  let scheduledCanceled = false;
  const scheduleCancel = vi.fn(async () => { scheduledCanceled = true; });
  const stripe = {
    customers: { retrieve: vi.fn(async () => ({ id: 'cus_fixture', livemode: false, metadata: { workspaceId: 'workspace' } })) },
    checkout: { sessions: { list: () => (async function* () { yield { id: 'cs_fixture', livemode: false, metadata: { workspaceId: 'workspace' }, client_reference_id: 'workspace', status: 'open' }; })(), expire } },
    subscriptions: { list: () => (async function* () { yield sub; })(), cancel, retrieve: vi.fn(async () => ({ ...sub, status: scheduledCanceled || cancel.mock.calls.length ? 'canceled' : 'active' })) },
    subscriptionSchedules: { retrieve: vi.fn(async () => ({ livemode: false, customer: 'cus_fixture', subscription: sub.id, status: 'active' })), cancel: scheduleCancel },
  } as unknown as Stripe;
  return { stripe, cancel, expire, scheduleCancel };
}
describe('account deletion provider boundary', () => {
  it('expires checkout and immediately cancels with no final invoice or refund proration', async () => {
    const p = provider();
    await cancelDeletedWorkspaceBilling(p.stripe, { customerId: 'cus_fixture', subscriptionId: 'sub_fixture' }, 'workspace');
    expect(p.expire).toHaveBeenCalledWith('cs_fixture');
    expect(p.cancel).toHaveBeenCalledWith('sub_fixture', { invoice_now: false, prorate: false });
  });
  it('cancels a managed downgrade schedule before verifying its subscription', async () => {
    const p = provider({ schedule: true });
    await cancelDeletedWorkspaceBilling(p.stripe, { customerId: 'cus_fixture', subscriptionId: 'sub_fixture' }, 'workspace');
    expect(p.scheduleCancel).toHaveBeenCalledWith('sched_fixture', { invoice_now: false, prorate: false });
    expect(p.cancel).not.toHaveBeenCalled();
  });
  it('fails closed on another workspace subscription', async () => {
    const p = provider({ mismatch: true });
    await expect(cancelDeletedWorkspaceBilling(p.stripe, { customerId: 'cus_fixture', subscriptionId: null }, 'workspace')).rejects.toThrow('mapping');
    expect(p.cancel).not.toHaveBeenCalled();
  });
  it('rejects unverified cancellation instead of allowing purge', async () => {
    const p = provider(); p.cancel.mockResolvedValueOnce({ status: 'active' } as never);
    await expect(cancelDeletedWorkspaceBilling(p.stripe, { customerId: 'cus_fixture', subscriptionId: null }, 'workspace')).rejects.toThrow('unverified');
  });
  it('requires exact acknowledgement and rejects injected authority/provider fields', () => {
    const payload = { workspaceId: '00000000-0000-4000-8000-000000000001', password: 'test', confirmation: 'Workspace', acknowledged: true };
    expect(accountDeletionRequestSchema.safeParse(payload).success).toBe(true);
    expect(accountDeletionRequestSchema.safeParse({ ...payload, acknowledged: false }).success).toBe(false);
    expect(accountDeletionRequestSchema.safeParse({ ...payload, role: 'owner' }).success).toBe(false);
    expect(accountDeletionRequestSchema.safeParse({ ...payload, customerId: 'cus_other' }).success).toBe(false);
  });
});
