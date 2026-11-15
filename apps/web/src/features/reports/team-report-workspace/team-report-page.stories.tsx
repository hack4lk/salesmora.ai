import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { teamReportQuerySchema, teamReportReadResultSchema, teamReportExportInputSchema, teamReportExportColumns,
  type TeamReportQuery } from '@salesmora/contracts';
import { TeamReportPage } from './team-report-page';
import { initialTeamQuery, teamReadResponse, teamAssignedAuthority, teamWorkspaceAuthority } from './team-read.fixtures';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { teamExportDatasetsForView } from './team-export.client';

let requests: TeamReportQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
function parseQuery(input: RequestInfo | URL) {
  return teamReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
}
const meta = {
  title: 'Reports/TeamReportPage', component: TeamReportPage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'API-mocked canonical Team report host. Independent domain and CSV scopes, preserved member draft, explicit unavailable-selection correction, current roster and race-safe reads. Saved configuration, assistant and production activation remain deferred.' } } },
  args: { initial: teamReadResponse(initialTeamQuery), onRecord: fn(), onReload: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      if (String(input).startsWith('/api/reports/team/export')) {
        const request = teamReportExportInputSchema.parse(JSON.parse(String(init?.body)));
        const scope = args.initial.exportScopes[request.query.view === 'team-leads' ? 'leads' : 'jobs'];
        const columns = teamReportExportColumns(request), count = request.dataset === 'summary' || request.dataset === 'unassigned' ? 1 : 2;
        const metadata = { workspaceId: args.initial.workspaceId, policyRevision: args.initial.policyRevision,
          scope, archiveVisibility: request.query.view === 'team-leads' ? 'excluded' : 'included',
          asOf: args.initial.report.asOf, today: args.initial.report.today, timezone: args.initial.report.timezone,
          count, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 }, dateBasis: 'current-snapshot' };
        if (String(input).endsWith('/preview')) return Response.json({ ...metadata, input: request,
          viewerId: args.initial.viewerId, columns, coverage: 'Current export-authorized Team workload.',
          inactivityCutoff: request.query.view === 'team-leads' ? '2026-10-29T09:00:00.000000Z' : null });
        const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
        const body = '\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: count }, () => columns.map(() => '"fixture"').join(',') + '\r\n').join('');
        return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!String(input).startsWith('/api/reports/team?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json({ ...teamReadResponse(query, args.initial.authority), exportScopes: args.initial.exportScopes });
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof TeamReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CsvDatasets: Story = {
  args: { initial: { ...teamReadResponse(initialTeamQuery), exportScopes: {
    leads: { kind: 'workspace' }, jobs: { kind: 'workspace' },
  } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    for (const [view, queryView] of [['leads', 'team-leads'], ['jobs', 'team-jobs']] as const) {
      if (view === 'jobs') await switchView(canvasElement, view);
      await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
      for (const dataset of teamExportDatasetsForView(queryView, false)) {
        await userEvent.selectOptions(body.getByRole('combobox', { name: 'CSV dataset' }), dataset);
        await waitFor(() => expect(body.getByText(`salesmora-${queryView}-${dataset}-2026-11-05.csv`)).toBeInTheDocument());
        await waitFor(() => expect(body.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
      }
      await userEvent.click(body.getByRole('button', { name: 'Download CSV' }));
      await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    }
  },
};
export const CsvAssignedSelectionDenied: Story = {
  args: { initial: { ...teamReadResponse(initialTeamQuery), exportScopes: {
    leads: { kind: 'assigned', currentMemberId: 'member-c' }, jobs: null,
  } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await chooseMember(canvasElement, 'Blair');
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await expect(body.getByText(/selection is unavailable under current export access/)).toBeVisible();
    await expect(body.getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  },
};
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function ready(element: HTMLElement) {
  await waitFor(() => expect(within(element).getByRole('combobox', { name: 'Report view' })).toBeEnabled());
}
async function switchView(element: HTMLElement, view: string) {
  await userEvent.selectOptions(within(element).getByRole('combobox', { name: 'Report view' }), view);
  await ready(element);
}
async function chooseMember(element: HTMLElement, label: string) {
  const canvas = within(element), body = within(element.ownerDocument.body);
  await userEvent.click(canvas.getByRole('combobox', { name: 'Current member' }));
  await userEvent.keyboard('{ArrowDown}');
  const option = await body.findByRole('option', { name: label });
  await waitFor(() => expect(option).toBeVisible());
  await userEvent.click(option); await userEvent.keyboard('{Escape}');
  await ready(element);
}
export const BackendContracts: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('4');
    await userEvent.click(canvas.getByRole('button', { name: 'View record: Website inquiry' }));
    expect(args.onRecord).toHaveBeenLastCalledWith({ type: 'lead', id: '00000000-0000-4000-8000-000000000201' });
    await userEvent.click(canvas.getByRole('button', { name: 'View inactive evidence: Alex' }));
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ selected: { kind: 'owner', id: 'member:member-a', inactiveOnly: true }, page: 1 });
    await expect(canvas.getByRole('button', { name: 'View record: Referral awaiting contact' })).toBeVisible();
    await userEvent.click(within(canvas.getByRole('region', { name: 'Breakdown / Blair / current stage' }))
      .getByRole('button', { name: 'View supporting evidence: Estimate sent' }));
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ selected: { kind: 'owner', id: 'member:member-b', stage: 'estimate-sent' } });
    await expect(canvas.getByRole('button', { name: 'View record: Estimate at cutoff' })).toBeVisible();
    await chooseMember(canvasElement, 'Blair');
    await switchView(canvasElement, 'jobs');
    expect(requests.at(-1)).toMatchObject({ view: 'team-jobs', filters: { members: ['member-b'] },
      selected: { kind: 'queue', queue: 'active' }, page: 1 });
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('3');
    await expect(canvas.getByRole('heading', { name: 'Breakdown / Alex / Primary responsibility' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current member: Blair' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'View overdue evidence: Blair / Supporting participation' }));
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ selected: { kind: 'member', id: 'member-b', responsibility: 'supporting', filter: 'overdue' } });
    await userEvent.click(canvas.getByRole('button', { name: 'View record: D0 / overdue repair' }));
    expect(args.onRecord).toHaveBeenLastCalledWith({ type: 'job', id: '00000000-0000-4000-8000-000000000101' });
    await userEvent.click(canvas.getByRole('button', { name: 'View Waiting evidence: Blair / Primary responsibility' }));
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ selected: { kind: 'member', id: 'member-b', responsibility: 'primary', filter: 'waiting' } });
    await expect(canvas.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await ready(canvasElement);
    await selectMetricEvidence(canvasElement, 'No current primary owner');
    await ready(canvasElement);
    await expect(canvas.getByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).toBeVisible();
    expect(canvas.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await expect(canvas.getByRole('button', { name: 'Export Report Data' })).toBeDisabled();
  },
};
export const MixedScopesUnavailableDraft: Story = {
  args: { initial: teamReadResponse(initialTeamQuery, { leads: teamWorkspaceAuthority.leads, jobs: teamAssignedAuthority.jobs }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await chooseMember(canvasElement, 'Blair');
    const before = requests.length;
    await switchView(canvasElement, 'jobs');
    expect(requests).toHaveLength(before);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Saved Team filters are unavailable');
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current member: Unavailable saved selection' })).toBeVisible();
    expect(canvas.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await switchView(canvasElement, 'leads');
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current member: Blair' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('1');
    await switchView(canvasElement, 'jobs');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await ready(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('2');
    expect(requests.at(-1)).toMatchObject({ view: 'team-jobs', filters: { members: [] } });
    await chooseMember(canvasElement, 'Me');
    await switchView(canvasElement, 'leads');
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('0');
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current member: Casey' })).toBeVisible();
  },
};
export const AssignedJobsOnly: Story = {
  args: { initial: teamReadResponse(teamReportQuerySchema.parse({ ...initialTeamQuery, view: 'team-jobs',
    selected: { kind: 'queue', queue: 'active' } }), { leads: null, jobs: teamAssignedAuthority.jobs }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(canvas.getByRole('heading', { name: 'My workload report' })).toBeVisible();
    expect(canvas.queryByRole('option', { name: 'Current Leads workload' })).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('2');
    await expect(canvas.getAllByRole('cell', { name: 'Not disclosed in My workload' })).toHaveLength(2);
    expect(canvas.queryByText('Alex')).not.toBeInTheDocument();
    expect(canvas.queryByText('Blair')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'View workload evidence: Me / Supporting participation' }));
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ selected: { kind: 'member', id: 'member-c', responsibility: 'supporting', filter: 'all' } });
  },
};
export const AccessRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/team?')
      ? Response.json({ error: 'This report is unavailable.' }, { status: 404 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'jobs');
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryByRole('combobox', { name: 'Report view' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('combobox', { name: 'Current member' })).not.toBeInTheDocument();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    expect(args.onReload).toHaveBeenCalledOnce();
  },
};
export const InvalidAuthorityAndRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch; let attempt = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/team?')) return original(input, init);
      const result = teamReadResponse(parseQuery(input)); attempt++;
      return Response.json(attempt === 1 ? { ...result, policyRevision: 2 } : attempt === 2 ? { ...result, options: [] } : result);
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await switchView(canvasElement, 'jobs');
    await expect(canvas.getByText('Team report results no longer match this request or current authority. Reload the report.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current member' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await ready(canvasElement);
    await expect(canvas.getByText('Team report data does not match the current request, authority or evidence. Reload the report.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await ready(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
  },
};
export const ErrorRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch; let failed = false;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/team?')) return original(input, init);
      if (!failed) { failed = true; return Response.json({ error: 'Team report could not be loaded. Try again.' }, { status: 500 }); }
      return Response.json(teamReadResponse(parseQuery(input)));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await switchView(canvasElement, 'jobs');
    await expect(canvas.getByText('Team report could not be loaded. Try again.')).toBeVisible();
    expect(canvas.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await ready(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
  },
};
export const Pagination: Story = {
  args: { initial: teamReadResponse(teamReportQuerySchema.parse({ ...initialTeamQuery, view: 'team-jobs',
    selected: { kind: 'queue', queue: 'active' } }), teamWorkspaceAuthority, true) },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/team?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json(teamReadResponse(query, teamWorkspaceAuthority, true));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('130');
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    expect(args.onRecord).toHaveBeenLastCalledWith({ type: 'job', id: '00000000-0000-4000-8000-000000000101' });
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }));
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ page: 2, pageSize: 25 });
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    expect(args.onRecord).toHaveBeenLastCalledWith({ type: 'job', id: '00000000-0000-4000-8000-000000000126' });
    await userEvent.click(canvas.getByRole('button', { name: 'Go to previous page' }));
    await ready(canvasElement);
    expect(requests.at(-1)?.page).toBe(1);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /Rows per page/ }), '100');
    await ready(canvasElement);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(100);
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }));
    await ready(canvasElement);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(30);
    await selectMetricEvidence(canvasElement, 'Waiting');
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ page: 1, selected: { kind: 'queue', queue: 'waiting' } });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(26);
    await switchView(canvasElement, 'leads');
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('104');
    expect(requests.at(-1)).toMatchObject({ page: 1, pageSize: 100 });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(100);
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => {
      const replacement = teamReadResponse({ ...initialTeamQuery, workspaceId: '00000000-0000-4000-8000-000000000002' });
      setInitial(teamReportReadResultSchema.parse({ ...replacement, report: { ...replacement.report,
        rows: replacement.report.rows.map(row => ({ ...row, label: `Replacement ${row.label}` })) } }));
    }}>Switch authorized workspace</button><TeamReportPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/team?')) return original(input, init);
      const query = parseQuery(input);
      init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      await new Promise<void>(resolve => { release = resolve; });
      const response = Response.json(teamReadResponse(query)), json = response.json.bind(response);
      response.json = async () => { const raw: unknown = await json(); settled = true; return raw; };
      return response;
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'jobs');
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current member' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('button', { name: 'View record: Replacement Website inquiry' })).toBeVisible();
    expect(aborted).toBe(true);
    release?.();
    await waitFor(() => expect(settled).toBe(true));
    await expect(canvas.getByRole('combobox', { name: 'Report view' })).toHaveValue('leads');
    expect(canvas.queryByRole('button', { name: 'View record: Website inquiry' })).not.toBeInTheDocument();
  },
};
