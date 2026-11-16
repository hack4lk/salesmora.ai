import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { estimateConversionChatViewSchema } from '@salesmora/contracts';
import { ConnectedEstimateConversion } from './estimate-convert-result';
import { estimateConvertResultData as copy } from './estimate-convert-result.data';
const workspaceId = '10000000-0000-4000-8000-000000000001';
function fixture() {
  const estimate = {
    id: '10000000-0000-4000-8000-000000000002', number: 'EST-2048', revision: 1, version: 3,
    name: 'Fictional repair', status: 'accepted', archived: false, parentType: 'lead',
    parentId: '10000000-0000-4000-8000-000000000003', parentNumber: 'LD-1024', snapshotHash: 'a'.repeat(64),
    totalCents: 10000, customerId: '10000000-0000-4000-8000-000000000004', sourceLeadVersion: 4,
    sourceLeadArchived: false, customerVersion: 2, convertedJobExists: false, sourceLeadHasJob: false,
    service: 'Plumbing', scope: 'Repair the fictional fixture.', serviceAddress: '1 Fixture Avenue', convertedJob: null,
  };
  const customer = { state: 'ready', id: estimate.customerId, name: 'Fictional Customer' }, now = Date.now();
  return estimateConversionChatViewSchema.parse({
    ticket: { id: '10000000-0000-4000-8000-000000000005', actionType: 'estimate.convert',
      inputHash: 'b'.repeat(64), authorizationVersion: 'c'.repeat(64), createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 900000).toISOString(), state: 'pending', estimate, customer },
    review: { estimate, capabilities: { read: true }, canCreateJob: true, canScheduleCreation: false, canResolveCustomer: false, customer,
      review: { estimateId: estimate.id, expectedVersion: 3, expectedLeadVersion: 4, expectedCustomerVersion: 2,
        snapshotHash: estimate.snapshotHash, sourceLeadId: estimate.parentId,
        job: { customerId: customer.id, customerName: customer.name, title: estimate.name, service: estimate.service,
          location: estimate.serviceAddress, description: estimate.scope, primaryOwnerId: null, teamUserIds: [],
          scheduledDate: null, arrivalWindow: null, completionDeadline: null } },
      members: [], parentJob: null },
  });
}
const initial = fixture();
function mock(mode: 'ready' | 'denied' | 'mismatch' = 'ready') {
  const original = globalThis.fetch;
  globalThis.fetch = fn(async (_input, options) => {
    if (mode === 'denied') return Response.json({ error: copy.unavailable }, { status: 403 });
    const view = structuredClone(initial);
    if (mode === 'mismatch') view.ticket.inputHash = 'f'.repeat(64);
    if (options?.method === 'POST') view.ticket.state = 'cancelled';
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}
const meta = {
  title: 'Assistant/ConnectedEstimateConversion', component: ConnectedEstimateConversion,
  args: { ticket: initial.ticket, workspaceId, onRefresh: fn(async () => {}), onOpenReview: fn(), onNavigate: fn() },
  beforeEach: () => mock(), decorators: [Story => <main className="mx-auto max-w-4xl bg-canvas p-4"><Story /></main>],
} satisfies Meta<typeof ConnectedEstimateConversion>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement, args }) => {
  await expect(await within(canvasElement).findByRole('button', { name: 'Review job details' })).toBeEnabled();
  await expect(args.onOpenReview).not.toHaveBeenCalled(); await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: 'Cancel proposal' }));
  await expect(await c.findByText('The host reports this proposal was cancelled. No job creation was requested by this card.')).toBeVisible();
  await expect(args.onRefresh).toHaveBeenCalledTimes(1); await expect(args.onOpenReview).not.toHaveBeenCalled();
} };
export const Denied: Story = { beforeEach: () => mock('denied'), play: async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByText(copy.unavailable)).toBeVisible();
} };
export const MismatchedReview: Story = { beforeEach: () => mock('mismatch'), play: async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByText(copy.error)).toBeVisible();
} };
