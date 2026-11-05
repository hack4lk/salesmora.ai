import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { auditPageSchema, type AuditPage } from '@salesmora/contracts';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminAuditViewerPage } from './admin-audit-viewer-page';
import { adminAuditViewerData as copy, auditPreviewEvents } from './admin-audit-viewer.data';
import { adminAuditViewerData as liveCopy } from './admin-audit-viewer-copy.data';

const initial: AuditPage = auditPageSchema.parse({
  events: auditPreviewEvents.slice(0, 5), total: 10, page: 0, pageSize: 5, asOf: copy.stories.now, throughSequence: '12',
  actors: [{ id: 'staff-jordan', name: 'Jordan Lee' }, { id: 'staff-morgan', name: 'Morgan Patel' }, { id: 'system', name: 'System' }],
});
let calls: { method: string; params: URLSearchParams }[] = [];
type Mode = 'normal' | 'read-error' | 'denied' | 'expired' | 'invalid' | 'broken' | 'verify-error' | 'race' | 'denied-race' | 'denied-error-race';
function mock(mode: Mode = 'normal', hash = '') {
  const original = window.fetch;
  const originalHash = window.location.hash;
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
  calls = [];
  window.fetch = async (input, options) => {
    const url = new URL(String(input), window.location.origin);
    if (url.pathname !== '/api/admin/audit') throw new Error('Unexpected audit Storybook request');
    const method = options?.method ?? 'GET';
    calls.push({ method, params: url.searchParams });
    const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    if (mode === 'denied') return response({ error: copy.liveDenied }, 403);
    if (mode === 'expired') return response({ error: liveCopy.stories.expired }, 401);
    if (mode === 'invalid') return response({ events: [], valid: true });
    if (method === 'POST') {
      if (mode === 'denied-race' || mode === 'denied-error-race') return response({ error: copy.liveDenied }, 403);
      if (mode === 'verify-error') return response({ error: liveCopy.stories.unavailable }, 503);
      return response(mode === 'broken' ? { state: 'broken', checked: 5, sequence: '8', throughSequence: '12', checkedAt: copy.stories.now }
        : { state: 'intact', checked: 12, throughSequence: '12', headHash: auditPreviewEvents[0].hash, checkedAt: copy.stories.now });
    }
    if (mode === 'read-error') return response({ error: liveCopy.stories.unavailable }, 503);
    const query = url.searchParams.get('query') ?? '';
    if ((mode === 'race' && query === 'staff-taylor') || mode === 'denied-race' || mode === 'denied-error-race') await new Promise(resolve => setTimeout(resolve, 1000));
    if (mode === 'denied-error-race') return response({ error: liveCopy.stories.unavailable }, 503);
    const actor = url.searchParams.get('actor');
    const category = url.searchParams.get('category');
    const range = url.searchParams.get('range');
    const events = auditPreviewEvents.filter(event => (range === 'year' || Date.parse(event.occurredAt) >= Date.parse(copy.stories.now) - 7 * 86400000) &&
      (!query || [event.targetId, event.workspaceId, event.requestId, event.action].some(value => value?.includes(query))) &&
      (!actor || (event.actorId ?? 'system') === actor) && (!category || category === 'all' || event.category === category));
    const page = Math.min(Number(url.searchParams.get('page') ?? 0), Math.max(0, Math.ceil(events.length / 5) - 1));
    return response({ ...initial, total: events.length, page, events: events.slice(page * 5, page * 5 + 5),
      throughSequence: url.searchParams.get('throughSequence') ?? '13' });
  };
  return () => {
    window.fetch = original;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${originalHash}`);
  };
}
const meta = {
  title: 'Admin/Audit/AdminAuditViewer',
  component: AdminAuditViewerPage,
  args: { initialPage: initial },
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  beforeEach: () => mock(),
} satisfies Meta<typeof AdminAuditViewerPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.liveNotice)).toBeVisible();
    await expect(canvas.queryByText(copy.previewNotice)).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: copy.export })).toBeEnabled();
  },
};
export const ServerPagination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.next }));
    await waitFor(() => expect(canvas.getByText(copy.results(6, 10, 10))).toBeVisible());
    await expect(calls.at(-1)?.params.get('page')).toBe('1');
    await expect(calls.at(-1)?.params.get('throughSequence')).toBe('12');
    await expect(calls.at(-1)?.params.get('asOf')).toBe(initial.asOf);
  },
};
export const ServerFiltersAndTargetLink: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: `${copy.show}: audit-demo-12` }));
    await userEvent.click(canvas.getByRole('button', { name: copy.onlyTarget }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText(copy.results(1, 3, 3))).toBeVisible());
    await expect(new URLSearchParams(window.location.hash.slice(1)).get('q')).toBe('staff-taylor');
    await expect(calls.at(-1)?.params.get('query')).toBe('staff-taylor');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.actor }), 'staff-jordan');
    await waitFor(() => expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible());
    await expect(calls.at(-1)?.params.get('actor')).toBe('staff-jordan');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await waitFor(() => expect(canvas.getByText(copy.results(1, 5, 10))).toBeVisible());
  },
};
export const DeepLinkOnLoad: Story = {
  beforeEach: () => mock('normal', '#q=ws_demo_001'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: /Search events/ })).toHaveValue('ws_demo_001');
    await waitFor(() => expect(canvas.getByText(copy.results(1, 3, 3))).toBeVisible());
  },
};
export const HashNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    window.location.hash = 'q=request-demo-10';
    await waitFor(() => expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible());
    await expect(canvas.getByText('staff.super_admin.approved')).toBeVisible();
  },
};
export const InvalidDeepLink: Story = {
  beforeEach: () => mock('normal', `#q=${'x'.repeat(255)}`),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('alert')[0]).toHaveTextContent(liveCopy.invalidLink);
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
  },
};
export const RefreshCapturesNewSnapshot: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.refresh }));
    await waitFor(() => expect(canvas.getByText(copy.results(1, 5, 10))).toBeVisible());
    await expect(calls.at(-1)?.params.has('throughSequence')).toBe(false);
    await expect(calls.at(-1)?.params.has('asOf')).toBe(false);
  },
};
export const DatabaseChainVerified: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.liveVerify }));
    await expect(canvas.getByText(copy.liveIntact)).toBeVisible();
    await expect(canvas.getByText(`${copy.throughSequence}: 12`)).toBeVisible();
    await expect(calls.at(-1)?.method).toBe('POST');
    await expect(calls.at(-1)?.params.size).toBe(0);
  },
};
export const BrokenDatabaseChain: Story = {
  beforeEach: () => mock('broken'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.liveVerify }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.liveBroken);
    await expect(canvas.getByText(copy.liveBrokenHint)).toBeVisible();
  },
};
export const ReadFailed: Story = {
  beforeEach: () => mock('read-error'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.next }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(liveCopy.stories.unavailable));
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: copy.liveRetry })).toBeEnabled();
  },
};
export const RoleRevoked: Story = {
  beforeEach: () => mock('denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.refresh }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(copy.liveDenied));
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: copy.liveVerify })).not.toBeInTheDocument();
  },
};
export const SessionExpired: Story = {
  beforeEach: () => mock('expired'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.refresh }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(liveCopy.stories.expired));
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
  },
};
export const MalformedResponse: Story = {
  beforeEach: () => mock('invalid'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.refresh }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(liveCopy.invalid));
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
  },
};
export const ChainRequestFailed: Story = {
  beforeEach: () => mock('verify-error'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.liveVerify }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(liveCopy.stories.unavailable);
    await expect(canvas.getByRole('button', { name: copy.liveVerify })).toBeEnabled();
  },
};
export const StaleResponseIgnored: Story = {
  beforeEach: () => mock('race'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: /Search events/ });
    await userEvent.type(input, 'staff-taylor');
    await waitFor(() => expect(calls.some(call => call.params.get('query') === 'staff-taylor')).toBe(true));
    await userEvent.clear(input);
    await userEvent.type(input, 'request-demo-10');
    await waitFor(() => expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible());
    await new Promise(resolve => setTimeout(resolve, 1100));
    await expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible();
    await expect(canvas.getByText('staff.super_admin.approved')).toBeVisible();
  },
};
export const DeniedVerificationCannotBeUndoneByOldRead: Story = {
  beforeEach: () => mock('denied-race'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.refresh }));
    await waitFor(() => expect(calls.some(call => call.method === 'GET')).toBe(true));
    await userEvent.click(canvas.getByRole('button', { name: copy.liveVerify }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.liveDenied);
    await new Promise(resolve => setTimeout(resolve, 1100));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.liveDenied);
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
  },
};
export const DeniedVerificationCannotBeUndoneByOldReadError: Story = {
  beforeEach: () => mock('denied-error-race'),
  play: DeniedVerificationCannotBeUndoneByOldRead.play,
};
