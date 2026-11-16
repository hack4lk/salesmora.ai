import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { jobReportQuerySchema, jobReportReadResultSchema, jobReportExportInputSchema, jobReportExportColumns,
  type JobReportQuery } from '@salesmora/contracts';
import { JobReportPage } from './job-report-page';
import { initialJobQuery, jobReadResponse, largeJobReadResponse } from './job-read.fixtures';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { jobExportDatasetsForView } from './job-export.client';
import { reportSnapshotDecorator } from '../report-snapshot.story-helpers';

let requests: JobReportQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
function parseQuery(input: RequestInfo | URL) {
  return jobReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
}
const meta = {
  decorators: [reportSnapshotDecorator],
  title: 'Reports/JobReportPage', component: JobReportPage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'API-bound canonical Jobs workspace with independent period/current drafts, native evidence selections, authorized facets and CSV review. Initial data is server supplied; strict authority validation and race-safe reads protect evidence. Configuration, assistant and production activation remain deferred.' } } },
  args: { initial: jobReadResponse(initialJobQuery), onRecord: fn(), onReload: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      if (String(input).startsWith('/api/reports/jobs/export')) {
        const request = jobReportExportInputSchema.parse(JSON.parse(String(init?.body)));
        const count = request.dataset === 'summary' ? 1 : request.dataset === 'days' && request.query.view === 'completion'
          ? (Date.parse(request.query.period.to) - Date.parse(request.query.period.from)) / 86400000 + 1 : 2;
        const columns = jobReportExportColumns(request);
        const metadata = { workspaceId: args.initial.workspaceId, policyRevision: args.initial.policyRevision,
          scope: args.initial.exportScope, archiveVisibility: 'included', asOf: args.initial.report.asOf,
          today: args.initial.today, timezone: args.initial.report.timezone, count,
          limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
          dateBasis: request.query.view === 'workload' ? 'current-snapshot'
            : request.query.view === 'completion' ? 'completion-date' : 'lifecycle-local-dates' };
        if (String(input).endsWith('/preview')) return Response.json({ ...metadata, input: request,
          viewerId: args.initial.viewerId, columns, coverage: 'Current export-authorized Jobs; evidence selection applies.' });
        const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
        const body = '\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: count }, () => columns.map(() => '"fixture"').join(',') + '\r\n').join('');
        return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!String(input).startsWith('/api/reports/jobs?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json({ ...jobReadResponse(query, args.initial.scope), exportScope: args.initial.exportScope });
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof JobReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const FreshViewCache: Story = {
  play: async ({ canvasElement }) => {
    expect(requests).toHaveLength(0);
    await switchView(canvasElement, 'completion');
    expect(requests).toHaveLength(1);
    await switchView(canvasElement, 'lifecycle');
    await switchView(canvasElement, 'completion');
    expect(requests).toHaveLength(1);
    await expect(summary(canvasElement).getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('7.5 days');
  },
};
export const CsvPreview: Story = {
  args: { initial: { ...jobReadResponse(initialJobQuery), exportScope: 'assigned' } },
};
export const CsvDatasets: Story = {
  args: { initial: { ...jobReadResponse(initialJobQuery), exportScope: 'assigned' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    const report = canvas.getByRole('combobox', { name: 'Report view' }).closest('section')!;
    const content = report.getBoundingClientRect();
    for (const element of [
      canvas.getByRole('region', { name: 'Save this report as a template' }),
      canvas.getByRole('navigation', { name: 'Report actions' }),
    ]) {
      const bounds = element.getBoundingClientRect();
      expect(Math.abs(bounds.left - content.left)).toBeLessThan(1);
      expect(Math.abs(bounds.right - content.right)).toBeLessThan(1);
    }
    for (const view of ['lifecycle', 'completion', 'workload'] as const) {
      if (view !== 'lifecycle') await switchView(canvasElement, view);
      await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
      for (const dataset of jobExportDatasetsForView(view)) {
        await userEvent.selectOptions(body.getByRole('combobox', { name: 'CSV dataset' }), dataset);
        await waitFor(() => expect(body.getByText(`salesmora-${view}-${dataset}-2026-11-05.csv`)).toBeInTheDocument());
        await waitFor(() => expect(body.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
      }
      await userEvent.click(body.getByRole('button', { name: 'Download CSV' }));
      await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    }
  },
};
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function switchView(element: HTMLElement, view: string) {
  const canvas = within(element);
  await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), view);
  await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
}
async function selectFacet(element: HTMLElement, facet: string, label: string) {
  const canvas = within(element), body = within(element.ownerDocument.body);
  await userEvent.click(canvas.getByRole('combobox', { name: facet }));
  await userEvent.keyboard('{ArrowDown}');
  const option = await body.findByRole('option', { name: label });
  await waitFor(() => expect(option).toBeVisible());
  await userEvent.click(option); await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
}
export const BackendContracts: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(summary(canvasElement).getByRole('group', { name: 'Created' })).toHaveTextContent('4');
    await userEvent.click(canvas.getByRole('button', { name: 'View record: D0 / overdue repair' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000101');
    for (const [label, selectedView] of [['Completed', 'completed'], ['Canceled', 'canceled'], ['Reopened', 'reopened']] as const) {
      await selectMetricEvidence(canvasElement, label);
      await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
      expect(requests.at(-1)).toMatchObject({ view: 'lifecycle', selectedView, page: 1 });
    }
    await switchView(canvasElement, 'completion');
    await expect(summary(canvasElement).getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('7.5 days');
    await userEvent.click(canvas.getByRole('button', { name: 'View supporting evidence: 12 Oct 2026' }));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
    expect(requests.at(-1)).toMatchObject({ view: 'completion', selectedDate: '2026-10-12' });
    expect(canvas.queryByRole('button', { name: 'View record: Completed installation' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'View supporting evidence: 13 Oct 2026' }));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await selectMetricEvidence(canvasElement, 'Completed Jobs');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
    await expect(canvas.getByRole('button', { name: 'View record: Completed installation' })).toBeVisible();
    await switchView(canvasElement, 'workload');
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    for (const [label, metric] of [['Overdue', 'overdue'], ['Due soon', 'dueSoon'], ['No completion deadline', 'noDeadline'],
      ['Waiting', 'waiting'], ['No current primary owner', 'unassigned'], ['Active Jobs', 'active']] as const) {
      const before = requests.length;
      await selectMetricEvidence(canvasElement, label);
      await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
      if (metric === 'active') expect(requests).toHaveLength(before);
      else expect(requests.at(-1)).toMatchObject({ view: 'workload', selection: { kind: 'metric', metric } });
      expect(requests.at(-1)).not.toHaveProperty('period');
    }
    for (const [label, group, id] of [['In Progress', 'status', 'in-progress'], ['Teammate A', 'owner', 'member:member-a'],
      ['Repair', 'service', 'service:repair'], ['Waiting on materials', 'waitingReason', 'materials']] as const) {
      await userEvent.click(canvas.getByRole('button', { name: `View supporting evidence: ${label}` }));
      await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
      expect(requests.at(-1)).toMatchObject({ selection: { kind: 'group', group, id } });
    }
    expect(canvas.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await expect(canvas.getByRole('button', { name: 'Export Report Data' })).toBeDisabled();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /Rows per page/ }), '50');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: /Rows per page/ })).toBeEnabled());
    expect(requests.at(-1)?.pageSize).toBe(50);
    await switchView(canvasElement, 'lifecycle');
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-31' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await waitFor(() => expect(summary(canvasElement).getByRole('group', { name: 'Created' })).toHaveTextContent('0'));
    expect(requests.at(-1)).toMatchObject({ view: 'lifecycle', selectedView: 'created',
      period: { from: '2026-08-01', to: '2026-08-31' }, page: 1 });
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await switchView(canvasElement, 'completion');
    await expect(summary(canvasElement).getByRole('group', { name: 'Elapsed-day sample size' })).toHaveTextContent('0');
    await switchView(canvasElement, 'workload');
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
  },
};
export const IndependentFilters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectFacet(canvasElement, 'Current status', 'Completed');
    await selectFacet(canvasElement, 'Current service', 'Installation');
    await switchView(canvasElement, 'completion');
    await expect(summary(canvasElement).getByRole('group', { name: 'Completed Jobs' })).toHaveTextContent('1');
    await switchView(canvasElement, 'workload');
    expect(canvas.queryByRole('button', { name: 'Remove filter: Current status: Completed' })).not.toBeInTheDocument();
    await selectFacet(canvasElement, 'Current primary owner', 'No current primary owner');
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('1');
    expect(requests.at(-1)?.filters).toEqual({ statuses: [], owners: ['unassigned'], services: [] });
    const before = requests.length;
    await switchView(canvasElement, 'lifecycle');
    expect(requests).toHaveLength(before);
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current status: Completed' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current service: Installation' })).toBeVisible();
    await switchView(canvasElement, 'workload');
    expect(requests).toHaveLength(before);
    await expect(canvas.getByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).toBeVisible();
  },
};
export const AssignedAuthority: Story = {
  args: { initial: jobReadResponse(initialJobQuery, 'assigned') },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Created' })).toHaveTextContent('1');
    await switchView(canvasElement, 'workload');
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('1');
    expect(canvas.queryByText('Teammate B')).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'View record: D0 / overdue repair' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000101');
    await switchView(canvasElement, 'completion');
    await expect(summary(canvasElement).getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('10 days');
  },
};
export const CurrentInitial: Story = {
  args: { initial: jobReadResponse(jobReportQuerySchema.parse({ workspaceId: initialJobQuery.workspaceId, view: 'workload',
    filters: { statuses: [], owners: [], services: [] }, selection: { kind: 'metric', metric: 'waiting' }, pageSize: 50 })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await switchView(canvasElement, 'lifecycle');
    expect(requests.at(-1)).toMatchObject({ view: 'lifecycle', selectedView: 'created', page: 1, pageSize: 50,
      period: { from: '2026-10-07', to: '2026-11-05' } });
  },
};
export const AccessRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/jobs?')
      ? Response.json({ error: 'This report is unavailable.' }, { status: 404 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'completion');
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current primary owner' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    await expect(args.onReload).toHaveBeenCalled();
  },
};
export const ChangedPolicy: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/jobs?')
      ? Response.json({ ...jobReadResponse(parseQuery(input)), policyRevision: 2 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'completion');
    await expect(await canvas.findByText('Jobs report results no longer match this request or current authority. Reload the report.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current primary owner' })).not.toBeInTheDocument();
  },
};
export const StaleFacets: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/jobs?')) return original(input, init);
      const result = jobReadResponse(parseQuery(input));
      return Response.json({ ...result, options: { ...result.options, owners: [] } });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectFacet(canvasElement, 'Current primary owner', 'Teammate A');
    await expect(canvas.getByText('Jobs report data does not match the current request, authority or evidence. Reload the report.')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Reload report access' })).toBeVisible();
    expect(canvas.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('combobox', { name: 'Current primary owner' })).not.toBeInTheDocument();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
  },
};
export const Pagination: Story = {
  args: { initial: largeJobReadResponse(jobReportQuerySchema.parse({ workspaceId: initialJobQuery.workspaceId, view: 'workload',
    filters: { statuses: [], owners: [], services: [] }, selection: { kind: 'metric', metric: 'active' } })) },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/jobs?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json(largeJobReadResponse(query));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('130');
    const first = canvas.getAllByRole('button', { name: /^View record:/ })[0]!;
    const firstName = first.getAttribute('aria-label')!;
    await userEvent.click(first);
    expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000002626');
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: /Rows per page/ })).toBeEnabled());
    expect(requests.at(-1)).toMatchObject({ page: 2, pageSize: 25 });
    expect(canvas.queryByRole('button', { name: firstName })).not.toBeInTheDocument();
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(25);
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000002651');
    await userEvent.click(canvas.getByRole('button', { name: 'Go to previous page' }));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: /Rows per page/ })).toBeEnabled());
    expect(requests.at(-1)?.page).toBe(2);
    expect(canvas.getByRole('button', { name: firstName })).toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /Rows per page/ }), '100');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: /Rows per page/ })).toBeEnabled());
    expect(requests.at(-1)).toMatchObject({ page: 1, pageSize: 100 });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(100);
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: /Rows per page/ })).toBeEnabled());
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(30);
    await selectMetricEvidence(canvasElement, 'Waiting');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: /Rows per page/ })).toBeEnabled());
    expect(requests.at(-1)).toMatchObject({ page: 1, selection: { kind: 'metric', metric: 'waiting' } });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(26);
  },
};
export const ErrorRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    let failed = false;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/jobs?')) return original(input, init);
      if (!failed) { failed = true; return Response.json({ error: 'Jobs report could not be loaded. Try again.' }, { status: 500 }); }
      return Response.json(jobReadResponse(parseQuery(input)));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'completion');
    await expect(await canvas.findByText('Jobs report could not be loaded. Try again.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await waitFor(() => expect(summary(canvasElement).getByRole('group', { name: 'Completed Jobs' })).toHaveTextContent('2'));
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => {
      const replacement = jobReadResponse({ ...initialJobQuery, workspaceId: '00000000-0000-4000-8000-000000000002' });
      setInitial(jobReportReadResultSchema.parse({ ...replacement, report: { ...replacement.report,
        rows: replacement.report.rows.map(row => ({ ...row, label: `Replacement ${row.label}` })) } }));
    }}>Switch authorized workspace</button><JobReportPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/jobs?')) return original(input, init);
      const query = parseQuery(input);
      init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      // Complete an ignored-abort transport to prove replaced evidence cannot return.
      await new Promise<void>(resolve => { release = resolve; });
      const response = Response.json(jobReadResponse(query)), json = response.json.bind(response);
      response.json = async () => { const raw: unknown = await json(); settled = true; return raw; };
      return response;
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'completion');
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current primary owner' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Apply period' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('button', { name: 'View record: Replacement D0 / overdue repair' })).toBeVisible();
    expect(aborted).toBe(true);
    release?.();
    await waitFor(() => expect(settled).toBe(true));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toHaveValue('lifecycle'));
    expect(canvas.queryByRole('button', { name: 'View record: D0 / overdue repair' })).not.toBeInTheDocument();
  },
};
