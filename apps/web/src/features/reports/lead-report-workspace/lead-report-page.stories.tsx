import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within, waitFor } from 'storybook/test';
import { leadReportQuerySchema, type LeadReportQuery } from '@salesmora/contracts';
import { LeadReportPage } from './lead-report-page';
import { initialLeadReportQuery, leadReportBackendResponse } from './lead-report.adapter.fixtures';
import { workspaceLeadFixtures } from './lead-report-workspace.fixtures';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

let requests: LeadReportQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
const meta = {
  title: 'Reports/LeadReportPage', component: LeadReportPage, parameters: { layout: 'fullscreen' },
  args: { initial: leadReportBackendResponse(initialLeadReportQuery), onRecord: fn(), onReload: fn() },
  beforeEach: () => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      if (!String(input).startsWith('/api/reports/leads?')) return original(input, init);
      const query = leadReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      requests.push(query);
      return Response.json(leadReportBackendResponse(query));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof LeadReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BackendContracts: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const view of ['pipeline', 'age', 'attention', 'won', 'lost', 'intake']) {
      await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), view);
      await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
      await expect(canvas.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    }
    expect(requests.map(query => query.view)).toEqual(['pipeline', 'age', 'attention', 'won', 'lost', 'intake']);
    await selectMetricEvidence(canvasElement, 'New leads');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
    const record = canvas.getByRole('button', { name: 'View record: Website inquiry' });
    await userEvent.click(record);
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000201');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Rows per page' }), '50');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Rows per page' })).toBeEnabled());
    expect(requests.at(-1)?.pageSize).toBe(50);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Date range' }), 'custom');
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-30' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
    expect(requests.at(-1)).toMatchObject({ view: 'intake', period: { from: '2026-08-01', to: '2026-08-30' } });
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await expect(canvas.getByRole('group', { name: 'Current open Leads' })).toHaveTextContent('3');
  },
};
export const AccessRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/leads?')
      ? Response.json({ error: 'This report is unavailable.' }, { status: 404 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'pipeline');
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current primary owner' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    await expect(args.onReload).toHaveBeenCalled();
  },
};
export const ChangedPolicy: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/leads?')) return original(input, init);
      const query = leadReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      return Response.json({ ...leadReportBackendResponse(query), policyRevision: 2 });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'pipeline');
    await expect(await canvas.findByText('Leads report results no longer match this request or current authority. Reload the report.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => setInitial(leadReportBackendResponse({
      ...initialLeadReportQuery, workspaceId: '00000000-0000-4000-8000-000000000002',
    }, 'workspace', workspaceLeadFixtures.map(lead => ({ ...lead, label: `Replacement ${lead.label}` }))))}>
      Switch authorized workspace</button><LeadReportPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/leads?')) return original(input, init);
      const query = leadReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      // Deliberately ignore cancellation to verify that a late response cannot repopulate the replaced host.
      await new Promise<void>(resolve => { release = resolve; });
      settled = true;
      return Response.json(leadReportBackendResponse(query));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'pipeline');
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('button', { name: 'View record: Replacement Website inquiry' })).toBeVisible();
    expect(aborted).toBe(true);
    release?.();
    await waitFor(() => expect(settled).toBe(true));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toHaveValue('intake'));
    expect(canvas.queryByRole('button', { name: 'View record: Website inquiry' })).not.toBeInTheDocument();
  },
};
