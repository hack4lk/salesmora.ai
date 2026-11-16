import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MaterialsRoute } from './materials-route';
import { materialListFixture } from '../../api/api-catalog.fixtures';
import { workflowScope } from '../../api/api-workflow.fixtures';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateWorkspaceResources } from '../../api/api-read-options';
import { isApiAccessError } from '../../api/api-query';

const reads = fn(), commands = fn();
let readStatus = 200, writeStatus = 200;
const meta = {
  title: 'Materials/MaterialsRoute', component: MaterialsRoute, parameters: { layout: 'fullscreen' },
  decorators: [Story => <div className="p-4 sm:p-8"><Story/></div>],
  args: { ...workflowScope, initialUpdatedAt: Date.now(), initial: materialListFixture, initialQuery: { workspaceId: workflowScope.workspaceId } },
  beforeEach: () => {
    reads.mockClear(); commands.mockClear(); readStatus = 200; writeStatus = 200;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (path === '/api/materials' && init?.method === 'POST') {
        commands(JSON.parse(String(init.body)));
        const status = writeStatus; writeStatus = 200;
        return Response.json(status === 200 ? { materialId: materialListFixture.rows[0].id, version: 2 } : { error: 'The change could not be saved.' }, { status });
      }
      if (!path.startsWith('/api/materials?')) return original(input, init);
      reads(path);
      return Response.json(readStatus === 200 ? materialListFixture : { error: 'Catalog unavailable.' }, { status: readStatus });
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof MaterialsRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ServerSnapshot: Story = { play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('heading', { name: 'Materials' })).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };
export const FilterCacheReuse: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('searchbox'), 'elbow');
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
  await userEvent.clear(c.getByRole('searchbox'));
  await new Promise(resolve => setTimeout(resolve, 400));
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const ExactWriteRetry: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Add material' }));
  const dialog = await body.findByRole('dialog');
  await userEvent.type(within(dialog).getByRole('textbox', { name: /^Name/ }), 'New fitting');
  writeStatus = 500;
  await userEvent.click(within(dialog).getByRole('button', { name: 'Add to catalog' }));
  await expect(await within(dialog).findByText('The change could not be saved.')).toBeVisible();
  await expect(within(dialog).getByRole('textbox', { name: /^Name/ })).toHaveValue('New fitting');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Add to catalog' }));
  await waitFor(() => expect(commands).toHaveBeenCalledTimes(2));
  await expect(commands.mock.calls[0]).toEqual(commands.mock.calls[1]);
  await expect(await c.findByText('Material added to the catalog.')).toBeVisible();
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const RevokedAccess: Story = {
  render: function Revocation(props) {
    const client = useQueryClient();
    return <><button className="min-h-11 rounded-xl border p-3" onClick={() => {
      readStatus = 403;
      void invalidateWorkspaceResources(client, workflowScope.workspaceId, ['materials']).catch(error => { if (!isApiAccessError(error)) throw error; });
    }}>Revoke access</button><MaterialsRoute {...props}/></>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Revoke access' }));
    await expect(await c.findByText('This material catalog or workspace is no longer available.')).toBeVisible();
    await expect(c.queryByText('Copper elbow')).not.toBeInTheDocument();
  },
};
