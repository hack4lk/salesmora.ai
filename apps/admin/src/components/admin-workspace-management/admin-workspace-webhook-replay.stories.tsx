import type { AdminWorkspaceBillingResponse, AdminWorkspaceWebhookReplayOverview } from '@salesmora/contracts';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminWorkspaceWebhookReplay } from './admin-workspace-webhook-replay';
import { adminWorkspaceWebhookReplayCopy as copy } from './admin-workspace-webhook-replay-copy.data';

const workspaceId = 'c65817f9-d60b-4cad-8096-1cfc2b40ece2';
const eventId = 'evt_storybook123456789';
const verificationToken = 's'.repeat(43);
const eligibleEvent = {
  replayKey: eventId,
  type: 'invoice.payment_failed',
  status: 'retry_scheduled',
  receivedAt: '2026-11-01T10:00:00.000Z',
  processedAt: null,
  attempts: 2,
  retryAt: '2026-11-02T10:00:00.000Z',
} as const;
const overview: AdminWorkspaceWebhookReplayOverview = {
  workspaceId,
  deletionPending: false,
  methods: ['totp'],
  events: [
    eligibleEvent,
    {
      replayKey: 'evt_storybookprocessed',
      type: 'invoice.paid',
      status: 'processed',
      receivedAt: '2026-10-30T10:00:00.000Z',
      processedAt: '2026-10-30T10:00:01.000Z',
      attempts: 1,
      retryAt: '2026-10-30T10:00:00.000Z',
    },
    {
      replayKey: 'evt_storybookpending',
      type: 'invoice.payment_failed',
      status: 'pending',
      receivedAt: '2026-10-29T10:00:00.000Z',
      processedAt: null,
      attempts: 0,
      retryAt: '2026-10-29T10:00:00.000Z',
    },
  ],
};
const fallbackEvents: AdminWorkspaceBillingResponse['webhookEvents'] = overview.events.map(event => ({
  type: event.type,
  status: event.status,
  receivedAt: event.receivedAt,
  processedAt: event.processedAt,
  attempts: event.attempts,
  retryAt: event.retryAt,
}));

let originalFetch: typeof window.fetch;
let reads = 0;
let startBody: unknown;
let factorBody: unknown;
let commitBody: unknown;

function mockReplay({
  current = overview,
  startStatus = 200,
  commitStatus = 200,
}: {
  current?: AdminWorkspaceWebhookReplayOverview;
  startStatus?: number;
  commitStatus?: number;
} = {}) {
  originalFetch = window.fetch;
  reads = 0;
  startBody = null;
  factorBody = null;
  commitBody = null;
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.endsWith('/billing/webhooks/replay')) {
      return Response.json({ error: copy.requestUnavailable }, { status: 503 });
    }
    if (init?.method !== 'POST') {
      reads++;
      return Response.json(current);
    }
    const body = JSON.parse(String(init.body)) as { operation: string };
    if (body.operation === 'start') {
      startBody = body;
      return startStatus === 200
        ? Response.json({
          token: verificationToken,
          options: {
            challenge: 'storybook-webhook-replay-challenge',
            userVerification: 'required',
            allowCredentials: [],
          },
        })
        : Response.json({ error: copy.stale }, { status: startStatus });
    }
    if (body.operation === 'factor') {
      factorBody = body;
      return Response.json({ verified: true });
    }
    if (body.operation === 'commit') {
      commitBody = body;
      return commitStatus === 200
        ? Response.json({ status: 'queued' })
        : Response.json({ error: copy.stale }, { status: commitStatus });
    }
    return Response.json({ error: copy.requestUnavailable }, { status: 400 });
  };
  return () => { window.fetch = originalFetch; };
}

async function beginReplay(canvas: ReturnType<typeof within>, page: ReturnType<typeof within>) {
  await userEvent.click(await canvas.findByRole('button', { name: copy.replay }));
  const dialog = within(page.getByRole('alertdialog'));
  await userEvent.type(dialog.getByRole('textbox', { name: copy.reason }),
    'Replay the failed renewal event after confirming its state, case 8405');
  await userEvent.click(dialog.getByRole('button', { name: copy.startVerification }));
  await userEvent.type(dialog.getByRole('textbox', { name: copy.code }), '123456');
  await userEvent.click(dialog.getByRole('button', { name: copy.verifyAndReview }));
  return dialog;
}

const meta = {
  title: 'Admin/Customers/AdminWorkspaceWebhookReplay',
  component: AdminWorkspaceWebhookReplay,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    workspaceId,
    fallbackEvents,
    canReplayWebhooks: true,
    onComplete: fn(),
  },
} satisfies Meta<typeof AdminWorkspaceWebhookReplay>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EligibleFailureQueuesTheExistingEvent: Story = {
  beforeEach: () => mockReplay(),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByRole('button', { name: copy.replay })).toBeEnabled();
    expect(canvas.getAllByRole('button', { name: copy.replay })).toHaveLength(1);
    await expect(canvas.getByText('processed', { exact: true })).toBeVisible();
    const dialog = await beginReplay(canvas, page);
    await expect(dialog.getByRole('note')).toHaveTextContent(copy.confirmation);
    await userEvent.click(dialog.getByRole('button', { name: copy.queueReplay }));
    await expect(canvas.getByText(copy.queued, { exact: true })).toBeVisible();
    await expect(args.onComplete).toHaveBeenCalledOnce();
    expect(startBody).toMatchObject({
      operation: 'start',
      workspaceId,
      eventId,
      reason: 'Replay the failed renewal event after confirming its state, case 8405',
    });
    expect(factorBody).toMatchObject({
      operation: 'factor',
      workspaceId,
      token: verificationToken,
      method: 'totp',
      code: '123456',
    });
    expect(commitBody).toMatchObject({
      operation: 'commit',
      workspaceId,
      token: verificationToken,
    });
  },
};

export const SupportAndBillingRolesKeepEventsReadOnly: Story = {
  args: { canReplayWebhooks: false },
  beforeEach: () => mockReplay(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByText('invoice.payment_failed')).toHaveLength(2);
    await expect(canvas.queryByRole('button', { name: copy.replay })).not.toBeInTheDocument();
    expect(reads).toBe(0);
  },
};

export const ChangedEventRequiresARefresh: Story = {
  beforeEach: () => mockReplay({ commitStatus: 409 }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await beginReplay(canvas, page);
    await userEvent.click(dialog.getByRole('button', { name: copy.queueReplay }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stale);
    expect(commitBody).toMatchObject({
      operation: 'commit',
      workspaceId,
      token: verificationToken,
    });
  },
};

export const DeletionPendingCannotReplay: Story = {
  args: { deletionPending: true },
  beforeEach: () => mockReplay(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(copy.deletionPending)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.replay })).not.toBeInTheDocument();
    expect(reads).toBe(0);
  },
};
