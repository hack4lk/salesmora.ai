import { StrictMode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { estimateListQuerySchema } from '@salesmora/contracts';
import { EstimatesReadRoute } from './estimates-read-route';
import { estimateListFixture, estimateSeedFixture } from '../../api/api-estimate.fixtures';
import { workflowScope } from '../../api/api-workflow.fixtures';

const reads = fn(), commands = fn();
let readStatus = 200, malformed = false;
const meta = {
  title: 'Estimates/EstimatesReadRoute', component: EstimatesReadRoute,
  parameters: { layout: 'fullscreen', nextjs: { navigation: { pathname: '/estimates', query: { workspace: workflowScope.workspaceId } } } },
  decorators: [Story => <StrictMode><main className="p-4 sm:p-8"><Story/></main></StrictMode>],
  args: { ...workflowScope, initialQuery: estimateListQuerySchema.parse({ workspaceId: workflowScope.workspaceId }), canReadJobs: true, canReadLeads: true },
  beforeEach: () => {
    reads.mockClear(); commands.mockClear(); readStatus = 200; malformed = false;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (!path.startsWith('/api/estimates')) return original(input, init);
      if (init?.method !== 'GET' && init?.method) {
        commands(path);
        throw new Error('Review stories must not issue a command.');
      }
      reads(path);
      if (path.startsWith('/api/estimates?')) return Response.json(readStatus !== 200 ? { error: 'Estimate list unavailable.' } : malformed ? { rows: [] } : estimateListFixture, { status: readStatus });
      if (path.startsWith(`/api/estimates/${estimateSeedFixture.estimate!.id}?`)) return Response.json(estimateSeedFixture);
      throw new Error(`Unmocked estimate read: ${path}`);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof EstimatesReadRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Loaded: Story = { play: async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByRole('button', { name: 'Actions for Kitchen remodel estimate' })).toBeVisible();
} };
export const Retry: Story = {
  beforeEach: () => { readStatus = 500; },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(await c.findByRole('button', { name: 'Retry' })).toBeVisible();
    readStatus = 200;
    await userEvent.click(c.getAllByRole('button', { name: 'Retry' })[0]);
    await expect(await c.findByRole('button', { name: 'Actions for Kitchen remodel estimate' })).toBeVisible();
  },
};
export const MalformedResponse: Story = {
  beforeEach: () => { malformed = true; },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(await c.findByRole('button', { name: 'Retry' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'Create estimate' })).not.toBeInTheDocument();
  },
};
export const StrictModeFreshDeleteReview: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const open = async () => {
    await userEvent.click(await c.findByRole('button', { name: 'Actions for Kitchen remodel estimate' }));
    await userEvent.click(await body.findByRole('menuitem', { name: 'Delete draft' }));
    const dialog = within(await body.findByRole('alertdialog'));
    await expect(await dialog.findByRole('textbox', { name: 'Estimate number' })).toBeEnabled();
    return dialog;
  };
  let dialog = await open();
  await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
  const previous = reads.mock.calls.filter(([path]) => path.includes(`${estimateSeedFixture.estimate!.id}?`)).length;
  dialog = await open();
  await waitFor(() => expect(reads.mock.calls.filter(([path]) => path.includes(`${estimateSeedFixture.estimate!.id}?`)).length).toBeGreaterThan(previous));
  await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
  await expect(commands).not.toHaveBeenCalled();
} };
