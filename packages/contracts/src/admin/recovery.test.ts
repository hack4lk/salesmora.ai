import { expect, it } from 'vitest';
import {
  adminWorkspaceRecoveryOperationSchema,
  adminWorkspaceRecoveryPreviewResponseSchema,
  adminWorkspaceRecoveryResultSchema,
} from './recovery';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const recoveryId = '00000000-0000-4000-8000-000000000002';

it('accepts only scoped recovery actions and bounds grace extensions', () => {
  expect(adminWorkspaceRecoveryOperationSchema.safeParse({
    operation: 'preview',
    workspaceId,
  }).success).toBe(true);
  expect(adminWorkspaceRecoveryOperationSchema.safeParse({
    operation: 'start',
    action: 'retry',
    workspaceId,
    recoveryId,
    reason: 'Owner confirmed this renewal recovery',
  }).success).toBe(true);
  expect(adminWorkspaceRecoveryOperationSchema.safeParse({
    operation: 'start',
    action: 'extend_grace',
    workspaceId,
    additionalDays: 7,
    reason: 'Workspace is resolving a payment issue',
  }).success).toBe(true);
  for (const additionalDays of [0, 8, 1.5]) {
    expect(adminWorkspaceRecoveryOperationSchema.safeParse({
      operation: 'start',
      action: 'extend_grace',
      workspaceId,
      additionalDays,
      reason: 'Workspace is resolving a payment issue',
    }).success).toBe(false);
  }
});

it('rejects provider-controlled inputs, unbound actions and weak reasons', () => {
  for (const extra of [
    { invoiceId: 'in_example' },
    { paymentIntentId: 'pi_example' },
    { clientSecret: 'pi_secret_example' },
    { amountDue: 1 },
  ]) {
    expect(adminWorkspaceRecoveryOperationSchema.safeParse({
      operation: 'start',
      action: 'retry',
      workspaceId,
      recoveryId,
      reason: 'Owner confirmed this renewal recovery',
      ...extra,
    }).success).toBe(false);
  }
  expect(adminWorkspaceRecoveryOperationSchema.safeParse({
    operation: 'start',
    action: 'cancel',
    workspaceId,
    reason: 'Stop',
  }).success).toBe(false);
  expect(adminWorkspaceRecoveryOperationSchema.safeParse({
    operation: 'start',
    action: 'retry',
    workspaceId,
    recoveryId,
    reason: 'Too short',
  }).success).toBe(false);
});

it('limits preview data and action results to safe provider state', () => {
  expect(adminWorkspaceRecoveryPreviewResponseSchema.safeParse({
    workspaceId,
    providerStatus: 'available',
    invoice: {
      number: 'SM-002',
      createdAt: '2026-11-02T00:00:00.000Z',
      status: 'open',
      amountDue: 2900,
    },
    paymentState: 'requires_action',
    recovery: {
      id: recoveryId,
      state: 'action',
      amountDue: 2900,
      attempts: 1,
      createdAt: '2026-11-02T00:00:00.000Z',
      attemptedAt: '2026-11-02T00:01:00.000Z',
      retryAt: '2026-11-02T00:02:00.000Z',
      retriesCancelledAt: null,
    },
    grace: {
      currentUntil: '2026-11-09T00:00:00.000Z',
      maximumUntil: '2026-11-16T00:00:00.000Z',
      additionalDaysAvailable: 7,
    },
  }).success).toBe(true);
  expect(adminWorkspaceRecoveryPreviewResponseSchema.safeParse({
    workspaceId,
    providerStatus: 'available',
    invoice: null,
    paymentState: 'none',
    recovery: null,
    grace: { currentUntil: null, maximumUntil: null, additionalDaysAvailable: 0 },
    clientSecret: 'pi_secret_example',
  }).success).toBe(false);
  expect(adminWorkspaceRecoveryResultSchema.safeParse({
    status: 'owner_action_required',
    recoveryId,
    handoff: 'workspace_owner_billing',
  }).success).toBe(true);
  expect(adminWorkspaceRecoveryResultSchema.safeParse({
    status: 'owner_action_required',
    recoveryId,
    handoff: 'workspace_owner_billing',
    clientSecret: 'pi_secret_example',
  }).success).toBe(false);
});
