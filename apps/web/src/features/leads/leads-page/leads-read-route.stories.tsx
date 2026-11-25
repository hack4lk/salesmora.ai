import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { useQueryClient } from '@tanstack/react-query';
import { LeadsReadRoute } from './leads-read-route';
import { leadQueryScope as scope, leadQueryFixture, leadListFixture, leadDetailFixture } from './lead-queries.fixtures';
import { invalidateLeadQueries } from './lead-queries';
import { leadsReadRouteData as copy } from './leads-read-route.data';
import { ApiRequestError } from '../../api/api-request';

let detail = structuredClone(leadDetailFixture), list = structuredClone(leadListFixture);
let failure = 0, conflict = false;
const reads = fn(), writes = fn();
function RefreshHarness(props: ComponentProps<typeof LeadsReadRoute>) {
  const client = useQueryClient();
  return <div className="p-4 sm:p-8">
    <button type="button" className="mb-6 min-h-11 rounded-xl border border-line px-4 focus-visible:focus-ring" onClick={() => {
      failure = 403;
      void invalidateLeadQueries(client, scope.workspaceId).catch(error => {
        if (!(error instanceof ApiRequestError) || error.status !== 403) throw error;
      });
    }}>Mock permission revocation</button>
    <LeadsReadRoute {...props} />
  </div>;
}
const meta = {
  title: 'Leads/LeadsReadRoute', component: RefreshHarness,
  parameters: { layout: 'fullscreen', nextjs: { navigation: { pathname: '/leads', query: { workspace: scope.workspaceId, view: 'list' } } } },
  args: { workspaceId: scope.workspaceId, viewerId: scope.viewerId, initial: leadListFixture, initialQuery: leadQueryFixture, initialUpdatedAt: Date.now() },
  beforeEach: () => {
    detail = structuredClone(leadDetailFixture); list = structuredClone(leadListFixture); failure = 0; conflict = false;
    reads.mockClear(); writes.mockClear();
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input), method = init?.method ?? 'GET';
      if (path.startsWith('/api/estimates/related?')) return Response.json({ rows: [], total: 0, canCreate: false, canRead: false });
      if (!path.startsWith('/api/leads')) return original(input, init);
      if (method === 'GET') {
        reads(path);
        if (failure) { const status = failure; failure = 0; return Response.json({ error: 'Fixture read failed.' }, { status }); }
        return Response.json(path.startsWith('/api/leads?') ? list : detail);
      }
      writes(path, init?.body);
      const body = JSON.parse(String(init?.body));
      if (method === 'PATCH') {
        if (conflict) return Response.json({ error: 'Fixture conflict.', changedFields: ['service'] }, { status: 409 });
        detail.lead = { ...detail.lead, ...body.values, version: detail.lead.version + 1 };
        list.rows = [detail.lead];
        return Response.json(detail);
      }
      if (path.endsWith('/stage')) {
        detail.lead = { ...detail.lead, stage: body.to, version: detail.lead.version + 1 };
        list.rows = [detail.lead];
        return Response.json({ version: detail.lead.version });
      }
      if (path.endsWith('/notes')) {
        const note = { id: '00000000-0000-4000-8000-000000000301', body: body.body, authorName: 'Sam Rivera', createdAt: detail.lead.createdAt, viaAssistant: false };
        detail.teamNotes = [note]; detail.notesTotal = 1;
        return Response.json({ ok: true, note });
      }
      throw new Error(`Unmocked Leads operation: ${method} ${path}`);
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof RefreshHarness>;
export default meta;
type Story = StoryObj<typeof meta>;
async function openLeadActions(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Lead actions' }));
  return within(await within(canvasElement.ownerDocument.body).findByRole('menu', { name: 'Lead actions' }));
}

export const InitialServerSnapshot: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('link', { name: 'Jordan Query Test' })).toBeVisible();
  await expect(reads).not.toHaveBeenCalled();
} };
export const QuickView: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const mobile = c.queryByRole('button', { name: 'Open record · Jordan Query Test' });
  await userEvent.click(mobile ?? within(c.getByRole('link', { name: 'Jordan Query Test' }).closest('tr')!).getByText('Kitchen repair'));
  await expect(body.getByRole('dialog')).toBeVisible();
  await expect(body.getByRole('button', { name: 'Move to another stage' })).toBeVisible();
  await expect(reads).toHaveBeenCalledTimes(1);
  await userEvent.click(body.getByRole('button', { name: 'Close panel' }));
  await userEvent.click(mobile ?? within(c.getByRole('link', { name: 'Jordan Query Test' }).closest('tr')!).getByText('Kitchen repair'));
  await expect(body.getByRole('button', { name: 'Move to another stage' })).toBeVisible();
  await expect(reads).toHaveBeenCalledTimes(1);
  await userEvent.click(body.getByRole('button', { name: 'Close panel' }));
} };
export const Retry: Story = {
  args: { initialUpdatedAt: 1 },
  beforeEach: () => { failure = 500; },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Retry' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Retry' }));
    await expect(c.getByRole('link', { name: 'Jordan Query Test' })).toBeVisible();
    await expect(reads).toHaveBeenCalledTimes(2);
  },
};
export const AccessRevoked: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: 'Mock permission revocation' }));
  await expect(c.getByRole('button', { name: 'Retry' })).toBeVisible();
  await expect(c.queryByRole('link', { name: 'Jordan Query Test' })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: 'Add lead' })).toBeDisabled();
  await expect(c.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
} };
export const Detail: Story = { args: { initialDetail: leadDetailFixture } };
export const MoveStage: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click((await openLeadActions(canvasElement)).getByRole('menuitem', { name: 'Move to another stage' }));
  await userEvent.selectOptions(body.getByRole('combobox', { name: 'New stage' }), 'contacted');
  await userEvent.click(body.getByRole('button', { name: 'Confirm move' }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(within(c.getByRole('heading', { name: 'Jordan Query Test', level: 1 }).closest('header')!).getByText('Contacted')).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
} };
export const AddNote: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: 'Add a team note' }), 'Fictional saved note.');
  await userEvent.click(c.getByRole('button', { name: 'Add note' }));
  await expect(c.getByRole('textbox', { name: 'Add a team note' })).toHaveValue('');
  await expect(c.getByText('Fictional saved note.', { exact: true })).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
} };
export const Edit: Story = { ...Detail, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click((await openLeadActions(canvasElement)).getByRole('menuitem', { name: 'Edit lead' }));
  const input = body.getByRole('textbox', { name: 'Service requested' });
  await userEvent.clear(input); await userEvent.type(input, 'Updated fixture service');
  await userEvent.click(body.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(c.getByRole('heading', { name: 'Updated fixture service' })).toBeVisible();
  await expect(writes).toHaveBeenCalledTimes(1);
} };
export const EditConflict: Story = {
  ...Detail, beforeEach: () => { conflict = true; },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click((await openLeadActions(canvasElement)).getByRole('menuitem', { name: 'Edit lead' }));
    const input = body.getByRole('textbox', { name: 'Service requested' });
    await userEvent.clear(input); await userEvent.type(input, 'Preserved draft service');
    await userEvent.click(body.getByRole('button', { name: 'Save changes' }));
    await expect(body.getByText(copy.editConflict)).toBeVisible();
    await expect(input).toHaveValue('Preserved draft service');
    await expect(writes).toHaveBeenCalledTimes(1);
  },
};
