import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CustomersRoute } from './customers-route';
import { customerQueryFixture, customerListFixture, customerDetailFixture, workflowScope } from '../../api/api-workflow.fixtures';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateWorkspaceResources } from '../../api/api-read-options';
import { ApiRequestError } from '../../api/api-request';

const reads = fn();
let failure = 0;
const meta = {
  title: 'Customers/CustomersRoute', component: CustomersRoute, parameters: { layout: 'fullscreen' },
  decorators: [Story => <div className="p-4 sm:p-8"><Story/></div>],
  args: { workspaceId: workflowScope.workspaceId, viewerId: workflowScope.viewerId, initialUpdatedAt: Date.now(), initial: customerListFixture, initialQuery: customerQueryFixture },
  beforeEach: () => {
    reads.mockClear(); failure = 0;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (!path.startsWith('/api/customers')) return original(input, init);
      reads(path);
      if (failure) { const status = failure; failure = 0; return Response.json({ error: 'Read failed.' }, { status }); }
      return Response.json(path.startsWith('/api/customers?') ? customerListFixture : customerDetailFixture);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof CustomersRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ServerSnapshot: Story = { play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('heading', { name: 'Customers' })).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };
export const FilterCacheReuse: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('searchbox'), 'query');
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
  await userEvent.clear(c.getByRole('searchbox'));
  await new Promise(resolve => setTimeout(resolve, 400));
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const Retry: Story = { args: { initialUpdatedAt: 1 }, beforeEach: () => { failure = 500; }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(await c.findByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
} };
export const RevokedAccess: Story = {
  render: function Revocation(props) {
    const client = useQueryClient();
    return <><button className="min-h-11 rounded-xl border p-3" onClick={() => {
      failure = 403;
      void invalidateWorkspaceResources(client, workflowScope.workspaceId, ['customers']).catch(error => {
        if (!(error instanceof ApiRequestError) || error.status !== 403) throw error;
      });
    }}>Revoke access</button><CustomersRoute {...props}/></>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Revoke access' }));
    await expect(await c.findByText('This customer or workspace is no longer available.')).toBeVisible();
    await expect(c.queryByText('Jordan Lee')).not.toBeInTheDocument();
    await expect(c.queryByRole('button', { name: 'Add customer' })).not.toBeInTheDocument();
  },
};
