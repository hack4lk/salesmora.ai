import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { JobsRoute } from './jobs-route';
import { jobListFixture, workflowScope } from '../../api/api-workflow.fixtures';
import { jobQueryFromURL } from '@salesmora/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateWorkspaceResources } from '../../api/api-read-options';
import { ApiRequestError } from '../../api/api-request';

const reads = fn();
let failure = 0;
const meta = {
  title: 'Jobs/JobsRoute', component: JobsRoute, parameters: { layout: 'fullscreen' },
  decorators: [Story => <div className="p-4 sm:p-8"><Story/></div>],
  args: { workspaceId: workflowScope.workspaceId, userId: workflowScope.viewerId, field: false, initialUpdatedAt: Date.now(), initial: jobListFixture, initialQuery: jobQueryFromURL(workflowScope.workspaceId, new URLSearchParams()) },
  beforeEach: () => {
    reads.mockClear(); failure = 0;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (!path.startsWith('/api/jobs?') && !path.startsWith('/api/jobs/creation-deadline?')) return original(input, init);
      reads(path);
      if (failure) { const status = failure; failure = 0; return Response.json({ error: 'Read failed.' }, { status }); }
      if (path.startsWith('/api/jobs/creation-deadline?')) return Response.json({
        context: { rule: { mode: 'unset' }, revision: '1', projectedDate: null, createdDate: '2026-10-19', timezone: 'America/Chicago' }, canOverride: true,
      });
      return Response.json(jobListFixture);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof JobsRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ServerSnapshot: Story = { play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('heading', { name: 'Jobs' })).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };
export const FilterCacheReuse: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('searchbox'), 'q');
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
  await userEvent.clear(c.getByRole('searchbox'));
  await new Promise(resolve => setTimeout(resolve, 400));
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const Retry: Story = { args: { initialUpdatedAt: 1 }, beforeEach: () => { failure = 500; }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(await c.findByRole('button', { name: 'Reload latest details' }));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
} };
export const RevokedAccess: Story = {
  render: function Revocation(props) {
    const client = useQueryClient();
    return <><button className="min-h-11 rounded-xl border p-3" onClick={() => {
      failure = 403;
      void invalidateWorkspaceResources(client, workflowScope.workspaceId, ['jobs']).catch(error => {
        if (!(error instanceof ApiRequestError) || error.status !== 403) throw error;
      });
    }}>Revoke access</button><JobsRoute {...props}/></>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Revoke access' }));
    await expect(await c.findByText('This job is no longer available to you.')).toBeVisible();
    await expect(c.queryByText('Kitchen sink repair')).not.toBeInTheDocument();
    await expect(c.queryByRole('button', { name: 'Create job' })).not.toBeInTheDocument();
  },
};
export const CreationDeadlineCache: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: 'Create job' }));
  await expect(await body.findByRole('textbox', { name: /^Job title/ })).toBeVisible();
  await expect(reads).toHaveBeenCalledTimes(1);
  await userEvent.click(body.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await userEvent.click(c.getByRole('button', { name: 'Create job' }));
  await expect(await body.findByRole('textbox', { name: /^Job title/ })).toBeVisible();
  await expect(reads).toHaveBeenCalledTimes(1);
  await userEvent.click(body.getByRole('button', { name: 'Cancel' }));
} };
