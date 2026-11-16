import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkOrdersRoute } from './work-orders-route';
import { materialListFixture, workOrderDetailFixture, workOrderListFixture } from '../../api/api-catalog.fixtures';
import { workflowScope } from '../../api/api-workflow.fixtures';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateWorkspaceResources } from '../../api/api-read-options';
import { isApiAccessError } from '../../api/api-query';

const reads = fn();
let failure = 0;
const meta = {
  title: 'Work Orders/WorkOrdersRoute', component: WorkOrdersRoute, parameters: { layout: 'fullscreen' },
  decorators: [Story => <div className="p-4 sm:p-8"><Story/></div>],
  args: { ...workflowScope, initialUpdatedAt: Date.now(), initial: workOrderListFixture, initialQuery: { workspaceId: workflowScope.workspaceId }, field: false },
  beforeEach: () => {
    reads.mockClear(); failure = 0;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (path.startsWith('/api/materials?')) return Response.json(materialListFixture);
      if (!path.startsWith('/api/work-orders')) return original(input, init);
      reads(path);
      if (failure) return Response.json({ error: 'Work order unavailable.' }, { status: failure });
      if (path.includes('/visit?')) return Response.json({ source: null, target: null, today: workOrderListFixture.today, canJoin: false, canSeparate: false });
      return Response.json(path.startsWith('/api/work-orders?') ? workOrderListFixture : workOrderDetailFixture);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof WorkOrdersRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ServerSnapshot: Story = { play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('heading', { name: 'Work orders' })).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };
export const FilterCacheReuse: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('searchbox'), 'fitting');
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
  await userEvent.clear(c.getByRole('searchbox'));
  await new Promise(resolve => setTimeout(resolve, 400));
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const Detail: Story = { args: { initialDetail: workOrderDetailFixture } };
export const RevokedAccess: Story = {
  render: function Revocation(props) {
    const client = useQueryClient();
    return <><button className="min-h-11 rounded-xl border p-3" onClick={() => {
      failure = 404;
      void invalidateWorkspaceResources(client, workflowScope.workspaceId, ['work-orders']).catch(error => { if (!isApiAccessError(error)) throw error; });
    }}>Revoke access</button><WorkOrdersRoute {...props}/></>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Revoke access' }));
    await expect(await c.findByText('This work order or workspace is no longer available.')).toBeVisible();
    await expect(c.queryByText('Replace kitchen fitting')).not.toBeInTheDocument();
  },
};
