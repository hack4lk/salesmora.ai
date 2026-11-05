import { expect, it } from 'vitest';
import {
  adminWorkspaceWebhookReplayOperationSchema,
  adminWorkspaceWebhookReplayOverviewSchema,
  adminWorkspaceWebhookReplayResultSchema,
} from './webhook-replay';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const eventId = 'evt_1234567890abcdef';
const token = 'w'.repeat(43);

it('accepts only scoped replay start, factor and commit operations', () => {
  expect(adminWorkspaceWebhookReplayOperationSchema.safeParse({
    operation: 'start',
    workspaceId,
    eventId,
    reason: 'Retry the failed renewal webhook, case 8401',
  }).success).toBe(true);
  expect(adminWorkspaceWebhookReplayOperationSchema.safeParse({
    operation: 'factor',
    workspaceId,
    token,
    method: 'totp',
    code: '123456',
  }).success).toBe(true);
  expect(adminWorkspaceWebhookReplayOperationSchema.safeParse({
    operation: 'commit',
    workspaceId,
    token,
  }).success).toBe(true);
});

it('rejects invalid event IDs, weak reasons and provider-controlled fields', () => {
  expect(adminWorkspaceWebhookReplayOperationSchema.safeParse({
    operation: 'start',
    workspaceId,
    eventId: 'evt_bad-id',
    reason: 'Retry the failed renewal webhook, case 8401',
  }).success).toBe(false);
  expect(adminWorkspaceWebhookReplayOperationSchema.safeParse({
    operation: 'start',
    workspaceId,
    eventId,
    reason: 'retry',
  }).success).toBe(false);
  expect(adminWorkspaceWebhookReplayOperationSchema.safeParse({
    operation: 'start',
    workspaceId,
    eventId,
    reason: 'Retry the failed renewal webhook, case 8401',
    rawPayload: { id: eventId },
  }).success).toBe(false);
});

it('limits successful replay results to queued status', () => {
  expect(adminWorkspaceWebhookReplayResultSchema.safeParse({ status: 'queued' }).success).toBe(true);
  expect(adminWorkspaceWebhookReplayResultSchema.safeParse({
    status: 'queued',
    clientSecret: 'pi_secret_example',
  }).success).toBe(false);
  expect(adminWorkspaceWebhookReplayResultSchema.safeParse({ status: 'processed' }).success).toBe(false);
});

it('exposes replay keys only in a strict Super Admin overview response', () => {
  const overview = {
    workspaceId,
    deletionPending: false,
    methods: ['totp'],
    events: [{
      replayKey: eventId,
      type: 'invoice.payment_failed',
      status: 'retry_scheduled',
      receivedAt: '2026-11-01T10:00:00.000Z',
      processedAt: null,
      attempts: 2,
      retryAt: '2026-11-02T10:00:00.000Z',
    }],
  };
  expect(adminWorkspaceWebhookReplayOverviewSchema.safeParse(overview).success).toBe(true);
  expect(adminWorkspaceWebhookReplayOverviewSchema.safeParse({
    ...overview,
    events: [{ ...overview.events[0], stripePayload: {} }],
  }).success).toBe(false);
  expect(adminWorkspaceWebhookReplayOverviewSchema.safeParse({
    ...overview,
    events: [{ ...overview.events[0], replayKey: 'not-an-event-id' }],
  }).success).toBe(false);
});
