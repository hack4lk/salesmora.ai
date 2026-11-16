import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useQueryClient } from '@tanstack/react-query';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ApiQueryScopeBoundary, useApiQueryScope } from './api-query-provider';
import { apiQueryKeys, type ApiQueryScope } from './api-query';
import { ApiRequestError } from './api-request';
import { useApiQuery } from './use-api-query';

interface QueryHarnessProps {
  load: (scope: ApiQueryScope, denied: boolean) => Promise<string>;
}
function QueryProbe({ load, denied }: QueryHarnessProps & { denied: boolean }) {
  const scope = useApiQueryScope();
  const result = useApiQuery({
    queryKey: apiQueryKeys.detail(scope, 'fixture', 'one'),
    queryFn: () => load(scope, denied),
  });
  return <section aria-label="Mock API response" className="grid gap-3">
    <output aria-live="polite">{result.data ?? (result.isPending ? 'Loading' : 'No data')}</output>
    {result.isError && <p role="alert">{result.error.message}</p>}
    <button type="button" onClick={() => void result.refetch()} className="min-h-11 rounded-xl border border-line p-3 focus-visible:focus-ring">Refresh</button>
  </section>;
}
function ServerSnapshotProbe() {
  const [version, setVersion] = useState(1);
  const result = useApiQuery({
    queryKey: apiQueryKeys.detail({ viewerId: 'snapshot-viewer', workspaceId: 'snapshot-workspace' }, 'fixture', 'one'),
    queryFn: async () => { throw new Error('The fresh server snapshot must not refetch.'); },
    initialData: `Snapshot ${version}`, initialDataUpdatedAt: 2_000_000_000_000 + version, staleTime: Infinity,
  });
  return <section><output>{result.data}</output><button className="min-h-11 rounded-xl border p-3" onClick={() => setVersion(2)}>Receive newer server snapshot</button></section>;
}
function QueryHarness({ load }: QueryHarnessProps) {
  const client = useQueryClient();
  const [scope, setScope] = useState({ viewerId: 'viewer-a', workspaceId: 'workspace-a' });
  const [visible, setVisible] = useState(true), [denied, setDenied] = useState(false);
  const buttonClass = 'min-h-11 rounded-xl border border-line p-3 focus-visible:focus-ring';
  return <main className="grid max-w-xl gap-4 p-6 text-ink">
    <h1 className="m-0 text-heading font-semibold">API query foundation</h1>
    <p className="m-0">Fictional API responses test the shared cache, scope, and authorization behavior.</p>
    <div className="flex flex-wrap gap-3">
      <button type="button" className={buttonClass} onClick={() => setVisible(!visible)}>{visible ? 'Hide response' : 'Show response'}</button>
      <button type="button" className={buttonClass} onClick={() => setScope({ ...scope, workspaceId: 'workspace-b' })}>Switch workspace</button>
      <button type="button" className={buttonClass} onClick={() => setScope({ ...scope, viewerId: 'viewer-b' })}>Switch viewer</button>
      <button type="button" className={buttonClass} onClick={() => setDenied(true)}>Revoke access</button>
      <button type="button" className={buttonClass} onClick={() => void client.invalidateQueries({ queryKey: apiQueryKeys.resource(scope, 'fixture') })}>Invalidate resource</button>
    </div>
    <ApiQueryScopeBoundary scope={scope}>
      {visible && <QueryProbe load={load} denied={denied} />}
    </ApiQueryScopeBoundary>
  </main>;
}

const meta = {
  title: 'Infrastructure/ApiQueryProvider',
  component: QueryHarness,
  args: { load: fn(async (scope: ApiQueryScope, denied: boolean) => {
    if (denied) throw new ApiRequestError('Access is no longer available.', 403, {});
    return `${scope.viewerId} / ${scope.workspaceId}`;
  }) },
} satisfies Meta<typeof QueryHarness>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FreshCache: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-a');
  await userEvent.click(c.getByRole('button', { name: 'Hide response' }));
  await userEvent.click(c.getByRole('button', { name: 'Show response' }));
  await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-a');
  await expect(args.load).toHaveBeenCalledTimes(1);
} };
export const WorkspaceSwitch: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-a');
  await userEvent.click(c.getByRole('button', { name: 'Switch workspace' }));
  await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-b');
  await expect(args.load).toHaveBeenCalledTimes(2);
} };
export const IdentitySwitch: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-a');
  await userEvent.click(c.getByRole('button', { name: 'Switch viewer' }));
  await expect(c.getByRole('status')).toHaveTextContent('viewer-b / workspace-a');
} };
export const MutationInvalidation: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-a');
  await userEvent.click(c.getByRole('button', { name: 'Invalidate resource' }));
  await expect(args.load).toHaveBeenCalledTimes(2);
} };
export const AccessRevoked: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-a');
  await userEvent.click(c.getByRole('button', { name: 'Revoke access' }));
  await userEvent.click(c.getByRole('button', { name: 'Refresh' }));
  await expect(c.getByRole('alert')).toHaveTextContent('Access is no longer available.');
  await expect(c.getByRole('status')).toHaveTextContent('No data');
  await expect(c.queryByText('viewer-a / workspace-a')).not.toBeInTheDocument();
} };
export const NewerServerSnapshot: Story = {
  render: () => <ApiQueryScopeBoundary scope={{ viewerId: 'snapshot-viewer', workspaceId: 'snapshot-workspace' }}><ServerSnapshotProbe/></ApiQueryScopeBoundary>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Snapshot 1');
    await userEvent.click(c.getByRole('button', { name: 'Receive newer server snapshot' }));
    await expect(c.getByRole('status')).toHaveTextContent('Snapshot 2');
  },
};
export const Retry: Story = {
  args: { load: fn<(scope: ApiQueryScope, denied: boolean) => Promise<string>>()
    .mockRejectedValueOnce(new Error('Temporary fixture failure.'))
    .mockResolvedValue('viewer-a / workspace-a') },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toHaveTextContent('Temporary fixture failure.');
    await expect(args.load).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: 'Refresh' }));
    await expect(c.getByRole('status')).toHaveTextContent('viewer-a / workspace-a');
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  },
};
