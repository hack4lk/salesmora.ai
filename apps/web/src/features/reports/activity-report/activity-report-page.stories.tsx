import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { activityReportQuerySchema, activityReportReadResultSchema, activityReportExportInputSchema,
  activityReportExportColumns, type ActivityReportQuery } from '@salesmora/contracts';
import { ActivityReportPage } from './activity-report-page';
import { initialActivityQuery, activityReadResponse, largeActivityReadResponse } from './activity-read.fixtures';
import { activityBackendDomains } from './activity-report.adapter.fixtures';

let requests: ActivityReportQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
function parseQuery(input: RequestInfo | URL) {
  return activityReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
}
const meta = {
  title: 'Reports/ActivityReportPage', component: ActivityReportPage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Live canonical Activity host with mocked native API responses. Safe five-domain history, domain-qualified parent navigation, personal templates, native date/facet semantics and independently authorized CSV. Assistant and production activation remain deferred.' } } },
  args: { initial: activityReadResponse(), onRecord: fn(), onReload: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      if (String(input).startsWith('/api/reports/activity/export')) {
        const request = activityReportExportInputSchema.parse(JSON.parse(String(init?.body)));
        const includedDomains = args.initial.report.includedDomains.flatMap(item => {
          const scope = args.initial.exportScopes.find(value => value.domain === item.domain);
          return scope ? [{ ...item, scope: scope.scope }] : [];
        });
        const omittedDomains = activityBackendDomains.filter(item => !includedDomains.some(value => value.domain === item.domain))
          .map(item => ({ domain: item.domain, reason: 'permissions' }));
        const columns = activityReportExportColumns(request), count = request.dataset === 'summary' ? 1 : 2;
        const metadata = { workspaceId: args.initial.workspaceId, policyRevision: args.initial.policyRevision,
          asOf: args.initial.report.asOf, today: args.initial.report.today, timezone: args.initial.report.timezone,
          includedDomains, omittedDomains, count, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
        if (String(input).endsWith('/preview')) return Response.json({ ...metadata, input: request,
          viewerId: args.initial.viewerId, columns, coverage: 'Authorized fictional Activity history.' });
        const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
        const body = '\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: count }, () => columns.map(() => '"fixture"').join(',') + '\r\n').join('');
        return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!String(input).startsWith('/api/reports/activity?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      const result = activityReadResponse(query, { includedDomains: args.initial.report.includedDomains });
      return Response.json({ ...result, authority: args.initial.authority, exportScopes: args.initial.exportScopes });
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof ActivityReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CsvCoverage: Story = {
  args: { initial: { ...activityReadResponse(), exportScopes: [{ domain: 'lead', scope: 'workspace' }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(body.getByText(/Omitted domains: customer, job, estimate, work-order/)).toBeVisible());
    for (const dataset of ['summary', 'evidence']) {
      await userEvent.selectOptions(body.getByRole('combobox', { name: 'CSV dataset' }), dataset);
      await waitFor(() => expect(body.getByText(`salesmora-activity-${dataset}-2026-11-06.csv`)).toBeInTheDocument());
      await waitFor(() => expect(body.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    }
    await userEvent.click(body.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};
export const CsvDeniedDomain: Story = {
  args: { initial: { ...activityReadResponse(), exportScopes: [{ domain: 'lead', scope: 'workspace' }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await chooseFacet(canvasElement, 'Record type', 'Job');
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(body.getByText(/selection is unavailable under current export access/)).toBeVisible());
    await expect(body.getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  },
};
async function ready(element: HTMLElement) {
  await waitFor(() => expect(within(element).getByRole('button', { name: 'Apply period' })).toBeEnabled());
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
export const NativeHistoryAndFacets: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('6');
    for (const row of args.initial.report.rows) {
      await userEvent.click(canvas.getByRole('button', { name: `View record: ${row.recordLabel}` }));
      expect(args.onRecord).toHaveBeenLastCalledWith({ domain: row.domain, recordId: row.recordId });
    }
    await chooseFacet(canvasElement, 'Record type', 'Lead');
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('2');
    await chooseFacet(canvasElement, 'Actor', 'Ava Morgan');
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('1');
    expect(requests.at(-1)).toMatchObject({ filters: { domains: ['lead'], actors: [args.initial.report.rows.find(row => row.domain === 'lead' && row.action === 'created')!.actor.key] }, page: 1 });
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-10-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-10-31' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' })); await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ period: { from: '2026-10-01', to: '2026-10-31' },
      filters: { domains: [], actions: [], actors: [] }, page: 1 });
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('1');
    await chooseFacet(canvasElement, 'Action type', 'Stage changed');
    expect(requests.at(-1)?.filters.actions).toEqual(['stage-changed']);
    await expect(canvas.getByRole('button', { name: 'Export Report Data' })).toBeDisabled();
  },
};
const assignedInitial = activityReadResponse(initialActivityQuery, {
  includedDomains: activityBackendDomains.filter(item => item.domain === 'lead' || item.domain === 'job')
    .map(item => ({ ...item, scope: 'assigned', archiveVisibility: item.domain === 'lead' ? 'excluded' : item.archiveVisibility })),
});
export const AssignedCoverage: Story = {
  args: { initial: activityReportReadResultSchema.parse({ ...assignedInitial, authority: { scope: 'assigned' } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    expect(requests).toHaveLength(0);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('3');
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('Customer (permissions)');
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('Lead: assigned, archives excluded');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Record type' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(await body.findByRole('option', { name: 'Lead' })).toBeVisible();
    expect(body.queryByRole('option', { name: 'Customer' })).not.toBeInTheDocument();
    expect(body.queryByRole('option', { name: 'Estimate' })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await chooseFacet(canvasElement, 'Record type', 'Job');
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('1');
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(1);
  },
};
export const AuthorityRejectionAndRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch; let attempt = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/activity?')) return original(input, init);
      const result = activityReadResponse(parseQuery(input)); attempt++;
      return Response.json(attempt === 1 ? { ...result, policyRevision: 2 }
        : attempt === 2 ? { ...result, report: { ...result.report, includedDomains: result.report.includedDomains.map(item =>
          item.domain === 'lead' ? { ...item, archiveVisibility: 'excluded' } : item) } } : result);
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await chooseFacet(canvasElement, 'Record type', 'Lead');
    await expect(canvas.getAllByText('Activity report authority has changed. Reload the report.')[0]!).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Actor' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' })); await ready(canvasElement);
    await expect(canvas.getAllByText('Activity report authority has changed. Reload the report.')[0]!).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' })); await ready(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('2');
  },
};
export const ErrorThenRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch; let attempt = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/activity?')) return original(input, init);
      attempt++;
      return attempt === 1 ? Response.json({ error: 'Activity report could not be loaded. Try again.' }, { status: 500 })
        : attempt === 2 ? Response.json(activityReadResponse(parseQuery(input)))
          : Response.json({ error: 'This report is unavailable.' }, { status: 404 });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await chooseFacet(canvasElement, 'Record type', 'Lead');
    await expect(canvas.getAllByText('Activity report could not be loaded. Try again.')[0]!).toBeVisible();
    expect(canvas.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' })); await ready(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('2');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    expect(args.onReload).toHaveBeenCalledOnce();
  },
};
export const PaginationAndEmptyPeriod: Story = {
  args: { initial: largeActivityReadResponse(initialActivityQuery) },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/activity?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json(largeActivityReadResponse(query));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('156');
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    const first = canvas.getAllByRole('button', { name: /^View record:/ })[0]!.getAttribute('aria-label');
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' })); await ready(canvasElement);
    expect(requests.at(-1)?.page).toBe(2);
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })[0]!.getAttribute('aria-label')).not.toBe(first);
    expect(args.onRecord).toHaveBeenCalledTimes(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Go to previous page' })); await ready(canvasElement);
    expect(requests.at(-1)?.page).toBe(1);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /Rows per page/ }), '100'); await ready(canvasElement);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(100);
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' })); await ready(canvasElement);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(56);
    await chooseFacet(canvasElement, 'Record type', 'Lead');
    expect(requests.at(-1)).toMatchObject({ page: 1, pageSize: 100 });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(52);
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-31' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' })); await ready(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('0');
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(requests.at(-1)?.filters).toEqual({ domains: [], actions: [], actors: [] });
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => {
      const replacement = activityReadResponse(activityReportQuerySchema.parse({
        ...initialActivityQuery, workspaceId: '00000000-0000-4000-8000-000000000002' }));
      setInitial(activityReportReadResultSchema.parse({ ...replacement, report: { ...replacement.report,
        rows: replacement.report.rows.map(row => ({ ...row, recordLabel: `Replacement ${row.recordLabel}` })) } }));
    }}>Switch authorized workspace</button><ActivityReportPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/activity?')) return original(input, init);
      const query = parseQuery(input); init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      await new Promise<void>(resolve => { release = resolve; });
      const response = Response.json(activityReadResponse(query)), json = response.json.bind(response);
      response.json = async () => { const raw: unknown = await json(); settled = true; return raw; };
      return response;
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Record type' }));
    await userEvent.keyboard('{ArrowDown}'); await userEvent.click(await body.findByRole('option', { name: 'Lead' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Actor' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Apply period' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('button', { name: 'View record: Replacement Lead L-101 / Morgan Ellis' })).toBeVisible();
    expect(aborted).toBe(true); release?.();
    await waitFor(() => expect(settled).toBe(true));
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('6');
    expect(canvas.queryByRole('button', { name: 'View record: Lead L-101 / Morgan Ellis' })).not.toBeInTheDocument();
  },
};
