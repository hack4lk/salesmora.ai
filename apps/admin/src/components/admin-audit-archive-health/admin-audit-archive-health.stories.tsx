import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminAuditArchiveHealth } from './admin-audit-archive-health';
import { adminAuditArchiveHealthData as copy } from './admin-audit-archive-health-copy.data';

const now = '2026-10-31T12:00:00.000Z';
const ledgerId = '00000000-0000-4000-8000-000000000001';
const target = { accountId: 'a'.repeat(32), bucket: 'audit-fictional-only', jurisdiction: 'default' as const };
const checkpoint = {
  version: 1 as const, format: 'salesmora.admin-audit.ndjson' as const, ledgerId,
  previousCheckpoint: null, firstSequence: '1', throughSequence: '1', eventCount: 1,
  byteLength: 100, sha256: 'b'.repeat(64), headHash: 'c'.repeat(64),
};
const checkpointSHA256 = 'd'.repeat(64);
const objectKey = `admin-audit/v1/${ledgerId}/segments/${checkpoint.sha256}.ndjson`;
const checkpointKey = `admin-audit/v1/${ledgerId}/checkpoints/${checkpointSHA256}.json`;
const evidence = {
  state: 'snapshot_checked' as const, target, objectKey, checkpointKey, checkpointSHA256,
  objectSHA256: checkpoint.sha256, throughSequence: '1', headHash: checkpoint.headHash,
  eventCount: 1, checkedAt: now,
  locks: [objectKey, checkpointKey].map(key => ({
    key, ruleId: 'fictional-year-rule', uploadedAt: now, checkedAt: now, protectedUntil: null,
  })),
};
const accepted = {
  state: 'reported' as const, observedAt: now,
  latestCopy: {
    scope: { ledgerId, throughSequence: '1', previousCheckpoint: null }, state: 'copied' as const,
    attempts: 1, updatedAt: now, failureCode: null,
    latestAttempt: { state: 'copied' as const, startedAt: now, finishedAt: now, failureCode: null },
    latestCheck: { state: 'accepted' as const, checkedAt: now },
  },
  latestAccepted: {
    retained: { version: 1 as const, target, scope: { ledgerId, throughSequence: '1', previousCheckpoint: null },
      checkpoint, checkpointSHA256 },
    evidence,
  },
};
const pending = {
  state: 'reported' as const, observedAt: now,
  latestCopy: {
    scope: { ledgerId, throughSequence: '2', previousCheckpoint: null }, state: 'copying' as const,
    attempts: 1, updatedAt: now, failureCode: null,
    latestAttempt: { state: 'copying' as const, startedAt: now, finishedAt: null, failureCode: null },
    latestCheck: null,
  },
  latestAccepted: null,
};

type Mode = 'accepted' | 'pending' | 'failed-with-accepted' | 'unconfigured' | 'unavailable' | 'invalid' | 'denied';
function mock(mode: Mode = 'accepted') {
  const original = window.fetch;
  window.fetch = async input => {
    const url = new URL(String(input), window.location.origin);
    if (url.pathname !== '/api/admin/audit/archive-health') throw new Error('Unexpected Storybook request');
    if (mode === 'unavailable') return new Response('{}', { status: 503 });
    if (mode === 'denied') return new Response('{"error":"denied"}', { status: 403 });
    if (mode === 'invalid') return new Response('{"state":"reported"}', { status: 200 });
    if (mode === 'unconfigured') return new Response(JSON.stringify({ state: 'unconfigured', observedAt: now }));
    if (mode === 'pending') return new Response(JSON.stringify(pending));
    if (mode === 'failed-with-accepted') return new Response(JSON.stringify({
      ...accepted,
      latestCopy: { ...accepted.latestCopy, state: 'failed', failureCode: 'operation_failed',
        latestCheck: { state: 'failed', checkedAt: now, failureCode: 'operation_failed' } },
    }));
    return new Response(JSON.stringify(accepted));
  };
  return () => { window.fetch = original; };
}
const meta = {
  title: 'Admin/Audit/AdminAuditArchiveHealth',
  component: AdminAuditArchiveHealth,
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  beforeEach: () => mock(),
} satisfies Meta<typeof AdminAuditArchiveHealth>;
export default meta;
type Story = StoryObj<typeof meta>;
const panel = (canvas: ReturnType<typeof within>) => within(canvas.getByRole('region', { name: copy.title }));

export const IndependentlyAcceptedSnapshot: Story = {
  play: async ({ canvasElement }) => {
    const targetPanel = panel(within(canvasElement));
    await waitFor(() => expect(targetPanel.getByRole('heading', { name: copy.states.accepted })).toBeVisible());
    await expect(targetPanel.getByText(/audit-fictional-only \(default\)/)).toBeVisible();
    await expect(targetPanel.getAllByText(/Indefinite \(as observed\)/)).toHaveLength(2);
    await expect(targetPanel.getByText(copy.notice)).toBeVisible();
  },
};

export const CopyAwaitingVerification: Story = {
  beforeEach: () => mock('pending'),
  play: async ({ canvasElement }) => {
    const targetPanel = panel(within(canvasElement));
    await waitFor(() => expect(targetPanel.getByRole('heading', { name: copy.states.copying })).toBeVisible());
    await expect(targetPanel.getByText(copy.hints.copying)).toBeVisible();
    await expect(targetPanel.getByText(copy.noAccepted)).toBeVisible();
  },
};

export const FailedCopyRetainsEarlierAcceptance: Story = {
  beforeEach: () => mock('failed-with-accepted'),
  play: async ({ canvasElement }) => {
    const targetPanel = panel(within(canvasElement));
    await waitFor(() => expect(targetPanel.getByRole('alert')).toHaveTextContent(copy.states.failed));
    await expect(targetPanel.getByText(/Archived events: 1/)).toBeVisible();
    await expect(targetPanel.getByText(copy.labels.lockedObjects)).toBeVisible();
  },
};

export const NoRecordedPublication: Story = {
  beforeEach: () => mock('unconfigured'),
  play: async ({ canvasElement }) => {
    const targetPanel = panel(within(canvasElement));
    await waitFor(() => expect(targetPanel.getByText(copy.unconfigured)).toBeVisible());
    await expect(targetPanel.getByRole('button', { name: copy.reload })).toBeVisible();
  },
};

export const UnavailableStatusCanOnlyBeReloaded: Story = {
  beforeEach: () => mock('unavailable'),
  play: async ({ canvasElement }) => {
    const targetPanel = panel(within(canvasElement));
    await expect(targetPanel.getByRole('alert')).toHaveTextContent(copy.unavailable);
    await targetPanel.getByRole('button', { name: copy.reload }).click();
    await waitFor(() => expect(targetPanel.getByRole('alert')).toHaveTextContent(copy.unavailable));
  },
};

export const InvalidResponse: Story = {
  beforeEach: () => mock('invalid'),
  play: async ({ canvasElement }) => {
    const targetPanel = panel(within(canvasElement));
    await waitFor(() => expect(targetPanel.getByRole('alert')).toHaveTextContent(copy.invalid));
  },
};

export const AccessDenied: Story = {
  beforeEach: () => mock('denied'),
  play: async ({ canvasElement }) => {
    const targetPanel = panel(within(canvasElement));
    await waitFor(() => expect(targetPanel.getByRole('alert')).toHaveTextContent(copy.denied));
  },
};
