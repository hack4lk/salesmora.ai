import { StrictMode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EstimateEditorRoute } from './estimate-editor-route';
import { estimateSeedFixture, estimateSharingFixture } from '../../api/api-estimate.fixtures';
import { workflowScope } from '../../api/api-workflow.fixtures';

let writeStatus = 200, sharingStatus = 200;
const writes = fn();
const meta = {
  title: 'Estimates/EstimateEditorRoute', component: EstimateEditorRoute, parameters: { layout: 'fullscreen' },
  decorators: [Story => <StrictMode><main className="p-4 sm:p-8"><Story/></main></StrictMode>],
  args: { workspaceId: workflowScope.workspaceId, currentUserId: workflowScope.viewerId, seed: estimateSeedFixture },
  beforeEach: () => {
    writes.mockClear(); writeStatus = 200; sharingStatus = 200;
    let record = structuredClone(estimateSeedFixture.estimate!);
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const url = new URL(String(input), 'http://localhost'), method = init?.method ?? 'GET';
      if (!url.pathname.startsWith('/api/estimates')) return original(input, init);
      if (method === 'PATCH') {
        const command = JSON.parse(String(init?.body));
        writes(command);
        if (writeStatus !== 200) { writeStatus = 200; return Response.json({ error: 'Fixture save failed. Your edits are retained.' }, { status: 500 }); }
        record = { ...record, values: command.values, version: record.version + 1 };
        return Response.json({ id: record.id, number: record.number, revision: record.revision, version: record.version, updatedAt: record.updatedAt });
      }
      if (url.pathname.endsWith('/sharing')) return Response.json(sharingStatus === 200 ? { ...estimateSharingFixture, estimate: record } : { error: 'Sharing access withdrawn.' }, { status: sharingStatus });
      if (url.pathname.endsWith('/lifecycle')) return Response.json({ events: [], total: 0, nextCursor: null, timezone: estimateSeedFixture.timezone });
      if (url.pathname.endsWith('/revisions')) return Response.json({ number: record.number, currentEstimateId: record.id, version: record.version, snapshotHash: null, canRevise: false, revisions: [], total: 0, nextBeforeRevision: null });
      throw new Error(`Unmocked estimate operation: ${method} ${url.pathname}`);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof EstimateEditorRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SavedDraft: Story = { play: async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByRole('textbox', { name: /^Estimate name/ })).toHaveValue('Kitchen remodel estimate');
} };
export const SaveRetryRetainsDraft: Story = {
  beforeEach: () => { writeStatus = 500; },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole('textbox', { name: /^Estimate name/ });
    await userEvent.clear(input); await userEvent.type(input, 'Revised kitchen estimate');
    await userEvent.click(c.getByRole('button', { name: 'Save draft' }));
    await expect(await c.findByText('Fixture save failed. Your edits are retained.')).toBeVisible();
    await expect(input).toHaveValue('Revised kitchen estimate');
    await expect(writes).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: 'Save draft' }));
    await expect(await c.findByText('Draft saved.')).toBeVisible();
    await expect(writes).toHaveBeenCalledTimes(2);
    await expect(writes.mock.calls[0]).toEqual(writes.mock.calls[1]);
  },
};
export const SharingAccessDenied: Story = {
  beforeEach: () => { sharingStatus = 403; },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('Sharing access withdrawn.')).toBeVisible();
    await expect(writes).not.toHaveBeenCalled();
  },
};
