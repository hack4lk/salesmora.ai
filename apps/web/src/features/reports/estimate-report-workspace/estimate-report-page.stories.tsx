import { useState } from 'react';
import { reportSnapshotDecorator } from '../report-snapshot.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { estimateReportQuerySchema, estimateReportReadResultSchema, estimateReportExportInputSchema,
  estimateReportExportColumns, type EstimateReportQuery } from '@salesmora/contracts';
import { EstimateReportPage } from './estimate-report-page';
import { initialEstimateQuery, estimateReadResponse, estimateReadAuthority } from './estimate-read.fixtures';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { estimateDecisionsReportData as decisionsCopy } from '../estimate-decisions-report/estimate-decisions-report.data';
import { estimateCurrentReportData as currentCopy } from '../estimate-current-report/estimate-current-report.data';
import { estimateFirstQuotedReportData as quotedCopy } from '../estimate-first-quoted-report/estimate-first-quoted-report.data';

let requests: EstimateReportQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
function parseQuery(input: RequestInfo | URL) {
  return estimateReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
}
const meta = {
  decorators: [reportSnapshotDecorator],
  title: 'Reports/EstimateReportPage', component: EstimateReportPage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'API-mocked canonical Estimates host with strict native authority, independent period/current drafts, native evidence, frozen values and independently authorized CSV. Configuration, assistant and production activation remain deferred.' } } },
  args: { initial: estimateReadResponse(initialEstimateQuery), onRecord: fn(), onReload: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      if (String(input).startsWith('/api/reports/estimates/export')) {
        const request = estimateReportExportInputSchema.parse(JSON.parse(String(init?.body)));
        const access = args.initial.exportAccess;
        if (!access) return new Response(null, { status: 404 });
        const columns = estimateReportExportColumns(request), count = request.dataset === 'summary' ? 1 : 2;
        const dateBasis = request.query.view === 'estimate-decisions' ? 'decision-date'
          : request.query.view === 'estimate-first-quoted' ? 'first-issued-date' : 'current-snapshot';
        const metadata = { workspaceId: args.initial.workspaceId, policyRevision: args.initial.policyRevision,
          ...access, archiveVisibility: request.query.view === 'estimate-current' ? 'excluded' : args.initial.authority.archives,
          asOf: args.initial.report.asOf, today: args.initial.today, timezone: args.initial.report.timezone,
          count, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 }, dateBasis };
        if (String(input).endsWith('/preview')) return Response.json({ ...metadata, input: request,
          viewerId: args.initial.viewerId, columns, coverage: 'Authorized fictional Estimate evidence.' });
        const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
        const body = '\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: count }, () => columns.map(() => '"fixture"').join(',') + '\r\n').join('');
        return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!String(input).startsWith('/api/reports/estimates?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json({ ...estimateReadResponse(query, args.initial.authority), exportAccess: args.initial.exportAccess });
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof EstimateReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CsvViews: Story = {
  args: { initial: { ...estimateReadResponse(initialEstimateQuery), exportAccess: { scope: 'workspace', handoff: true } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    for (const [view, queryView] of [['decisions', 'estimate-decisions'], ['first-quoted', 'estimate-first-quoted'],
      ['current', 'estimate-current']] as const) {
      if (view !== 'decisions') await switchView(canvasElement, view);
      await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
      for (const dataset of ['summary', 'evidence']) {
        await userEvent.selectOptions(body.getByRole('combobox', { name: 'CSV dataset' }), dataset);
        await waitFor(() => expect(body.getByText(`salesmora-${queryView}-${dataset}-2026-11-05.csv`)).toBeInTheDocument());
        await waitFor(() => expect(body.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
      }
      await userEvent.click(body.getByRole('button', { name: 'Download CSV' }));
      await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    }
  },
};
export const CsvNarrowedHandoff: Story = {
  args: { initial: { ...estimateReadResponse(initialEstimateQuery), exportAccess: { scope: 'assigned_job', handoff: false } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await switchView(canvasElement, 'current');
    await selectMetricEvidence(canvasElement, currentCopy.handoff);
    await ready(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(body.getByText(/selection is unavailable under current export access/)).toBeVisible());
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
async function chooseFacet(element: HTMLElement, facet: string, label: string) {
  const canvas = within(element), body = within(element.ownerDocument.body);
  await userEvent.click(canvas.getByRole('combobox', { name: facet }));
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
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.rate })).toHaveTextContent('50%');
    await userEvent.click(canvas.getByRole('button', { name: 'View record: E2 / effective revision 2' }));
    expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000020002');
    await selectMetricEvidence(canvasElement, decisionsCopy.declined);
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ view: 'estimate-decisions', selected: 'declined', page: 1 });
    await expect(canvas.getByRole('button', { name: 'View record: E3 / effective revision 1' })).toBeVisible();
    await selectMetricEvidence(canvasElement, decisionsCopy.rate);
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ selected: 'decided' });
    await switchView(canvasElement, 'first-quoted');
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('4');
    expect(requests.at(-1)).toMatchObject({ view: 'estimate-first-quoted', page: 1 });
    expect(requests.at(-1)).not.toHaveProperty('selected');
    await switchView(canvasElement, 'current');
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('4');
    await expect(canvas.getByRole('button', { name: 'View record: TODAY / issued revision 1' })).toBeVisible();
    for (const [label, selected, record] of [
      [currentCopy.expired, 'expired', 'YESTERDAY'], [currentCopy.handoff, 'handoff', 'HANDOFF'],
    ]) {
      await selectMetricEvidence(canvasElement, label);
      await ready(canvasElement);
      expect(requests.at(-1)).toMatchObject({ view: 'estimate-current', selected, page: 1 });
      expect(requests.at(-1)).not.toHaveProperty('period');
      await expect(canvas.getByRole('button', { name: `View record: ${record} / issued revision 1` })).toBeVisible();
    }
    await expect(canvas.getByRole('button', { name: 'Export Report Data' })).toBeDisabled();
    expect(canvas.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await switchView(canvasElement, 'decisions');
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-31' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ period: { from: '2026-08-01', to: '2026-08-31' }, selected: 'accepted', page: 1 });
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.accepted })).toHaveTextContent('0');
  },
};
export const IndependentDrafts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await chooseFacet(canvasElement, 'Current owner', 'Blair');
    await chooseFacet(canvasElement, 'Parent type', 'Lead');
    await switchView(canvasElement, 'first-quoted');
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('2');
    await switchView(canvasElement, 'current');
    expect(canvas.queryByRole('button', { name: 'Remove filter: Current owner: Blair' })).not.toBeInTheDocument();
    await chooseFacet(canvasElement, 'Current owner', 'Alex');
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('2');
    await switchView(canvasElement, 'decisions');
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current owner: Blair' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove filter: Parent type: Lead' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.rate })).toHaveTextContent('100%');
    await switchView(canvasElement, 'current');
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current owner: Alex' })).toBeVisible();
    expect(requests.at(-1)?.filters).toEqual({ owners: ['member:a'], parents: [] });
  },
};
export const AssignedCurrentInitial: Story = {
  args: { initial: estimateReadResponse(estimateReportQuerySchema.parse({ workspaceId: initialEstimateQuery.workspaceId,
    view: 'estimate-current', selected: 'awaiting' }), { ...estimateReadAuthority, scope: 'assigned_job', handoff: false }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.handoff })).toHaveTextContent('Unavailable');
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await switchView(canvasElement, 'decisions');
    expect(requests.at(-1)).toMatchObject({ period: { from: '2026-10-07', to: '2026-11-05' }, selected: 'accepted' });
    await selectMetricEvidence(canvasElement, decisionsCopy.declined);
    await ready(canvasElement);
    await expect(canvas.getByRole('button', { name: 'View record: E3 / effective revision 1' })).toBeVisible();
    expect(requests.at(-1)?.filters).toEqual({ owners: [], parents: [] });
  },
};
export const AccessRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/estimates?')
      ? Response.json({ error: 'This report is unavailable.' }, { status: 404 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'first-quoted');
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryByRole('combobox', { name: 'Report view' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    expect(args.onReload).toHaveBeenCalledOnce();
  },
};
export const InvalidAuthorityAndRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch; let attempt = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/estimates?')) return original(input, init);
      const result = estimateReadResponse(parseQuery(input)); attempt++;
      return Response.json(attempt === 1 ? { ...result, policyRevision: 2 }
        : attempt === 2 ? { ...result, options: { ...result.options, owners: [] } } : result);
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await switchView(canvasElement, 'current');
    await expect(canvas.getByText('Estimates report results no longer match this request or current authority. Reload the report.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current owner' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await ready(canvasElement);
    await expect(canvas.getByText('Estimates report data does not match the current request, authority or evidence. Reload the report.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await ready(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('4');
  },
};
export const FrozenValueUnavailable: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/estimates?')) return original(input, init);
      const result = estimateReadResponse(parseQuery(input));
      if (result.report.view !== 'estimate-decisions') throw new Error('Expected Decisions in frozen-value story.');
      const unavailable = { kind: 'unavailable', explanation: 'The issued frozen snapshot could not be verified.' };
      return Response.json({ ...result, report: { ...result.report, money: unavailable,
        rows: result.report.rows.map(row => ({ ...row, money: unavailable })) } });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectMetricEvidence(canvasElement, decisionsCopy.rate);
    await ready(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.value })).toHaveTextContent('Unavailable');
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.accepted })).toHaveTextContent('1');
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(2);
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
export const ErrorRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch; let failed = false;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/estimates?')) return original(input, init);
      if (!failed) { failed = true; return Response.json({ error: 'Estimates report could not be loaded. Try again.' }, { status: 500 }); }
      return Response.json(estimateReadResponse(parseQuery(input)));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await switchView(canvasElement, 'current');
    await expect(canvas.getByText('Estimates report could not be loaded. Try again.')).toBeVisible();
    expect(canvas.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await ready(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('4');
  },
};
export const Pagination: Story = {
  args: { initial: estimateReadResponse(initialEstimateQuery, estimateReadAuthority, true) },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/estimates?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json(estimateReadResponse(query, estimateReadAuthority, true));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.accepted })).toHaveTextContent('26');
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000020002');
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }));
    await ready(canvasElement);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(1);
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000020252');
    await userEvent.click(canvas.getByRole('button', { name: 'Go to previous page' }));
    await ready(canvasElement);
    expect(requests.at(-1)?.page).toBe(1);
    await switchView(canvasElement, 'current');
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('104');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /Rows per page/ }), '100');
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ page: 1, pageSize: 100 });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(100);
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }));
    await ready(canvasElement);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(4);
    await selectMetricEvidence(canvasElement, currentCopy.expired);
    await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ selected: 'expired', page: 1 });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(26);
    await switchView(canvasElement, 'first-quoted');
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('104');
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(100);
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => {
      const replacement = estimateReadResponse(estimateReportQuerySchema.parse({
        ...initialEstimateQuery, workspaceId: '00000000-0000-4000-8000-000000000002' }));
      setInitial(estimateReportReadResultSchema.parse({ ...replacement, report: { ...replacement.report,
        rows: replacement.report.rows.map(row => ({ ...row, label: `Replacement ${row.label}` })) } }));
    }}>Switch authorized workspace</button><EstimateReportPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/estimates?')) return original(input, init);
      const query = parseQuery(input);
      init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      await new Promise<void>(resolve => { release = resolve; });
      const response = Response.json(estimateReadResponse(query)), json = response.json.bind(response);
      response.json = async () => { const raw: unknown = await json(); settled = true; return raw; };
      return response;
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'first-quoted');
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current owner' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Apply period' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('button', { name: 'View record: Replacement E2 / effective revision 2' })).toBeVisible();
    expect(aborted).toBe(true);
    release?.();
    await waitFor(() => expect(settled).toBe(true));
    await expect(canvas.getByRole('combobox', { name: 'Report view' })).toHaveValue('decisions');
    expect(canvas.queryByRole('button', { name: 'View record: E2 / effective revision 2' })).not.toBeInTheDocument();
  },
};
